# AdSense Audit — Guía Prompts IA

**Fecha:** 2026-09-09
**Motivo del rechazo original de AdSense:** "Contenido de bajo valor. Su sitio aún no cumple con los criterios de uso de la red de publicadores de Google."
**Este documento cubre dos fases de trabajo en la misma sesión:** (1) corrección de problemas técnicos/legales/UX/SEO puntuales, y (2) limpieza agresiva de contenido de bajo valor a escala. El detalle completo de la Fase 2 (criterios, tabla completa de las 100 categorías auditadas) está en [`ADSENSE_CONTENT_PRUNING_PLAN.md`](ADSENSE_CONTENT_PRUNING_PLAN.md).

---

## URLs indexables: antes → después

| Momento | Total | Detalle |
|---|---|---|
| Estado inicial de esta sesión | 437 | 100 categorías, 66 herramientas, 100 prompts, 83 posts, 14 profesiones, 55 alternativas, 19 páginas estáticas/listados |
| **Estado final** | **371** | **28** categorías, 66 herramientas, 100 prompts, 83 posts, 14 profesiones, **61** alternativas, 19 páginas estáticas/listados |
| **Cambio neto** | **-66 (-15%)** | -72 categorías (50 eliminadas + 22 fusionadas) / +6 alternativas (consecuencia de las fusiones) |

Ninguna herramienta, prompt, post o página de profesión fue eliminado — las 263 páginas de esos tipos se auditaron cuantitativamente al 100% (no por muestreo) y ninguna mostró el patrón de contenido insuficiente que se buscaba. El problema real estaba concentrado en las páginas de categoría (ver "Fase 2" abajo).

---

## FASE 1 — Correcciones técnicas, legales, UX y SEO puntuales

### Problemas encontrados y corregidos

| # | Problema | Severidad | Estado |
|---|---|---|---|
| 1 | `/faq` con solo 5 preguntas genéricas, una sobre una función (newsletter) inexistente | ALTO | ✅ Corregido — ahora 14 preguntas reales |
| 2 | `/autores` con dos tarjetas de "persona" casi idénticas | ALTO | ✅ Corregido — rediseñada como "una entidad, dos roles" |
| 3 | `/herramientas-ia?categoria=X` compite en el índice con `/categoria/[slug]` | ALTO | ✅ Corregido — noindex + canonical propio |
| 4 | `app/not-found.tsx` sin metadata ni `noindex` | MEDIO | ✅ Corregido |
| 5 | Overflow horizontal ~3px en 375px (conflicto `hidden` + `inline-flex` no condicional en el botón "Explorar" del navbar) | MEDIO | ✅ Corregido |
| 6 | Overflow horizontal severo (~150px) en 1024px (navbar de escritorio no cabía) | ALTO | ✅ Corregido (`lg`→`xl`) |
| 7 | `<motion.div>` vacío en `profession-hero.tsx` | BAJO | ✅ Eliminado |
| 8 | Formulario de contacto que no enviaba datos a ningún sitio real | CRÍTICO | ✅ Eliminado, reemplazado por `mailto:` honesto |
| 9 | Newsletter sin backend real | CRÍTICO | ✅ Eliminado por completo |
| 10 | `/privacidad` describía "datos de cuenta" y newsletter inexistentes | ALTO | ✅ Corregido |
| 11 | `/terminos-y-condiciones` describía cuentas, favoritos y comentarios inexistentes | ALTO | ✅ Corregido |
| 12 | `/aviso-afiliados` afirmaba publicar "cada semana", contradiciendo la política editorial | MEDIO | ✅ Corregido |
| 13 | `/politica-editorial` afirmaba mostrar una "fecha de última actualización" que no existe visualmente | MEDIO | ✅ Corregido |
| 14 | ChatGPT categorizado como "Escritura y copywriting" → afirmación factualmente incorrecta en `/alternativas/chatgpt` | ALTO | ✅ Corregido (`chatbots-conversacionales`) |

---

## FASE 2 — Limpieza agresiva de contenido de bajo valor

### El hallazgo principal

Al auditar las 100 categorías cruzándolas contra `tools.json`, `prompts.json` y `posts.json`, se descubrió que:

