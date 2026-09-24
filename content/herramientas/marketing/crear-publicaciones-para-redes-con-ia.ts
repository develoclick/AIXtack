import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /marketing/crear-publicaciones-para-redes-con-ia (Generador). Fuente: la guía larga
 * content/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia (brief, rúbrica, errores). Caso: Peluquería Rizo
 * Fino (ficticia). Sin pruebas reales todavía: `publicado` en `false`.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "crear-publicaciones-para-redes-con-ia",
    area: "marketing",
    tipo: "generador",
    titulo: "Crea publicaciones para Instagram, Facebook y TikTok",
    descripcion: "Llena seis datos y copia un prompt que escribe tres opciones de publicación, la adaptación a tu formato, el texto alternativo de la imagen y hashtags moderados.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/marketing/crear-publicaciones-para-redes-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Escribe un post para Instagram para mi peluquería.» La IA no sabe qué quieres lograr, a quién le hablas ni cómo hablas: lo supone todo y suele devolver una promesa de belleza y una invitación vaga a reservar (ejemplo ilustrativo).",
    despues: "**Tres opciones** con un solo objetivo y una sola acción, adaptadas a tu formato, con el **texto alternativo** de la imagen y unos pocos hashtags para verificar. Cada dato sale de lo que escribiste; lo que falta queda como [FALTA].",
  },

  campos: [
    { id: "objetivo", label: "Objetivo de la publicación", tipo: "seleccion", ejemplo: "Vender", opciones: ["Vender", "Informar", "Interactuar"], requerido: true, ayuda: "Elige uno solo. Sin objetivo, la IA escribe para que quede bonito." },
    { id: "tema", label: "Tema o producto", tipo: "largo", ejemplo: "Tratamiento de hidratación con 15 % de descuento, solo martes y miércoles, hasta el 31 de octubre. Se reserva únicamente por mensaje.", requerido: true, ayuda: "Los datos exactos, tal como los decidiste: precios, días, fechas y condiciones." },
    { id: "red", label: "Red social", tipo: "seleccion", ejemplo: "Instagram", opciones: ["Instagram", "Facebook", "TikTok"], requerido: true },
    { id: "formato", label: "Formato", tipo: "seleccion", ejemplo: "Post con una imagen y texto", opciones: ["Post con una imagen y texto", "Carrusel de imágenes", "Historia", "Reel o video corto"], requerido: true },
    { id: "datoClave", label: "Dato clave que no puede faltar", tipo: "texto", ejemplo: "Solo martes y miércoles, hasta el 31 de octubre", requerido: true },
    { id: "accion", label: "Llamada a la acción", tipo: "texto", ejemplo: "Escribir la palabra «turno» por mensaje para reservar", requerido: true, ayuda: "Una sola acción, escrita completa: qué, dónde y con qué palabra." },
    { id: "muestra", label: "Muestra de tu voz (opcional)", tipo: "largo", ejemplo: "«Pasa sin apuro. Te lavamos el pelo, charlamos un rato y te vas contenta. Aquí nadie corre.»", ayuda: "Una o dos frases que hayas escrito tú. Hace que el texto suene a tu negocio." },
    { id: "limites", label: "Límites (opcional)", tipo: "texto", ejemplo: "No prometer resultados en el cabello. No mostrar fotos de clientes sin permiso. No hablar de otras peluquerías.", ayuda: "Lo que la publicación no debe decir ni mostrar." },
  ],
  usaPerfil: ["nombre", "rubro", "clientes", "tono", "canales"],
  calculadora: null,

  tarea: `Escribe publicaciones para mi negocio. Los datos de arriba son la única fuente de hechos. Quien las lea es mi público y todavía no ha decidido nada.

Entrega:
1. TRES OPCIONES de una misma publicación para {{red}}, en formato «{{formato}}», con el objetivo «{{objetivo}}». Cada opción, con estos títulos y en este orden: Gancho (una frase), Texto (el cuerpo completo, listo para copiar), Llamada a la acción (una frase, la mía), Datos míos usados, Supuestos que tuviste que hacer (o «ninguno»).
2. ADAPTACIÓN AL FORMATO de la opción que te parezca más cercana a mi objetivo: cómo pasar el texto a «{{formato}}». Indica qué queda fuera y por qué. Si no conoces los límites de la red, no los supongas: dilo.
3. TEXTO ALTERNATIVO PARA LA IMAGEN: una descripción breve de lo que se ve, para personas que no la ven. No inventes detalles que yo no haya dado.
4. HASHTAGS MODERADOS: como máximo cinco, generales y relacionados con mi tema; márcalos «verificar antes de usar».

Reglas:
- Dato clave que debe aparecer: {{datoClave}}. Llamada a la acción: {{accion}}.
- Escribe con mi tono y con el registro de mi muestra de voz («{{muestra}}»), sin copiar frases completas de ella.
- Cada opción pide una sola acción: la mía.
- No prometas resultados sobre el cliente o el producto que yo no haya afirmado, no uses superlativos y no comparas con otros negocios. Límites: {{limites}}.
- Si falta el objetivo, el dato clave o la acción, no improvises: dímelo antes de escribir.

Formato de salida: OPCIÓN 1, OPCIÓN 2, OPCIÓN 3, ADAPTACIÓN, TEXTO ALTERNATIVO, HASHTAGS y al final FALTA.

Antes de responder, comprueba que cada dato de cada opción está en mis datos, que cada opción tiene una sola llamada a la acción, que ninguna promete lo que yo no dije y que todo lo que falta está marcado como [FALTA]. Corrige o elimina lo que no cumpla.`,

  mejoras: [
    { label: "Más corto", prompt: "Hazla más corta sin quitar el dato clave ni la llamada a la acción." },
    { label: "Ajustar el tono", prompt: "Reescribe solo el tono para que suene más a mi muestra, sin cambiar ningún dato, y muéstrame cada cambio." },
    { label: "Puntuar con la rúbrica", prompt: "Puntúa las tres opciones de 0 a 2 en: cumple el objetivo, usa solo mis datos, le habla a mi público, suena a mi negocio, una sola acción, cabe en su formato." },
    { label: "Otro formato", prompt: "Pásala a una historia de tres pantallas con una frase por pantalla, sin añadir datos." },
  ],

  ejemplo: {
    negocio: "Peluquería Rizo Fino (ficticia), peluquería de barrio con tres estilistas",
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real»).
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` (recuadro gris en el bloque 6); nunca en un build de producción. `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: las tres opciones de publicación de Peluquería Rizo Fino (ficticia), la adaptación al formato elegido, el texto alternativo de la imagen y los hashtags.",
    },
  ],

  checklist: [
    "Cada precio, descuento, día, fecha y condición coincide con lo que yo decidí.",
    "No queda ningún [FALTA] sin resolver ni sin borrar.",
    "Ninguna frase promete un resultado que no puedo cumplir.",
    "Tengo permiso para todo lo que aparece: nombres, marcas, fotos, música y textos de otras personas.",
    "La acción funciona: alguien atiende ese canal y sabe qué hacer cuando llegue la palabra clave.",
  ],

  porQueFunciona: [
    {
      titulo: "Un objetivo y una acción",
      texto: "Sin objetivo, la IA escribe para que quede bonito y luego no sabes si funcionó. Elegir uno solo (reservar, preguntar, guardar, visitar) y pedir una sola acción hace que cada publicación tenga un propósito medible.",
    },
    {
      titulo: "Los datos exactos, tal como los decidiste",
      texto: "Aquí viven los datos que la IA no puede conocer y que aparecerán como hechos. «Más o menos un 15 %» puede salir como un 15 % firme, y luego debes cumplirlo: por eso el prompt copia lo que escribiste y marca lo que falta.",
    },
    {
      titulo: "Tu voz, no la del rubro",
      texto: "Una muestra de dos frases tuyas fija el registro mejor que cualquier adjetivo. El prompt pide sonar como tú sin copiar frases completas, para que el texto no parezca un anuncio genérico.",
    },
    {
      titulo: "Tres opciones y una revisión",
      texto: "La primera opción suele ser la que mejor suena, no la que mejor cumple. Con tres opciones puedes compararlas con la misma rúbrica y quedarte con la que respeta tu objetivo y tus datos.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia): objetivo «vender»; menú del día de $5 de lunes a viernes, de 12:00 a 15:00; acción: reservar por WhatsApp; formato: historia de tres pantallas.",
      consejo: "En una historia, una idea por pantalla: el plato, el precio con el horario y cómo reservar.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Boutique Aldea (ficticia): objetivo «informar»; llegó la nueva colección de otoño, disponible desde el sábado en el local; acción: pasar a probarse; formato: carrusel de imágenes.",
      consejo: "Cuando el objetivo es informar, el dato clave es la fecha de disponibilidad: no lo escondas al final del texto.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio de uñas Brillo (ficticio): objetivo «interactuar»; una pregunta al público sobre qué diseño prefieren; acción: responder en los comentarios; formato: post con una imagen y texto.",
      consejo: "Si pides que comenten, la pregunta debe ser fácil de responder en una palabra y no prometer nada a cambio.",
    },
    {
      rubro: "Trabajo por encargo",
      ejemplo: "Maderas Rivera (ficticio): objetivo «informar»; mostrar cómo se arma un mueble a medida, de la medición a la instalación; acción: escribir por mensaje para pedir una visita de medición; formato: carrusel de imágenes con un paso por imagen.",
      consejo: "Un proceso se cuenta mejor con una imagen por paso y una frase corta en cada una. Pide al cliente que autorice las fotos de su casa antes de publicarlas.",
    },
  ],

  errores: [
    {
      error: "Pedir el texto sin escribir el brief",
      solucion: "La IA rellena los huecos con lo habitual del rubro y puede incluir lo que no dijiste. Completa los campos antes de copiar el prompt.",
    },
    {
      error: "Pegar datos aproximados como exactos",
      solucion: "Escribe cada cifra y cada fecha tal como la decidiste, o déjala vacía: el prompt la marcará como [FALTA].",
    },
    {
      error: "Quedarte con la primera opción",
      solucion: "Pide tres opciones y puntúalas con la misma rúbrica antes de elegir; la primera suele sonar mejor pero cumplir menos.",
    },
    {
      error: "Pedir «hazlo más vendedor»",
      solucion: "Empuja hacia verbos de publicidad y promesas que quizá no puedes cumplir. Pide un ajuste concreto: «frases más cortas» o «tono más cercano».",
    },
  ],

  faq: [
    { p: "¿Puedo usar el mismo texto para todas mis redes?", r: "Sí, como base: el formato y a veces el tono cambian de una red a otra. Adapta el resto con la adaptación al formato que pide el prompt y revisa qué quedó fuera." },
    { p: "¿Qué hago si no tengo textos míos como muestra de voz?", r: "Usa mensajes que hayas escrito a clientes: también sirven. Si no tienes nada, déjalo vacío; el resultado será más genérico y conviene ajustarlo más." },
    { p: "¿Sirve con cualquier asistente de IA?", r: "El prompt es texto y puedes pegarlo en el asistente que uses, pero cada uno responde a su manera y puede equivocarse: por eso el método termina en tu verificación." },
    { p: "¿Le puedo pedir la mejor hora para publicar?", r: "No: la IA no ve las estadísticas de tu cuenta. Mira las tuyas. Los hashtags sí puedes pedirlos, pero verifica cada uno antes de usarlo." },
    { p: "¿Puede la IA generar la imagen?", r: "Esta herramienta pide solo el texto y el texto alternativo. Si generas una imagen, revisa que no incluya letras, números ni marcas que no sean tuyas." },
    { p: "¿Puedo publicar lo que devuelve la IA sin mirar las normas de la red?", r: "No sin mirarlas: las reglas sobre promociones, imágenes y uso de marcas dependen de cada red y de tu país, y esta herramienta no las cubre." },
  ],

  relacionadas: ["marketing/calendario-de-contenido-con-ia", "marketing/crear-anuncios-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: el brief de siete campos y la rúbrica",
    parrafos: [
      "**El brief de siete campos.** La versión anterior de esta guía trabajaba con siete campos: objetivo, público, producto u oferta, tono, formato, llamada a la acción y frecuencia. Esta página reparte los cuatro primeros entre el formulario y tu perfil «Mi negocio» y no pide la frecuencia. La frecuencia sirve para ajustar el esfuerzo: con una hora semanal, una serie de seis imágenes no se sostiene, y la IA no lo sabe si no se lo dices.",
      "**Rúbrica de seis criterios** para puntuar cada opción (0, 1 o 2 puntos; máximo 12): cumple el objetivo; usa solo datos míos (cada precio, día, fecha, condición y nombre está en mis datos, sin añadidos); le habla a su público; suena a mi negocio; pide una sola acción clara (qué, dónde y con qué palabra); cabe en su formato y se lee de un vistazo.",
      "**Cómo elegir el objetivo.** Vender: la persona debe poder comprar o reservar tras leer, así que el dato clave es el precio, la fecha o la condición. Informar: la persona debe entender algo nuevo (un horario, una llegada, un cambio), así que el dato clave es lo que cambió. Interactuar: la persona debe responder, así que la pregunta tiene que ser fácil de contestar en una palabra. Si una publicación intenta las tres cosas, no logra ninguna.",
      "**Cómo preparar tu muestra de voz.** Copia dos frases que hayas escrito tú a un cliente o en una publicación anterior que te haya gustado. No hace falta que hablen del tema de hoy: sirven para que la IA vea el largo de tus frases, si tuteas o tratas de usted y qué palabras usas. Si no tienes ninguna, deja el campo vacío y ajusta el tono después con la mejora «Ajustar el tono».",
      "**Una semana con una hora.** Un día fijo (por ejemplo, el lunes), completa el formulario, copia el prompt, elige una opción, comprueba los datos con la lista de revisión y programa la publicación. Con dos publicaciones por semana, repite el proceso una vez más. Lo que llevas de un día a otro es el perfil «Mi negocio»: no lo vuelvas a escribir.",
      "**Cómo adaptar a otro formato.** Un texto pensado para una imagen sobra en un mensaje, y al recortarlo a mano se pierde una condición. Pídele a la IA la adaptación y revisa qué quedó fuera: lo que no cabe en el formato debe decirse en otro lugar, no borrarse en silencio.",
      "**Lo que este método no hace.** No conoce tus resultados ni cómo funciona hoy cada plataforma, puede inventar un dato aunque se lo prohíbas (por eso se comprueban), no decide qué publicar, no diseña la imagen ni programa la publicación y no sustituye las normas de publicidad de tu país.",
      "**Cómo escribir el gancho.** El gancho es la primera frase, la que se ve antes de «ver más». Debe decir para quién es o qué cambia, con un dato concreto y sin adornos: «Martes y miércoles: hidratación con 15 % de descuento» funciona mejor que «Mímate esta semana». Compara los tres ganchos que devuelve la IA y quédate con el que un cliente entendería en dos segundos. Si necesitas explicar el gancho, todavía no es un buen gancho.",
      "**Qué revisar en el texto alternativo y en los hashtags.** El texto alternativo describe la imagen para quien no la ve: qué aparece y qué hace, sin repetir la oferta ni añadir lo que la imagen no muestra. Si la IA inventó un detalle (un color, un lugar, una persona), bórralo. Los hashtags son una sugerencia: comprueba cada uno en la propia red para ver qué contenido aparece debajo, y quita los que se usen para otra cosa o que no te representen.",
      "**Lo que una publicación no puede resolver.** Una publicación no tiene letra pequeña: si una condición cambia la decisión del cliente (que la oferta es solo con cita, que hay cupos limitados, que aplica solo en el local), va en el cuerpo del texto, no en un comentario ni en una historia aparte. Si la condición no cabe en el formato, cambia de formato o de oferta. Lo mismo vale para las fechas: escribe el día y el mes completos, sin «esta semana» que se lee distinto mañana.",
      "**Cuándo conviene no publicar.** Si falta un dato clave, si no tienes permiso para una foto o un nombre, si no hay nadie que atienda el mensaje que estás pidiendo o si la promoción depende de algo que todavía no está confirmado, espera. Una publicación que promete algo que no puedes cumplir cuesta más que un día sin publicar. Y si el asistente devuelve un [FALTA], respóndelo tú antes de seguir: el prompt lo marca justamente para eso.",
      "**Aviso.** Este método ayuda a redactar y ordenar; no garantiza alcance, interacción ni ventas. Las reglas de publicidad, promociones, uso de imágenes y datos de otras personas cambian según el país y la red social, y la responsabilidad por lo que publicas es de tu negocio. Ante la duda, consulta a un profesional.",
    ],
  },
});
