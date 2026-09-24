# Verificación del cambio de rutas (estado actual)

Regenerado el 2026-09-24 sobre `main` (local, sin push). Dominio base único: `https://www.guiapromptsia.com` (constante `siteUrl` en `lib/site.ts`). Comandos: `npm run build`, `npm test` (111 pruebas OK), `npm run herramientas:validar` (0 errores), `npm run sitio:verificar`, `npm run qa`, `npm run capturas`, `npm run contar-palabras`, `npm run que-falta`, `npm run duplicados`, `npm run og`, `npm run publicar`.

## Estado

- Las 15 herramientas siguen con `publicado: false` (noindex, fuera del sitemap). Lo único que falta en cada una son tus capturas reales, «Qué corregí yo» y la IA y la fecha de la prueba (las publica `npm run publicar`, ver `docs/como-publicar.md`).
- Contenido: las 15 tienen entre 1.723 y 1.884 palabras editoriales (rango 1.500–2.500), meta descripción de 140–160 caracteres, su propia `og.webp` de 1200×630 y sus ejemplos con los mismos datos en todas las páginas (`docs/universo-de-negocios.md`).
- Regla automática de indexación: un área y `/herramientas` son indexables y entran al sitemap solo con al menos 1 herramienta `publicado: true`. Hoy ninguna: noindex y el sitemap tiene solo la portada y las 6 institucionales.
- Autor Nicolas (Person), publisher DeveloClick (Organization); «Probado por Nicolas en {IA} el {fecha}» solo si existe la prueba.
- Validador: `publicado: true` exige 1.500–2.500 palabras, meta descripción 140–160, su og propia, ≥ 1 captura «Prueba real», 0 capturas pendientes, «Qué corregí yo» con 3 líneas, `probadoEn` y `probadoFecha`.
- Las cajas de «captura pendiente» solo se ven con `NODE_ENV=development` (`npm run dev`); nunca en un build de producción ni en Vercel, aunque `MOSTRAR_BORRADORES` esté activa.

## 1. Producción en vivo (https://www.guiapromptsia.com, despliegue de `c43aeee`)

Despliegue de Vercel: terminó bien (el canonical con `www` apareció en la portada unos 30 s después del push; no hay Vercel CLI en este equipo, se comprobó por la web). Ejecutado con `npm run sitio:verificar -- https://www.guiapromptsia.com`: **SIN FALLOS**.

- `https://guiapromptsia.com/` → **308** → `https://www.guiapromptsia.com/`; `/herramientas` → 308 → `https://www.guiapromptsia.com/herramientas`; `/marketing/crear-afiches-con-ia` → 308 → `https://www.guiapromptsia.com/marketing/crear-afiches-con-ia`.
- `sitemap.xml`: 7 URLs, todas con `https://www.`; `robots.txt` → `Sitemap: https://www.guiapromptsia.com/sitemap.xml`.
- Noindex en las 15 herramientas, las 5 áreas y `/herramientas` (tabla de abajo). Portada, «Cómo probamos», «Sobre nosotros», contacto y las 3 páginas legales son indexables.
- En vivo se ven las tarjetas de borradores: `MOSTRAR_BORRADORES=true` está activa en Vercel (por eso el chequeo de enlaces encontró 29 destinos y el build local sin la variable, 14).
- Las 26 URLs de la sección 5 y otras 16 del modelo anterior responden 301 al destino correcto (primera tabla); las retiradas sin equivalente responden 410.

### URLs antiguas → código → destino

