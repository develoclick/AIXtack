import type { LecturaSegmentarClientes } from "@/lib/segmentar-clientes/lector";
import type { SegmentoResumen } from "@/lib/segmentar-clientes/motor";
import type { DatosSegmentarClientes } from "@/lib/segmentar-clientes/tipos";

/**
 * Informe listo para imprimir o guardar en PDF (desde el diálogo de impresión del navegador). En pantalla está oculto;
 * al pulsar «Descargar informe en PDF» se muestra solo esta parte (ver la regla @media print de globals.css).
 */
export function ResumenImprimibleSegmentar({ datos, lectura, resumen, esEjemplo }: { datos: DatosSegmentarClientes; lectura: LecturaSegmentarClientes | null; resumen: SegmentoResumen[]; esEjemplo: boolean }) {
  if (!lectura?.valido) return null;

  return (
    <div id="segmentar-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>Segmentación de clientes</p>
      <p style={{ fontSize: "10pt" }}>Origen: {datos.nombreOrigen || "(sin nombre)"} · Método: {datos.metodo === "rfm" ? "RFM" : "Reglas personalizadas"}</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: datos y clientes ficticios.</p>}

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", marginTop: "10pt" }}>
        <thead>
          <tr>
            {["Segmento", "Clientes", "% base", "% ingresos", "Recencia media", "Pedidos prom.", "Gasto medio"].map((h) => (
              <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resumen.map((s) => (
            <tr key={s.nombre}>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{s.nombre}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{s.cantidad}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{s.pctBase}%</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{s.pctIngresos}%</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{s.recenciaMediaDias ?? "—"} días</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{s.frecuenciaMedia}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>S/ {s.gastoMedio}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Perfiles [INTERPRETACIÓN]</p>
      <ul style={{ fontSize: "9pt" }}>
        {lectura.perfiles.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Acciones a probar por segmento</p>
      <ul style={{ fontSize: "9pt" }}>
        {lectura.acciones.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>

      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con tus datos, en guiapromptsia.com. Los segmentos los calculó esta página; los perfiles y acciones, tu IA: revísalos antes de tomar una decisión.</p>
    </div>
  );
}
