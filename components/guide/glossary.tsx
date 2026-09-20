import type { ReactNode } from "react";
import { getGlossaryEntry } from "@/content/glosario";
import { ui } from "./ui";

/**
 * Término del glosario compartido dentro de un texto: <Term id="prompt">prompt</Term>.
 * Enlaza a su definición en el glosario de la propia guía (que debe listarlo en `data.glossary`).
 */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  if (!getGlossaryEntry(id)) return <>{children}</>;
  return (
    <a
      href={`#gl-${id}`}
      className="guide-focus underline decoration-dotted decoration-brand underline-offset-4 hover:text-brand"
    >
      {children}
    </a>
  );
}

/** Definiciones de los términos que la guía usa (ids de `data.glossary`), tomadas del glosario compartido. */
export function GlossarySection({ ids }: { ids: string[] }) {
  const entries = ids.map((id) => getGlossaryEntry(id)).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  if (entries.length === 0) return null;

  return (
    <div className={ui.block}>
      <dl className="grid gap-x-10 gap-y-5 @2xl:grid-cols-2">
        {entries.map((entry) => (
          <div key={entry.id} id={`gl-${entry.id}`} className="scroll-mt-24 border-t pt-4">
            <dt className="text-[1rem] font-semibold text-guide-ink">{entry.term}</dt>
            <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-muted-foreground">{entry.simple}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
