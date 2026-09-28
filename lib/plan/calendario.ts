import type { FilaPlan } from "./tipos";

export interface EventoPlan {
  /** Fecha del evento (AAAA-MM-DD). */
  fecha: string;
  /** Hora de inicio y de fin (HH:MM), en la hora local de quien importa el calendario. */
  inicio: string;
  fin: string;
  /** Fecha y hora de fin (puede ser el día siguiente si las tareas pasan de medianoche). */
  finFecha: string;
  semana: number;
  titulo: string;
  descripcion: string;
  minutos: number;
}

const p2 = (n: number) => String(n).padStart(2, "0");

/** Interpreta «AAAA-MM-DD» como fecha real (rechaza el 31 de febrero); devuelve milisegundos UTC o null. */
export function fechaUtc(s: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s ?? "").trim());
  if (!m) return null;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(t);
  return d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]) ? t : null;
}

export const aFecha = (t: number): string => {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
};

/** ¿La fecha es un lunes? */
export function esLunes(s: string): boolean {
  const t = fechaUtc(s);
  return t !== null && new Date(t).getUTCDay() === 1;
}

/** Días entre dos fechas AAAA-MM-DD (b − a); null si alguna no es válida. */
export function diasEntre(a: string, b: string): number | null {
  const x = fechaUtc(a);
  const y = fechaUtc(b);
  return x === null || y === null ? null : Math.round((y - x) / 86_400_000);
}

export function sumarDias(s: string, dias: number): string | null {
  const t = fechaUtc(s);
  return t === null ? null : aFecha(t + dias * 86_400_000);
}

const horaValida = (h: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h);

/**
 * Coloca cada tarea en el calendario. `lunes` es el lunes de la semana 1. Las tareas de un mismo día se apilan una tras otra desde
 * `hora`, en el orden en que aparecen en la tabla. Las filas sin día reconocido o sin minutos válidos se devuelven aparte.
 */
export function calendarizar(filas: FilaPlan[], lunes: string, hora: string): { eventos: EventoPlan[]; omitidas: FilaPlan[] } {
  const base = fechaUtc(lunes);
  if (base === null || !horaValida(hora)) return { eventos: [], omitidas: filas };
  const [hh, mm] = hora.split(":").map(Number);
  const cursores = new Map<string, number>();
  const eventos: EventoPlan[] = [];
  const omitidas: FilaPlan[] = [];
  for (const f of filas) {
    if (f.diaIdx < 0 || f.minutos === null || f.minutos <= 0 || f.semana < 1) {
      omitidas.push(f);
      continue;
    }
    const dia = base + ((f.semana - 1) * 7 + f.diaIdx) * 86_400_000;
    const clave = String(dia);
    const inicio = cursores.get(clave) ?? dia + (hh * 60 + mm) * 60_000;
    const fin = inicio + f.minutos * 60_000;
    cursores.set(clave, fin);
    const i = new Date(inicio);
    const e = new Date(fin);
    eventos.push({
      fecha: aFecha(dia),
      inicio: `${p2(i.getUTCHours())}:${p2(i.getUTCMinutes())}`,
      fin: `${p2(e.getUTCHours())}:${p2(e.getUTCMinutes())}`,
      finFecha: aFecha(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate())),
      semana: f.semana,
      titulo: f.tarea || "Tarea del plan de búsqueda",
      descripcion: f.entregable ? `Entregable: ${f.entregable}` : "",
      minutos: f.minutos,
    });
  }
  return { eventos, omitidas };
}

const escapar = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Pliega una línea a 75 octetos como pide el formato iCalendar (RFC 5545), sin partir caracteres de varios bytes. */
export function plegar(linea: string): string {
  const enc = new TextEncoder();
  if (enc.encode(linea).length <= 75) return linea;
  const partes: string[] = [];
  let actual = "";
  let bytes = 0;
  let limite = 75;
  for (const c of linea) {
    const n = enc.encode(c).length;
    if (bytes + n > limite) {
      partes.push(actual);
      actual = c;
      bytes = n;
      limite = 74; // las líneas de continuación empiezan con un espacio
    } else {
      actual += c;
      bytes += n;
    }
  }
  partes.push(actual);
  return partes.join("\r\n ");
}

const sello = (f: string, h: string) => `${f.replace(/-/g, "")}T${h.replace(":", "")}00`;

/** Archivo .ics (Google Calendar, Outlook, Apple Calendar). Las horas son «flotantes»: se muestran en la hora local de quien importa. */
export function construirIcs(eventos: EventoPlan[], ahora: Date, nombre = "Plan de búsqueda de empleo"): string {
  const marca = `${ahora.getUTCFullYear()}${p2(ahora.getUTCMonth() + 1)}${p2(ahora.getUTCDate())}T${p2(ahora.getUTCHours())}${p2(ahora.getUTCMinutes())}${p2(ahora.getUTCSeconds())}Z`;
  const lineas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//guiapromptsia.com//Plan de busqueda de empleo//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${escapar(nombre)}`];
  eventos.forEach((e, i) => {
    lineas.push("BEGIN:VEVENT", `UID:plan-${marca}-${i + 1}@guiapromptsia.com`, `DTSTAMP:${marca}`, `DTSTART:${sello(e.fecha, e.inicio)}`, `DTEND:${sello(e.finFecha, e.fin)}`, `SUMMARY:${escapar(e.titulo)}`);
    if (e.descripcion) lineas.push(`DESCRIPTION:${escapar(e.descripcion)}`);
    lineas.push("END:VEVENT");
  });
  lineas.push("END:VCALENDAR");
  return lineas.map(plegar).join("\r\n") + "\r\n";
}
