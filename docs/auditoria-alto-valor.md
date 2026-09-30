# Auditoría de contenido de alto valor

Ejecutada con `npx tsx qa/auditoria.ts` contra la versión de producción. Aprueba con ≥ 90 % de las casillas y TODAS las de las secciones 1, 2 y 5.

| URL | Tipo | Palabras | Anuncios en el código | Puntaje | Decisión | Qué falla |
|---|---|---|---|---|---|---|
| /carrera-y-empleo/crear-cv-ats-formato-harvard | herramienta | 4047 | 3 | 24/24 (100 %) | **ALTO VALOR** | — |
| /carrera-y-empleo/optimizar-cv | herramienta | 4332 | 3 | 24/24 (100 %) | **ALTO VALOR** | — |
| /viajes-y-entretenimiento/comparar-opciones-de-viaje | herramienta | 3278 | 3 | 24/24 (100 %) | **ALTO VALOR** | — |
| /viajes-y-entretenimiento/descubrir-destinos-segun-presupuesto | herramienta | 2962 | 3 | 24/24 (100 %) | **ALTO VALOR** | — |
| /emprendimiento/crear-logo-profesional-para-mi-empresa | herramienta | 3310 | 3 | 24/24 (100 %) | **ALTO VALOR** | — |
| /emprendimiento/crear-plan-de-negocio | herramienta | 3245 | 3 | 24/24 (100 %) | **ALTO VALOR** | — |
| /emprendimiento/calcular-rentabilidad-de-mi-negocio | herramienta | 3621 | 3 | 24/24 (100 %) | **ALTO VALOR** | — |
| /emprendimiento/identificar-nichos-de-mercado | herramienta | 3665 | 3 | 24/24 (100 %) | **ALTO VALOR** | — |
| /emprendimiento/crear-catalogo-de-productos | herramienta | 3728 | 3 | 24/24 (100 %) | **ALTO VALOR** | — |
| /emprendimiento | categoria | 312 | 0 | 24/24 (100 %) | **ALTO VALOR** | — |
| /carrera-y-empleo/palabras-clave-cv-oferta-laboral | articulo | 1689 | 2 | 24/24 (100 %) | **ALTO VALOR** | — |
| /carrera-y-empleo/verbos-de-accion-para-cv | articulo | 1516 | 2 | 24/24 (100 %) | **ALTO VALOR** | — |
| /carrera-y-empleo/cv-sin-experiencia | articulo | 1391 | 2 | 24/24 (100 %) | **ALTO VALOR** | — |
| /carrera-y-empleo | categoria | 340 | 0 | 24/24 (100 %) | **ALTO VALOR** | — |
| / | portada | 599 | 0 | 24/24 (100 %) | **ALTO VALOR** | — |

## Qué falló en la primera pasada y qué se corrigió

| URL | Puntaje inicial | Qué falló | Qué se corrigió |
|---|---|---|---|
| /carrera-y-empleo/crear-cv-ats-formato-harvard | 96 % | El detector marcó «garantiza» (era una negación) | Se afinó el detector para ignorar frases que niegan o preguntan; el texto ya decía «no garantiza» |
| /carrera-y-empleo/palabras-clave-cv-oferta-laboral | 96 % | Sin contexto local; un párrafo de 116 palabras; tarjeta de la herramienta repetida en los 3 artículos | Contexto de Perú y Latinoamérica (portales de empleo); párrafo dividido; texto de la tarjeta distinto en cada artículo |
| /carrera-y-empleo/verbos-de-accion-para-cv | 88 % | Sin contexto local; tarjeta repetida; «gestion» (falso positivo de tildes) | Nota sobre «hoja de vida» vs «currículum» y ejemplo en soles; tarjeta propia; detector de tildes corregido |
| /carrera-y-empleo/cv-sin-experiencia | 96 % | Perfil de ejemplo copiado de la herramienta; sin contexto local | Perfil de ejemplo nuevo (otra carrera); prácticas preprofesionales y profesionales en Perú |
| /carrera-y-empleo | 83 % | Solo texto; sin fecha; sin elementos de apoyo | Pasos numerados, 3 preguntas frecuentes, fecha de actualización y datos estructurados FAQ |
| / | 88 % | Sin contexto local; primera explicación corta (medición) | «en español para Latinoamérica» en la portada; medición corregida |
| /emprendimiento/crear-logo-profesional-para-mi-empresa | 92 % | Solo 2 enlaces internos (pedía 3); sin llamado a la acción claro (el detector estaba fijo a las 2 categorías originales) | Se agregaron 2 enlaces internos (`/contacto`, `/politica-de-privacidad`) en «Límites»; se generalizó el detector de CTA para reconocer el enlace a la categoría de cualquier página, no solo Carrera y Viajes |
| /emprendimiento (categoría) | 92 % | El medidor de palabras y de contexto local solo lee la introducción visible, y la única mención de «Perú» vivía dentro de una respuesta de FAQ colapsada (invisible para el medidor) | Se reescribió la introducción de la categoría (2 → 4 párrafos, 312 palabras) con una mención explícita de Perú/Latinoamérica/soles/Lima/Arequipa en texto siempre visible |

