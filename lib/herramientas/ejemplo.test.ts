/**
 * «Un ejemplo, paso a paso» = lo que genera «Probar con un ejemplo»: los datos mostrados son EXACTAMENTE los del formulario y
 * las cifras del resultado del ejemplo salen de lo que calcula la página con esos datos.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EjemploReal } from "../../components/herramientas/ejemplo-real";
import { calcular } from "./calculadora";
import { calculosDelEjemplo, datosDelEjemplo } from "./ejemplo";
import { listarTodas } from "./registro";

const escapar = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const numeros = (t: string) => (t.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => Number(n.replace(/,/g, "")));

test("los datos del ejemplo son exactamente los que rellena «Probar con un ejemplo»", async () => {
  for (const h of (await listarTodas()).filter((x) => !x.interna)) {
    const datos = datosDelEjemplo(h);
    const esperados = [...h.campos.map((c) => [c.label, c.ejemplo]), ...(h.calculadora?.entradas.map((e) => [e.label, String(e.ejemplo)]) ?? [])].filter(([, v]) => v.trim() !== "");
    assert.deepEqual(datos.map((d) => [d.etiqueta, d.valor]), esperados, h.meta.slug);
    const html = renderToStaticMarkup(createElement(EjemploReal, { ejemplo: { ...h.ejemplo, capturas: [] }, datos, calculos: calculosDelEjemplo(h) }));
    assert.match(html, /Datos del ejemplo/);
    for (const d of datos.filter((x) => x.valor.length <= 240 && !x.valor.includes("\n"))) assert.ok(html.includes(escapar(d.valor)), `${h.meta.slug}: falta «${d.valor.slice(0, 50)}» en el ejemplo`);
    for (const d of datos.filter((x) => x.valor.length > 240 || x.valor.includes("\n"))) assert.ok(html.includes(escapar(d.valor)), `${h.meta.slug}: el texto largo de «${d.etiqueta}» debe estar completo (plegado)`);
  }
});

test("calculadoras y analizadores: la página muestra lo que calcula con los datos del ejemplo", async () => {
  for (const h of (await listarTodas()).filter((x) => !x.interna && (x.calculadora || x.preproceso))) {
    const calc = calculosDelEjemplo(h);
    assert.ok(calc.length >= 3, `${h.meta.slug}: sin cálculos del ejemplo`);
    const html = renderToStaticMarkup(createElement(EjemploReal, { ejemplo: { ...h.ejemplo, capturas: [] }, datos: datosDelEjemplo(h), calculos: calc }));
    for (const c of calc) assert.ok(html.includes(escapar(c.texto)), `${h.meta.slug}: ${c.etiqueta}`);
  }
});

test("las cifras de «Resultado del ejemplo» de las calculadoras salen de los cálculos o de los datos del ejemplo", async () => {
  for (const h of (await listarTodas()).filter((x) => !x.interna && (x.calculadora || x.preproceso) && x.ejemplo.resultado)) {
    // También valen las cifras de los casos de prueba de la calculadora (por ejemplo, las otras promociones del caso).
    const deCasos = (h.calculadora?.casosDePrueba ?? []).flatMap((caso) => calcular(h.calculadora!, caso.entradas).resultados.flatMap((r) => (r.texto ? numeros(r.texto) : [])));
    const validos = new Set<number>([...deCasos, ...calculosDelEjemplo(h).flatMap((c) => numeros(c.texto)), ...datosDelEjemplo(h).flatMap((d) => numeros(d.valor)), ...h.campos.flatMap((c) => numeros(c.ejemplo))]);
    for (const [clave, valor] of Object.entries(h.ejemplo.resultado!)) {
      const coincide = (n: number) => validos.has(n) || [...validos].some((v) => Math.round(v * 10) / 10 === n); // «43.3» = 43.33 redondeado
      const raros = numeros(`${valor}`).filter((n) => !coincide(n) && n > 9);
      assert.deepEqual(raros, [], `${h.meta.slug} · ${clave}: cifras que la página no calcula con el ejemplo: ${raros.join(", ")}`);
    }
  }
});
