import { MAX_FAVORITOS, type DatosNichos, type Nicho, type Pesos } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Puntuación ponderada de un nicho (0–5): promedio de sus 5 puntuaciones, ponderado por tus pesos. Nunca la calcula la IA. */
export function puntuacionPonderada(n: Nicho, pesos: Pesos): number {
  const sumaPesos = pesos.entrada + pesos.inversion + pesos.recurrencia + pesos.diferenciacion + pesos.encaje;
  if (sumaPesos <= 0) return 0;
  const suma = n.entrada * pesos.entrada + n.inversion * pesos.inversion + n.recurrencia * pesos.recurrencia + n.diferenciacion * pesos.diferenciacion + n.encaje * pesos.encaje;
  return redondear(suma / sumaPesos);
}

export interface NichoRankeado extends Nicho {
  puntuacion: number;
  posicion: number;
}

/** Ranking de nichos por puntuación ponderada, de mayor a menor. Se recalcula en el navegador cada vez que cambian los pesos. */
export function rankearNichos(nichos: Nicho[], pesos: Pesos): NichoRankeado[] {
  return nichos
    .map((n) => ({ ...n, puntuacion: puntuacionPonderada(n, pesos) }))
    .sort((a, b) => b.puntuacion - a.puntuacion)
    .map((n, i) => ({ ...n, posicion: i + 1 }));
}

export interface EstadoSeccion {
  id: string;
  etiqueta: string;
  completa: boolean;
}

/** Semáforo de preparación del inventario personal (paso 1). */
export function semaforo(d: DatosNichos): EstadoSeccion[] {
  return [
    { id: "conocimientos", etiqueta: "Conocimientos, sectores y lo que sabes ofrecer", completa: Boolean(d.conocimientos.trim() && d.sectores.trim() && d.oferta.trim()) },
    { id: "mercado", etiqueta: "Mercado y tipo de cliente", completa: Boolean(d.mercado.trim()) },
    { id: "presupuesto", etiqueta: "Presupuesto inicial", completa: Boolean(d.presupuesto.trim()) },
    { id: "canales", etiqueta: "Al menos un canal disponible", completa: d.canales.length > 0 },
  ];
}

/** Mínimo para que el Prompt 1 tenga sentido: conocimientos, sectores y lo que sabes ofrecer. */
export function datosMinimosNichos(d: DatosNichos): boolean {
  return Boolean(d.conocimientos.trim() && d.sectores.trim() && d.oferta.trim());
}

/**
 * ¿Ya se eligieron los 2 favoritos entre nichos realmente leídos? Solo entonces tiene sentido el Prompt 2.
 * `favoritos` guarda el NOMBRE del nicho, no su id: el id se genera de nuevo cada vez que se relee el CSV pegado
 * (por ejemplo, al recargar la página), así que un id guardado dejaría de existir en la próxima lectura.
 */
export function favoritosListos(d: DatosNichos, nichos: Nicho[]): boolean {
  return d.favoritos.length === MAX_FAVORITOS && d.favoritos.every((nombre) => nichos.some((n) => n.nombre === nombre));
}
