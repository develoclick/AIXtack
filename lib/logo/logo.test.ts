import assert from "node:assert/strict";
import { test } from "node:test";
import { comprobarPaleta, contraste, normalizarHex } from "./paleta";
import { leerRespuestaLogo } from "./lector";
import { construirPromptLogo, datosMinimosLogo, progresoLogo, textoDePersonalidad } from "./prompt";
import { datosVaciosLogo, type ColorPaleta, type DatosLogo } from "./tipos";
import { revisarLogo } from "./verificar";

function datosDeEjemplo(): DatosLogo {
  return {
    ...datosVaciosLogo(),
    nombreEmpresa: "Masa Madre Rímac",
    eslogan: "Pan de verdad, todos los días",
    rubro: "panadería artesanal",
    oferta: "pan de masa madre, bollería y café",
    publico: "adultos de 25 a 45 años que valoran lo artesanal",
    personalidad: { clasicoModerno: 30, serioCercano: 80, lujoAccesible: 70 },
    adjetivos: "cálida, artesanal, honesta",
    coloresPreferidos: "tonos tierra",
    coloresEvitar: "colores fríos",
    estilo: "artesanal",
    usos: ["redes", "fachada", "empaque"],
  };
}

test("textoDePersonalidad describe hacia qué extremo se inclina cada deslizador", () => {
  const t = textoDePersonalidad({ clasicoModerno: 50, serioCercano: 80, lujoAccesible: 20 });
  assert.equal(t, "Clásico↔Moderno: Clásico/Moderno equilibrado; Serio↔Cercano: Cercano (80/100); Lujo↔Accesible: Lujo (20/100)");
});

test("datosMinimosLogo y progresoLogo exigen empresa, rubro, oferta, público y al menos un uso", () => {
  assert.equal(datosMinimosLogo(datosDeEjemplo()), true);
  assert.equal(datosMinimosLogo(datosVaciosLogo()), false);
  const p = progresoLogo(datosDeEjemplo());
  assert.equal(p.porcentaje, 100);
  assert.deepEqual(p.faltan, []);
});

test("construirPromptLogo incluye los 9 títulos exactos y los datos del negocio", () => {
  const prompt = construirPromptLogo(datosDeEjemplo());
  for (const t of ["## Brief", "## Conceptos", "## Especificaciones", "## Variantes", "## Prompts de imagen", "## Aplicaciones", "## Revisión y riesgos", "## Qué debes verificar", "## Siguiente paso"]) {
    assert.ok(prompt.includes(t), `falta ${t}`);
  }
  assert.ok(prompt.includes("Masa Madre Rímac"));
  assert.ok(prompt.includes("exactamente 3 conceptos"));
  assert.ok(prompt.includes("8 variantes"));
});

test("normalizarHex acepta 3 y 6 dígitos, y rechaza lo inválido", () => {
  assert.equal(normalizarHex("#D9A441"), "#d9a441");
  assert.equal(normalizarHex("fff"), "#ffffff");
  assert.equal(normalizarHex("no es un color"), null);
});

test("contraste: blanco sobre negro es 21:1, y un color contra sí mismo es 1:1", () => {
  assert.equal(Math.round(contraste("#ffffff", "#000000")), 21);
  assert.equal(contraste("#d9a441", "#d9a441"), 1);
});

test("comprobarPaleta marca qué colores cumplen AA y qué texto (negro o blanco) les queda mejor", () => {
  const colores: ColorPaleta[] = [
    { nombre: "Trigo", hex: "#D9A441", rgb: "217,164,65", uso: "fondo principal" },
    { nombre: "Marrón horno", hex: "#5B3A29", rgb: "91,58,41", uso: "texto y detalles" },
    { nombre: "Color inválido", hex: "no-es-hex", rgb: "", uso: "" },
  ];
  const r = comprobarPaleta(colores);
  assert.equal(r[0].textoRecomendado, "negro");
  assert.equal(r[1].cumpleAA, true);
  assert.equal(r[1].textoRecomendado, "blanco");
  assert.equal(r[2].hexValido, null);
  assert.equal(r[2].cumpleAA, false);
});

