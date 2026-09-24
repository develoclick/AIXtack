# Verificación del cambio de rutas (estado actual)

Regenerado el 2026-09-23 sobre `main` (build limpio con `npm run build`, servidor de producción con `next start -p 3100` y `npm run sitio:verificar -- http://localhost:3100`). Dominio base único: `https://www.guiapromptsia.com` (constante `siteUrl` en `lib/site.ts`).

## Estado

- Las 15 herramientas siguen con `publicado: false` (noindex, fuera del sitemap); faltan pruebas reales y capturas.
- Regla automática de indexación: un área y `/herramientas` son indexables y entran al sitemap solo con al menos 1 herramienta `publicado: true`. Hoy ninguna, así que llevan noindex y el sitemap tiene solo la portada y las 6 institucionales.
- Autor: Nicolas (Person); publisher: DeveloClick (Organization). «Probado por Nicolas en {IA} el {fecha}» solo aparece si existe la prueba.
- Palabras: el estándar usa el recuento editorial (sin formulario, ejemplos del formulario, tarea ni prompts de mejoras). Borrador fuera de 1.500–2.500 = aviso; publicado fuera de rango = error de build.
- Capturas: `capturasPendientes` en las 15 páginas; los recuadros grises solo se ven con `next dev` o `MOSTRAR_BORRADORES=true` (en producción, nada). `publicado: true` exige ≥1 «Prueba real» y 0 pendientes.
- Tests: `npm test` → ℹ tests 81 · ℹ pass 81 · ℹ fail 0
- Sin comprobar: «Copiar» en un celular real y a 375 px en dispositivo real; el recorrido interactivo de las 15 herramientas (ejemplo, copiar) se hizo sobre el build anterior (commit 76df418) y no se repitió tras los últimos cambios.

## Palabras editoriales por página

| Página | Publicado | Palabras editoriales | Rango 1500–2500 | Recuento amplio (con formulario y «mejoras»; solo informativo) |
|---|---|---|---|---|
| /analisis/analizar-ventas-con-ia | no | 1318 | FALTAN 182 | 1507 (dentro) |
| /analisis/calcular-punto-de-equilibrio | no | 1272 | FALTAN 228 | 1528 (dentro) |
| /clientes/analizar-opiniones-con-ia | no | 1327 | FALTAN 173 | 1505 (dentro) |
| /clientes/responder-consultas-con-ia | no | 1351 | FALTAN 149 | 1529 (dentro) |
| /clientes/responder-reclamos-con-ia | no | 1307 | FALTAN 193 | 1557 (dentro) |
| /marketing/calendario-de-contenido-con-ia | no | 1268 | FALTAN 232 | 1578 (dentro) |
| /marketing/crear-afiches-con-ia | no | 1528 | dentro | 1737 (dentro) |
| /marketing/crear-anuncios-con-ia | no | 1455 | FALTAN 45 | 1667 (dentro) |
| /marketing/crear-promociones-con-ia | no | 1578 | dentro | 1875 (dentro) |
| /marketing/crear-publicaciones-para-redes-con-ia | no | 1287 | FALTAN 213 | 1540 (dentro) |
| /negocio/documentar-procesos-con-ia | no | 1315 | FALTAN 185 | 1521 (dentro) |
| /negocio/organizar-tareas-con-ia | no | 1220 | FALTAN 280 | 1551 (dentro) |
| /ventas/calcular-precios-y-margenes | no | 1293 | FALTAN 207 | 1624 (dentro) |
| /ventas/crear-cotizaciones-con-ia | no | 1240 | FALTAN 260 | 1600 (dentro) |
| /ventas/crear-descripciones-de-productos-con-ia | no | 1304 | FALTAN 196 | 1502 (dentro) |

15 páginas; 2 dentro del rango con el recuento editorial, 13 fuera.

## Capturas

| Página | Publicado | Capturas puestas | Pendientes | Archivos mencionados que no existen |
|---|---|---|---|---|
| /analisis/analizar-ventas-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /analisis/calcular-punto-de-equilibrio | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /clientes/analizar-opiniones-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /clientes/responder-consultas-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /clientes/responder-reclamos-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /marketing/calendario-de-contenido-con-ia | no | 0 de 0 (0 «Prueba real») | 2 | og.webp |
| /marketing/crear-afiches-con-ia | no | 0 de 0 (0 «Prueba real») | 2 | og.webp |
| /marketing/crear-anuncios-con-ia | no | 5 de 5 (5 «Prueba real») | 1 | og.webp |
| /marketing/crear-promociones-con-ia | no | 4 de 4 (3 «Prueba real») | 1 | og.webp |
| /marketing/crear-publicaciones-para-redes-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /negocio/documentar-procesos-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /negocio/organizar-tareas-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /ventas/calcular-precios-y-margenes | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /ventas/crear-cotizaciones-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |
| /ventas/crear-descripciones-de-productos-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | og.webp |

Total: 9 capturas puestas, 17 pendientes, 15 archivos mencionados que no existen (og:image incluida).
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

Carpeta de cada página: public/img/{área}/{slug}/. Los recuadros grises solo se ven con `next dev` o MOSTRAR_BORRADORES=true.

## Verificación del sitio construido

### URLs antiguas

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

14 destinos distintos revisados en 29 páginas; rotos o hacia URLs retiradas: 0.

### Sitemap

7 URLs: /, /sobre-nosotros, /como-probamos, /contacto, /politica-de-privacidad, /politica-de-cookies, /terminos-y-condiciones

### Modelo anterior sin equivalente

| URL | Código |
|---|---|
| /herramientas-ia/x | 410 |
| /prompts/no-existe | 410 |
| /blog/no-existe | 410 |
| /categoria/x | 410 |
| /etiqueta/x | 410 |
| /feed.xml | 410 |

### robots.txt

```
User-Agent: *
Allow: /

Sitemap: https://www.guiapromptsia.com/sitemap.xml
```

SIN FALLOS.
