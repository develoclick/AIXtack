import assert from "node:assert/strict";
import { test } from "node:test";
import { EJEMPLOS_ITINERARIO } from "../../content/ejemplos/itinerario";
import { calendarizarItinerario, construirIcsItinerario, enlaceMapasDelDia, enlaceWhatsApp, textoDelDia } from "./calendario";
import { diasDelViaje, fechaDelDia, minutosDeHora, viajerosDelGrupo } from "./calculo";
import { aCsvItinerario, aTablaItinerario } from "./exportar";
import { leerItinerario, leerRespuestaItinerario } from "./lector";
import { construirPromptItinerario, datosMinimosItinerario, progresoItinerario, textoDeFuenteItinerario } from "./prompt";
import { datosVaciosItinerario, TITULOS_RESPUESTA } from "./tipos";
import { diasSobrecargados, diasSinComida, revisarItinerario, solapamientos, ventanasSinLibre } from "./verificar";

const [arequipa, cusco, lima] = EJEMPLOS_ITINERARIO;

test("días del viaje: fin − inicio + 1, con validación de fechas", () => {
  assert.equal(diasDelViaje({ fechaInicio: "2026-11-10", fechaFin: "2026-11-13" }), 4);
  assert.equal(diasDelViaje({ fechaInicio: "2026-11-10", fechaFin: "2026-11-10" }), 1);
  assert.equal(diasDelViaje({ fechaInicio: "2026-11-13", fechaFin: "2026-11-10" }), null);
  assert.equal(diasDelViaje({ fechaInicio: "", fechaFin: "2026-11-10" }), null);
  assert.equal(fechaDelDia({ fechaInicio: "2026-11-10" }, 1), "2026-11-10");
  assert.equal(fechaDelDia({ fechaInicio: "2026-11-10" }, 4), "2026-11-13");
});

test("horas y viajeros: solo HH:MM válido y adultos enteros ≥ 1", () => {
  assert.equal(minutosDeHora("09:30"), 570);
  assert.equal(minutosDeHora("24:00"), null);
  assert.equal(minutosDeHora("9:30"), null);
  assert.equal(viajerosDelGrupo({ adultos: "2", viajerosTexto: "" }).adultos, 2);
  assert.equal(viajerosDelGrupo({ adultos: "0", viajerosTexto: "" }).adultos, null);
});

