"use client";

import { useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { cumple } from "@/lib/herramientas/plantillas";
import { itemsVisiblesDelKit, opcionesDelPaso } from "@/lib/herramientas/proceso";
import type { AvisoPaso, ItemKit, MejoraPrompt, OpcionPaso, PasoProceso } from "@/lib/herramientas/tipos";
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

function ListaComprobar({ lista }: { lista: NonNullable<PasoProceso["comprobar"]> }) {
  const { valores } = useHerramienta();
  return (
    <div className="mt-4 rounded-xl border bg-background p-4">
      <h4 className="text-base font-semibold text-guide-ink">Los datos que tienes que comprobar, letra por letra</h4>
      <ul className="mt-2 grid gap-2">
        {lista.map(({ etiqueta, campo }) => {
          const valor = (valores[campo] ?? "").trim();
          return (
            <li key={campo} className="grid gap-1 text-[0.97rem] sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-3">
              <span className="font-semibold text-guide-ink">{etiqueta}</span>
              <span className="min-w-0 break-words font-mono text-[0.9rem] text-foreground">{valor || "— falta en tus datos"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Paso({ paso, total, mejoras }: { paso: PasoProceso; total: number; mejoras: MejoraPrompt[] }) {
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
      {paso.comprobar && <ListaComprobar lista={paso.comprobar} />}
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
        <details className="self-start rounded-lg border bg-guide-surface">
          <summary className="guide-focus flex min-h-11 cursor-pointer items-center px-3 text-base font-semibold text-guide-ink">Si algo falla</summary>
          <ul className="grid gap-2 border-t px-3 py-3">
            {paso.siAlgoFalla.map((t) => (
              <li key={t} className="text-[0.97rem] leading-relaxed text-foreground/90">
                {t}
              </li>
            ))}
          </ul>
        </details>
      </div>

      <p className="mt-4 text-[0.97rem] text-guide-ink">
        <span className="font-semibold">Al terminar tienes: </span>
        {paso.resultado}
      </p>
    </li>
  );
}

/** Bloque «El proceso»: los pasos numerados, cada uno con su tiempo, su prompt con botón Copiar y sus comprobaciones. */
export function ProcesoPasos({ pasos, mejoras }: { pasos: PasoProceso[]; mejoras: MejoraPrompt[] }) {
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
          <Paso key={p.numero} paso={p} total={pasos.length} mejoras={mejoras} />
        ))}
      </ol>
    </div>
  );
}

/* ── Estado del kit: localStorage con try/catch y, si está bloqueado, memoria de esta visita ── */
const enMemoria = new Map<string, string>();
const oyentes = new Set<() => void>();

function leerCrudo(clave: string): string {
  try {
    const valor = window.localStorage.getItem(clave);
    if (valor !== null) return valor;
  } catch {
    /* almacenamiento bloqueado: se usa la memoria de esta visita */
  }
  return enMemoria.get(clave) ?? "[]";
}

function escribir(clave: string, valor: string) {
  enMemoria.set(clave, valor);
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    /* sin almacenamiento: el kit sigue funcionando, solo que no recuerda entre visitas */
  }
  oyentes.forEach((f) => f());
}

function suscribir(aviso: () => void) {
  oyentes.add(aviso);
  window.addEventListener("storage", aviso);
  return () => {
    oyentes.delete(aviso);
    window.removeEventListener("storage", aviso);
  };
}

function marcadosDe(crudo: string): string[] {
  try {
    const lista: unknown = JSON.parse(crudo);
    return Array.isArray(lista) ? lista.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * «Tu kit final»: lista marcable de lo que tendrás al terminar. Lo marcado se guarda solo en este navegador (si el
 * almacenamiento está bloqueado, sigue funcionando, solo que sin recordar). Los ítems con `mostrarSi` siguen a los datos.
 */
export function KitFinal({ items, clave }: { items: ItemKit[]; clave: string }) {
  const { contexto } = useHerramienta();
  const almacen = `guiapromptsia:kit:${clave}:v1`;
  const crudo = useSyncExternalStore(suscribir, () => leerCrudo(almacen), () => "[]");
  const marcados = marcadosDe(crudo);

  const visibles = itemsVisiblesDelKit(items, contexto);
  const hechos = visibles.filter((i) => marcados.includes(i.id)).length;

  function alternar(id: string, marcado: boolean) {
    const siguiente = marcado ? [...new Set([...marcados, id])] : marcados.filter((x) => x !== id);
    escribir(almacen, JSON.stringify(siguiente));
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
      <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
        {hechos} de {visibles.length} listos. Lo que marcas se guarda solo en este navegador.
      </p>
    </div>
  );
}
