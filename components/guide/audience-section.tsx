import { Check, Minus } from "lucide-react";
import type { AudienceData } from "@/lib/guides/model";
import { Inline } from "./rich-text";
import { ui } from "./ui";

/**
 * Para quién es la guía y para quién no. Composición deliberadamente asimétrica: la columna
 * «sí» es la principal; la de «no» es más estrecha y sobria, sin dramatismo.
 */
export function AudienceSection({ data }: { data: AudienceData }) {
  return (
    <div className={ui.block}>
      <div className="grid gap-8 @3xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] @3xl:gap-10">
        <div>
          <p className={ui.eyebrow}>Es para ti si…</p>
          <ul className="mt-3 space-y-3.5">
            {data.forWho.map((item) => (
              <li key={item} className="flex gap-3 text-[1rem] leading-relaxed text-foreground/90">
                <Check className="mt-1 size-4 shrink-0 text-ok" aria-hidden />
                <span>
                  <Inline text={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-6 @3xl:border-l @3xl:border-t-0 @3xl:pl-8 @3xl:pt-0">
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">Quizá no todavía si…</p>
          <ul className="mt-3 space-y-3">
            {data.notForWho.map((item) => (
              <li key={item} className="flex gap-3 text-[0.93rem] leading-relaxed text-muted-foreground">
                <Minus className="mt-1 size-4 shrink-0" aria-hidden />
                <span>
                  <Inline text={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
