"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useConsent } from "@/hooks/use-consent";

const measurementId = "G-H25PR3Y1LL";

/**
 * Carga Google Analytics solo después de que el usuario haya aceptado las cookies
 * analíticas. Sin consentimiento no se carga el script ni se crean cookies de
 * analítica, tal como se describe en la política de cookies.
 */
export function AnalyticsLoader() {
  const { analytics } = useConsent();

  if (analytics !== "granted") return null;

  return <GoogleAnalytics gaId={measurementId} />;
}
