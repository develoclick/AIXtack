/**
 * Normalizador de la respuesta de la IA. Se ejecuta ANTES de validar y de leer el CV: cuando la persona copia el texto
 * seleccionándolo con el mouse (en vez de usar el botón «Copiar» de su IA), la IA ya lo muestra formateado y se pierden los
 * marcadores Markdown (##, ###, -). Aquí se reconstruye el formato canónico que entiende el lector:
 *
 *   NOMBRE: …            CONTACTO: … | … | …
 *   ## SECCIÓN           ### Organización | Lugar          Cargo | Fechas          - viñeta
 *   === NOTAS ===        (todo lo que sigue son notas para la persona y no va al Word)
 */

export type ClaveSeccion = "perfil" | "experiencia" | "educacion" | "habilidades" | "idiomas" | "certificaciones" | "proyectos";

interface DefSeccion {
  clave: ClaveSeccion;
  es: string;
  en: string;
  /** Nombres aceptados, ya sin tildes ni mayúsculas ni dos puntos finales. */
  nombresEs: string[];
  nombresEn: string[];
  /** Admite entradas «Organización | Lugar» + «Cargo | fechas». */
  conEntradas: boolean;
}

const SECCIONES: DefSeccion[] = [
  { clave: "perfil", es: "PERFIL PROFESIONAL", en: "PROFESSIONAL SUMMARY", nombresEs: ["perfil profesional", "perfil", "resumen profesional", "resumen", "objetivo profesional", "sobre mi"], nombresEn: ["professional summary", "summary", "profile", "professional profile"], conEntradas: false },
  { clave: "experiencia", es: "EXPERIENCIA PROFESIONAL", en: "PROFESSIONAL EXPERIENCE", nombresEs: ["experiencia profesional", "experiencia laboral", "experiencia", "trayectoria profesional"], nombresEn: ["professional experience", "work experience", "experience", "employment history"], conEntradas: true },
  { clave: "educacion", es: "EDUCACIÓN", en: "EDUCATION", nombresEs: ["educacion", "formacion academica", "formacion", "estudios", "estudios academicos"], nombresEn: ["education", "academic background", "academic education"], conEntradas: true },
  { clave: "habilidades", es: "HABILIDADES", en: "SKILLS", nombresEs: ["habilidades", "habilidades y herramientas", "habilidades tecnicas", "competencias"], nombresEn: ["skills", "technical skills", "core competencies"], conEntradas: false },
  { clave: "idiomas", es: "IDIOMAS", en: "LANGUAGES", nombresEs: ["idiomas"], nombresEn: ["languages"], conEntradas: false },
  { clave: "certificaciones", es: "CERTIFICACIONES", en: "CERTIFICATIONS", nombresEs: ["certificaciones", "cursos", "cursos y certificaciones", "certificaciones y cursos", "formacion complementaria"], nombresEn: ["certifications", "courses", "certifications and courses"], conEntradas: true },
  { clave: "proyectos", es: "PROYECTOS Y ACTIVIDADES", en: "PROJECTS & ACTIVITIES", nombresEs: ["proyectos y actividades", "proyectos", "voluntariado", "actividades", "proyectos y voluntariado", "actividades y voluntariado"], nombresEn: ["projects & activities", "projects and activities", "projects", "volunteering", "activities"], conEntradas: true },
];

