"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ClipboardCopy, ExternalLink } from "lucide-react";
import { useDatosCv } from "./almacen";
import { copiarTexto } from "./copiar";
import { construirPrompt, progresoCv } from "@/lib/cv/prompt";

const ASISTENTES = [
  { nombre: "ChatGPT", href: "https://chatgpt.com/" },
  { nombre: "Gemini", href: "https://gemini.google.com/" },
  { nombre: "Claude", href: "https://claude.ai/" },
];

export function PanelPrompt() {
  const datos = useDatosCv();
  const prompt = useMemo(() => construirPrompt(datos), [datos]);
  const progreso = progresoCv(datos);
  const [estado, setEstado] = useState<"idle" | "ok" | "error">("idle");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  async function copiar() {
    const ok = await copiarTexto(prompt);
    setEstado(ok ? "ok" : "error");
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setEstado("idle"), 3000);
  }

  const porcentaje = Math.round((progreso.hechos / progreso.total) * 100);

  return (
    <section id="prompt-cv" aria-labelledby="titulo-prompt" className="scroll-mt-24 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          →
        </span>
        <div>
          <h2 id="titulo-prompt" className="text-lg font-semibold leading-tight">
            Tu prompt (se arma solo)
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Cambia con cada dato que escribes. Cuando termines, cópialo y pégalo en tu IA.</p>
        </div>
      </div>

      <div className="mt-5" role="group" aria-label="Avance del formulario">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            Datos completados: {progreso.hechos} de {progreso.total}
          </span>
          <span className="text-muted-foreground">{porcentaje} %</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${porcentaje}%` }} />
        </div>
        {progreso.faltan.length > 0 && (
          <details className="mt-3 text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center font-medium text-muted-foreground hover:text-foreground">Ver qué falta ({progreso.faltan.length})</summary>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              {progreso.faltan.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <pre
        tabIndex={0}
        aria-label="Texto del prompt"
        data-prompt
        className="mt-4 max-h-[26rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border bg-background p-4 font-mono text-[0.8125rem] leading-relaxed"
      >
        {prompt}
      </pre>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={copiar} className="btn btn-primario sm:flex-1">
          {estado === "ok" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
          {estado === "ok" ? "¡Prompt copiado!" : "Copiar prompt"}
        </button>
        <a href="#word" className="btn btn-secundario">
          Ya tengo la respuesta ↓
        </a>
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {estado === "ok" && "Copiado. Ahora pégalo en tu asistente de IA."}
        {estado === "error" && "No se pudo copiar automáticamente: selecciona el texto del recuadro y cópialo con Ctrl+C."}
      </p>

      <div className="mt-2 border-t pt-4">
        <p className="text-sm font-semibold">Abre tu asistente de IA y pega el prompt:</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {ASISTENTES.map((a) => (
            <li key={a.nombre}>
              <a href={a.href} target="_blank" rel="noopener noreferrer" className="btn btn-secundario text-sm">
                {a.nombre} <ExternalLink aria-hidden className="size-3.5" />
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Ojo: al pegar el prompt en una IA, tus datos se envían a ese servicio y se rigen por su política de privacidad. Este sitio no los recibe.
        </p>
      </div>
    </section>
  );
}
