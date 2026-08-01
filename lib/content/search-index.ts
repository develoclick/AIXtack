import postsJson from "@/content/posts.json";
import toolsJson from "@/content/tools.json";
import promptsJson from "@/content/prompts.json";
import type { SearchResultItem } from "@/lib/types";

interface PostRaw {
  slug: string;
  title: string;
  excerpt: string | null;
}
interface ToolRaw {
  slug: string;
  name: string;
  tagline: string | null;
}
interface PromptRaw {
  slug: string;
  title: string;
  description: string | null;
}

/**
 * Índice de búsqueda estático: se genera una sola vez a partir del
 * contenido local y se incluye en el bundle del cliente para el buscador
 * (sin API route ni fetch — el sitio no tiene backend).
 */
export function searchContent(query: string, limit = 20): SearchResultItem[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  return searchIndex
    .filter(
      (item) =>
        item.title.toLowerCase().includes(trimmed) || item.excerpt?.toLowerCase().includes(trimmed)
    )
    .slice(0, limit);
}

export const searchIndex: SearchResultItem[] = [
  ...(postsJson as PostRaw[]).map((p) => ({
    kind: "post" as const,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    href: `/blog/${p.slug}`,
  })),
  ...(toolsJson as ToolRaw[]).map((t) => ({
    kind: "tool" as const,
    slug: t.slug,
    title: t.name,
    excerpt: t.tagline,
    href: `/herramientas-ia/${t.slug}`,
  })),
  ...(promptsJson as PromptRaw[]).map((p) => ({
    kind: "prompt" as const,
    slug: p.slug,
    title: p.title,
    excerpt: p.description,
    href: `/prompts/${p.slug}`,
  })),
];
