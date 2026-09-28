"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BellRing, Check, ClipboardCopy, Download, Plus, RefreshCw, Sparkles, Trash2, Upload, X } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import type { ToastDatos } from "@/components/prompts/cv/aviso-toast";
import { Pestanas } from "@/components/entrevista/pestanas";
import { almacenRegistro } from "./almacen";
import { Numero, Selector, Texto } from "./campos";
import { descargar } from "./descargar";
import { EmbudoVista } from "./embudo-vista";
import { RevisionQuincenal } from "./revision-quincenal";
import { EJEMPLOS_PLAN } from "@/content/ejemplos/plan-busqueda";
import { registrarEvento } from "@/lib/analitica";
import { fechaUtc, sumarDias } from "@/lib/plan/calendario";
import { aCsv, aTabla, alertas, CANALES, claveDeDuplicado, diasParaAlerta, ESTADOS, etiquetaCanal, etiquetaEstado, HASTAS, importarCsv, postulacionVacia, type Alerta, type DatosRegistro, type Postulacion } from "@/lib/plan/registro";
import { nuevoId } from "@/lib/plan/tipos";

const HERRAMIENTA = "crear-plan-de-busqueda-de-empleo";
const p2 = (n: number) => String(n).padStart(2, "0");
const hoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
};
const sinSuscripcion = () => () => {};

/** Fecha de hoy (AAAA-MM-DD) en el navegador. En el servidor y en la primera pintura es «» para que no haya diferencias al hidratar. */
export function useHoy(): string {
  return useSyncExternalStore(sinSuscripcion, hoyLocal, () => "");
}

type IdPestana = "registro" | "embudo" | "seguimientos" | "revision";

interface Props {
  alAviso: (texto: string, accion?: ToastDatos["accion"]) => void;
  alCopiarRevision: () => void;
}

function EditorPostulacion({ p, alCambiar, hoy }: { p: Postulacion; alCambiar: (c: Partial<Postulacion>) => void; hoy: string }) {
  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Texto etiqueta="Empresa" obligatorio valor={p.empresa} alCambiar={(v) => alCambiar({ empresa: v })} placeholder="Ej.: Comercial Aurora" />
        <Texto etiqueta="Puesto" obligatorio valor={p.puesto} alCambiar={(v) => alCambiar({ puesto: v })} placeholder="Ej.: Asistente administrativa" />
        <div>
          <Texto etiqueta="Fecha de postulación" obligatorio tipo="date" valor={p.fecha} alCambiar={(v) => alCambiar({ fecha: v })} />
          {hoy !== "" && p.fecha !== hoy && (
            <button type="button" className="btn btn-texto mt-1" onClick={() => alCambiar({ fecha: hoy })}>
              Usar la fecha de hoy
            </button>
          )}
        </div>
        <Selector etiqueta="Canal" valor={p.canal} opciones={CANALES} alCambiar={(v) => alCambiar({ canal: v })} />
        <Texto etiqueta="Versión de CV que enviaste" valor={p.cv} alCambiar={(v) => alCambiar({ cv: v })} placeholder="Ej.: A, B o General" ayuda="Con la versión sabrás cuál recibe más respuestas." />
        <Selector etiqueta="Estado" valor={p.estado} opciones={ESTADOS} alCambiar={(v) => alCambiar({ estado: v, hasta: v === "rechazo" ? p.hasta : "" })} />
        {p.estado === "rechazo" && <Selector etiqueta="¿Hasta dónde llegó antes del rechazo?" valor={p.hasta} opciones={HASTAS} alCambiar={(v) => alCambiar({ hasta: v })} ayuda="Sirve para contar bien tus entrevistas." />}
        <Texto etiqueta="Fecha de seguimiento" tipo="date" valor={p.seguimiento} alCambiar={(v) => alCambiar({ seguimiento: v })} ayuda="Opcional: te avisamos cuando llegue." />
        <Texto etiqueta="Resultado" valor={p.resultado} alCambiar={(v) => alCambiar({ resultado: v })} placeholder="Ej.: entrevista agendada" />
      </div>
      <Texto largo etiqueta="Observaciones" valor={p.notas} alCambiar={(v) => alCambiar({ notas: v })} placeholder="Ej.: qué destaqué en el CV, con quién hablé…" />
    </div>
  );
}

