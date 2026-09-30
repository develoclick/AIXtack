import assert from "node:assert/strict";
import { test } from "node:test";
import { datosMinimosNichos, favoritosListos, puntuacionPonderada, rankearNichos, semaforo } from "./calculo";
import { leerRespuestaNichos1, leerRespuestaValidacion, TITULOS_VALIDACION } from "./lector";
import { construirPromptNichos, construirPromptNichos1, construirPromptNichos2, progresoNichos } from "./prompt";
import { resumenDeValidacion } from "./registro";
import { revisarNichos1, revisarValidacion } from "./verificar";
import { datosVaciosNichos, normalizarDatosNichos, pesosVacios, type DatosNichos, type Nicho } from "./tipos";

function datosInventario(): DatosNichos {
  return {
    ...datosVaciosNichos(),
    conocimientos: "8 años como profesor de inglés corporativo, especializado en entrevistas técnicas.",
    sectores: "Educación, tecnología.",
    oferta: "Clases de inglés en línea, 1 a 1 y grupales.",
    mercado: "Lima, Perú; clases en línea para todo el país.",
    tipoCliente: "personas",
    recursos: "Laptop, cámara, cuenta de Zoom, 3 años de material propio.",
    presupuesto: "500",
    horas: "15",
    canales: ["redes", "contactos", "web"],
    restricciones: "No quiero alquilar un local.",
  };
}

const CSV_NICHOS = `\`\`\`csv
nombre,cliente,problema,oferta,competencia,canales,monetizacion,recursos,entrada,inversion,recurrencia,diferenciacion,encaje,justificacion
"Inglés para entrevistas de trabajo en empresas de TI, para desarrolladores peruanos con nivel intermedio",Desarrolladores peruanos nivel intermedio,No practican inglés técnico de entrevista y lo aprenden solos con videos sueltos,Paquete de simulacros de entrevista técnica en inglés,Academias de inglés general y profesores particulares sin enfoque técnico,"Redes, comunidades de developers",Paquete de 4 sesiones,Material propio y experiencia dando clases técnicas,4,4,3,5,5,"Fácil de arrancar (4); inversión baja (4); pocas recompras (3); muy diferenciado (5); encaja con tu experiencia técnica (5)"
"Inglés de atención al cliente para call centers, para agentes nuevos sin experiencia previa",Agentes nuevos de call center,Reprueban la prueba de inglés de ingreso,Curso corto intensivo de 2 semanas,Institutos de idiomas generalistas,"Contactos, redes",Pago único por curso,Material propio,3,3,2,3,3,"Entrada media (3); inversión media (3); poca recurrencia (2); diferenciación media (3); encaje medio (3)"
\`\`\`
`;

function csvConNichos(): string {
  return `## Nichos\n${CSV_NICHOS}\n## Qué debes verificar\n- Confirma que hay demanda real antes de invertir tiempo.\n\n## Siguiente paso\n- Usa la matriz de esta página para comparar los nichos.`;
}

test("puntuacionPonderada calcula el promedio ponderado por tus pesos (verificado a mano)", () => {
  const n: Nicho = { id: "n1", nombre: "X", cliente: "", problema: "", oferta: "", competencia: "", canales: "", monetizacion: "", recursos: "", entrada: 4, inversion: 4, recurrencia: 3, diferenciacion: 5, encaje: 5, justificacion: "" };
  const pesos = pesosVacios();
  // pesos iguales (20 c/u): promedio simple = (4+4+3+5+5)/5 = 4.2
  assert.equal(puntuacionPonderada(n, pesos), 4.2);
  // todo el peso en "encaje": puntuación = 5
  assert.equal(puntuacionPonderada(n, { entrada: 0, inversion: 0, recurrencia: 0, diferenciacion: 0, encaje: 100 }), 5);
});

