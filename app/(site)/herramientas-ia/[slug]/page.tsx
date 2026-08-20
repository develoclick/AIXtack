import { notFound } from "next/navigation";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/shared/rating-stars";
import { AffiliateCta } from "@/components/affiliate/affiliate-cta";
import { DisclosureBanner } from "@/components/affiliate/disclosure-banner";
import Link from "next/link";
import { CategoryBadge } from "@/components/shared/category-badge";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PhotoCredit } from "@/components/shared/photo-credit";
import { InArticleAd } from "@/components/ads/in-article-ad";
import { ToolGrid } from "@/components/tools/tool-grid";
import { getToolBySlug, getRelatedTools } from "@/lib/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { formatCurrency } from "@/lib/utils/format";
import toolsJson from "@/content/tools.json";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return (toolsJson as { slug: string }[]).map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return {};

  return buildMetadata({
    title: tool.seoTitle ?? `${tool.name} — Análisis, precios y alternativas`,
    description: tool.seoDescription ?? tool.tagline ?? tool.description.slice(0, 160),
    path: `/herramientas-ia/${tool.slug}`,
    image: tool.ogImage ?? undefined,
    keywords: tool.seoKeywords,
  });
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  const relatedTools = await getRelatedTools(tool, 3);

  const breadcrumbItems = [
    { name: "Herramientas IA", path: "/herramientas-ia" },
    { name: tool.name, path: `/herramientas-ia/${tool.slug}` },
  ];

  const jsonLd = [
    breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbItems]),
    softwareApplicationJsonLd(tool),
    ...(tool.faqItems.length > 0 ? [faqPageJsonLd(tool.faqItems)] : []),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {jsonLd.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbItems} />

      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
        <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-brand-muted/50 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted shadow-soft">
            {tool.logoUrl ? (
              <Image src={tool.logoUrl} alt={tool.name} width={64} height={64} className="object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">{tool.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">{tool.name}</h1>
            {tool.tagline && <p className="mt-1.5 text-muted-foreground">{tool.tagline}</p>}
            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              <RatingStars rating={tool.rating} />
              {tool.category && <CategoryBadge category={tool.category} prefix="/categoria" />}
              <Badge variant="secondary">
                {tool.pricingFrom
                  ? `Desde ${formatCurrency(tool.pricingFrom, tool.currency)}`
                  : tool.pricingModel === "FREE"
                    ? "Gratis"
                    : "Freemium"}
              </Badge>
            </div>
          </div>
          <AffiliateCta affiliateSlug={tool.affiliateSlug} websiteUrl={tool.websiteUrl} />
        </div>
        <PhotoCredit credit={tool.logoCredit} className="relative mt-4 text-xs text-muted-foreground" />
      </div>

      {tool.affiliateSlug && (
        <div className="mt-6">
          <DisclosureBanner />
        </div>
      )}

      <p className="mt-10 text-lg leading-relaxed text-muted-foreground">{tool.description}</p>

      {tool.screenshots.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tool.screenshots.map((src) => (
            <div key={src} className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
              <Image
                src={src}
                alt={`Captura de ${tool.name}`}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {tool.features.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Características principales</h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {tool.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(tool.pros.length > 0 || tool.cons.length > 0) && (
        <section className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {tool.pros.length > 0 && (
            <div className="rounded-2xl border bg-emerald-500/[0.04] p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Ventajas</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {tool.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tool.cons.length > 0 && (
            <div className="rounded-2xl border bg-destructive/[0.04] p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Desventajas</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {tool.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}



      {tool.conclusion && (
        <section className="mt-12 rounded-2xl border bg-muted/30 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Conclusión</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{tool.conclusion}</p>
        </section>
      )}

      {tool.faqItems.length > 0 && (
        <section className="mt-12 border-t pt-10">
          <h2 className="text-xl font-semibold">Preguntas frecuentes</h2>
          <div className="mt-4">
            <FaqAccordion
              items={tool.faqItems.map((item, index) => ({
                id: String(index),
                question: item.question,
                answer: item.answer,
                category: null,
              }))}
            />
          </div>
        </section>
      )}

      <div className="mt-14 flex justify-center border-t pt-10">
        <AffiliateCta
          affiliateSlug={tool.affiliateSlug}
          websiteUrl={tool.websiteUrl}
          label={`Probar ${tool.name}`}
        />
      </div>

      {tool.category && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Descubre más herramientas en{" "}
          <Link href={`/categoria/${tool.category.slug}`} className="text-brand underline underline-offset-2">
            {tool.category.name}
          </Link>
          {relatedTools.length > 0 && (
            <>
              , consulta{" "}
              <Link href={`/alternativas/${tool.slug}`} className="text-brand underline underline-offset-2">
                alternativas a {tool.name}
              </Link>
            </>
          )}{" "}
          o compara opciones en{" "}
          <Link href="/comparativas" className="text-brand underline underline-offset-2">
            nuestras comparativas
          </Link>
          .
        </p>
      )}

      {relatedTools.length > 0 && (
        <section className="mt-16 border-t pt-10">
          <h2 className="text-xl font-semibold">Herramientas similares</h2>
          <div className="mt-6">
            <ToolGrid tools={relatedTools} />
          </div>
        </section>
      )}
    </div>
  );
}
