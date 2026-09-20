import type { ReactNode } from "react";
import { ArrowRight, Info, Lightbulb, OctagonAlert, Search, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalloutVariant = "info" | "warning" | "calculos" | "fuentes" | "simple";

const DEFAULT_TITLES: Record<CalloutVariant, string> = {
  info: "Nota",
  warning: "Ten en cuenta",
  calculos: "Cálculo, interpretación y decisión",
  fuentes: "Datos y fuentes",
  simple: "En palabras simples",
};

function Step({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex-1 rounded-lg border bg-background px-3 py-2.5">
      <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-guide-ink">{label}</p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{note}</p>
    </div>
  );
}

/**
 * Aviso editorial. Las variantes `calculos` y `fuentes` fijan las dos reglas del sitio
 * (ver docs/GUIA-EDITORIAL.md): separar CÁLCULO / INTERPRETACIÓN / DECISIÓN cuando hay
 * números, y distinguir datos del usuario de información generada cuando hay información
 * externa. El texto de cada aviso lo escribe cada guía.
 */
export function Callout({ variant = "info", title, children }: { variant?: CalloutVariant; title?: string; children: ReactNode }) {
  const Icon = variant === "warning" ? TriangleAlert : variant === "fuentes" ? Search : variant === "simple" ? Lightbulb : Info;
  const emphasised = variant === "calculos" || variant === "fuentes";

  return (
    <aside
      className={cn(
        "not-prose @container rounded-xl border-l-[3px] border-y border-r px-5 py-4",
        variant === "warning" && "border-l-warn bg-warn-muted",
        variant === "info" && "border-l-guide-ink/40 bg-guide-surface",
        variant === "simple" && "border-l-brand bg-guide-surface",
        emphasised && "border-l-brand bg-brand-muted/50"
      )}
    >
      <p className="flex items-center gap-2 text-[0.95rem] font-semibold text-guide-ink">
        <Icon className={cn("size-[1.1rem] shrink-0", variant === "warning" ? "text-warn" : "text-brand")} aria-hidden />
        {title ?? DEFAULT_TITLES[variant]}
      </p>

      {variant === "calculos" && (
        <div className="mt-3 flex flex-col gap-2 @lg:flex-row @lg:items-stretch">
          <Step label="Cálculo" note="Se verifica con una hoja de cálculo o una calculadora." />
          <ArrowRight className="hidden size-4 shrink-0 self-center text-muted-foreground @lg:block" aria-hidden />
          <Step label="Interpretación" note="Puede apoyarse en la IA." />
          <ArrowRight className="hidden size-4 shrink-0 self-center text-muted-foreground @lg:block" aria-hidden />
          <Step label="Decisión" note="La toma la persona dueña del negocio." />
        </div>
      )}

      {variant === "fuentes" && (
        <div className="mt-3 flex flex-col gap-2 @lg:flex-row @lg:items-stretch">
          <Step label="Datos que aportas tú" note="Con su fuente anotada junto a cada dato." />
          <Step label="Información generada por la IA" note="Es una hipótesis: se verifica en la fuente." />
        </div>
      )}

      <div className="mt-3 max-w-[var(--guide-measure)] space-y-2 text-[0.95rem] leading-relaxed text-foreground/90">{children}</div>
    </aside>
  );
}

/** Advertencia fuerte: algo que, si se hace, tiene una consecuencia real (datos sensibles, promesas, dinero). */
export function WarningBox({ title = "Atención", children }: { title?: string; children: ReactNode }) {
  return (
    <aside role="note" className="not-prose rounded-xl border border-risk/30 border-l-[3px] border-l-risk bg-risk-muted px-5 py-4">
      <p className="flex items-center gap-2 text-[0.95rem] font-semibold text-risk">
        <OctagonAlert className="size-[1.1rem] shrink-0" aria-hidden />
        {title}
      </p>
      <div className="mt-2 max-w-[var(--guide-measure)] space-y-2 text-[0.95rem] leading-relaxed text-foreground/90">{children}</div>
    </aside>
  );
}
