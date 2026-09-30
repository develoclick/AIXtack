"use client";

import { useId, useRef, useState } from "react";
import { Calculator, Coins, Package, Upload } from "lucide-react";
import { Grupo } from "@/components/prompts/campo-formulario";
import { Numero, Selector, Texto } from "@/components/plan/campos";
import { almacenRentabilidad } from "./almacen";
import { productosDesdeCsv } from "@/lib/rentabilidad/csv";
import { MAX_COSTOS_FIJOS, MAX_PRODUCTOS, PERIODOS, itemVacio, nuevoId, productoVacio, type DatosRentabilidad, type ItemMonto, type Producto } from "@/lib/rentabilidad/tipos";

function EditorProducto({ p, indice, alCambiar, alQuitar }: { p: Producto; indice: number; alCambiar: (c: Partial<Producto>) => void; alQuitar: () => void }) {
  return (
    <li className="tarjeta space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Producto o servicio {indice + 1}</p>
        <button type="button" onClick={alQuitar} className="btn btn-texto -mr-2" aria-label={`Quitar «${p.nombre.trim() || `producto ${indice + 1}`}»`}>
          Quitar
        </button>
      </div>
      <Texto etiqueta="Nombre" valor={p.nombre} alCambiar={(v) => alCambiar({ nombre: v })} placeholder="Ej.: Tortas" />
      <div className="grid grid-cols-3 gap-3">
        <Numero etiqueta="Precio (S/)" valor={p.precio} alCambiar={(v) => alCambiar({ precio: v })} placeholder="0.00" minimo={0} />
        <Numero etiqueta="Costo directo (S/)" valor={p.costo} alCambiar={(v) => alCambiar({ costo: v })} ayuda="Por unidad: insumos, o costo de la hora si es un servicio." placeholder="0.00" minimo={0} />
        <Numero etiqueta="Unidades" valor={p.unidades} alCambiar={(v) => alCambiar({ unidades: v })} placeholder="0" minimo={0} entero />
      </div>
    </li>
  );
}

function EditorCostoFijo({ f, indice, alCambiar, alQuitar }: { f: ItemMonto; indice: number; alCambiar: (c: Partial<ItemMonto>) => void; alQuitar: () => void }) {
  return (
    <li className="grid grid-cols-[1fr_9rem_auto] items-end gap-2">
      <Texto etiqueta={`Costo fijo ${indice + 1}: concepto`} valor={f.concepto} alCambiar={(v) => alCambiar({ concepto: v })} placeholder="Ej.: Alquiler del local" />
      <Numero etiqueta="Monto (S/)" valor={f.monto} alCambiar={(v) => alCambiar({ monto: v })} placeholder="0.00" minimo={0} />
      <button type="button" onClick={alQuitar} className="btn btn-texto mb-0.5" aria-label={`Quitar «${f.concepto.trim() || `costo fijo ${indice + 1}`}»`}>
        Quitar
      </button>
    </li>
  );
}

