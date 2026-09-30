import { TAMANOS_FAVICON } from "./tipos";

export interface ImagenCargada {
  img: HTMLImageElement;
  /** Libera la URL temporal del archivo. Llamar cuando ya no se necesite la imagen (por ejemplo, al cargar una nueva). */
  revocar: () => void;
}

const TIPOS_ACEPTADOS = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/** Carga un PNG, JPG, WebP o SVG del navegador de la persona (nunca sale de ahí) como una imagen lista para dibujar en canvas. */
export function cargarImagenDesdeArchivo(archivo: File): Promise<ImagenCargada> {
  return new Promise((resolve, reject) => {
    if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
      reject(new Error("Formato no admitido: usa un PNG, JPG, WebP o SVG."));
      return;
    }
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => resolve({ img, revocar: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen. Prueba con otro archivo."));
    };
    img.src = url;
  });
}

/** Dibuja la imagen centrada y proporcional (sin recortar) en un canvas cuadrado del tamaño dado. */
export function dibujarEnCanvas(img: HTMLImageElement, tamano: number, fondo: "transparente" | "blanco" | "oscuro"): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = tamano;
  canvas.height = tamano;
  const ctx = canvas.getContext("2d")!;
  if (fondo === "blanco") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, tamano, tamano);
  } else if (fondo === "oscuro") {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, tamano, tamano);
  }
  const escala = Math.min(tamano / img.naturalWidth, tamano / img.naturalHeight);
  const w = img.naturalWidth * escala;
  const h = img.naturalHeight * escala;
  ctx.drawImage(img, (tamano - w) / 2, (tamano - h) / 2, w, h);
  return canvas;
}

function canvasABlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen."))), "image/png");
  });
}

export interface FaviconGenerado {
  tamano: number;
  blob: Blob;
  url: string;
}

/** Genera un PNG por cada tamaño (16, 32, 180 y 512 px por defecto), con fondo transparente. */
export async function generarFavicons(img: HTMLImageElement, tamanos: readonly number[] = TAMANOS_FAVICON): Promise<FaviconGenerado[]> {
  const salida: FaviconGenerado[] = [];
  for (const tamano of tamanos) {
    const blob = await canvasABlob(dibujarEnCanvas(img, tamano, "transparente"));
    salida.push({ tamano, blob, url: URL.createObjectURL(blob) });
  }
  return salida;
}

/** Empaqueta los favicons generados en un .zip (jszip se carga solo al pulsar el botón, no en la carga inicial de la página). */
export async function crearZipFavicons(favicons: FaviconGenerado[], nombreBase: string): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const base = nombreBase.trim() || "logo";
  for (const f of favicons) zip.file(`${base}-${f.tamano}x${f.tamano}.png`, f.blob);
  return zip.generateAsync({ type: "blob" });
}
