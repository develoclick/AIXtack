import assert from "node:assert/strict";
import { test } from "node:test";
import { EJEMPLOS_SALARIO } from "../../content/ejemplos/salario";
import { calcularOferta, compararOfertas, contextoDe, evaluarCifras } from "./calculo";
import { leerRespuestaSalario } from "./lector";
import { construirPromptSalario, datosMinimosSalario, progresoSalario, textoDeFuenteSalario } from "./prompt";
import { datosVaciosSalario, ofertaVacia, TITULOS_RESPUESTA, TIPOS_RESPUESTA } from "./tipos";
import { citasQueNoEstan, respuestasQueRevelanElMinimo, revisarRespuesta } from "./verificar";

const [op, dev, adm] = EJEMPLOS_SALARIO;
const calc = (e: (typeof EJEMPLOS_SALARIO)[number], cual: "A" | "B" = "A") => calcularOferta(cual === "A" ? e.datos.ofertaA : e.datos.ofertaB, contextoDe(e.datos));

test("el caso de la guía se recalcula a mano: 4,000 × 14 = 56,000; variable 0–4,000; costo 3 × 48 × 20 = 2,880", () => {
  const c = calc(op);
  assert.equal(c.fijoAnual, 56000);
  assert.equal(c.variableMaximo, 4000);
  assert.equal(c.variableConservador, 0);
  assert.equal(c.beneficios, 0);
  assert.equal(c.costoPorDia, 20);
  assert.equal(c.costo, 2880);
  assert.equal(c.conservador!.bruto, 56000);
  assert.equal(c.completo!.bruto, 60000);
  assert.equal(c.conservador!.despuesDeCostos, 53120);
  assert.equal(c.completo!.despuesDeCostos, 57120);
  assert.equal(c.conservador!.mensualEquivalente, 4426.67);
  assert.equal(c.completo!.mensualEquivalente, 4760);
  assert.equal(c.netoFijoEstimado, null);
  assert.equal(c.filas.find((f) => f.clave === "fijo")!.formula, "4,000.00 × 14 pagos = 56,000.00");
  assert.equal(c.filas.find((f) => f.clave === "costo")!.formula, "3 días × 48 semanas × 20.00 por día = 2,880.00");
  assert.equal(c.filas.find((f) => f.clave === "despues-completo")!.formula, "60,000.00 − 2,880.00 = 57,120.00");
  assert.deepEqual(c.problemas, []);
  assert.deepEqual(c.beneficiosNoMonetarios, ["Capacitación"]);
});

test("el variable se calcula por monto, por porcentaje o por sueldos, con un escenario conservador propio", () => {
  const base = ofertaVacia("X");
  const ctx = { modalidad: "remoto" as const, transporteDia: "", comidaDia: "", semanas: "48", descuentoPct: "" };
  const con = (o: Partial<typeof base>) => calcularOferta({ ...base, fijo: "5000", pagos: "12", ...o }, ctx);
  assert.equal(con({ variableTipo: "monto", variableValor: "3000", variableSeguro: "50" }).variableConservador, 1500);
  assert.equal(con({ variableTipo: "monto", variableValor: "3000", variableSeguro: "50" }).variableMaximo, 3000);
  assert.equal(con({ variableTipo: "porcentaje", variableValor: "10" }).variableMaximo, 6000); // 60,000 × 10 %
  assert.equal(con({ variableTipo: "sueldos", variableValor: "2" }).variableMaximo, 10000);
  assert.equal(con({ variableTipo: "ninguno" }).completo!.bruto, 60000);
  assert.equal(con({ variableTipo: "monto", variableValor: "3000", variableSeguro: "50" }).conservador!.bruto, 61500);
  assert.equal(con({ beneficios: [{ id: "1", nombre: "Seguro", valor: "1200", monetario: true }, { id: "2", nombre: "Laptop", valor: "900", monetario: false }] }).beneficios, 1200);
});

