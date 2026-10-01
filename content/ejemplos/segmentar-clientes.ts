import { datosVaciosSegmentarClientes, mapeoVacio, nombresRfmPorDefecto, type DatosSegmentarClientes, type MapeoColumnas } from "@/lib/segmentar-clientes/tipos";

export interface EjemploSegmentarClientes {
  id: string;
  etiqueta: string;
  descripcion: string;
  /** Nombre de archivo ficticio, solo para mostrar (la tabla en sí nace ya como filas, no como un archivo real). */
  nombreOrigen: string;
  /** Filas crudas (encabezado + datos), exactamente como las devolvería el lector de un .csv o un .xlsx. */
  filasCrudas: string[][];
  datos: DatosSegmentarClientes;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Cada cifra citada en «Segmentos (datos)» coincide, verificada por código, con la tabla que calcula esta página. */
  respuesta: string;
}

function datos(mapeo: MapeoColumnas, p: Partial<Omit<DatosSegmentarClientes, "mapeo">>): DatosSegmentarClientes {
  return { ...datosVaciosSegmentarClientes(), ...p, mapeo };
}

/* ─────────────── Bicicletas Andina: transacciones de 70 clientes, método RFM (plantilla completa) ─────────────── */

const FILAS_BICICLETAS: string[][] = [
  ["cliente", "fecha", "importe", "canal", "categoria"],
  ["CLI-001", "29/06/2026", "198", "Web", "Accesorios"],
  ["CLI-001", "28/05/2026", "213", "Tienda", "Accesorios"],
  ["CLI-001", "26/04/2026", "326", "Tienda", "Bicicletas"],
  ["CLI-001", "02/04/2026", "288", "Tienda", "Accesorios"],
  ["CLI-001", "20/03/2026", "380", "Tienda", "Repuestos"],
  ["CLI-001", "23/02/2026", "241", "Web", "Repuestos"],
  ["CLI-002", "17/06/2026", "332", "Web", "Accesorios"],
  ["CLI-002", "04/06/2026", "219", "Tienda", "Accesorios"],
  ["CLI-002", "09/05/2026", "166", "Tienda", "Accesorios"],
  ["CLI-002", "03/04/2026", "259", "Web", "Repuestos"],
  ["CLI-002", "09/03/2026", "185", "Tienda", "Repuestos"],
  ["CLI-002", "08/02/2026", "389", "Web", "Repuestos"],
  ["CLI-003", "25/06/2026", "362", "Web", "Repuestos"],
  ["CLI-003", "19/05/2026", "203", "Web", "Bicicletas"],
  ["CLI-003", "29/04/2026", "277", "Tienda", "Bicicletas"],
  ["CLI-003", "06/04/2026", "199", "Web", "Bicicletas"],
  ["CLI-003", "10/03/2026", "322", "Web", "Accesorios"],
  ["CLI-003", "10/02/2026", "350", "Tienda", "Repuestos"],
  ["CLI-004", "16/06/2026", "349", "Tienda", "Accesorios"],
  ["CLI-004", "03/06/2026", "211", "Tienda", "Accesorios"],
  ["CLI-004", "08/05/2026", "225", "Tienda", "Repuestos"],
  ["CLI-004", "15/04/2026", "333", "Web", "Repuestos"],
  ["CLI-004", "13/03/2026", "369", "Tienda", "Bicicletas"],
  ["CLI-004", "17/02/2026", "349", "Tienda", "Bicicletas"],
  ["CLI-005", "16/06/2026", "356", "Web", "Accesorios"],
  ["CLI-005", "03/06/2026", "361", "Tienda", "Repuestos"],
  ["CLI-005", "09/05/2026", "310", "Web", "Repuestos"],
  ["CLI-005", "14/04/2026", "302", "Tienda", "Accesorios"],
  ["CLI-005", "14/03/2026", "168", "Web", "Accesorios"],
  ["CLI-006", "14/06/2026", "341", "Web", "Accesorios"],
  ["CLI-006", "16/05/2026", "211", "Web", "Bicicletas"],
  ["CLI-006", "07/05/2026", "304", "Web", "Accesorios"],
  ["CLI-006", "13/04/2026", "263", "Web", "Repuestos"],
  ["CLI-007", "28/06/2026", "170", "Web", "Bicicletas"],
  ["CLI-007", "17/05/2026", "279", "Web", "Accesorios"],
  ["CLI-007", "09/05/2026", "355", "Web", "Repuestos"],
  ["CLI-007", "04/04/2026", "278", "Web", "Bicicletas"],
  ["CLI-007", "16/03/2026", "271", "Web", "Bicicletas"],
  ["CLI-008", "25/06/2026", "233", "Web", "Bicicletas"],
  ["CLI-008", "25/05/2026", "203", "Tienda", "Accesorios"],
  ["CLI-008", "29/04/2026", "241", "Web", "Accesorios"],
  ["CLI-008", "13/04/2026", "171", "Tienda", "Accesorios"],
  ["CLI-008", "13/03/2026", "227", "Web", "Accesorios"],
  ["CLI-008", "06/02/2026", "252", "Web", "Repuestos"],
  ["CLI-009", "17/06/2026", "156", "Web", "Repuestos"],
  ["CLI-009", "27/05/2026", "374", "Web", "Bicicletas"],
  ["CLI-009", "22/04/2026", "339", "Web", "Repuestos"],
  ["CLI-009", "31/03/2026", "243", "Tienda", "Repuestos"],
  ["CLI-009", "21/03/2026", "241", "Tienda", "Repuestos"],
  ["CLI-009", "21/02/2026", "381", "Web", "Repuestos"],
  ["CLI-009", "20/01/2026", "278", "Tienda", "Repuestos"],
  ["CLI-010", "26/06/2026", "232", "Web", "Repuestos"],
  ["CLI-010", "18/05/2026", "305", "Web", "Accesorios"],
  ["CLI-010", "06/05/2026", "329", "Web", "Accesorios"],
  ["CLI-010", "28/03/2026", "286", "Tienda", "Accesorios"],
  ["CLI-010", "10/03/2026", "282", "Web", "Bicicletas"],
  ["CLI-011", "12/06/2026", "205", "Tienda", "Repuestos"],
  ["CLI-011", "23/04/2026", "177", "Tienda", "Bicicletas"],
  ["CLI-011", "18/04/2026", "223", "Web", "Accesorios"],
  ["CLI-011", "28/03/2026", "221", "Web", "Bicicletas"],
  ["CLI-012", "05/05/2026", "141", "Web", "Accesorios"],
  ["CLI-012", "16/04/2026", "104", "Tienda", "Repuestos"],
  ["CLI-012", "24/03/2026", "168", "Tienda", "Repuestos"],
  ["CLI-012", "05/03/2026", "197", "Web", "Accesorios"],
  ["CLI-012", "21/02/2026", "159", "Tienda", "Accesorios"],
  ["CLI-013", "29/05/2026", "200", "Web", "Bicicletas"],
  ["CLI-013", "30/04/2026", "241", "Web", "Bicicletas"],
  ["CLI-013", "19/03/2026", "111", "Tienda", "Bicicletas"],
  ["CLI-013", "31/03/2026", "167", "Web", "Accesorios"],
  ["CLI-013", "17/02/2026", "111", "Tienda", "Accesorios"],
  ["CLI-014", "28/05/2026", "161", "Web", "Repuestos"],
  ["CLI-014", "26/04/2026", "156", "Web", "Bicicletas"],
  ["CLI-014", "31/03/2026", "224", "Tienda", "Bicicletas"],
  ["CLI-015", "16/05/2026", "210", "Tienda", "Accesorios"],
  ["CLI-015", "09/05/2026", "179", "Web", "Bicicletas"],
  ["CLI-015", "15/04/2026", "235", "Web", "Accesorios"],
  ["CLI-015", "28/03/2026", "211", "Tienda", "Bicicletas"],
  ["CLI-015", "28/01/2026", "180", "Web", "Bicicletas"],
  ["CLI-016", "17/05/2026", "173", "Tienda", "Repuestos"],
  ["CLI-016", "21/05/2026", "190", "Web", "Accesorios"],
  ["CLI-016", "16/04/2026", "117", "Tienda", "Bicicletas"],
  ["CLI-017", "05/05/2026", "151", "Tienda", "Repuestos"],
  ["CLI-017", "16/04/2026", "168", "Tienda", "Accesorios"],
  ["CLI-017", "12/04/2026", "174", "Tienda", "Bicicletas"],
  ["CLI-018", "13/06/2026", "202", "Tienda", "Accesorios"],
  ["CLI-018", "07/04/2026", "133", "Web", "Accesorios"],
  ["CLI-018", "25/03/2026", "226", "Web", "Accesorios"],
  ["CLI-018", "27/03/2026", "191", "Web", "Accesorios"],
  ["CLI-019", "14/06/2026", "248", "Web", "Bicicletas"],
  ["CLI-019", "10/04/2026", "123", "Web", "Accesorios"],
  ["CLI-019", "03/04/2026", "216", "Web", "Repuestos"],
  ["CLI-020", "07/05/2026", "217", "Tienda", "Repuestos"],
  ["CLI-020", "07/05/2026", "243", "Web", "Accesorios"],
  ["CLI-020", "24/04/2026", "119", "Web", "Repuestos"],
  ["CLI-020", "04/03/2026", "210", "Tienda", "Accesorios"],
  ["CLI-021", "06/05/2026", "206", "Tienda", "Accesorios"],
  ["CLI-021", "15/04/2026", "248", "Tienda", "Repuestos"],
  ["CLI-021", "19/03/2026", "238", "Web", "Accesorios"],
  ["CLI-021", "24/02/2026", "238", "Web", "Bicicletas"],
  ["CLI-021", "22/01/2026", "172", "Tienda", "Accesorios"],
  ["CLI-022", "20/05/2026", "247", "Tienda", "Repuestos"],
  ["CLI-022", "12/04/2026", "238", "Tienda", "Accesorios"],
  ["CLI-022", "29/03/2026", "191", "Web", "Bicicletas"],
  ["CLI-022", "18/02/2026", "215", "Tienda", "Accesorios"],
  ["CLI-023", "31/05/2026", "239", "Tienda", "Repuestos"],
  ["CLI-023", "14/05/2026", "160", "Tienda", "Accesorios"],
  ["CLI-023", "28/03/2026", "244", "Web", "Bicicletas"],
  ["CLI-023", "22/02/2026", "229", "Tienda", "Bicicletas"],
  ["CLI-024", "24/05/2026", "147", "Tienda", "Repuestos"],
  ["CLI-024", "25/04/2026", "219", "Tienda", "Repuestos"],
  ["CLI-024", "05/04/2026", "185", "Tienda", "Accesorios"],
  ["CLI-024", "20/02/2026", "126", "Web", "Accesorios"],
  ["CLI-024", "27/01/2026", "230", "Web", "Bicicletas"],
  ["CLI-025", "13/05/2026", "227", "Web", "Bicicletas"],
  ["CLI-025", "17/04/2026", "211", "Tienda", "Repuestos"],
  ["CLI-025", "02/04/2026", "213", "Tienda", "Repuestos"],
  ["CLI-025", "27/02/2026", "181", "Tienda", "Repuestos"],
  ["CLI-025", "05/03/2026", "171", "Web", "Accesorios"],
  ["CLI-026", "24/05/2026", "201", "Web", "Repuestos"],
  ["CLI-026", "24/04/2026", "246", "Tienda", "Accesorios"],
  ["CLI-026", "02/04/2026", "214", "Tienda", "Accesorios"],
  ["CLI-026", "07/03/2026", "183", "Tienda", "Accesorios"],
  ["CLI-027", "10/05/2026", "217", "Tienda", "Bicicletas"],
  ["CLI-027", "15/05/2026", "159", "Tienda", "Accesorios"],
  ["CLI-027", "28/03/2026", "170", "Tienda", "Bicicletas"],
  ["CLI-027", "19/02/2026", "113", "Tienda", "Bicicletas"],
  ["CLI-028", "20/05/2026", "110", "Tienda", "Repuestos"],
  ["CLI-028", "11/05/2026", "248", "Tienda", "Repuestos"],
  ["CLI-028", "22/04/2026", "186", "Web", "Bicicletas"],
  ["CLI-029", "21/01/2026", "236", "Tienda", "Bicicletas"],
  ["CLI-029", "28/01/2026", "129", "Web", "Accesorios"],
  ["CLI-029", "11/11/2025", "232", "Tienda", "Repuestos"],
  ["CLI-029", "30/09/2025", "163", "Web", "Accesorios"],
  ["CLI-030", "01/02/2026", "277", "Web", "Repuestos"],
  ["CLI-030", "14/01/2026", "124", "Tienda", "Bicicletas"],
  ["CLI-030", "27/11/2025", "239", "Web", "Bicicletas"],
  ["CLI-030", "10/11/2025", "150", "Web", "Repuestos"],
  ["CLI-030", "03/11/2025", "140", "Web", "Accesorios"],
  ["CLI-031", "29/01/2026", "279", "Web", "Repuestos"],
  ["CLI-031", "25/11/2025", "151", "Tienda", "Repuestos"],
  ["CLI-031", "08/12/2025", "265", "Tienda", "Accesorios"],
  ["CLI-031", "25/10/2025", "137", "Web", "Repuestos"],
  ["CLI-031", "31/10/2025", "153", "Tienda", "Repuestos"],
  ["CLI-032", "24/02/2026", "121", "Tienda", "Accesorios"],
  ["CLI-032", "14/12/2025", "296", "Tienda", "Repuestos"],
  ["CLI-032", "06/11/2025", "135", "Web", "Bicicletas"],
  ["CLI-032", "09/11/2025", "188", "Tienda", "Bicicletas"],
  ["CLI-033", "12/01/2026", "262", "Tienda", "Repuestos"],
  ["CLI-033", "18/11/2025", "280", "Tienda", "Repuestos"],
  ["CLI-033", "29/11/2025", "137", "Tienda", "Repuestos"],
  ["CLI-033", "30/11/2025", "236", "Web", "Bicicletas"],
  ["CLI-034", "27/12/2025", "256", "Web", "Accesorios"],
  ["CLI-034", "25/12/2025", "257", "Tienda", "Repuestos"],
  ["CLI-034", "20/12/2025", "283", "Web", "Bicicletas"],
  ["CLI-035", "21/01/2026", "227", "Tienda", "Bicicletas"],
  ["CLI-035", "20/01/2026", "170", "Web", "Repuestos"],
  ["CLI-035", "15/11/2025", "246", "Tienda", "Repuestos"],
  ["CLI-035", "01/12/2025", "141", "Tienda", "Bicicletas"],
  ["CLI-035", "06/11/2025", "264", "Web", "Accesorios"],
  ["CLI-036", "21/01/2026", "183", "Tienda", "Accesorios"],
  ["CLI-036", "03/12/2025", "237", "Tienda", "Repuestos"],
  ["CLI-036", "29/12/2025", "128", "Web", "Bicicletas"],
  ["CLI-036", "05/11/2025", "160", "Web", "Bicicletas"],
  ["CLI-036", "08/10/2025", "273", "Web", "Bicicletas"],
  ["CLI-037", "21/02/2026", "123", "Web", "Accesorios"],
  ["CLI-037", "13/12/2025", "157", "Web", "Bicicletas"],
  ["CLI-037", "07/12/2025", "299", "Web", "Accesorios"],
  ["CLI-037", "16/11/2025", "280", "Tienda", "Accesorios"],
  ["CLI-037", "19/10/2025", "140", "Tienda", "Repuestos"],
  ["CLI-038", "24/12/2025", "201", "Web", "Repuestos"],
  ["CLI-038", "01/12/2025", "175", "Tienda", "Bicicletas"],
  ["CLI-038", "28/12/2025", "180", "Tienda", "Bicicletas"],
  ["CLI-039", "14/06/2026", "105", "Web", "Accesorios"],
  ["CLI-040", "18/06/2026", "169", "Web", "Bicicletas"],
  ["CLI-041", "13/06/2026", "126", "Web", "Bicicletas"],
  ["CLI-042", "28/06/2026", "128", "Web", "Accesorios"],
  ["CLI-043", "12/06/2026", "91", "Tienda", "Bicicletas"],
  ["CLI-044", "30/06/2026", "117", "Web", "Accesorios"],
  ["CLI-045", "10/06/2026", "142", "Tienda", "Accesorios"],
  ["CLI-046", "16/06/2026", "164", "Tienda", "Bicicletas"],
  ["CLI-047", "30/06/2026", "138", "Tienda", "Repuestos"],
  ["CLI-048", "18/06/2026", "132", "Tienda", "Repuestos"],
  ["CLI-049", "06/06/2026", "98", "Tienda", "Accesorios"],
  ["CLI-050", "30/06/2026", "109", "Web", "Repuestos"],
  ["CLI-051", "14/06/2026", "79", "Web", "Accesorios"],
  ["CLI-052", "21/06/2026", "78", "Tienda", "Bicicletas"],
  ["CLI-053", "04/11/2025", "133", "Tienda", "Bicicletas"],
  ["CLI-054", "24/10/2025", "54", "Tienda", "Repuestos"],
  ["CLI-054", "21/10/2025", "104", "Web", "Repuestos"],
  ["CLI-055", "16/11/2025", "51", "Tienda", "Bicicletas"],
  ["CLI-055", "11/09/2025", "50", "Tienda", "Accesorios"],
  ["CLI-056", "15/08/2025", "145", "Tienda", "Accesorios"],
  ["CLI-057", "16/08/2025", "127", "Web", "Accesorios"],
  ["CLI-058", "27/10/2025", "117", "Web", "Bicicletas"],
  ["CLI-059", "08/11/2025", "112", "Web", "Accesorios"],
  ["CLI-060", "15/10/2025", "44", "Tienda", "Accesorios"],
  ["CLI-060", "04/10/2025", "42", "Web", "Bicicletas"],
  ["CLI-061", "25/10/2025", "57", "Web", "Repuestos"],
  ["CLI-062", "30/11/2025", "101", "Web", "Accesorios"],
  ["CLI-063", "25/10/2025", "45", "Web", "Accesorios"],
  ["CLI-063", "10/11/2025", "111", "Tienda", "Repuestos"],
  ["CLI-064", "18/08/2025", "65", "Tienda", "Bicicletas"],
  ["CLI-064", "13/09/2025", "83", "Web", "Bicicletas"],
  ["CLI-065", "20/09/2025", "61", "Web", "Bicicletas"],
  ["CLI-065", "18/08/2025", "84", "Web", "Accesorios"],
  ["CLI-066", "09/12/2025", "113", "Tienda", "Bicicletas"],
  ["CLI-067", "19/08/2025", "97", "Tienda", "Repuestos"],
  ["CLI-068", "08/10/2025", "62", "Tienda", "Accesorios"],
  ["CLI-068", "08/10/2025", "75", "Web", "Bicicletas"],
  ["CLI-069", "18/08/2025", "124", "Web", "Repuestos"],
  ["CLI-069", "04/10/2025", "126", "Tienda", "Repuestos"],
  ["CLI-070", "19/09/2025", "78", "Web", "Accesorios"],
];

