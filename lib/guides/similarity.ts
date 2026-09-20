import { SIMILARITY } from "./constants";

/** Normaliza texto para comparar: minúsculas, sin puntuación, palabras sueltas. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function shingles(tokens: string[], size = SIMILARITY.shingleSize): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i + size <= tokens.length; i++) set.add(tokens.slice(i, i + size).join(" "));
  return set;
}

/** Similitud de Jaccard entre dos conjuntos (0–1). */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const item of small) if (large.has(item)) shared++;
  return shared / (a.size + b.size - shared);
}

/** Clave normalizada de un párrafo para detectar párrafos idénticos entre guías. */
export function paragraphKey(paragraph: string): string | null {
  const tokens = tokenize(paragraph);
  return tokens.length >= SIMILARITY.minParagraphWords ? tokens.join(" ") : null;
}
