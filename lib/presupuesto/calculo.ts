import { categoriaPorId, UNIDADES, type CategoriaId, type DatosPresupuesto, type Linea, type TipoLinea } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Convierte lo que la persona escribió en un número. Acepta «1500», «1,500», «1.500», «1 500», «1234.50» y «1.234,50».
 * Regla: si hay coma y punto, el último es el decimal; si hay uno solo y le siguen exactamente 3 dígitos (y no empieza en 0),
 * es separador de miles; en cualquier otro caso es decimal. Devuelve null si está vacío, no es un número o es negativo.
 */
export function parsearNumero(entrada: string): number | null {
  let s = (entrada ?? "").trim().replace(/[^\d.,\s-]/g, "").replace(/\s+/g, "");
  if (!s || s.startsWith("-")) return null;
  const punto = s.lastIndexOf(".");
  const coma = s.lastIndexOf(",");
  if (punto >= 0 && coma >= 0) {
    const decimal = punto > coma ? "." : ",";
    const miles = decimal === "." ? "," : ".";
    s = s.split(miles).join("").replace(decimal, ".");
  } else if (punto >= 0 || coma >= 0) {
    const sep = punto >= 0 ? "." : ",";
    const partes = s.split(sep);
    if (partes.length > 2 && !partes.slice(1).every((p) => p.length === 3)) return null;
    const miles = partes.length > 2 || (partes.length === 2 && partes[1].length === 3 && partes[0] !== "0" && partes[0] !== "");
    s = miles ? partes.join("") : partes.join(".");
  }
  if (!/^\d*\.?\d+$|^\d+\.?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const formato = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatoEntero = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 });

/** «1,732.50» (formato de Perú: coma para miles y punto para decimales). */
export const formatoMonto = (n: number) => formato.format(n);
export const formatoDinero = (n: number, moneda: string) => `${moneda.trim() || "S/"} ${formato.format(n)}`;
export const formatoPorcentaje = (n: number) => `${new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 }).format(n)} %`;
export const formatoEnteroLocal = (n: number) => formatoEntero.format(n);

function fechaUtc(s: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(t);
  return d.getUTCMonth() === Number(m[2]) - 1 ? t : null;
}

/** Noches del viaje: las escritas por la persona o, si faltan, la diferencia entre regreso y salida. */
export function nochesDelViaje(d: Pick<DatosPresupuesto, "noches" | "salida" | "regreso">): number | null {
  const escritas = parsearNumero(d.noches);
  if (escritas !== null) return Number.isInteger(escritas) && escritas >= 1 ? escritas : null;
  const a = fechaUtc(d.salida);
  const b = fechaUtc(d.regreso);
  if (a === null || b === null) return null;
  const n = Math.round((b - a) / 86_400_000);
  return n >= 1 ? n : null;
}

export function diasDelViaje(d: Pick<DatosPresupuesto, "noches" | "salida" | "regreso" | "dias">): number | null {
  const escritos = parsearNumero(d.dias);
  if (escritos !== null && Number.isInteger(escritos) && escritos >= 1) return escritos;
  const n = nochesDelViaje(d);
  return n === null ? null : n + 1;
}

export function viajeros(d: Pick<DatosPresupuesto, "adultos" | "ninos">): { adultos: number | null; ninos: number; total: number | null } {
  const a = parsearNumero(d.adultos);
  const n = parsearNumero(d.ninos) ?? 0;
  const adultos = a !== null && Number.isInteger(a) && a >= 1 ? a : null;
  const ninos = Number.isInteger(n) && n >= 0 ? n : 0;
  return { adultos, ninos, total: adultos === null ? null : adultos + ninos };
}

export type Escenario = "economico" | "intermedio" | "holgado";
export const ESCENARIOS: { clave: Escenario; etiqueta: string; regla: string }[] = [
  { clave: "economico", etiqueta: "Económico", regla: "Usa el mínimo de cada línea (o su monto si no pusiste mínimo) y deja fuera los gastos opcionales." },
  { clave: "intermedio", etiqueta: "Intermedio", regla: "Usa el monto de cada línea e incluye los gastos opcionales. Es el total principal." },
  { clave: "holgado", etiqueta: "Holgado", regla: "Usa el máximo de cada línea (o su monto si no pusiste máximo) e incluye los gastos opcionales." },
];

