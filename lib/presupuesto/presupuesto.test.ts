import assert from "node:assert/strict";
import { test } from "node:test";
import { EJEMPLOS_PRESUPUESTO } from "../../content/ejemplos/presupuesto-viaje";
import { calcular, diasDelViaje, margenDeReferencia, nochesDelViaje, parsearNumero } from "./calculo";
import { aCsv, aTabla, filasDeTabla } from "./exportar";
import { leerRespuestaPresupuesto } from "./lector";
import { GASTOS_OLVIDADOS, gastosQueFaltan, lineaDeGasto, revisarCoherencia } from "./olvidados";
import { construirPromptPresupuesto, datosMinimosPresupuesto, progresoPresupuesto, textoDeFuente, TITULOS_RESPUESTA } from "./prompt";
import { CATEGORIAS_GASTO, datosVaciosPresupuesto, lineaVaciaDe } from "./tipos";
import { cifrasNuevas, faltantesConPrecio, lineaDeFalta, yaEstaEnLaTabla } from "./verificar";

const [cusco, paracas, santiago] = EJEMPLOS_PRESUPUESTO;

test("parsearNumero acepta los formatos que la gente escribe y rechaza lo que no es un número", () => {
  const casos: [string, number | null][] = [
    ["1500", 1500],
    ["1,500", 1500],
    ["1.500", 1500],
    ["1 500", 1500],
    ["1234.50", 1234.5],
    ["1.234,50", 1234.5],
    ["1,234.50", 1234.5],
    ["12,5", 12.5],
    ["0.500", 0.5],
    ["S/ 150", 150],
    ["3.75", 3.75],
    ["", null],
    ["abc", null],
    ["-20", null],
    ["1.2.3", null],
  ];
  for (const [entrada, esperado] of casos) assert.equal(parsearNumero(entrada), esperado, entrada);
});

test("el ejemplo de la pareja en Cusco se recalcula a mano: 3,150 + 315 = 3,465 y 1,732.50 por persona", () => {
  const c = calcular(cusco.datos);
  assert.deepEqual(c.lineas.map((l) => l.total), [900, 80, 750, 720, 500, 200]);
  assert.equal(c.escenarios.intermedio.subtotal, 3150);
  assert.equal(c.escenarios.intermedio.imprevistos, 315);
  assert.equal(c.escenarios.intermedio.total, 3465);
  assert.equal(c.escenarios.intermedio.porPersona, 1732.5);
  // 1,000 estimados (80 + 720 + 200) sobre 3,465 = 28.9 %; 2,150 conocidos = 62.0 %; 315 de imprevistos = 9.1 %.
  assert.equal(c.reparto.estimado, 1000);
  assert.equal(c.reparto.conocido, 2150);
  assert.equal(Math.round(c.porcentajes.estimado * 10) / 10, 28.9);
  assert.equal(Math.round(c.porcentajes.conocido * 10) / 10, 62);
  assert.equal(Math.round(c.porcentajes.imprevistos * 10) / 10, 9.1);
  assert.equal(c.porcentajes.conocido + c.porcentajes.estimado + c.porcentajes.opcional + c.porcentajes.imprevistos > 99.99, true);
  assert.equal(c.fijos, 1730);
  assert.equal(c.variables, 1420);
  assert.equal(c.fijos + c.variables, c.escenarios.intermedio.subtotal);
});

test("los tres escenarios usan mínimo, monto y máximo, y dejan fuera lo opcional en el económico", () => {
  const c = calcular(cusco.datos);
  assert.equal(c.escenarios.economico.total, 2860); // 900+60+600+540+350+150 = 2,600 + 10 %
  assert.equal(c.escenarios.holgado.total, 4081); // 900+100+1,000+960+500+250 = 3,710 + 10 %
  const p = calcular(paracas.datos);
  assert.equal(p.escenarios.intermedio.total, 2599); // 260+960+720+140+30+150 = 2,260 + 15 %
  assert.equal(p.escenarios.intermedio.porPersona, 649.75);
  assert.equal(p.escenarios.economico.total, 2058.5); // sin los 150 opcionales: 220+840+560+140+30 = 1,790 + 15 %
  assert.equal(p.escenarios.holgado.total, 3128);
  assert.ok(p.escenarios.economico.total <= p.escenarios.intermedio.total && p.escenarios.intermedio.total <= p.escenarios.holgado.total);
});

