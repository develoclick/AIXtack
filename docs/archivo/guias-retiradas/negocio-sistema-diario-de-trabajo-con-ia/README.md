# Un sistema diario de trabajo con IA para tu negocio

**Ruta:** `/negocio/guias/sistema-diario-de-trabajo-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). Guía nueva, creada el 2026-09-19 (`publishedAt` y `updatedAt`). Tercera y última guía de la categoría `negocio`; es la **guía pilar** del plan.
**Tipo de guía:** estrategia y planificación + conceptual (`estrategia-planificacion`, `conceptual-educativa`). No es de números (`handlesNumbers` no se marca): las pocas cifras del caso (9 consultas, 20 camisetas, 10 días de cambios, horario de 10 a 19, seis días de tienda abierta) son datos del caso, no cálculos. Sin `usesExternalInfo`: no hay datos externos.
**Problema:** se usa la IA a ratos, cada conversación empieza de cero y las respuestas traen datos que no son del negocio (plazos, políticas, horarios inventados).
**Ángulo propio:** la memoria del sistema es de la persona. Una **ficha de contexto** (armada con una entrevista de la IA, con lo pendiente marcado) se pega al empezar; el día se abre con la **nota de traspaso** de ayer y se cierra con una nota nueva hecha con los apuntes; entre ambos, seis bloques con lo que se delega, lo que se verifica y lo que no se delega. Se instalan primero la apertura y el cierre. Enlaza (sin duplicar) las seis guías del plan: `organizar-tareas`, `responder-consultas`, `analizar-ventas`, `crear-publicaciones`, `crear-cotizaciones` y `documentar-procesos`. Diferencia frente a `organizar-tareas-del-negocio-con-ia`: allí, el método de priorización con una hoja; aquí, una apertura ligera (como máximo tres prioridades) que parte de la nota de ayer.

## Activo original
Ficha de contexto (plantilla de nueve campos), nota de traspaso, mapa de seis bloques con «qué verificas» y «lo que no delegas», semana tipo y revisión del viernes (todas copiables donde son tablas), y rúbrica interactiva de seis criterios (0–12; bloqueo si «Todo sale de tu nota, tu agenda o tu ficha» o «No inventa tiempos ni urgencias» sacan 0).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `ficha` | Entrevista: una pregunta cada vez; devuelve la ficha (9 campos, «Confirmado» o «Pendiente») | NEGOCIO, PARA_QUE |
| `apertura` | Principal: como máximo tres prioridades, lo que puede esperar y preguntas abiertas, solo con ficha, nota y agenda | FICHA, NOTA_DE_AYER, AGENDA_DE_HOY |
| `ajuste` | Iteración: corrige solo lo señalado, citando la nota | PROBLEMAS_DETECTADOS, NO_TOCAR |
| `cierre` | Adaptación (fin del día): ordena los apuntes en una nota de traspaso, sin agregar nada | DIA, APUNTES_DEL_DIA |

No hay prompt de evaluación (la rúbrica es manual). Los bloques del medio, la revisión del viernes y guardar las notas no llevan prompt aquí: cada bloque tiene su guía. Método: siete pasos, IA en cuatro (2, 3, 4 y 5); los pasos 6 y 7 los hace la persona.

## Verificación de consistencia (todo ficticio; verificado con código)
Moda Norte, Camila, Iván, los apuntes, la ficha, la nota, la agenda y la semana son **ficticios**. No hay cálculos, pero se **verificó** con código (script temporal en TypeScript, ya eliminado; 74 comprobaciones, todas correctas) que:
- **Ficha:** los 9 campos son los mismos, en el mismo orden, en la plantilla, en el prompt y en la ficha del caso; solo «Lo que no he decidido» está «Pendiente» y es la duda de los apuntes (cambio sin ticket); cambios en 10 días, sin devolución de dinero, envío pagado por la clienta, horario de 10 a 19.
- **Pedido ingenuo (ilustrativo):** las cuatro frases contradicen la ficha (30 frente a 10 días, devolución de dinero, envío gratis, hasta las 21 frente a las 19).
- **Apuntes → nota:** 8 apuntes numerados y 8 filas (3 hechos, 3 pendientes, 1 decisión, 1 pregunta abierta); «9 consultas» y «dos preguntaron por cambios» son iguales en apuntes y nota; el pendiente sin motivo en los apuntes (revisar la hoja de ventas) sale como `[FALTA: motivo]`; la nota no lleva nombres ni teléfonos.
- **Apertura:** las columnas de las dos tablas son las del prompt; 3 prioridades con su origen; la prioridad 2 sale de la agenda («A las 16 llega una proveedora»); cada pendiente de la nota aparece una sola vez, antes y después del ajuste; la duda abierta aparece en «Preguntas para ti»; ninguna prioridad contradice la decisión de no hacer liquidación.
- **Ajuste:** 4 cambios (3 señalados y 1 consecuencia del primero); cada «Antes» es exactamente la celda de la primera apertura y cada «Después» sale de la nota (Iván y la tela, la hoja de ventas, el jueves).
- **Bloques y semana:** 6 bloques × 5 columnas; en la semana de seis días, apertura, «Durante el día» y cierre aparecen los 6 días; ventas 1 vez, marketing 2, administración 1 y revisión el viernes, tal como dice la columna «Cuándo»; los 6 enlaces del MDX son exactamente `relatedGuides` y existen.
- **Rúbrica y prompts:** puntajes 2, 1, 1, 2, 1, 2 = **9 de 12** («Con ajustes», umbrales 0/7/11); análisis y rúbrica comparten criterios y orden; el análisis cita las celdas reales; variables usadas = definidas; cada fragmento de «por qué funciona» existe en su prompt; las reglas que cita el análisis existen; encadenado: la ficha se pega en FICHA y la nota de cierre en NOTA_DE_AYER; el ejemplo de la entrevista tiene 3 turnos.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de apertura | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| Prioridad 1: «Responder a la clienta de las 20 camisetas», cuando la nota dice que espera a Iván | Regla 3: si un pendiente espera algo, tenlo en cuenta al elegir | «Tenlo en cuenta» es un juicio: usa la nota a medias. **El autor debe decidir si es plausible**, porque la regla existe. |
| Prioridad 3: «Avanzar con lo de ventas» en lugar de «Revisar la hoja de ventas» | Regla 2: una acción concreta con verbo | Alternativa débil: cumple la forma (hay un verbo) y no el fondo. Ídem. |
| Motivo del pantalón: «Puede esperar a otro día» en lugar de «La costurera lo recibe el jueves» | Regla 5: el motivo que dice mi nota | Sustituye el motivo por una frase genérica que suena razonable. Ídem. |

Los tres rozan reglas que sí existen; están redactados como fallos de juicio, no de formato. No hay tareas, plazos ni tiempos inventados en la primera apertura (el prompt lo prohíbe). Cada frase que atribuye una línea al prompt o a la rúbrica se comprobó contra el texto real.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a los datos del caso (ficticio). No proceden de una conversación real ni de una prueba del autor. El pedido ingenuo es **ilustrativo**. La revisión del viernes es una plantilla sin resultados de ninguna semana.

## Fuentes
La guía no cita fuentes externas ni datos que caduquen: el contenido lo aporta la persona y el caso es inventado.

## Imágenes
Carpeta: `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/` (aún no existe). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales, contraseñas ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `ficha-de-contexto.webp` | Paso 2 (ficha) | 4:3 |
| `apertura-primera-version.webp` | Primer resultado | 16:9 |
| `contraste-con-la-nota.webp` | Paso 4 (análisis) | 16:9 |
| `nota-de-traspaso.webp` | Paso 5 (cierre) | 16:9 |
| `un-dia-de-la-tienda.webp` | Paso 6 (bloques) | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `ficha`, `apertura`, `ajuste`, `cierre`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (una semana real con el sistema: la ficha, las notas de cada día y qué se ajustó el viernes) y `revisadoEn`. Una prueba real de una IA sin ficha contestando a un cliente con condiciones inventadas, con fecha y herramienta, sería especialmente útil.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `ficha` | NEGOCIO y PARA_QUE del caso; contesta como Camila | Varios turnos y la tabla final | Una pregunta cada vez; 9 campos en orden; «Pendiente» donde no decidiste; termina indicando guardar la tabla como FICHA | Propone una política «habitual»; pide precios completos o contraseñas |
| `apertura` | La ficha, la nota del lunes y la agenda del martes | Las dos tablas, «Preguntas para ti» y «FALTA» | Como máximo 3 prioridades con verbo; la que espera algo lleva primero lo que la desbloquea; cada pendiente una vez | Contesta a la clienta antes de preguntar a Iván; agrega tiempos; deja fuera la duda abierta |
| `ajuste` | Plan anterior, PROBLEMAS_DETECTADOS y NO_TOCAR | «Cambios», «Sin cambios» y «FALTA» | Solo cambia lo señalado y lo que obliga; cada motivo cita la nota | Toca la prioridad 2; inventa un motivo |
| `cierre` | Los 8 apuntes del lunes y DIA | La tabla «Tipo / Qué / Detalle» y «FALTA» | 8 filas; cifras copiadas; pendiente sin motivo = `[FALTA: motivo]`; sin datos de clientes | Agrega un motivo; suma o estima; recomienda qué hacer mañana |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si son plausibles los tres defectos del primer resultado (ver trazabilidad): los tres rozan reglas que existen.
- Moda Norte, Camila, Iván, las políticas de la tienda (cambios en 10 días, sin devolución) y los apuntes son un ejemplo ficticio; no reflejan ninguna normativa de consumo, que varía por país.
- Las afirmaciones «la apertura y el cierre llevan pocos minutos», «diez minutos al día» y «dos horas para la ficha y la primera semana» son estimaciones de la guía, no mediciones.
- El orden de los pasos (cierre antes que los bloques) sigue el orden canónico de secciones; está explicado en el texto («primero los dos extremos del día»).
- La interactividad (marcas de pasos, rúbrica, «Copiar como tabla», constructor de variables) no se probó en un navegador real más allá del HTML del build.
- Texto explicativo: ≈3.540 palabras contando las explicaciones de los prompts y ≈3.010 sin ellas.
- Enlaces de vuelta sugeridos desde las seis guías enlazadas (cada una puede apuntar a esta como «el sistema completo») y desde `documentar-procesos-con-ia` y `organizar-tareas-del-negocio-con-ia`, que la nombraban como relacionada del plan. No se editaron.
