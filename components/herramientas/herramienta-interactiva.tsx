"use client";

import { BotonCopiar } from "./boton-copiar";
import { Calculadora } from "./calculadora";
import { ConteoPalabras } from "./conteo-palabras";
import { type DatosInteractivos, ProveedorHerramienta, useHerramienta } from "./estado-herramienta";
import { FormularioHerramienta } from "./formulario-herramienta";
import { PanelPerfil } from "./panel-perfil";

export type { DatosInteractivos };

/**
 * El corazón de la página: perfil → formulario → calculadora → (conteos) y, en las herramientas simples, el prompt con su
 * botón «Copiar prompt». Todo ocurre en el navegador; aquí nunca hay publicidad.
 *
 * Con `conCopiar={false}` (páginas de PROCESO) no muestra el prompt: cada paso del proceso trae el suyo, con su botón Copiar,
 * y solo se avisa de lo que falta.
 */
export function PanelDatos({ conCopiar = true }: { conCopiar?: boolean }) {
  const { datos, valores, entradas, estado, previo, moneda, faltan, conEjemplo, prompt, setValor, setEntrada, probarConEjemplo, limpiar } = useHerramienta();
  const { campos, usaPerfil, calculadora, preproceso } = datos;

  return (
    <div className="rounded-2xl border bg-background shadow-sm">
      <div className="grid gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={probarConEjemplo} className="guide-focus inline-flex min-h-11 items-center justify-center rounded-lg border border-foreground/50 bg-background px-4 text-sm font-semibold text-foreground hover:bg-guide-surface">
            Probar con un ejemplo
          </button>
          <button type="button" onClick={limpiar} className="guide-focus inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground">
            Empezar de cero
          </button>
        </div>

        {usaPerfil.length > 0 && <PanelPerfil claves={usaPerfil} />}

        {calculadora && estado && <Calculadora calculadora={calculadora} entradas={entradas} onCambio={setEntrada} estado={estado} moneda={moneda} />}

        {campos.length > 0 && <FormularioHerramienta campos={campos} valores={valores} onCambio={setValor} />}

        {preproceso?.tipo === "conteo-palabras" && previo && <ConteoPalabras estado={previo} maximo={preproceso.palabras!.maximo} />}

        {previo && preproceso?.tipo !== "conteo-palabras" && (previo.resultados.length > 0 || previo.errores.length > 0) && (
          <section aria-labelledby="resultados-previo" className="rounded-xl border bg-guide-surface p-4 sm:p-5">
            <h3 id="resultados-previo" className="text-base font-semibold text-guide-ink">
              Lo que cuenta y suma esta página (no la IA)
            </h3>
            {previo.errores.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-medium text-risk">
                {previo.errores.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            {previo.completo && (
              <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2" aria-live="polite">
                {previo.resultados.map((r) => (
                  <div key={r.id} className="min-w-0 border-b border-foreground/10 pb-2">
                    <dt className="text-sm text-muted-foreground">{r.etiqueta}</dt>
                    <dd className="mt-0.5 text-[1.02rem] font-semibold tabular-nums text-guide-ink">{r.texto ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            )}
            {!previo.completo && <p className="mt-2 text-sm text-muted-foreground">Cuando el texto se entienda, aquí verás los conteos. Mientras tanto, el prompt le pide a la IA que no cuente ni sume por su cuenta.</p>}
          </section>
        )}

        {conEjemplo && <p className="text-sm text-muted-foreground">Estás viendo un ejemplo. Cambia cualquier dato por el tuyo o pulsa «Empezar de cero».</p>}

        {!conCopiar && faltan.length > 0 && (
          <p data-faltan className="text-sm text-muted-foreground" role="status">
            Te falta: {faltan.join(", ")}. Puedes seguir igualmente: cada prompt marca lo que falta como [FALTA] y la IA te lo preguntará.
          </p>
        )}
      </div>

      {conCopiar && (
        <>
          {/* Barra de acciones: «Copiar prompt» queda pegado abajo en el celular y siempre cerca del formulario. */}
          <div className="sticky bottom-0 z-10 rounded-b-2xl border-t bg-background/95 p-3 backdrop-blur sm:static sm:p-6 sm:pt-4">
            <BotonCopiar texto={prompt} />
            {faltan.length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                Te falta: {faltan.join(", ")}. Puedes copiar igualmente: el prompt lo marca como [FALTA] y la IA te lo preguntará.
              </p>
            )}
          </div>

          <details className="border-t px-4 py-3 sm:px-6">
            <summary className="guide-focus min-h-11 cursor-pointer rounded text-sm font-semibold text-guide-ink">Ver el prompt completo</summary>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-guide-code p-4 font-mono text-[0.8rem] leading-relaxed text-guide-code-foreground">{prompt}</pre>
          </details>
        </>
      )}
    </div>
  );
}

/** Herramienta simple (sin proceso): el formulario, el prompt y «Copiar prompt», con su propio estado. */
export function HerramientaInteractiva(datos: DatosInteractivos) {
  return (
    <ProveedorHerramienta datos={datos}>
      <PanelDatos />
    </ProveedorHerramienta>
  );
}
