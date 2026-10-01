"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { AvisoToast, type ToastDatos } from "@/components/prompts/cv/aviso-toast";
import { Pasos, type EstadoPaso } from "@/components/prompts/cv/pasos";
import { almacenSegmentarClientes } from "./almacen";
import { FormularioSegmentarClientes } from "./formulario-datos";
import { PanelPromptSegmentar } from "./panel-prompt-segmentar";
import { ResultadoSegmentar } from "./resultado-segmentar";
import { ResumenImprimibleSegmentar } from "./resumen-imprimible";
import { ResumenVivoSegmentos } from "./resumen-vivo";
import { EJEMPLOS_SEGMENTAR_CLIENTES } from "@/content/ejemplos/segmentar-clientes";
import { registrarEvento } from "@/lib/analitica";
import { fichaDeHoja, pareceTransacciones, sugerirMapeo } from "@/lib/segmentar-clientes/ficha";
import { leerRespuestaSegmentarClientes } from "@/lib/segmentar-clientes/lector";
import { agregarTransacciones, calcularRFM, clientesDesdeFilasResumidas, datosMinimos, matrizRF, resumenSegmentos, segmentarPorReglas, segmentosRFMParaResumen } from "@/lib/segmentar-clientes/motor";
import { leerArchivoClientes, type HojaCruda } from "@/lib/segmentar-clientes/parser";
import { CLAVES_SEGMENTO_RFM, mapeoVacio, SIN_SEGMENTO } from "@/lib/segmentar-clientes/tipos";

type Pendiente = null | { indice: number };

const HERRAMIENTA = "segmentar-clientes";

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

