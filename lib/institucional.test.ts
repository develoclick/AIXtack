/**
 * Páginas institucionales y estructura del sitio: enlazadas desde el pie, un solo correo, mismo responsable
 * (Nicolas / DeveloClick), rutas del proxy que no chocan con las vigentes y registro de categorías y prompts coherente.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { authors, AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "../content/autores";
import { categorias, categoriasDisponibles, getCategoria } from "../content/categorias";
import { getPrompt, prompts, rutaDePrompt } from "../content/prompts";
import { config as proxyConfig } from "../proxy";
import { footerNav } from "./nav-config";
import { contactEmail, institutionalPages } from "./site";

const raiz = process.cwd();
const leer = (...p: string[]) => fs.readFileSync(path.join(raiz, ...p), "utf8");
const archivos = (dir: string): string[] =>
  fs.readdirSync(path.join(raiz, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? archivos(path.join(dir, e.name)) : /\.(tsx?|md)$/.test(e.name) ? [path.join(dir, e.name)] : []));

test("privacidad, cookies, términos, sobre nosotros y contacto están enlazados desde el pie", () => {
  const enPie = new Set(footerNav.flatMap((g) => g.links.map((l) => l.href)));
  for (const ruta of ["/politica-de-privacidad", "/politica-de-cookies", "/terminos-y-condiciones", "/sobre-nosotros", "/contacto"]) assert.ok(enPie.has(ruta), ruta);
  for (const p of institutionalPages) assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(p.updatedAt), p.path);
});

test("un solo correo en todo el código: contacto@guiapromptsia.com", () => {
  const correos = new Set<string>();
  for (const dir of ["app", "components", "lib", "content"]) {
    for (const f of archivos(dir)) {
      if (f.endsWith(".test.ts") || f.includes("cv-ejemplo")) continue; // el ejemplo ficticio usa correos @example.com
      for (const m of leer(f).match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi) ?? []) if (!/@(correo|example)\.com$/i.test(m)) correos.add(m.toLowerCase()); // sin los correos de ejemplo de los formularios
    }
  }
  assert.deepEqual([...correos], [contactEmail]);
});

test("mismo responsable en todas partes: Nicolas (Person) y DeveloClick (Organization), tomados de content/autores.ts", () => {
  assert.equal(getAuthor(AUTOR_POR_DEFECTO)?.name, "Nicolas");
  assert.equal(getAuthor(EDITORIAL)?.name, "DeveloClick");
  assert.equal(getAuthor(AUTOR_POR_DEFECTO)?.pais, "Perú");
  for (const f of ["app/(site)/sobre-nosotros/page.tsx", "app/(site)/politica-de-privacidad/page.tsx", "app/(site)/terminos-y-condiciones/page.tsx", "app/(site)/contacto/page.tsx", "components/layout/footer.tsx"]) {
    const t = leer(f);
    assert.match(t, /EDITORIAL/, `${f} no usa la constante del responsable`);
    assert.doesNotMatch(t, /\bNino\b/);
  }
});

test("la biografía vive en content/autores.ts y las páginas la leen de ahí (sin TODO ni notas de producción)", () => {
  const nicolas = authors.find((a) => a.id === "nicolas")!;
  assert.match(nicolas.bioCorta ?? "", /^Nicolas — ingeniero de prompts en Perú\./);
  assert.equal(nicolas.bioLarga?.length, 3);
  assert.match(leer("app", "(site)", "sobre-nosotros", "page.tsx"), /autorDatos\.bioLarga\?\.map/);
  for (const f of ["sobre-nosotros", "politica-de-privacidad", "politica-de-cookies", "terminos-y-condiciones", "contacto"]) {
    const t = leer("app", "(site)", f, "page.tsx").replace(/\/\/.*$/gm, "");
    assert.doesNotMatch(t, /\bTODO\b|\[completar\]/, f);
  }
});

test("legal: responsable persona natural en Perú, Ley 29733 y nada de España/UE como ley aplicable", () => {
  const p = (n: string) => leer("app", "(site)", n, "page.tsx").replace(/\s+/g, " ");
  const terminos = p("terminos-y-condiciones");
  const privacidad = p("politica-de-privacidad");
  const cookies = p("politica-de-cookies");
  for (const t of [terminos, privacidad, cookies]) {
    assert.ok(t.includes("persona natural"), "responsable: persona natural");
    assert.ok(t.includes("contactEmail"), "responsable: correo de contacto");
  }
  assert.ok(terminos.includes("leyes de la República del Perú") && terminos.includes("tribunales competentes de la República del Perú"));
  assert.ok(privacidad.includes("Ley N.° 29733"));
  assert.ok(privacidad.includes("Autoridad Nacional de Protección de Datos Personales"));
  assert.ok(privacidad.includes("Google Analytics") && privacidad.includes("solo en este navegador"));
  assert.ok(!/Mi negocio|microempresas/.test(privacidad + terminos + cookies), "sin restos del modelo anterior");
});

test("locale: og:locale es_PE y fechas en es-419", () => {
  assert.match(leer("lib", "seo", "metadata.ts"), /locale: "es_PE"/);
  assert.match(leer("lib", "utils", "format.ts"), /"es-419"/);
});

test("el proxy (410) no captura ninguna ruta vigente del sitio", () => {
  const vigentes = ["/", ...institutionalPages.map((p) => p.path), ...categoriasDisponibles.map((c) => `/${c.slug}`), ...prompts.map(rutaDePrompt)];
  for (const patron of proxyConfig.matcher) {
    const base = patron.replace(/\/:path\*$/, "");
    for (const ruta of vigentes) assert.ok(ruta !== base && !ruta.startsWith(`${base}/`), `${patron} choca con ${ruta}`);
  }
});

test("categorías y prompts: slugs únicos, subcategorías válidas y cada prompt en una categoría disponible", () => {
  assert.equal(new Set(categorias.map((c) => c.slug)).size, categorias.length);
  assert.equal(categorias.length, 8);
  for (const c of categorias) assert.equal(new Set(c.subcategorias.map((s) => s.slug)).size, c.subcategorias.length, c.slug);
  assert.deepEqual(categoriasDisponibles.map((c) => c.slug), ["carrera-y-empleo"]);
  assert.equal(new Set(prompts.map((p) => `${p.categoria}/${p.slug}`)).size, prompts.length);
  for (const p of prompts) {
    const c = getCategoria(p.categoria);
    assert.ok(c?.disponible, p.slug);
    assert.ok(c!.subcategorias.some((s) => s.slug === p.subcategoria), `${p.slug}: subcategoría`);
    assert.ok(p.descripcion.length >= 120 && p.descripcion.length <= 165, `${p.slug}: meta descripción de ${p.descripcion.length} caracteres`);
    assert.equal(getPrompt(p.categoria, p.slug), p);
  }
});
