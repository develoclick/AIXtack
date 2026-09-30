import { dividirCsv } from "@/lib/analisis/lector";
import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { MAX_CATEGORIAS, type FilaCatalogo } from "./tipos";

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const NORMALIZAR_ENCABEZADO = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const ALIAS: Record<keyof FilaCatalogo, string[]> = {
  categoria: ["categoria", "categoría"],
  nombreOriginal: ["nombre_original", "nombre original"],
  nombre: ["nombre"],
  descripcion: ["descripcion", "descripción"],
  especificaciones: ["especificaciones"],
  variantes: ["variantes"],
  precio: ["precio"],
  precioPromo: ["precio_promo", "precio promocional", "precio promo"],
  etiqueta: ["etiqueta"],
  cta: ["cta", "llamado a la accion"],
};

function separadorDe(cabecera: string): string {
  return (cabecera.match(/;/g)?.length ?? 0) > (cabecera.match(/,/g)?.length ?? 0) ? ";" : ",";
}

/** Extrae y lee el bloque CSV de catálogo (dentro de la sección «## Catálogo», en una cerca ```csv). */
function leerTablaCatalogo(seccion: string): FilaCatalogo[] {
  const filasCsv = seccion
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^```/.test(l));
  if (filasCsv.length < 2) return [];
  const separador = separadorDe(filasCsv[0]);
  const encabezado = dividirCsv(filasCsv[0], separador).map(NORMALIZAR_ENCABEZADO);
  const indice = (claves: string[]) => encabezado.findIndex((h) => claves.includes(h));
  const indices = Object.fromEntries(Object.entries(ALIAS).map(([campo, alias]) => [campo, indice(alias)])) as Record<keyof FilaCatalogo, number>;
  if (indices.nombreOriginal === -1 && indices.nombre === -1) return [];

  const filas: FilaCatalogo[] = [];
  for (let i = 1; i < filasCsv.length; i++) {
    const c = dividirCsv(filasCsv[i], separador);
    const nombre = (c[indices.nombre] ?? "").trim();
    const nombreOriginal = (indices.nombreOriginal !== -1 ? c[indices.nombreOriginal] : c[indices.nombre] ?? "").trim();
    if (!nombre && !nombreOriginal) continue;
    filas.push({
      categoria: (c[indices.categoria] ?? "").trim(),
      nombreOriginal: nombreOriginal || nombre,
      nombre: nombre || nombreOriginal,
      descripcion: (c[indices.descripcion] ?? "").trim(),
      especificaciones: (c[indices.especificaciones] ?? "").trim(),
      variantes: (c[indices.variantes] ?? "").trim(),
      precio: (c[indices.precio] ?? "").trim(),
      precioPromo: (c[indices.precioPromo] ?? "").trim(),
      etiqueta: (c[indices.etiqueta] ?? "").trim(),
      cta: (c[indices.cta] ?? "").trim(),
    });
  }
  return filas;
}

export type ClaveRespuesta = "catalogo" | "faltantes" | "fotos" | "verificar" | "siguiente";
export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "catalogo", titulo: "Catálogo" },
  { clave: "faltantes", titulo: "Datos faltantes por producto" },
  { clave: "fotos", titulo: "Sugerencias de fotos" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

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
    if (!t) continue;
    const v = t.match(RE_VINETA);
    if (v) salida.push(v[1].trim());
    else if (salida.length) salida[salida.length - 1] += " " + t;
    else salida.push(t);
  }
  return salida;
}

export interface LecturaCatalogo {
  filas: FilaCatalogo[];
  faltantes: string[];
  fotos: string[];
  verificar: string[];
  siguiente: string[];
  categorias: string[];
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

/** Lee la respuesta del prompt de catálogo («## Catálogo» con un bloque CSV, más 4 secciones de texto). Tolera # y negritas. */
export function leerRespuestaCatalogo(entrada: string): LecturaCatalogo {
  const lineasCrudas = (entrada ?? "").replace(/\r\n?/g, "\n").split("\n");
  const acumulado: Partial<Record<ClaveRespuesta, string[]>> = {};
  let actual: ClaveRespuesta | null = null;
  for (const l of lineasCrudas) {
    const sinFormato = l.trim().startsWith("|") || /^```/.test(l.trim()) ? l : quitarFormato(l);
    const clave = tituloDe(sinFormato);
    if (clave && !(clave in acumulado)) {
      actual = clave;
      acumulado[clave] = [];
      continue;
    }
    if (actual) acumulado[actual]!.push(sinFormato);
  }
  const secciones: Partial<Record<ClaveRespuesta, string>> = {};
  for (const [k, v] of Object.entries(acumulado)) secciones[k as ClaveRespuesta] = v!.join("\n").trim();

  if (!(secciones.catalogo ?? "").trim()) {
    return { filas: [], faltantes: [], fotos: [], verificar: [], siguiente: [], categorias: [], valido: false, problema: "No encuentro la sección «## Catálogo». Pega la respuesta completa de tu IA, usando el botón «Copiar» del chat.", advertencias: [] };
  }

  const filas = leerTablaCatalogo(secciones.catalogo!);
  if (filas.length === 0) {
    return { filas: [], faltantes: [], fotos: [], verificar: [], siguiente: [], categorias: [], valido: false, problema: "Encontré la sección «## Catálogo», pero no pude leer su tabla. Pídele a tu IA que la entregue en un bloque de código ```csv, con una fila de encabezado.", advertencias: [] };
  }

  const categorias = [...new Set(filas.map((f) => f.categoria.trim() || "Sin categoría"))];
  const advertencias: string[] = [];
  if (categorias.length > MAX_CATEGORIAS) advertencias.push(`La respuesta trae ${categorias.length} categorías: se pidió un máximo de ${MAX_CATEGORIAS}.`);
  const sinPrecio = filas.filter((f) => !f.precio.trim());
  if (sinPrecio.length > 0) advertencias.push(`${sinPrecio.length} producto(s) no traen precio en la respuesta.`);

  return {
    filas,
    faltantes: items(secciones.faltantes),
    fotos: items(secciones.fotos),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    categorias,
    valido: true,
    advertencias,
  };
}
