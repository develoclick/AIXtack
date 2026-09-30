"use client";

import { ClipboardList, ExternalLink } from "lucide-react";
import { almacenFechas } from "./almacen";
import { resumenCombinaciones } from "@/lib/fechas/calculo";

const PASOS = [
  { titulo: "Abre un buscador de vuelos", texto: "Cualquiera con una vista de calendario o cuadrícula de precios (la mayoría de los grandes buscadores y aerolíneas la tienen)." },
  { titulo: "Escribe tu origen y tu destino", texto: "Los mismos que pusiste en el paso 1." },
  { titulo: "Activa la vista de calendario o de precios flexibles", texto: "Suele llamarse «ver precios del mes», «calendario de precios» o «fechas flexibles», según el buscador." },
  { titulo: "Anota el precio de ida para cada fecha de tu período", texto: "El calendario te muestra un precio por día de salida; anótalo para los días que te interesan." },
  { titulo: "Repite para la fecha de vuelta de cada combinación", texto: "Según tus duraciones, suma las noches a la fecha de ida para saber qué fecha de vuelta buscar." },
  { titulo: "Pasa los precios a la tabla del paso 3", texto: "Escríbelos directamente en el formulario, o pégalos como texto si copiaste varios a la vez." },
];

/** Guía genérica (sin marcas ni logos) para obtener precios con la vista de calendario de un buscador de vuelos. */
export function MetodoGuiado() {
  const d = almacenFechas.useDatos();
  const resumen = resumenCombinaciones(d);

  return (
    <section aria-labelledby="titulo-metodo-guiado" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-metodo-guiado" className="text-lg font-semibold leading-tight">
        2. Método A: guiado <span className="font-normal text-muted-foreground">(recomendado si prefieres ver los precios tú mismo)</span>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">La mayoría de los buscadores de vuelos tienen una vista de calendario o de «precios flexibles»: te muestra el precio de cada día sin tener que buscar uno por uno. Este método usa esa función.</p>

      <ol className="mt-4 space-y-3">
        {PASOS.map((p, i) => (
          <li key={p.titulo} className="flex gap-3 rounded-lg border bg-surface p-3 text-sm">
            <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-bold text-brand tabular">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold">{p.titulo}</p>
              <p className="mt-0.5 text-muted-foreground">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      {resumen && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border bg-brand-muted p-3 text-sm">
          <ClipboardList aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
          <span>
            Tienes {resumen.total} combinaciones posibles. No hace falta consultarlas todas: empieza por unas cuantas fechas repartidas en tu período (por ejemplo, una por semana) y compáralas en el paso 3.
          </span>
        </p>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ExternalLink aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        No recomendamos un buscador en particular: las funciones descritas aquí cambian de nombre y de lugar con el tiempo, así que revisa el menú de tu buscador si no las encuentras con estos nombres.
      </p>
    </section>
  );
}
