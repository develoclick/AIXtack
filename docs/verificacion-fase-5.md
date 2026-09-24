# Verificación del cambio de rutas (estado actual)

Regenerado el 2026-09-23 sobre `main`. Dominio base único: `https://www.guiapromptsia.com` (constante `siteUrl` en `lib/site.ts`). Comandos: `npm run build`, `npm test` (85 pruebas OK), `npm run herramientas:validar` (0 errores), `npm run sitio:verificar`, `npm run qa`, `npm run capturas`, `npm run contar-palabras`, `npm run que-falta`.

## Estado

- Las 15 herramientas siguen con `publicado: false` (noindex, fuera del sitemap); faltan pruebas reales, capturas y og propia.
- Regla automática de indexación: un área y `/herramientas` son indexables y entran al sitemap solo con al menos 1 herramienta `publicado: true`. Hoy ninguna: noindex y el sitemap tiene solo la portada y las 6 institucionales.
- Autor Nicolas (Person), publisher DeveloClick (Organization); «Probado por Nicolas en {IA} el {fecha}» solo si existe la prueba.
- Validador: recuento editorial de palabras; `publicado: true` exige 1.500–2.500 palabras, ≥ 1 captura «Prueba real», 0 capturas pendientes y su propia `og.webp`.

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

- Había una imagen general (`public/og-default.png`), pero era de la marca anterior («AIXtack… comparativas y noticias»): no servía. Se creó `public/og-default.webp` (1200×630): el logotipo real sobre un panel blanco y el nombre «Guía Prompts IA» y el lema en blanco sobre el verde de marca; sin capturas ni simulaciones. Se retiró el `.png` obsoleto.
- Toda página sin `og.webp` propia usa `/og-default.webp` (og:image, twitter:image y el JSON-LD `Article`); ninguna apunta a un archivo inexistente (test + el chequeo en vivo pide cada imagen y exige 200 y tipo `image/*`).
- `publicado: true` exige `/img/{area}/{slug}/og.webp`; con `publicado: false`, solo aviso. `npm run capturas` lista «og propia: pendiente (usa /og-default.webp)» y ya no cuenta `og.webp` como archivo inexistente.

## 3. Recorrido interactivo (Playwright + Chrome 153, build de producción local)

`npm run qa -- http://localhost:3100`: **596 pruebas, 596 OK** a 375 px y a 1280 px (portada, `/mi-negocio` y las 15 herramientas). Detalle prueba por prueba: `docs/qa/resultados.md`; capturas de pantalla: `docs/qa/375/` y `docs/qa/1280/` (2,3 MB en total, fuera de `public/`).

Cubre: formulario, «Probar con un ejemplo» (cada campo recibe su valor), «Empezar de cero», «Ver el prompt completo», «Copiar prompt» con portapapeles permitido (el portapapeles = el prompt), con la API bloqueada (alternativa) y con todo bloqueado (aparece el texto para copiar a mano), perfil (guardar, autocompletar en otra herramienta, borrar) y `localStorage` bloqueado, calculadoras (27 casos de prueba por vista, 54 comprobaciones: esperado frente a obtenido), conteos de los 2 analizadores (6 casos por vista), sin scroll horizontal, botones ≥ 44 px, foco visible con contraste ≥ 3:1, 0 errores de consola y prompt sin `{{ }}`, `undefined`, `null` ni `NaN`.

**Qué falló al principio y se corrigió** (commits aparte):
1. Botones del encabezado por debajo de 44 px: modo oscuro (36 px) y menú móvil (40 px) → 44 px (`cb6cd3b`).
2. Anillo de foco con contraste insuficiente: el verde de marca al 50 % daba ~1,6:1 en enlaces del encabezado, migas, tarjetas de la portada y botones (`Button`). Ahora es la tinta de la marca (2 px, ≥ 3:1) en todo el sitio (`cb6cd3b`, `f5d3b06`).
3. (Solo del entorno local) el registro de herramientas daba 0 páginas en Windows cuando OneDrive dejaba los archivos «a petición» (`isFile()` devolvía false): ahora solo descarta carpetas. No afectaba a Vercel (Linux).
4. Falsos positivos del propio recorrido, corregidos en el script: etiqueta «(obligatorio)» sin espacio, saltos de línea `\r\n` del portapapeles de Windows, id del bloque de conteos, transición de color que se medía a mitad de camino.

Nota: cuando un texto pegado tiene una línea que no se entiende, los analizadores muestran el aviso y **no** ofrecen conteos (ni los mandan al prompt) hasta que se corrige; el recorrido lo comprueba así.

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

## 4. Inventario de negocios de ejemplo

