"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { subscribeAction, type NewsletterActionState } from "@/lib/forms/newsletter";
import type { NewsletterSource } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

const initialState: NewsletterActionState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="shrink-0">
      {pending ? <Loader2 className="size-4 animate-spin" /> : label}
    </Button>
  );
}

export function NewsletterForm({
  source,
  className,
  compact = false,
}: {
  source: NewsletterSource;
  className?: string;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(subscribeAction, initialState);

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className={cn("flex flex-col gap-2", className)}>
      <input type="hidden" name="source" value={source} />
      {/* Honeypot anti-spam, oculto para humanos */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
      />
      <div className="flex w-full gap-2">
        <div className="relative flex-1">
          {!compact && (
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            className={cn(!compact && "pl-9")}
          />
        </div>
        <SubmitButton label="Suscribirme" />
      </div>
      <p className="text-xs text-muted-foreground">
        Sin spam. Cancela tu suscripción cuando quieras.
      </p>
    </form>
  );
}
