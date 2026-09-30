"use client";

import { useState } from "react";
import { Check, Minus, Plus, Trash2, X } from "lucide-react";
import { Campo } from "@/components/prompts/campo-formulario";
import { almacenRegistroNichos } from "./almacen";
import { entradaVacia, resumenDeValidacion, TIPOS_VALIDACION, type EntradaValidacion } from "@/lib/nichos/registro";
import { nuevoId } from "@/lib/nichos/tipos";
import type { Nicho } from "@/lib/nichos/tipos";

function CumpleCriterio({ valor, alCambiar }: { valor: boolean | null; alCambiar: (v: boolean | null) => void }) {
  return (
    <div className="flex gap-1.5" role="group" aria-label="¿Cumplió el criterio de éxito?">
      <button type="button" onClick={() => alCambiar(valor === true ? null : true)} aria-pressed={valor === true} className={`btn text-xs ${valor === true ? "btn-primario" : "btn-secundario"}`}>
        <Check aria-hidden className="size-3.5" /> Cumplió
      </button>
      <button type="button" onClick={() => alCambiar(valor === false ? null : false)} aria-pressed={valor === false} className={`btn text-xs ${valor === false ? "btn-primario" : "btn-secundario"}`}>
        <X aria-hidden className="size-3.5" /> No cumplió
      </button>
    </div>
  );
}

export function RegistroValidacion({ favoritos }: { favoritos: Nicho[] }) {
  const registro = almacenRegistroNichos.useDatos();
  const [borrador, setBorrador] = useState<EntradaValidacion>(entradaVacia("nuevo"));
  const resumen = resumenDeValidacion(registro.items);

  function agregar() {
    if (!borrador.nichoNombre.trim() || !borrador.resultado.trim()) return;
    almacenRegistroNichos.guardar({ items: [{ ...borrador, id: nuevoId("v") }, ...registro.items] });
    setBorrador(entradaVacia("nuevo"));
  }

  function cambiar(id: string, cambios: Partial<EntradaValidacion>) {
    almacenRegistroNichos.guardar({ items: registro.items.map((it) => (it.id === id ? { ...it, ...cambios } : it)) });
  }

  function quitar(id: string) {
    almacenRegistroNichos.guardar({ items: registro.items.filter((it) => it.id !== id) });
  }

  return (
    <section aria-labelledby="titulo-registro-validacion" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-registro-validacion" className="text-lg font-semibold leading-tight">
        Registro de validación
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Anota cada entrevista, búsqueda, preventa o mini campaña que hagas, y si cumplió el criterio de éxito que definiste antes de empezar. Se guarda solo en tu navegador.</p>

      {resumen.total > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg border bg-surface p-2">
            <p className="text-xs text-muted-foreground">Cumplieron</p>
            <p className="font-semibold text-ok">{resumen.cumple}</p>
          </div>
          <div className="rounded-lg border bg-surface p-2">
            <p className="text-xs text-muted-foreground">No cumplieron</p>
            <p className="font-semibold text-destructive">{resumen.noCumple}</p>
          </div>
          <div className="rounded-lg border bg-surface p-2">
            <p className="text-xs text-muted-foreground">Sin evaluar</p>
            <p className="font-semibold">{resumen.sinEvaluar}</p>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 rounded-lg border bg-surface p-3 sm:grid-cols-2">
        <Campo etiqueta="Nicho">
          {(id) =>
            favoritos.length > 0 ? (
              <select id={id} className="campo" value={borrador.nichoNombre} onChange={(e) => setBorrador({ ...borrador, nichoNombre: e.target.value })}>
                <option value="">Selecciona…</option>
                {favoritos.map((f) => (
                  <option key={f.id} value={f.nombre}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <input id={id} className="campo" value={borrador.nichoNombre} onChange={(e) => setBorrador({ ...borrador, nichoNombre: e.target.value })} placeholder="Nombre del nicho" />
            )
          }
        </Campo>
        <Campo etiqueta="Tipo">
          {(id) => (
            <select id={id} className="campo" value={borrador.tipo} onChange={(e) => setBorrador({ ...borrador, tipo: e.target.value as EntradaValidacion["tipo"] })}>
              {TIPOS_VALIDACION.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <Campo etiqueta="Fecha (opcional)">{(id) => <input id={id} type="date" className="campo" value={borrador.fecha} onChange={(e) => setBorrador({ ...borrador, fecha: e.target.value })} />}</Campo>
        <Campo etiqueta="Resultado">{(id) => <input id={id} className="campo" value={borrador.resultado} onChange={(e) => setBorrador({ ...borrador, resultado: e.target.value })} placeholder="Ej.: dejó su contacto pidiendo precio" />}</Campo>
        <div className="sm:col-span-2">
          <CumpleCriterio valor={borrador.cumpleCriterio} alCambiar={(v) => setBorrador({ ...borrador, cumpleCriterio: v })} />
        </div>
        <button type="button" className="btn btn-secundario sm:col-span-2" onClick={agregar} disabled={!borrador.nichoNombre.trim() || !borrador.resultado.trim()}>
          <Plus aria-hidden className="size-4" /> Agregar al registro
        </button>
      </div>

      {registro.items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {registro.items.map((it) => (
            <li key={it.id} className="tarjeta flex items-start justify-between gap-3 p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {it.nichoNombre || "(sin nicho)"} <span className="font-normal text-muted-foreground">· {TIPOS_VALIDACION.find((t) => t.valor === it.tipo)!.etiqueta}{it.fecha ? ` · ${it.fecha}` : ""}</span>
                </p>
                <p className="mt-1 break-words text-muted-foreground">{it.resultado}</p>
                <div className="mt-2">
                  <CumpleCriterio valor={it.cumpleCriterio} alCambiar={(v) => cambiar(it.id, { cumpleCriterio: v })} />
                </div>
              </div>
              <button type="button" className="btn btn-texto shrink-0" onClick={() => quitar(it.id)} aria-label={`Quitar la entrada de «${it.nichoNombre}»`}>
                <Trash2 aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Minus aria-hidden className="size-4" /> Todavía no registraste ninguna validación.
        </p>
      )}
    </section>
  );
}
