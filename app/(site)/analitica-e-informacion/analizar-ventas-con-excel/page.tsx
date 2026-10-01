import { JsonLd } from "@/components/seo/json-ld";
import { PaginaAnalizarVentas, PREGUNTAS_ANALIZAR_VENTAS } from "@/components/analizar-ventas/pagina-analizar-ventas";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "analitica-e-informacion";
const SLUG = "analizar-ventas-con-excel";

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
            nombre: "Cómo analizar tu archivo de ventas en Excel con IA",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Sube tu archivo de ventas", texto: "Sube tu Excel o CSV, revisa el mapeo de columnas y obtén tu dashboard al instante.", ancla: "paso-1" },
              { nombre: "Copia el prompt", texto: "Pégalo en un asistente de IA para obtener un análisis riguroso de calidad de datos, hallazgos e hipótesis.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y descarga tu informe", texto: "Revisa la calidad de datos, los hallazgos y las hipótesis, y descarga tu informe en PDF o en .csv.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_ANALIZAR_VENTAS),
        ]}
      />
      <PaginaAnalizarVentas herramienta={h} />
    </>
  );
}
