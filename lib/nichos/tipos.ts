/** Datos y catálogos de «Identificar y validar un nicho de mercado». El cálculo, el prompt y el lector viven en los archivos hermanos. */
export type TipoCliente = "personas" | "empresas" | "ambos";
export const TIPOS_CLIENTE: { valor: TipoCliente; etiqueta: string }[] = [
  { valor: "personas", etiqueta: "Personas (B2C)" },
  { valor: "empresas", etiqueta: "Empresas (B2B)" },
  { valor: "ambos", etiqueta: "Ambos" },
];

export type Canal = "redes" | "contactos" | "tienda-fisica" | "web" | "referidos" | "eventos";
export const CANALES: { valor: Canal; etiqueta: string }[] = [
  { valor: "redes", etiqueta: "Redes sociales" },
  { valor: "contactos", etiqueta: "Contactos personales" },
  { valor: "tienda-fisica", etiqueta: "Tienda o local físico" },
  { valor: "web", etiqueta: "Página web propia" },
  { valor: "referidos", etiqueta: "Referidos de clientes actuales" },
  { valor: "eventos", etiqueta: "Ferias o eventos" },
];

export interface Pesos {
  entrada: number;
  inversion: number;
  recurrencia: number;
  diferenciacion: number;
  encaje: number;
}
export function pesosVacios(): Pesos {
  return { entrada: 20, inversion: 20, recurrencia: 20, diferenciacion: 20, encaje: 20 };
}

/** Los 5 criterios de la matriz de evaluación: fuente única para el formulario de pesos, la matriz y el prompt. */
export const CRITERIOS: { clave: keyof Pesos; etiqueta: string; ayuda: string }[] = [
  { clave: "entrada", etiqueta: "Facilidad de entrada", ayuda: "Qué tan fácil es empezar: trámites, aprendizaje, tiempo hasta la primera venta." },
  { clave: "inversion", etiqueta: "Inversión requerida", ayuda: "5 = inversión baja, 1 = inversión alta." },
  { clave: "recurrencia", etiqueta: "Recurrencia de la necesidad", ayuda: "¿El cliente vuelve a comprar, o es una compra única?" },
  { clave: "diferenciacion", etiqueta: "Posibilidad de diferenciación", ayuda: "Qué tan fácil es distinguirte de lo que ya existe." },
  { clave: "encaje", etiqueta: "Encaje contigo", ayuda: "Qué tanto usa tus conocimientos, recursos y lo que tienes disponible hoy." },
];

let contador = 0;
/** Identificador único de un nicho leído del CSV (se llama al leer la respuesta, nunca durante el render). */
export function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}${Date.now().toString(36)}${contador}`;
}

export const MAX_FAVORITOS = 2;

export interface DatosNichos {
  conocimientos: string;
  sectores: string;
  oferta: string;
  mercado: string;
  tipoCliente: TipoCliente;
  recursos: string;
  presupuesto: string;
  horas: string;
  canales: Canal[];
  restricciones: string;
  /** Respuesta pegada del Prompt 1 (bloque CSV de nichos): se guarda porque el Prompt 2 y la matriz dependen de ella. */
  respuestaNichos: string;
  pesos: Pesos;
  /** Hasta 2 NOMBRES de nichos elegidos (no ids: el id se regenera cada vez que se relee `respuestaNichos`). */
  favoritos: string[];
}

export function datosVaciosNichos(): DatosNichos {
  return {
    conocimientos: "",
    sectores: "",
    oferta: "",
    mercado: "",
    tipoCliente: "personas",
    recursos: "",
    presupuesto: "",
    horas: "",
    canales: [],
    restricciones: "",
    respuestaNichos: "",
    pesos: pesosVacios(),
    favoritos: [],
  };
}

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);
const numero = (v: unknown, defecto: number) => (typeof v === "number" && Number.isFinite(v) ? v : defecto);

function normalizarPesos(g: unknown): Pesos {
  const base = pesosVacios();
  if (!g || typeof g !== "object") return base;
  const p = g as Partial<Record<keyof Pesos, unknown>>;
  return { entrada: numero(p.entrada, base.entrada), inversion: numero(p.inversion, base.inversion), recurrencia: numero(p.recurrencia, base.recurrencia), diferenciacion: numero(p.diferenciacion, base.diferenciacion), encaje: numero(p.encaje, base.encaje) };
}

/** Normaliza datos guardados (localStorage) a la forma actual, tolerando campos faltantes o de otra versión. */
export function normalizarDatosNichos(g: Partial<DatosNichos> | Record<string, unknown> | null | undefined): DatosNichos {
  const base = datosVaciosNichos();
  if (!g || typeof g !== "object") return base;
  const r = g as Record<string, unknown>;
  const canales = Array.isArray(r.canales) ? r.canales.filter((c): c is Canal => CANALES.some((x) => x.valor === c)) : base.canales;
  const favoritos = Array.isArray(r.favoritos) ? r.favoritos.filter((f): f is string => typeof f === "string").slice(0, MAX_FAVORITOS) : base.favoritos;
  return {
    ...base,
    ...(g as Partial<DatosNichos>),
    tipoCliente: TIPOS_CLIENTE.some((t) => t.valor === r.tipoCliente) ? (r.tipoCliente as TipoCliente) : base.tipoCliente,
    canales,
    respuestaNichos: texto(r.respuestaNichos),
    pesos: normalizarPesos(r.pesos),
    favoritos,
  };
}

/** Un nicho leído de la tabla CSV del Prompt 1 (siempre lo genera la IA; la página nunca inventa nichos). */
export interface Nicho {
  id: string;
  nombre: string;
  cliente: string;
  problema: string;
  oferta: string;
  competencia: string;
  canales: string;
  monetizacion: string;
  recursos: string;
  entrada: number;
  inversion: number;
  recurrencia: number;
  diferenciacion: number;
  encaje: number;
  justificacion: string;
}
