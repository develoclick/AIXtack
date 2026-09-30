import type { ColorPaleta } from "./tipos";

const RE_HEX = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;

/** Normaliza un texto de color a «#rrggbb» en minúsculas, o null si no es un HEX válido de 3 o 6 dígitos. */
export function normalizarHex(texto: string): string | null {
  const m = texto.trim().match(RE_HEX);
  if (!m) return null;
  const h = m[1].toLowerCase();
  const largo = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return `#${largo}`;
}

function luminancia(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** Razón de contraste WCAG entre dos colores HEX válidos (1:1 a 21:1). */
export function contraste(hexA: string, hexB: string): number {
  const [x, y] = [luminancia(hexA), luminancia(hexB)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export interface ContrasteColor {
  color: ColorPaleta;
  hexValido: string | null;
  /** Contraste del color contra blanco y contra negro; null si el HEX no es válido. */
  contrasteBlanco: number | null;
  contrasteNegro: number | null;
  /** ¿Cumple AA (≥ 4,5:1) como texto sobre el fondo que mejor le queda (blanco o negro)? */
  cumpleAA: boolean;
  /** «negro» o «blanco»: qué texto usar encima de este color para el mejor contraste. */
  textoRecomendado: "negro" | "blanco" | null;
}

/** Comprueba el contraste AA de cada color de la paleta contra blanco y negro (nunca lo hace la IA). */
export function comprobarPaleta(colores: ColorPaleta[]): ContrasteColor[] {
  return colores.map((color) => {
    const hexValido = normalizarHex(color.hex);
    if (!hexValido) return { color, hexValido: null, contrasteBlanco: null, contrasteNegro: null, cumpleAA: false, textoRecomendado: null };
    const contrasteBlanco = contraste(hexValido, "#ffffff");
    const contrasteNegro = contraste(hexValido, "#000000");
    const textoRecomendado: "negro" | "blanco" = contrasteNegro >= contrasteBlanco ? "negro" : "blanco";
    const mejor = Math.max(contrasteBlanco, contrasteNegro);
    return { color, hexValido, contrasteBlanco, contrasteNegro, cumpleAA: mejor >= 4.5, textoRecomendado };
  });
}
