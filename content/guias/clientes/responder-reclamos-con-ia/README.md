# Responder reclamos de clientes con IA

**Ruta:** `/clientes/guias/responder-reclamos-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). Guía nueva, creada el 2026-09-19 (`publishedAt` y `updatedAt`).
**Tipo de guía:** comunicación y atención al cliente + tema sensible (`comunicacion-atencion`, `tema-sensible`). No es de números (`handlesNumbers` no se marca): las únicas cuentas son fechas y días hábiles del caso, verificadas con código.
**Problema:** el negocio recibe un reclamo y, en caliente, discute, ofrece de más o promete lo que no puede cumplir; una IA a la que se le pega solo el enojo inventa causas, ofertas y promesas.
**Ángulo propio:** pausa → hechos → decisión propia → respuesta. Una *ficha* separa cada afirmación del cliente (Confirmado / Parcial / No confirmado) de sus emociones; una *tarjeta de decisión* escrita por la persona dueña fija qué reconoce, qué ofrece (con condición y plazo) y qué no; la IA solo redacta desde ambas; respuesta privada y pública distintas. Diferencia frente a `responder-consultas-de-clientes-con-ia` (preguntas repetidas contestadas desde una base, sin conflicto ni decisión) y `analizar-opiniones-de-clientes-con-ia` (muchas opiniones, sin responder a una).

## Activo original
Ficha del reclamo copiable, tarjeta de decisión copiable, registro de hechos copiable y rúbrica interactiva de cinco criterios (0–10; bloqueo si «Cada hecho sale de tu ficha» u «Ofrece solo lo que decidiste» sacan 0).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `ficha` | Análisis: separa hechos, versión y emoción; no redacta | NEGOCIO, POLITICAS, RECLAMO, REGISTROS |
| `privada` | Principal: un borrador con tabla USADO | CANAL, TONO, FICHA, TARJETA |
| `ajuste` | Iteración: corrige solo lo señalado | PROBLEMAS, NO_TOCAR |
| `publica` | Adaptación: respuesta breve a una reseña, sin datos ni ofertas | RESENA, LO_QUE_PUEDO_DECIR, CANAL_PRIVADO, YA_ESCRIBI |

No hay prompt de evaluación: la evaluación es la rúbrica manual. La pausa, la decisión y la verificación no llevan prompt a propósito.

## Verificación de consistencia (todo ficticio; verificado con código)
Más de 80 comprobaciones en Node/TypeScript (script temporal, ya eliminado), todas correctas:
- **Calendario:** todas las menciones «día + número» de la guía (lunes 1, martes 2, jueves 4, viernes 5, sábado 6, martes 9, miércoles 10…) coinciden con **junio de 2026** (el día 1 es lunes).
- **Días hábiles:** despacho prometido = lunes 1 + 1 día hábil = martes 2; llegada prometida = despacho + 2 a 3 días hábiles = jueves 4 a viernes 5; despacho real viernes 5 (3 días hábiles tarde); la mensajería tardó 2 días hábiles (viernes 5 → martes 9), dentro de lo que promete la web: el retraso fue del negocio, no de la mensajería. Respuesta al mensaje del jueves: 15 h 25 min después (18:40 → 10:05).
- **Ficha contra registro:** cada punto tiene el estado que muestran las 8 líneas del registro (1 y 3 Confirmados, 2 y 4 Parciales, 5 No confirmado); cada hora citada existe; el registro tiene un solo mensaje del cliente antes del reclamo y ninguna línea sobre la caja golpeada.
- **Borrador y corrección:** la respuesta final es exactamente el borrador con los dos cambios de la tabla; palabras: 96 el borrador y 134 la final (límite 160); la oferta (5 días hábiles, cupón del 10 %, 60 días) y el «no» al reembolso total coinciden con la tarjeta; no hay culpas a terceros, promesas futuras ni causas inventadas.
- **Pública:** 37 palabras (límite 70), sin cifras, sin la palabra «estafa» y sin ofertas; reconoce solo lo permitido.
- **Rúbrica:** puntajes 2, 2, 1, 1, 2 = **8 de 10** («Con ajustes», umbrales 0/6/9); análisis y rúbrica comparten criterios y orden.
- **Prompts:** variables usadas = definidas; cada fragmento de «por qué funciona» existe en el prompt; los formatos de salida coinciden con las columnas de sus ejemplos; los campos que citan los prompts existen en la tarjeta; cuatro de los ocho pasos llevan prompt, como dicen el título y la introducción.

## Trazabilidad del primer resultado (defecto → regla del prompt → por qué no lo impide del todo)
| Defecto | Regla del prompt de respuesta privada | Por qué el prompt no lo impide del todo |
| --- | --- | --- |
| No responde al punto 4 de la ficha («escribí tres veces y nadie contestó», Parcial) | Regla 5: contestar cada punto de la ficha | Contexto usado a medias: el modelo atiende los puntos más visibles (retraso, reembolso, caja) y omite el Parcial. El autor debe decidir si lo considera plausible, porque la regla existe. |
| Apertura genérica («las molestias que esto pudo causarte») | Regla 7(a): reconocer lo que vivió el cliente | Cumple la regla en la forma, no en el fondo (reconoce en general y con un «pudo» que lo pone en duda): una alternativa débil que el prompt no puede impedir. Solo la rúbrica («Nombra el hecho concreto») lo detecta. |
No hay defectos que violen una regla explícita de forma evidente (no inventa causas, no ofrece de más, no culpa a la mensajería). Cada frase que atribuye una línea al prompt (contestar cada punto, no afirmar lo No confirmado, ofrecer solo lo de la tarjeta, cita de fila/campo en «Motivo», sin ofertas en público) se comprobó contra el texto real.

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** al registro, a la ficha y a la tarjeta de Luz de Barrio (ficticio: negocio, cliente, fechas, reseña y decisión inventados). No proceden de una conversación real ni de una prueba del autor. El pedido ingenuo (frases de una IA sin hechos) es **ilustrativo** y está escrito a propósito.

## Imágenes
Carpeta: `public/images/guias/clientes/responder-reclamos-con-ia/` (no existe ningún archivo). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `registro-de-hechos.webp` | Pasos 1 y 2 | 4:3 |
| `ficha-del-reclamo.webp` | Paso 3 | 16:9 |
| `tarjeta-de-decision.webp` | Pasos 4 y 5 | 4:3 |
| `borrador-inicial.webp` | Primer resultado | 16:9 |
| `contraste-con-la-tarjeta.webp` | Paso 6 (análisis) | 16:9 |
| `respuesta-corregida.webp` | Resultado final | 16:9 |
| `respuesta-publica.webp` | Paso 7 | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `ficha`, `privada`, `ajuste`, `publica`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (un reclamo propio anonimizado y qué se decidió) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `ficha` | El reclamo, los registros y las políticas del caso | Tabla, «Emociones y juicios», «Lo que pide», «Para una persona», «FALTA» | Cinco puntos; la caja golpeada «No confirmado»; «estafa» fuera de los puntos; sin culpas ni respuesta | Marca «Confirmado» lo que no está en el registro; trata «estafa» como hecho; redacta |
| `privada` | La ficha y la tarjeta del caso; CANAL WhatsApp; TONO de tú | Respuesta, tabla USADO, «FALTA» | Solo lo Confirmado y lo decidido; el «no» con las palabras de la tarjeta; ≤160 palabras; un único paso | Añade descuentos o plazos; culpa a la mensajería; afirma la caja golpeada; promete que no volverá a pasar |
| `ajuste` | El borrador con PROBLEMAS (punto 4 y apertura); NO_TOCAR ofertas y paso final | Cambios y «Sin cambios» | Solo cambia lo señalado; cada motivo cita fila o campo | Toca una oferta; añade datos que no están en la ficha |
| `publica` | La reseña del caso; LO_QUE_PUEDO_DECIR; CANAL_PRIVADO WhatsApp; YA_ESCRIBI «sí» | Respuesta pública y «Lo que dejé fuera» | ≤70 palabras; sin fechas ni cifras; sin ofertas; sin repetir «estafa» | Menciona el cupón o el reembolso; explica el motivo; discute con el cliente |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Decidir si «omite el punto de los tres mensajes» es un defecto plausible del primer resultado (ver trazabilidad).
- La decisión de la dueña (devolver el costo del envío, cupón del 10 % por 60 días, no devolver el total) es un ejemplo ficticio, no una recomendación de qué compensar.
- Las reglas de consumo, de disputas de pago y de respuesta a reseñas varían por país y plataforma: la guía manda a consultarlas y no las cubre. No es asesoría legal.
- La caja «tiempo» (≈1 hora por reclamo) es una estimación de la guía; la interactividad (marcas de pasos, rúbrica, «Copiar como tabla», constructor de variables) no se probó en un navegador real más allá del HTML del build.
- Enlaces de vuelta sugeridos desde `responder-consultas-de-clientes-con-ia` y `analizar-opiniones-de-clientes-con-ia` (no editadas).