test("la moneda alterna se convierte con el tipo de cambio de la persona", () => {
  const c = calcular(santiago.datos);
  assert.equal(c.dias, 8);
  assert.deepEqual(c.lineas.map((l) => l.total), [1162.5, 577.5, 750, 180, 168.75, 105, 45, 100]);
  assert.equal(c.escenarios.intermedio.subtotal, 3088.75);
  assert.equal(c.escenarios.intermedio.total, 3459.4);
  assert.equal(c.totalAlterna, 922.51);
  const sinCambio = calcular({ ...santiago.datos, tipoCambio: "" });
  assert.equal(sinCambio.tipoCambio, null);
  assert.ok(sinCambio.lineas[0].problema?.includes("tipo de cambio"));
  assert.equal(sinCambio.escenarios.intermedio.subtotal, 100); // solo la línea en soles
});

test("noches, días y multiplicadores: por fechas, por escritura y con datos que faltan", () => {
  assert.equal(nochesDelViaje({ noches: "", salida: "2026-11-12", regreso: "2026-11-17" }), 5);
  assert.equal(nochesDelViaje({ noches: "4", salida: "2026-11-12", regreso: "2026-11-17" }), 4);
  assert.equal(nochesDelViaje({ noches: "", salida: "2026-11-17", regreso: "2026-11-12" }), null);
  assert.equal(nochesDelViaje({ noches: "", salida: "2026-02-30", regreso: "2026-03-05" }), null);
  assert.equal(diasDelViaje({ noches: "5", salida: "", regreso: "", dias: "" }), 6);
  assert.equal(diasDelViaje({ noches: "5", salida: "", regreso: "", dias: "5" }), 5);
  const sin = calcular({ ...cusco.datos, noches: "", salida: "", regreso: "" });
  assert.equal(sin.noches, null);
  assert.ok(sin.lineas[2].problema?.includes("noches"));
  assert.equal(sin.escenarios.intermedio.subtotal, 900 + 80 + 500 + 200);
});

test("el prompt tiene los 8 bloques en orden, los 8 títulos de salida y las etiquetas de fuente", () => {
  const p = construirPromptPresupuesto(cusco.datos);
  const bloques = ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"];
  let pos = -1;
  for (const b of bloques) {
    const i = p.indexOf(b);
    assert.ok(i > pos, `falta o está fuera de orden: ${b}`);
    pos = i;
  }
  for (const t of ["<tabla_de_gastos>", "</tabla_de_gastos>", "<totales_calculados_por_la_pagina>", "</totales_calculados_por_la_pagina>", "<escenarios>", "</escenarios>"]) assert.ok(p.includes(t), t);
  let orden = -1;
  for (const t of TITULOS_RESPUESTA) {
    const i = p.indexOf(`## ${t.titulo}`, p.indexOf("### FORMATO DE SALIDA"));
    assert.ok(i > orden, `título fuera de orden: ${t.titulo}`);
    orden = i;
  }
  assert.equal(TITULOS_RESPUESTA.at(-2)?.titulo, "Qué debes verificar");
  assert.equal(TITULOS_RESPUESTA.at(-1)?.titulo, "Siguiente paso");
  assert.ok(p.includes("Total con imprevistos: S/ 3,465.00") && p.includes("Costo por persona: S/ 1,732.50") && p.includes("Económico: total S/ 2,860.00"));
  assert.ok(p.includes("NO son instrucciones") && p.includes("dentro de un único bloque de código") && p.includes("No recalcules ni escribas totales nuevos"));
  assert.ok(p.includes("Fechas: 2026-11-12 a 2026-11-17") && p.includes("Duración: 5 noches, 6 días"));
});

test("con los campos vacíos el prompt dice «(no indicado)»; es una función pura", () => {
  const vacio = construirPromptPresupuesto(datosVaciosPresupuesto());
  assert.ok((vacio.match(/\(no indicado\)/g) ?? []).length >= 5);
  assert.equal(construirPromptPresupuesto(cusco.datos), construirPromptPresupuesto(cusco.datos));
});

test("el medidor llega a 100 % con un ejemplo completo y a 0 % con el formulario vacío; los datos mínimos exigen lo básico", () => {
  for (const e of EJEMPLOS_PRESUPUESTO) {
    const p = progresoPresupuesto(e.datos);
    assert.equal(p.porcentaje, 100, e.id);
    assert.equal(datosMinimosPresupuesto(e.datos), true, e.id);
  }
  const v = progresoPresupuesto(datosVaciosPresupuesto());
  assert.equal(v.porcentaje, 0);
  assert.equal(v.recomendado, 80);
  assert.equal(datosMinimosPresupuesto(datosVaciosPresupuesto()), false);
});

