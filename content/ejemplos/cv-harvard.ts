import { datosVacios, type DatosCv } from "@/lib/cv/tipos";

/**
 * EJEMPLOS ILUSTRATIVOS del generador de hoja de vida (botón «Llenar con datos de ejemplo»).
 *
 * Todo es ficticio y lo escribió el autor del sitio: las personas, empresas, instituciones y cifras no existen (los correos usan
 * el dominio @ejemplo.com y los teléfonos son inventados). Cada `respuesta` es una hoja de vida en el formato exacto que el
 * prompt le pide a la IA, coherente con los `datos` del formulario y con la `oferta` de ejemplo: NO es la salida real de una
 * IA (la página lo dice). lib/cv/ejemplos.test.ts comprueba que cada una pase el normalizador y el lector sin advertencias
 * y genere un .docx válido.
 */
export interface EjemploCv {
  id: string;
  /** Nombre corto del perfil, para el botón y el aviso. */
  etiqueta: string;
  /** Una línea que describe a quién representa. */
  descripcion: string;
  datos: DatosCv;
  /** Respuesta de la IA de ejemplo (lo que se pega en el paso 3). */
  respuesta: string;
}

const base = datosVacios();

const SIN_EXPERIENCIA: EjemploCv = {
  id: "estudiante-sin-experiencia",
  etiqueta: "Estudiante o recién egresada",
  descripcion: "Sin experiencia laboral: la educación va primero y los proyectos ocupan el lugar de la experiencia.",
  datos: {
    ...base,
    idioma: "es",
    nivel: "sin-experiencia",
    puesto: "Practicante de Logística",
    oferta:
      "Logística Pampa S.A.C. busca Practicante de Logística para su almacén principal en Arequipa.\n\nFunciones:\n- Apoyar el control de inventarios y el registro de entradas y salidas de almacén.\n- Elaborar reportes semanales en Excel.\n- Coordinar con el equipo de despacho.\n\nRequisitos:\n- Estudiante de últimos ciclos o egresado de Ingeniería Industrial o afín.\n- Excel intermedio.\n- Conocimientos de inventarios.\n- Orden, responsabilidad y disponibilidad de 6 horas diarias.",
    nombre: "Valeria Quispe Mamani",
    email: "valeria.quispe@ejemplo.com",
    telefono: "+51 900 000 101",
    ciudad: "Arequipa, Perú",
    linkedin: "linkedin.com/in/valeria-quispe-ejemplo",
    web: "",
    resumen: "Me gusta ordenar procesos y encontrar la forma de que un almacén trabaje con menos errores. Aprendo rápido y cumplo los plazos.",
    experiencias: [{ id: "exp-1", cargo: "", empresa: "", lugar: "", inicio: "", fin: "", logros: "" }],
    estudios: [
      {
        id: "est-1",
        titulo: "Ingeniería Industrial (egresada)",
        institucion: "Universidad del Valle Verde",
        lugar: "Arequipa, Perú",
        inicio: "2020",
        fin: "2025",
        detalle: "Promedio ponderado: 15,4 sobre 20 (tercio superior)\nTesis: propuesta de reorganización del almacén de una ferretería local",
      },
    ],
    habilidades: "Excel intermedio: tablas dinámicas, BUSCARV y gráficos\nInventarios: clasificación ABC y control de stock\nHerramientas: Word, PowerPoint y Google Drive",
    idiomas: "Español nativo\nInglés básico (A2)",
    certificaciones: "Excel intermedio, Instituto Costa Norte (curso en línea), 2023\nGestión de inventarios, curso virtual, 2024",
    proyectos:
      "Tesis: reorganicé en un plano la ubicación de los productos de una ferretería según su rotación; calculé que el tiempo de búsqueda de pedidos bajaría alrededor de 20 %\nVoluntariado en el banco de alimentos Arequipa Solidaria (2022 a 2024): clasificaba y registraba donaciones cada semana en una hoja de cálculo y coordinaba a 8 voluntarios los sábados",
  },
  respuesta: `NOMBRE: Valeria Quispe Mamani
CONTACTO: Arequipa, Perú | valeria.quispe@ejemplo.com | +51 900 000 101 | linkedin.com/in/valeria-quispe-ejemplo
## PERFIL PROFESIONAL
Egresada de Ingeniería Industrial con formación en control de inventarios y Excel intermedio. Organizó y registró donaciones semanales como voluntaria y propuso la reorganización de un almacén en su tesis. Busca una práctica de logística en Arequipa para aplicar sus conocimientos en un almacén real.
## EDUCACIÓN
### Universidad del Valle Verde | Arequipa, Perú
Ingeniería Industrial (egresada) | 2020 – 2025
- Promedio ponderado: 15,4 sobre 20 (tercio superior).
- Tesis: propuesta de reorganización del almacén de una ferretería local.
## PROYECTOS Y ACTIVIDADES
### Tesis de Ingeniería Industrial | Arequipa, Perú
Autora del proyecto | 2024 – 2025
- Reorganicé en un plano la ubicación de los productos de una ferretería local según su rotación (clasificación ABC).
- Calculé que el tiempo de búsqueda de pedidos podría bajar alrededor de 20 % con la nueva distribución.
### Banco de alimentos Arequipa Solidaria | Arequipa, Perú
Voluntaria de clasificación de donaciones | 2022 – 2024
- Clasifiqué y registré las donaciones semanales en una hoja de cálculo para llevar el control de entradas y salidas.
- Coordiné a 8 voluntarios cada sábado para completar el trabajo dentro del horario.
## HABILIDADES
- Inventarios: clasificación ABC y control de stock
- Excel intermedio: tablas dinámicas, BUSCARV y gráficos
- Herramientas: Word, PowerPoint y Google Drive
## IDIOMAS
- Español: nativo
- Inglés: básico (A2)
## CERTIFICACIONES
### Excel intermedio | Instituto Costa Norte
Curso en línea | 2023
### Gestión de inventarios | Curso virtual
Certificado de finalización | 2024
=== NOTAS ===
- Palabras clave de la oferta que sí cubriste: inventarios, Excel intermedio, reportes en Excel, almacén, Ingeniería Industrial.
- Brecha: la oferta pide coordinar con el equipo de despacho y no mencionaste experiencia con despacho; no se agregó.
- Pregunta para cuantificar: ¿cuántos productos tenía la ferretería de tu tesis y cuántos pedidos revisaste?
- Verifica antes de enviar: las fechas del voluntariado, el promedio y el nombre de tus cursos.`,
};

