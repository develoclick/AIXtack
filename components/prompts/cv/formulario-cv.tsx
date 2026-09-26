"use client";

import { useId, type ReactNode } from "react";
import { Briefcase, GraduationCap, Plus, Sparkles, Target, Trash2, UserRound, type LucideIcon } from "lucide-react";
import { guardarDatos, useDatosCv, useModoEjemplo } from "./almacen";
import {
  estudioVacio,
  experienciaVacia,
  MAX_ESTUDIOS,
  MAX_EXPERIENCIAS,
  NIVELES,
  nuevoId,
  type DatosCv,
  type EstudioCv,
  type ExperienciaCv,
} from "@/lib/cv/tipos";

interface CampoProps {
  etiqueta: string;
  ayuda?: string;
  requerido?: boolean;
  children: (id: string, ayudaId: string | undefined) => ReactNode;
  className?: string;
}

function Campo({ etiqueta, ayuda, requerido, children, className }: CampoProps) {
  const id = useId();
  const ayudaId = ayuda ? `${id}-ayuda` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {etiqueta}
        {requerido && <span className="ml-1 text-xs font-medium text-muted-foreground">(recomendado)</span>}
      </label>
      {children(id, ayudaId)}
      {ayuda && (
        <p id={ayudaId} className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {ayuda}
        </p>
      )}
    </div>
  );
}

