# Guía Prompts IA

Biblioteca **gratuita** de prompts en español para ChatGPT, Gemini y Claude. Sitio en Next.js 16 (App Router), TypeScript y Tailwind CSS v4, sin backend ni base de datos: lo que la persona escribe en los formularios se queda en su navegador.

Rediseño desde cero (septiembre de 2026). Se construye **una categoría y un prompt a la vez**: primero se termina y se aprueba uno, y solo entonces se agrega el siguiente.

## Estado

- Categoría abierta: **Carrera y empleo** (`/carrera-y-empleo`).
- Primera ruta: **Crear un CV en formato Harvard que pase filtros ATS** (`/carrera-y-empleo/crear-cv-ats-formato-harvard`): formulario → prompt que se arma en vivo → respuesta de la IA → vista previa → descarga en Word (.docx).
- Las otras 7 categorías se muestran en la portada como «Próximamente», sin enlace.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Compila y sirve la versión de producción |
| `npm run lint` · `npm run typecheck` | ESLint y TypeScript |
| `npm test` | Pruebas de `lib/**` (prompt, lector de la respuesta de la IA, Word, legal, registros) |
| `npm run qa -- http://localhost:3100` | Pruebas de navegador (Playwright + Chrome) contra un servidor en marcha; `--capturas carpeta` guarda imágenes |

## Estructura

```
app/(site)/page.tsx                    Portada
app/(site)/[categoria]/page.tsx        Página de categoría (solo las abiertas)
app/(site)/[categoria]/[slug]/page.tsx Página de cada prompt (los del registro)
app/(site)/…                           Sobre nosotros, contacto, privacidad, cookies, términos
content/categorias.ts                  Las 8 categorías y sus subcategorías (`disponible`)
content/prompts/index.ts               Registro de prompts (una entrada = una ruta)
content/prompts/cv-ejemplo.ts          Ejemplo ficticio de hoja de vida
lib/cv/                                Lógica del generador: tipos, prompt, lector, Word
components/prompts/cv/                 Formulario, panel del prompt, conversión a Word
proxy.ts                               410 para URLs de la versión anterior
```

## Cómo agregar una categoría o un prompt

1. Categoría: pon `disponible: true` en `content/categorias.ts` (entra en la portada, el sitemap y `/{slug}`).
2. Prompt: agrega una entrada en `content/prompts/index.ts` y su componente de página; `generateStaticParams` lo publica solo.

## Reglas del sitio

Todo es gratis y sin registro; nunca se inventan datos, cifras ni testimonios; los ejemplos ficticios se marcan como tales; ninguna página promete resultados (por ejemplo, una entrevista); las fuentes se enlazan con su fecha de consulta.
