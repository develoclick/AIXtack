/**
 * Plantilla de proceso, segunda parte: «Si algo falla» con correcciones que se copian, lista de revisión del paso 4, descarga de
 * los datos y prompts (.txt) y el registro de la prueba real (ejemplo.pasos y tiempoTotal).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import datos from "../../content/herramientas/marketing/crear-afiches-con-ia";
import { EjemploReal } from "../../components/herramientas/ejemplo-real";
import { PaginaHerramienta } from "../../components/herramientas/pagina-herramienta";
import { armarArchivoDeProceso, nombreDelArchivo } from "./descarga";
import type { ContextoPlantilla } from "./plantillas";
import { buscarArchivo } from "./imagenes";
import { ejecutarPreproceso, variablesDePreproceso } from "./preprocesos";
import { correccionesVisibles, itemsDeRevision, normalizarSalida } from "./proceso";
import { listarTodas, type HerramientaCargada } from "./registro";
import { pasosDelProceso, type Herramienta, type PasoProceso } from "./tipos";
import { validarHerramienta } from "./validar";

const ejemplo = Object.fromEntries(datos.campos.map((c) => [c.id, c.ejemplo]));
const perfilEspiga = { nombre: "Panadería La Espiga", rubro: "Panadería", direccion: "Av. Ejemplo 123", tono: "Cercano" };
const contexto = (valores: Record<string, string> = ejemplo, perfil: Record<string, string> = perfilEspiga): ContextoPlantilla => ({
  campos: datos.campos,
  valores,
  perfil,
  variables: variablesDePreproceso(datos.preproceso, ejecutarPreproceso(datos.preproceso!, valores)),
});
const pasos = pasosDelProceso(datos)!;
const paso = (n: number) => pasos.find((p) => p.numero === n)!;
const texto = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const leerComponente = (nombre: string) => fs.readFileSync(path.join(process.cwd(), "components", "herramientas", nombre), "utf8");
/** La página de afiches SIN las imágenes que ya existen en disco (next/image no se puede dibujar en estos tests; lo cubre `npm run qa`). */
const base = async (): Promise<HerramientaCargada> => {
  const h = (await listarTodas()).find((x) => x.meta.slug === "crear-afiches-con-ia")!;
  return { ...h, imagenes: h.imagenes.filter((i) => !buscarArchivo(h.meta.area, h.meta.slug, i.archivo)) };
};
const ctxValidacion = (h: Herramienta) => ({ existeImagen: () => true, existentes: new Set([`${h.meta.area}/${h.meta.slug}`, ...h.relacionadas]), publicadas: new Set<string>() });
const errores = (h: Herramienta) => validarHerramienta(h, ctxValidacion(h)).errores;
const correcciones = (n: number, ctx = contexto()) => paso(n).siAlgoFalla.flatMap((s) => correccionesVisibles(s, ctx));

/* ───────────── «Si algo falla»: correcciones que se copian ───────────── */

test("«Si algo falla»: paso 2 trae «Corregir el nivel 1» y «Quitar lo que no diste» con el texto ya relleno", () => {
  const por = Object.fromEntries(correcciones(2).map((x) => [x.etiqueta, x.texto]));
  assert.equal(por["Corregir el nivel 1"], "Corrige el nivel 1: debe decir exactamente «Combo de fin de semana: 6 panes y 1 pan dulce por $6». No cambies nada más.");
  assert.equal(por["Quitar lo que no diste"], "Quita cualquier descuento, envío, plazo o superlativo que yo no te haya dado. No cambies nada más.");
  assert.ok(por["Repetir con los títulos pedidos"].includes("TEXTO DEL AFICHE (Nivel 1, Nivel 2, Nivel 3, Nivel 4), LO QUE QUITÉ"));
  assert.ok(por["Repetir con los títulos pedidos"].includes("PROMPT DE IMAGEN SIN TEXTO"), "sin foto real");
  assert.ok(correcciones(2, contexto({ ...ejemplo, foto: "Sí" })).find((x) => x.etiqueta === "Repetir con los títulos pedidos")!.texto.includes("BRIEF PARA DISEÑAR, IMAGEN y FALTA"));
  assert.ok(correcciones(2, contexto({ ...ejemplo, precio: "$7" })).some((x) => x.texto.includes("por $7»")), "cambia con los datos");
});

