"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchCommand } from "@/components/search/search-command";
import { primaryNav } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        "px-3 py-3"
      )}
    >
      <div
        className={cn(
          " w-full flex h-16  items-center justify-between",
          "rounded-2xl border",
          "bg-background/75 backdrop-blur-2xl",
          "transition-all duration-500",
          "px-6",
          scrolled
            ? "border-border/70 shadow-[0_10px_40px_rgba(0,0,0,.10)]"
            : "border-border/40 shadow-[0_4px_24px_rgba(0,0,0,.04)]"
        )}
      >
        {/* Logo */}

        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
        >
          

          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight">
              AIXtack
            </span>

            <span className="text-[11px] text-muted-foreground">
              AI Directory
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}

        <nav className="ml-8 hidden flex-1 items-center justify-center gap-2 lg:flex">
          {primaryNav.map((link) => {
            const active = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-xl px-4 py-2 text-[15px] font-medium",
                  "transition-all duration-300",
                  active
                    ? "bg-accent text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {link.label}

                <span
                  className={cn(
                    "absolute left-1/2 -bottom-1 h-1 w-6 -translate-x-1/2 rounded-full bg-primary transition-all duration-300",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Search */}

        <div className="hidden flex-1 justify-end lg:flex lg:max-w-[340px]">
          <SearchCommand />
        </div>

        {/* Right */}

        <div className="ml-4 flex items-center gap-2">
          <ThemeToggle />

          <Link
            href="/herramientas-ia"
            className={buttonVariants({
              size: "sm",
              className:
                "hidden sm:inline-flex rounded-xl px-5 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
            })}
          >
            Explorar
          </Link>

          {/* Mobile */}

          <Sheet
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          >
            <SheetTrigger
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon",
                }),
                "lg:hidden rounded-xl"
              )}
            >
              <Menu className="size-5" />

              <span className="sr-only">
                Abrir menú
              </span>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="
                w-80
                border-l
                bg-background/95
                backdrop-blur-3xl
              "
            >
              <SheetHeader>
                <SheetTitle className="text-lg font-bold">
                  Navegación
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-2">
                {primaryNav.map((link) => {
                  const active = pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-300",
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="my-3 h-px bg-border" />

                <Link
                  href="/faq"
                  className="rounded-xl px-4 py-3 text-[15px] text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground hover:translate-x-1"
                >
                  Preguntas frecuentes
                </Link>

                <Link
                  href="/contacto"
                  className="rounded-xl px-4 py-3 text-[15px] text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground hover:translate-x-1"
                >
                  Contacto
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}