| URL antigua | Código | Destino (Location) | ¿Correcto? |
|---|---|---|---|
| /privacidad | 301 | /politica-de-privacidad | sí |
| /cookies | 301 | /politica-de-cookies | sí |
| /autores | 301 | /sobre-nosotros | sí |
| /politica-editorial | 301 | /sobre-nosotros | sí |
| /guias | 301 | /herramientas | sí |
| /marketing/guias | 301 | /marketing | sí |
| /ventas/guias | 301 | /ventas | sí |
| /clientes/guias | 301 | /clientes | sí |
| /analisis/guias | 301 | /analisis | sí |
| /negocio/guias | 301 | /negocio | sí |
| /marketing/guias/crear-anuncios-con-ia | 301 | /marketing/crear-anuncios-con-ia | sí |
| /marketing/guias/crear-promociones-con-ia | 301 | /marketing/crear-promociones-con-ia | sí |
| /marketing/guias/crear-afiches-con-ia | 301 | /marketing/crear-afiches-con-ia | sí |
| /marketing/guias/crear-publicaciones-para-redes-sociales-con-ia | 301 | /marketing/crear-publicaciones-para-redes-con-ia | sí |
| /marketing/guias/calendario-de-contenido-con-ia | 301 | /marketing/calendario-de-contenido-con-ia | sí |
| /marketing/guias/ideas-de-contenido-para-tu-negocio-con-ia | 301 | /marketing/calendario-de-contenido-con-ia | sí |
| /marketing/guias/crear-campanas-promocionales-con-ia | 301 | /marketing/crear-promociones-con-ia | sí |
| /ventas/guias/crear-descripciones-de-productos-con-ia | 301 | /ventas/crear-descripciones-de-productos-con-ia | sí |
| /ventas/guias/crear-cotizaciones-y-propuestas-con-ia | 301 | /ventas/crear-cotizaciones-con-ia | sí |
| /ventas/guias/definir-precios-y-margenes-con-ia | 301 | /ventas/calcular-precios-y-margenes | sí |
| /clientes/guias/responder-consultas-de-clientes-con-ia | 301 | /clientes/responder-consultas-con-ia | sí |
| /clientes/guias/responder-reclamos-con-ia | 301 | /clientes/responder-reclamos-con-ia | sí |
| /clientes/guias/analizar-opiniones-de-clientes-con-ia | 301 | /clientes/analizar-opiniones-con-ia | sí |
| /analisis/guias/analizar-ventas-con-ia | 301 | /analisis/analizar-ventas-con-ia | sí |
| /analisis/guias/analizar-ofertas-de-proveedores-con-ia | 301 | /analisis | sí |
| /analisis/guias/investigar-competidores-con-ia | 301 | /analisis | sí |
| /analisis/guias/ideas-de-nuevos-productos-con-ia | 301 | /analisis | sí |
| /negocio/guias/organizar-tareas-del-negocio-con-ia | 301 | /negocio/organizar-tareas-con-ia | sí |
| /negocio/guias/sistema-diario-de-trabajo-con-ia | 301 | /negocio/organizar-tareas-con-ia | sí |
| /negocio/guias/documentar-procesos-con-ia | 301 | /negocio/documentar-procesos-con-ia | sí |
| /prompts/ideas-contenido-redes-sociales | 301 | /marketing/calendario-de-contenido-con-ia | sí |
| /prompts/calendario-de-contenido-mensual | 301 | /marketing/calendario-de-contenido-con-ia | sí |
| /blog/guia-de-ia-para-redes-sociales | 301 | /marketing/crear-publicaciones-para-redes-con-ia | sí |
| /prompts/descripcion-producto-ecommerce | 301 | /ventas/crear-descripciones-de-productos-con-ia | sí |
| /prompts/descripcion-producto-ecommerce-bullets | 301 | /ventas/crear-descripciones-de-productos-con-ia | sí |
| /prompts/propuesta-comercial-b2b | 301 | /ventas/crear-cotizaciones-con-ia | sí |
| /prompts/respuesta-atencion-cliente-reclamacion | 301 | /clientes/responder-reclamos-con-ia | sí |
| /prompts/respuesta-a-resena-negativa | 301 | /clientes/responder-reclamos-con-ia | sí |
| /prompts/analisis-de-resenas-de-clientes | 301 | /clientes/analizar-opiniones-con-ia | sí |
| /prompts/analisis-competitivo-de-mercado | 301 | /analisis | sí |
| /prompts/matriz-de-priorizacion-eisenhower | 301 | /negocio/organizar-tareas-con-ia | sí |

