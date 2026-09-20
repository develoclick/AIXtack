---
description: Genera (o regenera) una guía editorial completa, coherente y original a partir de una sola ruta
argument-hint: <ruta, ej. /ventas/guias/crear-descripciones-de-productos-con-ia>
---

# GENERADOR DE GUÍAS: UNA RUTA, UNA GUÍA (v3)

**La primera línea de tu reporte final debe ser `Prompt guia.md v3`** (así el autor confirma qué versión se ejecutó). Si este archivo y `.claude/guias-contexto.md` se contradicen, prevalece este archivo.

Ruta: **$ARGUMENTS** (acepta URL completa, `/categoria/guias/slug` o `categoria/slug`).

Extrae categoría y slug; deduce tema, problema e intención de búsqueda. No me preguntes nada que puedas deducir o inspeccionar. Trabaja de principio a fin sin confirmaciones. Detente solo si la ruta es inválida, el slug es ambiguo, o el tema duplica otra guía sin ángulo distinto. **Alcance: solo esta ruta.**

Público: dueños de microempresas y emprendedores que usan IA, **incluidas personas que casi no saben de IA**. Español neutro latinoamericano; no asumas país, moneda ni normativa salvo que el tema lo exija. **Autor: alias DeveloClick** (escrito exactamente así).

---

## 0. PRINCIPIOS NO NEGOCIABLES

1. **Valor real antes que cantidad.** Una guía excelente vale más que diez correctas.
2. **Nunca fabricar:** datos, fuentes, casos, pruebas, resultados, experiencia ni credenciales.
3. **Cada dato, idea o instrucción aparece una sola vez.** La repetición se lee como relleno.
4. **Coherencia total:** un criterio, número, columna o nombre significa lo mismo en todas partes.
5. **Nada se presenta como probado sin prueba del autor.** Lo simulado se llama simulado.
6. **Sin promesas:** no afirmes ni insinúes aprobación de AdSense, posicionamiento, resultados ni ingresos, y no menciones AdSense en el contenido de las guías.
7. **Lo medible se comprueba con el validador** (sección 10), no de memoria. Una guía con errores del validador no está terminada.

---

## 1. EFICIENCIA Y MEMORIA DEL PROYECTO