function NuevaPostulacion({ hoy, alAgregar }: { hoy: string; alAgregar: (p: Postulacion) => void }) {
  const [borrador, setBorrador] = useState<Postulacion>(() => postulacionVacia("nuevo"));
  const listo = borrador.empresa.trim() !== "" && borrador.puesto.trim() !== "" && fechaUtc(borrador.fecha) !== null;
  return (
    <div className="tarjeta p-4" data-nueva-postulacion>
      <h3 className="text-base font-semibold">Anotar una postulación</h3>
      <p className="mt-1 text-sm text-muted-foreground">Regístrala el mismo día que postulas. Con cada dato, tu embudo se vuelve más útil.</p>
      <EditorPostulacion p={borrador} alCambiar={(c) => setBorrador((b) => ({ ...b, ...c }))} hoy={hoy} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primario"
          disabled={!listo}
          onClick={() => {
            alAgregar({ ...borrador, id: nuevoId("p"), empresa: borrador.empresa.trim(), puesto: borrador.puesto.trim(), cv: borrador.cv.trim() });
            setBorrador(postulacionVacia("nuevo"));
          }}
        >
          <Plus aria-hidden className="size-4" /> Agregar al registro
        </button>
        {!listo && <p className="text-xs text-muted-foreground">Faltan la empresa, el puesto o una fecha de postulación válida.</p>}
      </div>
    </div>
  );
}

const mensajeSeguimiento = (a: Alerta, fecha: string) =>
  `Asunto: Seguimiento de mi postulación a ${a.puesto}\nHola [Nombre]:\nPostulé el ${fecha} al puesto de ${a.puesto} en ${a.empresa} y quería confirmar que mi postulación llegó bien. Mi interés en la vacante continúa. Quedo a la espera de cualquier información.\nSaludos,\n[Tu nombre]`;