test("rankearNichos ordena de mayor a menor puntuación y numera la posición", () => {
  const nichos: Nicho[] = [
    { id: "a", nombre: "A", cliente: "", problema: "", oferta: "", competencia: "", canales: "", monetizacion: "", recursos: "", entrada: 2, inversion: 2, recurrencia: 2, diferenciacion: 2, encaje: 2, justificacion: "" },
    { id: "b", nombre: "B", cliente: "", problema: "", oferta: "", competencia: "", canales: "", monetizacion: "", recursos: "", entrada: 5, inversion: 5, recurrencia: 5, diferenciacion: 5, encaje: 5, justificacion: "" },
  ];
  const r = rankearNichos(nichos, pesosVacios());
  assert.equal(r[0].id, "b");
  assert.equal(r[0].posicion, 1);
  assert.equal(r[1].id, "a");
  assert.equal(r[1].posicion, 2);
});

test("datosMinimosNichos y semaforo", () => {
  assert.equal(datosMinimosNichos(datosInventario()), true);
  assert.equal(datosMinimosNichos(datosVaciosNichos()), false);
  const s = semaforo(datosInventario());
  assert.equal(s.find((x) => x.id === "conocimientos")!.completa, true);
  assert.equal(s.find((x) => x.id === "canales")!.completa, true);
});

test("leerRespuestaNichos1 lee el bloque CSV dentro de «## Nichos», con comillas y comas internas", () => {
  const l = leerRespuestaNichos1(csvConNichos());
  assert.equal(l.valido, true);
  assert.equal(l.nichos.length, 2);
  assert.equal(l.nichos[0].nombre, "Inglés para entrevistas de trabajo en empresas de TI, para desarrolladores peruanos con nivel intermedio");
  assert.equal(l.nichos[0].entrada, 4);
  assert.equal(l.nichos[0].diferenciacion, 5);
  assert.equal(l.nichos[0].canales, "Redes, comunidades de developers");
  assert.ok(l.advertencias.some((a) => a.includes("Solo detecté 2")));
});

