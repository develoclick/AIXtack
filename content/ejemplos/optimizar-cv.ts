import { datosVaciosOptimizar, type DatosOptimizar } from "@/lib/optimizar/tipos";

/**
 * EJEMPLOS ILUSTRATIVOS de «Optimizar tu CV» (botón «Llenar con datos de ejemplo»). Todo es ficticio y lo escribió el autor del
 * sitio: personas, empresas, instituciones y cifras no existen (correos @ejemplo.com, teléfonos inventados). Cada `respuesta` es
 * el resultado tal como lo pide el prompt (8 títulos), coherente con el CV y la oferta de ejemplo; NO es la salida real de una IA
 * (la página lo dice). lib/optimizar/ejemplos.test.ts comprueba que cada una se lea sin avisos, que no traiga números ni nombres
 * inventados y que cada fragmento citado exista en el CV original.
 */
export interface EjemploOptimizar {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosOptimizar;
  respuesta: string;
}

const base = datosVaciosOptimizar();

const DIEGO: EjemploOptimizar = {
  id: "asistente-contable",
  etiqueta: "Asistente contable → Analista contable",
  descripcion: "Adaptación: renombra tareas con los términos de la oferta y deja SAP como brecha real.",
  datos: {
    ...base,
    intensidad: "adaptacion",
    pais: "Perú",
    paginas: 1,
    intocables: "Los cargos «Asistente contable» y «Auxiliar administrativo», las fechas y los nombres de las empresas.",
    datosNuevos: "Certificado «Conciliaciones bancarias con Excel», curso en línea, 12 horas, 2024.",
    cv: `DIEGO CÁRDENAS MENDOZA
Lima, Perú | diego.cardenas@ejemplo.com | +51 900 000 201

OBJETIVO
Asistente contable con 3 años de experiencia. Persona responsable y proactiva con ganas de crecer en el área contable.

EXPERIENCIA
Comercial Andes Norte S.A.C. — Lima
Asistente contable | Mar 2023 - Actualidad
- Apoyo en el área de contabilidad
- Apoyo en tareas contables y administrativas
- Apoyo en el cuadre de bancos de 4 cuentas corrientes cada mes
- Registro de facturas de compra y de venta en Excel
- Apoyo en tareas contables de cierre de mes

Servicios Rímac Sur E.I.R.L. — Lima
Auxiliar administrativo | Ene 2022 - Feb 2023
- Archivo de documentos
- Atención telefónica
- Ayuda con la caja chica de la oficina

EDUCACIÓN
Instituto Superior Tecnológico del Sur — Contabilidad (técnico) | 2019 - 2021

HABILIDADES
Excel, Word, contabilidad, orden, trabajo en equipo, responsable, puntual, Excel

CURSOS
Excel intermedio (2022)`,
    oferta: `Estudio Contable Pacífico S.A.C. busca Analista contable (Lima, modalidad presencial).

Funciones:
- Realizar conciliaciones bancarias mensuales.
- Registrar y contabilizar facturas de compra y de venta en SAP.
- Preparar reportes de cierre mensual.
- Apoyar en la declaración mensual de impuestos.

Requisitos:
- Formación técnica o universitaria en Contabilidad.
- 2 a 3 años de experiencia en área contable.
- Manejo de SAP (obligatorio).
- Excel intermedio.
- Orden y responsabilidad.`,
  },
  respuesta: `## Diagnóstico
- [REPETICIÓN] «Apoyo en el área de contabilidad» — la idea de «apoyo en tareas contables» aparece tres veces sin decir qué hacías.
- [KEYWORD AUSENTE] «Apoyo en el cuadre de bancos de 4 cuentas corrientes cada mes» — la oferta pide «conciliaciones bancarias»; describes la misma tarea con otro nombre (tipo A).
- [LOGRO POCO CLARO] «Apoyo en tareas contables de cierre de mes» — no dice qué parte del cierre te tocaba.
- [SIN EVIDENCIA] «Persona responsable y proactiva con ganas de crecer en el área contable.» — adjetivos sin un hecho que los respalde.
- [POCO RELEVANTE] «Atención telefónica» — poca relación con un puesto de analista contable.
- [ESTRUCTURA] «Excel, Word, contabilidad, orden, trabajo en equipo, responsable, puntual, Excel» — mezcla herramientas con rasgos personales y repite «Excel».
## CV optimizado
NOMBRE: Diego Cárdenas Mendoza
CONTACTO: Lima, Perú | diego.cardenas@ejemplo.com | +51 900 000 201
PERFIL PROFESIONAL
Asistente contable con 3 años de experiencia en conciliaciones bancarias, registro de facturas de compra y de venta y tareas de cierre de mes, con formación técnica en Contabilidad y Excel intermedio.
EXPERIENCIA PROFESIONAL
Comercial Andes Norte S.A.C. | Lima, Perú
Asistente contable | Mar 2023 – Actualidad
- Realicé conciliaciones bancarias mensuales de 4 cuentas corrientes.
- Registré facturas de compra y de venta en Excel.
- Participé en las tareas de cierre de mes del área contable.
Servicios Rímac Sur E.I.R.L. | Lima, Perú
Auxiliar administrativo | Ene 2022 – Feb 2023
- Apoyé en la administración de la caja chica de la oficina.
- Archivé la documentación de la oficina.
EDUCACIÓN
Instituto Superior Tecnológico del Sur
Contabilidad (técnico) | 2019 – 2021
HABILIDADES
- Herramientas: Excel intermedio, Word
- Contabilidad: registro de facturas, conciliaciones bancarias, cierre de mes
CERTIFICACIONES
Excel intermedio
Curso | 2022
Conciliaciones bancarias con Excel
Curso en línea, 12 horas | 2024
## Registro de cambios
- Antes: «Apoyo en el cuadre de bancos de 4 cuentas corrientes cada mes» → Después: «Realicé conciliaciones bancarias mensuales de 4 cuentas corrientes» → Motivo: la oferta pide «conciliaciones bancarias»; es la misma tarea con el término del mercado y el «4» ya figuraba en tu CV.
- Antes: «Registro de facturas de compra y de venta en Excel» → Después: «Registré facturas de compra y de venta en Excel» → Motivo: verbo de acción; la oferta pide registrar facturas.
- Antes: «Apoyo en tareas contables de cierre de mes» → Después: «Participé en las tareas de cierre de mes del área contable» → Motivo: la oferta menciona el cierre mensual; «Participé» porque no consta que lo dirigieras.
- Antes: «Ayuda con la caja chica de la oficina» → Después: «Apoyé en la administración de la caja chica de la oficina» → Motivo: verbo de acción sin exagerar tu responsabilidad.
- Antes: «Asistente contable con 3 años de experiencia. Persona responsable y proactiva con ganas de crecer en el área contable.» → Después: perfil profesional de una línea → Motivo: cambia adjetivos por lo que sí consta en tu CV.
- Antes: «Excel, Word, contabilidad, orden, trabajo en equipo, responsable, puntual, Excel» → Después: dos viñetas de habilidades → Motivo: separa herramientas de conocimientos y quita la repetición y los adjetivos sin evidencia.
- Antes: «CURSOS» → Después: sección CERTIFICACIONES con el curso nuevo → Motivo: incorpora el certificado que añadiste en los datos nuevos.
## Eliminado o reorganizado
- «Apoyo en el área de contabilidad» y «Apoyo en tareas contables y administrativas»: eliminados porque repetían la misma idea sin decir qué hacías.
- «Atención telefónica»: eliminado por poca relevancia para el puesto; si la oferta valorara atención a clientes, podría conservarse.
- «orden, trabajo en equipo, responsable, puntual»: eliminados de habilidades por no tener un hecho que los respalde.
## Brechas reales (tipo C)
- Manejo de SAP (obligatorio en la oferta): no aparece en tu CV y no se agregó.
- Apoyar en la declaración mensual de impuestos: tu CV no menciona esta tarea.
## Preguntas para confirmar (tipo B)
- Conciliaciones bancarias: ¿las hacías tú de principio a fin o apoyabas a otra persona? Si las hacías tú, «Realicé» es correcto.
- Preparar reportes de cierre mensual: ¿en el cierre de mes preparabas algún reporte o registro? ¿Cuál?
- Facturas: ¿cuántas facturas registrabas al mes? Un número real fortalecería la viñeta.
- Excel intermedio: ¿qué funciones usabas (por ejemplo, tablas dinámicas o BUSCARV)?
## Afirmaciones que debes verificar
- «3 años de experiencia» en el perfil (Mar 2023 – Actualidad).
- «4 cuentas corrientes» en las conciliaciones bancarias.
- Que el certificado «Conciliaciones bancarias con Excel» (12 horas, 2024) diga exactamente eso.
- Que el verbo «Realicé» describa lo que hacías (ver la primera pregunta).
## Siguiente paso
- Responde las preguntas de tipo B y ajusta las viñetas con lo que sí hacías.
- Si aprendes SAP, súmalo solo cuando puedas respaldarlo; hoy es la principal brecha frente a la oferta.
- Guarda esta versión con el nombre de la empresa (por ejemplo, CV-EstudioContablePacifico).`,
};