const MAPEO_BICICLETAS: MapeoColumnas = { ...mapeoVacio(), clienteId: 0, fecha: 1, importe: 2, canal: 3, categoria: 4 };

const DATOS_BICICLETAS: DatosSegmentarClientes = datos(MAPEO_BICICLETAS, {
  origenDatos: "transacciones",
  fechaReferencia: "2026-06-30",
  metodo: "rfm",
  tamanoMinimoSegmento: "10",
  negocio: "Tienda de bicicletas y accesorios, con venta en tienda física y por web",
  modo: "B",
  nombreOrigen: "ventas-bicicletas-andina.csv",
});

const RESPUESTA_BICICLETAS = `## Segmentos (datos)
- Clientes leales: 18 clientes (25.71% de la base), 33.66% de los ingresos, recencia media 38 días, 4.06 pedidos en promedio, gasto medio S/ 786.17.
- Perdidos: 14 clientes (20% de la base), 3.76% de los ingresos, recencia media 256 días, 1.29 pedidos en promedio, gasto medio S/ 112.93.
- Nuevos: 14 clientes (20% de la base), 3.99% de los ingresos, recencia media 11 días, 1 pedido en promedio, gasto medio S/ 119.71.
- Campeones: 10 clientes (14.29% de la base), 36.25% de los ingresos, recencia media 10 días, 5.6 pedidos en promedio, gasto medio S/ 1524.
- En riesgo: 8 clientes (11.43% de la base), 17.5% de los ingresos, recencia media 150 días, 4.63 pedidos en promedio, gasto medio S/ 919.75.
- Regulares: 6 clientes (8.57% de la base), 4.83% de los ingresos, recencia media 246 días, 2.33 pedidos en promedio, gasto medio S/ 338.67.

## Perfiles [INTERPRETACIÓN]
- [INTERPRETACIÓN] Campeones es el segmento más chico (10 clientes) pero el que más factura: parecen compradores recurrentes de piezas de mayor valor, como la bicicleta misma.
- [INTERPRETACIÓN] Clientes leales podría ser el motor estable del negocio: compran con cierta regularidad, aunque con un ticket menor que Campeones.
- [INTERPRETACIÓN] Nuevos son compras muy recientes con 1 solo pedido: todavía no se sabe si volverán a comprar.
- [INTERPRETACIÓN] En riesgo parece gente que solía comprar seguido y dejó de hacerlo hace unos 5 meses: podrían estar comprando en otro lado.
- [INTERPRETACIÓN] Perdidos probablemente ya no ve a la tienda como su primera opción.

## Calidad de la segmentación
- Regulares (6 clientes) queda por debajo del tamaño mínimo definido (10): es un grupo mixto, sin un patrón claro, y conviene no diseñarle una campaña propia todavía.
- Nuevos y Perdidos tienen un gasto medio parecido (S/ 119.71 y S/ 112.93): la diferencia real entre ambos es la recencia, no el monto, así que conviene tratarlos distinto aunque gasten parecido.

## Acciones a probar por segmento
- Campeones: objetivo retener; probar invitarlos a un programa de mantenimiento preferente; métrica: % que agenda un mantenimiento en 60 días; riesgo: ofrecer un beneficio a quien de todas formas iba a volver.
- Clientes leales: objetivo subir frecuencia; probar un recordatorio de mantenimiento a los 90 días de su última compra; métrica: % que compra antes de los 90 días del recordatorio; riesgo: saturar con mensajes a quien ya compra seguido.
- En riesgo: objetivo reactivar; probar un mensaje personalizado preguntando si necesitan ayuda con su bicicleta actual, sin descuento; métrica: % que vuelve a comprar en 30 días; riesgo: que el mensaje se sienta genérico si no menciona su última compra.
- Nuevos: objetivo convertir en recurrentes; probar un contenido educativo (cuidado básico de la bicicleta) a los 15 días de su compra; métrica: % que hace una 2ª compra en 90 días; riesgo: pedirles una reseña demasiado pronto, antes de que prueben el producto.
- Perdidos: objetivo medir si vale la pena reactivarlos; probar una encuesta corta de por qué dejaron de comprar; métrica: tasa de respuesta a la encuesta; riesgo: invertir en una campaña cara para un grupo que podría no reactivarse.

## Datos que faltan
- El motivo de la última visita (compra, reparación, solo cotización) ayudaría a entender mejor a los nuevos.
- Un identificador de qué modelo de bicicleta compró cada cliente permitiría cruzar el segmento con el tipo de producto.

## Qué debes verificar
- Que el tamaño mínimo de 10 clientes siga siendo razonable a medida que crezca la base.
- Que «Regulares» no esconda, en realidad, 2 comportamientos distintos mezclados.
- Que la fecha de referencia (30/06/2026) sea representativa y no coincida con una campaña o feriado atípico.

## Siguiente paso
- Exporta la lista de clientes de «En riesgo» y prueba primero ahí el mensaje de reactivación.`;

