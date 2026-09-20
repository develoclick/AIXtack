/**
 * Pruebas del validador (npm run guias:test). Crean guías SINTÉTICAS en un directorio
 * temporal —nunca en content/guias/— y comprueban que el validador acepta una guía correcta
 * y bloquea cada tipo de incumplimiento. El texto de los fixtures es de prueba y no
 * representa contenido editorial.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SECTION_CATALOG } from "../lib/guides/constants";
import { validateGuides, type Finding, type ValidateOptions } from "./validate-guides";

type Obj = Record<string, unknown>;

/* ───────────────────────────── fixtures ───────────────────────────── */

/** Texto sintético único por variante: ninguna ventana de 5 palabras coincide entre variantes. */
const t = (variant: string, key: string, words = 14): string =>
  Array.from({ length: words }, (_, i) => (i % 3 === 0 ? `${variant}${key}${i}` : ["dato", "texto", "prueba"][i % 3])).join(" ");

const SNIPPET: Record<string, string> = {
  problema: "<ProblemSection data={data.problem} />",
  "resultado-esperado": "<OutcomeSection data={data.outcome} />",
  "caso-practico": "<CaseStudy data={data.caseStudy} />",
  antes: "<BeforeSection data={data.before} />",
  datos: "<DataPreparation data={data.dataPreparation} />",
  metodo: "<StepSection data={data.method} />",
  prompt: "<PromptBlock prompt={data.prompts.principal} />",
  analisis: "<ResultAnalysis data={data.analysis} />",
  iteracion: "<IterationBlock data={data.iteration} prompt={data.prompts.iteracion} />",
  "antes-despues": "<BeforeAfter data={data.beforeAfter} />",
  errores: "<CommonMistakes items={data.mistakes} />",
  verificacion: "<HumanVerification data={data.verification} />",
  conclusion: "<Conclusion data={data.conclusion} />",
  faq: "<FAQ items={data.faq} />",
};

const REQUIRED_IDS = SECTION_CATALOG.filter((section) => section.required || section.id === "antes-despues").map((section) => section.id as string);

function promptFixture(v: string, key: string): Obj {
  return {
    title: t(v, `${key}t`, 5),
    objective: t(v, `${key}o`, 8),
    whenToUse: t(v, `${key}w`, 8),
    requiredData: [t(v, `${key}r`, 5)],
    variables: [{ name: "NEGOCIO", description: t(v, `${key}d`, 6), example: t(v, `${key}e`, 4) }],
    prompt: `${t(v, `${key}p`, 30)} {{NEGOCIO}} ${t(v, `${key}q`, 30)}`,
    explanation: [
      { part: t(v, `${key}x1`, 5), why: t(v, `${key}y1`, 8) },
      { part: t(v, `${key}x2`, 5), why: t(v, `${key}y2`, 8) },
    ],
    example: t(v, `${key}ex`, 8),
    expectedResult: t(v, `${key}er`, 8),
    recommendations: [t(v, `${key}rc`, 6)],
    warnings: [],
  };
}

