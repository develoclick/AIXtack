import { Mail, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Contacto",
  description: "Ponte en contacto con el equipo de Guía Prompts IA para dudas, colaboraciones o soporte.",
  path: "/contacto",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        align="center"
        eyebrow="Contacto"
        title="Hablemos"
        description="¿Tienes una duda, una propuesta de colaboración o quieres reportar un error? Escríbenos directamente."
      />

      <div className="mt-12 flex flex-col items-center gap-8 rounded-2xl border bg-card p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Mail className="size-5" />
          </span>
          <div>
            <p className="font-medium">Email</p>
            <a
              href="mailto:contacto@guiapromptsia.com"
              className="text-brand underline-offset-2 hover:underline"
            >
              contacto@guiapromptsia.com
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t pt-8">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <MapPin className="size-5" />
          </span>
          <div>
            <p className="font-medium">Comunidad en español</p>
            <p className="text-sm text-muted-foreground">Trabajamos en remoto, para toda Latinoamérica y España.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
