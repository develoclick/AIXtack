import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /clientes/responder-reclamos-con-ia (Generador). Fuente: la guía larga content/guias/clientes/responder-reclamos-con-ia
 * (ficha de reclamo, tarjeta de decisión, respuesta privada y pública). Caso: Luz de Barrio (ficticio). Tema sensible:
 * se conservan la pausa previa, la separación hechos/versión/emoción y las advertencias. Sin pruebas reales todavía:
 * `publicado` en `false`.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "responder-reclamos-con-ia",
    area: "clientes",
    tipo: "generador",
    titulo: "Responde un reclamo con calma y sin comprometerte de más",
    descripcion: "Separa hechos y emociones, escribe qué ofreces y qué no, y copia un prompt que redacta una respuesta serena y una reseña pública breve sin prometer de más.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/clientes/responder-reclamos-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Un cliente me escribió muy enojado porque su pedido llegó tarde. Contéstale para calmarlo y ofrécele lo que haga falta.» La IA no conoce los hechos ni tus políticas y tú no decidiste nada: rellena con causas, ofertas y promesas que suenan bien (ejemplo ilustrativo).",
    despues: "Los **hechos separados de las emociones**, una respuesta privada que reconoce lo tuyo y ofrece **solo lo que decidiste**, una respuesta pública breve y un **siguiente paso único**. Lo que no está confirmado se pregunta, no se afirma.",
  },

  campos: [
    { id: "reclamo", label: "El reclamo del cliente (pégalo sin datos personales)", tipo: "largo", ejemplo: "Pedí un set de velas de regalo y llegó el martes, cuando me dijeron que llegaba el jueves. Era para el sábado. Escribí tres veces preguntando y nadie contestó. Además la caja llegó golpeada. Es una estafa. Quiero que me devuelvan todo el dinero.", requerido: true, ayuda: "Quita nombre, teléfono, dirección y número de pedido." },
    { id: "hechosConfirmados", label: "Hechos confirmados por tus registros", tipo: "largo", ejemplo: "El pedido se entregó el martes 9 a las 14:12 (seguimiento de la mensajería). El lunes 1 le dijimos «entre el jueves y el viernes». El pedido salió el viernes 5 y no el martes 2 porque faltaron cajas de envío. Hay un mensaje del cliente el jueves 4 a las 18:40, respondido el viernes 5 a las 10:05.", requerido: true, ayuda: "Solo lo que puedes comprobar, con fecha y fuente." },
    { id: "sinConfirmar", label: "Lo que no puedes confirmar (opcional)", tipo: "largo", ejemplo: "Que la caja llegó golpeada (no hay foto ni nota de recepción). Que escribió otras dos veces y por qué canal.", ayuda: "La IA lo preguntará; no lo afirmará ni lo negará." },
    { id: "ofrezco", label: "Lo que sí ofreces (con su condición y su plazo)", tipo: "largo", ejemplo: "Devolver el costo del envío a la forma de pago original, en hasta 5 días hábiles desde que el cliente responda. Un cupón del 10 % para su próxima compra, válido por 60 días.", requerido: true, ayuda: "Lo decides tú antes de redactar." },
    { id: "noOfrezco", label: "Lo que no ofreces y cómo lo dirías", tipo: "largo", ejemplo: "No devolvemos el total del pedido: «No podemos devolver el total del pedido, porque el producto fue entregado».", requerido: true },
    { id: "siguientePaso", label: "Siguiente paso único", tipo: "texto", ejemplo: "Que responda este mensaje con una foto de la caja", requerido: true },
    { id: "canal", label: "Canal de la respuesta privada", tipo: "seleccion", ejemplo: "WhatsApp", opciones: ["WhatsApp", "Correo", "Redes sociales"], requerido: true },
    { id: "resena", label: "Reseña pública (opcional)", tipo: "largo", ejemplo: "Nunca más. Mi regalo llegó tarde y nadie contestó. Es una estafa.", ayuda: "Si la hay, el prompt prepara también una respuesta pública breve." },
  ],
  usaPerfil: ["nombre", "tono"],
  calculadora: null,

  tarea: `Prepara mi respuesta a este reclamo. Los datos de arriba son la única fuente: afirma solo lo que está en «Hechos confirmados»; lo que aparece como «Lo que no puedes confirmar» no lo afirmes, no lo niegues y no lo discutas: pide el dato que falta.

Entrega, en este orden y con estos títulos:
1. HECHOS, VERSIÓN Y EMOCIÓN: una tabla que separe, punto por punto del reclamo, lo que pasó (con mis registros), lo que el cliente cree y lo que siente o juzga. No repartas culpas.
2. RESPUESTA PRIVADA por {{canal}}: un único borrador de máximo 160 palabras, con frases cortas y este orden: (a) reconocer lo que vivió el cliente, (b) lo que es del negocio, (c) lo que se ofrece y lo que no, (d) el siguiente paso.
3. RESPUESTA PÚBLICA, solo si hay reseña: breve, sin nombres, fechas, montos ni ofertas, sin discutir, y que invite a seguir por privado.
4. USADO: una tabla con dos columnas, Frase | De dónde sale (mis datos).
5. PARA UNA PERSONA y FALTA.

Reglas:
- Ofrece únicamente lo que está en «Lo que sí ofreces», con su condición y su plazo tal cual. No añadas compensaciones, descuentos ni plazos.
- Lo que no ofrezco lo dices con mis palabras, sin dar a entender que podría cambiar.
- No culpes a terceros, no discutas con el cliente y no lo corrijas. No prometas que no volverá a ocurrir ni cites leyes ni des opiniones legales.
- Contesta cada punto del reclamo y cada petición: con un dato confirmado, con un matiz o con una pregunta.
- Siguiente paso único: {{siguientePaso}}.
- Si el reclamo menciona salud, lesión, denuncia, abogado o disputa de pago, no redactes: dilo en PARA UNA PERSONA.
- Si un dato es insuficiente para cumplir una regla, escribe [FALTA: qué dato] en lugar de inventarlo.

Formato de salida: HECHOS, VERSIÓN Y EMOCIÓN; RESPUESTA PRIVADA; RESPUESTA PÚBLICA; USADO; PARA UNA PERSONA y FALTA.

Antes de responder, comprueba que cada frase con un hecho se apoya en mis hechos confirmados, que cada oferta y cada «no» coincide con lo que escribí, que no hay culpas, promesas futuras ni consejos legales y que el siguiente paso es uno solo. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más breve", prompt: "Hazla más breve sin quitar el reconocimiento, las ofertas ni el siguiente paso." },
    { label: "Más sereno", prompt: "Reescribe las frases que suenen a defensa o a súplica con un tono sereno, sin añadir datos ni ofertas." },
    { label: "Responder a un punto", prompt: "No respondiste al punto 4 del reclamo: añade solo una frase que lo conteste con mis datos." },
    { label: "Revisar contra mis datos", prompt: "Compara cada oferta y cada hecho de la respuesta con lo que te di y marca cualquiera que no coincida, sin reescribir." },
  ],

  ejemplo: {
    negocio: "Luz de Barrio (ficticio), tienda online de velas artesanales que vende por Instagram y WhatsApp",
    datos: {
      Reclamo: "Un pedido de regalo que llegó el martes, cuando el cliente esperaba el jueves, para una fecha límite del sábado",
      "Hechos confirmados": "Entregado el martes 9; se le informó «entre el jueves y el viernes»; salió el viernes 5 y no el martes 2 por falta de cajas",
      "Sin confirmar": "La caja golpeada y los otros dos mensajes",
      "Sí ofrece": "Devolver el costo del envío en hasta 5 días hábiles y un cupón del 10 % por 60 días",
      "No ofrece": "Devolver el total del pedido",
      "Siguiente paso": "Que responda con una foto de la caja",
    },
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real»).
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris en el bloque 6). `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: la respuesta de la IA a un reclamo de un cliente de Luz de Barrio (ficticio). Debe verse la separación entre hechos y emociones, la respuesta profesional (privada) y el siguiente paso concreto.",
    },
  ],

  checklist: [
    "Leí el borrador como lo leería el cliente, con su mensaje original al lado.",
    "Cada fecha, hora y dato coincide con mis registros, y cada oferta con lo que decidí y puedo cumplir.",
    "Ninguna frase culpa a un tercero ni discute con el cliente.",
    "En la respuesta pública no hay nombres, fechas, números de pedido, montos ni ofertas.",
    "Si el reclamo menciona salud, lesión, denuncia, abogado, disputa de pago o una ley, lo revisó una persona con criterio; revisé las normas de la plataforma de la reseña y las de consumo de mi país.",
  ],

  porQueFunciona: [
    {
      titulo: "Primero, la pausa",
      texto: "La respuesta impulsiva se escribe aparte y no se envía. Lo que sí haces enseguida es confirmar que recibiste el mensaje y decir cuándo responderás, con un plazo que puedas cumplir.",
    },
    {
      titulo: "Hechos, versión y emoción no son lo mismo",
      texto: "Lo que pasó se comprueba con tus registros. Lo que el cliente cree y lo que siente se escuchan, pero no se cuentan como hechos. Separarlos evita aceptar todo o negarlo todo.",
    },
    {
      titulo: "La decisión va antes del texto",
      texto: "Qué reconoces, qué ofreces y qué no lo decides tú, antes de pedir nada. La IA redacta a partir de esa decisión y no añade compensaciones ni promesas.",
    },
    {
      titulo: "Lo privado resuelve, lo público tranquiliza",
      texto: "En privado hay hechos, ofertas y una petición concreta. En público lo leen otros clientes: la respuesta es corta y no lleva datos del pedido ni ofertas.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia): un cliente reclama que el plato llegó frío a domicilio. Confirmado: hora de salida y de entrega. Sin confirmar: la temperatura. Ofrece: repetir el plato en su próximo pedido. No ofrece: reembolso total.",
      consejo: "Si hay riesgo de salud (alergias, intoxicación), no lo prepares con IA: lo atiende una persona.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Boutique Aldea (ficticia): una clienta reclama que la camiseta encogió. Confirmado: fecha de compra y etiqueta de lavado. Ofrece: cambio por otra talla dentro de los 15 días. No ofrece: reembolso pasado ese plazo.",
      consejo: "Pega tu política de cambios tal como está escrita: la respuesta la cita, no la reinterpreta.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio Trazo (ficticio, diseño gráfico): un cliente dice que la entrega llegó tarde. Confirmado: fecha acordada y fecha de envío. Ofrece: una ronda extra de ajustes sin costo. No ofrece: devolver el anticipo.",
      consejo: "Con servicios, deja por escrito qué estaba acordado antes del reclamo: es el hecho que más se discute.",
    },
  ],

  errores: [
    {
      error: "Responder en caliente",
      solucion: "Con el enojo puesto se discute, se ofrece de más para que pare o se promete lo que no se puede cumplir. Escribe la respuesta impulsiva aparte, no la envíes y responde cuando tengas hechos y decisión.",
    },
    {
      error: "Pedirle a la IA que «lo calme» sin hechos",
      solucion: "Rellena con causas, ofertas y promesas que suenan bien y nadie decidió. Pasa tus hechos y tu decisión, y pide solo el texto.",
    },
    {
      error: "Discutir en la reseña pública",
      solucion: "La leen otros clientes: una discusión o un dato del pedido te hace más daño que la reseña. Responde breve, sin datos ni ofertas, y sigue por privado.",
    },
    {
      error: "Dar todo por cierto o todo por falso",
      solucion: "Aceptar sin comprobar te compromete; negar sin comprobar enfurece más. Marca cada punto como confirmado, parcial o sin confirmar y pregunta lo que falta.",
    },
  ],

  faq: [
    { p: "¿Y si el cliente exige respuesta ya?", r: "Puedes confirmar que recibiste el mensaje y decir cuándo responderás, con un plazo que puedas cumplir. El texto de fondo espera a tener los hechos." },
    { p: "¿Respondo primero en privado o en la reseña?", r: "No hay una regla única. Aquí se responde primero en privado, para que el cliente no se entere de la oferta leyendo tu respuesta pública." },
    { p: "¿Puedo pegar el mensaje del cliente en una IA?", r: "Depende de la herramienta y de las normas de tu país. Quita nombre, teléfono, dirección y número de pedido antes, y comparte solo el texto necesario." },
    { p: "¿Y si creo que el cliente miente?", r: "Marca el punto como sin confirmar y pregunta lo que falta, sin acusar. Si sospechas un fraude, sigue el proceso de tu plataforma de pago, que esta herramienta no cubre." },
    { p: "¿Puede la IA decidir qué ofrecer?", r: "No. Lo que reconoces, ofreces y no ofreces lo decides tú antes de redactar. La IA solo escribe a partir de esa decisión." },
    { p: "¿Sirve para reclamos con riesgo legal o de salud?", r: "No. Una lesión, una denuncia, un abogado o una disputa de pago los debe llevar una persona con criterio." },
  ],

  relacionadas: ["clientes/responder-consultas-con-ia", "ventas/crear-descripciones-de-productos-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: el registro, la ficha y la tarjeta de decisión",
    parrafos: [
      "**El registro de hechos.** Antes de escribir, anota cada hecho con su fecha, hora y fuente. En el caso de Luz de Barrio (ficticio): pago confirmado el lunes 1 a las 10:20; el negocio escribió «sale mañana y te llega entre el jueves y el viernes»; el martes 2 el pedido no salió por falta de cajas; el jueves 4 a las 18:40 el cliente preguntó dónde estaba su pedido; el viernes 5 se emitió la guía y a las 10:05 se respondió el mensaje; el martes 9 la mensajería lo marcó entregado a las 14:12; el miércoles 10 llegó el reclamo.",
      "**La ficha del reclamo.** Cada punto del cliente se marca como confirmado, parcial o no confirmado, con lo que dicen tus registros y lo que falta comprobar. En el caso: que llegó el martes está confirmado; que le dijeron «el jueves» es parcial (el mensaje decía «entre el jueves y el viernes»); que era para el sábado, confirmado; que escribió tres veces, parcial (hay un mensaje, respondido al día siguiente); que la caja llegó golpeada, no confirmado (no hay foto).",
      "**La tarjeta de decisión.** La escribe la persona dueña antes de redactar: lo que reconoce (el pedido salió el viernes 5 y no el martes 2, como se informó), el motivo que puede decir (faltaron cajas de envío), lo que ofrece (devolver el costo del envío en hasta 5 días hábiles y un cupón del 10 % por 60 días), lo que no ofrece (devolver el total del pedido, y cómo lo dice), lo que pide al cliente (una foto de la caja) y el siguiente paso único.",
      "**Cómo usar la respuesta pública.** Espera a haber escrito por privado y publica después, para que el cliente no lea la oferta en tu respuesta pública. Deja fuera de ella las fechas, los montos, el motivo del retraso, la compensación y cualquier palabra dura del cliente; solo reconoce lo que puedes reconocer y dile que le escribiste por el canal privado.",
      "**Rúbrica de cinco criterios** para revisar el borrador (0, 1 o 2 puntos cada uno): cada hecho sale de tu ficha; ofrece solo lo que decidiste; reconoce lo que pasó sin culpar ni discutir; responde a cada punto; suena sereno y claro.",
      "**Lo que este método no hace.** No cubre reclamos con riesgo legal o de salud, no arregla la causa (una buena respuesta no evita el próximo reclamo si el problema sigue), no controla la reseña y necesita políticas propias de envío y devolución: sin ellas, la decisión se toma a ciegas.",
    ],
  },
});
