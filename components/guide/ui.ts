/**
 * Recetas de clases compartidas por los componentes de guía. Los valores (colores,
 * medidas, movimiento) salen de los tokens de app/globals.css; aquí solo se combinan.
 * Cambiar la identidad visual de las guías = tocar los tokens y estas recetas.
 */
export const ui = {
  /** Sobretítulo en monoespaciada: la firma tipográfica del sistema. */
  eyebrow: "font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-brand",
  /** Título de bloque dentro de una sección (h3). */
  h3: "text-balance text-lg font-semibold tracking-tight text-guide-ink sm:text-xl",
  h4: "text-base font-semibold text-guide-ink",
  body: "text-[1rem] leading-[1.75] text-foreground/90",
  muted: "text-sm leading-relaxed text-muted-foreground",
  /** Superficie neutra: separa sin recargar. */
  panel: "rounded-xl border bg-guide-surface",
  /** Pastilla informativa. */
  chip: "inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground",
  /** Etiqueta de estado del contenido (CASO FICTICIO, EJEMPLO GENERADO…). */
  tag: "inline-flex items-center rounded-md border border-brand/30 bg-brand-muted px-2 py-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-brand",
  tagNeutral:
    "inline-flex items-center rounded-md border bg-background px-2 py-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
  focus: "guide-focus",
  /** Contenedor de bloque: container query para que cada bloque responda a su columna. */
  block: "not-prose @container mt-8 first:mt-0",
} as const;

export type Verdict = "ok" | "improve" | "risk";

export const verdictStyle: Record<Verdict, { label: string; className: string }> = {
  ok: { label: "Correcto", className: "bg-ok-muted text-ok" },
  improve: { label: "Mejorable", className: "bg-warn-muted text-warn" },
  risk: { label: "Riesgo", className: "bg-risk-muted text-risk" },
};
