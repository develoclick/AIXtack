import assert from "node:assert/strict";
import { test } from "node:test";
import { datosMinimosDestinos, filasResumen, imprevistosMonto, imprevistosPct, nochesMaximasViables, nochesSimuladas, rangoNoches, recalcularDestino, repartoPresupuesto, reservaGastos, viajerosDestinos } from "./calculo";
import { aCsvDestinos, aTablaDestinos } from "./exportar";
import { leerDestinos, leerRespuestaDestinos } from "./lector";
import { construirPromptDestinos, progresoDestinos, textoDeReparto } from "./prompt";
import { datosVaciosDestinos, type DatosDestinos, type FilaDestino } from "./tipos";
import { revisarDestinos } from "./verificar";

function fila(parcial: Partial<FilaDestino> & { destino: string }): FilaDestino {
  return { fechas: "", noches: null, pasajePorPersona: null, alojamientoPorNoche: null, totalDeclarado: null, fuentePasaje: "", fuenteAlojamiento: "", consultadoEn: "", tipoDato: null, tipoDatoTexto: "", ...parcial };
}

/** Datos del ejemplo de la especificación: S/ 2.500, 2 personas, 5–7 noches, gasto diario S/ 70 pp, imprevistos 10 %. */
function datosDeEjemplo(): DatosDestinos {
  return { ...datosVaciosDestinos(), presupuesto: "2500", moneda: "S/", origen: "Lima, Perú", viajeros: "2", nochesMin: "5", nochesMax: "7", nochesSimuladas: "5", gastoDiario: "70", imprevistos: "10" };
}

test("viajerosDestinos y rangoNoches validan enteros positivos", () => {
  assert.equal(viajerosDestinos({ viajeros: "2" }), 2);
  assert.equal(viajerosDestinos({ viajeros: "0" }), null);
  assert.deepEqual(rangoNoches({ nochesMin: "5", nochesMax: "7" }), { min: 5, max: 7 });
  assert.equal(rangoNoches({ nochesMin: "7", nochesMax: "5" }), null);
});

test("reservaGastos e imprevistosMonto reproducen el ejemplo de la especificación", () => {
  const d = datosDeEjemplo();
  assert.equal(reservaGastos(d, 5), 840);
  assert.equal(imprevistosPct(d), 10);
  assert.equal(imprevistosMonto(d), 250);
});

test("repartoPresupuesto: 5 noches dan un máximo de S/ 1.410 para pasajes y alojamiento", () => {
  const d = datosDeEjemplo();
  const r = repartoPresupuesto(d, 5)!;
  assert.equal(r.reservaGastos, 840);
  assert.equal(r.imprevistos, 250);
  assert.equal(r.maximoPasajesYAlojamiento, 1410);
});

test("repartoPresupuesto: a más noches, menos queda para pasajes y alojamiento (7 noches → S/ 1.130)", () => {
  const d = datosDeEjemplo();
  const r = repartoPresupuesto(d, 7)!;
  assert.equal(r.reservaGastos, 1120);
  assert.equal(r.maximoPasajesYAlojamiento, 1130);
});

test("recalcularDestino reproduce el destino A del ejemplo: viable a 5 noches, no a 7", () => {
  const d = datosDeEjemplo();
  const a = fila({ destino: "Destino A", pasajePorPersona: 350, alojamientoPorNoche: 120 });
  const r5 = recalcularDestino(a, d, 5);
  assert.equal(r5.costoPasajes, 700);
  assert.equal(r5.costoAlojamiento, 600);
  assert.equal(r5.total, 1300);
  assert.equal(r5.restante, 110);
  assert.equal(r5.viable, true);

  const r7 = recalcularDestino(a, d, 7);
  assert.equal(r7.total, 1540);
  assert.equal(r7.restante, -410);
  assert.equal(r7.viable, false);
});

