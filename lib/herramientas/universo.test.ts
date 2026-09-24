/**
 * Universo de negocios de ejemplo (docs/universo-de-negocios.md): un mismo negocio tiene los mismos datos en todas las páginas,
 * la moneda es «$» y no hay ciudades reales.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { calcular } from "./calculadora";
import { CAMPOS_PERFIL } from "./perfil";
import { listarTodas } from "./registro";
import { textosVisibles } from "./validar";

const pagina = async (slug: string) => (await listarTodas()).find((h) => h.meta.slug === slug)!;

test("Café Mirador: precios fijos de las cuatro promociones (A 4.50/1.30/4.00, B 7.50/2.40/6.375, C 22.50/6.50/18.00, D 9.00/2.60/7.00; máx. 20 %)", async () => {
  const h = await pagina("crear-promociones-con-ia");
  const caso = (letra: string) => h.calculadora!.casosDePrueba.find((c) => c.nombre.startsWith(letra))!.entradas;
  assert.deepEqual([caso("A").precioNormal, caso("A").costo, caso("A").precioPromo], [4.5, 1.3, 4]);
  assert.deepEqual([caso("B").precioNormal, caso("B").costo, caso("B").precioPromo], [7.5, 2.4, 6.375]);
  assert.deepEqual([caso("C").precioNormal, caso("C").costo, caso("C").precioPromo], [22.5, 6.5, 18]);
  assert.deepEqual([caso("D").precioNormal, caso("D").costo, caso("D").precioPromo], [9, 2.6, 7]);
  for (const l of ["A", "B", "C", "D"]) assert.equal(caso(l).descuentoMaximo, 20);
  // El ejemplo de la página es la promoción A.
  const ej = Object.fromEntries(h.calculadora!.entradas.map((e) => [e.id, e.ejemplo]));
  assert.deepEqual([ej.precioNormal, ej.costo, ej.precioPromo, ej.descuentoMaximo], ["4.50", "1.30", "4.00", "20"]);
});

test("Café Mirador en el punto de equilibrio: gasto promedio por cliente, coherente con los precios de las promociones y sin repetir su descripción", async () => {
  const pe = await pagina("calcular-punto-de-equilibrio");
  const pr = await pagina("crear-promociones-con-ia");
  const ej = Object.fromEntries(pe.calculadora!.entradas.map((e) => [e.id, Number(e.ejemplo)]));
  assert.ok(ej.precio >= 2 && ej.precio <= 9, `gasto promedio ${ej.precio}: debe estar entre el producto más barato (2.00) y el combo más caro (9.00)`);
  assert.ok(ej.costoVariable > 0 && ej.costoVariable / ej.precio > 0.2 && ej.costoVariable / ej.precio < 0.4, "el costo variable es una proporción razonable de los costos de las promociones (24–37 %)");
  const texto = textosVisibles(pe).join("\n");
  assert.match(texto, /gasto promedio por cliente/);
  assert.doesNotMatch(texto, /pedido promedio de café/i);
  assert.notEqual(pe.ejemplo.negocio, pr.ejemplo.negocio);
  // El ejemplo se calcula y coincide con lo que dice la página.
  const r = calcular(pe.calculadora!, Object.fromEntries(pe.calculadora!.entradas.map((e) => [e.id, e.ejemplo])));
  assert.equal(r.resultados.find((x) => x.id === "unidadesMes")!.texto, "732");
  assert.equal(pe.ejemplo.resultado!["Ventas al mes para no perder"], "732 clientes = 3660 en dinero");
});

test("todos los ejemplos usan «$»: ni «S/», ni «€», ni otras monedas, y ninguna ciudad real", async () => {
  const perfil = CAMPOS_PERFIL.map((c) => c.ejemplo).join(" ");
  assert.match(perfil, /Ciudad de ejemplo/);
  assert.equal(CAMPOS_PERFIL.find((c) => c.clave === "moneda")!.ejemplo, "$");
  const reales = /\b(Lima|Bogotá|Medellín|Quito|Santiago|Buenos Aires|Ciudad de México|Montevideo|Madrid|Barcelona|Perú|Colombia|Chile|Argentina|México|Ecuador|España)\b/;
  for (const h of (await listarTodas()).filter((x) => !x.interna)) {
    const t = [...textosVisibles(h), ...h.campos.map((c) => c.ejemplo)].join("\n");
    assert.doesNotMatch(t, /\bS\/\s?\d|€|\bCOP\b|\bMXN\b|\bUSD\b|\bPEN\b/, `${h.meta.slug}: moneda distinta de «$»`);
    assert.doesNotMatch(t, reales, `${h.meta.slug}: menciona una ciudad o país real`);
  }
});

test("Fonda El Sabor, Estudio de uñas Brillo y Rincón: mismos costos fijos en punto de equilibrio y en precios y márgenes", async () => {
  const todo = async (slug: string) => textosVisibles(await pagina(slug)).join("\n");
  const pe = await todo("calcular-punto-de-equilibrio");
  const pm = await todo("calcular-precios-y-margenes");
  assert.match(pe, /Fonda El Sabor \(ficticia\): costos fijos de \$2,400/);
  assert.match(pm, /Fonda El Sabor \(ficticia\)[^\n]*?gastos fijos de \$2,400 con 1,600 platos al mes \(\$1\.50\)/);
  assert.match(pe, /Estudio de uñas Brillo \(ficticio\): costos fijos de \$900[^\n]*?materiales de \$2\.00/);
  assert.match(pm, /Estudio de uñas Brillo \(ficticio\): materiales \$2\.00[^\n]*?gastos fijos de \$900 con 300 servicios/);
  assert.match(pe, /Rincón \(ficticia\): costos fijos de \$1,500/);
  assert.match(pm, /Rincón \(ficticia\)[^\n]*?gastos fijos de \$1,500 con 600 ventas/);
});