const JUNIOR_TECNICO: EjemploCv = {
  id: "junior-desarrollador",
  etiqueta: "Junior técnico (desarrollador)",
  descripcion: "Poca experiencia pero muy relevante: la experiencia va primero, con herramientas y resultados medibles.",
  datos: {
    ...base,
    idioma: "es",
    nivel: "junior",
    puesto: "Desarrollador Full Stack Junior",
    oferta:
      "Cloudmarket Perú S.A.C. busca Desarrollador Full Stack Junior (modalidad híbrida en Lima).\n\nFunciones:\n- Desarrollar y mantener aplicaciones web con React y Node.js.\n- Diseñar y consumir APIs REST.\n- Trabajar con bases de datos PostgreSQL.\n- Escribir pruebas automatizadas y participar en revisiones de código.\n\nRequisitos:\n- 1 a 2 años de experiencia.\n- JavaScript o TypeScript, Git.\n- Deseable: Docker y AWS.",
    nombre: "Diego Salazar Ríos",
    email: "diego.salazar@ejemplo.com",
    telefono: "+51 900 000 102",
    ciudad: "Lima, Perú",
    linkedin: "linkedin.com/in/diego-salazar-ejemplo",
    web: "github.com/diego-salazar-ejemplo",
    resumen: "",
    experiencias: [
      {
        id: "exp-1",
        cargo: "Desarrollador Full Stack Junior",
        empresa: "Nubelab Software S.A.C.",
        lugar: "Lima, Perú",
        inicio: "Sep 2024",
        fin: "Actualidad",
        logros:
          "Hago las pantallas en React de un sistema de gestión de citas para clínicas\nCreé una API en Node.js y Express con 18 endpoints REST\nDiseñé tablas en PostgreSQL y optimicé 3 consultas lentas: pasaron de 2 segundos a 400 milisegundos\nEscribo pruebas con Jest y reviso el código de mis compañeros en pull requests\nDockerizamos el proyecto para que se levante con un solo comando",
      },
      {
        id: "exp-2",
        cargo: "Practicante de Desarrollo",
        empresa: "Tecnoandina Soluciones E.I.R.L.",
        lugar: "Lima, Perú",
        inicio: "Mar 2024",
        fin: "Ago 2024",
        logros: "Corregí 25 errores reportados en una aplicación web interna\nDocumenté 6 endpoints con Swagger\nConvertí formularios de HTML a componentes React reutilizables",
      },
    ],
    estudios: [
      {
        id: "est-1",
        titulo: "Bachiller en Ingeniería de Software",
        institucion: "Universidad Tecnológica del Pacífico Norte",
        lugar: "Lima, Perú",
        inicio: "2018",
        fin: "2023",
        detalle: "",
      },
    ],
    habilidades: "Lenguajes: JavaScript, TypeScript, SQL\nFrontend: React, HTML, CSS, Tailwind CSS\nBackend: Node.js, Express\nBases de datos: PostgreSQL\nHerramientas: Git, GitHub, Docker, Jest, Postman",
    idiomas: "Español nativo\nInglés B2 (lectura técnica y reuniones)",
    certificaciones: "Desarrollo web con React, curso en línea, 2023\nFundamentos de Docker, curso en línea, 2024",
    proyectos: "",
  },
  respuesta: `NOMBRE: Diego Salazar Ríos
CONTACTO: Lima, Perú | diego.salazar@ejemplo.com | +51 900 000 102 | linkedin.com/in/diego-salazar-ejemplo | github.com/diego-salazar-ejemplo
## PERFIL PROFESIONAL
Desarrollador Full Stack junior con 2 años de experiencia (incluidas prácticas) en aplicaciones web con React, Node.js y PostgreSQL. Diseña APIs REST, optimiza consultas y escribe pruebas automatizadas con Jest. Busca sumar su experiencia en JavaScript y Docker a un equipo de producto.
## EXPERIENCIA PROFESIONAL
### Nubelab Software S.A.C. | Lima, Perú
Desarrollador Full Stack Junior | Sep 2024 – Actualidad
- Desarrollo las pantallas en React de un sistema de gestión de citas para clínicas.
- Construí una API REST en Node.js y Express con 18 endpoints.
- Optimicé 3 consultas lentas en PostgreSQL, y reduje su tiempo de respuesta de 2 segundos a 400 milisegundos.
- Escribo pruebas automatizadas con Jest y reviso el código de mi equipo en pull requests.
- Empaqueté el proyecto con Docker para levantarlo con un solo comando.
### Tecnoandina Soluciones E.I.R.L. | Lima, Perú
Practicante de Desarrollo | Mar 2024 – Ago 2024
- Corregí 25 errores reportados en una aplicación web interna.
- Documenté 6 endpoints con Swagger.
- Convertí formularios de HTML en componentes React reutilizables.
## EDUCACIÓN
### Universidad Tecnológica del Pacífico Norte | Lima, Perú
Bachiller en Ingeniería de Software | 2018 – 2023
## HABILIDADES
- Lenguajes: JavaScript, TypeScript, SQL
- Frontend: React, HTML, CSS, Tailwind CSS
- Backend: Node.js, Express, APIs REST
- Bases de datos: PostgreSQL
- Herramientas: Git, GitHub, Docker, Jest, Postman
## IDIOMAS
- Español: nativo
- Inglés: B2 (lectura técnica y reuniones)
## CERTIFICACIONES
### Desarrollo web con React | Curso en línea
Certificado de finalización | 2023
### Fundamentos de Docker | Curso en línea
Certificado de finalización | 2024
=== NOTAS ===
- Palabras clave cubiertas: React, Node.js, APIs REST, PostgreSQL, JavaScript, TypeScript, Git, Docker, pruebas automatizadas, revisiones de código.
- Brecha: la oferta menciona AWS como deseable y no lo indicaste; no se agregó.
- Pregunta para cuantificar: ¿cuántas personas usan el sistema de citas o cuántas clínicas lo tienen?
- Verifica antes de enviar: los nombres de las empresas, las fechas y los tiempos de las consultas.`,
};

