# Transcripciones literales de las capturas reales

Guía: `marketing/crear-anuncios-con-ia`. Fuente: los 5 archivos `public/images/guias/marketing/crear-anuncios-con-ia/prueba-prompt-01.webp` … `05.webp`, leídos con la herramienta de lectura de imágenes. Todo lo transcrito aquí es literal; nada fue corregido ni completado. Ninguna palabra resultó ilegible a la resolución actual, salvo donde se indica.

---

## 01 — Prompt principal (`anuncio`) — 936×623 px

Tabla de dos columnas: **ANUNCIO 1 — Beneficio para el cliente** | **ANUNCIO 2 — Oferta y fecha**

| Elemento | Anuncio 1 | Anuncio 2 |
| --- | --- | --- |
| Enfoque | Beneficio que recibe el cliente | Oferta, fecha y horario |
| Gancho | Encuentra herramientas manuales de varias marcas en un solo local y recibe asesoría para elegir la adecuada. | 20 % de descuento en herramientas manuales este sábado 10 de octubre. |
| Texto | En Ferretería Casa y Clavo encontrarás herramientas manuales de varias marcas, como martillos, destornilladores, alicates y llaves, en un solo local. Además, te asesoramos para elegir la adecuada.\n\nEste sábado 10 de octubre, de 9:00 a 14:00, tendrás 20 % de descuento en herramientas manuales.\n\nEstamos en calle Los Pinos con calle 5. Tenemos 12 años atendiendo en el mismo local.\n\nHasta agotar stock por producto. No acumulable con otras ofertas. | Ferretería Casa y Clavo tiene 20 % de descuento en herramientas manuales: martillos, destornilladores, alicates y llaves.\n\nLa oferta es solo el sábado 10 de octubre, de 9:00 a 14:00, en el local.\n\nEstamos en calle Los Pinos con calle 5. Encontrarás herramientas manuales de varias marcas en un solo local y te asesoramos para elegir la adecuada.\n\nHasta agotar stock por producto. No acumulable con otras ofertas. Ferretería Casa y Clavo lleva 12 años atendiendo en el mismo local. |
| Llamada a la acción | Pasa por el local el sábado. | Pasa por el local el sábado. |
| Descuento | 20 % en herramientas manuales | 20 % en herramientas manuales |
| Fecha | Sábado 10 de octubre | Sábado 10 de octubre |
| Horario | 9:00 a 14:00 | 9:00 a 14:00 |
| Lugar | Calle Los Pinos con calle 5 | Calle Los Pinos con calle 5 |
| Productos | Martillos, destornilladores, alicates y llaves | Martillos, destornilladores, alicates y llaves |
| Beneficio | Varias marcas + asesoría para elegir | Varias marcas + asesoría para elegir |
| Respaldo | 12 años atendiendo en el mismo local | 12 años atendiendo en el mismo local |
| Condiciones | Hasta agotar stock. No acumulable. | Hasta agotar stock. No acumulable. |
| Supuestos | Ninguno | Ninguno |
| Falta | Ninguna | Ninguna |

**Comprobación contra lo que ya sabías:** coincide en todo. V1 dice «Este sábado 10 de octubre» sin «solo». V2 dice «La oferta es solo el sábado 10 de octubre…» y «lleva 12 años atendiendo en el mismo local» (no «de experiencia»).

**Contradicción encontrada:** el `firstResult` actual en `data.ts` (el que se muestra hoy como «Lo que respondió la IA la primera vez») **no es esta captura**: usa ganchos distintos («¿Un arreglo pendiente en casa? Tenemos lo que necesitas.» / «Sábado 10 de octubre: 20 % de descuento en herramientas manuales.») e inventa el defecto «12 años de experiencia» en la V2, que la captura real no contiene.

---

## 02 — Prompt de refuerzo (`persuasion`) — 526×819 px

Encabezado del bloque: «Versión reforzada del anuncio»

**1. Versión reforzada**
- Gancho: Este sábado 10 de octubre, de 9:00 a 14:00, 20 % de descuento en herramientas manuales.
- Texto: En Ferretería Casa y Clavo encontrarás herramientas manuales de varias marcas, como martillos, destornilladores, alicates y llaves, en un solo local. Además, te asesoramos para elegir la adecuada.\n\nEste sábado 10 de octubre, de 9:00 a 14:00, tendrás 20 % de descuento en herramientas manuales.\n\nEstamos en calle Los Pinos con calle 5. Tenemos 12 años atendiendo en el mismo local.\n\nHasta agotar stock por producto. No acumulable con otras ofertas.
- Llamada a la acción: Pasa por el local el sábado.

**2. Cambios** (tabla: Frase original | Frase nueva | Palanca | Dato de la ficha que la respalda)

