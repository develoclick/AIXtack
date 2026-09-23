import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * marketing/ideas-de-contenido-para-tu-negocio-con-ia — regenerada con el estándar v3 (`slug` y
 * `publishedAt` se conservan; no había imágenes, evidencia ni pruebas reales que conservar).
 *
 * Tipo: estrategia y planificación. Todo el caso (la tienda Patitas y sus datos) y los otros negocios son
 * FICTICIOS. Las respuestas de la IA son EJEMPLOS GENERADOS: están redactadas aplicando literalmente cada
 * prompt a los datos del caso; no proceden de una conversación real ni de una prueba del autor. Las pruebas
 * reales viven en `evidence.pruebas`, que solo rellena el autor. La guía no cita datos externos que caduquen
 * ni da cifras de «mejores horas» o de rendimiento.
 *
 * Fuente única de verdad: las seis listas de materia prima (MATERIA), los cinco criterios (CRITERIOS), los
 * umbrales (RESULTADOS), las columnas del banco (BANCO) y los datos del caso (CASO) se definen UNA vez y los
 * leen la ficha, la rúbrica, el análisis y los prompts.
 */
const slot = guideSlots("marketing", "ideas-de-contenido-para-tu-negocio-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const MATERIA = [
  { id: "preguntas", label: "Preguntas reales de clientes", detail: "Las que te repiten por mensaje, en el local o por teléfono, tal como las hacen. Quita nombres y datos personales.", required: true },
  { id: "problemas", label: "Problemas que resuelves", detail: "Lo que le pasa a la gente cuando llega a tu negocio y cómo lo ayudas.", required: true },
  { id: "productos", label: "Productos o servicios y su uso", detail: "Lo que ofreces, descrito por lo que sabes con seguridad. No hace falta que esté perfecto.", required: true },
  { id: "temporada", label: "Temporada y fechas", detail: "Lo que cambia según la época o las fechas propias de tu rubro.", required: false },
  { id: "limites", label: "Lo que no vas a publicar", detail: "Temas delicados, promesas que no puedes cumplir o cosas que no puedes producir.", required: true },
  { id: "tiempo", label: "Tu tiempo y tus formatos", detail: "Cuánto tiempo real tienes por semana y qué formatos sabes producir.", required: true },
] as const;

const CRITERIOS = [
  { id: "origen", corto: "Origen", label: "Sale de un elemento concreto de mi materia prima", detail: "Puedo señalar la pregunta, el problema o la temporada de la que sale, y esa fuente sostiene de verdad la idea." },
  { id: "cliente", corto: "Cliente", label: "Responde a una duda o problema real de mi cliente", detail: "Es algo que mis clientes me han preguntado o padecido." },
  { id: "tiempo", corto: "Tiempo", label: "Puedo producirla con mi tiempo y mis formatos", detail: "Sin depender de material, permisos o herramientas que no tengo." },
  { id: "propia", corto: "Propia", label: "Se reconoce como de mi negocio", detail: "No serviría igual para cualquier otro del rubro." },
  { id: "accion", corto: "Acción", label: "Tiene una acción que lleva a mi objetivo", detail: "Quien la ve sabe qué hacer, y eso es lo que yo busco este mes." },
] as const;

const RESULTADOS = [
  { min: 0, label: "Rehacer o descartar", advice: "Falla en varios criterios: vuelve a la materia prima y rehazla, o descártala." },
  { min: 6, label: "Con ajustes", advice: "Buen punto de partida: mejora el criterio con menos puntos antes de producirla." },
  { min: 9, label: "Lista para producir", advice: "Cumple casi todo: verifica datos y permisos y prográmala." },
] as const;

const BANCO = ["Prioridad", "Idea", "Pilar", "De dónde sale", "Formato", "Acción", "Puntaje", "Estado"] as const;

const CASO = {
  preguntas: "Tamaño de collares · cómo presentar un rascador a un gato · qué necesita un cachorro",
  problemas: "El perro rompe los juguetes · el gato no usa el rascador",
  productos: "Collares, juguetes, rascadores y accesorios",
  temporada: "Temporada de lluvias",
  limites: "Consejos veterinarios · precios · fotos de clientes sin permiso",
  tiempo: "2 horas por semana · imagen con texto y serie de imágenes",
} as const;

const OBJETIVO = "Que más personas escriban por mensaje para consultar tamaños y productos";
const PILARES = "Elegir bien · Resolver problemas · Preparar la llegada";
const MAXIMO = CRITERIOS.length * 2;

