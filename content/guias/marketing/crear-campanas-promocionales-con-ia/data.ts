import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * marketing/crear-campanas-promocionales-con-ia
 *
 * Tipo: estrategia y planificación + comunicación. Todo el caso (la tienda Hilo y Botón, su liquidación, sus
 * fechas, su dirección y sus piezas) es FICTICIO. Las respuestas de la IA son EJEMPLOS GENERADOS: están
 * redactadas aplicando literalmente cada prompt a los datos del caso; no proceden de una conversación real ni de
 * una prueba del autor. No hay resultados de ventas: el plan de medición se escribe ANTES de lanzar y no inventa
 * ninguna cifra. Las pruebas reales viven en `evidence.pruebas`, que solo rellena el autor.
 * La guía enseña a mantener coherentes las piezas de una campaña; cada pieza se afina en su guía propia.
 *
 * Fuente única de verdad: la ficha (FICHA), las piezas (PIEZAS) y sus textos (TEXTO_PRIMERO, TEXTO_FINAL), los
 * problemas del primer resultado (PROBLEMAS), los criterios (CRITERIOS), los umbrales (RESULTADOS), los puntajes
 * (PUNTAJES) y los días abiertos se definen UNA vez; la matriz, la rúbrica, los prompts y las tablas los leen.
 */
const slot = guideSlots("marketing", "crear-campanas-promocionales-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const APARECE = {
  todas: "Todas las piezas",
  nuevo: "Piezas que llegan a público nuevo",
  afiche: "Afiche",
  guia: "Solo guía",
} as const;

const FICHA = [
  { id: "objetivo", campo: "Objetivo", pide: "Una sola cosa que quieres lograr.", valor: "Vender la mayor parte del stock de otoño-invierno antes de que llegue la colección nueva", aparece: APARECE.guia },
  { id: "publico", campo: "Público", pide: "A quién le hablas.", valor: "Personas de 25 a 45 años que viven o trabajan cerca de la tienda", aparece: APARECE.guia },
  { id: "oferta", campo: "Oferta", pide: "Qué ofreces y a qué productos, ya decidido.", valor: "30 % de descuento en abrigos, chaquetas y suéteres de otoño-invierno", aparece: APARECE.todas },
  { id: "vigencia", campo: "Vigencia", pide: "Primer y último día, con el día de la semana.", valor: "Del sábado 7 al viernes 20", aparece: APARECE.todas },
  { id: "condiciones", campo: "Condiciones", pide: "Cada límite de la oferta, por separado.", valor: "Solo prendas con etiqueta verde · Hasta agotar existencias · No acumulable con otras promociones", aparece: APARECE.nuevo },
  { id: "donde", campo: "Dónde comprar", pide: "Cada vía para comprar o reservar.", valor: "En la tienda (Calle de la Aguja 12) o reservando por WhatsApp", aparece: APARECE.todas },
  { id: "horario", campo: "Horario", pide: "Días y horas de atención.", valor: "Lunes a sábado, de 10 a 19 h; domingo cerrado", aparece: APARECE.afiche },
  { id: "palabra", campo: "Palabra clave", pide: "Una palabra que se dice al comprar, para contar.", valor: "OTOÑO", aparece: APARECE.todas },
  { id: "mensaje", campo: "Mensaje central", pide: "La idea común a todas las piezas, en una frase.", valor: "Tu abrigo de la temporada, con 30 % menos", aparece: APARECE.guia },
  { id: "decision", campo: "Qué decidiré al cerrar", pide: "Tu regla, escrita antes de empezar.", valor: "Si queda menos de la mitad de las prendas con etiqueta verde, repito la liquidación; si queda más, cambio el enfoque", aparece: APARECE.guia },
] as const;

type Aparece = (typeof FICHA)[number]["aparece"];

const PIEZAS = [
  { id: "anuncio", nombre: "Anuncio", canal: "Red social de pago", momento: "Lanzamiento · sábado 7", publico: "Público nuevo", nuevo: true },
  { id: "pub1", nombre: "Publicación 1", canal: "Red social", momento: "Lanzamiento · sábado 7", publico: "Seguidores", nuevo: false },
  { id: "afiche", nombre: "Afiche", canal: "Local", momento: "Todo el período, desde el sábado 7", publico: "Quien pasa por la tienda", nuevo: true },
  { id: "pub2", nombre: "Publicación 2", canal: "Red social", momento: "Última semana · sábado 14", publico: "Seguidores", nuevo: false },
  { id: "whatsapp", nombre: "Mensaje de WhatsApp", canal: "WhatsApp", momento: "Última semana · sábado 14", publico: "Clientes que ya escribieron y aceptaron recibir mensajes", nuevo: false },
] as const;
type Pieza = (typeof PIEZAS)[number];
type PiezaId = Pieza["id"];

const lleva = (campoId: string, p: Pieza): boolean => {
  const aparece: Aparece = FICHA.find((f) => f.id === campoId)!.aparece;
  if (aparece === APARECE.todas) return true;
  if (aparece === APARECE.nuevo) return p.nuevo;
  if (aparece === APARECE.afiche) return p.id === "afiche";
  return false;
};
const campoNombre = (id: string) => FICHA.find((f) => f.id === id)!.campo;
const camposDe = (p: Pieza) => FICHA.filter((f) => lleva(f.id, p)).map((f) => f.campo.toLowerCase()).join(", ");

const TEXTO_PRIMERO: Record<PiezaId, string> = {
  anuncio:
    "Tu abrigo de la temporada, con 30 % menos. En Hilo y Botón, abrigos, chaquetas y suéteres de otoño-invierno con 30 % de descuento del sábado 7 al viernes 20. Solo prendas con etiqueta verde, hasta agotar existencias. Pasa por Calle de la Aguja 12. Reserva por WhatsApp y di OTOÑO.",
  pub1:
    "Empezó la liquidación de otoño-invierno en Hilo y Botón: 30 % de descuento en los abrigos más lindos de la temporada, del sábado 7 al viernes 20. Te esperamos en Calle de la Aguja 12. Si prefieres, reserva por WhatsApp. Di OTOÑO al comprar o al escribirnos.",
  afiche:
    "30 % en abrigos, chaquetas y suéteres / Liquidación de otoño-invierno · del sábado 7 al viernes 20 / Solo prendas con etiqueta verde · Hasta agotar existencias · No acumulable con otras promociones / Calle de la Aguja 12 · Lunes a sábado, de 10 a 19 h · Reserva por WhatsApp / Di OTOÑO al comprar",
  pub2:
    "Última semana de liquidación. Hasta el viernes 20, abrigos, chaquetas y suéteres de otoño-invierno con 30 % de descuento. Estamos en Calle de la Aguja 12. También reservamos por WhatsApp. Di OTOÑO al comprar o al escribirnos.",
  whatsapp:
    "Hola, te escribimos desde Hilo y Botón. Empieza nuestra liquidación de otoño-invierno: 30 % de descuento en abrigos, chaquetas y suéteres hasta el viernes 20. Puedes venir a Calle de la Aguja 12 o reservar respondiendo este mensaje con la palabra OTOÑO.",
};
const piezaPorId = (id: PiezaId) => PIEZAS.find((p) => p.id === id)!;

