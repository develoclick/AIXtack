"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Aparición al entrar en pantalla (opacidad + 14 px). Sin JavaScript, o con «menos movimiento»,
 * el contenido se ve siempre: el CSS solo lo oculta cuando el componente ya está listo y el
 * movimiento está permitido. Lo que ya está en pantalla al cargar aparece sin transición.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Retraso en ms para escalonar hermanos. */
  delay?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<{ ready: boolean; visible: boolean; instant: boolean }>({ ready: false, visible: false, instant: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (inView) {
      setState({ ready: true, visible: true, instant: true });
      return;
    }
    setState({ ready: true, visible: false, instant: false });
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState((current) => ({ ...current, visible: true }));
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      data-ready={state.ready ? "true" : undefined}
      data-in={state.visible ? "true" : undefined}
      data-instant={state.instant ? "true" : undefined}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
