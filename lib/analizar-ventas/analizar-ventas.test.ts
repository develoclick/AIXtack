import assert from "node:assert/strict";
import { test } from "node:test";
import { fichaDeHoja, sugerirMapeo } from "./ficha";
import { calcularMetricas, calidadDeDatos, compararPeriodos, concentracion, diasDelPeriodo, evolucionMensual, filasVentaDesdeMapeo, filtrarPorPeriodo, mapeoMinimo, normalizarFecha, participacionPor, armarResumenAnalisis } from "./calculo";
import { construirPromptAnalisisVentas, progresoAnalisisVentas, textoDeFuenteAnalisisVentas } from "./prompt";
import { leerRespuestaAnalisisVentas, TITULOS_RESPUESTA } from "./lector";
import { revisarAnalisisVentas } from "./verificar";
import { csvDeAnalisisVentas } from "./csv";
import { datosVaciosAnalisisVentas, mapeoVacio, normalizarDatosAnalisisVentas, type DatosAnalisisVentas } from "./tipos";
import type { HojaCruda } from "./parser";

// header: fecha,producto,categoria,cantidad,precio,importe,vendedor,sucursal
const FILAS_CRUDAS = [
  ["fecha", "producto", "categoria", "cantidad", "precio", "importe", "vendedor", "sucursal"],
  ["15/05/2026", "Taladro", "Herramientas eléctricas", "1", "150", "150", "Ana", "Centro"],
  ["16/05/2026", "Martillo", "Herramientas manuales", "2", "20", "40", "Ana", "Centro"],
  ["18/05/2026", "Taladro", "Herramientas eléctricas", "1", "150", "150", "Luis", "Norte"],
  ["20/05/2026", "Cemento", "Materiales", "3", "30", "90", "Luis", "Norte"],
  ["22/05/2026", "Martillo", "Herramientas manuales", "1", "20", "20", "Ana", "Centro"],
  ["01/06/2026", "Taladro", "Herramientas eléctricas", "1", "150", "150", "Ana", "Centro"],
  ["03/06/2026", "Cemento", "Materiales", "2", "30", "60", "Luis", "Norte"],
  ["05/06/2026", "Martillo", "Herramientas manuales", "1", "20", "20", "Ana", "Centro"],
];

const MAPEO = { ...mapeoVacio(), fecha: 0, producto: 1, categoria: 2, cantidad: 3, precio: 4, importe: 5, vendedor: 6, sucursal: 7 };
const HOJA: HojaCruda = { nombre: "ventas", filas: FILAS_CRUDAS, truncado: false };

function filas() {
  return filasVentaDesdeMapeo(HOJA, MAPEO);
}

test("normalizarFecha lee DD/MM/AAAA e ISO, y rechaza fechas imposibles", () => {
  assert.equal(normalizarFecha("15/05/2026"), "2026-05-15");
  assert.equal(normalizarFecha("2026-06-01"), "2026-06-01");
  assert.equal(normalizarFecha("31/02/2026"), null);
  assert.equal(normalizarFecha("15/13/2026"), null);
  assert.equal(normalizarFecha(""), null);
});

test("diasDelPeriodo cuenta los 2 extremos incluidos", () => {
  assert.equal(diasDelPeriodo("01/05/2026", "31/05/2026"), 31);
  assert.equal(diasDelPeriodo("01/06/2026", "30/06/2026"), 30);
  assert.equal(diasDelPeriodo("01/06/2026", "01/06/2026"), 1);
});

test("filasVentaDesdeMapeo lee las 8 filas y deriva el importe si falta (cantidad × precio)", () => {
  const f = filas();
  assert.equal(f.length, 8);
  assert.equal(f[0].fecha, "2026-05-15");
  assert.equal(f[0].producto, "Taladro");
  assert.equal(f[0].importe, 150);
  const sinImporte = { ...MAPEO, importe: null };
  const derivado = filasVentaDesdeMapeo(HOJA, sinImporte);
  assert.equal(derivado[1].importe, 40); // Martillo: 2 × 20
});