### URLs nuevas (página → canonical)

| URL | Código | Canonical | og:url | Robots | Publicada |
|---|---|---|---|---|---|
| / | 200 | https://www.guiapromptsia.com | https://www.guiapromptsia.com | index, follow | n/a |
| /herramientas | 200 | https://www.guiapromptsia.com/herramientas | https://www.guiapromptsia.com/herramientas | noindex, nofollow | n/a |
| /como-probamos | 200 | https://www.guiapromptsia.com/como-probamos | https://www.guiapromptsia.com/como-probamos | index, follow | n/a |
| /mi-negocio | 200 | https://www.guiapromptsia.com/mi-negocio | https://www.guiapromptsia.com/mi-negocio | noindex, nofollow | no |
| /marketing | 200 | https://www.guiapromptsia.com/marketing | https://www.guiapromptsia.com/marketing | noindex, nofollow | n/a |
| /ventas | 200 | https://www.guiapromptsia.com/ventas | https://www.guiapromptsia.com/ventas | noindex, nofollow | n/a |
| /clientes | 200 | https://www.guiapromptsia.com/clientes | https://www.guiapromptsia.com/clientes | noindex, nofollow | n/a |
| /analisis | 200 | https://www.guiapromptsia.com/analisis | https://www.guiapromptsia.com/analisis | noindex, nofollow | n/a |
| /negocio | 200 | https://www.guiapromptsia.com/negocio | https://www.guiapromptsia.com/negocio | noindex, nofollow | n/a |
| /sobre-nosotros | 200 | https://www.guiapromptsia.com/sobre-nosotros | https://www.guiapromptsia.com/sobre-nosotros | index, follow | n/a |
| /contacto | 200 | https://www.guiapromptsia.com/contacto | https://www.guiapromptsia.com/contacto | index, follow | n/a |
| /politica-de-privacidad | 200 | https://www.guiapromptsia.com/politica-de-privacidad | https://www.guiapromptsia.com/politica-de-privacidad | index, follow | n/a |
| /politica-de-cookies | 200 | https://www.guiapromptsia.com/politica-de-cookies | https://www.guiapromptsia.com/politica-de-cookies | index, follow | n/a |
| /terminos-y-condiciones | 200 | https://www.guiapromptsia.com/terminos-y-condiciones | https://www.guiapromptsia.com/terminos-y-condiciones | index, follow | n/a |
| /analisis/analizar-ventas-con-ia | 200 | https://www.guiapromptsia.com/analisis/analizar-ventas-con-ia | https://www.guiapromptsia.com/analisis/analizar-ventas-con-ia | noindex, nofollow | no |
| /analisis/calcular-punto-de-equilibrio | 200 | https://www.guiapromptsia.com/analisis/calcular-punto-de-equilibrio | https://www.guiapromptsia.com/analisis/calcular-punto-de-equilibrio | noindex, nofollow | no |
| /clientes/analizar-opiniones-con-ia | 200 | https://www.guiapromptsia.com/clientes/analizar-opiniones-con-ia | https://www.guiapromptsia.com/clientes/analizar-opiniones-con-ia | noindex, nofollow | no |
| /clientes/responder-consultas-con-ia | 200 | https://www.guiapromptsia.com/clientes/responder-consultas-con-ia | https://www.guiapromptsia.com/clientes/responder-consultas-con-ia | noindex, nofollow | no |
| /clientes/responder-reclamos-con-ia | 200 | https://www.guiapromptsia.com/clientes/responder-reclamos-con-ia | https://www.guiapromptsia.com/clientes/responder-reclamos-con-ia | noindex, nofollow | no |
| /marketing/calendario-de-contenido-con-ia | 200 | https://www.guiapromptsia.com/marketing/calendario-de-contenido-con-ia | https://www.guiapromptsia.com/marketing/calendario-de-contenido-con-ia | noindex, nofollow | no |
| /marketing/crear-afiches-con-ia | 200 | https://www.guiapromptsia.com/marketing/crear-afiches-con-ia | https://www.guiapromptsia.com/marketing/crear-afiches-con-ia | noindex, nofollow | no |
| /marketing/crear-anuncios-con-ia | 200 | https://www.guiapromptsia.com/marketing/crear-anuncios-con-ia | https://www.guiapromptsia.com/marketing/crear-anuncios-con-ia | noindex, nofollow | no |
| /marketing/crear-promociones-con-ia | 200 | https://www.guiapromptsia.com/marketing/crear-promociones-con-ia | https://www.guiapromptsia.com/marketing/crear-promociones-con-ia | noindex, nofollow | no |
| /marketing/crear-publicaciones-para-redes-con-ia | 200 | https://www.guiapromptsia.com/marketing/crear-publicaciones-para-redes-con-ia | https://www.guiapromptsia.com/marketing/crear-publicaciones-para-redes-con-ia | noindex, nofollow | no |
| /negocio/documentar-procesos-con-ia | 200 | https://www.guiapromptsia.com/negocio/documentar-procesos-con-ia | https://www.guiapromptsia.com/negocio/documentar-procesos-con-ia | noindex, nofollow | no |
| /negocio/organizar-tareas-con-ia | 200 | https://www.guiapromptsia.com/negocio/organizar-tareas-con-ia | https://www.guiapromptsia.com/negocio/organizar-tareas-con-ia | noindex, nofollow | no |
| /ventas/calcular-precios-y-margenes | 200 | https://www.guiapromptsia.com/ventas/calcular-precios-y-margenes | https://www.guiapromptsia.com/ventas/calcular-precios-y-margenes | noindex, nofollow | no |
| /ventas/crear-cotizaciones-con-ia | 200 | https://www.guiapromptsia.com/ventas/crear-cotizaciones-con-ia | https://www.guiapromptsia.com/ventas/crear-cotizaciones-con-ia | noindex, nofollow | no |
| /ventas/crear-descripciones-de-productos-con-ia | 200 | https://www.guiapromptsia.com/ventas/crear-descripciones-de-productos-con-ia | https://www.guiapromptsia.com/ventas/crear-descripciones-de-productos-con-ia | noindex, nofollow | no |

