"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosEntrevista, TIPOS_ENTREVISTA, MODOS, DIFICULTADES, COMPETENCIAS, type DatosEntrevista, type Historia } from "@/lib/entrevista/tipos";

const texto = (v: unknown) => (typeof v === "string" ? v : "");

/** Formulario de «Preparar una entrevista»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenEntrevista = crearAlmacenLocal<DatosEntrevista>(
  "gpia-entrevista-datos-v1",
  datosVaciosEntrevista,
  (g) => {
    const base = datosVaciosEntrevista();
    return {
      ...base,
      ...g,
      tipo: TIPOS_ENTREVISTA.some((t) => t.valor === g.tipo) ? g.tipo! : base.tipo,
      modo: MODOS.some((m) => m.valor === g.modo) ? g.modo! : base.modo,
      dificultad: DIFICULTADES.some((d) => d.valor === g.dificultad) ? g.dificultad! : base.dificultad,
      idioma: g.idioma === "en" ? "en" : "es",
    };
  },
  (d) => [d.cv, d.oferta, d.empresa, d.destacar, d.temas, d.duracion].some((t) => t.trim() !== ""),
);

export interface DatosHistorias {
  historias: Historia[];
}

function normalizarHistoria(h: Partial<Historia>, i: number): Historia {
  const validas = new Set<string>(COMPETENCIAS.map((c) => c.id));
  return {
    id: texto(h.id) || `guardada-${i}`,
    titulo: texto(h.titulo),
    competencias: Array.isArray(h.competencias) ? h.competencias.filter((c) => validas.has(c)) : [],
    situacion: texto(h.situacion),
    tarea: texto(h.tarea),
    accion: texto(h.accion),
    resultado: texto(h.resultado),
  };
}

/** Banco personal de historias STAR (localStorage). */
export const almacenHistorias = crearAlmacenLocal<DatosHistorias>(
  "gpia-entrevista-historias-v1",
  () => ({ historias: [] }),
  (g) => ({ historias: Array.isArray(g.historias) ? g.historias.map((h, i) => normalizarHistoria(h ?? {}, i)) : [] }),
  (d) => d.historias.some((h) => [h.titulo, h.situacion, h.tarea, h.accion, h.resultado].some((t) => t.trim() !== "")),
);

export interface DatosChecklist {
  marcados: string[];
}

export const almacenChecklist = crearAlmacenLocal<DatosChecklist>(
  "gpia-entrevista-checklist-v1",
  () => ({ marcados: [] }),
  (g) => ({ marcados: Array.isArray(g.marcados) ? g.marcados.filter((x): x is string => typeof x === "string") : [] }),
  (d) => d.marcados.length > 0,
);

export interface DatosNotas {
  notas: string;
}

/** Hoja para anotar durante la práctica (se guarda en el navegador). */
export const almacenNotas = crearAlmacenLocal<DatosNotas>(
  "gpia-entrevista-notas-v1",
  () => ({ notas: "" }),
  (g) => ({ notas: texto(g.notas) }),
  (d) => d.notas.trim() !== "",
);
