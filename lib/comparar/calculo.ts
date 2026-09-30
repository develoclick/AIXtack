import { formatoMonto, parsearNumero } from "@/lib/presupuesto/calculo";
import type { Criterio, DatosComparar, Opcion, Puntuaciones } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export interface CostoAjustado {
  precio: number | null;
  extra: number;
  tiempo: number;
  total: number | null;
  /** Fórmula visible: «450 + 30 + 2 h × 20» (solo los términos que aplican). */
  formula: string;
}

/** Costo total ajustado de una opción: precio + extras conocidos + (horas de trayecto × valor de tu tiempo, si lo diste). */
export function costoAjustado(o: Opcion, valorTiempoPorHora: number | null): CostoAjustado {
  const precio = parsearNumero(o.precio);
  const extra = parsearNumero(o.costoExtra) ?? 0;
  const horas = parsearNumero(o.horasTrayecto);
  const tiempo = horas !== null && valorTiempoPorHora !== null ? redondear(horas * valorTiempoPorHora) : 0;
  if (precio === null) return { precio: null, extra, tiempo, total: null, formula: "" };
  const partes = [formatoMonto(precio)];
  if (extra > 0) partes.push(formatoMonto(extra));
  if (tiempo > 0) partes.push(`${formatoMonto(horas!)} h × ${formatoMonto(valorTiempoPorHora!)}`);
  return { precio, extra, tiempo, total: redondear(precio + extra + tiempo), formula: partes.join(" + ") };
}

export function pesoNumerico(c: Criterio): number {
  const n = parsearNumero(c.peso);
  return n === null || n < 0 ? 0 : n;
}

export function sumaPesos(criterios: Criterio[]): number {
  return redondear(criterios.reduce((a, c) => a + pesoNumerico(c), 0));
}

/** Puntuación (1 a 5) que la persona puso a una opción en un criterio; 3 (intermedio) si no la puso. */
export function puntuacionDe(puntuaciones: Puntuaciones, opcionId: string, criterioId: string): number {
  const s = puntuaciones[opcionId]?.[criterioId];
  const n = s === undefined || s === "" ? null : parsearNumero(s);
  return n === null ? 3 : Math.min(5, Math.max(1, n));
}

/**
 * Puntuación ponderada de una opción, en una escala de 0 a 100: para cada criterio, su puntuación (1–5) por su peso relativo
 * (peso del criterio ÷ suma de todos los pesos), sumado y multiplicado por 20. `pesos`, si se da, sustituye el peso de los
 * criterios (para la sensibilidad: «si cambian mis prioridades»); si no se da, usa el peso guardado de cada criterio.
 */
export function puntuacionPonderada(opcionId: string, criterios: Criterio[], puntuaciones: Puntuaciones, pesos?: Record<string, number>): number {
  const obtenerPeso = (c: Criterio) => pesos?.[c.id] ?? pesoNumerico(c);
  const total = criterios.reduce((a, c) => a + obtenerPeso(c), 0);
  if (total <= 0) return 0;
  const suma = criterios.reduce((a, c) => a + (obtenerPeso(c) / total) * puntuacionDe(puntuaciones, opcionId, c.id), 0);
  return redondear(suma * 20);
}

export type PerfilPeso = "actual" | "precio" | "comodidadYTiempo";
export const PERFILES_PESO: { valor: PerfilPeso; etiqueta: string }[] = [
  { valor: "actual", etiqueta: "Tus prioridades actuales" },
  { valor: "precio", etiqueta: "Si priorizo el precio" },
  { valor: "comodidadYTiempo", etiqueta: "Si priorizo comodidad y tiempo" },
];

/**
 * Pesos alternativos para un perfil de sensibilidad: reserva 60 puntos para el/los criterio(s) que destaca el perfil (repartidos
 * entre ellos si hay más de uno presente) y reparte los 40 restantes entre el resto, proporcional a su peso actual. Si ninguno
 * de los criterios que destaca el perfil está entre los de la persona, se queda con sus pesos actuales (perfil no aplicable).
 */
export function pesosDePerfil(criterios: Criterio[], perfil: PerfilPeso): Record<string, number> {
  const actuales = Object.fromEntries(criterios.map((c) => [c.id, pesoNumerico(c)]));
  if (perfil === "actual") return actuales;
  const destacados = (perfil === "precio" ? ["precio"] : ["comodidad", "tiempo"]).filter((id) => criterios.some((c) => c.id === id));
  if (destacados.length === 0) return actuales;
  const restantes = criterios.filter((c) => !destacados.includes(c.id));
  const sumaRestante = restantes.reduce((a, c) => a + pesoNumerico(c), 0);
  const resultado: Record<string, number> = {};
  for (const id of destacados) resultado[id] = 60 / destacados.length;
  for (const c of restantes) resultado[c.id] = sumaRestante > 0 ? (pesoNumerico(c) / sumaRestante) * 40 : 40 / restantes.length;
  return resultado;
}

export interface FilaResumen {
  opcion: Opcion;
  costo: CostoAjustado;
  puntuacion: number;
}

export function filasResumen(d: DatosComparar): FilaResumen[] {
  const valorTiempo = parsearNumero(d.valorTiempo);
  return d.opciones.map((o) => ({ opcion: o, costo: costoAjustado(o, valorTiempo), puntuacion: puntuacionPonderada(o.id, d.criterios, d.puntuaciones) }));
}

export function masBarata(filas: FilaResumen[]): FilaResumen | null {
  const conCosto = filas.filter((f) => f.costo.total !== null);
  if (!conCosto.length) return null;
  return conCosto.reduce((a, b) => (b.costo.total! < a.costo.total! ? b : a));
}

export function mejorPuntuada(filas: FilaResumen[]): FilaResumen | null {
  if (!filas.length) return null;
  return filas.reduce((a, b) => (b.puntuacion > a.puntuacion ? b : a));
}

export function ganadorDePerfil(d: DatosComparar, perfil: PerfilPeso): FilaResumen | null {
  const pesos = pesosDePerfil(d.criterios, perfil);
  const filas = d.opciones.map((o) => ({ opcion: o, costo: costoAjustado(o, parsearNumero(d.valorTiempo)), puntuacion: puntuacionPonderada(o.id, d.criterios, d.puntuaciones, pesos) }));
  return mejorPuntuada(filas);
}

/** Progreso mínimo para pasar al paso 2 (nombre y precio en las opciones, y al menos un criterio con peso). */
export function datosMinimosComparar(d: DatosComparar): boolean {
  const opcionesListas = d.opciones.filter((o) => o.nombre.trim() && parsearNumero(o.precio) !== null).length >= 2;
  return opcionesListas && sumaPesos(d.criterios) > 0;
}
