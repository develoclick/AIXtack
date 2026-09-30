"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { ALCANCES, ALOJAMIENTOS, COMODIDADES, datosVaciosDestinos, PREFERENCIAS, type Alcance, type Comodidad, type DatosDestinos, type Preferencia, type TipoAlojamiento } from "@/lib/destinos/tipos";

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

/** Formulario de «Descubrir destinos según tu presupuesto»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenDestinos = crearAlmacenLocal<DatosDestinos>(
  "gpia-destinos-datos-v1",
  datosVaciosDestinos,
  (g) => {
    const base = datosVaciosDestinos();
    const preferencias = Array.isArray(g.preferencias) ? g.preferencias.filter((p): p is Preferencia => PREFERENCIAS.some((x) => x.valor === p)) : base.preferencias;
    return {
      ...base,
      ...g,
      alojamiento: ALOJAMIENTOS.some((a) => a.valor === g.alojamiento) ? (g.alojamiento as TipoAlojamiento) : base.alojamiento,
      comodidad: COMODIDADES.some((c) => c.valor === g.comodidad) ? (g.comodidad as Comodidad) : base.comodidad,
      alcance: ALCANCES.some((a) => a.valor === g.alcance) ? (g.alcance as Alcance) : base.alcance,
      preferencias,
      equipaje: texto(g.equipaje),
      imprevistos: texto(g.imprevistos, "10"),
    };
  },
  (d) => [d.presupuesto, d.origen, d.viajeros, d.nochesMin, d.nochesMax, d.gastoDiario].some((t) => t.trim() !== ""),
);
