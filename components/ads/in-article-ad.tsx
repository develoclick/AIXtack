import { AdSlot } from "@/components/ads/ad-slot";
import { cn } from "@/lib/utils";

/**
 * Anuncio nativo insertado en medio de un artículo/ficha de contenido.
 * Usa el formato `fluid` + `layout="in-article"` que exige AdSense para que
 * el anuncio herede la tipografía del contenido en vez de verse como un
 * bloque publicitario ajeno. Colocar solo entre secciones, nunca partiendo
 * un párrafo o lista.
 */
export function InArticleAd({ slotId, className }: { slotId: string; className?: string }) {
  return (
    <AdSlot
      slotId={slotId}
      format="fluid"
      layout="in-article"
      minHeight={280}
      className={cn("my-2", className)}
    />
  );
}
