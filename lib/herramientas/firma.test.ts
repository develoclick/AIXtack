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
import { getAuthor } from "../../content/autores";
import { siteUrl } from "../site";
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
  assert.match(texto(html), /Actualizado el /);
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
  const ld = herramientaArticleJsonLd(h) as { author: { "@type": string; name: string; description?: string; url?: string }; publisher: { "@type": string; name: string } };
  assert.deepEqual(ld.author, { "@type": "Person", name: "Nicolas", description: getAuthor("nicolas")!.bioCorta, url: `${siteUrl}/sobre-nosotros` });
  assert.equal(ld.publisher["@type"], "Organization");
  assert.equal(ld.publisher.name, "DeveloClick");
});

test("bloque 13: la biografía corta va bajo «Probado por…» (con o sin prueba), con enlace a /sobre-nosotros", async () => {
  const h = await meta();
  const bio = getAuthor("nicolas")!.bioCorta!;
  const con = renderToStaticMarkup(createElement(FirmaVerificacion, { meta: { ...h.meta, probadoEn: "ChatGPT", probadoFecha: "2026-09-20" } }));
  const t = texto(con);
  assert.ok(t.indexOf("Probado por") < t.indexOf(bio) && t.indexOf(bio) < t.indexOf("Actualizado el"), "orden: Probado por → biografía → Actualizado");
  assert.match(con, /href="\/sobre-nosotros"/);
  const sin = texto(renderToStaticMarkup(createElement(FirmaVerificacion, { meta: { ...h.meta, probadoEn: null, probadoFecha: null } })));
  assert.doesNotMatch(sin, /Probado/);
  assert.ok(sin.includes(bio));
});

test("el Person del JSON-LD de Article lleva description y url; el publisher no", async () => {
  const ld = herramientaArticleJsonLd(await meta()) as { publisher: Record<string, unknown> };
  assert.equal(ld.publisher.description, undefined);
});
