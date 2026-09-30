"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosFechas, EQUIPAJES, type DatosFechas, type Equipaje } from "@/lib/fechas/tipos";

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

/** Formulario de «Fechas más baratas para volar»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenFechas = crearAlmacenLocal<DatosFechas>(
  "gpia-fechas-datos-v1",
  datosVaciosFechas,
  (g) => {
    const base = datosVaciosFechas();
    return {
      ...base,
      ...g,
      soloDirectos: g.soloDirectos === true,
      evitarMadrugada: g.evitarMadrugada === true,
      equipaje: EQUIPAJES.some((e) => e.valor === g.equipaje) ? (g.equipaje as Equipaje) : base.equipaje,
      duraciones: texto(g.duraciones),
    };
  },
  (d) => [d.origen, d.destino, d.fechaInicio, d.fechaFin, d.duraciones, d.adultos, d.aeropuertosAlternativos, d.aerolineasExcluir].some((t) => t.trim() !== ""),
);