test("calcularMetricas de mayo (verificado a mano: 150+40+150+90+20=450, 5 operaciones, ticket 90)", () => {
  const m = calcularMetricas(filtrarPorPeriodo(filas(), "01/05/2026", "31/05/2026"));
  assert.equal(m.ventas, 450);
  assert.equal(m.operaciones, 5);
  assert.equal(m.unidades, 8);
  assert.equal(m.ticketPromedio, 90);
  assert.equal(m.precioMedioUnidad, 56.25);
});

test("calcularMetricas de junio (verificado a mano: 150+60+20=230, 3 operaciones)", () => {
  const m = calcularMetricas(filtrarPorPeriodo(filas(), "01/06/2026", "30/06/2026"));
  assert.equal(m.ventas, 230);
  assert.equal(m.operaciones, 3);
  assert.equal(m.unidades, 4);
});

test("compararPeriodos descompone la variación en efecto de operaciones + efecto de ticket, que suman exacto ventasB - ventasA", () => {
  const c = compararPeriodos(filas(), { desde: "01/05/2026", hasta: "31/05/2026" }, { desde: "01/06/2026", hasta: "30/06/2026" });
  assert.equal(c.ventasA, 450);
  assert.equal(c.ventasB, 230);
  assert.ok(Math.abs(c.efectoOperaciones + c.efectoTicket - (c.ventasB - c.ventasA)) < 0.01);
  assert.equal(c.diasA, 31);
  assert.equal(c.diasB, 30);
  assert.equal(c.comparable, false, "31 vs 30 días: no son del todo comparables");
  assert.equal(c.variacionPct, -48.89);
});

test("compararPeriodos con ventasA = 0 no calcula un % (evita dividir entre 0)", () => {
  const c = compararPeriodos(filas(), { desde: "01/01/2020", hasta: "31/01/2020" }, { desde: "01/06/2026", hasta: "30/06/2026" });
  assert.equal(c.variacionPct, null);
});

test("participacionPor por producto suma ~100 % y ordena de mayor a menor (verificado a mano: Taladro 450, Cemento 150, Martillo 80)", () => {
  const p = participacionPor(filas(), "producto");
  assert.deepEqual(p.map((x) => x.clave), ["Taladro", "Cemento", "Martillo"]);
  assert.equal(p[0].ventas, 450);
  assert.equal(p[1].ventas, 150);
  assert.equal(p[2].ventas, 80);
  const sumaPct = p.reduce((s, x) => s + x.pct, 0);
  assert.ok(Math.abs(sumaPct - 100) < 0.01);
});

test("concentracion: el 20 % de los productos (redondeado a al menos 1) explica el % de ventas correspondiente", () => {
  const c = concentracion(filas(), "producto")!;
  assert.equal(c.entidades, 3);
  assert.equal(c.entidadesTop, 1); // round(3*0.2)=1 (mínimo 1)
  assert.equal(c.pctVentasTop, 66.18); // Taladro / total = 450/680
});

test("evolucionMensual agrupa por mes y ordena cronológicamente", () => {
  const e = evolucionMensual(filas());
  assert.deepEqual(e, [
    { mes: "2026-05", ventas: 450, operaciones: 5 },
    { mes: "2026-06", ventas: 230, operaciones: 3 },
  ]);
});

test("calidadDeDatos cuenta negativos, duplicados e importe inconsistente sin eliminar ninguna fila", () => {
  const filasConProblemas = [...filas(), { ...filas()[0] }, { ...filas()[0], importe: -10 }, { ...filas()[0], importe: 999 }];
  const cal = calidadDeDatos(filasConProblemas, MAPEO);
  assert.equal(cal.total, 11);
  assert.ok(cal.duplicados >= 1, "la fila repetida debe contarse como duplicado");
  assert.equal(cal.negativos, 1);
  // 2 filas inconsistentes: importe -10 y 999 son ambas distintas de cantidad×precio = 150
  assert.equal(cal.importeInconsistente, 2);
});

