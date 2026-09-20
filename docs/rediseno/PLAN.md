# Rediseño visual premium — Plan (fases 1 y 2)

Estado: **plan + implementación en el árbol de trabajo (sin commit ni deploy)**. Este documento recoge la auditoría, la dirección artística, el plan página por página y el inventario de imágenes por generar. No hay ninguna imagen generada ni referenciada como si existiera: cada imagen entra por un componente que la muestra **solo si el archivo existe** (mismo criterio que las imágenes de las guías).

## 1. Auditoría (fase 1)

**Stack:** Next.js 16 (App Router), React 19, Tailwind v4 con tokens en `app/globals.css`, `next-themes` (claro/oscuro), Metropolis como fuente, MDX para las guías, `framer-motion` instalado (no se usa en el rediseño: todo con CSS).

**Páginas (rutas):** `/` · `/guias` · `/[categoria]` (marketing, ventas, clientes, analisis, negocio) · `/[categoria]/guias/[slug]` (20 guías) · `/sobre-nosotros` · `/contacto` · `/politica-de-privacidad` · `/politica-de-cookies` · `/terminos-y-condiciones` · 404, error, loading.

**Layout compartido:** `app/(site)/layout.tsx` (Navbar, Footer, ConsentBanner). Componentes de guía en `components/guide/` (≈45), reutilizables y ya conectados a los datos (`data.ts` + `guide.mdx`).

**Hallazgos visuales (el problema que hay que resolver):**
1. Todas las páginas comparten el mismo esqueleto: contenedor `max-w-5xl` centrado, encabezado de texto y rejillas de tarjetas idénticas (`GuideCard` ×N en 2–3 columnas). Portada, biblioteca y hubs se leen como la misma página con distinto texto.
2. Casi todo va dentro de una caja (`rounded-xl border bg-…`): pasos, categorías, ficha rápida, marco, caso, relacionadas. No hay jerarquía entre contenido, navegación y decoración.
3. Un único fondo (blanco) en todo el sitio; los únicos efectos son un punteado en el hero y un `bg-muted/30` en dos franjas.
4. Sin imágenes en portada, hubs, biblioteca ni páginas institucionales. En las guías existe el mecanismo de imágenes (hero, explicativas, pruebas), pero la cabecera cae a una versión tipográfica cuando no hay archivo, y las tarjetas no usan el hero.
5. Sin ritmo de scroll: ninguna sección revela, nada tiene profundidad; la barra superior es correcta pero pesada (indicador activo con brillo y punto).
6. Las guías son largas (hasta 24 secciones): no hay referencia visual de dónde estás salvo el índice lateral; las secciones son iguales entre sí.
7. Deuda no visual, sin tocar: `navbar.tsx` referencia `/images/guias/general/logolight.jpg|logodark.png` (existen).

**Riesgos de romper lógica (y cómo se evitan):** no se tocan `lib/`, `content/`, rutas, metadatos, JSON-LD, `generateStaticParams`, ni datos; los componentes de guía conservan props y HTML semántico (un solo H1, FAQ en el HTML); los efectos nuevos son CSS o pequeños componentes cliente aislados con `prefers-reduced-motion`; los contadores de sección son CSS puro.

## 2. Dirección artística (fase 3)

**Concepto: «cuaderno de trabajo luminoso».** Una publicación editorial sobre tecnología práctica: papel cálido y limpio, tinta verde-azulada muy oscura para las franjas de contraste, una cinta de degradado (menta → cian → violeta suave) inspirada en las cintas diagonales de Stripe, números grandes como en la documentación de ReadMe/Mintlify y una malla de fichas asimétricas en lugar de cuadrículas de tarjetas. La marca sigue siendo el verde menta actual.

Principios extraídos de las referencias (sin copiar ningún componente):
- **Stripe:** cabecera con banda diagonal de color, cifras enormes, franjas oscuras a sangre entre secciones claras, columnas 7/5 y 5/7, listas de logos → aquí, listas de tareas en marquesina.
- **Mintlify:** fondo oscuro con retícula de piezas de tamaños distintos y píldoras de filtro → aquí, mosaico de guías con una pieza destacada y filas compactas.
- **ReadMe:** rejilla editorial con miniaturas de muchos tamaños y tipografía de revista → aquí, la biblioteca por áreas con un rótulo fijo a un lado y lista de filas al otro.

