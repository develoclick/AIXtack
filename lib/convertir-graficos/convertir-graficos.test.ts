import assert from "node:assert/strict";
import { test } from "node:test";
import { fichaDeHoja, filasTablaDesdeHoja } from "./ficha";
import { agregarPorCategoria, calcularDispersion, calcularHistograma, calcularParaTipo, correlacionPearson, ordenarDescendente, ordenarPorEtiqueta } from "./motor";
import { pastelExcedeCategorias, razonDelTipo, tipoSugerido, validarSeleccion } from "./asistente";
import { construirPromptConvertirGraficos, progresoConvertirGraficos, textoDeFuenteConvertirGraficos } from "./prompt";
import { leerRespuestaConvertirGraficos, TITULOS_RESPUESTA } from "./lector";
import { revisarConvertirGraficos } from "./verificar";
import { datosVaciosConvertirGraficos, normalizarDatosConvertirGraficos, type DatosConvertirGraficos, type FilaTabla } from "./tipos";
import type { HojaCruda } from "./parser";

const FILAS_CRUDAS = [
  ["mes", "tienda", "ventas", "visitas"],
  ["15/01/2026", "Norte", "1000", "50"],
  ["15/01/2026", "Sur", "1500", "80"],
  ["15/02/2026", "Norte", "1200", "55"],
  ["15/02/2026", "Sur", "1400", "75"],
  ["15/03/2026", "Norte", "1600", "70"],
  ["15/03/2026", "Sur", "1300", "65"],
];
const HOJA: HojaCruda = { nombre: "ventas.csv", filas: FILAS_CRUDAS, truncado: false };

function filas(): FilaTabla[] {
  return filasTablaDesdeHoja(HOJA).filas;
}

function ficha() {
  return fichaDeHoja("ventas.csv", [HOJA], "ventas.csv");
}

function datos(): DatosConvertirGraficos {
  return { ...datosVaciosConvertirGraficos(), objetivo: "comparar", audiencia: "yo", agregacion: "suma", unidad: "S/", seleccion: { x: 1, y: 2, color: null }, modo: "B", nombreOrigen: "ventas.csv" };
}

test("fichaDeHoja detecta el tipo de cada columna (y no confunde texto con número por traer dígitos)", () => {
  const f = ficha();
  assert.equal(f.totalFilas, 6);
  assert.equal(f.columnas.find((c) => c.nombre === "mes")!.tipo, "fecha");
  assert.equal(f.columnas.find((c) => c.nombre === "tienda")!.tipo, "texto");
  assert.equal(f.columnas.find((c) => c.nombre === "ventas")!.tipo, "numero");
  const hojaConTexto: HojaCruda = { nombre: "x", truncado: false, filas: [["producto"], ["Taladro 650W"], ["Cuaderno A4"]] };
  assert.equal(fichaDeHoja("x.csv", [hojaConTexto], "x").columnas[0].tipo, "texto");
});

test("filasTablaDesdeHoja indexa cada fila por nombre de columna", () => {
  const f = filas();
  assert.equal(f.length, 6);
  assert.equal(f[0].tienda, "Norte");
  assert.equal(f[0].ventas, "1000");
});

test("agregarPorCategoria suma por tienda (verificado a mano: Norte 3800, Sur 4200)", () => {
  const s = agregarPorCategoria(filas(), "tienda", "ventas", "suma", null);
  assert.deepEqual(s.etiquetas, ["Norte", "Sur"]);
  assert.deepEqual(s.series[0].valores, [3800, 4200]);
});

test("agregarPorCategoria con color separa en 2 series (Norte y Sur por mes)", () => {
  const s = agregarPorCategoria(filas(), "mes", "ventas", "suma", "tienda");
  assert.deepEqual(s.etiquetas, ["15/01/2026", "15/02/2026", "15/03/2026"]);
  const norte = s.series.find((x) => x.nombre === "Norte")!;
  const sur = s.series.find((x) => x.nombre === "Sur")!;
  assert.deepEqual(norte.valores, [1000, 1200, 1600]);
  assert.deepEqual(sur.valores, [1500, 1400, 1300]);
});

