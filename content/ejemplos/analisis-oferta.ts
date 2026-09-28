import type { DatosAnalisis } from "@/lib/analisis/tipos";

export interface EjemploAnalisis {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosAnalisis;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente. */
  respuesta: string;
}

/**
 * Tres análisis de ejemplo. TODO es ficticio: personas, empresas, ofertas, correos (@ejemplo.com), teléfonos y cifras están inventados
 * solo para ilustrar la herramienta.
 */
const DATOS_ANA: DatosAnalisis = {
  cv: `ANA TORRES PAREDES
Lima, Perú | ana.torres@ejemplo.com | +51 900 000 401

PERFIL PROFESIONAL
Estudiante de Marketing con prácticas en redes sociales y publicidad digital. Interés en analítica y contenido.

EXPERIENCIA PROFESIONAL
Café Aroma | Lima, Perú
Practicante de marketing | Enero 2026 – Agosto 2026 (8 meses)
- Gestioné campañas en Meta Ads para promociones de la cafetería.
- Analicé resultados con Google Analytics y armé reportes semanales.
- Diseñé piezas gráficas en Canva para redes sociales.

EDUCACIÓN
Universidad Ejemplo | Lima, Perú
Bachiller en Marketing | 2022 – 2026

HABILIDADES
- Herramientas: Meta Ads, Google Analytics, Canva, Excel`,
  oferta: `Asistente de Marketing Digital — Agencia Andes Creativa (empresa ficticia)
Lima, Perú · híbrido

Requisitos indispensables:
- Manejo de Meta Ads.
- Google Analytics 4.
- 1 año de experiencia en marketing digital.

Se valorará:
- Canva.
- Inglés intermedio.
- Creatividad.`,
  pesoObligatorio: 70,
  anios: "0,7",
  distingue: "si",
};

const DATOS_RENATO: DatosAnalisis = {
  cv: `RENATO QUISPE LÓPEZ
Lima, Perú | renato.quispe@ejemplo.com | +51 900 000 402

PERFIL PROFESIONAL
Analista de datos junior con experiencia en consultas SQL, reportes y dashboards.

EXPERIENCIA PROFESIONAL
Distribuidora Ejemplo S.A.C. | Lima, Perú
Analista de datos junior | Marzo 2025 – Actualidad
- Escribí consultas SQL para extraer ventas por sucursal.
- Armé dashboards en Tableau para el área comercial.
- Preparé reportes mensuales en Excel.

EDUCACIÓN
Universidad Ejemplo | Lima, Perú
Bachiller en Estadística | 2019 – 2023

HABILIDADES
- Técnicas: SQL, Tableau, Excel, Python básico`,
  oferta: `Analista de Datos — Retail Andino (empresa ficticia)
Lima, Perú · híbrido

Buscamos una persona para:
- Consultar y analizar datos de ventas con SQL.
- Construir dashboards en Power BI.
- Preparar reportes en Excel avanzado.

Perfil: 2 años de experiencia en análisis de datos, inglés técnico y capacidad de storytelling con datos.`,
  pesoObligatorio: 70,
  anios: "1,5",
  distingue: "no",
};

const DATOS_LUCIA: DatosAnalisis = {
  cv: `LUCÍA MAMANI CHOQUE
Arequipa, Perú | lucia.mamani@ejemplo.com | +51 900 000 403

PERFIL PROFESIONAL
Asistente contable con 3 años de experiencia en conciliaciones, registro de comprobantes y reportes en Excel.

EXPERIENCIA PROFESIONAL
Contadores Asociados del Sur | Arequipa, Perú
Asistente contable | Marzo 2023 – Actualidad
- Realicé conciliaciones bancarias mensuales de 4 cuentas.
- Registré comprobantes de compra y de venta en el sistema contable del estudio.
- Elaboré reportes en Excel con tablas dinámicas y funciones de búsqueda.
- Apoyé el cierre mensual de dos clientes.

EDUCACIÓN
Instituto Superior Ejemplo | Arequipa, Perú
Técnica en Contabilidad | 2018 – 2021

CERTIFICACIONES
Excel intermedio (2023)`,
  oferta: `Asistente Contable — Grupo Volcán (empresa ficticia)
Arequipa, Perú · tiempo completo

Requisitos indispensables:
- Conciliaciones bancarias.
- Excel intermedio.
- Manejo de SAP.
- 2 años de experiencia en contabilidad.

Deseable:
- Conocimientos de contabilidad de costos.
- Curso de tributación.`,
  pesoObligatorio: 60,
  anios: "3",
  distingue: "si",
};

