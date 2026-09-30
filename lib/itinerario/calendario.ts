import { aFecha, fechaUtc, plegar } from "@/lib/plan/calendario";
import { fechaDelDia } from "./calculo";
import type { DatosItinerario, FilaItinerario } from "./tipos";

export interface EventoItinerario {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  dia: number;
  titulo: string;
  descripcion: string;
}

const horaValida = (h: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h);

/** Coloca cada bloque en el calendario: usa la fecha de la fila si es válida, o la calcula desde la fecha de inicio del viaje y el día. */
export function calendarizarItinerario(filas: FilaItinerario[], d: Pick<DatosItinerario, "fechaInicio">): { eventos: EventoItinerario[]; omitidas: FilaItinerario[] } {
  const eventos: EventoItinerario[] = [];
  const omitidas: FilaItinerario[] = [];
  for (const f of filas) {
    const fecha = fechaUtc(f.fecha) !== null ? f.fecha : fechaDelDia(d, f.dia);
    if (!fecha || !horaValida(f.horaInicio) || !horaValida(f.horaFin) || f.horaFin <= f.horaInicio) {
      omitidas.push(f);
      continue;
    }
    eventos.push({ fecha, horaInicio: f.horaInicio, horaFin: f.horaFin, dia: f.dia, titulo: f.actividad || f.lugar || "Bloque del itinerario", descripcion: [f.lugar, f.nota].filter(Boolean).join(" — ") });
  }
  eventos.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio));
  return { eventos, omitidas };
}

const escapar = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const sello = (f: string, h: string) => `${f.replace(/-/g, "")}T${h.replace(":", "")}00`;

/** Archivo .ics del itinerario (Google Calendar, Outlook, Apple Calendar). Las horas son «flotantes»: se muestran en la hora local de quien importa. */
export function construirIcsItinerario(eventos: EventoItinerario[], ahora: Date, nombre = "Itinerario de viaje"): string {
  const p2 = (n: number) => String(n).padStart(2, "0");
  const marca = `${ahora.getUTCFullYear()}${p2(ahora.getUTCMonth() + 1)}${p2(ahora.getUTCDate())}T${p2(ahora.getUTCHours())}${p2(ahora.getUTCMinutes())}${p2(ahora.getUTCSeconds())}Z`;
  const lineas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//guiapromptsia.com//Itinerario de viaje//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${escapar(nombre)}`];
  eventos.forEach((e, i) => {
    lineas.push("BEGIN:VEVENT", `UID:itinerario-${marca}-${i + 1}@guiapromptsia.com`, `DTSTAMP:${marca}`, `DTSTART:${sello(e.fecha, e.horaInicio)}`, `DTEND:${sello(e.fecha, e.horaFin)}`, `SUMMARY:${escapar(e.titulo)}`);
    if (e.descripcion) lineas.push(`DESCRIPTION:${escapar(e.descripcion)}`);
    lineas.push("END:VEVENT");
  });
  lineas.push("END:VCALENDAR");
  return lineas.map(plegar).join("\r\n") + "\r\n";
}

/**
 * Enlace «Ver ruta del día en Google Maps», sin API: encadena los lugares del día como paradas de una ruta a pie/auto que Google
 * resuelve por nombre. Se ordena por hora de inicio y se quitan lugares vacíos o repetidos seguidos.
 */
export function enlaceMapasDelDia(filas: FilaItinerario[]): string | null {
  const lugares = filas
    .filter((f) => f.lugar.trim())
    .slice()
    .sort((a, b) => (a.horaInicio || "").localeCompare(b.horaInicio || ""))
    .map((f) => f.lugar.trim())
    .filter((l, i, arr) => i === 0 || l !== arr[i - 1]);
  if (lugares.length === 0) return null;
  return `https://www.google.com/maps/dir/${lugares.map((l) => encodeURIComponent(l)).join("/")}`;
}

/** Texto de un día, listo para compartir (WhatsApp u otro): fecha, zona y cada bloque con su horario. */
export function textoDelDia(dia: number, fecha: string | null, filas: FilaItinerario[]): string {
  const zona = filas.find((f) => f.zona.trim())?.zona.trim();
  const encabezado = `Día ${dia}${fecha ? ` (${fecha})` : ""}${zona ? ` — ${zona}` : ""}`;
  const bloques = filas
    .slice()
    .sort((a, b) => (a.horaInicio || "").localeCompare(b.horaInicio || ""))
    .map((f) => `${f.horaInicio && f.horaFin ? `${f.horaInicio}–${f.horaFin} ` : ""}${f.actividad}${f.lugar ? ` (${f.lugar})` : ""}`);
  return [encabezado, ...bloques].join("\n");
}

/** Enlace de WhatsApp con el texto de un día (o de todo el itinerario) ya codificado. */
export function enlaceWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

export { aFecha };
