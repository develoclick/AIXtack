"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type Estado = "reposo" | "copiado" | "manual";

function copiarAntiguo(texto: string): boolean {
  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

/**
 * Copia un texto. Si la API del portapapeles falla, prueba el método antiguo y, si tampoco funciona,
 * muestra el texto seleccionado para copiarlo a mano (Ctrl+C o mantener pulsado). El mensaje de éxito es
 * visible y se anuncia con aria-live. Botón de 44 px de alto como mínimo.
 */
export function BotonCopiar({
  texto,
  etiqueta = "Copiar prompt",
  destino = "ChatGPT, Gemini o Claude",
  compacto = false,
  className,
}: {
  texto: string;
  etiqueta?: string;
  destino?: string;
  compacto?: boolean;
  className?: string;
}) {
  const [estado, setEstado] = useState<Estado>("reposo");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    []
  );

  useEffect(() => {
    if (estado === "manual") {
      area.current?.focus();
      area.current?.select();
    }
  }, [estado]);

  async function copiar() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(texto);
      ok = true;
    } catch {
      ok = copiarAntiguo(texto);
    }
    if (temporizador.current) clearTimeout(temporizador.current);
    if (ok) {
      setEstado("copiado");
      temporizador.current = setTimeout(() => setEstado("reposo"), 4000);
    } else {
      setEstado("manual");
    }
  }

  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        onClick={copiar}
        className={cn(
          "guide-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors",
          compacto ? "" : "w-full sm:w-auto",
          estado === "copiado" ? "border-ok/50 bg-ok-muted text-ok" : "border-guide-ink bg-guide-ink text-background hover:bg-guide-ink/90"
        )}
      >
        {estado === "copiado" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span>{estado === "copiado" ? "Copiado ✓" : etiqueta}</span>
      </button>
      <p role="status" aria-live="polite" className={cn("mt-2 text-sm text-ok", estado === "copiado" ? "" : "sr-only")}>
        {estado === "copiado" ? `Copiado ✓ Ahora pégalo en ${destino}` : ""}
      </p>
      {estado === "manual" && (
        <div className="mt-3">
          <p className="text-sm text-foreground/90" role="alert">
            No pudimos copiar automáticamente. Selecciona el texto de abajo y cópialo (Ctrl+C, o mantén pulsado en el celular).
          </p>
          <textarea ref={area} readOnly value={texto} rows={8} aria-label="Texto para copiar a mano" className="guide-focus mt-2 w-full rounded-lg border bg-background p-3 font-mono text-xs leading-relaxed" />
        </div>
      )}
    </div>
  );
}
