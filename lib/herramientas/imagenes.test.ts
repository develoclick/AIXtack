/**
 * Espacios de imagen: el archivo se detecta solo (.webp → .png → .jpg), se leen su ancho y su alto reales, y según el estado de la
 * página se muestra la imagen, un recuadro de vista previa (solo borradores) o nada; una página publicada sin una imagen
 * obligatoria no se construye.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EjemploReal } from "../../components/herramientas/ejemplo-real";
import { EspacioDeImagen, proporcionCss } from "../../components/herramientas/espacio-imagen";
import { EXTENSIONES_DE_IMAGEN, leerDimensiones } from "../imagenes/dimensiones";
import { buscarArchivo, resolverImagenes, type ImagenResuelta } from "./imagenes";
import { listarTodas } from "./registro";
import { ETIQUETAS_IMAGEN, type EspacioImagen, type Herramienta } from "./tipos";
import { gruposDelEjemplo, imagenesEn, ubicacionesValidas } from "./ubicaciones";
import { validarHerramienta, type ArchivoBuscado } from "./validar";
import { estadoDeEspacio, mostrarEspaciosVacios } from "./vista-previa";

const raiz = process.cwd();

/* ───────────── tamaño real de webp, png y jpg ───────────── */

const png = (ancho: number, alto: number) => {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(ancho, 16);
  b.writeUInt32BE(alto, 20);
  return b;
};
const jpg = (ancho: number, alto: number) => {
  // SOI + un APP0 de relleno + SOF0 con el tamaño
  const app0 = Buffer.from([0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00]);
  const sof = Buffer.alloc(19);
  sof[0] = 0xff;
  sof[1] = 0xc0;
  sof.writeUInt16BE(17, 2);
  sof[4] = 8;
  sof.writeUInt16BE(alto, 5);
  sof.writeUInt16BE(ancho, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof, Buffer.alloc(8)]);
};

test("dimensiones: lee el ancho y el alto de un .webp real, de un .png y de un .jpg; rechaza lo que no es una imagen", () => {
  assert.deepEqual(leerDimensiones(fs.readFileSync(path.join(raiz, "public", "og-default.webp"))), { ancho: 1200, alto: 630 });
  assert.deepEqual(leerDimensiones(png(1300, 900)), { ancho: 1300, alto: 900 });
  assert.deepEqual(leerDimensiones(jpg(1080, 1920)), { ancho: 1080, alto: 1920 });
  assert.throws(() => leerDimensiones(Buffer.from("esto no es una imagen, es solo texto de prueba para el lector")), /no es un archivo/);
  assert.throws(() => leerDimensiones(png(0, 10)), /0 píxeles/);
  assert.deepEqual([...EXTENSIONES_DE_IMAGEN], ["webp", "png", "jpg"]);
});

/* ───────────── detección del archivo ───────────── */

function conCarpeta(archivos: Record<string, Buffer>, prueba: (raizTemporal: string) => void) {
  const raizTemporal = fs.mkdtempSync(path.join(os.tmpdir(), "imgs-"));
  try {
    const dir = path.join(raizTemporal, "public", "img", "marketing", "pagina");
    fs.mkdirSync(dir, { recursive: true });
    for (const [nombre, contenido] of Object.entries(archivos)) fs.writeFileSync(path.join(dir, nombre), contenido);
    prueba(raizTemporal);
  } finally {
    fs.rmSync(raizTemporal, { recursive: true, force: true });
  }
}
const webpReal = fs.readFileSync(path.join(raiz, "public", "og-default.webp"));

