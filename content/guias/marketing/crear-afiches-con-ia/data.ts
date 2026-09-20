import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * marketing/crear-afiches-con-ia — regenerada con el estándar v3 (`slug` y `publishedAt` se conservan;
 * no había imágenes, evidencia ni pruebas reales que conservar).
 *
 * Tipo: creativa y visual. Todo el caso (Panadería La Espiga, precios, dirección y contacto) es FICTICIO.
 * Las respuestas de la IA son EJEMPLOS GENERADOS: están redactadas aplicando literalmente cada prompt a los
 * datos del caso; no proceden de una conversación real ni de una prueba del autor. Las pruebas reales viven
 * en `evidence.pruebas`, que solo rellena el autor. El único dato externo (contraste) está en `sources`;
 * las reglas de diseño son recomendaciones prácticas, no estudios.
 *
 * Fuente única de verdad: los cuatro niveles (NIVELES), los criterios de la rúbrica (CRITERIOS), los umbrales
 * (RESULTADOS) y los datos del caso (CASO) se definen UNA vez y los leen el marco, la ficha, la rúbrica y
 * los prompts.
 */
const slot = guideSlots("marketing", "crear-afiches-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const NIVELES = [
  {
    n: 1,
    nombre: "Titular",
    va: "Lo que se lee a distancia: la oferta o el protagonista, en pocas palabras.",
    peso: "El más grande",
    por: "Es lo único que se lee de lejos. Debe llevar el protagonista, lo que más ayuda a la acción: casi siempre la oferta con su precio, no el nombre del negocio.",
  },
  {
    n: 2,
    nombre: "Apoyo",
    va: "Lo que completa el titular: vigencia, fecha o lugar.",
    peso: "Mediano",
    por: "Da lo que el lector necesita para decidir. Si repite el titular, sobra.",
  },
  {
    n: 3,
    nombre: "Acción y contacto",
    va: "Lo único que debe hacer quien lo lee y el dato para hacerlo.",
    peso: "Mediano, con buen contraste",
    por: "Una sola acción, con solo el dato que ella necesita: una dirección, un teléfono o un enlace.",
  },
  {
    n: 4,
    nombre: "Letra pequeña",
    va: "Las condiciones que no deben competir con el mensaje.",
    peso: "Pequeño; se lee de cerca",
    por: "Guarda las condiciones necesarias sin que compitan con lo demás. Se lee de cerca, no de pasada.",
  },
] as const;

const CRITERIOS = [
  { id: "datos", label: "Usa solo mis datos", detail: "Cada cifra, horario y contacto está en mis datos, y no hay nada añadido." },
  { id: "exactitud", label: "Cifras y contacto exactos", detail: "Coinciden dígito a dígito con mi fuente y el contacto funciona." },
  { id: "jerarquia", label: "Un protagonista y un orden", detail: "Lo primero que se lee ayuda a la acción, y cada dato está en un solo nivel." },
  { id: "distancia", label: "Se lee de pasada", detail: "Pasa la prueba de los tres segundos y la de distancia." },
  { id: "accion", label: "Una sola acción", detail: "Pide una cosa y da el dato para hacerla." },
  { id: "tono", label: "Suena a tu negocio", detail: "Sin superlativos ni frases de anuncio, y con tu tono." },
] as const;

const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Falla en varios criterios: vuelve a tus datos y a los cuatro niveles." },
  { min: 7, label: "Ajustar", advice: "Sirve de base: corrige primero el criterio con menos puntos, empezando por recortar." },
  { min: 10, label: "Lista para revisar", advice: "Cumple casi todo: pasa a la hoja de revisión." },
] as const;

const CASO = {
  accion: "Entrar a la panadería a comprar el combo",
  oferta: "Combo de fin de semana: 6 panes y 1 pan dulce por $6",
  vigencia: "Sábado y domingo, de 7:00 a 13:00. Hasta agotar existencias",
  condicion: "Máximo 2 combos por persona",
  lugar: "Av. Ejemplo 123 (dato ficticio)",
  lectura: "Vitrina hacia la vereda; se lee de pasada, a varios pasos",
  tono: "Cercano, sin exageraciones",
} as const;