/* ─────────────── Librería El Lector: 35 clientes ya resumidos, reglas personalizadas ─────────────── */

const FILAS_LIBRERIA: string[][] = [
  ["cliente", "fecha_ultima_compra", "pedidos", "gasto_total", "ubicacion"],
  ["LEC-001", "09/06/2026", "10", "413", "Surco"],
  ["LEC-002", "05/06/2026", "7", "268", "Surco"],
  ["LEC-003", "08/06/2026", "11", "262", "Barranco"],
  ["LEC-004", "15/06/2026", "10", "249", "Surco"],
  ["LEC-005", "02/06/2026", "10", "201", "Miraflores"],
  ["LEC-006", "26/06/2026", "11", "348", "San Isidro"],
  ["LEC-007", "25/06/2026", "8", "246", "Barranco"],
  ["LEC-008", "27/06/2026", "9", "243", "Barranco"],
  ["LEC-009", "24/05/2026", "9", "280", "Miraflores"],
  ["LEC-010", "22/03/2026", "4", "261", "Surco"],
  ["LEC-011", "18/01/2026", "5", "192", "Miraflores"],
  ["LEC-012", "27/12/2025", "8", "252", "San Isidro"],
  ["LEC-013", "24/02/2026", "5", "165", "Surco"],
  ["LEC-014", "13/01/2026", "7", "336", "San Isidro"],
  ["LEC-015", "10/02/2026", "9", "338", "San Isidro"],
  ["LEC-016", "25/03/2026", "5", "222", "Miraflores"],
  ["LEC-017", "23/12/2025", "7", "166", "Surco"],
  ["LEC-018", "26/02/2026", "9", "291", "San Isidro"],
  ["LEC-019", "31/12/2025", "7", "174", "Barranco"],
  ["LEC-020", "06/05/2026", "2", "69", "Surco"],
  ["LEC-021", "25/05/2026", "2", "59", "Surco"],
  ["LEC-022", "02/06/2026", "2", "106", "Surco"],
  ["LEC-023", "07/05/2026", "3", "69", "Surco"],
  ["LEC-024", "23/06/2026", "2", "93", "Miraflores"],
  ["LEC-025", "07/05/2026", "3", "38", "Miraflores"],
  ["LEC-026", "21/06/2026", "3", "118", "San Isidro"],
  ["LEC-027", "19/05/2026", "2", "50", "Miraflores"],
  ["LEC-028", "17/07/2025", "1", "40", "San Isidro"],
  ["LEC-029", "12/06/2025", "2", "40", "Barranco"],
  ["LEC-030", "03/10/2025", "1", "72", "Miraflores"],
  ["LEC-031", "04/07/2025", "1", "58", "Barranco"],
  ["LEC-032", "22/09/2025", "2", "56", "Miraflores"],
  ["LEC-033", "16/10/2025", "1", "62", "Surco"],
  ["LEC-034", "12/09/2025", "1", "40", "San Isidro"],
  ["LEC-035", "27/05/2025", "1", "54", "Barranco"],
];

