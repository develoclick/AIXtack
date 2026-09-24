import Link from "next/link";
import { ArrowRight, ArrowUpRight, ClipboardList, Copy, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { TarjetaHerramienta } from "@/components/herramientas/tarjeta-herramienta";
import { buttonVariants } from "@/components/ui/button";
import { AuroraRibbon } from "@/components/visual/aurora-ribbon";
import { BigIndex } from "@/components/visual/big-index";
import { FloatingIllustration } from "@/components/visual/floating-illustration";
import { Marquee } from "@/components/visual/marquee";
import { Reveal } from "@/components/visual/reveal";
import { SiteImage } from "@/components/visual/site-image";
import { categories } from "@/content/categorias";
import { listarVisibles, rutaHerramienta } from "@/lib/herramientas/registro";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteName, siteTagline } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = buildMetadata({
  title: `${siteName} — ${siteTagline}`,
  absoluteTitle: true,
  description:
    "Herramientas de IA para tu negocio: elige la tarea, llena unos datos y copia el prompt listo para pegar. Con guía corta, ejemplo, lista de revisión y cálculos hechos por la página.",
  path: "/",
});

const tasks = [
  "Crear un anuncio",
  "Diseñar una promoción",
  "Preparar un afiche",
  "Crear publicaciones",
  "Responder a clientes",
  "Responder un reclamo",
  "Preparar una cotización",
  "Calcular un precio",
  "Analizar ventas",
  "Punto de equilibrio",
  "Documentar procesos",
  "Organizar tareas",
];

const steps = [
  {
    icon: ClipboardList,
    title: "Elige la tarea",
    text: "Cada herramienta resuelve una tarea concreta de un negocio pequeño: un anuncio, una cotización, un precio, una respuesta a un cliente.",
  },
  {
    icon: SlidersHorizontal,
    title: "Llena los datos",
    text: "Un formulario corto pide solo lo necesario. Los datos de tu negocio se guardan solo en tu navegador y se reutilizan en las demás herramientas.",
  },
  {
    icon: Copy,
    title: "Copia el prompt",
    text: "La página arma el prompt con tus datos y, si hay números, los cálculos ya hechos. Lo pegas en el asistente de IA que uses.",
  },
  {
    icon: ShieldCheck,
    title: "Revisa y aplica",
    text: "Una lista de revisión te dice qué comprobar (precios, fechas, condiciones) antes de usar el resultado.",
  },
];

const cautions = [
  {
    title: "Puede equivocarse",
    text: "Cada herramienta indica qué debes revisar antes de usar un resultado: precios, fechas, condiciones y datos de tus clientes.",
  },
  {
    title: "Los cálculos los hace la página",
    text: "Con precios, márgenes o ventas, las cuentas las hace la página con fórmulas comprobadas; la IA no las recalcula y la decisión final es tuya.",
  },
  {
    title: "Los ejemplos son ficticios",
    text: "Mostramos el método con negocios inventados y siempre lo indicamos. No publicamos resultados ni testimonios que no existan.",
  },
];

const plural = (count: number) => (count === 1 ? "1 herramienta" : `${count} herramientas`);

