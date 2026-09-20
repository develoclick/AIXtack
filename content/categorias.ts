/**
 * Registro de categorías. Son exactamente 5 y funcionan como hubs editoriales
 * (/marketing, /ventas, /clientes, /analisis, /negocio).
 *
 * Una categoría nueva solo debe crearse si existe un área con contenido propio
 * suficiente — nunca porque aparezca una guía nueva. Añadir una categoría exige
 * escribir su introducción editorial: no se admite una descripción genérica a la
 * que solo se le cambia el nombre.
 */
export interface Category {
  slug: string;
  /** Nombre corto para navegación y breadcrumbs. */
  name: string;
  /** H1 del hub. */
  title: string;
  /** Meta description del hub. */
  description: string;
  /** Introducción editorial propia (párrafos). */
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
      "Guías prácticas para crear anuncios, promociones, afiches y contenido para redes con IA, y unirlo todo en campañas que puedas ejecutar.",
    intro: [
      "El marketing de un negocio pequeño rara vez tiene un equipo detrás: eres tú quien decide la oferta del fin de semana, escribe el mensaje, prepara el afiche y publica en redes, casi siempre con el tiempo justo. La IA puede ahorrarte buena parte de ese trabajo, pero solo si le das la información correcta y revisas lo que te devuelve.",
      "Las guías de esta categoría parten de esas situaciones concretas —anunciar una oferta, preparar un afiche, decidir qué publicar y cuándo— y te enseñan a construir las instrucciones paso a paso, a comparar el antes y el después de cada pedido y a verificar el resultado antes de publicarlo.",
    ],
    problems: [
      "Tienes una promoción para este fin de semana y no sabes cómo comunicarla.",
      "Quieres diseñar una oferta (2x1, combos, descuentos por volumen) sin poner en riesgo tu margen.",
      "Necesitas el contenido de un afiche antes de llevarlo a un diseñador o a una herramienta gráfica.",
      "No sabes qué publicar en redes ni con qué frecuencia.",
      "Quieres unir anuncio, publicaciones y calendario en una campaña coherente.",
    ],
  },
  {
    slug: "ventas",
    name: "Ventas",
    title: "IA para vender mejor: productos, cotizaciones y precios",
    description:
      "Guías para describir productos, preparar cotizaciones y propuestas, y definir precios y márgenes con apoyo de la IA, verificando siempre los números.",
    intro: [
      "Vender implica mucho trabajo de escritorio que no se ve: explicar por escrito qué ofreces, responder \"¿cuánto me sale?\" con una cotización clara y decidir un precio que cubra tus costos. Es un trabajo repetitivo y sensible, porque un error en un precio o en una condición cuesta dinero.",
      "Aquí la IA se usa con una regla fija: los cálculos se comprueban en una hoja de cálculo o calculadora, la IA ayuda a redactar, ordenar e interpretar, y las decisiones las tomas tú. Cada guía te muestra cómo aplicar esa separación en una tarea concreta.",
    ],
    problems: [
      "Tienes los datos básicos de un producto y necesitas una descripción que ayude a venderlo.",
      "Un cliente pide precio y quieres responder con una cotización clara y sin ambigüedades.",
      "Necesitas preparar una propuesta con alcance, condiciones y plazos.",
      "No sabes cómo calcular el precio de un producto o servicio, ni qué margen te queda.",
    ],
  },
  {
    slug: "clientes",
    name: "Clientes",
    title: "IA para atender a tus clientes",
    description:
      "Guías para responder consultas, analizar opiniones y contestar reclamos con IA, sin perder el trato personal ni enviar nada sin revisarlo.",
    intro: [
      "La relación con los clientes se juega en muchos mensajes pequeños: una consulta de precio por WhatsApp, un reclamo por un pedido que llegó tarde, una reseña que no te deja tranquilo. Responder bien y a tiempo cuesta esfuerzo, sobre todo cuando quien contesta también es quien atiende, produce y administra.",
      "Estas guías te ayudan a preparar respuestas y a entender qué dicen tus clientes, con dos límites claros: la IA prepara borradores y tú los revisas antes de enviarlos, y los datos personales de tus clientes no se comparten con la IA sin necesidad.",
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
      "Guías para comparar ofertas de proveedores, analizar ventas, investigar competidores y evaluar ideas de nuevos productos con IA, separando datos de hipótesis.",
    intro: [
      "Analizar un negocio pequeño suele significar mirar hojas de cálculo, cotizaciones de proveedores o páginas de la competencia y sacar conclusiones a ojo. La IA puede ayudarte a ordenar esa información y a hacerte mejores preguntas, pero no sabe nada de tu negocio que tú no le hayas contado, y puede presentar como cierto algo que solo es una suposición.",
      "Por eso las guías de esta categoría insisten en tres cosas: los datos los aportas tú (con su fuente), los cálculos se verifican fuera de la IA y las conclusiones se tratan como hipótesis hasta que las compruebas. La decisión siempre es tuya.",
    ],
    problems: [
      "Tienes varias cotizaciones de proveedores y no son fáciles de comparar.",
      "Quieres entender qué pasó con tus ventas: qué se vende, qué no y qué preguntas conviene investigar.",
      "Necesitas saber en qué se diferencia tu negocio de otros similares de tu zona o de tu rubro.",
      "Tienes una idea de nuevo producto o servicio y quieres evaluarla antes de invertir.",
    ],
  },
  {
    slug: "negocio",
    name: "Negocio",
    title: "IA para organizar y ordenar tu negocio",
    description:
      "Guías para organizar tareas, documentar procesos y montar un sistema diario de trabajo con IA que puedas mantener sin complicarte.",
    intro: [
      "Además de vender y comunicar, un negocio pequeño exige mucho trabajo interno: recordar qué está pendiente, decidir qué va primero, explicarle a otra persona cómo se hace algo. Cuando todo vive solo en tu cabeza, cualquier imprevisto desordena el día.",
      "Estas guías usan la IA como asistente de orden: convierten listas desordenadas en prioridades, ayudan a dejar por escrito los procesos que repites y proponen una rutina diaria para integrar todo lo anterior. Sin sistemas complejos y con revisión humana en cada paso.",
    ],
    problems: [
      "Tienes una lista de pendientes desordenada y no sabes por dónde empezar.",
      "Hay tareas que solo tú sabes hacer y quisieras dejarlas por escrito (por ejemplo, cómo registrar un pedido).",
      "Quieres usar la IA todos los días como un hábito de trabajo, no solo de vez en cuando.",
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
