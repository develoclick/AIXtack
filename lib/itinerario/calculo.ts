import { parsearNumero } from "@/lib/presupuesto/calculo";
import { diasEntre, fechaUtc, sumarDias } from "@/lib/plan/calendario";
import { maxPorDia, type DatosItinerario } from "./tipos";

export { fechaUtc };

/** Días del viaje (fecha de fin incluida): fin − inicio + 1. null si falta alguna fecha o el fin no es posterior o igual al inicio. */
export function diasDelViaje(d: Pick<DatosItinerario, "fechaInicio" | "fechaFin">): number | null {
  const n = diasEntre(d.fechaInicio, d.fechaFin);
  return n === null || n < 0 ? null : n + 1;
}

export function fechaDelDia(d: Pick<DatosItinerario, "fechaInicio">, dia: number): string | null {
  if (fechaUtc(d.fechaInicio) === null || dia < 1) return null;
  return sumarDias(d.fechaInicio, dia - 1);
}

/** Adultos + niños contados (los niños se cuentan por la cantidad de edades que la persona escribió, separadas por coma; 0 si no escribió ninguna). */
export function viajerosDelGrupo(d: Pick<DatosItinerario, "adultos" | "viajerosTexto">): { adultos: number | null; total: number | null } {
  const a = parsearNumero(d.adultos);
  const adultos = a !== null && Number.isInteger(a) && a >= 1 ? a : null;
  return { adultos, total: adultos };
}

const horaValida = (h: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h.trim());
export { horaValida };

/** Minutos desde medianoche de una hora HH:MM; null si no es válida. */
export function minutosDeHora(h: string): number | null {
  if (!horaValida(h)) return null;
  const [hh, mm] = h.trim().split(":").map(Number);
  return hh * 60 + mm;
}

export const HORA_LLEGADA_POR_DEFECTO = "09:00";
export const HORA_SALIDA_POR_DEFECTO = "18:00";

/** Máximo de actividades principales (imprescindible + opcional) por día según el ritmo elegido. */
export const maximoDelRitmo = maxPorDia;
