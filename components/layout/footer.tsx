import Link from "next/link";
import { footerNav } from "@/lib/nav-config";
import { EDITORIAL, getAuthor } from "@/content/autores";
import { contactEmail, siteName, siteTagline } from "@/lib/site";
import { AuroraRibbon } from "@/components/visual/aurora-ribbon";

/** Pie de página: franja de tinta con el nombre del sitio en grande, columnas de navegación y línea legal. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark relative isolate overflow-hidden bg-ink text-foreground">
      <AuroraRibbon soft className="-bottom-40 left-[-10%] -z-10 h-[26rem] w-[120%]" />
      <div aria-hidden className="bg-lines-dark absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              {siteName}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-foreground/70">
              {siteTagline}: herramientas para resolver con inteligencia artificial las tareas reales de tu negocio.
            </p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand">{group.title}</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link-draw text-sm text-foreground/70 transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p aria-hidden className="numeral-soft mt-14 select-none overflow-hidden whitespace-nowrap text-[clamp(3rem,13vw,10.5rem)] tracking-[-0.05em]">
          {siteName}
        </p>

        <div className="mt-6 border-t border-white/10 pt-6 text-xs text-foreground/60">
          <p>
            © {year} {siteName}, publicado por {getAuthor(EDITORIAL)!.name}. Todos los derechos reservados. Contacto:{" "}
            <a href={`mailto:${contactEmail}`} className="underline underline-offset-2 hover:text-foreground">
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
