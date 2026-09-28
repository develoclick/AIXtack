import { datosVaciosSalario, type Beneficio, type DatosSalario, type Oferta, type Referencia } from "@/lib/salario/tipos";

export interface EjemploSalario {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosSalario;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente. */
  respuesta: string;
}

/**
 * Tres ejemplos. TODO es ficticio: personas, empresas, ofertas, referencias y cifras están inventados solo para ilustrar la
 * herramienta. No son datos de mercado ni de ninguna empresa real.
 */
const ben = (id: string, nombre: string, valor: string, monetario: boolean): Beneficio => ({ id, nombre, valor, monetario });
const ref = (id: string, monto: string, fuente: string, fecha: string): Referencia => ({ id, monto, fuente, fecha });
const oferta = (o: Partial<Oferta> & { nombre: string }): Oferta => ({ fijo: "", pagos: "14", variableTipo: "ninguno", variableValor: "", variableSeguro: "0", variableCondiciones: "", beneficios: [], contrato: "", jornada: "", vacaciones: "", prueba: "", diasPresencial: "", ...o });

const BASE = datosVaciosSalario();

const DATOS_OPERACIONES: DatosSalario = {
  ...BASE,
  cargo: "Analista de Operaciones",
  ubicacion: "Lima, Perú",
  modalidad: "hibrido",
  nivel: "Semi senior",
  anios: "4",
  formacion: "Bachiller en Ingeniería Industrial",
  competencias: "- Lideré la migración del inventario a SAP en mi puesto actual.\n- Elaboro el reporte semanal de indicadores de operaciones para la gerencia.\n- Coordino con almacén y compras para reducir quiebres de stock.",
  ofertaA: oferta({
    nombre: "Oferta A (empresa ficticia)",
    fijo: "4000",
    pagos: "14",
    variableTipo: "sueldos",
    variableValor: "1",
    variableSeguro: "0",
    variableCondiciones: "Bono anual de hasta 1 sueldo, sujeto a metas que la oferta no define",
    beneficios: [ben("b1", "EPS con el 50 % pagado por la empresa", "", true), ben("b2", "Capacitación", "", false)],
    contrato: "Plazo indeterminado",
    jornada: "Lunes a viernes",
    vacaciones: "30 días",
    prueba: "3 meses",
    diasPresencial: "3",
  }),
  actualSalario: "S/ 3,600 brutos mensuales, en 14 pagos",
  actualBeneficios: "EPS pagada por la empresa",
  referencias: [ref("r1", "4300", "Aviso público de un puesto similar (ejemplo ficticio)", "2026-09-15"), ref("r2", "4800", "Conversación con una colega del rubro (ejemplo ficticio)", "2026-09-18")],
  transporteDia: "12",
  comidaDia: "8",
  semanas: "48",
  minimo: "4200",
  objetivo: "4600",
  ancla: "4900",
  prioridades: ["dinero", "estabilidad", "aprendizaje", "horario", "remoto"],
};

const DATOS_COMPARACION: DatosSalario = {
  ...BASE,
  cargo: "Desarrollador backend",
  ubicacion: "Lima, Perú",
  modalidad: "remoto",
  nivel: "Semi senior",
  anios: "5",
  formacion: "Ingeniero de Sistemas",
  competencias: "- Diseñé la API de pagos de mi empresa actual con Node.js.\n- Integré colas de mensajes para procesar notificaciones.\n- Resolví un incidente en producción y restablecí el servicio.",
  ofertaA: oferta({
    nombre: "Oferta A (remota)",
    fijo: "6500",
    pagos: "12",
    variableTipo: "porcentaje",
    variableValor: "10",
    variableSeguro: "50",
    variableCondiciones: "Hasta 10 % del fijo anual, según objetivos del equipo",
    beneficios: [ben("b1", "Seguro privado de salud", "3600", true), ben("b2", "Laptop de la empresa", "", false)],
    contrato: "Plazo indeterminado",
    vacaciones: "30 días",
    prueba: "3 meses",
  }),
  comparar: true,
  ofertaB: oferta({
    nombre: "Oferta B (híbrida)",
    fijo: "5800",
    pagos: "14",
    beneficios: [ben("b3", "Presupuesto anual de capacitación", "2400", true), ben("b4", "Día libre por cumpleaños", "", false)],
    contrato: "Plazo indeterminado",
    vacaciones: "30 días",
    prueba: "3 meses",
    diasPresencial: "2",
  }),
  actualSalario: "S/ 5,900 brutos mensuales, en 14 pagos",
  actualBeneficios: "Seguro privado de salud",
  referencias: [ref("r1", "7100", "Boletín salarial público (ejemplo ficticio)", "2026-09-10")],
  transporteDia: "15",
  comidaDia: "10",
  semanas: "48",
  minimo: "6700",
  objetivo: "7000",
  ancla: "7300",
  prioridades: ["aprendizaje", "remoto", "dinero", "estabilidad", "horario"],
};

