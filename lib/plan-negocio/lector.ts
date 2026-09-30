import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { TITULOS_RESPUESTA, type ClaveRespuesta } from "./tipos";

export interface TablaMarkdown {
  cabecera: string[];
  filas: string[][];
}

export interface LecturaPlanNegocio {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  competencia: TablaMarkdown | null;
  proyeccion: TablaMarkdown | null;
  /** Cuántas veces aparece cada etiqueta en toda la respuesta (para el resumen «Qué revisar»). */
  conteoEtiquetas: { dato: number; calculo: number; supuesto: number };
  /** Es válida si se reconoce al menos el resumen ejecutivo o la descripción del negocio. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["resumen", (c) => c.startsWith("resumen ejecutivo") || c === "resumen"],
  ["descripcion", (c) => c.startsWith("descripcion del negocio")],
  ["problema", (c) => c.startsWith("problema y propuesta de valor") || c.startsWith("problema")],
  ["cliente", (c) => c.startsWith("cliente objetivo")],
  ["mercado", (c) => c.startsWith("analisis de mercado")],
  ["competencia", (c) => c.startsWith("competencia")],
  ["modelo", (c) => c.startsWith("modelo de negocio")],
  ["productos", (c) => c.startsWith("productos y servicios") || c.startsWith("productos/servicios")],
  ["estrategia", (c) => c.startsWith("estrategia comercial")],
  ["operaciones", (c) => c.startsWith("operaciones")],
  ["equipo", (c) => c.startsWith("recursos y equipo") || c.startsWith("equipo")],
  ["inversion", (c) => c.startsWith("inversion inicial")],
  ["costos", (c) => c === "costos" || c.startsWith("costos ")],
  ["proyeccion", (c) => c.startsWith("proyeccion de ingresos")],
  ["equilibrio", (c) => c.startsWith("punto de equilibrio")],
  ["riesgos", (c) => c.startsWith("riesgos")],
  ["plan90", (c) => c.startsWith("plan de accion")],
  ["verificar", (c) => c.startsWith("que debes verificar")],
  ["siguiente", (c) => c.startsWith("siguiente paso")],
];

function tituloDe(linea: string): ClaveRespuesta | null {
  const t = linea.trim();
  if (!t || t.length > 60 || /^\s*[-*•|]/.test(t)) return null;
  const c = norm(t.replace(/^#{1,6}\s*/, ""));
  for (const [clave, f] of RECONOCER) if (f(c)) return clave;
  return null;
}

/** Lee una tabla en formato markdown («| a | b |», con la fila separadora «|---|---|»): cabecera + filas de datos. */
export function leerTablaMarkdown(texto: string | undefined): TablaMarkdown | null {
  const lineas = (texto ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));
  if (lineas.length < 2) return null;
  const celdas = (l: string) =>
    l
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
  const esSeparadora = (l: string) => /^\|?[\s:|-]+\|?$/.test(l) && l.includes("-");
  const cabecera = celdas(lineas[0]);
  const filas = lineas.slice(1).filter((l) => !esSeparadora(l)).map(celdas);
  return { cabecera, filas };
}

const RE_ETIQUETA = /\[(dato del usuario|c[aá]lculo|supuesto)\]/gi;

function contarEtiquetas(texto: string): { dato: number; calculo: number; supuesto: number } {
  const conteo = { dato: 0, calculo: 0, supuesto: 0 };
  for (const m of texto.matchAll(RE_ETIQUETA)) {
    const c = comparable(m[1]);
    if (c.startsWith("dato")) conteo.dato += 1;
    else if (c.startsWith("calculo")) conteo.calculo += 1;
    else if (c.startsWith("supuesto")) conteo.supuesto += 1;
  }
  return conteo;
}

/**
 * Lee la respuesta de Fase B de «Crear un plan de negocio»: quita cercas de código y negritas, divide por los 19 títulos
 * exactos (con tolerancia a #, mayúsculas, tildes y dos puntos) y lee las tablas markdown de competencia y proyección.
 */
export function leerRespuestaPlanNegocio(entrada: string): LecturaPlanNegocio {
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

  const contenido: ClaveRespuesta[] = ["resumen", "descripcion"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0) problema = "No encuentro «## Resumen ejecutivo» ni «## Descripción del negocio». Si tu IA todavía te está haciendo preguntas (Fase A), respóndelas primero y pega el prompt de la Fase B.";

  const competencia = leerTablaMarkdown(secciones.competencia);
  const proyeccion = leerTablaMarkdown(secciones.proyeccion);
  const conteoEtiquetas = contarEtiquetas(Object.values(secciones).join("\n"));

  const advertencias: string[] = [];
  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.competencia && !competencia) advertencias.push("No pude leer la tabla de competencia como tabla markdown.");
    if (secciones.proyeccion && !proyeccion) advertencias.push("No pude leer la tabla de proyección de ingresos como tabla markdown.");
    if (conteoEtiquetas.dato + conteoEtiquetas.calculo + conteoEtiquetas.supuesto === 0) advertencias.push("Ninguna cifra trae la etiqueta «[DATO DEL USUARIO]», «[CÁLCULO]» o «[SUPUESTO]»: pídele a la IA que las use, como pide el prompt.");
  }

  return { secciones, competencia, proyeccion, conteoEtiquetas, valido: !problema, problema, advertencias };
}
