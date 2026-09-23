import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * negocio/sistema-diario-de-trabajo-con-ia
 *
 * Guía pilar. Tipo: estrategia y planificación + conceptual. No es de números: las pocas cifras del caso (9 consultas,
 * 20 camisetas, 10 días de cambios, seis días de tienda abierta) son datos del caso y se verificaron con código.
 * Todo el caso (Moda Norte, Camila, Iván, sus apuntes, su ficha, su nota de traspaso y su agenda) es FICTICIO. Los
 * ejemplos de la IA están redactados aplicando literalmente cada prompt: no proceden de una conversación real ni de
 * una prueba del autor (esas viven en `evidence.pruebas`, que solo rellena el autor). El pedido ingenuo es
 * ILUSTRATIVO. La revisión semanal es una plantilla: no hay resultados de ninguna semana real.
 *
 * Fuente única de verdad: los campos de la ficha, la ficha del caso, los apuntes, la nota de traspaso, las
 * prioridades, las columnas de cada tabla, los bloques del día, la rúbrica y sus puntajes se definen UNA vez y los
 * leen las tablas, los prompts, los ejemplos y los criterios.
 */
const slot = guideSlots("negocio", "sistema-diario-de-trabajo-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const NEGOCIO = "Moda Norte (ficticia), una tienda de ropa de barrio con local y venta por WhatsApp";
const PARA_QUE = "Responder a clientes, publicar y cerrar el día con lo pendiente ordenado";

/* la ficha de contexto */
const CAMPOS: [campo: string, escribir: string][] = [
  ["Negocio", "Qué es, en una frase"],
  ["Clientes", "A quién le vendes y cómo te escriben"],
  ["Lo que ofrezco", "Productos o servicios; dónde están los precios, sin pegarlos aquí"],
  ["Políticas", "Cambios, envíos, formas de pago, tal como las cumples"],
  ["Horarios", "Cuándo atiendes"],
  ["Tono", "Cómo hablas: trato, palabras y lo que evitas"],
  ["Lo que nunca prometo o digo", "Plazos, descuentos, opiniones sobre las personas"],
  ["Lo que nunca comparto", "Datos que no salen de tu negocio"],
  ["Lo que no he decidido", "Lo que aún no sabes; se queda pendiente, no se inventa"],
];
const FICHA: [string, string][] = [
  ["Negocio", "Tienda de ropa casual para mujer, con local y venta por WhatsApp."],
  ["Clientes", "Mujeres del barrio, de unos 25 a 45 años; casi todas escriben por WhatsApp."],
  ["Lo que ofrezco", "Camisetas, jeans y vestidos. Los precios están en mi lista de precios y no los pego aquí."],
  ["Políticas", "Cambios dentro de 10 días, con etiqueta y ticket; no se devuelve dinero. Envío a domicilio por mensajería, que paga la clienta; retiro sin costo en el local."],
  ["Horarios", "Lunes a sábado, de 10 a 19."],
  ["Tono", "Cercano, de tú, sin exclamaciones de más."],
  ["Lo que nunca prometo o digo", "Plazos de entrega, descuentos ni tallas «ideales»."],
  ["Lo que nunca comparto", "Nombres, teléfonos y direcciones de clientas; datos de pago."],
  ["Lo que no he decidido", "Qué hacer con un cambio sin ticket."],
];
const ESTADO_FICHA = FICHA.map((_, i) => (i === FICHA.length - 1 ? "Pendiente" : "Confirmado"));
const DIAS_CAMBIO = 10;
const HORARIO_CIERRE = 19;

/* apuntes del lunes y nota de traspaso */
const CLIENTAS_CAMISETAS = 20;
const N_CONSULTAS = 9;
const LINEAS_APUNTES = [
  `Contesté ${N_CONSULTAS} consultas de WhatsApp; dos preguntaron por cambios.`,
  "Publiqué la foto de los vestidos.",
  `Una clienta pide ${CLIENTAS_CAMISETAS} camisetas para un club: falta que Iván me diga si hay tela, y hasta entonces no le respondo.`,
  "Cerré caja.",
  "No revisé la hoja de ventas.",
  "Una clienta dejó un pantalón para arreglar: la costurera lo recibe el jueves y lo llevo entonces.",
  "Decidí no hacer liquidación esta semana.",
  "Duda: ¿puedo cambiar una prenda sin ticket?",
];
const T_CAMISETAS = `Responder a la clienta que pide ${CLIENTAS_CAMISETAS} camisetas para un club`;
const T_PANTALON = "Llevar el pantalón de una clienta a la costurera";
const T_VENTAS = "Revisar la hoja de ventas";
const M_TELA = "Espera que Iván diga si hay tela";
const M_COSTURERA = "La costurera lo recibe el jueves";
const PREGUNTA = "¿Se puede cambiar una prenda sin ticket?";
const COL_NOTA = ["Tipo", "Qué", "Detalle"];
const NOTA: string[][] = [
  ["Hecho", "Contestar las consultas de WhatsApp", `${N_CONSULTAS} consultas; dos preguntaron por cambios`],
  ["Hecho", "Publicar la foto de los vestidos", "—"],
  ["Hecho", "Cerrar caja", "—"],
  ["Pendiente", T_CAMISETAS, M_TELA],
  ["Pendiente", T_VENTAS, "[FALTA: motivo]"],
  ["Pendiente", T_PANTALON, M_COSTURERA],
  ["Decisión", "No hacer liquidación esta semana", "—"],
  ["Pregunta abierta", PREGUNTA, "—"],
];
const AGENDA = "Martes. Iván trabaja hasta las 14. A las 16 llega una proveedora.";

/* la apertura del martes: primera vez y corregida */
const COL_PRIORIDADES = ["N.º", "Qué hago", "De dónde sale"];
const COL_ESPERA = ["Qué", "Motivo"];
const P1_MAL = `Responder a la clienta de las ${CLIENTAS_CAMISETAS} camisetas`;
const P1_BIEN = `Preguntarle a Iván si hay tela para las ${CLIENTAS_CAMISETAS} camisetas`;
const P3_MAL = "Avanzar con lo de ventas";
const P2 = "Recibir a la proveedora";
const MOT_MAL = "Puede esperar a otro día";
const PRIORIDADES = (mal: boolean) => [
  ["1", mal ? P1_MAL : P1_BIEN, mal ? "Nota" : "Nota (el pendiente espera esa respuesta)"],
  ["2", P2, "Agenda"],
  ["3", mal ? P3_MAL : T_VENTAS, "Nota"],
];
const ESPERA_MAL = [[T_PANTALON, MOT_MAL]];
const CAMBIOS = [
  ["Prioridad 1 · Qué hago: " + P1_MAL, "Prioridad 1 · Qué hago: " + P1_BIEN, "La nota dice que ese pendiente espera la respuesta de Iván."],
  ["Prioridad 3 · Qué hago: " + P3_MAL, "Prioridad 3 · Qué hago: " + T_VENTAS, "La nota dice qué quedó sin hacer: revisar la hoja de ventas."],
  [`Puede esperar (pantalón) · Motivo: ${MOT_MAL}`, `Puede esperar (pantalón) · Motivo: ${M_COSTURERA}`, "La nota da el motivo: la costurera lo recibe el jueves."],
  ["Puede esperar · Fila: —", `Puede esperar · Fila: ${P1_MAL} · ${M_TELA}`, "Consecuencia del cambio 1: el pendiente pasa a esperar, con su motivo."],
];
const PROBLEMAS_TXT =
  "1) La prioridad 1 ignora que espera a Iván. 2) La prioridad 3 no es concreta. 3) El motivo del pantalón no es el de mi nota.";

/* la revisión y los bloques del día */
const BLOQUES: string[][] = [
  ["Mañana", "Cada día, al abrir", "Elegir las prioridades con la nota de ayer y la agenda", "Que respete lo que espera algo y lo que ya decidiste", "Decidir qué importa hoy"],
  ["Durante el día", "Cuando llegan mensajes", "Un borrador de respuesta con tu ficha", "Precios, plazos y políticas contra tu ficha", "Promesas, compensaciones y reclamos delicados"],
  ["Ventas", "Una vez por semana", "Leer un resumen ya calculado y proponer hipótesis", "Cada cifra contra tu hoja", "Las cuentas y la decisión"],
  ["Marketing", "Dos días por semana", "Borradores con datos de tu ficha", "Datos, condiciones y tono", "Qué prometer en tu nombre"],
  ["Administración", "Un día fijo por semana", "Redactar cotizaciones con cifras ya calculadas", "Cada cifra y condición", "Precios, descuentos y asesoría legal o fiscal"],
  ["Final del día", "Cada día, al cerrar", "Ordenar tus apuntes en una nota de traspaso", "Que no falte ni sobre nada", "Decidir qué queda pendiente"],
];
const DIAS_TIENDA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const EXTRA: Record<string, string> = { Lunes: "Ventas", Martes: "Marketing", Miércoles: "Administración", Jueves: "Marketing", Viernes: "Revisión semanal" };
const SEMANA = DIAS_TIENDA.map((d) => [d, ["Mañana", "Durante el día", EXTRA[d], "Final del día"].filter(Boolean).join(", ")]);
const REVISION = [
  ["¿Qué pendiente aparece en tres o más notas?", "Las notas de la semana", "Ponlo primero el lunes, delégalo o descártalo"],
  ["¿Qué pregunta abierta se repite?", "Las notas de la semana", "Contéstala y añade la respuesta a la ficha"],
  ["¿Qué tuviste que explicarle a la IA que ya debería estar en la ficha?", "Tus conversaciones", "Agrégalo a la ficha"],
  ["¿Qué tarea repites con los mismos pasos?", "Lo hecho de cada nota", "Documéntala como proceso"],
  ["¿Qué bloque no usaste?", "El calendario de la semana", "Quítalo o cámbialo de día"],
];

/* pedido ingenuo (ilustrativo) */
const INGENUO = [
  ["«Tienes 30 días para cambiar el vestido.»", `La ficha dice ${DIAS_CAMBIO} días, con etiqueta y ticket.`],
  ["«Si no te gusta, te devolvemos el dinero.»", "La ficha dice que no se devuelve dinero."],
  ["«El envío es gratis.»", "La ficha dice que lo paga la clienta."],
  ["«Atendemos todos los días hasta las 21.»", `La ficha dice de lunes a sábado, de 10 a ${HORARIO_CIERRE}.`],
];

/* rúbrica */
const CRITERIOS = [
  { id: "origen", label: "Todo sale de tu nota, tu agenda o tu ficha", detail: "No agrega tareas, plazos ni datos que no escribiste." },
  { id: "accion", label: "Tres prioridades como máximo, cada una una acción", detail: "Cada prioridad es algo concreto que puedes hacer hoy, con un verbo." },
  { id: "esperas", label: "Respeta lo que espera algo o a alguien", detail: "Si un pendiente espera una respuesta, la prioridad es lo que la desbloquea." },
  { id: "decisiones", label: "Respeta lo que ya decidiste", detail: "Ninguna prioridad contradice una decisión de la nota." },
  { id: "motivos", label: "Cada motivo sale de tu nota", detail: "«Puede esperar» dice por qué con tus palabras, no con una frase genérica." },
  { id: "limites", label: "No inventa tiempos ni urgencias", detail: "No estima minutos ni marca nada como urgente por su cuenta." },
] as const;
const RESULTADOS = [
  { min: 0, label: "No usar todavía", advice: "Fallan varios criterios: corrige con el prompt de ajuste o revisa tu nota." },
  { min: 7, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado antes de empezar el día." },
  { min: 11, label: "Lista para el día", advice: "Cumple casi todo: empieza a trabajar." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (t: number) => [...RESULTADOS].reverse().find((r) => t >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { origen: 2, accion: 1, esperas: 1, decisiones: 2, motivos: 1, limites: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "sistema-diario-de-trabajo-con-ia",
    category: "negocio",
    title: "Un sistema diario de trabajo con IA para tu negocio",
    description: "Integra la IA en un día normal de trabajo: organizar tareas por la mañana, atender clientes, analizar ventas, crear contenido y cerrar el día con un plan.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["estrategia-planificacion", "conceptual-educativa"],
    estandarGuia: 3,
    activoOriginal:
      "Ficha de contexto, nota de traspaso, mapa de seis bloques con lo que no se delega, semana tipo y revisión semanal (copiables), y rúbrica de seis criterios con dos bloqueos",
    problem: "Usas la IA de forma esporádica y no la has convertido en una herramienta cotidiana de tu trabajo.",
    whyThisPage:
      "Es la guía pilar: enseña una rutina diaria completa y una ficha de contexto del negocio reutilizable, conectando todas las demás guías en un hábito de trabajo.",
    relatedGuides: [
      "organizar-tareas-del-negocio-con-ia",
      "responder-consultas-de-clientes-con-ia",
      "analizar-ventas-con-ia",
      "crear-publicaciones-para-redes-sociales-con-ia",
      "crear-cotizaciones-y-propuestas-con-ia",
      "documentar-procesos-con-ia",
    ],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Arma una ficha de tu negocio que la IA no tenga que adivinar, abre y cierra cada día con una nota de traspaso y reparte el resto en bloques, sabiendo qué no delegar.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Unas dos horas para la ficha y la primera semana; después, unos diez minutos al día entre apertura y cierre",
    needs: ["Un asistente de IA de chat", "Un documento donde guardar la ficha y las notas", "Un negocio con tareas diarias de clientes, ventas o contenido", "Un rato para anotar lo que haces durante el día"],
    result: "Una ficha, una rutina de apertura y cierre, y un mapa de lo que delegas",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el sistema: una ficha fija, una nota que pasa de un día al siguiente y seis bloques entre la apertura y el cierre.",
      description:
        "Una línea de tiempo de un día con una ficha de contexto a la izquierda, una apertura por la mañana, cuatro bloques en el medio y una nota de traspaso que sale por la derecha hacia el día siguiente. Datos ficticios de una tienda inventada. Sin logos ni nombres reales.",
      alt: "Un día de trabajo con una ficha fija, una apertura, bloques de trabajo y una nota que pasa al día siguiente.",
      caption: "Un sistema pequeño: ficha, apertura, bloques y cierre.",
    }),
    ficha: slot("ficha-de-contexto.webp", {
      section: "entrevista",
      ratio: "4/3",
      purpose: "Muestra la ficha completa como se pega al empezar una conversación, con un campo pendiente resaltado.",
      description:
        "Una hoja con los nueve campos de la ficha y su contenido, con el campo «Lo que no he decidido» resaltado. Debajo, una conversación de chat cuyo primer mensaje es la ficha pegada. Caso ficticio, sin datos de clientas.",
      alt: "Ficha de contexto de nueve campos pegada al inicio de una conversación con un asistente.",
      caption: "La ficha, pegada al empezar.",
      zoom: true,
    }),
    primerResultado: slot("apertura-primera-version.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver la primera apertura y localizar las tres celdas que hay que revisar.",
      description:
        "La nota de traspaso del lunes a la izquierda y la apertura del martes a la derecha, con tres celdas resaltadas: la prioridad 1, la prioridad 3 y el motivo del pantalón. Caso ficticio.",
      alt: "Una nota de traspaso y la apertura del día siguiente con tres celdas resaltadas para revisar.",
      caption: "La primera apertura, con tres cosas que revisar.",
      zoom: true,
    }),
    contraste: slot("contraste-con-la-nota.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar la apertura con la nota de ayer y con lo decidido.",
      description:
        "La nota de traspaso y la apertura unidas por líneas: cada prioridad con la fila de la nota de la que sale, y en rojo la prioridad 1 frente a «espera que Iván diga si hay tela». Debajo, la rúbrica puntuada (9 de 12). Caso ficticio.",
      alt: "Nota de traspaso y apertura conectadas fila a fila, con la rúbrica puntuada.",
      caption: "Cada prioridad, contra tu nota.",
      zoom: true,
    }),
    traspaso: slot("nota-de-traspaso.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Muestra los apuntes sueltos del día junto a la nota de traspaso que salen de ellos.",
      description:
        "Los apuntes del lunes, en un párrafo desordenado, a la izquierda y la tabla de traspaso a la derecha con Hecho, Pendiente, Decisión y Pregunta abierta. Resaltar un pendiente con [FALTA: motivo]. Caso ficticio.",
      alt: "Apuntes desordenados de un día convertidos en una nota de traspaso con cuatro tipos de fila.",
      caption: "De apuntes sueltos a una nota de traspaso.",
      zoom: true,
    }),
    dia: slot("un-dia-de-la-tienda.webp", {
      section: "comparativa",
      ratio: "16/9",
      purpose: "Muestra la semana tipo con los seis bloques repartidos de lunes a sábado.",
      description:
        "Una cuadrícula de lunes a sábado con los bloques de cada día: apertura, durante el día y cierre en todos, y ventas, marketing, administración y revisión en su día. Caso ficticio.",
      alt: "Cuadrícula semanal de una tienda con los seis bloques del sistema repartidos por días.",
      caption: "Una semana tipo.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "ficha",
      purpose: "Prueba real del prompt de ficha: las preguntas de la IA y la tabla final.",
      description:
        "Captura de un intercambio de preguntas y respuestas y de la tabla «Campo | Lo que dije | Estado». Usa los datos del caso (o los tuyos, sin datos de clientes). Comprueba que hace una sola pregunta cada vez. Ocultar datos personales y de cuenta.",
      alt: "Captura de una entrevista de un asistente para armar la ficha de un negocio.",
      caption: "Prueba del prompt de ficha.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "apertura",
      purpose: "Prueba real del prompt de apertura: las prioridades, lo que puede esperar y las preguntas.",
      description:
        "Captura de las dos tablas, de «Preguntas para ti» y de «FALTA». Usa la ficha, la nota de ayer y la agenda del caso. Comprueba aparte que no agregó ninguna tarea ni tiempo. Ocultar datos personales y de cuenta.",
      alt: "Captura de un plan del día devuelto por un asistente a partir de una nota de ayer.",
      caption: "Prueba del prompt de apertura.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description: "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de un plan del día con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "cierre",
      purpose: "Prueba real del prompt de cierre: la nota de traspaso y «FALTA».",
      description:
        "Captura de la tabla «Tipo | Qué | Detalle» y de «FALTA». Usa los apuntes del caso. Comprueba aparte que cada fila está en tus apuntes y que no hay datos de clientes. Ocultar datos personales y de cuenta.",
      alt: "Captura de una nota de traspaso devuelta por un asistente a partir de apuntes del día.",
      caption: "Prueba del prompt de cierre.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Muchos dueños prueban la IA con entusiasmo un día y la dejan al siguiente. No es falta de ganas: cada vez tienen que explicar desde cero qué es su negocio, y las respuestas salen genéricas o con datos que no son suyos, como un plazo de cambios inventado.\n\nLo que falta es un hábito pequeño. Un asistente puede no conservar lo de ayer ni conocer tu negocio, así que el sistema necesita una memoria, y la pones tú: una ficha con lo que tu negocio ya sabe y una nota al cerrar cada día con lo que queda para mañana.\n\n**La IA puede ayudar en cada bloque del día, pero la memoria del sistema es tuya: sin ficha y sin nota, cada día empieza de cero.**",
    symptoms: [
      "Usas la IA cuando se te ocurre, no cada día.",
      "Cada conversación empieza explicando qué vendes y cómo hablas.",
      "Las respuestas traen datos que no son tuyos.",
      "Terminas el día sin saber qué quedó pendiente ni por qué.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con un sistema pequeño que puedes repetir cada día: ficha, apertura, cierre y bloques en medio.",
    deliverables: [
      { label: "Una ficha de contexto", detail: "Lo que tu negocio ya sabe, en un texto corto que pegas al empezar." },
      { label: "Una rutina de apertura y cierre", detail: "La nota de hoy es el punto de partida de mañana." },
      { label: "Un mapa de seis bloques", detail: "Cuándo usas la IA, qué verificas y qué no delegas." },
      { label: "Una revisión semanal", detail: "Para ajustar la ficha y la rutina con lo que pasó." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes un negocio con clientes, ventas y publicaciones cada día.",
      "Ya probaste la IA y no se te quedó como hábito.",
      "Estás dispuesto a dedicar unos minutos al abrir y al cerrar el día.",
    ],
    notForWho: [
      "Buscas automatizar sin intervenir: aquí una persona decide en cada bloque.",
      "Esperas que la IA conozca tu negocio sin escribírselo: eso lo hace la ficha.",
      "Ya tienes un sistema de gestión con equipo y procesos formales.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: NEGOCIO,
    situation:
      "Camila atiende su tienda con un ayudante, Iván, que trabaja por las mañanas. Contesta mensajes, publica, revisa ventas y prepara presupuestos, a saltos. Todo es inventado.",
    goal: "Tener un día de trabajo con la IA que pueda repetir, sin volver a explicar su negocio cada vez.",
    data: [
      { label: "Lo que hace cada día", value: "Contestar clientes, publicar, revisar ventas, preparar presupuestos y cerrar caja" },
      { label: "Lo que le falta", value: "Un lugar donde esté escrito qué es su tienda y qué quedó pendiente" },
      { label: "Días de tienda abierta", value: `${DIAS_TIENDA.length} por semana` },
    ],
    problem: "Cada vez tiene que explicar su tienda, y la IA rellena lo que no sabe con datos inventados.",
    application: "Arma su ficha con una entrevista, abre con la nota de ayer, trabaja por bloques y cierra con una nota nueva.",
    result: `Una semana con ${DIAS_TIENDA.length} aperturas y ${DIAS_TIENDA.length} cierres, tres bloques repartidos por días y una revisión el viernes.`,
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas sostienen el sistema.",
    blocks: [
      {
        title: "Un hábito pequeño gana a uno grande",
        detail: "Diez minutos al día se mantienen. Un sistema que exige una hora se abandona al tercer día.",
      },
      {
        title: "La memoria es tuya",
        detail: "Un asistente puede no recordar tu negocio ni tu día. Lo fijo va en la ficha; lo que cambia cada día, en la nota de traspaso.",
      },
      {
        title: "Cada bloque tiene su límite",
        detail: "En cada momento la IA prepara un borrador, tú verificas contra tu ficha y hay cosas que no se delegan, como una promesa a un cliente.",
      },
      {
        title: "El sistema se ajusta cada semana",
        detail: "Lo que tuviste que explicar de nuevo, lo que quedó pendiente varios días y lo que no usaste dicen qué cambiar. Se revisa una vez por semana.",
        example: "Si la duda «¿puedo cambiar una prenda sin ticket?» aparece tres días, la respuesta va a la ficha.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Contesta a una clienta que quiere cambiar un vestido.",
    whyInsufficient:
      "La IA no sabe qué políticas tiene tu tienda, y responde igual, con seguridad: un mensaje educado con condiciones que tú no ofreces.",
    issues: [
      "Inventa políticas, plazos y horarios que nadie le dio.",
      "Cada conversación empieza de cero: no hay ficha ni nota.",
      "Nadie sabe qué de lo que dijo la IA era cierto para el negocio.",
      "No queda ningún registro de lo pendiente para mañana.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Antes de abrir la IA, reúne tres cosas.",
    items: [
      { label: "Lo que tu negocio ya sabe", detail: "Políticas, horarios, tono y límites: donde estén hoy, en tu cabeza o en un mensaje que sueles enviar.", required: true },
      { label: "Un lugar donde guardar", detail: "Un documento con dos encabezados: «Ficha», que casi no cambia, y «Notas», donde pegas la nota de cada día.", required: true },
      { label: "Apuntes del día", detail: "Líneas sueltas mientras trabajas: lo hecho, lo pendiente, lo decidido y las dudas.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribe la IA y lo que dice tu ficha",
      purpose: "Ver cómo un pedido sin ficha produce condiciones que no ofreces.",
      columns: ["Frase de la IA", "Lo que dice tu ficha"],
      rows: INGENUO,
      note: "Ejemplo ilustrativo, con la ficha del caso.",
    },
    plantilla: {
      caption: "Ficha de contexto: los nueve campos",
      purpose: "Saber qué escribir en cada campo de la ficha.",
      columns: ["Campo", "Qué escribir"],
      rows: CAMPOS.map(([c, e]) => [c, e]),
      copyable: true,
      note: "Sin contraseñas ni datos de clientes.",
    },
    ficha: {
      caption: "La ficha de Camila",
      purpose: "Ver la ficha terminada, con lo que aún no está decidido a la vista.",
      columns: ["Campo", "Lo que dije", "Estado"],
      rows: FICHA.map((f, i) => [f[0], f[1], ESTADO_FICHA[i]]),
      note: "Ejemplo generado con el prompt de ficha.",
    },
    apuntes: {
      caption: "Los apuntes de Camila del lunes, tal como los escribió",
      purpose: "Ver lo que se le entrega al prompt de cierre: líneas sueltas, sin ordenar.",
      columns: ["N.º", "Apunte"],
      rows: LINEAS_APUNTES.map((l, i) => [String(i + 1), l]),
      note: "Caso ficticio. Sin nombres de clientas.",
    },
    nota: {
      caption: "Nota de traspaso del lunes",
      purpose: "Ver cómo los apuntes del día se ordenan en una nota que sirve al día siguiente.",
      columns: COL_NOTA,
      rows: NOTA,
      note: "Ejemplo generado con el prompt de cierre.",
    },
    bloques: {
      caption: "Los seis bloques del día",
      purpose: "Saber cuándo se usa la IA, qué verificas y qué no se delega en cada bloque.",
      columns: ["Bloque", "Cuándo", "Qué le pides a la IA", "Qué verificas tú", "Lo que no delegas"],
      rows: BLOQUES,
      copyable: true,
    },
    semana: {
      caption: "Una semana tipo de la tienda",
      purpose: "Ver los bloques repartidos por días.",
      columns: ["Día", "Bloques de ese día"],
      rows: SEMANA,
      copyable: true,
      note: "Ejemplo del caso: la tienda abre de lunes a sábado.",
    },
    revision: {
      caption: "Revisión del viernes",
      purpose: "Decidir qué cambiar en la ficha y en la rutina según la semana.",
      columns: ["Pregunta", "Dónde lo miras", "Si la respuesta es sí"],
      rows: REVISION,
      copyable: true,
      note: "Plantilla sin rellenar: no hay resultados de ninguna semana real.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Cuatro de los siete pasos llevan un prompt. Los otros tres los haces tú.",
    steps: [
      { title: "Reúne lo que tu negocio ya sabe", description: "Escribe donde puedas tus políticas, horarios, tono y límites, sin ordenarlos.", output: "Notas sueltas y un documento." },
      { title: "Deja que la IA te entreviste", description: "Contesta sus preguntas, de una en una, para armar la ficha de contexto.", output: "Una ficha con lo pendiente marcado." },
      { title: "Abre el día con la nota de ayer", description: "Entrégale la ficha, la nota de ayer y tu agenda, y pide tres prioridades como máximo.", output: "Un plan del día." },
      { title: "Contrasta y corrige", description: "Compara el plan con la nota, puntúa con la rúbrica y pide cambiar solo lo señalado.", output: "Un plan corregido." },
      { title: "Cierra el día con una nota de traspaso", description: "Entrégale tus apuntes y pide una nota con lo hecho, lo pendiente, lo decidido y las dudas.", output: "La nota de mañana." },
      { title: "Reparte el resto en bloques", description: "Elige cuándo usas la IA para clientes, ventas, marketing y administración, y qué verificas en cada uno.", output: "Una semana tipo." },
      { title: "Revisa la semana", description: "El viernes, mira las notas y ajusta la ficha y la rutina.", output: "Una ficha y una rutina ajustadas." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    ficha: {
      title: "Prompt de ficha: que la IA te entreviste sobre tu negocio",
      objective: "Armar la ficha de contexto con lo que dices tú, con preguntas de una en una y lo pendiente marcado.",
      whenToUse: "Una vez, antes de empezar, y cada vez que cambie algo importante.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: NEGOCIO },
        { name: "PARA_QUE", description: "Para qué quieres usar la IA en el día.", example: PARA_QUE },
      ],
      prompt: `Actúa como un entrevistador que ayuda a un negocio pequeño a armar la ficha de contexto que pegará al empezar cada conversación con una IA. Tu destinatario es la persona dueña, que conoce su negocio pero nunca lo dejó por escrito. Tu objetivo es reunir SOLO lo que yo te diga, sin inventar nada.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Para qué quiero usar la IA: {{PARA_QUE}}

### CAMPOS DE LA FICHA
${CAMPOS.map(([c]) => c).join(" · ")}

### REGLAS
1. Pregúntame de a UNA cosa y espera mi respuesta. Máximo 12 preguntas; no repitas lo que ya está en CONTEXTO.
2. Recorre los campos en orden y pregúntame por cada uno con mis palabras: cómo lo cumplo hoy, no cómo debería ser.
3. No propongas políticas, plazos, precios ni horarios que yo no mencione, ni me digas lo que es «habitual» en otros negocios.
4. No me pidas contraseñas, precios completos ni datos de clientes.
5. Si dos respuestas se contradicen, cita las dos frases y pídeme que elija. Si algo no lo decidí, márcalo «Pendiente» y sigue.
6. Separa lo que yo dije de lo que tú supones, y no presentes una suposición como si fuera mi respuesta.

### FORMATO DE SALIDA
Al terminar (o al llegar a 12 preguntas), una tabla de columnas fijas: Campo | Lo que dije | Estado, con los nueve campos en ese orden. El estado es «Confirmado» o «Pendiente». La tabla fija la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Verifica que: hay una fila por campo y en el orden dado; ninguna política, plazo o dato apareció sin que yo lo dijera; cada «Confirmado» corresponde a algo que dije; toda suposición está marcada; no pediste contraseñas ni datos de clientes. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo guardar la tabla completa en mi documento, bajo «Ficha», y pegarla al empezar cada conversación, en el lugar de la variable FICHA.`,
      explanation: [
        { part: "cómo lo cumplo hoy, no cómo debería ser.", why: "Una ficha con lo que harías es una ficha con promesas; con lo que haces, es útil." },
        { part: "No propongas políticas, plazos, precios ni horarios que yo no mencione", why: "Es la regla que impide que la IA rellene tu ficha con lo habitual de otros negocios." },
        { part: "Si algo no lo decidí, márcalo «Pendiente» y sigue.", why: "Un campo pendiente se puede completar; uno inventado se descubre cuando un cliente lo reclama." },
      ],
      evaluate: "Comprueba que cada «Confirmado» es algo que dijiste tú y que hizo las preguntas de a una.",
      improve: "Si propone una política que no dijiste, contéstale que no la tienes y pídele quitarla.",
      conversation: [
        { who: "ia", text: "Primera pregunta: ¿cómo suelen escribirte tus clientas y a qué hora del día?" },
        { who: "tu", text: "Casi todas por WhatsApp, sobre todo por la tarde." },
        { who: "ia", text: "Anotado. Sobre los cambios: ¿cuántos días tienen y qué tiene que traer la clienta?" },
      ],
    },

    apertura: {
      title: "Prompt de apertura: tres prioridades a partir de la nota de ayer",
      objective: "Obtener las prioridades de hoy, lo que puede esperar y tus preguntas abiertas, usando solo tu ficha, tu nota y tu agenda.",
      whenToUse: "Cada mañana, antes de empezar, con la nota de traspaso de ayer.",
      variables: [
        { name: "FICHA", description: "Tu ficha de contexto, pegada.", example: `${FICHA[0][0]} | ${FICHA[0][1]}\n…` },
        { name: "NOTA_DE_AYER", description: "La nota de traspaso de ayer, pegada.", example: `${NOTA[0][0]} | ${NOTA[0][1]} | ${NOTA[0][2]}\n…` },
        { name: "AGENDA_DE_HOY", description: "Lo que ya está fijado hoy: personas, visitas, horarios.", example: AGENDA },
      ],
      prompt: `Actúa como asistente que ordena el comienzo del día de un negocio pequeño. Tu destinatario es la persona dueña, que decidirá qué hace hoy. Tu objetivo es proponer como máximo tres prioridades con lo que yo escribí, sin decidir por mí.

### CONTEXTO
Mi ficha de contexto:
{{FICHA}}

### DATOS (única fuente)
La nota de traspaso de ayer:
{{NOTA_DE_AYER}}

Mi agenda de hoy: {{AGENDA_DE_HOY}}

### REGLAS
1. Usa solo mi nota de ayer, mi agenda y mi ficha. No agregues tareas, plazos, tiempos ni urgencias.
2. Como máximo tres prioridades. Cada una es una acción concreta que puedo hacer hoy y empieza con un verbo.
3. Si un pendiente de la nota espera algo o a alguien, tenlo en cuenta al elegir: si lo que lo desbloquea es una acción mía, esa acción es la prioridad.
4. No contradigas lo que ya decidí: las decisiones de la nota se respetan.
5. Todo pendiente de la nota que no sea prioridad va a «Puede esperar», con el motivo que dice mi nota. Toda pregunta abierta va a «Preguntas para ti».
6. No estimes minutos. Si mi agenda ocupa el día, dilo.
7. Si falta un dato para decidir, escribe [FALTA: qué dato].
8. No propongas nada que mi ficha marque como límite.

### FORMATO DE SALIDA
En este orden: (1) «Prioridades de hoy»: una tabla de columnas fijas: ${COL_PRIORIDADES.join(" | ")}, donde «De dónde sale» es Nota, Agenda o Ficha; (2) «Puede esperar»: una tabla de columnas fijas: ${COL_ESPERA.join(" | ")}; (3) «Preguntas para ti»; (4) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: hay como máximo tres prioridades y cada una es una acción; ninguna prioridad ignora un pendiente que espera algo; ninguna contradice una decisión; cada pendiente de la nota está en «Prioridades de hoy» o en «Puede esperar»; cada pregunta abierta está en «Preguntas para ti»; no hay tiempos ni urgencias tuyos. Corrige lo que no cumpla.`,
      explanation: [
        { part: "No agregues tareas, plazos, tiempos ni urgencias.", why: "El plan sale de tu nota y tu agenda, no de lo que suena razonable." },
        { part: "si lo que lo desbloquea es una acción mía, esa acción es la prioridad.", why: "Responder a alguien que espera una confirmación es inútil hasta que llega: primero se pide." },
        { part: "con el motivo que dice mi nota.", why: "Un pendiente aplazado sin su motivo real se olvida o se discute de nuevo." },
      ],
      evaluate: "Compara cada prioridad con una fila de tu nota o con tu agenda: nada nuevo y ninguna que espere algo.",
      improve: "Si una prioridad es vaga, pídele una acción concreta con el pendiente exacto de tu nota.",
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente las celdas señaladas, apoyándose en tu nota, y dejar el resto intacto.",
      whenToUse: "Después de contrastar el plan con tu nota, cuando tiene un problema.",
      variables: [
        { name: "PROBLEMAS_DETECTADOS", description: "Lo que hay que corregir y por qué.", example: PROBLEMAS_TXT },
        { name: "NO_TOCAR", description: "Lo que no puede cambiar.", example: "La prioridad 2 y las preguntas para mí" },
      ],
      prompt: `Actúa como editor de planes del día para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo señalado, usando mi nota de ayer, y dejar intacto lo demás.

### CONTEXTO
Usa mi ficha, mi nota de ayer, mi agenda y el plan de esta conversación. Si falta alguna, pídemela antes de seguir.

### DATOS
Problemas que detecté:
{{PROBLEMAS_DETECTADOS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo lo señalado y lo que ese cambio obligue a ajustar. Si obliga a cambiar otra parte, inclúyela en «Cambios».
2. Cada cambio se apoya en mi nota, mi agenda o mi ficha. No agregues tareas, plazos ni tiempos.
3. Si lo que señalé no existe en el plan, o mi nota no lo respalda, dímelo antes de cambiar nada.
4. En «Motivo» cita lo que dice mi nota.
5. No recomiendes nada nuevo. Si falta un dato, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla de columnas fijas: Antes | Después | Motivo; (2) «Sin cambios»: lo que no toqué; (3) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado y lo que obliga; cada cambio cita mi nota; lo que no se puede tocar está idéntico; no hay tareas, plazos ni tiempos nuevos. Corrige lo que no cumpla.`,
      explanation: [
        { part: "Cambia solo lo señalado", why: "Evita que rehaga lo que estaba bien y cambie algo sin que lo notes." },
        { part: "Si obliga a cambiar otra parte, inclúyela en «Cambios».", why: "Un cambio puede mover otra cosa; verla en la tabla evita sorpresas." },
        { part: "En «Motivo» cita lo que dice mi nota.", why: "Cada corrección queda con su respaldo y puedes comprobarla." },
      ],
      evaluate: "Compara con el plan anterior: solo deben cambiar las celdas señaladas y las que estas obligan.",
      improve: "Si toca algo que no señalaste, pide repetir solo lo señalado.",
    },

    cierre: {
      title: "Prompt de cierre: una nota de traspaso con tus apuntes del día",
      objective: "Ordenar tus apuntes en una nota con lo hecho, lo pendiente con su motivo, lo decidido y las dudas, sin agregar nada.",
      whenToUse: "Cada día, al cerrar, con los apuntes que fuiste tomando.",
      variables: [
        { name: "DIA", description: "El día que cierras.", example: "Lunes" },
        { name: "APUNTES_DEL_DIA", description: "Tus apuntes del día, tal como los escribiste.", example: `${LINEAS_APUNTES[0]} ${LINEAS_APUNTES[1]} …` },
      ],
      prompt: `Actúa como asistente que ordena los apuntes del cierre de un día de trabajo. Tu destinatario es la persona dueña, que usará esta nota mañana como punto de partida. Tu objetivo es ordenar SOLO lo que escribí, sin agregar nada.

### CONTEXTO
Día que cierro: {{DIA}}

### DATOS (única fuente)
Mis apuntes del día, tal como los escribí:
{{APUNTES_DEL_DIA}}

### REGLAS
1. Usa solo mis apuntes. No agregues tareas, motivos, plazos ni cifras.
2. Una fila por cosa que aparezca en mis apuntes, con uno de estos tipos: Hecho, Pendiente, Decisión o Pregunta abierta.
3. En un Pendiente, el motivo va en «Detalle», con mis palabras. Si no lo dije, escribe [FALTA: motivo].
4. Copia las cifras tal cual, como cuántas consultas contesté; no sumes ni estimes.
5. No incluyas nombres, teléfonos ni datos de clientes: di «una clienta».
6. No ordenes por importancia ni recomiendes qué hacer mañana: eso lo decide la apertura.
7. Si un apunte es ambiguo, como no saber si algo se hizo, pregúntamelo antes de armar la nota.

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: ${COL_NOTA.join(" | ")}; (2) «FALTA». Sin nada más. La tabla fija la forma; el contenido sale de mis apuntes.

### ANTES DE RESPONDER
Verifica que: cada fila está en mis apuntes y cada cosa de mis apuntes tiene su fila; cada Pendiente tiene su motivo o su [FALTA]; las cifras son las mías; no hay datos de clientes; no recomendaste nada. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo guardar la tabla en mi documento, bajo «Notas», y pegarla mañana en el lugar de la variable NOTA_DE_AYER.`,
      explanation: [
        { part: "Usa solo mis apuntes. No agregues tareas, motivos, plazos ni cifras.", why: "La nota es tu memoria: si trae algo que no anotaste, mañana partes de un dato falso." },
        { part: "Si no lo dije, escribe [FALTA: motivo].", why: "Un pendiente sin motivo se ve, y mañana sabes qué preguntarte." },
        { part: "No ordenes por importancia ni recomiendes qué hacer mañana", why: "Decidir qué importa es trabajo de la apertura, con la agenda a la vista." },
      ],
      evaluate: "Comprueba que cada fila está en tus apuntes y que ninguna cosa de tus apuntes quedó fuera.",
      improve: "Si agrega un motivo que no escribiste, pídele que lo cambie por [FALTA: motivo].",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de apertura con la ficha, la nota del lunes y la agenda del martes. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Prioridades de hoy, tal como llegan",
          purpose: "Tener el plan en el formato del prompt para contrastarlo con la nota.",
          columns: COL_PRIORIDADES,
          rows: PRIORIDADES(true),
        },
      },
      {
        type: "table",
        table: {
          caption: "Puede esperar, tal como llega",
          purpose: "Ver lo que la IA deja para después y con qué motivo.",
          columns: COL_ESPERA,
          rows: ESPERA_MAL,
        },
      },
      { type: "text", text: `**Preguntas para ti:** ${PREGUNTA} **FALTA:** ninguno.` },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "apertura",
    title: "Puntúa el plan del día antes de usarlo",
    intro:
      `Puntúa el plan en los seis criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[5].label}» sacan 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      `El plan parece razonable: tres prioridades, algo que espera y tu pregunta abierta. Se contrasta con tu nota y tu agenda y se puntúa con la rúbrica: ` +
      `el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      { criterionId: "origen", verdict: vered("origen"), comment: "Cada prioridad sale de una fila de la nota o de la agenda y no hay tareas nuevas." },
      { criterionId: "accion", verdict: vered("accion"), comment: `La prioridad 3, «${P3_MAL}», no dice qué hacer: tu nota decía «${T_VENTAS}».` },
      { criterionId: "esperas", verdict: vered("esperas"), comment: `La prioridad 1 es responder a la clienta, pero tu nota dice que «${M_TELA.charAt(0).toLowerCase()}${M_TELA.slice(1)}»: lo primero es preguntarle a Iván.` },
      { criterionId: "decisiones", verdict: vered("decisiones"), comment: "Ninguna prioridad contradice tu decisión de no hacer liquidación." },
      { criterionId: "motivos", verdict: vered("motivos"), comment: `El pantalón «${MOT_MAL.charAt(0).toLowerCase()}${MOT_MAL.slice(1)}», pero tu nota daba el motivo: ${M_COSTURERA.charAt(0).toLowerCase()}${M_COSTURERA.slice(1)}.` },
      { criterionId: "limites", verdict: vered("limites"), comment: "No estima minutos ni marca nada como urgente, como pide el prompt." },
    ],
    conclusion: "Es una buena base: no inventa tareas y trae tu pregunta abierta. Los tres fallos son de detalle, pero cambian tu mañana.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir tres celdas, no pedir otro plan.",
    promptId: "ajuste",
    why: "El contraste señaló tres cosas. El prompt limita el cambio a lo señalado, exige citar tu nota y muestra lo que un cambio obliga a mover.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de ajuste con los datos del ejemplo. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Cambios del ajuste",
          purpose: "Comprobar qué celdas cambiaron y por qué.",
          columns: ["Antes", "Después", "Motivo"],
          rows: CAMBIOS,
        },
      },
      { type: "text", text: `**Sin cambios:** la prioridad 2 (${P2.charAt(0).toLowerCase()}${P2.slice(1)}) y las preguntas para ti. **FALTA:** ninguno.` },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Empezar cada conversación de cero",
      whyItHurts: "Sin ficha, la IA rellena lo que no sabe con lo habitual de otros negocios.",
      instead: "Pega tu ficha al empezar y mantenla actualizada.",
    },
    {
      title: "Dejar que la IA decida qué importa",
      whyItHurts: "No sabe qué pierdes si algo se retrasa ni qué acabas de decidir.",
      instead: "Que ordene tu nota y tu agenda; las prioridades las eliges tú.",
    },
    {
      title: "Escribir la nota de traspaso de memoria",
      whyItHurts: "Al final del día se olvida lo que quedó esperando algo.",
      instead: "Apunta mientras trabajas y pide la nota con esos apuntes.",
    },
    {
      title: "Enviar lo que redactó sin compararlo con la ficha",
      whyItHurts: "Un mensaje bien escrito con un plazo equivocado es peor que uno torpe y correcto.",
      instead: "Antes de enviar, compara precios, plazos y políticas con tu ficha.",
    },
    {
      title: "Querer usar todos los bloques desde el primer día",
      whyItHurts: "Un sistema con seis rutinas nuevas se abandona en una semana.",
      instead: "Empieza por la apertura y el cierre; suma un bloque cuando sean hábito.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Cada día, marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "La ficha dice lo que cumplo hoy, no lo que quisiera cumplir." },
      { label: "Cada prioridad del día sale de mi nota o de mi agenda." },
      { label: "Antes de enviar un mensaje, comparé precios, plazos y políticas con mi ficha." },
      { label: "Cada cifra de un resumen de ventas la comprobé contra mi hoja." },
      { label: "No pegué contraseñas, datos de pago ni datos personales de clientes en ninguna conversación." },
      { label: "La nota de traspaso tiene lo que anoté y nada más." },
      { label: "Lo que no delego lo decidí yo: promesas, compensaciones, precios y asesoría legal." },
    ],
    principle: "La memoria del sistema es tuya: una ficha y una nota que revisas tú. Sin ellas, cada día empieza de cero.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la primera semana hecha, se trata de crecer poco a poco.",
    steps: [
      { title: "Empieza solo con la apertura y el cierre", detail: "La primera semana, únicamente esos dos; el medio lo haces como siempre." },
      { title: "Suma un bloque por semana", detail: "Cuando apertura y cierre salgan sin esfuerzo, añade el de clientes y luego los demás." },
      { title: "Guarda las notas en el mismo documento", detail: "Con la fecha: sirve para la revisión del viernes y para encontrar lo que decidiste." },
      { title: "Actualiza la ficha cuando cambie algo", detail: "Un precio, un horario o una política nuevos se cambian primero en la ficha." },
      { title: "Pasa lo que se repite a un procedimiento", detail: "Lo que haces igual cada semana merece dejarse por escrito." },
    ],
  },

  /* ───────────────────────────── variaciones ───────────────────────────── */
  variations: {
    intro: "El sistema no depende de que vendas ropa: cambian el contenido de la ficha y los bloques que usas.",
    items: [
      {
        title: "Un negocio de servicios",
        description: "Agendas y presupuestos pesan más que el mostrador.",
        promptChange: "En la ficha, cambia «Lo que ofrezco» por tus servicios y condiciones, y añade cómo agendas. Dale más peso al bloque de administración.",
      },
      {
        title: "Un negocio de comida",
        description: "El día depende de la producción y la cocina.",
        promptChange: "En la ficha, añade horarios de producción y qué no puedes prometer. Suma a la agenda los pedidos del día.",
      },
      {
        title: "Un negocio de una sola persona",
        description: "No hay quien reciba la nota: la lees tú mañana.",
        promptChange: "Mantén la ficha y el cierre; en la agenda, pon solo tus compromisos. La revisión del viernes es la más útil.",
      },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El sistema ordena tu trabajo con la IA, pero tiene límites claros.",
    items: [
      { title: "La ficha envejece", detail: "Si cambian tus políticas y no la actualizas, la IA trabajará con datos viejos." },
      { title: "La nota es tan buena como tus apuntes", detail: "Lo que no anotaste durante el día no aparece en ella." },
      { title: "La IA puede equivocarse aun con tu ficha", detail: "Por eso cada bloque tiene su verificación: la ficha reduce los errores, no los evita." },
      { title: "No es una herramienta de gestión", detail: "No avisa ni comparte con tu equipo: la memoria es tu documento." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Un día de trabajo con IA se sostiene con cuatro piezas: una ficha fija, una apertura con la nota de ayer, bloques con límites claros y un cierre que deja la nota de mañana. La IA acelera cada pieza; el hilo entre un día y otro lo pones tú.",
    takeaways: [
      "Escribe tu ficha una vez y pégala al empezar cada conversación.",
      "Cierra cada día con una nota de traspaso hecha con tus apuntes.",
      "Empieza con la apertura y el cierre; los bloques se suman después.",
      "Decide tú lo que no se delega y revisa el sistema cada semana.",
    ],
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "ficha-de-contexto", "nota-de-traspaso", "voz-de-marca", "rubrica", "dato-personal"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Cuánto tiempo lleva de verdad?",
      answer: "La ficha, unas dos horas una sola vez. Después, la apertura y el cierre llevan pocos minutos cada uno; el resto depende de los bloques del día.",
    },
    {
      question: "¿Qué hago si la IA no recuerda la ficha a mitad del día?",
      answer: "Pégala de nuevo al empezar cada conversación: por eso vive en tu documento.",
    },
    {
      question: "¿Puedo usar el sistema si trabajo solo?",
      answer: "Sí. La nota sirve igual: la escribes hoy y la lees mañana. La agenda tendrá solo tus compromisos.",
    },
    {
      question: "¿Qué hago con los datos de mis clientas?",
      answer: "No los pegues. Escribe «una clienta» y quita nombres, teléfonos y direcciones: la tarea se entiende igual.",
    },
  ],
});
