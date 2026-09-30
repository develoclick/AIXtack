import { dividirCsv } from "@/lib/analisis/lector";
import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { parsearNumero } from "@/lib/presupuesto/calculo";
import { TITULOS_RESPUESTA, type ClaveRespuesta, type FilaPrecio } from "./tipos";

export interface LecturaFechas {
  /** «si», «no» o null si la IA no lo declaró en su primera línea. */
  accesoTiempoReal: "si" | "no" | null;
  secciones: Partial<Record<ClaveRespuesta, string>>;
  filas: FilaPrecio[];
  filasIlegibles: string[];
  sinCabecera: boolean;
  patrones: string[];
  costos: string[];
  antes: string[];
  verificar: string[];
  siguiente: string[];
  /** Es válida si se reconoce al menos una sección de contenido. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["combinaciones", (c) => c === "combinaciones"],
  ["patrones", (c) => c.startsWith("patrones observados") || c === "patrones"],
  ["costos", (c) => c.startsWith("costos no incluidos") || c.startsWith("costes no incluidos")],
  ["antes", (c) => c.startsWith("antes de comprar")],
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

// Sin «\b» tras el grupo: «í» no es un carácter de palabra en JS y el límite fallaría con «sí» (aunque sí funciona con «si»/«no»).
const RE_ACCESO = /^acceso a datos en tiempo real\s*:?\s*(si|sí|no)(?:[^a-záéíóúñ]|$)/i;

/** Lee la tabla de combinaciones consultadas (CSV, 14 columnas). Filas que no calzan exactamente se devuelven aparte. */
export function leerCombinaciones(texto: string | undefined): { filas: FilaPrecio[]; ilegibles: string[]; sinCabecera: boolean } {
  const lineas = (texto ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^[\s|:\-–—]+$/.test(l));
  const filas: FilaPrecio[] = [];
  const ilegibles: string[] = [];
  if (lineas.length === 0) return { filas, ilegibles, sinCabecera: false };
  const limpia = (l: string) => l.replace(/^\|/, "").replace(/\|$/, "");
  const primera = norm(limpia(lineas[0]));
  const conCabecera = primera.startsWith("ida") && primera.includes("consultado");
  const sep = separador(limpia(lineas[0]));
  for (const l of conCabecera ? lineas.slice(1) : lineas) {
    const c = dividirCsv(limpia(l), sep);
    if (c.length !== 14) {
      ilegibles.push(l);
      continue;
    }
    const [ida, vuelta, noches, precioTotal, moneda, precioPorPersona, aerolinea, horarioIda, horarioVuelta, escalas, equipaje, condiciones, fuente, consultadoEn] = c.map((x) => x.trim());
    filas.push({
      ida,
      vuelta,
      noches: /^\d+$/.test(noches) ? Number(noches) : null,
      precioTotal: parsearNumero(precioTotal),
      moneda,
      precioPorPersona: parsearNumero(precioPorPersona),
      aerolinea,
      horarioIda,
      horarioVuelta,
      escalas,
      equipaje,
      condiciones,
      fuente,
      consultadoEn,
      verificada: fuente !== "" && consultadoEn !== "",
    });
  }
  return { filas, ilegibles, sinCabecera: !conCabecera };
}

/**
 * Lee la respuesta de «Fechas más baratas para volar»: la primera línea declara el acceso a datos en tiempo real; luego, quita
 * cercas de código y negritas, divide por los títulos exactos (con tolerancia a #, mayúsculas, tildes y dos puntos) y convierte
 * cada sección (la tabla de «Combinaciones» en filas de precio).
 */
export function leerRespuestaFechas(entrada: string): LecturaFechas {
  const crudas = (entrada ?? "").replace(/\r\n?/g, "\n").split("\n");
  let accesoTiempoReal: "si" | "no" | null = null;
  const sinAcceso = crudas.filter((l) => {
    if (accesoTiempoReal === null) {
      const m = quitarFormato(l).match(RE_ACCESO);
      if (m) {
        accesoTiempoReal = comparable(m[1]).startsWith("si") ? "si" : "no";
        return false;
      }
    }
    return true;
  });
  const lineas = sinAcceso.filter((l) => !/^\s*(?:```|~~~)/.test(l)).map((l) => (l.trim().startsWith("|") ? l : quitarFormato(l)));

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

  // Si no hay ningún título pero el texto ya parece la tabla en sí (por ejemplo, la escribiste o la pegaste a mano, sin la
  // IA), la tratamos directamente como «Combinaciones»: no hace falta el título para el método guiado.
  const primeraNoVacia = lineas.map((l) => l.trim()).find((l) => l);
  const pareceTablaSuelta = Boolean(primeraNoVacia) && norm(primeraNoVacia!.replace(/^\|/, "")).startsWith("ida") && Object.keys(acumulado).length === 0;
  if (pareceTablaSuelta) secciones.combinaciones = lineas.join("\n").trim();

  const contenido: ClaveRespuesta[] = ["combinaciones", "patrones", "costos", "antes"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0 && accesoTiempoReal === null) problema = "No encuentro ninguno de los títulos esperados («## Combinaciones», «## Patrones observados», «## Antes de comprar»…). Si escribiste los precios a mano, empieza con la cabecera ida,vuelta,noches,precio_total,moneda,precio_por_persona,aerolinea,horario_ida,horario_vuelta,escalas,equipaje,condiciones,fuente,consultado_en.";

  const { filas, ilegibles, sinCabecera } = leerCombinaciones(secciones.combinaciones);
  const advertencias: string[] = [];
  if (!problema) {
    if (!pareceTablaSuelta && accesoTiempoReal === null) advertencias.push("La respuesta no declara «ACCESO A DATOS EN TIEMPO REAL» en su primera línea: no puedo confirmar si los precios vienen de una búsqueda real.");
    if (!pareceTablaSuelta) for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.combinaciones && filas.length === 0) advertencias.push("No pude leer la tabla de combinaciones. Usa la cabecera ida,vuelta,noches,precio_total,moneda,precio_por_persona,aerolinea,horario_ida,horario_vuelta,escalas,equipaje,condiciones,fuente,consultado_en.");
    if (filas.length > 0 && sinCabecera) advertencias.push("La tabla de combinaciones no trae la cabecera esperada: la leí igualmente.");
    if (ilegibles.length) advertencias.push(`${ilegibles.length} fila(s) de la tabla no se pudieron leer (revisa que tengan las 14 columnas) y se omitieron.`);
    const sinFuente = filas.filter((f) => !f.verificada).length;
    if (sinFuente) advertencias.push(`${sinFuente} fila(s) no traen fuente o fecha de consulta: se muestran como «no verificadas».`);
  }

  return {
    accesoTiempoReal,
    secciones,
    filas,
    filasIlegibles: ilegibles,
    sinCabecera,
    patrones: items(secciones.patrones),
    costos: items(secciones.costos),
    antes: items(secciones.antes),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: !problema,
    problema,
    advertencias,
  };
}
