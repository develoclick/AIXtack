import { getAuthor } from "@/content/autores";
import { getCategory } from "@/content/categorias";
import { mediaExists } from "@/lib/guides/media";
import { siteName, siteUrl } from "@/lib/site";
import { rutaHerramienta } from "./registro";
import type { Herramienta } from "./tipos";

const absoluta = (ruta: string) => new URL(ruta, siteUrl).toString();

/** URL absoluta de la og:image propia, solo si el archivo existe en public/. */
export function ogImageUrl(h: Herramienta): string | undefined {
  return h.meta.ogImage && mediaExists(h.meta.ogImage) ? absoluta(h.meta.ogImage) : undefined;
}

/** Un solo `Article` por página. Las fechas son las reales de los datos. */
export function herramientaArticleJsonLd(h: Herramienta) {
  const autor = getAuthor(h.meta.autor ?? "develoclick");
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
    publisher: { "@type": "Organization", name: siteName, logo: { "@type": "ImageObject", url: absoluta("/logo.png") } },
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
