"use client";

import { useEffect, useState } from "react";
import { useConsent } from "@/hooks/use-consent";
import { useAdVisibility } from "@/hooks/use-ad-visibility";
import { adsenseClient } from "@/lib/ads-config";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export interface AdSlotProps {
  /** ID del bloque de anuncios de AdSense (data-ad-slot). Sin él, en producción no se dibuja nada. */
  slot?: string;
  /** `data-ad-format` (por ejemplo «fluid» o «auto»). */
  format?: string;
  /** `data-ad-layout` (por ejemplo «in-article»), requerido por el formato fluid. */
  layout?: string;
  /** Alto reservado antes de cargar el anuncio: evita saltos de diseño (CLS). */
  minHeight?: number;
  className?: string;
}

const EN_PRODUCCION = process.env.NODE_ENV === "production";

/**
 * Bloque de anuncio de AdSense, siempre subordinado al contenido:
 *  - Reserva alto mínimo (sin saltos de diseño) y lleva la etiqueta discreta «Publicidad».
 *  - En desarrollo NO carga nada: muestra un recuadro gris de marcador de posición.
 *  - En producción solo se dibuja con ID de editor, ID de bloque y consentimiento de anuncios (Consent Mode v2); carga
 *    perezosa al acercarse a la pantalla.
 *  - Si un bloqueador de anuncios (o un fallo de red) impide cargarlo, el bloque se pliega y no rompe la página.
 * No usar junto a botones de la herramienta ni en páginas legales, de error o vacías.
 */
export function AdSlot({ slot, format = "auto", layout, minHeight = 250, className }: AdSlotProps) {
  const { ads } = useConsent();
  const { ref, isVisible } = useAdVisibility<HTMLDivElement>();
  const [plegado, setPlegado] = useState(false);
  const activo = EN_PRODUCCION && Boolean(adsenseClient) && Boolean(slot) && ads === "granted" && isVisible;

  useEffect(() => {
    if (!activo) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Un bloqueador puede hacer fallar el script: la página sigue funcionando.
    }
    // Si pasados unos segundos el bloque no se llenó (bloqueador, red o sin anuncio disponible), se pliega.
    const t = setTimeout(() => {
      const estado = ref.current?.querySelector("ins.adsbygoogle")?.getAttribute("data-ad-status");
      const cargado = (window.adsbygoogle as { loaded?: boolean } | undefined)?.loaded === true;
      if (!cargado || estado === "unfilled") setPlegado(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [activo, ref]);

  if (!EN_PRODUCCION) {
    return (
      <aside aria-label="Espacio reservado para publicidad (solo en desarrollo)" className={cn("my-8 flex items-center justify-center rounded-lg border border-dashed bg-surface text-xs text-muted-foreground", className)} style={{ minHeight }}>
        Publicidad · espacio reservado (solo se ve en desarrollo)
      </aside>
    );
  }
  if (!adsenseClient || !slot || plegado) return null;

  return (
    <aside ref={ref} aria-label="Publicidad" className={cn("my-8 w-full", className)}>
      <p className="mb-1 text-center text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Publicidad</p>
      <div className="flex w-full items-center justify-center overflow-hidden" style={{ minHeight }}>
        {activo && (
          <ins
            className="adsbygoogle block w-full"
            style={{ display: "block", textAlign: "center" }}
            data-ad-client={adsenseClient}
            data-ad-slot={slot}
            data-ad-format={format}
            data-ad-layout={layout}
            data-full-width-responsive="true"
          />
        )}
      </div>
    </aside>
  );
}
