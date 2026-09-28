import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { TITULOS_RESPUESTA, type ClaveRespuesta } from "./tipos";

export interface ArgumentoLeido {
  argumento: string;
  evidencia: string;
  relacion: string;
}

export interface RespuestaLeida {
  numero: number;
  tipo: string;
  situacion: string;
  /** Texto listo para decir o enviar (puede ocupar varias líneas). */
  texto: string;
  cuando: string;
}

export interface MargenLeido {
  elemento: string;
  porQue: string;
}

export interface LecturaSalario {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  oferta: string[];
  preguntas: string[];
  cifras: string[];
  argumentos: ArgumentoLeido[];
  respuestas: RespuestaLeida[];
  margen: MargenLeido[];
  checklist: string[];
  verificar: string[];
  siguiente: string[];
  /** Es válida si se reconoce al menos una sección de contenido. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["oferta", (c) => c.startsWith("revision de la oferta")],
  ["preguntas", (c) => c.startsWith("preguntas al reclutador")],
  ["cifras", (c) => c.startsWith("coherencia de mis cifras") || c.startsWith("coherencia de cifras")],
  ["argumentos", (c) => c === "argumentos" || c.startsWith("argumentos ")],
  ["respuestas", (c) => c.startsWith("respuestas preparadas")],
  ["margen", (c) => c.startsWith("si no hay margen")],
  ["checklist", (c) => c.startsWith("checklist")],
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

function argumento(item: string): ArgumentoLeido {
  const p = item.split("|").map((x) => x.trim());
  const limpio = (s: string | undefined, etiqueta: RegExp) => (s ?? "").replace(etiqueta, "").trim();
  return { argumento: p[0], evidencia: limpio(p[1], /^evidencia\s*:\s*/i), relacion: limpio(p.slice(2).join(" | "), /^relaci[oó]n con el puesto\s*:\s*/i) };
}

function margen(item: string): MargenLeido {
  const p = item.split("|").map((x) => x.trim());
  return { elemento: p[0], porQue: p.slice(1).join(" | ") };
}

const RE_RESPUESTA = /^respuesta\s*(\d+)\s*\[([^\]]+)\]\s*[:\-–—]?\s*(.*)$/i;

/** Lee «Respuestas preparadas»: «Respuesta N [Tipo]: «situación»» con «- Texto:» (varias líneas) y «- Cuándo usarla:». */
function respuestas(texto: string | undefined): RespuestaLeida[] {
  if (!texto) return [];
  const salida: RespuestaLeida[] = [];
  let actual: RespuestaLeida | null = null;
  let campo: "texto" | "cuando" | null = null;
  for (const linea of texto.split("\n")) {
    const t = linea.trim();
    const q = t.match(RE_RESPUESTA);
    if (q) {
      actual = { numero: Number(q[1]), tipo: q[2].trim(), situacion: q[3].trim().replace(/^[«"“]|[»"”]$/g, ""), texto: "", cuando: "" };
      salida.push(actual);
      campo = null;
      continue;
    }
    if (!actual) continue;
    const sinVineta = t.replace(/^\s*(?:[-*•·–—+])\s+/, "");
    const m = sinVineta.match(/^(texto|cu[aá]ndo usarla|cu[aá]ndo)\s*:\s*(.*)$/i);
    if (m) {
      campo = norm(m[1]).startsWith("texto") ? "texto" : "cuando";
      actual[campo] = m[2].trim();
    } else if (campo && (t || campo === "texto")) actual[campo] = `${actual[campo]}${actual[campo] ? "\n" : ""}${sinVineta}`.trimEnd();
  }
  return salida.map((r) => ({ ...r, texto: r.texto.replace(/\n{3,}/g, "\n\n").trim() }));
}

/**
 * Lee la respuesta de «Evaluar una oferta y negociar tu salario»: quita cercas de código y negritas, divide por los títulos
 * exactos (con tolerancia a #, mayúsculas, tildes y dos puntos) y convierte cada sección. Las respuestas preparadas se leen como tarjetas.
 */
export function leerRespuestaSalario(entrada: string): LecturaSalario {
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

  const contenido: ClaveRespuesta[] = ["oferta", "preguntas", "cifras", "argumentos", "respuestas", "margen", "checklist"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0) problema = "No encuentro ninguno de los títulos esperados («## Revisión de la oferta», «## Preguntas al reclutador», «## Argumentos»…). Pídele a tu IA que use exactamente los títulos indicados en el prompt.";

  const lista = respuestas(secciones.respuestas);
  const args = items(secciones.argumentos).map(argumento);
  const advertencias: string[] = [];
  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.respuestas && lista.length === 0) advertencias.push("No pude separar las respuestas preparadas en el formato «Respuesta N [Tipo]: …»: se muestran como texto.");
    if (lista.some((r) => !r.texto)) advertencias.push("Alguna respuesta preparada no trae el «Texto:» para decir o enviar.");
    if (secciones.argumentos && args.length !== 5) advertencias.push(`Pedimos 5 argumentos y encontré ${args.length}.`);
  }

  return {
    secciones,
    oferta: items(secciones.oferta),
    preguntas: items(secciones.preguntas),
    cifras: items(secciones.cifras),
    argumentos: args,
    respuestas: lista,
    margen: items(secciones.margen).map(margen),
    checklist: items(secciones.checklist),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: !problema,
    problema,
    advertencias,
  };
}
