import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Aviso de afiliados",
  description: "Cómo funcionan los enlaces de afiliados en Guía Prompts IA.",
  path: "/aviso-afiliados",
});

export default function AffiliateDisclosurePage() {
  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1>Aviso de afiliados</h1>
      <p>
        Algunos de los enlaces hacia herramientas de terceros que aparecen en Guía Prompts IA son
        enlaces de afiliados. Esto significa que, si haces clic y realizas una compra o te
        suscribes a través de ellos, podemos recibir una comisión del proveedor, sin ningún coste
        adicional para ti: el precio que pagas es el mismo que si accedieras directamente a la web
        de la herramienta.
      </p>

      <h2>Cómo identificar un enlace de afiliado</h2>
      <p>
        No todos los enlaces de guiapromptsia.com son de afiliados. Cuando una ficha de herramienta
        participa en un programa de afiliados, lo verás indicado junto al botón de acceso a la web
        oficial con un aviso de divulgación visible en la propia página.
      </p>

      <h2>Independencia editorial</h2>
      <p>
        Formar parte de un programa de afiliados nunca condiciona nuestras valoraciones: probamos y
        evaluamos cada herramienta con los mismos criterios, tenga o no un acuerdo comercial con
        nosotros. Puedes leer más sobre este proceso en nuestra{" "}
        <a href="/politica-editorial">política editorial</a>.
      </p>

      <h2>Por qué usamos afiliación</h2>
      <p>
        Los ingresos por afiliación, junto con la publicidad de Google AdSense, son la forma en que
        sostenemos Guía Prompts IA como un proyecto gratuito y sin muros de pago para el lector. Sin
        estos ingresos no podríamos mantener actualizado el directorio de herramientas ni seguir
        publicando contenido nuevo cada semana.
      </p>

      <h2>Dudas</h2>
      <p>
        Si tienes cualquier pregunta sobre un enlace concreto o sobre nuestras relaciones
        comerciales, escríbenos desde la página de <a href="/contacto">contacto</a>.
      </p>
    </div>
  );
}
