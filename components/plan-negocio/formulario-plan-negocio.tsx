"use client";

import { Building2, Coins, Target, Users } from "lucide-react";
import { Grupo } from "@/components/prompts/campo-formulario";
import { Numero, Selector, Texto } from "@/components/plan/campos";
import { almacenPlanNegocio } from "./almacen";
import { FINALIDADES, MAX_COMPETIDORES, MAX_EQUIPO, MAX_ITEMS, competidorVacio, itemMontoVacio, miembroVacio, nuevoId, type Competidor, type DatosPlanNegocio, type ItemMonto, type MiembroEquipo } from "@/lib/plan-negocio/tipos";

function EditorItem({ item, indice, etiqueta, alCambiar, alQuitar }: { item: ItemMonto; indice: number; etiqueta: string; alCambiar: (c: Partial<ItemMonto>) => void; alQuitar: () => void }) {
  return (
    <li className="grid grid-cols-[1fr_auto_auto] items-end gap-2 sm:grid-cols-[1fr_9rem_auto]">
      <Texto etiqueta={`${etiqueta} ${indice + 1}: concepto`} valor={item.concepto} alCambiar={(v) => alCambiar({ concepto: v })} placeholder="Ej.: Alquiler del local" />
      <Numero etiqueta="Monto (S/)" valor={item.monto} alCambiar={(v) => alCambiar({ monto: v })} placeholder="0.00" minimo={0} />
      <button type="button" onClick={alQuitar} className="btn btn-texto mb-0.5" aria-label={`Quitar «${item.concepto.trim() || `${etiqueta} ${indice + 1}`}»`}>
        Quitar
      </button>
    </li>
  );
}

function ListaItems({ etiqueta, items, alCambiar, tope }: { etiqueta: string; items: ItemMonto[]; alCambiar: (items: ItemMonto[]) => void; tope: number }) {
  return (
    <div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <EditorItem key={it.id} item={it} indice={i} etiqueta={etiqueta} alCambiar={(c) => alCambiar(items.map((x) => (x.id === it.id ? { ...x, ...c } : x)))} alQuitar={() => alCambiar(items.filter((x) => x.id !== it.id))} />
        ))}
      </ul>
      {items.length < tope && (
        <button type="button" className="btn btn-secundario mt-2" onClick={() => alCambiar([...items, itemMontoVacio(nuevoId("i"))])}>
          Agregar {etiqueta.toLowerCase()}
        </button>
      )}
    </div>
  );
}

function EditorCompetidor({ c, indice, alCambiar, alQuitar }: { c: Competidor; indice: number; alCambiar: (c: Partial<Competidor>) => void; alQuitar: () => void }) {
  return (
    <li className="tarjeta space-y-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Competidor {indice + 1}</p>
        <button type="button" onClick={alQuitar} className="btn btn-texto -mr-2" aria-label={`Quitar el competidor «${c.nombre.trim() || indice + 1}»`}>
          Quitar
        </button>
      </div>
      <Texto etiqueta="Nombre" valor={c.nombre} alCambiar={(v) => alCambiar({ nombre: v })} placeholder="Ej.: Lavandería Don Pepe" />
      <Texto etiqueta="Qué ofrece" valor={c.oferta} alCambiar={(v) => alCambiar({ oferta: v })} placeholder="Ej.: lavado por kilo, sin recojo" />
      <Texto etiqueta="Precio (opcional)" valor={c.precio} alCambiar={(v) => alCambiar({ precio: v })} placeholder="Ej.: 5.50" />
    </li>
  );
}

