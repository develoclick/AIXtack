/**
 * npm run publicar: lectura de argumentos, tamaño real de las imágenes, edición del archivo de datos (probadoEn/Fecha, «Qué corregí yo»,
 * publicado) y lo que falta para publicar (imágenes obligatorias y, en un proceso, el registro de la prueba real). Las imágenes ya no
 * se registran: aparecen solas al guardar el archivo con su nombre. El resultado debe pasar el validador como página publicada.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { aplicarCambios, encontrarCierre, faltaParaPublicar, leerArgumentos, objetosDeArray, tamanoWebp } from "../scripts/publicar";
import type { ArchivoDeImagen, ImagenResuelta } from "./herramientas/imagenes";
import { validarHerramienta, type ArchivoBuscado } from "./herramientas/validar";
import type { Herramienta } from "./herramientas/tipos";

const raiz = process.cwd();
// Copias fijas de dos páginas en borrador (una de proceso y otra simple): así las pruebas no dependen de qué páginas estén publicadas.
const fixture = (nombre: string) => fs.readFileSync(path.join(raiz, "lib", "herramientas", "fixtures", `${nombre}.ts.txt`), "utf8");
const CORREGI = ["La IA inventó una cifra que no dije y la quité yo.", "Cambié el tono de la primera opción, que era muy formal.", "Añadí el dato del horario que faltaba en el texto."];
const PASOS_DE_LA_PRUEBA = [1, 2, 3, 4, 5].map((paso) => ({ paso, hizoLaIA: "Escribió el texto de prueba.", hiceYo: "Lo revisé y cambié un signo.", tiempo: "2 min" }));

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

const archivo = (extra: Partial<ArchivoDeImagen> = {}): ArchivoDeImagen => ({ src: "/img/a/b/x.webp", ancho: 1300, alto: 900, extension: "webp", duplicadas: [], ...extra });
const resueltas = (h: Herramienta, presentes: string[]): ImagenResuelta[] => h.imagenes.map((espacio) => ({ espacio, archivo: presentes.includes(espacio.archivo) ? archivo({ src: `/img/${h.meta.area}/${h.meta.slug}/${espacio.archivo}.webp` }) : null }));

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

test("tamaño real de una imagen (.webp, .png o .jpg)", () => {
  assert.deepEqual(tamanoWebp(fs.readFileSync(path.join(raiz, "public", "og-default.webp"))), { ancho: 1200, alto: 630 });
  assert.throws(() => tamanoWebp(Buffer.from("no es una imagen")));
});

test("bloques: el cierre de corchetes salta cadenas y comentarios, y se separan los objetos de un array", () => {
  const t = 'x: [ { a: "]}", b: 1 }, // } ]\n { c: `}` } ], y: 2';
  const fin = encontrarCierre(t, t.indexOf("["));
  assert.equal(t.slice(fin), "], y: 2");
  assert.equal(objetosDeArray(t.slice(t.indexOf("["), fin + 1)).length, 2);
});

for (const [nombre, ruta] of [["proceso (afiches)", "pagina-de-proceso"], ["simple (anuncios)", "pagina-simple"]] as const) {
  test(`${nombre}: publicar solo cambia la prueba, «Qué corregí yo», la fecha y publicado; las imágenes y el resto quedan intactos`, async () => {
    const fuente = fixture(ruta);
    const antes = await cargar(fuente);
    const texto = aplicarCambios({ fuente, ia: "ChatGPT", fecha: "2026-09-20", hoy: "2026-09-25", corregi: CORREGI });
    const h = await cargar(texto);
    assert.equal(h.publicado, true);
    assert.equal(h.meta.probadoEn, "ChatGPT");
    assert.equal(h.meta.probadoFecha, "2026-09-20");
    assert.equal(h.meta.actualizado, "2026-09-25");
    assert.deepEqual(h.ejemplo.queCorregi, CORREGI);
    assert.deepEqual(h.imagenes, antes.imagenes, "las imágenes no se registran ni se mueven: se detectan solas");
    assert.deepEqual(h.ejemplo.pasos, antes.ejemplo.pasos);
    assert.ok(!("capturas" in h.ejemplo) && !("capturasPendientes" in h));
    assert.throws(() => aplicarCambios({ fuente: texto, ia: "x", fecha: "2026-09-20", hoy: "2026-09-25", corregi: CORREGI }), /ya está publicada/);
  });
}

test("proceso: publicado con sus imágenes obligatorias y el registro de la prueba pasa el validador sin errores", async () => {
  const fuente = fixture("pagina-de-proceso");
  const h = await cargar(aplicarCambios({ fuente, ia: "ChatGPT", fecha: "2026-09-20", hoy: "2026-09-25", corregi: CORREGI }));
  const completo: Herramienta = { ...h, ejemplo: { ...h.ejemplo, pasos: PASOS_DE_LA_PRUEBA, tiempoTotal: "14 min" } };
  const presentes = h.imagenes.map((i) => i.archivo);
  const buscar = (a: string): ArchivoBuscado | null => (presentes.includes(a) ? { src: `/img/marketing/crear-afiches-con-ia/${a}.webp`, ancho: 1300, alto: 900, extension: "webp", duplicadas: [] } : null);
  const r = validarHerramienta(completo, { existeImagen: (s) => s.endsWith("og.webp"), existentes: new Set([...h.relacionadas, "marketing/crear-afiches-con-ia"]), publicadas: new Set(h.relacionadas), buscarImagen: buscar });
  assert.deepEqual(r.errores.filter((e) => !/relacionada/i.test(e)), []);
  assert.ok(r.palabras >= 1500 && r.palabras <= 2500, `${r.palabras} palabras editoriales`);
});

/* ───────────── lo que falta para publicar ───────────── */

