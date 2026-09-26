import { claveDeTitulo, normalizarRespuestaIA, type ClaveSeccion } from "./normalizar";
import type { CvDocumento, CvEntrada, CvSeccion } from "./tipos";

export interface ResultadoLectura {
  documento: CvDocumento;
  /** Notas de la IA para la persona (todo lo que viene después del marcador «NOTAS»); no van al Word. */
  notas: string[];
  /** Solo es válido si hay nombre y al menos una sección con contenido: es lo único que bloquea la descarga. */
  valido: boolean;
  /** Qué falta de imprescindible (solo si `valido` es falso). */
  problema?: string;
  /** Avisos que NO bloquean: secciones que no se detectaron, campos por completar, etc. */
  advertencias: string[];
}

const RE_NOMBRE = /^NOMBRE:\s*(.*)$/;
const RE_CONTACTO = /^CONTACTO:\s*(.*)$/;
const RE_VINETA = /^-\s+(.*)$/;

function dividir(texto: string): [string, string] {
  const partes = texto.split(/\s*\|\s*/);
  if (partes.length === 1) return [partes[0].trim(), ""];
  return [partes[0].trim(), partes.slice(1).join(" | ").trim()];
}

function seccionNueva(titulo: string): CvSeccion {
  return { titulo, parrafos: [], entradas: [], puntos: [] };
}

const NOMBRE_DE_SECCION: Record<ClaveSeccion, string> = {
  perfil: "PERFIL PROFESIONAL",
  experiencia: "EXPERIENCIA PROFESIONAL",
  educacion: "EDUCACIÓN",
  habilidades: "HABILIDADES",
  idiomas: "IDIOMAS",
  certificaciones: "CERTIFICACIONES",
  proyectos: "PROYECTOS Y ACTIVIDADES",
};

/**
 * Lee la respuesta de la IA: primero la normaliza (quita Markdown, cercas de código, introducciones y enlaces; reconoce
 * encabezados y viñetas aunque falten los marcadores) y luego arma el documento. Es tolerante: solo bloquea la descarga si
 * no hay nombre o no hay ninguna sección; todo lo demás son advertencias.
 */
export function leerRespuestaIa(texto: string): ResultadoLectura {
  const { texto: limpio, notas } = normalizarRespuestaIA(texto);
  const documento: CvDocumento = { nombre: "", contacto: [], secciones: [] };
  let seccion: CvSeccion | null = null;
  let entrada: CvEntrada | null = null;

  for (const linea of limpio.split("\n")) {
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
      // Antes de la primera sección: contacto suelto.
      documento.contacto.push(...t.split(/\s*[|•·]\s*/).map((x) => x.trim()).filter(Boolean));
      continue;
    }

    const vineta = t.match(RE_VINETA);
    if (vineta) {
      (entrada ?? seccion).puntos.push(vineta[1].trim());
      continue;
    }

    if (entrada && !entrada.izq2 && !entrada.der2 && entrada.puntos.length === 0) {
      const [izq2, der2] = dividir(t);
      entrada.izq2 = izq2;
      entrada.der2 = der2;
      continue;
    }

    seccion.parrafos.push(t);
  }

  documento.secciones = documento.secciones.filter((s) => s.parrafos.length + s.entradas.length + s.puntos.length > 0);

  let problema: string | undefined;
  if (!documento.nombre) problema = "Falta el nombre: no encuentro la línea «NOMBRE: …» ni un nombre al inicio de la respuesta.";
  else if (documento.secciones.length === 0) problema = "No detecté ninguna sección con contenido (por ejemplo EXPERIENCIA PROFESIONAL o EDUCACIÓN).";

  const advertencias: string[] = [];
  if (!problema) {
    const claves = new Set(documento.secciones.map((s) => claveDeTitulo(s.titulo)).filter((c): c is ClaveSeccion => c !== null));
    if (documento.contacto.length === 0) advertencias.push("No detecté la línea de contacto (correo, teléfono, ciudad): el Word saldrá sin ella.");
    for (const c of ["perfil", "educacion", "habilidades", "idiomas"] as const) {
      if (!claves.has(c)) advertencias.push(`No detecté la sección ${NOMBRE_DE_SECCION[c]}, se omitirá.`);
    }
    if (!claves.has("experiencia") && !claves.has("proyectos")) advertencias.push("No detecté la sección EXPERIENCIA PROFESIONAL (ni PROYECTOS Y ACTIVIDADES), se omitirá.");
    const pendientes = JSON.stringify(documento).match(/\[COMPLETAR[^\]]*\]/gi);
    if (pendientes) advertencias.push(`Quedan ${pendientes.length} dato(s) por completar marcados como [COMPLETAR…]: revísalos antes de descargar.`);
  }

  return { documento, notas, valido: !problema, problema, advertencias };
}
