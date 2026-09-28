import assert from "node:assert/strict";
import { test } from "node:test";
import { EJEMPLOS_PLAN } from "../../content/ejemplos/plan-busqueda";
import { calendarizar, construirIcs, diasEntre, esLunes, plegar } from "./calendario";
import { calcularDistribucion, horasDe, minutosDisponibles, sumasPorSemana } from "./calculo";
import { aCsvPlan, aTablaPlan } from "./exportar";
import { leerPlan, leerRespuestaPlan } from "./lector";
import { construirPromptPlan, datosMinimosPlan, progresoPlan, textoDeFuentePlan } from "./prompt";
import { agrupar, alertas, analizarCsv, aCsv, construirPromptRevision, diagnosticar, embudo, filtrarPeriodo, importarCsv, MUESTRA_MINIMA, postulacionVacia, tasa, textoDeMetricas, TITULOS_REVISION, type Postulacion } from "./registro";
import { datosVaciosPlan, TITULOS_RESPUESTA, TIPOS_PLANTILLA } from "./tipos";
import { revisarPlan } from "./verificar";

const [rosa, diego, marcela] = EJEMPLOS_PLAN;

test("horas y minutos disponibles: solo entre 1 y 60, minutos = horas × 60", () => {
  assert.equal(horasDe({ horas: "10" }), 10);
  assert.equal(horasDe({ horas: "7,5" }), 7.5);
  assert.equal(minutosDisponibles({ horas: "10" }), 600);
  assert.equal(minutosDisponibles({ horas: "7.5" }), 450);
  for (const malo of ["", "0", "61", "abc", "-3"]) assert.equal(horasDe({ horas: malo }), null, malo);
});

test("la semana 1 de Rosa suma 330 minutos (5 h 30 min) de los 600 disponibles", () => {
  const l = leerRespuestaPlan(rosa.respuesta);
  const s = sumasPorSemana(l.plan, minutosDisponibles(rosa.datos));
  assert.equal(s[0].minutos, 60 + 90 + 45 + 60 + 45 + 30);
  assert.equal(s[0].minutos, 330);
  assert.equal(s[0].libres, 270);
  assert.equal(s[0].exceso, 0);
});

test("una semana que se pasa del tiempo disponible se detecta con el exceso exacto", () => {
  const l = leerRespuestaPlan(rosa.respuesta);
  const plan = [...l.plan, { semana: 1, dia: "sábado", diaIdx: 5, tarea: "Extra", entregable: "x", minutos: 400 }];
  const s = sumasPorSemana(plan, 600);
  assert.equal(s[0].minutos, 730);
  assert.equal(s[0].exceso, 130);
  const r = revisarPlan({ ...l, plan }, rosa.datos);
  assert.ok(r.avisos.some((a) => a.includes("semana 1 suma 730 minutos") && a.includes("130")));
  assert.deepEqual(r.semanasQueNoCaben, [1]);
});

test("la distribución convierte porcentajes en minutos con la fórmula a la vista y comprueba que suma 100", () => {
  const l = leerRespuestaPlan(rosa.respuesta);
  const d = calcularDistribucion(l.distribucion, 600);
  assert.equal(d.suma100, true);
  assert.equal(d.sumaPorcentajes, 100);
  const cv = d.filas.find((f) => f.actividad === "Adaptación del CV")!;
  assert.equal(cv.minutos, 90);
  assert.equal(cv.formula, "600 × 15 % ÷ 100 = 90");
  assert.equal(calcularDistribucion([{ actividad: "a", porcentaje: 60, porQue: "" }, { actividad: "b", porcentaje: 30, porQue: "" }], 600).suma100, false);
});

