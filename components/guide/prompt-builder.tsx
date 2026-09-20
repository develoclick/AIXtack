"use client";

import { Fragment, useId, useState } from "react";
import type { GuidePrompt } from "@/lib/guides/model";
import { CopyButton } from "./copy-button";
import { ui } from "./ui";

const VARIABLE = /(\{\{[A-Z][A-Z0-9_]*\}\})/g;

/**
 * Constructor de prompt: un campo por cada variable del prompt, que actualiza el texto en vivo.
 * Se copia el resultado con los datos ya puestos. Todo ocurre en el navegador; no se guarda ni
 * se envía nada. Úsalo cuando el prompt tenga 3 o más variables.
 */
export function PromptBuilder({ prompt, title = "Rellena tu versión del prompt" }: { prompt: GuidePrompt; title?: string }) {
  const groupId = useId();
  const [values, setValues] = useState<Record<string, string>>({});

  const filled = prompt.variables.filter((variable) => (values[variable.name] ?? "").trim().length > 0).length;
  const text = prompt.prompt.replace(VARIABLE, (match) => {
    const name = match.slice(2, -2);
    const value = (values[name] ?? "").trim();
    return value || match;
  });

  return (
    <div className={ui.block}>
      <h3 className={ui.h3}>{title}</h3>
      <p className="mt-2 max-w-[var(--guide-measure)] text-[0.95rem] leading-relaxed text-muted-foreground">
        Escribe tus datos en los campos y el prompt se completa solo. Lo que no rellenes queda marcado con su <span className="font-mono text-xs">{"{{NOMBRE}}"}</span>.
      </p>

      <div className="mt-5 grid gap-6 @3xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-4">
          {prompt.variables.map((variable) => {
            const inputId = `${groupId}-${variable.name}`;
            return (
              <div key={variable.name}>
                <label htmlFor={inputId} className="block text-sm font-semibold text-guide-ink">
                  <span className="font-mono text-[0.78rem] text-brand">{`{{${variable.name}}}`}</span>
                </label>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{variable.description}</p>
                <textarea
                  id={inputId}
                  rows={2}
                  value={values[variable.name] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [variable.name]: event.target.value }))}
                  placeholder={variable.example}
                  className="guide-focus mt-1.5 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm leading-snug text-foreground placeholder:text-muted-foreground/70"
                />
              </div>
            );
          })}
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-guide-code bg-guide-code text-guide-code-foreground">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
            <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-guide-code-foreground/70" role="status" aria-live="polite">
              {filled} / {prompt.variables.length} campos
            </span>
            <CopyButton text={text} label="Copiar prompt" />
          </div>
          <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[0.82rem] leading-[1.7]" tabIndex={0} aria-label="Prompt con tus datos">
            <code>
              {text.split(VARIABLE).map((part, index) =>
                /^\{\{[A-Z][A-Z0-9_]*\}\}$/.test(part) ? (
                  <mark key={index} className="rounded bg-brand/25 px-1 py-0.5 font-semibold text-guide-code-foreground">
                    {part}
                  </mark>
                ) : (
                  <Fragment key={index}>{part}</Fragment>
                )
              )}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
