import type { CategorySlug } from "../../content/categorias";

/**
 * Modelo de contenido de una guía (`content/guias/<categoria>/<slug>/data.ts`).
 *
 * CONTENIDO → MODELO DE DATOS → COMPONENTES → LAYOUT → ESTILOS → PÁGINA
 *
 * Este archivo solo describe la FORMA de los datos. El contenido de cada guía vive en su
 * carpeta; los componentes (components/guide/) son genéricos y reciben estos datos. Los
 * campos obligatorios son el mínimo de calidad; el resto lo decide cada guía.
 */

export type GuideStatus = "draft" | "published";
export type Difficulty = "Principiante" | "Intermedio" | "Avanzado";
export type AspectRatio = "16/9" | "21/9" | "4/3" | "3/2" | "1/1" | "3/4";

/** Identificadores de las secciones que puede usar una guía (ver SECTION_CATALOG). */
export type SectionId =
  | "problema"
  | "resultado-esperado"
  | "para-quien"
  | "caso-practico"
  | "marco"
  | "antes"
  | "datos"
  | "herramientas"
  | "metodo"
  | "hoja"
  | "entrevista"
  | "prompt"
  | "adaptacion"
  | "explicacion"
  | "primer-resultado"
  | "analisis"
  | "iteracion"
  | "resultado-final"
  | "antes-despues"
  | "ejemplos"
  | "comparativa"
  | "medicion"
  | "errores"
  | "personalizacion"
  | "verificacion"
  | "aplicacion"
  | "checklist"
  | "variaciones"
  | "limitaciones"
  | "conclusion"
  | "glosario"
  | "faq"
  | "fuentes"
  | "video";

/* ─────────────────────────── metadatos ─────────────────────────── */

export interface GuideMetadata {
  slug: string;
  category: CategorySlug;
  title: string;
  /** Meta description única (70–170 caracteres). */
  description: string;
  /** id del registro content/autores.ts. */
  author: string;
  /** Fecha REAL de publicación (AAAA-MM-DD); null mientras sea borrador. */
  publishedAt: string | null;
  /** Fecha REAL de la última modificación de contenido (AAAA-MM-DD). */
  updatedAt: string;
  status: GuideStatus;
  /** El problema empresarial concreto que resuelve, en una frase. */
  problem: string;
  /** Justificación de por qué merece una URL propia. */
  whyThisPage: string;
  /** Slugs de guías relacionadas (reales o planificadas en content/plan-guias.ts). */
  relatedGuides: string[];
  /** Tipo(s) de guía: fija qué secciones y módulos usa (ver GUIDE_TYPES). Las guías nuevas lo declaran. */
  tipoGuia?: GuideType[];
  /** Trabaja con precios, márgenes, descuentos, cantidades, costos… (exige un aviso de cálculos). */
  handlesNumbers?: boolean;
  /** 3 = guía escrita con el estándar v3 (sin repeticiones, prompts sofisticados, pruebas reales…). */
  estandarGuia?: 3;
  /** Activo original y reutilizable que entrega la guía (rúbrica, plantilla, matriz, cadena de prompts…). */
  activoOriginal?: string;
  /** Usa información externa: competidores, mercado… (exige un aviso de fuentes). */
  usesExternalInfo?: boolean;
}

/* ─────────────────────────── imágenes ─────────────────────────── */

/** Imagen de una guía. Construir siempre con guideImages(): la ruta sale de la carpeta de la guía. */
export interface ImageRef {
  /** Ruta pública (/images/guias/<categoria>/<slug>/<archivo>). */
  src: string;
  /** Texto alternativo: describe lo que aporta la imagen al lector. */
  alt: string;
  caption?: string;
  credit?: string;
  aspectRatio?: AspectRatio;
  /** Permite ampliar la imagen (lightbox). */
  zoom?: boolean;
  /** Carga prioritaria (solo la imagen hero). */
  priority?: boolean;
  /** Qué debe mostrar exactamente (solo se ve en el marcador de desarrollo). */
  purpose?: string;
}

export type GuideType =
  | "tutorial-herramienta"
  | "decision-comparacion"
  | "estrategia-planificacion"
  | "automatizacion-flujo"
  | "numeros-datos"
  | "comunicacion-atencion"
  | "tema-sensible"
  | "conceptual-educativa"
  | "creativa-visual";