test("el prompt tiene los 8 bloques, los títulos exactos y «(no indicado)» cuando falta algo", () => {
  const vacio = construirPromptPlan(datosVaciosPlan());
  for (const b of ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"]) assert.ok(vacio.includes(b), b);
  assert.ok(vacio.includes("(no indicado)"));
  const p = construirPromptPlan(rosa.datos);
  for (const t of TITULOS_RESPUESTA) assert.ok(p.includes(`## ${t.titulo}`), t.titulo);
  assert.ok(p.includes("10 horas por semana = 600 minutos (10 h); lo calculó la página"));
  assert.ok(p.includes("Vacante 2: Distribuidora Sur Andino (ficticia) — Asistente administrativa"));
  assert.ok(p.includes("semana,dia,tarea,entregable,minutos"));
  assert.ok(p.includes("No inventes empresas, vacantes, estadísticas del mercado laboral"));
  assert.ok(p.includes("no presentes ningún número de postulaciones por semana como una cifra que garantice resultados"));
});

test("el progreso pide puesto, lugar y horas; los ejemplos llegan al 80 % recomendado", () => {
  assert.equal(progresoPlan(datosVaciosPlan()).porcentaje, 0);
  assert.equal(datosMinimosPlan(datosVaciosPlan()), false);
  for (const e of EJEMPLOS_PLAN) {
    assert.ok(progresoPlan(e.datos).porcentaje >= 80, e.id);
    assert.equal(datosMinimosPlan(e.datos), true, e.id);
  }
  assert.equal(progresoPlan(marcela.datos).faltan.length, 1, "Marcela no tiene vacantes");
});

test("cada ejemplo se lee completo, sin advertencias, y pasa las verificaciones sin avisos de cifras ni de promesas", () => {
  for (const e of EJEMPLOS_PLAN) {
    const l = leerRespuestaPlan(e.respuesta);
    assert.equal(l.valido, true, e.id);
    assert.deepEqual(l.advertencias, [], e.id);
    for (const t of TITULOS_RESPUESTA) assert.ok(t.clave in l.secciones, `${e.id}: ${t.titulo}`);
    assert.equal(l.alternativas.length, 2, e.id);
    assert.equal(l.plantillas.length, 3, e.id);
    assert.deepEqual(l.plantillas.map((p) => p.tipo), [...TIPOS_PLANTILLA], e.id);
    const r = revisarPlan(l, e.datos);
    assert.deepEqual(r.cifras, { montos: [], porcentajes: [] }, e.id);
    assert.deepEqual(r.vacantesAjenas, [], e.id);
    assert.deepEqual(r.semanasQueNoCaben, [], e.id);
    assert.equal(r.distribucion.suma100, true, e.id);
    // El único aviso que puede quedar es el que recuerda que la IA pide verificar datos.
    assert.deepEqual(r.avisos.filter((a) => !a.startsWith("La IA pide verificar")), [], e.id);
  }
});

test("las 4 semanas de cada ejemplo tienen tareas, entregable y minutos válidos", () => {
  for (const e of EJEMPLOS_PLAN) {
    const l = leerRespuestaPlan(e.respuesta);
    const s = sumasPorSemana(l.plan, minutosDisponibles(e.datos));
    for (const x of s) {
      assert.ok(x.tareas >= 3, `${e.id} semana ${x.semana}`);
      assert.equal(x.sinMinutos, 0);
    }
    assert.ok(l.plan.every((f) => f.entregable && f.diaIdx >= 0 && f.minutos !== null), e.id);
  }
});

test("el lector lee la tabla del plan con comas sin comillas, con comillas y como tabla con barras", () => {
  const a = leerPlan("semana,dia,tarea,entregable,minutos\n1,lunes,Seleccionar, comparar y descartar ofertas,Lista de ofertas,60\n2,martes,\"Adaptar, revisar y enviar\",CV enviado,90");
  assert.equal(a.plan.length, 2);
  assert.equal(a.plan[0].tarea, "Seleccionar, comparar y descartar ofertas");
  assert.equal(a.plan[0].entregable, "Lista de ofertas");
  assert.equal(a.plan[1].tarea, "Adaptar, revisar y enviar");
  const b = leerPlan("| Semana | Día | Tarea | Entregable | Minutos |\n|---|---|---|---|---|\n| 1 | Miércoles | Postular | 3 postulaciones | 45 min |");
  assert.equal(b.plan.length, 1);
  assert.equal(b.plan[0].diaIdx, 2);
  assert.equal(b.plan[0].minutos, 45);
  const c = leerPlan("semana;dia;tarea;entregable;minutos\nSemana 3;viernes;Revisar;Nota;30");
  assert.equal(c.plan[0].semana, 3);
  assert.equal(leerPlan("esto no es una tabla").plan.length, 0);
});

test("el lector tolera negritas, cercas de código, # y dos puntos, y avisa cuando faltan secciones", () => {
  const raw = "```\n**Objetivo**\n- Objetivo: Un puesto\n- Alternativa 1: A\n- Alternativa 2: B\n\n## Plan de 4 semanas:\nsemana,dia,tarea,entregable,minutos\n1,lunes,Hacer algo,Algo hecho,30\n```";
  const l = leerRespuestaPlan(raw);
  assert.equal(l.valido, true);
  assert.equal(l.objetivo, "Un puesto");
  assert.equal(l.plan.length, 1);
  assert.ok(l.advertencias.some((a) => a.includes("«Distribución semanal»")));
  const malo = leerRespuestaPlan("Aquí tienes tu plan, ¡mucho éxito!");
  assert.equal(malo.valido, false);
  assert.ok(malo.problema!.includes("## Objetivo"));
});

test("las verificaciones detectan estadísticas de mercado, promesas, reglas de postulaciones y vacantes inventadas", () => {
  const base = leerRespuestaPlan(rosa.respuesta);
  const con = (extra: Partial<typeof base>) => revisarPlan({ ...base, ...extra }, rosa.datos);
  assert.ok(con({ metricas: ["El 80 % de los empleos se consiguen por contactos"] }).avisos.some((a) => a.includes("datos del mercado laboral")));
  assert.ok(con({ siguiente: ["Con este plan conseguirás un empleo en 3 semanas"] }).avisos.some((a) => a.includes("promete")));
  assert.ok(con({ siguiente: ["Lo ideal son 10 postulaciones por semana"] }).avisos.some((a) => a.includes("postulaciones por semana como regla")));
  assert.ok(con({ criterios: ["Los reclutadores ganan S/ 4,500 al mes"] }).cifras.montos.length > 0);
  const inventada = con({ vacantes: [...base.vacantes, { vacante: "Banco Fantasma — Cajera", prioridad: "alta", motivo: "x", antes: "y" }] });
  assert.deepEqual(inventada.vacantesAjenas, ["Banco Fantasma — Cajera"]);
  assert.ok(inventada.avisos.some((a) => a.includes("no aportaste")));
  assert.ok(con({ plantillas: base.plantillas.map((p) => ({ ...p, texto: "Hola, quiero trabajar con ustedes." })) }).avisos.some((a) => a.includes("marcadores")));
  assert.ok(con({ plantillas: base.plantillas.slice(0, 2) }).avisos.some((a) => a.includes("Pedimos 3 plantillas")));
});

test("las unidades y los porcentajes de las secciones que calcula la página no se marcan como cifras nuevas", () => {
  const base = leerRespuestaPlan(rosa.respuesta);
  const r = revisarPlan({ ...base, metricas: ["Revisa tu CV si pasan 120 minutos sin avance y 14 días sin respuesta"] }, rosa.datos);
  assert.deepEqual(r.cifras.montos, []);
});

test("el calendario coloca las tareas por semana y día, apiladas desde la hora elegida", () => {
  const l = leerRespuestaPlan(rosa.respuesta);
  assert.equal(esLunes("2026-10-05"), true);
  assert.equal(esLunes("2026-10-06"), false);
  const { eventos, omitidas } = calendarizar(l.plan, "2026-10-05", "18:00");
  assert.equal(omitidas.length, 0);
  assert.equal(eventos.length, l.plan.length);
  assert.equal(eventos[0].fecha, "2026-10-05");
  assert.equal(eventos[0].inicio, "18:00");
  assert.equal(eventos[0].fin, "19:00");
  // Viernes de la semana 1: dos tareas seguidas (45 y 30 min).
  const viernes = eventos.filter((e) => e.fecha === "2026-10-09");
  assert.deepEqual(viernes.map((e) => [e.inicio, e.fin]), [["18:00", "18:45"], ["18:45", "19:15"]]);
  // La semana 4 cae 21 días después.
  assert.ok(eventos.some((e) => e.semana === 4 && e.fecha === "2026-10-26"));
  assert.deepEqual(calendarizar(l.plan, "2026-13-40", "18:00").eventos, []);
  assert.deepEqual(calendarizar(l.plan, "2026-10-05", "25:00").eventos, []);
});

test("las tareas que pasan de medianoche terminan al día siguiente y las filas sin día se omiten", () => {
  const { eventos, omitidas } = calendarizar(
    [
      { semana: 1, dia: "lunes", diaIdx: 0, tarea: "Larga", entregable: "x", minutos: 120 },
      { semana: 1, dia: "algún día", diaIdx: -1, tarea: "Sin día", entregable: "x", minutos: 30 },
    ],
    "2026-10-05",
    "23:00",
  );
  assert.equal(eventos[0].fin, "01:00");
  assert.equal(eventos[0].finFecha, "2026-10-06");
  assert.equal(omitidas.length, 1);
});

test("el archivo .ics es válido: CRLF, eventos, escape de comas y punto y coma, y líneas de 75 octetos como máximo", () => {
  const l = leerRespuestaPlan(rosa.respuesta);
  const { eventos } = calendarizar(l.plan, "2026-10-05", "18:00");
  const ics = construirIcs(eventos, new Date(Date.UTC(2026, 9, 1, 12, 30, 45)));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, eventos.length);
  assert.equal((ics.match(/END:VEVENT/g) ?? []).length, eventos.length);
  assert.ok(ics.includes("DTSTAMP:20261001T123045Z"));
  assert.ok(ics.includes("DTSTART:20261005T180000"));
  assert.ok(ics.includes("DTEND:20261005T190000"));
  assert.ok(!/[^\r]\n/.test(ics), "todas las líneas terminan en CRLF");
  const enc = new TextEncoder();
  for (const linea of ics.split("\r\n")) assert.ok(enc.encode(linea).length <= 75, linea);
  const uids = ics.match(/UID:[^\r]+/g)!;
  assert.equal(new Set(uids).size, uids.length);
  const raro = construirIcs([{ fecha: "2026-10-05", inicio: "18:00", fin: "19:00", finFecha: "2026-10-05", semana: 1, titulo: "Enviar CV, carta; y listo", descripcion: "Línea 1\nLínea 2", minutos: 60 }], new Date(Date.UTC(2026, 9, 1)));
  assert.ok(raro.includes("SUMMARY:Enviar CV\\, carta\\; y listo"));
  assert.ok(raro.includes("DESCRIPTION:Línea 1\\nLínea 2"));
});

