import assert from "node:assert/strict";
import { test } from "node:test";
import { calcularProductos, calcularResultado, calcularSensibilidad, datosMinimosRentabilidad, semaforo } from "./calculo";
import { costosQueFaltan, faltaVariableAdicional } from "./omisiones";
import { construirPromptRentabilidad, progresoRentabilidad } from "./prompt";
import { leerRespuestaRentabilidad } from "./lector";
import { revisarRentabilidad } from "./verificar";
import { csvDeInforme, csvDeProductos, productosDesdeCsv } from "./csv";
import { datosVaciosRentabilidad, itemVacio, productoVacio, normalizarDatosRentabilidad, TITULOS_RESPUESTA, type DatosRentabilidad, type ItemMonto, type Producto } from "./tipos";

function prod(nombre: string, precio: string, costo: string, unidades: string): Producto {
  return { ...productoVacio(`p-${nombre}`), nombre, precio, costo, unidades };
}
function item(concepto: string, monto: string): ItemMonto {
  return { ...itemVacio(`f-${concepto}`), concepto, monto };
}

/** Datos del ejemplo de la especificación: pastelería ficticia, un mes. */
function datosPasteleria(): DatosRentabilidad {
  return {
    ...datosVaciosRentabilidad(),
    productos: [prod("Tortas", "60", "32", "80"), prod("Cupcakes", "6", "2.50", "900"), prod("Cajas de galletas", "15", "11.50", "600")],
    costosVariablesTipo: "porcentaje",
    costosVariablesValor: "5",
    costosFijos: [item("Alquiler, servicios y otros gastos fijos", "6100")],
  };
}

test("calcularProductos reproduce el ejemplo de la especificación (ingresos, costo directo, contribución y margen por producto)", () => {
  const [tortas, cupcakes, galletas] = calcularProductos(datosPasteleria());
  assert.equal(tortas.ingresos, 4800);
  assert.equal(tortas.contribucionTotal, 2240);
  assert.equal(cupcakes.contribucionTotal, 3150);
  assert.equal(galletas.contribucionTotal, 2100);
  assert.equal(galletas.margenPct, 23.33);
});

test("calcularResultado reproduce el ejemplo: ingresos S/ 19.200, utilidad operativa S/ 430 (2,2 %)", () => {
  const r = calcularResultado(datosPasteleria())!;
  assert.equal(r.ingresosTotal, 19200);
  assert.equal(r.costoDirectoTotal, 11710);
  assert.equal(r.variablesAdicionales, 960);
  assert.equal(r.fijos, 6100);
  assert.equal(r.utilidadOperativa, 430);
  assert.equal(r.margenOperativoPct, 2.24);
  assert.equal(r.margenContribucionPct, 34.01);
});

test("el punto de equilibrio ronda los S/ 17.940 del ejemplo (fijos ÷ margen de contribución ponderado)", () => {
  const r = calcularResultado(datosPasteleria())!;
  assert.ok(r.puntoEquilibrioMonto! > 17900 && r.puntoEquilibrioMonto! < 17950, `puntoEquilibrioMonto=${r.puntoEquilibrioMonto}`);
});

test("calcularResultado es null sin ningún producto con datos completos", () => {
  assert.equal(calcularResultado(datosVaciosRentabilidad()), null);
});

test("el punto de equilibrio es null cuando el margen de contribución no es positivo", () => {
  const d = { ...datosPasteleria(), productos: [prod("Producto caro de producir", "10", "12", "100")], costosVariablesValor: "" };
  assert.equal(calcularResultado(d)!.puntoEquilibrioMonto, null);
});

test("calcularSensibilidad ordena las 4 variables de mayor a menor impacto y el precio es la más sensible en el ejemplo", () => {
  const sens = calcularSensibilidad(datosPasteleria())!;
  assert.equal(sens.length, 4);
  assert.equal(sens[0].clave, "precio");
  for (let i = 1; i < sens.length; i++) assert.ok(sens[i - 1].impacto >= sens[i].impacto);
});

test("datosMinimosRentabilidad y semaforo", () => {
  assert.equal(datosMinimosRentabilidad(datosPasteleria()), true);
  assert.equal(datosMinimosRentabilidad(datosVaciosRentabilidad()), false);
  const s = semaforo(datosPasteleria());
  assert.equal(s.find((x) => x.id === "productos")!.completa, true);
  assert.equal(s.find((x) => x.id === "fijos")!.completa, true);
});

test("costosQueFaltan detecta el sueldo del dueño y las mermas cuando no están cubiertos, y deja de avisar cuando sí", () => {
  const faltan1 = costosQueFaltan(datosPasteleria());
  assert.ok(faltan1.some((f) => f.id === "sueldo"));
  assert.ok(faltan1.some((f) => f.id === "mermas"));

  const cubierto: DatosRentabilidad = { ...datosPasteleria(), incluyeSueldo: true, costosFijos: [...datosPasteleria().costosFijos, item("Mermas de insumos", "150")] };
  const faltan2 = costosQueFaltan(cubierto);
  assert.ok(!faltan2.some((f) => f.id === "sueldo"));
  assert.ok(!faltan2.some((f) => f.id === "mermas"));
});

test("faltaVariableAdicional detecta cuando no se escribió nada, y no cuando se escribió 0", () => {
  assert.equal(faltaVariableAdicional(datosVaciosRentabilidad()), true);
  assert.equal(faltaVariableAdicional({ ...datosVaciosRentabilidad(), costosVariablesValor: "0" }), false);
});

