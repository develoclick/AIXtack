import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { TIPOS_GRAFICO, AGREGACIONES, type Agregacion, type EspecificacionGrafico, type TipoGrafico } from "./tipos";

export type ClaveRespuesta = "graficos" | "hallazgos" | "transformaciones" | "guia" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "graficos", titulo: "Gráficos sugeridos" },
  { clave: "hallazgos", titulo: "Hallazgos visibles" },
  { clave: "transformaciones", titulo: "Transformaciones aplicadas" },
  { clave: "guia", titulo: "Qué gráfico usar para cada objetivo" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
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

/** Divide una línea CSV en celdas, tolerando comillas y coma o punto y coma como separador. */
function celdasDeLinea(linea: string, separador: string): string[] {
  const celdas: string[] = [];
  let actual = "";
  let entreComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (entreComillas) {
      if (c === '"' && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else if (c === '"') entreComillas = false;
      else actual += c;
    } else if (c === '"') entreComillas = true;
    else if (c === separador) {
      celdas.push(actual);
      actual = "";
    } else actual += c;
  }
  celdas.push(actual);
  return celdas.map((c) => c.trim());
}

const TIPOS_VALIDOS = new Set<string>(TIPOS_GRAFICO.map((t) => t.valor));
const AGREGACIONES_VALIDAS = new Set<string>(AGREGACIONES.map((a) => a.valor));

function leerTablaGraficos(seccion: string): EspecificacionGrafico[] {
  const filasCsv = seccion
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^```/.test(l));
  if (filasCsv.length < 2) return [];
  const separador = (filasCsv[0].match(/;/g)?.length ?? 0) > (filasCsv[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const encabezado = celdasDeLinea(filasCsv[0], separador).map((h) => h.toLowerCase().trim());
  const indice = (nombre: string) => encabezado.indexOf(nombre);
  const iPregunta = indice("pregunta");
  const iTipo = indice("tipo");
  const iX = indice("x");
  const iY = indice("y");
  const iColor = indice("color");
  const iAgregacion = indice("agregacion");
  const iTitulo = indice("titulo");
  const iAdvertencia = indice("advertencia");
  if (iTipo === -1 || iX === -1) return [];

  const graficos: EspecificacionGrafico[] = [];
  for (let i = 1; i < filasCsv.length; i++) {
    const c = celdasDeLinea(filasCsv[i], separador);
    const x = (c[iX] ?? "").trim();
    if (!x) continue;
    const tipoCrudo = (c[iTipo] ?? "").trim().toLowerCase();
    const agregacionCruda = (c[iAgregacion] ?? "").trim().toLowerCase();
    graficos.push({
      pregunta: iPregunta !== -1 ? (c[iPregunta] ?? "").trim() : "",
      tipo: (TIPOS_VALIDOS.has(tipoCrudo) ? tipoCrudo : "barras") as TipoGrafico,
      x,
      y: iY !== -1 ? (c[iY] ?? "").trim() : "",
      color: iColor !== -1 ? (c[iColor] ?? "").trim() : "",
      agregacion: (AGREGACIONES_VALIDAS.has(agregacionCruda) ? agregacionCruda : "suma") as Agregacion,
      titulo: iTitulo !== -1 ? (c[iTitulo] ?? "").trim() : "",
      advertencia: iAdvertencia !== -1 ? (c[iAdvertencia] ?? "").trim() : "",
    });
  }
  return graficos;
}

export interface LecturaConvertirGraficos {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  graficos: EspecificacionGrafico[];
  hallazgos: string[];
  transformaciones: string[];
  guia: string[];
  verificar: string[];
  siguiente: string[];
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

/** Lee la respuesta del prompt de gráficos: 6 secciones fijas, con la tabla CSV de «## Gráficos sugeridos». Tolera # y negritas. */
export function leerRespuestaConvertirGraficos(entrada: string): LecturaConvertirGraficos {
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

  if (!(secciones.graficos ?? "").trim()) {
    return { secciones, graficos: [], hallazgos: [], transformaciones: [], guia: [], verificar: [], siguiente: [], valido: false, problema: "No encuentro la sección «## Gráficos sugeridos». Pega la respuesta completa de tu IA, usando el botón «Copiar» del chat.", advertencias: [] };
  }

  const graficos = leerTablaGraficos(secciones.graficos!);
  if (graficos.length === 0) {
    return { secciones, graficos: [], hallazgos: [], transformaciones: [], guia: [], verificar: [], siguiente: [], valido: false, problema: "Encontré la sección «## Gráficos sugeridos», pero no pude leer su tabla. Pídele a tu IA que la entregue en un bloque de código ```csv, con una fila de encabezado.", advertencias: [] };
  }

  const advertencias: string[] = [];
  if (graficos.length < 3) advertencias.push(`Solo detecté ${graficos.length} gráfico(s): se pidieron entre 3 y 6.`);
  if (graficos.length > 6) advertencias.push(`Detecté ${graficos.length} gráficos: se pidió un máximo de 6.`);

  return {
    secciones,
    graficos,
    hallazgos: items(secciones.hallazgos),
    transformaciones: items(secciones.transformaciones),
    guia: items(secciones.guia),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: true,
    advertencias,
  };
}