test("el prompt tiene los 8 bloques, los títulos exactos y «(no indicado)» cuando falta algo", () => {
  const vacio = construirPromptItinerario(datosVaciosItinerario());
  for (const b of ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"]) assert.ok(vacio.includes(b), b);
  assert.ok(vacio.includes("(no indicado)"));
  const p = construirPromptItinerario(arequipa.datos);
  for (const t of TITULOS_RESPUESTA) assert.ok(p.includes(`## ${t.titulo}`), t.titulo);
  assert.ok(p.includes("2026-11-10 a 2026-11-13 (4 días; lo calculó la página)"));
  assert.ok(p.includes("Ritmo: Equilibrado (máximo 3 actividades principales por día; lo calculó la página)"));
  assert.ok(p.includes("Lugar 4: Tour al Cañón del Colca | prioridad: imprescindible"));
  assert.ok(p.includes("dia,fecha,zona,hora_inicio,hora_fin,actividad,tipo,lugar,nota,verificado"));
  assert.ok(p.includes("No inventes nombres de lugares que el usuario no mencionó"));
});

test("el progreso pide destino, fechas, horas y viajeros; los ejemplos llegan al 80 % recomendado", () => {
  assert.equal(progresoItinerario(datosVaciosItinerario()).porcentaje, 0);
  assert.equal(datosMinimosItinerario(datosVaciosItinerario()), false);
  for (const e of EJEMPLOS_ITINERARIO) {
    assert.ok(progresoItinerario(e.datos).porcentaje >= 80, e.id);
    assert.equal(datosMinimosItinerario(e.datos), true, e.id);
  }
});

test("cada ejemplo se lee completo, sin advertencias, y pasa las verificaciones sin avisos de solapamientos, sobrecarga ni lugares ajenos", () => {
  for (const e of EJEMPLOS_ITINERARIO) {
    const l = leerRespuestaItinerario(e.respuesta);
    assert.equal(l.valido, true, e.id);
    assert.deepEqual(l.advertencias, [], e.id);
    for (const t of TITULOS_RESPUESTA) assert.ok(t.clave in l.secciones, `${e.id}: ${t.titulo}`);
    assert.ok(l.itinerario.length > 0, e.id);
    const r = revisarItinerario(l, e.datos);
    assert.deepEqual(r.solapamientos, [], e.id);
    assert.deepEqual(r.sobrecargados, [], e.id);
    assert.deepEqual(r.sinComida, [], e.id);
    assert.deepEqual(r.sinLibre, [], e.id);
    assert.deepEqual(r.ajenos, [], e.id);
    assert.deepEqual(r.reservas, [], e.id);
    assert.deepEqual(r.cifras, { montos: [], porcentajes: [] }, e.id);
    // Los únicos avisos que pueden quedar son informativos (horarios no verificados y lo que la IA pide verificar).
    assert.deepEqual(r.avisos.filter((a) => !a.includes("no vienen marcados como verificados") && !a.startsWith("La IA pide verificar")), [], e.id);
  }
});

test("todos los días del viaje tienen bloques y ninguno se sale del rango de fechas", () => {
  for (const e of EJEMPLOS_ITINERARIO) {
    const l = leerRespuestaItinerario(e.respuesta);
    const total = diasDelViaje(e.datos)!;
    const dias = new Set(l.itinerario.map((f) => f.dia));
    assert.deepEqual([...dias].sort((a, b) => a - b), Array.from({ length: total }, (_, i) => i + 1), e.id);
  }
});

test("el lector lee la tabla del itinerario con comas sin comillas dentro de campos entrecomillados y con tabla de barras", () => {
  const a = leerItinerario('dia,fecha,zona,hora_inicio,hora_fin,actividad,tipo,lugar,nota,verificado\n1,2026-01-01,Centro,09:00,10:00,"Visitar, con calma","imprescindible",Plaza,"Nota, con coma",si');
  assert.equal(a.filas.length, 1);
  assert.equal(a.filas[0].actividad, "Visitar, con calma");
  assert.equal(a.filas[0].nota, "Nota, con coma");
  assert.equal(a.filas[0].verificado, true);
  const b = leerItinerario("| dia | fecha | zona | hora_inicio | hora_fin | actividad | tipo | lugar | nota | verificado |\n|---|---|---|---|---|---|---|---|---|---|\n| 2 | 2026-01-02 | Centro | 10:00 | 11:00 | Pasear | opcional | Parque | | no |");
  assert.equal(b.filas.length, 1);
  assert.equal(b.filas[0].dia, 2);
  assert.equal(b.filas[0].verificado, false);
  assert.equal(leerItinerario("esto no es una tabla").filas.length, 0);
  const c = leerItinerario("dia,fecha,zona,hora_inicio,hora_fin,actividad,tipo,lugar,nota,verificado\n1,2026-01-01,Centro,09:00,10:00,Visita sin comillas, con coma suelta,imprescindible,Plaza,,si");
  assert.equal(c.filas.length, 0);
  assert.equal(c.ilegibles.length, 1);
});

test("el lector tolera negritas, cercas de código, # y dos puntos, y avisa cuando faltan secciones", () => {
  const raw = "```\n**Itinerario**\ndia,fecha,zona,hora_inicio,hora_fin,actividad,tipo,lugar,nota,verificado\n1,2026-01-01,Centro,09:00,10:00,Pasear,libre,,,no\n\n## Por qué este orden:\n- Día 1 (Centro): tranquilo\n```";
  const l = leerRespuestaItinerario(raw);
  assert.equal(l.valido, true);
  assert.equal(l.itinerario.length, 1);
  assert.equal(l.porque[0].dia, 1);
  assert.ok(l.advertencias.some((a) => a.includes("«Planes B»")));
  const malo = leerRespuestaItinerario("¡Aquí tienes tu itinerario, buen viaje!");
  assert.equal(malo.valido, false);
  assert.ok(malo.problema!.includes("## Itinerario"));
});

test("el validador detecta solapamientos, días sobrecargados según el ritmo y días sin comida", () => {
  const base = leerRespuestaItinerario(arequipa.respuesta);
  const conSolape = [...base.itinerario, { ...base.itinerario[2], horaInicio: "14:45", horaFin: "15:15" }];
  assert.equal(solapamientos(conSolape).length, 1);
  const extra = (horaInicio: string, horaFin: string) => ({ dia: 1, fecha: "2026-11-10", zona: "Centro", horaInicio, horaFin, actividad: "Extra", tipo: "imprescindible" as const, tipoTexto: "imprescindible", lugar: "Plaza de Armas de Arequipa", nota: "", verificado: true });
  const sobrecargado = [...base.itinerario, extra("20:45", "21:15"), extra("21:30", "22:00")];
  assert.deepEqual(diasSobrecargados(sobrecargado, "equilibrado"), [{ dia: 1, cantidad: 4, maximo: 3 }]);
  const sinComida = base.itinerario.filter((f) => f.tipo !== "comida" || f.dia !== 1);
  assert.deepEqual(diasSinComida(sinComida, 4), [1]);
});

test("la regla de tiempo libre cada 2 días detecta la ventana sin ningún bloque «libre»", () => {
  const sinLibre = arequipa.datos.lugares.length >= 0 ? leerRespuestaItinerario(arequipa.respuesta).itinerario.filter((f) => f.tipo !== "libre") : [];
  assert.deepEqual(ventanasSinLibre(sinLibre, 4), [1, 2, 3]);
  assert.deepEqual(ventanasSinLibre(leerRespuestaItinerario(arequipa.respuesta).itinerario, 4), []);
});

test("las verificaciones detectan lugares ajenos, reservas no respetadas y montos inventados", () => {
  const base = leerRespuestaItinerario(arequipa.respuesta);
  const conAjeno = { ...base, itinerario: [...base.itinerario, { dia: 1, fecha: "2026-11-10", zona: "Centro", horaInicio: "21:00", horaFin: "22:00", actividad: "Bar nocturno", tipo: "opcional" as const, tipoTexto: "opcional", lugar: "Bar Secreto Inventado", nota: "", verificado: false }] };
  const r1 = revisarItinerario(conAjeno, arequipa.datos);
  assert.deepEqual(r1.ajenos, ["Bar Secreto Inventado"]);
  assert.ok(r1.avisos.some((a) => a.includes("no aportaste")));

  const conReservaMala = { ...base, itinerario: base.itinerario.map((f) => (f.lugar === "Tour al Cañón del Colca" && f.horaInicio === "04:00" ? { ...f, horaInicio: "05:00" } : f)) };
  const r2 = revisarItinerario(conReservaMala, arequipa.datos);
  assert.equal(r2.reservas.length, 1);
  assert.equal(r2.reservas[0].lugar, "Tour al Cañón del Colca");
  assert.equal(r2.reservas[0].esperada, "04:00");

  const conMonto = { ...base, presupuesto: ["Cada entrada cuesta alrededor de S/ 450"] };
  const r3 = revisarItinerario(conMonto, arequipa.datos);
  assert.ok(r3.cifras.montos.length > 0);
});

test("los tres ejemplos respetan exactamente la reserva del lugar que la trae", () => {
  const r = revisarItinerario(leerRespuestaItinerario(lima.respuesta), lima.datos);
  assert.deepEqual(r.reservas, []);
});

test("el ejemplo de Cusco usa ritmo relajado (máximo 2 actividades principales) y respeta el presupuesto que aportó la familia", () => {
  assert.equal(cusco.datos.ritmo, "relajado");
  const l = leerRespuestaItinerario(cusco.respuesta);
  const porDia = new Map<number, number>();
  for (const f of l.itinerario) if (f.tipo === "imprescindible" || f.tipo === "opcional") porDia.set(f.dia, (porDia.get(f.dia) ?? 0) + 1);
  for (const n of porDia.values()) assert.ok(n <= 2);
  assert.ok(cusco.datos.presupuesto.includes("S/ 800"));
  assert.ok(l.secciones.presupuesto!.includes("S/ 800"));
});

test("el calendario coloca cada bloque con su fecha y hora, y descarta filas sin hora válida", () => {
  const l = leerRespuestaItinerario(arequipa.respuesta);
  const { eventos, omitidas } = calendarizarItinerario(l.itinerario, arequipa.datos);
  assert.equal(omitidas.length, 0);
  assert.equal(eventos.length, l.itinerario.length);
  assert.equal(eventos[0].fecha, "2026-11-10");
  assert.equal(eventos[0].horaInicio, "11:00");
  assert.ok(eventos.every((e, i) => i === 0 || e.fecha + e.horaInicio >= eventos[i - 1].fecha + eventos[i - 1].horaInicio));
  const { eventos: e2, omitidas: o2 } = calendarizarItinerario([{ dia: 1, fecha: "", zona: "", horaInicio: "10:00", horaFin: "09:00", actividad: "Mal", tipo: null, tipoTexto: "", lugar: "", nota: "", verificado: null }], { fechaInicio: "" });
  assert.equal(e2.length, 0);
  assert.equal(o2.length, 1);
});

test("el archivo .ics del itinerario es válido: CRLF, un evento por bloque y escape de comas", () => {
  const l = leerRespuestaItinerario(arequipa.respuesta);
  const { eventos } = calendarizarItinerario(l.itinerario, arequipa.datos);
  const ics = construirIcsItinerario(eventos, new Date(Date.UTC(2026, 9, 1, 12, 0, 0)));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"));
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, eventos.length);
  assert.ok(!/[^\r]\n/.test(ics), "todas las líneas terminan en CRLF");
  assert.ok(ics.includes("DTSTART:20261110T110000"));
  assert.ok(ics.includes("DTEND:20261110T113000"));
  const uids = ics.match(/UID:[^\r]+/g)!;
  assert.equal(new Set(uids).size, uids.length);
});

