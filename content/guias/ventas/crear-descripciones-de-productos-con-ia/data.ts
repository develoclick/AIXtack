import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * ventas/crear-descripciones-de-productos-con-ia
 *
 * Tipo: comunicación + tema sensible (las promesas de seguridad, salud y rendimiento son el riesgo central).
 * Todo el caso (el taller Luz de Cera, su vela, sus medidas y sus datos pendientes) es FICTICIO. Las respuestas
 * de la IA son EJEMPLOS GENERADOS: están redactadas aplicando literalmente cada prompt a la ficha del caso; no
 * proceden de una conversación real ni de una prueba del autor. Los datos de Google y Merchant Center proceden
 * de `sources` y caducan (consultados el 18 de septiembre de 2026). Las pruebas reales viven en
 * `evidence.pruebas`, que solo rellena el autor.
 *
 * Fuente única de verdad: los campos de la ficha (CAMPOS), la ficha del caso (FICHA), los textos del ejemplo
 * (S, CORTA_*, LARGA_*), los problemas del primer resultado (PROBLEMAS), los criterios (CRITERIOS), los umbrales
 * (RESULTADOS), los puntajes (PUNTAJES) y los límites del canal se definen UNA vez; las tablas, la rúbrica, el
 * análisis y los prompts los leen. Todos los conteos de palabras y de caracteres se calculan en este archivo.
 */
