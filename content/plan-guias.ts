import type { CategorySlug } from "./categorias";

/**
 * Hoja de ruta editorial: las 20 guías iniciales aprobadas, EN ORDEN. No son páginas:
 * una guía solo existe cuando hay una carpeta content/guias/<categoria>/<slug>/ con su
 * contenido. Este plan sirve para:
 *  - derivar la categoría en `npm run guia:nueva <slug>` y precargar sus metadatos,
 *  - validar que `relatedGuides` apunta a guías reales o planificadas,
 *  - ordenar las guías dentro de su categoría (anterior / siguiente).
 * Añadir una guía al plan exige responder las preguntas de docs/GUIA-EDITORIAL.md.
 */
export interface PlannedGuide {
  slug: string;
  category: CategorySlug;
  title: string;
  description: string;
  problem: string;
  whyThisPage: string;
  relatedGuides: string[];
  handlesNumbers?: boolean;
  usesExternalInfo?: boolean;
  /** Notas de planificación (usuario, prompts, ejemplo ficticio, diferencial). No se publican. */
  brief: string[];
}

export const plannedGuides: readonly PlannedGuide[] = [
  {
    slug: "crear-anuncios-con-ia",
    category: "marketing",
    title: "Crear anuncios para tu negocio con IA",
    description: "Aprende a pedirle a la IA anuncios para Facebook, Instagram y WhatsApp que expliquen tu oferta con contexto real, y a revisarlos antes de publicar.",
    problem: "Necesitas promocionar una oferta de tu negocio y no sabes cómo comunicarla de forma clara y atractiva.",
    whyThisPage: "Es la tarea de marketing más frecuente de un negocio pequeño y la que más se malogra con pedidos vagos; esta guía enseña a construir el brief del anuncio y a adaptarlo a cada canal.",
    relatedGuides: ["crear-promociones-con-ia","crear-afiches-con-ia","crear-campanas-promocionales-con-ia"],
    brief: ["Usuario: dueño de un negocio local que anuncia en Facebook, Instagram y WhatsApp.","Prompts: brief base (producto, público, beneficio, precio, CTA, tono, ubicación), \"hazlo más persuasivo\", adaptaciones por canal, variantes para probar.","Ejemplo ficticio: ferretería con descuento el sábado.","Diferencial: enseñar a construir el brief; ANTES con una línea vaga; qué cambia entre canales."],
  },
  {
    slug: "crear-promociones-con-ia",
    category: "marketing",
    title: "Crear promociones y ofertas para tu negocio con IA",
    description: "Diseña promociones (2x1, combos, descuentos, clientes recurrentes) con IA, compara alternativas con criterios claros y decide cuál conviene a tu negocio.",
    problem: "Quieres lanzar una promoción pero no sabes qué tipo de oferta te conviene ni cómo evaluarla antes de comunicarla.",
    whyThisPage: "Se centra en diseñar y evaluar la oferta, no solo en redactarla: enseña a pedir alternativas a la IA y a compararlas con criterios propios, sin dar por hecha su rentabilidad.",
    relatedGuides: ["definir-precios-y-margenes-con-ia","crear-anuncios-con-ia","crear-campanas-promocionales-con-ia"],
    handlesNumbers: true,
    brief: ["Tipos: 2x1, descuentos, combos, volumen, clientes recurrentes, temporada.","Prompts: 5 alternativas de promoción, evaluación con criterios, simulación de escenarios.","Ejemplo ficticio: cafetería con combo de desayuno el fin de semana.","Regla de datos: los cálculos de margen se verifican fuera de la IA; la IA no afirma que una promoción sea rentable."],
  },
  {
    slug: "crear-afiches-con-ia",
    category: "marketing",
    title: "Crear afiches y material promocional con IA",
    description: "Aprende a preparar con IA el contenido de un afiche (titular, oferta, precio, llamada a la acción y contacto) y a llevarlo a una herramienta de diseño.",
    problem: "Necesitas un afiche para tu negocio y no sabes qué información incluir ni en qué orden para que se entienda de un vistazo.",
    whyThisPage: "Explica la jerarquía del mensaje de un afiche y cómo usar la IA solo para preparar el contenido, dejando claro que el diseño se hace después en una herramienta gráfica.",
    relatedGuides: ["crear-anuncios-con-ia","crear-promociones-con-ia"],
    brief: ["Contenido: qué información dar, jerarquía del mensaje, título, oferta, precio, CTA, contacto.","Ejemplo ficticio: panadería con oferta de fin de semana.","Diferencial: legibilidad a distancia; brief final para diseñar en una herramienta gráfica."],
  },
  {
    slug: "crear-publicaciones-para-redes-sociales-con-ia",
    category: "marketing",
    title: "Crear publicaciones para redes sociales con IA",
    description: "Define objetivo, público, tono, formato y llamada a la acción antes de pedirle a la IA tus publicaciones, y compara el antes y el después de cada pedido.",
    problem: "Publicas en redes sin un objetivo claro y las publicaciones que te devuelve la IA suenan genéricas.",
    whyThisPage: "Enseña a definir el objetivo, el público, el tono, el formato, la CTA y la frecuencia antes de pedir una publicación; no es un generador de textos sueltos.",
    relatedGuides: ["ideas-de-contenido-para-tu-negocio-con-ia","calendario-de-contenido-con-ia"],
    brief: ["Prompts: brief (objetivo, público, producto, tono, formato, CTA, frecuencia), publicación base, versiones por formato, ajuste de tono.","Ejemplo ficticio: peluquería.","Incluir ejemplos ANTES/DESPUÉS."],
  },
  {
    slug: "ideas-de-contenido-para-tu-negocio-con-ia",
    category: "marketing",
    title: "Ideas de contenido para tu negocio con IA",
    description: "Cuando no sabes qué publicar, alimenta a la IA con preguntas reales de tus clientes, tus productos y la temporada para obtener ideas que sí sirven.",
    problem: "No sabes qué publicar en redes o en tu web y terminas repitiendo lo mismo o sin publicar.",
    whyThisPage: "Enseña un método para dar a la IA información real del negocio (preguntas frecuentes, problemas del cliente, temporada) y filtrar las ideas, en lugar de pedir ideas genéricas.",
    relatedGuides: ["calendario-de-contenido-con-ia","crear-publicaciones-para-redes-sociales-con-ia","analizar-opiniones-de-clientes-con-ia"],
    brief: ["Prompts: banco de ideas desde preguntas frecuentes, problemas del cliente y temporada; filtro de ideas por objetivo.","Ejemplo ficticio: tienda de mascotas.","Diferencial: cómo alimentar a la IA con datos reales del negocio para evitar ideas genéricas."],
  },
  {
    slug: "calendario-de-contenido-con-ia",
    category: "marketing",
    title: "Crear un calendario de contenido con IA",
    description: "Convierte una lista de ideas en un calendario de publicaciones realista, ajustado al tiempo que tienes, con fechas comerciales que verificas tú.",
    problem: "Tienes ideas de contenido pero no un plan de cuándo y cómo publicarlas con el tiempo que realmente tienes.",
    whyThisPage: "Cubre el paso de la lista de ideas a un calendario que se pueda cumplir: capacidad real, fechas, reutilización de piezas y producción por lotes.",
    relatedGuides: ["ideas-de-contenido-para-tu-negocio-con-ia","crear-publicaciones-para-redes-sociales-con-ia","crear-campanas-promocionales-con-ia"],
    brief: ["Prompts: calendario de 4 semanas según tiempo disponible, reglas de reciclaje, producción por lotes.","Ejemplo ficticio: restaurante familiar.","Verificación: fechas comerciales y feriados los comprueba el emprendedor."],
  },
  {
    slug: "crear-campanas-promocionales-con-ia",
    category: "marketing",
    title: "Crear una campaña promocional completa con IA",
    description: "Recorre el flujo completo de una campaña (objetivo, público, oferta, mensaje, publicaciones, anuncio y calendario) con un solo caso de principio a fin.",
    problem: "Tienes una promoción y varias piezas sueltas (anuncio, publicaciones, afiche) que no forman una campaña coherente.",
    whyThisPage: "Es la guía que une las demás: sigue un único caso de punta a punta y enseña qué medir después, algo que las guías individuales no muestran.",
    relatedGuides: ["crear-anuncios-con-ia","crear-promociones-con-ia","crear-afiches-con-ia","crear-publicaciones-para-redes-sociales-con-ia","calendario-de-contenido-con-ia"],
    brief: ["Flujo: objetivo → público → oferta → mensaje → publicaciones → anuncio → CTA → calendario.","Ejemplo ficticio: tienda de ropa con liquidación de temporada, un solo caso continuo.","Incluir qué medir después y cómo comparar antes/después (sin inventar resultados)."],
  },
  {
    slug: "crear-descripciones-de-productos-con-ia",
    category: "ventas",
    title: "Crear descripciones de productos con IA",
    description: "Transforma los datos básicos de un producto en una descripción comercial útil, sin que la IA invente características, y verifica cada dato antes de publicar.",
    problem: "Tienes los datos básicos de tus productos y necesitas descripciones que ayuden a vender sin inventar características.",
    whyThisPage: "Se centra en qué información entregar (materiales, medidas, usos, cuidados) y en cómo evitar que la IA agregue datos falsos, con una lista de verificación.",
    relatedGuides: ["crear-anuncios-con-ia","crear-cotizaciones-y-propuestas-con-ia"],
    brief: ["De INFORMACIÓN BÁSICA a DESCRIPCIÓN COMERCIAL ÚTIL; qué datos debe dar el usuario.","Ejemplo ficticio: velas artesanales.","Diferencial: checklist para que la IA no invente características; versiones corta y larga."],
  },
  {
    slug: "crear-cotizaciones-y-propuestas-con-ia",
    category: "ventas",
    title: "Crear cotizaciones y propuestas comerciales con IA",
    description: "Convierte producto, cantidad, precio y condiciones en una cotización o propuesta clara, y comprueba los totales en una hoja de cálculo antes de enviarla.",
    problem: "Un cliente te pide precio y necesitas enviar una cotización o propuesta clara, completa y sin errores.",
    whyThisPage: "Separa lo que redacta la IA de lo que se calcula fuera de ella: los totales se verifican en hoja de cálculo y las condiciones las confirma el emprendedor; no es asesoría legal.",
    relatedGuides: ["definir-precios-y-margenes-con-ia","responder-consultas-de-clientes-con-ia","crear-descripciones-de-productos-con-ia"],
    handlesNumbers: true,
    brief: ["De producto + cantidad + precio + condiciones a una propuesta clara.","Ejemplo ficticio: carpintería.","Regla de datos: totales y descuentos se verifican en hoja de cálculo; condiciones y aspectos legales los confirma el emprendedor."],
  },
  {
    slug: "definir-precios-y-margenes-con-ia",
    category: "ventas",
    title: "Definir precios y márgenes con apoyo de la IA",
    description: "Ordena tus costos, calcula el precio en una hoja de cálculo y usa la IA para revisar la lógica y explorar escenarios; la decisión del precio es tuya.",
    problem: "No sabes con certeza cuánto cobrar por un producto o servicio ni qué margen te queda después de costos.",
    whyThisPage: "Distingue estrictamente cálculo (hoja de cálculo), interpretación (IA) y decisión (emprendedor) en una tarea financiera sensible, y no afirma que un precio sea rentable.",
    relatedGuides: ["crear-promociones-con-ia","analizar-ofertas-de-proveedores-con-ia","crear-cotizaciones-y-propuestas-con-ia"],
    handlesNumbers: true,
    brief: ["Prompts: ordenar costos, revisar la lógica del cálculo, escenarios (por ejemplo, sube un costo), preguntas a aclarar.","Ejemplo ficticio: el precio de un combo en una cafetería.","La IA es herramienta de apoyo al análisis: nunca afirma que un precio o promoción sea rentable."],
  },
  {
    slug: "responder-consultas-de-clientes-con-ia",
    category: "clientes",
    title: "Responder consultas de clientes con IA",
    description: "Prepara respuestas para precios, horarios, disponibilidad y seguimiento por WhatsApp, redes o correo con datos reales de tu negocio y revísalas antes de enviarlas.",
    problem: "Recibes las mismas consultas todos los días por WhatsApp, redes o correo y responderlas te quita tiempo.",
    whyThisPage: "Une la respuesta por mensajería y por correo (misma intención, distinto canal) y enseña a crear una base de datos propia del negocio para que la IA no invente horarios o precios.",
    relatedGuides: ["responder-reclamos-con-ia","analizar-opiniones-de-clientes-con-ia","sistema-diario-de-trabajo-con-ia"],
    brief: ["Cubre WhatsApp/redes y correo: precios, horarios, disponibilidad, seguimiento y preguntas frecuentes.","Ejemplo ficticio: taller mecánico.","Diferencial: base de datos propia del negocio para que la IA no invente; revisar antes de enviar; no compartir datos personales."],
  },
  {
    slug: "analizar-opiniones-de-clientes-con-ia",
    category: "clientes",
    title: "Analizar opiniones de clientes con IA",
    description: "Convierte reseñas y comentarios en problemas frecuentes, elogios y oportunidades de mejora, con conteos que verificas y sin compartir datos personales.",
    problem: "Tienes muchas opiniones de clientes dispersas y no sabes qué patrones se repiten ni qué mejorar primero.",
    whyThisPage: "Enseña a pedir clasificaciones con citas textuales y a verificar los conteos, además de anonimizar los datos antes de compartirlos con la IA.",
    relatedGuides: ["responder-reclamos-con-ia","analizar-ventas-con-ia","ideas-de-nuevos-productos-con-ia"],
    brief: ["Identificar problemas frecuentes, elogios, solicitudes, patrones y oportunidades de mejora.","Ejemplo ficticio: 25 reseñas inventadas de un restaurante (etiquetadas como ficticias).","Diferencial: pedir citas textuales, verificar conteos, anonimizar datos."],
  },
  {
    slug: "responder-reclamos-con-ia",
    category: "clientes",
    title: "Responder reclamos de clientes con IA",
    description: "Prepara una respuesta profesional a un reclamo sin contestar impulsivamente: separa hechos de emociones y ofrece solo lo que tu negocio decide cumplir.",
    problem: "Recibiste un reclamo y quieres responder con calma y profesionalismo, sin prometer algo que no puedes cumplir.",
    whyThisPage: "Ofrece un método para no responder impulsivamente (pausa, hechos, decisión propia, respuesta) y cubre la versión pública y la privada de la respuesta.",
    relatedGuides: ["responder-consultas-de-clientes-con-ia","analizar-opiniones-de-clientes-con-ia"],
    brief: ["Método: pausa, hechos, decisión propia, respuesta; versión pública (reseña) y privada.","Ejemplo ficticio: pedido que llegó tarde o cobro duplicado.","La IA no decide compensaciones: las decide el emprendedor."],
  },
  {
    slug: "analizar-ofertas-de-proveedores-con-ia",
    category: "analisis",
    title: "Analizar ofertas de proveedores con IA",
    description: "Ordena varias cotizaciones de proveedores en una tabla comparable, detecta diferencias de condiciones y prepara preguntas para aclarar; tú decides.",
    problem: "Tienes tres o cuatro cotizaciones de proveedores que no son fáciles de comparar y no quieres decidir a ojo.",
    whyThisPage: "Enseña a normalizar cotizaciones heterogéneas (precio unitario real, plazos, condiciones, costos ocultos) tratando a la IA como analista y no como decisor, con cálculos verificados.",
    relatedGuides: ["definir-precios-y-margenes-con-ia","crear-cotizaciones-y-propuestas-con-ia"],
    handlesNumbers: true,
    brief: ["Comparar precios, diferencias, condiciones, cantidades y costos; detectar lo que necesita aclaración.","Ejemplo ficticio: 3 o 4 cotizaciones de insumos inventadas.","La IA no sustituye una decisión financiera: es una herramienta de análisis; cálculos verificados en hoja de cálculo."],
  },
  {
    slug: "analizar-ventas-con-ia",
    category: "analisis",
    title: "Analizar las ventas de tu negocio con IA",
    description: "Prepara tus datos de ventas, calcula los totales en una hoja y usa la IA para interpretarlos y formular preguntas útiles, sin tomar sus hipótesis como hechos.",
    problem: "Tienes datos de ventas pero no sabes qué preguntas hacerles ni cómo interpretarlos con criterio.",
    whyThisPage: "Marca la frontera entre lo que se calcula (hoja de cálculo) y lo que se interpreta (IA) y enseña a pedir hipótesis, no causas, evitando conclusiones no comprobadas.",
    relatedGuides: ["crear-promociones-con-ia","definir-precios-y-margenes-con-ia","investigar-competidores-con-ia"],
    handlesNumbers: true,
    brief: ["Identificar productos más y menos vendidos, tendencias, cambios, oportunidades y preguntas a investigar.","Ejemplo ficticio: 3 meses de ventas inventadas de una tienda.","Regla de datos: totales calculados fuera de la IA; la IA interpreta y propone hipótesis, no causas."],
  },
  {
    slug: "investigar-competidores-con-ia",
    category: "analisis",
    title: "Investigar competidores con IA",
    description: "Estructura una investigación de competidores con fuentes que tú aportas y usa la IA para ordenarlas y compararlas, sin dar por hechos datos inventados.",
    problem: "Quieres saber en qué se diferencia tu negocio de otros parecidos, pero investigar y comparar te llevaría demasiado tiempo.",
    whyThisPage: "Insiste en que ningún dato sobre competidores sale de la memoria de la IA: cada dato lleva su fuente y se distingue lo aportado por el usuario de lo generado.",
    relatedGuides: ["analizar-ventas-con-ia","ideas-de-nuevos-productos-con-ia","crear-anuncios-con-ia"],
    usesExternalInfo: true,
    brief: ["Plan de investigación, tabla comparativa con datos que aporta el usuario, síntesis de diferenciación.","Ejemplo ficticio: 3 gimnasios de barrio inventados.","Regla de investigación: nada inventado por la IA presentado como hecho; columna de fuente obligatoria; verificar las fuentes."],
  },
  {
    slug: "ideas-de-nuevos-productos-con-ia",
    category: "analisis",
    title: "Ideas de nuevos productos o servicios con IA",
    description: "Genera hipótesis de nuevos productos a partir de problemas reales de tus clientes y aprende a validarlas en el mundo real antes de invertir.",
    problem: "Quieres ofrecer algo nuevo pero no sabes qué proponer ni cómo saber si tendrá demanda antes de invertir.",
    whyThisPage: "Trata las ideas de la IA como hipótesis y dedica una parte central de la guía a validarlas fuera de la IA (preventa, prueba pequeña, conversaciones con clientes).",
    relatedGuides: ["analizar-opiniones-de-clientes-con-ia","investigar-competidores-con-ia","definir-precios-y-margenes-con-ia"],
    usesExternalInfo: true,
    brief: ["Prompts: hipótesis desde problemas de clientes, evaluación con criterios, plan de validación.","Ejemplo ficticio: panadería que evalúa una línea sin gluten.","Diferencial: cómo validar en el mundo real; la IA propone, el mercado decide."],
  },
  {
    slug: "organizar-tareas-del-negocio-con-ia",
    category: "negocio",
    title: "Organizar las tareas de tu negocio con IA",
    description: "Convierte una lista de pendientes desordenada en prioridades, categorías, responsables, fechas y tareas recurrentes, ajustadas al tiempo que tienes.",
    problem: "Tienes una lista de pendientes desordenada y no sabes qué hacer primero ni cuánto cabe en tu semana.",
    whyThisPage: "Da criterios explícitos de priorización y enseña a darle contexto real (horas, personas) para que el plan sea realizable; sirve de base al sistema diario de trabajo.",
    relatedGuides: ["sistema-diario-de-trabajo-con-ia","documentar-procesos-con-ia"],
    brief: ["De lista desordenada a prioridades, categorías, responsables, fechas y tareas recurrentes.","Ejemplo ficticio: negocio familiar con 25 pendientes.","Segundo prompt: plan de la semana según horas disponibles."],
  },
  {
    slug: "documentar-procesos-con-ia",
    category: "negocio",
    title: "Documentar procesos de tu negocio con IA",
    description: "Deja por escrito cómo se hacen tus tareas repetitivas (por ejemplo, registrar un pedido) haciendo que la IA te entreviste, y pruébalo con otra persona.",
    problem: "Hay tareas que solo tú sabes hacer y no están escritas en ningún sitio, lo que te impide delegarlas o retomarlas.",
    whyThisPage: "Propone un método distinto a pedirle un procedimiento a la IA: la IA entrevista al dueño para extraer el proceso real y luego se prueba con una persona.",
    relatedGuides: ["organizar-tareas-del-negocio-con-ia","responder-consultas-de-clientes-con-ia","sistema-diario-de-trabajo-con-ia"],
    brief: ["Ejemplo: \"Cómo registrar un pedido\" en una tienda online ficticia.","Prompts: la IA entrevista al dueño, procedimiento paso a paso, checklist, versión para alguien nuevo.","Verificación: probar el procedimiento con una persona real antes de darlo por bueno."],
  },
  {
    slug: "sistema-diario-de-trabajo-con-ia",
    category: "negocio",
    title: "Un sistema diario de trabajo con IA para tu negocio",
    description: "Integra la IA en un día normal de trabajo: organizar tareas por la mañana, atender clientes, analizar ventas, crear contenido y cerrar el día con un plan.",
    problem: "Usas la IA de forma esporádica y no la has convertido en una herramienta cotidiana de tu trabajo.",
    whyThisPage: "Es la guía pilar: enseña una rutina diaria completa y una ficha de contexto del negocio reutilizable, conectando todas las demás guías en un hábito de trabajo.",
    relatedGuides: ["organizar-tareas-del-negocio-con-ia","responder-consultas-de-clientes-con-ia","analizar-ventas-con-ia","crear-publicaciones-para-redes-sociales-con-ia","crear-cotizaciones-y-propuestas-con-ia","documentar-procesos-con-ia"],
    brief: ["MAÑANA: organizar tareas. DURANTE EL DÍA: responder clientes. VENTAS: analizar información. MARKETING: crear contenido. ADMINISTRACIÓN: preparar documentos. FINAL DEL DÍA: resumir pendientes y planificar.","Incluir una ficha de contexto del negocio reutilizable (se pega al inicio de la conversación) y una rutina de unos 10 minutos.","Ejemplo ficticio: el día de una tienda de ropa. Qué NO delegar a la IA.","Enlaza con todas las guías anteriores."],
  },
];

export function getPlannedGuide(slug: string): PlannedGuide | undefined {
  return plannedGuides.find((guide) => guide.slug === slug);
}
