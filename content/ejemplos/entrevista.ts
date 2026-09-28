import type { DatosEntrevista } from "@/lib/entrevista/tipos";
import { DATOS_ANDREA, DATOS_CARLOS, DATOS_MARCOS } from "./entrevista-datos";

export interface EjemploEntrevista {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosEntrevista;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente. */
  respuesta: string;
}

const CARLOS = `## Mapa del puesto
- Responsabilidades: diseñar y mantener APIs REST para el procesamiento de transacciones; integrar servicios mediante colas de mensajes; desplegar y monitorear servicios en contenedores; participar en la revisión de código y en el soporte de incidentes.
- Conocimientos técnicos: Node.js y PostgreSQL.
- Herramientas: Docker y RabbitMQ (Kubernetes básico es deseable).
- Metodologías: la oferta no menciona ninguna.
- Experiencia exigida: mínimo 3 años de experiencia con Node.js.
- Competencias conductuales implícitas: trabajo en equipo y comunicación clara. [HIPÓTESIS] También manejo de incidentes, por la mención del soporte.

## Riesgos del CV
- [REQUISITO NO EVIDENCIADO] «Experiencia con Docker» — la oferta lo pide y tu CV no lo menciona. Cuéntalo con honestidad: cómo despliegas hoy, qué sabes de contenedores y cómo lo aprenderías, sin afirmar experiencia productiva.
- [AFIRMACIÓN QUE GENERARÁ REPREGUNTAS] «lo restablecí en 3 horas» — te preguntarán por la causa, por qué parte hiciste tú y qué cambió después. Prepara la línea de tiempo con datos reales.
- [REQUISITO NO EVIDENCIADO] «Mínimo 3 años de experiencia con Node.js» — tu CV muestra Node.js en dos puestos desde enero de 2022. Prepárate para explicar las fechas de cada uno.

## Banco de preguntas
Pregunta 1 [Presentación]: Cuéntame sobre ti y por qué postulas a este puesto.
- Qué evalúa: capacidad de síntesis y relación entre tu trayectoria y la oferta.
- Experiencia real del CV: «más de 4 años de experiencia en Node.js, APIs REST y colas de mensajes».
- Estructura sugerida: presente [completar con tu dato: tu rol actual], pasado [completar con tu dato: lo más relevante de tu trayectoria], futuro [completar con tu dato: por qué esta oferta].
- Repregunta: ¿Qué te atrae de trabajar en procesamiento de transacciones?

Pregunta 2 [Trayectoria]: ¿Qué aprendiste al pasar de desarrollador junior a desarrollador backend?
- Qué evalúa: capacidad de aprendizaje y crecimiento.
- Experiencia real del CV: «Mantuve una API con Node.js y consultas en PostgreSQL».
- Estructura sugerida: punto de partida [completar con tu dato], lo que aprendiste [completar con tu dato], cómo lo aplicaste después [completar con tu dato].
- Repregunta: ¿Qué harías distinto hoy en tu primer año?

Pregunta 3 [Experiencia relacionada]: Cuéntame cómo trabajaste en las APIs del módulo de pagos.
- Qué evalúa: profundidad técnica y claridad al explicar.
- Experiencia real del CV: «Desarrollé APIs REST con Node.js y Express para el módulo de pagos».
- Estructura sugerida: objetivo del módulo [completar con tu dato], tu parte [completar con tu dato], decisiones técnicas y por qué [completar con tu dato].
- Repregunta: ¿Cómo manejabas los errores en esas APIs?

Pregunta 4 [Técnicas]: ¿Cómo integrarías un servicio con colas de mensajes?
- Qué evalúa: comprensión del trabajo en segundo plano y de los fallos.
- Experiencia real del CV: «Integré RabbitMQ para procesar notificaciones en segundo plano».
- Estructura sugerida: por qué una cola [completar con tu dato], cómo lo hiciste tú [completar con tu dato], qué ocurre si un mensaje falla [completar con tu dato].
- Repregunta: ¿Cómo evitarías que un mensaje se procese dos veces?

Pregunta 5 [Técnicas]: ¿Cómo desplegabas tus servicios?
- Qué evalúa: honestidad, conocimiento real del despliegue y capacidad de aprender lo que falta.
- Experiencia real del CV: «Desplegué los servicios en servidores Linux con PM2».
- Estructura sugerida: explica tu forma real de despliegue [completar con tu dato]; di lo que sabes de Docker [completar con lo que realmente sabes]; cuenta cómo lo aprenderías [completar con tu plan real]. No afirmes experiencia productiva con Docker.
- Repregunta: ¿Qué diferencia ves entre desplegar con PM2 y usar contenedores?

Pregunta 6 [Conductuales]: Cuéntame de un incidente en producción.
- Qué evalúa: manejo de la presión, método para resolver problemas y comunicación.
- Experiencia real del CV: «Resolví la caída del servicio de pagos en producción».
- Estructura sugerida (STAR): Situación [completar con tu dato], Tarea [completar con tu dato], Acción [completar con tu dato: qué hiciste tú], Resultado [completar con tu dato; en tu CV figura «lo restablecí en 3 horas»].
- Repregunta: ¿Qué cambiaste después para que no volviera a ocurrir?

Pregunta 7 [Conductuales]: Háblame de una vez que trabajaste con otra área para resolver algo.
- Qué evalúa: trabajo en equipo y comunicación.
- Experiencia real del CV: «Trabajo en equipo con producto y QA».
- Estructura sugerida (STAR): Situación [completar con tu dato], Tarea [completar con tu dato], Acción [completar con tu dato], Resultado [completar con tu dato].
- Repregunta: ¿Qué harías si no estuvieran de acuerdo contigo?

Pregunta 8 [Situacionales]: Si una cola acumula mensajes y las notificaciones se retrasan, ¿qué harías primero?
- Qué evalúa: razonamiento ante un problema real y priorización.
- Experiencia real del CV: «Integré RabbitMQ para procesar notificaciones en segundo plano».
- Estructura sugerida: qué revisarías primero [completar con tu dato], cómo confirmarías la causa [completar con tu dato], a quién avisarías [completar con tu dato].
- Repregunta: ¿Qué medirías para saber si el problema volvió?

Pregunta 9 [Proyectos]: Explícame en 2 minutos un proyecto del que te sientas orgulloso.
- Qué evalúa: capacidad de explicar con orden y de destacar tu aporte.
- Experiencia real del CV: «Desarrollé APIs REST con Node.js y Express para el módulo de pagos».
- Estructura sugerida: contexto [completar con tu dato], tu rol [completar con tu dato], una decisión técnica [completar con tu dato], resultado [completar con tu dato].
- Repregunta: ¿Qué parte cambiarías si lo hicieras de nuevo?

Pregunta 10 [Fortalezas]: ¿Cuál dirías que es tu mayor fortaleza técnica?
- Qué evalúa: autoconocimiento y evidencia.
- Experiencia real del CV: «Escribí pruebas unitarias con Jest».
- Estructura sugerida: la fortaleza [completar con tu dato], un ejemplo real [completar con tu dato], el efecto en el equipo [completar con tu dato].
- Repregunta: ¿Cómo lo demostrarías en este puesto?

Pregunta 11 [Áreas de mejora]: ¿En qué tecnología quieres mejorar?
- Qué evalúa: honestidad y plan de crecimiento.
- Experiencia real del CV: (sin evidencia en el CV) sobre contenedores.
- Estructura sugerida: un área real [completar con tu dato], lo que haces para mejorarla [completar con tu plan real], una evidencia de avance [completar con tu dato].
- Repregunta: ¿Qué has hecho hasta ahora para aprenderlo?

Pregunta 12 [Específicas de la oferta]: La oferta pide desplegar y monitorear servicios en contenedores: ¿cómo te prepararías para hacerlo?
- Qué evalúa: capacidad de cerrar una brecha y de ser honesto sobre ella.
- Experiencia real del CV: (sin evidencia en el CV) con contenedores.
- Estructura sugerida: lo que sí has hecho en despliegue [completar con tu dato], lo que estudiarías primero [completar con tu plan real], cómo pedirías ayuda al equipo [completar con tu dato].
- Repregunta: ¿Cuánto tiempo crees que necesitarías para ser autónomo?

## Temas a estudiar
- [ALTA] Docker: conceptos básicos de imagen y contenedor — la oferta lo pide y tu CV no lo evidencia.
- [ALTA] Tu incidente de la caída del servicio de pagos — prepara la línea de tiempo, la causa y qué cambió después.
- [MEDIA] RabbitMQ: colas, confirmaciones y reintentos — es un requisito de la oferta que sí aparece en tu CV.
- [MEDIA] PostgreSQL: consultas e índices — la oferta lo pide y tu CV lo menciona una vez.
- [BAJA] Kubernetes básico — la oferta lo marca como deseable.

## Preguntas para el entrevistador
- ¿Cómo es hoy el proceso de despliegue de los servicios del equipo?
- ¿Cómo se organiza el soporte de incidentes y quiénes participan?
- ¿Qué se espera de este puesto en los primeros meses?
- ¿Cómo es la revisión de código en el equipo?
- ¿Qué oportunidades de capacitación continua hay?

## Qué debes verificar
- Lo que sabes de la empresa (que procesa pagos digitales para comercios pequeños) en su web oficial.
- Que las fechas de tu CV coincidan con lo que vas a contar en la entrevista.
- Que puedas explicar con detalle el incidente y las 3 horas.

## Siguiente paso
- Completa cada hueco [completar con tu dato] con datos reales de tu experiencia.
- Practica en voz alta las preguntas 5 y 6 con el cronómetro.`;

