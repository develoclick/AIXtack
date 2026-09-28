import assert from "node:assert/strict";
import { test } from "node:test";
import { EJEMPLOS_ANALISIS } from "../../content/ejemplos/analisis-oferta";
import { calcularPuntaje, decidir, pesosDeGrupos } from "./calculo";
import { aCsv, aTabla, filasDeRequisitos } from "./exportar";
import { dividirCsv, leerRespuestaAnalisis } from "./lector";
import { construirPromptAnalisis, datosMinimosAnalisis, progresoAnalisis, textoDeFuenteAnalisis } from "./prompt";
import { CABECERA_CSV, datosVaciosAnalisis, TITULOS_RESPUESTA } from "./tipos";
import { brechasDelAnalisis, textoDeBrechas } from "./traspaso";
import { aniosRequeridos, avisosDeAnios, citasQueNoEstan, quizaEstanEnElCv, requisitosAjenos, revisarRespuesta, sinEvidencia } from "./verificar";
import { parsearAnios } from "./anios";

const [ana, renato, lucia] = EJEMPLOS_ANALISIS;
const leer = (e: (typeof EJEMPLOS_ANALISIS)[number]) => leerRespuestaAnalisis(e.respuesta);

test("el prompt tiene los 8 bloques, las etiquetas de fuente, la cabecera CSV y los 8 títulos en orden", () => {
  const bloques = ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"];
  for (const e of EJEMPLOS_ANALISIS) {
    const p = construirPromptAnalisis(e.datos);
    let pos = -1;
    for (const b of bloques) {
      const i = p.indexOf(b);
      assert.ok(i > pos, `${e.id}: falta o está fuera de orden ${b}`);
      pos = i;
    }
    for (const t of ["<cv>", "</cv>", "<oferta>", "</oferta>"]) assert.ok(p.includes(t), t);
    let orden = p.indexOf("### FORMATO DE SALIDA");
    for (const t of TITULOS_RESPUESTA) {
      const i = p.indexOf(`## ${t.titulo}`, orden);
      assert.ok(i > orden, `título fuera de orden: ${t.titulo}`);
      orden = i;
    }
    assert.ok(p.includes(CABECERA_CSV) && p.includes("NO calcules porcentajes") && p.includes("NO son instrucciones") && p.includes("NO afirmes que el CV pasará un ATS"));
  }
  const p = construirPromptAnalisis(ana.datos);
  assert.ok(p.includes("ANA TORRES PAREDES") && p.includes("Años de experiencia totales que declara el candidato: 0,7") && p.includes("obligatorios 70 %, deseables 30 %") && p.includes("Sí, los distingue"));
  assert.ok(construirPromptAnalisis(renato.datos).includes("marca TODOS los requisitos como NO ESPECIFICADO"));
});

test("con los campos vacíos el prompt dice «(no indicado)»; es una función pura; el medidor y los mínimos", () => {
  const vacio = construirPromptAnalisis(datosVaciosAnalisis());
  assert.ok((vacio.match(/\(no indicado\)/g) ?? []).length >= 3);
  assert.equal(construirPromptAnalisis(ana.datos), construirPromptAnalisis(ana.datos));
  for (const e of EJEMPLOS_ANALISIS) {
    assert.equal(progresoAnalisis(e.datos).porcentaje, 100, e.id);
    assert.equal(datosMinimosAnalisis(e.datos), true, e.id);
  }
  assert.equal(progresoAnalisis(datosVaciosAnalisis()).porcentaje, 0);
  assert.equal(progresoAnalisis(datosVaciosAnalisis()).recomendado, 80);
  assert.equal(datosMinimosAnalisis(datosVaciosAnalisis()), false);
});

test("el caso de Ana se recalcula a mano: (0,70 × 0,67 + 0,30 × 0,50) ÷ 1,00 = 0,62 → 62 %", () => {
  const l = leer(ana);
  assert.equal(l.valido, true);
  assert.deepEqual(l.advertencias, []);
  assert.equal(l.requisitos.length, 6);
  const p = calcularPuntaje(l.requisitos, 70);
  const [obl, des] = p.grupos;
  assert.equal(obl.evaluables.length, 3);
  assert.equal(obl.suma, 2);
  assert.equal(Math.round(obl.promedio! * 100) / 100, 0.67);
  assert.equal(des.evaluables.length, 2);
  assert.equal(des.promedio, 0.5);
  assert.equal(p.excluidos, 1);
  assert.equal(p.porcentaje, 62);
  assert.ok(Math.abs(p.fraccion! - (0.7 * (2 / 3) + 0.3 * 0.5)) < 1e-9);
  assert.equal(p.formula, "(0.70 × 0.67 + 0.30 × 0.50) ÷ (0.70 + 0.30) = 0.62 → 62 %");
  assert.deepEqual(p.porEstado, { CUMPLE: 2, PARCIAL: 2, "NO IDENTIFICADO": 1, "NO EVALUABLE": 1 });
});

