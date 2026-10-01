"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { AvisoToast, type ToastDatos } from "@/components/prompts/cv/aviso-toast";
import { Pasos, type EstadoPaso } from "@/components/prompts/cv/pasos";
import { almacenAnalisisVentas } from "./almacen";
import { FormularioAnalisisVentas } from "./formulario-archivo";
import { PanelPromptAnalisisVentas } from "./panel-prompt-analisis";
import { ResultadoAnalisisVentas } from "./resultado-analisis";
import { ResumenImprimible } from "./resumen-imprimible";
import { ResumenVivo } from "./resumen-vivo";
import { EJEMPLOS_ANALISIS_VENTAS } from "@/content/ejemplos/analizar-ventas";
import { registrarEvento } from "@/lib/analitica";
import { armarResumenAnalisis, filasVentaDesdeMapeo, mapeoMinimo } from "@/lib/analizar-ventas/calculo";
import { fichaDeHoja, sugerirMapeo } from "@/lib/analizar-ventas/ficha";
import { leerRespuestaAnalisisVentas } from "@/lib/analizar-ventas/lector";
import { leerArchivoVentas, type HojaCruda } from "@/lib/analizar-ventas/parser";
import { mapeoVacio } from "@/lib/analizar-ventas/tipos";

type Pendiente = null | { indice: number };

const HERRAMIENTA = "analizar-ventas-con-excel";

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

