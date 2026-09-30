"use client";

import { Check, Circle } from "lucide-react";
import { GraficoCascada } from "./grafico-cascada";
import { GraficoContribucion } from "./grafico-contribucion";
import { almacenRentabilidad } from "./almacen";
import { formatoMonto } from "@/lib/presupuesto/calculo";
import { calcularProductos, calcularResultado, semaforo } from "@/lib/rentabilidad/calculo";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): el cálculo oficial, siempre visible y al instante. */
export function ResumenVivo() {
  const d = almacenRentabilidad.useDatos();
  const productos = calcularProductos(d);
  const r = calcularResultado(d);
  const estados = semaforo(d);

  return (
    <section aria-labelledby="titulo-resumen-rentabilidad" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-rentabilidad" className="text-lg font-semibold leading-tight">
        Tu cálculo <span className="font-normal text-muted-foreground">(se arma solo)</span>
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">Estos números los calcula esta página, nunca la IA.</p>

      <div aria-live="polite" className="mt-4">
        {r ? (
          <div className="aparecer space-y-4" data-resumen>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Ingresos totales</p>
                <p className="mt-0.5 font-semibold tabular">S/ {formatoMonto(r.ingresosTotal)}</p>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Utilidad operativa</p>
                <p className={`mt-0.5 font-semibold tabular ${r.utilidadOperativa < 0 ? "text-destructive" : ""}`}>
                  S/ {formatoMonto(r.utilidadOperativa)} <span className="font-normal text-muted-foreground">({r.margenOperativoPct} %)</span>
                </p>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Margen de contribución</p>
                <p className="mt-0.5 font-semibold tabular">{r.margenContribucionPct} %</p>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Punto de equilibrio</p>
                <p className="mt-0.5 font-semibold tabular">{r.puntoEquilibrioMonto !== null ? `S/ ${formatoMonto(r.puntoEquilibrioMonto)}` : "—"}</p>
              </div>
            </div>

            {productos.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Contribución por producto</p>
                <GraficoContribucion productos={productos} />
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold">De tus ingresos a tu utilidad</p>
              <GraficoCascada r={r} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Agrega al menos un producto con nombre, precio, costo y unidades, y verás aquí tu cálculo.</p>
        )}
      </div>

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Antes de confiar en el resultado</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {estados.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              {s.completa ? <Check aria-hidden className="size-4 text-ok" /> : <Circle aria-hidden className="size-4 text-muted-foreground" />}
              <span className={s.completa ? "" : "text-muted-foreground"}>
                {s.etiqueta}
                <span className="sr-only">{s.completa ? " (listo)" : " (falta)"}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
