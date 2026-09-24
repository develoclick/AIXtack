import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /negocio/organizar-tareas-con-ia (Kit, fusión de organizar-tareas-del-negocio y sistema-diario-de-trabajo). Fuentes: las
 * dos guías largas (matriz de prioridad, capacidad, plan de la semana; rutina de apertura y cierre, nota de traspaso).
 * Caso: Lavandería Brisa (ficticia).
 *
 * La página calcula cuánto tiempo libre tienes y cuántas tareas caben (principio 9); la IA propone la prioridad de cada
 * tarea (una propuesta que tú decides) y reparte solo lo que cabe. Sin pruebas reales todavía: `publicado` en `false`.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "organizar-tareas-con-ia",
    area: "negocio",
    tipo: "kit",
    titulo: "Ordena tus pendientes y arma tu plan de la semana",
    descripcion: "Pega tus pendientes y calcula cuántos caben en tu semana; el prompt propone prioridades, el plan por día, qué delegar y una rutina diaria de 15 minutos.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/negocio/organizar-tareas-con-ia/og.webp",
  },

  antesDespues: {
    antes: "«Organízame estos pendientes por prioridad y hazme el plan de la semana.» La IA no sabe qué pierdes si algo no se hace, cuántas horas tienes ni qué fechas son firmes: ordena con sus criterios y arma el plan con seguridad, aunque puede equivocarse al sumar.",
    despues: "La página calcula **cuánto tiempo libre tienes y cuántas tareas caben**; la IA propone la **prioridad** de cada pendiente citando tu texto, reparte **solo lo que cabe** en el plan de la semana, sugiere **qué delegar** y arma una **rutina diaria de 15 minutos**.",
  },

  campos: [
    { id: "pendientes", label: "Tus pendientes (pégalos tal como salieron, aunque estén desordenados)", tipo: "largo", ejemplo: "Pagar la factura de la luz, vence el 10\nArreglar la lavadora 3, que hace ruido\nResponder la reseña de una estrella\nPedir detergente al proveedor\nActualizar los precios del cartel\nPreguntar por un seguro del local\nHacer el inventario de bolsas\nPublicar el horario de feriados", requerido: true, ayuda: "Una tarea por línea. Sin datos de clientes ni datos de pago." },
    { id: "fechas", label: "Fechas límite que ya tienen fecha (opcional)", tipo: "largo", ejemplo: "La factura de la luz vence el 10. El horario de feriados debe estar publicado antes del feriado del día 20.", ayuda: "Solo las firmes. Lo que no tenga fecha, déjalo fuera." },
    { id: "quienAyuda", label: "Quién más puede ayudar y en qué (opcional)", tipo: "largo", ejemplo: "Luis (hermano): compras y arreglos, dos días por semana. Marta (empleada): atención y limpieza, todos los días.", ayuda: "Solo lo que cada persona puede hacer de verdad." },
    { id: "minutosSueltos", label: "Tareas cuyo tiempo no conoces (opcional)", tipo: "texto", ejemplo: "Preguntar por un seguro del local; actualizar los precios del cartel", ayuda: "La IA no las estimará: quedarán fuera del plan hasta que midas cuánto tardan." },
  ],
  usaPerfil: ["nombre", "rubro"],

  calculadora: {
    entradas: [
      { id: "minutosDia", label: "Minutos por día para pendientes", unidad: "entero", ejemplo: "45", ayuda: "Los que de verdad puedes dedicar, sin contar la atención normal del negocio." },
      { id: "diasSemana", label: "Días que trabajas en pendientes por semana", unidad: "entero", ejemplo: "5", min: 1, max: 7 },
      { id: "rutinaDia", label: "Minutos de rutina diaria (opcional)", unidad: "entero", ejemplo: "15", requerido: false, porDefecto: 15, ayuda: "Apertura y cierre del día. Lo que se repite se aparta primero." },
      { id: "tareasSemana", label: "Tareas que quieres hacer esta semana", unidad: "entero", ejemplo: "4" },
      { id: "minutosTarea", label: "Minutos promedio por tarea", unidad: "entero", ejemplo: "30", min: 1, ayuda: "Mídelos en tareas parecidas: son tuyos y la IA no puede conocerlos." },
    ],
    salidas: [
      { id: "minutosSemana", etiqueta: "Minutos totales de la semana para pendientes", formula: "minutosDia * diasSemana", formato: "entero" },
      { id: "minutosRutina", etiqueta: "Minutos de rutina diaria en la semana", formula: "rutinaDia * diasSemana", formato: "entero" },
      { id: "minutosLibres", etiqueta: "Minutos libres para tareas", formula: "minutosSemana - minutosRutina", formato: "entero" },
      { id: "tareasCaben", etiqueta: "Tareas que caben", formula: "piso(minutosLibres / minutosTarea)", formato: "entero" },
      { id: "minutosNecesarios", etiqueta: "Minutos que necesitan las tareas que quieres", formula: "tareasSemana * minutosTarea", formato: "entero" },
      { id: "holgura", etiqueta: "Minutos que sobran (o faltan)", formula: "minutosLibres - minutosNecesarios", formato: "entero" },
      { id: "caben", etiqueta: "¿Caben las tareas que quieres?", formula: "minutosNecesarios <= minutosLibres", formato: "si-no" },
      { id: "tareasDia", etiqueta: "Tareas por día de trabajo", formula: "tareasSemana / diasSemana", formato: "numero", decimales: 1 },
    ],
    casosDePrueba: [
      {
        nombre: "Ana (Lavandería Brisa, ficticia): 45 minutos al día",
        entradas: { minutosDia: 45, diasSemana: 5, rutinaDia: 15, tareasSemana: 4, minutosTarea: 30 },
        esperado: { minutosSemana: 225, minutosRutina: 75, minutosLibres: 150, tareasCaben: 5, minutosNecesarios: 120, holgura: 30, caben: "Sí", tareasDia: 0.8 },
      },
      {
        nombre: "No caben: 30 minutos al día para 6 tareas",
        entradas: { minutosDia: 30, diasSemana: 5, rutinaDia: 15, tareasSemana: 6, minutosTarea: 30 },
        esperado: { minutosLibres: 75, tareasCaben: 2, minutosNecesarios: 180, holgura: -105, caben: "No" },
      },
      {
        nombre: "Sin indicar la rutina se aparta la de 15 minutos",
        entradas: { minutosDia: 60, diasSemana: 5, tareasSemana: 3, minutosTarea: 60 },
        esperado: { minutosRutina: 75, minutosLibres: 225, tareasCaben: 3, holgura: 45, caben: "Sí" },
      },
      {
        nombre: "Sin rutina (0 minutos) y una semana de un solo día",
        entradas: { minutosDia: 90, diasSemana: 1, rutinaDia: 0, tareasSemana: 2, minutosTarea: 45 },
        esperado: { minutosSemana: 90, minutosRutina: 0, minutosLibres: 90, tareasCaben: 2, holgura: 0, caben: "Sí" },
      },
    ],
  },

  tarea: `Ordena mis pendientes y arma mi semana. Mis pendientes y mis datos de arriba son la única fuente, y los «Cálculos ya hechos» (minutos libres y cuántas tareas caben) los hizo la página: no sumes minutos, no recalcules y no cambies esas cifras.

Fechas límite que ya tienen fecha: {{fechas}}. Quién más puede ayudar: {{quienAyuda}}. Tareas cuyo tiempo no conozco: {{minutosSueltos}}.

Entrega, en este orden y con estos títulos:
1. TABLA DE PENDIENTES: una fila por tarea, con las columnas fijas N.º | Tarea | Categoría | Impacto (Alto, Medio o Bajo, justificado con mis palabras) | Fecha límite (solo la que yo di) | ¿Depende de otra tarea? | Quién. Impacto: Alto = si no se hace, pierdo dinero o un cliente o incumplo algo; Medio = una molestia o un retraso; Bajo = una mejora que puede esperar. El impacto es una propuesta: yo decido.
2. URGENTE E IMPORTANTE: separa las tareas en «urgente e importante», «importante, no urgente», «urgente, no importante» y «puede esperar», usando solo mis fechas y mis palabras. Si no hay fecha, no supongas urgencia.
3. PLAN DE LA SEMANA: reparte por día solo tantas tareas como indica «Tareas que caben» de los cálculos, empezando por las urgentes e importantes. Lo que no quepa va a «Para la próxima semana». No estimes minutos.
4. QUÉ DELEGAR: qué tareas puede hacer otra persona de mi lista de ayuda, y por qué.
5. RUTINA DIARIA DE 15 MINUTOS: apertura y cierre del día en pasos cortos, con lo que aparece en mis pendientes; nada nuevo.
6. FALTA: lo que necesitarías y no te di.

Reglas:
- Una tarea es una acción con un final claro. Si una tarea es demasiado grande, propón partirla en dos acciones, sin inventar minutos.
- No inventes fechas, minutos ni tareas nuevas; las que no tienen minutos quedan fuera del plan.
- Las tareas que se repiten se anotan una vez y su tiempo se aparta primero.
- No decides qué importa: propones, yo elijo.

Formato de salida: TABLA DE PENDIENTES, URGENTE E IMPORTANTE, PLAN DE LA SEMANA, QUÉ DELEGAR, RUTINA DIARIA y FALTA.

Antes de responder, comprueba que cada fila es una tarea mía, que no inventaste fechas ni minutos, que el plan tiene solo las tareas que caben según los cálculos y que cada impacto se justifica con mis palabras. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Partir una tarea", prompt: "Parte la tarea 2 en dos acciones con final claro, sin inventar minutos." },
    { label: "Otra distribución", prompt: "Reparte el plan de otra forma: las tareas más pesadas al inicio de la semana, sin cambiar la cantidad total." },
    { label: "Revisar el plan", prompt: "Comprueba que el plan solo tiene tantas tareas como caben según los cálculos y que ninguna cae después de su fecha límite." },
    { label: "Rutina más corta", prompt: "Reduce la rutina diaria a diez minutos conservando lo esencial del cierre del día." },
  ],

  ejemplo: {
    negocio: "Lavandería Brisa (ficticia), negocio familiar con tres personas y casi ninguna hora libre",
    resultado: {
      "Minutos libres para tareas": "150 (225 de la semana menos 75 de rutina)",
      "Tareas que caben": "5",
      "Minutos que necesitan las 4 tareas": "120, con 30 de holgura",
      "¿Caben?": "Sí",
    },
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real»).
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` (recuadro gris en el bloque 6); nunca en un build de producción. `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: las tareas priorizadas, el plan de la semana, lo que se puede delegar y la rutina diaria de 15 minutos para Lavandería Brisa (ficticia), con la capacidad ya calculada por la página.",
    },
  ],

  checklist: [
    "Cada fila de la tabla es una tarea que escribí; la IA no agregó ninguna.",
    "Las fechas son las mías; lo que no tenía fecha sigue sin fecha.",
    "Cada impacto «Alto» tiene detrás algo que se pierde o se incumple, escrito en mi texto.",
    "El plan tiene solo las tareas que caben según los cálculos y decidí yo qué entra en mi semana y qué se aplaza.",
    "Las dependencias están completas: ninguna tarea va antes de la que necesita.",
  ],

  porQueFunciona: [
    {
      titulo: "Una tarea es una acción con un final claro",
      texto: "Se puede tachar. Un objetivo grande («mejorar la contabilidad») se parte en tareas que alguien pueda terminar («reunir los recibos del mes»). Con tareas así, el plan de la semana se puede comprobar.",
    },
    {
      titulo: "La prioridad sale de una regla",
      texto: "Se cruzan qué se pierde si no se hace (impacto) y cuánto falta para su fecha (urgencia). La fecha la pones tú; la IA solo propone el impacto y cita tu texto, y la decisión final es tuya.",
    },
    {
      titulo: "Cabe lo que cabe",
      texto: "Cada persona tiene minutos limitados. La página calcula cuántas tareas caben en tu semana y la IA reparte solo esas: lo que no cabe se parte o se aplaza, no se comprime.",
    },
    {
      titulo: "Lo que se repite se reserva primero",
      texto: "Lo que vuelve cada día o cada semana se anota una vez y su tiempo se aparta antes de repartir las tareas. La rutina de 15 minutos de apertura y cierre es un hábito pequeño que se mantiene; uno grande se abandona.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia): pendientes como revisar la nevera, pedir a los proveedores, actualizar el menú y renovar la licencia. Fecha firme: la licencia vence el día 25. Capacidad: 60 minutos al día, cinco días.",
      consejo: "La renovación de un permiso es impacto alto aunque no sea urgente hoy: pon su fecha y deja que la regla la suba cuando toque.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Boutique Aldea (ficticia): pendientes como recibir mercadería, etiquetar, responder mensajes y actualizar precios. Fecha firme: llega un pedido el jueves. Capacidad: 45 minutos al día.",
      consejo: "Las tareas que dependen de otra («etiquetar» después de «recibir») se marcan en «¿Depende de otra tarea?» para que el plan respete el orden.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio Trazo (ficticio): pendientes como enviar dos facturas, ordenar archivos de un proyecto y preparar una propuesta. Fecha firme: una factura vence el viernes. Capacidad: 90 minutos al día, cuatro días.",
      consejo: "Si trabajas solo, pon una sola persona y no busques qué delegar: lo que importa es cuántas tareas caben en tus minutos.",
    },
    {
      rubro: "Taller o producción",
      ejemplo: "Cerámica Sol (ficticia), atendida por una sola persona: pendientes como fotografiar las piezas nuevas, empacar los pedidos de la semana y pedir esmalte al proveedor. La capacidad es la que ella mida en sus propias jornadas; las tareas sin tiempo conocido se quedan fuera hasta medirlas.",
      consejo: "Cuando trabajas con las manos, agrupa las tareas parecidas en un mismo bloque (todas las fotos juntas, todos los empaques juntos): cambiar de tarea a cada rato cuesta tiempo que la lista no muestra.",
    },
  ],

  errores: [
    {
      error: "Poner todo en «urgente»",
      solucion: "Sin regla, todo parece urgente y se hace lo que hace más ruido. Que la fecha decida la urgencia y el impacto, la prioridad.",
    },
    {
      error: "Dejar que la IA decida qué importa",
      solucion: "Ordena con criterios que tú no elegiste y no sabe qué pierde tu negocio. Que proponga el impacto citando tu texto; la decisión es tuya.",
    },
    {
      error: "Inventar los minutos que faltan",
      solucion: "Una estimación al azar descuadra el plan sin que se note. Deja la tarea sin minutos y mide cuánto tarda; entra al plan después.",
    },
    {
      error: "Dejar tareas que no caben en un día",
      solucion: "Una tarea de 60 minutos no cabe en un día de 45 y queda fuera cada semana. Pártela en dos acciones con final claro.",
    },
  ],

  faq: [
    { p: "¿Cuántos pendientes conviene tener en la lista?", r: "Todos los que existan: la lista sirve si está completa. Lo menos importante queda en «puede esperar» sin perderse de vista." },
    { p: "¿Qué hago si no sé cuánto tarda una tarea?", r: "Déjala sin minutos y anota cuánto tardó la primera vez. Hasta entonces no entra en el plan, que es mejor que una cifra inventada." },
    { p: "¿Sirve si trabajo solo?", r: "Sí. Usa tus minutos por día y no busques qué delegar; lo que cambia sobre todo es el plan de la semana." },
    { p: "¿Puedo pegar mi lista real en la IA?", r: "Puedes, pero quita antes los datos personales de clientes, como nombres o teléfonos, y los datos de pago. Las tareas se entienden sin ellos." },
    { p: "¿Cada cuánto actualizo el plan?", r: "Una vez por semana, por ejemplo el lunes: lo que tuviste que explicar de nuevo, lo que quedó pendiente varios días y lo que no usaste dicen qué cambiar." },
    { p: "¿La herramienta me recuerda las tareas?", r: "No es una aplicación: no avisa ni recuerda. El plan que obtienes lo llevas a tu agenda y lo actualizas tú." },
  ],

  relacionadas: ["negocio/documentar-procesos-con-ia", "marketing/calendario-de-contenido-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: la matriz de prioridad y la rutina diaria",
    parrafos: [
      "**La matriz de prioridad.** La versión anterior de esta guía cruzaba el impacto con la urgencia. Impacto alto con urgencia alta: esta semana. Alto con urgencia media o baja: programar con fecha. Medio con urgencia alta: esta semana; medio con media: programar con fecha; medio con baja: si sobra. Bajo con urgencia alta: si sobra; bajo con media o baja: aplazar. La urgencia era alta si la fecha estaba a 7 días o menos, media de 8 a 30 y baja con más de 30 días o sin fecha. Lo que se repite cada semana es «rutina» y no pasa por la matriz.",
      "**El caso completo.** Lavandería Brisa (ficticia) tiene 8 pendientes en este ejemplo y una capacidad de 495 minutos por semana entre las tres personas: Ana 225 (45 por día), Luis 120 (60 los martes y jueves) y Marta 150 (30 por día). Esta página se centra en una persona a la vez: calcula sus minutos libres y cuántas tareas caben.",
      "**La rutina diaria de 15 minutos.** Por la mañana, al abrir: leer la nota de ayer, mirar la agenda y elegir como máximo tres prioridades, cada una con un verbo. Al cerrar: anotar lo que quedó esperando algo o a alguien, lo que se decidió y lo que se aplaza. Un hábito pequeño gana a uno grande: un sistema que exige una hora se abandona al tercer día.",
      "**Rúbrica de seis criterios** para revisar la propuesta de la IA (0, 1 o 2 puntos cada uno): cada fila es una tarea tuya; no inventa fechas ni minutos; el impacto sale de tu texto; encuentra lo que depende de otra tarea; asigna solo lo que cada persona puede hacer; no decide por ti.",
      "**Lo que este método no hace.** El impacto es una propuesta (la IA no conoce tu negocio), la regla no mide todo (por ejemplo, el dinero disponible), los minutos son estimaciones y no es una aplicación: no avisa ni recuerda, lo actualizas tú cada lunes.",
      "**Cómo escribir un buen pendiente.** Un pendiente empieza con un verbo, tiene un solo objeto y un final que se pueda reconocer. «Ver lo del seguro» no se puede tachar; «pedir dos presupuestos de seguro para el local» sí. Si al leer una tarea no sabes cuál sería el primer gesto para empezarla, todavía no es una tarea: es un tema. Reescribe los temas como tareas antes de pegar la lista, porque la IA solo puede ordenar lo que está claro.",
      "**Cómo medir cuánto tardas.** Durante una semana anota, al terminar cada tarea, cuántos minutos tardó de verdad, con lo que incluye esperar, buscar y volver a empezar. Con esas notas calcula un promedio por tipo de tarea (gestiones, arreglos, mensajes, compras) y úsalo en la calculadora. Si una tarea tarda mucho más que el promedio, es candidata a partirse. Un tiempo medido vale más que uno estimado, y uno estimado vale más que ninguno anotado como certeza.",
      "**Qué hacer cuando las tareas no caben.** Tienes cuatro salidas y conviene recorrerlas en este orden: partir la tarea en acciones más pequeñas, aplazarla con una fecha, delegarla o eliminarla. Eliminar es una decisión válida: una tarea que lleva meses en la lista sin fecha y sin consecuencias probablemente no importa tanto como parecía. Lo que no conviene es apretar el plan hasta que quepa, porque un plan que solo funciona si nada sale mal no sirve.",
      "**Cómo delegar sin perder el control.** Delega una tarea completa con su final claro, no un pedazo suelto. Dile a la persona qué resultado esperas, para cuándo y cómo sabrás que terminó; deja por escrito lo que pueda decidir sola y lo que debe consultarte. Anota la tarea con la fecha en que la revisarás. La IA propone qué se puede delegar según lo que escribiste que cada persona puede hacer; si no escribiste nada, no lo supondrá.",
      "**Una revisión semanal de diez minutos.** El mismo día cada semana, marca lo que se hizo, mueve lo pendiente con una nueva fecha o decide que ya no hace falta, y anota cuántas tareas caben de verdad según cómo fue la semana anterior. Vuelve a usar la calculadora con esos números. Al cabo de un mes verás qué tipo de tareas siempre se atrasan, y ahí está lo que conviene cambiar: el tiempo dedicado, la persona o la tarea.",
      "**Aviso.** Las fechas límite de trámites, impuestos, permisos o pagos las fija una autoridad o un proveedor, no esta herramienta: confírmalas en la fuente oficial antes de anotarlas. Esta herramienta te ayuda a organizarte; no da asesoría legal, contable ni laboral.",
    ],
  },
});
