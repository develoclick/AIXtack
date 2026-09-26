import type { DatosCv, EstudioCv, ExperienciaCv, IdiomaCv } from "./tipos";

/** Encabezados de sección que la IA debe usar (y que reconoce el lector de ATS), por idioma. */
export const ENCABEZADOS: Record<IdiomaCv, { perfil: string; experiencia: string; educacion: string; habilidades: string; idiomas: string; certificaciones: string; proyectos: string }> = {
  es: {
    perfil: "PERFIL PROFESIONAL",
    experiencia: "EXPERIENCIA PROFESIONAL",
    educacion: "EDUCACIÓN",
    habilidades: "HABILIDADES",
    idiomas: "IDIOMAS",
    certificaciones: "CERTIFICACIONES",
    proyectos: "PROYECTOS Y ACTIVIDADES",
  },
  en: {
    perfil: "PROFESSIONAL SUMMARY",
    experiencia: "PROFESSIONAL EXPERIENCE",
    educacion: "EDUCATION",
    habilidades: "SKILLS",
    idiomas: "LANGUAGES",
    certificaciones: "CERTIFICATIONS",
    proyectos: "PROJECTS & ACTIVITIES",
  },
};

export const MARCADOR_NOTAS = "=== NOTAS ===";

const NO_INDICADO = "(no indicado)";

const limpio = (s: string) => s.trim();
const conValor = (s: string) => limpio(s).length > 0;

