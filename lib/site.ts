/**
 * URL base ÚNICA del sitio: canonical, og:url, JSON-LD, sitemap y robots salen de aquí (no hay otro dominio escrito en el código).
 * Es una constante, NO una variable de entorno: así una variable antigua en Vercel no puede volver a poner otro dominio.
 * El dominio sin «www» redirige a www.guiapromptsia.com; este es el dominio principal.
 */
export const siteUrl = "https://www.guiapromptsia.com";
/** Imagen og:image general (1200×630): respaldo de toda página sin imagen propia. */
export const OG_POR_DEFECTO = "/og-default.webp";
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Guía Prompts IA";
export const siteTagline = "Prompts en español, gratis y listos para copiar";
export const contactEmail = "contacto@guiapromptsia.com";

/**
 * Páginas institucionales. `updatedAt` es la fecha REAL de la última modificación de su contenido: hay que actualizarla al
 * editar la página, porque alimenta el sitemap (`lastModified`) y la fecha visible.
 */
export const institutionalPages = [
  { path: "/sobre-nosotros", title: "Sobre nosotros", updatedAt: "2026-09-25" },
  { path: "/contacto", title: "Contacto", updatedAt: "2026-09-25" },
  { path: "/politica-de-privacidad", title: "Política de privacidad", updatedAt: "2026-09-25" },
  { path: "/politica-de-cookies", title: "Política de cookies", updatedAt: "2026-09-25" },
  { path: "/terminos-y-condiciones", title: "Términos y condiciones", updatedAt: "2026-09-25" },
] as const;

export type InstitutionalPath = (typeof institutionalPages)[number]["path"];

export function institutionalUpdatedAt(path: InstitutionalPath): string {
  return institutionalPages.find((page) => page.path === path)!.updatedAt;
}

/** Fecha de la última modificación del contenido propio de la portada. */
export const HOME_UPDATED_AT = "2026-09-25";
