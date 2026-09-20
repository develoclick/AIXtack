#!/usr/bin/env node
/**
 * Validador de guías (v1): comprobaciones MECÁNICAS sobre data.ts y guide.mdx.
 * No sustituye la revisión editorial: solo atrapa los fallos que se pueden medir.
 *
 * Uso:   node scripts/validate-guides.mjs [ruta-o-slug] [--strict]
 * Ej.:   node scripts/validate-guides.mjs analisis/analizar-ventas-con-ia
 * Salida: código 1 si hay ERRORES (o avisos, con --strict).
 * Busca automáticamente cualquier carpeta que contenga un guide.mdx.
 */
import fs from "node:fs";
import path from "node:path";

/* ─── Configuración: ajústala una sola vez ─────────────────────────── */
const CFG = {
  authorAlias: "DeveloClick",
  promptRange: [3, 6], // nº de prompts por guía
  maxWords: 5000, // margen sobre el tope de ~4.500 palabras de texto explicativo
  maxSectionsUngrouped: 12, // más secciones que esto exigen agrupar el índice en partes
  stepSimilarity: 0.3, // similitud mínima para considerar que dos pasos son "el mismo"
  stepOverlapRatio: 0.4, // proporción de pasos repetidos que dispara el error
  sentenceSimilarity: 0.6, // similitud para frases casi idénticas
  showComponents: ["PromptBlock", "PromptBuilder", "PromptCard"], // componentes que MUESTRAN un prompt
  errorPhrases: [/adsense/i],
  warnPhrases: [/garantiz/i, /sin riesgo/i, /100\s?% (seguro|efectivo)/i],
  ignoreDirs: new Set(["node_modules", ".next", ".git", "dist", "out", "public"]),
};

/* ─── Utilidades ───────────────────────────────────────────────────── */
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const STOP = new Set(
  "de la el los las un una unos unas y o en a al del con sin por para que se es son mi tu tus mis su sus lo le les me te ha he tengo tiene esta este estos estas como mas pero si no ya hay cada".split(" ")
);
const toks = (s) =>
  norm(s).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.slice(0, 5));
const jac = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let i = 0;
  for (const x of A) if (B.has(x)) i++;
  return i / (A.size + B.size - i);
};
const wordCount = (s) => (s.match(/[\p{L}\p{N}]+/gu) || []).length;
const ctx = (text, re) => {
  const m = re.exec(text);
  if (!m) return "";
  const a = Math.max(0, m.index - 45), b = Math.min(text.length, m.index + m[0].length + 45);
  return text.slice(a, b).replace(/\s+/g, " ").trim();
};
const short = (s, n = 70) => (s.length > n ? s.slice(0, n).trim() + "…" : s);

const stripComments = (c) => c.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const STR = /`((?:[^`\\]|\\.)*)`|"((?:[^"\\]|\\.)*)"/g;
const strings = (code) => [...code.matchAll(STR)].map((m) => (m[1] ?? m[2]).replace(/\\n/g, " ").replace(/\\"/g, '"'));

/** Contenido de una clave de primer nivel (2 espacios de sangría) dentro de defineGuide({ ... }). */
function region(text, key) {
  const m = new RegExp(`^  ${key}:\\s`, "m").exec(text);
  if (!m) return null;
  const rest = text.slice(m.index + m[0].length);
  const n = /^  [A-Za-z_]\w*:\s/m.exec(rest);
  return n ? rest.slice(0, n.index) : rest;
}
const arrayOf = (reg, key) => {
  const m = new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`).exec(reg || "");
  return m ? strings(m[1]) : [];
};

function parsePrompts(code) {
  const reg = region(code, "prompts");
  if (!reg) return [];
  const starts = [...reg.matchAll(/^    (\w+):\s*\{\s*\n\s+title:/gm)];
  return starts.map((m, i) => {
    const body = reg.slice(m.index, i + 1 < starts.length ? starts[i + 1].index : undefined);
    const tpl = /prompt:\s*`([\s\S]*?)`/.exec(body)?.[1] ?? "";
    return {
      key: m[1],
      tpl,
      declared: [...body.matchAll(/name:\s*"([A-Z0-9_]+)"/g)].map((x) => x[1]),
      used: [...new Set([...tpl.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((x) => x[1]))],
    };
  });
}

function findGuides(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!CFG.ignoreDirs.has(e.name)) findGuides(path.join(dir, e.name), out);
    } else if (e.name === "guide.mdx") out.push(dir);
  }
  return out;
}

