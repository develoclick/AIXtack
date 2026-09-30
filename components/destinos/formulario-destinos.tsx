"use client";

import { Compass, MapPin, Users, Wallet } from "lucide-react";
import { Campo, Grupo } from "@/components/prompts/campo-formulario";
import { Numero, Selector, Texto } from "@/components/plan/campos";
import { almacenDestinos } from "./almacen";
import { rangoNoches } from "@/lib/destinos/calculo";
import { ALCANCES, ALOJAMIENTOS, COMODIDADES, PREFERENCIAS, type Comodidad, type DatosDestinos, type Preferencia, type TipoAlojamiento } from "@/lib/destinos/tipos";

const MONEDAS = ["S/", "US$", "€", "MX$", "COP$", "CLP$", "ARS$"];

function Checklist<T extends string>({ etiqueta, opciones, valores, alCambiar }: { etiqueta: string; opciones: { valor: T; etiqueta: string }[]; valores: T[]; alCambiar: (v: T[]) => void }) {
  const alternar = (v: T) => alCambiar(valores.includes(v) ? valores.filter((x) => x !== v) : [...valores, v]);
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-semibold">{etiqueta}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
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

export function FormularioDestinos({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenDestinos.useDatos();
  const modoEjemplo = almacenDestinos.useModoEjemplo();
  const poner = <K extends keyof DatosDestinos>(clave: K, valor: DatosDestinos[K]) => almacenDestinos.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosDestinos) => (v: string) => poner(clave, v as never);
  const rango = rangoNoches(d);
  const errRango = d.nochesMin.trim() && d.nochesMax.trim() && rango === null ? "El máximo debe ser igual o mayor que el mínimo (ambos, números enteros de 1 o más)." : undefined;

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de tu presupuesto de viaje" autoComplete="off">
      <div className="rounded-lg border border-warn/40 bg-warn-muted p-3 text-sm leading-relaxed">
        <strong className="font-semibold">Esta página no conoce precios de pasajes ni de alojamiento en tiempo real.</strong> Reparte tu presupuesto y te ayuda a comparar los destinos que tú (o tu IA, con búsqueda web) consulten. Cada cifra se marca como dato real, estimación o sin dato.
      </div>

      <Grupo icono={Wallet} titulo="Tu presupuesto" descripcion="La página reparte en tu navegador cuánto queda para pasajes y alojamiento, antes de mostrarte ningún destino.">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Numero etiqueta="Presupuesto total" valor={d.presupuesto} alCambiar={texto("presupuesto")} obligatorio placeholder="Ej.: 2500" />
          <Campo etiqueta="Moneda">
            {(id) => (
              <select id={id} className="campo" value={d.moneda} onChange={(e) => poner("moneda", e.target.value)}>
                {MONEDAS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>
        <Numero etiqueta="Gasto diario por persona en el destino" valor={d.gastoDiario} alCambiar={texto("gastoDiario")} obligatorio placeholder="Ej.: 70" ayuda="Comida, transporte local y actividades. Es tu propia estimación: la página la reserva antes de calcular." />
        <Numero etiqueta="Imprevistos (%)" valor={d.imprevistos} alCambiar={texto("imprevistos")} entero minimo={0} maximo={100} placeholder="10" ayuda="Porcentaje del presupuesto total que se aparta antes de calcular." />
      </Grupo>

      <Grupo icono={MapPin} titulo="Tu viaje" descripcion="El rango de noches define cuántos días de gasto diario se reservan y en qué candidatos buscar.">
        <Texto etiqueta="Origen" valor={d.origen} alCambiar={texto("origen")} obligatorio placeholder="Ej.: Lima, Perú" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Fecha de inicio (opcional)" valor={d.fechaInicio} alCambiar={texto("fechaInicio")} tipo="date" />
          <Texto etiqueta="Fecha de fin (opcional)" valor={d.fechaFin} alCambiar={texto("fechaFin")} tipo="date" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Numero etiqueta="Mínimo de noches" valor={d.nochesMin} alCambiar={texto("nochesMin")} obligatorio entero minimo={1} placeholder="Ej.: 5" />
          <Numero etiqueta="Máximo de noches" valor={d.nochesMax} alCambiar={texto("nochesMax")} obligatorio entero minimo={1} placeholder="Ej.: 7" />
        </div>
        {errRango && (
          <p role="alert" className="-mt-2 text-xs font-medium text-destructive">
            {errRango}
          </p>
        )}
        {rango && (
          <Numero
            etiqueta={`Simulador: noches a calcular (entre ${rango.min} y ${rango.max})`}
            valor={d.nochesSimuladas}
            alCambiar={texto("nochesSimuladas")}
            placeholder={String(rango.max)}
            ayuda="Cambia este número y el reparto y los destinos se recalculan al instante. Vacío = usa el máximo."
          />
        )}
      </Grupo>

      <Grupo icono={Users} titulo="Viajeros y alojamiento">
        <Numero etiqueta="Viajeros" valor={d.viajeros} alCambiar={texto("viajeros")} obligatorio entero minimo={1} placeholder="Ej.: 2" />
        <Selector etiqueta="Tipo de alojamiento" valor={d.alojamiento} opciones={ALOJAMIENTOS.map((a) => ({ valor: a.valor, etiqueta: a.etiqueta }))} alCambiar={(v) => poner("alojamiento", v as TipoAlojamiento)} obligatorio />
        <Selector etiqueta="Nivel de comodidad" valor={d.comodidad} opciones={COMODIDADES.map((c) => ({ valor: c.valor, etiqueta: c.etiqueta }))} alCambiar={(v) => poner("comodidad", v as Comodidad)} />
      </Grupo>

      <Grupo icono={Compass} titulo="Preferencias (opcional)" descripcion="Ayudan a la IA a proponer destinos coherentes con lo que buscas.">
        <Checklist etiqueta="Tipo de destino" opciones={PREFERENCIAS} valores={d.preferencias} alCambiar={(v) => poner("preferencias", v as Preferencia[])} />
        <Selector etiqueta="Alcance" valor={d.alcance} opciones={ALCANCES.map((a) => ({ valor: a.valor, etiqueta: a.etiqueta }))} alCambiar={(v) => poner("alcance", v)} />
        <Texto etiqueta="Equipaje (opcional)" valor={d.equipaje} alCambiar={texto("equipaje")} placeholder="Ej.: solo mochila de mano" />
      </Grupo>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <button
          type="button"
          className="btn btn-texto"
          onClick={() => {
            if (modoEjemplo || window.confirm("¿Borrar todos los datos del formulario? No se puede deshacer.")) alBorrar();
          }}
        >
          Borrar mis datos
        </button>
        <span>{modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Lo que escribes se guarda solo en tu navegador."}</span>
      </div>
    </form>
  );
}
