import type { DataPreparationData, ToolsData } from "@/lib/guides/model";
import { ImageBlock } from "./image-block";
import { Inline, RichText } from "./rich-text";
import { ui } from "./ui";

/** Los datos que la persona debe reunir ANTES de escribirle nada a la IA. */
export function DataPreparation({ data }: { data: DataPreparationData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />

      <ul className="mt-6 divide-y rounded-xl border bg-background">
        {data.items.map((item) => (
          <li key={item.label} className="grid gap-2 px-4 py-4 @2xl:grid-cols-[13rem_minmax(0,1fr)] @2xl:gap-6 sm:px-5">
            <div>
              <p className="text-[0.97rem] font-semibold leading-snug text-guide-ink">{item.label}</p>
              <p className={`mt-1.5 ${item.required ? ui.tag : ui.tagNeutral}`}>{item.required ? "Imprescindible" : "Si lo tienes"}</p>
            </div>
            <div>
              <p className="text-[0.95rem] leading-relaxed text-foreground/90">
                <Inline text={item.detail} />
              </p>
              {item.example && (
                <p className="mt-2 break-words rounded-md bg-guide-surface px-3 py-2 font-mono text-[0.8rem] leading-relaxed text-muted-foreground">
                  {item.example}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {data.image && <ImageBlock image={data.image} className="mt-8" />}
    </div>
  );
}

/** Herramientas necesarias, descritas por lo que hacen (sin depender de una marca concreta). */
export function ToolsSection({ data }: { data: ToolsData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />
      <ul className="mt-6 grid gap-4 @2xl:grid-cols-2">
        {data.items.map((tool) => (
          <li key={tool.name} className="rounded-xl border bg-background p-5">
            <h3 className={ui.h4}>{tool.name}</h3>
            <p className="mt-1.5 text-[0.93rem] leading-relaxed text-foreground/90">
              <Inline text={tool.role} />
            </p>
            {tool.examples && tool.examples.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-1.5">
                {tool.examples.map((example) => (
                  <span key={example} className={ui.chip}>
                    {example}
                  </span>
                ))}
              </p>
            )}
            {tool.note && (
              <p className="mt-3 text-sm leading-snug text-muted-foreground">
                <Inline text={tool.note} />
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
