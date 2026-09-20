import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * marketing/crear-anuncios-con-ia
 *
 * Tipo: comunicación, con una parte de decisión (probar dos versiones). Todo el caso (la Ferretería
 * Casa y Clavo, su oferta, sus datos y su dirección) es FICTICIO. Las respuestas de la IA son EJEMPLOS
 * GENERADOS: están redactadas aplicando literalmente cada prompt a los datos del caso; no proceden de
 * una conversación real ni de una prueba del autor. Las pruebas reales viven en `evidence.pruebas`,
 * que solo rellena el autor. La guía no cita datos externos que caduquen: no afirma nada sobre las
 * reglas, los límites ni el rendimiento de una plataforma concreta.
 *
 * Fuente única de verdad: los campos de la ficha (CAMPOS_FICHA), los criterios de la rúbrica (CRITERIOS),
 * los umbrales (RESULTADOS), los tipos de afirmación (TIPOS) y los datos del caso (CASO) se definen una
 * vez y los leen la plantilla, la rúbrica, el análisis y los prompts.
 */
const slot = guideSlots("marketing", "crear-anuncios-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const CAMPOS_FICHA = [
  { id: "oferta", campo: "Negocio y oferta", fill: "Cómo se llama tu negocio, qué vendes y a qué precio o descuento." },
  { id: "condiciones", campo: "Condiciones", fill: "Días, horarios, vigencia, cantidad limitada, exclusiones y cómo se accede." },
  { id: "publico", campo: "Público y zona", fill: "A quién le hablas (alguien que aún no te conoce) y dónde vive o trabaja." },
  { id: "beneficio", campo: "Beneficio verificable", fill: "Lo que gana el cliente y tú puedes cumplir, sin prometer resultados." },
  { id: "respaldo", campo: "Respaldo real", fill: "Algo verdadero que apoye el anuncio: años de trayectoria, garantía, políticas. Si no tienes, déjalo vacío." },
  { id: "accion", campo: "Acción y ubicación", fill: "La única acción que debe hacer quien lo ve, y dónde queda tu negocio." },
  { id: "tono", campo: "Tono y límites", fill: "Cómo suena tu negocio y qué no se debe decir ni prometer." },
] as const;

const CRITERIOS = [
  { id: "entiende", label: "Se entiende sin conocerte", detail: "Quien no conoce el negocio sabe qué vende, para quién y dónde está." },
  { id: "oferta", label: "Oferta completa", detail: "Dice qué, cuánto, cuándo y dónde, con todas sus condiciones." },
  { id: "beneficio", label: "Beneficio sin promesa", detail: "Explica lo que gana el cliente sin prometer un resultado que no controlas." },
  { id: "respaldo", label: "Afirmaciones respaldadas", detail: "Cada dato o cualidad que menciona está en la ficha." },
  { id: "accion", label: "Una acción clara", detail: "Pide una sola acción y dice cómo hacerla." },
  { id: "canal", label: "Cabe en su canal", detail: "Su largo y su estructura son los del canal donde se publica." },
] as const;

const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Falla en varios criterios: revisa qué campo de la ficha estaba flojo." },
  { min: 7, label: "Ajustar", advice: "Sirve de base: mejora primero el criterio con menos puntos." },
  { min: 10, label: "Lista para verificar", advice: "Cumple casi todo: pasa a la revisión de afirmaciones." },
] as const;

const TIPOS = ["Dato de la oferta", "Condición", "Servicio o cualidad", "Ubicación", "Promesa de resultado", "Superlativo o comparación", "Urgencia o escasez"] as const;

const CASO = {
  oferta: "Ferretería Casa y Clavo: 20 % de descuento en herramientas manuales (martillos, destornilladores, alicates y llaves).",
  condiciones: "Solo el sábado 10 de octubre y de 9:00 a 14:00, en el local. Hasta agotar stock por producto. No acumulable con otras ofertas.",
  publico: "Personas del barrio Las Acacias que hacen arreglos en casa y todavía no conocen la ferretería.",
  beneficio: "Encuentras herramientas manuales de varias marcas en un solo local y te asesoramos para elegir la adecuada.",
  respaldo: "12 años atendiendo en el mismo local.",
  accion: "Pasar por el local el sábado. Dirección: calle Los Pinos con calle 5",
  tono: "Directo y cercano, sin exageraciones. No decir «los mejores precios», no prometer resultados y no hablar de otras ferreterías.",
} as const;

