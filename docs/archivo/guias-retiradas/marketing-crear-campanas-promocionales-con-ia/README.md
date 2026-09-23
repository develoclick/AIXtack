# Crear una campaña promocional completa con IA

**Ruta:** `/marketing/guias/crear-campanas-promocionales-con-ia` (la ruta pedida traía «ñ»; el slug URL-seguro es el del plan, `crear-campanas-promocionales-con-ia`).
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3).
**Tipo de guía:** estrategia y planificación + comunicación (`estrategia-planificacion`, `comunicacion-atencion`). No es de números (`handlesNumbers` no se declara): no hay cifras de ventas; las únicas cuentas son fechas y días abiertos.
**Problema:** una promoción se convierte en varias piezas escritas en momentos distintos que difieren en un detalle (una fecha, una condición, una promesa), y al cerrar nadie sabe si funcionó.
**Ángulo propio:** no enseña a redactar cada pieza (eso lo hacen las guías de anuncios, afiches y publicaciones) sino a mantenerlas **coherentes**: una ficha como fuente única con una columna «Aparece en», una matriz que contrasta cada pieza con la ficha, una rúbrica con dos reglas de bloqueo y un plan de medición escrito antes de lanzar. Parte de una promoción ya decidida (guía de promociones) y termina donde empieza la de análisis de ventas.

## Activo original
Ficha de campaña de diez campos (tabla copiable), matriz de coherencia pieza por campo (tabla copiable), rúbrica interactiva de cinco criterios (0–10; bloqueo si «Mismos datos» o «Solo lo que la ficha respalda» sacan 0) y plan de medición (tabla copiable).

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `ficha` | Entrevista: completa la ficha y señala contradicciones | NEGOCIO, PROMOCION, FICHA_ACTUAL |
| `piezas` | Principal: un texto por pieza, solo con datos de la ficha | FICHA, PIEZAS, TONO |
| `contraste` | Evaluación: rellena la matriz y puntúa con la rúbrica | PIEZAS, FICHA |
| `ajuste` | Iteración: corrige solo las frases señaladas | PROBLEMAS, NO_TOCAR |
| `medicion` | Planificación previa: qué contar, con qué comparar, qué no se puede afirmar | LO_QUE_PUEDO_CONTAR, OTROS_EVENTOS |

## Verificación de cifras y datos (todo ficticio; verificado con código)
Se comprobó con un script en Node (86 comprobaciones, todas correctas). Las fechas no llevan mes: el 7 es sábado en cualquier mes en que así caiga; se usó septiembre de 2024 solo como calendario de comprobación.
- **Fechas y días:** el 7 y el 14 son sábado; el 20 es viernes; el 8 y el 15 son domingo (cerrado); el 6 es viernes (conteo inicial). La vigencia dura 14 días.
- **Días abiertos:** campaña = 14 − 2 domingos = **12**; período anterior = 14 − 2 domingos − 1 cierre por inventario = **11**. La tabla y la nota del plan traen «12 frente a 11».
- **Matriz frente a los textos:** cada celda ✓ o ✗ de la matriz coincide con lo que el texto de la pieza contiene (oferta «30 %», vigencia «viernes 20», tres condiciones, dirección y WhatsApp, horario «10 a 19 h», palabra OTOÑO). Con las tres sustituciones del ajuste, todos los campos comprobables pasan en las cinco piezas.
- **Rúbrica:** puntajes 1, 1, 1, 2, 2 = **7 de 10** («Con ajustes», 6–8); tras el ajuste, 10 de 10. El prompt de contraste lista los mismos cinco criterios y los mismos umbrales (0/6/9) que la rúbrica.
- **Ajuste:** corrige exactamente tres piezas; el «Antes» de cada una aparece una sola vez en su primer texto; no hay ninguna fecha «sábado 20» ni «sábado 21».
- **El plan de medición no contiene ningún porcentaje ni cifra de ventas.**

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de piezas | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| El anuncio omite «no acumulable con otras promociones» | Regla 2: cada pieza lleva los campos que «Aparece en» le asigna, copiados tal cual | Es un caso límite: la condición es un campo compuesto y puede recortarse por brevedad aunque el prompt pida copiarla. Por eso el prompt de contraste revisa cada parte por separado (regla 2). El autor debe decidir si lo considera un defecto plausible o si prefiere otro. |
| La publicación 1 dice «los abrigos más lindos de la temporada» | Reglas 1 y 4: no inventar beneficios ni comparar | Una valoración subjetiva no siempre se reconoce como dato inventado ni como comparación. |
| El mensaje de WhatsApp dice «Empieza…» el sábado 14 | Regla 3: cada pieza responde a su momento | El momento se usa solo a medias: los datos son correctos y el tono corresponde a otro momento. |
Cada frase de análisis o de explicación que atribuye una línea al prompt se comprobó contra el texto real del prompt.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** al caso de Hilo y Botón (ficticio: nombre, dirección, fechas, horario y regla de decisión inventados). No proceden de una conversación real ni de una prueba del autor. El plan de medición se escribe antes de lanzar y no muestra ningún resultado de la campaña.

