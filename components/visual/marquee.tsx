import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Fila de textos en desplazamiento continuo (CSS). La primera copia es la lista real (accesible);
 * la segunda está oculta a lectores de pantalla. Con menos movimiento se muestra como lista
 * normal que envuelve. Pausa al pasar el cursor.
 */
export function Marquee({
  items,
  label,
  reverse = false,
  duration = 60,
  itemClassName,
  className,
}: {
  items: string[];
  label: string;
  reverse?: boolean;
  duration?: number;
  itemClassName?: string;
  className?: string;
}) {
  const li = (item: string, suffix = "") => (
    <li key={`${item}${suffix}`} className={cn("whitespace-nowrap", itemClassName)}>
      {item}
    </li>
  );
  return (
    <div className={cn("marquee mask-fade-x", reverse && "marquee-reverse", className)} style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
      <div className="marquee-track">
        <ul aria-label={label} className="marquee-group">
          {items.map((item) => li(item))}
        </ul>
        <ul aria-hidden className="marquee-group marquee-dup">
          {items.map((item) => li(item, "-copia"))}
        </ul>
      </div>
    </div>
  );
}
