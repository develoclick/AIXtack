"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosAnalisisVentas, normalizarDatosAnalisisVentas, type DatosAnalisisVentas } from "@/lib/analizar-ventas/tipos";

/**
 * Formulario de «Analizar ventas en Excel con IA»: se guarda solo en el navegador de la persona; los ejemplos nunca se
 * guardan. El archivo que subas (sus filas, su ficha) NO se guarda aquí: vive solo en memoria mientras tienes la pestaña
 * abierta. Si recargas la página, solo se recuerdan tus datos de texto (moneda, período, objetivo…): vuelve a subir el
 * archivo para ver el dashboard de nuevo.
 */
export const almacenAnalisisVentas = crearAlmacenLocal<DatosAnalisisVentas>(
  "gpia-analizar-ventas-datos-v1",
  datosVaciosAnalisisVentas,
  (g) => normalizarDatosAnalisisVentas(g as Partial<DatosAnalisisVentas>),
  (d) => Boolean(d.objetivo.trim() || d.respuestaAnalisis.trim() || d.nombreArchivo.trim()),
);
