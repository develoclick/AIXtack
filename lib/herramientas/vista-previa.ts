/**
 * Vista previa de revisión. Con MOSTRAR_BORRADORES=true en el entorno del build, los LISTADOS (biblioteca, áreas, portada)
 * también enseñan los borradores, y el bloque 6 de cada página muestra un recuadro gris por cada captura pendiente.
 * Sigue sin afectar a lo demás: los borradores mantienen noindex, no entran en el sitemap ni en «relacionadas» de una
 * página publicada, y no cambia ninguna redirección. Se quita borrando la variable y redesplegando.
 */
export const vistaPreviaDeBorradores = process.env.MOSTRAR_BORRADORES === "true";

/** Los recuadros de «captura pendiente» solo existen en desarrollo o en la vista previa; en producción no se renderiza nada. */
export const mostrarCapturasPendientes = process.env.NODE_ENV !== "production" || vistaPreviaDeBorradores;

/** Las capturas pendientes que se dibujan: todas si la vista previa está activa, ninguna en producción. */
export function pendientesVisibles<T>(pendientes: T[], mostrar: boolean = mostrarCapturasPendientes): T[] {
  return mostrar ? pendientes : [];
}
