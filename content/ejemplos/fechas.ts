import { datosVaciosFechas, type DatosFechas } from "@/lib/fechas/tipos";

export interface EjemploFechas {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosFechas;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente. */
  respuesta: string;
}

/**
 * Tres ejemplos. TODO es ficticio: aerolíneas, precios, horarios y fuentes están inventados solo para ilustrar la herramienta.
 * No son precios reales de ninguna aerolínea ni de ningún buscador. Antes de comprar, consulta precios reales.
 */
const BASE = datosVaciosFechas();

/** Fila de la tabla de combinaciones: [ida, vuelta, noches, precio_total, moneda, precio_por_persona, aerolinea, horario_ida, horario_vuelta, escalas, equipaje, condiciones, fuente, consultado_en]. */
type FilaEj = [string, string, number, number, string, number, string, string, string, string, string, string, string, string];
const campo = (t: string) => (/[",]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
const csv = (filas: FilaEj[]) =>
  ["ida,vuelta,noches,precio_total,moneda,precio_por_persona,aerolinea,horario_ida,horario_vuelta,escalas,equipaje,condiciones,fuente,consultado_en", ...filas.map((f) => f.map((x) => campo(String(x))).join(","))].join("\n");

interface Partes {
  acceso: "si" | "no";
  filas: FilaEj[];
  patrones: string[];
  costos: string[];
  antes: string[];
  verificar: string[];
  siguiente: string[];
}

const lista = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");

function armar(p: Partes): string {
  return `ACCESO A DATOS EN TIEMPO REAL: ${p.acceso}

## Combinaciones
\`\`\`csv
${csv(p.filas)}
\`\`\`

## Patrones observados
${lista(p.patrones)}

## Costos no incluidos
${lista(p.costos)}

## Antes de comprar
${lista(p.antes)}

## Qué debes verificar
${lista(p.verificar)}

## Siguiente paso
${lista(p.siguiente)}`;
}

/* ─────────────── Lima–Cusco: el ejemplo de la especificación (72 combinaciones, 18 consultadas) ─────────────── */

const DATOS_CUSCO: DatosFechas = {
  ...BASE,
  origen: "Lima, Perú (LIM)",
  destino: "Cusco, Perú (CUZ)",
  fechaInicio: "2026-11-01",
  fechaFin: "2026-11-30",
  duraciones: "5, 6, 7",
  adultos: "2",
  ninos: "0",
  infantes: "0",
  soloDirectos: false,
  evitarMadrugada: false,
  equipaje: "cualquiera",
  aeropuertosAlternativos: "",
  aerolineasExcluir: "",
  costoEquipajeBodega: "80",
  costoTraslados: "",
};

const AEROLINEA_A = "Aerolínea Andina (ficticia)";
const AEROLINEA_B = "Vuelo Sur (ficticia)";
const FUENTE = "Metabuscador de vuelos (consulta manual, sin marca)";
const SOLO_MANO = "Solo equipaje de mano";
const CON_BODEGA = "Incluye 1 maleta de 23 kg en bodega";

const RESPUESTA_CUSCO = armar({
  acceso: "si",
  filas: [
    // 5 noches (8 filas)
    ["2026-11-03", "2026-11-08", 5, 1400, "S/", 700, AEROLINEA_A, "06:20", "19:40", "Directo", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:05"],
    ["2026-11-04", "2026-11-09", 5, 1360, "S/", 680, AEROLINEA_B, "14:10", "08:30", "Directo", CON_BODEGA, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-20 10:07"],
    ["2026-11-07", "2026-11-12", 5, 1700, "S/", 850, AEROLINEA_A, "05:50", "20:15", "1 escala (Arequipa)", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:09"],
    ["2026-11-09", "2026-11-14", 5, 1440, "S/", 720, AEROLINEA_B, "13:45", "09:10", "Directo", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:11"],
    ["2026-11-11", "2026-11-16", 5, 1280, "S/", 640, AEROLINEA_A, "06:35", "19:55", "Directo", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:13"],
    ["2026-11-14", "2026-11-19", 5, 1820, "S/", 910, AEROLINEA_A, "07:00", "18:30", "Directo", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:15"],
    ["2026-11-18", "2026-11-23", 5, 1410, "S/", 705, AEROLINEA_B, "14:20", "08:45", "Directo", SOLO_MANO, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-20 10:17"],
    ["2026-11-21", "2026-11-26", 5, 1760, "S/", 880, AEROLINEA_A, "06:10", "19:35", "Directo", CON_BODEGA, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-20 10:19"],
    // 6 noches (6 filas)
    ["2026-11-04", "2026-11-10", 6, 1500, "S/", 750, AEROLINEA_A, "06:20", "19:40", "Directo", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:21"],
    ["2026-11-07", "2026-11-13", 6, 1840, "S/", 920, AEROLINEA_A, "05:50", "20:15", "1 escala (Arequipa)", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:23"],
    ["2026-11-11", "2026-11-17", 6, 1460, "S/", 730, AEROLINEA_B, "14:10", "08:30", "Directo", CON_BODEGA, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-20 10:25"],
    ["2026-11-14", "2026-11-20", 6, 1960, "S/", 980, AEROLINEA_A, "07:00", "18:30", "Directo", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:27"],
    ["2026-11-18", "2026-11-24", 6, 1520, "S/", 760, AEROLINEA_B, "14:20", "08:45", "Directo", SOLO_MANO, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-20 10:29"],
    ["2026-11-21", "2026-11-27", 6, 1890, "S/", 945, AEROLINEA_A, "06:10", "19:35", "Directo", SOLO_MANO, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-20 10:31"],
    // 7 noches (4 filas)
    ["2026-11-04", "2026-11-11", 7, 1580, "S/", 790, AEROLINEA_A, "06:20", "19:40", "Directo", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:33"],
    ["2026-11-11", "2026-11-18", 7, 1540, "S/", 770, AEROLINEA_B, "14:10", "08:30", "Directo", SOLO_MANO, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-20 10:35"],
    ["2026-11-14", "2026-11-21", 7, 2040, "S/", 1020, AEROLINEA_A, "07:00", "18:30", "Directo", SOLO_MANO, "Tarifa básica, sin cambios sin costo", FUENTE, "2026-09-20 10:37"],
    ["2026-11-18", "2026-11-25", 7, 1600, "S/", 800, AEROLINEA_B, "14:20", "08:45", "Directo", CON_BODEGA, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-20 10:39"],
  ],
  patrones: [
    "En esta búsqueda, las salidas de martes y miércoles fueron las más baratas en las tres duraciones; es una observación de estas 18 combinaciones, no una regla del mercado.",
    "Las salidas de sábado costaron claramente más que la opción más barata de la misma duración, en esta búsqueda (compáralo en la columna «Diferencia» de la tabla).",
    "Añadir una noche (de 5 a 6, o de 6 a 7) subió el precio en casi todas las fechas consultadas, pero no en todas: la del 11 al 18 (7 noches) costó menos que otras de 6 noches con salida en sábado.",
  ],
  costos: [
    "Ninguna tarifa consultada incluye selección de asiento.",
    "Las tarifas «básica» no incluyen equipaje de bodega: revisa la columna «equipaje» de cada fila.",
    "Ningún precio incluye el traslado hacia o desde el aeropuerto.",
  ],
  antes: [
    "Confirma el precio final en la página de la aerolínea o del buscador antes de pagar: puede cambiar entre la consulta y la compra.",
    "Si tu tarifa es «básica», revisa cuánto cuesta agregar una maleta de bodega antes de comparar el total.",
    "Verifica la política de cambios y cancelación de la tarifa que vayas a comprar.",
  ],
  verificar: [
    "Cada precio de la tabla, directamente en la aerolínea o el buscador, antes de pagar.",
    "Si tu documento de identidad o pasaporte cumple los requisitos del destino.",
    "Las políticas de equipaje de mano y de bodega de la aerolínea elegida.",
  ],
  siguiente: ["Consulta las combinaciones que aún no tienen precio, empezando por las salidas de martes y miércoles.", "Compara el precio ajustado (con equipaje de bodega) antes de decidir, no solo el precio base."],
});

/* ─────────────── Lima–Arequipa: sin acceso a datos en tiempo real (tabla vacía) ─────────────── */

const DATOS_AREQUIPA: DatosFechas = {
  ...BASE,
  origen: "Lima, Perú (LIM)",
  destino: "Arequipa, Perú (AQP)",
  fechaInicio: "2026-07-01",
  fechaFin: "2026-07-14",
  duraciones: "3, 4",
  adultos: "1",
  ninos: "0",
  infantes: "0",
  soloDirectos: true,
  evitarMadrugada: false,
  equipaje: "cualquiera",
  aeropuertosAlternativos: "Juliaca (JUL), si el precio a Arequipa es muy alto",
  aerolineasExcluir: "",
  costoEquipajeBodega: "",
  costoTraslados: "",
};

const RESPUESTA_AREQUIPA = armar({
  acceso: "no",
  filas: [],
  patrones: ["No pude consultar precios reales en esta sesión, así que no hay combinaciones para observar patrones."],
  costos: ["No corresponde: no hay ninguna tarifa consultada."],
  antes: ["Vuelve a intentarlo con un asistente que tenga búsqueda web activada, o usa el método guiado de la guía (paso a paso con un buscador de vuelos) para obtener los precios tú mismo."],
  verificar: ["Todos los precios: esta respuesta no consultó ninguno."],
  siguiente: ["Copia el prompt en un asistente con búsqueda web, o sigue el método guiado de la sección «Método paso a paso» de esta página."],
});

/* ─────────────── Lima–Buenos Aires: una sola duración, solo directos, evitar madrugada ─────────────── */

const DATOS_BUENOS_AIRES: DatosFechas = {
  ...BASE,
  origen: "Lima, Perú (LIM)",
  destino: "Buenos Aires, Argentina (EZE)",
  fechaInicio: "2026-04-01",
  fechaFin: "2026-04-21",
  duraciones: "8",
  adultos: "1",
  ninos: "0",
  infantes: "0",
  soloDirectos: true,
  evitarMadrugada: true,
  equipaje: "con-bodega",
  aeropuertosAlternativos: "",
  aerolineasExcluir: "",
  costoEquipajeBodega: "",
  costoTraslados: "",
};

const RESPUESTA_BUENOS_AIRES = armar({
  acceso: "si",
  filas: [
    ["2026-04-02", "2026-04-10", 8, 2150, "US$", 2150, AEROLINEA_A, "09:15", "22:40", "Directo", CON_BODEGA, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-18 09:02"],
    ["2026-04-05", "2026-04-13", 8, 1980, "US$", 1980, AEROLINEA_B, "10:30", "21:50", "Directo", CON_BODEGA, "Tarifa básica, bodega incluida", FUENTE, "2026-09-18 09:05"],
    ["2026-04-08", "2026-04-16", 8, 2260, "US$", 2260, AEROLINEA_A, "09:15", "22:40", "Directo", CON_BODEGA, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-18 09:08"],
    ["2026-04-11", "2026-04-19", 8, 2090, "US$", 2090, AEROLINEA_B, "10:30", "21:50", "Directo", CON_BODEGA, "Tarifa básica, bodega incluida", FUENTE, "2026-09-18 09:11"],
    ["2026-04-13", "2026-04-21", 8, 2310, "US$", 2310, AEROLINEA_A, "09:15", "22:40", "Directo", CON_BODEGA, "Tarifa flex, 1 cambio sin costo", FUENTE, "2026-09-18 09:14"],
  ],
  patrones: ["En esta búsqueda, las salidas de domingo (5 y 12 de abril) fueron más baratas que las de miércoles o lunes, con la misma duración de 8 noches.", "Solo se consultaron vuelos directos, así que esta búsqueda no dice nada sobre el precio de opciones con escala."],
  costos: ["Ningún precio incluye selección de asiento ni comidas especiales.", "Ningún precio incluye el traslado hacia o desde el aeropuerto."],
  antes: ["Confirma el precio final en la aerolínea antes de pagar.", "Revisa si tu pasaporte cumple la vigencia mínima exigida por Argentina antes de comprar."],
  verificar: ["Cada precio, directamente en la aerolínea, antes de pagar.", "Los requisitos de entrada a Argentina vigentes para tu nacionalidad."],
  siguiente: ["Consulta las combinaciones de abril que aún no tienen precio, priorizando los domingos.", "Verifica los requisitos de entrada antes de reservar."],
});

export const EJEMPLOS_FECHAS: EjemploFechas[] = [
  { id: "lima-cusco", etiqueta: "Lima–Cusco (noviembre, 5 a 7 noches)", descripcion: "72 combinaciones posibles, 18 consultadas, con ajuste por equipaje de bodega.", datos: DATOS_CUSCO, respuesta: RESPUESTA_CUSCO },
  { id: "lima-arequipa", etiqueta: "Lima–Arequipa (sin acceso a datos en tiempo real)", descripcion: "La IA avisa que no pudo consultar precios reales: la tabla queda vacía.", datos: DATOS_AREQUIPA, respuesta: RESPUESTA_AREQUIPA },
  { id: "lima-buenos-aires", etiqueta: "Lima–Buenos Aires (una sola duración, solo directos)", descripcion: "8 noches, solo vuelos directos y sin madrugada, todo con equipaje de bodega incluido.", datos: DATOS_BUENOS_AIRES, respuesta: RESPUESTA_BUENOS_AIRES },
];
