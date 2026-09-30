import assert from "node:assert/strict";
import { test } from "node:test";
import { datosMinimosPlanNegocio, escenarios, gastosFijosTotal, inversionTotal, margenContribucion, puntoEquilibrio, semaforo, sumaItems, unidadesPorEscenario } from "./calculo";
import { leerRespuestaPlanNegocio, leerTablaMarkdown } from "./lector";
import { construirPromptFaseA, construirPromptFaseB, construirPromptPlanNegocio, progresoPlanNegocio, textoDeCalculos } from "./prompt";
import { exportarProyectoJson, importarProyectoJson } from "./proyecto";
import { datosVaciosPlanNegocio, itemMontoVacio, normalizarDatosPlanNegocio, type DatosPlanNegocio, type ItemMonto } from "./tipos";
import { revisarPlanNegocio } from "./verificar";

function item(concepto: string, monto: string): ItemMonto {
  return { ...itemMontoVacio(`i-${concepto}`), concepto, monto };
}

/** Datos del ejemplo de la especificación: Lavandería Express Surquillo. */
function datosDeEjemplo(): DatosPlanNegocio {
  return {
    ...datosVaciosPlanNegocio(),
    nombreEmpresa: "Lavandería Express Surquillo",
    descripcion: "Servicio de lavado de ropa por kilo con recojo y entrega a domicilio en Surquillo.",
    producto: "Lavado y planchado de ropa por kilo, con recojo y entrega a domicilio.",
    problema: "Familias y profesionales sin tiempo para lavar y planchar su ropa.",
    clienteObjetivo: "Profesionales y familias de Surquillo y alrededores, de 25 a 55 años.",
    ubicacion: "Surquillo, Lima",
    modeloIngresos: "Cobro por kilo de ropa lavada y planchada.",
    inversionInicial: [item("2 lavadoras industriales", "24000"), item("Secadora industrial", "8000"), item("Acondicionamiento del local", "4000"), item("Moto de reparto", "2000")],
    gastosMensuales: [item("Alquiler del local", "2200"), item("Servicios (agua, luz)", "1400"), item("Sueldo de un ayudante", "1500"), item("Combustible de la moto", "300")],
    precioVenta: "6",
    costoVariable: "2.40",
    demandaMensualEstimada: "1800",
    variacionEscenarios: "30",
    equipo: [{ id: "m1", rol: "Fundadora, operaciones", experiencia: "3 años administrando un negocio familiar" }],
    competidores: [{ id: "c1", nombre: "Lavandería Don Pepe", oferta: "Lavado por kilo, sin recojo", precio: "5.50" }],
    finalidad: "pedir-prestamo",
  };
}

test("sumaItems ignora filas sin concepto o sin monto válido", () => {
  assert.equal(sumaItems([item("A", "100"), item("", "50"), item("B", "no es número")]), 100);
});

test("inversionTotal y gastosFijosTotal reproducen el ejemplo de la especificación (S/ 38.000 y S/ 5.400)", () => {
  const d = datosDeEjemplo();
  assert.equal(inversionTotal(d), 38000);
  assert.equal(gastosFijosTotal(d), 5400);
});

test("margenContribucion y puntoEquilibrio: 3,60/kg y 1.500 kg/mes, como en la especificación", () => {
  const d = datosDeEjemplo();
  assert.equal(margenContribucion(d), 3.6);
  const eq = puntoEquilibrio(d)!;
  assert.equal(eq.unidades, 1500);
  assert.equal(eq.monto, 9000);
});

test("puntoEquilibrio es null si el margen de contribución no es positivo", () => {
  const d = { ...datosDeEjemplo(), costoVariable: "6" };
  assert.equal(puntoEquilibrio(d), null);
});

test("unidadesPorEscenario reparte ±30 % alrededor de la demanda media (1.260 / 1.800 / 2.340)", () => {
  const u = unidadesPorEscenario(datosDeEjemplo())!;
  assert.deepEqual(u, { pesimista: 1260, medio: 1800, optimista: 2340 });
});

test("escenarios calcula ingresos y utilidad de los 3 escenarios", () => {
  const esc = escenarios(datosDeEjemplo())!;
  const medio = esc.find((e) => e.clave === "medio")!;
  assert.equal(medio.ingresos, 10800);
  assert.equal(medio.utilidad, 1080);
  const pesimista = esc.find((e) => e.clave === "pesimista")!;
  assert.equal(pesimista.utilidad, -864);
  const optimista = esc.find((e) => e.clave === "optimista")!;
  assert.equal(optimista.utilidad, 3024);
});

