# Crear cotizaciones y propuestas comerciales con IA

**Ruta:** `/ventas/guias/crear-cotizaciones-y-propuestas-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3).
**Tipo de guía:** números y datos + comunicación (`numeros-datos`, `comunicacion-atencion`); `handlesNumbers: true`.
**Problema:** un cliente pide precio y hay que enviar un documento claro, completo y sin errores; una IA a la que se le pide calcular y redactar en el mismo mensaje puede elegir una interpretación razonable de un descuento o completar condiciones que nadie decidió.
**Ángulo propio:** dos capas. Las cifras se calculan en una hoja (fórmulas en español e inglés, comprobadas con números de práctica); las condiciones las decide la persona (entrevista con «Pendiente» visible); la IA solo redacta con esas dos fuentes y luego contrasta cada cifra y cada frase. Parte de un precio ya decidido: no enseña a fijarlo (no hay guía de precios publicada) ni es asesoría legal o tributaria.

## Activo original
Calculadora de cotización copiable (fórmulas ES/EN), tabla de condiciones copiable con lo confirmado y lo pendiente, y rúbrica interactiva de cinco criterios (0–10; bloqueo si «Las cifras coinciden con la hoja» o «Solo condiciones confirmadas» sacan 0).

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `formulas` | Ayuda con las fórmulas sin compartir datos | PROGRAMA, COLUMNAS_Y_CELDAS |
| `condiciones` | Entrevista: completa las 8 condiciones y marca los pendientes | TRABAJO, LO_QUE_YA_DECIDI |
| `cotizacion` | Principal: cotización o propuesta con las cifras copiadas de la hoja | NEGOCIO, CLIENTE_Y_PEDIDO, TIPO, TONO, HOJA, CONDICIONES |
| `revision` | Evaluación: cifra por cifra contra la hoja y rúbrica | DOCUMENTO, HOJA |
| `ajuste` | Iteración: corrige solo las frases señaladas | PROBLEMAS, NO_TOCAR |

## Verificación de cifras y fórmulas (todo ficticio; verificado con código)
38 comprobaciones en Node, todas correctas. Las cifras se calculan en `data.ts` a partir de las partidas y los porcentajes y se recalcularon aparte, sin usar sus constantes.
- **Caso:** líneas 1350 + 600 + 700 + 300 → subtotal **2950**; base del descuento 1950 (solo los dos módulos); descuento 10 % = **195**; base del impuesto **2755**; impuesto 20 % = **551**; total **3306**; anticipo 40 % = 1322,4 → redondeado **1322**; saldo **1984** (1322 + 1984 = 3306).
- **Fórmulas evaluadas tal como se pegan:** la calculadora (filas 2 a 13) se evaluó celda por celda con un evaluador propio, en español (`SUMA`, `SUMAR.SI`, `REDONDEAR`) y en inglés (`SUM`, `SUMIF`, `ROUND`), y da las cifras de arriba. No se ejecutaron en Excel ni en Google Sheets: el autor debe pegar la calculadora en su programa y comprobar 2950, 195, 3306 y 1322.
- **Números de práctica:** las nueve fórmulas de la tabla dan las cifras que declaran (40, 100, 40, 4, 96, 24, 120, 53 y 52), en español y en inglés. El redondeo de práctica (52,5 → 53) sigue el criterio de redondear hacia arriba en la mitad; el de cada programa debe comprobarse.
- **Pedido ingenuo (ilustrativo):** si la IA aplica el 10 % a todo el subtotal, escribe descuento 295, base 2655, impuesto 531 y total 3186 frente a 195, 2755, 551 y 3306: **120 de menos**. El error está escrito a propósito; el subtotal (2950) coincide.
- **Fechas:** 12 de marzo + 15 días = 27 de marzo (mismo mes).
- **Documento de ejemplo:** cada importe y cada total del primer resultado es el de la hoja. Con la sustitución del ajuste, el documento final dice «sobre el total» y no contiene la frase de calidad; ni el primero ni el final escriben plazo ni garantía (pendientes).
- **Rúbrica:** puntajes 1, 2, 2, 2, 1 = **8 de 10** («Con ajustes»); tras el ajuste, 10 de 10. El prompt de revisión lista los mismos cinco criterios, los mismos umbrales (0/6/9) y la misma regla de bloqueo.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de cotización | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| «Anticipo del 40 % sobre el subtotal (1322)»: la cifra es correcta y la base descrita no (40 % de 2950 serían 1180) | Regla 1: copiar cada importe y porcentaje tal como está en la hoja, con su concepto; formato: «cada porcentaje va con su importe y su base» | Es una cifra correcta con otro alcance. Puede parafrasearse la base al escribir la condición de pago aunque la cifra se copie. El autor debe decidir si lo considera plausible. |
| «Trabajamos solo con materiales de primera calidad» | Regla 3: no adjetivos que afirmen una calidad que los datos no contienen | Una frase comercial habitual con lenguaje afectivo cae en la zona gris entre tono y promesa. |
Cada frase de análisis o de explicación que atribuye una línea al prompt («como pide», los fragmentos citados) se comprobó contra el texto real del prompt.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** al caso de Maderas Rivera (ficticio: negocio, cliente, precios, porcentajes, fechas y condiciones inventados). No proceden de una conversación real ni de una prueba del autor. Las respuestas de los prompts de fórmulas, condiciones y revisión no se reproducen enteras: se muestran la tabla de fórmulas, la de condiciones y el análisis por criterio.

## Imágenes
Carpeta: `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/` (no existe ningún archivo). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `datos-necesarios.webp` | Datos | 4:3 |
| `calculadora-de-cotizacion.webp` | Paso 2 (hoja) | 4:3 |
| `borrador-de-cotizacion.webp` | Primer resultado | 16:9 |
| `revision-de-cifras.webp` | Análisis | 16:9 |
| `cotizacion-final.webp` | Resultado final | 16:9 |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 |

Las cinco `prueba-prompt-0N.webp` (`promptId`: `formulas`, `condiciones`, `cotizacion`, `revision`, `ajuste`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (una cotización propia, con su hoja y qué preguntó el cliente) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `formulas` | PROGRAMA y las columnas del caso, sin cifras | Tabla y «Cómo pegarla» | Fórmulas en español e inglés; comprobación con números de práctica correcta; descuento solo en líneas «Sí» | Aplica el descuento a todo; separador equivocado |
| `condiciones` | TRABAJO del caso y LO_QUE_YA_DECIDI; responder «todavía no lo decidí» al plazo y a la garantía | Preguntas, tabla y «Pendiente» | Una pregunta por turno; 8 condiciones; plazo y garantía «Pendiente» | Propone plazos o garantías; asegura qué es habitual en tu país |
| `cotizacion` | La tabla de la calculadora, la de condiciones, tipo «Cotización» y luego «Propuesta» | Documento completo y «FALTA» | Importes y totales idénticos a la hoja; sin plazo ni garantía; dice cómo aceptar y hasta cuándo vale | Cambia una base; añade una garantía o un plazo; recalcula |
| `revision` | El documento y la hoja | Tabla de cifras, frases con problema y rúbrica | Compara línea por línea; cita fragmentos; NO ENVIAR si un bloqueo saca 0 | Marca «coincide» donde no; reescribe el documento |
| `ajuste` | PROBLEMAS con las dos frases; NO_TOCAR «la hoja, el detalle y los totales» | Cambios, «Sin cambios» y «FALTA» | Solo cambia lo señalado; sin cifras nuevas | Cambia cifras; sustituye una promesa por otra |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Pegar la calculadora en Excel o Google Sheets y comprobar 2950, 195, 3306, 1322 y 1984, y el redondeo de tu programa.
- Probar los cinco prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si «base del anticipo descrita mal» es un defecto plausible del primer resultado (ver trazabilidad).
- Impuestos, facturación, garantías legales y cláusulas varían por país: la guía manda a confirmarlos con un profesional y no los cubre. Las tasas del ejemplo (10 %, 20 % y 40 %) son ficticias.
- La caja «tiempo» (≈2 horas la primera vez, ≈20 minutos con la hoja armada) es una estimación de la guía.
- Enlaces de vuelta sugeridos desde `crear-descripciones-de-productos-con-ia`, `crear-promociones-con-ia` y `responder-consultas-de-clientes-con-ia` (no editadas).