**Sistema global**
- **Color:** `--background` papel (`oklch(0.992 0.004 100)`), `--paper-2` (`oklch(0.972 0.008 150)`), franja `ink` (`oklch(0.17 0.03 200)`, siempre oscura: se logra con la clase `dark` local, así todos los componentes internos usan los tokens oscuros), menta de marca, acento cian y violeta solo dentro de la cinta y de los brillos.
- **Tipografía:** Metropolis (sin cambios); títulos de portada a `clamp(2.6rem, 6vw, 5.2rem)` con `-0.035em`; eyebrows monoespaciados; numerales gigantes (`01`…) en outline o en color tenue.
- **Fondos:** papel plano, `paper-2`, `ink`, cinta diagonal (`.aurora-ribbon`), retícula de líneas (`.bg-lines`), grano muy sutil (`.bg-grain`, SVG en data-URI de 1 KB), resplandor menta (`.glow-brand`).
- **Formas:** rectángulos de radios mezclados (0, 1rem, 2rem) y líneas finas; ya no todo lleva borde. Los paneles solo existen donde hay herramienta (prompt, tabla, rúbrica).
- **Profundidad:** N1 contenido · N2 contenido secundario · N3 decoración (ilustraciones flotantes, números) · N4 fondos.
- **Movimiento:** `Reveal` (aparición al entrar, opacidad + 12 px), `Parallax` (transform en formas y siluetas decorativas, solo ≥ `md`), progreso de lectura con `animation-timeline: scroll()` (sin JS), marquesina CSS de tareas. Todo desactivado con `prefers-reduced-motion`.

## 3. Componentes nuevos (fase 4)

En `components/visual/` (genéricos, sin contenido propio; ya implementados):
| Componente | Tipo | Función |
| --- | --- | --- |
| `SiteImage` | servidor | Imagen de `public/images/site/…` solo si existe; marcador punteado en desarrollo o con `NEXT_PUBLIC_SHOW_IMAGE_SLOTS=true`; nada en producción |
| `FloatingIllustration` | servidor + `Parallax` | PNG transparente que sobresale del contenedor, con paralaje suave y oculto en móvil si se pide |
| `Reveal` | cliente | Aparición al entrar en pantalla |
| `Parallax` | cliente | Desplazamiento vertical ligado al scroll (rAF, transform), ≥ `md` |
| `AuroraRibbon` | servidor | Cinta diagonal de degradado y retícula, decorativa (`aria-hidden`) |
| `Marquee` | servidor | Fila de textos en desplazamiento CSS; lista estática accesible |
| `BigIndex` | servidor | Numeral gigante decorativo |
| `EditorialHero` | servidor | Cabecera de páginas del sitio (texto a un lado, composición al otro; variante `quiet` para páginas de texto) |
| `ReadingProgress` | servidor | Barra de progreso de lectura (CSS) |

Rediseñados: `Navbar`, `Footer`, `SectionHeading`, `GuideCard` (variantes `card`, `row`, `feature`), `GuideHeader`, `GuideSection`, `GuideToc`, `QuickFacts`, `FrameworkSection`, `CaseStudy`, `RelatedGuides`, `LegalPage`, `not-found` y `loading`.

## 4. Plan por página (fase 2)

### `/` — Portada
- **Objetivo visual:** que en 5 segundos se vea un producto editorial, no una plantilla; llevar a `/guias` y a las cinco áreas.
- **Problemas actuales:** hero centrado sin imagen; categorías y pasos en rejillas de cajas idénticas; sección de guías como 3×N tarjetas.
- **Dirección:** cabecera 7/5 con cinta diagonal, texto exacto de hoy y, a la derecha, una composición de tres fichas apiladas con títulos reales de guías + ilustración flotante que sobresale (pendiente); marquesina de las 12 tareas; áreas como **filas editoriales** con numeral gigante, título, primera situación, número de guías y miniatura (pendiente); método en **franja oscura** a sangre con línea de tiempo y numerales; guías en mosaico (una destacada 7 cols + dos en 5 cols) y el resto en filas; cierre «La IA ayuda…» a tres columnas asimétricas con una silueta (pendiente).
- **Secciones:** Hero · Marquesina · Áreas · Método (ink) · Guías · Cierre editorial.
- **Interacciones:** reveal por sección, hover que desplaza la flecha y sube la miniatura, marquesina en pausa al pasar el cursor.
- **Responsive:** en móvil desaparecen cinta y flotantes, las filas de áreas pasan a una columna sin miniatura, la línea de tiempo pasa a vertical.

