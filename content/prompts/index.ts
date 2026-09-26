/**
 * Registro de herramientas (rutas de prompts) del sitio. Cada entrada es una página /{categoria}/{slug}. Se agregan de una en
 * una: primero se termina y se aprueba una, y solo entonces se empieza la siguiente.
 */
export interface PromptMeta {
  slug: string;
  categoria: string;
  subcategoria: string;
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
  tipo: "cv-ats";
  /** Fechas reales (AAAA-MM-DD). */
  publicado: string;
  actualizado: string;
  /** Tiempo aproximado para completar la herramienta. */
  tiempo: string;
  /** Tiempo de lectura de la guía que acompaña a la herramienta (≈ 200 palabras por minuto). */
  tiempoLectura: string;
  /** Índice de contenidos de la guía: id de cada H2 y su título. */
  secciones: { id: string; titulo: string }[];
}

export const prompts: PromptMeta[] = [
  {
    slug: "crear-cv-ats-formato-harvard",
    categoria: "carrera-y-empleo",
    subcategoria: "hoja-de-vida",
    titulo: "Crea tu CV desde cero en formato Harvard y que pase los filtros ATS",
    tituloCorto: "Crear un CV en formato Harvard que pase filtros ATS",
    metaTitulo: "CV formato Harvard para ATS: crea y descarga en Word",
    descripcion: "Llena tus datos, copia el prompt y descarga tu hoja de vida en Word con formato Harvard, lista para filtros ATS. Gratis, sin registro y con ejemplos.",
    resumen: "Llena tus datos, copia el prompt que se arma solo y descarga tu hoja de vida en Word, con formato Harvard y pensada para los filtros ATS.",
    tipo: "cv-ats",
    publicado: "2026-09-25",
    actualizado: "2026-09-25",
    tiempo: "10–15 min",
    tiempoLectura: "20 min",
    secciones: [
      { id: "como-funciona", titulo: "Cómo funciona la herramienta" },
      { id: "ats", titulo: "Qué es un ATS y cómo filtra hojas de vida" },
      { id: "harvard", titulo: "El formato Harvard" },
      { id: "errores", titulo: "Errores que hacen fallar a un ATS" },
      { id: "prompt", titulo: "Cómo está hecho el prompt" },
      { id: "vinetas", titulo: "Viñetas con verbos de acción" },
      { id: "oferta", titulo: "Cómo adaptar tu CV a una oferta" },
      { id: "perfiles", titulo: "Perfil profesional por nivel" },
      { id: "ejemplo", titulo: "Ejemplo de resultado" },
      { id: "checklist", titulo: "Lista de revisión" },
      { id: "limites", titulo: "Límites y verificación" },
      { id: "preguntas", titulo: "Preguntas frecuentes" },
    ],
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
