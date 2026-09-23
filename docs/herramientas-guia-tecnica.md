# Herramientas: guía técnica (Fase 1)

Cómo funciona la infraestructura del modelo «Herramienta + guía corta» y cómo añadir una página.

## Añadir una página
1. Crea `content/herramientas/{area}/{slug}.ts` con `export default defineHerramienta({...})` (esquema en `lib/herramientas/tipos.ts`). El nombre del archivo es el slug; el área es la carpeta (`marketing`, `ventas`, `clientes`, `analisis`, `negocio`).
2. Déjala con `publicado: false`. Lo que falte (prueba real, capturas, fecha) queda como `null`/vacío con un comentario `// TODO:` **en el archivo de datos**, nunca en la página.
3. Las imágenes van en `public/img/{area}/{slug}/…` y se declaran en `ejemplo.capturas` (con su etiqueta: «Prueba real», «Ilustración» o «Simulación») y `meta.ogImage`.
4. Comprueba: `npm run herramientas:validar`, `npm test`, `npm run build`.
5. Solo pasa a `publicado: true` cuando el validador da 0 errores: exige 1.500–2.500 palabras, descripción de 140–160 caracteres, prueba real (`probadoEn` y `probadoFecha`), 1–2 capturas con archivo existente, 3–4 mejoras/ideas/errores, 4–6 preguntas, 2–3 relacionadas publicadas, sin TODO ni promesas absolutas.

`publicado: false` = noindex, fuera del sitemap, de `/herramientas`, de las páginas de área y de «relacionadas» (todo eso pasa por `listarPublicadas()` en `lib/herramientas/registro.ts`; una prueba lo comprueba). Los archivos que empiezan por `_` son páginas internas: solo existen con `next dev` (ver `content/herramientas/negocio/_prueba-plantilla.ts`, en `/negocio/prueba-plantilla`).

## El prompt
`construirPrompt(perfil, campos, calculos, tarea, { usaPerfil })` (`lib/prompts/construir-prompt.ts`) arma: reglas comunes (`reglas-comunes.ts`) → datos del negocio (solo lo que la página declara en `usaPerfil` y tiene texto) → datos de la tarea → cálculos ya hechos → tarea (`tarea` del archivo de datos) → cierre común (`cierre-comun.ts`).
- En `tarea` puedes citar campos con `{{id}}`. El prompt final **nunca** muestra llaves: un campo requerido vacío queda `[FALTA: etiqueta]`, uno opcional «no indicado», y en las líneas de datos los opcionales vacíos se omiten.
- Escribe la tarea sin punto final pegado a un `{{id}}` (el valor puede traer el suyo).

## Calculadoras
Las fórmulas viven en el archivo de datos como texto y las evalúa `lib/herramientas/expresiones.ts` (sin `eval`). Se pueden usar los ids de las entradas y de las salidas anteriores, `+ - * /`, comparaciones, `&& || !` y `min`, `max`, `abs`, `round(x; n)`, `techo`, `piso`, `si(cond; a; b)`. Un porcentaje se escribe como 20 y llega a la fórmula como 0.2. Un dato no válido o una división entre cero dan «—» y `[FALTA]` en el prompt; nunca una cifra inventada.
Cada calculadora declara `casosDePrueba` (mínimo 3); `npm test` y el validador los ejecutan. Fija la base de cada porcentaje (margen sobre precio o recargo sobre costo) antes de escribir la fórmula.

## Perfil «Mi negocio»
`lib/herramientas/perfil.ts`: 11 campos, `localStorage` siempre en `try/catch` (sin almacenamiento funciona en memoria), borrado y el texto «Tus datos se guardan solo en este navegador. No los recibimos ni los almacenamos.». `/mi-negocio` es noindex y no está en el sitemap.

## Publicidad
`EspacioAnuncio` es un contenedor vacío, sin código de AdSense. Solo `PaginaHerramienta` lo coloca: después del bloque 6 y del bloque 10. `contenido.test.ts` falla si aparece en otro sitio o dentro de la herramienta.

## Accesibilidad
Los componentes de `components/herramientas/` usan `estilos.ts` (texto en tinta, no en el verde de marca, que da 2,2–2,6:1 en modo claro) y `border-foreground/50` en controles. El anillo de foco dentro de `.herramienta-scope` usa la tinta. Medido en la plantilla: texto ≥ 4,8:1 y bordes/foco ≥ 3,7:1 en claro y oscuro.

## Comandos
- `npm test` — pruebas unitarias (`node:test` con `tsx`): expresiones, calculadoras, prompt, perfil, contenido y publicidad.
- `npm run herramientas:validar` — valida todas las páginas de `content/herramientas/` (se ejecuta también en `prebuild`).
- `npm run typecheck`, `npm run lint`, `npm run build`.
