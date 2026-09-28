/** Datos y catálogos de «Evaluar una oferta laboral y negociar tu salario». El cálculo, el prompt y el lector viven en los archivos hermanos. */
export type Modalidad = "presencial" | "hibrido" | "remoto";
export type TipoVariable = "ninguno" | "monto" | "porcentaje" | "sueldos";
export type IdPrioridad = "dinero" | "remoto" | "aprendizaje" | "estabilidad" | "horario";

export const MODALIDADES: { valor: Modalidad; etiqueta: string }[] = [
  { valor: "presencial", etiqueta: "Presencial" },
  { valor: "hibrido", etiqueta: "Híbrido" },
  { valor: "remoto", etiqueta: "Remoto" },
];

export const TIPOS_VARIABLE: { valor: TipoVariable; etiqueta: string; ayuda: string }[] = [
  { valor: "ninguno", etiqueta: "No hay variable", ayuda: "Solo salario fijo." },
  { valor: "monto", etiqueta: "Monto anual máximo", ayuda: "Por ejemplo, hasta 4,000 al año." },
  { valor: "porcentaje", etiqueta: "% del fijo anual", ayuda: "Por ejemplo, hasta 10 % del salario fijo del año." },
  { valor: "sueldos", etiqueta: "Número de sueldos", ayuda: "Por ejemplo, hasta 1 sueldo mensual." },
];

export const PRIORIDADES: { id: IdPrioridad; etiqueta: string }[] = [
  { id: "dinero", etiqueta: "Dinero" },
  { id: "remoto", etiqueta: "Trabajo remoto" },
  { id: "aprendizaje", etiqueta: "Aprendizaje" },
  { id: "estabilidad", etiqueta: "Estabilidad" },
  { id: "horario", etiqueta: "Horario" },
];

export interface Beneficio {
  id: string;
  nombre: string;
  /** Valor anual que le pone la persona (texto). Solo cuenta si el beneficio es monetario. */
  valor: string;
  monetario: boolean;
}

export interface Referencia {
  id: string;
  /** Salario mensual bruto que informa la fuente (texto). */
  monto: string;
  fuente: string;
  /** Fecha de consulta (AAAA-MM-DD). */
  fecha: string;
}

export interface Oferta {
  nombre: string;
  /** Salario fijo mensual bruto (texto). */
  fijo: string;
  /** Pagos al año (12, 14, 15…). */
  pagos: string;
  variableTipo: TipoVariable;
  variableValor: string;
  /** % del variable que la persona considera seguro (escenario conservador). Por defecto 0. */
  variableSeguro: string;
  variableCondiciones: string;
  beneficios: Beneficio[];
  contrato: string;
  jornada: string;
  vacaciones: string;
  prueba: string;
  /** Días presenciales por semana (vacío: 5 si es presencial, 0 si es remoto). */
  diasPresencial: string;
}

export interface DatosSalario {
  cargo: string;
  ubicacion: string;
  modalidad: Modalidad;
  nivel: string;
  anios: string;
  formacion: string;
  competencias: string;
  moneda: string;
  ofertaA: Oferta;
  comparar: boolean;
  ofertaB: Oferta;
  actualSalario: string;
  actualBeneficios: string;
  referencias: Referencia[];
  transporteDia: string;
  comidaDia: string;
  /** Semanas que trabajas al año (48 si tienes 4 semanas de vacaciones). */
  semanas: string;
  /** % de descuentos (aportes e impuestos) que la persona estima para ver un neto aproximado. Opcional. */
  descuentoPct: string;
  minimo: string;
  objetivo: string;
  ancla: string;
  prioridades: IdPrioridad[];
}

let contador = 0;
/** Identificador único de un beneficio o una referencia (se llama desde eventos, nunca durante el render). */
export function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}${Date.now().toString(36)}${contador}`;
}

export function ofertaVacia(nombre: string): Oferta {
  return { nombre, fijo: "", pagos: "14", variableTipo: "ninguno", variableValor: "", variableSeguro: "0", variableCondiciones: "", beneficios: [], contrato: "", jornada: "", vacaciones: "", prueba: "", diasPresencial: "" };
}

export function datosVaciosSalario(): DatosSalario {
  return {
    cargo: "",
    ubicacion: "",
    modalidad: "hibrido",
    nivel: "",
    anios: "",
    formacion: "",
    competencias: "",
    moneda: "S/",
    ofertaA: ofertaVacia("Oferta A"),
    comparar: false,
    ofertaB: ofertaVacia("Oferta B"),
    actualSalario: "",
    actualBeneficios: "",
    referencias: [],
    transporteDia: "",
    comidaDia: "",
    semanas: "48",
    descuentoPct: "",
    minimo: "",
    objetivo: "",
    ancla: "",
    prioridades: PRIORIDADES.map((p) => p.id),
  };
}

/** Secciones de la respuesta, en el orden fijo que pide el prompt. */
export type ClaveRespuesta = "oferta" | "preguntas" | "cifras" | "argumentos" | "respuestas" | "margen" | "checklist" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "oferta", titulo: "Revisión de la oferta" },
  { clave: "preguntas", titulo: "Preguntas al reclutador" },
  { clave: "cifras", titulo: "Coherencia de mis cifras" },
  { clave: "argumentos", titulo: "Argumentos" },
  { clave: "respuestas", titulo: "Respuestas preparadas" },
  { clave: "margen", titulo: "Si no hay margen" },
  { clave: "checklist", titulo: "Checklist antes de aceptar" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

/** Las cuatro respuestas preparadas que pide el prompt. */
export const TIPOS_RESPUESTA = ["Expectativa salarial", "Presupuesto de la empresa", "Salario actual", "Correo de contraoferta"] as const;