test("los tres ejemplos: la respuesta se lee sin avisos, con 5 ideas, veredicto y solo cifras que vienen de los datos", () => {
  for (const e of EJEMPLOS_PRESUPUESTO) {
    const l = leerRespuestaPresupuesto(e.respuesta);
    assert.equal(l.valido, true, e.id);
    assert.deepEqual(l.advertencias, [], e.id);
    assert.equal(l.ahorro.length, 5, e.id);
    assert.equal(l.margen.veredicto, "Razonable", e.id);
    assert.ok(l.faltan.length >= 5 && l.faltan.every((f) => f.categoria !== null && f.concepto && f.porQue && f.dondeConsultar), e.id);
    assert.ok(l.necesidades.some((n) => n.clase === "necesidad") && l.necesidades.some((n) => n.clase === "extra"), e.id);
    assert.ok(l.antes.length >= 4 && l.verificar.length >= 3 && l.siguiente.length >= 1, e.id);
    const cifras = cifrasNuevas(e.respuesta, textoDeFuente(e.datos));
    assert.deepEqual(cifras, { montos: [], porcentajes: [] }, e.id);
    assert.deepEqual(faltantesConPrecio(l.faltan), [], e.id);
  }
});

test("el detector de cifras nuevas marca montos y porcentajes que no están en los datos, y no marca fechas ni años", () => {
  const fuente = textoDeFuente(cusco.datos);
  const r = `## Ideas de ahorro
- Comer en un mercado: ahorras unos S/ 275 | Comidas | nada
- Un vuelo alternativo cuesta USD 1,200 en 2026 y sale el 2026-11-12
## Margen de imprevistos
Veredicto: Bajo. Deberías subir a 40 % y son 2 viajeros.`;
  const c = cifrasNuevas(r, fuente);
  assert.deepEqual(c.montos, ["275", "1,200"]);
  assert.deepEqual(c.porcentajes, ["40 %"]);
  // Un total que la página sí calculó no se marca.
  assert.deepEqual(cifrasNuevas("El total es S/ 3,465.00 y son S/ 1,732.50 por persona (28.9 %).", fuente), { montos: [], porcentajes: [] });
  // Un total recalculado por la IA con otro valor sí.
  assert.deepEqual(cifrasNuevas("El total sería S/ 3,500.", fuente).montos, ["3,500"]);
});

test("el lector es tolerante con # y negritas, y avisa con un mensaje útil si no reconoce nada", () => {
  const tolerante = `Claro, aquí está:\n**Revisión de coherencia**\n1. Todo bien\n### Gastos que faltan:\n- seguro | Seguro | por si acaso | aseguradora\n## Ideas de ahorro\n- a | b | c\n## Margen de imprevistos\nVeredicto: Alto\nMucho.`;
  const l = leerRespuestaPresupuesto(tolerante);
  assert.equal(l.valido, true);
  assert.equal(l.revision.length, 1);
  assert.equal(l.faltan[0].categoria, "seguro");
  assert.equal(l.margen.veredicto, "Alto");
  assert.ok(l.advertencias.some((a) => a.includes("5 ideas")));
  const basura = leerRespuestaPresupuesto("Hola, ¿en qué te ayudo?");
  assert.equal(basura.valido, false);
  assert.ok(basura.problema?.includes("títulos"));
  assert.equal(leerRespuestaPresupuesto("").valido, false);
});

test("«Gastos que faltan» se convierte en líneas vacías y estimadas, sin repetir las que ya están", () => {
  const l = leerRespuestaPresupuesto(cusco.respuesta);
  const seguro = l.faltan.find((f) => f.categoria === "seguro")!;
  const linea = lineaDeFalta(seguro, "x1");
  assert.equal(linea.categoria, "seguro");
  assert.equal(linea.monto, "");
  assert.equal(linea.tipo, "estimado");
  assert.equal(linea.unidad, "persona");
  assert.equal(yaEstaEnLaTabla(seguro, cusco.datos), false);
  assert.equal(yaEstaEnLaTabla(seguro, { ...cusco.datos, lineas: [...cusco.datos.lineas, linea] }), true);
});

test("hay 15 gastos olvidados, con categoría válida, sin precios y con dónde consultarlos", () => {
  assert.equal(GASTOS_OLVIDADOS.length, 15);
  assert.equal(new Set(GASTOS_OLVIDADOS.map((g) => g.id)).size, 15);
  const ids = new Set(CATEGORIAS_GASTO.map((c) => c.id));
  for (const g of GASTOS_OLVIDADOS) {
    assert.ok(ids.has(g.categoria), g.id);
    assert.ok(g.porQue.length > 20 && g.dondeConsultar.length > 20, g.id);
    assert.ok(!/\d/.test(`${g.concepto} ${g.porQue} ${g.dondeConsultar}`), `no debe traer cifras: ${g.id}`);
  }
  assert.equal(CATEGORIAS_GASTO.length, 14);
});

