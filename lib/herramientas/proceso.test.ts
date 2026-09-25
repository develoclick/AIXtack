/**
 * Plantilla de PROCESO (piloto: /marketing/crear-afiches-con-ia): plantillas de prompts, opciones que siguen a los datos,
 * kit final, «Qué corregí yo», validación del esquema y estructura de la página.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import datos from "../../content/herramientas/marketing/crear-afiches-con-ia";
import { FormularioHerramienta } from "../../components/herramientas/formulario-herramienta";
import { PaginaHerramienta } from "../../components/herramientas/pagina-herramienta";
import { cumple, opcionesMarcadas, referenciasDe, renderPlantilla, type ContextoPlantilla } from "./plantillas";
import { ejecutarPreproceso, variablesDePreproceso } from "./preprocesos";
import { itemsVisiblesDelKit, opcionesDelPaso, resumenKit } from "./proceso";
import { buscarArchivo } from "./imagenes";
import { listarTodas, type HerramientaCargada } from "./registro";
import { pasosDelProceso, type Herramienta, type PasoProceso } from "./tipos";
import { validarHerramienta } from "./validar";

const ejemplo = Object.fromEntries(datos.campos.map((c) => [c.id, c.ejemplo]));
const perfilEspiga = { nombre: "Panadería La Espiga", rubro: "Panadería", direccion: "Av. Ejemplo 123", tono: "Cercano" };
const contexto = (valores: Record<string, string> = ejemplo, perfil = perfilEspiga): ContextoPlantilla => ({
  campos: datos.campos,
  valores,
  perfil,
  variables: variablesDePreproceso(datos.preproceso, ejecutarPreproceso(datos.preproceso!, valores)),
});
const pasos = pasosDelProceso(datos)!;
const paso = (n: number) => pasos.find((p) => p.numero === n)!;
const opcion = (n: number, id: string) => paso(n).opciones!.find((o) => o.id === id)!;
const texto = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* ───────────── plantillas ───────────── */

test("plantillas: campos, perfil con texto de reserva, variables y [FALTA] / «no indicado», nunca llaves", () => {
  const campos = [
    { id: "a", label: "Dato A", requerido: true },
    { id: "b", label: "Dato B" },
  ];
  const ctx: ContextoPlantilla = { campos, valores: { a: "  uno  " }, perfil: { nombre: "La Espiga" }, variables: { total: "39", vacia: "" } };
  assert.equal(renderPlantilla("{{a}}|{{b}}|{{perfil.nombre}}|{{perfil.rubro}}|{{total}}|{{vacia}}|{{nada}}", ctx), "uno|no indicado|La Espiga|no indicado|39|[FALTA]|[FALTA]");
  assert.equal(renderPlantilla("{{a|x}} {{b|sin B}} {{perfil.rubro|un negocio}}", { ...ctx, valores: {} }), "x sin B un negocio");
  assert.equal(renderPlantilla("{{a}}", { ...ctx, valores: {} }), "[FALTA: Dato A]");
  assert.equal(/\{\{|\}\}/.test(renderPlantilla("{{a}} {{ mal {{b}} }}", ctx)), false, "ni con marcas mal formadas");
});

test("plantillas: condiciones =, ~, campo con texto, !negación, O con «|» y datos del perfil", () => {
  const ctx = contexto();
  assert.equal(cumple("foto=No", ctx), true);
  assert.equal(cumple("foto=Sí", ctx), false);
  assert.equal(cumple("!foto=Sí", ctx), true);
  assert.equal(cumple("donde=IA de imagen|donde=Canva", ctx), true);
  assert.equal(cumple("formatos~A4 impreso", ctx), true);
  assert.equal(cumple("formatos~Post cuadrado (1:1)", ctx), false);
  assert.equal(cumple("formatos~Post cuadrado (1:1)|formatos~Estado de WhatsApp o historia (9:16)", ctx), true);
  assert.equal(cumple("colores", ctx), true);
  assert.equal(cumple("!colores", ctx), false);
  assert.equal(cumple("perfil.rubro", ctx), true);
  assert.equal(cumple("perfil.rubro", contexto(ejemplo, { nombre: "X" } as typeof perfilEspiga)), false);
  assert.equal(cumple(undefined, ctx), true);
  assert.deepEqual(opcionesMarcadas("A4 impreso; Post cuadrado (1:1)"), ["A4 impreso", "Post cuadrado (1:1)"]);
  assert.deepEqual(opcionesMarcadas(""), []);
  assert.equal(renderPlantilla("[{{#si foto=Sí}}sí{{/si}}{{#si foto=No}}no{{/si}}]", ctx), "[no]");
  assert.deepEqual(referenciasDe("{{#si a=1}}{{b|x}}{{/si}}{{c}}").marcas, ["b", "c"]);
  assert.equal(referenciasDe("{{#si a}}{{#si b}}x{{/si}}{{/si}}").anidado, true);
});

