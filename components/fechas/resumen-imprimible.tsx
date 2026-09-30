import type { FilaOrdenable } from "@/lib/fechas/analisis";
import type { DatosFechas } from "@/lib/fechas/tipos";

/**
 * Versión para imprimir o guardar en PDF. En pantalla está oculta; al pulsar «Imprimir o PDF» se muestra solo esta parte
 * (ver la regla @media print de globals.css). Sin anuncios ni botones.
 */
export function ResumenImprimible({ datos, filas, esEjemplo }: { datos: DatosFechas; filas: FilaOrdenable[]; esEjemplo: boolean }) {
  return (
    <div id="fechas-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>
        Fechas más baratas: {datos.origen.trim() || "—"} → {datos.destino.trim() || "—"}
      </p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: precios ficticios, no son tarifas reales.</p>}
      <p>
        Período: {datos.fechaInicio || "—"} a {datos.fechaFin || "—"} · Duraciones: {datos.duraciones || "—"} noches
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12pt", fontSize: "9pt" }}>
        <thead>
          <tr>
            {["Ida", "Vuelta", "Noches", "Precio", "Por persona", "Aerolínea", "Escalas", "Fuente"].map((h) => (
              <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.ida}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.vuelta}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.noches ?? ""}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.precioComparado === null ? "" : `${f.moneda} ${f.precioComparado}`}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.precioPorPersona === null ? "" : `${f.moneda} ${f.precioPorPersona}`}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.aerolinea}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.escalas}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.fuente}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>
        Generado en tu navegador con los precios que pegaste o escribiste, en guiapromptsia.com. Verifica cada precio en la aerolínea o el buscador antes de pagar. No es asesoría financiera.
      </p>
    </div>
  );
}