test("calidadDeDatos detecta un importe negativo (una devolución): no se descarta como número inválido", () => {
  const hojaConDevolucion: HojaCruda = { nombre: "x", truncado: false, filas: [["fecha", "importe"], ["01/05/2026", "-89.90"], ["02/05/2026", "50.00"]] };
  const mapeoSimple = { ...mapeoVacio(), fecha: 0, importe: 1 };
  const filasConDevolucion = filasVentaDesdeMapeo(hojaConDevolucion, mapeoSimple);
  assert.equal(filasConDevolucion[0].importe, -89.9, "el importe negativo debe leerse como -89.9, no descartarse como null");
  assert.equal(calidadDeDatos(filasConDevolucion, mapeoSimple).negativos, 1);
});

test("mapeoMinimo exige fecha e importe mapeados y al menos 1 fila", () => {
  assert.equal(mapeoMinimo(MAPEO, 8), true);
  assert.equal(mapeoMinimo({ ...MAPEO, importe: null }, 8), false);
  assert.equal(mapeoMinimo(MAPEO, 0), false);
});

test("armarResumenAnalisis junta calidad, métricas, evolución, participación, concentración y comparación en un solo objeto", () => {
  const r = armarResumenAnalisis(filas(), MAPEO, { desde: "01/06/2026", hasta: "30/06/2026" }, { desde: "01/05/2026", hasta: "31/05/2026" });
  assert.equal(r.metricas.ventas, 230);
  assert.equal(r.topProductos.length > 0, true);
  assert.equal(r.concentracionProducto?.entidades, 3);
  assert.ok(r.comparacion);
  assert.equal(r.comparacion!.ventasA, 450);
  assert.equal(r.comparacion!.ventasB, 230);
});

function datosAnalisis(): DatosAnalisisVentas {
  return { ...datosVaciosAnalisisVentas(), moneda: "S/", periodoDesde: "01/06/2026", periodoHasta: "30/06/2026", comparacionDesde: "01/05/2026", comparacionHasta: "31/05/2026", objetivo: "Entender por qué bajaron las ventas", contexto: "Ninguna promoción activa en junio", mapeo: MAPEO, modo: "B", nombreArchivo: "ventas.csv" };
}

function ficha() {
  return fichaDeHoja("ventas.csv", [HOJA], "ventas");
}

test("fichaDeHoja detecta el tipo de cada columna y una muestra de valores", () => {
  const f = ficha();
  assert.equal(f.totalFilas, 8);
  const colFecha = f.columnas.find((c) => c.nombre === "fecha")!;
  assert.equal(colFecha.tipo, "fecha");
  const colProducto = f.columnas.find((c) => c.nombre === "producto")!;
  assert.equal(colProducto.tipo, "texto");
  assert.equal(colProducto.valoresUnicos, 3);
  const colImporte = f.columnas.find((c) => c.nombre === "importe")!;
  assert.equal(colImporte.tipo, "numero");
});

test("fichaDeHoja no confunde texto con números solo porque trae dígitos (bug: «Taladro 650W» o «Talla A4» no son una columna numérica)", () => {
  const hojaConTexto: HojaCruda = {
    nombre: "productos",
    truncado: false,
    filas: [
      ["producto"],
      ["Taladro percutor 650W"],
      ["Cuaderno A4 cuadriculado"],
      ["Esmeril angular 4.5\""],
      ["Mochila escolar"],
    ],
  };
  const f = fichaDeHoja("x.csv", [hojaConTexto], "productos");
  assert.equal(f.columnas[0].tipo, "texto");
});

test("sugerirMapeo reconoce las columnas por su nombre", () => {
  const sugerido = sugerirMapeo(ficha());
  assert.equal(sugerido.fecha, 0);
  assert.equal(sugerido.producto, 1);
  assert.equal(sugerido.importe, 5);
  assert.equal(sugerido.sucursal, 7);
});

