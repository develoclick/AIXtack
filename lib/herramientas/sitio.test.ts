/**
 * Pruebas de las páginas del sitio (Fase 4): listados solo con lo publicado en producción, introducciones de
 * área con extensión propia y mensaje de la portada coherente con las herramientas.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { categories } from "../../content/categorias";
import { listarPublicadas, listarTodas, listarVisibles } from "./registro";
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
