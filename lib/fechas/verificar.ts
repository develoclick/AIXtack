import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { combinacionesFaltantes, filasAjenas } from "./analisis";
import { generarCombinaciones } from "./calculo";
import type { LecturaFechas } from "./lector";
import { textoDeFuenteFechas } from "./prompt";
import type { Combinacion, DatosFechas, FilaPrecio } from "./tipos";

/** Texto de las filas que la IA sí consultó: son datos legítimos, no cifras inventadas, aunque no vinieran de la persona. */
function textoDeFilas(filas: FilaPrecio[]): string {
  return filas.map((f) => `${f.ida} ${f.vuelta} ${f.precioTotal ?? ""} ${f.precioPorPersona ?? ""} ${f.moneda} ${f.aerolinea} ${f.escalas}`).join("\n");
}

export interface RevisionFechas {
  avisos: string[];
  ajenas: FilaPrecio[];
  faltantes: Combinacion[];
  cifras: CifrasNuevas;
  sinAcceso: boolean;
  sinVerificar: number;
}

/** Verificaciones automáticas del paso 3 («Qué revisar antes de usarlo»). Señalan lo que hay que mirar; no demuestran nada. */
export function revisarFechas(l: LecturaFechas, d: DatosFechas): RevisionFechas {
  const generadas = generarCombinaciones(d);
  const ajenas = filasAjenas(l.filas, generadas);
  const faltantes = combinacionesFaltantes(generadas, l.filas);
  const cuerpo = [l.patrones, l.costos, l.antes, l.verificar, l.siguiente].flat().join("\n");
  const cifras = cifrasNuevas(cuerpo, [textoDeFuenteFechas(d), textoDeFilas(l.filas)].join("\n"));
  const sinVerificar = l.filas.filter((f) => !f.verificada).length;
  const sinAcceso = l.accesoTiempoReal === "no";

  const avisos: string[] = [];
  if (l.accesoTiempoReal === null) avisos.push("La respuesta no declaró si tiene acceso a datos en tiempo real: trata cualquier precio con cautela.");
  else if (sinAcceso) avisos.push("La IA declaró que NO tiene acceso a datos en tiempo real: cualquier precio de la tabla no viene de una búsqueda real. No lo uses para decidir.");
  if (l.filas.length === 0 && generadas.length > 0) avisos.push("La respuesta no trae ninguna combinación con precio.");
  if (ajenas.length) avisos.push(`${ajenas.length} fila(s) tienen fechas que no generó la página: podrían ser inventadas. No las uses.`);
  if (sinVerificar > 0) avisos.push(`${sinVerificar} fila(s) no traen fuente o fecha de consulta: se muestran como «no verificadas», no las uses para decidir.`);
  if (faltantes.length > 0 && l.filas.length > 0) avisos.push(`Quedan ${faltantes.length} combinación(es) generadas sin precio todavía.`);
  if (cifras.montos.length) avisos.push(`El texto de la respuesta menciona montos que no están en ninguna fila consultada: ${cifras.montos.join(", ")}. No los uses como precio real.`);
  if (cifras.porcentajes.length) avisos.push(`Menciona porcentajes que no están en tus datos: ${cifras.porcentajes.join(", ")}.`);
  if (l.verificar.length) avisos.push(`La IA pide verificar ${l.verificar.length} dato(s): revisa la pestaña «Por verificar».`);

  return { avisos, ajenas, faltantes, cifras, sinAcceso, sinVerificar };
}