/**
 * Espacio de imagen declarado en el manifiesto `images` de una guía. La imagen real la aporta
 * una persona más tarde soltando el archivo en la carpeta de la guía; el slot ya está colocado
 * donde se necesita y se renderiza SOLO si el archivo existe (ver GuideImage y ImageBlock).
 */
export interface ImageSlot {
  /** Nombre semántico en WebP: hero.webp, paso-02.webp, resultado.webp… */
  file: string;
  /** Sección donde se coloca, o «hero» para la cabecera. */
  section: SectionId | "hero";
  /** Por qué ayuda al lector a entender, decidir o ejecutar mejor que el texto. */
  purpose: string;
  /** Descripción textual para producir la imagen (2 a 4 frases): qué se ve, qué resaltar, qué datos ficticios usar. */
  description?: string;
  ratio: AspectRatio;
  alt: string;
  caption?: string;
  zoom?: boolean;
  /** Si la imagen es la prueba real de un prompt: la clave del prompt (`prompts.<clave>`). */
  promptId?: string;
  /** Ruta pública (la construye guideSlots()). */
  src: string;
}

/* ─────────────────────────── piezas genéricas ─────────────────────────── */

export interface KeyValue {
  label: string;
  value: string;
}

export interface TableData {
  caption: string;
  /** ¿Qué decisión o comprensión obtiene el lector gracias a esta tabla? */
  purpose: string;
  columns: string[];
  rows: string[][];
  note?: string;
  /** Muestra el botón «Copiar como tabla» (pegable en una hoja de cálculo). */
  copyable?: boolean;
}

/** Contenido mostrable dentro de resultados y bloques antes/después. */
export type ContentPart =
  | { type: "text"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; code: string; language?: string }
  | { type: "table"; table: TableData }
  | { type: "image"; image: ImageRef };

/* ─────────────────────────── prompts ─────────────────────────── */

export interface PromptVariable {
  /** Nombre en MAYÚSCULAS tal como aparece en el prompt: {{NEGOCIO}}. */
  name: string;
  description: string;
  /** Valor de ejemplo (ficticio). */
  example: string;
}

export interface PromptExplanationPart {
  /** Fragmento o bloque del prompt que se explica. */
  part: string;
  /** Qué hace, por qué funciona y qué puede modificar el lector. */
  why: string;
}

export interface GuidePrompt {
  title: string;
  objective: string;
  /** Una frase: en qué momento se usa. */
  whenToUse: string;
  /** Solo estándares anteriores: los datos previos generales se explican una vez en la guía, no en cada prompt. */
  requiredData?: string[];
  variables: PromptVariable[];
  prompt: string;
  /** Por qué funciona, por partes y en lenguaje simple. */
  explanation: PromptExplanationPart[];
  /** Cómo evaluar la salida de este prompt. */
  evaluate?: string;
  /** Cómo mejorarla si no cumple. */
  improve?: string;
  /** Prompts conversacionales: ejemplo breve (2 o 3 turnos, ilustrativo) del intercambio. */
  conversation?: { who: "tu" | "ia"; text: string }[];
  /** Estándares anteriores. */
  example?: string;
  expectedResult?: string;
  recommendations?: string[];
  warnings?: string[];
}

/* ─────────────────────────── secciones ─────────────────────────── */

export interface GuideHero {
  subtitle: string;
  difficulty: Difficulty;
  /** Herramientas que necesita el lector (genéricas: «Un asistente de IA», «Una hoja de cálculo»). */
  tools?: string[];
  image?: ImageRef;
}

export interface ProblemData {
  summary: string;
  /** Señales con las que el lector se reconoce en el problema. */
  symptoms: string[];
  image?: ImageRef;
}

export interface OutcomeData {
  summary: string;
  deliverables: { label: string; detail: string }[];
  image?: ImageRef;
}

export interface AudienceData {
  /** Situaciones en las que la guía sirve. */
  forWho: string[];
  /** Situaciones en las que NO es lo que la persona busca (o necesita otra cosa antes). */
  notForWho: string[];
}

/** Ficha rápida inicial: lo que necesita saber alguien que llega a la guía antes de empezar. */
export interface QuickFactsData {
  /** Tiempo aproximado para completar la guía (recomendación, no medición). */
  time: string;
  /** Qué necesita tener a mano. */
  needs: string[];
  /** Qué se llevará al terminar. */
  result: string;
  /** Costo aproximado, SOLO si se verificó; exige `costVerifiedAt`. */
  cost?: string;
  /** Fecha real (AAAA-MM-DD) de la verificación del costo. */
  costVerifiedAt?: string;
}