const FILAS_EXTRA = [
  { id: "respaldo", nombre: "Sin afirmaciones sin respaldo" },
  { id: "momento", nombre: "Momento y papel" },
] as const;

/** Lo que el contraste encuentra en el primer resultado y lo que el ajuste corrige. */
const PROBLEMAS: { pieza: PiezaId; fila: string; nota: string; antes: string; despues: string; motivo: string }[] = [
  {
    pieza: "anuncio",
    fila: "condiciones",
    nota: "falta «no acumulable con otras promociones»",
    antes: "hasta agotar existencias",
    despues: "hasta agotar existencias; no acumulable con otras promociones",
    motivo: "La ficha asigna las condiciones a las piezas para público nuevo.",
  },
  {
    pieza: "pub1",
    fila: "respaldo",
    nota: "«los abrigos más lindos de la temporada»",
    antes: "los abrigos más lindos de la temporada",
    despues: "los abrigos de la temporada",
    motivo: "La ficha no respalda la valoración «más lindos».",
  },
  {
    pieza: "whatsapp",
    fila: "momento",
    nota: "dice «Empieza» y sale el sábado 14",
    antes: "Empieza nuestra liquidación de otoño-invierno",
    despues: "Última semana de nuestra liquidación de otoño-invierno",
    motivo: "Sale el sábado 14: la liquidación ya empezó el sábado 7.",
  },
];

const celda = (filaId: string, p: Pieza, aplica: boolean, problemas: typeof PROBLEMAS) => {
  if (!aplica) return "—";
  const pr = problemas.find((x) => x.pieza === p.id && x.fila === filaId);
  return pr ? `✗ ${pr.nota}` : "✓";
};
const matriz = (problemas: typeof PROBLEMAS) => [
  ...FICHA.filter((f) => f.aparece !== APARECE.guia).map((f) => [f.campo, ...PIEZAS.map((p) => celda(f.id, p, lleva(f.id, p), problemas))]),
  ...FILAS_EXTRA.map((f) => [f.nombre, ...PIEZAS.map((p) => celda(f.id, p, true, problemas))]),
];

const CRITERIOS = [
  { id: "datos", label: "Mismos datos", detail: "Cada pieza lleva los campos que la ficha le asigna, parte por parte y sin cambios." },
  { id: "respaldo", label: "Solo lo que la ficha respalda", detail: "Ninguna pieza afirma, compara ni promete algo que la ficha no diga." },
  { id: "rol", label: "Cada pieza tiene su papel", detail: "Cada pieza responde a su momento y dice algo distinto de las demás." },
  { id: "publico", label: "Habla a quien le toca", detail: "No da por sabido lo que su público no sabe." },
  { id: "accion", label: "Una acción, y se puede contar", detail: "Pide una sola cosa, dice cómo hacerla e incluye la palabra clave." },
] as const;

