/** Datos del formulario de «Optimizar tu CV». */
export type Intensidad = "retoque" | "adaptacion" | "reestructuracion";
export type IdiomaSalida = "es" | "en";

export interface DatosOptimizar {
  /** CV actual, en texto. */
  cv: string;
  /** Oferta laboral completa. */
  oferta: string;
  intensidad: Intensidad;
  /** Lo que no se puede tocar (por ejemplo, títulos de cargos oficiales). */
  intocables: string;
  idioma: IdiomaSalida;
  /** Longitud máxima en páginas. */
  paginas: 1 | 2;
  pais: string;
  /** Datos nuevos que la persona quiere añadir (logros, cursos recientes). */
  datosNuevos: string;
}

export const INTENSIDADES: { valor: Intensidad; etiqueta: string; ayuda: string; regla: string }[] = [
  { valor: "retoque", etiqueta: "Retoque", ayuda: "Solo redacción y orden. Mantiene tu estructura.", regla: "solo corrige redacción, claridad, repeticiones y orden dentro de cada sección; NO cambia las secciones ni su orden" },
  { valor: "adaptacion", etiqueta: "Adaptación", ayuda: "Prioriza y reordena según la oferta.", regla: "además del retoque, prioriza y reordena la información según los requisitos de la oferta y renombra funciones con los términos de la oferta cuando describen lo mismo; mantiene las secciones" },
  { valor: "reestructuracion", etiqueta: "Reestructuración", ayuda: "Puede cambiar, unir o crear secciones.", regla: "puede cambiar, unir, dividir o reordenar secciones para lograr una estructura de una columna compatible con ATS; solo con la información del CV original" },
];

export function datosVaciosOptimizar(): DatosOptimizar {
  return { cv: "", oferta: "", intensidad: "adaptacion", intocables: "", idioma: "es", paginas: 1, pais: "Perú", datosNuevos: "" };
}

/** Secciones de la respuesta de la IA, en el orden fijo que pide el prompt. */
export type ClaveRespuesta = "diagnostico" | "cv" | "registro" | "eliminado" | "brechas" | "preguntas" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string; obligatoria: boolean }[] = [
  { clave: "diagnostico", titulo: "Diagnóstico", obligatoria: true },
  { clave: "cv", titulo: "CV optimizado", obligatoria: true },
  { clave: "registro", titulo: "Registro de cambios", obligatoria: true },
  { clave: "eliminado", titulo: "Eliminado o reorganizado", obligatoria: false },
  { clave: "brechas", titulo: "Brechas reales (tipo C)", obligatoria: true },
  { clave: "preguntas", titulo: "Preguntas para confirmar (tipo B)", obligatoria: true },
  { clave: "verificar", titulo: "Afirmaciones que debes verificar", obligatoria: true },
  { clave: "siguiente", titulo: "Siguiente paso", obligatoria: false },
];

export const TIPOS_DE_PROBLEMA = ["ESTRUCTURA", "CLARIDAD", "REDACCIÓN", "REPETICIÓN", "EXCESO", "SIN EVIDENCIA", "LOGRO POCO CLARO", "KEYWORD AUSENTE", "POCO RELEVANTE"] as const;
