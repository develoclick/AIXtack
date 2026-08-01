import { AdSlot } from "@/components/ads/ad-slot";
import { cn } from "@/lib/utils";

/**
 * Banner horizontal al final del contenido, antes del footer del sitio. Se
 * monta una sola vez en el layout de (site) — no requiere tocar cada página.
 */
export function FooterAd({ slotId, className }: { slotId: string; className?: string }) {
  return (
    <div className="border-t bg-muted/20 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AdSlot slotId={slotId} format="horizontal" minHeight={100} className={cn(className)} />
      </div>
    </div>
  );
}
