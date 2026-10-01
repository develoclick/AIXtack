"use client";

import { useId, useRef, useState } from "react";
import { AlertTriangle, FileSpreadsheet, Loader2, Table2, Upload, X } from "lucide-react";
import { Grupo } from "@/components/prompts/campo-formulario";
import { Selector, Texto } from "@/components/plan/campos";
import { almacenConvertirGraficos } from "./almacen";
import { validarSeleccion } from "@/lib/convertir-graficos/asistente";
import { AGREGACIONES, AUDIENCIAS, OBJETIVOS, type DatosConvertirGraficos, type FichaDataset } from "@/lib/convertir-graficos/tipos";

function SelectorColumna({ etiqueta, obligatorio, opcional, ficha, valor, alCambiar }: { etiqueta: string; obligatorio?: boolean; opcional?: boolean; ficha: FichaDataset; valor: number | null; alCambiar: (v: number | null) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">
        {etiqueta}
        {obligatorio && (
          <span aria-hidden className="ml-1 text-destructive">
            *
          </span>
        )}
        {opcional && <span className="font-normal text-muted-foreground"> (opcional)</span>}
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

interface Props {
  ficha: FichaDataset | null;
  cargando: boolean;
  error: string | null;
  onArchivo: (archivo: File) => void;
  onPegar: (texto: string) => void;
  onQuitar: () => void;
  alBorrar: () => void;
}

export function FormularioDatosGraficos({ ficha, cargando, error, onArchivo, onPegar, onQuitar, alBorrar }: Props) {
  const d = almacenConvertirGraficos.useDatos();
  const modoEjemplo = almacenConvertirGraficos.useModoEjemplo();
  const idArchivo = useId();
  const [textoPegado, setTextoPegado] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const poner = <K extends keyof DatosConvertirGraficos>(clave: K, valor: DatosConvertirGraficos[K]) => almacenConvertirGraficos.guardar({ ...d, [clave]: valor });
  const ponerSeleccion = (campo: "x" | "y" | "color", indice: number | null) => poner("seleccion", { ...d.seleccion, [campo]: indice });

  const colX = ficha && d.seleccion.x !== null ? (ficha.columnas.find((c) => c.indice === d.seleccion.x) ?? null) : null;
  const colY = ficha && d.seleccion.y !== null ? (ficha.columnas.find((c) => c.indice === d.seleccion.y) ?? null) : null;
  const objetivoActual = OBJETIVOS.find((o) => o.valor === d.objetivo)!;
  const problemas = ficha ? validarSeleccion(objetivoActual.valor === "distribuir" ? "histograma" : objetivoActual.valor === "relacionar" ? "dispersion" : objetivoActual.valor === "evolucionar" ? "lineas" : objetivoActual.valor === "componer" ? "pastel" : "barras", colX, colY, d.agregacion === "conteo") : [];

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Tus datos y tu objetivo" autoComplete="off">
      <Grupo icono={FileSpreadsheet} titulo="Tu tabla" descripcion="Pega tu tabla (desde Excel o Sheets) o sube un archivo. Se procesa en tu navegador: no se sube a ningún servidor.">
        {!ficha ? (
          <div className="space-y-3">
            <label htmlFor={idArchivo} className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-5 text-center text-sm text-muted-foreground hover:border-brand-solid hover:text-foreground">
              {cargando ? <Loader2 aria-hidden className="size-6 animate-spin" /> : <Upload aria-hidden className="size-6" />}
              <span className="font-semibold">{cargando ? "Leyendo tu archivo…" : "Sube tu archivo (.xlsx, .xls o .csv)"}</span>
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> o pega tu tabla <span className="h-px flex-1 bg-border" />
            </div>
            <textarea
              className="campo min-h-32 font-mono text-xs"
              aria-label="Pega aquí tu tabla"
              placeholder={"Pega aquí tu tabla, copiada de Excel o Sheets (con encabezado)\nfecha\ttienda\tventas\n01/01/2026\tNorte\t1000"}
              value={textoPegado}
              onChange={(e) => setTextoPegado(e.target.value)}
              spellCheck={false}
            />
            <button type="button" className="btn btn-secundario w-full" disabled={!textoPegado.trim()} onClick={() => onPegar(textoPegado)}>
              <Table2 aria-hidden className="size-4" /> Usar esta tabla
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-surface p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{ficha.archivo}</p>
              <p className="text-xs text-muted-foreground">
                {ficha.totalFilas} fila(s) de datos, {ficha.columnas.length} columna(s){ficha.truncado ? " (se recortó: el archivo traía más)" : ""}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-texto"
              onClick={() => {
                onQuitar();
                setTextoPegado("");
              }}
            >
              <X aria-hidden className="size-4" /> Quitar
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
      </Grupo>

      <Grupo icono={FileSpreadsheet} titulo="Tu objetivo" descripcion="¿Qué pregunta quieres responder? De esto depende el tipo de gráfico que te conviene.">
        <Selector etiqueta="Objetivo" valor={d.objetivo} opciones={OBJETIVOS.map((o) => ({ valor: o.valor, etiqueta: `${o.etiqueta} — ${o.pregunta}` }))} alCambiar={(v) => poner("objetivo", v)} obligatorio />
        <div className="grid gap-3 sm:grid-cols-2">
          <Selector etiqueta="Audiencia" valor={d.audiencia} opciones={AUDIENCIAS.map((a) => ({ valor: a.valor, etiqueta: a.etiqueta }))} alCambiar={(v) => poner("audiencia", v)} />
          <Selector etiqueta="Agregación" valor={d.agregacion} opciones={AGREGACIONES.map((a) => ({ valor: a.valor, etiqueta: a.etiqueta }))} alCambiar={(v) => poner("agregacion", v)} ayuda="«Conteo» no necesita columna Y." />
        </div>
        <Texto etiqueta="Unidad o moneda (opcional)" valor={d.unidad} alCambiar={(v) => poner("unidad", v)} placeholder="Ej.: S/, %, kg" />
      </Grupo>

      {ficha && (
        <Grupo icono={Table2} titulo="Columnas del gráfico local" descripcion="Elige qué columnas usar para ver un gráfico inmediato, calculado en tu navegador.">
          <div className="grid gap-3 sm:grid-cols-3">
            <SelectorColumna etiqueta="Eje X" obligatorio ficha={ficha} valor={d.seleccion.x} alCambiar={(v) => ponerSeleccion("x", v)} />
            <SelectorColumna etiqueta="Eje Y" opcional={d.agregacion === "conteo"} obligatorio={d.agregacion !== "conteo"} ficha={ficha} valor={d.seleccion.y} alCambiar={(v) => ponerSeleccion("y", v)} />
            <SelectorColumna etiqueta="Color (series)" opcional ficha={ficha} valor={d.seleccion.color} alCambiar={(v) => ponerSeleccion("color", v)} />
          </div>
          {problemas.length > 0 && (
            <ul className="space-y-1 text-xs text-warn">
              {problemas.map((p) => (
                <li key={p.mensaje} className="flex items-start gap-1.5">
                  <AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  {p.mensaje}
                </li>
              ))}
            </ul>
          )}
        </Grupo>
      )}

      <Grupo icono={FileSpreadsheet} titulo="¿Vas a adjuntar el archivo a tu IA?">
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["B", "No: solo enviar estructura y resumen", "Más privado. La IA recibe la ficha de tu tabla, nunca tus filas."],
              ["A", "Sí: adjuntaré el archivo original", "Para IAs con análisis de datos o ejecución de código. Tú decides si adjuntarlo."],
            ] as const
          ).map(([valor, etiqueta, ayuda]) => (
            <label key={valor} className={`flex min-h-11 cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm ${d.modo === valor ? "border-brand-solid bg-brand-muted" : "bg-surface"}`}>
              <span className="flex items-center gap-2 font-semibold">
                <input type="radio" name="modo-prompt-graficos" className="size-4 accent-[var(--accent)]" checked={d.modo === valor} onChange={() => poner("modo", valor)} />
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
            if (modoEjemplo || window.confirm("¿Borrar tus datos y quitar la tabla? No se puede deshacer.")) {
              alBorrar();
              setTextoPegado("");
            }
          }}
        >
          Borrar mis datos
        </button>
        <span>{modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Lo que eliges se guarda solo en tu navegador (la tabla, nunca)."}</span>
      </div>
    </form>
  );
}
