import Link from "next/link";
import { ArrowRight, Clock, ListTree, Lock, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorLogo } from "./generador-logo";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_LOGO } from "@/content/ejemplos/logo";
import { leerRespuestaLogo } from "@/lib/logo/lector";
import { comprobarPaleta } from "@/lib/logo/paleta";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_LOGO = [
  {
    q: "¿Esta página genera la imagen del logo?",
    a: "No. Arma el brief, los conceptos y los prompts para que tú los pegues en un generador de imágenes (por ejemplo, uno que ya uses). La página nunca genera ni sube ninguna imagen a un servidor: el laboratorio funciona con la imagen que tú generas y subes, y se queda en tu navegador.",
  },
  {
    q: "¿Puedo usar comercialmente un logo creado con IA?",
    a: "Revisa los términos de uso del generador de imágenes que elijas y verifica que el resultado no se parezca a una marca ya registrada antes de usarlo comercialmente. Esta página no puede confirmarlo por ti.",
  },
  {
    q: "¿Por qué el texto del logo sale mal escrito?",
    a: "Los generadores de imágenes por IA suelen fallar al dibujar letras. Por eso el prompt pide símbolos sin texto: compón el nombre aparte, con la tipografía elegida, en un editor de diseño.",
  },
  {
    q: "¿Necesito un archivo vectorial?",
    a: "Para imprimir en grande (una fachada, una lona) o para bordar, sí. La imagen que genera una IA es un mapa de píxeles: pierde nitidez al agrandarla mucho. Vectorízala antes de esos usos.",
  },
  {
    q: "¿Cuántos colores debe tener un logo?",
    a: "Suelen bastar de 1 a 3. Un logo que solo funciona con muchos colores a la vez es frágil: pruébalo también en un único color, para sellos, bordados o impresión económica.",
  },
  {
    q: "¿Esto sustituye a un diseñador?",
    a: "No. Es un punto de partida sólido, con la estrategia resuelta antes de la imagen. Para una marca que vas a registrar o a usar por años, la revisión de un diseñador profesional vale la inversión.",
  },
  {
    q: "¿Qué es el laboratorio del logo?",
    a: "Una prueba visual en tu propio navegador: subes la imagen que generaste y la ves en fondo claro y oscuro, en tamaños pequeños, en un perfil circular, en una tarjeta y en una fachada simulada, antes de decidirte por ella.",
  },
  {
    q: "¿Cómo se calcula el contraste de la paleta?",
    a: "Con la fórmula de luminancia relativa del estándar WCAG, en tu navegador: nunca se lo pedimos a la IA, porque una IA puede describir un contraste que en realidad no cumple.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario se guarda solo en tu navegador, y la imagen que subas al laboratorio nunca sale de tu navegador ni se guarda al recargar la página. Tus datos de texto salen únicamente cuando tú pegas el prompt en la IA que elijas. Más detalles en la política de privacidad.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Director de arte especializado en identidad visual para pequeñas empresas."],
  ["Objetivo", "Crear una dirección creativa sólida antes de proponer cualquier imagen, y traducirla en prompts."],
  ["Fuente", "Los datos de tu negocio, entre etiquetas y declarados como información, no como instrucciones."],
  ["Datos del usuario", "Empresa, rubro, oferta, público, personalidad de marca, estilo, colores, símbolos y usos previstos."],
  ["Reglas de contenido", "Usar solo tus datos, proponer exactamente 3 conceptos distintos y nunca copiar una marca o un logo existente."],
  ["Reglas de formato", "Paleta y tipografías en bloques CSV (no JSON); un prompt en inglés y otro en español por cada una de las 8 variantes."],
  ["Formato de salida", "9 títulos exactos y en orden, para que la página arme los paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: 3 conceptos distintos, 8 variantes con su prompt, y ningún contraste calculado por ella misma."],
];

