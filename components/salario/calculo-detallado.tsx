"use client";

import { useState } from "react";
import { Check, ClipboardCopy, Download, Info } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { formatoDinero, formatoMonto, formatoPorcentaje } from "@/lib/presupuesto/calculo";
import { calcularOferta, CIFRAS, compararOfertas, contextoDe, evaluarCifras, type CalculoOferta } from "@/lib/salario/calculo";
import { aCsv, aTabla } from "@/lib/salario/exportar";
import type { DatosSalario, Oferta } from "@/lib/salario/tipos";

interface Props {
  datos: DatosSalario;
  esEjemplo: boolean;
  alExportar: (tipo: "csv" | "tabla") => void;
  alAviso: (texto: string) => void;
}

function TablaDeFormulas({ titulo, c, moneda }: { titulo: string; c: CalculoOferta; moneda: string }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{titulo}</h4>
      {c.filas.length ? (
        <div className="mt-2 overflow-x-auto rounded-lg border" role="region" aria-label={`Fórmulas de ${titulo}`} tabIndex={0}>
          <table className="w-full min-w-[30rem] text-left text-sm" data-formulas>
            <caption className="sr-only">Componentes del valor anual de {titulo}, con su fórmula y su valor</caption>
            <thead className="bg-surface">
              <tr>
                <th scope="col" className="p-2.5 font-semibold">Componente</th>
                <th scope="col" className="p-2.5 font-semibold">Fórmula</th>
                <th scope="col" className="p-2.5 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {c.filas.map((f) => (
                <tr key={f.clave} className={f.clave.startsWith("despues") ? "bg-brand-muted/50 font-semibold" : ""}>
                  <th scope="row" className="p-2.5 text-left font-medium">{f.etiqueta}</th>
                  <td className="p-2.5 tabular text-muted-foreground">{f.formula}</td>
                  <td className="p-2.5 text-right tabular">{formatoDinero(f.valor, moneda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Faltan datos para calcular. {c.problemas[0]}</p>
      )}
      {c.beneficiosNoMonetarios.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Beneficios no monetarios (no suman): {c.beneficiosNoMonetarios.join(", ")}.</p>}
      {c.netoFijoEstimado !== null && (
        <p className="mt-2 text-xs text-muted-foreground">
          Neto mensual aproximado del fijo con tu estimación de descuentos: <strong className="font-semibold text-foreground tabular">{formatoDinero(c.netoFijoEstimado, moneda)}</strong>. Es tu estimación, no un cálculo de impuestos.
        </p>
      )}
    </div>
  );
}

const DATOS_DE_CONDICIONES: { clave: keyof Oferta; etiqueta: string }[] = [
  { clave: "contrato", etiqueta: "Tipo de contrato" },
  { clave: "jornada", etiqueta: "Jornada" },
  { clave: "vacaciones", etiqueta: "Vacaciones" },
  { clave: "prueba", etiqueta: "Período de prueba" },
  { clave: "diasPresencial", etiqueta: "Días presenciales por semana" },
];

/** Paso 2: las fórmulas de cada oferta a la vista, el comparador de 2 ofertas y tus 3 cifras frente a la oferta y a tus referencias. */
export function CalculoDetallado({ datos, esEjemplo, alExportar, alAviso }: Props) {
  const moneda = datos.moneda.trim() || "S/";
  const ctx = contextoDe(datos);
  const a = calcularOferta(datos.ofertaA, ctx);
  const b = datos.comparar ? calcularOferta(datos.ofertaB, ctx) : null;
  const filas = b ? compararOfertas(a, b) : [];
  const ev = evaluarCifras(datos, a);
  const [copiado, setCopiado] = useState(false);
  const hayDatos = a.valido;

  function descargarCsv() {
    const blob = new Blob([aCsv(datos)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = esEjemplo ? "valor-anual-oferta-EJEMPLO.csv" : "valor-anual-oferta.csv";
    document.body.appendChild(el);
    el.click();
    el.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    alExportar("csv");
    alAviso(esEjemplo ? "Descargado: valor-anual-oferta-EJEMPLO.csv (datos de ejemplo)" : "CSV descargado. Ábrelo con Excel o Google Sheets.");
  }

  async function copiarTabla() {
    if (await copiarTexto(aTabla(datos))) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
      alExportar("tabla");
      alAviso("Tabla copiada. Pégala en una hoja de Excel o Google Sheets.");
    }
  }

  return (
    <section aria-labelledby="titulo-calculo" className="tarjeta p-5 sm:p-6">
      <h3 id="titulo-calculo" className="text-lg font-semibold leading-tight">
        Cómo se calculó el valor anual
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Cada número tiene su fórmula. Cámbialos en el paso 1 y todo se actualiza.</p>

      <div className="mt-4 space-y-5">
        <TablaDeFormulas titulo={datos.comparar ? datos.ofertaA.nombre.trim() || "Oferta A" : "La oferta"} c={a} moneda={moneda} />
        {b && <TablaDeFormulas titulo={datos.ofertaB.nombre.trim() || "Oferta B"} c={b} moneda={moneda} />}
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border bg-surface p-3 text-sm">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
        <p className="leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">Bruto no es neto.</strong> Lo que llega a tu cuenta depende de los impuestos y aportes de tu país y de tu régimen laboral. Esta herramienta no los calcula: verifícalos en las fuentes oficiales de tu país (ver la guía).
        </p>
      </div>

      {b && (
        <div className="mt-6" data-comparador>
          <h3 className="text-lg font-semibold leading-tight">Comparador de las dos ofertas</h3>
          {filas.length ? (
            <>
              <div className="mt-3 overflow-x-auto rounded-lg border" role="region" aria-label="Tabla de diferencias entre las dos ofertas" tabIndex={0}>
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <caption className="sr-only">Diferencias entre la oferta A y la oferta B, en {moneda}</caption>
                  <thead className="bg-surface">
                    <tr>
                      <th scope="col" className="p-2.5 font-semibold">Componente</th>
                      <th scope="col" className="p-2.5 text-right font-semibold">A</th>
                      <th scope="col" className="p-2.5 text-right font-semibold">B</th>
                      <th scope="col" className="p-2.5 text-right font-semibold">B − A</th>
                      <th scope="col" className="p-2.5 font-semibold">Conviene</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filas.map((f) => (
                      <tr key={f.clave}>
                        <th scope="row" className="p-2.5 text-left font-medium">{f.etiqueta}</th>
                        <td className="p-2.5 text-right tabular">{formatoMonto(f.a)}</td>
                        <td className="p-2.5 text-right tabular">{formatoMonto(f.b)}</td>
                        <td className="p-2.5 text-right tabular">
                          {f.diferencia >= 0 ? "+" : "−"}
                          {formatoMonto(Math.abs(f.diferencia))}
                          {f.porcentaje !== null && <span className="text-muted-foreground"> ({f.porcentaje >= 0 ? "+" : "−"}{Math.abs(f.porcentaje)} %)</span>}
                        </td>
                        <td className="p-2.5">{f.mejor === "igual" ? "Igual" : f.mejor === "a" ? "A" : "B"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 overflow-x-auto rounded-lg border" role="region" aria-label="Condiciones de las dos ofertas" tabIndex={0}>
                <table className="w-full min-w-[26rem] text-left text-sm">
                  <caption className="sr-only">Condiciones no monetarias de cada oferta</caption>
                  <thead className="bg-surface">
                    <tr>
                      <th scope="col" className="p-2.5 font-semibold">Condición</th>
                      <th scope="col" className="p-2.5 font-semibold">A</th>
                      <th scope="col" className="p-2.5 font-semibold">B</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {DATOS_DE_CONDICIONES.map((c) => (
                      <tr key={c.clave}>
                        <th scope="row" className="p-2.5 text-left font-medium">{c.etiqueta}</th>
                        <td className="p-2.5 text-muted-foreground">{String(datos.ofertaA[c.clave] || "(no indicado)")}</td>
                        <td className="p-2.5 text-muted-foreground">{String(datos.ofertaB[c.clave] || "(no indicado)")}</td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row" className="p-2.5 text-left font-medium">Beneficios no monetarios</th>
                      <td className="p-2.5 text-muted-foreground">{a.beneficiosNoMonetarios.join(", ") || "(ninguno)"}</td>
                      <td className="p-2.5 text-muted-foreground">{b.beneficiosNoMonetarios.join(", ") || "(ninguno)"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">El dinero no lo es todo: revisa la diferencia frente a tus prioridades (dinero, remoto, aprendizaje, estabilidad y horario).</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Completa el salario fijo, los pagos y los días presenciales de las dos ofertas para compararlas.</p>
          )}
        </div>
      )}

      <div className="mt-6" data-cifras>
        <h3 className="text-lg font-semibold leading-tight">Tus 3 cifras frente a la oferta y a tus referencias</h3>
        {ev.vsOferta.length > 0 ? (
          <div className="mt-3 overflow-x-auto rounded-lg border" role="region" aria-label="Tus cifras frente a la oferta" tabIndex={0}>
            <table className="w-full min-w-[30rem] text-left text-sm">
              <caption className="sr-only">Tus tres cifras, su diferencia con el fijo de la oferta y el efecto anual</caption>
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="p-2.5 font-semibold">Cifra</th>
                  <th scope="col" className="p-2.5 text-right font-semibold">Monto mensual</th>
                  <th scope="col" className="p-2.5 text-right font-semibold">Frente a la oferta</th>
                  <th scope="col" className="p-2.5 text-right font-semibold">Por año</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ev.vsOferta.map((v) => (
                  <tr key={v.clave}>
                    <th scope="row" className="p-2.5 text-left font-medium">{CIFRAS.find((c) => c.clave === v.clave)!.etiqueta}</th>
                    <td className="p-2.5 text-right tabular">{formatoMonto(v.valor)}</td>
                    <td className="p-2.5 text-right tabular">
                      {v.diferencia >= 0 ? "+" : "−"}
                      {formatoMonto(Math.abs(v.diferencia))} ({v.porcentaje >= 0 ? "+" : "−"}
                      {formatoPorcentaje(Math.abs(v.porcentaje))})
                    </td>
                    <td className="p-2.5 text-right tabular">{v.impactoAnual === null ? "—" : `${v.impactoAnual >= 0 ? "+" : "−"}${formatoMonto(Math.abs(v.impactoAnual))}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Escribe tus tres cifras (y el fijo de la oferta) para ver cuánto cambian tu salario cada mes y cada año.</p>
        )}
        {ev.problemas.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm font-medium text-destructive">
            {ev.problemas.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
        {ev.referencias.completas > 0 ? (
          <div className="mt-3 rounded-lg border bg-surface p-3 text-sm" data-referencias-resumen>
            <p className="font-semibold">Tus referencias ({ev.referencias.completas} completas)</p>
            <p className="mt-1 text-muted-foreground tabular">
              Más baja: {formatoDinero(ev.referencias.minima!, moneda)} · mediana: {formatoDinero(ev.referencias.mediana!, moneda)} · más alta: {formatoDinero(ev.referencias.maxima!, moneda)}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              {ev.posiciones.map((p) => (
                <li key={p.clave}>{p.texto}</li>
              ))}
            </ul>
            {ev.referencias.completas < 3 && <p className="mt-2 text-xs text-muted-foreground">Con {ev.referencias.completas === 1 ? "una sola referencia" : `solo ${ev.referencias.completas} referencias`} el rango es poco confiable: busca más, con fuente y fecha.</p>}
            {ev.referencias.incompletas > 0 && <p className="mt-1 text-xs text-warn">{ev.referencias.incompletas} referencia(s) incompleta(s) no cuentan.</p>}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm" data-sin-referencias>
            <p className="font-semibold">Todavía no tienes referencias salariales con fuente y fecha</p>
            <p className="mt-1">Sin ellas no hay con qué comparar tus cifras, y esta herramienta no las inventa. Busca al menos dos: avisos públicos de puestos parecidos, portales de empleo, informes salariales publicados o conversaciones con personas del rubro. Anota de dónde salieron y cuándo las consultaste.</p>
          </div>
        )}
      </div>

      <div className="mt-6 border-t pt-4">
        <p className="text-sm font-semibold">Llévate los cálculos</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-secundario" onClick={descargarCsv} disabled={!hayDatos}>
            <Download aria-hidden className="size-4" /> Descargar CSV (Excel)
          </button>
          <button type="button" className="btn btn-secundario" onClick={copiarTabla} disabled={!hayDatos}>
            {copiado ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
            {copiado ? "Tabla copiada" : "Copiar como tabla"}
          </button>
        </div>
      </div>
    </section>
  );
}
