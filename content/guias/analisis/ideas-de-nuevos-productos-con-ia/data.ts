import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * analisis/ideas-de-nuevos-productos-con-ia
 *
 * Tipo: estrategia y planificación + decisión o comparación. No es una guía de números: las puntuaciones y los
 * totales son una suma de cinco valores 0–2 que se verificó con código. Todo el caso (Panadería La Espiga, sus
 * clientes, los problemas que dijeron y las ideas) es FICTICIO. Los ejemplos de la IA están redactados aplicando
 * literalmente cada prompt: no proceden de una conversación real ni de una prueba del autor (esas viven en
 * `evidence.pruebas`, que solo rellena el autor). El pedido ingenuo es ILUSTRATIVO. La guía no cita fuentes
 * externas ni cifras de mercado: los datos sobre clientes los aporta la persona, y la prueba de validación del caso
 * NO se ha realizado, así que no hay resultados inventados: solo un registro vacío para rellenar.
 *
 * Fuente única de verdad: la ficha de problemas (PROBLEMAS), la capacidad (CAPACIDAD), las ideas (IDEAS), la matriz
 * de puntuación (MATRIZ), los criterios de éxito de la prueba (EXITO), la rúbrica (CRITERIOS), sus umbrales
 * (RESULTADOS) y sus puntajes (PUNTAJES) se definen UNA vez y los leen las tablas, los prompts, los ejemplos y la
 * rúbrica.
 */
const slot = guideSlots("analisis", "ideas-de-nuevos-productos-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const NEGOCIO = "Panadería La Espiga (ficticia), panadería de barrio con panes y tortas";
const CAPACIDAD = "Dos hornos y tres personas. Hoy produce panes y tortas. No tiene una zona separada para productos sin gluten ni ha trabajado con proveedores de productos especiales.";
const DECISION_CASO = "Decidir qué producto nuevo probar primero";

/** Lo que dijeron los clientes, con sus palabras (1 de agosto al 15 de septiembre). */
const PROBLEMAS: [id: string, texto: string, veces: number, donde: string][] = [
  ["P01", "«Mi hijo no puede comer gluten y nunca hay opciones para su cumpleaños»", 5, "Mostrador y WhatsApp"],
  ["P02", "«No puedo pasar todos los días; quisiera pan para la semana»", 7, "Mostrador"],
  ["P03", "«El pan integral se acaba a media tarde»", 9, "Mostrador"],
  ["P04", "«Busco algo pequeño para regalar, no una torta entera»", 4, "WhatsApp"],
  ["P05", "«Las tortas salen caras para pocos invitados»", 6, "Mostrador y WhatsApp"],
  ["P06", "«Quisiera panes con menos azúcar»", 3, "Mostrador"],
  ["P07", "«El pan a domicilio llega frío»", 3, "WhatsApp"],
];
const veces = (...ids: string[]) => PROBLEMAS.filter((p) => ids.includes(p[0])).reduce((n, p) => n + p[2], 0);

const COL_IDEAS = ["ID", "Idea (hipótesis de producto)", "Problemas que resuelve", "Qué tendría que ser cierto", "Lo que faltaría", "Cómo probarla"];
type Idea = { id: string; idea: string; prob: string; cierto: string; falta: string; probar: string };
/** Las ideas tal como llegan la primera vez: I3 ignora que no hay zona separada, I4 tiene un supuesto vago e I5 una prueba vaga. */
const IDEAS: Idea[] = [
  { id: "I1", idea: "Caja semanal de panes, con retiro un día fijo", prob: "P02, P03", cierto: "Quienes piden pan para la semana lo preferirían a comprar cada día", falta: "Un día fijo de producción y un sistema de retiro", probar: "Ofrecer la caja por WhatsApp a quienes pidieron pan para la semana" },
  { id: "I2", idea: "Mini tortas para cuatro personas", prob: "P04, P05", cierto: "El tamaño y el precio menores pesan más que la decoración", falta: "Moldes pequeños", probar: "Hacer cinco mini tortas por encargo" },
  { id: "I3", idea: "Línea de galletas sin gluten hechas en la cocina", prob: "P01", cierto: "Quienes lo piden las comprarían con regularidad", falta: "Harinas y recetas sin gluten. Requiere revisar normas", probar: "Ofrecer galletas de muestra a quienes lo pidieron" },
  { id: "I4", idea: "Segunda horneada de pan integral por la tarde", prob: "P03", cierto: "Hay demanda suficiente de pan integral por la tarde", falta: "Horas de horno y personal por la tarde", probar: "Hornear una tanda extra la semana próxima y anotar cuánto sobra" },
  { id: "I5", idea: "Línea de panes con menos azúcar", prob: "P06", cierto: "Quienes lo piden los comprarían cada semana", falta: "Recetas nuevas", probar: "Hacer una encuesta" },
  { id: "I6", idea: "Entrega de pan en bolsa térmica", prob: "P07", cierto: "El pan llega frío por el trayecto", falta: "Bolsas térmicas y tiempos de entrega", probar: "Enviar cinco pedidos en bolsa térmica y preguntar cómo llegó" },
];
const fila = (i: Idea) => [i.id, i.idea, i.prob, i.cierto, i.falta, i.probar];

/* correcciones del ajuste (I3, I4, I5) */
const I3 = IDEAS[2], I4 = IDEAS[3], I5 = IDEAS[4];
const I3_IDEA = "Pan sin gluten de un proveedor certificado, por encargo, sin producirlo en la cocina";
const I3_FALTA = "Un proveedor certificado. Requiere revisar qué exigen las normas de mi país para revenderlo";
const I3_PROBAR = "Abrir una lista de espera, sin cobrar, con quienes lo pidieron";
const I4_CIERTO = `Que quienes se quejaron (P03, ${veces("P03")} veces) compren por la tarde si hay pan; cuántos bastan lo fijo yo`;
const I5_PROBAR = "Ofrecer una muestra en el mostrador durante una semana y anotar cuántos piden más";
const CAMBIOS = [
  [`I3 · Idea: ${I3.idea}`, `I3 · Idea: ${I3_IDEA}`, "CAPACIDAD: no hay zona separada para productos sin gluten."],
  [`I3 · Lo que faltaría: ${I3.falta}`, `I3 · Lo que faltaría: ${I3_FALTA}`, "La zona separada no existe; las normas las revisas tú, no la IA."],
  [`I3 · Cómo probarla: ${I3.probar}`, `I3 · Cómo probarla: ${I3_PROBAR}`, "Una muestra hecha en esa cocina repite el riesgo de la CAPACIDAD."],
  [`I4 · Qué tendría que ser cierto: ${I4.cierto}`, `I4 · Qué tendría que ser cierto: ${I4_CIERTO}`, `P03 son ${veces("P03")} veces; el suficiente lo decide la dueña.`],
  [`I5 · Cómo probarla: ${I5.probar}`, `I5 · Cómo probarla: ${I5_PROBAR}`, "P06: una prueba concreta se puede contar."],
];
const PROBLEMAS_TEXTO = "1) I3 ignora que no tengo zona sin gluten. 2) El supuesto de I4 no dice qué comprobar. 3) La prueba de I5 no es concreta.";

/* matriz de puntuación: 2 = sí, 1 = en parte o sin dato, 0 = no */
const MATRIZ = [
  { id: "necesidad", label: "Necesidad", mide: "Resuelve un problema que oíste", dos: "Lo dijeron muchos y varias veces", uno: "Lo dijeron pocos", cero: "Nadie lo dijo" },
  { id: "capacidad", label: "Capacidad", mide: "Puedes hacerlo con lo que tienes", dos: "Con lo que tienes", uno: "Falta algo que puedes conseguir", cero: "Falta algo que no puedes conseguir" },
  { id: "riesgo", label: "Riesgo", mide: "Dinero, salud y reputación", dos: "Bajo: poco dinero y sin peligro para la salud", uno: "Medio o con normas por revisar", cero: "Alto" },
  { id: "margen", label: "Margen", mide: "Deja algo tras los costos", dos: "Tus datos muestran que deja", uno: "Sin dato de costos", cero: "Tus datos muestran que no deja" },
  { id: "prueba", label: "Prueba", mide: "Se puede probar pronto y barato", dos: "En pocas semanas y sin producir", uno: "Con más costo o tiempo", cero: "No sin invertir mucho" },
] as const;
const LISTA_MATRIZ = MATRIZ.map((m) => `- ${m.label} (${m.mide.toLowerCase()}): 2 = ${m.dos.toLowerCase()}; 1 = ${m.uno.toLowerCase()}; 0 = ${m.cero.toLowerCase()}.`).join("\n");
const PUNTOS: Record<string, [number, number, number, number, number]> = {
  I1: [2, 1, 2, 1, 2], I2: [2, 2, 2, 1, 2], I3: [1, 1, 1, 1, 2], I4: [2, 1, 2, 1, 2], I5: [1, 1, 2, 1, 1], I6: [1, 2, 2, 1, 2],
};
const POR_QUE: Record<string, string> = {
  I1: `P02 y P03: ${veces("P02", "P03")} veces. Pide un día fijo de producción.`,
  I2: `P04 y P05: ${veces("P04", "P05")} veces. Misma cocina, moldes pequeños.`,
  I3: `P01: ${veces("P01")} veces. Falta un proveedor; requiere revisar normas.`,
  I4: `P03: ${veces("P03")} veces. Pide horas de horno por la tarde.`,
  I5: `P06: ${veces("P06")} veces. Requiere recetas nuevas.`,
  I6: `P07: ${veces("P07")} veces. Solo pide bolsas térmicas.`,
};
const TOTALES = Object.fromEntries(Object.entries(PUNTOS).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0)]));
const NOMBRE_FINAL = (i: Idea) => (i.id === "I3" ? I3_IDEA : i.idea);
const FILAS_MATRIZ = IDEAS.map((i) => [`${i.id} · ${NOMBRE_FINAL(i)}`, ...PUNTOS[i.id].map(String), POR_QUE[i.id]]);
const TOTALES_TXT = IDEAS.map((i) => `${i.id} ${TOTALES[i.id]}`).join(", ");

