import { dividirCsv } from "@/lib/analisis/lector";
import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import type { FilaDistribucion } from "./calculo";
import { DIAS, TITULOS_RESPUESTA, type ClaveRespuesta, type FilaPlan } from "./tipos";

export interface PlantillaLeida {
  numero: number;
  tipo: string;
  situacion: string;
  /** Mensaje listo para enviar (puede ocupar varias líneas). */
  texto: string;
  cuando: string;
}

export interface VacantePriorizada {
  vacante: string;
  prioridad: "alta" | "media" | "baja" | null;
  motivo: string;
  antes: string;
}

export interface EvitarLeido {
  actividad: string;
  porQueParece: string;
  enSuLugar: string;
}

export interface LecturaPlan {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  objetivo: string;
  alternativas: string[];
  distribucion: FilaDistribucion[];
  plan: FilaPlan[];
  /** Líneas de la tabla que no se pudieron leer como una tarea. */
  filasIlegibles: string[];
  sinCabecera: boolean;
  criterios: string[];
  vacantes: VacantePriorizada[];
  evitar: EvitarLeido[];
  plantillas: PlantillaLeida[];
  metricas: string[];
  verificar: string[];
  siguiente: string[];
  /** Es válida si se reconoce al menos una sección de contenido. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["objetivo", (c) => c === "objetivo" || c.startsWith("objetivo de busqueda") || c.startsWith("objetivo profesional")],
  ["distribucion", (c) => c.startsWith("distribucion semanal") || c.startsWith("distribucion del tiempo")],
  ["plan", (c) => c.startsWith("plan de 4 semanas") || c.startsWith("plan de cuatro semanas")],
  ["criterios", (c) => c.startsWith("criterios y priorizacion") || c.startsWith("criterios de postulacion") || c === "criterios"],
  ["evitar", (c) => c.startsWith("lo que no debo hacer") || c.startsWith("que no hacer")],
  ["plantillas", (c) => c.startsWith("plantillas")],
  ["metricas", (c) => c.startsWith("como leer mis metricas") || c.startsWith("como leer las metricas")],
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

const sinEtiqueta = (s: string | undefined, etiqueta: RegExp) => (s ?? "").replace(etiqueta, "").trim();

/** «10 %», «7,5», «7.5 por ciento» → número; null si no hay ninguno. */
function porcentajeDe(texto: string): number | null {
  const m = texto.match(/(\d+(?:[.,]\d+)?)/);
  return m ? Number(m[1].replace(",", ".")) : null;
}

function distribucion(texto: string | undefined): FilaDistribucion[] {
  return items(texto).flatMap((i) => {
    const p = i.split("|").map((x) => x.trim());
    if (p.length < 2 || !p[0]) return [];
    return [{ actividad: p[0], porcentaje: porcentajeDe(p[1]), porQue: p.slice(2).join(" | ") }];
  });
}

function diaIdx(dia: string): number {
  const c = norm(dia);
  return DIAS.findIndex((d) => norm(d) === c || norm(d).slice(0, 3) === c.slice(0, 3));
}

function separador(cabecera: string): string {
  return [",", ";", "|", "\t"].map((s) => ({ s, n: cabecera.split(s).length })).sort((a, b) => b.n - a.n)[0].s;
}

/**
 * Lee la tabla del plan (CSV, o tabla con barras verticales): semana, día, tarea, entregable y minutos. Tolera comas sin comillas
 * dentro de la tarea (la semana y el día son los dos primeros campos; los minutos y el entregable, los dos últimos).
 */
export function leerPlan(texto: string | undefined): { plan: FilaPlan[]; ilegibles: string[]; sinCabecera: boolean } {
  const lineas = (texto ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^[\s|:\-–—]+$/.test(l));
  const plan: FilaPlan[] = [];
  const ilegibles: string[] = [];
  if (lineas.length === 0) return { plan, ilegibles, sinCabecera: false };
  const limpia = (l: string) => l.replace(/^\|/, "").replace(/\|$/, "");
  const primera = norm(limpia(lineas[0]));
  const conCabecera = primera.startsWith("semana") && primera.includes("minutos");
  const sep = separador(limpia(lineas[0]));
  for (const l of conCabecera ? lineas.slice(1) : lineas) {
    const c = dividirCsv(limpia(l), sep);
    if (c.length < 5) {
      ilegibles.push(l);
      continue;
    }
    const semana = Number((c[0].match(/\d+/) ?? [""])[0]);
    const minutosTexto = c[c.length - 1].match(/\d+(?:[.,]\d+)?/);
    const minutos = minutosTexto ? Math.round(Number(minutosTexto[0].replace(",", "."))) : null;
    if (!Number.isInteger(semana) || semana < 1) {
      ilegibles.push(l);
      continue;
    }
    plan.push({ semana, dia: c[1], diaIdx: diaIdx(c[1]), tarea: c.slice(2, c.length - 2).join(sep === "," ? ", " : ` ${sep} `).trim(), entregable: c[c.length - 2], minutos });
  }
  return { plan, ilegibles, sinCabecera: !conCabecera };
}

function vacante(item: string): VacantePriorizada {
  const p = item.split("|").map((x) => x.trim());
  const nombre = sinEtiqueta(p[0], /^vacante\s*:\s*/i);
  const pr = norm(sinEtiqueta(p[1], /^prioridad\s*:\s*/i));
  const prioridad = pr.startsWith("alta") ? "alta" : pr.startsWith("media") ? "media" : pr.startsWith("baja") ? "baja" : null;
  const resto = p.slice(2);
  const motivo = sinEtiqueta(resto.find((x) => /^motivo\s*:/i.test(x)) ?? resto[0], /^motivo\s*:\s*/i);
  const antes = sinEtiqueta(resto.find((x) => /^antes de postular\s*:/i.test(x)), /^antes de postular\s*:\s*/i);
  return { vacante: nombre, prioridad, motivo, antes };
}

function evitar(item: string): EvitarLeido {
  const p = item.split("|").map((x) => x.trim());
  return { actividad: p[0], porQueParece: p[1] ?? "", enSuLugar: p.slice(2).join(" | ") };
}

const RE_PLANTILLA = /^plantilla\s*(\d+)\s*\[([^\]]+)\]\s*[:\-–—]?\s*(.*)$/i;

