import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface MigaDePan {
  nombre: string;
  href?: string;
}

/** Ruta de navegación: el último elemento es la página actual (sin enlace). */
export function Breadcrumbs({ items }: { items: MigaDePan[] }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={item.nombre} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="size-4" />}
            {item.href ? (
              <Link href={item.href} className="inline-flex min-h-8 items-center underline-offset-2 hover:text-foreground hover:underline">
                {item.nombre}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-foreground">
                {item.nombre}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
