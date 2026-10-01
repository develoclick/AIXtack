/** Datos y catálogos de «Segmentar clientes con RFM en Excel». El cálculo, el prompt y el lector viven en los archivos hermanos. */

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

/** Campos que la página sugiere mapear a las columnas del archivo. Solo el ID de cliente es obligatorio. */
export type CampoMapeo = "clienteId" | "fecha" | "importe" | "pedidos" | "ubicacion" | "canal" | "categoria";

export const CAMPOS_MAPEO: { clave: CampoMapeo; etiqueta: string; obligatorio: boolean }[] = [
  { clave: "clienteId", etiqueta: "ID de cliente", obligatorio: true },
  { clave: "fecha", etiqueta: "Fecha de compra", obligatorio: false },
  { clave: "importe", etiqueta: "Importe", obligatorio: false },
  { clave: "pedidos", etiqueta: "Nº de pedidos (si tu archivo ya viene uno por cliente)", obligatorio: false },
  { clave: "ubicacion", etiqueta: "Ubicación", obligatorio: false },
  { clave: "canal", etiqueta: "Canal", obligatorio: false },
  { clave: "categoria", etiqueta: "Categoría", obligatorio: false },
];

export type MapeoColumnas = Record<CampoMapeo, number | null>;

export function mapeoVacio(): MapeoColumnas {
  return { clienteId: null, fecha: null, importe: null, pedidos: null, ubicacion: null, canal: null, categoria: null };
}

/** ¿El archivo trae una fila por COMPRA (hay que agregar por cliente) o una fila por CLIENTE (ya viene resumido)? La persona lo decide: no se adivina. */
export type OrigenDatos = "transacciones" | "clientes";

export type Metodo = "rfm" | "reglas";

/** Una regla de segmentación personalizada: todos los campos son opcionales («no usar») salvo el nombre. Se evalúan en orden; la primera que calza gana. */
export interface ReglaSegmento {
  id: string;
  nombre: string;
  gastoMin: string;
  gastoMax: string;
  recenciaMinDias: string;
  recenciaMaxDias: string;
  pedidosMin: string;
  pedidosMax: string;
}

export function reglaVacia(id: string, nombre = ""): ReglaSegmento {
  return { id, nombre, gastoMin: "", gastoMax: "", recenciaMinDias: "", recenciaMaxDias: "", pedidosMin: "", pedidosMax: "" };
}

/** Las 5 franjas R y F de la matriz 5×5, con el nombre de segmento que les da esta página (editable por la persona). */
export const SIN_SEGMENTO = "Sin segmento";

export const CLAVES_SEGMENTO_RFM = ["campeones", "leales", "en_riesgo", "perdidos", "nuevos", "regulares"] as const;
export type ClaveSegmentoRFM = (typeof CLAVES_SEGMENTO_RFM)[number];

export const NOMBRES_RFM_POR_DEFECTO: Record<ClaveSegmentoRFM, string> = {
  campeones: "Campeones",
  leales: "Clientes leales",
  en_riesgo: "En riesgo",
  perdidos: "Perdidos",
  nuevos: "Nuevos",
  regulares: "Regulares",
};

export type NombresSegmentoRFM = Record<ClaveSegmentoRFM, string>;

export function nombresRfmPorDefecto(): NombresSegmentoRFM {
  return { ...NOMBRES_RFM_POR_DEFECTO };
}

export type ModoPrompt = "A" | "B";

export interface DatosSegmentarClientes {
  mapeo: MapeoColumnas;
  origenDatos: OrigenDatos;
  fechaReferencia: string;
  metodo: Metodo;
  tamanoMinimoSegmento: string;
  nombresRfm: NombresSegmentoRFM;
  reglas: ReglaSegmento[];
  negocio: string;
  modo: ModoPrompt;
  respuesta: string;
  nombreOrigen: string;
}

export function datosVaciosSegmentarClientes(): DatosSegmentarClientes {
  return {
    mapeo: mapeoVacio(),
    origenDatos: "transacciones",
    fechaReferencia: "",
    metodo: "rfm",
    tamanoMinimoSegmento: "20",
    nombresRfm: nombresRfmPorDefecto(),
    reglas: [reglaVacia("r1", "Clientes VIP"), reglaVacia("r2", "Clientes en riesgo")],
    negocio: "",
    modo: "B",
    respuesta: "",
    nombreOrigen: "",
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

function normalizarNombresRfm(g: unknown): NombresSegmentoRFM {
  const base = nombresRfmPorDefecto();
  if (!g || typeof g !== "object") return base;
  const m = g as Partial<Record<ClaveSegmentoRFM, unknown>>;
  const salida = { ...base };
  for (const clave of CLAVES_SEGMENTO_RFM) salida[clave] = texto(m[clave], base[clave]) || base[clave];
  return salida;
}

function normalizarReglas(g: unknown): ReglaSegmento[] {
  if (!Array.isArray(g) || g.length === 0) return datosVaciosSegmentarClientes().reglas;
  return g.slice(0, 10).map((r, i) => {
    const o = (r && typeof r === "object" ? r : {}) as Partial<ReglaSegmento>;
    return { id: texto(o.id) || `r${i + 1}`, nombre: texto(o.nombre), gastoMin: texto(o.gastoMin), gastoMax: texto(o.gastoMax), recenciaMinDias: texto(o.recenciaMinDias), recenciaMaxDias: texto(o.recenciaMaxDias), pedidosMin: texto(o.pedidosMin), pedidosMax: texto(o.pedidosMax) };
  });
}

/** Normaliza datos guardados (localStorage) a la forma actual, tolerando campos faltantes o de otra versión. */
export function normalizarDatosSegmentarClientes(g: Partial<DatosSegmentarClientes> | Record<string, unknown> | null | undefined): DatosSegmentarClientes {
  const base = datosVaciosSegmentarClientes();
  if (!g || typeof g !== "object") return base;
  const r = g as Record<string, unknown>;
  return {
    ...base,
    ...(g as Partial<DatosSegmentarClientes>),
    mapeo: normalizarMapeo(r.mapeo),
    origenDatos: r.origenDatos === "clientes" ? "clientes" : "transacciones",
    fechaReferencia: texto(r.fechaReferencia),
    metodo: r.metodo === "reglas" ? "reglas" : "rfm",
    tamanoMinimoSegmento: texto(r.tamanoMinimoSegmento, base.tamanoMinimoSegmento),
    nombresRfm: normalizarNombresRfm(r.nombresRfm),
    reglas: normalizarReglas(r.reglas),
    negocio: texto(r.negocio),
    modo: r.modo === "A" ? "A" : "B",
    respuesta: texto(r.respuesta),
    nombreOrigen: texto(r.nombreOrigen),
  };
}
