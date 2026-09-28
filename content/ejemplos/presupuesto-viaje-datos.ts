import type { DatosPresupuesto, Linea } from "@/lib/presupuesto/tipos";

/**
 * Datos de los tres viajes de ejemplo de «Presupuesto de viaje». TODO es ficticio: destinos reales, pero personas, precios,
 * fuentes y tipos de cambio son inventados solo para ilustrar la herramienta. No son precios reales de ningún servicio.
 */
const linea = (id: string, l: Partial<Linea> & Pick<Linea, "categoria" | "concepto" | "monto" | "unidad" | "tipo">): Linea => ({
  id,
  enAlterna: false,
  minimo: "",
  maximo: "",
  fuente: "",
  fecha: "",
  ...l,
});

export const DATOS_PAREJA_CUSCO: DatosPresupuesto = {
  destino: "Cusco (Perú), saliendo de Lima",
  salida: "2026-11-12",
  regreso: "2026-11-17",
  noches: "5",
  dias: "",
  adultos: "2",
  ninos: "0",
  moneda: "S/",
  monedaAlterna: "",
  tipoCambio: "",
  imprevistos: "10",
  descartados: [],
  lineas: [
    linea("p1", { categoria: "transporte-principal", concepto: "Vuelos Lima–Cusco–Lima (los 2 pasajes)", monto: "900", unidad: "viaje", tipo: "conocido", fuente: "Cotización de ejemplo (ficticia)", fecha: "2026-09-20" }),
    linea("p2", { categoria: "traslados", concepto: "Traslado aeropuerto ↔ alojamiento", monto: "80", unidad: "viaje", tipo: "estimado", minimo: "60", maximo: "100" }),
    linea("p3", { categoria: "alojamiento", concepto: "Hostal, habitación doble", monto: "150", unidad: "noche", tipo: "conocido", minimo: "120", maximo: "200", fuente: "Página del hostal (ejemplo ficticio)", fecha: "2026-09-20" }),
    linea("p4", { categoria: "comidas", concepto: "Comidas (gasto diario por persona)", monto: "60", unidad: "persona-dia", tipo: "estimado", minimo: "45", maximo: "80" }),
    linea("p5", { categoria: "actividades", concepto: "Entradas a sitios turísticos", monto: "500", unidad: "viaje", tipo: "conocido", minimo: "350", fuente: "Páginas oficiales de cada sitio (ejemplo ficticio)", fecha: "2026-09-21" }),
    linea("p6", { categoria: "transporte-local", concepto: "Transporte local (taxis y buses urbanos)", monto: "200", unidad: "viaje", tipo: "estimado", minimo: "150", maximo: "250" }),
  ],
};

export const DATOS_FAMILIA_PARACAS: DatosPresupuesto = {
  destino: "Paracas (Ica, Perú), en auto propio desde Lima",
  salida: "2026-12-04",
  regreso: "2026-12-07",
  noches: "3",
  dias: "",
  adultos: "2",
  ninos: "2",
  moneda: "S/",
  monedaAlterna: "",
  tipoCambio: "",
  imprevistos: "15",
  descartados: [],
  lineas: [
    linea("f1", { categoria: "transporte-principal", concepto: "Combustible y peajes, ida y vuelta", monto: "260", unidad: "viaje", tipo: "estimado", minimo: "220", maximo: "300" }),
    linea("f2", { categoria: "alojamiento", concepto: "Bungalow familiar", monto: "320", unidad: "noche", tipo: "conocido", minimo: "280", maximo: "380", fuente: "Página del alojamiento (ejemplo ficticio)", fecha: "2026-09-22" }),
    linea("f3", { categoria: "comidas", concepto: "Comidas (gasto diario por persona)", monto: "45", unidad: "persona-dia", tipo: "estimado", minimo: "35", maximo: "60" }),
    linea("f4", { categoria: "actividades", concepto: "Paseo en bote (una entrada por viajero)", monto: "35", unidad: "persona", tipo: "conocido", fuente: "Página del operador (ejemplo ficticio)", fecha: "2026-09-22" }),
    linea("f5", { categoria: "otros", concepto: "Estacionamiento", monto: "30", unidad: "viaje", tipo: "estimado" }),
    linea("f6", { categoria: "compras", concepto: "Recuerdos y juguetes (tope)", monto: "150", unidad: "viaje", tipo: "opcional", minimo: "100" }),
  ],
};

export const DATOS_SOLO_SANTIAGO: DatosPresupuesto = {
  destino: "Santiago (Chile), saliendo de Lima",
  salida: "2027-01-10",
  regreso: "2027-01-17",
  noches: "7",
  dias: "",
  adultos: "1",
  ninos: "0",
  moneda: "S/",
  monedaAlterna: "USD",
  tipoCambio: "3.75",
  imprevistos: "12",
  descartados: [],
  lineas: [
    linea("s1", { categoria: "transporte-principal", concepto: "Vuelo Lima–Santiago–Lima", monto: "310", unidad: "persona", tipo: "conocido", enAlterna: true, fuente: "Cotización de ejemplo (ficticia)", fecha: "2026-09-23" }),
    linea("s2", { categoria: "alojamiento", concepto: "Hostal, cama en dormitorio compartido", monto: "22", unidad: "noche", tipo: "conocido", enAlterna: true, minimo: "18", maximo: "30", fuente: "Página del hostal (ejemplo ficticio)", fecha: "2026-09-23" }),
    linea("s3", { categoria: "comidas", concepto: "Comidas (gasto diario)", monto: "25", unidad: "persona-dia", tipo: "estimado", enAlterna: true, minimo: "18", maximo: "35" }),
    linea("s4", { categoria: "transporte-local", concepto: "Metro y buses urbanos (gasto diario)", monto: "6", unidad: "persona-dia", tipo: "estimado", enAlterna: true }),
    linea("s5", { categoria: "actividades", concepto: "Excursión de un día", monto: "45", unidad: "persona", tipo: "conocido", enAlterna: true, fuente: "Página del operador (ejemplo ficticio)", fecha: "2026-09-24" }),
    linea("s6", { categoria: "seguro", concepto: "Seguro de viaje", monto: "28", unidad: "persona", tipo: "conocido", enAlterna: true, fuente: "Página de la aseguradora (ejemplo ficticio)", fecha: "2026-09-24" }),
    linea("s7", { categoria: "conectividad", concepto: "eSIM con datos", monto: "12", unidad: "persona", tipo: "estimado", enAlterna: true }),
    linea("s8", { categoria: "compras", concepto: "Compras y recuerdos (tope)", monto: "100", unidad: "viaje", tipo: "opcional" }),
  ],
};