### Enlaces internos

29 destinos distintos revisados en 29 páginas; rotos o hacia URLs retiradas: 0.

### Sitemap

7 URLs: /, /sobre-nosotros, /como-probamos, /contacto, /politica-de-privacidad, /politica-de-cookies, /terminos-y-condiciones

### Modelo anterior sin equivalente: 410 (ver el chequeo completo con `npm run sitio:verificar`)

## 2. og:image

- `public/og-default.webp` (1200×630): logotipo real sobre un panel blanco, nombre «Guía Prompts IA» y lema en blanco sobre el verde de marca; sin capturas ni simulaciones (se retiró el `.png` de la marca anterior).
- Cada una de las 15 herramientas tiene su propia `public/img/{área}/{slug}/og.webp` (1200×630, se regenera con `npm run og`): el H1, el área y la marca sobre el color de marca; sin imitar chats ni capturas.
- Toda página resuelve a un archivo existente (propia o respaldo) en `og:image`, `twitter:image` y en el JSON-LD `Article`; el chequeo en vivo pide cada imagen y exige 200 y tipo `image/*`.

## 3. Recorrido interactivo (Playwright + Chrome, build de producción local)

`npm run qa -- http://localhost:3100`: **596 pruebas, 596 OK** a 375 px y a 1280 px (portada, `/mi-negocio`, perfil y las 15 herramientas). Detalle prueba por prueba: `docs/qa/resultados.md`; capturas de pantalla: `docs/qa/375/` y `docs/qa/1280/` (fuera de `public/`).