const RESPUESTA_EJEMPLO = `## Brief
- Posicionamiento: panadería de barrio con oficio real, para quien quiere pan de verdad, no de fábrica.
- El logo debe comunicar calidez artesanal y evitar el cliché del trigo genérico repetido en cualquier panadería.

## Conceptos
\`\`\`csv
concepto,idea,tipo,composicion,justificacion
Espiga-M,una espiga que forma la letra M,imagotipo,símbolo sobre el nombre,conecta el oficio del pan con la inicial de Masa Madre
Horno redondo,un círculo que evoca la boca de un horno de barro,isotipo,símbolo solo,referencia directa a la cocción artesanal
Tipografía manuscrita,el nombre escrito a mano sin símbolo,logotipo,solo texto,transmite calidez humana sin un ícono adicional
\`\`\`

## Especificaciones
\`\`\`csv
color,hex,rgb,uso
Trigo,#D9A441,"217,164,65",fondo principal
Marrón horno,#5B3A29,"91,58,41",texto y símbolo
Crema,#F6EFE3,"246,239,227",fondos claros
\`\`\`
\`\`\`csv
tipografia,alternativa_google_fonts,uso,licencia
Serif cálida,Fraunces,nombre de marca,verificar licencia comercial
Sans neutra,Inter,textos secundarios,gratuita para uso comercial
\`\`\`
- Proporción: símbolo y texto en relación 1:2.
- Área de seguridad: la altura de la M libre alrededor del logo.
- Tamaño mínimo legible: 24 px de alto.

## Variantes
- Principal: símbolo y nombre juntos, a color.
- Monocromo: todo en marrón horno, para impresión de un solo color.

## Prompts de imagen
### Principal
EN: flat vector logo icon, a wheat spike forming the letter M, warm bakery palette, plain background, no text, no mockup, no shadows
ES: icono de logo vectorial plano, una espiga que forma la letra M, paleta cálida de panadería, fondo liso, sin texto, sin mockup, sin sombras
### Horizontal
EN: flat vector logo icon, horizontal layout, wheat spike symbol only, warm bakery palette, plain background, no text
ES: icono de logo vectorial plano, disposición horizontal, solo el símbolo de la espiga, paleta cálida, fondo liso, sin texto
### Compacta
EN: flat vector logo icon, compact vertical mark, wheat spike, plain background, no text
ES: icono vectorial plano, marca vertical compacta, espiga, fondo liso, sin texto
### Isotipo
EN: flat vector icon, wheat spike forming an M, plain background, no text
ES: icono vectorial plano, espiga que forma una M, fondo liso, sin texto
### Monocromo
EN: flat vector icon, single color brown, wheat spike, plain background, no text
ES: icono vectorial plano, un solo color marrón, espiga, fondo liso, sin texto
### Negativo
EN: flat vector icon, cream color on dark background, wheat spike, no text
ES: icono vectorial plano, color crema sobre fondo oscuro, espiga, sin texto
### Favicon
EN: flat vector icon, simplified wheat spike, square canvas, plain background, no text
ES: icono vectorial plano, espiga simplificada, lienzo cuadrado, fondo liso, sin texto
### Avatar
EN: flat vector icon, circular composition, wheat spike centered, plain background, no text
ES: icono vectorial plano, composición circular, espiga centrada, fondo liso, sin texto

## Aplicaciones
- Tarjeta: variante principal.
- Fachada: variante monocromo, para lectura a distancia.

## Revisión y riesgos
- Verifica que la espiga no se parezca a la de otras panaderías con el mismo símbolo.
- Vectoriza el resultado antes de imprimir en un tamaño grande.

## Qué debes verificar
- Confirma que la tipografía Fraunces esté disponible en tu editor.

## Siguiente paso
- Genera la variante principal con el prompt de arriba y pruébala en el laboratorio del logo.`;

test("leerRespuestaLogo lee una respuesta completa con los 9 títulos, 3 conceptos, paleta, tipografías y 8 prompts", () => {
  const l = leerRespuestaLogo(RESPUESTA_EJEMPLO);
  assert.equal(l.valido, true);
  assert.equal(l.conceptos.length, 3);
  assert.equal(l.conceptos[0].nombre, "Espiga-M");
  assert.equal(l.conceptos[0].tipo, "imagotipo");
  assert.equal(l.paleta.length, 3);
  assert.equal(l.paleta[0].hex, "#D9A441");
  assert.equal(l.tipografias.length, 2);
  assert.equal(l.tipografias[0].alternativaGoogleFonts, "Fraunces");
  assert.equal(l.detallesEspecificaciones.length, 3);
  assert.equal(l.prompts.length, 8);
  assert.equal(l.prompts[0].variante, "Principal");
  assert.ok(l.prompts[0].en.startsWith("flat vector logo icon"));
  assert.ok(l.prompts[0].es.startsWith("icono de logo vectorial plano"));
  assert.equal(l.advertencias.length, 0);
});

test("leerRespuestaLogo sin ningún título reconocido no es válida", () => {
  const l = leerRespuestaLogo("Esto no tiene títulos.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

test("revisarLogo detecta colores sin buen contraste y tipografías con licencia por verificar", () => {
  const l = leerRespuestaLogo(RESPUESTA_EJEMPLO);
  const r = revisarLogo(l);
  assert.equal(r.tipografiasSinLicenciaVerificada.length, 1);
  assert.equal(r.tipografiasSinLicenciaVerificada[0].nombre, "Serif cálida");
  assert.equal(r.avisos.length, 1);
});