export function FormularioRentabilidad({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenRentabilidad.useDatos();
  const modoEjemplo = almacenRentabilidad.useModoEjemplo();
  const [errorCsv, setErrorCsv] = useState<string | null>(null);
  const idCsv = useId();
  const inputCsv = useRef<HTMLInputElement>(null);
  const poner = <K extends keyof DatosRentabilidad>(clave: K, valor: DatosRentabilidad[K]) => almacenRentabilidad.guardar({ ...d, [clave]: valor });

  async function importarCsv(archivo: File) {
    setErrorCsv(null);
    const texto = await archivo.text();
    const { productos, errores } = productosDesdeCsv(texto);
    if (productos.length === 0) {
      setErrorCsv(errores[0] ?? "No se pudo leer el archivo.");
      return;
    }
    poner("productos", productos);
    if (errores.length) setErrorCsv(`Se importaron ${productos.length} productos. ${errores.slice(0, 3).join(" ")}`);
  }

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de tu negocio" autoComplete="off">
      <Grupo icono={Calculator} titulo="Período de análisis">
        <Selector etiqueta="¿Para qué período quieres calcular la rentabilidad?" valor={d.periodo} opciones={PERIODOS} alCambiar={(v) => poner("periodo", v)} obligatorio />
      </Grupo>

      <Grupo icono={Package} titulo="Productos o servicios" descripcion="Un producto por fila. El costo directo es lo que te cuesta cada unidad extra: insumos, materia prima, o la hora si es un servicio.">
        <ul className="space-y-2">
          {d.productos.map((p, i) => (
            <EditorProducto key={p.id} p={p} indice={i} alCambiar={(c) => poner("productos", d.productos.map((x) => (x.id === p.id ? { ...x, ...c } : x)))} alQuitar={() => poner("productos", d.productos.filter((x) => x.id !== p.id))} />
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {d.productos.length < MAX_PRODUCTOS && (
            <button type="button" className="btn btn-secundario" onClick={() => poner("productos", [...d.productos, productoVacio(nuevoId("p"))])}>
              Agregar producto
            </button>
          )}
          <label htmlFor={idCsv} className="btn btn-secundario cursor-pointer">
            <Upload aria-hidden className="size-4" /> Importar .csv
            <input
              ref={inputCsv}
              id={idCsv}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importarCsv(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {errorCsv && (
          <p role="alert" className="text-xs font-medium text-warn">
            {errorCsv}
          </p>
        )}
        <p className="text-xs leading-relaxed text-muted-foreground">
          El .csv debe traer una fila de encabezado con las columnas <code>nombre, precio, costo, unidades</code> (en cualquier orden). Si tu archivo es de Excel, guárdalo primero como CSV (Archivo → Guardar como → CSV).
        </p>
      </Grupo>

      <Grupo icono={Coins} titulo="Costos variables y fijos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Selector etiqueta="Comisiones, envíos o pasarela de pago" valor={d.costosVariablesTipo} opciones={[{ valor: "porcentaje", etiqueta: "% de los ingresos" }, { valor: "monto", etiqueta: "Monto fijo del período" }]} alCambiar={(v) => poner("costosVariablesTipo", v)} />
          <Numero etiqueta={d.costosVariablesTipo === "porcentaje" ? "Porcentaje (%)" : "Monto (S/)"} valor={d.costosVariablesValor} alCambiar={(v) => poner("costosVariablesValor", v)} placeholder="Ej.: 5" minimo={0} maximo={d.costosVariablesTipo === "porcentaje" ? 100 : undefined} ayuda="Escribe 0 si no pagas comisiones ni pasarela." />
        </div>
        <fieldset>
          <legend className="mb-1.5 block text-sm font-semibold">Costos fijos del período</legend>
          <ul className="space-y-2">
            {d.costosFijos.map((f, i) => (
              <EditorCostoFijo key={f.id} f={f} indice={i} alCambiar={(c) => poner("costosFijos", d.costosFijos.map((x) => (x.id === f.id ? { ...x, ...c } : x)))} alQuitar={() => poner("costosFijos", d.costosFijos.filter((x) => x.id !== f.id))} />
            ))}
          </ul>
          {d.costosFijos.length < MAX_COSTOS_FIJOS && (
            <button type="button" className="btn btn-secundario mt-2" onClick={() => poner("costosFijos", [...d.costosFijos, itemVacio(nuevoId("f"))])}>
              Agregar costo fijo
            </button>
          )}
        </fieldset>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={d.incluyeSueldo} onChange={(e) => poner("incluyeSueldo", e.target.checked)} />
          Mi propio sueldo como dueño ya está incluido en algún costo fijo de arriba
        </label>
      </Grupo>

      <Grupo icono={Coins} titulo="Otros datos (opcional)">
        <Texto etiqueta="Impuestos que conoces" valor={d.impuestosConocidos} alCambiar={(v) => poner("impuestosConocidos", v)} placeholder="Ej.: IGV incluido en los precios" ayuda="Solo para que la IA los mencione: la página no los resta del cálculo." />
        <Numero etiqueta="Objetivo de utilidad del período (S/)" valor={d.objetivoUtilidad} alCambiar={(v) => poner("objetivoUtilidad", v)} placeholder="Ej.: 1000" minimo={0} ayuda="Calcula las ventas mínimas para llegar a esa utilidad." />
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
