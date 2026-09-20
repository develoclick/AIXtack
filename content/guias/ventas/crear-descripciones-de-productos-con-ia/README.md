# Crear descripciones de productos con IA sin inventar datos

**Ruta:** `/ventas/guias/crear-descripciones-de-productos-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick` (antes `develoclick`). **Estándar:** `estandarGuia: 3` (prompt de guías v3). Regenerada el 2026-09-19; se conservan `slug` y `publishedAt` (2026-09-18).
**Tipo de guía:** comunicación y atención + tema sensible (`comunicacion-atencion`, `tema-sensible`). No es de números: los únicos conteos son de palabras y de caracteres, y se calculan en `data.ts`.
**Problema:** el negocio tiene los datos básicos de sus productos y necesita descripciones que ayuden a vender sin que la IA invente características.
**Ángulo propio:** la *ficha de producto* (cada dato con su estado y su origen) como única fuente de la IA, la distinción hecho / adjetivo / promesa y una *auditoría frase por frase* que también detecta el dato correcto con otro alcance. No enseña a redactar anuncios (`crear-anuncios-con-ia`) ni a diseñar ofertas (`crear-promociones-con-ia`).

## Cambios de esta regeneración (v3)
- **Se quitaron:** `hero.tools` (duplicaba `quickFacts.needs`), la `checklist` y la sección «Aplicación» que repetían el método, «Cómo funciona» (la explicación va dentro de cada `PromptCard`), el bloque «antes y después», los tres ejemplos por rubro (sus datos críticos pasan a una fila de la tabla de afirmaciones), la tabla de canales, la fuente «contenido útil» (ya no se cita) y `crear-cotizaciones-y-propuestas-con-ia` de las guías relacionadas (no existe).
- **Se añadieron:** prompt de entrevista para construir la ficha, prompt de adaptación a otro canal, rúbrica de cinco criterios con dos reglas de bloqueo, tabla de respaldo por tipo de afirmación (copiable), ficha copiable con columna «De dónde sale», pasos marcables, 7 partes, `PromptCard` con espacio de prueba por prompt y advertencia visible de salud y normas.
- **Corrección del primer resultado:** la versión anterior mostraba «más de 40 horas», «100 % natural», «libre de tóxicos» y «datos que me faltaron: ninguno», defectos que las reglas del propio prompt prohíben y que por tanto no eran plausibles. Ahora el primer resultado cumple esas reglas y falla donde un prompt no puede impedirlo del todo (ver trazabilidad). Esas frases se conservan solo como ejemplos ilustrativos del pedido ingenuo, en «Antes».
- **Coherencia:** un dato de una sola fuente en todas partes (los conteos de palabras y de caracteres, los criterios, los umbrales y los límites del canal salen de constantes). El dato de Merchant Center aparece una vez en el texto (ejemplo de la adaptación) y en las fuentes.

## Activo original
Ficha de producto con estado y origen (tabla copiable), tabla de respaldo por tipo de afirmación (copiable) y rúbrica interactiva de cinco criterios (0–10; bloqueo si «Cada hecho tiene su fila» o «Sin promesas de seguridad ni salud» sacan 0).

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `ficha` | Entrevista: completa la ficha, marca estado y origen | PRODUCTO, LO_QUE_TENGO |
| `redaccion` | Principal: versión corta y larga solo con filas verificadas | NEGOCIO, PUBLICO, CANAL, TONO, LONGITUD, PREGUNTAS, FICHA |
| `auditoria` | Evaluación: frases con problema y rúbrica | DESCRIPCION, FICHA |
| `ajuste` | Iteración: corrige solo lo señalado | PROBLEMAS, NO_TOCAR |
| `canal` | Adaptación: otro canal con sus límites | CANAL_NUEVO, LIMITES_DEL_CANAL |