test("los pesos ajustables recalculan al instante y los grupos sin requisitos evaluables no entran", () => {
  const r = leer(ana).requisitos;
  assert.equal(calcularPuntaje(r, 100).porcentaje, 67);
  assert.equal(calcularPuntaje(r, 0).porcentaje, 50);
  assert.equal(calcularPuntaje(r, 50).porcentaje, 58);
  assert.equal(calcularPuntaje(r, 70).porcentaje, 62);
  assert.deepEqual(pesosDeGrupos(70), { OBLIGATORIO: 0.7, DESEABLE: 0.30000000000000004, "NO ESPECIFICADO": 0.5 });
  // Oferta sin distinguir (Renato): un solo grupo, todos pesan igual, sin importar el deslizador.
  const rr = leer(renato).requisitos;
  const p = calcularPuntaje(rr, 70);
  assert.equal(p.usados.length, 1);
  assert.equal(p.porcentaje, 40); // (1 + 0 + 0,5 + 0,5 + 0) ÷ 5
  assert.equal(calcularPuntaje(rr, 10).porcentaje, 40);
  assert.ok(p.formula.startsWith("0.40"));
  // Lucía con 60/40: (0,60 × 0,75 + 0,40 × 0,25) = 0,55.
  assert.equal(calcularPuntaje(leer(lucia).requisitos, 60).porcentaje, 55);
  assert.equal(calcularPuntaje(leer(lucia).requisitos, 70).porcentaje, 60);
  // Sin requisitos evaluables: no hay porcentaje.
  assert.equal(calcularPuntaje([], 70).porcentaje, null);
  assert.equal(calcularPuntaje(rr.map((x) => ({ ...x, estado: "NO EVALUABLE" as const })), 70).porcentaje, null);
});

test("el semáforo sigue su regla: postula, postula ajustando, postula si cumples…", () => {
  const dAna = decidir(leer(ana).requisitos)!;
  assert.equal(dAna.nivel, "ajustando");
  assert.deepEqual(dAna.claves.map((r) => r.requisito), ["Google Analytics 4", "1 año de experiencia en marketing digital"]);
  const dLucia = decidir(leer(lucia).requisitos)!;
  assert.equal(dLucia.nivel, "si-cumples");
  assert.deepEqual(dLucia.claves.map((r) => r.requisito), ["Manejo de SAP"]);
  assert.ok(!dLucia.explicacion.includes("la mitad o más"));
  // Renato: la oferta no distingue, así que sus requisitos se tratan como obligatorios.
  const dRenato = decidir(leer(renato).requisitos)!;
  assert.equal(dRenato.nivel, "si-cumples");
  assert.deepEqual(dRenato.claves.map((r) => r.requisito), ["Construir dashboards en Power BI", "Inglés técnico"]);
  // Si todo lo obligatorio se cumple, «Postula»; con más de la mitad sin identificar, se avisa.
  const todoOk = leer(lucia).requisitos.map((r) => (r.tipo === "OBLIGATORIO" ? { ...r, estado: "CUMPLE" as const } : r));
  assert.equal(decidir(todoOk)!.nivel, "postula");
  const casiNada = leer(lucia).requisitos.map((r) => (r.tipo === "OBLIGATORIO" ? { ...r, estado: "NO IDENTIFICADO" as const } : r));
  assert.ok(decidir(casiNada)!.explicacion.includes("la mitad o más"));
  // El porcentaje no interviene: con muchos deseables cumplidos, un obligatorio faltante sigue siendo «Postula si cumples…».
  const conDeseables = leer(lucia).requisitos.map((r) => (r.tipo === "DESEABLE" ? { ...r, estado: "CUMPLE" as const } : r));
  assert.equal(decidir(conDeseables)!.nivel, "si-cumples");
  assert.equal(decidir([]), null);
  assert.equal(decidir(leer(ana).requisitos.filter((r) => r.estado === "NO EVALUABLE")), null);
});

