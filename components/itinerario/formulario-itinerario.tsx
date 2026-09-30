"use client";

import { Briefcase, Heart, ListChecks, Lock, MapPin, Plus, Trash2 } from "lucide-react";
import { Campo, Grupo } from "@/components/prompts/campo-formulario";
import { Numero, Texto } from "@/components/plan/campos";
import { almacenItinerario } from "./almacen";
import { diasDelViaje } from "@/lib/itinerario/calculo";
import { INTERESES, MAX_LUGARES, nuevoId, RITMOS, TRANSPORTES, lugarVacio, type DatosItinerario, type Interes, type Lugar, type Transporte } from "@/lib/itinerario/tipos";

function Checklist<T extends string>({ etiqueta, opciones, valores, alCambiar, columnas = 3 }: { etiqueta: string; opciones: { valor: T; etiqueta: string }[]; valores: T[]; alCambiar: (v: T[]) => void; columnas?: 2 | 3 }) {
  const alternar = (v: T) => alCambiar(valores.includes(v) ? valores.filter((x) => x !== v) : [...valores, v]);
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-semibold">{etiqueta}</legend>
      <div className={`grid gap-2 ${columnas === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {opciones.map((o) => (
          <label key={o.valor} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm ${valores.includes(o.valor) ? "border-brand-solid bg-brand-muted" : "bg-surface"}`}>
            <input type="checkbox" className="size-4 shrink-0 accent-[var(--accent)]" checked={valores.includes(o.valor)} onChange={() => alternar(o.valor)} />
            {o.etiqueta}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function EditorDeLugar({ lugar, indice, alCambiar, alQuitar }: { lugar: Lugar; indice: number; alCambiar: (c: Partial<Lugar>) => void; alQuitar: () => void }) {
  return (
    <li className="rounded-lg border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Lugar {indice + 1}</p>
        <button type="button" className="btn btn-texto -mr-2" onClick={alQuitar} aria-label={`Quitar el lugar ${indice + 1}${lugar.nombre ? `: ${lugar.nombre}` : ""}`}>
          <Trash2 aria-hidden className="size-4" /> Quitar
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Texto etiqueta="Nombre del lugar" valor={lugar.nombre} alCambiar={(v) => alCambiar({ nombre: v })} placeholder="Ej.: Monasterio de Santa Catalina" />
        <Campo etiqueta="Prioridad">
          {(id) => (
            <select id={id} className="campo" value={lugar.prioridad} onChange={(e) => alCambiar({ prioridad: e.target.value as Lugar["prioridad"] })}>
              <option value="imprescindible">Imprescindible</option>
              <option value="opcional">Opcional</option>
            </select>
          )}
        </Campo>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Texto etiqueta="Horario conocido" valor={lugar.horario} alCambiar={(v) => alCambiar({ horario: v })} placeholder="Ej.: abre de 9:00 a 17:00, cerrado los lunes" />
        <Texto etiqueta="Reserva (si ya la tienes)" valor={lugar.reserva} alCambiar={(v) => alCambiar({ reserva: v })} placeholder="Ej.: confirmada para el 11/11 a las 04:00" />
      </div>
    </li>
  );
}

export function FormularioItinerario({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenItinerario.useDatos();
  const modoEjemplo = almacenItinerario.useModoEjemplo();
  const poner = <K extends keyof DatosItinerario>(clave: K, valor: DatosItinerario[K]) => almacenItinerario.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosItinerario) => (v: string) => poner(clave, v as never);
  const cambiarLugar = (id: string, c: Partial<Lugar>) => poner("lugares", d.lugares.map((l) => (l.id === id ? { ...l, ...c } : l)));
  const dias = diasDelViaje(d);
  const errFechas = d.fechaInicio.trim() && d.fechaFin.trim() && dias === null ? "La fecha de fin debe ser igual o posterior a la de inicio." : undefined;

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de tu viaje" autoComplete="off">
      <Grupo icono={MapPin} titulo="Tu viaje" descripcion="Con el destino y las fechas la página calcula cuántos días tiene tu itinerario.">
        <Texto etiqueta="Destino" valor={d.destino} alCambiar={texto("destino")} obligatorio placeholder="Ej.: Arequipa, Perú" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Fecha de inicio" obligatorio>
            {(id) => <input id={id} type="date" className="campo" value={d.fechaInicio} onChange={(e) => poner("fechaInicio", e.target.value)} />}
          </Campo>
          <Campo etiqueta="Fecha de fin" obligatorio>
            {(id) => (
              <>
                <input id={id} type="date" className="campo" value={d.fechaFin} onChange={(e) => poner("fechaFin", e.target.value)} aria-invalid={Boolean(errFechas)} aria-describedby={errFechas ? `${id}-err` : undefined} />
                {errFechas && (
                  <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
                    {errFechas}
                  </p>
                )}
              </>
            )}
          </Campo>
        </div>
        {dias !== null && (
          <p className="text-sm text-muted-foreground tabular" data-dias>
            {dias} {dias === 1 ? "día" : "días"} de viaje.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Hora de llegada" obligatorio ayuda="Al destino, el primer día.">
            {(id) => <input id={id} type="time" className="campo tabular" value={d.horaLlegada} onChange={(e) => poner("horaLlegada", e.target.value)} />}
          </Campo>
          <Campo etiqueta="Hora de salida" obligatorio ayuda="Del destino, el último día.">
            {(id) => <input id={id} type="time" className="campo tabular" value={d.horaSalida} onChange={(e) => poner("horaSalida", e.target.value)} />}
          </Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Ciudad de llegada (opcional)" valor={d.ciudadLlegada} alCambiar={texto("ciudadLlegada")} placeholder="Si es distinta al destino" />
          <Texto etiqueta="Ciudad de salida (opcional)" valor={d.ciudadSalida} alCambiar={texto("ciudadSalida")} placeholder="Si es distinta al destino" />
        </div>
        <Texto etiqueta="Alojamiento (zona o dirección)" valor={d.alojamiento} alCambiar={texto("alojamiento")} placeholder="Ej.: hotel en el Centro Histórico" ayuda="Ayuda a agrupar las actividades por cercanía." />
      </Grupo>

      <Grupo icono={Briefcase} titulo="Viajeros" descripcion="Sirve para que el itinerario respete el ritmo y las necesidades del grupo.">
        <Numero etiqueta="Adultos" valor={d.adultos} alCambiar={texto("adultos")} obligatorio entero minimo={1} placeholder="Ej.: 2" />
        <Texto largo etiqueta="Edades de niños y otras necesidades (opcional)" valor={d.viajerosTexto} alCambiar={texto("viajerosTexto")} placeholder="Ej.: 2 niños de 6 y 9 años" />
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" checked={d.movilidadReducida} onChange={(e) => poner("movilidadReducida", e.target.checked)} />
          <span>
            <span className="font-semibold">Alguien del grupo tiene movilidad reducida</span>
            <span className="block text-xs text-muted-foreground">El itinerario evitará dar por hecho largas caminatas o muchas escaleras.</span>
          </span>
        </label>
        <Texto etiqueta="Presupuesto aproximado (opcional)" valor={d.presupuesto} alCambiar={texto("presupuesto")} placeholder="Ej.: S/ 800 para actividades y comidas" />
      </Grupo>

      <Grupo icono={Heart} titulo="Ritmo e intereses" descripcion="Definen cuántas actividades caben en un día y qué tipo de lugares priorizar.">
        <fieldset>
          <legend className="mb-1.5 block text-sm font-semibold">
            Ritmo del viaje
            <span aria-hidden className="ml-1 text-destructive">*</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {RITMOS.map((r) => (
              <label key={r.valor} className={`tarjeta flex min-h-11 cursor-pointer flex-col gap-0.5 p-3 text-sm font-semibold transition-colors ${d.ritmo === r.valor ? "border-brand-solid ring-1 ring-brand-solid/40" : ""}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="ritmo" value={r.valor} checked={d.ritmo === r.valor} onChange={() => poner("ritmo", r.valor)} className="size-4 accent-[var(--accent)]" />
                  {r.etiqueta}
                </span>
                <span className="pl-6 text-xs font-normal text-muted-foreground">{r.ayuda}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Checklist etiqueta="Intereses" opciones={INTERESES} valores={d.intereses} alCambiar={(v) => poner("intereses", v as Interes[])} />
        <Texto etiqueta="Otros intereses (opcional)" valor={d.interesesTexto} alCambiar={texto("interesesTexto")} placeholder="Ej.: fotografía, mercados locales" />
        <Checklist etiqueta="Transporte disponible (opcional)" opciones={TRANSPORTES} valores={d.transporte} alCambiar={(v) => poner("transporte", v as Transporte[])} columnas={2} />
        <Texto largo etiqueta="Restricciones (opcional)" valor={d.restricciones} alCambiar={texto("restricciones")} placeholder="Ej.: dieta sin maní, horario de descanso después del almuerzo, días de cierre que ya conoces" />
      </Grupo>

      <Grupo icono={ListChecks} titulo={`Lugares deseados (opcional, hasta ${MAX_LUGARES})`} descripcion="Si ya tienes lugares en mente, el itinerario prioriza solo estos: no inventa nombres nuevos.">
        {d.lugares.length > 0 && (
          <ul className="space-y-3" data-lugares>
            {d.lugares.map((l, i) => (
              <EditorDeLugar key={l.id} lugar={l} indice={i} alCambiar={(c) => cambiarLugar(l.id, c)} alQuitar={() => poner("lugares", d.lugares.filter((x) => x.id !== l.id))} />
            ))}
          </ul>
        )}
        <button type="button" className="btn btn-secundario" disabled={d.lugares.length >= MAX_LUGARES} onClick={() => poner("lugares", [...d.lugares, lugarVacio(nuevoId("l"))])}>
          <Plus aria-hidden className="size-4" /> Agregar lugar {d.lugares.length >= MAX_LUGARES ? `(máximo ${MAX_LUGARES})` : ""}
        </button>
      </Grupo>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Lock aria-hidden className="size-4" />
          {modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Lo que escribes se guarda solo en tu navegador, para que no lo pierdas si recargas."}
        </p>
        <button
          type="button"
          className="btn btn-texto"
          onClick={() => {
            if (modoEjemplo || window.confirm("¿Borrar todos los datos del formulario? No se puede deshacer.")) alBorrar();
          }}
        >
          Borrar mis datos
        </button>
      </div>
    </form>
  );
}
