"use client";

import { Check, Circle } from "lucide-react";
import { almacenNichos } from "./almacen";
import { semaforo } from "@/lib/nichos/calculo";
import { progresoNichos } from "@/lib/nichos/prompt";
import { CANALES, TIPOS_CLIENTE } from "@/lib/nichos/tipos";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): resumen del inventario, calculado al instante. */
export function ResumenVivo() {
  const d = almacenNichos.useDatos();
  const progreso = progresoNichos(d);
  const hayDatos = Boolean(d.conocimientos.trim() || d.oferta.trim());
  const estados = semaforo(d);

  return (
    <section aria-labelledby="titulo-resumen-nichos" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-nichos" className="text-lg font-semibold leading-tight">
        Tu inventario <span className="font-normal text-muted-foreground">(se arma solo)</span>
      </h2>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Datos completados</span>
          <span className="tabular" data-progreso>
            {progreso.porcentaje}% (recomendado: {progreso.recomendado}%)
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={progreso.porcentaje} aria-valuemin={0} aria-valuemax={100} aria-label="Datos completados">
          <div className="h-full rounded-full bg-brand-solid transition-[width]" style={{ width: `${progreso.porcentaje}%` }} />
        </div>
        {progreso.faltan.length > 0 && (
          <details className="mt-2 text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center text-muted-foreground">Ver qué falta</summary>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted-foreground">
              {progreso.faltan.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div aria-live="polite" className="mt-4">
        {hayDatos ? (
          <div className="aparecer space-y-3" data-resumen>
            <div className="rounded-lg border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Sabes ofrecer</p>
              <p className="mt-0.5 text-sm font-semibold">{d.oferta || "(sin definir todavía)"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{TIPOS_CLIENTE.find((t) => t.valor === d.tipoCliente)!.etiqueta} · {d.mercado || "(sin mercado)"}</p>
            </div>
            {d.canales.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {d.canales.map((c) => (
                  <span key={c} className="pildora text-xs">
                    {CANALES.find((x) => x.valor === c)!.etiqueta}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escribe tus conocimientos y lo que sabes ofrecer, y verás aquí el resumen.</p>
        )}
      </div>

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Lo esencial</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {estados.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              {s.completa ? <Check aria-hidden className="size-4 text-ok" /> : <Circle aria-hidden className="size-4 text-muted-foreground" />}
              <span className={s.completa ? "" : "text-muted-foreground"}>
                {s.etiqueta}
                <span className="sr-only">{s.completa ? " (listo)" : " (falta)"}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