const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Fallan varios criterios: revisa la ficha antes de volver a pedir las piezas." },
  { min: 6, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado, empezando por los datos." },
  { min: 9, label: "Lista para verificar", advice: "Cumple casi todo: pasa a tu verificación y a tu plan de medición." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (total: number) => [...RESULTADOS].reverse().find((r) => total >= r.min)!.label;

const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { datos: 1, respaldo: 1, rol: 1, publico: 2, accion: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

/* días abiertos: base de la comparación justa */
const DIAS_CAMPANA = 14;
const DOMINGOS = 2;
const CIERRE_INVENTARIO = 1;
const ABIERTOS_CAMPANA = DIAS_CAMPANA - DOMINGOS;
const ABIERTOS_ANTERIOR = DIAS_CAMPANA - DOMINGOS - CIERRE_INVENTARIO;
const CUENTA_DIAS =
  `Campaña: ${DIAS_CAMPANA} días − ${DOMINGOS} domingos cerrados = ${ABIERTOS_CAMPANA} días abiertos. ` +
  `Período anterior: ${DIAS_CAMPANA} días − ${DOMINGOS} domingos − ${CIERRE_INVENTARIO} día cerrado por inventario = ${ABIERTOS_ANTERIOR} días abiertos.`;

const LO_QUE_PUEDO_CONTAR =
  "Un cuaderno de ventas del local con la prenda vendida y si tiene etiqueta verde; el chat de WhatsApp; un conteo físico de las prendas con etiqueta verde";
const OTROS_EVENTOS = "Un día de los 14 anteriores la tienda cerró por inventario";
const TONO = "Cercano y claro, sin signos de exclamación repetidos";

const LISTA_CAMPOS = FICHA.map((f, i) => `${i + 1}. ${f.campo}: ${f.pide}`).join("\n");
const LISTA_CRITERIOS = CRITERIOS.map((c, i) => `${i + 1}. ${c.label}: ${c.detail}`).join("\n");
const PIEZA_EJEMPLO = `${PIEZAS[0].nombre} · ${PIEZAS[0].canal} · ${PIEZAS[0].momento} · ${PIEZAS[0].publico}`;
const PROBLEMAS_TEXTO = PROBLEMAS.map((x) => `${piezaPorId(x.pieza).nombre}, ${x.fila === "respaldo" ? "afirmaciones" : x.fila === "momento" ? "momento" : campoNombre(x.fila).toLowerCase()}: ${x.nota}`).join(". ");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "crear-campanas-promocionales-con-ia",
    category: "marketing",
    title: "Crear una campaña promocional completa con IA",
    description:
      "Escribe tu promoción una sola vez en una ficha, crea las piezas de la campaña a partir de ella, contrástalas con una matriz y decide antes de lanzar cómo medirlas.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["estrategia-planificacion", "comunicacion-atencion"],
    estandarGuia: 3,
    activoOriginal:
      "Ficha de campaña de diez campos con «Aparece en», matriz de coherencia pieza por campo, rúbrica de cinco criterios con dos reglas de bloqueo y plan de medición previo (tablas copiables)",
    problem: "Tienes una promoción y varias piezas sueltas (anuncio, publicaciones, afiche) que no forman una campaña coherente.",
    whyThisPage:
      "Une las guías de marketing con un solo caso de principio a fin: una ficha como fuente única, piezas que se contrastan con ella y un plan de medición decidido antes de lanzar.",
    relatedGuides: [
      "crear-promociones-con-ia",
      "crear-anuncios-con-ia",
      "crear-afiches-con-ia",
      "crear-publicaciones-para-redes-sociales-con-ia",
      "calendario-de-contenido-con-ia",
      "analizar-ventas-con-ia",
    ],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Cinco piezas que se contradicen en un detalle cuestan la confianza de quien las ve. Escribe tu promoción una vez, haz que cada pieza salga de ahí y decide antes de lanzar cómo sabrás si sirvió.",
    difficulty: "Intermedio",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de dos horas la primera vez; menos en las campañas siguientes",
    needs: ["Un asistente de IA de chat", "Una promoción ya decidida, con descuento y fechas", "Un cuaderno o una hoja para anotar ventas"],
    result: "Una ficha de campaña, cinco piezas que dicen lo mismo y un plan para saber después si funcionó",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el resultado: una ficha de campaña y, junto a ella, la matriz que contrasta cada pieza con esa ficha.",
      description:
        "Una hoja de cálculo dividida en dos: a la izquierda la ficha de campaña del caso ficticio (campo, valor y «Aparece en») y a la derecha la matriz de coherencia con las cinco piezas como columnas y las marcas ✓ y ✗. Resaltar con un color una celda ✗. Sin datos personales.",
      alt: "Hoja de cálculo con una ficha de campaña a la izquierda y, a la derecha, una matriz que contrasta cinco piezas con la ficha.",
      caption: "Una ficha, cinco piezas y una comprobación campo por campo.",
    }),
    datos: slot("datos-necesarios.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña cómo se ven los cuatro datos previos ya reunidos antes de abrir la IA.",
      description:
        "Un documento con cuatro bloques: la promoción decidida (descuento, productos y fechas), las piezas y sus canales, lo que se puede contar (cuaderno de ventas, chat) y los permisos y límites. Caso ficticio, sin datos personales.",
      alt: "Documento con la promoción decidida, las piezas y canales, lo que se puede contar y los permisos de un negocio ficticio.",
      caption: "Los datos que la IA no puede saber.",
      zoom: true,
    }),
    ficha: slot("ficha-de-campana.webp", {
      section: "entrevista",
      ratio: "4/3",
      purpose: "Muestra la ficha completa pegada en una hoja, con sus diez campos y la columna «Aparece en».",
      description:
        "La ficha de campaña del caso pegada en una hoja de cálculo: diez filas, con las columnas Campo, Valor y Aparece en. Resaltar la columna «Aparece en» y la fila de condiciones. Caso ficticio.",
      alt: "Hoja con la ficha de una campaña promocional de diez campos y su columna «Aparece en».",
      caption: "La ficha: lo único que puede decir una pieza.",
      zoom: true,
    }),
    primerResultado: slot("piezas-iniciales.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver cómo llegan las cinco piezas y localizar las frases que no coinciden con la ficha.",
      description:
        "La tabla de las cinco piezas devuelta por el asistente, con sus momentos y textos. Subrayar en cada pieza la frase que después resultará no coincidir con la ficha. Caso ficticio, sin datos de cuenta.",
      alt: "Tabla con cinco piezas de una campaña promocional, con su momento y su texto, y tres frases subrayadas.",
      caption: "Las cinco piezas, tal como llegan.",
      zoom: true,
    }),
    matriz: slot("matriz-de-coherencia.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a leer la matriz: qué significa cada marca y dónde están las tres diferencias.",
      description:
        "La matriz de coherencia del primer resultado, con ocho filas y cinco columnas de piezas. Resaltar las tres celdas ✗ y mostrar al lado la frase de la ficha que corresponde a cada una. Caso ficticio.",
      alt: "Matriz de coherencia con tres celdas marcadas ✗ frente a los campos de la ficha.",
      caption: "Tres diferencias, visibles en una sola tabla.",
      zoom: true,
    }),
    final: slot("matriz-final.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra el entregable final: la matriz sin diferencias tras corregir las tres piezas.",
      description:
        "La matriz de coherencia después del ajuste, con todas las celdas aplicables en ✓ y las tres piezas corregidas resaltadas en el encabezado. Al lado, la rúbrica con su total. Caso ficticio.",
      alt: "Matriz de coherencia sin ninguna diferencia después de corregir tres piezas.",
      caption: "La matriz después del ajuste.",
      zoom: true,
    }),
    medicion: slot("plan-de-medicion.webp", {
      section: "medicion",
      ratio: "4/3",
      purpose: "Muestra el plan de medición completo, escrito antes de lanzar, con su comparación por día abierto.",
      description:
        "El plan de medición pegado en una hoja: las tres filas de indicadores con sus cinco columnas y, debajo, la cuenta de días abiertos de cada período. Resaltar la columna «Se compara con». Caso ficticio, sin cifras de ventas.",
      alt: "Hoja con un plan de medición de tres indicadores y la cuenta de los días abiertos de cada período.",
      caption: "El plan, escrito antes de empezar.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "ficha",
      purpose: "Prueba real del prompt de ficha: el ida y vuelta de preguntas y la tabla que devolvió.",
      description:
        "Captura de la entrevista (preguntas y respuestas) y de la tabla final con su columna Estado y las contradicciones señaladas. Usa la promoción del caso o la tuya. Ocultar datos personales y de cuenta.",
      alt: "Captura de una entrevista con un asistente y de la ficha de campaña que devolvió.",
      caption: "Prueba del prompt de ficha.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "piezas",
      purpose: "Prueba real del prompt de piezas: la tabla con los textos y lo que declaró como supuesto.",
      description:
        "Captura de la tabla de piezas, de «Supuestos y sugerencias» y de «FALTA». Usa la ficha del caso o la tuya. Ocultar datos personales y de cuenta.",
      alt: "Captura de las piezas de una campaña devueltas por un asistente.",
      caption: "Prueba del prompt de piezas.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "contraste",
      purpose: "Prueba real del prompt de contraste: la matriz, las diferencias y la rúbrica puntuada.",
      description:
        "Captura de la matriz, de la tabla de diferencias, de la rúbrica con sus fragmentos y de «Para comprobar tú». Anota aparte si sus marcas coinciden con las tuyas. Ocultar datos personales y de cuenta.",
      alt: "Captura de la revisión de una campaña con matriz de coherencia y rúbrica.",
      caption: "Prueba del prompt de contraste.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y las piezas corregidas.",
      description:
        "Captura de la tabla de cambios, de las piezas corregidas y de «Sin cambios». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de piezas de una campaña con sus cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "medicion",
      ratio: "16/9",
      promptId: "medicion",
      purpose: "Prueba real del prompt de medición: la tabla del plan, la cuenta de días abiertos y lo que no se puede afirmar.",
      description:
        "Captura de la tabla del plan, de «Cómo comparar con justicia», de «Con estos datos no se puede afirmar» y de «FALTA». Anota aparte si su cuenta de días coincide con la tuya. Ocultar datos personales y de cuenta.",
      alt: "Captura de un plan de medición devuelto por un asistente.",
      caption: "Prueba del prompt de medición.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Una campaña no es una pieza sino varias que salen en días distintos: un anuncio, publicaciones, un afiche, un mensaje. Cada una se escribe en otro momento, a veces en otra conversación con la IA, y en cada una se cuela una diferencia pequeña: una fecha, una condición que falta, una promesa que la oferta no hace.\n\nQuien ve dos piezas que no coinciden no piensa que te equivocaste: piensa que no puede fiarse. Y al cerrar, nadie sabe si funcionó, porque nadie decidió antes qué contar.\n\nUn asistente de IA puede redactar todas las piezas en minutos y compararlas entre sí, pero puede rellenar lo que le falta con lo que suena razonable y no conoce tu margen ni tu stock. **La promoción se escribe una sola vez, en una ficha; cada pieza sale de ella y se contrasta con ella antes de publicar.**",
    symptoms: [
      "Una pieza dice «hasta el viernes» y otra «hasta el sábado».",
      "El anuncio menciona una condición que el afiche olvidó.",
      "Pediste cada pieza en una conversación distinta y suenan a tiendas distintas.",
      "Al cerrar la promoción no sabes si funcionó ni con qué compararla.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con una campaña lista para verificar y un método para repetirla.",
    deliverables: [
      { label: "Una ficha de campaña", detail: "La promoción escrita una vez, con lo que debe llevar cada pieza." },
      { label: "Cinco piezas coherentes", detail: "Un anuncio, dos publicaciones, un afiche y un mensaje." },
      { label: "Una matriz de coherencia", detail: "Contrasta cada pieza con la ficha, campo por campo." },
      { label: "Una rúbrica de cinco criterios", detail: "Para puntuar las piezas antes de publicar." },
      { label: "Un plan de medición", detail: "Qué contar, con qué comparar y qué decidir." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Ya decidiste tu promoción (qué ofreces, con qué descuento y en qué fechas) y necesitas convertirla en piezas.",
      "Vas a publicar en más de un lugar: redes, un afiche, un mensaje.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Todavía no decidiste la promoción: primero se diseña y se calcula, y hay una guía que enseña a hacerlo.",
      "Buscas que la IA compre anuncios, programe o publique por ti: aquí solo se preparan las piezas.",
      "Quieres piezas de diseño terminadas: aquí se prepara el contenido, y el diseño se hace después.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Hilo y Botón (ficticio) — tienda de ropa de barrio",
    situation:
      "Hilo y Botón es una tienda de ropa con un local y una cuenta en redes, atendida por dos personas. Le quedan prendas de otoño-invierno y llega la colección nueva. La dueña ya decidió su promoción y necesita convertirla en piezas.",
    goal: "Una campaña de dos semanas con cinco piezas que digan lo mismo y un plan para saber después si sirvió.",
    data: [
      { label: "Promoción decidida", value: "Liquidación de otoño-invierno, con 30 % de descuento durante dos semanas" },
      { label: "Piezas que quiere", value: PIEZAS.map((p) => p.nombre).join(" · ") },
      { label: "Lo que puede contar", value: LO_QUE_PUEDO_CONTAR },
    ],
    problem: "Sus piezas de otras temporadas decían fechas distintas y nunca supo si la liquidación había servido.",
    application: "Escribe la ficha, pide las piezas, las contrasta, corrige lo señalado, define cómo medirá y verifica antes de lanzar.",
    result: "Cinco piezas coherentes con su ficha y un plan de medición escrito antes de empezar.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas sostienen la campaña. Los datos del caso son ficticios; los de tu campaña son los tuyos.",
    blocks: [
      {
        title: "Una ficha, una sola verdad",
        detail:
          "La ficha reúne la promoción en diez campos. Cada pieza se escribe leyendo la ficha, nunca de memoria. Si un dato cambia, cambia primero en la ficha y después en las piezas que lo llevan.",
        example: `En el caso, la vigencia es «${FICHA.find((f) => f.id === "vigencia")!.valor}»: cualquier otra fecha en una pieza es un error.`,
      },
      {
        title: "Un papel para cada pieza",
        detail:
          "Cada pieza responde a un momento: anunciar, recordar, cerrar. Si dos piezas dicen lo mismo con otras palabras, sobra una. Para decidir qué día sale cada una según tu tiempo, usa el calendario de contenido.",
        example: "En el caso, el anuncio y la primera publicación lanzan; la segunda publicación y el mensaje avisan de la última semana; el afiche acompaña todo el período.",
      },
      {
        title: "Qué va en cada pieza",
        detail:
          "No todo dato va en todas partes. Lo que necesita quien compra va en todas las piezas; las condiciones, en las que llegan a quien no conoce la tienda; el objetivo y tu decisión final no se publican. La columna «Aparece en» lo deja escrito.",
      },
      {
        title: "Medir antes de lanzar",
        detail:
          "Decidir qué contar y qué harás con el resultado antes de empezar evita elegir después la cifra que conviene.",
        example: "En el caso, la dueña decide de antemano qué hará si queda menos de la mitad de las prendas.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Hazme un anuncio, un post y un afiche para mi liquidación de ropa.",
    whyInsufficient:
      "Con esa frase la IA no conoce la promoción completa. Si pides cada pieza por separado, cada respuesta puede inventar lo que falta: una fecha de cierre, una condición (ejemplo ilustrativo). Las piezas quedan bien escritas y no coinciden.",
    issues: [
      "No hay una fuente: cada pieza parte de lo que le contaste ese día.",
      "No hay papeles: las piezas repiten lo mismo con otras palabras.",
      "No hay contraste: nadie compara las piezas con la promoción.",
      "No hay plan de medición: al cerrar no hay con qué comparar.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Reúne cuatro cosas antes de abrir la IA. Ninguna puede inventarla ella.",
    items: [
      { label: "Tu promoción ya decidida", detail: "Qué ofreces, con qué descuento y en qué fechas, con los días de la semana.", required: true },
      { label: "Tus canales y tus piezas", detail: "Qué pieza va en cada canal y en qué momento.", required: true },
      { label: "Lo que puedes contar", detail: "Con qué registras ya las ventas o las consultas: un cuaderno, el chat, un conteo.", required: true },
      { label: "Tus permisos y tus límites", detail: "A quién puedes escribir, qué imágenes puedes usar y qué no vas a prometer.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ficha: {
      caption: "Ficha de campaña con el caso de Hilo y Botón",
      purpose: "Tener la promoción escrita una vez, campo por campo, con lo que cada pieza debe llevar, lista para pegar en una hoja.",
      columns: ["Campo", "Qué poner", "Valor del caso", "Aparece en"],
      rows: FICHA.map((f) => [f.campo, f.pide, f.valor, f.aparece]),
      copyable: true,
      note: "Ejemplo ficticio. Cambia los valores por los tuyos y separa cada condición con « · » para comprobarlas una a una.",
    },
    matriz: {
      caption: "Matriz de coherencia del primer resultado",
      purpose: "Ver de un vistazo qué piezas coinciden con la ficha y en cuál campo hay una diferencia.",
      columns: ["Campo", ...PIEZAS.map((p) => p.nombre)],
      rows: matriz(PROBLEMAS),
      copyable: true,
      note: "Ejemplo generado. ✓ coincide · ✗ falta o difiere · — no debe aparecer. Cambia las columnas por tus piezas y las filas por los campos de tu ficha.",
    },
    medicion: {
      caption: "Plan de medición de la campaña, escrito antes de lanzar",
      purpose: "Saber qué contar, de dónde sale, cuándo se anota, con qué compararlo y qué permite decidir.",
      columns: ["Qué medir", "De dónde sale", "Cuándo se anota", "Se compara con", "Lo que permite decidir"],
      rows: [
        [
          "Unidades vendidas de prendas con etiqueta verde, por día abierto",
          "Cuaderno de ventas",
          "Al cerrar cada día abierto",
          `Los ${DIAS_CAMPANA} días anteriores al sábado 7 (${ABIERTOS_CAMPANA} días abiertos frente a ${ABIERTOS_ANTERIOR})`,
          "Si esas prendas se vendieron a mayor ritmo",
        ],
        [
          "Prendas con etiqueta verde que quedan",
          "Conteo físico",
          "Al cerrar el viernes 6 y el viernes 20",
          "El conteo del viernes 6",
          "Repetir o cambiar el enfoque, según la regla de la ficha",
        ],
        [
          "Mensajes que contienen la palabra OTOÑO",
          "Chat de WhatsApp",
          "Cada noche",
          "Una semana con la otra",
          "Cuánta gente escribe; solo cuenta a quien usa la palabra",
        ],
      ],
      copyable: true,
      note: `Ejemplo generado, sin cifras de ventas. Cómo comparar con justicia: ${CUENTA_DIAS} Con estos datos no se puede afirmar que la liquidación causó un cambio: las dos semanas no son iguales. FALTA: [FALTA: el conteo del viernes 6].`,
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene con un prompt en cinco de los seis pasos; el sexto, el de verificar, es solo tuyo.",
    steps: [
      {
        title: "Escribe tu ficha de campaña",
        description: "Completa los diez campos, con la IA como entrevistadora si te faltan datos.",
        output: "Una ficha sin [FALTA].",
      },
      {
        title: "Pide las piezas",
        description: "Entrega la ficha, las piezas y sus momentos, y pide un texto para cada una.",
        output: "Una tabla de piezas.",
      },
      {
        title: "Contrasta cada pieza con la ficha",
        description: "Rellena la matriz, a mano o con el prompt de contraste, y puntúa con la rúbrica.",
        output: "Una lista de diferencias.",
      },
      {
        title: "Corrige solo lo señalado",
        description: "Pide cambiar únicamente lo que tiene diferencias, sin tocar la ficha ni lo que estaba bien.",
        output: "Frases corregidas y una matriz sin marcas.",
      },
      {
        title: "Define cómo medirás",
        description: "Antes de lanzar, pide un plan de qué contar, con qué comparar y qué decidirás.",
        output: "Un plan escrito antes de empezar.",
      },
      {
        title: "Verifica y lanza",
        description: "Comprueba fechas, permisos y reglas tú mismo, y publica desde tu plataforma.",
        output: "Una campaña lista.",
      },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    ficha: {
      title: "Prompt de ficha: que la IA te entreviste",
      objective: "Completar tu ficha con preguntas de una en una y señalar lo que no cuadra.",
      whenToUse: "Cuando tu promoción está decidida pero no escrita completa.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una o dos frases.", example: "Tienda de ropa de barrio con un local y una cuenta en redes" },
        { name: "PROMOCION", description: "La promoción que ya decidiste, en una frase.", example: "Liquidación de otoño-invierno, 30 % menos, dos semanas" },
        { name: "FICHA_ACTUAL", description: "Lo que ya tienes escrito de la ficha; si nada, escribe «vacía».", example: "Vacía" },
      ],
      prompt: `Actúa como un entrevistador que ayuda a un negocio pequeño a dejar por escrito la ficha de una campaña promocional. Tu destinatario es la persona dueña, que ya decidió su promoción pero nunca la escribió completa. Tu objetivo es completar los campos de la ficha usando SOLO lo que yo te diga, y avisarme si algo no cuadra.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Mi promoción, ya decidida: {{PROMOCION}}

### DATOS
Lo que ya tengo escrito de la ficha (puede estar vacío):
{{FICHA_ACTUAL}}

### CAMPOS A COMPLETAR (en este orden)
${LISTA_CAMPOS}

### REGLAS
1. Hazme UNA pregunta por turno y espera mi respuesta. Máximo 10 preguntas; no preguntes lo que ya está en CONTEXTO o en DATOS.
2. No propongas descuentos, precios, fechas, condiciones ni reglas de decisión: la promoción ya está decidida y esos datos son solo míos. Si falta uno, anótalo como [FALTA: el dato].
3. Si dos respuestas se contradicen (un descuento distinto del anterior, una fecha de cierre en un día en que no abro), cita las dos frases textuales y pídeme que elija.
4. Si una respuesta es vaga («pronto», «unos días»), pídeme la fecha o la cifra concreta.
5. Distingue siempre entre lo que yo dije, lo que tú supones y lo que sugieres. Nunca conviertas una suposición en un dato.
6. Para la columna «Aparece en» propón: lo que necesita quien compra (oferta, vigencia, dónde comprar, palabra clave) va en «${APARECE.todas}»; las condiciones, en «${APARECE.nuevo}»; el horario, donde yo te diga; el objetivo, el público, el mensaje central y mi decisión, en «${APARECE.guia}». Márcalo como SUGERIDO.
7. Para el mensaje central ofrece dos opciones de una frase, hechas solo con mis datos, y deja que yo elija o corrija.
8. No des consejos legales ni financieros ni evalúes si la promoción me conviene.

### FORMATO DE SALIDA
Al terminar (o al llegar a 10 preguntas), una tabla con columnas fijas: Campo | Valor (con mis palabras) | Aparece en | Estado, con una fila por campo. El estado es COMPLETO, SUPUESTO, SUGERIDO o [FALTA: el dato]. Después, «Contradicciones» (si las hay) y «Pendiente». La tabla define la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Verifica que: están todos los campos, en el orden indicado; cada valor usa mis palabras y mis cifras; ninguna cifra ni fecha apareció sin que yo la dijera; toda suposición o sugerencia está marcada como tal; los días de la semana coinciden con sus fechas (si dudas, pregúntame). Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar la tabla completa en el siguiente prompt, en el lugar de la variable FICHA.`,
      explanation: [
        {
          part: "…usando SOLO lo que yo te diga, y avisarme si algo no cuadra.",
          why: "Ella pregunta y ordena; la promoción es tuya.",
        },
        {
          part: "Si dos respuestas se contradicen… cita las dos frases textuales…",
          why: "Un dato que cambia a mitad de la entrevista es la diferencia que luego aparecería en una pieza.",
        },
        {
          part: "Para la columna «Aparece en» propón…",
          why: "Deja escrito qué dato va en qué pieza.",
        },
      ],
      evaluate: "Comprueba que cada valor usa tus palabras y que lo que no sabías dice [FALTA].",
      improve: "Si algo quedó vago, responde con la cifra o la fecha exacta y pide reescribir esa fila.",
      conversation: [
        { who: "ia", text: "Ya sé que es una liquidación de dos semanas. Primera pregunta: ¿qué quieres lograr con ella?" },
        { who: "tu", text: "Vender casi todo lo de otoño-invierno antes de que llegue la colección nueva." },
        { who: "ia", text: "Anotado. ¿Desde qué día y hasta cuál vale, con el día de la semana?" },
      ],
      warnings: ["No pegues datos personales de clientes."],
    },

    piezas: {
      title: "Prompt de piezas: un texto para cada pieza, desde la ficha",
      objective: "Obtener el texto de cada pieza, con su momento y los campos de la ficha que lleva.",
      whenToUse: "Cuando tu ficha está completa y sabes qué piezas publicarás.",
      variables: [
        { name: "FICHA", description: "La tabla completa del paso 1.", example: "La tabla con las columnas Campo, Valor y Aparece en" },
        { name: "PIEZAS", description: "Una línea por pieza: canal, momento y público.", example: PIEZA_EJEMPLO },
        { name: "TONO", description: "Cómo suena tu negocio.", example: TONO },
      ],
      prompt: `Actúa como redactor de campañas promocionales para un negocio pequeño. Tu destinatario es la persona dueña, que revisará cada texto contra su ficha antes de publicar. Tu objetivo es escribir un texto para cada pieza de la campaña usando SOLO los datos de la ficha.

### CONTEXTO
Tono: {{TONO}}
Piezas a escribir (nombre, canal, momento y público de cada una):
{{PIEZAS}}

### DATOS (la ficha es la única fuente de hechos)
{{FICHA}}

### REGLAS
1. Usa solo los datos de la ficha. No inventes precios, tallas, colores, stock, horarios, beneficios ni condiciones. Si una pieza necesita un dato que falta, escribe [FALTA: el dato].
2. Cada pieza lleva los campos que la columna «Aparece en» le asigna. Cópialos con las mismas palabras y cifras, sin cambiar fechas ni días de la semana. Los campos «${APARECE.guia}» no se publican.
3. Cada pieza responde a su momento y dice algo que las otras no dicen. Escribe para el público indicado en su fila.
4. No compares con otras tiendas, no prometas resultados y no uses urgencia ni escasez que la ficha no respalde («últimas unidades», «solo hoy»).
5. Usa el mensaje central como guía de todas las piezas; el anuncio puede usarlo de titular.
6. Si dos datos de la ficha se contradicen o un día de la semana no coincide con su fecha, avísame antes de escribir.
7. Distingue lo que sale de la ficha de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Pieza | Momento | Texto | Campos de la ficha que lleva, con una fila por pieza y en orden de fecha; (2) «Supuestos y sugerencias»: lo que no sale de la ficha, o «Ninguno»; (3) «FALTA» con cada [FALTA]. La tabla define la forma; el contenido sale de mi ficha.

### ANTES DE RESPONDER
Verifica que: cada pieza lleva todos los campos que la ficha le asigna, copiados tal cual; ningún dato apareció sin estar en la ficha; los días de la semana coinciden con sus fechas; cada pieza dice algo distinto de las demás; ninguna usa comparaciones, promesas ni urgencia sin respaldo. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar la tabla completa en el siguiente prompt, en el lugar de la variable PIEZAS.`,
      explanation: [
        {
          part: "Cada pieza lleva los campos que la columna «Aparece en» le asigna.",
          why: "La IA no decide qué dato va dónde: lo lee de una columna que escribiste tú.",
        },
        {
          part: "Cada pieza responde a su momento y dice algo que las otras no dicen.",
          why: "Evita cinco versiones del mismo texto.",
        },
        {
          part: "«Supuestos y sugerencias»: lo que no sale de la ficha, o «Ninguno».",
          why: "Si dice «Ninguno», no la des por cierta: la matriz la comprueba.",
        },
      ],
      evaluate: "Contrasta cada pieza con la ficha, campo por campo, en el paso siguiente.",
      improve: "Si dos piezas suenan iguales, aclara el momento y el público de cada una en PIEZAS.",
    },

    contraste: {
      title: "Prompt de contraste: comparar cada pieza con la ficha",
      objective: "Rellenar la matriz de coherencia, señalar cada diferencia con su frase y puntuar con la rúbrica, sin reescribir.",
      whenToUse: "Justo después de recibir las piezas, con tu ficha a la mano.",
      variables: [
        { name: "PIEZAS", description: "La tabla de piezas que quieres revisar.", example: "La tabla del prompt de piezas" },
        { name: "FICHA", description: "La tabla completa del paso 1.", example: "Tu ficha, con Campo, Valor y Aparece en" },
      ],
      prompt: `Actúa como revisor de campañas promocionales para un negocio pequeño. Tu destinatario es la persona dueña, que comparará tus marcas con su ficha. Tu objetivo es contrastar cada pieza con la ficha, campo por campo, y puntuarlas con una rúbrica fija. No reescribas las piezas.

### CONTEXTO
Usa los momentos y los públicos de las piezas de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Piezas a revisar:
{{PIEZAS}}

Ficha de campaña (la única referencia; no supongas nada fuera de ella):
{{FICHA}}

### RÚBRICA (puntúa cada criterio de 0 a 2: 0 = no cumple, 1 = en parte, 2 = cumple)
${LISTA_CRITERIOS}

### REGLAS
1. Para cada campo cuya columna «Aparece en» no sea «${APARECE.guia}», marca en cada pieza ✓ (coincide), ✗ (falta o difiere; cita la frase de la pieza y la de la ficha) o — (no debe aparecer ahí).
2. Revisa por separado cada parte de un campo compuesto, como cada condición.
3. Añade dos filas: «Sin afirmaciones sin respaldo» (cualquier afirmación, comparación, superlativo o urgencia que la ficha no diga) y «Momento y papel» (si la pieza responde a su momento y dice algo distinto de las demás).
4. Cada ✗ y cada puntaje se apoyan en un fragmento literal entre comillas.
5. Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, marca la campaña NO PUBLICAR hasta corregirla.
6. Comprueba que cada día de la semana coincida con su fecha y dime si algo no coincide. No des por buenos precios ni permisos: lista lo que debo comprobar yo.
7. No juzgues si la promoción conviene ni el diseño de las piezas: solo su coherencia con la ficha.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Campo | una columna por pieza; (2) «Diferencias»: una tabla con columnas fijas Pieza | Campo | La ficha dice | La pieza dice; (3) una tabla con columnas fijas: Criterio | Puntaje (0-2) | Fragmento que lo justifica, con el total sobre ${MAXIMO} y el veredicto «${RESULTADOS[0].label}» (menos de ${RESULTADOS[1].min}), «${RESULTADOS[1].label}» (de ${RESULTADOS[1].min} a ${RESULTADOS[2].min - 1}) o «${RESULTADOS[2].label}» (${RESULTADOS[2].min} o más); (4) «Para comprobar tú»: los datos con vigencia y los permisos. Las tablas definen la forma; el contenido sale de mis piezas y mi ficha.

### ANTES DE RESPONDER
Verifica que: revisaste todas las piezas y todos los campos; cada ✗ tiene su fragmento y aparece en «Diferencias»; los puntajes coinciden con las marcas y suman bien (máximo ${MAXIMO}); aplicaste NO PUBLICAR donde correspondía; no reescribiste ninguna pieza. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Revisa por separado cada parte de un campo compuesto, como cada condición.",
          why: "Una condición recortada pasa desapercibida si el campo se revisa entero.",
        },
        {
          part: "Cada ✗ y cada puntaje se apoyan en un fragmento literal entre comillas.",
          why: "Comprobar la marca es buscar esa frase en la pieza.",
        },
        {
          part: "…marca la campaña NO PUBLICAR hasta corregirla.",
          why: "Un dato distinto o una afirmación sin respaldo no se compensa con buenas notas en lo demás.",
        },
      ],
      evaluate: "Comprueba tú las fechas y la palabra clave en cada pieza; si difieren de sus marcas, confía en tu ficha.",
      improve: "Si puntúa todo casi igual, pide más severidad en «Mismos datos».",
      warnings: ["Puede marcar ✓ donde hay una diferencia: la matriz ordena la revisión, no la sustituye."],
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo las piezas con diferencias",
      objective: "Corregir solo las frases señaladas, con palabras de la ficha, y dejar intactas las piezas que estaban bien.",
      whenToUse: "Después del contraste, cuando alguna pieza tiene diferencias.",
      variables: [
        { name: "PROBLEMAS", description: "Las diferencias detectadas: pieza, campo y frase.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Piezas o campos que no se pueden cambiar.", example: "El afiche, la publicación 2 y la ficha" },
      ],
      prompt: `Actúa como editor de campañas promocionales para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO las piezas con diferencias, sin tocar la ficha ni lo que estaba bien.

### CONTEXTO
Usa la ficha, las piezas y la revisión de esta conversación. Si falta alguna, pídemela antes de seguir.

### DATOS
Diferencias que detecté (pieza, campo y frase):
{{PROBLEMAS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo las piezas y las frases señaladas. No modifiques la ficha, los momentos ni las piezas sin diferencias.
2. Para cada corrección usa las palabras y cifras de la ficha. Si la ficha no tiene el dato que hace falta, escribe [FALTA: el dato] en lugar de inventarlo.
3. Si quitas una afirmación sin respaldo, no la reemplaces por otra: quítala o escribe solo la parte que la ficha sí respalda.
4. Si una diferencia que te señalé no existe en la ficha, o la ficha se contradice, dímelo antes de cambiar nada.
5. No añadas piezas, ofertas ni condiciones nuevas.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla con columnas fijas Pieza | Antes | Después | Motivo, con solo la frase que cambia, para que yo la sustituya en mi pieza; (2) «Sin cambios»: las piezas que no toqué. La tabla define la forma; el contenido sale de mis piezas.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada «Después» usa datos de la ficha; cada pieza conserva su momento; no apareció ningún dato nuevo; las piezas sin cambios están idénticas. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo las piezas y las frases señaladas.",
          why: "Evita que rehaga piezas que ya coincidían con la ficha.",
        },
        {
          part: "Si quitas una afirmación sin respaldo, no la reemplaces por otra…",
          why: "Evita cambiar un elogio por otro igual de inventado.",
        },
        {
          part: "Si una diferencia que te señalé no existe en la ficha… dímelo antes de cambiar nada.",
          why: "Evita corregir a ciegas una diferencia que tú mismo pudiste marcar mal.",
        },
      ],
      evaluate: "Sustituye las frases y vuelve a pasar la matriz: las demás piezas deben seguir idénticas.",
      improve: "Si dos piezas quedan iguales, cambia su momento en PIEZAS y repite el paso 2.",
    },

    medicion: {
      title: "Prompt de medición: el plan antes de lanzar",
      objective: "Armar un plan de qué contar, con qué compararlo y qué decidir, sin inventar referencias.",
      whenToUse: "Antes de lanzar, con tu ficha completa.",
      variables: [
        { name: "LO_QUE_PUEDO_CONTAR", description: "Con qué registras ya ventas o consultas.", example: LO_QUE_PUEDO_CONTAR },
        { name: "OTROS_EVENTOS", description: "Cosas distintas en el período con el que vas a comparar.", example: OTROS_EVENTOS },
      ],
      prompt: `Actúa como asesor de medición para un negocio pequeño. Tu destinatario es la persona dueña, que anotará las cifras ella misma con lo que ya tiene. Tu objetivo es armar, antes de lanzar la campaña, un plan que diga qué contar, de dónde sale cada cifra, con qué compararla y qué decidir.

### CONTEXTO
Usa la ficha de esta conversación: objetivo, vigencia, horario, palabra clave y lo que decidiré al cerrar. Si falta alguno, pídemelo antes de seguir.

### DATOS
Lo que puedo contar con lo que ya tengo:
{{LO_QUE_PUEDO_CONTAR}}

Cosas distintas en el período anterior (días cerrados, otra promoción, cambios en el local):
{{OTROS_EVENTOS}}

### REGLAS
1. Propón solo indicadores que yo pueda contar con lo que te describí en DATOS. Si un indicador útil requiere algo que no tengo, dilo en «FALTA» y no lo pongas en la tabla.
2. No inventes cifras de referencia ni resultados esperados de otras tiendas o del sector. La regla de decisión es la de mi ficha; si no la tengo, escribe [FALTA: tu regla].
3. Para comparar, elige un período anterior de la misma duración y cuenta los días abiertos de cada período según mi horario. Muestra la cuenta para que yo la compruebe.
4. Señala qué puede distorsionar la comparación usando solo lo que te conté; no supongas otros motivos.
5. Con pocas ventas, habla de cantidades y no de porcentajes, y dilo.
6. Di siempre qué NO se puede afirmar con estos datos; no afirmes que la campaña causó ningún cambio.
7. Distingue lo que sale de mi ficha de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Qué medir | De dónde sale | Cuándo se anota | Se compara con | Lo que permite decidir; (2) «Cómo comparar con justicia»: los días abiertos de cada período, con la cuenta; (3) «Con estos datos no se puede afirmar»: una lista; (4) «FALTA». La tabla define la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: cada indicador se puede contar con lo que dije en DATOS; recontaste dos veces los días abiertos; ninguna cifra de referencia salió de ti; la regla de decisión es la mía; hay al menos una cosa que no se puede afirmar. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Propón solo indicadores que yo pueda contar con lo que te describí en DATOS.",
          why: "Evita un plan que no puedes cumplir porque exige un dato que no registras.",
        },
        {
          part: "No inventes cifras de referencia ni resultados esperados…",
          why: "Una meta ajena te haría juzgar tu campaña con una vara que no es tuya.",
        },
        {
          part: "…cuenta los días abiertos de cada período según mi horario.",
          why: "Compara ritmos y no totales: un día cerrado más hace parecer peor un período.",
        },
      ],
      evaluate: "Recuenta tú los días abiertos y comprueba que cada indicador tenga su registro.",
      improve: "Si incluye algo que no puedes contar, quítalo y pide el plan de nuevo.",
      warnings: ["Puede equivocarse al contar los días: la cuenta es tuya."],
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de piezas a la ficha de Hilo y Botón. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Primeras piezas, tal como llegan",
          purpose: "Tener las cinco piezas con el formato que pidió el prompt, para contrastarlas con la ficha.",
          columns: ["Pieza", "Momento", "Texto", "Campos de la ficha que lleva"],
          rows: PIEZAS.map((p) => [p.nombre, p.momento, TEXTO_PRIMERO[p.id], camposDe(p)]),
          note: "Supuestos y sugerencias: ninguno. FALTA: [FALTA: el número de WhatsApp para reservar].",
        },
      },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "campana",
    title: "Puntúa un juego de piezas",
    intro:
      `Puntúa tus piezas en los cinco criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, no se publica aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      "Las cinco piezas parecen consistentes. Para saber si lo son, se contrastan con la ficha y se puntúan con la rúbrica. " +
      `En este ejemplo el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      {
        criterionId: "datos",
        verdict: vered("datos"),
        comment:
          "El anuncio omite «no acumulable con otras promociones», que la ficha asigna a las piezas para público nuevo. Una condición compuesta puede recortarse cuando el texto debe ser breve, aunque el prompt pida copiarla. Las demás piezas coinciden.",
      },
      {
        criterionId: "respaldo",
        verdict: vered("respaldo"),
        comment:
          "La primera publicación habla de «los abrigos más lindos de la temporada» y la ficha solo dice «abrigos de otoño-invierno». No es un dato falso, pero es una valoración que la ficha no respalda.",
      },
      {
        criterionId: "rol",
        verdict: vered("rol"),
        comment: "El mensaje de WhatsApp sale el sábado 14 y dice «Empieza nuestra liquidación», como si fuera el lanzamiento. La segunda publicación sí avisa de la última semana.",
      },
      {
        criterionId: "publico",
        verdict: vered("publico"),
        comment: "El anuncio nombra la tienda y da la dirección; el mensaje se dirige a clientes que ya escribieron.",
      },
      {
        criterionId: "accion",
        verdict: vered("accion"),
        comment: "Todas las piezas piden comprar o reservar y llevan la palabra OTOÑO.",
      },
    ],
    conclusion: "Cinco piezas bien escritas pueden no coincidir con la ficha. Las tres diferencias son pequeñas y solo se ven al contrastar campo por campo.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir tres frases, no rehacer la campaña.",
    promptId: "ajuste",
    why: "El contraste señaló tres diferencias. El prompt limita el cambio a lo señalado, pide usar las palabras de la ficha y separa lo cambiado de lo que sigue igual.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de ajuste, con PROBLEMAS y NO_TOCAR del ejemplo. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Cambios del ajuste",
          purpose: "Comprobar qué frase cambió en cada pieza y por qué.",
          columns: ["Pieza", "Antes", "Después", "Motivo"],
          rows: PROBLEMAS.map((x) => [piezaPorId(x.pieza).nombre, x.antes, x.despues, x.motivo]),
        },
      },
      {
        type: "text",
        text: `**Sin cambios:** ${PIEZAS.filter((p) => !PROBLEMAS.some((x) => x.pieza === p.id)).map((p) => p.nombre).join(" y ")}. Al repetir el contraste con las frases sustituidas, la matriz queda sin ✗ y la rúbrica suma ${MAXIMO} de ${MAXIMO}.`,
      },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Pedir cada pieza en una conversación distinta",
      whyItHurts: "Cada conversación rellena por su cuenta lo que le falta. Las piezas salen bien escritas y no coinciden.",
      instead: "Pega la misma ficha en cada pedido y pide las piezas juntas.",
    },
    {
      title: "Cambiar un dato en una pieza y no en las demás",
      whyItHurts: "Una condición corregida solo en el anuncio deja el afiche y las publicaciones con la versión anterior.",
      instead: "Cambia primero la ficha, pide de nuevo solo las piezas afectadas y pasa la matriz otra vez.",
    },
    {
      title: "Decidir después cómo medir",
      whyItHurts: "Con las cifras a la vista es fácil elegir la que favorece a la campaña, y la decisión deja de tener un criterio previo.",
      instead: "Escribe qué contarás y qué decidirás antes de lanzar, y no lo cambies al cerrar.",
    },
    {
      title: "Atribuirle a la campaña todo lo que cambió",
      whyItHurts: "Las ventas también cambian por los días abiertos o una fecha de pago, y culpar o alabar a la campaña lleva a repetir o abandonar sin razón.",
      instead: "Compara por día abierto y di lo que con esos datos no se puede afirmar.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de publicar la primera pieza, repasa esta lista.",
    items: [
      { label: "Comparé cada pieza con mi ficha, campo por campo.", detail: "Solo se publica lo que coincide con ella." },
      { label: "Los días de la semana coinciden con sus fechas, calendario en mano." },
      { label: "La oferta y sus condiciones son las que decidí y las que puedo cumplir con mi stock y mi margen." },
      { label: "Comprobé las reglas sobre promociones y publicidad de mi país y de cada plataforma.", detail: "Varían según el lugar y cambian con el tiempo: consúltalas allí." },
      { label: "Solo escribo por WhatsApp a quienes aceptaron recibir mensajes.", detail: "Su número de teléfono es un dato personal." },
      { label: "Tengo derecho a las fotos, marcas y textos que acompañarán las piezas." },
      { label: "Ninguna pieza afirma algo que no pueda demostrar." },
      { label: "Mi plan de medición está escrito y mi regla de decisión no cambiará al cerrar." },
    ],
    principle: "La IA redacta y compara con la ficha. La persona comprueba la ficha y decide.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la campaña en marcha, registra y decide sin cambiar las reglas.",
    steps: [
      { title: "Anota cada día lo que definiste", detail: "Solo los indicadores del plan, sin interpretar y en el mismo cuaderno." },
      { title: "Cierra con un conteo, no con una impresión", detail: "El último día cuenta lo que dice tu plan y aplica tu regla tal como la escribiste." },
      { title: "Compara con justicia", detail: "Divide entre los días abiertos y anota lo que hizo distintos a los dos períodos." },
      { title: "Anota qué pieza tuvo más diferencias", detail: "Te dice qué campo aclarar la próxima vez." },
      { title: "Guarda la ficha como plantilla", detail: "En la próxima promoción cambias solo los valores." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena la campaña, pero tiene límites.",
    items: [
      { title: "No decide la promoción", detail: "No conoce tu margen, tu stock ni lo que tus clientes aceptarían: eso es tuyo." },
      { title: "No publica ni compra anuncios", detail: "Prepara los textos; lanzarlos y pagarlos depende de cada plataforma." },
      { title: "No mide por ti", detail: "El plan dice qué contar, pero las cifras salen de tus registros." },
      { title: "No conoce las reglas de tu lugar", detail: "Lo que se puede prometer y a quién se le escribe varía según el país." },
      { title: "No diseña", detail: "Deja listo el contenido; la imagen se hace en una herramienta de diseño." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Una campaña se cae por un detalle: una fecha, una condición, una promesa que nadie revisó. Con la promoción escrita una vez, piezas que salen de ella y una comprobación campo por campo, ese detalle aparece antes de publicar. Y con un plan previo, al cerrar sabes qué contar.",
    takeaways: [
      "Escribe la promoción una sola vez y haz que cada pieza salga de esa ficha.",
      "Da a cada pieza un papel y un momento distintos.",
      "Contrasta cada pieza con la ficha antes de publicarla.",
      "Decide antes de lanzar qué contarás y qué harás.",
    ],
    nextGuide: "analizar-ventas-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "canal", "publico-frio", "rubrica", "indicador", "linea-de-base", "dato-personal"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Cuántas piezas necesita una campaña?",
      answer: "Las que puedas hacer y revisar con tu tiempo. Dos piezas coherentes valen más que cinco que se contradicen. Para calcular tu tiempo, usa la guía del calendario de contenido.",
    },
    {
      question: "¿Puedo usar el mismo texto en todas las piezas?",
      answer: "Puedes repetir los datos, no el texto: quien te ve en dos lugares recibiría lo mismo dos veces.",
    },
    {
      question: "¿La palabra clave sirve para medir todo?",
      answer: "No. Cuenta a quien la usa y no a quien compra sin decirla, así que sirve como señal y no como total.",
    },
  ],
});
