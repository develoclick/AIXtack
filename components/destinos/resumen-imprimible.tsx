import type { FilaResumen } from "@/lib/destinos/calculo";
import { formatoMonto } from "@/lib/presupuesto/calculo";
import type { DatosDestinos } from "@/lib/destinos/tipos";

/**
 * Versión para imprimir o guardar en PDF. En pantalla está oculta; al pulsar «Imprimir o PDF» se muestra solo esta parte
 * (ver la regla @media print de globals.css). Sin anuncios ni botones.
 */
export function ResumenImprimible({ datos, filas, esEjemplo }: { datos: DatosDestinos; filas: FilaResumen[]; esEjemplo: boolean }) {
  return (
    <div id="destinos-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>Destinos según tu presupuesto</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: precios ficticios, no son tarifas reales.</p>}
      <p>
        Presupuesto: {datos.moneda} {formatoMonto(Number(datos.presupuesto) || 0)} · Origen: {datos.origen || "—"} · Viajeros: {datos.viajeros || "—"}
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12pt", fontSize: "9pt" }}>
        <thead>
          <tr>
            {["Destino", "Pasaje pp", "Alojamiento/noche", "Costo total", "Restante", "Dato"].map((h) => (
              <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.fila.destino}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.fila.pasajePorPersona ?? ""}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.fila.alojamientoPorNoche ?? ""}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.recalculo.total ?? ""}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.recalculo.restante ?? ""}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{f.fila.tipoDato ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>
        Generado en tu navegador con el presupuesto que escribiste y los destinos que pegaste o escribiste, en guiapromptsia.com. Verifica cada precio con la aerolínea o el alojamiento antes de pagar. No es asesoría financiera.
      </p>
    </div>
  );
}