export interface CalculoLinea {
  id: string;
  /** Cuántas veces se multiplica el monto (1, noches, viajeros o viajeros × días). */
  multiplicador: number | null;
  /** Fórmula visible: «150 × 5 noches». */
  formula: string;
  /** Total intermedio de la línea en la moneda del presupuesto (null si no se puede calcular). */
  total: number | null;
  /** Motivo por el que no se pudo calcular o hay algo por revisar. */
  problema?: string;
}

export interface TotalEscenario {
  escenario: Escenario;
  subtotal: number;
  imprevistos: number;
  total: number;
  porPersona: number | null;
  porCategoria: { categoria: CategoriaId; total: number }[];
}

export interface Calculo {
  personas: number | null;
  noches: number | null;
  dias: number | null;
  tipoCambio: number | null;
  pctImprevistos: number;
  lineas: CalculoLinea[];
  escenarios: Record<Escenario, TotalEscenario>;
  /** Reparto del escenario intermedio (sobre el total con imprevistos). */
  reparto: { conocido: number; estimado: number; opcional: number; imprevistos: number };
  porcentajes: { conocido: number; estimado: number; opcional: number; imprevistos: number };
  /** Sobre el subtotal intermedio (sin imprevistos). */
  fijos: number;
  variables: number;
  /** Líneas con monto que no se pudieron sumar (falta un dato) y líneas sin monto. */
  sinCalcular: number;
  sinMonto: number;
  /** Totales del escenario intermedio en la moneda alterna (si hay tipo de cambio). */
  totalAlterna: number | null;
  /** Referencia para el margen según la proporción de estimados (regla práctica, no norma). */
  margenReferencia: { texto: string; minimo: number };
}

/** Regla práctica de esta página (no es un estándar): más margen cuanto mayor sea la parte del subtotal que solo estimaste. */
export function margenDeReferencia(pctEstimadoSobreSubtotal: number): { texto: string; minimo: number } {
  if (pctEstimadoSobreSubtotal > 50) return { texto: "15 % o más", minimo: 15 };
  if (pctEstimadoSobreSubtotal > 25) return { texto: "10–15 %", minimo: 10 };
  return { texto: "alrededor de 10 %", minimo: 10 };
}

export function multiplicador(unidad: Linea["unidad"], noches: number | null, dias: number | null, personas: number | null): { valor: number | null; texto: string; falta?: string } {
  switch (unidad) {
    case "viaje":
      return { valor: 1, texto: "" };
    case "noche":
      return noches === null ? { valor: null, texto: "", falta: "Falta el número de noches (o las fechas)." } : { valor: noches, texto: `${noches} ${noches === 1 ? "noche" : "noches"}` };
    case "persona":
      return personas === null ? { valor: null, texto: "", falta: "Falta el número de adultos." } : { valor: personas, texto: `${personas} ${personas === 1 ? "persona" : "personas"}` };
    case "persona-dia":
      if (personas === null) return { valor: null, texto: "", falta: "Falta el número de adultos." };
      if (dias === null) return { valor: null, texto: "", falta: "Falta el número de noches (o las fechas) para calcular los días." };
      return { valor: personas * dias, texto: `${personas} ${personas === 1 ? "persona" : "personas"} × ${dias} ${dias === 1 ? "día" : "días"}` };
  }
}

/** Monto de una línea en la moneda del presupuesto, para un escenario. null = la línea no aporta (vacía, opcional en «económico» o sin datos). */
function montoDeEscenario(l: Linea, escenario: Escenario, tipoCambio: number | null): number | null {
  if (escenario === "economico" && l.tipo === "opcional") return null;
  const base = parsearNumero(l.monto);
  const min = parsearNumero(l.minimo);
  const max = parsearNumero(l.maximo);
  const elegido = escenario === "economico" ? (min ?? base) : escenario === "holgado" ? (max ?? base) : base;
  if (elegido === null) return null;
  if (l.enAlterna) return tipoCambio === null ? null : elegido * tipoCambio;
  return elegido;
}

