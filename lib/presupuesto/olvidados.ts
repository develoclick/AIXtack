import { comparable } from "@/lib/cv/normalizar";
import { parsearNumero, type Calculo } from "./calculo";
import { categoriaPorId, type CategoriaId, type DatosPresupuesto, type Linea, type Unidad } from "./tipos";

export interface GastoOlvidado {
  id: string;
  categoria: CategoriaId;
  concepto: string;
  /** Por qué suele olvidarse (y cuándo aplica). */
  porQue: string;
  /** Dónde consultar el precio: nunca damos el precio. */
  dondeConsultar: string;
  unidad: Unidad;
  /** Palabras que, si aparecen en el concepto de una línea, indican que ya lo tienes cubierto. */
  palabras: string[];
}

/** Los 15 gastos que casi todos olvidan. Fuente única: la guía, el detector y el botón «Añadir a mi tabla» leen esta lista. */
export const GASTOS_OLVIDADOS: GastoOlvidado[] = [
  { id: "seguro", categoria: "seguro", concepto: "Seguro de viaje", porQue: "Se deja «para después» y se olvida, o se descarta por costo sin comparar lo que cubre.", dondeConsultar: "Las páginas de las aseguradoras: compara coberturas, exclusiones y condiciones, no solo el precio.", unidad: "persona", palabras: ["seguro", "asistencia"] },
  { id: "equipaje", categoria: "equipaje", concepto: "Equipaje de bodega o de mano adicional", porQue: "Algunas tarifas de vuelo o de bus no incluyen maleta y el cargo aparece al final de la compra.", dondeConsultar: "Las condiciones de tu tarifa en la página de la aerolínea o de la empresa de transporte.", unidad: "persona", palabras: ["equipaje", "maleta", "bodega", "valija"] },
  { id: "tasas", categoria: "documentos", concepto: "Tasas de aeropuerto, de entrada o de salida, o tasa turística", porQue: "Algunos destinos cobran tasas que no siempre están en el precio del pasaje ni del alojamiento.", dondeConsultar: "La página oficial de migraciones o de turismo del destino y las condiciones de tu reserva. No las des por sentado: dependen del destino.", unidad: "persona", palabras: ["tasa", "impuesto", "migracion", "salida del pais"] },
  { id: "visa", categoria: "documentos", concepto: "Visa, autorización de viaje o trámites de documentos", porQue: "Depende de tu nacionalidad y del destino; se descubre tarde y tiene plazos.", dondeConsultar: "El consulado o la página oficial de migraciones del país de destino.", unidad: "persona", palabras: ["visa", "visado", "autorizacion", "pasaporte", "tramite"] },
  { id: "entradas", categoria: "actividades", concepto: "Entradas y reservas de atracciones", porQue: "Se piensa en «qué ver» y no en cuánto cuesta entrar; varias se reservan con anticipación.", dondeConsultar: "La página oficial de cada lugar (precios, horarios, días de cierre y si hay tarifa para niños o residentes).", unidad: "persona", palabras: ["entrada", "ticket", "boleto", "museo", "tour", "excursion", "reserva de"] },
  { id: "traslado-aeropuerto", categoria: "traslados", concepto: "Traslado del aeropuerto al alojamiento (ida y vuelta)", porQue: "El pasaje se compra con cuidado y el traslado se da por hecho, sin sumarlo a la cuenta.", dondeConsultar: "El alojamiento (muchos ofrecen traslado), la empresa de transporte del aeropuerto o las tarifas oficiales publicadas.", unidad: "viaje", palabras: ["traslado", "aeropuerto", "transfer", "terminal"] },
  { id: "transporte-local", categoria: "transporte-local", concepto: "Transporte local dentro del destino", porQue: "Los trayectos diarios (bus, metro, taxi) parecen pequeños, pero se repiten todos los días y entre todas las personas.", dondeConsultar: "Las tarifas oficiales del transporte de la ciudad o la aplicación de transporte que uses.", unidad: "persona-dia", palabras: ["transporte local", "taxi", "metro", "bus urbano", "movilidad", "combi", "colectivo"] },
  { id: "conectividad", categoria: "conectividad", concepto: "SIM local, eSIM o roaming", porQue: "Se da por hecho que habrá wifi; sin datos cuesta llegar al alojamiento, pedir transporte o pagar.", dondeConsultar: "Tu operador (planes de roaming) y las tiendas de SIM o los proveedores de eSIM del destino.", unidad: "persona", palabras: ["sim", "esim", "roaming", "datos moviles", "chip", "internet"] },
  { id: "comision-tarjeta", categoria: "comisiones", concepto: "Comisión por pagar con tarjeta o retirar en cajero en el extranjero", porQue: "Se paga en cada compra y retiro, sin verse como un gasto aparte hasta que llega el estado de cuenta.", dondeConsultar: "El tarifario de tu banco o de tu tarjeta (comisiones por compras en moneda extranjera y por retiros).", unidad: "viaje", palabras: ["comision", "tarjeta", "cajero", "retiro"] },
  { id: "cambio", categoria: "comisiones", concepto: "Diferencia de la casa de cambio o del tipo de cambio", porQue: "El tipo de cambio de compra y el de venta no son iguales, y cada casa de cambio aplica el suyo.", dondeConsultar: "Las casas de cambio o los bancos: compara el tipo de compra y el de venta antes de cambiar.", unidad: "viaje", palabras: ["cambio de moneda", "casa de cambio", "tipo de cambio", "diferencial"] },
  { id: "propinas", categoria: "propinas", concepto: "Propinas", porQue: "En algunos países son parte de la costumbre y en otros no; se nota al pagar la cuenta.", dondeConsultar: "Guías de viajeros locales o de tu alojamiento: la costumbre depende del lugar.", unidad: "viaje", palabras: ["propina"] },
  { id: "alojamiento-cargos", categoria: "alojamiento", concepto: "Cargos del alojamiento (limpieza, servicio, depósito de garantía)", porQue: "El precio por noche que aparece primero puede no incluir cargos que se suman al pagar.", dondeConsultar: "El resumen final de la reserva y las condiciones del alojamiento.", unidad: "viaje", palabras: ["limpieza", "deposito", "garantia", "cargo del alojamiento", "resort"] },
  { id: "asiento", categoria: "transporte-principal", concepto: "Selección de asiento o embarque prioritario", porQue: "Si viajan juntos y quieren sentarse cerca, algunas tarifas lo cobran aparte.", dondeConsultar: "El proceso de compra o de check-in de la aerolínea.", unidad: "persona", palabras: ["asiento", "embarque", "prioritari"] },
  { id: "salud", categoria: "seguro", concepto: "Vacunas exigidas, medicinas y botiquín", porQue: "Algunos destinos exigen vacunas o certificados, y las medicinas personales se compran antes de salir.", dondeConsultar: "La autoridad de salud de tu país y del destino, o tu médico. No asumas requisitos: verifícalos.", unidad: "persona", palabras: ["vacuna", "medicina", "botiquin", "farmacia"] },
  { id: "salida-aeropuerto", categoria: "traslados", concepto: "Transporte hasta tu aeropuerto o terminal de salida", porQue: "Está antes del viaje y no entra en «el destino», así que se queda fuera de la cuenta.", dondeConsultar: "Tu aplicación de transporte habitual o la tarifa de tu terminal.", unidad: "viaje", palabras: ["salida", "mi aeropuerto", "hasta el aeropuerto", "estaciona"] },
];

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

