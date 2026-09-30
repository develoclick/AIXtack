import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { TITULOS_RESPUESTA, type ClaveRespuesta } from "./tipos";

export interface FilaTabla {
  celdas: string[];
  /** true si alguna celda trae la etiqueta «[VALORACIÓN]». */
  conValoracion: boolean;
}

export interface TablaComparativa {
  cabecera: string[];
  filas: FilaTabla[];
}

export interface LecturaComparar {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  tabla: TablaComparativa;
  costos: string[];
  diferencias: string[];
  ventajas: string[];
  prioridades: string[];
  preguntas: string[];
  verificar: string[];
  siguiente: string[];
  /** Es válida si hay al menos una sección de contenido reconocida. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["tabla", (c) => c.startsWith("tabla comparativa") || c === "tabla"],
  ["costos", (c) => c.startsWith("costos a verificar") || c.startsWith("costos no incluidos")],
  ["diferencias", (c) => c.startsWith("diferencias")],
  ["ventajas", (c) => c.startsWith("ventajas")],
  ["prioridades", (c) => c.startsWith("si cambian mis prioridades") || c.startsWith("prioridades")],
  ["preguntas", (c) => c.startsWith("preguntas antes de reservar") || c.startsWith("preguntas")],
  ["verificar", (c) => c.startsWith("que debes verificar")],
  ["siguiente", (c) => c.startsWith("siguiente paso")],
];

function tituloDe(linea: string): ClaveRespuesta | null {
  const t = linea.trim();
  if (!t || t.length > 60 || /^\s*[-*•]/.test(t) || /\|/.test(t)) return null;
  const c = norm(t.replace(/^#{1,6}\s*/, ""));
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

const CON_VALORACION = /\[valoraci[oó]n\]/i;

function celdasDe(linea: string): string[] {
  return linea
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim())
    .filter((c, i, arr) => c !== "" || arr.length === 1);
}

/** Lee «Tabla comparativa»: una fila por línea con celdas separadas por «|» (bloque de código o tabla markdown). */
export function leerTablaComparativa(texto: string | undefined): TablaComparativa {
  const lineas = (texto ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^[|:\-\s]+$/.test(l));
  if (lineas.length === 0) return { cabecera: [], filas: [] };
  const primera = celdasDe(lineas[0]);
  const esCabecera = primera.length > 1 && !CON_VALORACION.test(lineas[0]) && !/\d/.test(primera.join(""));
  const filasTexto = esCabecera ? lineas.slice(1) : lineas;
  const filas = filasTexto.map((l) => ({ celdas: celdasDe(l), conValoracion: CON_VALORACION.test(l) }));
  return { cabecera: esCabecera ? primera : [], filas };
}

/**
 * Lee la respuesta de «Comparar opciones de viaje»: quita cercas de código y negritas, divide por los títulos exactos (con
 * tolerancia a #, mayúsculas, tildes y dos puntos) e interpreta la tabla comparativa por celdas separadas por «|».
 */
export function leerRespuestaComparar(entrada: string): LecturaComparar {
  const lineas = (entrada ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => !/^\s*(?:```|~~~)/.test(l))
    .map((l) => (l.trim().startsWith("|") ? l : quitarFormato(l)));

  const acumulado: Partial<Record<ClaveRespuesta, string[]>> = {};
  let actual: ClaveRespuesta | null = null;
  for (const l of lineas) {
    const clave = tituloDe(l);
    if (clave && !(clave in acumulado)) {
      actual = clave;
      acumulado[clave] = [];
      continue;
    }
    if (actual) acumulado[actual]!.push(l);
  }
  const secciones: Partial<Record<ClaveRespuesta, string>> = {};
  for (const [k, v] of Object.entries(acumulado)) secciones[k as ClaveRespuesta] = v!.join("\n").trim();

  const contenido: ClaveRespuesta[] = ["tabla", "diferencias", "ventajas"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0) problema = "No encuentro ninguno de los títulos esperados («## Tabla comparativa», «## Diferencias que importan»…). Pídele a tu IA que use exactamente los títulos indicados en el prompt.";

  const tabla = leerTablaComparativa(secciones.tabla);
  const advertencias: string[] = [];
  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.tabla && tabla.filas.length === 0) advertencias.push("No pude leer filas de la tabla comparativa. Pídele a la IA que separe las celdas con «|», una fila por opción.");
    const sinValoracion = tabla.filas.length > 0 && !tabla.filas.some((f) => f.conValoracion);
    if (sinValoracion) advertencias.push("Ninguna celda de la tabla trae la etiqueta «[VALORACIÓN]»: no distingo qué es un dato y qué es una opinión de la IA en esta tabla.");
  }

  return {
    secciones,
    tabla,
    costos: items(secciones.costos),
    diferencias: items(secciones.diferencias),
    ventajas: items(secciones.ventajas),
    prioridades: items(secciones.prioridades),
    preguntas: items(secciones.preguntas),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: !problema,
    problema,
    advertencias,
  };
}
