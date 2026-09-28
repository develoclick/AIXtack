import type { MetadataRoute } from "next";
import { articulosPublicados, categoriasActivas, herramientasPublicadas, rutaArticulo, rutaCategoria, rutaHerramienta } from "@/content/catalogo";
import { HOME_UPDATED_AT, institutionalPages, siteUrl } from "@/lib/site";

/**
 * Solo URLs indexables que responden 200, todas leídas del catálogo central: portada, categorías ACTIVAS (con al menos una
 * herramienta publicada), herramientas y artículos publicados, y páginas institucionales. Nada se escribe a mano aquí.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteUrl).toString();
  const herramientas = herramientasPublicadas();
  const articulos = articulosPublicados();
  const ultima = (fechas: string[]) => fechas.slice().sort().at(-1)!;

  return [
    { url: url("/"), lastModified: HOME_UPDATED_AT },
    ...categoriasActivas().map((c) => ({
      url: url(rutaCategoria(c)),
      lastModified: ultima([...herramientas.filter((h) => h.categoria === c.slug).map((h) => h.fechaActualizacion), ...articulos.filter((a) => a.categoria === c.slug).map((a) => a.fechaActualizacion)]),
    })),
    ...herramientas.map((h) => ({ url: url(rutaHerramienta(h)), lastModified: h.fechaActualizacion })),
    ...articulos.map((a) => ({ url: url(rutaArticulo(a)), lastModified: a.fechaActualizacion })),
    ...institutionalPages.map((p) => ({ url: url(p.path), lastModified: p.updatedAt })),
  ];
}
