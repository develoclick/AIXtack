import postsJson from "@/content/posts.json";
import categoriesJson from "@/content/categories.json";
import tagsJson from "@/content/tags.json";
import authorsJson from "@/content/authors.json";
import type { Author, ImageCredit, PaginatedResult, PostDetail, PostSummary, PostType, TaxonomyRef } from "@/lib/types";

interface PostRaw {
  id: string;
  slug: string;
  type: PostType;
  title: string;
  excerpt: string | null;
  content: string;
  categorySlug: string;
  tags: string[];
  featured: boolean;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  coverImageCredit?: ImageCredit | null;
  authorId: string;
  readingTimeMin: number | null;
  publishedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  canonicalUrl: string | null;
  ogImage: string | null;
  faqItems: { question: string; answer: string }[];
}

const posts = postsJson as PostRaw[];
const categoryById = new Map((categoriesJson as { id: string; slug: string; name: string }[]).map((c) => [c.slug, c]));
const tagById = new Map((tagsJson as TaxonomyRef[]).map((t) => [t.slug, t]));
const authorById = new Map((authorsJson as Author[]).map((a) => [a.id, a]));

function resolveCategories(slug: string): TaxonomyRef[] {
  const category = categoryById.get(slug);
  return category ? [{ id: category.id, slug: category.slug, name: category.name }] : [];
}

function resolveTags(slugs: string[]): TaxonomyRef[] {
  return slugs.map((slug) => tagById.get(slug)).filter((tag): tag is TaxonomyRef => Boolean(tag));
}

function resolveAuthor(id: string): Author {
  return authorById.get(id) ?? { id, name: null, image: null, bio: null };
}

function toSummary(post: PostRaw): PostSummary {
  return {
    id: post.id,
    slug: post.slug,
    type: post.type,
    title: post.title,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt,
    coverImageCredit: post.coverImageCredit ?? null,
    author: resolveAuthor(post.authorId),
    categories: resolveCategories(post.categorySlug),
    tags: resolveTags(post.tags),
    featured: post.featured,
    readingTimeMin: post.readingTimeMin,
    publishedAt: new Date(post.publishedAt),
  };
}

function toDetail(post: PostRaw): PostDetail {
  return {
    ...toSummary(post),
    content: post.content,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoKeywords: post.seoKeywords,
    canonicalUrl: post.canonicalUrl,
    ogImage: post.ogImage,
    faqItems: post.faqItems,
    viewCount: 0,
  };
}

const postsSorted = [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

export interface ListPostsOptions {
  page?: number;
  pageSize?: number;
  type?: PostType;
  categorySlug?: string;
  tagSlug?: string;
  featuredOnly?: boolean;
}

export async function listPublishedPosts(options: ListPostsOptions = {}): Promise<PaginatedResult<PostSummary>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 12;

  let filtered = postsSorted;
  if (options.type) filtered = filtered.filter((p) => p.type === options.type);
  if (options.featuredOnly) filtered = filtered.filter((p) => p.featured);
  if (options.categorySlug) filtered = filtered.filter((p) => p.categorySlug === options.categorySlug);
  if (options.tagSlug) filtered = filtered.filter((p) => p.tags.includes(options.tagSlug!));

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

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const post = posts.find((p) => p.slug === slug);
  return post ? toDetail(post) : null;
}

export async function getRelatedPosts(post: PostSummary, limit = 3): Promise<PostSummary[]> {
  const categorySlugs = new Set(post.categories.map((c) => c.slug));
  const tagSlugs = new Set(post.tags.map((t) => t.slug));
  if (categorySlugs.size === 0 && tagSlugs.size === 0) return [];

  const related = postsSorted.filter(
    (p) =>
      p.id !== post.id &&
      (categorySlugs.has(p.categorySlug) || p.tags.some((t) => tagSlugs.has(t)))
  );

  return related.slice(0, limit).map(toSummary);
}
