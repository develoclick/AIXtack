"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosAnalisis, DISTINGUE, type DatosAnalisis } from "@/lib/analisis/tipos";

/** Formulario de «Comparar tu CV con una oferta»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenAnalisis = crearAlmacenLocal<DatosAnalisis>(
  "gpia-analisis-datos-v1",
  datosVaciosAnalisis,
  (g) => {
    const base = datosVaciosAnalisis();
    const peso = Number(g.pesoObligatorio);
    return {
      ...base,
      ...g,
      pesoObligatorio: Number.isFinite(peso) ? Math.min(100, Math.max(0, Math.round(peso))) : base.pesoObligatorio,
      distingue: DISTINGUE.some((d) => d.valor === g.distingue) ? g.distingue! : base.distingue,
    };
  },
  (d) => [d.cv, d.oferta, d.anios].some((t) => t.trim() !== "") || d.distingue !== "nose" || d.pesoObligatorio !== 70,
);
