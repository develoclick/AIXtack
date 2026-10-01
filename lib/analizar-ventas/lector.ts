import { comparable, quitarFormato } from "@/lib/cv/normalizar";

export type ClaveRespuesta = "calidad" | "metricas" | "evolucion" | "variaciones" | "concentracion" | "hallazgos" | "hipotesis" | "preguntas";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "calidad", titulo: "Calidad de datos" },
  { clave: "metricas", titulo: "Métricas principales" },
  { clave: "evolucion", titulo: "Evolución" },
  { clave: "variaciones", titulo: "Variaciones y su descomposición" },
  { clave: "concentracion", titulo: "Concentración" },
  { clave: "hallazgos", titulo: "Hallazgos" },
  { clave: "hipotesis", titulo: "Hipótesis a investigar" },
  { clave: "preguntas", titulo: "Preguntas siguientes" },
];

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

function tituloDe(linea: string): ClaveRespuesta | null {
  const t = linea.trim();
  if (!t || t.length > 60 || /^\s*[-*•|]/.test(t)) return null;
  const c = norm(t.replace(/^#{1,6}\s*/, ""));
  for (const { clave, titulo } of TITULOS_RESPUESTA) if (c === norm(titulo) || c.startsWith(norm(titulo))) return clave;
  return null;
}

const RE_VINETA = /^\s*(?:[-*•·–—+]|\d+[.)])\s+(.*)$/;

function items(texto: string | undefined): string[] {
  if (!texto) return [];
  const salida: string[] = [];
  for (const l of texto.split("\n")) {
    const t = l.trim();
    if (!t || /^```/.test(t)) continue;
    const v = t.match(RE_VINETA);
    if (v) salida.push(v[1].trim());
    else if (salida.length) salida[salida.length - 1] += " " + t;
    else salida.push(t);
  }
  return salida;
}

export interface FilaMetrica {
  metrica: string;
  valor: string;
}

const quitarComillas = (s: string) => (s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1).replace(/""/g, '"') : s);

/**
 * Lee la tabla «metrica,valor» partiendo cada línea en el PRIMER separador, no con un divisor CSV completo: un monto como
 * «S/ 2,995.80» trae una coma de miles que una IA no siempre encierra entre comillas, y dividirCsv la cortaría ahí.
 */
function leerTablaMetricas(texto: string | undefined): FilaMetrica[] {
  if (!texto) return [];
  const lineas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^```/.test(l));
  if (lineas.length < 2) return [];
  const separador = (lineas[0].match(/;/g)?.length ?? 0) > (lineas[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const encabezado = norm(lineas[0]);
  if (!encabezado.startsWith("metrica")) return [];
  const filas: FilaMetrica[] = [];
  for (const l of lineas.slice(1)) {
    const i = l.indexOf(separador);
    if (i === -1) continue;
    const metrica = quitarComillas(l.slice(0, i).trim());
    const valor = quitarComillas(l.slice(i + 1).trim());
    if (metrica) filas.push({ metrica, valor });
  }
  return filas;
}

const RE_HIPOTESIS = /\[hip[oó]tesis\]/gi;

export interface LecturaAnalisisVentas {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  calidad: string[];
  metricas: FilaMetrica[];
  evolucion: string[];
  variaciones: string[];
  concentracion: string[];
  hallazgos: string[];
  hipotesis: string[];
  preguntas: string[];
  conteoHipotesis: number;
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

/** Lee la respuesta del prompt de análisis de ventas: 8 secciones fijas, con la tabla CSV de «## Métricas principales». Tolera # y negritas. */
export function leerRespuestaAnalisisVentas(entrada: string): LecturaAnalisisVentas {
  const lineas = (entrada ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => (l.trim().startsWith("|") || /^```/.test(l.trim()) ? l : quitarFormato(l)));

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

  const contenido: ClaveRespuesta[] = ["calidad", "metricas", "hallazgos"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0) problema = "No encuentro ninguno de los títulos esperados («## Calidad de datos», «## Métricas principales», «## Hallazgos»…). Pídele a tu IA que use exactamente los títulos indicados en el prompt.";

  const metricas = leerTablaMetricas(secciones.metricas);
  const advertencias: string[] = [];
  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.metricas && metricas.length === 0) advertencias.push("No pude leer la tabla de métricas. Pídele a la IA una tabla CSV con la cabecera metrica,valor.");
  }

  const conteoHipotesis = (secciones.hipotesis ?? "").match(RE_HIPOTESIS)?.length ?? 0;

  return {
    secciones,
    calidad: items(secciones.calidad),
    metricas,
    evolucion: items(secciones.evolucion),
    variaciones: items(secciones.variaciones),
    concentracion: items(secciones.concentracion),
    hallazgos: items(secciones.hallazgos),
    hipotesis: items(secciones.hipotesis),
    preguntas: items(secciones.preguntas),
    conteoHipotesis,
    valido: !problema,
    problema,
    advertencias,
  };
}
