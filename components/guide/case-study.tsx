import type { CaseStudyData } from "@/lib/guides/model";
import { ImageBlock } from "./image-block";
import { Inline, RichText } from "./rich-text";
import { ui } from "./ui";

const NARRATIVE = [
  { key: "situation", label: "Situación" },
  { key: "goal", label: "Objetivo" },
  { key: "problem", label: "El problema concreto" },
  { key: "application", label: "Cómo se aplicó el método" },
  { key: "result", label: "Resultado" },
] as const;

/**
 * Caso práctico del que parte toda la guía. Un caso inventado se etiqueta siempre como
 * «CASO FICTICIO»; uno real exige `evidence` (validado en el build).
 */
export function CaseStudy({ data }: { data: CaseStudyData }) {
  return (
    <div className={ui.block}>
      <article className="overflow-hidden rounded-[2rem] border bg-paper-2 shadow-soft">
        <header className="dark flex flex-wrap items-center gap-x-3 gap-y-2 bg-ink px-5 py-5 text-foreground sm:px-7">
          <span className={ui.tag}>{data.fictional ? "Caso ficticio" : "Caso real"}</span>
          <h3 className="text-lg font-semibold tracking-tight">{data.business}</h3>
        </header>

        <div className="grid gap-0 @3xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
          <dl className="space-y-3 border-b p-5 @3xl:border-b-0 @3xl:border-r sm:p-6">
            <p className={ui.eyebrow}>Datos del caso</p>
            {data.data.map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="mt-0.5 text-[0.95rem] font-semibold leading-snug text-guide-ink tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-5 p-5 sm:p-6">
            {NARRATIVE.map(({ key, label }) => (
              <div key={key}>
                <p className={ui.eyebrow}>{label}</p>
                <div className="mt-1.5">
                  <RichText text={data[key]} className="text-[0.97rem] leading-[1.7] text-foreground/90 [&:not(:first-child)]:mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="border-t bg-background px-5 py-3 text-sm leading-snug text-muted-foreground sm:px-6">
          {data.fictional ? (
            <>Negocio, cifras y decisiones inventados para ilustrar el método. No son datos de un negocio real ni una promesa de resultados.</>
          ) : (
            <>
              <span className="font-semibold text-guide-ink">Fuente: </span>
              <Inline text={data.evidence ?? ""} />
            </>
          )}
        </footer>
      </article>

      {data.image && <ImageBlock image={data.image} className="mt-6" />}
    </div>
  );
}