test("plegar no parte caracteres de varios bytes", () => {
  const larga = "SUMMARY:" + "ñ".repeat(60);
  const plegada = plegar(larga);
  assert.ok(plegada.includes("\r\n "));
  assert.equal(plegada.replace(/\r\n /g, ""), larga);
  for (const l of plegada.split("\r\n")) assert.ok(new TextEncoder().encode(l).length <= 75);
});

test("la exportación del plan a CSV lleva BOM, encabezado y protege las fórmulas", () => {
  const l = leerRespuestaPlan(rosa.respuesta);
  const csv = aCsvPlan(l.plan);
  assert.ok(csv.startsWith("﻿Semana,Día,Tarea,Entregable,Minutos\r\n"));
  assert.equal(csv.trim().split("\r\n").length, l.plan.length + 1);
  assert.equal(aTablaPlan(l.plan).split("\n")[0], "Semana\tDía\tTarea\tEntregable\tMinutos");
  assert.ok(aCsvPlan([{ semana: 1, dia: "lunes", diaIdx: 0, tarea: "=SUMA(A1:A2)", entregable: "@x", minutos: 5 }]).includes("'=SUMA(A1:A2)"));
});

/* ─────────────── Registro y embudo ─────────────── */

test("el embudo de Rosa: 14 enviadas, 1 con respuesta (7,1 %), 1 entrevista y 0 ofertas; solo la versión B respondió", () => {
  const e = embudo(rosa.postulaciones);
  assert.deepEqual(e, { enviadas: 14, respuestas: 1, entrevistas: 1, ofertas: 0 });
  assert.equal(tasa(e.respuestas, e.enviadas), 7.1);
  const cv = agrupar(rosa.postulaciones, "cv");
  const a = cv.find((f) => f.clave === "A")!;
  const b = cv.find((f) => f.clave === "B")!;
  assert.deepEqual([a.enviadas, a.respuestas], [8, 0]);
  assert.deepEqual([b.enviadas, b.respuestas], [6, 1]);
  assert.equal(a.enviadas + b.enviadas, 14);
  const canales = agrupar(rosa.postulaciones, "canal");
  assert.equal(canales.reduce((t, f) => t + f.enviadas, 0), 14);
});

