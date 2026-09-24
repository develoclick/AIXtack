"use client";

import { useMemo, useState } from "react";
import { calcular, simboloMoneda } from "@/lib/herramientas/calculadora";
import { ejecutarPreproceso } from "@/lib/herramientas/preprocesos";
import type { Calculadora as CalculadoraDatos, Campo, PerfilClave, Preproceso } from "@/lib/herramientas/tipos";
import { construirPrompt } from "@/lib/prompts/construir-prompt";
import { BotonCopiar } from "./boton-copiar";
import { Calculadora } from "./calculadora";
import { FormularioHerramienta } from "./formulario-herramienta";
import { ConteoPalabras } from "./conteo-palabras";
import { PanelPerfil } from "./panel-perfil";
import { usePerfil } from "./use-perfil";

export interface DatosInteractivos {
  campos: Campo[];
  usaPerfil: PerfilClave[];
  calculadora: CalculadoraDatos | null;
  preproceso?: Preproceso | null;
  tarea: string;
}

const vacios = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, ""]));

/**
 * El corazón de la página: perfil → formulario → calculadora → prompt → «Copiar prompt».
 * Todo ocurre en el navegador. La barra de acciones queda pegada abajo en el celular para que «Copiar
 * prompt» esté siempre a la vista. Aquí nunca hay publicidad.
 */
export function HerramientaInteractiva({ campos, usaPerfil, calculadora, preproceso, tarea }: DatosInteractivos) {
  const perfil = usePerfil();
  const [valores, setValores] = useState<Record<string, string>>(() => vacios(campos.map((c) => c.id)));
  const [entradas, setEntradas] = useState<Record<string, string>>(() => vacios(calculadora?.entradas.map((e) => e.id) ?? []));
  const [conEjemplo, setConEjemplo] = useState(false);

  const moneda = simboloMoneda(perfil.moneda);
  const estado = useMemo(() => (calculadora ? calcular(calculadora, entradas, perfil.moneda) : null), [calculadora, entradas, perfil.moneda]);

  const previo = useMemo(() => (preproceso ? ejecutarPreproceso(preproceso, valores, perfil.moneda) : null), [preproceso, valores, perfil.moneda]);

  // Lo que la página cuenta y la tarea nombra con {{variable}} (por ejemplo, las palabras): la IA no lo vuelve a contar.
  const variablesDeLaTarea = useMemo(
    () => Object.fromEntries(Object.entries(preproceso?.variables ?? {}).map(([variable, id]) => [variable, String(previo?.resultados.find((r) => r.id === id)?.valor ?? 0)])),
    [preproceso, previo]
  );

  const prompt = useMemo(
    () =>
      construirPrompt(
        perfil,
        campos.map((c) => ({ id: c.id, label: c.label, valor: valores[c.id], requerido: c.requerido })),
        [
          ...(estado ? estado.resultados.filter((r) => r.enPrompt && !(r.opcional && r.valor === null)).map((r) => ({ etiqueta: r.etiqueta, texto: r.texto })) : []),
          ...(previo && previo.completo ? previo.resultados.filter((r) => r.enPrompt !== false).map((r) => ({ etiqueta: r.etiqueta, texto: r.texto })) : []),
        ],
        tarea,
        { usaPerfil, variables: variablesDeLaTarea }
      ),
    [perfil, campos, valores, estado, previo, tarea, usaPerfil, variablesDeLaTarea]
  );

  const faltan = campos.filter((c) => c.requerido && !valores[c.id]?.trim()).map((c) => c.label);

  function probarConEjemplo() {
    setValores(Object.fromEntries(campos.map((c) => [c.id, c.ejemplo])));
    setEntradas(Object.fromEntries((calculadora?.entradas ?? []).map((e) => [e.id, e.ejemplo])));
    setConEjemplo(true);
  }

  function limpiar() {
    setValores(vacios(campos.map((c) => c.id)));
    setEntradas(vacios(calculadora?.entradas.map((e) => e.id) ?? []));
    setConEjemplo(false);
  }

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

        {calculadora && estado && (
          <Calculadora
            calculadora={calculadora}
            entradas={entradas}
            onCambio={(id, valor) => {
              setEntradas((prev) => ({ ...prev, [id]: valor }));
              setConEjemplo(false);
            }}
            estado={estado}
            moneda={moneda}
          />
        )}

        {campos.length > 0 && (
          <FormularioHerramienta
            campos={campos}
            valores={valores}
            onCambio={(id, valor) => {
              setValores((prev) => ({ ...prev, [id]: valor }));
              setConEjemplo(false);
            }}
          />
        )}

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
      </div>

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
    </div>
  );
}
