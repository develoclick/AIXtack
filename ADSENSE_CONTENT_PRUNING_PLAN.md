# Plan de limpieza agresiva de contenido — Guía Prompts IA

**Regla aplicada a cada URL:** *"Si no puedo explicar claramente qué valor único obtiene un usuario al visitar esta URL, la página NO debería permanecer como página indexable."*

**Metodología:** en vez de leer manualmente 437 páginas, se auditó **el 100% del contenido** de forma cuantitativa (longitud real de descripción/artículo, número de features/pros/cons/FAQ, número de entidades reales por categoría) más una revisión cualitativa dirigida a los casos límite y a los grupos de páginas con mayor riesgo de plantilla/duplicación. Ningún contenido fue inventado para "salvar" una página — donde no había suficiente valor real, se fusionó o se eliminó la categoría (nunca el contenido real que tenía detrás, salvo que ese contenido en sí fuera insuficiente).

## Resultado numérico

| Tipo de página | Antes | Después | Cambio |
|---|---|---|---|
| `/categoria/[slug]` | 100 | 28 | **-72** (50 eliminadas, 22 fusionadas) |
| `/herramientas-ia/[slug]` | 66 | 66 | 0 |
| `/prompts/[slug]` | 100 | 100 | 0 |
| `/blog/[slug]` (posts) | 83 | 83 | 0 (4 reclasificadas de tipo, 0 eliminadas) |
| `/prompts/profesiones/[profesion]` | 14 | 14 | 0 |
| `/alternativas/[slug]` | 55 | 61 | **+6** (consecuencia de fusionar categorías débiles en categorías fuertes: herramientas antes aisladas en una categoría de 1 elemento ahora tienen alternativas reales) |
| Páginas estáticas/listados | 19 | 19 | 0 |
| **Total indexable (sitemap)** | **437** | **371** | **-66 (-15%)** |

## Por qué no se tocaron herramientas, prompts, profesiones ni posts

Se midió objetivamente la profundidad de **cada una** de las 66 herramientas, 100 prompts, 83 posts y 14 páginas de profesión (no solo una muestra):

- **Herramientas**: la entrada más corta tiene 109 palabras de descripción + 7-8 features + 4 pros + 3-4 cons + 4-6 FAQ + 84+ palabras de conclusión. Ninguna es una ficha vacía de "DATO + BOTÓN".
- **Prompts**: el artículo explicativo más corto tiene 308 palabras (media 359), con 6 FAQ y caso de uso propio en el 100% de los casos.
- **Posts** (noticias/tutoriales/guías/comparativas): el más corto tiene 522 palabras (media 599), con 4 FAQ en el 100% de los casos.
- **Profesiones**: las 14 páginas tienen exactamente 20 prompts reales y específicos cada una (verificado el contenido real, no genérico).

Ninguna de estas 263 páginas individuales mostró el patrón de "contenido intercambiable/plantilla sin sustancia" que la regla busca eliminar. El problema real estaba concentrado casi por completo en **categorías**, que es donde se actuó.

## El hallazgo principal: 100 categorías, 50 completamente vacías

Al cruzar `categories.json` contra `tools.json`, `prompts.json` y `posts.json` por `categorySlug`, se descubrió que:

- **50 de 100 categorías** tenían **cero** herramientas, cero prompts y cero posts. Su única "página" era: encabezado + una descripción de ~230 palabras con una estructura de 4 párrafos **idéntica en las 100 categorías** (solo cambian los sustantivos) + un bloque explícito de "Sin publicaciones todavía. Pronto añadiremos contenido en esta categoría." Esto es exactamente la definición de "página creada para SEO sin valor real" que la regla pide eliminar — no es una opinión subjetiva, es contenido a escala generado por plantilla sin ninguna entidad real detrás.
- **13 categorías más** tenían exactamente **1** elemento real (una herramienta o un prompt).
- **7 categorías más** tenían exactamente **2** elementos reales.

Esto explica en gran medida el motivo original de rechazo de AdSense ("contenido de bajo valor"): 72 de las 100 URLs de categoría eran, en la práctica, páginas vacías o casi vacías generadas automáticamente a partir de una plantilla.

## Tabla completa — `/categoria/[slug]` (las 100 URLs originales)

