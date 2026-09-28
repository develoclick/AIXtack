import { diffWordsWithSpace } from "diff";
import { comparable } from "@/lib/cv/normalizar";
import type { Cambio, Problema } from "./lector";

export interface TrozoDiff {
  texto: string;
  tipo: "igual" | "quitado" | "agregado";
}

/** Diferencia por palabras (jsdiff, en el navegador). Devuelve los trozos del original y los del optimizado por separado. */
export function compararTextos(original: string, optimizado: string): { izquierda: TrozoDiff[]; derecha: TrozoDiff[] } {
  const partes = diffWordsWithSpace(original, optimizado);
  const izquierda: TrozoDiff[] = [];
  const derecha: TrozoDiff[] = [];
  for (const p of partes) {
    if (p.added) derecha.push({ texto: p.value, tipo: "agregado" });
    else if (p.removed) izquierda.push({ texto: p.value, tipo: "quitado" });
    else {
      izquierda.push({ texto: p.value, tipo: "igual" });
      derecha.push({ texto: p.value, tipo: "igual" });
    }
  }
  return { izquierda, derecha };
}

const palabras = (t: string) => t.split(/\s+/).filter(Boolean).length;
const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const VACIAS = new Set(
  "para como con por que los las una uno unos unas del al de la el en y o u a se su sus sobre entre desde hasta mas menos muy sin este esta estos estas ese esa son ser sera seran tener tiene tienen debe deben puede pueden cada todo toda todos todas otro otra otros otras nuestro nuestra nuestros nuestras buscamos requisitos funciones deseable deseables ofrecemos experiencia años año minimo minima conocimientos conocimiento capacidad manejo trabajo equipo empresa persona personas area areas".split(" "),
);

/** Términos de una oferta (palabras de 4+ letras sin las vacías, y siglas): base para medir qué palabras clave se añadieron. */
export function terminosDeOferta(oferta: string): string[] {
  const salida = new Set<string>();
  for (const t of oferta.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]{2,}/g) ?? []) {
    const n = norm(t);
    if (!n) continue;
    const siglas = /^[A-ZÁÉÍÓÚÜÑ0-9]{2,}$/.test(t);
    if ((siglas || n.length >= 5) && !VACIAS.has(n) && !/^\d+$/.test(n)) salida.add(n);
  }
  return [...salida];
}

export interface Contadores {
  palabrasEliminadas: number;
  bulletsReescritos: number;
  /** Términos de la oferta que están en el CV optimizado y no estaban en el original. */
  terminosNuevos: string[];
  /** De esos, los que aparecen en un cambio del registro que parte de texto existente del CV (renombrado, no agregado). */
  terminosConRespaldo: string[];
}

const lineasViñeta = (t: string) => t.split("\n").map((l) => l.trim()).filter((l) => /^[-*•·–]\s+/.test(l)).map((l) => norm(l.replace(/^[-*•·–]\s+/, "")));

export function contarCambios(original: string, optimizado: string, oferta: string, cambios: Cambio[]): Contadores {
  const { izquierda } = compararTextos(original, optimizado);
  const palabrasEliminadas = izquierda.filter((t) => t.tipo === "quitado").reduce((a, t) => a + palabras(t.texto), 0);
  const originales = new Set([...lineasViñeta(original), ...original.split("\n").map((l) => norm(l))]);
  const bulletsReescritos = lineasViñeta(optimizado).filter((b) => b && !originales.has(b)).length;
  const enOriginal = new Set(norm(original).split(" "));
  const enOptimizado = new Set(norm(optimizado).split(" "));
  const terminosNuevos = terminosDeOferta(oferta).filter((t) => enOptimizado.has(t) && !enOriginal.has(t));
  const respaldo = cambios.filter((c) => c.antes.trim()).map((c) => new Set(norm(c.despues).split(" ")));
  const terminosConRespaldo = terminosNuevos.filter((t) => respaldo.some((s) => s.has(t)));
  return { palabrasEliminadas, bulletsReescritos, terminosNuevos, terminosConRespaldo };
}

const MESES = new Set("ene feb mar abr may jun jul ago sep set oct nov dic enero febrero marzo abril mayo junio julio agosto septiembre setiembre octubre noviembre diciembre actualidad presente jan apr aug dec present".split(" "));

function digitos(t: string): string {
  return t.replace(/\D+/g, "");
}

export interface Inventados {
  numeros: string[];
  nombres: string[];
}

/**
 * Detector de invención: números y nombres propios (o siglas) que aparecen en el CV optimizado y NO en el original ni en los datos
 * nuevos. No prueba que la IA mintió (puede haber reformateado), pero cada uno debe verificarse antes de usar el CV.
 */
export function detectarInventados(fuente: string, optimizado: string, permitidos: string[] = []): Inventados {
  const numFuente = new Set((fuente.match(/\d+(?:[.,]\d+)*/g) ?? []).map(digitos));
  const flujoFuente = digitos(fuente);
  const numeros = new Set<string>();
  for (const m of optimizado.matchAll(/\d+(?:[.,]\d+)*\s?%?/g)) {
    const d = digitos(m[0]);
    if (!d) continue;
    if (numFuente.has(d) || (d.length >= 6 && flujoFuente.includes(d))) continue;
    numeros.add(m[0].trim());
  }

  const fuenteNorm = " " + norm(fuente) + " " + permitidos.map((p) => norm(p)).join(" ") + " ";
  const nombres = new Set<string>();
  for (const linea of optimizado.split("\n")) {
    const t = linea.trim();
    if (!t || (!/[a-záéíóúüñ]/.test(t) && !/\d|@/.test(t))) continue; // títulos de sección en mayúsculas
    const texto = t.replace(/^[-*•·–]\s+/, "").replace(/^(NOMBRE|CONTACTO)\s*:\s*/i, "");
    const tokens = [...texto.matchAll(/(^|[\s|(«"“,;:])([A-ZÁÉÍÓÚÜÑ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9.&+#-]{1,})/g)];
    for (const m of tokens) {
      const palabra = m[2].replace(/[.,;:]+$/, "");
      const n = norm(palabra);
      const inicio = m[1] === "" && m.index === 0; // primera palabra de la línea: puede ser un verbo con mayúscula
      const trasPunto = /[.!?]\s$/.test(texto.slice(Math.max(0, (m.index ?? 0) - 2), (m.index ?? 0) + 1));
      const esSigla = /^[A-ZÁÉÍÓÚÜÑ0-9&+#-]{2,}$/.test(palabra);
      if (!n || n.length < 2 || MESES.has(n)) continue;
      if ((inicio || trasPunto) && !esSigla) continue;
      if (fuenteNorm.includes(" " + n + " ")) continue;
      nombres.add(palabra);
    }
  }
  return { numeros: [...numeros], nombres: [...nombres] };
}

/** Citas del diagnóstico («fragmento original») que NO existen en el CV original: señal de que la IA citó algo que no está. */
export function citasQueNoEstan(original: string, diagnostico: Problema[]): string[] {
  const o = " " + norm(original) + " ";
  return diagnostico.flatMap((p) => (p.fragmento && p.fragmento.length >= 6 && !o.includes(norm(p.fragmento)) ? [p.fragmento] : []));
}

/** Longitud aproximada en páginas (≈ 550 palabras por página A4 con letra de 11 pt). */
export function paginasAproximadas(texto: string): number {
  return Math.max(1, Math.ceil(palabras(texto) / 550));
}
