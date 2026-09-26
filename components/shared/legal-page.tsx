import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { formatDate } from "@/lib/utils/format";

/** Contenedor común de las páginas institucionales de texto (sobre nosotros, contacto, privacidad, cookies, términos). */
export function LegalPage({ title, updatedAt, eyebrow = "Legal", children }: { title: string; updatedAt: string; eyebrow?: string; children: ReactNode }) {
  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: title }]} />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-[var(--tracking-display)] sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Última actualización: <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="prose prose-neutral max-w-none dark:prose-invert prose-a:text-brand prose-h2:tracking-tight prose-headings:scroll-mt-28">{children}</div>
      </div>
    </>
  );
}
