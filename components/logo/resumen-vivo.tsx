"use client";

import { Check, Circle } from "lucide-react";
import { almacenLogo } from "./almacen";
import { progresoLogo, textoDePersonalidad } from "@/lib/logo/prompt";
import { ESTILOS, USOS } from "@/lib/logo/tipos";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): resumen de la dirección de marca, calculado al instante. */
export function ResumenVivo() {
  const d = almacenLogo.useDatos();
  const progreso = progresoLogo(d);
  const hayDatos = Boolean(d.nombreEmpresa.trim() || d.rubro.trim());

  return (
    <section aria-labelledby="titulo-resumen-logo" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-logo" className="text-lg font-semibold leading-tight">
        Tu dirección de marca <span className="font-normal text-muted-foreground">(se arma sola)</span>
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
              <p className="text-xs text-muted-foreground">Empresa</p>
              <p className="mt-0.5 text-lg font-bold" data-nombre-empresa>
                {d.nombreEmpresa || "(sin nombre todavía)"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{ESTILOS.find((e) => e.valor === d.estilo)!.etiqueta} · {d.rubro || "(sin rubro)"}</p>
            </div>
            <div className="rounded-lg border bg-surface p-3 text-sm">
              <p className="text-xs text-muted-foreground">Personalidad</p>
              <p className="mt-1">{textoDePersonalidad(d.personalidad)}</p>
            </div>
            {d.usos.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {d.usos.map((u) => (
                  <span key={u} className="pildora text-xs">
                    {USOS.find((x) => x.valor === u)!.etiqueta}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escribe el nombre de tu empresa y su rubro, y verás aquí el resumen de tu marca.</p>
        )}
      </div>

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Lo esencial</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {([
            [Boolean(d.nombreEmpresa.trim()), "Nombre de la empresa"],
            [Boolean(d.rubro.trim()) && Boolean(d.oferta.trim()), "Rubro y productos o servicios"],
            [d.usos.length > 0, "Al menos un uso previsto"],
          ] as [boolean, string][]).map(([ok, texto]) => (
            <li key={texto} className="flex items-center gap-2">
              {ok ? <Check aria-hidden className="size-4 text-ok" /> : <Circle aria-hidden className="size-4 text-muted-foreground" />}
              <span className={ok ? "" : "text-muted-foreground"}>
                {texto}
                <span className="sr-only">{ok ? " (listo)" : " (falta)"}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
