import { parsearNumero } from "@/lib/presupuesto/calculo";
import { MAX_HORAS, type DatosPlan, type FilaPlan } from "./tipos";

/** Horas por semana válidas: un número entre 1 y 60 (admite medias horas). */
export function horasDe(d: Pick<DatosPlan, "horas">): number | null {
  const n = parsearNumero(d.horas);
  if (n === null || n < 1 || n > MAX_HORAS) return null;
  return n;
}

/** Minutos disponibles a la semana = horas × 60. */
export function minutosDisponibles(d: Pick<DatosPlan, "horas">): number | null {
  const h = horasDe(d);
  return h === null ? null : Math.round(h * 60);
}

export const formatoDuracion = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

export interface SumaSemana {
  semana: number;
  tareas: number;
  minutos: number;
  /** Tareas de esa semana sin minutos válidos (no suman). */
  sinMinutos: number;
  disponibles: number | null;
  /** Minutos por encima de lo disponible (0 si cabe). */
  exceso: number;
  /** Minutos que quedan libres (reserva) si cabe. */
  libres: number | null;
}

/** Suma los minutos de cada semana (1 a 4) y los compara con lo disponible. La suma la hace la página, no la IA. */
export function sumasPorSemana(filas: FilaPlan[], disponibles: number | null, semanas = 4): SumaSemana[] {
  return Array.from({ length: semanas }, (_, i) => {
    const s = i + 1;
    const de = filas.filter((f) => f.semana === s);
    const minutos = de.reduce((t, f) => t + (f.minutos ?? 0), 0);
    return {
      semana: s,
      tareas: de.length,
      minutos,
      sinMinutos: de.filter((f) => f.minutos === null || f.minutos <= 0).length,
      disponibles,
      exceso: disponibles !== null ? Math.max(0, minutos - disponibles) : 0,
      libres: disponibles !== null ? Math.max(0, disponibles - minutos) : null,
    };
  });
}

export interface FilaDistribucion {
  actividad: string;
  porcentaje: number | null;
  porQue: string;
}

export interface DistribucionCalculada {
  filas: (FilaDistribucion & { minutos: number | null; formula: string })[];
  sumaPorcentajes: number;
  /** ¿Suman 100 % (con 0,5 de tolerancia por redondeo)? */
  suma100: boolean;
}

/** Convierte cada porcentaje en minutos con la fórmula a la vista: minutos = disponibles × % ÷ 100. */
export function calcularDistribucion(filas: FilaDistribucion[], disponibles: number | null): DistribucionCalculada {
  const redondear = (n: number) => Math.round((n + Number.EPSILON) * 10) / 10;
  const calculadas = filas.map((f) => {
    const minutos = f.porcentaje !== null && disponibles !== null ? redondear((disponibles * f.porcentaje) / 100) : null;
    return { ...f, minutos, formula: minutos !== null ? `${disponibles} × ${f.porcentaje} % ÷ 100 = ${minutos}` : "" };
  });
  const suma = redondear(filas.reduce((t, f) => t + (f.porcentaje ?? 0), 0));
  return { filas: calculadas, sumaPorcentajes: suma, suma100: Math.abs(suma - 100) <= 0.5 };
}
