import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { textoDeFuenteComparar } from "./prompt";
import type { DatosComparar } from "./tipos";
import type { LecturaComparar } from "./lector";

export interface RevisionComparar {
  cifras: CifrasNuevas;
  /** Nombres de opciones del usuario que no aparecen en ningún lado de la respuesta (posible opción que la IA se saltó). */
  opcionesSinMencionar: string[];
  /** La tabla no trae ninguna celda marcada «[VALORACIÓN]»: no se puede separar dato de opinión en ella. */
  sinValoracionMarcada: boolean;
  avisos: string[];
}

/** Revisión automática de la respuesta: cifras que no vienen de los datos ni de los cálculos de la página, y opciones olvidadas. */
export function revisarComparar(l: LecturaComparar, d: DatosComparar): RevisionComparar {
  const textoCompleto = Object.values(l.secciones).join("\n").toLowerCase();
  const cifras = cifrasNuevas(textoCompleto, textoDeFuenteComparar(d));
  const opcionesSinMencionar = d.opciones.filter((o) => o.nombre.trim() && !textoCompleto.includes(o.nombre.trim().toLowerCase())).map((o) => o.nombre.trim());
  const sinValoracionMarcada = l.tabla.filas.length > 0 && !l.tabla.filas.some((f) => f.conValoracion);

  const avisos: string[] = [];
  if (cifras.montos.length) avisos.push(`La respuesta menciona ${cifras.montos.length} monto(s) que no están en tus opciones ni en los cálculos de la página: ${cifras.montos.slice(0, 3).join(", ")}${cifras.montos.length > 3 ? "…" : ""}. Podría ser una cifra inventada: verifícala.`);
  if (opcionesSinMencionar.length) avisos.push(`No encuentro «${opcionesSinMencionar.join("», «")}» en la respuesta: revisa que la IA haya comparado todas tus opciones.`);
  if (sinValoracionMarcada) avisos.push("La tabla no marca ninguna celda como «[VALORACIÓN]»: pídele a la IA que distinga sus opiniones de los datos que le diste.");

  return { cifras, opcionesSinMencionar, sinValoracionMarcada, avisos };
}
