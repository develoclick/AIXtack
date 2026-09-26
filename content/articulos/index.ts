/**
 * Artículos de apoyo de la categoría «Carrera y empleo». Cada uno resuelve una duda concreta que aparece al usar la herramienta
 * del CV y enlaza de vuelta a ella. El cuerpo de cada artículo vive en components/articulos/cuerpos.tsx.
 */
export interface ArticuloMeta {
  slug: string;
  categoria: string;
  subcategoria: string;
  /** H1. */
  titulo: string;
  /** Título de la pestaña y de Google (≤ 60 caracteres). */
  metaTitulo: string;
  /** Meta descripción (≤ 155 caracteres). */
  descripcion: string;
  /** Resumen de las tarjetas. */
  resumen: string;
  /** Texto de la tarjeta que lleva a la herramienta (distinto en cada artículo). */
  cta: string;
  publicado: string;
  actualizado: string;
  /** Tiempo de lectura (≈ 200 palabras por minuto; lo comprueba qa/auditoria.ts). */
  tiempoLectura: string;
  /** Índice de contenidos: id de cada H2 y su título. */
  secciones: { id: string; titulo: string }[];
}

export const articulos: ArticuloMeta[] = [
  {
    slug: "palabras-clave-cv-oferta-laboral",
    categoria: "carrera-y-empleo",
    subcategoria: "hoja-de-vida",
    titulo: "Cómo encontrar las palabras clave de una oferta laboral y usarlas en tu CV sin mentir",
    metaTitulo: "Palabras clave de una oferta laboral para tu CV",
    descripcion: "Aprende a leer una oferta de empleo, sacar las palabras clave que sí dominas y usarlas en tu hoja de vida sin exagerar. Con ejemplo y tabla paso a paso.",
    resumen: "Un método para leer una oferta, sacar sus palabras clave y ponerlas en tu hoja de vida solo cuando de verdad las tienes.",
    cta: "Pega la oferta en la herramienta y el prompt le pedirá a la IA que use solo las palabras clave que tus datos respaldan, y que te avise de las que faltan.",
    publicado: "2026-09-25",
    actualizado: "2026-09-25",
    tiempoLectura: "8 min",
    secciones: [
      { id: "que-es", titulo: "Qué es una palabra clave en una oferta" },
      { id: "paso-a-paso", titulo: "Cómo sacarlas, paso a paso" },
      { id: "ejemplo", titulo: "Ejemplo trabajado" },
      { id: "donde", titulo: "Dónde ponerlas en tu CV" },
      { id: "sin-mentir", titulo: "Cómo usarlas sin mentir ni exagerar" },
      { id: "variantes", titulo: "Siglas, sinónimos e idioma" },
      { id: "errores", titulo: "Errores frecuentes" },
      { id: "preguntas", titulo: "Preguntas frecuentes" },
    ],
  },
  {
    slug: "verbos-de-accion-para-cv",
    categoria: "carrera-y-empleo",
    subcategoria: "hoja-de-vida",
    titulo: "Verbos de acción para tu hoja de vida: lista por área con ejemplos",
    metaTitulo: "Verbos de acción para tu CV: lista por área y ejemplos",
    descripcion: "Lista de verbos de acción en español para tu hoja de vida, organizada por área, con viñetas buenas y malas y una guía para no exagerar tu nivel.",
    resumen: "Verbos por área, viñetas antes y después, y cómo elegir el verbo que refleja de verdad tu nivel de responsabilidad.",
    cta: "Escribe tus logros con tus propias palabras: el prompt de la herramienta le pide a la IA que los convierta en viñetas con verbo de acción, sin inventar cifras.",
    publicado: "2026-09-25",
    actualizado: "2026-09-25",
    tiempoLectura: "8 min",
    secciones: [
      { id: "por-que", titulo: "Por qué empezar cada viñeta con un verbo" },
      { id: "formula", titulo: "La fórmula de una buena viñeta" },
      { id: "por-area", titulo: "Verbos por área de trabajo" },
      { id: "debiles", titulo: "Verbos débiles y con qué reemplazarlos" },
      { id: "nivel", titulo: "Cómo elegir el verbo según tu nivel" },
      { id: "tiempos", titulo: "Tiempos verbales y persona" },
      { id: "ejemplos", titulo: "Viñetas antes y después" },
      { id: "preguntas", titulo: "Preguntas frecuentes" },
    ],
  },
  {
    slug: "cv-sin-experiencia",
    categoria: "carrera-y-empleo",
    subcategoria: "hoja-de-vida",
    titulo: "Cómo hacer un CV sin experiencia laboral: guía paso a paso con ejemplos",
    metaTitulo: "CV sin experiencia laboral: cómo armarlo paso a paso",
    descripcion: "Qué poner en tu hoja de vida si aún no has trabajado: prácticas, proyectos, voluntariado y cursos. Estructura, ejemplos y errores que conviene evitar.",
    resumen: "Cómo armar una hoja de vida convincente con prácticas, proyectos, voluntariado y estudios cuando aún no tienes un empleo formal.",
    cta: "Elige el nivel «Sin experiencia laboral» en la herramienta y cuenta tus proyectos, prácticas y voluntariado: la educación va primero y el Word sale listo.",
    publicado: "2026-09-25",
    actualizado: "2026-09-25",
    tiempoLectura: "7 min",
    secciones: [
      { id: "que-cuenta", titulo: "Qué cuenta como experiencia" },
      { id: "estructura", titulo: "Estructura recomendada" },
      { id: "pasos", titulo: "Paso a paso" },
      { id: "perfil", titulo: "Cómo escribir el perfil profesional" },
      { id: "ejemplos", titulo: "Ejemplos de viñetas sin empleo formal" },
      { id: "evitar", titulo: "Qué no poner" },
      { id: "brechas", titulo: "Si tienes períodos sin estudiar ni trabajar" },
      { id: "preguntas", titulo: "Preguntas frecuentes" },
    ],
  },
];

export function getArticulo(categoria: string, slug: string): ArticuloMeta | undefined {
  return articulos.find((a) => a.categoria === categoria && a.slug === slug);
}

export function articulosDeCategoria(categoria: string): ArticuloMeta[] {
  return articulos.filter((a) => a.categoria === categoria);
}

export function rutaDeArticulo(a: Pick<ArticuloMeta, "categoria" | "slug">): string {
  return `/${a.categoria}/${a.slug}`;
}
