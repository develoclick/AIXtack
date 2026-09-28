import type { DatosEntrevista, Historia } from "@/lib/entrevista/tipos";

/**
 * Datos de los tres candidatos de ejemplo de «Preparar una entrevista de trabajo». TODO es ficticio: personas, empresas, ofertas,
 * correos (@ejemplo.com), teléfonos y cifras están inventados solo para ilustrar la herramienta.
 */
export const DATOS_CARLOS: DatosEntrevista = {
  cv: `CARLOS MENDOZA RIVAS
Lima, Perú | carlos.mendoza@ejemplo.com | +51 900 000 301

PERFIL PROFESIONAL
Desarrollador backend con más de 4 años de experiencia en Node.js, APIs REST y colas de mensajes. Trabajo en equipo con producto y QA.

EXPERIENCIA PROFESIONAL
Servicios Digitales Andinos S.A.C. | Lima, Perú
Desarrollador backend | Marzo 2023 – Actualidad
- Desarrollé APIs REST con Node.js y Express para el módulo de pagos.
- Integré RabbitMQ para procesar notificaciones en segundo plano.
- Resolví la caída del servicio de pagos en producción y lo restablecí en 3 horas.
- Desplegué los servicios en servidores Linux con PM2.
Tienda Virtual Norte E.I.R.L. | Lima, Perú
Desarrollador junior | Enero 2022 – Febrero 2023
- Mantuve una API con Node.js y consultas en PostgreSQL.
- Escribí pruebas unitarias con Jest.

EDUCACIÓN
Universidad Nacional Ejemplo | Lima, Perú
Bachiller en Ingeniería de Sistemas | 2017 – 2021

HABILIDADES
- Técnicas: Node.js, Express, PostgreSQL, RabbitMQ, Git, Jest, PM2, Linux
- Blandas: comunicación, trabajo en equipo`,
  oferta: `Desarrollador/a Backend Semi Senior — FinTech Pampa (empresa ficticia)
Lima, Perú · modalidad híbrida

Responsabilidades:
- Diseñar y mantener APIs REST para el procesamiento de transacciones.
- Integrar servicios mediante colas de mensajes.
- Desplegar y monitorear servicios en contenedores.
- Participar en la revisión de código y en el soporte de incidentes.

Requisitos:
- Mínimo 3 años de experiencia con Node.js.
- Experiencia con Docker (Kubernetes básico es deseable).
- Experiencia con colas de mensajes (RabbitMQ).
- Conocimiento de PostgreSQL.
- Trabajo en equipo y comunicación clara.

Ofrecemos: modalidad híbrida y capacitación continua.`,
  empresa: "FinTech Pampa (empresa ficticia). Lo que sé: procesa pagos digitales para comercios pequeños (dato de la web de ejemplo, por verificar).",
  tipo: "tecnica",
  duracion: "45 minutos",
  idioma: "es",
  destacar: "El incidente de la caída del servicio de pagos y mi trabajo con RabbitMQ.",
  temas: "No tengo experiencia con Docker: hoy despliego con PM2 en servidores Linux.",
  dificultad: "exigente",
  modo: "banco",
};

export const DATOS_ANDREA: DatosEntrevista = {
  cv: `ANDREA VERA QUISPE
Arequipa, Perú | andrea.vera@ejemplo.com | +51 900 000 302

PERFIL PROFESIONAL
Asistente administrativa con experiencia en atención al cliente, archivo y control de documentos. Busco volver a un puesto administrativo estable.

EXPERIENCIA PROFESIONAL
Estudio Contable Sur Andino | Arequipa, Perú
Auxiliar administrativa | Marzo 2024 – Actualidad
- Organicé el archivo físico y digital de los expedientes de clientes.
- Atendí llamadas y correos de clientes y los derivé al área correspondiente.
- Registré facturas en hojas de cálculo.
Comercial Los Volcanes S.A.C. | Arequipa, Perú
Asistente administrativa | Marzo 2018 – Febrero 2023
- Controlé el ingreso y la salida de documentos de la oficina.
- Elaboré informes semanales de ventas en Excel para la gerencia.
- Coordiné la agenda de reuniones de la gerencia.

EDUCACIÓN
Instituto Superior Ejemplo | Arequipa, Perú
Técnica en Administración de Empresas | 2015 – 2017

HABILIDADES
- Herramientas: Excel, Word, correo electrónico
- Otras: atención al cliente, organización`,
  oferta: `Asistente Administrativo/a — Distribuidora Andina del Sur (empresa ficticia)
Arequipa, Perú · tiempo completo

Funciones:
- Atender consultas de clientes y proveedores.
- Elaborar reportes en Excel.
- Gestionar el archivo de documentos.
- Coordinar agendas y reuniones.

Requisitos:
- 2 años de experiencia en puestos administrativos.
- Excel intermedio.
- Buena comunicación.
- Disponibilidad inmediata.`,
  empresa: "Distribuidora Andina del Sur (empresa ficticia). No sé nada más de la empresa.",
  tipo: "rrhh",
  duracion: "30 minutos",
  idioma: "es",
  destacar: "Los informes semanales de ventas en Excel.",
  temas: "Hueco de un año entre febrero de 2023 y marzo de 2024: renuncié porque necesitaba cuidar a un familiar.",
  dificultad: "basico",
  modo: "banco",
};

