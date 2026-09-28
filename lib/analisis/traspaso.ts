import { datosVaciosEntrevista } from "@/lib/entrevista/tipos";
import { datosVaciosOptimizar } from "@/lib/optimizar/tipos";
import type { Requisito } from "./tipos";

export type DestinoTraspaso = "optimizar" | "entrevista";

const CLAVES: Record<DestinoTraspaso, string> = { optimizar: "gpia-optimizar-datos-v1", entrevista: "gpia-entrevista-datos-v1" };
export const RUTAS_TRASPASO: Record<DestinoTraspaso, string> = { optimizar: "/carrera-y-empleo/optimizar-cv", entrevista: "/carrera-y-empleo/preparar-entrevista-de-trabajo" };

/** Requisitos que el CV no evidencia del todo: los obligatorios «no identificados» y «parciales» primero, luego los deseables. */
export function brechasDelAnalisis(requisitos: Requisito[]): Requisito[] {
  const faltan = requisitos.filter((r) => r.estado === "NO IDENTIFICADO" || r.estado === "PARCIAL");
  const peso = (r: Requisito) => (r.tipo === "DESEABLE" ? 2 : 0) + (r.estado === "PARCIAL" ? 1 : 0);
  return faltan.slice().sort((a, b) => peso(a) - peso(b));
}

/** Texto de las brechas para el campo «Temas que te preocupan» de «Preparar entrevista». */
export function textoDeBrechas(requisitos: Requisito[]): string {
  const b = brechasDelAnalisis(requisitos);
  if (b.length === 0) return "";
  return `Requisitos de la oferta que mi CV no evidencia del todo: ${b.map((r) => `${r.requisito} (${r.estado === "PARCIAL" ? "parcial" : "no identificado"}${r.tipo === "OBLIGATORIO" ? ", obligatorio" : ""})`).join("; ")}.`;
}

function leer(destino: DestinoTraspaso): Record<string, unknown> | null {
  try {
    const crudo = window.localStorage.getItem(CLAVES[destino]);
    return crudo ? (JSON.parse(crudo) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** ¿La herramienta de destino ya tiene un CV o una oferta guardados (que se reemplazarían)? */
export function destinoTieneDatos(destino: DestinoTraspaso): boolean {
  const g = leer(destino);
  return Boolean(g && ((typeof g.cv === "string" && g.cv.trim()) || (typeof g.oferta === "string" && g.oferta.trim())));
}

/**
 * Lleva el CV, la oferta y las brechas a otra herramienta: escribe en el almacenamiento de esa herramienta (en tu navegador; no se
 * envía nada) y la persona abre la página con una carga completa, así lo lee al empezar.
 */
export function llevarA(destino: DestinoTraspaso, datos: { cv: string; oferta: string }, requisitos: Requisito[]): boolean {
  try {
    const previo = leer(destino) ?? {};
    const base = destino === "optimizar" ? datosVaciosOptimizar() : datosVaciosEntrevista();
    const fusion: Record<string, unknown> = { ...base, ...previo, cv: datos.cv, oferta: datos.oferta };
    if (destino === "entrevista") {
      const brechas = textoDeBrechas(requisitos);
      if (brechas) fusion.temas = brechas;
    }
    window.localStorage.setItem(CLAVES[destino], JSON.stringify(fusion));
    return true;
  } catch {
    return false;
  }
}
