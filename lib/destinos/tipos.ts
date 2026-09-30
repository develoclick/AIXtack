/** Datos y catálogos de «Descubrir destinos según tu presupuesto». El cálculo, el prompt y el lector viven en los archivos hermanos. */
export type TipoAlojamiento = "hotel" | "departamento" | "hostal" | "resort" | "todo-incluido";

export const ALOJAMIENTOS: { valor: TipoAlojamiento; etiqueta: string }[] = [
  { valor: "hotel", etiqueta: "Hotel" },
  { valor: "departamento", etiqueta: "Departamento o Airbnb" },
  { valor: "hostal", etiqueta: "Hostal" },
  { valor: "resort", etiqueta: "Resort" },
  { valor: "todo-incluido", etiqueta: "Todo incluido" },
];

export type Comodidad = "economica" | "media" | "alta";
export const COMODIDADES: { valor: Comodidad; etiqueta: string }[] = [
  { valor: "economica", etiqueta: "Económica" },
  { valor: "media", etiqueta: "Media" },
  { valor: "alta", etiqueta: "Alta" },
];

export type Preferencia = "playa" | "montana" | "ciudad" | "naturaleza";
export const PREFERENCIAS: { valor: Preferencia; etiqueta: string }[] = [
  { valor: "playa", etiqueta: "Playa" },
  { valor: "montana", etiqueta: "Montaña" },
  { valor: "ciudad", etiqueta: "Ciudad" },
  { valor: "naturaleza", etiqueta: "Naturaleza" },
];

export type Alcance = "cualquiera" | "nacional" | "internacional";
export const ALCANCES: { valor: Alcance; etiqueta: string }[] = [
  { valor: "cualquiera", etiqueta: "Nacional o internacional" },
  { valor: "nacional", etiqueta: "Solo nacional" },
  { valor: "internacional", etiqueta: "Solo internacional" },
];

export const MAX_DESTINOS = 8;
/** Tope de noches para la fórmula de «noches máximas viables» (evita resultados absurdos con presupuestos enormes). */
export const TOPE_NOCHES = 60;

export interface DatosDestinos {
  presupuesto: string;
  moneda: string;
  origen: string;
  viajeros: string;
  fechaInicio: string;
  fechaFin: string;
  /** Rango de noches que la persona puede quedarse (el prompt pide candidatos dentro de este rango). */
  nochesMin: string;
  nochesMax: string;
  /** Noches del simulador (dentro del rango); vacío = usa el máximo del rango. */
  nochesSimuladas: string;
  alojamiento: TipoAlojamiento;
  comodidad: Comodidad;
  preferencias: Preferencia[];
  alcance: Alcance;
  equipaje: string;
  /** Gasto diario por persona en el destino (comida, transporte local, actividades), estimación de la persona. */
  gastoDiario: string;
  /** Porcentaje de imprevistos sobre el presupuesto total. */
  imprevistos: string;
}

export function datosVaciosDestinos(): DatosDestinos {
  return {
    presupuesto: "",
    moneda: "S/",
    origen: "",
    viajeros: "",
    fechaInicio: "",
    fechaFin: "",
    nochesMin: "",
    nochesMax: "",
    nochesSimuladas: "",
    alojamiento: "hotel",
    comodidad: "media",
    preferencias: [],
    alcance: "cualquiera",
    equipaje: "",
    gastoDiario: "",
    imprevistos: "10",
  };
}

export type TipoDato = "real" | "estimacion" | "sin_dato";
export const TIPOS_DATO: { valor: TipoDato; etiqueta: string }[] = [
  { valor: "real", etiqueta: "Dato real (fuente y fecha de consulta)" },
  { valor: "estimacion", etiqueta: "Estimación" },
  { valor: "sin_dato", etiqueta: "Sin dato" },
];

/** Una fila de destino candidato, tal como la lee la página (el total, el por persona y el restante los recalcula la página). */
export interface FilaDestino {
  destino: string;
  fechas: string;
  noches: number | null;
  pasajePorPersona: number | null;
  alojamientoPorNoche: number | null;
  /** Total que escribió la IA (solo para comparar con el recalculado; la página nunca confía en este número). */
  totalDeclarado: number | null;
  fuentePasaje: string;
  fuenteAlojamiento: string;
  consultadoEn: string;
  tipoDato: TipoDato | null;
  tipoDatoTexto: string;
}

/** Secciones de la respuesta, en el orden fijo que pide el prompt (sin contar la primera línea de acceso). */
export type ClaveRespuesta = "destinos" | "gastos" | "recomendaciones" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "destinos", titulo: "Destinos candidatos" },
  { clave: "gastos", titulo: "Gastos que podrían encarecer" },
  { clave: "recomendaciones", titulo: "Recomendaciones para ahorrar" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];
