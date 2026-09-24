# Auditoría previa · Fase 0

Rama `reestructura-herramientas`, creada desde `origin/main` (commit `58015c1`, «agregando imagenes evaluacion 2.1»). Sin seguimiento de `main` (`git branch --unset-upstream`) para evitar un push accidental. Esta fase **no cambia código**: solo añade este documento (y `docs/reestructuracion-guiapromptsia.md`, que estaba sin versionar).

Todo lo que aparece aquí se midió en el repositorio con scripts (inventario de los 20 `data.ts` y `guide.mdx`, recuento de palabras con el mismo contador del sitio, existencia de archivos en `public/`). Lo que no pude comprobar está en el apartado 8 con la etiqueta **NO PUDE COMPROBARLO**.

## 0. Lo esencial (léelo primero)

1. **Solo 2 de las 20 guías tienen imágenes en el repo**: anuncios (7 archivos, 5 capturas de chat) y promociones (7 archivos, 5 capturas de chat). Las otras 18 tienen 0. En particular, **no existe ninguna imagen de afiches** (ni la captura del chat de La Espiga ni el afiche con la foto de los panes), y **tampoco las capturas de la calculadora de promociones**. El piloto de la Fase 2 quedará con `publicado: false` y una lista completa de imágenes pendientes.
2. **Las capturas reales son de los prompts encadenados antiguos**, no del prompt maestro nuevo. El encargo pide que el texto coincida con las capturas y que la página se marque «Probado por…» solo si la prueba existe. Con el prompt nuevo eso no es cierto todavía. Además, en promociones las capturas 03 y 04 muestran a la IA **calculando**, y el principio 9 dice que la IA nunca calcula. Necesito tu decisión (R3).
3. **Dominio canónico**: el sitio usa hoy `https://guiapromptsia.com` (sin `www`) en canonical, sitemap, JSON-LD y og:image; el encargo pide `https://www.guiapromptsia.com`. No puedo ver la variable de entorno de Vercel ni la redirección apex→www (R1).
4. **Retirar 4 guías destruye contenido que las olas futuras reutilizarían** (campañas, ofertas de proveedores, competidores, ideas de nuevos productos: ~20.000 palabras). Propongo archivarlas en `content/archivo/` en vez de borrarlas, y reconsiderar la redirección a páginas de área (riesgo de «soft 404») (R8, R9).
5. **`permanent: true` en Next 16 responde 308, no 301.** El código actual ya usa `statusCode: 301`; lo mantendré (R5).
6. **Ya existe un sistema de redirecciones y de 410** (`content/redirects.ts`, `proxy.ts`) con 12 reglas que apuntan a `/…/guias/…`: hay que reapuntarlas para no crear cadenas 301→301 (R4).
7. **Conflictos de contenido entre el encargo y las guías** (R6, R7, R10): analizadores que dejarían contar a la IA, textos N1–N4 del piloto distintos a los de la guía, ficha de 7 campos frente a 6, autor «Nino» frente a «DeveloClick».

## 1. Decisiones que necesito (resumen; el detalle está en cada riesgo)

| # | Decisión | Mi recomendación |
|---|---|---|
| D1 | Dominio canónico: ¿`www` o apex? ¿Qué vale `NEXT_PUBLIC_SITE_URL` en Vercel? | Confírmame el valor real; si es apex, lo mantengo y corrijo el documento. |
| D2 | Capturas antiguas (prompts encadenados): ¿se conservan como «Prueba real del método anterior» dentro de «Método completo», o se repiten con el prompt nuevo? | Conservarlas plegadas con la etiqueta exacta, y repetir la prueba para el ejemplo visible (bloque 6). |
| D3 | Las 4 guías que se retiran: ¿archivar en `content/archivo/` y qué respuesta dan sus URLs (301 a área, 410 o mantenerlas)? | Archivar; 410 (como ya hace el sitio con lo retirado) hasta que vuelvan en su ola. |
| D4 | Autor visible: el encargo dice «Probado por Nino»; el sitio y `content/autores.ts` dicen `DeveloClick` (Organization). | Confírmame nombre y tipo (Person u Organization). |
| D5 | Estructura de imágenes nueva: el encargo usa `/img/{area}/{slug}/…`; hoy es `public/images/guias/{area}/{slug}/…`. | `public/img/{area}/{slug}/`, copiando en la Fase 1 y borrando lo viejo en la Fase 5. |
| D6 | Analizadores (opiniones, ventas): ¿la página calcula los conteos y totales antes del prompt? | Sí: mini-calculadora previa con pruebas. |
| D7 | Runner de tests: no hay Jest ni Vitest (solo `tsx`). | `node:test` con `tsx` (sin dependencias nuevas). |
| D8 | Textos N1–N4 del piloto: difieren de la guía actual y **suman 39 palabras**, más que el «menos de 30» que pide el propio encargo. | Usar tus textos y subir el límite de palabras del ejemplo a 40; o dime qué recortar. |
| D9 | Ficha de anuncios: 7 campos (guía) o 6 (encargo). | Mantener 6 campos + «Datos que no puedes garantizar» como opcional, pero decídelo tú. |

## 2. Inventario de rutas actuales

### 2.1 Rutas de la aplicación (`app/`)

