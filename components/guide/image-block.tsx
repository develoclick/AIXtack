import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { AspectRatio, ImageRef } from "@/lib/guides/model";
import { mediaExists, showGuideImageSlots } from "@/lib/guides/media";
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
 * Imagen de una guía. Si el archivo NO existe en public/, la página no se rompe: aparece un
 * marcador con el nombre del archivo, la proporción y la descripción de lo que va ahí (también en
 * producción; se oculta con NEXT_PUBLIC_HIDE_IMAGE_SLOTS=true). Al soltar el archivo con ese nombre en
 * la carpeta de la guía, la imagen reemplaza al marcador sin tocar código. Nunca se generan imágenes falsas.
 */
export function ImageBlock({ image, className, sizes = DEFAULT_SIZES, loading = "lazy", bare = false }: ImageBlockProps) {
  const ratio = image.aspectRatio ?? "16/9";
  const frame = cn("relative w-full overflow-hidden rounded-2xl border bg-muted", ASPECT_CLASS[ratio]);

  if (!mediaExists(image.src)) {
    if (!showGuideImageSlots) return null;
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
      alt={image.alt}
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
        alt={image.alt}
        fill
        sizes={sizes}
        priority={image.priority}
        loading={image.priority ? undefined : loading}
        className="object-cover"
      />
    </div>
  );

  if (bare) return <div className={className}>{picture}</div>;

  return (
    <figure className={cn("not-prose", className)}>
      {picture}
      {(image.caption || image.credit) && (
        <figcaption className="mt-2.5 text-sm leading-snug text-muted-foreground">
          {image.caption}
          {image.credit && <span className="ml-1 opacity-80">· {image.credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
