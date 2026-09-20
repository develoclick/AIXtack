# Crear un calendario de contenido con IA que cabe en tu tiempo

**Ruta:** `/marketing/guias/calendario-de-contenido-con-ia`
**Estado:** `published` en el build local (**no desplegada**). **Autoría:** `DeveloClick`. **Estándar:** `estandarGuia: 3` (prompt de guías v3).
**Tipo de guía:** estrategia y planificación con cálculo de capacidad (`estrategia-planificacion`, `numeros-datos`); `handlesNumbers: true`.
**Problema:** hay ideas pero no un plan que se pueda cumplir con el tiempo real; una IA sin datos llena el calendario sin saber cuánto tarda cada pieza y puede sumar mal o colocar mal una fecha.
**Ángulo propio:** el calendario parte de la *capacidad* (minutos usables = horas × 60 × (1 − reserva)), se reparte por semanas con producción en lote, las sumas se recalculan en una hoja y las fechas comerciales y feriados los aporta y comprueba la persona. Es el paso siguiente a `ideas-de-contenido-para-tu-negocio-con-ia` (qué publicar) y anterior a `crear-publicaciones-para-redes-sociales-con-ia` (cómo redactar cada pieza).

## Activo original
Calculadora de capacidad semanal (tabla copiable con fórmulas en español e inglés), rúbrica interactiva de cinco criterios (0–10; bloqueo si «Cabe en mi tiempo» saca 0) y calendario de cuatro semanas (tabla copiable).

## Prompts (5, funciones distintas)
| Clave | Función | Variables |
| --- | --- | --- |
| `formulas` | Ayuda con las fórmulas de la hoja sin compartir datos | PROGRAMA, COLUMNAS |
| `calendario` | Principal: reparte el banco en cuatro semanas | BANCO, OBJETIVO, MINUTOS_USABLES, TIEMPOS_POR_FORMATO, DIAS, FECHAS_PROPIAS |
| `revision` | Evaluación: recalcula cada semana y puntúa con la rúbrica | CALENDARIO |
| `ajuste` | Iteración: mueve o quita lo mínimo para que quepa | PROBLEMAS, NO_TOCAR |
| `reciclaje` | Adaptación: qué piezas publicadas reutilizar y cuándo | PUBLICADAS, ESPERA_MINIMA, MINUTOS_POR_RECICLAJE |

## Verificación de cifras (todas ficticias; verificado con código)
Todas las cifras se calculan en `data.ts` a partir de constantes y se comprobaron aparte con un script en Node (sumas cruzadas por pieza, por semana y en total). Los tiempos por formato son estimaciones ficticias de la dueña del caso.

| Formato | Producción | Publicación | Por pieza |
| --- | --- | --- | --- |
| Imagen con texto | 25 | 5 | 30 |
| Serie de imágenes | 50 | 5 | 55 |
| Mensaje breve | 10 | 5 | 15 |

- **Minutos usables:** 3 h × 60 × (1 − 0.2) = **144**. La reserva del 20 % es una recomendación práctica de la guía, no una norma ni un estudio.
- **Primer calendario (14 piezas):** semana 1 = 110 + 20 = 130; semana 2 = 130; semana 3 = 125 + 20 = **145** (supera por 1 minuto los 144); semana 4 = 50 + 10 = 60. **Error ilustrativo de la IA (escrito a propósito):** declara «125 + 20 = 130» en la semana 3. Total general 465.
- **Comprobación en la hoja:** 3 imágenes con texto + 1 serie + 0 mensajes = 3 × 30 + 55 = 145 → «No».
- **Calendario final:** la pieza H pasa de la semana 3 a la 4: semana 3 = 75 + 15 = 90; semana 4 = 100 + 15 = 115. Total general 465 (igual que antes).
- **Reciclaje:** semana 4 = 115 + 15 = 130 con una pieza reciclada (cabe); con dos, 145 (no cabe), por eso solo se recicla una.
- **Números de práctica de la hoja:** 20 + 5 = 25; 25 × 3 = 75; 75 + 60 + 15 = 150; 2 h con reserva 0.25 = 90; 150 > 90 → «No».
- **Fórmulas de la hoja:** están escritas en español e inglés y son equivalentes a las de arriba (comprobadas con esos números de práctica en Node). No se ejecutaron en Excel ni en Google Sheets: el autor debe pegar la calculadora en su programa y comprobar que da 130, 144 y «Sí».

