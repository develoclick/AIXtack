import { Inline } from "@/components/guide/rich-text";
import type { PreguntaFrecuente } from "@/lib/herramientas/tipos";

/** Bloque 11: preguntas frecuentes (4–6) con `details`, sin JavaScript. */
export function Faq({ preguntas }: { preguntas: PreguntaFrecuente[] }) {
  return (
    <div className="divide-y rounded-xl border bg-background">
      {preguntas.map((f) => (
        <details key={f.p} className="group px-4 py-1 sm:px-5">
          <summary className="guide-focus flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 text-[1rem] font-semibold text-guide-ink">
            {f.p}
            <span aria-hidden className="shrink-0 text-lg text-muted-foreground transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-3 text-[0.97rem] leading-relaxed text-foreground/90">
            <Inline text={f.r} />
          </p>
        </details>
      ))}
    </div>
  );
}
