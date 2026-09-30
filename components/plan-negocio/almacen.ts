"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosMinimosPlanNegocio } from "@/lib/plan-negocio/calculo";
import { datosVaciosPlanNegocio, normalizarDatosPlanNegocio, type DatosPlanNegocio } from "@/lib/plan-negocio/tipos";

/** Formulario de «Crear un plan de negocio con IA»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenPlanNegocio = crearAlmacenLocal<DatosPlanNegocio>(
  "gpia-plan-negocio-datos-v1",
  datosVaciosPlanNegocio,
  (g) => normalizarDatosPlanNegocio(g as Partial<DatosPlanNegocio>),
  (d) => datosMinimosPlanNegocio(d) || [d.nombreEmpresa, d.descripcion, d.producto].some((t) => t.trim() !== ""),
);
