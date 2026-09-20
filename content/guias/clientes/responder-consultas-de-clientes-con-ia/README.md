# Responder consultas de clientes con IA sin prometer de más

**Ruta:** `/clientes/guias/responder-consultas-de-clientes-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick` (antes `develoclick`). **Estándar:** `estandarGuia: 3` (prompt de guías v3). Regenerada el 2026-09-19; se conservan `slug` y `publishedAt` (2026-09-19).
**Tipo de guía:** comunicación y atención al cliente (`comunicacion-atencion`). No es de números: no hay cálculos.
**Problema:** el negocio recibe las mismas consultas por mensajería, redes o correo y responderlas le quita tiempo; una IA sin contexto inventa precios, plazos y políticas.
**Ángulo propio:** una *base de respuestas* (con lo que cambia cada día separado y la indicación de cuándo responde una persona) como única fuente de la IA, un borrador que declara qué usó y qué le faltó, una rúbrica con dos reglas de bloqueo y la adaptación del mismo mensaje a otro canal. Une la respuesta por mensajería y por correo, como pedía el plan. No cubre reclamos ni chatbots.

## Cambios de esta regeneración (v3)
- **Se quitaron:** `hero.tools` (duplicaba `quickFacts.needs`), la `checklist` y la «Aplicación» que repetían el método, «Cómo funciona», el bloque «antes y después», los tres ejemplos por rubro (sus casos pasan a filas de la tabla de tipos de consulta), la tabla de canales y `responder-reclamos-con-ia` y `analizar-opiniones-de-clientes-con-ia` de las guías relacionadas (no existen).
- **Se añadieron:** prompt de entrevista para escribir la base, prompt de revisión con rúbrica de cinco criterios y dos bloqueos, prompt de ajuste, prompt de canal, base copiable, mapa de decisión copiable (`tipos`), pasos marcables, 7 partes y un espacio de prueba por prompt. La guía relacionada de la versión anterior que existe (`crear-descripciones-de-productos-con-ia`) se conserva; se añaden `crear-cotizaciones-y-propuestas-con-ia` y `crear-publicaciones-para-redes-sociales-con-ia`.
- **Corrección del primer resultado:** la versión anterior mostraba un precio de $120 inventado, un diagnóstico («seguramente sea el retén») y «FALTA: nada», defectos que las reglas del propio prompt prohíben y que por tanto no eran plausibles. Ahora el primer resultado cumple esas reglas y falla donde un prompt no puede impedirlo del todo (ver trazabilidad).
- **Imágenes:** no había archivos en la carpeta. Se conservan `hero.webp` y `base-de-respuestas.webp`; `antes-despues.webp` se retira junto con esa sección, y se añaden `borrador-inicial`, `revision-de-promesas`, `borrador-corregido` y `version-por-correo`.

## Activo original
Base de respuestas copiable, mapa de decisión copiable («Qué puede hacer la IA con cada tipo de consulta») y rúbrica interactiva de cinco criterios (0–10; bloqueo si «Cada dato sale de tu base» o «No diagnostica ni promete» sacan 0).

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `base` | Entrevista: completa la base y marca lo pendiente | NEGOCIO, CONSULTAS |
| `borrador` | Principal: borrador con USADO, FALTA y ESCALAR | NEGOCIO, CANAL, TONO, BASE_DE_RESPUESTAS, DATOS_DEL_DIA, CONSULTA_DEL_CLIENTE |
| `revision` | Evaluación: frases con problema y rúbrica | BORRADOR, CONSULTA_DEL_CLIENTE |
| `ajuste` | Iteración: corrige solo lo señalado | PROBLEMAS, NO_TOCAR |
| `canal` | Adaptación: el mismo mensaje en otro canal | CANAL_NUEVO, REGLAS_DEL_CANAL |