export const DATOS_MARCOS: DatosEntrevista = {
  cv: `MARCOS TORRES LEÓN
Lima, Perú | marcos.torres@ejemplo.com | +51 900 000 303

PERFIL PROFESIONAL
Ejecutivo comercial con experiencia en la venta de servicios a empresas y en el seguimiento de clientes.

EXPERIENCIA PROFESIONAL
Soluciones Logísticas del Pacífico S.A.C. | Lima, Perú
Ejecutivo comercial | Abril 2021 – Actualidad
- Gestioné una cartera de clientes corporativos y realicé seguimiento mensual.
- Preparé cotizaciones y propuestas comerciales para nuevos clientes.
- Registré oportunidades y visitas en el CRM de la empresa.
- Cumplí la meta trimestral de ventas en 5 de los últimos 8 trimestres.
Asesoría Comercial Rímac E.I.R.L. | Lima, Perú
Asesor comercial | Enero 2019 – Marzo 2021
- Atendí a clientes por teléfono y visité comercios para ofrecer servicios.

EDUCACIÓN
Universidad Ejemplo | Lima, Perú
Bachiller en Administración | 2013 – 2018

HABILIDADES
- Herramientas: CRM, Excel, presentaciones
- Otras: negociación, seguimiento de clientes`,
  oferta: `Ejecutivo/a Comercial B2B — Almacenes y Transporte Lima (empresa ficticia)
Lima, Perú · visitas a clientes

Responsabilidades:
- Prospectar y captar nuevos clientes empresariales.
- Presentar propuestas comerciales.
- Mantener y hacer crecer una cartera de clientes.
- Reportar la actividad comercial en el CRM.

Requisitos:
- 2 años de experiencia en ventas B2B.
- Manejo de CRM.
- Habilidad de negociación.
- Disponibilidad para visitar clientes.`,
  empresa: "Almacenes y Transporte Lima (empresa ficticia). No sé nada más de la empresa.",
  tipo: "jefe",
  duracion: "40 minutos",
  idioma: "es",
  destacar: "Mi seguimiento de la cartera de clientes corporativos.",
  temas: "Cumplí la meta trimestral en 5 de 8 trimestres: sé que me preguntarán por los otros 3.",
  dificultad: "exigente",
  modo: "simulacion",
};

/** Historias STAR de ejemplo (de Carlos): solo usan hechos de su CV; lo demás son huecos «[completar con tu dato]». */
export const HISTORIAS_CARLOS: Historia[] = [
  {
    id: "e1",
    titulo: "La caída del servicio de pagos",
    competencias: ["problemas", "profesionalismo", "comunicacion"],
    situacion: "El servicio de pagos cayó en producción. [completar con tu dato: a quién afectó y cómo te enteraste]",
    tarea: "Resolver la caída y restablecer el servicio. [completar con tu dato: qué te tocaba a ti y qué a otras personas]",
    accion: "[completar con tu dato: qué revisaste, qué causa encontraste y qué corrección aplicaste, paso a paso]",
    resultado: "Lo restablecí en 3 horas. [completar con tu dato: qué cambiaste después para evitar que se repita]",
  },
  {
    id: "e2",
    titulo: "Notificaciones en segundo plano con RabbitMQ",
    competencias: ["tecnicas", "pensamiento-critico"],
    situacion: "En el módulo de pagos había notificaciones que procesar. [completar con tu dato: qué problema tenía el proceso anterior]",
    tarea: "Procesarlas en segundo plano. [completar con tu dato: qué requisitos tenía la solución]",
    accion: "Integré RabbitMQ para procesar las notificaciones en segundo plano. [completar con tu dato: cómo manejabas los reintentos y los errores]",
    resultado: "Las notificaciones pasaron a procesarse en segundo plano. [completar con tu dato: qué mejoró y cómo lo mediste]",
  },
  {
    id: "e3",
    titulo: "De desarrollador junior a backend",
    competencias: ["aprendizaje", "equipo"],
    situacion: "Empecé como desarrollador junior, manteniendo una API con Node.js y consultas en PostgreSQL. [completar con tu dato]",
    tarea: "Crecer hacia responsabilidades más grandes. [completar con tu dato: qué te propusiste aprender]",
    accion: "Escribí pruebas unitarias con Jest. [completar con tu dato: qué más hiciste para aprender de tu equipo]",
    resultado: "Pasé a desarrollar las APIs REST del módulo de pagos en mi empresa actual. [completar con tu dato]",
  },
];