test("plantillas: los datos de la persona no se tocan (espacios y saltos de línea dentro del valor)", () => {
  const ctx: ContextoPlantilla = { campos: [{ id: "t", label: "T" }], valores: { t: "línea 1\n\n\n  línea   2" } };
  assert.equal(renderPlantilla("Texto:\n{{t}}", ctx), "Texto:\nlínea 1\n\n\n  línea   2");
});

/* ───────────── los prompts de los pasos con «Probar con un ejemplo» ───────────── */

test("paso 3, opción B (IA de imagen): el prompt exacto pedido, con el texto de los cuatro niveles y los colores de La Espiga", () => {
  const p = renderPlantilla(opcion(3, "ia-imagen").prompt!, contexto());
  assert.equal(
    p,
    "Crea un afiche vertical tamaño A4 para Panadería La Espiga. Usa EXACTAMENTE este texto, sin cambiar, añadir ni quitar ninguna letra, número o signo: arriba, muy grande: «Combo de fin de semana: 6 panes y 1 pan dulce por $6»; debajo, mediano: «Sábado y domingo, de 7:00 a 13:00»; abajo, visible: «Entrar a comprar el combo · Panadería La Espiga, Av. Ejemplo 123»; al pie, pequeño: «Hasta agotar existencias. Máximo 2 combos por persona.». Colores: Texto #5A3A22 sobre fondo #F4E9D8. Imagen de apoyo: Combo de fin de semana: 6 panes y 1 pan dulce, sin texto dentro. No añadas ningún otro texto, logotipo, sello, precio ni descuento."
  );
});

test("foto real = Sí: los prompts 2 y 3 dicen «usa la foto que adjunto, sin alterar el producto»; = No: piden una imagen de apoyo y avisan que se etiquete como generada con IA", () => {
  const conFoto = contexto({ ...ejemplo, foto: "Sí" });
  const sinFoto = contexto();
  const maestro2 = (ctx: ContextoPlantilla) => renderPlantilla(datos.tarea, ctx);
  assert.ok(maestro2(conFoto).includes("usa la foto que adjunto, sin alterar el producto"));
  assert.ok(!maestro2(conFoto).includes("PROMPT DE IMAGEN SIN TEXTO para un generador"));
  assert.ok(maestro2(sinFoto).includes("PROMPT DE IMAGEN SIN TEXTO para un generador de imágenes"));
  assert.ok(maestro2(sinFoto).includes("indicar que es una imagen generada con IA"));
  const b = (ctx: ContextoPlantilla) => renderPlantilla(opcion(3, "ia-imagen").prompt!, ctx);
  assert.ok(b(conFoto).includes("Usa la foto que adjunto como imagen principal, sin alterar el producto."));
  assert.ok(!b(conFoto).includes("Imagen de apoyo"));
  assert.ok(b(sinFoto).includes("Imagen de apoyo: Combo de fin de semana: 6 panes y 1 pan dulce, sin texto dentro."));
  // El aviso visible del paso 3 solo sale sin foto real.
  const aviso = paso(3).avisos!.find((a) => a.texto.includes("generada con IA"))!;
  assert.equal(cumple(aviso.si, sinFoto), true);
  assert.equal(cumple(aviso.si, conFoto), false);
  // El título del formato de salida también cambia.
  assert.ok(maestro2(conFoto).includes("BRIEF PARA DISEÑAR, IMAGEN y FALTA"));
  assert.ok(maestro2(sinFoto).includes("BRIEF PARA DISEÑAR, PROMPT DE IMAGEN SIN TEXTO y FALTA"));
});

