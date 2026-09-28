"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { datosVaciosSalario, MODALIDADES, ofertaVacia, PRIORIDADES, TIPOS_VARIABLE, type Beneficio, type DatosSalario, type IdPrioridad, type Oferta, type Referencia } from "@/lib/salario/tipos";

const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

function normalizarOferta(o: Partial<Oferta> | undefined, nombre: string): Oferta {
  const base = ofertaVacia(nombre);
  if (!o || typeof o !== "object") return base;
  return {
    nombre: texto(o.nombre, nombre),
    fijo: texto(o.fijo),
    pagos: texto(o.pagos, base.pagos),
    variableTipo: TIPOS_VARIABLE.some((t) => t.valor === o.variableTipo) ? o.variableTipo! : "ninguno",
    variableValor: texto(o.variableValor),
    variableSeguro: texto(o.variableSeguro, "0"),
    variableCondiciones: texto(o.variableCondiciones),
    beneficios: Array.isArray(o.beneficios)
      ? o.beneficios.map((b: Partial<Beneficio>, i): Beneficio => ({ id: texto(b?.id) || `b${i}`, nombre: texto(b?.nombre), valor: texto(b?.valor), monetario: b?.monetario !== false }))
      : [],
    contrato: texto(o.contrato),
    jornada: texto(o.jornada),
    vacaciones: texto(o.vacaciones),
    prueba: texto(o.prueba),
    diasPresencial: texto(o.diasPresencial),
  };
}

/** Prioridades guardadas: solo las válidas, sin repetir, y completando las que falten al final. */
function normalizarPrioridades(p: unknown): IdPrioridad[] {
  const validas = PRIORIDADES.map((x) => x.id);
  const guardadas = Array.isArray(p) ? p.filter((x): x is IdPrioridad => validas.includes(x as IdPrioridad)) : [];
  const unicas = [...new Set(guardadas)];
  return [...unicas, ...validas.filter((v) => !unicas.includes(v))];
}

/** Formulario de «Evaluar una oferta y negociar tu salario»: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenSalario = crearAlmacenLocal<DatosSalario>(
  "gpia-salario-datos-v1",
  datosVaciosSalario,
  (g) => {
    const base = datosVaciosSalario();
    return {
      ...base,
      ...g,
      modalidad: MODALIDADES.some((m) => m.valor === g.modalidad) ? g.modalidad! : base.modalidad,
      comparar: g.comparar === true,
      ofertaA: normalizarOferta(g.ofertaA, "Oferta A"),
      ofertaB: normalizarOferta(g.ofertaB, "Oferta B"),
      referencias: Array.isArray(g.referencias) ? g.referencias.map((r: Partial<Referencia>, i): Referencia => ({ id: texto(r?.id) || `r${i}`, monto: texto(r?.monto), fuente: texto(r?.fuente), fecha: texto(r?.fecha) })) : [],
      prioridades: normalizarPrioridades(g.prioridades),
    };
  },
  (d) =>
    [d.cargo, d.ubicacion, d.nivel, d.anios, d.formacion, d.competencias, d.actualSalario, d.actualBeneficios, d.transporteDia, d.comidaDia, d.descuentoPct, d.minimo, d.objetivo, d.ancla, d.ofertaA.fijo, d.ofertaA.contrato].some((t) => t.trim() !== "") ||
    d.referencias.length > 0 ||
    d.ofertaA.beneficios.length > 0 ||
    d.comparar,
);
