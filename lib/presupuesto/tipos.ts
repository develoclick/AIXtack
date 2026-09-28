/** Datos de «Presupuesto de viaje»: tipos, categorías y valores por defecto. Todo el cálculo vive en calculo.ts. */
export type Unidad = "viaje" | "noche" | "persona" | "persona-dia";
export type TipoLinea = "conocido" | "estimado" | "opcional";
export type Naturaleza = "fijo" | "variable";

export const UNIDADES: { valor: Unidad; etiqueta: string; corta: string; ayuda: string }[] = [
  { valor: "viaje", etiqueta: "Por viaje", corta: "por viaje", ayuda: "Se paga una vez por todo el viaje (por ejemplo, un traslado o el total de un vuelo para todos)." },
  { valor: "noche", etiqueta: "Por noche", corta: "por noche", ayuda: "Se multiplica por las noches (el alojamiento, si el precio es por habitación)." },
  { valor: "persona", etiqueta: "Por persona", corta: "por persona", ayuda: "Se multiplica por los viajeros (pasajes, seguro, entradas)." },
  { valor: "persona-dia", etiqueta: "Por persona y día", corta: "por persona y día", ayuda: "Se multiplica por viajeros y días (comidas, transporte local)." },
];

export const TIPOS: { valor: TipoLinea; etiqueta: string; ayuda: string }[] = [
  { valor: "conocido", etiqueta: "Conocido", ayuda: "Precio real que encontraste (con fuente)." },
  { valor: "estimado", etiqueta: "Estimado", ayuda: "Cálculo tuyo: aún sin precio real." },
  { valor: "opcional", etiqueta: "Opcional", ayuda: "Extra que podrías no hacer." },
];

export type CategoriaId =
  | "transporte-principal"
  | "traslados"
  | "alojamiento"
  | "comidas"
  | "transporte-local"
  | "actividades"
  | "seguro"
  | "equipaje"
  | "documentos"
  | "compras"
  | "conectividad"
  | "propinas"
  | "comisiones"
  | "otros";

export interface CategoriaGasto {
  id: CategoriaId;
  nombre: string;
  naturaleza: Naturaleza;
  /** Unidad con la que suele calcularse (se propone al agregar una línea; la persona la cambia). */
  unidad: Unidad;
  /** Para la guía: qué incluye y cómo se calcula. */
  incluye: string;
  /** Cómo se cuenta y dónde se consulta el precio (sin dar precios). */
  calculo: string;
}

/** Las 14 categorías de línea. Los imprevistos no son una categoría: se calculan como % sobre el subtotal. */
export const CATEGORIAS_GASTO: CategoriaGasto[] = [
  { id: "transporte-principal", nombre: "Transporte principal", naturaleza: "fijo", unidad: "persona", incluye: "Vuelos, buses interprovinciales o de larga distancia, tren, barco, alquiler de auto.", calculo: "Pasaje por persona × viajeros; el alquiler de auto, por viaje. Consulta la aerolínea o la empresa de transporte." },
  { id: "traslados", nombre: "Traslados", naturaleza: "fijo", unidad: "viaje", incluye: "Del aeropuerto o terminal al alojamiento y de vuelta; también hasta tu propio aeropuerto de salida.", calculo: "Cuenta ida y vuelta, por viaje. Consulta el servicio del alojamiento, la empresa de transporte o las tarifas oficiales del aeropuerto." },
  { id: "alojamiento", nombre: "Alojamiento", naturaleza: "fijo", unidad: "noche", incluye: "Hotel, hostal, departamento u hospedaje; cargos de limpieza o de servicio si los hay.", calculo: "Precio de la habitación por noche × noches. Si el precio es por cama o por persona, cámbialo a «por persona y día»." },
  { id: "comidas", nombre: "Comidas", naturaleza: "variable", unidad: "persona-dia", incluye: "Desayuno, almuerzo, cena y snacks. Si el alojamiento incluye desayuno, réstalo.", calculo: "Gasto diario por persona × viajeros × días. Consulta cartas de restaurantes o comentarios recientes de viajeros." },
  { id: "transporte-local", nombre: "Transporte local", naturaleza: "variable", unidad: "persona-dia", incluye: "Bus, metro, taxi, aplicaciones de transporte, combis, moto o bicicleta alquilada.", calculo: "Gasto diario por persona × viajeros × días, o un total por viaje si conoces las rutas. Consulta las tarifas oficiales del transporte de la ciudad." },
  { id: "actividades", nombre: "Actividades y entradas", naturaleza: "variable", unidad: "persona", incluye: "Museos, sitios turísticos, excursiones, espectáculos, tours guiados.", calculo: "Entrada por persona × viajeros. Consulta la página oficial de cada lugar; los precios y los horarios cambian." },
  { id: "seguro", nombre: "Seguro de viaje", naturaleza: "fijo", unidad: "persona", incluye: "Asistencia médica, cancelación o equipaje, según lo que contrates.", calculo: "Prima por persona × viajeros. Compara coberturas, no solo el precio, en la página de cada aseguradora." },
  { id: "equipaje", nombre: "Equipaje", naturaleza: "fijo", unidad: "persona", incluye: "Maleta de bodega, equipaje de mano adicional, exceso de peso, selección de asiento si cobra.", calculo: "Cargo por persona (o por tramo). Revisa las condiciones de tu tarifa en la aerolínea antes de pagar." },
  { id: "documentos", nombre: "Documentos y trámites", naturaleza: "fijo", unidad: "persona", incluye: "Pasaporte, visa o autorización de viaje, fotos, vacunas exigidas y tasas de entrada o salida.", calculo: "Por persona. Los requisitos y las tasas dependen del destino y de tu nacionalidad: verifícalos solo en fuentes oficiales." },
  { id: "compras", nombre: "Compras y recuerdos", naturaleza: "variable", unidad: "viaje", incluye: "Souvenirs, regalos, ropa, lavandería.", calculo: "Fija un tope total y márcalo como opcional." },
  { id: "conectividad", nombre: "Conectividad", naturaleza: "fijo", unidad: "persona", incluye: "SIM local, eSIM, plan de roaming o wifi portátil.", calculo: "Por persona (o por viaje si compartes datos). Consulta a tu operador y a los proveedores de eSIM." },
  { id: "propinas", nombre: "Propinas", naturaleza: "variable", unidad: "viaje", incluye: "Restaurantes, guías, choferes, hoteles, donde sea la costumbre.", calculo: "Un monto total por viaje. La costumbre cambia según el país: consulta fuentes de viajeros locales o de tu guía." },
  { id: "comisiones", nombre: "Comisiones bancarias y de cambio", naturaleza: "variable", unidad: "viaje", incluye: "Comisión por compras en el extranjero, retiros en cajeros, casa de cambio.", calculo: "Un monto total por viaje. Consulta el tarifario de tu banco o tarjeta." },
  { id: "otros", nombre: "Otros gastos", naturaleza: "variable", unidad: "viaje", incluye: "Cualquier gasto que no encaje en las demás categorías.", calculo: "Descríbelo en el concepto y elige la unidad que corresponda." },
];