const DATOS_ADMINISTRATIVA: DatosSalario = {
  ...BASE,
  cargo: "Asistente administrativa",
  ubicacion: "Arequipa, Perú",
  modalidad: "presencial",
  nivel: "Junior",
  anios: "2",
  formacion: "Técnica en Administración de Empresas",
  competencias: "- Organicé el archivo físico y digital de los expedientes de clientes.\n- Elaboro informes semanales de ventas en Excel para la gerencia.\n- Atiendo llamadas y correos de clientes y los derivo al área correspondiente.",
  ofertaA: oferta({
    nombre: "Oferta única (empresa ficticia)",
    fijo: "1800",
    pagos: "14",
    beneficios: [ben("b1", "Movilidad pagada por la empresa", "1200", true), ben("b2", "Refrigerio en la oficina", "", false)],
    contrato: "Plazo fijo de 1 año",
    jornada: "Lunes a sábado medio día",
    vacaciones: "30 días",
    prueba: "3 meses",
  }),
  actualSalario: "S/ 1,500 brutos mensuales, en 12 pagos",
  transporteDia: "6",
  comidaDia: "10",
  semanas: "48",
  descuentoPct: "18",
  minimo: "2000",
  objetivo: "2200",
  ancla: "2400",
  prioridades: ["estabilidad", "dinero", "horario", "aprendizaje", "remoto"],
};