- **50 categorías (mitad del total) tenían CERO herramientas, posts o prompts.** Su única página era: encabezado + una descripción de ~230 palabras con una estructura idéntica en las 100 categorías (4 párrafos: qué es / quién lo usa / qué comparar / cómo ha evolucionado el sector — solo cambian los sustantivos) + un aviso explícito de "Sin publicaciones todavía". Esto es, literalmente, contenido a escala generado por plantilla sin ninguna entidad real detrás — la definición exacta de "contenido de bajo valor" que motivó el rechazo de Google.
- **20 categorías más** tenían solo 1 o 2 elementos reales — insuficiente para justificar una URL indexable independiente.

Ver la tabla completa de las 100 categorías, con la decisión y el motivo de cada una, en [`ADSENSE_CONTENT_PRUNING_PLAN.md`](ADSENSE_CONTENT_PRUNING_PLAN.md).

### Resultado

- **50 categorías ELIMINADAS** (0 elementos reales cada una).
- **22 categorías FUSIONADAS** en una categoría más fuerte y afín (ver tabla en el plan) — el contenido real que tenían (7 herramientas, 22 prompts, 5 posts) se conservó íntegro, solo se reasignó su `categorySlug`.
- **28 categorías MANTENIDAS** — cada una con identidad propia y respaldo real (mínimo 2 elementos sustanciales, la mayoría muchos más).
- **4 posts reclasificados** (no eliminados): 2 de tipo `REVIEW` → `COMPARISON` y 2 de tipo `ARTICLE` → `GUIDE`, porque esos dos tipos no tenían página de listado propia (su breadcrumb apuntaba a "Noticias", donde nunca aparecían — navegación rota). Ahora tienen listado y breadcrumb reales.
- **0 herramientas, prompts o posts eliminados** — los 263 verificados individualmente tenían profundidad real (ver tabla de métricas en el plan).

### Consecuencia en `/alternativas/[slug]`: 55 → 61 (aumento, no reducción)

Al fusionar categorías débiles (1 herramienta) en categorías fuertes, varias herramientas que antes no tenían suficientes "alternativas" reales para justificar esa página (p. ej. Devin AI, único en su categoría) ahora tienen competidores genuinos dentro de su nueva categoría (programación, con 9 herramientas). El resultado es más páginas de alternativas, pero todas con comparaciones reales.

---

## Bug técnico crítico encontrado y corregido: URLs inválidas devolvían HTTP 200

Durante la verificación de que las categorías eliminadas devolvían 404 correctamente, se descubrió que **cualquier slug inválido** bajo `/categoria/`, `/herramientas-ia/`, `/prompts/`, `/blog/`, `/alternativas/` o `/prompts/profesiones/` — no solo los recién eliminados, sino cualquier URL inventada que nunca existió — devolvía **HTTP 200** con el contenido de "página no encontrada", cacheado además como página estática con `Cache-Control: s-maxage=31536000` (1 año). Esto es un bug **preexistente a esta sesión**, no introducido por la limpieza.

**Por qué importa para AdSense/Google:** cualquier URL inventada bajo esas rutas (por un bot, un enlace roto, o simple adivinación) se convertía en una página distinta indexable con status 200 y contenido genérico — exactamente el patrón de "contenido generado a escala sin valor" que Google Search penaliza, con superficie potencialmente ilimitada.

**Causa raíz:** en Next.js 16 App Router, un segmento dinámico con `generateStaticParams` sin `dynamicParams = false` renderiza on-demand cualquier param no listado y lo cachea como página estática con status 200, incluso si el componente llama `notFound()` (documentado en `node_modules/next/dist/docs/.../dynamic-routes.md`).

**Corrección aplicada:**
- `export const dynamicParams = false;` añadido a las 7 rutas dinámicas (`categoria`, `herramientas-ia`, `prompts`, `blog`, `alternativas`, `prompts/profesiones`, `etiqueta`).
- `etiqueta/[slug]` usa `searchParams` (paginación), lo que la fuerza a renderizado dinámico con streaming — en ese modo, la respuesta ya envía cabeceras 200 antes de que `notFound()` pueda actuar (comportamiento documentado de Next.js: "el status code no puede cambiar tras iniciar el streaming"). Se resolvió con un `proxy.ts` (antes "middleware") nuevo que valida el slug contra `tags.json` **antes** de que la petición llegue al render, devolviendo un 404 real.

**Verificado en el servidor de producción (`next start`, no `next dev`):** las 7 rutas devuelven 404 real para slugs inválidos y 200 para slugs válidos.

---

## Páginas eliminadas

