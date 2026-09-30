import { parsearNumero } from "@/lib/presupuesto/calculo";
import { aFecha, diasEntre, fechaUtc, sumarDias } from "@/lib/plan/calendario";
import { DIAS_SEMANA, MAX_COMBINACIONES, MAX_DURACIONES, type Combinacion, type DatosFechas } from "./tipos";

export { fechaUtc };

/** Duraciones (en noches) que escribió la persona: enteros positivos, sin repetir, ordenados, hasta el máximo permitido. */
export function parsearDuraciones(texto: string): number[] {
  const numeros = texto
    .split(/[,;\s]+/)
    .map((t) => parsearNumero(t))
    .filter((n): n is number => n !== null && Number.isInteger(n) && n >= 1 && n <= 60);
  return [...new Set(numeros)].sort((a, b) => a - b).slice(0, MAX_DURACIONES);
}

/** Días del período (fecha de fin − fecha de inicio); null si falta alguna fecha o el fin no es posterior al inicio. */
export function diasDelPeriodo(d: Pick<DatosFechas, "fechaInicio" | "fechaFin">): number | null {
  const n = diasEntre(d.fechaInicio, d.fechaFin);
  return n === null || n < 1 ? null : n;
}

/** Cuántas combinaciones válidas hay para una duración: salidas posibles entre el inicio y (fin − duración). */
export function combinacionesPorDuracion(diasPeriodo: number, duracion: number): number {
  return Math.max(0, diasPeriodo - duracion + 1);
}

export interface ResumenCombinaciones {
  /** Total real (aunque no se generen todas si supera el máximo). */
  total: number;
  porDuracion: { duracion: number; cantidad: number }[];
  /** true si el total supera MAX_COMBINACIONES y la lista generada se truncó. */
  truncado: boolean;
}

export function resumenCombinaciones(d: Pick<DatosFechas, "fechaInicio" | "fechaFin" | "duraciones">): ResumenCombinaciones | null {
  const dias = diasDelPeriodo(d);
  const duraciones = parsearDuraciones(d.duraciones);
  if (dias === null || duraciones.length === 0) return null;
  const porDuracion = duraciones.map((duracion) => ({ duracion, cantidad: combinacionesPorDuracion(dias, duracion) }));
  const total = porDuracion.reduce((s, x) => s + x.cantidad, 0);
  return { total, porDuracion, truncado: total > MAX_COMBINACIONES };
}

let contador = 0;
function nuevoId(): string {
  contador += 1;
  return `c${Date.now().toString(36)}${contador}`;
}

/** Genera las combinaciones (ida, vuelta, noches), hasta el máximo permitido. La página nunca inventa precios: solo fechas. */
export function generarCombinaciones(d: Pick<DatosFechas, "fechaInicio" | "fechaFin" | "duraciones">): Combinacion[] {
  const dias = diasDelPeriodo(d);
  const duraciones = parsearDuraciones(d.duraciones);
  if (dias === null || duraciones.length === 0 || fechaUtc(d.fechaInicio) === null) return [];
  const salida: Combinacion[] = [];
  for (const duracion of duraciones) {
    const cantidad = combinacionesPorDuracion(dias, duracion);
    for (let i = 0; i < cantidad; i++) {
      if (salida.length >= MAX_COMBINACIONES) return salida;
      const ida = sumarDias(d.fechaInicio, i)!;
      const vuelta = sumarDias(ida, duracion)!;
      salida.push({ id: nuevoId(), ida, vuelta, noches: duracion });
    }
  }
  return salida;
}

export function viajerosDeFechas(d: Pick<DatosFechas, "adultos" | "ninos" | "infantes">): { adultos: number | null; ninos: number; infantes: number; total: number | null } {
  const a = parsearNumero(d.adultos);
  const adultos = a !== null && Number.isInteger(a) && a >= 1 ? a : null;
  const ninos = (() => {
    const n = parsearNumero(d.ninos);
    return n !== null && Number.isInteger(n) && n >= 0 ? n : 0;
  })();
  const infantes = (() => {
    const n = parsearNumero(d.infantes);
    return n !== null && Number.isInteger(n) && n >= 0 ? n : 0;
  })();
  return { adultos, ninos, infantes, total: adultos === null ? null : adultos + ninos + infantes };
}

/** Día de la semana de una fecha AAAA-MM-DD, en el orden de DIAS_SEMANA (0 = lunes); null si la fecha no es válida. */
export function diaDeLaSemana(fecha: string): number | null {
  const t = fechaUtc(fecha);
  if (t === null) return null;
  const d = new Date(t).getUTCDay(); // 0 = domingo
  return (d + 6) % 7;
}

export const etiquetaDia = (indice: number): string => DIAS_SEMANA[indice];

export { aFecha };
