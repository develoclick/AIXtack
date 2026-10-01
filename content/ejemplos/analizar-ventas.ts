import { datosVaciosAnalisisVentas, mapeoVacio, type DatosAnalisisVentas, type MapeoColumnas } from "@/lib/analizar-ventas/tipos";

export interface EjemploAnalisisVentas {
  id: string;
  etiqueta: string;
  descripcion: string;
  /** Nombre de archivo ficticio, solo para mostrar (el archivo en sí nunca existe como tal: nace ya como filas). */
  nombreArchivo: string;
  /** Filas crudas (encabezado + datos), exactamente como las devolvería el lector de un .csv o .xlsx real. */
  filasCrudas: string[][];
  datos: DatosAnalisisVentas;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Cita solo cifras que están en la ficha o en las métricas calculadas por la página (se verifica con pruebas unitarias). */
  respuesta: string;
}

function datos(mapeo: MapeoColumnas, p: Partial<DatosAnalisisVentas>): DatosAnalisisVentas {
  return { ...datosVaciosAnalisisVentas(), mapeo, ...p };
}

/* ─────────────── Ferretería El Tornillo: enero a junio, caída de junio (plantilla completa) ─────────────── */

const MAPEO_FERRETERIA: MapeoColumnas = { ...mapeoVacio(), fecha: 0, producto: 1, categoria: 2, cantidad: 3, precio: 4, importe: 5, vendedor: 6, sucursal: 7, canal: 8 };

