import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { AspectRatio, ImageRef } from "@/lib/guides/model";
import { mediaExists } from "@/lib/guides/media";
import { cn } from "@/lib/utils";
import { ZoomableImage } from "./zoomable-image";

const ASPECT_CLASS: Record<AspectRatio, string> = {
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
  "3/4": "aspect-[3/4]",
};

// Marcadores de imágenes que faltan: en desarrollo o en una previsualización con NEXT_PUBLIC_SHOW_IMAGE_SLOTS=true.
const isDev = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_IMAGE_SLOTS === "true";
const DEFAULT_SIZES = "(min-width: 1024px) 54rem, 100vw";

export interface ImageBlockProps {
  image: ImageRef;
  className?: string;
  sizes?: string;
  /** «lazy» por defecto; la imagen hero usa `priority` en los datos. */
  loading?: "lazy" | "eager";
  /** Sin figure/figcaption (para incrustar dentro de otro bloque). */
  bare?: boolean;
}

/**
 * Imagen de una guía. Si el archivo NO existe en public/, la página no se rompe:
 * en desarrollo aparece un marcador que dice qué archivo falta; en producción no se
 * renderiza nada. Nunca se generan imágenes falsas.
 */
export function ImageBlock({ image, className, sizes: sizesProp, loading = "lazy", bare = false }: ImageBlockProps) {
  const sizes = sizesProp ?? (image.illustration && !image.priority ? "(min-width: 768px) 42rem, 100vw" : DEFAULT_SIZES);
  const ratio = image.aspectRatio ?? "16/9";
  const frame = cn("relative w-full overflow-hidden rounded-2xl border bg-muted", ASPECT_CLASS[ratio]);
  // Un esquema no es una captura: el texto alternativo lo dice para quien usa lector de pantalla.
  const alt = image.illustration ? `Esquema ilustrativo. ${image.alt}` : image.alt;

  if (!mediaExists(image.src)) {
    if (!isDev) return null;
    return (
      <figure className={cn("not-prose", className)} data-missing-image={image.src}>
        <div className={cn(frame, "flex flex-col items-center justify-center gap-2 border-dashed p-6 text-center")}>
          <ImageIcon className="size-6 text-muted-foreground" aria-hidden />
          <p className="font-mono text-xs text-muted-foreground">
            <span className="text-foreground">{image.src.split("/").pop()}</span> · {ratio.replace("/", ":")} · espacio de imagen sin archivo (no se publica)
          </p>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">{image.purpose ?? image.alt}</p>
        </div>
      </figure>
    );
  }

  const picture = image.zoom ? (
    <ZoomableImage
      src={image.src}
      alt={alt}
      caption={image.caption}
      ratio={ASPECT_CLASS[ratio]}
      sizes={sizes}
      loading={loading}
      priority={image.priority}
    />
  ) : (
    <div className={frame}>
      <Image
        src={image.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={image.priority}
        loading={image.priority ? undefined : loading}
        className={cn("object-cover", image.illustration && "dark:brightness-[0.88]")}
      />
    </div>
  );

  if (bare) return <div className={className}>{picture}</div>;

  return (
    <figure className={cn("not-prose", image.illustration && !image.priority && "max-w-2xl", className)}>
      {picture}
      {(image.caption || image.credit || image.illustration) && (
        <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm leading-snug text-muted-foreground">
          {image.credit && <span className="ml-1 opacity-80">· {image.credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