- **Lee primero `.claude/guias-contexto.md`.** Si existe, NO re-audites el proyecto ni releas políticas. Si no recoge las convenciones de las secciones 5 a 10 (autoría, evidencia y pruebas, constantes, manifiesto de imágenes, contrato del validador), añádelas.
- **Si no existe (primera ejecución):** audita una sola vez y créalo (máx. 120 líneas) con:
  1. convenciones: rutas, esquema de datos, componentes, helpers de SEO e imágenes, glosario compartido, comandos de validación;
  2. resumen de políticas consultadas, con fecha: AdSense (https://support.google.com/adsense/answer/48182), contenido útil (https://developers.google.com/search/docs/fundamentals/creating-helpful-content), spam y contenido a escala (https://developers.google.com/search/docs/essentials/spam-policies);
  3. diagnóstico del sitio: ¿existen y están enlazadas Privacidad, Términos, Sobre nosotros y Contacto? ¿contacto coherente? ¿enlaces rotos o formularios que no envían? ¿cuántas guías sustantivas hay?;
  4. índice, una línea por guía: `ruta | tipo | problema | ángulo | secciones distintivas | activo original`.
- **Si la ruta ya existe (regeneración):** lee la guía existente una vez. Conserva `slug`, `publishedAt`, imágenes, `evidence` y pruebas reales: nunca las borres ni las reescribas. Corrige y mejora el resto, actualiza `updatedAt` y resume los cambios en el reporte.
- Actualiza el diagnóstico solo si tiene más de 30 días o te lo pido.
- No explores el repo a ciegas: abre solo lo necesario y usa **una** guía existente como referencia de estructura.
- El blueprint (tipo de guía, secciones elegidas y por qué, decisiones, errores, criterios, constantes, trazabilidad del primer resultado) es interno: no lo imprimas.
- Investiga solo lo que caduca o exige hechos (precios, planes, funciones, políticas, normativa, casos públicos). Máx. ~8 búsquedas/fetch, fuentes primarias, sin leer páginas enteras si un fragmento basta. Sin datos cambiantes, no investigues por costumbre.
- Escribe cada archivo completo de una vez; corrige con ediciones puntuales. Recorta la salida de comandos (`npm run build 2>&1 | tail -30`). Ejecuta build una sola vez al final (repite solo si falla); el validador puede ejecutarse las veces necesarias.
- **Archivos compartidos que puedes tocar además de esta guía:** el índice de `.claude/guias-contexto.md` y el glosario. **No edites otras guías.** En la línea de esta guía del índice, anota qué guías convendría enlazar de vuelta.

**La calidad no se recorta para ahorrar tokens.** El ahorro sale de no repetir trabajo, no de escribir menos valor.

---

## 2. OBJETIVO, ADSENSE Y VISIÓN

Cada guía resuelve un problema real, de modo que el lector la guarde y vuelva a ella. El objetivo comercial es poder monetizar después con AdSense, pero **nadie puede garantizar la aprobación**. Lo que sí controlas es que la guía sea útil, original, coherente, honesta, hecha para personas, con valor añadido y con señales de confianza.

**Visión:** con el tiempo este sitio será una enciclopedia de guías prácticas de IA para pequeños negocios. Hoy solo importa hacer **bien esta página**. Para que la enciclopedia crezca ordenada: respeta la taxonomía (`categoria`, `tipo`, `nivel`), reutiliza el glosario compartido, enlaza solo guías reales y nunca dupliques ni cambies solo palabras respecto a otra guía.

**Puerta de diferenciación:** compara con el índice. Si el tema se solapa, define qué aporta de distinto (otro problema, otra decisión, otro tipo de negocio) o propón fusionarla.

---

## 3. ESTRUCTURA ADAPTATIVA

Piensa "¿qué necesita entender y hacer esta persona para resolver este problema?", no "¿qué texto genero sobre el tema?".

### 3.1 Tipo de guía (puede ser híbrida); de él infieres qué secciones añadir, quitar o reordenar

- **Tutorial con herramienta:** pasos con capturas, prompts, evaluación e iteración; añade solución de problemas y costo/requisitos.
- **Decisión o comparación:** tabla comparativa, criterios de elección, mapa de decisión ("si tu caso es X, elige Y"), costos verificados; pocos prompts.
- **Estrategia o planificación:** marco de trabajo, plantillas, ejemplo completo, variantes por tipo de negocio, cómo medir.
- **Automatización o flujo:** diagrama del flujo, requisitos, configuración paso a paso, prueba, qué hacer si falla, privacidad de datos.
- **Números y datos:** ver 3.7.
- **Comunicación y atención al cliente:** tono, plantillas por situación, ejemplos de conversación, qué no delegar, revisión antes de enviar.
- **Tema sensible o regulado:** advertencias visibles, qué puede y no puede hacer la IA, cuándo consultar a un profesional; sin asesoría legal ni médica.
- **Conceptual o educativa:** analogías, mitos vs realidad, ejemplos cotidianos; pocos prompts de producción.
- **Creativa o visual:** brief, referencias, criterios visuales, derechos de uso y originalidad, iteración por rondas.

Puedes crear secciones que no estén aquí si el tema las necesita. **Dos guías de tipos distintos no deben tener el mismo esqueleto**; compara con la referencia y con las últimas del índice. Guarda `tipoGuia` en los datos.

### 3.2 Núcleo mínimo (siempre existe, adaptado al tipo)

Hero · problema (qué le pasa al lector, por qué ocurre, qué suele hacer mal, qué mejora la IA y qué **no** puede resolver) · qué conseguirás y para quién es (y para quién no) · método (qué haremos, por qué y en qué orden, **antes** de cualquier prompt) · ejecución paso a paso · cómo evaluar el resultado con criterios concretos · verificación humana · **qué hacer después** · limitaciones · conclusión breve · fuentes si hubo datos externos · FAQ solo con dudas reales · guías relacionadas solo si la ruta existe.

### 3.3 Módulos según el tipo

Caso práctico · qué preparar · primer resultado · iteración (resultado → problema detectado → cambio → nueva instrucción → mejora, explicando por qué mejoró) · errores comunes (error, por qué ocurre, consecuencia, corrección) · comparación de herramientas · ejemplos por tipo de negocio · personalización · versión rápida vs completa · solución de problemas · costos y requisitos verificados · glosario (solo los términos usados) · mitos vs realidad · mapa de decisión · plantillas · cómo medir resultados. Si una sección no aporta, no la crees; si el tema exige una que no está, créala.

### 3.4 Índice agrupado en 6 a 8 partes

El índice lista **partes**, no secciones sueltas (por ejemplo: *Entender el problema · Preparar · Hacer · Evaluar y mejorar · Verificar y aplicar · Referencia*). Cada `GuideSection` declara su parte (`part="…"`). En escritorio queda fijo; en móvil, plegable. Nunca más de 8 entradas de primer nivel.

### 3.5 Activo original (obligatorio)

Cada guía entrega al menos un recurso propio y reutilizable que no se obtiene copiando un prompt de internet: una rúbrica con criterios propios, una plantilla, una matriz de decisión, una calculadora o una cadena de prompts. Debe poder usarse tal cual; si es una tabla o plantilla, incluye un botón **"Copiar como tabla"** (pegable en Google Sheets o Excel). Regístralo en el índice.

### 3.6 Extensión

**3.000–4.500 palabras de texto explicativo** (sin contar prompts, tablas de ejemplo ni glosario), con tiempo de lectura **calculado del texto real** (~200 palabras/min). Si el tema pide más, elimina lo secundario y las repeticiones; si aun así excede, entrega esta guía en su alcance esencial y propón en el reporte la guía complementaria (no la crees).

### 3.7 Guías de números y datos (`handlesNumbers: true`)

- **Enseña a construir el cálculo, no solo a interpretarlo:** incluye una plantilla copiable de la hoja, las fórmulas concretas (con el nombre de la función en español e inglés, p. ej. SUMAR.SI.CONJUNTO / SUMIFS) y un **prompt para pedirle a la IA ayuda con las fórmulas sin compartir datos** (solo describe la estructura de las columnas).
- **Verifica cada cifra del caso con código** (Node o Python) antes de escribirla, y guarda el registro en `README.md` de la guía (incluye la palabra "verificado" y qué se comprobó: sumas cruzadas, porcentajes que suman 100 %, promedios, variaciones).
- Los "errores de la IA" que muestres deben ser errores reales y corregibles con la hoja.
- Cuando una guía compare periodos, enseña a hacerlo de forma justa (días abiertos, promociones, tamaño de la muestra) y a decir "con estos datos no se puede afirmar".

---

## 4. ESCRITURA PARA PRINCIPIANTES

- Supón que el lector nunca usó IA ni la herramienta del tema.
- Define cada término técnico la primera vez, en una frase sencilla; los recurrentes van al glosario compartido (defínelos una vez, enlázalos después). Si el término no hace falta, no lo uses.
- Cada concepto o paso responde: **qué es, para qué sirve, cómo se hace y cómo sé que salió bien.**
- Analogías con situaciones cotidianas de un negocio cuando ayuden. Recuadro **"En palabras simples"** solo tras conceptos verdaderamente difíciles: **máximo 4 por guía**.
- Frases cortas, voz activa, un paso = una acción. Sin relleno ("en el mundo actual…", "cabe destacar…"), sin tono de venta.
- Instrucciones de interfaz solo si están verificadas; si cambian a menudo, describe la función, no la posición.
- **Prueba del lector nuevo:** ¿alguien que jamás usó IA podría seguir cada paso sin buscar nada afuera?

---

## 5. VERACIDAD, CASOS, AUTORÍA Y EVIDENCIA

- **Nunca inventes** estadísticas, estudios, fuentes, testimonios, clientes, empresas, ingresos, resultados, experiencias ni credenciales.
- **Casos reales, solo verificables:** públicos y comprobables (documentación oficial, caso publicado por la empresa o un medio confiable), citados con enlace y fecha, parafraseados y sin exagerar resultados. **Nunca presentes un caso ficticio como real ni "adaptes" uno real inventando detalles.** Sin caso real verificable, usa un `CASO FICTICIO` bien construido (con `fictional: true`) y sugiéreme en el reporte qué caso propio documentar.
- Todo ejemplo creado por ti se marca `CASO FICTICIO`, `EJEMPLO ILUSTRATIVO` o `EJEMPLO GENERADO`.
- **Afirmaciones sobre el comportamiento de la IA:** formúlalas como precaución práctica ("puede equivocarse al sumar", "conviene revisar…"), nunca como absolutos ("la IA no puede…", "no está pensada para…"), salvo que tengas fuente. Tampoco afirmes lo que "hará" un asistente concreto.
- Distingue hecho verificado, recomendación e hipótesis. Datos que caducan (precios, planes, límites): verifícalos y muestra "verificado el {fecha real}". Sección visible **Fuentes y verificación** con enlace y fecha de consulta.
- No copies textos ni estructuras ajenas.
- **Autoría:** `metadata.author` = `DeveloClick`, con `publishedAt` y `updatedAt`. Byline visible y `author` en el JSON-LD. **No inventes biografía, trayectoria, credenciales ni experiencia:** `authorBio` solo con texto que yo te proporcione. Enlaza el byline a una página de autor solo si existe.
- **Evidencia del autor:** define siempre `evidence` en los datos (vacío si no hay nada) o no lo referencies; contiene, todo opcional: `pruebas` (por prompt: `promptId`, `fecha`, `asistente`, `nota` con lo que observó), `casoReal`, `revisadoEn`. **Se muestra solo lo que exista.** **Tú nunca escribes resultados, observaciones ni fechas de pruebas:** solo el autor. Diferencia visualmente `EJEMPLO GENERADO` (simulado) de `PRUEBA REAL` (con evidencia del autor).
- **Prueba de originalidad:** ¿enseña algo que no se obtiene copiando un prompt de internet? Si no, reestructura.

---

## 6. PROMPTS SOFISTICADOS

El producto no es "copia este prompt" sino: problema + método + prompt + evaluación + iteración + aplicación.

**Cantidad: 3 a 6 por guía, cada uno con una función distinta y justificada.** Funciones posibles: **entrevista** (la IA te pregunta para reunir datos), **principal** (genera el resultado), **evaluación** (revisa con la rúbrica de la guía), **iteración** (corrige lo que falló), **adaptación** (otro negocio, canal, tono o formato), **verificación** (señala lo que debes comprobar tú). Nunca dos que hagan lo mismo.

### 6.1 Estándar de sofisticación (todo prompt lo cumple, sin excepciones)

1. **Rol, objetivo y destinatario** del resultado, explícitos.
2. **Bloques delimitados** con encabezados claros (`### CONTEXTO`, `### DATOS`, `### REGLAS`, `### FORMATO DE SALIDA`), legibles para no técnicos y válidos en cualquier asistente de chat.
3. **Trazabilidad:** distinguir lo que viene de los datos del usuario, lo supuesto y lo sugerido.
4. **Honestidad ante los vacíos:** si falta información, o si los datos no cuadran o son insuficientes, la IA lo dice y pregunta o marca `[FALTA: …]`; nunca la inventa ni rellena con lo habitual del rubro.
5. **Formato de salida exacto** (tabla con columnas fijas o secciones en orden) para poder evaluarla. Un ejemplo de formato aclara que **muestra forma, no contenido**.
6. **Autoverificación obligatoria:** una instrucción explícita del tipo *«antes de responder, verifica que…»* con las comprobaciones concretas del tema; corregir o eliminar lo que no cumpla.
7. **Límites propios del tema** (qué no inventar, qué no aconsejar) y **reglas de borde** (pocos datos → hablar de cantidades y no de porcentajes; periodos desiguales → avisarlo; etc.).
8. **Encadenado:** si usa la salida de otro prompt, indica dónde pegarla y qué debe conservar.
9. **Sin relleno:** cada línea debe poder justificarse en su "por qué funciona".
10. **Compatible con cualquier asistente de chat**; no prometas que funciona igual en todos ni que está probado (ver 6.3).

### 6.2 Ficha de cada prompt (sin campos repetidos)

Título · objetivo · cuándo usarlo (una frase) · variables (definidas **una sola vez**: nombre, qué poner, ejemplo) · el prompt · **por qué funciona, por partes y en lenguaje simple** · cómo evaluarlo y mejorarlo · advertencias.

**No repitas** en cada ficha los datos previos generales de la guía ("Datos que necesitas antes") ni añadas un "ejemplo de uso" que reitere los ejemplos de las variables. Los prompts conversacionales (entrevista) sí incluyen un **ejemplo breve del intercambio** (2 o 3 turnos, ilustrativo).

**Presentación única:** cada prompt se muestra **una sola vez**, en un componente con constructor de variables (campos que actualizan el texto en vivo), vista del texto completo plegable y botón de copiar (`COPIAR` → `COPIADO ✓`). Nunca un bloque de texto más el mismo prompt en un constructor. Usa el constructor en todo prompt con 2 o más variables.

### 6.3 Pruebas reales del autor

El autor probará cada prompt y mostrará el resultado en imágenes. Por eso cada prompt tiene su espacio `prueba-prompt-0N.webp` en el manifiesto, declarado con **`promptId: "<clave del prompt>"`**. El componente **"Prueba real"** aparece solo si existe la imagen (y muestra `fecha`, `asistente` y `nota` solo si el autor los aportó). Mientras no haya prueba, el prompt se presenta como "diseñado para", nunca como "probado". No afirmes compatibilidad con un asistente concreto salvo que conste en `evidence.pruebas`.

### 6.4 Ejemplos generados coherentes con el prompt

El ejemplo se produce **aplicando literalmente el prompt a los datos del caso**: mismas columnas, mismo formato, mismas reglas.

**Trazabilidad del primer resultado (obligatoria).** Si la guía muestra un primer resultado imperfecto para enseñar a evaluar, construye internamente una tabla `defecto → regla del prompt → por qué el prompt no puede impedirlo del todo`. Si un defecto **viola una regla explícita** del prompt (cálculo nuevo cuando lo prohíbe, causa afirmada cuando pide hipótesis, recomendación cuando la excluye, otro formato del pedido), no es plausible: reemplázalo por uno que el prompt no pueda prevenir (una cifra correcta atribuida al periodo equivocado, una alternativa débil o superficial, contexto usado solo a medias, una hipótesis con lenguaje afirmativo sutil). Alternativa válida: presentar ese resultado como salida del **pedido ingenuo** de la sección "Antes", con su prompt ingenuo visible y ubicándolo allí.

**Ejemplos que citan reglas:** todo ejemplo, tabla o texto que atribuya un comportamiento al prompt o a la rúbrica ("el prompt pide…", "la rúbrica marca…") debe corresponder a una línea que exista. Comprueba cada atribución antes de cerrar; si no existe, añade la regla al prompt o elimina la frase.

---

## 7. COHERENCIA Y CERO REPETICIÓN

**Fuente única de verdad.** En los datos define una sola vez lo que se menciona en varios sitios: criterios de la rúbrica (id, nombre, descripción), umbrales, cantidades, pasos del método, columnas de las tablas y variables. Texto, prompts, componentes y ejemplos **leen de ahí**: nada se teclea dos veces. La rúbrica de evaluación y los criterios del análisis usan **la misma definición**.

**Regla de una sola vez:**
- La ficha rápida (tiempo, nivel, **qué necesitas**) aparece **una vez** (`quickFacts`). El hero muestra solo categoría, título, subtítulo, nivel, tiempo de lectura, autor y fechas: **sin `hero.tools`**.
- "Qué conseguirás" no se repite en otra lista de "al terminar tendrás".
- Los pasos del método aparecen **una sola vez** y son la checklist de proceso (marcables ahí mismo): **no crees una `checklist` que repita los pasos**. "Qué hacer después" (`application`) explica lo que viene **tras** el método: rutina, cuándo repetir, qué anotar, cómo ampliar. Nunca los mismos pasos con otras palabras.
- Una sola checklist adicional, de verificación del resultado, sin ítems repetidos respecto a otras listas.
- "Antes/después" solo si muestra algo que el análisis no dice.
- **Mensaje central** (por ejemplo, "la IA puede equivocarse al sumar, calcula en la hoja"): aparece como máximo en **4 lugares** (problema, marco o método, verificación, limitaciones o conclusión). En los demás, se enlaza o se omite.
- Cuenta coherente: si el título dice "la IA ayuda en N pasos", los pasos que usan un prompt son exactamente N (incluido el paso 1 si usa un prompt).
- Un mismo dato, definición o advertencia vive en un solo lugar.

**Auditoría de coherencia (antes de cerrar):** lista cada criterio, umbral, columna, cantidad, variable y nombre que aparezca en más de un lugar y comprueba que sea idéntico en texto, prompts, componentes, ejemplos y JSON-LD. Si afirmas que dos cosas "son las mismas", verifica que lo sean. Resume el resultado en una línea del reporte.

---

## 8. IMÁGENES: ESPACIOS PREPARADOS, NUNCA RELLENO

Carpeta: `public/images/guias/{categoria}/{slug}/`. El autor agrega ahí las imágenes reales después; tú preparas los espacios y la descripción de lo que debe ir en cada uno, para que la guía las reciba sin tocar código.

1. **Hero: siempre** (`hero.webp`, 16:9). La cabecera está diseñada con imagen.
2. **Imágenes explicativas: solo las que agreguen valor.** Un espacio se justifica si responde "sí" a: *¿el lector entiende, decide o ejecuta mejor con esta imagen que solo con texto?* Zonas típicas: situación del problema, datos a preparar, pasos con interfaz, resultado, antes/después, ejemplos, diagrama del proceso. No válidas: decoración, ambientación, stock, repetir el texto. Máximo una por sección o paso. **Referencia: hero + 4 a 8** (hasta ~10 en tutoriales con interfaz).
3. **Pruebas de prompts:** un espacio adicional por prompt (`prueba-prompt-01.webp`…, cada uno con `promptId`), que no cuenta contra el tope anterior: es la evidencia más valiosa de la guía.
4. **Manifiesto `images`**, una entrada por espacio, con `file`, `section`, `description`, `ratio`, `alt` y `caption` propuestos. La `description` es textual y concreta (2 a 4 frases): qué debe verse, qué resaltar, qué datos usar (ficticios o sin información personal) y por qué ayuda. Alguien que no conozca la guía debe poder producir la imagen leyéndola. Para las pruebas de prompts indica además **qué datos de entrada usar y qué parte de la respuesta capturar**.
5. **Texto autosuficiente:** coloca cada espacio donde se necesita; el texto de esa sección debe funcionar sin la imagen.
6. **Renderizado automático:** un helper de servidor (créalo una vez y regístralo en `.claude/guias-contexto.md`) lee la carpeta y renderiza cada espacio **solo si el archivo existe**: `figure` + `figcaption`, `next/image` con dimensiones derivadas de `ratio`, carga diferida salvo el hero. Al soltar un archivo con el nombre declarado, aparece sin tocar código.
7. **Qué se ve en cada entorno:** en **desarrollo** (`NODE_ENV=development`) o con `NEXT_PUBLIC_SHOW_IMAGE_SLOTS=true`, un marcador con nombre de archivo, ratio y descripción completa. En **producción**, un espacio sin archivo no deja hueco ni marcador; si falta el hero, la cabecera cae a una versión tipográfica limpia. En el **build**, warning (sin romper) por cada imagen declarada que falte, destacando hero y pruebas.
8. **No generes imágenes falsas, no uses stock, no inventes capturas.** Sí puedes crear diagramas y esquemas en código (SVG/HTML accesible); esos no son espacios de imagen.
9. **Si ya hay imágenes en la carpeta**, ábrelas, verifica que `alt` y `caption` describan lo que realmente muestran y ajusta el manifiesto. Si no hay, no gastes tokens abriendo nada.
10. Especificaciones para el reporte: WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB; capturas sin datos personales ni claves; texto legible en móvil.

---

## 9. COMPONENTES, DISEÑO E IMPLEMENTACIÓN

- **Reutiliza** arquitectura, Design System y componentes existentes; crea solo los que falten, genéricos, con el contenido en datos/MDX (nunca hardcodeado). Si no hay convención: `content/guias/{categoria}/{slug}/{data.ts, guide.mdx, README.md}`.
- **Componentes según el tipo de guía** (no el mismo conjunto en todas): ficha rápida (una vez); prompt con constructor; "Prueba real"; pestañas por tipo de negocio o versión; antes/después; diagrama o mapa de decisión; puntuador con rúbrica; checklist de verificación; alertas ("no delegues esto a la IA"); tablas responsive con "Copiar como tabla"; acordeones para detalles opcionales. Cada uno debe resolver una necesidad concreta.
- **Estética editorial premium**, sobria, con buena jerarquía tipográfica. Evita rasgos de plantilla IA: blobs o degradados decorativos, cuadrículas simétricas de tarjetas idénticas, mismo radio y sombra en todo, todo centrado (incluye al menos un momento asimétrico), emojis como sustituto de contenido, CTAs con el mismo texto y **bloques duplicados**.
- **Rendimiento:** Server Components por defecto; Client solo donde haya interacción (constructor, checklists, puntuador, pestañas, copiar); mínimo JS.
- **Accesibilidad (WCAG 2.2 AA razonable):** HTML semántico, un solo H1, foco visible, teclado, botones reales, contraste, `prefers-reduced-motion`. **Responsive:** 360, 390, 768, 1024, 1280, 1440+. Las **respuestas de la FAQ siempre están en el HTML**, aunque el acordeón esté cerrado.
- **SEO:** title, description, canonical, robots, OpenGraph, Twitter, JSON-LD `Article` (con `author`) y `BreadcrumbList`, coherentes con lo visible; sin contenido oculto ni keyword stuffing; sitemap si el proyecto lo gestiona. Enlaces internos solo a rutas verificadas.

---

## 10. VALIDACIÓN, AUDITORÍAS Y PUERTA DE CALIDAD

### 10.1 Validador (obligatorio)

El validador vive en `scripts/validate-guides.mjs` (el autor lo instala una vez) y se ejecuta con:

```bash
node scripts/validate-guides.mjs {categoria}/{slug}
```

Comprueba de forma mecánica: datos referenciados pero no definidos · variables de prompts · autoverificación, formato de salida y manejo de datos faltantes en cada prompt · prompt mostrado más de una vez · espacios `prueba-prompt-0N` con `promptId` · manifiesto completo (hero, `description`, `alt`, `ratio`) · "Aplicación" o checklist que repiten el método · "Necesitas" duplicado · secciones con título o id repetido · frases casi idénticas · relatedGuides y enlaces internos rotos · autor · README de verificación en guías de números · frases prohibidas · extensión aproximada.

**Corrige todos los ERRORES** hasta que no quede ninguno, y justifica en el reporte cualquier AVISO que decidas mantener. **Si el script no existe, dilo en la segunda línea del reporte** y aplica manualmente todas las comprobaciones anteriores.

**Contrato con el validador:** usa estos nombres de campo o el validador no los verá: `metadata.author`, `metadata.relatedGuides`, `metadata.handlesNumbers`, `quickFacts.needs`, `method.steps[].title`, `application.steps[].title`, `checklist.items[].label`, `prompts.<clave>` (con `title`, `variables[].name`, `prompt`), `images.<clave>: slot("archivo.webp", { …, promptId })`, `caseStudy.fictional`, `evidence`, y `README.md` en la carpeta de la guía. Si el proyecto ya usa otras convenciones, adapta el validador (no las reglas) y regístralo en el contexto.

### 10.2 Resto de validaciones

Ejecuta el build y los demás scripts del proyecto (lint, tipos, tests) una vez, con la salida recortada. Comprueba manualmente lo que el validador no ve: un solo H1 · esqueleto distinto al de guías similares · ejemplos que reproducen su prompt · atribuciones a prompts o rúbrica que existen (6.4) · términos definidos o en el glosario · casos con fuente o etiquetados · datos caducos con fecha · JSON-LD igual a lo visible · sin marcadores de imagen en producción · tiempo de lectura calculado.

### 10.3 Revisor exigente

Simula ahora a un **revisor exigente de contenido** y busca activamente estas señales de bajo valor; si encuentras cualquiera, reescribe: relleno o texto que suena a plantilla · repetición entre secciones · contradicciones internas · ejemplos incoherentes con el prompt que dicen ilustrar · afirmaciones absolutas sobre la IA · afirmaciones sin fuente o datos posiblemente desactualizados · promesas exageradas · secciones superficiales · extensión inflada · falta de autor o fecha · enlaces rotos · mismo esqueleto que otra guía.

Y responde con honestidad; si varias son "no", reescribe:

- ¿Resuelve un problema real y específico, y explica por qué ocurre?
- ¿Alguien que nunca usó IA podría seguirla sin buscar nada afuera?
- ¿Su estructura responde a este tema o es la plantilla de siempre?
- ¿Enseña un método, a evaluar la salida y a mejorarla?
- ¿Cada prompt cumple el estándar 6.1 y una función distinta?
- ¿Entrega un activo original y reutilizable?
- ¿Los ejemplos son concretos, coherentes con sus prompts y claramente ficticios o reales?
- ¿El lector sabe qué verificar y puede aplicarlo mañana mismo?
- ¿Explica limitaciones sin vender la IA como magia?
- ¿Cada imagen declarada aporta valor y ninguna es decorativa?
- ¿Se ve premium en móvil y escritorio?

---

## 11. PROHIBIDO

Contenido thin o de relleno; producción masiva; el mismo esqueleto en todas las guías; repetir información entre secciones; mostrar un prompt más de una vez; checklists que repiten el método; FAQ, tablas o prompts de relleno; inventar datos, fuentes, testimonios, credenciales, pruebas u observaciones del autor; presentar como probado lo no probado; presentar casos ficticios como reales; afirmaciones absolutas sobre lo que la IA puede o no puede hacer; mencionar AdSense en las guías o afirmar que algo garantiza aprobación; contenido oculto; enlaces a páginas inexistentes; editar otras guías; **anuncios o espacios de anuncio**; **cualquier contenido audiovisual** (YouTube, Shorts, video, `VideoObject`, `videoId`, miniaturas, capítulos, guiones, `mediaPlan`); generar rutas futuras.

---

## 12. REPORTE FINAL (máx. 30 líneas, sin contar las tres tablas siguientes)

Línea 1: `Prompt guia.md v3`. Línea 2: resultado del validador (`0 errores, N avisos` y el motivo de cada aviso mantenido) o "validador no instalado".

Luego: URL · tema e intención · usuario y problema · **tipo de guía y secciones añadidas o quitadas, con el motivo** · activo original · prompts (función de cada uno) y componentes · resultado de la auditoría de coherencia · palabras y tiempo de lectura · términos añadidos al glosario · archivos creados y modificados · resultado del build · fuentes consultadas (enlace y fecha; datos que caducan y cuándo revisarlos) · advertencias del sitio (páginas legales, contacto, enlaces rotos, volumen de guías).

**Estándar de prompts (6.1):** tabla con una fila por prompt y una columna por cada uno de los 10 puntos (✓/✗).

**Plan de imágenes:** una línea por imagen (archivo · sección · qué mostrar · ratio), hero primero, pruebas de prompts al final.

**Guía de pruebas de prompts** (para el autor): una línea por prompt: `promptId` · datos de entrada sugeridos · qué parte de la respuesta capturar (`prueba-prompt-0N.webp`) · qué debe cumplir la salida para darla por buena · fallos a observar. Recomienda probar cada prompt al menos en un asistente y, si falla, ajustar el prompt y repetir la prueba antes de publicar.

**Requiere revisión humana:** afirmaciones a contrastar, casos reales propios que sumarían valor y cualquier dato que pueda haber cambiado.
