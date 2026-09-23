/**
 * Perfil «Mi negocio». Se guarda SOLO en el navegador (localStorage, siempre dentro de try/catch) y no
 * se envía a ningún servidor. Sin almacenamiento (modo privado, bloqueado, cuota) todo sigue
 * funcionando: el perfil vive en memoria hasta cerrar la pestaña.
 */
import { PERFIL_CLAVES, type Perfil, type PerfilClave } from "./tipos";

export const CLAVE_ALMACEN = "guiapromptsia:mi-negocio:v1";
export const EVENTO_PERFIL = "guiapromptsia:perfil";

export const TEXTO_PRIVACIDAD = "Tus datos se guardan solo en este navegador. No los recibimos ni los almacenamos.";

export interface CampoPerfil {
  clave: PerfilClave;
  label: string;
  ejemplo: string;
  tipo?: "texto" | "seleccion";
  opciones?: string[];
  largo?: boolean;
}

export const CAMPOS_PERFIL: CampoPerfil[] = [
  { clave: "nombre", label: "Nombre del negocio", ejemplo: "Panadería La Espiga" },
  { clave: "rubro", label: "Rubro", ejemplo: "Panadería" },
  { clave: "ciudad", label: "Ciudad y país", ejemplo: "Lima, Perú" },
  { clave: "queVendes", label: "Qué vendes (principal)", ejemplo: "Pan del día, pan dulce, tortas por encargo", largo: true },
  { clave: "clientes", label: "Clientes típicos", ejemplo: "Familias del barrio, oficinistas por la mañana", largo: true },
  { clave: "tono", label: "Tono", ejemplo: "Cercano", tipo: "seleccion", opciones: ["Cercano", "Profesional", "Divertido"] },
  { clave: "canales", label: "Canales", ejemplo: "WhatsApp, Instagram, local" },
  { clave: "direccion", label: "Dirección", ejemplo: "Av. Ejemplo 123" },
  { clave: "horario", label: "Horario", ejemplo: "L–D 6:30–20:00" },
  { clave: "contacto", label: "Contacto", ejemplo: "WhatsApp 999 999 999" },
  { clave: "moneda", label: "Moneda", ejemplo: "S/" },
];

export function etiquetaPerfil(clave: PerfilClave): string {
  return CAMPOS_PERFIL.find((c) => c.clave === clave)?.label ?? clave;
}

/** Deja solo claves conocidas con texto: lo guardado por versiones anteriores o alterado a mano no rompe nada. */
export function limpiarPerfil(crudo: unknown): Perfil {
  const limpio: Perfil = {};
  if (typeof crudo !== "object" || crudo === null) return limpio;
  for (const clave of PERFIL_CLAVES) {
    const v = (crudo as Record<string, unknown>)[clave];
    if (typeof v === "string" && v.trim() !== "") limpio[clave] = v.trim().slice(0, 400);
  }
  return limpio;
}

export function perfilVacio(perfil: Perfil): boolean {
  return PERFIL_CLAVES.every((clave) => !perfil[clave]);
}

/* ── almacenamiento ── */

let enMemoria: string | null = null;

export function leerPerfilCrudo(): string | null {
  try {
    return window.localStorage.getItem(CLAVE_ALMACEN) ?? enMemoria;
  } catch {
    return enMemoria;
  }
}

export function parsearPerfil(crudo: string | null): Perfil {
  if (!crudo) return {};
  try {
    return limpiarPerfil(JSON.parse(crudo));
  } catch {
    return {};
  }
}

export function guardarPerfil(perfil: Perfil): void {
  const json = JSON.stringify(limpiarPerfil(perfil));
  enMemoria = json;
  try {
    window.localStorage.setItem(CLAVE_ALMACEN, json);
  } catch {
    /* sin almacenamiento: queda en memoria */
  }
  window.dispatchEvent(new Event(EVENTO_PERFIL));
}

export function borrarPerfil(): void {
  enMemoria = null;
  try {
    window.localStorage.removeItem(CLAVE_ALMACEN);
  } catch {
    /* nada que borrar */
  }
  window.dispatchEvent(new Event(EVENTO_PERFIL));
}

export function suscribirPerfil(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO_PERFIL, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO_PERFIL, callback);
  };
}
