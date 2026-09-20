import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * clientes/analizar-opiniones-de-clientes-con-ia
 *
 * Tipo: números y datos + tema sensible (datos personales) (`handlesNumbers`). Todo el caso (el Restaurante
 * La Higuera y sus 25 reseñas) es FICTICIO: las reseñas las redactó el autor de la guía para practicar y no
 * proceden de ningún cliente real. Cada conteo se calcula en este archivo a partir de la codificación de las
 * reseñas y se verificó con código aparte, evaluando las fórmulas de la hoja tal como se pegan (ver README.md).
 * Las respuestas de la IA son EJEMPLOS GENERADOS: están redactadas aplicando literalmente cada prompt al caso; no
 * proceden de una conversación real ni de una prueba del autor. Las pruebas reales viven en `evidence.pruebas`,
 * que solo rellena el autor. El error del pedido ingenuo (un conteo y una cita equivocados) es ILUSTRATIVO.
 *
 * Fuente única de verdad: las reseñas (RESENAS, con su codificación y su cita), los temas (LIBRO), las cuentas
 * (CUENTAS), los criterios (CRITERIOS), los umbrales (RESULTADOS), los puntajes (PUNTAJES) y las correcciones (CORRECCIONES)
 * se definen UNA vez y los leen la hoja, las tablas, los ejemplos, la rúbrica y los prompts.
 */
