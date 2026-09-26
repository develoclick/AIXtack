"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavLink } from "@/lib/nav-config";

/** Menú de la cabecera en pantallas pequeñas: se cierra con Esc, al elegir un enlace o al tocar fuera. */
export function MenuMovil({ links }: { links: NavLink[] }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    const alTocar = (e: PointerEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("keydown", alTeclear);
    document.addEventListener("pointerdown", alTocar);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("pointerdown", alTocar);
    };
  }, [abierto]);

  return (
    <div ref={caja} className="lg:hidden">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        aria-label={abierto ? "Cerrar el menú" : "Abrir el menú"}
        className="flex size-11 items-center justify-center rounded-lg hover:bg-muted"
      >
        {abierto ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {abierto && (
        <nav id="menu-movil" aria-label="Menú" className="absolute inset-x-0 top-16 border-b bg-background px-4 pb-4 pt-2 shadow-lg">
          <ul className="mx-auto flex max-w-7xl flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setAbierto(false)} className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium hover:bg-muted">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
