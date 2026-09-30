import { datosVaciosPlanNegocio, itemMontoVacio, type Competidor, type DatosPlanNegocio, type ItemMonto, type MiembroEquipo } from "@/lib/plan-negocio/tipos";

export interface EjemploPlanNegocio {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosPlanNegocio;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente y los cálculos de lib/plan-negocio/calculo.ts (verificados con un script antes de escribir este archivo). */
  respuesta: string;
}

/**
 * Tres ejemplos. TODO es ficticio: empresas, cifras, competidores y equipo están inventados solo para ilustrar la
 * herramienta. Cada cifra de inversión, costos fijos, margen, punto de equilibrio y escenarios coincide exactamente
 * con lo que calcula lib/plan-negocio/calculo.ts sobre los datos de cada ejemplo (verificado con un script antes de
 * escribir este archivo, no a mano).
 */
function item(concepto: string, monto: string): ItemMonto {
  return { ...itemMontoVacio(`i-${concepto}`), concepto, monto };
}
function competidor(nombre: string, oferta: string, precio: string): Competidor {
  return { id: `c-${nombre}`, nombre, oferta, precio };
}
function miembro(rol: string, experiencia: string): MiembroEquipo {
  return { id: `m-${rol}`, rol, experiencia };
}

const lista = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");
const filaTabla = (celdas: string[]) => `| ${celdas.join(" | ")} |`;
const tabla = (cabecera: string[], filas: string[][]) => [filaTabla(cabecera), `|${cabecera.map(() => "---").join("|")}|`, ...filas.map(filaTabla)].join("\n");

interface FilaCompetencia {
  nombre: string;
  oferta: string;
  precio: string;
}
interface FilaProyeccion {
  escenario: string;
  unidades: string;
  ingresos: string;
  utilidad: string;
}

interface Partes {
  resumen: string[];
  descripcion: string[];
  problema: string[];
  cliente: string[];
  mercado: string[];
  competencia: FilaCompetencia[];
  modelo: string[];
  productos: string[];
  estrategia: string[];
  operaciones: string[];
  equipo: string[];
  inversion: string[];
  costos: string[];
  proyeccion: FilaProyeccion[];
  equilibrio: string[];
  riesgos: string[];
  plan90: string[];
  verificar: string[];
  siguiente: string[];
}

function armar(p: Partes): string {
  return `## Resumen ejecutivo
${lista(p.resumen)}

## Descripción del negocio
${lista(p.descripcion)}

## Problema y propuesta de valor
${lista(p.problema)}

## Cliente objetivo
${lista(p.cliente)}

## Análisis de mercado
${lista(p.mercado)}

## Competencia
${tabla(
  ["Competidor", "Oferta", "Precio"],
  p.competencia.map((c) => [c.nombre, c.oferta, c.precio]),
)}

## Modelo de negocio
${lista(p.modelo)}

## Productos y servicios
${lista(p.productos)}

## Estrategia comercial y marketing
${lista(p.estrategia)}

## Operaciones
${lista(p.operaciones)}

## Recursos y equipo
${lista(p.equipo)}

## Inversión inicial
${lista(p.inversion)}

## Costos
${lista(p.costos)}

## Proyección de ingresos
${tabla(
  ["Escenario", "Unidades/mes", "Ingresos", "Utilidad"],
  p.proyeccion.map((e) => [e.escenario, e.unidades, e.ingresos, e.utilidad]),
)}

## Punto de equilibrio
${lista(p.equilibrio)}

## Riesgos y mitigaciones
${lista(p.riesgos)}

## Plan de acción de 90 días
${lista(p.plan90)}

## Qué debes verificar
${lista(p.verificar)}

## Siguiente paso
${lista(p.siguiente)}`;
}

function datos(p: Partial<DatosPlanNegocio>): DatosPlanNegocio {
  return { ...datosVaciosPlanNegocio(), ...p };
}

/* ───────────────────────── 1. Lavandería Express Surquillo (pedir un préstamo) ───────────────────────── */

