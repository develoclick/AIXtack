"use client";

import { useId } from "react";
import { opcionesMarcadas } from "@/lib/herramientas/plantillas";
import { type Campo, SEPARADOR_CASILLAS } from "@/lib/herramientas/tipos";
import { CampoFormulario, claseCampo } from "./campo-formulario";

/**
 * Varias opciones marcables (por ejemplo, los formatos que necesitas). El valor es la lista de las marcadas, en el orden de
 * `opciones`, unidas con SEPARADOR_CASILLAS. Lleva su `fieldset` y `legend` (la pregunta) y casillas de 44 px de alto.
 */
function GrupoCasillas({ campo, valor, onCambio }: { campo: Campo; valor: string; onCambio: (valor: string) => void }) {
  const id = useId();
  const marcadas = new Set(opcionesMarcadas(valor));
  const ayudaId = `${id}-ayuda`;

  return (
    <fieldset className="min-w-0" aria-describedby={campo.ayuda ? ayudaId : undefined}>
      <legend className="mb-1.5 block text-sm font-semibold text-guide-ink">
        {campo.label}
        {campo.requerido && <span className="ml-1.5 font-normal text-muted-foreground">(obligatorio)</span>}
      </legend>
      <div className="grid gap-2">
        {(campo.opciones ?? []).map((opcion, i) => {
          const casilla = `${id}-${i}`;
          return (
            <label
              key={opcion}
              htmlFor={casilla}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-foreground/50 bg-background px-3 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-guide-ink"
            >
              <input
                id={casilla}
                type="checkbox"
                checked={marcadas.has(opcion)}
                onChange={(e) => {
                  const siguiente = new Set(marcadas);
                  if (e.target.checked) siguiente.add(opcion);
                  else siguiente.delete(opcion);
                  onCambio((campo.opciones ?? []).filter((o) => siguiente.has(o)).join(SEPARADOR_CASILLAS));
                }}
                className="size-5 shrink-0 accent-[var(--brand)]"
              />
              <span className="text-[0.97rem] text-foreground">{opcion}</span>
            </label>
          );
        })}
      </div>
      {campo.ayuda && (
        <p id={ayudaId} className="mt-1.5 text-sm text-muted-foreground">
          {campo.ayuda}
        </p>
      )}
    </fieldset>
  );
}

/** Los campos propios de la herramienta (los del perfil «Mi negocio» se completan solos). */
export function FormularioHerramienta({ campos, valores, onCambio }: { campos: Campo[]; valores: Record<string, string>; onCambio: (id: string, valor: string) => void }) {
  return (
    <div className="grid gap-5">
      {campos.map((campo) =>
        campo.tipo === "casillas" ? (
          <GrupoCasillas key={campo.id} campo={campo} valor={valores[campo.id] ?? ""} onCambio={(v) => onCambio(campo.id, v)} />
        ) : (
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
        )
      )}
    </div>
  );
}
