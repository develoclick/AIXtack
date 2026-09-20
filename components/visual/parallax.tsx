"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Desplazamiento vertical ligado al scroll para elementos DECORATIVOS. Solo usa `transform`
 * (sin layout), un listener pasivo y rAF; se activa únicamente mientras el elemento está cerca
 * de la pantalla, desde el ancho `md` y con movimiento permitido.
 */
export function Parallax({ children, speed = 0.1, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    let frame = 0;
    let listening = false;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      element.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const start = () => {
      if (listening || reduce.matches || !wide.matches) return;
      listening = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      update();
    };
    const stop = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", onScroll);
    };

    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: "200px 0px" });
    observer.observe(element);
    return () => {
      observer.disconnect();
      stop();
      if (frame) window.cancelAnimationFrame(frame);
      element.style.transform = "";
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
