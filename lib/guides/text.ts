import { collectStrings } from "./analyze";
import type { GuideData } from "./model";

/** Claves de datos que no forman parte de lo que lee el visitante. */
const INTERNAL_KEYS = new Set(["metadata", "mediaPlan"]);

function isImageRef(value: unknown): boolean {
  return typeof value === "object" && value !== null && "src" in value && "alt" in value;
}

/** Todas las cadenas de `data` que lee el visitante (sin metadatos, plan interno, imágenes ni el texto de los prompts). */
export function visibleStrings(data: GuideData): string[] {
  const out: string[] = [];
  const walk = (value: unknown): void => {
    if (isImageRef(value)) return;
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
    else collectStrings(value, out);
  };
  for (const [key, value] of Object.entries(data)) {
    if (INTERNAL_KEYS.has(key)) continue;
    if (key === "prompts") {
      // El texto del prompt se copia y se pega, no se lee: el tiempo de lectura cuenta solo su ficha.
      for (const prompt of Object.values(data.prompts)) walk({ ...prompt, prompt: "" });
      continue;
    }
    walk(value);
  }
  return out;
}

export function countWords(texts: string[]): number {
  return texts.join(" ").split(/\s+/).filter(Boolean).length;
}
