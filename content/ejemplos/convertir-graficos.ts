import { datosVaciosConvertirGraficos, type DatosConvertirGraficos, type SeleccionColumnas } from "@/lib/convertir-graficos/tipos";

export interface EjemploConvertirGraficos {
  id: string;
  etiqueta: string;
  descripcion: string;
  /** Nombre de archivo ficticio, solo para mostrar (la tabla en sí nace ya como filas, no como un archivo real). */
  nombreOrigen: string;
  /** Filas crudas (encabezado + datos), exactamente como las devolvería el lector de un .csv, un .xlsx o una tabla pegada. */
  filasCrudas: string[][];
  datos: DatosConvertirGraficos;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. «Hallazgos visibles» solo describe patrones, nunca cifras exactas (que la IA nunca calculó). */
  respuesta: string;
}

function datos(seleccion: SeleccionColumnas, p: Partial<Omit<DatosConvertirGraficos, "seleccion">>): DatosConvertirGraficos {
  return { ...datosVaciosConvertirGraficos(), ...p, seleccion };
}

/* ─────────────── Boutique Aurora: ventas por tienda, mes y categoría (plantilla completa) ─────────────── */

const FILAS_BOUTIQUE: string[][] = [
  ["fecha", "tienda", "categoria", "ventas", "visitas"],
  ["15/01/2026", "Norte", "Ropa", "1600", "88"],
  ["15/01/2026", "Norte", "Calzado", "960", "53"],
  ["15/01/2026", "Norte", "Accesorios", "640", "35"],
  ["15/02/2026", "Norte", "Ropa", "1500", "86"],
  ["15/02/2026", "Norte", "Calzado", "900", "52"],
  ["15/02/2026", "Norte", "Accesorios", "600", "34"],
  ["15/03/2026", "Norte", "Ropa", "1400", "75"],
  ["15/03/2026", "Norte", "Calzado", "840", "45"],
  ["15/03/2026", "Norte", "Accesorios", "560", "30"],
  ["15/01/2026", "Sur", "Ropa", "1400", "73"],
  ["15/01/2026", "Sur", "Calzado", "840", "44"],
  ["15/01/2026", "Sur", "Accesorios", "560", "29"],
  ["15/02/2026", "Sur", "Ropa", "1650", "98"],
  ["15/02/2026", "Sur", "Calzado", "990", "59"],
  ["15/02/2026", "Sur", "Accesorios", "660", "39"],
  ["15/03/2026", "Sur", "Ropa", "1950", "113"],
  ["15/03/2026", "Sur", "Calzado", "1170", "68"],
  ["15/03/2026", "Sur", "Accesorios", "780", "45"],
  ["15/01/2026", "Centro", "Ropa", "1000", "63"],
  ["15/01/2026", "Centro", "Calzado", "600", "38"],
  ["15/01/2026", "Centro", "Accesorios", "400", "25"],
  ["15/02/2026", "Centro", "Ropa", "1050", "59"],
  ["15/02/2026", "Centro", "Calzado", "630", "35"],
  ["15/02/2026", "Centro", "Accesorios", "420", "24"],
  ["15/03/2026", "Centro", "Ropa", "1100", "68"],
  ["15/03/2026", "Centro", "Calzado", "660", "41"],
  ["15/03/2026", "Centro", "Accesorios", "440", "27"],
];

const DATOS_BOUTIQUE: DatosConvertirGraficos = datos(
  { x: 1, y: 3, color: null },
  { objetivo: "comparar", audiencia: "jefe", agregacion: "suma", unidad: "S/", modo: "B", nombreOrigen: "ventas-boutique-aurora.csv" },
);

