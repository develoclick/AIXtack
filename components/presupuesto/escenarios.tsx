"use client";

import { useState } from "react";
import { Check, ClipboardCopy, Download, Printer } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { calcular, ESCENARIOS, formatoDinero, formatoMonto, type Escenario } from "@/lib/presupuesto/calculo";
import { aCsv, aTabla } from "@/lib/presupuesto/exportar";
import { CATEGORIAS_GASTO, categoriaPorId, type DatosPresupuesto } from "@/lib/presupuesto/tipos";

/** Colores de las categorías del gráfico. Cada tramo también aparece en una tabla de datos, así que el color no es lo único que informa. */
const COLORES = ["#0f766e", "#2563eb", "#7c3aed", "#c026d3", "#db2777", "#ea580c", "#ca8a04", "#65a30d", "#16a34a", "#0891b2", "#4f46e5", "#9333ea", "#64748b", "#b45309"];
const colorDe = (id: string) => COLORES[CATEGORIAS_GASTO.findIndex((c) => c.id === id) % COLORES.length];
const RAYAS = "repeating-linear-gradient(45deg, var(--foreground-2) 0 3px, transparent 3px 6px)";

interface Props {
  datos: DatosPresupuesto;
  esEjemplo: boolean;
  alExportar: (tipo: "csv" | "tabla" | "imprimir") => void;
  alAviso: (texto: string) => void;
}

