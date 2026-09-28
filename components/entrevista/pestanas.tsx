"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

interface Props<T extends string> {
  etiqueta: string;
  /** Prefijo para los ids (debe ser único en la página). */
  prefijo: string;
  pestanas: { id: T; etiqueta: string }[];
  valor: T;
  alCambiar: (id: T) => void;
  children: ReactNode;
}

/** Pestañas accesibles (role=tablist): flechas, Inicio y Fin cambian de pestaña; el panel activo es un tabpanel enfocable. */
export function Pestanas<T extends string>({ etiqueta, prefijo, pestanas, valor, alCambiar, children }: Props<T>) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function teclas(e: KeyboardEvent<HTMLDivElement>) {
    const i = pestanas.findIndex((p) => p.id === valor);
    const paso = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "Home" ? -i : e.key === "End" ? pestanas.length - 1 - i : 0;
    if (!paso) return;
    e.preventDefault();
    const sig = pestanas[(i + paso + pestanas.length) % pestanas.length].id;
    alCambiar(sig);
    refs.current[sig]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label={etiqueta} onKeyDown={teclas} className="-mx-1 flex gap-1 overflow-x-auto border-b px-1 pb-px">
        {pestanas.map((p) => (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[p.id] = el;
            }}
            role="tab"
            id={`${prefijo}-tab-${p.id}`}
            type="button"
            aria-selected={valor === p.id}
            aria-controls={`${prefijo}-panel-${p.id}`}
            tabIndex={valor === p.id ? 0 : -1}
            onClick={() => alCambiar(p.id)}
            className={`min-h-11 shrink-0 whitespace-nowrap rounded-t-md border-b-2 px-3 text-sm font-semibold transition-colors ${valor === p.id ? "border-brand-solid text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${prefijo}-panel-${valor}`} aria-labelledby={`${prefijo}-tab-${valor}`} tabIndex={0} className="mt-4 min-w-0">
        {children}
      </div>
    </div>
  );
}
