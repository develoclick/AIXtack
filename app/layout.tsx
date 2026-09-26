import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";

import { ThemeProvider } from "@/providers/theme-provider";
import { ConsentProvider } from "@/providers/consent-provider";
import { AdsenseLoader } from "@/components/ads/adsense-loader";
import { AnalyticsLoader } from "@/components/analytics/analytics-loader";
import { ConsentMode } from "@/components/consent/consent-mode";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { siteName, siteTagline, siteUrl } from "@/lib/site";

// Inter variable (paquete @fontsource-variable/inter, licencia OFL): se sirve desde nuestro dominio, sin pedir nada a Google.
// Un solo archivo (latin, ~48 KB) cubre todos los pesos, con font-display: swap.
const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [{ path: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
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
    <html lang="es" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        <ConsentMode />
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
