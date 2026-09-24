/**
 * Pruebas de contenido: cada página de content/herramientas cumple el esquema y sus calculadoras pasan
 * sus casos; las páginas no publicadas no aparecen en ningún listado; y la publicidad solo existe donde
 * debe (después de los bloques 6 y 10, nunca dentro de la herramienta).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { notaDeProduccion, validarHerramienta } from "./validar";
import { listarPublicadas, listarTodas, publicadasPorArea, relacionadasDe } from "./registro";
import type { Herramienta } from "./tipos";

const raiz = process.cwd();

async function cargarArchivos(): Promise<{ archivo: string; datos: Herramienta }[]> {
  const base = path.join(raiz, "content", "herramientas");
  const salida: { archivo: string; datos: Herramienta }[] = [];
  for (const area of fs.readdirSync(base, { withFileTypes: true })) {
    if (!area.isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(base, area.name))) {
      if (!f.endsWith(".ts") || f.endsWith(".test.ts")) continue;
      const modulo = await import(pathToFileURL(path.join(base, area.name, f)).href);
      salida.push({ archivo: `${area.name}/${f}`, datos: modulo.default });
    }
  }
  return salida;
}

test("cada página cumple el esquema y sus calculadoras pasan todos sus casos", async () => {
  const paginas = await cargarArchivos();
  assert.ok(paginas.length >= 1);
  const existentes = new Set(paginas.map((p) => `${p.datos.meta.area}/${p.datos.meta.slug}`));
  const publicadas = new Set(paginas.filter((p) => p.datos.publicado).map((p) => `${p.datos.meta.area}/${p.datos.meta.slug}`));
  for (const { archivo, datos } of paginas) {
    const r = validarHerramienta(datos, { existeImagen: (s) => fs.existsSync(path.join(raiz, "public", s)), existentes, publicadas });
    assert.deepEqual(r.errores, [], `${archivo}: ${r.errores.join(" | ")}`);
    if (datos.calculadora) assert.ok(datos.calculadora.casosDePrueba.length >= 3, `${archivo}: menos de 3 casos de prueba`);
  }
});

test("una página no publicada nunca aparece en listados, áreas ni relacionadas", async () => {
  const todas = await listarTodas();
  const publicadas = await listarPublicadas();
  assert.ok(publicadas.every((h) => h.publicado && !h.interna));
  for (const h of todas.filter((x) => !x.publicado || x.interna)) {
    assert.equal(publicadas.some((p) => p.meta.slug === h.meta.slug && p.meta.area === h.meta.area), false, `${h.meta.slug} se coló en listarPublicadas()`);
    const enArea = await publicadasPorArea(h.meta.area);
    assert.equal(enArea.some((p) => p.meta.slug === h.meta.slug), false, `${h.meta.slug} se coló en su área`);
  }
  // Una página publicada que apuntara a una no publicada no debe mostrarla como relacionada.
  const borrador = todas.find((h) => !h.publicado);
  if (borrador) {
    const apunta = { ...borrador, relacionadas: [`${borrador.meta.area}/${borrador.meta.slug}`] };
    // En producción sin vista previa, un borrador no enseña otros borradores.
    assert.deepEqual(await relacionadasDe(apunta, true), []);
    // Una página publicada nunca enlaza a un borrador, ni siquiera con la vista previa activa.
    assert.deepEqual(await relacionadasDe({ ...apunta, publicado: true }, false), []);
  }
});

test("las páginas internas de prueba (archivos «_…») no existen en producción", () => {
  const codigo = fs.readFileSync(path.join(raiz, "lib", "herramientas", "registro.ts"), "utf8");
  assert.match(codigo, /esProduccion && hijo\.name\.startsWith\("_"\)/);
});

test("EspacioAnuncio solo se usa en PaginaHerramienta, dos veces, después de los bloques 6 y 10", () => {
  const dir = path.join(raiz, "components", "herramientas");
  const usan = fs.readdirSync(dir).filter((f) => f !== "espacio-anuncio.tsx" && fs.readFileSync(path.join(dir, f), "utf8").includes("<EspacioAnuncio"));
  assert.deepEqual(usan, ["pagina-herramienta.tsx"]);

  const pagina = fs.readFileSync(path.join(dir, "pagina-herramienta.tsx"), "utf8");
  const posiciones = [...pagina.matchAll(/<EspacioAnuncio posicion="([a-z-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(posiciones, ["despues-del-ejemplo", "despues-de-errores"]);
  const iEj = pagina.indexOf('<Bloque id="ejemplo"');
  const iA1 = pagina.indexOf('posicion="despues-del-ejemplo"');
  const iRev = pagina.indexOf('<Bloque id="revision"');
  assert.ok(iEj < iA1 && iA1 < iRev, "el primer espacio va entre el bloque 6 y el 7");
  const iErr = pagina.indexOf('<Bloque id="errores"');
  const iA2 = pagina.indexOf('posicion="despues-de-errores"');
  const iFaq = pagina.indexOf('<Bloque id="faq"');
  assert.ok(iErr < iA2 && iA2 < iFaq, "el segundo espacio va después del bloque 10");
  const iHerr = pagina.indexOf('<Bloque id="herramienta"');
  const iComo = pagina.indexOf('<Bloque id="como-usarlo"');
  assert.ok(!pagina.slice(iHerr, iComo).includes("EspacioAnuncio"), "nunca dentro del bloque de la herramienta");
});

test("no hay código de AdSense en los componentes de herramientas", () => {
  const dir = path.join(raiz, "components", "herramientas");
  for (const f of fs.readdirSync(dir)) {
    assert.doesNotMatch(fs.readFileSync(path.join(dir, f), "utf8"), /adsbygoogle|googlesyndication|pagead/i, f);
  }
});

test("la detección de notas de producción no confunde la palabra «todo» con un TODO", () => {
  assert.equal(notaDeProduccion("Lo escribes todo en una frase y todo lo demás sobra."), false);
  assert.equal(notaDeProduccion("TODO: subir la captura"), true);
  assert.equal(notaDeProduccion("Aquí va la captura pendiente"), true);
  assert.equal(notaDeProduccion("[completar]"), true);
  assert.equal(notaDeProduccion("Puedes reemplazar el color si lo prefieres."), false);
});

test("las 15 páginas tienen 2–3 relacionadas válidas: URLs nuevas que existen, sin repetir y sin apuntarse a sí mismas", async () => {
  const todas = (await listarTodas()).filter((h) => !h.interna);
  assert.equal(todas.length, 15);
  const existentes = new Set(todas.map((h) => `${h.meta.area}/${h.meta.slug}`));
  for (const h of todas) {
    const propia = `${h.meta.area}/${h.meta.slug}`;
    assert.ok(h.relacionadas.length >= 2 && h.relacionadas.length <= 3, `${propia}: ${h.relacionadas.length} relacionadas`);
    assert.equal(new Set(h.relacionadas).size, h.relacionadas.length, `${propia}: relacionadas repetidas`);
    for (const r of h.relacionadas) {
      assert.ok(/^[a-z]+\/[a-z0-9-]+$/.test(r) && !r.includes("guias"), `${propia}: «${r}» no es una URL nueva`);
      assert.ok(existentes.has(r), `${propia}: «${r}» no existe`);
      assert.notEqual(r, propia);
    }
    // Con la vista previa (borradores visibles) el bloque 12 de un BORRADOR sale completo; una publicada solo enseña publicadas.
    const visibles = (await relacionadasDe(h, false)).length;
    if (!h.publicado) assert.equal(visibles, h.relacionadas.length, `${propia}: el bloque «Siguiente paso» no saldría completo`);
    else assert.ok(visibles <= h.relacionadas.length);
  }
});

test("las 15 meta descriptions miden entre 140 y 160 caracteres, también en borrador", async () => {
  for (const h of (await listarTodas()).filter((x) => !x.interna)) {
    const n = h.meta.descripcion.length;
    assert.ok(n >= 140 && n <= 160, `${h.meta.slug}: ${n} caracteres`);
  }
});

test("no hay textos casi idénticos entre páginas (estándar 18)", async () => {
  const { buscarDuplicados } = await import("../../scripts/duplicados");
  const d = await buscarDuplicados(0.4);
  assert.deepEqual(d.map((x) => `${x.a} ↔ ${x.b}: ${x.textoA.slice(0, 60)}`), []);
});

test("EspacioAnuncio: vacío, sin código de AdSense y sin ocupar espacio mientras no haya anuncio (empty:hidden, sin márgenes)", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { EspacioAnuncio } = await import("../../components/herramientas/espacio-anuncio");
  for (const posicion of ["despues-del-ejemplo", "despues-de-errores"] as const) {
    const html = renderToStaticMarkup(createElement(EspacioAnuncio, { posicion }));
    assert.match(html, /^<div [^>]*><\/div>$/, "sin contenido dentro");
    assert.match(html, /empty:hidden/);
    assert.doesNotMatch(html, /\bm[ytblrx]?-\d|adsbygoogle|googlesyndication|pagead|<script|<ins/i, "sin márgenes ni código de anuncios");
  }
});
