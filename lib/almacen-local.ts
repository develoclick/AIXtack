"use client";

import { useSyncExternalStore } from "react";

/**
 * Almacén de un formulario en el navegador (localStorage), leído con useSyncExternalStore para que el servidor y la primera
 * pintura coincidan (formulario vacío) sin efectos ni parpadeos. Los DATOS DE EJEMPLO nunca se guardan como datos de la
 * persona: mientras `modoEjemplo` es verdadero, los cambios viven solo en memoria y lo que había escrito sigue intacto.
 */
export function crearAlmacenLocal<T>(clave: string, vacio: () => T, normalizar: (guardado: Partial<T>) => T, hayDatos: (d: T) => boolean) {
  const VACIO = vacio();
  let cache: T | null = null;
  let modoEjemplo = false;
  let anterior: T | null = null;
  const oyentes = new Set<() => void>();
  const avisar = () => oyentes.forEach((o) => o());

  function leer(): T {
    try {
      const crudo = window.localStorage.getItem(clave);
      if (crudo) return normalizar(JSON.parse(crudo) as Partial<T>);
    } catch {
      // Almacenamiento bloqueado o dato dañado: se empieza vacío.
    }
    return vacio();
  }
  const instantanea = (): T => (cache ??= leer());
  const escribir = (d: T) => {
    try {
      window.localStorage.setItem(clave, JSON.stringify(d));
    } catch {
      // Sin almacenamiento: los datos viven mientras la página esté abierta.
    }
  };
  const suscribir = (o: () => void) => {
    oyentes.add(o);
    return () => {
      oyentes.delete(o);
    };
  };

  return {
    /** Cambio hecho por la persona: se guarda en su navegador, salvo que esté viendo datos de ejemplo. */
    guardar(d: T) {
      cache = d;
      if (!modoEjemplo) escribir(d);
      avisar();
    },
    /** Carga datos de ejemplo (solo en memoria). Devuelve lo que había, para poder deshacer. */
    cargarEjemplo(d: T): T {
      const previo = instantanea();
      if (!modoEjemplo) anterior = previo;
      modoEjemplo = true;
      cache = d;
      avisar();
      return anterior ?? previo;
    },
    deshacerEjemplo(previo: T) {
      modoEjemplo = false;
      anterior = null;
      cache = previo;
      escribir(previo);
      avisar();
    },
    borrar() {
      modoEjemplo = false;
      anterior = null;
      cache = vacio();
      try {
        window.localStorage.removeItem(clave);
      } catch {
        // ignorado
      }
      avisar();
    },
    /** ¿Hay algo escrito por la persona (no de ejemplo)? Sirve para pedir confirmación antes de reemplazarlo. */
    hayDatosDeLaPersona: (d: T) => !modoEjemplo && hayDatos(d),
    useDatos: (): T => useSyncExternalStore(suscribir, instantanea, () => VACIO),
    useModoEjemplo: (): boolean => useSyncExternalStore(suscribir, () => modoEjemplo, () => false),
  };
}
