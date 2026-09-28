/** Años escritos por la persona («3», «0,7», «1.5», «2 años»); null si no es un número válido. */
export function parsearAnios(texto: string): number | null {
  const s = (texto ?? "").replace(/[^\d.,]/g, "").replace(",", ".");
  if (!s || !/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n <= 60 ? n : null;
}
