import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { TITULOS_RESPUESTA, type ClaveRespuesta, type EstadoRequisito, type Requisito, type TipoRequisito } from "./tipos";

export interface PalabraClave {
  palabra: string;
  /** Fragmento del CV que hace de equivalente (sinónimo), si lo hay. */
  equivalente: string;
  sinEquivalente: boolean;
}

export interface AccionPlan {
  area: "CV" | "ENTREVISTA" | "APRENDER" | "OTRO";
  texto: string;
}

export interface LecturaAnalisis {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  requisitos: Requisito[];
  palabras: PalabraClave[];
  fortalezas: string[];
  brechas: string[];
  aVerificar: string[];
  plan: AccionPlan[];
  verificar: string[];
  siguiente: string[];
  /** Filas de la tabla con un tipo o un estado que no se reconoció (esas filas no entran al cálculo). */
  sinReconocer: string[];
  /** Es válida si hay al menos un requisito leído. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["requisitos", (c) => c === "requisitos" || c.startsWith("requisitos ") || c.startsWith("tabla de requisitos")],
  ["palabras", (c) => c.startsWith("palabras clave")],
  ["fortalezas", (c) => c.startsWith("fortalezas")],
  ["brechas", (c) => c.startsWith("brechas")],
  ["verificar_ia", (c) => c === "a verificar" || c.startsWith("a verificar")],
  ["plan", (c) => c.startsWith("plan de accion") || c.startsWith("acciones")],
  ["verificar", (c) => c.startsWith("que debes verificar")],
  ["siguiente", (c) => c.startsWith("siguiente paso")],
];

function tituloDe(linea: string): ClaveRespuesta | null {
  const t = linea.trim();
  if (!t || t.length > 60 || /^\s*[-*•]/.test(t) || /[|,;]/.test(t)) return null;
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

/** Divide una línea de CSV respetando las comillas dobles (con «""» como comilla escapada). */
export function dividirCsv(linea: string, separador: string): string[] {
  const campos: string[] = [];
  let actual = "";
  let dentro = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (dentro) {
      if (c === '"') {
        if (linea[i + 1] === '"') {
          actual += '"';
          i += 1;
        } else dentro = false;
      } else actual += c;
    } else if (c === '"') dentro = true;
    else if (c === separador) {
      campos.push(actual.trim());
      actual = "";
    } else actual += c;
  }
  campos.push(actual.trim());
  return campos;
}

/** Detecta el separador de la cabecera: coma, punto y coma, barra vertical o tabulador. */
function detectarSeparador(cabecera: string): string {
  const candidatos = [",", ";", "|", "\t"];
  return candidatos.map((s) => ({ s, n: cabecera.split(s).length })).sort((a, b) => b.n - a.n)[0].s;
}

function tipoDe(v: string): TipoRequisito | null {
  const c = norm(v);
  if (c.startsWith("obligatori") || c.startsWith("indispensable") || c.startsWith("excluyente")) return "OBLIGATORIO";
  if (c.startsWith("deseable") || c.startsWith("valorable") || c === "plus") return "DESEABLE";
  if (c.startsWith("no especificado") || c.startsWith("no especifica") || c === "ne") return "NO ESPECIFICADO";
  return null;
}

function estadoDe(v: string): EstadoRequisito | null {
  const c = norm(v);
  if (c === "cumple" || c.startsWith("cumple total")) return "CUMPLE";
  if (c.startsWith("parcial") || c.startsWith("cumple parcial")) return "PARCIAL";
  if (c.startsWith("no identificado") || c.startsWith("no identificada")) return "NO IDENTIFICADO";
  if (c.startsWith("no evaluable")) return "NO EVALUABLE";
  return null;
}

