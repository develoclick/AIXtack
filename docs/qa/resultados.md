# Recorrido interactivo (Playwright, build de producción)

Generado con `npm run qa` contra http://localhost:3100 (Chrome del sistema, 375 px y 1280 px). 680 pruebas: 680 OK, 0 FALLA.

| Página | Vista (px) | Prueba | Resultado | Detalle |
|---|---|---|---|---|
| / | 375 | sin scroll horizontal | OK | 375/375 |
| / | 375 | botones y controles ≥ 44 px | OK |  |
| / | 375 | foco visible con Tab | OK | 23 controles; sin contorno: ninguno |
| / | 375 | mensaje directo en el H1 y sin «min de lectura» | OK | Elige la tarea, llena unos datos y copia el prompt |
| / | 375 | «Ver las herramientas» lleva a /herramientas (200) | OK |  |
| / | 375 | 0 errores en consola | OK |  |
| /mi-negocio | 375 | sin scroll horizontal | OK | 375/375 |
| /mi-negocio | 375 | botones y controles ≥ 44 px | OK |  |
| /mi-negocio | 375 | foco visible con Tab | OK | 28 controles; sin contorno: ninguno |
| /mi-negocio | 375 | guardar el perfil completo | OK |  |
| /mi-negocio | 375 | el perfil persiste al recargar | OK |  |
| /mi-negocio | 375 | borrar el perfil | OK |  |
| /mi-negocio | 375 | 0 errores en consola | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | perfil: guardar muestra «Guardado en este navegador ✓» | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | perfil: queda en localStorage (solo en el navegador) | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | perfil: aparece el texto «Tus datos se guardan solo en este navegador» | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | perfil: el nombre viaja en el prompt de la misma herramienta | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | perfil: se autocompleta en otra herramienta | OK | valor: «Negocio de Prueba QA» |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | perfil: el prompt de la otra herramienta lleva el nombre guardado | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | perfil: «Borrar mis datos» vacía el formulario y el almacenamiento | OK | almacenamiento: null |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | perfil: 0 errores en consola | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | localStorage bloqueado: guardar no rompe y avisa | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | localStorage bloqueado: el perfil vive en memoria y llega al prompt | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | localStorage bloqueado: «Copiar prompt» funciona | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 375 | localStorage bloqueado: 0 errores en consola | OK |  |
| /analisis/analizar-ventas-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /analisis/analizar-ventas-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /analisis/analizar-ventas-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /analisis/analizar-ventas-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 4 obligatorios |
| /analisis/analizar-ventas-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 5 controles con valor, 5 esperados |
| /analisis/analizar-ventas-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 5 de 5 |
| /analisis/analizar-ventas-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /analisis/analizar-ventas-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /analisis/analizar-ventas-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /analisis/analizar-ventas-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4943 caracteres copiados |
| /analisis/analizar-ventas-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /analisis/analizar-ventas-con-ia | 375 | conteo de la página · Verde Hogar: agosto y septiembre (14 ventas) | OK | 13 conteos coinciden con la lógica probada |
| /analisis/analizar-ventas-con-ia | 375 | conteo de la página · Coma como separador, sin títulos y con fechas DD/MM/AAAA | OK | 9 conteos coinciden con la lógica probada |
| /analisis/analizar-ventas-con-ia | 375 | conteo de la página · Una línea mal formada se descarta y no se suma | OK | con datos que no se entienden, la página muestra el aviso y no ofrece conteos (ni los envía al prompt) |
| /analisis/analizar-ventas-con-ia | 375 | 0 errores en consola | OK |  |
| /analisis/analizar-ventas-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /analisis/analizar-ventas-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /analisis/analizar-ventas-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4873 caracteres |
| /analisis/analizar-ventas-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /analisis/calcular-punto-de-equilibrio | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /analisis/calcular-punto-de-equilibrio | 375 | botones y controles ≥ 44 px | OK |  |
| /analisis/calcular-punto-de-equilibrio | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /analisis/calcular-punto-de-equilibrio | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 2 obligatorios |
| /analisis/calcular-punto-de-equilibrio | 375 | «Probar con un ejemplo» llena el formulario | OK | 10 controles con valor, 10 esperados |
| /analisis/calcular-punto-de-equilibrio | 375 | cada campo recibe su valor de ejemplo | OK | 3 de 3 |
| /analisis/calcular-punto-de-equilibrio | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /analisis/calcular-punto-de-equilibrio | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /analisis/calcular-punto-de-equilibrio | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /analisis/calcular-punto-de-equilibrio | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3835 caracteres copiados |
| /analisis/calcular-punto-de-equilibrio | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /analisis/calcular-punto-de-equilibrio | 375 | calculadora · Café Mirador (ficticio) | OK | 7 resultados coinciden |
| /analisis/calcular-punto-de-equilibrio | 375 | calculadora · Resultado exacto: 250 unidades | OK | 6 resultados coinciden |
| /analisis/calcular-punto-de-equilibrio | 375 | calculadora · Redondeo hacia arriba: 500.5 pasa a 501 | OK | 4 resultados coinciden |
| /analisis/calcular-punto-de-equilibrio | 375 | calculadora · El costo variable iguala al precio: no hay punto de equilibrio | OK | 1 resultados coinciden |
| /analisis/calcular-punto-de-equilibrio | 375 | 0 errores en consola | OK |  |
| /analisis/calcular-punto-de-equilibrio | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /analisis/calcular-punto-de-equilibrio | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /analisis/calcular-punto-de-equilibrio | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3791 caracteres |
| /analisis/calcular-punto-de-equilibrio | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /clientes/analizar-opiniones-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /clientes/analizar-opiniones-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /clientes/analizar-opiniones-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /clientes/analizar-opiniones-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 4 obligatorios |
| /clientes/analizar-opiniones-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 5 controles con valor, 5 esperados |
| /clientes/analizar-opiniones-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 5 de 5 |
| /clientes/analizar-opiniones-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/analizar-opiniones-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /clientes/analizar-opiniones-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /clientes/analizar-opiniones-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 5664 caracteres copiados |
| /clientes/analizar-opiniones-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/analizar-opiniones-con-ia | 375 | conteo de la página · Las 25 reseñas ficticias de La Higuera | OK | 8 conteos coinciden con la lógica probada |
| /clientes/analizar-opiniones-con-ia | 375 | conteo de la página · Una reseña con dos temas cuenta en los dos; lo que no encaja queda «sin tema» | OK | 5 conteos coinciden con la lógica probada |
| /clientes/analizar-opiniones-con-ia | 375 | conteo de la página · Tildes y mayúsculas no importan; una reseña con dos palabras del mismo tema cuenta una vez | OK | 3 conteos coinciden con la lógica probada |
| /clientes/analizar-opiniones-con-ia | 375 | 0 errores en consola | OK |  |
| /clientes/analizar-opiniones-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /clientes/analizar-opiniones-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /clientes/analizar-opiniones-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 5585 caracteres |
| /clientes/analizar-opiniones-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /clientes/responder-consultas-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /clientes/responder-consultas-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /clientes/responder-consultas-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /clientes/responder-consultas-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 3 obligatorios |
| /clientes/responder-consultas-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 4 controles con valor, 4 esperados |
| /clientes/responder-consultas-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 4 de 4 |
| /clientes/responder-consultas-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/responder-consultas-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /clientes/responder-consultas-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /clientes/responder-consultas-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3619 caracteres copiados |
| /clientes/responder-consultas-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/responder-consultas-con-ia | 375 | 0 errores en consola | OK |  |
| /clientes/responder-consultas-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /clientes/responder-consultas-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /clientes/responder-consultas-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3583 caracteres |
| /clientes/responder-consultas-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /clientes/responder-reclamos-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /clientes/responder-reclamos-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /clientes/responder-reclamos-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /clientes/responder-reclamos-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 6 obligatorios |
| /clientes/responder-reclamos-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 8 controles con valor, 8 esperados |
| /clientes/responder-reclamos-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 8 de 8 |
| /clientes/responder-reclamos-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/responder-reclamos-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /clientes/responder-reclamos-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /clientes/responder-reclamos-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4680 caracteres copiados |
| /clientes/responder-reclamos-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/responder-reclamos-con-ia | 375 | 0 errores en consola | OK |  |
| /clientes/responder-reclamos-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /clientes/responder-reclamos-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /clientes/responder-reclamos-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4639 caracteres |
| /clientes/responder-reclamos-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/calendario-de-contenido-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /marketing/calendario-de-contenido-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /marketing/calendario-de-contenido-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/calendario-de-contenido-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 4 obligatorios |
| /marketing/calendario-de-contenido-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 11 controles con valor, 11 esperados |
| /marketing/calendario-de-contenido-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 6 de 6 |
| /marketing/calendario-de-contenido-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/calendario-de-contenido-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/calendario-de-contenido-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/calendario-de-contenido-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4643 caracteres copiados |
| /marketing/calendario-de-contenido-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/calendario-de-contenido-con-ia | 375 | calculadora · Mesa Larga (ficticio): 3 horas, 4 publicaciones por semana | OK | 8 resultados coinciden |
| /marketing/calendario-de-contenido-con-ia | 375 | calculadora · No cabe: 2 horas para 4 publicaciones | OK | 5 resultados coinciden |
| /marketing/calendario-de-contenido-con-ia | 375 | calculadora · Justo: 1 hora, sin reserva, 3 publicaciones de 20 minutos | OK | 5 resultados coinciden |
| /marketing/calendario-de-contenido-con-ia | 375 | calculadora · Sin indicar la reserva se aplica el 20 % | OK | 2 resultados coinciden |
| /marketing/calendario-de-contenido-con-ia | 375 | 0 errores en consola | OK |  |
| /marketing/calendario-de-contenido-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/calendario-de-contenido-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/calendario-de-contenido-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4595 caracteres |
| /marketing/calendario-de-contenido-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/crear-afiches-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /marketing/crear-afiches-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /marketing/crear-afiches-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/crear-afiches-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 7 obligatorios |
| /marketing/crear-afiches-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 10 controles con valor, 10 esperados |
| /marketing/crear-afiches-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 10 de 10 |
| /marketing/crear-afiches-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-afiches-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/crear-afiches-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/crear-afiches-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4232 caracteres copiados |
| /marketing/crear-afiches-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-afiches-con-ia | 375 | proceso: los bloques salen en el orden de la plantilla | OK | resultado › problema › necesitas › herramienta › proceso › kit › ejemplo › revision › por-que-funciona › rubros › errores › faq › verificacion |
| /marketing/crear-afiches-con-ia | 375 | proceso: etiquetas «15 min · Gratis · ChatGPT, Gemini o Claude + Canva» | OK | 15 min / Gratis / ChatGPT, Gemini o Claude + Canva |
| /marketing/crear-afiches-con-ia | 375 | proceso: 5 pasos numerados («Paso 1 de 5») con su tiempo | OK | PASO 1 DE 5 · 2 MIN |
| /marketing/crear-afiches-con-ia | 375 | proceso: ningún recuadro de captura pendiente en producción | OK | 0 |
| /marketing/crear-afiches-con-ia | 375 | paso 3: con «Canva» va primero Canva | OK | ["canva","ia-imagen"] |
| /marketing/crear-afiches-con-ia | 375 | paso 3: con «IA de imagen» va primero la IA de imagen | OK | ["ia-imagen","canva"] |
| /marketing/crear-afiches-con-ia | 375 | paso 3: con «Aún no sé» va primero Canva y se recomienda como la más segura | OK | A) En Canva
Recomendada si aún no sabes: es la opción más segura, porque el text |
| /marketing/crear-afiches-con-ia | 375 | foto real: «Sí» → «usa la foto que adjunto, sin alterar el producto»; «No» → imagen de apoyo generada | OK |  |
| /marketing/crear-afiches-con-ia | 375 | foto real «Sí»: desaparece el aviso de imagen generada con IA | OK |  |
| /marketing/crear-afiches-con-ia | 375 | foto real «No»: el paso 3 avisa que se indique que es generada con IA | OK |  |
| /marketing/crear-afiches-con-ia | 375 | paso 5: con A4 + 9:16 solo salen imprimir, mockup, 9:16 y el mensaje | OK | ["imprimir","mockup","vertical","mensaje"] |
| /marketing/crear-afiches-con-ia | 375 | paso 5: sin formatos marcados no hay salidas y se pide marcar uno | OK |  |
| /marketing/crear-afiches-con-ia | 375 | paso 5: con 1:1 salen la versión cuadrada y el mensaje | OK | ["cuadrado","mensaje"] |
| /marketing/crear-afiches-con-ia | 375 | formatos: el ejemplo vuelve a A4 + 9:16 | OK |  |
| /marketing/crear-afiches-con-ia | 375 | cada botón Copiar (5) copia exactamente su prompt, sin {{ }}, undefined, null ni NaN | OK | 5 prompts |
| /marketing/crear-afiches-con-ia | 375 | los botones Copiar tienen nombres accesibles distintos | OK | Copiar prompt del paso 2: El texto de tu afiche / Copiar prompt del paso 3: B) Con una IA de imagen / Copiar prompt del paso 5: Mockup en la vitrina (simulación) / Copiar prompt del paso 5: Versión 9:16 para estado o historia / Copiar prompt del paso 5: Mensaje para enviar el afiche por WhatsApp |
| /marketing/crear-afiches-con-ia | 375 | paso 3B: el prompt de la IA de imagen lleva los cuatro niveles exactos | OK | Crea un afiche vertical tamaño A4 para mi negocio. Usa EXACTAMENTE este texto, sin cambiar, añadir n |
| /marketing/crear-afiches-con-ia | 375 | paso 4: la lista trae el precio, los días, el lugar y las condiciones tal como los escribiste | OK |  |
| /marketing/crear-afiches-con-ia | 375 | «Si algo falla» es plegable y se abre | OK |  |
| /marketing/crear-afiches-con-ia | 375 | «Si algo falla»: 9 botones «Copiar corrección» (≥ 44 px) copian su texto ya relleno, sin llaves | OK | 9 correcciones |
| /marketing/crear-afiches-con-ia | 375 | correcciones: nivel 1 exacto, precio y «mismo texto del afiche original» | OK | Corrige el nivel 1: debe decir exactamente «Combo de fin de semana: 6 panes y 1  |
| /marketing/crear-afiches-con-ia | 375 | paso 4: una casilla por cada dato del formulario (6) y «0 de 6 comprobados» | OK | 6 casillas |
| /marketing/crear-afiches-con-ia | 375 | paso 4: marcar dos datos da «2 de 6 comprobados» | OK |  |
| /marketing/crear-afiches-con-ia | 375 | paso 4: si cambias el precio, su casilla se desmarca sola («1 de 6») | OK |  |
| /marketing/crear-afiches-con-ia | 375 | paso 4: con el precio original la marca vuelve («2 de 6») | OK |  |
| /marketing/crear-afiches-con-ia | 375 | paso 4: lo comprobado se recuerda al recargar (2 de 6) | OK |  |
| /marketing/crear-afiches-con-ia | 375 | paso 4: con el formulario vacío no hay nada que comprobar («0 de 0») ni casillas | OK |  |
| /marketing/crear-afiches-con-ia | 375 | descarga (.txt): botón de 44 px, nombre con la fecha y aclaración «no lo recibimos» | OK | crear-afiches-con-ia-2026-09-25.txt · 44 px |
| /marketing/crear-afiches-con-ia | 375 | descarga (.txt): lleva la fecha, los datos y los prompts de los 5 pasos, sin llaves | OK | 8582 caracteres |
| /marketing/crear-afiches-con-ia | 375 | descarga (.txt): el archivo se crea en el navegador (blob) y no hace ninguna petición al servidor | OK |  |
| /marketing/crear-afiches-con-ia | 375 | kit final con «Probar con un ejemplo» (A4 + 9:16): salen las 6 entregas y «0 de 6 listos» | OK | 6 casillas · 0 de 6 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 375 | kit final sin formatos marcados: salen todas (6) y el contador coincide | OK | 6 · 0 de 6 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 375 | kit final con solo 1:1: 4 entregas (texto, afiche, versiones, mensaje), sin mockup ni prueba impresa | OK | 4 · 0 de 4 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 375 | kit final: marcar dos entregas da «2 de 4 listos» | OK | 2 de 4 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 375 | kit final con solo A4: 4 entregas (texto, afiche, mockup, prueba) y «X de 4» sin contar lo oculto | OK | 4 · 1 de 4 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 375 | kit final: lo marcado se recuerda al recargar (solo en este navegador) | OK |  |
| /marketing/crear-afiches-con-ia | 375 | kit final con localStorage bloqueado: se puede marcar y no hay errores | OK |  |
| /marketing/crear-afiches-con-ia | 375 | paso 4 y descarga con localStorage bloqueado: se marca («1 de 6»), se descarga y no hay errores | OK |  |
| /marketing/crear-afiches-con-ia | 375 | conteo de palabras · El caso de La Espiga (los datos de «Probar con un ejemplo») | OK | «Tus datos suman 39 palabras (máximo 39).»; el prompt trae el total |
| /marketing/crear-afiches-con-ia | 375 | conteo de palabras · Sin datos: cero palabras | OK | «Tus datos suman 0 palabras (máximo 39).»; el prompt trae el total |
| /marketing/crear-afiches-con-ia | 375 | conteo de palabras · Sin precio no se cuenta el «por» del titular | OK | «Tus datos suman 11 palabras (máximo 39).»; el prompt trae el total |
| /marketing/crear-afiches-con-ia | 375 | conteo de palabras · Se pasa del máximo: el aviso dice cuántas de más | OK | «Tus datos suman 49 palabras (máximo 39).» + aviso (no bloquea); el prompt trae el total |
| /marketing/crear-afiches-con-ia | 375 | 0 errores en consola | OK |  |
| /marketing/crear-afiches-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/crear-afiches-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/crear-afiches-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4192 caracteres |
| /marketing/crear-afiches-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/crear-anuncios-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /marketing/crear-anuncios-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /marketing/crear-anuncios-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/crear-anuncios-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 6 obligatorios |
| /marketing/crear-anuncios-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 7 controles con valor, 7 esperados |
| /marketing/crear-anuncios-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 7 de 7 |
| /marketing/crear-anuncios-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-anuncios-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/crear-anuncios-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/crear-anuncios-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3536 caracteres copiados |
| /marketing/crear-anuncios-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-anuncios-con-ia | 375 | 0 errores en consola | OK |  |
| /marketing/crear-anuncios-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/crear-anuncios-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/crear-anuncios-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3499 caracteres |
| /marketing/crear-anuncios-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/crear-promociones-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /marketing/crear-promociones-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /marketing/crear-promociones-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/crear-promociones-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 5 obligatorios |
| /marketing/crear-promociones-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 12 controles con valor, 12 esperados |
| /marketing/crear-promociones-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 6 de 6 |
| /marketing/crear-promociones-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-promociones-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/crear-promociones-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/crear-promociones-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3646 caracteres copiados |
| /marketing/crear-promociones-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-promociones-con-ia | 375 | calculadora · A · Combo de media mañana | OK | 7 resultados coinciden |
| /marketing/crear-promociones-con-ia | 375 | calculadora · B · Desayuno completo con 15 % | OK | 7 resultados coinciden |
| /marketing/crear-promociones-con-ia | 375 | calculadora · C · Tarjeta de 5 visitas, la 5.ª gratis | OK | 7 resultados coinciden |
| /marketing/crear-promociones-con-ia | 375 | calculadora · D · Ven acompañado (2.º croissant gratis) | OK | 6 resultados coinciden |
| /marketing/crear-promociones-con-ia | 375 | calculadora · Precio por debajo del costo | OK | 3 resultados coinciden |
| /marketing/crear-promociones-con-ia | 375 | 0 errores en consola | OK |  |
| /marketing/crear-promociones-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/crear-promociones-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/crear-promociones-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3603 caracteres |
| /marketing/crear-promociones-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 6 obligatorios |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 8 controles con valor, 8 esperados |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 8 de 8 |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3968 caracteres copiados |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | 0 errores en consola | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3930 caracteres |
| /marketing/crear-publicaciones-para-redes-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /negocio/documentar-procesos-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /negocio/documentar-procesos-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /negocio/documentar-procesos-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /negocio/documentar-procesos-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 5 obligatorios |
| /negocio/documentar-procesos-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 7 controles con valor, 7 esperados |
| /negocio/documentar-procesos-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 7 de 7 |
| /negocio/documentar-procesos-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /negocio/documentar-procesos-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /negocio/documentar-procesos-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /negocio/documentar-procesos-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3968 caracteres copiados |
| /negocio/documentar-procesos-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /negocio/documentar-procesos-con-ia | 375 | 0 errores en consola | OK |  |
| /negocio/documentar-procesos-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /negocio/documentar-procesos-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /negocio/documentar-procesos-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3926 caracteres |
| /negocio/documentar-procesos-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /negocio/organizar-tareas-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /negocio/organizar-tareas-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /negocio/organizar-tareas-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /negocio/organizar-tareas-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 1 obligatorios |
| /negocio/organizar-tareas-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 9 controles con valor, 9 esperados |
| /negocio/organizar-tareas-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 4 de 4 |
| /negocio/organizar-tareas-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /negocio/organizar-tareas-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /negocio/organizar-tareas-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /negocio/organizar-tareas-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4862 caracteres copiados |
| /negocio/organizar-tareas-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /negocio/organizar-tareas-con-ia | 375 | calculadora · Ana (Lavandería Brisa, ficticia): 45 minutos al día | OK | 8 resultados coinciden |
| /negocio/organizar-tareas-con-ia | 375 | calculadora · No caben: 30 minutos al día para 6 tareas | OK | 5 resultados coinciden |
| /negocio/organizar-tareas-con-ia | 375 | calculadora · Sin indicar la rutina se aparta la de 15 minutos | OK | 5 resultados coinciden |
| /negocio/organizar-tareas-con-ia | 375 | calculadora · Sin rutina (0 minutos) y una semana de un solo día | OK | 6 resultados coinciden |
| /negocio/organizar-tareas-con-ia | 375 | 0 errores en consola | OK |  |
| /negocio/organizar-tareas-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /negocio/organizar-tareas-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /negocio/organizar-tareas-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4807 caracteres |
| /negocio/organizar-tareas-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /ventas/calcular-precios-y-margenes | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /ventas/calcular-precios-y-margenes | 375 | botones y controles ≥ 44 px | OK |  |
| /ventas/calcular-precios-y-margenes | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /ventas/calcular-precios-y-margenes | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 2 obligatorios |
| /ventas/calcular-precios-y-margenes | 375 | «Probar con un ejemplo» llena el formulario | OK | 13 controles con valor, 13 esperados |
| /ventas/calcular-precios-y-margenes | 375 | cada campo recibe su valor de ejemplo | OK | 4 de 4 |
| /ventas/calcular-precios-y-margenes | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/calcular-precios-y-margenes | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /ventas/calcular-precios-y-margenes | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /ventas/calcular-precios-y-margenes | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3970 caracteres copiados |
| /ventas/calcular-precios-y-margenes | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/calcular-precios-y-margenes | 375 | calculadora · Galletería Migas: caja de 6 galletas | OK | 8 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 375 | calculadora · Los ingredientes suben 25 % | OK | 3 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 375 | calculadora · Se venden 100 unidades al mes | OK | 4 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 375 | calculadora · Las dos cosas a la vez | OK | 3 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 375 | calculadora · Solo materiales y margen (sin precio elegido ni competencia) | OK | 4 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 375 | 0 errores en consola | OK |  |
| /ventas/calcular-precios-y-margenes | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /ventas/calcular-precios-y-margenes | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /ventas/calcular-precios-y-margenes | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3926 caracteres |
| /ventas/calcular-precios-y-margenes | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /ventas/crear-cotizaciones-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /ventas/crear-cotizaciones-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /ventas/crear-cotizaciones-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /ventas/crear-cotizaciones-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 7 obligatorios |
| /ventas/crear-cotizaciones-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 20 controles con valor, 20 esperados |
| /ventas/crear-cotizaciones-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 11 de 11 |
| /ventas/crear-cotizaciones-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/crear-cotizaciones-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /ventas/crear-cotizaciones-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /ventas/crear-cotizaciones-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4473 caracteres copiados |
| /ventas/crear-cotizaciones-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/crear-cotizaciones-con-ia | 375 | calculadora · Maderas Rivera: cocina a medida | OK | 9 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 375 | calculadora · Un solo ítem, con impuesto y anticipo | OK | 7 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 375 | calculadora · Sin descuento, sin impuesto y sin anticipo | OK | 6 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 375 | calculadora · Descuento solo sobre los ítems marcados | OK | 6 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 375 | calculadora · El redondeo está solo en el anticipo: anticipo y saldo suman el total | OK | 3 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 375 | 0 errores en consola | OK |  |
| /ventas/crear-cotizaciones-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /ventas/crear-cotizaciones-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /ventas/crear-cotizaciones-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4422 caracteres |
| /ventas/crear-cotizaciones-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | sin scroll horizontal | OK | ancho de contenido 375 · ventana 375 |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | botones y controles ≥ 44 px | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 4 obligatorios |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | «Probar con un ejemplo» llena el formulario | OK | 6 controles con valor, 6 esperados |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | cada campo recibe su valor de ejemplo | OK | 6 de 6 |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | «Ver el prompt completo» muestra el prompt | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3797 caracteres copiados |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | 0 errores en consola | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | 0 errores de consola con el portapapeles sin API | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3760 caracteres |
| /ventas/crear-descripciones-de-productos-con-ia | 375 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| / | 1280 | sin scroll horizontal | OK | 1280/1280 |
| / | 1280 | botones y controles ≥ 44 px | OK |  |
| / | 1280 | foco visible con Tab | OK | 23 controles; sin contorno: ninguno |
| / | 1280 | mensaje directo en el H1 y sin «min de lectura» | OK | Elige la tarea, llena unos datos y copia el prompt |
| / | 1280 | «Ver las herramientas» lleva a /herramientas (200) | OK |  |
| / | 1280 | 0 errores en consola | OK |  |
| /mi-negocio | 1280 | sin scroll horizontal | OK | 1280/1280 |
| /mi-negocio | 1280 | botones y controles ≥ 44 px | OK |  |
| /mi-negocio | 1280 | foco visible con Tab | OK | 28 controles; sin contorno: ninguno |
| /mi-negocio | 1280 | guardar el perfil completo | OK |  |
| /mi-negocio | 1280 | el perfil persiste al recargar | OK |  |
| /mi-negocio | 1280 | borrar el perfil | OK |  |
| /mi-negocio | 1280 | 0 errores en consola | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | perfil: guardar muestra «Guardado en este navegador ✓» | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | perfil: queda en localStorage (solo en el navegador) | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | perfil: aparece el texto «Tus datos se guardan solo en este navegador» | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | perfil: el nombre viaja en el prompt de la misma herramienta | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | perfil: se autocompleta en otra herramienta | OK | valor: «Negocio de Prueba QA» |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | perfil: el prompt de la otra herramienta lleva el nombre guardado | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | perfil: «Borrar mis datos» vacía el formulario y el almacenamiento | OK | almacenamiento: null |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | perfil: 0 errores en consola | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | localStorage bloqueado: guardar no rompe y avisa | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | localStorage bloqueado: el perfil vive en memoria y llega al prompt | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | localStorage bloqueado: «Copiar prompt» funciona | OK |  |
| perfil (/analisis/analizar-ventas-con-ia → /analisis/calcular-punto-de-equilibrio) | 1280 | localStorage bloqueado: 0 errores en consola | OK |  |
| /analisis/analizar-ventas-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /analisis/analizar-ventas-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /analisis/analizar-ventas-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /analisis/analizar-ventas-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 4 obligatorios |
| /analisis/analizar-ventas-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 5 controles con valor, 5 esperados |
| /analisis/analizar-ventas-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 5 de 5 |
| /analisis/analizar-ventas-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /analisis/analizar-ventas-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /analisis/analizar-ventas-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /analisis/analizar-ventas-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4943 caracteres copiados |
| /analisis/analizar-ventas-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /analisis/analizar-ventas-con-ia | 1280 | conteo de la página · Verde Hogar: agosto y septiembre (14 ventas) | OK | 13 conteos coinciden con la lógica probada |
| /analisis/analizar-ventas-con-ia | 1280 | conteo de la página · Coma como separador, sin títulos y con fechas DD/MM/AAAA | OK | 9 conteos coinciden con la lógica probada |
| /analisis/analizar-ventas-con-ia | 1280 | conteo de la página · Una línea mal formada se descarta y no se suma | OK | con datos que no se entienden, la página muestra el aviso y no ofrece conteos (ni los envía al prompt) |
| /analisis/analizar-ventas-con-ia | 1280 | 0 errores en consola | OK |  |
| /analisis/analizar-ventas-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /analisis/analizar-ventas-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /analisis/analizar-ventas-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4873 caracteres |
| /analisis/analizar-ventas-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /analisis/calcular-punto-de-equilibrio | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /analisis/calcular-punto-de-equilibrio | 1280 | botones y controles ≥ 44 px | OK |  |
| /analisis/calcular-punto-de-equilibrio | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /analisis/calcular-punto-de-equilibrio | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 2 obligatorios |
| /analisis/calcular-punto-de-equilibrio | 1280 | «Probar con un ejemplo» llena el formulario | OK | 10 controles con valor, 10 esperados |
| /analisis/calcular-punto-de-equilibrio | 1280 | cada campo recibe su valor de ejemplo | OK | 3 de 3 |
| /analisis/calcular-punto-de-equilibrio | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /analisis/calcular-punto-de-equilibrio | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /analisis/calcular-punto-de-equilibrio | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /analisis/calcular-punto-de-equilibrio | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3835 caracteres copiados |
| /analisis/calcular-punto-de-equilibrio | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /analisis/calcular-punto-de-equilibrio | 1280 | calculadora · Café Mirador (ficticio) | OK | 7 resultados coinciden |
| /analisis/calcular-punto-de-equilibrio | 1280 | calculadora · Resultado exacto: 250 unidades | OK | 6 resultados coinciden |
| /analisis/calcular-punto-de-equilibrio | 1280 | calculadora · Redondeo hacia arriba: 500.5 pasa a 501 | OK | 4 resultados coinciden |
| /analisis/calcular-punto-de-equilibrio | 1280 | calculadora · El costo variable iguala al precio: no hay punto de equilibrio | OK | 1 resultados coinciden |
| /analisis/calcular-punto-de-equilibrio | 1280 | 0 errores en consola | OK |  |
| /analisis/calcular-punto-de-equilibrio | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /analisis/calcular-punto-de-equilibrio | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /analisis/calcular-punto-de-equilibrio | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3791 caracteres |
| /analisis/calcular-punto-de-equilibrio | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /clientes/analizar-opiniones-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /clientes/analizar-opiniones-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /clientes/analizar-opiniones-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /clientes/analizar-opiniones-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 4 obligatorios |
| /clientes/analizar-opiniones-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 5 controles con valor, 5 esperados |
| /clientes/analizar-opiniones-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 5 de 5 |
| /clientes/analizar-opiniones-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/analizar-opiniones-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /clientes/analizar-opiniones-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /clientes/analizar-opiniones-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 5664 caracteres copiados |
| /clientes/analizar-opiniones-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/analizar-opiniones-con-ia | 1280 | conteo de la página · Las 25 reseñas ficticias de La Higuera | OK | 8 conteos coinciden con la lógica probada |
| /clientes/analizar-opiniones-con-ia | 1280 | conteo de la página · Una reseña con dos temas cuenta en los dos; lo que no encaja queda «sin tema» | OK | 5 conteos coinciden con la lógica probada |
| /clientes/analizar-opiniones-con-ia | 1280 | conteo de la página · Tildes y mayúsculas no importan; una reseña con dos palabras del mismo tema cuenta una vez | OK | 3 conteos coinciden con la lógica probada |
| /clientes/analizar-opiniones-con-ia | 1280 | 0 errores en consola | OK |  |
| /clientes/analizar-opiniones-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /clientes/analizar-opiniones-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /clientes/analizar-opiniones-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 5585 caracteres |
| /clientes/analizar-opiniones-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /clientes/responder-consultas-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /clientes/responder-consultas-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /clientes/responder-consultas-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /clientes/responder-consultas-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 3 obligatorios |
| /clientes/responder-consultas-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 4 controles con valor, 4 esperados |
| /clientes/responder-consultas-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 4 de 4 |
| /clientes/responder-consultas-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/responder-consultas-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /clientes/responder-consultas-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /clientes/responder-consultas-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3619 caracteres copiados |
| /clientes/responder-consultas-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/responder-consultas-con-ia | 1280 | 0 errores en consola | OK |  |
| /clientes/responder-consultas-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /clientes/responder-consultas-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /clientes/responder-consultas-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3583 caracteres |
| /clientes/responder-consultas-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /clientes/responder-reclamos-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /clientes/responder-reclamos-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /clientes/responder-reclamos-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /clientes/responder-reclamos-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 6 obligatorios |
| /clientes/responder-reclamos-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 8 controles con valor, 8 esperados |
| /clientes/responder-reclamos-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 8 de 8 |
| /clientes/responder-reclamos-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/responder-reclamos-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /clientes/responder-reclamos-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /clientes/responder-reclamos-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4680 caracteres copiados |
| /clientes/responder-reclamos-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /clientes/responder-reclamos-con-ia | 1280 | 0 errores en consola | OK |  |
| /clientes/responder-reclamos-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /clientes/responder-reclamos-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /clientes/responder-reclamos-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4639 caracteres |
| /clientes/responder-reclamos-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/calendario-de-contenido-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /marketing/calendario-de-contenido-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /marketing/calendario-de-contenido-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/calendario-de-contenido-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 4 obligatorios |
| /marketing/calendario-de-contenido-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 11 controles con valor, 11 esperados |
| /marketing/calendario-de-contenido-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 6 de 6 |
| /marketing/calendario-de-contenido-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/calendario-de-contenido-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/calendario-de-contenido-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/calendario-de-contenido-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4643 caracteres copiados |
| /marketing/calendario-de-contenido-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/calendario-de-contenido-con-ia | 1280 | calculadora · Mesa Larga (ficticio): 3 horas, 4 publicaciones por semana | OK | 8 resultados coinciden |
| /marketing/calendario-de-contenido-con-ia | 1280 | calculadora · No cabe: 2 horas para 4 publicaciones | OK | 5 resultados coinciden |
| /marketing/calendario-de-contenido-con-ia | 1280 | calculadora · Justo: 1 hora, sin reserva, 3 publicaciones de 20 minutos | OK | 5 resultados coinciden |
| /marketing/calendario-de-contenido-con-ia | 1280 | calculadora · Sin indicar la reserva se aplica el 20 % | OK | 2 resultados coinciden |
| /marketing/calendario-de-contenido-con-ia | 1280 | 0 errores en consola | OK |  |
| /marketing/calendario-de-contenido-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/calendario-de-contenido-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/calendario-de-contenido-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4595 caracteres |
| /marketing/calendario-de-contenido-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /marketing/crear-afiches-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/crear-afiches-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 7 obligatorios |
| /marketing/crear-afiches-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 10 controles con valor, 10 esperados |
| /marketing/crear-afiches-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 10 de 10 |
| /marketing/crear-afiches-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/crear-afiches-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4232 caracteres copiados |
| /marketing/crear-afiches-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | proceso: los bloques salen en el orden de la plantilla | OK | resultado › problema › necesitas › herramienta › proceso › kit › ejemplo › revision › por-que-funciona › rubros › errores › faq › verificacion |
| /marketing/crear-afiches-con-ia | 1280 | proceso: etiquetas «15 min · Gratis · ChatGPT, Gemini o Claude + Canva» | OK | 15 min / Gratis / ChatGPT, Gemini o Claude + Canva |
| /marketing/crear-afiches-con-ia | 1280 | proceso: 5 pasos numerados («Paso 1 de 5») con su tiempo | OK | PASO 1 DE 5 · 2 MIN |
| /marketing/crear-afiches-con-ia | 1280 | proceso: ningún recuadro de captura pendiente en producción | OK | 0 |
| /marketing/crear-afiches-con-ia | 1280 | paso 3: con «Canva» va primero Canva | OK | ["canva","ia-imagen"] |
| /marketing/crear-afiches-con-ia | 1280 | paso 3: con «IA de imagen» va primero la IA de imagen | OK | ["ia-imagen","canva"] |
| /marketing/crear-afiches-con-ia | 1280 | paso 3: con «Aún no sé» va primero Canva y se recomienda como la más segura | OK | A) En Canva
Recomendada si aún no sabes: es la opción más segura, porque el text |
| /marketing/crear-afiches-con-ia | 1280 | foto real: «Sí» → «usa la foto que adjunto, sin alterar el producto»; «No» → imagen de apoyo generada | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | foto real «Sí»: desaparece el aviso de imagen generada con IA | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | foto real «No»: el paso 3 avisa que se indique que es generada con IA | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | paso 5: con A4 + 9:16 solo salen imprimir, mockup, 9:16 y el mensaje | OK | ["imprimir","mockup","vertical","mensaje"] |
| /marketing/crear-afiches-con-ia | 1280 | paso 5: sin formatos marcados no hay salidas y se pide marcar uno | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | paso 5: con 1:1 salen la versión cuadrada y el mensaje | OK | ["cuadrado","mensaje"] |
| /marketing/crear-afiches-con-ia | 1280 | formatos: el ejemplo vuelve a A4 + 9:16 | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | cada botón Copiar (5) copia exactamente su prompt, sin {{ }}, undefined, null ni NaN | OK | 5 prompts |
| /marketing/crear-afiches-con-ia | 1280 | los botones Copiar tienen nombres accesibles distintos | OK | Copiar prompt del paso 2: El texto de tu afiche / Copiar prompt del paso 3: B) Con una IA de imagen / Copiar prompt del paso 5: Mockup en la vitrina (simulación) / Copiar prompt del paso 5: Versión 9:16 para estado o historia / Copiar prompt del paso 5: Mensaje para enviar el afiche por WhatsApp |
| /marketing/crear-afiches-con-ia | 1280 | paso 3B: el prompt de la IA de imagen lleva los cuatro niveles exactos | OK | Crea un afiche vertical tamaño A4 para mi negocio. Usa EXACTAMENTE este texto, sin cambiar, añadir n |
| /marketing/crear-afiches-con-ia | 1280 | paso 4: la lista trae el precio, los días, el lugar y las condiciones tal como los escribiste | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | «Si algo falla» es plegable y se abre | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | «Si algo falla»: 9 botones «Copiar corrección» (≥ 44 px) copian su texto ya relleno, sin llaves | OK | 9 correcciones |
| /marketing/crear-afiches-con-ia | 1280 | correcciones: nivel 1 exacto, precio y «mismo texto del afiche original» | OK | Corrige el nivel 1: debe decir exactamente «Combo de fin de semana: 6 panes y 1  |
| /marketing/crear-afiches-con-ia | 1280 | paso 4: una casilla por cada dato del formulario (6) y «0 de 6 comprobados» | OK | 6 casillas |
| /marketing/crear-afiches-con-ia | 1280 | paso 4: marcar dos datos da «2 de 6 comprobados» | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | paso 4: si cambias el precio, su casilla se desmarca sola («1 de 6») | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | paso 4: con el precio original la marca vuelve («2 de 6») | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | paso 4: lo comprobado se recuerda al recargar (2 de 6) | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | paso 4: con el formulario vacío no hay nada que comprobar («0 de 0») ni casillas | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | descarga (.txt): botón de 44 px, nombre con la fecha y aclaración «no lo recibimos» | OK | crear-afiches-con-ia-2026-09-25.txt · 44 px |
| /marketing/crear-afiches-con-ia | 1280 | descarga (.txt): lleva la fecha, los datos y los prompts de los 5 pasos, sin llaves | OK | 8582 caracteres |
| /marketing/crear-afiches-con-ia | 1280 | descarga (.txt): el archivo se crea en el navegador (blob) y no hace ninguna petición al servidor | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | kit final con «Probar con un ejemplo» (A4 + 9:16): salen las 6 entregas y «0 de 6 listos» | OK | 6 casillas · 0 de 6 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 1280 | kit final sin formatos marcados: salen todas (6) y el contador coincide | OK | 6 · 0 de 6 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 1280 | kit final con solo 1:1: 4 entregas (texto, afiche, versiones, mensaje), sin mockup ni prueba impresa | OK | 4 · 0 de 4 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 1280 | kit final: marcar dos entregas da «2 de 4 listos» | OK | 2 de 4 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 1280 | kit final con solo A4: 4 entregas (texto, afiche, mockup, prueba) y «X de 4» sin contar lo oculto | OK | 4 · 1 de 4 listos. Lo qu |
| /marketing/crear-afiches-con-ia | 1280 | kit final: lo marcado se recuerda al recargar (solo en este navegador) | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | kit final con localStorage bloqueado: se puede marcar y no hay errores | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | paso 4 y descarga con localStorage bloqueado: se marca («1 de 6»), se descarga y no hay errores | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | conteo de palabras · El caso de La Espiga (los datos de «Probar con un ejemplo») | OK | «Tus datos suman 39 palabras (máximo 39).»; el prompt trae el total |
| /marketing/crear-afiches-con-ia | 1280 | conteo de palabras · Sin datos: cero palabras | OK | «Tus datos suman 0 palabras (máximo 39).»; el prompt trae el total |
| /marketing/crear-afiches-con-ia | 1280 | conteo de palabras · Sin precio no se cuenta el «por» del titular | OK | «Tus datos suman 11 palabras (máximo 39).»; el prompt trae el total |
| /marketing/crear-afiches-con-ia | 1280 | conteo de palabras · Se pasa del máximo: el aviso dice cuántas de más | OK | «Tus datos suman 49 palabras (máximo 39).» + aviso (no bloquea); el prompt trae el total |
| /marketing/crear-afiches-con-ia | 1280 | 0 errores en consola | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/crear-afiches-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/crear-afiches-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4192 caracteres |
| /marketing/crear-afiches-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/crear-anuncios-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /marketing/crear-anuncios-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /marketing/crear-anuncios-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/crear-anuncios-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 6 obligatorios |
| /marketing/crear-anuncios-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 7 controles con valor, 7 esperados |
| /marketing/crear-anuncios-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 7 de 7 |
| /marketing/crear-anuncios-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-anuncios-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/crear-anuncios-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/crear-anuncios-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3536 caracteres copiados |
| /marketing/crear-anuncios-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-anuncios-con-ia | 1280 | 0 errores en consola | OK |  |
| /marketing/crear-anuncios-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/crear-anuncios-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/crear-anuncios-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3499 caracteres |
| /marketing/crear-anuncios-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/crear-promociones-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /marketing/crear-promociones-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /marketing/crear-promociones-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/crear-promociones-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 5 obligatorios |
| /marketing/crear-promociones-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 12 controles con valor, 12 esperados |
| /marketing/crear-promociones-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 6 de 6 |
| /marketing/crear-promociones-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-promociones-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/crear-promociones-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/crear-promociones-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3646 caracteres copiados |
| /marketing/crear-promociones-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-promociones-con-ia | 1280 | calculadora · A · Combo de media mañana | OK | 7 resultados coinciden |
| /marketing/crear-promociones-con-ia | 1280 | calculadora · B · Desayuno completo con 15 % | OK | 7 resultados coinciden |
| /marketing/crear-promociones-con-ia | 1280 | calculadora · C · Tarjeta de 5 visitas, la 5.ª gratis | OK | 7 resultados coinciden |
| /marketing/crear-promociones-con-ia | 1280 | calculadora · D · Ven acompañado (2.º croissant gratis) | OK | 6 resultados coinciden |
| /marketing/crear-promociones-con-ia | 1280 | calculadora · Precio por debajo del costo | OK | 3 resultados coinciden |
| /marketing/crear-promociones-con-ia | 1280 | 0 errores en consola | OK |  |
| /marketing/crear-promociones-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/crear-promociones-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/crear-promociones-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3603 caracteres |
| /marketing/crear-promociones-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 6 obligatorios |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 8 controles con valor, 8 esperados |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 8 de 8 |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3968 caracteres copiados |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | 0 errores en consola | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3930 caracteres |
| /marketing/crear-publicaciones-para-redes-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /negocio/documentar-procesos-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /negocio/documentar-procesos-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /negocio/documentar-procesos-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /negocio/documentar-procesos-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 5 obligatorios |
| /negocio/documentar-procesos-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 7 controles con valor, 7 esperados |
| /negocio/documentar-procesos-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 7 de 7 |
| /negocio/documentar-procesos-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /negocio/documentar-procesos-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /negocio/documentar-procesos-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /negocio/documentar-procesos-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3968 caracteres copiados |
| /negocio/documentar-procesos-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /negocio/documentar-procesos-con-ia | 1280 | 0 errores en consola | OK |  |
| /negocio/documentar-procesos-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /negocio/documentar-procesos-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /negocio/documentar-procesos-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3926 caracteres |
| /negocio/documentar-procesos-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /negocio/organizar-tareas-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /negocio/organizar-tareas-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /negocio/organizar-tareas-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /negocio/organizar-tareas-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 1 obligatorios |
| /negocio/organizar-tareas-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 9 controles con valor, 9 esperados |
| /negocio/organizar-tareas-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 4 de 4 |
| /negocio/organizar-tareas-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /negocio/organizar-tareas-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /negocio/organizar-tareas-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /negocio/organizar-tareas-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4862 caracteres copiados |
| /negocio/organizar-tareas-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /negocio/organizar-tareas-con-ia | 1280 | calculadora · Ana (Lavandería Brisa, ficticia): 45 minutos al día | OK | 8 resultados coinciden |
| /negocio/organizar-tareas-con-ia | 1280 | calculadora · No caben: 30 minutos al día para 6 tareas | OK | 5 resultados coinciden |
| /negocio/organizar-tareas-con-ia | 1280 | calculadora · Sin indicar la rutina se aparta la de 15 minutos | OK | 5 resultados coinciden |
| /negocio/organizar-tareas-con-ia | 1280 | calculadora · Sin rutina (0 minutos) y una semana de un solo día | OK | 6 resultados coinciden |
| /negocio/organizar-tareas-con-ia | 1280 | 0 errores en consola | OK |  |
| /negocio/organizar-tareas-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /negocio/organizar-tareas-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /negocio/organizar-tareas-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4807 caracteres |
| /negocio/organizar-tareas-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /ventas/calcular-precios-y-margenes | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /ventas/calcular-precios-y-margenes | 1280 | botones y controles ≥ 44 px | OK |  |
| /ventas/calcular-precios-y-margenes | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /ventas/calcular-precios-y-margenes | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 2 obligatorios |
| /ventas/calcular-precios-y-margenes | 1280 | «Probar con un ejemplo» llena el formulario | OK | 13 controles con valor, 13 esperados |
| /ventas/calcular-precios-y-margenes | 1280 | cada campo recibe su valor de ejemplo | OK | 4 de 4 |
| /ventas/calcular-precios-y-margenes | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/calcular-precios-y-margenes | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /ventas/calcular-precios-y-margenes | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /ventas/calcular-precios-y-margenes | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3970 caracteres copiados |
| /ventas/calcular-precios-y-margenes | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/calcular-precios-y-margenes | 1280 | calculadora · Galletería Migas: caja de 6 galletas | OK | 8 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 1280 | calculadora · Los ingredientes suben 25 % | OK | 3 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 1280 | calculadora · Se venden 100 unidades al mes | OK | 4 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 1280 | calculadora · Las dos cosas a la vez | OK | 3 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 1280 | calculadora · Solo materiales y margen (sin precio elegido ni competencia) | OK | 4 resultados coinciden |
| /ventas/calcular-precios-y-margenes | 1280 | 0 errores en consola | OK |  |
| /ventas/calcular-precios-y-margenes | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /ventas/calcular-precios-y-margenes | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /ventas/calcular-precios-y-margenes | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3926 caracteres |
| /ventas/calcular-precios-y-margenes | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /ventas/crear-cotizaciones-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /ventas/crear-cotizaciones-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /ventas/crear-cotizaciones-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /ventas/crear-cotizaciones-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 7 obligatorios |
| /ventas/crear-cotizaciones-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 20 controles con valor, 20 esperados |
| /ventas/crear-cotizaciones-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 11 de 11 |
| /ventas/crear-cotizaciones-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/crear-cotizaciones-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /ventas/crear-cotizaciones-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /ventas/crear-cotizaciones-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 4473 caracteres copiados |
| /ventas/crear-cotizaciones-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/crear-cotizaciones-con-ia | 1280 | calculadora · Maderas Rivera: cocina a medida | OK | 9 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 1280 | calculadora · Un solo ítem, con impuesto y anticipo | OK | 7 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 1280 | calculadora · Sin descuento, sin impuesto y sin anticipo | OK | 6 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 1280 | calculadora · Descuento solo sobre los ítems marcados | OK | 6 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 1280 | calculadora · El redondeo está solo en el anticipo: anticipo y saldo suman el total | OK | 3 resultados coinciden |
| /ventas/crear-cotizaciones-con-ia | 1280 | 0 errores en consola | OK |  |
| /ventas/crear-cotizaciones-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /ventas/crear-cotizaciones-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /ventas/crear-cotizaciones-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 4422 caracteres |
| /ventas/crear-cotizaciones-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | sin scroll horizontal | OK | ancho de contenido 1280 · ventana 1280 |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | botones y controles ≥ 44 px | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | foco visible con Tab | OK | 43 controles; sin contorno: ninguno |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | «Empezar de cero»: formulario vacío y el prompt marca [FALTA] | OK | 4 obligatorios |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | «Probar con un ejemplo» llena el formulario | OK | 6 controles con valor, 6 esperados |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | cada campo recibe su valor de ejemplo | OK | 6 de 6 |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | prompt del ejemplo sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | prompt del ejemplo sin [FALTA] en los datos | OK | 0 [FALTA] |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | «Ver el prompt completo» muestra el prompt | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | «Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt | OK | 3797 caracteres copiados |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | el prompt copiado sin {{ }}, undefined, null ni NaN | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | 0 errores en consola | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | portapapeles API bloqueado: alternativa (execCommand) o texto a mano | OK | copiado con execCommand |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | 0 errores de consola con el portapapeles sin API | OK |  |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo | OK | 3760 caracteres |
| /ventas/crear-descripciones-de-productos-con-ia | 1280 | 0 errores de consola con el portapapeles bloqueado | OK |  |
