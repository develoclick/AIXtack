/**
 * npm run publicar: lectura de argumentos, tamaño real de las capturas y edición del archivo de datos (capturas → capturas,
 * probadoEn/Fecha, «Qué corregí yo», publicado). El resultado debe ser un archivo válido que pasa el validador como publicado.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { aplicarCambios, capturaDesdePendiente, encontrarCierre, leerArgumentos, objetosDeArray, tamanoWebp } from "../scripts/publicar";
import { validarHerramienta } from "./herramientas/validar";
import type { Herramienta } from "./herramientas/tipos";

const raiz = process.cwd();
// Copias fijas de dos páginas en borrador (una sin capturas y otra con capturas del método anterior): así las pruebas no dependen de qué páginas estén publicadas.
const FIXTURES: Record<string, string> = { "marketing/crear-afiches-con-ia": "pagina-sin-capturas", "marketing/crear-anuncios-con-ia": "pagina-con-capturas-anteriores" };
const fuente = (ruta: string) => fs.readFileSync(path.join(raiz, "lib", "herramientas", "fixtures", `${FIXTURES[ruta]}.ts.txt`), "utf8");
const CORREGI = ["La IA inventó una cifra que no dije y la quité yo.", "Cambié el tono de la primera opción, que era muy formal.", "Añadí el dato del horario que faltaba en el texto."];

async function cargar(fuenteTs: string): Promise<Herramienta> {
  const dir = path.join(raiz, "scripts", ".tmp-publicar");
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, `pagina-${Math.random().toString(36).slice(2)}.ts`);
  fs.writeFileSync(f, fuenteTs);
  try {
    return (await import(pathToFileURL(f).href)).default as Herramienta;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function aplicar(ruta: string, ancho = 1300, alto = 900) {
  const datos = fuente(ruta);
  const pendientes = [...datos.matchAll(/archivo: "([^"]+)",\s*etiqueta: "([^"]+)",\s*muestra: "([^"]+)"/g)].map((m) => ({ archivo: m[1], etiqueta: m[2], muestra: m[3] }));
  const capturas = pendientes.map((p) => capturaDesdePendiente(p, ruta, "ChatGPT", "2026-09-20", { ancho, alto }));
  return { pendientes, texto: aplicarCambios({ fuente: datos, ia: "ChatGPT", fecha: "2026-09-20", hoy: "2026-09-25", corregi: CORREGI, capturas }) };
}

test("argumentos: ruta, --ia, --fecha y tres líneas de --corregi; errores claros si falta algo", () => {
  const ok = leerArgumentos(["marketing/crear-afiches-con-ia", "--ia", "ChatGPT", "--fecha", "2026-09-20", "--corregi", "línea uno larga", "línea dos larga", "línea tres larga"]);
  assert.deepEqual(ok.errores, []);
  assert.equal(ok.args?.ia, "ChatGPT");
  assert.equal(ok.args?.corregi.length, 3);
  assert.equal(ok.args?.comprobar, false);
  assert.equal(leerArgumentos(["marketing/x", "--ia", "Claude", "--fecha", "2026-09-20", "--corregi", "a", "b", "c", "--comprobar"]).args, undefined);
  const mal = leerArgumentos(["afiches", "--fecha", "2999-01-01", "--corregi", "solo una línea de prueba"]);
  assert.equal(mal.args, undefined);
  assert.ok(mal.errores.length >= 4, mal.errores.join(" | "));
});

test("tamaño real de un .webp", () => {
  assert.deepEqual(tamanoWebp(fs.readFileSync(path.join(raiz, "public", "og-default.webp"))), { ancho: 1200, alto: 630 });
  assert.throws(() => tamanoWebp(Buffer.from("no es una imagen")));
});

test("bloques: el cierre de corchetes salta cadenas y comentarios, y se separan los objetos de un array", () => {
  const t = 'x: [ { a: "]}", b: 1 }, // } ]\n { c: `}` } ], y: 2';
  const fin = encontrarCierre(t, t.indexOf("["));
  assert.equal(t.slice(fin), "], y: 2");
  assert.equal(objetosDeArray(t.slice(t.indexOf("["), fin + 1)).length, 2);
});

test("afiches (sin capturas, 2 pendientes): pasan a capturas, sin pendientes, con prueba, «Qué corregí yo» y publicado:true", async () => {
  const { texto, pendientes } = aplicar("marketing/crear-afiches-con-ia");
  assert.equal(pendientes.length, 2);
  const h = await cargar(texto);
  assert.equal(h.publicado, true);
  assert.equal(h.meta.probadoEn, "ChatGPT");
  assert.equal(h.meta.probadoFecha, "2026-09-20");
  assert.equal(h.meta.actualizado, "2026-09-25");
  assert.deepEqual(h.capturasPendientes, []);
  assert.deepEqual(h.ejemplo.queCorregi, CORREGI);
  assert.deepEqual(h.ejemplo.capturas.map((c) => [c.src, c.etiqueta, c.ancho, c.alto]), [
    ["/img/marketing/crear-afiches-con-ia/prueba-01.webp", "Prueba real", 1300, 900],
    ["/img/marketing/crear-afiches-con-ia/prueba-02.webp", "Resultado final diseñado con el texto de la IA", 1300, 900],
  ]);
  const existen = new Set(h.ejemplo.capturas.map((c) => c.src));
  const r = validarHerramienta(h, { existeImagen: (s) => existen.has(s) || s.endsWith("og.webp"), existentes: new Set([...h.relacionadas, "marketing/crear-afiches-con-ia"]), publicadas: new Set(h.relacionadas) });
  assert.deepEqual(r.errores.filter((e) => !/relacionada/i.test(e)), []);
});

test("anuncios (2 capturas del método anterior + 1 nueva): la nueva va primero y las anteriores que no caben pasan al método completo", async () => {
  const antes = await cargar(fuente("marketing/crear-anuncios-con-ia"));
  const { texto } = aplicar("marketing/crear-anuncios-con-ia");
  const h = await cargar(texto);
  assert.equal(h.ejemplo.capturas.length, 2, "el ejemplo admite 2");
  assert.equal(h.ejemplo.capturas[0].src, "/img/marketing/crear-anuncios-con-ia/prueba-01.webp");
  assert.equal(h.ejemplo.capturas[1].src, antes.ejemplo.capturas[0].src);
  assert.equal(h.metodoCompleto!.capturas!.length, antes.metodoCompleto!.capturas!.length + 1);
  assert.ok(h.metodoCompleto!.capturas!.some((c) => c.src === antes.ejemplo.capturas[1].src), "la segunda captura anterior pasó al método completo");
  assert.equal(h.publicado, true);
  assert.deepEqual(h.capturasPendientes, []);
});

test("una página ya publicada no se vuelve a publicar", () => {
  const publicada = fuente("marketing/crear-afiches-con-ia").replace(/^  publicado: false,/m, "  publicado: true,");
  assert.throws(() => aplicarCambios({ fuente: publicada, ia: "x", fecha: "2026-09-20", hoy: "2026-09-25", corregi: CORREGI, capturas: [] }), /ya está publicada/);
});