test("paso 5: mockup, 9:16 y mensaje de WhatsApp con los textos pedidos; el mockup usa el rubro del perfil o «un negocio de barrio»", () => {
  assert.equal(
    renderPlantilla(opcion(5, "mockup").prompt!, contexto()),
    "Coloca este afiche, sin modificarlo, pegado en la vitrina de un negocio de barrio del rubro Panadería, visto desde la vereda, con luz de mañana. No cambies ni una letra del afiche. Es solo una simulación para ver cómo se vería."
  );
  assert.equal(
    renderPlantilla(opcion(5, "mockup").prompt!, contexto(ejemplo, { nombre: "X" } as typeof perfilEspiga)),
    "Coloca este afiche, sin modificarlo, pegado en la vitrina de un negocio de barrio, visto desde la vereda, con luz de mañana. No cambies ni una letra del afiche. Es solo una simulación para ver cómo se vería."
  );
  assert.equal(
    renderPlantilla(opcion(5, "vertical").prompt!, contexto()),
    "Adapta este afiche a formato vertical 9:16 para un estado de WhatsApp o una historia de Instagram. Mantén exactamente el mismo texto, los colores y la imagen. No añadas texto nuevo."
  );
  assert.equal(
    renderPlantilla(opcion(5, "cuadrado").prompt!, contexto()),
    "Adapta este afiche a formato cuadrado 1:1 para un post. Mantén exactamente el mismo texto, los colores y la imagen. No añadas texto nuevo."
  );
  assert.equal(
    renderPlantilla(opcion(5, "mensaje").prompt!, contexto()),
    "Escribe un mensaje corto de WhatsApp, de 2 o 3 líneas, para enviar mi afiche. Usa solo estos datos: Combo de fin de semana: 6 panes y 1 pan dulce por $6; Sábado y domingo, de 7:00 a 13:00; Panadería La Espiga, Av. Ejemplo 123. No añadas descuentos, envíos ni ningún dato nuevo."
  );
  assert.ok(opcion(5, "mockup").avisos!.some((a) => a.texto === "Es una simulación para visualizar. No la uses como foto real de tu local."));
});

test("todos los prompts de todos los pasos, con el ejemplo y con todo vacío, salen sin llaves ni undefined", () => {
  const vacio = contexto(Object.fromEntries(datos.campos.map((c) => [c.id, ""])), {} as typeof perfilEspiga);
  for (const ctx of [contexto(), vacio, contexto({ ...ejemplo, foto: "Sí", donde: "IA de imagen", formatos: "Post cuadrado (1:1)" })]) {
    const plantillas = [datos.tarea, ...pasos.flatMap((p) => [p.prompt ?? "", ...(p.opciones ?? []).map((o) => o.prompt ?? "")])].filter(Boolean);
    assert.ok(plantillas.length >= 6);
    for (const t of plantillas) {
      const r = renderPlantilla(t, ctx);
      assert.ok(!/\{\{|\}\}|undefined|null|NaN/.test(r), r.slice(0, 120));
    }
  }
});

/* ───────────── opciones que siguen a los datos ───────────── */

test("paso 3: con «Canva» va primero Canva; con «IA de imagen», la IA de imagen; con «Aún no sé», Canva y se recomienda", () => {
  const ids = (donde: string) => opcionesDelPaso(paso(3), contexto({ ...ejemplo, donde })).map((o) => o.id);
  assert.deepEqual(ids("Canva"), ["canva", "ia-imagen"]);
  assert.deepEqual(ids("IA de imagen"), ["ia-imagen", "canva"]);
  assert.deepEqual(ids("Aún no sé"), ["canva", "ia-imagen"]);
  assert.deepEqual(ids(""), ["canva", "ia-imagen"]);
  const canva = opcion(3, "canva");
  assert.ok(canva.notas!.some((n) => n.texto.includes("más segura") && cumple(n.si, contexto({ ...ejemplo, donde: "Aún no sé" }))));
  assert.ok(!canva.notas!.some((n) => cumple(n.si, contexto())), "con «Canva» no hace falta recomendarla");
});

