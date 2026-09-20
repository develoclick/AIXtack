/**
 * Plantillas ESTRUCTURALES de una guía nueva (`npm run guia:nueva`). Generan únicamente el
 * esqueleto técnico —carpeta, data.ts tipado, guide.mdx con las secciones y README— con
 * marcadores TODO. No escriben contenido editorial: el validador impide publicar mientras
 * quede algún TODO.
 */
import { SECTION_CATALOG } from "../lib/guides/constants";
import type { SectionId } from "../lib/guides/model";

export interface TemplateMeta {
  slug: string;
  category: string;
  title: string;
  description: string;
  updatedAt: string;
  problem: string;
  whyThisPage: string;
  relatedGuides: string[];
  handlesNumbers?: boolean;
  usesExternalInfo?: boolean;
}

/** Cómo se compone cada sección en el MDX: la etiqueta de datos y las props. */
const SNIPPETS: Record<SectionId, string> = {
  problema: "<ProblemSection data={data.problem} />",
  "resultado-esperado": "<OutcomeSection data={data.outcome} />",
  "para-quien": "<AudienceSection data={data.audience} />",
  "caso-practico": "<CaseStudy data={data.caseStudy} />",
  marco: "<FrameworkSection data={data.framework} />",
  antes: "<BeforeSection data={data.before} />",
  datos: "<DataPreparation data={data.dataPreparation} />",
  herramientas: "<ToolsSection data={data.tools} />",
  metodo: "<StepSection data={data.method} />",
  hoja: "<ComparisonTable table={data.comparisons.TODO_id_de_la_tabla} />",
  entrevista: "<PromptBlock prompt={data.prompts.entrevista} />",
  prompt: "<PromptBlock prompt={data.prompts.principal} />",
  adaptacion: "<PromptCard prompt={data.prompts.adaptacion} />",
  explicacion: "<PromptExplanation prompt={data.prompts.principal} />",
  "primer-resultado": "<ResultBlock data={data.firstResult} />",
  analisis: "<ResultAnalysis data={data.analysis} />",
  iteracion: "<IterationBlock data={data.iteration} prompt={data.prompts.iteracion} />",
  "resultado-final": "<ResultBlock data={data.improvedResult} />",
  "antes-despues": "<BeforeAfter data={data.beforeAfter} />",
  ejemplos: "<ExamplesSection examples={data.examples} />",
  comparativa: "<ComparisonTable table={data.comparisons.TODO_id_de_la_tabla} />",
  medicion: "<ComparisonTable table={data.comparisons.TODO_id_de_la_tabla} />",
  errores: "<CommonMistakes items={data.mistakes} />",
  personalizacion: "<Personalization data={data.personalization} />",
  verificacion: "<HumanVerification data={data.verification} />",
  aplicacion: "<ApplicationSteps data={data.application} />",
  checklist: "<InteractiveChecklist data={data.checklist} guide={data.metadata.slug} />",
  variaciones: "<Variations data={data.variations} />",
  limitaciones: "<Limitations data={data.limitations} />",
  conclusion: "<Conclusion data={data.conclusion} />",
  glosario: "<GlossarySection ids={data.glossary} />",
  faq: "<FAQ items={data.faq} />",
  fuentes: "<SourcesSection data={data.sources} />",
  video: "<VideoSection data={data.video} />",
};

/** Datos que necesita cada sección OPCIONAL (para el comentario de ayuda del MDX). */
const OPTIONAL_DATA_HINT: Partial<Record<SectionId, string>> = {
  "para-quien": "data.audience (y data.quickFacts para la ficha rápida)",
  marco: "data.framework",
  entrevista: "data.prompts.entrevista",
  medicion: "data.comparisons",
  glosario: "data.glossary (ids de content/glosario.ts; usa <Term id> en el texto)",
  fuentes: "data.sources (obligatoria si la guía usa información externa o afirma datos de plataformas)",
  herramientas: "data.tools",
  personalizacion: "data.personalization",
  aplicacion: "data.application",
  explicacion: "data.prompts.principal.explanation",
  "primer-resultado": "data.firstResult",
  "resultado-final": "data.improvedResult",
  "antes-despues": "data.beforeAfter",
  ejemplos: "data.examples",
  comparativa: "data.comparisons",
  checklist: "data.checklist",
  variaciones: "data.variations",
  limitaciones: "data.limitations",
  video: "data.video",
};

const q = (value: string) => JSON.stringify(value);

