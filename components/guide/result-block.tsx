import type { AnalysisData, GuidePrompt, IterationData, ResultData, RubricData } from "@/lib/guides/model";
import { ui, verdictStyle } from "./ui";
import { cn } from "@/lib/utils";
import { ContentParts } from "./content-parts";
import { ImageBlock } from "./image-block";
import { Inline, RichText } from "./rich-text";
import { PromptBlock } from "./prompt-block";

const KIND_LABEL: Record<ResultData["kind"], string> = {
  generated: "Ejemplo generado para esta guía",
  userData: "Datos del usuario",
};

/**
 * Resultado de la IA (o datos que aporta la persona). Se etiqueta siempre de dónde sale:
 * «EJEMPLO GENERADO PARA ESTA GUÍA» frente a «DATOS DEL USUARIO». Nada se presenta como
 * resultado real de un negocio.
 */
export function ResultBlock({ data, title }: { data: ResultData; title?: string }) {
  return (
    <div className={ui.block}>
      <figure className="overflow-hidden rounded-2xl border bg-guide-surface">
        <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b bg-background px-5 py-3">
          <span className={data.kind === "generated" ? ui.tag : ui.tagNeutral}>{KIND_LABEL[data.kind]}</span>
          {title && <span className="text-sm font-semibold text-guide-ink">{title}</span>}
        </figcaption>
        <div className="space-y-4 p-5 sm:p-6">
          {data.intro && <RichText text={data.intro} className="text-[0.95rem] leading-relaxed text-muted-foreground" />}
          <ContentParts parts={data.parts} />
        </div>
      </figure>
      {data.image && <ImageBlock image={data.image} className="mt-6" />}
    </div>
  );
}

/** Lectura crítica del resultado: qué está bien, qué se puede mejorar y qué es un riesgo. */
export function ResultAnalysis({ data, rubric }: { data: AnalysisData; /** Si se pasa, cada criterio con `criterionId` toma su nombre de aquí (fuente única). */ rubric?: RubricData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />

      <ul className="mt-6 divide-y rounded-xl border bg-background">
        {data.criteria.map((item, index) => {
          const verdict = verdictStyle[item.verdict];
          const label = (item.criterionId ? rubric?.criteria.find((criterion) => criterion.id === item.criterionId)?.label : undefined) ?? item.criterion ?? item.criterionId ?? "";
          return (
            <li key={item.criterionId ?? item.criterion ?? index} className="grid gap-2 px-4 py-4 @2xl:grid-cols-[11rem_minmax(0,1fr)] @2xl:gap-6 sm:px-5">
              <div>
                <p className="text-[0.95rem] font-semibold leading-snug text-guide-ink">{label}</p>
                <p className={cn("mt-1.5 inline-flex rounded-md px-2 py-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em]", verdict.className)}>
                  {verdict.label}
                </p>
              </div>
              <p className="text-[0.95rem] leading-relaxed text-foreground/90">
                <Inline text={item.comment} />
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 border-l-[3px] border-brand pl-5">
        <p className={ui.eyebrow}>Conclusión del análisis</p>
        <div className="mt-1.5">
          <RichText text={data.conclusion} />
        </div>
      </div>
    </div>
  );
}

/** Iteración: el mensaje de seguimiento que corrige lo detectado en el análisis. */
export function IterationBlock({ data, prompt }: { data: IterationData; /** Opcional: si el prompt ya se muestra en su propia sección, no se repite aquí. */ prompt?: GuidePrompt }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />
      <div className="mt-5 rounded-xl border bg-guide-surface px-5 py-4">
        <p className={ui.eyebrow}>Por qué se itera</p>
        <div className="mt-1.5">
          <RichText text={data.why} className="text-[0.95rem] leading-relaxed text-foreground/90 [&:not(:first-child)]:mt-3" />
        </div>
      </div>
      {prompt && <PromptBlock prompt={prompt} />}
      {data.image && <ImageBlock image={data.image} className="mt-6" />}
    </div>
  );
}
