"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosItinerario, INTERESES, lugarVacio, RITMOS, TRANSPORTES, type DatosItinerario, type Interes, type Lugar, type Ritmo, type Transporte } from "@/lib/itinerario/tipos";

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

function normalizarLugar(l: Partial<Lugar> | undefined, i: number): Lugar {
  const base = lugarVacio(`x${i}`);
  if (!l || typeof l !== "object") return base;
  return { id: texto(l.id) || base.id, nombre: texto(l.nombre), prioridad: l.prioridad === "opcional" ? "opcional" : "imprescindible", horario: texto(l.horario), reserva: texto(l.reserva) };
}

function normalizarLista<T extends string>(v: unknown, validos: readonly T[]): T[] {
  return Array.isArray(v) ? [...new Set(v.filter((x): x is T => validos.includes(x as T)))] : [];
}

/** Formulario de «Crear un itinerario de viaje»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenItinerario = crearAlmacenLocal<DatosItinerario>(
  "gpia-itinerario-datos-v1",
  datosVaciosItinerario,
  (g) => {
    const base = datosVaciosItinerario();
    return {
      ...base,
      ...g,
      movilidadReducida: g.movilidadReducida === true,
      ritmo: RITMOS.some((r) => r.valor === g.ritmo) ? (g.ritmo as Ritmo) : base.ritmo,
      intereses: normalizarLista<Interes>(g.intereses, INTERESES.map((i) => i.valor)),
      transporte: normalizarLista<Transporte>(g.transporte, TRANSPORTES.map((t) => t.valor)),
      lugares: Array.isArray(g.lugares) ? g.lugares.slice(0, 20).map((l: Partial<Lugar>, i: number) => normalizarLugar(l, i)) : [],
    };
  },
  (d) =>
    [d.destino, d.fechaInicio, d.fechaFin, d.horaLlegada, d.horaSalida, d.alojamiento, d.adultos, d.viajerosTexto, d.presupuesto, d.interesesTexto, d.restricciones].some((t) => t.trim() !== "") ||
    d.intereses.length > 0 ||
    d.transporte.length > 0 ||
    d.lugares.length > 0,
);