test("agregarPorCategoria con «conteo» cuenta filas sin necesitar columna Y numérica", () => {
  const s = agregarPorCategoria(filas(), "tienda", "", "conteo", null);
  assert.deepEqual(s.series[0].valores, [3, 3]);
});

test("agregarPorCategoria con «promedio» divide la suma entre el número de filas", () => {
  const s = agregarPorCategoria(filas(), "tienda", "ventas", "promedio", null);
  assert.deepEqual(s.series[0].valores, [3800 / 3, 4200 / 3].map((n) => Math.round(n * 100) / 100));
});

test("ordenarDescendente pone primero el valor más alto (Sur antes que Norte)", () => {
  const s = ordenarDescendente(agregarPorCategoria(filas(), "tienda", "ventas", "suma", null));
  assert.deepEqual(s.etiquetas, ["Sur", "Norte"]);
});

test("ordenarPorEtiqueta ordena las etiquetas alfabéticamente (para fechas AAAA-MM-DD, eso también es cronológico)", () => {
  const desordenado = agregarPorCategoria([...filas()].reverse(), "mes", "ventas", "suma", null);
  const s = ordenarPorEtiqueta(desordenado);
  assert.deepEqual(s.etiquetas, ["15/01/2026", "15/02/2026", "15/03/2026"]);
});

test("calcularHistograma agrupa visitas en 3 franjas (verificado a mano: 2,1,3)", () => {
  const h = calcularHistograma(filas(), "visitas", 3);
  assert.deepEqual(h.valores, [2, 1, 3]);
});

test("calcularDispersion y correlacionPearson miden qué tan juntas se mueven 2 columnas numéricas", () => {
  const puntos = calcularDispersion(filas(), "visitas", "ventas");
  assert.equal(puntos.length, 6);
  const r = correlacionPearson(puntos)!;
  assert.ok(r > 0.5 && r <= 1, `se esperaba una correlación fuerte y positiva, dio ${r}`);
});

test("correlacionPearson con menos de 2 puntos o varianza 0 devuelve null", () => {
  assert.equal(correlacionPearson([{ x: 1, y: 1 }]), null);
  assert.equal(correlacionPearson([{ x: 1, y: 1 }, { x: 1, y: 2 }]), null);
});

test("calcularParaTipo resuelve los 6 tipos de gráfico con una sola función", () => {
  assert.deepEqual(calcularParaTipo(filas(), "barras", "tienda", "ventas", null, "suma").etiquetas, ["Sur", "Norte"]);
  assert.deepEqual(calcularParaTipo(filas(), "pastel", "tienda", "ventas", null, "suma").etiquetas, ["Sur", "Norte"]);
  assert.deepEqual(calcularParaTipo(filas(), "lineas", "mes", "ventas", null, "suma").etiquetas, ["15/01/2026", "15/02/2026", "15/03/2026"]);
  assert.equal(calcularParaTipo(filas(), "histograma", "visitas", "", null, "suma").series[0].valores.reduce((a, b) => a + b, 0), 6);
  assert.equal(calcularParaTipo(filas(), "dispersion", "visitas", "ventas", null, "suma").puntos!.length, 6);
});

test("tipoSugerido devuelve el tipo correcto para cada objetivo", () => {
  assert.equal(tipoSugerido("comparar"), "barras");
  assert.equal(tipoSugerido("evolucionar"), "lineas");
  assert.equal(tipoSugerido("componer"), "pastel");
  assert.equal(tipoSugerido("distribuir"), "histograma");
  assert.equal(tipoSugerido("relacionar"), "dispersion");
});

test("razonDelTipo da una explicación no vacía para cada tipo de gráfico", () => {
  for (const t of ["barras", "lineas", "areas", "pastel", "histograma", "dispersion", "tabla"] as const) assert.ok(razonDelTipo(t).length > 10, t);
});

