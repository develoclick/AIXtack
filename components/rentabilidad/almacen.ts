"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosMinimosRentabilidad } from "@/lib/rentabilidad/calculo";
import { datosVaciosRentabilidad, normalizarDatosRentabilidad, type DatosRentabilidad } from "@/lib/rentabilidad/tipos";

/** Formulario de «Calcular la rentabilidad de tu negocio por producto»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenRentabilidad = crearAlmacenLocal<DatosRentabilidad>(
  "gpia-rentabilidad-datos-v1",
  datosVaciosRentabilidad,
  (g) => normalizarDatosRentabilidad(g as Partial<DatosRentabilidad>),
  (d) => datosMinimosRentabilidad(d) || d.productos.some((p) => p.nombre.trim() !== ""),
);