export function calcular(d: DatosPresupuesto): Calculo {
  const v = viajeros(d);
  const noches = nochesDelViaje(d);
  const dias = diasDelViaje(d);
  const tipoCambio = (() => {
    const t = parsearNumero(d.tipoCambio);
    return t !== null && t > 0 ? t : null;
  })();
  const pctImprevistos = (() => {
    const p = parsearNumero(d.imprevistos);
    return p === null ? 0 : Math.min(p, 100);
  })();

  const lineas: CalculoLinea[] = d.lineas.map((l) => {
    const m = multiplicador(l.unidad, noches, dias, v.total);
    const monto = parsearNumero(l.monto);
    const etiquetaUnidad = UNIDADES.find((u) => u.valor === l.unidad)!.corta;
    const formula = monto === null ? "" : m.texto ? `${formatoMonto(monto)} × ${m.texto}` : `${formatoMonto(monto)} ${etiquetaUnidad}`;
    if (monto === null) return { id: l.id, multiplicador: m.valor, formula, total: null, problema: l.monto.trim() ? "El monto no es un número válido." : undefined };
    if (m.valor === null) return { id: l.id, multiplicador: null, formula, total: null, problema: m.falta };
    if (l.enAlterna && tipoCambio === null) return { id: l.id, multiplicador: m.valor, formula, total: null, problema: "Esta línea está en la moneda alterna: escribe el tipo de cambio para convertirla." };
    const montoConvertido = montoDeEscenario(l, "intermedio", tipoCambio)!;
    return { id: l.id, multiplicador: m.valor, formula, total: redondear(montoConvertido * m.valor) };
  });

  const escenarios = {} as Record<Escenario, TotalEscenario>;
  for (const { clave } of ESCENARIOS) {
    const porCat = new Map<CategoriaId, number>();
    let subtotal = 0;
    for (const l of d.lineas) {
      const m = multiplicador(l.unidad, noches, dias, v.total).valor;
      const monto = montoDeEscenario(l, clave, tipoCambio);
      if (m === null || monto === null) continue;
      const t = redondear(monto * m);
      subtotal = redondear(subtotal + t);
      porCat.set(l.categoria, redondear((porCat.get(l.categoria) ?? 0) + t));
    }
    const imprevistos = redondear((subtotal * pctImprevistos) / 100);
    const total = redondear(subtotal + imprevistos);
    escenarios[clave] = {
      escenario: clave,
      subtotal,
      imprevistos,
      total,
      porPersona: v.total ? redondear(total / v.total) : null,
      porCategoria: [...porCat.entries()].map(([categoria, t]) => ({ categoria, total: t })),
    };
  }

  const inter = escenarios.intermedio;
  const porTipo = (tipo: TipoLinea) =>
    redondear(
      d.lineas.reduce((a, l, i) => (l.tipo === tipo && lineas[i].total !== null ? a + lineas[i].total! : a), 0),
    );
  const reparto = { conocido: porTipo("conocido"), estimado: porTipo("estimado"), opcional: porTipo("opcional"), imprevistos: inter.imprevistos };
  const pct = (x: number) => (inter.total > 0 ? (x / inter.total) * 100 : 0);
  const porcentajes = { conocido: pct(reparto.conocido), estimado: pct(reparto.estimado), opcional: pct(reparto.opcional), imprevistos: pct(reparto.imprevistos) };

  let fijos = 0;
  let variables = 0;
  d.lineas.forEach((l, i) => {
    const t = lineas[i].total;
    if (t === null) return;
    if (categoriaPorId(l.categoria).naturaleza === "fijo") fijos += t;
    else variables += t;
  });
  fijos = redondear(fijos);
  variables = redondear(variables);

  const conMonto = d.lineas.filter((l) => parsearNumero(l.monto) !== null);
  const pctEstimadoSub = inter.subtotal > 0 ? (reparto.estimado / inter.subtotal) * 100 : 0;

  return {
    personas: v.total,
    noches,
    dias,
    tipoCambio,
    pctImprevistos,
    lineas,
    escenarios,
    reparto,
    porcentajes,
    fijos,
    variables,
    sinCalcular: conMonto.filter((l) => lineas[d.lineas.indexOf(l)].total === null).length,
    sinMonto: d.lineas.length - conMonto.length,
    totalAlterna: tipoCambio && d.monedaAlterna.trim() ? redondear(inter.total / tipoCambio) : null,
    margenReferencia: margenDeReferencia(pctEstimadoSub),
  };
}