test("recalcularDestino reproduce el destino B del ejemplo: no viable a 5 noches pese al pasaje más barato", () => {
  const d = datosDeEjemplo();
  const b = fila({ destino: "Destino B", pasajePorPersona: 180, alojamientoPorNoche: 220 });
  const r = recalcularDestino(b, d, 5);
  assert.equal(r.total, 1460);
  assert.equal(r.restante, -50);
  assert.equal(r.viable, false);
});

test("recalcularDestino detecta cuando el total declarado por la IA no coincide con el recalculado", () => {
  const d = datosDeEjemplo();
  const a = fila({ destino: "Destino A", pasajePorPersona: 350, alojamientoPorNoche: 120, totalDeclarado: 1300 });
  assert.equal(recalcularDestino(a, d, 5).difiereDeLoDeclarado, false);
  const aMal = fila({ destino: "Destino A", pasajePorPersona: 350, alojamientoPorNoche: 120, totalDeclarado: 999 });
  assert.equal(recalcularDestino(aMal, d, 5).difiereDeLoDeclarado, true);
});

test("nochesMaximasViables: 5 noches para el destino A y 4 para el destino B", () => {
  const d = datosDeEjemplo();
  const a = fila({ destino: "Destino A", pasajePorPersona: 350, alojamientoPorNoche: 120 });
  const b = fila({ destino: "Destino B", pasajePorPersona: 180, alojamientoPorNoche: 220 });
  assert.equal(nochesMaximasViables(a, d), 5);
  assert.equal(nochesMaximasViables(b, d), 4);
});

test("nochesSimuladas usa lo escrito dentro del rango, o el máximo si está vacío", () => {
  const d = datosDeEjemplo();
  assert.equal(nochesSimuladas(d), 5);
  assert.equal(nochesSimuladas({ ...d, nochesSimuladas: "" }), 7);
  assert.equal(nochesSimuladas({ ...d, nochesSimuladas: "99" }), 7);
  assert.equal(nochesSimuladas({ ...d, nochesSimuladas: "1" }), 5);
});

test("datosMinimosDestinos exige presupuesto, viajeros, gasto diario y un rango válido", () => {
  assert.equal(datosMinimosDestinos(datosDeEjemplo()), true);
  assert.equal(datosMinimosDestinos(datosVaciosDestinos()), false);
});

test("progresoDestinos llega a 100 % cuando todo está completo", () => {
  const p = progresoDestinos(datosDeEjemplo());
  assert.equal(p.porcentaje, 100);
  assert.deepEqual(p.faltan, []);
});

test("textoDeReparto y construirPromptDestinos citan las cifras que calculó la página", () => {
  const d = datosDeEjemplo();
  const texto = textoDeReparto(d);
  assert.ok(texto.includes("840.00") && texto.includes("1,410.00"));
  const prompt = construirPromptDestinos(d);
  for (const t of ["## Destinos candidatos", "## Gastos que podrían encarecer", "## Recomendaciones para ahorrar", "## Qué debes verificar", "## Siguiente paso"]) assert.ok(prompt.includes(t), `falta ${t}`);
  assert.ok(prompt.includes("ACCESO A PRECIOS ACTUALIZADOS"));
  assert.ok(prompt.includes("5 a 7 noches"));
});

test("leerDestinos lee una tabla CSV de destinos con cabecera", () => {
  const texto = "destino,fechas,noches,pasaje_pp,alojamiento_noche,total,fuente_pasaje,fuente_alojamiento,consultado_en,tipo_dato\nCusco,10 al 15 de noviembre,5,350,120,1300,aerolinea.com,hotelx.com,29/09/2026 10:00,real";
  const { filas, sinCabecera } = leerDestinos(texto);
  assert.equal(sinCabecera, false);
  assert.equal(filas.length, 1);
  assert.equal(filas[0].destino, "Cusco");
  assert.equal(filas[0].pasajePorPersona, 350);
  assert.equal(filas[0].tipoDato, "real");
});

