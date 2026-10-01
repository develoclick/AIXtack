import { calcularParaTipo } from "@/lib/convertir-graficos/motor";
import type { LecturaConvertirGraficos } from "@/lib/convertir-graficos/lector";
import type { DatosConvertirGraficos, FilaTabla } from "@/lib/convertir-graficos/tipos";

/**
 * Informe listo para imprimir o guardar en PDF (desde el diálogo de impresión del navegador). En pantalla está oculto;
 * al pulsar «Descargar informe en PDF» se muestra solo esta parte (ver la regla @media print de globals.css). Los
 * gráficos se listan como tabla (el canvas no se imprime bien en todos los navegadores).
 */
export function ResumenImprimible({ datos, lectura, filas, esEjemplo }: { datos: DatosConvertirGraficos; lectura: LecturaConvertirGraficos | null; filas: FilaTabla[]; esEjemplo: boolean }) {
  if (!lectura?.valido) return null;
  const unidad = datos.unidad.trim();
  const formato = (n: number) => (unidad ? `${unidad} ${n.toLocaleString("es-PE")}` : n.toLocaleString("es-PE"));

  return (
    <div id="graficos-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>Gráficos sugeridos para tu tabla</p>
      <p style={{ fontSize: "10pt" }}>Origen: {datos.nombreOrigen || "(tabla pegada)"}</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: tabla y datos ficticios.</p>}

      {lectura.graficos.map((g, i) => {
        const dg = calcularParaTipo(filas, g.tipo, g.x, g.y, g.color || null, g.agregacion);
        return (
          <div key={i} style={{ marginTop: "12pt" }}>
            <p style={{ fontWeight: 700, fontSize: "12pt" }}>{g.titulo || `${g.tipo} de ${g.x}`}</p>
            {g.pregunta && <p style={{ fontSize: "9pt" }}>{g.pregunta}</p>}
            {dg.puntos ? (
              <p style={{ fontSize: "9pt" }}>{dg.puntos.length} puntos ({g.x} vs {g.y})</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>{g.x}</th>
                    {dg.series.map((s) => (
                      <th key={s.nombre || "valor"} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                        {s.nombre || g.y || "Valor"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dg.etiquetas.map((e, idx) => (
                    <tr key={e}>
                      <td style={{ border: "1px solid #999", padding: "3pt" }}>{e}</td>
                      {dg.series.map((s) => (
                        <td key={s.nombre || "valor"} style={{ border: "1px solid #999", padding: "3pt" }}>
                          {formato(s.valores[idx])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {g.advertencia && g.advertencia.toLowerCase() !== "ninguna" && <p style={{ fontSize: "8pt", fontStyle: "italic" }}>{g.advertencia}</p>}
          </div>
        );
      })}

      <p style={{ marginTop: "10pt", fontWeight: 700 }}>Hallazgos visibles</p>
      <ul style={{ fontSize: "9pt" }}>
        {lectura.hallazgos.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>

      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con tu tabla, en guiapromptsia.com. Los gráficos los calculó esta página; los hallazgos, tu IA: revísalos antes de tomar una decisión.</p>
    </div>
  );
}
