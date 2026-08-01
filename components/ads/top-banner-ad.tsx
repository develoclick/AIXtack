import { AdSlot } from "@/components/ads/ad-slot";
import { cn } from "@/lib/utils";

/**
 * Banner horizontal (leaderboard). Pensado para ir justo debajo de la
 * cabecera de una página de contenido, nunca superpuesto a la navegación.
 * 100px de alto reservado cubre tanto el banner móvil (320x50/100) como el
 * leaderboard de escritorio (728x90) sin generar CLS en ningún breakpoint.
 */
export function TopBannerAd({ slotId, className }: { slotId: string; className?: string }) {
  return <AdSlot slotId={slotId} format="horizontal" minHeight={100} className={cn("mx-auto max-w-4xl", className)} />;
}