const CHECKLIST = [
  "El isotipo (sin el nombre) se lee bien a 16 px, no solo en el tamaño grande en que lo generaste.",
  "Probaste el logo sobre fondo claro y sobre fondo oscuro, no solo sobre el fondo con el que lo generaste.",
  "El color principal de tu paleta llega al contraste AA con texto negro o blanco, según lo que muestra esta página.",
  "El nombre de tu empresa está compuesto con la tipografía elegida, no con el texto (probablemente mal escrito) que dibujó la IA.",
  "Verificaste que la tipografía elegida tenga una licencia de uso comercial gratuita, o compraste la licencia correspondiente.",
  "Buscaste si un logo parecido ya existe en tu rubro antes de imprimirlo en grande.",
  "Vectorizaste el resultado si lo vas a imprimir en un tamaño grande o a bordar.",
  "Alguien más (idealmente un diseñador) revisó el resultado antes de registrarlo como marca.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#que-funciona", "Qué hace que un logo funcione"],
  ["#tipos-de-logo", "Logotipo, isotipo, imagotipo, isologo"],
  ["#brief-antes-que-imagen", "El brief antes que la imagen"],
  ["#colores", "Colores y contraste"],
  ["#tipografias", "Tipografías y licencias"],
  ["#tamano-pequeno", "La prueba del tamaño pequeño"],
  ["#errores-frecuentes", "Errores frecuentes con IA"],
  ["#vectorizar", "De la imagen a un logo usable"],
  ["#preparar-identidad", "Preparar la identidad"],
  ["#registro-de-marca", "Registro de marca"],
  ["#ejemplo", "Ejemplo completo"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#checklist", "Checklist antes de usar tu logo"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaLogo({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_LOGO[0];
  const lecturaEj = leerRespuestaLogo(ej.respuesta);
  const contrastes = comprobarPaleta(lecturaEj.paleta);
  const trigo = contrastes.find((c) => c.color.nombre === "Trigo")!;
  const marron = contrastes.find((c) => c.color.nombre === "Marrón horno")!;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Crear el logo de tu empresa" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">Primero la estrategia, luego la imagen: brief de marca, 3 conceptos, prompts por variante y un laboratorio para revisar el resultado antes de usarlo en cualquier lado.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Sparkles, "Gratis, sin registro"],
              [Palette, "Contraste WCAG calculado"],
              [ShieldCheck, "No genera imágenes por ti"],
              [Lock, "Tu logo se queda en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof Sparkles;
              return (
                <li key={texto as string} className="pildora">
                  <I aria-hidden className="size-4 text-brand" />
                  {texto as string}
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">
            Por{" "}
            <Link href="/sobre-nosotros" className="font-semibold text-foreground underline-offset-2 hover:underline">
              {autor.name}
            </Link>{" "}
            · Publicado el <time dateTime={herramienta.fechaPublicacion}>{formatDate(herramienta.fechaPublicacion)}</time> · Actualizado el <time dateTime={herramienta.fechaActualizacion}>{formatDate(herramienta.fechaActualizacion)}</time>
          </p>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Esta página no genera imágenes ni reemplaza a un diseñador profesional. Toda propuesta requiere tu revisión antes de usarla como marca definitiva.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Creador de logo profesional con IA">
          <GeneradorLogo />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · marca ficticia</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Para «{ej.datos.nombreEmpresa}», el color trigo necesita texto {trigo.textoRecomendado} para llegar al contraste AA
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En una comparación ficticia, el trigo (#D9A441) da {trigo.contrasteBlanco!.toFixed(1)}:1 sobre blanco y {trigo.contrasteNegro!.toFixed(1)}:1 sobre negro; el marrón horno (#5B3A29) ya cumple AA con texto blanco encima. Ese cálculo lo hace esta página, nunca la IA.{" "}
            <a href="#ejemplo" className="font-medium text-brand underline underline-offset-2">
              Ver el ejemplo completo
            </a>
            .
          </p>
        </aside>

        <div className="guia-diferida mx-auto mt-16 max-w-3xl">
          <div className="tarjeta p-5">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <ListTree aria-hidden className="size-4 text-brand" /> En esta página
              </span>
              <span className="flex items-center gap-1 font-normal text-muted-foreground tabular">
                <Clock aria-hidden className="size-3.5" /> {p.tiempoLectura} de lectura · última actualización: <time dateTime={herramienta.fechaActualizacion}>{formatDate(herramienta.fechaActualizacion)}</time>
              </span>
            </p>
            <nav aria-label="Índice de la guía">
              <ol className="mt-3 grid gap-x-6 sm:grid-cols-2">
                {TOC.map(([href, texto]) => (
                  <li key={href}>
                    <a href={href} className="flex min-h-11 items-center text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                      {texto}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <article className={`${PROSE} mt-8`}>
            <h2 id="como-funciona">Cómo funciona la herramienta</h2>
            <p>«Hazme un logo» le pide a una IA que resuelva estrategia e imagen al mismo tiempo, y por eso el resultado suele ser genérico. Esta herramienta separa ambas cosas en tres pasos.</p>
            <ol>
              <li>
                <strong>Cuentas tu negocio y su personalidad</strong> con 3 deslizadores (clásico↔moderno, serio↔cercano, lujo↔accesible), en vez de adjetivos sueltos difíciles de traducir en imagen.
              </li>
              <li>
                <strong>Copias un prompt de texto</strong> (no de imagen todavía): te devuelve un brief, 3 conceptos distintos, la paleta con su uso, las tipografías y un prompt de imagen por cada una de las 8 variantes que necesita una identidad completa.
              </li>
              <li>
                <strong>Generas la imagen en un generador aparte</strong> con el prompt de la variante que elijas, y la subes al laboratorio de esta página para probarla en fondos, tamaños pequeños y como favicon, antes de darla por buena.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la IA no genera ninguna imagen ni calcula ningún contraste.</strong> Solo arma la dirección creativa y los prompts; el laboratorio y el contraste de color los calcula tu navegador.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="que-funciona">Qué hace que un logo funcione</h2>
            <Tabla
              resumen="Cinco cualidades de un logo que funciona, y qué significa cada una"
              columnas={["Cualidad", "Qué significa"]}
              primeraColumnaEnNegrita
              filas={[
                ["Simple", "Se puede describir en una frase y dibujar de memoria."],
                ["Memorable", "Tiene un rasgo distintivo que no se olvida a la primera mirada."],
                ["Versátil", "Funciona a color y en un solo color, grande y pequeño, sobre fondo claro y oscuro."],
                ["Pertinente", "Encaja con el rubro sin caer en su cliché más repetido."],
                ["Legible", "El nombre y el símbolo se leen sin esfuerzo en el tamaño en que de verdad se van a usar."],
              ]}
            />
            <p>Esta herramienta apunta directamente a las dos últimas: por eso pide 3 conceptos distintos (para elegir el más pertinente) y trae un laboratorio de tamaños pequeños (para probar la legibilidad real, no la del archivo grande).</p>

            <h2 id="tipos-de-logo">Logotipo, isotipo, imagotipo e isologo: diferencias</h2>
            <Tabla
              resumen="Los 4 tipos de logo, con un ejemplo genérico de cada uno"
              columnas={["Tipo", "Qué es", "Cuándo conviene"]}
              primeraColumnaEnNegrita
              filas={[
                ["Logotipo", "Solo el nombre, en una tipografía trabajada, sin símbolo aparte.", "Nombres cortos y memorables por sí solos; marcas que priorizan la elegancia tipográfica."],
                ["Isotipo", "Solo un símbolo, sin el nombre.", "Marcas ya conocidas, o que necesitan un ícono que funcione solo en espacios muy pequeños (favicon, avatar)."],
                ["Imagotipo", "Símbolo y nombre, pero pueden separarse y usarse solos.", "La opción más flexible para un negocio nuevo: sirve completo y también solo con el símbolo."],
                ["Isologo", "Símbolo y nombre fundidos en una sola pieza, inseparables.", "Cuando el símbolo y el texto forman una sola figura y no tiene sentido usarlos por separado."],
              ]}
            />
            <p>El prompt de esta herramienta le pide a la IA que declare el tipo de cada concepto, para que decidas con ese criterio y no solo por el símbolo que más te guste a primera vista.</p>

            <h2 id="brief-antes-que-imagen">Del negocio al concepto: por qué el brief va antes que la imagen</h2>
            <p>
              Pedir una imagen sin brief obliga a la IA a adivinar tu público, tu personalidad y qué debe evitar tu logo; el resultado es un promedio genérico de tu rubro. El brief resuelve esas preguntas primero, en texto, donde es barato corregir, en vez de después de generar (y pagar, en algunos generadores) varias imágenes que no encajan.
            </p>
            <p>Los 3 deslizadores de personalidad cumplen el mismo papel que un adjetivo, pero son más fáciles de traducir en decisiones de diseño: un negocio «cercano» sugiere formas redondeadas y colores cálidos; uno «serio», formas geométricas y paleta reducida.</p>

            <h2 id="colores">Cómo elegir colores según tu posicionamiento (y comprobar contraste)</h2>
            <p>Antes de mirar si un color «te gusta», dos preguntas más útiles: ¿qué comunica en tu rubro? y ¿funciona con texto encima? Esta herramienta calcula lo segundo por ti con la fórmula de contraste del estándar WCAG (la misma que usan los verificadores de accesibilidad):</p>
            <Tabla
              resumen="Contraste (WCAG) del ejemplo de la guía: color contra texto blanco y contra texto negro"
              columnas={["Color", "Contra texto negro", "Contra texto blanco", "¿Cumple AA (≥ 4,5:1)?"]}
              primeraColumnaEnNegrita
              filas={[
                ["Trigo (#D9A441)", `${trigo.contrasteNegro!.toFixed(1)}:1`, `${trigo.contrasteBlanco!.toFixed(1)}:1`, trigo.cumpleAA ? "Sí" : "No, solo con texto negro"],
                ["Marrón horno (#5B3A29)", `${marron.contrasteNegro!.toFixed(1)}:1`, `${marron.contrasteBlanco!.toFixed(1)}:1`, marron.cumpleAA ? "Sí, con texto blanco" : "No"],
              ]}
            />
            <p>Un color que no llega a 4,5:1 con ningún texto encima puede seguir siendo parte de tu paleta (como fondo o acento), pero evita ponerle texto legible directamente encima.</p>

            <h2 id="tipografias">Cómo elegir tipografías y verificar su licencia</h2>
            <p>La IA puede sugerir una tipografía de pago sin saberlo. Por eso el prompt le pide siempre una alternativa gratuita de Google Fonts por cada tipografía recomendada, y esta página marca «verificar licencia» en cualquiera que no declare explícitamente que es de uso comercial libre.</p>
            <ul>
              <li>Confirma la licencia exacta en la página de Google Fonts antes de usarla en un logo que vas a registrar.</li>
              <li>Usa como máximo 2 familias tipográficas: una para el nombre, otra (opcional) para textos secundarios.</li>
              <li>Prueba el nombre completo, no solo una letra suelta: algunas tipografías elegantes pierden legibilidad en nombres largos.</li>
            </ul>

            <Anuncio posicion="medio" />

            <h2 id="tamano-pequeno">La prueba del tamaño pequeño: favicon y perfil</h2>
            <p>Un logo que se ve bien en una lona de 3 metros puede ser ilegible en un favicon de 16 píxeles. El laboratorio de esta herramienta genera tu logo en 16, 32, 180 y 512 px al instante, con canvas en tu propio navegador, para que lo compruebes antes de imprimir o publicar nada.</p>
            <ul>
              <li>A 16 px, solo sobreviven las formas más simples: si tu isotipo tiene muchos detalles, simplifícalo para esta versión.</li>
              <li>El nombre completo casi nunca se lee bien por debajo de 24 px: para favicon y avatar, usa el isotipo solo.</li>
              <li>Prueba también el perfil circular: recorta las esquinas del símbolo, así que deja margen alrededor.</li>
            </ul>

            <h2 id="errores-frecuentes">Errores frecuentes de los logos generados con IA</h2>
            <Tabla
              resumen="Errores frecuentes al generar un logo con IA, por qué ocurren y cómo corregirlos"
              columnas={["Error", "Por qué ocurre", "Corrección"]}
              primeraColumnaEnNegrita
              filas={[
                ["El nombre sale mal escrito", "Los generadores de imágenes no entienden texto como letras: lo dibujan como formas.", "Genera solo el símbolo (sin texto) y compón el nombre aparte, con la tipografía elegida."],
                ["Exceso de detalle", "La IA tiende a añadir sombras, texturas y adornos que no se pidieron.", "Repite el prompt insistiendo en «flat, sin sombras, sin degradados» y elige el resultado más simple."],
                ["Degradados no deseados", "Muchos modelos usan degradados por defecto para dar «profundidad».", "Pide explícitamente «color sólido, sin degradado» en el prompt."],
                ["Parecido con otra marca", "El modelo generaliza a partir de miles de logos reales del mismo rubro.", "Compara tu resultado con la competencia antes de usarlo; si se parece, cambia el concepto."],
              ]}
            />

            <h2 id="vectorizar">Cómo convertir una imagen de IA en un logo usable: vectorizar y componer el texto</h2>
            <p>La imagen que entrega un generador es un mapa de píxeles (PNG o JPG): pierde nitidez si la agrandas mucho. Para un logo que vas a imprimir en grande, bordar o usar por años, conviene convertirla en un archivo vectorial (SVG), que escala sin perder calidad.</p>
            <ol>
              <li>Elige el símbolo generado que mejor represente tu concepto (sin el texto, si salió mal escrito).</li>
              <li>Vectorízalo con una herramienta de trazado (muchos editores de diseño lo incluyen).</li>
              <li>Compón el nombre por separado, con la tipografía elegida, en el mismo archivo vectorial.</li>
              <li>Revisa el resultado a los tamaños del laboratorio antes de darlo por definitivo.</li>
            </ol>

            <h2 id="preparar-identidad">Preparar la identidad para impresión, web y redes</h2>
            <Tabla
              resumen="Qué variante usar según el uso previsto"
              columnas={["Uso", "Variante recomendada"]}
              primeraColumnaEnNegrita
              filas={[
                ["Favicon del sitio web", "Isotipo, simplificado, cuadrado."],
                ["Avatar de redes sociales", "Isotipo dentro de un círculo, con margen alrededor."],
                ["Tarjeta de presentación", "Principal (símbolo y nombre) o logotipo puro, según el concepto elegido."],
                ["Fachada o lona grande", "Monocromo, vectorizado, para máxima legibilidad a distancia."],
                ["Documentos impresos en blanco y negro", "Monocromo o negativo, según el fondo del documento."],
              ]}
            />

            <h2 id="registro-de-marca">Registro de marca y derechos de uso: qué verificar</h2>
            <p>
              Antes de invertir en imprimir tu logo en grande o de usarlo como marca por años, conviene revisar si el nombre y el símbolo ya están registrados por otra empresa. En Perú, ese registro lo gestiona INDECOPI (ver fuentes); en otros países, la autoridad de propiedad intelectual correspondiente.
            </p>
            <p>Además del registro, verifica que el generador de imágenes que uses te permita un uso comercial del resultado: revisa sus términos de servicio, no los de esta página.</p>

            <h2 id="ejemplo">Ejemplo completo: panadería artesanal ficticia</h2>
            <p>«{ej.datos.nombreEmpresa}», panadería artesanal ficticia en Lima, público de 25 a 45 años, personalidad cercana y artesanal (no moderna ni lujosa).</p>
            <h3>1. Tres conceptos, un mismo negocio</h3>
            <Tabla
              resumen="Los 3 conceptos del ejemplo, con su tipo"
              columnas={["Concepto", "Idea", "Tipo"]}
              primeraColumnaEnNegrita
              filas={[
                ["Espiga-M", "una espiga de trigo que forma la letra M", "Imagotipo"],
                ["Horno redondo", "un círculo que evoca la boca de un horno de barro", "Isotipo"],
                ["Tipografía manuscrita", "el nombre escrito a mano, sin símbolo", "Logotipo"],
              ]}
            />
            <h3>2. El riesgo típico: el nombre mal escrito</h3>
            <p>Al generar el concepto «Espiga-M» con el nombre completo, un generador escribió «Masa Madr Rimac»: el símbolo se leía perfecto, el texto no. Solución: usar solo el isotipo generado y componer «Masa Madre Rímac» aparte, con la tipografía Fraunces elegida en las especificaciones.</p>
            <h3>3. La prueba a 32 px</h3>
            <p>La espiga sola se lee con claridad a 32 px; el nombre completo, no. Por eso el favicon y el avatar de esta marca usan solo el isotipo, y la versión con nombre completo queda para la fachada y las bolsas, donde hay más espacio.</p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «me haga un logo»:</p>
            <Tabla resumen="Bloques del prompt de crear un logo profesional y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca calcula el contraste de color ni genera la imagen final: solo propone la dirección creativa y los prompts de imagen. El contraste lo calcula esta página; la imagen la generas tú, en el generador que elijas.</p>

            <h2 id="checklist">Checklist antes de usar tu logo</h2>
            <ul className="not-prose my-4 space-y-2">
              {CHECKLIST.map((x) => (
                <li key={x} className="tarjeta flex gap-3 p-3 text-sm">
                  <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border border-brand-solid text-xs text-brand">
                    ✓
                  </span>
                  {x}
                </li>
              ))}
            </ul>

            <h2 id="limites">Límites y verificación</h2>
            <ul>
              <li>
                <strong>No genera imágenes.</strong> Esta página arma texto (brief, conceptos, prompts); la imagen la generas tú en un generador aparte.
              </li>
              <li>
                <strong>No sustituye a un diseñador profesional.</strong> Para una marca que vas a registrar o a usar por años, la revisión humana vale la inversión.
              </li>
              <li>
                <strong>No verifica derechos de marca.</strong> El laboratorio prueba cómo se ve tu logo, no si ya existe uno parecido registrado.
              </li>
              <li>
                <strong>No da asesoría legal.</strong> Para el registro de tu marca, consulta a INDECOPI o a un especialista en propiedad intelectual. Si tienes dudas sobre esta herramienta, puedes <Link href="/contacto">escribirnos</Link>.
              </li>
              <li>
                <strong>Tus datos, siempre en tu navegador.</strong> El formulario y la imagen que subas al laboratorio nunca se envían a este sitio; revisa el detalle en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíba: puede repetir un concepto genérico o mezclar dos variantes. La revisión final es tuya.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El cálculo de contraste WCAG, el lector de la respuesta y el generador de tamaños del laboratorio se prueban automáticamente con datos ficticios. La calidad de la imagen que entregue cada generador no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_LOGO.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {q.a}
                  {q.q.includes("Mis datos") && (
                    <>
                      {" "}
                      <Link href="/politica-de-privacidad" className="text-brand underline underline-offset-2">
                        Leer la política de privacidad
                      </Link>
                      .
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>

          <HerramientasRelacionadas categoria={herramienta.categoria} slug={herramienta.slug} />
          {pendientes.length > 0 && (
            <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>Pendientes de publicar (sin enlace): {pendientes.map((h) => h.titulo).join("; ")}.</span>
            </p>
          )}

          {apoyo.length > 0 && (
            <section aria-labelledby="articulos-relacionados" className="mt-12">
              <h2 id="articulos-relacionados" className="text-xl font-semibold">
                Artículos relacionados
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {apoyo.map((a) => (
                  <li key={a.slug}>
                    <Link href={rutaDeArticulo(a)} className="tarjeta tarjeta-enlace flex h-full flex-col p-4">
                      <span className="font-semibold leading-snug">{a.metaTitulo}</span>
                      <span className="mt-2 flex items-center gap-1 text-sm font-medium text-brand">
                        Leer <ArrowRight aria-hidden className="size-4" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="fuentes" className="tarjeta mt-12 p-5 text-sm">
            <h2 id="fuentes" className="text-base font-semibold">
              Fuentes y verificación
            </h2>
            <p className="mt-3 text-muted-foreground">Esta página oficial peruana se localizó y se consultó el 30 de septiembre de 2026; su contenido no cargó completo de forma automática, por eso esta guía no cita ningún costo ni plazo exacto de ella (esas cifras cambian con el tiempo). Sirve para que verifiques tú el registro de tu marca:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://pi.indecopi.gob.pe/asesoria-marcas/" target="_blank" rel="noopener noreferrer">
                  Indecopi: Plataforma virtual de asesoría de marcas para emprendedores
                </a>
                : orientación oficial para registrar una marca en Perú.
              </li>
            </ul>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>El cálculo de contraste sigue la fórmula pública de luminancia relativa del estándar WCAG 2 (W3C); no es una interpretación de la IA.</li>
              <li>Esta herramienta no genera ni contiene ninguna imagen: solo texto (brief, conceptos y prompts) y cálculos hechos en tu navegador con la imagen que tú subas.</li>
              <li>No usamos el nombre ni el logo de ningún generador de imágenes ni de ninguna marca real como ejemplo.</li>
              <li>Para otros países, consulta a la autoridad de propiedad intelectual correspondiente.</li>
              <li>Todos los ejemplos (empresas, conceptos, paletas y prompts) son ficticios y de elaboración propia; sus cifras de contraste se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