const MARISOL: EjemploOptimizar = {
  id: "vendedora-tienda",
  etiqueta: "Vendedora de tienda → Ejecutiva de ventas",
  descripcion: "Retoque: mantiene tu estructura y pone primero el logro de ventas; Excel queda como brecha.",
  datos: {
    ...base,
    intensidad: "retoque",
    pais: "Perú",
    paginas: 1,
    intocables: "Los nombres de las tiendas y las fechas.",
    datosNuevos: "",
    cv: `MARISOL QUISPE HUAMÁN
Arequipa, Perú | marisol.quispe@ejemplo.com | +51 900 000 202

PERFIL
Cajera y vendedora con 2 años de experiencia buscando nuevas oportunidades.

EXPERIENCIA LABORAL
Tienda Hogar Sur S.A.C. — Arequipa
Vendedora de tienda | Feb 2024 - Actualidad
- Atención de clientes en tienda
- Venta de electrodomésticos y muebles
- Cumplí la meta mensual de ventas de S/ 18 000 en 5 meses del último año
- Manejo de caja y cierre diario
- Atención de reclamos

Minimarket El Ahorro — Arequipa
Cajera | Mar 2023 - Ene 2024
- Cobro en caja
- Reposición de productos en góndola

ESTUDIOS
Institución Educativa Ejemplo del Valle — Secundaria completa | 2017
Curso de ventas efectivas — 20 horas | 2024

HABILIDADES
Atención al cliente, ventas, caja, comunicación, amable`,
    oferta: `Muebles y Electro Arequipa S.A. busca Ejecutiva/o de ventas para su sala de exhibición en Arequipa.

Funciones:
- Asesorar a los clientes en la elección de electrodomésticos y muebles.
- Cumplir metas mensuales de ventas.
- Cerrar ventas y hacer seguimiento posventa.
- Registrar las ventas en el sistema.
- Atender reclamos de clientes.

Requisitos:
- 1 año de experiencia en ventas de tienda.
- Orientación a resultados.
- Manejo básico de Excel.
- Disponibilidad para trabajar los sábados.`,
  },
  respuesta: `## Diagnóstico
- [ESTRUCTURA] «Cajera y vendedora con 2 años de experiencia buscando nuevas oportunidades.» — el perfil no dice qué sabes hacer ni qué puesto buscas.
- [LOGRO POCO CLARO] «Cumplí la meta mensual de ventas de S/ 18 000 en 5 meses del último año» — es tu mejor dato y está en medio de las tareas.
- [REDACCIÓN] «Atención de clientes en tienda» — nombra la tarea sin verbo de acción.
- [KEYWORD AUSENTE] «Atención de reclamos» — la oferta pide atender reclamos; está en tu CV con otra redacción (tipo A).
- [POCO RELEVANTE] «Reposición de productos en góndola» — tarea de poco peso para un puesto de ventas.
- [SIN EVIDENCIA] «Atención al cliente, ventas, caja, comunicación, amable» — rasgos personales sin un hecho que los respalde.
## CV optimizado
NOMBRE: Marisol Quispe Huamán
CONTACTO: Arequipa, Perú | marisol.quispe@ejemplo.com | +51 900 000 202
PERFIL PROFESIONAL
Vendedora de tienda con 2 años de experiencia en venta de electrodomésticos y muebles, manejo de caja y atención de reclamos. Busca un puesto de ejecutiva de ventas.
EXPERIENCIA PROFESIONAL
Tienda Hogar Sur S.A.C. | Arequipa, Perú
Vendedora de tienda | Feb 2024 – Actualidad
- Cumplí la meta mensual de ventas de S/ 18 000 en 5 meses del último año.
- Atendí a los clientes en tienda y vendí electrodomésticos y muebles.
- Atendí los reclamos de los clientes.
- Manejé la caja y realicé el cierre diario.
Minimarket El Ahorro | Arequipa, Perú
Cajera | Mar 2023 – Ene 2024
- Realicé el cobro en caja.
- Repuse productos en góndola.
EDUCACIÓN
Institución Educativa Ejemplo del Valle
Secundaria completa | 2017
Curso de ventas efectivas
Curso de 20 horas | 2024
HABILIDADES
- Ventas: atención de clientes, venta de electrodomésticos y muebles, atención de reclamos
- Caja: cobro y cierre diario
## Registro de cambios
- Antes: «Cajera y vendedora con 2 años de experiencia buscando nuevas oportunidades.» → Después: perfil que nombra lo que haces y el puesto que buscas → Motivo: la oferta es de ejecutiva de ventas y tu experiencia en venta de electrodomésticos y muebles ya coincide.
- Antes: «Cumplí la meta mensual de ventas de S/ 18 000 en 5 meses del último año» → Después: «Cumplí la meta mensual de ventas de S/ 18 000 en 5 meses del último año» (movida a la primera viñeta) → Motivo: la oferta pide cumplir metas de ventas; el dato ya es un logro y debe verse primero.
- Antes: «Atención de clientes en tienda» → Después: «Atendí a los clientes en tienda y vendí electrodomésticos y muebles» → Motivo: verbos de acción; une dos viñetas que hablaban de lo mismo.
- Antes: «Atención de reclamos» → Después: «Atendí los reclamos de los clientes» → Motivo: la oferta pide atender reclamos; solo cambia la redacción.
- Antes: «Cobro en caja» → Después: «Realicé el cobro en caja» → Motivo: verbo de acción.
- Antes: «Atención al cliente, ventas, caja, comunicación, amable» → Después: dos viñetas de habilidades con lo que sí consta → Motivo: quita los rasgos personales sin evidencia.
## Eliminado o reorganizado
- «comunicación, amable»: eliminados de habilidades por no tener un hecho que los respalde.
- «Atención de clientes en tienda» y «Venta de electrodomésticos y muebles»: unidas en una sola viñeta.
## Brechas reales (tipo C)
- Manejo básico de Excel (requisito de la oferta): no aparece en tu CV y no se agregó.
- Disponibilidad para trabajar los sábados: no consta en tu CV; puedes indicarla en tu postulación si es verdad.
## Preguntas para confirmar (tipo B)
- Seguimiento posventa: ¿llamabas o escribías a los clientes después de la compra? Si es así, se puede agregar.
- Registrar las ventas en el sistema: ¿registrabas tus ventas en algún sistema o en un cuaderno? ¿En cuál?
- Meta de ventas: ¿los S/ 18 000 eran tu meta o tu venta total del mes?
## Afirmaciones que debes verificar
- «2 años de experiencia» en el perfil (Mar 2023 – Actualidad).
- «S/ 18 000 en 5 meses del último año»: que la cifra y el periodo sean exactos.
- Que «Curso de 20 horas» coincida con tu certificado.
## Siguiente paso
- Responde las preguntas de tipo B y agrega solo lo que sí hacías.
- Si sabes usar Excel a nivel básico, agrégalo con un ejemplo real; si no, es una brecha honesta que puedes mencionar en la entrevista.`,
};