test("faltaParaPublicar (proceso): con las obligatorias y el registro de la prueba, nada falta; opcionales ausentes no cuentan", async () => {
  const h = { ...(await cargar(fixture("pagina-de-proceso"))) };
  const conRegistro: Herramienta = { ...h, ejemplo: { ...h.ejemplo, pasos: PASOS_DE_LA_PRUEBA, tiempoTotal: "14 min" } };
  const obligatorias = h.imagenes.filter((i) => i.obligatoria).map((i) => i.archivo);
  assert.deepEqual(obligatorias, ["prep-01", "prueba-01", "afiche-final", "mockup-vitrina"]);
  assert.deepEqual(faltaParaPublicar(conRegistro, resueltas(conRegistro, obligatorias)), []);
  assert.deepEqual(faltaParaPublicar(conRegistro, resueltas(conRegistro, h.imagenes.map((i) => i.archivo))), []);
});

test("faltaParaPublicar: dice qué archivo obligatorio falta (ruta y qué debe ser) y no pide las opcionales", async () => {
  const h = await cargar(fixture("pagina-de-proceso"));
  const conRegistro: Herramienta = { ...h, ejemplo: { ...h.ejemplo, pasos: PASOS_DE_LA_PRUEBA, tiempoTotal: "14 min" } };
  const faltan = faltaParaPublicar(conRegistro, resueltas(conRegistro, ["prueba-01", "prep-01"]));
  assert.equal(faltan.length, 2);
  assert.ok(faltan[0].includes("public/img/marketing/crear-afiches-con-ia/afiche-final.webp (o .png, o .jpg)") && faltan[0].includes("Afiche A4 terminado"));
  assert.ok(faltan[1].includes("mockup-vitrina") && faltan[1].includes("Simulación"));
  assert.ok(!faltan.join("\n").includes("estado-9x16") && !faltan.join("\n").includes("prueba-02"));
});

test("faltaParaPublicar (proceso): pide ejemplo.pasos y ejemplo.tiempoTotal, los datos de tu prueba real", async () => {
  const h = await cargar(fixture("pagina-de-proceso"));
  const todas = h.imagenes.map((i) => i.archivo);
  const sinRegistro = faltaParaPublicar(h, resueltas(h, todas));
  assert.equal(sinRegistro.length, 2);
  assert.ok(sinRegistro[0].startsWith("ejemplo.pasos") && sinRegistro[1].startsWith("ejemplo.tiempoTotal"));
  const filaVacia: Herramienta = { ...h, ejemplo: { ...h.ejemplo, pasos: [{ paso: 2, hizoLaIA: "", hiceYo: "  ", tiempo: "" }], tiempoTotal: "3 min" } };
  assert.ok(faltaParaPublicar(filaVacia, resueltas(filaVacia, todas))[0].startsWith("ejemplo.pasos"), "una fila en blanco no cuenta");
  const soloTotal: Herramienta = { ...h, ejemplo: { ...h.ejemplo, pasos: PASOS_DE_LA_PRUEBA, tiempoTotal: "  " } };
  assert.ok(faltaParaPublicar(soloTotal, resueltas(soloTotal, todas))[0].startsWith("ejemplo.tiempoTotal"));
});

test("faltaParaPublicar (página simple): solo la imagen obligatoria; no pide ejemplo.pasos; un archivo ilegible se dice", async () => {
  const h = await cargar(fixture("pagina-simple"));
  assert.deepEqual(h.imagenes.filter((i) => i.obligatoria).map((i) => i.archivo), ["prueba-01"]);
  assert.deepEqual(faltaParaPublicar(h, resueltas(h, ["prueba-01"])), []);
  const sin = faltaParaPublicar(h, resueltas(h, []));
  assert.equal(sin.length, 1);
  assert.ok(sin[0].includes("public/img/marketing/crear-anuncios-con-ia/prueba-01.webp"));
  const roto = h.imagenes.map((espacio) => ({ espacio, archivo: espacio.archivo === "prueba-01" ? archivo({ error: "no es un archivo .webp, .png o .jpg válido", ancho: 0, alto: 0 }) : null }));
  const r = faltaParaPublicar(h, roto);
  assert.ok(r.length === 1 && r[0].includes("no se puede leer como imagen"));
});
