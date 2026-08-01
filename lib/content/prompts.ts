import promptsJson from "@/content/prompts.json";
import categoriesJson from "@/content/categories.json";
import tagsJson from "@/content/tags.json";
import type { PaginatedResult, PromptDetail, PromptSummary, TaxonomyRef } from "@/lib/types";

interface PromptRaw {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  useCase: string | null;
  categorySlug: string;
  tags: string[];
  targetModels: string[];
  isPremium: boolean;
  copyCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  ogImage: string | null;
  faqItems: { question: string; answer: string }[];
  conclusion: string | null;
  article: string | null;
}

const prompts = promptsJson as PromptRaw[];
const categoryById = new Map((categoriesJson as { id: string; slug: string; name: string }[]).map((c) => [c.slug, c]));
const tagById = new Map((tagsJson as TaxonomyRef[]).map((t) => [t.slug, t]));

function resolveCategory(slug: string): TaxonomyRef | null {
  const category = categoryById.get(slug);
  return category ? { id: category.id, slug: category.slug, name: category.name } : null;
}

function resolveTags(slugs: string[]): TaxonomyRef[] {
  return slugs.map((slug) => tagById.get(slug)).filter((tag): tag is TaxonomyRef => Boolean(tag));
}

function toSummary(prompt: PromptRaw): PromptSummary {
  return {
    id: prompt.id,
    slug: prompt.slug,
    title: prompt.title,
    description: prompt.description,
    useCase: prompt.useCase,
    isPremium: prompt.isPremium,
    targetModels: prompt.targetModels,
    category: resolveCategory(prompt.categorySlug),
    tags: resolveTags(prompt.tags),
  };
}

function toDetail(prompt: PromptRaw): PromptDetail {
  return {
    ...toSummary(prompt),
    content: prompt.content,
    article: prompt.article,
    copyCount: prompt.copyCount,
    seoTitle: prompt.seoTitle,
    seoDescription: prompt.seoDescription,
    seoKeywords: prompt.seoKeywords,
    ogImage: prompt.ogImage,
    faqItems: prompt.faqItems,
    conclusion: prompt.conclusion,
  };
}

export interface ListPromptsOptions {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  query?: string;
}

export async function listPublishedPrompts(options: ListPromptsOptions = {}): Promise<PaginatedResult<PromptSummary>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 12;
  const query = options.query?.trim().toLowerCase();

  let filtered = prompts;
  if (options.categorySlug) {
    filtered = filtered.filter((p) => p.categorySlug === options.categorySlug);
  }
  if (query) {
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)
    );
  }

  const totalItems = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(toSummary);

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

export async function getPromptBySlug(slug: string): Promise<PromptDetail | null> {
  const prompt = prompts.find((p) => p.slug === slug);
  return prompt ? toDetail(prompt) : null;
}

export async function getRelatedPrompts(prompt: PromptDetail, limit = 3): Promise<PromptSummary[]> {
  if (!prompt.category) return [];
  const { items } = await listPublishedPrompts({ categorySlug: prompt.category.slug, pageSize: limit + 1 });
  return items.filter((item) => item.id !== prompt.id).slice(0, limit);
}
