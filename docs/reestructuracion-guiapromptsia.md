# Reestructuración de guiapromptsia.com — Modelo "Herramienta + guía corta"

Versión 1 · 23/09/2026

---

## 1. Resumen del cambio

| Antes | Después |
|---|---|
| Guías de ~7.000 palabras y 25–29 min de lectura | Herramienta + guía corta de 1.500–2.500 palabras; resultado en ~5 min |
| 4–5 prompts encadenados y 10–15 `{{VARIABLES}}` | 1 prompt maestro generado por un formulario, más botones "Mejorar" de una línea |
| ~9 capturas por guía | 1–2 capturas reales por página |
| URL `/{area}/guias/{slug}` | URL `/{area}/{slug}` |
| 20 guías con la misma estructura | 15 páginas de 4 tipos: Generador, Calculadora, Analizador, Kit |
| Datos del negocio escritos en cada guía | Perfil "Mi negocio" que se llena una vez y se reutiliza en todas |

---

## 2. Mapa de rutas nuevo

```
/                                   Inicio
/herramientas                       Biblioteca (reemplaza /guias)
/mi-negocio                         Perfil del negocio (noindex)
/como-probamos                      Metodología de pruebas reales
/sobre-nosotros
/contacto
/politica-de-privacidad
/politica-de-cookies
/terminos-y-condiciones

/marketing                          Página de área (con texto propio)
├── /marketing/crear-anuncios-con-ia
├── /marketing/crear-promociones-con-ia
├── /marketing/crear-afiches-con-ia
├── /marketing/crear-publicaciones-para-redes-con-ia
└── /marketing/calendario-de-contenido-con-ia

/ventas
├── /ventas/crear-descripciones-de-productos-con-ia
├── /ventas/crear-cotizaciones-con-ia
└── /ventas/calcular-precios-y-margenes

/clientes
├── /clientes/responder-consultas-con-ia
├── /clientes/responder-reclamos-con-ia
└── /clientes/analizar-opiniones-con-ia

/analisis
├── /analisis/analizar-ventas-con-ia
└── /analisis/calcular-punto-de-equilibrio

/negocio
├── /negocio/organizar-tareas-con-ia
└── /negocio/documentar-procesos-con-ia
```

**Reglas para nombrar rutas (también para las futuras):**
- `/{area}/{verbo}-{objeto}-con-ia` para Generadores, Analizadores y Kits.
- `/{area}/calcular-{objeto}` para Calculadoras.
- Todo en minúsculas, sin tildes ni "ñ", guiones medios y un máximo de ~6 palabras.
- Sin `/guias/` intermedio.

---

## 3. Las 15 rutas de lanzamiento

