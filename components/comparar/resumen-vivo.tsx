"use client";

import { Check, Circle, Trophy } from "lucide-react";
import { almacenComparar } from "./almacen";
import { filasResumen, ganadorDePerfil, masBarata, mejorPuntuada, PERFILES_PESO } from "@/lib/comparar/calculo";
import { progresoComparar } from "@/lib/comparar/prompt";
import { formatoMonto } from "@/lib/presupuesto/calculo";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): quién gana con tus datos y pesos actuales. */
export function ResumenVivo() {
  const d = almacenComparar.useDatos();
  const progreso = progresoComparar(d);
  const filas = filasResumen(d);
  const barata = masBarata(filas);
  const mejor = mejorPuntuada(filas);
  const hayDatos = filas.some((f) => f.opcion.nombre.trim());

  return (
    <section aria-labelledby="titulo-resumen-comparar" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-comparar" className="text-lg font-semibold leading-tight">
        Tu comparación <span className="font-normal text-muted-foreground">(se calcula sola)</span>
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
            {mejor && mejor.opcion.nombre.trim() && (
              <div className="rounded-lg border border-brand-solid/40 bg-brand-muted p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <Trophy aria-hidden className="size-3.5" /> Mejor puntuada con tus criterios
                </p>
                <p className="mt-0.5 text-lg font-bold" data-mejor-puntuada>
                  {mejor.opcion.nombre}
                </p>
                <p className="text-sm text-muted-foreground tabular">{mejor.puntuacion}/100 puntos</p>
              </div>
            )}
            {barata && barata.opcion.nombre.trim() && (
              <div className="rounded-lg border bg-surface p-4">
                <p className="text-xs text-muted-foreground">Costo total ajustado más bajo</p>
                <p className="mt-0.5 text-lg font-bold" data-mas-barata>
                  {barata.opcion.nombre}
                </p>
                <p className="text-sm text-muted-foreground tabular">
                  {barata.opcion.moneda} {formatoMonto(barata.costo.total!)}
                </p>
              </div>
            )}
            {mejor && barata && mejor.opcion.id !== barata.opcion.id && <p className="text-xs leading-relaxed text-muted-foreground">La más barata y la mejor puntuada son distintas: tus pesos le dan más valor a otros criterios que al precio.</p>}

            <div className="rounded-lg border bg-surface p-3">
              <p className="text-xs font-semibold">Si cambian tus prioridades, ¿quién gana?</p>
              <ul className="mt-1.5 space-y-1 text-sm">
                {PERFILES_PESO.map((p) => {
                  const g = ganadorDePerfil(d, p.valor);
                  return (
                    <li key={p.valor} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">{p.etiqueta}</span>
                      <span className="font-medium">{g && g.opcion.nombre.trim() ? g.opcion.nombre : "—"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Agrega el nombre y el precio de al menos 2 opciones, y puntúalas en la matriz para ver aquí cuál gana.</p>
        )}
      </div>

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Lo esencial</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {([
            [d.opciones.filter((o) => o.nombre.trim() && o.precio.trim()).length >= 2, "Al menos 2 opciones con nombre y precio"],
            [d.criterios.some((c) => c.peso.trim() && c.peso !== "0"), "Al menos un criterio con peso"],
            [d.viajeros.trim().length > 0, "Número de viajeros"],
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
