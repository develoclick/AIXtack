"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { borrarDatos, cargarEjemplo, deshacerEjemplo, hayDatosDeLaPersona, useDatosCv, useModoEjemplo } from "./almacen";
import { AvisoToast, type ToastDatos } from "./aviso-toast";
import { ConvertirWord } from "./convertir-word";
import { FormularioCv } from "./formulario-cv";
import { PanelPrompt } from "./panel-prompt";
import { Pasos, type EstadoPaso } from "./pasos";
import { EJEMPLOS_CV } from "@/content/ejemplos/cv-harvard";
import { registrarEvento } from "@/lib/analitica";
import { datosMinimosListos } from "@/lib/cv/prompt";

type Pendiente = null | { tipo: "datos" | "respuesta"; indice: number };

/** Confirmación en línea (accesible) antes de reemplazar lo que escribió la persona. */
function Confirmar({ pregunta, alConfirmar, alCancelar }: { pregunta: string; alConfirmar: () => void; alCancelar: () => void }) {
  return (
    <div role="group" aria-label="Confirmación" className="aparecer mt-3 rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm">
      <p className="font-medium">{pregunta}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primario" onClick={alConfirmar} autoFocus>
          Reemplazar
        </button>
        <button type="button" className="btn btn-secundario" onClick={alCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function BotonEjemplo({ alHacer, etiquetaAria }: { alHacer: () => void; etiquetaAria: string }) {
  return (
    <button type="button" className="btn btn-secundario w-full" onClick={alHacer} aria-label={etiquetaAria}>
      <Sparkles aria-hidden className="size-4 text-brand" />
      Llenar con datos de ejemplo
    </button>
  );
}

export function GeneradorCv() {
  const datos = useDatosCv();
  const modoEjemplo = useModoEjemplo();
  const [respuesta, setRespuesta] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [descargado, setDescargado] = useState(false);
  const [toast, setToast] = useState<ToastDatos | null>(null);
  const [indice, setIndice] = useState(0);
  const [version, setVersion] = useState(0);
  const [pendiente, setPendiente] = useState<Pendiente>(null);
  const [avisoCerrado, setAvisoCerrado] = useState(false);
  const idToast = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ejemploCargado = useRef<{ datos: typeof datos; iniciado: boolean } | null>(null);

  const mostrar = useCallback((texto: string, accion?: ToastDatos["accion"]) => {
    idToast.current += 1;
    setToast({ id: idToast.current, texto, accion });
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setToast(null), accion ? 9000 : 3500);
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  // «datos_propios_iniciados»: la persona empieza a escribir después de ver el ejemplo (una sola vez por ejemplo cargado).
  useEffect(() => {
    const ej = ejemploCargado.current;
    if (!modoEjemplo || !ej || ej.iniciado || ej.datos === datos) return;
    ej.iniciado = true;
    registrarEvento("datos_propios_iniciados", { perfil: EJEMPLOS_CV[indice].id });
  }, [datos, modoEjemplo, indice]);

  const perfil = EJEMPLOS_CV[indice];
  const esRespuestaDeEjemplo = EJEMPLOS_CV.some((e) => e.respuesta.trim() === respuesta.trim() && respuesta.trim() !== "");

  function llenarDatos(i: number) {
    const ejemplo = EJEMPLOS_CV[i];
    const habiaDatos = hayDatosDeLaPersona(datos);
    const previo = cargarEjemplo(ejemplo.datos);
    ejemploCargado.current = { datos: ejemplo.datos, iniciado: false };
    setIndice(i);
    setVersion((v) => v + 1);
    setPendiente(null);
    setAvisoCerrado(false);
    registrarEvento("ejemplo_rellenado", { perfil: ejemplo.id, paso: 1 });
    mostrar(
      "Formulario llenado con datos de ejemplo.",
      habiaDatos
        ? {
            etiqueta: "Deshacer",
            alHacer: () => {
              deshacerEjemplo(previo);
              ejemploCargado.current = null;
              setVersion((v) => v + 1);
              mostrar("Recuperé lo que habías escrito.");
            },
          }
        : undefined,
    );
  }

  function pedirDatos(i: number) {
    if (hayDatosDeLaPersona(datos)) setPendiente({ tipo: "datos", indice: i });
    else llenarDatos(i);
  }

  function limpiar() {
    borrarDatos();
    ejemploCargado.current = null;
    setVersion((v) => v + 1);
    registrarEvento("ejemplo_limpiado", { perfil: perfil.id });
    mostrar("Formulario limpio. Escribe tus datos.");
  }

  function pegarRespuesta(i: number) {
    const ejemplo = EJEMPLOS_CV[i];
    setIndice(i);
    setRespuesta(ejemplo.respuesta);
    setPendiente(null);
    registrarEvento("ejemplo_rellenado", { perfil: ejemplo.id, paso: 3 });
    mostrar("Respuesta de ejemplo pegada. Ya puedes descargar el Word.");
  }

  function pedirRespuesta(i: number) {
    if (respuesta.trim() && !esRespuestaDeEjemplo) setPendiente({ tipo: "respuesta", indice: i });
    else pegarRespuesta(i);
  }

  /** «Otro ejemplo» del paso 3: rota el perfil y, si el paso 1 ya muestra un ejemplo, lo mantiene coherente con la respuesta. */
  function otroDeRespuesta() {
    const i = (indice + 1) % EJEMPLOS_CV.length;
    if (modoEjemplo) llenarDatos(i);
    pedirRespuesta(i);
  }

  const paso1 = datosMinimosListos(datos);
  const completos = [paso1, copiado, descargado];
  const activo = completos.findIndex((c) => !c);
  const estados = completos.map((c, i): EstadoPaso => (c ? "completo" : i === activo ? "activo" : "pendiente")) as [EstadoPaso, EstadoPaso, EstadoPaso];

  return (
    <div className="space-y-8">
      <Pasos estados={estados} />

      <section id="paso-1" aria-labelledby="titulo-paso-1" className="scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 id="titulo-paso-1" className="text-xl font-semibold leading-tight sm:text-2xl">
              1. Escribe tus datos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Cuanto más concretos sean tus logros, mejor saldrá tu CV.</p>
          </div>
          <div className="sm:w-64 sm:shrink-0">
            <BotonEjemplo alHacer={() => pedirDatos(modoEjemplo ? indice : 0)} etiquetaAria="Llenar con datos de ejemplo (paso 1: formulario)" />
            <p className="mt-1.5 text-center text-xs text-muted-foreground sm:text-right">Mira cómo queda antes de usar tus datos</p>
          </div>
        </div>

        {pendiente?.tipo === "datos" && <Confirmar pregunta="¿Reemplazar lo que escribiste con datos de ejemplo?" alConfirmar={() => llenarDatos(pendiente.indice)} alCancelar={() => setPendiente(null)} />}

        {modoEjemplo && !avisoCerrado && (
          <div role="note" data-aviso-ejemplo className="aparecer mt-4 flex flex-col gap-3 rounded-lg border bg-brand-muted p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong className="font-semibold">Estás viendo datos de ejemplo</strong> (perfil: {perfil.etiqueta}). Bórralos y escribe los tuyos cuando quieras.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secundario" onClick={() => pedirDatos((indice + 1) % EJEMPLOS_CV.length)}>
                <RefreshCw aria-hidden className="size-4" /> Otro ejemplo
              </button>
              <button type="button" className="btn btn-primario" onClick={limpiar}>
                Limpiar formulario
              </button>
              <button type="button" className="flex size-11 items-center justify-center rounded-md hover:bg-surface" aria-label="Cerrar este aviso" onClick={() => setAvisoCerrado(true)}>
                <X aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <div key={version} className={`min-w-0 ${version > 0 ? "aparecer" : ""}`}>
            <a href="#paso-2" className="btn btn-secundario mb-4 w-full lg:hidden">
              Ver mi prompt (abajo) ↓
            </a>
            <FormularioCv alBorrar={limpiar} />
          </div>
          <div id="paso-2" className="min-w-0 scroll-mt-24 lg:sticky lg:top-20">
            <PanelPrompt alCopiar={() => { setCopiado(true); mostrar("Prompt copiado. Pégalo en tu IA."); }} />
          </div>
        </div>
      </section>

      <ConvertirWord
        respuesta={respuesta}
        alCambiar={setRespuesta}
        esDeEjemplo={esRespuestaDeEjemplo}
        alDescargar={(esEjemplo) => {
          setDescargado(true);
          if (esEjemplo) registrarEvento("ejemplo_descargado", { perfil: perfil.id });
          mostrar(esEjemplo ? "Descargado: CV-ejemplo-harvard.docx" : "Word descargado. Ábrelo y revísalo antes de enviarlo.");
        }}
        accionesDeEjemplo={
          <div>
            <BotonEjemplo alHacer={() => pedirRespuesta(indice)} etiquetaAria="Llenar con datos de ejemplo (paso 3: respuesta de la IA)" />
            <p className="mt-1.5 text-center text-xs text-muted-foreground sm:text-right">Mira cómo queda antes de usar tus datos</p>
            {esRespuestaDeEjemplo && (
              <div className="mt-2 flex flex-col items-center gap-1 sm:items-end">
                <button type="button" className="btn btn-texto" onClick={otroDeRespuesta}>
                  <RefreshCw aria-hidden className="size-4" /> Otro ejemplo
                </button>
                <p className="text-center text-xs text-muted-foreground sm:text-right">
                  Perfil: {perfil.etiqueta}.{!modoEjemplo && " Es un ejemplo: no corresponde a tus datos."}
                </p>
              </div>
            )}
            {pendiente?.tipo === "respuesta" && <Confirmar pregunta="¿Reemplazar la respuesta que pegaste con una de ejemplo?" alConfirmar={() => pegarRespuesta(pendiente.indice)} alCancelar={() => setPendiente(null)} />}
          </div>
        }
      />

      <AvisoToast toast={toast} alCerrar={() => setToast(null)} />
    </div>
  );
}
