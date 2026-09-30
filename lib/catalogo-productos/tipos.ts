/** Datos y catálogos de «Crear un catálogo de productos». El cálculo, el prompt y el lector viven en los archivos hermanos. */
export type Plantilla = "minimalista" | "moda" | "alimentos" | "ferreteria";
export const PLANTILLAS: { valor: Plantilla; etiqueta: string; acento: string; fondo: string; tinta: string }[] = [
  { valor: "minimalista", etiqueta: "Minimalista", acento: "#171717", fondo: "#ffffff", tinta: "#171717" },
  { valor: "moda", etiqueta: "Moda", acento: "#a3335a", fondo: "#fdf2f6", tinta: "#3a1420" },
  { valor: "alimentos", etiqueta: "Alimentos", acento: "#2e7d32", fondo: "#f2f8ef", tinta: "#173a19" },
  { valor: "ferreteria", etiqueta: "Ferretería y técnico", acento: "#c8710a", fondo: "#fff8ef", tinta: "#3a2405" },
];
export function plantillaPorId(id: Plantilla) {
  return PLANTILLAS.find((p) => p.valor === id) ?? PLANTILLAS[0];
}

let contador = 0;
/** Identificador único de un producto o fila leída (se llama al agregar una fila o al leer una respuesta, nunca durante el render). */
export function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}${Date.now().toString(36)}${contador}`;
}

export const MAX_PRODUCTOS = 40;
export const MAX_CATEGORIAS = 8;

/** Un producto tal como lo escribe la persona. El nombre es el dato que usa la página para reconocer cada fila del catálogo generado. */
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  precioPromo: string;
  categoria: string;
  sku: string;
}

export function productoVacio(id: string): Producto {
  return { id, nombre: "", descripcion: "", precio: "", precioPromo: "", categoria: "", sku: "" };
}

export interface DatosCatalogo {
  empresa: string;
  rubro: string;
  publico: string;
  estilo: string;
  whatsapp: string;
  productos: Producto[];
  plantilla: Plantilla;
  respuestaCatalogo: string;
}

export function datosVaciosCatalogo(): DatosCatalogo {
  return {
    empresa: "",
    rubro: "",
    publico: "",
    estilo: "",
    whatsapp: "",
    productos: [productoVacio(nuevoId("p"))],
    plantilla: "minimalista",
    respuestaCatalogo: "",
  };
}

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

function normalizarProducto(g: unknown, indice: number): Producto {
  if (!g || typeof g !== "object") return productoVacio(`p${indice}`);
  const p = g as Partial<Producto>;
  return {
    id: texto(p.id) || `p${indice}`,
    nombre: texto(p.nombre),
    descripcion: texto(p.descripcion),
    precio: texto(p.precio),
    precioPromo: texto(p.precioPromo),
    categoria: texto(p.categoria),
    sku: texto(p.sku),
  };
}

/** Normaliza datos guardados (localStorage) a la forma actual, tolerando campos faltantes o de otra versión. */
export function normalizarDatosCatalogo(g: Partial<DatosCatalogo> | Record<string, unknown> | null | undefined): DatosCatalogo {
  const base = datosVaciosCatalogo();
  if (!g || typeof g !== "object") return base;
  const r = g as Record<string, unknown>;
  const productos = Array.isArray(r.productos) ? r.productos.map((p, i) => normalizarProducto(p, i)).slice(0, MAX_PRODUCTOS) : base.productos;
  return {
    ...base,
    ...(g as Partial<DatosCatalogo>),
    plantilla: PLANTILLAS.some((p) => p.valor === r.plantilla) ? (r.plantilla as Plantilla) : base.plantilla,
    productos: productos.length ? productos : base.productos,
    respuestaCatalogo: texto(r.respuestaCatalogo),
  };
}

/** Una fila leída del bloque CSV de «## Catálogo» (siempre generada por la IA; la página nunca inventa productos ni categorías). */
export interface FilaCatalogo {
  categoria: string;
  nombreOriginal: string;
  nombre: string;
  descripcion: string;
  especificaciones: string;
  variantes: string;
  precio: string;
  precioPromo: string;
  etiqueta: string;
  cta: string;
}

/** Divide una celda de «especificaciones» o «variantes» (separada por «;») en una lista limpia. */
export function itemsDeCelda(celda: string): string[] {
  return celda
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && s !== "—" && s !== "-");
}
