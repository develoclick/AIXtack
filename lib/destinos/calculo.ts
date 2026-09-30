import { formatoMonto, parsearNumero } from "@/lib/presupuesto/calculo";
import { TOPE_NOCHES, type DatosDestinos, type FilaDestino } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function viajerosDestinos(d: Pick<DatosDestinos, "viajeros">): number | null {
  const n = parsearNumero(d.viajeros);
  return n !== null && Number.isInteger(n) && n >= 1 ? n : null;
}

export interface RangoNoches {
  min: number;
  max: number;
}

/** Rango de noches válido: ambos enteros ≥ 1 y mínimo ≤ máximo. */
export function rangoNoches(d: Pick<DatosDestinos, "nochesMin" | "nochesMax">): RangoNoches | null {
  const min = parsearNumero(d.nochesMin);
  const max = parsearNumero(d.nochesMax);
  if (min === null || max === null || !Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < min) return null;
  return { min, max };
}

/** Noches que usa el simulador: las que escribió la persona (dentro del rango) o, si no escribió, el máximo del rango. */
export function nochesSimuladas(d: DatosDestinos): number | null {
  const rango = rangoNoches(d);
  if (rango === null) return null;
  const escritas = parsearNumero(d.nochesSimuladas);
  if (escritas === null) return rango.max;
  return Math.min(rango.max, Math.max(rango.min, Math.round(escritas)));
}

export function imprevistosPct(d: Pick<DatosDestinos, "imprevistos">): number {
  const p = parsearNumero(d.imprevistos);
  return p === null ? 0 : Math.min(Math.max(p, 0), 100);
}

/** Reserva para gastos en destino (comida, transporte local, actividades): gasto diario × viajeros × (noches + 1 día de llegada). */
export function reservaGastos(d: DatosDestinos, noches: number): number | null {
  const gasto = parsearNumero(d.gastoDiario);
  const v = viajerosDestinos(d);
  if (gasto === null || v === null) return null;
  return redondear(gasto * v * (noches + 1));
}

export function imprevistosMonto(d: DatosDestinos): number | null {
  const presupuesto = parsearNumero(d.presupuesto);
  if (presupuesto === null) return null;
  return redondear((presupuesto * imprevistosPct(d)) / 100);
}

export interface RepartoPresupuesto {
  presupuesto: number;
  reservaGastos: number;
  imprevistos: number;
  /** Lo que queda para pasajes y alojamiento, en las noches dadas. Puede ser negativo (presupuesto insuficiente). */
  maximoPasajesYAlojamiento: number;
}

/** Reparto del presupuesto para un número de noches dado (lo calcula la página, nunca la IA). */
export function repartoPresupuesto(d: DatosDestinos, noches: number): RepartoPresupuesto | null {
  const presupuesto = parsearNumero(d.presupuesto);
  const gastos = reservaGastos(d, noches);
  const imprevistos = imprevistosMonto(d);
  if (presupuesto === null || gastos === null || imprevistos === null) return null;
  return { presupuesto, reservaGastos: gastos, imprevistos, maximoPasajesYAlojamiento: redondear(presupuesto - gastos - imprevistos) };
}

export interface RecalculoDestino {
  costoPasajes: number | null;
  costoAlojamiento: number | null;
  total: number | null;
  porPersona: number | null;
  restante: number | null;
  viable: boolean;
  /** true si el total que declaró la IA difiere del recalculado en más de 1 unidad monetaria. */
  difiereDeLoDeclarado: boolean;
}

/** Recalcula el costo de un destino con las noches del simulador; la página nunca confía en el total que trae la fila. */
export function recalcularDestino(f: FilaDestino, d: DatosDestinos, noches: number): RecalculoDestino {
  const v = viajerosDestinos(d);
  const reparto = repartoPresupuesto(d, noches);
  if (v === null || f.pasajePorPersona === null || f.alojamientoPorNoche === null || reparto === null) {
    return { costoPasajes: null, costoAlojamiento: null, total: null, porPersona: null, restante: null, viable: false, difiereDeLoDeclarado: false };
  }
  const costoPasajes = redondear(f.pasajePorPersona * v);
  const costoAlojamiento = redondear(f.alojamientoPorNoche * noches);
  const total = redondear(costoPasajes + costoAlojamiento);
  const porPersona = redondear(total / v);
  const restante = redondear(reparto.maximoPasajesYAlojamiento - total);
  const difiereDeLoDeclarado = f.totalDeclarado !== null && Math.abs(f.totalDeclarado - total) > 1;
  return { costoPasajes, costoAlojamiento, total, porPersona, restante, viable: restante >= 0, difiereDeLoDeclarado };
}

/**
 * Noches máximas viables de un destino (fórmula algebraica, sin probar una por una):
 * n ≤ (presupuesto − imprevistos − gastoDiario×viajeros − pasajePorPersona×viajeros) ÷ (alojamientoPorNoche + gastoDiario×viajeros)
 */
export function nochesMaximasViables(f: FilaDestino, d: DatosDestinos): number | null {
  const v = viajerosDestinos(d);
  const presupuesto = parsearNumero(d.presupuesto);
  const gasto = parsearNumero(d.gastoDiario);
  const imprevistos = imprevistosMonto(d);
  if (v === null || presupuesto === null || gasto === null || imprevistos === null || f.pasajePorPersona === null || f.alojamientoPorNoche === null) return null;
  const numerador = presupuesto - imprevistos - gasto * v - f.pasajePorPersona * v;
  const denominador = f.alojamientoPorNoche + gasto * v;
  if (denominador <= 0) return null;
  const n = Math.floor(numerador / denominador);
  return Math.max(0, Math.min(TOPE_NOCHES, n));
}

export interface FilaResumen {
  fila: FilaDestino;
  recalculo: RecalculoDestino;
  nochesMaximas: number | null;
}

export function filasResumen(filas: FilaDestino[], d: DatosDestinos): FilaResumen[] {
  const noches = nochesSimuladas(d) ?? 0;
  return filas.map((fila) => ({ fila, recalculo: recalcularDestino(fila, d, noches), nochesMaximas: nochesMaximasViables(fila, d) }));
}

export function destinosViables(filas: FilaResumen[]): FilaResumen[] {
  return filas.filter((f) => f.recalculo.viable);
}

/** Texto de la fórmula del reparto, con las cifras del reparto dado (para mostrarla visible en la página). */
export function formulaReparto(d: DatosDestinos, noches: number, reparto: RepartoPresupuesto): string {
  const gasto = parsearNumero(d.gastoDiario) ?? 0;
  const v = viajerosDestinos(d) ?? 0;
  return `${formatoMonto(reparto.presupuesto)} − (${formatoMonto(gasto)} × ${v} × ${noches + 1} días) − ${formatoMonto(reparto.imprevistos)} imprevistos = ${formatoMonto(reparto.maximoPasajesYAlojamiento)}`;
}

/** Progreso mínimo para pasar al paso 2: presupuesto, viajeros, gasto diario y un rango de noches válido. */
export function datosMinimosDestinos(d: DatosDestinos): boolean {
  return parsearNumero(d.presupuesto) !== null && viajerosDestinos(d) !== null && parsearNumero(d.gastoDiario) !== null && rangoNoches(d) !== null;
}
