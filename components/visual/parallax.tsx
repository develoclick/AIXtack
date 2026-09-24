import type { CSSProperties, ReactNode } from "react";

/**
 * Desplazamiento vertical ligado al scroll para elementos DECORATIVOS, solo con CSS (`animation-timeline: view()`):
 * es un componente de servidor y no lleva JavaScript al navegador. Solo usa `transform`; se activa desde el ancho `md`,
 * con movimiento permitido y en navegadores que admiten la función (en el resto la imagen queda quieta).
 */
export function Parallax({ children, speed = 0.1, className }: { children: ReactNode; speed?: number; className?: string }) {
  // Recorrido total aproximado: lo que antes sumaba el desplazamiento en JavaScript (speed × distancia al centro).
  const recorrido = `${Math.round(speed * 500)}px`;
  return (
    <div className={["parallax", className].filter(Boolean).join(" ")} style={{ "--parallax": recorrido } as CSSProperties}>
      {children}
    </div>
  );
}
