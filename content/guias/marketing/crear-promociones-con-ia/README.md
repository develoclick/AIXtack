# Crear promociones con IA: diseña ofertas que sí te convienen

**Ruta:** `/marketing/guias/crear-promociones-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). `publishedAt` (2026-09-18) y `slug` se conservan; `updatedAt` = 2026-09-19.
**Tipo de guía:** números y datos + decisión (`numeros-datos`, `decision-comparacion`); `handlesNumbers: true`.
**Problema:** se lanza una promoción por lo atractiva que suena y no por lo que le hace al margen; y la IA puede equivocarse al calcular.
**Ángulo propio:** la hoja de cálculo calcula, la IA propone y compara, y la persona decide con sus cifras. Se trabaja por *canasta* (lo que el cliente se lleva en una compra), se convierte todo 2x1 o «gratis» en descuento, «ventas necesarias» es un umbral y no un pronóstico, y las cuentas de la IA se contrastan con la propia hoja antes de decidir.

## Cambios de esta regeneración (v3)
- Se **eliminaron** `video`, `mediaPlan` y la miniatura (contenido audiovisual prohibido en el estándar v3), la sección de herramientas, la de personalización, las variaciones y la checklist aparte (repetían el método y la verificación).
- Se **añadió** una hoja de cálculo con fórmulas en español e inglés, un prompt para pedirlas sin compartir datos, una rúbrica para las cuentas de la IA y la sección «para quién».
- **Corrección de fondo:** la versión anterior comparaba, en el 2x1, el margen de *un* café ($1.90) con el de *dos* cafés ($1.30) y daba «+46.2 %». Con la misma canasta (dos cafés antes y después) es $3.80 → $1.30 y **+192.3 %**. Las demás filas no cambian.
- El primer resultado ya no contiene la predicción «+30 %» (el prompt la prohíbe; queda como ejemplo de la respuesta a un pedido ingenuo, en la sección «Antes»). El error de la IA que se muestra ahora es de cálculo (aplica el 15 % al margen) y se detecta contrastando con la hoja.
- `relatedGuides` y `nextGuide` apuntan solo a guías que existen.

## Activo original
Calculadora de promociones (tabla copiable con fórmulas, para pegar en A1) y rúbrica interactiva de seis criterios (0–12) con una regla de bloqueo: si «Coincide con mi hoja» saca 0, no se usan las cifras.

## Verificación de cifras (todas ficticias; verificado con código)
Todas las cifras se calcularon con un script en Node (no de memoria) y se comprobaron en dos sentidos: sumas y restas cruzadas, y porcentajes recalculados desde precio y costo. Fórmulas: `margen = precio − costo` · `descuento real = (precio normal − precio con promoción) ÷ precio normal` · `ventas necesarias = margen antes ÷ margen después − 1`.

| Promoción (canasta) | Precio normal | Con promoción | Costo | Descuento | Margen antes → después | Ventas necesarias |
| --- | --- | --- | --- | --- | --- | --- |
| A · 2x1 (2 cafés) | 5.00 | 2.50 | 1.20 | 50 % | 3.80 → 1.30 | +192.3 % |
| B · Combo café + croissant | 4.50 | 4.00 | 1.30 | 11.1 % | 3.20 → 2.70 | +18.5 % |
| C · 15 % desayuno completo | 7.50 | 6.375 | 2.40 | 15 % | 5.10 → 3.975 | +28.3 % |
| D · 5.º café gratis (5 cafés) | 12.50 | 10.00 | 3.00 | 20 % | 9.50 → 7.00 | +35.7 % |

- **Error ilustrativo de la IA (fila C):** aplicar el 15 % al margen da 5.10 × 0.85 = 4.335 (→ $4.34) y 5.10 ÷ 4.335 − 1 = 17.6 %. Es el error que la guía enseña a detectar; no es una cifra correcta.
- **Recomendación B:** hoy 20 × 3.20 = 64.00; en 24 pedidos, 24 × 2.70 = 64.80; umbral 20 × 3.20 ÷ 2.70 = 23.70 pedidos; a 22 pedidos, 22 × 2.70 = 59.40.
- **Ejemplos:** restaurante (margen 9.00 − 3.60 = 5.40; bebida incluida con costo 0.50 → 4.90, +10.2 %; 15 % → precio 7.65 y margen 4.05, +33.3 %); servicio (margen 60 − 12 = 48; 20 % → precio 48.00 y margen 36.00, +33.3 %).
- **Números de práctica de la hoja:** precio 10 y costo 4 → margen 6; con precio 8 → descuento 0.2, margen 4, ventas necesarias 0.5; costos 4 + 1.5 = 5.5.
- **Fórmulas de la hoja:** están escritas en español e inglés y son equivalentes a las de arriba (comprobadas con esos números de práctica en Node). No se ejecutaron en Excel ni en Google Sheets: el autor debe pegar la calculadora en su programa y comprobar que da las cifras de la tabla (la fila C debe dar 3.975 y 28.3 %).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `formulas` | Ayuda con las fórmulas de la hoja sin compartir datos | PROGRAMA, COLUMNAS |
| `alternativas` | Principal: cuatro promociones de tipos distintos, sin cálculos | NEGOCIO, PUBLICO, PRODUCTOS_Y_COSTOS, OBJETIVO, FRANJA, LIMITES |
| `cuentas` | Evaluación: calcula las tres cuentas y marca los límites | PRECIOS_CON_PROMOCION, LIMITES |
| `decision` | Iteración: recomienda con tus cifras, qué medir y tu parada | MIS_CIFRAS, VENTAS_ACTUALES, DURACION, PARADA |

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a los datos de Café Mirador (ficticio). No proceden de una conversación real ni de una prueba del autor. Defectos del primer resultado: el 2x1 se propone sin advertir que rebasa el límite de 20 % (el prompt de alternativas no obliga a convertirlo; eso lo hace el de cuentas) y la fila C mal calculada (el prompt fija la fórmula, pero un error de ejecución no se puede prevenir del todo).

## Imágenes
Carpeta: `public/images/guias/marketing/crear-promociones-con-ia/` (no existe ningún archivo: las imágenes de la versión anterior nunca se subieron; el manifiesto se rehízo con la nueva estructura). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `datos-necesarios.webp` | Datos | 4:3 |
| `calculadora-de-promociones.webp` | Hoja de cálculo | 4:3 |
| `cuatro-promociones.webp` | Primer resultado | 16:9 |
| `cuentas-de-la-ia-y-mi-hoja.webp` | Análisis | 16:9 |
| `decision-con-tus-cifras.webp` | Resultado final | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `formulas`, `alternativas`, `cuentas`, `decision`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito (no había pruebas reales que conservar). El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` y `revisadoEn`. Hasta entonces los prompts se presentan como «diseñados para».

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `formulas` | PROGRAMA y COLUMNAS del caso (sin cifras) | Tabla y «Cómo pegarla» | Fórmulas en español e inglés; comprobación con números de práctica correcta; sin cifras del negocio | Usa una columna no descrita; separador equivocado; división por cero sin tratar |
| `alternativas` | Datos del caso | Las cuatro promociones | Tipos distintos; cada una con su canasta; sin cálculos ni predicciones; precios y porcentajes como «dato que me falta» | Inventa un precio o un porcentaje; promete ventas |
| `cuentas` | Alternativas + PRECIOS_CON_PROMOCION del caso | Tabla y cuentas paso a paso | Cuatro filas coherentes con la hoja; 2x1 convertido a 50 %; sin predicción | Descuento aplicado al margen; canasta equivocada; cifra distinta a la hoja |
| `decision` | Tabla de la hoja, ventas actuales, duración y parada del caso | Todas las secciones | Solo tus cifras; lista diferencias; parada tuya; «Para comprobar tú» | Recalcula tus cifras; inventa un umbral; predice ventas |

## Pendiente de revisión humana antes de desplegar
- Confirmar `publishedAt` (2026-09-18) y `updatedAt` (2026-09-19).
- Pegar la calculadora en Excel o Google Sheets y comprobar las cifras (ver arriba).
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Reglas locales sobre promociones y precios: la guía indica que varían por país y no las cubre.
- Enlaces de vuelta sugeridos desde `crear-anuncios-con-ia` y `crear-afiches-con-ia` (no editadas).
