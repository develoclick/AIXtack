"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitContactAction, type ContactActionState } from "@/lib/forms/contact";

const initialState: ContactActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      Enviar mensaje
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      if (state.message) toast.success(state.message);
      formRef.current?.reset();
    }
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required placeholder="Tu nombre" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Asunto</Label>
        <Input id="subject" name="subject" placeholder="¿En qué podemos ayudarte?" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea id="message" name="message" required rows={6} placeholder="Cuéntanos los detalles..." />
      </div>

      <SubmitButton />
    </form>
  );
}
