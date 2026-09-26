"use client";

import { X } from "lucide-react";

export interface ToastDatos {
  id: number;
  texto: string;
  accion?: { etiqueta: string; alHacer: () => void };
}

/**
 * Aviso breve abajo del todo («Copiado», «Datos de ejemplo cargados… Deshacer»). Se anuncia a los lectores de pantalla con
 * aria-live y nunca queda junto a un anuncio ni a los botones de la herramienta.
 */
export function AvisoToast({ toast, alCerrar }: { toast: ToastDatos | null; alCerrar: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className="aparecer pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border bg-foreground py-2.5 pl-4 pr-2 text-sm text-background shadow-lg">
          <span>{toast.texto}</span>
          {toast.accion && (
            <button type="button" onClick={toast.accion.alHacer} className="min-h-11 rounded-md px-3 font-semibold underline underline-offset-2 hover:bg-white/10">
              {toast.accion.etiqueta}
            </button>
          )}
          <button type="button" onClick={alCerrar} aria-label="Cerrar aviso" className="flex size-11 items-center justify-center rounded-md hover:bg-white/10">
            <X aria-hidden className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
