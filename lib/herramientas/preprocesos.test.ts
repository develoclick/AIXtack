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

const VERDE = [
  "2026-08-03;Monstera;2;36.00", "2026-08-03;Maceta;3;15.00", "2026-08-10;Helecho;4;40.00", "2026-08-10;Maceta;5;25.00",
  "2026-08-17;Pack de suculentas;3;45.00", "2026-08-17;Fertilizante;2;16.00", "2026-08-24;Monstera;1;18.00", "2026-08-24;Maceta;4;20.00",
  "2026-09-07;Monstera;1;18.00", "2026-09-07;Maceta;2;12.00", "2026-09-14;Helecho;3;30.00", "2026-09-14;Pack de suculentas;2;30.00",
  "2026-09-21;Fertilizante;3;24.00", "2026-09-21;Monstera;1;18.00",
].join("\n");

test("resumen de ventas por mes: total, días con ventas y promedio por día con ventas (caso Verde Hogar)", () => {
  const e = resumenVentas(VERDE);
  const v = (id: string) => e.resultados.find((r) => r.id === id)!;
  assert.equal(v("total").valor, 347);
  assert.equal(v("mes:2026-08").valor, 215);
  assert.equal(v("mes:2026-08").texto, "$215.00 · 4 días con ventas · $53.75 por día con ventas");
  assert.equal(v("mes:2026-09").texto, "$132.00 · 3 días con ventas · $44.00 por día con ventas");
  assert.equal(v("producto:Maceta").valor, 72);
  assert.equal(v("control").texto, "Sí");
});

test("resumen de ventas por mes: fechas DD/MM/AAAA y sin mes si alguna fecha no se entiende", () => {
  const latino = resumenVentas("05/03/2026;Pan;1;2\n20/04/2026;Pan;1;2");
  assert.ok(latino.resultados.some((r) => r.id === "mes:2026-03") && latino.resultados.some((r) => r.id === "mes:2026-04"));
  const raro = resumenVentas("marzo;Pan;1;2\n2026-04-20;Pan;1;2");
  assert.equal(raro.resultados.some((r) => r.id.startsWith("mes:")), false);
  assert.equal(raro.resultados.find((r) => r.id === "total")!.valor, 4);
});
