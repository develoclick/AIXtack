import assert from "node:assert/strict";
import { test } from "node:test";
import { construirPromptSegmentarClientes, progresoSegmentarClientes } from "./prompt";
import { leerRespuestaSegmentarClientes, TITULOS_RESPUESTA } from "./lector";
import {
  agregarTransacciones,
  calcularRFM,
  claveSegmentoRFM,
  clientesDesdeFilasResumidas,
  csvClientesPorSegmento,
  cuantiles,
  datosMinimos,
  diasEntre,
  matrizRF,
  normalizarFecha,
  parsearNumeroTolerante,
  resumenSegmentos,
  segmentarPorReglas,
  segmentosChicos,
  segmentosRFMParaResumen,
  textoDeSegmentos,
  type ClienteAgregado,
} from "./motor";
import { revisarSegmentarClientes } from "./verificar";
import { CAMPOS_MAPEO, CLAVES_SEGMENTO_RFM, mapeoVacio, nombresRfmPorDefecto, type MapeoColumnas } from "./tipos";
import type { HojaCruda } from "./parser";

test("parsearNumeroTolerante admite negativos y enteros con separador de miles", () => {
  assert.equal(parsearNumeroTolerante("1,234.50"), 1234.5);
  assert.equal(parsearNumeroTolerante("-80"), -80);
  assert.equal(parsearNumeroTolerante(""), null);
  assert.equal(parsearNumeroTolerante("abc"), null);
});

test("normalizarFecha lee DD/MM/AAAA y AAAA-MM-DD; diasEntre es la diferencia exacta (puede ser negativa)", () => {
  assert.equal(normalizarFecha("05/06/2026"), "2026-06-05");
  assert.equal(normalizarFecha("2026-06-05"), "2026-06-05");
  assert.equal(normalizarFecha("32/13/2026"), null);
  assert.equal(diasEntre("2026-06-01", "2026-06-30"), 29);
  assert.equal(diasEntre("2026-06-30", "2026-06-01"), -29);
});

function mapeoTransacciones(): MapeoColumnas {
  const m = mapeoVacio();
  m.clienteId = 0;
  m.fecha = 1;
  m.importe = 2;
  return m;
}

test("agregarTransacciones: última compra (máxima), nº de pedidos (conteo de filas) y gasto total (suma), por cliente", () => {
  const hoja: HojaCruda = {
    nombre: "t.csv",
    truncado: false,
    filas: [
      ["cliente", "fecha", "importe"],
      ["A", "01/01/2026", "100"],
      ["A", "15/02/2026", "50"],
      ["B", "10/01/2026", "200"],
    ],
  };
  const clientes = agregarTransacciones(hoja, mapeoTransacciones());
  const a = clientes.find((c) => c.id === "A")!;
  const b = clientes.find((c) => c.id === "B")!;
  assert.equal(a.ultimaCompra, "2026-02-15");
  assert.equal(a.pedidos, 2);
  assert.equal(a.gastoTotal, 150);
  assert.equal(b.pedidos, 1);
  assert.equal(b.gastoTotal, 200);
});

test("clientesDesdeFilasResumidas: una fila por cliente, usa la columna de pedidos si está mapeada, y descarta duplicados de ID", () => {
  const m = mapeoTransacciones();
  m.pedidos = 3;
  const hoja: HojaCruda = {
    nombre: "c.csv",
    truncado: false,
    filas: [
      ["cliente", "fecha", "importe", "pedidos"],
      ["A", "01/01/2026", "500", "4"],
      ["A", "02/01/2026", "999", "9"], // duplicado de ID: se ignora
      ["B", "10/01/2026", "80", "1"],
    ],
  };
  const clientes = clientesDesdeFilasResumidas(hoja, m);
  assert.equal(clientes.length, 2);
  assert.equal(clientes[0].gastoTotal, 500);
  assert.equal(clientes[0].pedidos, 4);
});

test("cuantiles: orden «asc» pone el valor más alto en la franja 5; orden «desc» pone el valor más BAJO en la franja 5 (recencia)", () => {
  const valores = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const asc = cuantiles(valores, "asc");
  assert.equal(asc[0], 1); // 10 → la franja más baja
  assert.equal(asc[9], 5); // 100 → la franja más alta
  const desc = cuantiles(valores, "desc");
  assert.equal(desc[0], 5); // 10 días → el más reciente → mejor franja
  assert.equal(desc[9], 1); // 100 días → el menos reciente → peor franja
});

