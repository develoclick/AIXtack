"use client";

import { useState } from "react";
import { Check, ClipboardCopy, ExternalLink } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { construirPromptAnalisisVentas, progresoAnalisisVentas } from "@/lib/analizar-ventas/prompt";
import type { DatosAnalisisVentas } from "@/lib/analizar-ventas/tipos";
import type { FichaDataset } from "@/lib/analizar-ventas/tipos";
import type { ResumenAnalisis } from "@/lib/analizar-ventas/calculo";

const ASISTENTES = [
  { nombre: "ChatGPT", href: "https://chatgpt.com/" },
  { nombre: "Gemini", href: "https://gemini.google.com/" },
  { nombre: "Claude", href: "https://claude.ai/" },
];

export function PanelPromptAnalisisVentas({ datos, ficha, resumen, mapeoListo, hayArchivo, alCopiar }: { datos: DatosAnalisisVentas; ficha: FichaDataset | null; resumen: ResumenAnalisis | null; mapeoListo: boolean; hayArchivo: boolean; alCopiar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState(false);
  const progreso = progresoAnalisisVentas(datos, mapeoListo, hayArchivo);
  const prompt = ficha && resumen ? construirPromptAnalisisVentas(datos, ficha, resumen) : null;

  async function copiar() {
    if (!prompt) return;
    const ok = await copiarTexto(prompt);
    setError(!ok);
    setCopiado(ok);
    if (ok) alCopiar();
    setTimeout(() => setCopiado(false), 2500);
  }

  const suficiente = progreso.porcentaje >= progreso.recomendado;

  return (
    <section aria-labelledby="titulo-prompt-ventas" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-prompt-ventas" className="text-lg font-semibold leading-tight">
        2. Copia el prompt <span className="font-normal text-muted-foreground">(se arma solo)</span>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Pégalo en un asistente de IA. Le entrega la ficha de tu archivo y las métricas ya calculadas: solo le pides que las interprete, nunca que las recalcule.</p>

      <div className="mt-5" role="group" aria-label="Avance del formulario">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold tabular">
            Datos completados: {progreso.porcentaje} % <span className="font-normal text-muted-foreground">(recomendado: {progreso.recomendado} %)</span>
          </span>
        </div>
        <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-surface" aria-hidden>
          <div className={`h-full rounded-full transition-all duration-200 ${suficiente ? "bg-ok" : "bg-brand-solid"}`} style={{ width: `${progreso.porcentaje}%` }} />
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

      {prompt ? (
        <>
          <pre tabIndex={0} aria-label="Texto del prompt" data-prompt className="mt-4 max-h-[26rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-surface p-4 font-mono text-[0.8125rem] leading-relaxed">
            {prompt}
          </pre>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={copiar} className="btn btn-primario sm:flex-1">
              {copiado ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
              {copiado ? "¡Prompt copiado!" : "Copiar prompt"}
            </button>
            <a href="#paso-3" className="btn btn-secundario">
              Ya tengo la respuesta ↓
            </a>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-destructive">
              No se pudo copiar automáticamente: selecciona el texto del recuadro y cópialo con Ctrl+C (o Cmd+C).
            </p>
          )}

          <div className="mt-5 border-t pt-4">
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
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">El prompt nunca incluye tus filas de ventas: solo la ficha del archivo y las métricas ya calculadas. Si elegiste «adjuntar el archivo», eres tú quien lo sube a la conversación con tu IA; esa parte se rige por la política de privacidad de ese servicio.</p>
          </div>
        </>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">Sube tu archivo y mapea al menos la fecha y el importe en el paso 1 para armar el prompt.</p>
      )}
    </section>
  );
}
