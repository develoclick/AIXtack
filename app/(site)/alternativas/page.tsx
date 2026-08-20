import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { listPublishedTools } from "@/lib/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import toolsJson from "@/content/tools.json";
import type { Metadata } from "next";

interface ToolRaw {
  slug: string;
  categorySlug: string;
}

export const metadata: Metadata = buildMetadata({
  title: "Alternativas a las principales herramientas de IA",
  description:
    "Compara alternativas a ChatGPT, Midjourney, GitHub Copilot y otras herramientas de inteligencia artificial populares, con precio y valoración.",
  path: "/alternativas",
});

export default async function AlternativesHubPage() {
  const tools = toolsJson as ToolRaw[];
  const countByCategory = new Map<string, number>();
  tools.forEach((t) => countByCategory.set(t.categorySlug, (countByCategory.get(t.categorySlug) ?? 0) + 1));
  const eligibleSlugs = new Set(
    tools.filter((t) => (countByCategory.get(t.categorySlug) ?? 0) > 1).map((t) => t.slug)
  );

  const { items } = await listPublishedTools({ pageSize: 200, sort: "name" });
  const withAlternatives = items.filter((tool) => eligibleSlugs.has(tool.slug));

  const breadcrumbItems = [{ name: "Alternativas", path: "/alternativas" }];
  const jsonLd = breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbItems]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={breadcrumbItems} />

      <SectionHeading
        eyebrow="Comparador"
        title="Alternativas a las principales herramientas de IA"
        description="Elige una herramienta para ver sus alternativas comparadas por precio y valoración dentro de la misma categoría."
      />

      <div className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {withAlternatives.map((tool) => (
          <Link
            key={tool.id}
            href={`/alternativas/${tool.slug}`}
            className="group flex items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm shadow-soft transition-colors hover:border-brand/30"
          >
            <span className="font-medium group-hover:text-brand">Alternativas a {tool.name}</span>
            {tool.category && <span className="shrink-0 text-xs text-muted-foreground">{tool.category.name}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
