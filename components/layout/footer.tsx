import Link from "next/link";
import { footerNav } from "@/lib/nav-config";
import { EDITORIAL, getAuthor } from "@/content/autores";
import { siteName, siteTagline } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex min-h-11 items-center text-xl font-semibold tracking-tight">
              {siteName}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-foreground/70">
              {siteTagline}. Todo es gratis, sin registro y sin cuentas.
            </p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-accent">{group.title}</h2>
              <ul className="mt-4 flex flex-col">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="flex min-h-11 items-center text-sm text-ink-foreground/80 transition-colors hover:text-ink-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-ink-foreground/60 sm:flex-row sm:justify-between">
          <p>
            © {year} {siteName}, un proyecto de {getAuthor(EDITORIAL)!.name}.
          </p>
          <p>Los prompts son una ayuda: revisa siempre lo que te devuelve la IA antes de usarlo.</p>
        </div>
      </div>
    </footer>
  );
}
