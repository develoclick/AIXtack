/** Datos y catálogos de «Fechas más baratas para volar». El cálculo, el prompt, el lector y el análisis viven en los archivos hermanos. */
export type Equipaje = "cualquiera" | "solo-mano" | "con-bodega";

export const EQUIPAJES: { valor: Equipaje; etiqueta: string }[] = [
  { valor: "cualquiera", etiqueta: "Cualquiera" },
  { valor: "solo-mano", etiqueta: "Solo equipaje de mano" },
  { valor: "con-bodega", etiqueta: "Con equipaje de bodega" },
];

/** Combinaciones que se generan como máximo en el navegador; con periodos muy largos, se avisa y se trunca. */
export const MAX_COMBINACIONES = 500;
/** Duraciones distintas que acepta el formulario. */
export const MAX_DURACIONES = 6;

export interface DatosFechas {
  origen: string;
  destino: string;
  fechaInicio: string;
  fechaFin: string;
  /** Duraciones en noches, como las escribió la persona (p. ej. «5, 6, 7»). */
  duraciones: string;
  adultos: string;
  ninos: string;
  infantes: string;
  soloDirectos: boolean;
  evitarMadrugada: boolean;
  equipaje: Equipaje;
  aeropuertosAlternativos: string;
  aerolineasExcluir: string;
  /** Costo adicional de equipaje de bodega por persona, para el ajuste de precio real (opcional). */
  costoEquipajeBodega: string;
  /** Costo adicional de traslados por viaje, para el ajuste de precio real (opcional). */
  costoTraslados: string;
}

export function datosVaciosFechas(): DatosFechas {
  return {
    origen: "",
    destino: "",
    fechaInicio: "",
    fechaFin: "",
    duraciones: "",
    adultos: "",
    ninos: "0",
    infantes: "0",
    soloDirectos: false,
    evitarMadrugada: false,
    equipaje: "cualquiera",
    aeropuertosAlternativos: "",
    aerolineasExcluir: "",
    costoEquipajeBodega: "",
    costoTraslados: "",
  };
}

/** Una combinación posible de ida y vuelta, generada por la página (nunca por la IA). */
export interface Combinacion {
  id: string;
  ida: string;
  vuelta: string;
  noches: number;
}

/** Secciones de la respuesta, en el orden fijo que pide el prompt (sin contar la primera línea de acceso a datos). */
export type ClaveRespuesta = "combinaciones" | "patrones" | "costos" | "antes" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "combinaciones", titulo: "Combinaciones" },
  { clave: "patrones", titulo: "Patrones observados" },
  { clave: "costos", titulo: "Costos no incluidos" },
  { clave: "antes", titulo: "Antes de comprar" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

/** Una fila de precios (combinación consultada), tal como la lee la página. */
export interface FilaPrecio {
  ida: string;
  vuelta: string;
  /** Noches escritas por la IA en la fila (puede no coincidir con vuelta − ida; la página avisa si difieren). */
  noches: number | null;
  precioTotal: number | null;
  moneda: string;
  precioPorPersona: number | null;
  aerolinea: string;
  horarioIda: string;
  horarioVuelta: string;
  escalas: string;
  equipaje: string;
  condiciones: string;
  fuente: string;
  consultadoEn: string;
  /** true solo si trae fuente Y fecha/hora de consulta. */
  verificada: boolean;
}

export const DIAS_SEMANA = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"] as const;
