import type { GuideData, ImageRef, ImageSlot } from "./model";

/** Carpeta pública de imágenes de una guía. */
export function guideImageDir(category: string, slug: string): string {
  return `/images/guias/${category}/${slug}`;
}

/**
 * Crea el ayudante de imágenes de una guía. Las imágenes viven en
 * public/images/guias/<categoria>/<slug>/ con nombres semánticos (hero.webp, paso-01.webp…):
 *
 *   const image = guideImages("marketing", "mi-guia");
 *   image("hero.webp", { alt: "…", aspectRatio: "21/9", priority: true })
 *
 * Si el archivo todavía no existe, la página NO se rompe: en desarrollo muestra un marcador
 * y en producción omite la imagen. Nunca se generan imágenes falsas.
 */
export function guideImages(category: string, slug: string) {
  const dir = guideImageDir(category, slug);
  return (file: string, options: Omit<ImageRef, "src">): ImageRef => ({ src: `${dir}/${file}`, ...options });
}

/**
 * Crea el ayudante del MANIFIESTO de imágenes (`data.images`): un slot por imagen prevista, con
 * su sección, su propósito, su proporción y su alt. La persona que publica solo tiene que soltar
 * el archivo con ese nombre en la carpeta de la guía:
 *
 *   const slot = guideSlots("ventas", "mi-guia");
 *   images: { hero: slot("hero.webp", { section: "hero", ratio: "16/9", purpose: "…", alt: "…" }) }
 */
export function guideSlots(category: string, slug: string) {
  const dir = guideImageDir(category, slug);
  return (file: string, options: Omit<ImageSlot, "file" | "src">): ImageSlot => ({ file, src: `${dir}/${file}`, ...options });
}

/** Un slot del manifiesto como imagen renderizable (con su propósito para el marcador de desarrollo). */
export function slotToImage(slot: ImageSlot): ImageRef {
  // Las pruebas reales del autor (prueba-prompt-0N) y los slots con `real: true` son capturas; el resto son esquemas.
  const illustration = !slot.real && !slot.promptId && !slot.file.startsWith("prueba-prompt-");
  return {
    src: slot.src,
    alt: slot.alt,
    caption: slot.caption,
    aspectRatio: slot.ratio,
    // Un esquema no tiene detalle que ampliar: la lupa prometería algo que no hay.
    zoom: illustration ? false : slot.zoom,
    purpose: slot.description ?? slot.purpose,
    illustration,
  };
}

/** Imagen de cabecera de una guía: el slot `hero` del manifiesto o, en guías anteriores, `hero.image`. */
export function heroImageOf(data: Pick<GuideData, "images" | "hero">): ImageRef | undefined {
  return data.images?.hero ? slotToImage(data.images.hero) : data.hero.image;
}
