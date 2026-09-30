"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosMinimosCatalogo } from "@/lib/catalogo-productos/calculo";
import { datosVaciosCatalogo, normalizarDatosCatalogo, type DatosCatalogo } from "@/lib/catalogo-productos/tipos";

/**
 * Formulario de «Crear un catálogo de productos»: se guarda solo en el navegador de la persona; los ejemplos nunca se
 * guardan. Las fotos que subas a las fichas NO se guardan aquí: viven solo en memoria mientras tienes la pestaña abierta.
 */
export const almacenCatalogo = crearAlmacenLocal<DatosCatalogo>(
  "gpia-catalogo-productos-datos-v1",
  datosVaciosCatalogo,
  (g) => normalizarDatosCatalogo(g as Partial<DatosCatalogo>),
  (d) => datosMinimosCatalogo(d) || Boolean(d.respuestaCatalogo.trim()),
);