## Imágenes
Carpeta: `public/images/guias/marketing/crear-campanas-promocionales-con-ia/` (no existe ningún archivo). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `datos-necesarios.webp` | Datos | 4:3 |
| `ficha-de-campana.webp` | Paso 1 (ficha) | 4:3 |
| `piezas-iniciales.webp` | Primer resultado | 16:9 |
| `matriz-de-coherencia.webp` | Análisis | 16:9 |
| `matriz-final.webp` | Resultado final | 16:9 |
| `plan-de-medicion.webp` | Medición | 4:3 |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 |

Las cinco `prueba-prompt-0N.webp` (`promptId`: `ficha`, `piezas`, `contraste`, `ajuste`, `medicion`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (una campaña propia, con su ficha y su plan de medición y qué comparó) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `ficha` | NEGOCIO y PROMOCION del caso, FICHA_ACTUAL «vacía»; responder de a una | Preguntas, respuestas y tabla | Una pregunta por turno; diez campos; lo que no sabes como `[FALTA]`; contradicciones citadas | Varias preguntas juntas; propone descuentos o fechas; no detecta una contradicción provocada |
| `piezas` | La ficha del caso, las cinco piezas y el tono | Tabla, «Supuestos y sugerencias» y «FALTA» | Cada pieza lleva sus campos copiados; sin datos nuevos; días de la semana correctos | Recorta una condición; añade elogios o urgencia; cinco textos casi iguales |
| `contraste` | Las piezas del paso anterior y la ficha | Matriz, «Diferencias» y rúbrica | Marca cada parte por separado; cita fragmentos; NO PUBLICAR si un criterio bloqueante saca 0 | Marca ✓ donde hay diferencia; reescribe las piezas |
| `ajuste` | PROBLEMAS «Anuncio, condiciones: falta …» y NO_TOCAR «afiche, publicación 2 y ficha» | Tabla «Cambios» y «Sin cambios» | Solo cambia lo señalado, con palabras de la ficha | Cambia piezas correctas; reemplaza un elogio por otro |
| `medicion` | Ficha completa, LO_QUE_PUEDO_CONTAR y OTROS_EVENTOS del caso | Tabla, «Cómo comparar con justicia» y «Con estos datos no se puede afirmar» | Indicadores que sí puedes contar; cuenta de días abiertos correcta; sin cifras de referencia | Inventa referencias del sector; cuenta mal los días; afirma que la campaña causó el cambio |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cinco prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si «condición recortada por brevedad» es un defecto plausible del primer resultado (ver trazabilidad).
- La caja «tiempo» (≈2 horas la primera vez) es una estimación de la guía, no una medición.
- Las reglas sobre promociones, publicidad y mensajes por WhatsApp varían por país: la guía manda a comprobarlas y no las cubre.
- Enlaces de vuelta sugeridos desde `crear-promociones-con-ia`, `crear-anuncios-con-ia`, `crear-afiches-con-ia`, `crear-publicaciones-para-redes-sociales-con-ia` y `calendario-de-contenido-con-ia` (no editadas).
