import fs from "node:fs/promises";
import path from "node:path";
import { categories, type CategorySlug } from "../../content/categorias";
import { plannedGuides } from "../../content/plan-guias";
import { analyzeGuideSource } from "./analyze";
import { getSectionDefinition, readingMinutesFromWords } from "./constants";
import type { GuideData } from "./model";
import { countWords, visibleStrings } from "./text";
import type { Guide, GuideSummary } from "./types";

/**
 * Registro de guías: descubre content/guias/<categoria>/<slug>/{guide.mdx,data.ts}, importa
 * ambos módulos y expone las guías ordenadas.
 *
 * Solo las guías con status "published" se generan en producción; los borradores se ven
 * únicamente con `next dev`. Nunca hay generación automática: cada carpeta es una guía escrita
 * a mano.
 */

const GUIDES_DIR = path.join(process.cwd(), "content", "guias");
const isProduction = process.env.NODE_ENV === "production";

let cache: Promise<Guide[]> | null = null;

async function readEntries(): Promise<{ category: CategorySlug; slug: string }[]> {
  const entries: { category: CategorySlug; slug: string }[] = [];
  for (const category of categories) {
    const dir = path.join(GUIDES_DIR, category.slug);
    let children: import("node:fs").Dirent[];
    try {
      children = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const child of children) {
      if (child.isDirectory() && !child.name.startsWith("_")) entries.push({ category: category.slug, slug: child.name });
    }
  }
  return entries;
}

async function loadGuide(category: CategorySlug, slug: string): Promise<Guide> {
  const [dataModule, mdxModule] = await Promise.all([
    import(`@/content/guias/${category}/${slug}/data`),
    import(`@/content/guias/${category}/${slug}/guide.mdx`),
  ]);
  const data = dataModule.default as GuideData | undefined;
  if (!data) throw new Error(`La guía "${category}/${slug}" no exporta "default" en data.ts.`);
  const { metadata } = data;
  if (metadata.slug !== slug || metadata.category !== category) {
    throw new Error(`La carpeta ${category}/${slug} declara ${metadata.category}/${metadata.slug} en data.ts.`);
  }

  const source = await fs.readFile(path.join(GUIDES_DIR, category, slug, "guide.mdx"), "utf8");
  const analysis = analyzeGuideSource(source);
  const wordCount = analysis.wordCount + countWords(visibleStrings(data));

  return {
    slug,
    category,
    title: metadata.title,
    description: metadata.description,
    status: metadata.status,
    publishedAt: metadata.publishedAt,
    updatedAt: metadata.updatedAt,
    difficulty: data.hero.difficulty,
    readingMinutes: readingMinutesFromWords(wordCount),
    wordCount,
    data,
    sections: analysis.sections.map((section) => ({
      id: section.id,
      title: section.title,
      label: getSectionDefinition(section.id)?.label ?? section.title,
      part: section.part || undefined,
    })),
    Content: mdxModule.default,
  };
}

/** Orden editorial: el del plan (content/plan-guias.ts); las guías fuera del plan, al final. */
function planIndex(slug: string): number {
  const index = plannedGuides.findIndex((planned) => planned.slug === slug);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

async function loadAll(): Promise<Guide[]> {
  const entries = await readEntries();
  const guides = await Promise.all(entries.map((entry) => loadGuide(entry.category, entry.slug)));
  return guides
    .filter((guide) => !isProduction || guide.status === "published")
    .sort((a, b) => planIndex(a.slug) - planIndex(b.slug) || a.title.localeCompare(b.title));
}

/** Guías visibles: publicadas en producción; publicadas + borradores en desarrollo. */
export function listGuides(): Promise<Guide[]> {
  if (!isProduction) return loadAll();
  cache ??= loadAll();
  return cache;
}

export async function listGuidesByCategory(category: CategorySlug): Promise<Guide[]> {
  return (await listGuides()).filter((guide) => guide.category === category);
}

export async function getGuide(category: string, slug: string): Promise<Guide | null> {
  const guide = (await listGuides()).find((item) => item.slug === slug);
  return guide && guide.category === category ? guide : null;
}

/** Guías relacionadas que existen (y son visibles). Las planificadas pero no escritas no se enlazan. */
export async function getRelatedGuides(guide: Guide): Promise<Guide[]> {
  const all = await listGuides();
  return guide.data.metadata.relatedGuides
    .map((slug) => all.find((item) => item.slug === slug))
    .filter((item): item is Guide => Boolean(item));
}

/** Guías planificadas relacionadas que todavía no existen (solo se muestran en desarrollo). */
export async function getPendingRelated(guide: Guide): Promise<{ slug: string; title: string }[]> {
  const all = await listGuides();
  return guide.data.metadata.relatedGuides
    .filter((slug) => !all.some((item) => item.slug === slug))
    .map((slug) => plannedGuides.find((planned) => planned.slug === slug))
    .filter((planned): planned is NonNullable<typeof planned> => Boolean(planned))
    .map(({ slug, title }) => ({ slug, title }));
}

/** Guía anterior y siguiente en el orden editorial, dentro de la misma categoría. */
export async function getNeighbours(guide: Guide): Promise<{ previous: GuideSummary | null; next: GuideSummary | null }> {
  const siblings = await listGuidesByCategory(guide.category);
  const index = siblings.findIndex((item) => item.slug === guide.slug);
  return {
    previous: index > 0 ? toSummary(siblings[index - 1]) : null,
    next: index >= 0 && index < siblings.length - 1 ? toSummary(siblings[index + 1]) : null,
  };
}

export function toSummary(guide: Guide): GuideSummary {
  const { slug, category, title, description, status, publishedAt, updatedAt, readingMinutes, difficulty } = guide;
  return { slug, category, title, description, status, publishedAt, updatedAt, readingMinutes, difficulty };
}
