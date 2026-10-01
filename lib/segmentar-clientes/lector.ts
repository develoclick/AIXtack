import { comparable, quitarFormato } from "@/lib/cv/normalizar";

export type ClaveRespuesta = "segmentos" | "perfiles" | "calidad" | "acciones" | "datosFaltan" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "segmentos", titulo: "Segmentos (datos)" },
  { clave: "perfiles", titulo: "Perfiles [INTERPRETACIÓN]" },
  { clave: "calidad", titulo: "Calidad de la segmentación" },
  { clave: "acciones", titulo: "Acciones a probar por segmento" },
  { clave: "datosFaltan", titulo: "Datos que faltan" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

function tituloDe(linea: string): ClaveRespuesta | null {
  const t = linea.trim();
  if (!t || t.length > 70 || /^\s*[-*•|]/.test(t)) return null;
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

export interface LecturaSegmentarClientes {
  secciones: Partial<Record<ClaveRespuesta, string>>;
  segmentos: string[];
  perfiles: string[];
  calidad: string[];
  acciones: string[];
  datosFaltan: string[];
  verificar: string[];
  siguiente: string[];
  valido: boolean;
  problema?: string;
  advertencias: string[];
}

const VACIA: Omit<LecturaSegmentarClientes, "secciones" | "valido" | "problema" | "advertencias"> = { segmentos: [], perfiles: [], calidad: [], acciones: [], datosFaltan: [], verificar: [], siguiente: [] };

/** Lee la respuesta del prompt de segmentación: 7 secciones fijas, todas en prosa (la tabla de segmentos ya la calculó la página). Tolera # y negritas. */
export function leerRespuestaSegmentarClientes(entrada: string): LecturaSegmentarClientes {
  const lineas = (entrada ?? "").replace(/\r\n?/g, "\n").split("\n").map((l) => quitarFormato(l));

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

  if (!(secciones.segmentos ?? "").trim() || !(secciones.perfiles ?? "").trim()) {
    return { secciones, ...VACIA, valido: false, problema: "No encuentro las secciones «## Segmentos (datos)» y «## Perfiles [INTERPRETACIÓN]». Pega la respuesta completa de tu IA, usando el botón «Copiar» del chat.", advertencias: [] };
  }

  return {
    secciones,
    segmentos: items(secciones.segmentos),
    perfiles: items(secciones.perfiles),
    calidad: items(secciones.calidad),
    acciones: items(secciones.acciones),
    datosFaltan: items(secciones.datosFaltan),
    verificar: items(secciones.verificar),
    siguiente: items(secciones.siguiente),
    valido: true,
    advertencias: [],
  };
}
