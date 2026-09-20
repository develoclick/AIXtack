# Definir precios y márgenes con apoyo de la IA

**Ruta:** `/ventas/guias/definir-precios-y-margenes-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3).
**Tipo de guía:** números y datos + decisión (`numeros-datos`, `decision-comparacion`); `handlesNumbers: true`.
**Problema:** no se sabe cuánto cuesta de verdad un producto ni cuánto cobrar; se cuentan solo los ingredientes, se confunde margen con recargo y no se sabe qué pasa si sube un costo. Una IA a la que se le pide «un precio con 40 % de margen» puede sumar el 40 % al costo y responder con seguridad.
**Ángulo propio:** construir el costo completo (materiales, empaque, tu tiempo y gastos fijos), distinguir margen (sobre el precio) de recargo (sobre el costo), separar precio mínimo, objetivo y elegido, y probar escenarios. Separa cálculo (hoja), interpretación (IA, sin veredictos) y decisión (persona). **No se solapa con `crear-promociones-con-ia`:** aquella parte de precios y costos ya conocidos para comparar ofertas; esta construye el costo y el precio. Por eso el caso no es la cafetería que sugería el plan, que ya usa esa guía: es una galletería.

## Activo original
Calculadora de costo y precio copiable (fórmulas ES/EN), tabla de escenarios copiable y rúbrica interactiva de cinco criterios (0–10; bloqueo si «Las cifras son las de la hoja» o «No decide ni promete» sacan 0).

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `formulas` | Ayuda con las fórmulas sin compartir datos | PROGRAMA, COLUMNAS_Y_CELDAS |
| `costos` | Entrevista: ordena los 6 costos, con origen y estado | PRODUCTO, LO_QUE_TENGO |
| `lectura` | Principal: qué dice, qué supone y qué no dice la hoja, con preguntas | NEGOCIO, PRODUCTO, DECISION, HOJA |
| `ajuste` | Iteración: corrige solo las frases señaladas | PROBLEMAS, NO_TOCAR |
| `escenarios` | Adaptación: qué celdas cambiar para cada «qué pasa si» | CAMBIOS, CELDAS_DE_DATOS |

No hay un prompt de evaluación: la lectura se contrasta a mano con la hoja y la rúbrica interactiva, y el análisis muestra cómo. Los «preguntas para aclarar» viven dentro de la lectura.

## Verificación de cifras y fórmulas (todo ficticio; verificado con código)
38 comprobaciones en Node, todas correctas. Las cifras se calculan en `data.ts` a partir de los datos y se recalcularon aparte, con números escritos a mano. Los decimales se escriben con coma.
- **Caso:** ingredientes 48 ÷ 4 cajas = **12**; caja y etiqueta **3**; mano de obra 60 min × 20 por hora ÷ 4 = **5**; gastos fijos 600 ÷ 150 = **4**; costo total **24**. Precio objetivo con 40 % de margen = 24 × 100 ÷ 60 = **40**; ganancia **16**.
- **Margen y recargo:** con el mismo precio, la ganancia de 16 es **40 %** del precio y **66,7 %** del costo.
- **Pedido ingenuo (ilustrativo):** si la IA suma el 40 % al costo, escribe precio 33,6, ganancia 9,6 y margen real 28,6 % frente a 40, 16 y 40 %: **6,4 de menos por caja**. El error está escrito a propósito.
- **Escenarios (con el precio de 40 sin tocar):** ingredientes +25 % → costo 27, margen 32,5 %, precio para mantener el 40 % = 45; 100 cajas al mes → costo 26, margen 35 %, precio 43,3; los dos a la vez → costo 29, margen 27,5 %, precio 48,3.
- **Fórmulas evaluadas tal como se pegan:** la calculadora (filas 2 a 19) se evaluó celda por celda con un evaluador propio, en español (`REDONDEAR`) y en inglés (`ROUND`), y da las cifras de arriba. Las nueve fórmulas de la tabla dan sus números de práctica (4, 10, 5, 3, 20, 40, 20, 100 y 25). No se ejecutaron en Excel ni en Google Sheets: el autor debe pegar la calculadora en su programa y comprobar 24, 40 y 66,7.
- **Lectura de ejemplo:** cada cifra de la primera lectura es la de la hoja; con la corrección, la frase queda «de cada 40 que cobras, 16 quedan después de costos».
- **Rúbrica:** puntajes 2, 1, 1, 2, 2 = **8 de 10** («Con ajustes»); tras el ajuste, 10 de 10.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de lectura | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| «Margen: 40 %, es decir, ganas 40 por cada 100 que te cuesta la caja» (la base descrita es el costo) | Regla 1: copiar cada cifra con su base; regla 2: cada porcentaje dice su base (margen sobre el precio, recargo sobre el costo) | La cifra 40 % es correcta y solo cambia la base al explicarla en palabras. Es una cifra correcta con otro alcance. El autor debe decidir si lo considera plausible, porque el prompt pide expresamente la base correcta. |
| «Con el precio de 40, el margen queda con espacio para cubrir imprevistos» | Regla 3: no afirmar que un precio o un margen sea rentable, suficiente, bueno ni seguro | Una frase tranquilizadora con lenguaje corriente cae en la zona gris entre explicación y veredicto. |
Cada frase de análisis o de explicación que atribuye una línea al prompt se comprobó contra el texto real del prompt.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a la hoja de la galletería (ficticio: negocio, costos, volúmenes, valor de la hora y precio elegido inventados). No proceden de una conversación real ni de una prueba del autor. Las respuestas de los prompts de fórmulas y de costos no se reproducen enteras: se muestran la tabla de fórmulas y la conversación. El «precio elegido» de 40 es una decisión ficticia de la dueña, no una recomendación.

## Imágenes
Carpeta: `public/images/guias/ventas/definir-precios-y-margenes-con-ia/` (no existe ningún archivo). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `datos-necesarios.webp` | Datos | 4:3 |
| `calculadora-de-precio.webp` | Paso 2 (hoja) | 4:3 |
| `lectura-inicial.webp` | Primer resultado | 16:9 |
| `contraste-con-la-hoja.webp` | Análisis | 16:9 |
| `tabla-de-escenarios.webp` | Paso 6 (escenarios) | 4:3 |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 |

Las cinco `prueba-prompt-0N.webp` (`promptId`: `formulas`, `costos`, `lectura`, `ajuste`, `escenarios`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (la hoja de un producto propio y qué supuesto resultó más sensible) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `formulas` | PROGRAMA y las columnas del caso, sin cifras | Tabla y «Cómo pegarla» | Fórmulas en español e inglés; comprobación correcta; precio sobre el precio y no sumando el margen | Suma el margen al costo; separador equivocado |
| `costos` | PRODUCTO del caso; responder «no sé» a las ventas del mes y una estimación a tu tiempo | Preguntas, tabla y «Pendiente» | Una pregunta por turno; 6 costos; estimaciones como «Supuesto» | Sugiere cantidades habituales; no pregunta por tu tiempo |
| `lectura` | La hoja del caso, DECISION «qué precio cobrar» | Las cinco secciones | Cifras idénticas; cada porcentaje con su base; sin veredicto ni precio recomendado | Explica el margen sobre el costo; dice que el margen alcanza; compara con otros negocios |
| `ajuste` | PROBLEMAS con las dos frases; NO_TOCAR «la hoja y las cifras» | Cambios, «Sin cambios» y «FALTA» | Solo cambia lo señalado; sin cifras nuevas | Cambia cifras; sustituye un veredicto por otro |
| `escenarios` | CAMBIOS del caso y CELDAS_DE_DATOS | Tabla y «Cómo probarlo» | Celdas y valores nuevos correctos; sin costos ni márgenes calculados | Calcula el resultado; inventa escenarios «típicos» |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Pegar la calculadora en Excel o Google Sheets y comprobar costo 24, precio 40 y recargo 66,7 %.
- Probar los cinco prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si «la base descrita mal» es un defecto plausible del primer resultado (ver trazabilidad).
- El margen, el valor de la hora y el volumen del caso son ficticios; el margen deseado de 40 % no es una recomendación.
- Impuestos y normas de precios varían por país: la guía manda a confirmarlos con un profesional.
- La caja «tiempo» (≈2 horas la primera vez) es una estimación de la guía.
- Enlaces de vuelta sugeridos desde `crear-promociones-con-ia`, `crear-cotizaciones-y-propuestas-con-ia` y `analizar-ventas-con-ia` (no editadas).
