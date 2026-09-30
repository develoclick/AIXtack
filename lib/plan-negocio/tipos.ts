/** Datos y catálogos de «Crear un plan de negocio con IA». El cálculo, el prompt y el lector viven en los archivos hermanos. */
export type Finalidad = "organizarme" | "pedir-prestamo" | "buscar-socio" | "concurso";
export const FINALIDADES: { valor: Finalidad; etiqueta: string; ayuda: string }[] = [
  { valor: "organizarme", etiqueta: "Organizar mis ideas", ayuda: "Un plan breve, para ti: 8 a 15 páginas suelen bastar." },
  { valor: "pedir-prestamo", etiqueta: "Pedir un préstamo", ayuda: "Más detalle financiero: revisa además los requisitos de la entidad." },
  { valor: "buscar-socio", etiqueta: "Buscar un socio", ayuda: "Enfatiza el modelo de negocio y el equipo." },
  { valor: "concurso", etiqueta: "Presentarlo a un concurso", ayuda: "Revisa el formato que pida las bases del concurso." },
];

export interface ItemMonto {
  id: string;
  concepto: string;
  monto: string;
}
export function itemMontoVacio(id: string): ItemMonto {
  return { id, concepto: "", monto: "" };
}

export interface Competidor {
  id: string;
  nombre: string;
  oferta: string;
  precio: string;
}
export function competidorVacio(id: string): Competidor {
  return { id, nombre: "", oferta: "", precio: "" };
}

export interface MiembroEquipo {
  id: string;
  rol: string;
  experiencia: string;
}
export function miembroVacio(id: string): MiembroEquipo {
  return { id, rol: "", experiencia: "" };
}

