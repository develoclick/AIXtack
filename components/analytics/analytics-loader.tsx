"use client";

import dynamic from "next/dynamic";
import { useConsent } from "@/hooks/use-consent";

// La librería de Google Analytics se descarga solo si la persona aceptó las cookies analíticas.
const GoogleAnalytics = dynamic(() => import("@next/third-parties/google").then((m) => m.GoogleAnalytics));

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
