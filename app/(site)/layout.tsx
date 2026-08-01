import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ConsentBanner } from "@/components/consent/consent-banner";
import { FooterAd } from "@/components/ads/footer-ad";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
      >
        Saltar al contenido principal
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <FooterAd slotId="1000000001" />
      <Footer />
      <ConsentBanner />
    </div>
  );
}
