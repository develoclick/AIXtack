"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { CANALES, DIAS_SIN_RESPUESTA_POR_DEFECTO, ESTADOS, HASTAS, registroVacio, type DatosRegistro, type Postulacion } from "@/lib/plan/registro";
import { CONTRATOS, CUMPLES, datosVaciosPlan, METAS, MODALIDADES, NIVELES, type DatosPlan, type Vacante } from "@/lib/plan/tipos";

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);
const opcion = <T extends string>(lista: { valor: T }[], v: unknown, defecto: T): T => (lista.some((x) => x.valor === v) ? (v as T) : defecto);

/** Formulario de «Plan de búsqueda de empleo»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenPlan = crearAlmacenLocal<DatosPlan>(
  "gpia-plan-datos-v1",
  datosVaciosPlan,
  (g) => {
    const base = datosVaciosPlan();
    return {
      ...base,
      puesto: texto(g.puesto),
      nivel: opcion(NIVELES, g.nivel, base.nivel),
      ubicacion: texto(g.ubicacion),
      modalidad: opcion(MODALIDADES, g.modalidad, base.modalidad),
      contrato: opcion(CONTRATOS, g.contrato, base.contrato),
      sectores: texto(g.sectores),
      competencias: texto(g.competencias),
      salario: texto(g.salario),
      horas: texto(g.horas),
      meta: opcion(METAS, g.meta, base.meta),
      cv: texto(g.cv),
      vacantes: Array.isArray(g.vacantes)
        ? g.vacantes.slice(0, 5).map((v: Partial<Vacante>, i): Vacante => ({ id: texto(v?.id) || `v${i}`, empresa: texto(v?.empresa), puesto: texto(v?.puesto), ubicacion: texto(v?.ubicacion), resumen: texto(v?.resumen), limite: texto(v?.limite), cumple: opcion(CUMPLES, v?.cumple, "") }))
        : [],
    };
  },
  (d) => [d.puesto, d.ubicacion, d.sectores, d.competencias, d.salario, d.horas, d.cv].some((t) => t.trim() !== "") || d.vacantes.length > 0,
);

/** Registro de postulaciones: también solo en el navegador. Es lo único que la persona vuelve a abrir cada semana. */
export const almacenRegistro = crearAlmacenLocal<DatosRegistro>(
  "gpia-plan-registro-v1",
  registroVacio,
  (g) => ({
    diasSinRespuesta: texto(g.diasSinRespuesta, String(DIAS_SIN_RESPUESTA_POR_DEFECTO)),
    items: Array.isArray(g.items)
      ? g.items.map(
          (p: Partial<Postulacion>, i): Postulacion => ({
            id: texto(p?.id) || `p${i}`,
            empresa: texto(p?.empresa),
            puesto: texto(p?.puesto),
            fecha: texto(p?.fecha),
            canal: opcion(CANALES, p?.canal, "otro"),
            cv: texto(p?.cv),
            estado: opcion(ESTADOS, p?.estado, "enviada"),
            hasta: opcion(HASTAS, p?.hasta, ""),
            seguimiento: texto(p?.seguimiento),
            resultado: texto(p?.resultado),
            notas: texto(p?.notas),
          }),
        )
      : [],
  }),
  (d) => d.items.length > 0,
);