Cubre: formulario, «Probar con un ejemplo» (cada campo recibe su valor), «Empezar de cero», «Ver el prompt completo», «Copiar prompt» con portapapeles permitido, con la API bloqueada y con todo bloqueado (aparece el texto para copiar a mano), perfil (guardar, autocompletar en otra herramienta, borrar) y `localStorage` bloqueado, calculadoras (54 casos: esperado frente a obtenido), conteos de los 2 analizadores (12 casos), sin scroll horizontal, botones ≥ 44 px, foco visible con contraste ≥ 3:1, 0 errores de consola y prompt sin `{{ }}`, `undefined`, `null` ni `NaN`.

**Qué falló al principio y se corrigió** (commits aparte): botones del encabezado de 36/40 px → 44 px; anillo de foco de ~1,6:1 → tinta de la marca (≥ 3:1) en todo el sitio; el registro de herramientas daba 0 páginas en Windows con OneDrive «a petición» (`isFile()`), ya corregido; y varios falsos positivos del propio recorrido.

### Resumen por página

| Página | 375 px (OK/total) | 1280 px (OK/total) | Resultado |
|---|---|---|---|
| / | 6/6 | 6/6 | OK |
| /mi-negocio | 7/7 | 7/7 | OK |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 12/12 | 12/12 | OK |
| /analisis/analizar-ventas-con-ia | 19/19 | 19/19 | OK |
| /analisis/calcular-punto-de-equilibrio | 20/20 | 20/20 | OK |
| /clientes/analizar-opiniones-con-ia | 19/19 | 19/19 | OK |
| /clientes/responder-consultas-con-ia | 16/16 | 16/16 | OK |
| /clientes/responder-reclamos-con-ia | 16/16 | 16/16 | OK |
| /marketing/calendario-de-contenido-con-ia | 20/20 | 20/20 | OK |
| /marketing/crear-afiches-con-ia | 16/16 | 16/16 | OK |
| /marketing/crear-anuncios-con-ia | 16/16 | 16/16 | OK |
| /marketing/crear-promociones-con-ia | 21/21 | 21/21 | OK |
| /marketing/crear-publicaciones-para-redes-con-ia | 16/16 | 16/16 | OK |
| /negocio/documentar-procesos-con-ia | 16/16 | 16/16 | OK |
| /negocio/organizar-tareas-con-ia | 20/20 | 20/20 | OK |
| /ventas/calcular-precios-y-margenes | 21/21 | 21/21 | OK |
| /ventas/crear-cotizaciones-con-ia | 21/21 | 21/21 | OK |
| /ventas/crear-descripciones-de-productos-con-ia | 16/16 | 16/16 | OK |

## 4. Negocios de ejemplo

El inventario completo (negocio, rubro, datos fijos, reglas de moneda, direcciones y teléfonos) está en `docs/universo-de-negocios.md`, y un test comprueba que un mismo negocio usa los mismos datos en todas las páginas donde aparece. Se corrigió lo que esta sección señalaba antes: Café Mirador (precios fijos y «gasto promedio por cliente» en el punto de equilibrio), ejemplo del perfil (La Espiga, «Av. Ejemplo 123», «$», «Ciudad de ejemplo», sin ciudad real) y datos repetidos entre Fonda El Sabor, Estudio Brillo y Rincón. Se conserva «Calle Los Pinos con calle 5» porque aparece en las capturas reales del método anterior. **NO PUDE COMPROBAR** que ningún nombre ficticio coincida con un negocio real.

## 5. Rendimiento (Chrome móvil 412×823, CPU ×4, 4G lenta 1,6 Mbps / 150 ms, mediana de 3 cargas, build local)