test("semaforo marca «Números» completo solo con inversión, gastos y margen a la vez", () => {
  const completo = semaforo(datosDeEjemplo()).find((s) => s.id === "numeros")!;
  assert.equal(completo.completa, true);
  const incompleto = semaforo({ ...datosDeEjemplo(), costoVariable: "" }).find((s) => s.id === "numeros")!;
  assert.equal(incompleto.completa, false);
});

test("datosMinimosPlanNegocio y progresoPlanNegocio", () => {
  assert.equal(datosMinimosPlanNegocio(datosDeEjemplo()), true);
  assert.equal(datosMinimosPlanNegocio(datosVaciosPlanNegocio()), false);
  assert.equal(progresoPlanNegocio(datosDeEjemplo()).porcentaje, 100);
});

test("textoDeCalculos cita el punto de equilibrio y los 3 escenarios ya calculados", () => {
  const t = textoDeCalculos(datosDeEjemplo());
  assert.ok(t.includes("1500 unidades/mes"));
  assert.ok(t.includes("Escenario medio"));
  assert.ok(t.includes("1,080.00"));
});

test("construirPromptPlanNegocio devuelve la Fase A mientras no haya respuestas, y la Fase B en cuanto las hay", () => {
  const sinRespuestas = construirPromptPlanNegocio(datosDeEjemplo());
  assert.ok(sinRespuestas.includes("## Datos faltantes") && sinRespuestas.includes("## Preguntas"));
  assert.equal(sinRespuestas, construirPromptFaseA(datosDeEjemplo()));

  const conRespuestas = construirPromptPlanNegocio({ ...datosDeEjemplo(), respuestasFaseA: "El local ya está alquilado; la demanda la validamos con una preventa." });
  assert.ok(conRespuestas.includes("## Resumen ejecutivo") && conRespuestas.includes("## Plan de acción de 90 días"));
  assert.equal(conRespuestas, construirPromptFaseB({ ...datosDeEjemplo(), respuestasFaseA: "El local ya está alquilado; la demanda la validamos con una preventa." }));
});

test("construirPromptFaseB incluye los 19 títulos exactos", () => {
  const p = construirPromptFaseB({ ...datosDeEjemplo(), respuestasFaseA: "ok" });
  for (const t of ["## Resumen ejecutivo", "## Descripción del negocio", "## Problema y propuesta de valor", "## Cliente objetivo", "## Análisis de mercado", "## Competencia", "## Modelo de negocio", "## Productos y servicios", "## Estrategia comercial y marketing", "## Operaciones", "## Recursos y equipo", "## Inversión inicial", "## Costos", "## Proyección de ingresos", "## Punto de equilibrio", "## Riesgos y mitigaciones", "## Plan de acción de 90 días", "## Qué debes verificar", "## Siguiente paso"]) {
    assert.ok(p.includes(t), `falta ${t}`);
  }
});

test("leerTablaMarkdown lee cabecera y filas, ignorando la fila separadora", () => {
  const texto = "| Escenario | Unidades | Ingresos |\n|---|---|---|\n| Medio | 1800 | S/ 10,800 |\n| Optimista | 2340 | S/ 14,040 |";
  const tabla = leerTablaMarkdown(texto)!;
  assert.deepEqual(tabla.cabecera, ["Escenario", "Unidades", "Ingresos"]);
  assert.equal(tabla.filas.length, 2);
  assert.deepEqual(tabla.filas[0], ["Medio", "1800", "S/ 10,800"]);
});

