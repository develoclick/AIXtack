import { diasDelViaje } from "@/lib/itinerario/calculo";
import { TIPOS_BLOQUE, type DatosItinerario, type FilaItinerario } from "@/lib/itinerario/tipos";

/**
 * Versión para imprimir o guardar en PDF. En pantalla está oculta; al pulsar «Imprimir o PDF» se muestra solo esta parte
 * (ver la regla @media print de globals.css). Sin anuncios ni botones.
 */
export function ResumenImprimible({ datos, filas, esEjemplo }: { datos: DatosItinerario; filas: FilaItinerario[]; esEjemplo: boolean }) {
  const dias = diasDelViaje(datos);
  const porDia = new Map<number, FilaItinerario[]>();
  for (const f of filas) porDia.set(f.dia, [...(porDia.get(f.dia) ?? []), f]);
  return (
    <div id="itinerario-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>Itinerario de viaje{datos.destino.trim() ? `: ${datos.destino.trim()}` : ""}</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: datos ficticios, no son horarios reales.</p>}
      <p>
        {datos.fechaInicio && datos.fechaFin ? `${datos.fechaInicio} a ${datos.fechaFin} · ` : ""}
        {dias ?? "—"} días · alojamiento: {datos.alojamiento.trim() || "—"}
      </p>
      {Array.from(porDia.keys())
        .sort((a, b) => a - b)
        .map((dia) => {
          const bloques = porDia.get(dia)!;
          const fecha = bloques.find((b) => b.fecha)?.fecha;
          return (
            <div key={dia} style={{ marginTop: "12pt" }}>
              <p style={{ fontSize: "13pt", fontWeight: 700 }}>
                Día {dia}
                {fecha ? ` — ${fecha}` : ""}
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
                <thead>
                  <tr>
                    {["Hora", "Actividad", "Tipo", "Lugar", "Nota"].map((h) => (
                      <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bloques.map((b, i) => (
                    <tr key={i}>
                      <td style={{ border: "1px solid #999", padding: "3pt" }}>
                        {b.horaInicio}–{b.horaFin}
                      </td>
                      <td style={{ border: "1px solid #999", padding: "3pt" }}>{b.actividad}</td>
                      <td style={{ border: "1px solid #999", padding: "3pt" }}>{b.tipo ? TIPOS_BLOQUE.find((t) => t.valor === b.tipo)!.etiqueta : b.tipoTexto}</td>
                      <td style={{ border: "1px solid #999", padding: "3pt" }}>{b.lugar}</td>
                      <td style={{ border: "1px solid #999", padding: "3pt" }}>{b.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con los datos de tu respuesta de IA, en guiapromptsia.com. Verifica cada horario y día de cierre en la fuente oficial antes de viajar. No es asesoría legal sobre requisitos de entrada.</p>
    </div>
  );
}
