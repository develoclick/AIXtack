import Link from "next/link";
import type { ReactNode } from "react";
import { Clock, Gift, MessageSquare } from "lucide-react";
import { RichText, Inline } from "@/components/guide/rich-text";
import { ui } from "@/components/guide/ui";
import { estilos } from "./estilos";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { AuroraRibbon } from "@/components/visual/aurora-ribbon";
import { getCategory } from "@/content/categorias";
import { rutaHerramienta, type HerramientaCargada } from "@/lib/herramientas/registro";
import { formatDate } from "@/lib/utils/format";
import { CapturaFigura } from "./captura-figura";
import { ChecklistRevision } from "./checklist-revision";
import { EjemploReal } from "./ejemplo-real";
import { EspacioAnuncio } from "./espacio-anuncio";
import { Faq } from "./faq";
import { FirmaVerificacion } from "./firma-verificacion";
import { HerramientaInteractiva } from "./herramienta-interactiva";
import { MejorasPrompt } from "./mejoras-prompt";
import { PestanasRubro } from "./pestanas-rubro";
import { Relacionadas } from "./relacionadas";

const PASOS_POR_DEFECTO: [string, string, string] = [
  "Completa los datos de esta tarea. Si quieres, añade los de tu negocio: se guardan solo en tu navegador. También puedes pulsar «Probar con un ejemplo».",
  "Pulsa «Copiar prompt».",
  "Pégalo en ChatGPT, Gemini o Claude y revisa el resultado con la lista de «Revisa antes de publicar».",
];