test("leerRespuestaDestinos lee una respuesta completa con los 5 títulos", () => {
  const respuesta = `ACCESO A PRECIOS ACTUALIZADOS: sí

## Destinos candidatos
\`\`\`csv
destino,fechas,noches,pasaje_pp,alojamiento_noche,total,fuente_pasaje,fuente_alojamiento,consultado_en,tipo_dato
Destino A,10 al 15 de noviembre,5,350,120,1300,aerolinea.com,hotelx.com,29/09/2026 10:00,real
Destino B,10 al 15 de noviembre,5,180,220,1460,aerolinea2.com,hotely.com,29/09/2026 10:05,real
\`\`\`

## Gastos que podrían encarecer
- Traslados desde el aeropuerto
- Tasas turísticas

## Recomendaciones para ahorrar
- Viaja entre semana

## Qué debes verificar
- Confirma la tarifa antes de pagar

## Siguiente paso
- Elige el destino A, que sí entra en tu presupuesto`;
  const l = leerRespuestaDestinos(respuesta);
  assert.equal(l.valido, true);
  assert.equal(l.accesoPrecios, "si");
  assert.equal(l.filas.length, 2);
  assert.equal(l.gastos.length, 2);
  assert.equal(l.advertencias.length, 0);
});

test("leerRespuestaDestinos tolera una tabla suelta escrita a mano (método guiado, sin títulos)", () => {
  const texto = "destino,fechas,noches,pasaje_pp,alojamiento_noche,total,fuente_pasaje,fuente_alojamiento,consultado_en,tipo_dato\nCusco,10 al 15 de noviembre,5,350,120,1300,,,,estimacion";
  const l = leerRespuestaDestinos(texto);
  assert.equal(l.valido, true);
  assert.equal(l.filas.length, 1);
  assert.equal(l.accesoPrecios, null);
});

test("leerRespuestaDestinos sin ningún título ni tabla no es válida", () => {
  const l = leerRespuestaDestinos("Esto no tiene títulos ni tabla.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

test("revisarDestinos detecta un total que no coincide y una fila «real» sin fuente", () => {
  const d = datosDeEjemplo();
  const respuesta = `## Destinos candidatos
\`\`\`csv
destino,fechas,noches,pasaje_pp,alojamiento_noche,total,fuente_pasaje,fuente_alojamiento,consultado_en,tipo_dato
Destino A,10 al 15 de noviembre,5,350,120,999,,,,real
\`\`\``;
  const l = leerRespuestaDestinos(respuesta);
  const r = revisarDestinos(l, d);
  assert.equal(r.totalesQueDifieren.length, 1);
  assert.equal(r.realesSinFuente.length, 1);
});

test("revisarDestinos NO marca como inventado un precio que la IA sí consultó en la tabla, aunque lo repita en el texto", () => {
  const d = datosDeEjemplo();
  const respuesta = `## Destinos candidatos
\`\`\`csv
destino,fechas,noches,pasaje_pp,alojamiento_noche,total,fuente_pasaje,fuente_alojamiento,consultado_en,tipo_dato
Destino A,10 al 15 de noviembre,5,350,120,1300,aerolinea.com,hotelx.com,29/09/2026 10:00,real
\`\`\`

## Recomendaciones para ahorrar
- El pasaje de S/ 350 por persona ya es una tarifa promocional; compra pronto para no perderla`;
  const l = leerRespuestaDestinos(respuesta);
  const r = revisarDestinos(l, d);
  assert.equal(r.cifras.montos.length, 0);
});

test("aCsvDestinos y aTablaDestinos incluyen el total recalculado y las noches máximas viables", () => {
  const d = datosDeEjemplo();
  const filas = [fila({ destino: "Destino A", pasajePorPersona: 350, alojamientoPorNoche: 120 })];
  const resumen = filasResumen(filas, d);
  const csv = aCsvDestinos(resumen);
  assert.ok(csv.startsWith("﻿Destino,Fechas,Noches,Pasaje por persona,Alojamiento por noche,Costo total (recalculado)"));
  assert.ok(csv.includes("Destino A,,,350,120,1300,650,110,5,"));
  const tabla = aTablaDestinos(resumen);
  assert.ok(tabla.includes("Destino A\t\t\t350\t120\t1300\t650\t110\t5\t"));
});