export function renderDataTemplate(meta: TemplateMeta): string {
  const related = meta.relatedGuides.map(q).join(", ");
  const flags = [meta.handlesNumbers ? "    handlesNumbers: true," : "", meta.usesExternalInfo ? "    usesExternalInfo: true," : ""].filter(Boolean).join("\n");

  return `import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * ${meta.category}/${meta.slug} — BORRADOR generado por \`npm run guia:nueva\`.
 * Solo estructura: todo lo marcado TODO debe escribirse (y las cifras, verificarse) antes de
 * publicar. Los negocios, precios y resultados de ejemplo son FICTICIOS y se etiquetan como tales.
 * Las imágenes van en public/images/guias/${meta.category}/${meta.slug}/ (opcionales: la página no depende de ellas).
 */
const slot = guideSlots(${q(meta.category)}, ${q(meta.slug)});

export default defineGuide({
  metadata: {
    slug: ${q(meta.slug)},
    category: ${q(meta.category)},
    title: ${q(meta.title)},
    description: ${q(meta.description)},
    author: "develoclick",
    publishedAt: null, // fecha REAL (AAAA-MM-DD) al publicar
    updatedAt: ${q(meta.updatedAt)},
    status: "draft", // "published" solo cuando el validador lo apruebe
    problem: ${q(meta.problem)},
    whyThisPage: ${q(meta.whyThisPage)},
    tipoGuia: [], // TODO: uno o más de tutorial-herramienta | decision-comparacion | estrategia-planificacion | automatizacion-flujo | numeros-datos | comunicacion-atencion | tema-sensible | conceptual-educativa | creativa-visual
    relatedGuides: [${related}],${flags ? `\n${flags}` : ""}
  },

  hero: {
    subtitle: "TODO subtítulo: el valor de la guía en una o dos frases",
    difficulty: "Principiante",
    tools: ["TODO herramienta o recurso que necesita el lector"],
  },

  problem: {
    summary: "TODO el problema real, con su contexto (mínimo 40 palabras)",
    symptoms: ["TODO señal 1", "TODO señal 2", "TODO señal 3"],
  },

  outcome: {
    summary: "TODO qué tendrá el lector al terminar",
    deliverables: [
      { label: "TODO entregable 1", detail: "TODO" },
      { label: "TODO entregable 2", detail: "TODO" },
    ],
  },

  caseStudy: {
    business: "TODO negocio del caso",
    situation: "TODO",
    goal: "TODO",
    data: [
      { label: "TODO dato 1", value: "TODO" },
      { label: "TODO dato 2", value: "TODO" },
      { label: "TODO dato 3", value: "TODO" },
    ],
    problem: "TODO",
    application: "TODO",
    result: "TODO",
    fictional: true, // un caso real necesita \`evidence\` con una fuente verificable
  },

  before: {
    request: "TODO la petición insuficiente habitual",
    whyInsufficient: "TODO por qué no funciona",
    issues: ["TODO problema 1", "TODO problema 2"],
  },

  dataPreparation: {
    intro: "TODO",
    items: [
      { label: "TODO dato 1", detail: "TODO", example: "TODO", required: true },
      { label: "TODO dato 2", detail: "TODO", required: true },
      { label: "TODO dato 3", detail: "TODO", required: false },
    ],
  },

  method: {
    intro: "TODO",
    steps: [
      { title: "TODO paso 1", description: "TODO", output: "TODO" },
      { title: "TODO paso 2", description: "TODO", output: "TODO" },
      { title: "TODO paso 3", description: "TODO", output: "TODO" },
    ],
  },

  prompts: {
    principal: {
      title: "TODO título del prompt",
      objective: "TODO",
      whenToUse: "TODO",
      requiredData: ["TODO"],
      variables: [{ name: "NEGOCIO", description: "TODO", example: "TODO" }],
      prompt: "TODO texto del prompt con {{NEGOCIO}} y el resto de variables documentadas",
      explanation: [
        { part: "TODO fragmento 1", why: "TODO" },
        { part: "TODO fragmento 2", why: "TODO" },
      ],
      example: "TODO ejemplo ficticio de uso",
      expectedResult: "TODO",
      recommendations: ["TODO"],
      warnings: [],
    },
    iteracion: {
      title: "TODO mensaje de seguimiento",
      objective: "TODO",
      whenToUse: "TODO",
      requiredData: ["TODO"],
      variables: [],
      prompt: "TODO mensaje de seguimiento",
      explanation: [
        { part: "TODO fragmento 1", why: "TODO" },
        { part: "TODO fragmento 2", why: "TODO" },
      ],
      example: "TODO",
      expectedResult: "TODO",
      recommendations: ["TODO"],
      warnings: [],
    },
  },

  analysis: {
    intro: "TODO",
    criteria: [
      { criterion: "TODO criterio 1", verdict: "ok", comment: "TODO" },
      { criterion: "TODO criterio 2", verdict: "improve", comment: "TODO" },
      { criterion: "TODO criterio 3", verdict: "risk", comment: "TODO" },
    ],
    conclusion: "TODO",
  },

  iteration: {
    intro: "TODO",
    promptId: "iteracion",
    why: "TODO",
  },

  beforeAfter: {
    before: { label: "Antes", parts: [{ type: "text", text: "TODO resultado o planteamiento de partida" }] },
    after: { label: "Después", parts: [{ type: "text", text: "TODO resultado tras aplicar el método" }] },
    takeaway: "TODO qué cambia entre el antes y el después",
  },

  mistakes: [
    { title: "TODO error 1", whyItHurts: "TODO", instead: "TODO" },
    { title: "TODO error 2", whyItHurts: "TODO", instead: "TODO" },
    { title: "TODO error 3", whyItHurts: "TODO", instead: "TODO" },
  ],

  verification: {
    intro: "TODO",
    items: [{ label: "TODO comprobación 1" }, { label: "TODO comprobación 2" }, { label: "TODO comprobación 3" }],
    principle: "La IA ayuda a generar y analizar. La persona verifica y decide.",
  },

  conclusion: {
    summary: "TODO",
    takeaways: ["TODO idea 1", "TODO idea 2", "TODO idea 3"],
  },

  faq: [
    { question: "TODO pregunta real 1", answer: "TODO respuesta útil de al menos 40 caracteres" },
    { question: "TODO pregunta real 2", answer: "TODO respuesta útil de al menos 40 caracteres" },
    { question: "TODO pregunta real 3", answer: "TODO respuesta útil de al menos 40 caracteres" },
  ],

  // Secciones opcionales: añade aquí las claves que necesites (tools, firstResult, improvedResult,
  // examples, comparisons, personalization, application, checklist, variations, limitations, sources, evidence) y descomenta su
  // sección en guide.mdx. Ver content/guias/marketing/crear-promociones-con-ia/data.ts como referencia.

  // Manifiesto de imágenes: un slot por imagen prevista. Solo las que ayudan a entender, decidir o
  // ejecutar (máx. una por sección; hero + 2 a 6). La imagen real se añade soltando el archivo en la
  // carpeta de la guía; sin archivo, en producción no aparece nada. Coloca cada slot en guide.mdx con
  // <GuideImage slot={data.images.clave} />. No se generan imágenes falsas ni se usa stock.
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "TODO por qué esta imagen ayuda al lector más que el texto",
      description: "TODO 2 a 4 frases: qué debe verse, qué resaltar, qué datos ficticios usar y por qué ayuda",
      alt: "TODO describe lo que se ve en la imagen principal",
    }),
  },
});
`;
}

