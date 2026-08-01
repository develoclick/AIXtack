import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { ConsentProvider } from "@/providers/consent-provider";
import { Toaster } from "@/components/ui/sonner";
import { AdsenseLoader } from "@/components/ads/adsense-loader";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "AIXtack";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Inteligencia Artificial en español`,
    template: `%s · ${siteName}`,
  },
  description:
    "La plataforma en español para descubrir herramientas de IA, prompts, tutoriales, comparativas y noticias del sector.",
  applicationName: siteName,
  alternates: {
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${siteName} — Feed RSS` }] },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConsentProvider>
            {children}
            <Toaster richColors position="bottom-right" />
            <AdsenseLoader />
          </ConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
