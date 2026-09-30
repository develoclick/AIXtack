import assert from "node:assert/strict";
import { test } from "node:test";
import { EJEMPLOS_FECHAS } from "../../content/ejemplos/fechas";
import { coincideConGeneradas, combinacionesFaltantes, filasAjenas, incluyeBodega, mapaDeCalor, masBarata, medianaPrecios, ordenarFilas, precioAjustado, prepararFilas } from "./analisis";
import { combinacionesPorDuracion, diaDeLaSemana, diasDelPeriodo, generarCombinaciones, parsearDuraciones, viajerosDeFechas } from "./calculo";
import { aCsvFechas, aTablaFechas, textoCombinacionesFaltantes } from "./exportar";
import { leerCombinaciones, leerRespuestaFechas } from "./lector";
import { construirPromptFechas, datosMinimosFechas, progresoFechas, textoDeFuenteFechas } from "./prompt";
import { datosVaciosFechas, MAX_COMBINACIONES, TITULOS_RESPUESTA } from "./tipos";
import { revisarFechas } from "./verificar";

const [cusco, arequipa, buenosAires] = EJEMPLOS_FECHAS;

test("duraciones: enteros positivos, sin repetir, ordenados", () => {
  assert.deepEqual(parsearDuraciones("5, 6, 7"), [5, 6, 7]);
  assert.deepEqual(parsearDuraciones("7 5 5 6"), [5, 6, 7]);
  assert.deepEqual(parsearDuraciones("abc, -3, 0, 5"), [5]);
  assert.deepEqual(parsearDuraciones(""), []);
});

test("días del período y combinaciones por duración: 1–30 nov = 29 días → 25 + 24 + 23 = 72", () => {
  assert.equal(diasDelPeriodo({ fechaInicio: "2026-11-01", fechaFin: "2026-11-30" }), 29);
  assert.equal(combinacionesPorDuracion(29, 5), 25);
  assert.equal(combinacionesPorDuracion(29, 6), 24);
  assert.equal(combinacionesPorDuracion(29, 7), 23);
  assert.equal(diasDelPeriodo({ fechaInicio: "2026-11-30", fechaFin: "2026-11-01" }), null);
});

test("genera las 72 combinaciones del ejemplo de Lima–Cusco, con la primera y la última correctas", () => {
  const combinaciones = generarCombinaciones(cusco.datos);
  assert.equal(combinaciones.length, 72);
  assert.deepEqual(combinaciones[0], { ...combinaciones[0], ida: "2026-11-01", vuelta: "2026-11-06", noches: 5 });
  const ultima5 = combinaciones.filter((c) => c.noches === 5).at(-1)!;
  assert.deepEqual([ultima5.ida, ultima5.vuelta], ["2026-11-25", "2026-11-30"]);
  const ultima7 = combinaciones.filter((c) => c.noches === 7).at(-1)!;
  assert.deepEqual([ultima7.ida, ultima7.vuelta], ["2026-11-23", "2026-11-30"]);
});

test("un período muy largo se trunca en MAX_COMBINACIONES y lo dice el prompt", () => {
  const d = { ...datosVaciosFechas(), origen: "A", destino: "B", fechaInicio: "2020-01-01", fechaFin: "2030-01-01", duraciones: "5", adultos: "1" };
  const combinaciones = generarCombinaciones(d);
  assert.equal(combinaciones.length, MAX_COMBINACIONES);
  assert.ok(construirPromptFechas(d).includes("se generaron las primeras 500"));
});

test("día de la semana: 11 de noviembre de 2026 es miércoles y el 14 es sábado", () => {
  assert.equal(diaDeLaSemana("2026-11-11"), 2);
  assert.equal(diaDeLaSemana("2026-11-14"), 5);
  assert.equal(diaDeLaSemana(""), null);
});

test("viajeros de fechas: adultos entero ≥ 1; niños e infantes cuentan aparte", () => {
  assert.equal(viajerosDeFechas({ adultos: "2", ninos: "1", infantes: "0" }).total, 3);
  assert.equal(viajerosDeFechas({ adultos: "0", ninos: "0", infantes: "0" }).adultos, null);
});

