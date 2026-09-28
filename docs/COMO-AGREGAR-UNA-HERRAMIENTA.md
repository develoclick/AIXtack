# Cómo agregar una herramienta (para personas y para cualquier IA que genere una página)

Todo el sitio (menú, pie, portada, hubs de categoría, sitemap, buscador y enlaces «relacionados») se dibuja desde **un solo catálogo**: `content/catalogo/`. Las 6 categorías y las 34 herramientas ya están cargadas. Publicar una herramienta es crear su página y cambiar su estado; **no se edita nada más a mano**.

## Antes de crear una página

1. **Busca la herramienta** en `content/catalogo/herramientas.ts`. Si la ruta de trabajo empieza por `empleabilidad-y-trabajo/…`, su categoría es **`carrera-y-empleo`** y la URL pública es `/carrera-y-empleo/…` (el alias está en `ALIAS_DE_CATEGORIA`).
2. **La categoría ya existe.** No crees otro hub. No edites a mano el menú (`lib/nav-config.ts`), el pie, la portada ni `app/sitemap.ts`: leen del catálogo.
3. **Crea la página** de la herramienta. Dos formas:
   - **Carpeta propia (recomendada):** `app/(site)/{categoria}/{slug}/page.tsx`. Debe empezar con `exigirPublicada(...)` y terminar mostrando `<HerramientasRelacionadas .../>` (ver la plantilla de abajo). Un test (`lib/catalogo.test.ts`) falla si falta alguna de las dos cosas.
   - **Ruta dinámica** (solo `tipo: "cv-ats"`): la dibuja `app/(site)/[categoria]/[slug]/page.tsx`.
4. **Al terminar, publícala** en `content/catalogo/herramientas.ts`:
   - `estado: "publicada"`
   - `fechaPublicacion` y `fechaActualizacion` (AAAA-MM-DD, fechas reales)
   - `pagina: { h1, tituloCorto, metaTitulo (≤ 60), descripcion (≤ 155), resumen?, queObtienes?, tipo: "pagina-propia", tiempo, tiempoLectura, secciones[] }`
5. Si la herramienta **no está** en el registro, añádela con todos sus campos (`slug`, `categoria`, `titulo`, `descripcionCorta`, `estado`, `lote`, `relacionadas`).

## Qué pasa solo al publicar

Si era **la primera** herramienta publicada de su categoría, la categoría se **activa sola**:

| Sitio | Antes (categoría sin herramientas publicadas) | Después |
|---|---|---|
| URL `/{categoria}` | 404 | 200 (hub completo) |
| Menú y pie | no aparece | aparece, en su orden |
| Portada | no aparece | bloque con sus herramientas |
| `sitemap.xml` | no aparece | categoría + herramienta |
| Buscador | no aparece | herramienta y artículos publicados |
| Enlaces «relacionadas» | las pendientes no se muestran | se muestran las publicadas |
| Artículos de la categoría | ocultos (aunque estén «publicada») | visibles |

Con `estado: "pendiente"`, la URL de la herramienta responde **404** (aunque exista la carpeta con `exigirPublicada`), y ninguna página la enlaza.

## Plantilla de una página con carpeta propia

```tsx
// app/(site)/finanzas-y-economia/calcular-interes-compuesto/page.tsx
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";

const CATEGORIA = "finanzas-y-economia";
const SLUG = "calcular-interes-compuesto";

export const generateMetadata = () => metadataDeHerramienta(CATEGORIA, SLUG);

export default function Page() {
  const h = exigirPublicada(CATEGORIA, SLUG); // 404 mientras esté «pendiente»
  return (
    <>
      <h1>{h.pagina.h1}</h1>
      {/* … la herramienta y su guía (1.200+ palabras, ejemplos, FAQ, fuentes con fecha) … */}
      <HerramientasRelacionadas categoria={CATEGORIA} slug={SLUG} />
    </>
  );
}
```

Además: JSON-LD (`WebApplication`, `HowTo` si son pasos, `FAQPage`, `BreadcrumbList`, `Article`), un solo H1, breadcrumbs, autor y fechas, y anuncios solo con `<Anuncio posicion="…" />` (nunca junto a botones ni campos). Categoría de **Finanzas**: fórmulas visibles, tono prudente y aviso «no es asesoría financiera».

## Reglas del catálogo

- Una categoría está **activa** si y solo si tiene al menos una herramienta `publicada`. Todo son funciones derivadas (`categoriasActivas()`, `herramientasPublicadas()`, `relacionadasPublicadas()`…); no hay listas escritas a mano.
- Un artículo solo es visible si está `publicada` **y** su categoría está activa.
- **«Carrera y empleo»** ya estaba publicada: su URL, título, meta y textos están protegidos por un test (`lib/catalogo.test.ts`). Si quieres cambiarlos, cambia también el test a propósito.
- El hub muestra «Próximamente» solo si la categoría lo activa (`contenido.mostrarProximamente: true`; apagado por defecto porque una lista de páginas que no existen se lee como contenido escaso).
- Las 5 categorías nuevas tienen su hub escrito (700+ palabras, guía de 3–4 secciones, FAQ y tabla «¿Qué herramienta necesito?», que aparece cuando hay 2 o más herramientas publicadas). Al publicar, revisa que el texto siga siendo verdad para la herramienta real.
- Al terminar: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run qa` y `npm run auditoria`.
