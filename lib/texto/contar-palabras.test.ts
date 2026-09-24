/**
 * contarPalabras(): qué cuenta como palabra. Cada caso está documentado en la propia función.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { contarPalabras } from "./contar-palabras";

test("una palabra es un trozo con al menos una letra o un número: «$6», «7:00», «2» cuentan; «·» no", () => {
  assert.equal(contarPalabras("$6"), 1);
  assert.equal(contarPalabras("7:00"), 1);
  assert.equal(contarPalabras("13:00"), 1);
  assert.equal(contarPalabras("2"), 1);
  assert.equal(contarPalabras("1.500"), 1);
  assert.equal(contarPalabras("·"), 0);
  assert.equal(contarPalabras("—"), 0);
  assert.equal(contarPalabras("-"), 0);
  assert.equal(contarPalabras("&"), 0);
  assert.equal(contarPalabras("…"), 0);
});

test("la puntuación pegada a una palabra no la separa; un guion la une", () => {
  assert.equal(contarPalabras("Combo:"), 1);
  assert.equal(contarPalabras("Av. Ejemplo 123"), 3);
  assert.equal(contarPalabras("pan-dulce"), 1);
  assert.equal(contarPalabras("Sábado y domingo, de 7:00 a 13:00"), 7);
  assert.equal(contarPalabras("7 : 00"), 2);
});

test("letras con tildes, eñes y otros alfabetos cuentan; vacío y solo espacios, 0; saltos de línea separan", () => {
  assert.equal(contarPalabras("Panadería La Espiga, añejo"), 4);
  assert.equal(contarPalabras("пан хлеб"), 2);
  assert.equal(contarPalabras(""), 0);
  assert.equal(contarPalabras("   \n\t "), 0);
  assert.equal(contarPalabras("uno\ndos\r\ntres"), 3);
  assert.equal(contarPalabras("  uno    dos  "), 2);
});

test("una lista de textos se cuenta como un solo texto", () => {
  assert.equal(contarPalabras(["uno dos", "tres", "", "·", "$6"]), 4);
  assert.equal(contarPalabras([]), 0);
});

test("los cuatro niveles del afiche de La Espiga suman 39 (el «·» del nivel 3 no cuenta)", () => {
  const niveles = ["Combo de fin de semana: 6 panes y 1 pan dulce por $6", "Sábado y domingo, de 7:00 a 13:00", "Entrar a comprar el combo · Panadería La Espiga, Av. Ejemplo 123", "Hasta agotar existencias. Máximo 2 combos por persona."];
  assert.deepEqual(niveles.map(contarPalabras), [13, 7, 11, 8]);
  assert.equal(contarPalabras(niveles), 39);
});