test("detección: busca .webp, luego .png y luego .jpg, y lee el tamaño real sin registrar nada", () => {
  conCarpeta({ "solo-png.png": png(1500, 1000), "solo-jpg.jpg": jpg(1400, 900), "solo-webp.webp": webpReal }, (r) => {
    assert.deepEqual(buscarArchivo("marketing", "pagina", "solo-webp", r), { src: "/img/marketing/pagina/solo-webp.webp", extension: "webp", duplicadas: [], ancho: 1200, alto: 630 });
    assert.deepEqual(buscarArchivo("marketing", "pagina", "solo-png", r), { src: "/img/marketing/pagina/solo-png.png", extension: "png", duplicadas: [], ancho: 1500, alto: 1000 });
    assert.deepEqual(buscarArchivo("marketing", "pagina", "solo-jpg", r), { src: "/img/marketing/pagina/solo-jpg.jpg", extension: "jpg", duplicadas: [], ancho: 1400, alto: 900 });
    assert.equal(buscarArchivo("marketing", "pagina", "no-existe", r), null);
    assert.equal(buscarArchivo("marketing", "otra-pagina", "solo-webp", r), null, "cada página mira solo su carpeta");
  });
});

test("detección: con varias extensiones del mismo nombre gana .webp (y se avisa de las demás)", () => {
  conCarpeta({ "doble.png": png(1300, 800), "doble.webp": webpReal, "doble.jpg": jpg(900, 600), "png-y-jpg.jpg": jpg(900, 600), "png-y-jpg.png": png(1300, 800) }, (r) => {
    const a = buscarArchivo("marketing", "pagina", "doble", r)!;
    assert.equal(a.extension, "webp");
    assert.deepEqual(a.duplicadas, ["png", "jpg"]);
    assert.equal(a.ancho, 1200, "el tamaño es el del .webp que se usa");
    const b = buscarArchivo("marketing", "pagina", "png-y-jpg", r)!;
    assert.deepEqual([b.extension, b.duplicadas], ["png", ["jpg"]]);
  });
});

test("detección: un archivo que no es una imagen válida se marca con su error (no rompe la lectura de la página)", () => {
  conCarpeta({ "roto.webp": Buffer.from("no soy una imagen, solo texto suficiente para que lo intente leer") }, (r) => {
    const a = buscarArchivo("marketing", "pagina", "roto", r)!;
    assert.equal(a.extension, "webp");
    assert.match(a.error ?? "", /no es un archivo/);
    assert.deepEqual([a.ancho, a.alto], [0, 0]);
  });
});

test("resolverImagenes: devuelve, en el orden de los datos, cada espacio con su archivo o null", () => {
  conCarpeta({ "uno.webp": webpReal }, (r) => {
    const espacios = [espacio({ id: "uno", archivo: "uno" }), espacio({ id: "dos", archivo: "dos" })];
    const res = resolverImagenes({ meta: { area: "marketing", slug: "pagina" } as Herramienta["meta"], imagenes: espacios }, r);
    assert.deepEqual(res.map((x) => [x.espacio.id, x.archivo?.src ?? null]), [["uno", "/img/marketing/pagina/uno.webp"], ["dos", null]]);
  });
});

/* ───────────── datos: las 15 páginas y las 6 imágenes de afiches ───────────── */

function espacio(extra: Partial<EspacioImagen> = {}): EspacioImagen {
  return { id: "x", archivo: "x", etiqueta: "Prueba real", alt: "Descripción suficientemente larga de la imagen de prueba.", leyenda: "Leyenda de la imagen de prueba.", ubicacion: "ejemplo", obligatoria: false, ...extra };
}

test("las 15 páginas definen sus imágenes en «imagenes» (ya no hay capturas ni capturasPendientes) y el validador las acepta", async () => {
  for (const h of (await listarTodas()).filter((x) => !x.interna)) {
    assert.ok(Array.isArray(h.imagenes), h.meta.slug);
    assert.equal("capturasPendientes" in h, false, `${h.meta.slug}: capturasPendientes ya no existe`);
    assert.equal("capturas" in h.ejemplo, false, `${h.meta.slug}: ejemplo.capturas ya no existe`);
    assert.equal(h.metodoCompleto !== null && "capturas" in h.metodoCompleto, false);
    for (const e of h.imagenes) {
      assert.ok((ETIQUETAS_IMAGEN as readonly string[]).includes(e.etiqueta), `${h.meta.slug}/${e.id}: etiqueta`);
      assert.match(e.archivo, /^[a-z0-9][a-z0-9-]*$/, "el nombre va sin extensión");
    }
    const r = validarHerramienta(h, { existeImagen: () => true, existentes: new Set([`${h.meta.area}/${h.meta.slug}`, ...h.relacionadas]), publicadas: new Set(h.relacionadas), buscarImagen: (a) => buscarArchivo(h.meta.area, h.meta.slug, a) });
    assert.deepEqual(r.errores.filter((e) => /Imagen «|imagen/.test(e)), [], h.meta.slug);
  }
});

