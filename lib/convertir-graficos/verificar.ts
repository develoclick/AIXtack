import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { pastelExcedeCategorias } from "./asistente";
import { agregarPorCategoria } from "./motor";
import { textoDeFuenteConvertirGraficos } from "./prompt";
import type { LecturaConvertirGraficos } from "./lector";
import type { DatosConvertirGraficos, FichaDataset, FilaTabla } from "./tipos";

export interface RevisionConvertirGraficos {
  cifras: CifrasNuevas;
  /** Título o pregunta de cada gráfico de pastel cuya columna X tiene, en los datos reales, más de 5 categorías. */
  pastelesConDemasiadasCategorias: string[];
  avisos: string[];
}

/**
 * Revisión automática: cifras que no vienen ni de la ficha del dataset ni de las columnas y la agregación propuestas, y
 * gráficos de pastel con más categorías de las recomendadas, calculado con los datos reales (nunca con lo que afirme la IA).
 */
export function revisarConvertirGraficos(l: LecturaConvertirGraficos, d: DatosConvertirGraficos, ficha: FichaDataset, filas: FilaTabla[]): RevisionConvertirGraficos {
  const textoAnalizado = (["hallazgos", "transformaciones", "guia"] as const).map((k) => l.secciones[k] ?? "").join("\n");
  const cifras = cifrasNuevas(textoAnalizado, textoDeFuenteConvertirGraficos(d, ficha));

  const pastelesConDemasiadasCategorias: string[] = [];
  for (const g of l.graficos) {
    if (g.tipo !== "pastel") continue;
    const serie = agregarPorCategoria(filas, g.x, g.y, g.agregacion, null);
    if (pastelExcedeCategorias(serie.etiquetas.length)) pastelesConDemasiadasCategorias.push(g.titulo || g.pregunta || g.x);
  }

  const avisos: string[] = [];
  if (cifras.montos.length) avisos.push(`La respuesta menciona ${cifras.montos.length} monto(s) que no están en la ficha del archivo: ${cifras.montos.slice(0, 3).join(", ")}${cifras.montos.length > 3 ? "…" : ""}. Podría ser una cifra inventada: verifícala.`);
  if (cifras.porcentajes.length) avisos.push(`Menciona ${cifras.porcentajes.length} porcentaje(s) que no están en la ficha: ${cifras.porcentajes.slice(0, 3).join(", ")}${cifras.porcentajes.length > 3 ? "…" : ""}.`);
  if (pastelesConDemasiadasCategorias.length) avisos.push(`${pastelesConDemasiadasCategorias.length} gráfico(s) de pastel tienen más de 5 categorías en los datos reales: esta página los dibuja igual, pero considera usar barras para que se lean mejor.`);

  return { cifras, pastelesConDemasiadasCategorias, avisos };
}
