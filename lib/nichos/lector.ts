import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { nuevoId, type Nicho } from "./tipos";

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

const NORMALIZAR_ENCABEZADO = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const ALIAS: Record<keyof Omit<Nicho, "id">, string[]> = {
  nombre: ["nombre", "nicho"],
  cliente: ["cliente", "cliente objetivo"],
  problema: ["problema"],
  oferta: ["oferta", "oferta posible"],
  competencia: ["competencia"],
  canales: ["canales", "canales de adquisicion"],
  monetizacion: ["monetizacion", "monetización"],
  recursos: ["recursos", "recursos necesarios"],
  entrada: ["entrada", "facilidad de entrada"],
  inversion: ["inversion", "inversión"],
  recurrencia: ["recurrencia"],
  diferenciacion: ["diferenciacion", "diferenciación"],
  encaje: ["encaje"],
  justificacion: ["justificacion", "justificación"],
};

const CAMPOS_NUMERICOS: (keyof Nicho)[] = ["entrada", "inversion", "recurrencia", "diferenciacion", "encaje"];

/** Extrae y lee el bloque CSV de nichos (dentro de la sección «## Nichos», en una cerca ```csv). */
function leerTablaNichos(seccion: string): Nicho[] {
  const filasCsv = seccion
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^```/.test(l));
  if (filasCsv.length < 2) return [];
  const separador = (filasCsv[0].match(/;/g)?.length ?? 0) > (filasCsv[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const encabezado = celdasDeLinea(filasCsv[0], separador).map(NORMALIZAR_ENCABEZADO);
  const indice = (claves: string[]) => encabezado.findIndex((h) => claves.includes(h));
  const indices = Object.fromEntries(Object.entries(ALIAS).map(([campo, alias]) => [campo, indice(alias)])) as Record<keyof Omit<Nicho, "id">, number>;
  if (indices.nombre === -1) return [];

  const nichos: Nicho[] = [];
  for (let i = 1; i < filasCsv.length; i++) {
    const c = celdasDeLinea(filasCsv[i], separador);
    const nombre = (c[indices.nombre] ?? "").trim();
    if (!nombre) continue;
    const num = (campo: keyof Nicho) => {
      const v = Number((c[indices[campo as keyof Omit<Nicho, "id">]] ?? "").replace(",", "."));
      return Number.isFinite(v) ? Math.min(5, Math.max(1, Math.round(v))) : 0;
    };
    nichos.push({
      id: nuevoId("n"),
      nombre,
      cliente: (c[indices.cliente] ?? "").trim(),
      problema: (c[indices.problema] ?? "").trim(),
      oferta: (c[indices.oferta] ?? "").trim(),
      competencia: (c[indices.competencia] ?? "").trim(),
      canales: (c[indices.canales] ?? "").trim(),
      monetizacion: (c[indices.monetizacion] ?? "").trim(),
      recursos: (c[indices.recursos] ?? "").trim(),
      entrada: num("entrada"),
      inversion: num("inversion"),
      recurrencia: num("recurrencia"),
      diferenciacion: num("diferenciacion"),
      encaje: num("encaje"),
      justificacion: (c[indices.justificacion] ?? "").trim(),
    });
  }
  return nichos;
}

export interface LecturaNichos1 {
  nichos: Nicho[];
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

function tituloDe(linea: string, titulos: string[]): number {
  const t = linea.trim();
  if (!t || t.length > 60 || /^\s*[-*•|]/.test(t)) return -1;
  const c = norm(t.replace(/^#{1,6}\s*/, ""));
  return titulos.findIndex((x) => c === norm(x) || c.startsWith(norm(x)));
}

/** Lee la respuesta del Prompt 1 («## Nichos», con un bloque CSV dentro). Tolera # y negritas. */
export function leerRespuestaNichos1(entrada: string): LecturaNichos1 {
  const lineas = (entrada ?? "").replace(/\r\n?/g, "\n").split("\n");
  const titulos = ["Nichos", "Qué debes verificar", "Siguiente paso"];
  const acumulado: string[][] = [[], [], []];
  let actual = -1;
  for (const l of lineas) {
    const sinFormato = l.trim().startsWith("|") || /^```/.test(l.trim()) ? l : quitarFormato(l);
    const i = tituloDe(sinFormato, titulos);
    if (i !== -1) {
      actual = i;
      continue;
    }
    if (actual !== -1) acumulado[actual].push(sinFormato);
  }
  const seccionNichos = acumulado[0].join("\n");
  if (!seccionNichos.trim()) return { nichos: [], valido: false, problema: "No encuentro la sección «## Nichos». Pega la respuesta completa de tu IA, usando el botón «Copiar» del chat.", advertencias: [] };

  const nichos = leerTablaNichos(seccionNichos);
  if (nichos.length === 0) return { nichos: [], valido: false, problema: "Encontré la sección «## Nichos», pero no pude leer su tabla. Pídele a tu IA que la entregue en un bloque de código ```csv, con una fila de encabezado.", advertencias: [] };

  const advertencias: string[] = [];
  if (nichos.length < 6) advertencias.push(`Solo detecté ${nichos.length} nicho(s): se pidieron entre 8 y 10.`);
  const conPuntuacionInvalida = nichos.filter((n) => CAMPOS_NUMERICOS.some((c) => (n[c] as number) < 1));
  if (conPuntuacionInvalida.length > 0) advertencias.push(`${conPuntuacionInvalida.length} nicho(s) tienen una puntuación fuera de 1 a 5, o no se pudo leer: revísalos antes de confiar en el ranking.`);

  return { nichos, valido: true, advertencias };
}

