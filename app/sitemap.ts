import type { MetadataRoute } from "next";
import { categoriasDisponibles } from "@/content/categorias";
import { prompts, rutaDePrompt } from "@/content/prompts";
import { HOME_UPDATED_AT, institutionalPages, siteUrl } from "@/lib/site";

/** Solo URLs indexables que responden 200: portada, categorías abiertas, prompts publicados y páginas institucionales. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteUrl).toString();
  const ultima = (fechas: string[]) => fechas.slice().sort().at(-1)!;

  return [
    { url: url("/"), lastModified: HOME_UPDATED_AT },
    ...categoriasDisponibles.map((c) => ({
      url: url(`/${c.slug}`),
      lastModified: ultima(prompts.filter((p) => p.categoria === c.slug).map((p) => p.actualizado)),
    })),
    ...prompts.map((p) => ({ url: url(rutaDePrompt(p)), lastModified: p.actualizado })),
    ...institutionalPages.map((p) => ({ url: url(p.path), lastModified: p.updatedAt })),
  ];
}
