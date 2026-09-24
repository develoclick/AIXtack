import type { MetadataRoute } from "next";
import { entradasDelSitemap } from "@/lib/herramientas/mapa-sitio";
import { listarPublicadas } from "@/lib/herramientas/registro";

/**
 * Sitemap: solo URLs nuevas, indexables y que responden 200 (lib/herramientas/mapa-sitio.ts). Áreas y /herramientas entran
 * solo con al menos 1 herramienta `publicado: true`; hoy ninguna, así que solo salen la portada y las institucionales.
 * Nunca incluye borradores (noindex), /mi-negocio ni rutas retiradas. Sin `priority` ni `changeFrequency` (Google los ignora).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return entradasDelSitemap(await listarPublicadas());
}
