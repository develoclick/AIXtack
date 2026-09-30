import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { textoDeFuentePlanNegocio } from "./prompt";
import type { DatosPlanNegocio } from "./tipos";
import type { LecturaPlanNegocio } from "./lector";

export interface RevisionPlanNegocio {
  cifras: CifrasNuevas;
  avisos: string[];
}

/** Revisión automática de la respuesta: cifras que no vienen ni de tus datos ni de los cálculos de la página, y falta de etiquetado. */
export function revisarPlanNegocio(l: LecturaPlanNegocio, d: DatosPlanNegocio): RevisionPlanNegocio {
  const textoCompleto = Object.values(l.secciones).join("\n");
  const cifras = cifrasNuevas(textoCompleto, textoDeFuentePlanNegocio(d));

  const avisos: string[] = [];
  if (cifras.montos.length) avisos.push(`La respuesta menciona ${cifras.montos.length} monto(s) que no están en tus datos ni en los cálculos de la página: ${cifras.montos.slice(0, 3).join(", ")}${cifras.montos.length > 3 ? "…" : ""}. Podría ser una cifra inventada: verifícala.`);
  if (cifras.porcentajes.length) avisos.push(`Menciona ${cifras.porcentajes.length} porcentaje(s) que no están en tus datos: ${cifras.porcentajes.slice(0, 3).join(", ")}${cifras.porcentajes.length > 3 ? "…" : ""}.`);
  if (l.conteoEtiquetas.supuesto > 8) avisos.push(`El plan trae ${l.conteoEtiquetas.supuesto} supuestos: revísalos todos antes de presentarlo, sobre todo si vas a pedir un préstamo o buscar un socio.`);
  if (l.conteoEtiquetas.dato === 0) avisos.push("Ninguna cifra está etiquetada como «[DATO DEL USUARIO]»: revisa que la IA haya usado tus propios números, no solo estimaciones.");

  return { cifras, avisos };
}
