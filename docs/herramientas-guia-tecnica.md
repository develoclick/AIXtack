# Herramientas: guía técnica (Fase 1)

Cómo funciona la infraestructura del modelo «Herramienta + guía corta» y cómo añadir una página.

## Añadir una página
1. Crea `content/herramientas/{area}/{slug}.ts` con `export default defineHerramienta({...})` (esquema en `lib/herramientas/tipos.ts`). El nombre del archivo es el slug; el área es la carpeta (`marketing`, `ventas`, `clientes`, `analisis`, `negocio`).
2. Déjala con `publicado: false`. Lo que falte (prueba real, capturas, fecha) queda como `null`/vacío con un comentario `// TODO:` **en el archivo de datos**, nunca en la página.
3. Las imágenes se declaran como **espacios** en `imagenes` (ver «Imágenes» más abajo) y se guardan en `public/img/{area}/{slug}/{archivo}.webp`: aparecen solas al subir el archivo. `meta.ogImage` sigue siendo `og.webp`. `ejemplo.resultado` muestra lo que sale del caso (por ejemplo, los niveles de un afiche) y debe coincidir con la captura real.
4. Comprueba: `npm run herramientas:validar`, `npm test`, `npm run build`.
5. Solo pasa a `publicado: true` cuando el validador da 0 errores: exige 1.500–2.500 palabras, descripción de 140–160 caracteres, prueba real (`probadoEn` y `probadoFecha`), todas las imágenes obligatorias con archivo (y al menos una «Prueba real»), 3–4 mejoras/ideas/errores, 4–6 preguntas, 2–3 relacionadas publicadas, sin TODO ni promesas absolutas.

`publicado: false` = noindex, fuera del sitemap, de `/herramientas`, de las páginas de área y de «relacionadas» (todo eso pasa por `listarPublicadas()` en `lib/herramientas/registro.ts`; una prueba lo comprueba). Los archivos que empiezan por `_` son páginas internas: solo existen con `next dev` (ver `content/herramientas/negocio/_prueba-plantilla.ts`, en `/negocio/prueba-plantilla`).

## El prompt
`construirPrompt(perfil, campos, calculos, tarea, { usaPerfil })` (`lib/prompts/construir-prompt.ts`) arma: reglas comunes (`reglas-comunes.ts`) → datos del negocio (solo lo que la página declara en `usaPerfil` y tiene texto) → datos de la tarea → cálculos ya hechos → tarea (`tarea` del archivo de datos) → cierre común (`cierre-comun.ts`).
- En `tarea` puedes citar campos con `{{id}}`. El prompt final **nunca** muestra llaves: un campo requerido vacío queda `[FALTA: etiqueta]`, uno opcional «no indicado», y en las líneas de datos los opcionales vacíos se omiten.
- Escribe la tarea sin punto final pegado a un `{{id}}` (el valor puede traer el suyo).

## Calculadoras
Las fórmulas viven en el archivo de datos como texto y las evalúa `lib/herramientas/expresiones.ts` (sin `eval`). Se pueden usar los ids de las entradas y de las salidas anteriores, `+ - * /`, comparaciones, `&& || !` y `min`, `max`, `abs`, `round(x; n)`, `techo`, `piso`, `si(cond; a; b)`. Un porcentaje se escribe como 20 y llega a la fórmula como 0.2. Un dato no válido o una división entre cero dan «—» y `[FALTA]` en el prompt; nunca una cifra inventada.
Cada calculadora declara `casosDePrueba` (mínimo 3); `npm test` y el validador los ejecutan. Fija la base de cada porcentaje (margen sobre precio o recargo sobre costo) antes de escribir la fórmula.

## Conteos que hace la página (pre-procesos) y `contarPalabras()`
Regla de fondo (estándar 9): **lo que se puede contar o calcular lo hace la página, no la IA.** Los pre-procesos (`preproceso` en el archivo de datos) leen lo que la persona escribe y devuelven resultados ya hechos: `conteo-temas` y `resumen-ventas` (analizadores) y `conteo-palabras` (afiches). Un pre-proceso puede declarar `variables`: en la tarea, `{{palabras}}` se sustituye por el resultado con ese id (por ejemplo `variables: { palabras: "total" }`), para escribir «La página contó {{palabras}} palabras en tus datos. No vuelvas a contarlas.». Todo pre-proceso lleva al menos 3 casos de prueba que ejecutan el validador, `npm test` y `npm run qa`.

`contarPalabras()` (`lib/texto/contar-palabras.ts`) es la única función de conteo. **Qué cuenta como palabra:** cada trozo separado por espacios o saltos de línea que contiene al menos una letra o un número. Cuentan «$6», «7:00», «13:00», «2», «1.500», «Av.», «pan-dulce» (1 cada una); **no** cuentan «·», «—», «-», «&» ni «…» solos; «7 : 00» son 2. Sirve para las palabras editoriales de cada página y para límites de texto como el de los afiches («menos de 40 palabras» = máximo 39; «Tus datos suman X palabras (máximo 39)» en vivo, con aviso que no bloquea).

