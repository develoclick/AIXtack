import { comparable } from "@/lib/cv/normalizar";
import { parsearNumero } from "@/lib/presupuesto/calculo";
import { diaDeLaSemana, etiquetaDia, viajerosDeFechas } from "./calculo";
import { DIAS_SEMANA, type Combinacion, type DatosFechas, type FilaPrecio } from "./tipos";

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

/** ¿El texto de equipaje de la fila da a entender que ya incluye una maleta de bodega? Es una lectura de texto, no un dato estructurado. */
export function incluyeBodega(equipajeTexto: string): boolean {
  const t = norm(equipajeTexto);
  if (!t.includes("bodega")) return false;
  return !/(no incluye|sin incluir|no incluida|no incluido|sin bodega)/.test(t);
}

/** ¿La combinación (ida, vuelta) de la fila corresponde a una de las que generó la página? */
export function coincideConGeneradas(fila: Pick<FilaPrecio, "ida" | "vuelta">, generadas: Combinacion[]): boolean {
  return generadas.some((c) => c.ida === fila.ida && c.vuelta === fila.vuelta);
}

/** Filas cuya combinación (ida, vuelta) no está entre las que generó la página: podrían ser fechas inventadas por la IA. */
export function filasAjenas(filas: FilaPrecio[], generadas: Combinacion[]): FilaPrecio[] {
  if (generadas.length === 0) return [];
  return filas.filter((f) => !coincideConGeneradas(f, generadas));
}

/** Combinaciones generadas que ninguna fila de la respuesta cubre todavía. */
export function combinacionesFaltantes(generadas: Combinacion[], filas: FilaPrecio[]): Combinacion[] {
  return generadas.filter((c) => !filas.some((f) => f.ida === c.ida && f.vuelta === c.vuelta));
}

/**
 * Precio ajustado de una fila: precio_total + equipaje de bodega (por adulto y niño, si el texto de la fila no dice que ya lo
 * incluye) + traslados (por viaje). null si la fila no trae precio_total o si ninguno de los dos costos es un número.
 */
export function precioAjustado(f: FilaPrecio, d: Pick<DatosFechas, "costoEquipajeBodega" | "costoTraslados" | "adultos" | "ninos">): number | null {
  if (f.precioTotal === null) return null;
  const costoBodega = parsearNumero(d.costoEquipajeBodega);
  const costoTraslados = parsearNumero(d.costoTraslados);
  if (costoBodega === null && costoTraslados === null) return f.precioTotal;
  const v = viajerosDeFechas({ adultos: d.adultos, ninos: d.ninos, infantes: "0" });
  const pasajerosQuePaganBodega = (v.adultos ?? 0) + v.ninos;
  let total = f.precioTotal;
  if (costoBodega !== null && !incluyeBodega(f.equipaje)) total += costoBodega * pasajerosQuePaganBodega;
  if (costoTraslados !== null) total += costoTraslados;
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

export interface FilaOrdenable extends FilaPrecio {
  precioComparado: number | null;
  ajustado: boolean;
  coincide: boolean;
  diferenciaVsMinima: number | null;
}

/** Prepara las filas para la tabla: precio a comparar (ajustado si hay costos), si coinciden con las combinaciones generadas y su diferencia frente a la más barata. */
export function prepararFilas(filas: FilaPrecio[], generadas: Combinacion[], d: DatosFechas, conAjuste: boolean): FilaOrdenable[] {
  const preparadas = filas.map((f) => {
    const ajustado = conAjuste && (d.costoEquipajeBodega.trim() !== "" || d.costoTraslados.trim() !== "");
    const precioComparado = ajustado ? precioAjustado(f, d) : f.precioTotal;
    return { ...f, precioComparado, ajustado, coincide: coincideConGeneradas(f, generadas), diferenciaVsMinima: null as number | null };
  });
  const conPrecio = preparadas.filter((f) => f.precioComparado !== null).map((f) => f.precioComparado!);
  const minimo = conPrecio.length ? Math.min(...conPrecio) : null;
  return preparadas.map((f) => ({ ...f, diferenciaVsMinima: f.precioComparado !== null && minimo !== null && minimo > 0 ? Math.round(((f.precioComparado - minimo) / minimo) * 1000) / 10 : null }));
}

export function masBarata(filas: FilaOrdenable[]): FilaOrdenable | null {
  const con = filas.filter((f) => f.precioComparado !== null);
  if (con.length === 0) return null;
  return con.reduce((min, f) => (f.precioComparado! < min.precioComparado! ? f : min));
}

/** Mediana de los precios (comparados) de las filas con precio. */
export function medianaPrecios(filas: FilaOrdenable[]): number | null {
  const valores = filas.map((f) => f.precioComparado).filter((v): v is number => v !== null).sort((a, b) => a - b);
  if (valores.length === 0) return null;
  const mitad = Math.floor(valores.length / 2);
  return valores.length % 2 ? valores[mitad] : Math.round(((valores[mitad - 1] + valores[mitad]) / 2) * 100) / 100;
}

export type CriterioOrden = "precio" | "porPersona" | "noches" | "escalas" | "horario";

export function ordenarFilas(filas: FilaOrdenable[], criterio: CriterioOrden): FilaOrdenable[] {
  const val = (f: FilaOrdenable): number | string => {
    switch (criterio) {
      case "precio":
        return f.precioComparado ?? Infinity;
      case "porPersona":
        return f.precioPorPersona ?? Infinity;
      case "noches":
        return f.noches ?? Infinity;
      case "escalas":
        return f.escalas || "";
      case "horario":
        return f.horarioIda || "";
    }
  };
  return [...filas].sort((a, b) => {
    const x = val(a);
    const y = val(b);
    if (typeof x === "number" && typeof y === "number") return x - y;
    return String(x).localeCompare(String(y), "es");
  });
}

export interface CeldaCalor {
  dia: number;
  noches: number;
  minimo: number | null;
  cantidad: number;
}

/** Mapa de calor día de ida (0=lunes) × duración: precio mínimo consultado en cada celda. Solo con datos reales de las filas. */
export function mapaDeCalor(filas: FilaOrdenable[], duraciones: number[]): CeldaCalor[] {
  const celdas: CeldaCalor[] = [];
  for (let dia = 0; dia < DIAS_SEMANA.length; dia++) {
    for (const noches of duraciones) {
      const de = filas.filter((f) => f.precioComparado !== null && f.noches === noches && diaDeLaSemana(f.ida) === dia);
      celdas.push({ dia, noches, minimo: de.length ? Math.min(...de.map((f) => f.precioComparado!)) : null, cantidad: de.length });
    }
  }
  return celdas;
}

export { etiquetaDia };