test("claveSegmentoRFM: reglas de la matriz R×F en sus bordes", () => {
  assert.equal(claveSegmentoRFM(5, 5), "campeones");
  assert.equal(claveSegmentoRFM(4, 4), "campeones");
  assert.equal(claveSegmentoRFM(3, 3), "leales");
  assert.equal(claveSegmentoRFM(1, 5), "en_riesgo");
  assert.equal(claveSegmentoRFM(2, 4), "en_riesgo");
  assert.equal(claveSegmentoRFM(1, 1), "perdidos");
  assert.equal(claveSegmentoRFM(5, 1), "nuevos");
  assert.equal(claveSegmentoRFM(3, 1), "regulares");
});

function clientesDePrueba(): ClienteAgregado[] {
  return [
    { id: "C1", ultimaCompra: "2026-06-25", pedidos: 10, gastoTotal: 2000, ubicacion: "Lima", canal: "Web", categoria: "Ropa" },
    { id: "C2", ultimaCompra: "2026-06-20", pedidos: 8, gastoTotal: 1500, ubicacion: "Lima", canal: "Web", categoria: "Ropa" },
    { id: "C3", ultimaCompra: "2025-12-01", pedidos: 9, gastoTotal: 1800, ubicacion: "Arequipa", canal: "Tienda", categoria: "Calzado" },
    { id: "C4", ultimaCompra: "2025-11-15", pedidos: 7, gastoTotal: 1200, ubicacion: "Arequipa", canal: "Tienda", categoria: "Calzado" },
    { id: "C5", ultimaCompra: "2026-06-01", pedidos: 1, gastoTotal: 50, ubicacion: "Cusco", canal: "Web", categoria: "Accesorios" },
    { id: "C6", ultimaCompra: "2024-01-01", pedidos: 1, gastoTotal: 40, ubicacion: "Cusco", canal: "Web", categoria: "Accesorios" },
    { id: "C7", ultimaCompra: "2026-05-20", pedidos: 3, gastoTotal: 300, ubicacion: "Lima", canal: "Web", categoria: "Ropa" },
    { id: "C8", ultimaCompra: "2026-04-10", pedidos: 4, gastoTotal: 400, ubicacion: "Lima", canal: "Tienda", categoria: "Ropa" },
    { id: "C9", ultimaCompra: "2026-06-28", pedidos: 2, gastoTotal: 150, ubicacion: "Trujillo", canal: "Web", categoria: "Accesorios" },
    { id: "C10", ultimaCompra: "2023-01-01", pedidos: 1, gastoTotal: 20, ubicacion: "Trujillo", canal: "Web", categoria: "Accesorios" },
  ];
}

test("calcularRFM + resumenSegmentos: el tamaño y los ingresos de todos los segmentos suman el 100 % de la base", () => {
  const clientes = clientesDePrueba();
  const rfm = calcularRFM(clientes, "2026-06-30");
  assert.equal(rfm.length, clientes.length);
  for (const c of rfm) {
    assert.ok(c.r >= 1 && c.r <= 5);
    assert.ok(c.f >= 1 && c.f <= 5);
    assert.ok(c.m >= 1 && c.m <= 5);
  }
  const resumen = resumenSegmentos(segmentosRFMParaResumen(rfm, nombresRfmPorDefecto()), Object.values(nombresRfmPorDefecto()));
  const sumaBase = resumen.reduce((s, r) => s + r.pctBase, 0);
  const sumaIngresos = resumen.reduce((s, r) => s + r.pctIngresos, 0);
  assert.ok(Math.abs(sumaBase - 100) < 1, `suma de % de base = ${sumaBase}`);
  assert.ok(Math.abs(sumaIngresos - 100) < 1, `suma de % de ingresos = ${sumaIngresos}`);
});

test("matrizRF: la suma de las 25 celdas es exactamente el total de clientes", () => {
  const clientes = clientesDePrueba();
  const rfm = calcularRFM(clientes, "2026-06-30");
  const matriz = matrizRF(rfm);
  assert.equal(matriz.length, 25);
  assert.equal(matriz.reduce((s, c) => s + c.cantidad, 0), clientes.length);
});

test("segmentarPorReglas: evalúa en orden (la primera que calza gana) y los que no calzan con ninguna caen en «Sin segmento»", () => {
  const clientes = clientesDePrueba();
  const reglas = [
    { id: "r1", nombre: "VIP", gastoMin: "1000", gastoMax: "", recenciaMinDias: "", recenciaMaxDias: "", pedidosMin: "", pedidosMax: "" },
    { id: "r2", nombre: "Activos", gastoMin: "", gastoMax: "", recenciaMinDias: "", recenciaMaxDias: "60", pedidosMin: "", pedidosMax: "" },
  ];
  const resultado = segmentarPorReglas(clientes, reglas, "2026-06-30");
  const c1 = resultado.find((c) => c.id === "C1")!; // gasto 2000 → VIP (primera regla)
  assert.equal(c1.segmentoNombre, "VIP");
  const c6 = resultado.find((c) => c.id === "C6")!; // gasto 40, última compra hace años → ninguna regla
  assert.equal(c6.segmentoNombre, "Sin segmento");
});

