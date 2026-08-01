import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/shared/section-heading";
import { PostGrid } from "@/components/content/post-grid";
import { Pagination } from "@/components/shared/pagination";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { getTagBySlug } from "@/lib/content/categories";
import { listPublishedPosts } from "@/lib/content/posts";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import tagsJson from "@/content/tags.json";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  return (tagsJson as { slug: string }[]).map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const tag = await getTagBySlug(slug);
  if (!tag) return {};

  const page = Number(pageParam ?? "1") || 1;
  const path = page > 1 ? `/etiqueta/${tag.slug}?page=${page}` : `/etiqueta/${tag.slug}`;

  return buildMetadata({
    title: page > 1 ? `#${tag.name} — Página ${page}` : `#${tag.name}`,
    description: `Publicaciones etiquetadas con ${tag.name}.`,
    path,
  });
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const page = Number(pageParam ?? "1") || 1;
  const { items, totalPages } = await listPublishedPosts({ tagSlug: tag.slug, page, pageSize: 12 });

  const breadcrumbItems = [{ name: `#${tag.name}`, path: `/etiqueta/${tag.slug}` }];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbItems])),
        }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <SectionHeading eyebrow="Etiqueta" title={`#${tag.name}`} />
      <div className="mt-10">
        <PostGrid posts={items} />
      </div>
      <Pagination page={page} totalPages={totalPages} basePath={`/etiqueta/${tag.slug}`} />
    </div>
  );
}
