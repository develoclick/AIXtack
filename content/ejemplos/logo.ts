import { datosVaciosLogo, type DatosLogo } from "@/lib/logo/tipos";

export interface EjemploLogo {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosLogo;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente. */
  respuesta: string;
}

/**
 * Tres ejemplos. TODO es ficticio: empresas, conceptos, paletas y prompts están inventados solo para ilustrar la herramienta.
 * Ninguna paleta ni tipografía es una recomendación de marca real; los prompts de imagen no fueron probados en ningún
 * generador. El contraste de cada color se calculó con lib/logo/paleta.ts (no a mano).
 */
function datos(p: Partial<DatosLogo>): DatosLogo {
  return { ...datosVaciosLogo(), ...p };
}

interface FilaConcepto {
  concepto: string;
  idea: string;
  tipo: string;
  composicion: string;
  justificacion: string;
}
interface FilaColor {
  nombre: string;
  hex: string;
  rgb: string;
  uso: string;
}
interface FilaTipografia {
  nombre: string;
  alternativa: string;
  uso: string;
  licencia: string;
}
interface FilaPrompt {
  variante: string;
  en: string;
  es: string;
}

const campo = (t: string) => (/[",]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
const csv = (cabecera: string, filas: string[][]) => [cabecera, ...filas.map((f) => f.map(campo).join(","))].join("\n");
const lista = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");

interface Partes {
  acceso?: never;
  brief: string[];
  conceptos: FilaConcepto[];
  paleta: FilaColor[];
  tipografias: FilaTipografia[];
  detalles: string[];
  variantes: string[];
  prompts: FilaPrompt[];
  aplicaciones: string[];
  revision: string[];
  verificar: string[];
  siguiente: string[];
}

function armar(p: Partes): string {
  return `## Brief
${lista(p.brief)}

## Conceptos
\`\`\`csv
${csv(
  "concepto,idea,tipo,composicion,justificacion",
  p.conceptos.map((c) => [c.concepto, c.idea, c.tipo, c.composicion, c.justificacion]),
)}
\`\`\`

## Especificaciones
\`\`\`csv
${csv(
  "color,hex,rgb,uso",
  p.paleta.map((c) => [c.nombre, c.hex, c.rgb, c.uso]),
)}
\`\`\`
\`\`\`csv
${csv(
  "tipografia,alternativa_google_fonts,uso,licencia",
  p.tipografias.map((t) => [t.nombre, t.alternativa, t.uso, t.licencia]),
)}
\`\`\`
${lista(p.detalles)}

## Variantes
${lista(p.variantes)}

## Prompts de imagen
${p.prompts.map((v) => `### ${v.variante}\nEN: ${v.en}\nES: ${v.es}`).join("\n")}

## Aplicaciones
${lista(p.aplicaciones)}

## Revisión y riesgos
${lista(p.revision)}

## Qué debes verificar
${lista(p.verificar)}

## Siguiente paso
${lista(p.siguiente)}`;
}

const VARIANTES_ESTANDAR = ["Principal", "Horizontal", "Compacta", "Isotipo", "Monocromo", "Negativo", "Favicon", "Avatar"];
/** Genera los 8 prompts de una tanda a partir de una descripción base del símbolo, en inglés y español. */
function promptsEstandar(simboloEn: string, simboloEs: string, paletaEn: string, paletaEs: string): FilaPrompt[] {
  const base: Record<string, [string, string]> = {
    Principal: [`flat vector logo, ${simboloEn} with the brand name below, ${paletaEn}, plain background, no shadows, no mockup, no extra text`, `logo vectorial plano, ${simboloEs} con el nombre de la marca debajo, ${paletaEs}, fondo liso, sin sombras, sin mockup, sin texto adicional`],
    Horizontal: [`flat vector logo, horizontal layout, ${simboloEn} beside the brand name, ${paletaEn}, plain background, no text`, `logo vectorial plano, disposición horizontal, ${simboloEs} junto al nombre, ${paletaEs}, fondo liso, sin texto`],
    Compacta: [`flat vector icon, compact vertical mark, ${simboloEn} only, plain background, no text`, `icono vectorial plano, marca vertical compacta, solo ${simboloEs}, fondo liso, sin texto`],
    Isotipo: [`flat vector icon, ${simboloEn} only, no text, plain background`, `icono vectorial plano, solo ${simboloEs}, sin texto, fondo liso`],
    Monocromo: [`flat vector icon, single color version, ${simboloEn}, plain background, no text`, `icono vectorial plano, versión de un solo color, ${simboloEs}, fondo liso, sin texto`],
    Negativo: [`flat vector icon, light color version for dark background, ${simboloEn}, no text`, `icono vectorial plano, versión clara para fondo oscuro, ${simboloEs}, sin texto`],
    Favicon: [`flat vector icon, simplified ${simboloEn}, square canvas, plain background, no text`, `icono vectorial plano, ${simboloEs} simplificado, lienzo cuadrado, fondo liso, sin texto`],
    Avatar: [`flat vector icon, circular composition, ${simboloEn} centered, plain background, no text`, `icono vectorial plano, composición circular, ${simboloEs} centrado, fondo liso, sin texto`],
  };
  return VARIANTES_ESTANDAR.map((variante) => ({ variante, en: base[variante][0], es: base[variante][1] }));
}

/* ─────────────── Masa Madre Rímac: panadería artesanal (el ejemplo de la especificación) ─────────────── */

const DATOS_PANADERIA: DatosLogo = datos({
  nombreEmpresa: "Masa Madre Rímac",
  eslogan: "Pan de verdad, todos los días",
  rubro: "panadería artesanal",
  oferta: "pan de masa madre, bollería y café",
  publico: "adultos de 25 a 45 años del Rímac y alrededores que valoran lo artesanal",
  personalidad: { clasicoModerno: 30, serioCercano: 80, lujoAccesible: 75 },
  adjetivos: "cálida, artesanal, honesta",
  coloresPreferidos: "tonos tierra, como el pan recién horneado",
  coloresEvitar: "colores fríos o muy corporativos",
  referencias: "panaderías europeas con vitrinas de madera, sin copiar ningún logo existente",
  estilo: "artesanal",
  simbolos: "espiga de trigo, horno de barro",
  usos: ["redes", "fachada", "empaque", "impresion"],
  competencia: "panaderías industriales de la zona que usan trigo genérico en su imagen",
  generador: "un generador de imágenes por IA de uso general",
});

const RESPUESTA_PANADERIA = armar({
  brief: ["Posicionamiento: la panadería de barrio con oficio real, para quien busca pan de verdad, no de fábrica.", "El logo debe comunicar calidez artesanal y un proceso lento y cuidado.", "Debe evitar el cliché del trigo genérico repetido en cualquier panadería de la zona."],
  conceptos: [
    { concepto: "Espiga-M", idea: "una espiga de trigo que forma la letra M", tipo: "imagotipo", composicion: "símbolo sobre el nombre, centrado", justificacion: "conecta el oficio del pan con la inicial de Masa Madre, sin ser un trigo genérico" },
    { concepto: "Horno redondo", idea: "un círculo que evoca la boca de un horno de barro", tipo: "isotipo", composicion: "símbolo solo, usable sin el nombre", justificacion: "referencia directa a la cocción artesanal, distinta a la espiga que usa la competencia" },
    { concepto: "Tipografía manuscrita", idea: "el nombre escrito a mano, sin símbolo adicional", tipo: "logotipo", composicion: "solo texto, con trazo cálido", justificacion: "transmite calidez humana sin depender de un ícono" },
  ],
  paleta: [
    { nombre: "Trigo", hex: "#D9A441", rgb: "217,164,65", uso: "fondo principal y acentos" },
    { nombre: "Marrón horno", hex: "#5B3A29", rgb: "91,58,41", uso: "texto y símbolo" },
    { nombre: "Crema", hex: "#F6EFE3", rgb: "246,239,227", uso: "fondos claros" },
  ],
  tipografias: [
    { nombre: "Serif cálida (recomendada)", alternativa: "Fraunces", uso: "nombre de marca", licencia: "gratuita para uso comercial (SIL Open Font License)" },
    { nombre: "Sans neutra (apoyo)", alternativa: "Inter", uso: "textos secundarios, empaque", licencia: "gratuita para uso comercial (SIL Open Font License)" },
  ],
  detalles: ["Proporción: símbolo y texto en relación 1:2 en la versión principal.", "Área de seguridad: deja alrededor del logo un espacio igual a la altura de la M.", "Tamaño mínimo legible: 24 px de alto para la versión con texto; 16 px para el isotipo solo."],
  variantes: ["Principal: símbolo y nombre juntos, a color, para el toldo y las bolsas grandes.", "Horizontal: símbolo a la izquierda del nombre, para el encabezado de redes.", "Monocromo: todo en marrón horno, para impresión de un solo color en bolsas de papel.", "Negativo: versión en crema, para fondos oscuros o fotografías."],
  prompts: promptsEstandar("a wheat spike forming the letter M", "una espiga de trigo que forma la letra M", "warm bakery palette (mustard yellow, roasted brown, cream)", "paleta cálida de panadería (amarillo mostaza, marrón tostado, crema)"),
  aplicaciones: ["Tarjeta de presentación: variante principal sobre crema.", "Fachada: variante monocromo en marrón horno, para lectura a distancia.", "Empaque (bolsas de pan): isotipo solo, repetido como patrón.", "Redes sociales: avatar circular con el isotipo."],
  revision: ["Verifica que la espiga-M no se parezca a la de otra panadería de la zona con un símbolo similar.", "El isotipo se lee bien en pequeño; la versión con nombre completo, revisa que el texto no se deforme al generarlo.", "Vectoriza el resultado final antes de imprimirlo en el toldo o en volúmenes grandes."],
  verificar: ["Confirma que la tipografía Fraunces esté disponible en tu editor de diseño o en Google Fonts.", "Revisa en INDECOPI si el nombre «Masa Madre Rímac» ya está registrado como marca antes de imprimir en grande."],
  siguiente: ["Genera la variante principal con el prompt de arriba y pruébala en el laboratorio del logo, en tamaño pequeño y sobre fondo oscuro."],
});

/* ─────────────── Nimbus Data: software B2B (estilo tecnológico) ─────────────── */

const DATOS_TECH: DatosLogo = datos({
  nombreEmpresa: "Nimbus Data",
  eslogan: "Tus datos, siempre claros",
  rubro: "software de análisis de datos para pequeñas empresas",
  oferta: "un panel que ordena las ventas y el inventario en un solo lugar",
  publico: "dueños de pequeñas empresas sin equipo de datos propio",
  personalidad: { clasicoModerno: 85, serioCercano: 55, lujoAccesible: 60 },
  adjetivos: "clara, confiable, ágil",
  coloresPreferidos: "azules y un acento vivo",
  coloresEvitar: "colores oscuros que parezcan una empresa de ciberseguridad",
  referencias: "paneles de control limpios, con mucho espacio en blanco",
  estilo: "tecnologico",
  simbolos: "nube, gráfico ascendente",
  usos: ["web", "redes"],
  competencia: "herramientas de datos que se ven complicadas y saturadas de íconos",
  generador: "un generador de imágenes por IA de uso general",
});

const RESPUESTA_TECH = armar({
  brief: ["Posicionamiento: el panel de datos que un dueño de negocio entiende sin capacitación.", "El logo debe comunicar claridad y movimiento (los datos ordenándose), no complejidad técnica.", "Debe evitar el cliché del candado o el escudo, que se asocia a seguridad, no a claridad de datos."],
  conceptos: [
    { concepto: "Nube ascendente", idea: "una nube cuyo contorno inferior se convierte en una línea de gráfico ascendente", tipo: "isotipo", composicion: "símbolo solo, geometría simple", justificacion: "une el nombre (Nimbus = nube) con la promesa de orden y crecimiento" },
    { concepto: "N de capas", idea: "la letra N construida con 3 barras de distinto largo, como un gráfico de barras", tipo: "logotipo", composicion: "letra sola, sin símbolo adicional", justificacion: "funciona como monograma y como referencia directa a los datos, sin ser un ícono genérico" },
    { concepto: "Punto conector", idea: "un punto que se conecta con 3 líneas cortas a modo de nodo de red", tipo: "imagotipo", composicion: "símbolo a la izquierda del nombre", justificacion: "sugiere que la herramienta conecta datos dispersos en un solo lugar" },
  ],
  paleta: [
    { nombre: "Azul Nimbus", hex: "#2453B0", rgb: "36,83,176", uso: "color principal" },
    { nombre: "Cian acento", hex: "#3FD1C7", rgb: "63,209,199", uso: "acentos y estados activos" },
    { nombre: "Gris pizarra", hex: "#1F2733", rgb: "31,39,51", uso: "texto sobre fondos claros" },
  ],
  tipografias: [
    { nombre: "Sans geométrica (recomendada)", alternativa: "Manrope", uso: "nombre de marca y títulos", licencia: "gratuita para uso comercial (SIL Open Font License)" },
    { nombre: "Sans de texto (apoyo)", alternativa: "Inter", uso: "textos largos en la interfaz", licencia: "gratuita para uso comercial (SIL Open Font License)" },
  ],
  detalles: ["Proporción: símbolo y texto en relación 1:3 en la versión horizontal.", "Área de seguridad: la mitad del alto del símbolo, libre alrededor del logo.", "Tamaño mínimo legible: 20 px de alto con nombre completo; 16 px el isotipo solo."],
  variantes: ["Principal: símbolo sobre el nombre, para la pantalla de bienvenida.", "Horizontal: símbolo a la izquierda del nombre, para el encabezado de la web.", "Monocromo: en gris pizarra, para documentos impresos en blanco y negro.", "Favicon: solo el isotipo, simplificado a sus formas básicas."],
  prompts: promptsEstandar("a cloud shape flowing into an ascending line chart", "una nube cuyo contorno se convierte en una línea de gráfico ascendente", "blue and cyan tech palette on white background", "paleta tecnológica azul y cian sobre fondo blanco"),
  aplicaciones: ["Favicon del sitio web: isotipo simplificado.", "Avatar de redes sociales: isotipo dentro de un círculo azul.", "Encabezado de la aplicación: variante horizontal.", "Documentos y contratos: variante monocromo."],
  revision: ["Verifica que el isotipo de nube no se confunda con el de otro servicio en la nube (cloud computing).", "El gráfico ascendente dentro del símbolo debe seguir siendo legible a 16 px: pruébalo en el laboratorio del logo.", "Vectoriza el resultado antes de usarlo en un manual de marca o en merchandising."],
  verificar: ["Confirma que la tipografía Manrope esté disponible en tu editor o cárgala desde Google Fonts.", "Revisa que el nombre «Nimbus Data» no esté en uso por otra empresa de software en tu mercado."],
  siguiente: ["Genera el isotipo con el prompt de arriba y pruébalo como favicon antes de aplicarlo al resto de la identidad."],
});

/* ─────────────── Aria Boutique: moda (estilo elegante) ─────────────── */

const DATOS_BOUTIQUE: DatosLogo = datos({
  nombreEmpresa: "Aria Boutique",
  eslogan: "",
  rubro: "boutique de ropa femenina",
  oferta: "vestidos y accesorios de diseño propio, producción pequeña",
  publico: "mujeres de 25 a 40 años que buscan piezas distintas a las de las cadenas grandes",
  personalidad: { clasicoModerno: 60, serioCercano: 40, lujoAccesible: 30 },
  adjetivos: "elegante, femenina, atemporal",
  coloresPreferidos: "tonos neutros y un dorado suave",
  coloresEvitar: "colores muy saturados o infantiles",
  referencias: "boutiques con una sola letra o monograma como símbolo",
  estilo: "elegante",
  simbolos: "una letra A estilizada",
  usos: ["redes", "empaque", "impresion"],
  competencia: "cadenas de ropa con logos muy cargados de texto",
  generador: "un generador de imágenes por IA de uso general",
});

const RESPUESTA_BOUTIQUE = armar({
  brief: ["Posicionamiento: piezas de diseño propio para quien no quiere verse igual que todas.", "El logo debe comunicar elegancia atemporal, sin depender de una tendencia pasajera.", "Debe evitar el cliché de la percha o el maniquí, muy repetido en tiendas de ropa."],
  conceptos: [
    { concepto: "Monograma A", idea: "una letra A estilizada, con un trazo fino que se abre como una falda", tipo: "logotipo", composicion: "letra sola, centrada", justificacion: "es memorable, funciona como sello en etiquetas pequeñas y no depende de un símbolo aparte" },
    { concepto: "Arco dorado", idea: "un arco delgado sobre el nombre, como un acento sin ser una corona", tipo: "imagotipo", composicion: "símbolo pequeño sobre el nombre", justificacion: "aporta un detalle distintivo sin sobrecargar el logo de elementos" },
    { concepto: "Solo tipografía", idea: "el nombre completo en una serif fina, con buen espaciado entre letras", tipo: "logotipo", composicion: "solo texto, sin símbolo", justificacion: "apuesta todo a una tipografía elegante, la opción más atemporal de las tres" },
  ],
  paleta: [
    { nombre: "Arena", hex: "#E7DFD3", rgb: "231,223,211", uso: "fondo principal" },
    { nombre: "Carbón suave", hex: "#2B2622", rgb: "43,38,34", uso: "texto y símbolo" },
    { nombre: "Dorado apagado", hex: "#B99A5B", rgb: "185,154,91", uso: "acentos y detalles" },
  ],
  tipografias: [
    { nombre: "Serif fina (recomendada)", alternativa: "Cormorant", uso: "nombre de marca", licencia: "gratuita para uso comercial (SIL Open Font License)" },
    { nombre: "Sans ligera (apoyo)", alternativa: "Jost", uso: "eslogan y textos secundarios", licencia: "gratuita para uso comercial (SIL Open Font License)" },
  ],
  detalles: ["Proporción: la letra A ocupa aproximadamente el mismo ancho que el nombre completo en la versión principal.", "Área de seguridad: un cuarto de la altura del símbolo, libre alrededor del logo.", "Tamaño mínimo legible: 18 px de alto para el monograma solo."],
  variantes: ["Principal: monograma sobre el nombre completo, para la bolsa de compras.", "Compacta: solo el monograma, para la etiqueta de las prendas.", "Monocromo: en carbón suave, para impresión de un solo color.", "Negativo: en arena, para fondos oscuros en redes."],
  prompts: promptsEstandar("a stylized letter A logo mark", "una letra A estilizada como marca", "neutral sand and soft gold palette", "paleta neutra en arena y dorado suave"),
  aplicaciones: ["Etiqueta de prenda: variante compacta (solo el monograma).", "Bolsa de compras: variante principal.", "Redes sociales: avatar circular con el monograma.", "Empaque de regalo: monocromo en carbón suave."],
  revision: ["Verifica que el monograma A no se parezca al de otra marca de moda que ya uses como referencia mental.", "El trazo fino de la serif puede perderse en tamaños muy pequeños: pruébalo a 16 px antes de imprimir etiquetas.", "Vectoriza el resultado antes de bordarlo o grabarlo en accesorios."],
  verificar: ["Confirma que la tipografía Cormorant esté disponible en tu editor o cárgala desde Google Fonts.", "Revisa en INDECOPI si el nombre «Aria Boutique» ya está registrado como marca en tu rubro."],
  siguiente: ["Genera la variante compacta con el prompt de arriba y pruébala en el tamaño real de una etiqueta de prenda."],
});

export const EJEMPLOS_LOGO: EjemploLogo[] = [
  { id: "panaderia", etiqueta: "Masa Madre Rímac (panadería artesanal)", descripcion: "El ejemplo de la especificación: personalidad cercana y artesanal, con dos símbolos y un logotipo puro entre los que elegir.", datos: DATOS_PANADERIA, respuesta: RESPUESTA_PANADERIA },
  { id: "tech", etiqueta: "Nimbus Data (software B2B)", descripcion: "Estilo tecnológico, personalidad moderna, paleta azul y cian.", datos: DATOS_TECH, respuesta: RESPUESTA_TECH },
  { id: "boutique", etiqueta: "Aria Boutique (moda)", descripcion: "Estilo elegante, un monograma como símbolo, paleta neutra con acento dorado.", datos: DATOS_BOUTIQUE, respuesta: RESPUESTA_BOUTIQUE },
];
