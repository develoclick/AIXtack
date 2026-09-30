"use client";

import { Check, Circle } from "lucide-react";
import { almacenCatalogo } from "./almacen";
import { progresoCatalogo } from "@/lib/catalogo-productos/prompt";
import { plantillaPorId } from "@/lib/catalogo-productos/tipos";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): resumen del negocio y sus productos, calculado al instante. */
export function ResumenVivo() {
  const d = almacenCatalogo.useDatos();
  const progreso = progresoCatalogo(d);
  const hayDatos = Boolean(d.empresa.trim() || d.productos.some((p) => p.nombre.trim()));
  const conNombreYPrecio = d.productos.filter((p) => p.nombre.trim() && p.precio.trim());
  const plantilla = plantillaPorId(d.plantilla);

  return (
    <section aria-labelledby="titulo-resumen-catalogo" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-catalogo" className="text-lg font-semibold leading-tight">
        Tu catálogo <span className="font-normal text-muted-foreground">(se arma solo)</span>
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
                {d.empresa || "(sin nombre todavía)"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{d.rubro || "(sin rubro)"}</p>
            </div>
            <div className="rounded-lg border bg-surface p-3 text-sm">
              <p className="text-xs text-muted-foreground">Productos</p>
              <p className="mt-1 font-semibold tabular" data-cantidad-productos>
                {conNombreYPrecio.length} con nombre y precio <span className="font-normal text-muted-foreground">de {d.productos.length} en total</span>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-surface p-3 text-sm">
              <span aria-hidden className="size-6 shrink-0 rounded-full border" style={{ background: plantilla.acento }} />
              <span>
                Plantilla: <strong className="font-semibold">{plantilla.etiqueta}</strong>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escribe el nombre de tu empresa y agrega al menos un producto, y verás aquí el resumen.</p>
        )}
      </div>

      <div className="mt-5 border-t pt-4">
        <h3 className="text-sm font-semibold">Lo esencial</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {([
            [Boolean(d.empresa.trim()), "Nombre de la empresa"],
            [conNombreYPrecio.length > 0, "Al menos 1 producto con nombre y precio"],
            [Boolean(d.whatsapp.trim()), "Número de WhatsApp (para el enlace de cada producto)"],
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
