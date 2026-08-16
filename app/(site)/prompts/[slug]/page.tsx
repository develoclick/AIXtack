import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CopyPromptButton } from "@/components/prompts/copy-prompt-button";
import { CategoryBadge } from "@/components/shared/category-badge";
import { ArticleBody } from "@/components/content/article-body";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { InArticleAd } from "@/components/ads/in-article-ad";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { getPromptBySlug, getRelatedPrompts } from "@/lib/content/prompts";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqPageJsonLd, promptCreativeWorkJsonLd } from "@/lib/seo/json-ld";
import promptsJson from "@/content/prompts.json";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return (promptsJson as { slug: string }[]).map((prompt) => ({ slug: prompt.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) return {};

  return buildMetadata({
    title: prompt.seoTitle ?? prompt.title,
    description: prompt.seoDescription ?? prompt.description ?? prompt.content.slice(0, 160),
    path: `/prompts/${prompt.slug}`,
    image: prompt.ogImage ?? undefined,
    keywords: prompt.seoKeywords,
  });
}

export default async function PromptDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) notFound();

  const relatedPrompts = await getRelatedPrompts(prompt, 3);

  const breadcrumbItems = [
    { name: "Prompts", path: "/prompts" },
    { name: prompt.title, path: `/prompts/${prompt.slug}` },
  ];

  const jsonLd = [
    breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbItems]),
    promptCreativeWorkJsonLd(prompt),
    ...(prompt.faqItems.length > 0 ? [faqPageJsonLd(prompt.faqItems)] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {jsonLd.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-wrap items-center gap-2">
        {prompt.category && <CategoryBadge category={prompt.category} prefix="/categoria" />}
        {prompt.isPremium && <Badge variant="outline">Premium</Badge>}
        {prompt.targetModels.map((model) => (
          <Badge key={model} variant="secondary">
            {model}
          </Badge>
        ))}
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{prompt.title}</h1>
      {prompt.description && <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{prompt.description}</p>}

      <div className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
          <span className="text-sm font-medium text-muted-foreground">Prompt</span>
          <CopyPromptButton content={prompt.content} />
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-sm leading-relaxed">{prompt.content}</pre>
      </div>

      {prompt.useCase && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Caso de uso</h2>
          <p className="mt-2 text-muted-foreground">{prompt.useCase}</p>
        </div>
      )}

      {prompt.article && (
        <div className="mt-10">
          <ArticleBody html={prompt.article} />
        </div>
      )}



      {prompt.conclusion && (
        <section className="mt-10 rounded-2xl border bg-muted/30 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Conclusión</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{prompt.conclusion}</p>
        </section>
      )}

      {prompt.faqItems.length > 0 && (
        <section className="mt-10 border-t pt-8">
          <h2 className="text-lg font-semibold">Preguntas frecuentes</h2>
          <div className="mt-4">
            <FaqAccordion
              items={prompt.faqItems.map((item, index) => ({
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
        Explora más prompts en{" "}
        {prompt.category ? (
          <Link href={`/categoria/${prompt.category.slug}`} className="text-brand underline underline-offset-2">
            {prompt.category.name}
          </Link>
        ) : (
          <Link href="/prompts" className="text-brand underline underline-offset-2">
            nuestra biblioteca
          </Link>
        )}{" "}
        o revisa nuestras{" "}
        <Link href="/guias" className="text-brand underline underline-offset-2">
          guías de prompt engineering
        </Link>
        .
      </p>

      {relatedPrompts.length > 0 && (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-lg font-semibold">Prompts relacionados</h2>
          <div className="mt-6">
            <PromptGrid prompts={relatedPrompts} />
          </div>
        </section>
      )}
    </div>
  );
}
