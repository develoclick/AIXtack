import { notFound } from "next/navigation";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { PostGrid } from "@/components/content/post-grid";
import { ToolGrid } from "@/components/tools/tool-grid";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { TopBannerAd } from "@/components/ads/top-banner-ad";
import { getCategoryBySlug } from "@/lib/content/categories";
import { listPublishedPosts } from "@/lib/content/posts";
import { listPublishedTools } from "@/lib/content/tools";
import { listPublishedPrompts } from "@/lib/content/prompts";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, categoryCollectionPageJsonLd, faqPageJsonLd } from "@/lib/seo/json-ld";
import categoriesJson from "@/content/categories.json";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return (categoriesJson as { slug: string }[]).map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return buildMetadata({
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? `Contenido sobre ${category.name}`,
    path: `/categoria/${category.slug}`,
    keywords: category.seoKeywords,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [posts, tools, prompts] = await Promise.all([
    listPublishedPosts({ categorySlug: category.slug, pageSize: 9 }),
    listPublishedTools({ categorySlug: category.slug, pageSize: 6 }),
    listPublishedPrompts({ categorySlug: category.slug, pageSize: 6 }),
  ]);

  const breadcrumbItems = [{ name: category.name, path: `/categoria/${category.slug}` }];

  const jsonLd = [
    breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbItems]),
    categoryCollectionPageJsonLd(category),
    ...(category.faqItems.length > 0 ? [faqPageJsonLd(category.faqItems)] : []),
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

      <SectionHeading eyebrow="Categoría" title={category.name} description={category.description ?? undefined} />
{/*
      <div className="mt-8">
        <TopBannerAd slotId="1000000040" />
      </div>
*/}
      {tools.items.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Herramientas</h2>
          <div className="mt-6">
            <ToolGrid tools={tools.items} />
          </div>
        </section>
      )}

      {prompts.items.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Prompts</h2>
          <div className="mt-6">
            <PromptGrid prompts={prompts.items} />
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Publicaciones</h2>
        <div className="mt-6">
          {posts.items.length > 0 ? (
            <PostGrid posts={posts.items} />
          ) : (
            <EmptyState title="Sin publicaciones todavía" description="Pronto añadiremos contenido en esta categoría." />
          )}
        </div>
      </section>

      {category.conclusion && (
        <section className="mt-14 rounded-2xl border bg-muted/30 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">En resumen</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{category.conclusion}</p>
        </section>
      )}

      {category.faqItems.length > 0 && (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-lg font-semibold">Preguntas frecuentes</h2>
          <div className="mt-4">
            <FaqAccordion
              items={category.faqItems.map((item, index) => ({
                id: String(index),
                question: item.question,
                answer: item.answer,
                category: null,
              }))}
            />
          </div>
        </section>
      )}

      <p className="mt-10 border-t pt-8 text-center text-sm text-muted-foreground">
        Explora todo el{" "}
        <Link href="/herramientas-ia" className="text-brand underline underline-offset-2">
          directorio de herramientas
        </Link>{" "}
        o vuelve al{" "}
        <Link href="/" className="text-brand underline underline-offset-2">
          inicio
        </Link>
        .
      </p>
    </div>
  );
}