/** ¿La persona ya tiene una línea (con o sin monto) que cubre este gasto? */
export function estaCubierto(g: GastoOlvidado, lineas: Linea[]): boolean {
  return lineas.some((l) => {
    const c = norm(l.concepto);
    return c !== "" && g.palabras.some((p) => c.includes(norm(p)));
  });
}

/**
 * Detector de «gastos olvidados»: los gastos de la lista que no aparecen en ninguna línea y que la persona no marcó como «no aplica».
 * El equipaje y la selección de asiento solo se sugieren si hay una línea de transporte principal; el resto, siempre.
 */
export function gastosQueFaltan(d: DatosPresupuesto): GastoOlvidado[] {
  const hayTransporte = d.lineas.some((l) => l.categoria === "transporte-principal");
  return GASTOS_OLVIDADOS.filter((g) => {
    if (d.descartados.includes(g.id)) return false;
    if ((g.id === "equipaje" || g.id === "asiento") && !hayTransporte) return false;
    return !estaCubierto(g, d.lineas);
  });
}

/** La línea (vacía, de tipo «estimado») que se agrega al pulsar «Añadir a mi tabla» en un gasto olvidado. */
export function lineaDeGasto(g: GastoOlvidado, id: string): Linea {
  return { id, categoria: g.categoria, concepto: g.concepto, monto: "", unidad: g.unidad, tipo: "estimado", enAlterna: false, minimo: "", maximo: "", fuente: "", fecha: "" };
}

export interface AvisoCoherencia {
  id: string;
  /** «alto»: el total puede estar mal; «medio»: conviene revisarlo; «bajo»: mejora la calidad del presupuesto. */
  nivel: "alto" | "medio" | "bajo";
  texto: string;
  /** Línea a la que se refiere (si aplica). */
  linea?: string;
}