### `/guias` — Biblioteca
- **Objetivo:** explorar 20 guías por área sin sensación de catálogo.
- **Problemas:** 5 bloques iguales de tarjetas.
- **Dirección:** cabecera con un contador grande (nº de guías y de áreas, calculado) y navegación por áreas en píldoras (anclas); cada área con rótulo **fijo a la izquierda** (nombre, descripción, enlace) y las guías como **filas** a la derecha; se alternan `paper` y `paper-2`; una ilustración de cabecera (pendiente).
- **Interacciones:** píldoras con ancla suave, filas con desplazamiento de flecha, reveal.

### `/[categoria]` — Áreas (marketing, ventas, clientes, analisis, negocio)
- **Objetivo:** que cada área tenga identidad propia con la misma composición.
- **Dirección:** cabecera con el nombre del área en tipografía enorme (outline detrás del H1), ilustración de área a la derecha que sobresale (pendiente), «situaciones» como lista con numerales sobre fondo `ink`, introducción en dos columnas 5/7, guías con una destacada y filas, «otras áreas» como enlaces grandes en fila.
- **Identidad por área:** la misma composición para las cinco; lo que cambia es el nombre del área en contorno detrás del título y el objeto 3D propio (pendiente de generar).

### `/[categoria]/guias/[slug]` — Guía (20 páginas)
- **Objetivo:** lectura larga con orientación constante y ritmo visual.
- **Problemas:** todas las secciones iguales; cabecera sin peso; sin sensación de progreso.
- **Dirección:** barra de progreso; cabecera editorial con cinta, título grande, metadatos en línea monoespaciada y el hero (cuando exista el archivo) desbordando el contenedor; en el cuerpo, **numeral de sección** grande en el margen (CSS counters), índice lateral con línea de progreso, ficha rápida como «billete» con divisores, marco de trabajo con numerales enormes, caso práctico en superficie cálida, relacionadas con una pieza destacada y silueta (pendiente).
- **Interacciones:** reveal de secciones, zoom ya existente en imágenes, índice móvil ya existente.
- **Responsive:** los numerales del margen pasan a la línea del eyebrow en < `lg`; la cinta se simplifica.

### `/sobre-nosotros`, `/contacto`, legales
- **Sobre nosotros:** cabecera editorial, rail izquierdo con índice de las secciones H2 (sin JS: anclas) y texto a 2/3, ilustración (pendiente).
- **Contacto:** composición dividida: mensaje y correo enormes a la izquierda, ilustración flotante a la derecha (pendiente).
- **Legales:** mismo contenedor sobrio, cabecera con etiqueta de «última actualización», `prose` con medida de lectura, sin decoración pesada.

### 404 / carga / error
Composición centrada con numeral 404 gigante y una ilustración (pendiente); `loading` con esqueleto de la nueva cabecera.

### Navbar / Footer
Navbar: misma lógica (rutas, activo, menú móvil, tema); pasa a barra fina con vidrio, indicador activo simple (subrayado), sin brillos. Footer: franja `ink` con el nombre del sitio en tamaño enorme, columnas y línea legal.

## 5. Accesibilidad, rendimiento y SEO
- Contraste AA en claro y oscuro (los tokens `ink` se validan como texto claro sobre fondo oscuro); foco visible heredado de `guide-focus`; toda decoración con `aria-hidden`; movimiento condicionado a `prefers-reduced-motion: no-preference`.
- Sin librerías nuevas; sin cambios de layout tras la carga (las imágenes usan `aspect-ratio` y `next/image`); parallax solo con `transform`, en ≥ `md`, con un único listener pasivo y rAF.
- No cambian metadata, canonical, JSON-LD, sitemap, robots, encabezados funcionales ni enlaces internos.

