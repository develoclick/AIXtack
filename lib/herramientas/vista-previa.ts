/**
 * Vista previa de revisión. Con MOSTRAR_BORRADORES=true en el entorno del build, los LISTADOS (biblioteca, áreas, portada)
 * también enseñan los borradores (los recuadros de capturas pendientes NO: solo existen con `next dev`).
 * Sigue sin afectar a lo demás: los borradores mantienen noindex, no entran en el sitemap ni en «relacionadas» de una
 * página publicada, y no cambia ninguna redirección. Se quita borrando la variable y redesplegando.
 */
export const vistaPreviaDeBorradores = process.env.MOSTRAR_BORRADORES === "true";

/**
 * Los recuadros de «captura pendiente» existen SOLO con `next dev` (NODE_ENV=development). Un build de producción nunca
 * los renderiza, ni siquiera con MOSTRAR_BORRADORES=true: esa variable solo enseña los borradores en los listados.
 * (Con NODE_ENV=test los tests los comprueban con el interruptor explícito de `pendientesVisibles`.)
 */
export const mostrarCapturasPendientes = process.env.NODE_ENV === "development";

/** Las capturas pendientes que se dibujan: todas si la vista previa está activa, ninguna en producción. */
export function pendientesVisibles<T>(pendientes: T[], mostrar: boolean = mostrarCapturasPendientes): T[] {
  return mostrar ? pendientes : [];
}
