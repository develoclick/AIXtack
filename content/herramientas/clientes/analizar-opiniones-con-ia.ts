import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /clientes/analizar-opiniones-con-ia (Analizador). Fuente: la guía larga content/guias/clientes/analizar-opiniones-de-clientes-con-ia
 * (libro de códigos, citas literales, límites). Caso: Restaurante La Higuera (ficticio), 25 reseñas ficticias.
 *
 * Principio 9: la IA NO cuenta. La página cuenta cuántas reseñas mencionan cada tema con el libro de códigos que escribe
 * la persona («Tema: palabra, palabra») y le pasa esos conteos ya hechos a la IA, que solo lee, cita y propone acciones.
 * Sin pruebas reales todavía: `publicado` en `false`.
 */

const RESENAS = [
  "La pasta estaba deliciosa y las porciones son generosas.",
  "Esperamos casi una hora por los platos, aunque el mesero fue muy amable.",
  "Muy caro para lo que sirven, la porción era pequeña.",
  "Ambiente tranquilo y limpio, ideal para ir en familia.",
  "Llamé para reservar y nadie contestó en toda la tarde.",
  "El mesero se equivocó con el pedido y los platos tardaron en llegar.",
  "Excelente sabor, volveré pronto.",
  "Buen precio y el postre casero es una maravilla.",
  "Había mucho ruido y la música muy fuerte para conversar.",
  "Tardaron cuarenta minutos en traer la cuenta.",
  "La atención de la señora del mostrador fue excelente.",
  "Reservar por la web fue fácil y rápido.",
  "La sopa llegó fría y el pan estaba duro.",
  "Precios razonables, pero el local necesita una pintura.",
  "Mucha espera un sábado, pero valió la pena por la comida.",
  "Nos atendieron con mucha paciencia a pesar de ser un grupo grande.",
  "Los baños estaban sucios.",
  "Reservamos una mesa y al llegar no había ninguna lista.",
  "La carne en su punto y el personal siempre atento.",
  "Tardaron mucho en tomar el pedido.",
  "Me parece caro el menú del día.",
  "Un lugar acogedor y bien decorado.",
  "El mesero fue grosero cuando pedimos cambiar de mesa.",
  "Los platos salen rápido y todo llega caliente.",
  "Faltó variedad de platos vegetarianos.",
].join("\n");

const TEMAS = [
  "Comida: sabor, delici, porcion, pasta, sopa, pan, carne, postre, comida, caliente, fria, vegetarian",
  "Servicio: mesero, atencion, atendieron, personal, amable, atento, paciencia, grosero",
  "Espera: espera, tard, minutos, rapido",
  "Precio: precio, caro, barato",
  "Ambiente: ambiente, ruido, musica, limpio, sucio, local, decorado, acogedor, pintura, banos",
  "Reservas: reserv",
].join("\n");

