"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { agrupar, diagnosticar, embudo, MUESTRA_MINIMA, textoTasa, tasa, transiciones, type FilaAgrupada, type Postulacion } from "@/lib/plan/registro";

function Barra({ etiqueta, n, total, detalle }: { etiqueta: string; n: number; total: number; detalle: string }) {
  const ancho = total > 0 ? Math.max(n > 0 ? 3 : 0, Math.round((n / total) * 100)) : 0;
  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="font-semibold">{etiqueta}</span>
        <span className="tabular text-muted-foreground" data-etapa={etiqueta}>
          {detalle}
        </span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-surface" aria-hidden>
        <div className="h-full rounded-full bg-brand-solid" style={{ width: `${ancho}%` }} />
      </div>
    </li>
  );
}

function TablaAgrupada({ titulo, filas, primera }: { titulo: string; filas: FilaAgrupada[]; primera: string }) {
  if (filas.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold">{titulo}</h4>
      <div className="mt-2 overflow-x-auto rounded-lg border" role="region" aria-label={titulo} tabIndex={0}>
        <table className="w-full min-w-[28rem] text-left text-sm" data-agrupada={primera}>
          <caption className="sr-only">{titulo}: postulaciones enviadas, con respuesta, entrevistas y ofertas</caption>
          <thead className="bg-surface">
            <tr>
              <th scope="col" className="p-2.5 font-semibold">{primera}</th>
              <th scope="col" className="p-2.5 text-right font-semibold">Enviadas</th>
              <th scope="col" className="p-2.5 text-right font-semibold">Con respuesta</th>
              <th scope="col" className="p-2.5 text-right font-semibold">Entrevistas</th>
              <th scope="col" className="p-2.5 text-right font-semibold">Ofertas</th>
              <th scope="col" className="p-2.5 text-right font-semibold">% con respuesta</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filas.map((f) => (
              <tr key={f.clave}>
                <th scope="row" className="p-2.5 text-left font-medium">{f.clave}</th>
                <td className="p-2.5 text-right tabular">{f.enviadas}</td>
                <td className="p-2.5 text-right tabular">{f.respuestas}</td>
                <td className="p-2.5 text-right tabular">{f.entrevistas}</td>
                <td className="p-2.5 text-right tabular">{f.ofertas}</td>
                <td className="p-2.5 text-right tabular">{f.tasaRespuesta === null ? "—" : `${f.tasaRespuesta} %`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Embudo de tus postulaciones (enviadas → respuesta → entrevista → oferta), por canal y por versión de CV, con una orientación prudente. */
export function EmbudoVista({ items }: { items: Postulacion[] }) {
  const e = embudo(items);
  const d = diagnosticar(e);
  const trans = transiciones(e);
  const porCv = agrupar(items, "cv");
  const porCanal = agrupar(items, "canal");
  const pocasVersiones = porCv.some((f) => f.enviadas < 5) && porCv.length > 1;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Todavía no hay postulaciones. Anota la primera en la pestaña «Registro» y aquí verás tu embudo.
      </div>
    );
  }

  return (
    <div className="space-y-6" data-embudo>
      <div>
        <h3 className="text-base font-semibold">Tu embudo</h3>
        <ul className="mt-3 space-y-3">
          <Barra etiqueta="Enviadas" n={e.enviadas} total={e.enviadas} detalle={`${e.enviadas}`} />
          <Barra etiqueta="Con respuesta" n={e.respuestas} total={e.enviadas} detalle={textoTasa(e.respuestas, e.enviadas)} />
          <Barra etiqueta="Entrevistas" n={e.entrevistas} total={e.enviadas} detalle={textoTasa(e.entrevistas, e.enviadas)} />
          <Barra etiqueta="Ofertas" n={e.ofertas} total={e.enviadas} detalle={textoTasa(e.ofertas, e.enviadas)} />
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          «Con respuesta» es cualquier contacto del empleador (todo estado distinto de «Enviada» y «Sin respuesta»). «Entrevistas» incluye a quien llegó a una entrevista aunque después lo rechazaran. Los porcentajes de las etapas son sobre el total de enviadas.
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold">Paso a paso</h3>
        <ul className="mt-2 space-y-1 text-sm" data-transiciones>
          {trans.map((t) => (
            <li key={t.clave} className="tabular">
              <span className="font-medium">{t.etiqueta[0].toUpperCase() + t.etiqueta.slice(1)}:</span> <span className="text-muted-foreground">{textoTasa(t.n, t.d)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border bg-surface p-4" data-diagnostico={d.nivel}>
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Info aria-hidden className="size-4 text-brand" /> Dónde se corta tu búsqueda
        </h3>
        <div className="mt-2 space-y-2 text-sm leading-relaxed">
          {d.mensajes.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
        {d.transicion?.clave === "envio-respuesta" && (
          <p className="mt-3 text-sm">
            Para revisar tu CV frente a los avisos, prueba <Link href="/carrera-y-empleo/optimizar-cv" className="font-medium text-brand underline underline-offset-2">Optimizar tu CV para una oferta</Link>.
          </p>
        )}
        {d.transicion?.clave === "entrevista-oferta" && (
          <p className="mt-3 text-sm">
            Para practicar, prueba <Link href="/carrera-y-empleo/preparar-entrevista-de-trabajo" className="font-medium text-brand underline underline-offset-2">Preparar una entrevista de trabajo</Link>.
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Criterio de esta herramienta, no un estándar: entre las etapas con al menos 3 casos, señala la de menor tasa; con menos de {MUESTRA_MINIMA} postulaciones no concluye.</p>
      </div>

      <TablaAgrupada titulo="Por versión de CV" filas={porCv} primera="Versión" />
      {pocasVersiones && <p className="-mt-3 text-xs text-muted-foreground">Alguna versión tiene menos de 5 postulaciones: una diferencia de porcentaje con tan pocos casos no permite decir que una versión es mejor.</p>}
      <TablaAgrupada titulo="Por canal" filas={porCanal} primera="Canal" />
      {items.length > 0 && tasa(e.respuestas, e.enviadas) !== null && <p className="text-xs text-muted-foreground">Tu registro tiene {items.length} postulación(es). Estas tasas describen lo que anotaste; no son promedios del mercado ni una predicción.</p>}
    </div>
  );
}
