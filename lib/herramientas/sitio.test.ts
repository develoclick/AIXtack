/**
 * Pruebas de las páginas del sitio (Fase 4): listados solo con lo publicado en producción, introducciones de
 * área con extensión propia y mensaje de la portada coherente con las herramientas.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { categories } from "../../content/categorias";
import { entradasDelSitemap } from "./mapa-sitio";
import { areaEsIndexable, bibliotecaEsIndexable, listarPublicadas, listarTodas, listarVisibles } from "./registro";
import { contarPalabras } from "./validar";

test("listarVisibles: en producción solo aparecen las publicadas y nunca las internas", async () => {
  const produccion = await listarVisibles(true);
  assert.ok(produccion.every((h) => h.publicado && !h.interna));
  assert.deepEqual(
    produccion.map((h) => h.meta.slug),
    (await listarPublicadas()).map((h) => h.meta.slug)
  );
});

test("listarVisibles: en desarrollo añade los borradores, pero no las internas", async () => {
  const todas = await listarTodas();
  const desarrollo = await listarVisibles(false);
  assert.equal(desarrollo.length, todas.filter((h) => !h.interna).length);
  assert.ok(desarrollo.every((h) => !h.interna));
});

test("cada área tiene una introducción propia de 150 a 300 palabras", () => {
  for (const c of categories) {
    const palabras = contarPalabras([...c.intro]);
    assert.ok(palabras >= 150 && palabras <= 300, `${c.slug}: ${palabras} palabras`);
  }
});

test("las cinco áreas del plan existen y ninguna herramienta apunta a un área inexistente", async () => {
  assert.deepEqual(categories.map((c) => c.slug).sort(), ["analisis", "clientes", "marketing", "negocio", "ventas"]);
  const slugs = new Set(categories.map((c) => c.slug));
  for (const h of await listarTodas()) assert.ok(slugs.has(h.meta.area), h.meta.slug);
});

test("regla de indexación: un área o /herramientas solo son indexables con al menos 1 herramienta publicada", async () => {
  const [una] = (await listarTodas()).filter((h) => !h.interna);
  const publicada = { ...una, publicado: true };
  assert.equal(areaEsIndexable([], una.meta.area), false);
  assert.equal(bibliotecaEsIndexable([]), false);
  assert.equal(areaEsIndexable([publicada], una.meta.area), true);
  assert.equal(bibliotecaEsIndexable([publicada]), true);
  for (const c of categories.filter((x) => x.slug !== una.meta.area)) assert.equal(areaEsIndexable([publicada], c.slug), false, c.slug);
});

test("sitemap: sin publicadas solo portada e institucionales; con una suma su área, la biblioteca y la herramienta; nunca /mi-negocio", async () => {
  const [una] = (await listarTodas()).filter((h) => !h.interna);
  const rutas = (l: Parameters<typeof entradasDelSitemap>[0]) => entradasDelSitemap(l).map((e) => e.url.replace("https://www.guiapromptsia.com", "") || "/");
  const ninguna = rutas([]);
  assert.ok(ninguna.includes("/") && ninguna.includes("/como-probamos"));
  assert.ok(!ninguna.includes("/herramientas"));
  for (const c of categories) assert.ok(!ninguna.includes(`/${c.slug}`), c.slug);
  const con = rutas([{ ...una, publicado: true }]);
  assert.ok(con.includes("/herramientas") && con.includes(`/${una.meta.area}`) && con.includes(`/${una.meta.area}/${una.meta.slug}`));
  assert.equal(con.filter((r) => categories.some((c) => r === `/${c.slug}`)).length, 1);
  assert.ok(!ninguna.includes("/mi-negocio") && !con.includes("/mi-negocio"));
  // Estado real: el sitemap sale de las publicadas de verdad (hoy, ninguna).
  const reales = await listarPublicadas();
  assert.equal(rutas(reales).includes("/herramientas"), reales.length > 0);
});

test("todas las URLs del sitemap usan el dominio con www", () => {
  for (const e of entradasDelSitemap([])) assert.ok(e.url.startsWith("https://www.guiapromptsia.com"), e.url);
});