const LISTA_NIVELES = NIVELES.map((x) => `${x.n}. ${x.nombre}: ${x.va}`).join("\n");
const MAXIMO = CRITERIOS.length * 2;

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "crear-afiches-con-ia",
    category: "marketing",
    title: "Crear afiches con IA que se entienden de un vistazo",
    description:
      "Prepara con IA el contenido de un afiche en cuatro niveles, recórtalo con la prueba de los tres segundos y llévalo a tu herramienta de diseño con un brief verificado.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["creativa-visual"],
    estandarGuia: 3,
    activoOriginal: "Ficha de los cuatro niveles del afiche (se copia como tabla), rúbrica de seis criterios y hoja de revisión antes de imprimir (tabla copiable)",
    problem: "Necesitas un afiche para tu negocio y no sabes qué información incluir ni en qué orden para que se entienda de un vistazo.",
    whyThisPage:
      "Explica la jerarquía del mensaje de un afiche y cómo usar la IA solo para preparar el contenido, dejando claro que el diseño se hace después en una herramienta gráfica.",
    relatedGuides: ["crear-anuncios-con-ia", "crear-promociones-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Un afiche se lee en segundos y a distancia. Decide qué va primero, pídele a la IA solo el contenido, recórtalo con una prueba concreta y llévalo a tu herramienta de diseño con un brief verificado.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de una hora y media la primera vez; después, unos 45 minutos",
    needs: ["Un asistente de IA de chat", "Los datos exactos de tu oferta", "Una herramienta de diseño gráfico"],
    result: "El contenido de un afiche ordenado por niveles, verificado y con un brief para maquetarlo",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Muestra el resultado final del método: un afiche real de un negocio colocado donde se ve, fotografiado desde la distancia normal de lectura.",
      description:
        "Foto de un afiche real del negocio pegado en su vitrina, mostrador o poste, tomada desde donde lo leería un cliente que pasa. Debe distinguirse a simple vista qué se ofrece. Sin rostros identificables ni datos personales.",
      alt: "Afiche de un negocio pegado en una vitrina, fotografiado desde la distancia a la que lo leería un cliente que pasa por la calle.",
      caption: "Un afiche real, visto desde donde lo verá el cliente.",
    }),
    ficha: slot("ficha-de-niveles.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña cómo se ve la ficha de niveles ya rellena, para que el lector sepa qué texto va en cada nivel antes de hablar con la IA.",
      description:
        "La ficha de los cuatro niveles pegada en una hoja de cálculo, con la columna «Tu texto» completa con el caso ficticio de la panadería. Resaltar la fila del nivel 1. Sin datos personales.",
      alt: "Hoja de cálculo con la ficha de los cuatro niveles de un afiche rellena para una panadería ficticia.",
      caption: "La ficha completa: cada dato en un solo nivel.",
      zoom: true,
    }),
    jerarquia: slot("jerarquia.webp", {
      section: "marco",
      ratio: "4/3",
      purpose: "El mismo afiche con los cuatro niveles marcados encima (1 titular, 2 apoyo, 3 acción y contacto, 4 letra pequeña): se entiende mejor que la descripción.",
      description:
        "Un afiche de oferta con cuatro zonas numeradas superpuestas: titular, apoyo, acción y contacto, y letra pequeña. Cada número con un color distinto y una etiqueta corta. Caso ficticio, sin datos reales.",
      alt: "Afiche con cuatro zonas numeradas encima: titular, apoyo, acción y contacto, y letra pequeña.",
      caption: "Los cuatro niveles del mensaje, marcados sobre un afiche.",
      zoom: true,
    }),
    antesDespues: slot("antes-despues.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Las dos versiones del mismo afiche lado a lado: la del primer resultado y la recortada, para ver qué cambia al ordenar el mensaje.",
      description:
        "Dos maquetas del mismo afiche: a la izquierda con el contenido del primer resultado (oferta repetida, unas cuarenta palabras) y a la derecha con el contenido recortado. Mismo tamaño y misma imagen en ambas. Caso ficticio.",
      alt: "Dos versiones de un mismo afiche: a la izquierda la cargada de texto y a la derecha la recortada y ordenada por niveles.",
      caption: "Mismo contenido de partida; distinto orden y menos texto.",
      zoom: true,
    }),
    brief: slot("brief-de-diseno.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Deja ver cómo el brief de diseño se traduce en una maqueta: qué tamaño, qué orden y qué espacio tiene cada nivel.",
      description:
        "A la izquierda, la tabla del brief de diseño; a la derecha, la maqueta en una herramienta de diseño siguiendo esas indicaciones, con el nivel 1 resaltado. Caso ficticio y una sola imagen aportada.",
      alt: "Tabla del brief de diseño de un afiche junto a su maqueta en una herramienta de diseño.",
      caption: "Del brief a la maqueta.",
      zoom: true,
    }),
    distancia: slot("prueba-de-distancia.webp", {
      section: "verificacion",
      ratio: "16/9",
      purpose: "Muestra cómo se hace la prueba de distancia: el mismo afiche visto de cerca y desde donde estará el cliente.",
      description:
        "Dos fotos del mismo afiche impreso: una de cerca y otra tomada desde la distancia real de lectura, con una flecha que marque la distancia. Resaltar que en la segunda solo se lee el nivel 1. Caso ficticio.",
      alt: "Dos fotos del mismo afiche, una de cerca y otra desde lejos, donde solo se lee el titular.",
      caption: "Lo que aún se lee desde lejos es tu mensaje real.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "niveles",
      purpose: "Prueba real del prompt de niveles: los titulares, el texto por niveles y de dónde sale cada dato.",
      description:
        "Captura de la respuesta con TITULARES, NIVEL 2, 3 y 4 y DE DÓNDE SALE CADA DATO. Usar el caso de la guía o los datos de tu negocio. Ocultar datos personales y de cuenta.",
      alt: "Captura de la respuesta de un asistente con titulares y texto por niveles para un afiche.",
      caption: "Prueba del prompt de niveles.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "recorte",
      purpose: "Prueba real del prompt de recorte: la versión final, la tabla de cambios y la comprobación de las cuatro preguntas.",
      description:
        "Captura de la versión final, la tabla de cambios y la prueba. Anota aparte cuántas palabras suman los niveles 1 a 3. Ocultar datos personales y de cuenta.",
      alt: "Captura del recorte del contenido de un afiche con su tabla de cambios.",
      caption: "Prueba del prompt de recorte.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "brief",
      purpose: "Prueba real del prompt de brief: la tabla de indicaciones de diseño y lo que falta.",
      description:
        "Captura de la tabla Aspecto / Indicación / Origen y de la lista «Lo que falta». Ocultar datos personales y de cuenta.",
      alt: "Captura de un brief de diseño de afiche devuelto por un asistente.",
      caption: "Prueba del prompt de brief.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "verificacion",
      ratio: "16/9",
      promptId: "verificacion",
      purpose: "Prueba real del prompt de verificación: la tabla de datos, las condiciones que faltan y el veredicto.",
      description:
        "Captura de la tabla de datos, las condiciones ausentes y el veredicto. Pega antes el texto tal como quedó en la maqueta. Ocultar datos personales y de cuenta.",
      alt: "Captura de la revisión de los datos de un afiche con su veredicto.",
      caption: "Prueba del prompt de verificación.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Un afiche compite por una atención que dura segundos. Quien pasa por la calle, espera en un mostrador o cruza un pasillo no lo lee: lo escanea. Si en ese instante no entiende qué se ofrece, cuánto cuesta, hasta cuándo y qué hacer, sigue caminando.\n\nEl error habitual es de contenido, no de diseño: se pone **todo** lo que se quiere decir, con la misma importancia, y nada destaca. Si además se le pide ayuda a una IA, tiende a escribir más y no menos, y puede rellenar con frases de anuncio que suenan bien y que quizá no sean ciertas.\n\nLa IA ayuda a ordenar y redactar el mensaje, pero **no decide qué es lo importante para tu cliente ni sabe si un dato es cierto**: eso se decide y se comprueba antes de diseñar.",
    symptoms: [
      "Tu afiche tiene mucho texto y lo primero que se ve no es lo que quieres vender.",
      "Al alejarte un poco, no se lee nada, ni siquiera la oferta.",
      "Cada vez que lo revisas se te ocurre algo más que añadir.",
      "Le pediste un afiche a una IA y salió una lista de frases de anuncio que no reconoces como tuyas.",
      "No tienes claro qué acción quieres que haga quien lo lea.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con el contenido de un afiche ordenado por importancia, verificado y listo para tu herramienta de diseño, y con un método para repetirlo.",
    deliverables: [
      { label: "Una ficha de cuatro niveles", detail: "Tus datos exactos repartidos en titular, apoyo, acción y letra pequeña." },
      { label: "Un contenido recortado", detail: "Que pasa la prueba de los tres segundos, con cada cambio anotado." },
      { label: "Un brief de diseño", detail: "El orden, los tamaños relativos y el espacio, para quien lo maquete." },
      { label: "Una hoja de revisión", detail: "Para comprobar cada dato antes de imprimir." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes algo que comunicar (una oferta, un evento, un servicio, un horario) y quieres un afiche o un flyer.",
      "Lo vas a diseñar tú en una herramienta gráfica, o se lo pasarás a alguien, y necesitas el contenido bien resuelto.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Esperas que la IA te entregue el afiche diseñado: aquí se prepara el contenido y el diseño se hace después.",
      "Todavía no decidiste la oferta ni el precio: antes necesitas tener claro qué ofreces.",
      "Buscas material de gran producción, como señalización oficial o vía pública: requiere especificaciones y a menudo profesionales.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Panadería La Espiga (ficticia) — panadería de barrio",
    situation:
      "La Espiga es una panadería pequeña con una vitrina hacia la calle. Quiere atraer más gente los fines de semana con un combo y pegar un afiche en la vitrina y en el mostrador.",
    goal: "Que quien pase por la vereda entienda en pocos segundos qué es el combo, cuánto cuesta y hasta cuándo, y que entre a comprarlo.",
    data: [
      { label: "Acción única", value: CASO.accion },
      { label: "Oferta", value: CASO.oferta },
      { label: "Vigencia", value: CASO.vigencia },
      { label: "Condición", value: CASO.condicion },
      { label: "Lugar", value: CASO.lugar },
      { label: "Dónde se verá", value: CASO.lectura },
      { label: "Tono", value: CASO.tono },
    ],
    problem: "Tiene un borrador con seis mensajes que compiten entre sí, y sus pedidos a una IA dan textos con descuentos y envíos que no existen.",
    application: "Decide una acción, reparte sus datos en cuatro niveles, pide el contenido, lo recorta, pide un brief y comprueba cada dato antes de imprimir.",
    result: "Un afiche con la oferta como protagonista, un solo contacto y las condiciones en letra pequeña, con cada dato comprobado.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro:
      "Un afiche tiene cuatro niveles de información y se comprueba con dos pruebas. Cada dato pertenece a un solo nivel: de eso depende que se entienda de un vistazo.",
    blocks: [
      ...NIVELES.map((x) => ({
        title: `Nivel ${x.n} · ${x.nombre}`,
        ...(x.n === 1 ? { simple: "Es como el titular de un periódico: lo que ves de lejos y decide si te acercas." } : {}),
        detail: x.por,
      })),
      {
        title: "Prueba de los tres segundos",
        detail: "Mira el contenido tres segundos y pregúntate: ¿qué ofrece?, ¿cuánto cuesta?, ¿hasta cuándo?, ¿qué hago? Lo que no responde a ninguna, sobra.",
      },
      {
        title: "Prueba de distancia",
        detail: "Aléjate hasta donde estará quien lo lea. Lo que sigues viendo desde ahí es tu mensaje real; si es la oferta, funciona.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Hazme un afiche para mi panadería con una oferta de fin de semana.",
    whyInsufficient:
      "La IA no sabe qué ofreces, a cuánto ni hasta cuándo, y rellena con lo habitual: algo como «¡50 % de descuento en tu combo! ¡Envío gratis! ¡Corre, el mejor pan del barrio!» (ejemplo ilustrativo). Son descuentos, envíos y superlativos que nadie comprobó.\n\nAdemás, «hazme un afiche» mezcla dos trabajos: decidir el mensaje y diseñarlo. Una IA de texto puede ayudar con el primero; el segundo se hace después, en una herramienta gráfica.",
    issues: [
      "No hay una acción: el afiche intenta hacerlo todo.",
      "No hay datos exactos: aparecen descuentos y plazos inventados.",
      "No hay jerarquía: todo el texto pesa lo mismo.",
      "No hay contexto de lectura: no se sabe si se verá de cerca o de pasada.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Escribe los datos tal como aparecerán en el afiche. Cada dato se copia, no se redacta: si la IA tiene que «completarlo», le pides que lo invente.",
    items: [
      { label: "Una sola acción", detail: "Qué quieres que haga quien lo vea: venir, llamar, escribir, reservar. Una, no tres.", required: true },
      { label: "La oferta, exacta", detail: "Qué incluye y a qué precio, con las cifras que mostrarás.", required: true },
      { label: "Vigencia y condiciones", detail: "Desde cuándo, hasta cuándo y qué límites tiene.", required: true },
      { label: "Contacto o lugar", detail: "Solo el dato que sirve a la acción elegida, escrito y comprobado.", required: true },
      { label: "Dónde y cómo se verá", detail: "Vitrina, mostrador, poste o puerta, y a qué distancia lo leerá la gente.", required: true },
      { label: "Tono y elementos de marca", detail: "Cómo suena tu negocio y si tienes logotipo, colores o una fuente definida.", required: false },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    niveles: {
      caption: "Ficha de los cuatro niveles",
      purpose: "Repartir tus datos en los cuatro niveles antes de pedir nada: cada dato en un solo nivel, escrito tal como irá en el afiche.",
      columns: ["Nivel", "Qué va", "Cuánto pesa", "Tu texto"],
      rows: NIVELES.map((x) => [`${x.n} · ${x.nombre}`, x.va, x.peso, "(escribe aquí)"]),
      note: "Si un nivel no lo sabes todavía, escribe «no lo sé»: la IA lo marcará como falta en lugar de rellenarlo.",
      copyable: true,
    },
    brief: {
      caption: "Brief de diseño del afiche de La Espiga",
      purpose: "Ver qué indicaciones recibe quien maqueta el afiche y de dónde sale cada una.",
      columns: ["Aspecto", "Indicación", "Origen"],
      rows: [
        ["Protagonista", "«6 panes y 1 pan dulce por $6»", "Mis datos"],
        ["Orden de lectura", "Titular, vigencia, dirección y letra pequeña", "Sugerido"],
        ["Tamaño relativo de cada nivel", "El nivel 1 claramente el mayor; los niveles 2 y 3 medianos; el nivel 4 pequeño", "Sugerido"],
        ["Contraste", "Texto oscuro sobre fondo claro, o al revés; comprobar el par de colores con un verificador", "Sugerido"],
        ["Espacio", "Aire alrededor del titular; no llenar los márgenes", "Sugerido"],
        ["Imagen", "Una sola, real, de los panes y aportada por ti; ninguna que compita con el titular", "Supuesto"],
        ["Marca", "Logotipo y colores de la panadería", "Mis datos"],
        ["Lo que no debe aparecer", "Redes sociales, un segundo contacto y adornos junto al titular", "Sugerido"],
        ["Antes de imprimir", "Consultar a la imprenta formato, resolución y sangrado", "[FALTA: medidas de la imprenta]"],
      ],
      note: "Ejemplo generado. Lo que falta: [FALTA: medidas de la imprenta].",
    },
    protagonista: {
      caption: "Protagonista del afiche según su objetivo",
      purpose: "Elegir el protagonista según el objetivo, para que el nivel 1 sea lo que más ayuda a la acción y no lo que más te gusta decir.",
      columns: ["Objetivo del afiche", "Protagonista (nivel 1)", "Apoyo (nivel 2)", "Error típico"],
      rows: [
        ["Vender una oferta", "La oferta con su precio", "Vigencia", "Poner el nombre del negocio más grande que la oferta"],
        ["Llenar un evento", "Qué es el evento", "Fecha, hora y lugar", "Esconder la fecha en la letra pequeña"],
        ["Ofrecer un servicio", "El problema que resuelve", "Cómo contactarte", "Enumerar diez servicios con el mismo peso"],
        ["Avisar de un cambio", "El cambio en sí", "Desde cuándo", "Explicar el motivo en lugar del dato"],
      ],
      note: "Tabla orientativa: son criterios de mensaje, no reglas.",
    },
    revision: {
      caption: "Hoja de revisión del afiche final",
      purpose: "Comprobar cada dato del afiche contra tus datos originales y ver qué debes confirmar tú antes de imprimir.",
      columns: ["Dato en el afiche", "¿Coincide con mis datos?", "Qué debo comprobar yo"],
      rows: [
        ["«6 panes y 1 pan dulce por $6»", "Sí", "Que el precio sea el vigente y el combo esté disponible."],
        ["«Sábado y domingo, de 7:00 a 13:00. Hasta agotar existencias»", "Sí", "Que la panadería abra en ese horario."],
        ["«Pasa por La Espiga · Av. Ejemplo 123»", "Sí", "Que la dirección sea correcta, yendo a comprobarla."],
        ["«Máximo 2 combos por persona»", "Sí", "Que el personal aplique el límite."],
      ],
      copyable: true,
      note: "Ejemplo generado. Condiciones que faltan en el afiche: ninguna. Veredicto: SIN HALLAZGOS EN MIS DATOS. Pruebas que solo puedes hacer tú: los tres segundos, la distancia y una prueba impresa.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene con un prompt en cuatro de los seis pasos. Ordenar el mensaje ocurre antes de pedirle nada.",
    steps: [
      {
        title: "Decide la acción y el protagonista",
        description: "Elige una acción y lo único que debe verse primero. Lo que no ayude a esa acción no va en los niveles 1 a 3.",
        output: "Una frase: «quiero que hagan X, y lo primero que deben entender es Y».",
      },
      {
        title: "Reparte tus datos en la ficha de niveles",
        description: "Copia tus datos exactos en la ficha, cada uno en un solo nivel y tal como irán en el afiche.",
        output: "La ficha completa, con los datos sin redactar.",
      },
      {
        title: "Pide el contenido por niveles",
        description: "Pega la ficha en el prompt principal: recibes tres titulares, el texto de cada nivel y de dónde sale cada dato.",
        output: "Tres titulares y el texto de los niveles 2 a 4.",
      },
      {
        title: "Recorta con la prueba de los tres segundos",
        description: "Pide reducir lo que no pasa la prueba y mover a la letra pequeña lo que sea necesario. Puntúa el resultado con la rúbrica.",
        output: "Un contenido más corto donde cada nivel cumple su función.",
      },
      {
        title: "Pide el brief de diseño",
        description: "Traduce el contenido final a indicaciones para quien maqueta: orden, tamaños relativos, contraste y espacio.",
        output: "Un brief de diseño con lo que falta marcado.",
      },
      {
        title: "Comprueba tus datos antes de maquetar",
        description: "Pide la hoja de revisión sobre el texto final y confirma tú lo que ella no puede saber: contacto, horario y disponibilidad.",
        output: "Un texto verificado, listo para la herramienta de diseño.",
      },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    niveles: {
      title: "Prompt de niveles: el contenido del afiche",
      objective: "Obtener tres titulares y el texto de los cuatro niveles usando solo tus datos, sabiendo de dónde sale cada cosa.",
      whenToUse: "Cuando tienes tu acción y tus datos exactos escritos en la ficha.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: "Panadería de barrio con vitrina hacia la calle" },
        { name: "ACCION", description: "La única acción que quieres provocar.", example: CASO.accion },
        { name: "PUBLICO", description: "A quién le hablas.", example: "Vecinos y gente que pasa por la vereda" },
        { name: "DATOS_DEL_AFICHE", description: "Tus datos exactos, tal como irán en el afiche.", example: "Los datos de la ficha, separados por puntos" },
        { name: "LUGAR_DE_LECTURA", description: "Dónde se ve y a qué distancia se lee.", example: CASO.lectura },
        { name: "TONO", description: "Cómo suena tu negocio.", example: CASO.tono },
      ],
      prompt: `Actúa como redactor de material promocional para negocios pequeños. Tu destinatario es la persona dueña, que llevará tu texto a una herramienta de diseño. Tu objetivo es preparar el CONTENIDO de un afiche repartido en cuatro niveles, usando solo sus datos.

### CONTEXTO
Negocio: {{NEGOCIO}}
Público: {{PUBLICO}}
Dónde se verá: {{LUGAR_DE_LECTURA}}
Tono: {{TONO}}

### DATOS (los que YO te doy; no los cambies ni los completes)
Acción única que quiero provocar: {{ACCION}}
Datos del afiche: {{DATOS_DEL_AFICHE}}

### NIVELES
${LISTA_NIVELES}

### REGLAS
1. Usa solo los datos anteriores y cópialos tal cual (cifras, horarios, direcciones). No inventes descuentos, porcentajes, ahorros, envíos, plazos, cualidades ni condiciones. Si necesitas un dato que falta, escribe [FALTA: el dato].
2. No uses superlativos ni comparaciones con otros negocios («el mejor», «único»).
3. Pide una sola acción: la que te indiqué.
4. No describas imágenes ni propongas diseño: eso se hace aparte.
5. Distingue en cada nivel lo que copias de mis datos de lo que redactas tú.
6. Si mis datos se contradicen o no alcanzan para llenar un nivel, dímelo antes de escribir.

### FORMATO DE SALIDA
En este orden y con estos títulos: TITULARES (tres alternativas para el nivel 1, máximo 8 palabras cada una), NIVEL 2, NIVEL 3 y NIVEL 4 (el texto de cada uno) y DE DÓNDE SALE CADA DATO (para cada dato de los niveles, si lo copiaste de mis datos o lo redactaste tú). Al final, una lista «FALTA» con cada [FALTA]. Los títulos definen la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: cada cifra, horario y dirección de los niveles coincide letra por letra con mis datos; no hay descuentos, ahorros, envíos ni superlativos que yo no diera; hay una sola acción; los titulares tienen ocho palabras o menos; todo lo que falta está marcado como [FALTA]. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "DATOS (los que YO te doy; no los cambies ni los completes)",
          why: "Convierte los datos en material que se copia, no que se redacta: precio, horario y dirección no pasan por la imaginación de la IA.",
        },
        {
          part: "No describas imágenes ni propongas diseño: eso se hace aparte.",
          why: "Separa los dos trabajos: la IA ordena y redacta; el diseño lo decides tú en la herramienta gráfica.",
        },
        {
          part: "DE DÓNDE SALE CADA DATO",
          why: "Te deja ver de un vistazo qué es tuyo y qué añadió la IA, para borrar lo segundo sin buscarlo.",
        },
      ],
      evaluate: "Compara cada cifra, horario y dirección con tu ficha y revisa «De dónde sale cada dato».",
      improve: "Si los tres titulares se parecen, añade a tus datos qué debe ser el protagonista.",
      warnings: ["No pegues datos personales de clientes ni información confidencial."],
    },

    recorte: {
      title: "Prompt de recorte: superar la prueba de los tres segundos",
      objective: "Que la IA reduzca el contenido a lo que se entiende de un vistazo, mueva lo necesario a la letra pequeña y no cambie ningún dato.",
      whenToUse: "Justo después del primer resultado, cuando el texto tiene demasiadas palabras o repeticiones.",
      variables: [
        { name: "LIMITE_DE_PALABRAS", description: "Máximo de palabras entre los niveles 1, 2 y 3 juntos.", example: "30 palabras" },
        { name: "PROTAGONISTA", description: "Lo que debe verse primero.", example: "La oferta con su precio" },
      ],
      prompt: `Actúa como editor de material promocional para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es recortar el contenido del afiche hasta que pase la prueba de los tres segundos, sin cambiar ningún dato.

### CONTEXTO
Usa los datos, la acción única y los niveles de esta conversación, y tu propuesta anterior. Si falta alguno, pídemelo antes de seguir.

### DATOS
Máximo de palabras entre los niveles 1, 2 y 3 juntos: {{LIMITE_DE_PALABRAS}}
Lo que debe verse primero: {{PROTAGONISTA}}

### PRUEBA DE LOS TRES SEGUNDOS
Alguien que mire el afiche tres segundos debe entender qué se ofrece, cuánto cuesta, hasta cuándo y qué hacer.

### REGLAS
1. Reduce los niveles 1, 2 y 3 juntos al máximo indicado. Quita adjetivos, repeticiones y frases de anuncio; un dato no aparece en dos niveles.
2. Lo que quites pero sea necesario (condiciones), pásalo al nivel 4; no lo elimines.
3. No cambies ni completes ningún dato y no añadas nada que no esté en mis datos.
4. Si no se puede cumplir el máximo sin perder una de las cuatro respuestas de la prueba, dímelo y propón el máximo mínimo posible en lugar de omitirla.
5. Lo que debe verse primero tiene que ser lo primero que se lea, en el nivel 1.

### FORMATO DE SALIDA
En este orden: (1) VERSIÓN FINAL: los cuatro niveles; (2) TABLA DE CAMBIOS con columnas fijas: Qué quité o moví | Nivel de origen | Dónde quedó | Motivo; (3) PRUEBA: cuántas palabras suman los niveles 1 a 3 y en qué nivel queda la respuesta a cada una de las cuatro preguntas. La tabla define la forma; el contenido sale de mi propuesta.

### ANTES DE RESPONDER
Verifica que: los niveles 1 a 3 no superan el máximo (cuéntalos); cada cifra, horario y dirección sigue igual; nada necesario se perdió; ningún dato aparece en dos niveles; las cuatro preguntas tienen respuesta. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Alguien que mire el afiche tres segundos debe entender qué se ofrece…",
          why: "Da un criterio concreto para recortar: lo que no responde a una de las cuatro preguntas sobra.",
        },
        {
          part: "Lo que quites pero sea necesario (condiciones), pásalo al nivel 4; no lo elimines.",
          why: "Un tope obliga a decidir, y la letra pequeña conserva las condiciones sin competir con el mensaje.",
        },
        {
          part: "TABLA DE CAMBIOS",
          why: "Te permite ver qué se quitó y por qué, y detectar si algo necesario desapareció.",
        },
      ],
      evaluate: "Cuenta tú las palabras de los niveles 1 a 3 y comprueba que cada dato sigue igual.",
      improve: "Prueba otro límite (20 y 30 palabras) y compara cuál se lee mejor desde lejos.",
    },

    brief: {
      title: "Prompt de brief: indicaciones para maquetar",
      objective: "Que la IA traduzca el contenido final a indicaciones de diseño claras, sin diseñar ni añadir texto.",
      whenToUse: "Con el contenido recortado, antes de abrir tu herramienta de diseño o de pasárselo a quien maqueta.",
      variables: [
        { name: "AFICHE_FINAL", description: "El contenido final, con los cuatro niveles.", example: "La versión final tras el recorte" },
        { name: "MARCA", description: "Los elementos de marca que tienes.", example: "Logotipo y colores de la panadería" },
        { name: "HERRAMIENTA", description: "La herramienta de diseño que usarás.", example: "Una herramienta de diseño en línea" },
      ],
      prompt: `Actúa como director de arte que prepara un brief para quien va a maquetar un afiche. Tu destinatario es esa persona (la dueña o alguien de diseño). Tu objetivo es traducir el contenido final a indicaciones claras, sin diseñar ni generar imágenes.

### CONTEXTO
Usa el lugar de lectura y la acción de esta conversación. Si faltan, pídemelos antes de seguir.

### DATOS
Contenido final del afiche (única fuente de texto):
{{AFICHE_FINAL}}

Elementos de marca que tengo: {{MARCA}}
Herramienta de diseño: {{HERRAMIENTA}}

### REGLAS
1. No cambies ni añadas texto: todo lo que vaya en el afiche se toma del contenido final.
2. Expresa los tamaños de forma relativa (por ejemplo, «el nivel 1 claramente el mayor») y no en puntos ni centímetros: dependen del formato y de la imprenta.
3. No inventes colores, fuentes ni medidas. Si falta un dato de marca o de impresión, escribe [FALTA: el dato].
4. No describas imágenes generadas. Si hay una imagen, será una que yo aporte, y solo una.
5. Para el contraste, pide comprobar el par de colores con un verificador; no afirmes que un par cumple.
6. Indica lo que no debe aparecer: todo lo que compita con el nivel 1.
7. Distingue lo que sale de mis datos, lo que supones y lo que sugieres.

### FORMATO DE SALIDA
Una tabla con columnas fijas: Aspecto | Indicación | Origen (mis datos, supuesto, sugerido o [FALTA]) y estas filas, en este orden: Protagonista, Orden de lectura, Tamaño relativo de cada nivel, Contraste, Espacio, Imagen, Marca, Lo que no debe aparecer, Antes de imprimir. Después, «Lo que falta» con cada [FALTA]. La tabla define la forma; el contenido sale de mi afiche.

### ANTES DE RESPONDER
Verifica que: están todas las filas, en orden; no hay texto nuevo; ninguna medida ni color es inventado; los tamaños son relativos; el contraste se pide comprobar. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "No cambies ni añadas texto: todo lo que vaya en el afiche se toma del contenido final.",
          why: "Evita que el brief reescriba el afiche y reintroduzca datos que ya verificaste.",
        },
        {
          part: "Expresa los tamaños de forma relativa… no en puntos ni centímetros",
          why: "Las medidas reales dependen de tu formato y de la imprenta: pedirlas a la IA sería inventarlas.",
        },
        {
          part: "Para el contraste, pide comprobar el par de colores con un verificador…",
          why: "Un par de colores se comprueba con una herramienta, no con la palabra de la IA.",
        },
      ],
      evaluate: "Comprueba que todas las filas están y que el texto de «Protagonista» es idéntico al del nivel 1.",
      improve: "Si una fila es vaga, pide que la reescriba con una instrucción que puedas aplicar en la herramienta.",
    },

    verificacion: {
      title: "Prompt de verificación: la hoja de revisión",
      objective: "Que la IA compare cada dato del texto final con tus datos originales y te diga qué debes comprobar tú antes de imprimir.",
      whenToUse: "Con el texto tal como quedó al maquetar, antes de imprimir.",
      variables: [{ name: "TEXTO_FINAL", description: "El texto del afiche tal como está en la maqueta, con sus cuatro niveles.", example: "El texto copiado de la herramienta de diseño" }],
      prompt: `Actúa como revisor de afiches para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá si imprime. Tu objetivo es comparar cada dato del afiche con sus datos originales y señalar lo que debe comprobar ella. No reescribas el afiche ni juzgues su legalidad.

### CONTEXTO
Usa los datos originales y la acción única de esta conversación. Si faltan, pídemelos antes de seguir.

### DATOS
Texto final del afiche, tal como quedó al maquetar:
{{TEXTO_FINAL}}

### REGLAS
1. Divide el texto en datos y afirmaciones individuales (cifras, horarios, direcciones, contactos, condiciones, promesas) y cítalos literalmente, entre comillas.
2. Compara cada uno con mis datos originales: Sí (coincide), Distinto (dice algo diferente) o No está en mis datos. Nunca marques «Sí» sin encontrar el dato exacto.
3. Lista las condiciones de mis datos que faltan en el afiche.
4. Para cada teléfono, dirección o enlace, escribe qué debo probar yo: llamar, abrir o ir.
5. Marca NO IMPRIMIR si hay un «Distinto», un «No está en mis datos», un superlativo, una comparación o más de una acción.
6. No afirmes que el afiche cumple normas de publicidad ni que se lee a distancia: eso lo compruebo yo. Recuérdamelo.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Dato en el afiche | ¿Coincide con mis datos? | Qué debo comprobar yo; (2) «Condiciones que faltan en el afiche», o «ninguna»; (3) «Veredicto»: NO IMPRIMIR o SIN HALLAZGOS EN MIS DATOS, con el motivo; (4) «Pruebas que solo puedes hacer tú». La tabla define la forma; el contenido sale de mi afiche.

### ANTES DE RESPONDER
Verifica que: cada cifra, horario, dirección y condición del afiche está en la tabla; ningún «Sí» carece de un dato exacto en mis datos; las condiciones ausentes están listadas; no dijiste que el afiche cumple normas ni que se lee a distancia. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Nunca marques «Sí» sin encontrar el dato exacto.",
          why: "Separa lo que está en tus datos de lo que solo parece razonable.",
        },
        {
          part: "Para cada teléfono, dirección o enlace, escribe qué debo probar yo…",
          why: "La IA no puede llamar ni ir al lugar: te lista lo que solo tú puedes comprobar.",
        },
        {
          part: "No afirmes que el afiche cumple normas de publicidad ni que se lee a distancia…",
          why: "Deja claro el límite: compara datos, no juzga legalidad ni legibilidad.",
        },
      ],
      evaluate: "Toma tres cifras del afiche y búscalas en la tabla; si alguna no aparece, repite la revisión.",
      improve: "Si la última columna es vaga («verificar»), pide que cada fila diga qué comprobar y cómo.",
      warnings: ["Este prompt no revisa normas: consúltalas tú, en la normativa de tu país."],
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de niveles a los datos de La Espiga. La tuya será distinta.",
    parts: [
      {
        type: "text",
        text: "**TITULARES**\n\n1. «6 panes y 1 pan dulce por $6»\n\n2. «Combo de fin de semana en La Espiga»\n\n3. «Pan para compartir este fin de semana»\n\n**NIVEL 2:** Combo de 6 panes y 1 pan dulce por $6. Sábado y domingo, de 7:00 a 13:00. Hasta agotar existencias.\n\n**NIVEL 3:** Pasa por La Espiga, en Av. Ejemplo 123. Te esperamos.\n\n**NIVEL 4:** Máximo 2 combos por persona. Válido hasta agotar existencias.",
      },
      {
        type: "text",
        text: "**DE DÓNDE SALE CADA DATO:** copiados de tus datos: la oferta, el precio, la vigencia, la dirección y el límite por persona. Redactado por mí: «Pasa por» y «Te esperamos».\n\n**FALTA:** ninguno.",
      },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "afiche",
    title: "Puntúa el contenido de un afiche",
    intro:
      "Elige un contenido y respóndele a los seis criterios: 0, 1 o 2 puntos cada uno, hasta " +
      MAXIMO +
      ". Si «" +
      CRITERIOS[0].label +
      "» saca 0, no se imprime aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.",
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro: "No inventa nada y usa los datos correctos. Su problema es otro: dice demasiado. Léelo con los seis criterios.",
    criteria: [
      {
        criterionId: "datos",
        verdict: "ok",
        comment: "Todo sale de tus datos; lo redactado por la IA se limita a «Pasa por» y «Te esperamos».",
      },
      {
        criterionId: "exactitud",
        verdict: "ok",
        comment: "El precio, el horario, el límite por persona y la dirección coinciden con tus datos.",
      },
      {
        criterionId: "jerarquia",
        verdict: "improve",
        comment:
          "El titular 1 sirve, pero el 2 pone el nombre del negocio por delante de la oferta y el 3 no dice nada. Además, la oferta se repite en los niveles 1 y 2, y «hasta agotar existencias» en el 2 y en el 4.",
      },
      {
        criterionId: "distancia",
        verdict: "improve",
        comment: "Los niveles 1 a 3 suman 39 palabras: demasiado para leerlo de pasada. No pasaría la prueba de los tres segundos.",
      },
      {
        criterionId: "accion",
        verdict: "ok",
        comment: "Pide una sola cosa: pasar por la panadería.",
      },
      {
        criterionId: "tono",
        verdict: "ok",
        comment: "No usa superlativos y suena cercano.",
      },
    ],
    conclusion:
      "Es un buen borrador sin datos inventados: se arregla recortando, no reescribiendo. Por eso el siguiente paso aplica un criterio y un tope de palabras.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro:
      "La corrección no es de estilo, es de selección: qué se queda, qué pasa a la letra pequeña y qué se quita. El mensaje de seguimiento aplica un criterio y un tope de palabras.",
    promptId: "recorte",
    why: "El análisis mostró un solo fallo de fondo: exceso y repetición. El prompt lo ataca con la prueba de los tres segundos y una tabla que muestra cada cosa quitada.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de recorte con el límite de 30 palabras y como protagonista la oferta con su precio. La tuya será distinta.",
    parts: [
      {
        type: "text",
        text: "**VERSIÓN FINAL**\n\n**Nivel 1:** 6 panes y 1 pan dulce por $6\n\n**Nivel 2:** Sábado y domingo, de 7:00 a 13:00. Hasta agotar existencias\n\n**Nivel 3:** Pasa por La Espiga · Av. Ejemplo 123\n\n**Nivel 4:** Máximo 2 combos por persona",
      },
      {
        type: "table",
        table: {
          caption: "Cambios del recorte",
          purpose: "Comprobar qué se quitó o se movió y por qué, y que ningún dato necesario desapareció.",
          columns: ["Qué quité o moví", "Nivel de origen", "Dónde quedó", "Motivo"],
          rows: [
            ["«Combo de 6 panes y 1 pan dulce por $6»", "2", "Nivel 1 (ya estaba)", "El dato ya estaba en el titular."],
            ["«Te esperamos»", "3", "Quitado", "Frase de anuncio sin dato."],
            ["«Válido hasta agotar existencias»", "4", "Nivel 2 (ya estaba)", "Repetía la vigencia."],
            ["Titulares 2 y 3", "1", "Descartados", "El protagonista pedido es la oferta con su precio."],
          ],
        },
      },
      {
        type: "text",
        text: "**PRUEBA:** los niveles 1 a 3 suman 26 palabras. ¿Qué se ofrece y cuánto? Nivel 1. ¿Hasta cuándo? Nivel 2. ¿Qué hago? Nivel 3.",
      },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Poner todo lo que quieres decir",
      whyItHurts: "Cuando todo importa, nada destaca: cada palabra sobrante le quita atención a la oferta.",
      instead: "Elige una acción y reparte lo demás en los cuatro niveles; lo que no ayude, pasa a la letra pequeña o se quita.",
    },
    {
      title: "Pedir el afiche diseñado, con el texto dentro de una imagen",
      whyItHurts: "El texto de una imagen generada puede salir con errores, y uno en el precio o en el teléfono no se ve hasta que está impreso.",
      instead: "Pide solo el contenido y escribe el texto tú en la herramienta de diseño, donde puedes revisarlo letra por letra.",
    },
    {
      title: "Reescribir a mano los datos al maquetar",
      whyItHurts: "Un dígito cambiado al teclear un teléfono o un horario inutiliza el afiche.",
      instead: "Copia y pega desde tu ficha, y pasa el texto final por la hoja de revisión.",
    },
    {
      title: "Diseñar sin pensar en la distancia",
      whyItHurts: "Un afiche que se lee bien en la pantalla puede ser ilegible desde la vereda.",
      instead: "Aléjate hasta donde estará el cliente: si lo que aún ves es la oferta, funciona.",
    },
    {
      title: "Poco contraste entre texto y fondo",
      whyItHurts: "Un texto claro sobre un fondo claro, o al revés, se pierde con poca luz o de lejos.",
      instead: "Elige colores con mucha diferencia y compruébalos con un verificador (ver preguntas frecuentes).",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Marca cada punto cuando lo hayas comprobado tú, no la IA. La hoja de revisión te ayuda con los primeros; los últimos solo se hacen en persona.",
    items: [
      { label: "Cada cifra, horario y condición coincide con mi fuente.", detail: "Compáralo dígito por dígito, no «a ojo»." },
      { label: "Probé el teléfono, el enlace o la dirección.", detail: "Llamo, abro el enlace o voy antes de imprimir." },
      { label: "No hay descuentos, ahorros, envíos, superlativos ni promesas que no estén en mis datos." },
      { label: "Pasa la prueba de los tres segundos." },
      { label: "Pasa la prueba de distancia: desde donde estará el cliente se lee el nivel 1." },
      { label: "Revisé las reglas de mi país o ciudad sobre publicidad, precios y ofertas.", detail: "Varían según el lugar; esta guía no las cubre." },
      { label: "Vi una prueba impresa, o el archivo a tamaño real, antes de imprimir la tirada." },
    ],
    principle: "La IA redacta y compara datos. La persona comprueba y decide.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con el texto verificado, el trabajo es llevarlo a la imprenta y aprender de lo que pase.",
    steps: [
      { title: "Consulta a tu imprenta antes de crear el lienzo", detail: "Cada una pide su formato, su resolución y su sangrado; pregúntalos antes de maquetar." },
      { title: "Maqueta siguiendo el brief", detail: "Coloca el nivel 1 primero y copia los textos desde tu ficha, sin reescribirlos." },
      { title: "Imprime una prueba y compárala con la ficha", detail: "Verifica de nuevo cifras y contacto sobre el papel, y recién entonces imprime la tirada." },
      { title: "Anota qué pasa después de pegarlo", detail: "Una línea por semana: cuánta gente menciona el afiche o pide el combo." },
      { title: "Guarda la ficha como plantilla y retira el afiche al vencer", detail: "La próxima vez cambias solo los datos; una oferta vencida a la vista genera reclamos." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "La IA ayuda con el mensaje, no con todo el afiche.",
    items: [
      { title: "No diseña el afiche", detail: "Un asistente de texto no decide la composición, los colores ni la tipografía: eso se resuelve en una herramienta gráfica, con tu marca." },
      { title: "No conoce dónde se verá", detail: "No ve la luz ni la distancia reales: las pruebas de tres segundos y de distancia las haces tú, en el sitio." },
      { title: "Puede añadir datos", detail: "Aunque el prompt lo prohíba, puede colar un descuento o una condición: por eso cada dato se comprueba con tu fuente." },
      { title: "Las reglas de publicidad varían", detail: "Cómo mostrar precios y ofertas depende del país y de la ciudad. Consulta a un profesional o a la autoridad competente." },
      { title: "No asegura visitas ni ventas", detail: "Un afiche claro ayuda a que se entienda; lo que ocurra después depende de tu negocio." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Un afiche funciona cuando se decide antes de escribir: una acción, un protagonista y un orden. La IA es útil para redactar y ordenar dentro de ese marco; los datos los pones tú y el diseño se hace después, con tus ojos y a la distancia real.",
    takeaways: [
      "Elige una acción y un protagonista antes de pedir nada.",
      "Cada dato va en un solo nivel; los datos se copian, no se redactan.",
      "Recorta con la prueba de los tres segundos y comprueba con la de distancia.",
      "La IA prepara el contenido y el brief; el diseño lo haces tú.",
    ],
    nextGuide: "crear-anuncios-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["prompt", "asistente-ia", "variable", "llamada-a-la-accion", "brief", "jerarquia-visual", "contraste", "sangrado", "rubrica", "dato-inventado"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Puede la IA diseñar el afiche completo?",
      answer:
        "Puede generar imágenes, pero el problema es el texto: precios, horarios y teléfonos deben ser exactos, y un texto generado dentro de una imagen puede traer errores que no se ven hasta imprimir. Por eso aquí la IA prepara el contenido y el texto final lo escribes tú.",
    },
    {
      question: "¿Cuántas palabras debe tener un afiche?",
      answer:
        "No hay una cifra universal. Como referencia práctica, mantén los niveles 1 a 3 en torno a 30 palabras y usa la prueba de los tres segundos: lo que no responde a una de sus cuatro preguntas sobra.",
    },
    {
      question: "¿Qué tamaño y resolución necesito para imprimir?",
      answer: "Depende de la imprenta y del formato: pregúntale antes de diseñar qué tamaño, resolución, tipo de archivo y márgenes necesita.",
    },
    {
      question: "¿Cómo compruebo el contraste?",
      answer:
        "Con un verificador de contraste (hay herramientas gratuitas en línea) y mirando el afiche desde lejos y con la luz real. Como referencia, las pautas WCAG piden 4.5:1 para texto normal y 3:1 para texto grande; son pautas para web, útiles aquí como guía, no una norma para afiches impresos.",
    },
  ],

  /* ───────────────────────────── fuentes ───────────────────────────── */
  sources: {
    intro: "El único dato externo de esta guía es la referencia de contraste. Las reglas de diseño son recomendaciones prácticas, no resultados de estudios.",
    items: [
      {
        title: "Understanding Success Criterion 1.4.3: Contrast (Minimum)",
        publisher: "W3C Web Accessibility Initiative (WCAG 2.2)",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
        consultedAt: "2026-09-19",
        note: "Relación de contraste mínima de 4.5:1 para texto normal y 3:1 para texto grande (18 pt, o 14 pt en negrita). Son pautas para contenido web; aquí se usan solo como referencia. La página indica su actualización el 1 de junio de 2026.",
        mayExpire: true,
      },
    ],
  },
});
