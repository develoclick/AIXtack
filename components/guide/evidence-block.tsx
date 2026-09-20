import type { EvidenceData } from "@/lib/guides/model";
import { formatDate } from "@/lib/utils/format";
import { ImageBlock } from "./image-block";
import { Inline } from "./rich-text";
import { ui } from "./ui";

/**
 * Evidencia real aportada por una persona: prueba propia con fecha, capturas, nota de la autoría
 * o revisión humana. Solo se renderiza lo que existe; sin datos no aparece nada (ni siquiera un
 * marcador). Añadir evidencia a una guía es rellenar `data.evidence`, sin tocar el diseño.
 */
export function EvidenceBlock({ data }: { data?: EvidenceData }) {
  if (!data) return null;
  const { screenshots, ownTest, authorNote, review, casoReal, revisadoEn } = data;
  if (!screenshots?.length && !ownTest && !authorNote && !review && !casoReal && !revisadoEn) return null;

  return (
    <aside aria-label="Evidencia aportada por la autoría" className="not-prose mt-8 rounded-2xl border bg-guide-surface p-5 sm:p-6">
      <p className={ui.eyebrow}>Evidencia real</p>

      <div className="mt-3 space-y-5">
        {ownTest && (
          <div>
            <h3 className={ui.h4}>Prueba propia</h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              <time dateTime={ownTest.date}>{formatDate(ownTest.date)}</time>
            </p>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/90">
              <Inline text={ownTest.description} />
            </p>
            {ownTest.result && (
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/90">
                <span className="font-semibold text-guide-ink">Resultado: </span>
                <Inline text={ownTest.result} />
              </p>
            )}
          </div>
        )}

        {casoReal && (
          <div>
            <h3 className={ui.h4}>Caso real: {casoReal.titulo}</h3>
            {casoReal.fecha && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                <time dateTime={casoReal.fecha}>{formatDate(casoReal.fecha)}</time>
              </p>
            )}
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/90">
              <Inline text={casoReal.descripcion} />
            </p>
          </div>
        )}

        {authorNote && (
          <blockquote className="border-l-[3px] border-brand pl-4 text-[0.97rem] leading-relaxed text-foreground/90">
            <Inline text={authorNote.text} />
            {authorNote.author && <footer className="mt-1.5 text-sm text-muted-foreground">— {authorNote.author}</footer>}
          </blockquote>
        )}

        {screenshots && screenshots.length > 0 && (
          <div className="grid gap-4 @2xl:grid-cols-2">
            {screenshots.map((image) => (
              <ImageBlock key={image.src} image={image} />
            ))}
          </div>
        )}

        {revisadoEn && (
          <p className="text-sm text-muted-foreground">
            Guía revisada por su autor el <time dateTime={revisadoEn}>{formatDate(revisadoEn)}</time>.
          </p>
        )}

        {review && (
          <p className="text-sm text-muted-foreground">
            Revisada{review.reviewer ? ` por ${review.reviewer}` : ""} el <time dateTime={review.reviewedAt}>{formatDate(review.reviewedAt)}</time>.
            {review.notes ? ` ${review.notes}` : ""}
          </p>
        )}
      </div>
    </aside>
  );
}
