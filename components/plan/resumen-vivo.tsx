"use client";

import { Check, Circle } from "lucide-react";
import { almacenPlan } from "./almacen";
import { formatoDuracion, horasDe, minutosDisponibles } from "@/lib/plan/calculo";
import { vacantesLlenas } from "@/lib/plan/prompt";
import { MAX_VACANTES } from "@/lib/plan/tipos";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): tu tiempo disponible, calculado en el navegador mientras escribes. */
export function ResumenVivo() {
  const d = almacenPlan.useDatos();
  const min = minutosDisponibles(d);
  const horas = horasDe(d);
  const vacantes = vacantesLlenas(d).length;
  const pasos: [boolean, string][] = [
    [d.puesto.trim().length > 0, "Puesto objetivo"],
    [d.ubicacion.trim().length > 0, "Ciudad y país"],
    [horas !== null, "Horas por semana"],
    [d.competencias.trim().length >= 20, "Competencias clave"],
  ];

  return (
    <section aria-labelledby="titulo-resumen-plan" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-plan" className="text-lg font-semibold leading-tight">
        Tu tiempo disponible <span className="font-normal text-muted-foreground">(se calcula solo)</span>
      </h2>

      <div aria-live="polite" className="mt-4">
        {min !== null && horas !== null ? (
          <div className="aparecer space-y-3" data-resumen>
            <div className="rounded-lg border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Cada semana</p>
              <p className="mt-0.5 text-3xl font-bold tabular" data-minutos>
                {min} minutos
              </p>
              <p className="mt-1 text-sm text-muted-foreground tabular">
                Fórmula: {horas} h × 60 = {min} min ({formatoDuracion(min)})
              </p>
            </div>
            <p className="text-sm text-muted-foreground tabular">
              En las 4 semanas del plan: {min * 4} minutos como máximo. El plan que te devuelva la IA no debe pasarse de {min} minutos en ninguna semana; la página lo comprueba en el paso 3.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escribe las horas por semana que puedes dedicar (entre 1 y 60) y verás aquí cuántos minutos tiene tu plan.</p>
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
          <li className="flex items-center gap-2 text-muted-foreground">
            <Circle aria-hidden className="size-4" />
            Vacantes para priorizar: {vacantes} de {MAX_VACANTES} (opcional)
          </li>
        </ul>
      </div>
    </section>
  );
}
