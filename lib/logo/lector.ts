import { dividirCsv } from "@/lib/analisis/lector";
import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { TITULOS_RESPUESTA, type ClaveRespuesta, type ColorPaleta, type Concepto, type PromptVariante, type Tipografia } from "./tipos";

export interface LecturaLogo {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  brief: string[];
  conceptos: Concepto[];
  paleta: ColorPaleta[];
  tipografias: Tipografia[];
  detallesEspecificaciones: string[];
  variantes: string[];
  prompts: PromptVariante[];
  aplicaciones: string[];
  revision: string[];
  verificar: string[];
  siguiente: string[];
  /** Es válida si se reconoce al menos brief, conceptos o especificaciones. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["brief", (c) => c === "brief"],
  ["conceptos", (c) => c.startsWith("conceptos")],
  ["especificaciones", (c) => c.startsWith("especificaciones")],
  ["variantes", (c) => c.startsWith("variantes")],
  ["prompts", (c) => c.startsWith("prompts de imagen") || c.startsWith("prompts")],
  ["aplicaciones", (c) => c.startsWith("aplicaciones")],
  ["revision", (c) => c.startsWith("revision")],
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

/** Índice de la primera línea cuya forma normalizada cumple el predicado, o -1 si no hay ninguna. */
function indiceCabecera(lineas: string[], predicado: (normalizada: string) => boolean): number {
  return lineas.findIndex((l) => predicado(norm(l)));
}

/** Hasta dónde puede llegar un bloque que empieza en `inicio`: el inicio de otro bloque conocido (si viene después) o el final. */
function limiteHasta(inicio: number, otroInicio: number, total: number): number {
  return otroInicio !== -1 && otroInicio > inicio ? otroInicio : total;
}

/** Extrae un bloque CSV ya ubicado (cabecera en `iCabecera`): consume filas hasta una línea vacía, una viñeta, un título u otro bloque conocido (`limite`). Devuelve también los índices consumidos, para que el resto de la sección se lea como texto libre. */
function extraerBloqueCsv(lineas: string[], iCabecera: number, limite: number): { filas: string[][]; consumidas: Set<number> } {
  const consumidas = new Set<number>();
  if (iCabecera === -1) return { filas: [], consumidas };
  consumidas.add(iCabecera);
  const sep = separador(lineas[iCabecera]);
  const filas: string[][] = [];
  for (let i = iCabecera + 1; i < limite; i++) {
    const l = lineas[i].trim();
    if (!l || RE_VINETA.test(l) || /^#{1,6}\s/.test(l)) break;
    consumidas.add(i);
    filas.push(dividirCsv(l, sep));
  }
  return { filas, consumidas };
}

function leerConceptos(texto: string | undefined): Concepto[] {
  const lineas = (texto ?? "").split("\n").filter((l) => l.trim());
  const iCabecera = indiceCabecera(lineas, (n) => n.startsWith("concepto") && n.includes("idea"));
  const { filas } = extraerBloqueCsv(lineas, iCabecera, lineas.length);
  return filas.map((c) => ({ nombre: (c[0] ?? "").trim(), idea: (c[1] ?? "").trim(), tipo: (c[2] ?? "").trim(), composicion: (c[3] ?? "").trim(), justificacion: (c[4] ?? "").trim() })).filter((c) => c.nombre);
}

function leerEspecificaciones(texto: string | undefined): { paleta: ColorPaleta[]; tipografias: Tipografia[]; detalles: string[] } {
  const lineas = (texto ?? "").split("\n").filter((l) => l.trim());
  const iPaleta = indiceCabecera(lineas, (n) => n.startsWith("color") && n.includes("hex"));
  const iTipo = indiceCabecera(lineas, (n) => n.startsWith("tipografia") && (n.includes("alternativa") || n.includes("google")));
  const paleta = extraerBloqueCsv(lineas, iPaleta, limiteHasta(iPaleta, iTipo, lineas.length));
  const tipografias = extraerBloqueCsv(lineas, iTipo, limiteHasta(iTipo, iPaleta, lineas.length));
  const consumidas = new Set([...paleta.consumidas, ...tipografias.consumidas]);
  const resto = lineas.filter((_, i) => !consumidas.has(i)).join("\n");
  return {
    paleta: paleta.filas.map((c) => ({ nombre: (c[0] ?? "").trim(), hex: (c[1] ?? "").trim(), rgb: (c[2] ?? "").trim(), uso: (c[3] ?? "").trim() })).filter((c) => c.nombre),
    tipografias: tipografias.filas.map((c) => ({ nombre: (c[0] ?? "").trim(), alternativaGoogleFonts: (c[1] ?? "").trim(), uso: (c[2] ?? "").trim(), licencia: (c[3] ?? "").trim() })).filter((c) => c.nombre),
    detalles: items(resto),
  };
}

/** Lee «Prompts de imagen»: cada variante empieza con un título «# a ######» y trae líneas «EN: …» y «ES: …» (con continuaciones). */
function leerPrompts(texto: string | undefined): PromptVariante[] {
  const lineas = (texto ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const variantes: PromptVariante[] = [];
  let actual: PromptVariante | null = null;
  let campo: "en" | "es" | null = null;
  for (const l of lineas) {
    const mTitulo = l.match(/^#{1,6}\s*(.+)$/);
    if (mTitulo) {
      if (actual && actual.variante) variantes.push(actual);
      actual = { variante: mTitulo[1].trim(), en: "", es: "" };
      campo = null;
      continue;
    }
    const mEn = l.match(/^en\s*:\s*(.*)$/i);
    const mEs = l.match(/^es\s*:\s*(.*)$/i);
    if (mEn && actual) {
      actual.en = mEn[1].trim();
      campo = "en";
      continue;
    }
    if (mEs && actual) {
      actual.es = mEs[1].trim();
      campo = "es";
      continue;
    }
    if (actual && campo) actual[campo] = `${actual[campo]} ${l}`.trim();
  }
  if (actual && actual.variante) variantes.push(actual);
  return variantes;
}

/**
 * Lee la respuesta de «Crear un logo profesional para tu empresa»: quita cercas de código y negritas, divide por los títulos
 * exactos (con tolerancia a #, mayúsculas, tildes y dos puntos) y lee los bloques CSV de conceptos, paleta y tipografías, y
 * los prompts de imagen por variante.
 */
export function leerRespuestaLogo(entrada: string): LecturaLogo {
  const lineas = (entrada ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => !/^\s*(?:```|~~~)/.test(l))
    .map(quitarFormato);

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

  const contenido: ClaveRespuesta[] = ["brief", "conceptos", "especificaciones"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0) problema = "No encuentro ninguno de los títulos esperados («## Brief», «## Conceptos», «## Especificaciones»…). Pídele a tu IA que use exactamente los títulos indicados en el prompt.";

  const conceptos = leerConceptos(secciones.conceptos);
  const { paleta, tipografias, detalles } = leerEspecificaciones(secciones.especificaciones);
  const prompts = leerPrompts(secciones.prompts);

  const advertencias: string[] = [];
  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.conceptos && conceptos.length === 0) advertencias.push("No pude leer la tabla de conceptos. Pídele a la IA una tabla CSV con la cabecera concepto,idea,tipo,composicion,justificacion.");
    if (conceptos.length > 0 && conceptos.length !== 3) advertencias.push(`La respuesta trae ${conceptos.length} concepto(s) en vez de 3.`);
    if (secciones.especificaciones && paleta.length === 0) advertencias.push("No pude leer la paleta de colores. Pídele a la IA una tabla CSV con la cabecera color,hex,rgb,uso.");
    if (secciones.especificaciones && tipografias.length === 0) advertencias.push("No pude leer la tabla de tipografías. Pídele a la IA una tabla CSV con la cabecera tipografia,alternativa_google_fonts,uso,licencia.");
    if (secciones.prompts && prompts.length === 0) advertencias.push("No pude leer los prompts de imagen. Cada variante debe empezar con «### Nombre» y traer líneas «EN: …» y «ES: …».");
    if (prompts.length > 0 && prompts.length < 8) advertencias.push(`La respuesta trae prompts para ${prompts.length} variante(s) en vez de 8.`);
  }

  return {
    secciones,
    brief: items(secciones.brief),
    conceptos,
    paleta,
    tipografias,
    detallesEspecificaciones: detalles,
    variantes: items(secciones.variantes),
    prompts,
    aplicaciones: items(secciones.aplicaciones),
    revision: items(secciones.revision),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: !problema,
    problema,
    advertencias,
  };
}
