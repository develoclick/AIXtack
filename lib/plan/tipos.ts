/** Datos y catálogos de «Plan de búsqueda de empleo con IA y control de postulaciones». El cálculo, el prompt, el lector y el registro viven en los archivos hermanos. */
export type Modalidad = "cualquiera" | "presencial" | "hibrido" | "remoto";
export type Nivel = "sin-experiencia" | "junior" | "semi-senior" | "senior" | "direccion";
export type Contrato = "cualquiera" | "tiempo-completo" | "medio-tiempo" | "practicas" | "freelance";
export type Meta = "primer-empleo" | "cambio" | "ascenso" | "reinsercion" | "otro";
export type Cumple = "" | "si" | "parcial" | "no";

export const MODALIDADES: { valor: Modalidad; etiqueta: string }[] = [
  { valor: "cualquiera", etiqueta: "Cualquiera" },
  { valor: "presencial", etiqueta: "Presencial" },
  { valor: "hibrido", etiqueta: "Híbrido" },
  { valor: "remoto", etiqueta: "Remoto" },
];

export const NIVELES: { valor: Nivel; etiqueta: string }[] = [
  { valor: "sin-experiencia", etiqueta: "Sin experiencia laboral" },
  { valor: "junior", etiqueta: "Junior" },
  { valor: "semi-senior", etiqueta: "Semi senior" },
  { valor: "senior", etiqueta: "Senior" },
  { valor: "direccion", etiqueta: "Jefatura o dirección" },
];

export const CONTRATOS: { valor: Contrato; etiqueta: string }[] = [
  { valor: "cualquiera", etiqueta: "Cualquiera" },
  { valor: "tiempo-completo", etiqueta: "Tiempo completo" },
  { valor: "medio-tiempo", etiqueta: "Medio tiempo" },
  { valor: "practicas", etiqueta: "Prácticas" },
  { valor: "freelance", etiqueta: "Freelance o por proyectos" },
];

export const METAS: { valor: Meta; etiqueta: string }[] = [
  { valor: "primer-empleo", etiqueta: "Conseguir mi primer empleo" },
  { valor: "cambio", etiqueta: "Cambiar de rubro o de puesto" },
  { valor: "ascenso", etiqueta: "Ascender o cambiar a algo mejor" },
  { valor: "reinsercion", etiqueta: "Volver a trabajar tras una pausa" },
  { valor: "otro", etiqueta: "Otro" },
];

export const CUMPLES: { valor: Cumple; etiqueta: string }[] = [
  { valor: "", etiqueta: "Sin evaluar" },
  { valor: "si", etiqueta: "Sí, cumplo los obligatorios" },
  { valor: "parcial", etiqueta: "Cumplo algunos" },
  { valor: "no", etiqueta: "No cumplo varios" },
];

export const MAX_VACANTES = 5;
export const MAX_HORAS = 60;

export interface Vacante {
  id: string;
  empresa: string;
  puesto: string;
  ubicacion: string;
  /** Requisitos y condiciones tal como los dice el aviso (texto pegado o resumido por la persona). */
  resumen: string;
  /** Fecha límite para postular (AAAA-MM-DD), opcional. */
  limite: string;
  /** Lo que la persona cree que cumple de los requisitos obligatorios. */
  cumple: Cumple;
}

export interface DatosPlan {
  puesto: string;
  nivel: Nivel;
  ubicacion: string;
  modalidad: Modalidad;
  contrato: Contrato;
  sectores: string;
  competencias: string;
  /** Salario objetivo, opcional y en las palabras de la persona (por ejemplo, «S/ 2,500 mensuales brutos»). */
  salario: string;
  /** Horas por semana que puede dedicar a buscar (texto). */
  horas: string;
  meta: Meta;
  /** Resumen del CV o de la experiencia, opcional. */
  cv: string;
  vacantes: Vacante[];
}

let contador = 0;
/** Identificador único (se llama desde eventos, nunca durante el render). */
export function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}${Date.now().toString(36)}${contador}`;
}

export function vacanteVacia(id: string): Vacante {
  return { id, empresa: "", puesto: "", ubicacion: "", resumen: "", limite: "", cumple: "" };
}

export function datosVaciosPlan(): DatosPlan {
  return { puesto: "", nivel: "junior", ubicacion: "", modalidad: "cualquiera", contrato: "cualquiera", sectores: "", competencias: "", salario: "", horas: "", meta: "primer-empleo", cv: "", vacantes: [] };
}

/** Secciones de la respuesta, en el orden fijo que pide el prompt. */
export type ClaveRespuesta = "objetivo" | "distribucion" | "plan" | "criterios" | "evitar" | "plantillas" | "metricas" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "objetivo", titulo: "Objetivo" },
  { clave: "distribucion", titulo: "Distribución semanal" },
  { clave: "plan", titulo: "Plan de 4 semanas" },
  { clave: "criterios", titulo: "Criterios y priorización de vacantes" },
  { clave: "evitar", titulo: "Lo que no debo hacer" },
  { clave: "plantillas", titulo: "Plantillas" },
  { clave: "metricas", titulo: "Cómo leer mis métricas" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

/** Las tres plantillas que pide el prompt. */
export const TIPOS_PLANTILLA = ["Networking", "Seguimiento", "Agradecimiento"] as const;

/** Días de la semana en el orden en que el plan los usa. */
export const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"] as const;

/** Una tarea del plan (una fila de la tabla CSV que devuelve la IA). */
export interface FilaPlan {
  semana: number;
  dia: string;
  /** 0 = lunes … 6 = domingo; -1 si no se reconoció el día. */
  diaIdx: number;
  tarea: string;
  entregable: string;
  minutos: number | null;
}
