import { getAuthor } from "@/content/autores";
import { getCategory } from "@/content/categorias";
import { guidePath } from "@/lib/guides/constants";
import { heroImageOf } from "@/lib/guides/images";
import { mediaExists } from "@/lib/guides/media";
import type { Guide, GuideSummary } from "@/lib/guides/types";
import { siteName, siteTagline, siteUrl } from "@/lib/site";

const absolute = (path: string) => new URL(path, siteUrl).toString();

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: absolute("/logo.png"),
    description: `${siteName}: ${siteTagline.toLowerCase()}. Guías paso a paso para resolver tareas reales de un pequeño negocio con inteligencia artificial.`,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    inLanguage: "es",
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

/** URL absoluta de la imagen hero de la guía, solo si el archivo existe en public/. */
export function guideHeroUrl(guide: Guide): string | undefined {
  const image = heroImageOf(guide.data);
  return image && mediaExists(image.src) ? absolute(image.src) : undefined;
}

export function guideArticleJsonLd(guide: Guide) {
  const author = getAuthor(guide.data.metadata.author);
  const category = getCategory(guide.category);
  const image = guideHeroUrl(guide);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    inLanguage: "es",
    articleSection: category?.name,
    image,
    datePublished: guide.publishedAt ?? undefined,
    dateModified: guide.updatedAt,
    author: author ? { "@type": author.type, name: author.name } : undefined,
    publisher: { "@type": "Organization", name: siteName, logo: { "@type": "ImageObject", url: absolute("/logo.png") } },
    mainEntityOfPage: absolute(guidePath(guide)),
  };
}

/**
 * VideoObject SOLO con un video real y publicado: id de YouTube, fecha de subida y miniatura
 * existente. Sin video real devuelve null (los datos estructurados deben coincidir con lo visible).
 */
export function guideVideoJsonLd(guide: Guide) {
  const video = guide.data.video;
  if (!video || video.status !== "published" || !video.youtubeId || !video.uploadDate || !video.thumbnail) return null;
  if (!mediaExists(video.thumbnail.src)) return null;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: absolute(video.thumbnail.src),
    uploadDate: video.uploadDate,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
    inLanguage: "es",
  };
}

/** Página de listado (hub de categoría o biblioteca) con las guías que contiene. */
export function collectionPageJsonLd(input: { name: string; description: string; path: string; guides: GuideSummary[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absolute(input.path),
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.guides.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: absolute(guidePath(guide)),
      })),
    },
  };
}