test("paso 5: solo se ven las salidas de los formatos marcados; sin formatos, ninguna (y sale el aviso)", () => {
  const ids = (formatos: string) => opcionesDelPaso(paso(5), contexto({ ...ejemplo, formatos })).map((o) => o.id);
  assert.deepEqual(ids("A4 impreso; Estado de WhatsApp o historia (9:16)"), ["imprimir", "mockup", "vertical", "mensaje"]);
  assert.deepEqual(ids("A4 impreso"), ["imprimir", "mockup"]);
  assert.deepEqual(ids("Post cuadrado (1:1)"), ["cuadrado", "mensaje"]);
  assert.deepEqual(ids("A4 impreso; Estado de WhatsApp o historia (9:16); Post cuadrado (1:1)"), ["imprimir", "mockup", "vertical", "cuadrado", "mensaje"]);
  assert.deepEqual(ids(""), []);
  assert.match(paso(5).sinOpciones!, /Marca al menos un formato/);
});

test("kit final: las mismas entregas que «Lo que vas a tener» (mismos ids) más la prueba impresa revisada", () => {
  const entregas = datos.resultadoFinal!.map((r) => r.id);
  assert.deepEqual(entregas, ["texto", "afiche", "versiones", "mockup", "mensaje"]);
  assert.deepEqual(datos.kitFinal!.map((k) => k.id), [...entregas, "prueba"]);
  const por = Object.fromEntries(datos.kitFinal!.map((k) => [k.id, k.texto]));
  assert.match(por.texto, /^Texto verificado/);
  assert.match(por.afiche, /^Afiche A4 en PDF/);
  assert.match(por.versiones, /9:16 y\/o 1:1/);
  assert.match(por.mockup, /simulación/);
  assert.match(por.mensaje, /WhatsApp/);
  assert.match(por.prueba, /^Prueba impresa revisada/);
});

test("kit final: las entregas de un formato salen si lo marcaste; con el formulario vacío y con el ejemplo salen todas las que aplican", () => {
  const ids = (formatos: string) => itemsVisiblesDelKit(datos.kitFinal!, contexto({ ...ejemplo, formatos })).map((i) => i.id);
  const todas = ["texto", "afiche", "versiones", "mockup", "mensaje", "prueba"];
  assert.deepEqual(ids("A4 impreso; Estado de WhatsApp o historia (9:16)"), todas, "con «Probar con un ejemplo» salen las 6");
  assert.deepEqual(ids(""), todas, "sin formatos marcados salen todas");
  assert.deepEqual(itemsVisiblesDelKit(datos.kitFinal!, contexto(Object.fromEntries(datos.campos.map((c) => [c.id, ""])), {} as typeof perfilEspiga)).map((i) => i.id), todas, "con todo el formulario vacío");
  assert.deepEqual(ids("Post cuadrado (1:1)"), ["texto", "afiche", "versiones", "mensaje"]);
  assert.deepEqual(ids("A4 impreso"), ["texto", "afiche", "mockup", "prueba"]);
  assert.deepEqual(ids("Estado de WhatsApp o historia (9:16); Post cuadrado (1:1)"), ["texto", "afiche", "versiones", "mensaje"]);
});