test("segmentosChicos solo marca los segmentos por debajo del mínimo definido por la persona", () => {
  const resumen = [
    { nombre: "A", cantidad: 3, pctBase: 10, pctIngresos: 10, recenciaMediaDias: 5, frecuenciaMedia: 1, gastoMedio: 10 },
    { nombre: "B", cantidad: 30, pctBase: 90, pctIngresos: 90, recenciaMediaDias: 5, frecuenciaMedia: 1, gastoMedio: 10 },
  ];
  assert.deepEqual(segmentosChicos(resumen, 20), ["A"]);
  assert.deepEqual(segmentosChicos(resumen, 2), []);
});

test("csvClientesPorSegmento: encabezado fijo y una fila por cliente, con comillas si un valor trae coma", () => {
  const csv = csvClientesPorSegmento([{ id: "C1", ultimaCompra: "2026-06-01", pedidos: 2, gastoTotal: 100, ubicacion: "Lima, Perú", canal: "Web", categoria: "Ropa", recenciaDias: 5, segmentoNombre: "VIP" }]);
  const filas = csv.split("\n");
  assert.equal(filas[0], "id_cliente,segmento,recencia_dias,pedidos,gasto_total,ubicacion,canal,categoria");
  assert.ok(filas[1].includes('"Lima, Perú"'));
});

test("textoDeSegmentos arma una línea legible por segmento, sin IDs de cliente", () => {
  const texto = textoDeSegmentos([{ nombre: "Campeones", cantidad: 10, pctBase: 20, pctIngresos: 40, recenciaMediaDias: 5, frecuenciaMedia: 8, gastoMedio: 500 }], "S/");
  assert.ok(texto.includes("Campeones: 10 clientes"));
  assert.ok(!/C\d+/.test(texto));
});

test("datosMinimos exige ID de cliente, fecha de referencia válida y clientes > 0; en modo «clientes» además exige la columna de pedidos", () => {
  const m = mapeoTransacciones();
  assert.equal(datosMinimos(m, "transacciones", "30/06/2026", 10), true);
  assert.equal(datosMinimos(m, "transacciones", "", 10), false);
  assert.equal(datosMinimos(m, "transacciones", "30/06/2026", 0), false);
  assert.equal(datosMinimos(m, "clientes", "30/06/2026", 10), false); // falta mapear pedidos
  const m2 = { ...m, pedidos: 3 };
  assert.equal(datosMinimos(m2, "clientes", "30/06/2026", 10), true);
});

test("CAMPOS_MAPEO: el único obligatorio es el ID de cliente", () => {
  const obligatorios = CAMPOS_MAPEO.filter((c) => c.obligatorio).map((c) => c.clave);
  assert.deepEqual(obligatorios, ["clienteId"]);
});

const FICHA = { archivo: "clientes.csv", hojas: ["clientes.csv"], hojaActiva: "clientes.csv", totalFilas: 10, truncado: false, columnas: [{ nombre: "cliente", indice: 0, tipo: "texto" as const, pctVacios: 0, valoresUnicos: 10, minimo: "", maximo: "", muestra: ["C1", "C2"] }] };

const RESUMEN_PRUEBA = [
  { nombre: "Campeones", cantidad: 2, pctBase: 20, pctIngresos: 50, recenciaMediaDias: 3, frecuenciaMedia: 9, gastoMedio: 1750 },
  { nombre: "Perdidos", cantidad: 3, pctBase: 30, pctIngresos: 10, recenciaMediaDias: 500, frecuenciaMedia: 1, gastoMedio: 30 },
];

