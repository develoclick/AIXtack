/** Datos y catálogos de «Comparar opciones de viaje». El cálculo, el prompt, el lector y el análisis viven en los archivos hermanos. */
export type TipoComparacion = "destino" | "alojamiento" | "transporte" | "paquete";

export const TIPOS_COMPARACION: { valor: TipoComparacion; etiqueta: string; ayuda: string }[] = [
  { valor: "destino", etiqueta: "Destinos", ayuda: "Ciudades o lugares distintos para el mismo viaje." },
  { valor: "alojamiento", etiqueta: "Alojamientos", ayuda: "Hoteles, hostales, apartamentos o casas en el mismo destino." },
  { valor: "transporte", etiqueta: "Transporte", ayuda: "Vuelos, buses u otras formas de llegar." },
  { valor: "paquete", etiqueta: "Paquetes turísticos", ayuda: "Paquetes que combinan vuelo, hotel u otros servicios." },
];

export const MIN_OPCIONES = 2;
export const MAX_OPCIONES = 5;

export interface Opcion {
  id: string;
  nombre: string;
  precio: string;
  moneda: string;
  /** Qué incluye el precio (texto libre). */
  incluye: string;
  /** Extras conocidos, en texto libre (equipaje, tasas, resort fee...). */
  extrasConocidos: string;
  /** Suma de esos extras, en la misma moneda, para el cálculo del costo total ajustado (opcional). */
  costoExtra: string;
  /** Duración u horarios (texto libre: noches, horas de vuelo, horario de salida...). */
  duracion: string;
  /** Horas de trayecto puerta a puerta, para convertirlas en costo si se indica un valor por hora (opcional). */
  horasTrayecto: string;
  ubicacion: string;
  /** Condiciones de cancelación o cambio. */
  condiciones: string;
  enlace: string;
}

let contador = 0;
/** Identificador único de una opción o un criterio (se llama desde eventos, nunca durante el render). */
export function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}${Date.now().toString(36)}${contador}`;
}

export function opcionVacia(id: string): Opcion {
  return { id, nombre: "", precio: "", moneda: "S/", incluye: "", extrasConocidos: "", costoExtra: "", duracion: "", horasTrayecto: "", ubicacion: "", condiciones: "", enlace: "" };
}

export interface Criterio {
  id: string;
  nombre: string;
  /** Peso en puntos, como texto (los 5 predefinidos reparten 100; uno agregado por la persona empieza en 0). */
  peso: string;
  /** Predefinido por la página (no se puede borrar el nombre, solo el peso) o agregado por la persona. */
  predefinido: boolean;
}

export const CRITERIOS_PREDEFINIDOS: { id: string; nombre: string; pesoInicial: number }[] = [
  { id: "precio", nombre: "Precio", pesoInicial: 25 },
  { id: "tiempo", nombre: "Tiempo", pesoInicial: 15 },
  { id: "comodidad", nombre: "Comodidad", pesoInicial: 20 },
  { id: "ubicacion", nombre: "Ubicación", pesoInicial: 15 },
  { id: "flexibilidad", nombre: "Flexibilidad", pesoInicial: 10 },
  { id: "actividades", nombre: "Actividades", pesoInicial: 15 },
];

export const MAX_CRITERIOS = 8;

/** Puntuación (1 a 5) de cada opción en cada criterio: puntuaciones[opcionId][criterioId]. */
export type Puntuaciones = Record<string, Record<string, string>>;

export interface DatosComparar {
  tipo: TipoComparacion;
  opciones: Opcion[];
  viajeros: string;
  fechas: string;
  /** Valor de una hora de tu tiempo, en la misma moneda, para el costo total ajustado (opcional). */
  valorTiempo: string;
  criterios: Criterio[];
  puntuaciones: Puntuaciones;
}

export function datosVaciosComparar(): DatosComparar {
  const idA = "o1";
  const idB = "o2";
  return {
    tipo: "alojamiento",
    opciones: [{ ...opcionVacia(idA) }, { ...opcionVacia(idB) }],
    viajeros: "",
    fechas: "",
    valorTiempo: "",
    criterios: CRITERIOS_PREDEFINIDOS.map((c) => ({ id: c.id, nombre: c.nombre, peso: String(c.pesoInicial), predefinido: true })),
    puntuaciones: {},
  };
}

/** Secciones de la respuesta, en el orden fijo que pide el prompt. */
export type ClaveRespuesta = "tabla" | "costos" | "diferencias" | "ventajas" | "prioridades" | "preguntas" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "tabla", titulo: "Tabla comparativa" },
  { clave: "costos", titulo: "Costos a verificar" },
  { clave: "diferencias", titulo: "Diferencias que importan" },
  { clave: "ventajas", titulo: "Ventajas y desventajas" },
  { clave: "prioridades", titulo: "Si cambian mis prioridades" },
  { clave: "preguntas", titulo: "Preguntas antes de reservar" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];
