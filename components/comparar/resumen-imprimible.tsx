import { filasResumen } from "@/lib/comparar/calculo";
import { formatoMonto, parsearNumero } from "@/lib/presupuesto/calculo";
import type { DatosComparar } from "@/lib/comparar/tipos";

/**
 * Versión para imprimir o guardar en PDF. En pantalla está oculta; al pulsar «Imprimir o PDF» se muestra solo esta parte
 * (ver la regla @media print de globals.css). Sin anuncios ni botones.
 */
export function ResumenImprimible({ datos, esEjemplo }: { datos: DatosComparar; esEjemplo: boolean }) {
  const filas = filasResumen(datos);
  return (
    <div id="comparar-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>Comparación de opciones de viaje</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: precios ficticios, no son tarifas reales.</p>}
      <p>
        Viajeros: {datos.viajeros || "—"} · Fechas: {datos.fechas || "—"}
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12pt", fontSize: "9pt" }}>
        <thead>
          <tr>
            {["Opción", "Precio", "Costo total ajustado", "Puntuación", "Ubicación", "Condiciones"].map((h) => (
              <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.opcion.id}>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.opcion.nombre}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>
                {f.opcion.moneda} {formatoMonto(parsearNumero(f.opcion.precio) ?? 0)}
              </td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.costo.total !== null ? `${f.opcion.moneda} ${formatoMonto(f.costo.total)}` : ""}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.puntuacion}/100</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.opcion.ubicacion}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.opcion.condiciones}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con los datos y los pesos que escribiste, en guiapromptsia.com. Verifica cada precio y condición con el proveedor antes de reservar. No es asesoría financiera.</p>
    </div>
  );
}
