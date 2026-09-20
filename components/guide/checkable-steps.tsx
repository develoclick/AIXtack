"use client";

import { useId, useMemo, useSyncExternalStore } from "react";
import { RotateCcw } from "lucide-react";
import type { MethodStep } from "@/lib/guides/model";
import { cn } from "@/lib/utils";
import { parseStored, readStored, subscribeStored, writeStored } from "./checklist-storage";
import { Inline } from "./rich-text";
import { ui } from "./ui";

/**
 * Los pasos del método como lista de proceso marcable: los mismos pasos, una sola vez. El avance
 * se guarda solo en este navegador (localStorage); no se envía nada.
 */
export function CheckableSteps({ steps, storageKey }: { steps: MethodStep[]; storageKey: string }) {
  const groupId = useId();
  const key = `guia-pasos:${storageKey}`;
  const ids = useMemo(() => steps.map((_, index) => `p${index + 1}`), [steps]);
  const valid = useMemo(() => new Set(ids), [ids]);
  const stored = useSyncExternalStore(
    subscribeStored,
    () => readStored(key),
    () => null
  );
  const checked = useMemo(() => parseStored(stored, valid), [stored, valid]);

  function toggle(id: string) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    writeStored(key, [...next]);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-guide-surface px-4 py-3">
        <p role="status" aria-live="polite" className="font-mono text-[0.8rem] font-semibold tabular-nums text-guide-ink">
          {checked.size} / {steps.length} pasos hechos
        </p>
        <button
          type="button"
          onClick={() => writeStored(key, [])}
          disabled={checked.size === 0}
          className="guide-focus inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reiniciar
        </button>
      </div>

      <ol className="space-y-0">
        {steps.map((step, index) => {
          const id = ids[index];
          const inputId = `${groupId}-${id}`;
          const done = checked.has(id);
          const last = index === steps.length - 1;
          return (
            <li key={step.title} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-x-5">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border font-mono text-[0.78rem] font-semibold sm:size-11",
                    done ? "border-ok/40 bg-ok-muted text-ok" : "border-brand/40 bg-brand-muted text-brand"
                  )}
                >
                  {done ? "✓" : String(index + 1).padStart(2, "0")}
                </span>
                {!last && <span aria-hidden className="mt-1 w-px flex-1 bg-border" />}
              </div>
              <div className={last ? "pb-0" : "pb-8"}>
                <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={done}
                    onChange={() => toggle(id)}
                    className="mt-[0.35rem] size-[1.05rem] shrink-0 cursor-pointer accent-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  />
                  <span className={cn(ui.h3, done && "text-muted-foreground line-through decoration-1")}>
                    <span className="sr-only">Paso {index + 1}: </span>
                    {step.title}
                  </span>
                </label>
                <div className="mt-2 pl-[1.85rem]">
                  <p className="max-w-[var(--guide-measure)] text-[0.97rem] leading-[1.7] text-foreground/90">
                    <Inline text={step.description} />
                  </p>
                  {step.output && (
                    <p className="mt-3 rounded-lg bg-guide-surface px-4 py-2.5 text-sm leading-snug text-muted-foreground">
                      <span className="font-semibold text-guide-ink">Al terminar tienes: </span>
                      <Inline text={step.output} />
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
