import { ShieldCheck } from "lucide-react";
import type { ChecklistData, FaqItem, VerificationData } from "@/lib/guides/model";
import { ChecklistBoard } from "./checklist-board";
import { RichText } from "./rich-text";
import { ui } from "./ui";

/** Checklist final de la guía: casillas reales, contador y memoria opcional en el navegador. */
export function InteractiveChecklist({ data, guide, persist = true }: { data: ChecklistData; guide: string; persist?: boolean }) {
  return (
    <div className={ui.block}>
      <h3 className={`${ui.h3} mb-4`}>{data.title}</h3>
      <ChecklistBoard
        items={data.items}
        legend={data.title}
        storageKey={persist ? `${guide}:${data.id}` : undefined}
        doneLabel="completadas"
      />
      {persist && <p className="mt-2.5 text-xs text-muted-foreground">Tu avance se guarda solo en este navegador. No se envía a ningún servidor.</p>}
    </div>
  );
}

/** Verificación humana: lo que la persona comprueba antes de usar cualquier resultado de la IA. */
export function HumanVerification({ data }: { data: VerificationData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />
      <div className="mt-6">
        <ChecklistBoard items={data.items.map((item, index) => ({ id: `v${index}`, ...item }))} legend="Verificación antes de usar el resultado" doneLabel="verificadas" />
      </div>
      <p className="mt-6 flex max-w-[var(--guide-measure)] gap-3 rounded-xl border border-brand/30 bg-brand-muted/50 px-5 py-4 text-[1rem] font-semibold leading-snug text-guide-ink">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
        <span>{data.principle}</span>
      </p>
    </div>
  );
}

/** Preguntas frecuentes reales, con <details> nativo: accesible por teclado y sin JavaScript. */
export function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <div className={ui.block}>
      <div className="divide-y rounded-2xl border bg-background">
        {items.map((item) => (
          <details key={item.question} className="group">
            <summary className="guide-focus flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-[1rem] font-semibold leading-snug text-guide-ink marker:hidden [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <span
                aria-hidden
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </span>
            </summary>
            <div className="max-w-[var(--guide-measure)] px-5 pb-5 text-[0.97rem] leading-relaxed text-foreground/90">
              <RichText text={item.answer} className="text-[0.97rem] leading-relaxed text-foreground/90 [&:not(:first-child)]:mt-3" />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
