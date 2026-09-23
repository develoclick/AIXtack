/**
 * Recetas de estilo de la plantilla de herramientas. Difieren de `ui` (components/guide/ui.ts) solo donde el
 * color de marca no llega al contraste AA sobre fondo claro (texto en `brand` = 2,2–2,6:1 en modo claro):
 * aquí el texto usa `guide-ink` y la marca queda en bordes y fondos.
 */
export const estilos = {
  eyebrow: "font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-guide-ink",
  tag: "inline-flex items-center rounded-md border border-brand/50 bg-brand-muted px-2 py-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-guide-ink",
  /** Borde de controles: 3:1 como mínimo frente al fondo (WCAG 1.4.11). */
  borde: "border-foreground/50",
} as const;
