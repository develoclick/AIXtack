import { ESTADOS, type EstadoRequisito, type Requisito, type TipoRequisito } from "./tipos";

export interface GrupoPuntaje {
  tipo: TipoRequisito;
  /** Peso del grupo, de 0 a 1. */
  peso: number;
  /** Requisitos evaluables del grupo (sin NO EVALUABLE). */
  evaluables: Requisito[];
  /** Suma de los valores de sus estados (1, 0.5 y 0). */
  suma: number;
  /** Promedio del grupo (suma ÷ evaluables), o null si no tiene requisitos evaluables. */
  promedio: number | null;
}

export interface Puntaje {
  /** De 0 a 100, redondeado; null si no hay ningún requisito evaluable. */
  porcentaje: number | null;
  /** Fracción exacta, de 0 a 1. */
  fraccion: number | null;
  grupos: GrupoPuntaje[];
  /** Grupos que entran al cálculo (los que tienen al menos un requisito evaluable). */
  usados: GrupoPuntaje[];
  excluidos: number;
  porEstado: Record<EstadoRequisito, number>;
  /** La fórmula con los números de este análisis, para mostrarla a la persona. */
  formula: string;
}

export const valorDeEstado = (e: EstadoRequisito | null): number | null => (e === null ? null : (ESTADOS.find((x) => x.estado === e)?.valor ?? null));

const dos = (n: number) => n.toFixed(2);

/**
 * Pesos de los tres grupos a partir del peso de los obligatorios (0–100). Los deseables pesan el resto. Los requisitos «no
 * especificados» (la oferta no los distingue) pesan la media de los dos pesos, para no favorecer ni castigar de más.
 */
export function pesosDeGrupos(pesoObligatorio: number): Record<TipoRequisito, number> {
  const o = Math.min(100, Math.max(0, Math.round(pesoObligatorio))) / 100;
  return { OBLIGATORIO: o, DESEABLE: 1 - o, "NO ESPECIFICADO": 0.5 };
}

/**
 * Porcentaje orientativo: cada grupo (obligatorios, deseables, no especificados) se promedia con CUMPLE = 1, PARCIAL = 0,5 y
 * NO IDENTIFICADO = 0, y los promedios se combinan con los pesos de cada grupo. NO EVALUABLE se excluye. Un grupo sin requisitos
 * evaluables no entra (sus pesos se reparten entre los que sí). No es una probabilidad: mide cuánta evidencia hay en el CV.
 */
export function calcularPuntaje(requisitos: Requisito[], pesoObligatorio: number): Puntaje {
  const pesos = pesosDeGrupos(pesoObligatorio);
  const porEstado: Record<EstadoRequisito, number> = { CUMPLE: 0, PARCIAL: 0, "NO IDENTIFICADO": 0, "NO EVALUABLE": 0 };
  for (const r of requisitos) if (r.estado) porEstado[r.estado] += 1;

  const grupos: GrupoPuntaje[] = (["OBLIGATORIO", "DESEABLE", "NO ESPECIFICADO"] as TipoRequisito[]).map((tipo) => {
    const evaluables = requisitos.filter((r) => r.tipo === tipo && valorDeEstado(r.estado) !== null);
    const suma = evaluables.reduce((a, r) => a + (valorDeEstado(r.estado) ?? 0), 0);
    return { tipo, peso: pesos[tipo], evaluables, suma, promedio: evaluables.length ? suma / evaluables.length : null };
  });
  const usados = grupos.filter((g) => g.promedio !== null && g.peso > 0);
  const excluidos = requisitos.filter((r) => r.estado === "NO EVALUABLE").length;
  const total = usados.reduce((a, g) => a + g.peso, 0);
  if (usados.length === 0 || total === 0) return { porcentaje: null, fraccion: null, grupos, usados, excluidos, porEstado, formula: "Todavía no hay requisitos evaluables para calcular el porcentaje." };

  const fraccion = usados.reduce((a, g) => a + g.peso * (g.promedio ?? 0), 0) / total;
  const arriba = usados.map((g) => `${dos(g.peso)} × ${dos(g.promedio ?? 0)}`).join(" + ");
  const abajo = usados.map((g) => dos(g.peso)).join(" + ");
  const formula = usados.length === 1 ? `${dos(usados[0].promedio ?? 0)} (solo hay un grupo con requisitos evaluables)` : `(${arriba}) ÷ (${abajo}) = ${dos(fraccion)}`;
  return { porcentaje: Math.round(fraccion * 100), fraccion, grupos, usados, excluidos, porEstado, formula: `${formula} → ${Math.round(fraccion * 100)} %` };
}

