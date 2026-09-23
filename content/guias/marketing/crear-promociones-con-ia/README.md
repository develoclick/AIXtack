# Crear promociones con IA: diseña ofertas que sí te convienen

**Ruta:** `/marketing/guias/crear-promociones-con-ia`
**Estado:** `published`. **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3`. `publishedAt` = 2026-09-18 y `slug` se conservan; `updatedAt` = 2026-09-23.
**Tipo de guía:** números y datos + decisión (`numeros-datos`, `decision-comparacion`); `handlesNumbers: true`.
**Problema:** se lanza una promoción por lo atractiva que suena y no por lo que le hace al margen; y la IA puede equivocarse al calcular.
**Ángulo propio:** la hoja calcula, la IA propone y compara, y la persona decide con sus cifras. Se trabaja por *canasta*, todo 2x1 o «gratis» se convierte en descuento, «ventas necesarias» es un umbral y no un pronóstico, y las cuentas de la IA se contrastan con la hoja antes de decidir.

## Cambios de esta revisión (2026-09-23)
- **Pruebas reales.** Los cuatro prompts se probaron en un asistente de IA y las capturas (`prueba-prompt-01`, `02`, `03`, `04` y `04b`) sustituyen a los antiguos «ejemplos generados». Cada bloque `kind: "real"` es la transcripción literal de su captura: `formulasResult` (01), `firstResult` (02), `cuentasResult` (03) e `improvedResult` (04 y 04b).
- **El caso cambió.** Las cuatro promociones ya no son 2x1 / combo / 15 % / quinto café gratis, sino las que propuso la IA: A combo de media mañana, B desayuno completo con 15 %, C tarjeta de fidelidad, D ven acompañado. El 2x1 queda solo como ejemplo general (marco, «Antes», tabla de tipos, reglas del prompt).
- **Rúbrica:** en la prueba real los seis criterios salen CORRECTO; se añadió «Ilustración: el error más frecuente» (caso ficticio) con la cuenta que la IA no cometió.
- **Comparativa «Cuentas de la IA / Mi hoja»** (`comparisons.cuentasVsHoja`), como tabla HTML. La columna de la IA es la transcripción; la de la hoja son las mismas filas recalculadas con las fórmulas de la calculadora.
- **Condición de parada:** «menos de 24 pedidos por semana tras dos semanas» (antes 22). El punto de equilibrio es 23.7 pedidos.
- Se retiraron los huecos de imagen sin archivo (`cuatro-promociones`, `decision-con-tus-cifras`, `calculadora-de-promociones`, `cuentas-de-la-ia-y-mi-hoja`).
- «Tres negocios» → «Otros dos negocios». El ejemplo de variable del glosario pasa de `{{FICHA}}` a `{{COLUMNAS}}`.

## Activo original
Calculadora de promociones (tabla copiable con fórmulas, para pegar en A1) y rúbrica interactiva de seis criterios (0–12) con una regla de bloqueo: si «Coincide con mi hoja» saca 0, no se usan las cifras.

## Verificación de cifras (todas ficticias; verificado con código)
Todas las cifras se recalcularon con un script (Python) desde precio y costo, y coinciden con las capturas reales. Fórmulas: `margen = precio − costo` · `descuento real = (precio normal − precio con promoción) ÷ precio normal` · `ventas necesarias = margen antes ÷ margen después − 1`.

| Promoción (canasta) | Precio normal | Con promoción | Costo | Descuento | Margen antes → después | Ventas necesarias |
| --- | --- | --- | --- | --- | --- | --- |
| A · Combo (1 café + 1 croissant) | 4.50 | 4.00 | 1.30 | 11.11 % | 3.20 → 2.70 | 18.52 % |
| B · Desayuno completo con 15 % | 7.50 | 6.375 | 2.40 | 15.00 % | 5.10 → 3.975 | 28.30 % |
| C · Tarjeta (5 visitas, la 5.ª gratis) | 22.50 | 18.00 | 6.50 | 20.00 % | 16.00 → 11.50 | 39.13 % |
| D · Ven acompañado (2 cafés + 2 croissants, 2.º croissant gratis) | 9.00 | 7.00 | 2.60 | 22.22 % | 6.40 → 4.40 | 45.45 % |

- Costos: café 0.60 + croissant 0.70 = 1.30; con jugo 1.10 = 2.40; C = 5 × 1.30 = 6.50; D = 2 × 0.60 + 2 × 0.70 = 2.60. Precios normales: C = 5 × (2.50 + 2.00) = 22.50; D = 2 × 2.50 + 2 × 2.00 = 9.00.
- **Límite del 20 %:** A, B y C lo respetan (C queda justo en 20.00 %); D no (22.22 %).
- **Error ilustrativo (fila B):** aplicar el 15 % al margen da 5.10 × 0.85 = 4.335 (la guía muestra 4.34) y 5.10 ÷ 4.335 − 1 = 17.6 %. Lo correcto: 6.375 − 2.40 = 3.975 → 28.3 %. La IA **no** cometió este error en la prueba real.
- **Recomendación A:** hoy 20 × 3.20 = 64.00; con la promoción y 20 pedidos, 20 × 2.70 = 54.00; en 24 pedidos, 24 × 2.70 = 64.80; punto de equilibrio 64 ÷ 2.70 = 23.70 pedidos.
- **«Mi hoja» de la comparativa:** margen después A 2.70, B 3.975 (se muestra 3.98), C 11.50, D 4.40; ventas necesarias 18.5 %, 28.3 %, 39.1 %, 45.5 % (un decimal, como la hoja). Coinciden con las de la IA salvo redondeo.
- **Ejemplos** (sin cambios): restaurante (margen 9.00 − 3.60 = 5.40; bebida con costo 0.50 → 4.90, +10.2 %; 15 % → precio 7.65 y margen 4.05, +33.3 %); servicio (margen 60 − 12 = 48; 20 % → precio 48.00 y margen 36.00, +33.3 %).
- **Números de práctica de la hoja:** precio 10 y costo 4 → margen 6; con precio 8 → descuento 0.2, margen 4, ventas necesarias 0.5; costos 2 + 3 = 5.
- **Fórmulas de la calculadora:** no se ejecutaron en Excel ni en Google Sheets desde este repositorio. El autor debe pegar la calculadora en su programa y comprobar que da las cifras de la tabla (la fila B debe dar 3.975 y 28.3 %). Ojo: la calculadora escribe «pérdida» en H y el prompt de la prueba real devolvió «pérdida por venta»; es solo el texto del aviso.

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `formulas` | Ayuda con las fórmulas de la hoja sin compartir datos | PROGRAMA, COLUMNAS |
| `alternativas` | Principal: cuatro promociones de tipos distintos, sin cálculos | NEGOCIO, PUBLICO, PRODUCTOS_Y_COSTOS, OBJETIVO, FRANJA, LIMITES |
| `cuentas` | Evaluación: calcula las tres cuentas y marca los límites | PRECIOS_CON_PROMOCION, LIMITES |
| `decision` | Iteración: recomienda con tus cifras, qué medir y tu parada | MIS_CIFRAS, VENTAS_ACTUALES, DURACION, PARADA |

## Pruebas reales
Las cinco capturas son del autor y se transcribieron literalmente. Observaciones de la transcripción: la respuesta al prompt `alternativas` añadió una fila «Tipo» y una línea «Dato común» que el formato pedido no incluía; se transcribieron tal cual. Los valores de ejemplo de las variables (`PRECIOS_PROMO`, `PRODUCTOS_Y_COSTOS`) se dedujeron de las cifras de las capturas y de la calculadora: no se conserva el texto exacto que el autor pegó.

## Imágenes
Carpeta: `public/images/guias/marketing/crear-promociones-con-ia/`. WebP, máx. 1600 px de ancho (`datos-necesarios.webp` se redujo de 1897 a 1600 px sin cambiar su contenido).

| Archivo | Sección | Qué es |
| --- | --- | --- |
| `hero.webp` | Cabecera (og:image y JSON-LD) | Ilustración canasta → cuentas → decisión (caso ficticio) |
| `datos-necesarios.webp` | Datos | Hoja «Datos del caso — Café Mirador» |
| `prueba-prompt-01.webp` | Paso 2 | Prueba real: fórmulas |
| `prueba-prompt-02.webp` | Paso 3 | Prueba real: alternativas |
| `prueba-prompt-03.webp` | Paso 4 | Prueba real: cuentas (634 px de ancho: conviene recapturar) |
| `prueba-prompt-04.webp` y `04b.webp` | Paso 5 | Prueba real: decisión, en dos capturas (unos 520 px de ancho: conviene recapturar) |

Pendiente de recibir (no se publican): `calculadora-de-promociones.webp` (las capturas recibidas mostraban las promociones antiguas, 2x1 / combo / 15 % / quinto café gratis, que ya no coinciden con la guía) y una ilustración «tres cuentas» (01 / 02 / 03) que no tiene slot.

## Evidencia del autor
`evidence` está vacío a propósito: falta la fecha y el asistente de las pruebas. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` y `revisadoEn`; la nota de metodología del caso no nombra asistente ni fecha hasta entonces.

## Pendiente de revisión humana
- Pegar la calculadora en Excel o Google Sheets y comprobar las cifras.
- Frase «es el que más aparece» del recuadro «el error más frecuente»: es texto del autor, sin fuente citada.
- Recapturar `prueba-prompt-03` y `prueba-prompt-04/04b` a 1000 px de ancho o más.
- Reglas locales sobre promociones y precios: la guía indica que varían por país y no las cubre.
- Enlaces de vuelta sugeridos desde `crear-anuncios-con-ia` y `crear-afiches-con-ia` (no editadas).
