import { CRITERIOS_PREDEFINIDOS, opcionVacia, type Criterio, type DatosComparar, type Opcion, type Puntuaciones } from "@/lib/comparar/tipos";

export interface EjemploComparar {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosComparar;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente. */
  respuesta: string;
}

/**
 * Tres ejemplos. TODO es ficticio: nombres, precios, horarios y condiciones están inventados solo para ilustrar la herramienta.
 * No son precios reales de ningún hotel, aerolínea ni operador. Antes de reservar, verifica los precios y condiciones vigentes.
 * El costo total ajustado y la puntuación ponderada de cada respuesta se calcularon con lib/comparar/calculo.ts (no a mano).
 */
function opcion(p: Partial<Opcion> & { id: string }): Opcion {
  return { ...opcionVacia(p.id), ...p };
}

function criterio(id: string, nombre: string, peso: number): Criterio {
  return { id, nombre, peso: String(peso), predefinido: CRITERIOS_PREDEFINIDOS.some((c) => c.id === id) };
}

const lista = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");
const tabla = (filas: string[][]) => filas.map((f) => f.join(" | ")).join("\n");

interface Partes {
  tabla: string[][];
  costos: string[];
  diferencias: string[];
  ventajas: string[];
  prioridades: string[];
  preguntas: string[];
  verificar: string[];
  siguiente: string[];
}

function armar(p: Partes): string {
  return `## Tabla comparativa
${tabla(p.tabla)}

## Costos a verificar
${lista(p.costos)}

## Diferencias que importan
${lista(p.diferencias)}

## Ventajas y desventajas
${lista(p.ventajas)}

## Si cambian mis prioridades
${lista(p.prioridades)}

## Preguntas antes de reservar
${lista(p.preguntas)}

## Qué debes verificar
${lista(p.verificar)}

## Siguiente paso
${lista(p.siguiente)}`;
}

/* ─────────────── Miraflores: 3 alojamientos, el ejemplo completo de la guía ─────────────── */

const DATOS_MIRAFLORES: DatosComparar = {
  tipo: "alojamiento",
  opciones: [
    opcion({
      id: "hotel",
      nombre: "Hotel Casa Andina Miraflores",
      precio: "1850",
      moneda: "S/",
      incluye: "desayuno buffet, wifi, piscina",
      extrasConocidos: "ninguno conocido",
      costoExtra: "0",
      duracion: "4 noches, check-in 15:00 / check-out 12:00",
      horasTrayecto: "0",
      ubicacion: "Miraflores, a 5 min a pie del malecón",
      condiciones: "cancelación gratis hasta 48 horas antes",
    }),
    opcion({
      id: "hostal",
      nombre: "Hostal Kaminu Miraflores",
      precio: "680",
      moneda: "S/",
      incluye: "desayuno continental, wifi",
      extrasConocidos: "depósito de garantía S/ 50, reembolsable",
      costoExtra: "0",
      duracion: "4 noches, check-in 14:00 / check-out 11:00",
      horasTrayecto: "0.5",
      ubicacion: "Miraflores, a 20 min a pie del malecón",
      condiciones: "cancelación gratis hasta 24 horas antes",
    }),
    opcion({
      id: "airbnb",
      nombre: "Airbnb en Barranco",
      precio: "1200",
      moneda: "S/",
      incluye: "wifi, cocina equipada",
      extrasConocidos: "tarifa de limpieza S/ 90 + comisión de servicio S/ 60",
      costoExtra: "150",
      duracion: "4 noches, check-in flexible coordinando con el anfitrión",
      horasTrayecto: "0.3",
      ubicacion: "Barranco, a 15 min en taxi de Miraflores",
      condiciones: "reembolso parcial: 50 % si cancelas con 5 días o más de anticipación",
    }),
  ],
  viajeros: "2 adultos",
  fechas: "12 al 16 de noviembre de 2026",
  valorTiempo: "25",
  criterios: [
    criterio("precio", "Precio", 25),
    criterio("tiempo", "Tiempo", 15),
    criterio("comodidad", "Comodidad", 20),
    criterio("ubicacion", "Ubicación", 15),
    criterio("flexibilidad", "Flexibilidad", 10),
    criterio("actividades", "Actividades", 15),
  ],
  puntuaciones: {
    hotel: { precio: "2", tiempo: "5", comodidad: "5", ubicacion: "5", flexibilidad: "3", actividades: "4" },
    hostal: { precio: "5", tiempo: "4", comodidad: "3", ubicacion: "4", flexibilidad: "2", actividades: "3" },
    airbnb: { precio: "4", tiempo: "4", comodidad: "4", ubicacion: "3", flexibilidad: "4", actividades: "3" },
  } satisfies Puntuaciones,
};