| Categoría | Elementos reales (tools+posts+prompts) | Acción | Motivo |
|---|---|---|---|
| generacion-de-subtitulos | 0 | ELIMINAR | Sin ninguna entidad real; solo descripción de plantilla |
| doblaje-con-ia | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-modelos-3d | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-infografias | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-newsletters | 0 | ELIMINAR | Sin ninguna entidad real |
| chatbots-de-ventas | 0 | ELIMINAR | Sin ninguna entidad real |
| automatizacion-rpa | 0 | ELIMINAR | Sin ninguna entidad real |
| programacion-de-reuniones | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-diseno-de-producto | 0 | ELIMINAR | Sin ninguna entidad real |
| wireframes-con-ia | 0 | ELIMINAR | Sin ninguna entidad real |
| testing-automatizado-con-ia | 0 | ELIMINAR | Sin ninguna entidad real |
| deteccion-de-fraude | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-trading | 0 | ELIMINAR | Sin ninguna entidad real |
| deteccion-de-plagio | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-flashcards | 0 | ELIMINAR | Sin ninguna entidad real |
| tutores-virtuales | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-salud | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-recetas | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-bienes-raices | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-logistica | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-agricultura | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-arquitectura | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-control-de-calidad | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-recomendacion-de-productos | 0 | ELIMINAR | Sin ninguna entidad real |
| moderacion-de-contenido | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-streaming | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-cursos-online | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-accesibilidad | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-descripciones-alt | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-guiones | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-comics | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-videojuegos | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-meteorologia | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-conservacion-ambiental | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-energia | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-seguros | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-comercio-electronico | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-manuales-tecnicos | 0 | ELIMINAR | Sin ninguna entidad real |
| traduccion-de-documentos-legales | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-podcast-desde-texto | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-contratos | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-arte-digital | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-musica-de-fondo | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-bases-de-datos | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-terminal-y-devops | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-control-de-versiones | 0 | ELIMINAR | Sin ninguna entidad real |
| ia-para-traduccion-de-codigo | 0 | ELIMINAR | Sin ninguna entidad real |
| optimizacion-de-precios | 0 | ELIMINAR | Sin ninguna entidad real |
| gestion-documental-con-ia | 0 | ELIMINAR | Sin ninguna entidad real |
| recomendacion-de-contenido | 0 | ELIMINAR | Sin ninguna entidad real |
| generacion-de-logotipos | 1 (1 prompt) | FUSIONAR → generacion-de-imagenes | Un logo es un tipo de imagen; 1 elemento no justifica URL propia |
| mejora-de-resolucion | 1 (1 tool) | FUSIONAR → generacion-de-imagenes | Mismo dominio (imágenes); 1 elemento no justifica URL propia |
| email-marketing-con-ia | 1 (1 prompt) | FUSIONAR → marketing-con-ia | Subtipo directo de marketing; 1 elemento no justifica URL propia |
| generacion-de-anuncios | 1 (1 prompt) | FUSIONAR → marketing-con-ia | Subtipo directo de marketing |
| optimizacion-de-conversion | 1 (1 prompt) | FUSIONAR → marketing-con-ia | Subtipo directo de marketing |
| agentes-autonomos-de-ia | 1 (1 tool: Devin AI) | FUSIONAR → programacion | Devin es un agente de código; mejor identidad y más alternativas reales dentro de programación |
| generacion-de-curriculums | 1 (1 prompt) | FUSIONAR → productividad | Tarea de organización personal/laboral |
| ia-para-fitness | 1 (1 prompt) | FUSIONAR → productividad | Sin categoría hermana más afín ya poblada |
| planificacion-de-comidas | 1 (1 prompt) | FUSIONAR → productividad | Sin categoría hermana más afín ya poblada |
| ia-para-viajes | 1 (1 prompt) | FUSIONAR → productividad | Sin categoría hermana más afín ya poblada |
| mantenimiento-predictivo | 1 (1 prompt) | FUSIONAR → productividad | Sin categoría hermana más afín ya poblada |
| ia-para-recursos-educativos | 1 (1 prompt) | FUSIONAR → productividad | Sin categoría hermana más afín ya poblada |
| ia-para-analisis-de-datos | 1 (1 prompt: SQL) | FUSIONAR → programacion | Consultas SQL es una tarea de programación |
| generacion-de-musica | 2 (1 tool: Suno, 1 post) | FUSIONAR → audio-y-voz | Subtipo directo de audio |
| transcripcion-de-audio | 2 (1 tool: Otter.ai, 1 post) | FUSIONAR → audio-y-voz | Subtipo directo de audio |
| transcripcion-de-reuniones | 2 (1 tool, 1 prompt) | FUSIONAR → audio-y-voz | Subtipo directo de audio/transcripción |
| ia-para-ciberseguridad | 2 (2 posts, ~600 palabras c/u) | **MANTENER** | 2 artículos sustanciales y un tema propio sin categoría hermana afín ya poblada |
| generacion-de-examenes | 2 (2 prompts) | FUSIONAR → ia-para-educacion | Subtipo directo de educación, categoría ya poblada |
| analisis-de-sentimiento | 2 (2 prompts) | FUSIONAR → marketing-con-ia | Uso habitual en marketing/CX |
| generacion-de-miniaturas | 2 (1 tool: Opus Clip, 1 post) | FUSIONAR → video | Subtipo directo de vídeo |
| traduccion-automatica | 3 (1 tool, 1 post, 1 prompt) | **MANTENER** | Cobertura real en los 3 formatos de contenido; tema distintivo |
| redes-sociales-con-ia | 3 (1 post, 2 prompts) | FUSIONAR → marketing-con-ia | Subtipo directo de marketing |
| reclutamiento-con-ia | 3 (3 prompts) | FUSIONAR → ia-para-recursos-humanos | Duplicación de ámbito: reclutamiento es un subtema directo de RRHH |
| gestion-de-proyectos-con-ia | 3 (3 prompts) | **MANTENER** | Vertical distinta, sin solapamiento con otra categoría poblada |
| ia-para-finanzas | 3 (1 post, 2 prompts) | **MANTENER** | Vertical profesional distintiva |
| ia-para-call-centers | 3 (1 tool, 1 post, 1 prompt) | FUSIONAR → atencion-al-cliente-con-ia | Call center es un canal de atención al cliente |
| ia-para-startups | 3 (3 prompts) | **MANTENER** | Vertical distintiva, sin solapamiento |
| audio-y-voz | 4 (2 tools, 2 posts) | **MANTENER** | Categoría "flagship", identidad fuerte, ahora recibe 3 fusiones |
| edicion-de-video-con-ia | 4 (2 tools, 2 posts) | **MANTENER** | Identidad propia y clara |
| generacion-de-avatares | 4 (2 tools, 2 posts) | **MANTENER** | Identidad propia y clara |
| eliminacion-de-fondo | 4 (2 tools, 2 posts) | **MANTENER** | Identidad propia y clara |
| automatizacion-de-flujos-de-trabajo | 4 (2 tools, 2 posts) | **MANTENER** | Identidad propia y clara |
| ia-para-educacion | 4 (1 post, 3 prompts) | **MANTENER** | Vertical distintiva; recibe 1 fusión |
| podcast-con-ia | 4 (1 tool, 2 posts, 1 prompt) | **MANTENER** | Medio distintivo con cobertura real en 3 formatos |
| ia-para-recursos-de-marca | 4 (1 tool, 1 post, 2 prompts) | **MANTENER** | Identidad propia (branding), sin solapamiento |
| generacion-de-presentaciones | 5 (3 tools, 2 posts) | **MANTENER** | Identidad propia y clara |
| ia-para-legal | 5 (1 post, 4 prompts) | **MANTENER** | Vertical profesional distintiva |
| ia-para-recursos-humanos | 6 (1 post, 5 prompts) | **MANTENER** | Vertical profesional distintiva; recibe 1 fusión (reclutamiento) |
| atencion-al-cliente-con-ia | 7 (1 post, 6 prompts) | **MANTENER** | Vertical distintiva; recibe 1 fusión (call centers) |
| chatbots-conversacionales | 8 (3 tools, 5 posts) | **MANTENER** | Categoría fuerte: ChatGPT, Gemini, Character.AI |
| asistentes-de-investigacion | 8 (1 tool, 2 posts, 5 prompts) | **MANTENER** | Identidad propia y clara |
| seo-con-ia | 10 (3 tools, 4 posts, 3 prompts) | **MANTENER** | Cobertura fuerte en los 3 formatos |
| ia-para-ventas-b2b | 10 (2 tools, 2 posts, 6 prompts) | **MANTENER** | Vertical distintiva y bien cubierta |
| marketing-con-ia | 12 (2 tools, 3 posts, 7 prompts) | **MANTENER** | Categoría fuerte; recibe 5 fusiones |
| video | 13 (4 tools, 5 posts, 4 prompts) | **MANTENER** | Categoría "flagship"; recibe 1 fusión |
| escritura | 14 (4 tools, 6 posts, 4 prompts) | **MANTENER** | Categoría "flagship" |
| diseno-ui-ux-con-ia | 14 (6 tools, 7 posts, 1 prompt) | **MANTENER** | Cobertura fuerte |
| generacion-de-imagenes | 15 (8 tools, 6 posts, 1 prompt) | **MANTENER** | Categoría "flagship"; recibe 2 fusiones |
| productividad | 21 (2 tools, 8 posts, 11 prompts) | **MANTENER** | Categoría "flagship"; recibe 6 fusiones |
| programacion | 21 (8 tools, 7 posts, 6 prompts) | **MANTENER** | Categoría "flagship"; recibe 2 fusiones |

