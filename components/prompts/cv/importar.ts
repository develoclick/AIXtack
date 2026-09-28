"use client";

import { useSyncExternalStore } from "react";

/**
 * Respuesta traída desde otra herramienta (por ejemplo, «Optimizar tu CV» → «Convertir en CV Harvard»). Vive en sessionStorage
 * (solo esta pestaña, nunca se envía a ningún servidor) y se consume una sola vez.
 */
const CLAVE = "gpia-cv-respuesta-importada";
let leida: string | null = null;
const oyentes = new Set<() => void>();

export function guardarRespuestaImportada(texto: string) {
  try {
    window.sessionStorage.setItem(CLAVE, texto);
  } catch {
    // Sin almacenamiento de sesión: no se puede traer.
  }
  leida = null;
  oyentes.forEach((o) => o());
}

function instantanea(): string {
  if (leida === null) {
    try {
      leida = window.sessionStorage.getItem(CLAVE) ?? "";
      if (leida) window.sessionStorage.removeItem(CLAVE);
    } catch {
      leida = "";
    }
  }
  return leida;
}

export function useRespuestaImportada(): string {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => {
        oyentes.delete(o);
      };
    },
    instantanea,
    () => "",
  );
}