## Verificación de conteos y datos (todo ficticio; verificado con código)
47 comprobaciones en Node, todas correctas:
- **Palabras:** versión corta inicial = **57** (pedido: «unas 40»); versión corta final = **44**. El análisis, la tabla de cambios y el encabezado citan esos mismos valores.
- **Defectos:** «muchas tardes» está solo en la versión corta inicial; «3 horas cada vez» solo en la larga inicial. La versión larga final es la inicial con esa frase sustituida por «La primera vez, enciéndela unas 3 horas.» y «Antes de cada uso, recorta la mecha a 5 mm.».
- **Ningún dato sin confirmar en los textos:** ninguna de las cuatro versiones ni el texto adaptado contiene «100 %», «40 horas», «natural», «tóxico», «sin humo», «parafina», «duración», «seguro/a», «garantiza», «mejor» ni «certific…».
- **Cada hecho, con su fila:** cada hecho de la versión larga final (soja, mecha, vaso, aroma, 200 g, 9 cm, 8 cm, lotes pequeños, 3 horas, 5 mm, vigilancia) está en una fila «Verificado» de la ficha. La ficha tiene 11 filas sobre 8 campos y 3 filas «Sin confirmar».
- **Rúbrica:** puntajes 1, 1, 2, 2, 1 = **7 de 10** («Con ajustes», 6–8); tras el ajuste, 10 de 10. El prompt de auditoría lista los mismos cinco criterios, los mismos umbrales (0/6/9) y la misma regla de bloqueo que la rúbrica.
- **Adaptación:** el texto adaptado tiene 306 caracteres (tope 5.000); producto, material, medidas y peso terminan en el carácter 130 (dentro de los primeros 160); no lleva enlaces.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de redacción | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| «Enciéndela unas 3 horas cada vez» | Regla 1: solo filas «Verificado» | La cifra es correcta; solo cambia su alcance (la ficha dice «primer uso»). Es una cifra correcta con otro alcance, no un dato inventado. |
| «Una vela para acompañarte muchas tardes» | Regla 1: no insinuar lo sin confirmar; regla 3: adjetivos de tono permitidos | Una insinuación de duración con lenguaje afectivo cae en la zona gris entre tono y hecho. |
| Versión corta de 57 palabras (pedido: unas 40) | Formato de salida: «Versión corta (LONGITUD)» | «Unas 40» es aproximado y contar palabras es una tarea en la que puede equivocarse; por eso la auditoría cuenta y el ajuste vuelve a contar. |
Cada frase de análisis o de explicación que atribuye una línea al prompt («como pide el prompt», los fragmentos citados) se comprobó contra el texto real del prompt.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a la ficha de Luz de Cera (ficticio: nombre, producto, medidas y datos pendientes inventados). No proceden de una conversación real ni de una prueba del autor. La respuesta del prompt de auditoría no se reproduce entera: se muestra como análisis por criterio.

## Datos que caducan (volver a verificar antes de cada actualización)
Consultados el **18 de septiembre de 2026** (ver `sources` en `data.ts`); no se volvieron a consultar en esta regeneración (solo un día después):
- Google Search Central: uso de contenido generado con IA (actualizada el 10 de diciembre de 2025) y política de spam, contenido a escala (actualizada el 28 de agosto de 2026).
- Google Merchant Center: `description` (máx. 5.000 caracteres; datos clave en los primeros 160–500; evitar texto promocional, enlaces y comparaciones) y `structured_description` para descripciones generadas con IA.
Se citan en: la adaptación al canal (límites y declaración de IA), la FAQ (informar el uso de IA y contenido a escala) y las fuentes.

## Imágenes
Carpeta: `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/` (solo contiene `.gitkeep`; no había imágenes que conservar). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `datos-necesarios.webp` | Datos | 4:3 |
| `ficha-de-producto.webp` | Paso 2 (ficha) | 4:3 |
| `borrador-inicial.webp` | Primer resultado | 16:9 |
| `auditoria-de-frases.webp` | Análisis | 16:9 |
| `descripcion-final.webp` | Resultado final | 16:9 |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 |

Las cinco `prueba-prompt-0N.webp` (`promptId`: `ficha`, `redaccion`, `auditoria`, `ajuste`, `canal`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (una ficha real de un producto propio y qué preguntas dejaron de llegar) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `ficha` | PRODUCTO del caso o tuyo; LO_QUE_TENGO «nada»; responder de a una y una vez «no sé» | Preguntas, respuestas, tabla y «Pendiente» | Una pregunta por turno; 8 campos; «Sin confirmar» donde no sabes; origen en cada dato | Sugiere materiales o duración; acepta una duración sin prueba |
| `redaccion` | La ficha del caso, público, canal, tono, «unas 40 palabras» y las tres preguntas | Versión corta, larga, «Filas que usé» y «FALTA» | Solo filas verificadas; «¿Cuánto dura?» sin responder y en «FALTA»; corta cerca de 40 palabras | Insinúa duración; cambia el alcance de una cifra; se pasa del largo |
| `auditoria` | Las dos versiones y la ficha | Tabla de problemas, conteo de frases, rúbrica y «Para comprobar tú» | Cita fragmentos; cuenta las palabras; NO PUBLICAR si un criterio bloqueante saca 0 | Da por respaldada una frase que no lo está; reescribe |
| `ajuste` | PROBLEMAS con las dos frases y el conteo; NO_TOCAR «la ficha y las frases respaldadas» | «Cambios», versiones finales y «FALTA» | Solo cambia lo señalado; corta cerca de 40 palabras | Cambia frases correctas; cambia un elogio por otro |
| `canal` | «Catálogo de Google (Merchant Center)» y sus límites copiados de la ayuda oficial | Tabla, «Contra los límites» y «Para comprobar tú» | Mismos hechos; datos clave al inicio; cada límite con su marca | Añade texto promocional; cuenta mal los caracteres |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-18) y decidir si `updatedAt` 2026-09-19 debe mantenerse.
- Que los límites de Merchant Center y la política de Google sigan vigentes (fuentes con fecha).
- Probar los cinco prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Las reglas de etiquetado, publicidad y declaración de contenido generado con IA varían por país: la guía manda a comprobarlas y no las cubre.
- La caja «tiempo» (≈2 horas con el primer producto) es una estimación de la guía, no una medición.
- Enlaces de vuelta sugeridos desde `crear-anuncios-con-ia`, `crear-publicaciones-para-redes-sociales-con-ia` y `responder-consultas-de-clientes-con-ia` (no editadas).