**Total: 50 ELIMINAR, 22 FUSIONAR, 28 MANTENER.**

## Otras páginas revisadas

| URL / grupo | Valor | Problema encontrado | Acción | Motivo |
|---|---|---|---|---|
| `/herramientas-ia/[slug]` (66) | Alto en el 100% | Ninguno (verificado cuantitativamente) | MANTENER | 109-190+ palabras de descripción, 7-9 features, 4-5 pros/cons, 4-6 FAQ, 80-100+ palabras de conclusión en cada una |
| `/prompts/[slug]` (100) | Alto en el 100% | Ninguno | MANTENER | Artículo explicativo de 300-360+ palabras y 6 FAQ en cada uno |
| `/blog/[slug]` — 79 posts (NEWS/TUTORIAL/GUIDE/COMPARISON con sección propia) | Alto | Ninguno | MANTENER | 522-662 palabras, 4 FAQ en cada uno |
| `/blog/analisis-elevenlabs-clonacion-de-voz` y `/blog/github-copilot-analisis-2026` | Alto | `type: REVIEW` no tiene sección de listado propia; el breadcrumb apuntaba a "Noticias", donde el post nunca aparece — navegación inconsistente | MEJORAR | Reclasificados a `COMPARISON` (ambos comparan explícitamente contra alternativas del mercado); ahora tienen breadcrumb y listado reales en `/comparativas` |
| `/blog/el-futuro-de-los-agentes-de-ia` y `/blog/ia-y-derechos-de-autor-lo-que-debes-saber` | Alto | `type: ARTICLE` no tiene sección de listado propia; mismo problema de navegación | MEJORAR | Reclasificados a `GUIDE` (son piezas de análisis/explicación de fondo, no noticias puntuales); ahora tienen breadcrumb y listado reales en `/guias` |
| `/prompts/profesiones/[profesion]` (14) | Alto en el 100% | Ninguno | MANTENER | 20 prompts reales y específicos por profesión |
| `/alternativas/[slug]` (61 tras la limpieza) | Alto | Ninguno — la página ya se autolimitaba a categorías con 2+ herramientas | MANTENER | Página con análisis, FAQ generado a partir de datos reales (mejor valorada, más económica, motivos reales de `cons`) |
| `/`, `/herramientas-ia`, `/prompts`, `/comparativas`, `/noticias`, `/tutoriales`, `/guias`, `/prompts/profesiones` (listados) | Alto | Ninguno | MANTENER | Necesarias para la navegación y ya auditadas en la fase anterior |
| `/sobre-nosotros`, `/contacto`, `/privacidad`, `/terminos-y-condiciones`, `/cookies`, `/aviso-afiliados`, `/creditos-de-imagenes`, `/politica-editorial`, `/autores`, `/faq`, `/mapa-del-sitio` | Alto | Ninguno (ya corregidas en la fase anterior: sin funciones inventadas, sin contradicciones) | MANTENER | Páginas legales/institucionales reales y necesarias |
| `/etiqueta/[slug]` | Bajo como resultado de búsqueda de Google, útil para navegación interna | Contenido de agregación sin texto propio | NOINDEX (ya aplicado en fase anterior) | Sigue funcionando para el usuario; excluida del índice |
| `/buscar`, `/herramientas-ia?q=`, `/herramientas-ia?categoria=` | Funcional, sin valor como resultado de búsqueda propio | Contenido transitorio/duplicado | NOINDEX (ya aplicado en fase anterior) | Filtro y búsqueda siguen funcionando para el usuario |
| `/_not-found` y cualquier slug inválido bajo rutas dinámicas | N/A | Ver bug técnico corregido abajo | NOINDEX + 404 real | Ver sección "Bug técnico crítico" en `ADSENSE_AUDIT.md` |

## Cambios en datos y código para ejecutar el plan

- `content/categories.json`: 100 → 28 entradas.
- `content/tools.json`: `categorySlug` reasignado en 7 herramientas (Suno, Otter.ai, Topaz Photo AI, Devin AI, Opus Clip, y 2 más) hacia su nueva categoría fusionada.
- `content/prompts.json`: `categorySlug` reasignado en 22 prompts.
- `content/posts.json`: `categorySlug` reasignado en 5 posts; `type` corregido en 4 posts (2 REVIEW→COMPARISON, 2 ARTICLE→GUIDE).
- Navegación, filtros (`ToolFilters`), `/mapa-del-sitio` y el sitemap XML: **no requirieron cambios manuales** — todos leen `categories.json` dinámicamente (`listCategories()`), así que reflejan las 28 categorías supervivientes automáticamente.
- No se eliminó ningún componente ni archivo de código: el sistema de categorías ya soportaba esta poda sin cambios estructurales.