const RESPUESTA_MIRAFLORES = armar({
  tabla: [
    ["Opción", "Precio", "Incluye", "Ubicación", "Costo total ajustado", "Puntuación ponderada", "Comodidad"],
    ["Hotel Casa Andina Miraflores", "S/ 1,850.00", "desayuno buffet, wifi, piscina", "Miraflores, a 5 min a pie del malecón", "S/ 1,850.00", "78/100", "[VALORACIÓN] Muy cómodo: cama amplia y buena limpieza"],
    ["Hostal Kaminu Miraflores", "S/ 680.00", "desayuno continental, wifi", "Miraflores, a 20 min a pie del malecón", "S/ 692.50", "74/100", "[VALORACIÓN] Cómodo pero sencillo: habitaciones pequeñas"],
    ["Airbnb en Barranco", "S/ 1,200.00", "wifi, cocina equipada", "Barranco, a 15 min en taxi de Miraflores", "S/ 1,357.50", "74/100", "[VALORACIÓN] Cómodo y espacioso, aunque queda en otro distrito"],
  ],
  costos: [
    "Confirma si el depósito de garantía de S/ 50 del hostal se cobra en la reserva o al llegar, y si es reembolsable en efectivo o solo en la misma tarjeta.",
    "El Airbnb ya suma la tarifa de limpieza y la comisión de servicio en el costo total ajustado; confirma que no aparezcan cargos adicionales al pagar.",
    "Ninguna de las tres opciones menciona un impuesto municipal por turismo: pregunta si aplica en tu caso.",
  ],
  diferencias: [
    "El hostal cuesta S/ 680 frente a los S/ 1,850 del hotel, pero el hotel está más cerca del malecón y no suma horas de traslado.",
    "El Airbnb cuesta S/ 1,200 en Barranco: sumar la tarifa de limpieza, la comisión de servicio y el traslado sube su costo real a S/ 1,357.50, más que el hostal.",
    "El hostal exige avisar la cancelación con menos anticipación (24 horas) que el hotel (48 horas): conviene si no tienes la fecha 100 % segura.",
  ],
  ventajas: [
    "Hotel Casa Andina Miraflores: el más cómodo y mejor ubicado de los tres; desventaja: es el más caro, casi el triple que el hostal.",
    "Hostal Kaminu Miraflores: el más barato incluso después del ajuste; desventaja: habitaciones más sencillas y más lejos del malecón.",
    "Airbnb en Barranco: más espacio y cocina propia; desventaja: queda en otro distrito y, con el ajuste, cuesta más que el hostal.",
  ],
  prioridades: ["Si priorizas el precio, conviene el Hostal Kaminu Miraflores.", "Si priorizas la comodidad y el tiempo, conviene el Hotel Casa Andina Miraflores."],
  preguntas: [
    "¿El depósito de garantía del hostal se devuelve completo si no hay daños?",
    "¿El Airbnb permite el check-in a la hora que necesitas o cobra un cargo por check-in fuera de horario?",
    "¿El hotel confirma la política de cancelación por escrito antes de cobrar?",
  ],
  verificar: ["Confirma la tarifa vigente de cada alojamiento antes de reservar: los precios de esta comparación pueden haber cambiado.", "Revisa las reseñas más recientes de cada opción, no solo las más antiguas o las destacadas."],
  siguiente: ["Reserva la opción elegida con al menos una semana de anticipación para asegurar el precio comparado."],
});

/* ─────────────── Lima–Cusco: 2 vuelos (directo vs. con escala) ─────────────── */

