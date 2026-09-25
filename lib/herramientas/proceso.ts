/**
 * Lógica pura de la plantilla de proceso (sin React), para poder probarla: qué opciones de un paso se ven y en qué orden,
 * qué ítems del kit final se ven y qué líneas lleva «Qué corregí yo».
 */
import { cumple, type ContextoPlantilla } from "./plantillas";
import type { EjemploReal, ItemKit, OpcionPaso, PasoProceso } from "./tipos";

/**
 * Las opciones de un paso que se ven con los datos actuales (`mostrarSi`), con primero las que cumplen `primeraSi`
 * (por ejemplo, la herramienta que la persona eligió). Entre iguales se conserva el orden del archivo de datos.
 */
export function opcionesDelPaso(paso: Pick<PasoProceso, "opciones">, ctx: ContextoPlantilla): OpcionPaso[] {
  const primera = (o: OpcionPaso) => Number(Boolean(o.primeraSi) && cumple(o.primeraSi, ctx));
  return (paso.opciones ?? []).filter((o) => cumple(o.mostrarSi, ctx)).sort((a, b) => primera(b) - primera(a));
}

/** Los ítems del kit final que se ven con los datos actuales (`mostrarSi`). */
export function itemsVisiblesDelKit(items: readonly ItemKit[], ctx: ContextoPlantilla): ItemKit[] {
  return items.filter((i) => cumple(i.mostrarSi, ctx));
}

/**
 * Las líneas de «Qué corregí yo»: las que escribió el autor y, solo si ya existe la captura de una prueba real, la nota que dejó
 * preparada (`notaPreparada`) como primera línea.
 */
export function lineasQueCorregi(ejemplo: Pick<EjemploReal, "queCorregi" | "notaPreparada">, hayPruebaReal: boolean): string[] {
  return [...(hayPruebaReal && ejemplo.notaPreparada ? [ejemplo.notaPreparada] : []), ...ejemplo.queCorregi];
}
