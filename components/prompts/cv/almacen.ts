"use client";

import { useSyncExternalStore } from "react";
import { datosVacios, type DatosCv } from "@/lib/cv/tipos";

const CLAVE = "gpia-cv-datos-v1";

/**
 * Los datos del formulario se guardan SOLO en el navegador de la persona (localStorage): no se envían a ningún servidor.
 * Se leen con useSyncExternalStore, así el servidor y la primera pintura del cliente coinciden (formulario vacío) y luego
 * aparece lo guardado, sin efectos ni parpadeos de hidratación.
 */
const VACIO: DatosCv = datosVacios();
let cache: DatosCv | null = null;
const oyentes = new Set<() => void>();

function leer(): DatosCv {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (crudo) {
      const d = JSON.parse(crudo) as Partial<DatosCv>;
      const base = datosVacios();
      return {
        ...base,
        ...d,
        experiencias: Array.isArray(d.experiencias) && d.experiencias.length ? d.experiencias : base.experiencias,
        estudios: Array.isArray(d.estudios) && d.estudios.length ? d.estudios : base.estudios,
      };
    }
  } catch {
    // Almacenamiento bloqueado o dato dañado: se empieza vacío.
  }
  return datosVacios();
}

function instantanea(): DatosCv {
  if (cache === null) cache = leer();
  return cache;
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function guardarDatos(d: DatosCv) {
  cache = d;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(d));
  } catch {
    // Sin almacenamiento: los datos viven mientras la página esté abierta.
  }
  oyentes.forEach((o) => o());
}

export function borrarDatos() {
  cache = datosVacios();
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // ignorado
  }
  oyentes.forEach((o) => o());
}

export function useDatosCv(): DatosCv {
  return useSyncExternalStore(suscribir, instantanea, () => VACIO);
}