const RESPUESTA_BOUTIQUE = `## Gráficos sugeridos
\`\`\`csv
pregunta,tipo,x,y,color,agregacion,titulo,advertencia
¿Qué tienda vendió más en el trimestre?,barras,tienda,ventas,,suma,Sur superó a las otras 2 tiendas en el trimestre,Compara el mismo período (3 meses) en las 3 tiendas
¿Cómo evolucionaron las ventas de cada tienda?,lineas,fecha,ventas,tienda,suma,Sur creció cada mes; Norte bajó levemente,Solo 3 meses: una tendencia corta puede cambiar
¿Qué categoría compone más las ventas?,pastel,categoria,ventas,,suma,Ropa concentra la mayor parte de las ventas,Con 3 categorías el pastel es legible; con más de 5 usa barras
¿Las visitas se relacionan con las ventas?,dispersion,visitas,ventas,,suma,"A más visitas por fila, más ventas por fila","Una correlación alta no prueba que las visitas por sí solas causen las ventas: el tamaño de cada tienda también podría explicarlo"
\`\`\`

## Hallazgos visibles
- En el gráfico de barras, la tienda Sur queda por encima de Norte y de Centro en el total del trimestre.
- En las líneas, Sur sube mes a mes, Norte baja levemente y Centro se mantiene casi plano.
- En el pastel, Ropa es la categoría más grande, seguida de Calzado y, más abajo, Accesorios.
- En la dispersión, las filas con más visitas tienden a ubicarse también más arriba en ventas: los puntos siguen una tendencia clara, sin ser una línea perfecta.

## Transformaciones aplicadas
- Los 3 primeros gráficos suman las ventas (o las visitas) porque la pregunta busca el total del período, no un promedio por fila.
- El gráfico de dispersión no agrega nada: cada fila del archivo es un punto, para ver la relación fila por fila.

## Qué gráfico usar para cada objetivo
- Para comparar el total de 3 tiendas, usa barras ordenadas de mayor a menor: se lee en un vistazo.
- Para ver cómo cambia cada tienda mes a mes, usa líneas, una por tienda (por eso el color = tienda).
- Para ver qué parte del total aporta cada categoría, el pastel funciona bien con 3; si tuvieras más de 5, usa barras en su lugar.
- Para ver si 2 columnas numéricas se mueven juntas, usa dispersión, nunca una línea (no hay un orden temporal entre los puntos).

## Qué debes verificar
- Confirma que las 3 tiendas estuvieron abiertas los mismos días en cada mes antes de comparar sus totales.
- Revisa si alguna tienda tuvo una promoción que no aplicó a las demás en el período.
- La categoría «Accesorios» es la más chica: confirma que no falten filas de esa categoría en el archivo.

## Siguiente paso
- Revisa los 4 gráficos generados en esta página y ajusta las columnas si alguno no responde tu pregunta.`;

/* ─────────────── Soporte técnico: tiempo de respuesta y calificación (encuesta pequeña) ─────────────── */

const FILAS_ENCUESTA: string[][] = [
  ["cliente", "canal", "tiempo_respuesta_min", "calificacion"],
  ["Cliente 1", "WhatsApp", "5", "5"],
  ["Cliente 2", "WhatsApp", "8", "5"],
  ["Cliente 3", "WhatsApp", "12", "4"],
  ["Cliente 4", "Correo", "40", "3"],
  ["Cliente 5", "Correo", "55", "2"],
  ["Cliente 6", "Correo", "30", "3"],
  ["Cliente 7", "Telefono", "15", "4"],
  ["Cliente 8", "Telefono", "20", "4"],
  ["Cliente 9", "Telefono", "10", "5"],
  ["Cliente 10", "WhatsApp", "6", "5"],
  ["Cliente 11", "Correo", "65", "1"],
  ["Cliente 12", "WhatsApp", "18", "3"],
  ["Cliente 13", "Telefono", "25", "3"],
  ["Cliente 14", "Correo", "35", "3"],
  ["Cliente 15", "WhatsApp", "9", "4"],
  ["Cliente 16", "Telefono", "45", "2"],
  ["Cliente 17", "WhatsApp", "7", "5"],
  ["Cliente 18", "Correo", "22", "4"],
  ["Cliente 19", "Telefono", "14", "4"],
  ["Cliente 20", "WhatsApp", "50", "2"],
];

const DATOS_ENCUESTA: DatosConvertirGraficos = datos(
  { x: 2, y: 3, color: null },
  { objetivo: "relacionar", audiencia: "yo", agregacion: "promedio", unidad: "", modo: "A", nombreOrigen: "encuesta-soporte.xlsx" },
);

