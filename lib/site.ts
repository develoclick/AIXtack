export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://guiapromptsia.com";
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Guía Prompts IA";
export const siteTagline = "IA práctica para microempresas y emprendedores";
export const contactEmail = "contacto@guiapromptsia.com";

/**
 * Páginas institucionales (no cuentan como guías). `updatedAt` es la fecha REAL de la
 * última modificación de su contenido: hay que actualizarla al editar la página, porque
 * alimenta el sitemap (`lastModified`) y la fecha visible al pie de cada página.
 */
export const institutionalPages = [
  { path: "/sobre-nosotros", title: "Sobre nosotros", updatedAt: "2026-09-23" },
  { path: "/como-probamos", title: "Cómo probamos", updatedAt: "2026-09-23" },
  { path: "/contacto", title: "Contacto", updatedAt: "2026-09-18" },
  { path: "/politica-de-privacidad", title: "Política de privacidad", updatedAt: "2026-09-23" },
  { path: "/politica-de-cookies", title: "Política de cookies", updatedAt: "2026-09-18" },
  { path: "/terminos-y-condiciones", title: "Términos y condiciones", updatedAt: "2026-09-18" },
] as const;

export type InstitutionalPath = (typeof institutionalPages)[number]["path"];

export function institutionalUpdatedAt(path: InstitutionalPath): string {
  return institutionalPages.find((page) => page.path === path)!.updatedAt;
}

/** Fecha de la última modificación del contenido propio de la home (no depende de las guías). */
export const HOME_UPDATED_AT = "2026-09-18";
export const LIBRARY_UPDATED_AT = "2026-09-18";
/** Fecha de la última modificación de la introducción editorial de los hubs (content/categorias.ts). */
export const CATEGORIES_UPDATED_AT = "2026-09-18";
