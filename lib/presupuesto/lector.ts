import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { TITULOS_RESPUESTA, type ClaveRespuesta } from "./prompt";
import { CATEGORIAS_GASTO, type CategoriaId } from "./tipos";

export interface FaltaLeida {
  categoria: CategoriaId | null;
  /** Texto de categoría tal como lo escribió la IA (si no coincide con ninguna de las 14). */
  categoriaTexto: string;
  concepto: string;
  porQue: string;
  dondeConsultar: string;
}

export interface AhorroLeido {
  idea: string;
  categoria: string;
  cambio: string;
}

export interface ItemNecesidad {
  clase: "necesidad" | "extra" | "sin-clasificar";
  texto: string;
}

export interface LecturaPresupuesto {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  revision: string[];
  faltan: FaltaLeida[];
  necesidades: ItemNecesidad[];
  ahorro: AhorroLeido[];
  margen: { veredicto: "Razonable" | "Bajo" | "Alto" | null; texto: string };
  antes: string[];
  verificar: string[];
  siguiente: string[];
  /** Es válida si se reconoce al menos una de las seis secciones de contenido. */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

/** Cómo se reconoce cada título aunque venga con #, negritas, dos puntos, otra mayúscula o sin tilde. */
const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["revision", (c) => c.startsWith("revision de coherencia") || c === "revision"],
  ["faltan", (c) => c.startsWith("gastos que faltan") || c.startsWith("gastos olvidados")],
  ["necesidades", (c) => c.startsWith("necesidades")],
  ["ahorro", (c) => c.startsWith("ideas de ahorro") || c === "ahorro"],
  ["margen", (c) => c.startsWith("margen de imprevistos") || c === "margen"],
  ["antes", (c) => c.startsWith("antes de reservar")],
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

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

/** Empareja el texto de una categoría con una de las 14 (por nombre completo o por su primera palabra clave). */
export function categoriaDesdeTexto(texto: string): CategoriaId | null {
  const t = norm(texto);
  if (!t) return null;
  for (const c of CATEGORIAS_GASTO) if (norm(c.nombre) === t || c.id.replace(/-/g, " ") === t) return c.id;
  for (const c of CATEGORIAS_GASTO) {
    const n = norm(c.nombre);
    if (t.startsWith(n) || n.startsWith(t)) return c.id;
  }
  const claves: [string, CategoriaId][] = [
    ["vuelo", "transporte-principal"],
    ["pasaje", "transporte-principal"],
    ["traslado", "traslados"],
    ["aloja", "alojamiento"],
    ["hotel", "alojamiento"],
    ["comida", "comidas"],
    ["local", "transporte-local"],
    ["actividad", "actividades"],
    ["entrada", "actividades"],
    ["seguro", "seguro"],
    ["equipaje", "equipaje"],
    ["documento", "documentos"],
    ["visa", "documentos"],
    ["tasa", "documentos"],
    ["compra", "compras"],
    ["conectividad", "conectividad"],
    ["sim", "conectividad"],
    ["propina", "propinas"],
    ["comision", "comisiones"],
    ["cambio", "comisiones"],
  ];
  for (const [k, id] of claves) if (t.includes(k)) return id;
  return null;
}

function falta(item: string): FaltaLeida {
  const partes = item.split("|").map((p) => p.trim());
  if (partes.length === 1) return { categoria: null, categoriaTexto: "", concepto: partes[0], porQue: "", dondeConsultar: "" };
  const [cat, concepto, porQue] = partes;
  return { categoria: categoriaDesdeTexto(cat), categoriaTexto: cat, concepto: concepto ?? "", porQue: porQue ?? "", dondeConsultar: partes.slice(3).join(" | ") };
}

function ahorro(item: string): AhorroLeido {
  const partes = item.split("|").map((p) => p.trim());
  return { idea: partes[0] ?? item, categoria: partes[1] ?? "", cambio: partes.slice(2).join(" | ") };
}

function necesidad(item: string): ItemNecesidad {
  const m = item.match(/^(necesidad(?:es)?|extra(?:s)?)\s*[:\-–—]\s*(.*)$/i);
  if (!m) return { clase: "sin-clasificar", texto: item };
  return { clase: comparable(m[1]).startsWith("necesidad") ? "necesidad" : "extra", texto: m[2].trim() };
}

/**
 * Lee la respuesta de «Presupuesto de viaje»: quita cercas de código, enlaces y negritas, divide por los títulos exactos (con
 * tolerancia a #, mayúsculas, tildes y dos puntos) y convierte cada sección. Nada se inventa: lo que no se reconoce queda como texto.
 */
export function leerRespuestaPresupuesto(entrada: string): LecturaPresupuesto {
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

  const contenido: ClaveRespuesta[] = ["revision", "faltan", "necesidades", "ahorro", "margen", "antes"];
  const encontradas = contenido.filter((k) => k in secciones && (secciones[k] ?? "").length > 0);
  const advertencias: string[] = [];
  let problema: string | undefined;
  if (encontradas.length === 0) problema = "No encuentro ninguno de los títulos esperados («## Revisión de coherencia», «## Gastos que faltan», «## Necesidades vs extras»…). Pídele a tu IA que use exactamente los títulos indicados en el prompt.";

  const textoMargen = secciones.margen ?? "";
  const v = textoMargen.match(/veredicto\s*:?\s*(razonable|bajo|alto)/i);
  const veredicto = v ? ((v[1][0].toUpperCase() + v[1].slice(1).toLowerCase()) as "Razonable" | "Bajo" | "Alto") : null;
  const listaAhorro = items(secciones.ahorro);

  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
    if (secciones.ahorro && listaAhorro.length !== 5) advertencias.push(`Pedimos 5 ideas de ahorro y encontré ${listaAhorro.length}.`);
    if (secciones.margen && !veredicto) advertencias.push("La sección «Margen de imprevistos» no empieza con «Veredicto: Razonable, Bajo o Alto»: se muestra como texto.");
  }

  return {
    secciones,
    revision: items(secciones.revision),
    faltan: items(secciones.faltan).map(falta),
    necesidades: items(secciones.necesidades).map(necesidad),
    ahorro: listaAhorro.map(ahorro),
    margen: { veredicto, texto: textoMargen.replace(/^\s*veredicto\s*:?\s*(razonable|bajo|alto)\s*[.:\-–—]?\s*/i, "").trim() },
    antes: items(secciones.antes),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: !problema,
    problema,
    advertencias,
  };
}