const DATOS_LAVANDERIA = datos({
  nombreEmpresa: "Lavandería Express Surquillo",
  descripcion: "Servicio de lavado y planchado de ropa por kilo, con recojo y entrega a domicilio en Surquillo y alrededores.",
  producto: "Lavado y planchado de ropa por kilo, con recojo y entrega a domicilio en un plazo de 24 a 48 horas.",
  problema: "Profesionales y familias con poco tiempo libre postergan el lavado y planchado, o pagan tarifas altas a lavanderías que no recogen ni entregan a domicilio.",
  clienteObjetivo: "Profesionales que trabajan fuera de casa y familias de Surquillo y distritos cercanos, de 25 a 55 años, con ingresos medios.",
  ubicacion: "Surquillo, Lima",
  modeloIngresos: "Cobro por kilo de ropa lavada y planchada, con un mínimo de 5 kilos por pedido.",
  preciosPrevistos: "S/ 6 por kilo (lavado y planchado); S/ 8 por kilo si incluye prendas delicadas.",
  canalesVenta: "WhatsApp Business, redes sociales del barrio y volanteo en edificios cercanos al local.",
  competidores: [competidor("Lavandería Don Pepe", "Lavado por kilo, sin recojo a domicilio", "5.50"), competidor("QuickWash Surco (cadena)", "Lavado por kilo con recojo, app propia", "7.20")],
  recursosDisponibles: "Local de 40 m² ya identificado para alquilar; una moto propia para el reparto.",
  inversionInicial: [item("2 lavadoras industriales", "24000"), item("Secadora industrial", "8000"), item("Acondicionamiento del local", "4000"), item("Moto de reparto", "2000")],
  gastosMensuales: [item("Alquiler del local", "2200"), item("Servicios (agua, luz)", "1400"), item("Sueldo de un ayudante", "1500"), item("Combustible de la moto", "300")],
  precioVenta: "6",
  costoVariable: "2.40",
  demandaMensualEstimada: "1800",
  variacionEscenarios: "30",
  objetivos12Meses: "Llegar a 2.500 kg/mes atendidos y sumar una segunda moto de reparto.",
  equipo: [miembro("Fundadora, a cargo de operaciones", "3 años administrando un negocio familiar")],
  finalidad: "pedir-prestamo",
  infoAdicional: "El local está a media cuadra de 3 edificios residenciales nuevos.",
  respuestasFaseA:
    "El local todavía no está alquilado, pero el dueño ya dio el precio (S/ 2.200/mes) y lo puede reservar 15 días. La demanda de 1.800 kg/mes es una proyección propia, no hay una preventa todavía: la calculé a partir del número de departamentos de los 3 edificios cercanos y una tasa de conversión conservadora. No he cotizado un seguro para las lavadoras.",
});