**50 páginas de categoría** (ver lista completa en el plan de poda): `generacion-de-subtitulos`, `doblaje-con-ia`, `generacion-de-modelos-3d`, `generacion-de-infografias`, `generacion-de-newsletters`, `chatbots-de-ventas`, `automatizacion-rpa`, `programacion-de-reuniones`, `ia-para-diseno-de-producto`, `wireframes-con-ia`, `testing-automatizado-con-ia`, `deteccion-de-fraude`, `ia-para-trading`, `deteccion-de-plagio`, `generacion-de-flashcards`, `tutores-virtuales`, `ia-para-salud`, `generacion-de-recetas`, `ia-para-bienes-raices`, `ia-para-logistica`, `ia-para-agricultura`, `ia-para-arquitectura`, `ia-para-control-de-calidad`, `ia-para-recomendacion-de-productos`, `moderacion-de-contenido`, `ia-para-streaming`, `generacion-de-cursos-online`, `ia-para-accesibilidad`, `generacion-de-descripciones-alt`, `generacion-de-guiones`, `generacion-de-comics`, `generacion-de-videojuegos`, `ia-para-meteorologia`, `ia-para-conservacion-ambiental`, `ia-para-energia`, `ia-para-seguros`, `ia-para-comercio-electronico`, `generacion-de-manuales-tecnicos`, `traduccion-de-documentos-legales`, `generacion-de-podcast-desde-texto`, `ia-para-contratos`, `ia-para-arte-digital`, `ia-para-musica-de-fondo`, `generacion-de-bases-de-datos`, `ia-para-terminal-y-devops`, `ia-para-control-de-versiones`, `ia-para-traduccion-de-codigo`, `optimizacion-de-precios`, `gestion-documental-con-ia`, `recomendacion-de-contenido`.

Además, funcionalidad rota eliminada en la Fase 1 (no páginas): formulario de contacto, newsletter, un componente de anuncio que renderizaba un `<div>` vacío.

## Páginas fusionadas

**22 categorías** fusionadas en una categoría más fuerte (lista completa y motivo de cada una en el plan de poda). Resumen: `generacion-de-logotipos` + `mejora-de-resolucion` → `generacion-de-imagenes`; `email-marketing-con-ia` + `generacion-de-anuncios` + `optimizacion-de-conversion` + `analisis-de-sentimiento` + `redes-sociales-con-ia` → `marketing-con-ia`; `agentes-autonomos-de-ia` + `ia-para-analisis-de-datos` → `programacion`; `generacion-de-curriculums` + `ia-para-fitness` + `planificacion-de-comidas` + `ia-para-viajes` + `mantenimiento-predictivo` + `ia-para-recursos-educativos` → `productividad`; `generacion-de-musica` + `transcripcion-de-audio` + `transcripcion-de-reuniones` → `audio-y-voz`; `generacion-de-examenes` → `ia-para-educacion`; `generacion-de-miniaturas` → `video`; `reclutamiento-con-ia` → `ia-para-recursos-humanos`; `ia-para-call-centers` → `atencion-al-cliente-con-ia`.

## Páginas mejoradas

- **`/faq`**: 5 → 14 preguntas reales.
- **`/autores`**: rediseñada, sin fabricar credenciales.
- **`/alternativas/chatgpt`**: ahora compara con alternativas reales (Gemini, Character.AI) en vez de herramientas de gramática.
- **`/contacto`**: formulario roto → `mailto:` honesto.
- **`/privacidad`, `/terminos-y-condiciones`, `/aviso-afiliados`, `/politica-editorial`**: alineadas con la realidad del sitio.
- **4 posts** reclasificados de tipo (ver Fase 2) para tener navegación/breadcrumb coherentes.

## Páginas marcadas noindex

- `/herramientas-ia?q=...`, `/herramientas-ia?categoria=...`, `/buscar`, `/etiqueta/[slug]`, página 404.

Ninguna afecta la navegación real del usuario — todos los filtros y búsquedas siguen funcionando; solo cambia qué URLs puede indexar Google.

---

## Validación técnica (servidor de producción, `next start`)