const RESPUESTA_OPERACIONES = `## Revisión de la oferta
- El valor anual del fijo (S/ 56,000.00) es claro: S/ 4,000.00 en 14 pagos. Confirma que los 14 pagos incluyen las gratificaciones legales y no un monto adicional distinto.
- El bono «de hasta 1 sueldo» está sujeto a metas que la oferta no define: mientras no se conozcan, la página lo cuenta como 0.00 en el escenario conservador y S/ 4,000.00 en el completo.
- La EPS cubre el 50 % por parte de la empresa, pero la oferta no dice cuánto paga el trabajador ni qué cobertura incluye; por eso no está valorizada.
- Tres días presenciales a la semana implican un costo de S/ 2,880.00 al año según tus gastos diarios.

## Preguntas al reclutador
- ¿El salario de S/ 4,000.00 es bruto mensual, y cuántos pagos al año incluye exactamente?
- ¿Qué metas definen el bono anual, cómo se miden y quién las fija?
- ¿El bono se paga aunque se cumpla solo una parte de las metas?
- ¿Qué cobertura tiene la EPS y qué parte del costo asume el trabajador?
- ¿Hay revisión salarial y cada cuánto tiempo?
- ¿Qué condiciones tiene el período de prueba?
- ¿Cuáles son los días presenciales y pueden cambiar con el tiempo?

## Coherencia de mis cifras
- Tu mínimo (S/ 4,200.00) queda por debajo de tu referencia más baja (S/ 4,300.00), pero por encima de la oferta.
- Tu objetivo (S/ 4,600.00) queda dentro del rango de tus dos referencias (S/ 4,300.00 a S/ 4,800.00).
- Tu ancla (S/ 4,900.00) queda por encima de tu referencia más alta: prepárate para justificarla con tus logros.
- Solo tienes 2 referencias; una es una conversación informal. Conviene sumar otra con fuente y fecha antes de negociar.

## Argumentos
- Experiencia en cambios de sistema | Evidencia: «Lideré la migración del inventario a SAP en mi puesto actual» | El puesto trabaja con operaciones e inventarios.
- Reportes para la gerencia | Evidencia: «Elaboro el reporte semanal de indicadores de operaciones para la gerencia» | El rol requiere seguimiento de indicadores.
- Coordinación entre áreas | Evidencia: «Coordino con almacén y compras para reducir quiebres de stock» | La oferta implica coordinar con otras áreas.
- Continuidad y aprendizaje | Evidencia: «Lideré la migración del inventario a SAP en mi puesto actual» | Puedes aportar desde el primer día con menos curva de aprendizaje.
- Alcance del puesto | Evidencia: «Elaboro el reporte semanal de indicadores de operaciones para la gerencia» | Tu experiencia justifica un salario cercano a tu objetivo.

## Respuestas preparadas
Respuesta 1 [Expectativa salarial]: «¿Cuál es tu expectativa salarial?»
- Texto: Me interesa mucho el puesto. Por lo que investigué y por el alcance del rol, busco un salario fijo mensual bruto entre S/ 4,600 y S/ 4,900. ¿Cómo está estructurado el rango para este puesto?
- Cuándo usarla: cuando te pidan una cifra; si puedes, pregunta antes el rango del puesto.

Respuesta 2 [Presupuesto de la empresa]: «Nuestro presupuesto es S/ 4,000, ¿aceptas?»
- Texto: Gracias por la transparencia. Me entusiasma la posibilidad de sumarme, pero con mi experiencia y las responsabilidades del rol esperaba una cifra más cercana a S/ 4,600. ¿Hay flexibilidad en el fijo o en otros componentes de la propuesta?
- Cuándo usarla: cuando te den una cifra menor que tu objetivo y quieras abrir la conversación sin cerrar la puerta.

Respuesta 3 [Salario actual]: «¿Cuánto ganas actualmente?»
- Texto: Prefiero enfocarme en lo que corresponde al nuevo rol y en mis expectativas para él. Con gusto te comparto mi expectativa: entre S/ 4,600 y S/ 4,900 brutos mensuales.
- Cuándo usarla: si no quieres revelar tu salario actual; no digas una cifra falsa.

Respuesta 4 [Correo de contraoferta]: «Correo después de recibir la oferta»
- Texto: Asunto: Propuesta de contraoferta – Analista de Operaciones
  Hola [nombre]:
  Gracias por la oferta. Estoy muy interesada en el puesto. Después de revisar la propuesta, te pido considerar un salario fijo mensual bruto de S/ 4,600 en 14 pagos. Si no hay margen en el fijo, podría aceptar S/ 4,300 con una revisión salarial a los 6 meses por escrito.
  Quedo atenta y agradezco tu tiempo.
  [tu nombre]
- Cuándo usarla: después de resolver tus dudas sobre el bono y la EPS.

## Si no hay margen
- Revisión salarial a los 6 meses por escrito | te da una fecha para volver a hablar del fijo.
- Condiciones claras del bono | convierte lo condicionado en algo medible.
- Cobertura de la EPS | aumenta el valor de la propuesta sin tocar el fijo.
- Capacitación | encaja con tu prioridad de aprendizaje.
- Días presenciales | reducirlos baja el costo de trabajar que calculó la página.

## Checklist antes de aceptar
- Tengo la oferta por escrito, con fijo, pagos al año y fecha de inicio.
- Sé cómo se define y se paga el bono.
- Entendí la cobertura de la EPS y su costo.
- Verifiqué en fuentes oficiales los descuentos que afectan mi neto.
- Revisé el contrato: tipo, período de prueba y vacaciones.
- Mi decisión respeta mi mínimo aceptable.

## Qué debes verificar
- Cuáles de los 14 pagos son gratificaciones legales y cuáles son adicionales.
- Los descuentos de aportes e impuestos que aplican a tu caso, en las páginas oficiales.
- Las metas exactas del bono.

## Siguiente paso
- Envía tus preguntas al reclutador antes de dar una cifra.
- Agrega una tercera referencia con fuente y fecha.`;

