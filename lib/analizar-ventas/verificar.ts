import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { textoDeFuenteAnalisisVentas } from "./prompt";
import type { ResumenAnalisis } from "./calculo";
import type { LecturaAnalisisVentas } from "./lector";
import type { DatosAnalisisVentas, FichaDataset } from "./tipos";

export interface RevisionAnalisisVentas {
  cifras: CifrasNuevas;
  avisos: string[];
}

/**
 * Revisión automática: cifras que no vienen ni de la ficha del dataset ni de las métricas que calculó la página.
 * «Preguntas siguientes» queda fuera del detector: son preguntas, no afirmaciones con cifras.
 */
export function revisarAnalisisVentas(l: LecturaAnalisisVentas, d: DatosAnalisisVentas, ficha: FichaDataset, resumen: ResumenAnalisis): RevisionAnalisisVentas {
  const textoAnalizado = (["calidad", "metricas", "evolucion", "variaciones", "concentracion", "hallazgos", "hipotesis"] as const).map((k) => l.secciones[k] ?? "").join("\n");
  const cifras = cifrasNuevas(textoAnalizado, textoDeFuenteAnalisisVentas(d, ficha, resumen));

  const avisos: string[] = [];
  if (cifras.montos.length) avisos.push(`La respuesta menciona ${cifras.montos.length} monto(s) que no están en la ficha ni en las métricas calculadas: ${cifras.montos.slice(0, 3).join(", ")}${cifras.montos.length > 3 ? "…" : ""}. Podría ser una cifra inventada: verifícala.`);
  if (cifras.porcentajes.length) avisos.push(`Menciona ${cifras.porcentajes.length} porcentaje(s) que no están en la ficha ni en las métricas: ${cifras.porcentajes.slice(0, 3).join(", ")}${cifras.porcentajes.length > 3 ? "…" : ""}.`);
  if (l.conteoHipotesis === 0) avisos.push("Ninguna causa está marcada como «[HIPÓTESIS]»: revisa que la IA haya separado los hechos calculados de sus explicaciones posibles.");
  if (resumen.comparacion && !resumen.comparacion.comparable) avisos.push(`Los 2 períodos comparados no tienen la misma cantidad de días (${resumen.comparacion.diasA ?? "?"} vs ${resumen.comparacion.diasB ?? "?"}): la variación no es del todo justa. Revisa que la respuesta lo haya advertido.`);

  return { cifras, avisos };
}