test("anuncios y promociones: las imágenes anteriores se migraron con sus mismos textos y etiquetas", async () => {
  const todas = await listarTodas();
  const anuncios = todas.find((x) => x.meta.slug === "crear-anuncios-con-ia")!;
  const p1 = anuncios.imagenes.find((i) => i.archivo === "prueba-prompt-01")!;
  assert.equal(p1.etiqueta, "Prueba real");
  assert.equal(p1.leyenda, "Prueba real del método anterior, con la misma información: la primera respuesta, sin editar.");
  assert.ok(p1.alt.startsWith("Captura de la respuesta de un asistente de IA con dos anuncios para la Ferretería Casa y Clavo"));
  assert.deepEqual(anuncios.imagenes.filter((i) => i.ubicacion === "metodo-completo").map((i) => i.archivo), ["prueba-prompt-02", "prueba-prompt-03", "prueba-prompt-04"]);
  const promos = todas.find((x) => x.meta.slug === "crear-promociones-con-ia")!;
  assert.equal(promos.imagenes.filter((i) => i.etiqueta === "Prueba real").length >= 4, true);
  for (const h of [anuncios, promos]) for (const r of resolverImagenes(h).filter((x) => !x.espacio.obligatoria)) assert.ok(r.archivo && !r.archivo.error, `${h.meta.slug}/${r.espacio.archivo}: el archivo existente se detecta`);
});

test("afiches: 6 espacios con los nombres, etiquetas, ubicaciones y obligatoriedad pedidos", async () => {
  const h = (await listarTodas()).find((x) => x.meta.slug === "crear-afiches-con-ia")!;
  assert.deepEqual(
    h.imagenes.map((i) => [i.archivo, i.etiqueta, i.ubicacion, i.obligatoria]),
    [
      ["prep-01", "Captura de la herramienta", "preparacion", true],
      ["prueba-01", "Prueba real", "paso-2", true],
      ["prueba-02", "Prueba real", "paso-3", false],
      ["afiche-final", "Resultado final diseñado con el texto de la IA", ["paso-4", "resultado-afiche"], true],
      ["mockup-vitrina", "Simulación", ["paso-5", "resultado-mockup"], true],
      ["estado-9x16", "Resultado final diseñado con el texto de la IA", ["paso-5", "resultado-versiones"], false],
    ]
  );
  const por = Object.fromEntries(h.imagenes.map((i) => [i.archivo, i]));
  assert.equal(por["prueba-01"].nota, "La IA cambió «·» por «—» en el nivel 3; lo corregí.");
  assert.equal(por["mockup-vitrina"].leyenda, "Simulación generada con IA para visualizar el afiche. No es una foto real del local.");
  assert.equal(por["prep-01"].titulo, "Herramienta con el formulario lleno y el contador en 39 palabras");
  assert.equal(por["prueba-01"].titulo, "Chat de la IA con el texto del afiche");
  // Todas las ubicaciones existen en la página de proceso.
  const ok = ubicacionesValidas((h.pasos as { numero: number }[]) ?? [], h.resultadoFinal ?? []);
  for (const i of h.imagenes) for (const u of Array.isArray(i.ubicacion) ? i.ubicacion : [i.ubicacion]) assert.ok(ok.has(u), `${i.id}: ${u}`);
});

