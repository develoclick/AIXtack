import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FloatingIllustration } from "@/components/visual/floating-illustration";
import { guidePath } from "@/lib/guides/constants";
import type { GuideSummary } from "@/lib/guides/types";
import { GuideCard } from "./guide-card";
import { ui } from "./ui";

/**
 * Guías relacionadas: solo las que existen y son visibles. Las planificadas que aún no se han
 * escrito NO se enlazan (nada de enlaces rotos ni artificiales); en desarrollo se listan como
 * «Pendientes» para que el equipo lo vea.
 */
export function RelatedGuides({ guides, pending = [] }: { guides: GuideSummary[]; pending?: { slug: string; title: string }[] }) {
  if (guides.length === 0 && pending.length === 0) return null;

  return (
    <section aria-labelledby="relacionadas-titulo" className="not-prose relative border-t pt-14">
      <FloatingIllustration
        file="guia-relacionadas.png"
        width={1200}
        height={900}
        speed={0.05}
        className="absolute -top-28 right-0 z-0 w-56"
        purpose="Asistente asomando por el borde inferior con una ficha (ver docs/rediseno/PLAN.md, imagen-10)."
      />
      <p className={ui.eyebrow}>Sigue por aquí</p>
      <h2 id="relacionadas-titulo" className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-guide-ink sm:text-4xl">
        Guías relacionadas
      </h2>

      {guides.length > 0 && (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {guides.map((guide, index) => (
            <li key={guide.slug} className={guides.length >= 3 && index === 0 ? "sm:col-span-2" : undefined}>
              <GuideCard guide={guide} variant={guides.length >= 3 && index === 0 ? "feature" : "card"} />
            </li>
          ))}
        </ul>
      )}

      {pending.length > 0 && (
        <div className="mt-6 rounded-xl border border-dashed p-4 text-sm text-muted-foreground" data-dev-only>
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em]">Solo en desarrollo · guías relacionadas aún sin escribir</p>
          <ul className="mt-2 list-disc space-y-0.5 pl-5">
            {pending.map((item) => (
              <li key={item.slug}>
                {item.title} <span className="font-mono text-xs">({item.slug})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Guía anterior y siguiente dentro de la misma categoría, en el orden editorial. */
export function GuideNeighbours({ previous, next }: { previous: GuideSummary | null; next: GuideSummary | null }) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="Guías anterior y siguiente" className="not-prose mt-10 grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Link href={guidePath(previous)} rel="prev" className="guide-focus guide-lift group rounded-xl border p-4 hover:border-brand/50">
          <span className="flex items-center gap-1.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <ArrowLeft className="size-3.5" aria-hidden /> Anterior
          </span>
          <span className="mt-1.5 block text-[0.95rem] font-semibold leading-snug text-guide-ink group-hover:text-brand">{previous.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link href={guidePath(next)} rel="next" className="guide-focus guide-lift group rounded-xl border p-4 text-right hover:border-brand/50">
          <span className="flex items-center justify-end gap-1.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Siguiente <ArrowRight className="size-3.5" aria-hidden />
          </span>
          <span className="mt-1.5 block text-[0.95rem] font-semibold leading-snug text-guide-ink group-hover:text-brand">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
