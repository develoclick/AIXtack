/** Datos y catálogos de «Calcular la rentabilidad de tu negocio por producto». El cálculo, el prompt y el lector viven en los archivos hermanos. */
export type Periodo = "mes" | "trimestre" | "año";
export const PERIODOS: { valor: Periodo; etiqueta: string }[] = [
  { valor: "mes", etiqueta: "Un mes" },
  { valor: "trimestre", etiqueta: "Un trimestre" },
  { valor: "año", etiqueta: "Un año" },
];

export interface Producto {
  id: string;
  nombre: string;
  /** Precio de venta por unidad. */
  precio: string;
  /** Costo directo por unidad (insumos, materia prima, o costo de la hora si es un servicio). */
  costo: string;
  unidades: string;
}
export function productoVacio(id: string): Producto {
  return { id, nombre: "", precio: "", costo: "", unidades: "" };
}

export interface ItemMonto {
  id: string;
  concepto: string;
  monto: string;
}
export function itemVacio(id: string): ItemMonto {
  return { id, concepto: "", monto: "" };
}

let contador = 0;
/** Identificador único de un producto o ítem (se llama desde eventos, nunca durante el render). */
export function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}${Date.now().toString(36)}${contador}`;
}

export const MAX_PRODUCTOS = 20;
export const MAX_COSTOS_FIJOS = 15;

export type TipoVariableAdicional = "porcentaje" | "monto";

export interface DatosRentabilidad {
  periodo: Periodo;
  productos: Producto[];
  /** Comisiones, envíos, pasarela de pago: como % de los ingresos o como monto fijo del período. */
  costosVariablesTipo: TipoVariableAdicional;
  costosVariablesValor: string;
  costosFijos: ItemMonto[];
  /** ¿El costo del sueldo del dueño ya está incluido en algún costo fijo? */
  incluyeSueldo: boolean;
  /** Impuestos que la persona conoce (solo para que la IA los mencione; la página no los resta del cálculo). */
  impuestosConocidos: string;
  /** Utilidad que le gustaría alcanzar en el período (opcional): calcula las ventas mínimas para llegar a ella. */
  objetivoUtilidad: string;
}

export function datosVaciosRentabilidad(): DatosRentabilidad {
  return {
    periodo: "mes",
    productos: [productoVacio(nuevoId("p"))],
    costosVariablesTipo: "porcentaje",
    costosVariablesValor: "",
    costosFijos: [itemVacio(nuevoId("f"))],
    incluyeSueldo: false,
    impuestosConocidos: "",
    objetivoUtilidad: "",
  };
}

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);
const booleano = (v: unknown, defecto = false) => (typeof v === "boolean" ? v : defecto);

function normalizarProductos(g: unknown): Producto[] {
  if (!Array.isArray(g)) return [];
  return g
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object")
    .map((x) => ({ id: texto(x.id) || nuevoId("p"), nombre: texto(x.nombre), precio: texto(x.precio), costo: texto(x.costo), unidades: texto(x.unidades) }));
}

function normalizarItems(g: unknown, prefijo: string): ItemMonto[] {
  if (!Array.isArray(g)) return [];
  return g
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object")
    .map((x) => ({ id: texto(x.id) || nuevoId(prefijo), concepto: texto(x.concepto), monto: texto(x.monto) }));
}

/** Normaliza datos guardados (localStorage o un .csv importado) a la forma actual, tolerando campos faltantes o de otra versión. */
export function normalizarDatosRentabilidad(g: Partial<DatosRentabilidad> | Record<string, unknown> | null | undefined): DatosRentabilidad {
  const base = datosVaciosRentabilidad();
  if (!g || typeof g !== "object") return base;
  const r = g as Record<string, unknown>;
  const productos = normalizarProductos(r.productos);
  const costosFijos = normalizarItems(r.costosFijos, "f");
  return {
    ...base,
    ...(g as Partial<DatosRentabilidad>),
    periodo: PERIODOS.some((p) => p.valor === r.periodo) ? (r.periodo as Periodo) : base.periodo,
    productos: productos.length ? productos : base.productos,
    costosVariablesTipo: r.costosVariablesTipo === "monto" ? "monto" : "porcentaje",
    costosFijos: costosFijos.length ? costosFijos : base.costosFijos,
    incluyeSueldo: booleano(r.incluyeSueldo),
  };
}

/** Las 5 secciones propias de esta ruta + los 2 cierres fijos del sitio, en el orden exacto que pide el prompt. */
export type ClaveRespuesta = "resumen" | "rentabilidad" | "sensibilidad" | "omisiones" | "acciones" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "resumen", titulo: "Resumen" },
  { clave: "rentabilidad", titulo: "Rentabilidad por producto" },
  { clave: "sensibilidad", titulo: "Sensibilidad" },
  { clave: "omisiones", titulo: "Costos posiblemente omitidos" },
  { clave: "acciones", titulo: "Acciones a probar" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];
