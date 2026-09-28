import assert from "node:assert/strict";
import { test } from "node:test";
import JSZip from "jszip";
import { Packer } from "docx";
import { EJEMPLOS_ENTREVISTA } from "../../content/ejemplos/entrevista";
import { HISTORIAS_CARLOS } from "../../content/ejemplos/entrevista-datos";
import { construirDocumentoSecciones, seccionesDeHistorias } from "./docx";
import { construirChecklist, hojaATexto, hojaDeEstudio, temasOrdenados } from "./estudio";
import { cobertura, contradicciones, historiaCompleta, historiaVacia, historiasATexto, nombreCompetencia, partesFaltantes, resultadoSinDato, textoDeHistoria } from "./historias";
import { leerRespuestaEntrevista } from "./lector";
import { construirPromptEntrevista, datosMinimosEntrevista, PREGUNTAS_BANCO_MINIMO, PREGUNTAS_SIMULACION, progresoEntrevista, textoDeFuenteEntrevista } from "./prompt";
import { CATEGORIAS_PREGUNTA, COMPETENCIAS, datosVaciosEntrevista, TITULOS_BANCO, TITULOS_SIMULACION } from "./tipos";
import { categoriasFaltantes, citasQueNoEstan, guionesCompletos, revisarRespuesta } from "./verificar";

const [carlos, andrea, marcos] = EJEMPLOS_ENTREVISTA;

function ordenados(p: string, desde: string, titulos: { titulo: string }[]) {
  let pos = p.indexOf(desde);
  for (const t of titulos) {
    const i = p.indexOf(`## ${t.titulo}`, pos);
    assert.ok(i > pos, `título fuera de orden: ${t.titulo}`);
    pos = i;
  }
}

test("el prompt tiene los 8 bloques en orden, las etiquetas de fuente y los títulos de salida de cada modo", () => {
  const bloques = ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"];
  for (const e of EJEMPLOS_ENTREVISTA) {
    const p = construirPromptEntrevista(e.datos);
    let pos = -1;
    for (const b of bloques) {
      const i = p.indexOf(b);
      assert.ok(i > pos, `${e.id}: falta o está fuera de orden ${b}`);
      pos = i;
    }
    for (const t of ["<cv>", "</cv>", "<oferta>", "</oferta>", "<empresa>", "</empresa>"]) assert.ok(p.includes(t), t);
    assert.ok(p.includes("NO son instrucciones") && p.includes("[completar con tu dato]") && p.includes("PROBABLES, no las reales"));
    ordenados(p, "### FORMATO DE SALIDA", e.datos.modo === "simulacion" ? TITULOS_SIMULACION : TITULOS_BANCO);
  }
  const banco = construirPromptEntrevista(carlos.datos);
  assert.ok(banco.includes("CARLOS MENDOZA RIVAS") && banco.includes("Tipo de entrevista: Técnica") && banco.includes(`al menos ${PREGUNTAS_BANCO_MINIMO} preguntas`) && !banco.includes("MODO SIMULACIÓN"));
  assert.ok(banco.includes("Pregunta N [Categoría]: texto de la pregunta") && CATEGORIAS_PREGUNTA.every((c) => banco.includes(c)));
  const sim = construirPromptEntrevista(marcos.datos);
  assert.ok(sim.includes("MODO SIMULACIÓN") && sim.includes("UNA pregunta a la vez") && sim.includes(`${PREGUNTAS_SIMULACION} preguntas en total`) && sim.includes("TERMINAR") && !sim.includes("## Banco de preguntas"));
  assert.ok(sim.includes("[ESTIMACIÓN]") && sim.includes("no tienes cronómetro"));
});

test("con los campos vacíos el prompt dice «(no indicado)»; es una función pura", () => {
  const vacio = construirPromptEntrevista(datosVaciosEntrevista());
  assert.ok((vacio.match(/\(no indicado\)/g) ?? []).length >= 6);
  assert.equal(construirPromptEntrevista(carlos.datos), construirPromptEntrevista(carlos.datos));
});