test("kit final: «X de N listos» cuenta solo lo que se ve (N = ítems visibles; X = marcados entre ellos)", () => {
  const resumen = (formatos: string, marcados: string[]) => resumenKit(datos.kitFinal!, contexto({ ...ejemplo, formatos }), marcados);
  assert.deepEqual(
    (({ hechos, total }) => ({ hechos, total }))(resumen("A4 impreso; Estado de WhatsApp o historia (9:16)", [])),
    { hechos: 0, total: 6 }
  );
  assert.deepEqual((({ hechos, total }) => ({ hechos, total }))(resumen("A4 impreso; Estado de WhatsApp o historia (9:16)", ["texto", "prueba"])), { hechos: 2, total: 6 });
  // Un ítem marcado que ya no se ve (quitaste el formato A4) no se cuenta: X nunca pasa de N.
  const sinA4 = resumen("Post cuadrado (1:1)", ["texto", "mockup", "prueba", "versiones"]);
  assert.deepEqual({ hechos: sinA4.hechos, total: sinA4.total }, { hechos: 2, total: 4 });
  assert.equal(resumen("", ["texto", "afiche", "versiones", "mockup", "mensaje", "prueba"]).hechos, 6);
  assert.ok(resumen("A4 impreso", ["texto"]).hechos <= resumen("A4 impreso", ["texto"]).total);
  assert.equal(resumen("A4 impreso", []).visibles.length, resumen("A4 impreso", []).total, "N coincide con las casillas que se dibujan");
});

/* ───────────── el esquema del piloto ───────────── */

test("el piloto tiene el contenido pedido: 5 resultados, 3 problemas, 4 necesidades (2 obligatorias), 5 pasos y kit", () => {
  assert.equal(datos.resultadoFinal!.length, 5);
  assert.equal(datos.problema!.length, 3);
  assert.deepEqual(datos.necesitas!.map((n) => n.obligatorio), [true, true, false, false]);
  assert.ok(datos.necesitas![2].alternativa && datos.necesitas![1].alternativa);
  assert.deepEqual(pasos.map((p) => [p.numero, p.tiempo]), [[1, "2 min"], [2, "1 min"], [3, "5 min"], [4, "2 min"], [5, "5 min"]]);
  assert.equal(datos.meta.tiempo, "15 min");
  assert.equal(datos.meta.herramientasExtra, "Canva");
  assert.equal(datos.meta.titulo, "Crea tu afiche completo, listo para imprimir y pegar en tu local");
  assert.ok(datos.meta.descripcion.length >= 140 && datos.meta.descripcion.length <= 160);
  assert.equal(datos.tituloRevision, "Revisa antes de imprimir");
  for (const p of pasos) {
    assert.ok(p.asiSabesQueSalioBien.length >= 2 && p.siAlgoFalla.length >= 1 && p.resultado && p.queHaces, `paso ${p.numero}`);
  }
  assert.deepEqual(paso(4).comprobar!.map((c) => c.campo), ["oferta", "precio", "diasHorario", "accion", "lugar", "condiciones"]);
  assert.ok(paso(2).promptMaestro && paso(2).mostrarMejoras);
});

test("el formulario tiene 3 campos nuevos (foto Sí/No, dónde, formatos) y «Probar con un ejemplo» los llena: foto=No, Canva, A4 + 9:16", () => {
  const por = Object.fromEntries(datos.campos.map((c) => [c.id, c]));
  assert.deepEqual(por.foto.opciones, ["Sí", "No"]);
  assert.deepEqual(por.donde.opciones, ["Canva", "IA de imagen", "Aún no sé"]);
  assert.equal(por.formatos.tipo, "casillas");
  assert.deepEqual(por.formatos.opciones, ["A4 impreso", "Estado de WhatsApp o historia (9:16)", "Post cuadrado (1:1)"]);
  assert.deepEqual([ejemplo.foto, ejemplo.donde, ejemplo.formatos], ["No", "Canva", "A4 impreso; Estado de WhatsApp o historia (9:16)"]);
  assert.ok(!("tamano" in por) && !("herramienta" in por), "el tamaño y la herramienta de diseño los sustituyen «dónde» y «formatos»");
});

test("las casillas se dibujan con fieldset, legend, casillas de 44 px y las opciones marcadas", () => {
  const campo = datos.campos.find((c) => c.id === "formatos")!;
  const html = renderToStaticMarkup(createElement(FormularioHerramienta, { campos: [campo], valores: { formatos: "A4 impreso; Post cuadrado (1:1)" }, onCambio: () => {} }));
  assert.match(html, /<fieldset/);
  assert.match(html, /<legend[^>]*>¿Qué formatos necesitas\?/);
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, 3);
  assert.equal((html.match(/checked=""/g) ?? []).length, 2);
  assert.ok((html.match(/min-h-11/g) ?? []).length >= 3);
});

