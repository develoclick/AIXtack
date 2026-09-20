import type { ImageSlot } from "@/lib/guides/model";
import { slotToImage } from "@/lib/guides/images";
import { ImageBlock } from "./image-block";

/**
 * Imagen de una guía declarada en el manifiesto `data.images`. Se renderiza SOLO si el archivo
 * existe en public/: en producción, sin archivo no hay hueco ni marcador; en desarrollo aparece
 * un marcador con el nombre del archivo, la proporción y lo que debe mostrar.
 */
export function GuideImage({ slot }: { slot?: ImageSlot }) {
  if (!slot) return null;
  return <ImageBlock image={slotToImage(slot)} className="mt-8" />;
}