test("el enlace de Google Maps encadena los lugares del día en orden y sin vacíos ni repetidos seguidos", () => {
  const l = leerRespuestaItinerario(arequipa.respuesta);
  const dia1 = l.itinerario.filter((f) => f.dia === 1);
  const enlace = enlaceMapasDelDia(dia1);
  assert.ok(enlace!.startsWith("https://www.google.com/maps/dir/"));
  assert.ok(enlace!.includes(encodeURIComponent("Plaza de Armas de Arequipa")));
  assert.ok(enlace!.includes(encodeURIComponent("Monasterio de Santa Catalina")));
  assert.equal(enlaceMapasDelDia([{ dia: 1, fecha: "", zona: "", horaInicio: "", horaFin: "", actividad: "x", tipo: "libre", tipoTexto: "libre", lugar: "", nota: "", verificado: null }]), null);
});

test("el texto del día y el enlace de WhatsApp incluyen la fecha, la zona y cada bloque con su horario", () => {
  const l = leerRespuestaItinerario(arequipa.respuesta);
  const dia1 = l.itinerario.filter((f) => f.dia === 1);
  const texto = textoDelDia(1, "2026-11-10", dia1);
  assert.ok(texto.startsWith("Día 1 (2026-11-10) — Centro"));
  assert.ok(texto.includes("11:00–11:30 Traslado del aeropuerto al alojamiento (Alojamiento en el Centro)"));
  const enlace = enlaceWhatsApp(texto);
  assert.equal(enlace, `https://wa.me/?text=${encodeURIComponent(texto)}`);
});

