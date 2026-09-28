/** Datos y catálogos de «Comparar tu CV con una oferta laboral». El prompt, el lector, el cálculo y las comprobaciones viven en los archivos hermanos. */
export type Distingue = "si" | "no" | "nose";
export type TipoRequisito = "OBLIGATORIO" | "DESEABLE" | "NO ESPECIFICADO";
export type EstadoRequisito = "CUMPLE" | "PARCIAL" | "NO IDENTIFICADO" | "NO EVALUABLE";

export interface DatosAnalisis {
  cv: string;
  oferta: string;
  /** Peso de los requisitos obligatorios, de 0 a 100 (los deseables pesan el resto). Por defecto 70. */
  pesoObligatorio: number;
  /** Años de experiencia totales que declara la persona (texto: «0,7», «3»…). Sirve para verificar los requisitos de años. */
  anios: string;
  distingue: Distingue;
}

export function datosVaciosAnalisis(): DatosAnalisis {
  return { cv: "", oferta: "", pesoObligatorio: 70, anios: "", distingue: "nose" };
}

export const DISTINGUE: { valor: Distingue; etiqueta: string; regla: string }[] = [
  { valor: "si", etiqueta: "Sí, los distingue", regla: "la oferta distingue entre obligatorios y deseables: clasifícalos según su lenguaje" },
  { valor: "no", etiqueta: "No los distingue", regla: "la oferta NO distingue obligatorios de deseables: marca TODOS los requisitos como NO ESPECIFICADO" },
  { valor: "nose", etiqueta: "No lo sé", regla: "no se sabe si la oferta los distingue: clasifica según su lenguaje y usa NO ESPECIFICADO cuando no esté claro" },
];

export const TIPOS_REQUISITO: TipoRequisito[] = ["OBLIGATORIO", "DESEABLE", "NO ESPECIFICADO"];

/** Valor de cada estado en el cálculo del porcentaje. NO EVALUABLE no tiene valor: se excluye. */
export const ESTADOS: { estado: EstadoRequisito; valor: number | null; etiqueta: string; significa: string }[] = [
  { estado: "CUMPLE", valor: 1, etiqueta: "Cumple", significa: "el CV lo muestra explícitamente" },
  { estado: "PARCIAL", valor: 0.5, etiqueta: "Parcial", significa: "hay evidencia relacionada pero incompleta (por ejemplo, 8 meses cuando piden 1 año)" },
  { estado: "NO IDENTIFICADO", valor: 0, etiqueta: "No identificado", significa: "no aparece en el CV (no significa que la persona no lo tenga)" },
  { estado: "NO EVALUABLE", valor: null, etiqueta: "No evaluable", significa: "requisito subjetivo o no verificable por texto (por ejemplo, «proactivo»)" },
];

export const CATEGORIAS_REQUISITO = ["experiencia", "conocimientos técnicos", "tecnologías", "herramientas", "metodologías", "formación", "idiomas", "certificaciones", "otros"] as const;

export interface Requisito {
  id: string;
  requisito: string;
  categoria: string;
  /** null si el valor que escribió la IA no se reconoce (esa fila no cuenta en el cálculo). */
  tipo: TipoRequisito | null;
  estado: EstadoRequisito | null;
  evidencia: string;
}

/** Secciones de la respuesta, en el orden fijo que pide el prompt. */
export type ClaveRespuesta = "requisitos" | "palabras" | "fortalezas" | "brechas" | "verificar_ia" | "plan" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string; obligatoria: boolean }[] = [
  { clave: "requisitos", titulo: "Requisitos", obligatoria: true },
  { clave: "palabras", titulo: "Palabras clave faltantes", obligatoria: false },
  { clave: "fortalezas", titulo: "Fortalezas", obligatoria: false },
  { clave: "brechas", titulo: "Brechas", obligatoria: false },
  { clave: "verificar_ia", titulo: "A verificar", obligatoria: false },
  { clave: "plan", titulo: "Plan de acción", obligatoria: true },
  { clave: "verificar", titulo: "Qué debes verificar", obligatoria: false },
  { clave: "siguiente", titulo: "Siguiente paso", obligatoria: false },
];

export const CABECERA_CSV = "requisito,categoria,tipo,estado,evidencia";
