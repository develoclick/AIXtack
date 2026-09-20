/**
 * Validador de calidad de las guías (content/guias/<categoria>/<slug>/). Se ejecuta antes de
 * cada build (`prebuild`) y con `npm run guias:validar`. Si una guía PUBLICADA no cumple los
 * requisitos mínimos, el build falla: no se puede publicar contenido incompleto.
 *
 *   ERROR   → compromete la calidad mínima (falta una sección obligatoria, un prompt sin
 *             documentar, un dato inexistente, un alt vacío, un enlace roto, contenido duplicado…).
 *   AVISO   → mejora recomendable (imágenes aún sin subir, falta de plan de video, texto corto…).
 *   Borradores → solo se exigen los errores estructurales; lo pendiente aparece como aviso
 *                (se resume salvo con --verbose).
 *
 * Opciones: --verbose · --strict-images (las imágenes que faltan pasan a ser error).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { authors } from "../content/autores";
import { categories, isCategorySlug } from "../content/categorias";
import { getGlossaryEntry } from "../content/glosario";
import { plannedGuides } from "../content/plan-guias";
import { redirects } from "../content/redirects";
import { analyzeGuideSource, type GuideAnalysis } from "../lib/guides/analyze";
import {
  DATA_KEYS,
  DATA_REQUIRED_KEYS,
  DATE_PATTERN,
  DIFFICULTIES,
  FORBIDDEN_SLUG_PATTERNS,
  GUIDE_COMPONENTS,
  GUIDE_TYPES,
  IMAGE_EXTENSIONS,
  ASPECT_RATIOS,
  LIMITS,
  SECTION_CATALOG,
  SECTION_DATA_KEY,
  SECTION_IDS,
  SIMILARITY,
  SLUG_PATTERN,
  VARIABLE_NAME_PATTERN,
  VARIABLE_SOURCE,
} from "../lib/guides/constants";
import { jaccard, paragraphKey, shingles, tokenize } from "../lib/guides/similarity";
import { countWords, visibleStrings } from "../lib/guides/text";
import type { GuideData } from "../lib/guides/model";
import { institutionalPages } from "../lib/site";

const ROOT = process.cwd();
const GUIDES_DIR = path.join(ROOT, "content", "guias");
// Fecha máxima admitida: la de hoy en el huso horario más adelantado (UTC+14), para no rechazar fechas locales válidas.
const TODAY = new Date(Date.now() + 14 * 3600 * 1000).toISOString().slice(0, 10);

const RESERVED_SLUGS = new Set([
  "guias",
  "sobre-nosotros",
  "contacto",
  "politica-de-privacidad",
  "politica-de-cookies",
  "terminos-y-condiciones",
  "api",
  "sitemap.xml",
  "robots.txt",
]);

/** Estadísticas o autoridad sin fuente: la guía no debe afirmarlas sin respaldo. */
const UNSOURCED_CLAIMS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(según|de acuerdo con) (un |el |los )?(estudios?|informes?|encuestas?)\b/i, label: "cita un estudio o informe" },
  { pattern: /\b(estudios|investigaciones|encuestas) (demuestran|muestran|revelan|indican)\b/i, label: "cita estudios sin fuente" },
  { pattern: /\b\d{1,3}\s?% de (las |los )?(empresas|negocios|pymes|emprendedores|consumidores|clientes)\b/i, label: "estadística sin fuente" },
  { pattern: /\b(testimonio|reseña verificada)s?\b/i, label: "testimonio" },
];

/* ────────────────────────────── infraestructura ────────────────────────────── */

type Level = "error" | "warn";
export interface Finding {
  level: Level;
  scope: string;
  message: string;
  /** Aviso de «borrador aún incompleto» (se resume salvo con --verbose). */
  draft: boolean;
}

export interface ValidateOptions {
  /** Carpeta public/ donde buscar las imágenes (por defecto la del proyecto). */
  publicDir?: string;
  /** Slugs del plan aprobado (por defecto content/plan-guias.ts). */
  planSlugs?: string[];
  /** Las imágenes que faltan son error en lugar de aviso. */
  strictImages?: boolean;
}

export interface LoadedGuide {
  category: string;
  slug: string;
  dir: string;
  source: string;
  data: GuideData | null;
  analysis: GuideAnalysis | null;
  published: boolean;
}

type Unknown = Record<string, unknown>;
const isObject = (value: unknown): value is Unknown => typeof value === "object" && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isTextList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText);
const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asObject = (value: unknown): Unknown => (isObject(value) ? value : {});

function isRealDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function getPath(root: unknown, keys: string[]): unknown {
  let current: unknown = root;
  for (const key of keys) {
    if (Array.isArray(current) ? !/^\d+$/.test(key) : !isObject(current)) return undefined;
    current = (current as Record<string, unknown>)[key];
    if (current === undefined) return undefined;
  }
  return current;
}

function wordsIn(value: unknown): number {
  const strings: string[] = [];
  const walk = (item: unknown) => {
    if (typeof item === "string") strings.push(item);
    else if (Array.isArray(item)) item.forEach(walk);
    else if (isObject(item)) Object.values(item).forEach(walk);
  };
  walk(value);
  return countWords(strings);
}

class Reporter {
  readonly findings: Finding[] = [];

  add(level: Level, scope: string, message: string, draft = false) {
    this.findings.push({ level, scope, message, draft });
  }

  /** Error si la guía está publicada; aviso de borrador si no. */
  need(published: boolean, ok: boolean, scope: string, message: string) {
    if (!ok) {
      if (published) this.add("error", scope, message);
      else this.add("warn", scope, message, true);
    }
  }

  warn(condition: boolean, scope: string, message: string) {
    if (!condition) this.add("warn", scope, message);
  }

  error(ok: boolean, scope: string, message: string) {
    if (!ok) this.add("error", scope, message);
  }
}

/* ────────────────────────────── carga ────────────────────────────── */

