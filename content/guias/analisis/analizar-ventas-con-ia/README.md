# Analizar tus ventas con IA sin tomar hipótesis por hechos

**Ruta:** `/analisis/guias/analizar-ventas-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick` (antes `develoclick`). **Estándar:** `estandarGuia: 3` (prompt de guías v3). Regenerada el 2026-09-19; se conservan `slug`, `publishedAt` (2026-09-19), título y descripción. No existían imágenes (solo `.gitkeep`) ni `evidence` del autor que conservar.
**Tipo de guía:** números y datos (`numeros-datos`; `handlesNumbers: true`).
**Problema:** hay ventas registradas pero no se sabe qué preguntarles ni cómo interpretarlas con criterio; una IA a la que se le pegan las ventas suma mal y da causas que nadie comprobó.
**Ángulo propio:** la hoja calcula (con total de control y comparación por día abierto), la IA propone hipótesis con alternativas y formas de comprobarlas, y la persona comprueba y decide; comparar periodos de forma justa; decir «con estos datos no se puede afirmar».

## Cambios de esta regeneración (v3)
- **Se quitaron:** `hero.tools` (duplicaba `quickFacts.needs`), la `checklist` y la «Aplicación» que repetían el método, el bloque «antes y después», los tres ejemplos por negocio (su enseñanza pasa a la tabla «Cuándo no se puede afirmar»), la tabla «quién hace cada tarea» (repetía el mensaje central), el prompt de verificación (se fusionó en el de auditoría) y el prompt de preguntas (pasa a ser una tabla copiable de cinco preguntas), y `investigar-competidores-con-ia` de las guías relacionadas (no existe).
- **Se añadieron:** hoja de ventas y resumen copiable con fórmulas ES/EN evaluadas, prompt de fórmulas sin compartir ventas, total de control, comparación por día abierto, rúbrica de 6 criterios con dos bloqueos, prompt de ajuste con datos nuevos, pasos marcables, 7 partes y un espacio de prueba por prompt.
- **Corrección del primer resultado:** la versión anterior mostraba un total de 3014, un −24 % y un 40 % de suculentas como errores del prompt principal, cuando ese prompt prohíbe hacer cálculos nuevos: no eran plausibles. Esas cifras erradas pasan al **pedido ingenuo** de la sección «Antes», donde se contradicen con la hoja. El primer resultado del prompt principal ahora falla donde un prompt no puede impedirlo del todo (ver trazabilidad).
- **Imágenes:** se conservan `hero.webp`, `datos-necesarios.webp`, `tabla-resumen.webp` (ahora en la sección de la hoja), `comprobacion-de-cifras.webp` e `hipotesis-y-comprobaciones.webp`; se añade `primera-lectura.webp` y las cuatro pruebas de prompts.
- **Extensión:** de ≈6.300 a ≈4.920 palabras contadas por el validador.

## Activo original
Hoja de ventas y resumen copiable (plantilla + fórmulas ES/EN con total de control y ventas por día abierto), mapa de cinco preguntas para tus ventas (copiable), mapa «Cuándo no se puede afirmar» (copiable) y rúbrica interactiva de seis criterios (0–12; bloqueo si «Cada cifra está en tu resumen» o «Separa hechos de hipótesis» sacan 0).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `formulas` | Ayuda con la hoja sin compartir ventas (solo describe hojas y columnas) | PROGRAMA, COLUMNAS_Y_CELDAS |
| `principal` | Principal: observaciones, hipótesis con alternativas, cómo comprobarlas y límites | NEGOCIO, PERIODO, TABLA_RESUMEN, CONTEXTO, PREGUNTA |
| `auditoria` | Verificación: cada cifra con su origen y cómo recalcularla | TABLA_RESUMEN, CONTEXTO |
| `ajuste` | Iteración: corrige solo lo señalado con datos nuevos de la hoja | PROBLEMAS, DATOS_ADICIONALES |

