import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { textoDeFuenteSegmentarClientes } from "./prompt";
import type { LecturaSegmentarClientes } from "./lector";
import type { SegmentoResumen } from "./motor";
import type { DatosSegmentarClientes, FichaDataset } from "./tipos";

export interface RevisionSegmentarClientes {
  cifras: CifrasNuevas;
  avisos: string[];
}

/**
 * Revisión automática: cifras que no vienen de la tabla de segmentos ya calculada. «Acciones a probar» queda fuera a
 * propósito: ahí la IA propone cosas nuevas (un % de descuento, un plazo), que por diseño no están en los datos.
 */
export function revisarSegmentarClientes(l: LecturaSegmentarClientes, d: DatosSegmentarClientes, ficha: FichaDataset, resumen: SegmentoResumen[], totalClientes: number): RevisionSegmentarClientes {
  const textoAnalizado = (["segmentos", "perfiles", "calidad", "datosFaltan"] as const).map((k) => l.secciones[k] ?? "").join("\n");
  const cifras = cifrasNuevas(textoAnalizado, textoDeFuenteSegmentarClientes(d, ficha, resumen, totalClientes));

  const avisos: string[] = [];
  if (cifras.montos.length) avisos.push(`La respuesta menciona ${cifras.montos.length} monto(s) que no están en la tabla de segmentos: ${cifras.montos.slice(0, 3).join(", ")}${cifras.montos.length > 3 ? "…" : ""}. Podría ser una cifra inventada: verifícala.`);
  if (cifras.porcentajes.length) avisos.push(`Menciona ${cifras.porcentajes.length} porcentaje(s) que no están en la tabla: ${cifras.porcentajes.slice(0, 3).join(", ")}${cifras.porcentajes.length > 3 ? "…" : ""}.`);

  return { cifras, avisos };
}