**Lighthouse no está instalado en este equipo y no se instaló**: **NO PUDE COMPROBAR** sus cuatro puntuaciones. Estas cifras son del propio Chrome y no equivalen a Lighthouse (servidor local, sin auditoría de accesibilidad, buenas prácticas ni SEO).

| Página | | FCP = LCP | CLS | TBT aprox. | Peticiones | Peso | JS | Fuentes |
|---|---|---|---|---|---|---|---|---|
| `/` | antes | 2,17 s | 0 | 622 ms | 54 | 539 KB | 250 KB | 128 KB |
| `/` | después | 1,79 s | 0 | 583 ms | 48 | 424 KB | 188 KB | 76 KB |
| `/marketing/crear-afiches-con-ia` | antes | 2,29 s | 0 | 728 ms | 43 | 525 KB | 270 KB | 128 KB |
| `/marketing/crear-afiches-con-ia` | después | 2,30 s | 0 | 643 ms | 38 | 412 KB | 210 KB | 76 KB |

Qué se cambió (cuatro commits): fuente Metropolis con 3 pesos (400, 600, 700) y `font-display: swap`; aviso de cookies con animación CSS y sin `framer-motion` (dependencia eliminada); `Reveal` y `Parallax` como componentes de servidor con animaciones CSS ligadas al scroll; menú móvil descargado solo al pasar, enfocar o pulsar el botón. Resultado: −21 % de peso y −60 a −62 KB de JS en las dos páginas; la portada baja el FCP/LCP un 17 %; el de la herramienta no cambia (dentro del ruido de la medición). El bloqueo del hilo principal en la herramienta (~640 ms con CPU ×4) es el propio bloque interactivo (formulario, prompt, calculadoras) y el resto del framework: no se toca porque es lo único que necesita JavaScript.

## 6. ¿Qué falta para `publicado: true`?

Solo lo tuyo: por cada herramienta, las capturas reales de la prueba, «Qué corregí yo» (3 líneas), la IA y la fecha de la prueba; lo demás lo comprueba `npm run publicar`. Detalle (el validador, como si la página estuviera publicada):

| Página | Prueba real (puestas/pendientes) | Palabras editoriales (faltan para 1.500) | og propia | probadoEn / probadoFecha | Otros incumplimientos (validador como si estuviera publicada) |
|---|---|---|---|---|---|
| analisis/analizar-ventas-con-ia | 0 / 1 | 1727 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| analisis/calcular-punto-de-equilibrio | 0 / 1 | 1794 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| clientes/analizar-opiniones-con-ia | 0 / 1 | 1725 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| clientes/responder-consultas-con-ia | 0 / 1 | 1806 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| clientes/responder-reclamos-con-ia | 0 / 1 | 1742 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| marketing/calendario-de-contenido-con-ia | 0 / 2 | 1723 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| marketing/crear-afiches-con-ia | 0 / 2 | 1884 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| marketing/crear-anuncios-con-ia | 5 / 1 | 1787 (ok) | sí | no | ninguno |
| marketing/crear-promociones-con-ia | 3 / 1 | 1842 (ok) | sí | no | ninguno |
| marketing/crear-publicaciones-para-redes-con-ia | 0 / 1 | 1748 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| negocio/documentar-procesos-con-ia | 0 / 1 | 1747 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| negocio/organizar-tareas-con-ia | 0 / 1 | 1739 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| ventas/calcular-precios-y-margenes | 0 / 1 | 1776 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| ventas/crear-cotizaciones-con-ia | 0 / 1 | 1768 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| ventas/crear-descripciones-de-productos-con-ia | 0 / 1 | 1769 (ok) | sí | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |

Textos editoriales (≥ 60 caracteres) idénticos en más de una página: 0


