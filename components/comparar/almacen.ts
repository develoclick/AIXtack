"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosComparar, MAX_OPCIONES, MIN_OPCIONES, opcionVacia, TIPOS_COMPARACION, type Criterio, type DatosComparar, type Opcion, type TipoComparacion } from "@/lib/comparar/tipos";

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

function normalizarOpcion(o: unknown, id: string): Opcion {
  const base = opcionVacia(id);
  if (!o || typeof o !== "object") return base;
  const g = o as Partial<Opcion>;
  return { ...base, ...g, id };
}

function normalizarCriterio(c: unknown): Criterio | null {
  if (!c || typeof c !== "object") return null;
  const g = c as Partial<Criterio>;
  if (typeof g.id !== "string" || typeof g.nombre !== "string") return null;
  return { id: g.id, nombre: g.nombre, peso: texto(g.peso, "0"), predefinido: g.predefinido === true };
}

/** Formulario de «Comparar opciones de viaje»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenComparar = crearAlmacenLocal<DatosComparar>(
  "gpia-comparar-datos-v1",
  datosVaciosComparar,
  (g) => {
    const base = datosVaciosComparar();
    const opciones = Array.isArray(g.opciones) ? g.opciones.slice(0, MAX_OPCIONES).map((o, i) => normalizarOpcion(o, (o as Partial<Opcion>)?.id || `o${i + 1}`)) : base.opciones;
    const criterios = Array.isArray(g.criterios) ? (g.criterios.map(normalizarCriterio).filter(Boolean) as Criterio[]) : base.criterios;
    const puntuaciones = g.puntuaciones && typeof g.puntuaciones === "object" ? (g.puntuaciones as DatosComparar["puntuaciones"]) : {};
    return {
      ...base,
      ...g,
      tipo: TIPOS_COMPARACION.some((t) => t.valor === g.tipo) ? (g.tipo as TipoComparacion) : base.tipo,
      opciones: opciones.length >= MIN_OPCIONES ? opciones : base.opciones,
      criterios: criterios.length ? criterios : base.criterios,
      puntuaciones,
      viajeros: texto(g.viajeros),
      fechas: texto(g.fechas),
      valorTiempo: texto(g.valorTiempo),
    };
  },
  (d) => d.opciones.some((o) => o.nombre.trim() !== "" || o.precio.trim() !== "") || d.viajeros.trim() !== "",
);
