import assert from "node:assert/strict";
import { test } from "node:test";
import { costoAjustado, datosMinimosComparar, filasResumen, ganadorDePerfil, masBarata, mejorPuntuada, pesoNumerico, pesosDePerfil, puntuacionPonderada, sumaPesos } from "./calculo";
import { aCsvComparar, aTablaComparar } from "./exportar";
import { leerRespuestaComparar, leerTablaComparativa } from "./lector";
import { construirPromptComparar, progresoComparar, textoDeCalculos, textoDeCriterios, textoDeOpciones } from "./prompt";
import { CRITERIOS_PREDEFINIDOS, datosVaciosComparar, opcionVacia, type Criterio, type DatosComparar, type Opcion } from "./tipos";
import { revisarComparar } from "./verificar";

function opcion(parcial: Partial<Opcion> & { id: string }): Opcion {
  return { ...opcionVacia(parcial.id), ...parcial };
}

function criterio(id: string, nombre: string, peso: number): Criterio {
  return { id, nombre, peso: String(peso), predefinido: CRITERIOS_PREDEFINIDOS.some((c) => c.id === id) };
}

/** Datos de ejemplo: comparación de 2 hoteles en Miraflores, con pesos que priorizan comodidad y tiempo sobre precio. */
function datosDeEjemplo(): DatosComparar {
  return {
    tipo: "alojamiento",
    opciones: [
      opcion({ id: "a", nombre: "Hotel Costa del Sol", precio: "450", moneda: "S/", costoExtra: "30" }),
      opcion({ id: "b", nombre: "Hostal Vista al Mar", precio: "380", moneda: "S/", horasTrayecto: "1" }),
    ],
    viajeros: "2 adultos",
    fechas: "10 al 15 de noviembre de 2026",
    valorTiempo: "20",
    criterios: [criterio("precio", "Precio", 20), criterio("comodidad", "Comodidad", 50), criterio("tiempo", "Tiempo", 30)],
    puntuaciones: {
      a: { precio: "2", comodidad: "5", tiempo: "5" },
      b: { precio: "5", comodidad: "2", tiempo: "2" },
    },
  };
}

test("costoAjustado suma precio, extras y horas de trayecto por el valor del tiempo", () => {
  const d = datosDeEjemplo();
  const a = costoAjustado(d.opciones[0], 20);
  assert.equal(a.total, 480);
  assert.equal(a.formula, "450.00 + 30.00");
  const b = costoAjustado(d.opciones[1], 20);
  assert.equal(b.total, 400);
  assert.equal(b.formula, "380.00 + 1.00 h × 20.00");
});

test("costoAjustado sin precio devuelve total null", () => {
  const r = costoAjustado(opcionVacia("x"), null);
  assert.equal(r.total, null);
});

test("sumaPesos y pesoNumerico ignoran texto no numérico", () => {
  const criterios = [criterio("precio", "Precio", 20), { id: "x", nombre: "Raro", peso: "abc", predefinido: false }];
  assert.equal(pesoNumerico(criterios[1]), 0);
  assert.equal(sumaPesos(criterios), 20);
});

test("puntuacionPonderada: la comodidad pesa más y gana la opción más cómoda", () => {
  const d = datosDeEjemplo();
  const pa = puntuacionPonderada("a", d.criterios, d.puntuaciones);
  const pb = puntuacionPonderada("b", d.criterios, d.puntuaciones);
  assert.equal(pa, 88);
  assert.equal(pb, 52);
});

test("filasResumen, masBarata y mejorPuntuada no coinciden en este ejemplo", () => {
  const d = datosDeEjemplo();
  const filas = filasResumen(d);
  const barata = masBarata(filas)!;
  const mejor = mejorPuntuada(filas)!;
  assert.equal(barata.opcion.id, "b");
  assert.equal(mejor.opcion.id, "a");
});

test("pesosDePerfil «precio» reserva 60 puntos al precio y reparte el resto proporcionalmente", () => {
  const d = datosDeEjemplo();
  const pesos = pesosDePerfil(d.criterios, "precio");
  assert.equal(pesos.precio, 60);
  assert.equal(pesos.comodidad, 25);
  assert.equal(pesos.tiempo, 15);
});

test("ganadorDePerfil «precio» cambia el ganador respecto a las prioridades por defecto", () => {
  const d = datosDeEjemplo();
  assert.equal(mejorPuntuada(filasResumen(d))!.opcion.id, "a");
  assert.equal(ganadorDePerfil(d, "precio")!.opcion.id, "b");
});

test("pesosDePerfil «comodidadYTiempo» se queda con los pesos actuales si esos criterios no existen", () => {
  const criterios = [criterio("precio", "Precio", 60), criterio("ubicacion", "Ubicación", 40)];
  const pesos = pesosDePerfil(criterios, "comodidadYTiempo");
  assert.deepEqual(pesos, { precio: 60, ubicacion: 40 });
});

test("datosMinimosComparar exige 2 opciones con nombre y precio, y pesos repartidos", () => {
  assert.equal(datosMinimosComparar(datosDeEjemplo()), true);
  const vacio = datosVaciosComparar();
  assert.equal(datosMinimosComparar(vacio), false);
});

