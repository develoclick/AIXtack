import assert from "node:assert/strict";
import { test } from "node:test";
import { calcular, formatear, leerNumero, verificarCasos } from "./calculadora";
import type { Calculadora } from "./tipos";

/** Fórmulas de la calculadora de promociones (caso Café Mirador) usadas para probar el motor. */
const promocion: Calculadora = {
  entradas: [
    { id: "precioNormal", label: "Precio normal de la canasta", unidad: "moneda", ejemplo: "4.50" },
    { id: "costo", label: "Costo de la canasta", unidad: "moneda", ejemplo: "1.30" },
    { id: "precioPromo", label: "Precio con promoción", unidad: "moneda", ejemplo: "4.00" },
    { id: "descuentoMaximo", label: "Descuento máximo", unidad: "porcentaje", ejemplo: "20", max: 100 },
  ],
  salidas: [
    { id: "margenAntes", etiqueta: "Margen antes", formula: "precioNormal - costo", formato: "moneda", decimales: 3 },
    { id: "descuentoReal", etiqueta: "Descuento real", formula: "(precioNormal - precioPromo) / precioNormal", formato: "porcentaje", decimales: 2 },
    { id: "margenDespues", etiqueta: "Margen después", formula: "precioPromo - costo", formato: "moneda", decimales: 3 },
    { id: "ventasNecesarias", etiqueta: "Ventas necesarias", formula: "margenAntes / si(margenDespues > 0; margenDespues; 0) - 1", formato: "porcentaje", decimales: 2 },
    { id: "respeta", etiqueta: "¿Respeta el límite?", formula: "descuentoReal <= descuentoMaximo && precioPromo >= costo", formato: "si-no" },
  ],
  casosDePrueba: [
    { nombre: "A · Combo", entradas: { precioNormal: 4.5, costo: 1.3, precioPromo: 4, descuentoMaximo: 20 }, esperado: { margenAntes: 3.2, margenDespues: 2.7, descuentoReal: 0.1111, ventasNecesarias: 0.1852, respeta: "Sí" } },
    { nombre: "B · Desayuno con 15 %", entradas: { precioNormal: 7.5, costo: 2.4, precioPromo: 6.375, descuentoMaximo: 20 }, esperado: { margenAntes: 5.1, margenDespues: 3.975, descuentoReal: 0.15, ventasNecesarias: 0.283, respeta: "Sí" } },
    { nombre: "C · Tarjeta de 5 visitas", entradas: { precioNormal: 22.5, costo: 6.5, precioPromo: 18, descuentoMaximo: 20 }, esperado: { margenAntes: 16, margenDespues: 11.5, descuentoReal: 0.2, ventasNecesarias: 0.3913, respeta: "Sí" } },
    { nombre: "D · Ven acompañado", entradas: { precioNormal: 9, costo: 2.6, precioPromo: 7, descuentoMaximo: 20 }, esperado: { margenAntes: 6.4, margenDespues: 4.4, descuentoReal: 0.2222, ventasNecesarias: 0.4545, respeta: "No" } },
  ],
};

test("los casos de prueba de la calculadora de promociones (Café Mirador) coinciden", () => {
  assert.deepEqual(verificarCasos(promocion), []);
});

test("textos con el formato de las capturas reales", () => {
  const b = calcular(promocion, { precioNormal: "7.50", costo: "2.40", precioPromo: "6.375", descuentoMaximo: "20" });
  const texto = (id: string) => b.resultados.find((r) => r.id === id)?.texto;
  assert.equal(texto("margenAntes"), "$5.100");
  assert.equal(texto("margenDespues"), "$3.975");
  assert.equal(texto("descuentoReal"), "15.00 %");
  assert.equal(texto("ventasNecesarias"), "28.30 %");
  assert.equal(texto("respeta"), "Sí");
  assert.equal(b.completo, true);
});

test("un precio con promoción bajo el costo: sin ventas necesarias y límite «No»", () => {
  const e = calcular(promocion, { precioNormal: 4.5, costo: 1.3, precioPromo: 1, descuentoMaximo: 20 });
  const r = (id: string) => e.resultados.find((x) => x.id === id)!;
  assert.equal(r("margenDespues").valor!.toFixed(2), "-0.30");
  assert.equal(r("margenDespues").texto, "-$0.300");
  assert.equal(r("ventasNecesarias").valor, null);
  assert.equal(r("ventasNecesarias").texto, null);
  assert.equal(r("respeta").texto, "No");
  assert.equal(e.completo, false);
});