export function GeneradorSegmentarClientes() {
  const datos = almacenSegmentarClientes.useDatos();
  const modoEjemplo = almacenSegmentarClientes.useModoEjemplo();
  const [hoja, setHoja] = useState<HojaCruda | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorDatos, setErrorDatos] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [toast, setToast] = useState<ToastDatos | null>(null);
  const [indice, setIndice] = useState(0);
  const [version, setVersion] = useState(0);
  const [pendiente, setPendiente] = useState<Pendiente>(null);
  const [avisoCerrado, setAvisoCerrado] = useState(false);
  const idToast = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hojaPreviaRef = useRef<HojaCruda | null>(null);

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

  const ficha = useMemo(() => (hoja ? fichaDeHoja(datos.nombreOrigen || hoja.nombre, [hoja], hoja.nombre) : null), [hoja, datos.nombreOrigen]);
  const sugerenciaTransacciones = useMemo(() => (hoja && datos.mapeo.clienteId !== null ? pareceTransacciones(hoja, datos.mapeo.clienteId) : null), [hoja, datos.mapeo.clienteId]);

  const clientes = useMemo(() => {
    if (!hoja || datos.mapeo.clienteId === null) return [];
    return datos.origenDatos === "transacciones" ? agregarTransacciones(hoja, datos.mapeo) : clientesDesdeFilasResumidas(hoja, datos.mapeo);
  }, [hoja, datos.mapeo, datos.origenDatos]);

  const rfmClientes = useMemo(() => (datos.metodo === "rfm" && clientes.length && datos.fechaReferencia.trim() ? calcularRFM(clientes, datos.fechaReferencia) : null), [clientes, datos.metodo, datos.fechaReferencia]);

  const clientesSegmentados = useMemo(() => {
    if (!clientes.length || !datos.fechaReferencia.trim()) return [];
    if (datos.metodo === "rfm") return rfmClientes ? segmentosRFMParaResumen(rfmClientes, datos.nombresRfm) : [];
    return segmentarPorReglas(clientes, datos.reglas, datos.fechaReferencia);
  }, [clientes, datos.metodo, rfmClientes, datos.nombresRfm, datos.reglas, datos.fechaReferencia]);

  const ordenNombres = useMemo(() => (datos.metodo === "rfm" ? CLAVES_SEGMENTO_RFM.map((c) => datos.nombresRfm[c]) : [...datos.reglas.filter((r) => r.nombre.trim()).map((r) => r.nombre.trim()), SIN_SEGMENTO]), [datos.metodo, datos.nombresRfm, datos.reglas]);
  const resumen = useMemo(() => resumenSegmentos(clientesSegmentados, ordenNombres), [clientesSegmentados, ordenNombres]);
  const matriz = useMemo(() => (rfmClientes ? matrizRF(rfmClientes) : null), [rfmClientes]);

  const mapeoListo = datos.mapeo.clienteId !== null && Boolean(hoja);
  const fechaListo = datos.fechaReferencia.trim().length > 0;

  const perfil = EJEMPLOS_SEGMENTAR_CLIENTES[indice];
  const ejemploDeLaRespuesta = EJEMPLOS_SEGMENTAR_CLIENTES.find((e) => e.respuesta.trim() === respuesta.trim() && respuesta.trim() !== "");
  const esRespuestaDeEjemplo = Boolean(ejemploDeLaRespuesta);
  const lectura = useMemo(() => (respuesta.trim() ? leerRespuestaSegmentarClientes(respuesta) : null), [respuesta]);
  const respuestaValida = lectura?.valido ?? false;

  async function alSubirArchivo(archivo: File) {
    setErrorDatos(null);
    setCargando(true);
    try {
      const leido = await leerArchivoClientes(archivo);
      if (leido.hojas.length === 0 || leido.hojas[0].filas.length === 0) throw new Error("No encontré datos en este archivo. Revisa que tenga una fila de encabezado y al menos una fila de datos.");
      const nuevaHoja = leido.hojas[0];
      setHoja(nuevaHoja);
      const fichaNueva = fichaDeHoja(archivo.name, [nuevaHoja], nuevaHoja.nombre);
      almacenSegmentarClientes.guardar({ ...datos, nombreOrigen: archivo.name, mapeo: sugerirMapeo(fichaNueva) });
      setRespuesta("");
      registrarEvento("archivo_subido", { herramienta: HERRAMIENTA, filas: leido.hojas[0].filas.length - 1 });
    } catch (e) {
      setErrorDatos(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    } finally {
      setCargando(false);
    }
  }

  function quitarArchivo() {
    setHoja(null);
    setErrorDatos(null);
    almacenSegmentarClientes.guardar({ ...datos, nombreOrigen: "", mapeo: mapeoVacio() });
  }

  function limpiar() {
    almacenSegmentarClientes.borrar();
    setHoja(null);
    setErrorDatos(null);
    setRespuesta("");
    setVersion((v) => v + 1);
    registrarEvento("ejemplo_limpiado", { herramienta: HERRAMIENTA, perfil: perfil.id });
    mostrar("Formulario limpio. Sube tu archivo.");
  }

  function cargarEjemploCompleto(i: number) {
    const ejemplo = EJEMPLOS_SEGMENTAR_CLIENTES[i];
    const habiaDatos = almacenSegmentarClientes.hayDatosDeLaPersona(datos) || Boolean(respuesta.trim() && !esRespuestaDeEjemplo) || hoja !== null;
    if (!modoEjemplo) hojaPreviaRef.current = hoja;
    const previo = almacenSegmentarClientes.cargarEjemplo(ejemplo.datos);
    setHoja({ nombre: ejemplo.nombreOrigen, filas: ejemplo.filasCrudas, truncado: false });
    setRespuesta(ejemplo.respuesta);
    setIndice(i);
    setVersion((v) => v + 1);
    setPendiente(null);
    setAvisoCerrado(false);
    setErrorDatos(null);
    registrarEvento("ejemplo_rellenado", { herramienta: HERRAMIENTA, perfil: ejemplo.id });
    mostrar(
      "Formulario llenado con datos de ejemplo.",
      habiaDatos
        ? {
            etiqueta: "Deshacer",
            alHacer: () => {
              almacenSegmentarClientes.deshacerEjemplo(previo);
              setHoja(hojaPreviaRef.current);
              setRespuesta("");
              hojaPreviaRef.current = null;
              setVersion((v) => v + 1);
              mostrar("Recuperé lo que habías escrito.");
            },
          }
        : undefined,
    );
  }

  function pedirEjemplo(i: number) {
    const hayAlgoQuePerder = almacenSegmentarClientes.hayDatosDeLaPersona(datos) || Boolean(respuesta.trim() && !esRespuestaDeEjemplo) || hoja !== null;
    if (hayAlgoQuePerder && !modoEjemplo) setPendiente({ indice: i });
    else cargarEjemploCompleto(i);
  }

  function otroEjemplo() {
    cargarEjemploCompleto((indice + 1) % EJEMPLOS_SEGMENTAR_CLIENTES.length);
  }

  const completos = [datosMinimos(datos.mapeo, datos.origenDatos, datos.fechaReferencia, clientes.length), copiado, respuestaValida];
  const activo = completos.findIndex((c) => !c);
  const estados = completos.map((c, i): EstadoPaso => (c ? "completo" : i === activo ? "activo" : "pendiente")) as [EstadoPaso, EstadoPaso, EstadoPaso];

  return (
    <div className="space-y-8">
      <Pasos estados={estados} textos={{ tres: "Tus segmentos", ayudaTres: "Interpretados por tu IA, con clientes reales" }} />

      <section id="paso-1" aria-labelledby="titulo-paso-1-segmentar" className="scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 id="titulo-paso-1-segmentar" className="text-xl font-semibold leading-tight sm:text-2xl">
              1. Tu archivo y tu método
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Sube tu archivo, mapea el ID de cliente y elige RFM o tus propias reglas: verás la segmentación al instante.</p>
          </div>
          <div className="sm:w-64 sm:shrink-0">
            <BotonEjemplo alHacer={() => pedirEjemplo(modoEjemplo ? indice : 0)} etiquetaAria="Llenar con datos de ejemplo (paso 1: archivo)" />
            <p className="mt-1.5 text-center text-xs text-muted-foreground sm:text-right">Mira cómo queda antes de usar tus datos</p>
          </div>
        </div>

        {pendiente && <Confirmar pregunta="¿Reemplazar tu archivo y tus datos con un ejemplo?" alConfirmar={() => cargarEjemploCompleto(pendiente.indice)} alCancelar={() => setPendiente(null)} />}

        {modoEjemplo && !avisoCerrado && (
          <div role="note" data-aviso-ejemplo className="aparecer mt-4 flex flex-col gap-3 rounded-lg border bg-brand-muted p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong className="font-semibold">Estás viendo datos de ejemplo</strong> (perfil: {perfil.etiqueta}). Todo es ficticio: no son clientes reales. Bórralos y sube tu archivo cuando quieras.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secundario" onClick={() => pedirEjemplo((indice + 1) % EJEMPLOS_SEGMENTAR_CLIENTES.length)}>
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
              Ver tus segmentos (abajo) ↓
            </a>
            <FormularioSegmentarClientes ficha={ficha} sugerenciaTransacciones={sugerenciaTransacciones} cargando={cargando} error={errorDatos} onArchivo={alSubirArchivo} onQuitarArchivo={quitarArchivo} alBorrar={limpiar} />
          </div>
          <div id="resumen-movil" className="min-w-0 scroll-mt-24 lg:sticky lg:top-20">
            <ResumenVivoSegmentos resumen={resumen} clientesSegmentados={clientesSegmentados} matriz={matriz} datos={datos} />
          </div>
        </div>
      </section>

      <section id="paso-2" aria-labelledby="titulo-paso-2-segmentar" className="scroll-mt-24">
        <div className="max-w-2xl">
          <h2 id="titulo-paso-2-segmentar" className="text-xl font-semibold leading-tight sm:text-2xl">
            2. Copia el prompt
          </h2>
        </div>
        <div className="mt-6">
          <PanelPromptSegmentar
            datos={datos}
            ficha={ficha}
            resumen={resumen}
            totalClientes={clientes.length}
            mapeoListo={mapeoListo}
            fechaListo={fechaListo}
            alCopiar={() => {
              setCopiado(true);
              mostrar("Prompt copiado. Pégalo en tu IA.");
            }}
          />
        </div>
      </section>

      <ResultadoSegmentar
        respuesta={respuesta}
        alCambiar={setRespuesta}
        datos={datos}
        ficha={ficha}
        resumen={resumen}
        totalClientes={clientes.length}
        esDeEjemplo={esRespuestaDeEjemplo}
        alExportar={(tipo) => {
          if (esRespuestaDeEjemplo) registrarEvento("ejemplo_descargado", { herramienta: HERRAMIENTA, perfil: perfil.id, formato: tipo });
        }}
        accionesDeEjemplo={
          <div>
            <BotonEjemplo alHacer={() => pedirEjemplo(indice)} etiquetaAria="Llenar con datos de ejemplo (paso 3: segmentos)" />
            <p className="mt-1.5 text-center text-xs text-muted-foreground sm:text-right">Mira cómo queda antes de usar tus datos</p>
            {esRespuestaDeEjemplo && (
              <div className="mt-2 flex flex-col items-center gap-1 sm:items-end">
                <button type="button" className="btn btn-texto" onClick={otroEjemplo}>
                  <RefreshCw aria-hidden className="size-4" /> Otro ejemplo
                </button>
                <p className="text-center text-xs text-muted-foreground sm:text-right">
                  Perfil: {ejemploDeLaRespuesta!.etiqueta}. Es una respuesta ilustrativa escrita por el autor, no de una IA real.
                </p>
              </div>
            )}
          </div>
        }
      />

      <ResumenImprimibleSegmentar datos={datos} lectura={lectura} resumen={resumen} esEjemplo={esRespuestaDeEjemplo} />

      <AvisoToast toast={toast} alCerrar={() => setToast(null)} />
    </div>
  );
}
