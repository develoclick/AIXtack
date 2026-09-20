/**
 * Crea la ESTRUCTURA TÉCNICA de una guía nueva. No genera contenido: la carpeta nace como
 * borrador con marcadores TODO y no se puede publicar hasta que el validador lo apruebe.
 *
 *   npm run guia:nueva <slug> [categoria]
 *
 * Crea:
 *   content/guias/<categoria>/<slug>/{README.md, guide.mdx, data.ts}
 *   public/images/guias/<categoria>/<slug>/
 *
 * La categoría se deduce del plan aprobado (content/plan-guias.ts); solo hace falta indicarla
 * para un slug fuera del plan (con --fuera-de-plan).
 */
import fs from "node:fs";
import path from "node:path";
import { categories, isCategorySlug } from "../content/categorias";
import { getPlannedGuide } from "../content/plan-guias";
import { FORBIDDEN_SLUG_PATTERNS, SLUG_PATTERN } from "../lib/guides/constants";
import { renderDataTemplate, renderMdxTemplate, renderReadmeTemplate } from "./guide-template";

const args = process.argv.slice(2);
const outOfPlan = args.includes("--fuera-de-plan");
const [slug, categoryArg] = args.filter((arg) => !arg.startsWith("--"));

const FUNNEL = `
Antes de crear una URL nueva, responde con sinceridad (docs/GUIA-EDITORIAL.md):

  ¿Existe un problema empresarial real?
        ↓
  ¿Es suficientemente diferente de una guía existente?
        ↓
  ¿Aporta conocimiento nuevo?
        ↓
  ¿Tiene suficiente profundidad?
        ↓
  ¿Merece una URL independiente?

Si alguna respuesta no es un sí claro: NO crees la URL; amplía una guía existente.
`;

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

if (!slug) {
  console.log("Uso: npm run guia:nueva <slug> [categoria]");
  console.log(`Categorías: ${categories.map((c) => c.slug).join(", ")}`);
  console.log(FUNNEL);
  process.exit(1);
}

if (!SLUG_PATTERN.test(slug)) fail("El slug solo puede tener minúsculas, números y guiones (ej. crear-anuncios-con-ia).");
for (const { pattern, reason } of FORBIDDEN_SLUG_PATTERNS) {
  if (pattern.test(slug)) fail(`Slug no permitido: ${reason}. Nombra la guía por el problema o la tarea.`);
}

const planned = getPlannedGuide(slug);
if (!planned && !outOfPlan) {
  fail(
    `"${slug}" no está en el plan aprobado (content/plan-guias.ts). Ampliar el conjunto de guías requiere aprobación previa; ` +
      "si está aprobada, añádela al plan o usa --fuera-de-plan."
  );
}

const category = planned?.category ?? categoryArg;
if (!category) fail("Indica la categoría: npm run guia:nueva <slug> <categoria> --fuera-de-plan");
if (!isCategorySlug(category)) fail(`Categoría inválida "${category}". Válidas: ${categories.map((c) => c.slug).join(", ")}.`);
if (planned && categoryArg && categoryArg !== planned.category) fail(`El plan asigna "${slug}" a la categoría "${planned.category}", no a "${categoryArg}".`);

const root = process.cwd();
const dir = path.join(root, "content", "guias", category, slug);
const imagesDir = path.join(root, "public", "images", "guias", category, slug);
if (fs.existsSync(dir)) fail(`Ya existe content/guias/${category}/${slug}. Si el tema coincide, actualiza esa guía en lugar de crear otra.`);

const meta = {
  slug,
  category,
  title: "TODO título de la guía (máx. 65 caracteres)",
  description: "TODO descripción única de 70 a 170 caracteres",
  updatedAt: new Date().toLocaleDateString("en-CA"), // fecha local real (AAAA-MM-DD)
  problem: planned?.problem ?? "TODO el problema empresarial concreto que resuelve, en una frase",
  whyThisPage: planned?.whyThisPage ?? "TODO por qué merece una URL propia y en qué se diferencia de las guías existentes",
  relatedGuides: planned?.relatedGuides ?? [],
  handlesNumbers: planned?.handlesNumbers,
  usesExternalInfo: planned?.usesExternalInfo,
};

fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(imagesDir, { recursive: true });
fs.writeFileSync(path.join(dir, "README.md"), renderReadmeTemplate(meta));
fs.writeFileSync(path.join(dir, "guide.mdx"), renderMdxTemplate(meta));
fs.writeFileSync(path.join(dir, "data.ts"), renderDataTemplate(meta));
fs.writeFileSync(path.join(imagesDir, ".gitkeep"), "");

console.log(`✔ Creado content/guias/${category}/${slug}/ (README.md, guide.mdx, data.ts) — borrador.`);
console.log(`✔ Creada public/images/guias/${category}/${slug}/ (vacía: las imágenes son opcionales).`);
console.log(FUNNEL);
console.log("Siguiente paso: rellena data.ts y guide.mdx (referencia: content/guias/marketing/crear-promociones-con-ia/) y ejecuta `npm run guias:validar`.");
console.log('Para publicar: status "published" + publishedAt con la fecha real + sin TODO.');
