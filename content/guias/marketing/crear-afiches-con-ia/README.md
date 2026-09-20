# Crear afiches con IA que se entienden de un vistazo

**Ruta:** `/marketing/guias/crear-afiches-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). `slug` y `publishedAt` (2026-09-19) se conservan.
**Tipo de guía:** creativa y visual (`creativa-visual`).
**Problema:** el negocio necesita un afiche y no sabe qué información poner ni en qué orden para que se entienda de un vistazo.
**Ángulo propio:** el afiche como mensaje en cuatro niveles (titular, apoyo, acción y contacto, letra pequeña), datos que se copian y no se redactan, una IA que prepara contenido y brief pero no diseña, y dos pruebas humanas (tres segundos y distancia). Complementa a `crear-promociones-con-ia` (decide la oferta) y a `crear-anuncios-con-ia` (canales digitales).

## Cambios de esta regeneración (v3)
- **Se quitaron:** la checklist aparte (repetía la verificación), los tres ejemplos por tipo de negocio, la sección «antes y después» (la imagen `antes-despues.webp` pasa al resultado final), `hero.tools` y las referencias a un teléfono de WhatsApp que competía con la acción.
- **Se añadieron:** ficha de niveles copiable, rúbrica de seis criterios, prompts de brief y de verificación, hoja de revisión copiable, «para quién» y pruebas de prompts.
- **Corrección de fondo del primer resultado:** la versión anterior mostraba un «50 % de descuento», un «envío gratis» y superlativos que el propio prompt prohibía; no era un defecto plausible (6.4). Ahora el primer resultado no inventa nada: sus defectos (oferta repetida, un titular flojo y 39 palabras en los niveles 1 a 3) son los que las reglas del prompt no impiden. El ejemplo del «50 %» pasa a la sección «Antes», como salida ilustrativa de un pedido ingenuo.
- **Corrección de coherencia:** la versión anterior añadía en el resultado final «Ahorras $0.60» (un dato calculado que las reglas del prompt prohíben) y dejaba el brief dentro del mismo prompt; ahora el ahorro no aparece y el brief es un prompt aparte.

## Activo original
Ficha de los cuatro niveles (tabla copiable), rúbrica interactiva de seis criterios (0–12, con bloqueo si «Usa solo mis datos» saca 0) y hoja de revisión antes de imprimir (tabla copiable).

## Prompts (4, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `niveles` | Principal: titulares y texto de los cuatro niveles | NEGOCIO, ACCION, PUBLICO, DATOS_DEL_AFICHE, LUGAR_DE_LECTURA, TONO |
| `recorte` | Iteración: recorta con la prueba de los tres segundos | LIMITE_DE_PALABRAS, PROTAGONISTA |
| `brief` | Adaptación: indicaciones para quien maqueta | AFICHE_FINAL, MARCA, HERRAMIENTA |
| `verificacion` | Verificación: hoja de revisión del texto final | TEXTO_FINAL |

## Ejemplos generados y cifras
Redactados **aplicando literalmente cada prompt** a los datos de la Panadería La Espiga (ficticia). No proceden de una conversación real ni de una prueba del autor.
Las únicas cifras propias son los recuentos de palabras, **verificados con código**: niveles 1 a 3 del primer resultado = 8 + 21 + 10 = **39**; de la versión final = 8 + 11 + 7 = **26**; titulares = 8, 8 y 7 palabras (el límite es 8). El resto (precio, horario, límite por persona) son datos ficticios copiados tal cual, sin cálculos.

## Datos que caducan
Solo uno externo: relación de contraste WCAG 2.2 (4.5:1 texto normal, 3:1 texto grande), consultado el **2026-09-19** en el W3C (página actualizada el 1-jun-2026); no se volvió a consultar en esta regeneración. Son pautas web usadas como referencia; revisar cuando el W3C publique cambios. Las reglas de diseño (cuatro niveles, pruebas, ~30 palabras) son recomendaciones prácticas, no estudios, y así se dice.

## Imágenes
Carpeta: `public/images/guias/marketing/crear-afiches-con-ia/` (no existe ningún archivo; el manifiesto conserva `hero`, `jerarquia` y `antes-despues` y añade las nuevas). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `jerarquia.webp` | Cuatro niveles y dos pruebas | 4:3 |
| `ficha-de-niveles.webp` | Datos | 4:3 |
| `antes-despues.webp` | Resultado final | 16:9 |
| `brief-de-diseno.webp` | Brief | 16:9 |
| `prueba-de-distancia.webp` | Verificación | 16:9 |
| `prueba-prompt-01.webp` … `04` | Junto a cada prompt | 16:9 |

Las cuatro `prueba-prompt-0N.webp` (`promptId`: `niveles`, `recorte`, `brief`, `verificacion`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (un afiche real propio y su prueba de distancia) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `niveles` | Datos del caso o de un negocio real | Titulares, niveles y «De dónde sale cada dato» | Cifras y horarios copiados; titulares ≤ 8 palabras; una acción; sin descuentos ni superlativos | Inventa un descuento o un envío; describe imágenes; dos acciones |
| `recorte` | Respuesta anterior; LIMITE 30; PROTAGONISTA «la oferta con su precio» | Versión final, tabla y prueba | Niveles 1 a 3 ≤ 30 palabras; cuenta bien; ningún dato cambia | Cuenta mal; elimina una condición; repite un dato en dos niveles |
| `brief` | Contenido final; MARCA y HERRAMIENTA del caso | Tabla y «Lo que falta» | Todas las filas; tamaños relativos; sin medidas ni colores inventados | Da puntos o centímetros; afirma que un par de colores cumple |
| `verificacion` | Texto final tal como está en la maqueta | Tabla, condiciones ausentes y veredicto | «Sí» solo con dato exacto; lista lo que debe probar el dueño; no dice que cumple normas | Marca «Sí» por parecer razonable; se salta una condición |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cuatro prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Reglas locales sobre publicidad y precios: la guía dice que varían y no las cubre.
- Enlaces de vuelta sugeridos desde `crear-anuncios-con-ia` y `crear-promociones-con-ia` (no editadas).
