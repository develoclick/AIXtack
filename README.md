# AIXtack

Plataforma de Inteligencia Artificial en español: herramientas, prompts, comparativas, tutoriales, guías y noticias.

Sitio **100% frontend y estático**: Next.js 16 (App Router), TypeScript, Tailwind CSS y shadcn/ui. Todo el contenido vive en archivos JSON locales bajo [`content/`](content) — sin base de datos, sin backend, sin panel de administración. Añadir contenido nuevo es editar un JSON y desplegar.

## Empezar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

No hace falta configurar ninguna base de datos ni variable de entorno para desarrollar en local — el contenido se lee directamente de `content/*.json` en cada build.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción (SSG completo) |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |

## Estructura del proyecto

```
app/                    Rutas (App Router)
  (site)/               Todas las páginas públicas (home, herramientas, prompts, blog...)
  go/[slug]/            Redirect cloaking de afiliados (lookup estático, sin DB)
  feed.xml/             Feed RSS
  sitemap.ts, robots.ts Sitemap y robots.txt generados desde el contenido

components/             Componentes de UI, organizados por dominio
  ui/                   Primitivos shadcn/ui
  layout/, home/, content/, tools/, prompts/, ads/, affiliate/, ...

content/                Contenido del sitio (JSON): categorías, herramientas, prompts,
                        publicaciones, etiquetas, FAQ, autores, redirecciones.
                        Añadir/editar contenido = editar estos archivos.

lib/
  content/              Capa de acceso a datos: lee content/*.json y expone funciones
                         (listPublishedTools, getPostBySlug, etc.) que consumen las páginas.
  forms/                Envío de contacto/newsletter (sin backend propio — ver más abajo)
  seo/                  Metadata dinámica y JSON-LD (Schema.org)
  types.ts              Tipos compartidos por content/ y los componentes
  utils/

providers/              Contextos de React (tema, consentimiento de cookies)
scripts/                Utilidades de mantenimiento (regenerar imágenes OG)
```

## Contenido

Cada archivo en `content/*.json` es un array de objetos planos. Para añadir una herramienta,
prompt o publicación nueva, añade una entrada al JSON correspondiente siguiendo la forma de
las existentes y vuelve a desplegar — no hace falta tocar código.

## Formularios (contacto / newsletter)

Sin backend propio: si configuras `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` o
`NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT` (un formulario externo tipo Formspree o Web3Forms),
el envío se reenvía ahí. Sin configurar, el formulario informa de que no está activo y
sugiere el email de contacto directo. Ver [.env.example](.env.example).

## Producción / Despliegue

Proyecto listo para Vercel: `vercel deploy` (o conectar el repositorio) sin ninguna
configuración adicional. Antes de la primera build en producción:

- Configura `NEXT_PUBLIC_SITE_URL` con el dominio real.
- Configura `NEXT_PUBLIC_ADSENSE_CLIENT_ID` cuando tengas la cuenta de AdSense aprobada.
- (Opcional) Configura los endpoints de formularios si quieres contacto/newsletter activos.
