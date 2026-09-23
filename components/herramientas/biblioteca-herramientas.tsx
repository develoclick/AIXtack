"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ItemBiblioteca {
  clave: string;
  area: string;
  tipo: string;
  tarjeta: ReactNode;
}

const TIPOS: { id: string; etiqueta: string }[] = [
  { id: "generador", etiqueta: "Generadores" },
  { id: "calculadora", etiqueta: "Calculadoras" },
  { id: "analizador", etiqueta: "Analizadores" },
  { id: "kit", etiqueta: "Kits" },
];

function Filtro({ etiqueta, activo, onClick }: { etiqueta: string; activo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn("guide-focus min-h-11 rounded-full border px-4 text-sm font-semibold", activo ? "border-guide-ink bg-guide-ink text-background" : "border-foreground/50 bg-background text-foreground hover:bg-guide-surface")}
    >
      {etiqueta}
    </button>
  );
}

/**
 * Biblioteca con filtro por área y por tipo. Las tarjetas llegan ya dibujadas desde el servidor, así que el HTML
 * inicial lleva todas; el filtro solo oculta las que no coinciden.
 */
export function BibliotecaHerramientas({ items, areas }: { items: ItemBiblioteca[]; areas: { id: string; nombre: string }[] }) {
  const [area, setArea] = useState("");
  const [tipo, setTipo] = useState("");
  const visibles = items.filter((i) => (!area || i.area === area) && (!tipo || i.tipo === tipo));
  const tiposPresentes = TIPOS.filter((t) => items.some((i) => i.tipo === t.id));
  const areasPresentes = areas.filter((a) => items.some((i) => i.area === a.id));

  return (
    <div>
      <div className="flex flex-col gap-4" role="group" aria-label="Filtros">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por área">
          <Filtro etiqueta="Todas las áreas" activo={area === ""} onClick={() => setArea("")} />
          {areasPresentes.map((a) => (
            <Filtro key={a.id} etiqueta={a.nombre} activo={area === a.id} onClick={() => setArea(a.id)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
          <Filtro etiqueta="Todos los tipos" activo={tipo === ""} onClick={() => setTipo("")} />
          {tiposPresentes.map((t) => (
            <Filtro key={t.id} etiqueta={t.etiqueta} activo={tipo === t.id} onClick={() => setTipo(t.id)} />
          ))}
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-sm text-muted-foreground">
        {visibles.length === 1 ? "1 herramienta" : `${visibles.length} herramientas`}
      </p>

      {visibles.length > 0 ? (
        <ul className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibles.map((i) => (
            <li key={i.clave}>{i.tarjeta}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-muted-foreground">Ninguna herramienta coincide con ese filtro. Quita alguno para ver más.</p>
      )}
    </div>
  );
}