test("«Si algo falla»: paso 3B trae una corrección por dato para la IA de imagen; sin condiciones no hay corrección de condiciones", () => {
  const c = correcciones(3);
  assert.deepEqual(c.map((x) => x.etiqueta), ["Oferta", "Precio", "Días y horario", "Acción y lugar", "Condiciones"]);
  assert.equal(c[1].texto, "En el afiche, el precio debe decir exactamente «$6». Corrige solo eso y no cambies nada más.");
  assert.equal(c[3].texto, "En el afiche, la acción y el lugar deben decir exactamente «Entrar a comprar el combo · Panadería La Espiga, Av. Ejemplo 123». Corrige solo eso y no cambies nada más.");
  assert.ok(c.every((x) => x.destino === "tu IA de imagen" && x.texto.endsWith("Corrige solo eso y no cambies nada más.")));
  assert.deepEqual(correcciones(3, contexto({ ...ejemplo, condiciones: "" })).map((x) => x.etiqueta), ["Oferta", "Precio", "Días y horario", "Acción y lugar"]);
});

test("«Si algo falla»: paso 5 trae «Esta versión cambió el texto…»; las salidas que no piden escribirle a la IA no llevan botón; nunca salen llaves", () => {
  assert.deepEqual(correcciones(5).map((x) => x.texto), ["Esta versión cambió el texto. Usa exactamente el mismo texto del afiche original, sin añadir nada."]);
  for (const n of [1, 4]) assert.deepEqual(correcciones(n), [], `el paso ${n} no le pide nada a la IA`);
  for (const p of pasos) for (const s of p.siAlgoFalla) assert.ok(normalizarSalida(s).texto.length > 10);
  const vacio = contexto(Object.fromEntries(datos.campos.map((c) => [c.id, ""])), {});
  for (const ctx of [contexto(), vacio]) for (const n of [2, 3, 5]) for (const x of correcciones(n, ctx)) assert.ok(!/\{\{|\}\}|undefined|null|NaN/.test(x.texto), x.texto);
});

test("«Si algo falla»: en la página cada corrección lleva su botón «Copiar corrección» con nombre propio y su texto a la vista", async () => {
  const h = await base();
  const html = renderToStaticMarkup(createElement(PaginaHerramienta, { herramienta: h, relacionadas: [] }));
  const botones = [...html.matchAll(/aria-label="(Copiar corrección del paso [^"]+)"/g)].map((m) => m[1]);
  assert.ok(botones.length >= 5, botones.join(" | "));
  assert.equal(new Set(botones).size, botones.length);
  assert.ok(botones.some((b) => b.startsWith("Copiar corrección del paso 2: Corregir el nivel 1")));
  assert.ok(botones.some((b) => b.startsWith("Copiar corrección del paso 5:")));
  assert.equal((html.match(/data-correccion-texto/g) ?? []).length, botones.length, "cada botón tiene su texto visible");
  assert.ok(html.includes(">Copiar corrección<"), "el texto visible del botón");
});

test("«Si algo falla»: el botón usa el mismo BotonCopiar (44 px, alternativa si falla el portapapeles)", () => {
  assert.ok(leerComponente("proceso.tsx").includes('etiqueta="Copiar corrección"'));
  const boton = leerComponente("boton-copiar.tsx");
  assert.ok(boton.includes("min-h-11") && boton.includes("copiarAntiguo") && boton.includes("Texto para copiar a mano"));
});

/* ───────────── paso 4: lista de revisión con los datos exactos ───────────── */

