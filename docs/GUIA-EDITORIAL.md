# Guía editorial

Estándar que debe cumplir **cada** guía antes de publicarse. El validador (`npm run guias:validar`, que también se ejecuta antes de cada build) comprueba lo mecánico; lo demás depende de quien escribe y de quien revisa. Cómo está construido el sistema (datos, componentes, imágenes) está en [`SISTEMA-DE-GUIAS.md`](SISTEMA-DE-GUIAS.md).

**Principio:** 20 páginas excelentes valen más que 500 superficiales. Una página nueva solo se crea cuando añade conocimiento real. La guía piloto [`marketing/crear-promociones-con-ia`](../content/guias/marketing/crear-promociones-con-ia/) es la **referencia maestra**: cada guía nueva se compara con ella.

## 1. ¿Hace falta una guía nueva?

Antes de ejecutar `npm run guia:nueva`, responde por escrito (queda resumido en `metadata.whyThisPage`):

1. ¿Qué problema concreto del emprendedor resuelve?
2. ¿Qué tarea cotidiana facilita?
3. ¿Qué información nueva aporta?
4. ¿Es suficientemente diferente de las guías existentes?
5. ¿Puede integrarse mejor dentro de una guía existente?
6. ¿Qué prompts nuevos aporta?
7. ¿Qué ejemplos prácticos puede incluir?
8. ¿Qué conocimiento adicional ofrece?
9. ¿Qué usuario se beneficia?
10. ¿Merece realmente una URL independiente?

```
¿Existe un problema empresarial real?
        ↓
¿Es suficientemente diferente de una guía existente?
        ↓
¿Aporta conocimiento nuevo?
        ↓
¿Tiene suficiente profundidad?
        ↓
¿Merece una URL independiente?
```

Si alguna respuesta no es un sí claro: **no se crea la URL**; se amplía una guía existente y se actualiza su `updatedAt`.

**Prohibido:** páginas por profesión, ciudad, herramienta, keyword o sinónimo; «X prompts para…»; «mejores herramientas…»; comparativas de productos; noticias; tutoriales de herramientas. El slug describe el problema o la tarea (`/ventas/guias/crear-cotizaciones-y-propuestas-con-ia`), nunca una keyword suelta.

El conjunto aprobado son las **20 guías** de `content/plan-guias.ts`. `npm run guia:nueva` solo crea guías de ese plan; ampliar el plan requiere aprobación.

## 2. Categorías

Son cinco: **Marketing, Ventas, Clientes, Análisis, Negocio**. Una categoría nueva solo se crea si existe un área con contenido propio suficiente, y exige una introducción editorial propia en `content/categorias.ts` (el validador rechaza introducciones parecidas entre sí).

## 3. Estructura de una guía

Una guía es una **carpeta**: `content/guias/<categoria>/<slug>/` con `data.ts` (el contenido), `guide.mdx` (el orden de las secciones y la prosa que las une) y `README.md` (notas). Las imágenes van en `public/images/guias/<categoria>/<slug>/`.

Las secciones se componen con `<GuideSection id="…" title="…">`. El `id` viene del catálogo (orden canónico fijo) y el `title` es **propio de cada guía**: los encabezados no se repiten entre guías.

