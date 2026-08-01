"use client";

import { useEffect } from "react";
import { useConsent } from "@/hooks/use-consent";
import { useAdVisibility } from "@/hooks/use-ad-visibility";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export interface AdSlotProps {
  slotId: string;
  className?: string;
  /** Alto reservado antes de cargar el anuncio — evita CLS. */
  minHeight?: number;
  format?: string;
  /** `data-ad-layout`, requerido por los formatos In-article y Multiplex. */
  layout?: string;
  /** Texto accesible sobre el bloque, para transparencia (por defecto "Publicidad"). */
  label?: string | null;
}

const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * Bloque base de anuncio: carga perezosa (IntersectionObserver, solo al
 * entrar en viewport), sujeta a consentimiento (Google Consent Mode v2) y con
 * alto reservado para no producir Cambios de Layout (CLS) cuando el anuncio
 * cargue. No renderiza nada si no hay NEXT_PUBLIC_ADSENSE_CLIENT_ID
 * configurado — así el proyecto queda listo para AdSense sin mostrar
 * anuncios reales todavía. Los componentes con nombre (TopBannerAd,
 * InArticleAd, SidebarAd, FooterAd, MultiplexAd) envuelven este bloque con
 * el formato correcto para cada posición.
 */
export function AdSlot({ slotId, className, minHeight = 250, format = "auto", layout, label = "Publicidad" }: AdSlotProps) {
  const { ads } = useConsent();
  const { ref, isVisible } = useAdVisibility<HTMLDivElement>();
  const shouldRender = Boolean(clientId) && ads === "granted" && isVisible;

  useEffect(() => {
    if (!shouldRender) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("[adsense] no se pudo inicializar el slot", error);
    }
  }, [shouldRender]);

  if (!clientId) return null;

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {label && (
        <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </p>
      )}
      <div
        className="flex w-full items-center justify-center overflow-hidden"
        style={{ minHeight }}
        aria-hidden={!shouldRender}
      >
        {shouldRender && (
          <ins
            className="adsbygoogle block w-full"
            style={{ display: "block", textAlign: "center" }}
            data-ad-client={clientId}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-ad-layout={layout}
            data-full-width-responsive="true"
          />
        )}
      </div>
    </div>
  );
}