| # | Nueva ruta | Tipo | H1 (propuesto) | Viene de |
|---|---|---|---|---|
| 1 | /marketing/crear-anuncios-con-ia | Generador | Crea un anuncio para tu negocio en 5 minutos | crear-anuncios-con-ia |
| 2 | /marketing/crear-promociones-con-ia | Calculadora | Crea una promoción que no te haga perder dinero | crear-promociones-con-ia |
| 3 | /marketing/crear-afiches-con-ia | Generador | Crea el texto de un afiche que se entiende de un vistazo | crear-afiches-con-ia |
| 4 | /marketing/crear-publicaciones-para-redes-con-ia | Generador | Crea publicaciones para Instagram, Facebook y TikTok | crear-publicaciones-para-redes-sociales-con-ia |
| 5 | /marketing/calendario-de-contenido-con-ia | Kit | Arma tu calendario de publicaciones del mes | calendario-de-contenido + ideas-de-contenido (fusión) |
| 6 | /ventas/crear-descripciones-de-productos-con-ia | Generador | Crea descripciones de productos sin inventar datos | crear-descripciones-de-productos-con-ia |
| 7 | /ventas/crear-cotizaciones-con-ia | Calculadora | Prepara una cotización clara con los totales correctos | crear-cotizaciones-y-propuestas-con-ia |
| 8 | /ventas/calcular-precios-y-margenes | Calculadora | Calcula el precio de venta y el margen de tu producto | definir-precios-y-margenes-con-ia |
| 9 | /clientes/responder-consultas-con-ia | Generador | Responde las consultas de tus clientes sin prometer de más | responder-consultas-de-clientes-con-ia |
| 10 | /clientes/responder-reclamos-con-ia | Generador | Responde un reclamo con calma y sin comprometerte de más | responder-reclamos-con-ia |
| 11 | /clientes/analizar-opiniones-con-ia | Analizador | Descubre qué dicen tus clientes en sus comentarios | analizar-opiniones-de-clientes-con-ia |
| 12 | /analisis/analizar-ventas-con-ia | Analizador | Entiende tus ventas sin confundir hechos con suposiciones | analizar-ventas-con-ia |
| 13 | /analisis/calcular-punto-de-equilibrio | Calculadora | Calcula cuánto necesitas vender para no perder | **NUEVA** |
| 14 | /negocio/organizar-tareas-con-ia | Kit | Ordena tus pendientes y arma tu plan de la semana | organizar-tareas + sistema-diario (fusión) |
| 15 | /negocio/documentar-procesos-con-ia | Generador | Convierte cómo haces una tarea en un procedimiento claro | documentar-procesos-con-ia |

---

## 4. Ficha de cada ruta (campos del formulario y resultado)

Los campos del **perfil** (sección 6) se completan solos. Aquí están solo los campos **propios** de cada herramienta.

### 1. /marketing/crear-anuncios-con-ia — Generador
- **Campos:** qué anuncias · precio u oferta · beneficio principal (que puedas comprobar) · vigencia · canal (Instagram / Facebook / WhatsApp) · qué quieres que haga el cliente.
- **Resultado:** 3 versiones de anuncio, una versión para WhatsApp y una lista de afirmaciones que debes verificar.
- **Ejemplo real:** Casa y Clavo (capturas actuales).

### 2. /marketing/crear-promociones-con-ia — Calculadora
- **Calculadora:** producto · precio normal · costo unitario · tipo (descuento %, 2x1, combo, tarjeta de visitas) · precio con promoción · margen mínimo aceptable.
- **La página calcula:** margen con promoción, cuántas ventas extra necesitas y si conviene (Sí/No).
- **Prompt:** incluye los números ya calculados; la IA propone el texto de la promoción y 2 alternativas, **sin recalcular**.
- **Ejemplo real:** Café Mirador (capturas actuales + calculadora).

### 3. /marketing/crear-afiches-con-ia — Generador (PILOTO)
- **Campos:** oferta · precio · días y horario · lugar · condiciones · tamaño (A4 / A3) · herramienta de diseño (Canva, otra).
- **Resultado:** texto en 4 niveles (N1–N4), recortado a menos de 30 palabras; un brief para diseñar; un prompt de imagen **sin texto**.
- **Ejemplo real:** La Espiga (captura del chat + afiche final con la foto de los panes).

### 4. /marketing/crear-publicaciones-para-redes-con-ia — Generador
- **Campos:** objetivo (vender / informar / interactuar) · tema o producto · red social · formato (post, carrusel, historia, reel) · dato clave · llamada a la acción.
- **Resultado:** 3 opciones, adaptación al formato elegido, texto alternativo para la imagen y hashtags moderados.

### 5. /marketing/calendario-de-contenido-con-ia — Kit
- **Campos:** productos o temas del mes · fechas importantes · publicaciones por semana · horas disponibles por semana · redes.
- **Resultado:** banco de 12 ideas, calendario de 4 semanas en tabla y un plan para producir por lotes.

