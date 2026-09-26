import assert from "node:assert/strict";
import { test } from "node:test";
import JSZip from "jszip";
import { Packer } from "docx";
import { cvDesdeDatos } from "./desde-datos";
import { construirDocumentoDocx, nombreDeArchivo } from "./docx";
import { leerRespuestaIa } from "./parser";
import { construirPrompt, MARCADOR_NOTAS, progresoCv } from "./prompt";
import { datosVacios, type DatosCv } from "./tipos";
import { CV_EJEMPLO_RESPUESTA } from "../../content/prompts/cv-ejemplo";

function datosDePrueba(): DatosCv {
  return {
    ...datosVacios(),
    puesto: "Analista de marketing digital",
    oferta: "Buscamos analista con SEO, Google Analytics y reportes mensuales.",
    nivel: "semi-senior",
    nombre: "Camila Rojas",
    email: "camila@example.com",
    telefono: "+51 900 000 000",
    ciudad: "Lima, Perú",
    experiencias: [
      { id: "e1", cargo: "Analista de marketing", empresa: "Tienda Ejemplo", lugar: "Lima, Perú", inicio: "Mar 2022", fin: "Actualidad", logros: "- Armé reportes mensuales en Google Analytics\n- Publiqué 12 artículos SEO" },
    ],
    estudios: [{ id: "s1", titulo: "Licenciatura en Marketing", institucion: "Universidad Ejemplo", lugar: "Lima, Perú", inicio: "2016", fin: "2021", detalle: "" }],
    habilidades: "SEO\nGoogle Analytics",
  };
}

test("el prompt contiene los datos escritos y no inventa los que faltan", () => {
  const p = construirPrompt(datosDePrueba());
  for (const t of ["Camila Rojas", "camila@example.com", "Tienda Ejemplo", "Armé reportes mensuales en Google Analytics", "Buscamos analista con SEO", MARCADOR_NOTAS, "AUTOVERIFICACIÓN"]) assert.ok(p.includes(t), t);
  assert.ok(p.includes("LinkedIn") === true); // aparece en el formato de salida, no como dato
  assert.ok(!p.includes("LinkedIn: "), "sin LinkedIn escrito no debe aparecer como dato");
  const vacio = construirPrompt(datosVacios());
  assert.ok(vacio.includes("(no indicado)"));
  assert.ok(vacio.includes("no pegó ninguna oferta"));
});

test("el orden de las secciones depende del nivel y el idioma cambia los encabezados", () => {
  const junior = construirPrompt({ ...datosDePrueba(), nivel: "junior" });
  const senior = construirPrompt({ ...datosDePrueba(), nivel: "senior" });
  assert.ok(junior.indexOf("EDUCACIÓN → EXPERIENCIA PROFESIONAL") > -1);
  assert.ok(senior.indexOf("EXPERIENCIA PROFESIONAL → EDUCACIÓN") > -1);
  const en = construirPrompt({ ...datosDePrueba(), idioma: "en" });
  assert.ok(en.includes("PROFESSIONAL EXPERIENCE") && en.includes("en inglés"));
});

test("el prompt es una función pura (mismos datos, mismo texto)", () => {
  assert.equal(construirPrompt(datosDePrueba()), construirPrompt(datosDePrueba()));
});

test("el progreso cuenta los datos clave", () => {
  assert.equal(progresoCv(datosVacios()).hechos, 0);
  const p = progresoCv(datosDePrueba());
  assert.equal(p.total, 8);
  assert.equal(p.hechos, 8);
  assert.deepEqual(p.faltan, []);
});

test("el lector entiende la respuesta de la IA y separa las notas", () => {
  const r = leerRespuestaIa(CV_EJEMPLO_RESPUESTA);
  assert.equal(r.valido, true);
  assert.equal(r.documento.nombre, "Camila Rojas Tello");
  assert.ok(r.documento.contacto.length >= 3);
  const titulos = r.documento.secciones.map((s) => s.titulo);
  assert.ok(titulos.includes("EXPERIENCIA PROFESIONAL") && titulos.includes("EDUCACIÓN") && titulos.includes("HABILIDADES"));
  const exp = r.documento.secciones.find((s) => s.titulo === "EXPERIENCIA PROFESIONAL")!;
  assert.ok(exp.entradas.length >= 2);
  assert.ok(exp.entradas[0].izq1 && exp.entradas[0].der1 && exp.entradas[0].izq2 && exp.entradas[0].der2 && exp.entradas[0].puntos.length >= 3);
  assert.ok(r.notas.length >= 3);
  assert.ok(!JSON.stringify(r.documento).includes("Preguntas"));
});

test("el lector tolera negritas, viñetas • y bloques de código", () => {
  const r = leerRespuestaIa("```\n# **Ana Pérez**\nLima | ana@example.com\n## **Experiencia**\n### **Empresa X** | Lima\n**Analista** | 2020 – 2022\n• Hice algo\n```");
  assert.equal(r.valido, true);
  assert.equal(r.documento.nombre, "Ana Pérez");
  assert.deepEqual(r.documento.contacto, ["Lima", "ana@example.com"]);
  const e = r.documento.secciones[0].entradas[0];
  assert.equal(e.izq1, "Empresa X");
  assert.equal(e.izq2, "Analista");
  assert.deepEqual(e.puntos, ["Hice algo"]);
});

test("una respuesta sin el formato se rechaza con un motivo", () => {
  const r = leerRespuestaIa("Claro, aquí tienes tu CV. Es muy bueno.");
  assert.equal(r.valido, false);
  assert.ok(r.problema);
});

test("el CV armado con los datos (sin IA) conserva el texto y el orden", () => {
  const cv = cvDesdeDatos(datosDePrueba());
  assert.equal(cv.nombre, "Camila Rojas");
  assert.equal(cv.secciones[0].titulo, "EXPERIENCIA PROFESIONAL");
  assert.deepEqual(cv.secciones[0].entradas[0].puntos, ["Armé reportes mensuales en Google Analytics", "Publiqué 12 artículos SEO"]);
  assert.equal(cvDesdeDatos({ ...datosDePrueba(), nivel: "junior" }).secciones[0].titulo, "EDUCACIÓN");
});

test("el Word se genera, es un .docx válido con el contenido y sin tablas ni imágenes", async () => {
  const cv = leerRespuestaIa(CV_EJEMPLO_RESPUESTA).documento;
  const buf = await Packer.toBuffer(await construirDocumentoDocx(cv));
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file("word/document.xml")!.async("string");
  for (const t of [cv.nombre, "EXPERIENCIA PROFESIONAL", cv.secciones[1].entradas[0].izq1]) assert.ok(xml.includes(t.replace(/&/g, "&amp;")), t);
  assert.ok(!xml.includes("<w:tbl>"), "sin tablas");
  assert.ok(!xml.includes("<w:drawing"), "sin imágenes");
  assert.ok(!xml.includes("<w:txbxContent"), "sin cuadros de texto");
  assert.ok(xml.includes("w:numPr"), "viñetas reales de Word");
  assert.equal(Object.keys(zip.files).filter((f) => /header|footer/i.test(f)).length, 0, "sin encabezados ni pies");
});

test("el nombre de archivo es seguro", () => {
  assert.equal(nombreDeArchivo("Camila Rojas"), "CV-Camila-Rojas.docx");
  assert.equal(nombreDeArchivo("José Ñandú/../x"), "CV-Jose-Nandu-x.docx");
  assert.equal(nombreDeArchivo(""), "CV-Hoja-de-vida.docx");
});
