import { Fragment } from "react";
import { TriangleAlert } from "lucide-react";
import type { GuidePrompt } from "@/lib/guides/model";
import { CopyButton } from "./copy-button";
import { Inline } from "./rich-text";
import { ui } from "./ui";

const VARIABLE = /(\{\{[A-Z][A-Z0-9_]*\}\})/g;

/** El prompt con sus {{VARIABLES}} resaltadas (el botón copia el texto tal cual, con las variables). */
function HighlightedPrompt({ text }: { text: string }) {
  return (
    <>
      {text.split(VARIABLE).map((part, index) =>
        /^\{\{[A-Z][A-Z0-9_]*\}\}$/.test(part) ? (
          <mark key={index} className="rounded bg-brand/25 px-1 py-0.5 font-semibold text-guide-code-foreground">
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}

/**
 * Prompt completo y copiable, con todo lo que hace falta para usarlo: objetivo, cuándo usarlo,
 * datos requeridos, variables documentadas, el texto, resultado esperado, recomendaciones y
 * advertencias. Recibe un `GuidePrompt` (data.prompts.<id>); no contiene contenido propio.
 */
export function PromptBlock({ prompt, heading = true }: { prompt: GuidePrompt; heading?: boolean }) {
  return (
    <div className={ui.block}>
      {heading && <h3 className={ui.h3}>{prompt.title}</h3>}
      <p className="mt-2 max-w-[var(--guide-measure)] text-[0.97rem] leading-relaxed text-foreground/90">
        <span className="font-semibold text-guide-ink">Objetivo: </span>
        <Inline text={prompt.objective} />
      </p>

      <div className="mt-5 grid gap-5 @2xl:grid-cols-2">
        <div>
          <p className={ui.eyebrow}>Cuándo usarlo</p>
          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/90">
            <Inline text={prompt.whenToUse} />
          </p>
        </div>
        <div>
          <p className={ui.eyebrow}>Datos que necesitas antes</p>
          <ul className="mt-1.5 space-y-1 text-[0.95rem] leading-snug text-foreground/90">
            {(prompt.requiredData ?? []).map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-[0.55em] size-1 shrink-0 rounded-full bg-brand" />
                <span>
                  <Inline text={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {prompt.variables.length > 0 && (
        <div className="mt-6">
          <p className={ui.eyebrow}>Variables para personalizar</p>
          <dl className="mt-2 divide-y rounded-xl border bg-background">
            {prompt.variables.map((variable) => (
              <div key={variable.name} className="grid gap-1 px-4 py-3 @xl:grid-cols-[11rem_minmax(0,1fr)] @xl:gap-4">
                <dt className="break-all font-mono text-[0.8rem] font-semibold text-brand">{`{{${variable.name}}}`}</dt>
                <dd className="text-sm leading-snug text-foreground/85">
                  <Inline text={variable.description} />
                  <span className="mt-1 block text-muted-foreground">
                    Ejemplo: <Inline text={variable.example} />
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-guide-code bg-guide-code text-guide-code-foreground">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
          <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-guide-code-foreground/70">Prompt</span>
          <CopyButton text={prompt.prompt} label="Copiar prompt" />
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-[0.84rem] leading-[1.7] sm:p-5" tabIndex={0} aria-label={`Texto del prompt: ${prompt.title}`}>
          <code>
            <HighlightedPrompt text={prompt.prompt} />
          </code>
        </pre>
      </div>

      <div className="mt-6 rounded-xl border bg-guide-surface px-5 py-4">
        <p className={ui.eyebrow}>Ejemplo ficticio de uso</p>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/90">
          <Inline text={prompt.example ?? ""} />
        </p>
      </div>

      <div className="mt-6 grid gap-6 @2xl:grid-cols-2">
        <div>
          <p className={ui.eyebrow}>Resultado esperado</p>
          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/90">
            <Inline text={prompt.expectedResult ?? ""} />
          </p>
        </div>
        <div>
          <p className={ui.eyebrow}>Recomendaciones</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[0.95rem] leading-snug text-foreground/90 marker:text-muted-foreground">
            {(prompt.recommendations ?? []).map((item) => (
              <li key={item}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {(prompt.warnings ?? []).length > 0 && (
        <div className="mt-6 rounded-xl border-l-[3px] border-l-warn bg-warn-muted px-5 py-4">
          <p className="flex items-center gap-2 text-[0.95rem] font-semibold text-warn">
            <TriangleAlert className="size-4" aria-hidden />
            Antes de usar este prompt
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem] leading-snug text-foreground/90">
            {(prompt.warnings ?? []).map((item) => (
              <li key={item}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
