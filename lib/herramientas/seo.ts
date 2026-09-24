import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategory } from "@/content/categorias";
import { mediaExists } from "@/lib/guides/media";
import { OG_POR_DEFECTO, siteName, siteUrl } from "@/lib/site";
import { rutaHerramienta } from "./registro";
import type { Herramienta } from "./tipos";

const absoluta = (ruta: string) => new URL(ruta, siteUrl).toString();

/** ¿Existe la og:image PROPIA de la página (/img/{area}/{slug}/og.webp)? */
export const tieneOgPropia = (h: Herramienta) => Boolean(h.meta.ogImage && mediaExists(h.meta.ogImage));

/**
 * URL absoluta de la og:image de la página: la propia si el archivo existe en public/; si no, el respaldo general del sitio
 * (`OG_POR_DEFECTO`). Nunca apunta a un archivo inexistente.
 */
export function ogImageUrl(h: Herramienta): string {
  return absoluta(tieneOgPropia(h) ? h.meta.ogImage! : OG_POR_DEFECTO);
}

/** Un solo `Article` por página. Las fechas son las reales de los datos. */
export function herramientaArticleJsonLd(h: Herramienta) {
  const autor = getAuthor(h.meta.autor ?? AUTOR_POR_DEFECTO);
  const editorial = getAuthor(EDITORIAL);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: h.meta.titulo,
    description: h.meta.descripcion,
    inLanguage: "es",
    articleSection: getCategory(h.meta.area)?.name,
    image: ogImageUrl(h),
    datePublished: h.meta.fechaPublicacion ?? h.meta.actualizado,
    dateModified: h.meta.actualizado,
    author: autor ? { "@type": autor.type, name: autor.name } : undefined,
    publisher: { "@type": "Organization", name: editorial?.name ?? siteName, logo: { "@type": "ImageObject", url: absoluta("/logo.png") } },
    mainEntityOfPage: absoluta(rutaHerramienta(h.meta)),
  };
}

/** FAQPage (opcional): solo con las preguntas que la página muestra. */
export function herramientaFaqJsonLd(h: Herramienta) {
  if (h.faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: h.faq.map((f) => ({ "@type": "Question", name: f.p, acceptedAnswer: { "@type": "Answer", text: f.r } })),
  };
}

/** Página de listado (biblioteca o área) con las herramientas que muestra. */
export function herramientasCollectionJsonLd(input: { name: string; description: string; path: string; herramientas: Herramienta[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluta(input.path),
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.herramientas.map((h, i) => ({ "@type": "ListItem", position: i + 1, name: h.meta.titulo, url: absoluta(rutaHerramienta(h.meta)) })),
    },
  };
}