/** Marco de trabajo: los conceptos que ordenan la guía, explicados para alguien que parte de cero. */
export interface FrameworkData {
  intro: string;
  blocks: {
    title: string;
    /** «En palabras simples»: solo si el concepto es difícil (máx. 4 por guía). */
    simple?: string;
    detail: string;
    example?: string;
  }[];
}

/** Autoevaluación con rúbrica: casillas de 0 a 2 puntos por criterio y un mensaje según el puntaje. */
export interface RubricData {
  /** Identificador estable. */
  id: string;
  title: string;
  intro: string;
  criteria: { id: string; label: string; detail?: string }[];
  /** Umbrales de puntaje total, de menor a mayor (`min` = puntaje mínimo). */
  outcomes: { min: number; label: string; advice: string }[];
}

export interface CaseStudyData {
  business: string;
  situation: string;
  goal: string;
  data: KeyValue[];
  problem: string;
  application: string;
  result: string;
  /** true = caso ficticio (se etiqueta «CASO FICTICIO»). */
  fictional: boolean;
  /** Obligatorio si fictional es false: de dónde sale el caso (fuente verificable). */
  evidence?: string;
  image?: ImageRef;
}

export interface BeforeData {
  /** Cómo suele plantearse el problema (la petición insuficiente). */
  request: string;
  whyInsufficient: string;
  issues: string[];
  image?: ImageRef;
}

export interface DataPreparationData {
  intro: string;
  items: { label: string; detail: string; example?: string; required: boolean }[];
  image?: ImageRef;
}

export interface ToolsData {
  intro: string;
  items: { name: string; role: string; examples?: string[]; note?: string }[];
}

export interface MethodStep {
  title: string;
  description: string;
  /** Qué tiene el lector al terminar el paso. */
  output?: string;
  image?: ImageRef;
}

export interface MethodData {
  intro: string;
  steps: MethodStep[];
}

export interface ResultData {
  /** «generated» = ejemplo generado con IA para esta guía; «userData» = datos aportados por el usuario. */
  kind: "generated" | "userData";
  intro?: string;
  parts: ContentPart[];
  image?: ImageRef;
}

export interface AnalysisData {
  intro: string;
  /** `criterionId` toma nombre y descripción de `rubric.criteria` (fuente única); `criterion` es el texto libre de guías anteriores. */
  criteria: { criterionId?: string; criterion?: string; verdict: "ok" | "improve" | "risk"; comment: string }[];
  conclusion: string;
}

export interface IterationData {
  intro: string;
  /** id (clave de `prompts`) del mensaje de seguimiento. */
  promptId: string;
  why: string;
  image?: ImageRef;
}

export interface BeforeAfterData {
  before: { label?: string; parts: ContentPart[] };
  after: { label?: string; parts: ContentPart[] };
  takeaway: string;
  image?: ImageRef;
}

export interface ExampleData {
  id: string;
  title: string;
  business: string;
  scenario: string;
  keyData: KeyValue[];
  approach: string;
  /** Qué se decide y por qué (nunca resultados comerciales inventados). */
  decision: string;
  fictional: boolean;
  image?: ImageRef;
}

export interface MistakeData {
  title: string;
  whyItHurts: string;
  instead: string;
}

export interface PersonalizationData {
  intro: string;
  dimensions: { title: string; how: string }[];
}

export interface VerificationData {
  intro: string;
  items: { label: string; detail?: string }[];
  /** Principio a recordar: la IA ayuda; la persona verifica y decide. */
  principle: string;
}

export interface ApplicationData {
  intro: string;
  steps: { title: string; detail: string }[];
}

export interface ChecklistData {
  /** Identificador estable (con el slug forma la clave de localStorage). */
  id: string;
  title: string;
  items: { id: string; label: string; detail?: string }[];
}

export interface VariationsData {
  intro: string;
  items: { title: string; description: string; promptChange: string }[];
}

export interface LimitationsData {
  intro: string;
  items: { title: string; detail: string }[];
}

