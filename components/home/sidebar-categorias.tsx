import Link from "next/link";
import { IconoDeCategoria } from "@/components/layout/icono-categoria";
import { Buscador, type ItemBuscable } from "@/components/home/buscador";
import { categoriasDisponibles } from "@/content/categorias";

/** Columna izquierda de la portada y de las categorías: buscador y lista de categorías (las que aún no abren, sin enlace). */
export function SidebarCategorias({ items, actual }: { items: ItemBuscable[]; actual?: string }) {
  return (
    <aside aria-label="Buscar y explorar categorías" className="lg:sticky lg:top-20 lg:self-start">
      <Buscador items={items} />
      <nav aria-label="Categorías" className="mt-5">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Categorías</h2>
        <ul className="mt-2 flex flex-col gap-0.5">
          {categoriasDisponibles.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/${c.slug}`}
                aria-current={actual === c.slug ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors hover:bg-surface ${actual === c.slug ? "bg-brand-muted text-foreground" : ""}`}
              >
                <IconoDeCategoria icono={c.icono} className="size-4 shrink-0 text-brand" />
                {c.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">Abrimos las categorías de una en una, cuando su primera herramienta está completa.</p>
    </aside>
  );
}
