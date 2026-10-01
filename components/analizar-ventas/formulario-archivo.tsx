"use client";

import { useId, useRef } from "react";
import { AlertTriangle, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { Grupo } from "@/components/prompts/campo-formulario";
import { Selector, Texto } from "@/components/plan/campos";
import { almacenAnalisisVentas } from "./almacen";
import { CAMPOS_MAPEO, type CampoMapeo, type DatosAnalisisVentas, type FichaDataset } from "@/lib/analizar-ventas/tipos";

const MONEDAS = ["S/", "US$", "€", "MXN", "COP", "CLP", "ARS"].map((m) => ({ valor: m, etiqueta: m }));

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
            {c.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

function TablaFicha({ ficha }: { ficha: FichaDataset }) {
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
              <td className="max-w-[16rem] truncate p-2 text-muted-foreground" title={c.muestra.join(" | ")}>
                {c.muestra.join(", ") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  ficha: FichaDataset | null;
  hojasDisponibles: string[];
  cargando: boolean;
  error: string | null;
  onArchivo: (archivo: File) => void;
  onCambiarHoja: (nombre: string) => void;
  onQuitarArchivo: () => void;
  alBorrar: () => void;
}

export function FormularioAnalisisVentas({ ficha, hojasDisponibles, cargando, error, onArchivo, onCambiarHoja, onQuitarArchivo, alBorrar }: Props) {
  const d = almacenAnalisisVentas.useDatos();
  const modoEjemplo = almacenAnalisisVentas.useModoEjemplo();
  const idArchivo = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const poner = <K extends keyof DatosAnalisisVentas>(clave: K, valor: DatosAnalisisVentas[K]) => almacenAnalisisVentas.guardar({ ...d, [clave]: valor });
  const ponerMapeo = (campo: CampoMapeo, indice: number | null) => poner("mapeo", { ...d.mapeo, [campo]: indice });

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Tu archivo de ventas y tus datos" autoComplete="off">
      <Grupo icono={FileSpreadsheet} titulo="Tu archivo de ventas" descripcion="Se lee en tu navegador: no se sube a ningún servidor. Admite .xlsx, .xls y .csv.">
        {!ficha ? (
          <label htmlFor={idArchivo} className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground hover:border-brand-solid hover:text-foreground">
            {cargando ? <Loader2 aria-hidden className="size-6 animate-spin" /> : <Upload aria-hidden className="size-6" />}
            <span className="font-semibold">{cargando ? "Leyendo tu archivo…" : "Sube tu archivo de ventas (.xlsx, .xls o .csv)"}</span>
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
            {hojasDisponibles.length > 1 && <Selector etiqueta="Hoja" valor={ficha.hojaActiva} opciones={hojasDisponibles.map((h) => ({ valor: h, etiqueta: h }))} alCambiar={onCambiarHoja} />}
            <TablaFicha ficha={ficha} />
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
        <Grupo icono={FileSpreadsheet} titulo="Mapea tus columnas" descripcion="La página sugiere un mapeo por el nombre de cada columna: corrígelo si hace falta. Fecha e importe son obligatorios.">
          <div className="grid gap-3 sm:grid-cols-2">
            {CAMPOS_MAPEO.map((campo) => (
              <SelectorColumna key={campo.clave} campo={campo} ficha={ficha} valor={d.mapeo[campo.clave]} alCambiar={(v) => ponerMapeo(campo.clave, v)} />
            ))}
          </div>
        </Grupo>
      )}

      <Grupo icono={FileSpreadsheet} titulo="Períodos y objetivo">
        <div className="grid gap-3 sm:grid-cols-2">
          <Texto etiqueta="Moneda" valor={d.moneda} alCambiar={(v) => poner("moneda", v)} placeholder="Ej.: S/" />
          <Selector etiqueta="O elige una moneda común" valor={MONEDAS.some((m) => m.valor === d.moneda) ? d.moneda : ""} opciones={[{ valor: "", etiqueta: "(otra, escríbela arriba)" }, ...MONEDAS]} alCambiar={(v) => v && poner("moneda", v)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Texto etiqueta="Período a analizar: desde" valor={d.periodoDesde} alCambiar={(v) => poner("periodoDesde", v)} placeholder="DD/MM/AAAA" />
          <Texto etiqueta="Período a analizar: hasta" valor={d.periodoHasta} alCambiar={(v) => poner("periodoHasta", v)} placeholder="DD/MM/AAAA" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Texto etiqueta="Comparar con (desde, opcional)" valor={d.comparacionDesde} alCambiar={(v) => poner("comparacionDesde", v)} placeholder="DD/MM/AAAA" />
          <Texto etiqueta="Comparar con (hasta, opcional)" valor={d.comparacionHasta} alCambiar={(v) => poner("comparacionHasta", v)} placeholder="DD/MM/AAAA" />
        </div>
        <Texto largo etiqueta="¿Qué te preocupa? (objetivo del análisis)" valor={d.objetivo} alCambiar={(v) => poner("objetivo", v)} placeholder="Ej.: entender por qué las ventas de junio se sintieron más bajas" />
        <Texto largo etiqueta="Contexto que ya conoces (opcional)" valor={d.contexto} alCambiar={(v) => poner("contexto", v)} placeholder="Promociones, cierres, cambios de precio…" ayuda="Así la IA no inventa una causa que tú ya conoces." />
      </Grupo>

      <Grupo icono={FileSpreadsheet} titulo="¿Vas a adjuntar el archivo a tu IA?">
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["B", "No: solo enviar estructura y resumen", "Más privado. La IA recibe la ficha del archivo y las métricas, nunca tus datos fila por fila."],
              ["A", "Sí: adjuntaré el archivo original", "Para IAs con análisis de datos o ejecución de código. Tú decides si adjuntarlo; esta página nunca lo envía por ti."],
            ] as const
          ).map(([valor, etiqueta, ayuda]) => (
            <label key={valor} className={`flex min-h-11 cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm ${d.modo === valor ? "border-brand-solid bg-brand-muted" : "bg-surface"}`}>
              <span className="flex items-center gap-2 font-semibold">
                <input type="radio" name="modo-prompt" className="size-4 accent-[var(--accent)]" checked={d.modo === valor} onChange={() => poner("modo", valor)} />
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
