"use client";

import { AlertTriangle, Download } from "lucide-react";
import { csvClientesPorSegmento, segmentosChicos, type CeldaMatrizRF, type ClienteConRecencia, type SegmentoResumen } from "@/lib/segmentar-clientes/motor";
import type { DatosSegmentarClientes } from "@/lib/segmentar-clientes/tipos";
import { MatrizRF } from "./matriz-rf";

function descargarCsv(texto: string, nombre: string) {
  const blob = new Blob([texto], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  resumen: SegmentoResumen[];
  clientesSegmentados: (ClienteConRecencia & { segmentoNombre: string })[];
  matriz: CeldaMatrizRF[] | null;
  datos: DatosSegmentarClientes;
}

export function ResumenVivoSegmentos({ resumen, clientesSegmentados, matriz, datos }: Props) {
  const totalClientes = clientesSegmentados.length;
  const chicos = segmentosChicos(resumen, Number(datos.tamanoMinimoSegmento) || 0);

  return (
    <section aria-labelledby="titulo-resumen-segmentos" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-segmentos" className="text-lg font-semibold leading-tight">
        Tu segmentación <span className="font-normal text-muted-foreground">(se arma sola)</span>
      </h2>

      {totalClientes === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Sube tu archivo y mapea al menos el ID de cliente y la fecha de referencia: aquí aparece la tabla de segmentos, calculada en tu navegador.</p>
      ) : (
        <div className="aparecer mt-4 space-y-5" data-resumen>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{totalClientes} clientes</strong> identificados, en <strong className="text-foreground">{resumen.length} segmento(s)</strong>.
          </p>

          {chicos.length > 0 && (
            <p className="flex items-start gap-2 rounded-lg border border-warn/50 bg-warn-muted p-3 text-xs text-warn">
              <AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              Por debajo del tamaño mínimo ({datos.tamanoMinimoSegmento || 0}): {chicos.join(", ")}.
            </p>
          )}

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[36rem] text-left text-xs">
              <thead className="bg-surface">
                <tr>
                  {["Segmento", "Clientes", "% base", "% ingresos", "Recencia media", "Pedidos prom.", "Gasto medio"].map((h) => (
                    <th key={h} className="p-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {resumen.map((s) => (
                  <tr key={s.nombre}>
                    <td className="p-2 font-medium">{s.nombre}</td>
                    <td className="p-2 tabular">{s.cantidad}</td>
                    <td className="p-2 tabular">{s.pctBase}%</td>
                    <td className="p-2 tabular">{s.pctIngresos}%</td>
                    <td className="p-2 tabular">{s.recenciaMediaDias ?? "—"} días</td>
                    <td className="p-2 tabular">{s.frecuenciaMedia}</td>
                    <td className="p-2 tabular">S/ {s.gastoMedio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {matriz && (
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Matriz de recencia (R) × frecuencia (F): dónde se concentran tus clientes</p>
              <MatrizRF celdas={matriz} />
            </div>
          )}

          <button type="button" className="btn btn-secundario" onClick={() => descargarCsv(csvClientesPorSegmento(clientesSegmentados), "clientes-por-segmento.csv")}>
            <Download aria-hidden className="size-4" /> Descargar clientes por segmento (.csv)
          </button>
          <p className="text-xs text-muted-foreground">Este archivo se queda en tu computadora: nunca se envía a la IA ni a ningún servidor.</p>
        </div>
      )}
    </section>
  );
}