test("el prompt tiene los 8 bloques, nunca un ID de cliente en la FUENTE y los 7 títulos de salida en orden", () => {
  const datos = { mapeo: mapeoTransacciones(), origenDatos: "transacciones" as const, fechaReferencia: "30/06/2026", metodo: "rfm" as const, tamanoMinimoSegmento: "20", nombresRfm: nombresRfmPorDefecto(), reglas: [], negocio: "Tienda de ropa", modo: "B" as const, respuesta: "", nombreOrigen: "clientes.csv" };
  const prompt = construirPromptSegmentarClientes(datos, FICHA, RESUMEN_PRUEBA, 10);
  for (const b of ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"]) assert.ok(prompt.includes(b), b);
  assert.ok(!/\bC1\b/.test(prompt) && !/\bC2\b/.test(prompt));
  const orden = TITULOS_RESPUESTA.map((t) => `## ${t.titulo}`);
  let ultimoIndice = -1;
  for (const titulo of orden) {
    const i = prompt.indexOf(titulo);
    assert.ok(i > ultimoIndice, `${titulo} fuera de orden`);
    ultimoIndice = i;
  }
});

test("con los campos vacíos el prompt dice «(no indicado)»; progresoSegmentarClientes calcula el % y lo que falta", () => {
  const datos = { mapeo: mapeoVacio(), origenDatos: "transacciones" as const, fechaReferencia: "", metodo: "rfm" as const, tamanoMinimoSegmento: "", nombresRfm: nombresRfmPorDefecto(), reglas: [], negocio: "", modo: "B" as const, respuesta: "", nombreOrigen: "" };
  const prompt = construirPromptSegmentarClientes(datos, FICHA, [], 0);
  assert.ok(prompt.includes("(no indicado)"));
  const p0 = progresoSegmentarClientes(false, false, false);
  assert.equal(p0.porcentaje, 0);
  assert.equal(p0.faltan.length, 3);
  const p1 = progresoSegmentarClientes(true, true, true);
  assert.equal(p1.porcentaje, 100);
});

const RESPUESTA_VALIDA = `## Segmentos (datos)
- Campeones: 2 clientes (20% de la base), 50% de los ingresos, los que más gastan y más seguido compran.
- Perdidos: 3 clientes (30% de la base), 10% de los ingresos, no compran hace mucho tiempo.

## Perfiles [INTERPRETACIÓN]
- [INTERPRETACIÓN] Campeones parece ser la base más fiel del negocio.
- [INTERPRETACIÓN] Perdidos podría necesitar una campaña de reactivación.

## Calidad de la segmentación
- Ambos segmentos superan el tamaño mínimo definido.

## Acciones a probar por segmento
- Campeones: objetivo retener; probar un programa de puntos; métrica: tasa de recompra a 90 días; riesgo: premiar a quien ya iba a comprar.
- Perdidos: objetivo reactivar; probar un mensaje sin descuento vs con descuento del 10%; métrica: % que vuelve a comprar en 30 días; riesgo: regalar descuentos a clientes que no van a volver de todas formas.

## Datos que faltan
- El canal de contacto preferido de cada cliente ayudaría a elegir el mensaje.

## Qué debes verificar
- Que el tamaño mínimo siga siendo razonable para tu negocio.

## Siguiente paso
- Exporta la lista de «Perdidos» y prueba primero ahí.`;

test("el lector entiende la respuesta: 7 secciones, perfiles etiquetados y acciones con su métrica", () => {
  const l = leerRespuestaSegmentarClientes(RESPUESTA_VALIDA);
  assert.equal(l.valido, true);
  assert.equal(l.segmentos.length, 2);
  assert.equal(l.perfiles.length, 2);
  assert.ok(l.perfiles.every((p) => p.includes("[INTERPRETACIÓN]")));
  assert.equal(l.acciones.length, 2);
  assert.equal(l.siguiente.length, 1);
});

test("una respuesta sin «Segmentos» ni «Perfiles» no es válida y explica qué falta", () => {
  const l = leerRespuestaSegmentarClientes("Claro, aquí tienes el análisis.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

const DATOS_PRUEBA = { mapeo: mapeoTransacciones(), origenDatos: "transacciones" as const, fechaReferencia: "30/06/2026", metodo: "rfm" as const, tamanoMinimoSegmento: "1", nombresRfm: nombresRfmPorDefecto(), reglas: [], negocio: "Tienda de ropa", modo: "B" as const, respuesta: RESPUESTA_VALIDA, nombreOrigen: "clientes.csv" };

test("revisarSegmentarClientes no marca cifras inventadas en una respuesta consistente con la tabla de segmentos", () => {
  const l = leerRespuestaSegmentarClientes(RESPUESTA_VALIDA);
  const r = revisarSegmentarClientes(l, DATOS_PRUEBA, FICHA, RESUMEN_PRUEBA, 10);
  assert.deepEqual(r.cifras.montos, []);
  assert.deepEqual(r.cifras.porcentajes, []);
});

test("revisarSegmentarClientes detecta un monto inventado en «Segmentos (datos)», pero ignora el 10 % de descuento propuesto en «Acciones a probar»", () => {
  const inventada = RESPUESTA_VALIDA.replace("50% de los ingresos", "50% de los ingresos y factura S/ 45,000 al mes");
  const l = leerRespuestaSegmentarClientes(inventada);
  const r = revisarSegmentarClientes(l, DATOS_PRUEBA, FICHA, RESUMEN_PRUEBA, 10);
  assert.ok(r.cifras.montos.some((m) => m.includes("45")), r.cifras.montos.join(","));
});

test("CLAVES_SEGMENTO_RFM tiene 6 franjas y cada una tiene un nombre por defecto", () => {
  assert.equal(CLAVES_SEGMENTO_RFM.length, 6);
  const nombres = nombresRfmPorDefecto();
  for (const clave of CLAVES_SEGMENTO_RFM) assert.ok(nombres[clave]);
});