const ANDREA = `\`\`\`
## Mapa del puesto
- Responsabilidades: atender consultas de clientes y proveedores; elaborar reportes en Excel; gestionar el archivo de documentos; coordinar agendas y reuniones.
- Conocimientos técnicos: Excel intermedio.
- Herramientas: Excel.
- Metodologías: la oferta no menciona ninguna.
- Experiencia exigida: 2 años de experiencia en puestos administrativos.
- Competencias conductuales implícitas: buena comunicación y disponibilidad inmediata.

## Riesgos del CV
- [VACÍO TEMPORAL] «Marzo 2018 – Febrero 2023» — entre este puesto y el siguiente, que empieza en «Marzo 2024», hay un año sin trabajo. Prepara una explicación breve, verdadera y sin dar más detalles personales de los que quieras.
- [REQUISITO NO EVIDENCIADO] «Excel intermedio» — tu CV solo dice «Excel». Prepara ejemplos reales de lo que haces con Excel.
- [AFIRMACIÓN QUE GENERARÁ REPREGUNTAS] «Elaboré informes semanales de ventas en Excel para la gerencia» — te preguntarán qué datos usabas y qué funciones.

## Banco de preguntas
Pregunta 1 [Presentación]: Cuéntame sobre ti.
- Qué evalúa: síntesis y relación con el puesto.
- Experiencia real del CV: «experiencia en atención al cliente, archivo y control de documentos».
- Estructura sugerida: presente [completar con tu dato], pasado [completar con tu dato], por qué este puesto [completar con tu dato].
- Repregunta: ¿Por qué te interesa este puesto?

Pregunta 2 [Trayectoria]: Veo que entre febrero de 2023 y marzo de 2024 no aparece trabajo. ¿Qué ocurrió?
- Qué evalúa: honestidad, claridad y actitud frente a un tema sensible.
- Experiencia real del CV: «Marzo 2018 – Febrero 2023» y «Marzo 2024 – Actualidad».
- Estructura sugerida: el hecho, de forma breve y honesta [completar con tu dato]; qué hiciste en ese tiempo [completar con lo que realmente hiciste]; por qué estás lista ahora [completar con tu dato].
- Repregunta: ¿Cómo te mantuviste al día en ese tiempo?

Pregunta 3 [Trayectoria]: ¿Por qué dejaste tu puesto en Comercial Los Volcanes?
- Qué evalúa: motivos y forma de hablar de un empleador anterior.
- Experiencia real del CV: «Asistente administrativa | Marzo 2018 – Febrero 2023».
- Estructura sugerida: motivo real y breve [completar con tu dato], lo que valoras de esa experiencia [completar con tu dato], hacia dónde quieres ir [completar con tu dato].
- Repregunta: ¿Qué te llevaste de ese puesto?

Pregunta 4 [Experiencia relacionada]: Cuéntame cómo organizaste el archivo de expedientes.
- Qué evalúa: método de trabajo y orden.
- Experiencia real del CV: «Organicé el archivo físico y digital de los expedientes de clientes».
- Estructura sugerida: cómo estaba antes [completar con tu dato], qué criterio usaste [completar con tu dato], cómo lo mantienes [completar con tu dato].
- Repregunta: ¿Cómo encuentras un documento urgente?

Pregunta 5 [Técnicas]: ¿Qué haces con Excel en tu trabajo?
- Qué evalúa: nivel real de Excel frente al «Excel intermedio» de la oferta.
- Experiencia real del CV: «Elaboré informes semanales de ventas en Excel para la gerencia».
- Estructura sugerida: qué informe [completar con tu dato], qué funciones o herramientas usabas [completar con lo que realmente usas], qué harías para mejorar [completar con tu plan real].
- Repregunta: ¿Puedes explicar cómo armabas ese informe paso a paso?

Pregunta 6 [Conductuales]: Cuéntame de una vez que atendiste a un cliente molesto.
- Qué evalúa: comunicación, paciencia y solución de problemas.
- Experiencia real del CV: «Atendí llamadas y correos de clientes y los derivé al área correspondiente».
- Estructura sugerida (STAR): Situación [completar con tu dato], Tarea [completar con tu dato], Acción [completar con tu dato], Resultado [completar con tu dato].
- Repregunta: ¿Qué harías distinto ahora?

Pregunta 7 [Conductuales]: Háblame de una vez que tuviste mucho trabajo a la vez.
- Qué evalúa: organización y prioridades.
- Experiencia real del CV: «Coordiné la agenda de reuniones de la gerencia».
- Estructura sugerida (STAR): Situación [completar con tu dato], Tarea [completar con tu dato], Acción [completar con tu dato], Resultado [completar con tu dato].
- Repregunta: ¿Cómo decidiste qué hacer primero?

Pregunta 8 [Situacionales]: Si dos personas te piden algo urgente al mismo tiempo, ¿qué haces?
- Qué evalúa: criterio para priorizar y comunicar.
- Experiencia real del CV: «Coordiné la agenda de reuniones de la gerencia».
- Estructura sugerida: cómo decides la prioridad [completar con tu dato], cómo lo comunicas [completar con tu dato], cómo das seguimiento [completar con tu dato].
- Repregunta: ¿Y si ambos dicen que es lo más importante?

Pregunta 9 [Proyectos]: ¿Qué logro de tu último puesto te dejó más satisfecha?
- Qué evalúa: capacidad de reconocer y explicar un aporte propio.
- Experiencia real del CV: «Organicé el archivo físico y digital de los expedientes de clientes».
- Estructura sugerida: qué hiciste [completar con tu dato], por qué importaba [completar con tu dato], qué cambió [completar con tu dato].
- Repregunta: ¿Cómo sabes que funcionó?

Pregunta 10 [Fortalezas]: ¿Cuál es tu mayor fortaleza?
- Qué evalúa: autoconocimiento y evidencia.
- Experiencia real del CV: «organización».
- Estructura sugerida: la fortaleza [completar con tu dato], un ejemplo real [completar con tu dato], cómo ayuda en este puesto [completar con tu dato].
- Repregunta: ¿Cómo lo demostrarías el primer mes?

Pregunta 11 [Áreas de mejora]: ¿Cuál es tu mayor debilidad?
- Qué evalúa: honestidad y capacidad de mejorar.
- Experiencia real del CV: (sin evidencia en el CV) sobre debilidades.
- Estructura sugerida: un área real [completar con tu dato], lo que haces para mejorarla [completar con tu plan real], una evidencia de avance [completar con tu dato].
- Repregunta: ¿Qué has hecho esta semana para mejorarla?

Pregunta 12 [Específicas de la oferta]: La oferta pide disponibilidad inmediata: ¿cuándo podrías empezar?
- Qué evalúa: claridad sobre tus tiempos y compromisos.
- Experiencia real del CV: «Marzo 2024 – Actualidad».
- Estructura sugerida: tu fecha real [completar con tu dato], si debes avisar en tu puesto actual [completar con tu dato], cómo lo coordinarías [completar con tu dato].
- Repregunta: ¿Necesitas algún ajuste de horario?

## Temas a estudiar
- [ALTA] Cómo explicar el hueco entre febrero de 2023 y marzo de 2024 — es el punto que más preocupa y el más probable en una entrevista de Recursos Humanos.
- [ALTA] Excel: lo que haces y lo que no haces — la oferta pide Excel intermedio.
- [MEDIA] Tus informes semanales de ventas — es el logro que quieres destacar.
- [MEDIA] Lo que sabes de la empresa — dijiste que no sabes nada más, así que revisa su web oficial.

## Preguntas para el entrevistador
- ¿Cómo es un día típico en este puesto?
- ¿Qué reportes se elaboran con más frecuencia?
- ¿Con qué áreas se coordina esta persona?
- ¿Cómo se mide el desempeño en los primeros meses?
- ¿Cuál es el siguiente paso del proceso?

## Qué debes verificar
- Lo que investigues de la empresa, en su web oficial.
- Que las fechas de tu CV coincidan con lo que cuentes.

## Siguiente paso
- Escribe tu explicación del hueco en tres frases y practícala en voz alta.
- Completa cada hueco [completar con tu dato] con datos reales.
\`\`\``;

