import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { ToolGrid } from "@/components/tools/tool-grid";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { AffiliateCta } from "@/components/affiliate/affiliate-cta";
import { getToolBySlug, listPublishedTools } from "@/lib/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";
import { alternativesItemListJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/json-ld";
import { formatCurrency } from "@/lib/utils/format";
import toolsJson from "@/content/tools.json";
import type { Metadata } from "next";

interface ToolRaw {
  slug: string;
  categorySlug: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Solo generamos /alternativas/[slug] para herramientas que tienen al menos
 * un competidor real en su misma categoría — evita publicar páginas con un
 * listado de "alternativas" vacío (contenido pobre, mala señal para Google).
 */
export function generateStaticParams() {
  const tools = toolsJson as ToolRaw[];
  const countByCategory = new Map<string, number>();
  tools.forEach((t) => countByCategory.set(t.categorySlug, (countByCategory.get(t.categorySlug) ?? 0) + 1));
  return tools.filter((t) => (countByCategory.get(t.categorySlug) ?? 0) > 1).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool || !tool.category) return {};

  return buildMetadata({
    title: `Mejores alternativas a ${tool.name} en 2026`,
    description: `¿Buscas una alternativa a ${tool.name}? Compara precio, valoración y funciones de las mejores opciones de ${tool.category.name.toLowerCase()} en español.`,
    path: `/alternativas/${tool.slug}`,
  });
}

export default async function ToolAlternativesPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool || !tool.category) notFound();

  const { items: categoryTools } = await listPublishedTools({
    categorySlug: tool.category.slug,
    sort: "rating",
    pageSize: 24,
  });
  const alternatives = categoryTools.filter((item) => item.id !== tool.id);
  if (alternatives.length === 0) notFound();

  const topPick = alternatives[0];
  const cheapest = [...alternatives].sort((a, b) => {
    const priceA = a.pricingModel === "FREE" ? 0 : (a.pricingFrom ?? Infinity);
    const priceB = b.pricingModel === "FREE" ? 0 : (b.pricingFrom ?? Infinity);
    return priceA - priceB;
  })[0];

  const breadcrumbItems = [
    { name: "Herramientas IA", path: "/herramientas-ia" },
    { name: tool.name, path: `/herramientas-ia/${tool.slug}` },
    { name: "Alternativas", path: `/alternativas/${tool.slug}` },
  ];

  const faqItems = [
    {
      question: `¿Cuál es la mejor alternativa a ${tool.name}?`,
      answer: `Según nuestras valoraciones, ${topPick.name} es la alternativa mejor valorada dentro de ${tool.category.name.toLowerCase()}, con una puntuación de ${topPick.rating} sobre 5.`,
    },
    {
      question: `¿Hay alguna alternativa gratuita a ${tool.name}?`,
      answer:
        cheapest.pricingModel === "FREE"
          ? `Sí, ${cheapest.name} tiene un plan gratuito dentro de la misma categoría.`
          : `${cheapest.name} es la opción con el precio de entrada más bajo (${cheapest.pricingFrom ? formatCurrency(cheapest.pricingFrom, cheapest.currency) : "consulta su web"}) entre las alternativas de ${tool.category.name.toLowerCase()} que analizamos.`,
    },
    {
      question: `¿Por qué buscar una alternativa a ${tool.name}?`,
      answer:
        tool.cons.length > 0
          ? `Entre los motivos más habituales están: ${tool.cons.slice(0, 3).join("; ")}.`
          : `Cada herramienta se ajusta mejor a unas necesidades u otras — compara precio, funciones y curva de aprendizaje antes de decidir.`,
    },
  ];

  const jsonLd = [
    breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbItems]),
    alternativesItemListJsonLd(
      tool,
      alternatives.map((a) => ({ name: a.name, slug: a.slug }))
    ),
    faqPageJsonLd(faqItems),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {jsonLd.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbItems} />

      <SectionHeading
        eyebrow={`${alternatives.length} alternativas comparadas`}
        title={`Las mejores alternativas a ${tool.name}`}
        description={`${tool.name} es una herramienta de ${tool.category.name.toLowerCase()}, pero no es la única opción. Comparamos precio, valoración y funciones de las alternativas más relevantes para que elijas con criterio.`}
      />

      <div className="mt-10 rounded-2xl border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">En resumen</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          La alternativa mejor valorada a {tool.name} es <strong className="text-foreground">{topPick.name}</strong>{" "}
          ({topPick.rating}/5).{" "}
          {cheapest.id !== topPick.id && (
            <>
              Si buscas la opción más económica, <strong className="text-foreground">{cheapest.name}</strong>{" "}
              {cheapest.pricingModel === "FREE" ? "tiene plan gratuito." : "tiene el precio de entrada más bajo."}
            </>
          )}
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">
          {alternatives.length} alternativas a {tool.name}
        </h2>
        <div className="mt-6">
          <ToolGrid tools={alternatives} />
        </div>
      </section>

      <section className="mt-14 border-t pt-10">
        <h2 className="text-lg font-semibold">Preguntas frecuentes</h2>
        <div className="mt-4">
          <FaqAccordion
            items={faqItems.map((item, index) => ({
              id: String(index),
              question: item.question,
              answer: item.answer,
              category: null,
            }))}
          />
        </div>
      </section>

      <div className="mt-14 flex flex-col items-center gap-4 border-t pt-10 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Prefieres quedarte con {tool.name}? Consulta{" "}
          <Link href={`/herramientas-ia/${tool.slug}`} className="text-brand underline underline-offset-2">
            la ficha completa
          </Link>{" "}
          antes de decidir.
        </p>
        <AffiliateCta affiliateSlug={tool.affiliateSlug} websiteUrl={tool.websiteUrl} label={`Ir a ${tool.name}`} />
      </div>
    </div>
  );
}