/** Lee «Plantillas»: «Plantilla N [Tipo]: «situación»» con «- Texto:» (varias líneas) y «- Cuándo usarla:». */
function plantillas(texto: string | undefined): PlantillaLeida[] {
  if (!texto) return [];
  const salida: PlantillaLeida[] = [];
  let actual: PlantillaLeida | null = null;
  let campo: "texto" | "cuando" | null = null;
  for (const linea of texto.split("\n")) {
    const t = linea.trim();
    const q = t.match(RE_PLANTILLA);
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
 * Lee la respuesta de «Plan de búsqueda de empleo»: quita cercas de código y negritas, divide por los títulos exactos (con
 * tolerancia a #, mayúsculas, tildes y dos puntos) y convierte cada sección (la tabla del plan en filas; las plantillas en tarjetas).
 */
export function leerRespuestaPlan(entrada: string): LecturaPlan {
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

  const contenido: ClaveRespuesta[] = ["objetivo", "distribucion", "plan", "criterios", "evitar", "plantillas", "metricas"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0) problema = "No encuentro ninguno de los títulos esperados («## Objetivo», «## Distribución semanal», «## Plan de 4 semanas»…). Pídele a tu IA que use exactamente los títulos indicados en el prompt.";

  const objetivoItems = items(secciones.objetivo);
  const principal = objetivoItems.find((i) => /^objetivo\s*:/i.test(i)) ?? objetivoItems.find((i) => !/^alternativa/i.test(i)) ?? "";
  const alternativas = objetivoItems.filter((i) => /^alternativa/i.test(i)).map((i) => i.replace(/^alternativa\s*\d*\s*:\s*/i, "").trim());
  const { plan, ilegibles, sinCabecera } = leerPlan(secciones.plan);
  const criterioItems = items(secciones.criterios);
  const vacantes = criterioItems.filter((i) => /^vacante\s*:/i.test(i)).map(vacante);
  const criterios = criterioItems.filter((i) => !/^vacante\s*:/i.test(i)).map((i) => i.replace(/^criterio\s*:\s*/i, "").trim());
  const lista = plantillas(secciones.plantillas);
  const dist = distribucion(secciones.distribucion);

  const advertencias: string[] = [];
  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.plan && plan.length === 0) advertencias.push("No pude leer la tabla del plan. Pídele a la IA una tabla CSV con la cabecera semana,dia,tarea,entregable,minutos.");
    if (plan.length > 0 && sinCabecera) advertencias.push("La tabla del plan no trae la cabecera «semana,dia,tarea,entregable,minutos»: la leí igualmente.");
    if (ilegibles.length) advertencias.push(`${ilegibles.length} línea(s) de la tabla del plan no se pudieron leer y se omitieron.`);
    if (secciones.plantillas && lista.length === 0) advertencias.push("No pude separar las plantillas en el formato «Plantilla N [Tipo]: …»: se muestran como texto.");
    if (lista.some((r) => !r.texto)) advertencias.push("Alguna plantilla no trae el «Texto:» para enviar.");
  }

  return {
    secciones,
    objetivo: principal.replace(/^objetivo\s*:\s*/i, "").trim(),
    alternativas,
    distribucion: dist,
    plan,
    filasIlegibles: ilegibles,
    sinCabecera,
    criterios,
    vacantes,
    evitar: items(secciones.evitar).map(evitar),
    plantillas: lista,
    metricas: items(secciones.metricas),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: !problema,
    problema,
    advertencias,
  };
}