const RESPUESTA_LAVANDERIA = armar({
  resumen: [
    "Lavandería Express Surquillo ofrece lavado y planchado por kilo con recojo y entrega a domicilio [DATO DEL USUARIO], con una inversión inicial de S/ 38,000.00 [CÁLCULO] y un punto de equilibrio de 1500 kg/mes [CÁLCULO] (5400 ÷ 3.6 = 1500 unidades/mes).",
    "El plan se redacta para pedir un préstamo [DATO DEL USUARIO]: el detalle financiero de las secciones «Inversión inicial», «Costos» y «Proyección de ingresos» es el que debe revisar la entidad.",
  ],
  descripcion: ["Servicio de lavado y planchado de ropa por kilo, con recojo y entrega a domicilio en Surquillo y alrededores [DATO DEL USUARIO].", "Opera desde un local de 40 m² identificado para alquilar, con una moto propia para el reparto [DATO DEL USUARIO]."],
  problema: [
    "Profesionales y familias con poco tiempo libre postergan el lavado y planchado, o pagan tarifas altas a lavanderías que no recogen ni entregan a domicilio [DATO DEL USUARIO].",
    "La propuesta de valor es la combinación de precio por kilo y recojo/entrega a domicilio, algo que la competencia directa identificada no ofrece completo [CÁLCULO] (a partir de la tabla de «Competencia»).",
  ],
  cliente: ["Profesionales que trabajan fuera de casa y familias de Surquillo y distritos cercanos, de 25 a 55 años, con ingresos medios [DATO DEL USUARIO]."],
  mercado: [
    "No se cuenta con un estudio de mercado propio ni con datos de tamaño de mercado verificables: no se afirma un número de clientes potenciales en el distrito [SUPUESTO] (no hay una fuente de mercado que citar).",
    "Hay al menos 3 edificios residenciales nuevos a media cuadra del local, un indicio favorable pero no una validación de demanda [DATO DEL USUARIO].",
    "Se recomienda validar la demanda con una preventa o un piloto antes de comprometer la inversión completa [SUPUESTO] (el dato de 1.800 kg/mes es una proyección propia, no una preventa, según tu respuesta a la Fase A).",
  ],
  competencia: [
    { nombre: "Lavandería Don Pepe", oferta: "Lavado por kilo, sin recojo a domicilio", precio: "S/ 5.50 [DATO DEL USUARIO]" },
    { nombre: "QuickWash Surco (cadena)", oferta: "Lavado por kilo con recojo, app propia", precio: "S/ 7.20 [DATO DEL USUARIO]" },
  ],
  modelo: ["Cobro por kilo de ropa lavada y planchada, con un mínimo de 5 kilos por pedido [DATO DEL USUARIO].", "Precio previsto de S/ 6 por kilo estándar y S/ 8 por kilo con prendas delicadas [DATO DEL USUARIO]."],
  productos: ["Lavado y planchado de ropa por kilo, con recojo y entrega a domicilio en 24 a 48 horas [DATO DEL USUARIO]."],
  estrategia: [
    "Canales previstos: WhatsApp Business, redes sociales del barrio y volanteo en los edificios cercanos [DATO DEL USUARIO].",
    "Una promoción de lanzamiento (por ejemplo, el primer recojo sin costo) puede ayudar a validar la demanda antes de comprometer más inversión [SUPUESTO] (no es un dato tuyo: es una sugerencia a evaluar).",
  ],
  operaciones: ["Recojo y entrega con la moto propia [DATO DEL USUARIO], desde un local de 40 m² identificado para alquilar [DATO DEL USUARIO]."],
  equipo: ["Fundadora a cargo de operaciones, con 3 años administrando un negocio familiar [DATO DEL USUARIO].", "Un ayudante contratado para el proceso de lavado y planchado, incluido en los gastos mensuales [CÁLCULO] (ítem «Sueldo de un ayudante» de tus gastos mensuales)."],
  inversion: [
    "Inversión total: S/ 38,000.00 [CÁLCULO] (suma de: 2 lavadoras industriales S/ 24.000, secadora industrial S/ 8.000, acondicionamiento del local S/ 4.000, moto de reparto S/ 2.000).",
    "Todavía no está firmado el contrato del local: el precio de alquiler es el que dio el dueño, con una reserva de 15 días, según tu respuesta a la Fase A [DATO DEL USUARIO].",
  ],
  costos: ["Costos fijos mensuales: S/ 5,400.00 [CÁLCULO] (alquiler S/ 2.200 + servicios S/ 1.400 + sueldo del ayudante S/ 1.500 + combustible S/ 300).", "Costo variable por kilo: S/ 2.40 [DATO DEL USUARIO]. Margen de contribución por kilo: S/ 3.60 [CÁLCULO] (6.00 − 2.40)."],
  proyeccion: [
    { escenario: "Pesimista", unidades: "1260 kg/mes", ingresos: "S/ 7,560.00", utilidad: "-S/ 864.00" },
    { escenario: "Medio", unidades: "1800 kg/mes", ingresos: "S/ 10,800.00", utilidad: "S/ 1,080.00" },
    { escenario: "Optimista", unidades: "2340 kg/mes", ingresos: "S/ 14,040.00", utilidad: "S/ 3,024.00" },
  ],
  equilibrio: [
    "Punto de equilibrio: 1500 kg/mes (S/ 9,000.00) [CÁLCULO], fórmula: 5400 ÷ 3.6 = 1500 unidades/mes.",
    "El escenario medio (1.800 kg/mes) queda 300 kg por encima del punto de equilibrio; el escenario pesimista (1.260 kg/mes) queda por debajo, y no cubre los costos fijos del mes [CÁLCULO] (comparación directa de las cifras anteriores).",
  ],
  riesgos: [
    "La demanda de 1.800 kg/mes es una proyección propia, no una preventa: si el arranque real queda cerca del escenario pesimista, el negocio no cubre sus costos fijos el primer mes [SUPUESTO] (según tu respuesta a la Fase A).",
    "El local todavía no está alquilado: si la reserva de 15 días vence antes de conseguir el financiamiento, el precio o la disponibilidad podrían cambiar [SUPUESTO] (según tu respuesta a la Fase A).",
    "No se ha cotizado un seguro para las 2 lavadoras y la secadora industrial: un daño o robo no estaría cubierto [SUPUESTO] (según tu respuesta a la Fase A, indicaste que falta cotizarlo).",
  ],
  plan90: [
    "Días 1 a 30: firmar el contrato del local, comprar el equipo y cotizar un seguro para las máquinas [DATO DEL USUARIO] (a partir de tu respuesta a la Fase A).",
    "Días 31 a 60: acondicionar el local, contratar al ayudante y lanzar los canales de venta (WhatsApp Business, redes, volanteo) [DATO DEL USUARIO].",
    "Días 61 a 90: abrir con una promoción de lanzamiento y medir los kilos reales atendidos por semana frente al escenario pesimista [SUPUESTO] (para validar la proyección de demanda cuanto antes).",
  ],
  verificar: [
    "Confirma el precio y la disponibilidad real del local antes de firmar cualquier compromiso de inversión.",
    "Revisa si el precio de los competidores (Don Pepe y QuickWash) sigue vigente antes de fijar tu propio precio por kilo.",
    "Cotiza un seguro para las lavadoras y la secadora antes de comprarlas.",
  ],
  siguiente: ["Valida la demanda con una preventa o un piloto de 4 semanas en los 3 edificios cercanos antes de comprometer toda la inversión."],
});