export type ClaveValidacion = "hipotesis" | "plan1" | "plan2" | "guion" | "verificar" | "siguiente";
export const TITULOS_VALIDACION: { clave: ClaveValidacion; titulo: string }[] = [
  { clave: "hipotesis", titulo: "Hipótesis críticas" },
  { clave: "plan1", titulo: "Plan de validación: Nicho 1" },
  { clave: "plan2", titulo: "Plan de validación: Nicho 2" },
  { clave: "guion", titulo: "Guion de entrevistas" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

export interface LecturaValidacion {
  secciones: Partial<Record<ClaveValidacion, string>>;
  conteoHipotesis: number;
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const RE_HIPOTESIS = /\[hip[oó]tesis\]/gi;

function tituloValidacionDe(linea: string): ClaveValidacion | null {
  const t = linea.trim();
  if (!t || t.length > 60 || /^\s*[-*•|]/.test(t)) return null;
  const c = norm(t.replace(/^#{1,6}\s*/, ""));
  for (const { clave, titulo } of TITULOS_VALIDACION) if (c === norm(titulo) || c.startsWith(norm(titulo))) return clave;
  return null;
}

/** Lee la respuesta del Prompt 2 (plan de validación de 14 días para los 2 nichos elegidos). */
export function leerRespuestaValidacion(entrada: string): LecturaValidacion {
  const lineas = (entrada ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => !/^\s*(?:```|~~~)/.test(l))
    .map((l) => quitarFormato(l));

  const acumulado: Partial<Record<ClaveValidacion, string[]>> = {};
  let actual: ClaveValidacion | null = null;
  for (const l of lineas) {
    const clave = tituloValidacionDe(l);
    if (clave && !(clave in acumulado)) {
      actual = clave;
      acumulado[clave] = [];
      continue;
    }
    if (actual) acumulado[actual]!.push(l);
  }
  const secciones: Partial<Record<ClaveValidacion, string>> = {};
  for (const [k, v] of Object.entries(acumulado)) secciones[k as ClaveValidacion] = v!.join("\n").trim();

  let problema: string | undefined;
  if (!(secciones.hipotesis ?? "").length && !(secciones.plan1 ?? "").length) problema = "No encuentro «## Hipótesis críticas» ni «## Plan de validación: Nicho 1». Pega la respuesta completa de tu IA.";

  const advertencias: string[] = [];
  if (!problema) for (const t of TITULOS_VALIDACION) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);

  const conteoHipotesis = Object.values(secciones).join("\n").match(RE_HIPOTESIS)?.length ?? 0;

  return { secciones, conteoHipotesis, valido: !problema, problema, advertencias };
}
