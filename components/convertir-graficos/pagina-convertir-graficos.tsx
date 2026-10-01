import Link from "next/link";
import { ArrowRight, BarChart3, Clock, ListTree, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorConvertirGraficos } from "./generador-convertir-graficos";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_CONVERTIR_GRAFICOS } from "@/content/ejemplos/convertir-graficos";
import { calcularParaTipo, correlacionPearson, calcularDispersion } from "@/lib/convertir-graficos/motor";
import { filasTablaDesdeHoja } from "@/lib/convertir-graficos/ficha";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_CONVERTIR_GRAFICOS = [
  {
    q: "¿Qué gráfico uso para comparar categorías?",
    a: "Barras, preferiblemente ordenadas de mayor a menor. Son el gráfico que más rápido se lee cuando quieres saber quién tiene más o menos de algo.",
  },
  {
    q: "¿Cuándo uso un gráfico de pastel?",
    a: "Solo para mostrar las partes de un total, y solo si son pocas partes (idealmente 5 o menos). Con más categorías, un pastel se vuelve ilegible: usa barras en su lugar. Esta página avisa si tu pastel tiene más de 5 categorías.",
  },
  {
    q: "¿Puedo exportar los gráficos?",
    a: "Sí, en PNG, con el botón «Descargar PNG» de cada gráfico. Esta página no genera SVG: Chart.js, la librería que dibuja los gráficos, trabaja sobre un lienzo (canvas), no sobre vectores.",
  },
  {
    q: "¿Mis datos se envían a algún servidor?",
    a: "No. Tu tabla se lee y los gráficos se dibujan enteramente en tu navegador. El prompt que copias tampoco incluye tus filas: solo la ficha de tu tabla (nombres de columnas, tipos, una muestra de valores).",
  },
  {
    q: "¿Un gráfico demuestra una relación causa-efecto?",
    a: "No. Un gráfico de dispersión o una correlación alta muestran que 2 variables se mueven juntas, no que una sea la causa de la otra. Puede haber un tercer factor detrás de ambas.",
  },
  {
    q: "¿Por qué mis barras siempre empiezan en 0?",
    a: "Porque un eje Y que no empieza en 0 exagera las diferencias entre barras, aunque sean pequeñas. Esta página nunca trunca el eje Y, así que tus comparaciones siempre son honestas, aunque tu archivo original venga con ese error.",
  },
  {
    q: "¿Funciona con una tabla que pego desde Excel o Google Sheets?",
    a: "Sí. Copia el rango de celdas (con encabezado) y pégalo directamente en el recuadro de texto: esta página detecta que el separador es un tabulador y arma la tabla sola.",
  },
  {
    q: "¿Qué pasa si mi columna de fecha no se reconoce?",
    a: "Revisa que use un formato DD/MM/AAAA o AAAA-MM-DD. Si tu columna trae solo el nombre del mes («Enero», «Febrero»), esta página la trata como texto, no como fecha: puedes seguir usándola para comparar categorías con barras.",
  },
  {
    q: "¿Cuántas filas admite esta herramienta?",
    a: "Hasta 50,000 filas de datos en tu navegador. Si tu archivo trae más, se analizan las primeras y la página te avisa que se recortó.",
  },
  {
    q: "¿Esta herramienta reemplaza a un analista de datos?",
    a: "No. Te ayuda a elegir el gráfico correcto y a generarlo sin errores comunes, pero la interpretación final y las decisiones grandes (una inversión, un cambio de estrategia) siguen necesitando tu criterio o el de un profesional.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Especialista en visualización de datos, que propone gráficos sin distorsionar los datos."],
  ["Objetivo", "Proponer entre 3 y 6 gráficos que respondan tu pregunta concreta."],
  ["Fuente", "La ficha de tu tabla, entre etiquetas y declarada como información, no como instrucciones."],
  ["Datos del usuario", "Tu objetivo, tu audiencia y la unidad o moneda de tus datos."],
  ["Reglas de contenido", "Usar solo columnas reales de la ficha; nunca calcular los valores del gráfico; nunca un pastel con más de 5 categorías."],
  ["Reglas de formato", "«Gráficos sugeridos» en una tabla CSV de 8 columnas (pregunta, tipo, x, y, color, agregación, título, advertencia)."],
  ["Formato de salida", "6 títulos exactos y en orden, para que la página arme cada panel."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: columnas reales, entre 3 y 6 gráficos, ningún pastel sobrecargado, hallazgos sin cifras exactas ni causas afirmadas."],
];

const CHECKLIST = [
  "El tipo de gráfico que elegiste responde de verdad tu pregunta (revisa la guía rápida si tienes dudas).",
  "Ningún pastel de tu informe tiene más de 5 categorías (esta página te avisa si es el caso).",
  "El título de cada gráfico comunica el hallazgo, no solo describe los ejes.",
  "Si comparas 2 períodos, verificaste que sean comparables (misma duración, misma estacionalidad).",
  "Ninguna «Hallazgo visible» de la respuesta afirma una causa que los datos no pueden probar.",
  "Revisaste la tabla de datos plegable de al menos un gráfico, para confirmar que los números tienen sentido.",
  "Si vas a compartir el gráfico fuera de tu equipo, revisaste que no incluya datos personales que no deberías mostrar.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#empieza-por-la-pregunta", "Empieza por la pregunta"],
  ["#guia-rapida", "Guía rápida: 5 objetivos"],
  ["#barras-lineas-areas", "Barras vs líneas vs áreas"],
  ["#dispersion-histogramas", "Dispersión e histogramas"],
  ["#graficos-que-enganan", "Gráficos que engañan"],
  ["#muchos-datos", "Muchos datos: agregación y top N"],
  ["#titulos-que-comunican", "Títulos que comunican"],
  ["#ejemplo", "Ejemplo: una tabla en 4 gráficos"],
  ["#correlacion-no-es-causalidad", "Correlación no es causalidad"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#checklist", "Checklist antes de compartir"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaConvertirGraficos({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_CONVERTIR_GRAFICOS[0];
  const hojaEj = { nombre: ej.nombreOrigen, filas: ej.filasCrudas, truncado: false };
  const { filas: filasEj } = filasTablaDesdeHoja(hojaEj);
  const porTienda = calcularParaTipo(filasEj, "barras", "tienda", "ventas", null, "suma");
  const porCategoria = calcularParaTipo(filasEj, "pastel", "categoria", "ventas", null, "suma");
  const totalVentas = porCategoria.series[0].valores.reduce((a, b) => a + b, 0);
  const correlacion = correlacionPearson(calcularDispersion(filasEj, "visitas", "ventas"));

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Convertir datos en gráficos" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">Dinos qué quieres responder y te proponemos el gráfico adecuado, generado en tu navegador, con títulos, unidades y sin ejes truncados.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Sparkles, "Gratis, sin registro"],
              [BarChart3, "7 tipos de gráfico"],
              [ShieldCheck, "Nunca trunca el eje Y"],
              [Lock, "Tu tabla nunca sale de tu navegador"],
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Esta página no sustituye a un analista de datos. Los gráficos los dibuja esta página con tus datos reales; los hallazgos los redacta tu IA y siempre requieren tu revisión.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Convertidor de datos en gráficos con IA">
          <GeneradorConvertirGraficos />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · negocio ficticio</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            La tienda Sur superó a las otras 2 en el trimestre, sin trucos de escala
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En una boutique ficticia de Lima, Perú, con 3 tiendas, el gráfico de barras ordena {porTienda.etiquetas.join(", ")} de mayor a menor venta del trimestre, siempre con el eje Y empezando en 0: nunca exagera la diferencia entre ellas. En el pastel, {porCategoria.etiquetas[0]} es la categoría más grande de un total de S/ {totalVentas.toLocaleString("es-PE")}.{" "}
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
            <p>Pedirle a una IA «hazme un gráfico bonito» produce justamente eso: bonito, no necesariamente correcto. Esta herramienta separa la elección del tipo de gráfico (una regla clara, no una IA) del dibujo de los datos (siempre calculado en tu navegador, nunca por la IA).</p>
            <ol>
              <li>
                <strong>Pegas o subes tu tabla</strong> (desde Excel, Sheets, o un archivo .xlsx/.csv): tu navegador la lee, arma una ficha (columnas, tipos, valores únicos) y tú eliges tu objetivo (comparar, ver evolución, composición, distribución o relación).
              </li>
              <li>
                <strong>Ves un gráfico al instante</strong>, calculado en tu navegador según tu objetivo y las columnas que elijas, con una galería para comparar el mismo dato en otro tipo de gráfico.
              </li>
              <li>
                <strong>Copias un prompt</strong> que le pide a tu IA entre 3 y 6 gráficos adicionales: ella solo propone qué columnas y qué tipo usar; esta página dibuja cada uno con tus datos reales.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la IA nunca calcula los valores de un gráfico.</strong> Solo sugiere columnas, tipo y título; los números los calcula siempre esta página, y el eje Y de una barra nunca se trunca, sin excepción.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="empieza-por-la-pregunta">Empieza por la pregunta, no por el gráfico</h2>
            <p>El error más común al visualizar datos es elegir el gráfico primero («hagamos un pastel») y forzar los datos para que quepan ahí. Funciona al revés: primero defines qué quieres responder, y la pregunta misma casi siempre te dice qué gráfico usar.</p>
            <ul>
              <li>«¿Quién vendió más?» es una pregunta de comparación → barras.</li>
              <li>«¿Cómo cambió esto en el tiempo?» es una pregunta de evolución → líneas.</li>
              <li>«¿Qué partes forman el total?» es una pregunta de composición → pastel (con pocas partes) o barras.</li>
            </ul>
            <p>Por eso esta herramienta empieza pidiéndote tu objetivo, no tu tipo de gráfico preferido.</p>

            <h2 id="guia-rapida">Guía rápida: comparar, evolucionar, componer, distribuir, relacionar</h2>
            <Tabla
              resumen="Los 5 objetivos que reconoce esta herramienta, la pregunta que responden y el gráfico que se sugiere"
              columnas={["Objetivo", "Pregunta que responde", "Gráfico sugerido"]}
              primeraColumnaEnNegrita
              filas={[
                ["Comparar categorías", "¿Qué categoría tiene más o menos?", "Barras, ordenadas de mayor a menor"],
                ["Ver evolución", "¿Cómo cambió algo en el tiempo?", "Líneas (una por serie, si comparas varias)"],
                ["Ver composición", "¿Qué partes forman el total?", "Pastel, si tienes 5 categorías o menos; si no, barras"],
                ["Ver distribución", "¿Cómo se reparten los valores de una variable?", "Histograma"],
                ["Ver relación", "¿Se mueven juntas 2 variables numéricas?", "Dispersión"],
              ]}
            />
            <p>Esta tabla es, literalmente, la regla que usa el asistente local de la herramienta: no la decide la IA, la decide esta página.</p>

            <h2 id="barras-lineas-areas">Barras vs líneas vs áreas: cuándo usar cada uno</h2>
            <p>Barras y líneas se confunden a menudo. La diferencia está en qué eje X representan: si son categorías sin un orden natural (productos, tiendas, ciudades), usa barras; si es una secuencia de tiempo, usa líneas. Las áreas son una variante de las líneas que rellena el espacio bajo la curva, útil para dar peso visual a un volumen acumulado, pero con más de 2 o 3 series se vuelven difíciles de leer (se tapan unas a otras).</p>
            <Tabla
              resumen="Cuándo usar barras, líneas o áreas"
              columnas={["Tipo", "Úsalo cuando", "Evítalo cuando"]}
              primeraColumnaEnNegrita
              filas={[
                ["Barras", "Comparas categorías sin orden temporal (productos, tiendas, canales)", "Tienes más de 15-20 categorías: se vuelve una pared de barras ilegible"],
                ["Líneas", "Tienes una secuencia de tiempo (días, meses, años)", "El eje X no representa tiempo ni un orden continuo"],
                ["Áreas", "Quieres dar peso visual a un volumen que se acumula", "Comparas más de 2-3 series: las áreas se tapan entre sí"],
              ]}
            />

            <h2 id="dispersion-histogramas">Dispersión e histogramas para entender distribuciones y relaciones</h2>
            <p>Estos 2 tipos de gráfico responden preguntas distintas de las de barras y líneas, y por eso se olvidan con más frecuencia:</p>
            <ul>
              <li>
                <strong>Histograma:</strong> agrupa una sola variable numérica en franjas para mostrar cómo se reparten sus valores. Responde «¿la mayoría de mis datos están cerca del promedio, o muy repartidos?».
              </li>
              <li>
                <strong>Dispersión:</strong> ubica cada fila como un punto (x, y) para ver si 2 variables numéricas se mueven juntas. Responde «¿cuando una sube, la otra también sube (o baja)?».
              </li>
            </ul>
            <p>Ninguno de los 2 necesita categorías ni fechas: solo columnas numéricas, por eso esta herramienta los separa del resto en el asistente de elección.</p>

            <Anuncio posicion="medio" />

            <h2 id="graficos-que-enganan">Gráficos que engañan: 7 errores comunes (con ejemplos corregidos)</h2>
            <Tabla
              resumen="7 errores comunes al hacer gráficos, por qué engañan y cómo corregirlos"
              columnas={["Error", "Por qué engaña", "Corrección"]}
              primeraColumnaEnNegrita
              filas={[
                ["Eje Y que no empieza en 0 (en barras)", "Una diferencia pequeña parece enorme: 2 barras de 90 y 98 se ven del doble si el eje empieza en 85", "Esta página nunca trunca el eje Y en barras; si ves esto en otra herramienta, corrígelo a mano"],
                ["Pastel con más de 5-6 categorías", "Los ángulos pequeños son casi imposibles de comparar entre sí", "Usa barras ordenadas, o agrupa las categorías chicas en «Otros»"],
                ["Doble eje Y sin justificar", "El lector no sabe qué línea corresponde a qué eje, y las escalas pueden alinearse para sugerir una relación que no existe", "Usa 2 gráficos separados, o justifica explícitamente por qué comparten el mismo espacio"],
                ["Gráficos 3D", "La perspectiva distorsiona el tamaño real de cada barra o porción", "Usa la versión plana (2D) del mismo gráfico: siempre se lee mejor"],
                ["Colores sin significado", "Un color distinto por cada barra sin ningún criterio hace pensar que hay una categoría oculta", "Usa un solo color salvo que el color represente algo real (una serie, un rango)"],
                ["Líneas para categorías sin orden", "Sugiere una tendencia o conexión entre categorías que en realidad no tienen un orden natural", "Usa barras: las líneas implican secuencia, las barras no"],
                ["Demasiadas series en un mismo gráfico", "Más de 5-6 líneas o barras agrupadas se vuelven un plato de espagueti ilegible", "Agrupa lo secundario, o usa «small multiples» (ver la sección siguiente)"],
              ]}
            />

            <h2 id="muchos-datos">Muchos datos: agregación, top N, small multiples</h2>
            <p>Cuando tu tabla tiene cientos o miles de filas, graficarlas todas rara vez comunica algo. 3 técnicas simples resuelven la mayoría de los casos:</p>
            <ul>
              <li>
                <strong>Agregación:</strong> suma, promedia o cuenta antes de graficar (por eso esta herramienta te pide elegir una agregación). Graficar 10,000 filas individuales casi nunca es la respuesta; graficar sus totales por categoría o por mes, sí.
              </li>
              <li>
                <strong>Top N:</strong> si tienes 40 categorías, muestra las 10 principales y agrupa el resto en «Otros», en vez de 40 barras diminutas.
              </li>
              <li>
                <strong>Small multiples:</strong> en vez de 1 gráfico con 10 líneas encimadas, usa 10 gráficos pequeños idénticos, uno por serie, en una cuadrícula. Es más fácil de leer que cualquier gráfico único sobrecargado.
              </li>
            </ul>

            <h2 id="titulos-que-comunican">Títulos que comunican el hallazgo</h2>
            <p>Un título como «Ventas por tienda» describe los ejes, pero no dice nada que no puedas leer tú mismo en el gráfico. Un buen título adelanta la conclusión, para que quien lo vea de reojo ya se lleve el mensaje principal.</p>
            <Tabla
              resumen="Comparación entre un título descriptivo y uno que comunica el hallazgo"
              columnas={["Título débil (describe los ejes)", "Título que comunica el hallazgo"]}
              filas={[
                ["Ventas por tienda", "La tienda Norte creció cada mes desde marzo"],
                ["Calificación por canal", "WhatsApp recibe la mejor calificación de los 3 canales"],
                ["Tiempo de respuesta y calificación", "A más minutos de espera, calificaciones más bajas"],
              ]}
            />
            <p>El prompt de esta herramienta le pide a tu IA justamente esto: un título que comunique el hallazgo, no una descripción de los ejes.</p>

            <h2 id="ejemplo">Ejemplo: una misma tabla en 4 gráficos</h2>
            <p>Tabla ficticia de una boutique con 3 tiendas (Norte, Sur, Centro) en Lima, Perú, con ventas y visitas de enero a marzo, repartidas en 3 categorías de producto.</p>
            <h3>1. Comparar: ¿qué tienda vendió más?</h3>
            <Tabla resumen="Ventas totales del trimestre por tienda, de mayor a menor" columnas={["Tienda", "Ventas del trimestre"]} primeraColumnaEnNegrita filas={porTienda.etiquetas.map((e, i) => [e, `S/ ${porTienda.series[0].valores[i].toLocaleString("es-PE")}`])} />
            <h3>2. Componer: ¿qué categoría pesa más?</h3>
            <Tabla resumen="Participación de cada categoría sobre el total de ventas" columnas={["Categoría", "Ventas del trimestre"]} primeraColumnaEnNegrita filas={porCategoria.etiquetas.map((e, i) => [e, `S/ ${porCategoria.series[0].valores[i].toLocaleString("es-PE")}`])} />
            <h3>3. Evolucionar y relacionar</h3>
            <p>El mismo archivo también responde «¿cómo evolucionó cada tienda mes a mes?» (líneas, una por tienda) y «¿las visitas se relacionan con las ventas?» (dispersión). Prueba los 4 con el botón «Llenar con datos de ejemplo» de esta herramienta: es el mismo archivo, sin volver a escribir nada.</p>

            <h2 id="correlacion-no-es-causalidad">Correlación visual no es causalidad</h2>
            <p>
              En el ejemplo de la boutique, las visitas y las ventas tienen una correlación de {correlacion}: un número cercano a 1 indica que, en los datos, más visitas casi siempre coinciden con más ventas. Pero esa correlación <strong>no prueba</strong> que las visitas por sí solas causen las ventas: el tamaño de cada tienda, su ubicación o la época del año también podrían explicar ambas cifras a la vez.
            </p>
            <p>Por eso el prompt de esta herramienta le pide a la IA describir solo patrones («los puntos con más visitas tienden a estar más arriba»), nunca afirmar una causa como cierta. Comprobar una causa real requiere un experimento o, al menos, descartar otras explicaciones posibles, no solo mirar un gráfico.</p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «me haga unos gráficos»:</p>
            <Tabla resumen="Bloques del prompt de convertir datos en gráficos y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca calcula los valores de ningún gráfico: solo propone columnas, tipo de gráfico y título. Eso hace que un error de la IA (una suma mal hecha, una categoría confundida) no pueda colarse en tus números: siempre los calcula esta página.</p>

            <h2 id="checklist">Checklist antes de compartir un gráfico</h2>
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
                <strong>No exporta en SVG.</strong> Chart.js, la librería que dibuja los gráficos, trabaja sobre un lienzo (canvas): solo se puede exportar en PNG.
              </li>
              <li>
                <strong>No sustituye a un analista de datos.</strong> Elige el tipo de gráfico y calcula los valores correctamente, pero la interpretación de fondo sigue siendo tuya.
              </li>
              <li>
                <strong>Procesa hasta 50,000 filas</strong> en tu navegador; archivos más grandes se recortan, con aviso.
              </li>
              <li>
                <strong>No detecta relaciones causales.</strong> Solo muestra patrones visuales: la causalidad se comprueba con otros métodos, no con un gráfico.
              </li>
              <li>
                <strong>No da asesoría legal ni tributaria.</strong> Si tienes dudas sobre esta herramienta, puedes <Link href="/contacto">escribirnos</Link>.
              </li>
              <li>
                <strong>Tu tabla, siempre en tu navegador.</strong> Nunca se envía a este sitio; revisa el detalle en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíba: puede sugerir una columna que no existe o un pastel con demasiadas categorías. Esta página detecta ambos casos y te avisa.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El lector de la respuesta, el cálculo de cada tipo de gráfico y el detector de pasteles sobrecargados se prueban automáticamente con datos ficticios. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_CONVERTIR_GRAFICOS.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {q.a}
                  {q.q.includes("se envían a algún servidor") && (
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
              <span>Todavía en construcción, sin enlace activo por ahora: {pendientes.map((h) => h.titulo).join("; ")}.</span>
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
            <p className="mt-3 text-muted-foreground">Las reglas de esta guía (qué gráfico usar, qué escalas engañan, cómo agregar muchos datos) son prácticas propias del sitio, verificadas con pruebas automáticas, no cifras de una fuente externa. Sí se apoya en un estándar técnico real para leer tu archivo sin subirlo a ningún servidor:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Tu archivo se lee con la{" "}
                <a className="text-brand underline underline-offset-2" href="https://developer.mozilla.org/es/docs/Web/API/File_API" target="_blank" rel="noopener noreferrer">
                  File API del navegador
                </a>{" "}
                (documentada por MDN Web Docs, consultada el 30 de septiembre de 2026): un estándar web que permite leer un archivo local sin enviarlo a ningún servidor.
              </li>
              <li>El coeficiente de correlación de Pearson usado en el ejemplo es una fórmula estadística estándar, calculada por esta página, no por la IA.</li>
              <li>No usamos el nombre de ningún negocio real como ejemplo: los 2 perfiles de esta guía son ficticios y de elaboración propia, con todas sus cifras recalculadas.</li>
              <li>El lector de la respuesta y el detector de cifras inventadas se prueban automáticamente, incluyendo casos donde la IA cita un monto que no está en la ficha.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