function guideData(v: string, slug: string, category = "marketing"): Obj {
  const prefix = `/images/guias/${category}/${slug}`;
  return {
    metadata: {
      slug,
      category,
      title: `Guía de prueba ${v}`,
      description: t(v, "desc", 16),
      author: "develoclick",
      publishedAt: "2026-01-10",
      updatedAt: "2026-02-01",
      status: "published",
      problem: t(v, "prob", 10),
      whyThisPage: t(v, "why", 14),
      relatedGuides: v === "A" ? ["guia-prueba-b"] : ["guia-prueba-a"],
      tipoGuia: ["estrategia-planificacion"],
    },
    hero: {
      subtitle: t(v, "sub", 12),
      difficulty: "Principiante",
      tools: [t(v, "tool", 3)],
      image: { src: `${prefix}/hero.webp`, alt: t(v, "heroalt", 10), aspectRatio: "21/9", priority: true },
    },
    problem: { summary: t(v, "ps", 60), symptoms: [t(v, "s1", 6), t(v, "s2", 6), t(v, "s3", 6)] },
    outcome: { summary: t(v, "os", 10), deliverables: [{ label: t(v, "d1", 4), detail: t(v, "dd1", 6) }, { label: t(v, "d2", 4), detail: t(v, "dd2", 6) }] },
    caseStudy: {
      business: t(v, "cb", 4),
      situation: t(v, "cs", 10),
      goal: t(v, "cg", 10),
      data: [1, 2, 3].map((n) => ({ label: t(v, `cl${n}`, 3), value: t(v, `cv${n}`, 3) })),
      problem: t(v, "cp", 10),
      application: t(v, "ca", 10),
      result: t(v, "cr", 10),
      fictional: true,
    },
    before: { request: t(v, "br", 8), whyInsufficient: t(v, "bw", 12), issues: [t(v, "bi1", 6), t(v, "bi2", 6)] },
    dataPreparation: {
      intro: t(v, "di", 10),
      items: [1, 2, 3].map((n) => ({ label: t(v, `dl${n}`, 3), detail: t(v, `dt${n}`, 8), required: n < 3 })),
    },
    method: { intro: t(v, "mi", 10), steps: [1, 2, 3].map((n) => ({ title: t(v, `mt${n}`, 3), description: t(v, `md${n}`, 10) })) },
    prompts: { principal: promptFixture(v, "pp"), iteracion: promptFixture(v, "pi") },
    analysis: {
      intro: t(v, "ai", 10),
      criteria: [
        { criterion: t(v, "ac1", 3), verdict: "ok", comment: t(v, "am1", 8) },
        { criterion: t(v, "ac2", 3), verdict: "improve", comment: t(v, "am2", 8) },
        { criterion: t(v, "ac3", 3), verdict: "risk", comment: t(v, "am3", 8) },
      ],
      conclusion: t(v, "ac", 10),
    },
    iteration: { intro: t(v, "ii", 10), promptId: "iteracion", why: t(v, "iw", 10) },
    beforeAfter: {
      before: { parts: [{ type: "text", text: t(v, "bab", 8) }] },
      after: { parts: [{ type: "text", text: t(v, "baa", 8) }] },
      takeaway: t(v, "bat", 8),
    },
    mistakes: [1, 2, 3].map((n) => ({ title: t(v, `et${n}`, 4), whyItHurts: t(v, `ew${n}`, 8), instead: t(v, `ei${n}`, 8) })),
    verification: { intro: t(v, "vi", 10), items: [1, 2, 3].map((n) => ({ label: t(v, `vl${n}`, 6) })), principle: t(v, "vp", 8) },
    conclusion: { summary: t(v, "cos", 12), takeaways: [1, 2, 3].map((n) => t(v, `ct${n}`, 6)) },
    faq: [1, 2, 3].map((n) => ({ question: `${t(v, `fq${n}`, 5)}?`, answer: t(v, `fa${n}`, 12) })),
    mediaPlan: {
      longVideo: {
        title: t(v, "lvt", 6),
        description: t(v, "lvd", 8),
        estimatedDuration: 12,
        chapters: [1, 2, 3].map((n) => ({ title: t(v, `lc${n}`, 4), sourceSection: n === 1 ? "problema" : n === 2 ? "metodo" : "prompt" })),
      },
      shorts: [1, 2, 3].map((n) => ({ title: t(v, `st${n}`, 4), hook: t(v, `sh${n}`, 6), topic: t(v, `so${n}`, 6), sourceSection: "problema" })),
    },
  };
}

function guideMdx(ids: string[] = REQUIRED_IDS, extra: Record<string, string> = {}): string {
  const blocks = ids.map((id) => `<GuideSection id="${id}" title="Título de prueba de ${id}">\n\n${SNIPPET[id] ?? ""}\n\n${extra[id] ?? ""}\n\n</GuideSection>`);
  return `import data from "./data";\n\n${blocks.join("\n\n")}\n`;
}

/* ───────────────────────────── utilidades de mutación ───────────────────────────── */

function setAt(root: Obj, dotted: string, value: unknown): void {
  const keys = dotted.split(".");
  let current: Obj | unknown[] = root;
  for (const key of keys.slice(0, -1)) current = (current as Obj)[key] as Obj;
  (current as Obj)[keys[keys.length - 1]] = value;
}

function delAt(root: Obj, dotted: string): void {
  const keys = dotted.split(".");
  let current: Obj = root;
  for (const key of keys.slice(0, -1)) current = current[key] as Obj;
  delete current[keys[keys.length - 1]];
}

