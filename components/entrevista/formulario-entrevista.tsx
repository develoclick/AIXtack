"use client";

import { FileText, Lock, Mic, Sparkles } from "lucide-react";
import { Campo, Grupo } from "@/components/prompts/campo-formulario";
import { almacenEntrevista } from "./almacenes";
import { DIFICULTADES, MODOS, TIPOS_ENTREVISTA, type DatosEntrevista } from "@/lib/entrevista/tipos";

function Opciones<T extends string>({ nombre, leyenda, obligatorio, opciones, valor, alCambiar, columnas = "sm:grid-cols-3" }: { nombre: string; leyenda: string; obligatorio?: boolean; opciones: { valor: T; etiqueta: string; ayuda?: string }[]; valor: T; alCambiar: (v: T) => void; columnas?: string }) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-semibold">
        {leyenda}
        {obligatorio && (
          <span aria-hidden className="ml-1 text-destructive">
            *
          </span>
        )}
      </legend>
      <div className={`grid gap-2 ${columnas}`}>
        {opciones.map((o) => (
          <label key={o.valor} className={`tarjeta flex min-h-11 cursor-pointer flex-col gap-1 p-3 text-sm transition-colors ${valor === o.valor ? "border-brand-solid ring-1 ring-brand-solid/40" : ""}`}>
            <span className="flex items-center gap-2 font-semibold">
              <input type="radio" name={nombre} value={o.valor} checked={valor === o.valor} onChange={() => alCambiar(o.valor)} className="size-4 accent-[var(--accent)]" />
              {o.etiqueta}
            </span>
            {o.ayuda && <span className="text-xs leading-snug text-muted-foreground">{o.ayuda}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FormularioEntrevista({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenEntrevista.useDatos();
  const modoEjemplo = almacenEntrevista.useModoEjemplo();
  const poner = <K extends keyof DatosEntrevista>(clave: K, valor: DatosEntrevista[K]) => almacenEntrevista.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosEntrevista) => (e: { target: { value: string } }) => poner(clave, e.target.value as never);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos para preparar tu entrevista" autoComplete="off">
      <Grupo icono={FileText} titulo="Tu CV y la oferta" descripcion="Pega el texto de tu CV y la oferta completa. Es lo único obligatorio.">
        <Campo etiqueta="Tu CV, en texto" obligatorio ayuda="Pega todo el contenido. La IA solo usará lo que escribas aquí: si no está en tu CV, no lo puede contar como experiencia tuya.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-56" value={d.cv} onChange={texto("cv")} placeholder={"Pega aquí el texto de tu CV…\nNombre, experiencia, estudios, habilidades…"} />}
        </Campo>
        <Campo etiqueta="La oferta laboral completa" obligatorio ayuda="Pega el aviso entero (funciones y requisitos). De ahí salen las preguntas y los temas que debes estudiar.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-40" value={d.oferta} onChange={texto("oferta")} placeholder="Pega aquí la descripción de la vacante…" />}
        </Campo>
      </Grupo>

      <Grupo icono={Mic} titulo="Tu entrevista" descripcion="Elige el tipo, cómo quieres practicar y qué tan exigente será.">
        <Opciones nombre="tipo-entrevista" leyenda="Tipo de entrevista" obligatorio opciones={TIPOS_ENTREVISTA.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta }))} valor={d.tipo} alCambiar={(v) => poner("tipo", v)} />
        <Opciones nombre="modo-practica" leyenda="Modo de práctica" obligatorio opciones={MODOS.map((m) => ({ valor: m.valor, etiqueta: m.etiqueta, ayuda: m.ayuda }))} valor={d.modo} alCambiar={(v) => poner("modo", v)} columnas="sm:grid-cols-2" />
        <Opciones nombre="dificultad" leyenda="Nivel de dificultad" opciones={DIFICULTADES.map((x) => ({ valor: x.valor, etiqueta: x.etiqueta }))} valor={d.dificultad} alCambiar={(v) => poner("dificultad", v)} columnas="sm:grid-cols-2" />
        <Campo etiqueta="Empresa (nombre y lo que sabes de ella)" ayuda="Escribe solo lo que sepas y hayas verificado. La IA no inventará nada más sobre la empresa.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-20" value={d.empresa} onChange={texto("empresa")} placeholder="Ej.: FinTech Pampa. Procesa pagos digitales para comercios pequeños." />}
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Duración estimada" ayuda="Si la conoces. Ayuda a calibrar cuántas preguntas esperar.">
            {(id, ay) => <input id={id} aria-describedby={ay} className="campo" value={d.duracion} onChange={texto("duracion")} placeholder="Ej.: 45 minutos" />}
          </Campo>
          <Campo etiqueta="Idioma de la práctica">
            {(id) => (
              <select id={id} className="campo" value={d.idioma} onChange={texto("idioma")}>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            )}
          </Campo>
        </div>
      </Grupo>

      <Grupo icono={Sparkles} titulo="Lo que quieres trabajar (opcional)" descripcion="Cuanto más específico, más útil el entrenamiento.">
        <Campo etiqueta="Experiencias que quieres destacar" ayuda="Logros o proyectos reales de tu CV que quieres poder contar bien.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-20" value={d.destacar} onChange={texto("destacar")} placeholder="Ej.: El incidente de la caída del servicio de pagos." />}
        </Campo>
        <Campo etiqueta="Temas que te preocupan" ayuda="Vacíos en el CV, despidos, cambios de carrera o tecnologías que no dominas. La IA los usará para elegir las preguntas más incómodas.">
          {(id, ay) => <textarea id={id} aria-describedby={ay} className="campo min-h-20" value={d.temas} onChange={texto("temas")} placeholder="Ej.: Hueco de un año en mi CV; no tengo experiencia con Docker." />}
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