test("el costo de trabajar depende de la modalidad y de los días; el neto solo se muestra si la persona escribe su %", () => {
  const c = calc(adm);
  assert.equal(c.diasPorSemana, 5); // presencial: 5 días por defecto
  assert.equal(c.costo, 3840); // 5 × 48 × (6 + 10)
  assert.equal(c.fijoAnual, 25200);
  assert.equal(c.beneficios, 1200);
  assert.equal(c.conservador!.bruto, 26400);
  assert.equal(c.conservador!.despuesDeCostos, 22560);
  assert.equal(c.completo!.despuesDeCostos, c.conservador!.despuesDeCostos);
  assert.equal(c.netoFijoEstimado, 1476); // 1,800 × (1 − 18 %)
  const remoto = calcularOferta({ ...ofertaVacia("R"), fijo: "3000" }, { modalidad: "remoto", transporteDia: "20", comidaDia: "10", semanas: "48", descuentoPct: "" });
  assert.equal(remoto.costo, 0);
  assert.equal(remoto.netoFijoEstimado, null);
});

test("los datos que faltan o están mal se señalan sin inventar nada", () => {
  const ctx = { modalidad: "hibrido" as const, transporteDia: "", comidaDia: "", semanas: "48", descuentoPct: "" };
  const vacio = calcularOferta(ofertaVacia("V"), ctx);
  assert.equal(vacio.valido, false);
  assert.equal(vacio.fijoAnual, null);
  assert.ok(vacio.problemas.some((p) => p.includes("salario fijo")) && vacio.problemas.some((p) => p.includes("días por semana")));
  assert.equal(vacio.conservador, null);
  const malos = calcularOferta({ ...ofertaVacia("M"), fijo: "4000", pagos: "14.5", variableTipo: "monto", variableValor: "abc", diasPresencial: "9" }, ctx);
  assert.ok(malos.problemas.some((p) => p.includes("pagos al año")) && malos.problemas.some((p) => p.includes("valor del variable")) && malos.problemas.some((p) => p.includes("entre 0 y 7")));
  assert.equal(calcularOferta({ ...ofertaVacia("S"), fijo: "4000" }, { ...ctx, modalidad: "remoto", semanas: "80" }).problemas.some((p) => p.includes("semanas")), true);
});

test("el comparador de 2 ofertas: valor anual, diferencias y quién gana en cada fila", () => {
  const a = calc(dev, "A");
  const b = calc(dev, "B");
  assert.equal(a.fijoAnual, 78000);
  assert.equal(a.variableMaximo, 7800);
  assert.equal(a.variableConservador, 3900);
  assert.equal(a.conservador!.bruto, 85500);
  assert.equal(a.completo!.bruto, 89400);
  assert.equal(a.costo, 0);
  assert.equal(b.fijoAnual, 81200);
  assert.equal(b.beneficios, 2400);
  assert.equal(b.costo, 2400); // 2 días × 48 semanas × 25
  assert.equal(b.conservador!.bruto, 83600);
  assert.equal(b.conservador!.despuesDeCostos, 81200);
  const filas = compararOfertas(a, b);
  const f = (clave: string) => filas.find((x) => x.clave === clave)!;
  assert.equal(f("fijo").diferencia, 3200);
  assert.equal(f("fijo").mejor, "b");
  assert.equal(f("costo").diferencia, 2400);
  assert.equal(f("costo").mejor, "a"); // el costo menor gana
  assert.equal(f("costo").porcentaje, null); // A vale 0
  assert.equal(f("bruto-conservador").diferencia, -1900);
  assert.equal(f("despues-conservador").diferencia, -4300);
  assert.equal(f("despues-completo").diferencia, -8200);
  assert.equal(f("despues-completo").mejor, "a");
  assert.equal(f("despues-conservador").porcentaje, -5.03);
  assert.deepEqual(compararOfertas(a, calcularOferta(ofertaVacia("B"), contextoDe(dev.datos))), []);
});

