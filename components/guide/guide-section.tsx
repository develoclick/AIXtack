import type { ReactNode } from "react";
import { getSectionDefinition } from "@/lib/guides/constants";
import type { SectionId } from "@/lib/guides/model";
import { ui } from "./ui";

/**
 * Cada sección de una guía. `id` pertenece al catálogo (lib/guides/constants.ts: fija su
 * papel, su etiqueta y su ancla); `title` lo escribe cada guía, así los encabezados no
 * se repiten de una guía a otra. Es el único h2 de la sección.
 *
 * El número grande a la izquierda es un contador CSS (`.guide-flow` en el contenedor): no
 * depende de datos ni de lógica, y da una referencia de dónde estás en una guía larga.
 */
export function GuideSection({ id, title, part, children }: { id: SectionId; title: string; /** Parte del índice a la que pertenece (6 a 8 partes por guía). */ part?: string; children: ReactNode }) {
  const definition = getSectionDefinition(id);

  return (
    <section
      id={id}
      data-section={id}
      data-part={part}
      aria-labelledby={`${id}-titulo`}
      className="scroll-mt-24 border-t pt-10 first:border-t-0 first:pt-0 sm:pt-14"
      style={{ paddingBottom: "var(--guide-section-gap)" }}
    >
      <header className="not-prose mb-8 flex items-start gap-4 sm:gap-6">
        <span aria-hidden className="guide-numeral numeral-outline -mt-1 min-w-[2.4ch] select-none text-[2.75rem] text-brand sm:text-6xl" />
        <div className="min-w-0">
          <p className={ui.eyebrow}>{definition?.label ?? id}</p>
          <h2
            id={`${id}-titulo`}
            className="mt-2 max-w-[var(--guide-measure)] text-balance text-[1.6rem] font-semibold leading-[1.12] tracking-[-0.025em] text-guide-ink sm:text-[2.1rem]"
          >
            {title}
          </h2>
        </div>
      </header>
      <div className="guide-prose">{children}</div>
    </section>
  );
}