/* ───────────── validación ───────────── */

/** La página de afiches SIN las imágenes que ya existen en disco (next/image no se puede dibujar en estos tests; lo cubre `npm run qa`). */
async function base(): Promise<HerramientaCargada> {
  const h = (await listarTodas()).find((x) => x.meta.slug === "crear-afiches-con-ia")!;
  return { ...h, imagenes: h.imagenes.filter((i) => !buscarArchivo(h.meta.area, h.meta.slug, i.archivo)) };
}
const ctxValidacion = (h: Herramienta) => ({ existeImagen: () => true, existentes: new Set([`${h.meta.area}/${h.meta.slug}`, ...h.relacionadas]), publicadas: new Set<string>() });
const errores = (h: Herramienta) => validarHerramienta(h, ctxValidacion(h)).errores;
const conPasos = (h: Herramienta, cambio: (p: PasoProceso[]) => PasoProceso[]): Herramienta => ({ ...h, pasos: cambio(structuredClone(pasosDelProceso(h)!)) });

test("validador: el piloto pasa sin errores y las plantillas rotas se detectan", async () => {
  const h = await base();
  assert.deepEqual(errores(h), []);
  assert.ok(errores(conPasos(h, (p) => { p[1].prompt = "{{noExiste}}"; delete p[1].promptMaestro; return p; })).some((e) => /noExiste/.test(e)), "marca inexistente");
  assert.ok(errores(conPasos(h, (p) => { p[2].opciones![1].prompt = "{{#si foto=Tal vez}}x{{/si}}"; return p; })).some((e) => /Tal vez/.test(e)), "valor de una opción que no existe");
  assert.ok(errores(conPasos(h, (p) => { p[2].opciones![1].prompt = "{{#si foto}}{{#si donde}}x{{/si}}{{/si}}"; return p; })).some((e) => /anidar/.test(e)));
  assert.ok(errores(conPasos(h, (p) => { p[2].opciones![1].prompt = "{{perfil.contacto}}"; return p; })).some((e) => /perfil/.test(e)), "un dato del perfil que la herramienta no usa");
  assert.ok(errores(conPasos(h, (p) => { p[4].opciones![0].mostrarSi = "formatos~Cartel"; return p; })).some((e) => /Cartel/.test(e)));
  assert.ok(errores(conPasos(h, (p) => { p[3].comprobar![0].campo = "nada"; return p; })).some((e) => /nada/.test(e)));
});

test("validador: pasos numerados en orden, ≥2 comprobaciones, tiempo «N min», un solo promptMaestro y campos completos", async () => {
  const h = await base();
  assert.ok(errores(conPasos(h, (p) => { p[2].numero = 7; return p; })).some((e) => /numerados/.test(e)));
  assert.ok(errores(conPasos(h, (p) => { p[0].asiSabesQueSalioBien = ["solo una"]; return p; })).some((e) => /asiSabes/.test(e)));
  assert.ok(errores(conPasos(h, (p) => { p[0].siAlgoFalla = []; return p; })).some((e) => /siAlgoFalla/.test(e)));
  assert.ok(errores(conPasos(h, (p) => { p[0].tiempo = "dos minutos"; return p; })).some((e) => /tiempo/.test(e)));
  assert.ok(errores(conPasos(h, (p) => { p[0].promptMaestro = true; return p; })).some((e) => /promptMaestro/.test(e)));
  assert.ok(errores({ ...h, problema: h.problema!.slice(0, 2) }).some((e) => /problema/.test(e)));
  assert.ok(errores({ ...h, necesitas: h.necesitas!.map((n) => ({ ...n, obligatorio: false })) }).some((e) => /obligatorio/.test(e)));
  assert.ok(errores({ ...h, resultadoFinal: h.resultadoFinal!.slice(0, 2) }).some((e) => /resultadoFinal/.test(e)));
  assert.ok(errores({ ...h, kitFinal: h.kitFinal!.slice(0, 2) }).some((e) => /kitFinal/.test(e)));
  const simple = { ...h, pasos: ["a", "b", "c"] as [string, string, string] };
  assert.ok(errores(simple).some((e) => /solo se usan con «pasos» de proceso/.test(e)), "los campos de proceso sin pasos de proceso");
});