export default async function HomePage() {
  const herramientas = await listarVisibles();
  const destacadas = herramientas.slice(0, 6);
  const stack = herramientas.slice(0, 3);

  return (
    <>
      {/* ── Hero: mensaje directo a un lado, fichas apiladas al otro ─────────────── */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="bg-lines absolute inset-x-0 top-0 -z-10 h-[34rem] opacity-70" />
        <AuroraRibbon className="-right-[10%] top-[8%] -z-10 hidden h-[27rem] w-[60%] lg:block" />
        <AuroraRibbon soft className="-left-[18%] bottom-[-6rem] -z-10 h-[20rem] w-[55%] !opacity-25" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <Reveal>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand">IA práctica para tu negocio</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-display mt-5 max-w-3xl text-balance">Elige la tarea, llena unos datos y copia el prompt</h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Herramientas para anuncios, precios, clientes y ventas de tu negocio. La página arma el prompt con tus datos; tú lo pegas en la IA que uses y revisas el resultado.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/herramientas" className={buttonVariants({ size: "lg", className: "h-12 gap-2 rounded-full px-6 text-base" })}>
                  Ver las herramientas <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link href="/como-probamos" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 rounded-full bg-background/70 px-6 text-base backdrop-blur" })}>
                  Cómo probamos
                </Link>
              </div>
            </Reveal>
          </div>

          <div aria-hidden className="relative mx-auto hidden h-[27rem] w-full max-w-md sm:block lg:max-w-none">
            <FloatingIllustration
              file="home-hero.png"
              width={1200}
              height={1500}
              speed={0.06}
              sizes="(min-width: 1024px) 30rem, 60vw"
              className="absolute -right-6 top-1/2 z-0 w-[66%] -translate-y-1/2"
              purpose="Asistente de IA con fichas de trabajo flotando alrededor de una cinta de degradado."
            />
            {stack.map((h, index) => (
              <Reveal
                key={h.meta.slug}
                delay={200 + index * 120}
                className={cn(
                  "absolute w-[64%]",
                  index === 0 && "left-0 top-0 z-10 -rotate-3",
                  index === 1 && "left-[16%] top-[9rem] z-[11] rotate-2",
                  index === 2 && "bottom-0 left-2 z-[12] -rotate-1"
                )}
              >
                <Link
                  href={rutaHerramienta(h.meta)}
                  tabIndex={-1}
                  className="glass-panel group block rounded-2xl border border-white/40 p-5 shadow-soft-lg transition-transform duration-300 hover:-translate-y-1 dark:border-white/10"
                >
                  <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-brand">{categories.find((c) => c.slug === h.meta.area)?.name}</span>
                  <span className="mt-2 block text-balance text-[1.02rem] font-semibold leading-snug tracking-tight">{h.meta.titulo}</span>
                  <span className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{h.meta.tiempo}</span>
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquesina de tareas ─────────────────────────────────────────────────── */}
      <section aria-label="Ejemplos de tareas" className="border-y bg-paper-2 py-5">
        <Marquee
          items={tasks}
          label="Ejemplos de tareas que resuelven las herramientas"
          duration={70}
          itemClassName="rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground"
        />
      </section>

      {/* ── Áreas: filas editoriales con numeral gigante ─────────────────────────── */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16 lg:px-8 lg:py-28">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <h2 className="text-display-md text-balance">Empieza por la tarea que tienes hoy</h2>
            <p className="mt-5 max-w-sm text-muted-foreground">Las herramientas se agrupan por el área del negocio a la que pertenece cada tarea.</p>
          </Reveal>
        </div>

        <ul className="border-t">
          {categories.map((category, index) => {
            const cantidad = herramientas.filter((h) => h.meta.area === category.slug).length;
            return (
              <li key={category.slug} className="border-b">
                <Reveal delay={index * 60}>
                  <Link
                    href={`/${category.slug}`}
                    className="guide-focus group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-5 py-7 transition-colors hover:bg-muted/40 sm:gap-x-8 sm:px-3 sm:py-9"
                  >
                    <BigIndex value={index + 1} className="text-5xl text-brand transition-colors duration-300 group-hover:text-brand sm:text-7xl" />
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-brand">
                        {category.name}
                        {cantidad > 0 && <span className="ml-3 font-normal normal-case tracking-normal text-muted-foreground">{plural(cantidad)}</span>}
                      </span>
                      <span className="mt-2 block text-balance text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-brand sm:text-2xl">{category.title}</span>
                      <span className="mt-2 line-clamp-2 block max-w-xl text-sm leading-relaxed text-muted-foreground">{category.problems[0]}</span>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                        Ver el área <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                    </span>
                    <SiteImage
                      file={`area-${category.slug}.png`}
                      alt=""
                      width={480}
                      height={480}
                      sizes="(min-width: 640px) 10rem, 6rem"
                      className="h-auto w-24 object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3 sm:w-40"
                      purpose={`Objeto 3D del área ${category.name}.`}
                    />
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Método: franja de tinta con línea de tiempo ──────────────────────────── */}
      <section className="dark relative isolate overflow-hidden bg-ink text-foreground">
        <div aria-hidden className="bg-lines-dark absolute inset-0 -z-10" />
        <AuroraRibbon soft className="-right-[15%] -top-24 -z-10 h-[24rem] w-[80%]" />
        <FloatingIllustration
          file="home-metodo.png"
          width={1600}
          height={1000}
          speed={0.05}
          sizes="30rem"
          className="absolute right-4 top-10 z-0 hidden w-[28rem] lg:block xl:w-[30rem]"
          purpose="Mesa de trabajo isométrica con cuatro estaciones."
        />

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <h2 className="text-display-md max-w-2xl text-balance">Cuatro pasos, sin lecturas largas</h2>
            <p className="mt-5 max-w-xl text-foreground/70">Cada herramienta te lleva de una tarea concreta a un prompt listo para usar:</p>
          </Reveal>

          <ol className="relative mt-16 grid gap-x-8 lg:mt-28 gap-y-12 md:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className={cn("relative", index % 2 === 1 && "md:mt-12")}>
                <Reveal delay={index * 90}>
                  <div className="relative border-t border-white/20 pt-7">
                    <span aria-hidden className="absolute -top-[5px] left-0 size-[9px] rounded-full bg-brand shadow-[0_0_18px_var(--brand)]" />
                    <BigIndex value={index + 1} className="text-6xl text-brand" />
                    <span className="mt-6 flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-brand">
                      <step.icon className="size-5" aria-hidden />
                    </span>
                    <p className="mt-5 text-lg font-semibold tracking-tight">
                      <span className="sr-only">{index + 1}. </span>
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/70">{step.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Herramientas ──────────────────────────────────────────────────────────── */}
      <section className="herramienta-scope mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-display-md text-balance">Las herramientas</h2>
            <p className="mt-4 text-muted-foreground">Tareas reales de un pequeño negocio, con el prompt ya armado.</p>
          </div>
          <Link href="/herramientas" className="link-draw inline-flex items-center gap-1 text-sm font-medium text-brand">
            Ver la biblioteca <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Reveal>

        {destacadas.length > 0 ? (
          <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {destacadas.map((h) => (
              <li key={`${h.meta.area}/${h.meta.slug}`}>
                <TarjetaHerramienta herramienta={h} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 max-w-2xl text-muted-foreground">
            Estamos preparando las primeras herramientas. Cada una se publica solo cuando su prompt se ha probado de verdad en una IA.
          </p>
        )}
      </section>

      {/* ── Cierre editorial ──────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-t bg-paper-2">
        <div aria-hidden className="glow-brand absolute -bottom-40 -left-32 -z-10 size-[30rem] opacity-50" />
        <FloatingIllustration
          file="home-criterio.png"
          width={900}
          height={900}
          speed={0.04}
          sizes="20rem"
          className="absolute -bottom-4 left-[3%] z-0 hidden w-[19rem] lg:block"
          purpose="Balanza con un cubo de IA y una mano abierta en equilibrio."
        />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:px-8 lg:py-28">
          <Reveal className="lg:pt-6">
            <h2 className="text-display-md text-balance">La IA ayuda, pero no decide por ti</h2>
            <p className="mt-8 text-sm">
              <Link href="/como-probamos" className="link-draw inline-flex items-center gap-1 font-medium text-brand">
                Conoce cómo probamos cada herramienta <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </p>
          </Reveal>

          <ul className="border-t">
            {cautions.map((item, index) => (
              <li key={item.title} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 border-b py-7 sm:grid-cols-[5rem_minmax(0,1fr)]">
                <BigIndex value={index + 1} variant="soft" className="text-4xl text-foreground sm:text-5xl" />
                <Reveal delay={index * 80}>
                  <p className="text-lg font-semibold tracking-tight">{item.title}</p>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
