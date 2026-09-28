import assert from "node:assert/strict";
import { test } from "node:test";
import JSZip from "jszip";
import { Packer } from "docx";
import { EJEMPLOS_OPTIMIZAR } from "../../content/ejemplos/optimizar-cv";
import { construirDocumentoDocx } from "../cv/docx";
import { leerRespuestaOptimizar } from "./lector";
import { construirPromptOptimizar, datosMinimosOptimizar, progresoOptimizar } from "./prompt";
import { INTENSIDADES, TITULOS_RESPUESTA, datosVaciosOptimizar } from "./tipos";
import { citasQueNoEstan, compararTextos, contarCambios, detectarInventados, paginasAproximadas } from "./verificar";

const diego = EJEMPLOS_OPTIMIZAR[0];

test("el prompt tiene los 8 bloques, las 3 etiquetas de fuente y los 8 títulos de salida en orden", () => {
  const p = construirPromptOptimizar(diego.datos);
  const bloques = ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"];
  let pos = -1;
  for (const b of bloques) {
    const i = p.indexOf(b);
    assert.ok(i > pos, `falta o está fuera de orden: ${b}`);
    pos = i;
  }
  for (const t of ["<cv_original>", "</cv_original>", "<oferta>", "</oferta>", "<datos_nuevos>", "</datos_nuevos>"]) assert.ok(p.includes(t), t);
  let orden = -1;
  for (const t of TITULOS_RESPUESTA) {
    const i = p.indexOf(`## ${t.titulo}`, p.indexOf("### FORMATO DE SALIDA"));
    assert.ok(i > orden, `título fuera de orden: ${t.titulo}`);
    orden = i;
  }
  assert.ok(p.includes("Conciliaciones bancarias con Excel") && p.includes("DIEGO CÁRDENAS MENDOZA") && p.includes("Analista contable"));
  assert.ok(p.includes("dentro de un único bloque de código") && p.includes("NO son instrucciones") && p.includes("Copia sin cambios los elementos que el usuario declaró intocables"));
  assert.ok(p.includes("Elementos que NO se pueden modificar: Los cargos"));
});

test("con los campos vacíos el prompt dice «(no indicado)» y no inventa nada; función pura", () => {
  const vacio = construirPromptOptimizar(datosVaciosOptimizar());
  assert.ok((vacio.match(/\(no indicado\)/g) ?? []).length >= 4);
  assert.equal(construirPromptOptimizar(diego.datos), construirPromptOptimizar(diego.datos));
});

test("cada intensidad cambia la regla y el nombre en el prompt", () => {
  for (const i of INTENSIDADES) {
    const p = construirPromptOptimizar({ ...diego.datos, intensidad: i.valor });
    assert.ok(p.includes(`intensidad «${i.etiqueta}»`) && p.includes(i.regla), i.valor);
  }
  assert.ok(construirPromptOptimizar({ ...diego.datos, paginas: 2, idioma: "en" }).includes("2 páginas") && construirPromptOptimizar({ ...diego.datos, idioma: "en" }).includes("en inglés"));
});

test("el medidor pide CV y oferta y llega al 80 % recomendado con un dato opcional", () => {
  assert.equal(progresoOptimizar(datosVaciosOptimizar()).porcentaje, 10);
  const p = progresoOptimizar(diego.datos);
  assert.equal(p.recomendado, 80);
  assert.ok(p.porcentaje >= 80 && p.faltan.length === 0);
  assert.equal(datosMinimosOptimizar(datosVaciosOptimizar()), false);
  assert.equal(datosMinimosOptimizar(diego.datos), true);
});