/* prueba de validación de I3 (criterios fijados por la dueña antes de empezar) */
const EXITO = { conv: "6 de 10", parar: "menos de 3 de 10", lista: "8 personas", paraLista: "menos de 3 personas", plazo: "tres semanas", tope: "$50" };
const CRITERIOS_EXITO = `Éxito: al menos ${EXITO.conv} personas dicen que lo encargarían y ${EXITO.lista} en la lista de espera en ${EXITO.plazo}. Parar si ${EXITO.parar} lo encargarían o ${EXITO.paraLista} en la lista.`;
const PRESUPUESTO = `${EXITO.plazo[0].toUpperCase()}${EXITO.plazo.slice(1)} y ${EXITO.tope} como máximo, sin producir nada nuevo.`;
const PASOS_PLAN = [
  ["1", "Conversar con las 5 personas que mencionaron P01 y con 5 más", `Al menos ${EXITO.conv} dicen que lo encargarían`, `Menos de ${EXITO.parar.replace("menos de ", "")} lo encargarían`],
  ["2", "Preguntar a la autoridad sanitaria de mi zona y a un proveedor certificado qué se necesita para revenderlo", "Tengo por escrito los requisitos y un proveedor", "Los requisitos superan lo que puedo cumplir"],
  ["3", "Abrir una lista de espera sin cobrar mientras se resuelve el paso 2", `${EXITO.lista} en la lista en ${EXITO.plazo}`, `${EXITO.paraLista[0].toUpperCase()}${EXITO.paraLista.slice(1)} en ${EXITO.plazo}`],
  ["4", "Solo si pasan los pasos 1 a 3: un primer encargo, entregado o con el dinero devuelto", "Los clientes reciben lo prometido", "Cualquier duda sobre el producto o su etiquetado"],
];

