import { Parallax } from "./parallax";
import { SiteImage } from "./site-image";
import { cn } from "@/lib/utils";

/**
 * Ilustración (PNG transparente) que sobresale del contenedor y se mueve con un paralaje suave.
 * Es decorativa: `aria-hidden` y sin espacio propio, así que si el archivo no existe el contenedor
 * queda completo. `hideOnMobile` la oculta bajo `md`.
 */
export function FloatingIllustration({
  file,
  width,
  height,
  className,
  imageClassName,
  speed,
  hideOnMobile = true,
  sizes = "(min-width: 1280px) 32rem, 50vw",
  purpose,
}: {
  file: string;
  width: number;
  height: number;
  /** Posicionamiento del contenedor (absolute, offsets, tamaño…). */
  className?: string;
  imageClassName?: string;
  speed?: number;
  hideOnMobile?: boolean;
  /** Atributo `sizes` de la imagen: el ancho al que se muestra, para que el navegador pida el archivo justo. */
  sizes?: string;
  purpose?: string;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none select-none", hideOnMobile && "hidden md:block", className)}>
      <Parallax speed={speed}>
        <SiteImage file={file} alt="" width={width} height={height} sizes={sizes} className={cn("h-auto w-full", imageClassName)} purpose={purpose} />
      </Parallax>
    </div>
  );
}
