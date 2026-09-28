"use client";

import { FileText, Lock, SlidersHorizontal } from "lucide-react";
import { Campo, Grupo } from "@/components/prompts/campo-formulario";
import { almacenAnalisis } from "./almacen";
import { ControlPesos } from "./control-pesos";
import { parsearAnios } from "@/lib/analisis/anios";
import { DISTINGUE, type DatosAnalisis } from "@/lib/analisis/tipos";

export function FormularioAnalisis({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenAnalisis.useDatos();
  const modoEjemplo = almacenAnalisis.useModoEjemplo();
  const poner = <K extends keyof DatosAnalisis>(clave: K, valor: DatosAnalisis[K]) => almacenAnalisis.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosAnalisis) => (e: { target: { value: string } }) => poner(clave, e.target.value as never);
  const errAnios = d.anios.trim() && parsearAnios(d.anios) === null ? "Escribe un número de años, por ejemplo 3 o 0,7." : undefined;

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos para comparar tu CV con la oferta" autoComplete="off">
      <Grupo icono={FileText} titulo="Tu CV y la oferta" descripcion="Pega el texto de tu CV y la oferta completa. Es lo único obligatorio.">
        <Campo etiqueta="Tu CV, en texto" obligatorio ayuda="Pega todo el contenido. La comparación usa solo lo que está escrito: si algo no está en tu CV, aparecerá como «no identificado».">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-56" value={d.cv} onChange={texto("cv")} placeholder={"Pega aquí el texto de tu CV…\nNombre, experiencia, estudios, habilidades…"} />}
        </Campo>
        <Campo etiqueta="La oferta laboral completa" obligatorio ayuda="Copia el anuncio entero (funciones, requisitos, deseables) desde LinkedIn, Computrabajo o donde lo hayas visto.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-44" value={d.oferta} onChange={texto("oferta")} placeholder="Pega aquí la descripción de la vacante…" />}
        </Campo>
      </Grupo>

      <Grupo icono={SlidersHorizontal} titulo="Ajusta el cálculo (opcional)" descripcion="Esto no cambia la comparación de la IA: cambia cómo la página calcula el porcentaje y verifica los años.">
        <fieldset>
          <legend className="mb-1.5 block text-sm font-semibold">¿La oferta distingue obligatorios de deseables?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {DISTINGUE.map((o) => (
              <label key={o.valor} className={`tarjeta flex min-h-11 cursor-pointer items-center gap-2 p-3 text-sm font-semibold transition-colors ${d.distingue === o.valor ? "border-brand-solid ring-1 ring-brand-solid/40" : ""}`}>
                <input type="radio" name="distingue" value={o.valor} checked={d.distingue === o.valor} onChange={() => poner("distingue", o.valor)} className="size-4 accent-[var(--accent)]" />
                {o.etiqueta}
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Busca palabras como «indispensable», «requisito», «deseable» o «se valorará». Si no las hay, elige «No los distingue».</p>
        </fieldset>
        <ControlPesos valor={d.pesoObligatorio} alCambiar={(v) => poner("pesoObligatorio", v)} deshabilitado={d.distingue === "no"} />
        <Campo etiqueta="Años de experiencia totales" ayuda="Para verificar los requisitos de años («2 años de experiencia»). Puedes usar decimales.">
          {(id, ay) => (
            <>
              <input id={id} inputMode="decimal" className="campo tabular" value={d.anios} onChange={texto("anios")} placeholder="Ej.: 3 o 0,7" aria-invalid={Boolean(errAnios)} aria-describedby={[ay, errAnios ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined} />
              {errAnios && (
                <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
                  {errAnios}
                </p>
              )}
            </>
          )}
        </Campo>
      </Grupo>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Lock aria-hidden className="size-4" />
          {modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Lo que escribes se guarda solo en tu navegador, para que no lo pierdas si recargas."}
        </p>
        <button
          type="button"
          className="btn btn-texto"
          onClick={() => {
            if (modoEjemplo || window.confirm("¿Borrar todos los datos del formulario? No se puede deshacer.")) alBorrar();
          }}
        >
          Borrar mis datos
        </button>
      </div>
    </form>
  );
}
