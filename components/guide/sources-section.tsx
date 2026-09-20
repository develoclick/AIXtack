import { ExternalLink } from "lucide-react";
import type { SourcesData } from "@/lib/guides/model";
import { formatDate } from "@/lib/utils/format";
import { Inline, RichText } from "./rich-text";
import { ui } from "./ui";

/**
 * Fuentes consultadas, con su editor y la fecha REAL de consulta. Lo que puede cambiar
 * (límites, políticas de plataformas) se marca para volver a verificarlo.
 */
export function SourcesSection({ data }: { data: SourcesData }) {
  return (
    <div className={ui.block}>
      {data.intro && <RichText text={data.intro} />}
      <ol className="mt-6 divide-y rounded-xl border bg-background">
        {data.items.map((source, index) => (
          <li key={source.url} className="grid gap-x-6 gap-y-1.5 px-4 py-4 @2xl:grid-cols-[2rem_minmax(0,1fr)] sm:px-5">
            <span className="hidden font-mono text-[0.72rem] font-medium text-muted-foreground @2xl:block">{String(index + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="guide-focus inline-flex items-start gap-1.5 text-[0.98rem] font-semibold leading-snug text-guide-ink underline decoration-brand/50 underline-offset-4 hover:text-brand"
              >
                <span>{source.title}</span>
                <ExternalLink className="mt-1 size-3.5 shrink-0" aria-hidden />
                <span className="sr-only">(se abre en una pestaña nueva)</span>
              </a>
              <p className="mt-1 text-sm text-muted-foreground">
                {source.publisher} · Consultada el <time dateTime={source.consultedAt}>{formatDate(source.consultedAt)}</time>
              </p>
              {source.note && (
                <p className="mt-2 text-[0.93rem] leading-relaxed text-foreground/90">
                  <Inline text={source.note} />
                </p>
              )}
              {source.mayExpire && <p className={`mt-2 ${ui.tagNeutral}`}>Puede cambiar: volver a verificar antes de publicar</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