const MAPEO_LIBRERIA: MapeoColumnas = { ...mapeoVacio(), clienteId: 0, fecha: 1, pedidos: 2, importe: 3, ubicacion: 4 };

const DATOS_LIBRERIA: DatosSegmentarClientes = datos(MAPEO_LIBRERIA, {
  origenDatos: "clientes",
  fechaReferencia: "2026-06-30",
  metodo: "reglas",
  tamanoMinimoSegmento: "5",
  nombresRfm: nombresRfmPorDefecto(),
  reglas: [
    { id: "r1", nombre: "Clientes frecuentes", gastoMin: "", gastoMax: "", recenciaMinDias: "", recenciaMaxDias: "60", pedidosMin: "5", pedidosMax: "" },
    { id: "r2", nombre: "En riesgo de irse", gastoMin: "", gastoMax: "", recenciaMinDias: "90", recenciaMaxDias: "", pedidosMin: "3", pedidosMax: "" },
  ],
  negocio: "Librería independiente de barrio, con club de lectura mensual",
  modo: "B",
  nombreOrigen: "clientes-libreria-el-lector.csv",
});

const RESPUESTA_LIBRERIA = `## Segmentos (datos)
- Sin segmento: 16 clientes (45.71% de la base), 17.27% de los ingresos, recencia media 180 días, 1.81 pedidos en promedio, gasto medio S/ 64.
- En riesgo de irse: 10 clientes (28.57% de la base), 40.41% de los ingresos, recencia media 147 días, 6.6 pedidos en promedio, gasto medio S/ 239.7.
- Clientes frecuentes: 9 clientes (25.71% de la base), 42.32% de los ingresos, recencia media 18 días, 9.44 pedidos en promedio, gasto medio S/ 278.89.

## Perfiles [INTERPRETACIÓN]
- [INTERPRETACIÓN] Clientes frecuentes parece el núcleo del club de lectura: compran seguido y recién, con el gasto medio más alto de los 3 grupos.
- [INTERPRETACIÓN] En riesgo de irse podría ser gente que fue frecuente en el pasado (6.6 pedidos en promedio) y dejó de venir hace unos 5 meses.
- [INTERPRETACIÓN] Sin segmento mezcla compradores ocasionales recientes con clientes inactivos desde hace mucho: no es un perfil único.

## Calidad de la segmentación
- Los 3 segmentos superan el tamaño mínimo definido (5 clientes).
- «Sin segmento» es el grupo más grande (16 clientes) y mezcla 2 comportamientos distintos (ocasionales recientes e inactivos de hace más de 1 año): conviene dividirlo con una tercera regla antes de usarlo para una campaña.
- En riesgo de irse genera casi tanto ingreso (40.41%) como Clientes frecuentes (42.32%) con menos clientes (10 contra 9): perderlos tendría un impacto grande.

## Acciones a probar por segmento
- Clientes frecuentes: objetivo fidelizar; probar invitarlos a elegir el próximo libro del club; métrica: % que participa en la votación; riesgo: pedirles más esfuerzo del que están dispuestos a dar.
- En riesgo de irse: objetivo reactivar; probar un mensaje personal (no una promoción masiva) preguntando qué género leyeron la última vez; métrica: % que compra en 30 días; riesgo: que se sienta una campaña automática y no un gesto genuino.
- Sin segmento: objetivo entender mejor al grupo; antes de una acción, dividir el segmento por recencia (menos de 90 días vs más) y recién ahí definir 2 pruebas distintas; métrica: no aplica todavía; riesgo: gastar presupuesto en un grupo demasiado heterogéneo.

## Datos que faltan
- El género o categoría de libro preferido ayudaría a personalizar la recomendación del club de lectura.
- Si asisten presencialmente al club o compran solo en línea, para saber por qué canal contactarlos.

## Qué debes verificar
- Que «Sin segmento» no esté ocultando un grupo valioso que merece su propia regla.
- Que el umbral de 90 días para «en riesgo» tenga sentido para una librería (no todos compran con la misma frecuencia que en un supermercado).
- Que la ubicación de cada cliente sea donde vive o donde compra, antes de usarla para elegir una sede del club.

## Siguiente paso
- Exporta la lista de «En riesgo de irse» y prueba primero ahí el mensaje personal.`;

export const EJEMPLOS_SEGMENTAR_CLIENTES: EjemploSegmentarClientes[] = [
  { id: "bicicletas", etiqueta: "Bicicletas Andina (70 clientes, RFM)", descripcion: "El flujo completo: un archivo de transacciones que la página agrega por cliente y segmenta con RFM (recencia, frecuencia, valor).", nombreOrigen: DATOS_BICICLETAS.nombreOrigen, filasCrudas: FILAS_BICICLETAS, datos: DATOS_BICICLETAS, respuesta: RESPUESTA_BICICLETAS },
  { id: "libreria", etiqueta: "Librería El Lector (35 clientes, reglas propias)", descripcion: "Un archivo ya resumido (una fila por cliente) segmentado con 2 reglas personalizadas en vez de RFM.", nombreOrigen: DATOS_LIBRERIA.nombreOrigen, filasCrudas: FILAS_LIBRERIA, datos: DATOS_LIBRERIA, respuesta: RESPUESTA_LIBRERIA },
];
