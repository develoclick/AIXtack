# Guía Prompts IA

Biblioteca práctica de **inteligencia artificial para microempresas y emprendedores**: guías paso a paso para resolver con IA tareas reales de un pequeño negocio (anuncios, promociones, clientes, precios, análisis, organización).

No es un directorio de herramientas, ni un portal de noticias, ni una colección de prompts sueltos. Cada guía parte de un problema real y lleva al lector hasta un resultado que puede aplicar: qué información reunir, el prompt explicado, el antes y el después, cómo mejorar el resultado y qué revisar antes de usarlo.

Sitio estático (sin backend ni base de datos): Next.js 16 (App Router), TypeScript, Tailwind CSS v4 y MDX.

## Empezar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). En desarrollo se ven también los **borradores**; en producción solo las guías con `status: "published"`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (muestra borradores) |
| `npm run build` | Valida las guías (`prebuild`) y compila. Falla si una guía publicada no cumple los requisitos |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run guias:validar` | Validador de calidad de las guías (`--verbose` muestra el detalle de los borradores) |
| `npm run guias:test` | Pruebas del validador (fixtures sintéticos en un directorio temporal) |
| `npm run guia:nueva <slug>` | Crea la **estructura técnica** de una guía nueva del plan (borrador con TODO en `content/guias/<categoria>/<slug>/` + carpeta de imágenes). No genera contenido |

## Estructura

```
app/(site)/
  page.tsx                          Home
  guias/page.tsx                    Biblioteca de todas las guías, agrupadas por categoría
  [categoria]/page.tsx              Hubs: /marketing /ventas /clientes /analisis /negocio
  [categoria]/guias/[slug]/page.tsx Cada guía (la categoría forma parte de la URL)
  sobre-nosotros, contacto, politica-de-privacidad, politica-de-cookies, terminos-y-condiciones

content/
  guias/<categoria>/<slug>/         Una guía = una carpeta: data.ts (contenido tipado),
                                    guide.mdx (orden de secciones y prosa) y README.md
  plan-guias.ts                     Las 20 guías aprobadas y su hoja de ruta
  categorias.ts                     Las 5 categorías y la introducción editorial de cada hub
  autores.ts                        Registro de autoría (solo entidades reales)
  redirects.ts                      301 decididas URL por URL (con el motivo de cada una)

public/images/guias/<categoria>/<slug>/   Imágenes de cada guía (nombres semánticos, opcionales)

components/guide/                   Sistema de componentes editoriales (genéricos, sin contenido)
lib/guides/                         Modelo de datos, registro, análisis de MDX, imágenes, constantes
scripts/                            Validador, pruebas del validador y comando `guia:nueva`
proxy.ts                            410 (Gone) para las URLs del modelo anterior
docs/GUIA-EDITORIAL.md              Estándar editorial y checklist para cada guía nueva
docs/SISTEMA-DE-GUIAS.md            Arquitectura del sistema de guías y cómo crear la siguiente
```

La guía piloto [`marketing/crear-promociones-con-ia`](content/guias/marketing/crear-promociones-con-ia/) es la referencia maestra del sistema.

## Cómo se añade una guía

1. Responde las preguntas de [`docs/GUIA-EDITORIAL.md`](docs/GUIA-EDITORIAL.md). Si no hay un problema real y distinto de las guías existentes, **amplía una guía existente** en vez de crear una URL.
2. `npm run guia:nueva <slug>` crea la carpeta `content/guias/<categoria>/<slug>/` como borrador (la categoría sale del plan aprobado).
3. Escribe la guía en `data.ts` y `guide.mdx` (caso, método, prompts, análisis, iteración, antes/después, verificación, FAQ…), usando la guía piloto como modelo. No debe quedar ningún `TODO`.
4. `npm run guias:validar` hasta que pase.
5. Publica: `status: "published"`, `publishedAt` con la fecha **real** de publicación y `updatedAt` real.

El sitemap, la navegación de los hubs, la biblioteca, las guías relacionadas, los breadcrumbs, el canonical y el JSON-LD salen del propio archivo: no hay que tocar nada más. Las fechas son siempre reales: no se modifican para simular actividad.

## Publicidad

El sitio no muestra anuncios. La infraestructura de AdSense está latente (`components/ads/`, `/ads.txt`) y solo carga el script con consentimiento del visitante.