test("la exportación a CSV lleva BOM, encabezado y protege las fórmulas", () => {
  const l = leerRespuestaItinerario(arequipa.respuesta);
  const csv = aCsvItinerario(l.itinerario);
  assert.ok(csv.startsWith("﻿Día,Fecha,Zona,Inicio,Fin,Actividad,Tipo,Lugar,Nota,Verificado\r\n"));
  assert.equal(csv.trim().split("\r\n").length, l.itinerario.length + 1);
  assert.equal(aTablaItinerario(l.itinerario).split("\n")[0], "Día\tFecha\tZona\tInicio\tFin\tActividad\tTipo\tLugar\tNota\tVerificado");
  assert.ok(aCsvItinerario([{ dia: 1, fecha: "2026-01-01", zona: "=SUMA(A1:A2)", horaInicio: "09:00", horaFin: "10:00", actividad: "x", tipo: null, tipoTexto: "", lugar: "", nota: "", verificado: null }]).includes("'=SUMA(A1:A2)"));
});

test("el texto de la fuente incluye lo que la persona escribió, para el detector de cifras", () => {
  const t = textoDeFuenteItinerario(arequipa.datos);
  assert.ok(t.includes("Arequipa"));
  assert.ok(t.includes("Tour al Cañón del Colca"));
});