test("las tres cifras: validan ancla ≥ objetivo ≥ mínimo, miden la distancia a la oferta y se comparan con TUS referencias", () => {
  const ev = evaluarCifras(op.datos, calc(op));
  assert.equal(ev.valida, true);
  assert.deepEqual(ev.vsOferta.map((v) => [v.clave, v.diferencia, v.porcentaje, v.impactoAnual]), [["minimo", 200, 5, 2800], ["objetivo", 600, 15, 8400], ["ancla", 900, 22.5, 12600]]);
  assert.deepEqual(ev.referencias, { total: 2, completas: 2, incompletas: 0, minima: 4300, maxima: 4800, mediana: 4550 });
  assert.equal(ev.posiciones.length, 3);
  assert.ok(ev.posiciones[0].texto.includes("por debajo de tu referencia más baja") && ev.posiciones[0].texto.includes("2.3 %"));
  assert.ok(ev.posiciones[1].texto.includes("dentro del rango"));
  assert.ok(ev.posiciones[2].texto.includes("por encima de tu referencia más alta") && ev.posiciones[2].texto.includes("2.1 %"));
  // Orden inválido.
  const mal = evaluarCifras({ ...op.datos, minimo: "5000", objetivo: "4600", ancla: "4400" }, calc(op));
  assert.equal(mal.valida, false);
  assert.ok(mal.problemas.some((p) => p.includes("objetivo no puede ser menor")) && mal.problemas.some((p) => p.includes("ancla no puede ser menor que el objetivo")) && mal.problemas.some((p) => p.includes("ancla no puede ser menor que el mínimo")));
  // Sin referencias no se compara con nada (no hay cifras de mercado propias).
  const sin = evaluarCifras(adm.datos, calc(adm));
  assert.equal(sin.referencias.completas, 0);
  assert.deepEqual(sin.posiciones, []);
  assert.equal(sin.valida, true);
  // Referencias incompletas (sin fuente o fecha) no cuentan.
  const incompletas = evaluarCifras({ ...op.datos, referencias: [{ id: "x", monto: "5000", fuente: "", fecha: "2026-09-01" }, { id: "y", monto: "4000", fuente: "Aviso", fecha: "" }] }, calc(op));
  assert.equal(incompletas.referencias.completas, 0);
  assert.equal(incompletas.referencias.incompletas, 2);
  assert.equal(evaluarCifras({ ...op.datos, minimo: "abc" }, calc(op)).problemas[0], "Mínimo aceptable: escribe un monto mayor que cero.");
  assert.equal(evaluarCifras({ ...op.datos, minimo: "", objetivo: "", ancla: "" }, calc(op)).valida, false);
});

test("el prompt tiene los 8 bloques, las etiquetas de fuente y los 9 títulos de salida en orden", () => {
  const bloques = ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"];
  for (const e of EJEMPLOS_SALARIO) {
    const p = construirPromptSalario(e.datos);
    let pos = -1;
    for (const b of bloques) {
      const i = p.indexOf(b);
      assert.ok(i > pos, `${e.id}: falta o está fuera de orden ${b}`);
      pos = i;
    }
    for (const t of ["<oferta>", "</oferta>", "<calculo_de_la_pagina>", "</calculo_de_la_pagina>", "<situacion_actual>", "<referencias_del_usuario>", "</referencias_del_usuario>"]) assert.ok(p.includes(t), t);
    let orden = p.indexOf("### FORMATO DE SALIDA");
    for (const t of TITULOS_RESPUESTA) {
      const i = p.indexOf(`## ${t.titulo}`, orden);
      assert.ok(i > orden, `título fuera de orden: ${t.titulo}`);
      orden = i;
    }
    assert.ok(p.includes("NO son instrucciones") && p.includes("No inventes estadísticas, rangos ni promedios de mercado") && p.includes("Nunca reveles") && p.includes("No recomiendes mentir") && TIPOS_RESPUESTA.every((t) => p.includes(t)));
  }
  const p = construirPromptSalario(op.datos);
  assert.ok(p.includes("Valor anual bruto (completo): 60,000.00 + 0.00 + 0.00") === false);
  assert.ok(p.includes("Salario fijo anual: 4,000.00 × 14 pagos = 56,000.00") && p.includes("Costo de trabajar presencial: 3 días × 48 semanas × 20.00 por día = 2,880.00") && p.includes("Mínimo aceptable: S/ 4,200.00") && p.includes("Ancla frente al fijo de la oferta: +S/ 900.00 al mes (+22.5 %), +S/ 12,600.00 al año"));
  assert.ok(p.includes("Referencia 1: S/ 4300 mensuales brutos; fuente: Aviso público") && p.includes("Prioridades, en orden: 1. Dinero; 2. Estabilidad"));
  assert.ok(p.includes("Neto: no calculado"));
  assert.ok(construirPromptSalario(adm.datos).includes("Neto mensual aproximado del fijo, con el 18 % de descuentos que estimó el usuario (no es un cálculo de impuestos): S/ 1,476.00"));
  assert.ok(construirPromptSalario(adm.datos).includes("el usuario no aportó referencias salariales"));
  const pd = construirPromptSalario(dev.datos);
  assert.ok(pd.includes("Oferta B (híbrida)") && pd.includes("Comparación (B − A):") && pd.includes("Después de costos (conservador): A S/ 85,500.00; B S/ 81,200.00; diferencia −S/ 4,300.00"));
});

