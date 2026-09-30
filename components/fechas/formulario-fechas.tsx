"use client";

import { Filter, Luggage, MapPin, Users } from "lucide-react";
import { Campo, Grupo } from "@/components/prompts/campo-formulario";
import { Numero, Selector, Texto } from "@/components/plan/campos";
import { almacenFechas } from "./almacen";
import { diasDelPeriodo, parsearDuraciones } from "@/lib/fechas/calculo";
import { EQUIPAJES, MAX_DURACIONES } from "@/lib/fechas/tipos";
import type { DatosFechas } from "@/lib/fechas/tipos";

export function FormularioFechas({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenFechas.useDatos();
  const modoEjemplo = almacenFechas.useModoEjemplo();
  const poner = <K extends keyof DatosFechas>(clave: K, valor: DatosFechas[K]) => almacenFechas.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosFechas) => (v: string) => poner(clave, v as never);
  const dias = diasDelPeriodo(d);
  const duraciones = parsearDuraciones(d.duraciones);
  const errFechas = d.fechaInicio.trim() && d.fechaFin.trim() && dias === null ? "La fecha de fin debe ser posterior a la de inicio." : undefined;
  const errDuraciones = d.duraciones.trim() && duraciones.length === 0 ? "Escribe una o más duraciones en noches, separadas por comas (por ejemplo: 5, 6, 7)." : undefined;

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de tu búsqueda de vuelo" autoComplete="off">
      <div className="rounded-lg border border-warn/40 bg-warn-muted p-3 text-sm leading-relaxed">
        <strong className="font-semibold">Esta página no consulta precios en tiempo real.</strong> Genera las combinaciones de fechas y te ayuda a comparar los precios que tú obtengas de un buscador de vuelos o de una IA con búsqueda web.
      </div>

      <Grupo icono={MapPin} titulo="Tu vuelo" descripcion="Con el período y las duraciones, la página genera todas las combinaciones válidas de ida y vuelta.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Origen" valor={d.origen} alCambiar={texto("origen")} obligatorio placeholder="Ej.: Lima, Perú (LIM)" />
          <Texto etiqueta="Destino" valor={d.destino} alCambiar={texto("destino")} obligatorio placeholder="Ej.: Cusco, Perú (CUZ)" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Fecha inicial del período" obligatorio>
            {(id) => <input id={id} type="date" className="campo" value={d.fechaInicio} onChange={(e) => poner("fechaInicio", e.target.value)} />}
          </Campo>
          <Campo etiqueta="Fecha final del período" obligatorio>
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
        <Texto
          etiqueta="Duraciones a evaluar (noches)"
          valor={d.duraciones}
          alCambiar={texto("duraciones")}
          obligatorio
          placeholder="Ej.: 5, 6, 7"
          ayuda={`Una o varias, separadas por comas. Hasta ${MAX_DURACIONES}.${errDuraciones ? "" : duraciones.length ? ` Vas a evaluar: ${duraciones.join(", ")} noches.` : ""}`}
        />
        {errDuraciones && (
          <p role="alert" className="-mt-2 text-xs font-medium text-destructive">
            {errDuraciones}
          </p>
        )}
        {dias !== null && (
          <p className="text-sm text-muted-foreground tabular" data-dias-periodo>
            {dias + 1} días en el período ({dias} de diferencia entre las dos fechas).
          </p>
        )}
      </Grupo>

      <Grupo icono={Users} titulo="Viajeros" descripcion="Sirve para calcular el precio por persona y el ajuste de equipaje.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Numero etiqueta="Adultos" valor={d.adultos} alCambiar={texto("adultos")} obligatorio entero minimo={1} placeholder="Ej.: 2" />
          <Numero etiqueta="Niños" valor={d.ninos} alCambiar={texto("ninos")} entero minimo={0} placeholder="0" />
          <Numero etiqueta="Infantes" valor={d.infantes} alCambiar={texto("infantes")} entero minimo={0} placeholder="0" ayuda="En brazos, sin asiento." />
        </div>
      </Grupo>

      <Grupo icono={Filter} titulo="Preferencias (opcional)" descripcion="Ayudan a la IA a descartar opciones que no te sirven.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm">
            <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" checked={d.soloDirectos} onChange={(e) => poner("soloDirectos", e.target.checked)} />
            <span className="font-semibold">Solo vuelos directos</span>
          </label>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm">
            <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" checked={d.evitarMadrugada} onChange={(e) => poner("evitarMadrugada", e.target.checked)} />
            <span className="font-semibold">Evitar horarios de madrugada</span>
          </label>
        </div>
        <Selector etiqueta="Equipaje" valor={d.equipaje} opciones={EQUIPAJES} alCambiar={(v) => poner("equipaje", v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Aeropuertos alternativos" valor={d.aeropuertosAlternativos} alCambiar={texto("aeropuertosAlternativos")} placeholder="Ej.: Juliaca (JUL)" />
          <Texto etiqueta="Aerolíneas a excluir" valor={d.aerolineasExcluir} alCambiar={texto("aerolineasExcluir")} placeholder="Ej.: ninguna en particular" />
        </div>
      </Grupo>

      <Grupo icono={Luggage} titulo="Ajuste de precio real (opcional)" descripcion="Si lo completas, el paso 3 recalcula el precio de cada combinación sumando estos costos cuando la tarifa no los incluye.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Numero etiqueta="Equipaje de bodega por persona (en la moneda de la tarifa)" valor={d.costoEquipajeBodega} alCambiar={texto("costoEquipajeBodega")} placeholder="Ej.: 80" ayuda="Solo se suma en las filas cuya tarifa no dice que ya lo incluye." />
          <Numero etiqueta="Traslados por viaje" valor={d.costoTraslados} alCambiar={texto("costoTraslados")} placeholder="Ej.: 60" ayuda="Ida y vuelta al aeropuerto, si no lo cuentas en otra herramienta." />
        </div>
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