/* ───────────────────────── 2. Velas Aromáticas Kaypacha (organizar mis ideas) ───────────────────────── */

const DATOS_VELAS = datos({
  nombreEmpresa: "Velas Aromáticas Kaypacha",
  descripcion: "Elaboración y venta de velas aromáticas artesanales, hechas a mano en un taller propio y vendidas por internet.",
  producto: "Velas aromáticas de cera de soya, en frascos de vidrio reutilizables, en 6 aromas fijos.",
  problema: "Las velas aromáticas importadas o de cadenas grandes son caras y no ofrecen frascos reutilizables ni aromas hechos a pedido.",
  clienteObjetivo: "Personas de 25 a 45 años que decoran su casa o buscan regalos personalizados, principalmente en Lima.",
  ubicacion: "Trabajo desde un taller en casa, en Lima; venta por internet a todo el país.",
  modeloIngresos: "Venta directa por unidad, por internet, con envío a domicilio.",
  preciosPrevistos: "S/ 45 por vela estándar (200 g); S/ 60 por vela personalizada con etiqueta de regalo.",
  canalesVenta: "Instagram y una tienda en Facebook Marketplace; entrega por courier en Lima y por agencia al interior.",
  competidores: [competidor("Cadena de decohogar (sección velas)", "Velas aromáticas importadas, sin personalización", "38")],
  recursosDisponibles: "Un espacio de 8 m² habilitado como taller en casa; conocimiento de elaboración de velas por 2 años como hobby.",
  inversionInicial: [item("Equipo de fusión y moldes", "2500"), item("Inventario inicial de insumos", "1500"), item("Fotos y tienda online", "800")],
  gastosMensuales: [item("Alquiler del taller", "600"), item("Marketing e insumos de empaque", "300"), item("Plataforma de venta online", "180")],
  precioVenta: "45",
  costoVariable: "18",
  demandaMensualEstimada: "60",
  variacionEscenarios: "25",
  objetivos12Meses: "Pasar de venta ocasional a 60 velas/mes constantes y sumar una línea de velas personalizadas para eventos.",
  equipo: [miembro("Fundadora, elaboración y ventas", "2 años elaborando velas como hobby, sin experiencia formal en gestión de negocios")],
  finalidad: "organizarme",
  infoAdicional: "El alquiler del taller (S/ 600) ya está considerado dentro de los gastos de la casa; se separa aquí solo para tener el costo real del negocio.",
  respuestasFaseA:
    "No tengo estudio de mercado ni encuestas; el dato de 60 velas/mes sale de lo que vendí en los últimos 3 meses vendiendo de forma ocasional, sin publicidad paga. No he definido todavía un plan de contenido para Instagram, ni un proveedor fijo de frascos de vidrio.",
});

