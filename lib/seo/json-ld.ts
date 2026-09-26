import { siteName, siteTagline, siteUrl } from "@/lib/site";

const absolute = (path: string) => new URL(path, siteUrl).toString();

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: absolute("/logo.png"),
    description: `${siteName}: ${siteTagline.toLowerCase()}. Biblioteca gratuita de prompts en español para ChatGPT, Gemini y Claude.`,
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

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function articleJsonLd(input: { titulo: string; descripcion: string; path: string; publicado: string; actualizado: string; autor: string; editorial: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.titulo,
    description: input.descripcion,
    url: absolute(input.path),
    mainEntityOfPage: absolute(input.path),
    datePublished: input.publicado,
    dateModified: input.actualizado,
    inLanguage: "es",
    author: { "@type": "Person", name: input.autor },
    publisher: { "@type": "Organization", name: input.editorial, logo: { "@type": "ImageObject", url: absolute("/logo.png") } },
  };
}