test("afiches: tu prueba-01.webp ya guardada en su carpeta aparece sola, sin registrarla en los datos", async () => {
  const h = (await listarTodas()).find((x) => x.meta.slug === "crear-afiches-con-ia")!;
  if (!fs.existsSync(path.join(raiz, "public", "img", "marketing", "crear-afiches-con-ia", "prueba-01.webp"))) return;
  const r = resolverImagenes(h).find((x) => x.espacio.archivo === "prueba-01")!;
  assert.equal(r.archivo?.src, "/img/marketing/crear-afiches-con-ia/prueba-01.webp");
  assert.ok((r.archivo?.ancho ?? 0) > 0 && (r.archivo?.alto ?? 0) > 0, "su ancho y su alto reales");
  assert.ok(!JSON.stringify(h).includes("prueba-01.webp"), "los datos no nombran la extensión: no hay nada que registrar");
});

/* ───────────── qué se dibuja: imagen, recuadro o nada (las tres situaciones) ───────────── */

test("estado de un espacio — (1) borrador: recuadro solo con vista previa; sin ella, nada; con archivo, la imagen", () => {
  const base = { publicado: false, obligatoria: true };
  assert.deepEqual(estadoDeEspacio({ ...base, existe: true, vistaPrevia: false }), { estado: "imagen" });
  assert.deepEqual(estadoDeEspacio({ ...base, existe: false, vistaPrevia: true }), { estado: "recuadro" });
  assert.deepEqual(estadoDeEspacio({ ...base, existe: false, vistaPrevia: false }), { estado: "nada" });
  assert.deepEqual(estadoDeEspacio({ publicado: false, obligatoria: false, existe: false, vistaPrevia: true }), { estado: "recuadro" }, "también las opcionales");
});

test("estado de un espacio — (2) publicada: NUNCA un recuadro; una opcional que falta no enseña nada", () => {
  for (const vistaPrevia of [true, false]) {
    assert.deepEqual(estadoDeEspacio({ publicado: true, obligatoria: false, existe: false, vistaPrevia }), { estado: "nada" });
    assert.deepEqual(estadoDeEspacio({ publicado: true, obligatoria: true, existe: true, vistaPrevia }), { estado: "imagen" });
  }
  assert.equal(mostrarEspaciosVacios(true, true), false);
  assert.equal(mostrarEspaciosVacios(false, true), true);
  assert.equal(mostrarEspaciosVacios(false, false), false);
});

test("estado de un espacio — (3) publicada y falta una obligatoria: error claro que rompe el build", () => {
  const e = estadoDeEspacio({ publicado: true, obligatoria: true, existe: false, vistaPrevia: true, ruta: "afiche-final" });
  assert.equal(e.estado, "error");
  assert.match((e as { mensaje: string }).mensaje, /afiche-final/);
  assert.match((e as { mensaje: string }).mensaje, /obligatoria/);
  assert.match((e as { mensaje: string }).mensaje, /publicado:false/);
});

const faltante = (extra: Partial<EspacioImagen> = {}): ImagenResuelta => ({ espacio: espacio({ titulo: "Chat de la IA con el texto del afiche", etiqueta: "Prueba real", archivo: "prueba-01", proporcion: "16:10", ...extra }), archivo: null });
const html = (r: ImagenResuelta, publicado: boolean, vistaPrevia: boolean) => renderToStaticMarkup(createElement(EspacioDeImagen, { resuelta: r, publicado, vistaPrevia }));

test("el recuadro de vista previa: borde punteado, icono, título, etiqueta prevista, nombre de archivo y la proporción esperada", () => {
  const h = html(faltante({ obligatoria: true }), false, true);
  assert.ok(h.includes("border-dashed") && h.includes("<svg"), "punteado e icono");
  assert.ok(h.includes("Chat de la IA con el texto del afiche"), "título");
  assert.ok(h.includes("Prueba real") && h.includes("obligatoria"), "etiqueta prevista");
  assert.ok(h.includes("prueba-01.webp"), "nombre de archivo esperado");
  assert.ok(h.includes("aspect-ratio:16 / 10"), "misma proporción esperada: sin salto de diseño");
  assert.ok(html(faltante({ proporcion: "9:16", obligatoria: false }), false, true).includes("aspect-ratio:9 / 16"));
  assert.ok(html(faltante({ proporcion: undefined }), false, true).includes("aspect-ratio:16 / 10"), "por defecto 16:10");
  assert.equal(proporcionCss("210:297"), "210 / 297");
  assert.equal(proporcionCss("mal"), "16 / 10");
});