/** Fracción de elementos de `a` que se parecen a algún elemento de `b`. */
const overlap = (a, b) => {
  if (!a.length || !b.length) return 0;
  const tb = b.map(toks);
  const hits = a.filter((x) => tb.some((t) => jac(toks(x), t) >= CFG.stepSimilarity)).length;
  return hits / a.length;
};

/* ─── Validación de una guía ───────────────────────────────────────── */
function validate(dir, allSlugs) {
  const F = []; // hallazgos
  const add = (level, msg) => F.push({ level, msg });
  const raw = read(path.join(dir, "data.ts"));
  const mdx = read(path.join(dir, "guide.mdx"));
  if (!raw) return [{ level: "ERROR", msg: "No existe data.ts junto a guide.mdx (ajusta el validador si tu convención es distinta)." }];
  const data = stripComments(raw);
  const prompts = parsePrompts(data);

  // 1. Datos referenciados en el MDX pero no definidos (p. ej. data.evidence)
  const refs = new Set([...mdx.matchAll(/\bdata\.([A-Za-z_]\w*)/g)].map((m) => m[1]));
  for (const r of refs) if (!region(data, r)) add("ERROR", `guide.mdx usa data.${r}, pero data.ts no lo define.`);
  const pKeys = new Set(prompts.map((p) => p.key));
  for (const m of mdx.matchAll(/data\.prompts\.(\w+)/g)) if (!pKeys.has(m[1])) add("ERROR", `guide.mdx usa data.prompts.${m[1]}, que no existe.`);
  const imgReg = region(data, "images") || "";
  for (const m of mdx.matchAll(/data\.images\.(\w+)/g)) if (!new RegExp(`^    ${m[1]}:`, "m").test(imgReg)) add("ERROR", `guide.mdx usa data.images.${m[1]}, que no está en el manifiesto.`);

  // 2. Prompts: cantidad, variables, estándar, presentación única
  const [minP, maxP] = CFG.promptRange;
  if (prompts.length < minP || prompts.length > maxP) add("AVISO", `Hay ${prompts.length} prompts; lo esperado es entre ${minP} y ${maxP}.`);
  for (const p of prompts) {
    const undocumented = p.used.filter((v) => !p.declared.includes(v));
    const unused = p.declared.filter((v) => !p.used.includes(v));
    if (undocumented.length) add("ERROR", `Prompt «${p.key}»: variables usadas sin documentar: ${undocumented.join(", ")}.`);
    if (unused.length) add("AVISO", `Prompt «${p.key}»: variables documentadas que no se usan: ${unused.join(", ")}.`);
    if (!/antes de (responder|entregar|devolver|resumir)|verifica que|comprueba que|revisa que/i.test(p.tpl)) add("AVISO", `Prompt «${p.key}»: no veo una autoverificación (p. ej. «antes de responder, verifica que…»).`);
    if (!/tabla|columnas|formato de salida|en este orden|estructura/i.test(p.tpl)) add("AVISO", `Prompt «${p.key}»: no veo un formato de salida definido.`);
    if (!/falta|no inventes|nunca (inventes|afirmes)|no agregues|no a[ñn]adas|no afirmes|no des por|no hagas c[aá]lculos|usa solo|dime si|pregunta/i.test(p.tpl)) add("AVISO", `Prompt «${p.key}»: no dice qué hacer si faltan datos ni prohíbe inventarlos.`);
    if (!new RegExp(`data\\.prompts\\.${p.key}\\b`).test(mdx)) add("ERROR", `Prompt «${p.key}» está definido pero no se usa en guide.mdx.`);
  }
  const shown = {};
  for (const m of mdx.matchAll(new RegExp(`<(${CFG.showComponents.join("|")})\\b[^>]*?data\\.prompts\\.(\\w+)`, "g"))) shown[m[2]] = (shown[m[2]] || 0) + 1;
  for (const [k, n] of Object.entries(shown)) if (n > 1) add("ERROR", `El prompt «${k}» se muestra ${n} veces (debe mostrarse una sola vez, con constructor).`);

  // 3. Manifiesto de imágenes: hero, campos y pruebas de prompts
  const slotFiles = [...imgReg.matchAll(/slot\(\s*"([^"]+)"/g)].map((m) => m[1]);
  if (!slotFiles.includes("hero.webp")) add("ERROR", "El manifiesto no declara hero.webp.");
  for (const f of ["description", "alt", "ratio"]) {
    const n = [...imgReg.matchAll(new RegExp(`\\b${f}:`, "g"))].length;
    if (n < slotFiles.length) add("ERROR", `Hay ${slotFiles.length} imágenes pero solo ${n} con «${f}».`);
  }
  const testSlots = slotFiles.filter((f) => /^prueba-prompt-\d+\.webp$/.test(f));
  if (testSlots.length < prompts.length) add("ERROR", `Faltan espacios prueba-prompt-0N.webp: hay ${testSlots.length} para ${prompts.length} prompts.`);
  for (const p of prompts) if (!new RegExp(`promptId:\\s*"${p.key}"`).test(imgReg)) add("ERROR", `Ningún espacio de prueba declara promptId: "${p.key}".`);

  // 4. Duplicación estructural
  const method = [...(region(data, "method") || "").matchAll(/title:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  const app = [...(region(data, "application") || "").matchAll(/title:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  const check = [...(region(data, "checklist") || "").matchAll(/label:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  if (app.length >= 3 && overlap(app, method) >= CFG.stepOverlapRatio) add("ERROR", `«Aplicación» repite los pasos del método (${Math.round(overlap(app, method) * 100)} % de coincidencia). Debe explicar qué hacer DESPUÉS.`);
  if (check.length >= 3 && overlap(check, method) >= CFG.stepOverlapRatio) add("ERROR", `La checklist repite los pasos del método (${Math.round(overlap(check, method) * 100)} % de coincidencia). Los pasos del método ya son la checklist de proceso.`);
  else if (check.length && method.length) add("AVISO", "Existe una checklist además del método: confirma que no repite ningún paso.");
  const tools = arrayOf(region(data, "hero"), "tools");
  const needs = arrayOf(region(data, "quickFacts"), "needs");
  if (tools.length && needs.length) {
    const nt = needs.map(toks);
    const hits = tools.filter((t) => nt.some((x) => jac(toks(t), x) >= 0.5)).length;
    if (hits >= 2) add("ERROR", "«Necesitas» está duplicado: hero.tools y quickFacts.needs listan lo mismo.");
  }
  const titles = [...mdx.matchAll(/<GuideSection[^>]*\btitle="([^"]+)"/g)].map((m) => m[1]);
  const ids = [...mdx.matchAll(/<GuideSection[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
  for (const [label, list] of [["título", titles], ["id", ids]]) {
    const d = list.filter((x, i) => list.indexOf(x) !== i);
    if (d.length) add("ERROR", `GuideSection con ${label} repetido: ${[...new Set(d)].join(" | ")}.`);
  }
  const nSections = titles.length || (mdx.match(/<GuideSection\b/g) || []).length;
  if (nSections > CFG.maxSectionsUngrouped && !/\b(part|group)="/.test(mdx)) add("AVISO", `${nSections} secciones sin agrupar en partes: el índice debe tener 6–8 partes.`);

  // 5. Frases casi idénticas (repetición de contenido)
  const noTpl = data.replace(/prompt:\s*`[\s\S]*?`,?/g, "");
  const visible = imgReg ? noTpl.replace(imgReg, "") : noTpl; // sin el manifiesto de imágenes
  const dataStrs = strings(visible).filter((s) => wordCount(s) >= 3);
  const prose = mdx.replace(/^import .*$/gm, "").replace(/<[^>]*>/g, " ").replace(/\{[^}]*\}/g, " ");
  const units = [];
  for (const s of [...dataStrs, prose])
    for (const t of s.split(/(?<=[.!?…])\s+/)) if (wordCount(t) >= 10) {
      const w = norm(t).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
      const sh = new Set();
      for (let i = 0; i + 2 < w.length; i++) sh.add(w.slice(i, i + 3).join(" "));
      units.push({ t, sh });
    }
  let dup = 0;
  for (let i = 0; i < units.length && dup < 8; i++)
    for (let j = i + 1; j < units.length && dup < 8; j++) {
      let inter = 0;
      for (const x of units[i].sh) if (units[j].sh.has(x)) inter++;
      const sim = inter / (units[i].sh.size + units[j].sh.size - inter || 1);
      if (sim >= CFG.sentenceSimilarity) { add("AVISO", `Frases casi idénticas: «${short(units[i].t)}» ≈ «${short(units[j].t)}»`); dup++; }
    }

  // 6. Enlaces y guías relacionadas
  for (const s of arrayOf(region(data, "metadata"), "relatedGuides")) if (!allSlugs.has(s)) add("ERROR", `relatedGuides: no existe la guía «${s}».`);
  for (const m of mdx.matchAll(/\]\(\/([a-z0-9-]+)\/guias\/([a-z0-9-]+)\)/g)) if (!allSlugs.has(m[2])) add("ERROR", `Enlace interno roto en guide.mdx: /${m[1]}/guias/${m[2]}.`);

  // 7. Autoría, números y etiquetado
  const author = /author:\s*"([^"]+)"/.exec(region(data, "metadata") || "")?.[1];
  if (!author) add("ERROR", "metadata.author no está definido.");
  else if (norm(author) !== norm(CFG.authorAlias)) add("ERROR", `Autor «${author}»; debe ser «${CFG.authorAlias}».`);
  else if (author !== CFG.authorAlias) add("AVISO", `El autor está escrito «${author}»; usa «${CFG.authorAlias}» para ser consistente en todo el sitio.`);
  if (/handlesNumbers:\s*true/.test(data) && !/verific/i.test(read(path.join(dir, "README.md")))) add("ERROR", "handlesNumbers: true, pero falta README.md con el registro de verificación de cifras.");
  if (region(data, "caseStudy") && !/fictional:\s*true/.test(region(data, "caseStudy"))) add("AVISO", "caseStudy sin fictional: true: confirma que está etiquetado como real o ficticio.");
  const everything = strings(noTpl).join("\n") + "\n" + prose;
  for (const re of CFG.errorPhrases) if (re.test(everything)) add("ERROR", `Aparece ${re}: «…${ctx(everything, re)}…». No se debe hablar de AdSense en las guías.`);
  for (const re of CFG.warnPhrases) if (re.test(everything)) add("AVISO", `Revisa ${re}: «…${ctx(everything, re)}…» (¿suena a promesa?).`);

  // 8. Extensión (aproximada)
  const total = dataStrs.reduce((n, s) => n + wordCount(s), 0) + wordCount(prose);
  if (total > CFG.maxWords) add("AVISO", `≈${total} palabras (≈${Math.round(total / 200)} min): supera el tope; recorta repeticiones.`);
  add("INFO", `≈${total} palabras de lectura, incluye tablas y explicaciones de prompts (≈${Math.round(total / 200)} min) · ${prompts.length} prompts · ${nSections} secciones · ${slotFiles.length} espacios de imagen`);
  return F;
}

/* ─── Ejecución ────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const filter = args.find((a) => !a.startsWith("--"));
const dirs = findGuides(process.cwd());
if (!dirs.length) { console.error("No encontré ninguna carpeta con guide.mdx."); process.exit(1); }
const slugs = new Set(dirs.map((d) => path.basename(d)));
const targets = filter ? dirs.filter((d) => d.split(path.sep).join("/").includes(filter.replace(/^\/|\/$/g, "").replace(/\/guias\//, "/"))) : dirs;
if (!targets.length) { console.error(`Ninguna guía coincide con «${filter}».`); process.exit(1); }

let errors = 0, warns = 0;
for (const d of targets) {
  const F = validate(d, slugs);
  console.log(`\n▶ ${path.relative(process.cwd(), d)}`);
  for (const f of F) {
    console.log(`  ${f.level.padEnd(6)} ${f.msg}`);
    if (f.level === "ERROR") errors++;
    if (f.level === "AVISO") warns++;
  }
  if (!F.some((f) => f.level !== "INFO")) console.log("  ✓ Sin hallazgos.");
}
console.log(`\nResultado: ${errors} errores, ${warns} avisos.`);
process.exit(errors > 0 || (strict && warns > 0) ? 1 : 0);
