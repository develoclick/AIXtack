import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { GuideCard } from "@/components/guide/guide-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { AuroraRibbon } from "@/components/visual/aurora-ribbon";
import { BigIndex } from "@/components/visual/big-index";
import { FloatingIllustration } from "@/components/visual/floating-illustration";
import { Reveal } from "@/components/visual/reveal";
import { categories, getCategory } from "@/content/categorias";
import { mediaExists } from "@/lib/guides/media";
import { listGuidesByCategory, toSummary } from "@/lib/guides/registry";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ categoria: string }>;
}

// Solo existen los hubs del registro content/categorias.ts. Cualquier otro
// primer segmento devuelve 404 real (y no colisiona con /guias, /contacto, etc.,
// que son rutas estáticas con prioridad).
export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((category) => ({ categoria: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) return {};

  return buildMetadata({ title: category.title, description: category.description, path: `/${category.slug}` });
}

export default async function CategoryHubPage({ params }: PageProps) {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) notFound();

  const guides = (await listGuidesByCategory(category.slug)).map(toSummary);
  const [featured, second, third, ...rest] = guides;
  const others = categories.filter((item) => item.slug !== category.slug);
  const breadcrumbs = [{ name: category.name, path: `/${category.slug}` }];
  const [lead, ...intro] = category.intro;
  // Con la ilustración del área, el nombre en contorno sobra: los dos ocuparían el mismo lugar.
  const hasArt = mediaExists(`/images/site/area-${category.slug}.png`);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbs]),
          collectionPageJsonLd({
            name: category.title,
            description: category.description,
            path: `/${category.slug}`,
            guides,
          }),
        ]}
      />

      {/* ── Cabecera: nombre del área enorme detrás del título y objeto 3D que sobresale ── */}
      <header className="relative isolate overflow-hidden border-b">
        <div aria-hidden className="bg-lines absolute inset-x-0 top-0 -z-10 h-full opacity-60" />
        <AuroraRibbon className="-right-[14%] top-[4%] -z-10 hidden h-[24rem] w-[58%] lg:block" />
        {!hasArt && (
          <span
            aria-hidden
            className="numeral-outline pointer-events-none absolute -bottom-10 -right-6 -z-10 hidden select-none whitespace-nowrap text-[clamp(6rem,15vw,13rem)] text-foreground/30 xl:block"
          >
            {category.name}
          </span>
        )}
        <FloatingIllustration
          file={`area-${category.slug}.png`}
          width={1200}
          height={1200}
          speed={0.07}
          sizes="(min-width: 1280px) 26rem, 22rem"
          className="absolute bottom-10 right-[6%] z-10 w-[20rem] xl:w-[40rem]"
          purpose={`Objeto 3D del área ${category.name} (ver docs/rediseno/PLAN.md).`}
        />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <Breadcrumbs items={breadcrumbs} />
          <Reveal className="max-w-3xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand">{category.name}</p>
            <h1 className="text-display mt-4 text-balance">{category.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{category.description}</p>
          </Reveal>
        </div>
      </header>

      {/* ── Introducción editorial a dos voces ──────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20 lg:px-8 lg:py-24">
        <Reveal>
          <p className="text-balance text-2xl font-medium leading-snug tracking-tight sm:text-[1.75rem]">{lead}</p>
        </Reveal>
        <div className="space-y-5 text-[17px] leading-relaxed text-foreground/90">
          {intro.map((paragraph, index) => (
            <Reveal key={index} delay={index * 80}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Situaciones: franja de tinta con numerales ──────────────────────────────── */}
      <section aria-labelledby="situaciones" className="dark relative isolate overflow-hidden bg-ink text-foreground">
        <div aria-hidden className="bg-lines-dark absolute inset-0 -z-10" />
        <AuroraRibbon soft className="-left-[10%] -top-24 -z-10 h-[22rem] w-[70%]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20 lg:px-8 lg:py-24">
          <Reveal>
            <h2 id="situaciones" className="text-display-md text-balance">
              Situaciones que ayudan a resolver estas guías
            </h2>
          </Reveal>
          <ul className="border-t border-white/15">
            {category.problems.map((problem, index) => (
              <li key={index} className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-white/15 py-6 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
                <BigIndex value={index + 1} className="text-4xl text-brand sm:text-5xl" />
                <Reveal delay={index * 70}>
                  <p className="text-lg leading-snug tracking-tight text-foreground/90 sm:text-xl">{problem}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Guías del área: una destacada, dos medianas y filas ─────────────────────── */}
      <section aria-labelledby="guias-de-la-categoria" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <h2 id="guias-de-la-categoria" className="text-display-md text-balance">
            Guías de {category.name}
          </h2>
        </Reveal>

        {guides.length > 0 ? (
          <>
            <div className="mt-12 grid gap-5 lg:grid-cols-12">
              {featured && (
                <Reveal className={second ? "lg:col-span-7 h-fit" : "lg:col-span-12 h-fit"}>
                  <GuideCard guide={featured} showCategory={false} variant="feature" />
                </Reveal>
              )}
              {second && (
                <div className="flex flex-col gap-5 lg:col-span-5">
                  <Reveal delay={100} className="flex-1">
                    <GuideCard guide={second} showCategory={false} />
                  </Reveal>
                  {third && (
                    <Reveal delay={180} className="flex-1">
                      <GuideCard guide={third} showCategory={false} />
                    </Reveal>
                  )}
                </div>
              )}
            </div>
            {rest.length > 0 && (
              <ul className="mt-12 grid gap-x-14 lg:grid-cols-2">
                {rest.map((guide, index) => (
                  <li key={guide.slug}>
                    <GuideCard guide={guide} showCategory={false} variant="row" index={index + 4} />
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="mt-4 text-muted-foreground">Estamos preparando las primeras guías de esta categoría.</p>
        )}
      </section>

      {/* ── Otras áreas: enlaces grandes ────────────────────────────────────────────── */}
      <nav aria-label="Otras áreas" className="border-t bg-paper-2">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Otras áreas de tu negocio</p>
          <ul className="mt-6 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((item) => (
              <li key={item.slug} className="border-b">
                <Link href={`/${item.slug}`} className="guide-focus group flex items-center justify-between gap-3 py-5 text-2xl font-semibold tracking-tight transition-colors hover:text-brand">
                  {item.name}
                  <ArrowRight className="size-5 -translate-x-1 opacity-40 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link href="/guias" className="pill-link border-brand/40 font-medium text-brand">
              Ver todas las guías <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </p>
        </div>
      </nav>
    </>
  );
}
