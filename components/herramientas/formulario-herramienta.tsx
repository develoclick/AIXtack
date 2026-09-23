"use client";

import type { Campo } from "@/lib/herramientas/tipos";
import { CampoFormulario, claseCampo } from "./campo-formulario";

/** Los campos propios de la herramienta (los del perfil «Mi negocio» se completan solos). */
export function FormularioHerramienta({ campos, valores, onCambio }: { campos: Campo[]; valores: Record<string, string>; onCambio: (id: string, valor: string) => void }) {
  return (
    <div className="grid gap-5">
      {campos.map((campo) => (
        <CampoFormulario key={campo.id} etiqueta={campo.label} ayuda={campo.ayuda} requerido={campo.requerido}>
          {({ id, describedBy, invalid }) =>
            campo.tipo === "largo" ? (
              <textarea id={id} rows={5} maxLength={campo.maxLength ?? 6000} value={valores[campo.id] ?? ""} onChange={(e) => onCambio(campo.id, e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className={claseCampo} />
            ) : campo.tipo === "seleccion" ? (
              <select id={id} value={valores[campo.id] ?? ""} onChange={(e) => onCambio(campo.id, e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className={claseCampo}>
                <option value="">Elige una opción</option>
                {campo.opciones?.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            ) : (
              <input id={id} type="text" inputMode={campo.tipo === "numero" ? "decimal" : undefined} maxLength={campo.maxLength ?? 400} value={valores[campo.id] ?? ""} onChange={(e) => onCambio(campo.id, e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className={claseCampo} />
            )
          }
        </CampoFormulario>
      ))}
    </div>
  );
}
