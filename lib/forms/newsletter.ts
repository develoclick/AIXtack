import type { NewsletterSource } from "@/lib/types";

/**
 * Igual que el formulario de contacto: sin backend propio. Si se configura
 * NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT (proveedor externo tipo Mailchimp/
 * ConvertKit/Formspree), el envío se reenvía ahí.
 */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface NewsletterActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function subscribeAction(
  _prevState: NewsletterActionState,
  formData: FormData
): Promise<NewsletterActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const source = (formData.get("source") as NewsletterSource) ?? "other";
  const company = String(formData.get("company") ?? "").trim();

  if (company) {
    return { status: "success", message: "¡Gracias por suscribirte!" };
  }

  if (!emailPattern.test(email)) {
    return { status: "error", message: "Introduce un email válido." };
  }

  const endpoint = process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT;
  if (!endpoint) {
    return {
      status: "error",
      message: "La newsletter no está activa todavía. Vuelve a intentarlo más adelante.",
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({ email, source }),
    });
    if (!response.ok) throw new Error(`Endpoint respondió ${response.status}`);
    return { status: "success", message: "¡Gracias por suscribirte!" };
  } catch (error) {
    console.error("[newsletter:subscribe]", error);
    return { status: "error", message: "No se pudo procesar la suscripción. Inténtalo más tarde." };
  }
}
