"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Ban, Download, ExternalLink, FileText, Info, Printer } from "lucide-react";
import { Pestanas } from "@/components/entrevista/pestanas";
import { descargar } from "@/components/plan/descargar";
import { LaboratorioFichas } from "./laboratorio-fichas";
import { agruparPorCategoria, enlaceWhatsapp } from "@/lib/catalogo-productos/calculo";
import { csvDeCatalogo } from "@/lib/catalogo-productos/csv";
import { itemsDeCelda } from "@/lib/catalogo-productos/tipos";
import { leerRespuestaCatalogo, type LecturaCatalogo } from "@/lib/catalogo-productos/lector";
import { preciosSinCoincidir } from "@/lib/catalogo-productos/verificar";
import type { DatosCatalogo } from "@/lib/catalogo-productos/tipos";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  referencia: DatosCatalogo;
  esDeEjemplo: boolean;
  alExportar: (tipo: "imprimir" | "csv" | "png") => void;
  alAviso: (texto: string) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "catalogo" | "fichas" | "revision";
const PESTANAS: { id: IdPestana; etiqueta: string }[] = [
  { id: "catalogo", etiqueta: "Catálogo" },
  { id: "fichas", etiqueta: "Fichas para redes" },
  { id: "revision", etiqueta: "Revisión" },
];

function Lista({ items, vacio }: { items: string[]; vacio: string }) {
  return items.length ? (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">{vacio}</p>
  );
}

