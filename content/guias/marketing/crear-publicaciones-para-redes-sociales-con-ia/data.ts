import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * marketing/crear-publicaciones-para-redes-sociales-con-ia
 *
 * Tipo: comunicación (con un brief de planificación). Todo el caso (la peluquería Rizo Fino, su oferta,
 * sus datos y sus textos) es FICTICIO. Las respuestas de la IA son EJEMPLOS GENERADOS: están redactadas
 * aplicando literalmente cada prompt a los datos del caso, no proceden de una conversación real ni de
 * una prueba del autor. Ninguna prueba real de prompts está escrita aquí: viven en `evidence.pruebas`,
 * que solo rellena el autor. La guía no cita datos externos que caduquen, ni normas, ni límites de plataformas.
 *
 * Fuente única de verdad: los siete campos del brief (CAMPOS_BRIEF), los seis criterios de la rúbrica
 * (CRITERIOS), los umbrales (RESULTADOS) y los datos del caso (CASO) se definen UNA vez aquí y los leen
 * el marco, la plantilla, la rúbrica, el análisis y los prompts.
 */
const slot = guideSlots("marketing", "crear-publicaciones-para-redes-sociales-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const CAMPOS_BRIEF = [
  {
    id: "objetivo",
    campo: "Objetivo",
    fill: "Una sola cosa que quieres que pase después de leer la publicación.",
    why: "Sin objetivo, la IA escribe para que quede bonito y luego no sabes si funcionó. Elige uno solo: reservar, preguntar, guardar, visitar.",
  },
  {
    id: "publico",
    campo: "Público",
    fill: "A quién le hablas: qué busca, qué le preocupa y cómo habla.",
    why: "Una publicación «para todos» no le habla a nadie. Con una persona concreta en mente, la IA elige palabras y ejemplos que esa persona entiende.",
  },
  {
    id: "oferta",
    campo: "Producto u oferta",
    fill: "Lo que ofreces, con sus datos exactos: precio o descuento, días, fechas, condiciones y cómo se reserva.",
    why: "Aquí viven los datos que la IA no puede conocer, y aparecerán en el texto como hechos. Cópialos tal como los decidiste.",
  },
  {
    id: "tono",
    campo: "Tono",
    fill: "Cómo suena tu negocio y qué frases nunca dirías. Aparte, guarda una muestra real de cómo escribes.",
    why: "El tono hace que un texto suene a ti. Se describe con dos o tres adjetivos y con lo que evitas; la muestra real fija el registro.",
  },
  {
    id: "formato",
    campo: "Formato",
    fill: "La forma de la publicación: una imagen con texto, una serie de imágenes, un texto largo.",
    why: "Una imagen con texto pide frases cortas; una serie de imágenes permite explicar por pasos. Elige el principal y adapta después el resto.",
  },
  {
    id: "cta",
    campo: "Llamada a la acción",
    fill: "La acción única que debe hacer quien lee y cómo hacerla.",
    why: "«Contáctanos» no dice qué hacer; «pide tu presupuesto por mensaje» sí. Una sola acción por publicación, escrita completa.",
  },
  {
    id: "frecuencia",
    campo: "Frecuencia",
    fill: "Cuántas publicaciones puedes sostener por semana y cuánto tiempo tienes para prepararlas.",
    why: "Fija cuánto esfuerzo puede pedir cada pieza. Con una hora semanal, una serie de seis imágenes no se sostiene, y la IA no lo sabe si no se lo dices.",
  },
] as const;

const CRITERIOS = [
  { id: "objetivo", label: "Cumple el objetivo del brief", detail: "Empuja lo que el brief pide, y solo eso." },
  { id: "datos", label: "Usa solo datos del brief", detail: "Cada precio, día, fecha, condición y nombre está en el brief, completo y sin añadidos." },
  { id: "publico", label: "Le habla a su público", detail: "Una persona de ese público la entendería sin explicación." },
  { id: "tono", label: "Suena a tu negocio", detail: "Coincide con el tono del brief y con tu manera real de escribir." },
  { id: "cta", label: "Pide una sola acción clara", detail: "Una acción, con lo necesario para hacerla: qué, dónde y con qué palabra." },
  { id: "formato", label: "Cabe en su formato", detail: "Su longitud y su estructura son las del formato elegido y se leen de un vistazo." },
] as const;

const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Falla en varios criterios: vuelve al brief y revisa qué campo estaba flojo." },
  { min: 7, label: "Con ajustes", advice: "Buen punto de partida: corrige el criterio con menos puntos." },
  { min: 10, label: "Lista para verificar", advice: "Cumple casi todo: pasa a la verificación humana antes de publicar." },
] as const;

const CASO = {
  objetivo: "Que reserven turno para martes o miércoles, los días con menos clientes.",
  publico: "Vecinas y vecinos del barrio, de 25 a 55 años, que buscan una peluquería de confianza cerca de casa.",
  oferta: "Tratamiento de hidratación con 15 % de descuento, solo martes y miércoles, hasta el 31 de octubre. Se reserva únicamente por mensaje.",
  tono: "Cercano y tranquilo, de vecino a vecino. Sin tecnicismos ni frases de publicidad.",
  formato: "Una imagen con texto.",
  cta: "Escribir la palabra «turno» por mensaje para reservar.",
  frecuencia: "Dos publicaciones por semana, preparadas los lunes en una hora.",
} as const;

const VOZ = "«Pasa sin apuro. Te lavamos el pelo, charlamos un rato y te vas contenta. Aquí nadie corre.»";
const LIMITES = "No prometer resultados en el cabello. No mostrar fotos de clientes sin permiso. No hablar de otras peluquerías.";