test("progresoComparar llega a 100 % cuando todo está completo, y baja si falta un precio", () => {
  const completo = datosDeEjemplo();
  assert.equal(progresoComparar(completo).porcentaje, 100);
  assert.deepEqual(progresoComparar(completo).faltan, []);

  const incompleto = datosDeEjemplo();
  incompleto.opciones[1].precio = "";
  const p = progresoComparar(incompleto);
  assert.equal(p.porcentaje, 45);
  assert.deepEqual(p.faltan, ["Al menos 2 opciones con nombre y precio", "El precio de todas las opciones que agregaste"]);
});

test("textoDeOpciones y textoDeCriterios listan los datos tal cual", () => {
  const d = datosDeEjemplo();
  const texto = textoDeOpciones(d);
  assert.ok(texto.includes("Opción 1: Hotel Costa del Sol"));
  assert.ok(texto.includes("Precio: S/ 450.00"));
  assert.equal(textoDeCriterios(d), "Precio: 20 de 100 puntos; Comodidad: 50 de 100 puntos; Tiempo: 30 de 100 puntos");
});

test("textoDeCalculos cita el costo ajustado y la puntuación ponderada ya calculados", () => {
  const texto = textoDeCalculos(datosDeEjemplo());
  assert.ok(texto.includes("Hotel Costa del Sol: costo total ajustado S/ 480.00; puntuación ponderada 88/100"));
  assert.ok(texto.includes("Hostal Vista al Mar: costo total ajustado S/ 400.00; puntuación ponderada 52/100"));
});

test("construirPromptComparar incluye los 8 títulos exactos y los datos del usuario", () => {
  const prompt = construirPromptComparar(datosDeEjemplo());
  for (const t of ["## Tabla comparativa", "## Costos a verificar", "## Diferencias que importan", "## Ventajas y desventajas", "## Si cambian mis prioridades", "## Preguntas antes de reservar", "## Qué debes verificar", "## Siguiente paso"]) {
    assert.ok(prompt.includes(t), `falta ${t}`);
  }
  assert.ok(prompt.includes("[VALORACIÓN]"));
  assert.ok(prompt.includes("Hotel Costa del Sol"));
});

test("leerTablaComparativa detecta la cabecera y las celdas con [VALORACIÓN]", () => {
  const texto = "Dato | Hotel Costa del Sol | Hostal Vista al Mar\nPrecio | S/ 480 | S/ 400\nComodidad | [VALORACIÓN] Muy cómodo | [VALORACIÓN] Básico";
  const t = leerTablaComparativa(texto);
  assert.deepEqual(t.cabecera, ["Dato", "Hotel Costa del Sol", "Hostal Vista al Mar"]);
  assert.equal(t.filas.length, 2);
  assert.equal(t.filas[0].conValoracion, false);
  assert.equal(t.filas[1].conValoracion, true);
});

test("leerRespuestaComparar lee una respuesta completa con los 8 títulos", () => {
  const respuesta = `## Tabla comparativa
Dato | Hotel Costa del Sol | Hostal Vista al Mar
Precio | S/ 480,00 | S/ 400,00
Comodidad | [VALORACIÓN] Muy cómodo | [VALORACIÓN] Básico

## Costos a verificar
- Resort fee del hotel
- Traslado desde el hostal

## Diferencias que importan
- El hostal ahorra S/ 80 pero suma una hora de traslado

## Ventajas y desventajas
- Hotel Costa del Sol: más cómodo, más caro
- Hostal Vista al Mar: más barato, menos céntrico

## Si cambian mis prioridades
- Si priorizas el precio, conviene el hostal

## Preguntas antes de reservar
- ¿El traslado está incluido?

## Qué debes verificar
- Confirma la tarifa vigente antes de pagar

## Siguiente paso
- Reserva la opción elegida`;
  const l = leerRespuestaComparar(respuesta);
  assert.equal(l.valido, true);
  assert.equal(l.tabla.filas.length, 2);
  assert.equal(l.costos.length, 2);
  assert.equal(l.diferencias.length, 1);
  assert.equal(l.preguntas[0], "¿El traslado está incluido?");
  assert.equal(l.advertencias.length, 0);
});

test("leerRespuestaComparar sin ningún título reconocido no es válida", () => {
  const l = leerRespuestaComparar("Esto no tiene títulos.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

test("revisarComparar detecta un monto inventado y una opción no mencionada", () => {
  const d = datosDeEjemplo();
  const respuesta = `## Tabla comparativa
Dato | Hotel Costa del Sol
Precio | S/ 480,00

## Diferencias que importan
- Un traslado adicional cuesta S/ 999,00, un monto que no está en los datos`;
  const l = leerRespuestaComparar(respuesta);
  const r = revisarComparar(l, d);
  assert.ok(r.cifras.montos.some((m) => m.includes("999")));
  assert.ok(r.opcionesSinMencionar.includes("Hostal Vista al Mar"));
});

test("aCsvComparar y aTablaComparar incluyen el costo y la puntuación de cada opción", () => {
  const d = datosDeEjemplo();
  const csv = aCsvComparar(d);
  assert.ok(csv.startsWith("﻿Opción,Precio,Moneda,Precio,Comodidad,Tiempo,Costo total ajustado,Puntuación ponderada\r\n"));
  assert.ok(csv.includes("Hotel Costa del Sol,450,S/,2,5,5,480,88"));
  const tabla = aTablaComparar(d);
  assert.ok(tabla.includes("Hostal Vista al Mar\tS/ 400.00\t5\t2\t2\t52/100"));
});
