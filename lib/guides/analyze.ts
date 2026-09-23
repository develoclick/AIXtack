import { createProcessor } from "@mdx-js/mdx";

/**
 * Análisis estático del código fuente de una guía (guide.mdx): secciones, componentes,
 * referencias a los datos (`data.x.y`), enlaces, texto plano y párrafos. Lo usan el loader
 * (índice de contenidos, tiempo de lectura) y el validador (scripts/validate-guides.ts).
 * Sin dependencias de Next.
 */

interface Attribute {
  type: string;
  name?: string;
  value?: string | { type: string; value: string } | null;
}

interface MdNode {
  type: string;
  name?: string | null;
  value?: string;
  url?: string;
  attributes?: Attribute[];
  children?: MdNode[];
}

export interface ComponentInstance {
  name: string;
  /** Índice de la <GuideSection> que lo contiene (-1 si está fuera de las secciones). */
  sectionIndex: number;
  attrs: Record<string, { kind: "string" | "expression"; value: string }>;
}

export interface AnalyzedSection {
  index: number;
  id: string;
  title: string;
  /** Parte del índice (atributo part), si la guía agrupa el índice. */
  part: string;
  /** Texto plano de la sección (prosa + literales de las props de los componentes). */
  text: string;
}

export interface GuideAnalysis {
  sections: AnalyzedSection[];
  components: ComponentInstance[];
  /** Referencias a los datos: `data.caseStudy.image` → ["caseStudy", "image"]. */
  dataRefs: string[][];
  /** Enlaces (markdown y href) que empiezan por "/" o "http". */
  links: string[];
  paragraphs: string[];
  /** Texto plano de todo el cuerpo (sin los import/export). */
  bodyText: string;
  wordCount: number;
  /** Problemas estructurales (atributos no literales, contenido fuera de secciones…). */
  errors: string[];
  /**
   * Nombres importados de rutas relativas (`./components`, `../algo`…): componentes propios de
   * ESTA guía, no del registro compartido. El validador los admite además de GUIDE_COMPONENTS.
   */
  localImports: string[];
}

const processor = createProcessor();

/** Props cuyo valor es configuración, no texto para el lector. */
const NON_TEXT_ATTRS = new Set(["id", "type", "view", "variant", "href", "levels"]);

const LITERAL_PATTERN = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
const DATA_REF_PATTERN = /\bdata((?:\s*\.\s*[A-Za-z_$][\w$]*|\s*\[\s*["'][^"']+["']\s*\])+)/g;

function literalsOf(expression: string): string[] {
  const found: string[] = [];
  for (const match of expression.matchAll(LITERAL_PATTERN)) found.push(match[1] ?? match[2] ?? match[3] ?? "");
  return found;
}

function dataRefsOf(expression: string): string[][] {
  const refs: string[][] = [];
  for (const match of expression.matchAll(DATA_REF_PATTERN)) {
    const path = [...match[1].matchAll(/\.\s*([A-Za-z_$][\w$]*)|\[\s*["']([^"']+)["']\s*\]/g)].map((m) => m[1] ?? m[2]);
    if (path.length > 0) refs.push(path);
  }
  return refs;
}

/** Todas las cadenas de un valor (objeto/array): para contar palabras y comparar textos. */
export function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

function isJsx(node: MdNode): boolean {
  return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}

function isComment(node: MdNode): boolean {
  if (node.type !== "mdxFlowExpression" && node.type !== "mdxTextExpression") return false;
  const value = (node.value ?? "").trim();
  return value.startsWith("/*") && value.endsWith("*/");
}

function readAttributes(node: MdNode): ComponentInstance["attrs"] {
  const attrs: ComponentInstance["attrs"] = {};
  for (const attribute of node.attributes ?? []) {
    if (attribute.type !== "mdxJsxAttribute" || !attribute.name) continue;
    const { value } = attribute;
    if (value === null || value === undefined) attrs[attribute.name] = { kind: "string", value: "" };
    else if (typeof value === "string") attrs[attribute.name] = { kind: "string", value };
    else attrs[attribute.name] = { kind: "expression", value: value.value };
  }
  return attrs;
}

function textOf(node: MdNode): string {
  if (node.type === "text" || node.type === "inlineCode" || node.type === "code") return node.value ?? "";
  if (node.type === "mdxjsEsm" || isComment(node)) return "";
  return (node.children ?? []).map(textOf).join(" ");
}

