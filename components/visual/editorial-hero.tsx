import type { ReactNode } from "react";
import { AuroraRibbon } from "./aurora-ribbon";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

/**
 * Cabecera de las páginas del sitio: franja a sangre con retícula y cinta, texto a un lado y una
 * composición opcional (`aside`) al otro. `quiet` deja solo la retícula, para páginas de texto.
 */
export function EditorialHero({
  eyebrow,
  title,
  description,
  aside,
  children,
  quiet = false,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  /** Contenido extra bajo la descripción (fecha, botones…). */
  children?: ReactNode;
  quiet?: boolean;
  className?: string;
}) {
  return (
    <header className={cn("relative isolate overflow-hidden border-b", className)}>
      <div aria-hidden className="bg-lines absolute inset-x-0 top-0 -z-10 h-full opacity-60" />
      {!quiet && <AuroraRibbon className="-right-[12%] top-[8%] -z-10 hidden h-[22rem] w-[54%] lg:block" />}
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", quiet ? "py-12 lg:py-16" : "py-14 lg:py-20", aside && "lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-12")}>
        <Reveal className="max-w-3xl">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
          <h1 className={cn("mt-4 text-balance", quiet ? "text-display-md" : "text-display")}>{title}</h1>
          {description && <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">{description}</p>}
          {children}
        </Reveal>
        {aside}
      </div>
    </header>
  );
}