| `id` | Qué cuenta | Obligatoria |
|---|---|:-:|
| `problema` | El problema real y cómo se reconoce | ✔ |
| `resultado-esperado` | Qué tendrá el lector al terminar (entregables concretos) | ✔ |
| `para-quien` | Para quién es la guía y para quién todavía no | |
| `caso-practico` | Caso del que parte la guía (`CASO FICTICIO` si es inventado) | ✔ |
| `marco` | Los conceptos que ordenan la guía, cada uno «en palabras simples» | |
| `antes` | Cómo se pide normalmente y por qué falla | ✔ |
| `datos` | Datos a reunir antes de abrir la IA | ✔ |
| `herramientas` | Qué herramienta hace cada cosa | |
| `metodo` | Pasos, cada uno con su entregable | ✔ |
| `entrevista` | Prompt de entrevista: la IA pregunta para reunir los datos que faltan | |
| `prompt` | El prompt principal, copiable, con variables documentadas (con `PromptBuilder` si tiene 3+ variables) | ✔ |
| `explicacion` | El prompt parte por parte | |
| `primer-resultado` | La primera respuesta de la IA (etiquetada) | |
| `analisis` | Qué está bien, qué mejorar y qué es un riesgo | ✔ |
| `iteracion` | El mensaje de seguimiento y por qué | ✔ |
| `resultado-final` | El resultado tras iterar | |
| `antes-despues` | La transformación, lado a lado | ✔ |
| `ejemplos` | Otros negocios con el mismo método (mín. 2) | |
| `comparativa` | Tabla que ayuda a decidir (con su «para qué sirve») | |
| `medicion` | Cómo saber si funciona (qué mirar, dónde, cómo decidir; sin cifras inventadas) | |
| `errores` | Qué NO hacer, por qué y qué hacer en su lugar | ✔ |
| `personalizacion` | Cómo adaptarlo a otros negocios | |
| `verificacion` | Qué comprueba una persona antes de usar el resultado | ✔ |
| `aplicacion` | Cómo llevarlo a la práctica | |
| `checklist` | Lista interactiva de lanzamiento | |
| `variaciones` | El mismo prompt para otras situaciones | |
| `limitaciones` | Lo que el método no hace | |
| `conclusion` | Resumen e ideas para llevarse | ✔ |
| `glosario` | Términos de la guía, tomados del glosario compartido (`content/glosario.ts`) | |
| `faq` | Preguntas reales (mín. 3) | ✔ |
| `fuentes` | Fuentes consultadas, con enlace y fecha real de consulta (obligatoria si se afirman datos de plataformas o información externa) | |
| `video` | Video de la guía (o «próximamente»); no se usa hasta que exista video real | |

El prompt es una herramienta dentro de la solución, no la solución: una guía con solo un prompt **no está terminada**.

## 4. Prompts como datos

Cada prompt vive en `data.prompts.<id>` con: `title`, `objective`, `whenToUse`, `requiredData`, `variables`, `prompt`, `explanation`, `example`, `expectedResult`, `recommendations`, `warnings`.

- Las variables se escriben `{{NEGOCIO}}`, `{{PRODUCTO}}`, `{{PUBLICO}}`, `{{OFERTA}}`, `{{CANAL}}`… y **toda variable usada debe estar documentada** en `variables` (nombre, qué poner y ejemplo ficticio).
- Cada prompt está contextualizado dentro de una tarea real. Nada de prompts genéricos.

## 5. Reglas de contenido

