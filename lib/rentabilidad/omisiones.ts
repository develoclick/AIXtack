import { comparable } from "@/lib/cv/normalizar";
import { parsearNumero } from "@/lib/presupuesto/calculo";
import type { DatosRentabilidad } from "./tipos";

export interface CostoOmitido {
  id: string;
  concepto: string;
  /** Por qué suele olvidarse. */
  porQue: string;
  /** Palabras que, si aparecen en un concepto de costo fijo, indican que ya está cubierto. */
  palabras: string[];
}

/** Los costos que casi todos olvidan al calcular su rentabilidad. Fuente única: la guía y el detector leen esta lista. */
export const COSTOS_OMITIDOS: CostoOmitido[] = [
  { id: "sueldo", concepto: "Tu propio sueldo como dueño", porQue: "Si trabajas en el negocio sin pagarte un sueldo, la «utilidad» que calculas en realidad incluye tu pago por trabajar, no solo la ganancia del negocio.", palabras: ["sueldo", "salario", "mi pago", "dueñ", "propietari"] },
  { id: "mermas", concepto: "Mermas (productos dañados, vencidos o devueltos)", porQue: "Lo que se produce pero no se vende también costó insumos: si no lo cuentas, tu costo directo real es más alto que el calculado.", palabras: ["merma", "desperdicio", "vencid", "daño", "devoluci"] },
  { id: "depreciacion", concepto: "Depreciación de equipos y herramientas", porQue: "Un horno, una máquina o una laptop se desgastan con el uso: ese costo no aparece en un solo mes, pero es real y se reparte entre los períodos que dura el equipo.", palabras: ["deprecia", "desgaste", "reposicion de equipo"] },
  { id: "mantenimiento", concepto: "Mantenimiento y reparaciones", porQue: "Equipos, local o vehículos necesitan mantenimiento periódico que rara vez se presupuesta hasta que falla algo.", palabras: ["mantenimiento", "reparaci"] },
  { id: "empaque", concepto: "Empaque, embalaje o bolsas", porQue: "Se cuenta el insumo principal (por ejemplo, la harina) pero se olvida lo que envuelve o protege el producto.", palabras: ["empaque", "embalaje", "bolsa", "caja", "envoltura", "packaging"] },
];

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

/** ¿Ya hay un costo fijo que cubre esto (por concepto) o, para el sueldo, la persona marcó que ya lo incluye? */
function estaCubierto(c: CostoOmitido, d: DatosRentabilidad): boolean {
  if (c.id === "sueldo" && d.incluyeSueldo) return true;
  return d.costosFijos.some((f) => {
    const t = norm(f.concepto);
    return t !== "" && c.palabras.some((p) => t.includes(norm(p)));
  });
}

/** Detector de costos posiblemente omitidos: los de la lista que no aparecen en ningún costo fijo. No usa IA. */
export function costosQueFaltan(d: DatosRentabilidad): CostoOmitido[] {
  return COSTOS_OMITIDOS.filter((c) => !estaCubierto(c, d));
}

/** ¿Falta indicar los costos variables por venta (comisiones, envíos, pasarela)? Sin esto, la utilidad operativa se sobrestima si el negocio vende por apps o pasarelas. */
export function faltaVariableAdicional(d: DatosRentabilidad): boolean {
  const v = parsearNumero(d.costosVariablesValor);
  return d.costosVariablesValor.trim() === "" || v === null;
}