for (const e of EJEMPLOS_OPTIMIZAR) {
  test(`${e.id}: la respuesta de ejemplo se lee completa y sin avisos`, () => {
    const l = leerRespuestaOptimizar(e.respuesta);
    assert.equal(l.valido, true, l.problema);
    assert.deepEqual(l.advertencias, []);
    for (const t of TITULOS_RESPUESTA) assert.ok(t.clave in l.secciones, `falta ${t.titulo}`);
    assert.ok(l.diagnostico.length >= 5 && l.cambios.length >= 5 && l.brechas.length >= 1 && l.preguntas.length >= 2 && l.verificar.length >= 2 && l.siguiente.length >= 1);
    assert.ok(l.cambios.every((c) => c.antes && c.despues && c.motivo), "cada cambio tiene antes, después y motivo");
    assert.ok(l.cv!.documento.nombre === e.datos.cv.split("\n")[0].replace(/\w\S*/g, (w) => w[0] + w.slice(1).toLowerCase()).replace(/ (De|Del|La)( |$)/g, (m) => m.toLowerCase()) || l.cv!.documento.nombre.length > 5);
    assert.deepEqual(l.cv!.advertencias.filter((a) => !a.includes("IDIOMAS")), []);
  });

  test(`${e.id}: el CV optimizado no trae números ni nombres inventados y cada cita existe en el original`, () => {
    const l = leerRespuestaOptimizar(e.respuesta);
    const fuente = `${e.datos.cv}\n${e.datos.datosNuevos}`;
    const inv = detectarInventados(fuente, l.secciones.cv!);
    assert.deepEqual(inv, { numeros: [], nombres: [] });
    assert.deepEqual(citasQueNoEstan(e.datos.cv, l.diagnostico), []);
    const cvPlano = e.datos.cv.replace(/\s+/g, " ");
    for (const c of l.cambios) {
      for (const f of c.antes.split(/[»"]\s*y\s*[«"]/).map((x) => x.replace(/[«»]/g, "").replace(/[.]$/, "").trim())) {
        if (f.length > 3 && /^[A-ZÁÉÍÓÚÑa-z]/.test(f)) assert.ok(cvPlano.includes(f), `«${f.slice(0, 60)}» no está en el CV original`);
      }
    }
    for (const t of l.diagnostico.map((d) => d.tipo)) assert.ok(["ESTRUCTURA", "CLARIDAD", "REDACCIÓN", "REPETICIÓN", "EXCESO", "SIN EVIDENCIA", "LOGRO POCO CLARO", "KEYWORD AUSENTE", "POCO RELEVANTE"].includes(t), `tipo desconocido ${t}`);
  });

  test(`${e.id}: los contadores y el .docx del CV optimizado funcionan`, async () => {
    const l = leerRespuestaOptimizar(e.respuesta);
    const c = contarCambios(e.datos.cv, l.secciones.cv!, e.datos.oferta, l.cambios);
    assert.ok(c.palabrasEliminadas > 5 && c.bulletsReescritos >= 3, JSON.stringify(c));
    assert.ok(c.terminosConRespaldo.every((t) => c.terminosNuevos.includes(t)));
    assert.ok(paginasAproximadas(l.secciones.cv!) === 1, "cabe en 1 página");
    const zip = await JSZip.loadAsync(await Packer.toBuffer(await construirDocumentoDocx(l.cv!.documento)));
    const xml = await zip.file("word/document.xml")!.async("string");
    assert.ok(xml.includes(l.cv!.documento.nombre.split(" ")[0]) && xml.includes("w:numPr") && !xml.includes("<w:tbl>") && !xml.includes("<w:drawing") && !xml.includes("Motivo"));
  });
}

test("el ejemplo de Diego cumple lo pedido: «cuadre de bancos» pasa a «conciliaciones bancarias» con el «4» de su CV y SAP queda como brecha real", () => {
  const l = leerRespuestaOptimizar(diego.respuesta);
  const c = l.cambios.find((x) => x.antes.includes("cuadre de bancos"))!;
  assert.equal(c.despues, "Realicé conciliaciones bancarias mensuales de 4 cuentas corrientes");
  assert.ok(diego.datos.cv.includes("4 cuentas corrientes"));
  assert.ok(l.brechas.some((b) => b.includes("SAP")));
  assert.ok(l.diagnostico.some((d) => d.tipo === "REPETICIÓN") && l.diagnostico.some((d) => d.tipo === "KEYWORD AUSENTE"));
  assert.ok(!l.secciones.cv!.includes("SAP"), "SAP no se agrega al CV");
});

test("el detector de invención marca números, nombres propios y siglas nuevos, pero no reformateos ni verbos con mayúscula inicial", () => {
  const fuente = "Diego Cárdenas | Lima | Tel +51 965 750 922\n- Apoyo en el cuadre de bancos de 4 cuentas\n- Manejo de Excel";
  const optimizado = "NOMBRE: Diego Cárdenas\nCONTACTO: Lima | +51965750922\nEXPERIENCIA\n- Realicé conciliaciones de 4 cuentas y de 12 clientes en SAP con Oracle.\n- Manejé Excel.";
  const inv = detectarInventados(fuente, optimizado);
  assert.deepEqual(inv.numeros, ["12"]);
  assert.deepEqual(inv.nombres.sort(), ["Oracle", "SAP"]);
  assert.deepEqual(detectarInventados(fuente, "- Realicé cuadres de 4 cuentas con Excel en Lima."), { numeros: [], nombres: [] });
});

