import { parsearNumero } from "./calculo";
import type { FaltaLeida } from "./lector";
import { lineaVaciaDe, type DatosPresupuesto, type Linea } from "./tipos";

interface NumeroHallado {
  crudo: string;
  valor: number;
  esPorcentaje: boolean;
  /** Va pegado a un símbolo o código de moneda, o parece un monto (3 o más dígitos, o con decimales). */
  parecePrecio: boolean;
}

const MONEDAS = "S\\/\\.?|US\\$|\\$|€|USD|PEN|EUR|MXN|COP|CLP|ARS|BRL|BOB|UYU|soles|sol|d[oó]lares|euros|pesos|reales";
const RE_NUMERO = new RegExp(`(?:(${MONEDAS})\\s*)?(\\d{1,3}(?:[.,]\\d{3})+(?:[.,]\\d+)?|\\d+(?:[.,]\\d+)?)(\\s*%)?(?:\\s*(${MONEDAS})\\b)?`, "gi");

/** Números de un texto, sin fechas, años sueltos ni la numeración de las listas. */
export function extraerNumeros(texto: string): NumeroHallado[] {
  const limpio = texto
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ")
    .replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, " ")
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-*•·]|\d+[.)])\s+/, ""))
    .join("\n");
  const salida: NumeroHallado[] = [];
  for (const m of limpio.matchAll(RE_NUMERO)) {
    const crudo = m[2];
    const valor = parsearNumero(crudo);
    if (valor === null) continue;
    const conMoneda = Boolean(m[1] || m[4]);
    const esPorcentaje = Boolean(m[3]);
    const digitos = crudo.replace(/\D/g, "").length;
    const anio = !conMoneda && !esPorcentaje && Number.isInteger(valor) && valor >= 1900 && valor <= 2100 && digitos === 4;
    if (anio) continue;
    salida.push({ crudo: crudo.replace(/\s+/g, " ").trim(), valor, esPorcentaje, parecePrecio: !esPorcentaje && (conMoneda || digitos >= 3 || /[.,]\d{1,2}$/.test(crudo)) });
  }
  return salida;
}

/** Los números que ya tiene la persona (datos, totales calculados, escenarios): lo que la IA puede citar sin inventar. */
export function numerosDeLosDatos(textoDeDatos: string): { valores: number[]; porcentajes: number[] } {
  const hallados = extraerNumeros(textoDeDatos);
  return { valores: hallados.map((h) => h.valor), porcentajes: hallados.filter((h) => h.esPorcentaje).map((h) => h.valor) };
}

export interface CifrasNuevas {
  /** Montos (con símbolo de moneda, con 3 o más dígitos o con decimales) que no están en los datos ni en los cálculos de la página. */
  montos: string[];
  /** Porcentajes que no están en los datos (pueden ser una recomendación válida). */
  porcentajes: string[];
}

/**
 * Detector de cifras inventadas: cualquier monto de la respuesta que no aparezca en los datos ni en lo que calculó la página.
 * `textoDeDatos` es lo que la persona ve en el prompt (tabla, totales y escenarios, más los datos del viaje).
 */
export function cifrasNuevas(respuesta: string, textoDeDatos: string): CifrasNuevas {
  const { valores, porcentajes } = numerosDeLosDatos(textoDeDatos);
  const existe = (v: number) => valores.some((x) => Math.abs(x - v) < 0.011);
  const montos = new Set<string>();
  const pct = new Set<string>();
  for (const h of extraerNumeros(respuesta)) {
    if (h.esPorcentaje) {
      if (!porcentajes.some((p) => Math.round(p) === Math.round(h.valor)) && !existe(h.valor)) pct.add(`${h.crudo} %`);
    } else if (h.parecePrecio && !existe(h.valor)) montos.add(h.crudo);
  }
  return { montos: [...montos], porcentajes: [...pct] };
}

/** Ítems de «Gastos que faltan» en los que la IA escribió un precio (se le pidió que no lo hiciera). */
export function faltantesConPrecio(faltan: FaltaLeida[]): string[] {
  return faltan.filter((f) => extraerNumeros(`${f.concepto} ${f.porQue} ${f.dondeConsultar}`).some((h) => h.parecePrecio || h.esPorcentaje)).map((f) => f.concepto);
}

/** La línea (vacía, «estimado») que se agrega al pulsar «Añadir a mi tabla» en un gasto que faltaba según la IA. */
export function lineaDeFalta(f: FaltaLeida, id: string): Linea {
  return { ...lineaVaciaDe(f.categoria ?? "otros", id), concepto: f.concepto || f.categoriaTexto };
}

/** ¿Ya existe una línea con este concepto (para no agregar la misma sugerencia dos veces)? */
export function yaEstaEnLaTabla(f: FaltaLeida, d: DatosPresupuesto): boolean {
  const n = (t: string) => t.trim().toLowerCase();
  return d.lineas.some((l) => n(l.concepto) === n(f.concepto) && l.categoria === (f.categoria ?? "otros"));
}
