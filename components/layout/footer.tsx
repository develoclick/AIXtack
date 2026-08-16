import Link from "next/link";
import { Sparkles } from "lucide-react";
import { footerNav } from "@/lib/nav-config";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t bg-muted/20">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid-fade opacity-60" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-foreground to-foreground/70 text-background shadow-soft">
                <Sparkles className="size-4" />
              </span>
              <span className="text-lg">Guía Prompts IA</span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              La plataforma en español para descubrir herramientas de inteligencia artificial,
              prompts, comparativas y las últimas noticias del sector.
            </p>
          </div>

          {footerNav.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {group.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="transition-transform group-hover:translate-x-0.5">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} Guía Prompts IA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