### 6. /ventas/crear-descripciones-de-productos-con-ia — Generador
- **Campos:** producto · datos comprobados (materiales, medidas, uso, cuidados) · dónde se vende · preguntas que hacen los clientes.
- **Resultado:** versión corta, versión larga y la lista FALTA (lo que no tiene dato).
- **Ejemplo real:** Luz de Cera (caso actual).

### 7. /ventas/crear-cotizaciones-con-ia — Calculadora
- **Calculadora:** ítems (descripción, cantidad, precio unitario) · descuento · impuesto (%) · validez · forma de pago · plazo de entrega.
- **La página calcula:** subtotales, descuento, impuesto y total.
- **Prompt:** redacta la cotización o propuesta con los totales ya calculados; la IA **no** calcula.

### 8. /ventas/calcular-precios-y-margenes — Calculadora
- **Calculadora:** costos directos por unidad · parte de costos fijos por unidad · margen deseado (%) · precio de la competencia (opcional).
- **La página calcula:** precio sugerido, margen en $ y en %, y cómo se compara con la competencia.
- **Prompt:** la IA revisa la lógica, sugiere escenarios y redacta cómo comunicar el precio.

### 9. /clientes/responder-consultas-con-ia — Generador
- **Campos:** la consulta (pegar) · datos relevantes (precios, stock, envíos, horarios) · canal.
- **Resultado:** respuesta lista, versión corta y lo que **no** se afirmó por falta de datos.

### 10. /clientes/responder-reclamos-con-ia — Generador
- **Campos:** el reclamo (pegar) · hechos confirmados · lo que sí puedes ofrecer · lo que no puedes ofrecer · canal.
- **Resultado:** separación entre hechos y emociones, respuesta profesional y siguiente paso concreto.

### 11. /clientes/analizar-opiniones-con-ia — Analizador
- **Campos:** comentarios o reseñas (pegar **sin datos personales**) · período · de dónde vienen.
- **Resultado:** temas con conteo, citas textuales, elogios, problemas y 3 acciones; aviso de verificar los conteos.

### 12. /analisis/analizar-ventas-con-ia — Analizador
- **Campos:** tabla de ventas (fecha, producto, cantidad, monto) · período · qué quieres entender.
- **Resultado:** hallazgos separados en "dato" e "hipótesis", qué verificar y 3 decisiones posibles.

### 13. /analisis/calcular-punto-de-equilibrio — Calculadora (NUEVA)
- **Calculadora:** costos fijos del mes (alquiler, sueldos, servicios...) · precio promedio de venta · costo variable por unidad · días que abres al mes.
- **La página calcula:** unidades y ventas en $ al mes y por día para no perder; margen de contribución.
- **Prompt:** la IA explica el resultado en palabras simples y propone 3 formas de bajar el punto de equilibrio.
- **Ejemplo real:** un caso ficticio nuevo (por ejemplo, Café Mirador, para dar continuidad).

### 14. /negocio/organizar-tareas-con-ia — Kit
- **Campos:** lista de pendientes (pegar, aunque esté desordenada) · horas disponibles por día · fechas límite · quién más puede ayudar.
- **Resultado:** tareas priorizadas (urgente / importante), plan de la semana, qué delegar y una rutina diaria de 15 minutos (lo que venía de "sistema diario").

### 15. /negocio/documentar-procesos-con-ia — Generador
- **Campos:** nombre del proceso · cómo lo haces, contado a tu manera · quién lo hace · errores frecuentes.
- **Resultado:** procedimiento paso a paso, checklist imprimible y puntos de control.

---

## 5. Redirecciones 301 (de las URLs viejas a las nuevas)

