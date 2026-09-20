"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "copied" | "failed";

function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(area);
  }
}

/**
 * Copia un texto al portapapeles. La confirmación es en el propio botón («Copiado ✓») y se
 * anuncia con aria-live: sin alertas, sin avisos flotantes que tapen la lectura.
 */
export function CopyButton({ text, label = "Copiar prompt", className, tone = "dark" }: { text: string; label?: string; className?: string; tone?: "dark" | "light" }) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  async function handleCopy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    setStatus(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2400);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "guide-focus inline-flex min-h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-colors",
          status === "copied"
            ? "border-ok/40 bg-ok-muted text-ok"
            : tone === "light"
              ? "border-brand/40 bg-brand-muted text-guide-ink hover:bg-brand-muted/70"
              : "border-white/20 bg-white/10 text-guide-code-foreground hover:bg-white/20",
          className
        )}
      >
        {status === "copied" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span className="uppercase tracking-[0.06em]">{status === "copied" ? "Copiado ✓" : status === "failed" ? "Copia manual" : label}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? "Prompt copiado al portapapeles" : status === "failed" ? "No se pudo copiar; selecciona el texto y cópialo manualmente" : ""}
      </span>
    </>
  );
}