| Ruta | Archivo | Notas |
|---|---|---|
| `/` | `app/(site)/page.tsx` | Muestra «min de lectura». |
| `/guias` | `app/(site)/guias/page.tsx` | Biblioteca (se reemplaza por `/herramientas`). |
| `/{categoria}` (5) | `app/(site)/[categoria]/page.tsx` | Hubs con `content/categorias.ts` (intro y problemas propios). |
| `/{categoria}/guias/{slug}` (20) | `app/(site)/[categoria]/guias/[slug]/page.tsx` | `dynamicParams = false`; una guía por carpeta. |
| `/contacto`, `/sobre-nosotros`, `/politica-de-privacidad`, `/politica-de-cookies`, `/terminos-y-condiciones` | `app/(site)/…` | Fechas en `lib/site.ts` (`institutionalPages`). |
| `/ads.txt` | `app/ads.txt/route.ts` | Publisher ID por variable de entorno, con respaldo fijo. |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` | El sitemap añade imágenes existentes por guía. |
| 410 (retirado) | `proxy.ts` | `/herramientas-ia`, `/prompts`, `/blog`, `/categoria`, `/alternativas`, `/comparativas`, `/noticias`, `/tutoriales`, `/etiqueta`, `/go`, `/buscar`, `/faq`, `/aviso-afiliados`, `/creditos-de-imagenes`, `/mapa-del-sitio`, `/feed.xml`. Su HTML enlaza a `/guias`. |

No existen aún `/herramientas`, `/mi-negocio` ni `/como-probamos`.

### 2.2 Las 20 guías

| Guía actual | Palabras | Prompts / variables | Imágenes en repo | Destino | Tipo nuevo |
|---|---|---|---|---|---|
| `marketing/crear-anuncios-con-ia` | 5.691 | 5 / 12 | 7 (5 de chat) | /marketing/crear-anuncios-con-ia | Generador |
| `marketing/crear-promociones-con-ia` | 5.521 | 4 / 14 | 7 (5 de chat) | /marketing/crear-promociones-con-ia | Calculadora |
| `marketing/crear-afiches-con-ia` | 4.968 | 4 / 12 | 0 (0 de chat) | /marketing/crear-afiches-con-ia | Generador (PILOTO) |
| `marketing/crear-publicaciones-para-redes-sociales-con-ia` | 5.147 | 5 / 12 | 0 (0 de chat) | /marketing/crear-publicaciones-para-redes-con-ia | Generador |
| `marketing/calendario-de-contenido-con-ia` | 4.919 | 5 / 14 | 0 (0 de chat) | /marketing/calendario-de-contenido-con-ia | Kit (fusión con ideas-de-contenido) |
| `marketing/ideas-de-contenido-para-tu-negocio-con-ia` | 5.267 | 5 / 14 | 0 (0 de chat) | /marketing/calendario-de-contenido-con-ia | Kit (se fusiona; su URL vieja redirige) |
| `marketing/crear-campanas-promocionales-con-ia` | 5.191 | 5 / 12 | 0 (0 de chat) | (no se migra) → 301 a /marketing/crear-promociones-con-ia | — |
| `ventas/crear-descripciones-de-productos-con-ia` | 5.257 | 5 / 15 | 0 (0 de chat) | /ventas/crear-descripciones-de-productos-con-ia | Generador |
| `ventas/crear-cotizaciones-y-propuestas-con-ia` | 4.952 | 5 / 14 | 0 (0 de chat) | /ventas/crear-cotizaciones-con-ia | Calculadora |
| `ventas/definir-precios-y-margenes-con-ia` | 4.935 | 5 / 12 | 0 (0 de chat) | /ventas/calcular-precios-y-margenes | Calculadora |
| `clientes/responder-consultas-de-clientes-con-ia` | 4.855 | 5 / 14 | 0 (0 de chat) | /clientes/responder-consultas-con-ia | Generador |
| `clientes/responder-reclamos-con-ia` | 5.147 | 4 / 14 | 0 (0 de chat) | /clientes/responder-reclamos-con-ia | Generador |
| `clientes/analizar-opiniones-de-clientes-con-ia` | 5.408 | 5 / 11 | 0 (0 de chat) | /clientes/analizar-opiniones-con-ia | Analizador |
| `analisis/analizar-ventas-con-ia` | 4.925 | 4 / 11 | 0 (0 de chat) | /analisis/analizar-ventas-con-ia | Analizador |
| *(nueva, sin guía previa)* | — | — | 0 | /analisis/calcular-punto-de-equilibrio | Calculadora (NUEVA) |
| `negocio/organizar-tareas-del-negocio-con-ia` | 5.613 | 4 / 11 | 0 (0 de chat) | /negocio/organizar-tareas-con-ia | Kit (fusión con sistema-diario) |
| `negocio/sistema-diario-de-trabajo-con-ia` | 5.249 | 4 / 9 | 0 (0 de chat) | /negocio/organizar-tareas-con-ia | Kit (se fusiona; su URL vieja redirige) |
| `negocio/documentar-procesos-con-ia` | 5.654 | 4 / 10 | 0 (0 de chat) | /negocio/documentar-procesos-con-ia | Generador |
| `analisis/analizar-ofertas-de-proveedores-con-ia` | 4.998 | 4 / 10 | 0 (0 de chat) | (no se migra) → 301 a /analisis | — |
| `analisis/investigar-competidores-con-ia` | 5.113 | 4 / 10 | 0 (0 de chat) | (no se migra) → 301 a /analisis | — |
| `analisis/ideas-de-nuevos-productos-con-ia` | 5.315 | 4 / 11 | 0 (0 de chat) | (no se migra) → 301 a /analisis | — |

Las 20 están en `status: published`. Palabras = texto de `guide.mdx` + textos visibles de `data.ts` (contador del sitio), es decir, **4.855–5.691** por guía (media ≈ 5.200), no las ~7.000 del documento. El objetivo del documento es 1.500–2.500: un recorte de ~55–70 % en cada página.

## 3. Código y componentes

### 3.1 Contenido y datos (`content/`)
`categorias.ts` (5 áreas con intro y problemas propios: reutilizable para las páginas de área), `autores.ts` (solo `DeveloClick`, Organization), `glosario.ts` (glosario compartido con `Term`), `plan-guias.ts` (hoja de ruta de las 20 guías; alimenta anterior/siguiente y `guia:nueva`), `redirects.ts` (16 reglas: 4 institucionales + 12 hacia guías), `guias/<area>/<slug>/{data.ts,guide.mdx,README.md}`.

### 3.2 Lógica (`lib/`)
`guides/*` (modelo `GuideData`, registro, análisis MDX, similitud entre guías, constantes de rutas `guidePath`, imágenes y `media.ts`), `seo/metadata.ts` y `seo/json-ld.ts`, `site.ts`, `nav-config.ts`, `utils`. **`guidePath()` es el único punto donde se compone la URL `/{area}/guias/{slug}`** y lo usan sitemap, JSON-LD, tarjetas y relacionadas: facilita el cambio de rutas.

### 3.3 Componentes reutilizables tal cual
`layout/` (navbar, footer, theme), `consent/` y `analytics/`, `shared/breadcrumbs`, `shared/legal-page`, `seo/json-ld`, `visual/*`, `ui/*`, y de `guide/`: `copy-button`, `copy-table-button`, `comparison-table`, `prompt-workbench` y `prompt-builder` (constructor de variables con vista previa: base para `FormularioHerramienta`), `zoomable-image` y `image-block` (ya ajustados para móvil), `rubric` (casillas), `guide-card`, `related-guides`, `glossary`.

### 3.4 Componentes que se retiran en la Fase 5
La mayoría de `components/guide/*` que solo existen para el formato largo (`framework-section`, `before-section`, `case-study`, `data-preparation`, `practice-sections`, `step-section`, `checkable-steps`, `checklist-board`, `video-section`, `youtube-facade`, `sources-section`…). Se borran solo tras confirmar que nada las usa.

### 3.5 Validador y scripts
`npm run build` ejecuta `prebuild` → `guias:validar` (`scripts/validate-guides.ts`), que **valida las guías viejas** (secciones, similitud, imágenes, redirecciones y que el `matcher` de `proxy.ts` no coincida con rutas vivas). Cuando las guías desaparezcan, el validador y sus pruebas (`guias:test`, `scripts/test-validator.ts`) necesitan un equivalente para `content/herramientas/`; si no, el build dejará de proteger nada (o fallará). Hay `lint` y `typecheck`, pero **no hay Jest ni Vitest**.

### 3.6 Publicidad ya existente
`AdsenseLoader` (carga el script solo con consentimiento y si existe `NEXT_PUBLIC_ADSENSE_CLIENT_ID`), `components/ads/*` y `GuideAdSlot` (desactivado: `guideAds.enabled = false`). `EspacioAnuncio` será un contenedor vacío, sin código de AdSense, y `ads.txt` no se toca.

## 4. Imágenes

Solo hay archivos para dos guías. Etiqueta que les corresponde según lo que son (no según cómo se llaman):

| Archivo | Tamaño | Qué es | Etiqueta correcta |
|---|---|---|---|
| anuncios · `prueba-prompt-01…05.webp` | 889×624 · 526×817 · 1066×442 · 1134×741 · 562×759 | Capturas de chat reales (transcritas en `docs/crear-anuncios/transcripciones.md`) | **Prueba real** |
| anuncios · `ficha-completa.webp` | 1906×825 | Captura de la hoja «Ficha de anuncio – Casa y Clavo» | Captura de hoja (no es de chat) |
| anuncios · `hero.webp` | 1238×691 | Ilustración antigua (señalada como incorrecta en la revisión anterior) | Ilustración; sustituir o retirar |
| anuncios · `ab-ganch.webp`, `correccion-antes-despues.webp` | 1024×559 · 1024×687 | Huérfanas (no están en el manifiesto) | Ilustración; decidir |
| promociones · `prueba-prompt-01, 02, 03, 04, 04b.webp` | 775×547 · 1087×544 · 634×787 · 522×784 · 517×769 | Capturas de chat reales | **Prueba real** (03, 04 y 04b son de baja resolución) |
| promociones · `datos-necesarios.webp` | 1600×711 | Captura de la hoja «Datos del caso – Café Mirador» | Captura de hoja |
| promociones · `hero.webp` | 1238×691 | Ilustración con texto rasterizado («Caso ficticio») | Ilustración |

**Fuera del repo** (no las moveré sin tu indicación): en `Downloads` hay hojas de cálculo del caso (`Calculadora de promociones - Cafe Mirador.xlsx`, `Ficha de niveles - La Espiga.xlsx`, etc.) y en `Imagenes prompt ia/` hay una serie `E001…` de imágenes generadas con IA (no son pruebas reales). No encontré ninguna captura del chat de La Espiga ni un afiche con foto.

Los manifiestos de las otras 18 guías declaran entre 10 y 12 imágenes cada una que nunca se subieron (por eso el validador emite ~200 avisos): en el modelo nuevo desaparecen.

## 5. Las 20 guías: qué se conserva y a qué bloque va

### `marketing/crear-anuncios-con-ia` → /marketing/crear-anuncios-con-ia

**Guía actual:** Crear anuncios para tu negocio con IA · 5691 palabras · caso: Ferretería Casa y Clavo (ficticia) · tipo actual: comunicacion-atencion, decision-comparacion.
**Activo original:** Ficha de anuncio de siete campos (se copia como tabla), rúbrica de seis criterios con umbrales y hoja de afirmaciones para comprobar cada frase del anuncio.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `anuncio` (+ la tabla de afirmaciones a verificar de `afirmaciones` como parte del formato de salida) · variables actuales entre todos los prompts: 12 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `persuasion`, `variantes`, `canales` |
| 6 · Ejemplo real | Caso Ferretería Casa y Clavo (ficticia). Imágenes existentes: `hero.webp`, `ficha-completa.webp`, `prueba-prompt-01.webp`, `prueba-prompt-02.webp`, `prueba-prompt-03.webp`, `prueba-prompt-04.webp`, `prueba-prompt-05.webp` |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Se entiende sin conocerte; Oferta completa; Beneficio sin promesa; Afirmaciones respaldadas; Una acción clara; Cabe en su canal |
| 8 · Por qué funciona (3–4 ideas) | Marco: Un anuncio llega a quien no te conoce; La oferta se cuenta completa; Beneficio, no promesa; Solo respaldo real; Persuadir con lo verdadero … |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Pedir «un anuncio» sin datos; Escribirlo como si te conocieran; Pedir «más persuasivo» sin decir cómo; Probar dos anuncios que cambian varias cosas; Dar por buena la ficha sin releerla |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ficha: Plantilla de ficha de anuncio (7 filas, copiable); canales: Qué cambia según el canal (3 filas); variantes: Dos versiones del gancho para probar (1 filas); afirmacionesFinal: Hoja de afirmaciones del anuncio final (Anuncio 1, corregido) (14 filas, copiable) · límites: No conoce tu stock ni tus resultados; Puede inventar datos; No configura la campaña; No decide la oferta … |

**Notas y riesgos:** La ficha actual tiene **7 campos** (`FICHA`), el documento pide **6**: hay que decidir cuál manda. Las 5 capturas reales son de los prompts encadenados antiguos, no del prompt maestro nuevo (ver R3). `hero.webp` es la ilustración antigua; `ab-ganch.webp` y `correccion-antes-despues.webp` están huérfanas.

### `marketing/crear-promociones-con-ia` → /marketing/crear-promociones-con-ia

**Guía actual:** Crear promociones con IA: diseña ofertas que sí te convienen · 5521 palabras · caso: Café Mirador (ficticio) — cafetería de barrio · tipo actual: numeros-datos, decision-comparacion.
**Activo original:** Calculadora de promociones para hoja de cálculo (se copia como tabla, con fórmulas en español e inglés) y rúbrica de seis criterios para contrastar las cuentas de la IA.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `alternativas` recibiendo los números que calcula la página · variables actuales entre todos los prompts: 14 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `decision` (como mejora de una línea) |
| 6 · Ejemplo real | Caso Café Mirador (ficticio) — cafetería de barrio. Imágenes existentes: `hero.webp`, `datos-necesarios.webp`, `prueba-prompt-01.webp`, `prueba-prompt-02.webp`, `prueba-prompt-03.webp`, `prueba-prompt-04.webp`, `prueba-prompt-04b.webp` |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Usa solo mis datos; Convierte cada oferta en descuento; Aplica las fórmulas pedidas; Coincide con mi hoja; Marca lo que rompe mis límites; No predice ventas |
| 8 · Por qué funciona (3–4 ideas) | Marco: Margen de una canasta; Descuento real; Ventas necesarias |
| 9 · Según tu tipo de negocio | Ya existe: Restaurante: menú del día entre semana; Servicio: estudio de fotografía |
| 10 · Errores comunes (3–4) | Empezar por el descuento y no por el objetivo; Comparar canastas distintas; Lanzar sin fecha de fin ni métrica; Compartir con la IA datos que no hacen falta |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: calculadora: Calculadora de promociones con el caso de Café Mirador (4 filas, copiable); tipos: Qué tipo de promoción encaja con cada objetivo (5 filas); cuentasVsHoja: Cuentas de la IA frente a mi hoja, fila por fila (4 filas) · límites: No conoce tu mercado local; Las cuentas son una simplificación; No predice cuánto venderás; Puede equivocarse al calcular … |

**Notas y riesgos:** Los prompts `formulas` y `cuentas` desaparecen como pasos (la página calcula). Las capturas 03 y 04 muestran a la IA calculando: chocan con el principio 9 (ver R3). El caso Café Mirador ya coincide con los 4 casos de prueba del encargo (A 4.50/1.30/4.00; B 7.50/2.40/6.375; C 22.50/6.50/18.00; D 9.00/2.60/7.00). Faltan las capturas de la hoja/calculadora (nunca estuvieron en el repo).

### `marketing/crear-afiches-con-ia` → /marketing/crear-afiches-con-ia

**Guía actual:** Crear afiches con IA que se entienden de un vistazo · 4968 palabras · caso: Panadería La Espiga (ficticia) — panadería de barrio · tipo actual: creativa-visual.
**Activo original:** Ficha de los cuatro niveles del afiche (se copia como tabla), rúbrica de seis criterios y hoja de revisión antes de imprimir (tabla copiable).

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `niveles` (+ recorte a menos de 30 palabras de `recorte`, brief de `brief`, prompt de imagen sin texto) · variables actuales entre todos los prompts: 12 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `recorte`, `verificacion` |
| 6 · Ejemplo real | Caso Panadería La Espiga (ficticia) — panadería de barrio. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Usa solo mis datos; Cifras y contacto exactos; Un protagonista y un orden; Se lee de pasada; Una sola acción; Suena a tu negocio |
| 8 · Por qué funciona (3–4 ideas) | Marco: Nivel 1 · Titular; Nivel 2 · Apoyo; Nivel 3 · Acción y contacto; Nivel 4 · Letra pequeña; Prueba de los tres segundos … |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Poner todo lo que quieres decir; Pedir el afiche diseñado, con el texto dentro de una imagen; Reescribir a mano los datos al maquetar; Diseñar sin pensar en la distancia; Poco contraste entre texto y fondo |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: niveles: Ficha de los cuatro niveles (4 filas, copiable); brief: Brief de diseño del afiche de La Espiga (9 filas); protagonista: Protagonista del afiche según su objetivo (4 filas); revision: Hoja de revisión del afiche final (4 filas, copiable) · límites: No diseña el afiche; No conoce dónde se verá; Puede añadir datos; Las reglas de publicidad varían … |

**Notas y riesgos:** **0 imágenes en el repo**: no existe la captura del chat ni el afiche con la foto de los panes. Los textos N1–N4 del encargo **no coinciden** con los de la guía actual (ver R7). Fuera del repo solo aparece `Downloads/Ficha de niveles - La Espiga.xlsx`.

### `marketing/crear-publicaciones-para-redes-sociales-con-ia` → /marketing/crear-publicaciones-para-redes-con-ia

**Guía actual:** Crear publicaciones para redes sociales con IA · 5147 palabras · caso: Peluquería Rizo Fino (ficticia) · tipo actual: comunicacion-atencion.
**Activo original:** Plantilla de brief de siete campos (se copia como tabla) y rúbrica de seis criterios con umbrales para puntuar cualquier publicación.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `publicacion` (con el brief de `brief` como campos del formulario) · variables actuales entre todos los prompts: 12 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `tono`, `formatos`, `revision` |
| 6 · Ejemplo real | Caso Peluquería Rizo Fino (ficticia). Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Cumple el objetivo del brief; Usa solo datos del brief; Le habla a su público; Suena a tu negocio; Pide una sola acción clara; Cabe en su formato |
| 8 · Por qué funciona (3–4 ideas) | Marco: Objetivo; Público; Producto u oferta; Tono; Formato … |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Pedir el texto sin escribir el brief; Pegar datos aproximados como exactos; Quedarte con la primera opción; Pedir «hazlo más vendedor»; Copiar el mismo texto en todos los formatos |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: brief: Plantilla de brief de publicación (7 filas, copiable); versiones: Versiones de la publicación por formato (4 filas) · límites: No conoce tus resultados; Puede inventar datos; No decide qué publicar; No diseña la imagen ni programa la publicación … |

**Notas y riesgos:** La ruta cambia de slug (quita «sociales»). El brief actual tiene 7 campos; el documento pide 6 (sin «frecuencia»). Sin imágenes.

### `marketing/calendario-de-contenido-con-ia` → /marketing/calendario-de-contenido-con-ia

**Guía actual:** Crear un calendario de contenido con IA que cabe en tu tiempo · 4919 palabras · caso: Restaurante Mesa Larga (ficticio) — restaurante familiar · tipo actual: estrategia-planificacion, numeros-datos.
**Activo original:** Calculadora de capacidad semanal para hoja de cálculo (se copia como tabla, con fórmulas en español e inglés), rúbrica de cinco criterios y calendario de cuatro semanas (tabla copiable).

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `calendario` (+ el banco de ideas de `principal` de la otra guía) · variables actuales entre todos los prompts: 14 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `revision`, `ajuste`, `reciclaje` |
| 6 · Ejemplo real | Caso Restaurante Mesa Larga (ficticio) — restaurante familiar. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Cabe en mi tiempo; Sale de mi banco; Respeta mis días y mis fechas; No repite el mismo tipo de pieza; Se produce en un bloque |
| 8 · Por qué funciona (3–4 ideas) | Marco: Capacidad; Tiempo por pieza; Producción por lotes; Reciclaje |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Planear sin medir tus tiempos; Llenar el cien por ciento de tu tiempo; Reciclar una pieza sin cambiarle nada; Dar por buena una fecha que no verificaste |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: hoja: Fórmulas de la calculadora, en español e inglés (5 filas); calculadora: Calculadora de capacidad con la semana 1 del caso (8 filas, copiable); final: Calendario final de cuatro semanas (14 filas, copiable); reciclaje: Plan de reciclaje para la semana 4 (1 filas) · límites: No conoce tu ritmo; Puede sumar mal o colocar mal una fecha; No programa ni publica; No sabe cuándo rinde mejor cada pieza … |

**Notas y riesgos:** Es una fusión de dos guías con casos distintos (Mesa Larga y Patitas): hay que elegir un caso. La guía tiene una calculadora de capacidad semanal que el documento no contempla para este Kit; propongo conservarla como comprobación de horas disponibles (ver R10).

### `marketing/ideas-de-contenido-para-tu-negocio-con-ia` → /marketing/calendario-de-contenido-con-ia

**Guía actual:** Ideas de contenido para tu negocio con IA que no suenan genéricas · 5267 palabras · caso: Patitas (ficticia) — tienda de mascotas de barrio · tipo actual: estrategia-planificacion.
**Activo original:** Ficha de materia prima (se copia como tabla), rúbrica de cinco criterios con umbrales y banco de ideas priorizado (tabla copiable).

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `principal` y `entrevista` pasan al Kit de calendario (banco de 12 ideas) · variables actuales entre todos los prompts: 14 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `evaluacion`, `iteracion` |
| 6 · Ejemplo real | Caso Patitas (ficticia) — tienda de mascotas de barrio. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Sale de un elemento concreto de mi materia prima; Responde a una duda o problema real de mi cliente; Puedo producirla con mi tiempo y mis formatos; Se reconoce como de mi negocio; Tiene una acción que lleva a mi objetivo |
| 8 · Por qué funciona (3–4 ideas) | Marco: Materia prima; Pilar de contenido; Formato y canal; Objetivo y una sola acción |
| 9 · Según tu tipo de negocio | Ya existe: Restaurante: la temporada la marca la cocina; Servicio profesional: explicar sin aconsejar |
| 10 · Errores comunes (3–4) | Pedir ideas sin darle nada de tu negocio; Pedir muchísimas ideas de una vez; Publicar la primera idea sin evaluarla; No tener un objetivo |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: materia: Ficha de materia prima (6 filas, copiable); medicion: Qué mirar según el objetivo del mes (4 filas) · límites: No conoce tus resultados; Puede añadir datos; No sustituye tu criterio; No redacta ni programa por ti … |

**Notas y riesgos:** Sus dos ejemplos por rubro (restaurante y servicio profesional) son de lo poco que ya existe para «Según tu tipo de negocio».

### `marketing/crear-campanas-promocionales-con-ia` → (no se migra) → 301 a /marketing/crear-promociones-con-ia

**Guía actual:** Crear una campaña promocional completa con IA · 5191 palabras · caso: Hilo y Botón (ficticio) — tienda de ropa de barrio · tipo actual: estrategia-planificacion, comunicacion-atencion.
**Activo original:** Ficha de campaña de diez campos con «Aparece en», matriz de coherencia pieza por campo, rúbrica de cinco criterios con dos reglas de bloqueo y plan de medición previo (tablas copiables).

**Destino:** no se migra en el lanzamiento. 5.191 palabras y 12 imágenes previstas quedarían sin destino. El destino previsto tiene otra intención (una campaña completa frente a una calculadora de promoción): riesgo de «soft 404» (ver R8). Volverá en la ola 2 como Kit: conviene archivar el contenido, no borrarlo (ver R9).
**Contenido valioso (para la ola futura):** rúbrica (Mismos datos; Solo lo que la ficha respalda; Cada pieza tiene su papel; Habla a quien le toca; Una acción, y se puede contar); ideas de marco (Una ficha, una sola verdad; Un papel para cada pieza; Qué va en cada pieza; Medir antes de lanzar); errores (Pedir cada pieza en una conversación distinta; Cambiar un dato en una pieza y no en las demás; Decidir después cómo medir; Atribuirle a la campaña todo lo que cambió).

### `ventas/crear-descripciones-de-productos-con-ia` → /ventas/crear-descripciones-de-productos-con-ia

**Guía actual:** Crear descripciones de productos con IA sin inventar datos · 5257 palabras · caso: Luz de Cera (ficticio) — taller de velas artesanales · tipo actual: comunicacion-atencion, tema-sensible.
**Activo original:** Ficha de producto con estado y origen de cada dato, tabla de respaldo por tipo de afirmación (ambas copiables) y rúbrica de cinco criterios con dos reglas de bloqueo.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `redaccion` (+ ficha de producto como campos; lista FALTA de `auditoria`) · variables actuales entre todos los prompts: 15 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `ajuste`, `canal` |
| 6 · Ejemplo real | Caso Luz de Cera (ficticio) — taller de velas artesanales. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Cada hecho tiene su fila; No insinúa lo que no se afirma; Sin promesas de seguridad ni salud; Responde las dudas del comprador; Cumple el largo y el canal |
| 8 · Por qué funciona (3–4 ideas) | Marco: Una ficha, una sola fuente; Hecho, adjetivo o promesa; Un hueco se anota, no se rellena; Comparar antes que recordar |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Pedirle a la IA que «complete» lo que no sabes; Pegar el texto del proveedor como si fuera tuyo; Publicar porque «suena bien»; Meter precio, envío o promociones en la descripción |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ficha: Ficha de la Vela Cedro y Vainilla (11 filas, copiable); afirmaciones: Qué respaldo pide cada tipo de afirmación (6 filas, copiable); adaptada: Descripción adaptada a un canal (1 filas) · límites: No conoce tu producto; Prohibir no asegura que obedezca; No valida seguridad, salud ni normativa; Una buena descripción no compensa lo demás |

**Notas y riesgos:** Tema sensible (afirmaciones de seguridad o salud): sus advertencias se conservan. El encargo cita «Luz de Cera (caso actual)» como ejemplo real, pero no hay ninguna captura: sería un ejemplo ficticio sin prueba real hasta que se pruebe.

### `ventas/crear-cotizaciones-y-propuestas-con-ia` → /ventas/crear-cotizaciones-con-ia

**Guía actual:** Crear cotizaciones y propuestas comerciales con IA · 4952 palabras · caso: Maderas Rivera (ficticio) — carpintería de muebles a medida · tipo actual: numeros-datos, comunicacion-atencion.
**Activo original:** Calculadora de cotización para hoja de cálculo con fórmulas en español e inglés, tabla de condiciones con lo confirmado y lo pendiente (ambas copiables) y rúbrica de cinco criterios con dos reglas de bloqueo.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `cotizacion` con los totales ya calculados (condiciones de `condiciones` como campos) · variables actuales entre todos los prompts: 14 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `revision`, `ajuste` |
| 6 · Ejemplo real | Caso Maderas Rivera (ficticio) — carpintería de muebles a medida. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Las cifras coinciden con la hoja; Solo condiciones confirmadas; Dice qué incluye y qué no; Se puede aceptar sin preguntar; Sin promesas que nadie respalda |
| 8 · Por qué funciona (3–4 ideas) | Marco: Cotización y propuesta: mismo cálculo, distinto documento; Las condiciones las decides tú; Cada porcentaje tiene una base; Un solo criterio de redondeo |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Pedirle a la IA que calcule y redacte en un solo mensaje; Dejar que la IA complete tus condiciones; Escribir un porcentaje sin su base; Cambiar una cifra en el texto y no en la hoja |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ingenuo: El pedido ingenuo: lo que escribió la IA y lo que calcula la hoja (4 filas); hoja: Fórmulas de la calculadora, en español e inglés (9 filas); calculadora: Calculadora de cotización con el caso de Maderas Rivera (12 filas, copiable); condiciones: Tabla de condiciones del caso (8 filas, copiable) · límites: No fija tu precio; No conoce tus condiciones; No da asesoría legal ni tributaria; No envía ni da seguimiento |

**Notas y riesgos:** La guía calcula en una hoja de 12 filas con fórmulas ES/EN; la página pasa a calcular (subtotales, descuento, impuesto, total). Cada porcentaje debe declarar su base (criterio de la guía): hay que reflejarlo en las fórmulas y en sus pruebas.

### `ventas/definir-precios-y-margenes-con-ia` → /ventas/calcular-precios-y-margenes

**Guía actual:** Definir precios y márgenes con apoyo de la IA · 4935 palabras · caso: Galletería Migas (ficticio) — galletas artesanales por encargo · tipo actual: numeros-datos, decision-comparacion.
**Activo original:** Calculadora de costo y precio para hoja de cálculo con fórmulas en español e inglés (copiable), tabla de escenarios y rúbrica de cinco criterios con dos reglas de bloqueo.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `lectura` sobre los números que calcula la página · variables actuales entre todos los prompts: 12 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `escenarios`, `ajuste` |
| 6 · Ejemplo real | Caso Galletería Migas (ficticio) — galletas artesanales por encargo. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Las cifras son las de la hoja; Cada porcentaje dice su base; No decide ni promete; Nombra lo que supone la hoja; Deja preguntas para aclarar |
| 8 · Por qué funciona (3–4 ideas) | Marco: Costo completo, no solo ingredientes; Margen y recargo no son lo mismo; Precio mínimo, objetivo y elegido; Cada supuesto mueve el resultado |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Contar solo los ingredientes; Sumar el margen al costo; Dar por cierto un volumen de ventas; Preguntarle a la IA si el precio es rentable |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ingenuo: El pedido ingenuo: lo que escribió la IA y lo que calcula la hoja (3 filas); hoja: Las fórmulas de cada celda, en español y en inglés (9 filas); calculadora: Calculadora de costo y precio con el caso de la galletería (18 filas, copiable); escenarios: Escenarios propuestos por el prompt (3 filas); resultados: Resultado de cada escenario, calculado en la hoja (4 filas, copiable) · límites: No decide el precio; No conoce tus ventas; No reparte tus gastos fijos; No da asesoría contable ni tributaria |

**Notas y riesgos:** Ambigüedad a resolver antes de escribir la fórmula: **margen sobre precio o recargo sobre costo** (la guía insiste en que no son lo mismo). Los campos del encargo («margen deseado %») exigen fijar la base. La calculadora actual tiene 18 filas: se reduce.

### `clientes/responder-consultas-de-clientes-con-ia` → /clientes/responder-consultas-con-ia

**Guía actual:** Responder consultas de clientes con IA sin prometer de más · 4855 palabras · caso: Taller Los Pinos (ficticio) — taller mecánico de barrio · tipo actual: comunicacion-atencion.
**Activo original:** Base de respuestas con lo que cambia cada día y cuándo responde una persona (tabla copiable), mapa de decisión sobre qué prepara la IA y qué atiende una persona (tabla copiable) y rúbrica de cinco criterios con dos reglas de bloqueo.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `borrador` (6 variables) simplificado a 3 campos + perfil · variables actuales entre todos los prompts: 14 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `revision`, `canal`, `ajuste` |
| 6 · Ejemplo real | Caso Taller Los Pinos (ficticio) — taller mecánico de barrio. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Cada dato sale de tu base; No diagnostica ni promete; Pide lo que falta; Atiende todo lo que preguntó; Escala cuando toca |
| 8 · Por qué funciona (3–4 ideas) | Marco: Lo estable y lo del día van separados; Un borrador no es una respuesta; Cada dato dice de dónde sale; Hay consultas que no se preparan |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Responder con la IA sin una base propia; Pegar datos personales que no hacen falta; Enviar el borrador sin contrastarlo; No actualizar la base |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: base: Base de respuestas del taller (6 filas, copiable); tipos: Qué puede hacer la IA con cada tipo de consulta (6 filas, copiable); correo: El borrador final, adaptado a correo (1 filas) · límites: No conoce el estado de un pedido; No es un chatbot; No sustituye la atención humana; No cumple la normativa por ti |

**Notas y riesgos:** La «base de respuestas» (prompt `base`) solapa con el perfil «Mi negocio»: hay que decidir qué va en el perfil y qué en cada consulta. Sin imágenes.

### `clientes/responder-reclamos-con-ia` → /clientes/responder-reclamos-con-ia

**Guía actual:** Responder reclamos de clientes con IA · 5147 palabras · caso: Luz de Barrio (ficticio) — tienda online de velas artesanales · tipo actual: comunicacion-atencion, tema-sensible.
**Activo original:** Ficha del reclamo y tarjeta de decisión copiables, y rúbrica de cinco criterios con dos reglas de bloqueo para revisar la respuesta antes de enviarla.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `privada` (+ `publica` como mejora; la ficha `ficha` pasa a ser los campos) · variables actuales entre todos los prompts: 14 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `publica`, `ajuste` |
| 6 · Ejemplo real | Caso Luz de Barrio (ficticio) — tienda online de velas artesanales. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Cada hecho sale de tu ficha; Ofrece solo lo que decidiste; Reconoce lo que pasó, sin culpar ni discutir; Responde a cada punto; Suena sereno y claro |
| 8 · Por qué funciona (3–4 ideas) | Marco: Primero, la pausa; Hechos, versión y emoción no son lo mismo; La decisión va antes del texto; Lo privado resuelve, lo público tranquiliza |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Responder en caliente; Pedirle a la IA que «lo calme» sin hechos; Discutir en la reseña pública; Dar todo por cierto o todo por falso |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ingenuo: El pedido ingenuo: lo que escribe la IA y por qué no se sostiene (4 filas); registro: Registro de hechos del caso (8 filas, copiable); ficha: Ficha del reclamo: puntos del cliente (5 filas, copiable); fichaExtra: Ficha del reclamo: el resto de apartados (4 filas); tarjeta: Tarjeta de decisión (9 filas, copiable); publica: Respuesta pública a la reseña (4 filas) · límites: No cubre reclamos con riesgo legal o de salud; No arregla la causa; No controla la reseña; Necesita políticas propias |

**Notas y riesgos:** Tema sensible: se conservan la pausa previa y la separación hechos/versión/emoción. Sin imágenes.

### `clientes/analizar-opiniones-de-clientes-con-ia` → /clientes/analizar-opiniones-con-ia

**Guía actual:** Analizar opiniones de clientes con IA · 5408 palabras · caso: Restaurante La Higuera (ficticio) — restaurante familiar · tipo actual: numeros-datos, tema-sensible.
**Activo original:** Libro de códigos y hoja de conteo copiables (fórmulas en español e inglés que cuentan menciones y comprueban citas) y rúbrica de cinco criterios con dos reglas de bloqueo.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `clasificacion` (+ libro de códigos de `codigos`) · variables actuales entre todos los prompts: 11 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `lectura`, `ajuste` |
| 6 · Ejemplo real | Caso Restaurante La Higuera (ficticio) — restaurante familiar. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Cada cita está en su reseña; Aplica el libro de códigos; Recoge todas las menciones; La valencia es la del texto; No cuenta ni calcula |
| 8 · Por qué funciona (3–4 ideas) | Marco: Una opinión, una o dos menciones; Un tema tiene límites; Una cita es una cita; Pocas opiniones, pocas afirmaciones |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Pegar reseñas con datos personales; Dejar que la IA cuente; Aceptar citas que no puedes comprobar; Explicar por qué se quejan |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ingenuo: El pedido ingenuo: lo que escribió la IA y lo que dice la hoja (3 filas); resenas: Las reseñas del caso, anonimizadas (25 filas, copiable); libro: Libro de códigos del restaurante (6 filas, copiable); hoja: Las fórmulas de la hoja, en español y en inglés (6 filas); calculadora: Bloque de conteo para pegar en J1 (8 filas, copiable); hallazgos: Hallazgos ordenados por menciones (5 filas, copiable); limites: Oportunidades a explorar y límites de lo que se puede afirmar (6 filas); conteos: Conteo por tema: primera clasificación y clasificación final (7 filas, copiable) · límites: No explica por qué se quejan; No representa a todos tus clientes; No decide qué mejorar; No cubre la normativa de datos |

**Notas y riesgos:** **Conflicto con el principio 9**: el encargo pide «temas con conteo», pero la guía enseña justo lo contrario (la IA no cuenta; cuenta la hoja). Si la página no cuenta, el aviso «verificar los conteos» no basta (ver R6). Aviso de datos personales: se conserva.

### `analisis/analizar-ventas-con-ia` → /analisis/analizar-ventas-con-ia

**Guía actual:** Analizar tus ventas con IA sin tomar hipótesis por hechos · 4925 palabras · caso: Verde Hogar (ficticio) — tienda de plantas de interior · tipo actual: numeros-datos.
**Activo original:** Hoja de ventas y resumen copiable (fórmulas ES/EN, total de control y comparación por día abierto), mapa de preguntas y rúbrica de seis criterios con dos bloqueos.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `principal` sobre un resumen ya calculado · variables actuales entre todos los prompts: 11 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `auditoria`, `ajuste` |
| 6 · Ejemplo real | Caso Verde Hogar (ficticio) — tienda de plantas de interior. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Cada cifra está en tu resumen; Separa hechos de hipótesis; Ofrece alternativas; Compara de forma justa; Dice cómo comprobar; Dice lo que no se puede afirmar |
| 8 · Por qué funciona (3–4 ideas) | Marco: Calcular, interpretar y decidir son tres trabajos; Una hipótesis no es una causa; Compara de forma justa; Con tres datos no hay tendencia |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Pegar las ventas sueltas; Aceptar un «porque» sin comprobar; Comparar periodos desiguales; Hablar de tendencias con pocos datos |
| 11 · FAQ (4–6) | 3 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ingenuo: El pedido ingenuo: lo que escribe la IA y lo que dice la hoja (4 filas); preguntas: Cinco preguntas que tus ventas pueden contestar (3 filas, copiable); plantilla: Plantilla de la hoja de ventas y resumen (5 filas, copiable); hoja: Las fórmulas de la hoja, en español y en inglés (10 filas, copiable); resumen: Resumen del trimestre de Verde Hogar (9 filas, copiable); diaAbierto: Datos nuevos de la hoja: comparación por día abierto y unidades (7 filas); limites: Cuándo no se puede afirmar (4 filas, copiable) · límites: No encuentra causas; Con pocos datos no hay conclusiones; Depende de que tú cuentes lo que pasó; No sustituye a un contador |

**Notas y riesgos:** **Conflicto con el principio 9**: el encargo pega la «tabla de ventas» cruda para que la IA la analice, y la guía enseña a resumir primero en la hoja y pegar el resumen. Propongo que la página calcule el resumen (ver R6). Sin imágenes.

### `analisis/calcular-punto-de-equilibrio` (NUEVA)

**Destino:** /analisis/calcular-punto-de-equilibrio · Calculadora (NUEVA).

**Contenido:** se escribe desde cero con un caso ficticio (Café Mirador). Campos: costos fijos del mes, precio promedio de venta, costo variable por unidad, días que abre al mes. La página calcula margen de contribución, unidades y ventas en $ al mes y por día. La IA explica el resultado y propone 3 formas de bajar el punto de equilibrio. Se reutiliza de las guías existentes solo el criterio «los cálculos los hace la página» y el bloque de errores sobre costos (ver `definir-precios-y-margenes-con-ia`: «Contar solo los ingredientes»).

**Notas y riesgos:** No existe contenido previo: se escribe desde cero con caso ficticio (Café Mirador, para continuidad). Las fórmulas se prueban con 3 casos.

### `negocio/organizar-tareas-del-negocio-con-ia` → /negocio/organizar-tareas-con-ia

**Guía actual:** Organizar las tareas de tu negocio con IA · 5613 palabras · caso: Lavandería Brisa (ficticia), un negocio familiar con tres personas · tipo actual: estrategia-planificacion, numeros-datos.
**Activo original:** Matriz de prioridad (impacto por urgencia), plantilla de hoja con fórmulas en español e inglés, plan de la semana con comprobación de minutos y rúbrica de seis criterios con dos bloqueos.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `ordenar` + `semana` (+ rutina de 15 min de `apertura`/`cierre`) · variables actuales entre todos los prompts: 11 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `ajuste` |
| 6 · Ejemplo real | Caso Lavandería Brisa (ficticia), un negocio familiar con tres personas. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Cada fila es una tarea tuya; No inventa fechas ni minutos; El impacto sale de tu texto; Encuentra lo que depende de otra tarea; Asigna solo lo que cada persona puede hacer; No decide por ti |
| 8 · Por qué funciona (3–4 ideas) | Marco: Una tarea es una acción con un final claro; La prioridad sale de una regla; Cabe lo que cabe; Lo que se repite se reserva primero |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Poner todo en «urgente»; Dejar que la IA decida qué importa; Aceptar un plan sin sumar; Inventar los minutos que faltan; Dejar tareas que no caben en un día |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ingenuo: El pedido ingenuo: lo que escribe la IA y lo que dicen tus datos (4 filas); lista: Los pendientes de Ana, tal como los escribió (25 filas); disponibilidad: Capacidad de la semana: minutos por día para pendientes (3 filas, copiable); matriz: Matriz de prioridad: impacto por urgencia (3 filas, copiable); plantilla: Plantilla de la hoja (8 filas, copiable); hoja: Las fórmulas de la hoja, en español y en inglés (8 filas, copiable); prioridad: Prioridad calculada por la hoja (6 filas); plan: Plan de la semana (13 filas) … · límites: El impacto es una propuesta; La regla no mide todo; Los minutos son estimaciones; No es una aplicación |

**Notas y riesgos:** La guía comprueba con una suma que el plan cabe en las horas del día: es un cálculo que debe hacer la página, no la IA.

### `negocio/sistema-diario-de-trabajo-con-ia` → /negocio/organizar-tareas-con-ia

**Guía actual:** Un sistema diario de trabajo con IA para tu negocio · 5249 palabras · caso: Moda Norte (ficticia), una tienda de ropa de barrio con local y venta por WhatsApp · tipo actual: estrategia-planificacion, conceptual-educativa.
**Activo original:** Ficha de contexto, nota de traspaso, mapa de seis bloques con lo que no se delega, semana tipo y revisión semanal (copiables), y rúbrica de seis criterios con dos bloqueos.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `apertura` y `cierre` pasan a «rutina diaria de 15 minutos» · variables actuales entre todos los prompts: 9 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `ficha`, `ajuste` |
| 6 · Ejemplo real | Caso Moda Norte (ficticia), una tienda de ropa de barrio con local y venta por WhatsApp. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Todo sale de tu nota, tu agenda o tu ficha; Tres prioridades como máximo, cada una una acción; Respeta lo que espera algo o a alguien; Respeta lo que ya decidiste; Cada motivo sale de tu nota; No inventa tiempos ni urgencias |
| 8 · Por qué funciona (3–4 ideas) | Marco: Un hábito pequeño gana a uno grande; La memoria es tuya; Cada bloque tiene su límite; El sistema se ajusta cada semana |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Empezar cada conversación de cero; Dejar que la IA decida qué importa; Escribir la nota de traspaso de memoria; Enviar lo que redactó sin compararlo con la ficha; Querer usar todos los bloques desde el primer día |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ingenuo: El pedido ingenuo: lo que escribe la IA y lo que dice tu ficha (4 filas); plantilla: Ficha de contexto: los nueve campos (9 filas, copiable); ficha: La ficha de Camila (9 filas); apuntes: Los apuntes de Camila del lunes, tal como los escribió (8 filas); nota: Nota de traspaso del lunes (8 filas); bloques: Los seis bloques del día (6 filas, copiable); semana: Una semana tipo de la tienda (6 filas, copiable); revision: Revisión del viernes (5 filas, copiable) · límites: La ficha envejece; La nota es tan buena como tus apuntes; La IA puede equivocarse aun con tu ficha; No es una herramienta de gestión |

**Notas y riesgos:** Solo aporta la rutina y la nota de traspaso; el resto duplica a organizar-tareas.

### `negocio/documentar-procesos-con-ia` → /negocio/documentar-procesos-con-ia

**Guía actual:** Documentar procesos de tu negocio con IA · 5654 palabras · caso: Cerámica Sol (ficticia), una tienda online de cerámica artesanal · tipo actual: automatizacion-flujo, comunicacion-atencion.
**Activo original:** Ficha del proceso, entrevista guiada, procedimiento en formato fijo, versión para quien empieza y registro de la prueba (copiables), y rúbrica de seis criterios con dos bloqueos.

| Bloque nuevo | Se construye con (contenido de la guía actual) |
|---|---|
| 3 · Herramienta / prompt maestro | `procedimiento` (la entrevista `entrevista` pasa a ser una mejora) · variables actuales entre todos los prompts: 10 → objetivo: campos propios + perfil |
| 5 · Mejora el resultado (1 línea) | `checklist`, `ajuste` |
| 6 · Ejemplo real | Caso Cerámica Sol (ficticia), una tienda online de cerámica artesanal. Imágenes existentes: ninguna |
| 7 · Revisa antes de publicar (5 casillas) | Rúbrica → casillas: Todo sale de tus respuestas; Un paso, una acción; Cada paso dice cómo saber que salió bien; Lo que sale distinto dice qué hacer; Lo entiende quien nunca lo hizo; Lo que no sabes queda marcado |
| 8 · Por qué funciona (3–4 ideas) | Marco: Lo que haces no es lo que crees que haces; Un procedimiento responde cinco preguntas; Lo raro también se escribe; Sirve cuando otra persona lo logra |
| 9 · Según tu tipo de negocio | **Contenido nuevo**: la guía actual no tiene ejemplos por rubro (se escribirán ficticios, marcados)  |
| 10 · Errores comunes (3–4) | Contar el proceso de memoria; Pedirle el procedimiento a la IA sin entrevista; Escribir para ti; Probarlo con quien ya sabe; Ayudar durante la prueba |
| 11 · FAQ (4–6) | 4 preguntas actuales |
| Método completo (plegado) | Tablas/plantillas copiables: ingenuo: El pedido ingenuo: lo que escribe la IA y lo que pasa en tu negocio (4 filas); ficha: Ficha del proceso (6 filas, copiable); recorrido: Notas del recorrido de Lucía, tal como las anotó (7 filas); respuestas: Resumen de las respuestas de Lucía (7 filas); checklist: Versión para quien empieza (12 filas, copiable); prueba: Registro de la prueba con otra persona (12 filas, copiable) · límites: El procedimiento es tan bueno como tu recorrido; Una prueba no cubre todos los casos; No reemplaza la formación; Describe pasos, no los ejecuta |

**Notas y riesgos:** La guía exige probar el procedimiento con alguien que nunca lo hizo: se resume en «Revisa antes de publicar». Sin imágenes.

### `analisis/analizar-ofertas-de-proveedores-con-ia` → (no se migra) → 301 a /analisis

**Guía actual:** Analizar ofertas de proveedores con IA · 4998 palabras · caso: Heladería Polo Norte (ficticia) — heladería artesanal · tipo actual: numeros-datos, decision-comparacion.
**Activo original:** Hoja comparadora copiable (fórmulas ES/EN con costo real por unidad y alerta de precios sospechosos), mapa de decisión copiable y rúbrica de cinco criterios con dos bloqueos.

**Destino:** no se migra en el lanzamiento. Ola 2 prevista como `/analisis/comparar-proveedores` (Calculadora). Su hoja comparadora es un buen punto de partida: archivar (R9). Redirigir a un área genérica es riesgo de soft 404 (R8).
**Contenido valioso (para la ola futura):** rúbrica (Cada cifra coincide con la oferta; Marca lo que falta o queda abierto; Deja a la vista lo que no es igual; No calcula; Respeta el formato pedido); ideas de marco (Compara lo mismo con lo mismo; El precio de lista no es el precio real; Cada herramienta hace lo suyo; Lo que falta también es información); errores (Comparar los precios de lista; Dar por iguales productos distintos; Pegar en la hoja lo que devolvió la IA sin mirar la oferta; Decidir con dudas pendientes).

### `analisis/investigar-competidores-con-ia` → (no se migra) → 301 a /analisis

**Guía actual:** Investigar competidores con IA · 5113 palabras · caso: Gimnasio Cima (ficticio), gimnasio de barrio con clases en grupos pequeños · tipo actual: estrategia-planificacion, decision-comparacion.
**Activo original:** Plan de investigación, ficha de evidencia copiable (con fuente, fecha y tipo de dato por fila), guía de cinco tipos de dato y rúbrica de seis criterios con dos bloqueos.

**Destino:** no se migra en el lanzamiento. Ola 3. Archivar (R9). Enlazada desde ideas-de-nuevos-productos.
**Contenido valioso (para la ola futura):** rúbrica (Cada dato lleva su fuente; Distingue hecho, opinión y estimación; Marca «Sin dato» y no rellena; Compara solo lo comparable; Dice cómo comprobar; Dice lo que no se puede afirmar); ideas de marco (Un dato sin fuente y sin fecha no es un dato; No todo dato pesa lo mismo; «Sin dato» no es «no lo tiene»; Diferenciarse se comprueba con clientes); errores (Preguntarle a la IA cómo son tus competidores; Anotar datos sin fuente ni fecha; Tratar una opinión como un hecho; Concluir que no lo tiene porque no lo publica …).

### `analisis/ideas-de-nuevos-productos-con-ia` → (no se migra) → 301 a /analisis

**Guía actual:** Ideas de nuevos productos o servicios con IA · 5315 palabras · caso: Panadería La Espiga (ficticia), panadería de barrio con panes y tortas · tipo actual: estrategia-planificacion, decision-comparacion.
**Activo original:** Ficha de problemas de clientes, matriz de puntuación de cinco criterios, plan y registro de validación copiables, y rúbrica de seis criterios con dos bloqueos.

**Destino:** no se migra en el lanzamiento. Ola 3. Usa también el caso La Espiga (la misma panadería que el piloto de afiches). Archivar (R9).
**Contenido valioso (para la ola futura):** rúbrica (Cada idea nace de tu ficha; No inventa datos de mercado; Dice qué tendría que ser cierto; Respeta lo que puedes hacer; Propone una prueba concreta; No decide ni promete); ideas de marco (Se parte del problema, no de la idea; Una idea es una hipótesis; Necesitar algo no es poder hacerlo; Los criterios se fijan antes de la prueba); errores (Empezar por la idea y no por el problema; Creer los datos de mercado que da la IA; Puntuar por entusiasmo; Invertir antes de probar …).

## 6. Riesgos y discrepancias

Gravedad: **A** = puede invalidar una regla del encargo; **M** = afecta a SEO o a la calidad; **B** = detalle.

**R1 · Dominio canónico (A).** `lib/site.ts`: `siteUrl = NEXT_PUBLIC_SITE_URL ?? "https://guiapromptsia.com"`. El HTML generado hoy lleva `<link rel="canonical" href="https://guiapromptsia.com/…">`, y lo mismo el sitemap, el JSON-LD y las og:image. El encargo exige `https://www.guiapromptsia.com`. Si producción ya sirve el apex y Google lo tiene indexado, cambiar a `www` sin redirección 301 apex→www duplica el sitio. **NO PUDE COMPROBARLO**: el valor en Vercel, ni si el dominio principal es apex o `www`. Decisión D1.

**R2 · JSON-LD (B).** El HTML generado de una guía trae hoy 4 scripts `application/ld+json`: `Organization` y `WebSite` (layout, en todas las páginas) y `BreadcrumbList` y `Article` (la página). Hay un solo `Article` por página, como pide el encargo; los dos globales no lo duplican. El `Article` usa `author` = `DeveloClick` (Organization) y `publisher` con logo. Conviene conservarlos y añadir `FAQPage` solo si el bloque 11 tiene 4 o más preguntas visibles.

**R3 · Pruebas reales que no corresponden al prompt nuevo (A).** Reglas 3 y 4 del encargo: el texto debe coincidir con la captura y «Probado por…» solo aparece si la prueba existe. Las 10 capturas de chat existentes son de prompts encadenados con muchas variables. Consecuencias: (a) el bloque 6 de anuncios y promociones no puede presentarlas como prueba del formulario nuevo; (b) en promociones la IA calcula (capturas 03 y 04) y el nuevo principio 9 lo prohíbe; el texto «qué corregí yo» y los números del ejemplo deberían salir de la calculadora, no de esas capturas. Opciones en D2. Hasta entonces `publicado: false` para toda página cuya prueba no exista.

**R4 · Cadenas de redirecciones (M).** `content/redirects.ts` tiene 16 reglas; 12 apuntan a `/…/guias/…`. Al activar las URLs nuevas hay que reapuntarlas directamente a las nuevas (no dejar 301→301). `lib/guides/redirects.ts` solo activa las que apuntan a guías «publicadas» y lee el estado del `data.ts` de la guía: hay que reemplazar ese criterio por el `publicado` de los datos nuevos.

**R5 · Código de estado (B).** En Next 16 `permanent: true` = 308 (`node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md`). El documento pide 301; se usará `statusCode: 301` como hace hoy el sitio. Además, el proyecto es `next.config.ts`, no `.js`.

**R6 · Analizadores frente al principio 9 (A).** Opiniones («temas con conteo») y ventas («tabla de ventas» pegada) harían que la IA cuente y sume, que es exactamente lo que las guías actuales enseñan a evitar. Propuesta: la página calcula el resumen (conteos por tema con un libro de códigos, totales por producto y por día abierto) y el prompt lo recibe ya hecho, con sus 3 pruebas. Decisión D6.

**R7 · Textos N1–N4 del piloto (M).** Encargo → guía actual:
- N1 «Combo de fin de semana: 6 panes y 1 pan dulce por $6» → «6 panes y 1 pan dulce por $6»
- N2 «Sábado y domingo, de 7:00 a 13:00» → «Sábado y domingo, de 7:00 a 13:00. Hasta agotar existencias»
- N3 «Entrar a comprar el combo · Panadería La Espiga, Av. Ejemplo 123» → «Pasa por La Espiga · Av. Ejemplo 123»
- N4 «Hasta agotar existencias. Máximo 2 combos por persona.» → «Máximo 2 combos por persona»

Usaré los del encargo (son «exactos»), pero **suman 39 palabras** (13 + 7 + 11 + 8, sin contar «·») y el propio encargo pide «recortado a menos de 30 palabras»: el ejemplo contradice la regla que enseña (la guía actual queda justo en 30). Necesito que elijas: subir el límite a 40, o recortar los textos. Ningún texto sale de una captura real, así que el ejemplo real del piloto también sería ficticio hasta que lo pruebes. **Decidido después: el límite de la herramienta es «menos de 40 palabras» (el ejemplo suma 39).**

**R8 · Redirecciones a un área genérica (M).** Las 4 guías sin equivalente irían por 301 a `/marketing/crear-promociones-con-ia` y a `/analisis`. Google puede tratar una redirección a una página de contenido distinto como «soft 404», y el sitio ya decidió lo contrario en `content/redirects.ts` («solo existe una regla cuando la página de destino responde a la misma intención; sin equivalente, 410»). Decisión D3.

**R9 · Borrar contenido que vuelve en una ola (M).** La Fase 5 elimina todo el contenido viejo. Cuatro de las guías retiradas (campañas, ofertas de proveedores, competidores, nuevos productos) coinciden con las olas 2 y 3. Están en git, pero un `content/archivo/` fuera del build es más seguro y evita reescribir ~20.000 palabras revisadas.

**R10 · Fusiones y calculadoras que el documento no contempla (M).** Calendario+ideas: dos casos distintos y una calculadora de capacidad. Organizar+sistema diario: hay que sumar minutos (cálculo de la página). Cotizaciones y precios: los campos del encargo son más simples que las hojas actuales (12 y 18 filas); hay que decidir cuánto se conserva en «Método completo».

**R11 · Autor (M).** El bloque 13 dice «Probado por Nino»; el sitio firma como `DeveloClick` (Organization) en `autores.ts`, la política de privacidad y «Sobre nosotros». «Sobre nosotros» con autor con nombre requiere una biografía tuya. Decisión D4.

**R12 · Nombre de segmento dinámico (B).** Existe `app/(site)/[categoria]/…`; Next no admite dos nombres distintos de segmento dinámico en el mismo nivel. Usaré `[categoria]` para `app/(site)/[categoria]/[slug]/page.tsx` en vez de `[area]` (equivalente). Convivirá con `[categoria]/guias/[slug]` hasta la Fase 5 (tienen distinto número de segmentos: no chocan). Hoy `/marketing/guias` no existe (404); con la ruta nueva resolvería como `slug = "guias"` y, al ser `dynamicParams = false`, seguiría dando 404 hasta que la Fase 5 añada su 301 a `/marketing`. Las redirecciones de `next.config.ts` se evalúan antes que cualquier ruta dinámica.

**R13 · Enlaces internos (M).** 87 apariciones de `/guias`/`guidePath` en 25 archivos de código y 49 enlaces Markdown `](/…/guias/…)` dentro de las guías (33 más en `data.ts`). Solo un enlace apunta a una guía retirada (ideas-de-nuevos-productos → investigar-competidores). El texto nuevo se escribe ya con las URLs finales.

**R14 · «min de lectura» (B).** Aparece en home, tarjetas y cabecera (`readingMinutes`); el encargo lo quita del inicio y el documento pide «5 min · Gratis» como etiqueta de tiempo de uso (no de lectura).

**R15 · Perfil y consentimiento (B).** Ya existe consentimiento con `use-consent` y `localStorage`; el perfil «Mi negocio» seguirá el mismo patrón (try/catch). La política de privacidad debe recoger que el perfil vive solo en el navegador; hoy no lo menciona (no existía la función).

**R16 · Archivos y entorno (B).** `google-service-account.json` está en la raíz: **no está versionado** (está en `.gitignore` y no aparece en el historial), pero la carpeta vive en OneDrive, así que la clave se sincroniza con la nube. Además OneDrive ha borrado archivos versionados de forma intermitente en este equipo (se restauran con `git restore`); conviene trabajar con `git status` a mano antes de cada commit.

## 7. Estado de los tests y verificaciones que haré en la Fase 1
- Tests: `node:test` ejecutado con `tsx` (`tsx --test lib/**/*.test.ts`) para `construirPrompt` y las fórmulas de calculadoras, con un script `npm run test`. Sin dependencias nuevas.
- Comprobaciones de build: `typecheck`, `lint`, `build`, más un script que falle si una página con `publicado: false` aparece en sitemap, en `/herramientas`, en áreas o en «relacionadas».

## 8. NO PUDE COMPROBARLO
- Valor de `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_ADSENSE_CLIENT_ID` en Vercel, y si el dominio principal es apex o `www`.
- Cómo indexa Google hoy cada URL (no tengo acceso a Search Console).
- Si existen en algún otro disco las capturas del chat de La Espiga, el afiche con foto de panes y las capturas de la calculadora de promociones: no están en el repo ni en `Downloads` (búsqueda por nombre en dos niveles).
- Fecha y asistente con los que se hicieron las pruebas de anuncios y promociones (no constan en `evidence`).
- Contraste AA y foco visible del sitio actual: no medí con herramienta; se comprobará en la Fase 1 con los componentes nuevos.

## 9. Impacto en la Fase 1
Sin cambios en rutas vivas: se crean `content/herramientas/`, `lib/prompts/`, `lib/herramientas/` (esquema, `construirPrompt`, calculadoras), los componentes compartidos (reutilizando `prompt-builder`, `copy-button`, `zoomable-image`), `/mi-negocio` (noindex) y la ruta dinámica `[categoria]/[slug]` con `generateStaticParams` que solo produce páginas con datos y `publicado: true` (más una página interna de prueba `publicado: false`, accesible solo en desarrollo). Necesito D1, D5 y D7 antes de empezar; el resto puede esperar a la Fase 2 o 3.