/** Lee la sección «Requisitos» (bloque CSV). Devuelve los requisitos y las filas que no se pudieron interpretar. */
export function leerRequisitos(texto: string | undefined): { requisitos: Requisito[]; sinReconocer: string[]; sinCabecera: boolean } {
  const lineas = (texto ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const requisitos: Requisito[] = [];
  const sinReconocer: string[] = [];
  if (lineas.length === 0) return { requisitos, sinReconocer, sinCabecera: false };
  const primera = norm(lineas[0]);
  const conCabecera = primera.startsWith("requisito") && primera.includes("estado");
  const sep = detectarSeparador(lineas[0]);
  const filas = conCabecera ? lineas.slice(1) : lineas;
  filas.forEach((l, i) => {
    const c = dividirCsv(l, sep);
    if (c.length < 4 || !c[0]) return;
    // Con 5 o más campos: requisito, categoría, tipo, estado y el resto (evidencia, que pudo traer separadores sin comillas).
    const [requisito, categoria, tipo, estado, ...resto] = c;
    const t = tipoDe(tipo);
    const e = estadoDe(estado);
    if (t === null || e === null) sinReconocer.push(requisito);
    requisitos.push({ id: `r${i + 1}`, requisito, categoria: categoria.trim().toLowerCase() || "otros", tipo: t, estado: e, evidencia: resto.join(sep === "," ? ", " : ` ${sep} `).trim() });
  });
  return { requisitos, sinReconocer, sinCabecera: !conCabecera };
}

function palabra(item: string): PalabraClave {
  const partes = item.split("|").map((p) => p.trim());
  const resto = partes.slice(1).join(" | ").replace(/^equivalente en el cv\s*:\s*/i, "").trim();
  const sin = !resto || /^\(?\s*ning[uú]n[oa]?\s*\)?\.?$/i.test(resto);
  return { palabra: partes[0], equivalente: sin ? "" : resto, sinEquivalente: sin };
}

function accion(item: string): AccionPlan {
  const m = item.match(/^\[(CV|ENTREVISTA|APRENDER)\]\s*(.*)$/i);
  return m ? { area: m[1].toUpperCase() as AccionPlan["area"], texto: m[2].trim() } : { area: "OTRO", texto: item };
}

/**
 * Lee la respuesta de «Comparar tu CV con una oferta»: quita cercas de código y negritas, divide por los títulos exactos (con
 * tolerancia a #, mayúsculas, tildes y dos puntos) y lee la tabla de requisitos en CSV (con coma, punto y coma, barra o tabulador).
 */
export function leerRespuestaAnalisis(entrada: string): LecturaAnalisis {
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

  const { requisitos, sinReconocer, sinCabecera } = leerRequisitos(secciones.requisitos);
  const advertencias: string[] = [];
  let problema: string | undefined;
  if (!secciones.requisitos) problema = "No encuentro la sección «Requisitos». Pídele a tu IA que use exactamente los títulos indicados en el prompt.";
  else if (requisitos.length === 0) problema = "La sección «Requisitos» no trae filas que pueda leer. Debe ser un bloque CSV con la cabecera «requisito,categoria,tipo,estado,evidencia» y una fila por requisito.";

  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (t.obligatoria && !(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (sinCabecera) advertencias.push("La tabla de requisitos no traía la cabecera esperada; leí las filas igualmente.");
    if (sinReconocer.length) advertencias.push(`No reconocí el tipo o el estado de ${sinReconocer.length} fila(s): ${sinReconocer.slice(0, 3).map((r) => `«${r}»`).join(", ")}${sinReconocer.length > 3 ? "…" : ""}. Corrígelas en la tabla y el porcentaje se recalcula.`);
  }

  return {
    secciones,
    requisitos,
    palabras: items(secciones.palabras).map(palabra),
    fortalezas: items(secciones.fortalezas),
    brechas: items(secciones.brechas),
    aVerificar: items(secciones.verificar_ia),
    plan: items(secciones.plan).map(accion),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    sinReconocer,
    valido: !problema,
    problema,
    advertencias,
  };
}
