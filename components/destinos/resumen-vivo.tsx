"use client";

import { Check, Circle } from "lucide-react";
import { almacenDestinos } from "./almacen";
import { formulaReparto, nochesSimuladas, rangoNoches, repartoPresupuesto } from "@/lib/destinos/calculo";
import { progresoDestinos } from "@/lib/destinos/prompt";
import { formatoMonto } from "@/lib/presupuesto/calculo";

const COLORES = { gastos: "var(--color-warn)", imprevistos: "var(--color-muted-foreground)", maximo: "var(--color-ok)" } as const;

/** Donut del reparto del presupuesto, sin librerías: un conic-gradient con 3 tramos. */
function Donut({ gastosPct, imprevistosPct, maximoPct }: { gastosPct: number; imprevistosPct: number; maximoPct: number }) {
  const c1 = gastosPct;
  const c2 = c1 + imprevistosPct;
  const gradiente = `conic-gradient(${COLORES.gastos} 0% ${c1}%, ${COLORES.imprevistos} ${c1}% ${c2}%, ${COLORES.maximo} ${c2}% 100%)`;
  return (
    <div aria-hidden className="relative size-28 shrink-0 rounded-full" style={{ background: maximoPct + imprevistosPct + gastosPct > 0 ? gradiente : "var(--surface)" }}>
      <div className="absolute inset-[14%] rounded-full bg-background" />
    </div>
  );
}

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): el reparto del presupuesto, calculado al instante. */
export function ResumenVivo() {
  const d = almacenDestinos.useDatos();
  const progreso = progresoDestinos(d);
  const rango = rangoNoches(d);
  const noches = nochesSimuladas(d);
  const reparto = noches !== null ? repartoPresupuesto(d, noches) : null;

  return (
    <section aria-labelledby="titulo-resumen-destinos" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-destinos" className="text-lg font-semibold leading-tight">
        Tu reparto <span className="font-normal text-muted-foreground">(se calcula solo)</span>
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
        {reparto && noches !== null ? (
          <div className="aparecer space-y-4" data-resumen>
            <div className="flex items-center gap-4">
              <Donut gastosPct={(reparto.reservaGastos / reparto.presupuesto) * 100} imprevistosPct={(reparto.imprevistos / reparto.presupuesto) * 100} maximoPct={Math.max(0, (reparto.maximoPasajesYAlojamiento / reparto.presupuesto) * 100)} />
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: COLORES.gastos }} />
                  Gastos en destino: {d.moneda} {formatoMonto(reparto.reservaGastos)}
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: COLORES.imprevistos }} />
                  Imprevistos: {d.moneda} {formatoMonto(reparto.imprevistos)}
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: COLORES.maximo }} />
                  Para pasajes y alojamiento: {d.moneda} {formatoMonto(reparto.maximoPasajesYAlojamiento)}
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-surface p-3">
              <p className="text-xs text-muted-foreground">
                Fórmula (con {noches} {noches === 1 ? "noche" : "noches"}):
              </p>
              <p className="mt-1 font-mono text-xs tabular" data-formula-reparto>
                {formulaReparto(d, noches, reparto)}
              </p>
            </div>
            {reparto.maximoPasajesYAlojamiento <= 0 && (
              <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                Con estos datos no queda nada para pasajes ni alojamiento. Prueba menos noches, un gasto diario menor o un presupuesto mayor.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escribe el presupuesto, el gasto diario y un rango de noches válido, y verás aquí cómo se reparte.</p>
        )}
      </div>

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Lo esencial</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {([
            [Boolean(d.presupuesto.trim()), "Presupuesto total"],
            [rango !== null, "Rango de noches"],
            [Boolean(d.origen.trim()), "Origen"],
          ] as [boolean, string][]).map(([ok, texto]) => (
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
