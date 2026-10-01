"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosConvertirGraficos, normalizarDatosConvertirGraficos, type DatosConvertirGraficos } from "@/lib/convertir-graficos/tipos";

/**
 * Formulario de «Convertir datos en gráficos»: se guarda solo en el navegador de la persona; los ejemplos nunca se
 * guardan. La tabla que pegues o subas NO se guarda aquí: vive solo en memoria mientras tienes la pestaña abierta. Si
 * recargas la página, solo se recuerda tu objetivo y tus preferencias: vuelve a pegar o subir tu tabla para ver los
 * gráficos de nuevo.
 */
export const almacenConvertirGraficos = crearAlmacenLocal<DatosConvertirGraficos>(
  "gpia-convertir-graficos-datos-v1",
  datosVaciosConvertirGraficos,
  (g) => normalizarDatosConvertirGraficos(g as Partial<DatosConvertirGraficos>),
  (d) => Boolean(d.respuesta.trim() || d.nombreOrigen.trim() || d.unidad.trim()),
);
