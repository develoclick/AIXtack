"use client";

import Script from "next/script";
import { useConsent } from "@/hooks/use-consent";

import { adsenseClient as clientId } from "@/lib/ads-config";

/**
 * Carga el script global de AdSense una sola vez, y solo después de que el
 * usuario haya dado su consentimiento (Google Consent Mode v2). Sin
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID configurado, no se carga nada.
 */
export function AdsenseLoader() {
  const { ads } = useConsent();

  // Solo en producción, con ID de editor y consentimiento; el script se carga una sola vez y de forma asíncrona.
  if (process.env.NODE_ENV !== "production" || !clientId || ads !== "granted") return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
