"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Search } from "lucide-react";

export interface ItemBuscable {
  titulo: string;
  descripcion: string;
  categoria: string;
  ruta: string;
}

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Buscador de prompts: filtra en el navegador la lista que recibe (título y descripción, sin tildes ni mayúsculas). */
export function Buscador({ items, className }: { items: ItemBuscable[]; className?: string }) {
  const [consulta, setConsulta] = useState("");
  const id = useId();
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  const resultados = palabras.length
    ? items.filter((i) => {
        const texto = normalizar(`${i.titulo} ${i.descripcion} ${i.categoria}`);
        return palabras.every((p) => texto.includes(p));
      })
    : [];

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        Buscar prompts
      </label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          type="search"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Buscar prompts: CV, entrevista…"
          autoComplete="off"
          className="campo pl-10"
        />
      </div>
      <div aria-live="polite" className="mt-2">
        {palabras.length > 0 && (
          <div className="rounded-xl border bg-card p-2 shadow-sm">
            {resultados.length ? (
              <ul>
                {resultados.map((r) => (
                  <li key={r.ruta}>
                    <Link href={r.ruta} className="block min-h-11 rounded-lg px-3 py-2 hover:bg-muted">
                      <span className="block text-sm font-semibold">{r.titulo}</span>
                      <span className="block text-xs text-muted-foreground">{r.categoria}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2 text-sm text-muted-foreground">Todavía no hay un prompt para «{consulta.trim()}». Estamos publicando los prompts de uno en uno.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