## 6. Matriz de imágenes (no generadas)

| Página | Sección | Imagen | Archivo | Tipo | Aspect ratio | Transparente | Prioridad |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Hero | Asistente y fichas de trabajo | `home-hero.png` | Ilustración 3D + PNG | 4/5 | Sí | Alta |
| `/` | Método | Mesa de trabajo con pasos | `home-metodo.png` | Ilustración editorial | 16/10 | Sí | Media |
| `/` | Cierre | Balanza persona/IA | `home-criterio.png` | Silueta 3D | 1/1 | Sí | Media |
| `/` y `/marketing` | Áreas / hub | Megáfono y piezas | `area-marketing.png` | Objeto 3D | 1/1 | Sí | Alta |
| `/` y `/ventas` | Áreas / hub | Caja registradora y etiquetas | `area-ventas.png` | Objeto 3D | 1/1 | Sí | Alta |
| `/` y `/clientes` | Áreas / hub | Burbujas de chat | `area-clientes.png` | Objeto 3D | 1/1 | Sí | Alta |
| `/` y `/analisis` | Áreas / hub | Gráficas y lupa | `area-analisis.png` | Objeto 3D | 1/1 | Sí | Alta |
| `/` y `/negocio` | Áreas / hub | Tablero de tareas y reloj | `area-negocio.png` | Objeto 3D | 1/1 | Sí | Alta |
| `/guias` | Cabecera | Composición de guías abiertas | `guias-cabecera.png` | Composición abstracta | 16/9 | Sí | Media |
| `/[cat]/guias/[slug]` | Guías relacionadas | Asistente asomando | `guia-relacionadas.png` | Silueta PNG | 4/3 | Sí | Media |
| `/sobre-nosotros` | Cabecera | Cuaderno y herramientas | `sobre-cabecera.png` | Ilustración editorial | 4/3 | Sí | Baja |
| `/contacto` | Cabecera | Sobre y avión de papel | `contacto-sobre.png` | Objeto 3D | 1/1 | Sí | Baja |
| legales | Cabecera | Escudo y documento | `legal-escudo.png` | Objeto 3D | 1/1 | Sí | Baja |
| 404 | Centro | Asistente perdido | `error-404.png` | Personaje | 1/1 | Sí | Baja |
| Todas las guías | Cabecera de guía | Ya declarada en cada `data.ts` (`hero.webp`) | (por guía) | — | 16/9 | No | Alta (ya inventariada) |

Las imágenes de cada guía (hero, explicativas y pruebas de prompts) **ya están inventariadas** en el manifiesto `images` de cada `data.ts` y en su README; no se duplican aquí.

## 7. Inventario de imágenes (para generar después)

**Estilo común a todas:** ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto ni logotipos, sin personas reales reconocibles. Paleta: menta `#15B38C`, cian `#3FB6D8`, violeta suave `#8B7CF6`, marfil `#F6F2E9` y tinta `#0E2A2E`. Iluminación de estudio suave desde arriba a la izquierda, sombras de contacto suaves y un reflejo de borde frío. Exportar PNG transparente de 2400 px en el lado mayor (se sirve con `next/image` y se comprime). Componer dejando aire en el lado donde irá el texto.

### imagen-01 · `home-hero.png`
- **Página / sección:** `/` · Hero (a la derecha del título, sobresaliendo por abajo).
- **Tipo:** ilustración 3D con objetos separables. **Ratio:** 4/5. **Fondo transparente:** sí.
- **Descripción:** un asistente de IA redondeado y amable (cuerpo de cápsula, dos ojos-pantalla, sin boca) sostiene una ficha de papel con casillas sin texto; a su alrededor flotan tres tarjetas translúcidas (una con líneas de texto, una con un gráfico de barras simple y una con un reloj) y una cinta de degradado menta→cian→violeta que las cruza en diagonal.
- **Composición:** el asistente ocupa el tercio inferior derecho; las tarjetas suben en arco hacia la izquierda; espacio libre a la izquierda y arriba. **Iluminación:** suave desde arriba-izquierda, resplandor menta tenue tras el personaje. **Estilo:** común. **Uso:** elemento principal de la portada; se superpone a la cinta del fondo.

