"use client";

import { useState } from "react";
import { AlertTriangle, Check, ClipboardCopy, Download, Plus, Sparkles, Trash2 } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { almacenHistorias } from "./almacenes";
import { HISTORIAS_CARLOS } from "@/content/ejemplos/entrevista-datos";
import { contradicciones, cobertura, historiaCompleta, historiasATexto, HISTORIAS_MAXIMO, HISTORIAS_MINIMO, historiaVacia, nombreCompetencia, nuevoIdHistoria, partesFaltantes, resultadoSinDato, textoDeHistoria } from "@/lib/entrevista/historias";
import { COMPETENCIAS, type Historia, type IdCompetencia } from "@/lib/entrevista/tipos";

interface Props {
  /** Texto del CV (y de lo que la persona destaca): sirve para detectar datos de las historias que no aparecen en el CV. */
  fuenteCv: string;
  alAviso: (texto: string, accion?: { etiqueta: string; alHacer: () => void }) => void;
  alEvento: (nombre: string) => void;
}

const CAMPOS_STAR: { clave: "situacion" | "tarea" | "accion" | "resultado"; etiqueta: string; ayuda: string }[] = [
  { clave: "situacion", etiqueta: "Situación", ayuda: "¿Dónde y cuándo ocurrió? El contexto en pocas frases." },
  { clave: "tarea", etiqueta: "Tarea", ayuda: "¿Cuál era tu responsabilidad o el problema por resolver?" },
  { clave: "accion", etiqueta: "Acción", ayuda: "Lo que hiciste TÚ, paso a paso (no lo que hizo el equipo)." },
  { clave: "resultado", etiqueta: "Resultado", ayuda: "¿Qué cambió? Si tienes un dato real, ponlo; si no, no lo inventes." },
];

