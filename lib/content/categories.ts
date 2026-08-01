import categoriesJson from "@/content/categories.json";
import tagsJson from "@/content/tags.json";
import type { CategorySummary, TaxonomyRef } from "@/lib/types";

type CategoryRaw = CategorySummary & { order: number };

const categories = categoriesJson as CategoryRaw[];
const tags = tagsJson as TaxonomyRef[];

const categoriesSorted: CategorySummary[] = [...categories]
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  .map(({ order: _order, ...category }) => category);

export async function listCategories(): Promise<CategorySummary[]> {
  return categoriesSorted;
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getTagBySlug(slug: string): Promise<TaxonomyRef | null> {
  return tags.find((t) => t.slug === slug) ?? null;
}

export async function listPopularTags(limit = 20): Promise<TaxonomyRef[]> {
  return tags.slice(0, limit);
}