const RESPUESTA_ENCUESTA = `## Gráficos sugeridos
\`\`\`csv
pregunta,tipo,x,y,color,agregacion,titulo,advertencia
¿El tiempo de respuesta se relaciona con la calificación?,dispersion,tiempo_respuesta_min,calificacion,,promedio,"A más minutos de espera, calificaciones más bajas",Una correlación fuerte no prueba que la espera sea la única causa
¿Cómo se reparten las calificaciones?,histograma,calificacion,,,conteo,La mayoría de las calificaciones están entre 3 y 5,"Con solo 20 respuestas, una encuesta más grande daría un panorama más confiable"
¿Qué canal recibe mejor calificación en promedio?,barras,canal,calificacion,,promedio,WhatsApp tiene el promedio más alto de los 3 canales,El promedio esconde diferencias entre clientes dentro de un mismo canal
¿Cuántas respuestas llegaron por cada canal?,pastel,canal,,,conteo,WhatsApp concentra la mayoría de las respuestas,Revisa si ese reparto refleja cómo contactan realmente tus clientes o solo cómo respondió la encuesta
\`\`\`

## Hallazgos visibles
- En la dispersión, los puntos con más minutos de espera tienden a caer en calificaciones más bajas: la tendencia es clara y consistente.
- En el histograma, la mayoría de las respuestas se concentran en las calificaciones altas, con pocas respuestas en la calificación más baja.
- En las barras, WhatsApp queda por encima de Teléfono y de Correo en la calificación promedio.
- En el pastel, WhatsApp también es el canal con más respuestas del total.

## Transformaciones aplicadas
- La dispersión no agrega nada: cada respuesta de la encuesta es un punto.
- El histograma cuenta cuántas respuestas caen en cada franja de calificación (1 a 5), sin sumar ni promediar.
- Las barras promedian la calificación por canal, porque la pregunta compara la experiencia típica, no el total de puntos.
- El pastel cuenta cuántas respuestas llegaron por cada canal, no su calificación.

## Qué gráfico usar para cada objetivo
- Para ver si 2 variables numéricas se relacionan (tiempo y calificación), usa dispersión.
- Para ver cómo se reparten los valores de una sola variable numérica (calificación), usa un histograma.
- Para comparar un promedio entre pocas categorías (3 canales), usa barras.
- Para ver qué parte del total aporta cada canal en número de respuestas, el pastel funciona bien con 3 canales.

## Qué debes verificar
- Confirma que «tiempo de respuesta» se midió de la misma forma en los 3 canales (por ejemplo, que no cuenta tiempo fuera de horario de atención).
- Revisa si el reparto de respuestas por canal refleja a todos tus clientes o solo a los que respondieron la encuesta.
- Con 20 respuestas, trata cualquier diferencia pequeña entre canales con cautela.

## Siguiente paso
- Revisa los 4 gráficos generados en esta página y decide qué canal necesita mejorar primero su tiempo de respuesta.`;

export const EJEMPLOS_CONVERTIR_GRAFICOS: EjemploConvertirGraficos[] = [
  { id: "boutique", etiqueta: "Boutique Aurora (ventas por tienda)", descripcion: "El ejemplo de la especificación: ventas de 3 tiendas por mes y categoría, con los 4 objetivos (comparar, evolucionar, componer, relacionar).", nombreOrigen: DATOS_BOUTIQUE.nombreOrigen, filasCrudas: FILAS_BOUTIQUE, datos: DATOS_BOUTIQUE, respuesta: RESPUESTA_BOUTIQUE },
  { id: "encuesta", etiqueta: "Encuesta de soporte técnico (20 respuestas)", descripcion: "Una tabla más pequeña, pensada para distribución y relación entre 2 variables numéricas.", nombreOrigen: DATOS_ENCUESTA.nombreOrigen, filasCrudas: FILAS_ENCUESTA, datos: DATOS_ENCUESTA, respuesta: RESPUESTA_ENCUESTA },
];
