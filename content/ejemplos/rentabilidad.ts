import { datosVaciosRentabilidad, itemVacio, productoVacio, type DatosRentabilidad, type ItemMonto, type Producto } from "@/lib/rentabilidad/tipos";

export interface EjemploRentabilidad {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosRentabilidad;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente y los cálculos de lib/rentabilidad/calculo.ts (verificados con un script antes de escribir este archivo). */
  respuesta: string;
}

/**
 * Tres ejemplos. TODO es ficticio: negocios y cifras están inventados solo para ilustrar la herramienta. Cada cifra de
 * ingresos, costos, margen, punto de equilibrio y sensibilidad coincide exactamente con lo que calcula
 * lib/rentabilidad/calculo.ts sobre los datos de cada ejemplo (verificado con un script antes de escribir este archivo).
 */
function prod(nombre: string, precio: string, costo: string, unidades: string): Producto {
  return { ...productoVacio(`p-${nombre}`), nombre, precio, costo, unidades };
}
function item(concepto: string, monto: string): ItemMonto {
  return { ...itemVacio(`f-${concepto}`), concepto, monto };
}

const lista = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");

interface Partes {
  resumen: string[];
  rentabilidad: string[];
  sensibilidad: string[];
  omisiones: string[];
  acciones: string[];
  verificar: string[];
  siguiente: string[];
}

function armar(p: Partes): string {
  return `## Resumen
${lista(p.resumen)}

## Rentabilidad por producto
${lista(p.rentabilidad)}

## Sensibilidad
${lista(p.sensibilidad)}

## Costos posiblemente omitidos
${lista(p.omisiones)}

## Acciones a probar
${lista(p.acciones)}

## Qué debes verificar
${lista(p.verificar)}

## Siguiente paso
${lista(p.siguiente)}`;
}

function datos(p: Partial<DatosRentabilidad>): DatosRentabilidad {
  return { ...datosVaciosRentabilidad(), ...p };
}

/* ───────────────────────── 1. Pastelería Dulce Central (el ejemplo de la especificación) ───────────────────────── */

const DATOS_PASTELERIA = datos({
  periodo: "mes",
  productos: [prod("Tortas", "60", "32", "80"), prod("Cupcakes", "6", "2.50", "900"), prod("Cajas de galletas", "15", "11.50", "600")],
  costosVariablesTipo: "porcentaje",
  costosVariablesValor: "5",
  costosFijos: [item("Alquiler, servicios y sueldos del personal", "6100")],
  incluyeSueldo: false,
  impuestosConocidos: "IGV incluido en los precios de venta.",
  objetivoUtilidad: "",
});

const RESPUESTA_PASTELERIA = armar({
  resumen: [
    "El negocio vende S/ 19.200 al mes y le queda una utilidad operativa de S/ 430 (2,2 %): el margen es muy ajustado.",
    "Las 3 líneas de producto son rentables por separado, pero las comisiones de las apps de delivery (5 % de los ingresos) y los costos fijos absorben casi toda la ganancia.",
    "Con este margen, un pequeño cambio en precio, volumen o costo puede convertir la utilidad en pérdida.",
  ],
  rentabilidad: [
    "Las cajas de galletas generan más ingresos (S/ 9.000, el 47 % del total) pero tienen el margen más bajo de los 3 productos (23 %).",
    "Los cupcakes son el producto más rentable por unidad vendida: 58 % de margen y S/ 3.150 de contribución total, la mayor de los 3.",
    "Las tortas aportan S/ 2.240 de contribución con apenas el 5 % de las unidades vendidas: vender pocas unidades de alto valor puede ser tan importante como vender muchas de bajo valor.",
    "Vender mucho no es lo mismo que ganar mucho: las galletas venden más en soles que las tortas, pero dejan menos margen por cada sol vendido.",
  ],
  sensibilidad: [
    "El precio de venta es la variable que más mueve el resultado: bajarlo 10 % (manteniendo todo lo demás igual) llevaría la utilidad operativa a S/ -1.394; subirlo 10 % la llevaría a S/ 2.254.",
    "El costo variable (insumos) es la segunda más sensible: si sube 10 %, la utilidad cae a S/ -837.",
    "El volumen de ventas mueve menos de lo esperado, porque el margen por unidad ya es bajo: un 10 % más de ventas solo sube la utilidad a S/ 1.083.",
    "Con un margen tan ajustado, cualquier alza de costos de insumos merece revisión inmediata de precios [HIPÓTESIS] (depende de si el mercado acepta un precio más alto).",
  ],
  omisiones: [
    "No se incluyó el sueldo del dueño en los costos fijos: si el dueño trabaja en el negocio sin pagarse, la utilidad real es menor a los S/ 430 calculados.",
    "No se registraron mermas de insumos (masa, crema, frutas que se dañan o sobran): en una pastelería esto suele representar un costo real que no está en el cálculo actual [HIPÓTESIS] (depende de cuánto se desperdicie en la práctica).",
    "No se registró depreciación del horno ni de otros equipos: ese desgaste es un costo real, aunque no se pague en efectivo cada mes.",
  ],
  acciones: [
    "Probar un aumento de precio de S/ 1 en las cajas de galletas (el producto de menor margen) y medir si baja la demanda [HIPÓTESIS]: evalúa con las ventas de las próximas 2 semanas frente a las 2 anteriores.",
    "Negociar el costo de insumos de las galletas con el proveedor, ya que es el producto con menor margen y mayor volumen de ingresos.",
    "Registrar las mermas durante un mes para saber su costo real y volver a calcular la utilidad con ese dato.",
    "Revisar si conviene reducir la dependencia de las apps de delivery (5 % de comisión) impulsando más pedidos directos.",
  ],
  verificar: ["Confirma si tu sueldo como dueño ya está incluido en «Alquiler, servicios y sueldos del personal» o si falta agregarlo aparte.", "Verifica el % real de comisión que cobra cada app de delivery: puede variar entre plataformas."],
  siguiente: ["Agrega tu sueldo como un costo fijo separado y vuelve a calcular la utilidad operativa real antes de tomar decisiones de precio."],
});

