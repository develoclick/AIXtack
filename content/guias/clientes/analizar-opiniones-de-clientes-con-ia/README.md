# Analizar opiniones de clientes con IA

**Ruta:** `/clientes/guias/analizar-opiniones-de-clientes-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). Guía nueva, creada el 2026-09-19 (`publishedAt` y `updatedAt`).
**Tipo de guía:** números y datos + tema sensible (`numeros-datos`, `tema-sensible`; `handlesNumbers: true`).
**Problema:** el negocio tiene muchas opiniones dispersas y no sabe qué patrones se repiten ni qué mejorar primero; una IA a la que se le pegan tal cual da conteos y citas que nadie comprueba y puede recibir datos personales.
**Ángulo propio:** la IA solo *clasifica* con un libro de códigos y una cita literal por reseña; una hoja *cuenta* y comprueba que cada cita está en su reseña; la lectura de patrones separa lo que se puede afirmar de lo que no; y todo se hace con datos anonimizados. Diferencia frente a `responder-consultas-de-clientes-con-ia` (redactar la respuesta a UN cliente) y `analizar-ventas-con-ia` (cifras de ventas, no texto).

## Activo original
Libro de códigos copiable, hoja de conteo copiable (bloque para pegar en J1 con fórmulas ES/EN que cuentan menciones y comprueban citas) y rúbrica interactiva de cinco criterios (0–10; bloqueo si «Cada cita está en su reseña» o «Aplica el libro de códigos» sacan 0).

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `formulas` | Ayuda con la hoja sin compartir datos (solo describe columnas) | PROGRAMA, COLUMNAS_Y_CELDAS |
| `codigos` | Entrevista: define temas con «qué incluye / qué no» | NEGOCIO, LO_QUE_QUIERO_SABER |
| `clasificacion` | Principal: tabla con temas, valencias y cita textual | NEGOCIO, LIBRO_DE_CODIGOS, RESENAS |
| `ajuste` | Iteración: corrige solo las filas señaladas | PROBLEMAS, NO_TOCAR |
| `lectura` | Adaptación/lectura: hallazgos, oportunidades y límites de lo afirmable | CONTEOS, TABLA_FINAL |

No hay un prompt de evaluación: la evaluación la hacen la hoja (citas y conteos) y la rúbrica manual.

## Verificación de cifras (todo ficticio; verificado con código)
Las 25 reseñas son **ficticias**, escritas por el autor de la guía: no proceden de ningún cliente ni plataforma. Una verificación independiente en Node/TypeScript (script temporal, ya eliminado) leyó las tablas publicadas y comprobó, con **más de 100 comprobaciones, todas correctas**:
- **Conteos:** recalculados desde las filas de clasificación. Primera clasificación: 32 menciones; final: 33 (25 reseñas + 8 con dos temas). Por tema (final): Comida 9 (6 + / 3 −), Servicio 6 (4 / 2), Espera 6 (1 / 5), Precio 4 (2 / 2), Ambiente 5 (2 / 3), Reservas 3 (1 / 2); total 33 (16 positivas, 17 negativas). En cada tema, positivas + negativas = menciones.
- **Fórmulas de la hoja:** se implementó un pequeño intérprete y se **evaluaron las fórmulas tal como se pegan**, en español (`;`) y en inglés (`,`), sobre la cuadrícula real de 25 filas, para las dos clasificaciones: coinciden con el conteo independiente en los seis temas, el total (32 y 33) y «Citas no encontradas» = 0. La fórmula EN es la ES con las funciones y separadores traducidos. Los ocho ejemplos «con números de práctica» de la tabla de fórmulas se evaluaron con sus datos de práctica (incluida la sensibilidad a mayúsculas de H2).
- **Citas:** las 25 citas son fragmentos literales (sensibles a mayúsculas) de su reseña; la cita del pedido ingenuo («Tardaron más de cuarenta minutos en la cuenta») no está en ninguna reseña, y R10 dice «cuarenta minutos en traer la cuenta».
- **Corrección:** la clasificación final es la primera con tres cambios (R06, R15, R18); cada «antes» de la tabla coincide con la primera clasificación. Cambian los conteos de tres temas: Servicio (7 → 6), Espera (5 → 6; positivas 2 → 1, negativas 3 → 5) y Reservas (2 → 3).
- **Hallazgos:** los cinco hallazgos con tres o más menciones, en orden y con desempate por el orden del libro: Comida elogio 6 de 9; Espera problema 5 de 6; Servicio elogio 4 de 6; Comida problema 3 de 9; Ambiente problema 3 de 5. Cada cita está en una de sus reseñas; las oportunidades (5 quejas de espera; 3 de ambiente) coinciden con esos conteos y con lo que dicen las reseñas (platos, cuenta y pedido; ruido, pintura y baños).
- **Pedido ingenuo (ilustrativo, escrito a propósito):** «8 reseñas, 32 %» frente a 6 reseñas (24 %) en la hoja.
- **Rúbrica:** puntajes 2, 1, 1, 1, 2 = **7 de 10** («Con ajustes», umbrales 0/6/9); análisis y rúbrica comparten criterios y orden.
- **Prompts:** variables usadas = variables definidas; cada fragmento de «por qué funciona» existe en el prompt; los formatos de salida coinciden con las columnas de sus ejemplos.
- El cálculo de porcentajes y la comparación de períodos se advierten como límite, no se calculan: las reseñas no traen fecha.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de clasificación | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| R06 solo «Servicio (Negativa)»: falta «Espera» | Regla 2: dos menciones solo si el texto habla de dos temas distintos | El contexto se usa a medias: la regla dice cuándo hay dos, no obliga a detectarlas todas; se puntúa con «Recoge todas las menciones». |
| R18 como «Servicio» en lugar de «Reservas» | Regla 1: usar los temas del libro con su definición y límites | El límite exige interpretar «encontrar la mesa lista al llegar»; el modelo puede leerlo como fallo del personal. **El autor debe decidir si lo considera plausible**, porque el libro lo excluye de Servicio y el prompt pide anotar lo ambiguo en «Dudas». |
| R15 con «Espera (Positiva)» | Regla 2: valencia según lo que dice el texto sobre ese tema | Una queja mezclada con un elogio («pero valió la pena por la comida») contagia la valencia; es un error sutil de lectura, no una regla violada. **El autor debe decidir su plausibilidad.** |
Las citas son literales en todas las filas (el prompt las exige y la hoja las comprueba), y el primer resultado no da totales ni porcentajes (regla 4). Cada frase que atribuye una línea al prompt (no cuenta, solo cambia los ids señalados, marca hipótesis, separa «Sin cambios», define «Para una persona» y «Dudas») se comprobó contra el texto real.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a las reseñas y al libro de códigos del Restaurante La Higuera (ficticio). No proceden de una conversación real ni de una prueba del autor. El pedido ingenuo (conteo de 8 y una cita inexistente) es **ilustrativo** y está escrito a propósito. El prompt de fórmulas no tiene ejemplo de conversación: su salida es la tabla de fórmulas (ejemplo generado).

## Imágenes
Carpeta: `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/` (no existe ningún archivo). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `resenas-anonimizadas.webp` | Datos | 4:3 |
| `hoja-de-conteo.webp` | Paso 2 (hoja) | 4:3 |
| `clasificacion-inicial.webp` | Primer resultado | 16:9 |
| `verificacion-de-citas.webp` | Análisis | 16:9 |
| `conteos-antes-y-despues.webp` | Resultado final | 16:9 |
| `lectura-de-patrones.webp` | Paso 6 (lectura) | 16:9 |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 |

Las cinco `prueba-prompt-0N.webp` (`promptId`: `formulas`, `codigos`, `clasificacion`, `ajuste`, `lectura`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo. Los ejemplos de imágenes usan solo el caso ficticio.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (por ejemplo, reseñas propias anonimizadas y qué cambió tras usar el método) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `formulas` | PROGRAMA y la descripción de columnas del caso (sin reseñas) | La tabla y «Cómo pegarla» | Fórmulas ES y EN; comprobación con números de práctica correcta; dice cuáles rangos fijar | Usa columnas no descritas; solo cuenta «Tema 1» y no «Tema 2»; comprobaciones erróneas |
| `codigos` | NEGOCIO y LO_QUE_QUIERO_SABER del caso; responder «todavía no lo decidí» a un límite | Preguntas, tabla y «Pendiente» | Una pregunta por turno; cada «no incluye» apunta a otro tema; lo no decidido «Pendiente» | Propone temas «habituales» que no dije; pide reseñas |
| `clasificacion` | El libro de la guía y las 25 reseñas ficticias | Tabla, «Para una persona» y «Dudas» | Una fila por reseña; temas con el nombre exacto del libro; citas literales; sin conteos | Cita retocada; tema inventado; añade totales; omite una reseña |
| `ajuste` | PROBLEMAS con las tres correcciones; NO_TOCAR «las demás filas» | Cambios y «Sin cambios» | Solo cambia los ids señalados | Cambia otras filas; corrige a ciegas un problema mal señalado |
| `lectura` | Los conteos de la hoja y la tabla final | Hallazgos, oportunidades y «No se puede afirmar» | Cifras idénticas a la hoja; sin causas; hipótesis marcada; al menos un límite | Cifras copiadas mal; «lo más importante»; causa afirmada; recomienda precios o menú |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cinco prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si R18 (Reservas leído como Servicio) y R15 (valencia de «Espera») son defectos plausibles del primer resultado (ver trazabilidad).
- Las reglas sobre datos personales, uso de reseñas y condiciones de cada plataforma varían por país y plataforma: la guía manda a consultarlas y no las cubre.
- La caja «tiempo» (≈3 horas) es una estimación de la guía; la interactividad en vivo (marcas de pasos, rúbrica, botón «Copiar como tabla», constructor de variables) no se probó en un navegador real más allá del HTML del build.
- Enlaces de vuelta sugeridos desde `analizar-ventas-con-ia`, `responder-consultas-de-clientes-con-ia` e `ideas-de-contenido-para-tu-negocio-con-ia` (no editadas).