| URL vieja | URL nueva |
|---|---|
| /guias | /herramientas |
| /marketing/guias | /marketing |
| /ventas/guias | /ventas |
| /clientes/guias | /clientes |
| /analisis/guias | /analisis |
| /negocio/guias | /negocio |
| /marketing/guias/crear-anuncios-con-ia | /marketing/crear-anuncios-con-ia |
| /marketing/guias/crear-promociones-con-ia | /marketing/crear-promociones-con-ia |
| /marketing/guias/crear-afiches-con-ia | /marketing/crear-afiches-con-ia |
| /marketing/guias/crear-publicaciones-para-redes-sociales-con-ia | /marketing/crear-publicaciones-para-redes-con-ia |
| /marketing/guias/calendario-de-contenido-con-ia | /marketing/calendario-de-contenido-con-ia |
| /marketing/guias/ideas-de-contenido-para-tu-negocio-con-ia | /marketing/calendario-de-contenido-con-ia |
| /marketing/guias/crear-campanas-promocionales-con-ia | /marketing/crear-promociones-con-ia ¹ |
| /ventas/guias/crear-descripciones-de-productos-con-ia | /ventas/crear-descripciones-de-productos-con-ia |
| /ventas/guias/crear-cotizaciones-y-propuestas-con-ia | /ventas/crear-cotizaciones-con-ia |
| /ventas/guias/definir-precios-y-margenes-con-ia | /ventas/calcular-precios-y-margenes |
| /clientes/guias/responder-consultas-de-clientes-con-ia | /clientes/responder-consultas-con-ia |
| /clientes/guias/responder-reclamos-con-ia | /clientes/responder-reclamos-con-ia |
| /clientes/guias/analizar-opiniones-de-clientes-con-ia | /clientes/analizar-opiniones-con-ia |
| /analisis/guias/analizar-ventas-con-ia | /analisis/analizar-ventas-con-ia |
| /analisis/guias/analizar-ofertas-de-proveedores-con-ia | /analisis ¹ |
| /analisis/guias/investigar-competidores-con-ia | /analisis ¹ |
| /analisis/guias/ideas-de-nuevos-productos-con-ia | /analisis ¹ |
| /negocio/guias/organizar-tareas-del-negocio-con-ia | /negocio/organizar-tareas-con-ia |
| /negocio/guias/sistema-diario-de-trabajo-con-ia | /negocio/organizar-tareas-con-ia |
| /negocio/guias/documentar-procesos-con-ia | /negocio/documentar-procesos-con-ia |

¹ Redirección temporal a la página más cercana. Cuando esa herramienta vuelva en una ola futura, **cambia el destino** de la redirección a su nueva URL (por ejemplo, campañas → /marketing/crear-campanas-con-ia).

**Ejemplo en `next.config.js`:**

```js
async redirects() {
  return [
    { source: '/guias', destination: '/herramientas', permanent: true },
    { source: '/:area(marketing|ventas|clientes|analisis|negocio)/guias', destination: '/:area', permanent: true },
    { source: '/marketing/guias/crear-anuncios-con-ia', destination: '/marketing/crear-anuncios-con-ia', permanent: true },
    // ... una línea por cada fila de la tabla (siempre rutas explícitas; no usar comodín para los slugs que cambian)
  ];
}
```

---

## 6. Perfil "Mi negocio" (/mi-negocio)

Se guarda en el navegador del usuario (localStorage, dentro de try/catch). **No se envía a ningún servidor.** Se muestra en un panel desplegable en cada herramienta, con opciones para editarlo o borrarlo.

| Campo | Ejemplo |
|---|---|
| Nombre del negocio | Panadería La Espiga |
| Rubro | Panadería |
| Ciudad y país | Lima, Perú |
| Qué vendes (principal) | Pan del día, pan dulce, tortas por encargo |
| Clientes típicos | Familias del barrio, oficinistas por la mañana |
| Tono | Cercano / Profesional / Divertido |
| Canales | WhatsApp, Instagram, local |
| Dirección | Av. Ejemplo 123 |
| Horario | L–D 6:30–20:00 |
| Contacto | WhatsApp 999 999 999 |
| Moneda | S/ ($, €, etc.) |