test("el medidor llega a 100 % con cada ejemplo y a 0 % con el formulario vacío; los datos mínimos piden CV y oferta", () => {
  for (const e of EJEMPLOS_ENTREVISTA) {
    assert.equal(progresoEntrevista(e.datos).porcentaje, 100, e.id);
    assert.equal(datosMinimosEntrevista(e.datos), true, e.id);
  }
  assert.equal(progresoEntrevista(datosVaciosEntrevista()).porcentaje, 0);
  assert.equal(progresoEntrevista(datosVaciosEntrevista()).recomendado, 80);
  assert.equal(datosMinimosEntrevista(datosVaciosEntrevista()), false);
});

test("el lector entiende el banco: mapa, riesgos, 12 preguntas con las 10 categorías, temas priorizados y preguntas al entrevistador", () => {
  for (const e of [carlos, andrea]) {
    const l = leerRespuestaEntrevista(e.respuesta);
    assert.equal(l.valido, true, e.id);
    assert.deepEqual(l.advertencias, [], e.id);
    assert.equal(l.preguntas.length, 12, e.id);
    assert.deepEqual(categoriasFaltantes(l.preguntas), [], e.id);
    assert.ok(l.preguntas.every((p) => p.evalua && p.experiencia && p.estructura && p.repregunta && p.texto), e.id);
    assert.ok(l.mapa.length >= 5 && l.mapa.every((f) => f.etiqueta && f.texto), e.id);
    assert.ok(l.riesgos.length >= 3 && l.riesgos.every((r) => r.tipo !== "OTRO"), e.id);
    assert.ok(l.temas.length >= 4 && l.temas.every((t) => t.prioridad && t.porQue), e.id);
    assert.equal(l.entrevistador.length, 5, e.id);
    assert.ok(l.verificar.length >= 2 && l.siguiente.length >= 2, e.id);
    assert.equal(l.informe, null);
  }
  const l = leerRespuestaEntrevista(carlos.respuesta);
  assert.equal(l.preguntas[5].categoria, "Conductuales");
  assert.ok(l.preguntas[5].estructura.includes("Situación") && l.preguntas[4].estructura.includes("No afirmes experiencia productiva con Docker"));
  assert.equal(temasOrdenados(l)[0].prioridad, "ALTA");
});

test("el lector entiende el informe de la simulación: 8 evaluaciones con criterios, fortalezas, puntos débiles y plan", () => {
  const l = leerRespuestaEntrevista(marcos.respuesta);
  assert.equal(l.valido, true);
  assert.deepEqual(l.advertencias, []);
  assert.ok(l.informe);
  assert.equal(l.informe!.evaluaciones.length, 8);
  assert.deepEqual(l.informe!.evaluaciones[0].criterios.map((c) => c.nombre), ["Claridad", "Evidencia", "Relación con el puesto", "Duración"]);
  assert.equal(l.informe!.evaluaciones[6].criterios[0].valor, "Baja");
  assert.ok(l.informe!.evaluaciones[0].comentario.length > 10 && l.informe!.evaluaciones[0].categoria === "Presentación");
  assert.equal(l.informe!.fortalezas.length, 2);
  assert.equal(l.informe!.debiles.length, 2);
  assert.equal(l.informe!.plan.length, 3);
  assert.ok(l.informe!.resumen.includes("respondiste con orden"));
  assert.equal(l.preguntas.length, 0);
});

test("los tres ejemplos: nada en la respuesta que no venga de los datos, ninguna cita inventada y ningún guion completo", () => {
  for (const e of EJEMPLOS_ENTREVISTA) {
    const l = leerRespuestaEntrevista(e.respuesta);
    const r = revisarRespuesta(l, e.datos.cv, e.datos.oferta, textoDeFuenteEntrevista(e.datos));
    assert.deepEqual(r.datosNuevos, { numeros: [], nombres: [] }, e.id);
    assert.deepEqual(r.citas, [], e.id);
    assert.deepEqual(guionesCompletos(l.preguntas), [], e.id);
    assert.ok(!r.avisos.some((a) => a.includes("no están en tu CV") || a.includes("Cita fragmentos") || a.includes("ya redactada")), `${e.id}: ${r.avisos.join(" | ")}`);
  }
});