async function loadGuide(dir: string, category: string, slug: string, r: Reporter): Promise<LoadedGuide> {
  const scope = `${category}/${slug}`;
  const guide: LoadedGuide = { category, slug, dir, source: "", data: null, analysis: null, published: false };
  const mdxFile = path.join(dir, "guide.mdx");
  const dataFile = path.join(dir, "data.ts");

  r.error(fs.existsSync(mdxFile), scope, "Falta guide.mdx.");
  r.error(fs.existsSync(dataFile), scope, "Falta data.ts.");
  r.warn(fs.existsSync(path.join(dir, "README.md")), scope, "Falta README.md (notas de mantenimiento de la guía).");

  if (fs.existsSync(dataFile)) {
    try {
      const mod = (await import(`${pathToFileURL(dataFile).href}?v=${Date.now()}`)) as { default?: unknown };
      if (isObject(mod.default)) guide.data = mod.default as unknown as GuideData;
      else r.add("error", scope, "data.ts debe exportar por defecto el objeto de la guía (export default defineGuide({...})).");
    } catch (error) {
      r.add("error", scope, `data.ts no se pudo cargar: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
    }
  }

  if (fs.existsSync(mdxFile)) {
    guide.source = fs.readFileSync(mdxFile, "utf8");
    try {
      guide.analysis = analyzeGuideSource(guide.source);
    } catch (error) {
      r.add("error", scope, `MDX inválido: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
    }
  }

  guide.published = isObject(guide.data) && asObject(asObject(guide.data).metadata).status === "published";
  return guide;
}

/* ────────────────────────────── metadatos ────────────────────────────── */

function checkMetadata(g: LoadedGuide, r: Reporter, planSlugs: string[], allSlugs: Set<string>): void {
  const scope = `${g.category}/${g.slug}`;
  const data = asObject(g.data);
  const meta = asObject(data.metadata);
  const pub = g.published;

  if (!isCategorySlug(g.category)) r.add("error", scope, `La carpeta de categoría "${g.category}" no existe en content/categorias.ts.`);
  r.error(SLUG_PATTERN.test(g.slug), scope, "El slug debe estar en minúsculas, con números y guiones.");
  if (RESERVED_SLUGS.has(g.slug)) r.add("error", scope, "Slug reservado por una ruta del sitio.");
  for (const rule of FORBIDDEN_SLUG_PATTERNS) if (rule.pattern.test(g.slug)) r.add("error", scope, `Slug no permitido: ${rule.reason}.`);
  if (!planSlugs.includes(g.slug)) r.need(pub, false, scope, "La guía no está en content/plan-guias.ts: ampliar el conjunto de guías requiere aprobación previa.");

  r.error(meta.slug === g.slug, scope, `metadata.slug ("${String(meta.slug)}") no coincide con la carpeta.`);
  r.error(meta.category === g.category, scope, `metadata.category ("${String(meta.category)}") no coincide con la carpeta.`);
  r.error(meta.status === "draft" || meta.status === "published", scope, 'metadata.status debe ser "draft" o "published".');

  r.need(pub, isText(meta.title), scope, "Falta metadata.title.");
  if (isText(meta.title)) r.need(pub, meta.title.length <= LIMITS.titleMax, scope, `El título tiene ${meta.title.length} caracteres (máximo ${LIMITS.titleMax}).`);
  r.need(pub, isText(meta.description), scope, "Falta metadata.description.");
  if (isText(meta.description)) {
    const length = meta.description.length;
    r.need(pub, length >= LIMITS.descriptionMin && length <= LIMITS.descriptionMax, scope, `La descripción tiene ${length} caracteres (deben ser ${LIMITS.descriptionMin}–${LIMITS.descriptionMax}).`);
  }
  r.error(typeof meta.author === "string" && authors.some((a) => a.id === String(meta.author).toLowerCase() || a.name === meta.author), scope, `metadata.author "${String(meta.author)}" no está en content/autores.ts.`);

  if (pub) {
    r.error(isRealDate(meta.publishedAt), scope, "Una guía publicada necesita metadata.publishedAt real (AAAA-MM-DD).");
    if (isRealDate(meta.publishedAt)) r.error(meta.publishedAt <= TODAY, scope, "metadata.publishedAt está en el futuro.");
  } else if (meta.publishedAt !== null && meta.publishedAt !== undefined) {
    r.error(isRealDate(meta.publishedAt), scope, "metadata.publishedAt no es una fecha válida.");
  }
  r.error(isRealDate(meta.updatedAt), scope, "metadata.updatedAt debe ser una fecha real (AAAA-MM-DD).");
  if (isRealDate(meta.updatedAt)) {
    r.error(meta.updatedAt <= TODAY, scope, "metadata.updatedAt está en el futuro.");
    if (isRealDate(meta.publishedAt)) r.error(meta.updatedAt >= meta.publishedAt, scope, "updatedAt no puede ser anterior a publishedAt.");
  }

  r.need(pub, isText(meta.problem) && meta.problem.length >= LIMITS.problemMin, scope, "metadata.problem debe describir el problema concreto en una frase.");
  r.need(pub, isText(meta.whyThisPage) && meta.whyThisPage.length >= LIMITS.whyThisPageMin, scope, "metadata.whyThisPage debe justificar por qué merece una URL propia.");

  if (!Array.isArray(meta.relatedGuides) || !meta.relatedGuides.every(isText)) {
    r.add("error", scope, "metadata.relatedGuides debe ser una lista de slugs.");
  } else {
    r.need(pub, meta.relatedGuides.length >= 1, scope, "Necesita al menos una guía relacionada (enlazado interno natural).");
    const seen = new Set<string>();
    for (const slug of meta.relatedGuides) {
      if (slug === g.slug) r.add("error", scope, "Una guía no puede estar relacionada consigo misma.");
      if (seen.has(slug)) r.add("error", scope, `Guía relacionada repetida: ${slug}.`);
      seen.add(slug);
      if (!planSlugs.includes(slug) && !allSlugs.has(slug)) r.add("error", scope, `Guía relacionada inexistente: ${slug}.`);
    }
  }
}

/* ────────────────────────────── estructura (MDX + datos) ────────────────────────────── */

function checkStructure(g: LoadedGuide, r: Reporter): void {
  const scope = `${g.category}/${g.slug}`;
  const pub = g.published;
  const data = asObject(g.data);
  const analysis = g.analysis;
  if (!analysis || !g.data) return;

  for (const problem of analysis.errors) r.add("error", scope, problem);

  // H1 único: lo pone la página con metadata.title
  if (/^#\s+\S/m.test(g.source.replace(/```[\s\S]*?```/g, ""))) r.add("error", scope, "guide.mdx no debe contener un H1 (# …): el H1 de la página es metadata.title.");
  if (/^##\s+\S/m.test(g.source.replace(/```[\s\S]*?```/g, ""))) r.add("error", scope, "Usa <GuideSection id title> en lugar de encabezados ## sueltos: el índice y los anclas dependen de ello.");

  // claves de primer nivel de data
  for (const key of Object.keys(data)) if (!(DATA_KEYS as readonly string[]).includes(key)) r.add("error", scope, `data.ts tiene una clave desconocida: "${key}" (¿errata?).`);
  for (const key of DATA_REQUIRED_KEYS) r.need(pub, key in data && data[key] !== undefined, scope, `Falta data.${key}.`);

  // componentes permitidos
  const allowed = new Set<string>(GUIDE_COMPONENTS);
  const unknown = new Set<string>();
  for (const component of analysis.components) if (/^[A-Z]/.test(component.name) && !allowed.has(component.name)) unknown.add(component.name);
  for (const name of unknown) r.add("error", scope, `Componente no registrado: <${name}>. Los disponibles están en components/guide/ y mdx-components.tsx.`);

  // secciones
  const ids = analysis.sections.map((section) => section.id);
  const seenIds = new Set<string>();
  let lastOrder = -1;
  for (const section of analysis.sections) {
    const definition = SECTION_CATALOG.find((item) => item.id === section.id);
    if (!definition) {
      r.add("error", scope, `Sección desconocida: id="${section.id}". Ids válidos: ${SECTION_IDS.join(", ")}.`);
      continue;
    }
    if (seenIds.has(section.id)) r.add("error", scope, `Sección repetida: "${section.id}".`);
    seenIds.add(section.id);

    const order = SECTION_IDS.indexOf(definition.id);
    if (order < lastOrder) r.add("error", scope, `La sección "${section.id}" está fuera del orden canónico (${SECTION_IDS.join(" → ")}).`);
    lastOrder = Math.max(lastOrder, order);

    r.need(pub, section.title.trim().length >= 8, scope, `La sección "${section.id}" necesita un título propio de la guía (mínimo 8 caracteres).`);
    const used = analysis.components.filter((component) => component.sectionIndex === section.index).map((component) => component.name);
    r.need(pub, used.includes(definition.component) || (definition.alsoAccepts ?? []).some((name) => used.includes(name)), scope, `La sección "${section.id}" debe usar <${definition.component}>.`);

    const dataKey = SECTION_DATA_KEY[definition.id];
    if (dataKey && !(dataKey in data)) r.need(pub, false, scope, `La sección "${section.id}" no tiene datos: falta data.${dataKey}.`);
  }
  for (const definition of SECTION_CATALOG) {
    if (definition.required) r.need(pub, ids.includes(definition.id), scope, `Falta la sección obligatoria "${definition.id}" (${definition.label}).`);
  }
  const titles = analysis.sections.map((section) => section.title.trim().toLowerCase());
  if (new Set(titles).size !== titles.length) r.add("error", scope, "Hay dos secciones con el mismo título.");
  // El título del checklist se muestra como H3 dentro de su sección: no debe repetir el H2.
  // Los pasos del método y los de la aplicación se muestran como H3 «Paso N: título»: no deben repetirse.
  const methodSteps = asList(asObject(data.method).steps).map((step) => String(asObject(step).title).trim().toLowerCase());
  for (const step of asList(asObject(data.application).steps)) {
    const title = String(asObject(step).title).trim().toLowerCase();
    r.warn(!methodSteps.includes(title), scope, `El paso «${title}» se repite en method y en application: el encabezado aparece dos veces.`);
  }
  // Lo mismo vale para el título de las tablas comparativas (se muestran como H3).
  const innerHeadings = [asObject(data.checklist).title, ...Object.values(asObject(data.comparisons)).map((table) => asObject(table).caption)];
  for (const heading of innerHeadings) {
    if (typeof heading === "string") r.warn(!titles.includes(heading.trim().toLowerCase()), scope, `«${heading}» se repite como encabezado de sección y de bloque: el encabezado aparece dos veces.`);
  }

  // referencias a los datos
  const referenced = new Set<string>();
  const brokenRefs = new Set<string>();
  for (const ref of analysis.dataRefs) {
    referenced.add(ref[0]);
    // `evidence` es opcional a propósito: EvidenceBlock no muestra nada si no existe.
    if (ref[0] !== "evidence" && getPath(data, ref) === undefined) brokenRefs.add(`data.${ref.join(".")}`);
  }
  for (const ref of brokenRefs) r.need(pub, false, scope, `guide.mdx usa ${ref}, que no existe en data.ts.`);

  const dataUnused = DATA_KEYS.filter((key) => key in data && !["metadata", "hero", "images", "glossary", "mediaPlan"].includes(key) && !referenced.has(key));
  for (const key of dataUnused) r.warn(false, scope, `data.${key} está definido pero guide.mdx no lo usa.`);

  for (const key of Object.keys(asObject(data.prompts))) {
    const used = analysis.dataRefs.some((ref) => ref[0] === "prompts" && ref[1] === key);
    r.warn(used, scope, `El prompt "${key}" está definido pero ninguna sección lo usa.`);
  }
  for (const key of Object.keys(asObject(data.comparisons))) {
    const used = analysis.dataRefs.some((ref) => ref[0] === "comparisons" && ref[1] === key);
    r.warn(used, scope, `La tabla comparativa "${key}" está definida pero ninguna sección la usa.`);
  }

  // avisos obligatorios: cálculos y fuentes
  const meta = asObject(data.metadata);
  const variants = analysis.components.filter((component) => component.name === "Callout").map((component) => component.attrs.variant?.value);
  if (meta.handlesNumbers === true) r.need(pub, variants.includes("calculos"), scope, 'La guía maneja cifras: necesita <Callout variant="calculos"> (cálculo, interpretación y decisión).');
  if (meta.usesExternalInfo === true) r.need(pub, variants.includes("fuentes"), scope, 'La guía usa información externa: necesita <Callout variant="fuentes"> (datos y fuentes).');

  // mdx-components registra lo que la guía necesita: se comprueba una vez en checkRegistry()
}

/* ────────────────────────────── contenido ────────────────────────────── */

function checkList(r: Reporter, pub: boolean, scope: string, label: string, value: unknown, min: number) {
  r.need(pub, Array.isArray(value) && value.length >= min, scope, `${label}: se necesitan al menos ${min}.`);
}

function checkContent(g: LoadedGuide, r: Reporter): void {
  const scope = `${g.category}/${g.slug}`;
  const pub = g.published;
  if (!g.data) return;
  const data = asObject(g.data);

  // hero
  const hero = asObject(data.hero);
  r.need(pub, isText(hero.subtitle) && hero.subtitle.length >= 30, scope, "hero.subtitle debe explicar el valor de la guía (mínimo 30 caracteres).");
  r.need(pub, (DIFFICULTIES as readonly string[]).includes(String(hero.difficulty)), scope, `hero.difficulty debe ser ${DIFFICULTIES.join(" | ")}.`);
  if (hero.tools !== undefined) r.need(pub, isTextList(hero.tools), scope, "hero.tools debe ser una lista de textos.");
  r.warn(isObject(hero.image) || isObject(asObject(data.images).hero), scope, "No hay imagen hero declarada: la página funciona (cabecera tipográfica), pero sin imagen principal ni imagen para redes.");

  // problema y resultado
  const problem = asObject(data.problem);
  r.need(pub, isText(problem.summary) && wordsIn(problem.summary) >= 40, scope, "problem.summary debe desarrollar el problema real (mínimo 40 palabras).");
  checkList(r, pub, scope, "problem.symptoms", problem.symptoms, 3);
  const outcome = asObject(data.outcome);
  r.need(pub, isText(outcome.summary), scope, "outcome.summary: falta el resultado esperado.");
  checkList(r, pub, scope, "outcome.deliverables", outcome.deliverables, 2);

  if ("audience" in data) {
    const audience = asObject(data.audience);
    checkList(r, pub, scope, "audience.forWho", audience.forWho, 2);
    checkList(r, pub, scope, "audience.notForWho", audience.notForWho, 1);
    r.error(isTextList(audience.forWho) && isTextList(audience.notForWho), scope, "audience.forWho y audience.notForWho deben ser listas de textos.");
  }

  // caso
  const caseStudy = asObject(data.caseStudy);
  for (const key of ["business", "situation", "goal", "problem", "application", "result"]) r.need(pub, isText(caseStudy[key]), scope, `caseStudy.${key} está vacío.`);
  checkList(r, pub, scope, "caseStudy.data", caseStudy.data, 3);
  r.need(pub, typeof caseStudy.fictional === "boolean", scope, "caseStudy.fictional debe ser true o false.");
  if (caseStudy.fictional === false) r.error(isText(caseStudy.evidence), scope, "Un caso no ficticio necesita caseStudy.evidence (fuente verificable). Si no se puede verificar, es ficticio.");

  // antes, datos, método
  const before = asObject(data.before);
  r.need(pub, isText(before.request) && isText(before.whyInsufficient), scope, "before necesita request y whyInsufficient.");
  checkList(r, pub, scope, "before.issues", before.issues, 2);
  const prep = asObject(data.dataPreparation);
  r.need(pub, isText(prep.intro), scope, "dataPreparation.intro está vacío.");
  checkList(r, pub, scope, "dataPreparation.items", prep.items, 3);
  r.need(pub, asList(prep.items).some((item) => asObject(item).required === true), scope, "dataPreparation debe marcar al menos un dato como imprescindible.");
  const method = asObject(data.method);
  checkList(r, pub, scope, "method.steps", method.steps, 3);
  for (const [i, step] of asList(method.steps).entries()) {
    const s = asObject(step);
    r.need(pub, isText(s.title) && isText(s.description), scope, `method.steps[${i}] necesita título y descripción.`);
  }

  // prompts
  const prompts = asObject(data.prompts);
  const promptIds = Object.keys(prompts);
  r.need(pub, promptIds.length >= 1, scope, "Debe definir al menos un prompt en data.prompts.");
  for (const id of promptIds) checkPrompt(id, asObject(prompts[id]), scope, pub, r);

  // resultados
  for (const key of ["firstResult", "improvedResult"] as const) {
    if (!(key in data)) continue;
    const result = asObject(data[key]);
    r.error(result.kind === "generated" || result.kind === "userData", scope, `${key}.kind debe ser "generated" o "userData" (etiqueta de origen).`);
    checkList(r, pub, scope, `${key}.parts`, result.parts, 1);
    checkParts(asList(result.parts), `${key}.parts`, scope, r);
  }

  // análisis e iteración
  const analysis = asObject(data.analysis);
  r.need(pub, isText(analysis.intro) && isText(analysis.conclusion), scope, "analysis necesita intro y conclusion.");
  checkList(r, pub, scope, "analysis.criteria", analysis.criteria, 3);
  for (const [i, item] of asList(analysis.criteria).entries()) {
    const c = asObject(item);
    r.error(["ok", "improve", "risk"].includes(String(c.verdict)), scope, `analysis.criteria[${i}].verdict debe ser ok | improve | risk.`);
    const rubricIds = asList(asObject(data.rubric).criteria).map((x) => String(asObject(x).id));
    if (c.criterionId !== undefined) r.error(rubricIds.includes(String(c.criterionId)), scope, `analysis.criteria[${i}].criterionId «${String(c.criterionId)}» no existe en rubric.criteria.`);
    r.need(pub, (isText(c.criterion) || isText(c.criterionId)) && isText(c.comment), scope, `analysis.criteria[${i}] necesita criterionId (o criterion) y comment.`);
  }
  const iteration = asObject(data.iteration);
  r.need(pub, isText(iteration.intro) && isText(iteration.why), scope, "iteration necesita intro y why (por qué se itera).");
  r.error(typeof iteration.promptId === "string" && iteration.promptId in prompts, scope, `iteration.promptId "${String(iteration.promptId)}" no existe en data.prompts.`);

  // antes/después
  if ("beforeAfter" in data) {
    const ba = asObject(data.beforeAfter);
    for (const side of ["before", "after"] as const) {
      const parts = asList(asObject(ba[side]).parts);
      r.need(pub, parts.length >= 1, scope, `beforeAfter.${side}.parts está vacío.`);
      checkParts(parts, `beforeAfter.${side}.parts`, scope, r);
    }
    r.need(pub, isText(ba.takeaway), scope, "beforeAfter.takeaway: explica qué cambia entre antes y después.");
  }

  // ejemplos
  if ("examples" in data) {
    const examples = asList(data.examples);
    r.need(pub, examples.length >= 2, scope, "Una sección de ejemplos necesita al menos 2 ejemplos distintos.");
    const seen = new Set<string>();
    for (const [i, item] of examples.entries()) {
      const e = asObject(item);
      r.need(pub, isText(e.id) && isText(e.title) && isText(e.scenario) && isText(e.approach) && isText(e.decision), scope, `examples[${i}] está incompleto (id, title, scenario, approach, decision).`);
      if (typeof e.id === "string") {
        r.error(!seen.has(e.id), scope, `examples: id repetido "${e.id}".`);
        seen.add(e.id);
      }
      r.error(e.fictional === true, scope, `examples[${i}] debe ser fictional: true (los ejemplos no ficticios necesitan una fuente que este modelo no admite).`);
      checkList(r, pub, scope, `examples[${i}].keyData`, e.keyData, 2);
    }
  }

  // tablas comparativas
  for (const [id, item] of Object.entries(asObject(data.comparisons))) checkTable(item, `comparisons.${id}`, scope, r);

  // secciones de práctica
  checkList(r, pub, scope, "mistakes", data.mistakes, 3);
  for (const [i, item] of asList(data.mistakes).entries()) {
    const m = asObject(item);
    r.need(pub, isText(m.title) && isText(m.whyItHurts) && isText(m.instead), scope, `mistakes[${i}] necesita title, whyItHurts e instead.`);
  }
  if ("personalization" in data) {
    const personalization = asObject(data.personalization);
    r.need(pub, isText(personalization.intro), scope, "personalization.intro está vacío.");
    checkList(r, pub, scope, "personalization.dimensions", personalization.dimensions, 3);
  }
  const verification = asObject(data.verification);
  r.need(pub, isText(verification.intro) && isText(verification.principle), scope, "verification necesita intro y principle.");
  checkList(r, pub, scope, "verification.items", verification.items, 3);
  if ("application" in data) {
    const application = asObject(data.application);
    r.need(pub, isText(application.intro), scope, "application.intro está vacío.");
    checkList(r, pub, scope, "application.steps", application.steps, 3);
  }

  if ("checklist" in data) {
    const checklist = asObject(data.checklist);
    r.need(pub, isText(checklist.id) && isText(checklist.title), scope, "checklist necesita id y title.");
    checkList(r, pub, scope, "checklist.items", checklist.items, 3);
    const seen = new Set<string>();
    for (const item of asList(checklist.items)) {
      const id = asObject(item).id;
      r.error(isText(id) && !seen.has(id), scope, `checklist: id vacío o repetido (${String(id)}).`);
      if (typeof id === "string") seen.add(id);
    }
  }
  if ("variations" in data) checkList(r, pub, scope, "variations.items", asObject(data.variations).items, 2);
  if ("limitations" in data) checkList(r, pub, scope, "limitations.items", asObject(data.limitations).items, 2);

  const conclusion = asObject(data.conclusion);
  r.need(pub, isText(conclusion.summary), scope, "conclusion.summary está vacío.");
  checkList(r, pub, scope, "conclusion.takeaways", conclusion.takeaways, 3);

  // FAQ
  const faq = asList(data.faq);
  r.need(pub, faq.length >= LIMITS.faqMin, scope, `Necesita al menos ${LIMITS.faqMin} preguntas frecuentes reales.`);
  const questions = new Set<string>();
  for (const [i, item] of faq.entries()) {
    const f = asObject(item);
    r.need(pub, isText(f.question) && isText(f.answer) && String(f.answer).length >= 40, scope, `faq[${i}] necesita pregunta y una respuesta útil (40+ caracteres).`);
    if (isText(f.question)) {
      r.error(!questions.has(f.question.toLowerCase()), scope, `faq: pregunta repetida "${f.question}".`);
      questions.add(f.question.toLowerCase());
    }
  }

  checkGuideKind(g, r);
  checkModules(g, r);
  checkSources(data, scope, pub, r);
  checkEvidence(data, scope, r);
  checkVideo(data, scope, pub, r);
  checkMediaPlan(g, r);
}

/** Tipo de guía, glosario compartido y número/función de los prompts. */
function checkGuideKind(g: LoadedGuide, r: Reporter): void {
  const scope = `${g.category}/${g.slug}`;
  const data = asObject(g.data);
  const meta = asObject(data.metadata);
  const types = meta.tipoGuia;

  if (types === undefined || (Array.isArray(types) && types.length === 0)) {
    r.warn(false, scope, "Falta metadata.tipoGuia (uno o más de: " + GUIDE_TYPES.join(", ") + "). El tipo decide qué secciones y módulos necesita la guía.");
  } else if (!Array.isArray(types) || !types.every((type) => (GUIDE_TYPES as readonly string[]).includes(String(type)))) {
    r.add("error", scope, "metadata.tipoGuia debe ser una lista de tipos válidos: " + GUIDE_TYPES.join(", ") + ".");
  }

  // 3 a 6 prompts, cada uno con su función (se avisa si hay menos o más)
  const promptCount = Object.keys(asObject(data.prompts)).length;
  if (g.published && promptCount > 0) r.warn(promptCount >= 3 && promptCount <= 6, scope, `Tiene ${promptCount} prompt(s): lo habitual son 3 a 6, cada uno con una función distinta (entrevista, principal, evaluación, iteración, adaptación, verificación).`);

  // glosario compartido
  const listed = Array.isArray(data.glossary) ? data.glossary : [];
  for (const id of listed) r.error(typeof id === "string" && getGlossaryEntry(id) !== undefined, scope, `glossary: «${String(id)}» no existe en content/glosario.ts.`);
  const used = new Set<string>();
  for (const component of g.analysis?.components ?? []) {
    if (component.name !== "Term") continue;
    const id = component.attrs.id?.kind === "string" ? component.attrs.id.value : "";
    used.add(id);
    r.error(getGlossaryEntry(id) !== undefined, scope, `<Term id="${id}"> no existe en content/glosario.ts.`);
    r.error(listed.includes(id), scope, `<Term id="${id}"> se usa pero no está en data.glossary: el enlace a su definición no funcionaría.`);
  }
  for (const id of listed) if (typeof id === "string") r.warn(used.has(id), scope, `El término «${id}» está en data.glossary pero el texto no lo usa con <Term>.`);

  // constructor de prompt: útil cuando el prompt principal tiene 3 o más variables
  const principal = asObject(asObject(data.prompts).principal);
  if (g.published && asList(principal.variables).length >= 3) {
    r.warn(g.analysis?.components.some((component) => component.name === "PromptBuilder") ?? false, scope, "El prompt principal tiene 3 o más variables: conviene un <PromptBuilder> para rellenarlo en vivo.");
  }
}

/** Ficha rápida, marco de trabajo y rúbrica de autoevaluación. */
function checkModules(g: LoadedGuide, r: Reporter): void {
  const scope = `${g.category}/${g.slug}`;
  const pub = g.published;
  const data = asObject(g.data);

  if ("quickFacts" in data) {
    const facts = asObject(data.quickFacts);
    r.need(pub, isText(facts.time) && isText(facts.result) && isTextList(facts.needs) && asList(facts.needs).length >= 1, scope, "quickFacts necesita time, needs (al menos 1) y result.");
    if (facts.cost !== undefined) {
      r.error(isText(facts.cost) && isRealDate(facts.costVerifiedAt), scope, "quickFacts.cost solo se muestra si se verificó: exige costVerifiedAt con la fecha real (AAAA-MM-DD).");
      if (isRealDate(facts.costVerifiedAt)) r.error(facts.costVerifiedAt <= TODAY, scope, "quickFacts.costVerifiedAt está en el futuro.");
    }
  }

  if ("framework" in data) {
    const framework = asObject(data.framework);
    r.need(pub, isText(framework.intro), scope, "framework.intro está vacío.");
    checkList(r, pub, scope, "framework.blocks", framework.blocks, 3);
    for (const [i, block] of asList(framework.blocks).entries()) {
      const b = asObject(block);
      r.need(pub, isText(b.title) && isText(b.detail), scope, `framework.blocks[${i}] necesita title y detail.`);
    }
  }

  if ("rubric" in data) {
    const rubric = asObject(data.rubric);
    r.need(pub, isText(rubric.id) && isText(rubric.title) && isText(rubric.intro), scope, "rubric necesita id, title e intro.");
    const criteria = asList(rubric.criteria);
    checkList(r, pub, scope, "rubric.criteria", criteria, 3);
    const ids = new Set<string>();
    for (const item of criteria) {
      const c = asObject(item);
      r.error(isText(c.id) && isText(c.label) && !ids.has(String(c.id)), scope, "rubric.criteria: cada criterio necesita id único y label.");
      ids.add(String(c.id));
    }
    const outcomes = asList(rubric.outcomes).map(asObject);
    r.need(pub, outcomes.length >= 2, scope, "rubric.outcomes: se necesitan al menos 2 umbrales de puntaje.");
    r.error(outcomes.every((o) => typeof o.min === "number" && isText(o.label) && isText(o.advice)), scope, "rubric.outcomes: cada umbral necesita min (número), label y advice.");
    const mins = outcomes.map((o) => Number(o.min)).sort((a, b) => a - b);
    if (mins.length > 0) {
      r.error(mins[0] === 0, scope, "rubric.outcomes: el primer umbral debe ser min 0 para cubrir cualquier puntaje.");
      r.error(mins[mins.length - 1] <= criteria.length * 2, scope, "rubric.outcomes: hay un umbral mayor que el puntaje máximo posible.");
    }
  }
}

function checkSources(data: Unknown, scope: string, pub: boolean, r: Reporter): void {
  if (!("sources" in data)) return;
  const sources = asObject(data.sources);
  const items = asList(sources.items);
  r.need(pub, items.length >= 1, scope, "sources.items: lista al menos una fuente.");
  const seen = new Set<string>();
  for (const [i, item] of items.entries()) {
    const s = asObject(item);
    const where = `sources.items[${i}]`;
    r.error(isText(s.title) && isText(s.publisher), scope, `${where} necesita title y publisher.`);
    r.error(typeof s.url === "string" && /^https:\/\/[^\s/]+\.[^\s/]+/.test(s.url), scope, `${where}.url debe ser un enlace https a la fuente primaria.`);
    if (typeof s.url === "string") {
      r.error(!seen.has(s.url), scope, `${where}: fuente repetida (${s.url}).`);
      seen.add(s.url);
    }
    r.error(isRealDate(s.consultedAt), scope, `${where}.consultedAt debe ser la fecha REAL de consulta (AAAA-MM-DD).`);
    if (isRealDate(s.consultedAt)) r.error(s.consultedAt <= TODAY, scope, `${where}.consultedAt está en el futuro.`);
  }
}

function checkEvidence(data: Unknown, scope: string, r: Reporter): void {
  if (!("evidence" in data)) return;
  const evidence = asObject(data.evidence);
  const has =
    evidence.screenshots !== undefined || evidence.ownTest !== undefined || evidence.authorNote !== undefined || evidence.review !== undefined || evidence.pruebas !== undefined || evidence.casoReal !== undefined || evidence.revisadoEn !== undefined;
  // Estándar v3: `evidence` vacío es válido (lo rellena solo el autor: pruebas de prompts, caso real, revisión).
  if (asObject(data.metadata).estandarGuia !== 3) r.warn(has, scope, "data.evidence está vacío: quítalo o añade la evidencia real.");
  if (evidence.ownTest !== undefined) {
    const test = asObject(evidence.ownTest);
    r.error(isText(test.description) && isRealDate(test.date), scope, "evidence.ownTest necesita description y una fecha real (date).");
    if (isRealDate(test.date)) r.error(test.date <= TODAY, scope, "evidence.ownTest.date está en el futuro.");
  }
  if (evidence.authorNote !== undefined) r.error(isText(asObject(evidence.authorNote).text), scope, "evidence.authorNote necesita text.");
  if (evidence.review !== undefined) {
    const review = asObject(evidence.review);
    r.error(isRealDate(review.reviewedAt), scope, "evidence.review.reviewedAt debe ser una fecha real (AAAA-MM-DD).");
    if (isRealDate(review.reviewedAt)) r.error(review.reviewedAt <= TODAY, scope, "evidence.review.reviewedAt está en el futuro.");
  }
}

function checkPrompt(id: string, prompt: Unknown, scope: string, pub: boolean, r: Reporter): void {
  const where = `${scope} › prompt "${id}"`;
  for (const key of ["title", "objective", "whenToUse"]) r.need(pub, isText(prompt[key]), where, `Falta ${key}.`);
  for (const key of ["example", "expectedResult"]) if (prompt[key] !== undefined) r.need(pub, isText(prompt[key]), where, `${key} está vacío.`);
  for (const key of ["requiredData", "recommendations", "warnings"]) if (prompt[key] !== undefined) r.need(pub, isTextList(prompt[key]), where, `${key} debe ser una lista de textos.`);
  const evaluationGiven = isText(prompt.evaluate) && isText(prompt.improve);
  const legacy = asList(prompt.recommendations).length >= 1;
  r.need(pub, evaluationGiven || legacy, where, "Falta cómo evaluarlo y cómo mejorarlo (evaluate e improve).");
  r.need(pub, isText(prompt.prompt) && String(prompt.prompt).length >= 200, where, "El texto del prompt es demasiado corto (mínimo 200 caracteres).");

  const explanation = asList(prompt.explanation);
  r.need(pub, explanation.length >= 2, where, "explanation: explica al menos 2 partes del prompt.");
  for (const [i, item] of explanation.entries()) {
    const part = asObject(item);
    r.need(pub, isText(part.part) && isText(part.why), where, `explanation[${i}] necesita part y why.`);
  }

  // variables: documentadas ⇔ usadas
  const variables = asList(prompt.variables).map(asObject);
  const documented = new Set<string>();
  for (const variable of variables) {
    const name = String(variable.name ?? "");
    r.error(VARIABLE_NAME_PATTERN.test(name), where, `Nombre de variable inválido: "${name}" (usa MAYÚSCULAS, dígitos y _).`);
    r.error(!documented.has(name), where, `Variable repetida: ${name}.`);
    documented.add(name);
    r.need(pub, isText(variable.description) && isText(variable.example), where, `La variable ${name} necesita description y example.`);
  }
  const text = typeof prompt.prompt === "string" ? prompt.prompt : "";
  const used = new Set([...text.matchAll(new RegExp(VARIABLE_SOURCE, "g"))].map((match) => match[1]));
  for (const name of used) r.need(pub, documented.has(name), where, `La variable {{${name}}} aparece en el prompt pero no está documentada en variables.`);
  for (const name of documented) r.warn(used.has(name), where, `La variable ${name} está documentada pero no se usa en el prompt.`);
}

function checkParts(parts: unknown[], label: string, scope: string, r: Reporter): void {
  for (const [i, item] of parts.entries()) {
    const part = asObject(item);
    const type = String(part.type);
    if (!["text", "list", "code", "table", "image"].includes(type)) {
      r.add("error", scope, `${label}[${i}].type inválido: "${type}".`);
    } else if (type === "table") checkTable(part.table, `${label}[${i}].table`, scope, r);
    else if (type === "text") r.error(isText(part.text), scope, `${label}[${i}].text está vacío.`);
    else if (type === "list") r.error(isTextList(part.items) && asList(part.items).length > 0, scope, `${label}[${i}].items debe ser una lista de textos.`);
    else if (type === "code") r.error(isText(part.code), scope, `${label}[${i}].code está vacío.`);
  }
}

function checkTable(value: unknown, label: string, scope: string, r: Reporter): void {
  const table = asObject(value);
  r.error(isText(table.caption), scope, `${label}.caption falta.`);
  r.error(isText(table.purpose) && String(table.purpose).length >= 30, scope, `${label}.purpose debe explicar qué decisión o comprensión da la tabla (30+ caracteres).`);
  const columns = asList(table.columns);
  const rows = asList(table.rows);
  r.error(columns.length >= 2 && columns.every(isText), scope, `${label}.columns necesita al menos 2 columnas con texto.`);
  r.error(rows.length >= 1, scope, `${label}.rows está vacío.`);
  for (const [i, row] of rows.entries()) {
    const cells = asList(row);
    r.error(cells.length === columns.length, scope, `${label}.rows[${i}] tiene ${cells.length} celdas y hay ${columns.length} columnas.`);
    r.error(cells.every((cell) => typeof cell === "string" && cell.trim().length > 0), scope, `${label}.rows[${i}] tiene celdas vacías (usa «—» si no aplica).`);
  }
}

function checkVideo(data: Unknown, scope: string, pub: boolean, r: Reporter): void {
  if (!("video" in data)) return;
  const video = asObject(data.video);
  r.error(video.status === "upcoming" || video.status === "published", scope, 'video.status debe ser "upcoming" o "published".');
  r.need(pub, isText(video.title) && isText(video.description), scope, "video necesita title y description.");
  if (video.status === "published") {
    r.error(typeof video.youtubeId === "string" && /^[\w-]{11}$/.test(video.youtubeId), scope, "Un video publicado necesita un youtubeId REAL (11 caracteres). Nunca se inventa.");
    r.error(isRealDate(video.uploadDate), scope, "Un video publicado necesita uploadDate (AAAA-MM-DD) para VideoObject.");
    r.warn(isText(video.duration), scope, "video.duration sin definir.");
  } else {
    r.error(video.youtubeId === undefined, scope, 'video.status "upcoming" no puede llevar youtubeId.');
  }
}

function checkMediaPlan(g: LoadedGuide, r: Reporter): void {
  const scope = `${g.category}/${g.slug}`;
  const data = asObject(g.data);
  if (!("mediaPlan" in data)) return; // opcional: el plan de video aún no se aplica a todas las guías
  const plan = asObject(data.mediaPlan);
  const longVideo = asObject(plan.longVideo);
  const shorts = asList(plan.shorts);
  const sections = new Set(g.analysis?.sections.map((section) => section.id) ?? []);

  r.need(g.published, isText(longVideo.title) && isText(longVideo.description), scope, "mediaPlan.longVideo necesita title y description.");
  r.warn(typeof longVideo.estimatedDuration === "number" && longVideo.estimatedDuration >= LIMITS.longVideoMinMinutes, scope, `mediaPlan.longVideo.estimatedDuration debería ser de ${LIMITS.longVideoMinMinutes}+ minutos.`);
  const chapters = asList(longVideo.chapters);
  r.need(g.published, chapters.length >= 3, scope, "mediaPlan.longVideo.chapters: se necesitan al menos 3 capítulos.");
  for (const [i, chapter] of chapters.entries()) {
    const source = String(asObject(chapter).sourceSection);
    r.error(sections.has(source), scope, `mediaPlan.longVideo.chapters[${i}].sourceSection "${source}" no es una sección de esta guía.`);
  }
  r.warn(shorts.length >= LIMITS.shortsMin && shorts.length <= LIMITS.shortsMax, scope, `mediaPlan.shorts: se esperan ${LIMITS.shortsMin}–${LIMITS.shortsMax} ideas (hay ${shorts.length}).`);
  for (const [i, item] of shorts.entries()) {
    const short = asObject(item);
    r.error(isText(short.title) && isText(short.hook) && isText(short.topic), scope, `mediaPlan.shorts[${i}] necesita title, hook y topic.`);
    r.error(sections.has(String(short.sourceSection)), scope, `mediaPlan.shorts[${i}].sourceSection "${String(short.sourceSection)}" no es una sección de esta guía.`);
  }
}

/* ────────────────────────────── imágenes ────────────────────────────── */

interface FoundImage {
  path: string;
  value: Unknown;
}

function collectImages(value: unknown, trail: string, out: FoundImage[]): void {
  if (Array.isArray(value)) value.forEach((item, i) => collectImages(item, `${trail}[${i}]`, out));
  else if (isObject(value)) {
    if (typeof value.src === "string" && "alt" in value) out.push({ path: trail, value });
    else for (const [key, item] of Object.entries(value)) collectImages(item, trail ? `${trail}.${key}` : key, out);
  }
}

/** Peso recomendado de una imagen de guía (WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB). */
const IMAGE_MAX_BYTES = 200 * 1024;

/** Manifiesto `data.images`: un slot por imagen prevista, con su sección, propósito, proporción y alt. */
function checkManifest(g: LoadedGuide, r: Reporter, publicDir: string, strict: boolean, prefix: string): void {
  const scope = `${g.category}/${g.slug}`;
  const data = asObject(g.data);
  if (!("images" in data)) return;
  const manifest = asObject(data.images);
  const sections = new Set(g.analysis?.sections.map((section) => section.id) ?? []);
  const files = new Set<string>();
  const perSection = new Map<string, number>();

  r.warn("hero" in manifest, scope, "El manifiesto no declara el slot «hero» (hero.webp, 16:9): toda guía nueva lo declara.");

  for (const [key, value] of Object.entries(manifest)) {
    const slot = asObject(value);
    const where = `images.${key}`;
    const file = typeof slot.file === "string" ? slot.file : "";
    r.error(/^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/.test(file), scope, `${where}.file debe ser un nombre semántico en WebP (paso-02.webp).`);
    r.error(!files.has(file), scope, `${where}: archivo repetido (${file}).`);
    files.add(file);
    r.error(slot.src === `${prefix}${file}`, scope, `${where}.src no coincide con la carpeta de la guía (usa guideSlots()).`);
    r.error((ASPECT_RATIOS as readonly string[]).includes(String(slot.ratio)), scope, `${where}.ratio inválido.`);
    r.need(g.published, isText(slot.purpose) && String(slot.purpose).length >= 30, scope, `${where}.purpose debe explicar qué muestra la imagen y por qué ayuda (30+ caracteres).`);
    r.warn(isText(slot.description) && String(slot.description).length >= 100, scope, `${where}.description falta o es corta: describe en 2 a 4 frases qué debe verse, qué resaltar y qué datos ficticios usar.`);

    const section = String(slot.section);
    if (section === "hero") {
      r.warn(slot.ratio === "16/9", scope, `${where}: la imagen hero se declara en 16:9.`);
    } else {
      r.error((SECTION_IDS as readonly string[]).includes(section), scope, `${where}.section "${section}" no es una sección válida.`);
      r.error(sections.has(section), scope, `${where}.section "${section}" no existe en esta guía.`);
      const used = g.analysis?.dataRefs.some((ref) => ref[0] === "images" && ref[1] === key);
      r.warn(Boolean(used), scope, `${where} está declarado pero guide.mdx no lo coloca (<GuideImage slot={data.images.${key}} />).`);
    }
    if (slot.promptId === undefined) perSection.set(section, (perSection.get(section) ?? 0) + 1); // las pruebas de prompts no cuentan como imagen de la sección

    const full = path.join(publicDir, prefix, file);
    if (!fs.existsSync(full)) {
      const message = `${section === "hero" ? "HERO faltante" : slot.promptId ? "PRUEBA faltante" : "Imagen faltante"}: ${file} (${String(slot.ratio).replace("/", ":")}) — ${String(slot.purpose ?? "").slice(0, 110)}`;
      if (strict) r.add("error", scope, message);
      else r.add("warn", scope, message);
    } else {
      r.warn(fs.statSync(full).size <= IMAGE_MAX_BYTES, scope, `${file} pesa más de 200 KB: conviene optimizarla (WebP, máx. 1600 px de ancho).`);
    }
  }
  for (const [section, count] of perSection) r.warn(count <= 1, scope, `Más de una imagen en la sección «${section}»: el máximo recomendado es una por sección.`);
  const extra = Object.values(manifest).filter((value) => asObject(value).section !== "hero" && asObject(value).promptId === undefined).length;
  r.warn(extra <= 8, scope, `${extra} imágenes además del hero: la referencia es de 4 a 8 (hasta ~10 en tutoriales con interfaz); menos es mejor que relleno.`);
}

function checkImages(g: LoadedGuide, r: Reporter, publicDir: string, strict: boolean): void {
  const scope = `${g.category}/${g.slug}`;
  if (!g.data) return;
  const found: FoundImage[] = [];
  collectImages(g.data, "", found);
  const prefix = `/images/guias/${g.category}/${g.slug}/`;
  const missing = new Set<string>();
  const referenced = new Set<string>();

  for (const { path: where, value } of found) {
    const src = String(value.src);
    const file = src.slice(prefix.length);
    referenced.add(file);
    r.error(src.startsWith(prefix), scope, `${where}: la imagen debe estar en ${prefix} (usa guideImages()).`);
    r.error(IMAGE_EXTENSIONS.some((extension) => src.toLowerCase().endsWith(extension)), scope, `${where}: formato no admitido (${IMAGE_EXTENSIONS.join(", ")}).`);
    r.error(isText(value.alt), scope, `${where}: la imagen necesita texto alternativo (alt).`);
    if (isText(value.alt)) r.warn(String(value.alt).length >= 15, scope, `${where}: el alt es demasiado corto para describir la imagen.`);
    if (value.aspectRatio !== undefined) r.error((ASPECT_RATIOS as readonly string[]).includes(String(value.aspectRatio)), scope, `${where}: aspectRatio inválido.`);
    r.warn(value.priority !== true || where.startsWith("hero"), scope, `${where}: priority solo debe usarse en la imagen hero.`);

    // Los slots del manifiesto avisan uno a uno (más abajo); el resto se agrupa.
    if (!where.startsWith("images.") && src.startsWith(prefix) && !fs.existsSync(path.join(publicDir, src))) missing.add(file);
  }

  checkManifest(g, r, publicDir, strict, prefix);

  if (missing.size > 0) {
    const message = `${missing.size} imagen(es) aún no subidas a public${prefix}: ${[...missing].join(", ")}. La página funciona sin ellas (en producción se omiten).`;
    if (strict) r.add("error", scope, message);
    else r.add("warn", scope, message);
  }
  const dir = path.join(publicDir, prefix);
  if (fs.existsSync(dir)) {
    const unused = fs.readdirSync(dir).filter((file) => !file.startsWith(".") && !referenced.has(file));
    r.warn(unused.length === 0, scope, `Archivos en la carpeta de imágenes que la guía no usa: ${unused.join(", ")}.`);
  }
}

/* ────────────────────────────── texto y enlaces ────────────────────────────── */

function checkText(g: LoadedGuide, r: Reporter): void {
  const scope = `${g.category}/${g.slug}`;
  if (!g.data || !g.analysis) return;
  const strings = [...visibleStrings(g.data), g.analysis.bodyText];
  const joined = strings.join("\n");

  // «TODO» va en mayúsculas y como palabra: «todo» es una palabra normal en español.
  const unfinished = /\bTODO\b/.test(joined) || /lorem ipsum|\[(?:completar|pendiente|insertar)[^\]]*\]/i.test(joined);
  if (unfinished) r.need(g.published, false, scope, "Hay marcadores de contenido sin terminar (TODO, lorem ipsum, [completar]…).");
  for (const claim of UNSOURCED_CLAIMS) {
    const match = claim.pattern.exec(joined);
    if (match) r.warn(false, scope, `Posible afirmación sin respaldo (${claim.label}): «${match[0]}». Sin fuente verificable, no se afirma.`);
  }

  const words = g.analysis.wordCount + countWords(visibleStrings(g.data));
  if (g.published) r.warn(words >= LIMITS.minWords, scope, `Solo ${words} palabras visibles: revisa si la guía tiene la profundidad necesaria (${LIMITS.minWords}+).`);
}

function checkLinks(g: LoadedGuide, r: Reporter, known: Map<string, LoadedGuide>): void {
  const scope = `${g.category}/${g.slug}`;
  if (!g.analysis) return;
  const live = new Set<string>(["/", "/guias", ...categories.map((c) => `/${c.slug}`), ...institutionalPages.map((p) => p.path)]);
  for (const link of new Set(g.analysis.links)) {
    if (link.startsWith("http://")) {
      r.add("error", scope, `Enlace no seguro: ${link}. Usa https.`);
    } else if (link.startsWith("/")) {
      const clean = link.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
      const match = /^\/([a-z0-9-]+)\/guias\/([a-z0-9-]+)$/.exec(clean);
      if (match) {
        const target = known.get(match[2]);
        const ok = target && target.category === match[1] && (!g.published || target.published);
        r.error(Boolean(ok), scope, `Enlace interno roto o a una guía no publicada: ${link}.`);
      } else if (!live.has(clean)) {
        r.add("error", scope, `Enlace interno a una ruta que no existe: ${link}.`);
      }
    }
  }
  const metadata = asObject(asObject(g.data).metadata);
  const nextGuide = asObject(asObject(g.data).conclusion).nextGuide;
  if (typeof nextGuide === "string") r.error(known.has(nextGuide) || asList(metadata.relatedGuides).includes(nextGuide) || plannedGuides.some((p) => p.slug === nextGuide), scope, `conclusion.nextGuide "${nextGuide}" no existe.`);
}

/* ────────────────────────────── entre guías ────────────────────────────── */

function checkCrossGuide(guides: LoadedGuide[], r: Reporter): void {
  const seen: Record<"title" | "description", Map<string, string>> = { title: new Map(), description: new Map() };
  for (const g of guides) {
    const meta = asObject(asObject(g.data).metadata);
    for (const key of ["title", "description"] as const) {
      const value = typeof meta[key] === "string" ? String(meta[key]).trim().toLowerCase() : "";
      if (!value) continue;
      const previous = seen[key].get(value);
      if (previous) r.add("error", `${g.category}/${g.slug}`, `metadata.${key} duplicado con ${previous}.`);
      else seen[key].set(value, `${g.category}/${g.slug}`);
    }
  }
  const slugs = new Map<string, string>();
  for (const g of guides) {
    const previous = slugs.get(g.slug);
    if (previous) r.add("error", `${g.category}/${g.slug}`, `El slug ya existe en ${previous}: los slugs son únicos en todo el sitio.`);
    else slugs.set(g.slug, g.category);
  }

  const published = guides.filter((g) => g.published && g.data && g.analysis);
  // Estructura: dos guías publicadas con exactamente las mismas secciones suelen ser la misma plantilla.
  const layouts = new Map<string, string>();
  for (const g of published) {
    const layout = g.analysis!.sections.map((section) => section.id).join(">");
    const twin = layouts.get(layout);
    if (twin) r.add("warn", `${g.slug} ↔ ${twin}`, "Tienen exactamente las mismas secciones: revisa que la estructura responda a cada tema y no sea la misma plantilla.");
    else layouts.set(layout, g.slug);
  }
  const fingerprints = published.map((g) => ({ g, set: shingles(tokenize([g.analysis!.bodyText, ...visibleStrings(g.data!)].join(" "))) }));
  for (let i = 0; i < fingerprints.length; i++) {
    for (let j = i + 1; j < fingerprints.length; j++) {
      const similarity = jaccard(fingerprints[i].set, fingerprints[j].set);
      const scope = `${fingerprints[i].g.slug} ↔ ${fingerprints[j].g.slug}`;
      if (similarity >= SIMILARITY.failAt) r.add("error", scope, `Contenido excesivamente similar (${similarity.toFixed(2)} ≥ ${SIMILARITY.failAt}). Amplía una de las dos guías en vez de crear una URL nueva.`);
      else if (similarity >= SIMILARITY.warnAt) r.add("warn", scope, `Contenido parecido (${similarity.toFixed(2)}). Revisa que no repitan explicaciones.`);
    }
  }
  const paragraphs = new Map<string, Set<string>>();
  for (const g of published) {
    for (const paragraph of g.analysis!.paragraphs) {
      const key = paragraphKey(paragraph);
      if (!key) continue;
      if (!paragraphs.has(key)) paragraphs.set(key, new Set());
      paragraphs.get(key)!.add(g.slug);
    }
  }
  for (const [key, set] of paragraphs) {
    if (set.size > 1) r.add("error", [...set].join(" ↔ "), `Párrafo idéntico repetido en varias guías: "${key.slice(0, 80)}…". El contenido de cada guía debe ser propio.`);
  }
}

/* ─────────────────── proyecto: categorías, redirecciones, rutas, registro ─────────────────── */

function checkProject(guides: Map<string, LoadedGuide>, r: Reporter): { active: number; dormant: number } {
  // categorías
  const seenCategories = new Set<string>();
  for (const category of categories) {
    const scope = `categoría ${category.slug}`;
    if (seenCategories.has(category.slug)) r.add("error", scope, "Slug duplicado.");
    seenCategories.add(category.slug);
    if (!SLUG_PATTERN.test(category.slug) || RESERVED_SLUGS.has(category.slug)) r.add("error", scope, "Slug inválido o reservado (colisiona con una ruta del sitio).");
    if (category.description.length < LIMITS.descriptionMin || category.description.length > LIMITS.descriptionMax + 30) r.add("error", scope, `La descripción tiene ${category.description.length} caracteres.`);
    if (category.intro.length < 2 || category.intro.some((paragraph) => paragraph.length < 150)) r.add("error", scope, "La introducción editorial necesita al menos 2 párrafos propios de 150+ caracteres.");
    if (category.problems.length < 3) r.add("error", scope, "Debe enumerar al menos 3 situaciones que resuelve.");
  }
  const sets = categories.map((c) => ({ slug: c.slug, set: shingles(tokenize(c.intro.join(" "))) }));
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const similarity = jaccard(sets[i].set, sets[j].set);
      if (similarity >= SIMILARITY.warnAt) r.add("error", `categorías ${sets[i].slug} ↔ ${sets[j].slug}`, `Introducciones demasiado parecidas (${similarity.toFixed(2)}): cada hub necesita contenido editorial propio.`);
    }
  }

  // plan
  const planSeen = new Set<string>();
  for (const planned of plannedGuides) {
    if (planSeen.has(planned.slug)) r.add("error", "plan-guias", `Slug repetido en el plan: ${planned.slug}.`);
    planSeen.add(planned.slug);
    if (!isCategorySlug(planned.category)) r.add("error", "plan-guias", `${planned.slug}: categoría inválida.`);
    for (const related of planned.relatedGuides) if (!plannedGuides.some((p) => p.slug === related)) r.add("error", "plan-guias", `${planned.slug}: guía relacionada inexistente en el plan (${related}).`);
  }

  // redirecciones
  const institutional = new Set<string>(institutionalPages.map((page) => page.path));
  const fromSeen = new Set<string>();
  const live = new Set<string>(["/", "/guias", ...categories.map((c) => `/${c.slug}`), ...institutional]);
  let active = 0;
  let dormant = 0;
  for (const rule of redirects) {
    const scope = `redirección ${rule.from}`;
    if (!rule.from.startsWith("/")) r.add("error", scope, 'El origen debe empezar por "/".');
    if (fromSeen.has(rule.from)) r.add("error", scope, "Origen duplicado.");
    fromSeen.add(rule.from);
    if (live.has(rule.from)) r.add("error", scope, "El origen es una URL vigente del sitio nuevo.");
    if (!rule.reason.trim()) r.add("error", scope, "Toda redirección necesita el motivo por el que las intenciones coinciden.");

    if (institutional.has(rule.to)) {
      active++;
      continue;
    }
    const match = /^\/([a-z0-9-]+)\/guias\/([a-z0-9-]+)$/.exec(rule.to);
    const planned = match ? plannedGuides.find((p) => p.slug === match[2]) : undefined;
    if (!match || !planned) r.add("error", scope, `El destino ${rule.to} no es una página institucional ni una guía del plan.`);
    else if (planned.category !== match[1]) r.add("error", scope, `El destino ${rule.to} tiene la categoría equivocada (la guía es de "${planned.category}").`);
    else if (guides.get(match[2])?.published) active++;
    else dormant++;
  }

  // rutas
  for (const page of institutionalPages) {
    const file = path.join(ROOT, "app", "(site)", page.path.slice(1), "page.tsx");
    if (!fs.existsSync(file)) r.add("error", `página ${page.path}`, "Está en institutionalPages pero no existe su page.tsx.");
  }
  const proxyFile = path.join(ROOT, "proxy.ts");
  if (fs.existsSync(proxyFile)) {
    const block = /matcher:\s*\[([\s\S]*?)\]/.exec(fs.readFileSync(proxyFile, "utf8"))?.[1] ?? "";
    for (const match of block.matchAll(/"(\/[^"]*)"/g)) {
      const base = match[1].replace(/\/:.*$/, "") || "/";
      if (live.has(base)) r.add("error", "proxy.ts", `El matcher "${match[1]}" devolvería 410 sobre una ruta vigente.`);
    }
  }

  // registro de componentes MDX
  const registry = path.join(ROOT, "mdx-components.tsx");
  if (fs.existsSync(registry)) {
    const source = fs.readFileSync(registry, "utf8");
    for (const name of GUIDE_COMPONENTS) if (!new RegExp(`\\b${name}\\b`).test(source)) r.add("error", "mdx-components.tsx", `El componente ${name} está permitido pero no registrado.`);
  }
  return { active, dormant };
}

