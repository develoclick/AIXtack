"use client";

import { FileText, Lock, SlidersHorizontal, Sparkles } from "lucide-react";
import { Campo, Grupo } from "@/components/prompts/campo-formulario";
import { almacenOptimizar } from "./almacen";
import { INTENSIDADES, type DatosOptimizar } from "@/lib/optimizar/tipos";

export function FormularioOptimizar({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenOptimizar.useDatos();
  const modoEjemplo = almacenOptimizar.useModoEjemplo();
  const poner = <K extends keyof DatosOptimizar>(clave: K, valor: DatosOptimizar[K]) => almacenOptimizar.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosOptimizar) => (e: { target: { value: string } }) => poner(clave, e.target.value as never);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos para optimizar tu CV" autoComplete="off">
      <Grupo icono={FileText} titulo="Tu CV y la oferta" descripcion="Pega el texto de tu CV actual y la oferta completa. Es lo único obligatorio.">
        <Campo etiqueta="Tu CV actual, en texto" obligatorio ayuda="Pega todo el contenido, aunque esté desordenado. La IA solo usará lo que escribas aquí.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-64" value={d.cv} onChange={texto("cv")} placeholder={"Pega aquí el texto de tu CV…\nNombre, contacto, experiencia, estudios, habilidades…"} />}
        </Campo>
        <details className="rounded-lg border bg-surface p-3 text-sm">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold">Cómo copiar el texto de tu PDF sin perder el orden</summary>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
            <li>Abre tu CV (PDF o Word), selecciona todo (Ctrl + A o Cmd + A) y cópialo (Ctrl + C o Cmd + C).</li>
            <li>Pégalo en el recuadro de arriba. Si prefieres, pégalo antes en el Bloc de notas para quitarle el formato.</li>
            <li>Si el orden sale mezclado (por ejemplo, la experiencia aparece entre tus datos de contacto), tu CV probablemente usa columnas o tablas: es justo el tipo de problema que este prompt te ayuda a corregir. Ordena a mano lo más importante o usa la intensidad «Reestructuración».</li>
            <li>Si el PDF es una foto (escaneado), no tiene texto que copiar: vuelve a escribir tu CV en un documento nuevo.</li>
          </ol>
        </details>
        <Campo etiqueta="La oferta laboral completa" obligatorio ayuda="Pega el aviso entero (funciones, requisitos y deseables). De ahí salen las palabras clave y las brechas.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-44" value={d.oferta} onChange={texto("oferta")} placeholder="Pega aquí la descripción de la vacante…" />}
        </Campo>
      </Grupo>

      <Grupo icono={SlidersHorizontal} titulo="Cuánto quieres que cambie" descripcion="Elige la intensidad de la optimización.">
        <fieldset>
          <legend className="mb-1.5 block text-sm font-semibold">
            Intensidad
            <span aria-hidden className="ml-1 text-destructive">
              *
            </span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {INTENSIDADES.map((i) => (
              <label key={i.valor} className={`tarjeta flex min-h-11 cursor-pointer flex-col gap-1 p-3 text-sm transition-colors ${d.intensidad === i.valor ? "border-brand-solid ring-1 ring-brand-solid/40" : ""}`}>
                <span className="flex items-center gap-2 font-semibold">
                  <input type="radio" name="intensidad" value={i.valor} checked={d.intensidad === i.valor} onChange={() => poner("intensidad", i.valor)} className="size-4 accent-[var(--accent)]" />
                  {i.etiqueta}
                </span>
                <span className="text-xs leading-snug text-muted-foreground">{i.ayuda}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Campo etiqueta="Elementos que no se pueden tocar" ayuda="Por ejemplo, los títulos oficiales de tus cargos, las fechas o los nombres de las empresas. Uno por línea.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-20" value={d.intocables} onChange={texto("intocables")} placeholder="Ej.: Los cargos «Asistente contable» y «Auxiliar administrativo»" />}
        </Campo>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Idioma de salida">
            {(id) => (
              <select id={id} className="campo" value={d.idioma} onChange={texto("idioma")}>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            )}
          </Campo>
          <Campo etiqueta="Longitud máxima">
            {(id) => (
              <select id={id} className="campo" value={String(d.paginas)} onChange={(e) => poner("paginas", e.target.value === "2" ? 2 : 1)}>
                <option value="1">1 página</option>
                <option value="2">2 páginas</option>
              </select>
            )}
          </Campo>
          <Campo etiqueta="País">
            {(id) => <input id={id} className="campo" value={d.pais} onChange={texto("pais")} placeholder="Perú" />}
          </Campo>
        </div>
      </Grupo>

      <Grupo icono={Sparkles} titulo="Datos nuevos (opcional)" descripcion="Lo que no estaba en tu CV y quieres añadir: logros, cursos recientes, herramientas.">
        <Campo etiqueta="Datos nuevos que quieras añadir" ayuda="Solo escribe lo que sea verdad y puedas demostrar. La IA no agregará nada que no esté aquí o en tu CV.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-24" value={d.datosNuevos} onChange={texto("datosNuevos")} placeholder="Ej.: Curso «Conciliaciones bancarias con Excel», 12 horas, 2024" />}
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
