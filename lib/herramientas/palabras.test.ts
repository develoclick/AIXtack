/**
 * Estándar 17 con el recuento EDITORIAL: un borrador fuera de 1.500–2.500 solo recibe aviso; una página publicada fuera de
 * rango recibe un error (que rompe el build). El recuento no incluye formulario, ejemplos del formulario ni prompts.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { listarTodas } from "./registro";
import type { Herramienta } from "./tipos";
import { contarPalabras, textosEditoriales, textosVisibles, validarHerramienta } from "./validar";

const ctx = (h: Herramienta) => ({ existeImagen: () => true, existentes: new Set(["marketing/crear-anuncios-con-ia", "marketing/crear-promociones-con-ia", "marketing/crear-afiches-con-ia", `${h.meta.area}/${h.meta.slug}`]), publicadas: new Set<string>() });
const PATRON = /palabras editoriales/;

async function base() {
  return (await listarTodas()).find((h) => !h.interna && h.meta.slug === "crear-afiches-con-ia")! as Herramienta;
}
const conRelleno = (h: Herramienta, palabras: number): Herramienta => ({ ...h, faq: [...h.faq, { p: "Pregunta de relleno de la prueba", r: Array(palabras).fill("palabra").join(" ") }] });

test("el recuento editorial no incluye formulario, datos del formulario ni prompts", async () => {
  const h = await base();
  const editorial = new Set(textosEditoriales(h));
  for (const c of h.campos) assert.ok(!editorial.has(c.label) || h.meta.titulo === c.label, `la etiqueta «${c.label}» del formulario no debe contarse`);
  for (const m of h.mejoras) assert.ok(!editorial.has(m.prompt), "el prompt de una mejora no debe contarse");
  assert.ok(!editorial.has(h.tarea));
  assert.ok(contarPalabras(textosEditoriales(h)) < contarPalabras(textosVisibles(h)));
});

test("borrador: menos de 1.500 editoriales → solo aviso, sin error", async () => {
  const h = { ...(await base()), publicado: false };
  const flaco = { ...h, faq: h.faq.slice(0, 4), metodoCompleto: null, rubros: h.rubros.slice(0, 3) };
  const r = validarHerramienta(flaco, ctx(flaco));
  assert.ok(r.palabras < 1500, `${r.palabras}`);
  assert.ok(!r.errores.some((e) => PATRON.test(e)));
  assert.ok(r.avisos.some((e) => PATRON.test(e)));
});

test("publicado: fuera de 1.500–2.500 → error (por debajo y por encima); dentro → ni error ni aviso de palabras", async () => {
  const h = { ...(await base()), publicado: true };
  const flaco = { ...h, metodoCompleto: null, faq: h.faq.slice(0, 4), rubros: h.rubros.slice(0, 3) };
  assert.ok(validarHerramienta(flaco, ctx(flaco)).errores.some((e) => PATRON.test(e)), "por debajo de 1.500");
  const enorme = conRelleno(h, 2000);
  assert.ok(validarHerramienta(enorme, ctx(enorme)).errores.some((e) => PATRON.test(e)), "por encima de 2.500");
  const justo = conRelleno({ ...h, metodoCompleto: null }, Math.max(0, 1600 - contarPalabras(textosEditoriales({ ...h, metodoCompleto: null }))));
  const r = validarHerramienta(justo, ctx(justo));
  assert.ok(r.palabras >= 1500 && r.palabras <= 2500, `${r.palabras}`);
  assert.ok(!r.errores.some((e) => PATRON.test(e)) && !r.avisos.some((e) => PATRON.test(e)));
});