const slot = guideSlots("ventas", "crear-descripciones-de-productos-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const palabras = (s: string) => (s.match(/[\p{L}\p{N}]+/gu) || []).length;

const ESTADO = { ok: "Verificado", falta: "Sin confirmar" } as const;

/** Campos que la ficha debe cubrir (el prompt de ficha los lista tal cual). */
const CAMPOS = [
  { campo: "Producto y variante", pide: "Nombre exacto y en qué se diferencia de sus variantes." },
  { campo: "Materiales", pide: "Cada material o componente, por separado." },
  { campo: "Características propias", pide: "Lo que lo distingue: aroma, sabor, color o ajuste." },
  { campo: "Medidas, peso y contenido", pide: "Tomados por ti o de la ficha oficial." },
  { campo: "Elaboración u origen", pide: "Cómo y dónde se hace, solo si es cierto." },
  { campo: "Uso y cuidados", pide: "Instrucciones de quien lo fabrica." },
  { campo: "Duración o rendimiento", pide: "Solo si se midió; si no, sin confirmar." },
  { campo: "Seguridad, salud y certificaciones", pide: "Solo con un certificado o una validación profesional; si no, sin confirmar." },
] as const;

/** La ficha del caso: una fila por dato, con su estado y su origen. */
const FICHA: [campo: string, dato: string, estado: string, origen: string][] = [
  ["Producto y variante", "Vela Cedro y Vainilla, 200 g", ESTADO.ok, "Etiqueta del envase"],
  ["Materiales", "Cera de soja", ESTADO.ok, "Etiqueta del proveedor"],
  ["Materiales", "Porcentaje de soja de la cera", ESTADO.falta, "Pedir la ficha escrita al proveedor"],
  ["Materiales", "Mecha de algodón", ESTADO.ok, "Etiqueta del proveedor"],
  ["Materiales", "Vaso de vidrio con tapa de madera", ESTADO.ok, "El propio taller"],
  ["Características propias", "Aroma con notas de cedro y vainilla", ESTADO.ok, "Ficha de la fragancia"],
  ["Medidas, peso y contenido", "200 g netos · 9 cm de alto · 8 cm de diámetro", ESTADO.ok, "Medido en el taller"],
  ["Elaboración u origen", "Hecha a mano en lotes pequeños", ESTADO.ok, "Proceso real del taller"],
  ["Uso y cuidados", "Primer uso: unas 3 horas · Recortar la mecha a 5 mm · No dejar sin vigilancia", ESTADO.ok, "Instrucciones del taller"],
  ["Duración o rendimiento", "—", ESTADO.falta, "Nunca se midió"],
  ["Seguridad, salud y certificaciones", "—", ESTADO.falta, "Sin pruebas ni certificados"],
];

const PREGUNTAS = "¿Cuánto mide? · ¿Cuánto dura? · ¿Cómo se cuida?";
const LARGO_PEDIDO = 40;
const LONGITUD = `unas ${LARGO_PEDIDO} palabras`;
const CANAL = "Ficha de producto de la tienda online";

/* frases del ejemplo: cada una se define una sola vez y los textos se componen con ellas */
const S = {
  titulo: "Vela Cedro y Vainilla, 200 g.",
  cera: "Cera de soja con aroma a cedro y vainilla.",
  mano: "Hecha a mano en lotes pequeños, en nuestro taller.",
  manoCorta: "Hecha a mano en lotes pequeños.",
  vaso: "Vaso de vidrio con tapa de madera.",
  mecha: "Mecha de algodón.",
  peso: "Pesa 200 g netos.",
  medidas: "Mide 9 cm de alto por 8 de diámetro.",
  tardes: "Una vela para acompañarte muchas tardes y un detalle que se agradece al regalar.",
  regalar: "Un detalle para regalar.",
  cadaVez: "Enciéndela unas 3 horas cada vez y recorta la mecha a 5 mm antes de cada uso.",
  primeraVez: "La primera vez, enciéndela unas 3 horas.",
  recorta: "Antes de cada uso, recorta la mecha a 5 mm.",
  vigilancia: "No la dejes encendida sin vigilancia.",
} as const;
const unir = (...f: string[]) => f.join(" ");

const CORTA_PRIMERA = unir(S.titulo, S.cera, S.mano, S.vaso, S.mecha, S.medidas, S.tardes);
const CORTA_FINAL = unir(S.titulo, S.cera, S.manoCorta, S.vaso, S.mecha, S.medidas, S.regalar);
const LARGA_PRIMERA = unir(S.titulo, S.cera, S.mano, S.vaso, S.mecha, S.peso, S.medidas, S.cadaVez, S.vigilancia);
const LARGA_FINAL = unir(S.titulo, S.cera, S.mano, S.vaso, S.mecha, S.peso, S.medidas, S.primeraVez, S.recorta, S.vigilancia);
const N_CORTA_PRIMERA = palabras(CORTA_PRIMERA);
const N_CORTA_FINAL = palabras(CORTA_FINAL);

const USADAS = "Producto y variante, Materiales, Características propias, Medidas, peso y contenido, Elaboración u origen, Uso y cuidados";
const FALTA = "[FALTA: la duración de combustión, para responder «¿Cuánto dura?»]";

/** Lo que la auditoría encuentra en el primer resultado y lo que el ajuste corrige. */
const PROBLEMAS = [
  { frase: S.tardes, motivo: "«Muchas tardes» insinúa una duración que la ficha marca como sin confirmar.", despues: S.regalar },
  { frase: S.cadaVez, motivo: "La ficha da las 3 horas solo para el primer uso.", despues: `${S.primeraVez} ${S.recorta}` },
];
const PROBLEMAS_TEXTO =
  PROBLEMAS.map((p) => `«${p.frase}»: ${p.motivo}`).join(" ") + ` La versión corta tiene ${N_CORTA_PRIMERA} palabras y pedí ${LONGITUD}.`;

const CRITERIOS = [
  { id: "respaldo", label: "Cada hecho tiene su fila", detail: "Cada medida, material o cifra coincide con una fila verificada y conserva su alcance." },
  { id: "pendientes", label: "No insinúa lo que no se afirma", detail: "No menciona ni sugiere, ni con adjetivos, lo que la ficha marca como sin confirmar." },
  { id: "riesgo", label: "Sin promesas de seguridad ni salud", detail: "Ninguna frase promete seguridad, salud ni certificaciones sin un documento detrás." },
  { id: "dudas", label: "Responde las dudas del comprador", detail: "Contesta con datos de la ficha lo que preguntan los clientes, o lo deja anotado." },
  { id: "forma", label: "Cumple el largo y el canal", detail: "La versión corta respeta la longitud pedida y el texto, los límites del canal." },
] as const;

const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Fallan varios criterios: revisa la ficha antes de volver a pedir la descripción." },
  { min: 6, label: "Con ajustes", advice: "Sirve de base: corrige las frases señaladas, empezando por las que afirman un hecho." },
  { min: 9, label: "Lista para verificar", advice: "Cumple casi todo: pasa a tu verificación." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (total: number) => [...RESULTADOS].reverse().find((r) => total >= r.min)!.label;

const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { respaldo: 1, pendientes: 1, riesgo: 2, dudas: 2, forma: 1 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

/* canal del ejemplo de adaptación: los límites vienen de la documentación oficial (ver `sources`) */
const LIMITE_CARACTERES = "5.000";
const LIMITES_CANAL = `Máximo ${LIMITE_CARACTERES} caracteres; los datos clave, en los primeros 160 a 500; sin texto promocional, enlaces ni comparaciones`;
const CLAVE_ADAPTADA = unir(S.titulo, S.cera, "Mide 9 cm de alto por 8 cm de diámetro.", S.peso);
const ADAPTADA = unir(CLAVE_ADAPTADA, S.vaso, S.mecha, S.primeraVez, S.recorta, S.vigilancia);
const N_ADAPTADA_CARACTERES = ADAPTADA.length;
const N_CLAVE_CARACTERES = CLAVE_ADAPTADA.length;

const LISTA_CAMPOS = CAMPOS.map((c, i) => `${i + 1}. ${c.campo}: ${c.pide}`).join("\n");
const LISTA_CRITERIOS = CRITERIOS.map((c, i) => `${i + 1}. ${c.label}: ${c.detail}`).join("\n");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "crear-descripciones-de-productos-con-ia",
    category: "ventas",
    title: "Crear descripciones de productos con IA sin inventar datos",
    description:
      "Convierte los datos reales de tu producto en una descripción que informa y vende: ficha verificada, prompts explicados y una auditoría para que la IA no invente nada.",
    author: "DeveloClick",
    publishedAt: "2026-09-18",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["comunicacion-atencion", "tema-sensible"],
    estandarGuia: 3,
    activoOriginal:
      "Ficha de producto con estado y origen de cada dato, tabla de respaldo por tipo de afirmación (ambas copiables) y rúbrica de cinco criterios con dos reglas de bloqueo",
    problem: "Tienes los datos básicos de tus productos y necesitas descripciones que ayuden a vender sin inventar características.",
    whyThisPage:
      "Se centra en qué información entregar (materiales, medidas, usos, cuidados) y en cómo evitar que la IA agregue datos falsos, con una ficha verificada y una auditoría frase por frase.",
    relatedGuides: ["crear-anuncios-con-ia", "crear-promociones-con-ia", "crear-publicaciones-para-redes-sociales-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Un asistente de IA escribe rápido, pero no sabe de qué está hecho tu producto. Escribe primero una ficha con datos verificados, pide la descripción solo a partir de ella y comprueba cada frase antes de publicar.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de dos horas con el primer producto; menos con los siguientes",
    needs: ["Un asistente de IA de chat", "Los datos reales de tu producto: etiquetas, medidas, proveedor", "Una regla o una balanza para medir lo que falte"],
    result: "Una ficha verificada y dos descripciones sin datos inventados, más una versión para otro canal",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el método: una ficha de producto con estados junto a la descripción que sale solo de ella.",
      description:
        "Una hoja de cálculo dividida en dos: a la izquierda la ficha del caso ficticio (campo, dato, estado y origen) con dos filas «Sin confirmar» resaltadas y, a la derecha, la descripción corta que se obtiene de ella. Sin datos personales.",
      alt: "Hoja con la ficha de un producto y sus estados a la izquierda, y la descripción resultante a la derecha.",
      caption: "Una ficha verificada y una descripción que sale solo de ella.",
    }),
    datos: slot("datos-necesarios.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña qué se lleva a la entrevista: lo que ya se sabe, las medidas tomadas y las preguntas de los clientes.",
      description:
        "Un documento con cuatro bloques: notas de la etiqueta del proveedor, medidas anotadas con su método, las tres preguntas que más hacen los clientes y el canal con sus límites copiados. Caso ficticio, sin datos personales.",
      alt: "Documento con notas de etiqueta, medidas, preguntas de clientes y límites de un canal de venta.",
      caption: "Lo que la IA no puede saber y tú sí.",
      zoom: true,
    }),
    ficha: slot("ficha-de-producto.webp", {
      section: "entrevista",
      ratio: "4/3",
      purpose: "Muestra la ficha ya completa, con la columna de estado y las filas pendientes a la vista.",
      description:
        "La ficha del caso pegada en una hoja: once filas con las columnas Campo, Dato, Estado y De dónde sale. Resaltar en un color las dos filas «Sin confirmar». Caso ficticio.",
      alt: "Hoja con la ficha de un producto: campo, dato, estado y origen, con dos filas sin confirmar resaltadas.",
      caption: "La ficha: lo único que la IA podrá usar.",
      zoom: true,
    }),
    primerResultado: slot("borrador-inicial.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver el primer borrador y localizar las dos frases que no coinciden con la ficha.",
      description:
        "Las dos versiones que devolvió el asistente, con la frase sobre «muchas tardes» y la de «unas 3 horas cada vez» subrayadas y, al lado, la fila de la ficha que corresponde a cada una. Caso ficticio, sin datos de cuenta.",
      alt: "Descripción corta y larga de una vela con dos frases subrayadas junto a las filas de la ficha.",
      caption: "El primer borrador, con dos frases que revisar.",
      zoom: true,
    }),
    auditoria: slot("auditoria-de-frases.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña cómo se lee la auditoría: las frases con problema, su motivo y la rúbrica puntuada.",
      description:
        "La respuesta del prompt de auditoría: la tabla «Frases con problema» con sus tres filas, la rúbrica con los cinco puntajes y el total. Caso ficticio; ocultar datos de cuenta.",
      alt: "Tabla de frases con problema y rúbrica puntuada de una descripción de producto.",
      caption: "La auditoría, frase por frase.",
      zoom: true,
    }),
    final: slot("descripcion-final.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra el entregable final: las dos versiones corregidas y la tabla de cambios.",
      description:
        "La tabla «Cambios» con sus tres filas y, debajo, la versión corta y la larga finales con las frases corregidas resaltadas. Caso ficticio.",
      alt: "Tabla de cambios y versiones finales, corta y larga, de la descripción de una vela.",
      caption: "Las dos versiones finales y lo que cambió.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "ficha",
      purpose: "Prueba real del prompt de ficha: el ida y vuelta de preguntas y la tabla que devolvió.",
      description:
        "Captura de la entrevista (preguntas y respuestas) y de la tabla final con su columna Estado y la lista «Pendiente». Usa un producto tuyo o el del caso. Ocultar datos personales y de cuenta.",
      alt: "Captura de una entrevista con un asistente y de la ficha de producto que devolvió.",
      caption: "Prueba del prompt de ficha.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "redaccion",
      purpose: "Prueba real del prompt de redacción: las dos versiones, las filas usadas y «FALTA».",
      description:
        "Captura de la versión corta, la larga, «Filas de la ficha que usé» y «FALTA». Usa la ficha del caso o la tuya. Ocultar datos personales y de cuenta.",
      alt: "Captura de dos descripciones de producto devueltas por un asistente.",
      caption: "Prueba del prompt de redacción.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "auditoria",
      purpose: "Prueba real del prompt de auditoría: las frases con problema y la rúbrica puntuada.",
      description:
        "Captura de la tabla de frases con problema, del conteo de frases revisadas, de la rúbrica con sus fragmentos y de «Para comprobar tú». Anota aparte si sus marcas coinciden con las tuyas. Ocultar datos personales y de cuenta.",
      alt: "Captura de la auditoría de una descripción con tabla de problemas y rúbrica.",
      caption: "Prueba del prompt de auditoría.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y las dos versiones finales.",
      description:
        "Captura de la tabla de cambios, de la versión corta con su conteo, de la larga y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una descripción con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "canal",
      purpose: "Prueba real del prompt de canal: el texto adaptado y la comprobación contra los límites.",
      description:
        "Captura de la tabla con el texto adaptado, de «Contra los límites» y de «Para comprobar tú». Pega límites copiados de la documentación oficial del canal. Ocultar datos personales y de cuenta.",
      alt: "Captura de una descripción adaptada a un canal con su comprobación de límites.",
      caption: "Prueba del prompt de canal.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Cuando un negocio pequeño tiene veinte o cien productos, cada uno necesita su descripción. Las salidas habituales son tres: copiar el texto del proveedor, repetir «producto artesanal, ideal para regalar» o pedirle a una IA que lo escriba.\n\nLa tercera esconde el problema más serio. Un asistente de IA no conoce tu producto: conoce cómo suelen describirse productos parecidos. Si le das «vela de soja, 200 g», puede completar el hueco con lo que suena bien en cualquier vela: «libre de tóxicos», «más de 40 horas», «100 % natural». Suena profesional y nadie lo comprobó.\n\nUna frase falsa sobre materiales, duración o seguridad no es un error de estilo: es una promesa que tu negocio no puede sostener, y suele terminar en una devolución o en una reseña que resta confianza a todo el catálogo. **La ficha del producto es la única fuente de hechos: lo que no está verificado en ella no se escribe.**",
    symptoms: [
      "Tus descripciones se parecen entre sí, o son idénticas al texto del proveedor.",
      "Recibes las mismas preguntas por mensaje aunque creías haberlas respondido.",
      "Usaste IA para redactar y descubriste una característica que tu producto no tiene.",
      "No sabes cuáles de los datos que escribió la IA son verdad.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con una descripción publicable de un producto tuyo y con un procedimiento para repetirlo con el resto del catálogo.",
    deliverables: [
      { label: "Una ficha de producto verificada", detail: "Cada dato con su estado y su origen: es lo único que la IA podrá usar." },
      { label: "Una descripción corta y una larga", detail: "Con los mismos hechos, redactadas para tu público." },
      { label: "Una rúbrica de cinco criterios", detail: "Para auditar cualquier descripción antes de publicarla." },
      { label: "Una versión para otro canal", detail: "Con sus límites, sin cambiar ningún hecho." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Vendes productos físicos (artesanales, alimentos, ropa, repuestos) por tu web, un marketplace o redes.",
      "Conoces tu producto, o puedes preguntarle a quien lo fabrica, y quieres contarlo mejor sin exagerar.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Buscas publicar cientos de descripciones de golpe: este método es deliberadamente lento por producto.",
      "No tienes acceso a los datos reales de lo que vendes: el primer trabajo sería conseguirlos.",
      "Vendes algo cuya seguridad o salud exige validación profesional: aquí aprenderás a organizarte, no a validar.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Luz de Cera (ficticio) — taller de velas artesanales",
    situation:
      "Luz de Cera es un taller de dos personas que vende velas en su tienda online y en ferias. Sus descripciones son una frase de plantilla, y por mensaje le preguntan siempre lo mismo.",
    goal: "Una descripción corta y una larga de la Vela Cedro y Vainilla que respondan esas dudas y digan solo lo que el taller puede sostener.",
    data: [
      { label: "Público y canal", value: `Personas que buscan un regalo · ${CANAL.toLowerCase()}` },
      { label: "Preguntas de los clientes", value: PREGUNTAS },
      { label: "Lo que no sabe", value: "Cuántas horas dura la vela y qué porcentaje de su cera es soja" },
    ],
    problem: "Cualquier texto genérico de velas afirma justo lo que el taller no ha medido ni confirmado.",
    application: "Escribe la ficha, pide la descripción, audita cada frase, corrige lo señalado y adapta el resultado a otro canal.",
    result: "Dos versiones que no mencionan la duración ni el porcentaje de soja, anotados como pendientes.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas sostienen el método. Los datos del caso son ficticios; los de tu producto son los tuyos.",
    blocks: [
      {
        title: "Una ficha, una sola fuente",
        detail:
          "La ficha reúne cada dato con su estado (verificado o sin confirmar) y su origen. La IA solo usa lo verificado; lo demás se deja fuera y se anota como pendiente.",
        example: "En el caso, la duración de la vela nunca se midió: no puede aparecer ni insinuada.",
      },
      {
        title: "Hecho, adjetivo o promesa",
        detail:
          "Toda frase es un hecho (necesita una fila de la ficha), un adjetivo de tono (libre, si no sugiere un hecho) o una promesa de seguridad, salud o rendimiento (necesita una prueba o un certificado).",
        example: "«Cera de soja» es un hecho; «reconfortante», un adjetivo; «libre de tóxicos», una promesa.",
      },
      {
        title: "Un hueco se anota, no se rellena",
        detail: "Cuando falta un dato, lo honesto es preguntarlo. La lista de faltantes se convierte en tareas: medir, pedir al proveedor, probar.",
      },
      {
        title: "Comparar antes que recordar",
        detail:
          "Comparar dos textos que tiene delante es una tarea más acotada para la IA que recordar hechos. Aun así puede equivocarse: la auditoría se lee con la ficha al lado.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Escribe una descripción para mi vela de soja con aroma a cedro y vainilla.",
    whyInsufficient:
      "Con esa petición la IA no sabe cuánto pesa la vela, cómo se usa ni qué no debe decir. Ante los huecos, puede rellenarlos con lo más habitual en las fichas de velas (ejemplo ilustrativo: «cera 100 % natural», «más de 40 horas»). El resultado es fluido, seguro y en parte inventado, lo más difícil de detectar al leer rápido.",
    issues: [
      "No hay datos: lo que no esté en el pedido será relleno.",
      "No se distingue lo verificado de lo que no lo está.",
      "No hay una salida ante un hueco: preguntar el dato.",
      "No hay forma de saber de dónde salió cada frase.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Reúne cuatro cosas antes de la entrevista. Ninguna la puede inventar la IA.",
    items: [
      { label: "Lo que ya sabes del producto", detail: "Etiquetas, fichas del proveedor, facturas y notas. Con su origen, aunque sea «lo dijo el proveedor por chat».", required: true },
      { label: "Medidas que tomes tú", detail: "Con una regla o una balanza, y anotando cómo las tomaste.", required: true },
      { label: "Las preguntas de tus clientes", detail: "Las que llegan por mensaje o comentarios: son la mejor lista de lo que la descripción debe responder.", required: true },
      { label: "Dónde publicarás y con qué límites", detail: "El canal, el público, el tono y la longitud de la versión corta.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ficha: {
      caption: "Ficha de la Vela Cedro y Vainilla",
      purpose: "Tener cada dato con su estado y su origen, para saber qué puede usarse en la descripción y qué queda fuera.",
      columns: ["Campo", "Dato", "Estado", "De dónde sale"],
      rows: FICHA,
      copyable: true,
      note: "Ejemplo ficticio. Cambia los datos por los de tu producto: una fila por dato, y «—» si no lo sabes.",
    },
    afirmaciones: {
      caption: "Qué respaldo pide cada tipo de afirmación",
      purpose: "Decidir en pocos segundos si una frase puede publicarse, si necesita un dato de la ficha, una prueba propia o si debe quitarse.",
      columns: ["Tipo de afirmación", "Ejemplo", "Qué respaldo pide", "Si no lo tienes"],
      rows: [
        ["Medidas y peso", "«9 cm de alto» · «Talla M: 52 cm de ancho»", "Una medición propia o la ficha oficial", "Mídelo tú: no lo estimes"],
        ["Materiales y composición", "«Cera de soja» · «Algodón 95 %»", "La etiqueta o una ficha escrita del proveedor", "Di solo lo que confirma el proveedor, sin porcentajes ni «100 %»"],
        ["Ingredientes y alérgenos", "Una mermelada: higos, azúcar, jugo de limón", "Copiados tal cual de la etiqueta", "No los reformules"],
        ["Duración y rendimiento", "«Dura más de 40 horas»", "Una prueba propia, con método y fecha", "Sin cifra y sin insinuarla"],
        ["Seguridad, salud y certificaciones", "«Libre de tóxicos» · «apta para diabéticos»", "Un certificado o una validación profesional", "No la escribas y consulta a un profesional"],
        ["Superlativos y comparaciones", "«La mejor vela» · «mejor que otras marcas»", "Casi nunca hay respaldo posible", "Cámbialo por un hecho concreto"],
      ],
      copyable: true,
      note: "Ejemplos ilustrativos de varios rubros.",
    },
    adaptada: {
      caption: "Descripción adaptada a un canal",
      purpose: "Ver qué cambia (orden y largo) y qué no (los hechos) al adaptar la descripción final a un canal con límites.",
      columns: ["Canal", "Texto adaptado", "Qué cambia", "Qué no cambia"],
      rows: [
        [
          "Catálogo de Google (Merchant Center)",
          ADAPTADA,
          "Producto, material, medidas y peso pasan al inicio; se quita la frase de regalo",
          "Los hechos, las cifras y los cuidados",
        ],
      ],
      note:
        `Ejemplo generado. Contra los límites: ${N_ADAPTADA_CARACTERES} caracteres, dentro de ${LIMITE_CARACTERES}; los datos clave ocupan los primeros ${N_CLAVE_CARACTERES}; sin texto promocional, enlaces ni comparaciones. ` +
        "Para comprobar tú: si el canal exige declarar que el texto lo generó una IA (ver Fuentes).",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene con un prompt en cinco de los siete pasos. El primero y el último son solo tuyos, y son los que evitan el problema de partida.",
    steps: [
      {
        title: "Reúne lo que tienes y mide lo que falte",
        description: "Junta etiquetas, fichas del proveedor y preguntas de clientes, y mide lo que no esté escrito.",
        output: "Datos con su origen y una lista de lo que falta.",
      },
      {
        title: "Completa la ficha con la entrevista",
        description: "Deja que la IA te pregunte de una en una y marque cada dato como verificado o sin confirmar.",
        output: "Una ficha con estado y origen.",
      },
      {
        title: "Pide las dos versiones",
        description: "Entrega la ficha, tu público y tu canal, y pide una descripción corta y una larga.",
        output: "Dos versiones y una lista de lo que faltó.",
      },
      {
        title: "Audita frase por frase",
        description: "Pide que compare cada frase con la ficha y puntúe con la rúbrica.",
        output: "Frases con problema y un puntaje.",
      },
      {
        title: "Corrige solo lo señalado",
        description: "Pide cambiar únicamente las frases con problema, con palabras de la ficha.",
        output: "Las dos versiones finales.",
      },
      {
        title: "Adapta a otro canal",
        description: "Si publicas en otro lugar, pide una versión con sus límites.",
        output: "Un texto para ese canal.",
      },
      {
        title: "Verifica y publica",
        description: "Recorre tu lista, pide a otra persona que lea el texto y publica desde tu plataforma.",
        output: "Una descripción publicada.",
      },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    ficha: {
      title: "Prompt de ficha: que la IA te entreviste",
      objective: "Completar tu ficha con preguntas de una en una, marcando qué está verificado y de dónde sale cada dato.",
      whenToUse: "Cuando conoces tu producto pero nunca escribiste sus datos con su origen.",
      variables: [
        { name: "PRODUCTO", description: "Qué producto es, con su variante.", example: "Vela Cedro y Vainilla, 200 g" },
        { name: "LO_QUE_TENGO", description: "Lo que ya tienes a la mano; si nada, escribe «nada».", example: "Etiqueta del proveedor: cera de soja y mecha de algodón" },
      ],
      prompt: `Actúa como un entrevistador que ayuda a un negocio pequeño a escribir la ficha de un producto. Tu destinatario es la persona dueña, que conoce su producto pero nunca lo dejó por escrito. Tu objetivo es completar la ficha usando SOLO lo que yo te diga, marcando qué está verificado y qué no.

### CONTEXTO
Producto: {{PRODUCTO}}
Lo que ya tengo a la mano (etiquetas, fichas del proveedor, notas; puede estar vacío):
{{LO_QUE_TENGO}}

### CAMPOS A COMPLETAR (en este orden)
${LISTA_CAMPOS}

### REGLAS
1. Hazme UNA pregunta por turno y espera mi respuesta. Máximo 12 preguntas; no preguntes lo que ya está en CONTEXTO.
2. Para cada dato pregúntame de dónde sale (etiqueta, proveedor, medición mía, proceso del taller). Si no puedo decirlo o respondo «no sé», márcalo «${ESTADO.falta}» y sigue.
3. No completes ningún dato con lo habitual del rubro ni me sugieras materiales, medidas, duración ni certificaciones. Si falta un dato, anótalo como [FALTA: el dato].
4. En «Duración o rendimiento» y en «Seguridad, salud y certificaciones» acepta un dato solo si me explicas cómo se comprobó (una prueba, un certificado); si no, «${ESTADO.falta}».
5. Si dos respuestas se contradicen, cita las dos frases textuales y pídeme que elija.
6. Distingue siempre entre lo que yo dije, lo que tú supones y lo que sugieres. Nunca conviertas una suposición en un dato.
7. No des consejos legales, de salud ni de seguridad, ni juzgues el producto.

### FORMATO DE SALIDA
Al terminar (o al llegar a 12 preguntas), una tabla con columnas fijas: Campo | Dato (con mis palabras) | Estado | De dónde sale, con una fila por dato. El estado es «${ESTADO.ok}» o «${ESTADO.falta}». Después, «Pendiente»: cada [FALTA] o dato sin confirmar y cómo podría conseguirlo. La tabla define la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Verifica que: están todos los campos, en el orden indicado; cada dato usa mis palabras y mis cifras; ningún dato apareció sin que yo lo dijera; cada «${ESTADO.ok}» tiene un origen que yo indiqué; toda suposición o sugerencia está marcada como tal. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar la tabla completa en el siguiente prompt, en el lugar de la variable FICHA.`,
      explanation: [
        {
          part: "…usando SOLO lo que yo te diga, marcando qué está verificado y qué no.",
          why: "Ella pregunta y ordena; los hechos son tuyos.",
        },
        {
          part: "Para cada dato pregúntame de dónde sale…",
          why: "Un dato sin origen se convierte en «Sin confirmar» en vez de pasar por cierto.",
        },
        {
          part: "En «Duración o rendimiento» y en «Seguridad, salud y certificaciones» acepta un dato solo si…",
          why: "Son los campos donde una frase falsa cuesta más y donde más tienta rellenar.",
        },
      ],
      evaluate: "Comprueba que cada dato usa tus palabras y que lo que no sabías dice «Sin confirmar».",
      improve: "Si una respuesta quedó vaga, contesta con la cifra exacta y pide reescribir solo esa fila.",
      conversation: [
        { who: "ia", text: "Primera pregunta: ¿de qué materiales está hecha la vela y de dónde sale ese dato?" },
        { who: "tu", text: "Cera de soja y mecha de algodón, de la etiqueta del proveedor; el vaso es de vidrio, con tapa de madera." },
        { who: "ia", text: "Anotado: cera y mecha verificadas; el vaso, sin origen todavía. ¿Sabes qué porcentaje de la cera es soja?" },
      ],
      warnings: ["No pegues datos personales de clientes ni precios de proveedores."],
    },

    redaccion: {
      title: "Prompt de redacción: dos versiones desde la ficha",
      objective: "Obtener una descripción corta y una larga que usen solo lo verificado, y saber qué datos faltaron.",
      whenToUse: "Cuando tu ficha está completa, con sus datos pendientes marcados.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: "Taller de velas artesanales" },
        { name: "PUBLICO", description: "A quién le escribes.", example: "Personas que buscan un regalo" },
        { name: "CANAL", description: "Dónde se publica.", example: CANAL },
        { name: "TONO", description: "Cómo suena tu marca.", example: "Cálido y sin exageraciones" },
        { name: "LONGITUD", description: "Extensión de la versión corta.", example: LONGITUD },
        { name: "PREGUNTAS", description: "Lo que te preguntan los clientes.", example: PREGUNTAS },
        { name: "FICHA", description: "La tabla del paso 2.", example: "La tabla de Campo, Dato, Estado y Origen" },
      ],
      prompt: `Actúa como redactor de fichas de producto para negocios pequeños. Tu destinatario es una persona que compra este producto en «{{CANAL}}». Tu objetivo es explicar bien un producto real, no embellecerlo: escribir una descripción corta y una larga usando SOLO la ficha.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
A quién le escribo: {{PUBLICO}}
Tono: {{TONO}}
Preguntas que me hacen los clientes: {{PREGUNTAS}}

### DATOS (la ficha es la única fuente de hechos)
{{FICHA}}

### REGLAS
1. Usa solo las filas «${ESTADO.ok}». Lo «${ESTADO.falta}» no lo menciones ni lo insinúes, tampoco con adjetivos como «duradera» o «segura».
2. No inventes materiales, medidas, duración, certificaciones, beneficios para la salud ni comparaciones con otras marcas. Sin superlativos ni fórmulas como «100 % natural» o «garantizado» que no estén en la ficha.
3. Los adjetivos de tono están permitidos si no sugieren un hecho que la ficha no contiene.
4. No incluyas precios, promociones ni plazos de envío.
5. Responde las preguntas de los clientes solo con datos de la ficha. Si una no tiene dato, no la respondas y anótala en «FALTA».
6. Si dos datos de la ficha se contradicen, avísame antes de escribir.
7. Distingue lo que sale de la ficha de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) «Versión corta» ({{LONGITUD}}); (2) «Versión larga»: la corta desarrollada, con qué es, de qué está hecho, cómo se usa, medidas y cuidados; (3) «Filas de la ficha que usé»; (4) «FALTA»: cada pregunta sin dato y cada [FALTA: el dato]. El formato define la forma; el contenido sale de mi ficha.

### ANTES DE RESPONDER
Verifica que: cada frase que afirma un hecho tiene una fila «${ESTADO.ok}»; nada «${ESTADO.falta}» aparece, ni insinuado; ningún adjetivo sugiere un hecho ausente; la versión corta cumple la longitud; cada pregunta está respondida con la ficha o anotada en «FALTA». Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar las dos versiones en el siguiente prompt, en el lugar de la variable DESCRIPCION.`,
      explanation: [
        {
          part: "Usa solo las filas «Verificado». Lo «Sin confirmar» no lo menciones ni lo insinúes…",
          why: "Le dice de dónde sacar hechos y qué dejar fuera, incluso de forma indirecta.",
        },
        {
          part: "Los adjetivos de tono están permitidos si no sugieren un hecho…",
          why: "Conserva la voz de tu marca sin dejar que un adjetivo cuele un dato.",
        },
        {
          part: "Si una no tiene dato, no la respondas y anótala en «FALTA».",
          why: "Le da una salida ante un hueco: pedirte el dato.",
        },
      ],
      evaluate: "Lee las dos versiones con la ficha al lado, frase por frase, en el paso siguiente.",
      improve: "Si suena genérico, aclara el público y el tono; no añadas datos que no estén en la ficha.",
      warnings: ["Es un borrador: no está listo para publicar hasta que lo audites."],
    },

    auditoria: {
      title: "Prompt de auditoría: comparar cada frase con la ficha",
      objective: "Que la IA señale las frases con problema y puntúe la descripción con la rúbrica, sin reescribir nada.",
      whenToUse: "Justo después de recibir las dos versiones, con tu ficha a la mano.",
      variables: [
        { name: "DESCRIPCION", description: "Las dos versiones que quieres auditar.", example: "La versión corta y la larga del prompt de redacción" },
        { name: "FICHA", description: "La tabla completa de la ficha.", example: "La misma tabla que usaste para redactar" },
      ],
      prompt: `Actúa como auditor de descripciones de producto para un negocio pequeño. Tu destinatario es la persona dueña, que comprobará tus marcas contra su ficha. Tu objetivo es comparar cada frase de la descripción con la ficha y puntuarla con una rúbrica fija. No reescribas nada.

### CONTEXTO
Usa el canal, la longitud pedida y las preguntas de los clientes de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Descripción a auditar (las dos versiones):
{{DESCRIPCION}}

Ficha del producto (la única referencia; no supongas nada fuera de ella):
{{FICHA}}

### RÚBRICA (puntúa cada criterio de 0 a 2: 0 = no cumple, 1 = en parte, 2 = cumple)
${LISTA_CRITERIOS}

### REGLAS
1. Divide cada versión en frases. Para cada frase que afirme un hecho (material, medida, cifra, uso, origen), busca la fila «${ESTADO.ok}» que la respalda y comprueba que el alcance coincida: «primer uso» no es «cada uso».
2. Marca cada frase con problema como «No está en la ficha», «Alcance distinto», «Insinúa algo sin confirmar» o «Promesa» (seguridad, salud, rendimiento o certificación).
3. Los adjetivos de tono no necesitan respaldo, pero no pueden sugerir un hecho que la ficha no contiene.
4. Cuenta las palabras de la versión corta, muestra el conteo y compáralo con la longitud pedida.
5. Cada puntaje se apoya en un fragmento literal entre comillas.
6. Si «${CRITERIOS[0].label}» o «${CRITERIOS[2].label}» sacan 0, marca la descripción NO PUBLICAR hasta corregirla.
7. No juzgues si el producto es bueno ni des consejos legales o de salud. Lista lo que debo comprobar yo.

### FORMATO DE SALIDA
En este orden: (1) «Frases con problema»: una tabla con columnas fijas Frase | Problema | Fila de la ficha (o «no está»); (2) «Frases revisadas»: cuántas revisaste y cuántas quedaron respaldadas; (3) una tabla con columnas fijas: Criterio | Puntaje (0-2) | Fragmento que lo justifica, con el total sobre ${MAXIMO} y el veredicto «${RESULTADOS[0].label}» (menos de ${RESULTADOS[1].min}), «${RESULTADOS[1].label}» (de ${RESULTADOS[1].min} a ${RESULTADOS[2].min - 1}) o «${RESULTADOS[2].label}» (${RESULTADOS[2].min} o más); (4) «Preguntas sin responder»; (5) «Para comprobar tú». Las tablas definen la forma; el contenido sale de mi descripción y mi ficha.

### ANTES DE RESPONDER
Verifica que: revisaste todas las frases de las dos versiones; cada frase con problema aparece en la primera tabla con su fila de la ficha; recontaste dos veces las palabras; los puntajes coinciden con las marcas y suman bien (máximo ${MAXIMO}); aplicaste NO PUBLICAR donde correspondía; no reescribiste nada. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "…comprueba que el alcance coincida: «primer uso» no es «cada uso».",
          why: "Un dato correcto con otro alcance es tan falso como uno inventado.",
        },
        {
          part: "Los adjetivos de tono no necesitan respaldo, pero no pueden sugerir un hecho…",
          why: "Separa el tono de tu marca de los hechos disfrazados de adjetivo.",
        },
        {
          part: "Cada puntaje se apoya en un fragmento literal entre comillas.",
          why: "Comprobar una marca es buscar esa frase.",
        },
      ],
      evaluate: "Lee la tabla con la ficha al lado; si sus marcas difieren de las tuyas, confía en tu ficha.",
      improve: "Si puntúa todo casi igual, pide más severidad en «Cada hecho tiene su fila».",
      warnings: ["Puede marcar como respaldada una frase que no lo está: la tabla ordena la revisión, no la sustituye."],
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente las frases con problema, usando solo la ficha, y dejar intacto lo que estaba bien.",
      whenToUse: "Después de la auditoría, cuando alguna frase tiene un problema.",
      variables: [
        { name: "PROBLEMAS", description: "Las frases con problema y su motivo, y lo que pediste.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Frases o datos que no se pueden cambiar.", example: "La ficha y las frases respaldadas" },
      ],
      prompt: `Actúa como editor de descripciones de producto para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO las frases señaladas, usando solo la ficha, y dejar intacto lo que estaba bien.

### CONTEXTO
Usa la ficha, la descripción, el canal y la longitud de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Problemas que detecté (frase y motivo):
{{PROBLEMAS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo las frases señaladas y lo que su cambio obligue a ajustar. No modifiques la ficha ni las frases respaldadas.
2. Para cada corrección usa solo filas «${ESTADO.ok}» y conserva su alcance. Si la ficha no tiene el dato que hace falta, escribe [FALTA: el dato] en lugar de inventarlo.
3. Si quitas una frase sin respaldo, no la sustituyas por otra parecida: quítala o deja solo la parte que la ficha respalda.
4. Si un problema que te señalé no existe en la ficha, o la ficha se contradice, dímelo antes de cambiar nada.
5. Respeta la longitud pedida de la versión corta y muestra su conteo de palabras.
6. No añadas datos, precios ni promociones.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla con columnas fijas Antes | Después | Motivo; (2) «Versión corta» y (3) «Versión larga», completas y listas para revisar; (4) «FALTA» con cada [FALTA]. La tabla define la forma; el contenido sale de mi descripción.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada corrección usa filas «${ESTADO.ok}» y su alcance; la versión corta cumple la longitud; no apareció ningún dato nuevo; las frases sin cambios están idénticas. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo las frases señaladas…",
          why: "Evita que reescriba frases que ya coincidían con la ficha.",
        },
        {
          part: "Si quitas una frase sin respaldo, no la sustituyas por otra parecida…",
          why: "Evita cambiar una afirmación falsa por otra igual de falsa.",
        },
        {
          part: "Si un problema que te señalé no existe en la ficha… dímelo antes de cambiar nada.",
          why: "Evita corregir a ciegas un problema que tú mismo pudiste marcar mal.",
        },
      ],
      evaluate: "Vuelve a pasar la auditoría con las dos versiones finales: no deben quedar frases con problema.",
      improve: "Si la versión corta sigue larga, baja la longitud pedida en LONGITUD y repite.",
    },

    canal: {
      title: "Prompt de canal: la misma descripción para otro lugar",
      objective: "Adaptar la descripción final a un canal con sus límites, sin cambiar ningún hecho.",
      whenToUse: "Cuando publicas en un lugar distinto al de la descripción original.",
      variables: [
        { name: "CANAL_NUEVO", description: "Dónde se publicará.", example: "Catálogo de Google (Merchant Center)" },
        { name: "LIMITES_DEL_CANAL", description: "Los límites y normas que copiaste de la documentación oficial del canal.", example: LIMITES_CANAL },
      ],
      prompt: `Actúa como adaptador de descripciones de producto para un negocio pequeño. Tu destinatario es la persona dueña, que publicará el texto en otro lugar. Tu objetivo es adaptar la descripción final a un canal sin cambiar ninguno de sus hechos.

### CONTEXTO
Canal: {{CANAL_NUEVO}}
Usa la ficha y la descripción final de esta conversación. Si falta alguna, pídemela antes de seguir.

### DATOS
Límites y normas del canal (los copié de su documentación oficial; son la única referencia):
{{LIMITES_DEL_CANAL}}

### REGLAS
1. Puedes cambiar el orden, el largo y el tono si el canal lo pide. No cambies ni añadas hechos: usa solo filas «${ESTADO.ok}» de la ficha.
2. Cumple los límites de arriba. Si un límite es ambiguo o falta, pregúntame en lugar de suponerlo.
3. No añadas texto promocional, precios, enlaces ni comparaciones si los límites los excluyen.
4. Pon primero los datos que deciden la compra.
5. Si los límites mencionan declarar el contenido generado con IA, recuérdamelo en «Para comprobar tú». No supongas normas que no estén en ellos.
6. Distingue lo que sale de la ficha de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Canal | Texto adaptado | Qué cambia | Qué no cambia; (2) «Contra los límites»: cada límite con «cumple» o «no cumple» y cómo lo comprobaste; (3) «Para comprobar tú»; (4) «FALTA». La tabla define la forma; el contenido sale de mi descripción.

### ANTES DE RESPONDER
Verifica que: ningún hecho cambió respecto de la descripción final; cada límite tiene su marca; los datos clave van primero; no hay texto que el canal excluya; contaste dos veces los caracteres si hay un tope. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Puedes cambiar el orden, el largo y el tono… No cambies ni añadas hechos…",
          why: "Cambia la forma para el canal y deja los hechos que ya auditaste.",
        },
        {
          part: "Cumple los límites de arriba. Si un límite es ambiguo o falta, pregúntame…",
          why: "Los límites cambian: los pegas tú desde la fuente.",
        },
        {
          part: "«Contra los límites»: cada límite con «cumple» o «no cumple»…",
          why: "Convierte cada límite en algo que puedes comprobar.",
        },
      ],
      evaluate: "Comprueba tú los límites en la documentación del canal y cuenta los caracteres si hay tope.",
      improve: "Si un límite quedó sin marca, pégalo de nuevo, uno por línea, y repite.",
      warnings: ["Las normas de cada canal cambian: copia siempre la versión vigente."],
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de redacción a la ficha de Luz de Cera. La tuya será distinta.",
    parts: [
      { type: "text", text: `**Versión corta.** ${CORTA_PRIMERA}` },
      { type: "text", text: `**Versión larga.** ${LARGA_PRIMERA}` },
      { type: "text", text: `**Filas de la ficha que usé:** ${USADAS}.` },
      { type: "text", text: `**FALTA:** ${FALTA}` },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "descripcion",
    title: "Puntúa una descripción",
    intro:
      `Puntúa tu descripción en los cinco criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[2].label}» sacan 0, no se publica aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      "Se lee bien, tiene un tono cálido y sus datos salen de la ficha. Justo por eso hay que leerla con la ficha al lado y puntuarla con la rúbrica. " +
      `En este ejemplo el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      {
        criterionId: "respaldo",
        verdict: vered("respaldo"),
        comment:
          "La versión larga dice «Enciéndela unas 3 horas cada vez». La ficha da esa cifra solo para el primer uso: es un dato correcto con otro alcance. El resto de los hechos coincide con su fila.",
      },
      {
        criterionId: "pendientes",
        verdict: vered("pendientes"),
        comment:
          "La versión corta cierra con «una vela para acompañarte muchas tardes». No da una cifra, pero sugiere una duración que la ficha marca como sin confirmar.",
      },
      {
        criterionId: "riesgo",
        verdict: vered("riesgo"),
        comment: "Ninguna frase promete seguridad, salud ni certificaciones.",
      },
      {
        criterionId: "dudas",
        verdict: vered("dudas"),
        comment: "Responde cuánto mide y cómo se cuida. Sobre cuánto dura no hay dato: el texto no lo responde y lo anota en «FALTA», como pide el prompt.",
      },
      {
        criterionId: "forma",
        verdict: vered("forma"),
        comment: `La versión corta tiene ${N_CORTA_PRIMERA} palabras y el pedido era «${LONGITUD}».`,
      },
    ],
    conclusion:
      "Es un buen borrador: los hechos coinciden con la ficha. Aun así, tres detalles habrían pasado por buenos al leerlo rápido, y solo se ven comparando frase por frase.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí no es pedir «hazlo mejor»: es cambiar la tarea, de escribir a corregir solo lo señalado.",
    promptId: "ajuste",
    why: "La auditoría señaló dos frases y una longitud. El prompt limita el cambio a lo señalado, pide usar solo filas verificadas con su alcance y cuenta las palabras de la versión corta.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de ajuste, con PROBLEMAS y NO_TOCAR del ejemplo. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Cambios del ajuste",
          purpose: "Comprobar qué frase cambió, por qué, y que solo cambió lo señalado.",
          columns: ["Antes", "Después", "Motivo"],
          rows: [
            ...PROBLEMAS.map((p) => [p.frase, p.despues, p.motivo]),
            [`Versión corta de ${N_CORTA_PRIMERA} palabras`, `Versión corta de ${N_CORTA_FINAL} palabras`, `El pedido era «${LONGITUD}»: se acorta la frase de elaboración.`],
          ],
        },
      },
      { type: "text", text: `**Versión corta (${N_CORTA_FINAL} palabras).** ${CORTA_FINAL}` },
      { type: "text", text: `**Versión larga.** ${LARGA_FINAL}` },
      {
        type: "text",
        text: `**FALTA:** ${FALTA} Al repetir la auditoría con estas versiones, la rúbrica suma ${MAXIMO} de ${MAXIMO}.`,
      },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Pedirle a la IA que «complete» lo que no sabes",
      whyItHurts: "Rellena los huecos con lo más probable, no con lo verdadero: un dato que falta puede terminar escrito como si existiera.",
      instead: "Marca el dato como «Sin confirmar» y pide que te diga qué le faltó.",
    },
    {
      title: "Pegar el texto del proveedor como si fuera tuyo",
      whyItHurts: "Es la descripción que tienen otras tiendas: no te distingue, no responde a tus clientes y puede traer afirmaciones que no comprobaste.",
      instead: "Úsalo como fuente de datos para tu ficha y redacta desde ella.",
    },
    {
      title: "Publicar porque «suena bien»",
      whyItHurts: "La fluidez no prueba la exactitud, y las promesas de seguridad y rendimiento son las que mejor suenan y peor se sostienen.",
      instead: "Audita frase por frase, con la ficha al lado.",
    },
    {
      title: "Meter precio, envío o promociones en la descripción",
      whyItHurts: "Caducan: cuando cambia el precio, la descripción miente.",
      instead: "La descripción habla del producto; el precio y las ofertas van en sus campos.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Ninguna descripción escrita con IA se publica sin pasar por esta lista. Marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Cada dato de la descripción está en una fila verificada de la ficha, y esa fila tiene su origen.", detail: "Si no puedes señalar de dónde sale, no se publica." },
      { label: "Comprobé medidas y peso con una regla, una balanza o la ficha oficial." },
      { label: "No hay afirmaciones de seguridad, salud o certificaciones sin un documento detrás." },
      { label: "No hay superlativos ni comparaciones que no pueda demostrar." },
      { label: "Ingredientes y composición están copiados de la etiqueta real, si aplica." },
      { label: "Otra persona la leyó sin conocer el producto y no le quedaron dudas." },
      {
        label: "Revisé las normas del canal y las de mi país sobre etiquetado, publicidad y texto generado con IA.",
        detail: "Cambian según el lugar y con el tiempo; esta guía no las cubre.",
      },
    ],
    principle: "La IA ordena y compara. Lo que es verdad de tu producto lo confirmas tú.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la descripción publicada, el trabajo es mantener la ficha al día.",
    steps: [
      { title: "Anota las preguntas que siguen llegando", detail: "Cada pregunta repetida señala un dato que falta en la ficha." },
      { title: "Convierte lo pendiente en tareas", detail: "Mide, pide al proveedor o prueba; con el dato, añádelo con su origen y márcalo como verificado." },
      { title: "Guarda la ficha como plantilla", detail: "Con el producto siguiente cambias solo los datos." },
      { title: "Revisa la ficha cuando cambie algo", detail: "Un proveedor o un material nuevos obligan a actualizarla y a auditar de nuevo el texto." },
      { title: "Empieza por los productos con más preguntas", detail: "Son los que más ganan con una descripción completa." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El procedimiento reduce el riesgo de publicar datos falsos, pero no lo elimina.",
    items: [
      { title: "No conoce tu producto", detail: "Solo sabe cómo se describen productos parecidos: todo lo específico viene de tu ficha." },
      { title: "Prohibir no asegura que obedezca", detail: "Aunque el prompt prohíba inventar, puede deslizar una insinuación o un alcance equivocado. Por eso existe la auditoría." },
      { title: "No valida seguridad, salud ni normativa", detail: "Las declaraciones reguladas requieren validación profesional y normas locales: la guía ayuda a organizarse, no a certificar." },
      { title: "Una buena descripción no compensa lo demás", detail: "Las fotos, un precio coherente y un envío fiable pesan tanto como el texto." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "La calidad de una descripción hecha con IA depende menos del prompt que de la ficha que le das y de la revisión que haces después. La IA sirve para dar forma y para comparar; los hechos los pones tú, y lo que no está verificado en la ficha no se escribe.",
    takeaways: [
      "Empieza por la ficha: cada dato con su estado y su origen.",
      "Dale a la IA una salida ante un hueco: pedirte el dato.",
      "Audita frase por frase: leer un texto que suena bien no es verificarlo.",
      "Las promesas de seguridad, salud y rendimiento piden más cuidado.",
    ],
    nextGuide: "crear-anuncios-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "dato-inventado", "rubrica", "canal"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Tengo que decir que usé IA para escribir la descripción?",
      answer:
        "Depende de dónde publiques. Google recomienda considerar informar cómo se creó un contenido, y algunos canales piden declararlo. Para tu propia web no hay una regla universal que podamos afirmar: revisa tu canal y la normativa de tu país.",
    },
    {
      question: "¿Puedo generar todas mis descripciones de una vez?",
      answer:
        "No conviene. Google indica que usar IA para generar muchas páginas sin aportar valor puede infringir su política de spam, y sin una ficha por producto aumentan los datos inventados. Ve de uno en uno.",
    },
    {
      question: "¿Y si mi proveedor no me da los datos que necesito?",
      answer: "Trátalos como «Sin confirmar» y no los uses. Pídelos por escrito, mídelos tú o prueba el producto si puedes comprobarlo.",
    },
    {
      question: "¿Cuánto debe medir una descripción?",
      answer: "Lo necesario para resolver las dudas de tu comprador. El máximo lo fija cada canal, y es un tope, no un objetivo.",
    },
  ],

  /* ───────────────────────────── fuentes ───────────────────────────── */
  sources: {
    intro: "Fuentes primarias de lo que la guía afirma sobre Google y Merchant Center. Las políticas y los límites cambian: vuelve a verificarlos antes de publicar.",
    items: [
      {
        title: "Guidance on using generative AI content on your website",
        publisher: "Google Search Central",
        url: "https://developers.google.com/search/docs/fundamentals/using-gen-ai-content",
        consultedAt: "2026-09-18",
        note: "Aceptable si aporta valor; conviene cuidar la exactitud e informar cómo se creó. Actualizada el 10 de diciembre de 2025.",
        mayExpire: true,
      },
      {
        title: "Spam policies for Google web search (scaled content abuse)",
        publisher: "Google Search Central",
        url: "https://developers.google.com/search/docs/essentials/spam-policies",
        consultedAt: "2026-09-18",
        note: "Define el abuso de contenido a escala, incluida la IA usada para generar muchas páginas sin valor. Actualizada el 28 de agosto de 2026.",
        mayExpire: true,
      },
      {
        title: "Description [description]",
        publisher: "Google Merchant Center Help",
        url: "https://support.google.com/merchants/answer/6324468",
        consultedAt: "2026-09-18",
        note: "Límite de 5.000 caracteres, datos clave en los primeros 160–500 y qué evitar (texto promocional, enlaces, comparaciones). Sin fecha de actualización visible.",
        mayExpire: true,
      },
      {
        title: "AI-generated content",
        publisher: "Google Merchant Center Help",
        url: "https://support.google.com/merchants/answer/14743464",
        consultedAt: "2026-09-18",
        note: "Declarar el texto generado con IA con el atributo `structured_description` (y `digital_source_type` = `trained_algorithmic_media`). Sin fecha de actualización visible.",
        mayExpire: true,
      },
    ],
  },
});