const FILAS_FERRETERIA: string[][] = [
  ["fecha", "producto", "categoria", "cantidad", "precio", "importe", "vendedor", "sucursal", "canal"],
  ["02/01/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "Lima Centro", "Mostrador"],
  ["05/01/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "2", "149.9", "299.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["08/01/2026", "Juego de destornilladores", "Herramientas manuales", "3", "35", "105", "Milagros", "Lima Centro", "Mostrador"],
  ["11/01/2026", "Martillo de uña", "Herramientas manuales", "1", "28", "28", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["14/01/2026", "Cemento Sol tipo I", "Materiales", "2", "32.5", "65", "Julio", "Lima Centro", "Mostrador"],
  ["17/01/2026", "Fierro de construcción 1/2\"", "Materiales", "3", "45", "135", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["20/01/2026", "Pintura látex galón", "Materiales", "1", "68", "68", "Rosa", "Lima Centro", "Mostrador"],
  ["23/01/2026", "Taladro percutor 650W", "Herramientas eléctricas", "2", "189.9", "379.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["26/01/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "3", "149.9", "449.7", "Milagros", "Lima Centro", "Mostrador"],
  ["02/01/2026", "Juego de destornilladores", "Herramientas manuales", "1", "35", "35", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["05/01/2026", "Martillo de uña", "Herramientas manuales", "2", "28", "56", "Julio", "Lima Centro", "Mostrador"],
  ["08/01/2026", "Cemento Sol tipo I", "Materiales", "3", "32.5", "97.5", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["11/01/2026", "Fierro de construcción 1/2\"", "Materiales", "1", "45", "45", "Rosa", "Lima Centro", "Mostrador"],
  ["14/01/2026", "Pintura látex galón", "Materiales", "2", "68", "136", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["17/01/2026", "Taladro percutor 650W", "Herramientas eléctricas", "3", "189.9", "569.7", "Milagros", "Lima Centro", "Mostrador"],
  ["20/01/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "1", "149.9", "149.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["23/01/2026", "Juego de destornilladores", "Herramientas manuales", "2", "35", "70", "Julio", "Lima Centro", "Mostrador"],
  ["26/01/2026", "Martillo de uña", "Herramientas manuales", "3", "28", "84", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["02/01/2026", "Cemento Sol tipo I", "Materiales", "1", "32.5", "32.5", "Rosa", "Lima Centro", "Mostrador"],
  ["05/01/2026", "Fierro de construcción 1/2\"", "Materiales", "2", "45", "90", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["03/02/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "Lima Centro", "Mostrador"],
  ["06/02/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "2", "149.9", "299.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["09/02/2026", "Juego de destornilladores", "Herramientas manuales", "3", "35", "105", "Milagros", "Lima Centro", "Mostrador"],
  ["12/02/2026", "Martillo de uña", "Herramientas manuales", "1", "28", "28", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["15/02/2026", "Cemento Sol tipo I", "Materiales", "2", "32.5", "65", "Julio", "Lima Centro", "Mostrador"],
  ["18/02/2026", "Fierro de construcción 1/2\"", "Materiales", "3", "45", "135", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["21/02/2026", "Pintura látex galón", "Materiales", "1", "68", "68", "Rosa", "Lima Centro", "Mostrador"],
  ["24/02/2026", "Taladro percutor 650W", "Herramientas eléctricas", "2", "189.9", "379.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["27/02/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "3", "149.9", "449.7", "Milagros", "Lima Centro", "Mostrador"],
  ["03/02/2026", "Juego de destornilladores", "Herramientas manuales", "1", "35", "35", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["06/02/2026", "Martillo de uña", "Herramientas manuales", "2", "28", "56", "Julio", "Lima Centro", "Mostrador"],
  ["09/02/2026", "Cemento Sol tipo I", "Materiales", "3", "32.5", "97.5", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["12/02/2026", "Fierro de construcción 1/2\"", "Materiales", "1", "45", "45", "Rosa", "Lima Centro", "Mostrador"],
  ["15/02/2026", "Pintura látex galón", "Materiales", "2", "68", "136", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["18/02/2026", "Taladro percutor 650W", "Herramientas eléctricas", "3", "189.9", "569.7", "Milagros", "Lima Centro", "Mostrador"],
  ["21/02/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "1", "149.9", "149.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["24/02/2026", "Juego de destornilladores", "Herramientas manuales", "2", "35", "70", "Julio", "Lima Centro", "Mostrador"],
  ["27/02/2026", "Martillo de uña", "Herramientas manuales", "3", "28", "84", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["03/02/2026", "Cemento Sol tipo I", "Materiales", "1", "32.5", "32.5", "Rosa", "Lima Centro", "Mostrador"],
  ["06/02/2026", "Fierro de construcción 1/2\"", "Materiales", "2", "45", "90", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["09/02/2026", "Pintura látex galón", "Materiales", "3", "68", "204", "Milagros", "Lima Centro", "Mostrador"],
  ["12/02/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["01/03/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "Lima Centro", "Mostrador"],
  ["04/03/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "2", "149.9", "299.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["07/03/2026", "Juego de destornilladores", "Herramientas manuales", "3", "35", "105", "Milagros", "Lima Centro", "Mostrador"],
  ["10/03/2026", "Martillo de uña", "Herramientas manuales", "1", "28", "28", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["13/03/2026", "Cemento Sol tipo I", "Materiales", "2", "32.5", "65", "Julio", "Lima Centro", "Mostrador"],
  ["16/03/2026", "Fierro de construcción 1/2\"", "Materiales", "3", "45", "135", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["19/03/2026", "Pintura látex galón", "Materiales", "1", "68", "68", "Rosa", "Lima Centro", "Mostrador"],
  ["22/03/2026", "Taladro percutor 650W", "Herramientas eléctricas", "2", "189.9", "379.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["25/03/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "3", "149.9", "449.7", "Milagros", "Lima Centro", "Mostrador"],
  ["01/03/2026", "Juego de destornilladores", "Herramientas manuales", "1", "35", "35", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["04/03/2026", "Martillo de uña", "Herramientas manuales", "2", "28", "56", "Julio", "Lima Centro", "Mostrador"],
  ["07/03/2026", "Cemento Sol tipo I", "Materiales", "3", "32.5", "97.5", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["10/03/2026", "Fierro de construcción 1/2\"", "Materiales", "1", "45", "45", "Rosa", "Lima Centro", "Mostrador"],
  ["13/03/2026", "Pintura látex galón", "Materiales", "2", "68", "136", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["16/03/2026", "Taladro percutor 650W", "Herramientas eléctricas", "3", "189.9", "569.7", "Milagros", "Lima Centro", "Mostrador"],
  ["19/03/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "1", "149.9", "149.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["22/03/2026", "Juego de destornilladores", "Herramientas manuales", "2", "35", "70", "Julio", "Lima Centro", "Mostrador"],
  ["25/03/2026", "Martillo de uña", "Herramientas manuales", "3", "28", "84", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["01/03/2026", "Cemento Sol tipo I", "Materiales", "1", "32.5", "32.5", "Rosa", "Lima Centro", "Mostrador"],
  ["04/03/2026", "Fierro de construcción 1/2\"", "Materiales", "2", "45", "90", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["07/03/2026", "Pintura látex galón", "Materiales", "3", "68", "204", "Milagros", "Lima Centro", "Mostrador"],
  ["10/03/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["13/03/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "2", "149.9", "299.8", "Julio", "Lima Centro", "Mostrador"],
  ["16/03/2026", "Juego de destornilladores", "Herramientas manuales", "3", "35", "105", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["02/04/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "Lima Centro", "Mostrador"],
  ["05/04/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "2", "149.9", "299.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["08/04/2026", "Juego de destornilladores", "Herramientas manuales", "3", "35", "105", "Milagros", "Lima Centro", "Mostrador"],
  ["11/04/2026", "Martillo de uña", "Herramientas manuales", "1", "28", "28", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["14/04/2026", "Cemento Sol tipo I", "Materiales", "2", "32.5", "65", "Julio", "Lima Centro", "Mostrador"],
  ["17/04/2026", "Fierro de construcción 1/2\"", "Materiales", "3", "45", "135", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["20/04/2026", "Pintura látex galón", "Materiales", "1", "68", "68", "Rosa", "Lima Centro", "Mostrador"],
  ["23/04/2026", "Taladro percutor 650W", "Herramientas eléctricas", "2", "189.9", "379.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["26/04/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "3", "149.9", "449.7", "Milagros", "Lima Centro", "Mostrador"],
  ["02/04/2026", "Juego de destornilladores", "Herramientas manuales", "1", "35", "35", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["05/04/2026", "Martillo de uña", "Herramientas manuales", "2", "28", "56", "Julio", "Lima Centro", "Mostrador"],
  ["08/04/2026", "Cemento Sol tipo I", "Materiales", "3", "32.5", "97.5", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["11/04/2026", "Fierro de construcción 1/2\"", "Materiales", "1", "45", "45", "Rosa", "Lima Centro", "Mostrador"],
  ["14/04/2026", "Pintura látex galón", "Materiales", "2", "68", "136", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["17/04/2026", "Taladro percutor 650W", "Herramientas eléctricas", "3", "189.9", "569.7", "Milagros", "Lima Centro", "Mostrador"],
  ["20/04/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "1", "149.9", "149.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["23/04/2026", "Juego de destornilladores", "Herramientas manuales", "2", "35", "70", "Julio", "Lima Centro", "Mostrador"],
  ["26/04/2026", "Martillo de uña", "Herramientas manuales", "3", "28", "84", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["02/04/2026", "Cemento Sol tipo I", "Materiales", "1", "32.5", "32.5", "Rosa", "Lima Centro", "Mostrador"],
  ["05/04/2026", "Fierro de construcción 1/2\"", "Materiales", "2", "45", "90", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["08/04/2026", "Pintura látex galón", "Materiales", "3", "68", "204", "Milagros", "Lima Centro", "Mostrador"],
  ["11/04/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["14/04/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "2", "149.9", "299.8", "Julio", "Lima Centro", "Mostrador"],
  ["03/05/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "Lima Centro", "Mostrador"],
  ["06/05/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "2", "149.9", "299.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["09/05/2026", "Juego de destornilladores", "Herramientas manuales", "3", "35", "105", "Milagros", "Lima Centro", "Mostrador"],
  ["12/05/2026", "Martillo de uña", "Herramientas manuales", "1", "28", "28", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["15/05/2026", "Cemento Sol tipo I", "Materiales", "2", "32.5", "65", "Julio", "Lima Centro", "Mostrador"],
  ["18/05/2026", "Fierro de construcción 1/2\"", "Materiales", "3", "45", "135", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["21/05/2026", "Pintura látex galón", "Materiales", "1", "68", "68", "Rosa", "Lima Centro", "Mostrador"],
  ["24/05/2026", "Taladro percutor 650W", "Herramientas eléctricas", "2", "189.9", "379.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["27/05/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "3", "149.9", "449.7", "Milagros", "Lima Centro", "Mostrador"],
  ["03/05/2026", "Juego de destornilladores", "Herramientas manuales", "1", "35", "35", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["06/05/2026", "Martillo de uña", "Herramientas manuales", "2", "28", "56", "Julio", "Lima Centro", "Mostrador"],
  ["09/05/2026", "Cemento Sol tipo I", "Materiales", "3", "32.5", "97.5", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["12/05/2026", "Fierro de construcción 1/2\"", "Materiales", "1", "45", "45", "Rosa", "Lima Centro", "Mostrador"],
  ["15/05/2026", "Pintura látex galón", "Materiales", "2", "68", "136", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["18/05/2026", "Taladro percutor 650W", "Herramientas eléctricas", "3", "189.9", "569.7", "Milagros", "Lima Centro", "Mostrador"],
  ["21/05/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "1", "149.9", "149.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["24/05/2026", "Juego de destornilladores", "Herramientas manuales", "2", "35", "70", "Julio", "Lima Centro", "Mostrador"],
  ["27/05/2026", "Martillo de uña", "Herramientas manuales", "3", "28", "84", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["03/05/2026", "Cemento Sol tipo I", "Materiales", "1", "32.5", "32.5", "Rosa", "Lima Centro", "Mostrador"],
  ["06/05/2026", "Fierro de construcción 1/2\"", "Materiales", "2", "45", "90", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["09/05/2026", "Pintura látex galón", "Materiales", "3", "68", "204", "Milagros", "Lima Centro", "Mostrador"],
  ["12/05/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["15/05/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "2", "149.9", "299.8", "Julio", "Lima Centro", "Mostrador"],
  ["18/05/2026", "Juego de destornilladores", "Herramientas manuales", "3", "35", "105", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["21/05/2026", "Martillo de uña", "Herramientas manuales", "1", "28", "28", "Rosa", "Lima Centro", "Mostrador"],
  ["24/05/2026", "Cemento Sol tipo I", "Materiales", "2", "32.5", "65", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["01/06/2026", "Taladro percutor 650W", "Herramientas eléctricas", "1", "189.9", "189.9", "Rosa", "Lima Centro", "Mostrador"],
  ["04/06/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "2", "149.9", "299.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["07/06/2026", "Juego de destornilladores", "Herramientas manuales", "3", "35", "105", "Milagros", "Lima Centro", "Mostrador"],
  ["10/06/2026", "Martillo de uña", "Herramientas manuales", "1", "28", "28", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["13/06/2026", "Cemento Sol tipo I", "Materiales", "2", "32.5", "65", "Julio", "Lima Centro", "Mostrador"],
  ["16/06/2026", "Fierro de construcción 1/2\"", "Materiales", "3", "45", "135", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["19/06/2026", "Pintura látex galón", "Materiales", "1", "68", "68", "Rosa", "Lima Centro", "Mostrador"],
  ["22/06/2026", "Taladro percutor 650W", "Herramientas eléctricas", "2", "189.9", "379.8", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["25/06/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "3", "149.9", "449.7", "Milagros", "Lima Centro", "Mostrador"],
  ["01/06/2026", "Juego de destornilladores", "Herramientas manuales", "1", "35", "35", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["04/06/2026", "Martillo de uña", "Herramientas manuales", "2", "28", "56", "Julio", "Lima Centro", "Mostrador"],
  ["07/06/2026", "Cemento Sol tipo I", "Materiales", "3", "32.5", "97.5", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["10/06/2026", "Fierro de construcción 1/2\"", "Materiales", "1", "45", "45", "Rosa", "Lima Centro", "Mostrador"],
  ["13/06/2026", "Pintura látex galón", "Materiales", "2", "68", "136", "Julio", "San Juan de Lurigancho", "WhatsApp"],
  ["16/06/2026", "Taladro percutor 650W", "Herramientas eléctricas", "3", "189.9", "569.7", "Milagros", "Lima Centro", "Mostrador"],
  ["19/06/2026", "Esmeril angular 4.5\"", "Herramientas eléctricas", "1", "149.9", "149.9", "Rosa", "San Juan de Lurigancho", "WhatsApp"],
  ["22/06/2026", "Juego de destornilladores", "Herramientas manuales", "2", "35", "70", "Julio", "Lima Centro", "Mostrador"],
  ["25/06/2026", "Martillo de uña", "Herramientas manuales", "3", "28", "84", "Milagros", "San Juan de Lurigancho", "WhatsApp"],
  ["01/06/2026", "Cemento Sol tipo I", "Materiales", "1", "32.5", "32.5", "Rosa", "Lima Centro", "Mostrador"],
];

const DATOS_FERRETERIA: DatosAnalisisVentas = datos(MAPEO_FERRETERIA, {
  moneda: "S/",
  periodoDesde: "01/06/2026",
  periodoHasta: "30/06/2026",
  comparacionDesde: "01/05/2026",
  comparacionHasta: "30/05/2026",
  objetivo: "Entender por qué las ventas de junio se sintieron más bajas que las de mayo",
  contexto: "No hubo ninguna promoción activa en mayo ni en junio",
  modo: "B",
  nombreArchivo: "ventas-ferreteria-enero-junio.csv",
});

const RESPUESTA_FERRETERIA = `## Calidad de datos
- No se detectaron importes negativos, fechas fuera de rango ni filas duplicadas en los 134 registros de enero a junio.
- Tampoco hay filas sin fecha o sin importe: el archivo está completo para este análisis.

## Métricas principales
\`\`\`csv
metrica,valor
Ventas totales,"S/ 2,995.80"
Operaciones,19
Unidades,37
Ticket promedio,S/ 157.67
Precio medio por unidad,S/ 80.97
\`\`\`

## Evolución
- Las ventas subieron de forma sostenida entre enero (S/ 3,085.80) y mayo (S/ 3,977.50), el mes más alto del semestre.
- En junio las ventas cayeron a S/ 2,995.80, el nivel más bajo desde enero.

## Variaciones y su descomposición
- Entre mayo (S/ 3,977.50, 26 operaciones, ticket S/ 152.98) y junio (S/ 2,995.80, 19 operaciones, ticket S/ 157.67) las ventas variaron -24.68 %.
- El efecto de tener menos operaciones fue de S/ -1,070.86; el efecto del ticket promedio, que en realidad subió, fue de S/ 89.11 a favor. La caída se explica casi en su totalidad por vender menos veces, no por vender montos más pequeños.
- Mayo y junio tienen los dos 30 días, así que esta comparación es justa en ese sentido.

## Concentración
- El Taladro percutor 650W concentra el 38.03 % de las ventas del período, y el Esmeril angular 4.5" otro 30.02 %: entre 1 de los 7 productos (el más vendido) ya se explica más de un tercio de las ventas.
- Las herramientas eléctricas explican el 68.06 % de las ventas; los materiales, el 19.33 %; las herramientas manuales, el 12.62 %.

## Hallazgos
- Las ventas de junio (S/ 2,995.80) fueron menores que las de mayo (S/ 3,977.50).
- Las operaciones bajaron de 26 en mayo a 19 en junio.
- El ticket promedio subió de S/ 152.98 en mayo a S/ 157.67 en junio.
- Lima Centro (55.1 %) y San Juan de Lurigancho (44.9 %) tienen una participación de ventas parecida; lo mismo ocurre entre Mostrador (55.1 %) y WhatsApp (44.9 %).

## Hipótesis a investigar
- [HIPÓTESIS] La caída en el número de operaciones de junio podría deberse a menos visitas en alguna de las 2 sucursales: conviene revisar el tráfico por sucursal, si existe ese registro.
- [HIPÓTESIS] Podría haber faltado stock del Taladro percutor 650W o del Esmeril angular 4.5" en junio, ya que son los productos que más aportan a las ventas: revisar el inventario de esas fechas.
- [HIPÓTESIS] El alza del ticket promedio en junio podría deberse a que los clientes que sí compraron llevaron más unidades o productos de mayor precio: revisar el detalle de esas 19 operaciones.

## Preguntas siguientes
- ¿Hubo alguna rotura de stock del Taladro percutor 650W o del Esmeril angular 4.5" en junio?
- ¿Cambió el horario de atención o el personal disponible en alguna sucursal durante junio?
- ¿Se realizó alguna promoción en mayo que no se repitió en junio?
- ¿El tráfico de clientes (visitas, no solo ventas) bajó en junio?
- ¿La proporción de ventas por WhatsApp se mantuvo o cambió el canal de contacto más usado?`;

/* ─────────────── Bazar Doña Rosa: abril y mayo, con datos a revisar (archivo pequeño) ─────────────── */

const MAPEO_BAZAR: MapeoColumnas = { ...mapeoVacio(), fecha: 0, producto: 1, cantidad: 2, precio: 3, importe: 4, cliente: 5 };

const FILAS_BAZAR: string[][] = [
  ["fecha", "producto", "cantidad", "precio", "importe", "cliente"],
  ["02/04/2026", "Cuaderno A4 cuadriculado", "5", "6.5", "32.5", "Colegio San Martín"],
  ["04/04/2026", "Mochila escolar", "1", "89.9", "89.9", "Familia Torres"],
  ["07/04/2026", "Set de colores x12", "3", "15", "45", "Familia Quispe"],
  ["09/04/2026", "Cuaderno A4 cuadriculado", "10", "6.5", "65", "Colegio San Martín"],
  ["12/04/2026", "Lonchera térmica", "2", "35", "70", "Familia Torres"],
  ["15/04/2026", "Mochila escolar", "1", "89.9", "89.9", "Familia Ramos"],
  ["18/04/2026", "Set de colores x12", "2", "15", "30", "Familia Quispe"],
  ["21/04/2026", "Cuaderno A4 cuadriculado", "8", "6.5", "52", "Familia Torres"],
  ["24/04/2026", "Lonchera térmica", "1", "35", "35", "Familia Ramos"],
  ["27/04/2026", "Mochila escolar", "1", "89.9", "89.9", "Familia Quispe"],
  ["02/04/2026", "Cuaderno A4 cuadriculado", "5", "6.5", "32.5", "Colegio San Martín"],
  ["02/05/2026", "Mochila escolar", "1", "89.9", "-89.9", "Familia Ramos"],
  ["05/05/2026", "Set de colores x12", "4", "15", "60", "Colegio San Martín"],
  ["08/05/2026", "Cuaderno A4 cuadriculado", "12", "6.5", "78", "Colegio San Martín"],
  ["11/05/2026", "Lonchera térmica", "3", "35", "105", "Familia Torres"],
  ["14/05/2026", "Mochila escolar", "2", "89.9", "179.8", "Familia Quispe"],
  ["17/05/2026", "Set de colores x12", "3", "15", "45", "Familia Ramos"],
  ["20/05/2026", "Cuaderno A4 cuadriculado", "6", "6.5", "39", "Familia Torres"],
  ["23/05/2026", "Lonchera térmica", "2", "35", "70", "Colegio San Martín"],
  ["26/05/2026", "Mochila escolar", "1", "89.9", "89.9", "Familia Ramos"],
];

const DATOS_BAZAR: DatosAnalisisVentas = datos(MAPEO_BAZAR, {
  moneda: "S/",
  periodoDesde: "01/05/2026",
  periodoHasta: "31/05/2026",
  comparacionDesde: "01/04/2026",
  comparacionHasta: "30/04/2026",
  objetivo: "Ver si mayo fue mejor o peor que abril antes de pedir mercadería para junio",
  contexto: "Campaña de útiles escolares en ambos meses, sin ofertas especiales",
  modo: "A",
  nombreArchivo: "bazar-dona-rosa-abril-mayo.xlsx",
});

const RESPUESTA_BAZAR = `## Calidad de datos
- Se detectó 1 fila con importe negativo dentro del período de mayo: probablemente corresponde a una devolución. Conviene confirmarlo revisando esa venta en el sistema.
- Esa misma fila (u otra) tiene un importe que no coincide con cantidad × precio: es lo esperable si se trata de una devolución, pero igual vale la pena revisarla.
- Fuera del período analizado, el archivo completo (abril y mayo) trae además 1 fila duplicada: revisa si corresponde a una venta real repetida o a un error al copiar los datos.
- No se detectaron fechas fuera de rango ni filas sin fecha o sin importe.

## Métricas principales
\`\`\`csv
metrica,valor
Ventas totales,S/ 576.80
Operaciones,9
Unidades,34
Ticket promedio,S/ 64.09
Precio medio por unidad,S/ 16.96
\`\`\`

## Evolución
- Las ventas bajaron de S/ 631.70 en abril a S/ 576.80 en mayo.
- El número de operaciones también bajó, de 11 a 9.

## Variaciones y su descomposición
- Entre abril (S/ 631.70, 11 operaciones, ticket S/ 57.43) y mayo (S/ 576.80, 9 operaciones, ticket S/ 64.09) las ventas variaron -8.69 %.
- El efecto de tener menos operaciones fue de S/ -114.86; el efecto del ticket promedio, que subió, fue de S/ 59.94 a favor. La caída viene sobre todo de vender menos veces, compensada en parte por compras de mayor valor.
- Abril tiene 30 días y mayo 31: los 2 períodos no tienen la misma cantidad de días, así que esta comparación no es del todo justa.

## Concentración
- La Mochila escolar concentra el 31.17 % de las ventas de mayo, seguida de la Lonchera térmica con 30.34 %.
- El cliente con más compras concentra el 36.06 % de las ventas de mayo, entre los 4 clientes registrados.

## Hallazgos
- Las ventas de mayo (S/ 576.80) fueron menores que las de abril (S/ 631.70).
- Las operaciones bajaron de 11 en abril a 9 en mayo.
- El ticket promedio subió de S/ 57.43 en abril a S/ 64.09 en mayo.
- La Mochila escolar (31.17 %) y la Lonchera térmica (30.34 %) son los 2 productos con más participación en mayo.

## Hipótesis a investigar
- [HIPÓTESIS] La fila con importe negativo podría ser una devolución real: confirmarlo con el comprobante o el motivo registrado.
- [HIPÓTESIS] La baja en operaciones de mayo podría deberse a que alguno de los 4 clientes principales compró con menos frecuencia ese mes: revisar el detalle por cliente.
- [HIPÓTESIS] El alza del ticket promedio podría deberse a una mezcla de productos distinta en mayo, con más peso de los artículos de mayor precio (como la Mochila escolar) frente a los cuadernos, de menor precio: revisar la mezcla de productos vendidos.

## Preguntas siguientes
- ¿La fila con importe negativo corresponde a una devolución confirmada?
- ¿La fila duplicada del archivo es una venta real repetida o un error de carga?
- ¿Alguno de los 4 clientes principales dejó de comprar o compró menos en mayo?
- ¿Hay alguna fecha del calendario escolar que explique la diferencia entre abril y mayo?
- ¿Conviene anotar el motivo de cada devolución para futuros análisis?`;

export const EJEMPLOS_ANALISIS_VENTAS: EjemploAnalisisVentas[] = [
  { id: "ferreteria", etiqueta: "Ferretería El Tornillo (enero a junio)", descripcion: "El ejemplo de la especificación: 6 meses de ventas, con una caída en junio explicada sobre todo por menos operaciones.", nombreArchivo: DATOS_FERRETERIA.nombreArchivo, filasCrudas: FILAS_FERRETERIA, datos: DATOS_FERRETERIA, respuesta: RESPUESTA_FERRETERIA },
  { id: "bazar", etiqueta: "Bazar Doña Rosa (abril y mayo)", descripcion: "Un archivo más pequeño, con una devolución y una fila duplicada, para mostrar cómo la página revisa la calidad de los datos.", nombreArchivo: DATOS_BAZAR.nombreArchivo, filasCrudas: FILAS_BAZAR, datos: DATOS_BAZAR, respuesta: RESPUESTA_BAZAR },
];
