import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArticleBody } from "@/components/content/article-body";
import { CategoryBadge } from "@/components/shared/category-badge";
import { PostGrid } from "@/components/content/post-grid";
import { InArticleAd } from "@/components/ads/in-article-ad";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PhotoCredit } from "@/components/shared/photo-credit";
import { getPostBySlug, getRelatedPosts } from "@/lib/content/posts";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/json-ld";
import { formatDate } from "@/lib/utils/format";
import { postTypeListing } from "@/lib/utils/post-type";
import postsJson from "@/content/posts.json";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return (postsJson as { slug: string }[]).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? post.title,
    path: `/blog/${post.slug}`,
    image: post.ogImage ?? post.coverImageUrl ?? undefined,
    type: "article",
    keywords: post.seoKeywords,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const section = postTypeListing[post.type];

  const breadcrumbItems = [
    { name: section.label, path: section.path },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  const jsonLd = [
    breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbItems]),
    articleJsonLd(post),
    ...(post.faqItems.length > 0 ? [faqPageJsonLd(post.faqItems)] : []),
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {jsonLd.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-wrap gap-2">
        {post.categories.map((category) => (
          <CategoryBadge key={category.id} category={category} />
        ))}
      </div>

      <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
        {post.title}
      </h1>

      <div className="mt-7 flex items-center gap-3 border-y py-4">
        <Avatar className="size-10 shadow-soft">
          <AvatarImage src={post.author.image ?? undefined} alt={post.author.name ?? ""} />
          <AvatarFallback>{post.author.name?.charAt(0) ?? "A"}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-medium">{post.author.name ?? "Equipo Guía Prompts IA"}</p>
          <p className="text-muted-foreground">
            {formatDate(post.publishedAt)}
            {post.readingTimeMin ? ` · ${post.readingTimeMin} min de lectura` : ""}
          </p>
        </div>
      </div>

      {post.coverImageUrl && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border bg-muted shadow-soft-lg">
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt ?? post.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}
      <PhotoCredit credit={post.coverImageCredit} />

      <div className="mt-10">
        <ArticleBody html={post.content} />
      </div>



      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t pt-6">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/etiqueta/${tag.slug}`}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-brand/50 hover:text-brand"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {post.faqItems.length > 0 && (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold">Preguntas frecuentes</h2>
          <div className="mt-4">
            <FaqAccordion
              items={post.faqItems.map((item, index) => ({
                id: String(index),
                question: item.question,
                answer: item.answer,
                category: null,
              }))}
            />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t pt-10">
          <h2 className="text-xl font-semibold">También te puede interesar</h2>
          <div className="mt-6">
            <PostGrid posts={related} />
          </div>
        </section>
      )}
    </article>
  );
}
