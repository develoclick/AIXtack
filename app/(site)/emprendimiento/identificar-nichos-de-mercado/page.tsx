import { JsonLd } from "@/components/seo/json-ld";
import { PaginaNichos, PREGUNTAS_NICHOS } from "@/components/nichos/pagina-nichos";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "emprendimiento";
const SLUG = "identificar-nichos-de-mercado";

export const generateMetadata = () => metadataDeHerramienta(CATEGORIA, SLUG);

export default function Page() {
  // 404 mientras la herramienta esté «pendiente» en el catálogo (content/catalogo/herramientas.ts).
  const h = exigirPublicada(CATEGORIA, SLUG);
  const ruta = rutaHerramienta(h);
  const autor = getAuthor(AUTOR_POR_DEFECTO)!.name;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: getCategoria(CATEGORIA)!.nombre, path: `/${CATEGORIA}` }, { name: h.pagina.tituloCorto, path: ruta }]),
          webApplicationJsonLd({ nombre: h.pagina.tituloCorto, descripcion: h.pagina.descripcion, path: ruta, autor, categoria: "BusinessApplication" }),
          howToJsonLd({
            nombre: "Cómo identificar y validar un nicho de mercado con IA",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Cuenta tu inventario personal", texto: "Escribe tus conocimientos, sectores de interés, lo que sabes ofrecer, tu mercado, recursos, presupuesto y canales disponibles.", ancla: "paso-1" },
              { nombre: "Copia el Prompt 1", texto: "Pégalo en un asistente de IA de texto: te devuelve entre 8 y 10 nichos como hipótesis, con ficha completa y puntuados de 1 a 5.", ancla: "paso-2" },
              { nombre: "Compara, elige y valida", texto: "La página arma una matriz con tus propios pesos; marca tus 2 favoritos, copia el Prompt 2 y sigue el plan de validación de 14 días.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_NICHOS),
        ]}
      />
      <PaginaNichos herramienta={h} />
    </>
  );
}
