import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GuideCard } from "@/components/guide/guide-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { AuroraRibbon } from "@/components/visual/aurora-ribbon";
import { BigIndex } from "@/components/visual/big-index";
import { FloatingIllustration } from "@/components/visual/floating-illustration";
import { Reveal } from "@/components/visual/reveal";
import { categories } from "@/content/categorias";
import { listGuides, toSummary } from "@/lib/guides/registry";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

const TITLE = "Guías prácticas de IA para tu negocio";
const DESCRIPTION =
  "Biblioteca de soluciones con IA para tareas reales de pequeños negocios: anuncios, promociones, clientes, precios, análisis y organización, explicadas paso a paso.";

export const metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: "/guias" });

export default async function GuidesLibraryPage() {
  const guides = (await listGuides()).map(toSummary);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Guías", path: "/guias" },
          ]),
          collectionPageJsonLd({ name: TITLE, description: DESCRIPTION, path: "/guias", guides }),
        ]}
      />

      {/* ── Cabecera: título grande, contadores y navegación por áreas ─────────────── */}
      <header className="relative isolate overflow-hidden border-b">
        <div aria-hidden className="bg-lines absolute inset-x-0 top-0 -z-10 h-full opacity-60" />
        <AuroraRibbon className="-right-[12%] top-[10%] -z-10 hidden h-[24rem] w-[58%] lg:block" />
        <FloatingIllustration
          file="guias-cabecera.png"
          width={1600}
          height={900}
          speed={0.05}
          sizes="(min-width: 1280px) 32rem, 28rem"
          className="absolute -bottom-3 right-[3%] z-0 w-[28rem] xl:w-[32rem]"
          purpose="Abanico de cinco libros de colores con una cinta de degradado (ver docs/rediseno/PLAN.md, imagen-09)."
        />

        <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-14">
          <Breadcrumbs items={[{ name: "Guías", path: "/guias" }]} />
          <div className="max-w-3xl">
            <Reveal>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand">Biblioteca</p>
              <h1 className="text-display mt-4 text-balance">{TITLE}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Cada guía parte de una tarea concreta de tu negocio y te lleva desde el problema hasta un resultado que puedes usar: qué información reunir,
                qué pedirle a la IA, cómo cambia el resultado con un buen pedido, cómo mejorarlo y qué revisar antes de aplicarlo.
              </p>
            </Reveal>
            <Reveal delay={120} className="mt-10 flex items-end gap-10">
              <p className="flex items-baseline gap-2">
                <span className="text-6xl font-semibold tracking-tight tabular-nums">{guides.length}</span>
                <span className="text-sm text-muted-foreground">{guides.length === 1 ? "guía" : "guías"}</span>
              </p>
              <p className="flex items-baseline gap-2">
                <span className="text-6xl font-semibold tracking-tight tabular-nums text-brand">{categories.length}</span>
                <span className="text-sm text-muted-foreground">áreas</span>
              </p>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ── Navegación por áreas (anclas) ───────────────────────────────────────────── */}
      <nav aria-label="Áreas de la biblioteca" className="sticky top-[60px] z-30 border-b bg-background/85 backdrop-blur-xl">
        <ul className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8 [scrollbar-width:none]">
          {categories.map((category) => (
            <li key={category.slug} className="shrink-0">
              <a href={`#cat-${category.slug}`} className="pill-link">
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Áreas: rótulo fijo a la izquierda, filas a la derecha ───────────────────── */}
      <div>
        {categories.map((category, categoryIndex) => {
          const items = guides.filter((guide) => guide.category === category.slug);

          return (
            <section key={category.slug} aria-labelledby={`cat-${category.slug}`} className={cn("scroll-mt-28 border-b", categoryIndex % 2 === 1 && "bg-paper-2")}>
              <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16 lg:px-8 lg:py-20">
                <div className="lg:sticky lg:top-40 lg:self-start">
                  <BigIndex value={categoryIndex + 1} variant="soft" className="text-7xl text-foreground lg:text-8xl" />
                  <h2 id={`cat-${category.slug}`} className="text-display-md mt-4 scroll-mt-40">
                    {category.name}
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{category.description}</p>
                  <Link href={`/${category.slug}`} className="link-draw mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand">
                    Ver {category.name} <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>

                {items.length > 0 ? (
                  <ul>
                    {items.map((guide, index) => (
                      <li key={guide.slug}>
                        <GuideCard guide={guide} showCategory={false} variant="row" index={index + 1} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Estamos preparando las primeras guías de esta categoría.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
