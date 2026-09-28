/** Datos y catálogos de «Preparar una entrevista de trabajo». El prompt, el lector y las comprobaciones viven en los archivos hermanos. */
export type TipoEntrevista = "rrhh" | "tecnica" | "jefe" | "panel" | "caso";
export type ModoPractica = "banco" | "simulacion";
export type Dificultad = "basico" | "exigente";
export type IdiomaEntrevista = "es" | "en";

export const TIPOS_ENTREVISTA: { valor: TipoEntrevista; etiqueta: string; entrevistador: string; foco: string }[] = [
  { valor: "rrhh", etiqueta: "Recursos Humanos (filtro inicial)", entrevistador: "reclutador de Recursos Humanos", foco: "trayectoria, motivación, expectativas, ajuste con la empresa y datos básicos del puesto" },
  { valor: "tecnica", etiqueta: "Técnica", entrevistador: "entrevistador técnico", foco: "conocimientos, herramientas, criterio técnico y cómo resuelves problemas" },
  { valor: "jefe", etiqueta: "Con el jefe directo", entrevistador: "jefe directo del puesto", foco: "cómo trabajarías con esa persona, prioridades, autonomía y resultados esperados" },
  { valor: "panel", etiqueta: "Panel (varias personas)", entrevistador: "panel de entrevistadores de distintas áreas", foco: "preguntas de varias áreas, consistencia entre respuestas y manejo de la presión" },
  { valor: "caso", etiqueta: "Caso práctico", entrevistador: "entrevistador que plantea casos", foco: "razonamiento, estructura de la solución y claridad al explicarla" },
];

export const MODOS: { valor: ModoPractica; etiqueta: string; ayuda: string; regla: string }[] = [
  { valor: "banco", etiqueta: "Banco de preguntas + estructura de respuesta", ayuda: "Recibes preguntas probables por categoría, qué evalúa cada una y el esqueleto de tu respuesta.", regla: "entrega el banco de preguntas completo" },
  { valor: "simulacion", etiqueta: "Simulación en vivo", ayuda: "La IA te pregunta una a una, espera tu respuesta y te da retroalimentación; al final, un informe.", regla: "haz una simulación: una pregunta a la vez, sin mostrar el banco" },
];

export const DIFICULTADES: { valor: Dificultad; etiqueta: string; regla: string }[] = [
  { valor: "basico", etiqueta: "Básico", regla: "preguntas habituales y repreguntas sencillas para tomar confianza" },
  { valor: "exigente", etiqueta: "Exigente", regla: "preguntas que buscan los puntos débiles del CV y repreguntas incisivas, como en un proceso competitivo" },
];

export interface DatosEntrevista {
  cv: string;
  oferta: string;
  empresa: string;
  tipo: TipoEntrevista;
  /** Duración estimada de la entrevista, en texto libre («45 minutos»). */
  duracion: string;
  idioma: IdiomaEntrevista;
  destacar: string;
  temas: string;
  dificultad: Dificultad;
  modo: ModoPractica;
}

export function datosVaciosEntrevista(): DatosEntrevista {
  return { cv: "", oferta: "", empresa: "", tipo: "rrhh", duracion: "", idioma: "es", destacar: "", temas: "", dificultad: "basico", modo: "banco" };
}

/** Las 10 categorías de preguntas del banco. */
export const CATEGORIAS_PREGUNTA = [
  "Presentación",
  "Trayectoria",
  "Experiencia relacionada",
  "Técnicas",
  "Conductuales",
  "Situacionales",
  "Proyectos",
  "Fortalezas",
  "Áreas de mejora",
  "Específicas de la oferta",
] as const;

export type ClaveRespuesta = "mapa" | "riesgos" | "banco" | "temas" | "entrevistador" | "informe" | "verificar" | "siguiente";

export const TITULOS_BANCO: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "mapa", titulo: "Mapa del puesto" },
  { clave: "riesgos", titulo: "Riesgos del CV" },
  { clave: "banco", titulo: "Banco de preguntas" },
  { clave: "temas", titulo: "Temas a estudiar" },
  { clave: "entrevistador", titulo: "Preguntas para el entrevistador" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

export const TITULOS_SIMULACION: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "informe", titulo: "Informe de simulación" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

export const TIPOS_DE_RIESGO = ["VACÍO TEMPORAL", "CAMBIOS FRECUENTES", "REQUISITO NO EVIDENCIADO", "AFIRMACIÓN QUE GENERARÁ REPREGUNTAS"] as const;

/** Competencias de las historias STAR: las ocho que enumera la guía de entrevistas del Mignone Center (Harvard FAS), traducidas. */
export const COMPETENCIAS = [
  { id: "pensamiento-critico", nombre: "Pensamiento crítico" },
  { id: "aprendizaje", nombre: "Orientación al aprendizaje" },
  { id: "liderazgo", nombre: "Liderazgo" },
  { id: "problemas", nombre: "Resolución de problemas" },
  { id: "equipo", nombre: "Trabajo en equipo" },
  { id: "comunicacion", nombre: "Comunicación" },
  { id: "tecnicas", nombre: "Habilidades técnicas" },
  { id: "profesionalismo", nombre: "Profesionalismo" },
] as const;

export type IdCompetencia = (typeof COMPETENCIAS)[number]["id"];

export interface Historia {
  id: string;
  titulo: string;
  competencias: IdCompetencia[];
  situacion: string;
  tarea: string;
  accion: string;
  resultado: string;
}
