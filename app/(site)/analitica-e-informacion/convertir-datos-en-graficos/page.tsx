import { JsonLd } from "@/components/seo/json-ld";
import { PaginaConvertirGraficos, PREGUNTAS_CONVERTIR_GRAFICOS } from "@/components/convertir-graficos/pagina-convertir-graficos";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "analitica-e-informacion";
const SLUG = "convertir-datos-en-graficos";

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
            nombre: "Cómo convertir una tabla en gráficos claros con IA",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Pega o sube tu tabla y elige tu objetivo", texto: "Pega tu tabla o sube un Excel/CSV, elige qué quieres responder y verás un gráfico al instante.", ancla: "paso-1" },
              { nombre: "Copia el prompt", texto: "Pégalo en un asistente de IA para obtener entre 3 y 6 gráficos sugeridos, con sus columnas y su título.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y revisa tus gráficos", texto: "Esta página dibuja cada gráfico sugerido con tus datos reales y te avisa si alguno tiene más categorías de las recomendadas.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_CONVERTIR_GRAFICOS),
        ]}
      />
      <PaginaConvertirGraficos herramienta={h} />
    </>
  );
}