export interface ConclusionData {
  summary: string;
  takeaways: string[];
  /** Slug de la guía recomendada como siguiente paso (se muestra solo si existe). */
  nextGuide?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Una fuente consultada. Los datos que caducan (precios, límites, políticas) se declaran con su fecha. */
export interface SourceItem {
  title: string;
  /** Quién la publica (Google Search Central, Google Merchant Center Help…). */
  publisher: string;
  /** Enlace https a la fuente primaria. */
  url: string;
  /** Fecha REAL de consulta (AAAA-MM-DD). */
  consultedAt: string;
  /** Qué se tomó de la fuente y, si la página lo indica, su última actualización. */
  note?: string;
  /** true = dato que puede cambiar: conviene volver a verificarlo antes de publicar de nuevo. */
  mayExpire?: boolean;
}

export interface SourcesData {
  intro?: string;
  items: SourceItem[];
}

/**
 * Evidencia REAL aportada por una persona (nunca por el sistema): capturas, una prueba propia con
 * fecha, una nota de la autoría o una revisión humana. Todo es opcional y solo se muestra si existe:
 * jamás hay marcadores vacíos ni textos «próximamente».
 */
export interface PromptTest {
  /** Clave del prompt probado (`prompts.<clave>`). */
  promptId: string;
  /** Fecha real de la prueba (AAAA-MM-DD). */
  fecha?: string;
  /** Asistente con el que el autor hizo la prueba. */
  asistente?: string;
  /** Lo que el autor observó. Solo lo escribe el autor. */
  nota?: string;
}

export interface EvidenceData {
  /** Pruebas reales de prompts hechas por el autor (se muestran junto a cada prompt, con su imagen). */
  pruebas?: PromptTest[];
  /** Caso real propio del autor, documentado por él. */
  casoReal?: { titulo: string; descripcion: string; fecha?: string };
  /** Fecha real (AAAA-MM-DD) de la última revisión humana de la guía. */
  revisadoEn?: string;
  screenshots?: ImageRef[];
  ownTest?: { description: string; date: string; result?: string };
  authorNote?: { text: string; author?: string };
  review?: { reviewedAt: string; reviewer?: string; notes?: string };
}

export interface VideoData {
  /** «upcoming» = «VIDEO PRÓXIMAMENTE»; «published» exige youtubeId real. */
  status: "upcoming" | "published";
  title: string;
  description: string;
  /** Solo con un video real. Nunca se inventa. */
  youtubeId?: string;
  /** Duración legible (mm:ss). */
  duration?: string;
  /** AAAA-MM-DD de publicación del video (para VideoObject). */
  uploadDate?: string;
  chapters?: { time: string; title: string }[];
  thumbnail?: ImageRef;
}

/** Metadata editorial INTERNA (no se muestra al lector): la guía como fuente de video. */
export interface MediaPlan {
  longVideo: {
    title: string;
    description: string;
    /** Minutos estimados. */
    estimatedDuration: number;
    chapters: { title: string; sourceSection: SectionId }[];
  };
  shorts: { title: string; hook: string; topic: string; sourceSection: SectionId }[];
}

/* ─────────────────────────── guía completa ─────────────────────────── */

export interface GuideData {
  metadata: GuideMetadata;
  hero: GuideHero;
  problem: ProblemData;
  outcome: OutcomeData;
  audience?: AudienceData;
  quickFacts?: QuickFactsData;
  caseStudy: CaseStudyData;
  framework?: FrameworkData;
  before: BeforeData;
  dataPreparation: DataPreparationData;
  tools?: ToolsData;
  method: MethodData;
  /** Prompts de la guía por id (p. ej. principal, iteracion). */
  prompts: Record<string, GuidePrompt>;
  firstResult?: ResultData;
  analysis: AnalysisData;
  iteration: IterationData;
  improvedResult?: ResultData;
  beforeAfter?: BeforeAfterData;
  examples?: ExampleData[];
  /** Tablas comparativas por id. */
  comparisons?: Record<string, TableData>;
  mistakes: MistakeData[];
  personalization?: PersonalizationData;
  verification: VerificationData;
  application?: ApplicationData;
  checklist?: ChecklistData;
  variations?: VariationsData;
  limitations?: LimitationsData;
  conclusion: ConclusionData;
  faq: FaqItem[];
  /** Manifiesto de imágenes por clave (hero, paso02…); cada guía nueva declara al menos `hero`. */
  images?: Record<string, ImageSlot>;
  /** Rúbrica de autoevaluación del resultado de la IA. */
  rubric?: RubricData;
  /** ids del glosario compartido (content/glosario.ts) que la guía usa con <Term id>. */
  glossary?: string[];
  sources?: SourcesData;
  evidence?: EvidenceData;
  video?: VideoData;
  mediaPlan?: MediaPlan;
}

/** Declara los datos de una guía con comprobación estricta de tipos (sin campos de más ni de menos). */
export function defineGuide(data: GuideData): GuideData {
  return data;
}
