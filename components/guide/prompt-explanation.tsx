import type { GuidePrompt } from "@/lib/guides/model";
import { Inline } from "./rich-text";
import { ui } from "./ui";

/** Explicación por partes de un prompt: qué hace cada bloque, por qué funciona y qué puede cambiar el lector. */
export function PromptExplanation({ prompt }: { prompt: GuidePrompt }) {
  return (
    <div className={ui.block}>
      <ol className="divide-y rounded-xl border bg-background">
        {prompt.explanation.map((part, index) => (
          <li key={part.part} className="grid gap-3 p-4 @2xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @2xl:gap-6 sm:p-5">
            <div className="min-w-0">
              <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Parte {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-1.5 break-words rounded-md border-l-2 border-brand bg-guide-surface px-3 py-2 font-mono text-[0.8rem] leading-relaxed text-guide-ink">
                {part.part}
              </p>
            </div>
            <p className="text-[0.95rem] leading-relaxed text-foreground/90">
              <Inline text={part.why} />
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