function Grupo({ icono: Icono, titulo, descripcion, children }: { icono: LucideIcon; titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <fieldset className="tarjeta min-w-0 p-5 sm:p-6">
      <legend className="sr-only">{titulo}</legend>
      <div className="mb-5 flex items-start gap-3">
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
          <Icono className="size-4" />
        </span>
        <div>
          <h3 className="text-lg font-semibold leading-tight">{titulo}</h3>
          {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

export function FormularioCv({ alBorrar }: { alBorrar: () => void }) {
  const d = useDatosCv();
  const modoEjemplo = useModoEjemplo();
  const poner = <K extends keyof DatosCv>(clave: K, valor: DatosCv[K]) => guardarDatos({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosCv) => (e: { target: { value: string } }) => poner(clave, e.target.value as never);

  const cambiarExperiencia = (id: string, parche: Partial<ExperienciaCv>) => poner("experiencias", d.experiencias.map((x) => (x.id === id ? { ...x, ...parche } : x)));
  const cambiarEstudio = (id: string, parche: Partial<EstudioCv>) => poner("estudios", d.estudios.map((x) => (x.id === id ? { ...x, ...parche } : x)));

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos para tu hoja de vida" autoComplete="off">
      <Grupo icono={Target} titulo="El puesto al que postulas" descripcion="Con esto la IA adapta las palabras clave de tu CV.">
        <Campo etiqueta="Puesto al que postulas" requerido>
          {(id) => <input id={id} className="campo" value={d.puesto} onChange={texto("puesto")} placeholder="Ej.: Analista de marketing digital" />}
        </Campo>
        <Campo etiqueta="Oferta laboral" requerido ayuda="Pega el texto completo del aviso (funciones y requisitos). Es lo que más mejora el ajuste con los filtros ATS. Si no la tienes, déjalo vacío.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-36" value={d.oferta} onChange={texto("oferta")} placeholder="Pega aquí la descripción de la vacante…" />}
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Tu nivel de experiencia">
            {(id) => (
              <select id={id} className="campo" value={d.nivel} onChange={texto("nivel")}>
                {NIVELES.map((n) => (
                  <option key={n.valor} value={n.valor}>
                    {n.etiqueta}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <Campo etiqueta="Idioma de tu CV">
            {(id) => (
              <select id={id} className="campo" value={d.idioma} onChange={texto("idioma")}>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            )}
          </Campo>
        </div>
      </Grupo>

      <Grupo icono={UserRound} titulo="Tus datos de contacto" descripcion="Solo ciudad y país: no hace falta tu dirección exacta, edad ni foto.">
        <Campo etiqueta="Nombre completo" requerido>
          {(id) => <input id={id} className="campo" value={d.nombre} onChange={texto("nombre")} autoComplete="name" placeholder="Nombre y apellidos" />}
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Correo electrónico" requerido>
            {(id) => <input id={id} type="email" className="campo" value={d.email} onChange={texto("email")} autoComplete="email" placeholder="tu@correo.com" />}
          </Campo>
          <Campo etiqueta="Teléfono" requerido>
            {(id) => <input id={id} type="tel" className="campo" value={d.telefono} onChange={texto("telefono")} autoComplete="tel" placeholder="+51 900 000 000" />}
          </Campo>
          <Campo etiqueta="Ciudad y país" requerido>
            {(id) => <input id={id} className="campo" value={d.ciudad} onChange={texto("ciudad")} placeholder="Lima, Perú" />}
          </Campo>
          <Campo etiqueta="LinkedIn (opcional)">
            {(id) => <input id={id} className="campo" value={d.linkedin} onChange={texto("linkedin")} placeholder="linkedin.com/in/tu-nombre" />}
          </Campo>
        </div>
        <Campo etiqueta="Portafolio o sitio web (opcional)">
          {(id) => <input id={id} className="campo" value={d.web} onChange={texto("web")} placeholder="tuportafolio.com" />}
        </Campo>
      </Grupo>

      <Grupo icono={Briefcase} titulo="Tu experiencia laboral" descripcion="Empieza por el trabajo más reciente. Escribe lo que hiciste y lo que lograste, con números si los tienes.">
        {d.experiencias.map((e, i) => (
          <div key={e.id} className="space-y-4 rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Trabajo {i + 1}</h4>
              {d.experiencias.length > 1 && (
                <button type="button" className="btn btn-texto inline-flex items-center gap-1.5" onClick={() => poner("experiencias", d.experiencias.filter((x) => x.id !== e.id))} aria-label={`Quitar el trabajo ${i + 1}`}>
                  <Trash2 aria-hidden className="size-4" /> Quitar
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Cargo">{(id) => <input id={id} className="campo" value={e.cargo} onChange={(ev) => cambiarExperiencia(e.id, { cargo: ev.target.value })} placeholder="Ej.: Analista de marketing" />}</Campo>
              <Campo etiqueta="Empresa">{(id) => <input id={id} className="campo" value={e.empresa} onChange={(ev) => cambiarExperiencia(e.id, { empresa: ev.target.value })} placeholder="Nombre de la empresa" />}</Campo>
              <Campo etiqueta="Ciudad y país">{(id) => <input id={id} className="campo" value={e.lugar} onChange={(ev) => cambiarExperiencia(e.id, { lugar: ev.target.value })} placeholder="Lima, Perú" />}</Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Desde">{(id) => <input id={id} className="campo" value={e.inicio} onChange={(ev) => cambiarExperiencia(e.id, { inicio: ev.target.value })} placeholder="Mar 2022" />}</Campo>
                <Campo etiqueta="Hasta">{(id) => <input id={id} className="campo" value={e.fin} onChange={(ev) => cambiarExperiencia(e.id, { fin: ev.target.value })} placeholder="Actualidad" />}</Campo>
              </div>
            </div>
            <Campo etiqueta="Lo que hiciste y lograste" ayuda="Una idea por línea. Ejemplo: «Redujimos el tiempo de entrega de 5 a 3 días». No inventes cifras: si no tienes una, escribe solo lo que hiciste.">
              {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-32" value={e.logros} onChange={(ev) => cambiarExperiencia(e.id, { logros: ev.target.value })} placeholder={"Armé reportes mensuales de ventas…\nAtendí a 40 clientes por semana…"} />}
            </Campo>
          </div>
        ))}
        {d.experiencias.length < MAX_EXPERIENCIAS && (
          <button type="button" className="btn btn-secundario" onClick={() => poner("experiencias", [...d.experiencias, experienciaVacia(nuevoId("exp"))])}>
            <Plus aria-hidden className="size-4" /> Agregar otro trabajo
          </button>
        )}
        <p className="text-xs text-muted-foreground">Sin experiencia laboral: deja este bloque vacío y cuenta tus prácticas, voluntariados y proyectos en el bloque 5.</p>
      </Grupo>

      <Grupo icono={GraduationCap} titulo="Tu educación">
        {d.estudios.map((e, i) => (
          <div key={e.id} className="space-y-4 rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Estudio {i + 1}</h4>
              {d.estudios.length > 1 && (
                <button type="button" className="btn btn-texto inline-flex items-center gap-1.5" onClick={() => poner("estudios", d.estudios.filter((x) => x.id !== e.id))} aria-label={`Quitar el estudio ${i + 1}`}>
                  <Trash2 aria-hidden className="size-4" /> Quitar
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Título o carrera">{(id) => <input id={id} className="campo" value={e.titulo} onChange={(ev) => cambiarEstudio(e.id, { titulo: ev.target.value })} placeholder="Ej.: Licenciatura en Marketing" />}</Campo>
              <Campo etiqueta="Institución">{(id) => <input id={id} className="campo" value={e.institucion} onChange={(ev) => cambiarEstudio(e.id, { institucion: ev.target.value })} placeholder="Nombre de la institución" />}</Campo>
              <Campo etiqueta="Ciudad y país">{(id) => <input id={id} className="campo" value={e.lugar} onChange={(ev) => cambiarEstudio(e.id, { lugar: ev.target.value })} placeholder="Lima, Perú" />}</Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Desde">{(id) => <input id={id} className="campo" value={e.inicio} onChange={(ev) => cambiarEstudio(e.id, { inicio: ev.target.value })} placeholder="2015" />}</Campo>
                <Campo etiqueta="Hasta">{(id) => <input id={id} className="campo" value={e.fin} onChange={(ev) => cambiarEstudio(e.id, { fin: ev.target.value })} placeholder="2019" />}</Campo>
              </div>
            </div>
            <Campo etiqueta="Detalles (opcional)" ayuda="Promedio destacado, honores, tesis o cursos relevantes. Una idea por línea.">
              {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-20" value={e.detalle} onChange={(ev) => cambiarEstudio(e.id, { detalle: ev.target.value })} />}
            </Campo>
          </div>
        ))}
        {d.estudios.length < MAX_ESTUDIOS && (
          <button type="button" className="btn btn-secundario" onClick={() => poner("estudios", [...d.estudios, estudioVacio(nuevoId("est"))])}>
            <Plus aria-hidden className="size-4" /> Agregar otro estudio
          </button>
        )}
      </Grupo>

      <Grupo icono={Sparkles} titulo="Habilidades y extras" descripcion="Todo es opcional, pero las habilidades ayudan mucho con los filtros ATS.">
        <Campo etiqueta="Habilidades y herramientas" requerido ayuda="Una por línea o separadas por comas. Ejemplo: Excel avanzado, SQL, Google Analytics.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-24" value={d.habilidades} onChange={texto("habilidades")} />}
        </Campo>
        <Campo etiqueta="Idiomas" ayuda="Ejemplo: Español nativo; Inglés B2.">
          {(id, ay) => <input id={id} aria-describedby={ay} className="campo" value={d.idiomas} onChange={texto("idiomas")} />}
        </Campo>
        <Campo etiqueta="Certificaciones y cursos" ayuda="Una por línea, con el año si lo recuerdas.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-20" value={d.certificaciones} onChange={texto("certificaciones")} />}
        </Campo>
        <Campo etiqueta="Proyectos, prácticas, voluntariado o actividades" ayuda="Si aún no tienes experiencia laboral, aquí va lo más importante. Una idea por línea.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-24" value={d.proyectos} onChange={texto("proyectos")} />}
        </Campo>
        <Campo etiqueta="Algo más que quieras destacar de ti (opcional)" ayuda="Tus fortalezas en tus palabras. La IA las usa para el perfil profesional, sin inventar nada.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-20" value={d.resumen} onChange={texto("resumen")} />}
        </Campo>
      </Grupo>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <p>{modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Lo que escribes se guarda solo en tu navegador, para que no lo pierdas si recargas."}</p>
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