export function Escenarios({ datos, esEjemplo, alExportar, alAviso }: Props) {
  const c = calcular(datos);
  const moneda = datos.moneda.trim() || "S/";
  const [copiado, setCopiado] = useState(false);
  const hayDatos = c.escenarios.intermedio.total > 0;
  const maximo = Math.max(...ESCENARIOS.map((e) => c.escenarios[e.clave].total), 1);
  const categoriasUsadas = CATEGORIAS_GASTO.filter((cat) => ESCENARIOS.some((e) => c.escenarios[e.clave].porCategoria.some((p) => p.categoria === cat.id)));

  function descargarCsv() {
    const blob = new Blob([aCsv(datos)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = esEjemplo ? "presupuesto-de-viaje-EJEMPLO.csv" : "presupuesto-de-viaje.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    alExportar("csv");
    alAviso(esEjemplo ? "Descargado: presupuesto-de-viaje-EJEMPLO.csv (datos de ejemplo)" : "CSV descargado. Ábrelo con Excel o Google Sheets.");
  }

  async function copiarTabla() {
    if (await copiarTexto(aTabla(datos))) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
      alExportar("tabla");
      alAviso("Tabla copiada. Pégala en una hoja de Excel o Google Sheets.");
    }
  }

  function imprimir() {
    document.body.classList.add("imprimiendo-presupuesto");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-presupuesto");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  return (
    <section aria-labelledby="titulo-escenarios" className="tarjeta p-5 sm:p-6">
      <h3 id="titulo-escenarios" className="text-lg font-semibold leading-tight">
        Tres escenarios
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Usa los rangos (mínimo y máximo) que pusiste en cada gasto. Sin rango, el gasto vale lo mismo en los tres.</p>

      {hayDatos ? (
        <>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {ESCENARIOS.map((e) => {
              const t = c.escenarios[e.clave as Escenario];
              return (
                <li key={e.clave} className={`rounded-lg border p-3 ${e.clave === "intermedio" ? "border-brand-solid bg-brand-muted" : "bg-surface"}`} data-escenario={e.clave}>
                  <p className="text-sm font-semibold">{e.etiqueta}</p>
                  <p className="mt-1 text-xl font-bold tabular">{formatoDinero(t.total, moneda)}</p>
                  <p className="text-xs text-muted-foreground tabular">{t.porPersona !== null ? `${formatoDinero(t.porPersona, moneda)} por persona` : "sin costo por persona"}</p>
                  <p className="mt-2 text-xs leading-snug text-muted-foreground">{e.regla}</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-6">
            <p className="text-sm font-semibold">Gasto por categoría en cada escenario</p>
            <div role="img" aria-label="Barras apiladas por categoría para los tres escenarios. Los valores exactos están en la tabla de datos que sigue." className="mt-3 space-y-3">
              {ESCENARIOS.map((e) => {
                const t = c.escenarios[e.clave];
                return (
                  <div key={e.clave} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 text-xs sm:grid-cols-[5.5rem_minmax(0,1fr)]">
                    <span className="font-medium">{e.etiqueta}</span>
                    <div className="flex h-6 overflow-hidden rounded bg-surface" style={{ width: `${(t.total / maximo) * 100}%`, minWidth: "2rem" }}>
                      {t.porCategoria.map((p) => (
                        <div key={p.categoria} title={`${categoriaPorId(p.categoria).nombre}: ${formatoDinero(p.total, moneda)}`} style={{ width: `${(p.total / t.total) * 100}%`, background: colorDe(p.categoria) }} className="h-full border-r border-background" />
                      ))}
                      {t.imprevistos > 0 && <div title={`Imprevistos: ${formatoDinero(t.imprevistos, moneda)}`} style={{ width: `${(t.imprevistos / t.total) * 100}%`, background: RAYAS }} className="h-full border-l border-muted-foreground" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {categoriasUsadas.map((cat) => (
                <li key={cat.id} className="flex items-center gap-1.5">
                  <span aria-hidden className="size-2.5 rounded-sm" style={{ background: colorDe(cat.id) }} />
                  {cat.nombre}
                </li>
              ))}
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-sm border border-muted-foreground" style={{ background: RAYAS }} />
                Imprevistos
              </li>
            </ul>

            <details className="mt-3 rounded-lg border bg-surface p-3 text-sm">
              <summary className="flex min-h-11 cursor-pointer items-center font-semibold">Ver los datos del gráfico (tabla)</summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[26rem] text-left text-xs tabular">
                  <caption className="sr-only">Gasto por categoría en cada escenario, en {moneda}</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="py-2 pr-3">Categoría</th>
                      {ESCENARIOS.map((e) => (
                        <th key={e.clave} scope="col" className="py-2 pr-3 text-right">{e.etiqueta}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {categoriasUsadas.map((cat) => (
                      <tr key={cat.id}>
                        <th scope="row" className="py-1.5 pr-3 font-normal">{cat.nombre}</th>
                        {ESCENARIOS.map((e) => (
                          <td key={e.clave} className="py-1.5 pr-3 text-right">{formatoMonto(c.escenarios[e.clave].porCategoria.find((p) => p.categoria === cat.id)?.total ?? 0)}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <th scope="row" className="py-1.5 pr-3 font-normal">Imprevistos ({c.pctImprevistos} %)</th>
                      {ESCENARIOS.map((e) => (
                        <td key={e.clave} className="py-1.5 pr-3 text-right">{formatoMonto(c.escenarios[e.clave].imprevistos)}</td>
                      ))}
                    </tr>
                    <tr className="font-semibold">
                      <th scope="row" className="py-1.5 pr-3">Total</th>
                      {ESCENARIOS.map((e) => (
                        <td key={e.clave} className="py-1.5 pr-3 text-right">{formatoMonto(c.escenarios[e.clave].total)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </div>

          <details className="mt-4 rounded-lg border bg-surface p-3 text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold">Ver las fórmulas que usa la página</summary>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Cada gasto</strong> = monto × multiplicador. Por viaje: × 1. Por noche: × noches ({c.noches ?? "—"}). Por persona: × viajeros ({c.personas ?? "—"}). Por persona y día: × viajeros × días ({c.dias ?? "—"}).
              </li>
              <li>
                <strong className="text-foreground">Subtotal</strong> = suma de todos los gastos con monto. <strong className="text-foreground">Imprevistos</strong> = subtotal × {c.pctImprevistos} ÷ 100. <strong className="text-foreground">Total</strong> = subtotal + imprevistos.
              </li>
              <li>
                <strong className="text-foreground">Por persona</strong> = total ÷ viajeros. <strong className="text-foreground">Conocido, estimado y opcional</strong> = suma de cada tipo ÷ total.
              </li>
              <li>
                <strong className="text-foreground">Moneda alterna</strong> = monto × tipo de cambio que escribiste (1 {datos.monedaAlterna.trim() || "alterna"} = {c.tipoCambio ?? "—"} {moneda}).
              </li>
            </ul>
          </details>
        </>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Cuando escribas los montos, aquí verás los tres escenarios y el gráfico por categoría.</p>
      )}

      <div className="mt-5 border-t pt-4">
        <p className="text-sm font-semibold">Llévate tu presupuesto</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-secundario" onClick={descargarCsv} disabled={!hayDatos}>
            <Download aria-hidden className="size-4" /> Descargar CSV (Excel)
          </button>
          <button type="button" className="btn btn-secundario" onClick={copiarTabla} disabled={!hayDatos}>
            {copiado ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
            {copiado ? "Tabla copiada" : "Copiar como tabla"}
          </button>
          <button type="button" className="btn btn-secundario" onClick={imprimir} disabled={!hayDatos}>
            <Printer aria-hidden className="size-4" /> Imprimir o guardar en PDF
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">El CSV se abre con Excel, Numbers y Google Sheets. «Copiar como tabla» se pega directo en una hoja de cálculo.</p>
      </div>
    </section>
  );
}
