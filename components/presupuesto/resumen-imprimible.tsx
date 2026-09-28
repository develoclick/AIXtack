import { calcular, ESCENARIOS, formatoDinero, formatoMonto, formatoPorcentaje, parsearNumero } from "@/lib/presupuesto/calculo";
import { categoriaPorId, TIPOS, UNIDADES, type DatosPresupuesto } from "@/lib/presupuesto/tipos";

/**
 * Versión para imprimir o guardar en PDF. En pantalla está oculta; al pulsar «Imprimir» se muestra solo esta parte
 * (ver la regla @media print de globals.css). Sin anuncios ni botones.
 */
export function ResumenImprimible({ datos, esEjemplo }: { datos: DatosPresupuesto; esEjemplo: boolean }) {
  const c = calcular(datos);
  const moneda = datos.moneda.trim() || "S/";
  const i = c.escenarios.intermedio;
  return (
    <div id="presupuesto-imprimible" className="hidden text-black">
      <p style={{ fontSize: "20pt", fontWeight: 700 }}>Presupuesto de viaje{datos.destino.trim() ? `: ${datos.destino.trim()}` : ""}</p>
      {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: datos ficticios, no son precios reales.</p>}
      <p>
        {datos.salida && datos.regreso ? `${datos.salida} a ${datos.regreso} · ` : ""}
        {c.noches ?? "—"} noches · {c.personas ?? "—"} viajeros · moneda: {moneda}
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12pt", fontSize: "9pt" }}>
        <thead>
          <tr>
            {["Categoría", "Concepto", "Monto", "Unidad", "Tipo", `Total (${moneda})`].map((h) => (
              <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.lineas.map((l, idx) => {
            const monto = parsearNumero(l.monto);
            return (
              <tr key={l.id}>
                <td style={{ border: "1px solid #999", padding: "3pt" }}>{categoriaPorId(l.categoria).nombre}</td>
                <td style={{ border: "1px solid #999", padding: "3pt" }}>{l.concepto}</td>
                <td style={{ border: "1px solid #999", padding: "3pt" }}>{monto === null ? "" : `${l.enAlterna ? datos.monedaAlterna : moneda} ${formatoMonto(monto)}`}</td>
                <td style={{ border: "1px solid #999", padding: "3pt" }}>{UNIDADES.find((u) => u.valor === l.unidad)!.corta}</td>
                <td style={{ border: "1px solid #999", padding: "3pt" }}>{TIPOS.find((t) => t.valor === l.tipo)!.etiqueta}</td>
                <td style={{ border: "1px solid #999", padding: "3pt", textAlign: "right" }}>{c.lineas[idx].total === null ? "" : formatoMonto(c.lineas[idx].total!)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ marginTop: "12pt" }}>
        Subtotal: {formatoDinero(i.subtotal, moneda)} · Imprevistos ({formatoPorcentaje(c.pctImprevistos)}): {formatoDinero(i.imprevistos, moneda)} · <strong>Total: {formatoDinero(i.total, moneda)}</strong>
        {i.porPersona !== null && <> · Por persona: {formatoDinero(i.porPersona, moneda)}</>}
      </p>
      <p>
        Escenarios: {ESCENARIOS.map((e) => `${e.etiqueta} ${formatoDinero(c.escenarios[e.clave].total, moneda)}`).join(" · ")}
      </p>
      <p>
        Respaldado por precios reales: {formatoPorcentaje(c.porcentajes.conocido)} · Estimado: {formatoPorcentaje(c.porcentajes.estimado)} · Opcional: {formatoPorcentaje(c.porcentajes.opcional)} · Imprevistos: {formatoPorcentaje(c.porcentajes.imprevistos)}
      </p>
      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Calculado en el navegador con los datos que escribiste, en guiapromptsia.com. Los precios cambian: verifícalos en su fuente antes de reservar. No es asesoría financiera.</p>
    </div>
  );
}