const RENZO: EjemploOptimizar = {
  id: "soporte-tecnico",
  etiqueta: "Soporte técnico → Analista de soporte TI",
  descripcion: "Reestructuración: ordena un CV desordenado en secciones estándar sin agregar nada nuevo.",
  datos: {
    ...base,
    intensidad: "reestructuracion",
    pais: "Perú",
    paginas: 1,
    intocables: "Los cargos, las fechas y los nombres de las empresas.",
    datosNuevos: "",
    cv: `RENZO SALAS TICONA
Lima, Perú | renzo.salas@ejemplo.com | +51 900 000 203

EXPERIENCIA
Soporte técnico — Distribuidora Santa Rita S.A.C. — Lima — Jun 2022 a la fecha
Atención de tickets de usuarios (unos 25 por día)
Instalación de programas y configuración de correos
Reduje el tiempo de resolución de tickets de 3 horas a 2 horas
Mantenimiento de 40 computadoras de la oficina
Atención de tickets de usuarios

Técnico de computadoras — Cabinas Net Plus — Lima — Ene 2021 a May 2022
Reparación de computadoras y armado de redes
Atención al público

ESTUDIOS
Computación e Informática, Instituto Tecnológico Norte, 2018 a 2020

OTROS
Sé Windows, Linux básico, redes, Office. Curso de ITIL básico 2023.`,
    oferta: `Corporación Logística Andina S.A. busca Analista de soporte TI (nivel 2) en Lima.

Funciones:
- Atender y resolver incidentes de los usuarios (mesa de ayuda).
- Administrar equipos y cuentas de usuario.
- Documentar las soluciones.
- Mantener el inventario de equipos.

Requisitos:
- Formación técnica en informática.
- 3 años de experiencia en soporte.
- Windows y nociones de redes.
- Deseable: ITIL y Linux.
- Capacidad para documentar procedimientos.`,
  },
  respuesta: `## Diagnóstico
- [ESTRUCTURA] «OTROS» — mezcla sistemas, herramientas y un curso en una sola línea; hay que separarlos en secciones estándar.
- [REPETICIÓN] «Atención de tickets de usuarios» — aparece dos veces en el mismo cargo.
- [REDACCIÓN] «Instalación de programas y configuración de correos» — lista de tareas sin verbo de acción.
- [LOGRO POCO CLARO] «Reduje el tiempo de resolución de tickets de 3 horas a 2 horas» — es tu mejor logro y está en medio de las tareas.
- [KEYWORD AUSENTE] «Mantenimiento de 40 computadoras de la oficina» — la oferta pide administrar equipos y mantener su inventario; describes una tarea cercana (tipo A o B según lo que hacías).
- [POCO RELEVANTE] «Atención al público» — poco peso para un puesto de soporte de nivel 2.
- [REDACCIÓN] «Sé Windows, Linux básico, redes, Office.» — redacción informal para una sección de habilidades.
## CV optimizado
NOMBRE: Renzo Salas Ticona
CONTACTO: Lima, Perú | renzo.salas@ejemplo.com | +51 900 000 203
PERFIL PROFESIONAL
Técnico de soporte con experiencia en atención de tickets, instalación y configuración de equipos y correos, y mantenimiento de 40 computadoras, con formación en Computación e Informática y curso de ITIL básico.
EXPERIENCIA PROFESIONAL
Distribuidora Santa Rita S.A.C. | Lima, Perú
Soporte técnico | Jun 2022 – Actualidad
- Atendí unos 25 tickets de usuarios por día.
- Reduje el tiempo de resolución de tickets de 3 horas a 2 horas.
- Realicé el mantenimiento de 40 computadoras de la oficina.
- Instalé programas y configuré correos.
Cabinas Net Plus | Lima, Perú
Técnico de computadoras | Ene 2021 – May 2022
- Reparé computadoras y armé redes.
EDUCACIÓN
Instituto Tecnológico Norte
Computación e Informática | 2018 – 2020
HABILIDADES
- Sistemas: Windows, Linux (nivel básico)
- Redes y ofimática: redes, Office
CERTIFICACIONES
ITIL básico
Curso | 2023
## Registro de cambios
- Antes: «OTROS» → Después: secciones HABILIDADES y CERTIFICACIONES → Motivo: los sistemas operativos y el curso deben estar en secciones estándar que un ATS reconozca.
- Antes: «Atención de tickets de usuarios (unos 25 por día)» y «Atención de tickets de usuarios» → Después: «Atendí unos 25 tickets de usuarios por día» → Motivo: elimina la repetición y usa un verbo de acción; conserva la cifra que ya tenías.
- Antes: «Reduje el tiempo de resolución de tickets de 3 horas a 2 horas» → Después: «Reduje el tiempo de resolución de tickets de 3 horas a 2 horas» (movida al segundo lugar) → Motivo: un logro medible debe verse antes que las tareas de rutina.
- Antes: «Instalación de programas y configuración de correos» → Después: «Instalé programas y configuré correos» → Motivo: verbos de acción.
- Antes: «Mantenimiento de 40 computadoras de la oficina» → Después: «Realicé el mantenimiento de 40 computadoras de la oficina» → Motivo: verbo de acción; la oferta menciona equipos e inventario, pero tu CV no dice que llevaras un inventario.
- Antes: «Sé Windows, Linux básico, redes, Office.» → Después: dos viñetas de habilidades → Motivo: redacción profesional; la oferta valora Windows, redes y Linux.
## Eliminado o reorganizado
- «Atención al público» (Cabinas Net Plus): eliminado por poca relevancia para soporte de nivel 2.
- «Atención de tickets de usuarios» (segunda vez): eliminado por estar repetido.
- «ESTUDIOS» y «OTROS»: reorganizados en EDUCACIÓN, HABILIDADES y CERTIFICACIONES.
## Brechas reales (tipo C)
- Documentar las soluciones (y capacidad para documentar procedimientos): tu CV no menciona documentación y no se agregó.
## Preguntas para confirmar (tipo B)
- Administrar equipos y cuentas de usuario: ¿creabas, bloqueabas o restablecías cuentas de usuario? Si lo hacías, se puede agregar.
- Inventario de equipos: ¿llevabas un registro de las computadoras? ¿En qué herramienta?
- Redes: ¿qué tipo de redes armabas y de qué tamaño?
## Afirmaciones que debes verificar
- «40 computadoras» y «unos 25 tickets por día»: que sean cifras que puedas sostener.
- «de 3 horas a 2 horas»: cómo mediste ese tiempo.
- Que el curso «ITIL básico» sea de 2023 y figure en tu certificado.
## Siguiente paso
- Responde las preguntas de tipo B; si documentabas soluciones, agrégalo con un ejemplo real.
- Guarda esta versión con el nombre de la empresa antes de enviarla.`,
};

export const EJEMPLOS_OPTIMIZAR: EjemploOptimizar[] = [DIEGO, MARISOL, RENZO];

export function getEjemploOptimizar(id: string): EjemploOptimizar | undefined {
  return EJEMPLOS_OPTIMIZAR.find((e) => e.id === id);
}
