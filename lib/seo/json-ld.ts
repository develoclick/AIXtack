import type { CategorySummary, PostDetail, PromptDetail, ProfessionSummary, ToolDetail } from "@/lib/types";
import { toDate } from "@/lib/utils/format";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "AIXtack";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).toString(),
    })),
  };
}

export function articleJsonLd(post: PostDetail) {
  return {
    "@context": "https://schema.org",
    "@type": post.type === "NEWS" ? "NewsArticle" : "Article",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    image: post.ogImage ?? post.coverImageUrl ?? undefined,
    datePublished: post.publishedAt ? toDate(post.publishedAt).toISOString() : undefined,
    author: { "@type": "Person", name: post.author.name ?? siteName },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };
}

export function softwareApplicationJsonLd(tool: ToolDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.seoDescription ?? tool.description,
    applicationCategory: tool.category?.name ?? "AI Application",
    offers: tool.pricingFrom
      ? {
          "@type": "Offer",
          price: tool.pricingFrom,
          priceCurrency: tool.currency,
        }
      : undefined,
    aggregateRating:
      tool.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: tool.rating,
            reviewCount: tool.reviewCount,
          }
        : undefined,
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function promptCreativeWorkJsonLd(prompt: PromptDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: prompt.title,
    description: prompt.seoDescription ?? prompt.description ?? undefined,
    about: prompt.useCase ?? undefined,
    keywords: prompt.targetModels.join(", ") || undefined,
    mainEntityOfPage: `${siteUrl}/prompts/${prompt.slug}`,
  };
}

export function professionsItemListJsonLd(professions: ProfessionSummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: professions.map((profession, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: profession.name,
      url: `${siteUrl}/prompts/profesiones/${profession.slug}`,
    })),
  };
}

export function professionCollectionPageJsonLd(profession: ProfessionSummary) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: profession.seoTitle,
    description: profession.seoDescription,
    url: `${siteUrl}/prompts/profesiones/${profession.slug}`,
  };
}

export function categoryCollectionPageJsonLd(category: CategorySummary) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? undefined,
    url: `${siteUrl}/categoria/${category.slug}`,
  };
}
