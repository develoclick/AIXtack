"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AlertTriangle, Circle, Mic, Pause, Play, RotateCcw, Square, Trash2, Download } from "lucide-react";
import { almacenNotas } from "./almacenes";
import { contradicciones } from "@/lib/entrevista/historias";

/** Duración de cada respuesta: 2 minutos, como pide la práctica. */
export const SEGUNDOS_POR_RESPUESTA = 120;
/** A partir de estas palabras, las notas ya parecen un guion completo. */
const PALABRAS_DE_GUION = 120;

export interface PreguntaPractica {
  categoria?: string;
  texto: string;
  estructura?: string;
  experiencia?: string;
  repregunta?: string;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Cronometro({ alTerminar }: { alTerminar: () => void }) {
  const [restante, setRestante] = useState(SEGUNDOS_POR_RESPUESTA);
  const [corriendo, setCorriendo] = useState(false);
  const [aviso, setAviso] = useState("");
  const fin = useRef(0);

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      const r = Math.max(0, Math.ceil((fin.current - Date.now()) / 1000));
      setRestante(r);
      if (r === 0) {
        setCorriendo(false);
        setAviso("Se acabó el tiempo: cierra tu respuesta.");
        alTerminar();
      }
    }, 250);
    return () => clearInterval(id);
  }, [corriendo, alTerminar]);

  function iniciar() {
    const desde = restante === 0 ? SEGUNDOS_POR_RESPUESTA : restante;
    setRestante(desde);
    fin.current = Date.now() + desde * 1000;
    setAviso("Cronómetro en marcha.");
    setCorriendo(true);
  }

  function pausar() {
    setCorriendo(false);
    setAviso(`Pausado. Llevas ${mmss(SEGUNDOS_POR_RESPUESTA - restante)}.`);
  }

  function reiniciar() {
    setCorriendo(false);
    setRestante(SEGUNDOS_POR_RESPUESTA);
    setAviso("Cronómetro reiniciado.");
  }

  const porcentaje = ((SEGUNDOS_POR_RESPUESTA - restante) / SEGUNDOS_POR_RESPUESTA) * 100;
  const poco = restante <= 20 && restante > 0;

  return (
    <div className="rounded-lg border bg-surface p-4" data-cronometro>
      <p className="text-sm font-semibold">Cronómetro de respuesta (2 minutos)</p>
      <p role="timer" aria-live="off" data-tiempo className={`mt-2 text-5xl font-bold tabular ${restante === 0 ? "text-destructive" : poco ? "text-warn" : ""}`}>
        {mmss(restante)}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background" aria-hidden>
        <div className={`h-full rounded-full transition-all ${restante === 0 ? "bg-destructive" : poco ? "bg-warn" : "bg-brand-solid"}`} style={{ width: `${porcentaje}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {corriendo ? (
          <button type="button" className="btn btn-secundario" onClick={pausar}>
            <Pause aria-hidden className="size-4" /> Pausar
          </button>
        ) : (
          <button type="button" className="btn btn-primario" onClick={iniciar}>
            <Play aria-hidden className="size-4" /> {restante === SEGUNDOS_POR_RESPUESTA ? "Iniciar" : restante === 0 ? "Empezar de nuevo" : "Continuar"}
          </button>
        )}
        <button type="button" className="btn btn-secundario" onClick={reiniciar}>
          <RotateCcw aria-hidden className="size-4" /> Reiniciar
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {aviso}
      </p>
    </div>
  );
}

type EstadoGrabacion = "reposo" | "grabando" | "lista" | "error";

const soportaGrabacion = () => typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
const sinSuscripcion = () => () => {};

/**
 * Grabadora de audio con MediaRecorder: la grabación vive solo en la memoria del navegador (no se sube a ningún servidor ni
 * se guarda en el equipo hasta que la descargas) y se pierde al cerrar la página.
 */
function Grabadora() {
  const soportado = useSyncExternalStore(sinSuscripcion, soportaGrabacion, () => true);
  const [estado, setEstado] = useState<EstadoGrabacion>("reposo");
  const [url, setUrl] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const grabador = useRef<MediaRecorder | null>(null);
  const flujo = useRef<MediaStream | null>(null);
  const trozos = useRef<Blob[]>([]);

  useEffect(
    () => () => {
      flujo.current?.getTracks().forEach((t) => t.stop());
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  async function grabar() {
    setMensaje("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      flujo.current = stream;
      trozos.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) trozos.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(trozos.current, { type: rec.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        setUrl((anterior) => {
          if (anterior) URL.revokeObjectURL(anterior);
          return URL.createObjectURL(blob);
        });
        setEstado("lista");
        setMensaje("Grabación lista. Escúchala y compárala con lo que querías decir.");
      };
      grabador.current = rec;
      rec.start();
      setEstado("grabando");
      setMensaje("Grabando… habla como en la entrevista.");
    } catch {
      setEstado("error");
      setMensaje("No pude acceder al micrófono. Revisa el permiso del navegador para este sitio y vuelve a intentarlo.");
    }
  }

  function detener() {
    grabador.current?.stop();
  }

  function descartar() {
    setUrl((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return null;
    });
    setEstado("reposo");
    setMensaje("Grabación descartada.");
  }

  return (
    <div className="rounded-lg border bg-surface p-4" data-grabadora>
      <p className="text-sm font-semibold">Grabar mi respuesta</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Escucharte ayuda a notar muletillas, silencios y respuestas que se alargan. El audio no sale de tu navegador y se pierde al cerrar la página, salvo que lo descargues.</p>
      {!soportado ? (
        <p role="alert" className="mt-3 text-sm font-medium text-warn">
          Tu navegador no permite grabar audio. Prueba con una versión reciente de Chrome, Edge, Firefox o Safari.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {estado === "grabando" ? (
            <button type="button" className="btn btn-primario" onClick={detener}>
              <Square aria-hidden className="size-4" /> Detener
            </button>
          ) : (
            <button type="button" className="btn btn-secundario" onClick={grabar}>
              <Mic aria-hidden className="size-4" /> {estado === "lista" ? "Grabar de nuevo" : "Grabar respuesta"}
            </button>
          )}
          {estado === "grabando" && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-destructive">
              <Circle aria-hidden className="size-3 animate-pulse fill-current" /> Grabando
            </span>
          )}
        </div>
      )}
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {mensaje}
      </p>
      {url && (
        <div className="mt-2 space-y-2">
          <audio controls src={url} className="w-full" aria-label="Tu grabación" />
          <div className="flex flex-wrap gap-2">
            <a href={url} download="mi-respuesta.webm" className="btn btn-secundario">
              <Download aria-hidden className="size-4" /> Descargar grabación
            </a>
            <button type="button" className="btn btn-texto" onClick={descartar}>
              <Trash2 aria-hidden className="size-4" /> Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  pregunta: PreguntaPractica | null;
  alCambiarPregunta: (texto: string) => void;
  /** Texto del CV (y de lo que la persona destaca): base para detectar datos de las notas que no coinciden con el CV. */
  fuenteCv: string;
  alTerminarTiempo: () => void;
}

/** Práctica cronometrada: pregunta, cronómetro de 2 minutos, grabadora y hoja de notas con detector de contradicciones. */
export function PracticaCronometrada({ pregunta, alCambiarPregunta, fuenteCv, alTerminarTiempo }: Props) {
  const { notas } = almacenNotas.useDatos();
  const palabras = notas.split(/\s+/).filter(Boolean).length;
  const contra = fuenteCv.trim() && notas.trim() ? contradicciones(fuenteCv, notas.split("\n").map((l) => l.trim()).filter(Boolean).join("\n")) : { numeros: [], nombres: [] };
  const hay = contra.numeros.length + contra.nombres.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="pregunta-practica" className="mb-1.5 block text-sm font-semibold">
          Pregunta que vas a practicar
        </label>
        <textarea id="pregunta-practica" className="campo min-h-16" value={pregunta?.texto ?? ""} onChange={(e) => alCambiarPregunta(e.target.value)} placeholder="Elige «Practicar esta» en el banco de preguntas o escribe la tuya. Ej.: Cuéntame sobre ti." />
        {pregunta?.categoria && <p className="mt-1.5 text-xs text-muted-foreground">Categoría: {pregunta.categoria}</p>}
      </div>

      {(pregunta?.estructura || pregunta?.experiencia || pregunta?.repregunta) && (
        <dl className="space-y-2 rounded-lg border p-3 text-sm" data-guia-pregunta>
          {pregunta.experiencia && (
            <div>
              <dt className="font-semibold">Experiencia real de tu CV</dt>
              <dd className="text-muted-foreground">{pregunta.experiencia}</dd>
            </div>
          )}
          {pregunta.estructura && (
            <div>
              <dt className="font-semibold">Estructura sugerida (solo el esqueleto)</dt>
              <dd className="text-muted-foreground">{pregunta.estructura}</dd>
            </div>
          )}
          {pregunta.repregunta && (
            <div>
              <dt className="font-semibold">Repregunta probable</dt>
              <dd className="text-muted-foreground">{pregunta.repregunta}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Cronometro alTerminar={alTerminarTiempo} />
        <Grabadora />
      </div>

      <div>
        <label htmlFor="notas-practica" className="mb-1.5 block text-sm font-semibold">
          Hoja para anotar
        </label>
        <textarea
          id="notas-practica"
          className="campo min-h-32"
          value={notas}
          onChange={(e) => almacenNotas.guardar({ notas: e.target.value })}
          placeholder="Anota los puntos clave de tu respuesta, no un guion: idea principal, un dato real y el resultado."
          aria-describedby="ayuda-notas"
        />
        <p id="ayuda-notas" className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Se guarda en tu navegador. Palabras: <span className="tabular">{palabras}</span>.
        </p>
        <div role="status" aria-live="polite" className="mt-2 space-y-2">
          {palabras >= PALABRAS_DE_GUION && (
            <p className="flex gap-2 rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm" data-aviso-guion>
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
              <span>Esto ya parece un guion completo. Un guion memorizado suena artificial y se olvida en cuanto te interrumpen: reduce tus notas a puntos clave.</span>
            </p>
          )}
          {hay && (
            <p className="flex gap-2 rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm" data-aviso-contradiccion>
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
              <span>
                Tus notas mencionan datos que no aparecen en tu CV:{" "}
                <strong className="font-semibold">{[...contra.numeros, ...contra.nombres].join(", ")}</strong>. Un entrevistador compara lo que dices con lo que escribiste: confirma que coincidan o prepárate para explicar la diferencia.
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
