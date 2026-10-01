import { JsonLd } from "@/components/seo/json-ld";
import { PaginaSegmentarClientes, PREGUNTAS_SEGMENTAR_CLIENTES } from "@/components/segmentar-clientes/pagina-segmentar-clientes";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "analitica-e-informacion";
const SLUG = "segmentar-clientes";

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
            nombre: "Cómo segmentar tu base de clientes con RFM o reglas propias",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Sube tu archivo y elige el método", texto: "Sube tu archivo de clientes o ventas, mapea el ID de cliente y elige RFM o tus propias reglas: verás los segmentos al instante.", ancla: "paso-1" },
              { nombre: "Copia el prompt", texto: "Pégalo en un asistente de IA para que interprete cada segmento y proponga qué probar con cada uno.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y revisa tus segmentos", texto: "Esta página calculó los segmentos; la IA solo los interpreta y te avisa si alguno queda demasiado chico.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_SEGMENTAR_CLIENTES),
        ]}
      />
      <PaginaSegmentarClientes herramienta={h} />
    </>
  );
}