test("entradas vacías, no numéricas o fuera de rango dan un error y ningún resultado inventado", () => {
  const e = calcular(promocion, { precioNormal: "", costo: "abc", precioPromo: "4", descuentoMaximo: "150" });
  assert.match(e.errores.precioNormal, /número/);
  assert.match(e.errores.costo, /solo números/);
  assert.equal(e.errores.precioPromo, undefined);
  assert.match(e.errores.descuentoMaximo, /100 o menos/);
  assert.equal(e.completo, false);
  // Con un dato inválido, ninguna cifra que dependa de él se inventa.
  assert.equal(e.resultados.find((r) => r.id === "margenAntes")!.valor, null);
  assert.equal(e.resultados.find((r) => r.id === "margenDespues")!.valor, null);
});

test("precio normal cero: el descuento real no se calcula (no divide entre cero)", () => {
  const e = calcular(promocion, { precioNormal: 0, costo: 0, precioPromo: 0, descuentoMaximo: 20 });
  assert.equal(e.resultados.find((r) => r.id === "descuentoReal")!.valor, null);
});

test("leerNumero acepta coma o punto decimal y separadores de miles", () => {
  assert.equal(leerNumero("12,5"), 12.5);
  assert.equal(leerNumero("12.5"), 12.5);
  assert.equal(leerNumero("1.234,5"), 1234.5);
  assert.equal(leerNumero("1,234.5"), 1234.5);
  assert.equal(leerNumero(" 7 "), 7);
  assert.equal(leerNumero("-3"), -3);
  assert.equal(leerNumero("abc"), null);
  assert.equal(leerNumero("1e5"), null);
  assert.equal(leerNumero(""), null);
  assert.equal(leerNumero(undefined), null);
});

test("formatear: moneda con símbolo del perfil, porcentaje, entero y sí/no", () => {
  assert.equal(formatear(2.7, "moneda", 2), "$2.70");
  assert.equal(formatear(2.7, "moneda", 2, "S/"), "S/ 2.70");
  assert.equal(formatear(2.7, "moneda", 2, "€"), "€2.70");
  assert.equal(formatear(0.185185, "porcentaje", 1), "18.5 %");
  assert.equal(formatear(23.7, "entero", undefined), "24");
  assert.equal(formatear(1, "si-no", undefined), "Sí");
  assert.equal(formatear(0, "si-no", undefined), "No");
  assert.equal(formatear(0.005, "moneda", 2), "$0.01");
});

test("verificarCasos detecta un resultado que no coincide", () => {
  const rota: Calculadora = { ...promocion, casosDePrueba: [{ nombre: "mal", entradas: { precioNormal: 4.5, costo: 1.3, precioPromo: 4, descuentoMaximo: 20 }, esperado: { margenAntes: 99 } }] };
  assert.equal(verificarCasos(rota).length, 1);
});

test("una entrada opcional vacía vale su valor por defecto (0 si no se indica) y no bloquea el resultado", () => {
  const suma: Calculadora = {
    entradas: [
      { id: "a", label: "A", ejemplo: "2" },
      { id: "b", label: "B (opcional)", ejemplo: "3", requerido: false },
      { id: "c", label: "C (opcional, por defecto 10)", ejemplo: "1", requerido: false, porDefecto: 10 },
    ],
    salidas: [{ id: "total", etiqueta: "Total", formula: "a + b + c", formato: "numero", decimales: 0 }],
    casosDePrueba: [],
  };
  const vacio = calcular(suma, { a: "2", b: "", c: "" });
  assert.equal(vacio.resultados[0].valor, 12);
  assert.equal(vacio.completo, true);
  assert.equal(calcular(suma, { a: "2", b: "3", c: "1" }).resultados[0].valor, 6);
  assert.equal(calcular(suma, { a: "", b: "3", c: "1" }).completo, false);
});

test("una salida opcional sin datos queda en «—», no bloquea `completo` y no se marca [FALTA]", () => {
  const c: Calculadora = {
    entradas: [
      { id: "a", label: "A", ejemplo: "10" },
      { id: "extra", label: "Extra (opcional)", ejemplo: "5", requerido: false },
    ],
    salidas: [
      { id: "doble", etiqueta: "Doble", formula: "a * 2", formato: "numero", decimales: 0 },
      { id: "conExtra", etiqueta: "Con extra", formula: "si(extra > 0; a + extra; 0 / 0)", formato: "numero", decimales: 0, opcional: true },
    ],
    casosDePrueba: [],
  };
  const sin = calcular(c, { a: "10" });
  assert.equal(sin.resultados[1].valor, null);
  assert.equal(sin.resultados[1].opcional, true);
  assert.equal(sin.completo, true);
  assert.equal(calcular(c, { a: "10", extra: "5" }).resultados[1].valor, 15);
});