const LISTA_BRIEF = CAMPOS_BRIEF.map((c, i) => `${i + 1}. ${c.campo}: ${c.fill}`).join("\n");
const LISTA_CRITERIOS = CRITERIOS.map((c, i) => `${i + 1}. ${c.label}: ${c.detail}`).join("\n");
const MAXIMO = CRITERIOS.length * 2;

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "crear-publicaciones-para-redes-sociales-con-ia",
    category: "marketing",
    title: "Crear publicaciones para redes sociales con IA",
    description:
      "Aprende a escribir un brief de siete campos, pedir opciones a la IA, puntuarlas con una rúbrica y adaptar la elegida a cada formato sin datos inventados.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["comunicacion-atencion"],
    estandarGuia: 3,
    activoOriginal: "Plantilla de brief de siete campos (se copia como tabla) y rúbrica de seis criterios con umbrales para puntuar cualquier publicación",
    problem: "Publicas en redes sin un objetivo claro y las publicaciones que te devuelve la IA suenan genéricas.",
    whyThisPage:
      "Enseña a definir el objetivo, el público, el tono, el formato, la CTA y la frecuencia antes de pedir una publicación; no es un generador de textos sueltos.",
    relatedGuides: ["ideas-de-contenido-para-tu-negocio-con-ia", "crear-afiches-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Antes de pedir el texto, decide qué quieres lograr, a quién le hablas y con qué datos. Escribe un brief, pide tres opciones, puntúalas y lleva la elegida a cada formato sin que la IA invente nada.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de una hora la primera vez; después, unos 20 minutos por publicación",
    needs: ["Un asistente de IA de chat", "Los datos exactos de lo que anuncias", "Dos o tres textos tuyos que te representen"],
    result: "Una publicación revisada, adaptada a cada formato, y un brief que reutilizas",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Muestra de un vistazo la idea de la guía: los datos del brief de la izquierda son los que aparecen en la publicación de la derecha, y nada más.",
      description:
        "A la izquierda, la plantilla del brief de siete campos ya completa (caso ficticio de la peluquería). A la derecha, la publicación final en una tarjeta de imagen con texto. Unir con una línea el campo «Producto u oferta» con la frase de la tarjeta que sale de él. Sin logotipos reales ni datos de personas.",
      alt: "Una hoja con el brief completo de una peluquería y, a su lado, la publicación final en una tarjeta con texto, unidos por una línea desde el campo de la oferta.",
      caption: "Cada dato de la publicación sale del brief.",
    }),
    brief: slot("brief-completo.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña cómo se ve la plantilla ya rellena, para que el lector sepa qué nivel de detalle se espera en cada campo antes de hablar con la IA.",
      description:
        "La plantilla del brief pegada en una hoja de cálculo, con las siete filas y la columna «Tu respuesta» completa con el caso ficticio. Resaltar la fila de la oferta y la de la llamada a la acción. Sin datos personales.",
      alt: "Hoja de cálculo con la plantilla del brief de siete campos rellena para una peluquería ficticia.",
      caption: "El brief completo: una fila por decisión.",
      zoom: true,
    }),
    tresOpciones: slot("tres-opciones.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver cómo llega la primera respuesta y comprobar, línea por línea, qué dato del brief usó cada opción.",
      description:
        "La primera respuesta del asistente con las tres opciones y sus listas «Datos del brief usados» y «Supuestos». Marcar con un recuadro lo que cada opción omitió y el [FALTA] de la tercera. Caso ficticio, sin datos personales ni de cuenta.",
      alt: "Tres opciones de publicación con sus listas de datos usados y supuestos, con recuadros sobre lo que cada opción omitió.",
      caption: "La primera respuesta, sin editar.",
      zoom: true,
    }),
    rubrica: slot("rubrica-aplicada.webp", {
      section: "analisis",
      ratio: "4/3",
      purpose: "Enseña cómo se puntúa una publicación con los seis criterios, con un ejemplo ya hecho que el lector puede imitar.",
      description:
        "Una tabla con los seis criterios, un puntaje de 0, 1 o 2 en cada uno, el fragmento literal que lo justifica y el total sobre 12. Resaltar la fila de «Usa solo datos del brief». Datos del caso ficticio.",
      alt: "Tabla de puntuación con seis criterios, sus fragmentos de apoyo y el total sobre 12.",
      caption: "Una publicación puntuada con la rúbrica.",
      zoom: true,
    }),
    tono: slot("ajuste-de-tono.webp", {
      section: "iteracion",
      ratio: "16/9",
      purpose: "Muestra qué cambia y qué no cuando se ajusta el tono, para que el lector aprenda a comprobar que los datos siguen intactos.",
      description:
        "La tabla «Cambios» del ajuste de tono con sus filas (frase original, frase nueva, motivo) y debajo la lista «Lo que no cambié». Resaltar en el mismo color los datos que aparecen en las dos versiones. Caso ficticio.",
      alt: "Tabla de cambios de tono con la frase original, la frase nueva y el motivo, y una lista de los datos que no cambiaron.",
      caption: "Cambian las palabras; los datos se quedan.",
      zoom: true,
    }),
    formatos: slot("versiones-por-formato.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Deja ver cómo un mismo mensaje toma forma distinta en cada formato sin perder ninguna condición de la oferta.",
      description:
        "La publicación final en una imagen con texto y, al lado, sus dos versiones: una serie de tres imágenes y un mensaje breve para mensajería. Resaltar en las tres la frase con los días y la fecha límite. Caso ficticio.",
      alt: "La misma publicación en una imagen con texto, en una serie de tres imágenes y en un mensaje breve, con los días y la fecha resaltados.",
      caption: "Un mensaje, tres formatos, los mismos datos.",
      zoom: true,
    }),
    antesDespues: slot("antes-despues.webp", {
      section: "antes-despues",
      ratio: "16/9",
      purpose: "Compara lado a lado lo que devuelve un pedido sin brief con la publicación final, para ver de un vistazo qué cambió.",
      description:
        "Dos tarjetas comparadas: a la izquierda el texto del pedido sin brief, a la derecha la publicación final. Subrayar en la izquierda lo que promete y en la derecha los datos exactos de la oferta. Caso ficticio.",
      alt: "Dos tarjetas comparadas: un texto genérico de peluquería y la publicación final con los datos exactos de la oferta.",
      caption: "El mismo negocio, sin brief y con brief.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "brief",
      purpose: "Prueba real del prompt de entrevista: la conversación y la tabla del brief que devolvió.",
      description:
        "Captura de la conversación con el asistente tras pegar el prompt: las preguntas, tus respuestas y la tabla final del brief. Ocultar datos personales y de cuenta.",
      alt: "Captura de la entrevista con un asistente y de la tabla del brief resultante.",
      caption: "Prueba del prompt de entrevista.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "publicacion",
      purpose: "Prueba real del prompt principal: las tres opciones que devolvió con un brief real.",
      description:
        "Captura de la respuesta con las tres opciones y sus listas de datos usados y supuestos. Ocultar datos personales y de cuenta.",
      alt: "Captura de las tres opciones de publicación devueltas por un asistente.",
      caption: "Prueba del prompt de publicación.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "revision",
      purpose: "Prueba real del prompt de revisión: la tabla de puntajes y la lista «Para comprobar tú».",
      description:
        "Captura de la respuesta con la tabla de criterios, los fragmentos literales, el total y la lista de cosas por comprobar. Ocultar datos personales y de cuenta.",
      alt: "Captura de la revisión de una publicación con puntajes, fragmentos y lista de comprobaciones.",
      caption: "Prueba del prompt de revisión.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "tono",
      purpose: "Prueba real del prompt de ajuste de tono: la versión ajustada y la tabla de cambios.",
      description:
        "Captura de la respuesta con la versión ajustada, la tabla de cambios y la lista de lo que no cambió. Ocultar datos personales y de cuenta.",
      alt: "Captura del ajuste de tono con la versión ajustada y su tabla de cambios.",
      caption: "Prueba del prompt de ajuste de tono.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "formatos",
      purpose: "Prueba real del prompt de formatos: la tabla de versiones y las listas de datos conservados y de lo que no cabe.",
      description:
        "Captura de la respuesta con la tabla de formatos, la lista de datos conservados y la de lo que no cabe. Ocultar datos personales y de cuenta.",
      alt: "Captura de la adaptación de una publicación a varios formatos.",
      caption: "Prueba del prompt de formatos.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Publicar con regularidad parece cuestión de tiempo, pero casi siempre el obstáculo viene antes: no está decidido qué quieres que pase con esa publicación. Sin esa decisión, cada texto se escribe a ciegas, lo redactes tú o lo redacte una IA.\n\nSi le pides a un asistente «escribe un post para mi negocio», él debe suponer todo lo demás: a quién le hablas, qué ofreces, cómo hablas y qué debe hacer quien lo lea. Suele suponer lo habitual del rubro, y de ahí salen textos correctos que servirían para cualquier negocio, con una promoción, una fecha o una promesa que nadie le dio.\n\nLa IA acelera la redacción, pero no decide qué quieres lograr ni conoce tus datos. **Esas decisiones se escriben antes, en un brief, y se le entregan.**",
    symptoms: [
      "Cada texto que te da sale distinto y no sabes qué corregir.",
      "Tus publicaciones se parecen a las de cualquier otro negocio del rubro.",
      "Descubres tarde una oferta, un precio o una fecha que tú no diste.",
      "Publicas sin saber qué querías que hiciera quien lo lee.",
      "Reescribes a mano el mismo texto para cada formato.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con una publicación lista para revisar, sus versiones por formato y un procedimiento que repites cada semana.",
    deliverables: [
      { label: "Un brief completo", detail: "Siete campos con tus datos, en una plantilla que copias como tabla." },
      { label: "Tres opciones de publicación", detail: "Cada una con los datos que usó y lo que tuvo que suponer." },
      { label: "Una forma de puntuar", detail: "Seis criterios que se aplican siempre igual." },
      { label: "Versiones por formato", detail: "La elegida, adaptada sin perder ninguna condición de tu oferta." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes un negocio pequeño, publicas en redes y tus textos salen genéricos o te llevan demasiado tiempo.",
      "Sabes qué ofreces y a quién, aunque nunca lo hayas escrito.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Todavía no sabes qué publicar: esta guía parte de una idea ya elegida.",
      "Buscas que la IA programe, publique o mida por ti: aquí solo se redacta y se revisa.",
      "Esperas publicaciones «virales»: nadie puede asegurarlas y esta guía no lo promete.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Peluquería Rizo Fino (ficticia)",
    situation:
      "Rizo Fino es una peluquería de barrio con tres estilistas. Los martes y miércoles tiene sillas vacías; el resto de la semana, agenda llena. La dueña le pide al asistente «un post para hoy».",
    goal: "Llenar los turnos de martes y miércoles hasta fin de mes con publicaciones que suenen a la peluquería.",
    data: [
      ...CAMPOS_BRIEF.map((c) => ({ label: c.campo, value: CASO[c.id] })),
      { label: "Muestra de voz", value: VOZ },
      { label: "Límites", value: LIMITES },
    ],
    problem: "Los textos de la IA le prometen resultados imposibles de asegurar y hablan de condiciones que no existen.",
    application: "Escribe el brief, pide tres opciones, las puntúa, ajusta el tono, las adapta y verifica los datos.",
    result: "Una publicación revisada, con la oferta completa.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro:
      "Hay siete decisiones que solo tú puedes tomar antes de escribir una frase. Si una queda vacía, la IA la rellena con lo habitual de tu rubro, y el texto se vuelve genérico o incluye lo que no debe.",
    blocks: CAMPOS_BRIEF.map((c) => ({ title: c.campo, detail: c.why })),
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Escribe un post para Instagram para mi peluquería.",
    whyInsufficient:
      "Con esa frase el asistente no sabe qué quieres lograr, a quién le hablas, qué ofreces ni cómo hablas. Tiene que suponerlo todo, y lo habitual en una peluquería es una promesa de belleza y una invitación vaga a reservar.",
    issues: [
      "Aparecen afirmaciones que tú no diste, como un resultado en el cabello.",
      "El texto serviría igual para cualquier peluquería.",
      "No puedes saber de dónde salió cada frase.",
      "Cada intento sale distinto y no sabes qué ajustar.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Antes del brief, reúne lo que solo tú tienes.",
    items: [
      { label: "Los datos exactos de lo que anuncias", detail: "Precio o descuento, días, fecha límite, condiciones y cómo se reserva.", required: true },
      { label: "Dos o tres textos tuyos de los que estés conforme", detail: "Publicaciones o mensajes a clientes que suenen a ti, nunca de otro negocio.", required: true },
      { label: "Lo que no vas a decir ni mostrar", detail: "Promesas que no puedes cumplir y fotos o datos de clientes sin permiso.", required: true },
      { label: "Tu tiempo real por semana", detail: "Cuántas publicaciones sostienes y cuánto tiempo tienes para prepararlas.", required: true },
      { label: "El canal y sus reglas", detail: "Sus límites de longitud o de imagen. Compruébalos en la plataforma: cambian.", required: false },
      { label: "Tus publicaciones que mejor respondieron", detail: "Las que trajeron mensajes o reservas ayudan a elegir tono y formato.", required: false },
    ],
  },

  /* ───────────────────────────── plantilla y tablas ───────────────────────────── */
  comparisons: {
    brief: {
      caption: "Plantilla de brief de publicación",
      purpose: "Tener las siete decisiones en una hoja que copias, completas y pegas en el prompt, para no volver a pedir un texto a ciegas.",
      columns: ["Campo", "Qué escribir", "Tu respuesta"],
      rows: CAMPOS_BRIEF.map((c) => [c.campo, c.fill, "(escribe aquí)"]),
      note: "Si un campo no lo sabes todavía, escribe «no lo sé»: la IA lo marcará como falta en lugar de rellenarlo.",
      copyable: true,
    },
    versiones: {
      caption: "Versiones de la publicación por formato",
      purpose: "Ver cómo el mismo mensaje cambia de forma según el formato y comprobar que los días y la fecha límite siguen en todos.",
      columns: ["Formato", "Pieza", "Texto (listo para copiar)", "Qué mostrar (sugerencia)"],
      rows: [
        ["Serie de tres imágenes", "1", "Martes y miércoles, la hidratación tiene 15 % de descuento.", "El nombre del local y los dos días, grandes."],
        ["Serie de tres imágenes", "2", "Vale hasta el 31 de octubre. Ven con calma: hay tiempo para conversar.", "Un rincón del local, sin personas identificables."],
        ["Serie de tres imágenes", "3", "Para reservar, escríbenos «turno» por mensaje.", "La palabra «turno» en grande."],
        [
          "Mensaje breve por mensajería",
          "Única",
          "Hola, en Rizo Fino la hidratación tiene 15 % de descuento los martes y miércoles, hasta el 31 de octubre. Para reservar, respóndeme con la palabra «turno».",
          "Nada: es solo texto.",
        ],
      ],
      note: "Ejemplo generado. Datos conservados: nombre, hidratación, 15 %, martes y miércoles, 31 de octubre, «turno» y reserva por mensaje. No cabe: nada.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene en cinco de los seis pasos; solo el primero, reunir tus datos, es enteramente tuyo. La comprobación de los datos es tuya en todos.",
    steps: [
      {
        title: "Junta tus datos reales",
        description: "Reúne los datos exactos de tu oferta, dos o tres textos tuyos, tus límites y tu tiempo.",
        output: "Un documento con tus datos y tu muestra de voz.",
      },
      {
        title: "Completa el brief de siete campos",
        description: "Rellena la plantilla; si no sabes responder un campo, el prompt de entrevista te pregunta y devuelve la tabla.",
        output: "Un brief sin campos vacíos, o con lo que falta marcado.",
      },
      {
        title: "Pide tres opciones de publicación",
        description: "Pega el brief, tu muestra de voz y tus límites en el prompt principal.",
        output: "Tres opciones para comparar.",
      },
      {
        title: "Puntúa las opciones y elige una",
        description: "Usa la rúbrica, a mano o con el prompt de revisión. Si el criterio de datos saca 0, esa opción no se publica.",
        output: "Una opción elegida y lo que debes comprobar.",
      },
      {
        title: "Ajusta el tono de la elegida",
        description: "Si algo no suena a ti, pide un cambio concreto: el prompt modifica palabras, no datos.",
        output: "Una publicación final que suena a tu negocio.",
      },
      {
        title: "Adáptala a cada formato y verifica",
        description: "Lleva la publicación final a los formatos que necesitas y recorre la lista de verificación humana antes de publicar.",
        output: "Versiones verificadas por ti.",
      },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    brief: {
      title: "Prompt de entrevista: completar el brief",
      objective: "Que la IA te pregunte de una en una lo que falta y te devuelva el brief de siete campos con tus propias palabras.",
      whenToUse: "Cuando no sabes cómo responder alguno de los siete campos, antes de pedir cualquier publicación.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio y dónde está, en una frase.", example: "Peluquería de barrio con tres estilistas" },
        { name: "TEMA", description: "Lo que quieres comunicar, aunque esté desordenado.", example: "Una promoción para los días flojos" },
      ],
      prompt: `Actúa como un entrevistador de comunicación para negocios pequeños. Tu destinatario es la persona dueña de un negocio que no sabe de marketing. Tu objetivo es ayudarme a completar un BRIEF de siete campos para una publicación en redes sociales, usando SOLO lo que yo te diga.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Lo que quiero comunicar: {{TEMA}}

### CAMPOS DEL BRIEF (en este orden)
${LISTA_BRIEF}

### REGLAS
1. Hazme UNA pregunta por turno y espera mi respuesta antes de seguir. Máximo 10 preguntas.
2. No preguntes lo que ya te dije en el CONTEXTO; pregunta solo lo que falte.
3. Si una respuesta es vaga («que la gente me conozca»), pídeme una versión concreta: algo que una persona pueda hacer o comprobar.
4. Distingue siempre entre lo que yo dije, lo que tú supones y lo que sugieres. Nunca conviertas una suposición en un dato.
5. Si no tengo un dato (un precio, una fecha límite, una condición), no lo rellenes con lo habitual de mi rubro: anótalo como [FALTA: el dato] y sigue.
6. No opines sobre precios, no prometas resultados y no des consejos legales; si el tema aparece, recuérdame que lo decido y lo verifico yo.
7. Todavía no escribas ninguna publicación: solo el brief.

### FORMATO DE SALIDA
Al terminar (o al llegar a 10 preguntas), entrégame una tabla con tres columnas fijas: Campo | Lo que dije yo (con mis palabras) | Estado. El estado es COMPLETO, SUPUESTO, SUGERIDO o [FALTA: el dato]. Después, una lista «Preguntas pendientes» con cada [FALTA]. La tabla define la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Antes de entregar la tabla, verifica que: los siete campos están, en el orden indicado; cada fila usa mis palabras y no las tuyas; ningún dato apareció sin que yo lo dijera; todo lo que supusiste o sugeriste está marcado como tal. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar la tabla completa en el siguiente prompt, en el lugar de la variable BRIEF.`,
      explanation: [
        {
          part: "Actúa como un entrevistador… usando SOLO lo que yo te diga.",
          why: "Le das el papel de quien pregunta, no de quien inventa: la información sale de ti.",
        },
        {
          part: "Distingue siempre entre lo que yo dije, lo que tú supones y lo que sugieres.",
          why: "Una suposición marcada se acepta o se corrige; una disfrazada de dato pasa sin verla.",
        },
        {
          part: "…anótalo como [FALTA: el dato] y sigue.",
          why: "Evita que rellene un vacío con algo verosímil: queda a la vista y lo resuelves tú.",
        },
      ],
      evaluate: "Comprueba que cada fila usa tus palabras y que lo que no sabías dice [FALTA].",
      improve: "Si una respuesta quedó vaga, contesta con un caso real y pide reescribir solo esa fila.",
      conversation: [
        { who: "ia", text: "Ya sé que es una peluquería de barrio y que quieres comunicar una promoción. Primera pregunta: ¿qué quieres que haga una persona después de leerla?" },
        { who: "tu", text: "Que reserve turno para martes o miércoles, que son los días flojos." },
        { who: "ia", text: "Entendido: reservar turno para esos dos días. ¿Cómo debe hacerlo: por mensaje, por teléfono o en el local?" },
      ],
      warnings: ["No pegues datos personales de clientes (nombres, teléfonos)."],
    },

    publicacion: {
      title: "Prompt principal: tres opciones de publicación base",
      objective: "Obtener tres opciones de una misma publicación, escritas solo con los datos de tu brief y con tu manera de escribir.",
      whenToUse: "Cuando el brief está completo y tienes una muestra de tu voz.",
      variables: [
        { name: "BRIEF", description: "La tabla del brief completa, campo por campo.", example: "La tabla que devolvió la entrevista" },
        { name: "MUESTRA_DE_VOZ", description: "Dos o tres frases tuyas, tal como las escribes.", example: "Las frases de la muestra del caso" },
        { name: "LIMITES", description: "Lo que la publicación no debe decir ni mostrar.", example: "No prometer resultados en el cabello" },
        { name: "OPCIONES", description: "Cuántas opciones quieres (2 o 3).", example: "3" },
      ],
      prompt: `Actúa como redactor de publicaciones para un negocio pequeño. Tu destinatario es la persona dueña, que revisará tu texto antes de publicarlo. Tu objetivo es escribir {{OPCIONES}} opciones de UNA publicación base que cumpla el objetivo del brief.

### BRIEF (datos que YO te doy; son la única fuente de hechos)
{{BRIEF}}

### MI MANERA DE ESCRIBIR (muestra real)
{{MUESTRA_DE_VOZ}}

### LÍMITES
{{LIMITES}}

### REGLAS
1. Usa solo los datos del BRIEF. No inventes precios, fechas, condiciones, resultados, opiniones de clientes ni datos del negocio. Si necesitas un dato que no está, escribe [FALTA: el dato] en su lugar.
2. Escribe con el tono del brief y con el registro de mi muestra; no copies frases completas de ella.
3. Cada opción tiene una sola llamada a la acción: la del brief, con lo necesario para hacerla.
4. No prometas resultados sobre el cliente o el producto que el brief no afirme.
5. Ajusta el esfuerzo de producción a la frecuencia indicada en el brief.
6. Si el BRIEF se contradice o no alcanza para cumplir su objetivo, no improvises: dímelo antes de escribir y pregúntame.
7. Si el brief trae un [FALTA], mantenlo como [FALTA] en el texto.

### FORMATO DE SALIDA
Para cada opción, en este orden y con estos títulos: OPCIÓN (con su número), Gancho (una frase), Texto (el cuerpo completo, listo para copiar), Llamada a la acción (una frase), Datos del brief usados (una lista), Supuestos que tuve que hacer (una lista, o «ninguno»). Al final, una lista «FALTA» con todos los [FALTA] que aparecieron. Los títulos definen la forma; el contenido sale de mi brief.

### ANTES DE RESPONDER
Verifica que: cada dato de cada opción figura en el BRIEF; cada opción tiene una sola llamada a la acción; ninguna opción promete lo que el brief no dice; todo lo que falta está marcado como [FALTA]; los títulos y su orden se cumplen. Corrige o elimina lo que no cumpla.`,
      explanation: [
        {
          part: "BRIEF (datos que YO te doy; son la única fuente de hechos)",
          why: "Separa los hechos (el brief) del estilo (la muestra de voz), para que no los mezcle.",
        },
        {
          part: "Usa solo los datos del BRIEF… escribe [FALTA: el dato] en su lugar.",
          why: "Es la regla que más protege: un dato ausente queda como hueco marcado, no inventado.",
        },
        {
          part: "Datos del brief usados… Supuestos que tuve que hacer",
          why: "Cada opción llega con su rastro: comparas sus datos con tu brief en segundos.",
        },
      ],
      evaluate: "Puntúa cada opción con la rúbrica, empezando por comparar «Datos del brief usados» con tu brief.",
      improve: "Si las tres se parecen, añade más ejemplos de tu voz o afina el público del brief.",
      warnings: ["Si un dato es aproximado, escríbelo como aproximado: la IA puede tratarlo como exacto si no se lo dices."],
    },

    revision: {
      title: "Prompt de revisión: puntuar con la rúbrica",
      objective: "Que la IA puntúe cada publicación con los seis criterios, con fragmentos literales de apoyo, y liste lo que debes comprobar tú.",
      whenToUse: "Justo después de recibir las opciones, en la misma conversación, para ordenarlas antes de decidir.",
      variables: [{ name: "PUBLICACIONES", description: "Los textos a revisar, cada uno con su número.", example: "Las tres opciones del prompt principal" }],
      prompt: `Actúa como revisor editorial de publicaciones para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá qué se publica. Tu objetivo es puntuar las publicaciones de abajo contra el BRIEF y una rúbrica fija, y señalar lo que la persona debe comprobar. No las reescribas.

### CONTEXTO
Usa el BRIEF que está más arriba en esta conversación. Si no lo encuentras, pídemelo antes de seguir.

### DATOS
Publicaciones que debes revisar:
{{PUBLICACIONES}}

### RÚBRICA (puntúa cada criterio de 0 a 2: 0 = no cumple, 1 = cumple en parte, 2 = cumple)
${LISTA_CRITERIOS}

### REGLAS
1. Puntúa con severidad: si dudas entre dos puntajes, pon el más bajo y explica la duda.
2. Cada puntaje debe apoyarse en un fragmento literal de la publicación, entre comillas. Sin fragmento no hay puntaje: escribe [FALTA: evidencia].
3. Compara cada dato de la publicación (nombres, descuentos, días, fechas, condiciones) con el BRIEF. Un dato que no esté en el BRIEF es un problema del criterio «${CRITERIOS[1].label}».
4. Si ese criterio obtiene 0, marca la publicación como NO PUBLICAR aunque el total sea alto.
5. Si el BRIEF es ambiguo en algo que afecta un puntaje, dilo y pregunta en lugar de decidir tú.
6. Si solo te paso una publicación, no la compares con otras.
7. Aclara que esta revisión es una ayuda: la decisión final y la comprobación de los datos son de la persona.

### FORMATO DE SALIDA
Para cada publicación, en este orden: (1) una tabla con columnas fijas: Criterio | Puntaje (0-2) | Fragmento que lo justifica | Qué cambiar; (2) «Total: N/${MAXIMO}» con su veredicto: «${RESULTADOS[0].label}» (menos de ${RESULTADOS[1].min}), «${RESULTADOS[1].label}» (de ${RESULTADOS[1].min} a ${RESULTADOS[2].min - 1}) o «${RESULTADOS[2].label}» (${RESULTADOS[2].min} o más); (3) «Para comprobar tú»: una lista de cada dato, promesa o permiso que aparece en el texto, indicando si está en el BRIEF o NO está. Si revisaste varias, termina ordenándolas de mayor a menor total. La tabla define la forma; el contenido sale de las publicaciones.

### ANTES DE RESPONDER
Verifica que: cada criterio de cada publicación tiene su puntaje y su fragmento literal; los totales suman bien (máximo ${MAXIMO}); aplicaste NO PUBLICAR donde correspondía; no reescribiste ninguna publicación. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "…No las reescribas.",
          why: "Separa evaluar de corregir: si reescribe a la vez, cambia el texto antes de que decidas qué estaba mal.",
        },
        {
          part: "Cada puntaje debe apoyarse en un fragmento literal de la publicación, entre comillas.",
          why: "Te da algo comprobable: si el fragmento no está en el texto, ese puntaje no merece confianza.",
        },
        {
          part: "Si ese criterio obtiene 0, marca la publicación como NO PUBLICAR…",
          why: "Un total alto no compensa un dato inventado.",
        },
      ],
      evaluate: "Busca en el texto el fragmento de dos puntajes al azar; si no existe, desconfía de la tabla.",
      improve: "Si todo puntúa casi igual, pide más severidad en datos y tono, los que más se regalan.",
      warnings: ["Puede equivocarse al puntuar: repasa tú los criterios de datos y de tono con el brief al lado."],
    },

    tono: {
      title: "Prompt de ajuste: cambiar el tono sin tocar los datos",
      objective: "Que la IA reescriba solo el tono de una publicación y te muestre cada cambio y cada dato que se mantuvo.",
      whenToUse: "Cuando la publicación elegida tiene los datos correctos pero no suena a ti.",
      variables: [
        { name: "PUBLICACION", description: "El texto completo que quieres ajustar.", example: "La opción elegida, con su gancho y su acción" },
        { name: "AJUSTE", description: "Qué quieres cambiar, en concreto.", example: "Que suene a mi muestra, sin frases de publicidad" },
      ],
      prompt: `Actúa como editor de estilo para un negocio pequeño. Tu destinatario es la persona dueña, que quiere que su publicación suene como ella. Tu objetivo es ajustar SOLO el tono de una publicación, sin tocar ningún dato.

### CONTEXTO
Usa el BRIEF y mi muestra de escritura que están más arriba en esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Publicación a ajustar:
{{PUBLICACION}}

Ajuste que quiero:
{{AJUSTE}}

### REGLAS
1. No cambies ningún dato: nombre del negocio, precios, descuentos, días, fechas, condiciones ni la llamada a la acción. Solo cambian palabras, orden y registro.
2. Imita el registro de mi muestra de escritura; no copies frases completas de ella.
3. No añadas información, adjetivos de resultado ni promesas nuevas.
4. Si el ajuste me obligaría a cambiar un dato, o contradice el tono del BRIEF, no lo hagas: explícame el conflicto y pregúntame qué prevalece.
5. Si el ajuste es vago («más bonito»), pídeme que lo concrete antes de escribir.

### FORMATO DE SALIDA
En este orden: (1) «Versión ajustada»: la publicación completa, lista para copiar; (2) «Cambios»: una tabla con columnas fijas Frase original | Frase nueva | Motivo del cambio; (3) «Lo que no cambié»: la lista de datos que se mantienen idénticos. Los títulos definen la forma; el contenido sale de mi publicación.

### ANTES DE RESPONDER
Verifica que: cada dato de la publicación original aparece igual en la versión ajustada; no hay ninguna afirmación nueva; cada frase distinta figura en la tabla de cambios; la llamada a la acción sigue pidiendo la misma acción. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "…ajustar SOLO el tono de una publicación, sin tocar ningún dato.",
          why: "Acota el trabajo a las palabras: sin límite, «hazlo más cercano» puede arrastrar la oferta.",
        },
        {
          part: "Si el ajuste me obligaría a cambiar un dato… pregúntame qué prevalece.",
          why: "Cuando lo que pides choca con un dato, no decide por ti: te lo dice, y el dato se queda como estaba.",
        },
        {
          part: "«Cambios» y «Lo que no cambié»",
          why: "Son las dos listas que necesitas para comprobar: qué se movió y por qué, y qué quedó exactamente igual.",
        },
      ],
      evaluate: "Compara los datos de la original y la ajustada uno por uno: deben ser iguales y figurar en «Lo que no cambié».",
      improve: "Si sigue sin sonar a ti, cambia el ajuste por algo más concreto («frases más cortas»).",
    },

    formatos: {
      title: "Prompt de formatos: adaptar la publicación aprobada",
      objective: "Que la IA lleve la publicación aprobada a cada formato de tu lista sin perder ninguna condición de la oferta.",
      whenToUse: "Cuando la publicación final está aprobada y la necesitas en más de un formato.",
      variables: [
        { name: "PUBLICACION_FINAL", description: "El texto aprobado, con su gancho y su acción.", example: "La publicación tras el ajuste de tono" },
        { name: "FORMATOS", description: "Los formatos que necesitas, separados por punto y coma.", example: "Serie de tres imágenes; mensaje breve" },
        { name: "LIMITES_DEL_CANAL", description: "Límites de longitud o reglas del canal que conoces y comprobaste tú.", example: "No lo sé" },
      ],
      prompt: `Actúa como adaptador de publicaciones para un negocio pequeño. Tu destinatario es la persona dueña, que publicará la misma idea en varios formatos. Tu objetivo es llevar una publicación ya aprobada a cada formato de la lista, conservando todos sus datos.

### CONTEXTO
Usa el BRIEF y mi muestra de escritura que están más arriba en esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Publicación aprobada (única fuente de datos):
{{PUBLICACION_FINAL}}

Formatos que necesito:
{{FORMATOS}}

Límites de longitud o reglas del canal que yo conozco y comprobé:
{{LIMITES_DEL_CANAL}}

### REGLAS
1. Conserva todos los datos de la publicación aprobada: nombre, oferta, días, fechas, condiciones y llamada a la acción. No añadas datos ni promesas.
2. Nunca elimines una condición de la oferta para ganar espacio. Si un formato no puede llevarla completa, dímelo en «No cabe» en lugar de recortarla.
3. Adapta la estructura, no el mensaje: cada formato debe leerse completo por sí solo.
4. En los formatos de varias piezas, cada pieza lleva un texto corto y una sugerencia de qué mostrar; no describas fotos de personas identificables ni uses material ajeno.
5. Si en los límites del canal no hay nada o dice «no lo sé», no supongas límites: indícalo con [FALTA: límite del canal] y sigue.
6. Mantén el tono de la publicación aprobada en todos los formatos.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Formato | Pieza | Texto (listo para copiar) | Qué mostrar (sugerencia); (2) «Datos conservados»: los datos que aparecen en cada formato; (3) «No cabe»: lo que un formato no pudo llevar, o «nada». La tabla define la forma; el contenido sale de mi publicación.

### ANTES DE RESPONDER
Verifica que: cada formato pedido tiene sus filas; todos los datos de la publicación aprobada aparecen en cada formato o están en «No cabe»; ninguna versión añade información nueva; todas piden la misma acción. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Publicación aprobada (única fuente de datos)",
          why: "Adapta desde el texto que ya revisaste, no desde el brief: viajan los datos que verificaste.",
        },
        {
          part: "Nunca elimines una condición de la oferta para ganar espacio… «No cabe»",
          why: "Al acortar, lo primero que se pierde es una condición («solo martes y miércoles»): esta regla obliga a avisarte.",
        },
        {
          part: "Límites de longitud o reglas del canal que yo conozco y comprobé",
          why: "La IA puede desconocer las reglas actuales de tu plataforma: las aportas tú, o dice que no las sabe.",
        },
      ],
      evaluate: "Con «Datos conservados» al lado, comprueba que días, fecha límite y acción estén en cada versión.",
      improve: "Si un formato no admite todas las condiciones, elige otro o simplifica la oferta en tu brief.",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt principal a los datos de Rizo Fino, con tres opciones. La tuya será distinta.",
    parts: [
      {
        type: "text",
        text: "**OPCIÓN 1**\n\n**Gancho:** Los martes y miércoles, Rizo Fino te guarda un rato de calma.\n\n**Texto:** Ven sin prisa: te lavamos el pelo con calma y hay tiempo para conversar. Y esos dos días la hidratación cuesta un 15 % menos.\n\n**Llamada a la acción:** Reserva escribiéndonos «turno» por mensaje.\n\n**Datos del brief usados:** nombre del local; martes y miércoles; hidratación; 15 % de descuento; reserva por mensaje con la palabra «turno».\n\n**Supuestos que tuve que hacer:** ninguno.",
      },
      {
        type: "text",
        text: "**OPCIÓN 2**\n\n**Gancho:** Martes y miércoles: hidratación con 15 % de descuento.\n\n**Texto:** Reserva tu hidratación en Rizo Fino y aprovecha el 15 % de descuento los martes y miércoles, hasta el 31 de octubre. Un momento para ti, sin apuros.\n\n**Llamada a la acción:** Escribe «turno» por mensaje para reservar.\n\n**Datos del brief usados:** nombre del local; hidratación; 15 % de descuento; martes y miércoles; 31 de octubre; reserva solo por mensaje; palabra «turno».\n\n**Supuestos que tuve que hacer:** ninguno.",
      },
      {
        type: "text",
        text: "**OPCIÓN 3**\n\n**Gancho:** ¿Cuándo fue la última vez que te cuidaste el pelo sin correr?\n\n**Texto:** En Rizo Fino tenemos hidratación con 15 % de descuento hasta el 31 de octubre. Te esperamos en [FALTA: dirección o referencia del local], con tiempo para ti.\n\n**Llamada a la acción:** Escribe «turno» por mensaje y te reservamos.\n\n**Datos del brief usados:** nombre del local; hidratación; 15 % de descuento; 31 de octubre; reserva por mensaje; palabra «turno».\n\n**Supuestos que tuve que hacer:** que mencionar el lugar ayuda a los vecinos a ubicar la peluquería.",
      },
      { type: "text", text: "**FALTA:** [FALTA: dirección o referencia del local] (opción 3)." },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "publicaciones",
    title: "Puntúa una publicación",
    intro:
      "Elige una publicación y respóndele a los seis criterios: 0, 1 o 2 puntos cada uno, hasta " +
      MAXIMO +
      " en total. Si el criterio de datos saca 0, no se publica aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.",
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro: "A simple vista las tres opciones son buenas; con el brief al lado, cada una falla en algo distinto.",
    criteria: [
      {
        criterionId: "objetivo",
        verdict: "improve",
        comment: "Las tres invitan a reservar, pero la opción 3 no dice qué días: no ayuda a llenar los martes y miércoles que pide el brief.",
      },
      {
        criterionId: "datos",
        verdict: "risk",
        comment:
          "Ninguna inventó un dato, pero dos recortaron: la opción 1 omite la fecha límite y la 3 omite los días. Solo la 2 lleva todo, y la 3 deja un [FALTA] que hay que resolver o borrar.",
      },
      {
        criterionId: "publico",
        verdict: "ok",
        comment: "Las tres hablan de tú, en un registro que una persona del barrio entendería sin explicación.",
      },
      {
        criterionId: "tono",
        verdict: "improve",
        comment: "La opción 2 suena a folleto: «reserva tu» y «aprovecha» se parecen a la publicidad que el brief pidió evitar.",
      },
      {
        criterionId: "cta",
        verdict: "ok",
        comment: "Las tres piden una sola acción y usan la misma palabra, «turno».",
      },
      {
        criterionId: "formato",
        verdict: "ok",
        comment: "Las tres caben en una imagen con texto: ninguna pasa de cincuenta palabras contando el gancho.",
      },
    ],
    conclusion:
      "Elegimos la opción 2: es la única con todos los datos y su problema, el tono, se corrige sin tocar ninguno. Los datos no se negocian; las palabras, sí.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar es pedir un cambio concreto sobre un resultado casi bueno, no volver a empezar. Aquí solo falla el tono.",
    promptId: "tono",
    why: "Pedir «hazlo más cercano» sin más puede arrastrar la oferta. El prompt obliga a listar cada cambio y lo que no se tocó.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de ajuste aplicado a la opción 2, con el ajuste «que suene a mi muestra, sin frases de publicidad». La tuya será distinta.",
    parts: [
      {
        type: "text",
        text: "**Versión ajustada**\n\n**Gancho:** Martes y miércoles, la hidratación tiene 15 % de descuento.\n\n**Texto:** En Rizo Fino te esperamos los martes y miércoles con 15 % de descuento en la hidratación, hasta el 31 de octubre. Ven con calma: hay tiempo para conversar.\n\n**Llamada a la acción:** Para reservar, escríbenos «turno» por mensaje.",
      },
      {
        type: "table",
        table: {
          caption: "Cambios del ajuste de tono",
          purpose: "Comprobar que lo que se movió son palabras y no datos, y entender por qué se movió cada una.",
          columns: ["Frase original", "Frase nueva", "Motivo del cambio"],
          rows: [
            ["Martes y miércoles: hidratación con 15 % de descuento.", "Martes y miércoles, la hidratación tiene 15 % de descuento.", "Pasa de titular a frase completa, como la muestra."],
            ["Reserva tu hidratación en Rizo Fino y aprovecha el 15 % de descuento…", "En Rizo Fino te esperamos… con 15 % de descuento en la hidratación…", "«Reserva tu» y «aprovecha» suenan a folleto."],
            ["Un momento para ti, sin apuros.", "Ven con calma: hay tiempo para conversar.", "Toma el registro de charla de la muestra."],
            ["Escribe «turno» por mensaje para reservar.", "Para reservar, escríbenos «turno» por mensaje.", "Habla en plural como la muestra; la acción no cambia."],
          ],
        },
      },
      {
        type: "text",
        text: "**Lo que no cambié:** nombre del local, hidratación, 15 %, martes y miércoles, 31 de octubre, la palabra «turno» y la reserva por mensaje.",
      },
    ],
  },

  /* ───────────────────────────── antes y después ───────────────────────────── */
  beforeAfter: {
    before: {
      label: "Pedido sin brief",
      parts: [
        {
          type: "text",
          text: "Respuesta ilustrativa a «Escribe un post para Instagram para mi peluquería»: «¿Cansada de tu cabello opaco? En nuestra peluquería te dejamos el pelo radiante y sedoso. ¡Reserva ya tu cita y luce increíble! #peluqueria #cabello #belleza».",
        },
        {
          type: "list",
          items: ["No dice qué oferta hay, cuándo ni cómo reservar", "Promete resultados que nadie puede asegurar", "Le habla solo a quien tiene un problema supuesto"],
        },
      ],
    },
    after: {
      label: "Con brief, revisión y ajuste",
      parts: [
        {
          type: "text",
          text: "Fragmentos de la publicación final: «Martes y miércoles, la hidratación tiene 15 % de descuento […] hasta el 31 de octubre. […] Para reservar, escríbenos «turno» por mensaje.»",
        },
        {
          type: "list",
          items: ["Dice qué, cuándo y hasta cuándo", "No promete nada sobre el cabello", "Pide una sola acción con su palabra clave"],
        },
      ],
    },
    takeaway: "La diferencia no es de estilo: la segunda sale de siete decisiones que tomaste tú; la primera, de las que la IA tuvo que suponer.",
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Pedir el texto sin escribir el brief",
      whyItHurts: "La IA rellena los huecos con lo habitual del rubro y puede incluir lo que no dijiste.",
      instead: "Completa los siete campos antes de pedir nada; si no sabes alguno, usa la entrevista.",
    },
    {
      title: "Pegar datos aproximados como exactos",
      whyItHurts: "«Más o menos un 15 %» puede salir como un 15 % firme, y luego debes cumplirlo.",
      instead: "Escribe cada cifra y cada fecha tal como la decidiste, o marca el campo como «no lo sé».",
    },
    {
      title: "Quedarte con la primera opción",
      whyItHurts: "La primera suele ser la que mejor suena, no la que mejor cumple el brief.",
      instead: "Pide tres opciones y puntúalas con la misma rúbrica antes de elegir.",
    },
    {
      title: "Pedir «hazlo más vendedor»",
      whyItHurts: "Empuja hacia verbos de publicidad y promesas que quizá no puedes cumplir.",
      instead: "Pide un ajuste concreto («frases más cortas») con el prompt de ajuste y revisa la tabla de cambios.",
    },
    {
      title: "Copiar el mismo texto en todos los formatos",
      whyItHurts: "Un texto pensado para una imagen sobra en un mensaje; al recortarlo a mano, se pierde una condición.",
      instead: "Adapta cada formato con el prompt de formatos y revisa qué quedó en «No cabe».",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Con la publicación final y tu oferta al lado, marca cada punto cuando lo hayas comprobado.",
    items: [
      { label: "Cada precio, descuento, día, fecha y condición coincide con lo que tú decidiste.", detail: "Compáralo con tu oferta, no con el texto de la IA." },
      { label: "No queda ningún [FALTA] sin resolver ni sin borrar." },
      { label: "Ninguna frase promete un resultado que no puedes cumplir." },
      { label: "Tienes permiso para todo lo que aparece: nombres, marcas, fotos, música y textos de otras personas." },
      { label: "La acción funciona: alguien atiende ese canal y sabe qué hacer cuando llegue la palabra clave." },
      { label: "Cumple las reglas de la plataforma y las normas de publicidad de tu país.", detail: "Varían según el lugar; esta guía no las cubre." },
      { label: "La leíste completa en el formato final, tal como se verá." },
    ],
    principle: "La IA redacta y ayuda a revisar. La persona verifica y decide.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Tras la primera publicación, lo que sigue es que el proceso dure: la segunda vez casi todo ya está escrito.",
    steps: [
      { title: "Convierte tu brief en plantilla", detail: "Cada semana cambia solo lo que cambió: la oferta, las fechas o el objetivo." },
      { title: "Guarda las publicaciones que te gustaron", detail: "Tus versiones finales son las mejores muestras de voz." },
      { title: "Anota qué pasó después de publicar", detail: "Una línea por publicación: cuántos mensajes con la palabra clave llegaron." },
      { title: "Revisa el mes y ajusta un campo", detail: "Cambia un solo campo a la vez, para saber qué hizo la diferencia." },
      { title: "Retira lo vencido", detail: "Cuando termine una oferta, no reutilices sus textos: una fecha vieja genera reclamos." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena tu forma de pedir textos, pero tiene límites.",
    items: [
      { title: "No conoce tus resultados", detail: "La IA no ve qué publicaciones te trajeron clientes y puede desconocer cómo funciona hoy cada plataforma." },
      { title: "Puede inventar datos", detail: "Aunque el prompt lo prohíba, puede añadir una cifra, una fecha o una promesa: los datos se comprueban contra tu decisión." },
      { title: "No decide qué publicar", detail: "Parte de una idea ya elegida." },
      { title: "No diseña la imagen ni programa la publicación", detail: "Sugiere qué mostrar, pero no produce imágenes ni decide cuándo publicar." },
      { title: "No sustituye las normas de publicidad", detail: "Las reglas sobre promociones e imágenes dependen de tu país y de la plataforma." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Una publicación que suena a tu negocio no sale de una frase ingeniosa en el prompt, sino de las decisiones que tomaste antes de pedirla. El brief las reúne, la IA las convierte en texto y tú compruebas que dice lo que decidiste.",
    takeaways: [
      "El brief son siete decisiones; lo que dejes vacío lo rellena la IA con lo habitual.",
      "Pide tres opciones y puntúalas siempre con la misma rúbrica.",
      "El tono se ajusta; la oferta no.",
      "Cada formato se adapta desde la publicación ya aprobada.",
    ],
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["prompt", "asistente-ia", "dato-inventado", "brief", "voz-de-marca", "formato", "llamada-a-la-accion", "gancho", "variable", "rubrica"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Puedo usar el mismo brief para todas mis redes?",
      answer: "Sí, como base: el formato y a veces el tono cambian de una red a otra. Adapta el resto con el prompt de formatos.",
    },
    {
      question: "¿Qué hago si no tengo textos míos como muestra de voz?",
      answer: "Usa mensajes que hayas escrito a clientes: también sirven. Si no tienes nada, describe tu tono con tres adjetivos; el resultado será más genérico y conviene ajustarlo más.",
    },
    {
      question: "¿Sirve con cualquier asistente de IA?",
      answer: "Están escritos para cualquier asistente de chat, pero cada uno responde a su manera y puede equivocarse: por eso el método termina en tu verificación.",
    },
    {
      question: "¿Le puedo pedir hashtags o la mejor hora para publicar?",
      answer: "Los hashtags, aparte y verificando cada uno. La hora no: salvo que se las pases, la IA no ve las estadísticas de tu cuenta; mira las tuyas.",
    },
  ],
});