test("el embudo de Marcela cuenta como entrevista a quien fue rechazado después de una: 20, 7, 4 y 0", () => {
  const e = embudo(marcela.postulaciones);
  assert.deepEqual(e, { enviadas: 20, respuestas: 7, entrevistas: 4, ofertas: 0 });
  assert.equal(tasa(7, 20), 35);
  assert.equal(tasa(4, 7), 57.1);
});

test("el diagnóstico señala la etapa de menor tasa con al menos 3 casos y no concluye con menos de 10 postulaciones", () => {
  const dr = diagnosticar(embudo(rosa.postulaciones));
  assert.equal(dr.nivel, "suficiente");
  assert.equal(dr.transicion?.clave, "envio-respuesta");
  assert.ok(dr.mensajes[0].includes("Se corta antes de que te respondan"));
  const dm = diagnosticar(embudo(marcela.postulaciones));
  assert.equal(dm.transicion?.clave, "entrevista-oferta");
  assert.ok(dm.mensajes[0].includes("Llegas a entrevistas"));
  const dd = diagnosticar(embudo(diego.postulaciones));
  assert.equal(dd.nivel, "pocos-datos");
  assert.equal(dd.transicion, null);
  assert.ok(dd.mensajes[0].includes(`menos de ${MUESTRA_MINIMA}`));
  assert.equal(diagnosticar(embudo([])).nivel, "sin-datos");
});