- **Lint (`npm run lint`):** ✅ sin errores.
- **TypeScript (`npx tsc --noEmit`):** ✅ sin errores.
- **Build (`npm run build`):** ✅ compila y pre-renderiza 402 páginas (468 antes de la Fase 2) sin errores. Verificado 3 veces durante la sesión.
- **Tests:** N/A — no hay suite configurada en el proyecto.
- **Sitemap:** ✅ 371 URLs (437 antes), sin variantes por parámetro, sin categorías eliminadas/fusionadas.
- **Verificación de enlaces:** ✅ las 371 URLs del sitemap responden 200 contra el servidor de producción (`next start`), 0 fallidas.
- **Robots.txt:** ✅ sin cambios necesarios; `/etiqueta/` sigue crawleable (para que Googlebot vea el noindex).
- **Canonicals:** ✅ verificados en `/herramientas-ia` (indexable) y `?categoria=` (noindex + canonical propio).
- **404 real:** ✅ verificado en las 7 rutas dinámicas (antes solo funcionaba en 6 de 7 — ver bug técnico arriba).
- **Enlaces internos rotos hacia categorías eliminadas/fusionadas:** ✅ ninguno encontrado (navegación, filtros, sitemap y `/mapa-del-sitio` leen `categories.json` dinámicamente, sin referencias hardcodeadas).
- **Homepage:** ✅ verificado visualmente — refleja "28 categorías" y los conteos de herramientas por categoría correctamente actualizados.

---

## Problemas pendientes que requieren intervención humana

1. **Antigüedad y tráfico del dominio** (estructural): fuera del alcance del código.
2. **Ausencia de tests automatizados** (BAJO): toda la validación fue manual + build; el bug de `dynamicParams` y el de overflow del navbar habrían sido detectados antes con una suite de tests de rutas.
3. **Tres componentes de anuncio sin usar en producción** (`TopBannerAd`, `InArticleAd`, `MultiplexAd`) (BAJO): no es un riesgo de aprobación.
4. Ninguna decisión de negocio pendiente: no quedan páginas fabricadas, credenciales inventadas ni contenido generado en masa.

---

## Checklist final

- [x] `npm run lint` sin errores
- [x] `npx tsc --noEmit` sin errores
- [x] `npm run build` sin errores (402 páginas totales, 371 indexables)
- [x] Tests: N/A
- [x] Sitemap: 371 URLs, sin duplicados ni parámetros
- [x] Robots.txt coherente
- [x] Canonicals correctos
- [x] 404 real en las 7 rutas dinámicas (bug crítico corregido)
- [x] Enlaces del sitemap verificados en producción (371/371 OK)
- [x] Sin enlaces internos rotos hacia contenido eliminado/fusionado
- [x] 50 categorías de bajo valor eliminadas, 22 fusionadas
- [x] 0 herramientas/prompts/posts/profesiones eliminados (verificados: ninguno era thin content)
- [x] Sin funcionalidades rotas ni afirmaciones sobre funciones inexistentes
- [x] Sin contenido factualmente incorrecto detectado
- [x] Sin credenciales, empresas, premios o experiencia inventados
- [x] Publicidad no domina ninguna página (un único slot activo en todo el sitio)

---

## VEREDICTO FINAL

```
🟢 LISTO PARA SOLICITAR ADSENSE
```

**Por qué:** el sitio pasó de 437 a 371 URLs indexables eliminando específicamente las 50 páginas de categoría que no tenían ninguna entidad real detrás — el patrón de "contenido de bajo valor a escala" más directamente relacionado con el motivo de rechazo original de Google — y fusionando otras 22 que eran demasiado débiles para justificar una URL propia, sin perder el contenido real que tenían. Se verificó cuantitativamente que el resto del sitio (herramientas, prompts, posts, profesiones — 263 páginas) ya tenía profundidad real, así que no se tocó. Además se encontró y corrigió un bug técnico serio y preexistente (URLs inválidas devolviendo 200) que representaba un riesgo de indexación de contenido basura a escala potencialmente ilimitada. Todo se verificó en el servidor de producción, no solo en teoría: 371/371 URLs del sitemap responden correctamente, las 7 rutas dinámicas devuelven 404 real para slugs inválidos, y build/lint/typecheck están limpios.

Esto no es una garantía de aprobación — nadie puede darla, y factores externos (antigüedad del dominio, historial de tráfico, revisión editorial humana de Google) están fuera del alcance de este trabajo. Pero el sitio ya no exhibe patrones de contenido a escala sin valor, contenido duplicado, páginas thin, ni bugs técnicos que generen URLs basura indexables — y no se usó ninguna táctica de relleno artificial, keyword stuffing, ni generación masiva de contenido para llegar a este resultado.