test("borrador sin vista previa (producción con la variable apagada): nada; publicada: nada (opcional) o error (obligatoria)", () => {
  assert.equal(html(faltante(), false, false), "");
  assert.equal(html(faltante({ obligatoria: false }), true, true), "", "publicada + opcional: nada, ni con vista previa");
  assert.equal(html(faltante({ obligatoria: false }), true, false), "");
  assert.throws(() => html(faltante({ obligatoria: true }), true, true), /Falta la imagen obligatoria/);
  assert.throws(() => html(faltante({ obligatoria: true }), true, false), /Falta la imagen obligatoria/);
});

test("en el ejemplo: un borrador con vista previa enseña recuadros agrupados por paso; publicado, ni recuadros ni títulos de grupos vacíos", () => {
  const pasos = [{ numero: 2, titulo: "El texto de tu afiche" }, { numero: 5, titulo: "Salida" }];
  const imagenes: ImagenResuelta[] = [
    faltante({ id: "prep", archivo: "prep-01", ubicacion: "preparacion", titulo: "Formulario lleno" }),
    faltante({ id: "p2", archivo: "prueba-01", ubicacion: "paso-2", obligatoria: true }),
    faltante({ id: "p5", archivo: "estado-9x16", ubicacion: ["paso-5", "resultado-versiones"], obligatoria: false, titulo: "Versión 9:16" }),
  ];
  const ejemplo = { negocio: "Panadería (ficticia)", queCorregi: [] } as never;
  const borrador = renderToStaticMarkup(createElement(EjemploReal, { ejemplo, datos: [], imagenes, pasos, publicado: false, vistaPrevia: true }));
  assert.equal((borrador.match(/data-espacio-imagen=/g) ?? []).length, 3);
  assert.ok(borrador.includes("Preparación") && borrador.includes("Paso 2 · El texto de tu afiche") && borrador.includes("Paso 5 · Salida"));
  assert.ok(borrador.indexOf("Preparación") < borrador.indexOf("Paso 2") && borrador.indexOf("Paso 2") < borrador.indexOf("Paso 5"), "en orden");
  const enProduccion = renderToStaticMarkup(createElement(EjemploReal, { ejemplo, datos: [], imagenes: imagenes.map((i) => ({ ...i, espacio: { ...i.espacio, obligatoria: false } })), pasos, publicado: true, vistaPrevia: true }));
  assert.ok(!enProduccion.includes("data-espacio-imagen") && !enProduccion.includes("border-dashed") && !enProduccion.includes("Preparación") && !enProduccion.includes("Paso 2 ·"));
  assert.throws(() => renderToStaticMarkup(createElement(EjemploReal, { ejemplo, datos: [], imagenes, pasos, publicado: true })), /Falta la imagen obligatoria/);
});

/* ───────────── ubicaciones ───────────── */

test("ubicaciones: la misma imagen puede ir en un paso y en una tarjeta; los grupos salen en orden", () => {
  const rs: ImagenResuelta[] = [
    { espacio: espacio({ id: "a", ubicacion: ["paso-4", "resultado-afiche"] }), archivo: null },
    { espacio: espacio({ id: "b", ubicacion: "preparacion" }), archivo: null },
    { espacio: espacio({ id: "c", ubicacion: "paso-2" }), archivo: null },
    { espacio: espacio({ id: "d", ubicacion: "ejemplo" }), archivo: null },
    { espacio: espacio({ id: "e", ubicacion: "metodo-completo" }), archivo: null },
  ];
  assert.deepEqual(imagenesEn(rs, "resultado-afiche").map((i) => i.espacio.id), ["a"]);
  assert.deepEqual(imagenesEn(rs, "paso-4").map((i) => i.espacio.id), ["a"]);
  assert.deepEqual(gruposDelEjemplo(rs).map((g) => g.clave), ["preparacion", "paso-2", "paso-4", "ejemplo"], "«metodo-completo» y «resultado-…» no son del ejemplo");
});