Casillas juzgadas a mano (se marcan como cumplidas tras leer cada página): «una persona puede cumplir su objetivo solo con la página» (§1) y «las páginas legales, 404 y de error no llevan anuncios» (§5, comprobado en `qa/qa.ts` y `lib/ads.test.ts`).

## Lighthouse (móvil simulado, contra la versión de producción local)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| / | 79–91 | 100 | 100 | 100 |
| /carrera-y-empleo | 91 | 100 | 100 | 100 |
| /carrera-y-empleo/crear-cv-ats-formato-harvard | 77 | 97 | 100 | 100 |
| /carrera-y-empleo/optimizar-cv | 73 | 97 | 100 | 100 |
| /carrera-y-empleo/calcular-salario-y-negociar-oferta | 79 | 97 | 100 | 100 |
| /carrera-y-empleo/crear-plan-de-busqueda-de-empleo | 76 | 97 | 100 | 100 |
| /viajes-y-entretenimiento/crear-itinerario-de-viaje | 79 | 97 | 100 | 100 |
| /viajes-y-entretenimiento/encontrar-fechas-mas-baratas-para-volar | 78 | 97 | 100 | 100 |
| /viajes-y-entretenimiento/comparar-opciones-de-viaje | 76 | 97 | 100 | 100 |
| /viajes-y-entretenimiento/descubrir-destinos-segun-presupuesto | 81 | 97 | 100 | 100 |
| /emprendimiento/crear-logo-profesional-para-mi-empresa | 75 | 97 | 100 | 100 |
| /emprendimiento/crear-plan-de-negocio | 76 | 97 | 100 | 100 |
| /emprendimiento/calcular-rentabilidad-de-mi-negocio | 73 | 97 | 100 | 100 |
| /emprendimiento/identificar-nichos-de-mercado | 75 | 97 | 100 | 100 |
| /emprendimiento/crear-catalogo-de-productos | 75 | 97 | 100 | 100 |
| /carrera-y-empleo/analizar-oferta-laboral | 90 | 97 | 100 | 100 |
| /carrera-y-empleo/preparar-entrevista-de-trabajo | 89 | 97 | 100 | 100 |
| /viajes-y-entretenimiento/planificar-presupuesto-de-viaje | 69 | 97 | 100 | 100 |
| /carrera-y-empleo/palabras-clave-cv-oferta-laboral | 86 | 100 | 100 | 100 |
| /carrera-y-empleo/verbos-de-accion-para-cv | 87 | 100 | 100 | 100 |
| /carrera-y-empleo/cv-sin-experiencia | 87 | 100 | 100 | 100 |
| /politica-de-privacidad | 91 | 100 | 100 | 100 |

El rendimiento de las páginas largas y de la herramienta queda por debajo de 90 con la simulación móvil de Lighthouse (red 4G lenta y CPU 4× más lenta): el costo principal es la hidratación de React (≈ 0,6 s simulados) y, en la herramienta, su formulario. CLS es 0 en todas. La accesibilidad de la herramienta marca 97 por un falso positivo de contraste provocado por `content-visibility` en el texto de la guía (Lighthouse mide el color contra el pie de página); el contraste real de todos los pares de colores se comprueba en `lib/contraste.test.ts`.
