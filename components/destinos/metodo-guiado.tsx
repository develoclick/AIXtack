"use client";

import { ClipboardList, ExternalLink } from "lucide-react";

const PASOS = [
  { titulo: "Abre un buscador de vuelos", texto: "Cualquiera con una función de «explorar destinos» o «a cualquier lugar» (la mayoría de los grandes buscadores la tienen)." },
  { titulo: "Escribe tu origen y deja el destino en «cualquier lugar»", texto: "Verás un mapa o una lista con el precio más barato del mes hacia distintos destinos." },
  { titulo: "Filtra por tus fechas o por tu rango de noches", texto: "La mayoría de estos buscadores permiten fijar un período o una duración aproximada." },
  { titulo: "Anota el pasaje de ida y vuelta de los destinos que te interesan", texto: "Hasta 8, para no hacer la comparación interminable." },
  { titulo: "Busca el alojamiento de cada uno por separado", texto: "En una plataforma de alojamiento, con tus fechas y el tipo de alojamiento que definiste en el paso 1: anota el precio por noche." },
  { titulo: "Pasa los datos a la tabla del paso 3", texto: "Escríbelos directamente en el formulario, o pégalos como texto si copiaste varios a la vez." },
];

/** Guía genérica (sin marcas ni logos) para descubrir destinos con la función de «explorar» de un buscador de vuelos. */
export function MetodoGuiado() {
  return (
    <section aria-labelledby="titulo-metodo-guiado" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-metodo-guiado" className="text-lg font-semibold leading-tight">
        2. Método A: guiado <span className="font-normal text-muted-foreground">(recomendado si prefieres explorar tú mismo)</span>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Muchos buscadores de vuelos tienen una función para ver el precio más barato hacia «cualquier destino» desde tu ciudad, sin tener que decidir a dónde ir primero. Este método usa esa función.</p>

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

      <p className="mt-4 flex items-start gap-2 rounded-lg border bg-brand-muted p-3 text-sm">
        <ClipboardList aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>No hace falta que consultes 8 destinos: con 3 o 4 que te llamen la atención ya puedes comparar si entran en tu presupuesto.</span>
      </p>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ExternalLink aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        No recomendamos un buscador en particular: las funciones descritas aquí cambian de nombre y de lugar con el tiempo, así que revisa el menú de tu buscador si no las encuentras con estos nombres.
      </p>
    </section>
  );
}
