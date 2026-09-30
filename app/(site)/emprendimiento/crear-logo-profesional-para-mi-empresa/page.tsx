import { JsonLd } from "@/components/seo/json-ld";
import { PaginaLogo, PREGUNTAS_LOGO } from "@/components/logo/pagina-logo";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "emprendimiento";
const SLUG = "crear-logo-profesional-para-mi-empresa";

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
          webApplicationJsonLd({ nombre: h.pagina.tituloCorto, descripcion: h.pagina.descripcion, path: ruta, autor, categoria: "DesignApplication" }),
          howToJsonLd({
            nombre: "Cómo crear un logo profesional para tu empresa con IA",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Cuenta tu negocio y su personalidad", texto: "Escribe el nombre, el rubro, la oferta, el público y ajusta los 3 deslizadores de personalidad de marca.", ancla: "paso-1" },
              { nombre: "Copia el prompt", texto: "Pégalo en un asistente de IA de texto para obtener el brief, 3 conceptos, la paleta, las tipografías y un prompt de imagen por variante.", ancla: "paso-2" },
              { nombre: "Genera la imagen y pruébala", texto: "Usa el prompt de la variante elegida en un generador de imágenes, sube el resultado al laboratorio y pruébalo en fondos, tamaños pequeños y como favicon.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_LOGO),
        ]}
      />
      <PaginaLogo herramienta={h} />
    </>
  );
}
