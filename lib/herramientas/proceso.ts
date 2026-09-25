/**
 * Lógica pura de la plantilla de proceso (sin React), para poder probarla: qué opciones de un paso se ven y en qué orden,
 * qué ítems del kit final se ven y qué líneas lleva «Qué corregí yo».
 */
import { cumple, renderPlantilla, type ContextoPlantilla } from "./plantillas";
import type { Correccion, EjemploReal, ItemKit, OpcionPaso, PasoProceso, SalidaFalla } from "./tipos";

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

/** Las líneas de «Qué corregí yo»: las que escribió el autor (la nota de cada imagen sale bajo la propia imagen). */
export function lineasQueCorregi(ejemplo: Pick<EjemploReal, "queCorregi">): string[] {
  return [...ejemplo.queCorregi];
}

/** Una salida de «Si algo falla» normalizada: su texto y las correcciones que se copian (vacío si no lleva ninguna). */
export function normalizarSalida(salida: SalidaFalla): { texto: string; correcciones: Correccion[] } {
  return typeof salida === "string" ? { texto: salida, correcciones: [] } : salida;
}

/** Las correcciones de una salida que se ven con los datos actuales (`mostrarSi`), ya rellenas con el formulario. */
export function correccionesVisibles(salida: SalidaFalla, ctx: ContextoPlantilla): { etiqueta: string; texto: string; destino?: string }[] {
  return normalizarSalida(salida)
    .correcciones.filter((c) => cumple(c.mostrarSi, ctx))
    .map((c) => ({ etiqueta: c.etiqueta, texto: renderPlantilla(c.prompt, ctx), destino: c.destino }));
}

/** «X de N listos» del kit final: N son los ítems que se ven con los datos actuales; X, los marcados entre ellos. */
export function resumenKit(items: readonly ItemKit[], ctx: ContextoPlantilla, marcados: readonly string[]): { visibles: ItemKit[]; hechos: number; total: number } {
  const visibles = itemsVisiblesDelKit(items, ctx);
  return { visibles, hechos: visibles.filter((i) => marcados.includes(i.id)).length, total: visibles.length };
}

export interface ItemDeRevision {
  campo: string;
  etiqueta: string;
  /** Lo que escribiste en el formulario (tal cual), o "" si ese dato está vacío. */
  valor: string;
  tieneDato: boolean;
  /** Comprobado = marcaste la casilla mirando ESTE valor; si cambias el dato, la casilla se desmarca sola. */
  comprobado: boolean;
}

/**
 * La lista de revisión del paso 4: un ítem por dato del formulario, con el valor exacto. `marcados` guarda, por dato, el valor que
 * la persona comprobó. «X de N comprobados»: N cuenta solo los datos que tienen texto (uno vacío no se puede comprobar).
 */
export function itemsDeRevision(
  comprobar: readonly { etiqueta: string; campo: string }[],
  valores: Readonly<Record<string, string | undefined>>,
  marcados: Readonly<Record<string, string>>
): { items: ItemDeRevision[]; comprobados: number; total: number } {
  const items = comprobar.map(({ etiqueta, campo }) => {
    const valor = (valores[campo] ?? "").trim();
    return { campo, etiqueta, valor, tieneDato: valor !== "", comprobado: valor !== "" && marcados[campo] === valor };
  });
  const conDato = items.filter((i) => i.tieneDato);
  return { items, comprobados: conDato.filter((i) => i.comprobado).length, total: conDato.length };
}
