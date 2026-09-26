# Guía Prompts IA

Biblioteca **gratuita** de prompts en español para ChatGPT, Gemini y Claude. Next.js 16 (App Router), TypeScript y Tailwind CSS v4, sin backend ni base de datos: lo que la persona escribe en los formularios se queda en su navegador.

Se construye **una categoría y una herramienta a la vez**: primero se termina y se aprueba una, y solo entonces se agrega la siguiente.

## Estado

- Categoría abierta: **Carrera y empleo** (`/carrera-y-empleo`).
- Herramienta: **Crear un CV en formato Harvard que pase filtros ATS** (`/carrera-y-empleo/crear-cv-ats-formato-harvard`): datos → prompt en vivo → respuesta de la IA → vista previa A4 → descarga en Word (.docx). Trae 4 perfiles de ejemplo.
- Artículos de apoyo: palabras clave de una oferta, verbos de acción y CV sin experiencia.
- Auditoría de contenido: [`docs/auditoria-alto-valor.md`](docs/auditoria-alto-valor.md). Lo que debes hacer tú antes de pedir la revisión de AdSense: [`docs/checklist-adsense.md`](docs/checklist-adsense.md).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (los anuncios se ven como recuadros grises) |
| `npm run build` · `npm start` | Compila y sirve la versión de producción |
| `npm run lint` · `npm run typecheck` | ESLint y TypeScript |
| `npm test` | Pruebas de `lib/**`: prompt, normalizador y lector de la respuesta de la IA, Word, ejemplos, contraste de colores, anuncios, consentimiento, textos legales y registros |
| `npm run qa -- http://localhost:3100` | Pruebas de navegador (Playwright + Chrome) contra un servidor en marcha; `--capturas carpeta` guarda imágenes |
| `npm run auditoria -- http://localhost:3100` | Auditoría «contenido de alto valor» de cada página indexable |

## Estructura

```
app/(site)/page.tsx                    Portada
app/(site)/[categoria]/page.tsx        Categoría (solo las abiertas)
app/(site)/[categoria]/[slug]/page.tsx Herramienta o artículo (los del registro)
app/(site)/…                           Sobre nosotros, contacto, privacidad, cookies, términos
app/globals.css                        Sistema de diseño (tokens claro/oscuro, botones, campos, tarjetas)
content/categorias.ts                  Las 8 categorías (`disponible: true` abre una)
content/prompts/index.ts               Registro de herramientas
content/articulos/index.ts             Registro de artículos (el texto está en components/articulos/cuerpos.tsx)
content/ejemplos/cv-harvard.ts         4 perfiles de ejemplo (datos + oferta + respuesta de IA de ejemplo)
lib/cv/                                Lógica del generador: tipos, prompt, normalizador, lector, Word
components/prompts/cv/                 Generador: pasos, formulario, prompt, Word, ejemplos
components/ads/ · lib/ads-config.ts    AdSlot, Anuncio y configuración de AdSense (variables de entorno)
components/consent/                    Aviso de cookies y Google Consent Mode v2
qa/                                    QA de navegador, auditoría de contenido y capturas
```

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` (o `NEXT_PUBLIC_ADSENSE_CLIENT`) | ID de editor `ca-pub-XXXXXXXXXXXXXXXX`. Sin él no se carga nada de AdSense |
| `NEXT_PUBLIC_ADSENSE_SLOT_INTRO` · `_MEDIO` · `_FINAL` | ID de cada bloque de anuncios (después de la introducción, a mitad y antes de las preguntas frecuentes) |

`/ads.txt` lo genera `app/ads.txt/route.ts` con el mismo ID de editor.

## Reglas del sitio

Todo es gratis y sin registro; nunca se inventan datos, cifras ni testimonios; los ejemplos ficticios se marcan como tales; ninguna página promete resultados (por ejemplo, una entrevista); las fuentes se enlazan con su fecha de consulta; los anuncios nunca van junto a los botones de la herramienta ni en páginas legales, de error o vacías.