Otros puntos de los 19 estándares que no se pueden dar por cumplidos hasta que hagas la prueba: (3) el texto coincide con las capturas, (4) «Probado por Nicolas…». (11–13) verificados en escritorio y a 375 px con Chrome; **NO PUDE COMPROBAR** en un celular físico ni con lectores de pantalla.

## Palabras editoriales

| Página | Publicado | Palabras editoriales | Rango 1500–2500 | Recuento amplio (con formulario y «mejoras»; solo informativo) |
|---|---|---|---|---|
| /analisis/analizar-ventas-con-ia | no | 1727 | dentro | 1863 (dentro) |
| /analisis/calcular-punto-de-equilibrio | no | 1794 | dentro | 2049 (dentro) |
| /clientes/analizar-opiniones-con-ia | no | 1725 | dentro | 1873 (dentro) |
| /clientes/responder-consultas-con-ia | no | 1806 | dentro | 1924 (dentro) |
| /clientes/responder-reclamos-con-ia | no | 1742 | dentro | 1907 (dentro) |
| /marketing/calendario-de-contenido-con-ia | no | 1723 | dentro | 1989 (dentro) |
| /marketing/crear-afiches-con-ia | no | 1884 | dentro | 2051 (dentro) |
| /marketing/crear-anuncios-con-ia | no | 1787 | dentro | 1932 (dentro) |
| /marketing/crear-promociones-con-ia | no | 1842 | dentro | 2078 (dentro) |
| /marketing/crear-publicaciones-para-redes-con-ia | no | 1748 | dentro | 1917 (dentro) |
| /negocio/documentar-procesos-con-ia | no | 1747 | dentro | 1904 (dentro) |
| /negocio/organizar-tareas-con-ia | no | 1739 | dentro | 1992 (dentro) |
| /ventas/calcular-precios-y-margenes | no | 1776 | dentro | 2065 (dentro) |
| /ventas/crear-cotizaciones-con-ia | no | 1768 | dentro | 2055 (dentro) |
| /ventas/crear-descripciones-de-productos-con-ia | no | 1769 | dentro | 1898 (dentro) |

15 páginas; 15 dentro del rango con el recuento editorial, 0 fuera.


## Capturas

| Página | Publicado | Capturas puestas | Pendientes | og propia | Archivos mencionados que no existen |
|---|---|---|---|---|---|
| /analisis/analizar-ventas-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /analisis/calcular-punto-de-equilibrio | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /clientes/analizar-opiniones-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /clientes/responder-consultas-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /clientes/responder-reclamos-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /marketing/calendario-de-contenido-con-ia | no | 0 de 0 (0 «Prueba real») | 2 | sí | — |
| /marketing/crear-afiches-con-ia | no | 0 de 0 (0 «Prueba real») | 2 | sí | — |
| /marketing/crear-anuncios-con-ia | no | 5 de 5 (5 «Prueba real») | 1 | sí | — |
| /marketing/crear-promociones-con-ia | no | 4 de 4 (3 «Prueba real») | 1 | sí | — |
| /marketing/crear-publicaciones-para-redes-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /negocio/documentar-procesos-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /negocio/organizar-tareas-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /ventas/calcular-precios-y-margenes | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /ventas/crear-cotizaciones-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |
| /ventas/crear-descripciones-de-productos-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | sí | — |

Total: 9 capturas puestas, 17 pendientes, 0 archivos mencionados que no existen; 0 og propias pendientes (esas páginas usan el respaldo /og-default.webp).

### Capturas pendientes

