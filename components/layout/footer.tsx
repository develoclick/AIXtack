import Link from "next/link";
import { Rss, Sparkles } from "lucide-react";
import { footerNav } from "@/lib/nav-config";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons/social-icons";

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
              <span className="text-lg">AIXtack</span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              La plataforma en español para descubrir herramientas de inteligencia artificial,
              prompts, comparativas y las últimas noticias del sector.
            </p>
            <div className="mt-7 rounded-2xl border bg-card/60 p-4 shadow-soft">
              <p className="mb-2.5 text-sm font-medium">Únete a la newsletter</p>
              <NewsletterForm source="footer" compact />
            </div>
            <div className="mt-6 flex gap-2 text-muted-foreground">
              <Link
                href="#"
                aria-label="X (Twitter)"
                className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-brand/40 hover:text-brand"
              >
                <XIcon className="size-4" />
              </Link>
              <Link
                href="#"
                aria-label="GitHub"
                className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-brand/40 hover:text-brand"
              >
                <GitHubIcon className="size-4" />
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-brand/40 hover:text-brand"
              >
                <LinkedInIcon className="size-4" />
              </Link>
              <Link
                href="/feed.xml"
                aria-label="Feed RSS"
                className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-brand/40 hover:text-brand"
              >
                <Rss className="size-4" />
              </Link>
            </div>
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
          <p>© {year} AIXtack. Todos los derechos reservados.</p>
          <p>Hecho con Next.js, en español.</p>
        </div>
      </div>
    </footer>
  );
}
