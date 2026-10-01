/** Datos y catálogos de «Convertir datos en gráficos». El cálculo, el prompt y el lector viven en los archivos hermanos. */

export const MAX_FILAS = 50_000;

export type TipoColumna = "fecha" | "numero" | "texto" | "vacio";

export interface ColumnaDetectada {
  nombre: string;
  indice: number;
  tipo: TipoColumna;
  pctVacios: number;
  valoresUnicos: number;
  minimo: string;
  maximo: string;
  muestra: string[];
}

export interface FichaDataset {
  archivo: string;
  hojas: string[];
  hojaActiva: string;
  totalFilas: number;
  truncado: boolean;
  columnas: ColumnaDetectada[];
}

export type Objetivo = "comparar" | "evolucionar" | "componer" | "distribuir" | "relacionar";

export const OBJETIVOS: { valor: Objetivo; etiqueta: string; pregunta: string }[] = [
  { valor: "comparar", etiqueta: "Comparar categorías", pregunta: "¿Qué categoría tiene más o menos?" },
  { valor: "evolucionar", etiqueta: "Ver evolución en el tiempo", pregunta: "¿Cómo cambió algo a lo largo del tiempo?" },
  { valor: "componer", etiqueta: "Ver composición de un total", pregunta: "¿Qué partes forman el total?" },
  { valor: "distribuir", etiqueta: "Ver distribución", pregunta: "¿Cómo se reparten los valores de una variable?" },
  { valor: "relacionar", etiqueta: "Ver relación entre 2 variables", pregunta: "¿Se mueven juntas 2 variables numéricas?" },
];

export type Agregacion = "suma" | "promedio" | "conteo";
export const AGREGACIONES: { valor: Agregacion; etiqueta: string }[] = [
  { valor: "suma", etiqueta: "Suma" },
  { valor: "promedio", etiqueta: "Promedio" },
  { valor: "conteo", etiqueta: "Conteo (número de filas)" },
];

export type Audiencia = "yo" | "jefe" | "cliente" | "redes";
export const AUDIENCIAS: { valor: Audiencia; etiqueta: string }[] = [
  { valor: "yo", etiqueta: "Para mí (análisis propio)" },
  { valor: "jefe", etiqueta: "Para mi jefe o socios" },
  { valor: "cliente", etiqueta: "Para un cliente" },
  { valor: "redes", etiqueta: "Para redes sociales" },
];

export type TipoGrafico = "barras" | "lineas" | "areas" | "dispersion" | "histograma" | "pastel" | "tabla";
export const TIPOS_GRAFICO: { valor: TipoGrafico; etiqueta: string }[] = [
  { valor: "barras", etiqueta: "Barras" },
  { valor: "lineas", etiqueta: "Líneas" },
  { valor: "areas", etiqueta: "Áreas" },
  { valor: "dispersion", etiqueta: "Dispersión" },
  { valor: "histograma", etiqueta: "Histograma" },
  { valor: "pastel", etiqueta: "Pastel" },
  { valor: "tabla", etiqueta: "Tabla" },
];

/** Columnas que elige la persona para el gráfico local inmediato (paso 1). Y y color son opcionales según el objetivo. */
export interface SeleccionColumnas {
  x: number | null;
  y: number | null;
  color: number | null;
}

export function seleccionVacia(): SeleccionColumnas {
  return { x: null, y: null, color: null };
}

export interface DatosConvertirGraficos {
  objetivo: Objetivo;
  audiencia: Audiencia;
  agregacion: Agregacion;
  unidad: string;
  seleccion: SeleccionColumnas;
  modo: "A" | "B";
  /** Respuesta pegada del prompt: se guarda porque el resultado depende de ella. */
  respuesta: string;
  /** Solo el nombre, para mostrarlo: el archivo o la tabla pegada en sí nunca se guarda (ni en este almacén ni en ningún servidor). */
  nombreOrigen: string;
}

export function datosVaciosConvertirGraficos(): DatosConvertirGraficos {
  return {
    objetivo: "comparar",
    audiencia: "yo",
    agregacion: "suma",
    unidad: "",
    seleccion: seleccionVacia(),
    modo: "B",
    respuesta: "",
    nombreOrigen: "",
  };
}

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

function normalizarSeleccion(g: unknown): SeleccionColumnas {
  const base = seleccionVacia();
  if (!g || typeof g !== "object") return base;
  const s = g as Partial<Record<keyof SeleccionColumnas, unknown>>;
  const num = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : null);
  return { x: num(s.x), y: num(s.y), color: num(s.color) };
}

export function normalizarDatosConvertirGraficos(g: Partial<DatosConvertirGraficos> | Record<string, unknown> | null | undefined): DatosConvertirGraficos {
  const base = datosVaciosConvertirGraficos();
  if (!g || typeof g !== "object") return base;
  const r = g as Record<string, unknown>;
  return {
    ...base,
    ...(g as Partial<DatosConvertirGraficos>),
    objetivo: OBJETIVOS.some((o) => o.valor === r.objetivo) ? (r.objetivo as Objetivo) : base.objetivo,
    audiencia: AUDIENCIAS.some((a) => a.valor === r.audiencia) ? (r.audiencia as Audiencia) : base.audiencia,
    agregacion: AGREGACIONES.some((a) => a.valor === r.agregacion) ? (r.agregacion as Agregacion) : base.agregacion,
    unidad: texto(r.unidad),
    seleccion: normalizarSeleccion(r.seleccion),
    modo: r.modo === "A" ? "A" : "B",
    respuesta: texto(r.respuesta),
    nombreOrigen: texto(r.nombreOrigen),
  };
}

/** Una fila genérica de la tabla, con el valor crudo (texto) de cada columna, indexado por nombre. */
export type FilaTabla = Record<string, string>;

/** Una especificación de gráfico leída de la respuesta (o armada localmente): qué columnas, qué tipo, qué agregación. La IA nunca calcula los valores: solo sugiere estos parámetros. */
export interface EspecificacionGrafico {
  pregunta: string;
  tipo: TipoGrafico;
  x: string;
  y: string;
  color: string;
  agregacion: Agregacion;
  titulo: string;
  advertencia: string;
}