/** Minúsculas, sin tildes, sin marcas de formato y sin dos puntos finales: para comparar encabezados. */
export function comparable(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[#*_`]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s*:+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Si el texto es el nombre de una sección conocida, devuelve su clave y el título canónico. */
export function reconocerSeccion(texto: string): { clave: ClaveSeccion; titulo: string; conEntradas: boolean } | null {
  const c = comparable(texto);
  if (!c || c.length > 45) return null;
  for (const s of SECCIONES) {
    if (s.nombresEs.includes(c)) return { clave: s.clave, titulo: s.es, conEntradas: s.conEntradas };
    if (s.nombresEn.includes(c)) return { clave: s.clave, titulo: s.en, conEntradas: s.conEntradas };
  }
  return null;
}

/** Clave de una sección ya escrita (por ejemplo, «EXPERIENCIA PROFESIONAL» o «EDUCATION»). */
export function claveDeTitulo(titulo: string): ClaveSeccion | null {
  return reconocerSeccion(titulo)?.clave ?? null;
}

const RE_NOTAS = /^\s*(?:={2,}|-{3,}|#{1,4})?\s*(?:notas?|notes?|recomendaciones(?: de la ia)?|notas para (?:ti|el candidato|el usuario|la persona)|notes for (?:you|the candidate))\s*(?:={2,}|-{3,})?\s*:?\s*$/i;
const RE_VINETA = /^\s*(?:[*•·▪●◦–—+]|-)\s+(.*)$/;
const RE_ANIO = /\b(?:19|20)\d{2}\b|actualidad|presente|\bpresent\b|\bcurrent\b|\bactual\b/i;
const RE_NOMBRE = /^\s*(?:nombre(?: completo)?|name|full name)\s*:\s*(.*)$/i;
const RE_CONTACTO = /^\s*(?:contacto|contact|datos de contacto)\s*:\s*(.*)$/i;
const RE_INTRO = /^(?:¡?\s*claro|por supuesto|aqu[ií]\s|aqui\s|here(?:'s| is| you)|sure|listo|perfecto|entendido|de acuerdo|ok\b|great|certainly|of course)/i;

/** Quita el formato Markdown de una línea (enlaces, negritas, cursivas, código en línea). */
export function quitarFormato(linea: string): string {
  return linea
    .replace(/[​-‍﻿]/g, "")
    .replace(/ /g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\((?:mailto:|tel:)?([^)]*)\)/g, (_m, texto: string, destino: string) => (texto.trim() ? texto : destino))
    .replace(/<((?:https?:\/\/|mailto:)[^>]+)>/g, (_m, u: string) => u.replace(/^mailto:/, ""))
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|[\s(])\*(?=\S)(.+?)(?<=\S)\*(?=[\s).,;:]|$)/g, "$1$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\s+$/g, "");
}

export interface RespuestaNormalizada {
  /** Texto en el formato canónico, sin las notas. */
  texto: string;
  /** Notas de la IA para la persona (lo que va después de «=== NOTAS ===»). */
  notas: string[];
}

/**
 * Convierte la respuesta de la IA (con Markdown, sin él, dentro de ```markdown, con introducción…) en el formato canónico.
 * No inventa contenido: solo reconoce estructura, y lo que no entiende lo deja tal cual como texto.
 */
export function normalizarRespuestaIA(entrada: string): RespuestaNormalizada {
  const crudas = (entrada ?? "").replace(/\r\n?/g, "\n").split("\n");

  // 1. Sin cercas de código (con o sin lenguaje), sin formato en línea; las notas se separan al final.
  const limpias: string[] = [];
  for (const cruda of crudas) {
    if (/^\s*(?:```|~~~)/.test(cruda)) continue;
    limpias.push(quitarFormato(cruda));
  }

  // 2. Separar las notas (todo lo que sigue al marcador) del CV.
  const cuerpo: string[] = [];
  const notas: string[] = [];
  let enNotas = false;
  for (const linea of limpias) {
    const t = linea.trim();
    if (!enNotas && t && RE_NOTAS.test(t) && !reconocerSeccion(t)) {
      enNotas = true;
      continue;
    }
    if (enNotas) {
      if (t) notas.push(t.replace(RE_VINETA, "$1").trim());
    } else cuerpo.push(linea);
  }

  // 3. Encabezados, viñetas y etiquetas.
  const lineas: string[] = [];
  for (const linea of cuerpo) {
    const t = linea.trim();
    if (!t) {
      lineas.push("");
      continue;
    }
    const sinAlmohadilla = t.replace(/^#{1,6}\s*/, "");
    const seccion = reconocerSeccion(sinAlmohadilla);
    if (seccion && !RE_VINETA.test(t) && !/\|/.test(t)) {
      lineas.push(`## ${seccion.titulo}`);
      continue;
    }
    const nombre = t.match(RE_NOMBRE);
    if (nombre) {
      lineas.push(`NOMBRE: ${nombre[1].trim()}`);
      continue;
    }
    const contacto = t.match(RE_CONTACTO);
    if (contacto) {
      lineas.push(`CONTACTO: ${contacto[1].trim()}`);
      continue;
    }
    const vineta = t.match(RE_VINETA);
    if (vineta && !/^#/.test(t)) {
      lineas.push(`- ${vineta[1].trim()}`);
      continue;
    }
    lineas.push(t);
  }

  // 4. Quitar la introducción anterior a «NOMBRE:» (o, si no hay etiqueta, las frases de cortesía).
  const iNombre = lineas.findIndex((l) => l.startsWith("NOMBRE:"));
  let inicio = 0;
  if (iNombre > -1) inicio = iNombre;
  else {
    const iPrimeraSeccion = lineas.findIndex((l) => l.startsWith("## "));
    const limite = iPrimeraSeccion === -1 ? lineas.length : iPrimeraSeccion;
    const antes = lineas.slice(0, limite);
    const iReal = antes.findIndex((l) => l.trim() !== "" && !l.endsWith(":") && !RE_INTRO.test(l.trim()));
    inicio = iReal === -1 ? limite : iReal;
  }
  let resto = lineas.slice(inicio);

  // 5. Sin etiqueta «NOMBRE:»: la primera línea del CV es el nombre y la siguiente con @, números o barras, el contacto.
  if (!resto.some((l) => l.startsWith("NOMBRE:"))) {
    const iPrimera = resto.findIndex((l) => l.trim() !== "");
    if (iPrimera > -1 && !resto[iPrimera].startsWith("## ")) {
      const nombre = resto[iPrimera].replace(/^#\s*/, "").trim();
      resto = [`NOMBRE: ${nombre}`, ...resto.slice(iPrimera + 1)];
      const j = resto.findIndex((l, i) => i > 0 && l.trim() !== "");
      if (j > 0 && !resto[j].startsWith("## ") && !resto[j].startsWith("CONTACTO:") && /@|\+?\d{6,}|linkedin|\|/i.test(resto[j])) resto[j] = `CONTACTO: ${resto[j].trim()}`;
    }
  }

  // 6. Entradas sin «###»: «Organización | Lugar» seguida de «Cargo o título | fechas».
  const salida: string[] = [];
  let seccionActual: { conEntradas: boolean } | null = null;
  for (let i = 0; i < resto.length; i++) {
    const l = resto[i];
    if (l.startsWith("## ")) {
      seccionActual = reconocerSeccion(l.slice(3)) ?? { conEntradas: true };
      salida.push(l);
      continue;
    }
    const sig = resto[i + 1];
    const esPlana = (x: string | undefined) => !!x && x.trim() !== "" && !x.startsWith("- ") && !x.startsWith("## ") && !x.startsWith("### ") && !/^(NOMBRE|CONTACTO):/.test(x);
    if (seccionActual?.conEntradas && esPlana(l) && esPlana(sig) && l.length <= 140 && RE_ANIO.test(sig!) && /\|/.test(sig!) && !RE_ANIO.test(l.split("|")[0])) {
      salida.push(`### ${l.trim()}`, sig!.trim());
      i += 1;
      continue;
    }
    salida.push(l);
  }

  // 7. Sin líneas en blanco repetidas.
  const compacto: string[] = [];
  for (const l of salida) {
    if (l === "" && (compacto.length === 0 || compacto[compacto.length - 1] === "")) continue;
    compacto.push(l);
  }
  while (compacto.length && compacto[compacto.length - 1] === "") compacto.pop();

  return { texto: compacto.join("\n"), notas };
}