const RESPUESTA_VELAS = armar({
  resumen: [
    "Velas Aromáticas Kaypacha vende velas de cera de soya en frascos reutilizables [DATO DEL USUARIO], con una inversión inicial de S/ 4,800.00 [CÁLCULO] y un punto de equilibrio de 40 unidades/mes [CÁLCULO] (1080 ÷ 27 = 40 unidades/mes).",
    "Este plan es para organizar tus propias ideas [DATO DEL USUARIO]: prioriza validar la demanda antes de invertir en más inventario.",
  ],
  descripcion: ["Elaboración y venta de velas aromáticas artesanales, hechas a mano en un taller propio y vendidas por internet [DATO DEL USUARIO]."],
  problema: ["Las velas aromáticas importadas o de cadenas grandes son caras y no ofrecen frascos reutilizables ni aromas hechos a pedido [DATO DEL USUARIO]."],
  cliente: ["Personas de 25 a 45 años que decoran su casa o buscan regalos personalizados, principalmente en Lima [DATO DEL USUARIO]."],
  mercado: [
    "No hay un estudio de mercado ni encuestas: el dato de 60 velas/mes proviene de las ventas ocasionales de los últimos 3 meses, sin publicidad paga, según tu respuesta a la Fase A [SUPUESTO] (es un punto de partida, no una proyección validada con marketing activo).",
    "Con publicidad paga la demanda podría subir o mantenerse igual: no hay datos para afirmar cuánto [SUPUESTO] (no se te preguntó ni diste una cifra de conversión con publicidad).",
  ],
  competencia: [{ nombre: "Cadena de decohogar (sección velas)", oferta: "Velas aromáticas importadas, sin personalización", precio: "S/ 38.00 [DATO DEL USUARIO]" }],
  modelo: ["Venta directa por unidad, por internet, con envío a domicilio [DATO DEL USUARIO].", "Precio de S/ 45 por vela estándar y S/ 60 por vela personalizada [DATO DEL USUARIO]."],
  productos: ["Velas de cera de soya, en frascos de vidrio reutilizables, en 6 aromas fijos [DATO DEL USUARIO]."],
  estrategia: [
    "Canales previstos: Instagram y una tienda en Facebook Marketplace [DATO DEL USUARIO].",
    "Todavía no hay un plan de contenido definido para Instagram, según tu respuesta a la Fase A [SUPUESTO]: sin un plan, es difícil sostener publicaciones constantes.",
  ],
  operaciones: ["Elaboración en un taller de 8 m² en casa [DATO DEL USUARIO]; entrega por courier en Lima y por agencia al interior [DATO DEL USUARIO]."],
  equipo: ["Fundadora a cargo de elaboración y ventas, con 2 años elaborando velas como hobby, sin experiencia formal en gestión de negocios [DATO DEL USUARIO]."],
  inversion: ["Inversión total: S/ 4,800.00 [CÁLCULO] (equipo de fusión y moldes S/ 2.500 + inventario inicial de insumos S/ 1.500 + fotos y tienda online S/ 800)."],
  costos: ["Costos fijos mensuales: S/ 1,080.00 [CÁLCULO] (alquiler del taller S/ 600 + marketing e insumos de empaque S/ 300 + plataforma de venta online S/ 180).", "Costo variable por vela: S/ 18 [DATO DEL USUARIO]. Margen de contribución por vela: S/ 27.00 [CÁLCULO] (45.00 − 18.00)."],
  proyeccion: [
    { escenario: "Pesimista", unidades: "45 velas/mes", ingresos: "S/ 2,025.00", utilidad: "S/ 135.00" },
    { escenario: "Medio", unidades: "60 velas/mes", ingresos: "S/ 2,700.00", utilidad: "S/ 540.00" },
    { escenario: "Optimista", unidades: "75 velas/mes", ingresos: "S/ 3,375.00", utilidad: "S/ 945.00" },
  ],
  equilibrio: ["Punto de equilibrio: 40 velas/mes (S/ 1,800.00) [CÁLCULO], fórmula: 1080 ÷ 27 = 40 unidades/mes.", "Los 3 escenarios (45, 60 y 75 velas/mes) quedan por encima del punto de equilibrio [CÁLCULO] (comparación directa de las cifras anteriores)."],
  riesgos: [
    "El dato de 60 velas/mes viene de ventas ocasionales sin publicidad paga: mantener ese ritmo con más inventario y sin un plan de contenido no está garantizado [SUPUESTO] (según tu respuesta a la Fase A).",
    "No hay un proveedor fijo de frascos de vidrio: una falla en el abastecimiento podría detener la producción [SUPUESTO] (según tu respuesta a la Fase A).",
  ],
  plan90: [
    "Días 1 a 30: definir un plan de contenido simple para Instagram y buscar 2 proveedores de frascos de vidrio [DATO DEL USUARIO] (a partir de tu respuesta a la Fase A).",
    "Días 31 a 60: mantener el ritmo de 60 velas/mes con publicaciones constantes y registrar cuántas ventas vienen de cada canal.",
    "Días 61 a 90: con el registro de los 2 meses anteriores, decidir si conviene invertir en publicidad paga o mantener el ritmo orgánico [SUPUESTO] (decisión a tomar con datos propios, no con una cifra de esta guía).",
  ],
  verificar: ["Confirma si el precio del competidor (S/ 38) sigue vigente antes de ajustar tu propio precio.", "Verifica que el margen de S/ 27 por vela siga siendo correcto si cambia el precio de la cera o del frasco."],
  siguiente: ["Registra tus ventas de los próximos 2 meses por canal (Instagram, Marketplace) para reemplazar el supuesto de 60 velas/mes por un dato propio."],
});

