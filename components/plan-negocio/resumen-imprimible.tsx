import type { LecturaPlanNegocio } from "@/lib/plan-negocio/lector";
import { TITULOS_RESPUESTA, type DatosPlanNegocio } from "@/lib/plan-negocio/tipos";

/**
 * Versión para imprimir o guardar en PDF (desde el diálogo de impresión del navegador). En pantalla está oculta; al pulsar
 * «Imprimir o guardar manual en PDF» se muestra solo esta parte (ver la regla @media print de globals.css).
 */
export function ResumenImprimible({ datos, lectura, esEjemplo }: { datos: DatosPlanNegocio; lectura: LecturaPlanNegocio | null; esEjemplo: boolean }) {
  if (!lectura) return null;
  return (
    <div id="plan-negocio-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>{datos.nombreEmpresa || "Plan de negocio"}</p>
      <p style={{ fontWeight: 700, fontSize: "10pt" }}>Plan generado con ayuda de IA; no sustituye asesoría legal, financiera ni contable profesional.</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: cifras y competidores ficticios.</p>}

      {TITULOS_RESPUESTA.map((t) => {
        const texto = lectura.secciones[t.clave];
        if (!texto) return null;
        const lineas = texto
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        return (
          <div key={t.clave}>
            <p style={{ marginTop: "10pt", fontWeight: 700 }}>{t.titulo}</p>
            {lineas[0]?.startsWith("|") ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
                <tbody>
                  {lineas
                    .filter((l) => !/^\|?[\s:|-]+\|?$/.test(l))
                    .map((l, i) => (
                      <tr key={i}>
                        {l
                          .replace(/^\|/, "")
                          .replace(/\|$/, "")
                          .split("|")
                          .map((c, j) => (
                            <td key={j} style={{ border: "1px solid #999", padding: "3pt", fontWeight: i === 0 ? 700 : 400 }}>
                              {c.trim()}
                            </td>
                          ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <ul>
                {lineas.map((l, i) => (
                  <li key={i}>{l.replace(/^[-*•]\s*/, "")}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con los datos que escribiste, en guiapromptsia.com. No es asesoría legal, financiera ni contable.</p>
    </div>
  );
}