interface Case {
  name: string;
  slug?: string;
  category?: string;
  set?: [string, unknown][];
  del?: string[];
  ids?: string[];
  mdx?: (source: string) => string;
  extra?: Record<string, string>;
  /** Crea archivos adicionales en la carpeta pública (por defecto solo hero.webp). */
  images?: string[];
  options?: ValidateOptions;
  /** Sin guía B (para casos de una sola guía). */
  withB?: boolean;
  expect: { error?: string; warn?: string; clean?: boolean };
  /** Modifica la estructura de carpetas antes de validar. */
  arrange?: (guidesDir: string) => void;
}

/* ───────────────────────────── ejecución ───────────────────────────── */

let passed = 0;
let failed = 0;

function report(name: string, ok: boolean, detail = ""): void {
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "✔" : "✖"} ${name}${ok && !detail ? "" : detail ? ` — ${detail}` : ""}`);
}

function writeGuide(guidesDir: string, publicDir: string, category: string, slug: string, data: Obj, mdx: string, images: string[]): void {
  const dir = path.join(guidesDir, category, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "data.ts"), `export default ${JSON.stringify(data, null, 2)};\n`);
  fs.writeFileSync(path.join(dir, "guide.mdx"), mdx);
  fs.writeFileSync(path.join(dir, "README.md"), "# fixture\n");
  const imageDir = path.join(publicDir, "images", "guias", category, slug);
  fs.mkdirSync(imageDir, { recursive: true });
  for (const image of images) fs.writeFileSync(path.join(imageDir, image), "x");
}

async function runCase(test: Case): Promise<void> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "guias-test-"));
  const guidesDir = path.join(root, "content", "guias");
  const publicDir = path.join(root, "public");
  try {
    const category = test.category ?? "marketing";
    const slug = test.slug ?? "guia-prueba-a";
    const data = guideData("A", slug, category);
    for (const [key, value] of test.set ?? []) setAt(data, key, value);
    for (const key of test.del ?? []) delAt(data, key);
    let mdx = guideMdx(test.ids, test.extra);
    if (test.mdx) mdx = test.mdx(mdx);

    writeGuide(guidesDir, publicDir, category, slug, data, mdx, test.images ?? ["hero.webp"]);
    if (test.withB) writeGuide(guidesDir, publicDir, "marketing", "guia-prueba-b", guideData("B", "guia-prueba-b"), guideMdx(), ["hero.webp"]);
    test.arrange?.(guidesDir);

    const { findings } = await validateGuides(guidesDir, {
      publicDir,
      planSlugs: ["guia-prueba-a", "guia-prueba-b"],
      strictImages: false,
      ...test.options,
    });
    const errors = findings.filter((f: Finding) => f.level === "error");
    const warnings = findings.filter((f: Finding) => f.level === "warn");

    if (test.expect.clean) {
      report(test.name, errors.length === 0 && warnings.filter((w) => !w.draft && !w.message.includes("palabras visibles") && !w.message.includes("prompt(s)") && !w.message.includes("mismas secciones")).length === 0, [...errors, ...warnings].map((f) => f.message).join(" | "));
    } else if (test.expect.error) {
      const needle = test.expect.error.toLowerCase();
      report(test.name, errors.some((f) => f.message.toLowerCase().includes(needle)), `esperaba error "${test.expect.error}"; hubo: ${errors.map((f) => f.message).join(" | ") || "ninguno"}`);
    } else if (test.expect.warn) {
      const needle = test.expect.warn.toLowerCase();
      report(test.name, errors.length === 0 && warnings.some((f) => f.message.toLowerCase().includes(needle)), `esperaba aviso "${test.expect.warn}" sin errores; errores: ${errors.map((f) => f.message).join(" | ") || "ninguno"}`);
    } else {
      report(test.name, errors.length === 0, errors.map((f) => f.message).join(" | "));
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const brokenMdx = (id: string, replacement: string) => (source: string) => source.replace(SNIPPET[id], replacement);

const cases: Case[] = [
  /* aceptación */
  { name: "acepta una guía completa (sin avisos)", expect: { clean: true } },
  { name: "acepta dos guías distintas que se relacionan entre sí", withB: true, expect: { clean: true } },
  {
    name: "acepta una guía con sección opcional + tabla comparativa documentada",
    ids: [...REQUIRED_IDS.slice(0, 10), "comparativa", ...REQUIRED_IDS.slice(10)],
    set: [["comparisons", { tabla: { caption: "Tabla", purpose: "Sirve para decidir entre opciones con criterios claros.", columns: ["A", "B"], rows: [["1", "2"]] } }]],
    extra: { comparativa: "<ComparisonTable table={data.comparisons.tabla} />" },
    expect: { clean: true },
  },
  { name: "acepta una guía con cálculos y su aviso", set: [["metadata.handlesNumbers", true]], extra: { datos: '<Callout variant="calculos">\n\nCuentas.\n\n</Callout>' }, expect: { clean: true } },

  /* estructura */
  { name: "bloquea una sección obligatoria ausente", ids: REQUIRED_IDS.filter((id) => id !== "errores"), expect: { error: 'Falta la sección obligatoria "errores"' } },
  { name: "bloquea una sección sin su componente", mdx: brokenMdx("problema", "Solo texto."), expect: { error: "debe usar <ProblemSection>" } },
  { name: "bloquea una sección con id desconocido", ids: [...REQUIRED_IDS, "inventada"], expect: { error: "Sección desconocida" } },
  { name: "bloquea secciones fuera de orden", ids: [REQUIRED_IDS[1], REQUIRED_IDS[0], ...REQUIRED_IDS.slice(2)], expect: { error: "fuera del orden canónico" } },
  { name: "bloquea una sección repetida", ids: [...REQUIRED_IDS, "faq"], expect: { error: "repetida" } },
  { name: "bloquea un H1 en el MDX", mdx: (s) => `${s}\n# Un titular\n`, expect: { error: "H1" } },
  { name: "bloquea contenido fuera de las secciones", mdx: (s) => `${s}\nTexto suelto.\n`, expect: { error: "fuera de una <GuideSection>" } },
  { name: "bloquea un componente no registrado", extra: { problema: "<Inventado />" }, expect: { error: "Componente no registrado" } },
  { name: "bloquea una referencia a un dato que no existe", mdx: (s) => s.replace("data.problem", "data.nada.existe"), expect: { error: "data.nada.existe" } },
  { name: "bloquea una clave desconocida en data.ts", set: [["intruso", { a: 1 }]], expect: { error: 'clave desconocida: "intruso"' } },
  { name: "bloquea un dato obligatorio ausente", del: ["caseStudy"], expect: { error: "Falta data.caseStudy" } },

  /* metadatos */
  { name: "bloquea un título demasiado largo", set: [["metadata.title", "x".repeat(80)]], expect: { error: "máximo 65" } },
  { name: "bloquea una descripción demasiado corta", set: [["metadata.description", "corta"]], expect: { error: "La descripción tiene" } },
  { name: "bloquea una guía publicada sin fecha de publicación", set: [["metadata.publishedAt", null]], expect: { error: "publishedAt real" } },
  { name: "bloquea fechas futuras", set: [["metadata.updatedAt", "2099-01-01"]], expect: { error: "en el futuro" } },
  { name: "bloquea un autor inexistente", set: [["metadata.author", "nadie"]], expect: { error: "autores.ts" } },
  { name: "bloquea un slug que no coincide con la carpeta", set: [["metadata.slug", "otro"]], expect: { error: "no coincide con la carpeta" } },
  { name: "bloquea un slug de lista (10-prompts-para…)", slug: "10-prompts-para-ventas", expect: { error: "slugs de listas" } },
  { name: "bloquea una guía fuera del plan aprobado", options: { planSlugs: ["otra-guia"] }, expect: { error: "no está en content/plan-guias.ts" } },
  { name: "bloquea una guía relacionada inexistente", set: [["metadata.relatedGuides", ["no-existe"]]], expect: { error: "Guía relacionada inexistente" } },
  { name: "bloquea una carpeta de categoría inexistente", category: "astrologia", expect: { error: "no existe en content/categorias.ts" } },
  { name: "bloquea cifras sin aviso de cálculos", set: [["metadata.handlesNumbers", true]], expect: { error: 'variant="calculos"' } },
  { name: "bloquea información externa sin aviso de fuentes", set: [["metadata.usesExternalInfo", true]], expect: { error: 'variant="fuentes"' } },

  /* contenido */
  { name: "bloquea un prompt con variables sin documentar", set: [["prompts.principal.prompt", `${t("A", "z", 40)} {{NEGOCIO}} {{OTRA}}`]], expect: { error: "{{OTRA}}" } },
  { name: "avisa de una variable documentada que no se usa", set: [["prompts.principal.prompt", t("A", "zz", 70)]], expect: { warn: "documentada pero no se usa" } },
  { name: "bloquea un prompt sin explicación", set: [["prompts.principal.explanation", []]], expect: { error: "explanation" } },
  { name: "bloquea una iteración que apunta a un prompt inexistente", set: [["iteration.promptId", "fantasma"]], expect: { error: "iteration.promptId" } },
  { name: "bloquea un caso no ficticio sin evidencia", set: [["caseStudy.fictional", false]], expect: { error: "evidence" } },
  { name: "bloquea un ejemplo no ficticio", extra: { antes: "" }, set: [["examples", [{ id: "e1", title: "t", business: "b", scenario: "s", keyData: [{ label: "a", value: "b" }, { label: "c", value: "d" }], approach: "a", decision: "d", fictional: false }, { id: "e2", title: "t", business: "b", scenario: "s", keyData: [{ label: "a", value: "b" }, { label: "c", value: "d" }], approach: "a", decision: "d", fictional: true }]]], expect: { error: "fictional: true" } },
  { name: "bloquea una tabla con filas de distinta longitud", set: [["comparisons", { t1: { caption: "T", purpose: "Sirve para decidir entre opciones con criterios claros.", columns: ["A", "B"], rows: [["1"]] } }]], expect: { error: "celdas" } },
  { name: "bloquea una tabla sin propósito", set: [["comparisons", { t1: { caption: "T", purpose: "", columns: ["A", "B"], rows: [["1", "2"]] } }]], expect: { error: "purpose" } },
  { name: "bloquea menos de 3 preguntas frecuentes", set: [["faq", [{ question: "¿Una?", answer: t("A", "one", 12) }]]], expect: { error: "preguntas frecuentes" } },
  { name: "bloquea un análisis sin veredicto válido", set: [["analysis.criteria", [{ criterion: "a", verdict: "quizá", comment: "b" }, { criterion: "c", verdict: "ok", comment: "d" }, { criterion: "e", verdict: "ok", comment: "f" }]]], expect: { error: "verdict" } },
  { name: "bloquea marcadores TODO en una guía publicada", set: [["problem.summary", `${t("A", "ps", 60)} TODO`]], expect: { error: "sin terminar" } },
  { name: "avisa de estadísticas sin fuente", set: [["problem.summary", `${t("A", "ps", 60)} El 80 % de las empresas fracasa.`]], expect: { warn: "sin respaldo" } },
  { name: "bloquea un video publicado sin youtubeId real", set: [["video", { status: "published", title: "V", description: "D" }]], ids: [...REQUIRED_IDS, "video"], extra: { video: "<VideoSection data={data.video} />" }, expect: { error: "youtubeId" } },
  { name: "bloquea un video próximo con youtubeId inventado", set: [["video", { status: "upcoming", title: "V", description: "D", youtubeId: "abcdefghijk" }]], ids: [...REQUIRED_IDS, "video"], extra: { video: "<VideoSection data={data.video} />" }, expect: { error: "upcoming" } },
  { name: "bloquea un capítulo de video que apunta a una sección inexistente", set: [["mediaPlan.longVideo.chapters", [{ title: "a", sourceSection: "faq" }, { title: "b", sourceSection: "nada" }, { title: "c", sourceSection: "faq" }]]], expect: { error: "sourceSection" } },
  { name: "avisa si hay menos de 3 ideas de Shorts", set: [["mediaPlan.shorts", [{ title: "a", hook: "b", topic: "c", sourceSection: "faq" }]]], expect: { warn: "ideas" } },

  /* imágenes */
  { name: "avisa (sin bloquear) de imágenes que aún no existen", images: [], expect: { warn: "aún no subidas" } },
  { name: "bloquea las imágenes que faltan con --strict-images", images: [], options: { strictImages: true }, expect: { error: "aún no subidas" } },
  { name: "bloquea una imagen sin texto alternativo", set: [["hero.image.alt", ""]], expect: { error: "alt" } },
  { name: "bloquea una imagen fuera de la carpeta de la guía", set: [["hero.image.src", "/images/otra/hero.webp"]], expect: { error: "debe estar en /images/guias/" } },
  { name: "bloquea un formato de imagen no admitido", set: [["hero.image.src", "/images/guias/marketing/guia-prueba-a/hero.gif"]], expect: { error: "formato no admitido" } },
  { name: "avisa de archivos sin usar en la carpeta de imágenes", images: ["hero.webp", "sobra.webp"], expect: { warn: "no usa" } },

  /* enlaces */
  { name: "bloquea un enlace interno roto", extra: { problema: "[roto](/no-existe)" }, expect: { error: "Enlace interno a una ruta que no existe" } },
  { name: "bloquea un enlace a una guía inexistente", extra: { problema: "[roto](/marketing/guias/inexistente)" }, expect: { error: "roto o a una guía no publicada" } },
  { name: "bloquea un enlace http sin cifrar", extra: { problema: "[x](http://ejemplo.com)" }, expect: { error: "no seguro" } },
  { name: "acepta enlaces internos válidos", extra: { problema: "[Inicio](/) y [Guías](/guias) y [Marketing](/marketing)" }, expect: { clean: true } },

  /* para quién, fuentes y evidencia */
  {
    name: "acepta una guía con audiencia y fuentes reales",
    ids: [...REQUIRED_IDS.slice(0, 2), "para-quien", ...REQUIRED_IDS.slice(2), "fuentes"],
    set: [
      ["audience", { forWho: ["Una persona que vende productos y quiere contarlos mejor.", "Alguien que ya usa IA y teme que invente datos."], notForWho: ["Quien busca publicar cientos de textos sin revisarlos."] }],
      ["sources", { items: [{ title: "Fuente de prueba", publisher: "Editor de prueba", url: "https://example.com/documento", consultedAt: "2026-02-01" }] }],
    ],
    extra: { "para-quien": "<AudienceSection data={data.audience} />", fuentes: "<SourcesSection data={data.sources} />" },
    expect: { clean: true },
  },
  { name: "acepta EvidenceBlock aunque la guía aún no tenga evidencia", extra: { conclusion: "<EvidenceBlock data={data.evidence} />" }, expect: { clean: true } },
  {
    name: "bloquea una audiencia sin la columna «no es para ti»",
    ids: [...REQUIRED_IDS.slice(0, 2), "para-quien", ...REQUIRED_IDS.slice(2)],
    set: [["audience", { forWho: ["a", "b"], notForWho: [] }]],
    extra: { "para-quien": "<AudienceSection data={data.audience} />" },
    expect: { error: "audience.notForWho" },
  },
  {
    name: "bloquea una fuente sin https",
    ids: [...REQUIRED_IDS, "fuentes"],
    set: [["sources", { items: [{ title: "T", publisher: "P", url: "http://example.com", consultedAt: "2026-02-01" }] }]],
    extra: { fuentes: "<SourcesSection data={data.sources} />" },
    expect: { error: "enlace https" },
  },
  {
    name: "bloquea una fuente con fecha de consulta futura",
    ids: [...REQUIRED_IDS, "fuentes"],
    set: [["sources", { items: [{ title: "T", publisher: "P", url: "https://example.com/a", consultedAt: "2099-01-01" }] }]],
    extra: { fuentes: "<SourcesSection data={data.sources} />" },
    expect: { error: "en el futuro" },
  },
  {
    name: "bloquea una prueba propia sin fecha real",
    set: [["evidence", { ownTest: { description: "Probé el prompt.", date: "ayer" } }]],
    extra: { conclusion: "<EvidenceBlock data={data.evidence} />" },
    expect: { error: "evidence.ownTest" },
  },
  {
    name: "avisa de una evidencia vacía",
    set: [["evidence", {}]],
    extra: { conclusion: "<EvidenceBlock data={data.evidence} />" },
    expect: { warn: "evidence" },
  },
  {
    name: "acepta una evidencia vacía en una guía del estándar v3 (la rellena solo el autor)",
    set: [["metadata.estandarGuia", 3], ["evidence", {}]],
    extra: { conclusion: "<EvidenceBlock data={data.evidence} />" },
    expect: { clean: true },
  },

  /* manifiesto de imágenes */
  {
    name: "acepta un manifiesto de imágenes con hero y un slot colocado en su sección",
    del: ["hero.image"],
    set: [
      [
        "images",
        {
          hero: { file: "hero.webp", src: "/images/guias/marketing/guia-prueba-a/hero.webp", section: "hero", ratio: "16/9", purpose: "Muestra el resultado del método en una conversación anonimizada.", description: "Conversación anonimizada. A un lado la consulta del cliente y al otro el borrador ya revisado. Resaltar con un recuadro la promesa eliminada. Usar datos ficticios y sin información personal.", alt: "Conversación anonimizada con la respuesta ya revisada." },
          base: { file: "base.webp", src: "/images/guias/marketing/guia-prueba-a/base.webp", section: "datos", ratio: "16/9", purpose: "Captura de la base de respuestas para construir la propia sin partir de cero.", description: "Conversación anonimizada. A un lado la consulta del cliente y al otro el borrador ya revisado. Resaltar con un recuadro la promesa eliminada. Usar datos ficticios y sin información personal.", alt: "Hoja de cálculo con una fila por consulta frecuente." },
        },
      ],
    ],
    extra: { datos: "<GuideImage slot={data.images.base} />" },
    images: ["hero.webp", "base.webp"],
    expect: { clean: true },
  },
  {
    name: "avisa una a una de las imágenes del manifiesto que faltan y destaca el hero",
    del: ["hero.image"],
    set: [["images", { hero: { file: "hero.webp", src: "/images/guias/marketing/guia-prueba-a/hero.webp", section: "hero", ratio: "16/9", purpose: "Muestra el resultado del método en una conversación anonimizada.", alt: "Conversación anonimizada con la respuesta ya revisada." } }]],
    images: [],
    expect: { warn: "HERO faltante" },
  },
  {
    name: "bloquea las imágenes del manifiesto que faltan con --strict-images",
    del: ["hero.image"],
    set: [["images", { hero: { file: "hero.webp", src: "/images/guias/marketing/guia-prueba-a/hero.webp", section: "hero", ratio: "16/9", purpose: "Muestra el resultado del método en una conversación anonimizada.", alt: "Conversación anonimizada con la respuesta ya revisada." } }]],
    images: [],
    options: { strictImages: true },
    expect: { error: "HERO faltante" },
  },
  {
    name: "bloquea un slot que no está en WebP",
    del: ["hero.image"],
    set: [["images", { hero: { file: "hero.png", src: "/images/guias/marketing/guia-prueba-a/hero.png", section: "hero", ratio: "16/9", purpose: "Muestra el resultado del método en una conversación anonimizada.", alt: "Conversación anonimizada con la respuesta ya revisada." } }]],
    expect: { error: "WebP" },
  },
  {
    name: "bloquea un slot cuya sección no existe en la guía",
    del: ["hero.image"],
    set: [["images", { paso: { file: "paso.webp", src: "/images/guias/marketing/guia-prueba-a/paso.webp", section: "variaciones", ratio: "16/9", purpose: "Captura de un paso para que el lector lo reproduzca en su herramienta.", alt: "Captura del paso en la herramienta de trabajo." } }]],
    expect: { error: "no existe en esta guía" },
  },
  {
    name: "bloquea un slot sin propósito explicado",
    del: ["hero.image"],
    set: [["images", { hero: { file: "hero.webp", src: "/images/guias/marketing/guia-prueba-a/hero.webp", section: "hero", ratio: "16/9", purpose: "bonita", alt: "Conversación anonimizada con la respuesta ya revisada." } }]],
    expect: { error: "purpose" },
  },

  /* tipo de guía, glosario, ficha rápida, marco y rúbrica */
  { name: "acepta un tipo de guía válido", set: [["metadata.tipoGuia", ["estrategia-planificacion", "creativa-visual"]]], expect: { clean: true } },
  { name: "bloquea un tipo de guía inventado", set: [["metadata.tipoGuia", ["inventado"]]], expect: { error: "tipoGuia" } },
  {
    name: "acepta un término del glosario listado y usado",
    set: [["glossary", ["prompt"]]],
    extra: { problema: 'Un <Term id="prompt">prompt</Term> es un encargo.' },
    expect: { clean: true },
  },
  { name: "bloquea un término que no existe en el glosario", extra: { problema: '<Term id="no-existe">algo</Term>' }, expect: { error: "no existe en content/glosario.ts" } },
  { name: "bloquea un término usado pero no listado en data.glossary", extra: { problema: '<Term id="prompt">prompt</Term>' }, expect: { error: "data.glossary" } },
  { name: "bloquea un id de glosario inexistente en data.glossary", set: [["glossary", ["inventado"]]], expect: { error: "glossary" } },
  {
    name: "bloquea un costo sin fecha de verificación",
    set: [["quickFacts", { time: "Una tarde", needs: ["Un asistente de IA"], result: "Un plan", cost: "Gratis" }]],
    extra: { problema: "<QuickFacts data={data.quickFacts} />" },
    expect: { error: "costVerifiedAt" },
  },
  {
    name: "acepta una rúbrica con umbrales bien formados",
    set: [["rubric", { id: "r", title: "Rúbrica", intro: "Puntúa cada criterio.", criteria: [1, 2, 3].map((n) => ({ id: `c${n}`, label: `Criterio ${n}` })), outcomes: [{ min: 0, label: "Rehacer", advice: "Vuelve a pedirlo." }, { min: 5, label: "Usar", advice: "Está listo." }] }]],
    extra: { analisis: "<Rubric data={data.rubric} />" },
    expect: { clean: true },
  },
  {
    name: "bloquea una rúbrica cuyo primer umbral no cubre el cero",
    set: [["rubric", { id: "r", title: "Rúbrica", intro: "Puntúa.", criteria: [1, 2, 3].map((n) => ({ id: `c${n}`, label: `Criterio ${n}` })), outcomes: [{ min: 2, label: "A", advice: "a" }, { min: 5, label: "B", advice: "b" }] }]],
    extra: { analisis: "<Rubric data={data.rubric} />" },
    expect: { error: "min 0" },
  },
  {
    name: "avisa de un slot de imagen sin descripción larga",
    del: ["hero.image"],
    set: [["images", { hero: { file: "hero.webp", src: "/images/guias/marketing/guia-prueba-a/hero.webp", section: "hero", ratio: "16/9", purpose: "Muestra el resultado del método en una conversación anonimizada.", alt: "Conversación anonimizada con la respuesta ya revisada." } }]],
    expect: { warn: "description" },
  },

  /* borradores */
  {
    name: "un borrador incompleto solo produce avisos",
    set: [["metadata.status", "draft"], ["metadata.publishedAt", null], ["problem.summary", "TODO"], ["faq", []]],
    ids: REQUIRED_IDS.filter((id) => id !== "faq"),
    expect: {},
  },
  { name: "un borrador sigue bloqueado por errores estructurales", set: [["metadata.status", "draft"], ["metadata.slug", "otro"]], expect: { error: "no coincide con la carpeta" } },

  /* entre guías */
  {
    name: "bloquea contenido duplicado entre guías",
    withB: true,
    arrange: (dir) => {
      const a = path.join(dir, "marketing", "guia-prueba-a", "data.ts");
      const b = path.join(dir, "marketing", "guia-prueba-b", "data.ts");
      const copy = fs.readFileSync(a, "utf8").replace(/"slug": "guia-prueba-a"/, '"slug": "guia-prueba-b"').replace(/guia-prueba-a\//g, "guia-prueba-b/").replace(/"title": "[^"]*"/, '"title": "Otro título"').replace(/"description": "[^"]*"/, '"description": "Otra descripción sintética distinta de la primera para esta prueba de duplicados."');
      fs.writeFileSync(b, copy);
      fs.writeFileSync(path.join(dir, "marketing", "guia-prueba-b", "guide.mdx"), fs.readFileSync(path.join(dir, "marketing", "guia-prueba-a", "guide.mdx"), "utf8"));
    },
    expect: { error: "excesivamente similar" },
  },
  {
    name: "bloquea un slug repetido en dos categorías",
    arrange: (dir) => {
      const source = path.join(dir, "marketing", "guia-prueba-a");
      const target = path.join(dir, "ventas", "guia-prueba-a");
      fs.mkdirSync(target, { recursive: true });
      for (const file of fs.readdirSync(source)) fs.copyFileSync(path.join(source, file), path.join(target, file));
    },
    expect: { error: "ya existe" },
  },
  {
    name: "bloquea un archivo suelto en la carpeta de la categoría",
    arrange: (dir) => fs.writeFileSync(path.join(dir, "marketing", "suelta.mdx"), "# x"),
    expect: { error: "es una carpeta" },
  },
];

async function main(): Promise<void> {
  for (const test of cases) await runCase(test);

  // La guía real del proyecto debe pasar el validador (sin errores).
  const real = await validateGuides(path.join(process.cwd(), "content", "guias"));
  const realErrors = real.findings.filter((f) => f.level === "error");
  report("las guías reales del proyecto no tienen errores", realErrors.length === 0, realErrors.map((f) => `[${f.scope}] ${f.message}`).join(" | "));

  console.log(`\n${failed === 0 ? "✔" : "✖"} ${passed} pruebas superadas, ${failed} fallidas.`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