test("construirPromptAnalisisVentas incluye la ficha, las métricas y los 8 títulos de salida, sin ninguna fila cruda del archivo", () => {
  const r = armarResumenAnalisis(filas(), MAPEO, { desde: "01/06/2026", hasta: "30/06/2026" }, { desde: "01/05/2026", hasta: "31/05/2026" });
  const p = construirPromptAnalisisVentas(datosAnalisis(), ficha(), r);
  assert.ok(p.includes("Ventas totales: S/ 230.00"));
  assert.ok(p.includes("Entender por qué bajaron las ventas"));
  for (const t of TITULOS_RESPUESTA) assert.ok(p.includes(`## ${t.titulo}`), `falta ${t.titulo}`);
  // La participación por sucursal es una métrica agregada legítima (no una fila cruda); lo que nunca debe aparecer es una fila individual tal cual venía en el archivo.
  assert.ok(!p.includes("Taladro,Herramientas eléctricas,1,150,150,Ana,Centro"), "el prompt no debe incluir ninguna fila cruda del archivo, solo la ficha y las métricas agregadas");
});

test("progresoAnalisisVentas llega a 100 % con archivo, mapeo, período, objetivo y moneda completos, y 0 % con todo vacío", () => {
  assert.equal(progresoAnalisisVentas(datosAnalisis(), true, true).porcentaje, 100);
  assert.equal(progresoAnalisisVentas({ ...datosVaciosAnalisisVentas(), moneda: "" }, false, false).porcentaje, 0);
});

const RESPUESTA_VALIDA = `## Calidad de datos
- No hay importes negativos ni fechas fuera de rango.
- 1 fila aparece duplicada: revisa si corresponde a una venta repetida o a un error de carga.

## Métricas principales
\`\`\`csv
metrica,valor
Ventas totales,S/ 230.00
Operaciones,3
Ticket promedio,S/ 76.67
\`\`\`

## Evolución
- Las ventas bajaron de mayo a junio.

## Variaciones y su descomposición
- Las ventas bajaron de S/ 450.00 (mayo) a S/ 230.00 (junio), sobre todo por menos operaciones (efecto S/ 180.00) y, en menor medida, por un ticket promedio más bajo (efecto S/ 39.99).
- Los períodos no tienen la misma cantidad de días (31 contra 30): la comparación no es del todo justa.

## Concentración
- El producto Taladro concentra la mayor parte de las ventas.

## Hallazgos
- Las ventas de junio fueron S/ 230.00, frente a S/ 450.00 en mayo.

## Hipótesis a investigar
- [HIPÓTESIS] La caída podría deberse a menor tráfico en la sucursal Norte: revisar el registro de visitas.

## Preguntas siguientes
- ¿Hubo alguna falta de stock de Taladro en junio?`;

test("leerRespuestaAnalisisVentas lee las 8 secciones y la tabla de métricas", () => {
  const l = leerRespuestaAnalisisVentas(RESPUESTA_VALIDA);
  assert.equal(l.valido, true);
  assert.equal(l.advertencias.length, 0);
  assert.equal(l.metricas.length, 3);
  assert.equal(l.metricas[0].metrica, "Ventas totales");
  assert.equal(l.metricas[0].valor, "S/ 230.00");
  assert.equal(l.conteoHipotesis, 1);
  for (const t of TITULOS_RESPUESTA) assert.ok(l.secciones[t.clave], `falta ${t.clave}`);
});

test("leerRespuestaAnalisisVentas lee un monto con coma de miles, entre comillas o sin ellas (bug: dividirCsv cortaba «S/ 2,995.80» en la coma de miles)", () => {
  const conComillas = `## Calidad de datos\n- ok\n\n## Métricas principales\n\`\`\`csv\nmetrica,valor\nVentas totales,"S/ 2,995.80"\n\`\`\`\n\n## Hallazgos\n- x`;
  assert.equal(leerRespuestaAnalisisVentas(conComillas).metricas[0].valor, "S/ 2,995.80");
  const sinComillas = `## Calidad de datos\n- ok\n\n## Métricas principales\n\`\`\`csv\nmetrica,valor\nVentas totales,S/ 2,995.80\n\`\`\`\n\n## Hallazgos\n- x`;
  assert.equal(leerRespuestaAnalisisVentas(sinComillas).metricas[0].valor, "S/ 2,995.80");
});

