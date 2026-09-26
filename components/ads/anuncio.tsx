import { AdSlot } from "@/components/ads/ad-slot";
import { SLOTS, type PosicionAnuncio } from "@/lib/ads-config";

/**
 * Anuncio dentro de una guía o artículo, en una de las tres posiciones permitidas: después de la introducción, a mitad del
 * texto o antes de las preguntas frecuentes. Máximo un anuncio cada ~500 palabras y siempre entre secciones (nunca partiendo
 * un párrafo, una tabla o una lista), lejos de los botones y de los campos de la herramienta.
 */
export function Anuncio({ posicion }: { posicion: PosicionAnuncio }) {
  return <AdSlot slot={SLOTS[posicion]} format={posicion === "final" ? "auto" : "fluid"} layout={posicion === "final" ? undefined : "in-article"} minHeight={posicion === "final" ? 280 : 250} />;
}