/* ───────────── validador ───────────── */

async function pagina(): Promise<Herramienta> {
  return (await listarTodas()).find((x) => x.meta.slug === "crear-afiches-con-ia")!;
}
const contexto = (h: Herramienta, hallados: Record<string, Partial<ArchivoBuscado>>) => ({
  existeImagen: () => true,
  existentes: new Set([`${h.meta.area}/${h.meta.slug}`, ...h.relacionadas]),
  publicadas: new Set(h.relacionadas),
  buscarImagen: (archivo: string): ArchivoBuscado | null => (archivo in hallados ? { src: `/img/x/y/${archivo}.webp`, ancho: 1300, alto: 900, extension: "webp", duplicadas: [], ...hallados[archivo] } : null),
});
const todos = (h: Herramienta) => Object.fromEntries(h.imagenes.map((i) => [i.archivo, {}]));

test("validador: publicada con todas las obligatorias pasa; sin una obligatoria, error claro con su ruta; sin una opcional, sin error", async () => {
  const h = { ...(await pagina()), publicado: true } as Herramienta;
  const sinOpcionales = Object.fromEntries(h.imagenes.filter((i) => i.obligatoria).map((i) => [i.archivo, {}]));
  const ok = validarHerramienta(h, contexto(h, sinOpcionales)).errores.filter((e) => /mage/.test(e));
  assert.deepEqual(ok, [], "faltan solo las opcionales: no hay error");
  const sinFinal = { ...sinOpcionales };
  delete sinFinal["afiche-final"];
  const e = validarHerramienta(h, contexto(h, sinFinal)).errores.filter((x) => /Falta la imagen obligatoria/.test(x));
  assert.equal(e.length, 1);
  assert.match(e[0], /afiche-final/);
  assert.match(e[0], /public\/img\/marketing\/crear-afiches-con-ia\/afiche-final\.webp, \.png o \.jpg/);
  assert.match(e[0], /Afiche A4 terminado/);
});

test("validador: en un borrador, lo que falta es solo un aviso", async () => {
  const h = { ...(await pagina()), publicado: false } as Herramienta;
  const r = validarHerramienta(h, contexto(h, {}));
  assert.deepEqual(r.errores.filter((x) => /mage/.test(x)), []);
  assert.ok(r.avisos.some((a) => /Falta la imagen obligatoria «prep-01»/.test(a)));
});

test("validador: más de un archivo con el mismo nombre → avisa y usa .webp; un archivo ilegible es un error", async () => {
  const h = await pagina();
  const r = validarHerramienta(h, contexto(h, { ...todos(h), "prueba-01": { extension: "webp", duplicadas: ["png"] } }));
  assert.ok(r.avisos.some((a) => /prueba-01/.test(a) && /más de un archivo con el mismo nombre/.test(a) && /prueba-01\.webp, prueba-01\.png/.test(a)));
  assert.deepEqual(r.errores.filter((e) => /mage/.test(e)), []);
  const roto = validarHerramienta(h, contexto(h, { ...todos(h), "prueba-01": { error: "no es un archivo .webp, .png o .jpg válido" } }));
  assert.ok(roto.errores.some((e) => /prueba-01/.test(e) && /no se puede leer/.test(e)));
});

