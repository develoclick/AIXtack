/**
 * Detección automática de las imágenes de una página (SOLO en el servidor / al construir): para cada espacio de imagen busca
 * `public/img/{area}/{slug}/{archivo}.webp`, luego `.png` y luego `.jpg`, y lee su ancho y su alto reales. Añadir una imagen es
 * guardar el archivo con su nombre en esa carpeta: no hay que tocar el archivo de datos.
 */
import fs from "node:fs";
import path from "node:path";
import { EXTENSIONES_DE_IMAGEN, leerDimensiones, type ExtensionDeImagen } from "../imagenes/dimensiones";
import type { EspacioImagen, Herramienta } from "./tipos";

export interface ArchivoDeImagen {
  /** Ruta pública, por ejemplo /img/marketing/crear-afiches-con-ia/prueba-01.webp */
  src: string;
  ancho: number;
  alto: number;
  extension: ExtensionDeImagen;
  /** Otras extensiones con el mismo nombre (se usa la primera por orden: .webp, .png, .jpg). El validador lo avisa. */
  duplicadas: ExtensionDeImagen[];
  /** Si el archivo existe pero no se puede leer como imagen. */
  error?: string;
}

export interface ImagenResuelta {
  espacio: EspacioImagen;
  archivo: ArchivoDeImagen | null;
}

/** Carpeta pública de las imágenes de una página. */
export const carpetaDeImagenes = (area: string, slug: string, raiz = process.cwd()) => path.join(raiz, "public", "img", area, slug);

const esArchivo = (ruta: string) => {
  try {
    return fs.statSync(ruta).isFile();
  } catch {
    return false;
  }
};

/** Busca el archivo de un espacio: .webp, luego .png y luego .jpg. `null` si no existe ninguno. */
export function buscarArchivo(area: string, slug: string, archivo: string, raiz = process.cwd()): ArchivoDeImagen | null {
  const carpeta = carpetaDeImagenes(area, slug, raiz);
  const halladas = EXTENSIONES_DE_IMAGEN.filter((ext) => esArchivo(path.join(carpeta, `${archivo}.${ext}`)));
  if (halladas.length === 0) return null;
  const extension = halladas[0];
  const src = `/img/${area}/${slug}/${archivo}.${extension}`;
  const base = { src, extension, duplicadas: halladas.slice(1) };
  try {
    const { ancho, alto } = leerDimensiones(fs.readFileSync(path.join(carpeta, `${archivo}.${extension}`)));
    return { ...base, ancho, alto };
  } catch (e) {
    return { ...base, ancho: 0, alto: 0, error: (e as Error).message };
  }
}

/** Los espacios de imagen de una página con su archivo (o `null` si falta), en el orden de los datos. */
export function resolverImagenes(h: Pick<Herramienta, "meta" | "imagenes">, raiz = process.cwd()): ImagenResuelta[] {
  return h.imagenes.map((espacio) => ({ espacio, archivo: buscarArchivo(h.meta.area, h.meta.slug, espacio.archivo, raiz) }));
}

/** ¿Hay una imagen utilizable (existe y se pudo leer)? */
export const existeUtilizable = (r: ImagenResuelta) => Boolean(r.archivo && !r.archivo.error);

/** Ancho mínimo recomendado de una captura, en píxeles. */
export const ANCHO_MINIMO_RECOMENDADO = 1200;
