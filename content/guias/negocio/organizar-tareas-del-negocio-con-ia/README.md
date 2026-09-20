# Organizar las tareas de tu negocio con IA

**Ruta:** `/negocio/guias/organizar-tareas-del-negocio-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). Guía nueva, creada el 2026-09-19 (`publishedAt` y `updatedAt`). Primera guía de la categoría `negocio`.
**Tipo de guía:** estrategia y planificación + números y datos (`estrategia-planificacion`, `numeros-datos`; `handlesNumbers: true`). Sin `usesExternalInfo`: no hay datos externos.
**Problema:** una lista de pendientes desordenada, sin criterio de qué va primero ni cuánto cabe en la semana; una IA a la que se le pide «organízame esto y hazme el plan» ordena con criterios propios y arma un plan cuyas sumas nadie comprueba.
**Ángulo propio:** la IA solo prepara datos (tabla con impacto justificado con las palabras de la persona, fechas y minutos copiados, dependencias y responsables) y reparte; **la hoja calcula** urgencia, prioridad y minutos por persona y día; la persona decide. Diferencia frente a `calendario-de-contenido-con-ia` (piezas de contenido en 4 semanas) y `responder-consultas-de-clientes-con-ia`: aquí son pendientes de cualquier tipo, con criterios de prioridad explícitos y comprobación de capacidad.
**Relacionadas del plan que aún no existen:** `sistema-diario-de-trabajo-con-ia` y `documentar-procesos-con-ia` (el plan las listaba como `relatedGuides`). No se enlazan hasta que existan; `relatedGuides` usa dos guías reales (`calendario-de-contenido-con-ia`, `responder-consultas-de-clientes-con-ia`) y no hay `conclusion.nextGuide`.

## Activo original
Matriz de prioridad (impacto por urgencia, con las definiciones de impacto), plantilla de la hoja (Reglas, Tareas, Capacidad y Plan) con fórmulas en español e inglés, tabla de capacidad copiable y rúbrica interactiva de seis criterios (0–12; bloqueo si «Cada fila es una tarea tuya» o «No inventa fechas ni minutos» sacan 0).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `formulas` | Ayuda con fórmulas, sin compartir ninguna tarea (solo describe las columnas) | PROGRAMA, COLUMNAS_Y_CELDAS |
| `ordenar` | Principal: lista escrita → tabla con impacto justificado, fechas y minutos copiados, dependencias, responsable y repetición; no calcula prioridad | NEGOCIO, PERSONAS, CATEGORIAS, PENDIENTES |
| `ajuste` | Iteración: corrige solo lo señalado, citando el texto o las definiciones | PROBLEMAS_DETECTADOS, NO_TOCAR |
| `semana` | Adaptación: plan por persona y día con la tabla ya calculada; sin totales | TAREAS, DISPONIBILIDAD, SEMANA |

No hay prompt de evaluación: la evaluación es la rúbrica manual. Reunir la lista, calcular la prioridad en la hoja, sumar y decidir no llevan prompt a propósito.

## Verificación de cifras y consistencia (todo ficticio; verificado con código)
Lavandería Brisa, Ana, Luis, Marta, los 25 pendientes, sus fechas, minutos y la capacidad son **ficticios**. Todas las cifras se **verificaron** con código (script temporal en TypeScript, ya eliminado; 90 comprobaciones, todas correctas), recalculando de forma independiente y no leyendo solo las constantes de la guía:
- **Lista y tabla:** 25 líneas T01…T25 y 25 filas con las mismas columnas que el prompt; cada fecha y cada minuto de la tabla coincide con lo que dice su línea escrita (donde no hay, `[FALTA]`: T06, T07 y T19); solo hay categorías permitidas y responsables de la lista de personas; «Repite» aparece únicamente donde la línea lo dice (T08 y T09 semanal, T10 mensual); solo T25 depende de T24 en la primera tabla.
- **Ajuste:** cada «Antes» es exactamente la celda de la primera tabla; 2 cambios (T07 pasa de impacto Alto a Bajo; T05 depende de T04) y «las otras 23 filas» sin cambios.
- **Prioridad (recalculada):** urgencia por días hasta la fecha (referencia lunes 21 de septiembre de 2026; Alta ≤ 7, Media 8 a 30, Baja > 30 o sin fecha) y matriz impacto por urgencia. Resultado: Esta semana T01, T03, T12, T16, T18 (125 min); Rutina T08, T09 (35); Programar con fecha T04, T05, T06, T10, T15, T17, T21 (185); Si sobra T02, T19, T22 (70); Aplazar T07, T11, T13, T14, T20, T23, T24, T25 (300). Suman **715 minutos** en 25 tareas (tres sin minutos); la matriz de la plantilla es la misma que se usa para calcular.
- **Plan:** un planificador escrito aparte reproduce fila por fila las 13 filas del ejemplo (primer día en que cabe; orden Esta semana, Rutina, Programar con fecha, Si sobra; fecha límite y dependencias respetadas). 295 minutos en total: Ana 120 de 225, Luis 70 de 120, Marta 105 de 150; nadie supera su capacidad en ningún día (exceso 0); días al límite: Ana lunes y miércoles, Luis martes, Marta lunes. Quedan fuera T15 (60 min, Ana tiene 45 por día) y T22 (60 min, Marta tiene 30), y T06 y T19 sin minutos. Capacidad total: 495.
- **Pedido ingenuo (ilustrativo):** 715 minutos frente a 495; las cuatro tareas de Luis el martes suman 130 y tiene 60; T05 antes que T04.
- **Fórmulas:** las 8 fórmulas en inglés son las españolas con funciones y separadores traducidos; las comprobaciones con números de práctica (3 días, 9 días, 39 días o vacío; Alto y Alta; 15 + 10; 45 × 5; 15 + 20 + 10; exceso 15 y 0) y las cuentas del caso (F27 = 715, F28 = 3) dan lo escrito. **No se abrió la hoja en un programa real**: las fórmulas se evaluaron con equivalentes en código.
- **Rúbrica y prompts:** puntajes 2, 2, 1, 1, 2, 2 = **10 de 12** («Con ajustes», umbrales 0/7/11); análisis y rúbrica comparten criterios y orden; variables usadas = definidas; cada fragmento de «por qué funciona» existe en su prompt; las reglas que cita el análisis existen; cuatro de los siete pasos llevan prompt; los dos enlaces internos y `relatedGuides` apuntan a guías que existen.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de ordenar | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| T07 (cambiar el letrero) con impacto Alto por «mejora la imagen del local» | Regla 3: si el texto no dice qué se pierde, no subas el impacto | Es un juicio: la IA puede inferir una pérdida (la imagen) que la persona no escribió. **El autor debe decidir si es plausible**, porque la regla existe. |
| T05 (imprimir la lista de precios nueva) sin «Depende de: T04» | Regla 5: la dependencia solo si el texto la dice o la hace evidente | Una dependencia implícita puede no verse como evidente; encuentra la explícita (T25 de T24) y omite la inferida. |

No hay fechas, minutos ni tareas inventados en el primer resultado (el prompt lo prohíbe). Cada frase que atribuye una línea al prompt o a la rúbrica se comprobó contra el texto real.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a los datos del caso (ficticio); el plan se calculó con las reglas exactas del prompt de semana. No proceden de una conversación real ni de una prueba del autor. El pedido ingenuo es **ilustrativo**.

## Fuentes
La guía no cita fuentes externas ni datos que caduquen: los datos los aporta la persona y el caso es inventado.

## Imágenes
Carpeta: `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/` (aún no existe). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `lista-de-pendientes.webp` | Paso 1 (datos) | 4:3 |
| `hoja-con-prioridad.webp` | Paso 2 (hoja) | 16:9 |
| `primera-tabla.webp` | Primer resultado | 16:9 |
| `contraste-con-la-lista.webp` | Paso 4 (análisis) | 16:9 |
| `plan-de-la-semana.webp` | Paso 6 (plan) | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `formulas`, `ordenar`, `ajuste`, `semana`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (una lista propia de pendientes y la comprobación de un plan real con sus sumas) y `revisadoEn`. Una prueba real de una IA armando un plan que se pase de las horas de alguien, con fecha y herramienta, sería especialmente útil.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `formulas` | PROGRAMA y la descripción de hojas del caso | Tabla de fórmulas y «Cómo pegarla» | Ocho fórmulas; ES y EN; comprobación con números de práctica correcta; sin pedir tareas | Usa columnas que no describiste; comprobación mal hecha; fecha vacía que da un número |
| `ordenar` | Las 25 líneas, PERSONAS, CATEGORIAS y NEGOCIO del caso | Tabla y «FALTA» | 25 filas con sus ids; fechas y minutos solo los escritos; impacto que cita tu texto; sin prioridad | Inventa minutos; añade una tarea; calcula la prioridad; parte un pendiente |
| `ajuste` | Tabla anterior, PROBLEMAS_DETECTADOS (T07 y T05) y NO_TOCAR | «Cambios», «Sin cambios» y «FALTA» | Solo cambia T07 y T05; cada motivo cita texto o definición | Toca otras filas; inventa una dependencia |
| `semana` | Tabla con prioridad, DISPONIBILIDAD y SEMANA del caso | Tabla del plan, «No cabe» y «Falta un dato» | Nadie pasa de su disponibilidad (compruébalo con SUMAR.SI.CONJUNTO); sin tareas Aplazar; sin totales | Se pasa de los minutos; ignora una dependencia; planifica una tarea sin minutos |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si son plausibles los dos defectos del primer resultado (ver trazabilidad); el de T07 es el más discutible porque la regla 3 existe.
- Lavandería, personas, tareas, fechas, minutos y capacidad son un ejemplo ficticio.
- Abrir la hoja en un programa real (Google Sheets o Excel) y comprobar las 8 fórmulas: aquí solo se evaluaron con código.
- La caja «tiempo» (≈2 horas la primera vez, ≈20 minutos cada lunes) es una estimación de la guía; la interactividad (marcas de pasos, rúbrica, «Copiar como tabla», constructor de variables) no se probó en un navegador real más allá del HTML del build.
- Texto explicativo: ≈3.240 palabras contando las explicaciones de los prompts y ≈2.690 sin ellas (por debajo de 3.000 en el cómputo estricto).
- Enlaces de vuelta sugeridos desde `calendario-de-contenido-con-ia` y `responder-consultas-de-clientes-con-ia`; cuando existan `sistema-diario-de-trabajo-con-ia` y `documentar-procesos-con-ia`, enlazarlas aquí y añadirlas a `relatedGuides`. No se editaron otras guías.
