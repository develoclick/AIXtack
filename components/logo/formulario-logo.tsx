"use client";

import { useId } from "react";
import { Layers, Palette, Sparkles, Target } from "lucide-react";
import { Grupo } from "@/components/prompts/campo-formulario";
import { Selector, Texto } from "@/components/plan/campos";
import { almacenLogo } from "./almacen";
import { DESLIZADORES, ESTILOS, USOS, type DatosLogo, type Personalidad, type Uso } from "@/lib/logo/tipos";

function Deslizador({ clave, izquierda, derecha, valor, alCambiar }: { clave: string; izquierda: string; derecha: string; valor: number; alCambiar: (v: number) => void }) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className={`font-semibold ${valor < 50 ? "text-brand" : ""}`}>{izquierda}</span>
        <span className="font-semibold text-muted-foreground tabular">{valor}</span>
        <span className={`font-semibold ${valor > 50 ? "text-brand" : ""}`}>{derecha}</span>
      </div>
      <label htmlFor={id} className="sr-only">
        {izquierda} a {derecha}
      </label>
      <input id={id} data-deslizador={clave} type="range" min={0} max={100} step={5} value={valor} onChange={(e) => alCambiar(Number(e.target.value))} className="h-11 w-full cursor-pointer accent-[var(--accent)]" />
    </div>
  );
}

function Checklist<T extends string>({ etiqueta, opciones, valores, alCambiar }: { etiqueta: string; opciones: { valor: T; etiqueta: string }[]; valores: T[]; alCambiar: (v: T[]) => void }) {
  const alternar = (v: T) => alCambiar(valores.includes(v) ? valores.filter((x) => x !== v) : [...valores, v]);
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-semibold">
        {etiqueta}
        <span aria-hidden className="ml-1 text-destructive">*</span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {opciones.map((o) => (
          <label key={o.valor} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm ${valores.includes(o.valor) ? "border-brand-solid bg-brand-muted" : "bg-surface"}`}>
            <input type="checkbox" className="size-4 shrink-0 accent-[var(--accent)]" checked={valores.includes(o.valor)} onChange={() => alternar(o.valor)} />
            {o.etiqueta}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FormularioLogo({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenLogo.useDatos();
  const modoEjemplo = almacenLogo.useModoEjemplo();
  const poner = <K extends keyof DatosLogo>(clave: K, valor: DatosLogo[K]) => almacenLogo.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosLogo) => (v: string) => poner(clave, v as never);
  const cambiarDeslizador = (clave: keyof Personalidad, v: number) => poner("personalidad", { ...d.personalidad, [clave]: v });

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de tu marca" autoComplete="off">
      <div className="rounded-lg border border-warn/40 bg-warn-muted p-3 text-sm leading-relaxed">
        <strong className="font-semibold">Esta página no genera imágenes.</strong> Arma el brief y los prompts para que tú los pegues en un generador de imágenes; el resultado siempre necesita tu revisión y, para un logo definitivo, la de un diseñador profesional.
      </div>

      <Grupo icono={Target} titulo="Tu negocio" descripcion="Antes de cualquier imagen, esto define qué debe comunicar el logo.">
        <Texto etiqueta="Nombre de la empresa" valor={d.nombreEmpresa} alCambiar={texto("nombreEmpresa")} obligatorio placeholder="Ej.: Masa Madre Rímac" />
        <Texto etiqueta="Eslogan (opcional)" valor={d.eslogan} alCambiar={texto("eslogan")} placeholder="Ej.: Pan de verdad, todos los días" />
        <Texto etiqueta="Rubro" valor={d.rubro} alCambiar={texto("rubro")} obligatorio placeholder="Ej.: panadería artesanal" />
        <Texto largo etiqueta="Productos o servicios" valor={d.oferta} alCambiar={texto("oferta")} obligatorio placeholder="Ej.: pan de masa madre, bollería y café" />
        <Texto largo etiqueta="Público objetivo" valor={d.publico} alCambiar={texto("publico")} obligatorio placeholder="Ej.: adultos de 25 a 45 años que valoran lo artesanal" />
        <Texto etiqueta="Competencia de la que diferenciarte (opcional)" valor={d.competencia} alCambiar={texto("competencia")} placeholder="Ej.: panaderías industriales de la zona" />
      </Grupo>

      <Grupo icono={Sparkles} titulo="Personalidad de marca" descripcion="Mueve cada deslizador hacia el extremo que más se parezca a tu negocio; el centro significa equilibrio entre ambos.">
        {DESLIZADORES.map((ds) => (
          <Deslizador key={ds.clave} clave={ds.clave} izquierda={ds.izquierda} derecha={ds.derecha} valor={d.personalidad[ds.clave]} alCambiar={(v) => cambiarDeslizador(ds.clave, v)} />
        ))}
        <Texto etiqueta="3 adjetivos de marca (opcional)" valor={d.adjetivos} alCambiar={texto("adjetivos")} placeholder="Ej.: cálida, artesanal, honesta" />
      </Grupo>

      <Grupo icono={Palette} titulo="Estilo y color">
        <Selector etiqueta="Estilo" valor={d.estilo} opciones={ESTILOS.map((e) => ({ valor: e.valor, etiqueta: e.etiqueta }))} alCambiar={(v) => poner("estilo", v)} obligatorio />
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Colores preferidos (opcional)" valor={d.coloresPreferidos} alCambiar={texto("coloresPreferidos")} placeholder="Ej.: tonos tierra" />
          <Texto etiqueta="Colores a evitar (opcional)" valor={d.coloresEvitar} alCambiar={texto("coloresEvitar")} placeholder="Ej.: colores fríos" />
        </div>
        <Texto largo etiqueta="Referencias que te gustan (opcional)" valor={d.referencias} alCambiar={texto("referencias")} placeholder="Describe el estilo, no copies una marca puntual: ej. «panaderías europeas con vitrinas de madera»" ayuda="Descríbelas con tus palabras: la IA no debe copiar el logo de una marca real." />
        <Texto etiqueta="Símbolos o conceptos a considerar (opcional)" valor={d.simbolos} alCambiar={texto("simbolos")} placeholder="Ej.: espiga de trigo, horno de barro" />
      </Grupo>

      <Grupo icono={Layers} titulo="Usos y generador">
        <Checklist etiqueta="Usos previstos" opciones={USOS} valores={d.usos} alCambiar={(v) => poner("usos", v as Uso[])} />
        <Texto etiqueta="Generador de imágenes que vas a usar (opcional)" valor={d.generador} alCambiar={texto("generador")} placeholder="Ej.: el que ya uses" />
      </Grupo>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <button
          type="button"
          className="btn btn-texto"
          onClick={() => {
            if (modoEjemplo || window.confirm("¿Borrar todos los datos del formulario? No se puede deshacer.")) alBorrar();
          }}
        >
          Borrar mis datos
        </button>
        <span>{modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Lo que escribes se guarda solo en tu navegador."}</span>
      </div>
    </form>
  );
}
