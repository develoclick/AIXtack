import type { ReactNode } from "react";
import { EditorialHero } from "@/components/visual/editorial-hero";
import { FloatingIllustration } from "@/components/visual/floating-illustration";
import { formatDate } from "@/lib/utils/format";

/** Contenedor común de las páginas institucionales de texto (privacidad, cookies, términos). */
export function LegalPage({ title, updatedAt, children }: { title: string; updatedAt: string; children: ReactNode }) {
  return (
    <>
      <EditorialHero
        quiet
        eyebrow="Legal"
        title={title}
        aside={
          <FloatingIllustration
            file="legal-escudo.png"
            width={800}
            height={800}
            speed={0.04}
            sizes="14rem"
            className="relative ml-auto hidden w-52 lg:block"
            purpose="Escudo redondeado con una casilla de verificación sobre una hoja."
          />
        }
      >
        <p className="mt-5 font-mono text-xs text-muted-foreground">
          Última actualización: <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
        </p>
      </EditorialHero>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="prose prose-neutral max-w-none dark:prose-invert prose-a:text-brand prose-h2:tracking-tight prose-headings:scroll-mt-28">{children}</div>
      </div>
    </>
  );
}