## Ejemplos generados
Redactados **aplicando literalmente cada prompt** a los datos de Mesa Larga (ficticio). No proceden de una conversación real ni de una prueba del autor. El defecto del primer resultado (una suma mal hecha) es de ejecución: el prompt exige recalcularla dos veces, pero un error aritmético no se puede prevenir del todo. El prompt deja la semana 4 con dos piezas en lugar de inventar ideas, como pide su regla 1.

## Imágenes
Carpeta: `public/images/guias/marketing/calendario-de-contenido-con-ia/` (no existe ningún archivo). WebP, máx. 1600 px de ancho, idealmente ≤ 200 KB, sin datos personales ni de cuenta.

| Archivo | Sección | Ratio |
| --- | --- | --- |
| `hero.webp` | Cabecera | 16:9 |
| `datos-necesarios.webp` | Datos | 4:3 |
| `calculadora-de-capacidad.webp` | Hoja de cálculo | 4:3 |
| `calendario-inicial.webp` | Primer resultado | 16:9 |
| `la-hoja-detecta-la-diferencia.webp` | Análisis | 16:9 |
| `calendario-final.webp` | Resultado final | 16:9 |
| `prueba-prompt-01.webp` … `05` | Junto a cada prompt | 16:9 |

Las cinco `prueba-prompt-0N.webp` (`promptId`: `formulas`, `calendario`, `revision`, `ajuste`, `reciclaje`) son capturas reales del autor: «Prueba real» solo aparece si existe el archivo.

## Evidencia del autor (no existe todavía)
`evidence` está vacío a propósito. El autor puede añadir `pruebas` (`promptId`, `fecha`, `asistente`, `nota`), `casoReal` (un calendario propio y cuánto tardaron de verdad las piezas) y `revisadoEn`.

## Guía de pruebas de prompts
Probar cada prompt en al menos un asistente y ajustarlo (y repetir la prueba) antes de publicar.

| Prompt | Entradas sugeridas | Qué capturar | Qué debe cumplir | Fallos a vigilar |
| --- | --- | --- | --- | --- |
| `formulas` | PROGRAMA y COLUMNAS del caso, sin cifras | Tabla y «Cómo pegarla» | Fórmulas en español e inglés; comprobación con números de práctica correcta | Usa una columna no descrita; separador equivocado |
| `calendario` | Banco del caso, 144 minutos, tiempos, días y fecha propia | Tabla, totales, bloques y «FALTA» | Solo ideas del banco; cada semana ≤ 144; sumas correctas; nada en domingo | Suma mal; añade ideas o feriados; ignora la fecha propia |
| `revision` | El calendario del paso anterior | Tablas de sumas y de rúbrica | Recalcula desde cero; señala diferencias; NO USAR si no cabe | Confirma sumas sin recalcular; reescribe el calendario |
| `ajuste` | PROBLEMAS «semana 3 suma 145, máximo 144» y NO_TOCAR «pieza F» | Cambios, calendario final y totales | Mueve lo mínimo; cada semana ≤ 144; F sigue en su sábado | Añade ideas; cambia formatos; toca la fecha propia |
| `reciclaje` | PUBLICADAS del calendario final, espera 3 semanas, 15 minutos | Tabla, «No se recicla» y total | No supera 144; no recicla piezas con vigencia ni con fecha; no deja piezas idénticas | Recicla el menú de la semana; se pasa de minutos |

## Pendiente de revisión humana
- Confirmar `publishedAt` (2026-09-19).
- Pegar la calculadora en Excel o Google Sheets y comprobar las cifras (ver arriba).
- Probar los cinco prompts y, si se desea, subir capturas y `evidence.pruebas`.
- Las fechas comerciales y los feriados no se tratan: la guía manda a comprobarlos en una fuente oficial del país.
- Enlaces de vuelta sugeridos desde `ideas-de-contenido-para-tu-negocio-con-ia` y `crear-publicaciones-para-redes-sociales-con-ia` (no editadas).
