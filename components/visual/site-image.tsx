import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { mediaExists, pngSize, showImageMarkers } from "@/lib/guides/media";
import { cn } from "@/lib/utils";

/** Carpeta de las imágenes del sitio (portada, áreas, páginas institucionales). */
export const SITE_IMAGE_DIR = "/images/site";

/**
 * Imagen del sitio declarada por nombre de archivo. Se renderiza SOLO si el archivo existe en
 * `public/images/site/`: en producción, sin archivo no hay hueco ni marcador; en desarrollo (o con
 * NEXT_PUBLIC_SHOW_IMAGE_SLOTS=true) aparece un marcador punteado con el nombre esperado.
 * El contenedor donde se coloca debe verse completo sin la imagen (es un añadido, no un requisito).
 */
export function SiteImage({
  file,
  alt,
  width,
  height,
  sizes,
  priority,
  className,
  purpose,
}: {
  file: string;
  /** Texto alternativo; cadena vacía si la imagen es solo decorativa. */
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Lo que debe mostrar, solo para el marcador de desarrollo. */
  purpose?: string;
}) {
  const src = `${SITE_IMAGE_DIR}/${file}`;

  if (!mediaExists(src)) {
    if (!showImageMarkers) return null;
    return (
      <div
        data-missing-image={src}
        style={{ aspectRatio: `${width} / ${height}` }}
        className={cn("@container flex flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border border-dashed p-2 text-center", className)}
      >
        <ImageIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <p className="break-all font-mono text-[0.6rem] leading-tight text-muted-foreground @[14rem]:text-[0.68rem]">
          <span className="text-foreground">{file}</span>
          <span className="hidden @[14rem]:inline"> · sin archivo (no se publica)</span>
        </p>
        {purpose && <p className="hidden max-w-xs text-[0.68rem] leading-snug text-muted-foreground @[18rem]:block">{purpose}</p>}
      </div>
    );
  }

  // El tamaño real del archivo manda: las ilustraciones están recortadas y cada una tiene su proporción.
  const real = pngSize(src);
  return <Image src={src} alt={alt} width={real?.width ?? width} height={real?.height ?? height} sizes={sizes} priority={priority} className={className} />;
}
