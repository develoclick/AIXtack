import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { categoriaReal, getHerramientaPublicada, rutaHerramienta } from "@/content/catalogo";
import type { HerramientaPublicada } from "@/content/catalogo";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/site";

/**
 * Ayudas para las páginas de herramienta con su propia carpeta (app/(site)/{categoria}/{slug}/page.tsx).
 * TODA página de herramienta debe empezar con `exigirPublicada(...)`: mientras la herramienta esté «pendiente» en el catálogo, su
 * URL responde 404 (así no se indexa una página a medias). Acepta el alias «empleabilidad-y-trabajo» de las rutas de trabajo.
 */
export function exigirPublicada(categoria: string, slug: string): HerramientaPublicada {
  const h = getHerramientaPublicada(categoriaReal(categoria), slug);
  if (!h) notFound();
  return h;
}

/** Metadatos (título, descripción, canonical, Open Graph y fechas) de una herramienta publicada, leídos del catálogo. */
export function metadataDeHerramienta(categoria: string, slug: string): Metadata {
  const h = getHerramientaPublicada(categoriaReal(categoria), slug);
  if (!h) return {};
  return buildMetadata({
    title: h.pagina.metaTitulo,
    absoluteTitle: true,
    description: h.pagina.descripcion,
    path: rutaHerramienta(h),
    image: `${siteUrl}/og/${h.categoria}/${h.slug}`,
    type: "article",
    article: { publishedTime: h.fechaPublicacion, modifiedTime: h.fechaActualizacion, authors: [getAuthor(AUTOR_POR_DEFECTO)!.name] },
  });
}
