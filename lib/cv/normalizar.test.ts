import assert from "node:assert/strict";
import { test } from "node:test";
import { CV_EJEMPLO_RESPUESTA } from "../../content/prompts/cv-ejemplo";
import { normalizarRespuestaIA, reconocerSeccion } from "./normalizar";
import { leerRespuestaIa } from "./parser";

/** Lo que pasa hoy: la persona selecciona el texto ya formateado por la IA y pierde los marcadores Markdown. */
const SELECCIONADO_CON_MOUSE = `NOMBRE: Nino Barrios Bellido
CONTACTO: Arequipa, Perú | [correo@gmail.com](mailto:correo@gmail.com) | +51965750922
PERFIL PROFESIONAL
Desarrollador Full Stack junior con experiencia en microservicios.
EXPERIENCIA PROFESIONAL
NB | Arequipa, Perú
Fullstack | 2023 – 2026

* Desarrollé microservicios para soluciones de software.
* Desarrollé componentes reutilizables.

EDUCACIÓN
UCSM | Arequipa, Perú
Ingeniería de Sistemas | 2015 – 2020
HABILIDADES

* Técnicas: SQL, Excel avanzado, Google Analytics.

IDIOMAS

* Inglés: B2.

CERTIFICACIONES
Inteligencia de Negocios
Curso | 2015`;

function comprobarEjemploDelUsuario(texto: string) {
  const r = leerRespuestaIa(texto);
  assert.equal(r.valido, true, r.problema);
  assert.equal(r.documento.nombre, "Nino Barrios Bellido");
  assert.deepEqual(r.documento.contacto, ["Arequipa, Perú", "correo@gmail.com", "+51965750922"]);
  assert.deepEqual(r.documento.secciones.map((s) => s.titulo), ["PERFIL PROFESIONAL", "EXPERIENCIA PROFESIONAL", "EDUCACIÓN", "HABILIDADES", "IDIOMAS", "CERTIFICACIONES"]);
  const [perfil, exp, edu, hab, idi, cert] = r.documento.secciones;
  assert.deepEqual(perfil.parrafos, ["Desarrollador Full Stack junior con experiencia en microservicios."]);
  assert.deepEqual(exp.entradas, [{ izq1: "NB", der1: "Arequipa, Perú", izq2: "Fullstack", der2: "2023 – 2026", puntos: ["Desarrollé microservicios para soluciones de software.", "Desarrollé componentes reutilizables."] }]);
  assert.deepEqual(edu.entradas, [{ izq1: "UCSM", der1: "Arequipa, Perú", izq2: "Ingeniería de Sistemas", der2: "2015 – 2020", puntos: [] }]);
  assert.deepEqual(hab.puntos, ["Técnicas: SQL, Excel avanzado, Google Analytics."]);
  assert.deepEqual(idi.puntos, ["Inglés: B2."]);
  assert.deepEqual(cert.entradas, [{ izq1: "Inteligencia de Negocios", der1: "", izq2: "Curso", der2: "2015", puntos: [] }]);
  assert.deepEqual(r.advertencias, []);
  return r;
}

test("(a) el ejemplo real que fallaba (texto seleccionado con el mouse, sin ## ni ###) ahora se lee completo", () => {
  comprobarEjemploDelUsuario(SELECCIONADO_CON_MOUSE);
});

test("(b) la versión con Markdown correcto sigue funcionando y da lo mismo", () => {
  const md = `NOMBRE: Nino Barrios Bellido
CONTACTO: Arequipa, Perú | correo@gmail.com | +51965750922
## PERFIL PROFESIONAL
Desarrollador Full Stack junior con experiencia en microservicios.
## EXPERIENCIA PROFESIONAL
### NB | Arequipa, Perú
Fullstack | 2023 – 2026
- Desarrollé microservicios para soluciones de software.
- Desarrollé componentes reutilizables.
## EDUCACIÓN
### UCSM | Arequipa, Perú
Ingeniería de Sistemas | 2015 – 2020
## HABILIDADES
- Técnicas: SQL, Excel avanzado, Google Analytics.
## IDIOMAS
- Inglés: B2.
## CERTIFICACIONES
### Inteligencia de Negocios
Curso | 2015`;
  comprobarEjemploDelUsuario(md);
  const ejemplo = leerRespuestaIa(CV_EJEMPLO_RESPUESTA);
  assert.equal(ejemplo.valido, true);
  assert.deepEqual(ejemplo.advertencias, []);
});

test("(c) la respuesta dentro de un bloque ```markdown se lee igual (con y sin lenguaje en la cerca)", () => {
  comprobarEjemploDelUsuario("```markdown\n" + SELECCIONADO_CON_MOUSE + "\n```");
  comprobarEjemploDelUsuario("```\n" + SELECCIONADO_CON_MOUSE + "\n```");
  comprobarEjemploDelUsuario("```text\n" + SELECCIONADO_CON_MOUSE + "\n```\nEspero que te sirva.");
});