test("el prompt tiene los 8 bloques, los títulos exactos y «(no indicado)» cuando falta algo", () => {
  const vacio = construirPromptFechas(datosVaciosFechas());
  for (const b of ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"]) assert.ok(vacio.includes(b), b);
  assert.ok(vacio.includes("(no indicado)"));
  const p = construirPromptFechas(cusco.datos);
  for (const t of TITULOS_RESPUESTA) assert.ok(p.includes(`## ${t.titulo}`), t.titulo);
  assert.ok(p.includes("ACCESO A DATOS EN TIEMPO REAL"));
  assert.ok(p.includes("ida,vuelta,noches\n2026-11-01,2026-11-06,5"));
  assert.ok(p.includes("72 combinaciones"));
  assert.ok(p.includes("Nunca completes una combinación con un precio estimado"));
});

test("el progreso pide origen, destino, período y duraciones; los ejemplos llegan al 80 % recomendado", () => {
  assert.equal(progresoFechas(datosVaciosFechas()).porcentaje, 0);
  assert.equal(datosMinimosFechas(datosVaciosFechas()), false);
  for (const e of EJEMPLOS_FECHAS) {
    assert.ok(progresoFechas(e.datos).porcentaje >= 80, e.id);
    assert.equal(datosMinimosFechas(e.datos), true, e.id);
  }
});

test("cada ejemplo se lee completo y sin advertencias (salvo el aviso esperado de acceso en el de Arequipa)", () => {
  for (const e of EJEMPLOS_FECHAS) {
    const l = leerRespuestaFechas(e.respuesta);
    assert.equal(l.valido, true, e.id);
    if (e.id === "lima-arequipa") {
      assert.equal(l.accesoTiempoReal, "no");
      assert.deepEqual(l.filas, []);
    } else {
      assert.deepEqual(l.advertencias, [], e.id);
      assert.equal(l.accesoTiempoReal, "si", e.id);
    }
    for (const t of TITULOS_RESPUESTA) assert.ok(t.clave in l.secciones, `${e.id}: ${t.titulo}`);
  }
  assert.equal(leerRespuestaFechas(cusco.respuesta).filas.length, 18);
  assert.equal(leerRespuestaFechas(buenosAires.respuesta).filas.length, 5);
});

test("todas las filas de los ejemplos están verificadas (traen fuente y fecha de consulta) salvo el de Arequipa", () => {
  for (const e of [cusco, buenosAires]) {
    const l = leerRespuestaFechas(e.respuesta);
    assert.ok(l.filas.every((f) => f.verificada), e.id);
  }
});

test("las verificaciones no marcan ninguna fila ajena, ninguna cifra inventada, y avisan del acceso «no» en el ejemplo de Arequipa", () => {
  for (const e of EJEMPLOS_FECHAS) {
    const l = leerRespuestaFechas(e.respuesta);
    const r = revisarFechas(l, e.datos);
    assert.deepEqual(r.ajenas, [], e.id);
    assert.deepEqual(r.cifras, { montos: [], porcentajes: [] }, e.id);
    if (e.id === "lima-arequipa") {
      assert.equal(r.sinAcceso, true);
      assert.ok(r.avisos.some((a) => a.includes("NO tiene acceso a datos en tiempo real")));
    } else {
      assert.equal(r.sinAcceso, false, e.id);
      assert.equal(r.sinVerificar, 0, e.id);
    }
  }
});

test("el lector lee la tabla de 14 columnas con comas entre comillas y descarta filas con el número de columnas incorrecto", () => {
  const cab = "ida,vuelta,noches,precio_total,moneda,precio_por_persona,aerolinea,horario_ida,horario_vuelta,escalas,equipaje,condiciones,fuente,consultado_en";
  const buena = `${cab}\n2026-11-01,2026-11-06,5,1280,S/,640,"Aerolínea, S.A.",06:00,19:00,Directo,Solo mano,"Básica, sin cambios",Buscador,2026-09-20 10:00`;
  const a = leerCombinaciones(buena);
  assert.equal(a.filas.length, 1);
  assert.equal(a.filas[0].aerolinea, "Aerolínea, S.A.");
  assert.equal(a.filas[0].verificada, true);
  const corta = `${cab}\n2026-11-01,2026-11-06,5,1280`;
  const b = leerCombinaciones(corta);
  assert.equal(b.filas.length, 0);
  assert.equal(b.ilegibles.length, 1);
  assert.equal(leerCombinaciones("no es una tabla").filas.length, 0);
});

test("una fila sin fuente ni fecha de consulta se marca como no verificada", () => {
  const cab = "ida,vuelta,noches,precio_total,moneda,precio_por_persona,aerolinea,horario_ida,horario_vuelta,escalas,equipaje,condiciones,fuente,consultado_en";
  const l = leerCombinaciones(`${cab}\n2026-11-01,2026-11-06,5,1280,S/,640,Aerolinea,06:00,19:00,Directo,Solo mano,Basica,,`);
  assert.equal(l.filas[0].verificada, false);
});

test("el lector tolera negritas, cercas de código y detecta la línea de acceso a datos en tiempo real en cualquier formato", () => {
  const raw = "**ACCESO A DATOS EN TIEMPO REAL: SÍ**\n\n## Combinaciones\n```csv\nida,vuelta,noches,precio_total,moneda,precio_por_persona,aerolinea,horario_ida,horario_vuelta,escalas,equipaje,condiciones,fuente,consultado_en\n2026-11-01,2026-11-06,5,1280,S/,640,Aerolinea,06:00,19:00,Directo,Solo mano,Basica,Buscador,2026-09-20 10:00\n```\n\n## Patrones observados\n- Miércoles más barato";
  const l = leerRespuestaFechas(raw);
  assert.equal(l.accesoTiempoReal, "si");
  assert.equal(l.filas.length, 1);
  assert.ok(l.advertencias.some((a) => a.includes("«Costos no incluidos»")));
  const malo = leerRespuestaFechas("No tengo acceso a internet, lo siento.");
  assert.equal(malo.valido, false);
});

test("una tabla pegada a mano (sin títulos, método guiado) se lee igual, sin la lista de advertencias del formato de la IA", () => {
  const cab = "ida,vuelta,noches,precio_total,moneda,precio_por_persona,aerolinea,horario_ida,horario_vuelta,escalas,equipaje,condiciones,fuente,consultado_en";
  const l = leerRespuestaFechas(`${cab}\n2026-11-11,2026-11-16,5,1280,S/,640,Aerolinea,06:00,19:00,Directo,Solo mano,Basica,Buscador,2026-09-20 10:00`);
  assert.equal(l.valido, true);
  assert.equal(l.filas.length, 1);
  assert.deepEqual(l.advertencias, []);
});

test("el análisis detecta si el equipaje de bodega ya está incluido en el texto de la fila", () => {
  assert.equal(incluyeBodega("Incluye 1 maleta de 23 kg en bodega"), true);
  assert.equal(incluyeBodega("Solo equipaje de mano"), false);
  assert.equal(incluyeBodega("Tarifa básica, bodega no incluida"), false);
  assert.equal(incluyeBodega(""), false);
});

test("el precio ajustado suma el equipaje de bodega solo a las filas que no lo incluyen, y respeta el número de adultos y niños", () => {
  const fila = { ida: "2026-11-11", vuelta: "2026-11-16", noches: 5, precioTotal: 1280, moneda: "S/", precioPorPersona: 640, aerolinea: "X", horarioIda: "", horarioVuelta: "", escalas: "", equipaje: "Solo mano", condiciones: "", fuente: "f", consultadoEn: "c", verificada: true };
  assert.equal(precioAjustado(fila, { costoEquipajeBodega: "80", costoTraslados: "", adultos: "2", ninos: "0" }), 1440);
  const conBodega = { ...fila, equipaje: "Incluye maleta en bodega" };
  assert.equal(precioAjustado(conBodega, { costoEquipajeBodega: "80", costoTraslados: "", adultos: "2", ninos: "0" }), 1280);
  assert.equal(precioAjustado(fila, { costoEquipajeBodega: "", costoTraslados: "", adultos: "2", ninos: "0" }), 1280);
  assert.equal(precioAjustado({ ...fila, precioTotal: null }, { costoEquipajeBodega: "80", costoTraslados: "", adultos: "2", ninos: "0" }), null);
});

test("con el ajuste de equipaje del ejemplo de Cusco, la 2.ª opción más barata pasa a ser la 1.ª (ya incluía bodega)", () => {
  const l = leerRespuestaFechas(cusco.respuesta);
  const generadas = generarCombinaciones(cusco.datos);
  const sinAjuste = ordenarFilas(prepararFilas(l.filas, generadas, cusco.datos, false), "precio");
  assert.equal(sinAjuste[0].ida, "2026-11-11");
  assert.equal(sinAjuste[0].precioComparado, 1280);
  assert.equal(sinAjuste[1].ida, "2026-11-04");
  assert.equal(sinAjuste[1].precioComparado, 1360);
  const conAjuste = ordenarFilas(prepararFilas(l.filas, generadas, cusco.datos, true), "precio");
  assert.equal(conAjuste[0].ida, "2026-11-04");
  assert.equal(conAjuste[0].precioComparado, 1360);
  assert.equal(conAjuste[1].ida, "2026-11-11");
  assert.equal(conAjuste[1].precioComparado, 1440);
  const masBarataSinAjuste = masBarata(sinAjuste)!;
  assert.equal(masBarataSinAjuste.precioComparado, 1280);
});

test("la más barata del ejemplo de Cusco cuesta 42 % menos que la misma duración saliendo el sábado", () => {
  const l = leerRespuestaFechas(cusco.respuesta);
  const min = l.filas.find((f) => f.ida === "2026-11-11" && f.noches === 5)!;
  const sabado = l.filas.find((f) => f.ida === "2026-11-14" && f.noches === 5)!;
  const diferencia = Math.round(((sabado.precioTotal! - min.precioTotal!) / min.precioTotal!) * 1000) / 10;
  assert.equal(min.precioTotal, 1280);
  assert.equal(sabado.precioTotal, 1820);
  assert.equal(diferencia, 42.2);
});

test("la mediana de precios del ejemplo de Cusco se calcula sobre las 18 filas consultadas", () => {
  const l = leerRespuestaFechas(cusco.respuesta);
  const generadas = generarCombinaciones(cusco.datos);
  const preparadas = prepararFilas(l.filas, generadas, cusco.datos, false);
  const mediana = medianaPrecios(preparadas);
  assert.equal(mediana, 1560);
});

test("las combinaciones faltantes son las generadas que ninguna fila cubre; en Cusco quedan 72 − 18 = 54", () => {
  const l = leerRespuestaFechas(cusco.respuesta);
  const generadas = generarCombinaciones(cusco.datos);
  const faltan = combinacionesFaltantes(generadas, l.filas);
  assert.equal(faltan.length, 54);
  assert.ok(textoCombinacionesFaltantes(faltan).includes("→"));
});

test("una fila con fechas que la página no generó se marca como ajena", () => {
  const generadas = generarCombinaciones(cusco.datos);
  const ajena = { ida: "2026-12-01", vuelta: "2026-12-06", noches: 5, precioTotal: 1000, moneda: "S/", precioPorPersona: 500, aerolinea: "X", horarioIda: "", horarioVuelta: "", escalas: "", equipaje: "", condiciones: "", fuente: "f", consultadoEn: "c", verificada: true };
  assert.equal(coincideConGeneradas(ajena, generadas), false);
  assert.deepEqual(filasAjenas([ajena], generadas), [ajena]);
});

test("el mapa de calor toma el precio mínimo por día de la semana y duración, solo con datos reales", () => {
  const l = leerRespuestaFechas(cusco.respuesta);
  const generadas = generarCombinaciones(cusco.datos);
  const preparadas = prepararFilas(l.filas, generadas, cusco.datos, false);
  const celdas = mapaDeCalor(preparadas, [5, 6, 7]);
  const miercoles5 = celdas.find((c) => c.dia === 2 && c.noches === 5)!;
  assert.equal(miercoles5.minimo, 1280);
  assert.ok(miercoles5.cantidad >= 1);
  const domingo5 = celdas.find((c) => c.dia === 6 && c.noches === 5)!;
  assert.equal(domingo5.minimo, null);
});

test("la exportación a CSV lleva BOM, encabezado y protege las fórmulas", () => {
  const l = leerRespuestaFechas(cusco.respuesta);
  const generadas = generarCombinaciones(cusco.datos);
  const preparadas = prepararFilas(l.filas, generadas, cusco.datos, false);
  const csv = aCsvFechas(preparadas);
  assert.ok(csv.startsWith("﻿Ida,Día,Vuelta,Noches,Precio total,Moneda,Precio por persona,Aerolínea,Escalas,Equipaje,Fuente,Consultado el,Verificada\r\n"));
  assert.equal(csv.trim().split("\r\n").length, preparadas.length + 1);
  assert.equal(aTablaFechas(preparadas).split("\n")[0].split("\t")[0], "Ida");
});

test("el ejemplo de Arequipa declara «ACCESO A DATOS EN TIEMPO REAL: no» y no trae ninguna fila", () => {
  assert.equal(arequipa.datos.destino, "Arequipa, Perú (AQP)");
  const l = leerRespuestaFechas(arequipa.respuesta);
  assert.equal(l.accesoTiempoReal, "no");
  assert.deepEqual(l.filas, []);
});

test("el texto de la fuente incluye lo que la persona escribió y la lista de combinaciones generadas", () => {
  const t = textoDeFuenteFechas(cusco.datos);
  assert.ok(t.includes("Cusco"));
  assert.ok(t.includes("2026-11-01,2026-11-06,5"));
});
