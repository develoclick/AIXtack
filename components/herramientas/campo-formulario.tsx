"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export const claseCampo =
  "guide-focus block w-full min-h-11 rounded-lg border border-foreground/50 bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground aria-[invalid=true]:border-risk";

/**
 * Un campo con su etiqueta visible (htmlFor), ayuda y error asociados (aria-describedby).
 * Lo obligatorio se dice con texto («obligatorio»), no solo con un color o un asterisco.
 */
export function CampoFormulario({
  etiqueta,
  ayuda,
  error,
  requerido,
  children,
  className,
}: {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  requerido?: boolean;
  /** Recibe el id del control y el aria-describedby para conectarlos. */
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const ayudaId = `${id}-ayuda`;
  const errorId = `${id}-error`;
  const describedBy = [ayuda ? ayudaId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-guide-ink">
        {etiqueta}
        {requerido && <span className="ml-1.5 font-normal text-muted-foreground">(obligatorio)</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {ayuda && (
        <p id={ayudaId} className="mt-1.5 text-sm text-muted-foreground">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-risk">
          {error}
        </p>
      )}
    </div>
  );
}