const LISTA_TIPOS = TIPOS.map((t, i) => `${i + 1}. ${t}`).join("\n");
const MAXIMO = CRITERIOS.length * 2;

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "crear-anuncios-con-ia",
    category: "marketing",
    title: "Crear anuncios para tu negocio con IA",
    description:
      "Aprende a preparar la ficha de un anuncio, pedirle el texto a la IA, comprobar cada afirmación y probar dos versiones para redes sociales y mensajería.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["comunicacion-atencion", "decision-comparacion"],
    estandarGuia: 3,
    activoOriginal: "Ficha de anuncio de siete campos (se copia como tabla), rúbrica de seis criterios con umbrales y hoja de afirmaciones para comprobar cada frase del anuncio",
    problem: "Necesitas promocionar una oferta de tu negocio y no sabes cómo comunicarla de forma clara y atractiva.",
    whyThisPage:
      "Es la tarea de marketing más frecuente de un negocio pequeño y la que más se malogra con pedidos vagos; esta guía enseña a construir el brief del anuncio y a adaptarlo a cada canal.",
    relatedGuides: ["crear-promociones-con-ia", "crear-afiches-con-ia", "crear-publicaciones-para-redes-sociales-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Un anuncio llega a personas que no te conocen y debe bastarse solo. Prepara la ficha, pide dos enfoques, refuerza la persuasión con datos verdaderos, adáptalo a cada canal y comprueba cada afirmación antes de publicar.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de una hora y media la primera vez; después, unos 30 minutos por anuncio",
    needs: ["Un asistente de IA de chat", "Los datos exactos de tu oferta y sus condiciones", "Algo verdadero que respalde el anuncio, si lo tienes"],
    result: "Un anuncio verificado, adaptado a cada canal, con dos versiones listas para probar",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Muestra de un vistazo el método: la ficha con los datos de la oferta y, al lado, el anuncio final que solo dice lo que la ficha dice.",
      description:
        "A la izquierda, la ficha del anuncio completa (caso ficticio de una ferretería). A la derecha, el anuncio final en una tarjeta con imagen y texto. Unir con una línea las condiciones de la ficha con la frase del anuncio que las contiene. Sin logotipos reales ni datos de personas.",
      alt: "Una ficha de anuncio completa de una ferretería y, a su lado, el anuncio final con una línea que une las condiciones de la ficha con su frase.",
      caption: "Cada frase del anuncio se apoya en la ficha.",
    }),
    ficha: slot("ficha-completa.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña cómo se ve la ficha rellena, para que el lector sepa qué nivel de detalle poner en cada campo antes de hablar con la IA.",
      description:
        "La plantilla de la ficha pegada en una hoja de cálculo, con las siete filas y la columna «Tu respuesta» completa con el caso ficticio. Resaltar la fila de condiciones. Sin datos personales.",
      alt: "Hoja de cálculo con la ficha del anuncio de siete campos rellena para una ferretería ficticia.",
      caption: "La ficha completa: una fila por dato.",
      zoom: true,
    }),
    dosEnfoques: slot("dos-enfoques.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver cómo llegan las dos versiones y comprobar, línea por línea, qué dato de la ficha usó cada una.",
      description:
        "La primera respuesta del asistente con las dos versiones y sus listas «Datos de la ficha usados» y «Supuestos». Marcar con un recuadro el gancho genérico de la primera y la frase sobre la trayectoria de la segunda. Caso ficticio, sin datos de cuenta.",
      alt: "Dos versiones de un anuncio con sus listas de datos usados, con recuadros sobre un gancho genérico y una frase de trayectoria.",
      caption: "La primera respuesta, sin editar.",
      zoom: true,
    }),
    rubrica: slot("rubrica-aplicada.webp", {
      section: "analisis",
      ratio: "4/3",
      purpose: "Enseña cómo se puntúa un anuncio con los seis criterios, con un ejemplo hecho que el lector puede imitar.",
      description:
        "Una tabla con los seis criterios, un puntaje de 0, 1 o 2 en cada uno y el total sobre 12, aplicada a la primera versión del caso. Resaltar la fila «Afirmaciones respaldadas». Datos ficticios.",
      alt: "Tabla de puntuación de un anuncio con seis criterios y el total sobre 12.",
      caption: "Un anuncio puntuado con la rúbrica.",
      zoom: true,
    }),
    persuasion: slot("persuasion-con-respaldo.webp", {
      section: "iteracion",
      ratio: "16/9",
      purpose: "Muestra qué cambia al reforzar la urgencia real y de qué dato de la ficha se apoya cada cambio.",
      description:
        "La tabla «Cambios» del refuerzo, con frase original, frase nueva, palanca y dato de la ficha, y debajo «Lo que no cambié». Resaltar con un mismo color la condición de la ficha y la frase nueva que la usa. Caso ficticio.",
      alt: "Tabla de cambios de un anuncio con la frase original, la nueva, la palanca y el dato de la ficha que la respalda.",
      caption: "Cada frase nueva cita su respaldo.",
      zoom: true,
    }),
    canales: slot("canales.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Deja ver cómo el mismo anuncio cambia según a quién llega, sin perder la oferta ni sus condiciones.",
      description:
        "Tres piezas lado a lado: el texto sobre una imagen, el texto del anuncio en una red social y un mensaje directo. Resaltar en las tres las mismas condiciones de la oferta. Caso ficticio, con [NOMBRE] en el mensaje.",
      alt: "El mismo anuncio en tres piezas: texto sobre imagen, texto de anuncio y mensaje directo, con las condiciones resaltadas.",
      caption: "Un anuncio, tres piezas, las mismas condiciones.",
      zoom: true,
    }),
    afirmaciones: slot("hoja-de-afirmaciones.webp", {
      section: "verificacion",
      ratio: "16/9",
      purpose: "Enseña la hoja de afirmaciones ya completa, que es la herramienta para comprobar el anuncio frase por frase.",
      description:
        "La hoja de afirmaciones del anuncio final en una hoja de cálculo, con las columnas afirmación, tipo, si está en la ficha y qué comprobar. Resaltar la columna de lo que debe comprobar la persona. Caso ficticio.",
      alt: "Hoja de cálculo con las afirmaciones de un anuncio, su tipo, si están en la ficha y qué debe comprobar la persona.",
      caption: "La hoja de afirmaciones del anuncio final.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "anuncio",
      purpose: "Prueba real del prompt principal: las dos versiones que devolvió con una ficha real.",
      description:
        "Captura de la respuesta con las dos versiones, sus datos usados y supuestos. Usar la ficha del caso o la de tu negocio real. Ocultar datos personales y de cuenta.",
      alt: "Captura de las dos versiones de un anuncio devueltas por un asistente.",
      caption: "Prueba del prompt de anuncio.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "persuasion",
      purpose: "Prueba real del prompt de refuerzo: la versión reforzada y su tabla de cambios.",
      description:
        "Captura de la versión reforzada, la tabla de cambios, lo que no cambió y «Para revisar». Ocultar datos personales y de cuenta.",
      alt: "Captura del refuerzo de un anuncio con su tabla de cambios.",
      caption: "Prueba del prompt de persuasión.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "canales",
      purpose: "Prueba real del prompt de canales: la tabla por canal y las listas de datos conservados y de lo que no cabe.",
      description:
        "Captura de la respuesta con la tabla de canales, «Datos conservados» y «No cabe». Ocultar datos personales y de cuenta.",
      alt: "Captura de la adaptación de un anuncio a varios canales.",
      caption: "Prueba del prompt de canales.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "medicion",
      ratio: "16/9",
      promptId: "variantes",
      purpose: "Prueba real del prompt de variantes: la versión B, la hipótesis y las condiciones para comparar.",
      description:
        "Captura de la tabla con las versiones A y B, la hipótesis, la señal a observar y las listas de lo que se mantiene igual y de cuándo no se puede concluir. Ocultar datos personales y de cuenta.",
      alt: "Captura de una prueba A/B de un anuncio con su hipótesis y sus condiciones.",
      caption: "Prueba del prompt de variantes.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "verificacion",
      ratio: "16/9",
      promptId: "afirmaciones",
      purpose: "Prueba real del prompt de afirmaciones: la tabla de afirmaciones, las condiciones ausentes y el veredicto.",
      description:
        "Captura de la tabla de afirmaciones, la lista de condiciones que faltan y el veredicto. Ocultar datos personales y de cuenta.",
      alt: "Captura de la revisión de afirmaciones de un anuncio con su veredicto.",
      caption: "Prueba del prompt de afirmaciones.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Promocionar una oferta parece sencillo: cuentas el descuento y esperas que llegue gente. Pero un anuncio se muestra a personas que no te conocen y no te preguntarán nada: si falta una condición o suena exagerado, no hay quien lo aclare.\n\nSi le pides a un asistente «hazme un anuncio», debe suponer qué ofreces, con qué condiciones y a quién. Suele rellenar con lo habitual: superlativos, prisa y promesas que nadie comprobó. Un anuncio con datos inventados atrae a quien luego reclama.\n\nLa IA redacta rápido, pero no conoce tu oferta ni tu stock. **Los datos se escriben antes, en una ficha, y cada frase del anuncio se comprueba contra ella.**",
    symptoms: [
      "El anuncio suena a cualquier otro negocio, con frases como «los mejores precios».",
      "Sale un descuento, una fecha o una promesa que tú no diste.",
      "Alguien llega esperando la oferta sin la condición que faltaba.",
      "Le pides «más persuasivo» y aparece prisa que no existe.",
      "Tienes dos anuncios y no sabes cuál funcionó ni por qué.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con un anuncio comprobado frase por frase, adaptado a cada canal y con una prueba de dos versiones preparada.",
    deliverables: [
      { label: "Una ficha de anuncio", detail: "Siete campos con tus datos, en una plantilla que copias como tabla." },
      { label: "Dos versiones con enfoques distintos", detail: "Con los datos que usó cada una." },
      { label: "Una rúbrica y una hoja de afirmaciones", detail: "Para puntuar un anuncio y comprobar cada frase, siempre igual." },
      { label: "Un anuncio por canal", detail: "Sin perder ninguna condición." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes un negocio local y quieres anunciar una oferta en redes sociales o por mensajería.",
      "Sabes qué ofreces y en qué condiciones, aunque nunca lo hayas escrito.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Todavía no decidiste la oferta: esta guía parte de una ya definida.",
      "Buscas configurar la campaña, el presupuesto o el público de la plataforma: eso se hace allí.",
      "Esperas un anuncio que «convierta» seguro: nadie puede asegurarlo y esta guía no lo promete.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Ferretería Casa y Clavo (ficticia)",
    situation:
      "Casa y Clavo es una ferretería de barrio con tres personas en el mostrador. Quiere una jornada de descuento para que la conozcan vecinos que nunca han entrado.",
    goal: "Que personas del barrio pasen por el local el sábado de la oferta.",
    data: [...CAMPOS_FICHA.map((c) => ({ label: c.campo, value: CASO[c.id] }))],
    problem: "Los textos de la IA le sueltan superlativos, prisa y frases que ella no dijo, y a veces dejan fuera condiciones.",
    application: "Completa la ficha, pide dos versiones, las puntúa, refuerza la elegida, la adapta y comprueba cada afirmación.",
    result: "Un anuncio con la oferta completa y sin afirmaciones sin respaldo.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Seis ideas ordenan todo lo que sigue. Con ellas, el resto se lee sin tropezar; sin ellas, cualquier texto parece igual de bueno.",
    blocks: [
      {
        title: "Un anuncio llega a quien no te conoce",
        detail: "Nadie te preguntará qué eres ni dónde estás. El texto debe decir qué es el negocio, qué ofrece y dónde queda.",
      },
      {
        title: "La oferta se cuenta completa",
        detail: "Precio o descuento, fechas, horarios, cantidad y exclusiones. Una oferta recortada parece otra distinta.",
      },
      {
        title: "Beneficio, no promesa",
        detail: "Un beneficio es lo que el cliente gana y el negocio cumple; una promesa es un resultado que no controlas («quedará perfecto»).",
      },
      {
        title: "Solo respaldo real",
        detail: "Un año de trayectoria o una garantía respaldan el anuncio solo si son ciertos y los puedes mostrar. Sin respaldo, se omite.",
      },
      {
        title: "Persuadir con lo verdadero",
        detail: "La prisa es legítima si existe: una fecha límite, un horario, un stock real. Una escasez inventada («últimas unidades») desgasta la confianza.",
      },
      {
        title: "Probar de a una cosa",
        detail: "Si dos versiones cambian varias cosas, no sabrás cuál produjo la diferencia. Cambia un solo elemento y compara con justicia.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Hazme un anuncio para mi ferretería.",
    whyInsufficient:
      "Con esa frase el asistente no sabe qué ofreces, a quién ni con qué condiciones. Lo habitual es que rellene con algo como «¡Las mejores herramientas al mejor precio! ¡Ven ya y no te lo pierdas!» (ejemplo ilustrativo): superlativos y prisa que nadie comprobó y ni una condición.",
    issues: [
      "No dice qué se ofrece, cuándo ni dónde.",
      "Incluye superlativos y prisa que no puedes demostrar.",
      "No se entiende si no conoces el negocio.",
      "No hay cómo saber de dónde salió cada frase.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Antes de completar la ficha reúne lo que solo tú tienes.",
    items: [
      { label: "La oferta exacta", detail: "Precio o descuento, productos incluidos, fechas, horarios, stock y exclusiones, tal como los decidiste.", required: true },
      { label: "Quién la verá", detail: "Personas que aún no te conocen, y la zona donde viven o trabajan.", required: true },
      { label: "El respaldo que puedes mostrar", detail: "Años de trayectoria, garantías o políticas ciertas. Si no tienes, sigue sin él.", required: false },
      { label: "Lo que no dirás", detail: "Promesas, comparaciones con otros negocios y frases que suenen a exageración.", required: true },
      { label: "Dónde responderás", detail: "El lugar o el canal donde atenderás a quien llegue, y quién lo atenderá ese día.", required: true },
      { label: "Tus reglas del canal", detail: "Sus límites de largo y de imagen. Compruébalos en la plataforma: cambian.", required: false },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ficha: {
      caption: "Plantilla de ficha de anuncio",
      purpose: "Tener en una hoja los datos del anuncio, para copiarla, completarla y pegarla en el prompt en vez de pedir un texto a ciegas.",
      columns: ["Campo", "Qué escribir", "Tu respuesta"],
      rows: CAMPOS_FICHA.map((c) => [c.campo, c.fill, "(escribe aquí)"]),
      note: "Si no sabes un campo, escribe «no lo sé»: la IA lo marcará como falta en lugar de rellenarlo.",
      copyable: true,
    },
    canales: {
      caption: "Qué cambia según el canal",
      purpose: "Decidir qué ajustar de un mismo anuncio según a quién llega, sin cambiar la oferta.",
      columns: ["Canal", "A quién llega", "Qué cambia", "Qué cuidar"],
      rows: [
        ["Anuncio en una red social", "Personas que no te conocen", "Presenta el negocio y dice dónde está", "Que el texto se entienda solo, con todas las condiciones"],
        ["Texto sobre la imagen", "Quien la ve de pasada", "Solo el gancho y la oferta", "Que las condiciones sigan visibles en el texto del anuncio"],
        ["Mensaje directo", "Contactos que ya te conocen", "Saluda con su nombre y no explica qué es el negocio", "Enviarlo solo a quienes aceptaron recibirlo"],
      ],
      note: "Los límites de largo y de imagen de cada canal cambian con el tiempo: consúltalos en su ayuda.",
    },
    adaptaciones: {
      caption: "Anuncio final adaptado a cada canal",
      purpose: "Ver cómo el mismo anuncio cambia de forma según el canal y comprobar que la oferta y sus condiciones siguen en todos.",
      columns: ["Canal", "Texto (listo para copiar)", "Qué cambió respecto al anuncio", "Qué mostrar (sugerencia)"],
      rows: [
        ["Texto sobre la imagen", "Solo este sábado: 20 % en herramientas manuales", "Solo el gancho, en grande", "Una foto de herramientas del local, sin personas identificables."],
        [
          "Mensaje directo",
          "Hola [NOMBRE], te aviso de una jornada en Ferretería Casa y Clavo: el sábado 10 de octubre, de 9:00 a 14:00, herramientas manuales con 20 % de descuento. Hasta agotar stock por producto; no acumulable con otras ofertas. Estamos en calle Los Pinos con calle 5. Pasa por el local.",
          "Saludo con nombre; no explica qué es el negocio",
          "Nada: es solo texto.",
        ],
      ],
      note: "Ejemplo generado. El anuncio para la red social queda igual que la versión final. Datos conservados: nombre, oferta, fecha, horario, condiciones, ubicación y acción. No cabe: nada.",
    },
    variantes: {
      caption: "Dos versiones del gancho para probar",
      purpose: "Ver cómo se prepara una prueba en la que solo cambia una cosa y qué hay que mantener igual para compararla.",
      columns: ["Elemento", "Versión A", "Versión B", "Hipótesis", "Señal a observar"],
      rows: [
        [
          "Gancho",
          "Solo este sábado: 20 % en herramientas manuales.",
          "¿Qué herramienta te falta en casa? Este sábado, 20 % de descuento en herramientas manuales.",
          "Podría ser que una pregunta inicial invite a leer el resto; con una sola prueba no se sabe.",
          "Personas que, al llegar al local, dicen qué versión vieron.",
        ],
      ],
      note: "Ejemplo generado. Se mantiene igual: texto, oferta, condiciones, ubicación, acción, imagen, canal y hora de publicación. Cómo comparar: publicar ambas a la vez y contar la señal igual para las dos. No se puede concluir si llegan muy pocas personas, si salieron en momentos distintos o si cambió algo más.",
    },
    afirmaciones: {
      caption: "Hoja de afirmaciones del anuncio final",
      purpose: "Comprobar cada frase del anuncio contra la ficha y ver qué debe confirmar la persona antes de publicar.",
      columns: ["Afirmación", "Tipo", "¿En la ficha?", "Qué debe comprobar la persona"],
      rows: [
        ["«Solo este sábado» y «el sábado 10 de octubre, de 9:00 a 14:00»", "Condición", "Sí", "Que el local abra en ese horario ese día."],
        ["«20 % en herramientas manuales»", "Dato de la oferta", "Sí", "Que el descuento alcance a todas las herramientas manuales, o listar excepciones."],
        ["«herramientas manuales de varias marcas en un solo lugar»", "Servicio o cualidad", "Sí", "Que haya varias marcas en stock ese día."],
        ["«Te asesoramos para elegir la adecuada»", "Servicio o cualidad", "Sí", "Que haya alguien que asesore ese sábado."],
        ["«hasta agotar stock por producto» y «no acumulable con otras ofertas»", "Condición", "Sí", "Nada más: son condiciones de la ficha."],
        ["«calle Los Pinos con calle 5»", "Ubicación", "Sí", "Que la dirección sea correcta."],
      ],
      copyable: true,
      note: "Ejemplo generado. Condiciones de la ficha que faltan en el anuncio: ninguna. Veredicto: SIN HALLAZGOS EN LA FICHA; quedan por comprobar los puntos de la última columna. Esta hoja compara con la ficha; que la ficha sea cierta lo comprueba la persona.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene con un prompt en cinco de los seis pasos; el primero, reunir tus datos, es solo tuyo. La comprobación de los datos es tuya en todos.",
    steps: [
      {
        title: "Reúne tus datos y completa la ficha",
        description: "Escribe la oferta con sus condiciones, a quién le hablas, tu respaldo real y tu acción. Si un campo no lo sabes, escribe «no lo sé».",
        output: "Una ficha con campos completos o marcados.",
      },
      {
        title: "Pide dos versiones y puntúalas",
        description: "Pega la ficha y dos enfoques distintos en el prompt principal. Puntúa cada versión con la rúbrica: si «Afirmaciones respaldadas» saca 0, esa versión no se publica.",
        output: "Una versión elegida.",
      },
      {
        title: "Refuerza la persuasión con datos verdaderos",
        description: "Elige una palanca (urgencia real, claridad del beneficio o menos fricción) y pide reforzarla apoyándote en la ficha.",
        output: "Un anuncio más convincente, con cada cambio respaldado.",
      },
      {
        title: "Adáptalo a cada canal",
        description: "Lleva el anuncio a los canales donde lo vas a usar, según a quién llega cada uno.",
        output: "Una pieza por canal.",
      },
      {
        title: "Prepara dos versiones para probar",
        description: "Cambia un solo elemento y define qué mirar antes de publicar.",
        output: "Versiones A y B con su plan de comparación.",
      },
      {
        title: "Comprueba cada afirmación y publica",
        description: "Pide la hoja de afirmaciones de lo que vas a publicar y confirma tú lo que ella no puede saber.",
        output: "Anuncios comprobados por ti.",
      },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    anuncio: {
      title: "Prompt principal: dos versiones de un anuncio",
      objective: "Obtener una versión del anuncio por cada enfoque que pidas, escritas solo con los datos de tu ficha.",
      whenToUse: "Cuando la ficha está completa y sabes qué enfoques quieres comparar.",
      variables: [
        { name: "FICHA", description: "La tabla de la ficha completa, campo por campo.", example: "La ficha rellena del caso" },
        { name: "ENFOQUES", description: "Un enfoque por versión, numerados.", example: "1) el beneficio para el cliente; 2) la oferta y su fecha" },
        { name: "CANAL", description: "Dónde se publicará la versión principal.", example: "Anuncio en una red social, con una imagen" },
      ],
      prompt: `Actúa como redactor de anuncios para un negocio pequeño. Tu destinatario es alguien que todavía no conoce el negocio y verá el anuncio sin ningún otro contexto. Tu objetivo es escribir una versión del mismo anuncio por cada enfoque que te indico, sin salirte de los datos de la ficha.

### FICHA (datos que YO te doy; son la única fuente de hechos)
{{FICHA}}

### ENFOQUES QUE QUIERO (una versión por cada uno)
{{ENFOQUES}}

### CANAL PRINCIPAL
{{CANAL}}

### REGLAS
1. Usa solo datos de la FICHA. No inventes precios, cantidades, plazos, cualidades, opiniones de clientes ni datos del negocio. Si necesitas un dato que falta, escribe [FALTA: el dato].
2. Si falta la oferta, sus condiciones o la acción, no escribas ningún anuncio: dime qué falta y pregúntame.
3. Copia las cifras, fechas, horarios y condiciones tal como están en la ficha; no las resumas ni las redondees.
4. El texto debe entenderse sin conocer el negocio: di qué es, qué ofrece y dónde está.
5. Pide una sola acción, la de la ficha, con lo necesario para hacerla.
6. No prometas resultados, no uses superlativos ni comparaciones con otros negocios y no crees escasez o prisa que la ficha no indique.
7. Adapta el largo y la estructura al canal; si no conoces sus límites, no los supongas.
8. Si la ficha se contradice, dímelo antes de escribir.

### FORMATO DE SALIDA
Para cada versión, con estos títulos y en este orden: ANUNCIO (con su número y su enfoque), Gancho (una frase), Texto (completo, listo para copiar), Llamada a la acción (una frase), Datos de la ficha usados (una lista), Supuestos que tuve que hacer (una lista, o «ninguno»). Al final, una lista «FALTA» con cada [FALTA]. Los títulos definen la forma; el contenido sale de mi ficha.

### ANTES DE RESPONDER
Verifica que: cada dato de cada versión está en la FICHA; las cifras, fechas y condiciones coinciden con ella; el texto dice qué es el negocio y dónde está; hay una sola acción; no hay promesas, superlativos ni comparaciones; todo lo que falta está marcado como [FALTA]. Corrige o elimina lo que no cumpla.`,
      explanation: [
        {
          part: "Tu destinatario es alguien que todavía no conoce el negocio…",
          why: "Fija para quién se escribe: el anuncio debe bastarse solo, sin que el lector sepa quién eres.",
        },
        {
          part: "FICHA (datos que YO te doy; son la única fuente de hechos)",
          why: "Separa los hechos de la redacción: lo que no está en la ficha no puede aparecer como dato.",
        },
        {
          part: "Copia las cifras, fechas, horarios y condiciones… no las resumas",
          why: "Es donde más se recorta sin querer: una condición resumida se convierte en otra oferta.",
        },
      ],
      evaluate: "Puntúa cada versión con la rúbrica y compara «Datos de la ficha usados» con tu ficha.",
      improve: "Si las dos versiones se parecen, cambia los enfoques por otros más distintos; pedir más versiones no lo arregla.",
      warnings: ["Anota como aproximado lo que lo sea: si no, la IA puede presentarlo como exacto."],
    },

    persuasion: {
      title: "Prompt de refuerzo: persuadir con datos verdaderos",
      objective: "Que la IA refuerce una sola palanca de persuasión del anuncio, apoyando cada cambio en un dato de la ficha.",
      whenToUse: "Cuando el anuncio elegido está completo y correcto, pero no convence lo suficiente.",
      variables: [
        { name: "ANUNCIO", description: "El anuncio completo que quieres reforzar.", example: "La versión elegida, con gancho, texto y acción" },
        { name: "PALANCA", description: "Una de tres: urgencia real, claridad del beneficio o menos fricción.", example: "Urgencia real: llevar el día al gancho" },
      ],
      prompt: `Actúa como editor de anuncios para un negocio pequeño. Tu destinatario es la persona dueña, que quiere un anuncio más convincente sin perder veracidad. Tu objetivo es reforzar UNA palanca de persuasión del anuncio, apoyándote solo en datos de la ficha.

### CONTEXTO
Usa la FICHA que está más arriba en esta conversación. Si no la encuentras, pídemela antes de seguir.

### DATOS
Anuncio a reforzar:
{{ANUNCIO}}

Palanca que quiero reforzar:
{{PALANCA}}

### REGLAS
1. Refuerza solo una de estas palancas: urgencia real (una fecha, un horario o un stock que la ficha indique), claridad del beneficio o menos fricción para actuar. Si mi palanca es otra o es vaga, pídeme que elija una.
2. Cada frase nueva debe apoyarse en un dato de la ficha. Si no puedes decir en cuál, no la escribas: no inventes.
3. No cambies cifras, fechas, condiciones ni la acción.
4. No crees escasez ni prisa que la ficha no indique, ni superlativos, promesas o comparaciones.
5. Si el anuncio ya contiene una promesa, un superlativo o una afirmación sin dato en la ficha, no la repitas: señálala en «Para revisar».
6. Si mi palanca exigiría inventar algo, dímelo y propón la palanca más cercana que sí se apoye en la ficha.

### FORMATO DE SALIDA
En este orden: (1) «Versión reforzada»: gancho, texto y acción, listos para copiar; (2) «Cambios»: una tabla con columnas fijas Frase original | Frase nueva | Palanca | Dato de la ficha que la respalda; (3) «Lo que no cambié»: la lista de datos idénticos; (4) «Para revisar»: lo que ya estaba en el anuncio y no tiene respaldo, o «nada». Los títulos definen la forma; el contenido sale de mi anuncio.

### ANTES DE RESPONDER
Verifica que: cada frase nueva tiene su dato de la ficha en la tabla; las cifras, fechas y condiciones no cambiaron; no hay escasez, superlativos ni promesas nuevos; la acción es la misma; todos los cambios usan solo la palanca elegida. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Refuerza solo una de estas palancas: urgencia real…, claridad del beneficio o menos fricción…",
          why: "Convierte «hazlo más persuasivo» en tres caminos concretos y honestos; sin ellos, el asistente tiende a exagerar.",
        },
        {
          part: "Cada frase nueva debe apoyarse en un dato de la ficha.",
          why: "Obliga a mostrar el respaldo de cada cambio: si no lo hay, la frase sobra.",
        },
        {
          part: "«Para revisar»",
          why: "Si el anuncio ya traía algo sin respaldo, lo señala en lugar de reforzarlo.",
        },
      ],
      evaluate: "Comprueba que cada frase nueva tiene su dato en la tabla y que cifras, fechas y condiciones siguen idénticas.",
      improve: "Si sigue sin convencer, elige otra palanca en lugar de pedir «más fuerte».",
      warnings: ["«Más persuasivo» sin palanca puede traducirse en prisa inventada: elige siempre una."],
    },

    canales: {
      title: "Prompt de canales: adaptar el anuncio a cada uno",
      objective: "Que la IA lleve el anuncio aprobado a cada canal de tu lista, respetando lo que cambia según a quién llega.",
      whenToUse: "Cuando el anuncio final está aprobado y lo vas a usar en más de un canal.",
      variables: [
        { name: "ANUNCIO_FINAL", description: "El anuncio aprobado, con gancho, texto y acción.", example: "La versión tras el refuerzo" },
        { name: "CANALES", description: "Los canales que necesitas, separados por punto y coma.", example: "Texto sobre imagen; mensaje directo" },
        { name: "LIMITES_DEL_CANAL", description: "Límites o reglas que conoces y comprobaste tú.", example: "No lo sé" },
      ],
      prompt: `Actúa como adaptador de anuncios para un negocio pequeño. Tu destinatario es la persona dueña, que usará el mismo anuncio en varios canales. Tu objetivo es llevar un anuncio ya aprobado a cada canal de la lista, conservando la oferta y ajustando lo que cambia según a quién llega.

### CONTEXTO
Usa la FICHA que está más arriba en esta conversación. Si no la encuentras, pídemela antes de seguir.

### DATOS
Anuncio aprobado (única fuente de datos):
{{ANUNCIO_FINAL}}

Canales que necesito:
{{CANALES}}

Límites o reglas de los canales que conozco y comprobé:
{{LIMITES_DEL_CANAL}}

### REGLAS
1. Conserva todos los datos del anuncio aprobado: nombre, oferta, fechas, horarios, condiciones, ubicación y acción. No añadas datos ni promesas.
2. Nunca quites una condición para ganar espacio. Si un canal no la admite, dímelo en «No cabe» en lugar de recortarla.
3. Distingue a quién llega cada canal: si llega a quien no conoce el negocio, el texto debe presentarlo; si llega a contactos que ya lo conocen, no repitas lo que ya saben, pero mantén la oferta y sus condiciones.
4. En mensajes directos escribe [NOMBRE] donde iría el nombre; no inventes nombres ni datos de personas, y recuérdame que solo se envían a quienes aceptaron recibirlos.
5. Si en los límites no hay nada o dice «no lo sé», no supongas límites: indica [FALTA: límite del canal] y sigue.
6. La acción debe ser la misma en todos los canales.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Canal | Texto (listo para copiar) | Qué cambió respecto al anuncio | Qué mostrar (sugerencia); (2) «Datos conservados»: los datos que aparecen en cada canal; (3) «No cabe»: lo que un canal no pudo llevar, o «nada». La tabla define la forma; el contenido sale de mi anuncio.

### ANTES DE RESPONDER
Verifica que: cada canal pedido tiene su fila; todos los datos del anuncio aprobado están en cada canal o en «No cabe»; ningún texto añade información nueva; todos piden la misma acción. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Distingue a quién llega cada canal…",
          why: "Un anuncio para desconocidos presenta el negocio; un mensaje a clientes ya no necesita hacerlo, pero conserva la oferta.",
        },
        {
          part: "Nunca quites una condición para ganar espacio… «No cabe»",
          why: "Al acortar se pierde primero una condición; la regla obliga a avisarte.",
        },
        {
          part: "…solo se envían a quienes aceptaron recibirlos.",
          why: "Recuerda un límite que la IA no puede comprobar por ti.",
        },
      ],
      evaluate: "Con «Datos conservados» al lado, comprueba que oferta, fecha, horario, condiciones, ubicación y acción estén en cada canal.",
      improve: "Si un canal no admite una condición, elige otro canal o simplifica la oferta en tu ficha.",
    },

    variantes: {
      title: "Prompt de variantes: preparar una prueba A/B",
      objective: "Que la IA prepare la versión B cambiando un solo elemento y te diga cómo compararla con la A sin sacar conclusiones falsas.",
      whenToUse: "Cuando tienes un anuncio aprobado y quieres saber qué elemento funciona mejor.",
      variables: [
        { name: "ANUNCIO_A", description: "El anuncio aprobado, que será la versión A.", example: "La versión final" },
        { name: "ELEMENTO", description: "El único elemento que cambia.", example: "El gancho" },
        { name: "SENAL", description: "Lo que puedes contar de verdad para comparar.", example: "Personas que dicen qué versión vieron" },
      ],
      prompt: `Actúa como asistente de pruebas para un negocio pequeño. Tu destinatario es la persona dueña, que publicará dos versiones de un anuncio y quiere compararlas con justicia. Tu objetivo es preparar la versión B cambiando UN solo elemento y explicar cómo compararlas.

### CONTEXTO
Usa la FICHA que está más arriba en esta conversación. Si no la encuentras, pídemela antes de seguir.

### DATOS
Versión A (anuncio aprobado):
{{ANUNCIO_A}}

Único elemento que cambia:
{{ELEMENTO}}

Señal que puedo contar de verdad:
{{SENAL}}

### REGLAS
1. Cambia únicamente el elemento indicado. Todo lo demás debe quedar idéntico, incluidos datos, condiciones y acción.
2. Si te indico varios elementos, pídeme que elija uno.
3. La versión B usa solo datos de la ficha, sin escasez, superlativos ni promesas nuevos.
4. Escribe la hipótesis en condicional («podría ser que…»). No afirmes cuál funcionará mejor ni por cuánto.
5. Propón como señal solo lo que yo dije que puedo contar. Si no puedo contar nada, dímelo.
6. No des cifras de referencia ni resultados «normales»: no los conoces.
7. Indica cuándo NO se puede concluir.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Elemento | Versión A | Versión B | Hipótesis | Señal a observar; (2) «Se mantiene igual»: la lista de lo que no cambia; (3) «Cómo comparar con justicia»: de tres a cinco condiciones; (4) «Cuándo no se puede concluir». La tabla define la forma; el contenido sale de mi anuncio.

### ANTES DE RESPONDER
Verifica que: las versiones A y B son idénticas salvo el elemento indicado; la hipótesis está en condicional; la señal es la que yo puedo contar; no diste cifras de referencia; no hay datos nuevos en B. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia únicamente el elemento indicado. Todo lo demás debe quedar idéntico…",
          why: "Si cambian dos cosas, no sabrás cuál produjo la diferencia.",
        },
        {
          part: "Escribe la hipótesis en condicional… No afirmes cuál funcionará mejor",
          why: "Evita que un supuesto se lea como resultado: todavía no probaste nada.",
        },
        {
          part: "Indica cuándo NO se puede concluir.",
          why: "Recuerda que dos versiones con pocos datos o condiciones distintas no permiten decidir.",
        },
      ],
      evaluate: "Comprueba que A y B son idénticas salvo el elemento elegido y que la señal es algo que sí puedes contar.",
      improve: "Si la hipótesis suena a certeza, pide que la reformule como «podría ser que…».",
    },

    afirmaciones: {
      title: "Prompt de afirmaciones: comprobar cada frase",
      objective: "Que la IA liste todas las afirmaciones del anuncio, marque cuáles se apoyan en la ficha y te diga qué debes comprobar tú.",
      whenToUse: "Con los anuncios ya elegidos y adaptados, justo antes de publicarlos.",
      variables: [{ name: "ANUNCIOS", description: "Los textos que vas a publicar, cada uno con su canal.", example: "El anuncio final y el mensaje directo" }],
      prompt: `Actúa como revisor de afirmaciones de anuncios para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá qué se publica. Tu objetivo es listar TODAS las afirmaciones de cada anuncio y comprobar cuáles se apoyan en la FICHA. No reescribas los anuncios ni juzgues su legalidad.

### CONTEXTO
Usa la FICHA que está más arriba en esta conversación. Si no la encuentras, pídemela antes de seguir.

### DATOS
Anuncios que debes revisar:
{{ANUNCIOS}}

### TIPOS DE AFIRMACIÓN
${LISTA_TIPOS}

### REGLAS
1. Divide cada texto en afirmaciones individuales y cítalas literalmente, entre comillas. Incluye las implícitas: una comparación, una promesa, una prisa. La llamada a la acción no cuenta como afirmación.
2. Asigna a cada una un tipo de la lista; si ninguno encaja, escribe «otro» y explícalo.
3. Marca si está en la FICHA: Sí, Parcial (la ficha dice algo distinto o menos) o No. Nunca marques «Sí» porque suene razonable.
4. Compara también las condiciones de la ficha con las del anuncio y lista las que faltan.
5. Si hay una afirmación «No» o «Parcial», o una promesa, un superlativo o una escasez sin respaldo, marca el anuncio como NO PUBLICAR hasta que la persona lo resuelva.
6. En la última columna escribe lo que tú no puedes saber: la ficha es palabra del dueño y tú solo verificas coherencia con ella.
7. No afirmes que un anuncio cumple normas de publicidad ni de una plataforma; recuérdame que debo consultarlas.

### FORMATO DE SALIDA
Para cada anuncio, en este orden: (1) una tabla con columnas fijas: Afirmación | Tipo | ¿En la ficha? | Qué debe comprobar la persona; (2) «Condiciones de la ficha que faltan en el anuncio», o «ninguna»; (3) «Veredicto»: NO PUBLICAR o SIN HALLAZGOS EN LA FICHA, con el motivo. La tabla define la forma; el contenido sale de mis anuncios.

### ANTES DE RESPONDER
Verifica que: cada frase del anuncio está en alguna afirmación; cada afirmación tiene tipo y estado; ningún «Sí» carece de un dato exacto en la ficha; las condiciones ausentes están listadas; no dijiste que el anuncio cumple normas. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Incluye las implícitas: una comparación, una promesa, una prisa.",
          why: "Una prisa o una comparación implícita también es una afirmación: si no se lista, no se revisa.",
        },
        {
          part: "Nunca marques «Sí» porque suene razonable.",
          why: "Separa lo que está en tu ficha de lo que solo parece verosímil.",
        },
        {
          part: "la ficha es palabra del dueño y tú solo verificas coherencia con ella.",
          why: "Deja claro el límite: la IA compara con tu ficha; que la ficha sea cierta lo comprueba solo tú.",
        },
      ],
      evaluate: "Toma tres frases del anuncio y búscalas en la tabla; si alguna no aparece, repite la revisión.",
      improve: "Si la última columna es vaga («verificar datos»), pide que cada fila diga qué comprobar y contra qué.",
      warnings: ["Este prompt no revisa normas: consúltalas tú, en la plataforma y en la normativa de tu país."],
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt principal a la ficha de Casa y Clavo con dos enfoques. La tuya será distinta.",
    parts: [
      {
        type: "text",
        text: "**ANUNCIO 1 (enfoque: el beneficio para el cliente)**\n\n**Gancho:** ¿Un arreglo pendiente en casa? Tenemos lo que necesitas.\n\n**Texto:** En Ferretería Casa y Clavo encuentras herramientas manuales de varias marcas en un solo lugar y te asesoramos para elegir la adecuada. Este sábado 10 de octubre, de 9:00 a 14:00, hay 20 % de descuento en herramientas manuales, hasta agotar stock por producto y no acumulable con otras ofertas. Estamos en calle Los Pinos con calle 5.\n\n**Llamada a la acción:** Pasa por el local.\n\n**Datos de la ficha usados:** nombre; herramientas manuales de varias marcas en un solo local; asesoramiento; 20 %; sábado 10 de octubre de 9:00 a 14:00; hasta agotar stock; no acumulable; ubicación; acción.\n\n**Supuestos que tuve que hacer:** ninguno.",
      },
      {
        type: "text",
        text: "**ANUNCIO 2 (enfoque: la oferta y su fecha)**\n\n**Gancho:** Sábado 10 de octubre: 20 % de descuento en herramientas manuales.\n\n**Texto:** Martillos, destornilladores, alicates y llaves con 20 % de descuento este sábado 10 de octubre, de 9:00 a 14:00, en Ferretería Casa y Clavo, en calle Los Pinos con calle 5. Hasta agotar stock por producto. No acumulable con otras ofertas. Llevamos 12 años de experiencia atendiendo a los vecinos de Las Acacias.\n\n**Llamada a la acción:** Pasa por el local.\n\n**Datos de la ficha usados:** nombre; productos incluidos; 20 %; sábado 10 de octubre de 9:00 a 14:00; hasta agotar stock; no acumulable; ubicación; barrio; 12 años; acción.\n\n**Supuestos que tuve que hacer:** ninguno.",
      },
      { type: "text", text: "**FALTA:** ninguno." },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "anuncios",
    title: "Puntúa un anuncio",
    intro:
      "Elige un anuncio y respóndele a los seis criterios: 0, 1 o 2 puntos cada uno, hasta " +
      MAXIMO +
      ". Si «" +
      CRITERIOS[3].label +
      "» saca 0, no se publica aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.",
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro: "A simple vista las dos versiones sirven. Con la ficha al lado y los seis criterios, cada una falla en algo distinto.",
    criteria: [
      {
        criterionId: "entiende",
        verdict: "ok",
        comment: "Las dos dicen qué es el negocio, qué ofrecen y dónde está: se entienden sin conocerlo.",
      },
      {
        criterionId: "oferta",
        verdict: "ok",
        comment: "Las dos llevan el 20 %, la fecha, el horario, el stock y que no es acumulable.",
      },
      {
        criterionId: "beneficio",
        verdict: "improve",
        comment: "La versión 2 solo habla de precio: no dice qué gana el cliente. La 1 sí, aunque su gancho, «tenemos lo que necesitas», podría ser de cualquier ferretería.",
      },
      {
        criterionId: "respaldo",
        verdict: "risk",
        comment: "La versión 2 dice «12 años de experiencia», pero la ficha dice «12 años atendiendo en el mismo local»: es una afirmación distinta y más grande.",
      },
      {
        criterionId: "accion",
        verdict: "ok",
        comment: "Las dos piden lo mismo: pasar por el local ese sábado.",
      },
      {
        criterionId: "canal",
        verdict: "ok",
        comment: "Las dos caben en un anuncio con una imagen y un texto de unas setenta palabras.",
      },
    ],
    conclusion:
      "Elegimos la versión 1: tiene beneficio y ninguna afirmación fuera de la ficha. Su gancho es su punto débil, y se refuerza sin tocar los datos.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Persuadir no es exagerar: es poner lo verdadero donde se vea. Aquí el día real de la oferta pasa al gancho.",
    promptId: "persuasion",
    why: "Pedir «hazlo más persuasivo» sin más suele empujar hacia prisa inventada. El prompt limita el cambio a una palanca y obliga a citar el dato de la ficha que lo respalda.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de refuerzo aplicado a la versión 1, con la palanca «urgencia real: llevar fecha y horario al gancho». La tuya será distinta.",
    parts: [
      {
        type: "text",
        text: "**Versión reforzada**\n\n**Gancho:** Solo este sábado: 20 % en herramientas manuales.\n\n**Texto:** En Ferretería Casa y Clavo encuentras herramientas manuales de varias marcas en un solo lugar. Te asesoramos para elegir la adecuada. El descuento es el sábado 10 de octubre, de 9:00 a 14:00, hasta agotar stock por producto y no acumulable con otras ofertas. Estamos en calle Los Pinos con calle 5.\n\n**Llamada a la acción:** Pasa por el local.",
      },
      {
        type: "table",
        table: {
          caption: "Cambios del refuerzo",
          purpose: "Comprobar que cada frase nueva se apoya en un dato de la ficha y que no cambió ninguna condición.",
          columns: ["Frase original", "Frase nueva", "Palanca", "Dato de la ficha que la respalda"],
          rows: [
            ["¿Un arreglo pendiente en casa? Tenemos lo que necesitas.", "Solo este sábado: 20 % en herramientas manuales.", "Urgencia real", "Condiciones (solo el sábado 10 de octubre) y oferta (20 %)."],
            ["Este sábado 10 de octubre, de 9:00 a 14:00, hay 20 %…", "El descuento es el sábado 10 de octubre, de 9:00 a 14:00…", "Urgencia real", "Condiciones: el día pasa al gancho; el texto conserva fecha y horario."],
          ],
        },
      },
      {
        type: "text",
        text: "**Lo que no cambié:** nombre, 20 %, herramientas manuales, sábado 10 de octubre, hasta agotar stock, no acumulable, ubicación y acción.\n\n**Para revisar:** «te asesoramos para elegir la adecuada» depende de que haya quien asesore ese sábado; está en la ficha.",
      },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Pedir «un anuncio» sin datos",
      whyItHurts: "El asistente rellena con lo habitual: superlativos, prisa y ninguna condición.",
      instead: "Completa la ficha antes de pedir nada.",
    },
    {
      title: "Escribirlo como si te conocieran",
      whyItHurts: "Quien lo ve no sabe qué eres ni dónde estás, y no hay a quién preguntar.",
      instead: "Pide que diga qué es el negocio, qué ofrece y dónde está.",
    },
    {
      title: "Pedir «más persuasivo» sin decir cómo",
      whyItHurts: "Es la forma más rápida de que aparezcan «últimas unidades» o «solo hoy» sin que sea cierto.",
      instead: "Elige una palanca y exige el dato de la ficha que la respalda.",
    },
    {
      title: "Probar dos anuncios que cambian varias cosas",
      whyItHurts: "Aunque uno atraiga más gente, no sabrás si fue el gancho, la imagen o la hora.",
      instead: "Cambia un solo elemento y publica ambos a la vez.",
    },
    {
      title: "Dar por buena la ficha sin releerla",
      whyItHurts: "La IA solo comprueba la coherencia con tu ficha: si esta tiene un horario equivocado, el anuncio también.",
      instead: "Relee cada dato de la ficha contra tu realidad.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Con la hoja de afirmaciones abierta, confirma cada punto con tu propia información.",
    items: [
      { label: "Cada precio, fecha, horario y condición coincide con lo que tú decidiste.", detail: "Compáralo con tu oferta, no con el texto de la IA." },
      { label: "El stock, el horario y el personal que se anuncian existen ese día." },
      { label: "Ninguna frase promete un resultado ni compara." },
      { label: "Tienes permiso para nombres, marcas, fotos y textos ajenos que aparezcan." },
      { label: "Quien responde en el canal conoce la oferta y sus condiciones." },
      { label: "Los mensajes directos van solo a quienes aceptaron recibirlos." },
      { label: "Cumple las reglas de publicidad de la plataforma y de tu país.", detail: "Varían según el lugar y cambian con el tiempo: consúltalas allí." },
    ],
    principle: "La IA redacta y compara con tu ficha. La persona comprueba la ficha y decide.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Después de publicar, el trabajo es aprender de lo que pasó y no empezar de cero la próxima vez.",
    steps: [
      { title: "Guarda tu ficha como plantilla", detail: "Cambia solo lo que cambió: producto, fechas y condiciones." },
      { title: "Mantén un banco de afirmaciones aprobadas", detail: "Las frases que ya comprobaste («te asesoramos», «12 años atendiendo») se reutilizan sin revisarlas otra vez." },
      { title: "Anota la señal de cada versión", detail: "Registra cuántas personas mencionaron cada versión." },
      { title: "Cambia un elemento en la próxima prueba", detail: "Usa lo aprendido para elegir qué comparar la vez siguiente." },
      { title: "Retira los anuncios vencidos", detail: "Una oferta terminada que sigue visible genera reclamos." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena cómo pides y compruebas un anuncio, pero tiene límites.",
    items: [
      { title: "No conoce tu stock ni tus resultados", detail: "La IA no ve tu inventario ni qué anuncios te trajeron clientes." },
      { title: "Puede inventar datos", detail: "Aunque el prompt lo prohíba, puede añadir una cifra, una prisa o una promesa: por eso existe la hoja de afirmaciones." },
      { title: "No configura la campaña", detail: "El público, el presupuesto y la segmentación se definen en la plataforma donde publiques." },
      { title: "No decide la oferta", detail: "Parte de una oferta ya definida y de datos que tú aportas." },
      { title: "No sustituye las normas de publicidad", detail: "Las reglas sobre descuentos, imágenes y mensajes dependen de tu país y de la plataforma." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Un buen anuncio no depende de una frase ingeniosa en el prompt, sino de que la oferta esté completa, de que cada afirmación tenga respaldo y de que se pruebe una cosa a la vez. La ficha reúne tus datos, la IA redacta y tú compruebas.",
    takeaways: [
      "La ficha es la fuente de hechos: lo que no está en ella no se anuncia.",
      "Persuade con una palanca verdadera, no con prisa inventada.",
      "Cada canal se adapta desde el anuncio aprobado, sin quitar condiciones.",
      "Prueba un elemento por vez y no concluyas con pocos datos.",
    ],
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["prompt", "asistente-ia", "dato-inventado", "brief", "gancho", "llamada-a-la-accion", "canal", "publico-frio", "prueba-a-b", "rubrica", "variable"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Sirve para un anuncio pagado y para uno gratuito?",
      answer: "El texto sirve para ambos. La configuración de un anuncio pagado (público, presupuesto, duración) se hace en la plataforma y esta guía no la cubre.",
    },
    {
      question: "¿Qué hago si no tengo ningún respaldo?",
      answer: "Déjalo vacío. Un anuncio con oferta completa y condiciones claras funciona sin él, y es preferible a inventar uno.",
    },
    {
      question: "¿Puedo pedirle que compare mi oferta con la de otros?",
      answer: "No conviene: una comparación exige datos ajenos que la IA no tiene y que tendrías que respaldar. Habla de lo que ofreces tú.",
    },
    {
      question: "¿Cuántas versiones debo probar?",
      answer: "Dos, cambiando una sola cosa. Con más versiones y pocas personas, ninguna diferencia es fiable.",
    },
  ],
});
