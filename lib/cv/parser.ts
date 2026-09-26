import type { CvDocumento, CvEntrada, CvSeccion } from "./tipos";

export interface ResultadoLectura {
  documento: CvDocumento;
  /** Notas de la IA para la persona (todo lo que viene después del marcador «NOTAS»); no van al Word. */
  notas: string[];
  /** Solo es válido si hay nombre y al menos una sección con contenido. */
  valido: boolean;
  problema?: string;
}

const MARCA_NOTAS = /^\s*(?:={2,}|-{3,}|#{1,3})\s*(?:notas|notes)\b.*$|^\s*(?:notas para (?:ti|el candidato|el usuario|la persona)|notes for (?:you|the candidate))\s*:?\s*$/i;
const RE_NOMBRE = /^\s*(?:nombre|name)\s*:\s*(.+)$/i;
const RE_CONTACTO = /^\s*(?:contacto|contact)\s*:\s*(.+)$/i;
const RE_VINETA = /^\s*(?:[-*•·–—]|\d+[.)])\s+(.*)$/;

function limpiarLinea(linea: string): string {
  return linea
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|\s)\*(\S.*?\S|\S)\*(?=\s|$)/g, "$1$2")
    .replace(/`/g, "")
    .replace(/\s+$/g, "");
}

function dividir(texto: string): [string, string] {
  const partes = texto.split(/\s*\|\s*/);
  if (partes.length === 1) return [partes[0].trim(), ""];
  return [partes[0].trim(), partes.slice(1).join(" | ").trim()];
}

function seccionNueva(titulo: string): CvSeccion {
  return { titulo, parrafos: [], entradas: [], puntos: [] };
}

/**
 * Lee la respuesta de la IA (el formato que pide el prompt: NOMBRE:, CONTACTO:, «## Sección», «### Empresa | Ciudad»,
 * segunda línea «Cargo | Fechas» y viñetas «- …») y la convierte en un documento. Es tolerante con negritas, bloques de código
 * y viñetas «•», pero no inventa nada: lo que no reconoce se ignora o se guarda como párrafo.
 */
export function leerRespuestaIa(texto: string): ResultadoLectura {
  const crudas = texto.replace(/\r/g, "").split("\n");
  const lineas: string[] = [];
  const notas: string[] = [];
  let enNotas = false;

  for (const cruda of crudas) {
    if (/^\s*```/.test(cruda)) continue;
    const linea = limpiarLinea(cruda);
    if (!enNotas && MARCA_NOTAS.test(linea)) {
      enNotas = true;
      continue;
    }
    if (enNotas) {
      const t = linea.trim();
      if (t) notas.push(t.replace(RE_VINETA, "$1"));
    } else lineas.push(linea);
  }

  const documento: CvDocumento = { nombre: "", contacto: [], secciones: [] };
  let seccion: CvSeccion | null = null;
  let entrada: CvEntrada | null = null;

  for (const linea of lineas) {
    const t = linea.trim();
    if (!t) continue;

    const nombre = t.match(RE_NOMBRE);
    if (nombre && !seccion) {
      documento.nombre = nombre[1].trim();
      continue;
    }
    const contacto = t.match(RE_CONTACTO);
    if (contacto && !seccion) {
      documento.contacto = contacto[1].split(/\s*[|•·]\s*/).map((x) => x.trim()).filter(Boolean);
      continue;
    }

    const titulo = t.match(/^(#{1,4})\s+(.*)$/);
    if (titulo) {
      const nivel = titulo[1].length;
      const cuerpo = titulo[2].trim();
      if (nivel === 1 && !seccion && !documento.nombre) {
        documento.nombre = cuerpo;
        continue;
      }
      if (nivel <= 2) {
        seccion = seccionNueva(cuerpo.replace(/:$/, "").toUpperCase());
        documento.secciones.push(seccion);
        entrada = null;
        continue;
      }
      if (!seccion) {
        seccion = seccionNueva("");
        documento.secciones.push(seccion);
      }
      const [izq1, der1] = dividir(cuerpo);
      entrada = { izq1, der1, izq2: "", der2: "", puntos: [] };
      seccion.entradas.push(entrada);
      continue;
    }

    if (!seccion) {
      // Antes de la primera sección: nombre y contacto sueltos.
      if (!documento.nombre) documento.nombre = t;
      else documento.contacto.push(...t.split(/\s*[|•·]\s*/).map((x) => x.trim()).filter(Boolean));
      continue;
    }

    const vineta = t.match(RE_VINETA);
    if (vineta) {
      (entrada ?? seccion).puntos.push(vineta[1].trim());
      continue;
    }

    if (entrada && !entrada.izq2 && entrada.puntos.length === 0) {
      const [izq2, der2] = dividir(t);
      entrada.izq2 = izq2;
      entrada.der2 = der2;
      continue;
    }

    seccion.parrafos.push(t);
  }

  documento.secciones = documento.secciones.filter((s) => s.parrafos.length + s.entradas.length + s.puntos.length > 0);

  let problema: string | undefined;
  if (!documento.nombre) problema = "No encuentro el nombre. La primera línea debe ser «NOMBRE: …».";
  else if (documento.secciones.length === 0) problema = "No encuentro secciones. Cada sección debe empezar con «## NOMBRE DE LA SECCIÓN».";

  return { documento, notas, valido: !problema, problema };
}