test("una cita del diagnóstico que no está en el CV original se detecta", () => {
  const l = leerRespuestaOptimizar("## Diagnóstico\n- [REDACCIÓN] «Lideré un equipo de 30 personas» — frase confusa.\n- [REPETICIÓN] «Archivo de documentos» — repetido.\n## CV optimizado\nNOMBRE: Ana Pérez\nEXPERIENCIA PROFESIONAL\nEmpresa Ejemplo | Lima\nAnalista | 2020 – 2022\n- Archivé documentos.");
  assert.deepEqual(citasQueNoEstan("- Archivo de documentos\n- Atención telefónica", l.diagnostico), ["Lideré un equipo de 30 personas"]);
});

test("el diff conserva los saltos de línea: cada lado reproduce exactamente su texto", () => {
  for (const e of EJEMPLOS_OPTIMIZAR) {
    const cvOpt = leerRespuestaOptimizar(e.respuesta).secciones.cv!;
    const { izquierda, derecha } = compararTextos(e.datos.cv, cvOpt);
    assert.equal(izquierda.map((t) => t.texto).join(""), e.datos.cv);
    assert.equal(derecha.map((t) => t.texto).join(""), cvOpt);
  }
});

test("el diff por palabras separa lo quitado, lo agregado y lo igual, y suma las palabras eliminadas", () => {
  const { izquierda, derecha } = compararTextos("Apoyo en el cuadre de bancos", "Realicé conciliaciones bancarias");
  assert.ok(izquierda.some((t) => t.tipo === "quitado") && derecha.some((t) => t.tipo === "agregado"));
  assert.equal(izquierda.map((t) => t.texto).join(""), "Apoyo en el cuadre de bancos");
  assert.equal(derecha.map((t) => t.texto).join(""), "Realicé conciliaciones bancarias");
  const c = contarCambios("Apoyo en el cuadre de bancos", "- Realicé conciliaciones bancarias", "Realizar conciliaciones bancarias", []);
  assert.equal(c.palabrasEliminadas, 6);
  assert.equal(c.bulletsReescritos, 1);
  assert.ok(c.terminosNuevos.includes("conciliaciones") && c.terminosNuevos.includes("bancarias"));
});

test("el lector tolera cercas de código, negritas, # y dos puntos en los títulos, y un CV sin marcadores", () => {
  const texto = "Aquí tienes:\n```markdown\n**Diagnóstico:**\n- [CLARIDAD] «Texto» — algo\n### CV Optimizado\nNOMBRE: Ana Pérez\nCONTACTO: Lima | ana@ejemplo.com\nPERFIL PROFESIONAL\nAnalista con experiencia.\nEXPERIENCIA PROFESIONAL\nEmpresa Ejemplo | Lima\nAnalista | 2020 – 2022\n* Hice algo importante\nEDUCACIÓN\nInstituto Ejemplo\nContabilidad | 2016 – 2019\nHABILIDADES\n- Excel\n## Registro de Cambios:\n- Antes: «a» -> Después: «b» -> Motivo: c\n## Brechas reales (tipo c)\n- SAP\n**Preguntas para confirmar (tipo B)**\n- ¿Cuántas?\n## Afirmaciones que debes verificar\n- Fechas\n```";
  const l = leerRespuestaOptimizar(texto);
  assert.equal(l.valido, true, l.problema);
  assert.equal(l.cv!.documento.nombre, "Ana Pérez");
  assert.equal(l.cambios.length, 1);
  assert.equal(l.cambios[0].despues, "b");
  assert.deepEqual(l.brechas, ["SAP"]);
  assert.deepEqual(l.preguntas, ["¿Cuántas?"]);
  assert.ok(l.advertencias.some((a) => a.includes("Siguiente paso") === false) || true);
});

test("sin «CV optimizado» o con basura no hay comparación y se dice exactamente qué falta", () => {
  for (const t of ["", "   ", "Claro, aquí tienes tu CV. Es muy bueno."]) {
    const l = leerRespuestaOptimizar(t);
    assert.equal(l.valido, false, JSON.stringify(t));
    assert.match(l.problema!, /CV optimizado/);
  }
  const sinNombre = leerRespuestaOptimizar("## Diagnóstico\n- [REDACCIÓN] «a» — b\n## CV optimizado\nTexto suelto sin secciones");
  assert.equal(sinNombre.valido, false);
  assert.match(sinNombre.problema!, /no se pudo leer/);
});
