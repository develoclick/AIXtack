"use client";

type Parametros = Record<string, string | number | boolean>;

/**
 * Registra un evento en Google Analytics SOLO si la persona aceptó las cookies analíticas y GA ya está preparado en la página.
 * Sin consentimiento no se envía nada (ni se acumula para enviarlo después). Eventos de la herramienta de CV:
 * ejemplo_rellenado, ejemplo_descargado, ejemplo_limpiado y datos_propios_iniciados.
 */
export function registrarEvento(nombre: string, parametros: Parametros = {}) {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    const consentimiento = JSON.parse(window.localStorage.getItem("aixtack:consent") ?? "null") as { analytics?: string } | null;
    if (consentimiento?.analytics !== "granted" || typeof w.gtag !== "function") return;
    w.gtag("event", nombre, parametros);
  } catch {
    // La analítica nunca debe romper la herramienta.
  }
}
