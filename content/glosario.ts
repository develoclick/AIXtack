/**
 * Glosario compartido de todas las guías. Cada término se define UNA vez, en lenguaje simple,
 * y las guías lo usan con <Term id="…">término</Term> (y lo listan en `data.glossary`). Así
 * el mismo concepto no se explica de forma distinta en cada página. No incluye nombres de
 * marcas ni datos que caduquen.
 */
export interface GlossaryEntry {
  id: string;
  term: string;
  /** Definición en una o dos frases, sin jerga. */
  simple: string;
}

export const glossary: readonly GlossaryEntry[] = [
  {
    id: "prompt",
    term: "Prompt",
    simple: "El mensaje que le escribes a una IA para pedirle algo. Es como el encargo que le das a un empleado nuevo: cuanto más claro, mejor sale el trabajo.",
  },
  {
    id: "asistente-ia",
    term: "Asistente de IA",
    simple: "Un programa con el que conversas por escrito para que te ayude a redactar, ordenar ideas o revisar textos. Responde según lo que le pidas y puede equivocarse.",
  },
  {
    id: "dato-inventado",
    term: "Dato inventado",
    simple: "Una afirmación que la IA escribe con total seguridad pero que no salió de tus datos ni de ninguna fuente. A veces se le llama «alucinación».",
  },
  {
    id: "pilar-de-contenido",
    term: "Pilar de contenido",
    simple: "Un tema grande y repetible sobre el que publicas con frecuencia, ligado a algo que tu cliente necesita saber, decidir o resolver.",
  },
  {
    id: "formato",
    term: "Formato",
    simple: "La forma que toma una publicación: una imagen con texto, una serie de imágenes, un texto largo, un mensaje breve, una lista.",
  },
  {
    id: "canal",
    term: "Canal",
    simple: "El lugar donde publicas o hablas con tus clientes: una red social, un correo, tu sitio web o un cartel en tu local.",
  },
  {
    id: "llamada-a-la-accion",
    term: "Llamada a la acción",
    simple: "La frase que le dice a quien lee qué hacer a continuación: escribirte, reservar, pasar por el local.",
  },
  {
    id: "alcance",
    term: "Alcance",
    simple: "Cuántas personas distintas vieron una publicación. Cada plataforma lo mide a su manera.",
  },
  {
    id: "interaccion",
    term: "Interacción",
    simple: "Lo que hace una persona con una publicación: responder, guardarla, compartirla o hacer clic.",
  },
  {
    id: "rubrica",
    term: "Rúbrica",
    simple: "Una lista de criterios con puntaje para evaluar algo siempre de la misma manera, en lugar de decidir «a ojo».",
  },
  {
    id: "hoja-de-calculo",
    term: "Hoja de cálculo",
    simple: "Un programa con filas y columnas donde guardas datos y haces cuentas con fórmulas, por ejemplo sumar una columna. Aquí es donde se calculan los totales.",
  },
  {
    id: "hipotesis",
    term: "Hipótesis",
    simple: "Una explicación posible de algo que viste en los números y que todavía no está comprobada. No es lo mismo que una causa.",
  },
  {
    id: "tendencia",
    term: "Tendencia",
    simple: "La dirección en la que van tus números con el paso del tiempo: suben, bajan o se mantienen.",
  },
  {
    id: "ticket-promedio",
    term: "Ticket promedio",
    simple: "Cuánto gasta en promedio cada compra: las ventas totales divididas entre el número de compras.",
  },
  {
    id: "dato-personal",
    term: "Dato personal",
    simple: "Cualquier información que identifica a una persona: nombre, teléfono, correo o dirección. Las ventas se pueden analizar sin ella.",
  },
  {
    id: "voz-de-marca",
    term: "Voz de marca",
    simple: "La manera en que tu negocio habla: el tono, las palabras que usa y las que evita. Es lo que hace que un texto suene a ti y no a cualquiera.",
  },
  {
    id: "brief",
    term: "Brief",
    simple: "Un resumen escrito de lo que quieres conseguir con una pieza (un anuncio, una publicación, un afiche) antes de crearla: para quién, con qué datos y para provocar qué acción.",
  },
  {
    id: "margen",
    term: "Margen",
    simple: "Lo que te queda de una venta después de restar lo que te cuesta producirla o comprarla: precio menos costo.",
  },
  {
    id: "materia-prima",
    term: "Materia prima",
    simple: "Lo que ya sabes de tus clientes y de tu negocio, escrito: sus preguntas, sus problemas, la temporada y tus productos con su uso.",
  },
  {
    id: "lote",
    term: "Lote",
    simple: "Producir varias piezas seguidas en una sola sesión, en lugar de una por una en días distintos.",
  },
  {
    id: "reciclaje",
    term: "Reciclaje de contenido",
    simple: "Volver a usar una pieza ya publicada con otro formato u otro ángulo, sin cambiar sus datos.",
  },
  {
    id: "gancho",
    term: "Gancho",
    simple: "La primera frase de un anuncio o una publicación: la que decide si alguien sigue leyendo o pasa de largo.",
  },
  {
    id: "publico-frio",
    term: "Público frío",
    simple: "Personas que todavía no conocen tu negocio y ven tu anuncio sin ninguna otra información sobre ti.",
  },
  {
    id: "prueba-a-b",
    term: "Prueba A/B",
    simple: "Comparar dos versiones de lo mismo que se diferencian en una sola cosa, para ver cuál funciona mejor sin adivinar.",
  },
  {
    id: "jerarquia-visual",
    term: "Jerarquía visual",
    simple: "El orden de importancia con el que se ve y se lee una pieza: primero lo más grande y contrastado, después lo demás.",
  },
  {
    id: "contraste",
    term: "Contraste",
    simple: "La diferencia de claridad entre el texto y su fondo: cuanto mayor es, más fácil se lee, sobre todo de lejos.",
  },
  {
    id: "sangrado",
    term: "Sangrado",
    simple: "El margen extra de color o imagen que se imprime más allá del borde para que, al cortar el papel, no queden bordes blancos.",
  },
  {
    id: "variable",
    term: "Variable",
    simple: "Un hueco marcado dentro de un prompt, como {{FICHA}}, que tú rellenas con tus datos antes de enviarlo. Lo demás del prompt no cambia.",
  },
  {
    id: "indicador",
    term: "Indicador",
    simple: "Una cifra concreta que puedes contar con lo que ya tienes, como las unidades vendidas de un producto o los mensajes recibidos, para saber si algo funcionó.",
  },
  {
    id: "libro-de-codigos",
    term: "Libro de códigos",
    simple: "La lista de temas con la que clasificas opiniones. De cada tema dice qué incluye y qué no, para que dos personas (o una IA) etiqueten lo mismo de la misma manera.",
  },
  {
    id: "escalar",
    term: "Escalar",
    simple: "Pasar una consulta a una persona en lugar de responderla con un borrador de IA, porque es delicada o depende de su criterio.",
  },
  {
    id: "recargo",
    term: "Recargo",
    simple: "El porcentaje que se suma al costo para llegar al precio. Se calcula sobre el costo, no sobre el precio, y por eso no es lo mismo que el margen.",
  },
  {
    id: "costo-fijo",
    term: "Costo fijo",
    simple: "Un gasto que pagas se venda o no se venda, como el alquiler, la luz o el gas. Para ponerlo en el precio se reparte entre las unidades que vendes.",
  },
  {
    id: "anticipo",
    term: "Anticipo",
    simple: "La parte del precio que el cliente paga antes de que empieces el trabajo, para confirmarlo. El resto se llama saldo.",
  },
  {
    id: "linea-de-base",
    term: "Línea de base",
    simple: "El período anterior con el que comparas un resultado: de la misma duración, con los mismos días abiertos y, si es posible, sin otra promoción.",
  },
  {
    id: "reclamo",
    term: "Reclamo",
    simple: "Una queja concreta de un cliente sobre algo que le pasó con su compra, casi siempre con una petición. No es una consulta (una duda) ni una opinión general.",
  },
  {
    id: "validacion",
    term: "Validación",
    simple: "Comprobar con personas reales, y no con la IA, que alguien quiere y pagaría lo que imaginaste. Se hace con una prueba pequeña y con criterios fijados antes de empezar.",
  },
  {
    id: "preventa",
    term: "Preventa",
    simple: "Ofrecer algo antes de producirlo para ver si alguien lo encarga. Solo es honesta si después entregas lo prometido o devuelves el dinero.",
  },
  {
    id: "dependencia",
    term: "Dependencia",
    simple: "Una tarea que no puedes hacer hasta terminar otra. Si la haces antes, el trabajo se repite o se pierde.",
  },
  {
    id: "capacidad",
    term: "Capacidad",
    simple: "Los minutos que una persona tiene de verdad para una tarea, después de su trabajo normal. Sin ese límite, cualquier plan parece posible.",
  },
  {
    id: "tarea-recurrente",
    term: "Tarea recurrente",
    simple: "Una tarea que vuelve cada semana o cada mes, como revisar el stock o pagar el alquiler. Se anota una vez y se reserva su tiempo antes que el de las demás.",
  },
  {
    id: "procedimiento",
    term: "Procedimiento",
    simple: "Las instrucciones por escrito, paso a paso, para que otra persona haga una tarea igual que tú, sin preguntarte.",
  },
  {
    id: "disparador",
    term: "Disparador",
    simple: "Lo que hace que un proceso empiece, como un correo que llega o un día de la semana. Saberlo evita olvidar la tarea o hacerla antes de tiempo.",
  },
  {
    id: "excepcion",
    term: "Excepción",
    simple: "Un caso que se sale del camino normal y pide una decisión, como un pago pendiente. Se escribe como «si pasa esto, haz esto».",
  },
  {
    id: "ficha-de-contexto",
    term: "Ficha de contexto",
    simple: "Un texto corto y fijo con lo que tu negocio ya sabe: qué vende, sus políticas, sus horarios, su tono y sus límites. Se pega al empezar cada conversación con la IA, para no explicarlo cada vez y para que no lo invente.",
  },
  {
    id: "nota-de-traspaso",
    term: "Nota de traspaso",
    simple: "Un resumen que escribes al cerrar el día: lo hecho, lo pendiente con su motivo, lo decidido y las dudas. Al día siguiente es el punto de partida, porque un asistente puede no conservar lo de ayer.",
  },
  {
    id: "evidencia",
    term: "Evidencia",
    simple: "Un dato con su fuente y su fecha de consulta. Sin esas dos cosas es solo una afirmación: puedes usarla como pista, pero no como hecho.",
  },
  {
    id: "diferenciacion",
    term: "Diferenciación",
    simple: "Lo que hace que tus clientes te elijan a ti y no a otro negocio parecido. Se comprueba con clientes reales; no se decreta comparando fichas.",
  },
  {
    id: "total-de-control",
    term: "Total de control",
    simple: "Una cuenta de comprobación: sumas los mismos datos de dos maneras distintas y los resultados deben coincidir. Si no coinciden, hay un error en los datos o en las fórmulas.",
  },
  {
    id: "costo-real-por-unidad",
    term: "Costo real por unidad",
    simple: "Lo que de verdad pagas por cada unidad que necesitas: el total con impuestos y envío, dividido entre esas unidades. Casi nunca coincide con el precio de lista.",
  },
  {
    id: "tramo",
    term: "Tramo",
    simple: "Un rango de cantidad que tiene su propio precio. Por ejemplo, un precio hasta cierta cantidad y otro más bajo desde una cantidad mayor.",
  },
  {
    id: "compensacion",
    term: "Compensación",
    simple: "Lo que un negocio ofrece para reparar una molestia: devolver dinero, un descuento, repetir el trabajo. Se decide antes de redactar la respuesta y solo se ofrece lo que se puede cumplir.",
  },
];

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return glossary.find((entry) => entry.id === id);
}
