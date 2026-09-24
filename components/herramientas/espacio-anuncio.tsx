/**
 * Contenedor VACÍO reservado para publicidad. No lleva código de AdSense ni texto: solo marca el lugar.
 * Únicamente lo coloca PaginaHerramienta, después del bloque 6 (ejemplo real) y del bloque 10 (errores
 * comunes). Nunca dentro de la herramienta ni junto a «Copiar prompt» (lo comprueba
 * lib/herramientas/contenido.test.ts).
 *
 * Mientras esté vacío NO ocupa espacio (`empty:hidden` = display:none): sin márgenes ni altura, así que no desplaza nada
 * (CLS = 0). El día que se active un anuncio, quien lo añada decidirá su tamaño reservado.
 */
export function EspacioAnuncio({ posicion }: { posicion: "despues-del-ejemplo" | "despues-de-errores" }) {
  return <div data-espacio-anuncio={posicion} aria-hidden="true" className="not-prose empty:hidden" />;
}