test("paso 4: un ítem por dato (oferta, precio, días y horario, acción, lugar, condiciones) con su valor exacto y «X de N comprobados»", () => {
  const r = itemsDeRevision(paso(4).comprobar!, ejemplo, {});
  assert.deepEqual(
    r.items.map((i) => [i.etiqueta, i.valor]),
    [
      ["Oferta", "Combo de fin de semana: 6 panes y 1 pan dulce"],
      ["Precio", "$6"],
      ["Días y horario", "Sábado y domingo, de 7:00 a 13:00"],
      ["Acción", "Entrar a comprar el combo"],
      ["Lugar o dirección", "Panadería La Espiga, Av. Ejemplo 123"],
      ["Condiciones", "Hasta agotar existencias. Máximo 2 combos por persona."],
    ]
  );
  assert.deepEqual([r.comprobados, r.total], [0, 6]);
  const dos = itemsDeRevision(paso(4).comprobar!, ejemplo, { precio: "$6", accion: "Entrar a comprar el combo" });
  assert.deepEqual([dos.comprobados, dos.total], [2, 6]);
  assert.deepEqual(dos.items.filter((i) => i.comprobado).map((i) => i.campo), ["precio", "accion"]);
});

test("paso 4: si cambias un dato la casilla se desmarca sola; un dato vacío no se puede comprobar y no cuenta en N", () => {
  const marcados = { precio: "$6", lugar: "Panadería La Espiga, Av. Ejemplo 123" };
  const cambiado = itemsDeRevision(paso(4).comprobar!, { ...ejemplo, precio: "$7" }, marcados);
  assert.equal(cambiado.items.find((i) => i.campo === "precio")!.comprobado, false, "el $6 comprobado ya no vale para $7");
  assert.equal(cambiado.comprobados, 1);
  const sinCondiciones = itemsDeRevision(paso(4).comprobar!, { ...ejemplo, condiciones: "" }, { condiciones: "" });
  assert.deepEqual([sinCondiciones.comprobados, sinCondiciones.total], [0, 5]);
  assert.equal(sinCondiciones.items.find((i) => i.campo === "condiciones")!.tieneDato, false);
  const todoVacio = itemsDeRevision(paso(4).comprobar!, {}, {});
  assert.deepEqual([todoVacio.comprobados, todoVacio.total], [0, 0]);
  assert.equal(itemsDeRevision(paso(4).comprobar!, { precio: "  $6  " }, {}).items[1].valor, "$6", "se muestra el valor sin espacios sobrantes");
});

