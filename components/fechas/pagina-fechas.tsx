import Link from "next/link";
import { ArrowRight, CalendarRange, Clock, Grid3x3, ListTree, Lock, ShieldCheck } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorFechas } from "./generador-fechas";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_FECHAS } from "@/content/ejemplos/fechas";
import { masBarata, medianaPrecios, prepararFilas } from "@/lib/fechas/analisis";
import { generarCombinaciones, resumenCombinaciones } from "@/lib/fechas/calculo";
import { leerRespuestaFechas } from "@/lib/fechas/lector";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_FECHAS = [
  {
    q: "¿Esta página busca vuelos en tiempo real?",
    a: "No. Genera las combinaciones de fechas y te ayuda a obtener precios de fuentes reales (un buscador de vuelos o una IA con búsqueda web) y a compararlos. La página misma no tiene acceso a precios en tiempo real.",
  },
  {
    q: "¿Existe un día fijo más barato para volar?",
    a: "No hay una regla universal: depende de la ruta, la temporada y la demanda. Lo que puedes hacer es consultar varias fechas de tu período y ver qué patrón aparece en tu búsqueda concreta, con la pestaña «Patrones y costos».",
  },
  {
    q: "¿Por qué el precio cambia al volver a buscar?",
    a: "La disponibilidad de tarifas cambia constantemente: un asiento en una clase tarifaria barata se agota y el precio sube, o al revés. Por eso cada fila de la tabla trae su fecha y hora de consulta.",
  },
  {
    q: "¿La duración cuenta en noches o en días?",
    a: "En noches, entre la fecha de ida y la de vuelta. Si escribes «5», la página genera combinaciones donde la vuelta es exactamente 5 noches después de la ida.",
  },
  {
    q: "¿Puedo confiar en los precios que da una IA?",
    a: "Solo si cita la fuente y la fecha y hora de consulta de cada precio; el prompt se lo exige. La página marca como «no verificada» cualquier fila sin esos dos datos, y nunca los uses como definitivos: confírmalos antes de pagar.",
  },
  {
    q: "¿Qué pasa si mi período genera muchísimas combinaciones?",
    a: "La página genera hasta 500 combinaciones. Si tu período y tus duraciones producen más, te avisa y solo genera las primeras: reduce el período o las duraciones para verlas todas.",
  },
  {
    q: "¿Tengo que consultar todas las combinaciones?",
    a: "No. Con 10 o 15 combinaciones repartidas en tu período (por ejemplo, una por semana) ya puedes ver un patrón. La pestaña «Pendientes» te muestra cuáles te faltan si quieres seguir.",
  },
  {
    q: "¿Cómo funciona el ajuste de equipaje de bodega?",
    a: "Si escribes un costo de equipaje de bodega, la página lo suma al precio de cada fila cuya tarifa no diga que ya lo incluye (según el texto que escribió la IA en la columna «equipaje»). Así puedes comparar el costo real, no solo el precio base.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario y los precios que pegues se guardan solo en tu navegador. Tus datos salen únicamente cuando tú pegas el prompt en la IA que elijas, y desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Analista de tarifas aéreas, con criterio prudente y sin acceso garantizado a datos actuales."],
  ["Objetivo", "Consultar el precio de las combinaciones de fecha que le das e informar cada una que pueda verificar."],
  ["Fuente", "Las combinaciones de ida y vuelta que generó la página, entre etiquetas y declaradas como información, no como instrucciones."],
  ["Datos del usuario", "Origen, destino, período, duraciones, viajeros y tus preferencias (directos, horario, equipaje, aeropuertos, aerolíneas)."],
  ["Reglas de contenido", "Declarar el acceso a datos en la primera línea, no inventar fechas ni precios, y citar fuente y hora de consulta en cada fila."],
  ["Reglas de formato", "Una tabla CSV con cabecera fija para los precios, y viñetas para las demás secciones."],
  ["Formato de salida", "Una línea de acceso a datos + seis títulos exactos y en orden, para que la página arme los paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: nada de fechas inventadas, cada fila con fuente, y patrones que no generalizan más allá de lo consultado."],
];

