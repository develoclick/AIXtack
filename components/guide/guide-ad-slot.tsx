import { AdSlot } from "@/components/ads/ad-slot";
import { guideAds, type GuideAdPosition } from "@/lib/guides/config";

/**
 * Posición publicitaria neutra dentro de una guía. Con `guideAds.enabled = false` (estado
 * actual) NO renderiza nada y no ocupa espacio. Activar publicidad es un cambio de
 * configuración (lib/guides/config.ts), no de diseño.
 */
export function GuideAdSlot({ position }: { position: GuideAdPosition }) {
  if (!guideAds.enabled) return null;
  const slotId = guideAds.slots[position];
  if (!slotId) return null;
  return (
    <div className="not-prose my-10">
      <AdSlot slotId={slotId} />
    </div>
  );
}
