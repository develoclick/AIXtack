"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as PointerReact } from "react";
import Image from "next/image";
import { Minus, Plus, RotateCcw, X, ZoomIn } from "lucide-react";

interface ZoomableImageProps {
  /** Ruta pública del archivo original: la página usa una versión optimizada y el visor carga ESTA solo al abrirse. */
  src: string;
  alt: string;
  /** Etiqueta honesta de la imagen («Prueba real», «Simulación»…): se ve en el visor. */
  etiqueta: string;
  /** Texto de la leyenda: se ve en el visor. */
  leyenda: string;
  /** Tamaño real del archivo (evita saltos de diseño). */
  ancho: number;
  alto: number;
  sizes: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

const ESCALA_MAXIMA = 5;
const PASO = 1.5;
const ZOOM_DOBLE = 2.5;
const tope = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Imagen de la página que se amplía al hacer clic: visor a pantalla completa sobre fondo oscuro, con la etiqueta y la leyenda
 * visibles. Zoom con los botones + y − (o las teclas + − 0), doble clic o doble toque, rueda del ratón y pellizco; se mueve
 * arrastrando. Se cierra con Esc, con la X (44 px) o tocando fuera; el foco queda atrapado dentro (`<dialog>` modal) y al cerrar
 * vuelve a la imagen. La imagen grande se carga solo al abrir.
 */
export function ZoomableImage({ src, alt, etiqueta, leyenda, ancho, alto, sizes, loading = "lazy", priority }: ZoomableImageProps) {
  const [abierta, setAbierta] = useState(false);
  const disparador = useRef<HTMLButtonElement>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const imagen = useRef<HTMLImageElement>(null);
  const cierre = useRef<HTMLButtonElement>(null);

  const [escala, setEscala] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  // Referencias con el estado vivo para los gestos (evitan cierres con valores viejos).
  const vivo = useRef({ escala: 1, x: 0, y: 0 });
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const gesto = useRef({ distancia: 0, arrastre: false, movido: false, ultimoToque: 0, ultimoX: 0, ultimoY: 0 });

  const aplicar = useCallback((e: number, x: number, y: number) => {
    // La imagen no puede salirse del visor: el desplazamiento máximo es lo que sobra del tamaño ampliado.
    const zona = area.current?.getBoundingClientRect();
    const ancho0 = imagen.current?.offsetWidth ?? 0;
    const alto0 = imagen.current?.offsetHeight ?? 0;
    const maxX = zona ? Math.max(0, (ancho0 * e - zona.width) / 2) : 0;
    const maxY = zona ? Math.max(0, (alto0 * e - zona.height) / 2) : 0;
    const nuevo = { escala: e, x: e <= 1 ? 0 : tope(x, -maxX, maxX), y: e <= 1 ? 0 : tope(y, -maxY, maxY) };
    vivo.current = nuevo;
    setEscala(nuevo.escala);
    setPos({ x: nuevo.x, y: nuevo.y });
  }, []);

  /** Cambia la escala manteniendo quieto el punto (px, py), relativo al centro del visor. */
  const zoomEn = useCallback(
    (nueva: number, px = 0, py = 0) => {
      const { escala: e, x, y } = vivo.current;
      const s = tope(nueva, 1, ESCALA_MAXIMA);
      const f = s / e;
      aplicar(s, px - (px - x) * f, py - (py - y) * f);
    },
    [aplicar]
  );

  const cerrar = useCallback(() => {
    dialogo.current?.close();
  }, []);

  // Abrir: diálogo modal (foco atrapado, Esc, resto de la página inerte) y sin desplazamiento de la página de atrás.
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierta && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
      cierre.current?.focus();
    }
    if (!abierta && d.open) d.close();
  }, [abierta]);

  // Cerrado por cualquier vía (Esc, X, tocar fuera): se restablece el zoom y el foco vuelve a la imagen.
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    const alCerrar = () => {
      document.documentElement.style.overflow = "";
      punteros.current.clear();
      vivo.current = { escala: 1, x: 0, y: 0 };
      setEscala(1);
      setPos({ x: 0, y: 0 });
      setAbierta(false);
      disparador.current?.focus();
    };
    d.addEventListener("close", alCerrar);
    return () => {
      d.removeEventListener("close", alCerrar);
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Rueda del ratón: zoom hacia el puntero (listener no pasivo para poder evitar el desplazamiento de la página).
  useEffect(() => {
    const a = area.current;
    if (!a || !abierta) return;
    const alRodar = (e: WheelEvent) => {
      e.preventDefault();
      const r = a.getBoundingClientRect();
      zoomEn(vivo.current.escala * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    };
    a.addEventListener("wheel", alRodar, { passive: false });
    return () => a.removeEventListener("wheel", alRodar);
  }, [abierta, zoomEn]);

  const alPresionar = (e: PointerReact<HTMLDivElement>) => {
    area.current?.setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesto.current.movido = false;
    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      gesto.current.distancia = Math.hypot(a.x - b.x, a.y - b.y);
    }
    gesto.current.arrastre = punteros.current.size === 1 && vivo.current.escala > 1;
  };

  const alMover = (e: PointerReact<HTMLDivElement>) => {
    const previo = punteros.current.get(e.pointerId);
    if (!previo) return;
    const actual = { x: e.clientX, y: e.clientY };
    punteros.current.set(e.pointerId, actual);
    if (Math.hypot(actual.x - previo.x, actual.y - previo.y) > 0) gesto.current.movido = true;
    if (punteros.current.size === 2) {
      // Pellizco: la escala sigue a la distancia entre los dos dedos, alrededor del punto medio.
      const [a, b] = [...punteros.current.values()];
      const distancia = Math.hypot(a.x - b.x, a.y - b.y);
      if (gesto.current.distancia > 0) {
        const r = area.current!.getBoundingClientRect();
        zoomEn((vivo.current.escala * distancia) / gesto.current.distancia, (a.x + b.x) / 2 - (r.left + r.width / 2), (a.y + b.y) / 2 - (r.top + r.height / 2));
      }
      gesto.current.distancia = distancia;
    } else if (gesto.current.arrastre) {
      aplicar(vivo.current.escala, vivo.current.x + (actual.x - previo.x), vivo.current.y + (actual.y - previo.y));
    }
  };

  const alSoltar = (e: PointerReact<HTMLDivElement>) => {
    const inicio = punteros.current.get(e.pointerId);
    punteros.current.delete(e.pointerId);
    gesto.current.distancia = 0;
    gesto.current.arrastre = false;
    if (!inicio || gesto.current.movido || e.type === "pointercancel") return;
    // Doble clic o doble toque: acerca hacia ese punto o vuelve al tamaño inicial.
    const ahora = e.timeStamp;
    const cerca = Math.hypot(e.clientX - gesto.current.ultimoX, e.clientY - gesto.current.ultimoY) < 40;
    if (ahora - gesto.current.ultimoToque < 320 && cerca) {
      gesto.current.ultimoToque = 0;
      const r = area.current!.getBoundingClientRect();
      if (vivo.current.escala > 1) aplicar(1, 0, 0);
      else zoomEn(ZOOM_DOBLE, e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      return;
    }
    gesto.current.ultimoToque = ahora;
    gesto.current.ultimoX = e.clientX;
    gesto.current.ultimoY = e.clientY;
    // Un toque en el fondo (no en la imagen) con el tamaño inicial cierra el visor.
    if (e.target === area.current && vivo.current.escala === 1) window.setTimeout(() => gesto.current.ultimoToque !== 0 && vivo.current.escala === 1 && cerrarSiSigueSolo(), 340);
  };

  // El cierre por toque fuera espera un momento: si llega el segundo toque de un doble toque, no se cierra.
  const cerrarSiSigueSolo = () => {
    if (performance.now() - gesto.current.ultimoToque >= 320 && dialogo.current?.open) cerrar();
  };

  const alTeclear = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Tab") {
      // Foco atrapado: al pasar del último control se vuelve al primero (y al revés con Mayús), sin salir al navegador ni a la página.
      const controles = [...(dialogo.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [])];
      const primero = controles[0];
      const ultimo = controles[controles.length - 1];
      if (controles.length === 0) e.preventDefault();
      else if (e.shiftKey && (document.activeElement === primero || !dialogo.current?.contains(document.activeElement))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dialogo.current?.contains(document.activeElement))) {
        e.preventDefault();
        primero.focus();
      }
      return;
    }
    if (e.key === "+" || e.key === "=") zoomEn(vivo.current.escala * PASO);
    else if (e.key === "-" || e.key === "_") zoomEn(vivo.current.escala / PASO);
    else if (e.key === "0") aplicar(1, 0, 0);
    else if (vivo.current.escala > 1 && e.key.startsWith("Arrow")) {
      const d = 60;
      const { escala: s, x, y } = vivo.current;
      aplicar(s, x + (e.key === "ArrowLeft" ? d : e.key === "ArrowRight" ? -d : 0), y + (e.key === "ArrowUp" ? d : e.key === "ArrowDown" ? -d : 0));
      e.preventDefault();
    }
  };

  const porcentaje = Math.round(escala * 100);

  return (
    <>
      <button
        ref={disparador}
        type="button"
        onClick={() => setAbierta(true)}
        aria-haspopup="dialog"
        aria-label={`Ampliar imagen: ${alt}`}
        className="guide-focus group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border bg-muted"
      >
        <Image src={src} alt="" width={ancho} height={alto} sizes={sizes} priority={priority} loading={priority ? undefined : loading} className="block h-auto w-full" />
        <span aria-hidden className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2 py-1.5 text-xs font-semibold text-foreground shadow-sm">
          <ZoomIn className="size-4" />
          Ampliar
        </span>
      </button>

      <dialog
        ref={dialogo}
        aria-label={`Imagen ampliada: ${etiqueta}`}
        data-visor
        data-zoom={escala.toFixed(2)}
        onKeyDown={alTeclear}
        onClick={(e) => {
          if (e.target === dialogo.current) cerrar();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-neutral-950 p-0 text-white backdrop:bg-neutral-950 open:flex open:flex-col"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 p-3">
          <span className="inline-flex items-center rounded-md border border-white/40 px-2 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.1em]">{etiqueta}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => zoomEn(escala / PASO)} disabled={escala <= 1} aria-label="Alejar" className="guide-visor-boton">
              <Minus className="size-5" aria-hidden />
            </button>
            <span role="status" aria-live="polite" className="min-w-14 text-center text-sm tabular-nums" data-zoom-texto>
              {porcentaje} %
            </span>
            <button type="button" onClick={() => zoomEn(escala * PASO)} disabled={escala >= ESCALA_MAXIMA} aria-label="Acercar" className="guide-visor-boton">
              <Plus className="size-5" aria-hidden />
            </button>
            <button type="button" onClick={() => aplicar(1, 0, 0)} disabled={escala === 1} aria-label="Tamaño inicial" className="guide-visor-boton">
              <RotateCcw className="size-5" aria-hidden />
            </button>
            <button ref={cierre} type="button" onClick={cerrar} aria-label="Cerrar imagen ampliada" className="guide-visor-boton">
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={area}
          data-visor-area
          onPointerDown={alPresionar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          className="relative flex min-h-0 flex-1 touch-none select-none items-center justify-center overflow-hidden"
          style={{ cursor: escala > 1 ? "grab" : "zoom-in" }}
        >
          {abierta && (
            // eslint-disable-next-line @next/next/no-img-element -- visor: el archivo original, que solo se pide al abrir.
            <img
              ref={imagen}
              src={src}
              alt={alt}
              draggable={false}
              data-visor-imagen
              className="max-h-full max-w-full object-contain"
              style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${escala})`, transformOrigin: "center", willChange: "transform" }}
            />
          )}
        </div>

        <div className="max-h-[28dvh] overflow-auto p-3 text-sm leading-snug">
          <p className="font-semibold">{etiqueta}</p>
          {leyenda && <p className="mt-1 text-white/85">{leyenda}</p>}
        </div>
      </dialog>
    </>
  );
}
