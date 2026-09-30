import { dividirCsv } from "@/lib/analisis/lector";
import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { fechaUtc } from "./calculo";
import { TIPOS_BLOQUE, TITULOS_RESPUESTA, type ClaveRespuesta, type FilaItinerario, type TipoBloque } from "./tipos";

export interface PorQueLeido {
  dia: number | null;
  zona: string;
  motivo: string;
}

export interface PlanBLeido {
  dia: number | null;
  situacion: string;
  alternativa: string;
}

export interface LecturaItinerario {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  itinerario: FilaItinerario[];
  filasIlegibles: string[];
  sinCabecera: boolean;
  porque: PorQueLeido[];
  planesB: PlanBLeido[];
  presupuesto: string[];
  verificar: string[];
  siguiente: string[];
  /** Es válida si se reconoce al menos una sección de contenido. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["itinerario", (c) => c === "itinerario" || c.startsWith("itinerario ")],
  ["porque", (c) => c.startsWith("por que este orden") || c.startsWith("por que")],
  ["planesB", (c) => c.startsWith("planes b") || c.startsWith("plan b")],
  ["presupuesto", (c) => c.startsWith("presupuesto estimado") || c.startsWith("presupuesto")],
  ["verificar", (c) => c.startsWith("que debes verificar")],
  ["siguiente", (c) => c.startsWith("siguiente paso")],
];

function tituloDe(linea: string): ClaveRespuesta | null {
  const t = linea.trim();
  if (!t || t.length > 60 || /^\s*[-*•]/.test(t) || /[|,]/.test(t)) return null;
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

function separador(cabecera: string): string {
  return [",", ";", "|", "\t"].map((s) => ({ s, n: cabecera.split(s).length })).sort((a, b) => b.n - a.n)[0].s;
}

function tipoDe(texto: string): { tipo: TipoBloque | null; texto: string } {
  const c = norm(texto);
  const t = TIPOS_BLOQUE.find((x) => norm(x.etiqueta) === c || x.valor === c.replace(/ /g, "-"));
  return { tipo: t?.valor ?? null, texto: texto.trim() };
}

function verificadoDe(texto: string): boolean | null {
  const c = norm(texto);
  if (["si", "sí", "true", "yes", "verificado"].includes(c)) return true;
  if (["no", "false", "sin verificar", "por verificar"].includes(c)) return false;
  return null;
}

/**
 * Lee la tabla del itinerario (CSV, o tabla con barras verticales): dia, fecha, zona, hora_inicio, hora_fin, actividad, tipo,
 * lugar, nota y verificado. Exige exactamente los 10 campos por fila (con comillas si el texto lleva comas); las filas que no
 * calzan se devuelven aparte, sin adivinar dónde se cortan sus dos columnas de texto libre.
 */
export function leerItinerario(texto: string | undefined): { filas: FilaItinerario[]; ilegibles: string[]; sinCabecera: boolean } {
  const lineas = (texto ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^[\s|:\-–—]+$/.test(l));
  const filas: FilaItinerario[] = [];
  const ilegibles: string[] = [];
  if (lineas.length === 0) return { filas, ilegibles, sinCabecera: false };
  const limpia = (l: string) => l.replace(/^\|/, "").replace(/\|$/, "");
  const primera = norm(limpia(lineas[0]));
  const conCabecera = primera.startsWith("dia") && primera.includes("verificado");
  const sep = separador(limpia(lineas[0]));
  for (const l of conCabecera ? lineas.slice(1) : lineas) {
    const c = dividirCsv(limpia(l), sep);
    if (c.length !== 10) {
      ilegibles.push(l);
      continue;
    }
    const dia = Number((c[0].match(/\d+/) ?? [""])[0]);
    if (!Number.isInteger(dia) || dia < 1) {
      ilegibles.push(l);
      continue;
    }
    const fecha = fechaUtc(c[1]) !== null ? c[1].trim() : "";
    const { tipo, texto: tipoTexto } = tipoDe(c[6]);
    filas.push({ dia, fecha, zona: c[2].trim(), horaInicio: c[3].trim(), horaFin: c[4].trim(), actividad: c[5].trim(), tipo, tipoTexto, lugar: c[7].trim(), nota: c[8].trim(), verificado: verificadoDe(c[9]) });
  }
  return { filas, ilegibles, sinCabecera: !conCabecera };
}

const RE_PORQUE = /^d[ií]a\s*(\d+)\s*(?:\(([^)]*)\))?\s*[:\-–—]\s*(.*)$/i;
function porQue(item: string): PorQueLeido {
  const m = item.match(RE_PORQUE);
  if (!m) return { dia: null, zona: "", motivo: item };
  return { dia: Number(m[1]), zona: (m[2] ?? "").trim(), motivo: m[3].trim() };
}

const RE_PLAN_B = /^d[ií]a\s*(\d+)\s*[:\-–—]\s*(.*)$/i;
function planB(item: string): PlanBLeido {
  const m = item.match(RE_PLAN_B);
  if (!m) return { dia: null, situacion: item, alternativa: "" };
  const [situacion, ...resto] = m[2].split("|").map((p) => p.trim());
  return { dia: Number(m[1]), situacion: situacion ?? "", alternativa: resto.join(" | ") };
}

/**
 * Lee la respuesta de «Crear un itinerario de viaje»: quita cercas de código y negritas, divide por los títulos exactos (con
 * tolerancia a #, mayúsculas, tildes y dos puntos) y convierte cada sección (la tabla en filas por día; «Por qué este orden» y
 * «Planes B» por día).
 */
export function leerRespuestaItinerario(entrada: string): LecturaItinerario {
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

  const contenido: ClaveRespuesta[] = ["itinerario", "porque", "planesB", "presupuesto"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0) problema = "No encuentro ninguno de los títulos esperados («## Itinerario», «## Por qué este orden», «## Planes B»…). Pídele a tu IA que use exactamente los títulos indicados en el prompt.";

  const { filas, ilegibles, sinCabecera } = leerItinerario(secciones.itinerario);
  const advertencias: string[] = [];
  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.itinerario && filas.length === 0) advertencias.push("No pude leer la tabla del itinerario. Pídele a la IA una tabla CSV con la cabecera dia,fecha,zona,hora_inicio,hora_fin,actividad,tipo,lugar,nota,verificado.");
    if (filas.length > 0 && sinCabecera) advertencias.push("La tabla del itinerario no trae la cabecera esperada: la leí igualmente.");
    if (ilegibles.length) advertencias.push(`${ilegibles.length} línea(s) de la tabla no se pudieron leer (revisa que tengan las 10 columnas, con comillas si el texto lleva comas) y se omitieron.`);
    const sinTipo = filas.filter((f) => f.tipo === null && f.tipoTexto).length;
    if (sinTipo) advertencias.push(`${sinTipo} bloque(s) traen un tipo que no reconozco (debería ser imprescindible, opcional, comida, traslado o libre).`);
  }

  return {
    secciones,
    itinerario: filas,
    filasIlegibles: ilegibles,
    sinCabecera,
    porque: items(secciones.porque).map(porQue),
    planesB: items(secciones.planesB).map(planB),
    presupuesto: items(secciones.presupuesto),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: !problema,
    problema,
    advertencias,
  };
}
