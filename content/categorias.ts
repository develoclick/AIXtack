/**
 * Taxonomía del sitio: 8 categorías, cada una con sus subcategorías. Solo las categorías con `disponible: true` tienen página
 * y entran en el sitemap; el resto se muestra en la portada como «Próximamente» (sin enlace) y se abre de una en una, cuando
 * su primera ruta esté terminada y aprobada.
 */
export interface Subcategoria {
  slug: string;
  nombre: string;
}

export type IconoCategoria = "briefcase" | "pen" | "sprout" | "clapperboard" | "chart" | "graduation" | "rocket" | "stethoscope";

export interface Categoria {
  slug: string;
  nombre: string;
  /** H1 de la página de la categoría. */
  titulo: string;
  descripcion: string;
  /** Introducción original de la página de la categoría (300+ palabras), un texto por párrafo. */
  introduccion?: string[];
  /** Preguntas frecuentes de la categoría (respuestas propias). */
  preguntas?: { q: string; a: string }[];
  icono: IconoCategoria;
  subcategorias: Subcategoria[];
  disponible: boolean;
}

export const categorias: Categoria[] = [
  {
    slug: "carrera-y-empleo",
    nombre: "Carrera y empleo",
    titulo: "Prompts para carrera y empleo",
    descripcion: "Herramientas y guías para preparar tu hoja de vida y tu búsqueda de empleo: formato ATS, palabras clave, verbos de acción y CV sin experiencia.",
    introduccion: [
      "Buscar trabajo en Perú y en el resto de Latinoamérica suele significar postular por portales de empleo, por LinkedIn o por el correo de la empresa. En la mayoría de los casos, lo primero que se evalúa es tu hoja de vida (en otros países la llaman currículum o CV): un documento de una o dos páginas que debe convencer a alguien que lee decenas en pocos minutos y que, muchas veces, pasa antes por un sistema de seguimiento de candidatos (ATS).",
      "Esta categoría reúne herramientas y guías para preparar ese primer paso con más orden y menos improvisación. Empezamos por la hoja de vida porque es el documento que casi todas las personas necesitan y el que más dudas genera: cuánto debe medir, qué se pone primero, cómo se escriben los logros, cómo se adapta a cada oferta y qué hacer cuando todavía no hay experiencia.",
      "Cada herramienta funciona igual: llenas un formulario con tus datos, el prompt se arma solo y lo pegas en el asistente de IA que prefieras. La IA redacta una primera versión, pero la revisión es tuya: los prompts le piden que no invente cifras, empresas ni fechas, y las guías explican qué comprobar antes de enviar. Nada de lo que escribes se envía a este sitio: se queda en tu navegador.",
      "Aquí encontrarás la herramienta para crear tu hoja de vida en formato Harvard y descargarla en Word, y tres artículos de apoyo: cómo sacar las palabras clave de una oferta laboral, qué verbos usar en tus viñetas y cómo armar un CV cuando aún no tienes experiencia laboral. Iremos sumando otros temas de la categoría, como cartas de presentación o entrevistas, cuando estén completos y no antes, para no llenar el sitio de páginas a medias.",
      "Una advertencia honesta: ninguna hoja de vida, por bien hecha que esté, garantiza una entrevista. Lo que sí puedes controlar es que tu documento sea claro, verdadero y esté adaptado a cada puesto. Ahí es donde estas herramientas te ahorran tiempo.",
    ],
    preguntas: [
      { q: "¿Por dónde empiezo si nunca he hecho una hoja de vida?", a: "Por la herramienta para crear tu CV: te pide tus datos paso a paso y hay un botón para ver un ejemplo completo antes de escribir nada. Si no tienes experiencia laboral, lee después el artículo sobre CV sin experiencia." },
      { q: "¿Necesito pagar algo o registrarme?", a: "No. Todo es gratis y sin cuentas. Para usar el prompt necesitas un asistente de IA; muchos ofrecen un plan gratuito, con límites que define cada empresa." },
      { q: "¿Las herramientas escriben mi CV por mí?", a: "Te ayudan a redactar una primera versión con tus datos, pero la revisión es tuya. Los prompts le piden a la IA que no invente nada, y aun así debes comprobar cada dato antes de enviar tu hoja de vida." },
    ],
    icono: "briefcase",
    disponible: true,
    subcategorias: [
      { slug: "hoja-de-vida", nombre: "Hoja de vida (CV)" },
      { slug: "cartas-de-presentacion", nombre: "Cartas de presentación" },
      { slug: "entrevistas", nombre: "Entrevistas de trabajo" },
      { slug: "linkedin", nombre: "LinkedIn y marca personal" },
      { slug: "busqueda-de-empleo", nombre: "Búsqueda de empleo" },
      { slug: "desarrollo-profesional", nombre: "Desarrollo profesional" },
    ],
  },
  {
    slug: "creatividad-y-contenido",
    nombre: "Creatividad y contenido",
    titulo: "Prompts para creatividad y contenido",
    descripcion: "Ideas, textos, guiones y publicaciones para crear contenido que la gente quiera leer, ver y compartir.",
    icono: "pen",
    disponible: false,
    subcategorias: [
      { slug: "escritura-creativa", nombre: "Escritura creativa" },
      { slug: "redes-sociales", nombre: "Redes sociales" },
      { slug: "guiones", nombre: "Guiones y storytelling" },
      { slug: "imagenes", nombre: "Imágenes con IA" },
      { slug: "marca-y-logos", nombre: "Marca y logos" },
    ],
  },
  {
    slug: "crecimiento-personal",
    nombre: "Crecimiento personal",
    titulo: "Prompts para crecimiento personal",
    descripcion: "Hábitos, metas, finanzas personales y bienestar, con un enfoque práctico y responsable.",
    icono: "sprout",
    disponible: false,
    subcategorias: [
      { slug: "habitos", nombre: "Hábitos y metas" },
      { slug: "finanzas-personales", nombre: "Finanzas personales" },
      { slug: "bienestar", nombre: "Bienestar y mindfulness" },
      { slug: "relaciones", nombre: "Relaciones" },
    ],
  },
  {
    slug: "cultura-y-entretenimiento",
    nombre: "Cultura y entretenimiento",
    titulo: "Prompts para cultura y entretenimiento",
    descripcion: "Libros, series, música, viajes y pasatiempos: descubre qué hacer y qué disfrutar.",
    icono: "clapperboard",
    disponible: false,
    subcategorias: [
      { slug: "libros", nombre: "Libros y lecturas" },
      { slug: "cine-y-series", nombre: "Cine y series" },
      { slug: "viajes", nombre: "Viajes y experiencias" },
      { slug: "hobbies", nombre: "Hobbies" },
    ],
  },
  {
    slug: "datos-y-analisis",
    nombre: "Datos y análisis",
    titulo: "Prompts para datos y análisis",
    descripcion: "Hojas de cálculo, análisis de datos y programación: de la pregunta a la conclusión que puedes usar.",
    icono: "chart",
    disponible: false,
    subcategorias: [
      { slug: "analisis-de-datos", nombre: "Análisis de datos" },
      { slug: "excel", nombre: "Excel y hojas de cálculo" },
      { slug: "programacion", nombre: "Programación y código" },
    ],
  },
  {
    slug: "educacion-y-aprendizaje",
    nombre: "Educación y aprendizaje",
    titulo: "Prompts para educación y aprendizaje",
    descripcion: "Estudiar mejor, entender temas difíciles, redactar trabajos y aprender idiomas.",
    icono: "graduation",
    disponible: false,
    subcategorias: [
      { slug: "estudio", nombre: "Estudio y organización" },
      { slug: "comprension", nombre: "Resúmenes y comprensión" },
      { slug: "redaccion-academica", nombre: "Redacción académica" },
      { slug: "idiomas", nombre: "Idiomas" },
    ],
  },
  {
    slug: "negocios-y-productividad",
    nombre: "Negocios y productividad",
    titulo: "Prompts para negocios y productividad",
    descripcion: "Marketing, ventas, atención al cliente y organización para trabajar mejor con menos horas.",
    icono: "rocket",
    disponible: false,
    subcategorias: [
      { slug: "marketing-y-ventas", nombre: "Marketing y ventas" },
      { slug: "atencion-al-cliente", nombre: "Atención al cliente" },
      { slug: "emprendimiento", nombre: "Emprendimiento" },
      { slug: "productividad", nombre: "Productividad y automatización" },
    ],
  },
  {
    slug: "profesiones-especializadas",
    nombre: "Profesiones especializadas",
    titulo: "Prompts para profesiones especializadas",
    descripcion: "Prompts para contextos profesionales concretos, siempre como apoyo y nunca como sustituto de un profesional.",
    icono: "stethoscope",
    disponible: false,
    subcategorias: [
      { slug: "legal", nombre: "Derecho y legal" },
      { slug: "salud", nombre: "Salud" },
      { slug: "finanzas", nombre: "Finanzas y contabilidad" },
      { slug: "ingenieria", nombre: "Ingeniería y arquitectura" },
    ],
  },
];

export const categoriasDisponibles = categorias.filter((c) => c.disponible);

export function getCategoria(slug: string): Categoria | undefined {
  return categorias.find((c) => c.slug === slug);
}
