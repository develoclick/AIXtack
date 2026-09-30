"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosLogo, ESTILOS, USOS, type DatosLogo, type Estilo, type Personalidad, type Uso } from "@/lib/logo/tipos";

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

function normalizarPersonalidad(g: unknown): Personalidad {
  const base = datosVaciosLogo().personalidad;
  if (!g || typeof g !== "object") return base;
  const p = g as Partial<Record<keyof Personalidad, unknown>>;
  const num = (v: unknown, def: number) => (typeof v === "number" && v >= 0 && v <= 100 ? v : def);
  return { clasicoModerno: num(p.clasicoModerno, base.clasicoModerno), serioCercano: num(p.serioCercano, base.serioCercano), lujoAccesible: num(p.lujoAccesible, base.lujoAccesible) };
}

/** Formulario de «Crear un logo profesional para tu empresa»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. La imagen que subas al laboratorio NO se guarda aquí: vive solo en memoria mientras tienes la pestaña abierta. */
export const almacenLogo = crearAlmacenLocal<DatosLogo>(
  "gpia-logo-datos-v1",
  datosVaciosLogo,
  (g) => {
    const base = datosVaciosLogo();
    const usos = Array.isArray(g.usos) ? g.usos.filter((u): u is Uso => USOS.some((x) => x.valor === u)) : base.usos;
    return {
      ...base,
      ...g,
      estilo: ESTILOS.some((e) => e.valor === g.estilo) ? (g.estilo as Estilo) : base.estilo,
      usos,
      personalidad: normalizarPersonalidad(g.personalidad),
      generador: texto(g.generador),
    };
  },
  (d) => [d.nombreEmpresa, d.rubro, d.oferta, d.publico].some((t) => t.trim() !== ""),
);