Texto visible obligatorio: *"Tus datos se guardan solo en este navegador. No los recibimos ni los almacenamos."* Actualiza la política de privacidad con una frase equivalente.

---

## 7. Plantilla de cada página (13 bloques)

1. **Título con resultado** + etiquetas: *5 min · Gratis · ChatGPT, Gemini o Claude*.
2. **Antes / después:** el pedido típico frente al resultado de la herramienta.
3. **Herramienta:** formulario o calculadora, "Probar con un ejemplo", "Copiar prompt" (con mensaje "Copiado ✓ Ahora pégalo en tu IA").
4. **Cómo usarlo:** 3 pasos.
5. **Mejora el resultado:** 3–4 prompts de una línea para el mismo chat, sin variables.
6. **Ejemplo real:** caso de ejemplo, 1–2 capturas reales y "Qué corregí yo" (3 líneas).
7. **Revisa antes de publicar:** 5 casillas marcables.
8. **Por qué funciona:** 3–4 ideas del prompt explicadas.
9. **Según tu tipo de negocio:** pestañas (restaurante / tienda / servicios) con un ejemplo y un consejo.
10. **Errores comunes:** 3–4 con su solución.
11. **Preguntas frecuentes:** 4–6.
12. **Siguiente paso:** 2–3 herramientas relacionadas.
13. **Autor y verificación:** "Probado por Nicolas en [IA] el [fecha]" · "Actualizado el [fecha]".

**Anuncios de AdSense:** después del bloque 6 y después del bloque 10. Nunca dentro del bloque 3 ni junto a "Copiar prompt".

**Extensión objetivo:** 1.500–2.500 palabras por página.

---

## 8. Estructura técnica (fácil de mantener)

### 8.1 Una página = un archivo de datos

`content/herramientas/{area}/{slug}.ts` (o `.json`)

```ts
export default {
  meta: {
    slug: 'crear-afiches-con-ia',
    area: 'marketing',
    tipo: 'generador',            // generador | calculadora | analizador | kit
    titulo: 'Crea el texto de un afiche que se entiende de un vistazo',
    descripcion: '...',           // meta description, 140–160 caracteres
    tiempo: '5 min',
    probadoEn: 'ChatGPT',
    probadoFecha: '2026-09-23',
    actualizado: '2026-09-23',
    ogImage: '/img/marketing/crear-afiches-con-ia/og.webp',
  },
  antesDespues: { antes: '...', despues: '...' },
  campos: [
    { id: 'oferta', label: '¿Qué ofreces?', tipo: 'texto', ejemplo: 'Combo de fin de semana: 6 panes y 1 pan dulce', requerido: true },
    // ...
  ],
  usaPerfil: ['nombre', 'direccion', 'horario', 'tono'],
  calculadora: null,              // o { entradas: [...], formulas: '...', salidas: [...] }
  tarea: `...`,                   // parte 2 del prompt (la específica)
  mejoras: [ { label: 'Más corto', prompt: 'Hazlo más corto sin perder el precio ni la fecha.' } ],
  ejemplo: { negocio: 'La Espiga (ficticio)', datos: {...}, capturas: [{ src, alt, etiqueta: 'Prueba real' }], queCorregi: ['...'] },
  checklist: ['...'],
  porQueFunciona: [ { titulo: '...', texto: '...' } ],
  rubros: [ { rubro: 'Restaurante', ejemplo: '...', consejo: '...' } ],
  errores: [ { error: '...', solucion: '...' } ],
  faq: [ { p: '...', r: '...' } ],
  relacionadas: ['marketing/crear-promociones-con-ia', 'marketing/crear-anuncios-con-ia'],
  metodoCompleto: null,           // opcional: texto largo plegado
}
```

### 8.2 Prompt en 3 partes

