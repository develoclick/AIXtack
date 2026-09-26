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
  icono: IconoCategoria;
  subcategorias: Subcategoria[];
  disponible: boolean;
}

export const categorias: Categoria[] = [
  {
    slug: "carrera-y-empleo",
    nombre: "Carrera y empleo",
    titulo: "Prompts para carrera y empleo",
    descripcion: "Hoja de vida, cartas de presentación, entrevistas y búsqueda de trabajo: prompts para presentarte mejor y llegar a más entrevistas.",
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
