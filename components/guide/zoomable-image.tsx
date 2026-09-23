"use client";

import { useRef } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";

interface ZoomableImageProps {
  src: string;
  alt: string;
  caption?: string;
  ratio: string;
  sizes: string;
  loading: "lazy" | "eager";
  priority?: boolean;
}

/** Imagen ampliable con <dialog> nativo: Esc cierra, el foco vuelve al botón, sin librerías. */
export function ZoomableImage({ src, alt, caption, ratio, sizes, loading, priority }: ZoomableImageProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
  type="button"
  onClick={() => dialogRef.current?.showModal()}
  aria-label={`Ampliar imagen: ${alt}`}
  className="guide-focus group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border bg-muted"
>
  <Image
    src={src}
    alt={alt}
    width={1200}
    height={800}
    sizes={sizes}
    priority={priority}
    loading={priority ? undefined : loading}
    className="block h-auto w-full"
  />

  <span className="absolute right-2 top-2 rounded-md bg-background/85 p-1.5 text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
    <Maximize2 className="size-4"
      aria-hidden
    />
  </span>
</button>

      <dialog
        ref={dialogRef}
        aria-label={alt}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto max-h-[92vh] max-w-[min(96vw,1200px)] rounded-xl border bg-background p-0 backdrop:bg-black/70"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar imagen ampliada"
            className="guide-focus absolute right-2 top-2 z-10 rounded-md bg-background/90 p-2 text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- vista ampliada: el archivo original a tamaño natural */}
          <img src={src} alt={alt} className="max-h-[86vh] w-auto max-w-full" />
          {caption && <p className="border-t px-4 py-3 text-sm text-muted-foreground">{caption}</p>}
        </div>
      </dialog>
    </>
  );
}
