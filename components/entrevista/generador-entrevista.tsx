"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { AvisoToast, type ToastDatos } from "@/components/prompts/cv/aviso-toast";
import { Pasos, type EstadoPaso } from "@/components/prompts/cv/pasos";
import { almacenChecklist, almacenEntrevista, almacenHistorias } from "./almacenes";
import { FormularioEntrevista } from "./formulario-entrevista";
import { ImprimiblesEntrevista } from "./imprimibles";
import { PanelPromptEntrevista } from "./panel-prompt-entrevista";
import type { PreguntaPractica } from "./practica-cronometrada";
import { ResultadoEntrevista } from "./resultado-entrevista";
import { SeccionPractica, type IdPractica } from "./seccion-practica";
import { EJEMPLOS_ENTREVISTA } from "@/content/ejemplos/entrevista";
import { registrarEvento } from "@/lib/analitica";
import { construirChecklist, hojaDeEstudio } from "@/lib/entrevista/estudio";
import { leerRespuestaEntrevista } from "@/lib/entrevista/lector";
import { datosMinimosEntrevista } from "@/lib/entrevista/prompt";

type Pendiente = null | { tipo: "datos" | "respuesta"; indice: number };

const HERRAMIENTA = "preparar-entrevista-de-trabajo";

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

export function GeneradorEntrevista() {
  const datos = almacenEntrevista.useDatos();
  const modoEjemplo = almacenEntrevista.useModoEjemplo();
  const { historias } = almacenHistorias.useDatos();
  const modoEjemploHistorias = almacenHistorias.useModoEjemplo();
  const { marcados } = almacenChecklist.useDatos();
  const [respuesta, setRespuesta] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [toast, setToast] = useState<ToastDatos | null>(null);
  const [indice, setIndice] = useState(0);
  const [version, setVersion] = useState(0);
  const [pendiente, setPendiente] = useState<Pendiente>(null);
  const [avisoCerrado, setAvisoCerrado] = useState(false);
  const [pestanaPractica, setPestanaPractica] = useState<IdPractica>("practica");
  const [pregunta, setPregunta] = useState<PreguntaPractica | null>(null);
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

  // «datos_propios_iniciados»: la persona empieza a escribir después de ver el ejemplo (una vez por ejemplo cargado).
  useEffect(() => {
    const ej = ejemploCargado.current;
    if (!modoEjemplo || !ej || ej.iniciado || ej.datos === datos) return;
    ej.iniciado = true;
    registrarEvento("datos_propios_iniciados", { herramienta: HERRAMIENTA, perfil: EJEMPLOS_ENTREVISTA[indice].id });
  }, [datos, modoEjemplo, indice]);

  const perfil = EJEMPLOS_ENTREVISTA[indice];
  const ejemploDeLaRespuesta = EJEMPLOS_ENTREVISTA.find((e) => e.respuesta.trim() === respuesta.trim() && respuesta.trim() !== "");
  const esRespuestaDeEjemplo = Boolean(ejemploDeLaRespuesta);
  // Con una respuesta de ejemplo, las comprobaciones usan los datos de ese ejemplo si el formulario no muestra ese mismo ejemplo.
  const referencia = ejemploDeLaRespuesta && !(modoEjemplo && datos.cv === ejemploDeLaRespuesta.datos.cv) ? ejemploDeLaRespuesta.datos : datos;
  const lectura = useMemo(() => (respuesta.trim() ? leerRespuestaEntrevista(respuesta) : null), [respuesta]);
  const respuestaValida = Boolean(lectura?.valido);
  const grupos = useMemo(() => construirChecklist(referencia, lectura?.valido ? lectura : null, historias), [referencia, lectura, historias]);
  const hoja = useMemo(() => hojaDeEstudio(referencia, lectura?.valido ? lectura : null, historias), [referencia, lectura, historias]);

  function llenarDatos(i: number) {
    const ejemplo = EJEMPLOS_ENTREVISTA[i];
    const habiaDatos = almacenEntrevista.hayDatosDeLaPersona(datos);
    const previo = almacenEntrevista.cargarEjemplo(ejemplo.datos);
    ejemploCargado.current = { datos: ejemplo.datos, iniciado: false };
    setIndice(i);
    setVersion((v) => v + 1);
    setPendiente(null);
    setAvisoCerrado(false);
    registrarEvento("ejemplo_rellenado", { herramienta: HERRAMIENTA, perfil: ejemplo.id, paso: 1 });
    mostrar(
      "Formulario llenado con datos de ejemplo.",
      habiaDatos
        ? {
            etiqueta: "Deshacer",
            alHacer: () => {
              almacenEntrevista.deshacerEjemplo(previo);
              ejemploCargado.current = null;
              setVersion((v) => v + 1);
              mostrar("Recuperé lo que habías escrito.");
            },
          }
        : undefined,
    );
  }

  function pedirDatos(i: number) {
    if (almacenEntrevista.hayDatosDeLaPersona(datos)) setPendiente({ tipo: "datos", indice: i });
    else llenarDatos(i);
  }

  function limpiar() {
    almacenEntrevista.borrar();
    ejemploCargado.current = null;
    setVersion((v) => v + 1);
    registrarEvento("ejemplo_limpiado", { herramienta: HERRAMIENTA, perfil: perfil.id });
    mostrar("Formulario limpio. Escribe tus datos.");
  }

  function pegarRespuesta(i: number) {
    const ejemplo = EJEMPLOS_ENTREVISTA[i];
    setIndice(i);
    setRespuesta(ejemplo.respuesta);
    setPendiente(null);
    registrarEvento("ejemplo_rellenado", { herramienta: HERRAMIENTA, perfil: ejemplo.id, paso: 3 });
    mostrar("Respuesta de ejemplo pegada. Ya puedes revisar los paneles.");
  }

  function pedirRespuesta(i: number) {
    if (respuesta.trim() && !esRespuestaDeEjemplo) setPendiente({ tipo: "respuesta", indice: i });
    else pegarRespuesta(i);
  }

  function otroDeRespuesta() {
    const i = (indice + 1) % EJEMPLOS_ENTREVISTA.length;
    if (modoEjemplo) llenarDatos(i);
    pedirRespuesta(i);
  }

  function practicar(p: PreguntaPractica) {
    setPregunta(p);
    setPestanaPractica("practica");
    setTimeout(() => {
      document.getElementById("practica")?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("pregunta-practica")?.focus({ preventScroll: true });
    }, 60);
    mostrar("Pregunta lista para practicar. Pulsa «Iniciar» cuando estés listo.");
  }

  const completos = [datosMinimosEntrevista(datos), copiado, respuestaValida];
  const activo = completos.findIndex((c) => !c);
  const estados = completos.map((c, i): EstadoPaso => (c ? "completo" : i === activo ? "activo" : "pendiente")) as [EstadoPaso, EstadoPaso, EstadoPaso];

  return (
    <div className="space-y-8">
      <Pasos estados={estados} textos={{ tres: "Tu resultado", ayudaTres: "Estudia y practica" }} />

      <section id="paso-1" aria-labelledby="titulo-paso-1-ent" className="scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 id="titulo-paso-1-ent" className="text-xl font-semibold leading-tight sm:text-2xl">
              1. Pega tu CV y la oferta
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Elige el tipo de entrevista y cómo quieres practicar: banco de preguntas o simulación en vivo.</p>
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
              <strong className="font-semibold">Estás viendo datos de ejemplo</strong> (perfil: {perfil.etiqueta}). Todo es ficticio. Bórralos y escribe los tuyos cuando quieras.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secundario" onClick={() => pedirDatos((indice + 1) % EJEMPLOS_ENTREVISTA.length)}>
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
            <FormularioEntrevista alBorrar={limpiar} />
          </div>
          <div id="paso-2" className="min-w-0 scroll-mt-24 lg:sticky lg:top-20">
            <PanelPromptEntrevista
              alCopiar={() => {
                setCopiado(true);
                mostrar("Prompt copiado. Pégalo en tu IA.");
              }}
            />
          </div>
        </div>
      </section>

      <ResultadoEntrevista
        respuesta={respuesta}
        alCambiar={setRespuesta}
        referencia={referencia}
        historias={historias}
        esDeEjemplo={esRespuestaDeEjemplo}
        alPracticar={practicar}
        alDescargarHoja={(esEjemplo) => {
          if (esEjemplo) registrarEvento("ejemplo_descargado", { herramienta: HERRAMIENTA, perfil: perfil.id });
          mostrar(esEjemplo ? "Descargado: hoja-de-estudio-ejemplo.docx" : "Hoja de estudio descargada en Word.");
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
                  Perfil: {ejemploDeLaRespuesta!.etiqueta}. Es una respuesta ilustrativa escrita por el autor, no de una IA real.
                </p>
              </div>
            )}
            {pendiente?.tipo === "respuesta" && <Confirmar pregunta="¿Reemplazar la respuesta que pegaste con una de ejemplo?" alConfirmar={() => pegarRespuesta(pendiente.indice)} alCancelar={() => setPendiente(null)} />}
          </div>
        }
      />

      <SeccionPractica
        pestana={pestanaPractica}
        alCambiarPestana={setPestanaPractica}
        pregunta={pregunta}
        alCambiarPregunta={(texto) => setPregunta((p) => ({ texto, categoria: p?.categoria }))}
        fuenteCv={`${datos.cv}\n${datos.destacar}`}
        grupos={grupos}
        alTerminarTiempo={() => mostrar("Se acabó el tiempo de la respuesta.")}
        alAviso={mostrar}
        alEvento={(nombre) => registrarEvento(nombre, { herramienta: HERRAMIENTA, perfil: "historias-star" })}
      />

      <AvisoToast toast={toast} alCerrar={() => setToast(null)} />
      <ImprimiblesEntrevista grupos={grupos} marcados={marcados} hoja={hoja} esEjemplo={esRespuestaDeEjemplo || modoEjemplo || modoEjemploHistorias} />
    </div>
  );
}
