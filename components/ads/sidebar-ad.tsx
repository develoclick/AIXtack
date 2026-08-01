import { AdSlot } from "@/components/ads/ad-slot";
import { cn } from "@/lib/utils";

/**
 * Rectángulo vertical para columnas laterales (300x250 / 300x600). `sticky`
 * lo mantiene visible al hacer scroll dentro de su columna sin salirse del
 * flujo del documento (no es un overlay ni un anchor ad de AdSense).
 */
export function SidebarAd({ slotId, className }: { slotId: string; className?: string }) {
  return (
    <AdSlot
      slotId={slotId}
      format="rectangle"
      minHeight={250}
      className={cn("sticky top-24", className)}
    />
  );
}