### imagen-02 · `home-metodo.png`
- **Página / sección:** `/` · Método (franja oscura, columna derecha).
- **Tipo:** ilustración editorial isométrica. **Ratio:** 16/10. **Transparente:** sí.
- **Descripción:** una mesa de trabajo isométrica con cuatro estaciones unidas por una línea luminosa: una libreta abierta, una hoja con un prompt (líneas sin texto), una lupa sobre una lista y una casilla de verificación grande.
- **Composición:** recorrido en «S» de abajo-izquierda a arriba-derecha. **Fondo:** transparente (se ve el fondo oscuro). **Iluminación:** luz fría de borde y brillo menta en la línea. **Uso:** acompaña la línea de tiempo del método.

### imagen-03 · `home-criterio.png`
- **Página / sección:** `/` · Cierre («La IA ayuda, pero no decide por ti»).
- **Tipo:** silueta 3D. **Ratio:** 1/1. **Transparente:** sí.
- **Descripción:** una balanza clásica; en un plato, un cubo con un destello (la IA); en el otro, una mano abierta estilizada sin rasgos (la persona), en equilibrio.
- **Composición:** centrada con la base cortada por debajo para poder asomar bajo la sección. **Iluminación:** cenital suave. **Uso:** decorativa junto a los tres párrafos.

### imagen-04 a 08 · `area-marketing.png`, `area-ventas.png`, `area-clientes.png`, `area-analisis.png`, `area-negocio.png`
- **Página / sección:** `/` · Áreas (miniatura de fila) y `/[categoria]` · cabecera (grande, sobresaliendo).
- **Tipo:** objeto 3D. **Ratio:** 1/1. **Transparente:** sí.
- **Descripciones:** *marketing*: megáfono redondeado del que salen tres piezas planas (un cartel, un post cuadrado y una etiqueta) sin texto. *ventas*: caja registradora compacta con dos etiquetas de precio en blanco y una bolsa. *clientes*: dos burbujas de chat solapadas, una menta y otra marfil, con tres puntos en la más pequeña. *análisis*: un gráfico de barras y líneas sobre una base, con una lupa que amplía un punto. *negocio*: un tablero de tareas con tres columnas de tarjetas sin texto y un reloj de pared pequeño.
- **Composición:** el objeto principal centrado y ligeramente girado a 15°; una pieza secundaria a la derecha. **Iluminación:** estudio suave; cada área usa el mismo set de colores con un acento distinto (menta, cian, violeta, ámbar suave, verde azulado). **Uso:** identidad de cada área; los cinco deben leerse como una familia.

### imagen-09 · `guias-cabecera.png`
- **Página / sección:** `/guias` · cabecera (derecha).
- **Tipo:** composición abstracta 3D. **Ratio:** 16/9. **Transparente:** sí.
- **Descripción:** cinco libros/fichas de tamaños distintos, en abanico, cada uno con un lomo de un color del sistema, y una cinta de degradado que pasa por detrás. Sin texto.
- **Composición:** abanico hacia la derecha; el libro menta al frente. **Iluminación:** suave, con brillo en los cantos. **Uso:** refuerza la idea de biblioteca por áreas.

### imagen-10 · `guia-relacionadas.png`
- **Página / sección:** todas las guías · bloque «Guías relacionadas» (esquina inferior derecha).
- **Tipo:** silueta PNG de personaje. **Ratio:** 4/3. **Transparente:** sí.
- **Descripción:** el asistente de la portada asomando desde el borde inferior con una mano apoyada en el margen y señalando hacia la izquierda con una ficha.
- **Composición:** cortado por abajo (sólo mitad superior del cuerpo). **Iluminación:** igual que `home-hero`. **Uso:** decorativa; debe funcionar sobre fondo claro y oscuro.

### imagen-11 · `sobre-cabecera.png`
- **Página / sección:** `/sobre-nosotros` · cabecera. **Tipo:** ilustración editorial. **Ratio:** 4/3. **Transparente:** sí.
- **Descripción:** un cuaderno abierto con una casilla marcada, un lápiz, una lupa y una pequeña planta; sin texto. **Composición:** objetos en diagonal descendente. **Iluminación:** cálida y suave. **Uso:** acompaña el título.