- `lib/prompts/reglas-comunes.ts`: no inventar datos; si falta algo importante, preguntar antes de escribir; marcar [FALTA]; usar el tono y el idioma del perfil; no calcular si la página ya entregó los números.
- `tarea` (propia de cada página).
- `lib/prompts/cierre-comun.ts`: autorrevisión breve (datos que usé, FALTA, qué debe verificar una persona).

`construirPrompt(perfil, campos, calculos, tarea)` arma el texto final. Si se mejoran las reglas comunes, cambian las 15 páginas a la vez.

### 8.3 Componentes compartidos

`PaginaHerramienta` (plantilla de 13 bloques) · `FormularioHerramienta` · `Calculadora` · `PanelPerfil` · `BotonCopiar` · `MejorasPrompt` · `EjemploReal` · `ChecklistRevision` · `PestanasRubro` · `Faq` · `Relacionadas` · `FirmaVerificacion` · `EspacioAnuncio`.

Ruta dinámica: `app/[area]/[slug]/page.tsx` lee el archivo de datos; `generateStaticParams` crea las 15 páginas.

### 8.4 SEO técnico

- Canonical con la nueva URL, en `https://www.guiapromptsia.com` (un solo dominio canónico).
- Sitemap: solo las URLs nuevas y las páginas institucionales. `/mi-negocio` queda fuera y con noindex.
- JSON-LD: `Article` (uno solo por página) + `BreadcrumbList`; `FAQPage` es opcional.
- Breadcrumb visible: Inicio › Marketing › Crear afiches con IA.
- Enlaces internos: todos hacia las URLs nuevas (no depender de las redirecciones).
- `og:image` propia por página.

---

## 9. Plan de crecimiento (después del lanzamiento)

Ritmo: **2 páginas nuevas al mes**, cada una con prueba real.

| Ola | Rutas |
|---|---|
| 2 | /marketing/crear-campanas-con-ia (Kit) · /analisis/comparar-proveedores (Calculadora) · /clientes/responder-resenas-de-google-con-ia · /ventas/recordatorio-de-pago-con-ia |
| 3 | /analisis/investigar-competidores-con-ia · /analisis/ideas-de-nuevos-productos-con-ia · /marketing/guion-para-videos-cortos-con-ia · /analisis/calcular-costo-de-receta |
| 4 | /ventas/seguimiento-de-cotizaciones-con-ia · /ventas/calcular-precio-por-hora · /clientes/preguntas-frecuentes-con-ia · /negocio/anuncio-de-empleo-con-ia |
| 4b — Anuncios por plataforma | /marketing/anuncios-para-facebook-con-ia · /marketing/anuncios-para-instagram-con-ia · /marketing/anuncios-para-tiktok-con-ia · /marketing/anuncios-para-google-con-ia · /marketing/mensajes-para-whatsapp-business-con-ia. /marketing/crear-anuncios-con-ia pasa a ser la página general que enlaza a cada plataforma. Los límites de caracteres y formatos de cada plataforma se verifican en su documentación oficial al escribir cada página y se anotan con fecha. |
| 5+ | /kits/dia-de-la-madre · /kits/navidad · /kits/abrir-mi-negocio · /kits/mis-ventas-bajaron |

Al publicar las olas 2 y 3, actualiza las redirecciones marcadas con ¹.

**AdSense:** postular cuando esté completa la ola 2 (~19 páginas en el formato nuevo) y el sitio lleve algunas semanas estable. Ninguna estructura garantiza la aprobación.

---

## 10. Orden de trabajo

1. **Infraestructura** (sin cambiar URLs todavía): esquema de datos, plantilla, componentes, perfil, prompts comunes.
2. **Piloto:** /marketing/crear-afiches-con-ia completo, con prueba real.
3. **Anuncios y promociones** (ya tienen capturas).
4. **Calculadoras:** cotizaciones, precios y márgenes, punto de equilibrio.
5. **Generadores:** publicaciones, descripciones, consultas, reclamos, procesos.
6. **Analizadores y kits:** opiniones, ventas, calendario, tareas.
7. **Cambio de rutas en un solo despliegue:** activar las 15 URLs nuevas, las redirecciones, el sitemap, el menú, /herramientas y las páginas de área. Quitar las rutas viejas.
8. **Verificación final** (sección 12).