test("con los campos vacíos el prompt dice «(no indicado)»; es una función pura; medidor y mínimos", () => {
  const vacio = construirPromptSalario(datosVaciosSalario());
  assert.ok((vacio.match(/\(no indicado\)/g) ?? []).length >= 8);
  assert.equal(construirPromptSalario(op.datos), construirPromptSalario(op.datos));
  assert.equal(progresoSalario(op.datos).porcentaje, 100);
  assert.equal(progresoSalario(dev.datos).porcentaje, 100);
  assert.equal(progresoSalario(adm.datos).porcentaje, 85); // sin referencias
  assert.ok(progresoSalario(adm.datos).faltan[0].includes("referencia salarial"));
  assert.equal(progresoSalario(datosVaciosSalario()).porcentaje, 0);
  assert.equal(progresoSalario(datosVaciosSalario()).recomendado, 80);
  for (const e of EJEMPLOS_SALARIO) assert.equal(datosMinimosSalario(e.datos), true, e.id);
  assert.equal(datosMinimosSalario(datosVaciosSalario()), false);
});

test("el lector entiende la respuesta: paneles, 5 argumentos, 4 respuestas con su texto (el correo en varias líneas)", () => {
  for (const e of EJEMPLOS_SALARIO) {
    const l = leerRespuestaSalario(e.respuesta);
    assert.equal(l.valido, true, e.id);
    assert.deepEqual(l.advertencias, [], e.id);
    assert.equal(l.argumentos.length, 5, e.id);
    assert.ok(l.argumentos.every((a) => a.argumento && a.evidencia.startsWith("«") && a.relacion), e.id);
    assert.deepEqual(l.respuestas.map((r) => r.tipo), [...TIPOS_RESPUESTA], e.id);
    assert.ok(l.respuestas.every((r) => r.texto && r.cuando && r.situacion), e.id);
    assert.ok(l.preguntas.length >= 6 && l.oferta.length >= 3 && l.cifras.length >= 3 && l.margen.length >= 3 && l.checklist.length >= 5 && l.verificar.length >= 2 && l.siguiente.length >= 2, e.id);
    assert.ok(l.margen.every((m) => m.elemento && m.porQue), e.id);
  }
  const l = leerRespuestaSalario(op.respuesta);
  const correo = l.respuestas[3];
  assert.ok(correo.texto.startsWith("Asunto: Propuesta de contraoferta") && correo.texto.split("\n").length >= 5 && correo.texto.includes("Hola [nombre]:") && correo.texto.trim().endsWith("[tu nombre]"));
  assert.equal(l.respuestas[0].situacion, "¿Cuál es tu expectativa salarial?");
});