Todos los negocios principales llevan «(ficticio)» o «(ficticia)» en su **primera aparición** dentro de la página (comprobado por script en el orden en que se muestran los bloques: 15 de 15). Los negocios secundarios de las pestañas «según tu tipo de negocio» también llevan la marca (Estudio Trazo la lleva como «(ficticio, diseño gráfico)»).

| Página | Negocio principal | ¿«(ficticio)» en la 1.ª aparición? | Datos que usa |
|---|---|---|---|
| analisis/analizar-ventas-con-ia | Verde Hogar (ficticio), tienda de plantas de interior | Sí | Rubro: plantas; sin ciudad, dirección, horario ni WhatsApp; 14 ventas de agosto y septiembre 2026 (total $347.00; maceta $5 → $6); moneda «$» |
| analisis/calcular-punto-de-equilibrio | Café Mirador (ficticio), cafetería de barrio | Sí | Rubro: cafetería; sin ciudad, dirección ni WhatsApp; alquiler 800, sueldos 1.400, servicios 200, otros 160; venta promedio $4.00; costo variable $1.30; 26 días al mes; moneda «$» |
| clientes/analizar-opiniones-con-ia | Restaurante La Higuera (ficticio) | Sí | Rubro: restaurante; 25 reseñas ficticias del último trimestre; sin ciudad, dirección, horario, WhatsApp ni precios |
| clientes/responder-consultas-con-ia | Taller Los Pinos (ficticio), taller mecánico | Sí | Horario L–V 8:00–17:30 y sáb 8:00–13:00; cambio de aceite $35; una línea de WhatsApp (sin número); sin ciudad ni dirección; moneda «$» |
| clientes/responder-reclamos-con-ia | Luz de Barrio (ficticio), velas online | Sí | Vende por Instagram y WhatsApp (sin número); pedido entregado «martes 9 a las 14:12»; sin ciudad ni dirección |
| marketing/calendario-de-contenido-con-ia | Restaurante Mesa Larga (ficticio) | Sí | Rubro: restaurante; Instagram y Facebook; 3 h por semana; sin ciudad, dirección ni WhatsApp |
| marketing/crear-afiches-con-ia | Panadería La Espiga (ficticia) | Sí | «Av. Ejemplo 123 (dirección ficticia)», «Calle Ejemplo 45», WhatsApp «999 999 999»; combo $6 sábado y domingo 7:00–13:00; sin ciudad; moneda «$» |
| marketing/crear-anuncios-con-ia | Ferretería Casa y Clavo (ficticia) | Sí | «Calle Los Pinos con calle 5» (nombre de calle verosímil); sábado 10 de octubre 9:00–14:00; 20 % de descuento; «12 años atendiendo»; sin ciudad ni WhatsApp; moneda «$» |
| marketing/crear-promociones-con-ia | Café Mirador (ficticio) | Sí | Canasta café + croissant: normal $4.50, costo $1.30, promoción $4.00; martes a jueves 9:30–11:30; 20 → 24 pedidos por semana; sin ciudad ni dirección; moneda «$» |
| marketing/crear-publicaciones-para-redes-con-ia | Peluquería Rizo Fino (ficticia) | Sí | Instagram; tratamiento con 15 % de descuento, martes y miércoles hasta el 31 de octubre; sin ciudad, dirección ni WhatsApp |
| negocio/documentar-procesos-con-ia | Cerámica Sol (ficticia) | Sí | Tienda online con una persona (Lucía; Mateo empieza el lunes: nombres de pila ficticios); sin ciudad, dirección ni WhatsApp |
| negocio/organizar-tareas-con-ia | Lavandería Brisa (ficticia) | Sí | Tres personas (Luis, Marta); factura de luz que vence «el 10»; sin ciudad ni dirección |
| ventas/calcular-precios-y-margenes | Galletería Migas (ficticia) | Sí | Caja de 6 galletas: materiales $12, empaque $3, 15 min a $20/h, fijos $600 con 150 cajas; margen 40 %; competencia $36; moneda «$» |
| ventas/crear-cotizaciones-con-ia | Maderas Rivera (ficticio) | Sí | Cliente «Sra. Paredes»; ítems $450, $300, $700 y 12 h a $25; descuento 10 %, impuesto 20 %, anticipo 40 %; «del 12 al 27 de marzo»; WhatsApp (sin número); sin ciudad ni dirección |
| ventas/crear-descripciones-de-productos-con-ia | Luz de Cera (ficticio) | Sí | Vela Cedro y Vainilla de 200 g; se vende en tienda online y ferias; sin ciudad, dirección, horario ni precios |

