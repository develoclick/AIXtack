import { AdSlot } from "@/components/ads/ad-slot";
import { cn } from "@/lib/utils";

/**
 * Bloque nativo tipo "más contenido para ti" (formato `autorelaxed`). Ideal
 * al final de un listado o artículo, donde de otro modo iría un bloque de
 * "contenido relacionado" — se integra visualmente en vez de interrumpir.
 */
export function MultiplexAd({ slotId, className }: { slotId: string; className?: string }) {
  return <AdSlot slotId={slotId} format="autorelaxed" minHeight={320} className={cn(className)} />;
}