| Página | Archivo esperado | Etiqueta | Tamaño recomendado | Qué debe mostrar |
|---|---|---|---|---|
| /analisis/analizar-ventas-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: la respuesta de la IA al prompt de esta página con las ventas de Verde Hogar (ficticio) y los conteos ya hechos por la página. Debe verse la separación entre dato e hipótesis, lo que hay que verificar y las tres decisiones posibles. |
| /analisis/calcular-punto-de-equilibrio | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: la respuesta de la IA con las cifras del punto de equilibrio de Café Mirador (ficticio) ya calculadas por la página. Debe verse la explicación en palabras simples y las tres formas de bajarlo, sin que la IA recalcule. |
| /clientes/analizar-opiniones-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: la respuesta de la IA a las 25 reseñas ficticias de La Higuera con los conteos por tema de la página. Deben verse los temas, las citas textuales, elogios y problemas, y las tres acciones. |
| /clientes/responder-consultas-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: la respuesta de la IA a una consulta de un cliente del Taller Los Pinos (ficticio). Debe verse la respuesta lista, la versión corta y la lista de lo que no se afirmó por falta de datos. |
| /clientes/responder-reclamos-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: la respuesta de la IA a un reclamo de un cliente de Luz de Barrio (ficticio). Debe verse la separación entre hechos y emociones, la respuesta profesional (privada) y el siguiente paso concreto. |
| /marketing/calendario-de-contenido-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: el calendario de 4 semanas en tabla que devuelve la IA para Restaurante Mesa Larga (ficticio), con la capacidad de tiempo calculada por la página. |
| /marketing/calendario-de-contenido-con-ia | `prueba-02.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Mismo chat: el banco de ideas y el plan para producir por lotes. |
| /marketing/crear-afiches-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: la respuesta de la IA al prompt de esta página con el texto del afiche de la Panadería La Espiga (ficticia) en los niveles N1–N4, el brief para diseñarlo y el prompt de imagen sin texto. Los niveles deben coincidir con «Resultado del ejemplo» de la página. |
| /marketing/crear-afiches-con-ia | `prueba-02.webp` | Resultado final diseñado con el texto de la IA | ≥ 1.200 px de ancho, .webp | El afiche final ya maquetado en la herramienta de diseño, con la foto de los panes, el combo como titular y la dirección abajo, usando el texto de la captura anterior. |
| /marketing/crear-anuncios-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo con el prompt único de esta página y los datos de Casa y Clavo (ficticia): las tres versiones del anuncio, la versión para WhatsApp y la lista de afirmaciones que hay que verificar. Sustituye a las capturas del método anterior. |
| /marketing/crear-promociones-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo con el prompt de esta página y las cifras ya calculadas de Café Mirador (ficticio): el texto de la promoción y las dos alternativas, sin que la IA recalcule. |
| /marketing/crear-publicaciones-para-redes-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: las tres opciones de publicación de Peluquería Rizo Fino (ficticia), la adaptación al formato elegido, el texto alternativo de la imagen y los hashtags. |
| /negocio/documentar-procesos-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: el procedimiento paso a paso, la lista para imprimir y los puntos de control que devuelve la IA para el proceso de Cerámica Sol (ficticia). |
| /negocio/organizar-tareas-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: las tareas priorizadas, el plan de la semana, lo que se puede delegar y la rutina diaria de 15 minutos para Lavandería Brisa (ficticia), con la capacidad ya calculada por la página. |
| /ventas/calcular-precios-y-margenes | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: la revisión de la lógica del precio de Galletería Migas (ficticia), los escenarios y cómo comunicar el precio, con las cifras ya calculadas por la página. |
| /ventas/crear-cotizaciones-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: la cotización redactada para Maderas Rivera (ficticio) con los totales que calculó la página. Deben verse el subtotal, el descuento, el impuesto, el total, el anticipo y el saldo sin que la IA cambie ninguna cifra. |
| /ventas/crear-descripciones-de-productos-con-ia | `prueba-01.webp` | Prueba real | ≥ 1.200 px de ancho, .webp | Chat nuevo: la versión corta, la versión larga y la lista FALTA (lo que no tiene dato) para un producto de Luz de Cera (ficticio). |

Carpeta de cada página: public/img/{área}/{slug}/. Los recuadros grises solo se ven con `next dev` (nunca en un build de producción).

