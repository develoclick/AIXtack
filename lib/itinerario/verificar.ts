import { comparable } from "@/lib/cv/normalizar";
import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { diasDelViaje, minutosDeHora } from "./calculo";
import type { LecturaItinerario } from "./lector";
import { lugaresLlenos, textoDeFuenteItinerario } from "./prompt";
import { maxPorDia, type DatosItinerario, type FilaItinerario } from "./tipos";

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

export interface Solapamiento {
  dia: number;
  a: string;
  b: string;
}

/** Bloques del mismo día cuyo horario se cruza (hora_inicio de uno antes del hora_fin del otro, y viceversa). */
export function solapamientos(filas: FilaItinerario[]): Solapamiento[] {
  const salida: Solapamiento[] = [];
  const porDia = new Map<number, FilaItinerario[]>();
  for (const f of filas) porDia.set(f.dia, [...(porDia.get(f.dia) ?? []), f]);
  for (const [dia, bloques] of porDia) {
    const con = bloques.map((b) => ({ b, ini: minutosDeHora(b.horaInicio), fin: minutosDeHora(b.horaFin) })).filter((x): x is { b: FilaItinerario; ini: number; fin: number } => x.ini !== null && x.fin !== null && x.fin > x.ini);
    con.sort((x, y) => x.ini - y.ini);
    for (let i = 0; i < con.length - 1; i++) if (con[i].fin > con[i + 1].ini) salida.push({ dia, a: con[i].b.actividad || `bloque de las ${con[i].b.horaInicio}`, b: con[i + 1].b.actividad || `bloque de las ${con[i + 1].b.horaInicio}` });
  }
  return salida;
}

export interface DiaSobrecargado {
  dia: number;
  cantidad: number;
  maximo: number;
}

/** Días con más actividades principales (imprescindible + opcional) que el máximo del ritmo elegido. */
export function diasSobrecargados(filas: FilaItinerario[], ritmo: DatosItinerario["ritmo"]): DiaSobrecargado[] {
  const maximo = maxPorDia(ritmo);
  const cuenta = new Map<number, number>();
  for (const f of filas) if (f.tipo === "imprescindible" || f.tipo === "opcional") cuenta.set(f.dia, (cuenta.get(f.dia) ?? 0) + 1);
  return [...cuenta.entries()].filter(([, n]) => n > maximo).map(([dia, cantidad]) => ({ dia, cantidad, maximo })).sort((a, b) => a.dia - b.dia);
}

/** Días del viaje (1..totalDias) sin ningún bloque «comida». */
export function diasSinComida(filas: FilaItinerario[], totalDias: number | null): number[] {
  if (totalDias === null) return [];
  const conComida = new Set(filas.filter((f) => f.tipo === "comida").map((f) => f.dia));
  return Array.from({ length: totalDias }, (_, i) => i + 1).filter((d) => !conComida.has(d));
}

/** Pares de días consecutivos donde ninguno de los dos tiene un bloque «libre» (regla: al menos 1 cada 2 días). */
export function ventanasSinLibre(filas: FilaItinerario[], totalDias: number | null): number[] {
  if (totalDias === null || totalDias < 2) return [];
  const conLibre = new Set(filas.filter((f) => f.tipo === "libre").map((f) => f.dia));
  const salida: number[] = [];
  for (let d = 1; d < totalDias; d++) if (!conLibre.has(d) && !conLibre.has(d + 1)) salida.push(d);
  return salida;
}

/** ¿El lugar que escribió la IA corresponde a uno de los que aportó el usuario? (por nombre, sin importar tildes ni mayúsculas.) */
export function coincideLugar(escrito: string, d: DatosItinerario): boolean {
  const e = norm(escrito);
  if (!e) return true;
  return lugaresLlenos(d).some((l) => {
    const n = norm(l.nombre);
    return n && (e.includes(n) || n.includes(e));
  });
}

/** Lugares que la IA usó en filas imprescindibles u opcionales y no corresponden a ninguno de los que aportó el usuario (solo si aportó alguno). */
export function lugaresAjenos(filas: FilaItinerario[], d: DatosItinerario): string[] {
  if (lugaresLlenos(d).length === 0) return [];
  const ajenos = new Set<string>();
  for (const f of filas) if ((f.tipo === "imprescindible" || f.tipo === "opcional") && f.lugar.trim() && !coincideLugar(f.lugar, d)) ajenos.add(f.lugar.trim());
  return [...ajenos];
}

