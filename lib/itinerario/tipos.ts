/** Datos y catálogos de «Crear un itinerario de viaje día por día con IA». El cálculo, el prompt, el lector y el calendario viven en los archivos hermanos. */
export type Ritmo = "relajado" | "equilibrado" | "intenso";
export type Prioridad = "imprescindible" | "opcional";
export type Transporte = "a-pie" | "transporte-publico" | "auto" | "taxi";
export type Interes = "historia-y-cultura" | "naturaleza" | "gastronomia" | "compras" | "vida-nocturna" | "arte-y-museos" | "aventura" | "playa" | "con-ninos";

export const RITMOS: { valor: Ritmo; etiqueta: string; maxPorDia: number; ayuda: string }[] = [
  { valor: "relajado", etiqueta: "Relajado", maxPorDia: 2, ayuda: "Máximo 2 actividades principales por día, con tiempo de sobra." },
  { valor: "equilibrado", etiqueta: "Equilibrado", maxPorDia: 3, ayuda: "Máximo 3 actividades principales por día." },
  { valor: "intenso", etiqueta: "Intenso", maxPorDia: 4, ayuda: "Máximo 4 actividades principales por día, casi sin tiempo libre." },
];
export const maxPorDia = (r: Ritmo): number => RITMOS.find((x) => x.valor === r)!.maxPorDia;

export const TRANSPORTES: { valor: Transporte; etiqueta: string }[] = [
  { valor: "a-pie", etiqueta: "A pie" },
  { valor: "transporte-publico", etiqueta: "Transporte público" },
  { valor: "auto", etiqueta: "Auto propio o alquilado" },
  { valor: "taxi", etiqueta: "Taxi o aplicaciones de transporte" },
];

export const INTERESES: { valor: Interes; etiqueta: string }[] = [
  { valor: "historia-y-cultura", etiqueta: "Historia y cultura" },
  { valor: "naturaleza", etiqueta: "Naturaleza y aire libre" },
  { valor: "gastronomia", etiqueta: "Gastronomía" },
  { valor: "compras", etiqueta: "Compras" },
  { valor: "vida-nocturna", etiqueta: "Vida nocturna" },
  { valor: "arte-y-museos", etiqueta: "Arte y museos" },
  { valor: "aventura", etiqueta: "Aventura y deportes" },
  { valor: "playa", etiqueta: "Playa" },
  { valor: "con-ninos", etiqueta: "Actividades para niños" },
];

export const MAX_LUGARES = 20;

export interface Lugar {
  id: string;
  nombre: string;
  prioridad: Prioridad;
  /** Horario conocido, tal como lo escribe la persona (por ejemplo, «abre de 9:00 a 17:00, cerrado los lunes»). */
  horario: string;
  /** Reserva ya hecha, con fecha y hora, si la hay. */
  reserva: string;
}

export interface DatosItinerario {
  destino: string;
  fechaInicio: string;
  fechaFin: string;
  horaLlegada: string;
  horaSalida: string;
  ciudadLlegada: string;
  ciudadSalida: string;
  alojamiento: string;
  adultos: string;
  /** Edades de niños y otras necesidades del grupo, en texto libre. */
  viajerosTexto: string;
  movilidadReducida: boolean;
  presupuesto: string;
  intereses: Interes[];
  interesesTexto: string;
  ritmo: Ritmo;
  transporte: Transporte[];
  restricciones: string;
  lugares: Lugar[];
}

let contador = 0;
/** Identificador único de un lugar (se llama desde eventos, nunca durante el render). */
export function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}${Date.now().toString(36)}${contador}`;
}

export function lugarVacio(id: string): Lugar {
  return { id, nombre: "", prioridad: "imprescindible", horario: "", reserva: "" };
}

export function datosVaciosItinerario(): DatosItinerario {
  return {
    destino: "",
    fechaInicio: "",
    fechaFin: "",
    horaLlegada: "",
    horaSalida: "",
    ciudadLlegada: "",
    ciudadSalida: "",
    alojamiento: "",
    adultos: "",
    viajerosTexto: "",
    movilidadReducida: false,
    presupuesto: "",
    intereses: [],
    interesesTexto: "",
    ritmo: "equilibrado",
    transporte: [],
    restricciones: "",
    lugares: [],
  };
}

/** Secciones de la respuesta, en el orden fijo que pide el prompt. */
export type ClaveRespuesta = "itinerario" | "porque" | "planesB" | "presupuesto" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "itinerario", titulo: "Itinerario" },
  { clave: "porque", titulo: "Por qué este orden" },
  { clave: "planesB", titulo: "Planes B" },
  { clave: "presupuesto", titulo: "Presupuesto estimado" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

/** Tipos de bloque que puede traer la tabla del itinerario. */
export type TipoBloque = "imprescindible" | "opcional" | "comida" | "traslado" | "libre";
export const TIPOS_BLOQUE: { valor: TipoBloque; etiqueta: string }[] = [
  { valor: "imprescindible", etiqueta: "Imprescindible" },
  { valor: "opcional", etiqueta: "Opcional" },
  { valor: "comida", etiqueta: "Comida" },
  { valor: "traslado", etiqueta: "Traslado" },
  { valor: "libre", etiqueta: "Tiempo libre" },
];

/** Una fila de la tabla del itinerario (bloque de un día), tal como la lee la página. */
export interface FilaItinerario {
  dia: number;
  /** Fecha AAAA-MM-DD si la IA la escribió y es válida; cadena vacía si no. */
  fecha: string;
  zona: string;
  horaInicio: string;
  horaFin: string;
  actividad: string;
  /** null si el texto no coincide con ninguno de los 5 tipos: se muestra tal cual, sin clasificar. */
  tipo: TipoBloque | null;
  tipoTexto: string;
  lugar: string;
  nota: string;
  verificado: boolean | null;
}