test("paso 4 en la página: casillas con «X de N comprobados»; el estado vive solo en el navegador y todo uso de localStorage va en try/catch", async () => {
  const h = await base();
  const html = renderToStaticMarkup(createElement(PaginaHerramienta, { herramienta: h, relacionadas: [] }));
  assert.ok(html.includes("data-revision"));
  assert.ok(texto(html).includes("0 de 0 comprobados"), "sin datos aún no hay nada que comprobar");
  assert.ok(leerComponente("proceso.tsx").includes("guiapromptsia:revision:"), "clave de almacenamiento propia");
  const almacen = leerComponente("almacen-local.ts");
  const usos = almacen.split("\n").filter((l) => l.includes("window.localStorage."));
  assert.ok(usos.length >= 2);
  for (const l of usos) {
    const i = almacen.indexOf(l);
    assert.ok(almacen.slice(Math.max(0, i - 120), i).includes("try {"), `localStorage sin try: ${l.trim()}`);
  }
  assert.ok(!/fetch\(|sendBeacon/.test(almacen), "no sale nada del navegador");
});

/* ───────────── descargar mis datos y prompts (.txt) ───────────── */

const entradaArchivo = (valores = ejemplo, perfil: Record<string, string> = perfilEspiga) => ({
  fecha: "2026-09-26",
  titulo: datos.meta.titulo,
  url: "https://www.guiapromptsia.com/marketing/crear-afiches-con-ia",
  campos: datos.campos,
  usaPerfil: datos.usaPerfil,
  contexto: contexto(valores, perfil),
  promptMaestro: "PROMPT MAESTRO DE PRUEBA con «Combo de fin de semana: 6 panes y 1 pan dulce por $6»",
  pasos,
});

test("descarga: el archivo lleva la fecha, los datos del formulario, el perfil y los prompts de los 5 pasos, sin llaves", () => {
  const t = armarArchivoDeProceso(entradaArchivo());
  assert.ok(t.startsWith("Crea tu afiche completo, listo para imprimir y pegar en tu local"));
  assert.ok(t.includes("Fecha: 2026-09-26"));
  assert.ok(t.includes("no se envió a ningún servidor"));
  for (const c of datos.campos) assert.ok(t.includes(`- ${c.label}: ${ejemplo[c.id]}`), c.label);
  assert.ok(t.includes("- Nombre del negocio: Panadería La Espiga") && t.includes("- Rubro: Panadería"));
  for (let n = 1; n <= 5; n++) assert.ok(t.includes(`PASO ${n} de 5`), `paso ${n}`);
  assert.ok(t.includes("PROMPT MAESTRO DE PRUEBA"), "el prompt del paso 2");
  assert.ok(t.includes("Crea un afiche vertical tamaño A4 para Panadería La Espiga."), "el prompt del paso 3B");
  assert.ok(t.includes("Adapta este afiche a formato vertical 9:16"), "el formato marcado");
  assert.ok(t.includes("Coloca este afiche, sin modificarlo") && t.includes("Escribe un mensaje corto de WhatsApp"));
  assert.ok(!t.includes("formato cuadrado 1:1"), "un formato que no marcaste no sale");
  assert.ok(t.includes("Este paso no lleva prompt."));
  assert.ok(!/\{\{|\}\}|undefined|null|NaN/.test(t));
});

test("descarga: sin formatos avisa en el paso 5; sin datos dice «(sin dato)»; se crea en el navegador (Blob) y no envía nada", () => {
  const vacio = armarArchivoDeProceso(entradaArchivo({ ...ejemplo, formatos: "", condiciones: "" }, {}));
  assert.ok(vacio.includes("Marca al menos un formato en «Tus datos»"));
  assert.ok(vacio.includes("- Condiciones: (sin dato)"));
  assert.ok(!vacio.includes("DATOS DE «MI NEGOCIO»"), "sin perfil no hay esa sección");
  assert.equal(nombreDelArchivo("crear-afiches-con-ia", "2026-09-26"), "crear-afiches-con-ia-2026-09-26.txt");
  const fuente = leerComponente("proceso.tsx");
  const trozo = fuente.slice(fuente.indexOf("function DescargarDatos"), fuente.indexOf("/** Bloque «El proceso»"));
  assert.ok(trozo.includes("new Blob(") && trozo.includes("createObjectURL"));
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|axios/.test(trozo), "no envía nada al servidor");
  const constructor = fs.readFileSync(path.join(process.cwd(), "lib", "herramientas", "descarga.ts"), "utf8");
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(constructor));
});

test("descarga: el botón y su aclaración salen al final del proceso, antes del kit final", async () => {
  const h = await base();
  const t = texto(renderToStaticMarkup(createElement(PaginaHerramienta, { herramienta: h, relacionadas: [] })));
  const iBoton = t.indexOf("Descargar mis datos y prompts (.txt)");
  assert.ok(iBoton > t.indexOf("Paso 5 de 5"), "después del último paso");
  assert.ok(iBoton < t.indexOf("Tu kit final"), "antes del kit final");
  assert.ok(t.includes("El archivo se crea en tu navegador; no lo recibimos."));
});

/* ───────────── ejemplo.pasos (hizoLaIA / hiceYo / tiempo) y tiempoTotal ───────────── */

test("ejemplo.pasos y tiempoTotal existen, están vacíos (no se inventa una prueba) y no se muestran en producción", () => {
  assert.deepEqual(datos.ejemplo.pasos, []);
  assert.equal(datos.ejemplo.tiempoTotal, "");
  const vacio = renderToStaticMarkup(createElement(EjemploReal, { ejemplo: datos.ejemplo, datos: [], pasos: pasos.map((p) => ({ numero: p.numero, titulo: p.titulo })) }));
  assert.ok(!vacio.includes("Quién hizo qué") && !vacio.includes("Tiempo total") && !vacio.includes("data-quien-hizo-que"));
  const enBlanco = renderToStaticMarkup(createElement(EjemploReal, { ejemplo: { ...datos.ejemplo, pasos: [{ paso: 2, hizoLaIA: "  ", hiceYo: "", tiempo: "" }], tiempoTotal: "  " }, datos: [] }));
  assert.ok(!enBlanco.includes("Quién hizo qué"), "filas en blanco tampoco");
});