## Verificación de cifras (todo ficticio; verificado con código)
Verde Hogar, sus productos, precios y ventas son **ficticios**. Una verificación en Node/TypeScript (script temporal, ya eliminado) comprobó, con **90 comprobaciones, todas correctas**:
- **Hoja completa:** se generó una hoja de ventas de 45 filas coherente con los totales del caso (los precios y unidades de helecho, suculentas y fertilizante se inventaron para cuadrar los importes; solo monstera y maceta se publican) y se **evaluaron las fórmulas tal como se pegan**, en español (`;`) y en inglés (`,`), incluida la suma condicional entre hojas (SUMAR.SI.CONJUNTO / SUMIFS): coinciden con la tabla publicada en todas las celdas.
- **Cifras del caso:** ventas por mes $950, $1119 y $865 (total $2934; la suma por producto = la suma por mes; total de control 0); % del total 24,5 / 15,0 / 32,3 / 20,7 / 7,5 (suman 100,0 %); compras 80, 92 y 78 (250); ticket promedio $11,88, $12,16, $11,09 y $11,74 en el trimestre; variación agosto +17,8 % y septiembre −22,7 %.
- **Comparación justa:** 31, 31 y 27 días abiertos; ventas por día abierto $30,65, $36,10 y $32,04; septiembre −11,2 % frente a agosto y +4,5 % frente a julio. Macetas: unidades 30, 48 y 31 (agosto +60,0 % en unidades y +33,3 % en ingresos, con precio $5 en lugar de $6); monstera 12, 15 y 9.
- **Errores de la IA (reales y corregibles con la hoja):** en el pedido ingenuo, un total de 3014 (real 2934), −24 % (real −22,7 %) y suculentas 40 % (real 32,3 %).
- **Primera lectura y corrección:** cada cifra de la primera lectura está en el resumen o en el contexto; cada cifra de la corregida, en el resumen o en los datos nuevos de la hoja; la corregida ya no contiene «en buena parte» ni «Analizar más datos» ni afirma causas. Rúbrica: puntajes 2, 1, 2, 1, 1, 2 = **9 de 12** («Con ajustes», umbrales 0/7/11).
- **Prompts:** variables usadas = definidas; cada fragmento de «por qué funciona» existe en el prompt; los formatos de salida coinciden con las columnas de sus ejemplos; el prompt de fórmulas lista 10 cuentas y la tabla tiene 10 fórmulas; los 10 «números de práctica» se evaluaron en ES y EN (incluido que el control avisa con 5 ≠ 0).

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt principal | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| Compara septiembre con agosto por totales (−22,7 %) y menciona el cierre sin ajustar ni pedir las ventas por día abierto | Regla 4: si dos periodos no son comparables, decirlo y pedir el dato | Contexto usado a medias: la cifra es correcta y está en el resumen, pero se atribuye a un periodo desigual. **El autor debe decidir si lo considera plausible**, porque la regla existe. |
| «La caída se explica en buena parte por el fin de la promoción» | Regla 2: no afirmar ninguna causa; usar «hipótesis» | Lenguaje afirmativo sutil: la frase lleva la palabra «hipótesis» pero da un peso que las cifras no muestran. Solo la rúbrica («Separa hechos de hipótesis») lo detecta. |
| «Analizar más datos de ventas» como forma de comprobar | Regla 5: decir qué dato y qué cálculo de la hoja la confirmarían | Alternativa superficial: cumple la forma (hay una comprobación) pero no el fondo. |
Ninguna cifra de la primera lectura es un cálculo nuevo (el prompt lo prohíbe). Cada frase que atribuye una línea al prompt o a la rúbrica (no calcula, no recomienda, al menos dos explicaciones, «Con estos datos no se puede afirmar», solo lo señalado) se comprobó contra el texto real.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** al resumen y al contexto de Verde Hogar (ficticio). No proceden de una conversación real ni de una prueba del autor. El pedido ingenuo (cifras erradas a propósito) es **ilustrativo**. El prompt de auditoría no tiene ejemplo de salida.

## Imágenes
Carpeta: `public/images/guias/analisis/analizar-ventas-con-ia/` (solo `.gitkeep`). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `datos-necesarios.webp` | Pasos 1 y 2 | 16:9 |
| `tabla-resumen.webp` | Pasos 3 y 4 | 4:3 |
| `primera-lectura.webp` | Primer resultado | 16:9 |
| `comprobacion-de-cifras.webp` | Paso 6 (análisis) | 16:9 |
| `hipotesis-y-comprobaciones.webp` | Resultado final | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `formulas`, `principal`, `auditoria`, `ajuste`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (un análisis con ventas propias anonimizadas, con los errores reales de una IA y las hipótesis que se comprobaron) y `revisadoEn`. Una prueba real de una IA sumando mal sería especialmente útil, con fecha y herramienta.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `formulas` | PROGRAMA y la descripción de hojas y columnas del caso, sin ventas | Tabla y «Cómo pegarla» | Diez fórmulas ES y EN; pruebas correctas; rangos fijos; la suma condicional entre hojas | Olvida el control; usa columnas no descritas; solo ES |
| `principal` | El resumen y el contexto del caso; PREGUNTA «qué cambió en septiembre» | Tabla, «Con estos datos no se puede afirmar» y «FALTA» | Solo cifras del resumen; dos explicaciones por observación; sin causas ni recomendaciones | Calcula porcentajes nuevos; dice «se debe a»; ignora el cierre |
| `auditoria` | La lectura anterior, el resumen y el contexto | Tabla, contradicciones, recomendaciones | Cada cifra con su origen o «No está»; nada dado por correcto | Da una cifra errónea por buena; calcula |
| `ajuste` | PROBLEMAS (los tres defectos) y los datos nuevos de la hoja | Tabla, «No se puede afirmar», «Cambios» | Solo cambia lo señalado; cifras nuevas solo de tus datos; sin causas | Inventa una cifra; sigue afirmando causas; recomienda |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19) y si se conserva el título original.
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si son plausibles los tres defectos del primer resultado (ver trazabilidad).
- Los precios de helecho, suculentas y fertilizante y el detalle de las ventas son inventados solo para la comprobación; no se publican.
- Las normas sobre datos personales, contabilidad e impuestos varían por país: la guía manda a consultar a un contador y no las cubre.
- La caja «tiempo» (2 a 3 horas) es una estimación de la guía; la interactividad (marcas de pasos, rúbrica, «Copiar como tabla», constructor de variables) no se probó en un navegador real más allá del HTML del build.
- Enlaces de vuelta sugeridos desde `crear-promociones-con-ia` (después de una promoción, cómo analizar sus ventas) y `definir-precios-y-margenes-con-ia` (no editadas).
