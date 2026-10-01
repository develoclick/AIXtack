/** Datos y catálogos de «Analizar ventas en Excel con IA». El cálculo, el prompt y el lector viven en los archivos hermanos. */

export const MAX_FILAS = 50_000;

export type TipoColumna = "fecha" | "numero" | "texto" | "vacio";

/** Lo que la página detecta de cada columna, sin leer el archivo completo en el prompt: solo este resumen. */
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

/** Campos que la página sugiere mapear a las columnas del archivo. Fecha e importe son los únicos obligatorios. */
export type CampoMapeo = "fecha" | "producto" | "categoria" | "cantidad" | "precio" | "importe" | "vendedor" | "cliente" | "sucursal" | "canal";

export const CAMPOS_MAPEO: { clave: CampoMapeo; etiqueta: string; obligatorio: boolean }[] = [
  { clave: "fecha", etiqueta: "Fecha", obligatorio: true },
  { clave: "importe", etiqueta: "Importe (monto vendido)", obligatorio: true },
  { clave: "producto", etiqueta: "Producto", obligatorio: false },
  { clave: "categoria", etiqueta: "Categoría", obligatorio: false },
  { clave: "cantidad", etiqueta: "Cantidad", obligatorio: false },
  { clave: "precio", etiqueta: "Precio unitario", obligatorio: false },
  { clave: "vendedor", etiqueta: "Vendedor", obligatorio: false },
  { clave: "cliente", etiqueta: "Cliente", obligatorio: false },
  { clave: "sucursal", etiqueta: "Sucursal", obligatorio: false },
  { clave: "canal", etiqueta: "Canal", obligatorio: false },
];

export type MapeoColumnas = Record<CampoMapeo, number | null>;

export function mapeoVacio(): MapeoColumnas {
  return { fecha: null, producto: null, categoria: null, cantidad: null, precio: null, importe: null, vendedor: null, cliente: null, sucursal: null, canal: null };
}

/** Una fila de ventas ya interpretada según el mapeo de columnas (campos de texto sin mapear quedan ""; los numéricos, null). */
export interface FilaVenta {
  fecha: string | null;
  producto: string;
  categoria: string;
  cantidad: number | null;
  precio: number | null;
  importe: number | null;
  vendedor: string;
  cliente: string;
  sucursal: string;
  canal: string;
}

export type ModoPrompt = "A" | "B";

export interface DatosAnalisisVentas {
  moneda: string;
  periodoDesde: string;
  periodoHasta: string;
  comparacionDesde: string;
  comparacionHasta: string;
  objetivo: string;
  contexto: string;
  modo: ModoPrompt;
  mapeo: MapeoColumnas;
  /** Respuesta pegada del prompt: se guarda porque el informe depende de ella. */
  respuestaAnalisis: string;
  /** Solo el nombre, para mostrarlo: el archivo en sí nunca se guarda (ni en este almacén ni en ningún servidor). */
  nombreArchivo: string;
}

export function datosVaciosAnalisisVentas(): DatosAnalisisVentas {
  return {
    moneda: "S/",
    periodoDesde: "",
    periodoHasta: "",
    comparacionDesde: "",
    comparacionHasta: "",
    objetivo: "",
    contexto: "",
    modo: "B",
    mapeo: mapeoVacio(),
    respuestaAnalisis: "",
    nombreArchivo: "",
  };
}

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

function normalizarMapeo(g: unknown): MapeoColumnas {
  const base = mapeoVacio();
  if (!g || typeof g !== "object") return base;
  const m = g as Partial<Record<CampoMapeo, unknown>>;
  const salida = { ...base };
  for (const { clave } of CAMPOS_MAPEO) {
    const v = m[clave];
    salida[clave] = typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : null;
  }
  return salida;
}

/** Normaliza datos guardados (localStorage) a la forma actual, tolerando campos faltantes o de otra versión. */
export function normalizarDatosAnalisisVentas(g: Partial<DatosAnalisisVentas> | Record<string, unknown> | null | undefined): DatosAnalisisVentas {
  const base = datosVaciosAnalisisVentas();
  if (!g || typeof g !== "object") return base;
  const r = g as Record<string, unknown>;
  return {
    ...base,
    ...(g as Partial<DatosAnalisisVentas>),
    moneda: texto(r.moneda, base.moneda),
    modo: r.modo === "A" ? "A" : "B",
    mapeo: normalizarMapeo(r.mapeo),
    respuestaAnalisis: texto(r.respuestaAnalisis),
    nombreArchivo: texto(r.nombreArchivo),
  };
}
