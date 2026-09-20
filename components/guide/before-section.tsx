import { X } from "lucide-react";
import type { BeforeData } from "@/lib/guides/model";
import { ImageBlock } from "./image-block";
import { Inline, RichText } from "./rich-text";
import { ui } from "./ui";

/** «Antes»: cómo se pide normalmente, por qué el resultado no sirve y qué falla concretamente. */
export function BeforeSection({ data }: { data: BeforeData }) {
  return (
    <div className={ui.block}>
      <figure>
        <p className={ui.eyebrow}>Cómo suele pedirse</p>
        <blockquote className="mt-2 max-w-[var(--guide-measure)] rounded-xl border border-dashed bg-guide-surface px-5 py-4 font-mono text-[0.9rem] leading-relaxed text-guide-ink">
          {data.request}
        </blockquote>
      </figure>

      <div className="mt-6">
        <RichText text={data.whyInsufficient} />
      </div>

      <ul className="mt-6 grid gap-2.5 @2xl:grid-cols-2">
        {data.issues.map((issue) => (
          <li key={issue} className="flex gap-3 rounded-lg border bg-background px-4 py-3 text-[0.93rem] leading-snug text-foreground/90">
            <X className="mt-0.5 size-4 shrink-0 text-risk" aria-hidden />
            <span>
              <Inline text={issue} />
            </span>
          </li>
        ))}
      </ul>

      {data.image && <ImageBlock image={data.image} className="mt-8" />}
    </div>
  );
}
