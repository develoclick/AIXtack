import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /marketing/crear-anuncios-con-ia (Generador). Fuente: la guía larga content/guias/marketing/crear-anuncios-con-ia
 * y sus capturas reales (docs/crear-anuncios/transcripciones.md). Caso: Ferretería Casa y Clavo (ficticia).
 *
 * Las 5 capturas son REALES, sin editar, pero se hicieron con los prompts encadenados de la versión anterior
 * (la ficha completa como una sola variable), no con el prompt único de esta página. Por eso se muestran con esa
 * aclaración y `publicado` sigue en `false` hasta que haya una prueba del prompt nuevo (IA y fecha).
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "crear-anuncios-con-ia",
    area: "marketing",
    tipo: "generador",
    titulo: "Crea un anuncio para tu negocio en 5 minutos",
    descripcion: "Llena los datos de tu oferta y copia un prompt que escribe tres versiones de anuncio, una para WhatsApp y la lista de afirmaciones que debes verificar.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA y fecha de la prueba del prompt único de esta página (las capturas actuales son del método anterior; se desconoce la IA y la fecha).
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/marketing/crear-anuncios-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Hazme un anuncio para mi ferretería.» La IA no sabe qué ofreces ni con qué condiciones y rellena con lo habitual: «¡Las mejores herramientas al mejor precio! ¡Ven ya!» (ejemplo ilustrativo). Son superlativos y prisa que nadie comprobó.",
    despues: "**Tres versiones** con un enfoque distinto cada una, escritas solo con tus datos; una versión corta para **WhatsApp**; y una **lista de afirmaciones** para que compruebes tú cada frase antes de publicar.",
  },

  campos: [
    { id: "queAnuncias", label: "¿Qué anuncias?", tipo: "texto", ejemplo: "Ferretería Casa y Clavo: herramientas manuales (martillos, destornilladores, alicates y llaves)", requerido: true, ayuda: "El negocio y lo que vendes, para que el anuncio se entienda sin conocerte." },
    { id: "oferta", label: "Precio u oferta", tipo: "texto", ejemplo: "20 % de descuento en herramientas manuales", requerido: true, ayuda: "Escríbela completa, con sus cifras exactas." },
    { id: "beneficio", label: "Beneficio principal (que puedas comprobar)", tipo: "largo", ejemplo: "Encuentras herramientas manuales de varias marcas en un solo local y te asesoramos para elegir la adecuada.", requerido: true, ayuda: "Lo que gana el cliente y tú cumples. Sin promesas de resultado." },
    { id: "vigencia", label: "Vigencia y condiciones", tipo: "largo", ejemplo: "Solo el sábado 10 de octubre, de 9:00 a 14:00, en el local. Hasta agotar stock por producto. No acumulable con otras ofertas.", requerido: true, ayuda: "Fechas, horario, cantidad y exclusiones." },
    { id: "respaldo", label: "Un respaldo real (opcional)", tipo: "texto", ejemplo: "12 años atendiendo en el mismo local", ayuda: "Solo si es cierto y lo puedes mostrar. Si no tienes, déjalo vacío." },
    { id: "canal", label: "Canal principal", tipo: "seleccion", ejemplo: "Instagram", opciones: ["Instagram", "Facebook", "WhatsApp"], requerido: true },
    { id: "accion", label: "¿Qué quieres que haga el cliente?", tipo: "texto", ejemplo: "Pasar por el local el sábado. Calle Los Pinos con calle 5", requerido: true, ayuda: "Una sola acción y el dato para hacerla." },
  ],
  usaPerfil: ["nombre", "clientes", "tono"],
  calculadora: null,

  tarea: `Escribe el anuncio de mi negocio. Los datos de arriba son la única fuente de hechos. Quien lo vea todavía no me conoce y no tiene ningún otro contexto.

Entrega:
1. TRES VERSIONES del anuncio para {{canal}}, cada una con un enfoque distinto: (a) el beneficio para el cliente; (b) la oferta y su fecha; (c) una pregunta al público que mis datos respalden.
2. UNA VERSIÓN PARA WHATSAPP: un mensaje directo corto, para personas que aceptaron recibir mensajes, con el marcador [NOMBRE] donde iría el nombre.
3. LISTA DE AFIRMACIONES a verificar: una fila por cada frase del anuncio con las columnas Afirmación | Tipo | ¿Está en mis datos? | Qué debe comprobar la persona.

Reglas:
- Copia las cifras, fechas, horarios y condiciones tal como están en mis datos; no las resumas ni las redondees.
- El texto debe decir qué es el negocio, qué ofrece y dónde está.
- Pide una sola acción, la que indiqué.
- No prometas resultados, no uses superlativos ni comparaciones con otros negocios y no crees prisa o escasez que mis datos no indiquen.
- Si no conoces los límites de texto del canal, no los supongas: dilo.
- Si falta la oferta, sus condiciones o la acción, no escribas el anuncio: dime qué falta.

Formato de cada versión, con estos títulos y en este orden: Gancho (una frase), Texto (completo, listo para copiar), Llamada a la acción (una frase), Datos míos usados, Supuestos que tuviste que hacer (o «ninguno»). Al final, una lista FALTA con cada [FALTA].

Antes de responder, comprueba que cada dato de cada versión está en mis datos, que las cifras, fechas y condiciones coinciden, que hay una sola acción y que no hay promesas ni superlativos. Corrige o elimina lo que no cumpla.`,

  mejoras: [
    { label: "Reforzar la urgencia real", prompt: "Refuerza solo la urgencia usando la fecha y el horario de mis datos; no añadas ningún dato nuevo." },
    { label: "Probar dos ganchos", prompt: "Prepara la versión B cambiando solo el gancho y dime qué señal debo observar para compararlas con justicia." },
    { label: "Solo lo verificable", prompt: "Subraya cada frase del anuncio que no esté en mis datos y propón quitarla." },
    { label: "Más corto", prompt: "Hazlo más corto sin quitar ninguna condición de la oferta." },
  ],

  ejemplo: {
    negocio: "Ferretería Casa y Clavo (ficticia), ferretería de barrio con tres personas en el mostrador",
    capturas: [
      {
        src: "/img/marketing/crear-anuncios-con-ia/prueba-prompt-01.webp",
        alt: "Captura de la respuesta de un asistente de IA con dos anuncios para la Ferretería Casa y Clavo en una tabla: gancho, texto, llamada a la acción, datos usados y supuestos.",
        etiqueta: "Prueba real",
        ancho: 889,
        alto: 624,
        leyenda: "Prueba real del método anterior, con la misma información: la primera respuesta, sin editar.",
      },
      {
        src: "/img/marketing/crear-anuncios-con-ia/prueba-prompt-05.webp",
        alt: "Captura de la revisión de un anuncio por un asistente de IA: una tabla con cada afirmación, su tipo, si está en la ficha y qué debe comprobar la persona, y un veredicto.",
        etiqueta: "Prueba real",
        ancho: 562,
        alto: 759,
        leyenda: "Prueba real del método anterior: la primera revisión de las afirmaciones detectó una condición que faltaba.",
      },
    ],
    queCorregi: [
      "El anuncio decía «Este sábado 10 de octubre» sin aclarar que la oferta es solo ese día: lo cambié por «Solo el sábado 10 de octubre».",
      "El mensaje directo hablaba de una «jornada», una palabra que no está en mis datos: la cambié por «oferta».",
      "La pregunta de la versión B no tenía respaldo en mis datos: la sustituí por «¿Haces arreglos en casa?», que sí sale de mi público.",
    ],
  },

  // Capturas por subir: solo se ven con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris en el bloque 6). `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo con el prompt único de esta página y los datos de Casa y Clavo (ficticia): las tres versiones del anuncio, la versión para WhatsApp y la lista de afirmaciones que hay que verificar. Sustituye a las capturas del método anterior.",
    },
  ],

  checklist: [
    "Los precios, fechas, horarios y condiciones del anuncio son los que fijé yo, no los que sugirió la IA.",
    "El stock, el horario y el personal que anuncio existen ese día.",
    "Ninguna frase promete un resultado, compara con otros ni crea una prisa inventada.",
    "Tengo permiso para los nombres, marcas, fotos y textos ajenos que aparezcan.",
    "Quien responde en el canal conoce la oferta y sus condiciones.",
  ],

  porQueFunciona: [
    {
      titulo: "El anuncio llega a quien no te conoce",
      texto: "Nadie te preguntará qué eres ni dónde estás. Por eso el prompt exige que el texto diga qué es el negocio, qué ofrece y dónde queda, en lugar de escribirlo como si te conocieran.",
    },
    {
      titulo: "La oferta se cuenta completa",
      texto: "Una oferta recortada parece otra distinta. El prompt copia precio, fechas, horario, cantidad y exclusiones tal como los escribiste, sin resumirlos ni redondearlos.",
    },
    {
      titulo: "Beneficio sí, promesa no",
      texto: "Un **beneficio** es lo que el cliente gana y tú cumples; una **promesa** es un resultado que no controlas. Un respaldo (por ejemplo, los años de trayectoria) solo entra si lo diste tú: si no, se omite.",
    },
    {
      titulo: "La lista de afirmaciones cierra el círculo",
      texto: "La IA puede colar un dato que no diste. Por eso cada frase queda en una tabla con su tipo y lo que debes comprobar tú: ahí se encuentran los errores antes de publicar.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia): el gancho es el menú del día a $5; debajo van los tres datos comprobables (sopa, plato de fondo y bebida, de lunes a viernes de 12:00 a 15:00), la condición «hasta agotar existencias» y una sola acción: reservar por WhatsApp.",
      consejo: "Si el horario limita la oferta, va en la misma frase que el precio: es lo primero que decide si la persona viene.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Boutique Aldea (ficticia): el gancho es el 2 por $15 en camisas; la vigencia (solo este sábado, de 10:00 a 18:00) y la condición (no acumulable con otras ofertas) van a la vista, y la acción es pasar por la tienda.",
      consejo: "Aclara las exclusiones en el propio anuncio: «no acumulable» o «hasta agotar stock» evitan reclamos en el mostrador.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio de uñas Brillo (ficticio): el gancho es la manicura con diseño a $12 los martes y miércoles; se aclara que es con cita y con cupos limitados por día, y la acción es reservar por WhatsApp.",
      consejo: "Si hay cupos, di cuántos reales tienes. «Últimos cupos» sin que sea cierto desgasta la confianza.",
    },
  ],

  errores: [
    {
      error: "Pedir «un anuncio» sin datos",
      solucion: "La IA rellena con lo habitual: superlativos, prisa y ninguna condición. Completa los campos antes de copiar el prompt.",
    },
    {
      error: "Escribirlo como si te conocieran",
      solucion: "Quien lo ve no sabe qué eres ni dónde estás, y no hay a quién preguntar. Pide que diga qué es el negocio, qué ofrece y dónde está.",
    },
    {
      error: "Pedir «más persuasivo» sin decir cómo",
      solucion: "Es la forma más rápida de que aparezcan «últimas unidades» o «solo hoy» sin ser cierto. Elige una palanca y exige el dato tuyo que la respalda.",
    },
    {
      error: "Probar dos anuncios que cambian varias cosas",
      solucion: "Aunque uno atraiga más gente, no sabrás si fue el gancho, la imagen o la hora. Cambia un solo elemento y publica ambos a la vez.",
    },
  ],

  faq: [
    { p: "¿Sirve para un anuncio pagado y para uno gratuito?", r: "El texto sirve para ambos. La configuración de un anuncio pagado (público, presupuesto, duración) se hace en la plataforma donde publiques y esta herramienta no la cubre." },
    { p: "¿Qué hago si no tengo ningún respaldo?", r: "Déjalo vacío. Un anuncio con la oferta completa y las condiciones claras funciona sin él, y es preferible a inventar uno." },
    { p: "¿Puedo pedirle que compare mi oferta con la de otros?", r: "No conviene: una comparación exige datos ajenos que la IA no tiene y que tendrías que respaldar. Habla de lo que ofreces tú." },
    { p: "¿Cuántas versiones debo probar?", r: "Dos, cambiando una sola cosa. Con más versiones y pocas personas, ninguna diferencia es fiable." },
    { p: "¿A quién puedo mandarle el mensaje de WhatsApp?", r: "Solo a personas que aceptaron recibir mensajes tuyos. El marcador [NOMBRE] es para que lo cambies por el nombre de cada persona." },
    { p: "¿Debo mirar las políticas de anuncios antes de pagar por uno?", r: "Sí. Las políticas de los anuncios pagados (descuentos, imágenes, mensajes) dependen de la plataforma y del país, y esta herramienta no las cubre. Si no indicas los límites de texto del canal, el prompt te lo dirá en lugar de suponerlos." },
  ],

  relacionadas: ["marketing/crear-promociones-con-ia", "marketing/crear-afiches-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: ficha, rúbrica, prueba A/B y pruebas del método anterior",
    parrafos: [
      "**Ficha de siete campos.** La versión anterior de esta guía trabajaba con una ficha de siete campos: negocio y oferta; condiciones; público y zona; beneficio verificable; respaldo real; acción y ubicación; tono y límites. Esta página los reparte entre el formulario y tu perfil «Mi negocio». Lo que no dijiste no existe para la IA: si falta, queda como [FALTA].",
      "**Rúbrica de seis criterios** para puntuar cada versión con 0, 1 o 2 puntos (máximo 12): se entiende sin conocerte; oferta completa; beneficio sin promesa; afirmaciones respaldadas; una acción clara; cabe en su canal. Para el último, el texto sobre una imagen se limita a 8 palabras (regla propia de esta herramienta); en los demás canales se contrasta con los límites de la plataforma y, si no los conoces, se marca «no conocidos» en vez de suponerlos.",
      "**Prueba A/B.** Compara dos versiones que se diferencian en una sola cosa, por ejemplo el gancho. Publícalas a la vez, en el mismo lugar, y registra qué versión dice haber visto cada persona que llega. Si cambian varias cosas, o nadie recuerda qué versión vio, no se puede concluir nada.",
      "**Hoja de afirmaciones.** Para cada frase del anuncio anota su tipo (dato de la oferta, cualidad, respaldo, acción), si está en tus datos y qué debes comprobar tú. En la prueba real de la versión anterior, la primera revisión marcó los cuatro anuncios como «no publicar»: faltaba aclarar que la oferta era solo ese día, el mensaje directo usaba una palabra que no estaba en la ficha y la pregunta de la versión B no tenía respaldo.",
      "**Capturas del método anterior.** Las imágenes que siguen son chats reales, sin retocar, hechos con la versión encadenada de esta herramienta y con los datos de Casa y Clavo (ficticia); no muestran la respuesta a este prompt único, que se probará aparte.",
      "**Lo que este método no hace.** No conoce tu stock ni tus resultados, no configura la campaña, no decide la oferta y no sustituye las normas de publicidad de tu país.",
    ],
    capturas: [
      {
        src: "/img/marketing/crear-anuncios-con-ia/prueba-prompt-02.webp",
        alt: "Captura de un asistente de IA que refuerza un anuncio: la versión reforzada, una tabla de cambios con la frase original, la nueva y el dato que la respalda, y lo que no cambió.",
        etiqueta: "Prueba real",
        ancho: 526,
        alto: 817,
        leyenda: "Prueba real, método anterior: el refuerzo de una sola palanca, con el dato que respalda cada cambio.",
      },
      {
        src: "/img/marketing/crear-anuncios-con-ia/prueba-prompt-03.webp",
        alt: "Captura de un asistente de IA que adapta un anuncio a tres canales: una red social, el texto sobre la imagen y un mensaje directo, con lo que cambió y lo que no cabe.",
        etiqueta: "Prueba real",
        ancho: 1066,
        alto: 442,
        leyenda: "Prueba real, método anterior: el mismo anuncio adaptado a tres canales.",
      },
      {
        src: "/img/marketing/crear-anuncios-con-ia/prueba-prompt-04.webp",
        alt: "Captura de un asistente de IA que prepara una prueba A/B: dos ganchos, la hipótesis, la señal a observar y cómo comparar con justicia.",
        etiqueta: "Prueba real",
        ancho: 1134,
        alto: 741,
        leyenda: "Prueba real, método anterior: la versión B para probar, cambiando solo el gancho.",
      },
    ],
  },
});