test("validador: casillas con opciones válidas, sin «;» y con un ejemplo que sea de esas opciones", async () => {
  const h = await base();
  const con = (cambio: Partial<Herramienta["campos"][number]>): Herramienta => ({ ...h, campos: h.campos.map((c) => (c.id === "formatos" ? { ...c, ...cambio } : c)) });
  assert.ok(errores(con({ ejemplo: "Cartel gigante" })).some((e) => /formatos/.test(e)));
  assert.ok(errores(con({ opciones: ["Solo una"] })).some((e) => /necesitan opciones/.test(e)));
  assert.ok(errores(con({ opciones: ["A; B", "C"] })).some((e) => /;/.test(e)));
});

/* ───────────── «Qué corregí yo» y la página ───────────── */

test("la página de proceso sale con los 13 bloques en su orden, sin recuadros de captura pendiente, sin {{ }} y sin anuncios dentro de la herramienta", async () => {
  const h = await base();
  const html = renderToStaticMarkup(createElement(PaginaHerramienta, { herramienta: h, relacionadas: [] }));
  const ids = [...html.matchAll(/<section aria-labelledby="([a-z-]+)-titulo"/g)].map((m) => m[1]).filter((id) => id !== "conteo-palabras");
  assert.deepEqual(ids, ["resultado", "problema", "necesitas", "herramienta", "proceso", "kit", "ejemplo", "revision", "por-que-funciona", "rubros", "errores", "faq", "verificacion"]);
  const t = texto(html);
  assert.ok(t.includes("Crea tu afiche completo, listo para imprimir y pegar en tu local"));
  assert.ok(t.includes("15 min") && t.includes("Gratis") && t.includes("ChatGPT, Gemini o Claude + Canva"));
  assert.ok(t.includes("Lo que vas a tener en 15 minutos"));
  for (const titulo of ["El problema", "Qué necesitas", "Tus datos", "El proceso", "Tu kit final", "Un ejemplo, paso a paso", "Revisa antes de imprimir"]) assert.ok(t.includes(titulo), titulo);
  for (let n = 1; n <= 5; n++) assert.ok(t.includes(`Paso ${n} de 5`), `Paso ${n} de 5`);
  assert.ok(t.includes("Obligatorio") && t.includes("Opcional") && t.includes("Alternativa:"));
  assert.ok(!/border-dashed|captura pendiente|data-capturas-pendientes/.test(html), "ningún recuadro de pendiente en producción");
  assert.ok(!/\{\{|\}\}|undefined|\bnull\b/.test(html.replace(/<script[\s\S]*?<\/script>/g, "")));
  assert.ok(!html.includes("La IA cambió"), "la nota preparada no se ve sin captura");
  // Un solo botón por prompt, con nombre accesible propio (el paso 5 sin formatos no trae prompts).
  const botones = [...html.matchAll(/aria-label="(Copiar prompt del paso [^"]+)"/g)].map((m) => m[1]);
  assert.ok(botones.some((b) => b.startsWith("Copiar prompt del paso 2")) && botones.some((b) => b.startsWith("Copiar prompt del paso 3: B) Con una IA de imagen")), botones.join(" | "));
  assert.equal(new Set(botones).size, botones.length, "los nombres de los botones Copiar son distintos");
  // La plantilla simple no cambia: otra herramienta sigue con «Cómo usarlo».
  const otra = (await listarTodas()).find((x) => x.meta.slug === "crear-anuncios-con-ia")!;
  const htmlOtra = renderToStaticMarkup(createElement(PaginaHerramienta, { herramienta: { ...otra, imagenes: [], metodoCompleto: null }, relacionadas: [] }));
  assert.ok(texto(htmlOtra).includes("Cómo usarlo") && !texto(htmlOtra).includes("Tu kit final"));
});