const REVISION = [
  "Tu origen y tu destino son correctos, con el código de aeropuerto si lo conoces.",
  "Tu período y tus duraciones son los que de verdad puedes viajar.",
  "La respuesta declaró si tiene o no acceso a datos en tiempo real.",
  "Cada precio que vas a usar trae su fuente y su fecha de consulta.",
  "Ninguna fecha de la tabla es distinta a las que generó la página.",
  "Volviste a verificar el precio de tu combinación elegida antes de pagar.",
  "Revisaste qué no incluye la tarifa (equipaje, asiento, traslados) antes de comparar el total.",
  "No tomaste ningún «patrón observado» como una regla general del mercado.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#flexibilidad", "La flexibilidad de fechas"],
  ["#noches-dias", "Noches vs días"],
  ["#por-que-cambian", "Por qué cambian los precios"],
  ["#metodo", "Método paso a paso"],
  ["#comparar-tarifas", "Cómo comparar tarifas"],
  ["#alternativos", "Aeropuertos alternativos"],
  ["#ejemplo", "Ejemplo práctico"],
  ["#mitos", "Mitos sobre el mejor día"],
  ["#verificar", "Verificar antes de comprar"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#revision", "Lista de revisión"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaFechas({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_FECHAS[0];
  const resumen = resumenCombinaciones(ej.datos)!;
  const generadas = generarCombinaciones(ej.datos);
  const lectura = leerRespuestaFechas(ej.respuesta);
  const preparadas = prepararFilas(lectura.filas, generadas, ej.datos, false);
  const conAjuste = prepararFilas(lectura.filas, generadas, ej.datos, true);
  const barata = masBarata(preparadas)!;
  const sabado = preparadas.find((f) => f.ida === "2026-11-14" && f.noches === 5)!;
  const mediana = medianaPrecios(preparadas);
  const bajanAjuste = conAjuste.filter((f) => f.ida === "2026-11-04" || f.ida === "2026-11-11").sort((a, b) => a.precioComparado! - b.precioComparado!);

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Fechas más baratas para volar" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            De «quiero viajar en noviembre, 5 a 7 días» a una lista ordenada de combinaciones. Sin precios inventados: tú obtienes los datos de un buscador de vuelos o de una IA con búsqueda web, y esta página los compara.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [CalendarRange, "Gratis, sin registro"],
              [Grid3x3, "Mapa de calor de precios"],
              [ShieldCheck, "Sin precios inventados"],
              [Lock, "Tus datos se quedan en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof CalendarRange;
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Esta página no consulta precios en tiempo real ni reserva nada. Es una ayuda para comparar precios que tú obtienes; no es asesoría financiera. No fue revisada por una agencia de viajes.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Comparador de fechas más baratas para volar">
          <GeneradorFechas />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · precios ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            {resumen.total} combinaciones posibles, {lectura.filas.length} consultadas: la más barata cuesta {barata.moneda} {barata.precioComparado}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En una búsqueda ficticia de Lima a Cusco para noviembre (5 a 7 noches), la combinación más barata de las 18 consultadas fue el miércoles 11 al lunes 16 (5 noches), a {barata.moneda} {barata.precioComparado}. La misma duración saliendo el sábado 14 costó {sabado.moneda} {sabado.precioComparado} ({sabado.diferenciaVsMinima! > 0 ? `+${sabado.diferenciaVsMinima}` : sabado.diferenciaVsMinima} %).{" "}
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
            <p>
              «Busco vuelos baratos» casi nunca significa una sola fecha: significa un rango de días en los que puedes viajar. Comparar cada combinación a mano, una por una, es tedioso y fácil de hacer mal. Esta herramienta ordena ese trabajo en cuatro pasos.
            </p>
            <ol>
              <li>
                <strong>Escribes tu origen, destino y período,</strong> con las duraciones que te sirven (por ejemplo, 5, 6 o 7 noches). La página genera todas las combinaciones válidas y te dice cuántas son.
              </li>
              <li>
                <strong>Obtienes los precios:</strong> guiado, con la vista de calendario de un buscador de vuelos, o copiando un prompt para que una IA con búsqueda web los consulte por ti.
              </li>
              <li>
                <strong>Pegas o escribes los precios</strong> en la tabla. La página los ordena, resalta el más barato encontrado y calcula la diferencia frente a las demás opciones.
              </li>
              <li>
                <strong>Revisas el mapa de calor</strong> (día de ida × duración) y la lista de combinaciones que aún no tienen precio, para decidir qué consultar después.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>ningún precio sale de esta página ni de la IA sin decir de dónde viene.</strong> Si la IA no tiene acceso a datos actuales, debe decirlo en su primera línea en vez de inventar un número.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="flexibilidad">Cómo funciona la flexibilidad de fechas (y cuántas combinaciones hay realmente)</h2>
            <p>
              «Fechas flexibles» significa que, en vez de fijar un día de ida y uno de vuelta, defines un período y una o varias duraciones, y comparas todas las combinaciones posibles dentro de ese período. El número de combinaciones crece rápido:
            </p>
            <Tabla
              resumen="Cómo se calcula el número de combinaciones por duración, con el ejemplo de un período de 30 días"
              columnas={["Qué defines", "Fórmula", "Ejemplo (período de 30 días)"]}
              primeraColumnaEnNegrita
              filas={[
                ["Días del período", "Fecha final − fecha inicial", "1 al 30 de noviembre = 29 días de diferencia"],
                ["Combinaciones de una duración", "Días del período − duración + 1", "29 − 5 + 1 = 25 combinaciones de 5 noches"],
                ["Total con varias duraciones", "Suma de cada duración", "25 (5 noches) + 24 (6) + 23 (7) = 72 combinaciones"],
              ]}
            />
            <p>Por eso la herramienta no te pide que consultes todas: te dice cuántas hay y te deja elegir cuántas quieres comparar. Con un período muy largo o muchas duraciones, la página limita a 500 combinaciones y te avisa para que lo acotes.</p>

            <h2 id="noches-dias">Noches vs días: define bien la duración antes de buscar</h2>
            <p>
              «5 días» y «5 noches» no son lo mismo: un viaje de 5 noches ocupa 6 días de calendario (llegas un día y te vas 5 noches después). Esta herramienta trabaja siempre en <strong>noches</strong>, porque es como los buscadores de vuelos calculan la estadía. Si piensas en días de vacaciones, resta uno para obtener las noches.
            </p>

            <h2 id="por-que-cambian">Por qué cambian los precios entre días cercanos</h2>
            <p>Dos fechas separadas por un solo día pueden tener precios muy distintos. No es un error del buscador: son varios factores actuando a la vez.</p>
            <Tabla
              resumen="Factores que hacen variar el precio entre fechas cercanas"
              columnas={["Factor", "Qué pasa"]}
              primeraColumnaEnNegrita
              filas={[
                ["Demanda del día", "Los fines de semana y las salidas después del trabajo suelen tener más demanda, y eso sube el precio."],
                ["Clases tarifarias", "Cada vuelo tiene un número limitado de asientos en su tarifa más barata; cuando se agotan, el sistema muestra la siguiente clase, más cara."],
                ["Días festivos y temporada", "Fechas cercanas a un feriado o a temporada alta suelen costar más, aunque sea un solo día de diferencia."],
                ["Frecuencia de vuelos", "En rutas con pocos vuelos al día, cada asiento pesa más en el precio final."],
              ]}
            />
            <p>Ninguno de estos factores es fijo ni predecible con certeza: por eso la herramienta compara lo que tú consultes, en vez de prometerte una regla.</p>

            <h2 id="metodo">Método paso a paso con vista de calendario y gráfico de precios</h2>
            <p>La mayoría de los buscadores de vuelos grandes tienen una función para ver el precio de varios días a la vez, sin buscar uno por uno. No usamos el nombre de ningún buscador en particular porque estas funciones cambian de nombre y de lugar con el tiempo; busca algo parecido a esto en el que uses:</p>
            <ol>
              <li>Una opción de «fechas flexibles» al elegir el día de ida y de vuelta.</li>
              <li>Un calendario mensual que muestra un precio bajo cada día.</li>
              <li>Un gráfico o una gráfica de precios por semana o por mes.</li>
            </ol>
            <p>Con cualquiera de las tres, puedes leer varios precios de un vistazo y copiarlos a la tabla del paso 3, sin abrir una búsqueda distinta para cada combinación. El método A de la herramienta (pestaña «Guiado») te lleva por estos mismos pasos.</p>

            <h2 id="comparar-tarifas">Cómo comparar tarifas correctamente: equipaje, asiento, escalas, horarios y condiciones</h2>
            <p>El precio más bajo no siempre es el más barato de verdad. Antes de decidir, compara lo que cada tarifa incluye:</p>
            <Tabla
              resumen="Qué revisar de cada tarifa antes de comparar solo por precio"
              columnas={["Qué revisar", "Por qué importa"]}
              primeraColumnaEnNegrita
              filas={[
                ["Equipaje de bodega", "Una tarifa «básica» barata puede salir más cara que una «completa» si necesitas maleta."],
                ["Selección de asiento", "Algunas tarifas cobran aparte por elegir dónde te sientas, incluso para viajar con alguien."],
                ["Escalas y duración total", "Un vuelo con escala puede ser más barato pero sumar varias horas al viaje."],
                ["Horario", "Una salida de madrugada puede obligarte a gastar en un traslado adicional o perder una noche de alojamiento."],
                ["Condiciones de cambio o cancelación", "Si tu viaje es incierto, una tarifa flexible puede valer más que el ahorro inicial."],
              ]}
            />
            <p>
              La herramienta te deja sumar el costo de equipaje de bodega y de traslados al precio base (si la tarifa no los incluye ya), para comparar el costo real, no solo el número más pequeño.
            </p>

            <Anuncio posicion="medio" />

            <h2 id="alternativos">Aeropuertos alternativos y vuelos separados: ventajas y riesgos</h2>
            <Tabla
              resumen="Ventajas y riesgos de usar un aeropuerto alternativo o comprar los tramos por separado"
              columnas={["Opción", "Ventaja", "Riesgo"]}
              primeraColumnaEnNegrita
              filas={[
                ["Aeropuerto alternativo", "Puede ser más barato o tener más vuelos disponibles.", "El traslado hasta tu destino final puede comerse el ahorro."],
                ["Comprar tramos por separado", "A veces sale más barato que un boleto combinado.", "Si el primer vuelo se atrasa, la aerolínea del segundo tramo no tiene obligación de esperarte ni de reubicarte."],
              ]}
            />
            <p>Si escribes aeropuertos alternativos en el paso 1, la IA los tiene en cuenta al buscar, pero la decisión final (y el riesgo) es tuya.</p>

            <h2 id="ejemplo">Ejemplo práctico: Lima–Cusco, noviembre, 5 a 7 noches (datos ficticios)</h2>
            <p>Pareja ficticia (2 adultos) que puede viajar cualquier día de noviembre, entre 5 y 7 noches. De las {resumen.total} combinaciones posibles, consultaron 18, repartidas en las tres duraciones.</p>
            <h3>1. La más barata y su comparación</h3>
            <Tabla
              resumen="Las dos combinaciones destacadas del ejemplo: la más barata y la misma duración en sábado"
              columnas={["Ida", "Vuelta", "Noches", "Precio total", "Por persona", "Diferencia"]}
              primeraColumnaEnNegrita
              filas={[
                [barata.ida, barata.vuelta, String(barata.noches), `${barata.moneda} ${barata.precioComparado}`, `${barata.moneda} ${barata.precioPorPersona}`, "Más barata"],
                [sabado.ida, sabado.vuelta, String(sabado.noches), `${sabado.moneda} ${sabado.precioComparado}`, `${sabado.moneda} ${sabado.precioPorPersona}`, `+${sabado.diferenciaVsMinima} %`],
              ]}
            />
            <p>
              Mediana de los {lectura.filas.length} precios consultados: {barata.moneda} {mediana}. La combinación más barata queda muy por debajo de la mediana; la del sábado, muy por encima.
            </p>
            <h3>2. Lo que dice el patrón (de esta búsqueda, no una regla)</h3>
            <ul>
              <li>Las salidas de martes y miércoles fueron las más baratas en las tres duraciones consultadas.</li>
              <li>Las salidas de sábado costaron claramente más que la opción más barata de la misma duración.</li>
            </ul>
            <h3>3. El ajuste por equipaje de bodega cambia el orden</h3>
            <p>
              La pareja escribió {"S/ 80"} de costo de equipaje de bodega por persona. La combinación más barata ({barata.ida}) no incluía bodega en su tarifa; la del {bajanAjuste[1]?.ida} sí. Al sumar el ajuste:
            </p>
            <Tabla
              resumen="Precio antes y después de sumar el equipaje de bodega a las dos combinaciones más baratas"
              columnas={["Ida", "Precio base", "¿Incluye bodega?", "Precio ajustado"]}
              primeraColumnaEnNegrita
              filas={bajanAjuste.map((f) => {
                const base = preparadas.find((x) => x.ida === f.ida && x.noches === f.noches)!;
                return [f.ida, `${base.moneda} ${base.precioComparado}`, base.equipaje.toLowerCase().includes("bodega") && !base.equipaje.toLowerCase().includes("no incluid") ? "Sí" : "No", `${f.moneda} ${f.precioComparado}`];
              })}
            />
            <p>
              La opción que antes era la 2.ª más barata pasa a ser la 1.ª una vez que se cuenta el costo real de viajar con una maleta: su tarifa ya incluía la bodega, así que el ajuste no le suma nada.
            </p>

            <h2 id="mitos">Mitos sobre «el mejor día para comprar»</h2>
            <Tabla
              resumen="Mitos frecuentes sobre cuándo comprar o volar, y qué es cierto en su lugar"
              columnas={["Mito", "Qué es más preciso"]}
              primeraColumnaEnNegrita
              filas={[
                ["«Los martes a medianoche bajan los precios»", "No hay evidencia consistente de un momento fijo: la disponibilidad cambia todo el tiempo, no en un horario predecible."],
                ["«Siempre es más barato volar entre semana»", "Suele pasar, pero depende de la ruta y de la temporada; compáralo tú con tus propias fechas."],
                ["«Comprar con mucha anticipación siempre ahorra»", "A veces sí, pero algunas rutas bajan de precio cerca de la fecha si quedan asientos sin vender; no es una regla fija."],
                ["«Borrar las cookies baja el precio»", "No hay evidencia pública que sostenga esto de forma consistente; el precio depende del inventario de la aerolínea, no de tu navegador."],
              ]}
            />

            <h2 id="verificar">Verificar el precio final antes de pagar</h2>
            <ul>
              <li>Confirma el precio en la página de la aerolínea o del buscador justo antes de pagar: puede cambiar entre la consulta y la compra.</li>
              <li>Revisa que el precio final incluya lo que necesitas (equipaje, asiento) o súmalo tú antes de comparar.</li>
              <li>Verifica los requisitos de entrada a tu destino (pasaporte, visa) en una fuente oficial antes de reservar.</li>
              <li>
                Si vuelas dentro o desde Perú, conoce tus derechos como pasajero (cancelaciones, retrasos, equipaje) en la página oficial de{" "}
                <a href="https://indecopi.gob.pe/web/atencion-al-ciudadano/transporte-aereo" target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2">
                  Indecopi sobre transporte aéreo
                </a>{" "}
                (ver fuentes).
              </li>
            </ul>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «me busque vuelos baratos»:</p>
            <Tabla resumen="Bloques del prompt de fechas más baratas para volar y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca decide qué fechas evaluar: la página ya se las da, generadas en tu navegador. Y si no puede consultar un precio real, tiene que decirlo, no inventarlo.</p>

            <h2 id="revision">Lista de revisión antes de usar el resultado</h2>
            <ul className="not-prose my-4 space-y-2">
              {REVISION.map((x) => (
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
                <strong>No hay precios en tiempo real.</strong> Ni esta página ni la IA (sin búsqueda web) conocen el precio actual de ningún vuelo. Todo precio que veas viene de lo que tú o tu IA consultaron.
              </li>
              <li>
                <strong>No garantiza el precio más bajo del mercado.</strong> «Más barata encontrada en esta búsqueda» significa justamente eso: la más barata entre las combinaciones que se consultaron, no el mínimo posible.
              </li>
              <li>
                <strong>No reserva ni compra nada.</strong> Es una ayuda para comparar; la compra la haces tú en la aerolínea o el buscador que elijas.
              </li>
              <li>
                <strong>No es asesoría financiera.</strong> Decide según tu presupuesto y tus fechas reales, no solo por el precio más bajo.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíbe. La página marca fechas que no generó, filas sin fuente y cifras que no vienen de tus datos, pero la revisión final es tuya.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El generador de combinaciones, el lector de la tabla, el ajuste de precio, el mapa de calor y las verificaciones se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_FECHAS.map((q) => (
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
            <p className="mt-3 text-muted-foreground">Esta página oficial peruana se localizó el 26 de septiembre de 2026 con una búsqueda; su servidor no permitió abrirla automáticamente, por eso esta guía no cita ninguna cifra ni plazo de ella. Sirve para que verifiques tú tus derechos vigentes como pasajero:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://indecopi.gob.pe/web/atencion-al-ciudadano/transporte-aereo" target="_blank" rel="noopener noreferrer">
                  Indecopi: Transporte aéreo (atención al ciudadano)
                </a>
                : sobre los derechos del pasajero ante cancelaciones, retrasos y problemas de equipaje en Perú.
              </li>
            </ul>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Las fórmulas de combinaciones, el mapa de calor, el ajuste de equipaje y los mitos sobre «el mejor día para comprar» son criterio propio de esta herramienta, no un estándar de la industria ni un estudio.</li>
              <li>Esta herramienta no contiene precios reales de ninguna aerolínea ni de ningún buscador de vuelos.</li>
              <li>No usamos el nombre ni el logo de ningún buscador de vuelos: las funciones se describen de forma genérica porque cambian con el tiempo.</li>
              <li>Para otros países, consulta a la autoridad de protección al consumidor o de aviación civil correspondiente.</li>
              <li>Todos los ejemplos (rutas, precios, aerolíneas y fuentes) son ficticios y de elaboración propia; sus cifras se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