/** Hora HH:MM dentro de un texto libre (por ejemplo, dentro de la reserva); null si no encuentra ninguna. */
function horaEnTexto(t: string): string | null {
  const m = t.match(/([01]?\d|2[0-3]):([0-5]\d)/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
}

export interface ReservaNoRespetada {
  lugar: string;
  esperada: string;
  encontrada: string | null;
}

/** Reservas del usuario con una hora explícita cuyo lugar, en el itinerario, aparece con otra hora de inicio (o no aparece). */
export function reservasNoRespetadas(filas: FilaItinerario[], d: DatosItinerario): ReservaNoRespetada[] {
  const salida: ReservaNoRespetada[] = [];
  for (const l of lugaresLlenos(d)) {
    const esperada = horaEnTexto(l.reserva);
    if (!esperada) continue;
    const fila = filas.find((f) => coincideLugarUno(f.lugar, l.nombre));
    if (!fila || fila.horaInicio !== esperada) salida.push({ lugar: l.nombre, esperada, encontrada: fila ? fila.horaInicio : null });
  }
  return salida;
}

function coincideLugarUno(escrito: string, nombre: string): boolean {
  const e = norm(escrito);
  const n = norm(nombre);
  return Boolean(e && n && (e.includes(n) || n.includes(e)));
}

export interface RevisionItinerario {
  avisos: string[];
  solapamientos: Solapamiento[];
  sobrecargados: DiaSobrecargado[];
  sinComida: number[];
  sinLibre: number[];
  ajenos: string[];
  reservas: ReservaNoRespetada[];
  cifras: CifrasNuevas;
  sinVerificar: number;
}

/** Verificaciones automáticas del paso 3 («Qué revisar antes de usarlo»). Señalan lo que hay que mirar; no demuestran nada. */
export function revisarItinerario(l: LecturaItinerario, d: DatosItinerario): RevisionItinerario {
  const totalDias = diasDelViaje(d);
  const sol = solapamientos(l.itinerario);
  const sobre = diasSobrecargados(l.itinerario, d.ritmo);
  const sinComida = diasSinComida(l.itinerario, totalDias);
  const sinLibre = ventanasSinLibre(l.itinerario, totalDias);
  const ajenos = lugaresAjenos(l.itinerario, d);
  const reservas = reservasNoRespetadas(l.itinerario, d);
  const cuerpo = [l.porque.map((p) => `${p.zona} ${p.motivo}`), l.planesB.map((p) => `${p.situacion} ${p.alternativa}`), l.presupuesto, l.verificar, l.siguiente].flat().join("\n");
  const cifras = cifrasNuevas(cuerpo, textoDeFuenteItinerario(d));
  const sinVerificar = l.itinerario.filter((f) => f.verificado === false || f.verificado === null).length;

  const avisos: string[] = [];
  if (totalDias === null) avisos.push("No indicaste fechas de inicio y fin válidas: no puedo comprobar si el itinerario cubre todos los días.");
  else {
    const dias = new Set(l.itinerario.map((f) => f.dia));
    const faltan = Array.from({ length: totalDias }, (_, i) => i + 1).filter((x) => !dias.has(x));
    if (l.itinerario.length > 0 && faltan.length) avisos.push(`Faltan bloques para el día ${faltan.join(", ")} de ${totalDias}.`);
  }
  for (const s of sol) avisos.push(`Día ${s.dia}: «${s.a}» se cruza en el horario con «${s.b}».`);
  for (const s of sobre) avisos.push(`Día ${s.dia}: tiene ${s.cantidad} actividades principales y tu ritmo permite ${s.maximo} como máximo.`);
  if (sinComida.length) avisos.push(`Día(s) sin ninguna comida registrada: ${sinComida.join(", ")}.`);
  if (sinLibre.length) avisos.push(`Entre el día ${sinLibre[0]} y el ${sinLibre[0] + 1} no hay ningún bloque de tiempo libre (la regla pide al menos uno cada 2 días).`);
  if (ajenos.length) avisos.push(`El itinerario incluye lugares que no aportaste: ${ajenos.slice(0, 3).map((a) => `«${a}»`).join("; ")}. Podrían ser inventados: verifícalos antes de ir.`);
  for (const r of reservas) avisos.push(`Tu reserva en «${r.lugar}» era a las ${r.esperada} y el itinerario la puso ${r.encontrada ? `a las ${r.encontrada}` : "en otro horario o no la incluyó"}.`);
  if (cifras.montos.length) avisos.push(`La respuesta menciona montos que no están en tus datos: ${cifras.montos.join(", ")}. No los uses como precio real: esta herramienta no consulta precios.`);
  if (sinVerificar > 0) avisos.push(`${sinVerificar} bloque(s) del itinerario no vienen marcados como verificados: revisa sus horarios en la fuente oficial del lugar antes de viajar.`);
  if (l.verificar.length) avisos.push(`La IA pide verificar ${l.verificar.length} dato(s): revisa la pestaña «Por verificar».`);

  return { avisos, solapamientos: sol, sobrecargados: sobre, sinComida, sinLibre, ajenos, reservas, cifras, sinVerificar };
}
