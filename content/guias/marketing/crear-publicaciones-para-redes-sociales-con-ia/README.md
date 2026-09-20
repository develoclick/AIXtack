# Crear publicaciones para redes sociales con IA

**Ruta:** `/marketing/guias/crear-publicaciones-para-redes-sociales-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3).
**Tipo de guía:** comunicación (`comunicacion-atencion`), con un brief de planificación.
**Problema:** se publica sin objetivo claro y la IA devuelve textos genéricos o con datos que nadie dio.
**Ángulo propio:** las decisiones (objetivo, público, oferta, tono, formato, llamada a la acción, frecuencia) se escriben *antes* en un brief; la IA propone tres opciones que citan de dónde sacó cada dato; se puntúan con una rúbrica con una regla de bloqueo (si el criterio de datos saca 0, no se publica) y el tono se ajusta sin tocar los datos.

## Activo original
Plantilla de brief de siete campos («Copiar como tabla», pegable en una hoja de cálculo) y rúbrica interactiva de seis criterios con umbrales (0–12).

## Estructura
23 secciones agrupadas en 7 partes: Entender el problema · Preparar · Hacer · Evaluar y mejorar · Adaptar · Verificar y aplicar · Referencia. Sin `hero.tools`, sin checklist aparte (los pasos del método son la checklist de proceso), sin sección de fuentes (no hay datos externos que caduquen), sin video.

## Fuente única de verdad (`data.ts`)
Los siete campos del brief (`CAMPOS_BRIEF`), los seis criterios (`CRITERIOS`), los umbrales (`RESULTADOS`) y el caso (`CASO`) se definen una vez y los leen el marco, la plantilla, la rúbrica, el análisis y los prompts.

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `brief` | Entrevista: completa el brief | NEGOCIO, TEMA |
| `publicacion` | Principal: tres opciones de publicación base | BRIEF, MUESTRA_DE_VOZ, LIMITES, OPCIONES |
| `revision` | Evaluación: puntúa con la rúbrica y lista lo que debes comprobar | PUBLICACIONES |
| `tono` | Iteración: ajusta el tono sin tocar los datos | PUBLICACION, AJUSTE |
| `formatos` | Adaptación: lleva la publicación aprobada a cada formato | PUBLICACION_FINAL, FORMATOS, LIMITES_DEL_CANAL |

Cada prompt se muestra una sola vez (`PromptCard`: constructor de variables, texto plegable, copiar).

## Ejemplos generados
Los ejemplos (tres opciones, ajuste de tono, versiones por formato) están redactados **aplicando literalmente cada prompt** a los datos del caso ficticio (peluquería Rizo Fino). Son ilustrativos: no proceden de una conversación real ni de una prueba del autor. Defectos del primer resultado (opción 1 omite la fecha límite, opción 3 omite los días, opción 2 suena a folleto) son los que el prompt no puede impedir del todo: la regla «usa solo datos del brief» prohíbe inventar, no obliga a usarlos todos, y el registro de la muestra se imita de forma aproximada.

## Imágenes
Carpeta: `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/`. WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta. El manifiesto (`data.images`) lleva la descripción completa de cada una.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `brief-completo.webp` | Datos | 4:3 |
| `tres-opciones.webp` | Primer resultado | 16:9 |
| `rubrica-aplicada.webp` | Análisis | 4:3 |
| `ajuste-de-tono.webp` | Iteración | 16:9 |
| `versiones-por-formato.webp` | Adaptación | 16:9 |
| `antes-despues.webp` | Antes y después | 16:9 |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 |

Las cinco `prueba-prompt-0N.webp` (`promptId`: `brief`, `publicacion`, `revision`, `tono`, `formatos`) son capturas reales del autor: el componente «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir, en `data.evidence`: `pruebas` (`promptId`, `fecha`, `asistente`, `nota` con lo que observó), `casoReal` y `revisadoEn`. Hasta entonces los prompts se presentan como «diseñados para», nunca como «probados», y no se afirma compatibilidad con ningún asistente concreto.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y volver a probarlo) antes de publicar. Datos de prueba: los del caso (`CASO`, `VOZ`, `LIMITES` en `data.ts`) o los del negocio real del autor.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `brief` | NEGOCIO y TEMA del caso; responder de a una, dejando sin dato la fecha límite | Preguntas, respuestas y tabla final | Una pregunta por turno; siete campos; la fecha límite marcada `[FALTA: …]`; nada que no dijiste | Varias preguntas juntas; datos inventados; campos fuera de orden |
| `publicacion` | Tabla del brief del caso, muestra de voz, límites, OPCIONES = 3 | Las tres opciones completas | Solo datos del brief; una llamada a la acción; «Datos usados» y «Supuestos» coherentes con el texto | Precios o fechas nuevos; promesas sobre el cabello; copia literal de la muestra |
| `revision` | Las tres opciones del paso anterior | Tablas, totales y «Para comprobar tú» | Fragmento literal por puntaje; totales bien sumados (máx. 12); NO PUBLICAR si datos = 0 | Fragmentos que no están en el texto; totales mal sumados; reescribe el texto |
| `tono` | Opción 2 con AJUSTE = «que suene a mi muestra, sin frases de publicidad» | Versión ajustada, tabla de cambios y «Lo que no cambié» | Todos los datos idénticos; cada frase distinta en la tabla | Cambia un dato; añade adjetivos de resultado; omite un cambio en la tabla |
| `formatos` | Publicación final; FORMATOS = «serie de tres imágenes; mensaje breve»; límites = «no lo sé» | Tabla, «Datos conservados» y «No cabe» | Todos los datos en cada formato o en «No cabe»; `[FALTA: límite del canal]` | Recorta la condición en silencio; inventa límites; sugiere fotos de personas |

## Antes de publicar en producción
- [ ] Subir las imágenes (o dejar que la página funcione sin ellas: en producción se omiten).
- [ ] Probar cada prompt y, si el autor lo desea, rellenar `evidence.pruebas` y subir `prueba-prompt-0N.webp`.
- [ ] Revisión humana del contenido (lista en el reporte de la guía).
- [ ] Tras publicar, considerar enlaces de vuelta desde `ideas-de-contenido-para-tu-negocio-con-ia` y `crear-afiches-con-ia`.
