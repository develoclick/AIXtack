/**
 * Mapa central de ilustraciones SVG contextuales (public/images/). Solo
 * cubre las categorías "flagship" (las 6 destacadas en portada) y las 14
 * profesiones — el resto del catálogo (94 categorías, cientos de
 * herramientas/prompts/posts) sigue usando su icono de lucide-react o su
 * avatar por defecto, que ya cumplen bien esa función a esa escala.
 */

export interface ImageAsset {
  src: string;
  alt: string;
}

export const flagshipCategoryImages: Record<string, ImageAsset> = {
  "generacion-de-imagenes": { src: "/images/categories/image-generation.svg", alt: "Generación de imágenes con IA" },
  escritura: { src: "/images/categories/writing.svg", alt: "Escritura y copywriting con IA" },
  productividad: { src: "/images/categories/productivity.svg", alt: "Productividad y automatización con IA" },
  programacion: { src: "/images/categories/programming.svg", alt: "Programación y código con IA" },
  "audio-y-voz": { src: "/images/categories/audio-voice.svg", alt: "Audio y voz con IA" },
  video: { src: "/images/categories/video.svg", alt: "Generación y edición de vídeo con IA" },
};

export const professionImages: Record<string, ImageAsset> = {
  programadores: { src: "/images/prompts/professions/programmers.svg", alt: "Prompts de IA para programadores" },
  marketing: { src: "/images/prompts/professions/marketing.svg", alt: "Prompts de IA para marketing digital" },
  disenadores: { src: "/images/prompts/professions/designers.svg", alt: "Prompts de IA para diseñadores gráficos" },
  abogados: { src: "/images/prompts/professions/lawyers.svg", alt: "Prompts de IA para abogados" },
  medicos: { src: "/images/prompts/professions/doctors.svg", alt: "Prompts de IA para médicos" },
  ingenieros: { src: "/images/prompts/professions/engineers.svg", alt: "Prompts de IA para ingenieros" },
  arquitectos: { src: "/images/prompts/professions/architects.svg", alt: "Prompts de IA para arquitectos" },
  profesores: { src: "/images/prompts/professions/teachers.svg", alt: "Prompts de IA para profesores" },
  contadores: { src: "/images/prompts/professions/accountants.svg", alt: "Prompts de IA para contadores" },
  emprendedores: { src: "/images/prompts/professions/entrepreneurs.svg", alt: "Prompts de IA para emprendedores" },
  ventas: { src: "/images/prompts/professions/sales.svg", alt: "Prompts de IA para ventas" },
  "recursos-humanos": { src: "/images/prompts/professions/human-resources.svg", alt: "Prompts de IA para Recursos Humanos" },
  "creadores-contenido": {
    src: "/images/prompts/professions/content-creators.svg",
    alt: "Prompts de IA para creadores de contenido",
  },
  estudiantes: { src: "/images/prompts/professions/students.svg", alt: "Prompts de IA para estudiantes" },
};
