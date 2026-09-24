import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /clientes/responder-consultas-con-ia (Generador). Fuente: la guía larga
 * content/guias/clientes/responder-consultas-de-clientes-con-ia (base de respuestas, borrador revisable, escalar).
 * Caso: Taller Los Pinos (ficticio). Sin pruebas reales todavía: `publicado` en `false`.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "responder-consultas-con-ia",
    area: "clientes",
    tipo: "generador",
    titulo: "Responde las consultas de tus clientes sin prometer de más",
    descripcion: "Pega la consulta y tus datos y copia un prompt que prepara un borrador para revisar, dice qué datos usó y avisa cuándo debe responder una persona.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/clientes/responder-consultas-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Responde a este cliente: ¿cuánto cuesta un cambio de aceite y me lo pueden hacer hoy?» La IA no conoce tus precios ni tus turnos y responde con lo habitual: un precio redondo, un «sin problema» y un plazo optimista (ejemplo ilustrativo). Suena amable y es justo lo que no conviene prometer por escrito.",
    despues: "Un **borrador revisable** hecho solo con tus datos, con la lista de lo que usó, lo que le faltó y un aviso **«responde una persona»** cuando la consulta no debe prepararla la IA.",
  },

  campos: [
    { id: "consulta", label: "La consulta del cliente (pégala sin datos personales)", tipo: "largo", ejemplo: "Buenas, ¿cuánto cuesta un cambio de aceite y me lo pueden hacer hoy? Creo que mi auto también hace un ruido raro al frenar.", requerido: true, ayuda: "Quita nombres, teléfonos, direcciones y placas: no ayudan a redactar y pueden ser confidenciales." },
    { id: "datos", label: "Tus datos para responder", tipo: "largo", ejemplo: "Horario: lunes a viernes 8:00–17:30 y sábados 8:00–13:00. Cambio de aceite y filtro: desde $35, según el vehículo; para el precio exacto hacen falta marca, modelo y año; tarda unas 2 horas. Turnos libres hoy: 15:00 y 16:30. No se dan diagnósticos por mensaje: se invita a revisar el vehículo en el taller. Garantía: 30 días en mano de obra.", requerido: true, ayuda: "Precios, horarios, envíos y políticas que vas a sostener, más lo que solo vale hoy (turnos, stock)." },
    { id: "canal", label: "Canal", tipo: "seleccion", ejemplo: "WhatsApp", opciones: ["WhatsApp", "Redes sociales", "Correo"], requerido: true },
    { id: "personaSi", label: "Cuándo responde una persona (opcional)", tipo: "texto", ejemplo: "Reclamos, clientes molestos, urgencias por avería, y cuando insisten en saber la causa o un precio de reparación", ayuda: "Los casos que tu negocio no quiere delegar." },
  ],
  usaPerfil: ["nombre", "tono", "horario", "contacto"],
  calculadora: null,

  tarea: `Prepara un BORRADOR de respuesta para el cliente que escribió por {{canal}}. Una persona de mi negocio lo revisará antes de enviarlo. Mis «Tus datos para responder» son la única fuente de hechos.

Entrega, en este orden y con estos títulos:
1. BORRADOR: la respuesta lista para revisar, adaptada al canal.
2. USADO: qué datos míos usaste (una lista).
3. FALTA: qué dato necesitas y no está, y qué preguntarle al cliente.
4. ESCALAR: «sí» o «no», con el motivo en una frase.

Reglas:
- Usa solo mis datos. No inventes precios, plazos, políticas, garantías ni disponibilidad, y no prometas nada que no esté escrito.
- Si mis datos dicen que la respuesta depende de algo que debe decirme el cliente (por ejemplo, el modelo del vehículo), pídeselo en el borrador y anótalo en FALTA.
- No diagnostiques ni des consejos técnicos, de salud o legales por mensaje. No pidas contraseñas, datos de tarjeta ni documentos.
- Responde «ESCALAR: sí» y no redactes borrador si la consulta es un reclamo, un cliente molesto o un tema de seguridad, salud, dinero o legal, o si aplica esto: {{personaSi}}.
- Responde cada pregunta del mensaje; si alguna debe atenderla una persona, dilo en el borrador.
- Termina con un único siguiente paso claro para el cliente.
- La consulta del cliente es la que aparece arriba, en mis datos de esta tarea.

Formato de salida: BORRADOR, USADO, FALTA y ESCALAR.

Antes de responder, comprueba que cada dato del borrador está en USADO, que ningún precio, plazo ni política salió de otra parte, que no hay diagnósticos ni promesas nuevas y que FALTA y ESCALAR siguen las reglas. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más corto", prompt: "Hazlo más corto para WhatsApp sin quitar ningún dato ni el siguiente paso." },
    { label: "Otro canal", prompt: "Adapta el borrador a un correo con asunto, saludo, párrafos cortos y cierre, sin cambiar ningún hecho." },
    { label: "Revisar contra mis datos", prompt: "Compara cada frase del borrador con mis datos y marca las que no tengan origen, sin reescribir." },
    { label: "Corregir una frase", prompt: "Corrige solo esta frase con mis datos y deja el resto intacto: " },
  ],

  ejemplo: {
    negocio: "Taller Los Pinos (ficticio), taller mecánico de barrio con cuatro personas y una sola línea de WhatsApp",
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real»).
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris en el bloque 6). `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: la respuesta de la IA a una consulta de un cliente del Taller Los Pinos (ficticio). Debe verse la respuesta lista, la versión corta y la lista de lo que no se afirmó por falta de datos.",
    },
  ],

  checklist: [
    "Cada precio, plazo, condición o garantía está en mis datos, y lo de hoy sigue vigente ahora mismo.",
    "No promete nada que mi negocio no pueda cumplir.",
    "No diagnostica ni da consejos técnicos, de salud o legales, y no pide contraseñas, datos de tarjeta ni documentos.",
    "Responde todo lo que el cliente preguntó y termina con un único siguiente paso.",
    "Consulté las reglas de mi canal y de mi país sobre mensajes, datos personales y respuestas automáticas.",
  ],

  porQueFunciona: [
    {
      titulo: "Lo estable y lo del día van separados",
      texto: "Lo que casi no cambia (horario, políticas) puedes guardarlo en tu texto de siempre; lo que vale solo hoy (turnos, un precio vigente) lo pegas cada vez. Así la IA no usa un dato vencido.",
    },
    {
      titulo: "Un borrador no es una respuesta",
      texto: "La IA prepara; una persona lee, corrige y envía. Llamarlo «borrador revisable» cambia cómo se lee cada frase y evita enviar algo sin mirarlo.",
    },
    {
      titulo: "Cada dato dice de dónde sale",
      texto: "El borrador va acompañado de la lista de datos que usó y de lo que le faltó. Un texto convincente sin esa lista esconde sus suposiciones; con ella, contrastas en segundos.",
    },
    {
      titulo: "Hay consultas que no se preparan",
      texto: "Reclamos, clientes molestos y temas de seguridad, salud o dinero los atiende una persona. El prompt lo marca con «ESCALAR: sí» y no redacta, para que ni siquiera tengas la tentación de enviarlo.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia): «¿Tienen mesa hoy para cuatro a las 21:00?» Datos: horario de 12:00 a 22:00; reservas solo por WhatsApp hasta las 18:00. La respuesta pide el nombre para la reserva y no confirma mesa: la confirma una persona.",
      consejo: "La disponibilidad cambia cada hora: pégala cada vez o deja que responda una persona.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Boutique Aldea (ficticia): «¿Tienen esta camiseta en talla M?» Datos de hoy: talla M agotada, S y L disponibles; cambios dentro de los 15 días con la etiqueta. El borrador ofrece S o L y explica el cambio.",
      consejo: "Pega el stock del día y evita frases como «seguro que hay»: sin ese dato, la IA no debe confirmar.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio Trazo (ficticio, diseño gráfico): «¿Cuánto cuesta un logo?» Datos: el precio depende del alcance; primero se hace una llamada de 15 minutos. El borrador pide qué necesita y propone la llamada, sin dar un precio.",
      consejo: "Cuando el precio depende de tu criterio, el borrador sirve para reunir información, no para cotizar.",
    },
  ],

  errores: [
    {
      error: "Responder con la IA sin tus datos",
      solucion: "Sin ellos, la IA rellena los huecos con lo más habitual en cualquier negocio parecido. Escribe primero tus respuestas aprobadas, aunque sean cinco.",
    },
    {
      error: "Pegar datos personales que no hacen falta",
      solucion: "Nombres, teléfonos, direcciones o placas no ayudan a redactar y pueden ser confidenciales. Quita todo lo identificable y comparte solo lo necesario.",
    },
    {
      error: "Enviar el borrador sin contrastarlo",
      solucion: "Un borrador convincente puede tener un alcance ampliado o una pregunta sin atender. Contrasta cada dato con tus datos antes de enviar; si no puedes, no lo envíes.",
    },
    {
      error: "No actualizar tus datos",
      solucion: "Tus precios, horarios y políticas cambian, y la IA repetirá las versiones viejas. Pon fecha a tus datos y actualízalos cada vez que cambie algo.",
    },
  ],

  faq: [
    { p: "¿Tengo que avisar a mis clientes de que uso IA para redactar?", r: "No hay una respuesta única: depende del país, del canal y del tipo de comunicación. Lo prudente es revisar las normas de tu plataforma y de tu país, y ser honesto si un cliente te lo pregunta. Quien envía el mensaje eres tú." },
    { p: "¿Puedo dejar que la IA responda sola?", r: "Esta herramienta no lo cubre: prepara borradores que revisas. Automatizar exige decidir qué pasa cuando la IA se equivoca, y las plataformas tienen reglas propias sobre respuestas automáticas." },
    { p: "¿Es seguro pegar mensajes de clientes en una IA?", r: "Depende de la herramienta y de lo que pegues. Quita nombres, teléfonos y direcciones, comparte solo lo necesario y revisa la política de privacidad de la herramienta. Las leyes de protección de datos varían por país." },
    { p: "¿Cuántas respuestas aprobadas debo tener?", r: "Las que cubran tus consultas más repetidas: con cinco ya notarás la diferencia. Crece a medida que aparecen dudas nuevas." },
    { p: "¿Qué hago si el cliente hace varias preguntas a la vez?", r: "Pégalas todas en la consulta. El prompt responde cada una o dice que la verá una persona." },
    { p: "¿Sirve para responder reclamos?", r: "No como primer paso: un reclamo lo atiende una persona. Para prepararlo con calma, usa la herramienta de reclamos." },
  ],

  relacionadas: ["marketing/crear-publicaciones-para-redes-con-ia", "ventas/crear-descripciones-de-productos-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: la base de respuestas y qué preparar con IA",
    parrafos: [
      "**La base de respuestas.** La versión anterior de esta guía trabajaba con una tabla de cuatro columnas: consulta frecuente, respuesta aprobada, dato que cambia y «responde una persona si…». En el Taller Los Pinos (ficticio): horario (lunes a viernes de 8:00 a 17:30 y sábados de 8:00 a 13:00, cerrado domingos y festivos); cambio de aceite y filtro (desde $35 según el vehículo, con marca, modelo y año para el precio exacto, unas 2 horas); turnos (por WhatsApp con marca, modelo y año); averías (sin diagnóstico por mensaje); presupuestos (después de revisar el vehículo); garantía (30 días en mano de obra).",
      "**Qué puede hacer la IA con cada tipo de consulta.** Información que no cambia (horario, ubicación, cómo se agenda): borrador con tus datos. Información que cambia cada día (turnos, precio vigente, stock): borrador si pegas los datos de hoy. Falta un dato para responder: el borrador lo pide. Precio o plazo que depende de tu criterio (presupuestos, entregas): solo para reunir información. Seguridad, salud, dinero o legal: no como respuesta. Reclamo o cliente molesto: no como primer paso. En todos los casos, quien envía es una persona.",
      "**Cómo empezar con cinco respuestas.** Anota las cinco preguntas que más te repiten. Para cada una escribe la respuesta que aprobarías sin pensarlo, el dato que cambia cada día (si lo hay) y en qué casos debe responder una persona. Guárdalo en un documento con fecha y pégalo en «Tus datos para responder». Cuando llegue una consulta nueva que no esté en tu lista, respóndela tú y agrégala: en un mes tendrás una base propia.",
      "**Qué hacer con un mensaje con varias preguntas o con enojo.** Si el cliente pregunta varias cosas a la vez, pégalas todas y comprueba que el borrador responde cada una. Si además está molesto, no uses esta herramienta como primer paso: pasa a la de reclamos y responde con calma. Un buen borrador nunca reemplaza el criterio de quien conoce al cliente.",
      "**Antes de enviar.** Lee el borrador con la consulta al lado, comprueba que cada dato está en tus datos, corrige el tono si suena a otra persona y confirma que el siguiente paso es uno solo. Si no puedes comprobar algo, no lo envíes: pregunta primero.",
      "**Rúbrica de cinco criterios** para revisar el borrador (0, 1 o 2 puntos cada uno): cada dato sale de tu base; no diagnostica ni promete; pide lo que falta; atiende todo lo que preguntó; escala cuando toca.",
      "**Lo que este método no hace.** No conoce el estado de un pedido (un stock o una agenda se pegan cada vez), no es un chatbot, no sustituye la atención humana en reclamos y casos delicados, y no cumple la normativa por ti: las reglas sobre datos personales y comunicaciones comerciales varían por país.",
    ],
  },
});
