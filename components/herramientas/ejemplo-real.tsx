import type { CalculoEjemplo, DatoEjemplo } from "@/lib/herramientas/ejemplo";
import type { ImagenResuelta } from "@/lib/herramientas/imagenes";
import { lineasQueCorregi } from "@/lib/herramientas/proceso";
import type { EjemploReal as EjemploRealDatos } from "@/lib/herramientas/tipos";
import { gruposDelEjemplo } from "@/lib/herramientas/ubicaciones";
import { estadoDeEspacio } from "@/lib/herramientas/vista-previa";
import { EspacioDeImagen } from "./espacio-imagen";

/**
 * Bloque «Un ejemplo, paso a paso»: el caso de ejemplo, sus imágenes y «Qué corregí yo». Las imágenes son los espacios de imagen
 * de la página que van en el ejemplo (preparación, un paso o «ejemplo»): aparecen solas cuando existe su archivo, con su etiqueta
 * honesta («Prueba real» solo para capturas reales de un chat), su leyenda, su nota y la lupa. Una imagen que falta no enseña
 * nada, salvo el recuadro de vista previa de un borrador (ver EspacioDeImagen).
 */
export function EjemploReal({
  ejemplo,
  datos,
  calculos = [],
  imagenes = [],
  publicado = false,
  vistaPrevia,
  pasos = [],
}: {
  ejemplo: EjemploRealDatos;
  datos: DatoEjemplo[];
  calculos?: CalculoEjemplo[];
  /** Los espacios de imagen de la página, ya resueltos contra los archivos (lib/herramientas/imagenes.ts). */
  imagenes?: ImagenResuelta[];
  /** Si la página está publicada: nunca enseña recuadros vacíos y una imagen obligatoria que falta rompe el build. */
  publicado?: boolean;
  /** Solo para los tests: fuerza la vista previa de los recuadros. */
  vistaPrevia?: boolean;
  /** Pasos del proceso (número y título): las imágenes de un paso salen bajo «Paso N · título». */
  pasos?: { numero: number; titulo: string }[];
}) {
  const grupos = gruposDelEjemplo(imagenes, pasos);
  // La nota de cada imagen sale bajo ella; «Qué corregí yo» son solo las líneas que escribió el autor.
  const lineasCorregi = lineasQueCorregi(ejemplo);
  // «Quién hizo qué» y el tiempo total salen de la prueba real del autor: vacíos, no se muestra nada (tampoco en producción).
  const filasPasos = (ejemplo.pasos ?? []).filter((f) => f.hizoLaIA.trim() && f.hiceYo.trim());
  const tiempoTotal = (ejemplo.tiempoTotal ?? "").trim();
  const tituloDePaso = (n?: number) => {
    if (n === undefined) return null;
    const p = pasos.find((x) => x.numero === n);
    return p ? `Paso ${n} · ${p.titulo}` : `Paso ${n}`;
  };

  return (
    <div>
      <p className="text-[0.97rem] font-semibold text-guide-ink">{ejemplo.negocio}</p>

      {datos.length > 0 && (
        <div className="mt-3">
          <h3 className="text-base font-semibold text-guide-ink">Datos del ejemplo</h3>
          <p className="mt-1 text-sm text-muted-foreground">Son los mismos que rellena «Probar con un ejemplo» en la herramienta de arriba.</p>
          <dl className="mt-2 grid gap-x-6 gap-y-2 rounded-xl border bg-guide-surface p-4 sm:grid-cols-2">
            {datos.map(({ etiqueta, valor }) => {
              const largo = valor.split("\n").length > 1 || valor.length > 240;
              return (
                <div key={etiqueta} className={largo ? "min-w-0 sm:col-span-2" : "min-w-0"}>
                  <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
                  {largo ? (
                    <dd>
                      <details className="text-[0.97rem]">
                        <summary className="guide-focus flex min-h-11 cursor-pointer items-center font-medium text-guide-ink underline underline-offset-2">Ver el texto completo del ejemplo</summary>
                        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-background p-3 font-mono text-[0.8rem] leading-relaxed">{valor}</pre>
                      </details>
                    </dd>
                  ) : (
                    <dd className="text-[0.97rem] text-foreground">{valor}</dd>
                  )}
                </div>
              );
            })}
          </dl>
        </div>
      )}

      {calculos.length > 0 && (
        <div className="mt-4">
          <h3 className="text-base font-semibold text-guide-ink">Lo que calcula la página con esos datos</h3>
          <dl className="mt-2 grid gap-x-6 gap-y-2 rounded-xl border bg-background p-4 sm:grid-cols-2">
            {calculos.map(({ etiqueta, texto }) => (
              <div key={etiqueta} className="min-w-0 border-b border-foreground/10 pb-2">
                <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-guide-ink">{texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {ejemplo.resultado && Object.keys(ejemplo.resultado).length > 0 && (
        <div className="mt-4">
          <h3 className="text-base font-semibold text-guide-ink">Resultado del ejemplo</h3>
          <dl className="mt-2 divide-y rounded-xl border bg-background">
            {Object.entries(ejemplo.resultado).map(([campo, valor]) => (
              <div key={campo} className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
                <dt className="text-sm font-semibold text-guide-ink">{campo}</dt>
                <dd className="text-[0.97rem] text-foreground">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {grupos.map((g) => {
        // Un grupo sin nada que enseñar (imágenes opcionales que faltan en una página publicada) no dibuja ni su título.
        const visibles = g.imagenes.filter((r) => estadoDeEspacio({ existe: Boolean(r.archivo && !r.archivo.error), publicado, obligatoria: r.espacio.obligatoria, vistaPrevia, ruta: r.espacio.archivo }).estado !== "nada");
        if (visibles.length === 0) return null;
        return (
          <div key={g.clave} data-evidencia={g.clave}>
            {g.titulo && <h3 className="mt-6 text-base font-semibold text-guide-ink">{g.titulo}</h3>}
            {visibles.map((r) => (
              <EspacioDeImagen key={r.espacio.id} resuelta={r} publicado={publicado} vistaPrevia={vistaPrevia} />
            ))}
          </div>
        );
      })}

      {ejemplo.transcripcion?.trim() && (
        <details className="mt-6 rounded-xl border bg-background">
          <summary className="guide-focus flex min-h-11 cursor-pointer items-center px-4 font-medium text-guide-ink underline underline-offset-2">
            Respuesta completa de la IA (transcripción del mismo chat)
          </summary>
          <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words border-t p-4 font-mono text-[0.8rem] leading-relaxed">{ejemplo.transcripcion}</pre>
        </details>
      )}

      {(filasPasos.length > 0 || tiempoTotal) && (
        <div data-quien-hizo-que className="mt-6 rounded-xl border bg-background p-4 sm:p-5">
          <h3 className="text-base font-semibold text-guide-ink">Quién hizo qué, paso a paso</h3>
          <ol className="mt-3 grid gap-3">
            {filasPasos.map((f) => (
              <li key={f.paso} className="grid gap-1 rounded-lg border bg-guide-surface p-3 text-[0.97rem] leading-relaxed sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)_5rem] sm:gap-3">
                <span className="font-semibold text-guide-ink">{tituloDePaso(f.paso)}</span>
                <span>
                  <span className="font-semibold text-guide-ink">La IA: </span>
                  {f.hizoLaIA}
                </span>
                <span>
                  <span className="font-semibold text-guide-ink">Yo: </span>
                  {f.hiceYo}
                </span>
                <span className="text-muted-foreground sm:text-right">{f.tiempo}</span>
              </li>
            ))}
          </ol>
          {tiempoTotal && (
            <p className="mt-3 text-[0.97rem] text-guide-ink">
              <span className="font-semibold">Tiempo total: </span>
              {tiempoTotal}
            </p>
          )}
        </div>
      )}

      {lineasCorregi.length > 0 && (
        <div className="mt-6 rounded-xl border-l-[3px] border-brand bg-guide-surface px-5 py-4">
          <h3 className="text-base font-semibold text-guide-ink">Qué corregí yo</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.97rem] leading-relaxed text-foreground/90">
            {lineasCorregi.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
