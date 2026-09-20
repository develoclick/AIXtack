/**
 * Reglas del sistema editorial compartidas por el loader (Next) y por el validador
 * (scripts/validate-guides.ts). Sin dependencias de Next ni de React.
 */
import type { SectionId } from "./model";

export interface SectionDefinition {
  id: SectionId;
  /** Etiqueta corta (índice de contenidos y sobretítulo de la sección). */
  label: string;
  /** Componente que debe aparecer dentro de la sección. */
  component: string;
  /** Otros componentes que también cumplen la función (estándares anteriores). */
  alsoAccepts?: string[];
  /** Falta = error de build en una guía publicada. El resto son opcionales (aviso o nada). */
  required: boolean;
}

/**
 * Catálogo de secciones, en su orden canónico. Cada guía decide cuáles usa: las obligatorias
 * son el mínimo de calidad (problema, resultado, caso, antes, datos, método, prompt, análisis,
 * iteración, antes/después, errores, verificación, conclusión y FAQ); las demás se usan cuando aportan.
 */
export const SECTION_CATALOG: readonly SectionDefinition[] = [
  { id: "problema", label: "Problema", component: "ProblemSection", required: true },
  { id: "resultado-esperado", label: "Qué conseguirás", component: "OutcomeSection", required: true },
  { id: "para-quien", label: "Para quién es", component: "AudienceSection", required: false },
  { id: "caso-practico", label: "Caso práctico", component: "CaseStudy", required: true },
  { id: "marco", label: "Marco de trabajo", component: "FrameworkSection", required: false },
  { id: "antes", label: "Antes", component: "BeforeSection", required: true },
  { id: "datos", label: "Datos necesarios", component: "DataPreparation", required: true },
  { id: "herramientas", label: "Herramientas", component: "ToolsSection", required: false },
  { id: "metodo", label: "Método", component: "StepSection", required: true },
  { id: "hoja", label: "Hoja de cálculo", component: "ComparisonTable", required: false },
  { id: "entrevista", label: "Entrevista", component: "PromptCard", alsoAccepts: ["PromptBlock"], required: false },
  { id: "prompt", label: "Prompt", component: "PromptCard", alsoAccepts: ["PromptBlock"], required: true },
  { id: "explicacion", label: "Cómo funciona", component: "PromptExplanation", required: false },
  { id: "primer-resultado", label: "Primer resultado", component: "ResultBlock", required: false },
  { id: "analisis", label: "Análisis", component: "ResultAnalysis", required: true },
  { id: "iteracion", label: "Iteración", component: "IterationBlock", required: true },
  { id: "resultado-final", label: "Resultado final", component: "ResultBlock", required: false },
  { id: "adaptacion", label: "Adaptación", component: "PromptCard", alsoAccepts: ["PromptBlock"], required: false },
  { id: "antes-despues", label: "Antes y después", component: "BeforeAfter", required: false },
  { id: "ejemplos", label: "Ejemplos", component: "ExamplesSection", required: false },
  { id: "comparativa", label: "Comparativa", component: "ComparisonTable", required: false },
  { id: "medicion", label: "Cómo medir", component: "ComparisonTable", required: false },
  { id: "errores", label: "Errores comunes", component: "CommonMistakes", required: true },
  { id: "personalizacion", label: "Personalización", component: "Personalization", required: false },
  { id: "verificacion", label: "Verificación", component: "HumanVerification", required: true },
  { id: "aplicacion", label: "Aplicación", component: "ApplicationSteps", required: false },
  { id: "checklist", label: "Checklist", component: "InteractiveChecklist", required: false },
  { id: "variaciones", label: "Variaciones", component: "Variations", required: false },
  { id: "limitaciones", label: "Limitaciones", component: "Limitations", required: false },
  { id: "conclusion", label: "Conclusión", component: "Conclusion", required: true },
  { id: "glosario", label: "Glosario", component: "GlossarySection", required: false },
  { id: "faq", label: "Preguntas frecuentes", component: "FAQ", required: true },
  { id: "fuentes", label: "Fuentes y verificación", component: "SourcesSection", required: false },
  { id: "video", label: "Video", component: "VideoSection", required: false },
];

