# Sistema de guías

Cómo está construida una guía y cómo crear la siguiente. El estándar editorial está en [`GUIA-EDITORIAL.md`](GUIA-EDITORIAL.md); la guía [`marketing/crear-promociones-con-ia`](../content/guias/marketing/crear-promociones-con-ia/) es la referencia maestra.

## Separación de responsabilidades

```
CONTENIDO → MODELO DE DATOS → COMPONENTES EDITORIALES → LAYOUT → ESTILOS → PÁGINA
```

| Capa | Dónde | Qué hace |
|---|---|---|
| Contenido | `content/guias/<categoria>/<slug>/data.ts` y `guide.mdx` | Lo escrito por una persona. Nada de esto vive en componentes. |
| Modelo | `lib/guides/model.ts` | Tipos estrictos (`GuideData`, sin `any`). `defineGuide()` comprueba la forma. |
| Componentes | `components/guide/` | Genéricos: reciben datos, no tienen contenido propio. |
| Layout | `app/(site)/[categoria]/guias/[slug]/page.tsx` | Cabecera, índice (sticky en escritorio, desplegable en móvil), columna de lectura, relacionadas, anterior/siguiente. |
| Estilos | `app/globals.css` (tokens `--guide-*`) y `components/guide/ui.ts` | Color, medidas, movimiento; recetas de clases compartidas. |
| Lógica | `lib/guides/` | Registro, análisis del MDX, validación de reglas, imágenes, SEO. |

## Carpeta de una guía

```
content/guias/<categoria>/<slug>/
  data.ts      export default defineGuide({ metadata, hero, problem, … })
  guide.mdx    import data from "./data";  <GuideSection id="problema" title="…"> … </GuideSection>
  README.md    notas de mantenimiento

public/images/guias/<categoria>/<slug>/
  hero.webp  problema.webp  caso-practico.webp  datos-necesarios.webp
  paso-01.webp  paso-02.webp  paso-03.webp  primer-resultado.webp  analisis.webp
  iteracion.webp  resultado-final.webp  antes-despues.webp
  ejemplo-restaurante.webp  ejemplo-tienda.webp  ejemplo-servicio.webp  video-thumbnail.webp
```

## Modelo de contenido (`GuideData`)

Obligatorios: `metadata`, `hero`, `problem`, `outcome`, `caseStudy`, `before`, `dataPreparation`, `method`, `prompts`, `analysis`, `iteration`, `beforeAfter`, `mistakes`, `verification`, `conclusion`, `faq`.
Opcionales: `audience` (para quién es), `tools`, `firstResult`, `improvedResult`, `examples`, `comparisons`, `personalization`, `application`, `checklist`, `variations`, `limitations`, `sources` (fuentes con fecha de consulta), `evidence` (evidencia real aportada por una persona; solo se muestra si existe), `video`, `mediaPlan`.

- `mediaPlan` (interno, no se muestra): `longVideo { title, description, estimatedDuration, chapters[{ title, sourceSection }] }` y `shorts[{ title, hook, topic, sourceSection }]`. La guía es la fuente de los videos.
- `video`: `status: "upcoming"` muestra «VIDEO PRÓXIMAMENTE»; `status: "published"` exige un `youtubeId` **real**, `uploadDate` y miniatura (solo entonces se emite `VideoObject`). Nunca se inventa un id.

## Imágenes

**Guías nuevas: manifiesto `data.images`.** Cada guía declara un slot por imagen prevista con `guideSlots(categoria, slug)` → `slot("hero.webp", { section, ratio, purpose, alt, caption })`, y lo coloca en `guide.mdx` con `<GuideImage slot={data.images.clave} />` donde la imagen se necesita (el texto de esa sección debe entenderse sin ella). Reglas:

- **Hero siempre** (`hero.webp`, 16:9); el resto solo si la imagen ayuda a entender, decidir o ejecutar mejor que el texto (captura real de un paso, resultado real, antes/después, diagrama). Máximo una por sección; hero + 4 a 8 (hasta ~10 en tutoriales con interfaz).
- **`purpose`** dice qué debe mostrarse exactamente y por qué ayuda; es lo que ve el marcador de desarrollo.
- La persona que publica solo suelta el archivo con ese nombre en `public/images/guias/<categoria>/<slug>/` (WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni claves, legible en móvil).
- **Descripción del slot:** además de `purpose`, cada slot lleva `description` (2 a 4 frases: qué debe verse, qué resaltar, qué datos ficticios usar). Es lo que muestra el marcador; alguien que no conozca la guía debe poder producir la imagen leyéndola.
- **Marcadores:** solo en desarrollo o en una previsualización con `NEXT_PUBLIC_SHOW_IMAGE_SLOTS=true`; en producción nunca.
- **Cabecera:** con imagen hero, en escritorio va en dos columnas (texto + imagen); sin ella cae a una cabecera tipográfica limpia.
- **Build:** un aviso por cada imagen declarada que falte (el hero destacado como `HERO faltante`), sin romper el build; también avisa de más de una por sección, más de 8 extra o archivos de más de 200 KB.

