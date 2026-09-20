import type { ExampleData } from "@/lib/guides/model";
import { ImageBlock } from "./image-block";
import { Inline } from "./rich-text";
import { ui } from "./ui";

/**
 * Varios ejemplos de negocios distintos con el mismo método: cambia el contexto, no la
 * técnica. Cada uno explica qué se decide y por qué (nunca resultados comerciales inventados).
 */
export function ExamplesSection({ examples }: { examples: ExampleData[] }) {
  return (
    <div className={ui.block}>
      <ul className="grid gap-5 @4xl:grid-cols-2">
        {examples.map((example) => (
          <li key={example.id} className="flex min-w-0 flex-col rounded-2xl border bg-background p-5 sm:p-6">
            <p className={example.fictional ? ui.tag : ui.tagNeutral}>{example.fictional ? "Ejemplo ficticio" : "Ejemplo"}</p>
            <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-guide-ink">{example.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{example.business}</p>

            <p className="mt-4 text-[0.95rem] leading-relaxed text-foreground/90">
              <Inline text={example.scenario} />
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-guide-surface p-4">
              {example.keyData.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="mt-0.5 text-[0.9rem] font-semibold leading-snug text-guide-ink tabular-nums">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 space-y-3 text-[0.93rem] leading-relaxed text-foreground/90">
              <p>
                <span className="font-semibold text-guide-ink">Cómo se aplica: </span>
                <Inline text={example.approach} />
              </p>
              <p>
                <span className="font-semibold text-guide-ink">Qué se decide: </span>
                <Inline text={example.decision} />
              </p>
            </div>

            {example.image && <ImageBlock image={example.image} className="mt-5" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
