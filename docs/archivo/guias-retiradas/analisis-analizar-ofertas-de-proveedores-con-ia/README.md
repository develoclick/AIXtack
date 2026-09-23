# Analizar ofertas de proveedores con IA

**Ruta:** `/analisis/guias/analizar-ofertas-de-proveedores-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). Guía nueva, creada el 2026-09-19 (`publishedAt` y `updatedAt`).
**Tipo de guía:** números y datos + decisión o comparación (`numeros-datos`, `decision-comparacion`; `handlesNumbers: true`).
**Problema:** el negocio tiene tres o cuatro cotizaciones que cobran de forma distinta (por millar, por paquete, por unidad; impuestos incluidos o aparte; envío, mínimos y tramos) y decide mirando el precio de lista.
**Ángulo propio:** la IA solo *transcribe* las ofertas a una tabla comparable (sin calcular, con lo que falta o queda abierto a la vista), una hoja calcula el costo real por unidad necesaria y avisa de precios sospechosos, y la IA prepara preguntas por proveedor sin recomendar. Diferencia frente a `definir-precios-y-margenes-con-ia` (poner precio a lo que vendes) y `crear-cotizaciones-y-propuestas-con-ia` (cotizar tú, no recibir cotizaciones).

## Activo original
Hoja comparadora copiable (plantilla + fórmulas ES/EN con costo real por set y alerta), mapa de decisión copiable («Qué mirar según lo que más te importa») y rúbrica interactiva de cinco criterios (0–10; bloqueo si «Cada cifra coincide con la oferta» o «No calcula» sacan 0).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `formulas` | Ayuda con la hoja sin compartir ofertas (solo describe columnas) | PROGRAMA, COLUMNAS_Y_CELDAS |
| `extraer` | Principal: una fila por opción de precio, sin calcular | NECESIDAD, OFERTAS, SEPARADOR |
| `ajuste` | Iteración: corrige solo lo señalado, con fragmento literal | PROBLEMAS, NO_TOCAR |
| `preguntas` | Verificación: diferencias con su cifra, preguntas por proveedor y límites | NECESIDAD, TABLA_FINAL, RESULTADOS |

No hay prompt de evaluación: la evaluación es la rúbrica manual más la alerta de la hoja. La necesidad, el cálculo, la decisión y la confirmación con el proveedor no llevan prompt a propósito.

## Verificación de cifras (todo ficticio; verificado con código)
Las ofertas, los precios y el negocio son **ficticios**. Una verificación en Node/TypeScript (script temporal, ya eliminado) comprobó, con **más de 100 comprobaciones, todas correctas**:
- **Ofertas contra extracción:** cada precio, unidad (1.000 sets por millar, 50 por paquete, 1 por unidad), impuesto (0 % incluido en A; 12 % aparte en B y C), pedido mínimo, envío, días de entrega y fragmento citado aparece en el texto de su oferta. Solo C cotiza pared doble; ninguna oferta detalla grosor o material; la de B no dice nada del impuesto sobre el envío; el flete de C figura como «estimado».
- **Fórmulas de la hoja:** se implementó un pequeño intérprete y se **evaluaron las fórmulas tal como se pegan**, en español (`;`) y en inglés (`,`), sobre la cuadrícula real de 4 opciones, para la primera extracción y para los datos corregidos: coinciden con un cálculo independiente en las siete columnas calculadas. La fórmula EN es la ES con funciones y separadores traducidos. Los siete ejemplos «con números de práctica» (más dos para la alerta) se evaluaron en ES y EN.
- **Cifras del caso** (necesidad de 6.000 sets, impuestos 12 %, umbral 3): A 6.000 sets a $0,0850 = $510,00 (costo por set $0,0850); B 6.000 × $0,092 × 1,12 + $60 = $678,24 ($0,1130; +33,0 %); C desde 5.000: 6.000 × $0,088 × 1,12 + $90 = $681,36 ($0,1136; +33,6 %); C desde 10.000: 10.000 × $0,079 × 1,12 + $90 = $974,80 ($0,1625; +91,1 %, con 4.000 sets sobrantes). Con estas ofertas, A tiene el menor costo real por set; por precio de lista C ($0,079) parece la más barata.
- **Errores de la IA (reales y corregibles):** en la primera extracción B figura como 460 (la coma decimal leída como separador de miles) y C con envío 0. La alerta de la hoja marca **solo** a B («Revisar»: su precio por set, $9,20, supera 3 veces la mediana); el envío de C **no** lo marca (queda en $591,36 / 6.000 = $0,0986) y solo se detecta contrastando con la oferta. Con los datos corregidos ninguna opción sale como «Revisar». Los porcentajes del pedido ingenuo (8,2 % frente a 33,0 %) también se verificaron.
- **Tablas y prompts:** la tabla «resultado», las cifras de «Diferencias» y del mapa de decisión coinciden con el cálculo; los formatos de salida de los prompts coinciden con las columnas de sus ejemplos; variables usadas = definidas; cada fragmento de «por qué funciona» existe en su prompt; la rúbrica da 8 de 10 («Con ajustes»); cuatro de los ocho pasos llevan prompt.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de extracción | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| B con precio 460 en lugar de 4,60 | Regla 2: copiar cada dato tal como lo dice la oferta, con el separador indicado | Es un error de lectura de un formato mixto (comas decimales y puntos de miles en el mismo texto) que el prompt no puede impedir; la alerta de la hoja lo detecta. **El autor debe decidir si lo considera plausible**, porque la regla existe. |
| Envío de C en 0 («flete por cuenta del cliente, estimado $90») | Regla 5: anotar lo que falte o quede abierto | Interpreta «por cuenta del cliente» como «sin cargo»: una lectura incorrecta de una frase, no una regla violada de forma evidente. Solo se detecta contrastando con la oferta. |
| «Dudas» sin el flete estimado de C ni el impuesto sobre el envío de B | Regla 5: anotar en «Dudas» lo que la oferta deje abierto | Contexto usado a medias: anota lo más visible (impuestos aparte) y omite lo sutil. |
No hay defectos que violen una prohibición explícita (no calcula, no recomienda, no completa con supuestos). Cada frase que atribuye una línea al prompt (no calcula ni recomienda, fragmento literal, «Sin cambios», hipótesis y no decir cuál conviene) se comprobó contra el texto real.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a las tres ofertas de la Heladería Polo Norte (ficticia: negocio, proveedores, textos y precios inventados). No proceden de una conversación real ni de una prueba del autor. El pedido ingenuo (frases de una IA sin necesidad ni hoja) es **ilustrativo** y está escrito a propósito. No se afirma que un proveedor real cobre así ni que estos precios reflejen ningún mercado.

## Imágenes
Carpeta: `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/` (no existe ningún archivo). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `ofertas-recibidas.webp` | Pasos 1 y 2 (datos) | 4:3 |
| `hoja-comparadora.webp` | Paso 3 | 4:3 |
| `extraccion-inicial.webp` | Primer resultado | 16:9 |
| `contraste-con-la-oferta.webp` | Paso 5 (análisis) | 16:9 |
| `resultado-corregido.webp` | Paso 6 | 16:9 |
| `preguntas-a-proveedores.webp` | Paso 7 | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `formulas`, `extraer`, `ajuste`, `preguntas`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (por ejemplo, un comparador propio con ofertas reales anonimizadas y qué se aclaró con los proveedores) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `formulas` | PROGRAMA y la descripción de columnas del caso (sin ofertas) | Tabla y «Cómo pegarla» | Siete fórmulas ES y EN; pruebas correctas; dice qué rangos fijar | Redondeo mal escrito; solo ES; columnas no descritas |
| `extraer` | NECESIDAD, las tres ofertas del caso y SEPARADOR «coma» | Tabla, «Dudas», «Diferencias con la necesidad», «FALTA» | Cuatro filas (C con dos tramos); cifras iguales a las ofertas; sin cálculos; pared doble anotada | Lee 4,60 como 460; pone 0 al envío de C; calcula totales; recomienda |
| `ajuste` | La tabla con PROBLEMAS (B, C y dos dudas); NO_TOCAR «las demás cifras» | «Cambios», «Dudas nuevas», «Sin cambios» | Solo cambia lo señalado; cada cambio con su fragmento literal | Toca otras cifras; inventa un fragmento |
| `preguntas` | NECESIDAD, la tabla final y las columnas de resultado de la hoja | Los cuatro apartados | Cifras idénticas a las de la hoja; ≤3 preguntas por proveedor; sin recomendar; hay límites | Recalcula; dice cuál conviene; supone prácticas del proveedor |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si son plausibles los defectos del primer resultado (ver trazabilidad).
- Los precios, plazos, el impuesto del 12 % y las condiciones de pago son ejemplos ficticios: no reflejan ningún mercado ni proveedor real.
- Las normas de impuestos, contratos y confidencialidad de ofertas varían por país: la guía manda a consultar a un profesional y no las cubre.
- La caja «tiempo» (≈2 horas) es una estimación de la guía; la interactividad (marcas de pasos, rúbrica, «Copiar como tabla», constructor de variables) no se probó en un navegador real más allá del HTML del build.
- Enlaces de vuelta sugeridos desde `definir-precios-y-margenes-con-ia` y `crear-cotizaciones-y-propuestas-con-ia` (no editadas).
