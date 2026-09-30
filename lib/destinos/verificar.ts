import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { filasResumen } from "./calculo";
import { textoDeFuenteDestinos } from "./prompt";
import type { DatosDestinos, FilaDestino } from "./tipos";
import type { LecturaDestinos } from "./lector";

/** Texto de los destinos que la IA sí consultó: son datos legítimos (recién descubiertos), no cifras inventadas, aunque no vinieran de la persona. */
function textoDeFilas(filas: FilaDestino[]): string {
  return filas.map((f) => `${f.destino} ${f.pasajePorPersona ?? ""} ${f.alojamientoPorNoche ?? ""} ${f.totalDeclarado ?? ""}`).join("\n");
}

export interface RevisionDestinos {
  cifras: CifrasNuevas;
  /** Filas cuyo total declarado por la IA no coincide con el que recalculó la página (más de 1 unidad monetaria de diferencia). */
  totalesQueDifieren: FilaDestino[];
  /** Filas marcadas «real» pero sin fuente o sin fecha de consulta: no se pueden dar por verificadas. */
  realesSinFuente: FilaDestino[];
  avisos: string[];
}

/**
 * Revisión automática de la respuesta: cifras que aparecen en el texto (gastos, recomendaciones, verificar, siguiente) y no
 * vienen ni de los datos de la persona ni de los destinos que la IA sí consultó, y totales que no cuadran con el recálculo.
 */
export function revisarDestinos(l: LecturaDestinos, d: DatosDestinos): RevisionDestinos {
  const cuerpo = [l.gastos, l.recomendaciones, l.verificar, l.siguiente].flat().join("\n");
  const cifras = cifrasNuevas(cuerpo, [textoDeFuenteDestinos(d), textoDeFilas(l.filas)].join("\n"));
  const resumen = filasResumen(l.filas, d);
  const totalesQueDifieren = resumen.filter((r) => r.recalculo.difiereDeLoDeclarado).map((r) => r.fila);
  const realesSinFuente = l.filas.filter((f) => f.tipoDato === "real" && (!f.fuentePasaje.trim() || !f.consultadoEn.trim()));

  const avisos: string[] = [];
  if (cifras.montos.length) avisos.push(`La respuesta menciona ${cifras.montos.length} monto(s) que no están en tus datos ni en el reparto de la página: ${cifras.montos.slice(0, 3).join(", ")}${cifras.montos.length > 3 ? "…" : ""}. Podría ser una cifra inventada: verifícala.`);
  if (totalesQueDifieren.length) avisos.push(`El total que escribió la IA no coincide con el que recalculó la página en ${totalesQueDifieren.length} destino(s): usa siempre el total recalculado.`);
  if (realesSinFuente.length) avisos.push(`${realesSinFuente.length} destino(s) están marcados como «real» pero no traen fuente o fecha de consulta: trátalos como estimación hasta confirmarlos.`);
  return { cifras, totalesQueDifieren, realesSinFuente, avisos };
}
