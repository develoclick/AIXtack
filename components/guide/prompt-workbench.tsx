"use client";

import { Fragment, useId, useState, type ReactNode } from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import type { GuidePrompt } from "@/lib/guides/model";
import { CopyButton } from "./copy-button";
import { Inline } from "./rich-text";
import { ui } from "./ui";

const VARIABLE = /(\{\{[A-Z][A-Z0-9_]*\}\})/g;
const IS_VARIABLE = /^\{\{[A-Z][A-Z0-9_]*\}\}$/;

/**
 * Un prompt, una sola vez: ficha (objetivo y cuándo usarlo), constructor de variables que
 * actualiza el texto en vivo, vista plegable del texto completo, botón de copiar, por qué
 * funciona (por partes, en lenguaje simple), cómo evaluarlo y mejorarlo, y advertencias.
 * `children` recibe la «Prueba real» (server) cuando existe. Todo ocurre en el navegador.
 */
export function PromptWorkbench({ prompt, children }: { prompt: GuidePrompt; children?: ReactNode }) {
  const groupId = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const many = prompt.variables.length >= 2;

  const filled = prompt.variables.filter((variable) => (values[variable.name] ?? "").trim().length > 0).length;
  const text = prompt.prompt.replace(VARIABLE, (match) => {
    const value = (values[match.slice(2, -2)] ?? "").trim();
    return value || match;
  });

  return (
    <div className={ui.block}>
      <article className="overflow-hidden rounded-2xl border bg-background">
        <header className="border-b bg-guide-surface px-5 py-4 sm:px-6">
          <h3 className={ui.h3}>{prompt.title}</h3>
          <p className="mt-2 max-w-[var(--guide-measure)] text-[0.95rem] leading-relaxed text-foreground/90">
            <Inline text={prompt.objective} />
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            <span className="font-semibold text-guide-ink">Cuándo usarlo: </span>
            <Inline text={prompt.whenToUse} />
          </p>
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          {prompt.variables.length > 0 && (
            <div className={many ? "grid gap-4 @2xl:grid-cols-2" : "space-y-4"}>
              {prompt.variables.map((variable) => {
                const inputId = `${groupId}-${variable.name}`;
                return (
                  <div key={variable.name}>
                    <label htmlFor={inputId} className="block font-mono text-[0.78rem] font-semibold text-brand">
                      {`{{${variable.name}}}`}
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
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-guide-code px-4 py-3 text-guide-code-foreground">
            <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-guide-code-foreground/70" role="status" aria-live="polite">
              {prompt.variables.length > 0 ? `${filled} / ${prompt.variables.length} campos` : "Prompt listo"}
            </span>
            <CopyButton text={text} label="Copiar prompt" />
          </div>

          <details className="group rounded-xl border">
            <summary className="guide-focus flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-guide-ink marker:hidden [&::-webkit-details-marker]:hidden">
              <span>Ver el texto completo del prompt</span>
              <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
            </summary>
            <pre
              className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words border-t bg-guide-code p-4 font-mono text-[0.82rem] leading-[1.7] text-guide-code-foreground"
              tabIndex={0}
              aria-label={`Texto del prompt: ${prompt.title}`}
            >
              <code>
                {text.split(VARIABLE).map((part, index) =>
                  IS_VARIABLE.test(part) ? (
                    <mark key={index} className="rounded bg-brand/25 px-1 py-0.5 font-semibold text-guide-code-foreground">
                      {part}
                    </mark>
                  ) : (
                    <Fragment key={index}>{part}</Fragment>
                  )
                )}
              </code>
            </pre>
          </details>

          {prompt.conversation && prompt.conversation.length > 0 && (
            <div>
              <p className={ui.eyebrow}>Ejemplo del intercambio (ilustrativo)</p>
              <ul className="mt-3 space-y-2.5">
                {prompt.conversation.map((turn, index) => (
                  <li key={index} className={turn.who === "ia" ? "mr-6 sm:mr-16" : "ml-6 sm:ml-16"}>
                    <p
                      className={`rounded-xl border px-4 py-3 text-[0.93rem] leading-relaxed ${
                        turn.who === "ia" ? "bg-guide-surface text-foreground/90" : "border-brand/30 bg-brand-muted/60 text-guide-ink"
                      }`}
                    >
                      <span className="mb-1 block font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {turn.who === "ia" ? "Asistente de IA" : "Tú"}
                      </span>
                      <Inline text={turn.text} />
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className={ui.eyebrow}>Por qué funciona, por partes</p>
            <ol className="mt-3 divide-y rounded-xl border">
              {prompt.explanation.map((part, index) => (
                <li key={part.part} className="grid gap-x-6 gap-y-2 p-4 @2xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                  <p className="min-w-0 break-words rounded-md border-l-2 border-brand bg-guide-surface px-3 py-2 font-mono text-[0.78rem] leading-relaxed text-guide-ink">
                    <span className="mr-2 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                    {part.part}
                  </p>
                  <p className="text-[0.93rem] leading-relaxed text-foreground/90">
                    <Inline text={part.why} />
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {(prompt.evaluate || prompt.improve) && (
            <dl className="grid gap-x-8 gap-y-4 @2xl:grid-cols-2">
              {prompt.evaluate && (
                <div>
                  <dt className={ui.eyebrow}>Cómo evaluarlo</dt>
                  <dd className="mt-1.5 text-[0.93rem] leading-relaxed text-foreground/90">
                    <Inline text={prompt.evaluate} />
                  </dd>
                </div>
              )}
              {prompt.improve && (
                <div>
                  <dt className={ui.eyebrow}>Cómo mejorarlo</dt>
                  <dd className="mt-1.5 text-[0.93rem] leading-relaxed text-foreground/90">
                    <Inline text={prompt.improve} />
                  </dd>
                </div>
              )}
            </dl>
          )}

          {prompt.warnings && prompt.warnings.length > 0 && (
            <div className="rounded-xl border-l-[3px] border-l-warn bg-warn-muted px-5 py-4">
              <p className="flex items-center gap-2 text-[0.95rem] font-semibold text-warn">
                <TriangleAlert className="size-4" aria-hidden />
                Antes de usarlo
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.93rem] leading-snug text-foreground/90">
                {prompt.warnings.map((warning) => (
                  <li key={warning}>
                    <Inline text={warning} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {children}
        </div>
      </article>
    </div>
  );
}
