import { plantillaPorId, type Plantilla } from "./tipos";

export interface ImagenProducto {
  img: HTMLImageElement;
  revocar: () => void;
}

const TIPOS_ACEPTADOS = ["image/png", "image/jpeg", "image/webp"];

/** Carga una foto del navegador de la persona (nunca sale de ahí) como una imagen lista para dibujar en canvas. */
export function cargarFotoProducto(archivo: File): Promise<ImagenProducto> {
  return new Promise((resolve, reject) => {
    if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
      reject(new Error("Formato no admitido: usa una foto en PNG, JPG o WebP."));
      return;
    }
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => resolve({ img, revocar: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la foto. Prueba con otro archivo."));
    };
    img.src = url;
  });
}

const ANCHO = 1080;
const ALTO = 1350;
const MARGEN = 64;

function envolverTexto(ctx: CanvasRenderingContext2D, texto: string, maxAncho: number): string[] {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of palabras) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > maxAncho && actual) {
      lineas.push(actual);
      actual = palabra;
    } else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** Dibuja la imagen recortándola (cover) para llenar el rectángulo dado, centrada. */
function dibujarCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const escala = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const anchoDibujo = img.naturalWidth * escala;
  const altoDibujo = img.naturalHeight * escala;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - anchoDibujo) / 2, y + (h - altoDibujo) / 2, anchoDibujo, altoDibujo);
  ctx.restore();
}

export interface DatosFicha {
  nombre: string;
  descripcion: string;
  especificaciones: string[];
  precio: string;
  precioPromo: string;
  categoria: string;
  cta: string;
  empresa: string;
}

/** Dibuja la ficha de un producto (1080×1350, formato retrato para redes) en un canvas nuevo. Todo ocurre en el navegador: nada se sube a un servidor. */
export function dibujarFichaProducto(datos: DatosFicha, plantilla: Plantilla, foto: HTMLImageElement | null): HTMLCanvasElement {
  const p = plantillaPorId(plantilla);
  const canvas = document.createElement("canvas");
  canvas.width = ANCHO;
  canvas.height = ALTO;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = p.fondo;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  const altoFoto = 760;
  if (foto) {
    dibujarCover(ctx, foto, 0, 0, ANCHO, altoFoto);
  } else {
    ctx.fillStyle = p.acento;
    ctx.fillRect(0, 0, ANCHO, altoFoto);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 220px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.85;
    ctx.fillText((datos.nombre.trim()[0] ?? "?").toUpperCase(), ANCHO / 2, altoFoto / 2);
    ctx.globalAlpha = 1;
  }

  if (datos.categoria.trim()) {
    ctx.font = "700 30px system-ui, sans-serif";
    const texto = datos.categoria.trim().toUpperCase();
    const ancho = ctx.measureText(texto).width + 48;
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.92;
    ctx.fillRect(MARGEN - 16, 32, ancho, 56);
    ctx.globalAlpha = 1;
    ctx.fillStyle = p.acento;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, MARGEN, 32 + 28);
  }

  let y = altoFoto + 64;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = p.tinta;
  ctx.font = "700 56px system-ui, sans-serif";
  const anchoTexto = ANCHO - MARGEN * 2;
  for (const linea of envolverTexto(ctx, datos.nombre, anchoTexto).slice(0, 2)) {
    y += 60;
    ctx.fillText(linea, MARGEN, y);
  }

  if (datos.descripcion.trim()) {
    ctx.font = "400 32px system-ui, sans-serif";
    ctx.globalAlpha = 0.85;
    y += 20;
    for (const linea of envolverTexto(ctx, datos.descripcion, anchoTexto).slice(0, 3)) {
      y += 40;
      ctx.fillText(linea, MARGEN, y);
    }
    ctx.globalAlpha = 1;
  }

  y = ALTO - 170;
  ctx.font = "700 72px system-ui, sans-serif";
  ctx.fillStyle = p.acento;
  const precioTexto = datos.precioPromo.trim() || datos.precio.trim();
  ctx.fillText(precioTexto, MARGEN, y);
  if (datos.precioPromo.trim() && datos.precio.trim()) {
    const anchoPrecioPromo = ctx.measureText(precioTexto).width;
    ctx.font = "400 36px system-ui, sans-serif";
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = p.tinta;
    const xTachado = MARGEN + anchoPrecioPromo + 24;
    ctx.fillText(datos.precio.trim(), xTachado, y);
    const anchoTachado = ctx.measureText(datos.precio.trim()).width;
    ctx.beginPath();
    ctx.moveTo(xTachado, y - 12);
    ctx.lineTo(xTachado + anchoTachado, y - 12);
    ctx.strokeStyle = p.tinta;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.font = "600 30px system-ui, sans-serif";
  ctx.fillStyle = p.tinta;
  ctx.globalAlpha = 0.75;
  ctx.fillText(datos.empresa.trim() || " ", MARGEN, ALTO - 90);
  ctx.globalAlpha = 1;
  if (datos.cta.trim()) {
    ctx.font = "400 26px system-ui, sans-serif";
    ctx.globalAlpha = 0.6;
    for (const linea of envolverTexto(ctx, datos.cta, anchoTexto).slice(0, 1)) ctx.fillText(linea, MARGEN, ALTO - 50);
    ctx.globalAlpha = 1;
  }

  return canvas;
}

export function canvasABlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen."))), "image/png");
  });
}