### imagen-12 · `contacto-sobre.png`
- **Página / sección:** `/contacto` · cabecera. **Tipo:** objeto 3D. **Ratio:** 1/1. **Transparente:** sí.
- **Descripción:** un sobre marfil abierto del que sale un avión de papel menta con estela de degradado. **Composición:** el avión sale hacia arriba-derecha. **Uso:** elemento flotante junto al correo.

### imagen-13 · `legal-escudo.png`
- **Página / sección:** las tres páginas legales · cabecera (pequeña). **Tipo:** objeto 3D. **Ratio:** 1/1. **Transparente:** sí.
- **Descripción:** un escudo redondeado con una casilla de verificación en relieve, apoyado sobre una hoja. **Uso:** marca visual sobria de páginas de texto.

### imagen-14 · `error-404.png`
- **Página / sección:** 404 · centro. **Tipo:** personaje. **Ratio:** 1/1. **Transparente:** sí.
- **Descripción:** el asistente de la portada con una lupa, mirando un mapa doblado del que asoma una ficha en blanco. **Composición:** de tres cuartos, con un signo de interrogación pequeño sin texto (forma abstracta). **Uso:** acompaña el 404.

## 8. Estado de implementación
Hecho en el árbol de trabajo (sin commit): sistema global (`app/globals.css`), `components/visual/*`, `Navbar`, `Footer`, `GuideCard` (3 variantes), portada, biblioteca, hubs de área, cabecera y secciones de guía (numerales por contador CSS, índice numerado, progreso de lectura), `QuickFacts`, `FrameworkSection`, `CaseStudy`, `RelatedGuides`, `SectionHeading`, `LegalPage`, sobre nosotros, contacto, 404 y `loading`.

**Sin tocar a propósito** (funcionan con los tokens nuevos y no necesitaban rediseño propio): `PromptCard`/`PromptBuilder`, `ComparisonTable`, `Rubric`, `ResultBlock`, `StepSection`/`CheckableSteps`, `Callout`, `ProblemSection`, `DataPreparation` y el resto de `components/guide/`. Una segunda pasada podría darles composiciones propias.

**Imágenes (estado al 2026-09-20):**
- **Sitio:** las 14 imágenes de `public/images/site/` (PNG transparente, recortadas; `SiteImage` lee el tamaño real del archivo con `pngSize`) siguen colocadas.
- **Guías:** por decisión del autor, todas las imágenes de las páginas de guía quedan como **espacios con marcador** (nombre del archivo, proporción y descripción de lo que va ahí), también en producción. Las 126 generadas con IA y la `prueba-prompt-01` que ya había subido el autor se movieron a `Descargas/Promt IA/imagenes-guias-retiradas/<categoria>/<slug>/` (y siguen en el historial de git). Cada carpeta de guía conserva un `.gitkeep`.
- **Cómo se llenan:** soltar el archivo con el nombre exacto del marcador en `public/images/guias/<categoria>/<slug>/`; la imagen reemplaza al marcador sin tocar código. Para ocultar los marcadores que sigan vacíos: `NEXT_PUBLIC_HIDE_IMAGE_SLOTS=true`. Los logos de `public/images/guias/general/` no cuentan como imágenes de guía.
- **Consecuencias:** las tarjetas de guía (portada, áreas, relacionadas) vuelven a mostrarse sin imagen mientras no exista `hero.webp`; el sitemap no lista imágenes y `og:image` no aparece hasta que exista la portada; el validador avisa de cada imagen faltante.
- **Corrección de 15 esquemas** (celdas «resaltadas» que salieron como rectángulos negros) y la conversión a WebP quedaron documentadas en `PROMPTS-IMAGENES.md`/respaldo; los originales están en la carpeta de descarga de ChatGPT.
- **Tarjeta destacada (`GuideCard variant="feature"`):** la portada va enmarcada a plena opacidad; horizontal si el hueco es ancho (consulta de contenedor `@3xl`), vertical si es estrecho.
