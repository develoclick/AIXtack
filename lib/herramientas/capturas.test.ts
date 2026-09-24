/**
 * Capturas: etiquetas válidas, alt obligatorio, tamaños reales, capturas pendientes solo en revisión y la regla de
 * publicación (publicado:true exige ≥1 «Prueba real» y 0 pendientes).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EjemploReal } from "../../components/herramientas/ejemplo-real";
import { listarTodas } from "./registro";
import { ETIQUETAS_IMAGEN, type Herramienta } from "./tipos";
import { pendientesVisibles } from "./vista-previa";
import { validarHerramienta } from "./validar";

const raiz = process.cwd();
const ctx = (h: Herramienta, existentes: string[] = []) => ({
  existeImagen: (s: string) => existentes.includes(s),
  existentes: new Set([`${h.meta.area}/${h.meta.slug}`, ...h.relacionadas]),
  publicadas: new Set<string>(h.relacionadas),
});

function tamanoWebp(archivo: string): { ancho: number; alto: number } {
  const b = fs.readFileSync(archivo);
  assert.equal(b.toString("ascii", 0, 4), "RIFF");
  const tipo = b.toString("ascii", 12, 16);
  if (tipo === "VP8 ") return { ancho: b.readUInt16LE(26) & 0x3fff, alto: b.readUInt16LE(28) & 0x3fff };
  if (tipo === "VP8X") return { ancho: 1 + b.readUIntLE(24, 3), alto: 1 + b.readUIntLE(27, 3) };
  if (tipo === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { ancho: 1 + (bits & 0x3fff), alto: 1 + ((bits >> 14) & 0x3fff) };
  }
  throw new Error(`WebP desconocido: ${archivo}`);
}

test("todas las capturas declaradas: etiqueta válida, alt y leyenda, ruta de su carpeta y tamaño igual al del archivo", async () => {
  for (const h of (await listarTodas()).filter((x) => !x.interna)) {
    for (const c of [...h.ejemplo.capturas, ...(h.metodoCompleto?.capturas ?? [])]) {
      assert.ok((ETIQUETAS_IMAGEN as readonly string[]).includes(c.etiqueta), `${h.meta.slug}: etiqueta ${c.etiqueta}`);
      assert.ok(c.alt.trim().length >= 25 && c.leyenda.trim().length > 0, `${h.meta.slug}: alt/leyenda de ${c.src}`);
      assert.ok(c.src.startsWith(`/img/${h.meta.area}/${h.meta.slug}/`), c.src);
      const archivo = path.join(raiz, "public", c.src);
      assert.ok(fs.existsSync(archivo), `${c.src} no existe`);
      assert.deepEqual(tamanoWebp(archivo), { ancho: c.ancho, alto: c.alto }, `${c.src}: ancho/alto no coinciden con el archivo`);
    }
  }
});

test("las 15 páginas declaran 1–2 capturas pendientes, con nombre .webp, etiqueta válida y descripción; ninguna repetida", async () => {
  const todas = (await listarTodas()).filter((h) => !h.interna);
  assert.equal(todas.length, 15);
  for (const h of todas) {
    assert.ok(h.capturasPendientes.length >= 1 && h.capturasPendientes.length <= 2, `${h.meta.slug}: ${h.capturasPendientes.length} pendientes`);
    assert.equal(new Set(h.capturasPendientes.map((p) => p.archivo)).size, h.capturasPendientes.length);
    for (const p of h.capturasPendientes) {
      assert.match(p.archivo, /^[a-z0-9][a-z0-9-]*\.webp$/);
      assert.ok((ETIQUETAS_IMAGEN as readonly string[]).includes(p.etiqueta));
      assert.ok(p.muestra.length > 40, `${h.meta.slug}/${p.archivo}: describe qué debe mostrar`);
    }
    assert.ok(fs.existsSync(path.join(raiz, "public", "img", h.meta.area, h.meta.slug)), `falta la carpeta public/img/${h.meta.area}/${h.meta.slug}/`);
  }
});

test("afiches: (1) chat N1–N4 «Prueba real» y (2) afiche final «Resultado final diseñado con el texto de la IA»", async () => {
  const h = (await listarTodas()).find((x) => x.meta.slug === "crear-afiches-con-ia")!;
  assert.deepEqual(
    h.capturasPendientes.map((p) => [p.archivo, p.etiqueta]),
    [
      ["prueba-01.webp", "Prueba real"],
      ["prueba-02.webp", "Resultado final diseñado con el texto de la IA"],
    ]
  );
  assert.match(h.capturasPendientes[0].muestra, /N1–N4/);
  assert.match(h.capturasPendientes[1].muestra, /panes/);
});

test("anuncios y promociones conservan las capturas del método anterior y añaden la pendiente de la prueba nueva", async () => {
  for (const slug of ["crear-anuncios-con-ia", "crear-promociones-con-ia"]) {
    const h = (await listarTodas()).find((x) => x.meta.slug === slug)!;
    assert.ok(h.ejemplo.capturas.length >= 2, `${slug}: se mantienen sus capturas`);
    assert.equal(h.capturasPendientes.length, 1);
  }
});

test("las capturas pendientes se dibujan solo en revisión: con la vista previa apagada (producción) no sale nada", async () => {
  const h = (await listarTodas()).find((x) => x.meta.slug === "crear-afiches-con-ia")!;
  assert.deepEqual(pendientesVisibles(h.capturasPendientes, false), []);
  assert.equal(pendientesVisibles(h.capturasPendientes, true).length, 2);
  const html = (mostrar: boolean) => renderToStaticMarkup(createElement(EjemploReal, { ejemplo: h.ejemplo, datos: [], pendientes: pendientesVisibles(h.capturasPendientes, mostrar) }));
  assert.match(html(true), /prueba-01\.webp/);
  assert.match(html(true), /border-dashed/);
  assert.doesNotMatch(html(false), /prueba-01\.webp|border-dashed|pendiente/);
});

test("regla de publicación: publicado:true exige ≥1 «Prueba real» y 0 pendientes; el borrador no", async () => {
  const h = (await listarTodas()).find((x) => x.meta.slug === "crear-anuncios-con-ia")!;
  const archivos = [...h.ejemplo.capturas, ...(h.metodoCompleto?.capturas ?? [])].map((c) => c.src);
  const pub = (extra: Partial<Herramienta>) => validarHerramienta({ ...h, publicado: true, ...extra }, ctx(h, archivos)).errores;
  assert.ok(pub({}).some((e) => /no puede tener capturas pendientes/.test(e)), "publicada con pendientes");
  assert.ok(!pub({ capturasPendientes: [] }).some((e) => /pendientes|Prueba real/.test(e)), "publicada, sin pendientes y con Prueba real: pasa");
  const sinReal = { ...h.ejemplo, capturas: h.ejemplo.capturas.map((c) => ({ ...c, etiqueta: "Ilustración" as const })) };
  assert.ok(pub({ capturasPendientes: [], ejemplo: sinReal, metodoCompleto: null }).some((e) => /Prueba real/.test(e)), "publicada sin Prueba real");
  const borrador = validarHerramienta({ ...h, publicado: false }, ctx(h, archivos));
  assert.ok(!borrador.errores.some((e) => /pendientes|Prueba real/.test(e)), "el borrador con pendientes es válido");
});

test("etiqueta inválida, alt vacío o tamaño ausente son errores incluso en un borrador", async () => {
  const h = (await listarTodas()).find((x) => x.meta.slug === "crear-anuncios-con-ia")!;
  const c0 = h.ejemplo.capturas[0];
  const errores = (c: object) => validarHerramienta({ ...h, publicado: false, ejemplo: { ...h.ejemplo, capturas: [{ ...c0, ...c } as typeof c0] } }, ctx(h)).errores;
  assert.ok(errores({ etiqueta: "Captura de hoja" }).some((e) => /etiqueta/.test(e)));
  assert.ok(errores({ alt: "" }).some((e) => /alt es obligatorio/.test(e)));
  assert.ok(errores({ ancho: 0 }).some((e) => /ancho y alto/.test(e)));
  assert.ok(errores({ leyenda: "" }).some((e) => /leyenda/.test(e)));
});

test("los recuadros de capturas pendientes solo existen con NODE_ENV=development (producción, nunca, ni con MOSTRAR_BORRADORES=true)", async () => {
  const { execFileSync } = await import("node:child_process");
  const medir = (nodeEnv: string, mostrar: string) =>
    execFileSync(process.execPath, ["--import", "tsx", "-e", 'import("./lib/herramientas/vista-previa.ts").then((m)=>console.log(String(m.mostrarCapturasPendientes)))'], {
      env: { ...process.env, NODE_ENV: nodeEnv, MOSTRAR_BORRADORES: mostrar } as NodeJS.ProcessEnv,
      cwd: raiz,
    })
      .toString()
      .trim();
  assert.equal(medir("production", "true"), "false", "producción con MOSTRAR_BORRADORES=true");
  assert.equal(medir("production", ""), "false");
  assert.equal(medir("development", ""), "true", "next dev");
});
