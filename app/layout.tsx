import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

import { ThemeProvider } from "@/providers/theme-provider";
import { ConsentProvider } from "@/providers/consent-provider";
import { Toaster } from "@/components/ui/sonner";
import { AdsenseLoader } from "@/components/ads/adsense-loader";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { GoogleAnalytics } from "@next/third-parties/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://guiapromptsia.com";

const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Guía Prompts IA";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Inteligencia Artificial en español`,
    template: `%s · ${siteName}`,
  },
  description:
    "La plataforma en español para descubrir herramientas de IA, prompts, tutoriales, comparativas y noticias del sector.",
  applicationName: siteName,
  verification: {
    google: "B3ClaGnGqP20qsHVIDjZGAi4T6DsIOG1BmrL1Kv9NUQ",
  },
  alternates: {
    types: {
      "application/rss+xml": [
        {
          url: "/feed.xml",
          title: `${siteName} — Feed RSS`,
        },
      ],
    },
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
    <html
      lang="es"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd()),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConsentProvider>
            {children}

            <Toaster
              richColors
              position="bottom-right"
            />

            <AdsenseLoader />
          </ConsentProvider>
        </ThemeProvider>

        <GoogleAnalytics gaId="G-H25PR3Y1LL" />
      </body>
    </html>
  );
}