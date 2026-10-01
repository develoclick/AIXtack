"use client";

import { useId, useRef } from "react";
import { AlertTriangle, FileSpreadsheet, Loader2, Plus, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import { Grupo } from "@/components/prompts/campo-formulario";
import { Selector, Texto } from "@/components/plan/campos";
import { almacenSegmentarClientes } from "./almacen";
import { CAMPOS_MAPEO, CLAVES_SEGMENTO_RFM, reglaVacia, type CampoMapeo, type DatosSegmentarClientes, type FichaDataset, type ReglaSegmento } from "@/lib/segmentar-clientes/tipos";

function SelectorColumna({ campo, ficha, valor, alCambiar }: { campo: (typeof CAMPOS_MAPEO)[number]; ficha: FichaDataset; valor: number | null; alCambiar: (v: number | null) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">
        {campo.etiqueta}
        {campo.obligatorio && (
          <span aria-hidden className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>
      <select id={id} className="campo text-sm" value={valor ?? ""} onChange={(e) => alCambiar(e.target.value === "" ? null : Number(e.target.value))}>
        <option value="">No usar</option>
        {ficha.columnas.map((c) => (
          <option key={c.indice} value={c.indice}>
            {c.nombre} ({c.tipo})
          </option>
        ))}
      </select>
    </div>
  );
}

function TablaFicha({ ficha, indiceClienteId }: { ficha: FichaDataset; indiceClienteId: number | null }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[34rem] text-left text-xs">
        <thead className="bg-surface">
          <tr>
            {["Columna", "Tipo", "% vacío", "Únicos", "Muestra"].map((h) => (
              <th key={h} className="p-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {ficha.columnas.map((c) => (
            <tr key={c.indice}>
              <td className="p-2 font-medium">{c.nombre}</td>
              <td className="p-2 text-muted-foreground">{c.tipo}</td>
              <td className="p-2 tabular text-muted-foreground">{c.pctVacios}%</td>
              <td className="p-2 tabular text-muted-foreground">{c.valoresUnicos}</td>
              <td className="max-w-[16rem] truncate p-2 text-muted-foreground" title={c.indice === indiceClienteId ? "Oculto por privacidad" : c.muestra.join(" | ")}>
                {c.indice === indiceClienteId ? "(oculto: ID de cliente)" : c.muestra.join(", ") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CampoNumero({ etiqueta, valor, alCambiar }: { etiqueta: string; valor: string; alCambiar: (v: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-muted-foreground">
        {etiqueta}
      </label>
      <input id={id} type="text" inputMode="decimal" className="campo text-sm" value={valor} onChange={(e) => alCambiar(e.target.value)} placeholder="no usar" />
    </div>
  );
}

function FilaRegla({ regla, alCambiar, alQuitar }: { regla: ReglaSegmento; alCambiar: (r: ReglaSegmento) => void; alQuitar: () => void }) {
  const cambiar = <K extends keyof ReglaSegmento>(k: K, v: ReglaSegmento[K]) => alCambiar({ ...regla, [k]: v });
  return (
    <div className="rounded-lg border bg-surface p-3">
      <div className="flex items-center gap-2">
        <input type="text" className="campo flex-1 font-semibold" value={regla.nombre} onChange={(e) => cambiar("nombre", e.target.value)} placeholder="Nombre del segmento (ej.: Clientes VIP)" />
        <button type="button" className="flex size-9 shrink-0 items-center justify-center rounded-md text-destructive hover:bg-destructive/10" aria-label={`Quitar la regla «${regla.nombre || "sin nombre"}»`} onClick={alQuitar}>
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Deja un campo vacío para no usarlo como condición. Un cliente entra en la primera regla (de arriba hacia abajo) que cumple todas sus condiciones.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <CampoNumero etiqueta="Gasto mínimo" valor={regla.gastoMin} alCambiar={(v) => cambiar("gastoMin", v)} />
        <CampoNumero etiqueta="Gasto máximo" valor={regla.gastoMax} alCambiar={(v) => cambiar("gastoMax", v)} />
        <div />
        <CampoNumero etiqueta="Última compra: hace al menos (días)" valor={regla.recenciaMinDias} alCambiar={(v) => cambiar("recenciaMinDias", v)} />
        <CampoNumero etiqueta="Última compra: hace como máximo (días)" valor={regla.recenciaMaxDias} alCambiar={(v) => cambiar("recenciaMaxDias", v)} />
        <div />
        <CampoNumero etiqueta="Pedidos mínimos" valor={regla.pedidosMin} alCambiar={(v) => cambiar("pedidosMin", v)} />
        <CampoNumero etiqueta="Pedidos máximos" valor={regla.pedidosMax} alCambiar={(v) => cambiar("pedidosMax", v)} />
      </div>
    </div>
  );
}

interface Props {
  ficha: FichaDataset | null;
  sugerenciaTransacciones: boolean | null;
  cargando: boolean;
  error: string | null;
  onArchivo: (archivo: File) => void;
  onQuitarArchivo: () => void;
  alBorrar: () => void;
}

export function FormularioSegmentarClientes({ ficha, sugerenciaTransacciones, cargando, error, onArchivo, onQuitarArchivo, alBorrar }: Props) {
  const d = almacenSegmentarClientes.useDatos();
  const modoEjemplo = almacenSegmentarClientes.useModoEjemplo();
  const idArchivo = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const poner = <K extends keyof DatosSegmentarClientes>(clave: K, valor: DatosSegmentarClientes[K]) => almacenSegmentarClientes.guardar({ ...d, [clave]: valor });
  const ponerMapeo = (campo: CampoMapeo, indice: number | null) => poner("mapeo", { ...d.mapeo, [campo]: indice });

  const reglasValidas = d.reglas.filter((r) => r.nombre.trim()).length;

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Tu archivo y tus reglas de segmentación" autoComplete="off">
      <Grupo icono={FileSpreadsheet} titulo="Tu archivo de clientes o ventas" descripcion="Se lee en tu navegador: no se sube a ningún servidor. Admite .xlsx, .xls y .csv.">
        {!ficha ? (
          <label htmlFor={idArchivo} className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground hover:border-brand-solid hover:text-foreground">
            {cargando ? <Loader2 aria-hidden className="size-6 animate-spin" /> : <Upload aria-hidden className="size-6" />}
            <span className="font-semibold">{cargando ? "Leyendo tu archivo…" : "Sube tu archivo (.xlsx, .xls o .csv)"}</span>
            <span className="text-xs">Se queda en tu navegador: no se sube a ningún servidor.</span>
            <input
              ref={inputRef}
              id={idArchivo}
              type="file"
              accept=".xlsx,.xls,.csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onArchivo(f);
                e.target.value = "";
              }}
            />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-surface p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{ficha.archivo}</p>
                <p className="text-xs text-muted-foreground">
                  {ficha.totalFilas} fila(s) de datos{ficha.truncado ? " (se recortó: el archivo traía más)" : ""}
                </p>
              </div>
              <button type="button" className="btn btn-texto" onClick={onQuitarArchivo}>
                <X aria-hidden className="size-4" /> Quitar
              </button>
            </div>
            <TablaFicha ficha={ficha} indiceClienteId={d.mapeo.clienteId} />
          </div>
        )}
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
      </Grupo>

      {ficha && (
        <Grupo icono={FileSpreadsheet} titulo="Mapea tus columnas" descripcion="La página sugiere un mapeo por el nombre de cada columna: corrígelo si hace falta. Solo el ID de cliente es obligatorio.">
          <div className="grid gap-3 sm:grid-cols-2">
            {CAMPOS_MAPEO.map((campo) => (
              <SelectorColumna key={campo.clave} campo={campo} ficha={ficha} valor={d.mapeo[campo.clave]} alCambiar={(v) => ponerMapeo(campo.clave, v)} />
            ))}
          </div>

          <fieldset>
            <legend className="mb-1 text-xs font-semibold">¿Cada fila es una compra o ya es un cliente?</legend>
            {sugerenciaTransacciones !== null && (
              <p className="mb-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brand" />
                {sugerenciaTransacciones ? "El ID de cliente se repite en varias filas: parece un archivo de transacciones." : "El ID de cliente no se repite: parece un archivo ya resumido por cliente."} Tú decides cuál usar.
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["transacciones", "Una fila por COMPRA", "La página agrega por cliente: última compra, nº de pedidos y gasto total."],
                  ["clientes", "Una fila por CLIENTE", "Tu archivo ya trae un resumen: usa directamente la columna de pedidos."],
                ] as const
              ).map(([valor, etiqueta, ayuda]) => (
                <label key={valor} className={`flex min-h-11 cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm ${d.origenDatos === valor ? "border-brand-solid bg-brand-muted" : "bg-surface"}`}>
                  <span className="flex items-center gap-2 font-semibold">
                    <input type="radio" name="origen-datos" className="size-4 accent-[var(--accent)]" checked={d.origenDatos === valor} onChange={() => poner("origenDatos", valor)} />
                    {etiqueta}
                  </span>
                  <span className="text-xs text-muted-foreground">{ayuda}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </Grupo>
      )}

      <Grupo icono={FileSpreadsheet} titulo="Fecha de referencia y tamaño mínimo">
        <div className="grid gap-3 sm:grid-cols-2">
          <Texto etiqueta="Fecha de referencia para la recencia" tipo="date" obligatorio valor={d.fechaReferencia} alCambiar={(v) => poner("fechaReferencia", v)} ayuda="Desde aquí se cuentan los días desde la última compra de cada cliente." />
          <Texto etiqueta="Tamaño mínimo de segmento" valor={d.tamanoMinimoSegmento} alCambiar={(v) => poner("tamanoMinimoSegmento", v)} placeholder="Ej.: 20" ayuda="Esta página avisa si un segmento queda por debajo." />
        </div>
        <Texto etiqueta="Tipo de negocio (opcional)" valor={d.negocio} alCambiar={(v) => poner("negocio", v)} placeholder="Ej.: tienda de ropa con venta online y en local" />
      </Grupo>

      <Grupo icono={FileSpreadsheet} titulo="Método de segmentación">
        <Selector etiqueta="Método" valor={d.metodo} opciones={[{ valor: "rfm", etiqueta: "RFM (recencia, frecuencia, valor) — calculado por quintiles" }, { valor: "reglas", etiqueta: "Reglas personalizadas" }]} alCambiar={(v) => poner("metodo", v)} />

        {d.metodo === "rfm" ? (
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Nombres de los segmentos (opcional, puedes renombrarlos)</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CLAVES_SEGMENTO_RFM.map((clave) => (
                <input key={clave} type="text" className="campo text-sm" value={d.nombresRfm[clave]} onChange={(e) => poner("nombresRfm", { ...d.nombresRfm, [clave]: e.target.value || d.nombresRfm[clave] })} aria-label={`Nombre del segmento «${clave}»`} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {reglasValidas} de {d.reglas.length} regla(s) con nombre (las reglas sin nombre no se usan). Los clientes que no cumplan ninguna regla quedan en «Sin segmento».
            </p>
            {d.reglas.map((r, i) => (
              <FilaRegla
                key={r.id}
                regla={r}
                alCambiar={(nueva) =>
                  poner(
                    "reglas",
                    d.reglas.map((x, j) => (j === i ? nueva : x)),
                  )
                }
                alQuitar={() => poner("reglas", d.reglas.filter((_, j) => j !== i))}
              />
            ))}
            {d.reglas.length < 10 && (
              <button type="button" className="btn btn-secundario" onClick={() => poner("reglas", [...d.reglas, reglaVacia(`r${Date.now()}`)])}>
                <Plus aria-hidden className="size-4" /> Agregar otra regla
              </button>
            )}
          </div>
        )}
      </Grupo>

      <Grupo icono={FileSpreadsheet} titulo="¿Vas a adjuntar el archivo a tu IA?">
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["B", "No: solo enviar estructura y resumen", "Más privado. La IA recibe la ficha y la tabla de segmentos, nunca tus clientes uno por uno."],
              ["A", "Sí: adjuntaré el archivo original", "Para IAs con análisis de datos o ejecución de código. Tú decides si adjuntarlo; recuerda anonimizar el ID antes."],
            ] as const
          ).map(([valor, etiqueta, ayuda]) => (
            <label key={valor} className={`flex min-h-11 cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm ${d.modo === valor ? "border-brand-solid bg-brand-muted" : "bg-surface"}`}>
              <span className="flex items-center gap-2 font-semibold">
                <input type="radio" name="modo-prompt-segmentar" className="size-4 accent-[var(--accent)]" checked={d.modo === valor} onChange={() => poner("modo", valor)} />
                {etiqueta}
              </span>
              <span className="text-xs text-muted-foreground">{ayuda}</span>
            </label>
          ))}
        </div>
      </Grupo>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <button
          type="button"
          className="btn btn-texto"
          onClick={() => {
            if (modoEjemplo || window.confirm("¿Borrar tus datos y quitar el archivo? No se puede deshacer.")) alBorrar();
          }}
        >
          Borrar mis datos
        </button>
        <span>{modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Lo que escribes se guarda solo en tu navegador (el archivo, nunca)."}</span>
      </div>
    </form>
  );
}