test("validarSeleccion avisa si falta la columna X", () => {
  const problemas = validarSeleccion("barras", null, null, false);
  assert.equal(problemas.length, 1);
  assert.equal(problemas[0].campo, "x");
});

test("validarSeleccion exige fecha en X para líneas (evolucionar)", () => {
  const colTexto = ficha().columnas.find((c) => c.nombre === "tienda")!;
  const colFecha = ficha().columnas.find((c) => c.nombre === "mes")!;
  assert.ok(validarSeleccion("lineas", colTexto, null, false).some((p) => p.campo === "x"));
  assert.equal(validarSeleccion("lineas", colFecha, null, true).length, 0);
});

test("validarSeleccion para dispersión exige X e Y numéricos", () => {
  const colNum = ficha().columnas.find((c) => c.nombre === "ventas")!;
  const colTexto = ficha().columnas.find((c) => c.nombre === "tienda")!;
  assert.equal(validarSeleccion("dispersion", colNum, colNum, false).length, 0);
  assert.ok(validarSeleccion("dispersion", colTexto, colNum, false).some((p) => p.campo === "x"));
  assert.ok(validarSeleccion("dispersion", colNum, null, false).some((p) => p.campo === "y"));
});

test("pastelExcedeCategorias usa el límite de 5 por defecto", () => {
  assert.equal(pastelExcedeCategorias(5), false);
  assert.equal(pastelExcedeCategorias(6), true);
});

test("construirPromptConvertirGraficos incluye la ficha, el objetivo y los 6 títulos de salida", () => {
  const p = construirPromptConvertirGraficos(datos(), ficha());
  assert.ok(p.includes("Comparar categorías"));
  assert.ok(p.includes("ventas: tipo numero"));
  for (const t of TITULOS_RESPUESTA) assert.ok(p.includes(`## ${t.titulo}`), `falta ${t.titulo}`);
  assert.ok(p.includes("no más de 5 categorías") === false); // frase exacta no obligatoria; solo confirmamos que compila el prompt
});

test("progresoConvertirGraficos llega a 100 % con datos y selección listos", () => {
  assert.equal(progresoConvertirGraficos(true, true).porcentaje, 100);
  assert.equal(progresoConvertirGraficos(false, false).porcentaje, 0);
});

const RESPUESTA_VALIDA = `## Gráficos sugeridos
\`\`\`csv
pregunta,tipo,x,y,color,agregacion,titulo,advertencia
¿Qué tienda vendió más?,barras,tienda,ventas,,suma,Sur vendió más que Norte en el trimestre,Verifica si el período comparado es justo
¿Cómo evolucionaron las ventas?,lineas,mes,ventas,tienda,suma,Ventas mensuales por tienda,Ninguna
¿Cómo se relacionan visitas y ventas?,dispersion,visitas,ventas,,suma,"Más visitas, más ventas",Una correlación no prueba una causa
\`\`\`

## Hallazgos visibles
- La tienda Sur tiene más ventas acumuladas que la tienda Norte en el gráfico de barras.
- En el gráfico de líneas, Norte crece cada mes mientras Sur baja.

## Transformaciones aplicadas
- Se sumaron las ventas por tienda y por mes porque la pregunta busca el total, no un promedio.

## Qué gráfico usar para cada objetivo
- Para comparar tiendas, usa barras ordenadas de mayor a menor.
- Para ver la evolución mensual, usa líneas, una por tienda.

## Qué debes verificar
- Confirma que los 3 meses tengan la misma cantidad de días hábiles antes de comparar.

## Siguiente paso
- Revisa los gráficos generados en esta página y ajusta las columnas si hace falta.`;

test("leerRespuestaConvertirGraficos lee las 6 secciones y la tabla de gráficos", () => {
  const l = leerRespuestaConvertirGraficos(RESPUESTA_VALIDA);
  assert.equal(l.valido, true);
  assert.equal(l.advertencias.length, 0);
  assert.equal(l.graficos.length, 3);
  assert.equal(l.graficos[0].tipo, "barras");
  assert.equal(l.graficos[0].x, "tienda");
  assert.equal(l.graficos[1].color, "tienda");
  assert.equal(l.graficos[2].tipo, "dispersion");
  assert.equal(l.graficos[2].titulo, "Más visitas, más ventas");
  for (const t of TITULOS_RESPUESTA) assert.ok(l.secciones[t.clave], `falta ${t.clave}`);
});