export function ResultadoCatalogo({ respuesta, alCambiar, referencia, esDeEjemplo, alExportar, alAviso, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("catalogo");
  const ayudaId = useId();

  const lectura: LecturaCatalogo | null = useMemo(() => (respuesta.trim() ? leerRespuestaCatalogo(respuesta) : null), [respuesta]);
  const valida = Boolean(lectura?.valido);
  const problemasPrecio = useMemo(() => (lectura?.valido ? preciosSinCoincidir(referencia.productos, lectura.filas) : []), [lectura, referencia.productos]);
  const bloqueado = problemasPrecio.length > 0;
  const categorias = useMemo(() => (lectura?.valido ? agruparPorCategoria(lectura.filas) : []), [lectura]);

  function imprimir() {
    document.body.classList.add("imprimiendo-catalogo");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-catalogo");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  function descargarCsv() {
    if (!lectura?.valido) return;
    descargar(`${referencia.empresa.trim() || "catalogo"}-catalogo.csv`, csvDeCatalogo(lectura.filas), "text/csv;charset=utf-8");
    alExportar("csv");
    alAviso("Catálogo descargado en .csv.");
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-catalogo" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-catalogo" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega la respuesta de tu IA
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">Esta página compara el precio de cada producto contra lo que escribiste en el formulario. Si no coincide exactamente, bloquea la descarga hasta que lo revises.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-catalogo" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-catalogo"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder="Pega aquí la respuesta completa de tu IA, con los títulos «## Catálogo», «## Datos faltantes por producto»…"
            spellCheck={false}
            aria-describedby={ayudaId}
            aria-invalid={lectura ? !lectura.valido : undefined}
          />
          <p id={ayudaId} className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Usa el botón «Copiar» de tu asistente de IA y pega aquí la respuesta completa, sin editarla.
          </p>

          <div role="status" aria-live="polite" className="mt-3 space-y-3">
            {lectura && !lectura.valido && (
              <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
                <div>
                  <p className="font-semibold">Todavía no puedo leer esta respuesta</p>
                  <p className="mt-1 break-words">{lectura.problema}</p>
                </div>
              </div>
            )}
            {lectura?.valido && lectura.advertencias.length > 0 && (
              <div className="flex gap-3 rounded-lg border bg-surface p-4 text-sm">
                <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold">Avisos (no impiden usar el resultado)</p>
                  <ul className="mt-1 list-disc space-y-1 break-words pl-5 text-muted-foreground">
                    {lectura.advertencias.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {bloqueado && (
              <div role="alert" className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                <Ban aria-hidden className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">Descarga bloqueada: {problemasPrecio.length} precio(s) no coinciden</p>
                  <ul className="mt-1 list-disc space-y-1 break-words pl-5">
                    {problemasPrecio.map((p, i) => (
                      <li key={i}>{p.motivo}</li>
                    ))}
                  </ul>
                  <p className="mt-2">Corrige el precio en el formulario o pídele a tu IA una respuesta nueva, y vuelve a pegarla.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-20">
          {valida && lectura ? (
            <div className="aparecer">
              <div className="mb-4 flex flex-wrap gap-2" data-no-imprimir>
                <button type="button" className="btn btn-secundario" onClick={imprimir} disabled={bloqueado}>
                  <Printer aria-hidden className="size-4" /> Descargar catálogo en PDF
                </button>
                <button type="button" className="btn btn-secundario" onClick={descargarCsv} disabled={bloqueado}>
                  <Download aria-hidden className="size-4" /> Descargar .csv
                </button>
              </div>

              <Pestanas etiqueta="Paneles del resultado" prefijo="catalogo" pestanas={PESTANAS} valor={pestana} alCambiar={setPestana}>
                {pestana === "catalogo" && (
                  <div className="space-y-6">
                    {lectura.categorias.length > 8 && (
                      <p className="flex items-start gap-2 rounded-lg border border-warn/50 bg-warn-muted p-3 text-xs text-warn">
                        <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
                        La respuesta trae {lectura.categorias.length} categorías: se pidió un máximo de 8. Puedes seguir usándola, pero pídele a tu IA que las agrupe mejor.
                      </p>
                    )}
                    {categorias.map((c) => (
                      <div key={c.nombre}>
                        <h3 className="mb-3 text-base font-semibold">
                          {c.nombre} <span className="font-normal text-muted-foreground">({c.filas.length})</span>
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {c.filas.map((f, i) => {
                            const enlace = enlaceWhatsapp(referencia.whatsapp, referencia.empresa, f.nombre, f.precioPromo.trim() || f.precio);
                            return (
                              <div key={`${f.nombreOriginal}-${i}`} className="rounded-lg border bg-surface p-3 text-sm">
                                <p className="font-semibold">{f.nombre}</p>
                                {f.descripcion && <p className="mt-1 text-muted-foreground">{f.descripcion}</p>}
                                {itemsDeCelda(f.especificaciones).length > 0 && (
                                  <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                                    {itemsDeCelda(f.especificaciones).map((e) => (
                                      <li key={e}>{e}</li>
                                    ))}
                                  </ul>
                                )}
                                {itemsDeCelda(f.variantes).length > 0 && <p className="mt-1.5 text-xs text-muted-foreground">Variantes: {itemsDeCelda(f.variantes).join(", ")}</p>}
                                <div className="mt-2 flex items-baseline gap-2">
                                  <p className="text-base font-bold tabular">{f.precioPromo.trim() || f.precio}</p>
                                  {f.precioPromo.trim() && <p className="text-xs text-muted-foreground line-through tabular">{f.precio}</p>}
                                  {f.etiqueta && <span className="pildora text-xs">{f.etiqueta}</span>}
                                </div>
                                {enlace ? (
                                  <a href={enlace} target="_blank" rel="noopener noreferrer" className="btn btn-secundario mt-2 w-full text-xs">
                                    Enlace de WhatsApp <ExternalLink aria-hidden className="size-3.5" />
                                    <span className="sr-only"> (se abre en otra pestaña)</span>
                                  </a>
                                ) : (
                                  <p className="mt-2 text-xs text-muted-foreground">Escribe tu número de WhatsApp en el formulario para generar el enlace.</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pestana === "fichas" && <LaboratorioFichas filas={lectura.filas} plantilla={referencia.plantilla} empresa={referencia.empresa} bloqueado={bloqueado} alAviso={(t) => { alExportar("png"); alAviso(t); }} />}

                {pestana === "revision" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Datos faltantes por producto</h3>
                      <Lista items={lectura.faltantes} vacio="La respuesta no lista datos faltantes." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Sugerencias de fotos</h3>
                      <Lista items={lectura.fotos} vacio="La respuesta no trae sugerencias de fotos." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Elige una plantilla y descarga tu catálogo." />
                    </div>
                    <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">El precio de cada producto lo verifica esta página, nunca la IA: si algún precio no coincide con lo que escribiste, la descarga queda bloqueada arriba.</p>
                    {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Los textos de cada ficha son ficticios.</p>}
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu catálogo organizado por categorías</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta de tu IA a la izquierda y aparecen tus productos agrupados, las fichas para redes y el enlace de WhatsApp de cada uno.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
