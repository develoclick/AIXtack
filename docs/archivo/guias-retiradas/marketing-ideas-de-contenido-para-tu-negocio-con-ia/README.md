# Ideas de contenido para tu negocio con IA que no suenan genéricas

**Ruta:** `/marketing/guias/ideas-de-contenido-para-tu-negocio-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3). `slug` y `publishedAt` (2026-09-19) se conservan.
**Tipo de guía:** estrategia y planificación (`estrategia-planificacion`).
**Problema:** el negocio no sabe qué publicar y termina repitiéndose o sin publicar; una IA sin contexto da ideas que servirían a cualquier negocio.
**Ángulo propio:** la *materia prima* real del negocio (preguntas, problemas, temporada) como única fuente de ideas, una entrevista para quien no la tiene, una rúbrica de cinco criterios con dos reglas de bloqueo y una verificación antes de producir. Solo decide **qué** publicar: no redacta ni programa (eso es de `crear-publicaciones-para-redes-sociales-con-ia`).

## Cambios de esta regeneración (v3)
- **Se quitaron:** `hero.tools` (duplicaba `quickFacts.needs`), la checklist y la sección «Aplicación» que repetían el método, la sección «Cómo funciona» (la explicación va dentro de cada `PromptCard`), «antes y después», el tercer ejemplo (peluquería) y las referencias a guías que no existen.
- **Se añadieron:** «para quién», ficha de materia prima copiable, banco de ideas copiable, `PromptCard` con pruebas y las reglas de bloqueo de la rúbrica.
- **Correcciones de coherencia:** el prompt principal se mostraba dos veces (bloque + constructor); el prompt de iteración usaba un puntaje mínimo (7) distinto al umbral de la rúbrica (6), y ahora lee el umbral de la misma constante; las columnas del banco final no coincidían con las del prompt, y ahora salen de una sola definición.
- **Corrección del primer resultado:** la versión anterior mostraba ideas sin origen, un dato inventado («los gatos duermen 16 horas») y un consejo veterinario, defectos que las reglas del propio prompt prohíben y que por tanto no eran plausibles. Ahora el primer resultado cumple las reglas y falla donde un prompt no puede impedirlo: un origen forzado (idea 6), acciones que no llevan al objetivo (ideas 3, 4, 5 y 7) y una producción que no cabe en el tiempo (idea 4). El «dato inventado» pasa a ser la advertencia de la sección de verificación.
- `relatedGuides` y `nextGuide` apuntan solo a guías que existen (las anteriores eran `calendario-de-contenido-con-ia` y `analizar-opiniones-de-clientes-con-ia`).

## Activo original
Ficha de materia prima (tabla copiable), rúbrica interactiva de cinco criterios (0–10; bloqueo si «Origen» saca 0 o si la idea toca lo que no se publica) y banco de ideas priorizado (tabla copiable con prioridad, idea, pilar, origen, formato, acción, puntaje y estado).

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `entrevista` | Entrevista: reúne las seis listas de materia prima | NEGOCIO, OBJETIVO |
| `principal` | Genera el banco de ideas con su origen | NEGOCIO, PUBLICO, OBJETIVO, PILARES, MATERIA_PRIMA, FORMATOS, LIMITES, CANTIDAD |
| `evaluacion` | Puntúa con la rúbrica y marca NO PRODUCIR | IDEAS, TIEMPO_DISPONIBLE |
| `iteracion` | Rehace o descarta lo flojo y entrega el banco final | PUNTAJE_MINIMO |
| `verificacion` | Lista lo que debes comprobar antes de producir | TEMAS_SENSIBLES |

## Ejemplos generados y cifras
Redactados **aplicando literalmente cada prompt** a los datos de Patitas (ficticia). No proceden de una conversación real ni de una prueba del autor. Las únicas cifras son los puntajes del banco final (10, 9, 9, 8, 8, 7, 7, asignados por la IA del ejemplo) y el orden de mayor a menor, comprobados a mano; todos superan el mínimo de 6. No hay cálculos ni datos externos.

## Imágenes
Carpeta: `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/` (no existe ningún archivo; se retiraron `entrevista.webp` y `antes-despues.webp` del manifiesto). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `datos-necesarios.webp` | Datos | 4:3 |
| `primer-resultado.webp` | Primer resultado | 16:9 |
| `rubrica.webp` | Análisis | 4:3 |
| `banco-de-ideas.webp` | Resultado final | 16:9 |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 |

Las cinco `prueba-prompt-0N.webp` (`promptId`: `entrevista`, `principal`, `evaluacion`, `iteracion`, `verificacion`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (un banco de ideas propio y qué señal se observó) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `entrevista` | NEGOCIO y OBJETIVO del caso; responder de a una | Preguntas, respuestas y tabla | Una pregunta por turno; seis listas; lo que no sabes como `[FALTA]`; sin nombres de clientes | Varias preguntas juntas; datos inventados; empieza a proponer ideas |
| `principal` | Tabla de materia prima, pilares, formatos, límites y CANTIDAD = 8 | La tabla y la lista «FALTA» | Cada idea con su origen exacto; sin datos nuevos; nada que toque los límites | Origen forzado; ideas repetidas; datos o promociones inventados |
| `evaluacion` | Las ideas del paso anterior y TIEMPO_DISPONIBLE | Tabla completa | Fragmento literal por puntaje; totales bien sumados (máx. 10); NO PRODUCIR donde toca | Fragmentos que no están; totales mal sumados; reescribe las ideas |
| `iteracion` | Evaluación anterior y PUNTAJE_MINIMO = 6 | «Cambios» y «Banco final» | Ninguna idea bajo el mínimo; sin ideas nuevas; orden por puntaje | Añade ideas; fuerza un origen; ordena mal |
| `verificacion` | Banco final y TEMAS_SENSIBLES del caso | La tabla y «Antes de producir» | «Sí» solo con elemento exacto; permisos señalados; no dice que cumple normas | Marca «Sí» por parecer razonable; inventa un punto de control |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Probar los cinco prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Reglas locales sobre publicidad, sorteos e imágenes: la guía dice que varían y no las cubre.
- Enlaces de vuelta sugeridos desde `crear-publicaciones-para-redes-sociales-con-ia` y `responder-consultas-de-clientes-con-ia` (no editadas).
