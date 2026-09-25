"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Estado que solo vive en este navegador (el kit final, la lista de revisión…): localStorage con try/catch y, si está
 * bloqueado o lleno, la memoria de esta visita. Nada sale del navegador. En el servidor (y en la primera pintura) vale `vacio`.
 */
const enMemoria = new Map<string, string>();
const oyentes = new Set<() => void>();

function leer(clave: string, vacio: string): string {
  try {
    const valor = window.localStorage.getItem(clave);
    if (valor !== null) return valor;
  } catch {
    /* almacenamiento bloqueado: se usa la memoria de esta visita */
  }
  return enMemoria.get(clave) ?? vacio;
}

function escribir(clave: string, valor: string) {
  enMemoria.set(clave, valor);
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    /* sin almacenamiento: sigue funcionando, solo que no recuerda entre visitas */
  }
  oyentes.forEach((aviso) => aviso());
}

function suscribir(aviso: () => void) {
  oyentes.add(aviso);
  window.addEventListener("storage", aviso);
  return () => {
    oyentes.delete(aviso);
    window.removeEventListener("storage", aviso);
  };
}

/** Un texto guardado en este navegador bajo `clave`, y la función que lo cambia. `vacio` es el valor sin nada guardado. */
export function useAlmacenLocal(clave: string, vacio: string): [string, (valor: string) => void] {
  const crudo = useSyncExternalStore(suscribir, () => leer(clave, vacio), () => vacio);
  const guardar = useCallback((valor: string) => escribir(clave, valor), [clave]);
  return [crudo, guardar];
}

/** Lee un JSON guardado; si está dañado o no tiene la forma esperada, devuelve `porDefecto`. */
export function leerJson<T>(crudo: string, porDefecto: T, valido: (x: unknown) => x is T): T {
  try {
    const x: unknown = JSON.parse(crudo);
    return valido(x) ? x : porDefecto;
  } catch {
    return porDefecto;
  }
}