function TarjetaHistoria({ historia, indice, fuenteCv, alCambiar, alQuitar }: { historia: Historia; indice: number; fuenteCv: string; alCambiar: (c: Partial<Historia>) => void; alQuitar: () => void }) {
  const faltan = partesFaltantes(historia);
  const completa = historiaCompleta(historia);
  const contra = fuenteCv.trim() ? contradicciones(fuenteCv, textoDeHistoria(historia)) : { numeros: [], nombres: [] };
  const hayContra = contra.numeros.length + contra.nombres.length > 0;
  const alternar = (id: IdCompetencia) => alCambiar({ competencias: historia.competencias.includes(id) ? historia.competencias.filter((c) => c !== id) : [...historia.competencias, id] });

  return (
    <li className="tarjeta space-y-3 p-4" data-historia>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Historia {indice + 1} {completa ? <span className="ml-1 rounded-full bg-ok-muted px-2 py-0.5 text-xs font-bold text-ok">completa</span> : <span className="ml-1 rounded-full bg-warn-muted px-2 py-0.5 text-xs font-bold text-warn">faltan: {faltan.join(", ") || "título"}</span>}
        </p>
        <button type="button" className="btn btn-texto -mr-2" onClick={alQuitar} aria-label={`Quitar la historia ${indice + 1}${historia.titulo ? `: ${historia.titulo}` : ""}`}>
          <Trash2 aria-hidden className="size-4" /> Quitar
        </button>
      </div>
      <div>
        <label htmlFor={`h-titulo-${historia.id}`} className="mb-1.5 block text-sm font-semibold">
          Título de la historia
        </label>
        <input id={`h-titulo-${historia.id}`} className="campo" value={historia.titulo} onChange={(e) => alCambiar({ titulo: e.target.value })} placeholder="Ej.: La caída del servicio de pagos" />
      </div>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">Competencias que demuestra</legend>
        <div className="flex flex-wrap gap-2">
          {COMPETENCIAS.map((c) => (
            <label key={c.id} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm transition-colors ${historia.competencias.includes(c.id) ? "border-brand-solid bg-brand-muted font-semibold" : "hover:bg-surface"}`}>
              <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={historia.competencias.includes(c.id)} onChange={() => alternar(c.id)} />
              {c.nombre}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 md:grid-cols-2">
        {CAMPOS_STAR.map((c) => (
          <div key={c.clave}>
            <label htmlFor={`h-${c.clave}-${historia.id}`} className="mb-1.5 block text-sm font-semibold">
              {c.etiqueta}
            </label>
            <textarea id={`h-${c.clave}-${historia.id}`} aria-describedby={`h-${c.clave}-${historia.id}-ayuda`} className="campo min-h-24" value={historia[c.clave]} onChange={(e) => alCambiar({ [c.clave]: e.target.value })} />
            <p id={`h-${c.clave}-${historia.id}-ayuda`} className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {c.ayuda}
            </p>
          </div>
        ))}
      </div>
      <div role="status" aria-live="polite" className="space-y-2">
        {resultadoSinDato(historia) && (
          <p className="flex gap-2 rounded-lg border bg-surface p-3 text-sm" data-aviso-sin-dato>
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
            <span>El resultado no trae ninguna cifra. ¿Puedes respaldarlo con un dato real (cantidad, tiempo, resultado concreto)? Si no lo tienes, cuéntalo tal cual, sin inventarlo.</span>
          </p>
        )}
        {hayContra && (
          <p className="flex gap-2 rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm" data-aviso-contradiccion>
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
            <span>
              Esta historia menciona datos que no aparecen en tu CV: <strong className="font-semibold">{[...contra.numeros, ...contra.nombres].join(", ")}</strong>. Confirma que coincidan con tu CV o prepárate para explicar la diferencia.
            </span>
          </p>
        )}
      </div>
    </li>
  );
}

/**
 * Banco personal de historias STAR: 5 a 7 historias bien contadas cubren la mayoría de las preguntas conductuales. Se guarda en el
 * navegador; los ejemplos nunca se guardan. Se exporta a Word o se copia como texto.
 */
export function HistoriasStar({ fuenteCv, alAviso, alEvento }: Props) {
  const { historias } = almacenHistorias.useDatos();
  const modoEjemplo = almacenHistorias.useModoEjemplo();
  const [confirmando, setConfirmando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [exportando, setExportando] = useState(false);
  const completas = historias.filter(historiaCompleta).length;
  const cob = cobertura(historias);

  const guardar = (h: Historia[]) => almacenHistorias.guardar({ historias: h });
  const cambiar = (id: string, c: Partial<Historia>) => guardar(historias.map((h) => (h.id === id ? { ...h, ...c } : h)));

  function cargarEjemplo() {
    const habia = almacenHistorias.hayDatosDeLaPersona({ historias });
    const previo = almacenHistorias.cargarEjemplo({ historias: HISTORIAS_CARLOS });
    setConfirmando(false);
    alEvento("ejemplo_rellenado");
    alAviso(
      "Historias de ejemplo cargadas (ficticias).",
      habia
        ? {
            etiqueta: "Deshacer",
            alHacer: () => {
              almacenHistorias.deshacerEjemplo(previo);
              alAviso("Recuperé tus historias.");
            },
          }
        : undefined,
    );
  }

  function pedirEjemplo() {
    if (almacenHistorias.hayDatosDeLaPersona({ historias })) setConfirmando(true);
    else cargarEjemplo();
  }

  function limpiar() {
    almacenHistorias.borrar();
    alEvento("ejemplo_limpiado");
    alAviso("Historias borradas.");
  }

  async function exportar() {
    setExportando(true);
    try {
      const { construirDocumentoSecciones, seccionesDeHistorias, descargarDocumento } = await import("@/lib/entrevista/docx");
      const doc = await construirDocumentoSecciones(
        "Mis historias STAR",
        seccionesDeHistorias(historias.map((h) => ({ ...h, competencias: h.competencias.map(nombreCompetencia) }))),
        modoEjemplo ? "EJEMPLO ILUSTRATIVO: historias ficticias." : "Historias preparadas con guiapromptsia.com. Revisa que cada dato coincida con tu CV.",
      );
      await descargarDocumento(doc, modoEjemplo ? "historias-STAR-ejemplo.docx" : "mis-historias-STAR.docx");
      if (modoEjemplo) alEvento("ejemplo_descargado");
      alAviso(modoEjemplo ? "Descargado: historias-STAR-ejemplo.docx" : "Historias descargadas en Word.");
    } catch {
      alAviso("No se pudo crear el archivo Word. Recarga la página e inténtalo de nuevo.");
    } finally {
      setExportando(false);
    }
  }

  async function copiar() {
    if (await copiarTexto(historiasATexto(historias))) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
      alAviso("Historias copiadas como texto.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Cada historia sigue el método STAR (Situación, Tarea, Acción, Resultado). Con {HISTORIAS_MINIMO} a {HISTORIAS_MAXIMO} historias sólidas puedes responder muchas preguntas distintas, adaptando el énfasis en lugar de memorizar respuestas.
          </p>
        </div>
        <div className="sm:w-60 sm:shrink-0">
          <button type="button" className="btn btn-secundario w-full" onClick={pedirEjemplo} aria-label="Llenar con datos de ejemplo (historias STAR)">
            <Sparkles aria-hidden className="size-4 text-brand" /> Llenar con datos de ejemplo
          </button>
        </div>
      </div>

      {confirmando && (
        <div role="group" aria-label="Confirmación" className="aparecer rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm">
          <p className="font-medium">¿Reemplazar tus historias con las de ejemplo?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primario" onClick={cargarEjemplo} autoFocus>
              Reemplazar
            </button>
            <button type="button" className="btn btn-secundario" onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {modoEjemplo && (
        <div role="note" data-aviso-ejemplo-historias className="flex flex-col gap-3 rounded-lg border bg-brand-muted p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong className="font-semibold">Estás viendo historias de ejemplo</strong> (ficticias, de un desarrollador backend). No se guardan en tu navegador.
          </p>
          <button type="button" className="btn btn-primario" onClick={limpiar}>
            Limpiar historias
          </button>
        </div>
      )}

      <div className="rounded-lg border bg-surface p-4" data-cobertura>
        <p className="text-sm font-semibold tabular">
          Historias completas: {completas} de {HISTORIAS_MINIMO}–{HISTORIAS_MAXIMO}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Competencias que cubren tus historias completas (las ocho que enumera la guía de Harvard citada al final de la página):</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {COMPETENCIAS.map((c) => {
            const ok = cob.cubiertas.includes(c.id);
            return (
              <li key={c.id} className={`rounded-full border px-2.5 py-1 text-xs ${ok ? "border-ok/50 bg-ok-muted font-semibold text-ok" : "text-muted-foreground"}`}>
                {ok ? "✓ " : ""}
                {c.nombre}
                <span className="sr-only">{ok ? " (cubierta)" : " (te falta)"}</span>
              </li>
            );
          })}
        </ul>
        {historias.length > HISTORIAS_MAXIMO && <p className="mt-2 text-xs text-warn">Tienes más de {HISTORIAS_MAXIMO} historias: son difíciles de recordar. Quédate con las mejores.</p>}
      </div>

      {historias.length === 0 ? (
        <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">Todavía no tienes historias. Agrega la primera o usa «Llenar con datos de ejemplo» para ver cómo se completan.</p>
      ) : (
        <ul className="space-y-3">
          {historias.map((h, i) => (
            <TarjetaHistoria key={h.id} historia={h} indice={i} fuenteCv={fuenteCv} alCambiar={(c) => cambiar(h.id, c)} alQuitar={() => guardar(historias.filter((x) => x.id !== h.id))} />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-secundario" onClick={() => guardar([...historias, historiaVacia(nuevoIdHistoria())])}>
          <Plus aria-hidden className="size-4" /> Agregar historia
        </button>
        <button type="button" className="btn btn-secundario" onClick={exportar} disabled={historias.length === 0 || exportando}>
          <Download aria-hidden className="size-4" /> {exportando ? "Creando el archivo…" : "Exportar a Word (.docx)"}
        </button>
        <button type="button" className="btn btn-secundario" onClick={copiar} disabled={historias.length === 0}>
          {copiado ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
          {copiado ? "Copiado" : "Copiar como texto"}
        </button>
        {historias.length > 0 && !modoEjemplo && (
          <button
            type="button"
            className="btn btn-texto"
            onClick={() => {
              if (window.confirm("¿Borrar todas tus historias? No se puede deshacer.")) limpiar();
            }}
          >
            Borrar mis historias
          </button>
        )}
      </div>
    </div>
  );
}