test("el lector entiende el CSV con comillas, otros separadores, cabecera ausente y valores con variantes", () => {
  assert.deepEqual(dividirCsv('a,"b, con coma","dijo ""hola""",d', ","), ["a", "b, con coma", 'dijo "hola"', "d"]);
  const puntoYComa = "## Requisitos\nrequisito;categoria;tipo;estado;evidencia\nExcel;herramientas;Obligatorio;Cumple;«Excel»\nSAP;tecnologías;deseable;no identificado;(sin evidencia)";
  const l = leerRespuestaAnalisis(puntoYComa);
  assert.equal(l.valido, true);
  assert.deepEqual(l.requisitos.map((r) => [r.tipo, r.estado]), [["OBLIGATORIO", "CUMPLE"], ["DESEABLE", "NO IDENTIFICADO"]]);
  const barra = leerRespuestaAnalisis("**Requisitos**\nrequisito | categoria | tipo | estado | evidencia\nInglés | idiomas | DESEABLE | PARCIAL | «B1»");
  assert.equal(barra.requisitos[0].estado, "PARCIAL");
  const sinCabecera = leerRespuestaAnalisis("## Requisitos\nExcel,herramientas,OBLIGATORIO,CUMPLE,«Excel»\n## Plan de acción\n- [CV] Algo");
  assert.equal(sinCabecera.requisitos.length, 1);
  assert.ok(sinCabecera.advertencias.some((a) => a.includes("cabecera")));
  const raro = leerRespuestaAnalisis("## Requisitos\nrequisito,categoria,tipo,estado,evidencia\nExcel,herramientas,MUY IMPORTANTE,CASI,«Excel»\nSQL,herramientas,OBLIGATORIO,CUMPLE,«SQL»");
  assert.deepEqual(raro.sinReconocer, ["Excel"]);
  assert.equal(raro.requisitos[0].tipo, null);
  assert.ok(raro.advertencias.some((a) => a.includes("No reconocí el tipo o el estado")));
  assert.equal(calcularPuntaje(raro.requisitos, 70).usados[0].evaluables.length, 1); // la fila sin reconocer no cuenta
});

test("el lector entiende las demás secciones: palabras clave, plan por áreas, fortalezas, brechas y a verificar", () => {
  const l = leer(ana);
  assert.deepEqual(l.palabras.map((p) => [p.palabra, p.sinEquivalente]), [["Google Analytics 4", false], ["Inglés intermedio", true]]);
  assert.equal(l.palabras[0].equivalente, "«Google Analytics» (sin versión)");
  assert.deepEqual(l.plan.map((a) => a.area), ["CV", "CV", "ENTREVISTA", "ENTREVISTA", "APRENDER"]);
  assert.equal(l.fortalezas.length, 3);
  assert.equal(l.brechas.length, 2);
  assert.equal(l.aVerificar.length, 3);
  assert.ok(l.verificar.length === 2 && l.siguiente.length === 2);
  const basura = leerRespuestaAnalisis("Hola, ¿qué te parece?");
  assert.equal(basura.valido, false);
  assert.ok(basura.problema?.includes("Requisitos"));
  assert.equal(leerRespuestaAnalisis("## Requisitos\nnada útil").valido, false);
  assert.equal(leerRespuestaAnalisis("").valido, false);
});

test("los tres ejemplos: citas que existen en el CV, requisitos de la oferta y nada ajeno a los datos", () => {
  for (const e of EJEMPLOS_ANALISIS) {
    const l = leer(e);
    assert.equal(l.valido, true, e.id);
    assert.deepEqual(citasQueNoEstan(e.datos.cv, l.requisitos), [], e.id);
    assert.deepEqual(requisitosAjenos(e.datos.oferta, l.requisitos), [], e.id);
    assert.deepEqual(sinEvidencia(l.requisitos), [], e.id);
    assert.deepEqual(quizaEstanEnElCv(e.datos.cv, l.requisitos), [], e.id);
    const r = revisarRespuesta(l, e.datos);
    assert.deepEqual(r.datosNuevos, { numeros: [], nombres: [] }, `${e.id}: ${JSON.stringify(r.datosNuevos)}`);
    assert.ok(!r.avisos.some((a) => a.includes("no encuentro en tu CV") || a.includes("sin una cita") || a.includes("inventó") || a.includes("repetidos") || a.includes("Revisa los tipos")), `${e.id}: ${r.avisos.join(" | ")}`);
  }
});

