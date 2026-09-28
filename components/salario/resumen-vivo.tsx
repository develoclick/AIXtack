"use client";

import { ArrowDown, AlertTriangle } from "lucide-react";
import { almacenSalario } from "./almacen";
import { formatoDinero } from "@/lib/presupuesto/calculo";
import { calcularOferta, CIFRAS, compararOfertas, contextoDe, evaluarCifras } from "@/lib/salario/calculo";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): el valor anual de la oferta, calculado en el navegador mientras escribes. */
export function ResumenVivo() {
  const d = almacenSalario.useDatos();
  const moneda = d.moneda.trim() || "S/";
  const ctx = contextoDe(d);
  const a = calcularOferta(d.ofertaA, ctx);
  const b = d.comparar ? calcularOferta(d.ofertaB, ctx) : null;
  const ev = evaluarCifras(d, a);
  const filas = b ? compararOfertas(a, b) : [];
  const despues = filas.find((f) => f.clave === "despues-conservador");
  const problemasVisibles = a.fijoAnual !== null ? a.problemas.filter((p) => !p.includes("salario fijo") && !p.includes("pagos al año")) : [];

  return (
    <section aria-labelledby="titulo-resumen-sal" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-sal" className="text-lg font-semibold leading-tight">
        Valor anual de la oferta <span className="font-normal text-muted-foreground">(se calcula solo)</span>
      </h2>

      <div aria-live="polite" className="mt-4">
        {a.conservador && a.completo ? (
          <div className="aparecer" data-resumen>
            <p className="text-sm text-muted-foreground">Después de costos de trabajar</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Conservador</p>
                <p className="mt-0.5 text-2xl font-bold tabular" data-valor="conservador">
                  {formatoDinero(a.conservador.despuesDeCostos, moneda)}
                </p>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Completo</p>
                <p className="mt-0.5 text-2xl font-bold tabular" data-valor="completo">
                  {formatoDinero(a.completo.despuesDeCostos, moneda)}
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm">
              {[
                ["Fijo anual", a.fijoAnual ?? 0],
                ["Variable (conservador → máximo)", null],
                ["Beneficios que valorizas", a.beneficios],
                ["Costo de trabajar presencial", a.costo ?? 0],
              ].map(([et, v]) => (
                <div key={et as string} className="flex items-baseline justify-between gap-3 border-b pb-1.5 last:border-0">
                  <dt className="text-muted-foreground">{et as string}</dt>
                  <dd className="text-right font-medium tabular">{v === null ? `${formatoDinero(a.variableConservador, moneda)} → ${formatoDinero(a.variableMaximo, moneda)}` : formatoDinero(v as number, moneda)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Valores brutos: no descuentan impuestos ni aportes, que dependen de tu país y de tu régimen.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-5 text-center">
            <p className="text-sm font-medium">Aquí verás el valor anual</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">Escribe el salario fijo mensual bruto y los pagos al año de la oferta, o usa «Llenar con datos de ejemplo».</p>
          </div>
        )}
      </div>

      {problemasVisibles.length > 0 && (
        <div role="status" className="mt-4 flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
          <ul className="space-y-1">
            {problemasVisibles.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {b && despues && (
        <p className="mt-4 rounded-lg border bg-surface p-3 text-sm" data-mini-comparacion>
          <strong className="font-semibold">A frente a B (después de costos, conservador):</strong> A {formatoDinero(despues.a, moneda)} · B {formatoDinero(despues.b, moneda)} · diferencia B − A: {despues.diferencia >= 0 ? "+" : "−"}
          {formatoDinero(Math.abs(despues.diferencia), moneda)}.
        </p>
      )}

      {ev.vsOferta.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold">Tus cifras frente al fijo de la oferta</p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {ev.vsOferta.map((v) => (
              <li key={v.clave} className="flex justify-between gap-3">
                <span>{CIFRAS.find((c) => c.clave === v.clave)!.etiqueta}</span>
                <span className="tabular">
                  {formatoDinero(v.valor, moneda)} ({v.porcentaje >= 0 ? "+" : "−"}
                  {Math.abs(v.porcentaje)} %)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <a href="#paso-2" className="btn btn-secundario mt-5 w-full">
        Ver fórmulas, comparador y prompt <ArrowDown aria-hidden className="size-4" />
      </a>
    </section>
  );
}
