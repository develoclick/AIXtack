# Cómo publicar una herramienta

Una herramienta está en `publicado: false` hasta que tiene su **prueba real**. Las imágenes ya no se registran una a una: cada página declara sus **espacios de imagen** (`imagenes` en su archivo de datos) y la web pone sola cada archivo en su sitio.

## La regla de las imágenes

**Guarda la imagen con su nombre en `public/img/{area}/{slug}/`, haz `git add`, `commit` y `push`, y aparece sola.**

- El nombre es el del espacio, **sin tocar el archivo de datos**. Vale `.webp` (mejor), `.png` o `.jpg`; si hay varios con el mismo nombre gana `.webp` y `npm run capturas` te avisa.
- La web lee el ancho y el alto reales, usa la etiqueta, el `alt` y la leyenda ya escritos, y la imagen se amplía al hacer clic (lupa).
- Si el archivo aún no existe: en una página en borrador (`publicado: false`) y con `npm run dev` (o `MOSTRAR_BORRADORES=true`) ves un recuadro punteado con el nombre del archivo y lo que debe mostrar. En una página publicada **nunca** se ve un recuadro: si falta una imagen obligatoria el build falla con un error claro; si falta una opcional, simplemente no se muestra.
- Para saber qué falta: `npm run capturas` (lista cada espacio con su estado y avisa si una imagen mide menos de 1.200 px de ancho).

### Nombres de los afiches (`public/img/marketing/crear-afiches-con-ia/`)

| Archivo (sin extensión) | Etiqueta | Dónde aparece | ¿Obligatoria? | Qué debe mostrar |
|---|---|---|---|---|
| `prep-01` | Captura de la herramienta | Preparación | Sí | El formulario relleno, con el contador en 39 palabras |
| `prueba-01` | Prueba real | Paso 2 | Sí | El chat con el prompt y la respuesta a «De dónde sale cada dato» |
| `prueba-02` | Prueba real | Paso 3 | No | La segunda respuesta de la IA (afiche y correcciones) |
| `afiche-final` | Resultado final diseñado con el texto de la IA | Paso 4 y «Lo que vas a tener» | Sí | El afiche terminado (vertical 210:297) |
| `mockup-vitrina` | Simulación | Paso 5 y «Lo que vas a tener» | Sí | El afiche en una vitrina, generado con IA (4:3) |
| `estado-9x16` | Resultado final diseñado con el texto de la IA | Paso 5 y «Lo que vas a tener» | No | La versión para estados de WhatsApp (9:16) |

La lista de cada página está en su archivo de datos (`imagenes`), y el detalle de cada campo en `docs/herramientas-guia-tecnica.md`.

## 1. Haz la prueba y guarda las imágenes
1. En un chat nuevo de la IA, pulsa «Probar con un ejemplo» → «Copiar prompt» y pégalo. Anota **qué IA** usaste y **la fecha**.
2. Haz las capturas sin editar (Win+Shift+S, zoom al 125 %, 1.200 px de ancho o más) y guárdalas con el nombre de la tabla.
3. Comprueba que la **nota** de una imagen (por ejemplo la de `prueba-01`: «La IA cambió «·» por «—» en el nivel 3; lo corregí.») coincide con lo que de verdad pasó en tu captura. Si no coincide, corrígela o bórrala en el archivo de datos: es lo único de la imagen que se edita a mano.
4. Escribe **tres líneas** de «Qué corregí yo»: lo que cambiaste de verdad en la respuesta de la IA (se pasan con `--corregi`).
5. En una página de proceso, rellena «Quién hizo qué»: en `ejemplo.pasos` una fila por paso con `{ paso, hizoLaIA, hiceYo, tiempo }` y en `ejemplo.tiempoTotal` el tiempo total. Escribe **lo que de verdad pasó y los tiempos que mediste**.
6. (Opcional) Pega la **respuesta completa de la IA** del mismo chat en `ejemplo.transcripcion`: la página la enseña en un desplegable. Tiene que ser el texto tal como salió.

## 2. Publica
```bash
npm run publicar -- marketing/crear-afiches-con-ia --ia "ChatGPT" --fecha 2026-09-20 --corregi "La IA inventó un teléfono y lo quité" "Acorté el titular a menos de 8 palabras" "Cambié el tono, que era demasiado formal"
```

`npm run publicar` **ya no pregunta rutas de imágenes**. Sigue pidiendo `--ia`, `--fecha`, `--corregi` y, en un proceso, los datos de `ejemplo.pasos` y `ejemplo.tiempoTotal`. En este orden:
1. Comprueba que existen todas las imágenes `obligatoria: true` (y la `og.webp`), que se pueden leer y, en un proceso, que `ejemplo.pasos` y `ejemplo.tiempoTotal` están rellenados. Si falta algo, te dice qué archivo (con su ruta) y qué debe mostrar, y **no cambia nada**. Las opcionales no bloquean.
2. Rellena `probadoEn`, `probadoFecha`, `actualizado` y «Qué corregí yo». No toca `imagenes`.
3. Ejecuta el validador (como página publicada), `npm test`, `npm run build` y `npm run qa` de esa página (375 px y 1280 px, incluida la lupa).
4. **Solo si todo pasa**: pone `publicado: true` y hace **un commit local** («Publica …: probado por Nicolas en …»). **No hace push.** Si algo falla, el archivo de datos queda como estaba y `publicado` sigue en `false`.

Opciones: `--comprobar` hace todo lo anterior (incluidos el build y el QA) pero **no deja ningún cambio ni hace commit**: sirve para ver qué falta. La carpeta de trabajo debe estar limpia (salvo las imágenes de esa herramienta).

## 3. Después
- Revisa el commit (`git show`) y abre la página en `npm run dev`.
- Sube cuando quieras (`git push`). Las herramientas publicadas entran solas en `/herramientas`, en su área y en el sitemap; un área y `/herramientas` dejan de ser `noindex` en cuanto tienen al menos una publicada.
- Una herramienta publicada solo enseña como «Siguiente paso» las relacionadas que también estén publicadas.

## Reglas que hacen fallar la publicación
`publicado: true` exige: 1.500–2.500 palabras editoriales (el `alt`, la leyenda y la nota de las imágenes no cuentan), `meta.descripcion` de 140–160 caracteres, su propia `og.webp`, `probadoEn` y `probadoFecha`, todas las imágenes obligatorias con su archivo, al menos una «Prueba real» con archivo, entre 1 y 2 imágenes en el ejemplo de una página simple (hasta 8 en un proceso), «Qué corregí yo» con 3 líneas, las secciones de la plantilla completas, sin notas de producción ni promesas absolutas.