- **Ejemplos:** negocios ficticios (cafetería, ferretería, panadería, peluquería, tienda de ropa…). Se etiquetan como *Caso ficticio* / *Ejemplo ficticio* (los componentes lo hacen solos). Un caso no ficticio exige `evidence` con una fuente verificable.
- **Respuestas de IA dentro de la guía:** se etiquetan (*Ejemplo generado para esta guía* o *Datos del usuario*). Si están redactadas para la guía y no copiadas de una conversación real, se dice («respuesta ilustrativa»).
- **No se inventa** nada: clientes, testimonios, resultados, porcentajes de éxito, ingresos, estadísticas, casos de éxito, experiencias personales, empresas reales que hayan usado el método. Una cifra sin fuente no se afirma.
- **Cálculos (precios, márgenes, ventas, descuentos, proveedores, cantidades, costos):** la guía distingue *cálculo* (se verifica en hoja de cálculo o calculadora), *interpretación* (puede apoyarse en la IA) y *decisión* (la toma la persona). Se declara con `handlesNumbers: true` y exige un `<Callout variant="calculos">`. Todas las cifras de los ejemplos se calculan y se **verifican** aparte antes de escribirlas. La IA nunca presenta una hipótesis como un hecho ni afirma que un precio o promoción es rentable.
- **Información externa (competidores, mercado…):** los datos los aporta el usuario con su fuente; lo generado por la IA se marca como hipótesis. Se declara con `usesExternalInfo: true` y exige un `<Callout variant="fuentes">`.
- **Transparencia sobre la IA:** puede equivocarse, inventar información, necesita contexto y requiere revisión humana. «La IA ayuda a generar y analizar. La persona verifica y decide.»
- **Datos que caducan** (límites y políticas de plataformas, precios, planes): se verifican en la fuente primaria, se citan en `sources` con la fecha real de consulta y se marcan con `mayExpire`. Lo que no se pueda verificar, no se afirma.
- **Evidencia real** (`data.evidence`): capturas, una prueba propia con fecha, una nota de la autoría o una revisión humana (`reviewedAt`). La aporta una persona, nunca el sistema; sin datos, no se muestra nada (ni marcadores). Sin experiencia propia real, la guía no la reclama («lo probamos», «en mi experiencia»…).
- **Aspectos legales:** no se dan reglas legales concretas; se indica que varían por país y se remite a un profesional.
- **Sin publicidad ni afiliados** dentro del contenido (el sistema tiene un espacio neutro desactivado, ver `lib/guides/config.ts`).

## 6. Fechas y autoría

`publishedAt` y `updatedAt` son **reales**. `publishedAt` es `null` mientras la guía sea borrador y se fija el día en que se publica. `updatedAt` se actualiza cuando cambia el contenido (nunca para «refrescar» sin cambios). Jamás se modifican para simular antigüedad o actividad editorial. La autoría es solo una entidad real de `content/autores.ts`: no se inventan personas ni credenciales.

## 7. Control de calidad para cada URL nueva

Todo debe ser «sí» antes de publicar:

| Criterio | Pregunta |
|---|---|
| Valor | ¿Resuelve un problema real? |
| Originalidad | ¿Aporta conocimiento propio y útil? |
| Profundidad | ¿Explica realmente cómo realizar la tarea? |
| Prompts | ¿Están contextualizados y sus variables documentadas? |
| Caso y ejemplo | ¿Hay un caso claro, ficticio y etiquetado, y ejemplos distintos? |
| Antes/después | ¿Se ve la transformación y por qué mejora? |
| Evaluación | ¿Se analiza el resultado y se itera? |
| Utilidad | ¿Puede el lector aplicarlo hoy en su negocio? |
| Diferenciación | ¿La página necesita realmente existir? |
| UX | ¿Es fácil de leer y usar (también en móvil)? |
| SEO | ¿Título y descripción únicos, canonical, breadcrumb y enlaces relacionados correctos? |
| Confianza | ¿Las afirmaciones importantes pueden verificarse? |
| Video | ¿El plan (`mediaPlan`) da para un video largo de 10+ min y 3–8 Shorts? |

Si falla cualquier criterio importante: **no se publica**.

## 8. Publicar y actualizar

1. `npm run guias:validar` sin errores (el build también lo ejecuta).
2. `status: "published"`, `publishedAt` = fecha real, `updatedAt` = fecha real, sin ningún `TODO`.
3. Comprobar las guías relacionadas: solo se enlazan las que existen; una guía publicada no enlaza a un borrador.
4. Si la guía sustituye a una URL antigua con la misma intención, añadir la redirección 301 en `content/redirects.ts` con el motivo (solo se activa cuando la guía está publicada).
5. El sitemap, los hubs, la biblioteca, el canonical y el JSON-LD se actualizan solos.

Para **actualizar** una guía existente: edita el contenido, ajusta `updatedAt` a la fecha real del cambio y vuelve a validar. No se crea una URL nueva si corresponde ampliar la que ya existe.
