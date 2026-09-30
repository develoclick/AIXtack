"use client";

import { ListChecks, Lock, MapPinned, Plus, Scale, Trash2, Users } from "lucide-react";
import { Campo, Grupo } from "@/components/prompts/campo-formulario";
import { Numero, Selector, Texto } from "@/components/plan/campos";
import { sumaPesos } from "@/lib/comparar/calculo";
import { MAX_CRITERIOS, MAX_OPCIONES, MIN_OPCIONES, TIPOS_COMPARACION, nuevoId, opcionVacia, type Criterio, type DatosComparar, type Opcion } from "@/lib/comparar/tipos";
import { almacenComparar } from "./almacen";

const MONEDAS = ["S/", "US$", "€", "MX$", "COP$", "CLP$", "ARS$"];

function EditorDeOpcion({ opcion, indice, alCambiar, alQuitar, sePuedeQuitar }: { opcion: Opcion; indice: number; alCambiar: (c: Partial<Opcion>) => void; alQuitar: () => void; sePuedeQuitar: boolean }) {
  return (
    <li className="rounded-lg border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Opción {indice + 1}</p>
        {sePuedeQuitar && (
          <button type="button" className="btn btn-texto -mr-2" onClick={alQuitar} aria-label={`Quitar la opción ${indice + 1}${opcion.nombre ? `: ${opcion.nombre}` : ""}`}>
            <Trash2 aria-hidden className="size-4" /> Quitar
          </button>
        )}
      </div>
      <div className="mt-3 grid gap-3">
        <Texto etiqueta="Nombre de la opción" valor={opcion.nombre} alCambiar={(v) => alCambiar({ nombre: v })} obligatorio placeholder="Ej.: Hotel Casa Andina Miraflores" />
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Numero etiqueta="Precio" valor={opcion.precio} alCambiar={(v) => alCambiar({ precio: v })} obligatorio placeholder="Ej.: 1850" />
          <Campo etiqueta="Moneda">
            {(id) => (
              <select id={id} className="campo" value={opcion.moneda} onChange={(e) => alCambiar({ moneda: e.target.value })}>
                {MONEDAS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>
        <Texto etiqueta="Qué incluye" valor={opcion.incluye} alCambiar={(v) => alCambiar({ incluye: v })} placeholder="Ej.: desayuno buffet, wifi, piscina" />
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Texto etiqueta="Extras conocidos (opcional)" valor={opcion.extrasConocidos} alCambiar={(v) => alCambiar({ extrasConocidos: v })} placeholder="Ej.: resort fee, equipaje de bodega, tasas" />
          <Numero etiqueta="Costo de esos extras" valor={opcion.costoExtra} alCambiar={(v) => alCambiar({ costoExtra: v })} placeholder="0" ayuda="Para el costo total ajustado." />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Texto etiqueta="Duración u horarios" valor={opcion.duracion} alCambiar={(v) => alCambiar({ duracion: v })} placeholder="Ej.: 4 noches, check-in 15:00" />
          <Numero etiqueta="Horas de trayecto" valor={opcion.horasTrayecto} alCambiar={(v) => alCambiar({ horasTrayecto: v })} placeholder="0" ayuda="Puerta a puerta." />
        </div>
        <Texto etiqueta="Ubicación" valor={opcion.ubicacion} alCambiar={(v) => alCambiar({ ubicacion: v })} placeholder="Ej.: Miraflores, a 5 min del malecón" />
        <Texto etiqueta="Condiciones de cancelación o cambio" valor={opcion.condiciones} alCambiar={(v) => alCambiar({ condiciones: v })} placeholder="Ej.: cancelación gratis hasta 48 horas antes" />
        <Texto etiqueta="Enlace (opcional)" valor={opcion.enlace} alCambiar={(v) => alCambiar({ enlace: v })} placeholder="https://…" />
      </div>
    </li>
  );
}

function EditorDeCriterio({ criterio, alCambiar, alQuitar, sePuedeQuitar }: { criterio: Criterio; alCambiar: (c: Partial<Criterio>) => void; alQuitar: () => void; sePuedeQuitar: boolean }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Texto etiqueta="Criterio" valor={criterio.nombre} alCambiar={(v) => alCambiar({ nombre: v })} placeholder="Ej.: Seguridad" />
      </div>
      <div className="w-24 shrink-0">
        <Numero etiqueta="Peso" valor={criterio.peso} alCambiar={(v) => alCambiar({ peso: v })} entero minimo={0} maximo={100} placeholder="0" />
      </div>
      {sePuedeQuitar && (
        <button type="button" className="btn btn-texto mb-0.5 shrink-0" onClick={alQuitar} aria-label={`Quitar el criterio ${criterio.nombre || ""}`}>
          <Trash2 aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

/** Matriz de puntuación (1 a 5): cada opción, en cada criterio. Es la base de la puntuación ponderada, calculada en el navegador. */
function MatrizPuntuacion({ d, alCambiar }: { d: DatosComparar; alCambiar: (opcionId: string, criterioId: string, v: string) => void }) {
  if (d.opciones.length < 2 || d.criterios.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-surface">
            <th scope="col" className="p-2 text-left font-semibold">
              Opción
            </th>
            {d.criterios.map((c) => (
              <th key={c.id} scope="col" className="p-2 text-center font-semibold">
                {c.nombre || "(sin nombre)"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.opciones.map((o) => (
            <tr key={o.id} className="border-b last:border-0">
              <th scope="row" className="p-2 text-left font-normal">
                {o.nombre || "(sin nombre)"}
              </th>
              {d.criterios.map((c) => {
                const id = `punt-${o.id}-${c.id}`;
                const valor = d.puntuaciones[o.id]?.[c.id] ?? "3";
                return (
                  <td key={c.id} className="p-1.5 text-center">
                    <select id={id} aria-label={`${o.nombre || "Opción"} — ${c.nombre}`} className="campo px-1 py-1 text-center" value={valor} onChange={(e) => alCambiar(o.id, c.id, e.target.value)}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormularioComparar({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenComparar.useDatos();
  const modoEjemplo = almacenComparar.useModoEjemplo();
  const poner = <K extends keyof DatosComparar>(clave: K, valor: DatosComparar[K]) => almacenComparar.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosComparar) => (v: string) => poner(clave, v as never);

  const cambiarOpcion = (id: string, c: Partial<Opcion>) => poner("opciones", d.opciones.map((o) => (o.id === id ? { ...o, ...c } : o)));
  const cambiarCriterio = (id: string, c: Partial<Criterio>) => poner("criterios", d.criterios.map((x) => (x.id === id ? { ...x, ...c } : x)));
  const cambiarPuntuacion = (opcionId: string, criterioId: string, v: string) => poner("puntuaciones", { ...d.puntuaciones, [opcionId]: { ...d.puntuaciones[opcionId], [criterioId]: v } });
  const suma = sumaPesos(d.criterios);

  function repartirEquitativo() {
    const n = d.criterios.length;
    if (!n) return;
    const base = Math.floor(100 / n);
    const resto = 100 - base * n;
    poner(
      "criterios",
      d.criterios.map((c, i) => ({ ...c, peso: String(base + (i < resto ? 1 : 0)) })),
    );
  }

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de tu comparación" autoComplete="off">
      <Grupo icono={ListChecks} titulo="Qué comparas" descripcion="El tipo elegido ajusta el lenguaje del prompt y de la guía.">
        <Selector etiqueta="Tipo de comparación" valor={d.tipo} opciones={TIPOS_COMPARACION.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta }))} alCambiar={(v) => poner("tipo", v)} obligatorio />
        <p className="text-xs text-muted-foreground">{TIPOS_COMPARACION.find((t) => t.valor === d.tipo)?.ayuda}</p>
      </Grupo>

      <Grupo icono={MapPinned} titulo={`Tus opciones (${MIN_OPCIONES} a ${MAX_OPCIONES})`} descripcion="Con datos objetivos: precio, qué incluye, duración, ubicación y condiciones. La página no busca precios por ti.">
        <ul className="space-y-3" data-opciones>
          {d.opciones.map((o, i) => (
            <EditorDeOpcion key={o.id} opcion={o} indice={i} alCambiar={(c) => cambiarOpcion(o.id, c)} alQuitar={() => poner("opciones", d.opciones.filter((x) => x.id !== o.id))} sePuedeQuitar={d.opciones.length > MIN_OPCIONES} />
          ))}
        </ul>
        <button type="button" className="btn btn-secundario" disabled={d.opciones.length >= MAX_OPCIONES} onClick={() => poner("opciones", [...d.opciones, opcionVacia(nuevoId("o"))])}>
          <Plus aria-hidden className="size-4" /> Agregar opción {d.opciones.length >= MAX_OPCIONES ? `(máximo ${MAX_OPCIONES})` : ""}
        </button>
      </Grupo>

      <Grupo icono={Users} titulo="Viajeros, fechas y tu tiempo" descripcion="El valor de tu tiempo convierte las horas de trayecto en un costo, para el costo total ajustado.">
        <Texto etiqueta="Viajeros" valor={d.viajeros} alCambiar={texto("viajeros")} placeholder="Ej.: 2 adultos" />
        <Texto etiqueta="Fechas" valor={d.fechas} alCambiar={texto("fechas")} placeholder="Ej.: 12 al 16 de noviembre de 2026" />
        <Numero etiqueta="Valor de una hora de tu tiempo (opcional)" valor={d.valorTiempo} alCambiar={texto("valorTiempo")} placeholder="Ej.: 20" ayuda="En la misma moneda de tus opciones. Déjalo vacío si no quieres convertir horas en costo." />
      </Grupo>

      <Grupo icono={Scale} titulo={`Criterios y pesos (${MAX_CRITERIOS} como máximo)`} descripcion="Reparte 100 puntos entre lo que más te importa. La matriz de abajo usa estos pesos.">
        <div className="space-y-2">
          {d.criterios.map((c) => (
            <EditorDeCriterio key={c.id} criterio={c} alCambiar={(v) => cambiarCriterio(c.id, v)} alQuitar={() => poner("criterios", d.criterios.filter((x) => x.id !== c.id))} sePuedeQuitar={d.criterios.length > 2} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-secundario" disabled={d.criterios.length >= MAX_CRITERIOS} onClick={() => poner("criterios", [...d.criterios, { id: nuevoId("c"), nombre: "", peso: "0", predefinido: false }])}>
            <Plus aria-hidden className="size-4" /> Agregar criterio propio
          </button>
          <button type="button" className="btn btn-texto" onClick={repartirEquitativo}>
            Repartir en partes iguales
          </button>
        </div>
        <p className={`text-sm font-medium tabular ${suma === 100 ? "text-ok" : "text-warn"}`} data-suma-pesos>
          Suma de pesos: {suma} de 100 {suma !== 100 && "(la página los ajusta en proporción al calcular)"}
        </p>

        <div className="pt-2">
          <p className="mb-2 text-sm font-semibold">Puntúa cada opción en cada criterio (1 a 5)</p>
          <MatrizPuntuacion d={d} alCambiar={cambiarPuntuacion} />
        </div>
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