## Verificación de consistencia (todo ficticio; verificado con código)
33 comprobaciones en Node, todas correctas. No hay cálculos; se comprueba que los textos coinciden entre sí.
- **Primer borrador contra la base:** usa el precio «desde $35», «unas 2 horas» y los turnos 15:00 y 16:30, que están en la base y en los datos de hoy. La base dice «30 días en mano de obra»; el borrador dice «en todo el trabajo».
- **Corrección:** el borrador final es exactamente el primero con dos sustituciones (garantía y pregunta) y la frase añadida sobre la pérdida de aceite. Cada «antes» de la tabla de cambios aparece una sola vez en el primer borrador.
- **Correo:** el precio, la duración, los turnos, la garantía y la frase de la pérdida de aceite son idénticos, letra por letra, en el borrador final y en el correo; las mismas cifras y horas en ambos.
- **Rúbrica:** puntajes 1, 2, 1, 1, 2 = **7 de 10** («Con ajustes», 6–8); tras el ajuste, 10 de 10. El prompt de revisión lista los mismos cinco criterios, los mismos umbrales (0/6/9) y la misma regla de bloqueo que la rúbrica.
- **Restos de la versión anterior:** no queda ningún «$120», «retén», «cigüeñal» ni «seguramente» en la guía.
- **Precios:** los importes en «$» son ficticios y no suponen un país.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de borrador | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| «Tiene 30 días de garantía en todo el trabajo» (la base dice «en mano de obra») | Regla 1: usar solo la base y no prometer nada que no esté escrito | La cifra es correcta y solo se amplía su alcance; es una cifra correcta con otro alcance. El autor debe decidir si lo considera plausible, porque la regla pide no prometer más de lo escrito. |
| Pregunta solo por el modelo, no por marca y año | Regla 2: si la base depende de un dato del cliente, pedírselo y anotarlo en «FALTA» | El contexto se usa a medias: pide un dato de tres. |
| No atiende la pérdida de aceite que el cliente mencionó | Regla 3: no diagnosticar; regla 5: un único siguiente paso | Ninguna regla obliga a responder todo lo que el cliente preguntó; el prompt evita el diagnóstico, no la omisión. La revisión lo detecta con «Preguntas sin atender». |
Cada frase de análisis o de explicación que atribuye una línea al prompt se comprobó contra el texto real del prompt.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a la base del Taller Los Pinos (ficticio: negocio, precios, horarios, políticas y conversación inventados). No proceden de una conversación real ni de una prueba del autor. La respuesta del prompt de revisión no se reproduce entera: se muestra como análisis por criterio.

## Imágenes
Carpeta: `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/` (no existe ningún archivo). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `base-de-respuestas.webp` | Paso 2 (base) | 16:9 |
| `borrador-inicial.webp` | Primer resultado | 16:9 |
| `revision-de-promesas.webp` | Análisis | 16:9 |
| `borrador-corregido.webp` | Resultado final | 16:9 |
| `version-por-correo.webp` | Paso 6 (canal) | 16:9 |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 |

Las cinco `prueba-prompt-0N.webp` (`promptId`: `base`, `borrador`, `revision`, `ajuste`, `canal`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (una base propia y qué consultas dejaron de necesitar corrección) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `base` | NEGOCIO y CONSULTAS del caso; responder «todavía no lo decidí» a la garantía | Preguntas, tabla y «Pendiente» | Una pregunta por turno; una fila por consulta; lo no decidido «Pendiente» | Propone políticas o plazos; no pregunta cuándo responde una persona |
| `borrador` | La base del caso, los datos de hoy y la consulta con la pérdida de aceite | Las cuatro partes | Solo datos de la base; pide marca, modelo y año; no diagnostica; ESCALAR «no» | Amplía el alcance de la garantía; ignora la pérdida de aceite; diagnostica |
| `revision` | El borrador y la consulta | Tablas y rúbrica | Marca «Alcance distinto»; lista la pregunta sin atender y los datos no pedidos | Da por respaldada la garantía; reescribe |
| `ajuste` | PROBLEMAS con las tres correcciones; NO_TOCAR «la base y las frases correctas» | Cambios y «Sin cambios» | Solo cambia lo señalado | Cambia el precio o los turnos; añade promesas |
| `canal` | Correo y las reglas del canal con tu firma | Tabla y «Contra el borrador final» | Mismas cifras y horas; asunto y firma | Cambia un dato; inventa una firma |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cinco prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si «la garantía ampliada a todo el trabajo» es un defecto plausible del primer resultado (ver trazabilidad).
- Las reglas sobre datos personales, comunicaciones comerciales y respuestas automáticas varían por país y plataforma: la guía manda a consultarlas y no las cubre.
- La caja «tiempo» (≈2 horas para escribir la base) es una estimación de la guía.
- Enlaces de vuelta sugeridos desde `crear-descripciones-de-productos-con-ia`, `crear-cotizaciones-y-propuestas-con-ia` y `crear-publicaciones-para-redes-sociales-con-ia` (no editadas).
