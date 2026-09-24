"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { primaryNav } from "@/lib/nav-config";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

// El panel del menú móvil (diálogo + enlaces) se descarga al pasar el puntero, enfocar o pulsar el botón, no al cargar la página.
const cargarMenu = () => import("@/components/layout/menu-movil");
const MenuMovil = dynamic(cargarMenu, { ssr: false });
const precargarMenu = () => void cargarMenu();

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
  const [menuPedido, setMenuPedido] = useState(false);
  const mobileOpen = openPath === pathname;
  const setMobileOpen = (open: boolean) => {
    if (open) setMenuPedido(true);
    setOpenPath(open ? pathname : null);
  };

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

          <button
            type="button"
            aria-label="Abrir menú"
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            onPointerEnter={precargarMenu}
            onFocus={precargarMenu}
            className="group flex size-11 items-center justify-center rounded-full border border-border/60 bg-background/70 transition-all duration-300 hover:bg-muted xl:hidden"
          >
            <Menu className="size-[19px]" strokeWidth={2} />
          </button>
          {menuPedido && <MenuMovil pathname={pathname} open={mobileOpen} onOpenChange={setMobileOpen} />}
        </div>
      </div>
    </header>
  );
}