const DATOS_CUSCO: DatosComparar = {
  tipo: "transporte",
  opciones: [
    opcion({
      id: "directo",
      nombre: "Vuelo directo LATAM",
      precio: "420",
      moneda: "S/",
      incluye: "1 maleta de 23 kg, asiento estándar",
      extrasConocidos: "ninguno conocido",
      costoExtra: "0",
      duracion: "1 h 25 min, directo, sale 07:10",
      horasTrayecto: "1.5",
      ubicacion: "Aeropuerto Jorge Chávez",
      condiciones: "cambio de fecha con penalidad de S/ 80",
    }),
    opcion({
      id: "escala",
      nombre: "Vuelo con escala Sky Airline",
      precio: "260",
      moneda: "S/",
      incluye: "solo equipaje de mano de 10 kg",
      extrasConocidos: "maleta de 23 kg se paga aparte",
      costoExtra: "90",
      duracion: "4 h 10 min con escala en Arequipa, sale 05:30",
      horasTrayecto: "4.2",
      ubicacion: "Aeropuerto Jorge Chávez",
      condiciones: "sin cambios de fecha (tarifa básica)",
    }),
  ],
  viajeros: "1 adulto",
  fechas: "3 de octubre de 2026",
  valorTiempo: "15",
  criterios: [criterio("precio", "Precio", 40), criterio("tiempo", "Tiempo", 30), criterio("comodidad", "Comodidad", 15), criterio("flexibilidad", "Flexibilidad", 15)],
  puntuaciones: {
    directo: { precio: "3", tiempo: "5", comodidad: "4", flexibilidad: "4" },
    escala: { precio: "5", tiempo: "2", comodidad: "2", flexibilidad: "1" },
  } satisfies Puntuaciones,
};

const RESPUESTA_CUSCO = armar({
  tabla: [
    ["Opción", "Precio", "Duración", "Costo total ajustado", "Puntuación ponderada", "Comodidad"],
    ["Vuelo directo LATAM", "S/ 420.00", "1 h 25 min, directo, sale 07:10", "S/ 442.50", "78/100", "[VALORACIÓN] Cómodo: sin escalas ni madrugada extrema"],
    ["Vuelo con escala Sky Airline", "S/ 260.00", "4 h 10 min con escala en Arequipa, sale 05:30", "S/ 413.00", "61/100", "[VALORACIÓN] Incómodo: madrugada y escala larga"],
  ],
  costos: [
    "El vuelo con escala no incluye maleta de 23 kg: confirma el precio exacto de agregarla al pagar.",
    "Ninguna de las dos tarifas menciona el costo del traslado hasta el aeropuerto de origen: revísalo aparte.",
  ],
  diferencias: [
    "El vuelo con escala cuesta S/ 260 frente a los S/ 420 del directo, pero al sumar la maleta (S/ 90) y casi 3 horas más de trayecto, su costo ajustado (S/ 413.00) casi iguala al directo (S/ 442.50).",
    "El directo permite cambiar la fecha pagando S/ 80 de penalidad; la tarifa con escala no admite cambios.",
  ],
  ventajas: ["Vuelo directo LATAM: más cómodo, más rápido y permite cambiar la fecha; desventaja: el precio inicial más alto.", "Vuelo con escala Sky Airline: el precio inicial más bajo; desventaja: casi 3 horas más de viaje, madrugada y sin cambios de fecha."],
  prioridades: ["Si priorizas el precio, conviene el vuelo con escala Sky Airline (aunque la diferencia real, ya ajustada, es mínima).", "Si priorizas la comodidad y el tiempo, conviene el vuelo directo LATAM."],
  preguntas: ["¿Cuánto cuesta exactamente agregar la maleta de 23 kg en la tarifa con escala?", "¿La escala en Arequipa exige bajar del avión o es solo una parada técnica?", "¿El horario de salida a las 05:30 es compatible con tu traslado al aeropuerto?"],
  verificar: ["Confirma el precio final de cada vuelo, con la maleta incluida, directamente en la aerolínea antes de pagar.", "Verifica el horario vigente: los vuelos con escala suelen cambiar de horario más seguido que los directos."],
  siguiente: ["Compara ambos precios finales (con maleta incluida) el mismo día antes de decidir."],
});

/* ─────────────── Máncora: paquete todo incluido vs. armado por tu cuenta ─────────────── */