function rango(inicio: string, fin: string): string {
  const a = limpio(inicio);
  const b = limpio(fin);
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

function lineas(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

function bloqueExperiencia(e: ExperienciaCv, n: number): string | null {
  if (![e.cargo, e.empresa, e.logros].some(conValor)) return null;
  const cabecera = [limpio(e.cargo) || NO_INDICADO, limpio(e.empresa) || NO_INDICADO].join(" — ");
  const partes = [`${n}) ${cabecera}`];
  if (conValor(e.lugar)) partes.push(`   Lugar: ${limpio(e.lugar)}`);
  const fechas = rango(e.inicio, e.fin);
  partes.push(`   Fechas: ${fechas || NO_INDICADO}`);
  const l = lineas(e.logros);
  partes.push(l.length ? `   Lo que hice y logré (palabras del candidato):\n${l.map((x) => `   - ${x}`).join("\n")}` : `   Lo que hice y logré: ${NO_INDICADO}`);
  return partes.join("\n");
}

function bloqueEstudio(e: EstudioCv, n: number): string | null {
  if (![e.titulo, e.institucion, e.detalle].some(conValor)) return null;
  const partes = [`${n}) ${limpio(e.titulo) || NO_INDICADO} — ${limpio(e.institucion) || NO_INDICADO}`];
  if (conValor(e.lugar)) partes.push(`   Lugar: ${limpio(e.lugar)}`);
  const fechas = rango(e.inicio, e.fin);
  partes.push(`   Fechas: ${fechas || NO_INDICADO}`);
  if (conValor(e.detalle)) partes.push(`   Detalles: ${limpio(e.detalle).replace(/\s*\n\s*/g, "; ")}`);
  return partes.join("\n");
}

function lista(items: string[]): string {
  return items.join("\n");
}

/** Los datos ya escritos, ordenados; lo que falta se dice como «(no indicado)» para que la IA no lo invente. */
export function bloqueDatos(d: DatosCv): string {
  const contacto = [
    `Nombre completo: ${limpio(d.nombre) || NO_INDICADO}`,
    `Correo: ${limpio(d.email) || NO_INDICADO}`,
    `Teléfono: ${limpio(d.telefono) || NO_INDICADO}`,
    `Ciudad y país: ${limpio(d.ciudad) || NO_INDICADO}`,
    ...(conValor(d.linkedin) ? [`LinkedIn: ${limpio(d.linkedin)}`] : []),
    ...(conValor(d.web) ? [`Portafolio o web: ${limpio(d.web)}`] : []),
  ];

  const experiencias = d.experiencias.map((e, i) => bloqueExperiencia(e, i + 1)).filter((x): x is string => x !== null);
  const estudios = d.estudios.map((e, i) => bloqueEstudio(e, i + 1)).filter((x): x is string => x !== null);

  const extra: string[] = [];
  if (conValor(d.habilidades)) extra.push(`Habilidades y herramientas: ${lineas(d.habilidades).join("; ")}`);
  if (conValor(d.idiomas)) extra.push(`Idiomas: ${lineas(d.idiomas).join("; ")}`);
  if (conValor(d.certificaciones)) extra.push(`Certificaciones y cursos:\n${lineas(d.certificaciones).map((x) => `- ${x}`).join("\n")}`);
  if (conValor(d.proyectos)) extra.push(`Proyectos, voluntariado y actividades:\n${lineas(d.proyectos).map((x) => `- ${x}`).join("\n")}`);
  if (conValor(d.resumen)) extra.push(`Lo que quiere destacar de sí mismo/a (palabras del candidato): ${limpio(d.resumen).replace(/\s*\n\s*/g, " ")}`);

  return [
    "Contacto:",
    lista(contacto.map((c) => `- ${c}`)),
    "",
    "Experiencia laboral:",
    experiencias.length ? experiencias.join("\n\n") : `- ${NO_INDICADO}`,
    "",
    "Educación:",
    estudios.length ? estudios.join("\n\n") : `- ${NO_INDICADO}`,
    "",
    ...(extra.length ? [extra.join("\n"), ""] : []),
  ]
    .join("\n")
    .trimEnd();
}

function ordenSecciones(d: DatosCv): string {
  const h = ENCABEZADOS[d.idioma];
  const educacionPrimero = d.nivel === "sin-experiencia" || d.nivel === "junior";
  const nucleo = educacionPrimero ? [h.educacion, h.experiencia] : [h.experiencia, h.educacion];
  const opcionales = [h.proyectos, h.certificaciones, h.habilidades, h.idiomas];
  return [h.perfil, ...nucleo, ...opcionales].join(" → ");
}

const NIVEL_TEXTO: Record<DatosCv["nivel"], string> = {
  "sin-experiencia": "sin experiencia laboral (estudiante o recién egresado)",
  junior: "junior (hasta 2 años de experiencia)",
  "semi-senior": "semi senior (2 a 6 años de experiencia)",
  senior: "senior (más de 6 años de experiencia)",
};

/**
 * Construye el prompt completo a partir de los datos del formulario. Es una función pura: los mismos datos dan siempre el mismo
 * texto, y el prompt se puede leer, copiar y pegar en cualquier asistente de chat (ChatGPT, Gemini, Claude…).
 */
export function construirPrompt(d: DatosCv): string {
  const h = ENCABEZADOS[d.idioma];
  const idioma = d.idioma === "en" ? "inglés" : "español";
  const paginas = d.nivel === "senior" ? "1 página; máximo 2 si hay más de 10 años de experiencia relevante" : "1 página";
  const oferta = conValor(d.oferta) ? limpio(d.oferta) : "(no pegó ninguna oferta: usa solo el puesto objetivo y no inventes requisitos)";

  return `### ROL
Actúa como reclutador senior de talento y experto en sistemas ATS (software de seguimiento de candidatos). Vas a redactar la hoja de vida de una persona en formato Harvard, pensada para que un ATS la lea sin errores y para que una persona reclutadora entienda su valor en menos de 30 segundos.

### OBJETIVO
Crear una hoja de vida completa en ${idioma}, en formato Harvard, para el puesto: ${limpio(d.puesto) || NO_INDICADO}. Nivel del candidato: ${NIVEL_TEXTO[d.nivel]}.

### OFERTA LABORAL (de aquí salen las palabras clave)
${oferta}

### DATOS DEL CANDIDATO (única fuente de verdad)
${bloqueDatos(d)}

### REGLAS DE CONTENIDO
1. Usa SOLO la información de los datos del candidato. No inventes cifras, empresas, cargos, títulos, fechas, herramientas, certificaciones ni logros. Si un dato dice "(no indicado)", no lo rellenes con lo habitual del rubro: omítelo.
2. Palabras clave: usa las palabras y frases de la oferta laboral SOLO cuando los datos del candidato demuestren esa experiencia o habilidad. Nunca añadas una habilidad de la oferta que el candidato no haya mencionado; ponla en las NOTAS como "brecha".
3. Viñetas de experiencia (3 a 5 por cargo reciente, 1 a 3 por cargos antiguos): empiezan con un verbo de acción (pasado para trabajos terminados, presente para el actual), sin pronombres (sin "yo" ni "nosotros"), con este orden: qué hiciste + cómo o con qué herramienta + resultado. Máximo 2 líneas cada una.
4. Cifras: incluye solo las que el candidato entregó. Si un logro no trae cifra, escríbelo sin cifra y pregunta en las NOTAS qué número podría agregar el candidato (por ejemplo, cantidad, porcentaje, tiempo, monto).
5. Perfil profesional: 2 a 3 líneas con cargo objetivo, años o nivel de experiencia, 2 o 3 fortalezas respaldadas por los datos y el sector. Sin frases vacías como "persona proactiva y responsable" si no hay evidencia.
6. Si el candidato no tiene experiencia laboral, presenta los proyectos, prácticas, voluntariado y actividades con el mismo formato de viñetas, en la sección ${h.proyectos}.
7. No incluyas: foto, edad, fecha de nacimiento, estado civil, género, documento de identidad, dirección exacta ni referencias. Solo ciudad y país.
8. Si falta un dato imprescindible (nombre o forma de contacto), escribe [COMPLETAR: qué falta] en su lugar y avísalo en las NOTAS.

### REGLAS DE FORMATO (Harvard + lectura por ATS)
1. Una sola columna, sin tablas, sin columnas, sin cuadros de texto, sin iconos, sin gráficos ni barras de nivel de habilidades.
2. Orden de secciones: ${ordenSecciones(d)}. Omite las secciones sin datos. Dentro de cada sección, orden cronológico inverso (lo más reciente primero).
3. Usa exactamente estos encabezados (no los cambies por otros más "creativos"): ${h.perfil}, ${h.experiencia}, ${h.educacion}, ${h.habilidades}, ${h.idiomas}, ${h.certificaciones}, ${h.proyectos}.
4. Cada cargo o estudio: primera línea con institución o empresa y ciudad; segunda línea con el cargo o título y las fechas. Fechas con el mismo formato en todo el documento (por ejemplo "Mar 2022 – Actualidad"). Ninguna línea empieza con una fecha.
5. Extensión: ${paginas}. Prioriza lo más relevante para la oferta y recorta lo demás.
6. Habilidades: agrúpalas por tipo en viñetas (por ejemplo "Técnicas: …", "Herramientas: …") y escribe siglas junto a su forma completa la primera vez, por ejemplo "Search Engine Optimization (SEO)".
7. Redacción: voz activa, oraciones cortas, sin abreviaturas informales, sin jerga ni tono narrativo. Ortografía y puntuación impecables.

### FORMATO DE SALIDA (obligatorio, exacto)
Responde SOLO con la hoja de vida, sin introducción, sin explicaciones y sin bloques de código. Usa exactamente esta estructura de texto (la forma, no el contenido):

NOMBRE: Nombre Apellido
CONTACTO: Ciudad, País | correo | teléfono | LinkedIn
## ${h.perfil}
Texto del perfil en 2 o 3 líneas.
## ${h.experiencia}
### Empresa | Ciudad, País
Cargo | Mes AAAA – Mes AAAA
- Viñeta de logro
- Viñeta de logro
## ${h.educacion}
### Institución | Ciudad, País
Título obtenido | Año o rango de fechas
- Detalle relevante (opcional)
## ${h.habilidades}
- Técnicas: …
- Herramientas: …
${MARCADOR_NOTAS}
- Palabras clave de la oferta que SÍ cubriste.
- Palabras clave de la oferta que NO pudiste cubrir por falta de datos (brechas): no las agregaste.
- Preguntas para cuantificar logros o completar datos.
- Qué debe verificar el candidato antes de enviar.

### AUTOVERIFICACIÓN (antes de responder)
Comprueba y corrige lo que no cumpla: (a) ninguna cifra, empresa, cargo, fecha, título o herramienta que no esté en los datos del candidato; (b) el formato coincide exactamente con la estructura de salida; (c) cada viñeta empieza con un verbo de acción y no usa pronombres; (d) las palabras clave de la oferta aparecen solo donde hay respaldo; (e) las fechas tienen un formato consistente y van en orden cronológico inverso; (f) no superas la extensión indicada; (g) todo está en ${idioma}, excepto los nombres propios.`;
}

export interface ProgresoCv {
  hechos: number;
  total: number;
  faltan: string[];
}

/** Cuántos de los datos clave ya están escritos (para la barra de avance) y cuáles faltan. */
export function progresoCv(d: DatosCv): ProgresoCv {
  const experiencia = d.experiencias.some((e) => conValor(e.cargo) && conValor(e.empresa) && conValor(e.logros));
  const estudio = d.estudios.some((e) => conValor(e.titulo) && conValor(e.institucion));
  const sinExperiencia = d.nivel === "sin-experiencia";
  const chequeos: [boolean, string][] = [
    [conValor(d.puesto), "Puesto al que postulas"],
    [conValor(d.oferta), "Oferta laboral (pégala para adaptar las palabras clave)"],
    [conValor(d.nombre), "Nombre completo"],
    [conValor(d.email) && conValor(d.telefono), "Correo y teléfono"],
    [conValor(d.ciudad), "Ciudad y país"],
    [sinExperiencia ? conValor(d.proyectos) || experiencia : experiencia, sinExperiencia ? "Proyectos, prácticas o voluntariado" : "Al menos una experiencia con cargo, empresa y logros"],
    [estudio, "Al menos un estudio con título e institución"],
    [conValor(d.habilidades), "Habilidades y herramientas"],
  ];
  return { hechos: chequeos.filter(([ok]) => ok).length, total: chequeos.length, faltan: chequeos.filter(([ok]) => !ok).map(([, n]) => n) };
}

/** Texto corto para pedirle a la IA que corrija una respuesta que no respetó el formato. */
export function promptDeCorreccionFormato(): string {
  return `Tu respuesta no respetó el formato pedido. Devuélveme la misma hoja de vida usando EXACTAMENTE esta estructura, sin bloques de código y sin texto antes o después:

NOMBRE: …
CONTACTO: … | … | …
## ENCABEZADO DE SECCIÓN
### Empresa o institución | Ciudad, País
Cargo o título | Fechas
- Viñeta
(luego, en una línea aparte)
${MARCADOR_NOTAS}
- Notas para el candidato`;
}
