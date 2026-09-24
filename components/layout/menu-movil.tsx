"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { primaryNav } from "@/lib/nav-config";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Panel lateral del menú móvil. Se carga con `next/dynamic` solo cuando alguien pulsa «Abrir menú»
 * (ver navbar.tsx): así el diálogo y su código no pesan en la carga de ninguna página.
 */
export default function MenuMovil({ pathname, open, onOpenChange }: { pathname: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
  );
}
