"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosMinimosNichos } from "@/lib/nichos/calculo";
import { datosVaciosNichos, normalizarDatosNichos, type DatosNichos } from "@/lib/nichos/tipos";
import { registroVacio, TIPOS_VALIDACION, type DatosRegistroNichos, type EntradaValidacion, type TipoValidacion } from "@/lib/nichos/registro";

/** Formulario de «Identificar y validar un nicho de mercado»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenNichos = crearAlmacenLocal<DatosNichos>(
  "gpia-nichos-datos-v1",
  datosVaciosNichos,
  (g) => normalizarDatosNichos(g as Partial<DatosNichos>),
  (d) => datosMinimosNichos(d) || Boolean(d.respuestaNichos.trim()),
);

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);
const opcion = <T extends string>(lista: { valor: T }[], v: unknown, defecto: T): T => (lista.some((x) => x.valor === v) ? (v as T) : defecto);
const boolOnull = (v: unknown): boolean | null => (typeof v === "boolean" ? v : null);

/** Registro de validación (entrevistas, búsquedas, preventas): almacén independiente del formulario principal. */
export const almacenRegistroNichos = crearAlmacenLocal<DatosRegistroNichos>(
  "gpia-nichos-registro-v1",
  registroVacio,
  (g) => {
    const r = g as Partial<DatosRegistroNichos>;
    return {
      items: Array.isArray(r.items)
        ? r.items.map((it: Partial<EntradaValidacion>, i): EntradaValidacion => ({
            id: texto(it?.id) || `v${i}`,
            nichoNombre: texto(it?.nichoNombre),
            fecha: texto(it?.fecha),
            tipo: opcion(TIPOS_VALIDACION, it?.tipo, "entrevista" as TipoValidacion),
            resultado: texto(it?.resultado),
            cumpleCriterio: boolOnull(it?.cumpleCriterio),
          }))
        : [],
    };
  },
  (d) => d.items.length > 0,
);
