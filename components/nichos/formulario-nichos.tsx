"use client";

import { Compass, Coins, MapPin, Zap } from "lucide-react";
import { Grupo } from "@/components/prompts/campo-formulario";
import { Numero, Selector, Texto } from "@/components/plan/campos";
import { almacenNichos } from "./almacen";
import { CANALES, TIPOS_CLIENTE, type Canal, type DatosNichos } from "@/lib/nichos/tipos";

export function FormularioNichos({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenNichos.useDatos();
  const modoEjemplo = almacenNichos.useModoEjemplo();
  const poner = <K extends keyof DatosNichos>(clave: K, valor: DatosNichos[K]) => almacenNichos.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosNichos) => (v: string) => poner(clave, v as never);
  const alternarCanal = (c: Canal) => poner("canales", d.canales.includes(c) ? d.canales.filter((x) => x !== c) : [...d.canales, c]);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Tu inventario personal" autoComplete="off">
      <Grupo icono={Compass} titulo="Lo que sabes y ofreces" descripcion="La base de los nichos: sin esto, la IA solo podría adivinar.">
        <Texto largo etiqueta="Conocimientos y experiencia" valor={d.conocimientos} alCambiar={texto("conocimientos")} obligatorio placeholder="Ej.: 8 años dando clases de inglés corporativo" />
        <Texto etiqueta="Sectores que te interesan" valor={d.sectores} alCambiar={texto("sectores")} obligatorio placeholder="Ej.: Educación, tecnología" />
        <Texto largo etiqueta="Lo que sabes ofrecer" valor={d.oferta} alCambiar={texto("oferta")} obligatorio placeholder="Ej.: Clases de inglés en línea, individuales y grupales" />
      </Grupo>

      <Grupo icono={MapPin} titulo="Mercado y cliente">
        <Texto etiqueta="Ubicación o mercado" valor={d.mercado} alCambiar={texto("mercado")} obligatorio placeholder="Ej.: Lima, Perú; también en línea" />
        <Selector etiqueta="Tipo de cliente" valor={d.tipoCliente} opciones={TIPOS_CLIENTE} alCambiar={(v) => poner("tipoCliente", v)} />
      </Grupo>

      <Grupo icono={Coins} titulo="Recursos y presupuesto">
        <Texto largo etiqueta="Recursos disponibles (opcional)" valor={d.recursos} alCambiar={texto("recursos")} placeholder="Ej.: Laptop, cámara, 3 años de material propio" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Numero etiqueta="Presupuesto inicial (S/)" valor={d.presupuesto} alCambiar={texto("presupuesto")} obligatorio placeholder="Ej.: 500" minimo={0} />
          <Numero etiqueta="Horas por semana disponibles (opcional)" valor={d.horas} alCambiar={texto("horas")} placeholder="Ej.: 15" minimo={0} maximo={80} />
        </div>
      </Grupo>

      <Grupo icono={Zap} titulo="Canales y restricciones">
        <fieldset>
          <legend className="mb-1.5 block text-sm font-semibold">Canales disponibles</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {CANALES.map((c) => (
              <label key={c.valor} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm ${d.canales.includes(c.valor) ? "border-brand-solid bg-brand-muted" : "bg-surface"}`}>
                <input type="checkbox" className="size-4 shrink-0 accent-[var(--accent)]" checked={d.canales.includes(c.valor)} onChange={() => alternarCanal(c.valor)} />
                {c.etiqueta}
              </label>
            ))}
          </div>
        </fieldset>
        <Texto largo etiqueta="Restricciones (opcional)" valor={d.restricciones} alCambiar={texto("restricciones")} placeholder="Ej.: No quiero alquilar un local" />
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