test("las alertas avisan de seguimientos vencidos y de postulaciones sin respuesta tras X días", () => {
  const hoy = "2026-09-28";
  const a = alertas(rosa.postulaciones, hoy, 10);
  // Las «sin respuesta» ya son definitivas y no avisan; las «enviada» de Rosa tienen menos de 10 días o un seguimiento futuro.
  assert.deepEqual(a, []);
  const lista = alertas(
    [
      { ...postulacionVacia("a"), empresa: "A", puesto: "P", fecha: "2026-09-10", estado: "enviada" },
      { ...postulacionVacia("b"), empresa: "B", puesto: "P", fecha: "2026-09-25", estado: "enviada" },
      { ...postulacionVacia("c"), empresa: "C", puesto: "P", fecha: "2026-09-20", estado: "en-revision", seguimiento: "2026-09-27" },
      { ...postulacionVacia("d"), empresa: "D", puesto: "P", fecha: "2026-09-10", estado: "rechazo" },
      { ...postulacionVacia("e"), empresa: "E", puesto: "P", fecha: "2026-09-20", estado: "enviada", seguimiento: "2026-09-28" },
      { ...postulacionVacia("f"), empresa: "F", puesto: "P", fecha: "2026-09-20", estado: "enviada", seguimiento: "2026-09-30" },
    ],
    hoy,
    10,
  );
  assert.deepEqual(lista.map((x) => [x.id, x.motivo]).sort(), [["a", "sin-respuesta"], ["c", "seguimiento"], ["e", "seguimiento"]]);
  assert.equal(lista.find((x) => x.id === "a")!.dias, 18);
  assert.equal(lista.find((x) => x.id === "e")!.texto, "Hoy toca hacer seguimiento.");
  assert.deepEqual(alertas(rosa.postulaciones, "", 10), []);
  assert.equal(diasEntre("2026-09-10", "2026-09-28"), 18);
});

test("el filtro por periodo se queda con las postulaciones de los últimos N días", () => {
  assert.equal(filtrarPeriodo(rosa.postulaciones, 14, "2026-09-25").length, 11);
  assert.equal(filtrarPeriodo(rosa.postulaciones, null, "2026-09-25").length, 14);
  assert.equal(filtrarPeriodo(rosa.postulaciones, 14, "").length, 14);
});

test("el CSV del registro se exporta con BOM y se vuelve a importar sin perder nada (ida y vuelta)", () => {
  for (const e of EJEMPLOS_PLAN) {
    const csv = aCsv(e.postulaciones);
    assert.ok(csv.startsWith("﻿Empresa,Puesto,Fecha,Canal,Versión de CV,Estado,Llegó hasta,Fecha de seguimiento,Resultado,Observaciones\r\n"));
    let n = 0;
    const r = importarCsv(csv, () => `n${(n += 1)}`);
    assert.equal(r.sinCabecera, false);
    assert.deepEqual(r.omitidas, []);
    assert.equal(r.items.length, e.postulaciones.length);
    const sinId = (p: Postulacion) => ({ ...p, id: "" });
    assert.deepEqual(r.items.map(sinId), e.postulaciones.map(sinId), e.id);
  }
});