interface Collector {
  parts: string[];
  paragraphs: string[];
  components: ComponentInstance[];
  dataRefs: string[][];
  links: string[];
}

function collect(node: MdNode, sectionIndex: number, into: Collector): void {
  if (node.type === "mdxjsEsm" || isComment(node)) return;

  if (node.type === "text" || node.type === "inlineCode" || node.type === "code") {
    if (node.value) into.parts.push(node.value);
  } else if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
    into.parts.push(...literalsOf(node.value ?? ""));
    into.dataRefs.push(...dataRefsOf(node.value ?? ""));
  } else if (node.type === "paragraph") {
    const text = textOf(node).replace(/\s+/g, " ").trim();
    if (text) into.paragraphs.push(text);
  } else if (node.type === "link" && node.url) {
    into.links.push(node.url);
  }

  if (isJsx(node)) {
    const attrs = readAttributes(node);
    into.components.push({ name: node.name ?? "", sectionIndex, attrs });
    for (const [name, attr] of Object.entries(attrs)) {
      if (name === "href" && attr.kind === "string") into.links.push(attr.value);
      if (attr.kind === "expression") into.dataRefs.push(...dataRefsOf(attr.value));
      if (NON_TEXT_ATTRS.has(name)) continue;
      if (attr.kind === "string") into.parts.push(attr.value);
      else into.parts.push(...literalsOf(attr.value));
    }
  }

  (node.children ?? []).forEach((child) => collect(child, sectionIndex, into));
}

const emptyCollector = (): Collector => ({ parts: [], paragraphs: [], components: [], dataRefs: [], links: [] });

/** Nombres locales de un `import ... from "./ruta relativa"` (estree del nodo mdxjsEsm). */
function relativeImportNames(node: MdNode): string[] {
  const body = (node as unknown as { data?: { estree?: { body?: unknown[] } } }).data?.estree?.body ?? [];
  const names: string[] = [];
  for (const stmt of body) {
    const s = stmt as { type?: string; source?: { value?: unknown }; specifiers?: { local?: { name?: string } }[] };
    if (s.type !== "ImportDeclaration" || typeof s.source?.value !== "string" || !s.source.value.startsWith(".")) continue;
    for (const spec of s.specifiers ?? []) if (spec.local?.name) names.push(spec.local.name);
  }
  return names;
}

export function analyzeGuideSource(source: string): GuideAnalysis {
  const root = processor.parse(source) as unknown as MdNode;
  const sections: AnalyzedSection[] = [];
  const errors: string[] = [];
  const all = emptyCollector();
  const localImports: string[] = [];

  for (const child of root.children ?? []) {
    if (child.type === "mdxjsEsm") { localImports.push(...relativeImportNames(child)); continue; }
    if (isComment(child)) continue;

    if (isJsx(child) && child.name === "GuideSection") {
      const index = sections.length;
      const attrs = readAttributes(child);
      const id = attrs.id?.kind === "string" ? attrs.id.value : "";
      const title = attrs.title?.kind === "string" ? attrs.title.value : "";
      const part = attrs.part?.kind === "string" ? attrs.part.value : "";
      if (!id) errors.push(`<GuideSection> nº ${index + 1}: id="…" debe ser un texto literal.`);
      if (!title) errors.push(`<GuideSection> nº ${index + 1}: title="…" debe ser un texto literal.`);

      const local = emptyCollector();
      (child.children ?? []).forEach((grandchild) => collect(grandchild, index, local));

      sections.push({ index, id, title, part, text: local.parts.join(" ").replace(/\s+/g, " ").trim() });
      all.parts.push(title, ...local.parts);
      all.paragraphs.push(...local.paragraphs);
      all.components.push(...local.components);
      all.dataRefs.push(...local.dataRefs);
      all.links.push(...local.links);
    } else {
      errors.push(
        `Hay contenido fuera de una <GuideSection> (${child.type}${child.name ? ` <${child.name}>` : ""}). Todo el cuerpo debe ir dentro de secciones.`
      );
      collect(child, -1, all);
    }
  }

  const bodyText = all.parts.join(" ").replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(" ").length : 0;

  return {
    sections,
    components: all.components,
    dataRefs: all.dataRefs,
    links: all.links.filter((link) => link.startsWith("/") || link.startsWith("http")),
    paragraphs: all.paragraphs,
    bodyText,
    wordCount,
    errors,
    localImports,
  };
}
