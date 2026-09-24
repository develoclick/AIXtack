import { Mail, MapPin } from "lucide-react";
import { EditorialHero } from "@/components/visual/editorial-hero";
import { FloatingIllustration } from "@/components/visual/floating-illustration";
import { Reveal } from "@/components/visual/reveal";
import { buildMetadata } from "@/lib/seo/metadata";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { contactEmail, institutionalUpdatedAt } from "@/lib/site";
import { formatDate } from "@/lib/utils/format";

export const metadata = buildMetadata({
  title: "Contacto",
  description:
    "Escríbenos para reportar un error, hacer una consulta o proponer una tarea de tu negocio que quieras ver resuelta con IA.",
  path: "/contacto",
});

export default function ContactPage() {
  const updatedAt = institutionalUpdatedAt("/contacto");

  return (
    <>
      <EditorialHero
        eyebrow="Contacto"
        title="Hablemos"
        description="¿Tienes una duda, encontraste un error o hay una tarea de tu negocio que te gustaría ver resuelta con IA? Escríbenos directamente."
        aside={
          <FloatingIllustration
            file="contacto-sobre.png"
            width={900}
            height={900}
            speed={0.07}
            sizes="20rem"
            className="relative ml-auto w-72 lg:w-80"
            purpose="Sobre marfil abierto del que sale un avión de papel menta (ver docs/rediseno/PLAN.md, imagen-12)."
          />
        }
      />

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <ul className="border-t">
          <li className="grid gap-4 border-b py-10 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-8">
            <Reveal>
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand">
                <Mail className="size-6" aria-hidden />
              </span>
            </Reveal>
            <Reveal delay={80}>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Correo electrónico</p>
              <a href={`mailto:${contactEmail}`} className="link-draw mt-3 inline-block break-all text-2xl font-semibold tracking-tight text-brand underline-offset-2 sm:text-4xl">
                {contactEmail}
              </a>
            </Reveal>
          </li>
          <li className="grid gap-4 border-b py-10 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-8">
            <Reveal>
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand">
                <MapPin className="size-6" aria-hidden />
              </span>
            </Reveal>
            <Reveal delay={80}>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Comunidad en español</p>
              <p className="mt-3 max-w-xl text-xl leading-snug tracking-tight sm:text-2xl">Trabajamos en remoto, para toda Latinoamérica y España.</p>
            </Reveal>
          </li>
        </ul>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          El correo lo lee {getAuthor(AUTOR_POR_DEFECTO)!.name}, de {getAuthor(EDITORIAL)!.name}. Si nos escribes para proponer una herramienta, cuéntanos qué tarea de tu negocio quieres resolver y qué te lo impide hoy. Última actualización:{" "}
          <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>.
        </p>
      </div>
    </>
  );
}