const SEMI_SENIOR_MARKETING: EjemploCv = {
  id: "semi-senior-marketing",
  etiqueta: "Semi senior no técnica (marketing)",
  descripcion: "Perfil de 4 años en marketing digital: logros con cifras y palabras clave de la oferta.",
  datos: {
    ...base,
    idioma: "es",
    nivel: "semi-senior",
    puesto: "Analista de Marketing Digital",
    oferta:
      "Muebles y Decoración Lima S.A.C. busca Analista de Marketing Digital para su tienda en línea.\n\nFunciones:\n- Analizar el tráfico y las ventas con Google Analytics 4 y preparar reportes mensuales.\n- Crear y optimizar contenido para SEO.\n- Coordinar campañas de correo y redes sociales.\n\nRequisitos:\n- 3 años de experiencia en marketing digital.\n- SEO, Google Analytics 4 y hojas de cálculo.\n- Deseable: Google Ads.",
    nombre: "Camila Rojas Tello",
    email: "camila.rojas@ejemplo.com",
    telefono: "+51 900 000 103",
    ciudad: "Lima, Perú",
    linkedin: "linkedin.com/in/camila-rojas-ejemplo",
    web: "",
    resumen: "",
    experiencias: [
      {
        id: "exp-1",
        cargo: "Analista de marketing digital",
        empresa: "Hogar Andino Online S.A.C.",
        lugar: "Lima, Perú",
        inicio: "Mar 2022",
        fin: "Actualidad",
        logros:
          "Armo el reporte mensual de ventas por canal en Google Analytics 4 y Looker Studio para la gerencia\nEscribí y mejoré 24 artículos del blog con investigación de palabras clave; las visitas orgánicas pasaron de 3.200 a 5.900 por mes\nCoordino con diseño y ventas el calendario mensual de campañas de correo y redes sociales\nAutomaticé el reporte semanal en hojas de cálculo: pasó de 4 horas a 1 hora",
      },
      {
        id: "exp-2",
        cargo: "Asistente de marketing",
        empresa: "Agencia Pixel Sur",
        lugar: "Lima, Perú",
        inicio: "Feb 2020",
        fin: "Feb 2022",
        logros: "Programé y publiqué contenido de 6 cuentas de clientes en Instagram y Facebook\nRegistré las métricas semanales de cada cuenta en una hoja compartida\nAtendí las consultas de clientes por correo y las derivé al responsable de cada cuenta",
      },
    ],
    estudios: [
      {
        id: "est-1",
        titulo: "Licenciatura en Marketing",
        institucion: "Universidad Metropolitana Santa Rosa",
        lugar: "Lima, Perú",
        inicio: "2015",
        fin: "2019",
        detalle: "Proyecto final: plan de posicionamiento web para una tienda local",
      },
    ],
    habilidades: "Marketing digital: SEO, investigación de palabras clave, correo, redes sociales\nHerramientas: Google Analytics 4, Looker Studio, Excel, Canva, WordPress",
    idiomas: "Español nativo\nInglés intermedio (B1)",
    certificaciones: "Google Analytics 4, certificación de Google Skillshop, 2023\nFundamentos de SEO, curso en línea, 2021",
    proyectos: "",
  },
  respuesta: `NOMBRE: Camila Rojas Tello
CONTACTO: Lima, Perú | camila.rojas@ejemplo.com | +51 900 000 103 | linkedin.com/in/camila-rojas-ejemplo
## PERFIL PROFESIONAL
Analista de marketing digital con más de 6 años de experiencia en SEO, analítica web y reportes para tiendas en línea. Convierte datos de Google Analytics 4 en decisiones de contenido y campañas. Busca sumar su experiencia en posicionamiento orgánico a un equipo de comercio electrónico.
## EXPERIENCIA PROFESIONAL
### Hogar Andino Online S.A.C. | Lima, Perú
Analista de marketing digital | Mar 2022 – Actualidad
- Elaboro reportes mensuales de ventas por canal en Google Analytics 4 y Looker Studio para la gerencia.
- Publiqué y optimicé 24 artículos de blog con investigación de palabras clave, lo que aumentó las visitas orgánicas de 3.200 a 5.900 al mes.
- Coordino con diseño y ventas el calendario mensual de campañas de correo y redes sociales.
- Reduje el tiempo de armado del reporte semanal de 4 horas a 1 hora al automatizarlo con hojas de cálculo.
### Agencia Pixel Sur | Lima, Perú
Asistente de marketing | Feb 2020 – Feb 2022
- Programé y publiqué contenido para 6 cuentas de clientes en Instagram y Facebook.
- Registré las métricas semanales de cada cuenta en una hoja compartida para el equipo.
- Atendí las consultas de clientes por correo y las derivé al responsable de cada cuenta.
## EDUCACIÓN
### Universidad Metropolitana Santa Rosa | Lima, Perú
Licenciatura en Marketing | 2015 – 2019
- Proyecto final: plan de posicionamiento web para una tienda local.
## HABILIDADES
- Marketing digital: SEO, investigación de palabras clave, correo, redes sociales
- Herramientas: Google Analytics 4, Looker Studio, Excel, Canva, WordPress
## IDIOMAS
- Español: nativo
- Inglés: intermedio (B1)
## CERTIFICACIONES
### Google Analytics 4 | Google Skillshop
Certificación | 2023
### Fundamentos de SEO | Curso en línea
Certificado de finalización | 2021
=== NOTAS ===
- Palabras clave cubiertas: SEO, Google Analytics 4, reportes mensuales, hojas de cálculo, campañas de correo y redes sociales.
- Brecha: la oferta menciona Google Ads como deseable y no lo indicaste; no se agregó.
- Pregunta para cuantificar: ¿cuántas campañas de correo coordinas al mes y qué tasa de apertura tienen?
- Verifica antes de enviar: las fechas, las cifras de visitas y los nombres de las empresas.`,
};