test("progresoRentabilidad llega a 100 % con los datos del ejemplo completo", () => {
  const p = progresoRentabilidad({ ...datosPasteleria(), incluyeSueldo: true });
  assert.equal(p.porcentaje, 100);
});

test("construirPromptRentabilidad incluye los datos, los cálculos ya resueltos y los 7 títulos de salida", () => {
  const p = construirPromptRentabilidad(datosPasteleria());
  assert.ok(p.includes("Tortas"));
  assert.ok(p.includes("S/ 19,200.00") || p.includes("19,200.00"));
  for (const t of ["## Resumen", "## Rentabilidad por producto", "## Sensibilidad", "## Costos posiblemente omitidos", "## Acciones a probar", "## Qué debes verificar", "## Siguiente paso"]) assert.ok(p.includes(t), `falta ${t}`);
});

const RESPUESTA_VALIDA = `## Resumen
- El negocio vende S/ 19,200.00 [CÁLCULO] al mes y le queda una utilidad operativa de S/ 430.00 [CÁLCULO] (2,24 %).
- El margen es ajustado: pequeños cambios en precio o costo pueden borrar la utilidad.

## Rentabilidad por producto
- Las tortas aportan S/ 2,240.00 de contribución total con solo el 5% de las unidades vendidas.
- Las cajas de galletas generan más ingresos (S/ 9,000.00) pero su margen (23,33 %) es el más bajo de los 3 productos.
- Vender mucho no es lo mismo que ganar mucho: las galletas venden más pero dejan menos margen por unidad.

## Sensibilidad
- El precio es la variable más sensible: bajarlo 10% llevaría la utilidad a S/ -1,394.00 [CÁLCULO].
- Subir el volumen de ventas 10% ayuda menos de lo que parece, porque el margen por unidad es bajo.

## Costos posiblemente omitidos
- No se incluyó el sueldo del dueño: si trabaja en el negocio sin pagarse, la utilidad real es menor a la calculada.
- No se registraron mermas de insumos: si el negocio de panadería suele tener productos dañados o vencidos, el costo directo real podría ser más alto [HIPÓTESIS].

## Acciones a probar
- Subir el precio de las galletas en S/ 1 y medir si baja la demanda [HIPÓTESIS]: evalúa con las ventas de las próximas 2 semanas.
- Renegociar el costo de insumos de las galletas, el producto de menor margen.

## Qué debes verificar
- Confirma si tu sueldo ya está incluido en algún costo fijo.

## Siguiente paso
- Agrega tu sueldo como costo fijo y vuelve a calcular la utilidad operativa real.`;

test("leerRespuestaRentabilidad lee una respuesta completa con las 7 secciones y cuenta las hipótesis", () => {
  const l = leerRespuestaRentabilidad(RESPUESTA_VALIDA);
  assert.equal(l.valido, true);
  assert.equal(l.advertencias.length, 0);
  for (const t of TITULOS_RESPUESTA) assert.ok(l.secciones[t.clave], `falta sección ${t.clave}`);
  assert.equal(l.conteoHipotesis, 2);
});

test("leerRespuestaRentabilidad sin títulos reconocidos no es válida", () => {
  const l = leerRespuestaRentabilidad("No puedo ayudarte con eso.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

test("revisarRentabilidad no marca cifras inventadas en una respuesta consistente con los datos y los cálculos", () => {
  const l = leerRespuestaRentabilidad(RESPUESTA_VALIDA);
  const r = revisarRentabilidad(l, datosPasteleria());
  assert.equal(r.cifras.montos.length, 0);
});

test("productosDesdeCsv lee nombre, precio, costo y unidades, tolerando el orden de columnas y el separador «;»", () => {
  const csv = "unidades;nombre;costo;precio\n80;Tortas;32;60\n900;Cupcakes;2.5;6";
  const { productos, errores } = productosDesdeCsv(csv);
  assert.equal(errores.length, 0);
  assert.equal(productos.length, 2);
  assert.equal(productos[0].nombre, "Tortas");
  assert.equal(productos[0].precio, "60");
  assert.equal(productos[1].unidades, "900");
});

test("productosDesdeCsv avisa cuando no reconoce las columnas", () => {
  const { productos, errores } = productosDesdeCsv("a,b,c\n1,2,3");
  assert.equal(productos.length, 0);
  assert.ok(errores.length > 0);
});

test("csvDeProductos y productosDesdeCsv hacen un viaje de ida y vuelta sin perder datos", () => {
  const original = datosPasteleria().productos;
  const csv = csvDeProductos(original);
  const { productos } = productosDesdeCsv(csv);
  assert.equal(productos.length, 3);
  assert.equal(productos[0].nombre, "Tortas");
  assert.equal(productos[0].precio, "60");
});

test("csvDeInforme incluye los productos y el resultado del período", () => {
  const csv = csvDeInforme(datosPasteleria());
  assert.ok(csv.includes("Tortas"));
  assert.ok(csv.includes("Utilidad operativa"));
});

test("normalizarDatosRentabilidad tolera datos vacíos o de otra forma sin romperse", () => {
  const n = normalizarDatosRentabilidad({ periodo: "no-existe", productos: [{ nombre: "X", precio: "1", costo: "0.5", unidades: "10" }] });
  assert.equal(n.periodo, "mes");
  assert.equal(n.productos[0].nombre, "X");
});
