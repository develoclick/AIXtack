"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { AvisoToast, type ToastDatos } from "@/components/prompts/cv/aviso-toast";
import { Pasos, type EstadoPaso } from "@/components/prompts/cv/pasos";
import { almacenConvertirGraficos } from "./almacen";
import { FormularioDatosGraficos } from "./formulario-datos";
import { PanelPromptGraficos } from "./panel-prompt-graficos";
import { ResultadoGraficos } from "./resultado-graficos";
import { ResumenImprimible } from "./resumen-imprimible";
import { ResumenVivo } from "./resumen-vivo";
import { EJEMPLOS_CONVERTIR_GRAFICOS } from "@/content/ejemplos/convertir-graficos";
import { registrarEvento } from "@/lib/analitica";
import { fichaDeHoja, filasTablaDesdeHoja } from "@/lib/convertir-graficos/ficha";
import { leerRespuestaConvertirGraficos } from "@/lib/convertir-graficos/lector";
import { leerArchivoTabular, leerTablaPegada, type HojaCruda } from "@/lib/convertir-graficos/parser";
import { seleccionVacia } from "@/lib/convertir-graficos/tipos";

type Pendiente = null | { indice: number };

const HERRAMIENTA = "convertir-datos-en-graficos";

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

export function GeneradorConvertirGraficos() {
  const datos = almacenConvertirGraficos.useDatos();
  const modoEjemplo = almacenConvertirGraficos.useModoEjemplo();
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
  const filas = useMemo(() => (hoja ? filasTablaDesdeHoja(hoja).filas : []), [hoja]);
  const seleccionLista = Boolean(ficha && datos.seleccion.x !== null);

  const perfil = EJEMPLOS_CONVERTIR_GRAFICOS[indice];
  const ejemploDeLaRespuesta = EJEMPLOS_CONVERTIR_GRAFICOS.find((e) => e.respuesta.trim() === respuesta.trim() && respuesta.trim() !== "");
  const esRespuestaDeEjemplo = Boolean(ejemploDeLaRespuesta);
  const lectura = useMemo(() => (respuesta.trim() ? leerRespuestaConvertirGraficos(respuesta) : null), [respuesta]);
  const respuestaValida = lectura?.valido ?? false;

  async function alSubirArchivo(archivo: File) {
    setErrorDatos(null);
    setCargando(true);
    try {
      const leido = await leerArchivoTabular(archivo);
      if (leido.hojas.length === 0 || leido.hojas[0].filas.length === 0) throw new Error("No encontré datos en este archivo. Revisa que tenga una fila de encabezado y al menos una fila de datos.");
      setHoja(leido.hojas[0]);
      almacenConvertirGraficos.guardar({ ...datos, nombreOrigen: archivo.name, seleccion: seleccionVacia() });
      setRespuesta("");
      registrarEvento("archivo_subido", { herramienta: HERRAMIENTA, filas: leido.hojas[0].filas.length - 1 });
    } catch (e) {
      setErrorDatos(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    } finally {
      setCargando(false);
    }
  }

  function alPegarTabla(texto: string) {
    setErrorDatos(null);
    const { filas: filasPegadas, truncado } = leerTablaPegada(texto);
    if (filasPegadas.length < 2) {
      setErrorDatos("No pude leer una tabla en ese texto. Pega, al menos, una fila de encabezado y una fila de datos.");
      return;
    }
    setHoja({ nombre: "Tabla pegada", filas: filasPegadas, truncado });
    almacenConvertirGraficos.guardar({ ...datos, nombreOrigen: "Tabla pegada", seleccion: seleccionVacia() });
    setRespuesta("");
    registrarEvento("archivo_subido", { herramienta: HERRAMIENTA, filas: filasPegadas.length - 1, modo: "pegado" });
  }

  function quitarDatos() {
    setHoja(null);
    setErrorDatos(null);
    almacenConvertirGraficos.guardar({ ...datos, nombreOrigen: "", seleccion: seleccionVacia() });
  }

  function limpiar() {
    almacenConvertirGraficos.borrar();
    setHoja(null);
    setErrorDatos(null);
    setRespuesta("");
    setVersion((v) => v + 1);
    registrarEvento("ejemplo_limpiado", { herramienta: HERRAMIENTA, perfil: perfil.id });
    mostrar("Formulario limpio. Pega o sube tu tabla.");
  }

  function cargarEjemploCompleto(i: number) {
    const ejemplo = EJEMPLOS_CONVERTIR_GRAFICOS[i];
    const habiaDatos = almacenConvertirGraficos.hayDatosDeLaPersona(datos) || Boolean(respuesta.trim() && !esRespuestaDeEjemplo) || hoja !== null;
    if (!modoEjemplo) hojaPreviaRef.current = hoja;
    const previo = almacenConvertirGraficos.cargarEjemplo(ejemplo.datos);
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
              almacenConvertirGraficos.deshacerEjemplo(previo);
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
    const hayAlgoQuePerder = almacenConvertirGraficos.hayDatosDeLaPersona(datos) || Boolean(respuesta.trim() && !esRespuestaDeEjemplo) || hoja !== null;
    if (hayAlgoQuePerder && !modoEjemplo) setPendiente({ indice: i });
    else cargarEjemploCompleto(i);
  }

  function otroEjemplo() {
    cargarEjemploCompleto((indice + 1) % EJEMPLOS_CONVERTIR_GRAFICOS.length);
  }

  const completos = [Boolean(ficha) && seleccionLista, copiado, respuestaValida];
  const activo = completos.findIndex((c) => !c);
  const estados = completos.map((c, i): EstadoPaso => (c ? "completo" : i === activo ? "activo" : "pendiente")) as [EstadoPaso, EstadoPaso, EstadoPaso];

  return (
    <div className="space-y-8">
      <Pasos estados={estados} textos={{ tres: "Tus gráficos", ayudaTres: "Sugeridos por tu IA, dibujados con tus datos" }} />

      <section id="paso-1" aria-labelledby="titulo-paso-1-graficos" className="scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 id="titulo-paso-1-graficos" className="text-xl font-semibold leading-tight sm:text-2xl">
              1. Tu tabla y tu objetivo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Pega tu tabla o sube un archivo, elige qué quieres responder y verás un gráfico al instante.</p>
          </div>
          <div className="sm:w-64 sm:shrink-0">
            <BotonEjemplo alHacer={() => pedirEjemplo(modoEjemplo ? indice : 0)} etiquetaAria="Llenar con datos de ejemplo (paso 1: tabla)" />
            <p className="mt-1.5 text-center text-xs text-muted-foreground sm:text-right">Mira cómo queda antes de usar tus datos</p>
          </div>
        </div>

        {pendiente && <Confirmar pregunta="¿Reemplazar tu tabla y tus datos con un ejemplo?" alConfirmar={() => cargarEjemploCompleto(pendiente.indice)} alCancelar={() => setPendiente(null)} />}

        {modoEjemplo && !avisoCerrado && (
          <div role="note" data-aviso-ejemplo className="aparecer mt-4 flex flex-col gap-3 rounded-lg border bg-brand-muted p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong className="font-semibold">Estás viendo datos de ejemplo</strong> (perfil: {perfil.etiqueta}). Todo es ficticio: no es un negocio real. Bórralos y pega tu tabla cuando quieras.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secundario" onClick={() => pedirEjemplo((indice + 1) % EJEMPLOS_CONVERTIR_GRAFICOS.length)}>
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
              Ver tu gráfico (abajo) ↓
            </a>
            <FormularioDatosGraficos ficha={ficha} cargando={cargando} error={errorDatos} onArchivo={alSubirArchivo} onPegar={alPegarTabla} onQuitar={quitarDatos} alBorrar={limpiar} />
          </div>
          <div id="resumen-movil" className="min-w-0 scroll-mt-24 lg:sticky lg:top-20">
            <ResumenVivo ficha={ficha} filas={filas} datos={datos} />
          </div>
        </div>
      </section>

      <section id="paso-2" aria-labelledby="titulo-paso-2-graficos" className="scroll-mt-24">
        <div className="max-w-2xl">
          <h2 id="titulo-paso-2-graficos" className="text-xl font-semibold leading-tight sm:text-2xl">
            2. Copia el prompt
          </h2>
        </div>
        <div className="mt-6">
          <PanelPromptGraficos
            datos={datos}
            ficha={ficha}
            seleccionLista={seleccionLista}
            alCopiar={() => {
              setCopiado(true);
              mostrar("Prompt copiado. Pégalo en tu IA.");
            }}
          />
        </div>
      </section>

      <ResultadoGraficos
        respuesta={respuesta}
        alCambiar={setRespuesta}
        datos={datos}
        ficha={ficha}
        filas={filas}
        esDeEjemplo={esRespuestaDeEjemplo}
        alExportar={(tipo) => {
          if (esRespuestaDeEjemplo) registrarEvento("ejemplo_descargado", { herramienta: HERRAMIENTA, perfil: perfil.id, formato: tipo });
        }}
        accionesDeEjemplo={
          <div>
            <BotonEjemplo alHacer={() => pedirEjemplo(indice)} etiquetaAria="Llenar con datos de ejemplo (paso 3: gráficos)" />
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

      <ResumenImprimible datos={datos} lectura={lectura} filas={filas} esEjemplo={esRespuestaDeEjemplo} />

      <AvisoToast toast={toast} alCerrar={() => setToast(null)} />
    </div>
  );
}