export type NivelDecision = "postula" | "ajustando" | "si-cumples";

export interface Decision {
  nivel: NivelDecision;
  titulo: string;
  explicacion: string;
  /** Requisitos que sostienen la decisión (los obligatorios en estado NO IDENTIFICADO, o los PARCIALES). */
  claves: Requisito[];
  /** La regla, escrita para mostrarla. */
  regla: string;
}

export const REGLA_SEMAFORO =
  "Se mira solo a los requisitos obligatorios evaluables (si la oferta no los distingue, se tratan todos como obligatorios, que es lo más prudente). Ninguno «no identificado» ni «parcial» → «Postula». Alguno «parcial» y ninguno «no identificado» → «Postula ajustando» (se puede reforzar la evidencia en el CV). Al menos uno «no identificado» → «Postula si cumples…» esos requisitos. El porcentaje no interviene.";

/** Semáforo de decisión, con una regla explícita basada en los obligatorios. No es una recomendación de contratación. */
export function decidir(requisitos: Requisito[]): Decision | null {
  const conocidos = requisitos.filter((r) => r.tipo !== null && valorDeEstado(r.estado) !== null);
  if (conocidos.length === 0) return null;
  const obligatorios = conocidos.some((r) => r.tipo === "OBLIGATORIO") ? conocidos.filter((r) => r.tipo === "OBLIGATORIO") : conocidos.filter((r) => r.tipo === "NO ESPECIFICADO");
  if (obligatorios.length === 0) return null;
  const sin = obligatorios.filter((r) => r.estado === "NO IDENTIFICADO");
  const parciales = obligatorios.filter((r) => r.estado === "PARCIAL");
  if (sin.length > 0) {
    const mitad = sin.length * 2 >= obligatorios.length;
    return {
      nivel: "si-cumples",
      titulo: "Postula si cumples…",
      explicacion: `${sin.length === 1 ? "Un requisito obligatorio no aparece" : `${sin.length} requisitos obligatorios no aparecen`} en tu CV. Postula solo si de verdad ${sin.length === 1 ? "lo tienes y puedes" : "los tienes y puedes"} demostrar${sin.length === 1 ? "lo" : "los"}, y escríbe${sin.length === 1 ? "lo" : "los"} en tu CV.${mitad ? " Son la mitad o más de los obligatorios: antes de postular, valora si te conviene." : ""} Si no lo${sin.length === 1 ? "" : "s"} tienes, evalúa si ${sin.length === 1 ? "es bloqueante o salvable" : "son bloqueantes o salvables"} (ver la guía).`,
      claves: sin,
      regla: REGLA_SEMAFORO,
    };
  }
  if (parciales.length > 0) {
    return { nivel: "ajustando", titulo: "Postula ajustando", explicacion: `Ningún obligatorio falta del todo, pero ${parciales.length === 1 ? "uno está" : `${parciales.length} están`} solo a medias. Refuerza la evidencia en tu CV (sin inventar) y prepara cómo explicarlo en la entrevista.`, claves: parciales, regla: REGLA_SEMAFORO };
  }
  return { nivel: "postula", titulo: "Postula", explicacion: "Todos los requisitos obligatorios evaluables aparecen con evidencia en tu CV. Aun así, revisa que cada evidencia sea verdadera y que puedas contarla.", claves: [], regla: REGLA_SEMAFORO };
}

export const formatoDecimal = (n: number) => dos(n);
