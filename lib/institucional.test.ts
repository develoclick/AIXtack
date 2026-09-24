/**
 * Páginas institucionales: enlazadas desde el pie, un solo correo, mismo responsable (Nicolas / DeveloClick) y la biografía
 * de Nicolas como único pendiente (en el archivo de datos, nunca visible).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { authors, AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "../content/autores";
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
  for (const dir of ["app", "components", "lib", "content"]) for (const f of archivos(dir)) for (const m of leer(f).match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi) ?? []) correos.add(m.toLowerCase());
  assert.deepEqual([...correos], [contactEmail]);
});

test("mismo responsable en todas partes: Nicolas (Person) y DeveloClick (Organization), tomados de content/autores.ts", () => {
  assert.equal(getAuthor(AUTOR_POR_DEFECTO)?.name, "Nicolas");
  assert.equal(getAuthor(EDITORIAL)?.name, "DeveloClick");
  for (const f of ["app/(site)/sobre-nosotros/page.tsx", "app/(site)/politica-de-privacidad/page.tsx", "app/(site)/terminos-y-condiciones/page.tsx", "app/(site)/contacto/page.tsx", "components/layout/footer.tsx"]) {
    const t = leer(f);
    assert.match(t, /EDITORIAL/, `${f} no usa la constante del responsable`);
    assert.doesNotMatch(t, /\bNino\b/);
  }
});

test("la biografía de Nicolas vive en content/autores.ts (bioCorta, bioLarga de 3 párrafos, país) y las páginas la leen de ahí", () => {
  const nicolas = authors.find((a) => a.id === "nicolas")!;
  assert.match(nicolas.bioCorta ?? "", /^Nicolas — ingeniero de prompts en Perú\./);
  assert.equal(nicolas.bioLarga?.length, 3);
  assert.equal(nicolas.pais, "Perú");
  assert.doesNotMatch(leer("content", "autores.ts"), /TODO/);
  const sobre = leer("app", "(site)", "sobre-nosotros", "page.tsx");
  assert.match(sobre, /autorDatos\.bioLarga\?\.map/);
  assert.match(sobre, /Quién está detrás de/);
  assert.match(sobre, /proyecto de \{editorial\}/);
  assert.doesNotMatch(sobre, /Soy Nicolas|ingeniería de prompts/, "el texto de la biografía no se copia en la página");
  // Ninguna página institucional muestra un TODO ni notas de producción.
  for (const f of ["sobre-nosotros", "politica-de-privacidad", "politica-de-cookies", "terminos-y-condiciones", "contacto", "como-probamos"]) {
    const t = leer("app", "(site)", f, "page.tsx").replace(/\/\/.*$/gm, "");
    assert.doesNotMatch(t, /\bTODO\b|\[completar\]|captura pendiente/, f);
  }
});

test("/como-probamos describe el método real (varias pruebas, comparar, ajustar, mejor versión, captura real, «Qué corregí yo») y solo las etiquetas de imagen que existen", async () => {
  const { ETIQUETAS_IMAGEN } = await import("./herramientas/tipos");
  const t = leer("app", "(site)", "como-probamos", "page.tsx");
  for (const frase of [/Varias pruebas y comparación/, /Ajustes y mejor versión/, /La captura real/, /Qué corregí yo/]) assert.match(t, frase);
  for (const etiqueta of ETIQUETAS_IMAGEN) assert.ok(t.includes(`["${etiqueta}"`), `falta la etiqueta «${etiqueta}»`);
  assert.doesNotMatch(t, /Captura de hoja/, "esa etiqueta no existe (el validador la rechaza)");
});

test("locale: og:locale es_PE y fechas en es-419 (público y autor en Latinoamérica)", () => {
  assert.match(leer("lib", "seo", "metadata.ts"), /locale: "es_PE"/);
  assert.doesNotMatch(leer("lib", "seo", "metadata.ts"), /es_ES/);
  assert.match(leer("lib", "utils", "format.ts"), /"es-419"/);
});

test("responsable legal: Nicolas (persona natural, Perú); DeveloClick es el nombre del proyecto, no una empresa registrada", () => {
  const sobre = leer("app", "(site)", "sobre-nosotros", "page.tsx");
  assert.match(sobre, /responsable editorial y legal del sitio es \{autor\}/);
  assert.match(sobre, /persona natural/);
  assert.match(sobre, /no una empresa registrada/);
  assert.doesNotMatch(sobre, /\{editorial\}, responsable editorial y legal/);
  assert.equal(getAuthor(AUTOR_POR_DEFECTO)?.pais, "Perú");
  assert.match(leer("components", "layout", "footer.tsx"), /un proyecto de/);
  assert.doesNotMatch(leer("components", "layout", "footer.tsx"), /publicado por/);
});

test("legal: responsable Nicolas (persona natural, Perú), ley y jurisdicción de la República del Perú, Ley 29733 en privacidad y nada de España/UE como ley aplicable", () => {
  const p = (n: string) => leer("app", "(site)", n, "page.tsx").replace(/\s+/g, " ");
  const terminos = p("terminos-y-condiciones");
  const privacidad = p("politica-de-privacidad");
  const cookies = p("politica-de-cookies");
  for (const t of [terminos, privacidad, cookies]) {
    assert.ok(t.includes("persona natural"), "responsable: persona natural");
    assert.ok(t.includes("contactEmail"), "responsable: correo de contacto");
    assert.ok(!t.includes("publica {getAuthor(EDITORIAL)"), "DeveloClick ya no es quien publica");
    assert.ok(!/Unión Europea y España|España/.test(t.replace("por ejemplo, los de los usuarios de la Unión Europea", "")), "sin España como ley aplicable");
  }
  assert.ok(terminos.includes("Ley aplicable y jurisdicción") && terminos.includes("leyes de la República del Perú") && terminos.includes("tribunales competentes de la República del Perú"));
  assert.ok(privacidad.includes("Ley N.° 29733"), "privacidad cita la Ley 29733");
  assert.ok(privacidad.includes("Autoridad Nacional de Protección de Datos Personales"));
  assert.ok(privacidad.includes("AdSense") && privacidad.includes("Google Analytics") && privacidad.includes("solo en este navegador"), "se conserva lo de AdSense, Analytics con consentimiento y perfil local");
  assert.ok(cookies.includes("Ley N.° 29733"));
});