export const SECTION_IDS: readonly SectionId[] = SECTION_CATALOG.map((section) => section.id);

export function getSectionDefinition(id: string): SectionDefinition | undefined {
  return SECTION_CATALOG.find((section) => section.id === id);
}

export const META_REQUIRED_KEYS = [
  "slug",
  "category",
  "title",
  "description",
  "author",
  "publishedAt",
  "updatedAt",
  "status",
  "problem",
  "whyThisPage",
  "relatedGuides",
] as const;

export const META_OPTIONAL_KEYS = ["handlesNumbers", "usesExternalInfo"] as const;

export const PROMPT_REQUIRED_KEYS = [
  "title",
  "objective",
  "whenToUse",
  "requiredData",
  "variables",
  "prompt",
  "explanation",
  "example",
  "expectedResult",
  "recommendations",
  "warnings",
] as const;

export const DIFFICULTIES = ["Principiante", "Intermedio", "Avanzado"] as const;
export const ASPECT_RATIOS = ["16/9", "21/9", "4/3", "3/2", "1/1", "3/4"] as const;
export const IMAGE_EXTENSIONS = [".webp", ".avif", ".png", ".jpg", ".jpeg"] as const;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
/** Nombre de una variable de prompt: NEGOCIO (se usa como {{NEGOCIO}}). */
export const VARIABLE_NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;
/** Variables de prompt: {{NEGOCIO}}. */
export const VARIABLE_SOURCE = "\\{\\{([A-Z][A-Z0-9_]*)\\}\\}";

/** Modelos de URL prohibidos por el posicionamiento editorial del sitio. */
export const FORBIDDEN_SLUG_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /^\d+-/, reason: "los slugs de listas (\"10-prompts-para…\") están prohibidos" },
  { pattern: /(^|-)prompts?-para(-|$)/, reason: "páginas \"X prompts para…\" están prohibidas" },
  { pattern: /mejores-(herramientas|ias?|prompts|apps)/, reason: "páginas \"mejores herramientas…\" están prohibidas" },
  { pattern: /(^|-)vs(-|$)/, reason: "las páginas comparativas están prohibidas" },
  { pattern: /^ia-para-/, reason: "el modelo \"IA para [profesión]\" está prohibido; el slug debe describir el problema o la tarea" },
  { pattern: /(^|-)(noticias?|novedades)(-|$)/, reason: "las noticias no forman parte del sitio" },
];

export const LIMITS = {
  titleMax: 65,
  descriptionMin: 70,
  descriptionMax: 170,
  problemMin: 30,
  whyThisPageMin: 60,
  faqMin: 3,
  /** Palabras visibles por debajo de las cuales se avisa de posible falta de profundidad. */
  minWords: 1500,
  shortsMin: 3,
  shortsMax: 8,
  longVideoMinMinutes: 10,
};

/** Detección de similitud entre guías publicadas (shingles de palabras). */
export const SIMILARITY = {
  shingleSize: 5,
  failAt: 0.2,
  warnAt: 0.08,
  /** Párrafos idénticos (o casi) con al menos estas palabras se consideran duplicados. */
  minParagraphWords: 12,
};

export function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Minutos de lectura a 200 palabras por minuto (mínimo 1). */
export function readingMinutesFromWords(words: number): number {
  return Math.max(1, Math.ceil(words / 200));
}

/** URL canónica de una guía: la categoría forma parte de la ruta. */
export function guidePath(guide: { category: string; slug: string }): string {
  return `/${guide.category}/guias/${guide.slug}`;
}

