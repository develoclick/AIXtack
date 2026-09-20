import type { MetadataRoute } from "next";
import { categories } from "@/content/categorias";
import { guidePath } from "@/lib/guides/constants";
import { heroImageOf } from "@/lib/guides/images";
import { mediaExists } from "@/lib/guides/media";
import { listGuides } from "@/lib/guides/registry";
import type { Guide } from "@/lib/guides/types";
import { CATEGORIES_UPDATED_AT, HOME_UPDATED_AT, institutionalPages, LIBRARY_UPDATED_AT, siteUrl } from "@/lib/site";

const latest = (...dates: string[]) => dates.reduce((a, b) => (a > b ? a : b));

/** Imágenes de una guía que EXISTEN en public/ (la portada primero). Nunca se listan archivos que aún no están. */
function guideImages(guide: Guide): string[] {
  const hero = heroImageOf(guide.data);
  const sources = [hero?.src, ...Object.values(guide.data.images ?? {}).map((slot) => slot.src)];
  return [...new Set(sources)].filter((src): src is string => Boolean(src) && mediaExists(src!)).map((src) => `${siteUrl}${src}`);
}

/**
 * Sitemap: home, biblioteca, hubs, guías PUBLICADAS y páginas institucionales.
 * `lastModified` son fechas reales (updatedAt de cada guía o de cada página). Nunca
 * incluye borradores, rutas retiradas ni páginas noindex. Cada guía declara sus imágenes
 * (sitemap de imágenes) y solo las que existen. No lleva `priority` ni `changeFrequency`:
 * Google los ignora y un valor inventado no aporta nada.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = (await listGuides()).filter((guide) => guide.status === "published");
  const allUpdates = published.map((guide) => guide.updatedAt);

  return [
    { url: `${siteUrl}/`, lastModified: latest(HOME_UPDATED_AT, ...allUpdates) },
    { url: `${siteUrl}/guias`, lastModified: latest(LIBRARY_UPDATED_AT, ...allUpdates) },
    ...categories.map((category) => ({
      url: `${siteUrl}/${category.slug}`,
      lastModified: latest(
        CATEGORIES_UPDATED_AT,
        ...published.filter((guide) => guide.category === category.slug).map((guide) => guide.updatedAt)
      ),
    })),
    ...published.map((guide) => {
      const images = guideImages(guide);
      return { url: `${siteUrl}${guidePath(guide)}`, lastModified: guide.updatedAt, ...(images.length > 0 && { images }) };
    }),
    ...institutionalPages.map((page) => ({ url: `${siteUrl}${page.path}`, lastModified: page.updatedAt })),
  ];
}