## Plantilla de proceso (herramienta + guía corta, versión «proceso»)
Referencia: `content/herramientas/marketing/crear-afiches-con-ia.ts`. Para convertir otra herramienta, añade estos campos **opcionales** (si faltan, la página se ve como siempre):

- `resultadoFinal: [{ id, titulo, descripcion, icono?, captura? }]` — «Lo que vas a tener» (≥ 3). Iconos: texto, afiche, movil, mockup, mensaje, imprimir.
- `problema: [{ titulo, texto }]` — exactamente 3 errores típicos.
- `necesitas: [{ nombre, para, obligatorio, alternativa? }]` — ≥ 3, alguno obligatorio.
- `pasos: [{ numero, titulo, tiempo: "2 min", queHaces, opciones?, prompt?, promptMaestro?, avisos?, comprobar?, muestraEstadoDatos?, mostrarMejoras?, sinOpciones?, asiSabesQueSalioBien: string[], siAlgoFalla: string[], resultado }]` — numerados 1, 2, 3… Con `promptMaestro: true` el paso enseña el prompt completo de la herramienta (reglas comunes + datos + `tarea`); un solo paso puede llevarlo. `opciones: [{ id, titulo, texto, prompt?, mostrarSi?, primeraSi?, notas?, avisos?, destino? }]`.
- `kitFinal: [{ id, texto, mostrarSi? }]` — lista marcable (≥ 3).
- `tituloRevision` («Revisa antes de imprimir»), `meta.herramientasExtra` («Canva») y la `nota` de una imagen (por ejemplo, la de `prueba-01`: sale bajo la imagen cuando existe).
- Campos nuevos del formulario: `tipo: "casillas"` (varias opciones marcables; el valor es la lista unida con «; »), además de `seleccion` como siempre.

**Kit final = las entregas de «Lo que vas a tener».** Los ítems del kit usan los mismos `id` que `resultadoFinal` (más los que hagan falta, como la prueba impresa). Los que dependen de una casilla del formulario llevan `mostrarSi` y **siempre** incluyen `|!campo`, para que con el formulario vacío se vean todos; «X de N listos» cuenta solo los visibles (`resumenKit`).

**«Si algo falla» con correcciones.** `siAlgoFalla` acepta textos o `{ texto, correcciones: [{ etiqueta, prompt, mostrarSi?, destino? }] }`. Cada salida que pide escribirle algo a la IA lleva sus correcciones: plantillas rellenas con los datos del formulario (`{{n1}}`, `{{precio}}`…) y un botón «Copiar corrección» de 44 px (mismo `BotonCopiar`, con la alternativa si falla el portapapeles).

**Lista de revisión (`comprobar`).** El paso muestra un ítem por dato con su valor exacto y una casilla, y «X de N comprobados» (N cuenta solo los datos con texto). Lo marcado vive solo en el navegador y recuerda el valor comprobado: si cambias el dato, la casilla se desmarca sola.

**Descarga.** Al final de «El proceso» hay «Descargar mis datos y prompts (.txt)»: `lib/herramientas/descarga.ts` arma el texto (fecha, datos, perfil y los prompts que se ven en cada paso) y el navegador lo descarga como Blob. No se envía nada al servidor.

**Registro de la prueba real.** `ejemplo.pasos: [{ paso, hizoLaIA, hiceYo, tiempo }]` y `ejemplo.tiempoTotal` los escribe el autor con su prueba real (nunca se inventan); vacíos, no se muestra nada ni en producción. El validador exige `probadoEn` y `probadoFecha` si están llenos y no los cuenta como palabras editoriales.

**Plantillas de prompt** (`lib/herramientas/plantillas.ts`, la misma sintaxis en `tarea`, `paso.prompt` y `opcion.prompt`): `{{id}}` (campo; [FALTA: etiqueta] si es requerido y está vacío), `{{id|texto de reserva}}`, `{{perfil.nombre|mi negocio}}` (dato del perfil; solo los de `usaPerfil`), `{{variable}}` (lo que calcula la página: `preproceso.variables`) y `{{#si condición}}…{{/si}}` sin anidar. Condiciones: `campo=Valor`, `campo~Opción` (casillas), `campo` (tiene texto), `!campo`, `perfil.rubro`, y «|» para O. El validador comprueba que todo lo citado existe, que los valores de una condición son opciones reales del campo y que el resultado no lleva llaves.

**Etiquetas de imagen:** `Prueba real` (solo chats con una IA), `Captura de la herramienta` (captura de nuestra propia página), `Ilustración`, `Simulación` y `Foto generada con IA` (estas dos exigen una leyenda o una descripción que diga «generada con IA»), `Resultado final diseñado con el texto de la IA`. Las imágenes de un proceso llevan la ubicación `paso-N` (la evidencia se muestra bajo «Paso N · título»). Ver «Imágenes» más abajo.