test("la importación explica cada fila omitida y acepta fechas DD/MM/AAAA, punto y coma y campos entre comillas con saltos de línea", () => {
  const texto = "Empresa;Puesto;Fecha;Canal;Estado\nA;Asistente;05/10/2026;LinkedIn;Enviada\nB;Auxiliar;2026-13-01;Portal de empleo;Enviada\nC;Cajero;2026-10-06;Portal de empleo;Estado raro\n;;2026-10-06;;\nD;Analista;2026-10-07;Referido;Rechazo";
  const r = importarCsv(texto, () => "x");
  assert.equal(r.items.length, 2);
  assert.equal(r.items[0].fecha, "2026-10-05");
  assert.equal(r.items[0].canal, "linkedin");
  assert.equal(r.items[1].estado, "rechazo");
  assert.deepEqual(r.omitidas.map((o) => o.fila), [3, 4, 5]);
  assert.ok(r.omitidas[0].motivo.includes("fecha no válida"));
  assert.ok(r.omitidas[1].motivo.includes("estado no reconocido"));
  assert.ok(r.omitidas[2].motivo.includes("sin empresa ni puesto"));
  const multilinea = analizarCsv('a,b\n"uno\ndos","con ""comillas"""');
  assert.deepEqual(multilinea, [["a", "b"], ["uno\ndos", 'con "comillas"']]);
  assert.equal(importarCsv("nombre,edad\nAna,3", () => "x").sinCabecera, true);
  assert.equal(importarCsv("", () => "x").sinCabecera, true);
});

test("las fórmulas de una hoja de cálculo se neutralizan al exportar y se restauran al importar", () => {
  const peligro: Postulacion = { ...postulacionVacia("p"), empresa: "=HIPERVINCULO(\"x\")", puesto: "+cmd", fecha: "2026-10-05", notas: "@a" };
  const csv = aCsv([peligro]);
  assert.ok(csv.includes("'=HIPERVINCULO"));
  const r = importarCsv(csv, () => "p");
  assert.equal(r.items[0].empresa, peligro.empresa);
  assert.equal(r.items[0].puesto, "+cmd");
  assert.equal(r.items[0].notas, "@a");
});

test("el prompt de revisión quincenal se rellena con las métricas del registro y tiene los 8 bloques", () => {
  const p = construirPromptRevision(rosa.datos, rosa.postulaciones, "2026-09-28", 10, "todo el registro");
  for (const b of ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"]) assert.ok(p.includes(b), b);
  for (const t of TITULOS_REVISION) assert.ok(p.includes(`## ${t}`), t);
  assert.ok(p.includes("- Postulaciones enviadas: 14"));
  assert.ok(p.includes("- Con respuesta del empleador: 1 de 14 (7.1 %)"));
  assert.ok(p.includes("B → 6 enviadas, 1 con respuesta, 1 entrevistas"));
  assert.ok(p.includes("A → 8 enviadas, 0 con respuesta, 0 entrevistas"));
  assert.ok(p.includes("no las recalcules"));
  const pocos = textoDeMetricas(diego.postulaciones, "2026-09-28", 10);
  assert.ok(pocos.includes("8 postulaciones, menos de 10: habla en cantidades, no en porcentajes"));
  const vacio = construirPromptRevision(datosVaciosPlan(), [], "2026-09-28", 10, "todo el registro");
  assert.ok(vacio.includes("(no indicado)"));
  assert.ok(vacio.includes("- Postulaciones enviadas: 0"));
});

test("el texto de la fuente del plan incluye lo que la persona escribió y los minutos calculados", () => {
  const t = textoDeFuentePlan(rosa.datos);
  assert.ok(t.includes("600"));
  assert.ok(t.includes("Comercial Aurora (ficticia)"));
});

test("las postulaciones de Rosa por semana calendario son 3, 6 y 5 (lo que dice la guía)", () => {
  const entre = (a: string, b: string) => rosa.postulaciones.filter((p) => p.fecha >= a && p.fecha <= b).length;
  assert.deepEqual([entre("2026-09-07", "2026-09-13"), entre("2026-09-14", "2026-09-20"), entre("2026-09-21", "2026-09-27")], [3, 6, 5]);
});
