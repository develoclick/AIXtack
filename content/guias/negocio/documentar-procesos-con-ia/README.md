# Documentar procesos de tu negocio con IA

**Ruta:** `/negocio/guias/documentar-procesos-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). Guía nueva, creada el 2026-09-19 (`publishedAt` y `updatedAt`). Segunda guía de la categoría `negocio`.
**Tipo de guía:** automatización o flujo + comunicación y atención (`automatizacion-flujo`, `comunicacion-atencion`). No es de números (`handlesNumbers` no se marca): las pocas cifras del caso (12 pasos, 5 casos distintos, «24 horas», «más de tres piezas», martes y jueves) son datos del caso, no cálculos. Sin `usesExternalInfo`: no hay datos externos.
**Problema:** hay tareas que solo sabe hacer una persona y no están escritas; pedirle a una IA «el procedimiento» devuelve pasos genéricos con herramientas que no se usan, y nadie prueba que sirva.
**Ángulo propio:** la IA **entrevista** a la persona (una pregunta cada vez, sin proponer pasos) a partir de unas notas de un recorrido real; solo después redacta el procedimiento con lo dicho; se contrasta con las respuestas; se convierte en una versión corta con casillas; y **se prueba con otra persona** con un registro. Diferencia frente a `organizar-tareas-del-negocio-con-ia` (qué hacer primero) y `responder-consultas-de-clientes-con-ia` (base de respuestas): aquí se documenta *cómo* se hace una tarea repetitiva.
**Relacionada del plan que aún no existe:** `sistema-diario-de-trabajo-con-ia`. No se enlaza hasta que exista; `relatedGuides` usa dos guías reales y no hay `conclusion.nextGuide`.

## Activo original
Ficha del proceso, entrevista guiada, procedimiento en formato fijo (cinco columnas), versión para quien empieza (casillas) y registro de la prueba con otra persona (todas copiables donde son tablas), y rúbrica interactiva de seis criterios (0–12; bloqueo si «Todo sale de tus respuestas» o «Lo que no sabes queda marcado» sacan 0).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `entrevista` | Entrevista: una pregunta cada vez a partir de tus notas; devuelve un resumen con «Confirmado» y «Pendiente» | NEGOCIO, PROCESO, MIS_NOTAS |
| `procedimiento` | Principal: ordena solo lo dicho en pasos con dónde, señal y excepción | NEGOCIO, PROCESO, RESPUESTAS |
| `ajuste` | Iteración: corrige solo lo señalado (tras el contraste o tras la prueba) | PROBLEMAS_DETECTADOS, NO_TOCAR |
| `checklist` | Adaptación: hoja corta con casillas para quien empieza, sin cambiar pasos | PROCEDIMIENTO, PARA_QUIEN |

No hay prompt de evaluación (la rúbrica es manual). Hacer el recorrido, la prueba con otra persona y guardar la versión no llevan prompt a propósito.

## Verificación de consistencia (todo ficticio; verificado con código)
Cerámica Sol, Lucía, Mateo, las notas, las respuestas, las herramientas y los 12 pasos son **ficticios**. No hay cálculos, pero se **verificó** con código (script temporal en TypeScript, ya eliminado; 68 comprobaciones, todas correctas) que:
- **Entrevista → procedimiento:** el resumen de la entrevista tiene 7 bloques (uno «Pendiente») y sus columnas son las del prompt; «Cómo lo hago» lista 12 pasos numerados; cada «Dónde» y cada «Cómo sé que salió bien» del procedimiento está dicho en la respuesta de su paso (comprobado paso a paso); cada paso empieza con un verbo y no junta dos acciones; «Antes de empezar» y «Cuándo está terminado» son lo dicho; lo «Pendiente» pasa a «FALTA».
- **Excepciones:** 5 casos en los pasos 2, 3, 4, 7 y 10 («24 horas», avisar antes de seguir, no enviar hasta tener el dato, más de tres piezas, martes y jueves), todos dichos en la entrevista, que cuenta cinco.
- **Notas:** 7 líneas frente a 12 pasos (lo que enseña la sección de datos).
- **Primer resultado y ajuste:** 12 filas × 5 columnas, iguales a las del prompt; los tres defectos (pasos 4, 7 y 10) son las únicas celdas que difieren del procedimiento corregido; cada «Antes» es exactamente la celda de la primera tabla y cada «Después» es exactamente la celda del procedimiento corregido; «Sin cambios»: los otros 9 pasos.
- **Versión para quien empieza:** 12 pasos, mismo orden y numeración, misma señal que el procedimiento corregido; «(ver «Si algo sale distinto»)» exactamente en los pasos 2, 3, 4, 7 y 10; la nota copia sin cambios las cinco excepciones.
- **Registro de la prueba:** 12 filas sin rellenar; la guía dice que la prueba del caso no se hizo y no hay resultados inventados. El texto habla de ocho reglas y hay ocho.
- **Rúbrica y prompts:** puntajes 2, 2, 1, 1, 1, 2 = **9 de 12** («Con ajustes», umbrales 0/7/11); análisis y rúbrica comparten criterios y orden; el análisis cita las celdas reales de la primera tabla; variables usadas = definidas; cada fragmento de «por qué funciona» existe en su prompt; las reglas que cita el análisis existen; cuatro de los siete pasos llevan prompt; los dos enlaces internos y `relatedGuides` apuntan a guías que existen; el ejemplo de la entrevista tiene 3 turnos.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de procedimiento | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| Paso 4: «Si falta un dato, escribir al cliente» (omite «y no enviar hasta tenerlo») | Regla 5: en «Si algo sale distinto», lo que dije que hago en ese caso | Contexto usado a medias: recoge la mitad de la respuesta. **El autor debe decidir si es plausible**, porque la regla existe. |
| Paso 7: «La caja está bien empacada» en lugar de «Ninguna pieza se mueve al agitar la caja» | Regla 4: una señal que yo di, con mis palabras | Alternativa débil: parafrasea con una señal que no se puede comprobar. Ídem: revisar si es plausible. |
| Paso 10: «—» en lugar del día en que pasa el mensajero | Regla 5 | Omisión de un dato que sí estaba en la entrevista; quien empieza no puede adivinarlo. |

No hay pasos, herramientas ni plazos inventados en el primer resultado (el prompt lo prohíbe). Cada frase que atribuye una línea al prompt o a la rúbrica se comprobó contra el texto real.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a los datos del caso (ficticio). No proceden de una conversación real ni de una prueba del autor. El pedido ingenuo (frases inventadas) es **ilustrativo**.

## Fuentes
La guía no cita fuentes externas ni datos que caduquen: el contenido lo aporta la persona y el caso es inventado.

## Imágenes
Carpeta: `public/images/guias/negocio/documentar-procesos-con-ia/` (aún no existe). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales, contraseñas ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `notas-del-recorrido.webp` | Paso 1 (datos) | 4:3 |
| `primer-procedimiento.webp` | Primer resultado | 16:9 |
| `contraste-con-tus-respuestas.webp` | Paso 4 (análisis) | 16:9 |
| `version-para-quien-empieza.webp` | Paso 5 (versión corta) | 16:9 |
| `registro-de-la-prueba.webp` | Paso 6 (prueba) | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `entrevista`, `procedimiento`, `ajuste`, `checklist`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (un proceso propio documentado y la prueba real con otra persona: dónde se trabó y qué cambió) y `revisadoEn`. Una prueba real de una IA redactando el procedimiento *sin* entrevista, con los pasos inventados que devuelva, sería especialmente útil.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `entrevista` | NEGOCIO, PROCESO y las 7 notas del caso; contesta con las respuestas de Lucía | Varios turnos y la tabla final con «Estado» | Una pregunta cada vez; pregunta entre las líneas de tus notas; no propone pasos; termina indicando pegar la tabla en RESPUESTAS | Hace varias preguntas juntas; propone un paso «habitual»; pide contraseñas |
| `procedimiento` | NEGOCIO, PROCESO y la tabla de la entrevista | «Antes de empezar», la tabla, «Cuándo está terminado» y «FALTA» | 12 pasos con un verbo; dónde y señal dichos por ti; «FALTA» para lo pendiente | Agrega un paso o herramienta; junta dos acciones; resuelve el «Pendiente» |
| `ajuste` | Tabla anterior, PROBLEMAS_DETECTADOS (pasos 4, 7 y 10) y NO_TOCAR | «Cambios», «Sin cambios» y «FALTA» | Solo cambia esos tres pasos, citando lo que dijiste | Toca otros pasos; inventa un plazo |
| `checklist` | La tabla corregida y PARA_QUIEN | Las cuatro secciones y la tabla con casillas | Mismos 12 pasos y orden; excepciones copiadas | Resume una excepción; agrega consejos; cambia el orden |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si son plausibles los tres defectos del primer resultado (ver trazabilidad): los tres rozan reglas que existen.
- Cerámica Sol, Lucía, Mateo, las notas, las respuestas y los plazos del caso son un ejemplo ficticio; el resumen de la entrevista incluye dónde y cómo se sabe que salió bien cada paso, porque el prompt de procedimiento solo puede usar lo dicho.
- La prueba con otra persona es la parte central y no se hizo: convendría que el autor la documente con un proceso propio.
- Las ocho reglas de la prueba son recomendaciones de la guía, no un método publicado por terceros.
- La caja «tiempo» (≈2 horas más la prueba) es una estimación de la guía; la interactividad (marcas de pasos, rúbrica, «Copiar como tabla», constructor de variables) no se probó en un navegador real más allá del HTML del build.
- Texto explicativo: ≈3.480 palabras contando las explicaciones de los prompts y ≈2.920 sin ellas (por debajo de 3.000 en el cómputo estricto).
- Enlaces de vuelta sugeridos desde `organizar-tareas-del-negocio-con-ia` (elegir qué documentar primero) y `responder-consultas-de-clientes-con-ia`; cuando exista `sistema-diario-de-trabajo-con-ia`, enlazarla aquí. No se editaron otras guías.