/* rúbrica */
const CRITERIOS = [
  { id: "origen", label: "Cada idea nace de tu ficha", detail: "Cada idea cita problemas de tu ficha; ninguna sale de la memoria de la IA." },
  { id: "mercado", label: "No inventa datos de mercado", detail: "No da cifras de demanda, tendencias, precios de otros ni tamaños de mercado." },
  { id: "supuestos", label: "Dice qué tendría que ser cierto", detail: "Cada supuesto es comprobable y no se da por hecho." },
  { id: "capacidad", label: "Respeta lo que puedes hacer", detail: "Si una idea exige algo que no tienes, lo dice en «Lo que faltaría»." },
  { id: "prueba", label: "Propone una prueba concreta", detail: "Cada prueba es algo que puedes hacer y contar, con poco costo." },
  { id: "limites", label: "No decide ni promete", detail: "No dice cuál elegir ni asegura ventas, y avisa cuando hay normas por revisar." },
] as const;
const RESULTADOS = [
  { min: 0, label: "No usar todavía", advice: "Fallan varios criterios: corrige con el prompt de ajuste o revisa tu ficha." },
  { min: 7, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado antes de puntuar las ideas." },
  { min: 11, label: "Lista para puntuar", advice: "Cumple casi todo: puntúa las ideas con la matriz." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (t: number) => [...RESULTADOS].reverse().find((r) => t >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { origen: 2, mercado: 2, supuestos: 1, capacidad: 1, prueba: 1, limites: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "ideas-de-nuevos-productos-con-ia",
    category: "analisis",
    title: "Ideas de nuevos productos o servicios con IA",
    description:
      "Genera hipótesis de nuevos productos a partir de problemas reales de tus clientes y aprende a validarlas en el mundo real antes de invertir.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["estrategia-planificacion", "decision-comparacion"],
    estandarGuia: 3,
    usesExternalInfo: true,
    activoOriginal:
      "Ficha de problemas de clientes, matriz de puntuación de cinco criterios, plan y registro de validación copiables, y rúbrica de seis criterios con dos bloqueos",
    problem: "Quieres ofrecer algo nuevo pero no sabes qué proponer ni cómo saber si tendrá demanda antes de invertir.",
    whyThisPage:
      "Trata las ideas de la IA como hipótesis y dedica una parte central de la guía a validarlas fuera de la IA (preventa, prueba pequeña, conversaciones con clientes).",
    relatedGuides: ["analizar-opiniones-de-clientes-con-ia", "investigar-competidores-con-ia", "definir-precios-y-margenes-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Parte de lo que tus clientes ya te dicen, pide hipótesis con su respaldo, puntúalas y diseña una prueba pequeña antes de invertir.",
    difficulty: "Intermedio",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Unas tres horas para armar la ficha y elegir; la prueba lleva semanas",
    needs: ["Un asistente de IA de chat", "Una hoja de cálculo o un documento", "Los problemas que tus clientes te han dicho, anotados", "Lo que puedes producir hoy"],
    result: "Una ficha de problemas, hipótesis de producto puntuadas y un plan de prueba con criterios de éxito fijados antes",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el camino: problemas reales de clientes, hipótesis de producto y una prueba pequeña.",
      description:
        "Tres bloques de izquierda a derecha: frases de clientes con su número de veces, una tabla de hipótesis que cita esos problemas y un plan de prueba con un criterio de éxito. Datos ficticios. Sin logos ni nombres reales.",
      alt: "Frases de clientes, hipótesis de producto que las citan y un plan de prueba con criterios de éxito.",
      caption: "De lo que dicen tus clientes a una prueba pequeña.",
    }),
    ficha: slot("ficha-de-problemas.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Muestra la ficha de problemas de clientes ya armada, con sus palabras, las veces y dónde se dijeron.",
      description:
        "La ficha con siete problemas con un id, la frase del cliente entre comillas, las veces que se repitió y dónde se dijo. Resaltar la columna de veces y una frase textual. Debajo, la capacidad del negocio. Caso ficticio, sin nombres de clientes.",
      alt: "Tabla de problemas de clientes con la frase textual, las veces que se dijo y dónde, junto a la capacidad del negocio.",
      caption: "La ficha: lo que tus clientes ya dijeron.",
      zoom: true,
    }),
    primerResultado: slot("primeras-ideas.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver las primeras hipótesis y localizar las tres celdas que hay que revisar.",
      description:
        "La tabla de seis ideas con tres celdas resaltadas: la idea de las galletas sin gluten, el supuesto «Hay demanda suficiente» y la prueba «Hacer una encuesta». Al lado, la capacidad del negocio. Caso ficticio.",
      alt: "Tabla de seis hipótesis de producto con tres celdas resaltadas junto a la capacidad del negocio.",
      caption: "Las primeras hipótesis, con tres cosas que revisar.",
      zoom: true,
    }),
    contraste: slot("contraste-con-la-ficha.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar cada idea con la ficha de problemas y con la capacidad.",
      description:
        "Cada idea unida por una línea a los problemas que cita y a la capacidad; la de las galletas sin gluten en rojo contra «no hay zona separada». Al lado, la rúbrica puntuada (9 de 12). Caso ficticio.",
      alt: "Ideas de producto conectadas con los problemas de la ficha y con la capacidad, con la rúbrica puntuada.",
      caption: "Cada idea, contra tu ficha y lo que puedes hacer.",
      zoom: true,
    }),
    matriz: slot("matriz-de-decision.webp", {
      section: "comparativa",
      ratio: "16/9",
      purpose: "Muestra las seis ideas puntuadas con la matriz y su porqué.",
      description:
        "La tabla de seis ideas por cinco criterios con la puntuación de cada celda y la columna «Por qué» con los ids de los problemas. Resaltar que el total lo suma la persona. Caso ficticio.",
      alt: "Tabla que puntúa seis ideas de producto en cinco criterios, con el motivo de cada puntuación.",
      caption: "Puntuar cada idea con evidencia.",
      zoom: true,
    }),
    plan: slot("plan-de-validacion.webp", {
      section: "medicion",
      ratio: "16/9",
      purpose: "Muestra el plan de prueba con sus criterios de éxito y de parada, y el registro de resultados vacío.",
      description:
        "La tabla de cuatro pasos con el criterio de éxito y el de parada de cada uno, y debajo un registro de resultados con las columnas vacías. Caso ficticio.",
      alt: "Plan de prueba de cuatro pasos con criterios de éxito y de parada, y un registro de resultados vacío.",
      caption: "Los criterios, fijados antes de la prueba.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "ideas",
      purpose: "Prueba real del prompt de ideas: la tabla de hipótesis, «Con esta ficha no se puede afirmar» y «FALTA».",
      description:
        "Captura de la tabla de hipótesis y de sus apartados finales. Usa la ficha y la capacidad del caso (o las tuyas, sin datos de clientes). Comprueba aparte que no aparece ninguna cifra de mercado. Ocultar datos personales y de cuenta.",
      alt: "Captura de hipótesis de producto devueltas por un asistente a partir de problemas de clientes.",
      caption: "Prueba del prompt de ideas.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description: "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una tabla de hipótesis de producto con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "comparativa",
      ratio: "16/9",
      promptId: "filtro",
      purpose: "Prueba real del prompt de filtro: la tabla de puntuaciones con su porqué.",
      description:
        "Captura de la tabla de puntuaciones y de «FALTA». Usa las ideas corregidas. Comprueba aparte que el asistente no sumó ni ordenó. Ocultar datos personales y de cuenta.",
      alt: "Captura de la puntuación de ideas de producto devuelta por un asistente.",
      caption: "Prueba del prompt de filtro.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "medicion",
      ratio: "16/9",
      promptId: "validacion",
      purpose: "Prueba real del prompt de validación: el plan, el registro de resultados y lo que la prueba no dirá.",
      description:
        "Captura de la tabla del plan, del registro y de «Lo que esta prueba no te dirá». Usa la idea elegida y los criterios de éxito del caso. Comprueba aparte que no propone umbrales propios. Ocultar datos personales y de cuenta.",
      alt: "Captura de un plan de validación de una idea de producto devuelto por un asistente.",
      caption: "Prueba del prompt de validación.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Quieres ofrecer algo nuevo, pero invertir en algo que nadie compra pesa. Casi siempre se empieza por la idea («¿y si hago…?») y no por el problema de un cliente, y se decide por corazonada o por lo que hace otro negocio.\n\nLa IA parece la solución: responde con decenas de ideas, cada una con su justificación de mercado. Esa justificación puede ser inventada («esta categoría está creciendo»), y ninguna idea trae la única prueba que importa: que alguien pague por ella.\n\n**La IA propone hipótesis a partir de lo que tus clientes ya dijeron; el mercado decide con una prueba que tú diseñas y mides.**",
    symptoms: [
      "Tienes ideas, pero no sabes cuál tiene demanda.",
      "Tus clientes te piden cosas, pero no las tienes anotadas ni sabes cuántos las piden.",
      "Le pediste ideas a una IA y no sabes qué parte estaba respaldada.",
      "Te da miedo invertir en algo que nadie comprará.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con una idea elegida con criterios y una prueba pequeña, con sus criterios de éxito fijados antes de empezar.",
    deliverables: [
      { label: "Una ficha de problemas", detail: "Lo que tus clientes dijeron, con sus palabras y las veces." },
      { label: "Hipótesis de producto puntuadas", detail: "Cada una con su respaldo en la ficha y su puntuación." },
      { label: "Un plan de validación", detail: "Con criterios de éxito y de parada fijados por ti y un registro de resultados." },
      { label: "Una rúbrica de seis criterios", detail: "Para revisar cualquier lista de ideas de una IA." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes un negocio con clientes reales y quieres ofrecer algo nuevo.",
      "Puedes anotar lo que tus clientes te dicen durante unas semanas.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Quieres que la IA te diga qué producto tendrá éxito: aquí solo propone hipótesis.",
      "Aún no tienes clientes ni conversaciones con ellos: primero conócelos.",
      "Tu idea afecta la salud o la seguridad de personas y buscas asesoría: consulta a quien corresponda.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: NEGOCIO,
    situation:
      "La Espiga anotó durante siete semanas lo que sus clientes le decían en el mostrador y por WhatsApp. Quiere ofrecer algo nuevo, y la dueña tiene especial interés en algo sin gluten. Todo es inventado.",
    goal: DECISION_CASO + ", con una prueba pequeña y sin invertir en producción.",
    data: [
      { label: "Lo que dijeron los clientes", value: `${PROBLEMAS.length} problemas, de 3 a 9 veces cada uno` },
      { label: "Capacidad", value: CAPACIDAD },
      { label: "Lo que no sabe", value: "Cuántos pagarían por una idea nueva ni cuánto cuesta producirla" },
    ],
    problem: "Tiene ideas, pero no sabe cuál merece una prueba, y una IA le dio datos de mercado que no pudo comprobar.",
    application: "Ordena lo que dijeron sus clientes, pide hipótesis, las corrige, las puntúa, elige una y diseña una prueba con criterios fijados antes.",
    result: "Una idea elegida con criterios y un plan de prueba con criterios de éxito y de parada; la prueba aún no se hizo.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan el camino de la idea a la prueba.",
    blocks: [
      {
        title: "Se parte del problema, no de la idea",
        detail: "Cada hipótesis cita lo que tus clientes ya dijeron, con sus palabras y las veces; sin eso, es una corazonada.",
      },
      {
        title: "Una idea es una hipótesis",
        detail: "Dice qué tendría que ser cierto para que valga la pena. Hasta comprobarlo con personas, no se sabe.",
        example: "«Los clientes que piden pan para la semana lo preferirían a comprar cada día» es un supuesto por comprobar.",
      },
      {
        title: "Necesitar algo no es poder hacerlo",
        detail: "Un problema repetido no vale si no puedes resolverlo con lo que tienes, o si arriesga la salud de alguien.",
      },
      {
        title: "Los criterios se fijan antes de la prueba",
        detail: "Decide qué resultado te haría seguir y cuál parar antes de empezar: después, es fácil cambiar la vara.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Dame ideas de nuevos productos para mi panadería y dime cuáles tendrán éxito.",
    whyInsufficient:
      "La IA no conoce a tus clientes, tu cocina ni tus costos, y responde igual, con seguridad: sale una lista con justificaciones de mercado que suenan bien y no vienen de ninguna fuente.",
    issues: [
      "No aporta ningún problema real de tus clientes: la IA inventa la necesidad.",
      "No dice lo que puedes producir.",
      "Pide un pronóstico de éxito que ninguna IA puede comprobar.",
      "No incluye ninguna forma de probar las ideas.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Antes de abrir la IA, reúne tres cosas.",
    items: [
      { label: "Lo que tus clientes dicen", detail: "Frases textuales de mostrador, mensajes, quejas y pedidos, con las veces que se repiten y dónde las oíste.", required: true },
      { label: "Tu capacidad", detail: "Tus recursos y tus límites: equipos, personas, tiempo y lo que no tienes.", required: true },
      { label: "Lo que quieres decidir", detail: "Qué vas a decidir con esto. Sin decisión, cualquier idea parece buena.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribe la IA y lo que dice tu ficha",
      purpose: "Ver cómo un pedido sin ficha produce datos y promesas sin respaldo.",
      columns: ["Frase de la IA", "Lo que dice tu ficha"],
      rows: [
        ["«El pan sin gluten está creciendo mucho en tu zona.»", "No hay ninguna fuente: es una afirmación de mercado inventada."],
        ["«Tus clientes quieren pan de masa madre.»", "Ningún cliente lo mencionó en tu ficha."],
        ["«La caja semanal tendrá éxito seguro.»", "Ninguna idea tiene éxito seguro: solo una prueba lo dice."],
        ["«Vende galletas sin gluten hechas en tu cocina.»", "Tu cocina no tiene zona separada y pueden aplicar normas."],
      ],
      note: "Ejemplo ilustrativo.",
    },
    problemas: {
      caption: "Ficha de problemas de clientes",
      purpose: "Tener lo que dijeron tus clientes, con sus palabras, las veces y dónde.",
      columns: ["ID", "Problema, con las palabras del cliente", "Veces", "Dónde lo oí"],
      rows: PROBLEMAS.map((p) => [p[0], p[1], String(p[2]), p[3]]),
      copyable: true,
      note: "Caso ficticio. Anota lo que dijeron, no lo que interpretas.",
    },
    matriz: {
      caption: "Matriz de puntuación de ideas",
      purpose: "Puntuar cada idea con los mismos cinco criterios.",
      columns: ["Criterio", "Qué mide", "2 puntos", "1 punto", "0 puntos"],
      rows: MATRIZ.map((m) => [m.label, m.mide, m.dos, m.uno, m.cero]),
      copyable: true,
    },
    puntuacion: {
      caption: "Ideas puntuadas con la matriz",
      purpose: "Ver la puntuación de cada idea con la evidencia en que se apoya.",
      columns: ["Idea", "Necesidad", "Capacidad", "Riesgo", "Margen", "Prueba", "Por qué (evidencia)"],
      rows: FILAS_MATRIZ,
      note: `Ejemplo generado con el prompt de filtro. Los totales los sumas tú (${TOTALES_TXT}).`,
    },
    plan: {
      caption: "Plan de validación de la idea I3",
      purpose: "Ver una prueba pequeña con sus criterios de éxito y de parada, fijados por ti.",
      columns: ["Paso", "Qué hacer", "Criterio de éxito", "Criterio para parar"],
      rows: PASOS_PLAN,
      copyable: true,
      note: "Ejemplo generado con el prompt de validación.",
    },
    registro: {
      caption: "Registro de resultados",
      purpose: "Anotar lo que pasó, comparado con el criterio fijado antes.",
      columns: ["Paso", "Criterio fijado antes", "Resultado", "¿Se cumplió?"],
      rows: [
        ["1", `Al menos ${EXITO.conv} lo encargarían`, "—", "—"],
        ["3", `${EXITO.lista} en la lista en ${EXITO.plazo}`, "—", "—"],
      ],
      copyable: true,
      note: "Plantilla sin rellenar («—»): la prueba del caso no se ha realizado, así que no hay resultados.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Cuatro de los siete pasos llevan un prompt. Los otros tres los haces tú solo.",
    steps: [
      { title: "Junta lo que dicen tus clientes", description: "Anota, durante unas semanas, sus frases textuales, las veces y dónde las oíste, y escribe lo que puedes hacer hoy.", output: "Una ficha de problemas y tu capacidad." },
      { title: "Pide las hipótesis de producto", description: "Entrega la ficha y tu capacidad, y pide ideas que citen los problemas y digan qué tendría que ser cierto.", output: "Una tabla de hipótesis." },
      { title: "Contrasta y corrige", description: "Comprueba cada idea contra la ficha y tu capacidad, puntúa con la rúbrica y pide cambiar solo lo señalado.", output: "Una tabla corregida." },
      { title: "Puntúa las ideas", description: "Pide la puntuación con la matriz, con su evidencia, y suma tú los totales.", output: "Ideas puntuadas." },
      { title: "Elige una y pide el plan de validación", description: "Decide cuál probar y fija tus criterios de éxito y de parada antes de pedir el plan.", output: "Un plan de prueba." },
      { title: "Haz la prueba", description: "Ejecuta el plan con personas reales y anota los resultados sin cambiar los criterios.", output: "Un registro de resultados." },
      { title: "Decide con lo que pasó", description: "Compara los resultados con lo que fijaste y decide si seguir, cambiar o parar.", output: "Una decisión tuya." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    ideas: {
      title: "Prompt de ideas: hipótesis de producto desde problemas reales",
      objective: "Obtener hipótesis de producto que citen los problemas de tu ficha, con lo que tendría que ser cierto y una forma de probarlas, sin datos de mercado.",
      whenToUse: "Cuando tienes escritas tu ficha y tu capacidad.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: NEGOCIO },
        { name: "CAPACIDAD", description: "Tu capacidad y sus límites.", example: CAPACIDAD },
        { name: "PROBLEMAS", description: "Tu ficha de problemas, con sus ids.", example: "P01 «Mi hijo no puede comer gluten…» · 5 veces · Mostrador" },
      ],
      prompt: `Actúa como asistente que ayuda a un negocio pequeño a formular hipótesis de nuevos productos. Tu destinatario es la persona dueña, que probará con clientes reales lo que propongas. Tu objetivo es proponer hipótesis que nazcan de los problemas de su ficha, no vender ideas ni pronosticar éxito.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Lo que puedo hacer hoy y lo que no tengo: {{CAPACIDAD}}

### DATOS (única fuente)
Problemas que dijeron mis clientes:
{{PROBLEMAS}}

### REGLAS
1. Propón exactamente seis hipótesis. Cada una resuelve uno o más problemas de mi ficha y cita sus ids.
2. No des ningún dato de mercado: ni demanda, ni tendencias, ni tamaños, ni precios de otros negocios, ni lo que hace la competencia. Lo que sepas por tu entrenamiento no se usa.
3. Cada hipótesis dice qué tendría que ser cierto para que valga la pena, escrito como una condición que se pueda comprobar, no como un hecho.
4. Ten en cuenta lo que puedo hacer hoy. Si una idea exige algo que no tengo, dilo en «Lo que faltaría».
5. Cada hipótesis propone una prueba concreta y barata que yo pueda hacer con personas reales y contar.
6. No recomiendes cuál elegir, no des precios ni proyecciones y no prometas resultados.
7. Si una idea afecta la salud o la seguridad de las personas, escribe «Requiere revisar normas» y no des consejos legales ni sanitarios.
8. Si mi ficha no basta para una hipótesis, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: ${COL_IDEAS.join(" | ")}; (2) «Con esta ficha no se puede afirmar»; (3) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: hay seis hipótesis con sus ids; cada una cita problemas de mi ficha; no hay ningún dato de mercado; cada supuesto se puede comprobar; las carencias frente a mi capacidad están en «Lo que faltaría»; cada prueba es concreta; no hay recomendaciones. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cada una resuelve uno o más problemas de mi ficha y cita sus ids.",
          why: "Ancla cada idea a algo que tus clientes dijeron y te deja comprobar el origen.",
        },
        {
          part: "No des ningún dato de mercado",
          why: "Es donde una IA suele inventar: demanda, crecimiento o precios de otros negocios que no puede comprobar.",
        },
        {
          part: "escrito como una condición que se pueda comprobar, no como un hecho.",
          why: "Convierte cada idea en algo que una prueba puede confirmar o descartar.",
        },
      ],
      evaluate: "Comprueba que cada idea cita tu ficha y que ninguna trae cifras de mercado.",
      improve: "Si aparece un dato de mercado, pídele que lo quite y rehaga solo esa fila.",
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente las celdas señaladas, apoyándose en tu ficha y tu capacidad, y dejar el resto intacto.",
      whenToUse: "Después de contrastar, cuando la tabla de ideas tiene un problema.",
      variables: [
        { name: "PROBLEMAS_DETECTADOS", description: "Lo que hay que corregir y por qué.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Lo que no puede cambiar.", example: "Las ideas I1, I2 e I6, y los ids" },
      ],
      prompt: `Actúa como editor de hipótesis de producto para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo señalado, usando mi ficha y mi capacidad, y dejar intacto lo demás.

### CONTEXTO
Usa la ficha, mi capacidad y la tabla de esta conversación. Si falta alguna, pídemela antes de seguir.

### DATOS
Problemas que detecté:
{{PROBLEMAS_DETECTADOS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo lo señalado y lo que ese cambio obligue a ajustar.
2. Cada cambio se apoya en mi ficha o en mi capacidad. No añadas datos de mercado ni problemas que no estén en mi ficha.
3. Si un problema que te señalé no existe en la tabla, o mi ficha y mi capacidad se contradicen, dímelo antes de cambiar nada.
4. En «Motivo» cita el problema de la ficha o la parte de mi capacidad que justifica el cambio.
5. No recomiendes cuál elegir. Si falta un dato, escribe [FALTA: qué dato] en lugar de inventarlo.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla de columnas fijas: Antes | Después | Motivo; (2) «Sin cambios»: lo que no toqué; (3) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada cambio cita su problema o su capacidad; las filas que no se pueden tocar están idénticas; no hay datos de mercado ni recomendaciones. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo lo señalado",
          why: "Evita que rehaga las ideas que ya estaban bien respaldadas.",
        },
        {
          part: "En «Motivo» cita el problema de la ficha o la parte de mi capacidad",
          why: "Cada corrección queda con su respaldo y puedes comprobarla.",
        },
        {
          part: "escribe [FALTA: qué dato] en lugar de inventarlo",
          why: "Un hueco marcado se ve y se completa; un dato inventado pasa inadvertido.",
        },
      ],
      evaluate: "Compara con la tabla anterior: solo deben cambiar las celdas señaladas.",
      improve: "Si toca una idea que no señalaste, pide repetir solo lo señalado.",
    },

    filtro: {
      title: "Prompt de filtro: puntuar las ideas con la matriz, con su evidencia",
      objective: "Obtener una puntuación de cada idea en los cinco criterios de la matriz, con la evidencia que la respalda, sin sumar ni recomendar.",
      whenToUse: "Cuando tienes las ideas corregidas y quieres compararlas con los mismos criterios.",
      variables: [
        { name: "IDEAS", description: "Tu tabla de ideas corregida.", example: "La tabla con sus seis hipótesis" },
        { name: "PROBLEMAS", description: "Tu ficha de problemas.", example: "P01 «Mi hijo no puede comer gluten…» · 5 veces" },
        { name: "CAPACIDAD", description: "Lo que puedes hacer hoy y lo que no tienes.", example: CAPACIDAD },
      ],
      prompt: `Actúa como analista que puntúa hipótesis de producto para un negocio pequeño. Tu destinatario es la persona dueña, que sumará y decidirá. Tu objetivo es puntuar cada idea con la matriz, citando la evidencia, sin elegir por ella.

### CONTEXTO
Mi capacidad: {{CAPACIDAD}}

### DATOS (única fuente)
Ideas:
{{IDEAS}}

Problemas que dijeron mis clientes:
{{PROBLEMAS}}

### MATRIZ (cada criterio va de 0 a 2)
${LISTA_MATRIZ}

### REGLAS
1. Puntúa cada idea en los cinco criterios, con un 0, un 1 o un 2 según la matriz.
2. Cada puntuación se apoya en evidencia: problemas de mi ficha con sus veces, o mi capacidad. No uses datos de mercado ni lo que sepas de otros negocios.
3. Si falta un dato para un criterio, como los costos, pon 1 y dilo en «Por qué». No lo supongas.
4. No sumes, no ordenes y no digas cuál conviene probar: eso lo hago yo.
5. Si una idea afecta la salud o la seguridad de las personas, el riesgo es como máximo 1 y anotas «Requiere revisar normas».
6. Si falta información para puntuar una idea, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: Idea | Necesidad | Capacidad | Riesgo | Margen | Prueba | Por qué (evidencia); (2) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: cada idea tiene cinco puntuaciones de 0 a 2; cada «Por qué» cita ids o mi capacidad; no hay sumas, orden ni recomendaciones; el riesgo de las ideas de salud no pasa de 1; lo que falta está marcado. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cada puntuación se apoya en evidencia",
          why: "Una puntuación sin respaldo es una opinión; con el id de la ficha, puedes discutirla y corregirla.",
        },
        {
          part: "No sumes, no ordenes y no digas cuál conviene probar",
          why: "Evita que la IA elija por ti: el total y la decisión son tuyos.",
        },
        {
          part: "Si falta un dato para un criterio, como los costos, pon 1 y dilo",
          why: "Un dato ausente no se convierte en una buena o una mala nota inventada.",
        },
      ],
      evaluate: "Comprueba que cada «Por qué» cita ids que existen y que la IA no sumó ni ordenó.",
      improve: "Si suma u ordena, pídele que repita solo la tabla, sin totales.",
    },

    validacion: {
      title: "Prompt de validación: una prueba pequeña con criterios que fijas tú",
      objective: "Obtener un plan de prueba con personas reales, con tus criterios de éxito y de parada, sin que la IA proponga umbrales ni cobre nada antes de tiempo.",
      whenToUse: "Cuando elegiste una idea y ya fijaste tus criterios de éxito y de parada.",
      variables: [
        { name: "IDEA", description: "La idea elegida, con lo que tendría que ser cierto.", example: `${I3_IDEA}. Tendría que ser cierto: ${I3.cierto.toLowerCase()}` },
        { name: "CRITERIOS_DE_EXITO", description: "Lo que tú decidiste que significa éxito y parar.", example: CRITERIOS_EXITO },
        { name: "PRESUPUESTO_Y_PLAZO", description: "Cuánto tiempo y dinero puedes gastar.", example: PRESUPUESTO },
      ],
      prompt: `Actúa como asistente que diseña pruebas pequeñas de nuevos productos para un negocio pequeño. Tu destinatario es la persona dueña, que hará la prueba con personas reales. Tu objetivo es un plan de prueba con los criterios que yo fijé, sin proponer umbrales propios.

### CONTEXTO
Idea a probar: {{IDEA}}
Presupuesto y plazo: {{PRESUPUESTO_Y_PLAZO}}

### DATOS (única fuente)
Mis criterios de éxito y de parada, fijados antes de la prueba:
{{CRITERIOS_DE_EXITO}}

### REGLAS
1. Propón como máximo cuatro pasos, que quepan en mi presupuesto y mi plazo.
2. Usa solo mis criterios de éxito y de parada. No inventes umbrales: si un paso no tiene criterio mío, escribe [FALTA: criterio].
3. La prueba es con personas reales y produce algo que se pueda contar.
4. No propongas cobrar ni prometer nada antes de saber que puedo entregarlo. Si la idea afecta la salud o la seguridad de las personas, el primer paso es comprobar los requisitos con quien corresponde, sin darme consejos legales ni sanitarios.
5. No propongas publicidad engañosa ni hacerte pasar por otra persona.
6. Di lo que esta prueba no me dirá. No prometas resultados.

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: Paso | Qué hacer | Criterio de éxito | Criterio para parar; (2) «Registro de resultados»: una tabla vacía de columnas Paso | Criterio fijado antes | Resultado | ¿Se cumplió?; (3) «Lo que esta prueba no te dirá»; (4) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: hay como máximo cuatro pasos; cada criterio es mío y no inventaste ninguno; ningún paso cobra o promete antes de poder entregar; la prueba cabe en el presupuesto y el plazo; el registro está vacío. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Usa solo mis criterios de éxito y de parada.",
          why: "Fija de antemano qué resultado te hace seguir y cuál te hace parar; un umbral de la IA sería otra opinión.",
        },
        {
          part: "No propongas cobrar ni prometer nada antes de saber que puedo entregarlo.",
          why: "Evita una preventa que no puedas cumplir, que sería una promesa falsa a tus clientes.",
        },
        {
          part: "Di lo que esta prueba no me dirá.",
          why: "Una prueba pequeña responde una sola pregunta; nombrar el resto evita leer de más.",
        },
      ],
      evaluate: "Comprueba que los criterios son los tuyos y que ningún paso cobra antes de poder entregar.",
      improve: "Si propone un umbral propio, pídele que lo sustituya por el tuyo o lo deje en [FALTA].",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de ideas al caso. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Primeras hipótesis de producto, tal como llegan",
          purpose: "Tener las hipótesis en el formato del prompt para contrastarlas con la ficha.",
          columns: COL_IDEAS,
          rows: IDEAS.map(fila),
        },
      },
      { type: "text", text: `**Con esta ficha no se puede afirmar:** cuántos clientes pagarían por cada idea ni cuánto cuesta producirla. **FALTA:** los costos de producción.` },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "ideas",
    title: "Puntúa una lista de ideas de la IA",
    intro:
      `Puntúa la lista en los seis criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      `La tabla parece completa: seis ideas con sus ids, sus supuestos y su prueba. Se contrasta con la ficha y con tu capacidad y se puntúa con la rúbrica: ` +
      `el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      { criterionId: "origen", verdict: vered("origen"), comment: "Cada idea cita problemas que existen en la ficha." },
      { criterionId: "mercado", verdict: vered("mercado"), comment: "No hay ninguna cifra de demanda, tendencia ni precio de otros." },
      { criterionId: "supuestos", verdict: vered("supuestos"), comment: "El supuesto de I4 («Hay demanda suficiente») no dice qué bastaría; los demás se pueden comprobar." },
      {
        criterionId: "capacidad",
        verdict: vered("capacidad"),
        comment: "I3 propone hacer galletas sin gluten en la cocina y en «Lo que faltaría» pone harinas, recetas y las normas, pero omite que no hay zona separada.",
      },
      { criterionId: "prueba", verdict: vered("prueba"), comment: "«Hacer una encuesta» (I5) no dice a quién ni qué preguntar; las demás se pueden contar." },
      { criterionId: "limites", verdict: vered("limites"), comment: "Nombra lo que no se puede afirmar y no recomienda cuál elegir, como pide el prompt." },
    ],
    conclusion: "Es una buena base: no inventa mercado y todas las ideas nacen de la ficha. El fallo más serio es el de I3, porque toca la seguridad de personas.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir tres cosas, no pedir otra lista.",
    promptId: "ajuste",
    why: "El contraste señaló tres cosas. El prompt limita el cambio a lo señalado, exige citar la ficha o tu capacidad y separa lo cambiado de lo que sigue igual.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de ajuste con los datos del ejemplo. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Cambios del ajuste",
          purpose: "Comprobar qué celdas cambiaron y por qué.",
          columns: ["Antes", "Después", "Motivo"],
          rows: CAMBIOS,
        },
      },
      { type: "text", text: "**Sin cambios:** I1, I2 e I6 y los ids de la ficha. **FALTA:** ninguno." },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Empezar por la idea y no por el problema",
      whyItHurts: "Sin un problema detrás, la idea es una corazonada y probarla cuesta igual.",
      instead: "Empieza anotando lo que dicen tus clientes: sus frases y cuántas veces.",
    },
    {
      title: "Creer los datos de mercado que da la IA",
      whyItHurts: "Una demanda inventada puede llevarte a invertir en lo que nadie compra.",
      instead: "Trata todo dato de mercado como inexistente hasta que salga de tu ficha o tu prueba.",
    },
    {
      title: "Puntuar por entusiasmo",
      whyItHurts: "Con las ideas propias, un 2 es fácil de dar; sin evidencia, la matriz confirma lo que ya querías.",
      instead: "Cada puntuación cita un problema de la ficha o tu capacidad.",
    },
    {
      title: "Invertir antes de probar",
      whyItHurts: "Comprar equipos o producir antes de que alguien lo pida convierte una duda en una pérdida.",
      instead: "Haz una prueba pequeña con personas reales antes de gastar.",
    },
    {
      title: "Cambiar el criterio de éxito después",
      whyItHurts: "Con el resultado delante, es fácil decidir que «6 de 10» siempre fue «4 de 10».",
      instead: "Escribe ambos criterios antes de empezar y no los toques.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de invertir, marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Cada idea cita problemas que están en mi ficha." },
      { label: "Ninguna cifra de mercado salió de la IA." },
      { label: "Cada supuesto es comprobable y sé qué resultado lo confirmaría o descartaría." },
      { label: "Fijé mis criterios de éxito y de parada antes de empezar la prueba." },
      { label: "Sumé yo las puntuaciones y decidí yo cuál probar." },
      { label: "No cobré ni prometí nada antes de saber que puedo entregarlo." },
      { label: "Si la idea afecta la salud o la seguridad de las personas, revisé las normas de mi país con quien corresponde.", detail: "Esta guía no da asesoría legal ni sanitaria." },
    ],
    principle: "La IA propone hipótesis; el mercado decide. Lo que se prueba, lo que se paga y lo que se promete lo decides tú.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la prueba hecha, se trata de aprender de ella y repetir.",
    steps: [
      { title: "Guarda el registro de resultados", detail: "Con la fecha y los criterios como los fijaste: servirá para la próxima idea." },
      { title: "Devuelve lo aprendido a la ficha", detail: "Las objeciones que oíste son problemas nuevos: anótalos." },
      { title: "Actualiza la ficha cada cierto tiempo", detail: "Lo que piden tus clientes cambia con la temporada y con lo que ofreces." },
      { title: "Descarta sin culpa", detail: "Una idea que no pasa la prueba te ahorró una inversión." },
      { title: "Repite con la siguiente idea", detail: "La matriz y el plan ya están hechos: cambian la idea y los criterios." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método reduce el riesgo de invertir a ciegas, con límites claros.",
    items: [
      { title: "La ficha solo recoge a quienes te hablan", detail: "Los clientes callados, y quienes aún no lo son, no aparecen." },
      { title: "Una prueba pequeña no asegura ventas a escala", detail: "Confirma un interés inicial; cuánto se venderá después es otra pregunta." },
      { title: "Con pocas conversaciones no hay estadística", detail: "Diez respuestas sirven para decidir, no para medir un mercado." },
      { title: "No da asesoría legal ni sanitaria", detail: "Si la idea afecta la salud o la seguridad, las normas de tu país pueden exigir requisitos que esta guía no cubre." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Una idea se vuelve una decisión en tres pasos: nace de un problema que tus clientes ya dijeron, se puntúa con evidencia y se prueba pequeña, con criterios fijados antes. La IA acelera los dos primeros; el tercero lo hace la realidad.",
    takeaways: [
      "Parte de lo que tus clientes dicen, con sus palabras y las veces.",
      "Trata cada idea como una hipótesis con algo que tendría que ser cierto.",
      "Fija tus criterios de éxito y de parada antes de probar.",
      "Prueba pequeño, con personas reales, antes de invertir.",
    ],
    nextGuide: "definir-precios-y-margenes-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "hipotesis", "validacion", "preventa", "rubrica"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Cuántos problemas necesito en la ficha?",
      answer: "No hay una cifra fija. Importa que sean frases reales, con sus veces.",
    },
    {
      question: "¿Puedo pedirle ideas a la IA sin la ficha?",
      answer: "Puedes, pero las ideas no tendrán un problema detrás ni fuente para sus justificaciones: trátalas como una lluvia de ideas.",
    },
    {
      question: "¿Y si todas las ideas puntúan bajo?",
      answer: "Es información útil. Vuelve a la ficha: quizá falten problemas, o lo que piden tus clientes no cabe en lo que puedes hacer hoy.",
    },
    {
      question: "¿Puedo abrir una preventa en mi país?",
      answer: "Depende de las normas de tu país y de lo que prometas. Antes de cobrar, asegúrate de poder entregar o devolver el dinero.",
    },
  ],
});
