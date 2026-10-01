import { formatoMonto } from "@/lib/presupuesto/calculo";
import { TITULOS_RESPUESTA, type LecturaAnalisisVentas } from "@/lib/analizar-ventas/lector";
import type { ResumenAnalisis } from "@/lib/analizar-ventas/calculo";
import type { DatosAnalisisVentas } from "@/lib/analizar-ventas/tipos";

/**
 * Informe listo para imprimir o guardar en PDF (desde el diálogo de impresión del navegador). En pantalla está oculto;
 * al pulsar «Descargar informe en PDF» se muestra solo esta parte (ver la regla @media print de globals.css).
 */
export function ResumenImprimible({ datos, resumen, lectura, esEjemplo }: { datos: DatosAnalisisVentas; resumen: ResumenAnalisis | null; lectura: LecturaAnalisisVentas | null; esEjemplo: boolean }) {
  if (!lectura?.valido || !resumen) return null;
  const m = datos.moneda.trim() || "S/";
  const monto = (n: number) => `${m} ${formatoMonto(n)}`;

  return (
    <div id="ventas-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>Análisis de ventas</p>
      <p style={{ fontSize: "10pt" }}>
        Archivo: {datos.nombreArchivo || "(sin nombre)"} · Período: {datos.periodoDesde || "?"} a {datos.periodoHasta || "?"}
      </p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: negocio y datos ficticios.</p>}

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Métricas principales</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
        <tbody>
          {[
            ["Ventas totales", monto(resumen.metricas.ventas)],
            ["Operaciones", String(resumen.metricas.operaciones)],
            ["Unidades", String(resumen.metricas.unidades)],
            ["Ticket promedio", monto(resumen.metricas.ticketPromedio)],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{k}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {resumen.comparacion && (
        <>
          <p style={{ marginTop: "10pt", fontWeight: 700 }}>Comparación de períodos</p>
          <p style={{ fontSize: "9pt" }}>
            {monto(resumen.comparacion.ventasA)} → {monto(resumen.comparacion.ventasB)} ({resumen.comparacion.variacionPct === null ? "sin variación calculable" : `${resumen.comparacion.variacionPct} %`}){!resumen.comparacion.comparable && " — períodos con distinta cantidad de días"}
          </p>
        </>
      )}

      {TITULOS_RESPUESTA.map((t) => {
        if (t.clave === "metricas") return null;
        const items = lectura[t.clave];
        if (!items.length) return null;
        return (
          <div key={t.clave}>
            <p style={{ marginTop: "10pt", fontWeight: 700 }}>{t.titulo}</p>
            <ul style={{ fontSize: "9pt" }}>
              {items.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>
        );
      })}

      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con tu archivo, en guiapromptsia.com. Las métricas las calculó esta página; los hallazgos y las hipótesis, tu IA: revísalos antes de tomar una decisión.</p>
    </div>
  );
}
