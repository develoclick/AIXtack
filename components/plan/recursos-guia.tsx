"use client";

import { useState } from "react";
import { Check, ClipboardCopy, Download } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { descargar } from "./descargar";
import { CABECERA_CSV } from "@/lib/plan/registro";

/** Plantillas de mensajes de la guía, con botón de copiar. Los marcadores entre corchetes se completan con datos reales. */
export function PlantillasCopiables({ plantillas }: { plantillas: { tipo: string; situacion: string; texto: string; cuando: string }[] }) {
  const [copiada, setCopiada] = useState<string | null>(null);
  return (
    <ul className="not-prose my-6 space-y-4">
      {plantillas.map((p) => (
        <li key={p.tipo} className="tarjeta space-y-2 p-4 text-sm">
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-bold text-brand">{p.tipo}</span>
            <span className="font-semibold">{p.situacion}</span>
          </p>
          <div className="whitespace-pre-wrap break-words rounded-lg border bg-surface p-3 leading-relaxed">{p.texto}</div>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Cuándo usarla:</span> {p.cuando}
          </p>
          <button
            type="button"
            className="btn btn-secundario"
            aria-label={`Copiar la plantilla de ${p.tipo.toLowerCase()}`}
            onClick={async () => {
              if (await copiarTexto(p.texto)) {
                setCopiada(p.tipo);
                setTimeout(() => setCopiada(null), 2500);
              }
            }}
          >
            {copiada === p.tipo ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
            {copiada === p.tipo ? "Copiada" : "Copiar plantilla"}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Descarga un CSV vacío con las columnas del registro, para quien prefiere empezar en una hoja de cálculo (se puede importar después). */
export function DescargarPlantillaRegistro() {
  return (
    <p className="not-prose my-4">
      <button type="button" className="btn btn-secundario" onClick={() => descargar("plantilla-registro-postulaciones.csv", "﻿" + CABECERA_CSV.join(",") + "\r\n", "text/csv;charset=utf-8")}>
        <Download aria-hidden className="size-4" /> Descargar plantilla de registro (CSV vacío)
      </button>
    </p>
  );
}