export function renderMdxTemplate(meta: Pick<TemplateMeta, "handlesNumbers" | "usesExternalInfo">): string {
  const required = SECTION_CATALOG.filter((section) => section.required);
  const optional = SECTION_CATALOG.filter((section) => !section.required);
  const lines: string[] = ['import data from "./data";', ""];

  for (const section of required) {
    lines.push(`<GuideSection id="${section.id}" title="TODO título propio de esta sección (${section.label.toLowerCase()})">`, "", `{/* TODO prosa que introduce la sección (opcional, en tus palabras) */}`, "");
    lines.push(SNIPPETS[section.id], "");
    if (section.id === "datos" && meta.handlesNumbers) {
      lines.push('<Callout variant="calculos" title="TODO qué cuentas hace la persona">', "", "TODO fórmulas que verifica la persona con una calculadora.", "", "</Callout>", "");
    }
    if (section.id === "datos" && meta.usesExternalInfo) {
      lines.push('<Callout variant="fuentes" title="TODO datos y fuentes">', "", "TODO qué datos aporta la persona y qué genera la IA como hipótesis.", "", "</Callout>", "");
    }
    lines.push("</GuideSection>", "");
  }

  lines.push("{/*", "Secciones opcionales (mantén el ORDEN CANÓNICO al insertarlas; los ids válidos están en lib/guides/constants.ts):", "");
  for (const section of optional) {
    const hint = OPTIONAL_DATA_HINT[section.id];
    lines.push(`  ${section.id}${hint ? ` — necesita ${hint}` : ""}:  ${SNIPPETS[section.id]}`);
  }
  lines.push("*/}", "");
  return lines.join("\n");
}

export function renderReadmeTemplate(meta: TemplateMeta): string {
  return `# ${meta.title}

**Ruta:** \`/${meta.category}/guias/${meta.slug}\` · **Estado:** borrador.

## Qué entregar para completar esta guía

\`\`\`
RUTA:
${meta.category}/guias/${meta.slug}
CONTENIDO:
./contenido/${meta.slug}.md
IMÁGENES:
./imagenes/${meta.slug}/
VIDEO:
(opcional)
RECURSOS:
(opcional)
\`\`\`

## Archivos

- \`data.ts\` — todo el contenido estructurado (tipado con \`GuideData\`).
- \`guide.mdx\` — el orden de las secciones y la prosa que las une.
- Imágenes: \`public/images/guias/${meta.category}/${meta.slug}/\` (\`hero.webp\`, \`problema.webp\`, \`caso-practico.webp\`, \`paso-01.webp\`… con nombres semánticos).

## Problema que resuelve

${meta.problem}

## Antes de publicar

- [ ] Sin marcadores TODO. Cifras verificadas y ejemplos etiquetados como ficticios.
- [ ] \`status: "published"\` y \`publishedAt\` con la fecha real.
- [ ] \`npm run guias:validar\` sin errores.
`;
}