/* ───────────────────────── 3. Estudio Contable Punto Cero (buscar un socio) ───────────────────────── */

const DATOS_CONTABLE = datos({
  nombreEmpresa: "Estudio Contable Punto Cero",
  descripcion: "Estudio de contabilidad digital para micro y pequeñas empresas, con un paquete mensual fijo que incluye libros, declaraciones y un reporte simple para el dueño.",
  producto: "Paquete contable mensual: libros electrónicos, declaraciones tributarias y un reporte simple de ingresos y gastos para el dueño del negocio.",
  problema: "Los dueños de micro y pequeñas empresas contratan contadores independientes que cobran por trámite suelto, sin un reporte que les permita entender su propio negocio.",
  clienteObjetivo: "Dueños de micro y pequeñas empresas formales, con ventas mensuales entre S/ 5.000 y S/ 40.000, en Lima.",
  ubicacion: "Oficina virtual, atención remota a clientes en Lima y provincias.",
  modeloIngresos: "Suscripción mensual fija por cliente, según su volumen de operaciones.",
  preciosPrevistos: "S/ 350 por cliente al mes (paquete estándar); S/ 500 por cliente con más de 50 operaciones mensuales.",
  canalesVenta: "Referidos de contadores independientes, LinkedIn y alianzas con 2 cámaras de comercio distritales.",
  competidores: [competidor("Contador independiente promedio (sin reporte)", "Libros y declaraciones por trámite suelto, sin reporte de gestión", "Variable, ~250-400 por trámite"), competidor("Plataforma contable en línea (autoservicio)", "Software de facturación y contabilidad autogestionada", "120 por mes, sin acompañamiento")],
  recursosDisponibles: "Fundador con 6 años de experiencia como contador independiente y una cartera inicial de 5 clientes dispuestos a migrar al nuevo formato.",
  inversionInicial: [item("Laptop y software contable", "6000"), item("Certificaciones y capacitación", "1500"), item("Identidad y web", "1500")],
  gastosMensuales: [item("Oficina virtual y software base", "500"), item("Sueldo de un asistente administrativo", "1800"), item("Marketing", "300")],
  precioVenta: "350",
  costoVariable: "150",
  demandaMensualEstimada: "20",
  variacionEscenarios: "20",
  objetivos12Meses: "Pasar de 5 a 20 clientes activos y sumar un segundo contador para no depender de una sola persona.",
  equipo: [miembro("Fundador, contabilidad y atención al cliente", "6 años como contador independiente"), miembro("Asistente administrativo", "Sin experiencia contable previa; se contratará al alcanzar 10 clientes")],
  finalidad: "buscar-socio",
  infoAdicional: "Los 5 clientes actuales ya pagan por trámite suelto: aún no se les ha ofrecido el paquete mensual fijo.",
  respuestasFaseA:
    "Los 5 clientes actuales son datos reales de mi cartera actual como contador independiente; los 20 clientes del escenario medio son una meta a 12 meses, no clientes confirmados. Todavía no cerré la alianza con las 2 cámaras de comercio, son conversaciones en curso. El segundo contador (el socio que busco) aún no está definido.",
});