/* ────────────────────────────── ejecución ────────────────────────────── */

export interface ValidationResult {
  findings: Finding[];
  guides: LoadedGuide[];
}

/** Valida las guías de un directorio (comprobaciones por guía y entre guías). */
export async function validateGuides(dir: string, options: ValidateOptions = {}): Promise<ValidationResult> {
  const r = new Reporter();
  const publicDir = options.publicDir ?? path.join(ROOT, "public");
  const planSlugs = options.planSlugs ?? plannedGuides.map((p) => p.slug);
  const strictImages = options.strictImages ?? process.argv.includes("--strict-images");

  const entries: { category: string; slug: string }[] = [];
  for (const category of fs.readdirSync(dir, { withFileTypes: true })) {
    if (category.name.startsWith(".") || category.name.startsWith("_")) continue;
    if (!category.isDirectory()) {
      r.add("error", category.name, "Solo se admiten carpetas de categoría en content/guias/ (content/guias/<categoria>/<slug>/).");
      continue;
    }
    for (const child of fs.readdirSync(path.join(dir, category.name), { withFileTypes: true })) {
      if (child.name.startsWith(".") || child.name.startsWith("_")) continue;
      if (child.isDirectory()) entries.push({ category: category.name, slug: child.name });
      else r.add("error", `${category.name}/${child.name}`, "Cada guía es una carpeta (guide.mdx + data.ts), no un archivo suelto.");
    }
  }

  const guides = await Promise.all(entries.map((entry) => loadGuide(path.join(dir, entry.category, entry.slug), entry.category, entry.slug, r)));
  const known = new Map(guides.map((g) => [g.slug, g]));
  const allSlugs = new Set(known.keys());

  for (const g of guides) {
    checkMetadata(g, r, planSlugs, allSlugs);
    checkStructure(g, r);
    checkContent(g, r);
    checkImages(g, r, publicDir, strictImages);
    checkText(g, r);
    checkLinks(g, r, known);
  }
  checkCrossGuide(guides, r);

  return { findings: r.findings, guides };
}

