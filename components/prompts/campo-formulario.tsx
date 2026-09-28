"use client";

import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Campo de formulario con etiqueta, texto de ayuda y marca de obligatorio (usado por las herramientas nuevas). */
export function Campo({ etiqueta, ayuda, obligatorio, children, className }: { etiqueta: string; ayuda?: string; obligatorio?: boolean; children: (id: string, ayudaId: string | undefined) => ReactNode; className?: string }) {
  const id = useId();
  const ayudaId = ayuda ? `${id}-ayuda` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {etiqueta}
        {obligatorio && (
          <span aria-hidden className="ml-1 text-destructive">
            *
          </span>
        )}
        {obligatorio && <span className="sr-only"> (obligatorio)</span>}
      </label>
      {children(id, ayudaId)}
      {ayuda && (
        <p id={ayudaId} className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {ayuda}
        </p>
      )}
    </div>
  );
}

export function Grupo({ icono: Icono, titulo, descripcion, children }: { icono: LucideIcon; titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <fieldset className="tarjeta min-w-0 p-5 sm:p-6">
      <legend className="sr-only">{titulo}</legend>
      <div className="mb-5 flex items-start gap-3">
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
          <Icono className="size-4" />
        </span>
        <div>
          <h3 className="text-lg font-semibold leading-tight">{titulo}</h3>
          {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