function EditorMiembro({ m, indice, alCambiar, alQuitar }: { m: MiembroEquipo; indice: number; alCambiar: (c: Partial<MiembroEquipo>) => void; alQuitar: () => void }) {
  return (
    <li className="tarjeta space-y-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Persona {indice + 1}</p>
        <button type="button" onClick={alQuitar} className="btn btn-texto -mr-2" aria-label={`Quitar a «${m.rol.trim() || indice + 1}»`}>
          Quitar
        </button>
      </div>
      <Texto etiqueta="Rol" valor={m.rol} alCambiar={(v) => alCambiar({ rol: v })} placeholder="Ej.: Fundadora, operaciones" />
      <Texto etiqueta="Experiencia (opcional)" valor={m.experiencia} alCambiar={(v) => alCambiar({ experiencia: v })} placeholder="Ej.: 3 años administrando un negocio familiar" />
    </li>
  );
}

export function FormularioPlanNegocio({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenPlanNegocio.useDatos();
  const modoEjemplo = almacenPlanNegocio.useModoEjemplo();
  const poner = <K extends keyof DatosPlanNegocio>(clave: K, valor: DatosPlanNegocio[K]) => almacenPlanNegocio.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosPlanNegocio) => (v: string) => poner(clave, v as never);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de tu negocio" autoComplete="off">
      <Grupo icono={Building2} titulo="Tu negocio" descripcion="Lo esencial para que el plan tenga sentido: sin esto, la IA solo podría adivinar.">
        <Texto etiqueta="Nombre de la empresa" valor={d.nombreEmpresa} alCambiar={texto("nombreEmpresa")} obligatorio placeholder="Ej.: Lavandería Express Surquillo" />
        <Texto largo etiqueta="Descripción breve" valor={d.descripcion} alCambiar={texto("descripcion")} placeholder="Ej.: Lavado y planchado de ropa por kilo, con recojo a domicilio" />
        <Texto largo etiqueta="Producto o servicio" valor={d.producto} alCambiar={texto("producto")} obligatorio placeholder="Ej.: Lavado y planchado de ropa por kilo, con recojo y entrega en 24-48 h" />
        <Texto largo etiqueta="Problema que resuelve" valor={d.problema} alCambiar={texto("problema")} obligatorio placeholder="Ej.: Profesionales sin tiempo para lavar y planchar su ropa" />
        <Texto largo etiqueta="Cliente objetivo" valor={d.clienteObjetivo} alCambiar={texto("clienteObjetivo")} obligatorio placeholder="Ej.: Profesionales y familias de 25 a 55 años, en Surquillo" />
        <Texto etiqueta="Ubicación" valor={d.ubicacion} alCambiar={texto("ubicacion")} placeholder="Ej.: Surquillo, Lima" />
      </Grupo>

      <Grupo icono={Target} titulo="Mercado y competencia" descripcion="Qué vas a cobrar, cómo vas a vender y quién ya resuelve este problema.">
        <Texto etiqueta="Modelo de ingresos" valor={d.modeloIngresos} alCambiar={texto("modeloIngresos")} placeholder="Ej.: Cobro por kilo de ropa lavada" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Precios previstos (opcional)" valor={d.preciosPrevistos} alCambiar={texto("preciosPrevistos")} placeholder="Ej.: S/ 6 por kilo" />
          <Texto etiqueta="Canales de venta (opcional)" valor={d.canalesVenta} alCambiar={texto("canalesVenta")} placeholder="Ej.: WhatsApp, redes, volanteo" />
        </div>
        <fieldset>
          <legend className="mb-1.5 block text-sm font-semibold">Competidores conocidos (opcional)</legend>
          <ul className="space-y-2">
            {d.competidores.map((c, i) => (
              <EditorCompetidor key={c.id} c={c} indice={i} alCambiar={(cambios) => poner("competidores", d.competidores.map((x) => (x.id === c.id ? { ...x, ...cambios } : x)))} alQuitar={() => poner("competidores", d.competidores.filter((x) => x.id !== c.id))} />
            ))}
          </ul>
          {d.competidores.length < MAX_COMPETIDORES && (
            <button type="button" className="btn btn-secundario mt-2" onClick={() => poner("competidores", [...d.competidores, competidorVacio(nuevoId("c"))])}>
              Agregar competidor
            </button>
          )}
        </fieldset>
      </Grupo>

      <Grupo icono={Users} titulo="Operación y equipo" descripcion="Con qué cuentas hoy para operar.">
        <Texto largo etiqueta="Recursos disponibles (opcional)" valor={d.recursosDisponibles} alCambiar={texto("recursosDisponibles")} placeholder="Ej.: Local de 40 m² ya identificado; una moto propia" />
        <fieldset>
          <legend className="mb-1.5 block text-sm font-semibold">Equipo (opcional)</legend>
          <ul className="space-y-2">
            {d.equipo.map((m, i) => (
              <EditorMiembro key={m.id} m={m} indice={i} alCambiar={(cambios) => poner("equipo", d.equipo.map((x) => (x.id === m.id ? { ...x, ...cambios } : x)))} alQuitar={() => poner("equipo", d.equipo.filter((x) => x.id !== m.id))} />
            ))}
          </ul>
          {d.equipo.length < MAX_EQUIPO && (
            <button type="button" className="btn btn-secundario mt-2" onClick={() => poner("equipo", [...d.equipo, miembroVacio(nuevoId("m"))])}>
              Agregar persona
            </button>
          )}
        </fieldset>
      </Grupo>

      <Grupo icono={Coins} titulo="Números" descripcion="Con esto la página calcula tu inversión, tus costos fijos, tu margen y tu punto de equilibrio: la IA nunca recalcula estas cifras, solo las cita.">
        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-1.5 block text-sm font-semibold">Inversión inicial (ítems)</legend>
            <ListaItems etiqueta="Inversión" items={d.inversionInicial} alCambiar={(v) => poner("inversionInicial", v)} tope={MAX_ITEMS} />
          </fieldset>
          <fieldset>
            <legend className="mb-1.5 block text-sm font-semibold">Gastos fijos mensuales (ítems)</legend>
            <ListaItems etiqueta="Gasto" items={d.gastosMensuales} alCambiar={(v) => poner("gastosMensuales", v)} tope={MAX_ITEMS} />
          </fieldset>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Numero etiqueta="Precio de venta por unidad (S/)" valor={d.precioVenta} alCambiar={texto("precioVenta")} obligatorio placeholder="Ej.: 6" minimo={0} />
          <Numero etiqueta="Costo variable por unidad (S/)" valor={d.costoVariable} alCambiar={texto("costoVariable")} obligatorio ayuda="Lo que te cuesta cada unidad extra: insumos, empaque, comisión." placeholder="Ej.: 2.40" minimo={0} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Numero etiqueta="Demanda mensual estimada (unidades)" valor={d.demandaMensualEstimada} alCambiar={texto("demandaMensualEstimada")} ayuda="Tu escenario medio: es un supuesto tuyo, no un cálculo." placeholder="Ej.: 1800" minimo={0} />
          <Numero etiqueta="Variación de los escenarios (%)" valor={d.variacionEscenarios} alCambiar={texto("variacionEscenarios")} ayuda="Cuánto suben o bajan los escenarios optimista y pesimista. Por defecto, 30." placeholder="30" minimo={0} maximo={90} />
        </div>
      </Grupo>

      <Grupo icono={Target} titulo="Objetivos y finalidad">
        <Texto largo etiqueta="Objetivos a 12 meses (opcional)" valor={d.objetivos12Meses} alCambiar={texto("objetivos12Meses")} placeholder="Ej.: Llegar a 2.500 kg/mes atendidos" />
        <Selector etiqueta="¿Para qué vas a usar este plan?" valor={d.finalidad} opciones={FINALIDADES.map((f) => ({ valor: f.valor, etiqueta: f.etiqueta }))} alCambiar={(v) => poner("finalidad", v)} obligatorio ayuda={FINALIDADES.find((f) => f.valor === d.finalidad)?.ayuda} />
        <Texto largo etiqueta="Información adicional (opcional)" valor={d.infoAdicional} alCambiar={texto("infoAdicional")} placeholder="Cualquier otro dato relevante" />
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
