/**
 * Vista previa de revisión. Con MOSTRAR_BORRADORES=true en el entorno del build, los LISTADOS (biblioteca, áreas, portada)
 * también enseñan los borradores. Sigue sin afectar a lo demás: los borradores mantienen noindex, no entran en el sitemap ni en
 * «relacionadas» de una página publicada, y no cambia ninguna redirección. Se quita borrando la variable y redesplegando.
 */
export const vistaPreviaDeBorradores = process.env.MOSTRAR_BORRADORES === "true";

/** `next dev` (NODE_ENV=development). */
export const enDesarrollo = process.env.NODE_ENV === "development";

/**
 * ¿Se dibujan los recuadros de «imagen pendiente»? Solo en `next dev` o con MOSTRAR_BORRADORES=true, y siempre solo en una página
 * con `publicado: false`: una página publicada nunca enseña un recuadro vacío. (Los tests pasan el interruptor explícito.)
 */
export function mostrarEspaciosVacios(publicado: boolean, vistaPrevia: boolean = enDesarrollo || vistaPreviaDeBorradores): boolean {
  return !publicado && vistaPrevia;
}

export type EstadoDeEspacio =
  | { estado: "imagen" }
  | { estado: "recuadro" }
  | { estado: "nada" }
  /** Página publicada a la que le falta una imagen obligatoria: el build falla con este mensaje. */
  | { estado: "error"; mensaje: string };

/**
 * Qué se dibuja para un espacio de imagen:
 *  - existe el archivo → la imagen;
 *  - falta, borrador y vista previa activa → recuadro punteado; borrador sin vista previa → nada;
 *  - falta y la página está publicada: obligatoria → error de build; opcional → nada.
 */
export function estadoDeEspacio(p: { existe: boolean; publicado: boolean; obligatoria: boolean; vistaPrevia?: boolean; ruta?: string }): EstadoDeEspacio {
  if (p.existe) return { estado: "imagen" };
  if (p.publicado) {
    return p.obligatoria
      ? { estado: "error", mensaje: `Falta la imagen obligatoria ${p.ruta ?? ""} de una página publicada: guárdala con ese nombre (.webp, .png o .jpg) o pon la página en publicado:false.`.replace("  ", " ") }
      : { estado: "nada" };
  }
  return mostrarEspaciosVacios(p.publicado, p.vistaPrevia) ? { estado: "recuadro" } : { estado: "nada" };
}