const RESPUESTA_ANA = `## Requisitos
requisito,categoria,tipo,estado,evidencia
Manejo de Meta Ads,herramientas,OBLIGATORIO,CUMPLE,"«Gestioné campañas en Meta Ads para promociones de la cafetería»"
Google Analytics 4,herramientas,OBLIGATORIO,PARCIAL,"«Analicé resultados con Google Analytics» (el CV no indica la versión)"
1 año de experiencia en marketing digital,experiencia,OBLIGATORIO,PARCIAL,"«Practicante de marketing | Enero 2026 – Agosto 2026 (8 meses)»"
Canva,herramientas,DESEABLE,CUMPLE,"«Diseñé piezas gráficas en Canva para redes sociales»"
Inglés intermedio,idiomas,DESEABLE,NO IDENTIFICADO,(sin evidencia)
Creatividad,otros,DESEABLE,NO EVALUABLE,(requisito subjetivo)

## Palabras clave faltantes
- Google Analytics 4 | Equivalente en el CV: «Google Analytics» (sin versión)
- Inglés intermedio | Equivalente en el CV: (ninguno)

## Fortalezas
- Experiencia práctica con campañas en Meta Ads, el primer requisito indispensable.
- Manejo de Canva, un requisito valorable, con un ejemplo concreto.
- Ya arma reportes semanales con los resultados de Google Analytics.

## Brechas
- La experiencia (8 meses) es menor que el año que pide la oferta.
- El inglés intermedio no aparece en el CV.

## A verificar
- Si el «Google Analytics» que usó era la versión 4.
- Su nivel real de inglés, si lo tiene.
- Que las fechas de las prácticas coincidan con lo que dirá en la entrevista.

## Plan de acción
- [CV] Si usaste Google Analytics 4, escribe «Google Analytics 4» en la experiencia y en habilidades; si no, no lo cambies.
- [CV] Agrega tu nivel de inglés real, solo si lo tienes.
- [ENTREVISTA] Prepara un ejemplo concreto de una campaña en Meta Ads: objetivo, qué hiciste tú y qué resultado obtuviste, con datos reales.
- [ENTREVISTA] Prepara una respuesta honesta sobre tus 8 meses de experiencia frente al año que piden.
- [APRENDER] Si no has usado la versión 4 de Google Analytics, repasa en qué se diferencia de la versión anterior antes de postular.

## Qué debes verificar
- Que cada cita de la tabla exista en tu CV.
- Que lo que escribas en tu CV sea verdad y lo puedas explicar.

## Siguiente paso
- Ajusta tu CV con lo que sea cierto y vuelve a comparar.
- Prepara tu ejemplo de campaña para la entrevista.`;

const RESPUESTA_RENATO = `\`\`\`
## Requisitos
requisito,categoria,tipo,estado,evidencia
Consultar y analizar datos de ventas con SQL,conocimientos técnicos,NO ESPECIFICADO,CUMPLE,"«Escribí consultas SQL para extraer ventas por sucursal»"
Construir dashboards en Power BI,herramientas,NO ESPECIFICADO,NO IDENTIFICADO,(sin evidencia)
Preparar reportes en Excel avanzado,herramientas,NO ESPECIFICADO,PARCIAL,"«Preparé reportes mensuales en Excel»"
2 años de experiencia en análisis de datos,experiencia,NO ESPECIFICADO,PARCIAL,"«Analista de datos junior | Marzo 2025 – Actualidad»"
Inglés técnico,idiomas,NO ESPECIFICADO,NO IDENTIFICADO,(sin evidencia)
Storytelling con datos,otros,NO ESPECIFICADO,NO EVALUABLE,(requisito subjetivo)

## Palabras clave faltantes
- Power BI | Equivalente en el CV: «dashboards en Tableau» (herramienta parecida, no es la misma)
- Excel avanzado | Equivalente en el CV: «reportes mensuales en Excel» (sin nivel)
- Inglés técnico | Equivalente en el CV: (ninguno)

## Fortalezas
- Experiencia directa con consultas SQL sobre datos de ventas.
- Ha armado dashboards para el área comercial, aunque en otra herramienta.

## Brechas
- Power BI no aparece: el CV solo menciona Tableau.
- La experiencia declarada (1,5 años) es menor que los 2 años que pide la oferta.
- No se menciona el inglés.

## A verificar
- La oferta no distingue obligatorios de deseables: confirma con la empresa cuáles son imprescindibles.
- Si has usado Power BI, aunque sea en proyectos personales.
- Tu nivel real de Excel y de inglés.

## Plan de acción
- [CV] Si has usado Power BI, agrégalo con un ejemplo real; si no, deja Tableau y explica que es una herramienta equivalente.
- [CV] Indica tu nivel de Excel (por ejemplo, las funciones que usas) solo si es cierto.
- [ENTREVISTA] Prepara cómo explicarías que tu experiencia con Tableau se traslada a Power BI, sin decir que ya lo dominas.
- [APRENDER] Practica lo básico de Power BI si vas a postular.

## Qué debes verificar
- Que la oferta realmente no distinga entre requisitos; el porcentaje trata todos por igual.
- Que cada cita exista en tu CV.

## Siguiente paso
- Decide si postulas y refuerza en tu CV lo que sea cierto.
\`\`\``;

