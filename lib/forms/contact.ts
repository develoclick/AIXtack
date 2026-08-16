/**
 * Sitio 100% estático: no hay Server Action ni base de datos detrás de este
 * formulario. Si se configura NEXT_PUBLIC_CONTACT_FORM_ENDPOINT (p. ej. un
 * formulario de Formspree/Web3Forms), el envío se reenvía ahí; si no,
 * se informa al usuario de la vía de contacto directa por email.
 */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function submitContactAction(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();

  // Honeypot anti-spam: un bot que rellena todos los campos cae aquí.
  if (company) {
    return { status: "success", message: "Mensaje enviado. Te responderemos pronto." };
  }

  if (name.length < 2) return { status: "error", message: "Escribe tu nombre completo." };
  if (!emailPattern.test(email)) return { status: "error", message: "Introduce un email válido." };
  if (message.length < 10) return { status: "error", message: "Cuéntanos un poco más." };

  const endpoint = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT;
  if (!endpoint) {
    return {
      status: "error",
      message: "El formulario no está activo todavía. Escríbenos directamente a contacto@guiapromptsia.com.",
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });
    if (!response.ok) throw new Error(`Endpoint respondió ${response.status}`);
    return { status: "success", message: "Mensaje enviado. Te responderemos pronto." };
  } catch (error) {
    console.error("[contact:submit]", error);
    return { status: "error", message: "No se pudo enviar el mensaje. Inténtalo más tarde." };
  }
}
