import assert from "node:assert/strict";
import { test } from "node:test";
import { CIERRE_COMUN } from "./cierre-comun";
import { construirPrompt, rellenarTarea, type CampoConValor } from "./construir-prompt";
import { REGLAS_COMUNES } from "./reglas-comunes";

const campos: CampoConValor[] = [
  { id: "oferta", label: "Oferta", valor: "Combo de fin de semana: 6 panes y 1 pan dulce por $6", requerido: true },
  { id: "condiciones", label: "Condiciones", valor: "", requerido: false },
  { id: "lugar", label: "Lugar", valor: "  ", requerido: true },
];

const perfil = { nombre: "Panadería La Espiga", tono: "Cercano", direccion: "Av. Ejemplo 123", contacto: "" };

test("nunca deja llaves dobles, ni siquiera en un texto pegado por la persona", () => {
  const prompt = construirPrompt(perfil, [{ id: "x", label: "Consulta", valor: "Hola {{nombre}} }} {{", requerido: true }], null, "Responde: {{x}} y {{noExiste}} {{", { usaPerfil: ["nombre"] });
  assert.equal(prompt.includes("{{"), false);
  assert.equal(prompt.includes("}}"), false);
});

test("un campo requerido vacío se marca [FALTA]; uno opcional vacío se omite", () => {
  const prompt = construirPrompt({}, campos, null, "Escribe el texto.");
  assert.match(prompt, /- Oferta: Combo de fin de semana: 6 panes y 1 pan dulce por \$6/);
  assert.match(prompt, /- Lugar: \[FALTA\]/);
  assert.equal(prompt.includes("Condiciones"), false);
});

test("los {{id}} de la tarea se sustituyen; los vacíos requeridos van como [FALTA: etiqueta] y los opcionales como «no indicado»", () => {
  const t = rellenarTarea("Oferta: {{oferta}}. Condiciones: {{condiciones}}. Lugar: {{lugar}}. Otro: {{desconocido}}.", campos);
  assert.equal(t, "Oferta: Combo de fin de semana: 6 panes y 1 pan dulce por $6. Condiciones: no indicado. Lugar: [FALTA: Lugar]. Otro: [FALTA].");
});

test("del perfil solo viajan los campos declarados en usaPerfil y con texto", () => {
  const prompt = construirPrompt(perfil, campos, null, "Tarea.", { usaPerfil: ["nombre", "contacto", "horario"] });
  assert.match(prompt, /DATOS DE MI NEGOCIO\n- Nombre del negocio: Panadería La Espiga/);
  assert.equal(prompt.includes("Av. Ejemplo 123"), false, "dirección no declarada");
  assert.equal(prompt.includes("Contacto"), false, "contacto vacío");
  assert.equal(prompt.includes("Horario"), false, "horario sin dato");
  assert.equal(construirPrompt(perfil, campos, null, "Tarea.").includes("DATOS DE MI NEGOCIO"), false);
});

test("los cálculos van como ya hechos, con la orden de no recalcular, y los que faltan se marcan [FALTA]", () => {
  const prompt = construirPrompt({}, campos, [{ etiqueta: "Margen después", texto: "$2.70" }, { etiqueta: "Ventas necesarias", texto: null }], "Redacta la promoción.");
  assert.match(prompt, /CÁLCULOS YA HECHOS \(los calculó la página; úsalos tal cual, no los recalcules ni los cambies\)/);
  assert.match(prompt, /- Margen después: \$2\.70/);
  assert.match(prompt, /- Ventas necesarias: \[FALTA\]/);
  assert.equal(construirPrompt({}, campos, null, "T.").includes("CÁLCULOS YA HECHOS"), false);
  assert.equal(construirPrompt({}, campos, [], "T.").includes("CÁLCULOS YA HECHOS"), false);
});

test("estructura: reglas comunes primero, después datos, cálculos y tarea, y el cierre común al final", () => {
  const prompt = construirPrompt(perfil, campos, [{ etiqueta: "Total", texto: "$10.00" }], "Haz la tarea.", { usaPerfil: ["nombre"] });
  const orden = ["Sigue estas reglas", "DATOS DE MI NEGOCIO", "DATOS DE ESTA TAREA", "CÁLCULOS YA HECHOS", "TAREA\nHaz la tarea."].map((s) => prompt.indexOf(s));
  assert.ok(orden.every((n) => n >= 0), "aparecen todas las secciones");
  assert.deepEqual([...orden].sort((a, b) => a - b), orden, "en este orden");
  assert.ok(prompt.endsWith(CIERRE_COMUN));
  REGLAS_COMUNES.forEach((regla, i) => assert.ok(prompt.includes(`${i + 1}. ${regla}`)));
});

test("las reglas comunes contienen el método: solo datos dados, preguntar, [FALTA], suposiciones, no recalcular y autorrevisión", () => {
  const todo = [...REGLAS_COMUNES, CIERRE_COMUN].join(" ");
  for (const parte of ["solo los datos", "pregúntamelo antes de escribir", "[FALTA", "Suposición", "no recalcules", "Autorrevisión", "verificar"]) {
    assert.ok(todo.includes(parte), `falta «${parte}»`);
  }
});

test("un valor de varias líneas se presenta bajo su etiqueta", () => {
  const prompt = construirPrompt({}, [{ id: "c", label: "Reseñas", valor: "Muy rico\nLento el servicio", requerido: true }], null, "Analiza.");
  assert.match(prompt, /- Reseñas:\nMuy rico\nLento el servicio/);
});

test("sin ningún dato, el prompt sigue siendo válido (solo reglas, tarea y cierre)", () => {
  const prompt = construirPrompt({}, [], null, "Tarea sin datos.");
  assert.equal(prompt.includes("DATOS DE"), false);
  assert.ok(prompt.includes("TAREA\nTarea sin datos."));
});

test("variables: {{nombre}} de la tarea se sustituye por lo que la página calculó, y manda sobre un campo del mismo id", () => {
  const campos = [{ id: "otro", label: "Otro", valor: "x", requerido: true }];
  const tarea = "La página contó {{palabras}} palabras. Dato: {{otro}}.";
  assert.ok(construirPrompt({}, campos, null, tarea, { variables: { palabras: "39" } }).includes("La página contó 39 palabras. Dato: x."));
  assert.ok(rellenarTarea("{{palabras}}", [{ id: "palabras", label: "Palabras", valor: "campo" }], { palabras: "7" }) === "7");
  // Sin variable ni campo, sigue marcándose [FALTA] (nunca llaves sueltas).
  assert.equal(rellenarTarea("{{palabras}}", []), "[FALTA]");
});