test("validador: etiqueta, alt, leyenda, «generada con IA», nombre de archivo, ubicación, proporción e ids únicos", async () => {
  const h = await pagina();
  const con = (i: Partial<EspacioImagen>, ...mas: EspacioImagen[]): Herramienta => ({ ...h, imagenes: [espacio({ id: "z", archivo: "z", ubicacion: "paso-2", ...i }), ...mas] });
  const errores = (x: Herramienta) => validarHerramienta(x, contexto(x, todos(x))).errores;
  assert.ok(errores(con({ etiqueta: "Captura de chat" as never })).some((e) => /etiqueta/.test(e)));
  assert.ok(errores(con({ alt: "corto" })).some((e) => /alt es demasiado corto/.test(e)));
  assert.ok(errores(con({ leyenda: "" })).some((e) => /falta la leyenda/.test(e)));
  assert.ok(errores(con({ etiqueta: "Simulación", leyenda: "Una vitrina bonita." })).some((e) => /generada con IA/.test(e)));
  assert.ok(!errores(con({ etiqueta: "Foto generada con IA", leyenda: "Foto generada con IA de una vitrina." })).some((e) => /generada con IA/.test(e)));
  assert.ok(errores(con({ archivo: "prueba-01.webp" })).some((e) => /sin extensión/.test(e)));
  assert.ok(errores(con({ archivo: "Prueba 01" })).some((e) => /sin extensión/.test(e)));
  assert.ok(errores(con({ ubicacion: "paso-9" })).some((e) => /paso-9/.test(e)));
  assert.ok(errores(con({ ubicacion: ["paso-2", "resultado-noexiste"] })).some((e) => /resultado-noexiste/.test(e)));
  assert.ok(errores(con({ proporcion: "ancho" })).some((e) => /proporción/.test(e)));
  assert.ok(errores(con({}, espacio({ id: "z", archivo: "otro", ubicacion: "paso-2" }))).some((e) => /mismo id/.test(e)));
  assert.ok(errores(con({}, espacio({ id: "y", archivo: "z", ubicacion: "paso-2" }))).some((e) => /mismo nombre de archivo/.test(e)));
  assert.ok(errores(con({ obligatoria: undefined as never })).some((e) => /obligatoria/.test(e)));
});

test("validador: publicada exige ≥1 «Prueba real» con archivo y, en el ejemplo, 1–8 imágenes en un proceso (1–2 en una página simple)", async () => {
  const h = { ...(await pagina()), publicado: true } as Herramienta;
  const solo = (lista: EspacioImagen[]): Herramienta => ({ ...h, imagenes: lista });
  const r = (x: Herramienta) => validarHerramienta(x, contexto(x, todos(x))).errores;
  const sinReal = solo([espacio({ id: "a", archivo: "a", etiqueta: "Captura de la herramienta", ubicacion: "preparacion" })]);
  assert.ok(r(sinReal).some((e) => /Prueba real/.test(e)));
  const nueve = solo(Array.from({ length: 9 }, (_, i) => espacio({ id: `i${i}`, archivo: `i${i}`, ubicacion: "paso-2" })));
  assert.ok(r(nueve).some((e) => /Imágenes en el ejemplo: 9/.test(e)));
  assert.ok(!r(solo(Array.from({ length: 6 }, (_, i) => espacio({ id: `i${i}`, archivo: `i${i}`, ubicacion: "paso-2" })))).some((e) => /Imágenes en el ejemplo/.test(e)));
  const sinNada = solo([]);
  assert.ok(r(sinNada).some((e) => /Imágenes en el ejemplo: 0/.test(e)));
  // Una imagen que va en dos sitios (paso + tarjeta) cuenta una sola vez.
  const doble = solo([espacio({ id: "a", archivo: "a", ubicacion: ["paso-4", "resultado-afiche"] })]);
  assert.ok(!r(doble).some((e) => /Imágenes en el ejemplo/.test(e)));
});

test("los datos no mencionan rutas de archivo: las imágenes se nombran sin extensión y el resto sale del disco", async () => {
  for (const h of (await listarTodas()).filter((x) => !x.interna)) for (const i of h.imagenes) assert.ok(!/\.(webp|png|jpe?g)$/i.test(i.archivo) && !i.archivo.includes("/"), `${h.meta.slug}/${i.id}`);
});
