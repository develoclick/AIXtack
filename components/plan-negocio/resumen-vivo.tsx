"use client";

import { Check, Circle } from "lucide-react";
import { almacenPlanNegocio } from "./almacen";
import { formatoMonto } from "@/lib/presupuesto/calculo";
import { gastosFijosTotal, inversionTotal, margenContribucion, puntoEquilibrio, semaforo } from "@/lib/plan-negocio/calculo";
import { progresoPlanNegocio } from "@/lib/plan-negocio/prompt";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): resumen del negocio y de los cálculos, al instante. */
export function ResumenVivo() {
  const d = almacenPlanNegocio.useDatos();
  const progreso = progresoPlanNegocio(d);
  const hayDatos = Boolean(d.nombreEmpresa.trim() || d.producto.trim());
  const inv = inversionTotal(d);
  const fijos = gastosFijosTotal(d);
  const margen = margenContribucion(d);
  const eq = puntoEquilibrio(d);
  const estados = semaforo(d);

  return (
    <section aria-labelledby="titulo-resumen-plan-negocio" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-plan-negocio" className="text-lg font-semibold leading-tight">
        Tu resumen <span className="font-normal text-muted-foreground">(se arma solo)</span>
      </h2>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Datos completados</span>
          <span className="tabular" data-progreso>
            {progreso.porcentaje}% (recomendado: {progreso.recomendado}%)
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={progreso.porcentaje} aria-valuemin={0} aria-valuemax={100} aria-label="Datos completados">
          <div className="h-full rounded-full bg-brand-solid transition-[width]" style={{ width: `${progreso.porcentaje}%` }} />
        </div>
        {progreso.faltan.length > 0 && (
          <details className="mt-2 text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center text-muted-foreground">Ver qué falta</summary>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted-foreground">
              {progreso.faltan.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div aria-live="polite" className="mt-4">
        {hayDatos ? (
          <div className="aparecer space-y-3" data-resumen>
            <div className="rounded-lg border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Empresa</p>
              <p className="mt-0.5 text-lg font-bold" data-nombre-empresa>
                {d.nombreEmpresa || "(sin nombre todavía)"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{d.producto || "(sin producto o servicio todavía)"}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Inversión inicial</p>
                <p className="mt-0.5 font-semibold tabular">{inv > 0 ? `S/ ${formatoMonto(inv)}` : "—"}</p>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Costos fijos/mes</p>
                <p className="mt-0.5 font-semibold tabular">{fijos > 0 ? `S/ ${formatoMonto(fijos)}` : "—"}</p>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Margen por unidad</p>
                <p className="mt-0.5 font-semibold tabular">{margen !== null ? `S/ ${formatoMonto(margen)}` : "—"}</p>
              </div>
              <div className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">Punto de equilibrio</p>
                <p className="mt-0.5 font-semibold tabular">{eq ? `${eq.unidades} u/mes` : "—"}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escribe el nombre de tu empresa y tu producto o servicio, y verás aquí el resumen.</p>
        )}
      </div>

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Preparación por sección</h3>
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
        <p className="mt-2 text-xs text-muted-foreground">Lo que no completes, la IA lo tratará como un supuesto y lo marcará como tal en tu plan.</p>
      </div>
    </section>
  );
}
