"use client";

import { useId, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { RubricData } from "@/lib/guides/model";
import { cn } from "@/lib/utils";
import { Inline, RichText } from "./rich-text";
import { ui } from "./ui";

const LEVELS = [
  { value: 0, label: "No" },
  { value: 1, label: "En parte" },
  { value: 2, label: "Sí" },
] as const;

/**
 * Autoevaluación con rúbrica: cada criterio vale 0, 1 o 2 puntos y el total da un mensaje sobre
 * qué hacer con el resultado de la IA. Todo ocurre en el navegador; no se guarda ni se envía nada.
 * No sustituye tu revisión: ordena la manera de hacerla.
 */
export function Rubric({ data }: { data: RubricData }) {
  const groupId = useId();
  const [scores, setScores] = useState<Record<string, number>>({});

  const max = data.criteria.length * 2;
  const answered = Object.keys(scores).length;
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const outcome = useMemo(() => {
    const ordered = [...data.outcomes].sort((a, b) => a.min - b.min);
    return ordered.filter((item) => total >= item.min).pop() ?? ordered[0];
  }, [data.outcomes, total]);

  return (
    <div className={ui.block}>
      <h3 className={ui.h3}>{data.title}</h3>
      <div className="mt-2">
        <RichText text={data.intro} className="text-[0.97rem] leading-relaxed text-foreground/90 [&:not(:first-child)]:mt-3" />
      </div>

      <div className="mt-5 rounded-2xl border bg-background">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <p role="status" aria-live="polite" className="font-mono text-[0.8rem] font-semibold tabular-nums text-guide-ink">
            {total} / {max} puntos
          </p>
          <button
            type="button"
            onClick={() => setScores({})}
            disabled={answered === 0}
            className="guide-focus inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
        </div>

        <ul className="divide-y">
          {data.criteria.map((criterion) => (
            <li key={criterion.id} className="px-5 py-4">
              <fieldset>
                <legend className="text-[0.97rem] font-semibold leading-snug text-guide-ink">
                  <Inline text={criterion.label} />
                </legend>
                {criterion.detail && (
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">
                    <Inline text={criterion.detail} />
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {LEVELS.map((level) => {
                    const inputId = `${groupId}-${criterion.id}-${level.value}`;
                    const selected = scores[criterion.id] === level.value;
                    return (
                      <label
                        key={level.value}
                        htmlFor={inputId}
                        className={cn(
                          "inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand",
                          selected ? "border-brand bg-brand-muted text-guide-ink" : "text-muted-foreground hover:bg-guide-surface"
                        )}
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name={`${groupId}-${criterion.id}`}
                          checked={selected}
                          onChange={() => setScores((current) => ({ ...current, [criterion.id]: level.value }))}
                          className="sr-only"
                        />
                        {level.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          ))}
        </ul>

        <div className="border-t bg-guide-surface px-5 py-4" aria-live="polite">
          {answered < data.criteria.length ? (
            <p className="text-sm text-muted-foreground">Responde los {data.criteria.length} criterios para ver la recomendación ({answered} respondidos).</p>
          ) : (
            <>
              <p className={ui.eyebrow}>{outcome.label}</p>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/90">
                <Inline text={outcome.advice} />
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
