import { dividirCsv } from "@/lib/analisis/lector";
import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { parsearNumero } from "@/lib/presupuesto/calculo";
import { MAX_DESTINOS, TITULOS_RESPUESTA, type ClaveRespuesta, type FilaDestino, type TipoDato } from "./tipos";

export interface LecturaDestinos {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  accesoPrecios: "si" | "no" | null;
  filas: FilaDestino[];
  filasIlegibles: string[];
  sinCabecera: boolean;
  gastos: string[];
  recomendaciones: string[];
  verificar: string[];
  siguiente: string[];
  /** Es válida si se reconoce al menos una sección de contenido. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["destinos", (c) => c.startsWith("destinos candidatos") || c === "destinos"],
  ["gastos", (c) => c.startsWith("gastos que podrian encarecer") || c.startsWith("gastos")],
  ["recomendaciones", (c) => c.startsWith("recomendaciones para ahorrar") || c.startsWith("recomendaciones")],
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

function tipoDatoDe(v: string): TipoDato | null {
  const c = norm(v);
  if (c === "real" || c.startsWith("dato real")) return "real";
  if (c.startsWith("estimacion") || c.startsWith("estimado")) return "estimacion";
  if (c.startsWith("sin dato") || c === "sindato" || c === "ninguno") return "sin_dato";
  return null;
}

/** Sin «\b» tras el grupo: «í» no es un carácter de palabra en JS y el límite fallaría con «sí» (aunque sí funciona con «si»/«no»). */
const RE_ACCESO = /^acceso a precios actualizados\s*:?\s*(si|sí|no)(?:[^a-záéíóúñ]|$)/i;

/** Lee la tabla de «Destinos candidatos» (CSV o tabla con barras verticales). Exige al menos 6 campos por fila (destino, fechas, noches, pasaje_pp, alojamiento_noche y algo más); las filas que no calzan se devuelven aparte. */
export function leerDestinos(texto: string | undefined): { filas: FilaDestino[]; ilegibles: string[]; sinCabecera: boolean } {
  const lineas = (texto ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^[\s|:\-–—]+$/.test(l));
  const filas: FilaDestino[] = [];
  const ilegibles: string[] = [];
  if (lineas.length === 0) return { filas, ilegibles, sinCabecera: false };
  const limpia = (l: string) => l.replace(/^\|/, "").replace(/\|$/, "");
  const primera = norm(limpia(lineas[0]));
  const conCabecera = primera.startsWith("destino") && (primera.includes("pasaje") || primera.includes("noches"));
  const sep = separador(limpia(lineas[0]));
  for (const l of (conCabecera ? lineas.slice(1) : lineas).slice(0, MAX_DESTINOS * 2)) {
    const c = dividirCsv(limpia(l), sep);
    if (c.length < 6 || !c[0]) {
      ilegibles.push(l);
      continue;
    }
    const [destino, fechas, nochesTxt, pasajeTxt, alojamientoTxt, totalTxt, fuentePasaje, fuenteAlojamiento, consultadoEn, tipoDatoTxt] = c;
    const noches = parsearNumero(nochesTxt);
    const { tipo, texto: tipoTexto } = { tipo: tipoDatoDe(tipoDatoTxt ?? ""), texto: (tipoDatoTxt ?? "").trim() };
    filas.push({
      destino: destino.trim(),
      fechas: (fechas ?? "").trim(),
      noches: noches !== null && Number.isInteger(noches) && noches >= 0 ? noches : null,
      pasajePorPersona: parsearNumero(pasajeTxt ?? ""),
      alojamientoPorNoche: parsearNumero(alojamientoTxt ?? ""),
      totalDeclarado: parsearNumero(totalTxt ?? ""),
      fuentePasaje: (fuentePasaje ?? "").trim(),
      fuenteAlojamiento: (fuenteAlojamiento ?? "").trim(),
      consultadoEn: (consultadoEn ?? "").trim(),
      tipoDato: tipo,
      tipoDatoTexto: tipoTexto,
    });
  }
  return { filas: filas.slice(0, MAX_DESTINOS), ilegibles, sinCabecera: !conCabecera };
}

/**
 * Lee la respuesta de «Descubrir destinos según tu presupuesto»: quita cercas de código y negritas, extrae la línea de acceso
 * a precios, divide por los títulos exactos (con tolerancia a #, mayúsculas, tildes y dos puntos) y lee la tabla de destinos.
 * Tolera una tabla suelta (sin título ni línea de acceso) para quien escribe los destinos a mano tras el método guiado.
 */
export function leerRespuestaDestinos(entrada: string): LecturaDestinos {
  const lineas = (entrada ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => !/^\s*(?:```|~~~)/.test(l))
    .map((l) => (l.trim().startsWith("|") ? l : quitarFormato(l)));

  let accesoPrecios: "si" | "no" | null = null;
  const crudas = lineas.filter((l) => {
    if (accesoPrecios === null) {
      const m = quitarFormato(l).match(RE_ACCESO);
      if (m) {
        accesoPrecios = comparable(m[1]).startsWith("si") ? "si" : "no";
        return false;
      }
    }
    return true;
  });

  const acumulado: Partial<Record<ClaveRespuesta, string[]>> = {};
  let actual: ClaveRespuesta | null = null;
  for (const l of crudas) {
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

  const primeraNoVacia = crudas.map((l) => l.trim()).find((l) => l);
  const pareceTablaSuelta = Boolean(primeraNoVacia) && norm(primeraNoVacia!.replace(/^\|/, "")).startsWith("destino") && Object.keys(acumulado).length === 0;
  if (pareceTablaSuelta) secciones.destinos = crudas.join("\n").trim();

  let problema: string | undefined;
  if (!secciones.destinos) problema = "No encuentro la sección «Destinos candidatos» ni una tabla que empiece por «destino,…». Pídele a tu IA que use exactamente los títulos indicados en el prompt.";

  const { filas, ilegibles, sinCabecera } = leerDestinos(secciones.destinos);
  const advertencias: string[] = [];
  if (!problema) {
    if (!pareceTablaSuelta) for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (!pareceTablaSuelta && accesoPrecios === null) advertencias.push("No encontré la línea «ACCESO A PRECIOS ACTUALIZADOS: sí/no»: no sé si estos precios vienen de una búsqueda real.");
    if (filas.length === 0) advertencias.push("No pude leer ninguna fila de destinos. Revisa que la tabla tenga al menos destino, fechas, noches, pasaje por persona y alojamiento por noche.");
    if (filas.length > 0 && sinCabecera && !pareceTablaSuelta) advertencias.push("La tabla de destinos no trae la cabecera esperada: la leí igualmente.");
    if (ilegibles.length) advertencias.push(`${ilegibles.length} línea(s) de la tabla no se pudieron leer y se omitieron.`);
    const sinTipo = filas.filter((f) => f.tipoDato === null && f.tipoDatoTexto).length;
    if (sinTipo) advertencias.push(`No reconocí el tipo de dato de ${sinTipo} fila(s) (debería ser real, estimación o sin dato).`);
  }

  return {
    secciones,
    accesoPrecios,
    filas,
    filasIlegibles: ilegibles,
    sinCabecera,
    gastos: items(secciones.gastos),
    recomendaciones: items(secciones.recomendaciones),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: !problema,
    problema,
    advertencias,
  };
}
