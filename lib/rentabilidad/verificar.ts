import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { textoDeFuenteRentabilidad } from "./prompt";
import type { DatosRentabilidad } from "./tipos";
import type { LecturaRentabilidad } from "./lector";

export interface RevisionRentabilidad {
  cifras: CifrasNuevas;
  avisos: string[];
}

/**
 * Revisión automática de la respuesta: cifras que no vienen ni de tus datos ni de los cálculos de la página.
 * «Acciones a probar» y los 2 cierres quedan fuera: ahí la IA puede proponer cifras nuevas a modo de sugerencia
 * (por ejemplo, «sube el precio en S/ 1»), que no son cifras inventadas del análisis sino recomendaciones.
 */
export function revisarRentabilidad(l: LecturaRentabilidad, d: DatosRentabilidad): RevisionRentabilidad {
  const textoAnalizado = (["resumen", "rentabilidad", "sensibilidad", "omisiones"] as const).map((k) => l.secciones[k] ?? "").join("\n");
  const cifras = cifrasNuevas(textoAnalizado, textoDeFuenteRentabilidad(d));

  const avisos: string[] = [];
  if (cifras.montos.length) avisos.push(`La respuesta menciona ${cifras.montos.length} monto(s) que no están en tus datos ni en los cálculos de la página: ${cifras.montos.slice(0, 3).join(", ")}${cifras.montos.length > 3 ? "…" : ""}. Podría ser una cifra inventada: verifícala.`);
  if (cifras.porcentajes.length) avisos.push(`Menciona ${cifras.porcentajes.length} porcentaje(s) que no están en tus datos ni en los cálculos: ${cifras.porcentajes.slice(0, 3).join(", ")}${cifras.porcentajes.length > 3 ? "…" : ""}.`);
  if (l.conteoHipotesis === 0) avisos.push("Ninguna afirmación está marcada como «[HIPÓTESIS]»: revisa que la IA haya separado lo calculado de lo que supone sobre el comportamiento de tus clientes.");

  return { cifras, avisos };
}
