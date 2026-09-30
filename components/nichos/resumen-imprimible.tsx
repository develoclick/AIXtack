import type { NichoRankeado } from "@/lib/nichos/calculo";
import type { LecturaValidacion } from "@/lib/nichos/lector";
import { TITULOS_VALIDACION } from "@/lib/nichos/lector";

/**
 * Versión para imprimir o guardar en PDF (desde el diálogo de impresión del navegador). En pantalla está oculta; al pulsar
 * «Imprimir o guardar manual en PDF» se muestra solo esta parte (ver la regla @media print de globals.css).
 */
export function ResumenImprimible({ ranking, lecturaValidacion, esEjemplo }: { ranking: NichoRankeado[]; lecturaValidacion: LecturaValidacion | null; esEjemplo: boolean }) {
  if (ranking.length === 0) return null;
  return (
    <div id="nichos-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>Matriz de nichos de mercado</p>
      <p style={{ fontWeight: 700, fontSize: "10pt" }}>Generado con ayuda de IA; los nichos son hipótesis, no certezas. No es asesoría de inversión.</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: nichos y plan ficticios.</p>}

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Matriz de evaluación</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
        <thead>
          <tr>
            {["#", "Nicho", "Puntuación"].map((h) => (
              <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ranking.map((n) => (
            <tr key={n.id}>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{n.posicion}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{n.nombre}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{n.puntuacion} / 5</td>
            </tr>
          ))}
        </tbody>
      </table>

      {lecturaValidacion?.valido &&
        TITULOS_VALIDACION.map((t) => {
          const texto = lecturaValidacion.secciones[t.clave];
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

      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con los datos que escribiste, en guiapromptsia.com. No es asesoría legal ni de inversión.</p>
    </div>
  );
}
