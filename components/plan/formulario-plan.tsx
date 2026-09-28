"use client";

import { Briefcase, Clock, FileText, ListChecks, Lock, Plus, Target, Trash2 } from "lucide-react";
import { Grupo } from "@/components/prompts/campo-formulario";
import { almacenPlan } from "./almacen";
import { Numero, Selector, Texto } from "./campos";
import { CONTRATOS, CUMPLES, MAX_HORAS, MAX_VACANTES, METAS, MODALIDADES, nuevoId, NIVELES, vacanteVacia, type DatosPlan, type Vacante } from "@/lib/plan/tipos";

export function FormularioPlan({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenPlan.useDatos();
  const modoEjemplo = almacenPlan.useModoEjemplo();
  const poner = <K extends keyof DatosPlan>(clave: K, valor: DatosPlan[K]) => almacenPlan.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosPlan) => (v: string) => poner(clave, v as never);
  const cambiarVacante = (id: string, c: Partial<Vacante>) => poner("vacantes", d.vacantes.map((v) => (v.id === id ? { ...v, ...c } : v)));

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de tu búsqueda de empleo" autoComplete="off">
      <Grupo icono={Target} titulo="Tu objetivo" descripcion="Cuanto más concreto sea el puesto, más útil es el plan. «Cualquier trabajo» no es un objetivo.">
        <Texto etiqueta="Puesto objetivo" valor={d.puesto} alCambiar={texto("puesto")} obligatorio placeholder="Ej.: Asistente administrativa" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Selector etiqueta="Nivel" valor={d.nivel} opciones={NIVELES} alCambiar={(v) => poner("nivel", v)} obligatorio />
          <Selector etiqueta="Tu situación" valor={d.meta} opciones={METAS} alCambiar={(v) => poner("meta", v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Ciudad y país" valor={d.ubicacion} alCambiar={texto("ubicacion")} obligatorio placeholder="Ej.: Arequipa, Perú" />
          <Selector etiqueta="Modalidad" valor={d.modalidad} opciones={MODALIDADES} alCambiar={(v) => poner("modalidad", v)} obligatorio />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Selector etiqueta="Tipo de contrato" valor={d.contrato} opciones={CONTRATOS} alCambiar={(v) => poner("contrato", v)} />
          <Texto etiqueta="Salario objetivo (opcional)" valor={d.salario} alCambiar={texto("salario")} placeholder="Ej.: S/ 2,500 mensuales brutos" ayuda="En tus palabras. La IA no lo usa para dar cifras de mercado." />
        </div>
        <Texto etiqueta="Sectores de interés" valor={d.sectores} alCambiar={texto("sectores")} placeholder="Ej.: comercio, salud, servicios" />
        <Texto largo etiqueta="Competencias clave" valor={d.competencias} alCambiar={texto("competencias")} placeholder="Ej.: Excel intermedio, atención al cliente, facturación" ayuda="Solo lo que puedas demostrar." />
      </Grupo>

      <Grupo icono={Clock} titulo="Tu tiempo" descripcion="El plan se arma con las horas que de verdad puedes dedicar. La página comprueba que ninguna semana se pase.">
        <Numero etiqueta="Horas por semana para buscar empleo" valor={d.horas} alCambiar={texto("horas")} obligatorio minimo={1} maximo={MAX_HORAS} placeholder="Ej.: 10" ayuda={`Entre 1 y ${MAX_HORAS}. Sé realista: un plan que no cabe en tu semana no se cumple.`} />
      </Grupo>

      <Grupo icono={FileText} titulo="Tu CV (opcional)" descripcion="Un resumen basta: ayuda a adaptar el plan a tu experiencia. Evita datos de contacto.">
        <Texto largo etiqueta="Resumen de tu CV o de tu experiencia" valor={d.cv} alCambiar={texto("cv")} placeholder="Ej.: Técnica en administración. Dos años como auxiliar de caja en una tienda familiar." ayuda="No pongas tu documento, teléfono ni dirección: este texto se envía a la IA que elijas." />
      </Grupo>

      <Grupo icono={ListChecks} titulo={`Vacantes para priorizar (opcional, hasta ${MAX_VACANTES})`} descripcion="Si ya tienes avisos, la IA los ordena con criterios. Solo prioriza las que escribas aquí: no inventa otras.">
        {d.vacantes.length > 0 && (
          <ul className="space-y-3" data-vacantes>
            {d.vacantes.map((v, i) => (
              <li key={v.id} className="rounded-lg border bg-surface p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Texto etiqueta={`Vacante ${i + 1}: empresa`} valor={v.empresa} alCambiar={(x) => cambiarVacante(v.id, { empresa: x })} placeholder="Ej.: Comercial Aurora" />
                  <Texto etiqueta={`Vacante ${i + 1}: puesto`} valor={v.puesto} alCambiar={(x) => cambiarVacante(v.id, { puesto: x })} placeholder="Ej.: Asistente administrativa" />
                  <Texto etiqueta={`Vacante ${i + 1}: lugar o modalidad`} valor={v.ubicacion} alCambiar={(x) => cambiarVacante(v.id, { ubicacion: x })} placeholder="Ej.: Arequipa, híbrido" />
                  <Texto etiqueta={`Vacante ${i + 1}: fecha límite`} tipo="date" valor={v.limite} alCambiar={(x) => cambiarVacante(v.id, { limite: x })} />
                </div>
                <div className="mt-3 space-y-3">
                  <Texto largo etiqueta={`Vacante ${i + 1}: requisitos y condiciones del aviso`} valor={v.resumen} alCambiar={(x) => cambiarVacante(v.id, { resumen: x })} placeholder="Copia lo esencial del aviso: requisitos obligatorios, horario y lugar." />
                  <Selector etiqueta={`Vacante ${i + 1}: ¿cumples los requisitos obligatorios?`} valor={v.cumple} opciones={CUMPLES} alCambiar={(x) => cambiarVacante(v.id, { cumple: x })} />
                </div>
                <button type="button" className="btn btn-texto mt-1" onClick={() => poner("vacantes", d.vacantes.filter((x) => x.id !== v.id))} aria-label={`Quitar la vacante ${i + 1}${v.empresa ? `: ${v.empresa}` : ""}`}>
                  <Trash2 aria-hidden className="size-4" /> Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn btn-secundario" disabled={d.vacantes.length >= MAX_VACANTES} onClick={() => poner("vacantes", [...d.vacantes, vacanteVacia(nuevoId("v"))])}>
          <Plus aria-hidden className="size-4" /> Agregar vacante {d.vacantes.length >= MAX_VACANTES ? `(máximo ${MAX_VACANTES})` : ""}
        </button>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Briefcase aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Pega solo lo que dice el aviso público. No incluyas datos de personas de la empresa.
        </p>
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
