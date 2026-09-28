"use client";

import { AlertTriangle, ArrowDown } from "lucide-react";
import { almacenPresupuesto } from "./almacen";
import { BarraReparto } from "./barra-reparto";
import { calcular, formatoDinero, formatoPorcentaje } from "@/lib/presupuesto/calculo";
import { revisarCoherencia } from "@/lib/presupuesto/olvidados";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): el total y el reparto, calculados en el navegador mientras escribes. */
export function ResumenVivo() {
  const d = almacenPresupuesto.useDatos();
  const c = calcular(d);
  const moneda = d.moneda.trim() || "S/";
  const i = c.escenarios.intermedio;
  const avisosAltos = revisarCoherencia(d, c).filter((a) => a.nivel === "alto");
  const hayTotal = i.subtotal > 0;

  return (
    <section aria-labelledby="titulo-resumen-pre" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-pre" className="text-lg font-semibold leading-tight">
        Tu presupuesto <span className="font-normal text-muted-foreground">(se calcula solo)</span>
      </h2>

      <div aria-live="polite" className="mt-4">
        {hayTotal ? (
          <div className="aparecer">
            <p className="text-sm text-muted-foreground">Total con imprevistos</p>
            <p className="mt-1 text-4xl font-bold tabular" data-total>
              {formatoDinero(i.total, moneda)}
            </p>
            <p className="mt-1 text-sm tabular text-muted-foreground">
              {i.porPersona !== null ? (
                <>
                  <strong className="font-semibold text-foreground">{formatoDinero(i.porPersona, moneda)}</strong> por persona ({c.personas} {c.personas === 1 ? "viajero" : "viajeros"})
                </>
              ) : (
                "Escribe el número de adultos para ver el costo por persona."
              )}
              {c.totalAlterna !== null && (
                <>
                  {" "}
                  · <span>≈ {d.monedaAlterna.trim()} {new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(c.totalAlterna)}</span>
                </>
              )}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-surface p-3">
                <dt className="text-xs text-muted-foreground">Subtotal</dt>
                <dd className="mt-0.5 font-semibold tabular">{formatoDinero(i.subtotal, moneda)}</dd>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <dt className="text-xs text-muted-foreground">Imprevistos ({formatoPorcentaje(c.pctImprevistos)})</dt>
                <dd className="mt-0.5 font-semibold tabular">{formatoDinero(i.imprevistos, moneda)}</dd>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <dt className="text-xs text-muted-foreground">Gastos fijos</dt>
                <dd className="mt-0.5 font-semibold tabular">{formatoDinero(c.fijos, moneda)}</dd>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <dt className="text-xs text-muted-foreground">Gastos variables</dt>
                <dd className="mt-0.5 font-semibold tabular">{formatoDinero(c.variables, moneda)}</dd>
              </div>
            </dl>
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold">
                Respaldado por precios reales: <span className="tabular">{formatoPorcentaje(c.porcentajes.conocido)}</span>
              </p>
              <BarraReparto porcentajes={c.porcentajes} />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-5 text-center">
            <p className="text-sm font-medium">Aquí verás tu total</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">Escribe los montos de tus gastos, o usa «Llenar con datos de ejemplo» para ver cómo se calcula.</p>
          </div>
        )}
      </div>

      {avisosAltos.length > 0 && (
        <div role="status" className="mt-4 flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
          <ul className="space-y-1">
            {avisosAltos.map((a) => (
              <li key={a.id}>{a.texto}</li>
            ))}
          </ul>
        </div>
      )}
      {c.sinMonto > 0 && hayTotal && <p className="mt-3 text-xs text-muted-foreground">{c.sinMonto} {c.sinMonto === 1 ? "gasto sin monto no suma" : "gastos sin monto no suman"} todavía.</p>}

      <a href="#paso-2" className="btn btn-secundario mt-5 w-full">
        Ver escenarios, gastos olvidados y prompt <ArrowDown aria-hidden className="size-4" />
      </a>
    </section>
  );
}
