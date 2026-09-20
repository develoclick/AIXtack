import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

/** ¿Existe en public/ el archivo al que apunta esta ruta pública? (solo servidor) */
export function mediaExists(src: string): boolean {
  if (!src.startsWith("/") || src.includes("..")) return false;
  return fs.existsSync(path.join(PUBLIC_DIR, src));
}

const pngSizes = new Map<string, { width: number; height: number } | null>();

/**
 * Ancho y alto reales de un PNG de public/ (solo servidor). Lee los 24 primeros bytes del archivo:
 * así las ilustraciones pueden tener cualquier proporción sin declararla a mano. `null` si no es un PNG legible.
 */
export function pngSize(src: string): { width: number; height: number } | null {
  if (pngSizes.has(src)) return pngSizes.get(src) ?? null;
  let size: { width: number; height: number } | null = null;
  if (src.startsWith("/") && !src.includes("..") && src.endsWith(".png")) {
    try {
      const fd = fs.openSync(path.join(PUBLIC_DIR, src), "r");
      const head = Buffer.alloc(24);
      fs.readSync(fd, head, 0, 24, 0);
      fs.closeSync(fd);
      if (head.toString("ascii", 1, 4) === "PNG") size = { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
    } catch {
      size = null;
    }
  }
  // Sin caché en desarrollo: si se reemplaza la imagen, el tamaño nuevo se lee al recargar.
  if (process.env.NODE_ENV === "production") pngSizes.set(src, size);
  return size;
}

/** Archivos presentes en la carpeta de imágenes de una guía. */
export function listGuideImageFiles(category: string, slug: string): string[] {
  const dir = path.join(PUBLIC_DIR, "images", "guias", category, slug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => !file.startsWith("."));
}

/** Marcadores de imágenes que faltan: en desarrollo o en una previsualización con NEXT_PUBLIC_SHOW_IMAGE_SLOTS=true. */
export const showImageMarkers = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_IMAGE_SLOTS === "true";