| Frase original | Frase nueva | Palanca | Dato de la ficha |
| --- | --- | --- | --- |
| Encuentra herramientas manuales de varias marcas en un solo local y recibe asesoría para elegir la adecuada. | Este sábado 10 de octubre, de 9:00 a 14:00, 20 % de descuento en herramientas manuales. | Urgencia real | Solo el sábado 10 de octubre; de 9:00 a 14:00; 20 % de descuento en herramientas manuales. |

**3. Lo que no cambié:** Ferretería Casa y Clavo · Herramientas manuales de varias marcas · Martillos, destornilladores, alicates y llaves · Asesoría para elegir la adecuada · 20 % de descuento · Sábado 10 de octubre · De 9:00 a 14:00 · Calle Los Pinos con calle 5 · 12 años atendiendo en el mismo local · Hasta agotar stock por producto · No acumulable con otras ofertas · Llamada a la acción: pasar por el local el sábado.

**4. Para revisar:** Nada.

**Comprobación:** coincide con tu resumen.

**Detalle que llama la atención (para validar en el Paso 1):** la columna «Dato de la ficha que la respalda» ya escribe «**Solo** el sábado 10 de octubre», pero el gancho que produjo dice «**Este** sábado 10 de octubre» (sin «solo»). El propio refuerzo se queda corto respecto al dato que cita como respaldo. Esto es justo lo que la corrección real (Paso 2/3) tiene que arreglar.

---

## 03 — Prompt de canales (`canales`) — 1066×442 px (baja resolución; recapturar)

**Fila 1 — Anuncio en una red social**
- Texto: Gancho: Este sábado 10 de octubre, de 9:00 a 14:00, 20 % de descuento en herramientas manuales.\n\nEn Ferretería Casa y Clavo encontrarás herramientas manuales de varias marcas, como martillos, destornilladores, alicates y llaves, en un solo local. Además, te asesoramos para elegir la adecuada.\n\nEste sábado 10 de octubre, de 9:00 a 14:00, tendrás 20 % de descuento en herramientas manuales.\n\nEstamos en calle Los Pinos con calle 5. Tenemos 12 años atendiendo en el mismo local.\n\nHasta agotar stock por producto. No acumulable con otras ofertas.\n\nPasa por el local el sábado.
- Qué cambió: No se eliminó ningún dato. Se mantiene el anuncio aprobado porque no conocemos el límite de la plataforma.
- Qué mostrar: Imagen de herramientas manuales junto al mensaje principal de la oferta.
- Datos conservados: Ferretería Casa y Clavo; 20 % de descuento; herramientas manuales; martillos, destornilladores, alicates y llaves; varias marcas; asesoría; sábado 10 de octubre; 9:00-14:00; calle Los Pinos con calle 5; 12 años atendiendo en el mismo local; hasta agotar stock por producto; no acumulable; pasar por el local el sábado.
- No cabe: [FALTA: límite del canal]. No se puede confirmar que todo el texto quepa sin conocer el límite de la plataforma.

**Fila 2 — Texto sobre la imagen**
- Texto: Sábado 10 de octubre: 20 % de descuento
- Qué cambió: Se redujo el texto para cumplir la regla conocida de máximo 8 palabras.
- Qué mostrar: Imagen de herramientas manuales.
- Datos conservados: Sábado 10 de octubre; 20 % de descuento; oferta de herramientas manuales.
- No cabe: No caben en el texto de imagen: nombre del negocio, productos concretos, varias marcas, asesoría, horario, ubicación, 12 años atendiendo en el mismo local, stock, condición de no acumulación y llamada a la acción.

**Fila 3 — Mensaje directo a clientes que aceptaron recibir mensajes**
- Texto: Hola [NOMBRE], te aviso de una jornada en Ferretería Casa y Clavo: este sábado 10 de octubre, de 9:00 a 14:00, tendrás 20 % de descuento en herramientas manuales. Encontrarás martillos, destornilladores, alicates y llaves de varias marcas en un solo local. Además, te asesoramos para elegir la adecuada.\n\nEstamos en calle Los Pinos con calle 5. Tenemos 12 años atendiendo en el mismo local.\n\nHasta agotar stock por producto. No acumulable con otras ofertas.\n\nPasa por el local el sábado.
- Qué cambió: Se añadió [NOMBRE] como marcador para personalizar el mensaje. Se mantiene la oferta y sus condiciones.
- Qué mostrar: Herramientas manuales y la información principal de la jornada.
- Datos conservados: Ferretería Casa y Clavo; 20 % de descuento; martillos, destornilladores, alicates y llaves; varias marcas; asesoría; sábado 10 de octubre; 9:00-14:00; ubicación; 12 años atendiendo en el mismo local; stock; no acumulable; pasar por el local el sábado.
- No cabe: Nada, siempre que se envíe únicamente a personas que aceptaron recibir mensajes.