**Estado compartido:** `ProveedorHerramienta` (client) guarda los valores del formulario, el perfil, las variables y el prompt; el formulario, los pasos y el kit lo leen. La lógica pura y probada está en `lib/herramientas/proceso.ts` (opciones visibles y su orden, ítems del kit, líneas de «Qué corregí yo»). Los botones Copiar de una página con varios prompts llevan un `aria-label` distinto («Copiar prompt del paso 3: B) Con una IA de imagen»).

**Al migrar una herramienta:** empieza por los pasos (¿qué hace la persona de principio a fin?), deja a la IA solo lo que hace bien y a la página lo que puede contar o calcular. Mantén 1.800–2.500 palabras editoriales *contando* las leyendas de las capturas y «Qué corregí yo» ya publicados (deja margen: al publicar se suman unas 100–150 palabras).

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

## Imágenes: espacios definidos en los datos, detectados solos
Una sola lista por página, `imagenes`, sustituye a `ejemplo.capturas`, `metodoCompleto.capturas` y `capturasPendientes`:

```ts
imagenes: [
  {
    id: "prueba-01",            // único en la página
    archivo: "prueba-01",       // nombre SIN extensión: public/img/{area}/{slug}/prueba-01.webp (o .png, o .jpg)
    etiqueta: "Prueba real",    // solo las válidas (abajo)
    alt: "…",                   // obligatorio, ≥ 25 caracteres
    leyenda: "…",               // visible bajo la imagen y en el visor
    ubicacion: "paso-2",        // o ["paso-4", "resultado-afiche"] (ver abajo)
    obligatoria: true,          // publicada + falta = el build falla
    nota: "…",                  // opcional: sale bajo la imagen (solo si existe)
    titulo: "…",                // opcional: título del recuadro de vista previa
    proporcion: "16:10",        // opcional: proporción del recuadro (por defecto 16:10)
  },
],
```

- **Detección (al construir, en el servidor):** para cada espacio se busca `public/img/{area}/{slug}/{archivo}.webp`, luego `.png` y luego `.jpg`; se leen el ancho y el alto reales del archivo y se muestra con `next/image`. Si hay varias extensiones con el mismo nombre gana `.webp` y el validador avisa. **No hay que tocar el archivo de datos al añadir una imagen.** (`lib/herramientas/imagenes.ts`, `lib/imagenes/dimensiones.ts`.)
- **Ubicaciones:** `preparacion`, `paso-2`…`paso-5` (evidencia de un paso del proceso: se ve en «Un ejemplo, paso a paso» bajo «Paso N · título»), `ejemplo` (páginas simples), `metodo-completo` y `resultado-{id}` (la tarjeta de «Lo que vas a tener» con ese id). Una imagen puede ir en dos sitios (`["paso-4", "resultado-afiche"]`) y se dibuja en ambos.
- **Si el archivo no existe:** un borrador (`publicado: false`) con `next dev` o `MOSTRAR_BORRADORES=true` dibuja un recuadro punteado con la proporción esperada, un icono, el título, la etiqueta prevista y el nombre del archivo; sin vista previa no dibuja nada. Una página publicada **nunca** dibuja un recuadro: si falta una imagen `obligatoria` el build falla con un error claro, y si falta una opcional no se ve nada (`estadoDeEspacio` en `lib/herramientas/vista-previa.ts`).
- **Lupa:** todas las imágenes se amplían al hacer clic (`components/guide/zoomable-image.tsx`): visor a pantalla completa con la etiqueta y la leyenda, zoom con + y −, doble clic o doble toque, rueda y pellizco, arrastrar para moverse, cierre con Esc, con la X (44 px) o tocando fuera, foco atrapado y devuelto a la imagen. La imagen grande se pide solo al abrir.
- **Etiquetas válidas:** `Prueba real` (solo capturas de chats con una IA), `Captura de la herramienta`, `Ilustración`, `Simulación`, `Foto generada con IA` (estas dos exigen una leyenda que diga «generada con IA») y `Resultado final diseñado con el texto de la IA`.
- **Transcripción (opcional):** `ejemplo.transcripcion` es la respuesta completa de la IA copiada del MISMO chat de la captura «Prueba real»; se muestra en un desplegable y solo con la prueba real (IA y fecha).
- `npm run capturas` lista, por página, cada espacio con su estado (puesta con su tamaño real, falta obligatoria, falta opcional) y avisa si una imagen mide menos de 1.200 px de ancho (1.080 si es vertical) o si hay más de una extensión con el mismo nombre.
- **Regla de publicación:** `publicado: true` exige que existan todas las imágenes `obligatoria: true`, al menos una «Prueba real» con archivo y 1–2 imágenes en el ejemplo (hasta 8 en un proceso: las que sobren, a `metodo-completo`). El texto de `alt`, la leyenda y la nota no cuentan como palabras editoriales.
