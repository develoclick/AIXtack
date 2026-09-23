import assert from "node:assert/strict";
import { test } from "node:test";
import { ErrorExpresion, evaluar, idsUsados } from "./expresiones";

test("precedencia y paréntesis", () => {
  assert.equal(evaluar("2 + 3 * 4", {}), 14);
  assert.equal(evaluar("(2 + 3) * 4", {}), 20);
  assert.equal(evaluar("10 - 4 - 3", {}), 3);
  assert.equal(evaluar("-2 * -3", {}), 6);
  assert.equal(evaluar("8 / 2 / 2", {}), 2);
});

test("variables y decimales", () => {
  assert.equal(evaluar("a * 1.5 + .5", { a: 2 }), 3.5);
  assert.equal(evaluar("precio_normal - costo", { precio_normal: 4.5, costo: 1.3 })!.toFixed(2), "3.20");
});

test("comparaciones y lógica devuelven 1 o 0", () => {
  assert.equal(evaluar("3 > 2", {}), 1);
  assert.equal(evaluar("3 < 2", {}), 0);
  assert.equal(evaluar("0.2 <= 0.2", {}), 1);
  assert.equal(evaluar("1 == 1 && 2 != 2", {}), 0);
  assert.equal(evaluar("1 == 2 || 5 >= 5", {}), 1);
  assert.equal(evaluar("!0", {}), 1);
});

test("funciones", () => {
  assert.equal(evaluar("min(4; 2; 9)", {}), 2);
  assert.equal(evaluar("max(4, 2, 9)", {}), 9);
  assert.equal(evaluar("abs(-3.5)", {}), 3.5);
  assert.equal(evaluar("round(2.675; 2)", {}), 2.68);
  assert.equal(evaluar("techo(23.7)", {}), 24);
  assert.equal(evaluar("piso(23.7)", {}), 23);
  assert.equal(evaluar("si(2 > 1; 10; 20)", {}), 10);
  assert.equal(evaluar("si(2 < 1; 10; 20)", {}), 20);
});

test("un dato ausente o una división entre cero dan null y se propagan", () => {
  assert.equal(evaluar("a + 1", {}), null);
  assert.equal(evaluar("a + 1", { a: null }), null);
  assert.equal(evaluar("1 / 0", {}), null);
  assert.equal(evaluar("(1 / 0) + 5", {}), null);
  assert.equal(evaluar("si(a > 0; 1; 2)", {}), null);
});

test("las expresiones no válidas fallan con un mensaje, no se ejecutan", () => {
  assert.throws(() => evaluar("2 +", {}), ErrorExpresion);
  assert.throws(() => evaluar("2 $ 3", {}), ErrorExpresion);
  assert.throws(() => evaluar("foo(1)", {}), ErrorExpresion);
  assert.throws(() => evaluar("si(1; 2)", {}), ErrorExpresion);
  assert.throws(() => evaluar("(1 + 2", {}), ErrorExpresion);
  assert.throws(() => evaluar("1 2", {}), ErrorExpresion);
  // Nada de código: una llamada arbitraria o un acceso a propiedades no se interpreta.
  assert.throws(() => evaluar("process.exit(1)", {}), ErrorExpresion);
  assert.throws(() => evaluar("constructor('x')()", {}), ErrorExpresion);
});

test("idsUsados lista las variables de una fórmula", () => {
  assert.deepEqual(idsUsados("si(margenDespues > 0; margenAntes / margenDespues - 1; 0)").sort(), ["margenAntes", "margenDespues"]);
});
