"use client";

import { useId } from "react";

/**
 * Deslizador del peso de los obligatorios (los deseables pesan el resto). Se usa en el formulario y en el resultado: al moverlo el
 * porcentaje se recalcula al instante, en el navegador.
 */
export function ControlPesos({ valor, alCambiar, deshabilitado }: { valor: number; alCambiar: (v: number) => void; deshabilitado?: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        Peso de los requisitos obligatorios: <span className="tabular">{valor} %</span> <span className="font-normal text-muted-foreground">(deseables: <span className="tabular">{100 - valor} %</span>)</span>
      </label>
      <input id={id} type="range" min={0} max={100} step={5} value={valor} onChange={(e) => alCambiar(Number(e.target.value))} disabled={deshabilitado} aria-describedby={`${id}-ayuda`} className="h-11 w-full cursor-pointer accent-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50" />
      <p id={`${id}-ayuda`} className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Por defecto 70 / 30. {deshabilitado ? "Como la oferta no distingue obligatorios de deseables, todos los requisitos pesan igual y este control no cambia el resultado." : "Súbelo si la oferta insiste en sus requisitos indispensables; bájalo si los deseables pesan mucho para ti."}
      </p>
    </div>
  );
}
