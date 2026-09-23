"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { RubroEjemplo } from "@/lib/herramientas/tipos";
import { cn } from "@/lib/utils";

/** Bloque 9: pestañas accesibles (flechas, Inicio y Fin) con un ejemplo y un consejo por rubro. */
export function PestanasRubro({ rubros }: { rubros: RubroEjemplo[] }) {
  const [activa, setActiva] = useState(0);
  const base = useId();
  const botones = useRef<(HTMLButtonElement | null)[]>([]);

  function teclado(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let destino = i;
    if (e.key === "ArrowRight") destino = (i + 1) % rubros.length;
    else if (e.key === "ArrowLeft") destino = (i - 1 + rubros.length) % rubros.length;
    else if (e.key === "Home") destino = 0;
    else if (e.key === "End") destino = rubros.length - 1;
    else return;
    e.preventDefault();
    setActiva(destino);
    botones.current[destino]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Tipo de negocio" className="flex gap-2 overflow-x-auto pb-1">
        {rubros.map((r, i) => (
          <button
            key={r.rubro}
            ref={(el) => {
              botones.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${i}`}
            aria-selected={activa === i}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={activa === i ? 0 : -1}
            onClick={() => setActiva(i)}
            onKeyDown={(e) => teclado(e, i)}
            className={cn("guide-focus min-h-11 shrink-0 rounded-lg border px-4 text-sm font-semibold", activa === i ? "border-guide-ink bg-guide-ink text-background" : "border-foreground/50 bg-background text-foreground hover:bg-guide-surface")}
          >
            {r.rubro}
          </button>
        ))}
      </div>
      {rubros.map((r, i) => (
        <div key={r.rubro} role="tabpanel" id={`${base}-panel-${i}`} aria-labelledby={`${base}-tab-${i}`} hidden={activa !== i} className="mt-4 rounded-xl border bg-guide-surface p-4 sm:p-5">
          <p className="text-[0.97rem] leading-relaxed text-foreground/90">{r.ejemplo}</p>
          <p className="mt-3 text-[0.97rem] leading-relaxed">
            <span className="font-semibold text-guide-ink">Consejo: </span>
            {r.consejo}
          </p>
        </div>
      ))}
    </div>
  );
}