const RESPUESTA_COMPARACION = `\`\`\`
## Revisión de la oferta
- La oferta A tiene mayor valor anual en tus números: S/ 85,500.00 en el escenario conservador y S/ 89,400.00 en el completo, frente a S/ 81,200.00 de la oferta B después de costos.
- El variable de la oferta A depende de objetivos del equipo; el escenario conservador cuenta solo el 50 % que tú consideras seguro.
- La oferta B tiene 14 pagos, pero un fijo mensual menor; compara los valores anuales, no los mensuales.
- La oferta B exige 2 días presenciales, con un costo de S/ 2,400.00 al año según tus gastos.

## Preguntas al reclutador
- ¿Cómo se definen los objetivos que determinan el variable de la oferta A?
- ¿El seguro privado cubre a familiares y cuál es su costo para el trabajador?
- ¿Los 14 pagos de la oferta B incluyen las gratificaciones legales?
- ¿Qué incluye el presupuesto de capacitación y quién decide cómo usarlo?
- ¿Hay revisión salarial y cada cuánto?
- ¿Cuáles son los días presenciales de la oferta B y pueden cambiar?

## Coherencia de mis cifras
- Solo tienes una referencia con fuente y fecha (S/ 7,100.00).
- Tu mínimo (S/ 6,700.00), tu objetivo (S/ 7,000.00) y tu ancla (S/ 7,300.00) se comparan contra esa única referencia: es poco para decidir. Suma otras antes de negociar.
- Tu ancla queda por encima de la referencia: prepárate para justificarla.

## Argumentos
- Diseño de sistemas | Evidencia: «Diseñé la API de pagos de mi empresa actual con Node.js» | El puesto de backend requiere diseño de APIs.
- Procesamiento en segundo plano | Evidencia: «Integré colas de mensajes para procesar notificaciones» | Aporta a sistemas con carga variable.
- Respuesta ante incidentes | Evidencia: «Resolví un incidente en producción y restablecí el servicio» | Reduce el riesgo operativo del equipo.
- Autonomía | Evidencia: «Diseñé la API de pagos de mi empresa actual con Node.js» | Puedes trabajar con poca supervisión, importante en un puesto remoto.
- Estabilidad de servicio | Evidencia: «Resolví un incidente en producción y restablecí el servicio» | Alinea con tu prioridad de aprendizaje y crecimiento.

## Respuestas preparadas
Respuesta 1 [Expectativa salarial]: «¿Cuál es tu expectativa salarial?»
- Texto: Por el alcance del puesto y mi experiencia, busco un salario fijo mensual bruto entre S/ 7,000 y S/ 7,300. ¿Cuál es el rango previsto para este cargo?
- Cuándo usarla: cuando te pidan una cifra en la oferta A.

Respuesta 2 [Presupuesto de la empresa]: «Nuestro presupuesto es menor a lo que pides, ¿aceptas?»
- Texto: Gracias por explicarlo. Me interesa el proyecto. ¿Podemos revisar juntos el conjunto de la propuesta, incluido el variable y los beneficios, para acercarnos a mi objetivo de S/ 7,000?
- Cuándo usarla: si hay una diferencia en el fijo.

Respuesta 3 [Salario actual]: «¿Cuánto ganas actualmente?»
- Texto: Prefiero centrarme en el rol y en lo que espero para él. Mi expectativa está entre S/ 7,000 y S/ 7,300 brutos mensuales.
- Cuándo usarla: si no quieres compartir tu salario actual.

Respuesta 4 [Correo de contraoferta]: «Correo después de recibir la oferta A»
- Texto: Asunto: Propuesta de contraoferta – Desarrollador backend
  Hola [nombre]:
  Gracias por la propuesta. Me gustaría conversar sobre un salario fijo mensual bruto de S/ 7,000 en 12 pagos y sobre cómo se definirán los objetivos del variable.
  Quedo atento a tus comentarios.
  [tu nombre]
- Cuándo usarla: cuando hayas resuelto tus dudas sobre el variable.

## Si no hay margen
- Presupuesto de capacitación | encaja con tu prioridad de aprendizaje.
- Objetivos del variable por escrito | hace medible lo condicionado.
- Revisión salarial en fecha fija | te da una nueva oportunidad para el fijo.
- Cobertura del seguro | aumenta el valor de la oferta sin tocar el fijo.

## Checklist antes de aceptar
- Comparé los valores anuales de ambas ofertas, no solo los mensuales.
- Entendí cómo se calcula el variable.
- Verifiqué los descuentos que afectan mi neto en fuentes oficiales.
- Revisé el contrato y el período de prueba.
- Mi decisión respeta mi mínimo aceptable y mi prioridad de aprendizaje.

## Qué debes verificar
- Cómo se definen los objetivos del variable.
- Qué cubre el seguro y la capacitación.

## Siguiente paso
- Pregunta por el variable antes de dar una cifra.
- Suma otra referencia con fuente y fecha.
\`\`\``;

