# Crear anuncios para tu negocio con IA

**Ruta:** `/marketing/guias/crear-anuncios-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3).
**Tipo de guía:** comunicación con una parte de decisión (`comunicacion-atencion`, `decision-comparacion`).
**Problema:** se necesita anunciar una oferta y la IA devuelve textos que exageran, prometen o dejan fuera condiciones.
**Ángulo propio (frente a `crear-publicaciones-para-redes-sociales-con-ia`):** un anuncio llega a un público que no conoce el negocio, así que debe bastarse solo. La guía trabaja la oferta completa con sus condiciones, el beneficio frente a la promesa, el respaldo real, la persuasión con datos verdaderos (sin escasez inventada), la adaptación por canal según a quién llega y la prueba A/B de un solo elemento. No enseña tono ni voz de marca (eso está en la guía de publicaciones).

## Activo original
Ficha de anuncio de siete campos («Copiar como tabla»), rúbrica interactiva de seis criterios con umbrales (0–12) y hoja de afirmaciones (tabla copiable con afirmación, tipo, si está en la ficha y qué debe comprobar la persona).

## Estructura
23 secciones agrupadas en 7 partes: Entender el problema · Preparar · Hacer · Mejorar · Adaptar y probar · Verificar y aplicar · Referencia. Sin `hero.tools`, sin checklist aparte (los pasos del método son la checklist de proceso), sin fuentes (no hay datos externos que caduquen), sin sección de antes/después (lo cubren «Cómo se pide normalmente» y el análisis), sin video.

## Fuente única de verdad (`data.ts`)
Los campos de la ficha (`CAMPOS_FICHA`), los criterios (`CRITERIOS`), los umbrales (`RESULTADOS`), los tipos de afirmación (`TIPOS`) y el caso (`CASO`) se definen una vez y los leen la plantilla, la rúbrica, el análisis, el caso y los prompts.

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `anuncio` | Principal: una versión por enfoque | FICHA, ENFOQUES, CANAL |
| `persuasion` | Iteración: refuerza una palanca con respaldo | ANUNCIO, PALANCA |
| `canales` | Adaptación: lleva el anuncio a cada canal | ANUNCIO_FINAL, CANALES, LIMITES_DEL_CANAL |
| `variantes` | Preparación de una prueba A/B | ANUNCIO_A, ELEMENTO, SENAL |
| `afirmaciones` | Verificación: lista y comprueba cada afirmación | ANUNCIOS |

No hay prompt de entrevista: si falta la oferta, sus condiciones o la acción, el prompt principal se detiene y pregunta (regla 2).

## Ejemplos generados
Los ejemplos (dos versiones, refuerzo, canales, prueba A/B, hoja de afirmaciones) están redactados **aplicando literalmente cada prompt** a los datos del caso ficticio (Ferretería Casa y Clavo). No proceden de una conversación real ni de una prueba del autor. Defectos del primer resultado (gancho genérico en la versión 1; «12 años de experiencia» en la 2 frente a «12 años atendiendo en el mismo local» de la ficha; tono de catálogo) son los que las reglas del prompt no pueden impedir del todo: prohíben superlativos, promesas e invención, pero no obligan a un gancho concreto ni a la paráfrasis exacta. Fechas verificadas: el sábado 10 de octubre de 2026 es sábado.

## Imágenes
Carpeta: `public/images/guias/marketing/crear-anuncios-con-ia/`. WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta. El manifiesto (`data.images`) lleva la descripción completa de cada una.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 — pendiente: regenerar a partir de `<HeroArt>` (ver `components.tsx`); el actual tiene filas de la ficha cruzadas |
| `ficha-completa.webp` | Datos | 4:3 — real (captura de la hoja de cálculo) |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 — reales, transcritas en `docs/crear-anuncios/transcripciones.md` |

**Ya no hay imagen para el primer resultado, la rúbrica aplicada, el refuerzo, la adaptación por canal ni la hoja de afirmaciones.** Esas cinco ilustraciones (`rubrica-aplicada.webp`, `dos-enfoques.webp`, `persuasion-con-respaldo.webp`, `canales.webp`, `hoja-de-afirmaciones.webp`) contradecían las capturas reales y se borraron; ahora son componentes HTML/CSS con texto real (`RubricaAplicada`, `ErrorFrecuente`, `TrazabilidadRefuerzo`, `CanalesPiezas`, `CorreccionAntesDespues` en `./components.tsx`), con sus datos en `data.ts` (exports con nombre, fuera de `defineGuide()`).

Las cinco `prueba-prompt-0N.webp` (`promptId`: `anuncio`, `persuasion`, `canales`, `variantes`, `afirmaciones`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

**Pendiente de decisión del autor:** `ab-ganch.webp` y `correccion-antes-despues.webp` existen en la carpeta pero ningún archivo del código los usa; son ilustraciones del mismo tipo que las cinco borradas (con texto que no coincide con las capturas reales). Falta decidir si se borran también.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito, aunque ya existen las cinco pruebas reales (capturas + transcripción). El autor puede añadir en `data.evidence`: `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` y `revisadoEn`. Hasta entonces los prompts se presentan como «diseñados para» y no se afirma compatibilidad con ningún asistente.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar. Datos: los del caso (`CASO` en `data.ts`) o los de un negocio real del autor.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `anuncio` | Ficha del caso; ENFOQUES «beneficio; oferta y fecha»; CANAL «anuncio en red social con una imagen» | Las dos versiones con «Datos usados» y «Supuestos» | Solo datos de la ficha; cifras y condiciones tal cual; dice qué es el negocio y dónde está; una sola acción | Superlativos o prisa; condición resumida; dato nuevo; escribe aunque falte la oferta |
| `persuasion` | Versión 1 del caso; PALANCA «urgencia real: llevar el día al gancho» | Versión reforzada, tabla de cambios, «Lo que no cambié» y «Para revisar» | Cada frase nueva cita un dato de la ficha; cifras y condiciones idénticas | Escasez inventada; cambia una condición; usa varias palancas |
| `canales` | Anuncio final; CANALES «texto sobre imagen; mensaje directo»; límites «no lo sé» | Tabla, «Datos conservados» y «No cabe» | Todos los datos en cada canal o en «No cabe»; `[NOMBRE]` en el mensaje; misma acción | Recorta una condición en silencio; inventa límites o nombres |
| `variantes` | Anuncio final; ELEMENTO «el gancho»; SENAL «personas que dicen qué versión vieron» | Tabla A/B y las tres listas | A y B idénticas salvo el gancho; hipótesis en condicional; sin cifras de referencia | Cambia dos cosas; afirma cuál rendirá mejor |
| `afirmaciones` | Anuncio final y mensaje directo del caso | Tabla, condiciones ausentes y veredicto | Todas las afirmaciones (también implícitas) citadas; «Sí» solo con dato exacto; no dice que cumple normas | Se salta una prisa o comparación implícita; marca «Sí» por parecer razonable |

## Antes de publicar en producción
- [ ] Subir las imágenes (la página funciona sin ellas; en producción se omiten).
- [ ] Probar cada prompt y, si el autor lo desea, rellenar `evidence.pruebas` y subir `prueba-prompt-0N.webp`.
- [ ] Revisión humana del contenido (lista en el reporte de la guía).
- [ ] Tras publicar, considerar enlaces de vuelta desde `crear-promociones-con-ia`, `crear-afiches-con-ia` y `crear-publicaciones-para-redes-sociales-con-ia`.