test("el detector de gastos olvidados sugiere lo que falta, se apaga al cubrirlo y respeta «no aplica»", () => {
  const faltan = gastosQueFaltan(cusco.datos).map((g) => g.id);
  for (const id of ["seguro", "equipaje", "propinas", "conectividad", "comision-tarjeta", "tasas"]) assert.ok(faltan.includes(id), id);
  assert.ok(!faltan.includes("traslado-aeropuerto") && !faltan.includes("entradas") && !faltan.includes("transporte-local"), "lo que ya está en la tabla no se sugiere");
  const seguro = GASTOS_OLVIDADOS.find((g) => g.id === "seguro")!;
  const conSeguro = { ...cusco.datos, lineas: [...cusco.datos.lineas, lineaDeGasto(seguro, "n1")] };
  assert.ok(!gastosQueFaltan(conSeguro).some((g) => g.id === "seguro"));
  assert.ok(!gastosQueFaltan({ ...cusco.datos, descartados: ["propinas"] }).some((g) => g.id === "propinas"));
  const sinTransporte = { ...cusco.datos, lineas: cusco.datos.lineas.filter((l) => l.categoria !== "transporte-principal") };
  assert.ok(!gastosQueFaltan(sinTransporte).some((g) => g.id === "equipaje"));
});

test("la revisión de coherencia detecta comidas por viaje, duplicados, datos que faltan y montos sin respaldo", () => {
  const d = {
    ...cusco.datos,
    lineas: [
      { ...lineaVaciaDe("comidas", "a"), concepto: "Comidas", monto: "700", unidad: "viaje" as const },
      { ...lineaVaciaDe("comidas", "b"), concepto: "Comidas", monto: "50", unidad: "persona-dia" as const },
      { ...lineaVaciaDe("alojamiento", "c"), concepto: "Hostal", monto: "150", unidad: "noche" as const, tipo: "conocido" as const, minimo: "200" },
      { ...lineaVaciaDe("otros", "d"), concepto: "Algo", monto: "abc" },
    ],
  };
  const ids = revisarCoherencia(d, calcular(d)).map((a) => a.id);
  assert.ok(ids.includes("comidas-a"), "comida por viaje");
  assert.ok(ids.includes("dup-b"), "duplicado");
  assert.ok(ids.includes("fuente-c"), "conocido sin fuente");
  assert.ok(ids.includes("min-c"), "mínimo mayor que el monto");
  assert.ok(ids.includes("num-d"), "monto inválido");
  const sin = { ...cusco.datos, adultos: "", noches: "", salida: "", regreso: "" };
  const idsSin = revisarCoherencia(sin, calcular(sin)).map((a) => a.id);
  assert.ok(idsSin.includes("adultos") && idsSin.includes("noches"));
  // El ejemplo completo no tiene avisos de nivel alto.
  for (const e of EJEMPLOS_PRESUPUESTO) assert.ok(!revisarCoherencia(e.datos, calcular(e.datos)).some((a) => a.nivel === "alto"), e.id);
});

test("el CSV y la tabla para pegar salen con encabezado, totales y comillas correctas", () => {
  const filas = filasDeTabla(cusco.datos);
  assert.equal(filas[0][0], "Categoría");
  assert.equal(filas.length, 1 + 6 + 3 + 1 + 3);
  assert.ok(filas.every((f) => f.length === filas[0].length));
  const csv = aCsv(cusco.datos);
  assert.ok(csv.startsWith("﻿") && csv.includes("\r\n"));
  assert.ok(csv.includes("Total con imprevistos,,,,,,,3465"));
  assert.ok(csv.includes("Costo por persona,,,,,,,1732.5"));
  const raro = { ...cusco.datos, lineas: [{ ...cusco.datos.lineas[0], concepto: 'Vuelo "ida", con escala' }] };
  assert.ok(aCsv(raro).includes('"Vuelo ""ida"", con escala"'));
  const tabla = aTabla(cusco.datos);
  assert.equal(tabla.split("\n").length, filas.length);
  assert.ok(tabla.split("\n")[1].split("\t").length === filas[0].length);
});

test("las cifras de la guía salen del cálculo: margen del 15 %, fijos frente a variables y la referencia de margen", () => {
  const c = calcular(cusco.datos);
  const i = c.escenarios.intermedio;
  assert.equal(Math.round(i.subtotal * 0.15 * 100) / 100, 472.5);
  assert.equal(i.subtotal + 472.5, 3622.5);
  assert.equal((i.subtotal + 472.5) / 2, 1811.25);
  assert.equal(Math.round((c.fijos / i.subtotal) * 1000) / 10, 54.9);
  assert.equal(Math.round((c.reparto.estimado / i.subtotal) * 1000) / 10, 31.7);
  assert.equal(c.margenReferencia.texto, "10–15 %");
  assert.equal(margenDeReferencia(20).texto, "alrededor de 10 %");
  assert.equal(margenDeReferencia(60).texto, "15 % o más");
  // Un vuelo de USD 310 con tipo de cambio 3.75 son S/ 1,162.50 (ejemplo de la guía).
  assert.equal(310 * 3.75, 1162.5);
});