test("leerRespuestaAnalisisVentas sin ningún título reconocido no es válida", () => {
  const l = leerRespuestaAnalisisVentas("No puedo ayudarte con eso.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

test("revisarAnalisisVentas no marca nada inventado en una respuesta que solo cita las cifras ya calculadas", () => {
  const r = armarResumenAnalisis(filas(), MAPEO, { desde: "01/06/2026", hasta: "30/06/2026" }, { desde: "01/05/2026", hasta: "31/05/2026" });
  const l = leerRespuestaAnalisisVentas(RESPUESTA_VALIDA);
  const rev = revisarAnalisisVentas(l, datosAnalisis(), ficha(), r);
  assert.equal(rev.cifras.montos.length, 0, rev.cifras.montos.join(", "));
  assert.equal(rev.cifras.porcentajes.length, 0, rev.cifras.porcentajes.join(", "));
});

test("revisarAnalisisVentas detecta un monto inventado que no está en la ficha ni en las métricas", () => {
  const r = armarResumenAnalisis(filas(), MAPEO, { desde: "01/06/2026", hasta: "30/06/2026" }, { desde: "01/05/2026", hasta: "31/05/2026" });
  const conInventado = RESPUESTA_VALIDA.replace("Las ventas de junio fueron S/ 230.00, frente a S/ 450.00 en mayo.", "Las ventas de junio fueron S/ 230.00, un monto muy por debajo del mercado que suele ser S/ 999,999.00.");
  const l = leerRespuestaAnalisisVentas(conInventado);
  const rev = revisarAnalisisVentas(l, datosAnalisis(), ficha(), r);
  assert.ok(rev.cifras.montos.some((m) => m.includes("999")));
});

test("revisarAnalisisVentas avisa si ninguna causa está etiquetada [HIPÓTESIS]", () => {
  const r = armarResumenAnalisis(filas(), MAPEO, { desde: "01/06/2026", hasta: "30/06/2026" }, { desde: "01/05/2026", hasta: "31/05/2026" });
  const sinEtiqueta = RESPUESTA_VALIDA.replace("[HIPÓTESIS] ", "");
  const l = leerRespuestaAnalisisVentas(sinEtiqueta);
  const rev = revisarAnalisisVentas(l, datosAnalisis(), ficha(), r);
  assert.ok(rev.avisos.some((a) => a.includes("HIPÓTESIS")));
});

test("csvDeAnalisisVentas exporta un .csv legible con las métricas y la evolución", () => {
  const r = armarResumenAnalisis(filas(), MAPEO, { desde: "01/06/2026", hasta: "30/06/2026" }, { desde: "01/05/2026", hasta: "31/05/2026" });
  const csv = csvDeAnalisisVentas(r, "S/");
  assert.ok(csv.includes("Ventas totales"));
  assert.ok(csv.includes("Evolución mensual"));
});

test("textoDeFuenteAnalisisVentas nunca incluye una fila cruda del archivo (solo la ficha y las métricas agregadas)", () => {
  const r = armarResumenAnalisis(filas(), MAPEO, { desde: "01/06/2026", hasta: "30/06/2026" }, { desde: "01/05/2026", hasta: "31/05/2026" });
  const texto = textoDeFuenteAnalisisVentas(datosAnalisis(), ficha(), r);
  assert.ok(!texto.includes("Taladro,Herramientas eléctricas,1,150,150,Ana,Centro"));
});

test("normalizarDatosAnalisisVentas tolera datos vacíos o de otra forma sin romperse", () => {
  const n = normalizarDatosAnalisisVentas({ moneda: "US$", modo: "nada", mapeo: { fecha: 2 } });
  assert.equal(n.moneda, "US$");
  assert.equal(n.modo, "B");
  assert.equal(n.mapeo.fecha, 2);
  assert.equal(normalizarDatosAnalisisVentas(null).moneda, "S/");
});
