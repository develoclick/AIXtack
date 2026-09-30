"use client";

import { AlertTriangle, Check, Circle } from "lucide-react";
import { almacenFechas } from "./almacen";
import { resumenCombinaciones, viajerosDeFechas } from "@/lib/fechas/calculo";
import { MAX_COMBINACIONES } from "@/lib/fechas/tipos";

const horaValidaAdultos = (v: ReturnType<typeof viajerosDeFechas>) => v.adultos !== null;

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): cuántas combinaciones de fecha genera tu búsqueda. */
export function ResumenVivo() {
  const d = almacenFechas.useDatos();
  const resumen = resumenCombinaciones(d);
  const v = viajerosDeFechas(d);
  const pasos: [boolean, string][] = [
    [d.origen.trim().length > 0, "Origen"],
    [d.destino.trim().length > 0, "Destino"],
    [resumen !== null, "Período (con al menos una duración)"],
    [horaValidaAdultos(v), "Número de adultos"],
  ];

  return (
    <section aria-labelledby="titulo-resumen-fechas" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-fechas" className="text-lg font-semibold leading-tight">
        Tus combinaciones <span className="font-normal text-muted-foreground">(se calculan solas)</span>
      </h2>

      <div aria-live="polite" className="mt-4">
        {resumen !== null ? (
          <div className="aparecer space-y-3" data-resumen>
            <div className="rounded-lg border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Combinaciones posibles</p>
              <p className="mt-0.5 text-3xl font-bold tabular" data-total-combinaciones>
                {resumen.total}
              </p>
              <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground tabular">
                {resumen.porDuracion.map((p) => (
                  <li key={p.duracion}>
                    {p.duracion} {p.duracion === 1 ? "noche" : "noches"}: {p.cantidad} combinación(es)
                  </li>
                ))}
              </ul>
            </div>
            {resumen.truncado && (
              <div className="flex gap-2 rounded-lg border border-warn/50 bg-warn-muted p-3 text-xs leading-relaxed">
                <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
                <span>
                  Son más de {MAX_COMBINACIONES}: la página solo genera las primeras {MAX_COMBINACIONES} para el prompt y la tabla. Reduce el período o las duraciones si quieres verlas todas.
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escribe el período (fecha inicial y final) y al menos una duración en noches, y verás aquí cuántas combinaciones de ida y vuelta hay.</p>
        )}
      </div>

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Lo esencial</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {pasos.map(([ok, texto]) => (
            <li key={texto} className="flex items-center gap-2">
              {ok ? <Check aria-hidden className="size-4 text-ok" /> : <Circle aria-hidden className="size-4 text-muted-foreground" />}
              <span className={ok ? "" : "text-muted-foreground"}>
                {texto}
                <span className="sr-only">{ok ? " (listo)" : " (falta)"}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