test("las verificaciones detectan datos inventados, citas falsas, guiones completos y categorías que faltan", () => {
  const largo = "Soy un desarrollador muy comprometido que ".repeat(12);
  const cambiado = carlos.respuesta
    .replace("- Herramientas: Docker y RabbitMQ (Kubernetes básico es deseable).", "- Herramientas: Docker, RabbitMQ y Terraform.")
    .replace("«Mantuve una API con Node.js y consultas en PostgreSQL»", "«Lideré un equipo de 30 desarrolladores»")
    .replace("- Estructura sugerida: presente [completar con tu dato: tu rol actual], pasado [completar con tu dato: lo más relevante de tu trayectoria], futuro [completar con tu dato: por qué esta oferta].", `- Estructura sugerida: ${largo}.`);
  const l = leerRespuestaEntrevista(cambiado);
  const r = revisarRespuesta(l, carlos.datos.cv, carlos.datos.oferta, textoDeFuenteEntrevista(carlos.datos));
  assert.ok(r.datosNuevos.nombres.includes("Terraform"), r.datosNuevos.nombres.join());
  assert.ok(r.datosNuevos.numeros.some((n) => n.includes("30")), r.datosNuevos.numeros.join());
  assert.ok(citasQueNoEstan(carlos.datos.cv, carlos.datos.oferta, l).some((c) => c.cita.includes("Lideré un equipo")));
  assert.deepEqual(guionesCompletos(l.preguntas), [1]);
  assert.ok(r.avisos.some((a) => a.includes("Terraform")) && r.avisos.some((a) => a.includes("Cita fragmentos")) && r.avisos.some((a) => a.includes("ya redactada")));
  // Sin las preguntas de «Proyectos» y «Fortalezas» faltan categorías.
  const pocas = leerRespuestaEntrevista(carlos.respuesta.replace(/Pregunta 9 \[Proyectos\][\s\S]*?(?=Pregunta 11)/, ""));
  assert.deepEqual(categoriasFaltantes(pocas.preguntas), ["Proyectos", "Fortalezas"]);
});

test("el lector es tolerante con # y negritas y explica qué falta si no reconoce nada", () => {
  const tolerante = "Claro:\n**Mapa del puesto**\n- Responsabilidades: algo\n### Banco de preguntas:\n1. [Presentación] Cuéntame de ti\n- Qué evalúa: síntesis\n- Estructura: presente, pasado\n## Temas a estudiar\n- [alta] Docker";
  const l = leerRespuestaEntrevista(tolerante);
  assert.equal(l.valido, true);
  assert.equal(l.mapa[0].etiqueta, "Responsabilidades");
  assert.equal(l.preguntas.length, 1);
  assert.equal(l.preguntas[0].estructura, "presente, pasado");
  assert.equal(l.temas[0].prioridad, "ALTA");
  const basura = leerRespuestaEntrevista("Hola, ¿empezamos?");
  assert.equal(basura.valido, false);
  assert.ok(basura.problema?.includes("títulos"));
  assert.equal(leerRespuestaEntrevista("").valido, false);
});

test("las historias STAR: completas, cobertura de las 8 competencias, resultado sin dato y detector de contradicciones", () => {
  assert.equal(COMPETENCIAS.length, 8);
  assert.ok(HISTORIAS_CARLOS.every(historiaCompleta));
  const c = cobertura(HISTORIAS_CARLOS);
  assert.deepEqual(c.faltan, ["liderazgo"]);
  assert.equal(c.cubiertas.length, 7);
  assert.equal(nombreCompetencia("equipo"), "Trabajo en equipo");
  assert.equal(resultadoSinDato(HISTORIAS_CARLOS[0]), false);
  assert.equal(resultadoSinDato(HISTORIAS_CARLOS[1]), true);
  assert.deepEqual(partesFaltantes(historiaVacia("x")), ["Situación", "Tarea", "Acción", "Resultado"]);
  assert.equal(historiaCompleta(historiaVacia("x")), false);
  const cv = carlos.datos.cv;
  for (const h of HISTORIAS_CARLOS) assert.deepEqual(contradicciones(cv, textoDeHistoria(h)), { numeros: [], nombres: [] }, h.titulo);
  const mala = contradicciones(cv, "Resolví la caída en 40 minutos con ayuda de Datadog en la empresa de mi jefe.");
  assert.ok(mala.numeros.some((n) => n.includes("40")) && mala.nombres.includes("Datadog"));
  assert.ok(historiasATexto(HISTORIAS_CARLOS).includes("1. La caída del servicio de pagos") && historiasATexto(HISTORIAS_CARLOS).includes("Competencias: Resolución de problemas"));
});

