import { datosVaciosItinerario, type DatosItinerario, type Interes, type Lugar, type Ritmo, type Transporte } from "@/lib/itinerario/tipos";

export interface EjemploItinerario {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosItinerario;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente. */
  respuesta: string;
}

/**
 * Tres ejemplos. TODO es ficticio: personas, alojamientos, tours, restaurantes y reservas están inventados solo para ilustrar la
 * herramienta. No son horarios ni precios reales; antes de viajar, verifícalos en la fuente oficial de cada lugar.
 */
const BASE = datosVaciosItinerario();
const lug = (id: string, v: Partial<Lugar> & { nombre: string; prioridad: Lugar["prioridad"] }): Lugar => ({ id, horario: "", reserva: "", ...v });

/** Fila del itinerario: [dia, fecha, zona, hora_inicio, hora_fin, actividad, tipo, lugar, nota, verificado]. */
type FilaEj = [number, string, string, string, string, string, string, string, string, "si" | "no"];
const campo = (t: string) => (/[",]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
const csv = (filas: FilaEj[]) => ["dia,fecha,zona,hora_inicio,hora_fin,actividad,tipo,lugar,nota,verificado", ...filas.map((f) => f.map((x) => campo(String(x))).join(","))].join("\n");

interface Partes {
  itinerario: FilaEj[];
  porQue: string[];
  planesB: string[];
  presupuesto: string[];
  verificar: string[];
  siguiente: string[];
}

const lista = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");

function armar(p: Partes): string {
  return `## Itinerario
${csv(p.itinerario)}

## Por qué este orden
${lista(p.porQue)}

## Planes B
${lista(p.planesB)}

## Presupuesto estimado
${lista(p.presupuesto)}

## Qué debes verificar
${lista(p.verificar)}

## Siguiente paso
${lista(p.siguiente)}`;
}

/* ─────────────── Arequipa: pareja, 4 días, ritmo equilibrado (el ejemplo de la especificación) ─────────────── */

const DATOS_AREQUIPA: DatosItinerario = {
  ...BASE,
  destino: "Arequipa, Perú",
  fechaInicio: "2026-11-10",
  fechaFin: "2026-11-13",
  horaLlegada: "11:00",
  horaSalida: "14:00",
  ciudadLlegada: "",
  ciudadSalida: "",
  alojamiento: "Hotel en el Centro Histórico de Arequipa, a media cuadra de la Plaza de Armas",
  adultos: "2",
  viajerosTexto: "Pareja adulta, sin niños. Uno de los dos prefiere evitar caminatas muy largas por una rodilla sensible.",
  movilidadReducida: false,
  presupuesto: "",
  intereses: ["historia-y-cultura", "gastronomia", "naturaleza"] as Interes[],
  interesesTexto: "",
  ritmo: "equilibrado" as Ritmo,
  transporte: ["a-pie", "taxi"] as Transporte[],
  restricciones: "Preferimos evitar reservas muy temprano en la mañana, salvo el tour al Colca, que ya sabemos que sale de madrugada.",
  lugares: [
    lug("a1", { nombre: "Plaza de Armas de Arequipa", prioridad: "imprescindible" }),
    lug("a2", { nombre: "Monasterio de Santa Catalina", prioridad: "imprescindible", horario: "abre de 9:00 a 17:00 (por verificar)" }),
    lug("a3", { nombre: "Mirador de Yanahuara", prioridad: "opcional" }),
    lug("a4", { nombre: "Tour al Cañón del Colca", prioridad: "imprescindible", reserva: "reserva confirmada para el 11 de noviembre, recojo en el hotel a las 04:00" }),
    lug("a5", { nombre: "Museo Santuarios Andinos", prioridad: "opcional", horario: "cerrado los domingos (por verificar)" }),
    lug("a6", { nombre: "Mercado San Camilo", prioridad: "opcional" }),
  ],
};

const RESPUESTA_AREQUIPA = armar({
  itinerario: [
    [1, "2026-11-10", "Centro", "11:00", "11:30", "Traslado del aeropuerto al alojamiento", "traslado", "Alojamiento en el Centro", "Recojo en taxi", "si"],
    [1, "2026-11-10", "Centro", "12:00", "13:00", "Almuerzo de bienvenida", "comida", "Restaurante en el Centro", "", "si"],
    [1, "2026-11-10", "Centro", "14:30", "15:30", "Visitar la Plaza de Armas y la Catedral", "imprescindible", "Plaza de Armas de Arequipa", "Espacio público, sin horario de cierre", "si"],
    [1, "2026-11-10", "Centro", "15:45", "17:00", "Recorrer el Monasterio de Santa Catalina", "imprescindible", "Monasterio de Santa Catalina", "Confirma el horario de cierre antes de ir", "no"],
    [1, "2026-11-10", "Centro", "17:15", "18:00", "Tiempo libre para descansar tras el vuelo", "libre", "", "", "si"],
    [1, "2026-11-10", "Centro", "19:30", "20:30", "Cena", "comida", "Restaurante en el Centro", "", "si"],
    [2, "2026-11-11", "Valle del Colca", "04:00", "04:30", "Recojo para el tour, según la reserva confirmada", "traslado", "Tour al Cañón del Colca", "", "si"],
    [2, "2026-11-11", "Valle del Colca", "04:30", "08:30", "Viaje en bus hacia el cañón, con paradas panorámicas", "imprescindible", "Tour al Cañón del Colca", "", "no"],
    [2, "2026-11-11", "Valle del Colca", "08:30", "09:30", "Desayuno incluido en el poblado de Chivay", "comida", "Tour al Cañón del Colca", "", "si"],
    [2, "2026-11-11", "Valle del Colca", "09:30", "12:00", "Mirador Cruz del Cóndor: observación de cóndores", "imprescindible", "Tour al Cañón del Colca", "Mejor probabilidad de ver cóndores en la mañana (por verificar)", "no"],
    [2, "2026-11-11", "Valle del Colca", "12:30", "13:30", "Almuerzo buffet incluido en el tour", "comida", "Tour al Cañón del Colca", "", "si"],
    [2, "2026-11-11", "Valle del Colca", "13:30", "18:00", "Regreso a Arequipa", "traslado", "Tour al Cañón del Colca", "", "si"],
    [3, "2026-11-12", "Yanahuara", "09:00", "10:00", "Desayuno", "comida", "Alojamiento", "", "si"],
    [3, "2026-11-12", "Yanahuara", "10:30", "11:30", "Visitar el Museo Santuarios Andinos", "imprescindible", "Museo Santuarios Andinos", "Confirma si abre en domingo", "no"],
    [3, "2026-11-12", "Yanahuara", "12:00", "12:45", "Ver la ciudad desde el mirador", "opcional", "Mirador de Yanahuara", "", "si"],
    [3, "2026-11-12", "Yanahuara", "13:00", "14:00", "Almuerzo", "comida", "Restaurante en Yanahuara", "", "si"],
    [3, "2026-11-12", "Yanahuara", "14:30", "15:30", "Tiempo libre", "libre", "", "", "si"],
    [3, "2026-11-12", "Centro", "16:00", "17:00", "Comprar recuerdos", "opcional", "Mercado San Camilo", "", "si"],
    [3, "2026-11-12", "Centro", "19:00", "20:00", "Cena", "comida", "Restaurante en el Centro", "", "si"],
    [4, "2026-11-13", "Centro", "09:00", "10:00", "Desayuno", "comida", "Alojamiento", "", "si"],
    [4, "2026-11-13", "Centro", "10:15", "11:15", "Última caminata y compras finales", "opcional", "Plaza de Armas de Arequipa", "", "si"],
    [4, "2026-11-13", "Centro", "11:30", "12:00", "Check-out del alojamiento", "traslado", "Alojamiento", "", "si"],
    [4, "2026-11-13", "Centro", "12:15", "13:45", "Traslado al aeropuerto", "traslado", "Aeropuerto de Arequipa", "", "si"],
  ],
  porQue: [
    "Día 1 (Centro): carga reducida por la llegada a las 11:00; el Monasterio y la Plaza de Armas están a poca distancia a pie del alojamiento, así que no hace falta transporte adicional.",
    "Día 2 (Valle del Colca): el tour ocupa el día completo por la reserva confirmada a las 04:00; no se programa nada más para no arriesgar el regreso.",
    "Día 3 (Yanahuara): el museo y el mirador se agrupan porque están en la misma zona; el mercado se deja para la tarde, cuando hay más movimiento comercial.",
    "Día 4 (Centro): carga reducida por la salida a las 14:00; solo una actividad opcional antes del traslado al aeropuerto.",
  ],
  planesB: [
    "Día 1: Vuelo con retraso y llegada después de las 11:00 | Reduce la visita a la Plaza de Armas y deja el Monasterio para la mañana del día 3, antes del museo.",
    "Día 2: El tour se cancela por clima | Reprograma el Cañón del Colca con la agencia y usa el día para el Mirador de Yanahuara y el Museo Santuarios Andinos.",
    "Día 3: Cansancio tras el tour del día anterior | Deja el Mercado San Camilo para el día 4 y extiende el tiempo libre de la tarde.",
    "Día 4: Tráfico camino al aeropuerto | Sal del alojamiento 30 minutos antes y omite la actividad opcional de la mañana.",
  ],
  presupuesto: ["No aportaste un presupuesto ni precios para tus lugares, así que no se estima ningún monto: agrégalo en el paso 1 si quieres que se comente aquí."],
  verificar: [
    "El horario real del Monasterio de Santa Catalina y si cierra algún día de la semana.",
    "Si el Museo Santuarios Andinos cierra los domingos, en su página oficial.",
    "La hora exacta de recojo del tour al Cañón del Colca con la agencia, por si cambia.",
    "Los requisitos de entrada a Perú según tu nacionalidad, en fuentes oficiales.",
  ],
  siguiente: ["Confirma el horario del Monasterio y del museo antes de imprimir el itinerario.", "Exporta el itinerario a tu calendario y revisa el plan B de cada día."],
});

/* ─────────────── Cusco: familia con niños, 3 días, ritmo relajado ─────────────── */

const DATOS_CUSCO: DatosItinerario = {
  ...BASE,
  destino: "Cusco, Perú",
  fechaInicio: "2026-08-05",
  fechaFin: "2026-08-07",
  horaLlegada: "10:00",
  horaSalida: "16:00",
  ciudadLlegada: "Lima (con conexión)",
  ciudadSalida: "Lima (con conexión)",
  alojamiento: "Hotel familiar cerca de la Plaza de Armas del Cusco",
  adultos: "2",
  viajerosTexto: "2 niños de 6 y 9 años. El mayor se cansa rápido por la altura, así que preferimos actividades cortas.",
  movilidadReducida: false,
  presupuesto: "Unos S/ 800 para actividades y comidas en los 3 días (aparte de vuelos y alojamiento).",
  intereses: ["historia-y-cultura", "con-ninos", "naturaleza"] as Interes[],
  interesesTexto: "",
  ritmo: "relajado" as Ritmo,
  transporte: ["taxi", "a-pie"] as Transporte[],
  restricciones: "Uno de los niños es alérgico al maní: evitar platos con maní o cacahuate. Necesitan un horario de descanso después del almuerzo.",
  lugares: [
    lug("c1", { nombre: "Plaza de Armas del Cusco", prioridad: "imprescindible" }),
    lug("c2", { nombre: "Qorikancha", prioridad: "imprescindible" }),
    lug("c3", { nombre: "Museo Inka", prioridad: "opcional", horario: "cerrado los domingos (por verificar)" }),
    lug("c4", { nombre: "Mercado San Pedro", prioridad: "opcional" }),
  ],
};

const RESPUESTA_CUSCO = armar({
  itinerario: [
    [1, "2026-08-05", "Centro", "10:00", "10:30", "Traslado del aeropuerto al alojamiento", "traslado", "Alojamiento", "", "si"],
    [1, "2026-08-05", "Centro", "11:00", "12:00", "Descanso por la altura (aclimatación)", "libre", "", "Evita esfuerzos el primer día por el soroche", "si"],
    [1, "2026-08-05", "Centro", "13:00", "14:00", "Almuerzo, sin maní", "comida", "Restaurante cerca del alojamiento", "Avisar la alergia al pedir", "si"],
    [1, "2026-08-05", "Centro", "14:00", "15:30", "Horario de descanso de los niños", "libre", "", "", "si"],
    [1, "2026-08-05", "Centro", "16:00", "17:00", "Paseo corto por la Plaza de Armas", "imprescindible", "Plaza de Armas del Cusco", "Espacio público, sin horario de cierre", "si"],
    [1, "2026-08-05", "Centro", "19:00", "20:00", "Cena, sin maní", "comida", "Restaurante cerca del alojamiento", "Avisar la alergia al pedir", "si"],
    [2, "2026-08-06", "Centro histórico", "09:00", "10:00", "Desayuno", "comida", "Alojamiento", "", "si"],
    [2, "2026-08-06", "Centro histórico", "10:30", "11:30", "Visitar el Qorikancha (Templo del Sol)", "imprescindible", "Qorikancha", "", "no"],
    [2, "2026-08-06", "Centro histórico", "12:00", "13:00", "Museo Inka, con salas pensadas para niños", "opcional", "Museo Inka", "Confirma si abre en domingo", "no"],
    [2, "2026-08-06", "Centro histórico", "13:30", "14:30", "Almuerzo, sin maní", "comida", "Restaurante en el Centro", "Avisar la alergia al pedir", "si"],
    [2, "2026-08-06", "Centro histórico", "14:30", "16:00", "Horario de descanso de los niños", "libre", "", "", "si"],
    [2, "2026-08-06", "Centro histórico", "16:30", "17:30", "Tiempo libre en la plaza, para que los niños jueguen", "libre", "", "", "si"],
    [2, "2026-08-06", "Centro histórico", "19:00", "20:00", "Cena, sin maní", "comida", "Restaurante en el Centro", "Avisar la alergia al pedir", "si"],
    [3, "2026-08-07", "Centro", "09:00", "10:00", "Desayuno", "comida", "Alojamiento", "", "si"],
    [3, "2026-08-07", "Centro", "10:30", "11:30", "Compras y frutas locales", "opcional", "Mercado San Pedro", "", "si"],
    [3, "2026-08-07", "Centro", "12:00", "12:30", "Check-out del alojamiento", "traslado", "Alojamiento", "", "si"],
    [3, "2026-08-07", "Centro", "13:00", "14:00", "Almuerzo cerca del aeropuerto, sin maní", "comida", "Restaurante cerca del aeropuerto", "Avisar la alergia al pedir", "si"],
    [3, "2026-08-07", "Centro", "14:15", "15:15", "Traslado al aeropuerto", "traslado", "Aeropuerto de Cusco", "", "si"],
  ],
  porQue: [
    "Día 1 (Centro): la primera tarde queda libre para aclimatarse a la altura antes de cualquier caminata; solo una actividad corta después del horario de descanso de los niños.",
    "Día 2 (Centro histórico): el Qorikancha y el Museo Inka están cerca uno del otro, así que se visitan seguidos antes del almuerzo y del descanso.",
    "Día 3 (Centro): carga reducida por la salida a las 16:00; solo el mercado antes del traslado al aeropuerto.",
  ],
  planesB: [
    "Día 1: Alguien se siente mal por la altura | Cancela el paseo de la tarde y descansa en el alojamiento; reprograma la Plaza de Armas para el día 3.",
    "Día 2: Los niños están muy cansados para el museo | Omite el Museo Inka y usa ese tiempo para el descanso o para jugar en la plaza.",
    "Día 3: El vuelo se adelanta | Cambia el mercado por algo dentro del alojamiento y sal antes hacia el aeropuerto.",
  ],
  presupuesto: [
    "Con tu presupuesto de S/ 800 para actividades y comidas en 3 días, los gastos de este itinerario (entradas puntuales, comidas y transporte corto) deberían caber, pero no tenemos precios reales de cada lugar: confirma las entradas antes de ir.",
  ],
  verificar: [
    "Si el Museo Inka abre los domingos, en su página oficial.",
    "El horario del Qorikancha antes de ir.",
    "Las opciones sin maní del restaurante que elijas, directamente con el local.",
    "Recomendaciones médicas sobre el soroche para niños, con un profesional de salud.",
  ],
  siguiente: ["Reserva las entradas al Qorikancha y al Museo Inka con anticipación si es posible.", "Avisa la alergia al maní en cada restaurante antes de pedir."],
});

/* ─────────────── Lima: viaje de trabajo, 2 días, ritmo intenso ─────────────── */

const DATOS_LIMA: DatosItinerario = {
  ...BASE,
  destino: "Lima, Perú",
  fechaInicio: "2026-06-02",
  fechaFin: "2026-06-03",
  horaLlegada: "20:00",
  horaSalida: "19:00",
  ciudadLlegada: "",
  ciudadSalida: "",
  alojamiento: "Hotel cerca de San Isidro (zona financiera)",
  adultos: "1",
  viajerosTexto: "Viajo solo, sin niños.",
  movilidadReducida: false,
  presupuesto: "",
  intereses: ["gastronomia"] as Interes[],
  interesesTexto: "Aprovechar algún buen restaurante si el tiempo alcanza.",
  ritmo: "intenso" as Ritmo,
  transporte: ["taxi"] as Transporte[],
  restricciones: "Debo estar disponible por videollamada de 9:00 a 11:00 el día 2 (reunión con mi equipo remoto). Prefiero evitar caminar distancias largas por el poco tiempo.",
  lugares: [
    lug("l1", { nombre: "Oficina del cliente en San Isidro", prioridad: "imprescindible", reserva: "reunión confirmada para el 3 de junio a las 15:00" }),
    lug("l2", { nombre: "Restaurante recomendado en Miraflores", prioridad: "opcional" }),
  ],
};

const RESPUESTA_LIMA = armar({
  itinerario: [
    [1, "2026-06-02", "San Isidro", "20:00", "20:30", "Traslado del aeropuerto al hotel", "traslado", "Hotel en San Isidro", "", "si"],
    [1, "2026-06-02", "San Isidro", "21:00", "22:00", "Cena ligera cerca del hotel", "comida", "Restaurante cerca del hotel", "", "si"],
    [2, "2026-06-03", "San Isidro", "07:00", "08:00", "Desayuno en el hotel", "comida", "Hotel en San Isidro", "", "si"],
    [2, "2026-06-03", "San Isidro", "11:30", "12:30", "Tiempo libre para responder correos y prepararse", "libre", "", "Después de la videollamada de las 9:00 a 11:00", "si"],
    [2, "2026-06-03", "Miraflores", "13:00", "14:30", "Almuerzo, aprovechando la recomendación local", "comida", "Restaurante recomendado en Miraflores", "", "si"],
    [2, "2026-06-03", "San Isidro", "15:00", "16:30", "Reunión con el cliente", "imprescindible", "Oficina del cliente en San Isidro", "Hora ya confirmada por el cliente", "si"],
    [2, "2026-06-03", "San Isidro", "17:00", "17:30", "Check-out del hotel", "traslado", "Hotel en San Isidro", "", "si"],
    [2, "2026-06-03", "San Isidro", "17:45", "18:45", "Traslado al aeropuerto", "traslado", "Aeropuerto de Lima", "", "si"],
  ],
  porQue: [
    "Día 1 (San Isidro): llegada nocturna; solo se programa el traslado y una cena ligera para descansar antes de la reunión del día siguiente.",
    "Día 2 (San Isidro y Miraflores): la mañana queda libre para la videollamada con el equipo remoto; el almuerzo se aprovecha para conocer Miraflores antes de la reunión de las 15:00, ya confirmada, y el resto del día se deja para el traslado de salida.",
  ],
  planesB: [
    "Día 1: Vuelo con retraso y llegada después de medianoche | Omite la cena fuera y pide algo al hotel.",
    "Día 2: La reunión con el cliente se adelanta o se retrasa | Cambia el almuerzo en Miraflores por algo cerca de la oficina para no arriesgar el traslado al aeropuerto.",
  ],
  presupuesto: ["No aportaste un presupuesto ni precios para tus lugares, así que no se estima ningún monto."],
  verificar: [
    "La hora exacta de la reunión con el cliente, por si cambia.",
    "El tiempo real de traslado al aeropuerto según el tráfico de la zona a esa hora.",
    "Si necesitas algún requisito especial para el viaje de trabajo (carta de invitación, seguro), con tu empresa o en fuentes oficiales del destino.",
  ],
  siguiente: ["Confirma con el cliente la hora de la reunión un día antes.", "Exporta el itinerario a tu calendario para no perder la videollamada de las 9:00."],
});

export const EJEMPLOS_ITINERARIO: EjemploItinerario[] = [
  { id: "arequipa-pareja", etiqueta: "Pareja en Arequipa (4 días)", descripcion: "Ritmo equilibrado, con el tour al Cañón del Colca ya reservado.", datos: DATOS_AREQUIPA, respuesta: RESPUESTA_AREQUIPA },
  { id: "cusco-familia", etiqueta: "Familia con niños en Cusco (3 días)", descripcion: "Ritmo relajado, con horarios de descanso y una alergia alimentaria.", datos: DATOS_CUSCO, respuesta: RESPUESTA_CUSCO },
  { id: "lima-trabajo", etiqueta: "Viaje de trabajo a Lima (2 días)", descripcion: "Ritmo intenso, con una reunión ya confirmada y poco tiempo libre.", datos: DATOS_LIMA, respuesta: RESPUESTA_LIMA },
];
