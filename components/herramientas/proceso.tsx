"use client";

import { useState } from "react";
import { Check, Download } from "lucide-react";
import { armarArchivoDeProceso, nombreDelArchivo } from "@/lib/herramientas/descarga";
import { cumple } from "@/lib/herramientas/plantillas";
import { correccionesVisibles, itemsDeRevision, normalizarSalida, opcionesDelPaso, resumenKit } from "@/lib/herramientas/proceso";
import type { AvisoPaso, ItemKit, MejoraPrompt, OpcionPaso, PasoProceso } from "@/lib/herramientas/tipos";
import { siteUrl } from "@/lib/site";
import { leerJson, useAlmacenLocal } from "./almacen-local";
import { BotonCopiar } from "./boton-copiar";
import { useHerramienta } from "./estado-herramienta";
import { MejorasPrompt } from "./mejoras-prompt";

/**
 * Un prompt del proceso: botón Copiar (con la alternativa de siempre si falla el portapapeles) y el texto completo plegado.
 * El prompt ya viene construido con los datos del formulario y del perfil: nunca muestra llaves.
 */
function BloquePrompt({ texto, ariaLabel, destino, verComo = "Ver el prompt" }: { texto: string; ariaLabel: string; destino?: string; verComo?: string }) {
  return (
    <div className="mt-4">
      <BotonCopiar texto={texto} etiqueta="Copiar" ariaLabel={ariaLabel} destino={destino} />
      <details className="mt-3 rounded-lg border bg-background">
        <summary className="guide-focus flex min-h-11 cursor-pointer items-center px-3 text-sm font-semibold text-guide-ink">{verComo}</summary>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words border-t bg-guide-code p-4 font-mono text-[0.8rem] leading-relaxed text-guide-code-foreground">{texto}</pre>
      </details>
    </div>
  );
}

function Avisos({ avisos }: { avisos?: AvisoPaso[] }) {
  const { contexto } = useHerramienta();
  const visibles = (avisos ?? []).filter((a) => cumple(a.si, contexto));
  if (visibles.length === 0) return null;
  return (
    <ul className="mt-3 grid gap-2">
      {visibles.map((a) => (
        <li key={a.texto} className="rounded-lg border-l-[3px] border-brand bg-guide-surface px-3 py-2 text-sm leading-relaxed text-foreground/90">
          {a.texto}
        </li>
      ))}
    </ul>
  );
}

function Opcion({ opcion, numero }: { opcion: OpcionPaso; numero: number }) {
  const { construir } = useHerramienta();
  return (
    <div data-opcion={opcion.id} className="mt-4 rounded-xl border bg-guide-surface p-4">
      <h4 className="text-base font-semibold text-guide-ink">{opcion.titulo}</h4>
      <Avisos avisos={opcion.notas} />
      <p className="mt-2 text-[0.97rem] leading-relaxed text-foreground/90">{opcion.texto}</p>
      {opcion.prompt && <BloquePrompt texto={construir(opcion.prompt)} ariaLabel={`Copiar prompt del paso ${numero}: ${opcion.titulo}`} destino={opcion.destino} />}
      <Avisos avisos={opcion.avisos} />
    </div>
  );
}

function EstadoDatos() {
  const { faltan, previo, datos } = useHerramienta();
  const total = previo?.resultados.find((r) => r.id === "total")?.valor;
  const maximo = datos.preproceso?.palabras?.maximo;
  return (
    <div data-estado-datos className="mt-3 rounded-lg border bg-guide-surface px-3 py-2 text-sm leading-relaxed text-foreground/90" role="status" aria-live="polite">
      <p>{faltan.length > 0 ? `Te falta: ${faltan.join(", ")}.` : "Ya tienes todos los datos obligatorios."}</p>
      {typeof total === "number" && typeof maximo === "number" && (
        <p>
          Palabras del afiche: {total} de {maximo} como máximo{total > maximo ? " (te pasas: acorta tus datos)" : ""}.
        </p>
      )}
    </div>
  );
}

