import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GuideAdSlot } from "@/components/guide/guide-ad-slot";
import { GuideHeader } from "@/components/guide/guide-header";
import { GuideToc } from "@/components/guide/guide-toc";
import { GuideNeighbours, RelatedGuides } from "@/components/guide/related-guides";
import { JsonLd } from "@/components/seo/json-ld";
import { ReadingProgress } from "@/components/visual/reading-progress";
import { getAuthor } from "@/content/autores";
import { getCategory } from "@/content/categorias";
import { guidePath } from "@/lib/guides/constants";
import { getGuide, getNeighbours, getPendingRelated, getRelatedGuides, listGuides, toSummary } from "@/lib/guides/registry";
import { breadcrumbJsonLd, guideArticleJsonLd, guideHeroUrl, guideVideoJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ categoria: string; slug: string }>;
}

// El universo de guías se conoce en build time (una carpeta por guía publicada).
// Cualquier combinación categoría/slug que no exista devuelve 404 real.
export const dynamicParams = false;

export async function generateStaticParams() {
  const guides = await listGuides();
  return guides.map((guide) => ({ categoria: guide.category, slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria, slug } = await params;
  const guide = await getGuide(categoria, slug);
  if (!guide) return {};

  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: guidePath(guide),
    type: "article",
    image: guideHeroUrl(guide),
    noIndex: guide.status !== "published",
    article: {
      publishedTime: guide.publishedAt ?? undefined,
      modifiedTime: guide.updatedAt,
      authors: [getAuthor(guide.data.metadata.author)?.name ?? ""].filter(Boolean),
    },
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { categoria, slug } = await params;
  const guide = await getGuide(categoria, slug);
  const category = getCategory(categoria);
  if (!guide || !category) notFound();

  const [related, pending, neighbours] = await Promise.all([getRelatedGuides(guide), getPendingRelated(guide), getNeighbours(guide)]);
  const Content = guide.Content;
  const videoJsonLd = guideVideoJsonLd(guide);
  const breadcrumbs = [
    { name: category.name, path: `/${category.slug}` },
    { name: guide.title, path: guidePath(guide) },
  ];

  return (
    <article>
      <ReadingProgress />
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbs]),
          guideArticleJsonLd(guide),
          ...(videoJsonLd ? [videoJsonLd] : []),
        ]}
      />

      <GuideHeader guide={guide} />

      <div className="mx-auto mt-10 max-w-[80rem] px-4 pb-16 sm:px-6 lg:mt-16 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12 lg:px-8 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-16">
        <aside className="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
          <GuideToc items={guide.sections} />
        </aside>

        <div className="guide-flow min-w-0 max-w-[var(--guide-column)]">
          <Content />

          <GuideAdSlot position="end-article" />

          <RelatedGuides guides={related.map(toSummary)} pending={process.env.NODE_ENV === "production" ? [] : pending} />
          <GuideNeighbours previous={neighbours.previous} next={neighbours.next} />
        </div>
      </div>
    </article>
  );
}