async function runCli(): Promise<void> {
  const verbose = process.argv.includes("--verbose");
  if (!fs.existsSync(GUIDES_DIR)) {
    console.error(`✖ No existe ${path.relative(ROOT, GUIDES_DIR)}.`);
    process.exit(1);
  }

  const { guides, findings } = await validateGuides(GUIDES_DIR);
  const known = new Map(guides.map((g) => [g.slug, g]));
  const project = new Reporter();
  const redirectStats = checkProject(known, project);
  const all = [...findings, ...project.findings];

  const errors = all.filter((f) => f.level === "error");
  const warnings = all.filter((f) => f.level === "warn");
  const visibleWarnings = warnings.filter((f) => verbose || !f.draft);
  const draftNotes = warnings.length - visibleWarnings.length;
  const published = guides.filter((g) => g.published);

  console.log(`\nGuías: ${guides.length} (${published.length} publicadas, ${guides.length - published.length} borradores) · plan aprobado: ${plannedGuides.length}`);
  for (const category of categories) {
    const inCategory = guides.filter((g) => g.category === category.slug);
    console.log(`  · ${category.name.padEnd(10)} ${inCategory.filter((g) => g.published).length} publicadas / ${inCategory.length} en total`);
  }
  console.log(`Redirecciones: ${redirectStats.active} activas, ${redirectStats.dormant} en espera de que se publique su guía\n`);

  for (const finding of errors) console.error(`✖ [${finding.scope}] ${finding.message}`);
  for (const finding of visibleWarnings) console.warn(`⚠ [${finding.scope}] ${finding.message}`);
  if (draftNotes > 0) console.log(`ℹ ${draftNotes} avisos de contenido pendiente en borradores (ejecuta con --verbose para verlos).`);

  console.log(`\n${errors.length === 0 ? "✔" : "✖"} ${errors.length} errores, ${visibleWarnings.length} avisos.`);
  if (errors.length > 0) {
    console.error("\nEl build se detiene: corrige los errores antes de publicar.");
    process.exit(1);
  }
}

// Solo se ejecuta como CLI cuando se lanza directamente (no cuando lo importan las pruebas).
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  runCli().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
