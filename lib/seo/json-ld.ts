import { siteName, siteTagline, siteUrl } from "@/lib/site";

const absolute = (path: string) => new URL(path, siteUrl).toString();

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: absolute("/logo.png"),
    description: `${siteName}: ${siteTagline.toLowerCase()}. Herramientas para resolver tareas reales de un pequeño negocio con inteligencia artificial: eliges la tarea, llenas unos datos y copias el prompt.`,
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
