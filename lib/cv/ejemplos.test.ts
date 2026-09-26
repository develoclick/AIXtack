import assert from "node:assert/strict";
import { test } from "node:test";
import JSZip from "jszip";
import { Packer } from "docx";
import { EJEMPLOS_CV } from "../../content/ejemplos/cv-harvard";
import { construirDocumentoDocx } from "./docx";
import { normalizarRespuestaIA } from "./normalizar";
import { leerRespuestaIa } from "./parser";
import { construirPrompt, progresoCv } from "./prompt";
import { MAX_ESTUDIOS, MAX_EXPERIENCIAS } from "./tipos";

const CLAVES: Record<string, string[]> = {
  "estudiante-sin-experiencia": ["inventarios", "Excel", "almacén", "Ingeniería Industrial"],
  "junior-desarrollador": ["React", "Node.js", "PostgreSQL", "Docker", "APIs REST"],
  "semi-senior-marketing": ["SEO", "Google Analytics 4", "reportes"],
  "senior-gerencia": ["Lean", "presupuesto", "MBA", "producción"],
};

test("hay 4 perfiles distintos: sin experiencia, junior técnico, semi senior no técnico y senior", () => {
  assert.deepEqual(EJEMPLOS_CV.map((e) => e.id), ["estudiante-sin-experiencia", "junior-desarrollador", "semi-senior-marketing", "senior-gerencia"]);
  assert.deepEqual(EJEMPLOS_CV.map((e) => e.datos.nivel), ["sin-experiencia", "junior", "semi-senior", "senior"]);
  assert.equal(new Set(EJEMPLOS_CV.map((e) => e.datos.nombre)).size, 4);
});

test("los datos son claramente ficticios: correo @ejemplo.com, teléfono peruano inventado y sin datos de personas reales", () => {
  for (const { id, datos } of EJEMPLOS_CV) {
    assert.match(datos.email, /^[a-z.]+@ejemplo\.com$/, id);
    assert.match(datos.telefono, /^\+51 9\d{2} \d{3} \d{3}$/, id);
    assert.match(datos.telefono, /^\+51 900 000 \d{3}$/, `${id}: teléfono claramente inventado`);
    assert.ok(datos.ciudad.endsWith("Perú"), id);
    assert.ok(datos.oferta.length > 200, `${id}: oferta de ejemplo con funciones y requisitos`);
    assert.ok(datos.experiencias.length <= MAX_EXPERIENCIAS && datos.estudios.length <= MAX_ESTUDIOS, id);
    for (const fila of [...datos.experiencias, ...datos.estudios]) assert.ok(fila.id, id);
    assert.equal(new Set([...datos.experiencias, ...datos.estudios].map((f) => f.id)).size, datos.experiencias.length + datos.estudios.length, `${id}: ids repetidos`);
  }
});

for (const ejemplo of EJEMPLOS_CV) {
  test(`${ejemplo.id}: la respuesta de ejemplo pasa el normalizador y el lector sin advertencias`, () => {
    const r = leerRespuestaIa(ejemplo.respuesta);
    assert.equal(r.valido, true, r.problema);
    assert.deepEqual(r.advertencias, []);
    assert.equal(r.documento.nombre, ejemplo.datos.nombre);
    assert.ok(r.documento.contacto.includes(ejemplo.datos.email) && r.documento.contacto.includes(ejemplo.datos.telefono));
    assert.ok(r.notas.length >= 3, "trae notas para la persona");
    // El normalizador no debe alterar un texto que ya está en el formato canónico.
    assert.equal(normalizarRespuestaIA(ejemplo.respuesta).texto, ejemplo.respuesta.split("=== NOTAS ===")[0].trimEnd());
  });

  test(`${ejemplo.id}: la respuesta coincide con los datos del formulario y con la oferta`, () => {
    const { datos, respuesta } = ejemplo;
    for (const e of datos.experiencias.filter((x) => x.empresa)) assert.ok(respuesta.includes(e.empresa), `falta la empresa ${e.empresa}`);
    for (const e of datos.estudios.filter((x) => x.institucion)) assert.ok(respuesta.includes(e.institucion), `falta ${e.institucion}`);
    for (const clave of CLAVES[ejemplo.id]) {
      assert.ok(respuesta.includes(clave), `la respuesta no incluye «${clave}»`);
      assert.ok(datos.oferta.toLowerCase().includes(clave.toLowerCase()) || datos.habilidades.toLowerCase().includes(clave.toLowerCase()) || datos.estudios.some((e) => e.titulo.includes(clave)), `«${clave}» no sale de la oferta ni de los datos`);
    }
    // Las cifras de la respuesta salen de lo que la persona escribió (no se inventan).
    const fuente = JSON.stringify(datos);
    for (const cifra of respuesta.split("=== NOTAS ===")[0].match(/\b\d{1,3}(?:\.\d{3})?\s?%|\b\d{2,3}\b(?= (?:personas|endpoints|artículos|cuentas|voluntarios|operarios|proveedores))/g) ?? []) {
      assert.ok(fuente.includes(cifra.replace(/\s/g, "")) || fuente.includes(cifra), `${ejemplo.id}: la cifra «${cifra}» no está en los datos`);
    }
  });

  test(`${ejemplo.id}: el prompt se arma con los datos de ejemplo y el formulario queda completo`, () => {
    const p = construirPrompt(ejemplo.datos);
    for (const t of [ejemplo.datos.nombre, ejemplo.datos.email, ejemplo.datos.puesto, "OFERTA LABORAL"]) assert.ok(p.includes(t), t);
    assert.ok(!p.includes("no pegó ninguna oferta"));
    assert.deepEqual(progresoCv(ejemplo.datos).faltan, []);
  });

  test(`${ejemplo.id}: genera un .docx válido de una columna, sin tablas ni imágenes`, async () => {
    const cv = leerRespuestaIa(ejemplo.respuesta).documento;
    const zip = await JSZip.loadAsync(await Packer.toBuffer(await construirDocumentoDocx(cv)));
    const xml = await zip.file("word/document.xml")!.async("string");
    assert.ok(xml.includes(ejemplo.datos.nombre.split(" ")[0]));
    assert.ok(!xml.includes("<w:tbl>") && !xml.includes("<w:drawing") && !xml.includes("txbxContent") && !xml.includes("<w:cols "));
    assert.ok(xml.includes("w:numPr"));
    assert.ok(!xml.includes("NOTAS"));
  });
}
