import { agruparPorCategoria } from "@/lib/catalogo-productos/calculo";
import { itemsDeCelda } from "@/lib/catalogo-productos/tipos";
import type { LecturaCatalogo } from "@/lib/catalogo-productos/lector";
import type { DatosCatalogo } from "@/lib/catalogo-productos/tipos";

/**
 * Catálogo listo para imprimir o guardar en PDF (desde el diálogo de impresión del navegador). En pantalla está oculto; al
 * pulsar «Descargar catálogo en PDF» se muestra solo esta parte (ver la regla @media print de globals.css).
 */
export function ResumenImprimible({ datos, lectura, esEjemplo }: { datos: DatosCatalogo; lectura: LecturaCatalogo | null; esEjemplo: boolean }) {
  if (!lectura?.valido) return null;
  const categorias = agruparPorCategoria(lectura.filas);

  return (
    <div id="catalogo-imprimible" className="hidden text-black">
      <p style={{ fontSize: "22pt", fontWeight: 700 }}>{datos.empresa || "Catálogo de productos"}</p>
      {datos.rubro && <p style={{ fontSize: "11pt" }}>{datos.rubro}</p>}
      {datos.whatsapp && <p style={{ fontSize: "10pt" }}>WhatsApp: {datos.whatsapp}</p>}
      {esEjemplo && (
        <p style={{ fontWeight: 700, marginTop: "6pt" }}>EJEMPLO ILUSTRATIVO: catálogo ficticio, no de un negocio real.</p>
      )}

      {categorias.map((c) => (
        <div key={c.nombre} style={{ marginTop: "14pt" }}>
          <p style={{ fontWeight: 700, fontSize: "13pt", borderBottom: "1px solid #999", paddingBottom: "2pt" }}>{c.nombre}</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", marginTop: "4pt" }}>
            <thead>
              <tr>
                {["Producto", "Especificaciones", "Variantes", "Precio"].map((h) => (
                  <th key={h} style={{ border: "1px solid #999", padding: "3pt", textAlign: "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.filas.map((f, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #999", padding: "3pt" }}>
                    {f.nombre}
                    {f.descripcion && <div style={{ color: "#555" }}>{f.descripcion}</div>}
                  </td>
                  <td style={{ border: "1px solid #999", padding: "3pt" }}>{itemsDeCelda(f.especificaciones).join(", ")}</td>
                  <td style={{ border: "1px solid #999", padding: "3pt" }}>{itemsDeCelda(f.variantes).join(", ")}</td>
                  <td style={{ border: "1px solid #999", padding: "3pt" }}>
                    {f.precioPromo.trim() || f.precio}
                    {f.precioPromo.trim() && <div style={{ color: "#777", textDecoration: "line-through" }}>{f.precio}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <p style={{ marginTop: "12pt", fontSize: "8pt" }}>Generado en tu navegador con los datos que escribiste, en guiapromptsia.com. Los precios se copiaron tal cual del formulario: revisa siempre el catálogo antes de compartirlo con tus clientes.</p>
    </div>
  );
}
