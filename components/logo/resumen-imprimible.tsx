import type { LecturaLogo } from "@/lib/logo/lector";
import type { DatosLogo } from "@/lib/logo/tipos";

/**
 * Mini manual de marca para imprimir o guardar en PDF (desde el diálogo de impresión del navegador). En pantalla está oculto;
 * al pulsar «Imprimir o guardar manual en PDF» se muestra solo esta parte (ver la regla @media print de globals.css).
 */
export function ResumenImprimible({ datos, lectura, esEjemplo }: { datos: DatosLogo; lectura: LecturaLogo | null; esEjemplo: boolean }) {
  if (!lectura) return null;
  return (
    <div id="logo-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>{datos.nombreEmpresa || "Manual de marca"}</p>
      <p style={{ fontWeight: 700, fontSize: "10pt" }}>Propuesta generada con IA; requiere revisión profesional antes de usarla como marca definitiva.</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: conceptos y prompts ficticios.</p>}

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Brief</p>
      <ul>
        {lectura.brief.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Conceptos</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
        <thead>
          <tr>
            {["Concepto", "Idea", "Tipo"].map((h) => (
              <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lectura.conceptos.map((c, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{c.nombre}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{c.idea}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{c.tipo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Paleta</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
        <thead>
          <tr>
            {["Color", "HEX", "Uso"].map((h) => (
              <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lectura.paleta.map((c, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{c.nombre}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{c.hex}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{c.uso}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Tipografías</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
        <thead>
          <tr>
            {["Tipografía", "Alternativa gratuita", "Uso"].map((h) => (
              <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lectura.tipografias.map((t, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{t.nombre}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{t.alternativaGoogleFonts}</td>
              <td style={{ border: "1px solid #999", padding: "3pt" }}>{t.uso}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Usos correctos e incorrectos</p>
      <ul>
        {lectura.aplicaciones.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
        {lectura.revision.map((r, i) => (
          <li key={`r${i}`}>Riesgo a revisar: {r}</li>
        ))}
      </ul>

      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con los datos que escribiste, en guiapromptsia.com. No es asesoría legal ni sustituye la revisión de un diseñador profesional.</p>
    </div>
  );
}