Mientras se trabaja, el sitio actual sigue en línea sin cambios. Todo se hace en una rama y se publica a `main` (la rama de producción en Vercel) solo en el paso 7, o por lotes si prefieres ir publicando.

---

## 11. Prompts para Claude Code

> Pásalos **uno por fase**, no todos juntos. Al final de cada fase, pide un resumen de los archivos cambiados y verifica en local antes de seguir.

### Fase 1 — Infraestructura

```
Contexto: guiapromptsia.com (Next.js en Vercel, producción = rama main). Vamos a pasar de guías largas con prompts encadenados a un modelo "Herramienta + guía corta". Lee primero el archivo reestructuracion-guiapromptsia.md (secciones 6, 7 y 8), que te voy a adjuntar o pegar.

Trabaja en una rama nueva llamada reestructura-herramientas creada desde main. No toques las rutas actuales ni borres nada todavía.

Tareas:
1. Crea el esquema TypeScript de una página de herramienta (sección 8.1) y la carpeta content/herramientas/{area}/.
2. Crea lib/prompts/reglas-comunes.ts, lib/prompts/cierre-comun.ts y la función construirPrompt(perfil, campos, calculos, tarea). El prompt resultante no debe contener {{ }} visibles; los campos vacíos se omiten o se marcan como [FALTA].
3. Crea los componentes compartidos de la sección 8.3, usando el diseño y los estilos actuales del sitio. Deben ser accesibles (labels, foco visible, contraste AA) y funcionar bien en celular.
4. Crea el perfil "Mi negocio" (sección 6): página /mi-negocio con noindex, guardado en localStorage dentro de try/catch, y un PanelPerfil desplegable reutilizable. Debe funcionar aunque localStorage no esté disponible.
5. BotonCopiar: copia al portapapeles, muestra "Copiado ✓ Ahora pégalo en ChatGPT, Gemini o Claude" y tiene una alternativa si la API del portapapeles falla.
6. Componente Calculadora genérico: entradas numéricas con validación, fórmulas definidas en el archivo de datos y resultados que se insertan en el prompt.
7. EspacioAnuncio: un contenedor vacío (sin código de AdSense todavía) que solo se usa después de los bloques 6 y 10 de la plantilla.
8. Crea la ruta dinámica app/[area]/[slug]/page.tsx que lee el archivo de datos, con metadata, canonical, JSON-LD Article + BreadcrumbList y generateStaticParams. Para probar, créala con un archivo de datos de ejemplo mínimo que no se incluya en el sitemap.

No inventes contenido editorial: donde falte texto, deja un TODO en el archivo de datos, no en la página visible.
Al terminar: lista de archivos creados, cómo probarlo en local y cualquier duda.
```

### Fase 2 — Piloto: crear afiches

```
En la rama reestructura-herramientas, crea content/herramientas/marketing/crear-afiches-con-ia.ts siguiendo el esquema y la plantilla de 13 bloques.

Usa como fuente la guía actual /marketing/guias/crear-afiches-con-ia y la ficha de la sección 4 (ruta 3) del documento. Reutiliza el caso La Espiga y sus datos exactos:
N1 "Combo de fin de semana: 6 panes y 1 pan dulce por $6"; N2 "Sábado y domingo, de 7:00 a 13:00"; N3 "Entrar a comprar el combo · Panadería La Espiga, Av. Ejemplo 123"; N4 "Hasta agotar existencias. Máximo 2 combos por persona."

Reglas:
- 1.500 a 2.500 palabras visibles.
- Resume el contenido valioso de la guía actual (niveles N1–N4, prueba de los 3 segundos, contraste) dentro de "Por qué funciona", "Errores comunes" y "Revisa antes de publicar". No lo copies entero.
- Deja los espacios de capturas con la etiqueta "Prueba real" y rutas de imagen que yo completaré; no muestres notas de producción en la página visible.
- No inventes resultados, estadísticas ni testimonios.
- Fecha probada y autor: déjalos como TODO para que yo los complete.

Al terminar, dime qué imágenes necesito aportar (nombre de archivo, tamaño y qué debe mostrar).
```

