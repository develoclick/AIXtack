import assert from "node:assert/strict";
import { test } from "node:test";
import { conteoTemas, ejecutarPreproceso, normalizar, resumenVentas, verificarCasosPreproceso } from "./preprocesos";
import type { Preproceso } from "./tipos";

const resenas = [
  "Muy rica la comida, pero el servicio fue lento.",
  "La atención fue amable y el lugar es limpio.",
  "Demoraron mucho en traer la cuenta. Precios altos.",
  "Excelente sabor, volveré.",
  "El local estaba sucio y el mesero, lento.",
].join("\n");
const temas = "Servicio: lento, demora, atención\nLimpieza: limpio, sucio\nPrecio: precio, caro";

test("normalizar quita tildes y mayúsculas", () => {
  assert.equal(normalizar("ATENCIÓN Rápida"), "atencion rapida");
});

test("conteo por temas: cada reseña se cuenta una vez por tema y lo que no encaja queda «sin tema»", () => {
  const e = conteoTemas(resenas, temas);
  const v = (id: string) => e.resultados.find((r) => r.id === id)!;
  assert.equal(e.completo, true);
  assert.equal(v("resenas").valor, 5);
  assert.equal(v("tema:Servicio").valor, 4); // 1 (lento), 2 (atención), 3 (demoraron), 5 (lento)
  assert.equal(v("tema:Limpieza").valor, 2); // 2 (limpio), 5 (sucio)
  assert.equal(v("tema:Precio").valor, 1); // 3 (precios)
  assert.equal(v("sinTema").valor, 1); // 4: «Excelente sabor, volveré»
  assert.equal(v("tema:Servicio").texto, "4 de 5 (80.0 %)");
});

test("conteo por temas: una reseña con dos palabras del mismo tema no cuenta doble", () => {
  const e = conteoTemas("Lento y con mucha demora", "Servicio: lento, demora");
  assert.equal(e.resultados.find((r) => r.id === "tema:Servicio")!.valor, 1);
});

test("conteo por temas: entradas incompletas dan errores claros y no inventan conteos", () => {
  assert.equal(conteoTemas("", "Servicio: lento").completo, false);
  assert.match(conteoTemas("Una reseña", "sin dos puntos").errores.join(" "), /formato/);
  assert.equal(conteoTemas("Una reseña", "").completo, false);
});

const ventas = ["fecha;producto;cantidad;monto", "2026-03-01;Café;2;5.00", "2026-03-01;Croissant;1;2.00", "2026-03-02;Café;3;7.50", "2026-03-03;Jugo;1;3.00"].join("\n");

test("resumen de ventas: totales, días, promedio y control", () => {
  const e = resumenVentas(ventas);
  const v = (id: string) => e.resultados.find((r) => r.id === id)!;
  assert.equal(e.completo, true);
  assert.equal(v("filas").valor, 4);
  assert.equal(v("dias").valor, 3);
  assert.equal(v("total").valor, 17.5);
  assert.equal(v("unidades").valor, 7);
  assert.equal(v("promedioDia").valor!.toFixed(4), "5.8333");
  assert.equal(v("producto:Café").valor, 12.5);
  assert.equal(v("producto:Café").texto, "$12.50 (71.4 % del total) · 5.00 unidades");
  assert.equal(v("control").texto, "Sí");
});

test("resumen de ventas: separadores, coma decimal y símbolo de moneda del perfil", () => {
  const e = resumenVentas("01/03/2026, Pan, 2, \"3,50\"\n02/03/2026, Pan, 1, 1.75".replace('"3,50"', "3.50"), "S/");
  assert.equal(e.completo, true);
  assert.equal(e.resultados.find((r) => r.id === "total")!.texto, "S/ 5.25");
});

test("resumen de ventas: una línea mal formada se avisa y no se suma", () => {
  const e = resumenVentas("2026-03-01;Café;2;5.00\nesto no es una venta\n2026-03-02;Café;x;7.50");
  assert.equal(e.resultados.find((r) => r.id === "filas")!.valor, 1);
  assert.equal(e.errores.length, 2);
  assert.equal(e.completo, false);
});

test("los casos de prueba declarados se verifican y un caso roto se detecta", () => {
  const cfg: Preproceso = {
    tipo: "conteo-temas",
    campos: { texto: "resenas", temas: "temas" },
    casosDePrueba: [{ nombre: "ok", valores: { resenas, temas }, esperado: { resenas: 5, "tema:Servicio": 4, sinTema: 1 } }],
  };
  assert.deepEqual(verificarCasosPreproceso(cfg), []);
  const rota: Preproceso = { ...cfg, casosDePrueba: [{ nombre: "mal", valores: { resenas, temas }, esperado: { resenas: 6 } }] };
  assert.equal(verificarCasosPreproceso(rota).length, 1);
  assert.equal(ejecutarPreproceso(cfg, { resenas: "", temas: "" }).completo, false);
});