test("ejemplo.pasos: con datos reales se muestra «Quién hizo qué» con el paso, la IA, yo, el tiempo y el total", () => {
  const html = renderToStaticMarkup(
    createElement(EjemploReal, {
      ejemplo: { ...datos.ejemplo, pasos: [{ paso: 2, hizoLaIA: "Escribió los cuatro niveles.", hiceYo: "Cambié un signo.", tiempo: "1 min" }], tiempoTotal: "14 min" },
      datos: [],
      pasos: pasos.map((p) => ({ numero: p.numero, titulo: p.titulo })),
    })
  );
  const t = texto(html);
  assert.ok(t.includes("Quién hizo qué, paso a paso"));
  assert.ok(t.includes("Paso 2 · El texto de tu afiche") && t.includes("La IA: Escribió los cuatro niveles.") && t.includes("Yo: Cambié un signo.") && t.includes("1 min"));
  assert.ok(t.includes("Tiempo total: 14 min"));
});

test("validador: ejemplo.pasos exige la prueba real (IA y fecha), el tiempo total, textos completos y pasos que existan", async () => {
  const h = await base();
  const fila = { paso: 2, hizoLaIA: "Escribió los niveles.", hiceYo: "Cambié un signo.", tiempo: "1 min" };
  const con = (ejemplo: Partial<Herramienta["ejemplo"]>, publicado = false): Herramienta => ({ ...h, publicado, ejemplo: { ...h.ejemplo, ...ejemplo } });
  assert.ok(errores(con({ pasos: [fila], tiempoTotal: "" })).some((e) => e.includes("tiempoTotal")));
  assert.ok(errores(con({ pasos: [{ ...fila, hiceYo: "" }], tiempoTotal: "3 min" })).some((e) => e.includes("hiceYo")));
  assert.ok(errores(con({ pasos: [{ ...fila, paso: 9 }], tiempoTotal: "3 min" })).some((e) => e.includes("paso 9")));
  assert.ok(errores(con({ pasos: [fila, fila], tiempoTotal: "3 min" })).some((e) => e.includes("mismo paso")));
  const borrador = validarHerramienta(con({ pasos: [fila], tiempoTotal: "3 min" }), ctxValidacion(h));
  assert.ok(!borrador.errores.some((e) => e.includes("ejemplo.pasos")) && borrador.avisos.some((e) => e.includes("ejemplo.pasos")), "borrador sin prueba: solo aviso");
  const publicada = errores({ ...con({ pasos: [fila], tiempoTotal: "3 min" }, true), meta: { ...h.meta, probadoEn: null, probadoFecha: null } });
  assert.ok(publicada.some((e) => e.includes("ejemplo.pasos")), "publicada sin prueba: error");
});

test("validador: las correcciones son plantillas válidas (marcas y condiciones que existen) y con etiqueta única", async () => {
  const h = await base();
  const con = (c: { etiqueta: string; prompt: string; mostrarSi?: string }[]): Herramienta => ({
    ...h,
    pasos: (pasosDelProceso(h) as PasoProceso[]).map((p) => (p.numero === 2 ? { ...p, siAlgoFalla: [{ texto: "Texto de la salida", correcciones: c }] } : p)),
  });
  assert.ok(errores(con([{ etiqueta: "A", prompt: "Di {{noExiste}}" }])).some((e) => e.includes("noExiste")));
  assert.ok(errores(con([{ etiqueta: "A", prompt: "x", mostrarSi: "formatos~Cartel" }])).some((e) => e.includes("Cartel")));
  assert.ok(errores(con([{ etiqueta: "A", prompt: "x" }, { etiqueta: "A", prompt: "y" }])).some((e) => e.includes("misma etiqueta")));
  assert.ok(errores(con([])).some((e) => e.includes("al menos una corrección")));
  assert.deepEqual(errores(con([{ etiqueta: "Nivel 1", prompt: "Corrige el nivel 1: {{n1}}", mostrarSi: "precio" }])), []);
});
