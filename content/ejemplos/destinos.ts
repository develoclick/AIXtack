import { datosVaciosDestinos, type DatosDestinos } from "@/lib/destinos/tipos";

export interface EjemploDestinos {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosDestinos;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente. */
  respuesta: string;
}

/**
 * Tres ejemplos. TODO es ficticio: destinos, precios y fuentes están inventados solo para ilustrar la herramienta. No son
 * precios reales de ningún pasaje ni alojamiento. Antes de viajar, consulta precios reales. Las cifras de cada ejemplo se
 * calcularon con lib/destinos/calculo.ts (no a mano).
 */
function datos(p: Partial<DatosDestinos>): DatosDestinos {
  return { ...datosVaciosDestinos(), ...p };
}

interface FilaEj {
  destino: string;
  fechas: string;
  noches: number | "";
  pasaje: number | "";
  alojamiento: number | "";
  total: number | "";
  fuentePasaje: string;
  fuenteAlojamiento: string;
  consultadoEn: string;
  tipoDato: "real" | "estimacion" | "sin_dato";
}
const campo = (t: string) => (/[",]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
const csv = (filas: FilaEj[]) =>
  [
    "destino,fechas,noches,pasaje_pp,alojamiento_noche,total,fuente_pasaje,fuente_alojamiento,consultado_en,tipo_dato",
    ...filas.map((f) => [f.destino, f.fechas, f.noches, f.pasaje, f.alojamiento, f.total, f.fuentePasaje, f.fuenteAlojamiento, f.consultadoEn, f.tipoDato].map((x) => campo(String(x))).join(",")),
  ].join("\n");

interface Partes {
  acceso: "si" | "no";
  filas: FilaEj[];
  gastos: string[];
  recomendaciones: string[];
  verificar: string[];
  siguiente: string[];
}
const lista = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");

function armar(p: Partes): string {
  return `ACCESO A PRECIOS ACTUALIZADOS: ${p.acceso}

## Destinos candidatos
\`\`\`csv
${csv(p.filas)}
\`\`\`

## Gastos que podrían encarecer
${lista(p.gastos)}

## Recomendaciones para ahorrar
${lista(p.recomendaciones)}

## Qué debes verificar
${lista(p.verificar)}

## Siguiente paso
${lista(p.siguiente)}`;
}

/* ─────────────── Cusco, Máncora y Arequipa desde Lima: el ejemplo de la especificación ─────────────── */

const DATOS_CUSCO: DatosDestinos = datos({
  presupuesto: "2500",
  moneda: "S/",
  origen: "Lima, Perú",
  viajeros: "2",
  fechaInicio: "2026-11-10",
  fechaFin: "2026-11-15",
  nochesMin: "5",
  nochesMax: "7",
  nochesSimuladas: "5",
  alojamiento: "hotel",
  comodidad: "media",
  preferencias: ["montana", "ciudad"],
  alcance: "nacional",
  gastoDiario: "70",
  imprevistos: "10",
});

const RESPUESTA_CUSCO = armar({
  acceso: "si",
  filas: [
    { destino: "Cusco", fechas: "10 al 15 de noviembre de 2026", noches: 5, pasaje: 350, alojamiento: 120, total: 1300, fuentePasaje: "buscador de vuelos", fuenteAlojamiento: "plataforma de alojamiento", consultadoEn: "29/09/2026 10:00", tipoDato: "real" },
    { destino: "Máncora", fechas: "10 al 15 de noviembre de 2026", noches: 5, pasaje: 180, alojamiento: 220, total: 1460, fuentePasaje: "buscador de vuelos", fuenteAlojamiento: "plataforma de alojamiento", consultadoEn: "29/09/2026 10:05", tipoDato: "real" },
    { destino: "Arequipa", fechas: "10 al 15 de noviembre de 2026", noches: 5, pasaje: 200, alojamiento: 90, total: 850, fuentePasaje: "buscador de vuelos", fuenteAlojamiento: "plataforma de alojamiento", consultadoEn: "29/09/2026 10:10", tipoDato: "real" },
  ],
  gastos: ["Traslados desde el aeropuerto hasta el hotel en los tres destinos.", "Entradas a atractivos turísticos (no incluidas en pasaje ni alojamiento).", "Cusco: la Boleto Turístico General, si planeas visitar varios sitios arqueológicos."],
  recomendaciones: ["Compara la misma fecha entre semana y en fin de semana: el pasaje suele variar.", "En Arequipa, un departamento puede salir más barato que un hotel para 2 personas.", "Revisa si el alojamiento incluye desayuno antes de sumarlo a tu gasto diario."],
  verificar: ["Confirma el precio final de cada pasaje, con equipaje incluido si lo necesitas.", "Verifica la política de cancelación del alojamiento antes de reservar.", "Revisa si el destino elegido pide algún requisito de entrada (documento de identidad vigente)."],
  siguiente: ["Arequipa deja el mayor margen de tu presupuesto: revisa sus fechas y reserva si te convence."],
});

/* ─────────────── Buenos Aires, Santiago y Bogotá desde Lima: viaje internacional, 1 persona ─────────────── */

const DATOS_INTERNACIONAL: DatosDestinos = datos({
  presupuesto: "4000",
  moneda: "S/",
  origen: "Lima, Perú",
  viajeros: "1",
  fechaInicio: "2027-02-10",
  fechaFin: "2027-02-18",
  nochesMin: "6",
  nochesMax: "8",
  nochesSimuladas: "",
  alojamiento: "departamento",
  comodidad: "media",
  preferencias: ["ciudad"],
  alcance: "internacional",
  gastoDiario: "100",
  imprevistos: "15",
});

const RESPUESTA_INTERNACIONAL = armar({
  acceso: "si",
  filas: [
    { destino: "Buenos Aires", fechas: "10 al 18 de febrero de 2027", noches: 8, pasaje: 1200, alojamiento: 150, total: 2400, fuentePasaje: "buscador de vuelos", fuenteAlojamiento: "plataforma de alojamiento", consultadoEn: "29/09/2026 11:00", tipoDato: "real" },
    { destino: "Santiago de Chile", fechas: "10 al 18 de febrero de 2027", noches: 8, pasaje: 950, alojamiento: 110, total: 1830, fuentePasaje: "búsqueda web, sin fuente única confirmada", fuenteAlojamiento: "búsqueda web, sin fuente única confirmada", consultadoEn: "", tipoDato: "estimacion" },
    { destino: "Bogotá", fechas: "", noches: "", pasaje: "", alojamiento: "", total: "", fuentePasaje: "", fuenteAlojamiento: "", consultadoEn: "", tipoDato: "sin_dato" },
  ],
  gastos: ["Visado o requisitos de entrada, según tu nacionalidad, en los tres destinos.", "Seguro de viaje internacional (recomendable para viajes fuera de Perú).", "Transporte interno en Buenos Aires y Santiago (metro o taxi desde el aeropuerto)."],
  recomendaciones: ["Si tu fecha es flexible, compara una semana antes y una después: en temporada alta el pasaje sube.", "Un departamento con cocina puede bajar tu gasto diario real, aunque el gasto diario que estimaste fue igual para los tres destinos.", "Bogotá no se pudo consultar en esta respuesta: prueba con otro buscador o cambia el destino."],
  verificar: ["Confirma si tu documento de identidad es suficiente para entrar a cada país o si necesitas pasaporte o visa.", "Verifica el tipo de cambio del día antes de decidir con precios en otra moneda.", "Confirma la fuente del precio de Santiago antes de tratarlo como definitivo: quedó marcado como estimación."],
  siguiente: ["Busca directamente el precio de Bogotá en tu buscador de vuelos habitual: esta respuesta no pudo consultarlo."],
});

/* ─────────────── Paracas o Ica, presupuesto ajustado: ningún destino entra a 3 noches ─────────────── */

const DATOS_ESCAPADA: DatosDestinos = datos({
  presupuesto: "800",
  moneda: "S/",
  origen: "Lima, Perú",
  viajeros: "2",
  fechaInicio: "2026-10-17",
  fechaFin: "2026-10-19",
  nochesMin: "2",
  nochesMax: "3",
  nochesSimuladas: "",
  alojamiento: "hostal",
  comodidad: "economica",
  preferencias: ["playa", "naturaleza"],
  alcance: "nacional",
  gastoDiario: "80",
  imprevistos: "10",
});

const RESPUESTA_ESCAPADA = armar({
  acceso: "si",
  filas: [
    { destino: "Paracas", fechas: "17 al 20 de octubre de 2026", noches: 3, pasaje: 90, alojamiento: 60, total: 360, fuentePasaje: "búsqueda web, precio de temporada, sin fuente única", fuenteAlojamiento: "búsqueda web, precio de temporada, sin fuente única", consultadoEn: "", tipoDato: "estimacion" },
    { destino: "Ica", fechas: "17 al 20 de octubre de 2026", noches: 3, pasaje: 70, alojamiento: 50, total: 290, fuentePasaje: "búsqueda web, precio de temporada, sin fuente única", fuenteAlojamiento: "búsqueda web, precio de temporada, sin fuente única", consultadoEn: "", tipoDato: "estimacion" },
  ],
  gastos: ["Transporte interno entre el terminal y el hostal.", "Tours a las reservas naturales (no incluidos en el pasaje ni el hostal)."],
  recomendaciones: ["Reduce las noches del viaje: con 2 noches en vez de 3, tu reserva para gastos baja y puede alcanzarte.", "Busca un bus en vez de avión para estos destinos: suele ser más barato para trayectos cortos por tierra.", "Un hostal con cocina compartida puede bajar tu gasto diario real de comida."],
  verificar: ["Confirma el precio del transporte terrestre en la empresa que elijas: cambia según el horario.", "Revisa si el hostal pide una noche de depósito antes de reservar."],
  siguiente: ["Prueba el simulador con 2 noches en vez de 3: revisa si Ica pasa a ser viable con tu presupuesto."],
});

export const EJEMPLOS_DESTINOS: EjemploDestinos[] = [
  { id: "cusco", etiqueta: "Cusco, Máncora o Arequipa (2 personas)", descripcion: "Presupuesto de S/ 2.500 para 2 personas, 5 a 7 noches, viaje nacional.", datos: DATOS_CUSCO, respuesta: RESPUESTA_CUSCO },
  { id: "internacional", etiqueta: "Buenos Aires, Santiago o Bogotá (1 persona)", descripcion: "Presupuesto de S/ 4.000 para 1 persona, 6 a 8 noches, viaje internacional.", datos: DATOS_INTERNACIONAL, respuesta: RESPUESTA_INTERNACIONAL },
  { id: "escapada", etiqueta: "Escapada corta con presupuesto ajustado", descripcion: "Presupuesto de S/ 800 para 2 personas, 2 a 3 noches: ningún destino entra a 3 noches.", datos: DATOS_ESCAPADA, respuesta: RESPUESTA_ESCAPADA },
];
