import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /marketing/calendario-de-contenido-con-ia (Kit, fusión de calendario-de-contenido e ideas-de-contenido). Fuentes: las dos
 * guías largas (capacidad, tiempo por pieza, lotes, reciclaje; materia prima, pilares, rúbrica). Caso: Restaurante Mesa
 * Larga (ficticio), con los tiempos de la guía de calendario.
 *
 * La página calcula cuántas piezas caben en tus horas (principio 9); la IA reparte exactamente esa cantidad por semana y
 * NO suma minutos. Sin pruebas reales todavía: `publicado` en `false`.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "calendario-de-contenido-con-ia",
    area: "marketing",
    tipo: "kit",
    titulo: "Arma tu calendario de publicaciones del mes",
    descripcion: "Calcula cuántas publicaciones caben en tu tiempo y copia un prompt que arma un banco de 12 ideas, un calendario de 4 semanas y un plan para producir por lotes.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/marketing/calendario-de-contenido-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Hazme un calendario de contenido para un mes para mi restaurante.» La IA no sabe cuánto tarda cada pieza, cuántas horas tienes ni qué días no publicas: llena cada día con lo que le parece razonable y añade fechas comerciales de memoria (ejemplo ilustrativo). Parece prolijo y no se puede cumplir.",
    despues: "La página calcula **cuántas piezas caben en tu tiempo real**; la IA arma un **banco de 12 ideas** que salen de tu negocio, un **calendario de 4 semanas** con esa cantidad exacta por semana y un **plan para producir por lotes**.",
  },

  campos: [
    { id: "materiaPrima", label: "Productos o temas del mes y lo que te preguntan tus clientes", tipo: "largo", ejemplo: "Menú del día de martes a viernes. Platos de la casa: guiso de la abuela, empanadas al horno, postre de la casa. Preguntas de clientes: si hay mesa entre semana, si se puede reservar para grupos, si hay opciones vegetarianas.", requerido: true, ayuda: "Lo que ya sabes de tu negocio, escrito: productos, problemas que resuelves, preguntas repetidas. Es lo que hace tuyas las ideas." },
    { id: "objetivo", label: "Objetivo del mes", tipo: "texto", ejemplo: "Que reserven mesa entre semana", requerido: true, ayuda: "Uno solo. Cada publicación empuja una acción." },
    { id: "fechas", label: "Fechas importantes (opcional)", tipo: "largo", ejemplo: "Aniversario del restaurante: sábado de la semana 3", ayuda: "Solo fechas tuyas y verificadas. La IA no añadirá feriados ni fechas comerciales de memoria." },
    { id: "diasPublica", label: "Días en que produces y en que publicas", tipo: "texto", ejemplo: "Se produce el lunes; se publica martes, jueves, viernes y sábado; nunca domingo", requerido: true },
    { id: "redes", label: "Redes", tipo: "texto", ejemplo: "Instagram y Facebook", requerido: true },
    { id: "noPublicar", label: "Lo que no vas a publicar (opcional)", tipo: "texto", ejemplo: "Precios, fotos de clientes sin permiso, promesas de resultados", ayuda: "Límites que las ideas deben respetar." },
  ],
  usaPerfil: ["nombre", "rubro", "clientes", "tono", "canales"],

  calculadora: {
    entradas: [
      { id: "horasSemana", label: "Horas por semana para las redes", unidad: "numero", ejemplo: "3", ayuda: "Las que de verdad puedes dedicar, no las que te gustaría." },
      { id: "reserva", label: "Reserva para imprevistos", unidad: "porcentaje", ejemplo: "20", requerido: false, porDefecto: 20, max: 90, ayuda: "Recomendación práctica: 20 %. Un calendario que ocupa todo tu tiempo se rompe con el primer imprevisto." },
      { id: "minProduccion", label: "Minutos de producción por publicación", unidad: "numero", ejemplo: "25", ayuda: "Mídelos en tus últimas publicaciones: son tuyos y la IA no puede conocerlos." },
      { id: "minPublicacion", label: "Minutos para publicar cada una", unidad: "numero", ejemplo: "5" },
      { id: "publicacionesSemana", label: "Publicaciones por semana", unidad: "entero", ejemplo: "4", min: 1 },
    ],
    salidas: [
      { id: "minutosUsables", etiqueta: "Minutos usables por semana", formula: "horasSemana * 60 * (1 - reserva)", formato: "numero", decimales: 0 },
      { id: "minutosPieza", etiqueta: "Minutos por publicación (producir y publicar)", formula: "minProduccion + minPublicacion", formato: "numero", decimales: 0 },
      { id: "piezasCaben", etiqueta: "Publicaciones que caben por semana", formula: "piso(minutosUsables / minutosPieza)", formato: "entero" },
      { id: "piezasSemana", etiqueta: "Publicaciones por semana que quieres", formula: "publicacionesSemana", formato: "entero" },
      { id: "minutosNecesarios", etiqueta: "Minutos que necesitas por semana", formula: "publicacionesSemana * minutosPieza", formato: "numero", decimales: 0 },
      { id: "holgura", etiqueta: "Minutos que sobran (o faltan) por semana", formula: "minutosUsables - minutosNecesarios", formato: "numero", decimales: 0 },
      { id: "cabe", etiqueta: "¿Cabe en tu tiempo?", formula: "minutosNecesarios <= minutosUsables", formato: "si-no" },
      { id: "piezasMes", etiqueta: "Publicaciones en las 4 semanas", formula: "publicacionesSemana * 4", formato: "entero" },
    ],
    casosDePrueba: [
      {
        nombre: "Mesa Larga (ficticio): 3 horas, 4 publicaciones por semana",
        entradas: { horasSemana: 3, reserva: 20, minProduccion: 25, minPublicacion: 5, publicacionesSemana: 4 },
        esperado: { minutosUsables: 144, minutosPieza: 30, piezasCaben: 4, piezasSemana: 4, minutosNecesarios: 120, holgura: 24, cabe: "Sí", piezasMes: 16 },
      },
      {
        nombre: "No cabe: 2 horas para 4 publicaciones",
        entradas: { horasSemana: 2, reserva: 20, minProduccion: 25, minPublicacion: 5, publicacionesSemana: 4 },
        esperado: { minutosUsables: 96, piezasCaben: 3, minutosNecesarios: 120, holgura: -24, cabe: "No" },
      },
      {
        nombre: "Justo: 1 hora, sin reserva, 3 publicaciones de 20 minutos",
        entradas: { horasSemana: 1, reserva: 0, minProduccion: 15, minPublicacion: 5, publicacionesSemana: 3 },
        esperado: { minutosUsables: 60, minutosPieza: 20, piezasCaben: 3, holgura: 0, cabe: "Sí" },
      },
      {
        nombre: "Sin indicar la reserva se aplica el 20 %",
        entradas: { horasSemana: 3, minProduccion: 25, minPublicacion: 5, publicacionesSemana: 4 },
        esperado: { minutosUsables: 144, cabe: "Sí" },
      },
    ],
  },

  tarea: `Arma mi plan de publicaciones del mes. Mis datos de arriba son la única fuente de hechos y los «Cálculos ya hechos» (cuántas publicaciones caben y cuántas quiero por semana) los hizo la página: no sumes minutos, no recalcules y no cambies esas cifras.

Objetivo del mes: {{objetivo}}. Redes: {{redes}}. Días de producción y de publicación: {{diasPublica}}. Lo que no voy a publicar: {{noPublicar}}. Fechas importantes mías: {{fechas}}.

Entrega, en este orden y con estos títulos:
1. BANCO DE 12 IDEAS: cada una con la idea en una frase, de qué parte de mi materia prima sale (una pregunta de clientes, un producto o un problema que mencioné) y la acción que empuja. Ninguna idea puede salir de un dato que yo no di.
2. CALENDARIO DE 4 SEMANAS: una tabla con las columnas fijas Semana | Día | Idea | Formato | Red. En cada semana pon exactamente la cantidad de «Publicaciones por semana» de los cálculos, solo en mis días de publicación y respetando que nunca publico los días que excluí. Mezcla los formatos y no concentres el mismo tipo de pieza.
3. PLAN DE PRODUCCIÓN POR LOTES: para cada semana, qué se produce en mi día de producción, en qué orden, en una sola sesión.
4. FECHAS PROPIAS: dónde caen mis fechas importantes en el calendario. No añadas feriados ni fechas comerciales que yo no haya dado.
5. RECICLAJE: una idea de la primera semana que podría reutilizarse en la semana 4 con otro formato u otro ángulo y los mismos datos.
6. FALTA: lo que necesitarías y no te di.

Reglas:
- No inventes datos del negocio (precios, horarios, opiniones, promociones). Si una idea necesita un dato que no está, escribe [FALTA: el dato].
- Los datos con vigencia (menús, precios, horarios) hay que actualizarlos antes de cada publicación: recuérdalo en el plan.
- Separa lo que sale de mis datos de lo que supones o sugieres.

Formato de salida: BANCO DE IDEAS, CALENDARIO, PLAN DE PRODUCCIÓN, FECHAS PROPIAS, RECICLAJE y FALTA.

Antes de responder, comprueba que cada semana tiene exactamente la cantidad de publicaciones de los cálculos, que ninguna cae en un día que excluí, que cada idea sale de mi materia prima y que no añadiste fechas que yo no di. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más ideas", prompt: "Dame cuatro ideas más para el banco, cada una ligada a una parte de mi materia prima." },
    { label: "Mover una pieza", prompt: "Mueve la publicación de la semana 2 al último día de publicación de esa semana sin cambiar la cantidad de piezas." },
    { label: "Reciclar", prompt: "Propón cómo reciclar tres piezas ya publicadas con otro formato y espera mínima, actualizando solo los datos con vigencia." },
    { label: "Revisar el calendario", prompt: "Comprueba que ninguna pieza cae en un día que excluí y que cada semana tiene la cantidad de publicaciones que pedí." },
  ],

  ejemplo: {
    negocio: "Restaurante Mesa Larga (ficticio), restaurante familiar; la dueña dedica tres horas por semana a las redes",
    datos: {
      "Tiempo semanal": "3 horas, con una reserva del 20 % para imprevistos",
      "Tiempo por publicación": "25 minutos de producción y 5 de publicación",
      "Publicaciones por semana": "4",
      Días: "Se produce el lunes; se publica martes, jueves, viernes y sábado; nunca domingo",
      "Fecha propia": "Aniversario del restaurante: sábado de la semana 3",
      Objetivo: "Que reserven mesa entre semana",
    },
    resultado: {
      "Minutos usables por semana": "144",
      "Publicaciones que caben": "4 (de 30 minutos cada una)",
      "Minutos que necesitas": "120, con 24 de holgura",
      "¿Cabe en tu tiempo?": "Sí",
      "Publicaciones en las 4 semanas": "16",
    },
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real»).
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris en el bloque 6). `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: el calendario de 4 semanas en tabla que devuelve la IA para Restaurante Mesa Larga (ficticio), con la capacidad de tiempo calculada por la página.",
    },
    {
      archivo: "prueba-02.webp",
      etiqueta: "Prueba real",
      muestra: "Mismo chat: el banco de ideas y el plan para producir por lotes.",
    },
  ],

  checklist: [
    "Mis tiempos por publicación son los que medí, no una estimación.",
    "La suma de cada semana cabe en mis minutos usables (la calculadora lo dice) y dejé una reserva.",
    "Cada idea sale de algo real de mi negocio y las fechas propias están en el día correcto.",
    "Comprobé en una fuente oficial cada feriado o fecha comercial que añadí yo, y actualizo menús, precios y horarios antes de publicar.",
    "Tengo permiso para las fotos, marcas y textos que voy a usar y revisé las reglas de las plataformas.",
  ],

  porQueFunciona: [
    {
      titulo: "Primero la capacidad, después el calendario",
      texto: "La **capacidad** es el tiempo que de verdad puedes dedicar por semana, con una reserva para imprevistos. La página calcula cuántas publicaciones caben y le pasa esa cifra a la IA, que reparte exactamente esa cantidad: un calendario que no cabe se abandona.",
    },
    {
      titulo: "Tus tiempos, no los de la IA",
      texto: "Cada formato cuesta un tiempo de producción y otro de publicación, y solo tú los conoces. Con tus tiempos medidos, las sumas dejan de ser una estimación optimista.",
    },
    {
      titulo: "Las ideas salen de tu materia prima",
      texto: "Las ideas genéricas se pueden producir sin saber nada de ti. Las tuyas salen de lo que te preguntan tus clientes, de los problemas que resuelves y de tus productos: por eso el prompt exige señalar de qué parte sale cada una.",
    },
    {
      titulo: "Producción por lotes y reciclaje",
      texto: "Producir todas las piezas de la semana en una sola sesión suele costar menos que hacerlas una a una y deja libres los demás días. Reciclar una pieza con otro formato u otro ángulo y los mismos datos ahorra tiempo sin que parezca repetida.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Mesa Larga (ficticio): objetivo «reserven mesa entre semana». Ideas del menú del día, del postre de la casa y de la pregunta «¿hay mesa para grupos?». Cada semana, cuatro piezas de 30 minutos.",
      consejo: "Los datos con vigencia (el menú del día) se actualizan antes de publicar: pon un recordatorio en el día de producción.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Patitas (ficticia, tienda de mascotas): objetivo «más mensajes por consultas», dos horas por semana. Ideas que salen de preguntas reales: tamaño de collares, cómo presentar un rascador a un gato, qué necesita un cachorro.",
      consejo: "Con dos horas, tres piezas de 30 minutos ya es el máximo con reserva: no prometas cinco.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio de uñas Brillo (ficticio): objetivo «llenar la agenda de martes y miércoles», una hora y media por semana. Piezas cortas: antes y después con permiso de la clienta, un consejo de cuidado y un aviso de cupos.",
      consejo: "Publica solo las fotos que tengas permiso de mostrar: aclara el permiso en «lo que no vas a publicar».",
    },
  ],

  errores: [
    {
      error: "Planear sin medir tus tiempos",
      solucion: "Un tiempo por pieza inventado hace que todas las sumas salgan bien y ninguna semana se cumpla. Cronometra tus últimas publicaciones antes de planear.",
    },
    {
      error: "Llenar el cien por ciento de tu tiempo",
      solucion: "Sin reserva, el primer imprevisto rompe la semana y el calendario se abandona. Deja una reserva antes de calcular tus minutos usables.",
    },
    {
      error: "Pedir ideas sin darle nada de tu negocio",
      solucion: "La IA rellena con lo más habitual del rubro, y esas ideas no distinguen a tu negocio de otros. Escribe tu materia prima primero.",
    },
    {
      error: "Dar por buena una fecha que no verificaste",
      solucion: "Una fecha comercial o un feriado equivocado se ve tan seguro como uno correcto. Aporta tus fechas y comprueba cada una en una fuente oficial de tu país.",
    },
  ],

  faq: [
    { p: "¿Cuántas publicaciones por semana debo planear?", r: "Las que caben en tus minutos usables. No hay una cifra universal: depende de tu tiempo y de tus formatos, y por eso la calculadora usa los tuyos." },
    { p: "¿Y si mis tiempos por formato cambian?", r: "Actualízalos en la calculadora y copia el prompt otra vez. Con el uso, tus tiempos reales suelen acercarse y el calendario se vuelve más fiable." },
    { p: "¿Puedo pedirle a la IA las fechas comerciales y los feriados?", r: "Puede equivocarse, y varían según el país y el año. Es más seguro que las aportes tú, comprobadas en una fuente oficial, y que el prompt las respete." },
    { p: "¿Cada cuánto rehago el calendario?", r: "Una vez al mes, con un banco de ideas renovado. Si te atrasas antes, traslada lo pendiente en lugar de rehacerlo entero." },
    { p: "¿Cuántas ideas debo pedir?", r: "Entre 8 y 12. Cuantas más pides, más se parecen y menos las revisas con cuidado; si necesitas más, añade materia prima antes de volver a pedir." },
    { p: "¿La herramienta programa o publica por mí?", r: "No: reparte las piezas en semanas. Publicarlas y programarlas depende de tu plataforma." },
  ],

  relacionadas: ["marketing/crear-publicaciones-para-redes-con-ia", "marketing/crear-anuncios-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: materia prima, pilares, rúbrica y reciclaje",
    parrafos: [
      "**La materia prima.** Es lo que ya sabes de tu negocio, escrito en seis listas: las preguntas reales de tus clientes, los problemas que resuelves, tus productos o servicios y su uso, la temporada y las fechas, lo que no vas a publicar y tu tiempo y tus formatos. Si no sabes una lista todavía, escribe «no lo sé»: el prompt la marcará como falta en lugar de rellenarla. Esta página la resume en «Productos o temas del mes y lo que te preguntan tus clientes».",
      "**Los pilares de contenido.** Un pilar es un tema grande sobre el que publicas a menudo. Sale de los problemas de tus clientes, no de lo que a ti te gustaría decir; tres o cuatro suelen bastar. Para una tienda de mascotas ficticia, por ejemplo: elegir bien, resolver problemas y preparar la llegada de una mascota.",
      "**El caso completo.** Mesa Larga (ficticio) dedica tres horas por semana, con una reserva del 20 %: 144 minutos usables. Sus tiempos medidos por formato son: imagen con texto, 25 de producción más 5 de publicación (30); serie de imágenes, 50 más 5 (55); mensaje breve, 10 más 5 (15). Produce el lunes y publica martes, jueves, viernes y sábado; nunca domingo. Su fecha propia es el aniversario, el sábado de la semana 3.",
      "**Rúbrica de cinco criterios** para revisar el calendario (0, 1 o 2 puntos cada uno): cabe en mi tiempo; sale de mi banco; respeta mis días y mis fechas; no repite el mismo tipo de pieza; se produce en un bloque.",
      "**Reciclaje.** Volver a usar una pieza ya publicada con otro formato u otro ángulo y los mismos datos tiene su propio tiempo y una espera mínima de unas semanas para que no parezca repetida. Si la pieza tiene datos con vigencia (un menú, un precio), actualízalos antes de reutilizarla.",
      "**Lo que este método no hace.** No conoce tu ritmo, puede colocar mal una fecha (por eso se comprueban), no programa ni publica, no sabe cuándo rinde mejor cada pieza (eso sale de tus estadísticas) y no sustituye las normas de publicidad.",
    ],
  },
});
