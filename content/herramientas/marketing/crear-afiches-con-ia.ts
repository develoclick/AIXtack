import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * PILOTO del modelo «Herramienta + guía corta»: /marketing/crear-afiches-con-ia (Generador).
 * Fuente: la guía larga content/guias/marketing/crear-afiches-con-ia (niveles, pruebas, rúbrica, errores)
 * y docs/reestructuracion-guiapromptsia.md (§4, ruta 3).
 *
 * `publicado: false` hasta que existan las capturas reales y la prueba (ver TODO más abajo). Todo el caso
 * (Panadería La Espiga, precios, dirección) es FICTICIO. Los textos N1–N4 del ejemplo son los del encargo
 * y salen de los campos por composición directa (lo comprueba lib/herramientas/afiches.test.ts): no
 * proceden de una respuesta real de una IA hasta que se añada la captura.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "crear-afiches-con-ia",
    area: "marketing",
    tipo: "generador",
    titulo: "Crea el texto de un afiche que se entiende de un vistazo",
    descripcion: "Llena los datos de tu oferta y copia un prompt que ordena el texto de tu afiche en cuatro niveles, con un brief para diseñarlo y una imagen sin texto.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real (por ejemplo «ChatGPT»). Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-19", // la guía larga original se publicó ese día
    ogImage: "/img/marketing/crear-afiches-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Hazme un afiche para mi panadería con una oferta de fin de semana.» La IA rellena con lo habitual: un descuento, un envío o un «el mejor pan del barrio» que nadie comprobó (ejemplo ilustrativo).",
    despues: "Un texto en **cuatro niveles** hecho solo con tus datos, un brief para maquetarlo y un prompt de imagen sin letras. Lo que falta queda marcado como [FALTA] en lugar de inventarse.",
  },

  campos: [
    { id: "oferta", label: "¿Qué ofreces?", tipo: "texto", ejemplo: "Combo de fin de semana: 6 panes y 1 pan dulce", requerido: true, ayuda: "Qué incluye, tal como lo dirías en el afiche. Sin el precio: va aparte." },
    { id: "precio", label: "Precio", tipo: "texto", ejemplo: "$6", requerido: true, ayuda: "Con el símbolo de tu moneda, tal como se verá." },
    { id: "diasHorario", label: "Días y horario", tipo: "texto", ejemplo: "Sábado y domingo, de 7:00 a 13:00", requerido: true, ayuda: "Cuándo aplica la oferta. No es el horario de todo el negocio." },
    { id: "accion", label: "¿Qué quieres que haga quien lo lea?", tipo: "texto", ejemplo: "Entrar a comprar el combo", requerido: true, ayuda: "Una sola acción: venir, llamar, escribir o reservar." },
    { id: "lugar", label: "Lugar o contacto que irá en el afiche", tipo: "texto", ejemplo: "Panadería La Espiga, Av. Ejemplo 123", requerido: true, ayuda: "Solo el dato que sirve a esa acción: una dirección, un teléfono o un enlace." },
    { id: "condiciones", label: "Condiciones", tipo: "largo", ejemplo: "Hasta agotar existencias. Máximo 2 combos por persona.", ayuda: "Opcional. Límites y letra pequeña, tal como deben aparecer." },
    { id: "tamano", label: "Tamaño", tipo: "seleccion", ejemplo: "A4", opciones: ["A4", "A3"], requerido: true },
    { id: "herramienta", label: "Herramienta de diseño", tipo: "seleccion", ejemplo: "Canva", opciones: ["Canva", "Otra herramienta"], requerido: true },
  ],
  usaPerfil: ["nombre", "direccion", "tono"],
  calculadora: null,

  tarea: `Prepara el contenido de un afiche para mi negocio. Entrega tres cosas y usa solo los datos de arriba.

1. TEXTO DEL AFICHE en cuatro niveles. Cada dato va en un solo nivel y se copia tal cual (cifras, horarios, direcciones); no lo completes ni lo reformules:
- Nivel 1 · Titular (lo único que se lee de lejos): la oferta con su precio.
- Nivel 2 · Apoyo: los días y el horario.
- Nivel 3 · Acción y contacto: la acción única y el lugar o contacto.
- Nivel 4 · Letra pequeña: las condiciones.
Entre los cuatro niveles no pueden sumar 40 palabras o más: cuéntalas y dime el total. Si hay que recortar, quita adjetivos y repeticiones, nunca un dato ni una condición. Si un nivel no tiene dato, escribe [FALTA: qué dato] en vez de inventarlo.

2. BRIEF PARA DISEÑAR en {{herramienta}}, tamaño {{tamano}}: orden de lectura, tamaño relativo de cada nivel (relativo, no en puntos ni centímetros), contraste, espacio y lo que no debe aparecer. No inventes colores, fuentes ni medidas: si falta un dato de marca o de impresión, escribe [FALTA: qué dato]. Para el contraste, pídeme comprobar el par de colores con un verificador; no afirmes que un par cumple.

3. PROMPT DE IMAGEN SIN TEXTO para un generador de imágenes: pide una sola imagen de apoyo con el producto de mis datos, sin letras, números, logotipos ni carteles dentro de la imagen, y con espacio libre para colocar el texto encima.

No uses superlativos («el mejor», «único»), no añadas descuentos, ahorros, envíos ni plazos que yo no haya dado, y no propongas más de una acción.

Formato de salida, en este orden y con estos títulos: TEXTO DEL AFICHE (Nivel 1, Nivel 2, Nivel 3, Nivel 4), TOTAL DE PALABRAS, DE DÓNDE SALE CADA DATO (copiado de mis datos o redactado por ti), BRIEF PARA DISEÑAR, PROMPT DE IMAGEN SIN TEXTO y FALTA.

Antes de responder, comprueba que cada cifra, horario y dirección de los niveles coincide letra por letra con mis datos, que hay una sola acción y que el total de palabras es menor de 40. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Otros titulares", prompt: "Dame tres versiones del nivel 1 sin cambiar el precio ni la vigencia." },
    { label: "Más corto", prompt: "Recorta el texto a menos de 30 palabras sin quitar ninguna condición: lo que salga del titular pásalo al nivel 4." },
    { label: "Revisar los datos", prompt: "Lista cada cifra, horario y dirección del texto final y dime si coincide letra por letra con mis datos." },
    { label: "Imagen sin texto", prompt: "Reescribe el prompt de imagen para que no aparezca ninguna letra, número ni logotipo dentro de la imagen." },
  ],

  ejemplo: {
    negocio: "Panadería La Espiga (ficticia), panadería de barrio con vitrina hacia la calle",
    resultado: {
      "Nivel 1 · Titular": "Combo de fin de semana: 6 panes y 1 pan dulce por $6",
      "Nivel 2 · Apoyo": "Sábado y domingo, de 7:00 a 13:00",
      "Nivel 3 · Acción y contacto": "Entrar a comprar el combo · Panadería La Espiga, Av. Ejemplo 123",
      "Nivel 4 · Letra pequeña": "Hasta agotar existencias. Máximo 2 combos por persona.",
      "Total": "39 palabras (menos de 40)",
    },
    capturas: [],
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris en el bloque 6). `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: la respuesta de la IA al prompt de esta página con el texto del afiche de la Panadería La Espiga (ficticia) en los niveles N1–N4, el brief para diseñarlo y el prompt de imagen sin texto. Los niveles deben coincidir con «Resultado del ejemplo» de la página.",
    },
    {
      archivo: "prueba-02.webp",
      etiqueta: "Resultado final diseñado con el texto de la IA",
      muestra: "El afiche final ya maquetado en la herramienta de diseño, con la foto de los panes, el combo como titular y la dirección abajo, usando el texto de la captura anterior.",
    },
  ],

  checklist: [
    "Cada cifra, horario y dirección coincide con mi fuente, dígito por dígito.",
    "Probé el teléfono, el enlace o la dirección antes de imprimir.",
    "No hay descuentos, ahorros, envíos ni superlativos que yo no haya dado.",
    "Pasa la prueba de los tres segundos y, desde donde estará quien lo lea, se ve el nivel 1.",
    "Vi una prueba impresa (o el archivo a tamaño real) antes de imprimir toda la tirada.",
  ],

  porQueFunciona: [
    {
      titulo: "Cuatro niveles, cada dato en uno solo",
      texto:
        "Un afiche se escanea, no se lee. El **titular** se ve de lejos, el **apoyo** completa la decisión, la **acción** dice qué hacer y la **letra pequeña** guarda las condiciones sin competir. Si un dato aparece en dos niveles, uno de los dos sobra.",
    },
    {
      titulo: "Los datos se copian, no se redactan",
      texto:
        "El prompt pide copiar cifras, horarios y direcciones tal como los escribiste. Si la IA tuviera que «completar» un dato, te estaría pidiendo que lo invente. Lo que falta queda como [FALTA] y se ve a la primera.",
    },
    {
      titulo: "Un tope de palabras obliga a decidir",
      texto:
        "El texto no puede sumar 40 palabras o más. Para respetarlo se quitan adjetivos y repeticiones, y lo necesario pero secundario baja a la letra pequeña. Eso es lo que hace que el titular se entienda en tres segundos.",
    },
    {
      titulo: "La IA prepara el mensaje; el diseño es tuyo",
      texto:
        "El prompt de imagen pide una foto de apoyo **sin letras**: un texto generado dentro de una imagen puede traer errores en un precio o un teléfono que solo se ven al imprimir. El texto final lo pones tú, copiado de tu ficha.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo:
        "Fonda El Sabor (ficticia), un afiche para la vitrina con cuatro niveles: titular «Menú del día: sopa, plato de fondo y bebida por $5»; apoyo «De lunes a viernes, de 12:00 a 15:00»; contacto «Reserva por WhatsApp · 999 999 999»; letra pequeña «Hasta agotar existencias.»",
      consejo: "El protagonista es lo que come el cliente y su precio, no el nombre del local. El nombre baja al nivel 3, junto al contacto.",
    },
    {
      rubro: "Tienda",
      ejemplo:
        "Boutique Aldea (ficticia), un afiche para la puerta: titular «Camisas: 2 por $15»; apoyo «Solo este sábado, de 10:00 a 18:00»; contacto «Pasa por la tienda · Calle Ejemplo 45»; letra pequeña «No acumulable con otras ofertas.»",
      consejo: "Si la oferta dura un solo día, la fecha va en el nivel 2 y bien visible: es lo que decide si la persona viene hoy.",
    },
    {
      rubro: "Servicios",
      ejemplo:
        "Estudio de uñas Brillo (ficticio), un afiche para la recepción: titular «Manicura con diseño: $12»; apoyo «Martes y miércoles, con cita»; contacto «Reserva por WhatsApp · 999 999 999»; letra pequeña «Cupos limitados por día.»",
      consejo: "Una sola acción y un solo contacto. Si pones teléfono, redes y correo con el mismo tamaño, nadie sabe cuál usar.",
    },
  ],

  errores: [
    {
      error: "Poner todo lo que quieres decir",
      solucion: "Cada vez que se te ocurra añadir algo, pregunta si ayuda a la acción. Si no, no va en los niveles 1 a 3; como mucho, va en la letra pequeña.",
    },
    {
      error: "Pedir el afiche diseñado, con el texto dentro de la imagen",
      solucion: "Pide solo el contenido y una imagen sin texto. El texto lo colocas tú en la herramienta de diseño, copiado de tu ficha.",
    },
    {
      error: "Reescribir a mano los datos al maquetar",
      solucion: "Copia y pega desde tu ficha. Si escribes «$6» de memoria, un día saldrá «$5» en el papel.",
    },
    {
      error: "No pensar en la distancia ni en el contraste",
      solucion: "Aléjate hasta donde estará el lector: lo que sigues viendo es tu mensaje real. Elige colores con mucha diferencia y compruébalos con un verificador.",
    },
  ],

  faq: [
    {
      p: "¿Puede la IA diseñar el afiche completo?",
      r: "Puede generar imágenes, pero el problema es el texto: precios, horarios y teléfonos deben ser exactos, y un texto generado dentro de una imagen puede traer errores que no se ven hasta imprimir. Por eso aquí la IA prepara el contenido y tú escribes el texto final.",
    },
    {
      p: "¿Cuántas palabras debe tener un afiche?",
      r: "No hay una cifra universal. Como referencia práctica, esta herramienta mantiene los cuatro niveles por debajo de 40 palabras y usa la prueba de los tres segundos: lo que no responde a qué ofreces, cuánto cuesta, hasta cuándo o qué hacer, sobra.",
    },
    {
      p: "¿Qué tamaño y resolución necesito para imprimir?",
      r: "Depende de la imprenta y del formato: pregúntale antes de diseñar qué tamaño, resolución, tipo de archivo y márgenes necesita. El brief te lo deja marcado como [FALTA] si no se lo diste.",
    },
    {
      p: "¿Cómo compruebo el contraste?",
      r: "Con un verificador de contraste (hay herramientas gratuitas en línea) y mirando el afiche desde lejos y con la luz real. Las pautas WCAG piden 4.5:1 para texto normal y 3:1 para texto grande; son pautas para web, útiles aquí como guía, no una norma para afiches impresos.",
    },
    {
      p: "¿Qué pasa si no sé todos los datos?",
      r: "Déjalos vacíos: el prompt marca cada dato requerido que falta como [FALTA] y la IA te lo pregunta en lugar de inventarlo. Puedes copiar el prompt igualmente y completar en el chat.",
    },
    {
      p: "¿Tengo que revisar alguna norma sobre publicidad?",
      r: "Sí: cómo mostrar precios y ofertas depende de tu país y de tu ciudad, y esta herramienta no lo cubre. Consulta a la autoridad competente o a un profesional antes de imprimir.",
    },
  ],

  relacionadas: ["marketing/crear-anuncios-con-ia", "marketing/crear-promociones-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: niveles, rúbrica y hoja de revisión",
    parrafos: [
      "**Ficha de los cuatro niveles.** Antes de pedir nada, reparte tus datos así. Nivel 1, titular: el más grande y lo único que se lee de lejos; casi siempre es la oferta con su precio, no el nombre del negocio. Nivel 2, apoyo: vigencia, fecha o lugar; si repite el titular, sobra. Nivel 3, acción y contacto: una sola acción y solo el dato que ella necesita. Nivel 4, letra pequeña: las condiciones que no deben competir con el mensaje. Si un nivel no lo sabes todavía, escribe «no lo sé»: el prompt lo marcará como [FALTA] en vez de rellenarlo.",
      "**Protagonista según el objetivo.** Para vender una oferta, el protagonista es la oferta con su precio y el apoyo es la vigencia; el error típico es poner el nombre del negocio más grande que la oferta. Para llenar un evento, es qué es el evento, con fecha, hora y lugar como apoyo; el error típico es esconder la fecha en la letra pequeña. Para ofrecer un servicio, es el problema que resuelve, con cómo contactarte como apoyo; el error típico es enumerar diez servicios con el mismo peso. Para avisar de un cambio, es el cambio en sí, con desde cuándo; el error típico es explicar el motivo en lugar del dato.",
      "**Prueba de los tres segundos y de distancia.** Mira el texto tres segundos y pregúntate: ¿qué ofrece?, ¿cuánto cuesta?, ¿hasta cuándo?, ¿qué hago? Lo que no responde a ninguna, sobra. Después aléjate hasta donde estará quien lo lea: lo que sigues viendo desde ahí es tu mensaje real; si es la oferta, funciona.",
      "**Rúbrica de seis criterios.** Puntúa el texto final con 0, 1 o 2 puntos en cada uno, hasta 12: usa solo mis datos; cifras y contacto exactos; un protagonista y un orden; se lee de pasada; una sola acción; suena a tu negocio (sin superlativos ni frases de anuncio). De 0 a 6 puntos, rehazlo desde tus datos; de 7 a 9, ajústalo empezando por el criterio con menos puntos; de 10 a 12, pasa a la hoja de revisión.",
      "**Hoja de revisión antes de imprimir.** Anota cada dato del afiche en una fila con tres columnas: el dato tal como aparece, si coincide con tu fuente y qué debes comprobar tú (que el precio sea el vigente, que el negocio abra en ese horario, que la dirección sea correcta yendo a comprobarla). La IA puede ayudarte a comparar; las pruebas de tres segundos, de distancia y la impresa solo puedes hacerlas tú.",
      "**Referencia de contraste.** Las pautas WCAG 2.2 piden una relación de 4.5:1 para texto normal y 3:1 para texto grande (consultado el 19 de septiembre de 2026 en w3.org, «Understanding Success Criterion 1.4.3: Contrast (Minimum)»). Son pautas para contenido web: aquí sirven de guía, no de norma para afiches impresos.",
      "**Lo que este método no hace.** No diseña el afiche, no conoce dónde se verá, puede colar un dato que no diste (por eso cada dato se compara con tu fuente) y no asegura visitas ni ventas: un afiche claro ayuda a que se entienda; lo que ocurra después depende de tu negocio.",
    ],
  },
});
