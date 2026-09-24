/**
 * Piloto /marketing/crear-afiches-con-ia: «Probar con un ejemplo» debe producir un prompt del que salgan, sin
 * cambiar una letra, los cuatro niveles del caso La Espiga (ficticio).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EjemploReal } from "../../components/herramientas/ejemplo-real";
import { construirPrompt } from "../prompts/construir-prompt";
import datos from "../../content/herramientas/marketing/crear-afiches-con-ia";
import type { Herramienta } from "./tipos";
import { contarPalabras, validarHerramienta } from "./validar";

const ejemplo = Object.fromEntries(datos.campos.map((c) => [c.id, c.ejemplo]));
const campos = datos.campos.map((c) => ({ id: c.id, label: c.label, valor: ejemplo[c.id], requerido: c.requerido }));
const perfil = { nombre: "Panadería La Espiga", direccion: "Av. Ejemplo 123", tono: "Cercano" };

const N = {
  n1: "Combo de fin de semana: 6 panes y 1 pan dulce por $6",
  n2: "Sábado y domingo, de 7:00 a 13:00",
  n3: "Entrar a comprar el combo · Panadería La Espiga, Av. Ejemplo 123",
  n4: "Hasta agotar existencias. Máximo 2 combos por persona.",
};

test("los niveles del caso salen de los campos por composición directa (sin reformular nada)", () => {
  assert.equal(`${ejemplo.oferta} por ${ejemplo.precio}`, N.n1);
  assert.equal(ejemplo.diasHorario, N.n2);
  assert.equal(`${ejemplo.accion} · ${ejemplo.lugar}`, N.n3);
  assert.equal(ejemplo.condiciones, N.n4);
});

test("el ejemplo de la página muestra exactamente esos cuatro niveles", () => {
  const r = datos.ejemplo.resultado!;
  assert.equal(r["Nivel 1 · Titular"], N.n1);
  assert.equal(r["Nivel 2 · Apoyo"], N.n2);
  assert.equal(r["Nivel 3 · Acción y contacto"], N.n3);
  assert.equal(r["Nivel 4 · Letra pequeña"], N.n4);
});

test("los cuatro niveles suman 39 palabras: menos de 40, el límite de la herramienta", () => {
  const total = contarPalabras(Object.values(N).map((t) => t.replace(/·/g, " ")));
  assert.equal(total, 39);
  assert.ok(total < 40);
  assert.match(datos.tarea, /deben sumar menos de 40 palabras/);
  assert.match(datos.tarea, /el total es menos de 40 palabras/);
});

test("toda la página y el prompt dicen «menos de 40 palabras»: ninguna otra forma ni otro tope", () => {
  const todo = JSON.stringify(datos);
  assert.ok(!/40 palabras o más|menor de 40|por debajo de 40|30 palabras|50 palabras/.test(todo), "otra forma de expresar el tope");
  const topes = [...todo.matchAll(/(\d+) palabras/g)].map((m) => m[1]);
  // Los únicos números de palabras que aparecen son el tope (40) y el total del ejemplo (39).
  assert.deepEqual([...new Set(topes)].sort(), ["39", "40"]);
  assert.ok((todo.match(/menos de 40 palabras/g) ?? []).length >= 4);
});

test("nivel 1: el prompt del ejemplo pide exactamente «{oferta} por {precio}» (…por $6) y lo repite en la autorrevisión", () => {
  const prompt = construirPrompt(perfil, campos, null, datos.tarea, { usaPerfil: datos.usaPerfil });
  const exacto = `exactamente «${N.n1}»`;
  assert.equal(prompt.split(exacto).length - 1, 2, "el nivel 1 exacto sale en la tarea y en la autorrevisión");
  assert.ok(N.n1.endsWith("por $6"));
  // Sin precio, el hueco se marca en lugar de inventarse.
  const sinPrecio = campos.map((c) => (c.id === "precio" ? { ...c, valor: "" } : c));
  assert.match(construirPrompt(perfil, sinPrecio, null, datos.tarea, { usaPerfil: datos.usaPerfil }), /por \[FALTA: Precio\]/);
});

test("colores de La Espiga: #5A3A22 sobre #F4E9D8 en el ejemplo y en el brief, con contraste suficiente (≥ 4,5:1)", () => {
  assert.equal(ejemplo.colores, "Texto #5A3A22 sobre fondo #F4E9D8");
  const prompt = construirPrompt(perfil, campos, null, datos.tarea, { usaPerfil: datos.usaPerfil });
  assert.ok(prompt.includes("- Colores de tu marca: Texto #5A3A22 sobre fondo #F4E9D8"));
  assert.match(prompt, /Usa exactamente los colores que te di/);
  const luz = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [a, b] = [luz("#5A3A22"), luz("#F4E9D8")];
  assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5);
  // Es un dato opcional: sin él, el prompt no lo menciona y el brief no inventa colores.
  const sin = campos.map((c) => (c.id === "colores" ? { ...c, valor: "" } : c));
  assert.ok(!construirPrompt(perfil, sin, null, datos.tarea, { usaPerfil: datos.usaPerfil }).includes("- Colores de tu marca:"));
});

test("transcripcion: vacía hasta la prueba; solo se dibuja el bloque plegable si existe, y sin prueba (IA y fecha) una publicada falla", async () => {
  assert.equal((datos.ejemplo.transcripcion ?? "").trim(), "", "no se inventa una respuesta de la IA");
  const base = { ejemplo: datos.ejemplo, datos: [], pendientes: [] };
  const sin = renderToStaticMarkup(createElement(EjemploReal, { ...base }));
  assert.ok(!sin.includes("Respuesta completa de la IA"));
  const con = renderToStaticMarkup(createElement(EjemploReal, { ...base, ejemplo: { ...datos.ejemplo, capturas: [], transcripcion: "Texto de prueba de la respuesta de la IA.\nSegunda línea." } }));
  assert.match(con, /<details/);
  assert.ok(con.includes("Respuesta completa de la IA (transcripción del mismo chat)"));
  assert.ok(con.includes("Segunda línea."));
  const h = { ...datos, ejemplo: { ...datos.ejemplo, transcripcion: "Respuesta real pegada aquí, con bastante texto." } } as Herramienta;
  const ctx = { existeImagen: () => true, existentes: new Set<string>(), publicadas: new Set<string>() };
  const sinPrueba = validarHerramienta({ ...h, publicado: true, meta: { ...h.meta, probadoEn: null, probadoFecha: null } }, ctx);
  assert.ok(sinPrueba.errores.some((e) => e.includes("transcripcion")));
  const borrador = validarHerramienta({ ...h, publicado: false }, ctx);
  assert.ok(!borrador.errores.some((e) => e.includes("transcripcion")) && borrador.avisos.some((e) => e.includes("transcripcion")), "borrador: solo aviso");
});

test("el prompt del ejemplo contiene cada dato tal cual y ninguna llave", () => {
  const prompt = construirPrompt(perfil, campos, null, datos.tarea, { usaPerfil: datos.usaPerfil });
  for (const valor of Object.values(ejemplo)) assert.ok(prompt.includes(valor), `falta «${valor}»`);
  assert.equal(/\{\{|\}\}/.test(prompt), false);
  assert.equal(/^- .*: \[FALTA\]/m.test(prompt), false, "con el ejemplo completo no queda ningún hueco en los datos");
  assert.equal(prompt.includes("[FALTA: Herramienta"), false);
  assert.match(prompt, /DATOS DE MI NEGOCIO\n- Nombre del negocio: Panadería La Espiga\n- Dirección: Av\. Ejemplo 123\n- Tono: Cercano/);
  assert.match(prompt, /en Canva, tamaño A4/);
});

test("el prompt pide las tres cosas y fija las reglas del método", () => {
  const prompt = construirPrompt(perfil, campos, null, datos.tarea, { usaPerfil: datos.usaPerfil });
  for (const parte of ["TEXTO DEL AFICHE", "BRIEF PARA DISEÑAR", "PROMPT DE IMAGEN SIN TEXTO", "sin letras, números, logotipos ni carteles", "no afirmes que un par cumple", "nunca un dato ni una condición", "No uses superlativos", "Autorrevisión"]) {
    assert.ok(prompt.includes(parte), `falta «${parte}»`);
  }
});

test("sin datos, cada campo requerido queda como [FALTA] y la tarea también", () => {
  const vacios = datos.campos.map((c) => ({ id: c.id, label: c.label, valor: "", requerido: c.requerido }));
  const prompt = construirPrompt({}, vacios, null, datos.tarea, { usaPerfil: datos.usaPerfil });
  for (const c of datos.campos.filter((x) => x.requerido)) assert.ok(prompt.includes(`- ${c.label}: [FALTA]`), `falta el hueco de «${c.label}»`);
  assert.equal(prompt.includes("- Condiciones:"), false, "condiciones es opcional: se omite");
  assert.match(prompt, /BRIEF PARA DISEÑAR en \[FALTA: Herramienta de diseño\], tamaño \[FALTA: Tamaño\]/);
  assert.equal(/\{\{|\}\}/.test(prompt), false);
});

test("el piloto solo está publicado si tiene su prueba real (IA y fecha) y ninguna captura pendiente", () => {
  if (datos.publicado) {
    assert.ok(datos.meta.probadoEn && datos.meta.probadoFecha, "publicado sin probadoEn/probadoFecha");
    assert.deepEqual(datos.capturasPendientes, []);
  } else {
    assert.equal(datos.meta.probadoEn, null);
    assert.equal(datos.meta.probadoFecha, null);
  }
});
