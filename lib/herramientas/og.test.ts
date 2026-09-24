/**
 * og:image: el respaldo general existe (1200×630) y toda página resuelve a un archivo existente; publicado:true exige su
 * propia /img/{area}/{slug}/og.webp; un borrador solo recibe aviso.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { OG_POR_DEFECTO, siteUrl } from "../site";
import { listarTodas } from "./registro";
import { herramientaArticleJsonLd, ogImageUrl } from "./seo";
import type { Herramienta } from "./tipos";
import { validarHerramienta } from "./validar";

const raiz = process.cwd();
const ruta = (url: string) => path.join(raiz, "public", url.replace(siteUrl, ""));

test("el respaldo /og-default.webp existe y mide 1200×630", () => {
  const b = fs.readFileSync(path.join(raiz, "public", OG_POR_DEFECTO));
  assert.equal(b.toString("ascii", 8, 12), "WEBP");
  const tipo = b.toString("ascii", 12, 16);
  const ancho = tipo === "VP8 " ? b.readUInt16LE(26) & 0x3fff : 1 + b.readUIntLE(24, 3);
  const alto = tipo === "VP8 " ? b.readUInt16LE(28) & 0x3fff : 1 + b.readUIntLE(27, 3);
  assert.deepEqual([ancho, alto], [1200, 630]);
});

test("ninguna página apunta a un og:image inexistente (propia o respaldo), también en el JSON-LD", async () => {
  for (const h of (await listarTodas()).filter((x) => !x.interna)) {
    const url = ogImageUrl(h);
    assert.ok(url.startsWith(siteUrl), url);
    assert.ok(fs.existsSync(ruta(url)), `${h.meta.slug}: ${url} no existe`);
    assert.equal((herramientaArticleJsonLd(h) as { image: string }).image, url);
  }
});

test("sin og propia se usa el respaldo; con og propia existente se usa la propia", async () => {
  const h = (await listarTodas()).find((x) => !x.interna)!;
  assert.equal(ogImageUrl({ ...h, meta: { ...h.meta, ogImage: "/img/x/y/no-existe.webp" } }), `${siteUrl}${OG_POR_DEFECTO}`);
  assert.equal(ogImageUrl({ ...h, meta: { ...h.meta, ogImage: undefined } }), `${siteUrl}${OG_POR_DEFECTO}`);
  assert.equal(ogImageUrl({ ...h, meta: { ...h.meta, ogImage: "/logo.png" } }), `${siteUrl}/logo.png`);
});

test("publicado:true exige su propia og.webp (error); en borrador solo aviso", async () => {
  const h = (await listarTodas()).find((x) => x.meta.slug === "crear-anuncios-con-ia")! as Herramienta;
  const propia = `/img/${h.meta.area}/${h.meta.slug}/og.webp`;
  const ctx = (existe: boolean) => ({ existeImagen: (s: string) => (s === propia ? existe : true), existentes: new Set([`${h.meta.area}/${h.meta.slug}`, ...h.relacionadas]), publicadas: new Set<string>(h.relacionadas) });
  const con = (p: Partial<Herramienta>, meta: Partial<Herramienta["meta"]>, existe: boolean) => validarHerramienta({ ...h, ...p, meta: { ...h.meta, ...meta } }, ctx(existe));
  const pub = (meta: Partial<Herramienta["meta"]>, existe: boolean) => con({ publicado: true, capturasPendientes: [] }, meta, existe).errores.filter((e) => /og/.test(e));
  assert.equal(pub({ ogImage: propia }, true).length, 0, "publicada con su og propia existente: sin error");
  assert.ok(pub({ ogImage: undefined }, true).length > 0, "publicada sin og propia: error");
  assert.ok(pub({ ogImage: "/logo.png" }, true).length > 0, "publicada con otra imagen: error");
  assert.ok(pub({ ogImage: propia }, false).length > 0, "publicada con og propia que no existe: error");
  const borrador = con({ publicado: false }, { ogImage: propia }, false);
  assert.ok(!borrador.errores.some((e) => /og/.test(e)) && borrador.avisos.some((e) => /og/.test(e)), "borrador: solo aviso");
});
