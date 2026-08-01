"use client";

import Script from "next/script";
import { useConsent } from "@/hooks/use-consent";

const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * Carga el script global de AdSense una sola vez, y solo después de que el
 * usuario haya dado su consentimiento (Google Consent Mode v2). Sin
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID configurado, no se carga nada.
 */
export function AdsenseLoader() {
  const { ads } = useConsent();

  if (!clientId || ads !== "granted") return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