/* ───────────────────────── 2. Taller de Costura Doña Rosa (servicios, costo = horas + materiales) ───────────────────────── */

const DATOS_COSTURA = datos({
  periodo: "mes",
  productos: [prod("Confección de vestido a medida", "120", "70", "20"), prod("Arreglo de ropa", "25", "8", "60"), prod("Clases grupales de costura", "40", "15", "30")],
  costosVariablesTipo: "porcentaje",
  costosVariablesValor: "0",
  costosFijos: [item("Alquiler del taller", "800"), item("Servicios (luz, agua, internet)", "250"), item("Sueldo de una asistente", "1200")],
  incluyeSueldo: false,
  impuestosConocidos: "",
  objetivoUtilidad: "",
});

const RESPUESTA_COSTURA = armar({
  resumen: [
    "El taller vende S/ 5.100 al mes y le queda una utilidad operativa de S/ 520 (10,2 % de margen): mejor que el margen típico de un negocio con costos de insumos altos.",
    "El costo directo (materiales y horas) suma S/ 2,330.00 y los costos fijos S/ 2,250.00: juntos absorben casi toda la utilidad bruta de S/ 2,770.00 (margen bruto: 54.3 %).",
    "No hay costos variables por venta registrados (sin comisiones ni pasarela de pago): si empiezas a cobrar con tarjeta o por una app, ese % reduciría la utilidad.",
  ],
  rentabilidad: [
    "El arreglo de ropa tiene el mejor margen (68 %) y, aunque cada arreglo vale poco, el volumen (60 al mes) lo convierte en el producto con mayor contribución total: S/ 1.020.",
    "La confección de vestidos a medida tiene el menor margen relativo (42 %) porque el costo de materiales y horas por prenda es alto, pero sigue siendo el segundo que más aporta: S/ 1.000.",
    "Las clases grupales tienen buen margen (63 %) y son la línea con más espacio para crecer sin sumar mucho costo fijo adicional (ya tienes el taller y la asistente).",
    "Los 3 productos son rentables: no hay ninguno que convenga eliminar con los datos actuales.",
  ],
  sensibilidad: [
    "El precio de venta es la variable más sensible: bajarlo 10 % dejaría la utilidad en apenas S/ 10 (casi el punto de equilibrio); subirlo 10 % la llevaría a S/ 1.030.",
    "El volumen de ventas es la segunda más sensible: 10 % menos de clientes bajaría la utilidad a S/ 243.",
    "Los costos fijos actuales (S/ 2,250.00) fijan el punto de equilibrio en S/ 4,142.88 de ventas al mes, unas 90 unidades: hoy el taller vende 110 unidades en total, un margen de seguridad razonable pero no muy amplio.",
  ],
  omisiones: [
    "No se registraron mermas de tela ni de hilo (retazos que no se aprovechan): en costura esto suele ser un costo pequeño pero real [HIPÓTESIS] (depende de qué tan eficiente sea el corte de cada prenda).",
    "No se registró depreciación de la máquina de coser ni de otras herramientas: ese desgaste no aparece en un solo mes, pero reduce la utilidad real a lo largo del año.",
    "No se registró mantenimiento de la máquina de coser (revisiones y repuestos), un gasto que suele aparecer de forma irregular y por eso se olvida.",
  ],
  acciones: [
    "Probar subir el precio de las clases grupales en S/ 5 (tienen buen margen y demanda estable) y medir si baja la inscripción [HIPÓTESIS]: compara las inscripciones del próximo mes.",
    "Calcular el costo real de depreciación de la máquina de coser (precio de compra ÷ años de vida útil ÷ 12) y sumarlo a los costos fijos.",
    "Llevar un registro de retazos de tela durante un mes para estimar el costo real de las mermas.",
    "Evaluar si conviene aumentar el volumen de arreglos de ropa (el producto de mayor contribución total) antes que el de confección a medida.",
  ],
  verificar: ["Confirma que el sueldo de la asistente cubre su trabajo completo, no solo una parte, para que el costo fijo sea real.", "Revisa si alguna prenda de confección a medida usó más horas de las habituales: eso cambiaría su costo directo real."],
  siguiente: ["Registra la depreciación de tus máquinas y herramientas como un costo fijo mensual, aunque no lo pagues en efectivo cada mes."],
});

