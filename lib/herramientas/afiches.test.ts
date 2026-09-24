/**
 * Piloto /marketing/crear-afiches-con-ia: «Probar con un ejemplo» debe producir un prompt del que salgan, sin
 * cambiar una letra, los cuatro niveles del caso La Espiga (ficticio).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { construirPrompt } from "../prompts/construir-prompt";
import datos from "../../content/herramientas/marketing/crear-afiches-con-ia";
import { contarPalabras } from "./validar";

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
  assert.match(datos.tarea, /40 palabras o más/);
  assert.match(datos.tarea, /menor de 40/);
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
