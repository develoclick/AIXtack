# Verificación de la Fase 5 (cambio de rutas)

Generada con `npm run build`, `next start -p 3100` y `npm run sitio:verificar -- http://localhost:3100` (fecha: 2026-09-23). Rama `reestructura-herramientas`; **no se ha hecho merge ni push a `main`**.

Además, contra ese mismo servidor de producción, en el navegador: las 15 herramientas cargan, «Probar con un ejemplo» llena el formulario, el prompt resultante no tiene `[FALTA]` en los datos, ni `{{ }}`, ni `undefined`/`NaN`, y el botón «Copiar prompt» existe (15/15). No se pudo comprobar en un celular real (solo lógica y CSS a 375 px en fases anteriores) ni el portapapeles en iOS/Android.

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

### URLs nuevas

| URL | Código | Canonical | Robots | Publicada |
|---|---|---|---|---|
| / | 200 | https://guiapromptsia.com | index, follow | n/a |
| /herramientas | 200 | https://guiapromptsia.com/herramientas | noindex, nofollow | n/a |
| /como-probamos | 200 | https://guiapromptsia.com/como-probamos | index, follow | n/a |
| /mi-negocio | 200 | https://guiapromptsia.com/mi-negocio | noindex, nofollow | no |
| /marketing | 200 | https://guiapromptsia.com/marketing | noindex, nofollow | n/a |
| /ventas | 200 | https://guiapromptsia.com/ventas | noindex, nofollow | n/a |
| /clientes | 200 | https://guiapromptsia.com/clientes | noindex, nofollow | n/a |
| /analisis | 200 | https://guiapromptsia.com/analisis | noindex, nofollow | n/a |
| /negocio | 200 | https://guiapromptsia.com/negocio | noindex, nofollow | n/a |
| /sobre-nosotros | 200 | https://guiapromptsia.com/sobre-nosotros | index, follow | n/a |
| /contacto | 200 | https://guiapromptsia.com/contacto | index, follow | n/a |
| /politica-de-privacidad | 200 | https://guiapromptsia.com/politica-de-privacidad | index, follow | n/a |
| /politica-de-cookies | 200 | https://guiapromptsia.com/politica-de-cookies | index, follow | n/a |
| /terminos-y-condiciones | 200 | https://guiapromptsia.com/terminos-y-condiciones | index, follow | n/a |
| /analisis/analizar-ventas-con-ia | 200 | https://guiapromptsia.com/analisis/analizar-ventas-con-ia | noindex, nofollow | no |
| /analisis/calcular-punto-de-equilibrio | 200 | https://guiapromptsia.com/analisis/calcular-punto-de-equilibrio | noindex, nofollow | no |
| /clientes/analizar-opiniones-con-ia | 200 | https://guiapromptsia.com/clientes/analizar-opiniones-con-ia | noindex, nofollow | no |
| /clientes/responder-consultas-con-ia | 200 | https://guiapromptsia.com/clientes/responder-consultas-con-ia | noindex, nofollow | no |
| /clientes/responder-reclamos-con-ia | 200 | https://guiapromptsia.com/clientes/responder-reclamos-con-ia | noindex, nofollow | no |
| /marketing/calendario-de-contenido-con-ia | 200 | https://guiapromptsia.com/marketing/calendario-de-contenido-con-ia | noindex, nofollow | no |
| /marketing/crear-afiches-con-ia | 200 | https://guiapromptsia.com/marketing/crear-afiches-con-ia | noindex, nofollow | no |
| /marketing/crear-anuncios-con-ia | 200 | https://guiapromptsia.com/marketing/crear-anuncios-con-ia | noindex, nofollow | no |
| /marketing/crear-promociones-con-ia | 200 | https://guiapromptsia.com/marketing/crear-promociones-con-ia | noindex, nofollow | no |
| /marketing/crear-publicaciones-para-redes-con-ia | 200 | https://guiapromptsia.com/marketing/crear-publicaciones-para-redes-con-ia | noindex, nofollow | no |
| /negocio/documentar-procesos-con-ia | 200 | https://guiapromptsia.com/negocio/documentar-procesos-con-ia | noindex, nofollow | no |
| /negocio/organizar-tareas-con-ia | 200 | https://guiapromptsia.com/negocio/organizar-tareas-con-ia | noindex, nofollow | no |
| /ventas/calcular-precios-y-margenes | 200 | https://guiapromptsia.com/ventas/calcular-precios-y-margenes | noindex, nofollow | no |
| /ventas/crear-cotizaciones-con-ia | 200 | https://guiapromptsia.com/ventas/crear-cotizaciones-con-ia | noindex, nofollow | no |
| /ventas/crear-descripciones-de-productos-con-ia | 200 | https://guiapromptsia.com/ventas/crear-descripciones-de-productos-con-ia | noindex, nofollow | no |

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

Sitemap: https://guiapromptsia.com/sitemap.xml
```

SIN FALLOS.
