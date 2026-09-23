"use client";

import type { MejoraPrompt } from "@/lib/herramientas/tipos";
import { BotonCopiar } from "./boton-copiar";

/** Bloque 5: prompts de una línea, sin variables, para pegar en el mismo chat. Cada uno se copia con su botón. */
export function MejorasPrompt({ mejoras }: { mejoras: MejoraPrompt[] }) {
  return (
    <ul className="grid gap-3">
      {mejoras.map((mejora) => (
        <li key={mejora.label} className="rounded-xl border bg-background p-4">
          <p className="text-sm font-semibold text-guide-ink">{mejora.label}</p>
          <p className="mt-1.5 text-[0.97rem] leading-relaxed text-foreground/90">«{mejora.prompt}»</p>
          <BotonCopiar texto={mejora.prompt} etiqueta="Copiar" compacto className="mt-3" />
        </li>
      ))}
    </ul>
  );
}
