"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosSegmentarClientes, normalizarDatosSegmentarClientes, type DatosSegmentarClientes } from "@/lib/segmentar-clientes/tipos";

/**
 * Formulario de «Segmentar clientes»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. El
 * archivo que subas (sus filas, con los IDs y montos de cada cliente) NO se guarda aquí: vive solo en memoria mientras
 * tienes la pestaña abierta. Si recargas la página, solo se recuerda tu mapeo, tu método y tus reglas: vuelve a subir tu
 * archivo para ver los segmentos de nuevo.
 */
export const almacenSegmentarClientes = crearAlmacenLocal<DatosSegmentarClientes>(
  "gpia-segmentar-clientes-datos-v1",
  datosVaciosSegmentarClientes,
  (g) => normalizarDatosSegmentarClientes(g as Partial<DatosSegmentarClientes>),
  (d) => Boolean(d.respuesta.trim() || d.nombreOrigen.trim() || d.negocio.trim()),
);
