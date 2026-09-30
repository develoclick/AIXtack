import type { NichoRankeado } from "./calculo";

const campo = (t: string | number) => (/[",\n]/.test(String(t)) ? `"${String(t).replace(/"/g, '""')}"` : String(t));

/** Exporta la matriz ya rankeada a .csv: posición, nombre, las 5 puntuaciones y la puntuación ponderada. */
export function csvDeMatriz(nichos: NichoRankeado[]): string {
  const filas = nichos.map((n) => [n.posicion, n.nombre, n.cliente, n.entrada, n.inversion, n.recurrencia, n.diferenciacion, n.encaje, n.puntuacion].map(campo).join(","));
  return ["Posición,Nicho,Cliente objetivo,Facilidad de entrada,Inversión requerida,Recurrencia,Diferenciación,Encaje,Puntuación ponderada", ...filas].join("\n");
}
