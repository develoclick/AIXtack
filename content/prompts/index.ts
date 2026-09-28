/**
 * Vista de las herramientas PUBLICADAS del catálogo central (content/catalogo). No guarda datos: todo sale de
 * content/catalogo/herramientas.ts, así que una herramienta pendiente no existe para el resto del sitio.
 */
import { herramientasPublicadas, rutaHerramienta } from "@/content/catalogo";
import type { HerramientaPublicada } from "@/content/catalogo";

export interface PromptMeta {
  slug: string;
  categoria: string;
  /** H1 de la página. */
  titulo: string;
  /** Título corto para tarjetas y listados. */
  tituloCorto: string;
  /** Título de la pestaña y de Google (≤ 60 caracteres). */
  metaTitulo: string;
  /** Meta descripción (≤ 155 caracteres). */
  descripcion: string;
  /** Resumen de una o dos frases para las tarjetas. */
  resumen: string;
  queObtienes?: string;
  tipo: "cv-ats" | "pagina-propia";
  /** Fechas reales (AAAA-MM-DD). */
  publicado: string;
  actualizado: string;
  tiempo: string;
  tiempoLectura: string;
  secciones: { id: string; titulo: string }[];
  etiquetaBoton?: string;
  etiquetas?: string[];
}

function aMeta(h: HerramientaPublicada): PromptMeta {
  const p = h.pagina;
  return {
    slug: h.slug,
    categoria: h.categoria,
    titulo: p.h1,
    tituloCorto: p.tituloCorto,
    metaTitulo: p.metaTitulo,
    descripcion: p.descripcion,
    resumen: p.resumen ?? h.descripcionCorta,
    queObtienes: p.queObtienes,
    tipo: p.tipo,
    publicado: h.fechaPublicacion,
    actualizado: h.fechaActualizacion,
    tiempo: p.tiempo,
    tiempoLectura: p.tiempoLectura,
    secciones: p.secciones,
    etiquetaBoton: p.etiquetaBoton,
    etiquetas: p.etiquetas,
  };
}

export const prompts: PromptMeta[] = herramientasPublicadas().map(aMeta);

export const RUTA_CV = "/carrera-y-empleo/crear-cv-ats-formato-harvard";

export function rutaDePrompt(p: Pick<PromptMeta, "categoria" | "slug">): string {
  return rutaHerramienta(p);
}

export function getPrompt(categoria: string, slug: string): PromptMeta | undefined {
  return prompts.find((p) => p.categoria === categoria && p.slug === slug);
}

export function promptsDeCategoria(categoria: string): PromptMeta[] {
  return prompts.filter((p) => p.categoria === categoria);
}
