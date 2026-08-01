import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter((entry): entry is [string, string] => Boolean(entry[1]))
    );
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginación">
      <PaginationLink href={hrefFor(page - 1)} disabled={prevDisabled} aria-label="Página anterior">
        <ChevronLeft className="size-4" />
      </PaginationLink>

      <span className="px-3 text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>

      <PaginationLink href={hrefFor(page + 1)} disabled={nextDisabled} aria-label="Página siguiente">
        <ChevronRight className="size-4" />
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
  ...props
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const className = cn(
    "flex size-9 items-center justify-center rounded-full border text-sm transition-colors",
    disabled ? "pointer-events-none opacity-40" : "hover:bg-accent"
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