Las guías anteriores usan `guideImages()` → `image("hero.webp", { alt, caption, aspectRatio, zoom, priority })` y siguen funcionando igual.

- **Una imagen que no existe no rompe la página:** en desarrollo se ve un marcador con el nombre del archivo, la proporción y lo que debe mostrar; en producción no se renderiza nada (sin hueco ni texto). Basta `hero.webp`, y ni siquiera es imprescindible.
- **Nunca se generan imágenes falsas.** El `alt` es obligatorio (lo exige el validador).
- `next/image` con `sizes`, carga perezosa salvo la hero (`priority`), `aspectRatio` fijo (sin saltos de layout) y ampliación opcional con `zoom` (`<dialog>` nativo).
- El validador avisa de las imágenes que faltan (`--strict-images` las convierte en error) y de archivos en la carpeta que la guía no usa.

## Componentes

| Grupo | Componentes |
|---|---|
| Estructura | `GuideHeader` (breadcrumb, H1, subtítulo, ficha, herramientas, accesos, hero), `GuideToc` (scroll spy), `GuideSection`, `GuideImage` (slot del manifiesto) |
| Problema y caso | `ProblemSection`, `OutcomeSection`, `CaseStudy` («CASO FICTICIO»), `BeforeSection`, `DataPreparation`, `ToolsSection` |
| Método | `StepSection` (línea de tiempo), `PromptBlock` (variables, «COPIAR PROMPT» con «Copiado ✓»), `PromptExplanation` |
| Resultados | `ResultBlock` («EJEMPLO GENERADO PARA ESTA GUÍA» / «DATOS DEL USUARIO»), `ResultAnalysis`, `IterationBlock`, `BeforeAfter` |
| Práctica | `ExamplesSection`, `ComparisonTable`, `ToolComparison`, `CommonMistakes`, `Personalization`, `HumanVerification`, `ApplicationSteps`, `InteractiveChecklist`, `Variations`, `Limitations`, `Conclusion`, `FAQ` |
| Confianza | `AudienceSection` (para quién es y para quién no), `SourcesSection` (fuentes con fecha real de consulta), `EvidenceBlock` (evidencia real; devuelve nada si no hay datos) |
| Otros | `VideoSection` (reproductor bajo demanda), `Callout`, `WarningBox`, `ImageBlock`, `RelatedGuides`, `GuideNeighbours`, `GuideCard`, `GuideAdSlot` (desactivado) |

Los componentes que necesitan JavaScript son cliente (`GuideToc`, `CopyButton`, `ChecklistBoard`, `ZoomableImage`, `YouTubeFacade`, `Rubric`, `PromptBuilder`); el resto, Server Components.

## Tipos de guía, glosario y módulos para principiantes

- **`metadata.tipoGuia`** (uno o más): `tutorial-herramienta`, `decision-comparacion`, `estrategia-planificacion`, `automatizacion-flujo`, `numeros-datos`, `comunicacion-atencion`, `tema-sensible`, `conceptual-educativa`, `creativa-visual`. El tipo decide qué secciones y módulos se añaden o se quitan: **dos guías de tipos distintos no deben tener el mismo esqueleto** (el validador avisa si dos guías publicadas tienen exactamente las mismas secciones).
- **Glosario compartido** (`content/glosario.ts`): cada término se define una vez, en lenguaje simple. En el texto se usa `<Term id="prompt">prompt</Term>`, se lista en `data.glossary` y se muestra con `<GlossarySection ids={data.glossary} />`. El validador comprueba que existan y estén listados.
- **Para quien casi no sabe de IA:** `QuickFacts` (ficha rápida: tiempo, qué necesitas, qué te llevas; el costo solo si se verificó con fecha), `FrameworkSection` (conceptos con «En palabras simples»), `Callout variant="simple"`, `PromptBuilder` (constructor de prompt en vivo, para prompts con 3 o más variables) y `Rubric` (autoevaluación con puntaje 0–2 por criterio). Todo ocurre en el navegador: no se guarda ni se envía nada.
- **Prompts:** normalmente 3 a 6 por guía, cada uno con una función distinta (entrevista, principal, evaluación, iteración, adaptación, verificación). El validador avisa si hay menos o más.