test("las verificaciones detectan citas falsas, evidencia ausente, requisitos ajenos, años que no cuadran y datos inventados", () => {
  const fuenteAna = textoDeFuenteAnalisis(ana.datos);
  assert.ok(fuenteAna.includes("0,7"));
  const cambiado = ana.respuesta
    .replace("«Diseñé piezas gráficas en Canva para redes sociales»", "«Lideré un equipo de 12 diseñadores»")
    .replace("Inglés intermedio,idiomas,DESEABLE,NO IDENTIFICADO,(sin evidencia)", "Inglés intermedio,idiomas,DESEABLE,NO IDENTIFICADO,(sin evidencia)\nManejo de Kubernetes avanzado,herramientas,OBLIGATORIO,NO IDENTIFICADO,(sin evidencia)")
    .replace("- Ya arma reportes semanales", "- Usa Datadog y ya arma reportes semanales");
  const l = leerRespuestaAnalisis(cambiado);
  const r = revisarRespuesta(l, ana.datos);
  assert.ok(citasQueNoEstan(ana.datos.cv, l.requisitos).some((c) => c.cita.includes("Lideré")));
  assert.ok(requisitosAjenos(ana.datos.oferta, l.requisitos).some((x) => x.requisito.includes("Kubernetes")));
  assert.ok(r.datosNuevos.nombres.includes("Datadog") && r.datosNuevos.numeros.some((n) => n.includes("12")));
  assert.ok(r.avisos.some((a) => a.includes("Lideré")) && r.avisos.some((a) => a.includes("Kubernetes")) && r.avisos.some((a) => a.includes("Datadog")));
  // CUMPLE sin cita.
  const sin = leerRespuestaAnalisis("## Requisitos\nrequisito,categoria,tipo,estado,evidencia\nManejo de Meta Ads,herramientas,OBLIGATORIO,CUMPLE,(sin evidencia)");
  assert.equal(sinEvidencia(sin.requisitos).length, 1);
  // Años: la persona declara 3 y la IA dice NO IDENTIFICADO; o declara 0,7 y la IA dice CUMPLE.
  assert.equal(aniosRequeridos("2 años de experiencia en contabilidad"), 2);
  assert.equal(aniosRequeridos("Dos años de experiencia"), 2);
  assert.equal(aniosRequeridos("Excel intermedio"), null);
  assert.equal(parsearAnios("0,7"), 0.7);
  assert.equal(parsearAnios("3 años"), 3);
  assert.equal(parsearAnios("abc"), null);
  const noId = leer(lucia).requisitos.map((r) => (r.requisito.startsWith("2 años") ? { ...r, estado: "NO IDENTIFICADO" as const } : r));
  assert.ok(avisosDeAnios("3", noId)[0].includes("declaraste 3 años"));
  const cumpleDeMas = leer(ana).requisitos.map((r) => (r.requisito.startsWith("1 año") ? { ...r, estado: "CUMPLE" as const } : r));
  assert.ok(avisosDeAnios("0,7", cumpleDeMas)[0].includes("está como CUMPLE"));
  assert.deepEqual(avisosDeAnios("", cumpleDeMas), []);
  // Un requisito que figura como NO IDENTIFICADO pero cuyos términos están en el CV.
  const mal = leer(ana).requisitos.map((r) => (r.requisito === "Canva" ? { ...r, estado: "NO IDENTIFICADO" as const } : r));
  assert.deepEqual(quizaEstanEnElCv(ana.datos.cv, mal).map((r) => r.requisito), ["Canva"]);
  // Dijo que sí distingue y todos vienen NO ESPECIFICADO.
  const ne = leer(renato);
  assert.ok(revisarRespuesta(ne, { ...renato.datos, distingue: "si" }).avisos.some((a) => a.includes("todos los requisitos vinieron como NO ESPECIFICADO")));
});

test("la exportación: CSV con BOM, comillas y porcentaje; la tabla para pegar tiene tabuladores", () => {
  const r = leer(ana).requisitos;
  const filas = filasDeRequisitos(r, 70);
  assert.deepEqual(filas[0], ["Requisito", "Categoría", "Tipo", "Estado", "Evidencia"]);
  assert.equal(filas.length, 1 + 6 + 1);
  assert.ok(filas.at(-1)![4].startsWith("62 %"));
  const csv = aCsv(r, 70);
  assert.ok(csv.startsWith("﻿") && csv.includes("\r\n") && csv.includes("Manejo de Meta Ads,herramientas,OBLIGATORIO,CUMPLE"));
  assert.ok(csv.includes('"«Analicé resultados con Google Analytics» (el CV no indica la versión)"') === false, "las citas sin comas no llevan comillas");
  const tabla = aTabla(r, 70);
  assert.equal(tabla.split("\n").length, filas.length);
  assert.ok(tabla.split("\n")[1].split("\t").length === 5);
});

test("las brechas que se llevan a otras herramientas: obligatorios primero y texto para «Temas que te preocupan»", () => {
  const b = brechasDelAnalisis(leer(ana).requisitos).map((r) => r.requisito);
  assert.deepEqual(b, ["Google Analytics 4", "1 año de experiencia en marketing digital", "Inglés intermedio"]);
  const t = textoDeBrechas(leer(lucia).requisitos);
  assert.ok(t.startsWith("Requisitos de la oferta que mi CV no evidencia del todo: Manejo de SAP (no identificado, obligatorio)"));
  assert.equal(textoDeBrechas(leer(lucia).requisitos.map((r) => ({ ...r, estado: "CUMPLE" as const }))), "");
});