const RESPUESTA_ADMINISTRATIVA = `## Revisión de la oferta
- El fijo anual es S/ 25,200.00 (S/ 1,800.00 en 14 pagos), sin variable.
- La movilidad pagada suma S/ 1,200.00 al año en tu valorización, y el refrigerio no se valoriza.
- Trabajar presencial cuesta S/ 3,840.00 al año según tus gastos diarios, por lo que el valor después de costos es S/ 22,560.00.
- El neto aproximado del fijo es S/ 1,476.00 con el 18 % de descuentos que estimaste; no es un cálculo de impuestos.
- El contrato es a plazo fijo de 1 año: pregunta por las condiciones de renovación.

## Preguntas al reclutador
- ¿El salario de S/ 1,800.00 es bruto mensual y cuántos pagos incluye?
- ¿Cómo funciona la movilidad y se paga todos los meses?
- ¿Qué pasa al vencer el contrato de 1 año?
- ¿Cuál es el horario exacto de los sábados?
- ¿Hay revisión salarial?
- ¿Qué condiciones tiene el período de prueba?

## Coherencia de mis cifras
- No aportaste referencias salariales, así que no puedo decir si tus cifras son razonables. Busca al menos dos con fuente y fecha (avisos públicos de puestos parecidos, conversaciones con personas del rubro) antes de negociar.
- Tu mínimo (S/ 2,000.00) es mayor que la oferta en S/ 200.00 al mes; tu objetivo (S/ 2,200.00), en S/ 400.00; tu ancla (S/ 2,400.00), en S/ 600.00.
- Tu ancla supera la oferta con una diferencia grande: prepárate para justificarla con tu experiencia.

## Argumentos
- Orden documental | Evidencia: «Organicé el archivo físico y digital de los expedientes de clientes» | El puesto requiere manejar documentos.
- Reportes en Excel | Evidencia: «Elaboro informes semanales de ventas en Excel para la gerencia» | Aporta a la gestión administrativa.
- Atención al cliente | Evidencia: «Atiendo llamadas y correos de clientes y los derivo al área correspondiente» | Reduce trabajo de otras áreas.
- Constancia | Evidencia: «Elaboro informes semanales de ventas en Excel para la gerencia» | Respalda tu prioridad de estabilidad.
- Orden y método | Evidencia: «Organicé el archivo físico y digital de los expedientes de clientes» | Te permite asumir tareas con poca supervisión.

## Respuestas preparadas
Respuesta 1 [Expectativa salarial]: «¿Cuál es tu expectativa salarial?»
- Texto: Por mi experiencia y las funciones del puesto, mi expectativa es de S/ 2,200 mensuales brutos. ¿Cuál es el rango previsto para el puesto?
- Cuándo usarla: cuando te pidan una cifra; como no tienes referencias, primero pregunta el rango.

Respuesta 2 [Presupuesto de la empresa]: «Nuestro presupuesto es S/ 1,800, ¿aceptas?»
- Texto: Gracias por comentarlo. Me interesa el puesto. ¿Habría margen para ajustar el fijo o revisar el salario después del período de prueba?
- Cuándo usarla: si te ofrecen la cifra de la oferta.

Respuesta 3 [Salario actual]: «¿Cuánto ganas actualmente?»
- Texto: Prefiero enfocarme en el rol al que postulo y en mi expectativa para él, que es de S/ 2,200 brutos mensuales.
- Cuándo usarla: si no quieres compartir tu salario actual.

Respuesta 4 [Correo de contraoferta]: «Correo después de recibir la oferta»
- Texto: Asunto: Propuesta de contraoferta – Asistente administrativa
  Hola [nombre]:
  Gracias por la oferta. Estoy interesada en el puesto y me gustaría conversar sobre un salario fijo mensual bruto de S/ 2,200 en 14 pagos, o una revisión salarial por escrito después del período de prueba.
  Quedo atenta a tus comentarios.
  [tu nombre]
- Cuándo usarla: después de aclarar las condiciones del contrato.

## Si no hay margen
- Revisión salarial por escrito | te permite volver a hablar del fijo.
- Renovación del contrato | te da estabilidad, tu prioridad principal.
- Horario de los sábados | mejora tu jornada sin tocar el fijo.
- Movilidad | aumenta el valor de la propuesta.

## Checklist antes de aceptar
- Tengo la oferta por escrito.
- Entendí las condiciones de renovación del contrato de 1 año.
- Verifiqué los descuentos que afectan mi neto en fuentes oficiales.
- Confirmé el horario y la movilidad.
- Mi decisión respeta mi mínimo aceptable.

## Qué debes verificar
- Los descuentos que aplican a tu caso, en las páginas oficiales.
- Que el 18 % que estimaste sea razonable para tu régimen.

## Siguiente paso
- Busca al menos dos referencias con fuente y fecha.
- Aclara las condiciones de renovación antes de responder.`;

export const EJEMPLOS_SALARIO: EjemploSalario[] = [
  { id: "analista-operaciones", etiqueta: "Analista de Operaciones · Lima · híbrido", descripcion: "Una oferta con bono condicionado, 2 referencias y tres cifras.", datos: DATOS_OPERACIONES, respuesta: RESPUESTA_OPERACIONES },
  { id: "backend-comparacion", etiqueta: "Desarrollador backend · comparar 2 ofertas", descripcion: "Oferta remota con variable frente a una híbrida con 14 pagos.", datos: DATOS_COMPARACION, respuesta: RESPUESTA_COMPARACION },
  { id: "administrativa-sin-referencias", etiqueta: "Asistente administrativa · Arequipa · sin referencias", descripcion: "Sin referencias salariales: la herramienta avisa y te dice cómo conseguirlas.", datos: DATOS_ADMINISTRATIVA, respuesta: RESPUESTA_ADMINISTRATIVA },
];
