"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosOptimizar, type DatosOptimizar } from "@/lib/optimizar/tipos";

/** Formulario de «Optimizar tu CV»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenOptimizar = crearAlmacenLocal<DatosOptimizar>(
  "gpia-optimizar-datos-v1",
  datosVaciosOptimizar,
  (g) => ({ ...datosVaciosOptimizar(), ...g }),
  (d) => [d.cv, d.oferta, d.intocables, d.datosNuevos].some((t) => t.trim() !== "") || d.pais.trim() !== "Perú",
);
