import type { Nicho } from "./tipos";
import type { LecturaValidacion } from "./lector";

/**
 * Revisión del Prompt 1: aquí no hay «cifras inventadas» que detectar (los nichos y sus puntuaciones son hipótesis de la
 * IA, no datos que la página ya calculó); lo que sí se revisa es que la ficha de cada nicho esté completa.
 */
export function revisarNichos1(nichos: Nicho[]): string[] {
  const avisos: string[] = [];
  const incompletos = nichos.filter((n) => !n.cliente.trim() || !n.problema.trim() || !n.oferta.trim());
  if (incompletos.length > 0) avisos.push(`${incompletos.length} nicho(s) no traen cliente, problema u oferta: pídele a tu IA que complete la ficha antes de compararlos.`);
  const sinJustificacion = nichos.filter((n) => !n.justificacion.trim());
  if (sinJustificacion.length > 0) avisos.push(`${sinJustificacion.length} nicho(s) no traen justificación de sus puntuaciones: revísalas con más cuidado antes de confiar en ellas.`);
  return avisos;
}

/** Revisión del Prompt 2: solo verifica que las hipótesis sobre el cliente estén etiquetadas, no cifras (no hay ninguna cifra oficial que citar aquí). */
export function revisarValidacion(l: LecturaValidacion): string[] {
  const avisos: string[] = [];
  if (l.conteoHipotesis === 0) avisos.push("Ninguna afirmación está marcada como «[HIPÓTESIS]»: revisa que la IA haya separado lo que sabes de lo que todavía debes validar.");
  return avisos;
}
