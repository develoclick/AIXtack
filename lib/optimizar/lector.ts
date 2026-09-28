import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { leerRespuestaIa, type ResultadoLectura } from "@/lib/cv/parser";
import { TITULOS_RESPUESTA, type ClaveRespuesta } from "./tipos";

export interface Problema {
  tipo: string;
  /** Fragmento original citado entre « » (si lo hay). */
  fragmento?: string;
  texto: string;
}

export interface Cambio {
  antes: string;
  despues: string;
  motivo: string;
}

export interface LecturaOptimizar {
  /** Texto de cada sección tal como vino (sin el título). */
  secciones: Partial<Record<ClaveRespuesta, string>>;
  diagnostico: Problema[];
  cambios: Cambio[];
  eliminado: string[];
  brechas: string[];
  preguntas: string[];
  verificar: string[];
  siguiente: string[];
  /** El CV optimizado leído con el lector del generador de CV (para la vista previa y el Word). */
  cv: ResultadoLectura | null;
  /** Solo es válida (habilita comparar y descargar) si hay un CV optimizado con nombre y alguna sección. */
  valido: boolean;
  /** Qué falta de imprescindible. */
  problema?: string;
  /** Avisos que no bloquean. */
  advertencias: string[];
}

/** Cómo se reconoce cada título aunque venga con #, negritas, dos puntos, otra mayúscula o sin tilde. */
const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["diagnostico", (c) => c === "diagnostico" || c.startsWith("diagnostico ")],
  ["cv", (c) => /^cv optimizad[oa]/.test(c) || c === "cv"],
  ["registro", (c) => c.startsWith("registro de cambios")],
  ["eliminado", (c) => c.startsWith("eliminado")],
  ["brechas", (c) => c.startsWith("brechas")],
  ["preguntas", (c) => c.startsWith("preguntas para confirmar") || c.startsWith("preguntas")],
  ["verificar", (c) => c.includes("debes verificar") || c.startsWith("afirmaciones")],
  ["siguiente", (c) => c.startsWith("siguiente paso")],
];

function tituloDe(linea: string): ClaveRespuesta | null {
  const t = linea.trim();
  if (!t || t.length > 70 || /^\s*[-*•]/.test(t) || /\|/.test(t)) return null;
  const c = comparable(t.replace(/^#{1,6}\s*/, ""));
  for (const [clave, f] of RECONOCER) if (f(c)) return clave;
  return null;
}

const RE_VINETA = /^\s*(?:[-*•·–—+]|\d+[.)])\s+(.*)$/;

function items(texto: string | undefined): string[] {
  if (!texto) return [];
  const salida: string[] = [];
  for (const l of texto.split("\n")) {
    const t = l.trim();
    if (!t) continue;
    const v = t.match(RE_VINETA);
    if (v) salida.push(v[1].trim());
    else if (salida.length) salida[salida.length - 1] += " " + t;
    else salida.push(t);
  }
  return salida;
}

function problema(item: string): Problema {
  const m = item.match(/^\[([^\]]+)\]\s*(.*)$/);
  const tipo = m ? m[1].trim().toUpperCase() : "OTRO";
  const resto = m ? m[2] : item;
  const f = resto.match(/[«"“]([^»"”]+)[»"”]/);
  return { tipo, fragmento: f?.[1].trim(), texto: resto.trim() };
}

function cambio(item: string): Cambio {
  const partes = item.split(/\s*(?:→|->|=>)\s*/);
  const limpio = (s: string | undefined, etiqueta: RegExp) => (s ?? "").replace(etiqueta, "").replace(/^[«"“]|[»"”]$/g, "").trim();
  return { antes: limpio(partes[0], /^antes\s*:?\s*/i), despues: limpio(partes[1], /^despu[eé]s\s*:?\s*/i), motivo: limpio(partes.slice(2).join(" → "), /^motivo\s*:?\s*/i) };
}

/**
 * Lee la respuesta de «Optimizar tu CV»: quita cercas de código, enlaces y negritas, divide por los títulos exactos (con
 * tolerancia a #, mayúsculas, tildes y dos puntos) y convierte cada sección. El CV optimizado se lee con el lector del generador
 * de CV. Nada se inventa: lo que no se reconoce queda como texto.
 */
export function leerRespuestaOptimizar(entrada: string): LecturaOptimizar {
  const lineas = (entrada ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => !/^\s*(?:```|~~~)/.test(l))
    .map(quitarFormato);

  const acumulado: Partial<Record<ClaveRespuesta, string[]>> = {};
  let actual: ClaveRespuesta | null = null;
  for (const l of lineas) {
    const clave = tituloDe(l);
    // Dentro del CV optimizado, un título conocido solo abre sección nueva si aún no se vio ese título (evita cortar el CV).
    if (clave && !(clave in acumulado)) {
      actual = clave;
      acumulado[clave] = [];
      continue;
    }
    if (actual) acumulado[actual]!.push(l);
  }
  const secciones: Partial<Record<ClaveRespuesta, string>> = {};
  for (const [k, v] of Object.entries(acumulado)) secciones[k as ClaveRespuesta] = v!.join("\n").trim();

  const cv = secciones.cv ? leerRespuestaIa(secciones.cv) : null;
  const advertencias: string[] = [];
  let prob: string | undefined;
  if (!secciones.cv) prob = "No encuentro la sección «CV optimizado». Pídele a tu IA que use exactamente los títulos indicados en el prompt.";
  else if (!cv?.valido) prob = `El «CV optimizado» no se pudo leer: ${cv?.problema ?? "formato no reconocido"}`;

  if (!prob) {
    for (const t of TITULOS_RESPUESTA) if (t.obligatoria && !(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (cv) advertencias.push(...cv.advertencias.filter((a) => !a.startsWith("No detecté la sección IDIOMAS")));
    if ((secciones.registro ?? "").length > 0 && cambios(secciones.registro).length === 0) advertencias.push("No pude separar los cambios del registro en «Antes → Después → Motivo»: se muestra como texto.");
  }

  return {
    secciones,
    diagnostico: items(secciones.diagnostico).map(problema),
    cambios: cambios(secciones.registro),
    eliminado: items(secciones.eliminado),
    brechas: items(secciones.brechas),
    preguntas: items(secciones.preguntas),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    cv,
    valido: !prob,
    problema: prob,
    advertencias,
  };
}

function cambios(texto: string | undefined): Cambio[] {
  return items(texto)
    .filter((i) => /→|->|=>/.test(i))
    .map(cambio);
}
