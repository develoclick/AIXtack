import type { PostType } from "@/lib/types";

/**
 * ARTICLE y REVIEW no tienen una sección propia (aparecen en /noticias,
 * categorías y buscador); "Artículos" enlaza a noticias como listado más
 * cercano en vez de un /blog inexistente.
 */
export const postTypeListing: Record<PostType, { label: string; path: string }> = {
  ARTICLE: { label: "Artículos", path: "/noticias" },
  NEWS: { label: "Noticias", path: "/noticias" },
  TUTORIAL: { label: "Tutoriales", path: "/tutoriales" },
  GUIDE: { label: "Guías", path: "/guias" },
  REVIEW: { label: "Análisis", path: "/noticias" },
  COMPARISON: { label: "Comparativas", path: "/comparativas" },
};
