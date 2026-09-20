# Investigar competidores con IA

**Ruta:** `/analisis/guias/investigar-competidores-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). Guía nueva, creada el 2026-09-19 (`publishedAt` y `updatedAt`).
**Tipo de guía:** estrategia y planificación + decisión o comparación (`estrategia-planificacion`, `decision-comparacion`). No es de números (`handlesNumbers` no se marca): los precios del caso son datos que se listan y no se calculan. `usesExternalInfo: true`, con su `<Callout variant="fuentes">` en la sección de datos.
**Problema:** el negocio quiere saber en qué se diferencia de otros parecidos, pero investigar y comparar lleva demasiado tiempo; una IA a la que se le pregunta por los competidores responde con detalle que puede ser inventado.
**Ángulo propio:** ningún dato sobre competidores sale de la memoria de la IA. Los aporta la persona en una *ficha de evidencia* (un dato, una fuente, una fecha, un tipo de dato de cinco); la IA solo planifica qué mirar (sin aportar datos), revisa la ficha (sin añadir nada), compara citando ids y propone hipótesis de diferenciación con su forma de comprobarlas. Diferencia frente a `analizar-ofertas-de-proveedores-con-ia` (cotizaciones que recibes, con cuentas) y `analizar-opiniones-de-clientes-con-ia` (opiniones de tus propios clientes).

## Activo original
Plan de investigación (salida del prompt de plan), ficha de evidencia copiable, guía de cinco tipos de dato copiable y rúbrica interactiva de seis criterios (0–12; bloqueo si «Cada dato lleva su fuente» o «Distingue hecho, opinión y estimación» sacan 0).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `plan` | Planificación: qué mirar, dónde y con qué límites, sin aportar ningún dato de los competidores | NEGOCIO, DECISION, COMPETIDORES |
| `revision` | Verificación: filas de la ficha sin fuente, sin fecha, mal clasificadas o que no prueban lo que parecen | DECISION, FICHA |
| `sintesis` | Principal: comparación con ids e hipótesis de diferenciación | NEGOCIO, DECISION, FICHA |
| `ajuste` | Iteración: corrige solo lo señalado, citando filas de la ficha | PROBLEMAS, NO_TOCAR |

No hay prompt de evaluación: la evaluación es la rúbrica manual. Reunir la evidencia y comprobar con clientes no llevan prompt a propósito.

## Verificación de consistencia (todo ficticio; verificado con código)
Gimnasio Cima, los gimnasios A, B y C, sus horarios, precios, reseñas y las fechas de consulta son **ficticios**: no describen ningún negocio real. No hay cálculos, pero se **verificó** con código (script temporal en Node/TypeScript, ya eliminado; 76 comprobaciones, todas correctas) que:
- **Ficha:** 12 filas E01…E12 en orden; todos los tipos son de los cinco válidos; cada fila tiene fuente; 11 tienen fecha ISO de septiembre de 2026 (ninguna futura) y solo E09 no la tiene; E12 es una opinión de clientes anotada como «Observado por mí» (los dos defectos son a propósito); los datos del propio negocio son «Dato propio».
- **Revisión:** señala exactamente E06, E09 y E12; las «filas sin problema» son las otras nueve (E01–E05, E07, E08, E10, E11).
- **Comparación e hipótesis:** los 23 ids citados existen en la ficha y cada dato (horarios, precios, «máximo 10», «3 de 12 reseñas») coincide con su fila; hay 6 celdas «Sin dato»; cada hipótesis empieza por «HIPÓTESIS»; nada recomienda ni dice quién es mejor; «Solo B publica clases» cita E06 (A), E11 (C), E07 (B) y E03 (Cima).
- **Ajuste:** cada «Antes» es exactamente la frase de la primera comparación; las frases nuevas citan E02, E08, E05, E11 y E12, que existen y dicen lo que se afirma ($35 con todas las clases frente a $45 con 8 clases; A y C sin clases; 3 de 12 reseñas); los defectos ya no están en el «Después».
- **Pedido ingenuo:** ninguna fila de la ficha respalda las cuatro frases inventadas; las que citan la ficha (E06, E08) dicen lo que se afirma.
- **Rúbrica y prompts:** puntajes 2, 1, 2, 1, 1, 2 = **9 de 12** («Con ajustes», umbrales 0/7/11); análisis y rúbrica comparten criterios y orden; variables usadas = definidas; cada fragmento de «por qué funciona» existe en su prompt; los formatos de salida coinciden con las columnas de sus ejemplos; las reglas que cita el análisis existen; cuatro de los siete pasos llevan prompt.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de síntesis | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| Hipótesis 1: «Cima ocupa un punto intermedio de precio», con los cuatro precios de planes distintos | Regla 4: compara solo lo comparable; si dos datos miden cosas distintas, dilo en la celda | Las celdas de la tabla sí aclaran qué incluye cada plan; el desliz está en la hipótesis, que usa los números sin su alcance. Es una cifra correcta en un alcance equivocado. **El autor debe decidir si lo considera plausible**, porque la regla existe. |
| Hipótesis 3: «C tiene un problema de limpieza» | Regla 3: la opinión se presenta con su alcance, nunca como un hecho; regla 6: no afirmar causas | La observación sí trata la opinión como opinión (3 de 12); el hecho se cuela en la hipótesis con lenguaje afirmativo sutil, bajo la etiqueta «HIPÓTESIS». |
| Comprobación «Investigar más sobre C» | Regla 5: cómo comprobarla con algo concreto que yo pueda hacer | Alternativa superficial: cumple la forma (hay una comprobación) pero no el fondo. |
No hay ningún dato inventado ni ninguna cifra ajena a la ficha en el primer resultado (el prompt lo prohíbe). Cada frase que atribuye una línea al prompt o a la rúbrica se comprobó contra el texto real.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a la ficha del caso (ficticio). No proceden de una conversación real ni de una prueba del autor. El pedido ingenuo (frases inventadas) es **ilustrativo**. El prompt de plan devuelve además la ficha vacía y «FALTA»; el ejemplo muestra solo su tabla de aspectos.

## Fuentes
La guía no cita fuentes externas ni cifras de referencia: todo dato sobre competidores lo aporta la persona con su fuente y su fecha, y el caso es inventado. Las normas sobre uso de datos, competencia y condiciones de cada plataforma varían por país y no se cubren (la guía lo dice y remite a consultar).

## Imágenes
Carpeta: `public/images/guias/analisis/investigar-competidores-con-ia/` (aún no existe). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `ficha-de-evidencia.webp` | Pasos 2 y 3 | 16:9 |
| `revision-de-la-ficha.webp` | Pasos 4 y 5 | 16:9 |
| `primera-comparacion.webp` | Primer resultado | 16:9 |
| `contraste-con-la-ficha.webp` | Paso 6 (análisis) | 16:9 |
| `hipotesis-corregidas.webp` | Resultado final | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `plan`, `revision`, `sintesis`, `ajuste`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (una ficha propia con negocios reales, anonimizando reseñas, y qué hipótesis se comprobaron con clientes) y `revisadoEn`. Una prueba real de una IA aportando datos inventados de un negocio real cuando se le pregunta directamente, con fecha y herramienta, sería especialmente útil.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `plan` | NEGOCIO, DECISION y COMPETIDORES (solo nombres) del caso | Tabla de aspectos, ficha vacía y «FALTA» | Cuatro a seis aspectos; solo fuentes públicas; cada aspecto con su límite; ningún dato de los competidores | Describe a los competidores; propone hacerse pasar por cliente; inventa un tipo de dato |
| `revision` | DECISION y la ficha del caso (con E09 sin fecha y E12 mal tipada) | Tabla de problemas y «Filas sin problema» | Señala E06, E09 y E12; no añade ni cambia datos; no da nada por verificado | Corrige la fecha él mismo; da una fila por «verificada» |
| `sintesis` | NEGOCIO, DECISION y la ficha corregida | Las dos tablas, «No se puede afirmar» y «FALTA» | Cada dato con id existente; «Sin dato» donde falta; opiniones como opiniones; sin recomendar | Añade un dato sin id; escribe «C está sucio»; dice quién es mejor |
| `ajuste` | Comparación anterior, PROBLEMAS (los tres defectos) y NO_TOCAR «la tabla y los ids» | «Cambios», «Sin cambios» y «FALTA» | Solo cambia lo señalado; cada frase nueva cita ids que existen | Toca la tabla de comparación; inventa un id |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si son plausibles los tres defectos del primer resultado (ver trazabilidad).
- Los gimnasios, precios, horarios, reseñas y fechas del caso son un ejemplo ficticio; los planes y precios no reflejan ningún mercado.
- Las normas sobre uso de datos y competencia, y las condiciones de cada plataforma, varían por país: la guía manda a consultarlas y no es asesoría legal.
- La caja «tiempo» (≈3 horas) es una estimación de la guía; la interactividad (marcas de pasos, rúbrica, «Copiar como tabla», constructor de variables) no se probó en un navegador real más allá del HTML del build.
- Enlaces de vuelta sugeridos desde `analizar-ventas-con-ia` (para contrastar lo investigado con tus cifras) y `crear-anuncios-con-ia` (para comunicar la diferenciación comprobada); no se editaron.