const esMapaDeTextos = (x: unknown): x is Record<string, string> => typeof x === "object" && x !== null && !Array.isArray(x) && Object.values(x).every((v) => typeof v === "string");
const esListaDeTextos = (x: unknown): x is string[] => Array.isArray(x) && x.every((v) => typeof v === "string");

/**
 * La lista de revisión del paso 4: cada dato del formulario, con su valor exacto y su casilla, y «X de N comprobados». Lo
 * marcado se guarda solo en este navegador y recuerda el valor que se comprobó: si cambias el dato, la casilla se desmarca.
 */
function ListaRevision({ lista, clave }: { lista: NonNullable<PasoProceso["comprobar"]>; clave: string }) {
  const { valores } = useHerramienta();
  const [crudo, guardar] = useAlmacenLocal(`guiapromptsia:revision:${clave}:v1`, "{}");
  const marcados = leerJson<Record<string, string>>(crudo, {}, esMapaDeTextos);
  const { items, comprobados, total } = itemsDeRevision(lista, valores, marcados);

  function alternar(campo: string, valor: string, marcado: boolean) {
    const siguiente = { ...marcados };
    if (marcado) siguiente[campo] = valor;
    else delete siguiente[campo];
    guardar(JSON.stringify(siguiente));
  }

  return (
    <div data-revision className="mt-4 rounded-xl border bg-background p-4">
      <h4 className="text-base font-semibold text-guide-ink">Tus datos exactos, uno por uno</h4>
      <p className="mt-1 text-sm text-muted-foreground">Cada dato está tal como lo escribiste en «Tus datos». Marca cada casilla cuando el afiche diga exactamente lo mismo.</p>
      <ul className="mt-3 grid gap-2">
        {items.map((i) => {
          const id = `revision-dato-${i.campo}`;
          return (
            <li key={i.campo}>
              {i.tieneDato ? (
                <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-foreground/50 bg-background px-3 py-2.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-guide-ink">
                  <input id={id} type="checkbox" checked={i.comprobado} onChange={(e) => alternar(i.campo, i.valor, e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--brand)]" />
                  <span className={`min-w-0 ${i.comprobado ? "text-muted-foreground" : "text-foreground"}`}>
                    <span className="font-semibold text-guide-ink">{i.etiqueta}: </span>
                    <span className="break-words font-mono text-[0.9rem]">{i.valor}</span>
                  </span>
                </label>
              ) : (
                <p className="rounded-lg border border-foreground/20 px-3 py-2.5 text-sm text-muted-foreground">
                  <span className="font-semibold text-guide-ink">{i.etiqueta}: </span>sin dato en el formulario, no hay nada que comprobar.
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <p role="status" aria-live="polite" data-comprobados className="mt-3 text-sm text-muted-foreground">
        {comprobados} de {total} comprobados. Lo que marcas se guarda solo en este navegador.
      </p>
    </div>
  );
}

/** «Si algo falla»: cada salida que pide escribirle algo a la IA trae su texto ya relleno con «Copiar corrección». */
function SiAlgoFalla({ paso }: { paso: PasoProceso }) {
  const { contexto } = useHerramienta();
  return (
    <details className="self-start rounded-lg border bg-guide-surface">
      <summary className="guide-focus flex min-h-11 cursor-pointer items-center px-3 text-base font-semibold text-guide-ink">Si algo falla</summary>
      <ul className="grid gap-3 border-t px-3 py-3">
        {paso.siAlgoFalla.map((salida, i) => {
          const correcciones = correccionesVisibles(salida, contexto);
          return (
            <li key={i} className="text-[0.97rem] leading-relaxed text-foreground/90">
              <p>{normalizarSalida(salida).texto}</p>
              {correcciones.map((c) => (
                <div key={c.etiqueta} data-correccion className="mt-2 rounded-lg border bg-background p-3">
                  <p className="text-sm font-semibold text-guide-ink">{c.etiqueta}</p>
                  <p data-correccion-texto className="mt-1 whitespace-pre-wrap break-words font-mono text-[0.85rem] leading-relaxed">
                    {c.texto}
                  </p>
                  <BotonCopiar texto={c.texto} etiqueta="Copiar corrección" ariaLabel={`Copiar corrección del paso ${paso.numero}: ${c.etiqueta}`} destino={c.destino ?? "el mismo chat de la IA"} className="mt-3" />
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function Paso({ paso, total, mejoras, clave }: { paso: PasoProceso; total: number; mejoras: MejoraPrompt[]; clave: string }) {
  const h = useHerramienta();
  const { contexto } = h;
  const opciones = opcionesDelPaso(paso, contexto);

  return (
    <li id={`paso-${paso.numero}`} data-paso={paso.numero} aria-labelledby={`paso-${paso.numero}-titulo`} className="scroll-mt-24 rounded-2xl border bg-background p-4 sm:p-6">
      <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-guide-ink">
        Paso {paso.numero} de {total} · {paso.tiempo}
      </p>
      <h3 id={`paso-${paso.numero}-titulo`} className="mt-1 text-xl font-semibold tracking-tight text-guide-ink">
        {paso.titulo}
      </h3>
      <p className="mt-2 max-w-[var(--guide-measure)] text-[0.97rem] leading-relaxed text-foreground/90">{paso.queHaces}</p>

      {paso.muestraEstadoDatos && <EstadoDatos />}
      {paso.promptMaestro && <BloquePrompt texto={h.prompt} ariaLabel={`Copiar prompt del paso ${paso.numero}: ${paso.titulo}`} destino={paso.destino} verComo="Ver el prompt completo" />}
      {paso.prompt && <BloquePrompt texto={h.construir(paso.prompt)} ariaLabel={`Copiar prompt del paso ${paso.numero}: ${paso.titulo}`} destino={paso.destino} />}
      {paso.comprobar && <ListaRevision lista={paso.comprobar} clave={clave} />}
      {opciones.map((o) => (
        <Opcion key={o.id} opcion={o} numero={paso.numero} />
      ))}
      {paso.opciones && paso.opciones.length > 0 && opciones.length === 0 && paso.sinOpciones && (
        <p className="mt-4 rounded-lg border bg-guide-surface px-3 py-2 text-sm text-foreground/90">{paso.sinOpciones}</p>
      )}
      <Avisos avisos={paso.avisos} />

      {paso.mostrarMejoras && mejoras.length > 0 && (
        <details className="mt-4 rounded-lg border bg-background">
          <summary className="guide-focus flex min-h-11 cursor-pointer items-center px-3 text-sm font-semibold text-guide-ink">Ajustes rápidos: líneas para pegar en el mismo chat</summary>
          <div className="border-t p-3">
            <MejorasPrompt mejoras={mejoras} />
          </div>
        </details>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-base font-semibold text-guide-ink">Así sabes que salió bien</h4>
          <ul className="mt-2 grid gap-2">
            {paso.asiSabesQueSalioBien.map((t) => (
              <li key={t} className="flex gap-2 text-[0.97rem] leading-relaxed text-foreground/90">
                <Check className="mt-1 size-4 shrink-0 text-ok" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <SiAlgoFalla paso={paso} />
      </div>

      <p className="mt-4 text-[0.97rem] text-guide-ink">
        <span className="font-semibold">Al terminar tienes: </span>
        {paso.resultado}
      </p>
    </li>
  );
}

/**
 * «Descargar mis datos y prompts (.txt)»: el archivo se crea en el navegador (Blob) con la fecha, los datos del formulario y los
 * prompts de los pasos. No se envía nada al servidor.
 */
function DescargarDatos({ titulo, slug, ruta, pasos }: { titulo: string; slug: string; ruta: string; pasos: PasoProceso[] }) {
  const h = useHerramienta();
  const [fallo, setFallo] = useState(false);

  function descargar() {
    try {
      const fecha = new Date().toLocaleDateString("sv-SE");
      const texto = armarArchivoDeProceso({ fecha, titulo, url: `${siteUrl}/${ruta}`, campos: h.datos.campos, usaPerfil: h.datos.usaPerfil, contexto: h.contexto, promptMaestro: h.prompt, pasos });
      const objeto = URL.createObjectURL(new Blob([texto], { type: "text/plain;charset=utf-8" }));
      const enlace = document.createElement("a");
      enlace.href = objeto;
      enlace.download = nombreDelArchivo(slug, fecha);
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(objeto), 1000);
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }

  return (
    <div data-descarga className="mt-8 rounded-2xl border bg-guide-surface p-4 sm:p-6">
      <button
        type="button"
        onClick={descargar}
        className="guide-focus inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-guide-ink bg-guide-ink px-4 text-sm font-semibold text-background hover:bg-guide-ink/90 sm:w-auto"
      >
        <Download className="size-4" aria-hidden />
        Descargar mis datos y prompts (.txt)
      </button>
      <p className="mt-3 text-sm text-muted-foreground">El archivo se crea en tu navegador; no lo recibimos.</p>
      {fallo && (
        <p role="alert" className="mt-2 text-sm font-medium text-risk">
          No pudimos crear el archivo en este navegador. Copia los prompts uno por uno con sus botones «Copiar».
        </p>
      )}
    </div>
  );
}

/** Bloque «El proceso»: los pasos numerados, cada uno con su tiempo, su prompt con botón Copiar y sus comprobaciones. */
export function ProcesoPasos({ pasos, mejoras, titulo, slug, ruta }: { pasos: PasoProceso[]; mejoras: MejoraPrompt[]; titulo: string; slug: string; ruta: string }) {
  return (
    <div>
      <nav aria-label="Los pasos del proceso">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {pasos.map((p) => (
            <li key={p.numero}>
              <a href={`#paso-${p.numero}`} className="guide-focus flex min-h-11 items-center gap-2 rounded-lg border border-foreground/50 bg-background px-3 py-2 text-sm text-foreground hover:bg-guide-surface">
                <span className="font-mono font-semibold text-guide-ink">{p.numero}</span>
                <span className="min-w-0 flex-1 font-medium">{p.titulo}</span>
                <span className="shrink-0 text-muted-foreground">{p.tiempo}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <ol className="mt-6 grid gap-6">
        {pasos.map((p) => (
          <Paso key={p.numero} paso={p} total={pasos.length} mejoras={mejoras} clave={ruta} />
        ))}
      </ol>
      <DescargarDatos titulo={titulo} slug={slug} ruta={ruta} pasos={pasos} />
    </div>
  );
}

/**
 * «Tu kit final»: las mismas entregas que «Lo que vas a tener». Las que dependen de un formato solo se ven si marcaste ese formato
 * (con el formulario vacío se ven todas). Lo marcado se guarda solo en este navegador, sin errores si el almacenamiento está bloqueado.
 */
export function KitFinal({ items, clave }: { items: ItemKit[]; clave: string }) {
  const { contexto } = useHerramienta();
  const [crudo, guardar] = useAlmacenLocal(`guiapromptsia:kit:${clave}:v1`, "[]");
  const marcados = leerJson<string[]>(crudo, [], esListaDeTextos);
  const { visibles, hechos, total } = resumenKit(items, contexto, marcados);

  function alternar(id: string, marcado: boolean) {
    guardar(JSON.stringify(marcado ? [...new Set([...marcados, id])] : marcados.filter((x) => x !== id)));
  }

  return (
    <div>
      <ul className="grid gap-2">
        {visibles.map((item) => {
          const id = `kit-${item.id}`;
          const listo = marcados.includes(item.id);
          return (
            <li key={item.id}>
              <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-foreground/50 bg-background px-3 py-2.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-guide-ink">
                <input id={id} type="checkbox" checked={listo} onChange={(e) => alternar(item.id, e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--brand)]" />
                <span className={listo ? "text-muted-foreground line-through decoration-1" : "text-foreground"}>{item.texto}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p role="status" aria-live="polite" data-listos className="mt-3 text-sm text-muted-foreground">
        {hechos} de {total} listos. Lo que marcas se guarda solo en este navegador.
      </p>
    </div>
  );
}