export const categoriaPorId = (id: string): CategoriaGasto => CATEGORIAS_GASTO.find((c) => c.id === id) ?? CATEGORIAS_GASTO[CATEGORIAS_GASTO.length - 1];

export interface Linea {
  id: string;
  categoria: CategoriaId;
  concepto: string;
  /** Monto tal como se escribió (se convierte con parsearNumero). */
  monto: string;
  unidad: Unidad;
  tipo: TipoLinea;
  /** true: el monto está en la moneda alterna y se convierte con el tipo de cambio de la persona. */
  enAlterna: boolean;
  /** Rango opcional para los escenarios económico y holgado (en la misma moneda de la línea). */
  minimo: string;
  maximo: string;
  fuente: string;
  /** Fecha en que se consultó el precio (AAAA-MM-DD). */
  fecha: string;
}

export interface DatosPresupuesto {
  destino: string;
  salida: string;
  regreso: string;
  /** Noches escritas por la persona; si están vacías se calculan con las fechas. */
  noches: string;
  /** Días de viaje; si está vacío se usa noches + 1. */
  dias: string;
  adultos: string;
  ninos: string;
  moneda: string;
  monedaAlterna: string;
  /** Cuántas unidades de `moneda` equivalen a 1 unidad de `monedaAlterna` (dato de la persona). */
  tipoCambio: string;
  /** % de imprevistos sobre el subtotal (por defecto 10). */
  imprevistos: string;
  lineas: Linea[];
  /** Ids de sugerencias de «gastos olvidados» que la persona marcó como «no aplica». */
  descartados: string[];
}

let contador = 0;
/** Identificador único de una línea (se llama desde eventos, nunca durante el render). */
export function nuevoIdLinea(): string {
  contador += 1;
  return `l${Date.now().toString(36)}${contador}`;
}

/** Línea sin monto, con la unidad habitual de su categoría y el tipo «estimado». */
export function lineaVaciaDe(categoria: CategoriaId, id: string): Linea {
  const c = categoriaPorId(categoria);
  return { id, categoria, concepto: "", monto: "", unidad: c.unidad, tipo: "estimado", enAlterna: false, minimo: "", maximo: "", fuente: "", fecha: "" };
}

export const lineaVacia = (categoria: CategoriaId = "otros"): Linea => lineaVaciaDe(categoria, nuevoIdLinea());

/** Las cinco líneas básicas con las que arranca un presupuesto nuevo (sin montos: la persona los escribe). */
const BASICAS: CategoriaId[] = ["transporte-principal", "alojamiento", "comidas", "transporte-local", "actividades"];

export function datosVaciosPresupuesto(): DatosPresupuesto {
  return {
    destino: "",
    salida: "",
    regreso: "",
    noches: "",
    dias: "",
    adultos: "",
    ninos: "0",
    moneda: "S/",
    monedaAlterna: "",
    tipoCambio: "",
    imprevistos: "10",
    lineas: BASICAS.map((c, i) => lineaVaciaDe(c, `base-${i + 1}`)),
    descartados: [],
  };
}
