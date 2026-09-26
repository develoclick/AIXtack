import type { MetadataRoute } from "next";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { categoriasDisponibles } from "@/content/categorias";
import { prompts, rutaDePrompt } from "@/content/prompts";
import { HOME_UPDATED_AT, institutionalPages, siteUrl } from "@/lib/site";

/** Solo URLs indexables que responden 200: portada, categorías abiertas, herramientas, artículos y páginas institucionales. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteUrl).toString();
  const contenidos = [...prompts.map((p) => ({ categoria: p.categoria, actualizado: p.actualizado, ruta: rutaDePrompt(p) })), ...articulos.map((a) => ({ categoria: a.categoria, actualizado: a.actualizado, ruta: rutaDeArticulo(a) }))];
  const ultima = (fechas: string[]) => fechas.slice().sort().at(-1)!;

  return [
    { url: url("/"), lastModified: HOME_UPDATED_AT },
    ...categoriasDisponibles.map((c) => ({ url: url(`/${c.slug}`), lastModified: ultima(contenidos.filter((x) => x.categoria === c.slug).map((x) => x.actualizado)) })),
    ...contenidos.map((x) => ({ url: url(x.ruta), lastModified: x.actualizado })),
    ...institutionalPages.map((p) => ({ url: url(p.path), lastModified: p.updatedAt })),
  ];
}