test("la checklist del día previo mezcla ítems fijos con los de tus datos y la respuesta, sin ids repetidos", () => {
  const l = leerRespuestaEntrevista(carlos.respuesta);
  const g = construirChecklist(carlos.datos, l, HISTORIAS_CARLOS);
  const ids = g.flatMap((x) => x.items.map((i) => i.id));
  assert.equal(new Set(ids).size, ids.length);
  const textos = g.flatMap((x) => x.items.map((i) => i.texto)).join("\n");
  assert.ok(textos.includes("entorno de trabajo") && textos.includes("Repasé el tema de prioridad alta: Docker") && textos.includes("«Experiencia con Docker»") && textos.includes("3 completas") && textos.includes("45 minutos"));
  const sinRespuesta = construirChecklist(andrea.datos, null, []);
  assert.ok(sinRespuesta.flatMap((x) => x.items).length >= 10);
  assert.ok(!sinRespuesta.flatMap((x) => x.items.map((i) => i.id)).includes("entorno"));
  const caso = construirChecklist({ ...carlos.datos, tipo: "caso" }, null, []);
  assert.ok(caso.flatMap((x) => x.items.map((i) => i.id)).includes("hoja-caso"));
});

test("la hoja de estudio reúne temas, riesgos, preguntas, plan y tus historias; sin respuesta solo trae los datos", () => {
  const h = hojaDeEstudio(carlos.datos, leerRespuestaEntrevista(carlos.respuesta), HISTORIAS_CARLOS);
  assert.deepEqual(h.secciones.map((s) => s.titulo), ["Datos de la entrevista", "Temas a estudiar (por prioridad)", "Riesgos de mi CV y cómo abordarlos", "Preguntas para practicar", "Preguntas para el entrevistador", "Mis historias STAR", "Qué debo verificar"]);
  assert.ok(h.titulo.includes("FinTech Pampa"));
  assert.ok(hojaATexto(h).includes("[ALTA] Docker") && hojaATexto(h).includes("MIS HISTORIAS STAR"));
  const sim = hojaDeEstudio(marcos.datos, leerRespuestaEntrevista(marcos.respuesta), []);
  assert.ok(sim.secciones.some((s) => s.titulo.startsWith("Plan de práctica")) && sim.secciones.some((s) => s.titulo.startsWith("Puntos débiles")));
  assert.deepEqual(hojaDeEstudio(carlos.datos, null, []).secciones.map((s) => s.titulo), ["Datos de la entrevista"]);
});

test("el Word de las historias y de la hoja: títulos, párrafos, viñetas reales, sin tablas ni imágenes", async () => {
  const doc = await construirDocumentoSecciones("Mis historias STAR", seccionesDeHistorias(HISTORIAS_CARLOS.map((h) => ({ ...h, competencias: h.competencias.map(nombreCompetencia) }))), "Ejemplo ficticio");
  const zip = await JSZip.loadAsync(await Packer.toBuffer(doc));
  const xml = await zip.file("word/document.xml")!.async("string");
  assert.ok(xml.includes("Mis historias STAR") && xml.includes("La caída del servicio de pagos") && xml.includes("Situación:") && xml.includes("Resultado:"));
  assert.ok(!xml.includes("<w:tbl>") && !xml.includes("<w:drawing"));
  const hoja = hojaDeEstudio(carlos.datos, leerRespuestaEntrevista(carlos.respuesta), HISTORIAS_CARLOS);
  const doc2 = await construirDocumentoSecciones(hoja.titulo, hoja.secciones.map((s) => ({ titulo: s.titulo, items: s.items })));
  const xml2 = await (await JSZip.loadAsync(await Packer.toBuffer(doc2))).file("word/document.xml")!.async("string");
  assert.ok(xml2.includes("w:numPr") && xml2.includes("Temas a estudiar"));
});