### Fase 3 — Migración del resto (repetir por lote)

```
En la rama reestructura-herramientas, crea los archivos de datos de estas herramientas: [LISTA DEL LOTE].
Para cada una, usa como fuente su guía actual (ver tabla de la sección 3, columna "Viene de") y su ficha de la sección 4. Mismas reglas que el piloto de afiches. Para /analisis/calcular-punto-de-equilibrio (nueva) redacta el contenido desde cero con un caso ficticio marcado como tal.
En las calculadoras, las fórmulas van en el archivo de datos y verifícalas con 3 casos de prueba cuyos resultados me muestres.
Al terminar, lista de imágenes pendientes por página.
```

Lotes sugeridos: (a) anuncios y promociones · (b) cotizaciones, precios y márgenes, punto de equilibrio · (c) publicaciones, descripciones, consultas, reclamos, procesos · (d) opiniones, ventas, calendario, tareas.

### Fase 4 — Cambio de rutas

```
En la rama reestructura-herramientas:
1. Crea /herramientas (biblioteca con filtros por área y tipo) y reescribe las páginas de área /marketing, /ventas, /clientes, /analisis y /negocio con un texto introductorio propio de 150–300 palabras cada una, más las tarjetas de sus herramientas.
2. Crea /como-probamos: cómo se prueba cada prompt, con qué IA, cómo se toman las capturas y cada cuánto se revisan. Sin inventar datos.
3. Agrega en next.config.js TODAS las redirecciones 301 de la sección 5 del documento, con rutas explícitas.
4. Elimina las rutas viejas /{area}/guias/*, /guias y sus archivos de contenido, después de confirmar que cada una tiene su redirección.
5. Actualiza el menú, el pie de página, el inicio (textos más directos: "Elige la tarea, llena 5 datos y copia el prompt"; quita los "min de lectura"), los enlaces internos, el sitemap (solo URLs nuevas, sin /mi-negocio) y robots.
6. Actualiza "Sobre nosotros" (autor con nombre) y la política de privacidad (datos del perfil guardados solo en el navegador).
7. Ejecuta el build y comprueba que no haya enlaces internos rotos. Dame una tabla con cada URL vieja, su código de respuesta y su destino.
No hagas merge a main: avísame cuando esté listo y yo lo reviso.
```

---

## 12. Checklist antes de publicar el cambio de rutas

- [ ] Las 15 URLs nuevas responden 200 y tienen canonical propio.
- [ ] Las 26 URLs viejas responden 301 hacia el destino correcto (ninguna 404).
- [ ] El sitemap solo tiene las URLs nuevas y las institucionales.
- [ ] Ningún enlace interno apunta a /guias/.
- [ ] Cada herramienta: el formulario funciona, "Probar con un ejemplo" funciona, "Copiar" funciona en celular y el perfil se autocompleta.
- [ ] Las calculadoras dan resultados correctos en 3 casos de prueba.
- [ ] Cada página tiene 1–2 capturas reales, "Probado el..." y ninguna nota de producción visible.
- [ ] Las páginas de área y /herramientas tienen texto propio.
- [ ] Privacidad y "Sobre nosotros" están actualizados.
- [ ] Probado en celular (375 px) y en escritorio.
- [ ] Después del despliegue: enviar el sitemap nuevo en Google Search Console y revisar la cobertura a la semana.
