/**
 * Ancho y alto reales de una imagen leyendo solo su cabecera (sin librerías): .webp (VP8, VP8L y VP8X), .png y .jpg/.jpeg.
 * Lo usan la página (al construir), `npm run capturas`, `npm run publicar` y los tests.
 */
export interface Dimensiones {
  ancho: number;
  alto: number;
}

/** Extensiones que se buscan, por orden de preferencia: si hay varias con el mismo nombre, gana la primera (.webp). */
export const EXTENSIONES_DE_IMAGEN = ["webp", "png", "jpg"] as const;
export type ExtensionDeImagen = (typeof EXTENSIONES_DE_IMAGEN)[number];

function webp(b: Buffer): Dimensiones {
  const tipo = b.toString("ascii", 12, 16);
  if (tipo === "VP8 ") return { ancho: b.readUInt16LE(26) & 0x3fff, alto: b.readUInt16LE(28) & 0x3fff };
  if (tipo === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { ancho: (bits & 0x3fff) + 1, alto: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (tipo === "VP8X") return { ancho: 1 + b.readUIntLE(24, 3), alto: 1 + b.readUIntLE(27, 3) };
  throw new Error("formato .webp no reconocido");
}

function png(b: Buffer): Dimensiones {
  return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
}

function jpg(b: Buffer): Dimensiones {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marca = b[i + 1];
    // SOF0–SOF15, salvo DHT (C4), JPG (C8) y DAC (CC): llevan el tamaño del cuadro.
    if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) return { alto: b.readUInt16BE(i + 5), ancho: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error("no encuentro el tamaño en el .jpg");
}

/** Lee el tamaño de una imagen a partir de sus bytes; lanza un error claro si no es un .webp, .png o .jpg válido. */
export function leerDimensiones(b: Buffer): Dimensiones {
  let d: Dimensiones;
  if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") d = webp(b);
  else if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) d = png(b);
  else if (b.length > 10 && b[0] === 0xff && b[1] === 0xd8) d = jpg(b);
  else throw new Error("no es un archivo .webp, .png o .jpg válido");
  if (!(d.ancho > 0 && d.alto > 0)) throw new Error("la imagen mide 0 píxeles");
  return d;
}
