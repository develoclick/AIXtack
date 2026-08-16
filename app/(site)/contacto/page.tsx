import { Mail, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { ContactForm } from "@/components/contact/contact-form";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Contacto",
  description: "Ponte en contacto con el equipo de Guía Prompts IA para dudas, colaboraciones o soporte.",
  path: "/contacto",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Contacto"
        title="Hablemos"
        description="¿Tienes una duda, una propuesta de colaboración o quieres reportar un error? Escríbenos."
      />

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
              <Mail className="size-4" />
            </span>
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">contacto@guiapromptsia.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
              <MapPin className="size-4" />
            </span>
            <div>
              <p className="font-medium">Comunidad en español</p>
              <p className="text-sm text-muted-foreground">Trabajamos en remoto, para toda Latinoamérica y España.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
