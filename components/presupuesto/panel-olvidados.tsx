"use client";

import { AlertTriangle, Info, Plus, SearchCheck } from "lucide-react";
import { calcular } from "@/lib/presupuesto/calculo";
import { gastosQueFaltan, lineaDeGasto, revisarCoherencia, type GastoOlvidado } from "@/lib/presupuesto/olvidados";
import { categoriaPorId, nuevoIdLinea, type DatosPresupuesto, type Linea } from "@/lib/presupuesto/tipos";

const VISIBLES = 5;
const ETIQUETA_NIVEL = { alto: "Corrige", medio: "Revisa", bajo: "Mejora" } as const;

interface Props {
  datos: DatosPresupuesto;
  alAgregar: (lineas: Linea[], mensaje: string) => void;
  alDescartar: (ids: string[]) => void;
}

/** Detector de «gastos olvidados» y revisión local de coherencia (sin IA): sugiere líneas vacías, nunca precios. */
export function PanelOlvidados({ datos, alAgregar, alDescartar }: Props) {
  const c = calcular(datos);
  const faltan = gastosQueFaltan(datos);
  const avisos = revisarCoherencia(datos, c);
  const nueva = (g: GastoOlvidado) => lineaDeGasto(g, nuevoIdLinea());

  const item = (g: GastoOlvidado) => (
    <li key={g.id} className="rounded-lg border bg-surface p-3 text-sm">
      <p className="font-semibold">
        {g.concepto} <span className="ml-1 font-normal text-muted-foreground">· {categoriaPorId(g.categoria).nombre}</span>
      </p>
      <p className="mt-1 text-muted-foreground">{g.porQue}</p>
      <p className="mt-1 text-muted-foreground">
        <strong className="font-semibold text-foreground">Dónde consultar el precio:</strong> {g.dondeConsultar}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn btn-secundario" onClick={() => alAgregar([nueva(g)], `Agregué «${g.concepto}» a tu tabla. Escribe su monto en el paso 1.`)} aria-label={`Añadir a mi tabla: ${g.concepto}`}>
          <Plus aria-hidden className="size-4" /> Añadir a mi tabla
        </button>
        <button type="button" className="btn btn-texto" onClick={() => alDescartar([g.id])} aria-label={`No aplica a mi viaje: ${g.concepto}`}>
          No aplica
        </button>
      </div>
    </li>
  );

  return (
    <section aria-labelledby="titulo-olvidados" className="tarjeta p-5 sm:p-6">
      <h3 id="titulo-olvidados" className="flex items-center gap-2 text-lg font-semibold leading-tight">
        <SearchCheck aria-hidden className="size-5 text-brand" /> Gastos que quizá olvidaste
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Compara tu tabla con una lista de gastos habituales. No ponemos precios: te decimos dónde consultarlos.</p>

      {faltan.length > 0 ? (
        <>
          <ul className="mt-4 space-y-3" data-olvidados>
            {faltan.slice(0, VISIBLES).map(item)}
          </ul>
          {faltan.length > VISIBLES && (
            <details className="mt-3">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">Ver los {faltan.length - VISIBLES} gastos restantes</summary>
              <ul className="mt-3 space-y-3" data-olvidados-resto>
                {faltan.slice(VISIBLES).map(item)}
              </ul>
            </details>
          )}
          {faltan.length > 1 && (
            <button type="button" className="btn btn-secundario mt-3" onClick={() => alAgregar(faltan.map(nueva), `Agregué ${faltan.length} gastos a tu tabla. Escribe sus montos en el paso 1.`)}>
              <Plus aria-hidden className="size-4" /> Añadir los {faltan.length} a mi tabla
            </button>
          )}
        </>
      ) : (
        <p className="mt-4 flex gap-2 rounded-lg border bg-surface p-3 text-sm text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" /> No detecté gastos habituales que falten en tu tabla. Aun así, piensa en lo que sea particular de tu viaje.
        </p>
      )}

      <h3 className="mt-6 flex items-center gap-2 text-lg font-semibold leading-tight">
        <AlertTriangle aria-hidden className="size-5 text-warn" /> Revisión de coherencia
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Comprobaciones hechas en tu navegador con reglas fijas (unidades mal aplicadas, duplicados, datos que faltan).</p>
      {avisos.length > 0 ? (
        <ul className="mt-3 space-y-2" data-coherencia>
          {avisos.map((a) => (
            <li key={a.id} className="flex gap-2 rounded-lg border p-3 text-sm">
              <span className={`mt-0.5 h-fit shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${a.nivel === "alto" ? "bg-destructive/15 text-destructive" : a.nivel === "medio" ? "bg-warn-muted text-warn" : "bg-brand-muted text-brand"}`}>{ETIQUETA_NIVEL[a.nivel]}</span>
              <span>{a.texto}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border bg-surface p-3 text-sm text-muted-foreground">No encontré incoherencias con las reglas de esta página. Revisa igualmente cada monto.</p>
      )}
    </section>
  );
}