**Comprobación:** coincide con tu resumen; encontré la palabra «jornada» en el mensaje directo, tal como advertiste.

**Nota de legibilidad:** el archivo mide solo 1066×442 px. Lo leí ampliando y recortando por zonas con un script local (no modifiqué el archivo); todo resultó legible, pero está en la lista de recapturas (`recapturas.md`, pendiente del Paso 5) porque a resolución normal el texto es diminuto.

---

## 04 — Prompt de variantes (`variantes`) — 1134×741 px

Tabla: Elemento | Versión A | Versión B | Hipótesis | Señal a observar

| Elemento | Versión A | Versión B |
| --- | --- | --- |
| Gancho | Este sábado 10 de octubre, de 9:00 a 14:00, 20 % de descuento en herramientas manuales. | ¿Qué herramienta te falta en casa? Este sábado 10 de octubre, de 9:00 a 14:00, 20 % de descuento en herramientas manuales. |

Hipótesis: Podría ser que un gancho en forma de pregunta haga que algunas personas recuerden con mayor facilidad la versión que vieron.
Señal a observar: Personas que, al llegar al local, dicen qué versión vieron.

**Se mantiene igual:** Ferretería Casa y Clavo · Herramientas manuales de varias marcas · Martillos, destornilladores, alicates y llaves · Asesoría para elegir la adecuada · 20 % de descuento · Sábado 10 de octubre · De 9:00 a 14:00 · Calle Los Pinos con calle 5 · 12 años atendiendo en el mismo local · Hasta agotar stock por producto · No acumulable con otras ofertas · Llamada a la acción: Pasa por el local el sábado · Todo el texto después del gancho.

**Cómo comparar con justicia:** (1) Mantener exactamente el mismo texto, oferta, condiciones y llamada a la acción en ambas versiones. (2) Cambiar únicamente el gancho. (3) Registrar la versión que cada persona dice haber visto, sin interpretar ni completar su respuesta. (4) Mantener la misma forma de identificar las versiones durante la comparación. (5) Comparar las respuestas observadas entre A y B sin atribuirles diferencias que no se hayan medido.

**Cuándo no se puede concluir:** Si una versión cambia además del gancho · Si no se puede identificar qué versión vio la persona · Si las personas no recuerdan o no pueden decir qué versión vieron · Si se mezclan cambios de otros elementos durante la prueba · Si las condiciones de exposición de A y B son diferentes de una manera que pueda afectar la comparación.

**Comprobación:** coincide con tu resumen. La Versión A es literalmente el gancho que salió del refuerzo (captura 02): la cadena 02 → 04 es consistente.

---

## 05 — Prompt de afirmaciones (`afirmaciones`), Revisión 1 — 562×759 px

**El archivo contiene únicamente la tabla «ANUNCIO 1 — Red social».** No encontré, dentro de este mismo archivo, las tablas de «Texto sobre la imagen», «Mensaje directo» ni «Versión B» que tu resumen atribuye a la misma revisión — ver «Punto que necesito que resuelvas» más abajo.

Tabla: Afirmación | Tipo | ¿En la ficha? | Qué debe comprobar la persona

| Afirmación | Tipo | ¿En la ficha? | Qué debe comprobar la persona |
| --- | --- | --- | --- |
| «Este sábado 10 de octubre» | Dato de la oferta | Sí | Que la fecha siga siendo la de la oferta. |
| «de 9:00 a 14:00» | Dato de la oferta | Sí | Que ese sea el horario real. |
| «20 % de descuento en herramientas manuales» | Dato de la oferta | Sí | Que el descuento y su alcance sean exactamente esos. |
| «En Ferretería Casa y Clavo encontrarás herramientas manuales de varias marcas» | Servicio o cualidad | Sí | Que realmente haya varias marcas de herramientas manuales disponibles. |
| «como martillos, destornilladores, alicates y llaves» | Dato de la oferta | Sí | Que esos sean los productos incluidos. |
| «en un solo local» | Servicio o cualidad | Sí | Que las distintas marcas estén disponibles en el mismo local. |
| «te asesoramos para elegir la adecuada» | Servicio o cualidad | Sí | Que exista realmente personal que pueda brindar esa asesoría. |
| «Este sábado 10 de octubre» | Dato de la oferta | Sí | Que la fecha sea correcta. |
| «de 9:00 a 14:00» | Dato de la oferta | Sí | Que el horario sea correcto. |
| «tendrás 20 % de descuento en herramientas manuales» | Dato de la oferta | Sí | Que el descuento aplique a las herramientas manuales indicadas. |
| «Estamos en calle Los Pinos con calle 5» | Ubicación | Sí | Que esa siga siendo la ubicación del local. |
| «Tenemos 12 años atendiendo en el mismo local» | Servicio o cualidad | Sí | Que los 12 años y la permanencia en el mismo local sean correctos. |
| «Hasta agotar stock por producto» | Condición / Urgencia o escasez | Sí | Que exista esa condición y que se aplique por producto. |
| «No acumulable con otras ofertas» | Condición | Sí | Que realmente no sea acumulable con otras ofertas. |