**Negocios secundarios** (las pestañas «según tu tipo de negocio», con «(ficticio/a)»): Fonda El Sabor (11 páginas), Boutique Aldea (10), Estudio de uñas Brillo (7), Estudio Trazo (6), Rincón (3), La Esquina (1), Muebles Norte (1), Dulces Almendra (1) y Jabones Brisa (1). Usan datos coherentes entre páginas (por ejemplo, Fonda El Sabor: menú del día $5 de 12:00 a 15:00, plato de $8.00 en el punto de equilibrio), sin ciudad ni dirección real.

**Inconsistencias y riesgos (sin cambiar nada; decisión tuya):**

1. **Café Mirador tiene un precio distinto entre dos páginas.** En `crear-promociones-con-ia` el precio normal del combo café + croissant es $4.50 y la promoción $4.00; en `calcular-punto-de-equilibrio` el «pedido promedio de café + croissant» es $4.00 (dice que es una estimación). Coinciden el costo ($1.30) y la descripción del negocio (texto idéntico en las dos páginas: 1 párrafo duplicado). Para que el mismo negocio sea coherente, conviene usar $4.50 en el punto de equilibrio o aclarar que $4.00 es el precio de la promoción.
2. **Las pruebas de ejemplo del perfil** (`lib/herramientas/perfil.ts`) usan «Panadería La Espiga», «Lima, Perú», «Av. Ejemplo 123», «L–D 6:30–20:00», «WhatsApp 999 999 999» y moneda «S/», mientras la página de afiches usa «$» y un horario distinto (sábado y domingo 7:00–13:00, para un combo concreto). Es el mismo negocio con moneda y ciudad distintas.
3. **Datos que podrían coincidir con algo real:** «Lima, Perú» (ciudad real, solo en el ejemplo del perfil) y «Calle Los Pinos con calle 5» (anuncios). «Av. Ejemplo 123», «Calle Ejemplo 45» y «999 999 999» son claramente falsos. Conviene sustituir «Calle Los Pinos con calle 5» por «Calle Ejemplo» y evitar una ciudad real en el ejemplo del perfil.
4. **Nombres de negocios genéricos** («Café Mirador», «Casa y Clavo», «La Espiga», «La Higuera», «Mesa Larga», «Fonda El Sabor», «Rizo Fino», «Cerámica Sol», etc.) son frecuentes en el mundo real y pueden coincidir con negocios que existen. Todos están marcados como ficticios; **NO PUDE COMPROBAR** que ninguno coincida con un negocio real (no hay forma fiable de verificarlo desde aquí).
5. **Moneda:** todas las páginas usan «$» sin país; el impuesto varía entre ejemplos (20 % en Maderas Rivera, 18 % en Estudio Trazo, 5 % de descuento en Muebles Norte): son negocios distintos, sin conflicto.


## 5. Lighthouse móvil

**Lighthouse no está instalado en este equipo y no se instaló** (habría que descargarlo de npm: pídemelo si lo quieres). Por eso **NO PUDE COMPROBAR** las cuatro puntuaciones. Como aproximación, medí con Chrome (móvil 412×823, CPU ×4 más lenta, red tipo «4G lenta» 1,6 Mbps / 150 ms) sobre el build local, mediana de 3 cargas; **no equivalen a Lighthouse** (servidor local, sin auditoría de accesibilidad, buenas prácticas ni SEO):

| Página | FCP = LCP | CLS | TBT aprox. | Peticiones | Peso | JS | Fuentes | Imágenes |
|---|---|---|---|---|---|---|---|---|
| `/` | 2,2 s | 0 | ~1,0 s | 54 | 538 KB | 250 KB | 128 KB | 56 KB |
| `/marketing/crear-afiches-con-ia` | 2,3 s | 0 | ~1,1 s | 43 | 523 KB | 270 KB | 128 KB | 19 KB |

Tres problemas principales de cada una (según esas mediciones y la revisión del código):

- **Portada:** (1) bloqueo del hilo principal alto (~1,0 s con CPU ×4): hidratación de muchos componentes animados (`Reveal`, `FloatingIllustration`, marquesina); (2) 54 peticiones y 5 pesos de la fuente Metropolis (400–800, 128 KB); (3) el LCP es el titular y depende de las fuentes y del JS de animación.
- **`/marketing/crear-afiches-con-ia`:** (1) ~1,1 s de bloqueo del hilo principal: hidrata la página entera aunque solo el bloque de la herramienta es interactivo; (2) 270 KB de JS y 43 peticiones; (3) las mismas 5 fuentes (128 KB) para una página de texto.
- SEO y accesibilidad (que Lighthouse suele penalizar): la página es noindex a propósito (se ignora); el resto de comprobaciones de accesibilidad (etiquetas, foco, contraste del foco, tamaños de toque, sin desborde) las cubre el recorrido de la sección 3.

## 6. ¿Qué falta para `publicado: true`?

