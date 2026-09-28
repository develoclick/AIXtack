/**
 * Vista de los artículos VISIBLES del catálogo central (content/catalogo/articulos.ts): publicados y de una categoría activa.
 * El texto de cada artículo vive en components/articulos/cuerpos.tsx.
 */
import { articulosPublicados, rutaArticulo } from "@/content/catalogo";
import type { ArticuloPublicado } from "@/content/catalogo";

export interface ArticuloMeta {
  slug: string;
  categoria: string;
  herramientaPrincipal: string;
  /** H1. */
  titulo: string;
  /** Título de la pestaña y de Google (≤ 60 caracteres). */
  metaTitulo: string;
  /** Meta descripción (≤ 155 caracteres). */
  descripcion: string;
  resumen: string;
  /** Texto de la tarjeta que lleva a la herramienta (distinto en cada artículo). */
  cta: string;
  publicado: string;
  actualizado: string;
  tiempoLectura: string;
  secciones: { id: string; titulo: string }[];
}

function aMeta(a: ArticuloPublicado): ArticuloMeta {
  return {
    slug: a.slug,
    categoria: a.categoria,
    herramientaPrincipal: a.herramientaPrincipal,
    titulo: a.titulo,
    metaTitulo: a.metaTitulo,
    descripcion: a.descripcion,
    resumen: a.resumen,
    cta: a.cta,
    publicado: a.fechaPublicacion,
    actualizado: a.fechaActualizacion,
    tiempoLectura: a.tiempoLectura,
    secciones: a.secciones,
  };
}

export const articulos: ArticuloMeta[] = articulosPublicados().map(aMeta);

export function getArticulo(categoria: string, slug: string): ArticuloMeta | undefined {
  return articulos.find((a) => a.categoria === categoria && a.slug === slug);
}

export function articulosDeCategoria(categoria: string): ArticuloMeta[] {
  return articulos.filter((a) => a.categoria === categoria);
}

export function rutaDeArticulo(a: Pick<ArticuloMeta, "categoria" | "slug">): string {
  return rutaArticulo(a);
}