const LISTA_MATERIA = MATERIA.map((m, i) => `${i + 1}. ${m.label}`).join("\n");
const LISTA_CRITERIOS = CRITERIOS.map((c, i) => `${i + 1}. ${c.label}: ${c.detail}`).join("\n");
const COLUMNAS_CRITERIOS = CRITERIOS.map((c) => c.corto).join(" | ");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "ideas-de-contenido-para-tu-negocio-con-ia",
    category: "marketing",
    title: "Ideas de contenido para tu negocio con IA que no suenan genéricas",
    description:
      "Cuando no sabes qué publicar, alimenta a la IA con preguntas reales de tus clientes, tus productos y la temporada, y filtra las ideas con una rúbrica sencilla.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["estrategia-planificacion"],
    estandarGuia: 3,
    activoOriginal: "Ficha de materia prima (se copia como tabla), rúbrica de cinco criterios con umbrales y banco de ideas priorizado (tabla copiable)",
    problem: "No sabes qué publicar en redes o en tu web y terminas repitiendo lo mismo o sin publicar.",
    whyThisPage:
      "Enseña un método para dar a la IA información real del negocio (preguntas frecuentes, problemas del cliente, temporada) y filtrar las ideas, en lugar de pedir ideas genéricas.",
    relatedGuides: ["crear-publicaciones-para-redes-sociales-con-ia", "responder-consultas-de-clientes-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Una IA sin contexto da ideas que servirían igual a cualquier negocio. Aprende a darle la materia prima real del tuyo, a que te entreviste si te falta y a filtrar lo que sale con una rúbrica.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "De 2 a 3 horas la primera vez; después, bastante menos",
    needs: ["Un asistente de IA de chat", "Tus mensajes y preguntas de clientes recientes", "Un documento o una hoja de cálculo"],
    result: "Un banco de ideas evaluadas y ordenadas, listas para producir",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Muestra de un vistazo el resultado: un banco de ideas ordenado, con su origen y su prioridad, en lugar de una lista suelta.",
      description:
        "Captura de una hoja de cálculo con el banco de ideas de un negocio ficticio: una fila por idea, con columnas de idea, de dónde sale, formato, acción y puntaje. Resaltar con un recuadro la columna «De dónde sale». Sin datos personales de clientes.",
      alt: "Hoja de cálculo con un banco de ideas de contenido: cada fila indica la idea, la pregunta real de la que sale, el formato, la acción y el puntaje.",
      caption: "Un banco de ideas con su origen y su prioridad.",
    }),
    datos: slot("datos-necesarios.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña cómo se ve la materia prima ya reunida, para que el lector sepa qué preparar antes de hablar con la IA.",
      description:
        "La ficha de materia prima pegada en una hoja de cálculo, con las seis listas completas con el caso ficticio y escritas con palabras de cliente, no de marketing. Resaltar la lista de lo que no se publica. Sin nombres ni teléfonos.",
      alt: "Hoja de cálculo con seis listas de materia prima de una tienda de mascotas ficticia: preguntas, problemas, productos, temporada, límites y tiempo.",
      caption: "La materia prima, reunida antes de abrir la IA.",
      zoom: true,
    }),
    primerResultado: slot("primer-resultado.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver cómo llega la primera lista de ideas y anticipar qué revisar, sin tener que probarlo antes.",
      description:
        "La primera respuesta del asistente con la tabla de ideas, sin editar. Marcar con recuadros una idea con su origen forzado y dos con una acción que no lleva al objetivo. Negocio ficticio, sin datos personales.",
      alt: "Tabla con las primeras ideas propuestas por una IA, con tres marcadas por un origen forzado o una acción que no lleva al objetivo.",
      caption: "La primera lista: algunas ideas sirven y otras no llevan al objetivo.",
      zoom: true,
    }),
    rubrica: slot("rubrica.webp", {
      section: "analisis",
      ratio: "4/3",
      purpose: "Enseña cómo se puntúa una idea con la rúbrica, con un ejemplo hecho, para que el lector copie el procedimiento.",
      description:
        "Una tabla con tres ideas y los cinco criterios como columnas, con un puntaje de 0, 1 o 2 en cada celda y el total al final. Resaltar la fila de una idea con 10 y la de una con menos de 6. Datos ficticios.",
      alt: "Tabla de puntuación con tres ideas de contenido y cinco criterios, con el total por idea resaltado.",
      caption: "Puntuar las ideas con la misma vara.",
      zoom: true,
    }),
    banco: slot("banco-de-ideas.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra el entregable final ya organizado: qué debe tener el banco de ideas para poder usarlo cada semana.",
      description:
        "La hoja final del banco de ideas ordenada por prioridad, con las columnas de la tabla de la guía y el estado en «por hacer», salvo dos filas marcadas como publicadas. Siete filas ficticias.",
      alt: "Hoja con el banco de ideas ordenado por prioridad, con su origen, formato, acción, puntaje y estado.",
      caption: "El banco final: ordenado, con su origen y su estado.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "entrevista",
      purpose: "Prueba real del prompt de entrevista: el ida y vuelta de preguntas y la tabla de materia prima que devolvió.",
      description:
        "Captura de la conversación tras pegar el prompt: las preguntas, tus respuestas y la tabla final de materia prima. Ocultar datos personales y de cuenta.",
      alt: "Captura de la entrevista con un asistente y de la tabla de materia prima resultante.",
      caption: "Prueba del prompt de entrevista.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "principal",
      purpose: "Prueba real del prompt principal: el banco de ideas que devolvió con una materia prima real.",
      description:
        "Captura de la tabla de ideas con su origen, formato y acción, y de la lista «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de un banco de ideas de contenido devuelto por un asistente.",
      caption: "Prueba del prompt principal.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "evaluacion",
      purpose: "Prueba real del prompt de evaluación: la tabla de puntajes con sus fragmentos.",
      description:
        "Captura de la tabla con los cinco criterios, el total, el veredicto y el fragmento que justifica cada puntaje. Ocultar datos personales y de cuenta.",
      alt: "Captura de la evaluación de ideas de contenido con puntajes y veredictos.",
      caption: "Prueba del prompt de evaluación.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "iteracion",
      purpose: "Prueba real del prompt de iteración: los cambios y el banco final ordenado.",
      description:
        "Captura de la tabla de cambios y de la del banco final con su prioridad y puntaje. Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de ideas de contenido y del banco final ordenado.",
      caption: "Prueba del prompt de iteración.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "verificacion",
      ratio: "16/9",
      promptId: "verificacion",
      purpose: "Prueba real del prompt de verificación: la tabla de lo que debes comprobar antes de producir.",
      description:
        "Captura de la tabla con las afirmaciones, los temas sensibles, los permisos y lo que debe comprobar la persona. Ocultar datos personales y de cuenta.",
      alt: "Captura de la lista de verificación de ideas de contenido devuelta por un asistente.",
      caption: "Prueba del prompt de verificación.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Publicar con regularidad exige tener algo que decir cada semana. A las pocas semanas aparece la hoja en blanco: no sabes qué publicar, repites lo que ya dijiste o dejas de publicar.\n\nPedirle ideas a una IA parece la salida obvia, pero una IA que no conoce tu negocio da ideas que sirven igual para cualquier otro: «tips para tus clientes», «detrás de cámaras», una frase motivacional. Suenan bien y no distinguen a tu negocio.\n\nLas buenas ideas no están en la IA: están en lo que ya sabes de tus clientes. **Tú se lo das y ella ayuda a ordenarlo, ampliarlo y filtrarlo.**",
    symptoms: [
      "Cada semana decides a última hora qué publicar, o no publicas.",
      "Tus publicaciones se parecen entre sí o a las de cualquier otro negocio del rubro.",
      "Probaste una IA y te dio listas de ideas que no reconoces como tuyas.",
      "Tus clientes te hacen preguntas todos los días, pero nunca las conviertes en contenido.",
      "No sabes cuáles de todas las ideas posibles conviene producir primero.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con un banco de ideas propio y un procedimiento para volver a llenarlo cuando se acabe, sin depender de la inspiración.",
    deliverables: [
      { label: "Tu materia prima escrita", detail: "Seis listas con lo que ya sabes de tus clientes, reutilizables cada mes." },
      { label: "Un banco de ideas con origen", detail: "Cada idea señala de dónde sale, su formato y su acción." },
      { label: "Una forma de filtrar", detail: "Una rúbrica de cinco criterios para puntuar cualquier idea." },
      { label: "Una lista de comprobación", detail: "Lo que hay que verificar antes de producir: datos, permisos y temas delicados." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes un negocio pequeño y publicas (o quieres publicar) en redes o en tu web, pero no sabes qué contar.",
      "Conoces a tus clientes: sabes qué te preguntan y qué problemas resuelves, aunque nunca lo hayas escrito.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Buscas que la IA escriba y programe las publicaciones ya terminadas: aquí se decide qué publicar, no se redacta ni se agenda.",
      "Todavía no sabes a quién le vendes ni qué ofreces: antes de las ideas necesitas esa base.",
      "Esperas ideas «virales»: nadie puede asegurarlas y esta guía no lo promete.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Patitas (ficticia) — tienda de mascotas de barrio",
    situation:
      "Patitas es una tienda con dos personas que vende collares, juguetes, rascadores y accesorios. Publica cuando se acuerda, casi siempre fotos de producto con una frase suelta, mientras los mensajes de sus clientes quedan sin aprovechar.",
    goal: "Tener un banco de ideas para el próximo mes con un único propósito: " + OBJETIVO.charAt(0).toLowerCase() + OBJETIVO.slice(1) + ".",
    data: [
      ...MATERIA.map((m) => ({ label: m.label, value: CASO[m.id] })),
      { label: "Pilares", value: PILARES },
    ],
    problem: "Cada vez que le pidieron ideas a una IA, recibieron listas genéricas, y no saben cómo decidir cuáles producir.",
    application: "Reúnen su materia prima, fijan un objetivo y unos pilares, piden un banco de ideas, lo puntúan, rehacen las flojas y verifican lo que va a publicarse.",
    result: "Un banco de ideas ordenado por prioridad, con el origen de cada idea y una lista de lo que hay que comprobar antes de publicar.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Sin estas cuatro ideas, cualquier lista de ideas parece igual de buena.",
    blocks: [
      {
        title: "Materia prima",
        detail:
          "Es lo que ya sabes de tus clientes y de tu negocio, escrito: las preguntas que te repiten, los problemas que resuelves, lo que cambia con la temporada y tus productos con su uso. Es lo que hace tuya una idea, y la IA no la tiene.",
        example: "«¿Cómo elijo el tamaño del collar?» es materia prima; «tips para tu mascota» no lo es.",
      },
      {
        title: "Pilar de contenido",
        detail: "Un tema grande sobre el que publicas a menudo. Sale de los problemas de tus clientes, no de lo que a ti te gustaría decir; tres o cuatro suelen bastar.",
        example: "«Elegir bien», «Resolver problemas» y «Preparar la llegada».",
      },
      {
        title: "Formato y canal",
        detail: "La forma de la publicación y el lugar donde la publicas. Elige solo los que puedes producir con tu tiempo real.",
      },
      {
        title: "Objetivo y una sola acción",
        detail: "Cada publicación empuja una acción: escribir, guardar, reservar, pasar por el local. Sin acción no hay cómo saber si funcionó; conviene un objetivo por mes.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Dame 20 ideas de contenido para mi tienda de mascotas.",
    whyInsufficient:
      "La IA no sabe qué te preguntan tus clientes, qué vendes ni cuánto tiempo tienes, y responde con lo más habitual en cualquier tienda de mascotas: fotos de cachorros, frases tiernas, «curiosidades» y sorteos (ejemplo ilustrativo). Son ideas que se pueden producir sin saber nada de ti, y con veinte no puedes revisarlas con cuidado.",
    issues: [
      "No hay materia prima: las ideas no salen de nada tuyo.",
      "No hay objetivo: no se sabe qué debe provocar cada idea.",
      "No hay límites: puede proponer consejos que requieren un profesional.",
      "No hay criterio para elegir cuáles hacer primero.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "El trabajo previo es escribir tu materia prima: un documento con seis listas. Si te falta información, el prompt de entrevista te ayuda a sacarla.",
    items: MATERIA.map((m) => ({ label: m.label, detail: m.detail, required: m.required })),
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    materia: {
      caption: "Ficha de materia prima",
      purpose: "Tener las seis listas en una hoja que copias, completas con tus palabras y pegas en los prompts.",
      columns: ["Lista", "Tus respuestas"],
      rows: MATERIA.map((m) => [m.label, "(escribe aquí)"]),
      note: "Si no sabes una lista todavía, escribe «no lo sé»: la IA la marcará como falta en lugar de rellenarla.",
      copyable: true,
    },
    medicion: {
      caption: "Qué mirar según el objetivo del mes",
      purpose: "Decidir qué señal observar para saber si las ideas funcionan, según lo que buscabas, sin compararte con negocios ajenos.",
      columns: ["Objetivo", "Qué mirar", "Dónde lo ves", "Cómo decidir"],
      rows: [
        ["Que te escriban", "Mensajes recibidos después de cada publicación", "Tu bandeja de entrada", "Compara con tus semanas anteriores"],
        ["Que te conozcan", "El alcance: personas distintas que la vieron", "Las estadísticas de la plataforma", "Compara con tus publicaciones anteriores"],
        ["Que interactúen", "La interacción: guardados, respuestas o compartidos", "Las estadísticas de la plataforma", "Mira qué tipos de idea generan más"],
        ["Que visiten o compren", "Pedidos que mencionan la publicación", "Preguntar «¿cómo nos conociste?»", "Anota las respuestas durante el mes"],
      ],
      note: "Cada plataforma define y mide las señales a su manera: usa sus definiciones. No hay cifras «normales» que valgan para todos los negocios.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene con un prompt en cuatro de los seis pasos. Los datos de partida y la decisión final son tuyos.",
    steps: [
      {
        title: "Reúne tu materia prima",
        description: "Escribe diez preguntas reales de clientes, dos o tres problemas, la temporada y lo que no vas a publicar. Si no te sale, salta al paso 3.",
        output: "La ficha de materia prima, en tus palabras.",
      },
      {
        title: "Elige un objetivo y tres pilares",
        description: "Decide qué quieres que pase este mes (una sola cosa) y agrupa tus preguntas y problemas en tres o cuatro pilares.",
        output: "Un objetivo del mes y una lista corta de pilares.",
      },
      {
        title: "Completa lo que falte con la entrevista",
        description: "El prompt de entrevista te pregunta de una en una y devuelve tu materia prima en una tabla, sin añadir nada.",
        output: "Las seis listas completas o con lo que falta marcado.",
      },
      {
        title: "Pide el banco de ideas",
        description: "Pega tu materia prima, tus pilares, tu objetivo y tus límites en el prompt principal. Cada idea debe decir de qué elemento sale.",
        output: "Una tabla de ideas con su origen, formato y acción.",
      },
      {
        title: "Puntúa las ideas y rehaz las flojas",
        description: "Aplica la rúbrica, a mano o con el prompt de evaluación, y rehaz o descarta lo que queda por debajo del puntaje mínimo con el de iteración.",
        output: "Un banco de ideas ordenado por prioridad.",
      },
      {
        title: "Verifica y elige las que vas a producir",
        description: "Pide la lista de comprobaciones, recórrela y elige las ideas que caben en tu tiempo. Anota el resto para el mes siguiente.",
        output: "Las ideas del mes, verificadas y listas para producir.",
      },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    entrevista: {
      title: "Prompt de entrevista: sacar tu materia prima",
      objective: "Que la IA te haga preguntas de una en una y devuelva tus seis listas de materia prima con tus propias palabras.",
      whenToUse: "Cuando tu materia prima es corta o no sabes por dónde empezar, antes del banco de ideas.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una o dos frases.", example: "Tienda de mascotas de barrio con dos personas" },
        { name: "OBJETIVO", description: "Lo que quieres que pase el próximo mes, una sola cosa.", example: OBJETIVO },
      ],
      prompt: `Actúa como un entrevistador que ayuda a un negocio pequeño a reunir su materia prima para planear contenido. Tu destinatario es la persona dueña, que conoce a sus clientes pero nunca lo escribió. Tu objetivo es completar seis listas usando SOLO lo que yo te diga.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Mi objetivo del próximo mes: {{OBJETIVO}}

### LISTAS A COMPLETAR (en este orden)
${LISTA_MATERIA}

### REGLAS
1. Hazme UNA pregunta por turno y espera mi respuesta antes de seguir. Máximo 10 preguntas.
2. No preguntes lo que ya te dije en el CONTEXTO; pregunta solo lo que falte.
3. Si una respuesta es vaga, pídeme un ejemplo real: una pregunta tal como te la hicieron o un caso concreto.
4. Distingue siempre entre lo que yo dije, lo que tú supones y lo que sugieres. Nunca conviertas una suposición en un dato.
5. Si no tengo un dato, no lo rellenes con lo habitual de mi rubro: anótalo como [FALTA: el dato] y sigue.
6. No des consejos profesionales (salud, legal, finanzas) ni evalúes ideas todavía: solo reúne.
7. Quita de mis respuestas los nombres y datos personales de clientes.

### FORMATO DE SALIDA
Al terminar (o al llegar a 10 preguntas), entrégame una tabla con columnas fijas: Lista | Lo que dije yo (con mis palabras) | Estado, con una fila por lista. El estado es COMPLETO, SUPUESTO, SUGERIDO o [FALTA: el dato]. Después, una lista «Preguntas pendientes» con cada [FALTA]. La tabla define la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Antes de entregar la tabla, verifica que: están las seis listas, en el orden indicado; cada fila usa mis palabras y no las tuyas; ningún dato apareció sin que yo lo dijera; todo lo que supusiste o sugeriste está marcado como tal; no quedó ningún nombre de cliente. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar la tabla completa en el siguiente prompt, en el lugar de la variable MATERIA_PRIMA.`,
      explanation: [
        {
          part: "Tu destinatario es la persona dueña… usando SOLO lo que yo te diga.",
          why: "Le das el papel de quien pregunta, no de quien inventa: la información sale de ti y ella solo la ordena.",
        },
        {
          part: "Distingue siempre entre lo que yo dije, lo que tú supones y lo que sugieres.",
          why: "Una suposición marcada se acepta o se corrige; una disfrazada de dato pasa sin verla.",
        },
        {
          part: "Si no tengo un dato… anótalo como [FALTA: el dato] y sigue.",
          why: "Evita que rellene un vacío con algo verosímil: queda a la vista y lo resuelves tú.",
        },
      ],
      evaluate: "Comprueba que cada fila usa tus palabras y que lo que no sabías dice [FALTA].",
      improve: "Si una respuesta quedó vaga, contesta con un ejemplo real y pide reescribir solo esa fila.",
      conversation: [
        { who: "ia", text: "Ya sé que es una tienda de mascotas y que quieres que te escriban por mensaje. Primera pregunta: ¿qué te preguntan más seguido los clientes?" },
        { who: "tu", text: "Qué tamaño de collar comprar, y cómo hacer que un gato use el rascador." },
        { who: "ia", text: "Anotado. ¿Puedes contarme una de esas preguntas tal como te la hicieron, con las palabras del cliente?" },
      ],
      warnings: ["No pegues datos personales de clientes: cuéntalo sin identificarlos."],
    },

    principal: {
      title: "Prompt principal: banco de ideas a partir de tu materia prima",
      objective: "Obtener una tabla de ideas repartidas entre tus pilares, donde cada una señala de qué elemento de tu materia prima sale.",
      whenToUse: "Cuando tienes tu materia prima escrita, un objetivo y unos pilares.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio.", example: "Tienda de mascotas de barrio" },
        { name: "PUBLICO", description: "A quién le hablas.", example: "Personas con perros o gatos, muchas con su primera mascota" },
        { name: "OBJETIVO", description: "Lo que quieres que pase este mes.", example: "Que escriban por mensaje para consultar" },
        { name: "PILARES", description: "Tres o cuatro temas grandes.", example: PILARES },
        { name: "MATERIA_PRIMA", description: "La tabla de la entrevista o tu ficha completa.", example: "Tus seis listas, en tus palabras" },
        { name: "FORMATOS", description: "Los que puedes producir con tu tiempo.", example: "Imagen con texto · serie de imágenes" },
        { name: "LIMITES", description: "Lo que no vas a publicar.", example: CASO.limites },
        { name: "CANTIDAD", description: "Cuántas ideas quieres como máximo.", example: "8" },
      ],
      prompt: `Actúa como estratega de contenido para negocios pequeños. Tu destinatario es la persona dueña, que decidirá qué producir. Tu objetivo es proponer IDEAS de publicaciones (no las escribas) a partir de su materia prima real.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
A quién le hablo: {{PUBLICO}}
Objetivo del próximo mes: {{OBJETIVO}}
Pilares: {{PILARES}}

### DATOS (los que YO te doy; son la única fuente de hechos)
Materia prima:
{{MATERIA_PRIMA}}

Formatos que puedo producir: {{FORMATOS}}
Lo que no debo publicar: {{LIMITES}}

### REGLAS
1. Cada idea debe salir de un elemento concreto de mi materia prima. Si no puedes señalar de cuál, no la propongas.
2. No inventes datos, cifras, precios, promociones ni opiniones de clientes. Si a una idea le falta un dato, escribe [FALTA: el dato].
3. No repitas la misma idea con otras palabras y reparte las ideas entre los pilares.
4. No propongas nada que toque lo que no debo publicar ni que exija consejos profesionales.
5. Pide solo lo que cabe en mis formatos.
6. Cada idea lleva una acción para quien la vea.
7. Si mi materia prima tiene pocos elementos, propón menos ideas que las pedidas y dime qué falta.
8. Distingue en cada idea lo que sale de mis datos, lo que supones y lo que sugieres.

### FORMATO DE SALIDA
Una tabla con columnas fijas: Pilar | Idea (una frase) | De dónde sale (el elemento exacto) | Formato | Acción | Material necesario | Origen (mis datos, supuesto o sugerido), con {{CANTIDAD}} filas como máximo. Después, una lista «FALTA» con cada [FALTA]. La tabla define la forma; el contenido sale de mi materia prima.

### ANTES DE RESPONDER
Verifica que: cada idea señala un elemento de mi materia prima; ninguna toca lo que no debo publicar; no hay datos, cifras ni promociones que yo no diera; las ideas no se repiten; cada formato es uno de los míos; cada fila tiene su acción. Corrige o elimina lo que no cumpla.`,
      explanation: [
        {
          part: "Cada idea debe salir de un elemento concreto de mi materia prima.",
          why: "Es lo que evita las ideas genéricas: si no puede señalar de dónde sale, probablemente la sacó de su costumbre.",
        },
        {
          part: "…una tabla con columnas fijas… De dónde sale (el elemento exacto)",
          why: "Te obliga a ver el origen de cada idea para poder comprobarlo tú.",
        },
        {
          part: "Si mi materia prima tiene pocos elementos, propón menos ideas…",
          why: "Impide rellenar con ideas de relleno cuando el material no alcanza.",
        },
      ],
      evaluate: "Comprueba que puedes señalar en tu materia prima el origen de cada idea y que cada acción sirve a tu objetivo.",
      improve: "Si salen muchas parecidas, añade materia prima o cambia los pilares; pedir más ideas no lo arregla.",
      warnings: ["Pide pocas ideas (de 8 a 12): cuantas más pidas, más se parecen y menos las revisas."],
    },

    evaluacion: {
      title: "Prompt de evaluación: puntuar las ideas con la rúbrica",
      objective: "Que la IA puntúe cada idea con los cinco criterios de la rúbrica, con fragmentos de apoyo, y marque las que no debes producir.",
      whenToUse: "Justo después de recibir el banco de ideas, en la misma conversación.",
      variables: [
        { name: "IDEAS", description: "La tabla de ideas que quieres evaluar.", example: "La tabla del prompt principal" },
        { name: "TIEMPO_DISPONIBLE", description: "El tiempo real que tienes para producir.", example: "2 horas por semana" },
      ],
      prompt: `Actúa como revisor de ideas de contenido para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá qué producir. Tu objetivo es puntuar cada idea con una rúbrica fija y marcar las que no debe producir. No las reescribas.

### CONTEXTO
Usa la materia prima, el objetivo y lo que no debo publicar de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Ideas a evaluar:
{{IDEAS}}

Tiempo y formatos que tengo: {{TIEMPO_DISPONIBLE}}

### RÚBRICA (puntúa cada criterio de 0 a 2: 0 = no cumple, 1 = en parte, 2 = cumple)
${LISTA_CRITERIOS}

### REGLAS
1. Puntúa con severidad: si dudas entre dos puntajes, pon el más bajo y explica la duda.
2. Cada puntaje se apoya en un fragmento literal de la idea o de mi materia prima, entre comillas. Sin fragmento no hay puntaje: escribe [FALTA: evidencia].
3. En «${CRITERIOS[0].corto}», comprueba que el elemento citado sostiene de verdad la idea; si el vínculo es forzado, puntúa 0 y dilo.
4. Si una idea toca algo de mi lista de lo que no debo publicar, o saca 0 en «${CRITERIOS[0].corto}», márcala NO PRODUCIR aunque el total sea alto.
5. Si el objetivo o mi materia prima son ambiguos en algo que cambia un puntaje, pregúntame en lugar de decidir tú.
6. Aclara que esta revisión es una ayuda y que la decisión final es mía.

### FORMATO DE SALIDA
Una tabla con columnas fijas: Idea | ${COLUMNAS_CRITERIOS} | Total (máximo ${MAXIMO}) | Veredicto | Fragmento que justifica. El veredicto es «${RESULTADOS[0].label}» (menos de ${RESULTADOS[1].min}), «${RESULTADOS[1].label}» (de ${RESULTADOS[1].min} a ${RESULTADOS[2].min - 1}), «${RESULTADOS[2].label}» (${RESULTADOS[2].min} o más) o NO PRODUCIR. Ordena las filas de mayor a menor total. La tabla define la forma; el contenido sale de mis ideas.

### ANTES DE RESPONDER
Verifica que: cada idea tiene sus cinco puntajes y su fragmento literal; los totales suman bien (máximo ${MAXIMO}); aplicaste NO PRODUCIR donde correspondía; no reescribiste ninguna idea. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cada puntaje se apoya en un fragmento literal… Sin fragmento no hay puntaje",
          why: "Te da algo comprobable: si el fragmento no está, ese puntaje no merece confianza.",
        },
        {
          part: "…comprueba que el elemento citado sostiene de verdad la idea…",
          why: "Un origen nombrado no basta: pide comprobar que la relación es real y no forzada.",
        },
        {
          part: "…márcala NO PRODUCIR aunque el total sea alto.",
          why: "Un total alto no compensa tocar un tema que no vas a publicar.",
        },
      ],
      evaluate: "Busca en el texto el fragmento de dos puntajes al azar; si no existe, desconfía de la tabla.",
      improve: "Si todo puntúa casi igual, pide más severidad en «Origen» y «Acción», los que más se regalan.",
      warnings: ["Puede equivocarse al puntuar: repasa tú las ideas con 9 o 10."],
    },

    iteracion: {
      title: "Prompt de iteración: rehacer las ideas flojas",
      objective: "Que la IA rehaga las ideas que sacaron poco puntaje, ancladas a un elemento concreto de tu materia prima, o las descarte, y entregue el banco final ordenado.",
      whenToUse: "Después de la evaluación, cuando hay ideas por debajo del puntaje mínimo.",
      variables: [{ name: "PUNTAJE_MINIMO", description: "Puntaje por debajo del cual una idea se rehace.", example: String(RESULTADOS[1].min) }],
      prompt: `Actúa como editor de ideas de contenido para un negocio pequeño. Tu destinatario es la persona dueña, que armará su banco de ideas del mes. Tu objetivo es rehacer o descartar las ideas flojas y entregar el banco final ordenado, sin añadir ideas nuevas.

### CONTEXTO
Usa la materia prima, el objetivo y la evaluación de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Puntaje mínimo aceptado: {{PUNTAJE_MINIMO}} (las ideas con menos puntos se rehacen o se descartan; las marcadas NO PRODUCIR se descartan).

### REGLAS
1. Para cada idea por debajo del mínimo, di en una frase qué criterio falló.
2. Rehazla para que salga de un elemento concreto de mi materia prima y sirva a mi objetivo, o descártala si no tiene arreglo.
3. No añadas ideas nuevas ni datos que yo no diera; si a una idea rehecha le falta un dato, escribe [FALTA: el dato].
4. Reevalúa las ideas rehechas con los mismos criterios y escribe su nuevo puntaje.
5. Si mi materia prima no alcanza para rehacer una idea, dilo en lugar de forzar un origen.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla con columnas fijas Idea original | Criterio que falló | Idea rehecha o DESCARTADA | Motivo; (2) «Banco final»: una tabla con columnas fijas ${BANCO.join(" | ")}, ordenada de mayor a menor puntaje, con el estado «por hacer» en todas las filas. Las tablas definen la forma; el contenido sale de mi evaluación.

### ANTES DE RESPONDER
Verifica que: ninguna idea del banco final tiene menos puntaje que el mínimo; cada una señala un elemento de mi materia prima; cada acción sirve a mi objetivo; no hay ideas nuevas; el orden es de mayor a menor puntaje. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Rehazla para que salga de un elemento concreto de mi materia prima y sirva a mi objetivo…",
          why: "Corrige el fondo, no la forma: una idea floja se ancla a un dato real o se abandona.",
        },
        {
          part: "No añadas ideas nuevas…",
          why: "Evita que compense con ideas de relleno; las ideas nuevas vienen de materia prima nueva.",
        },
        {
          part: "Si mi materia prima no alcanza para rehacer una idea, dilo en lugar de forzar un origen.",
          why: "Impide repetir el origen forzado que ya detectó la evaluación.",
        },
      ],
      evaluate: "Compara cada idea rehecha con la original: debe ser más concreta, no solo más larga.",
      improve: "Si una idea sigue floja tras rehacerla, descártala.",
    },

    verificacion: {
      title: "Prompt de verificación: qué debes comprobar tú",
      objective: "Que la IA liste, para cada idea final, las afirmaciones, los permisos y los temas delicados, sin dar nada por verdadero.",
      whenToUse: "Con el banco final ya elegido, antes de producir cualquier publicación.",
      variables: [{ name: "TEMAS_SENSIBLES", description: "Temas en los que un error o un consejo mal dado tendría consecuencias.", example: "Salud de las mascotas, precios, promociones y sorteos" }],
      prompt: `Actúa como revisor de ideas de contenido para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá qué producir. Tu objetivo es señalar lo que ella debe comprobar en cada idea del banco final. No des nada por verdadero ni juzgues su legalidad.

### CONTEXTO
Usa el banco final y mi materia prima de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Temas sensibles de mi rubro: {{TEMAS_SENSIBLES}}

### REGLAS
1. Para cada idea, lista las afirmaciones, cifras, fechas, precios o promesas que contiene o implica.
2. Marca cuáles NO salieron de mi materia prima: esas las debo comprobar yo.
3. Indica si toca alguno de los temas sensibles y qué precaución conviene (por ejemplo, no dar consejos que requieren un profesional).
4. Indica si necesita permiso de terceros: fotos de clientes, marcas, música o textos ajenos.
5. No afirmes que una idea cumple normas de publicidad ni de una plataforma; recuérdame que debo consultarlas.
6. Si una idea no permite comprobar nada (es demasiado vaga), dilo en lugar de inventar un punto de control.

### FORMATO DE SALIDA
Una tabla con columnas fijas: Idea | Afirmaciones o promesas | ¿Sale de mi materia prima? (Sí o NO) | Tema sensible o permiso | Qué debo comprobar yo. Al final, «Antes de producir»: los tres puntos más urgentes. La tabla define la forma; el contenido sale de mis ideas.

### ANTES DE RESPONDER
Verifica que: cada idea del banco final está en la tabla; ningún «Sí» carece de un elemento exacto de mi materia prima; los permisos y temas sensibles están señalados; no dijiste que una idea cumple normas. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Marca cuáles NO salieron de mi materia prima: esas las debo comprobar yo.",
          why: "Separa lo que sabes de lo que la IA añadió, que es donde suelen aparecer los datos inventados.",
        },
        {
          part: "Indica si toca alguno de los temas sensibles…",
          why: "Le indica dónde pisar con cuidado, según tu rubro; la lista de temas la decides tú.",
        },
        {
          part: "No afirmes que una idea cumple normas de publicidad…",
          why: "Cambia la tarea de «asegurar» a «señalar»: te ayuda a encontrar qué revisar, no a asegurarlo.",
        },
      ],
      evaluate: "Comprueba que la lista señala cosas concretas (una cifra, una fecha) y no solo «verifica los datos».",
      improve: "Añade a los temas sensibles lo que te haya dado problemas antes.",
      warnings: ["La lista no sustituye la comprobación: tú confirmas cada punto con tu propia fuente."],
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt principal a la materia prima de Patitas, con CANTIDAD = 8. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Ideas propuestas por la IA",
          purpose: "Ver el banco tal como llega, con el formato que pidió el prompt, para evaluarlo idea por idea.",
          columns: ["Pilar", "Idea", "De dónde sale", "Formato", "Acción", "Material necesario", "Origen"],
          rows: [
            ["Elegir bien", "1. Cómo elegir el tamaño del collar de tu perro", "Pregunta: tamaño de collares", "Serie de imágenes", "Escríbenos la medida del cuello", "Una cinta métrica y un collar del local", "Sugerido"],
            ["Elegir bien", "2. Qué juguete resiste a un perro que rompe todo", "Problema: el perro rompe los juguetes", "Imagen con texto", "Escríbenos y te mostramos los materiales", "Una foto de un juguete del local", "Sugerido"],
            ["Resolver problemas", "3. Tu gato no usa el rascador: qué probar", "Problema: el gato no usa el rascador", "Imagen con texto", "Cuéntanos qué probaste", "Una foto de un rascador", "Sugerido"],
            ["Resolver problemas", "4. Cómo presentarle un rascador a un gato", "Pregunta: cómo presentar un rascador a un gato", "Serie de imágenes", "Sigue nuestra página para más consejos", "Fotos paso a paso de una sesión con un gato", "Sugerido"],
            ["Preparar la llegada", "5. Qué necesita un cachorro los primeros días", "Pregunta: qué necesita un cachorro", "Serie de imágenes", "Guarda esta lista", "Fotos de los productos del local", "Sugerido"],
            ["Preparar la llegada", "6. Lo que tu gato nuevo agradecerá en casa", "Pregunta: qué necesita un cachorro", "Imagen con texto", "Escríbenos para armar su kit", "Una foto de un rascador y un juguete", "Sugerido"],
            ["Resolver problemas", "7. Paseos con lluvia: qué conviene llevar", "Temporada: lluvias", "Imagen con texto", "Comenta qué llevas tú", "Fotos de accesorios del local", "Sugerido"],
            ["Elegir bien", "8. Tres preguntas del mes, respondidas", "Preguntas reales de clientes", "Serie de imágenes", "Envíanos tu pregunta", "Las preguntas, sin nombres", "Mis datos"],
          ],
          note: "FALTA: ninguno.",
        },
      },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "ideas",
    title: "Puntúa tus propias ideas",
    intro:
      "Elige una idea (tuya o de la IA) y responde los cinco criterios: 0, 1 o 2 puntos cada uno, hasta " +
      MAXIMO +
      ". Si «" +
      CRITERIOS[0].label +
      "» saca 0, o si toca algo de lo que no vas a publicar, no se produce aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.",
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro: "A simple vista es un banco razonable, y ninguna idea inventa datos. Con la materia prima al lado, se ve dónde flojea.",
    criteria: [
      {
        criterionId: "origen",
        verdict: "improve",
        comment: "La idea 6 cita «qué necesita un cachorro» para hablar de un gato nuevo: el origen no sostiene la idea.",
      },
      {
        criterionId: "cliente",
        verdict: "ok",
        comment: "Siete de las ocho responden a una pregunta o a un problema que aparece en tu materia prima; la excepción es la 6.",
      },
      {
        criterionId: "tiempo",
        verdict: "improve",
        comment: "La idea 4 pide fotos paso a paso de una sesión con un gato: con dos horas semanales, no cabe.",
      },
      {
        criterionId: "propia",
        verdict: "ok",
        comment: "Casi todas nombran algo de la tienda: collares, rascadores, la lluvia o los juguetes; la 8 es la más genérica.",
      },
      {
        criterionId: "accion",
        verdict: "risk",
        comment: "Las ideas 3, 4, 5 y 7 piden contar, seguir la página, guardar la lista o comentar: ninguna lleva a escribir por mensaje, que era el objetivo.",
      },
    ],
    conclusion:
      "Siete de las ocho ideas sirven, cuatro de ellas con retoques, y una debe descartarse. Lo que falla no es el contenido sino el vínculo con tu objetivo, y se corrige con la segunda vuelta.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar no es pedir «dame más ideas»: es pedir que se corrijan las que fallaron según un criterio, con la materia prima como base.",
    promptId: "iteracion",
    why: "El análisis mostró que el problema es la acción y el origen, no la cantidad. Rehacer las ideas ancladas a un elemento real y a tu objetivo, o descartarlas, arregla el fondo.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro:
      "Salida ilustrativa del prompt de iteración con PUNTAJE_MINIMO = " +
      RESULTADOS[1].min +
      ". Los puntajes los asignó la IA y son una ayuda; la decisión final es tuya.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Cambios de la segunda vuelta",
          purpose: "Comprobar qué se rehízo, qué se descartó y por qué.",
          columns: ["Idea original", "Criterio que falló", "Idea rehecha o DESCARTADA", "Motivo"],
          rows: [
            ["3 · Tu gato no usa el rascador…", "Acción", "Misma idea, con la acción «Escríbenos qué probaste»", "La acción original no llevaba al mensaje."],
            ["4 · Cómo presentarle un rascador a un gato", "Tiempo y acción", "Tres pasos en una imagen con texto y la acción «Escríbenos y te ayudamos a elegir»", "Una imagen con texto cabe en tu tiempo."],
            ["5 · Qué necesita un cachorro los primeros días", "Acción", "Misma idea, con la acción «Escríbenos y armamos tu lista»", "Guardar una lista no lleva al mensaje."],
            ["6 · Lo que tu gato nuevo agradecerá en casa", "Origen", "DESCARTADA", "Tu materia prima no habla de gatos recién llegados."],
            ["7 · Paseos con lluvia…", "Acción", "Misma idea, con la acción «Escríbenos qué necesitas para tu paseo»", "Comentar no lleva al mensaje."],
          ],
        },
      },
      {
        type: "table",
        table: {
          caption: "Banco de ideas de Patitas, por prioridad",
          purpose: "Tener el banco listo para usar, ordenado por puntaje y con su estado, que se copia a una hoja de cálculo.",
          columns: [...BANCO],
          rows: [
            ["1", "Cómo elegir el tamaño del collar de tu perro", "Elegir bien", "Pregunta: tamaño de collares", "Serie de imágenes", "Escríbenos la medida del cuello", "10/10", "por hacer"],
            ["2", "Tu gato no usa el rascador: qué probar", "Resolver problemas", "Problema: el gato no usa el rascador", "Imagen con texto", "Escríbenos qué probaste", "9/10", "por hacer"],
            ["3", "Qué necesita un cachorro los primeros días", "Preparar la llegada", "Pregunta: qué necesita un cachorro", "Serie de imágenes", "Escríbenos y armamos tu lista", "9/10", "por hacer"],
            ["4", "Qué juguete resiste a un perro que rompe todo", "Elegir bien", "Problema: el perro rompe los juguetes", "Imagen con texto", "Escríbenos y te mostramos los materiales", "8/10", "por hacer"],
            ["5", "Cómo presentarle un rascador a un gato: tres pasos", "Resolver problemas", "Pregunta: cómo presentar un rascador a un gato", "Imagen con texto", "Escríbenos y te ayudamos a elegir", "8/10", "por hacer"],
            ["6", "Paseos con lluvia: qué conviene llevar", "Resolver problemas", "Temporada: lluvias", "Imagen con texto", "Escríbenos qué necesitas para tu paseo", "7/10", "por hacer"],
            ["7", "Tres preguntas del mes, respondidas", "Elegir bien", "Preguntas reales de clientes", "Serie de imágenes", "Envíanos tu pregunta", "7/10", "por hacer"],
          ],
          copyable: true,
        },
      },
    ],
  },

  /* ───────────────────────────── ejemplos ───────────────────────────── */
  examples: [
    {
      id: "restaurante",
      title: "Restaurante: la temporada la marca la cocina",
      business: "Restaurante Sal y Brasa (ficticio)",
      scenario: "Publica sus platos del día sin variedad; su materia prima cambia cada semana según la cocina.",
      keyData: [
        { label: "Materia prima", value: "Platos de la semana, ingredientes que confirma la cocina y preguntas sobre reservas" },
        { label: "Objetivo", value: "Que reserven mesa entre semana" },
        { label: "Límite", value: "Solo se anuncia lo que la cocina confirmó" },
      ],
      approach: "Cada lunes pega la lista real de platos e ingredientes, y las ideas se ligan a ellos: qué lleva, para quién es y cómo reservar.",
      decision: "No anuncia un plato que la cocina no confirmó, aunque suene bien.",
      fictional: true,
    },
    {
      id: "servicio",
      title: "Servicio profesional: explicar sin aconsejar",
      business: "Estudio contable Cifra Clara (ficticio)",
      scenario: "Recibe las mismas preguntas sobre trámites y quiere convertirlas en contenido, pero un consejo mal dado puede perjudicar a alguien.",
      keyData: [
        { label: "Materia prima", value: "Preguntas frecuentes de clientes, sin datos personales" },
        { label: "Objetivo", value: "Que pidan una consulta" },
        { label: "Límite", value: "Explicación general; el caso particular se consulta" },
      ],
      approach: "Cada idea explica el concepto en general y termina invitando a consultar el caso propio; el prompt de verificación marca cualquier afirmación sobre normas.",
      decision: "Cada afirmación sobre normas se verifica en una fuente oficial antes de publicar, y las ideas no dan recomendaciones individuales.",
      fictional: true,
    },
  ],

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Pedir ideas sin darle nada de tu negocio",
      whyItHurts: "La IA rellena con lo más habitual del rubro, y esas ideas no distinguen a tu negocio de otros.",
      instead: "Escribe tu materia prima primero; si te cuesta, usa la entrevista.",
    },
    {
      title: "Pedir muchísimas ideas de una vez",
      whyItHurts: "Cuantas más pides, más se parecen y menos las revisas con cuidado.",
      instead: "Pide entre 8 y 12 y, si hacen falta más, añade materia prima antes de volver a pedir.",
    },
    {
      title: "Publicar la primera idea sin evaluarla",
      whyItHurts: "Una idea puede sonar bien y citar un origen que no la sostiene, o pedir una acción que no lleva a tu objetivo.",
      instead: "Puntúa cada idea con la rúbrica y rehaz o descarta las flojas.",
    },
    {
      title: "No tener un objetivo",
      whyItHurts: "Sin objetivo no hay acción, y sin acción no sabes si funcionó ni qué repetir.",
      instead: "Un objetivo por mes y una acción por publicación.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de producir una idea, recorre esta lista. Marca cada punto cuando lo hayas comprobado tú.",
    items: [
      { label: "Puedo señalar de qué pregunta, problema o temporada real sale cada idea." },
      { label: "Cada dato, cifra o «curiosidad» está verificado en una fuente fiable.", detail: "Si no lo verifiqué, lo quito." },
      { label: "Ninguna idea da consejos que requieren un profesional (salud, legal, finanzas) ni promete resultados." },
      { label: "Tengo permiso para mostrar fotos de clientes, marcas, música o textos de otros." },
      { label: "Los precios, promociones y fechas que aparecen están vigentes." },
      { label: "Puedo producirla con mi tiempo y mis formatos." },
      { label: "Revisé las reglas de la plataforma y de mi país sobre publicidad, sorteos y uso de imágenes.", detail: "Varían según el lugar; esta guía no las cubre." },
    ],
    principle: "La IA ayuda a generar y a señalar qué revisar. La persona verifica y decide.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con el banco listo, el trabajo pasa a ser mantenerlo. El mes siguiente parte de lo que ya tienes.",
    steps: [
      { title: "Cambia el estado de cada idea", detail: "Pasa cada idea de «por hacer» a «en producción» y «publicada»." },
      { title: "Anota la señal de cada publicación", detail: "Una línea por idea con la señal que elegiste, sea mensajes, guardados o alcance." },
      { title: "Añade materia prima nueva", detail: "Cada semana, suma las preguntas que llegaron: alimentan el próximo banco." },
      { title: "Repite el proceso cuando el banco se acabe", detail: "Normalmente una vez al mes; empieza por la materia prima y no por la lista de ideas." },
      { title: "Revisa qué tipo de idea funcionó", detail: "Al cierre del mes, mira qué pilares o formatos trajeron más de lo que buscabas." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ayuda a decidir qué publicar, pero tiene límites.",
    items: [
      { title: "No conoce tus resultados", detail: "La IA no ve qué le ha funcionado a tu negocio ni cómo funciona hoy cada plataforma." },
      { title: "Puede añadir datos", detail: "Aunque el prompt lo prohíba, puede colar una curiosidad, una cifra o una promesa: por eso existe la verificación." },
      { title: "No sustituye tu criterio", detail: "Las ideas son propuestas: decidir cuáles encajan con tu marca y tus clientes es tuyo." },
      { title: "No redacta ni programa por ti", detail: "Termina en un banco de ideas priorizado; escribir cada publicación es otro paso." },
      { title: "No sustituye la asesoría profesional", detail: "En salud, legal o finanzas, una publicación no reemplaza a un profesional." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Las buenas ideas de contenido no las tiene la IA: las tienes tú, en lo que te preguntan tus clientes y en los problemas que resuelves. La IA ayuda a ordenarlas, ampliarlas y filtrarlas, siempre que le des material y criterios.",
    takeaways: [
      "La materia prima es lo que hace tuyas las ideas.",
      "Un objetivo por mes y una acción por publicación.",
      "Pide pocas ideas y exige que cada una diga de dónde sale.",
      "Puntúa siempre con la misma rúbrica y verifica antes de producir.",
    ],
    nextGuide: "crear-publicaciones-para-redes-sociales-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["prompt", "asistente-ia", "variable", "materia-prima", "pilar-de-contenido", "formato", "canal", "llamada-a-la-accion", "rubrica", "alcance", "interaccion", "dato-inventado"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Cuántas ideas debo pedir?",
      answer: "Entre 8 y 12 es un buen punto de partida. Si necesitas más, añade materia prima en lugar de subir la cantidad.",
    },
    {
      question: "¿Sirve si mi negocio es nuevo y tengo pocos datos?",
      answer: "Sí. Empieza por la entrevista: la IA te pregunta y tú respondes con lo poco o mucho que sepas. Las preguntas de tus clientes serán tu mejor materia prima.",
    },
    {
      question: "¿Puedo copiar ideas de otros negocios?",
      answer: "Puedes inspirarte, pero no copiar textos ni imágenes, y una idea copiada tampoco te distingue: pregúntate qué versión saldría de tu materia prima.",
    },
    {
      question: "¿La IA sabe qué funciona en cada plataforma?",
      answer: "No con fiabilidad: las plataformas cambian y no conoce tus resultados. Confía en tus propias señales y compara con tus publicaciones anteriores.",
    },
  ],
});
