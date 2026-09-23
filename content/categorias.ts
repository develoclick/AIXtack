/**
 * Registro de categorías. Son exactamente 5 y funcionan como páginas de área
 * (/marketing, /ventas, /clientes, /analisis, /negocio).
 *
 * Una categoría nueva solo debe crearse si existe un área con contenido propio
 * suficiente — nunca porque aparezca una herramienta nueva. Añadir una categoría exige
 * escribir su introducción editorial (150–300 palabras propias): no se admite una descripción
 * genérica a la que solo se le cambia el nombre.
 */
export interface Category {
  slug: string;
  /** Nombre corto para navegación y breadcrumbs. */
  name: string;
  /** H1 de la página de área. */
  title: string;
  /** Meta description de la página de área. */
  description: string;
  /** Introducción editorial propia (párrafos): 150–300 palabras en total. */
  intro: string[];
  /** Situaciones concretas que esta categoría ayuda a resolver. */
  problems: string[];
}

export const categories = [
  {
    slug: "marketing",
    name: "Marketing",
    title: "IA para el marketing de tu negocio",
    description:
      "Herramientas para crear anuncios, promociones, afiches, publicaciones y calendarios de contenido con IA: llena los datos, copia el prompt y revisa el resultado.",
    intro: [
      "El marketing de un negocio pequeño rara vez tiene un equipo detrás: eres tú quien decide la oferta del fin de semana, escribe el mensaje, prepara el afiche y publica en redes, casi siempre con el tiempo justo. La IA puede ahorrarte buena parte de ese trabajo, siempre que le des lo que no puede saber por sí sola: qué ofreces, a qué precio, hasta cuándo y qué quieres que haga quien te lea.",
      "Las herramientas de esta área parten de esas tareas. Cada una te pide pocos datos, arma con ellos un prompt y te lo deja listo para copiar y pegar en el asistente de IA que uses. Lo que falta queda marcado como pendiente en lugar de inventarse, y el texto que recibes es un borrador que tú revisas antes de publicar.",
      "Cuando hay números de por medio, como en una promoción, el margen y las ventas necesarias los calcula la propia página y no la IA, que recibe las cifras ya hechas. Los negocios de los ejemplos son ficticios y están marcados como tales, y cada herramienta termina con una lista de comprobación para revisar precios, fechas y condiciones.",
    ],
    problems: [
      "Tienes una promoción para este fin de semana y no sabes cómo comunicarla.",
      "Quieres diseñar una oferta (2x1, combos, descuentos) sin poner en riesgo tu margen.",
      "Necesitas el texto de un afiche antes de llevarlo a una herramienta de diseño.",
      "No sabes qué publicar en redes ni con qué frecuencia.",
      "Quieres saber cuántas publicaciones caben de verdad en tu tiempo.",
    ],
  },
  {
    slug: "ventas",
    name: "Ventas",
    title: "IA para vender mejor: productos, cotizaciones y precios",
    description:
      "Herramientas para describir productos sin inventar datos, preparar cotizaciones con los totales correctos y calcular precios y márgenes con apoyo de la IA.",
    intro: [
      "Vender implica mucho trabajo de escritorio que no se ve: explicar por escrito qué ofreces, responder «¿cuánto me sale?» con una cotización clara y decidir un precio que cubra tus costos. Es un trabajo repetitivo y sensible, porque un error en un precio, un total o una condición se paga después, con un cliente molesto o con una ganancia que no existe.",
      "En esta área la IA se usa con una regla fija: los cálculos los hace la página, con fórmulas que tienen casos de prueba, y la IA redacta, ordena e interpreta a partir de esas cifras ya hechas. Las decisiones, como qué precio cobrar o qué condiciones ofrecer, las tomas tú.",
      "Las descripciones y las cotizaciones que obtienes solo usan los datos que comprobaste. Si no tienes un dato, como el plazo de entrega o la duración de un producto, el prompt lo marca como pendiente en lugar de rellenarlo. Cada herramienta incluye un ejemplo con un negocio ficticio y una lista para revisar el resultado antes de enviarlo.",
    ],
    problems: [
      "Tienes los datos básicos de un producto y necesitas una descripción que ayude a venderlo.",
      "Un cliente pide precio y quieres responder con una cotización clara y sin ambigüedades.",
      "No sabes cómo calcular el precio de un producto o servicio, ni qué margen te queda.",
      "Quieres saber si el precio que piensas cobrar cubre tus costos.",
    ],
  },
  {
    slug: "clientes",
    name: "Clientes",
    title: "IA para atender a tus clientes",
    description:
      "Herramientas para responder consultas, contestar reclamos y entender las opiniones de tus clientes con IA, sin perder el trato personal ni enviar nada sin revisarlo.",
    intro: [
      "La relación con los clientes se juega en muchos mensajes pequeños: una consulta de precio por WhatsApp, un reclamo por un pedido que llegó tarde, una reseña que no te deja tranquilo. Responder bien y a tiempo cuesta esfuerzo, sobre todo cuando quien contesta también es quien atiende, produce y administra.",
      "Las herramientas de esta área te ayudan a preparar respuestas y a entender qué dicen tus clientes, con límites claros. La IA prepara borradores y tú los revisas antes de enviarlos. Hay consultas y reclamos que no se preparan con IA, como los que mencionan salud, seguridad o dinero, y las herramientas te lo advierten.",
      "Los datos personales de tus clientes no hacen falta para redactar una respuesta ni para analizar opiniones: cada herramienta te pide quitarlos antes de pegar el texto. Cuando hay que contar, por ejemplo cuántas reseñas mencionan un tema, lo cuenta la página con las palabras que tú eliges, y la IA lee, cita y propone.",
    ],
    problems: [
      "Te hacen las mismas preguntas todos los días (precios, horarios, disponibilidad).",
      "Tienes decenas de opiniones y no sabes qué patrones se repiten.",
      "Recibiste un reclamo y quieres responder con calma, sin prometer lo que no puedes cumplir.",
    ],
  },
  {
    slug: "analisis",
    name: "Análisis",
    title: "IA para analizar tu negocio y decidir con más criterio",
    description:
      "Herramientas para calcular tu punto de equilibrio y entender tus ventas con IA, separando los datos de las hipótesis y sin delegar los cálculos.",
    intro: [
      "Analizar un negocio pequeño suele significar mirar hojas de cálculo o cuadernos y sacar conclusiones a ojo. La IA puede ayudarte a ordenar esa información y a hacerte mejores preguntas, pero no sabe nada de tu negocio que tú no le hayas contado, y puede presentar una explicación dudosa con la misma seguridad que un dato comprobado.",
      "Por eso las herramientas de esta área insisten en tres cosas. Los datos los aportas tú, los cálculos (totales, promedios, puntos de equilibrio) los hace la página con fórmulas probadas, y las conclusiones se tratan como hipótesis hasta que las compruebas. La decisión siempre es tuya.",
      "Tampoco predicen el futuro: te dicen cuánto necesitas vender para no perder, qué cambió entre dos períodos o qué dato falta para comparar de forma justa, y te proponen qué comprobar. Con pocos meses de datos no hay tendencias, y las herramientas lo dicen en cada respuesta. Los ejemplos son de negocios ficticios.",
    ],
    problems: [
      "Quieres saber cuánto necesitas vender al mes y por día para no perder dinero.",
      "Quieres entender qué pasó con tus ventas: qué se vende, qué no y qué preguntas conviene investigar.",
      "Tienes una tabla de ventas y no sabes por dónde empezar a leerla.",
      "Quieres comparar dos meses sin confundir una hipótesis con una causa.",
    ],
  },
  {
    slug: "negocio",
    name: "Negocio",
    title: "IA para organizar y ordenar tu negocio",
    description:
      "Herramientas para organizar tus pendientes, armar el plan de la semana y dejar por escrito los procesos que repites, con IA y con revisión humana en cada paso.",
    intro: [
      "Además de vender y comunicar, un negocio pequeño exige mucho trabajo interno: recordar qué está pendiente, decidir qué va primero, explicarle a otra persona cómo se hace algo. Cuando todo vive solo en tu cabeza, cualquier imprevisto desordena el día y el conocimiento se pierde cuando alguien falta.",
      "Las herramientas de esta área usan la IA como asistente de orden. Convierten una lista desordenada de pendientes en prioridades y en un plan que cabe en tu semana, ayudan a dejar por escrito los procesos que repites y proponen una rutina diaria corta que puedas mantener. Sin sistemas complejos.",
      "La página calcula cuánto tiempo libre tienes y cuántas tareas caben; la IA propone el orden y tú decides. Lo que no sabes, como cuánto tarda una tarea, no se inventa: se deja fuera del plan hasta que lo mides. Los ejemplos usan negocios ficticios y cada herramienta cierra con una lista para revisar el resultado.",
    ],
    problems: [
      "Tienes una lista de pendientes desordenada y no sabes por dónde empezar.",
      "Hay tareas que solo tú sabes hacer y quisieras dejarlas por escrito (por ejemplo, cómo registrar un pedido).",
      "Quieres una rutina diaria corta que puedas mantener.",
    ],
  },
] as const satisfies readonly Category[];

export type CategorySlug = (typeof categories)[number]["slug"];

export function getCategory(slug: string): (typeof categories)[number] | undefined {
  return categories.find((category) => category.slug === slug);
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return categories.some((category) => category.slug === slug);
}
