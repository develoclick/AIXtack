import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li className="flex items-center gap-1.5">
          <Link href="/" className="-my-2 flex items-center py-2 hover:text-foreground" aria-label="Inicio">
            <Home className="size-3.5" />
          </Link>
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex min-w-0 max-w-full items-center gap-1.5">
              {isLast ? (
                <span className="truncate font-medium text-foreground" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="-my-2 truncate py-2 hover:text-foreground">
                    {item.name}
                  </Link>
                  <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