const MARCOS = `## Informe de simulación
Resumen: respondiste con orden y claridad, pero faltó respaldar tus resultados con datos y preparar la respuesta sobre las metas no cumplidas. [ESTIMACIÓN] Las evaluaciones se basan en el texto escrito.
Evaluación por pregunta:
- Pregunta 1 | Presentación | Claridad: Alta | Evidencia: Media | Relación con el puesto: Alta | Duración: Adecuada [ESTIMACIÓN] | Comentario: buena síntesis; añade un dato real de tu cartera.
- Pregunta 2 | Trayectoria | Claridad: Alta | Evidencia: Media | Relación con el puesto: Alta | Duración: Adecuada [ESTIMACIÓN] | Comentario: explicaste el paso de asesor a ejecutivo con orden.
- Pregunta 3 | Experiencia relacionada | Claridad: Media | Evidencia: Media | Relación con el puesto: Alta | Duración: Larga [ESTIMACIÓN] | Comentario: la respuesta sobre la cartera se extendió; ve al punto antes.
- Pregunta 4 | Técnicas | Claridad: Alta | Evidencia: Alta | Relación con el puesto: Alta | Duración: Adecuada [ESTIMACIÓN] | Comentario: describiste bien el uso del CRM.
- Pregunta 5 | Conductuales | Claridad: Media | Evidencia: Baja | Relación con el puesto: Media | Duración: Corta [ESTIMACIÓN] | Comentario: faltó la parte del resultado.
- Pregunta 6 | Situacionales | Claridad: Media | Evidencia: Media | Relación con el puesto: Alta | Duración: Adecuada [ESTIMACIÓN] | Comentario: planteaste un método, pero sin un ejemplo propio.
- Pregunta 7 | Áreas de mejora | Claridad: Baja | Evidencia: Baja | Relación con el puesto: Media | Duración: Corta [ESTIMACIÓN] | Comentario: la respuesta sobre las metas no cumplidas sonó defensiva.
- Pregunta 8 | Específicas de la oferta | Claridad: Alta | Evidencia: Media | Relación con el puesto: Alta | Duración: Adecuada [ESTIMACIÓN] | Comentario: mostraste disponibilidad para visitar clientes.
Fortalezas:
- Ordenas la respuesta y hablas con claridad de tu seguimiento de clientes.
- Conoces bien el uso del CRM.
Puntos débiles:
- No respaldas los resultados con datos reales de tu experiencia.
- La respuesta sobre los trimestres en los que no cumpliste la meta sonó defensiva.
Plan de práctica:
- Prepara una historia STAR sobre una venta cerrada, con un dato real.
- Practica la respuesta sobre los 3 trimestres sin meta: hecho, aprendizaje y qué cambiaste.
- Repite las preguntas 5 y 7 con el cronómetro de 2 minutos.

## Qué debes verificar
- Los datos de tu CV (por ejemplo, 5 de 8 trimestres) deben coincidir con lo que dijiste.
- Cualquier dato de la empresa que hayas mencionado, en su web oficial.

## Siguiente paso
- Escribe tu historia STAR de la venta cerrada y complétala con datos reales.
- Repite la simulación después de practicar las preguntas 5 y 7.`;

export const EJEMPLOS_ENTREVISTA: EjemploEntrevista[] = [
  { id: "carlos-backend", etiqueta: "Carlos · Backend Node.js · técnica", descripcion: "Entrevista técnica con un requisito que su CV no evidencia (Docker).", datos: DATOS_CARLOS, respuesta: CARLOS },
  { id: "andrea-administrativa", etiqueta: "Andrea · Administrativa · Recursos Humanos", descripcion: "Entrevista de Recursos Humanos con un vacío de un año en el CV.", datos: DATOS_ANDREA, respuesta: ANDREA },
  { id: "marcos-comercial", etiqueta: "Marcos · Comercial B2B · jefe directo (simulación)", descripcion: "Simulación exigente; se pega el informe final.", datos: DATOS_MARCOS, respuesta: MARCOS },
];