const SENIOR_GERENCIA: EjemploCv = {
  id: "senior-gerencia",
  etiqueta: "Senior o gerencia (operaciones)",
  descripcion: "Más de 12 años: liderazgo, presupuesto y resultados de negocio en una sola página.",
  datos: {
    ...base,
    idioma: "es",
    nivel: "senior",
    puesto: "Gerente de Operaciones",
    oferta:
      "Agroindustrias del Sur S.A. busca Gerente de Operaciones para su planta en Arequipa.\n\nFunciones:\n- Liderar las áreas de producción, logística y mantenimiento.\n- Definir y controlar el presupuesto operativo.\n- Implementar mejora continua (Lean) y reducir costos.\n- Gestionar equipos de más de 50 personas.\n\nRequisitos:\n- Ingeniero Industrial o afín, con MBA o maestría deseable.\n- 10 años de experiencia en operaciones, 4 de ellos en cargos de jefatura o gerencia.\n- Conocimiento de Lean Six Sigma.",
    nombre: "Rodrigo Valdivia Cárdenas",
    email: "rodrigo.valdivia@ejemplo.com",
    telefono: "+51 900 000 104",
    ciudad: "Arequipa, Perú",
    linkedin: "linkedin.com/in/rodrigo-valdivia-ejemplo",
    web: "",
    resumen: "",
    experiencias: [
      {
        id: "exp-1",
        cargo: "Gerente de Operaciones",
        empresa: "Agroexportadora Valle Sol S.A.C.",
        lugar: "Arequipa, Perú",
        inicio: "Ene 2019",
        fin: "Actualidad",
        logros:
          "Dirijo producción, logística y mantenimiento con un equipo de 120 personas y un presupuesto anual de 8 millones de soles\nImplementé un programa de mejora continua Lean que redujo los costos logísticos en 14 % en dos años\nDisminuí las paradas no planificadas de la planta de 9 % a 4 % con un plan de mantenimiento preventivo\nNegocié con 5 proveedores y conseguí un ahorro anual de 350 mil soles en empaques",
      },
      {
        id: "exp-2",
        cargo: "Jefe de Logística",
        empresa: "Distribuidora Andes Norte S.A.",
        lugar: "Arequipa, Perú",
        inicio: "Mar 2014",
        fin: "Dic 2018",
        logros: "Lideré un equipo de 35 personas en almacenes y transporte\nReduje el tiempo de entrega de pedidos de 72 a 48 horas al rediseñar las rutas de despacho\nImplementé un sistema de control de inventarios con exactitud de 98 %",
      },
      {
        id: "exp-3",
        cargo: "Supervisor de Producción",
        empresa: "Molinos del Sur S.A.C.",
        lugar: "Arequipa, Perú",
        inicio: "Ene 2010",
        fin: "Feb 2014",
        logros: "Supervisé 3 turnos con 40 operarios\nBajé los reprocesos de 6 % a 3 % con estándares de trabajo y capacitación",
      },
    ],
    estudios: [
      {
        id: "est-1",
        titulo: "Maestría en Administración de Negocios (MBA)",
        institucion: "Escuela de Negocios del Pacífico",
        lugar: "Lima, Perú",
        inicio: "2016",
        fin: "2018",
        detalle: "",
      },
      {
        id: "est-2",
        titulo: "Ingeniería Industrial",
        institucion: "Universidad del Valle Verde",
        lugar: "Arequipa, Perú",
        inicio: "2004",
        fin: "2009",
        detalle: "",
      },
    ],
    habilidades: "Liderazgo de equipos de más de 100 personas\nPresupuesto operativo y control de costos\nLean Manufacturing y mejora continua\nHerramientas: SAP, Power BI y Excel avanzado",
    idiomas: "Español nativo\nInglés avanzado (C1)",
    certificaciones: "Lean Six Sigma Green Belt, 2017\nGestión de proyectos, curso ejecutivo, 2021",
    proyectos: "",
  },
  respuesta: `NOMBRE: Rodrigo Valdivia Cárdenas
CONTACTO: Arequipa, Perú | rodrigo.valdivia@ejemplo.com | +51 900 000 104 | linkedin.com/in/rodrigo-valdivia-ejemplo
## PERFIL PROFESIONAL
Gerente de operaciones con más de 15 años de experiencia en producción, logística y mantenimiento, con 12 años en cargos de jefatura y gerencia. Ha liderado equipos de hasta 120 personas y un presupuesto anual de 8 millones de soles, y reducido costos con mejora continua Lean. MBA e ingeniero industrial.
## EXPERIENCIA PROFESIONAL
### Agroexportadora Valle Sol S.A.C. | Arequipa, Perú
Gerente de Operaciones | Ene 2019 – Actualidad
- Dirijo producción, logística y mantenimiento con un equipo de 120 personas y un presupuesto anual de 8 millones de soles.
- Implementé un programa de mejora continua Lean que redujo los costos logísticos en 14 % en dos años.
- Disminuí las paradas no planificadas de la planta de 9 % a 4 % con un plan de mantenimiento preventivo.
- Negocié con 5 proveedores de empaques y logré un ahorro anual de 350 mil soles.
### Distribuidora Andes Norte S.A. | Arequipa, Perú
Jefe de Logística | Mar 2014 – Dic 2018
- Lideré un equipo de 35 personas en almacenes y transporte.
- Reduje el tiempo de entrega de pedidos de 72 a 48 horas al rediseñar las rutas de despacho.
- Implementé un sistema de control de inventarios con exactitud de 98 %.
### Molinos del Sur S.A.C. | Arequipa, Perú
Supervisor de Producción | Ene 2010 – Feb 2014
- Supervisé 3 turnos con 40 operarios.
- Bajé los reprocesos de 6 % a 3 % con estándares de trabajo y capacitación.
## EDUCACIÓN
### Escuela de Negocios del Pacífico | Lima, Perú
Maestría en Administración de Negocios (MBA) | 2016 – 2018
### Universidad del Valle Verde | Arequipa, Perú
Ingeniería Industrial | 2004 – 2009
## HABILIDADES
- Liderazgo: equipos de más de 100 personas
- Gestión: presupuesto operativo, control de costos, mejora continua Lean
- Herramientas: SAP, Power BI, Excel avanzado
## IDIOMAS
- Español: nativo
- Inglés: avanzado (C1)
## CERTIFICACIONES
### Lean Six Sigma Green Belt | Certificación
Green Belt | 2017
### Gestión de proyectos | Curso ejecutivo
Certificado de finalización | 2021
=== NOTAS ===
- Palabras clave cubiertas: producción, logística, mantenimiento, presupuesto operativo, mejora continua Lean, reducción de costos, equipos de más de 50 personas, MBA, Lean Six Sigma.
- Verifica antes de enviar: que puedas respaldar cada cifra (costos, paradas, ahorros) con documentos o referencias.
- Con más de 15 años de experiencia, considera pasar a dos páginas solo si el reclutador lo pide; una página se lee más rápido.`,
};

export const EJEMPLOS_CV: EjemploCv[] = [SIN_EXPERIENCIA, JUNIOR_TECNICO, SEMI_SENIOR_MARKETING, SENIOR_GERENCIA];

export function getEjemploCv(id: string): EjemploCv | undefined {
  return EJEMPLOS_CV.find((e) => e.id === id);
}