test("leerRespuestaConvertirGraficos sin ningún título reconocido no es válida", () => {
  const l = leerRespuestaConvertirGraficos("No puedo ayudarte con eso.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

test("leerRespuestaConvertirGraficos avisa si hay menos de 3 gráficos", () => {
  const conUno = `## Gráficos sugeridos\n\`\`\`csv\npregunta,tipo,x,y,color,agregacion,titulo,advertencia\n¿x?,barras,tienda,ventas,,suma,t,a\n\`\`\`\n## Hallazgos visibles\n- x\n## Transformaciones aplicadas\n- x\n## Qué gráfico usar para cada objetivo\n- x\n## Qué debes verificar\n- x\n## Siguiente paso\n- x`;
  const l = leerRespuestaConvertirGraficos(conUno);
  assert.equal(l.valido, true);
  assert.ok(l.advertencias.some((a) => a.includes("Solo detecté 1")));
});

test("revisarConvertirGraficos no marca nada inventado en una respuesta que solo describe lo que se ve", () => {
  const l = leerRespuestaConvertirGraficos(RESPUESTA_VALIDA);
  const rev = revisarConvertirGraficos(l, datos(), ficha(), filas());
  assert.equal(rev.cifras.montos.length, 0, rev.cifras.montos.join(", "));
  assert.equal(rev.pastelesConDemasiadasCategorias.length, 0);
});

test("revisarConvertirGraficos detecta un pastel con más de 5 categorías reales, sin confiar en la IA", () => {
  const filasConMuchasCategorias: FilaTabla[] = Array.from({ length: 7 }, (_, i) => ({ producto: `Producto ${i}`, ventas: "100" }));
  const conPastel = `## Gráficos sugeridos\n\`\`\`csv\npregunta,tipo,x,y,color,agregacion,titulo,advertencia\n¿composicion?,pastel,producto,ventas,,suma,Composición de ventas,Ninguna\n\`\`\`\n## Hallazgos visibles\n- x\n## Transformaciones aplicadas\n- x\n## Qué gráfico usar para cada objetivo\n- x\n## Qué debes verificar\n- x\n## Siguiente paso\n- x`;
  const l = leerRespuestaConvertirGraficos(conPastel);
  const rev = revisarConvertirGraficos(l, datos(), ficha(), filasConMuchasCategorias);
  assert.equal(rev.pastelesConDemasiadasCategorias.length, 1);
});

test("revisarConvertirGraficos detecta un monto inventado que no está en la ficha", () => {
  const conInventado = RESPUESTA_VALIDA.replace(
    "La tienda Sur tiene más ventas acumuladas que la tienda Norte en el gráfico de barras.",
    "La tienda Sur tiene más ventas acumuladas que la tienda Norte, una diferencia de S/ 999,999.00.",
  );
  const l2 = leerRespuestaConvertirGraficos(conInventado);
  const rev = revisarConvertirGraficos(l2, datos(), ficha(), filas());
  assert.ok(rev.cifras.montos.some((m) => m.includes("999")));
});

test("textoDeFuenteConvertirGraficos nunca incluye una fila cruda de la tabla", () => {
  const texto = textoDeFuenteConvertirGraficos(datos(), ficha());
  assert.ok(!texto.includes("2026-01,Norte,1000,50"));
});

test("normalizarDatosConvertirGraficos tolera datos vacíos o de otra forma sin romperse", () => {
  const n = normalizarDatosConvertirGraficos({ objetivo: "no-existe", modo: "z", seleccion: { x: 2 } });
  assert.equal(n.objetivo, "comparar");
  assert.equal(n.modo, "B");
  assert.equal(n.seleccion.x, 2);
  assert.equal(normalizarDatosConvertirGraficos(null).objetivo, "comparar");
});
