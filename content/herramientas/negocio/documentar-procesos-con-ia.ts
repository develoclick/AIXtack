import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /negocio/documentar-procesos-con-ia (Generador). Fuente: la guía larga content/guias/negocio/documentar-procesos-con-ia
 * (ficha del proceso, entrevista, procedimiento en tabla, checklist y prueba con otra persona). Caso: Cerámica Sol
 * (ficticia). Sin pruebas reales todavía: `publicado` en `false`.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "documentar-procesos-con-ia",
    area: "negocio",
    tipo: "generador",
    titulo: "Convierte cómo haces una tarea en un procedimiento claro",
    descripcion: "Cuenta a tu manera cómo haces una tarea y copia un prompt que la ordena en un procedimiento paso a paso, una lista con casillas y puntos de control.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/negocio/documentar-procesos-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Escríbeme el procedimiento para registrar un pedido en mi tienda online.» La IA no sabe qué herramientas usas ni cómo trabajas, y responde igual para todos: un procedimiento genérico, con pasos que nadie hace en tu negocio.",
    despues: "Un **procedimiento en tabla** hecho solo con lo que tú contaste (un paso, una acción, cómo saber que salió bien y qué hacer si sale distinto), una **lista con casillas** para quien empieza y los **puntos de control**. Lo que no dijiste queda como [FALTA].",
  },

  campos: [
    { id: "proceso", label: "Nombre del proceso", tipo: "texto", ejemplo: "Registrar un pedido, desde que llega el aviso hasta que sale el paquete", requerido: true, ayuda: "Lo que se hace, con un verbo." },
    { id: "comoLoHaces", label: "Cómo lo haces, contado a tu manera", tipo: "largo", ejemplo: "Llega el correo «Nuevo pedido». Abro el panel y miro que esté pagado. Reviso el stock. Anoto el pedido en la hoja. Empaco. Hago la etiqueta y dejo la caja para el mensajero. Pongo «Enviado» con el seguimiento.", requerido: true, ayuda: "Haz el proceso una vez con notas antes de contarlo: al recordar se saltan los pasos que haces sin pensar." },
    { id: "quienLoHace", label: "¿Quién lo hace y cuándo empieza?", tipo: "texto", ejemplo: "Lucía, cada vez que llega el correo «Nuevo pedido» de la tienda", requerido: true },
    { id: "seNecesita", label: "Qué se necesita (sin contraseñas)", tipo: "largo", ejemplo: "Panel de la tienda, hojas de stock y de pedidos, cajas", ayuda: "Accesos, materiales y herramientas. Nunca pegues contraseñas." },
    { id: "errores", label: "Errores frecuentes o casos raros", tipo: "largo", ejemplo: "A veces el pago está pendiente. A veces falta el dato del teléfono. A veces no queda stock de una pieza.", ayuda: "Lo raro también se escribe: es donde más se traba quien empieza." },
    { id: "terminaCuando", label: "Cuándo se considera terminado", tipo: "texto", ejemplo: "El pedido dice «Enviado», la fila de la hoja tiene el seguimiento y el stock está descontado", requerido: true },
    { id: "paraQuien", label: "¿Quién lo va a hacer?", tipo: "texto", ejemplo: "Mateo, que empieza el lunes y nunca lo hizo", requerido: true },
  ],
  usaPerfil: ["nombre", "rubro"],
  calculadora: null,

  tarea: `Convierte lo que te cuento en un procedimiento que otra persona pueda seguir sin preguntarme. Lo que aparece arriba en «Cómo lo haces» y en «Errores frecuentes» es la única fuente: no agregues pasos, herramientas, plazos ni cifras.

El proceso es «{{proceso}}» y lo hará {{paraQuien}}, que nunca lo hizo y no podrá preguntar.

Entrega, en este orden y con estos títulos:
1. ANTES DE EMPEZAR: lo que se necesita, con lo que dije en «Qué se necesita».
2. PROCEDIMIENTO: una tabla con las columnas fijas Paso | Qué hacer | Dónde | Cómo sé que salió bien | Si algo sale distinto.
3. CUÁNDO ESTÁ TERMINADO, con lo que dije en «Cuándo se considera terminado».
4. LISTA CON CASILLAS: una versión corta, de una línea por paso, con «Marca» y «Lo que compruebo», para imprimir.
5. PUNTOS DE CONTROL: los momentos del proceso en los que hay que detenerse a comprobar algo antes de seguir, solo si salen de lo que dije.
6. FALTA: cada dato que necesitarías y no dije.

Reglas:
- Un paso, una acción: cada paso empieza con un verbo y tiene un solo objeto. Respeta mi orden y no lo cambies.
- En «Dónde» pon el lugar o la herramienta tal como la nombré.
- En «Cómo sé que salió bien» pon una señal que yo di; si no la di, escribe [FALTA: señal].
- En «Si algo sale distinto» pon lo que dije que hago en ese caso; si no dije nada, escribe «—».
- Escribe para alguien que nunca hizo la tarea: sin abreviaturas ni «como siempre».
- No recomiendes mejoras y no resuelvas lo que dejé pendiente: pásalo a FALTA.

Formato de salida: ANTES DE EMPEZAR, PROCEDIMIENTO, CUÁNDO ESTÁ TERMINADO, LISTA CON CASILLAS, PUNTOS DE CONTROL y FALTA.

Antes de responder, comprueba que cada paso, herramienta y plazo salió de lo que dije, que cada paso tiene una sola acción, que el orden es el mío y que cada señal es una que yo di. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más simple", prompt: "Reescribe el procedimiento con frases más cortas para alguien que empieza, sin agregar pasos." },
    { label: "Corregir un paso", prompt: "El paso 4 no dice que no se envía sin el dato. Corrige solo ese paso con lo que dije y deja el resto igual." },
    { label: "Solo lo que dije", prompt: "Lista cada paso que no salga de mi relato y propón quitarlo o marcarlo como FALTA." },
    { label: "Registro de la prueba", prompt: "Prepara una tabla para anotar la prueba: paso, si lo hizo sin ayuda, dónde dudó y qué cambio hago." },
  ],

  ejemplo: {
    negocio: "Cerámica Sol (ficticia), tienda online de cerámica artesanal atendida por una sola persona",
    resultado: {
      "Lo que Lucía recordó": "7 pasos: llega el correo, abre el panel, revisa el stock, anota el pedido, empaca, hace la etiqueta y marca «Enviado»",
      "Lo que salió en la entrevista": "12 pasos: el proceso real tiene cinco pasos más que no estaban en las notas",
    },
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real»).
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` (recuadro gris en el bloque 6); nunca en un build de producción. `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: el procedimiento paso a paso, la lista para imprimir y los puntos de control que devuelve la IA para el proceso de Cerámica Sol (ficticia).",
    },
  ],

  checklist: [
    "Hice el proceso una vez, de verdad, con notas, antes de contarlo.",
    "Cada paso del procedimiento lo dije yo; la IA no agregó ninguno, y lo que marcó «FALTA» lo completé o sigue marcado.",
    "Cada paso tiene una sola acción y una señal de que salió bien.",
    "No pegué contraseñas ni datos personales de clientes en la conversación.",
    "Una persona que no conocía el proceso lo hizo sin mi ayuda, y cambié el procedimiento donde se trabó.",
  ],

  porQueFunciona: [
    {
      titulo: "Lo que haces no es lo que crees que haces",
      texto: "Al recordar se saltan los pasos que haces sin pensar, y esos son los que a quien empieza le faltan. En el caso de Cerámica Sol, el recorrido anotado tenía siete líneas y el proceso real, doce pasos.",
    },
    {
      titulo: "Un procedimiento responde cinco preguntas",
      texto: "Cuándo empieza, quién lo hace, qué hace falta, cuáles son los pasos y cuándo está terminado. Si falta una, quien lo sigue tiene que adivinar; por eso el formulario las pide todas.",
    },
    {
      titulo: "Lo raro también se escribe",
      texto: "Un pago pendiente o un dato que falta es donde más se traba quien empieza. Se escriben como «si pasa esto, haz esto» en la última columna de la tabla.",
    },
    {
      titulo: "Sirve cuando otra persona lo logra",
      texto: "Un procedimiento que solo entiende quien lo escribió no está terminado. La lista con casillas y el registro de la prueba sirven para comprobarlo con alguien que no sepa hacerlo.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia): «Abrir el local por la mañana». Pasos: encender los equipos, revisar la nevera, contar la caja y anotar el fondo. Señal de terminado: la lista de apertura está marcada y la caja anotada.",
      consejo: "Los procesos de apertura y cierre son los mejores para empezar: se repiten a diario y siempre los hace alguien distinto.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Boutique Aldea (ficticia): «Recibir mercadería». Pasos: contar contra la nota, revisar prendas dañadas, etiquetar y anotar el stock. Señal de terminado: el stock de la hoja coincide con lo contado.",
      consejo: "Incluye qué hacer cuando la cuenta no coincide: es el caso raro que más veces ocurre.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio Trazo (ficticio): «Entregar un proyecto a un cliente». Pasos: revisar el archivo final, exportar los formatos acordados, enviar el enlace y anotar la fecha. Señal de terminado: el cliente confirmó la recepción.",
      consejo: "Pon al final la comprobación que haría el cliente: es el punto donde un procedimiento suele quedarse corto.",
    },
    {
      rubro: "Taller o producción",
      ejemplo: "Luz de Cera (ficticio): «Preparar un lote de velas». Pasos: pesar la cera, preparar los vasos, verter y dejar reposar, y etiquetar el lote con su fecha. Señal de terminado: cada vela tiene su etiqueta y el lote quedó anotado en la hoja.",
      consejo: "En producción, anota los momentos en que hay que esperar (reposo, secado): quien empieza suele seguir con otra cosa y olvida volver a mirar.",
    },
  ],

  errores: [
    {
      error: "Contar el proceso de memoria",
      solucion: "Al recordar se saltan los pasos que haces sin pensar. Haz el proceso una vez con notas antes de contarlo.",
    },
    {
      error: "Pedirle el procedimiento a la IA sin contarle cómo lo haces",
      solucion: "Devuelve algo con buena pinta hecho de herramientas y plazos que no son los tuyos. Cuéntale tu proceso y pide que redacte solo con eso.",
    },
    {
      error: "Escribir para ti",
      solucion: "Las abreviaturas y los «como siempre» solo los entiende quien ya sabe hacerlo. Escribe para alguien que nunca hizo la tarea y no puede preguntar.",
    },
    {
      error: "Probarlo con quien ya sabe, o ayudar durante la prueba",
      solucion: "Quien ya conoce el proceso rellena los huecos sin darse cuenta. Pide la prueba a alguien que no lo conozca y anota sus preguntas sin responderlas: la respuesta va al procedimiento.",
    },
  ],

  faq: [
    { p: "¿Qué proceso conviene documentar primero?", r: "Uno que repitas seguido, que solo tú sepas y que quieras delegar. Uno pequeño." },
    { p: "¿Puedo dictar el recorrido en lugar de escribirlo?", r: "Sí, si te resulta más natural. Pásalo a texto y quita antes los nombres y los datos de clientes." },
    { p: "¿Qué hago si no tengo a nadie que lo pruebe?", r: "Pide el favor a alguien que no conozca la tarea, aunque no trabaje contigo. Probarlo tú sirve menos: rellenas los huecos sin darte cuenta." },
    { p: "¿Puedo pegar contraseñas o capturas para que la IA entienda mejor?", r: "No. Describe con palabras dónde está cada cosa; nunca pegues contraseñas ni datos personales de clientes." },
    { p: "¿Sirve para tareas que afectan a la seguridad o la salud?", r: "No. Si la tarea afecta la seguridad o la salud de alguien, requiere formación y normas que esta herramienta no cubre." },
    { p: "¿El procedimiento automatiza la tarea?", r: "No: describe los pasos que hace una persona. Automatizar es otra decisión, con otras herramientas y reglas." },
  ],

  relacionadas: ["clientes/responder-consultas-con-ia", "ventas/calcular-precios-y-margenes"],

  metodoCompleto: {
    titulo: "Método completo: ficha del proceso, entrevista, lista y prueba",
    parrafos: [
      "**La ficha de siete campos.** Nombre (lo que se hace, con un verbo); empieza cuando (el aviso o el día que lo dispara); lo hace (quién y con qué frecuencia); se necesita (accesos, materiales y herramientas, sin contraseñas); termina cuando (la señal de que está hecho); lo probará (una persona que no lo conozca). En el caso de Cerámica Sol (ficticia), el proceso es registrar un pedido y lo probará Mateo, que empieza el lunes.",
      "**La entrevista.** La versión anterior de esta guía hacía que la IA entrevistara a la dueña con preguntas de una en una, a partir de sus siete líneas de notas, y devolviera un resumen de sus respuestas con el estado de cada una (confirmado o pendiente). Esta herramienta te pide esa información en los campos del formulario: si algo te queda dudoso, dilo en «Errores frecuentes o casos raros» y saldrá como FALTA.",
      "**La prueba con otra persona.** Pídele a alguien que no conozca la tarea que la haga solo con la lista con casillas. Para cada paso anota si lo hizo sin ayuda, dónde dudó o se equivocó y qué cambio haces en el procedimiento. No lo ayudes durante la prueba: cada ayuda tapa un hueco que seguirá ahí cuando no estés. Al terminar, cambia el procedimiento donde se trabó y anota la fecha de la versión.",
      "**Cómo hacer el recorrido con notas.** Elige un momento en que vayas a hacer el proceso de verdad. Ten a mano un papel o un mensaje a ti mismo y anota cada cosa que haces, incluso las que te parecen obvias: abrir un programa, buscar una hoja, esperar una confirmación. No intentes ordenar nada todavía. Al terminar, cuéntale a la IA esas notas y añade lo que hiciste sin anotar.",
      "**Cómo mantenerlo vivo.** Un procedimiento se queda viejo cuando cambia una herramienta o un plazo. Pon la fecha de la versión al pie de la hoja, revisa el procedimiento cuando cambie algo y pídele a quien lo use que anote cualquier duda que tenga. Cada duda anotada es un paso o una excepción que falta.",
      "**Rúbrica de seis criterios** para revisar el procedimiento (0, 1 o 2 puntos cada uno): todo sale de tus respuestas; un paso, una acción; cada paso dice cómo saber que salió bien; lo que sale distinto dice qué hacer; lo entiende quien nunca lo hizo; lo que no sabes queda marcado.",
      "**Lo que este método no hace.** El procedimiento es tan bueno como tu recorrido (si haces el proceso con prisa, escribirás ese camino), una prueba con una persona no cubre todos los casos, no reemplaza la formación y no ejecuta ni automatiza nada.",
      "**Cómo elegir el nivel de detalle.** La medida la da quien va a seguir el procedimiento. Si es alguien que nunca hizo la tarea, cada paso debe poder hacerse sin preguntar: «abre la hoja de pedidos» y no «registra el pedido». Si el paso te obliga a decidir algo (¿está pagado?, ¿hay stock?), separa la decisión del paso y escribe qué se hace en cada respuesta. Un paso que mezcla dos acciones o una decisión escondida suele ser el que se traba en la prueba.",
      "**Cómo escribir la señal de que salió bien.** Debe ser algo que la persona pueda ver o comprobar, no una opinión: «la fila de la hoja tiene el número de seguimiento», «el estado del pedido dice Enviado», «la caja está cerrada con cinta y lleva la etiqueta». Evita «hazlo con cuidado» o «asegúrate de que esté bien». Si no encuentras una señal para un paso, pregúntate si ese paso hace falta o si en realidad es parte del anterior.",
      "**Cuántas excepciones documentar.** Escribe las que ocurren de verdad y las que cuestan caro si se ignoran; con cuatro o cinco casos raros suele bastar. Cuando un caso raro se repite cada semana, deja de ser una excepción: conviértelo en un paso del procedimiento. No intentes prever todo desde el primer día, porque un procedimiento con cien excepciones no lo lee nadie. Es más útil una versión corta que se actualiza con lo que sale en la práctica.",
      "**Cuándo dividir un proceso en dos.** Si el procedimiento ocupa más de una hoja, si dos personas distintas hacen partes distintas o si hay un momento en el que el proceso se detiene y sigue otro día, conviene partirlo en dos procedimientos que se enlazan («cuando termines, sigue con…»). Cada uno queda más fácil de enseñar, de probar y de actualizar.",
      "**Aviso.** Un procedimiento que describe tareas de personas puede tener consecuencias laborales, de seguridad o de salud que esta herramienta no valora. Para tareas con riesgos (maquinaria, productos químicos, alimentos, manejo de dinero) o que afecten a un contrato de trabajo, consulta las normas y a un profesional de tu país; aquí solo se ordena lo que tú cuentas.",
    ],
  },
});