**Condiciones de la ficha que faltan en el anuncio:** «Solo el sábado 10 de octubre.» El anuncio indica la fecha, pero no dice explícitamente «solo».

**Veredicto: NO PUBLICAR.** No porque haya una afirmación sin respaldo, sino porque falta explicitar una condición de la ficha: que la oferta es solo el sábado 10 de octubre.

**Comprobación:** coincide con tu resumen para el Anuncio 1: mismo motivo («falta “solo el sábado 10 de octubre”») y mismo veredicto.

---

## Punto que necesito que resuelvas antes de seguir (no es una transcripción)

Tu mensaje describe que, en la misma Revisión 1, **también salieron NO PUBLICAR** el «Texto sobre la imagen» (le faltan las condiciones), el «Mensaje directo» («jornada» sale Parcial y falta «en el local») y la «Versión B» (la pregunta no tiene respaldo en la ficha, y también falta «solo»). El archivo `prueba-prompt-05.webp` que existe en el repositorio **solo contiene la tabla del Anuncio 1** — no encontré esas otras tres tablas en ningún archivo de la carpeta (revisé también `ab-ganch.webp` y `correccion-antes-despues.webp`, que son ilustraciones distintas, no capturas de esa revisión).

Necesito que me digas una de estas dos cosas antes de escribir el Paso 6 (Revisión 1) y el componente «Qué corregimos»:
1. **Hay una captura adicional** con esas tres tablas que todavía no subiste — la leo en cuanto la subas, o
2. **Me pegas el texto** de esas tres tablas (tal como hiciste con el resto de esta tarea), para transcribirlo igual que hice con las demás.

Mientras tanto no voy a inventar el contenido de esas tres tablas ni su veredicto exacto: solo tengo, por tu resumen, el motivo de cada una en una frase, no la tabla completa fila por fila que el componente necesita mostrar.

---

## 05 (completa) — Revisión 1, las 4 piezas — pegado literal por el autor (no es un archivo de imagen)

El autor pegó el texto completo de la Revisión 1. Se reproduce tal cual, sin editar.

### ANUNCIO 1 — Red social
(Igual a la transcripción de arriba: 14 afirmaciones, todas «Sí», falta «Solo el sábado 10 de octubre», **veredicto NO PUBLICAR**.)

### ANUNCIO 2 — Texto sobre la imagen
Afirmaciones: «Sábado 10 de octubre» (Dato de la oferta, Sí) · «20 % de descuento» (Dato de la oferta, Sí).
Condiciones de la ficha que faltan: Solo el sábado 10 de octubre · De 9:00 a 14:00 · En el local · Hasta agotar stock por producto · No acumulable con otras ofertas.
**Veredicto: NO PUBLICAR.** «El texto contiene datos respaldados, pero no incluye las condiciones de la oferta. Al ser únicamente texto sobre imagen, esas condiciones tendrían que aparecer en otro elemento del anuncio o quedar claramente cubiertas por el canal utilizado.»

### ANUNCIO 3 — Mensaje directo
14 afirmaciones. La primera, «te aviso de una jornada en Ferretería Casa y Clavo», tipo «Otro: descripción de la acción», **¿En la ficha? Parcial** — «La ficha identifica el negocio y la oferta, pero no utiliza el término “jornada”.» El resto, Sí.
Condiciones de la ficha que faltan: «Solo el sábado 10 de octubre.» · La condición «en el local» no aparece expresamente asociada a la oferta.
**Veredicto: NO PUBLICAR.** «Hay una afirmación Parcial (“jornada”) y faltan condiciones de la ficha. Además, este mensaje solo debe enviarse a personas que aceptaron recibir mensajes.»

### ANUNCIO 4 — Red social, versión B
14 afirmaciones. La primera, «¿Qué herramienta te falta en casa?», tipo «Otro: pregunta al público», **¿En la ficha? No** — «La ficha define el público como personas que hacen arreglos en casa, pero no afirma que les falte una herramienta concreta.» El resto, Sí.
Condiciones de la ficha que faltan: «Solo el sábado 10 de octubre.»
**Veredicto: NO PUBLICAR.** «La pregunta “¿Qué herramienta te falta en casa?” no está respaldada por la ficha... También falta explicitar que la oferta es solo ese sábado.»

**Punto bloqueante resuelto.** Ya tengo las 4 tablas completas. Sigo con el Paso 1 y el Paso 2.