const slot = guideSlots("clientes", "analizar-opiniones-de-clientes-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const TEMAS = { C: "Comida", S: "Servicio", E: "Espera", P: "Precio", A: "Ambiente", R: "Reservas" } as const;
type Cod = keyof typeof TEMAS;
const VALENCIA = { "+": "Positiva", "-": "Negativa" } as const;
type Val = keyof typeof VALENCIA;
type Mencion = [Cod, Val];
const menciones = (m: string): Mencion[] => (m.match(/[A-Z][+-]/g) ?? []).map((x) => [x[0] as Cod, x[1] as Val]);

/** Reseñas ficticias. `m` = codificación final (tema y valencia de cada mención); `cita` = fragmento literal. */
const RESENAS: { id: string; texto: string; m: string; cita: string }[] = [
  { id: "R01", texto: "La pasta estaba deliciosa y las porciones son generosas.", m: "C+", cita: "La pasta estaba deliciosa" },
  { id: "R02", texto: "Esperamos casi una hora por los platos, aunque el mesero fue muy amable.", m: "E-S+", cita: "Esperamos casi una hora por los platos" },
  { id: "R03", texto: "Muy caro para lo que sirven, la porción era pequeña.", m: "P-C-", cita: "Muy caro para lo que sirven" },
  { id: "R04", texto: "Ambiente tranquilo y limpio, ideal para ir en familia.", m: "A+", cita: "Ambiente tranquilo y limpio" },
  { id: "R05", texto: "Llamé para reservar y nadie contestó en toda la tarde.", m: "R-", cita: "nadie contestó en toda la tarde" },
  { id: "R06", texto: "El mesero se equivocó con el pedido y los platos tardaron en llegar.", m: "S-E-", cita: "se equivocó con el pedido" },
  { id: "R07", texto: "Excelente sabor, volveré pronto.", m: "C+", cita: "Excelente sabor" },
  { id: "R08", texto: "Buen precio y el postre casero es una maravilla.", m: "P+C+", cita: "Buen precio" },
  { id: "R09", texto: "Había mucho ruido y la música muy fuerte para conversar.", m: "A-", cita: "la música muy fuerte" },
  { id: "R10", texto: "Tardaron cuarenta minutos en traer la cuenta.", m: "E-", cita: "cuarenta minutos en traer la cuenta" },
  { id: "R11", texto: "La atención de la señora del mostrador fue excelente.", m: "S+", cita: "La atención de la señora del mostrador" },
  { id: "R12", texto: "Reservar por la web fue fácil y rápido.", m: "R+", cita: "Reservar por la web fue fácil" },
  { id: "R13", texto: "La sopa llegó fría y el pan estaba duro.", m: "C-", cita: "La sopa llegó fría" },
  { id: "R14", texto: "Precios razonables, pero el local necesita una pintura.", m: "P+A-", cita: "Precios razonables" },
  { id: "R15", texto: "Mucha espera un sábado, pero valió la pena por la comida.", m: "E-C+", cita: "Mucha espera un sábado" },
  { id: "R16", texto: "Nos atendieron con mucha paciencia a pesar de ser un grupo grande.", m: "S+", cita: "Nos atendieron con mucha paciencia" },
  { id: "R17", texto: "Los baños estaban sucios.", m: "A-", cita: "Los baños estaban sucios" },
  { id: "R18", texto: "Reservamos una mesa y al llegar no había ninguna lista.", m: "R-", cita: "no había ninguna lista" },
  { id: "R19", texto: "La carne en su punto y el personal siempre atento.", m: "C+S+", cita: "La carne en su punto" },
  { id: "R20", texto: "Tardaron mucho en tomar el pedido.", m: "E-", cita: "Tardaron mucho en tomar el pedido" },
  { id: "R21", texto: "Me parece caro el menú del día.", m: "P-", cita: "caro el menú del día" },
  { id: "R22", texto: "Un lugar acogedor y bien decorado.", m: "A+", cita: "acogedor y bien decorado" },
  { id: "R23", texto: "El mesero fue grosero cuando pedimos cambiar de mesa.", m: "S-", cita: "fue grosero" },
  { id: "R24", texto: "Los platos salen rápido y todo llega caliente.", m: "E+C+", cita: "salen rápido" },
  { id: "R25", texto: "Faltó variedad de platos vegetarianos.", m: "C-", cita: "Faltó variedad de platos vegetarianos" },
];
const N = RESENAS.length;
const res = (id: string) => RESENAS.find((r) => r.id === id)!;

/** Lo que la IA codifica distinto de la lectura final: tres errores del primer resultado. */
const IA_M: Record<string, string> = { R06: "S-", R18: "S-", R15: "E+C+" };
const mIA = (r: { id: string; m: string }) => IA_M[r.id] ?? r.m;

const describe = (m: string) => menciones(m).map(([t, v]) => `${TEMAS[t]} (${VALENCIA[v]})`).join(" + ");
const fila = (r: { id: string; m: string; cita: string }, m: string) => {
  const [a, b] = menciones(m);
  return [r.id, TEMAS[a[0]], VALENCIA[a[1]], b ? TEMAS[b[0]] : "—", b ? VALENCIA[b[1]] : "—", r.cita];
};

const conteos = (getM: (r: { id: string; m: string }) => string) => {
  const c = Object.fromEntries((Object.keys(TEMAS) as Cod[]).map((k) => [k, { men: 0, pos: 0, neg: 0 }])) as Record<Cod, { men: number; pos: number; neg: number }>;
  for (const r of RESENAS) for (const [t, v] of menciones(getM(r))) { c[t].men++; if (v === "+") c[t].pos++; else c[t].neg++; }
  return c;
};
const CONT_FINAL = conteos((r) => r.m);
const CONT_IA = conteos(mIA);
const sumar = (c: typeof CONT_FINAL, k: "men" | "pos" | "neg") => (Object.keys(TEMAS) as Cod[]).reduce((n, t) => n + c[t][k], 0);
const TOTAL_MEN = sumar(CONT_FINAL, "men");
const DOS_TEMAS = RESENAS.filter((r) => menciones(r.m).length === 2).length;
const idsDe = (t: Cod, v: Val) => RESENAS.filter((r) => menciones(r.m).some(([x, y]) => x === t && y === v)).map((r) => r.id);

/* el pedido ingenuo */
const ESPERA_INGENUO = 8;
const PCT = (n: number) => `${Math.round((n / N) * 100)} %`;
const CITA_INGENUA = "Tardaron más de cuarenta minutos en la cuenta";

/* libro de códigos */
const LIBRO: [tema: string, incluye: string, noIncluye: string][] = [
  ["Comida", "Sabor, temperatura, variedad y porciones de los platos.", "El precio (Precio) y lo que tardan (Espera)."],
  ["Servicio", "Trato del personal: amabilidad, errores al tomar el pedido.", "Cuánto tardan (Espera) y el proceso de reservar (Reservas)."],
  ["Espera", "Tiempo hasta ser atendido, recibir los platos o pagar.", "El trato del personal (Servicio)."],
  ["Precio", "Lo que cuesta y si vale lo que cuesta.", "Las porciones (Comida)."],
  ["Ambiente", "Local, ruido, música, limpieza y decoración.", "El trato del personal (Servicio)."],
  ["Reservas", "Reservar y encontrar la mesa lista al llegar.", "El trato del personal (Servicio)."],
];

/* cuentas de la hoja y fórmulas */
const CUENTAS = [
  "Cita verificada: «Sí» si la cita aparece dentro de la reseña y «No» si no aparece.",
  "Menciones de un tema: filas donde el tema aparece en «Tema 1» más filas donde aparece en «Tema 2».",
  "Menciones positivas: menciones del tema con valencia «Positiva», en la primera o en la segunda columna.",
  "Menciones negativas: menciones del tema con valencia «Negativa», en la primera o en la segunda columna.",
  "Total de menciones: la suma de las menciones de todos los temas.",
  "Citas no encontradas: cuántas filas dicen «No» en «Cita verificada».",
] as const;
const LISTA_CUENTAS = CUENTAS.map((c, i) => `${i + 1}. ${c}`).join("\n");
const ULT = N + 1;
const rng = (col: string) => `$${col}$2:$${col}$${ULT}`;
const fK = (n: number, en: boolean) => {
  const [ci, sep] = en ? ["COUNTIF", ","] : ["CONTAR.SI", ";"];
  return `=${ci}(${rng("C")}${sep}J${n})+${ci}(${rng("E")}${sep}J${n})`;
};
const fV = (n: number, val: string, en: boolean) => {
  const [ci, sep] = en ? ["COUNTIFS", ","] : ["CONTAR.SI.CONJUNTO", ";"];
  return `=${ci}(${rng("C")}${sep}J${n}${sep}${rng("D")}${sep}"${val}")+${ci}(${rng("E")}${sep}J${n}${sep}${rng("F")}${sep}"${val}")`;
};
const FORMULAS: { celda: string; cuenta: number; es: string; en: string; prueba: string }[] = [
  { celda: "H2", cuenta: 0, es: '=SI(ESNUMERO(ENCONTRAR(G2;B2));"Sí";"No")', en: '=IF(ISNUMBER(FIND(G2,B2)),"Sí","No")', prueba: "Reseña «La sopa llegó fría»: con la cita «sopa llegó fría», Sí; con «sopa caliente», No" },
  { celda: "K2", cuenta: 1, es: fK(2, false), en: fK(2, true), prueba: "Comida en 2 filas de C y 1 de E: 3" },
  { celda: "L2", cuenta: 2, es: fV(2, "Positiva", false), en: fV(2, "Positiva", true), prueba: "Comida positiva en 1 fila de D y 2 de F: 3" },
  { celda: "M2", cuenta: 3, es: fV(2, "Negativa", false), en: fV(2, "Negativa", true), prueba: "Comida negativa en 2 filas de D y 0 de F: 2" },
  { celda: "K8", cuenta: 4, es: "=SUMA(K2:K7)", en: "=SUM(K2:K7)", prueba: "3, 2 y 1 en K2:K4 y ceros en el resto: 6" },
  { celda: "K9", cuenta: 5, es: `=CONTAR.SI(H2:H${ULT};"No")`, en: `=COUNTIF(H2:H${ULT},"No")`, prueba: "«Sí», «No» y «No» en H2:H4: 2" },
];

/* primer resultado y corrección */
const CORRECCIONES = Object.keys(IA_M).map((id) => {
  const r = res(id);
  return { id, antes: describe(IA_M[id]), despues: describe(r.m) };
});
const MOTIVOS: Record<string, string> = {
  R06: "El texto dice que los platos «tardaron en llegar»: hay una segunda mención, Espera.",
  R18: "El libro de códigos incluye en Reservas encontrar la mesa lista al llegar.",
  R15: "La espera es una queja: «pero valió la pena» habla de la comida.",
};
const PROBLEMAS_TEXTO = CORRECCIONES.map((c) => `${c.id}: ${MOTIVOS[c.id]}`).join(" ");

const CRITERIOS = [
  { id: "citas", label: "Cada cita está en su reseña", detail: "La cita se copió letra por letra de la reseña." },
  { id: "codigos", label: "Aplica el libro de códigos", detail: "Cada mención lleva el tema que dice el libro, con sus límites." },
  { id: "completo", label: "Recoge todas las menciones", detail: "Anota los dos temas de una reseña cuando el texto los menciona." },
  { id: "valencia", label: "La valencia es la del texto", detail: "Cada mención es positiva o negativa según lo que dice, no según el tono general." },
  { id: "sincalculos", label: "No cuenta ni calcula", detail: "No da totales ni porcentajes: los hace la hoja." },
] as const;
const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Fallan varios criterios: revisa el libro de códigos y vuelve a pedir la clasificación." },
  { min: 6, label: "Con ajustes", advice: "Sirve de base: corrige las filas señaladas antes de contar." },
  { min: 9, label: "Lista para contar", advice: "Cumple casi todo: pasa a contar." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (t: number) => [...RESULTADOS].reverse().find((r) => t >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { citas: 2, codigos: 1, completo: 1, valencia: 1, sincalculos: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

/* lectura de patrones: hallazgos ordenados por menciones */
const cuenta = (t: Cod, v: Val) => idsDe(t, v).length;
const HALLAZGOS: { tipo: string; t: Cod; v: Val; id: string }[] = [
  { tipo: "Elogio", t: "C", v: "+", id: "R07" },
  { tipo: "Problema", t: "E", v: "-", id: "R10" },
  { tipo: "Elogio", t: "S", v: "+", id: "R16" },
  { tipo: "Problema", t: "C", v: "-", id: "R13" },
  { tipo: "Problema", t: "A", v: "-", id: "R17" },
];
const HALLAZGOS_FILAS = HALLAZGOS.map((h) => [h.tipo, TEMAS[h.t], `${cuenta(h.t, h.v)} de ${CONT_FINAL[h.t].men}`, idsDe(h.t, h.v).join(", "), `«${res(h.id).cita}»`]);
const OPORTUNIDADES = [
  `Espera: ${cuenta("E", "-")} reseñas la mencionan como queja, en momentos distintos (platos, cuenta, pedido). ¿Dónde se acumula?`,
  `Ambiente: ${cuenta("A", "-")} reseñas hablan de ruido, pintura y baños. ¿Es un problema o son tres?`,
];
const NO_AFIRMAR = [
  "Que la espera sea la causa de otras quejas: las reseñas no lo dicen.",
  `Que ${N} reseñas representen a todos los clientes.`,
  "Si las quejas suben o bajan con el tiempo: las reseñas no traen fecha.",
];
const NUMEROS = ["cero", "un", "dos", "tres", "cuatro", "cinco", "seis"];
const TEMAS_QUE_CAMBIAN = (Object.keys(TEMAS) as Cod[]).filter((t) => (["men", "pos", "neg"] as const).some((k) => CONT_IA[t][k] !== CONT_FINAL[t][k])).length;

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "analizar-opiniones-de-clientes-con-ia",
    category: "clientes",
    title: "Analizar opiniones de clientes con IA",
    description:
      "Convierte reseñas y comentarios en problemas frecuentes, elogios y oportunidades de mejora, con conteos que verificas y sin compartir datos personales.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["numeros-datos", "tema-sensible"],
    estandarGuia: 3,
    handlesNumbers: true,
    activoOriginal:
      "Libro de códigos y hoja de conteo copiables (fórmulas en español e inglés que cuentan menciones y comprueban citas) y rúbrica de cinco criterios con dos reglas de bloqueo",
    problem: "Tienes muchas opiniones de clientes dispersas y no sabes qué patrones se repiten ni qué mejorar primero.",
    whyThisPage:
      "Enseña a pedir clasificaciones con citas textuales y a verificar los conteos, además de anonimizar los datos antes de compartirlos con la IA.",
    relatedGuides: ["analizar-ventas-con-ia", "responder-consultas-de-clientes-con-ia", "ideas-de-contenido-para-tu-negocio-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Clasifica cada opinión con ayuda de la IA, deja que una hoja cuente y comprueba que cada cita existe antes de decidir qué mejorar.",
    difficulty: "Intermedio",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de tres horas la primera vez; menos con tu libro de códigos hecho",
    needs: ["Un asistente de IA de chat", "Una hoja de cálculo", "Tus reseñas o comentarios, sin datos personales"],
    result: "Un libro de códigos, tus opiniones clasificadas y contadas en una hoja, y una lectura de patrones con citas comprobadas",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el resultado: opiniones clasificadas por tema y un conteo que sale de la hoja.",
      description:
        "Una hoja de cálculo con las reseñas ficticias del caso a la izquierda, con su tema y valencia, y a la derecha el conteo por tema con las menciones positivas y negativas. Resaltar el tema con más menciones negativas. Sin datos personales.",
      alt: "Hoja con reseñas clasificadas por tema y, al lado, un conteo de menciones positivas y negativas por tema.",
      caption: "Las opiniones clasificadas y la hoja que las cuenta.",
    }),
    datos: slot("resenas-anonimizadas.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Muestra cómo quedan las reseñas ya anonimizadas y numeradas antes de compartirlas con la IA.",
      description:
        "Una hoja con las reseñas ficticias del caso: una columna con el id (R01, R02…) y otra con el texto. Un recuadro marca las cosas que se quitaron antes (nombres, teléfonos, cuentas de redes). Caso ficticio, sin datos personales.",
      alt: "Hoja con reseñas numeradas y anonimizadas, con una nota de los datos personales que se quitaron.",
      caption: "Reseñas listas para compartir: sin datos personales.",
      zoom: true,
    }),
    hoja: slot("hoja-de-conteo.webp", {
      section: "hoja",
      ratio: "4/3",
      purpose: "Muestra la hoja de conteo pegada y funcionando, con la fórmula de las menciones visible.",
      description:
        "El bloque de conteo pegado en J1: seis temas con sus menciones, positivas y negativas, el total y las citas no encontradas. Resaltar la barra de fórmulas con la de CONTAR.SI.CONJUNTO. Caso ficticio.",
      alt: "Hoja con un conteo de menciones por tema y la fórmula de conteo en la barra de fórmulas.",
      caption: "El conteo lo hace la hoja.",
      zoom: true,
    }),
    primerResultado: slot("clasificacion-inicial.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver cómo llega la clasificación y localizar las tres filas que no coinciden con la lectura del texto.",
      description:
        "La tabla que devolvió el asistente, con sus 25 filas y las tres filas de R06, R15 y R18 resaltadas. Al lado, el texto de cada reseña. Caso ficticio, sin datos de cuenta.",
      alt: "Tabla de reseñas clasificadas por un asistente con tres filas resaltadas junto al texto de cada reseña.",
      caption: "La primera clasificación, con tres filas que revisar.",
      zoom: true,
    }),
    verificacion: slot("verificacion-de-citas.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a comprobar las citas: la columna «Cita verificada» y el conteo de citas no encontradas.",
      description:
        "La hoja con la columna «Cita verificada» llena de «Sí» y, a un lado, «Citas no encontradas: 0». Debajo, un ejemplo con una cita cambiada que da «No». Caso ficticio.",
      alt: "Hoja con una columna que marca «Sí» cuando la cita aparece en la reseña y un conteo de citas no encontradas.",
      caption: "Cada cita, comprobada por la hoja.",
      zoom: true,
    }),
    final: slot("conteos-antes-y-despues.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra cuánto cambian los conteos al corregir las tres filas.",
      description:
        "La tabla con los conteos según la IA y los finales por tema, con las tres diferencias resaltadas. Debajo, las tres filas corregidas. Caso ficticio.",
      alt: "Tabla que compara los conteos por tema de la primera clasificación con los conteos finales.",
      caption: "Tres filas corregidas cambian el conteo.",
      zoom: true,
    }),
    lectura: slot("lectura-de-patrones.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Muestra la lectura final con hallazgos, oportunidades y lo que no se puede afirmar.",
      description:
        "La respuesta del prompt de lectura: la tabla de hallazgos con sus reseñas y citas, las oportunidades a explorar y «Con estos datos no se puede afirmar». Caso ficticio; ocultar datos de cuenta.",
      alt: "Lectura de patrones de opiniones con tabla de hallazgos, oportunidades y límites de lo que se puede afirmar.",
      caption: "Qué dicen las reseñas y qué no.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "hoja",
      ratio: "16/9",
      promptId: "formulas",
      purpose: "Prueba real del prompt de fórmulas: la tabla de fórmulas y su comprobación con números de práctica.",
      description:
        "Captura de la tabla de fórmulas y de «Cómo pegarla». Usa solo la descripción de tus columnas, sin reseñas. Ocultar datos personales y de cuenta.",
      alt: "Captura de las fórmulas de una hoja de cálculo devueltas por un asistente.",
      caption: "Prueba del prompt de fórmulas.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "codigos",
      purpose: "Prueba real del prompt de códigos: el ida y vuelta de preguntas y el libro de códigos que devolvió.",
      description:
        "Captura de la entrevista y de la tabla final con qué incluye y qué no incluye cada tema. Sin reseñas: solo la descripción de tu negocio. Ocultar datos personales y de cuenta.",
      alt: "Captura de una entrevista con un asistente y del libro de códigos que devolvió.",
      caption: "Prueba del prompt de códigos.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "clasificacion",
      purpose: "Prueba real del prompt de clasificación: la tabla, «Para una persona» y «Dudas».",
      description:
        "Captura de la tabla de clasificación, de «Para una persona» y de «Dudas». Usa las reseñas del caso o las tuyas ya anonimizadas. Ocultar datos personales y de cuenta.",
      alt: "Captura de la clasificación de reseñas devuelta por un asistente.",
      caption: "Prueba del prompt de clasificación.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description: "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una clasificación con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "lectura",
      purpose: "Prueba real del prompt de lectura: los hallazgos con citas y lo que no se puede afirmar.",
      description:
        "Captura de la tabla de hallazgos, de las oportunidades y de «Con estos datos no se puede afirmar». Anota aparte si sus cifras coinciden con las de tu hoja. Ocultar datos personales y de cuenta.",
      alt: "Captura de una lectura de opiniones de clientes devuelta por un asistente.",
      caption: "Prueba del prompt de lectura.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Las opiniones llegan por todas partes: reseñas, mensajes, comentarios, encuestas. Leerlas una a una es lento, y al final recuerdas lo último o lo más doloroso. Así es fácil arreglar el problema equivocado.\n\nUn asistente de IA puede clasificar cientos de opiniones en minutos, pero puede equivocarse al contar, inventar una cita que suena a lo que dijo un cliente y explicar con seguridad por qué se quejan. Y si le pegas las reseñas tal cual, puedes compartir nombres o teléfonos.\n\n**La hoja cuenta, la IA clasifica con citas literales y tú decides qué hacer con lo que sale.**",
    symptoms: [
      "Te quedas con la última reseña que leíste, buena o mala.",
      "Las quejas te llegan mezcladas con los elogios y no sabes cuál se repite más.",
      "Le pediste un resumen a una IA y no sabes si sus números y citas son ciertos.",
      "Dudas si puedes pegar reseñas de clientes en una herramienta de IA.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con tus opiniones clasificadas y contadas, y con una lectura que dice qué se repite y qué no se puede afirmar.",
    deliverables: [
      { label: "Un libro de códigos", detail: "Tus temas, con qué incluye y qué no incluye cada uno." },
      { label: "Una hoja de conteo", detail: "Con fórmulas en español e inglés que cuentan las menciones y comprueban cada cita." },
      { label: "Una lectura de patrones", detail: "Problemas frecuentes, elogios y oportunidades, con citas y sin causas inventadas." },
      { label: "Una rúbrica de cinco criterios", detail: "Para revisar cualquier clasificación antes de contar." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes decenas de reseñas o comentarios de clientes y quieres saber qué se repite.",
      "Puedes quitar los datos personales de esos textos antes de usarlos.",
      "Nunca usaste una IA, o casi nada.",
    ],
    notForWho: [
      "Quieres que la IA explique por qué se quejan tus clientes: aquí solo se cuenta lo que dicen.",
      "Tienes tres o cuatro opiniones: bastan para leerlas tú.",
      "Necesitas un estudio de mercado con resultados generalizables: unas reseñas no lo son.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Restaurante La Higuera (ficticio) — restaurante familiar",
    situation:
      `Su dueña guarda ${N} reseñas del último trimestre, textos inventados para esta guía. Quiere saber qué mejorar primero y no sabe por dónde empezar.`,
    goal: "Saber qué temas se repiten en las reseñas, con qué frecuencia y con qué citas, sin compartir datos personales.",
    data: [
      { label: "Opiniones", value: `${N} reseñas ficticias, sin fecha ni autor` },
      { label: "Lo que quiere saber", value: "Qué se repite: quejas y elogios" },
      { label: "Lo que no sabe", value: "Cuántas quejas hay de cada tema, y si lo que le contó una IA es verdad" },
    ],
    problem: "Una IA a la que le pegó las reseñas le dio números y citas que no pudo comprobar.",
    application: "Define sus temas, arma la hoja, pide la clasificación, la contrasta, corrige y pide la lectura de los conteos.",
    result: "Una tabla de reseñas clasificada, un conteo por tema que sale de la hoja y una lectura que dice qué no se puede afirmar.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan el trabajo.",
    blocks: [
      {
        title: "Una opinión, una o dos menciones",
        detail:
          "Cada mención tiene un tema y una valencia: si el texto lo dice como algo positivo o negativo. Una reseña tiene dos menciones si habla de dos temas.",
        example: `R02 tiene dos: «${TEMAS.E}» negativa y «${TEMAS.S}» positiva.`,
      },
      {
        title: "Un tema tiene límites",
        detail: "Sin reglas, cada persona etiqueta a su manera. El libro dice qué incluye cada tema y qué no.",
      },
      {
        title: "Una cita es una cita",
        detail: "Una cita se copia letra por letra. Si el asistente la resume o la corrige, ya no prueba nada.",
      },
      {
        title: "Pocas opiniones, pocas afirmaciones",
        detail: `Con ${N} reseñas conviene hablar de cantidades: un porcentaje suena preciso y no lo es. Y lo que no está en los textos, como las causas, no se afirma.`,
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: `Te pego ${N} reseñas de mi restaurante. ¿Cuántas hablan de la espera y cuáles son los problemas más comunes? Dame ejemplos citando las reseñas.`,
    whyInsufficient:
      "Con esa frase la IA no sabe qué cuenta como «espera», no distingue una queja de un elogio y calcula mientras redacta. Puede contar de más y citar con palabras que no son de ninguna reseña (ejemplo ilustrativo).",
    issues: [
      "«Espera» no está definida: cada quien cuenta lo que quiere.",
      "No pide una clasificación que puedas revisar fila por fila.",
      "Las citas no se pueden comprobar.",
      "No dice qué no puede afirmarse con tan pocas reseñas.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Reúne cuatro cosas antes de abrir la IA.",
    items: [
      { label: "Tus opiniones", detail: "Reseñas, comentarios, mensajes o notas de encuestas, copiados a una hoja: una por fila.", required: true },
      { label: "Las opiniones anonimizadas", detail: "Sin nombres, teléfonos, correos, cuentas de redes ni nada que identifique a una persona, y con un id (R01, R02…).", required: true },
      { label: "Lo que quieres saber", detail: "Una pregunta concreta, como qué queja se repite más.", required: true },
      { label: "Tu conocimiento del negocio", detail: "Los aspectos que importan en tu negocio: la IA no puede saberlos.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribió la IA y lo que dice la hoja",
      purpose: "Ver cómo un conteo y una cita del pedido ingenuo no se sostienen.",
      columns: ["Concepto", "Lo que escribió la IA", "Lo que dice la hoja"],
      rows: [
        ["Reseñas que mencionan la espera", String(ESPERA_INGENUO), String(CONT_FINAL.E.men)],
        ["Porcentaje de reseñas con espera", PCT(ESPERA_INGENUO), PCT(CONT_FINAL.E.men)],
        ["Cita sobre la cuenta", `«${CITA_INGENUA}»`, `No aparece en ninguna reseña; R10 dice «${res("R10").cita}»`],
      ],
      note: `Ejemplo ilustrativo, escrito a propósito. La hoja cuenta las menciones de «${TEMAS.E}» en las ${N} reseñas del caso.`,
    },
    resenas: {
      caption: "Las reseñas del caso, anonimizadas",
      purpose: "Tener reseñas ficticias para practicar la clasificación y las cuentas.",
      columns: ["Id", "Reseña"],
      rows: RESENAS.map((r) => [r.id, r.texto]),
      copyable: true,
      note: "Reseñas ficticias, escritas para esta guía. Sustitúyelas por las tuyas ya anonimizadas.",
    },
    libro: {
      caption: "Libro de códigos del restaurante",
      purpose: "Tener cada tema con su definición y sus límites.",
      columns: ["Tema", "Qué incluye", "Qué no incluye"],
      rows: LIBRO,
      copyable: true,
      note: "Ejemplo ficticio. Tus temas dependen de tu negocio.",
    },
    hoja: {
      caption: "Las fórmulas de la hoja, en español y en inglés",
      purpose: "Saber qué escribir en cada celda y cómo probarlo con números de práctica.",
      columns: ["Celda", "Qué calcula", "Fórmula en español", "Fórmula en inglés", "Comprobación con números de práctica"],
      rows: FORMULAS.map((x) => [x.celda, CUENTAS[x.cuenta], x.es, x.en, x.prueba]),
      note: "Ejemplo generado. Según tu región, los argumentos se separan con punto y coma o con coma.",
    },
    calculadora: {
      caption: "Bloque de conteo para pegar en J1",
      purpose: "Tener un conteo por tema, con menciones positivas y negativas.",
      columns: ["Tema", "Menciones", "Positivas", "Negativas"],
      rows: [
        ...(Object.values(TEMAS) as string[]).map((t, k) => [t, fK(k + 2, false), fV(k + 2, "Positiva", false), fV(k + 2, "Negativa", false)]),
        ["Total", "=SUMA(K2:K7)", "=SUMA(L2:L7)", "=SUMA(M2:M7)"],
        ["Citas no encontradas", `=CONTAR.SI(H2:H${ULT};"No")`, "—", "—"],
      ],
      copyable: true,
    },
    hallazgos: {
      caption: "Hallazgos ordenados por menciones",
      purpose: "Ver qué se repite, cuántas veces y con qué citas.",
      columns: ["Tipo", "Tema", "Menciones del tipo (de las del tema)", "Reseñas", "Cita textual"],
      rows: HALLAZGOS_FILAS,
      copyable: true,
      note: "Ejemplo generado a partir de los conteos de la hoja.",
    },
    limites: {
      caption: "Oportunidades a explorar y límites de lo que se puede afirmar",
      purpose: "Separar lo que las reseñas prueban de lo que sería suposición.",
      columns: ["Apartado", "Contenido"],
      rows: [
        ...OPORTUNIDADES.map((o) => ["Oportunidad a explorar", o]),
        ...NO_AFIRMAR.map((n) => ["No se puede afirmar", n]),
        ["FALTA", "Ninguno"],
      ],
    },
    conteos: {
      caption: "Conteo por tema: primera clasificación y clasificación final",
      purpose: "Ver cuánto cambian los conteos al corregir tres filas.",
      columns: ["Tema", "Menciones según la IA", "Menciones finales", "Positivas finales", "Negativas finales"],
      rows: [
        ...(Object.keys(TEMAS) as Cod[]).map((t) => [TEMAS[t], String(CONT_IA[t].men), String(CONT_FINAL[t].men), String(CONT_FINAL[t].pos), String(CONT_FINAL[t].neg)]),
        ["Total", String(sumar(CONT_IA, "men")), String(TOTAL_MEN), String(sumar(CONT_FINAL, "pos")), String(sumar(CONT_FINAL, "neg"))],
      ],
      copyable: true,
      note: `Ejemplo con datos ficticios, calculado por la hoja. Las ${N} reseñas suman ${TOTAL_MEN} menciones porque ${DOS_TEMAS} tienen dos.`,
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Cinco de los siete pasos llevan un prompt. El primero y el último los haces tú solo.",
    steps: [
      { title: "Reúne y anonimiza tus opiniones", description: "Copia las opiniones a una hoja, quita todo dato personal y ponles un id.", output: "Una tabla con id y texto, sin datos personales." },
      { title: "Arma tu hoja de conteo", description: "Con el prompt de fórmulas, o copiando el bloque de conteo, deja una hoja que cuente y compruebe las citas.", output: "Una hoja que funciona con números de práctica." },
      { title: "Define tus temas con la entrevista", description: "Deja que la IA te pregunte por tu negocio y ponga por escrito qué incluye cada tema y qué no.", output: "Un libro de códigos." },
      { title: "Pide la clasificación", description: "Entrega el libro de códigos y las opiniones, y pide, por cada opinión, sus temas, la valencia de cada uno y una cita.", output: "Una tabla con una fila por opinión." },
      { title: "Contrasta y corrige", description: "Lee cada cita y cada código en tu hoja, puntúa con la rúbrica y pide cambiar solo las filas señaladas.", output: "Una tabla corregida y contada por la hoja." },
      { title: "Pide la lectura de patrones", description: "Entrega los conteos y la tabla, y pide qué se repite, con citas, y qué no se puede afirmar.", output: "Una lectura con hallazgos y límites." },
      { title: "Decide y verifica", description: "Elige qué mejorar, comprueba lo que la lectura no puede saber y guarda tu libro de códigos.", output: "Una decisión tuya." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    formulas: {
      title: "Prompt de fórmulas: armar tu hoja sin compartir reseñas",
      objective: "Obtener las fórmulas de la hoja a partir de la descripción de tus columnas, sin pegar ninguna reseña.",
      whenToUse: "Cuando quieres construir la hoja tú mismo o adaptar el bloque de conteo a tus columnas.",
      variables: [
        { name: "PROGRAMA", description: "La hoja de cálculo que usas.", example: "Google Sheets" },
        {
          name: "COLUMNAS_Y_CELDAS",
          description: "Letra y contenido de cada columna o bloque que ya tienes.",
          example: `A: id · B: reseña · C: tema 1 · D: valencia 1 · E: tema 2 · F: valencia 2 · G: cita · H: cita verificada · filas 2 a ${ULT} · J2 a J7: los temas`,
        },
      ],
      prompt: `Eres un asistente que ayuda con hojas de cálculo a personas que apenas empiezan. Hablarás con la dueña o el dueño de un negocio pequeño, que escribirá cada fórmula por su cuenta. Tu misión es proponerle las fórmulas de una hoja que cuenta opiniones clasificadas, usando únicamente la descripción de sus columnas, sin ver ninguna reseña.

### CONTEXTO
Programa: {{PROGRAMA}}

### DATOS
Cómo está armada mi hoja (columna o bloque y lo que contiene):
{{COLUMNAS_Y_CELDAS}}

### CUENTAS QUE NECESITO
${LISTA_CUENTAS}

### REGLAS
1. Trabaja solo con las columnas que describí. Si para una cuenta falta una, escribe [FALTA: la columna]; no la crees por tu cuenta.
2. No pidas mis reseñas. Para probar cada fórmula usa ejemplos de tres o cuatro filas que pueda resolver mentalmente.
3. Da cada fórmula con las funciones en español y en inglés, y avísame de que el separador de argumentos depende de la región configurada.
4. Fija los rangos con signos de dólar cuando la fórmula se copie hacia abajo, y dime cuáles.
5. Añade una frase simple por fórmula; si dudas del nombre de una función en mi programa, dilo.
6. Separa lo que sale de mi descripción de lo que supones tú, y marca cada suposición como «SUPUESTO».

### FORMATO DE SALIDA
Una tabla de columnas fijas: Celda | Qué calcula | Fórmula en español | Fórmula en inglés | Comprobación con números de práctica. Debajo, «Cómo pegarla», con el lugar de cada fórmula. La tabla fija la forma; el contenido sale de mis columnas.

### ANTES DE RESPONDER
Comprueba que: cada fórmula responde a la cuenta escrita arriba; la comprobación con números de práctica es correcta (haz la cuenta dos veces); no usaste columnas que no describí; toda suposición está marcada; las menciones cuentan tanto «Tema 1» como «Tema 2». Corrige lo que falle.`,
      explanation: [
        {
          part: "…sin ver ninguna reseña.",
          why: "Le describes la estructura, no las opiniones: construyes el cálculo sin compartir nada de tus clientes.",
        },
        {
          part: "Para probar cada fórmula usa ejemplos de tres o cuatro filas que pueda resolver mentalmente.",
          why: "Puedes verificar cada fórmula con cuentas propias antes de usar tus reseñas.",
        },
        {
          part: "Fija los rangos con signos de dólar cuando la fórmula se copie hacia abajo…",
          why: "Evita el error de una fórmula que, al copiarse, cuenta un rango que se mueve.",
        },
      ],
      evaluate: "Escribe cada fórmula con el ejemplo de práctica: el resultado debe coincidir con la última columna.",
      improve: "Si tu programa no reconoce una función, pega su mensaje de error y pide la alternativa.",
    },

    codigos: {
      title: "Prompt de códigos: que la IA te entreviste",
      objective: "Ponerle límites a tus temas: qué incluye cada uno y qué no, a partir de lo que sabes de tu negocio.",
      whenToUse: "Antes de clasificar, cuando no tienes claro qué temas importan en tu negocio.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: "Restaurante familiar de barrio" },
        { name: "LO_QUE_QUIERO_SABER", description: "La pregunta que quieres responder con tus opiniones.", example: "Qué queja se repite más y qué elogian mis clientes" },
      ],
      prompt: `Actúa como un entrevistador que ayuda a un negocio pequeño a ordenar los temas de las opiniones de sus clientes. Tu destinatario es la persona dueña, que conoce su negocio pero nunca definió sus temas. Tu objetivo es armar un libro de códigos usando SOLO lo que yo te diga, sin ver ninguna reseña.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Lo que quiero saber: {{LO_QUE_QUIERO_SABER}}

### QUÉ DEBE TENER EL LIBRO
Entre cuatro y seis temas. Para cada uno: nombre, qué incluye y qué no incluye, con el tema al que pertenece lo que no incluye.

### REGLAS
1. Pregúntame de a UNA cosa y espera mi respuesta. Máximo 12 preguntas; no repitas lo que ya está en CONTEXTO.
2. Pregúntame qué aspectos de mi negocio suelen mencionar los clientes. No propongas temas que yo no mencione ni me digas cuáles son «los habituales» en mi rubro.
3. Para cada tema pregúntame dónde termina: qué cosa parecida pertenece a otro tema. Si dos temas se pisan, pídeme que decida a cuál va cada caso.
4. Si dos respuestas se contradicen, cita las dos frases y pídeme que elija.
5. Si no decidí un límite, márcalo «Pendiente» y sigue.
6. Separa lo que yo dije de lo que tú supones o sugieres, y no presentes una suposición como si fuera mi respuesta.
7. No me pidas reseñas ni datos personales de clientes.

### FORMATO DE SALIDA
Al terminar (o al llegar a 12 preguntas), una tabla con columnas fijas: Tema | Qué incluye | Qué no incluye | Estado. El estado es «Confirmado» o «Pendiente». Después, «Pendiente»: cada límite sin decidir. La tabla define la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Verifica que: hay entre cuatro y seis temas; cada «Qué no incluye» apunta a otro tema; ningún tema apareció sin que yo lo dijera; toda suposición está marcada; cada «Confirmado» corresponde a algo que dije. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar la tabla completa en el siguiente prompt, en el lugar de la variable LIBRO_DE_CODIGOS.`,
      explanation: [
        {
          part: "No propongas temas que yo no mencione ni me digas cuáles son «los habituales» en mi rubro.",
          why: "Un tema que no es tuyo se llena de reseñas que no le corresponden.",
        },
        {
          part: "Para cada tema pregúntame dónde termina…",
          why: "Los límites evitan que una misma frase se etiquete de dos maneras.",
        },
        {
          part: "Si no decidí un límite, márcalo «Pendiente» y sigue.",
          why: "Un límite pendiente a la vista es mejor que uno inventado.",
        },
      ],
      evaluate: "Comprueba que cada tema usa tus palabras y que cada «no incluye» apunta a otro tema.",
      improve: "Si dos temas se pisan, contesta a cuál va cada caso y pide reescribir esas filas.",
      conversation: [
        { who: "ia", text: "Primera pregunta: ¿de qué suelen hablar tus clientes cuando opinan de tu restaurante?" },
        { who: "tu", text: "De la comida, del trato, de lo que esperan y del precio." },
        { who: "ia", text: "Anotado. ¿Dónde termina «el trato»? Por ejemplo, si el mesero tarda en traer un plato, ¿es trato o es espera?" },
      ],
    },

    clasificacion: {
      title: "Prompt de clasificación: un tema, una valencia y una cita",
      objective: "Obtener una tabla con una fila por opinión, con sus temas, su valencia y una cita copiada de la reseña.",
      whenToUse: "Cuando tu libro de códigos está listo y tus opiniones están anonimizadas y numeradas.",
      variables: [
        { name: "NEGOCIO", description: "Tu negocio, en una frase.", example: "Restaurante familiar de barrio" },
        { name: "LIBRO_DE_CODIGOS", description: "La tabla de tus temas, con qué incluye y qué no.", example: "La tabla de la entrevista, con tus temas" },
        { name: "RESENAS", description: "Tus opiniones anonimizadas, una por línea, con su id.", example: `${RESENAS[0].id} · ${RESENAS[0].texto}` },
      ],
      prompt: `Actúa como analista de opiniones de clientes para un negocio pequeño. Tu destinatario es la persona dueña, que comprobará tu tabla contra las reseñas. Tu objetivo es clasificar cada reseña con los temas de su libro de códigos y una cita literal.

### CONTEXTO
Negocio: {{NEGOCIO}}

### DATOS (el libro de códigos y las reseñas son la única fuente)
Libro de códigos:
{{LIBRO_DE_CODIGOS}}

Reseñas (una por línea, con su id):
{{RESENAS}}

### REGLAS
1. Usa solo los temas del libro de códigos, escritos exactamente como están allí, con su definición y sus límites. No crees temas nuevos.
2. Cada reseña tiene una mención o dos, y dos solo si el texto habla de dos temas distintos. Cada mención lleva una valencia, «Positiva» o «Negativa», según lo que dice el texto sobre ese tema.
3. La cita es un fragmento copiado letra por letra de la reseña, sin corregirlo, resumirlo ni cambiar una palabra.
4. No cuentes, no sumes y no calcules porcentajes: los conteos los hace la hoja.
5. Si una reseña es ambigua (dos temas posibles o una valencia dudosa), anota su id y el motivo en «Dudas»; no cambies la tabla.
6. Si una reseña habla de salud, alergias o seguridad, no la clasifiques: anota su id en «Para una persona».
7. No supongas causas, intenciones ni datos del cliente que no estén en el texto.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Id | Tema 1 | Valencia 1 | Tema 2 | Valencia 2 | Cita textual, con una fila por reseña y en el orden recibido, y «—» donde no hay segunda mención; (2) «Para una persona»; (3) «Dudas»; (4) «FALTA». La tabla define la forma; el contenido sale de mis reseñas.

### ANTES DE RESPONDER
Verifica que: hay una fila por reseña; cada cita aparece tal cual en su reseña (búscala); solo usaste temas del libro, con su nombre exacto; las valencias son «Positiva» o «Negativa»; no hay conteos ni porcentajes; toda duda está anotada. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo pegar las columnas de Tema 1 a Cita en la columna C de mi hoja, al lado de cada reseña.`,
      explanation: [
        {
          part: "Usa solo los temas del libro de códigos, escritos exactamente como están allí…",
          why: "La IA aplica tus reglas en lugar de inventar las suyas.",
        },
        {
          part: "La cita es un fragmento copiado letra por letra de la reseña…",
          why: "Una cita literal se comprueba con una fórmula; una parafraseada, no.",
        },
        {
          part: "No cuentes, no sumes y no calcules porcentajes: los conteos los hace la hoja.",
          why: "Separa lo que la IA hace bien, etiquetar textos, de lo que se comprueba, contar.",
        },
      ],
      evaluate: "Contrasta cada fila con la reseña y comprueba la columna de citas en la hoja.",
      improve: "Si mezcla temas, aclara el límite en el libro de códigos; no le añadas reglas sueltas.",
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo las filas señaladas",
      objective: "Corregir únicamente las filas señaladas, con temas del libro de códigos y citas literales, y dejar el resto intacto.",
      whenToUse: "Después de contrastar, cuando alguna fila tiene un problema.",
      variables: [
        { name: "PROBLEMAS", description: "Las filas con problema y su motivo.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Filas o reglas que no se pueden cambiar.", example: "Las demás filas y el libro de códigos" },
      ],
      prompt: `Actúa como editor de clasificaciones de opiniones para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO las filas señaladas, usando solo el libro de códigos y las reseñas, y dejar intacto lo demás.

### CONTEXTO
Usa el libro de códigos, las reseñas y la tabla de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Problemas que detecté (id y motivo):
{{PROBLEMAS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo las filas señaladas y lo que su cambio obligue a ajustar. No modifiques el libro de códigos ni las demás filas.
2. Para cada corrección usa solo temas del libro, con su definición, y una cita literal de esa reseña.
3. Si un problema que te señalé no existe en el texto, o el libro se contradice, dímelo antes de cambiar nada.
4. Si la corrección deja una fila dudosa, anótala en «Dudas» en lugar de decidirlo por mí.
5. No cuentes ni calcules nada.
6. En «Motivo» cita la frase de la reseña o la regla del libro que justifica el cambio: separa lo que dice el texto de lo que supones.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla con columnas fijas Id | Antes | Después | Motivo, con los temas y las valencias de cada fila; (2) «Sin cambios»: las filas que no toqué; (3) «FALTA». La tabla define la forma; el contenido sale de mis reseñas.

### ANTES DE RESPONDER
Verifica que: solo cambiaste los ids señalados; cada «Después» usa temas del libro y valencias del texto; las demás filas están idénticas; cada «Motivo» cita el texto o el libro; no hay conteos. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo las filas señaladas…",
          why: "Evita que rehaga filas que ya coincidían con el texto.",
        },
        {
          part: "Si un problema que te señalé no existe en el texto… dímelo antes de cambiar nada.",
          why: "Evita corregir a ciegas un problema que tú mismo pudiste marcar mal.",
        },
        {
          part: "Si la corrección deja una fila dudosa, anótala en «Dudas»…",
          why: "Las dudas las resuelves tú, no la IA.",
        },
      ],
      evaluate: "Aplica los cambios en tu hoja: el conteo debe moverse solo en los temas que tocaste.",
      improve: "Si cambia filas que no señalaste, pega otra vez la tabla y pide repetir solo esos ids.",
    },

    lectura: {
      title: "Prompt de lectura: qué se repite y qué no se puede afirmar",
      objective: "Obtener los hallazgos ordenados por frecuencia, con citas, oportunidades a explorar y límites de lo que se puede afirmar.",
      whenToUse: "Cuando la clasificación está corregida y contada por la hoja.",
      variables: [
        { name: "CONTEOS", description: "El bloque de conteo de tu hoja.", example: "La tabla de menciones, positivas y negativas por tema" },
        { name: "TABLA_FINAL", description: "Tu tabla corregida, con la reseña y la cita de cada fila.", example: "Las columnas A a G de tu hoja" },
      ],
      prompt: `Actúa como analista de opiniones de clientes para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá qué mejorar. Tu objetivo es explicar en palabras simples qué se repite en las opiniones, con citas, y qué NO se puede afirmar con ellas.

### CONTEXTO
Usa el libro de códigos y la pregunta de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS (los conteos y la tabla son la única fuente)
Conteos hechos por la hoja:
{{CONTEOS}}

Tabla final de opiniones:
{{TABLA_FINAL}}

### REGLAS
1. Copia los conteos tal como están en la hoja; no los recalcules ni los redondees.
2. Un hallazgo es un tema con su tipo: «Problema» si cuentan las menciones negativas y «Elogio» si cuentan las positivas. Incluye solo los hallazgos con tres o más menciones, ordenados de más a menos y, en un empate, por el orden del libro de códigos.
3. Cada hallazgo lleva los ids de sus reseñas y una cita copiada letra por letra de la tabla.
4. Con menos de cien opiniones habla de cantidades y no de porcentajes, y dilo.
5. No afirmes causas, ni impacto en las ventas, ni que un tema sea «el más importante»; solo cuántas veces se menciona. Si propones una explicación, márcala «HIPÓTESIS».
6. Las oportunidades se escriben como preguntas o pruebas que puedo hacer, cada una unida a su hallazgo. No recomiendes precios ni cambios de menú.
7. Si falta un dato o dos cifras se contradicen, avísame antes de escribir y marca [FALTA: el dato].
8. Distingue lo que sale de los conteos de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) «Hallazgos»: una tabla con columnas fijas Tipo | Tema | Menciones del tipo (de las del tema) | Reseñas | Cita textual; (2) «Oportunidades a explorar»; (3) «Con estos datos no se puede afirmar»; (4) «FALTA». La tabla define la forma; el contenido sale de mis conteos.

### ANTES DE RESPONDER
Verifica que: cada cifra es idéntica a la de los conteos; los hallazgos están ordenados; cada cita aparece tal cual en la tabla; no hay causas ni importancia afirmadas; hay al menos una cosa que no se puede afirmar. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Copia los conteos tal como están en la hoja; no los recalcules ni los redondees.",
          why: "Separa el conteo, que hace la hoja, de la lectura, que hace la IA.",
        },
        {
          part: "No afirmes causas, ni impacto en las ventas, ni que un tema sea «el más importante»…",
          why: "Las reseñas dicen cuántas veces se menciona algo, no por qué ni cuánto pesa.",
        },
        {
          part: "«Con estos datos no se puede afirmar»",
          why: "Obliga a nombrar los límites, en lugar de dejar que la lectura suene más segura de lo que es.",
        },
      ],
      evaluate: "Comprueba cada cifra con tu hoja y cada cita con la tabla.",
      improve: "Si aparece una causa sin marca de hipótesis, pídele que la quite o la marque.",
      warnings: ["Puede equivocarse al copiar una cifra o una cita: comprueba las dos."],
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: `Salida ilustrativa, redactada aplicando el prompt de clasificación a las ${N} reseñas del caso. La tuya será distinta.`,
    parts: [
      {
        type: "table",
        table: {
          caption: "Primera clasificación, tal como llega",
          purpose: "Tener la clasificación en el formato del prompt para pegarla en la hoja.",
          columns: ["Id", "Tema 1", "Valencia 1", "Tema 2", "Valencia 2", "Cita textual"],
          rows: RESENAS.map((r) => fila(r, mIA(r))),
        },
      },
      { type: "text", text: `**Para una persona.** Ninguna. **Dudas.** Ninguna. **FALTA.** Ninguno.` },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "clasificacion",
    title: "Puntúa una clasificación",
    intro:
      `Puntúa tu clasificación en los cinco criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      `La tabla parece ordenada y cubre las ${N} reseñas. Se contrasta con el texto y se puntúa con la rúbrica: ` +
      `el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      {
        criterionId: "citas",
        verdict: vered("citas"),
        comment: `Las ${N} citas están en su reseña: la hoja marca «Sí» en todas y «Citas no encontradas» da 0.`,
      },
      {
        criterionId: "codigos",
        verdict: vered("codigos"),
        comment: `R18 está como ${describe(IA_M.R18)}. ${MOTIVOS.R18}`,
      },
      {
        criterionId: "completo",
        verdict: vered("completo"),
        comment: `R06 tiene solo ${describe(IA_M.R06)}. ${MOTIVOS.R06}`,
      },
      {
        criterionId: "valencia",
        verdict: vered("valencia"),
        comment: `R15 lleva ${describe(IA_M.R15)}. ${MOTIVOS.R15}`,
      },
      {
        criterionId: "sincalculos",
        verdict: vered("sincalculos"),
        comment: "No da totales ni porcentajes, como pide el prompt.",
      },
    ],
    conclusion: `Es una buena base: las citas son literales. Tres filas habrían pasado por buenas al leerlas rápido, y cambian los conteos de ${NUMEROS[TEMAS_QUE_CAMBIAN]} temas.`,
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir tres filas, no volver a clasificar las veinticinco.",
    promptId: "ajuste",
    why: "El contraste señaló una mención que faltaba, un tema mal aplicado y una valencia mal leída. El prompt limita el cambio a los ids señalados, exige temas del libro y citas literales, y separa lo cambiado de lo que no.",
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
          purpose: "Comprobar qué filas cambiaron y por qué.",
          columns: ["Id", "Antes", "Después", "Motivo"],
          rows: CORRECCIONES.map((c) => [c.id, c.antes, c.despues, MOTIVOS[c.id]]),
        },
      },
      { type: "text", text: `**Sin cambios:** las otras ${N - CORRECCIONES.length} filas. **FALTA:** ninguno. Al pegar las tres filas en la hoja, los conteos quedan como en esta tabla.` },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Pegar reseñas con datos personales",
      whyItHurts: "Nombres, teléfonos o cuentas no ayudan a clasificar y pueden ser confidenciales.",
      instead: "Anonimiza antes: quita todo lo que identifique y usa un id.",
    },
    {
      title: "Dejar que la IA cuente",
      whyItHurts: "Puede equivocarse al contar aunque muestre una lista, y nadie lo nota sin una hoja con la que comparar.",
      instead: "Que la IA etiquete y la hoja cuente.",
    },
    {
      title: "Aceptar citas que no puedes comprobar",
      whyItHurts: "Una cita retocada suena a lo que dijo un cliente y no lo dijo nadie.",
      instead: "Pide citas literales y compruébalas con la fórmula de la hoja.",
    },
    {
      title: "Explicar por qué se quejan",
      whyItHurts: "Las reseñas dicen qué se menciona, no por qué. Una causa afirmada puede llevarte a arreglar lo que no era.",
      instead: "Cuenta lo que dicen y marca cualquier explicación como hipótesis.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de decidir qué mejorar, marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Quité de las opiniones todo dato personal antes de compartirlas." },
      { label: "Revisé las condiciones de la plataforma donde están las reseñas y las normas de datos de mi país.", detail: "Cambian de un lugar a otro y aquí no se cubren." },
      { label: "La columna «Cita verificada» dice «Sí» en todas las filas." },
      { label: "Leí las filas contra sus reseñas (o una muestra) y corregí lo que no coincidía." },
      { label: "Conté a mano las menciones de un tema y coincidieron con la hoja." },
      { label: "Las reseñas que hablan de salud o seguridad las revisó una persona." },
      { label: "Sé cuántas opiniones tengo y no hablo de porcentajes si son pocas." },
    ],
    principle: "La IA etiqueta y propone. Lo que se cuenta y lo que se decide, lo confirmas tú.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la primera lectura hecha, el trabajo es mantener el libro y repetir el ejercicio.",
    steps: [
      { title: "Guarda tu libro de códigos", detail: "Con la fecha y los cambios en los límites de un tema." },
      { title: "Repite con las opiniones nuevas", detail: "Cuando juntes un puñado de opiniones nuevas, pásalas por el mismo libro." },
      { title: "Anota los temas nuevos que aparecen", detail: "Si una opinión no cabe en ningún tema, quizá falte uno." },
      { title: "Compara con cuidado", detail: "Si comparas dos períodos, comprueba que tengan cantidades parecidas." },
      { title: "Anota lo que decidiste y por qué", detail: "Así verás si el cambio se nota en las opiniones siguientes." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena tus opiniones, pero tiene límites.",
    items: [
      { title: "No explica por qué se quejan", detail: "Solo cuenta lo que dicen. Las causas se investigan hablando con clientes." },
      { title: "No representa a todos tus clientes", detail: "Quien deja una opinión no es quien no la deja." },
      { title: "No decide qué mejorar", detail: "La frecuencia no es importancia: un tema poco mencionado puede pesar más para tu negocio." },
      { title: "No cubre la normativa de datos", detail: "Las reglas sobre datos personales y sobre el uso de reseñas varían por país y plataforma." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Entender a tus clientes no exige leer cada opinión: exige darles un orden. Con temas definidos, una IA que etiqueta con citas literales y una hoja que cuenta y comprueba, lo que se repite queda a la vista, y lo que no se sabe también.",
    takeaways: [
      "Define tus temas, con lo que incluyen y lo que no.",
      "Anonimiza antes de compartir.",
      "Lee la clasificación contra las reseñas antes de contar.",
      "Comprueba cada cita y di lo que no se puede afirmar.",
    ],
    nextGuide: "analizar-ventas-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "dato-personal", "hoja-de-calculo", "libro-de-codigos", "rubrica", "hipotesis"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Puedo pegar reseñas de mis clientes en una IA?",
      answer:
        "Depende de la herramienta, de lo que pegues y de las normas de tu país. Quita nombres, teléfonos y cuentas, comparte solo el texto necesario y revisa la política de privacidad de la herramienta.",
    },
    {
      question: "¿Cuántas opiniones necesito?",
      answer: "No hay una cifra mágica. Con pocas, las lees tú; con decenas, la hoja ya ayuda. Con pocas, habla de cantidades, no de porcentajes.",
    },
    {
      question: "¿Sirve para opiniones en otro idioma o con faltas de ortografía?",
      answer: "Puede servir, pero conviene comprobar más filas: los errores de clasificación son más probables. Las citas deben seguir copiándose tal cual.",
    },
    {
      question: "¿Y si una reseña es muy dura o habla de salud?",
      answer: "Esa la lee una persona. El prompt la separa en «Para una persona» y no la clasifica.",
    },
  ],
});