/** Registro de postulaciones: tu tracker, guardado solo en tu navegador, con embudo, seguimientos y la revisión quincenal. */
export function RegistroPostulaciones({ alAviso, alCopiarRevision }: Props) {
  const registro = almacenRegistro.useDatos();
  const modoEjemplo = almacenRegistro.useModoEjemplo();
  const hoy = useHoy();
  const [pestana, setPestana] = useState<IdPestana>("registro");
  const [indice, setIndice] = useState(0);
  const [pendiente, setPendiente] = useState<number | null>(null);
  const [avisoCerrado, setAvisoCerrado] = useState(false);
  const [importacion, setImportacion] = useState<{ ok: boolean; texto: string; omitidas: string[] } | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const ejemploCargado = useRef<{ datos: DatosRegistro; iniciado: boolean } | null>(null);

  const perfil = EJEMPLOS_PLAN[indice];
  const items = useMemo(() => [...registro.items].sort((a, b) => b.fecha.localeCompare(a.fecha)), [registro.items]);
  const dias = diasParaAlerta(registro);
  const avisos = useMemo(() => alertas(registro.items, hoy, dias), [registro.items, hoy, dias]);

  // «datos_propios_iniciados»: la persona cambia algo después de ver el ejemplo (una vez por ejemplo cargado).
  useEffect(() => {
    const ej = ejemploCargado.current;
    if (!modoEjemplo || !ej || ej.iniciado || ej.datos === registro) return;
    ej.iniciado = true;
    registrarEvento("datos_propios_iniciados", { herramienta: HERRAMIENTA, perfil: perfil.id, paso: "registro" });
  }, [registro, modoEjemplo, perfil.id]);

  const guardar = useCallback((nuevos: Postulacion[]) => almacenRegistro.guardar({ ...registro, items: nuevos }), [registro]);
  const cambiar = (id: string, c: Partial<Postulacion>) => guardar(registro.items.map((p) => (p.id === id ? { ...p, ...c } : p)));

  function llenar(i: number) {
    const ejemplo = EJEMPLOS_PLAN[i];
    const habia = almacenRegistro.hayDatosDeLaPersona(registro);
    const datos: DatosRegistro = { items: ejemplo.postulaciones, diasSinRespuesta: registro.diasSinRespuesta };
    const previo = almacenRegistro.cargarEjemplo(datos);
    ejemploCargado.current = { datos, iniciado: false };
    setIndice(i);
    setPendiente(null);
    setAvisoCerrado(false);
    setImportacion(null);
    registrarEvento("ejemplo_rellenado", { herramienta: HERRAMIENTA, perfil: ejemplo.id, paso: "registro" });
    alAviso(
      "Registro llenado con postulaciones de ejemplo.",
      habia
        ? {
            etiqueta: "Deshacer",
            alHacer: () => {
              almacenRegistro.deshacerEjemplo(previo);
              ejemploCargado.current = null;
              alAviso("Recuperé tu registro.");
            },
          }
        : undefined,
    );
  }

  function pedir(i: number) {
    if (almacenRegistro.hayDatosDeLaPersona(registro)) setPendiente(i);
    else llenar(i);
  }

  function limpiar() {
    almacenRegistro.borrar();
    ejemploCargado.current = null;
    setImportacion(null);
    registrarEvento("ejemplo_limpiado", { herramienta: HERRAMIENTA, perfil: perfil.id, paso: "registro" });
    alAviso("Registro limpio. Anota tu primera postulación.");
  }

  function quitar(p: Postulacion) {
    const previo = registro.items;
    guardar(previo.filter((x) => x.id !== p.id));
    alAviso(`Quité «${p.empresa || p.puesto}» del registro.`, { etiqueta: "Deshacer", alHacer: () => almacenRegistro.guardar({ ...registro, items: previo }) });
  }

  function bajarCsv() {
    descargar(modoEjemplo ? "postulaciones-EJEMPLO.csv" : "postulaciones.csv", aCsv(registro.items), "text/csv;charset=utf-8");
    if (modoEjemplo) registrarEvento("ejemplo_descargado", { herramienta: HERRAMIENTA, perfil: perfil.id, paso: "registro" });
    alAviso(modoEjemplo ? "Descargado: postulaciones-EJEMPLO.csv (datos de ejemplo)" : "CSV descargado. Ábrelo con Excel o Google Sheets.");
  }

  async function copiarTabla() {
    if (await copiarTexto(aTabla(registro.items))) {
      setCopiado("tabla");
      setTimeout(() => setCopiado(null), 2500);
      alAviso("Tabla copiada. Pégala en una hoja de Excel o Google Sheets.");
    }
  }

  async function importar(f: File | undefined) {
    if (!f) return;
    if (modoEjemplo) {
      setImportacion({ ok: false, texto: "Estás viendo datos de ejemplo. Pulsa «Limpiar registro» antes de importar tus postulaciones.", omitidas: [] });
      return;
    }
    if (f.size > 1_000_000) {
      setImportacion({ ok: false, texto: "El archivo pesa más de 1 MB: no parece un registro de postulaciones.", omitidas: [] });
      return;
    }
    const r = importarCsv(await f.text(), () => nuevoId("p"));
    if (r.sinCabecera) {
      setImportacion({ ok: false, texto: "No reconocí las columnas. El CSV debe tener al menos Empresa, Puesto y Fecha (usa el archivo que descarga esta página como modelo).", omitidas: [] });
      return;
    }
    const existentes = new Set(registro.items.map(claveDeDuplicado));
    const nuevas = r.items.filter((p) => !existentes.has(claveDeDuplicado(p)));
    guardar([...registro.items, ...nuevas]);
    const repetidas = r.items.length - nuevas.length;
    setImportacion({
      ok: nuevas.length > 0 || r.omitidas.length === 0,
      texto: `Importé ${nuevas.length} postulación(es)${repetidas ? `, omití ${repetidas} repetida(s)` : ""}${r.omitidas.length ? ` y ${r.omitidas.length} fila(s) con problemas` : ""}.`,
      omitidas: r.omitidas.slice(0, 5).map((o) => `Fila ${o.fila}: ${o.motivo}`),
    });
    alAviso(`Importé ${nuevas.length} postulación(es).`);
  }

  const pestanas: { id: IdPestana; etiqueta: string }[] = [
    { id: "registro", etiqueta: `Registro (${registro.items.length})` },
    { id: "embudo", etiqueta: "Embudo" },
    { id: "seguimientos", etiqueta: `Seguimientos (${avisos.length})` },
    { id: "revision", etiqueta: "Revisión quincenal" },
  ];

  return (
    <section id="registro" aria-labelledby="titulo-registro" className="tarjeta scroll-mt-24 p-5 sm:p-8" data-registro>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-registro" className="text-xl font-semibold leading-tight sm:text-2xl">
            Registro de postulaciones: tu tracker
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Anota cada postulación, actualiza su estado y mira tu embudo: qué porcentaje responde, cuántas llegan a entrevista y en qué etapa se corta tu búsqueda. Se guarda solo en tu navegador, así que puedes cerrar la página y volver mañana. Funciona sin la IA.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">
          <button type="button" className="btn btn-secundario w-full" onClick={() => pedir(modoEjemplo ? indice : 0)} aria-label="Llenar con datos de ejemplo (registro de postulaciones)">
            <Sparkles aria-hidden className="size-4 text-brand" />
            Llenar con datos de ejemplo
          </button>
          <p className="mt-1.5 text-center text-xs text-muted-foreground sm:text-right">Mira cómo queda tu embudo antes de usar tus datos</p>
        </div>
      </div>

      {pendiente !== null && (
        <div role="group" aria-label="Confirmación" className="aparecer mt-3 rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm">
          <p className="font-medium">¿Reemplazar tu registro con postulaciones de ejemplo? Tu registro real no se borra: lo recuperas con «Deshacer» o al limpiar.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primario" onClick={() => llenar(pendiente)} autoFocus>
              Reemplazar
            </button>
            <button type="button" className="btn btn-secundario" onClick={() => setPendiente(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {modoEjemplo && !avisoCerrado && (
        <div role="note" data-aviso-ejemplo-registro className="aparecer mt-4 flex flex-col gap-3 rounded-lg border bg-brand-muted p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong className="font-semibold">Estás viendo postulaciones de ejemplo</strong> (perfil: {perfil.etiqueta}). Todo es ficticio y no se guarda en tu navegador. Límpialo y anota las tuyas cuando quieras.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-secundario" onClick={() => pedir((indice + 1) % EJEMPLOS_PLAN.length)}>
              <RefreshCw aria-hidden className="size-4" /> Otro ejemplo
            </button>
            <button type="button" className="btn btn-primario" onClick={limpiar}>
              Limpiar registro
            </button>
            <button type="button" className="flex size-11 items-center justify-center rounded-md hover:bg-surface" aria-label="Cerrar este aviso" onClick={() => setAvisoCerrado(true)}>
              <X aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Pestanas etiqueta="Secciones del registro" prefijo="reg" pestanas={pestanas} valor={pestana} alCambiar={setPestana}>
          {pestana === "registro" && (
            <div className="space-y-6">
              <NuevaPostulacion hoy={hoy} alAgregar={(p) => guardar([p, ...registro.items])} />

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="btn btn-secundario" onClick={bajarCsv} disabled={registro.items.length === 0}>
                  <Download aria-hidden className="size-4" /> Descargar CSV
                </button>
                <button type="button" className="btn btn-secundario" onClick={copiarTabla} disabled={registro.items.length === 0}>
                  {copiado === "tabla" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                  {copiado === "tabla" ? "Copiada" : "Copiar como tabla"}
                </button>
                <button type="button" className="btn btn-secundario" onClick={() => archivo.current?.click()}>
                  <Upload aria-hidden className="size-4" /> Importar CSV
                </button>
                <input
                  ref={archivo}
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  className="hidden"
                  tabIndex={-1}
                  aria-label="Elegir un archivo CSV de postulaciones para importar"
                  onChange={(e) => {
                    void importar(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                {!modoEjemplo && registro.items.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-texto"
                    onClick={() => {
                      if (window.confirm("¿Borrar todo tu registro de postulaciones? No se puede deshacer.")) limpiar();
                    }}
                  >
                    Borrar mi registro
                  </button>
                )}
              </div>
              {importacion && (
                <div role="status" aria-live="polite" data-importacion className={`rounded-lg border p-3 text-sm ${importacion.ok ? "bg-surface" : "border-warn/50 bg-warn-muted"}`}>
                  <p className="font-medium">{importacion.texto}</p>
                  {importacion.omitidas.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                      {importacion.omitidas.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Todavía no anotaste ninguna postulación. Usa el formulario de arriba, importa un CSV o mira el ejemplo.</p>
              ) : (
                <ul className="space-y-3" data-postulaciones>
                  {items.map((p) => (
                    <li key={p.id} className="tarjeta p-3" data-postulacion>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold leading-snug">
                            {p.empresa || "(sin empresa)"} — {p.puesto || "(sin puesto)"}
                          </p>
                          <p className="text-xs text-muted-foreground tabular">
                            {p.fecha || "sin fecha"} · {etiquetaCanal(p.canal)} · CV: {p.cv || "sin versión"}
                            {p.seguimiento ? ` · seguimiento: ${p.seguimiento}` : ""}
                          </p>
                        </div>
                        <div className="w-full sm:w-56">
                          <label htmlFor={`estado-${p.id}`} className="sr-only">
                            Estado de {p.empresa || p.puesto || "la postulación"}
                          </label>
                          <select id={`estado-${p.id}`} className="campo" value={p.estado} onChange={(e) => cambiar(p.id, { estado: e.target.value as Postulacion["estado"], hasta: e.target.value === "rechazo" ? p.hasta : "" })}>
                            {ESTADOS.map((e) => (
                              <option key={e.valor} value={e.valor}>
                                {e.etiqueta}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <details className="mt-2">
                        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-muted-foreground hover:text-foreground">Editar detalles</summary>
                        <EditorPostulacion p={p} alCambiar={(c) => cambiar(p.id, c)} hoy={hoy} />
                        <button type="button" className="btn btn-texto mt-2" onClick={() => quitar(p)} aria-label={`Quitar la postulación ${p.empresa} — ${p.puesto}`}>
                          <Trash2 aria-hidden className="size-4" /> Quitar del registro
                        </button>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">
                {modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Tus postulaciones se guardan solo en este navegador. Si cambias de equipo o borras los datos del sitio, se pierden: descarga el CSV como copia de seguridad."}
              </p>
            </div>
          )}

          {pestana === "embudo" && <EmbudoVista items={registro.items} />}

          {pestana === "seguimientos" && (
            <div className="space-y-4" data-seguimientos>
              <div className="max-w-xs">
                <Numero
                  etiqueta="Avisarme tras estos días sin respuesta"
                  valor={registro.diasSinRespuesta}
                  alCambiar={(v) => almacenRegistro.guardar({ ...registro, diasSinRespuesta: v })}
                  entero
                  minimo={1}
                  maximo={90}
                  ayuda="Cuenta desde la fecha de postulación. Si fijas una fecha de seguimiento, se usa esa."
                />
              </div>
              {hoy === "" ? (
                <p className="text-sm text-muted-foreground">Calculando las fechas…</p>
              ) : avisos.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No hay seguimientos pendientes hoy ({hoy}). Aparecen aquí las postulaciones «Enviada» o «En revisión» que llevan {dias} días o más sin cambios, o cuya fecha de seguimiento llegó.</p>
              ) : (
                <ul className="space-y-3">
                  {avisos.map((a) => {
                    const p = registro.items.find((x) => x.id === a.id)!;
                    return (
                      <li key={a.id} className="tarjeta p-3 text-sm" data-alerta>
                        <p className="flex items-start gap-2 font-semibold">
                          <BellRing aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
                          {a.empresa} — {a.puesto}
                        </p>
                        <p className="mt-1 text-muted-foreground">{a.texto} Postulaste el {p.fecha}.</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-secundario"
                            onClick={async () => {
                              if (await copiarTexto(mensajeSeguimiento(a, p.fecha))) alAviso("Mensaje copiado. Completa los datos entre corchetes antes de enviarlo.");
                            }}
                          >
                            <ClipboardCopy aria-hidden className="size-4" /> Copiar mensaje de seguimiento
                          </button>
                          <button type="button" className="btn btn-secundario" onClick={() => cambiar(a.id, { seguimiento: sumarDias(hoy, 7) ?? "" })}>
                            Volver a avisarme en 7 días
                          </button>
                          <button type="button" className="btn btn-secundario" onClick={() => cambiar(a.id, { estado: "sin-respuesta", seguimiento: "" })}>
                            Marcar «{etiquetaEstado("sin-respuesta")}»
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">Un seguimiento sirve cuando tienes a quién escribirle; una vez y breve. Si no hay contacto, no insistas: pasa a la siguiente vacante.</p>
            </div>
          )}

          {pestana === "revision" && <RevisionQuincenal registro={registro} hoy={hoy} alCopiar={alCopiarRevision} />}
        </Pestanas>
      </div>
    </section>
  );
}
