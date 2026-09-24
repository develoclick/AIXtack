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

test("la biografía de Nicolas es el único pendiente: vive en el archivo de datos y no se muestra sin texto", () => {
  const nicolas = authors.find((a) => a.id === "nicolas")!;
  assert.equal(nicolas.bio, undefined);
  assert.match(leer("content", "autores.ts"), /TODO.*bio/i);
  assert.match(leer("app", "(site)", "sobre-nosotros", "page.tsx"), /autorDatos\.bio &&/);
  // Ninguna página institucional muestra un TODO ni notas de producción.
  for (const f of ["sobre-nosotros", "politica-de-privacidad", "politica-de-cookies", "terminos-y-condiciones", "contacto", "como-probamos"]) {
    const t = leer("app", "(site)", f, "page.tsx").replace(/\/\/.*$/gm, "");
    assert.doesNotMatch(t, /\bTODO\b|\[completar\]|captura pendiente/, f);
  }
});
