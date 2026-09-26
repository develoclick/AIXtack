import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";

import { ThemeProvider } from "@/providers/theme-provider";
import { ConsentProvider } from "@/providers/consent-provider";
import { AdsenseLoader } from "@/components/ads/adsense-loader";
import { AnalyticsLoader } from "@/components/analytics/analytics-loader";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { siteName, siteTagline, siteUrl } from "@/lib/site";

// Metropolis (paquete @fontsource/metropolis, licencia Unlicense): se sirve desde nuestro dominio, sin pedir nada a Google.
// Solo 3 pesos (400, 600 y 700) con font-display: swap: el 500 se ve con el 400 y el 650/800 con el 700 (el navegador toma el más cercano).
const metropolis = localFont({
  variable: "--font-metropolis",
  display: "swap",
  src: [
    { path: "../node_modules/@fontsource/metropolis/files/metropolis-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/metropolis/files/metropolis-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../node_modules/@fontsource/metropolis/files/metropolis-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — ${siteTagline}`,
    template: `%s · ${siteName}`,
  },
  description: "Biblioteca gratuita de prompts en español para ChatGPT, Gemini y Claude: llena tus datos, copia el prompt listo y úsalo.",
  applicationName: siteName,
  verification: {
    google: "B3ClaGnGqP20qsHVIDjZGAi4T6DsIOG1BmrL1Kv9NUQ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${metropolis.variable} h-full antialiased`}>
      <head>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>

      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConsentProvider>
            {children}

            <AdsenseLoader />
            <AnalyticsLoader />
          </ConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
