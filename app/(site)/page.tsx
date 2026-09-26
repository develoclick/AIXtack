import Link from "next/link";
import { ArrowRight, ClipboardCopy, FileDown, PencilLine } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { Buscador } from "@/components/home/buscador";
import { SidebarCategorias } from "@/components/home/sidebar-categorias";
import { IconoDeCategoria } from "@/components/layout/icono-categoria";
import { TarjetaPrompt } from "@/components/prompts/tarjeta-prompt";
import { categorias } from "@/content/categorias";
import { prompts, RUTA_CV } from "@/content/prompts";
import { itemsBuscables } from "@/lib/buscable";
import { faqJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { HOME_UPDATED_AT, siteName } from "@/lib/site";
import { formatDate } from "@/lib/utils/format";

export const metadata = buildMetadata({
  title: `Prompts en español gratis para ChatGPT, Gemini y Claude — ${siteName}`,
  description: "Biblioteca gratuita de prompts en español: llena tus datos, copia el prompt listo y úsalo en ChatGPT, Gemini o Claude. Empieza por tu hoja de vida.",
  path: "/",
  absoluteTitle: true,
});

const PASOS = [
  { icono: PencilLine, titulo: "Llena tus datos", texto: "Un formulario sencillo te pide solo lo necesario para la tarea. Tus datos se quedan en tu navegador." },
  { icono: ClipboardCopy, titulo: "Copia tu prompt", texto: "Mientras escribes, el prompt se arma solo con tus datos. Cuando termines, lo copias con un clic." },
  { icono: FileDown, titulo: "Pégalo en tu IA y descarga", texto: "Lo pegas en ChatGPT, Gemini o Claude. En el caso de la hoja de vida, además, conviertes la respuesta en un archivo Word." },
];

const PREGUNTAS = [
  { pregunta: "¿Es realmente gratis?", respuesta: "Sí. Los prompts y las herramientas del sitio son gratis, no piden registro ni tarjeta. Para usar el prompt necesitas un asistente de IA (ChatGPT, Gemini, Claude u otro); muchos tienen un plan gratuito, aunque sus límites cambian y los define cada empresa." },
  { pregunta: "¿Necesito crear una cuenta en este sitio?", respuesta: "No. No hay cuentas ni inicio de sesión. Lo que escribes en los formularios se guarda solo en tu navegador, en tu equipo, para que no lo pierdas si recargas la página." },
  { pregunta: "¿Con qué asistente de IA funcionan los prompts?", respuesta: "Los prompts son texto y se pueden pegar en cualquier asistente de chat. Están escritos para ser claros y completos, pero cada modelo responde a su manera: la calidad y el formato exacto de la respuesta pueden variar, por eso conviene revisar siempre el resultado." },
  { pregunta: "¿Puedo confiar en lo que la IA me devuelve?", respuesta: "Como una primera versión, sí; como versión final, no. Cada prompt le pide a la IA que no invente datos, pero puede equivocarse. Revisa cifras, fechas y nombres antes de usar el resultado." },
];

export default function HomePage() {
  const items = itemsBuscables();

  return (
    <>
      <JsonLd data={[faqJsonLd(PREGUNTAS.map((p) => ({ q: p.pregunta, a: p.respuesta })))]} />

      <section className="fondo-portada border-b">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="inline-flex items-center rounded-full border bg-card px-3 py-1 text-xs font-semibold text-brand">100 % gratis · sin registro · en español</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-[var(--tracking-display)] sm:text-5xl lg:text-6xl">
            Prompts en español que se arman solos con tus datos
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Elige una tarea, llena un formulario corto y copia el prompt listo para ChatGPT, Gemini o Claude. Empezamos por lo que más ayuda a tu carrera: una hoja de vida que los filtros ATS lean bien.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={RUTA_CV} className="btn btn-primario">
              Crear mi CV con IA <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link href="#categorias" className="btn btn-secundario">
              Ver categorías
            </Link>
          </div>
          <Buscador items={items} className="mt-8 max-w-xl lg:hidden" />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8">
        <div className="hidden lg:block">
          <SidebarCategorias items={items} />
        </div>

        <div className="min-w-0 space-y-16">
          <section aria-labelledby="empieza">
            <h2 id="empieza" className="text-2xl font-bold tracking-tight">
              Empieza por aquí
            </h2>
            <p className="mt-2 text-muted-foreground">El primer prompt completo del sitio. Los demás se publican de uno en uno, cuando están terminados.</p>
            <div className="mt-6 grid gap-4">
              {prompts.map((p) => (
                <TarjetaPrompt key={p.slug} prompt={p} destacada />
              ))}
            </div>
          </section>

          <section id="categorias" aria-labelledby="cats" className="scroll-mt-24">
            <h2 id="cats" className="text-2xl font-bold tracking-tight">
              Explora por categoría
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {categorias.map((c) => {
                const contenido = (
                  <>
                    <span className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
                      <IconoDeCategoria icono={c.icono} className="size-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight">{c.nombre}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.descripcion}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {c.subcategorias.slice(0, 4).map((s) => (
                        <li key={s.slug} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {s.nombre}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-auto pt-5 text-sm font-semibold">
                      {c.disponible ? (
                        <span className="inline-flex items-center gap-1 text-brand">
                          Ver prompts <ArrowRight aria-hidden className="size-4" />
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Próximamente</span>
                      )}
                    </p>
                  </>
                );
                return c.disponible ? (
                  <Link key={c.slug} href={`/${c.slug}`} className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md">
                    {contenido}
                  </Link>
                ) : (
                  <div key={c.slug} className="flex flex-col rounded-2xl border border-dashed bg-card/50 p-5 opacity-75">
                    {contenido}
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="como">
            <h2 id="como" className="text-2xl font-bold tracking-tight">
              Cómo funciona
            </h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {PASOS.map((p, i) => (
                <li key={p.titulo} className="rounded-2xl border bg-card p-5">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <h3 className="mt-4 flex items-center gap-2 font-semibold">
                    <p.icono aria-hidden className="size-4 text-brand" />
                    {p.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="que-es" className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 id="que-es" className="text-2xl font-bold tracking-tight">
              Qué es un prompt y por qué importa cómo lo escribes
            </h2>
            <div className="prose prose-neutral mt-4 max-w-none dark:prose-invert">
              <p>
                Un prompt es la instrucción que le das a una inteligencia artificial como ChatGPT, Gemini o Claude. Es tu forma de decirle qué necesitas: puede ser una pregunta, una orden o un texto largo con contexto.
              </p>
              <p>La diferencia entre un prompt vago y uno claro se nota en el resultado. Compara:</p>
              <ul>
                <li>
                  <strong>Vago:</strong> «Escríbeme un CV».
                </li>
                <li>
                  <strong>Claro:</strong> «Actúa como reclutador. Con estos datos de experiencia y esta oferta de empleo, redacta una hoja de vida de una página en formato Harvard, sin inventar cifras».
                </li>
              </ul>
              <p>
                El segundo le da un rol, los datos, el formato y una regla de honestidad. Escribir eso cada vez cansa; por eso aquí lo hace el formulario por ti: tú pones tus datos y el prompt se arma solo.
              </p>
            </div>
          </section>

          <section aria-labelledby="faq">
            <h2 id="faq" className="text-2xl font-bold tracking-tight">
              Preguntas frecuentes
            </h2>
            <div className="mt-6 divide-y rounded-2xl border bg-card">
              {PREGUNTAS.map((p) => (
                <details key={p.pregunta} className="group p-5">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {p.pregunta}
                    <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{p.respuesta}</p>
                </details>
              ))}
            </div>
          </section>

          <p className="text-xs text-muted-foreground">
            Última actualización de esta página: <time dateTime={HOME_UPDATED_AT}>{formatDate(HOME_UPDATED_AT)}</time>.
          </p>
        </div>
      </div>
    </>
  );
}
