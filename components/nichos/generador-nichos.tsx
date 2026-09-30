"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { AvisoToast, type ToastDatos } from "@/components/prompts/cv/aviso-toast";
import { Pasos, type EstadoPaso } from "@/components/prompts/cv/pasos";
import { almacenNichos } from "./almacen";
import { FormularioNichos } from "./formulario-nichos";
import { PanelPromptNichos } from "./panel-prompt-nichos";
import { ResultadoNichos } from "./resultado-nichos";
import { ResumenImprimible } from "./resumen-imprimible";
import { ResumenVivo } from "./resumen-vivo";
import { EJEMPLOS_NICHOS } from "@/content/ejemplos/nichos";
import { registrarEvento } from "@/lib/analitica";
import { datosMinimosNichos, rankearNichos } from "@/lib/nichos/calculo";
import { leerRespuestaNichos1, leerRespuestaValidacion } from "@/lib/nichos/lector";

type Pendiente = null | { tipo: "datos" | "nichos" | "validacion"; indice: number };

const HERRAMIENTA = "identificar-nichos-de-mercado";

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

export function GeneradorNichos() {
  const datos = almacenNichos.useDatos();
  const modoEjemplo = almacenNichos.useModoEjemplo();
  const [respuestaValidacion, setRespuestaValidacion] = useState("");
  const [copiado, setCopiado] = useState(false);
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
    registrarEvento("datos_propios_iniciados", { herramienta: HERRAMIENTA, perfil: EJEMPLOS_NICHOS[indice].id });
  }, [datos, modoEjemplo, indice]);

  const perfil = EJEMPLOS_NICHOS[indice];
  const ejemploDeNichos = EJEMPLOS_NICHOS.find((e) => e.respuestaNichos.trim() === datos.respuestaNichos.trim() && datos.respuestaNichos.trim() !== "");
  const esNichosDeEjemplo = Boolean(ejemploDeNichos);
  const ejemploDeValidacion = EJEMPLOS_NICHOS.find((e) => e.respuestaValidacion.trim() === respuestaValidacion.trim() && respuestaValidacion.trim() !== "");
  const esValidacionDeEjemplo = Boolean(ejemploDeValidacion);

  const lectura1 = useMemo(() => leerRespuestaNichos1(datos.respuestaNichos), [datos.respuestaNichos]);
  const ranking = useMemo(() => rankearNichos(lectura1.nichos, datos.pesos), [lectura1.nichos, datos.pesos]);
  const lectura2 = useMemo(() => (respuestaValidacion.trim() ? leerRespuestaValidacion(respuestaValidacion) : null), [respuestaValidacion]);

  function llenarDatos(i: number) {
    const ejemplo = EJEMPLOS_NICHOS[i];
    const habiaDatos = almacenNichos.hayDatosDeLaPersona(datos);
    const previo = almacenNichos.cargarEjemplo(ejemplo.datos);
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
              almacenNichos.deshacerEjemplo(previo);
              ejemploCargado.current = null;
              setVersion((v) => v + 1);
              mostrar("Recuperé lo que habías escrito.");
            },
          }
        : undefined,
    );
  }

  function pedirDatos(i: number) {
    if (almacenNichos.hayDatosDeLaPersona(datos)) setPendiente({ tipo: "datos", indice: i });
    else llenarDatos(i);
  }

  function limpiar() {
    almacenNichos.borrar();
    ejemploCargado.current = null;
    setVersion((v) => v + 1);
    registrarEvento("ejemplo_limpiado", { herramienta: HERRAMIENTA, perfil: perfil.id });
    mostrar("Formulario limpio. Escribe tus datos.");
  }

  function pegarNichos(i: number) {
    const ejemplo = EJEMPLOS_NICHOS[i];
    setIndice(i);
    almacenNichos.guardar({ ...datos, respuestaNichos: ejemplo.respuestaNichos, favoritos: [] });
    setRespuestaValidacion("");
    setPendiente(null);
    registrarEvento("ejemplo_rellenado", { herramienta: HERRAMIENTA, perfil: ejemplo.id, paso: 3 });
    mostrar("Respuesta de ejemplo pegada. Marca 2 favoritos para ver el Prompt 2.");
  }

  function pedirNichos(i: number) {
    if (datos.respuestaNichos.trim() && !esNichosDeEjemplo) setPendiente({ tipo: "nichos", indice: i });
    else pegarNichos(i);
  }

  function pegarValidacion(i: number) {
    const ejemplo = EJEMPLOS_NICHOS[i];
    setIndice(i);
    setRespuestaValidacion(ejemplo.respuestaValidacion);
    setPendiente(null);
    registrarEvento("ejemplo_rellenado", { herramienta: HERRAMIENTA, perfil: ejemplo.id, paso: 4 });
    mostrar("Respuesta de ejemplo pegada. Ya puedes revisar el plan de validación.");
  }

  function pedirValidacion(i: number) {
    if (respuestaValidacion.trim() && !esValidacionDeEjemplo) setPendiente({ tipo: "validacion", indice: i });
    else pegarValidacion(i);
  }

  function otroDeNichos() {
    // Un solo guardado, combinando inventario y respuesta del nuevo perfil: si se hiciera en 2 pasos (llenarDatos y
    // luego pegarNichos), el segundo paso arrastraría el `datos` de este cierre, todavía desactualizado.
    const i = (indice + 1) % EJEMPLOS_NICHOS.length;
    const ejemplo = EJEMPLOS_NICHOS[i];
    const combinado = { ...ejemplo.datos, respuestaNichos: ejemplo.respuestaNichos, favoritos: [] };
    if (modoEjemplo) almacenNichos.cargarEjemplo(combinado);
    else almacenNichos.guardar(combinado);
    ejemploCargado.current = { datos: combinado, iniciado: false };
    setIndice(i);
    setVersion((v) => v + 1);
    setRespuestaValidacion("");
    setPendiente(null);
    registrarEvento("ejemplo_rellenado", { herramienta: HERRAMIENTA, perfil: ejemplo.id, paso: 3 });
    mostrar("Otro ejemplo cargado. Marca 2 favoritos para ver el Prompt 2.");
  }

  const completos = [datosMinimosNichos(datos), copiado, lectura1.valido];
  const activo = completos.findIndex((c) => !c);
  const estados = completos.map((c, i): EstadoPaso => (c ? "completo" : i === activo ? "activo" : "pendiente")) as [EstadoPaso, EstadoPaso, EstadoPaso];

  return (
    <div className="space-y-8">
      <Pasos estados={estados} textos={{ tres: "Tus nichos", ayudaTres: "Compara, elige y valida" }} />

      <section id="paso-1" aria-labelledby="titulo-paso-1-nichos" className="scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 id="titulo-paso-1-nichos" className="text-xl font-semibold leading-tight sm:text-2xl">
              1. Tu inventario personal
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Cuanto más completo, menos genéricos serán los nichos que te proponga la IA.</p>
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
              <strong className="font-semibold">Estás viendo datos de ejemplo</strong> (perfil: {perfil.etiqueta}). Todo es ficticio: no es una persona real. Bórralos y escribe los tuyos cuando quieras.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secundario" onClick={() => pedirDatos((indice + 1) % EJEMPLOS_NICHOS.length)}>
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
              Ver tu resumen (abajo) ↓
            </a>
            <FormularioNichos alBorrar={limpiar} />
          </div>
          <div id="resumen-movil" className="min-w-0 scroll-mt-24 lg:sticky lg:top-20">
            <ResumenVivo />
          </div>
        </div>
      </section>

      <section id="paso-2" aria-labelledby="titulo-paso-2-nichos" className="scroll-mt-24">
        <div className="max-w-2xl">
          <h2 id="titulo-paso-2-nichos" className="text-xl font-semibold leading-tight sm:text-2xl">
            2. Copia el prompt
          </h2>
        </div>
        <div className="mt-6">
          <PanelPromptNichos
            alCopiar={() => {
              setCopiado(true);
              mostrar("Prompt copiado. Pégalo en tu IA.");
            }}
          />
        </div>
      </section>

      <ResultadoNichos
        respuestaValidacion={respuestaValidacion}
        alCambiarValidacion={setRespuestaValidacion}
        esDeEjemploNichos={esNichosDeEjemplo}
        esDeEjemploValidacion={esValidacionDeEjemplo}
        alAviso={(t) => mostrar(t)}
        alExportar={(tipo) => {
          if (esNichosDeEjemplo || esValidacionDeEjemplo) registrarEvento("ejemplo_descargado", { herramienta: HERRAMIENTA, perfil: perfil.id, tipo });
        }}
        accionesDeEjemploNichos={
          <div>
            <BotonEjemplo alHacer={() => pedirNichos(indice)} etiquetaAria="Llenar con datos de ejemplo (paso 3: nichos)" />
            <p className="mt-1.5 text-center text-xs text-muted-foreground sm:text-right">Mira cómo queda antes de usar tus datos</p>
            {esNichosDeEjemplo && (
              <div className="mt-2 flex flex-col items-center gap-1 sm:items-end">
                <button type="button" className="btn btn-texto" onClick={otroDeNichos}>
                  <RefreshCw aria-hidden className="size-4" /> Otro ejemplo
                </button>
                <p className="text-center text-xs text-muted-foreground sm:text-right">
                  Perfil: {ejemploDeNichos!.etiqueta}. Es una respuesta ilustrativa escrita por el autor, no de una IA real.
                </p>
              </div>
            )}
            {pendiente?.tipo === "nichos" && <Confirmar pregunta="¿Reemplazar la respuesta que pegaste con un ejemplo?" alConfirmar={() => pegarNichos(pendiente.indice)} alCancelar={() => setPendiente(null)} />}
          </div>
        }
        accionesDeEjemploValidacion={
          <div>
            <BotonEjemplo alHacer={() => pedirValidacion(indice)} etiquetaAria="Llenar con datos de ejemplo (paso 4: validación)" />
            <p className="mt-1.5 text-center text-xs text-muted-foreground sm:text-right">Mira cómo queda antes de usar tus datos</p>
            {esValidacionDeEjemplo && <p className="mt-2 text-center text-xs text-muted-foreground sm:text-right">Perfil: {ejemploDeValidacion!.etiqueta}. Respuesta ilustrativa, no de una IA real.</p>}
            {pendiente?.tipo === "validacion" && <Confirmar pregunta="¿Reemplazar la respuesta que pegaste con un ejemplo?" alConfirmar={() => pegarValidacion(pendiente.indice)} alCancelar={() => setPendiente(null)} />}
          </div>
        }
      />

      <ResumenImprimible ranking={ranking} lecturaValidacion={lectura2} esEjemplo={esNichosDeEjemplo || esValidacionDeEjemplo} />

      <AvisoToast toast={toast} alCerrar={() => setToast(null)} />
    </div>
  );
}