const RESPUESTA_CONTABLE = armar({
  resumen: [
    "Estudio Contable Punto Cero ofrece un paquete contable mensual fijo con reporte de gestión para micro y pequeñas empresas [DATO DEL USUARIO], con una inversión inicial de S/ 9,000.00 [CÁLCULO] y un punto de equilibrio de 13 clientes/mes [CÁLCULO] (2600 ÷ 200 = 13 unidades/mes).",
    "Este plan busca sumar un socio [DATO DEL USUARIO]: la sección «Recursos y equipo» detalla qué rol falta cubrir.",
  ],
  descripcion: ["Estudio de contabilidad digital para micro y pequeñas empresas, con un paquete mensual fijo que incluye libros, declaraciones y un reporte simple para el dueño [DATO DEL USUARIO]."],
  problema: ["Los dueños de micro y pequeñas empresas contratan contadores independientes que cobran por trámite suelto, sin un reporte que les permita entender su propio negocio [DATO DEL USUARIO]."],
  cliente: ["Dueños de micro y pequeñas empresas formales, con ventas mensuales entre S/ 5.000 y S/ 40.000, en Lima [DATO DEL USUARIO]."],
  mercado: [
    "No hay un estudio de mercado formal: los 5 clientes actuales son datos reales de la cartera del fundador como contador independiente, según tu respuesta a la Fase A [DATO DEL USUARIO].",
    "Los 20 clientes del escenario medio son una meta a 12 meses, no clientes confirmados, según tu respuesta a la Fase A [SUPUESTO]: no se afirma que ya estén contratados.",
  ],
  competencia: [
    { nombre: "Contador independiente promedio (sin reporte)", oferta: "Libros y declaraciones por trámite suelto, sin reporte de gestión", precio: "S/ 250-400 por trámite (variable) [DATO DEL USUARIO]" },
    { nombre: "Plataforma contable en línea (autoservicio)", oferta: "Software de facturación y contabilidad autogestionada", precio: "S/ 120/mes, sin acompañamiento [DATO DEL USUARIO]" },
  ],
  modelo: ["Suscripción mensual fija por cliente, según su volumen de operaciones [DATO DEL USUARIO].", "Precio de S/ 350/mes en el paquete estándar y S/ 500/mes para clientes con más de 50 operaciones mensuales [DATO DEL USUARIO]."],
  productos: ["Paquete contable mensual: libros electrónicos, declaraciones tributarias y un reporte simple de ingresos y gastos [DATO DEL USUARIO]."],
  estrategia: [
    "Canales previstos: referidos de contadores independientes, LinkedIn y alianzas con 2 cámaras de comercio distritales [DATO DEL USUARIO].",
    "Las alianzas con las cámaras de comercio todavía son conversaciones en curso, no acuerdos cerrados, según tu respuesta a la Fase A [SUPUESTO]: no cuentes con ese canal como confirmado.",
  ],
  operaciones: ["Atención remota desde una oficina virtual, a clientes en Lima y provincias [DATO DEL USUARIO]."],
  equipo: [
    "Fundador a cargo de contabilidad y atención al cliente, con 6 años de experiencia como contador independiente [DATO DEL USUARIO].",
    "Un asistente administrativo sin experiencia contable previa, a contratar al alcanzar 10 clientes [DATO DEL USUARIO].",
    "El socio que buscas (el segundo contador) todavía no está definido, según tu respuesta a la Fase A [SUPUESTO]: es el rol principal a cubrir con este plan.",
  ],
  inversion: ["Inversión total: S/ 9,000.00 [CÁLCULO] (laptop y software contable S/ 6.000 + certificaciones y capacitación S/ 1.500 + identidad y web S/ 1.500)."],
  costos: ["Costos fijos mensuales: S/ 2,600.00 [CÁLCULO] (oficina virtual y software base S/ 500 + sueldo del asistente administrativo S/ 1.800 + marketing S/ 300).", "Costo variable por cliente: S/ 150 [DATO DEL USUARIO]. Margen de contribución por cliente: S/ 200.00 [CÁLCULO] (350.00 − 150.00)."],
  proyeccion: [
    { escenario: "Pesimista", unidades: "16 clientes/mes", ingresos: "S/ 5,600.00", utilidad: "S/ 600.00" },
    { escenario: "Medio", unidades: "20 clientes/mes", ingresos: "S/ 7,000.00", utilidad: "S/ 1,400.00" },
    { escenario: "Optimista", unidades: "24 clientes/mes", ingresos: "S/ 8,400.00", utilidad: "S/ 2,200.00" },
  ],
  equilibrio: ["Punto de equilibrio: 13 clientes/mes (S/ 4,550.00) [CÁLCULO], fórmula: 2600 ÷ 200 = 13 unidades/mes.", "Con los 5 clientes actuales de la cartera del fundador, el negocio todavía no cubre sus costos fijos: faltan 8 clientes para llegar al punto de equilibrio [CÁLCULO] (13 − 5, a partir de las cifras anteriores)."],
  riesgos: [
    "El escenario medio (20 clientes) es una meta a 12 meses, no clientes confirmados: si la conversión de referidos y alianzas es más lenta de lo esperado, el negocio podría quedarse cerca del punto de equilibrio por más tiempo [SUPUESTO] (según tu respuesta a la Fase A).",
    "Las alianzas con las 2 cámaras de comercio no están cerradas: si no se concretan, se pierde uno de los 3 canales de venta previstos [SUPUESTO] (según tu respuesta a la Fase A).",
    "El rol de socio (segundo contador) todavía no está cubierto: el negocio depende de una sola persona para la atención contable [SUPUESTO] (según tu respuesta a la Fase A).",
  ],
  plan90: [
    "Días 1 a 30: ofrecer el paquete mensual fijo a los 5 clientes actuales y cerrar o descartar las 2 alianzas con las cámaras de comercio [DATO DEL USUARIO] (a partir de tu respuesta a la Fase A).",
    "Días 31 a 60: definir el perfil del socio o segundo contador y activar los canales de referidos y LinkedIn.",
    "Días 61 a 90: medir cuántos clientes nuevos llegaron por cada canal y ajustar la proyección de 20 clientes con datos propios [SUPUESTO] (para reemplazar la meta inicial con un dato real).",
  ],
  verificar: ["Confirma con cada uno de los 5 clientes actuales si aceptan migrar del cobro por trámite al paquete mensual fijo.", "Revisa si el precio de la plataforma contable en línea (S/ 120/mes) sigue vigente: es la alternativa más barata para tu cliente objetivo."],
  siguiente: ["Cierra o descarta las 2 alianzas con las cámaras de comercio antes de proyectar ese canal como una fuente confiable de clientes."],
});

export const EJEMPLOS_PLAN_NEGOCIO: EjemploPlanNegocio[] = [
  { id: "lavanderia", etiqueta: "Lavandería con recojo a domicilio (pedir un préstamo)", descripcion: "Inversión de S/ 38.000, punto de equilibrio 1.500 kg/mes.", datos: DATOS_LAVANDERIA, respuesta: RESPUESTA_LAVANDERIA },
  { id: "velas", etiqueta: "Velas aromáticas artesanales (organizar mis ideas)", descripcion: "Inversión de S/ 4.800, punto de equilibrio 40 velas/mes.", datos: DATOS_VELAS, respuesta: RESPUESTA_VELAS },
  { id: "contable", etiqueta: "Estudio contable digital (buscar un socio)", descripcion: "Inversión de S/ 9.000, punto de equilibrio 13 clientes/mes.", datos: DATOS_CONTABLE, respuesta: RESPUESTA_CONTABLE },
];