Todas las herramientas: `probadoEn` y `probadoFecha` vacíos (no hay prueba real todavía), og propia pendiente y capturas «Prueba real» pendientes (las pendientes son las que se ven como recuadros grises en revisión). «Qué corregí yo» solo puede escribirlo quien hizo la prueba. Detalle del resto de estándares (el validador, como si la página estuviera publicada):

| Página | Prueba real (puestas/pendientes) | Palabras editoriales (faltan para 1.500) | og propia | probadoEn / probadoFecha | Otros incumplimientos (validador como si estuviera publicada) |
|---|---|---|---|---|---|
| analisis/analizar-ventas-con-ia | 0 / 1 | 1318 (faltan 182) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| analisis/calcular-punto-de-equilibrio | 0 / 1 | 1272 (faltan 228) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3).; 1 texto(s) idéntico(s) a otra página |
| clientes/analizar-opiniones-con-ia | 0 / 1 | 1327 (faltan 173) | no | no | meta.descripcion tiene 161 caracteres: deben ser 140–160.; «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| clientes/responder-consultas-con-ia | 0 / 1 | 1351 (faltan 149) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| clientes/responder-reclamos-con-ia | 0 / 1 | 1307 (faltan 193) | no | no | meta.descripcion tiene 161 caracteres: deben ser 140–160.; «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| marketing/calendario-de-contenido-con-ia | 0 / 2 | 1268 (faltan 232) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| marketing/crear-afiches-con-ia | 0 / 2 | 1528 (ok) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| marketing/crear-anuncios-con-ia | 5 / 1 | 1455 (faltan 45) | no | no | ninguno |
| marketing/crear-promociones-con-ia | 3 / 1 | 1578 (ok) | no | no | ninguno; 1 texto(s) idéntico(s) a otra página |
| marketing/crear-publicaciones-para-redes-con-ia | 0 / 1 | 1287 (faltan 213) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| negocio/documentar-procesos-con-ia | 0 / 1 | 1315 (faltan 185) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| negocio/organizar-tareas-con-ia | 0 / 1 | 1220 (faltan 280) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| ventas/calcular-precios-y-margenes | 0 / 1 | 1293 (faltan 207) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| ventas/crear-cotizaciones-con-ia | 0 / 1 | 1240 (faltan 260) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |
| ventas/crear-descripciones-de-productos-con-ia | 0 / 1 | 1304 (faltan 196) | no | no | «Qué corregí yo» tiene 0 líneas (deben ser 3). |

Textos editoriales (≥ 60 caracteres) idénticos en más de una página: 1
  · [calcular-punto-de-equilibrio, crear-promociones-con-ia] Café Mirador (ficticio), cafetería de barrio con dos personas en el mostrador…


Otros puntos de los 19 estándares que hoy no se pueden dar por cumplidos para ninguna: (3) el texto coincide con las capturas (aún no hay capturas de la prueba nueva), (4) «Probado por Nicolas…», (11–13) verificados en escritorio y a 375 px con Chrome (596/596), **NO PUDE COMPROBAR** en un celular físico ni con lectores de pantalla, (15) og propia. Los dos casos de `meta.descripcion` de 161 caracteres (opiniones y reclamos) son ajustes de un carácter en el contenido editorial (no tocados).

## Palabras editoriales

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

| Página | Publicado | Capturas puestas | Pendientes | og propia | Archivos mencionados que no existen |
|---|---|---|---|---|---|
| /analisis/analizar-ventas-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /analisis/calcular-punto-de-equilibrio | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /clientes/analizar-opiniones-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /clientes/responder-consultas-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /clientes/responder-reclamos-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /marketing/calendario-de-contenido-con-ia | no | 0 de 0 (0 «Prueba real») | 2 | pendiente (usa /og-default.webp) | — |
| /marketing/crear-afiches-con-ia | no | 0 de 0 (0 «Prueba real») | 2 | pendiente (usa /og-default.webp) | — |
| /marketing/crear-anuncios-con-ia | no | 5 de 5 (5 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /marketing/crear-promociones-con-ia | no | 4 de 4 (3 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /marketing/crear-publicaciones-para-redes-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /negocio/documentar-procesos-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /negocio/organizar-tareas-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /ventas/calcular-precios-y-margenes | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /ventas/crear-cotizaciones-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |
| /ventas/crear-descripciones-de-productos-con-ia | no | 0 de 0 (0 «Prueba real») | 1 | pendiente (usa /og-default.webp) | — |

Total: 9 capturas puestas, 17 pendientes, 0 archivos mencionados que no existen; 15 og propias pendientes (esas páginas usan el respaldo /og-default.webp).

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

Carpeta de cada página: public/img/{área}/{slug}/. Los recuadros grises solo se ven con `next dev` o MOSTRAR_BORRADORES=true.

