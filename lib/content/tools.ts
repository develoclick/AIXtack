import toolsJson from "@/content/tools.json";
import categoriesJson from "@/content/categories.json";
import tagsJson from "@/content/tags.json";
import type { ImageCredit, PaginatedResult, ToolDetail, ToolSummary, TaxonomyRef } from "@/lib/types";

interface ToolRaw {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  logoUrl: string | null;
  logoCredit?: ImageCredit | null;
  websiteUrl: string;
  categorySlug: string;
  tags: string[];
  pricingModel: ToolSummary["pricingModel"];
  pricingFrom: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  features: string[];
  pros: string[];
  cons: string[];
  screenshots: string[];
  affiliateSlug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  ogImage: string | null;
  faqItems: { question: string; answer: string }[];
  conclusion: string | null;
}

const tools = toolsJson as ToolRaw[];
const categoryById = new Map((categoriesJson as { id: string; slug: string; name: string }[]).map((c) => [c.slug, c]));
const tagById = new Map((tagsJson as TaxonomyRef[]).map((t) => [t.slug, t]));

function resolveCategory(slug: string): TaxonomyRef | null {
  const category = categoryById.get(slug);
  return category ? { id: category.id, slug: category.slug, name: category.name } : null;
}

function resolveTags(slugs: string[]): TaxonomyRef[] {
  return slugs.map((slug) => tagById.get(slug)).filter((tag): tag is TaxonomyRef => Boolean(tag));
}

function toSummary(tool: ToolRaw): ToolSummary {
  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    logoUrl: tool.logoUrl,
    logoCredit: tool.logoCredit ?? null,
    pricingModel: tool.pricingModel,
    pricingFrom: tool.pricingFrom,
    currency: tool.currency,
    rating: tool.rating,
    reviewCount: tool.reviewCount,
    category: resolveCategory(tool.categorySlug),
    tags: resolveTags(tool.tags),
  };
}

function toDetail(tool: ToolRaw): ToolDetail {
  return {
    ...toSummary(tool),
    description: tool.description,
    websiteUrl: tool.websiteUrl,
    features: tool.features,
    pros: tool.pros,
    cons: tool.cons,
    screenshots: tool.screenshots,
    affiliateSlug: tool.affiliateSlug,
    seoTitle: tool.seoTitle,
    seoDescription: tool.seoDescription,
    seoKeywords: tool.seoKeywords,
    ogImage: tool.ogImage,
    faqItems: tool.faqItems,
    conclusion: tool.conclusion,
  };
}

export interface ListToolsOptions {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  query?: string;
  sort?: "rating" | "recent" | "name";
}

export async function listPublishedTools(options: ListToolsOptions = {}): Promise<PaginatedResult<ToolSummary>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 12;
  const query = options.query?.trim().toLowerCase();

  let filtered = tools;
  if (options.categorySlug) {
    filtered = filtered.filter((t) => t.categorySlug === options.categorySlug);
  }
  if (query) {
    filtered = filtered.filter(
      (t) => t.name.toLowerCase().includes(query) || t.tagline?.toLowerCase().includes(query)
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    if (options.sort === "name") return a.name.localeCompare(b.name);
    if (options.sort === "recent") return 0; // orden de contenido = orden de publicación
    return b.rating - a.rating;
  });

  const totalItems = sorted.length;
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize).map(toSummary);

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

export async function getToolBySlug(slug: string): Promise<ToolDetail | null> {
  const tool = tools.find((t) => t.slug === slug);
  return tool ? toDetail(tool) : null;
}

export async function findToolsByIds(ids: string[]): Promise<ToolSummary[]> {
  if (ids.length === 0) return [];
  const idSet = new Set(ids);
  return tools.filter((t) => idSet.has(t.id)).map(toSummary);
}

export async function getRelatedTools(tool: ToolDetail, limit = 3): Promise<ToolSummary[]> {
  if (!tool.category) return [];
  const { items } = await listPublishedTools({ categorySlug: tool.category.slug, pageSize: limit + 1 });
  return items.filter((item) => item.id !== tool.id).slice(0, limit);
}
