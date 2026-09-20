import type { FrameworkData } from "@/lib/guides/model";
import { BigIndex } from "@/components/visual/big-index";
import { Inline, RichText } from "./rich-text";
import { ui } from "./ui";

/**
 * Marco de trabajo: los conceptos que ordenan la guía, cada uno con su versión «en palabras
 * simples» (para quien parte de cero), el detalle y, si ayuda, un ejemplo. Composición en filas
 * asimétricas: la idea simple a un lado y el detalle al otro.
 */
export function FrameworkSection({ data }: { data: FrameworkData }) {
  return (
    <div className={ui.block}>
      <RichText text={data.intro} />
      <ol className="mt-8 border-t">
        {data.blocks.map((block, index) => (
          <li key={block.title} className="grid gap-x-8 gap-y-3 border-b py-8 @3xl:grid-cols-[4.5rem_minmax(0,5fr)_minmax(0,7fr)]">
            <BigIndex value={index + 1} className="text-5xl text-brand @3xl:text-6xl" />
            <div>
              <h3 className={`${ui.h3} mt-1`}>{block.title}</h3>
              {block.simple && (
                <p className="mt-2 rounded-lg border-l-[3px] border-brand bg-guide-surface px-3.5 py-2.5 text-[0.93rem] leading-snug text-guide-ink">
                  <span className="font-semibold">En palabras simples: </span>
                  <Inline text={block.simple} />
                </p>
              )}
            </div>
            <div>
              <p className="text-[0.97rem] leading-relaxed text-foreground/90">
                <Inline text={block.detail} />
              </p>
              {block.example && (
                <p className="mt-3 text-[0.93rem] leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-guide-ink">Ejemplo: </span>
                  <Inline text={block.example} />
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
