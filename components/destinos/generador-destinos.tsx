"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { AvisoToast, type ToastDatos } from "@/components/prompts/cv/aviso-toast";
import { Pasos, type EstadoPaso } from "@/components/prompts/cv/pasos";
import { Pestanas } from "@/components/entrevista/pestanas";
import { almacenDestinos } from "./almacen";
import { FormularioDestinos } from "./formulario-destinos";
import { MetodoGuiado } from "./metodo-guiado";
import { PanelPromptDestinos } from "./panel-prompt-destinos";
import { ResultadoDestinos } from "./resultado-destinos";
import { ResumenImprimible } from "./resumen-imprimible";
import { ResumenVivo } from "./resumen-vivo";
import { EJEMPLOS_DESTINOS } from "@/content/ejemplos/destinos";
import { registrarEvento } from "@/lib/analitica";
import { datosMinimosDestinos, filasResumen } from "@/lib/destinos/calculo";
import { leerRespuestaDestinos } from "@/lib/destinos/lector";

type Pendiente = null | { tipo: "datos" | "respuesta"; indice: number };
type Metodo = "guiado" | "prompt";

const HERRAMIENTA = "descubrir-destinos-segun-presupuesto";

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

export function GeneradorDestinos() {
  const datos = almacenDestinos.useDatos();
  const modoEjemplo = almacenDestinos.useModoEjemplo();
  const [respuesta, setRespuesta] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [metodo, setMetodo] = useState<Metodo>("guiado");
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

  useEffect(() => {
    const ej = ejemploCargado.current;
    if (!modoEjemplo || !ej || ej.iniciado || ej.datos === datos) return;
    ej.iniciado = true;
    registrarEvento("datos_propios_iniciados", { herramienta: HERRAMIENTA, perfil: EJEMPLOS_DESTINOS[indice].id });
  }, [datos, modoEjemplo, indice]);

  const perfil = EJEMPLOS_DESTINOS[indice];
  const ejemploDeLaRespuesta = EJEMPLOS_DESTINOS.find((e) => e.respuesta.trim() === respuesta.trim() && respuesta.trim() !== "");
  const esRespuestaDeEjemplo = Boolean(ejemploDeLaRespuesta);
  const referencia = ejemploDeLaRespuesta && !(modoEjemplo && datos.presupuesto === ejemploDeLaRespuesta.datos.presupuesto && datos.origen === ejemploDeLaRespuesta.datos.origen) ? ejemploDeLaRespuesta.datos : datos;
  const lectura = useMemo(() => (respuesta.trim() ? leerRespuestaDestinos(respuesta) : null), [respuesta]);
  const respuestaValida = lectura?.valido ?? false;
  const filasImprimibles = useMemo(() => (lectura?.valido ? filasResumen(lectura.filas, referencia) : []), [lectura, referencia]);

  function llenarDatos(i: number) {
    const ejemplo = EJEMPLOS_DESTINOS[i];
    const habiaDatos = almacenDestinos.hayDatosDeLaPersona(datos);
    const previo = almacenDestinos.cargarEjemplo(ejemplo.datos);
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
              almacenDestinos.deshacerEjemplo(previo);
              ejemploCargado.current = null;
              setVersion((v) => v + 1);
              mostrar("Recuperé lo que habías escrito.");
            },
          }
        : undefined,
    );
  }

  function pedirDatos(i: number) {
    if (almacenDestinos.hayDatosDeLaPersona(datos)) setPendiente({ tipo: "datos", indice: i });
    else llenarDatos(i);
  }

  function limpiar() {
    almacenDestinos.borrar();
    ejemploCargado.current = null;
    setVersion((v) => v + 1);
    registrarEvento("ejemplo_limpiado", { herramienta: HERRAMIENTA, perfil: perfil.id });
    mostrar("Formulario limpio. Escribe tus datos.");
  }

  function pegarRespuesta(i: number) {
    const ejemplo = EJEMPLOS_DESTINOS[i];
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
    const i = (indice + 1) % EJEMPLOS_DESTINOS.length;
    if (modoEjemplo) llenarDatos(i);
    pedirRespuesta(i);
  }

  const completos = [datosMinimosDestinos(datos), copiado, respuestaValida];
  const activo = completos.findIndex((c) => !c);
  const estados = completos.map((c, i): EstadoPaso => (c ? "completo" : i === activo ? "activo" : "pendiente")) as [EstadoPaso, EstadoPaso, EstadoPaso];

  return (
    <div className="space-y-8">
      <Pasos estados={estados} textos={{ tres: "Tus destinos", ayudaTres: "Tabla y viabilidad" }} />

      <section id="paso-1" aria-labelledby="titulo-paso-1-destinos" className="scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 id="titulo-paso-1-destinos" className="text-xl font-semibold leading-tight sm:text-2xl">
              1. Tu presupuesto y tu viaje
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">El reparto de tu presupuesto se calcula al instante, en tu navegador. Ningún destino sale de esta página.</p>
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
              <strong className="font-semibold">Estás viendo datos de ejemplo</strong> (perfil: {perfil.etiqueta}). Todo es ficticio: no son precios reales. Bórralos y escribe los tuyos cuando quieras.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secundario" onClick={() => pedirDatos((indice + 1) % EJEMPLOS_DESTINOS.length)}>
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
            <a href="#resumen-movil" className="btn btn-secundario mb-4 w-full lg:hidden">
              Ver tu reparto (abajo) ↓
            </a>
            <FormularioDestinos alBorrar={limpiar} />
          </div>
          <div id="resumen-movil" className="min-w-0 scroll-mt-24 lg:sticky lg:top-20">
            <ResumenVivo />
          </div>
        </div>
      </section>

      <section id="paso-2" aria-labelledby="titulo-paso-2-destinos" className="scroll-mt-24">
        <div className="max-w-2xl">
          <h2 id="titulo-paso-2-destinos" className="text-xl font-semibold leading-tight sm:text-2xl">
            2. Obtén destinos candidatos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Elige cómo prefieres conseguirlos: explorando tú mismo, o con un prompt para tu IA.</p>
        </div>
        <div className="mt-6">
          <Pestanas etiqueta="Método para obtener destinos" prefijo="metodo" pestanas={[{ id: "guiado", etiqueta: "A · Guiado" }, { id: "prompt", etiqueta: "B · Con IA" }]} valor={metodo} alCambiar={(v) => setMetodo(v as Metodo)}>
            {metodo === "guiado" ? <MetodoGuiado /> : <PanelPromptDestinos alCopiar={() => { setCopiado(true); mostrar("Prompt copiado. Pégalo en tu IA."); }} />}
          </Pestanas>
        </div>
      </section>

      <ResultadoDestinos
        respuesta={respuesta}
        alCambiar={setRespuesta}
        referencia={referencia}
        esDeEjemplo={esRespuestaDeEjemplo}
        alAviso={(t) => mostrar(t)}
        alExportar={(tipo) => {
          if (esRespuestaDeEjemplo && tipo === "csv") registrarEvento("ejemplo_descargado", { herramienta: HERRAMIENTA, perfil: perfil.id });
        }}
        accionesDeEjemplo={
          <div>
            <BotonEjemplo alHacer={() => pedirRespuesta(indice)} etiquetaAria="Llenar con datos de ejemplo (paso 3: destinos)" />
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
            {pendiente?.tipo === "respuesta" && <Confirmar pregunta="¿Reemplazar los destinos que escribiste con un ejemplo?" alConfirmar={() => pegarRespuesta(pendiente.indice)} alCancelar={() => setPendiente(null)} />}
          </div>
        }
      />

      <ResumenImprimible datos={referencia} filas={filasImprimibles} esEjemplo={esRespuestaDeEjemplo} />

      <AvisoToast toast={toast} alCerrar={() => setToast(null)} />
    </div>
  );
}
