import type { OutcomeData, ProblemData } from "@/lib/guides/model";
import { ImageBlock } from "./image-block";
import { Inline, RichText } from "./rich-text";
import { ui } from "./ui";

/** El problema real de la persona lectora: qué pasa, cómo se nota y por qué duele. */
export function ProblemSection({ data }: { data: ProblemData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.summary} className="max-w-[var(--guide-measure)] text-[1.08rem] leading-[1.75] text-foreground [&:not(:first-child)]:mt-4" />

      {data.symptoms.length > 0 && (
        <div className="mt-8">
          <p className={ui.eyebrow}>Te reconoces en esto si…</p>
          <ul className="mt-3 grid gap-3 @2xl:grid-cols-2">
            {data.symptoms.map((symptom) => (
              <li key={symptom} className="border-l-2 border-brand/50 py-0.5 pl-4 text-[0.97rem] leading-snug text-foreground/90">
                <Inline text={symptom} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.image && <ImageBlock image={data.image} className="mt-8" />}
    </div>
  );
}

/** Lo que la persona tendrá al terminar: entregables concretos, no promesas. */
export function OutcomeSection({ data }: { data: OutcomeData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.summary} className="max-w-[var(--guide-measure)] text-[1.05rem] leading-[1.75] text-foreground [&:not(:first-child)]:mt-4" />

      <dl className="mt-7 grid gap-x-8 gap-y-5 @2xl:grid-cols-2">
        {data.deliverables.map((item, index) => (
          <div key={item.label} className="border-t pt-4">
            <dt className="flex items-baseline gap-3 text-[1rem] font-semibold text-guide-ink">
              <span className="font-mono text-[0.72rem] font-medium tracking-[0.1em] text-brand">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </dt>
            <dd className="mt-1.5 pl-[2.1rem] text-[0.95rem] leading-relaxed text-muted-foreground">
              <Inline text={item.detail} />
            </dd>
          </div>
        ))}
      </dl>

      {data.image && <ImageBlock image={data.image} className="mt-8" />}
    </div>
  );
}
