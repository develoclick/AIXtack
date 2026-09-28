import type { GrupoChecklist, HojaDeEstudio } from "@/lib/entrevista/estudio";

/**
 * Versiones para papel: la checklist del día previo y la hoja de estudio. En pantalla están ocultas; al imprimir se muestra solo la
 * que se pidió (ver las reglas @media print de globals.css). Sin anuncios ni botones.
 */
export function ImprimiblesEntrevista({ grupos, marcados, hoja, esEjemplo }: { grupos: GrupoChecklist[]; marcados: string[]; hoja: HojaDeEstudio; esEjemplo: boolean }) {
  return (
    <>
      <div id="entrevista-imprimible-checklist" className="hidden text-black">
        <p style={{ fontSize: "20pt", fontWeight: 700 }}>Checklist del día previo a la entrevista</p>
        {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: datos ficticios.</p>}
        {grupos.map((g) => (
          <div key={g.titulo} style={{ marginTop: "12pt" }}>
            <p style={{ fontWeight: 700 }}>{g.titulo}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "4pt 0 0" }}>
              {g.items.map((i) => (
                <li key={i.id} style={{ margin: "3pt 0" }}>
                  {marcados.includes(i.id) ? "☑" : "☐"} {i.texto}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p style={{ marginTop: "14pt", fontSize: "8pt" }}>Preparado en guiapromptsia.com con los datos que escribiste. Es una ayuda para prepararte, no garantiza un resultado.</p>
      </div>
      <div id="entrevista-imprimible-hoja" className="hidden text-black">
        <p style={{ fontSize: "20pt", fontWeight: 700 }}>{hoja.titulo}</p>
        {esEjemplo && <p style={{ fontWeight: 700 }}>EJEMPLO ILUSTRATIVO: datos ficticios. Las preguntas son probables, no reales.</p>}
        {hoja.secciones.map((s) => (
          <div key={s.titulo} style={{ marginTop: "12pt" }}>
            <p style={{ fontWeight: 700 }}>{s.titulo}</p>
            <ul style={{ margin: "4pt 0 0", paddingLeft: "16pt" }}>
              {s.items.map((i) => (
                <li key={i} style={{ margin: "2pt 0", fontSize: "10pt" }}>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p style={{ marginTop: "14pt", fontSize: "8pt" }}>Preparado en guiapromptsia.com. Las preguntas son probables, no las reales de la empresa. No memorices guiones: usa solo datos verdaderos de tu experiencia.</p>
      </div>
    </>
  );
}