const RESPUESTA_FASE_B = `## Resumen ejecutivo
- Lavandería Express Surquillo ofrece lavado por kilo con recojo a domicilio [DATO DEL USUARIO], con un punto de equilibrio de 1500 kg/mes [CÁLCULO] (5400 ÷ 3.60).

## Descripción del negocio
- Servicio de lavado de ropa por kilo con recojo y entrega a domicilio en Surquillo [DATO DEL USUARIO].

## Problema y propuesta de valor
- Familias y profesionales sin tiempo para lavar y planchar su ropa [DATO DEL USUARIO].

## Cliente objetivo
- Profesionales y familias de Surquillo, de 25 a 55 años [DATO DEL USUARIO].

## Análisis de mercado
- No se cuenta con un estudio de mercado propio; se recomienda validar la demanda con una preventa [SUPUESTO] (no hay datos de mercado disponibles).

## Competencia
| Competidor | Oferta | Precio |
|---|---|---|
| Lavandería Don Pepe | Lavado por kilo, sin recojo | S/ 5,50 |

## Modelo de negocio
- Cobro por kilo de ropa lavada y planchada [DATO DEL USUARIO].

## Productos y servicios
- Lavado y planchado por kilo, con recojo y entrega a domicilio [DATO DEL USUARIO].

## Estrategia comercial y marketing
- Publicidad en redes sociales dirigida al vecindario [SUPUESTO] (no se indicó un canal de marketing).

## Operaciones
- Recojo y entrega con la moto propia [DATO DEL USUARIO].

## Recursos y equipo
- Fundadora a cargo de operaciones, con 3 años administrando un negocio familiar [DATO DEL USUARIO].

## Inversión inicial
- Inversión total: S/ 38.000 [CÁLCULO] (suma de los ítems declarados).

## Costos
- Costos fijos mensuales: S/ 5.400 [CÁLCULO] (suma de los ítems declarados).

## Proyección de ingresos
| Escenario | Unidades/mes | Ingresos | Utilidad |
|---|---|---|---|
| Pesimista | 1260 | S/ 7.560 | -S/ 864 |
| Medio | 1800 | S/ 10.800 | S/ 1.080 |
| Optimista | 2340 | S/ 14.040 | S/ 3.024 |

## Punto de equilibrio
- 1500 kg/mes [CÁLCULO] (5400 ÷ 3.60).

## Riesgos y mitigaciones
- La demanda estimada es un supuesto [SUPUESTO] (no hay una preventa todavía): valídala con un piloto de 4 semanas.

## Plan de acción de 90 días
- Días 1 a 30: acondicionar el local y comprar el equipo [DATO DEL USUARIO].

## Qué debes verificar
- Confirma el precio de la competencia antes de fijar tu propio precio.

## Siguiente paso
- Valida la demanda con un piloto de 4 semanas en 2 edificios.`;

test("leerRespuestaPlanNegocio lee una respuesta de Fase B completa, con tablas y etiquetas", () => {
  const l = leerRespuestaPlanNegocio(RESPUESTA_FASE_B);
  assert.equal(l.valido, true);
  assert.equal(l.advertencias.length, 0);
  assert.ok(l.competencia && l.competencia.filas.length === 1);
  assert.ok(l.proyeccion && l.proyeccion.filas.length === 3);
  assert.equal(l.conteoEtiquetas.dato, 9);
  assert.equal(l.conteoEtiquetas.calculo, 4);
  assert.equal(l.conteoEtiquetas.supuesto, 3);
});

test("leerRespuestaPlanNegocio sin resumen ni descripción no es válida", () => {
  const l = leerRespuestaPlanNegocio("Esto no tiene los títulos esperados.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

test("revisarPlanNegocio no marca cifras inventadas en una respuesta consistente con los datos", () => {
  const l = leerRespuestaPlanNegocio(RESPUESTA_FASE_B);
  const r = revisarPlanNegocio(l, datosDeEjemplo());
  assert.equal(r.cifras.montos.length, 0);
});

test("exportarProyectoJson / importarProyectoJson hacen un viaje de ida y vuelta sin perder datos", () => {
  const original = datosDeEjemplo();
  const json = exportarProyectoJson(original);
  const importado = importarProyectoJson(json)!;
  assert.equal(importado.datos.nombreEmpresa, "Lavandería Express Surquillo");
  assert.equal(importado.datos.inversionInicial.length, 4);
  assert.equal(importado.datos.precioVenta, "6");
});

test("importarProyectoJson devuelve null con un texto que no es JSON", () => {
  assert.equal(importarProyectoJson("esto no es json"), null);
});

test("normalizarDatosPlanNegocio tolera datos vacíos o de otra forma sin romperse", () => {
  const n = normalizarDatosPlanNegocio({ nombreEmpresa: "X", finalidad: "no-existe" });
  assert.equal(n.nombreEmpresa, "X");
  assert.equal(n.finalidad, "organizarme");
  assert.equal(n.inversionInicial.length, 1);
});
