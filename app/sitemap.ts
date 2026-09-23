import type { MetadataRoute } from "next";
import { categories } from "@/content/categorias";
import { mediaExists } from "@/lib/guides/media";
import { listarPublicadas, rutaHerramienta, type HerramientaCargada } from "@/lib/herramientas/registro";
import { CATEGORIES_UPDATED_AT, HOME_UPDATED_AT, institutionalPages, LIBRARY_UPDATED_AT, siteUrl } from "@/lib/site";

const latest = (...dates: string[]) => dates.reduce((a, b) => (a > b ? a : b));

/** Imágenes de una herramienta que EXISTEN en public/ (la og:image primero). Nunca se listan archivos que aún no están. */
function imagenes(h: HerramientaCargada): string[] {
  const fuentes = [h.meta.ogImage, ...h.ejemplo.capturas.map((c) => c.src), ...(h.metodoCompleto?.capturas ?? []).map((c) => c.src)];
  return [...new Set(fuentes)].filter((src): src is string => Boolean(src) && mediaExists(src!)).map((src) => `${siteUrl}${src}`);
}

/**
 * Sitemap: SOLO URLs nuevas y que responden 200 indexables: la home, las herramientas PUBLICADAS, la biblioteca y las
 * áreas que tienen al menos una herramienta publicada (sin ella son noindex) y las páginas institucionales.
 * Nunca incluye borradores, /mi-negocio, rutas retiradas ni páginas noindex. `lastModified` son fechas reales.
 * No lleva `priority` ni `changeFrequency`: Google los ignora y un valor inventado no aporta nada.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicadas = await listarPublicadas();
  const todas = publicadas.map((h) => h.meta.actualizado);
  const areasConHerramientas = categories.filter((c) => publicadas.some((h) => h.meta.area === c.slug));

  return [
    { url: `${siteUrl}/`, lastModified: latest(HOME_UPDATED_AT, ...todas) },
    ...(publicadas.length > 0 ? [{ url: `${siteUrl}/herramientas`, lastModified: latest(LIBRARY_UPDATED_AT, ...todas) }] : []),
    ...areasConHerramientas.map((c) => ({
      url: `${siteUrl}/${c.slug}`,
      lastModified: latest(CATEGORIES_UPDATED_AT, ...publicadas.filter((h) => h.meta.area === c.slug).map((h) => h.meta.actualizado)),
    })),
    ...publicadas.map((h) => {
      const imgs = imagenes(h);
      return { url: `${siteUrl}${rutaHerramienta(h.meta)}`, lastModified: h.meta.actualizado, ...(imgs.length > 0 && { images: imgs }) };
    }),
    ...institutionalPages.map((page) => ({ url: `${siteUrl}${page.path}`, lastModified: page.updatedAt })),
  ];
}
