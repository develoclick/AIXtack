/**
 * Registro de prompts (rutas) del sitio. Cada entrada es una página /{categoria}/{slug}. Se agregan de una en una: primero se
 * termina y se aprueba una, y solo entonces se empieza la siguiente.
 */
export interface PromptMeta {
  slug: string;
  categoria: string;
  subcategoria: string;
  /** H1 de la página. */
  titulo: string;
  /** Título corto para tarjetas y listados. */
  tituloCorto: string;
  /** Meta descripción (140–160 caracteres). */
  descripcion: string;
  /** Resumen de una o dos frases para las tarjetas. */
  resumen: string;
  tipo: "cv-ats";
  /** Fechas reales (AAAA-MM-DD). */
  publicado: string;
  actualizado: string;
  /** Tiempo aproximado para completarlo. */
  tiempo: string;
}

export const prompts: PromptMeta[] = [
  {
    slug: "crear-cv-ats-formato-harvard",
    categoria: "carrera-y-empleo",
    subcategoria: "hoja-de-vida",
    titulo: "Crea tu CV desde cero en formato Harvard y que pase los filtros ATS",
    tituloCorto: "Crear un CV en formato Harvard que pase filtros ATS",
    descripcion: "Llena tus datos, copia el prompt listo y descarga tu hoja de vida en Word con formato Harvard optimizada para filtros ATS. Gratis y sin registro.",
    resumen: "Llena tus datos, copia el prompt que se arma solo y descarga tu hoja de vida en Word, con formato Harvard y pensada para los filtros ATS.",
    tipo: "cv-ats",
    publicado: "2026-09-25",
    actualizado: "2026-09-25",
    tiempo: "10–15 min",
  },
];

export const RUTA_CV = "/carrera-y-empleo/crear-cv-ats-formato-harvard";

export function rutaDePrompt(p: Pick<PromptMeta, "categoria" | "slug">): string {
  return `/${p.categoria}/${p.slug}`;
}

export function getPrompt(categoria: string, slug: string): PromptMeta | undefined {
  return prompts.find((p) => p.categoria === categoria && p.slug === slug);
}

export function promptsDeCategoria(categoria: string): PromptMeta[] {
  return prompts.filter((p) => p.categoria === categoria);
}
