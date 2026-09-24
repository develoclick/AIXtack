/**
 * Bloque 13 y JSON-LD: «Probado por …» solo si existe la prueba (nunca se inventa una fecha) y el Article
 * lleva a Nicolas como autor (Person) y a DeveloClick como publisher (Organization).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FirmaVerificacion } from "../../components/herramientas/firma-verificacion";
import { listarTodas } from "./registro";
import { herramientaArticleJsonLd } from "./seo";

const texto = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function meta() {
  const h = (await listarTodas()).find((x) => !x.interna)!;
  return h;
}

test("sin prueba: solo «Actualizado el …», sin «Probado por»", async () => {
  const h = await meta();
  const html = renderToStaticMarkup(createElement(FirmaVerificacion, { meta: { ...h.meta, probadoEn: null, probadoFecha: null, actualizado: "2026-09-19" } }));
  assert.doesNotMatch(texto(html), /Probado/);
  assert.match(texto(html), /^Actualizado el /);
});

test("con IA pero sin fecha (o al revés) tampoco se afirma la prueba", async () => {
  const h = await meta();
  for (const parcial of [{ probadoEn: "ChatGPT", probadoFecha: null }, { probadoEn: null, probadoFecha: "2026-09-20" }]) {
    const html = renderToStaticMarkup(createElement(FirmaVerificacion, { meta: { ...h.meta, ...parcial } }));
    assert.doesNotMatch(texto(html), /Probado/);
  }
});

test("con prueba real: «Probado por Nicolas en {IA} el {fecha}» más la fecha de actualización", async () => {
  const h = await meta();
  const html = renderToStaticMarkup(createElement(FirmaVerificacion, { meta: { ...h.meta, probadoEn: "ChatGPT", probadoFecha: "2026-09-20", actualizado: "2026-09-21" } }));
  const t = texto(html);
  assert.match(t, /^Probado por Nicolas en ChatGPT el /);
  assert.match(t, /Actualizado el /);
});

test("Article JSON-LD: autor Nicolas (Person) y publisher DeveloClick (Organization)", async () => {
  const h = await meta();
  const ld = herramientaArticleJsonLd(h) as { author: { "@type": string; name: string }; publisher: { "@type": string; name: string } };
  assert.deepEqual(ld.author, { "@type": "Person", name: "Nicolas" });
  assert.equal(ld.publisher["@type"], "Organization");
  assert.equal(ld.publisher.name, "DeveloClick");
});
