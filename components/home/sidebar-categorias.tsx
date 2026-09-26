import Link from "next/link";
import { IconoDeCategoria } from "@/components/layout/icono-categoria";
import { Buscador, type ItemBuscable } from "@/components/home/buscador";
import { categorias } from "@/content/categorias";

/** Columna izquierda de la portada y de las categorías: buscador y lista de categorías (las que aún no abren, sin enlace). */
export function SidebarCategorias({ items, actual }: { items: ItemBuscable[]; actual?: string }) {
  return (
    <aside aria-label="Buscar y explorar categorías" className="lg:sticky lg:top-20 lg:self-start">
      <Buscador items={items} />
      <nav aria-label="Categorías" className="mt-5">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Categorías</h2>
        <ul className="mt-2 flex flex-col gap-0.5">
          {categorias.map((c) => (
            <li key={c.slug}>
              {c.disponible ? (
                <Link
                  href={`/${c.slug}`}
                  aria-current={actual === c.slug ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors hover:bg-muted ${actual === c.slug ? "bg-brand-muted text-foreground" : ""}`}
                >
                  <IconoDeCategoria icono={c.icono} className="size-4 shrink-0 text-brand" />
                  {c.nombre}
                </Link>
              ) : (
                <span className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground">
                  <IconoDeCategoria icono={c.icono} className="size-4 shrink-0 opacity-60" />
                  <span className="flex-1">{c.nombre}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide">Pronto</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
