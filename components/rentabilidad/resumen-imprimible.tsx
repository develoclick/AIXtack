import type { LecturaRentabilidad } from "@/lib/rentabilidad/lector";
import type { Resultado } from "@/lib/rentabilidad/calculo";
import { formatoMonto } from "@/lib/presupuesto/calculo";
import { TITULOS_RESPUESTA } from "@/lib/rentabilidad/tipos";

/**
 * Versión para imprimir o guardar en PDF (desde el diálogo de impresión del navegador). En pantalla está oculta; al pulsar
 * «Imprimir o guardar manual en PDF» se muestra solo esta parte (ver la regla @media print de globals.css).
 */
export function ResumenImprimible({ resultado, lectura, esEjemplo }: { resultado: Resultado | null; lectura: LecturaRentabilidad | null; esEjemplo: boolean }) {
  if (!lectura || !resultado) return null;
  return (
    <div id="rentabilidad-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>Rentabilidad del negocio</p>
      <p style={{ fontWeight: 700, fontSize: "10pt" }}>Análisis generado con ayuda de IA; no es una auditoría contable ni asesoría financiera o tributaria.</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: negocio y cifras ficticios.</p>}

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Resultado del período</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
        <tbody>
          {[
            ["Ingresos totales", `S/ ${formatoMonto(resultado.ingresosTotal)}`],
            ["Costo directo total", `S/ ${formatoMonto(resultado.costoDirectoTotal)}`],
            ["Utilidad bruta", `S/ ${formatoMonto(resultado.utilidadBruta)}`],
            ["Costos variables adicionales", `S/ ${formatoMonto(resultado.variablesAdicionales)}`],
            ["Costos fijos", `S/ ${formatoMonto(resultado.fijos)}`],
            ["Utilidad operativa", `S/ ${formatoMonto(resultado.utilidadOperativa)} (${resultado.margenOperativoPct} %)`],
            ["Punto de equilibrio", resultado.puntoEquilibrioMonto !== null ? `S/ ${formatoMonto(resultado.puntoEquilibrioMonto)}` : "No se puede calcular"],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ border: "1px solid #999", padding: "3pt", fontWeight: 700 }}>{k}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {TITULOS_RESPUESTA.map((t) => {
        const texto = lectura.secciones[t.clave];
        if (!texto) return null;
        return (
          <div key={t.clave}>
            <p style={{ marginTop: "10pt", fontWeight: 700 }}>{t.titulo}</p>
            <ul>
              {texto
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
                .map((l, i) => (
                  <li key={i}>{l.replace(/^[-*•]\s*/, "")}</li>
                ))}
            </ul>
          </div>
        );
      })}

      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con los datos que escribiste, en guiapromptsia.com. No es asesoría legal, financiera ni contable.</p>
    </div>
  );
}
