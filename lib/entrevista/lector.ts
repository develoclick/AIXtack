import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { TITULOS_BANCO, TITULOS_SIMULACION, type ClaveRespuesta } from "./tipos";

export interface FilaMapa {
  etiqueta: string;
  texto: string;
}

export interface Riesgo {
  tipo: string;
  /** Fragmento del CV citado entre « » (si lo hay). */
  fragmento?: string;
  texto: string;
}

export interface PreguntaLeida {
  numero: number;
  categoria: string;
  texto: string;
  evalua: string;
  experiencia: string;
  estructura: string;
  repregunta: string;
}

export interface TemaLeido {
  prioridad: "ALTA" | "MEDIA" | "BAJA" | null;
  tema: string;
  porQue: string;
}

export interface EvaluacionLeida {
  pregunta: string;
  categoria: string;
  criterios: { nombre: string; valor: string }[];
  comentario: string;
}

export interface InformeLeido {
  resumen: string;
  evaluaciones: EvaluacionLeida[];
  fortalezas: string[];
  debiles: string[];
  plan: string[];
}

export interface LecturaEntrevista {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  mapa: FilaMapa[];
  riesgos: Riesgo[];
  preguntas: PreguntaLeida[];
  temas: TemaLeido[];
  entrevistador: string[];
  informe: InformeLeido | null;
  verificar: string[];
  siguiente: string[];
  /** Es válida si se reconoce al menos una sección de contenido. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["mapa", (c) => c.startsWith("mapa del puesto") || c === "mapa"],
  ["riesgos", (c) => c.startsWith("riesgos del cv") || c === "riesgos"],
  ["banco", (c) => c.startsWith("banco de preguntas")],
  ["temas", (c) => c.startsWith("temas a estudiar")],
  ["entrevistador", (c) => c.startsWith("preguntas para el entrevistador") || c.startsWith("preguntas inteligentes")],
  ["informe", (c) => c.startsWith("informe de simulacion") || c === "informe"],
  ["verificar", (c) => c.startsWith("que debes verificar") || c.startsWith("afirmaciones que debes verificar")],
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

export function items(texto: string | undefined): string[] {
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

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

function mapa(texto: string | undefined): FilaMapa[] {
  return items(texto).map((i) => {
    const m = i.match(/^([^:]{2,60}):\s*(.*)$/);
    return m ? { etiqueta: m[1].trim(), texto: m[2].trim() } : { etiqueta: "", texto: i };
  });
}

function riesgo(item: string): Riesgo {
  const m = item.match(/^\[([^\]]+)\]\s*(.*)$/);
  const tipo = m ? m[1].trim().toUpperCase() : "OTRO";
  const resto = m ? m[2] : item;
  const f = resto.match(/[«"“]([^»"”]+)[»"”]/);
  return { tipo, fragmento: f?.[1].trim(), texto: resto.trim() };
}

function tema(item: string): TemaLeido {
  const m = item.match(/^\[(alta|media|baja)\]\s*(.*)$/i);
  const prioridad = m ? (m[1].toUpperCase() as TemaLeido["prioridad"]) : null;
  const resto = m ? m[2] : item;
  const partes = resto.split(/\s+[—–-]\s+/);
  return { prioridad, tema: partes[0].trim(), porQue: partes.slice(1).join(" — ").trim() };
}

const RE_PREGUNTA = /^(?:pregunta\s*)?(\d+)\s*[.):]?\s*\[([^\]]+)\]\s*[:\-–—]?\s*(.+)$/i;

/** Lee el banco: «Pregunta N [Categoría]: texto» seguido de viñetas «Qué evalúa / Experiencia real del CV / Estructura sugerida / Repregunta». */
function preguntas(texto: string | undefined): PreguntaLeida[] {
  if (!texto) return [];
  const salida: PreguntaLeida[] = [];
  let actual: PreguntaLeida | null = null;
  let campo: "evalua" | "experiencia" | "estructura" | "repregunta" | null = null;
  for (const linea of texto.split("\n")) {
    const t = linea.trim();
    if (!t) continue;
    const q = t.match(RE_PREGUNTA);
    if (q) {
      actual = { numero: Number(q[1]), categoria: q[2].trim(), texto: q[3].trim(), evalua: "", experiencia: "", estructura: "", repregunta: "" };
      salida.push(actual);
      campo = null;
      continue;
    }
    if (!actual) continue;
    const sinVineta = t.replace(/^\s*(?:[-*•·–—+])\s+/, "");
    const m = sinVineta.match(/^(qu[eé] eval[uú]a|experiencia(?: real)?(?: del cv)?|estructura(?: sugerida)?(?:\s*\([^)]*\))?|repregunta(?: probable)?)\s*:\s*(.*)$/i);
    if (m) {
      const k = norm(m[1]);
      campo = k.startsWith("que evalua") ? "evalua" : k.startsWith("experiencia") ? "experiencia" : k.startsWith("estructura") ? "estructura" : "repregunta";
      actual[campo] = m[2].trim();
    } else if (campo) actual[campo] = `${actual[campo]} ${sinVineta}`.trim();
    else actual.texto = `${actual.texto} ${sinVineta}`.trim();
  }
  return salida;
}