export function GeneradorAnalisisVentas() {
  const datos = almacenAnalisisVentas.useDatos();
  const modoEjemplo = almacenAnalisisVentas.useModoEjemplo();
  const [hojas, setHojas] = useState<HojaCruda[] | null>(null);
  const [hojaActiva, setHojaActiva] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [toast, setToast] = useState<ToastDatos | null>(null);
  const [indice, setIndice] = useState(0);
  const [version, setVersion] = useState(0);
  const [pendiente, setPendiente] = useState<Pendiente>(null);
  const [avisoCerrado, setAvisoCerrado] = useState(false);
  const idToast = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const archivoPrevioRef = useRef<{ hojas: HojaCruda[] | null; hojaActiva: string } | null>(null);

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

  const hojaSeleccionada = hojas?.find((h) => h.nombre === hojaActiva) ?? null;
  const ficha = useMemo(() => (hojaSeleccionada && hojas ? fichaDeHoja(datos.nombreArchivo || hojaSeleccionada.nombre, hojas, hojaActiva) : null), [hojas, hojaActiva, hojaSeleccionada, datos.nombreArchivo]);
  const filas = useMemo(() => (hojaSeleccionada ? filasVentaDesdeMapeo(hojaSeleccionada, datos.mapeo) : []), [hojaSeleccionada, datos.mapeo]);
  const mapeoListo = mapeoMinimo(datos.mapeo, filas.length);
  const resumen = useMemo(() => (mapeoListo ? armarResumenAnalisis(filas, datos.mapeo, { desde: datos.periodoDesde, hasta: datos.periodoHasta }, { desde: datos.comparacionDesde, hasta: datos.comparacionHasta }) : null), [mapeoListo, filas, datos.mapeo, datos.periodoDesde, datos.periodoHasta, datos.comparacionDesde, datos.comparacionHasta]);

  const perfil = EJEMPLOS_ANALISIS_VENTAS[indice];
  const ejemploDeLaRespuesta = EJEMPLOS_ANALISIS_VENTAS.find((e) => e.respuesta.trim() === respuesta.trim() && respuesta.trim() !== "");
  const esRespuestaDeEjemplo = Boolean(ejemploDeLaRespuesta);
  const lectura = useMemo(() => (respuesta.trim() ? leerRespuestaAnalisisVentas(respuesta) : null), [respuesta]);
  const respuestaValida = lectura?.valido ?? false;

  async function alSubirArchivo(archivo: File) {
    setErrorArchivo(null);
    setCargando(true);
    try {
      const leido = await leerArchivoVentas(archivo);
      if (leido.hojas.length === 0) throw new Error("No encontré datos en este archivo. Revisa que tenga una fila de encabezado y al menos una fila de datos.");
      setHojas(leido.hojas);
      setHojaActiva(leido.hojas[0].nombre);
      const fichaInicial = fichaDeHoja(archivo.name, leido.hojas, leido.hojas[0].nombre);
      const mapeoSugerido = sugerirMapeo(fichaInicial);
      almacenAnalisisVentas.guardar({ ...datos, nombreArchivo: archivo.name, mapeo: mapeoSugerido, respuestaAnalisis: "" });
      setRespuesta("");
      registrarEvento("archivo_subido", { herramienta: HERRAMIENTA, filas: fichaInicial.totalFilas, hojas: leido.hojas.length });
    } catch (e) {
      setErrorArchivo(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    } finally {
      setCargando(false);
    }
  }

  function cambiarHoja(nombre: string) {
    if (!hojas) return;
    setHojaActiva(nombre);
    const nuevaFicha = fichaDeHoja(datos.nombreArchivo, hojas, nombre);
    almacenAnalisisVentas.guardar({ ...datos, mapeo: sugerirMapeo(nuevaFicha) });
  }

  function quitarArchivo() {
    setHojas(null);
    setHojaActiva("");
    setErrorArchivo(null);
    almacenAnalisisVentas.guardar({ ...datos, nombreArchivo: "", mapeo: mapeoVacio() });
  }

  function limpiar() {
    almacenAnalisisVentas.borrar();
    setHojas(null);
    setHojaActiva("");
    setErrorArchivo(null);
    setRespuesta("");
    setVersion((v) => v + 1);
    registrarEvento("ejemplo_limpiado", { herramienta: HERRAMIENTA, perfil: perfil.id });
    mostrar("Formulario limpio. Sube tu archivo.");
  }

  function cargarEjemploCompleto(i: number) {
    const ejemplo = EJEMPLOS_ANALISIS_VENTAS[i];
    const habiaDatos = almacenAnalisisVentas.hayDatosDeLaPersona(datos) || Boolean(respuesta.trim() && !esRespuestaDeEjemplo);
    if (!modoEjemplo) archivoPrevioRef.current = { hojas, hojaActiva };
    const previo = almacenAnalisisVentas.cargarEjemplo(ejemplo.datos);
    setHojas([{ nombre: ejemplo.nombreArchivo, filas: ejemplo.filasCrudas, truncado: false }]);
    setHojaActiva(ejemplo.nombreArchivo);
    setRespuesta(ejemplo.respuesta);
    setIndice(i);
    setVersion((v) => v + 1);
    setPendiente(null);
    setAvisoCerrado(false);
    setErrorArchivo(null);
    registrarEvento("ejemplo_rellenado", { herramienta: HERRAMIENTA, perfil: ejemplo.id });
    mostrar(
      "Formulario llenado con datos de ejemplo.",
      habiaDatos
        ? {
            etiqueta: "Deshacer",
            alHacer: () => {
              almacenAnalisisVentas.deshacerEjemplo(previo);
              setHojas(archivoPrevioRef.current?.hojas ?? null);
              setHojaActiva(archivoPrevioRef.current?.hojaActiva ?? "");
              setRespuesta("");
              archivoPrevioRef.current = null;
              setVersion((v) => v + 1);
              mostrar("Recuperé lo que habías escrito.");
            },
          }
        : undefined,
    );
  }

  function pedirEjemplo(i: number) {
    const hayAlgoQuePerder = almacenAnalisisVentas.hayDatosDeLaPersona(datos) || Boolean(respuesta.trim() && !esRespuestaDeEjemplo) || hojas !== null;
    if (hayAlgoQuePerder && !modoEjemplo) setPendiente({ indice: i });
    else cargarEjemploCompleto(i);
  }

  function otroEjemplo() {
    cargarEjemploCompleto((indice + 1) % EJEMPLOS_ANALISIS_VENTAS.length);
  }

  const completos = [Boolean(hojas) && mapeoListo, copiado, respuestaValida];
  const activo = completos.findIndex((c) => !c);
  const estados = completos.map((c, i): EstadoPaso => (c ? "completo" : i === activo ? "activo" : "pendiente")) as [EstadoPaso, EstadoPaso, EstadoPaso];

  return (
    <div className="space-y-8">
      <Pasos estados={estados} textos={{ tres: "Tu informe", ayudaTres: "Calidad de datos, hallazgos e hipótesis" }} />

      <section id="paso-1" aria-labelledby="titulo-paso-1-ventas" className="scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 id="titulo-paso-1-ventas" className="text-xl font-semibold leading-tight sm:text-2xl">
              1. Tu archivo de ventas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Sube tu Excel o CSV, revisa el mapeo de columnas y verás tu dashboard al instante.</p>
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
              <strong className="font-semibold">Estás viendo datos de ejemplo</strong> (perfil: {perfil.etiqueta}). Todo es ficticio: no es un negocio real. Bórralos y sube tu archivo cuando quieras.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secundario" onClick={() => pedirEjemplo((indice + 1) % EJEMPLOS_ANALISIS_VENTAS.length)}>
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
              Ver tu dashboard (abajo) ↓
            </a>
            <FormularioAnalisisVentas ficha={ficha} hojasDisponibles={hojas?.map((h) => h.nombre) ?? []} cargando={cargando} error={errorArchivo} onArchivo={alSubirArchivo} onCambiarHoja={cambiarHoja} onQuitarArchivo={quitarArchivo} alBorrar={limpiar} />
          </div>
          <div id="resumen-movil" className="min-w-0 scroll-mt-24 lg:sticky lg:top-20">
            <ResumenVivo resumen={resumen} moneda={datos.moneda} />
          </div>
        </div>
      </section>

      <section id="paso-2" aria-labelledby="titulo-paso-2-ventas" className="scroll-mt-24">
        <div className="max-w-2xl">
          <h2 id="titulo-paso-2-ventas" className="text-xl font-semibold leading-tight sm:text-2xl">
            2. Copia el prompt
          </h2>
        </div>
        <div className="mt-6">
          <PanelPromptAnalisisVentas
            datos={datos}
            ficha={ficha}
            resumen={resumen}
            mapeoListo={mapeoListo}
            hayArchivo={Boolean(hojas)}
            alCopiar={() => {
              setCopiado(true);
              mostrar("Prompt copiado. Pégalo en tu IA.");
            }}
          />
        </div>
      </section>

      <ResultadoAnalisisVentas
        respuesta={respuesta}
        alCambiar={setRespuesta}
        datos={datos}
        ficha={ficha}
        resumen={resumen}
        esDeEjemplo={esRespuestaDeEjemplo}
        alExportar={(tipo) => {
          if (esRespuestaDeEjemplo) registrarEvento("ejemplo_descargado", { herramienta: HERRAMIENTA, perfil: perfil.id, formato: tipo });
        }}
        accionesDeEjemplo={
          <div>
            <BotonEjemplo alHacer={() => pedirEjemplo(indice)} etiquetaAria="Llenar con datos de ejemplo (paso 3: informe)" />
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

      <ResumenImprimible datos={datos} resumen={resumen} lectura={lectura} esEjemplo={esRespuestaDeEjemplo} />

      <AvisoToast toast={toast} alCerrar={() => setToast(null)} />
    </div>
  );
}
