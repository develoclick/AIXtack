import Link from "next/link";
import type {
  ApplicationData,
  ConclusionData,
  LimitationsData,
  MistakeData,
  PersonalizationData,
  VariationsData,
} from "@/lib/guides/model";
import { Inline, RichText } from "./rich-text";
import { ui } from "./ui";

/** Errores frecuentes: qué se hace mal, por qué perjudica y qué hacer en su lugar. */
export function CommonMistakes({ items }: { items: MistakeData[] }) {
  return (
    <div className={ui.block}>
      <ol className="space-y-5">
        {items.map((mistake, index) => (
          <li key={mistake.title} className="grid gap-x-5 gap-y-2 border-t pt-5 @2xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] first:border-t-0 first:pt-0">
            <div className="flex gap-3">
              <span className="font-mono text-[0.72rem] font-medium tracking-[0.1em] text-risk">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-[1rem] font-semibold leading-snug text-guide-ink">{mistake.title}</h3>
            </div>
            <div className="space-y-2 text-[0.95rem] leading-relaxed text-foreground/90">
              <p>
                <span className="font-semibold text-guide-ink">Por qué perjudica: </span>
                <Inline text={mistake.whyItHurts} />
              </p>
              <p>
                <span className="font-semibold text-ok">En su lugar: </span>
                <Inline text={mistake.instead} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Cómo adaptar el método a otro negocio: qué dimensiones cambian y cómo. */
export function Personalization({ data }: { data: PersonalizationData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />
      <dl className="mt-6 grid gap-x-8 gap-y-5 @2xl:grid-cols-2">
        {data.dimensions.map((dimension) => (
          <div key={dimension.title} className="border-t pt-4">
            <dt className="text-[1rem] font-semibold text-guide-ink">{dimension.title}</dt>
            <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-muted-foreground">
              <Inline text={dimension.how} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Cómo llevarlo a la práctica esta semana, paso a paso. */
export function ApplicationSteps({ data }: { data: ApplicationData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />
      <ol className="mt-6 space-y-4">
        {data.steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-guide-surface font-mono text-[0.72rem] font-semibold text-guide-ink"
            >
              {index + 1}
            </span>
            <div>
              <h3 className="text-[1rem] font-semibold leading-snug text-guide-ink">
                <span className="sr-only">Paso {index + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-foreground/90">
                <Inline text={step.detail} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Variaciones del prompt para otros objetivos: qué cambiar y por qué. */
export function Variations({ data }: { data: VariationsData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />
      <ul className="mt-6 grid gap-4 @2xl:grid-cols-2">
        {data.items.map((item) => (
          <li key={item.title} className="rounded-xl border bg-background p-5">
            <h3 className={ui.h4}>{item.title}</h3>
            <p className="mt-1.5 text-[0.93rem] leading-relaxed text-foreground/90">
              <Inline text={item.description} />
            </p>
            <p className="mt-3 break-words rounded-md border-l-2 border-brand bg-guide-surface px-3 py-2 font-mono text-[0.78rem] leading-relaxed text-guide-ink">
              {item.promptChange}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Lo que este método NO hace bien o NO puede hacer. Sin ellas, la guía no es honesta. */
export function Limitations({ data }: { data: LimitationsData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />
      <dl className="mt-6 space-y-4">
        {data.items.map((item) => (
          <div key={item.title} className="border-l-[3px] border-warn/60 pl-5">
            <dt className="text-[1rem] font-semibold text-guide-ink">{item.title}</dt>
            <dd className="mt-1 max-w-[var(--guide-measure)] text-[0.95rem] leading-relaxed text-foreground/90">
              <Inline text={item.detail} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Cierre: resumen, ideas para llevarse y, si existe, el siguiente paso recomendado. */
export function Conclusion({ data, next }: { data: ConclusionData; next?: { href: string; title: string } | null }) {
  return (
    <div className={ui.block}>
      <RichText text={data.summary} className="max-w-[var(--guide-measure)] text-[1.05rem] leading-[1.75] text-foreground [&:not(:first-child)]:mt-4" />
      <div className="mt-6 rounded-2xl border bg-guide-surface p-5 sm:p-6">
        <p className={ui.eyebrow}>Para llevarte</p>
        <ul className="mt-3 space-y-2.5">
          {data.takeaways.map((takeaway) => (
            <li key={takeaway} className="flex gap-3 text-[0.97rem] leading-snug text-foreground/90">
              <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand" />
              <span>
                <Inline text={takeaway} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      {next && (
        <p className="mt-6 text-[0.95rem] text-muted-foreground">
          Siguiente paso recomendado:{" "}
          <Link href={next.href} className="guide-focus font-semibold text-brand underline underline-offset-4">
            {next.title}
          </Link>
        </p>
      )}
    </div>
  );
}