export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "analizar-opiniones-con-ia",
    area: "clientes",
    tipo: "analizador",
    titulo: "Descubre qué dicen tus clientes en sus comentarios",
    descripcion: "Pega tus reseñas y tus temas: la página cuenta cuántas mencionan cada uno y el prompt pide a la IA leer, citar y proponer tres acciones sin contar.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/clientes/analizar-opiniones-con-ia/og.webp",
  },

  antesDespues: {
    antes: "«Te pego 25 reseñas de mi restaurante. ¿Cuántas hablan de la espera y cuáles son los problemas más comunes? Dame ejemplos citando las reseñas.» La IA no sabe qué cuenta como «espera», calcula mientras redacta y puede contar de más o citar con palabras que no son de ninguna reseña (ejemplo ilustrativo).",
    despues: "**Conteos hechos por la página** con tus propios temas, y una lectura de la IA con **citas copiadas letra por letra**, elogios, problemas y tres acciones. Aviso: los conteos dependen de tus palabras clave, y hay que comprobarlos.",
  },

  campos: [
    { id: "resenas", label: "Reseñas o comentarios (una por línea, sin datos personales)", tipo: "largo", ejemplo: RESENAS, requerido: true, ayuda: "Quita nombres, teléfonos y cuentas: no ayudan a clasificar y pueden ser confidenciales." },
    { id: "temas", label: "Tus temas y sus palabras clave", tipo: "largo", ejemplo: TEMAS, requerido: true, ayuda: "Una línea por tema: «Tema: palabra, palabra». Sin tildes ni mayúsculas. La página cuenta las reseñas que contienen alguna palabra." },
    { id: "periodo", label: "Período de las opiniones", tipo: "texto", ejemplo: "Último trimestre", requerido: true },
    { id: "origen", label: "¿De dónde vienen?", tipo: "texto", ejemplo: "Reseñas ficticias escritas para este ejemplo", requerido: true, ayuda: "Google, redes, encuestas… Quien opina no es quien no opina." },
    { id: "queQuieres", label: "Qué quieres entender (opcional)", tipo: "texto", ejemplo: "Qué se repite: quejas y elogios", ayuda: "Ayuda a ordenar las acciones." },
  ],
  usaPerfil: ["nombre", "rubro"],
  calculadora: null,

  preproceso: {
    tipo: "conteo-temas",
    campos: { texto: "resenas", temas: "temas" },
    casosDePrueba: [
      {
        nombre: "Las 25 reseñas ficticias de La Higuera",
        valores: { resenas: RESENAS, temas: TEMAS },
        esperado: { resenas: 25, "tema:Comida": 9, "tema:Servicio": 6, "tema:Espera": 8, "tema:Precio": 4, "tema:Ambiente": 5, "tema:Reservas": 3, sinTema: 0 },
      },
      {
        nombre: "Una reseña con dos temas cuenta en los dos; lo que no encaja queda «sin tema»",
        valores: { resenas: "Ricos los tacos pero muy lentos\nNo sé qué decir\nBuen ambiente", temas: "Comida: tacos, rico\nEspera: lento\nAmbiente: ambiente" },
        esperado: { resenas: 3, "tema:Comida": 1, "tema:Espera": 1, "tema:Ambiente": 1, sinTema: 1 },
      },
      {
        nombre: "Tildes y mayúsculas no importan; una reseña con dos palabras del mismo tema cuenta una vez",
        valores: { resenas: "ATENCIÓN lenta y demora\nLa atención fue buena", temas: "Servicio: atencion, demora" },
        esperado: { resenas: 2, "tema:Servicio": 2, sinTema: 0 },
      },
    ],
  },

  tarea: `Lee mis opiniones de clientes y dime qué se repite. Mis reseñas y mis temas están arriba, y los «Cálculos ya hechos» (los conteos por tema) los hizo la página con mis palabras clave: no cuentes, no sumes, no calcules porcentajes y no corrijas esos números.

Negocio, período y origen de las opiniones: los de mis datos. Qué quiero entender: {{queQuieres}}.

Entrega, en este orden y con estos títulos:
1. QUÉ SE REPITE: por cada uno de mis temas, una frase que diga qué comentan las reseñas en ese tema (positivo y negativo por separado), sin usar cifras que no estén en los conteos.
2. CITAS: para cada frase, una o dos citas copiadas letra por letra de mis reseñas, entre comillas. Una cita no se resume, no se corrige y no se cambia ni una palabra.
3. ELOGIOS y PROBLEMAS: dos listas cortas, ordenadas por cuántas reseñas los mencionan según los conteos de la página.
4. LO QUE NO ENCAJA: las reseñas que no pertenecen a ninguno de mis temas o que hablan de otro tema; propón, si hace falta, un tema nuevo y sus palabras clave (sin contarlas).
5. TRES ACCIONES POSIBLES para explorar, cada una ligada a un tema y marcada como hipótesis. No expliques por qué se quejan: las reseñas dicen qué se menciona, no por qué.
6. AVISO PARA VERIFICAR: qué debo comprobar en los conteos (por ejemplo, si alguna palabra clave cuenta reseñas que no son del tema).

Reglas:
- Usa solo el texto de mis reseñas. No inventes datos del cliente, causas ni intenciones.
- Si una reseña habla de salud, alergias o seguridad, no la clasifiques: anótala en PARA UNA PERSONA.
- Con pocas reseñas, habla de cantidades y no de porcentajes.
- No decides qué mejorar: la frecuencia no es importancia.

Formato de salida: QUÉ SE REPITE, CITAS, ELOGIOS, PROBLEMAS, LO QUE NO ENCAJA, ACCIONES, AVISO PARA VERIFICAR, PARA UNA PERSONA y FALTA.

Antes de responder, comprueba que cada cita aparece tal cual en una reseña (búscala), que no hiciste conteos ni porcentajes propios, que todas tus cifras están en los cálculos de la página y que cada acción está marcada como hipótesis. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más citas", prompt: "Añade una cita más por tema, copiada letra por letra de mis reseñas." },
    { label: "Comprobar las citas", prompt: "Lista cada cita que usaste con el id o el número de la reseña de la que sale, para que yo la compruebe." },
    { label: "Solo problemas", prompt: "Resume solo los problemas, del más al menos mencionado según los conteos, con una cita cada uno." },
    { label: "Preguntas para mis clientes", prompt: "Dame tres preguntas para entender mejor lo que dicen mis clientes en el tema más mencionado, sin suponer causas." },
  ],

  ejemplo: {
    negocio: "Restaurante La Higuera (ficticio), restaurante familiar; su dueña guarda 25 reseñas ficticias del último trimestre",
    resultado: {
      "Reseñas analizadas": "25",
      Comida: "9 de 25 (36.0 %)",
      Espera: "8 de 25 (32.0 %)",
      Servicio: "6 de 25 (24.0 %)",
      Ambiente: "5 de 25 (20.0 %)",
      Precio: "4 de 25 (16.0 %)",
      Reservas: "3 de 25 (12.0 %)",
    },
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real»).
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` (recuadro gris en el bloque 6); nunca en un build de producción. `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: la respuesta de la IA a las 25 reseñas ficticias de La Higuera con los conteos por tema de la página. Deben verse los temas, las citas textuales, elogios y problemas, y las tres acciones.",
    },
  ],

  checklist: [
    "Quité de las opiniones todo dato personal antes de compartirlas, y revisé las condiciones de la plataforma donde están las reseñas.",
    "Comprobé cada cita contra su reseña: está copiada letra por letra.",
    "Revisé que cada palabra clave cuente reseñas del tema correcto (y ajusté las que no).",
    "Las reseñas que hablan de salud, alergias o seguridad las revisó una persona.",
    "Sé cuántas opiniones tengo y no hablo de porcentajes si son pocas.",
  ],

  porQueFunciona: [
    {
      titulo: "La página cuenta; la IA lee",
      texto: "Una IA puede equivocarse al contar aunque muestre una lista, y nadie lo nota sin algo con lo que comparar. Aquí el conteo lo hace una regla que tú escribes y la IA recibe los números ya hechos.",
    },
    {
      titulo: "Un tema tiene límites",
      texto: "Sin reglas, cada persona etiqueta a su manera. Tus palabras clave dicen qué reseñas entran en cada tema, y puedes ajustarlas hasta que los conteos tengan sentido.",
    },
    {
      titulo: "Una cita es una cita",
      texto: "Una cita se copia letra por letra. Si el asistente la resume o la corrige, ya no prueba nada. Por eso el prompt exige citas literales y pide comprobarlas con la reseña.",
    },
    {
      titulo: "Pocas opiniones, pocas afirmaciones",
      texto: "Con 25 reseñas conviene hablar de cantidades: un porcentaje suena preciso y no lo es. Y lo que no está en los textos, como las causas, no se afirma: se marca como hipótesis.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia): temas «Comida», «Servicio», «Espera» y «Precio». Palabras clave de «Espera»: espera, tard, minutos, rapido. Una reseña «tardaron mucho pero rico» cuenta en Espera y en Comida.",
      consejo: "Una reseña puede tener dos temas. La página la cuenta en los dos y no se pierde ninguna queja.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Boutique Aldea (ficticia): temas «Talla», «Calidad», «Envío» y «Atención». Palabras clave de «Envío»: envio, llego, demora, paquete. Una reseña «llegó rápido, pero la talla no era» cuenta en Envío y en Talla.",
      consejo: "Empieza con pocos temas y mira qué reseñas caen en «sin tema»: ahí aparecen los temas que no habías pensado.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio Trazo (ficticio, diseño gráfico): temas «Plazos», «Comunicación» y «Resultado». Palabras clave de «Plazos»: entrega, plazo, tarde, rapido. Una reseña sobre «buena comunicación» cuenta solo en Comunicación.",
      consejo: "En servicios, las palabras cambian según el cliente («entregaron tarde» y «tardaron»). Añade las variantes que veas.",
    },
    {
      rubro: "Tienda online",
      ejemplo: "Cerámica Sol (ficticia), tienda online de una sola persona: temas «Producto», «Embalaje», «Envío» y «Atención». Las reseñas de piezas rotas suelen mencionar embalaje y envío a la vez, y la página las cuenta en los dos.",
      consejo: "Separa «Embalaje» de «Envío»: el primero lo controlas tú y el segundo, en buena parte, el transportista. Así sabes qué puedes cambiar hoy.",
    },
  ],

  errores: [
    {
      error: "Pegar reseñas con datos personales",
      solucion: "Nombres, teléfonos o cuentas no ayudan a clasificar y pueden ser confidenciales. Anonimiza antes: quita todo lo que identifique.",
    },
    {
      error: "Dejar que la IA cuente",
      solucion: "Puede equivocarse al contar aunque muestre una lista. Que cuente la página y que la IA lea, cite y proponga.",
    },
    {
      error: "Aceptar citas que no puedes comprobar",
      solucion: "Una cita retocada suena a lo que dijo un cliente y no lo dijo nadie. Pide citas literales y búscalas en tus reseñas.",
    },
    {
      error: "Explicar por qué se quejan",
      solucion: "Las reseñas dicen qué se menciona, no por qué. Cuenta lo que dicen y marca cualquier explicación como hipótesis; las causas se investigan hablando con clientes.",
    },
  ],

  faq: [
    { p: "¿Puedo pegar reseñas de mis clientes en una IA?", r: "Depende de la herramienta, de lo que pegues y de las normas de tu país. Quita nombres, teléfonos y cuentas, comparte solo el texto necesario y revisa la política de privacidad de la herramienta." },
    { p: "¿Cuántas opiniones necesito?", r: "No hay una cifra mágica. Con pocas, las lees tú; con decenas, los conteos ya ayudan. Con pocas, habla de cantidades, no de porcentajes." },
    { p: "¿Cómo cuenta la página cada tema?", r: "Cuenta las reseñas que contienen alguna de las palabras clave del tema, sin distinguir mayúsculas ni tildes. Es un método sencillo y transparente: si una palabra cuenta reseñas que no son del tema, cámbiala." },
    { p: "¿Sirve para opiniones en otro idioma o con faltas de ortografía?", r: "Puede servir, pero añade las variantes y faltas más comunes como palabras clave. Las citas deben seguir copiándose tal cual." },
    { p: "¿Y si una reseña es muy dura o habla de salud?", r: "Esa la lee una persona. El prompt la separa en «Para una persona» y no la clasifica." },
    { p: "¿La IA me dirá qué mejorar primero?", r: "No decide por ti: la frecuencia no es importancia, y un tema poco mencionado puede pesar más para tu negocio. Propone acciones como hipótesis para explorar." },
  ],

  relacionadas: ["clientes/responder-reclamos-con-ia", "clientes/responder-consultas-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: libro de códigos, conteos y límites",
    parrafos: [
      "**El libro de códigos.** Cada tema tiene una definición y unos límites: qué incluye y qué no. En La Higuera (ficticio): «Comida» incluye sabor, temperatura, variedad y porciones, y no el precio ni lo que tardan; «Servicio», el trato del personal, y no cuánto tardan ni el proceso de reservar; «Espera», el tiempo hasta ser atendido, recibir los platos o pagar; «Precio», lo que cuesta y si vale lo que cuesta; «Ambiente», local, ruido, música, limpieza y decoración; «Reservas», reservar y encontrar la mesa lista al llegar. La página cuenta con palabras clave: la definición es la que decide qué palabras pones.",
      "**Una opinión, una o dos menciones.** Cada mención tiene un tema y una valencia (positiva o negativa, según lo que dice el texto). Una reseña tiene dos menciones si habla de dos temas. La versión anterior de esta guía clasificaba cada reseña con la IA y contaba con una hoja de cálculo; esta página cuenta directamente las reseñas por tema con tus palabras clave, y la IA se ocupa de leer, citar y proponer.",
      "**Cómo ajustar las palabras clave.** Ejecuta el conteo, mira cuántas reseñas quedan «sin tema» y cuáles son. Si hay reseñas que hablan de un tema tuyo con otras palabras, agrégalas. Si una palabra cuenta reseñas de otro tema (por ejemplo, «local» en una reseña sobre un «local» de otra ciudad), quítala o hazla más específica. Repite hasta que los conteos coincidan con tu lectura de una muestra.",
      "**Cómo leer los conteos.** Un conteo de «9 de 25» dice cuántas reseñas contienen alguna palabra del tema, no cuántas lo dicen en positivo o en negativo. Para eso están las citas: la IA copia frases literales y tú las lees para ver si el tema aparece como queja o como elogio. Un tema muy mencionado puede ser muy elogiado; la frecuencia no es importancia ni es un problema por sí sola.",
      "**Qué hacer con el resultado.** Elige un tema, lee todas sus reseñas completas (no solo las citas), anota qué cambiarías y qué comprobarías con tus clientes antes de cambiar nada. Guarda el libro de códigos y las palabras clave para repetir el análisis el próximo trimestre y comparar con el mismo criterio.",
      "**Rúbrica de cinco criterios** para revisar la lectura de la IA (0, 1 o 2 puntos cada uno): cada cita está en su reseña; aplica tus temas; recoge todas las menciones; la valencia es la del texto; no cuenta ni calcula.",
      "**Lo que este método no hace.** No explica por qué se quejan, no representa a todos tus clientes (quien deja una opinión no es quien no la deja), no decide qué mejorar y no cubre la normativa de datos personales ni de uso de reseñas, que varía por país y plataforma.",
      "**Cómo elegir tus temas.** Empieza con cuatro a seis temas y haz que cada uno corresponda a algo que puedas cambiar: la comida, la espera, el trato, el precio. Un tema que nunca podrías mejorar (el clima, por ejemplo) solo ensucia el conteo. Comprueba que los temas no se pisen: si «Servicio» y «Espera» comparten palabras, las mismas reseñas contarán en los dos y no sabrás cuál pesa más. Cuando un tema acumule muchas reseñas, pártelo (por ejemplo, «Comida» en «Sabor» y «Porciones») y vuelve a contar.",
      "**Una muestra de control antes de fiarte.** Lee tú diez reseñas, anota a mano en qué temas caen y compáralo con lo que cuenta la página. Si coinciden, los conteos te sirven; si no, las palabras clave necesitan ajuste. Es una revisión de diez minutos que evita decidir con un conteo equivocado, y conviene repetirla cada vez que cambies las palabras clave.",
      "**Lo que un conteo por palabras no entiende.** La página busca palabras: no distingue la negación («no estaba frío» cuenta en el mismo tema que «estaba frío»), ni la ironía, ni una reseña que menciona un tema solo de pasada. Por eso el conteo dice cuántas reseñas hablan de algo, no si lo elogian o lo critican. Esa lectura la aportan las citas: léelas enteras, con la reseña delante, antes de decir «se quejan de esto».",
      "**Cuándo pedir más que un conteo.** Si un tema aparece en muchas reseñas y no entiendes el motivo, no lo supongas: pregúntalo a tus clientes con dos o tres preguntas concretas (la IA puede ayudarte a redactarlas) y compara con la siguiente tanda de opiniones. Un análisis de reseñas sugiere dónde mirar; hablar con la gente confirma qué pasa.",
      "**Aviso.** Las reseñas son texto de otras personas: quita nombres, teléfonos y cualquier dato que las identifique antes de pegarlas en una herramienta de IA y revisa las condiciones de la plataforma donde se publicaron. Esta herramienta no da asesoría legal sobre protección de datos ni sobre el uso de reseñas, que cambia según el país.",
    ],
  },
});