test("los tres ejemplos: nada en la respuesta que no venga de tus datos, ninguna cita inventada, ninguna respuesta revela el mínimo", () => {
  for (const e of EJEMPLOS_SALARIO) {
    const l = leerRespuestaSalario(e.respuesta);
    const r = revisarRespuesta(l, e.datos);
    assert.deepEqual(r.cifras, { montos: [], porcentajes: [] }, `${e.id}: ${JSON.stringify(r.cifras)}`);
    assert.deepEqual(r.citasFalsas, [], e.id);
    assert.deepEqual(respuestasQueRevelanElMinimo(e.datos, l), [], e.id);
    assert.ok(!r.avisos.some((a) => a.includes("montos") || a.includes("datos de mercado") || a.includes("otra oferta") || a.includes("mínimo aceptable") || a.includes("Faltan respuestas") || a.includes("Asunto")), `${e.id}: ${r.avisos.join(" | ")}`);
  }
  assert.ok(textoDeFuenteSalario(op.datos).includes("56,000.00"));
});

test("las verificaciones detectan cifras de mercado inventadas, otra oferta ficticia, citas falsas y el mínimo revelado", () => {
  const cambiado = op.respuesta
    .replace("- ¿Qué condiciones tiene el período de prueba?", "- ¿Qué condiciones tiene el período de prueba? El mercado paga en promedio S/ 6,000 a este puesto, según encuestas.")
    .replace("Evidencia: «Lideré la migración del inventario a SAP en mi puesto actual» | El puesto trabaja", "Evidencia: «Dirigí un equipo de 40 personas» | El puesto trabaja")
    .replace("Gracias por la transparencia.", "Gracias por la transparencia. Tengo otra oferta de la competencia y mi mínimo es S/ 4,200.");
  const l = leerRespuestaSalario(cambiado);
  const r = revisarRespuesta(l, op.datos);
  assert.ok(r.cifras.montos.includes("6,000"), r.cifras.montos.join());
  assert.ok(r.avisos.some((a) => a.includes("datos de mercado")));
  assert.ok(r.avisos.some((a) => a.includes("otra oferta")));
  assert.ok(citasQueNoEstan(op.datos, l).some((c) => c.cita.includes("Dirigí un equipo")));
  assert.deepEqual(respuestasQueRevelanElMinimo(op.datos, l), [2]);
  assert.ok(r.avisos.some((a) => a.includes("menciona(n) tu mínimo aceptable")));
  // Con una segunda oferta real (comparar) no se avisa de «otra oferta».
  const comp = revisarRespuesta(leerRespuestaSalario(dev.respuesta.replace("Gracias por explicarlo.", "Gracias por explicarlo. Tengo otra oferta.")), dev.datos);
  assert.ok(!comp.avisos.some((a) => a.includes("otra oferta")));
  // Faltan respuestas y el correo sin asunto.
  const pocas = leerRespuestaSalario(op.respuesta.replace(/Respuesta 3 \[Salario actual\][\s\S]*?(?=Respuesta 4)/, "").replace("Asunto: Propuesta de contraoferta – Analista de Operaciones", "Propuesta"));
  const rp = revisarRespuesta(pocas, op.datos);
  assert.ok(rp.avisos.some((a) => a.includes("Faltan respuestas preparadas de este tipo: Salario actual")) && rp.avisos.some((a) => a.includes("no empieza con «Asunto:»")));
});

test("el lector es tolerante con # y negritas y explica qué falta si no reconoce nada", () => {
  const l = leerRespuestaSalario("Claro:\n**Revisión de la oferta**\n1. Algo\n### Argumentos:\n- Uno | Evidencia: «x» | Relación con el puesto: y\n## Respuestas preparadas\nRespuesta 1 [Expectativa salarial]: «¿Cuánto?»\n- Texto: Hola\n- Cuándo usarla: siempre");
  assert.equal(l.valido, true);
  assert.equal(l.oferta.length, 1);
  assert.equal(l.argumentos[0].relacion, "y");
  assert.equal(l.respuestas[0].texto, "Hola");
  assert.ok(l.advertencias.some((a) => a.includes("5 argumentos")));
  const basura = leerRespuestaSalario("Hola, ¿empezamos?");
  assert.equal(basura.valido, false);
  assert.ok(basura.problema?.includes("títulos"));
  assert.equal(leerRespuestaSalario("").valido, false);
});
