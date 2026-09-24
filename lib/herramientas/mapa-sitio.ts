import { categories } from "../../content/categorias";
import { mediaExists } from "../guides/media";
import { CATEGORIES_UPDATED_AT, HOME_UPDATED_AT, institutionalPages, LIBRARY_UPDATED_AT, siteUrl } from "../site";
import { areaEsIndexable, bibliotecaEsIndexable, rutaHerramienta, type HerramientaCargada } from "./registro";

export interface EntradaSitemap {
  url: string;
  lastModified: string;
  images?: string[];
}

const latest = (...dates: string[]) => dates.reduce((a, b) => (a > b ? a : b));

/** Imágenes de una herramienta que EXISTEN en public/ (la og:image primero). Nunca se listan archivos que aún no están. */
function imagenes(h: HerramientaCargada): string[] {
  const fuentes = [h.meta.ogImage, ...h.ejemplo.capturas.map((c) => c.src), ...(h.metodoCompleto?.capturas ?? []).map((c) => c.src)];
  return [...new Set(fuentes)].filter((src): src is string => Boolean(src) && mediaExists(src!)).map((src) => `${siteUrl}${src}`);
}

/**
 * Entradas del sitemap a partir de las herramientas PUBLICADAS: portada, biblioteca (solo con ≥1 publicada), áreas (solo con
 * ≥1 publicada en el área), herramientas publicadas y páginas institucionales. Nunca borradores ni /mi-negocio.
 */
export function entradasDelSitemap(publicadas: HerramientaCargada[]): EntradaSitemap[] {
  const fechas = publicadas.map((h) => h.meta.actualizado);
  return [
    { url: `${siteUrl}/`, lastModified: latest(HOME_UPDATED_AT, ...fechas) },
    ...(bibliotecaEsIndexable(publicadas) ? [{ url: `${siteUrl}/herramientas`, lastModified: latest(LIBRARY_UPDATED_AT, ...fechas) }] : []),
    ...categories
      .filter((c) => areaEsIndexable(publicadas, c.slug))
      .map((c) => ({ url: `${siteUrl}/${c.slug}`, lastModified: latest(CATEGORIES_UPDATED_AT, ...publicadas.filter((h) => h.meta.area === c.slug).map((h) => h.meta.actualizado)) })),
    ...publicadas.map((h) => {
      const imgs = imagenes(h);
      return { url: `${siteUrl}${rutaHerramienta(h.meta)}`, lastModified: h.meta.actualizado, ...(imgs.length > 0 && { images: imgs }) };
    }),
    ...institutionalPages.map((page) => ({ url: `${siteUrl}${page.path}`, lastModified: page.updatedAt })),
  ];
}