const DATOS_MANCORA: DatosComparar = {
  tipo: "paquete",
  opciones: [
    opcion({
      id: "paquete",
      nombre: "Paquete todo incluido Máncora Sol y Playa",
      precio: "2100",
      moneda: "S/",
      incluye: "vuelos ida y vuelta, 5 noches de hotel, traslados, 2 tours",
      extrasConocidos: "ninguno conocido",
      costoExtra: "0",
      duracion: "5 noches, del 6 al 11 de enero de 2027",
      horasTrayecto: "0",
      ubicacion: "hotel frente al mar en Máncora",
      condiciones: "cancelación con penalidad de 20 % hasta 15 días antes; sin reembolso después",
    }),
    opcion({
      id: "propio",
      nombre: "Armado por tu cuenta",
      precio: "1450",
      moneda: "S/",
      incluye: "vuelos ida y vuelta y 5 noches de hotel (sin traslados ni tours)",
      extrasConocidos: "traslados aeropuerto-hotel y 2 tours no incluidos",
      costoExtra: "380",
      duracion: "5 noches, del 6 al 11 de enero de 2027",
      horasTrayecto: "3",
      ubicacion: "hotel a 10 min del centro de Máncora",
      condiciones: "cada reserva tiene su propia política; el hotel permite cancelar gratis hasta 72 horas antes",
    }),
  ],
  viajeros: "2 adultos",
  fechas: "6 al 11 de enero de 2027",
  valorTiempo: "20",
  criterios: [criterio("precio", "Precio", 35), criterio("tiempo", "Tiempo", 10), criterio("comodidad", "Comodidad", 20), criterio("flexibilidad", "Flexibilidad", 20), criterio("actividades", "Actividades", 15)],
  puntuaciones: {
    paquete: { precio: "2", tiempo: "5", comodidad: "5", flexibilidad: "2", actividades: "5" },
    propio: { precio: "5", tiempo: "3", comodidad: "3", flexibilidad: "4", actividades: "2" },
  } satisfies Puntuaciones,
};

const RESPUESTA_MANCORA = armar({
  tabla: [
    ["Opción", "Precio", "Incluye", "Costo total ajustado", "Puntuación ponderada", "Comodidad"],
    ["Paquete todo incluido Máncora Sol y Playa", "S/ 2,100.00", "vuelos, 5 noches de hotel, traslados, 2 tours", "S/ 2,100.00", "67/100", "[VALORACIÓN] Muy cómodo: no hay que coordinar nada por separado"],
    ["Armado por tu cuenta", "S/ 1,450.00", "vuelos y 5 noches de hotel (sin traslados ni tours)", "S/ 1,890.00", "75/100", "[VALORACIÓN] Cómodo si no te molesta coordinar traslados y tours aparte"],
  ],
  costos: [
    "«Armado por tu cuenta» no incluye traslados ni tours: confirma el precio real de esos 2 tours antes de sumar el total.",
    "El paquete no detalla si el precio incluye impuestos y tasas de aeropuerto: pregúntalo antes de pagar.",
  ],
  diferencias: [
    "El paquete cuesta S/ 2,100 con todo incluido; armarlo por tu cuenta parte de S/ 1,450, pero al sumar traslados y tours (S/ 380) y las horas de coordinación, su costo ajustado sube a S/ 1,890.00: sigue siendo más barato, aunque la diferencia se reduce.",
    "El paquete solo admite cancelar con una penalidad del 20 % hasta 15 días antes; el hotel de la opción armada por tu cuenta permite cancelar gratis hasta 72 horas antes.",
  ],
  ventajas: [
    "Paquete todo incluido: más cómodo, no exige coordinar nada por separado; desventaja: el más caro y el menos flexible para cancelar.",
    "Armado por tu cuenta: más barato incluso ajustado y más flexible para cancelar; desventaja: exige coordinar traslados y tours por separado.",
  ],
  prioridades: ["Si priorizas el precio, conviene armarlo por tu cuenta.", "Si priorizas la comodidad y el tiempo, conviene el paquete todo incluido."],
  preguntas: ["¿El precio del paquete incluye impuestos y tasas de aeropuerto?", "¿Cuánto cuestan exactamente los 2 tours si los reservas por separado?", "¿El hotel de la opción armada por tu cuenta confirma el traslado desde el aeropuerto o hay que contratarlo aparte?"],
  verificar: ["Confirma el precio final de ambas opciones, con impuestos y traslados incluidos, antes de pagar.", "Revisa la política de cancelación completa de cada reserva, no solo la del hotel o la del paquete."],
  siguiente: ["Cotiza los 2 tours por separado antes de decidir entre las dos opciones."],
});

export const EJEMPLOS_COMPARAR: EjemploComparar[] = [
  { id: "miraflores", etiqueta: "Alojamiento en Miraflores", descripcion: "3 alojamientos en Lima, con precio, comodidad y ubicación en juego.", datos: DATOS_MIRAFLORES, respuesta: RESPUESTA_MIRAFLORES },
  { id: "cusco", etiqueta: "Vuelo Lima–Cusco", descripcion: "2 vuelos: uno directo y más caro, otro con escala y más barato.", datos: DATOS_CUSCO, respuesta: RESPUESTA_CUSCO },
  { id: "mancora", etiqueta: "Paquete a Máncora", descripcion: "Paquete todo incluido frente a armar el viaje por tu cuenta.", datos: DATOS_MANCORA, respuesta: RESPUESTA_MANCORA },
];
