"use client";

import { useSyncExternalStore } from "react";
import { datosVacios, type DatosCv } from "@/lib/cv/tipos";

const CLAVE = "gpia-cv-datos-v1";

/**
 * Los datos del formulario se guardan SOLO en el navegador de la persona (localStorage): no se envían a ningún servidor.
 * Se leen con useSyncExternalStore, así el servidor y la primera pintura del cliente coinciden (formulario vacío) y luego
 * aparece lo guardado, sin efectos ni parpadeos de hidratación.
 *
 * Los DATOS DE EJEMPLO nunca se guardan como datos de la persona: mientras `modoEjemplo` es verdadero, los cambios viven
 * solo en memoria y lo que la persona había escrito antes sigue intacto en su navegador.
 */
const VACIO: DatosCv = datosVacios();
let cache: DatosCv | null = null;
let modoEjemplo = false;
let anteriorGuardado: DatosCv | null = null;
const oyentes = new Set<() => void>();

function avisar() {
  oyentes.forEach((o) => o());
}

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

function escribir(d: DatosCv) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(d));
  } catch {
    // Sin almacenamiento: los datos viven mientras la página esté abierta.
  }
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

/** Cambio hecho por la persona: se guarda en su navegador, salvo que esté viendo datos de ejemplo. */
export function guardarDatos(d: DatosCv) {
  cache = d;
  if (!modoEjemplo) escribir(d);
  avisar();
}

/** Carga datos de ejemplo (solo en memoria). Devuelve lo que había, para poder deshacer. */
export function cargarEjemplo(d: DatosCv): DatosCv {
  const anterior = instantanea();
  if (!modoEjemplo) anteriorGuardado = anterior;
  modoEjemplo = true;
  cache = d;
  avisar();
  return anteriorGuardado ?? anterior;
}


/** Vuelve a lo que la persona había escrito antes del ejemplo. */
export function deshacerEjemplo(anterior: DatosCv) {
  modoEjemplo = false;
  anteriorGuardado = null;
  cache = anterior;
  escribir(anterior);
  avisar();
}

/** Borra todo (los datos de ejemplo o los propios) y deja el formulario vacío. */
export function borrarDatos() {
  modoEjemplo = false;
  anteriorGuardado = null;
  cache = datosVacios();
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // ignorado
  }
  avisar();
}

/** ¿Hay algo escrito por la persona (no de ejemplo)? Sirve para pedir confirmación antes de reemplazarlo. */
export function hayDatosDeLaPersona(d: DatosCv): boolean {
  if (modoEjemplo) return false;
  const textos = [d.puesto, d.oferta, d.nombre, d.email, d.telefono, d.ciudad, d.linkedin, d.web, d.resumen, d.habilidades, d.idiomas, d.certificaciones, d.proyectos];
  const filas = [...d.experiencias.flatMap((e) => [e.cargo, e.empresa, e.lugar, e.inicio, e.fin, e.logros]), ...d.estudios.flatMap((e) => [e.titulo, e.institucion, e.lugar, e.inicio, e.fin, e.detalle])];
  return [...textos, ...filas].some((t) => t.trim() !== "");
}

export function useDatosCv(): DatosCv {
  return useSyncExternalStore(suscribir, instantanea, () => VACIO);
}

export function useModoEjemplo(): boolean {
  return useSyncExternalStore(suscribir, () => modoEjemplo, () => false);
}
