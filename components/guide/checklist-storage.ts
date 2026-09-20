/**
 * Almacenamiento local de listas marcables (checklists y pasos del método). Todo ocurre en el
 * navegador; no se envía nada. Se lee con useSyncExternalStore para evitar desajustes de hidratación.
 */
const CHANGE_EVENT = "guia-checklist-change";

export function subscribeStored(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // sin almacenamiento: la lista funciona igual, solo que sin memoria
  }
}

export function writeStored(key: string, ids: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignorado a propósito */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function parseStored(raw: string | null, valid: Set<string>): Set<string> {
  if (!raw) return new Set();
  try {
    const saved: unknown = JSON.parse(raw);
    return new Set(Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string" && valid.has(id)) : []);
  } catch {
    return new Set();
  }
}