/** Revisión local de coherencia: unidades mal aplicadas, duplicados, datos que faltan y montos sin respaldo. No usa IA. */
export function revisarCoherencia(d: DatosPresupuesto, c: Calculo): AvisoCoherencia[] {
  const avisos: AvisoCoherencia[] = [];
  const nombre = (l: Linea) => l.concepto.trim() || categoriaPorId(l.categoria).nombre;
  const viajeros = c.personas ?? 0;

  if (c.personas === null) avisos.push({ id: "adultos", nivel: "alto", texto: "Falta el número de adultos: sin él no se pueden calcular los gastos «por persona»." });
  if (c.noches === null) avisos.push({ id: "noches", nivel: "alto", texto: "Falta el número de noches (o las fechas de salida y regreso): sin él no se pueden calcular los gastos «por noche» ni «por día»." });
  if (d.lineas.some((l) => l.enAlterna) && c.tipoCambio === null) avisos.push({ id: "cambio", nivel: "alto", texto: "Hay líneas en la moneda alterna pero falta el tipo de cambio: no se suman hasta que lo escribas." });

  const vistos = new Map<string, Linea>();
  for (const l of d.lineas) {
    const clave = `${l.categoria}|${norm(l.concepto)}`;
    if (norm(l.concepto) && vistos.has(clave)) avisos.push({ id: `dup-${l.id}`, nivel: "medio", linea: l.id, texto: `«${nombre(l)}» aparece más de una vez en la misma categoría: ¿es un duplicado?` });
    vistos.set(clave, l);

    const monto = parsearNumero(l.monto);
    const min = parsearNumero(l.minimo);
    const max = parsearNumero(l.maximo);
    if (l.monto.trim() && monto === null) avisos.push({ id: `num-${l.id}`, nivel: "alto", linea: l.id, texto: `«${nombre(l)}»: el monto no es un número válido.` });
    if (monto === null) continue;
    if (l.categoria === "comidas" && viajeros > 1 && (l.unidad === "viaje" || l.unidad === "noche")) avisos.push({ id: `comidas-${l.id}`, nivel: "medio", linea: l.id, texto: `«${nombre(l)}»: las comidas se cuentan «por viaje» o «por noche», pero comen ${viajeros} personas. Suele ser más fiable calcularlas «por persona y día».` });
    if (l.categoria === "alojamiento" && viajeros > 1 && l.unidad === "persona-dia") avisos.push({ id: `aloj-${l.id}`, nivel: "bajo", linea: l.id, texto: `«${nombre(l)}»: el alojamiento suele cobrarse por habitación y noche. Está bien «por persona y día» solo si el precio es por cama (por ejemplo, un hostal compartido).` });
    if (l.categoria === "transporte-principal" && viajeros > 1 && l.unidad === "viaje" && l.tipo === "conocido") avisos.push({ id: `tp-${l.id}`, nivel: "bajo", linea: l.id, texto: `«${nombre(l)}»: comprueba que el monto sea el total de los ${viajeros} pasajes (está «por viaje»). Si es el precio de uno, cámbialo a «por persona».` });
    if (l.tipo === "conocido" && !l.fuente.trim()) avisos.push({ id: `fuente-${l.id}`, nivel: "bajo", linea: l.id, texto: `«${nombre(l)}» está marcada como «conocido» pero no anotaste la fuente ni la fecha de consulta.` });
    if (min !== null && min > monto) avisos.push({ id: `min-${l.id}`, nivel: "medio", linea: l.id, texto: `«${nombre(l)}»: el mínimo es mayor que el monto.` });
    if (max !== null && max < monto) avisos.push({ id: `max-${l.id}`, nivel: "medio", linea: l.id, texto: `«${nombre(l)}»: el máximo es menor que el monto.` });
  }
  const sinMonto = d.lineas.filter((l) => parsearNumero(l.monto) === null && l.monto.trim() === "");
  if (sinMonto.length > 0) avisos.push({ id: "sin-monto", nivel: "bajo", texto: `${sinMonto.length} ${sinMonto.length === 1 ? "línea no tiene" : "líneas no tienen"} monto y ${sinMonto.length === 1 ? "no suma" : "no suman"}: ${sinMonto.slice(0, 4).map(nombre).join(", ")}${sinMonto.length > 4 ? "…" : ""}.` });
  if (c.escenarios.intermedio.subtotal > 0 && c.porcentajes.conocido === 0) avisos.push({ id: "sin-conocidos", nivel: "medio", texto: "Ningún gasto está marcado como «conocido»: todo el presupuesto es una estimación. Consulta al menos el transporte y el alojamiento." });
  if (c.escenarios.intermedio.subtotal > 0 && c.pctImprevistos < c.margenReferencia.minimo) avisos.push({ id: "margen", nivel: "medio", texto: `Tu margen de imprevistos es ${c.pctImprevistos} % y, con la proporción de gastos estimados que tienes, la referencia práctica es ${c.margenReferencia.texto}.` });
  return avisos;
}