const CRITERIOS = ["claridad", "evidencia", "relacion con el puesto", "duracion"];

function evaluacion(item: string): EvaluacionLeida | null {
  const partes = item.split("|").map((p) => p.trim());
  if (partes.length < 3 || !/^pregunta\s*\d+/i.test(partes[0])) return null;
  const criterios: EvaluacionLeida["criterios"] = [];
  let comentario = "";
  let categoria = "";
  for (const p of partes.slice(1)) {
    const m = p.match(/^([^:]{2,40}):\s*(.*)$/);
    if (m && CRITERIOS.some((c) => norm(m[1]).startsWith(c))) criterios.push({ nombre: m[1].trim(), valor: m[2].trim() });
    else if (m && norm(m[1]).startsWith("comentario")) comentario = m[2].trim();
    else if (!categoria && !m) categoria = p;
  }
  return { pregunta: partes[0], categoria, criterios, comentario };
}

/** Lee el informe de la simulación: resumen, evaluación por pregunta y las listas «Fortalezas», «Puntos débiles» y «Plan de práctica». */
function informe(texto: string | undefined): InformeLeido | null {
  if (!texto) return null;
  const listas: Record<"evaluaciones" | "fortalezas" | "debiles" | "plan", string[]> = { evaluaciones: [], fortalezas: [], debiles: [], plan: [] };
  const resumen: string[] = [];
  let actual: keyof typeof listas | "resumen" = "resumen";
  const bloques: Record<keyof typeof listas, string[]> = { evaluaciones: [], fortalezas: [], debiles: [], plan: [] };
  for (const linea of texto.split("\n")) {
    const t = linea.trim();
    if (!t) continue;
    const c = norm(t.replace(/^[-*•]\s+/, ""));
    const cabecera = c.match(/^(evaluacion por pregunta|fortalezas|puntos debiles|plan de practica)\s*:?\s*(.*)$/);
    if (cabecera && !/^\s*[-*•]\s+pregunta/i.test(t)) {
      actual = cabecera[1].startsWith("evaluacion") ? "evaluaciones" : cabecera[1].startsWith("fortalezas") ? "fortalezas" : cabecera[1].startsWith("puntos") ? "debiles" : "plan";
      const resto = t.replace(/^[-*•]?\s*[^:]+:\s*/, "");
      if (resto && resto !== t) bloques[actual].push(`- ${resto}`);
      continue;
    }
    if (actual === "resumen") resumen.push(t.replace(/^resumen\s*:\s*/i, ""));
    else bloques[actual].push(linea);
  }
  listas.evaluaciones = items(bloques.evaluaciones.join("\n"));
  listas.fortalezas = items(bloques.fortalezas.join("\n"));
  listas.debiles = items(bloques.debiles.join("\n"));
  listas.plan = items(bloques.plan.join("\n"));
  return {
    resumen: resumen.join(" "),
    evaluaciones: listas.evaluaciones.map(evaluacion).filter((e): e is EvaluacionLeida => e !== null),
    fortalezas: listas.fortalezas,
    debiles: listas.debiles,
    plan: listas.plan,
  };
}

/**
 * Lee la respuesta de «Preparar una entrevista»: quita cercas de código y negritas, divide por los títulos exactos (con tolerancia
 * a #, mayúsculas, tildes y dos puntos) y convierte cada sección. Acepta el formato del banco y el del informe de simulación.
 */
export function leerRespuestaEntrevista(entrada: string): LecturaEntrevista {
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

  const contenido: ClaveRespuesta[] = ["mapa", "riesgos", "banco", "temas", "entrevistador", "informe"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0) problema = "No encuentro ninguno de los títulos esperados («## Mapa del puesto», «## Banco de preguntas», «## Informe de simulación»…). Pídele a tu IA que use exactamente los títulos indicados en el prompt.";

  const lista = preguntas(secciones.banco);
  const inf = informe(secciones.informe);
  const advertencias: string[] = [];
  if (!problema) {
    const esperados = secciones.informe !== undefined ? TITULOS_SIMULACION : TITULOS_BANCO;
    for (const t of esperados) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.banco && lista.length === 0) advertencias.push("No pude separar las preguntas del banco en el formato «Pregunta N [Categoría]: …»: se muestran como texto.");
    if (inf && inf.evaluaciones.length === 0 && (secciones.informe ?? "").length > 0) advertencias.push("No pude leer la «Evaluación por pregunta» del informe: se muestra el texto completo.");
  }

  return {
    secciones,
    mapa: mapa(secciones.mapa),
    riesgos: items(secciones.riesgos).map(riesgo),
    preguntas: lista,
    temas: items(secciones.temas).map(tema),
    entrevistador: items(secciones.entrevistador),
    informe: inf,
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: !problema,
    problema,
    advertencias,
  };
}
