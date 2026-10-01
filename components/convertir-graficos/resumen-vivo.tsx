"use client";

import { razonDelTipo, tipoSugerido } from "@/lib/convertir-graficos/asistente";
import { calcularParaTipo } from "@/lib/convertir-graficos/motor";
import { OBJETIVOS, TIPOS_GRAFICO, type DatosConvertirGraficos, type FichaDataset, type FilaTabla } from "@/lib/convertir-graficos/tipos";
import { GraficoGenerico } from "./grafico-generico";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): el gráfico local inmediato, calculado en tu navegador en cuanto pegas o subes tu tabla y eliges tus columnas, más una pequeña galería para comparar el mismo dato en otros tipos de gráfico. */
export function ResumenVivo({ ficha, filas, datos }: { ficha: FichaDataset | null; filas: FilaTabla[]; datos: DatosConvertirGraficos }) {
  const objetivo = OBJETIVOS.find((o) => o.valor === datos.objetivo)!;
  const tipo = tipoSugerido(datos.objetivo);
  const colX = ficha?.columnas.find((c) => c.indice === datos.seleccion.x) ?? null;
  const colY = ficha?.columnas.find((c) => c.indice === datos.seleccion.y) ?? null;
  const listo = Boolean(colX && (colY || datos.agregacion === "conteo" || tipo === "histograma") && filas.length > 0);
  const unidad = datos.unidad.trim();
  const formato = (n: number) => (unidad ? `${unidad} ${n.toLocaleString("es-PE")}` : n.toLocaleString("es-PE"));

  const datosGrafico = listo ? calcularParaTipo(filas, tipo, colX!.nombre, colY?.nombre ?? "", null, datos.agregacion) : null;
  const GALERIA: (typeof TIPOS_GRAFICO)[number]["valor"][] = tipo === "barras" ? ["barras", "pastel", "tabla"] : tipo === "lineas" ? ["lineas", "areas", "tabla"] : [];

  return (
    <section aria-labelledby="titulo-resumen-graficos" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-graficos" className="text-lg font-semibold leading-tight">
        Tu gráfico <span className="font-normal text-muted-foreground">(se arma solo)</span>
      </h2>

      {!listo ? (
        <p className="mt-3 text-sm text-muted-foreground">Pega o sube tu tabla y elige las columnas del gráfico: aquí aparece de inmediato, calculado en tu navegador.</p>
      ) : (
        <div className="aparecer mt-4 space-y-5" data-resumen>
          <div className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Objetivo: {objetivo.etiqueta}.</strong> Esta página sugiere <strong className="text-foreground">{TIPOS_GRAFICO.find((t) => t.valor === tipo)!.etiqueta.toLowerCase()}</strong>: {razonDelTipo(tipo)}
            </p>
          </div>

          <GraficoGenerico titulo={`${colY ? `${colY.nombre} por ${colX!.nombre}` : `Conteo por ${colX!.nombre}`}`} tipo={tipo} etiquetas={datosGrafico!.etiquetas} series={datosGrafico!.series} puntos={datosGrafico!.puntos} formatoValor={formato} />

          {GALERIA.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Compara el mismo dato en otro tipo de gráfico</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {GALERIA.filter((t) => t !== tipo).map((t) => {
                  const dg = calcularParaTipo(filas, t, colX!.nombre, colY?.nombre ?? "", null, datos.agregacion);
                  return <GraficoGenerico key={t} titulo={TIPOS_GRAFICO.find((x) => x.valor === t)!.etiqueta} tipo={t} etiquetas={dg.etiquetas} series={dg.series} puntos={dg.puntos} formatoValor={formato} />;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