let contador = 0;
/** Identificador único de un ítem, competidor o miembro del equipo (se llama desde eventos, nunca durante el render). */
export function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}${Date.now().toString(36)}${contador}`;
}

export const MAX_ITEMS = 12;
export const MAX_COMPETIDORES = 6;
export const MAX_EQUIPO = 8;

export interface DatosPlanNegocio {
  nombreEmpresa: string;
  descripcion: string;
  producto: string;
  problema: string;
  clienteObjetivo: string;
  ubicacion: string;
  modeloIngresos: string;
  preciosPrevistos: string;
  canalesVenta: string;
  competidores: Competidor[];
  recursosDisponibles: string;
  inversionInicial: ItemMonto[];
  gastosMensuales: ItemMonto[];
  /** Precio de venta por unidad (la misma unidad que costoVariable y demandaMensualEstimada). */
  precioVenta: string;
  /** Costo variable por unidad. */
  costoVariable: string;
  /** Unidades que espera vender al mes en el escenario medio (es un supuesto, no un cálculo). */
  demandaMensualEstimada: string;
  /** % hacia arriba y hacia abajo para los escenarios optimista y pesimista (por defecto 30). */
  variacionEscenarios: string;
  objetivos12Meses: string;
  equipo: MiembroEquipo[];
  finalidad: Finalidad;
  infoAdicional: string;
  /** Tus respuestas a las preguntas de la Fase A del prompt (texto libre); vacío = todavía no llegaste a la Fase B. */
  respuestasFaseA: string;
}

export function datosVaciosPlanNegocio(): DatosPlanNegocio {
  const idInv = nuevoId("i");
  const idGasto = nuevoId("g");
  return {
    nombreEmpresa: "",
    descripcion: "",
    producto: "",
    problema: "",
    clienteObjetivo: "",
    ubicacion: "",
    modeloIngresos: "",
    preciosPrevistos: "",
    canalesVenta: "",
    competidores: [],
    recursosDisponibles: "",
    inversionInicial: [itemMontoVacio(idInv)],
    gastosMensuales: [itemMontoVacio(idGasto)],
    precioVenta: "",
    costoVariable: "",
    demandaMensualEstimada: "",
    variacionEscenarios: "30",
    objetivos12Meses: "",
    equipo: [],
    finalidad: "organizarme",
    infoAdicional: "",
    respuestasFaseA: "",
  };
}

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

function normalizarItems(g: unknown, prefijo: string): ItemMonto[] {
  if (!Array.isArray(g)) return [];
  return g
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object")
    .map((x) => ({ id: texto(x.id) || nuevoId(prefijo), concepto: texto(x.concepto), monto: texto(x.monto) }));
}

function normalizarCompetidores(g: unknown): Competidor[] {
  if (!Array.isArray(g)) return [];
  return g
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object")
    .map((x) => ({ id: texto(x.id) || nuevoId("c"), nombre: texto(x.nombre), oferta: texto(x.oferta), precio: texto(x.precio) }));
}

function normalizarEquipo(g: unknown): MiembroEquipo[] {
  if (!Array.isArray(g)) return [];
  return g
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object")
    .map((x) => ({ id: texto(x.id) || nuevoId("m"), rol: texto(x.rol), experiencia: texto(x.experiencia) }));
}

/** Normaliza datos guardados (localStorage o un .json importado) a la forma actual, tolerando campos faltantes o de otra versión. */
export function normalizarDatosPlanNegocio(g: Partial<DatosPlanNegocio> | Record<string, unknown> | null | undefined): DatosPlanNegocio {
  const base = datosVaciosPlanNegocio();
  if (!g || typeof g !== "object") return base;
  const finalidad = FINALIDADES.some((f) => f.valor === (g as Record<string, unknown>).finalidad) ? ((g as Record<string, unknown>).finalidad as Finalidad) : base.finalidad;
  const inversionInicial = normalizarItems((g as Record<string, unknown>).inversionInicial, "i");
  const gastosMensuales = normalizarItems((g as Record<string, unknown>).gastosMensuales, "g");
  return {
    ...base,
    ...(g as Partial<DatosPlanNegocio>),
    finalidad,
    competidores: normalizarCompetidores((g as Record<string, unknown>).competidores),
    equipo: normalizarEquipo((g as Record<string, unknown>).equipo),
    inversionInicial: inversionInicial.length ? inversionInicial : base.inversionInicial,
    gastosMensuales: gastosMensuales.length ? gastosMensuales : base.gastosMensuales,
    variacionEscenarios: texto((g as Record<string, unknown>).variacionEscenarios, "30"),
  };
}

/** Las 17 secciones del plan (Fase B) + los 2 cierres fijos del sitio, en el orden exacto que pide el prompt. */
export type ClaveRespuesta =
  | "resumen"
  | "descripcion"
  | "problema"
  | "cliente"
  | "mercado"
  | "competencia"
  | "modelo"
  | "productos"
  | "estrategia"
  | "operaciones"
  | "equipo"
  | "inversion"
  | "costos"
  | "proyeccion"
  | "equilibrio"
  | "riesgos"
  | "plan90"
  | "verificar"
  | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "resumen", titulo: "Resumen ejecutivo" },
  { clave: "descripcion", titulo: "Descripción del negocio" },
  { clave: "problema", titulo: "Problema y propuesta de valor" },
  { clave: "cliente", titulo: "Cliente objetivo" },
  { clave: "mercado", titulo: "Análisis de mercado" },
  { clave: "competencia", titulo: "Competencia" },
  { clave: "modelo", titulo: "Modelo de negocio" },
  { clave: "productos", titulo: "Productos y servicios" },
  { clave: "estrategia", titulo: "Estrategia comercial y marketing" },
  { clave: "operaciones", titulo: "Operaciones" },
  { clave: "equipo", titulo: "Recursos y equipo" },
  { clave: "inversion", titulo: "Inversión inicial" },
  { clave: "costos", titulo: "Costos" },
  { clave: "proyeccion", titulo: "Proyección de ingresos" },
  { clave: "equilibrio", titulo: "Punto de equilibrio" },
  { clave: "riesgos", titulo: "Riesgos y mitigaciones" },
  { clave: "plan90", titulo: "Plan de acción de 90 días" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

/** Agrupa las 19 secciones en pestañas del paso 3, para no mostrar una lista plana de 19 paneles. */
export const GRUPOS_RESULTADO: { id: string; etiqueta: string; claves: ClaveRespuesta[] }[] = [
  { id: "resumen", etiqueta: "Resumen y negocio", claves: ["resumen", "descripcion", "problema", "cliente"] },
  { id: "mercado", etiqueta: "Mercado y competencia", claves: ["mercado", "competencia", "modelo", "productos", "estrategia"] },
  { id: "operacion", etiqueta: "Operación y equipo", claves: ["operaciones", "equipo"] },
  { id: "numeros", etiqueta: "Números", claves: ["inversion", "costos", "proyeccion", "equilibrio"] },
  { id: "accion", etiqueta: "Riesgos y siguiente paso", claves: ["riesgos", "plan90", "verificar", "siguiente"] },
];

/** Una fila de la tabla de competencia dentro de la respuesta (columnas libres, la página solo la muestra). */
export interface FilaCompetencia {
  celdas: string[];
}

export type EtiquetaCifra = "dato" | "calculo" | "supuesto";
export const ETIQUETAS_CIFRA: { valor: EtiquetaCifra; texto: string; clase: string }[] = [
  { valor: "dato", texto: "DATO DEL USUARIO", clase: "bg-ok/15 text-ok" },
  { valor: "calculo", texto: "CÁLCULO", clase: "bg-brand-muted text-brand" },
  { valor: "supuesto", texto: "SUPUESTO", clase: "bg-warn-muted text-warn" },
];