test("leerRespuestaNichos1 sin la sección «## Nichos» no es válida", () => {
  const l = leerRespuestaNichos1("No puedo ayudarte con eso.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

test("favoritosListos exige exactamente 2 favoritos que existan entre los nichos leídos", () => {
  const l = leerRespuestaNichos1(csvConNichos());
  const [n1, n2] = l.nichos;
  assert.equal(favoritosListos({ ...datosInventario(), favoritos: [] }, l.nichos), false);
  assert.equal(favoritosListos({ ...datosInventario(), favoritos: [n1.nombre] }, l.nichos), false);
  assert.equal(favoritosListos({ ...datosInventario(), favoritos: [n1.nombre, n2.nombre] }, l.nichos), true);
  assert.equal(favoritosListos({ ...datosInventario(), favoritos: [n1.nombre, "no-existe"] }, l.nichos), false);
});

test("construirPromptNichos1 incluye el inventario y los 3 títulos de salida", () => {
  const p = construirPromptNichos1(datosInventario());
  assert.ok(p.includes("profesor de inglés corporativo"));
  assert.ok(p.includes("## Nichos"));
  assert.ok(p.includes("## Qué debes verificar"));
  assert.ok(p.includes("## Siguiente paso"));
  assert.ok(p.includes("entre 8 y 10 nichos"));
});

test("construirPromptNichos2 incluye los 2 nichos elegidos y los 6 títulos de salida", () => {
  const l = leerRespuestaNichos1(csvConNichos());
  const p = construirPromptNichos2(datosInventario(), l.nichos);
  assert.ok(p.includes("Nicho 1: Inglés para entrevistas"));
  assert.ok(p.includes("Nicho 2: Inglés de atención al cliente"));
  for (const t of TITULOS_VALIDACION) assert.ok(p.includes(`## ${t.titulo}`), `falta ${t.titulo}`);
});

test("construirPromptNichos alterna entre el Prompt 1 y el Prompt 2 según si ya elegiste tus 2 favoritos", () => {
  const l = leerRespuestaNichos1(csvConNichos());
  const [n1, n2] = l.nichos;
  const sinFavoritos = construirPromptNichos(datosInventario(), l.nichos);
  assert.equal(sinFavoritos, construirPromptNichos1(datosInventario()));
  const conFavoritos = construirPromptNichos({ ...datosInventario(), favoritos: [n1.nombre, n2.nombre] }, l.nichos);
  assert.equal(conFavoritos, construirPromptNichos2({ ...datosInventario(), favoritos: [n1.nombre, n2.nombre] }, [n1, n2]));
});

test("progresoNichos llega a 100 % con el inventario completo", () => {
  assert.equal(progresoNichos(datosInventario()).porcentaje, 100);
  assert.equal(progresoNichos(datosVaciosNichos()).porcentaje, 0);
});

const RESPUESTA_VALIDACION = `## Hipótesis críticas
- Nicho 1: hay que validar si los desarrolladores pagarían por un paquete de simulacros [HIPÓTESIS].
- Nicho 2: hay que validar si los call centers derivan presupuesto a este tipo de curso [HIPÓTESIS].

## Plan de validación: Nicho 1
- Días 1 a 7: 10 entrevistas a desarrolladores en comunidades de developers.
- Días 8 a 14: página simple con preventa del paquete de 4 sesiones.
- Costo estimado: S/ 50 (hosting de la página).
- Criterio de éxito definido antes: al menos 3 pagos anticipados o 8 contactos pidiendo precio.

## Plan de validación: Nicho 2
- Días 1 a 7: 10 entrevistas a agentes de call center.
- Días 8 a 14: publicación en 2 comunidades de RR.HH.
- Costo estimado: S/ 0.
- Criterio de éxito definido antes: al menos 5 interesados que dejen su contacto.

## Guion de entrevistas
- ¿Cómo preparas hoy tu inglés para una entrevista de trabajo?
- ¿Qué parte te genera más ansiedad?

## Qué debes verificar
- Confirma que las comunidades de developers permiten publicidad de servicios pagos.

## Siguiente paso
- Agenda las primeras 5 entrevistas de esta semana.`;

test("leerRespuestaValidacion lee las 6 secciones y cuenta las hipótesis", () => {
  const l = leerRespuestaValidacion(RESPUESTA_VALIDACION);
  assert.equal(l.valido, true);
  assert.equal(l.advertencias.length, 0);
  for (const t of TITULOS_VALIDACION) assert.ok(l.secciones[t.clave], `falta ${t.clave}`);
  assert.equal(l.conteoHipotesis, 2);
});

test("revisarNichos1 avisa de nichos sin ficha completa o sin justificación", () => {
  const incompleto: Nicho = { id: "x", nombre: "X", cliente: "", problema: "", oferta: "", competencia: "", canales: "", monetizacion: "", recursos: "", entrada: 3, inversion: 3, recurrencia: 3, diferenciacion: 3, encaje: 3, justificacion: "" };
  const avisos = revisarNichos1([incompleto]);
  assert.ok(avisos.some((a) => a.includes("cliente, problema u oferta")));
  assert.ok(avisos.some((a) => a.includes("justificación")));
  const l = leerRespuestaNichos1(csvConNichos());
  assert.equal(revisarNichos1(l.nichos).length, 0);
});

test("revisarValidacion avisa si no hay ninguna hipótesis etiquetada", () => {
  const sinEtiquetas = leerRespuestaValidacion(RESPUESTA_VALIDACION.replace(/\[HIPÓTESIS\]/g, ""));
  assert.ok(revisarValidacion(sinEtiquetas).length > 0);
  const conEtiquetas = leerRespuestaValidacion(RESPUESTA_VALIDACION);
  assert.equal(revisarValidacion(conEtiquetas).length, 0);
});

test("resumenDeValidacion cuenta cumple / no cumple / sin evaluar", () => {
  const r = resumenDeValidacion([
    { id: "1", nichoNombre: "A", fecha: "", tipo: "entrevista", resultado: "", cumpleCriterio: true },
    { id: "2", nichoNombre: "A", fecha: "", tipo: "entrevista", resultado: "", cumpleCriterio: false },
    { id: "3", nichoNombre: "B", fecha: "", tipo: "busqueda", resultado: "", cumpleCriterio: null },
  ]);
  assert.deepEqual(r, { total: 3, cumple: 1, noCumple: 1, sinEvaluar: 1 });
});

test("normalizarDatosNichos tolera datos vacíos o de otra forma sin romperse", () => {
  const n = normalizarDatosNichos({ conocimientos: "X", tipoCliente: "no-existe", favoritos: ["a", "b", "c"] });
  assert.equal(n.conocimientos, "X");
  assert.equal(n.tipoCliente, "personas");
  assert.equal(n.favoritos.length, 2);
});
