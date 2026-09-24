"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { primaryNav } from "@/lib/nav-config";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Barra superior: vidrio fino que gana borde al desplazarse. El indicador de página activa es un
 * subrayado simple; el menú móvil es el mismo panel lateral de antes.
 */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const mobileOpen = openPath === pathname;
  const setMobileOpen = (open: boolean) => setOpenPath(open ? pathname : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300",
        scrolled ? "border-b border-border/60 bg-background/85 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]" : "border-b border-transparent bg-background/60"
      )}
    >
      <div className={cn("mx-auto flex w-full max-w-[90rem] items-center px-5 transition-[height] duration-300 sm:px-8 lg:px-10", scrolled ? "h-[60px]" : "h-[72px]")}>
        <Link href="/" aria-label={`${siteName} — Inicio`} className="group flex shrink-0 items-center">
          <Image
            src="/images/site/logo-claro.png"
            alt={siteName}
            width={180}
            height={50}
            priority
            className="h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03] dark:hidden"
          />
          <Image
            src="/images/site/logo-oscuro.png"
            alt={siteName}
            width={180}
            height={50}
            priority
            className="hidden h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03] dark:block"
          />
        </Link>

        <nav aria-label="Principal" className="ml-auto hidden h-full items-center xl:flex">
          <ul className="flex h-full items-center">
            {primaryNav.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href} className="h-full">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-full items-center px-4 text-[13px] font-medium transition-colors duration-200",
                      active ? "text-brand" : "text-foreground/75 hover:text-foreground"
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-4 bottom-0 h-[2px] origin-left rounded-full bg-brand transition-transform duration-300",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-hover:bg-foreground/30"
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:ml-6">
          <ThemeToggle />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Abrir menú"
              className="group flex size-11 items-center justify-center rounded-full border border-border/60 bg-background/70 transition-all duration-300 hover:bg-muted xl:hidden"
            >
              <Menu className="size-[19px]" strokeWidth={2} />
            </SheetTrigger>

            <SheetContent side="right" className="dark w-[88vw] max-w-[390px] border-l border-white/10 bg-ink p-0 text-foreground">
              <SheetHeader className="border-b border-white/10 px-6 py-6">
                <SheetTitle className="text-left">
                  <Link href="/" className="flex flex-col">
                    <span className="text-[17px] font-bold tracking-tight">{siteName}</span>
                    <span className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">IA práctica</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col px-4 py-6">
                <p className="mb-3 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Explorar</p>
                <nav aria-label="Principal móvil">
                  <ul className="flex flex-col">
                    {primaryNav.map((link, index) => {
                      const active = isActive(pathname, link.href);
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            aria-current={active ? "page" : undefined}
                            className="group flex items-center justify-between gap-4 border-b border-white/10 px-3 py-4 transition-colors hover:bg-white/5"
                          >
                            <span className="flex items-baseline gap-4">
                              <span className={cn("font-mono text-[11px] tabular-nums", active ? "text-brand" : "text-muted-foreground")}>{String(index + 1).padStart(2, "0")}</span>
                              <span className={cn("text-xl font-semibold tracking-tight", active && "text-brand")}>{link.label}</span>
                            </span>
                            <ArrowUpRight
                              className={cn("size-4 transition-all duration-300", active ? "text-brand opacity-100" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70")}
                              aria-hidden
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 animate-pulse rounded-full bg-brand" aria-hidden />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contenido actualizado</span>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">Herramientas y guías cortas prácticas para trabajar mejor con inteligencia artificial.</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
