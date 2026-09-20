import type { MethodData } from "@/lib/guides/model";
import { CheckableSteps } from "./checkable-steps";
import { ImageBlock } from "./image-block";
import { Inline, RichText } from "./rich-text";
import { ui } from "./ui";

/**
 * Método en pasos: línea de tiempo vertical, cada paso con su entregable. Con `checkable` (y el
 * slug de la guía en `guide`) los mismos pasos son la lista de proceso marcable: no se repiten en
 * otra checklist.
 */
export function StepSection({ data, checkable = false, guide }: { data: MethodData; checkable?: boolean; guide?: string }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />
      <div className="mt-8">
        {checkable && guide ? (
          <CheckableSteps steps={data.steps} storageKey={guide} />
        ) : (
          <ol>
            {data.steps.map((step, index) => {
              const last = index === data.steps.length - 1;
              return (
                <li key={step.title} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-x-5">
                  <div className="flex flex-col items-center">
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand/40 bg-brand-muted font-mono text-[0.78rem] font-semibold text-brand sm:size-11"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {!last && <span aria-hidden className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className={last ? "pb-0" : "pb-9"}>
                    <h3 className={ui.h3}>
                      <span className="sr-only">Paso {index + 1}: </span>
                      {step.title}
                    </h3>
                    <div className="mt-2">
                      <RichText text={step.description} className="text-[0.97rem] leading-[1.7] text-foreground/90 [&:not(:first-child)]:mt-3" />
                    </div>
                    {step.output && (
                      <p className="mt-3 rounded-lg bg-guide-surface px-4 py-2.5 text-sm leading-snug text-muted-foreground">
                        <span className="font-semibold text-guide-ink">Al terminar tienes: </span>
                        <Inline text={step.output} />
                      </p>
                    )}
                    {step.image && <ImageBlock image={step.image} className="mt-5" />}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
