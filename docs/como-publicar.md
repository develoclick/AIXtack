# Cómo publicar una herramienta

Una herramienta está en `publicado: false` hasta que tiene su **prueba real**. Cuando ya hiciste la prueba con una IA y tienes las capturas, se publica con un solo comando.

## 1. Haz la prueba y guarda las capturas
1. Abre la herramienta (con `npm run dev` verás, en el bloque «Un ejemplo, paso a paso», un recuadro gris por cada captura pendiente con el nombre del archivo y lo que debe mostrar). También lo lista `npm run capturas`.
2. En un chat nuevo de la IA, pulsa «Probar con un ejemplo» → «Copiar prompt» y pégalo. Anota **qué IA** usaste y **la fecha**.
3. Haz la captura sin editar (Win+Shift+S, zoom al 125 %, 1.200 px de ancho o más) y guárdala como `.webp` en `public/img/{área}/{slug}/` con el nombre esperado (por ejemplo `prueba-01.webp`).
4. Escribe **tres líneas** de «Qué corregí yo»: lo que cambiaste de verdad en la respuesta de la IA.

## 2. Publica
```bash
npm run publicar -- marketing/crear-afiches-con-ia --ia "ChatGPT" --fecha 2026-09-20 --corregi "La IA inventó un teléfono y lo quité" "Acorté el titular a menos de 8 palabras" "Cambié el tono, que era demasiado formal"
```

El comando, en este orden:
1. Comprueba que existen los archivos de `capturasPendientes` (y la `og.webp` de la página). Si falta alguno, te dice cuál y qué debe mostrar, y **no cambia nada**.
2. Lee el ancho y el alto reales de cada captura y las pasa de `capturasPendientes` a `ejemplo.capturas` con la etiqueta prevista y un `alt` y una `leyenda` por defecto (edítalos después en el archivo de datos si quieres).
3. Rellena `probadoEn`, `probadoFecha`, `actualizado` y «Qué corregí yo» (en la ficha de anuncios y promociones, las capturas del método anterior que ya no caben pasan al «método completo»).
4. Ejecuta el validador (como página publicada), `npm test`, `npm run build` y `npm run qa` de esa página (375 px y 1280 px).
5. **Solo si todo pasa**: pone `publicado: true` y hace **un commit local** («Publica …: probado por Nicolas en …»). **No hace push.** Si algo falla, el archivo de datos queda como estaba, `publicado` sigue en `false` y el comando imprime exactamente qué falta o qué falló.

Opciones: `--comprobar` hace todo lo anterior (incluidos el build y el QA) pero **no deja ningún cambio ni hace commit**: sirve para ver qué falta antes de subir nada. La carpeta de trabajo debe estar limpia (salvo las imágenes de esa herramienta).

## 3. Después
- Revisa el commit (`git show`), abre la página en `npm run dev` y cambia a mano el `alt` y la `leyenda` si quieres mejorarlos.
- Sube cuando quieras (`git push`). Las herramientas publicadas entran solas en `/herramientas`, en su área y en el sitemap; un área y `/herramientas` dejan de ser `noindex` en cuanto tienen al menos una publicada.
- Una herramienta publicada solo enseña como «Siguiente paso» las relacionadas que también estén publicadas.

## Reglas que hacen fallar la publicación
`publicado: true` exige: 1.500–2.500 palabras editoriales, `meta.descripcion` de 140–160 caracteres, su propia `og.webp`, `probadoEn` y `probadoFecha`, entre 1 y 2 capturas en el ejemplo con al menos una «Prueba real», 0 capturas pendientes, «Qué corregí yo» con 3 líneas, las secciones de la plantilla completas, sin notas de producción ni promesas absolutas.
