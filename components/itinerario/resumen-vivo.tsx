"use client";

import { Check, Circle } from "lucide-react";
import { almacenItinerario } from "./almacen";
import { diasDelViaje, viajerosDelGrupo } from "@/lib/itinerario/calculo";
import { lugaresLlenos } from "@/lib/itinerario/prompt";
import { MAX_LUGARES, RITMOS } from "@/lib/itinerario/tipos";

const horaValida = (h: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h.trim());

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): cuántos días tiene tu viaje y cuánto cabe en cada uno según el ritmo. */
export function ResumenVivo() {
  const d = almacenItinerario.useDatos();
  const dias = diasDelViaje(d);
  const v = viajerosDelGrupo(d);
  const ritmo = RITMOS.find((r) => r.valor === d.ritmo)!;
  const lugares = lugaresLlenos(d).length;
  const pasos: [boolean, string][] = [
    [d.destino.trim().length > 0, "Destino"],
    [dias !== null, "Fechas de inicio y fin"],
    [horaValida(d.horaLlegada) && horaValida(d.horaSalida), "Hora de llegada y de salida"],
    [v.adultos !== null, "Número de adultos"],
    [d.intereses.length > 0, "Al menos un interés"],
  ];

  return (
    <section aria-labelledby="titulo-resumen-itinerario" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-itinerario" className="text-lg font-semibold leading-tight">
        Tu viaje <span className="font-normal text-muted-foreground">(se calcula solo)</span>
      </h2>

      <div aria-live="polite" className="mt-4">
        {dias !== null ? (
          <div className="aparecer space-y-3" data-resumen>
            <div className="rounded-lg border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Duración</p>
              <p className="mt-0.5 text-3xl font-bold tabular" data-dias>
                {dias} {dias === 1 ? "día" : "días"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground tabular">
                {d.fechaInicio} a {d.fechaFin}
              </p>
            </div>
            <div className="rounded-lg border bg-surface p-3 text-sm">
              <p>
                Ritmo <strong className="font-semibold text-foreground">{ritmo.etiqueta.toLowerCase()}</strong>: hasta {ritmo.maxPorDia} actividades principales por día (menos el día de llegada y el de salida).
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escribe las fechas de inicio y fin de tu viaje y verás aquí cuántos días tiene.</p>
        )}
      </div>

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Lo esencial</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {pasos.map(([ok, texto]) => (
            <li key={texto} className="flex items-center gap-2">
              {ok ? <Check aria-hidden className="size-4 text-ok" /> : <Circle aria-hidden className="size-4 text-muted-foreground" />}
              <span className={ok ? "" : "text-muted-foreground"}>
                {texto}
                <span className="sr-only">{ok ? " (listo)" : " (falta)"}</span>
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2 text-muted-foreground">
            <Circle aria-hidden className="size-4" />
            Lugares deseados: {lugares} de {MAX_LUGARES} (opcional)
          </li>
        </ul>
      </div>
    </section>
  );
}