## Crear la siguiente guía

1. `npm run guia:nueva <slug>` (la categoría sale de `content/plan-guias.ts`). Crea `README.md`, `guide.mdx` y `data.ts` con `TODO`, y la carpeta de imágenes vacía. **No genera contenido.**
2. Rellena `data.ts` y `guide.mdx` tomando como modelo la guía piloto.
3. `npm run guias:validar` hasta que pase; `npm run guias:test` comprueba el propio validador.
4. Publica: `status: "published"` + `publishedAt` real.

### Cómo se entrega una guía nueva

Para cada guía solo hace falta esto:

```
RUTA:
marketing/guias/crear-anuncios-con-ia
CONTENIDO:
./contenido/crear-anuncios-con-ia.md
IMÁGENES:
./imagenes/crear-anuncios-con-ia/
VIDEO:
(opcional)
RECURSOS:
(opcional)
```

El contenido editorial se transforma en `data.ts` + `guide.mdx`; las imágenes se copian a `public/images/guias/<categoria>/<slug>/` con nombres semánticos; el video aporta su `youtubeId` real. Los recursos descargables aún no tienen un sistema propio: se decidirá cuando llegue el primero.

## Validador (`npm run guias:validar`)

**Errores** (paran el build en una guía publicada): slug, categoría, plan aprobado, título, descripción, autor, fechas reales, problema, secciones obligatorias y su orden, componente de cada sección, datos referenciados que no existen, hero, caso (ficticio/evidencia), datos, método, prompts (campos, variables documentadas), análisis, iteración, antes/después, verificación, conclusión, FAQ, video, `mediaPlan`, alt de las imágenes, ubicación de las imágenes, enlaces internos rotos, marcadores `TODO`, similitud entre guías.
**Avisos:** imágenes aún no subidas, archivos sin usar, variables documentadas pero sin usar, poco texto, posibles afirmaciones sin fuente, Shorts fuera de 3–8, video largo < 10 min.
**Borradores:** solo errores estructurales; lo pendiente se resume como aviso (`--verbose` lo detalla).

## SEO y accesibilidad

- Metadatos únicos, canonical, `robots: index`, Open Graph y Twitter; la imagen hero es la imagen para redes si existe. JSON-LD `Article` + `BreadcrumbList`; `VideoObject` solo con video real publicado.
- Un único H1, jerarquía H2 → H3, ancla por sección, `aria-current` en el índice, foco visible, casillas y botones reales, contadores con `aria-live`, tablas con `caption`/`scope`, `prefers-reduced-motion` respetado.

## Estándar v3 de guías (`estandarGuia: 3`)

- **Sin repeticiones:** lo que aparece en varios sitios (campos, criterios, umbrales, datos del caso) se define una vez como constante en `data.ts`. Sin `hero.tools`; los pasos del método son la checklist de proceso (`<StepSection checkable guide={…}/>`, con avance en `localStorage`); `application` explica qué hacer después.
- **Índice en partes:** `<GuideSection part="…">` (6 a 8 partes). `GuideToc` lista las partes y enlaza a su primera sección.
- **Prompts:** `<PromptCard>` muestra cada prompt una sola vez (constructor de variables, texto completo plegable, copiar) y, debajo, la «Prueba real» si existe `prueba-prompt-0N.webp` (slot con `promptId`). La fecha, el asistente y la nota salen solo de `evidence.pruebas`, que rellena únicamente el autor. `IterationBlock` no repite el prompt si se le omite `prompt`.
- **Rúbrica única:** `analysis.criteria[].criterionId` toma su nombre de `rubric.criteria` (`<ResultAnalysis data rubric/>`).
- **Activo original:** `metadata.activoOriginal`; las tablas con `copyable: true` muestran «Copiar como tabla» (TSV para hojas de cálculo).
- **Validación:** además de `npm run guias:validar` (TS, todas las guías, en el prebuild), `node scripts/validate-guides.mjs <ruta|slug>` aplica el contrato v3 a una guía (0 errores para poder cerrarla).
