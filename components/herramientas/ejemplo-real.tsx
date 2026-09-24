import { mediaExists } from "@/lib/guides/media";
import type { CapturaPendiente, EjemploReal as EjemploRealDatos } from "@/lib/herramientas/tipos";
import { CapturaFigura } from "./captura-figura";

/**
 * Bloque 6: el caso de ejemplo, sus capturas y «Qué corregí yo». Cada imagen lleva su etiqueta honesta
 * («Prueba real» solo para capturas reales de un chat; «Ilustración» o «Simulación» para lo demás).
 * Si un archivo no existe no se muestra nada: la página no enseña marcadores ni notas de producción.
 */
export function EjemploReal({ ejemplo, pendientes = [] }: { ejemplo: EjemploRealDatos; pendientes?: CapturaPendiente[] }) {
  const capturas = ejemplo.capturas.filter((c) => mediaExists(c.src));
  // `pendientes` llega ya filtrado por la página (`pendientesVisibles`): solo con `next dev` trae recuadros; en un build de producción, nunca.
  const datos = Object.entries(ejemplo.datos);

  return (
    <div>
      <p className="text-[0.97rem] font-semibold text-guide-ink">{ejemplo.negocio}</p>

      {datos.length > 0 && (
        <dl className="mt-3 grid gap-x-6 gap-y-2 rounded-xl border bg-guide-surface p-4 sm:grid-cols-2">
          {datos.map(([campo, valor]) => (
            <div key={campo} className="min-w-0">
              <dt className="text-sm text-muted-foreground">{campo}</dt>
              <dd className="text-[0.97rem] text-foreground">{valor}</dd>
            </div>
          ))}
        </dl>
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

      {capturas.map((captura) => (
        <CapturaFigura key={captura.src} captura={captura} />
      ))}

      {pendientes.length > 0 && (
        <div className="mt-6 space-y-3" data-capturas-pendientes>
          {pendientes.map((p) => (
            <div key={p.archivo} className="rounded-xl border-2 border-dashed border-foreground/40 bg-muted/60 p-5 text-sm leading-relaxed text-foreground/80">
              <p className="font-mono text-[0.8rem] font-semibold text-foreground">{p.archivo}</p>
              <p className="mt-1">
                <span className="font-semibold">{p.etiqueta}</span> · captura pendiente (solo visible en revisión)
              </p>
              <p className="mt-1">{p.muestra}</p>
            </div>
          ))}
        </div>
      )}

      {ejemplo.queCorregi.length > 0 && (
        <div className="mt-6 rounded-xl border-l-[3px] border-brand bg-guide-surface px-5 py-4">
          <h3 className="text-base font-semibold text-guide-ink">Qué corregí yo</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.97rem] leading-relaxed text-foreground/90">
            {ejemplo.queCorregi.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