/** Componentes que una guía puede usar en su guide.mdx (registrados en mdx-components.tsx). */
export const GUIDE_COMPONENTS: readonly string[] = [
  "GuideSection",
  "ProblemSection",
  "OutcomeSection",
  "AudienceSection",
  "QuickFacts",
  "FrameworkSection",
  "Rubric",
  "PromptBuilder",
  "Term",
  "GlossarySection",
  "CaseStudy",
  "BeforeSection",
  "DataPreparation",
  "ToolsSection",
  "StepSection",
  "PromptBlock",
  "PromptCard",
  "PromptExplanation",
  "ResultBlock",
  "ResultAnalysis",
  "IterationBlock",
  "BeforeAfter",
  "ExamplesSection",
  "ComparisonTable",
  "ToolComparison",
  "CommonMistakes",
  "Personalization",
  "HumanVerification",
  "ApplicationSteps",
  "InteractiveChecklist",
  "Variations",
  "Limitations",
  "Conclusion",
  "FAQ",
  "SourcesSection",
  "EvidenceBlock",
  "VideoSection",
  "ImageBlock",
  "GuideImage",
  "Callout",
  "WarningBox",
  "GuideAdSlot",
];

/** Claves de primer nivel de `GuideData` (data.ts). Cualquier otra es un error (evita erratas silenciosas). */
export const DATA_KEYS = [
  "metadata",
  "hero",
  "problem",
  "outcome",
  "audience",
  "quickFacts",
  "caseStudy",
  "framework",
  "before",
  "dataPreparation",
  "tools",
  "method",
  "prompts",
  "firstResult",
  "analysis",
  "iteration",
  "improvedResult",
  "beforeAfter",
  "examples",
  "comparisons",
  "mistakes",
  "personalization",
  "verification",
  "application",
  "checklist",
  "variations",
  "limitations",
  "conclusion",
  "faq",
  "images",
  "rubric",
  "glossary",
  "sources",
  "evidence",
  "video",
  "mediaPlan",
] as const;

/** Claves de datos obligatorias (el resto son opcionales). */
export const DATA_REQUIRED_KEYS = [
  "metadata",
  "hero",
  "problem",
  "outcome",
  "caseStudy",
  "before",
  "dataPreparation",
  "method",
  "prompts",
  "analysis",
  "iteration",
  "mistakes",
  "verification",
  "conclusion",
  "faq",
] as const;

/** Sección del catálogo → clave de `data` que necesita (para detectar datos sin usar o secciones sin datos). */
export const SECTION_DATA_KEY: Partial<Record<SectionId, string>> = {
  problema: "problem",
  "resultado-esperado": "outcome",
  "para-quien": "audience",
  "caso-practico": "caseStudy",
  marco: "framework",
  antes: "before",
  datos: "dataPreparation",
  herramientas: "tools",
  metodo: "method",
  hoja: "comparisons",
  entrevista: "prompts",
  adaptacion: "prompts",
  prompt: "prompts",
  explicacion: "prompts",
  "primer-resultado": "firstResult",
  analisis: "analysis",
  iteracion: "iteration",
  "resultado-final": "improvedResult",
  "antes-despues": "beforeAfter",
  ejemplos: "examples",
  comparativa: "comparisons",
  errores: "mistakes",
  personalizacion: "personalization",
  verificacion: "verification",
  aplicacion: "application",
  checklist: "checklist",
  variaciones: "variations",
  limitaciones: "limitations",
  conclusion: "conclusion",
  glosario: "glossary",
  faq: "faq",
  fuentes: "sources",
  video: "video",
};

/** Tipos de guía (taxonomía): cada uno pide una estructura distinta. Una guía puede ser híbrida. */
export const GUIDE_TYPES = [
  "tutorial-herramienta",
  "decision-comparacion",
  "estrategia-planificacion",
  "automatizacion-flujo",
  "numeros-datos",
  "comunicacion-atencion",
  "tema-sensible",
  "conceptual-educativa",
  "creativa-visual",
] as const;
