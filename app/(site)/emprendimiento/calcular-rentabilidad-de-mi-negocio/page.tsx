import { JsonLd } from "@/components/seo/json-ld";
import { PaginaRentabilidad, PREGUNTAS_RENTABILIDAD } from "@/components/rentabilidad/pagina-rentabilidad";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "emprendimiento";
const SLUG = "calcular-rentabilidad-de-mi-negocio";

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
            nombre: "Cómo calcular la rentabilidad de tu negocio por producto con IA",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Carga tus productos y tus costos", texto: "Escribe el precio, el costo directo y las unidades vendidas de cada producto, tus costos variables por venta y tus costos fijos del período (o impórtalos desde un .csv).", ancla: "paso-1" },
              { nombre: "Copia el prompt", texto: "Pégalo en un asistente de IA de texto: le entrega tu cálculo ya resuelto (ingresos, márgenes, punto de equilibrio y sensibilidad) para que lo interprete.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y descarga tu informe", texto: "La página arma los paneles de rentabilidad por producto, sensibilidad y costos posiblemente omitidos, revisa las cifras sin respaldo y te deja descargar el informe en .csv.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_RENTABILIDAD),
        ]}
      />
      <PaginaRentabilidad herramienta={h} />
    </>
  );
}
