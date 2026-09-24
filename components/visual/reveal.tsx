import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Aparición al entrar en pantalla (opacidad + 14 px), hecha solo con CSS (`animation-timeline: view()`), sin JavaScript
 * en el navegador: es un componente de servidor. Donde el navegador no admite esa función, o con «menos movimiento»,
 * el contenido se ve siempre. Lo que ya está en pantalla al cargar aparece completo, sin animación.
 * `delay` se conserva por compatibilidad con las páginas, pero una animación ligada al desplazamiento no admite retraso.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Sin efecto (ver arriba). */
  delay?: number;
  as?: ElementType;
}) {
  return <Tag className={cn("reveal", className)}>{children}</Tag>;
}
