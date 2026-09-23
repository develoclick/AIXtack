# Ideas de nuevos productos o servicios con IA

**Ruta:** `/analisis/guias/ideas-de-nuevos-productos-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). Guía nueva, creada el 2026-09-19 (`publishedAt` y `updatedAt`).
**Tipo de guía:** estrategia y planificación + decisión o comparación (`estrategia-planificacion`, `decision-comparacion`). No es de números (`handlesNumbers` no se marca): las puntuaciones son valores 0–2 que la persona suma; las cifras del caso (veces que se repite cada problema, totales) son datos que se listan y se suman. `usesExternalInfo: true`, con su `<Callout variant="fuentes">` en la sección de datos.
**Problema:** el negocio quiere ofrecer algo nuevo pero no sabe qué proponer ni cómo saber si tendrá demanda antes de invertir; una IA a la que se le piden «ideas de productos» responde con justificaciones de mercado que no tienen fuente.
**Ángulo propio:** la IA propone y el mercado decide. Las ideas son hipótesis que nacen de una *ficha de problemas* que aporta la persona (frases textuales de sus clientes, veces, dónde), se contrastan con su capacidad, se puntúan con una matriz de cinco criterios que exige evidencia, y se prueban con un plan pequeño con criterios de éxito y de parada **fijados por la persona antes de la prueba**. Diferencia frente a `analizar-opiniones-de-clientes-con-ia` (qué se repite en opiniones ya escritas), `investigar-competidores-con-ia` (qué hacen otros) y `definir-precios-y-margenes-con-ia` (cuánto cobrar): esta guía cubre qué ofrecer y cómo comprobar que hay demanda.

## Activo original
Ficha de problemas copiable, matriz de puntuación de cinco criterios copiable, plan de validación y registro de resultados copiables (vacío), y rúbrica interactiva de seis criterios (0–12; bloqueo si «Cada idea nace de tu ficha» o «No inventa datos de mercado» sacan 0).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `ideas` | Principal: hipótesis de producto desde la ficha, sin datos de mercado | NEGOCIO, CAPACIDAD, PROBLEMAS |
| `ajuste` | Iteración: corrige solo lo señalado, citando ficha o capacidad | PROBLEMAS_DETECTADOS, NO_TOCAR |
| `filtro` | Evaluación: puntúa las ideas con la matriz, con evidencia; no suma ni ordena | IDEAS, PROBLEMAS, CAPACIDAD |
| `validacion` | Planificación: plan de prueba con los criterios de la persona; no inventa umbrales ni cobra antes de tiempo | IDEA, CRITERIOS_DE_EXITO, PRESUPUESTO_Y_PLAZO |

Recoger lo que dicen los clientes, hacer la prueba y decidir con lo ocurrido no llevan prompt a propósito (los hace la persona).

## Verificación de consistencia (todo ficticio; verificado con código)
Panadería La Espiga (ficticia), sus clientes, las frases de la ficha, las veces, la capacidad, las ideas y todos los criterios de éxito del plan son **ficticios**: no describen ningún negocio real. Se **verificó** con código (script temporal en TypeScript, ya eliminado; 84 comprobaciones, todas correctas) que:
- **Ficha:** 7 problemas P01…P07 en orden, todos frases textuales entre «», de 3 a 9 veces cada uno; 37 menciones (5+7+9+4+6+3+3); la capacidad del caso es la misma constante que usan los prompts.
- **Ideas:** 6 ideas I1…I6 con las seis columnas del prompt; cada problema citado existe, las seis ideas cubren los siete problemas y solo I3 responde a P01; la primera tabla no trae datos de mercado, cifras ni recomendaciones; I3 avisa «Requiere revisar normas» (regla 7 del prompt) y omite la zona separada.
- **Ajuste:** cada «Antes» es exactamente la celda de la primera tabla; las cinco correcciones citan P03 (9 veces), la capacidad o el criterio; «Sin cambios» e ideas intactas coinciden con NO_TOCAR (I1, I2 e I6).
- **Matriz:** los cinco criterios están en el mismo orden en la plantilla, en el prompt y en las columnas del ejemplo; cada celda vale 0, 1 o 2; los totales sumados son I1 8, I2 9, I3 6, I4 8, I5 6, I6 8 (los mismos de la nota); el «Margen» es 1 en todas (no hay costos en la ficha); las veces de cada «Por qué» son sumas de la ficha (P02+P03 = 16, P04+P05 = 10, P01 = 5, P03 = 9, P06 = 3, P07 = 3); el riesgo de I3 no pasa de 1 (regla 5 del prompt).
- **Plan de validación:** cuatro pasos como máximo; los criterios de los pasos 1 y 3 (6 de 10, 8 personas, tres semanas, menos de 3 de 10, menos de 3 personas) son los de CRITERIOS_DE_EXITO; los pasos 2 y 4 no llevan umbrales numéricos inventados; presupuesto $50 y tres semanas; el registro de resultados está sin rellenar, con «—» en las columnas de resultado (la prueba del caso no se realizó y no hay resultados inventados).
- **Rúbrica y prompts:** puntajes 2, 2, 1, 1, 1, 2 = **9 de 12** («Con ajustes», umbrales 0/7/11); análisis y rúbrica comparten criterios y orden; variables usadas = definidas; cada fragmento de «por qué funciona» existe en su prompt; los formatos de salida coinciden con las columnas de sus ejemplos; las reglas que cita el análisis (sin datos de mercado, sin recomendar, normas, cambiar solo lo señalado) existen; cuatro de los siete pasos llevan prompt; los tres enlaces internos del MDX y `relatedGuides` apuntan a guías que existen.
- **Estructura:** 8 partes en el índice, 2 recuadros «En palabras simples», `evidence` vacío, autor `DeveloClick`.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de ideas | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| I3 propone galletas sin gluten en la cocina y en «Lo que faltaría» no menciona la zona separada (sí las harinas, las recetas y las normas) | Regla 4: si una idea exige algo que no tengo, decirlo en «Lo que faltaría» | Contexto usado a medias: detecta parte de lo que falta y omite un dato de CAPACIDAD que sí estaba. **El autor debe decidir si es plausible**, porque la regla existe. |
| I4: «Hay demanda suficiente de pan integral por la tarde» | Regla 3: el supuesto se escribe como una condición que se pueda comprobar | Es una condición, pero vaga: no dice qué bastaría. Alternativa débil que cumple la forma y no el fondo. |
| I5: «Hacer una encuesta» | Regla 5: una prueba concreta y barata que pueda contar | Cumple la forma (hay una prueba) pero no el fondo (no dice a quién ni qué preguntar). |

No hay ningún dato de mercado ni cifra ajena a la ficha en el primer resultado (el prompt lo prohíbe). Cada frase que atribuye una línea al prompt o a la rúbrica se comprobó contra el texto real.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a la ficha del caso (ficticio). No proceden de una conversación real ni de una prueba del autor. El pedido ingenuo (frases inventadas) es **ilustrativo**. Las puntuaciones de la matriz son las de un ejemplo redactado, no una medición; la elección de I3 se presenta como criterio de la dueña, no como la mejor opción.

## Fuentes
La guía no cita fuentes externas ni cifras de mercado: los datos sobre clientes los aporta la persona y el caso es inventado. Las normas sobre productos sin gluten, etiquetado, preventas y venta de alimentos varían por país y no se cubren; la guía lo dice y manda a consultarlas con quien corresponda (no es asesoría legal ni sanitaria).

## Imágenes
Carpeta: `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/` (aún no existe). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `ficha-de-problemas.webp` | Paso 1 (datos) | 4:3 |
| `primeras-ideas.webp` | Primer resultado | 16:9 |
| `contraste-con-la-ficha.webp` | Paso 3 (análisis) | 16:9 |
| `matriz-de-decision.webp` | Paso 4 (puntuar) | 16:9 |
| `plan-de-validacion.webp` | Pasos 5 a 7 | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `ideas`, `ajuste`, `filtro`, `validacion`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (una ficha propia con problemas reales de clientes y el resultado de una prueba de validación con sus criterios fijados antes) y `revisadoEn`. Una prueba real de una IA pidiendo «ideas» sin ficha, mostrando las cifras de mercado que inventa, con fecha y herramienta, sería especialmente útil.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `ideas` | NEGOCIO, CAPACIDAD y la ficha P01–P07 del caso | Tabla de hipótesis, «Con esta ficha no se puede afirmar» y «FALTA» | Seis hipótesis con ids que existen; ningún dato de mercado; supuestos comprobables; carencias en «Lo que faltaría» | Cita tendencias o precios de otros; recomienda una idea; propone producir sin gluten sin advertir normas |
| `ajuste` | Tabla anterior, PROBLEMAS_DETECTADOS (I3, I4, I5) y NO_TOCAR (I1, I2 e I6) | «Cambios», «Sin cambios» y «FALTA» | Solo cambia lo señalado; cada motivo cita ficha o capacidad | Toca I1, I2 o I6; inventa un problema que no está en la ficha |
| `filtro` | Las seis ideas corregidas, la ficha y la capacidad | Tabla de puntuaciones y «FALTA» | Cinco puntuaciones de 0 a 2 por idea; cada «Por qué» cita ids o capacidad; 1 cuando falta el costo; no suma ni ordena | Suma los totales; dice cuál probar; da 2 en riesgo a una idea de salud |
| `validacion` | La idea I3 corregida, CRITERIOS_DE_EXITO y PRESUPUESTO_Y_PLAZO del caso | Tabla del plan, registro vacío, «Lo que esta prueba no te dirá» y «FALTA» | Máximo cuatro pasos; solo los criterios de la persona; ningún cobro antes de poder entregar; primer paso: requisitos si hay salud | Propone umbrales propios; sugiere cobrar ya; rellena el registro con resultados |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si son plausibles los tres defectos del primer resultado (ver trazabilidad); el de I3 (omitir la zona separada) es el más discutible porque la regla 4 existe.
- La panadería, las frases de clientes, las veces, las puntuaciones y los criterios de éxito del caso son un ejemplo ficticio y no reflejan ningún mercado. La prueba de validación del caso no se realizó: no hay resultados.
- Productos sin gluten, etiquetado, preventas y venta de alimentos: las normas varían por país y la guía no es asesoría legal ni sanitaria; conviene que el autor revise el tono de las advertencias (verificación, limitaciones, FAQ).
- La caja «tiempo» (≈3 horas + semanas de prueba) es una estimación de la guía; la interactividad (marcas de pasos, rúbrica, «Copiar como tabla», constructor de variables) no se probó en un navegador real más allá del HTML del build.
- Enlaces de vuelta sugeridos desde `analizar-opiniones-de-clientes-con-ia` (las quejas repetidas alimentan la ficha), `investigar-competidores-con-ia` (tras elegir una idea, ver qué ofrecen otros) y `definir-precios-y-margenes-con-ia` (poner precio a una idea que pasó la prueba); no se editaron.