const RESPUESTA_LUCIA = `## Requisitos
requisito,categoria,tipo,estado,evidencia
Conciliaciones bancarias,conocimientos técnicos,OBLIGATORIO,CUMPLE,"«Realicé conciliaciones bancarias mensuales de 4 cuentas»"
Excel intermedio,herramientas,OBLIGATORIO,CUMPLE,"«Excel intermedio (2023)»"
Manejo de SAP,tecnologías,OBLIGATORIO,NO IDENTIFICADO,(sin evidencia)
2 años de experiencia en contabilidad,experiencia,OBLIGATORIO,CUMPLE,"«Asistente contable | Marzo 2023 – Actualidad»"
Conocimientos de contabilidad de costos,conocimientos técnicos,DESEABLE,PARCIAL,"«Registré comprobantes de compra y de venta en el sistema contable del estudio»"
Curso de tributación,certificaciones,DESEABLE,NO IDENTIFICADO,(sin evidencia)

## Palabras clave faltantes
- SAP | Equivalente en el CV: «sistema contable del estudio» (no dice cuál)
- Contabilidad de costos | Equivalente en el CV: (ninguno)
- Tributación | Equivalente en el CV: (ninguno)

## Fortalezas
- Cumple los requisitos de conciliaciones bancarias, Excel intermedio y años de experiencia.
- Tiene una certificación de Excel intermedio con año.

## Brechas
- Manejo de SAP, un requisito indispensable, no aparece en el CV.
- No hay evidencia de contabilidad de costos ni de tributación, ambos deseables.

## A verificar
- Si el «sistema contable del estudio» es SAP u otro sistema.
- Si has usado SAP en algún momento.

## Plan de acción
- [CV] Si el sistema contable que usas es SAP, escribe «SAP» en tu experiencia; si es otro, escribe su nombre.
- [ENTREVISTA] Prepara una respuesta honesta sobre SAP: qué sistema usas hoy, qué sabes de SAP y cómo lo aprenderías.
- [APRENDER] Si vas a postular sin haber usado SAP, revisa lo básico antes de la entrevista.

## Qué debes verificar
- Que cada cita exista en tu CV.
- Lo que la oferta pida sobre SAP: confírmalo en el aviso original.

## Siguiente paso
- Aclara qué sistema contable usas y ajusta tu CV con lo que sea cierto.`;

export const EJEMPLOS_ANALISIS: EjemploAnalisis[] = [
  { id: "ana-marketing", etiqueta: "Ana · Marketing digital · «Postula ajustando»", descripcion: "Oferta que distingue obligatorios y deseables; dos requisitos parciales.", datos: DATOS_ANA, respuesta: RESPUESTA_ANA },
  { id: "renato-datos", etiqueta: "Renato · Análisis de datos · oferta sin distinguir", descripcion: "La oferta no distingue: todos los requisitos pesan igual.", datos: DATOS_RENATO, respuesta: RESPUESTA_RENATO },
  { id: "lucia-contable", etiqueta: "Lucía · Asistente contable · «Postula si cumples…»", descripcion: "Un requisito indispensable (SAP) que el CV no muestra.", datos: DATOS_LUCIA, respuesta: RESPUESTA_LUCIA },
];