test("(d) el texto introductorio de la IA se ignora", () => {
  comprobarEjemploDelUsuario("¡Claro! Aquí tienes tu CV:\n\n" + SELECCIONADO_CON_MOUSE);
  comprobarEjemploDelUsuario("Aquí tienes tu hoja de vida optimizada para ATS en formato Harvard:\n\n```markdown\n" + SELECCIONADO_CON_MOUSE + "\n```");
  comprobarEjemploDelUsuario("Sure! Here is your resume:\n" + SELECCIONADO_CON_MOUSE);
});

test("(e) texto vacío o basura: no hay vista previa y se dice exactamente qué falta", () => {
  for (const basura of ["", "   \n\n  ", "Claro, aquí tienes tu CV. Es muy bueno."]) {
    const r = leerRespuestaIa(basura);
    assert.equal(r.valido, false, JSON.stringify(basura));
    assert.ok(r.problema && r.problema.length > 10);
  }
  assert.match(leerRespuestaIa("").problema!, /nombre/i);
  // Con nombre pero sin secciones: falta lo imprescindible y lo dice.
  assert.match(leerRespuestaIa("NOMBRE: Ana Pérez\nCONTACTO: Lima").problema!, /ninguna sección/);
});

test("el nombre puede venir como primera línea o como # Título, sin la etiqueta NOMBRE:", () => {
  const r = leerRespuestaIa("# Ana Pérez\nLima, Perú | ana@ejemplo.com\nEXPERIENCIA LABORAL\nEmpresa Ejemplo | Lima\nAnalista | 2020 – 2022\n• Hice algo importante");
  assert.equal(r.valido, true);
  assert.equal(r.documento.nombre, "Ana Pérez");
  assert.deepEqual(r.documento.contacto, ["Lima, Perú", "ana@ejemplo.com"]);
  assert.equal(r.documento.secciones[0].titulo, "EXPERIENCIA PROFESIONAL");
  assert.equal(r.documento.secciones[0].entradas[0].puntos[0], "Hice algo importante");
});

test("enlaces, negritas, cursivas y viñetas • · – se limpian", () => {
  const n = normalizarRespuestaIA("NOMBRE: **Ana Pérez**\nCONTACTO: [ana@ejemplo.com](mailto:ana@ejemplo.com) | [mi web](https://ejemplo.com) | *Lima*\nHABILIDADES\n• SQL\n· Excel\n– Power BI\n* __Python__");
  assert.ok(n.texto.includes("NOMBRE: Ana Pérez"));
  assert.ok(n.texto.includes("CONTACTO: ana@ejemplo.com | mi web | Lima"));
  assert.ok(n.texto.includes("## HABILIDADES"));
  for (const v of ["- SQL", "- Excel", "- Power BI", "- Python"]) assert.ok(n.texto.split("\n").includes(v), v);
  assert.ok(!/[*_\[\]]/.test(n.texto));
});

test("los encabezados se reconocen sin mayúsculas, sin tildes, con dos puntos y con variantes", () => {
  for (const [texto, titulo] of [
    ["educacion", "EDUCACIÓN"],
    ["Educación:", "EDUCACIÓN"],
    ["FORMACIÓN ACADÉMICA", "EDUCACIÓN"],
    ["Perfil", "PERFIL PROFESIONAL"],
    ["experiencia laboral", "EXPERIENCIA PROFESIONAL"],
    ["CURSOS", "CERTIFICACIONES"],
    ["Proyectos y actividades", "PROYECTOS Y ACTIVIDADES"],
    ["Work Experience", "PROFESSIONAL EXPERIENCE"],
  ] as const) assert.equal(reconocerSeccion(texto)?.titulo, titulo, texto);
  assert.equal(reconocerSeccion("Desarrollé microservicios para soluciones de software."), null);
});

test("las notas van aparte y no entran en el CV; la advertencia de secciones no bloquea", () => {
  const r = leerRespuestaIa(SELECCIONADO_CON_MOUSE.replace(/\n\nIDIOMAS\n\n\* Inglés: B2\./, "") + "\n=== NOTAS ===\n- Falta cuantificar los logros.\n* Verifica las fechas.");
  assert.equal(r.valido, true);
  assert.deepEqual(r.notas, ["Falta cuantificar los logros.", "Verifica las fechas."]);
  assert.ok(!JSON.stringify(r.documento).includes("cuantificar"));
  assert.deepEqual(r.advertencias, ["No detecté la sección IDIOMAS, se omitirá."]);
  assert.deepEqual(leerRespuestaIa("NOMBRE: Ana\nEDUCACIÓN\nUCSM | Lima\nIngeniería | 2015 – 2020\nNotas\n- algo").notas, ["algo"]);
});

test("los datos [COMPLETAR: …] generan una advertencia", () => {
  const r = leerRespuestaIa(SELECCIONADO_CON_MOUSE.replace("+51965750922", "[COMPLETAR: teléfono]"));
  assert.equal(r.valido, true);
  assert.ok(r.advertencias.some((a) => a.includes("[COMPLETAR")));
});