function Bloque({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-titulo`} className="scroll-mt-24 border-t pt-10 first:border-t-0 first:pt-0">
      <h2 id={`${id}-titulo`} className="text-balance text-2xl font-semibold tracking-tight text-guide-ink sm:text-[1.7rem]">
        {titulo}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * Plantilla de los 13 bloques de una herramienta (docs/reestructuracion-guiapromptsia.md §7).
 * La publicidad, si algún día se activa, solo va en los dos EspacioAnuncio: después del bloque 6 y del 10.
 * Nunca dentro de la herramienta (bloque 3) ni junto a «Copiar prompt».
 */
export function PaginaHerramienta({ herramienta: h, relacionadas }: { herramienta: HerramientaCargada; relacionadas: HerramientaCargada[] }) {
  const categoria = getCategory(h.meta.area);
  const pasos = h.pasos ?? PASOS_POR_DEFECTO;
  const limites = h.meta.limites ?? [];

  return (
    <article className="herramienta-scope">
      {/* 1 · Título con resultado + etiquetas */}
      <header className="not-prose relative isolate border-b">
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-lines absolute inset-x-0 top-0 h-full opacity-60" />
          <AuroraRibbon className="-right-[14%] top-[2%] hidden h-[22rem] w-[58%] lg:block" />
        </div>
        <div className="mx-auto max-w-[64rem] px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
          <Breadcrumbs items={[...(categoria ? [{ name: categoria.name, path: `/${categoria.slug}` }] : []), { name: h.meta.titulo, path: rutaHerramienta(h.meta) }]} />
          {categoria && (
            <p className={estilos.eyebrow}>
              <Link href={`/${categoria.slug}`} className="guide-focus hover:underline">
                {categoria.name}
              </Link>
            </p>
          )}
          <h1 className="mt-3 max-w-4xl text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-guide-ink sm:text-5xl">{h.meta.titulo}</h1>
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">{h.meta.descripcion}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Datos de la herramienta">
            <li className={ui.chip}>
              <Clock className="size-3.5" aria-hidden />
              {h.meta.tiempo}
            </li>
            <li className={ui.chip}>
              <Gift className="size-3.5" aria-hidden />
              Gratis
            </li>
            <li className={ui.chip}>
              <MessageSquare className="size-3.5" aria-hidden />
              ChatGPT, Gemini o Claude
            </li>
          </ul>
        </div>
      </header>

      <div className="mx-auto max-w-[64rem] space-y-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* 2 · Antes / después */}
        <Bloque id="antes-despues" titulo="Antes y después">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-background p-5">
              <p className={ui.tagNeutral}>Antes: el pedido típico</p>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-foreground/90">
                <Inline text={h.antesDespues.antes} />
              </p>
            </div>
            <div className="rounded-xl border border-brand/40 bg-brand-muted/40 p-5">
              <p className={estilos.tag}>Después: con esta herramienta</p>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-foreground/90">
                <Inline text={h.antesDespues.despues} />
              </p>
            </div>
          </div>
        </Bloque>

        {/* 3 · Herramienta */}
        <Bloque id="herramienta" titulo={h.meta.tipo === "calculadora" ? "Calcula y copia tu prompt" : "Llena los datos y copia tu prompt"}>
          <HerramientaInteractiva campos={h.campos} usaPerfil={h.usaPerfil} calculadora={h.calculadora} tarea={h.tarea} />
          {limites.length > 0 && h.meta.plataforma && (
            <div className="mt-6 rounded-xl border bg-guide-surface p-4 sm:p-5">
              <h3 className="text-base font-semibold text-guide-ink">Límites de {h.meta.plataforma.nombre}</h3>
              <ul className="mt-2 space-y-2 text-[0.97rem] leading-relaxed text-foreground/90">
                {limites.map((l) => (
                  <li key={l.concepto}>
                    <strong>{l.concepto}:</strong> {l.valor}{" "}
                    <span className="text-sm text-muted-foreground">
                      (verificado el <time dateTime={l.fechaVerificacion}>{formatDate(l.fechaVerificacion)}</time> en{" "}
                      <a href={l.fuente} className="guide-focus underline underline-offset-2" rel="noopener noreferrer">
                        la documentación oficial
                      </a>
                      )
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Bloque>

        {/* 4 · Cómo usarlo */}
        <Bloque id="como-usarlo" titulo="Cómo usarlo">
          <ol className="grid gap-3 md:grid-cols-3">
            {pasos.map((paso, i) => (
              <li key={i} className="rounded-xl border bg-background p-4">
                <span className="font-mono text-sm font-semibold text-guide-ink" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-[0.97rem] leading-relaxed text-foreground/90">
                  <span className="sr-only">Paso {i + 1}: </span>
                  {paso}
                </p>
              </li>
            ))}
          </ol>
        </Bloque>

        {/* 5 · Mejora el resultado */}
        <Bloque id="mejoras" titulo="Mejora el resultado">
          <p className="mb-4 max-w-[var(--guide-measure)] text-[0.97rem] leading-relaxed text-foreground/90">Pega una de estas líneas en el mismo chat, justo después de la respuesta. No llevan variables.</p>
          <MejorasPrompt mejoras={h.mejoras} />
        </Bloque>

        {/* 6 · Ejemplo real */}
        <Bloque id="ejemplo" titulo="Un ejemplo, paso a paso">
          <EjemploReal ejemplo={h.ejemplo} />
        </Bloque>

        <EspacioAnuncio posicion="despues-del-ejemplo" />

        {/* 7 · Revisa antes de publicar */}
        <Bloque id="revision" titulo="Revisa antes de publicar">
          <ChecklistRevision items={h.checklist} />
        </Bloque>

        {/* 8 · Por qué funciona */}
        <Bloque id="por-que-funciona" titulo="Por qué funciona">
          <ul className="grid gap-4 md:grid-cols-2">
            {h.porQueFunciona.map((p) => (
              <li key={p.titulo} className="rounded-xl border bg-background p-5">
                <h3 className={ui.h4}>{p.titulo}</h3>
                <p className="mt-2 text-[0.97rem] leading-relaxed text-foreground/90">
                  <Inline text={p.texto} />
                </p>
              </li>
            ))}
          </ul>
        </Bloque>

        {/* 9 · Según tu tipo de negocio */}
        <Bloque id="rubros" titulo="Según tu tipo de negocio">
          <PestanasRubro rubros={h.rubros} />
        </Bloque>

        {/* 10 · Errores comunes */}
        <Bloque id="errores" titulo="Errores comunes">
          <ul className="grid gap-4 md:grid-cols-2">
            {h.errores.map((e) => (
              <li key={e.error} className="rounded-xl border bg-background p-5">
                <h3 className={ui.h4}>{e.error}</h3>
                <p className="mt-2 text-[0.97rem] leading-relaxed text-foreground/90">
                  <span className="font-semibold text-guide-ink">Cómo evitarlo: </span>
                  <Inline text={e.solucion} />
                </p>
              </li>
            ))}
          </ul>
        </Bloque>

        <EspacioAnuncio posicion="despues-de-errores" />

        {/* Método completo (opcional, plegado) */}
        {h.metodoCompleto && (
          <details className="group rounded-xl border bg-guide-surface px-4 py-2 sm:px-5">
            <summary className="guide-focus flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 text-lg font-semibold text-guide-ink">
              {h.metodoCompleto.titulo}
              <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="pb-4">
              <RichText text={h.metodoCompleto.parrafos.join("\n\n")} />
              {h.metodoCompleto.capturas?.map((c) => (
                <CapturaFigura key={c.src} captura={c} />
              ))}
            </div>
          </details>
        )}

        {/* 11 · Preguntas frecuentes */}
        <Bloque id="faq" titulo="Preguntas frecuentes">
          <Faq preguntas={h.faq} />
        </Bloque>

        {/* 12 · Siguiente paso */}
        {relacionadas.length > 0 && (
          <Bloque id="siguiente" titulo="Siguiente paso">
            <Relacionadas herramientas={relacionadas} />
          </Bloque>
        )}

        {/* 13 · Autor y verificación */}
        <Bloque id="verificacion" titulo="Autor y verificación">
          <FirmaVerificacion meta={h.meta} />
        </Bloque>
      </div>
    </article>
  );
}
