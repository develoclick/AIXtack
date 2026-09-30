import { comparable, quitarFormato } from "@/lib/cv/normalizar";
import { TITULOS_RESPUESTA, type ClaveRespuesta } from "./tipos";

export interface LecturaRentabilidad {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  /** Cuántas veces aparece «[HIPÓTESIS]» en toda la respuesta. */
  conteoHipotesis: number;
  /** Es válida si se reconoce al menos «Resumen» o «Rentabilidad por producto». */
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

const RECONOCER: [ClaveRespuesta, (c: string) => boolean][] = [
  ["resumen", (c) => c === "resumen"],
  ["rentabilidad", (c) => c.startsWith("rentabilidad por producto")],
  ["sensibilidad", (c) => c.startsWith("sensibilidad")],
  ["omisiones", (c) => c.startsWith("costos posiblemente omitidos") || c.startsWith("costos omitidos")],
  ["acciones", (c) => c.startsWith("acciones a probar") || c.startsWith("acciones")],
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

const RE_HIPOTESIS = /\[hip[oó]tesis\]/gi;

/**
 * Lee la respuesta de «Calcular la rentabilidad de tu negocio»: quita cercas de código y negritas, y divide por los 5
 * títulos exactos (con tolerancia a #, mayúsculas, tildes y dos puntos).
 */
export function leerRespuestaRentabilidad(entrada: string): LecturaRentabilidad {
  const lineas = (entrada ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => !/^\s*(?:```|~~~)/.test(l))
    .map((l) => quitarFormato(l));

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

  const contenido: ClaveRespuesta[] = ["resumen", "rentabilidad"];
  const hay = contenido.filter((k) => (secciones[k] ?? "").length > 0);
  let problema: string | undefined;
  if (hay.length === 0) problema = "No encuentro «## Resumen» ni «## Rentabilidad por producto». Pega la respuesta completa de tu IA, usando el botón «Copiar» del chat.";

  const conteoHipotesis = Object.values(secciones).join("\n").match(RE_HIPOTESIS)?.length ?? 0;

  const advertencias: string[] = [];
  if (!problema) {
    for (const t of TITULOS_RESPUESTA) if (!(t.clave in secciones)) advertencias.push(`No detecté la sección «${t.titulo}»: ese panel quedará vacío.`);
  }

  return { secciones, conteoHipotesis, valido: !problema, problema, advertencias };
}
