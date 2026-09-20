import { ArrowDown, ArrowRight } from "lucide-react";
import type { BeforeAfterData } from "@/lib/guides/model";
import { ContentParts } from "./content-parts";
import { ImageBlock } from "./image-block";
import { Inline } from "./rich-text";
import { ui } from "./ui";

function Side({ label, tone, parts }: { label: string; tone: "before" | "after"; parts: BeforeAfterData["before"]["parts"] }) {
  return (
    <div className={`min-w-0 rounded-2xl border p-5 ${tone === "before" ? "bg-guide-surface" : "border-brand/40 bg-background"}`}>
      <p className={tone === "before" ? ui.tagNeutral : ui.tag}>{label}</p>
      <div className="mt-4">
        <ContentParts parts={parts} />
      </div>
    </div>
  );
}

/**
 * Comparación antes / después. En columna estrecha (móvil) se apila en vertical; con
 * espacio, se coloca en dos columnas. Admite texto, listas, código, tablas e imágenes.
 */
export function BeforeAfter({ data }: { data: BeforeAfterData }) {
  return (
    <div className={ui.block}>
      <div className="grid items-stretch gap-3 @3xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @3xl:gap-4">
        <Side label={data.before.label ?? "Antes"} tone="before" parts={data.before.parts} />
        <div className="flex items-center justify-center text-muted-foreground" aria-hidden>
          <ArrowDown className="size-5 @3xl:hidden" />
          <ArrowRight className="hidden size-5 @3xl:block" />
        </div>
        <Side label={data.after.label ?? "Después"} tone="after" parts={data.after.parts} />
      </div>
      <p className="mt-5 max-w-[var(--guide-measure)] border-l-[3px] border-brand pl-5 text-[0.97rem] leading-relaxed text-guide-ink">
        <span className="font-semibold">Lo que cambia: </span>
        <Inline text={data.takeaway} />
      </p>
      {data.image && <ImageBlock image={data.image} className="mt-6" />}
    </div>
  );
}