/* ───────────────────────── 3. Barbería Estilo Urbano (varios productos, 2 barberos con sueldo) ───────────────────────── */

const DATOS_BARBERIA = datos({
  periodo: "mes",
  productos: [prod("Corte de cabello", "25", "12", "400"), prod("Coloración", "60", "28", "40"), prod("Productos capilares (venta)", "35", "20", "50")],
  costosVariablesTipo: "porcentaje",
  costosVariablesValor: "3",
  costosFijos: [item("Alquiler del local", "1800"), item("Sueldos de 2 barberos", "4000"), item("Servicios e insumos generales", "600")],
  incluyeSueldo: true,
  impuestosConocidos: "",
  objetivoUtilidad: "",
});

const RESPUESTA_BARBERIA = armar({
  resumen: [
    "La barbería vende S/ 14.150 al mes y le queda una utilidad operativa de S/ 405,50 (2,9 % de margen): un margen ajustado, similar al de otros negocios con muchos costos fijos (alquiler y sueldos).",
    "El corte de cabello es, por lejos, el producto que más ingresos genera: S/ 10,000.00 de los S/ 14,150.00 totales, gracias al volumen (400 cortes al mes).",
    "Ya incluiste el sueldo de los 2 barberos como costo fijo, así que esta utilidad es más realista que si ese costo faltara.",
  ],
  rentabilidad: [
    "La coloración tiene el mejor margen (53 %), pero su bajo volumen (40 al mes) hace que aporte menos contribución total (S/ 1.280) que el corte de cabello (S/ 5.200).",
    "El corte de cabello, con un margen de 52 % y el mayor volumen, es el que sostiene el negocio: aporta S/ 5,200.00 de contribución total, más que la coloración (S/ 1,280.00) y los productos capilares (S/ 750.00) juntos.",
    "La venta de productos capilares tiene el margen más bajo (43 %) y la menor contribución total (S/ 750): es la línea con más espacio de mejora.",
    "Ningún producto está perdiendo dinero, pero el corte de cabello es, claramente, el corazón del negocio.",
  ],
  sensibilidad: [
    "El precio de venta es la variable más sensible: bajarlo 10 % llevaría la utilidad a S/ -967.05 (pérdida); subirlo 10 % la llevaría a S/ 1,778.05.",
    "El costo variable (insumos por servicio) es la segunda más sensible: si sube 10 %, la utilidad cae a S/ -328.95.",
    "Con un margen operativo de solo 2,9 %, este negocio tiene poco margen de error frente a cambios de precio o de costo de insumos.",
  ],
  omisiones: [
    "No se registraron mermas de productos capilares (frascos vencidos o dañados): con inventario físico para la venta, esto puede ser un costo real [HIPÓTESIS] (depende de cuánto stock se dañe o venza).",
    "No se registró depreciación de las sillas, máquinas de corte y demás equipo del local.",
    "No se registró mantenimiento de las máquinas de corte (afilado, repuestos), un gasto que aparece de forma irregular.",
  ],
  acciones: [
    "Probar subir el precio del corte de cabello en S/ 2 (es el producto de mayor volumen) y medir si baja la cantidad de clientes [HIPÓTESIS]: compara las 2 semanas siguientes con las 2 anteriores.",
    "Impulsar más la venta de productos capilares al finalizar cada corte, ya que es la línea con más espacio de mejora en margen.",
    "Negociar el costo de los insumos de coloración con el proveedor: es el segundo mayor gasto directo por unidad.",
    "Calcular la depreciación de las máquinas de corte y sumarla a los costos fijos para tener una utilidad más realista.",
  ],
  verificar: ["Confirma que el sueldo de los 2 barberos incluye todo lo que les pagas (comisiones, propinas compartidas, beneficios), no solo el sueldo base.", "Revisa si el 3 % de costos variables cubre todas las comisiones de tarjeta y pasarela que realmente pagas."],
  siguiente: ["Registra la depreciación del equipo del local como costo fijo mensual y vuelve a calcular la utilidad operativa real."],
});

export const EJEMPLOS_RENTABILIDAD: EjemploRentabilidad[] = [
  { id: "pasteleria", etiqueta: "Pastelería con productos de distinto margen", descripcion: "Ingresos S/ 19.200/mes, utilidad operativa S/ 430 (2,2 %).", datos: DATOS_PASTELERIA, respuesta: RESPUESTA_PASTELERIA },
  { id: "costura", etiqueta: "Taller de costura (servicios)", descripcion: "Ingresos S/ 5.100/mes, utilidad operativa S/ 520 (10,2 %).", datos: DATOS_COSTURA, respuesta: RESPUESTA_COSTURA },
  { id: "barberia", etiqueta: "Barbería con 2 empleados", descripcion: "Ingresos S/ 14.150/mes, utilidad operativa S/ 405,50 (2,9 %).", datos: DATOS_BARBERIA, respuesta: RESPUESTA_BARBERIA },
];
