import Link from "next/link";
import { ArrowRight, Clock, Compass, ListTree, Lock, ShieldCheck, Wallet } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorDestinos } from "./generador-destinos";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_DESTINOS } from "@/content/ejemplos/destinos";
import { filasResumen, nochesSimuladas, repartoPresupuesto } from "@/lib/destinos/calculo";
import { leerRespuestaDestinos } from "@/lib/destinos/lector";
import { formatoMonto } from "@/lib/presupuesto/calculo";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_DESTINOS = [
  {
    q: "¿La página conoce los precios de vuelos y hoteles?",
    a: "No. Reparte tu presupuesto en tu navegador y te guía para obtener precios de una fuente real (un buscador de vuelos o una IA con búsqueda web); luego compara lo que tú consigas. La página misma no tiene acceso a precios en tiempo real.",
  },
  {
    q: "¿Cuánto dejo para comida y transporte en el destino?",
    a: "Defines un gasto diario por persona en el paso 1; la página lo reserva (gasto diario × viajeros × días) antes de calcular cuánto queda para pasajes y alojamiento. Es tu propia estimación, no un estándar.",
  },
  {
    q: "¿Por qué no me sale ningún destino viable?",
    a: "Prueba con menos noches en el simulador, un alojamiento más económico, un gasto diario menor o un presupuesto mayor. La página te avisa cuando ningún destino entra con los datos actuales.",
  },
  {
    q: "¿Incluye impuestos y tasas?",
    a: "Solo si los incluyes en los precios que introduces (o que tu IA consulta). La sección «Gastos que podrían encarecer» te recuerda los que suelen faltar.",
  },
  {
    q: "¿Sirve para viajes nacionales e internacionales?",
    a: "Sí. Para internacionales, define el alcance en el paso 1 y revisa los requisitos de entrada (pasaporte, visa) de cada país en una fuente oficial antes de reservar.",
  },
  {
    q: "¿Por qué la página recalcula el total en vez de usar el de la IA?",
    a: "Porque una IA puede sumar mal, aunque el prompt se lo prohíba. La página recalcula pasaje × viajeros + alojamiento × noches con la fórmula visible, y avisa si el total de la IA no coincide.",
  },
  {
    q: "¿Qué significa que un destino esté marcado «sin dato»?",
    a: "Que la IA no pudo consultar su precio (por ejemplo, sin acceso a datos actualizados). La página no calcula un costo total para esa fila hasta que tenga un precio real o una estimación.",
  },
  {
    q: "¿Cuántos destinos puedo comparar a la vez?",
    a: "Hasta 8 por respuesta. Con 3 o 4 ya puedes comparar si entran en tu presupuesto.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario y los destinos que pegues se guardan solo en tu navegador. Tus datos salen únicamente cuando tú pegas el prompt en la IA que elijas, y desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Asesor de viajes con presupuesto limitado, con criterio prudente y sin acceso garantizado a precios actualizados."],
  ["Objetivo", "Proponer hasta 8 destinos candidatos y consultar, si puede, el precio del pasaje y del alojamiento de cada uno."],
  ["Fuente", "El reparto de presupuesto que ya calculó la página, entre etiquetas y declarado como información, no como instrucciones."],
  ["Datos del usuario", "Presupuesto, origen, viajeros, período, rango de noches, alojamiento y preferencias."],
  ["Reglas de contenido", "Declarar el acceso a precios en la primera línea, marcar cada fila como real, estimación o sin dato, y no calcular el total (la página lo hace)."],
  ["Reglas de formato", "Una tabla CSV con cabecera fija para los destinos, y viñetas para las demás secciones."],
  ["Formato de salida", "Una línea de acceso a precios + 5 títulos exactos y en orden, para que la página arme los paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: nada de precios en filas «sin dato», cada fila «real» con fuente, y como máximo 8 destinos."],
];

const CHECKLIST = [
  "Escribiste tu gasto diario real, no uno optimista que nunca vas a cumplir.",
  "Definiste un rango de noches que de verdad puedes tomarte.",
  "Revisaste si el destino elegido está marcado «real», «estimación» o «sin dato», y le diste el peso correspondiente.",
  "Comparaste el destino que ganó por precio con el que ganó por margen (noches máximas viables).",
  "Sumaste los gastos que podrían encarecer el viaje antes de decidir, no después.",
  "Verificaste el precio final directamente con la aerolínea o el alojamiento, no solo con el de la respuesta.",
  "Si el viaje es internacional, revisaste los requisitos de entrada del país elegido.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#reparto", "Cómo repartir tu presupuesto"],
  ["#costo-total", "Por qué un destino barato sale caro"],
  ["#duracion", "Costos fijos vs. costos diarios"],
  ["#flexibilidad", "Flexibilidad de fechas y destino"],
  ["#metodo", "Métodos para descubrir destinos"],
  ["#ejemplo", "Ejemplo completo"],
  ["#gastos", "Gastos que debes reservar"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#checklist", "Checklist antes de reservar"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaDestinos({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código y de los mismos datos que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_DESTINOS[0];
  const noches = nochesSimuladas(ej.datos)!;
  const reparto = repartoPresupuesto(ej.datos, noches)!;
  const candidatos = filasResumen(leerRespuestaDestinos(ej.respuesta).filas, ej.datos);
  const arequipa = candidatos.find((c) => c.fila.destino === "Arequipa")!;

  const escapada = EJEMPLOS_DESTINOS[2];
  const nochesEscapada = nochesSimuladas(escapada.datos)!;
  const escapadaDosNoches = filasResumen(leerRespuestaDestinos(escapada.respuesta).filas, { ...escapada.datos, nochesSimuladas: "2" });
  const icaDosNoches = escapadaDosNoches.find((c) => c.fila.destino === "Ica")!;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "¿A dónde viajar con tu presupuesto?" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">Pasajes y alojamiento por separado, días viables por destino y dinero restante para comer, moverte y disfrutar. Con precios reales que tú obtienes; nunca inventados.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Wallet, "Gratis, sin registro"],
              [Compass, "Hasta 8 destinos"],
              [ShieldCheck, "Sin precios inventados"],
              [Lock, "Tus datos se quedan en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof Wallet;
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Esta página no consulta precios en tiempo real ni reserva nada. Es una ayuda para comparar destinos con el presupuesto que tú defines; no es asesoría financiera. No fue revisada por una agencia de viajes.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Descubridor de destinos según tu presupuesto">
          <GeneradorDestinos />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · precios ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Con S/ 2.500 para 2 personas y 5 noches, quedan S/ {formatoMonto(reparto.maximoPasajesYAlojamiento)} para pasajes y alojamiento
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En una búsqueda ficticia desde Lima, de 3 destinos candidatos, Arequipa dejó el mayor margen (S/ 560 de sobra) y Máncora no entró en el presupuesto pese a tener el pasaje más barato de los tres.{" "}
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
            <p>«¿A dónde puedo viajar con lo que tengo?» es una pregunta distinta de «¿cuánto cuesta viajar a X?». Esta herramienta invierte el orden: parte de tu presupuesto y te ayuda a encontrar qué destinos entran en él, en tres pasos.</p>
            <ol>
              <li>
                <strong>Repartes tu presupuesto:</strong> escribes cuánto tienes, cuántos viajeros son, tu gasto diario estimado y un rango de noches. La página calcula, en tu navegador, cuánto queda disponible para pasajes y alojamiento.
              </li>
              <li>
                <strong>Obtienes destinos candidatos:</strong> explorando tú mismo con la función de «cualquier destino» de un buscador de vuelos, o copiando un prompt para que una IA con búsqueda web te proponga hasta 8.
              </li>
              <li>
                <strong>Pegas o escribes los destinos</strong> con su pasaje y su alojamiento. La página recalcula el costo total de cada uno, marca cuáles entran en tu presupuesto y cuántas noches más podrías quedarte en cada uno.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la página nunca confía en el total que calcule la IA.</strong> Recalcula pasaje × viajeros + alojamiento × noches con su propia fórmula, y avisa si no coinciden.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="reparto">Cómo repartir un presupuesto de viaje: referencias y cómo ajustarlas a ti</h2>
            <p>Antes de mirar un solo destino, esta herramienta aparta tres cosas de tu presupuesto total:</p>
            <Tabla
              resumen="Cómo se reparte el presupuesto antes de comparar destinos"
              columnas={["Qué se aparta", "Fórmula", "Ejemplo (S/ 2.500, 2 personas, 5 noches, S/ 70 diarios, 10 % imprevistos)"]}
              primeraColumnaEnNegrita
              filas={[
                ["Gastos en el destino", "Gasto diario × viajeros × (noches + 1 día de llegada)", `${formatoMonto(70 * 2 * 6)} = S/ 70 × 2 × 6 días`],
                ["Imprevistos", "Presupuesto total × % de imprevistos", "S/ 250 = 10 % de S/ 2.500"],
                ["Máximo para pasajes y alojamiento", "Presupuesto − gastos en el destino − imprevistos", `S/ ${formatoMonto(reparto.maximoPasajesYAlojamiento)}`],
              ]}
            />
            <p>No hay un gasto diario «correcto»: depende de tu estilo de viaje. Si no sabes por dónde empezar, calcula lo que gastas en un día normal en comida y transporte, y ajústalo a la baja o al alza según qué tan austero quieras ser en el destino.</p>

            <h2 id="costo-total">Por qué un destino «barato» puede salir caro (costo total vs. precio del vuelo)</h2>
            <p>
              El pasaje más barato no siempre gana. Un destino con vuelo económico pero alojamiento caro (o al revés) puede costar más en total que uno con ambos precios moderados. Por eso la página nunca ordena los destinos solo por el precio del pasaje: calcula el costo total (pasaje × viajeros + alojamiento × noches) de cada uno antes de comparar.
            </p>
            <p>Esto es exactamente lo que le pasa al «Destino B» del ejemplo de esta guía: tiene el pasaje más barato de los tres candidatos, y aun así es el único que no entra en el presupuesto (revisa la tabla completa más abajo).</p>

            <h2 id="duracion">Cómo influye la duración: costos fijos vs. costos diarios</h2>
            <p>El pasaje es un costo fijo: cuesta lo mismo si te quedas 3 noches o 10. El alojamiento y el gasto diario son costos que crecen con cada noche. Esto tiene una consecuencia práctica: alargar el viaje no sube el costo total en la misma proporción para todos los destinos.</p>
            <Tabla
              resumen="Cómo cambia el reparto del presupuesto según las noches, con el ejemplo de la guía"
              columnas={["Noches", "Gastos en el destino", "Máximo para pasajes y alojamiento"]}
              primeraColumnaEnNegrita
              filas={[5, 6, 7].map((n) => {
                const r = repartoPresupuesto(ej.datos, n)!;
                return [String(n), `S/ ${formatoMonto(r.reservaGastos)}`, `S/ ${formatoMonto(r.maximoPasajesYAlojamiento)}`];
              })}
            />
            <p>Por eso la herramienta trae un simulador: cambia las noches en el paso 1 y mira cómo se mueve el máximo disponible, sin tener que rehacer ninguna cuenta a mano.</p>

            <Anuncio posicion="medio" />

            <h2 id="flexibilidad">Flexibilidad de fechas y de destino: cómo usarla</h2>
            <p>Cuantas más variables dejes abiertas (fechas exactas, destino, tipo de alojamiento), más candidatos puede evaluar la IA o tú mismo. Si tu presupuesto es ajustado, la flexibilidad de destino suele rendir más que la flexibilidad de fecha: un destino con vuelos y alojamiento más baratos por naturaleza pesa más que mover el viaje unos días.</p>
            <ul>
              <li>Si tu fecha es fija, dilo en el paso 1 y compara solo destinos, no fechas.</li>
              <li>Si tu destino es fijo pero tu fecha no, usa la herramienta de{" "}
                <Link href="/viajes-y-entretenimiento/encontrar-fechas-mas-baratas-para-volar" className="font-medium text-brand underline underline-offset-2">
                  fechas más baratas para volar
                </Link>{" "}
                en vez de esta.
              </li>
              <li>Si ambas son flexibles, esta herramienta es la más útil: deja que el presupuesto decida el destino.</li>
            </ul>

            <h2 id="metodo">Métodos para descubrir destinos: mapas de precios y búsquedas «a cualquier lugar»</h2>
            <p>La mayoría de los buscadores de vuelos grandes tienen una función para explorar destinos sin fijar uno primero. No usamos el nombre de ningún buscador en particular porque estas funciones cambian de nombre y de lugar con el tiempo; busca algo parecido a esto en el que uses:</p>
            <ol>
              <li>Una opción de «explorar», «a cualquier lugar» o un mapa de precios al elegir el destino.</li>
              <li>Un filtro de fechas o de duración aproximada.</li>
              <li>Una lista o un mapa con el precio más barato del mes hacia cada destino.</li>
            </ol>
            <p>Con cualquiera de las dos, puedes anotar varios pasajes de un vistazo y completar el alojamiento por separado. El método A de la herramienta (pestaña «Guiado») te lleva por estos mismos pasos.</p>

            <h2 id="ejemplo">Ejemplo completo: S/ 2.500 para 2 personas y 5 a 7 noches (datos ficticios)</h2>
            <p>Pareja ficticia que sale desde Lima, con S/ 2.500, gasto diario de S/ 70 por persona y 10 % de imprevistos. Con 5 noches, quedan S/ {formatoMonto(reparto.maximoPasajesYAlojamiento)} para pasajes y alojamiento.</p>
            <h3>1. Tres destinos candidatos, dos resultados distintos</h3>
            <Tabla
              resumen="Los 3 destinos candidatos del ejemplo, con su costo total recalculado a 5 noches"
              columnas={["Destino", "Pasaje pp", "Alojamiento/noche", "Costo total (5 noches)", "Restante", "Noches máx. viables"]}
              primeraColumnaEnNegrita
              filas={candidatos.map((c) => [c.fila.destino, `S/ ${formatoMonto(c.fila.pasajePorPersona!)}`, `S/ ${formatoMonto(c.fila.alojamientoPorNoche!)}`, `S/ ${formatoMonto(c.recalculo.total!)}`, `S/ ${formatoMonto(c.recalculo.restante!)}`, c.recalculo.viable ? "viable" : "no entra"])}
            />
            <p>
              Cusco entra en el presupuesto con margen. Máncora, con el pasaje más barato de los tres, no entra: su alojamiento más caro hace que el costo total supere el máximo disponible. Arequipa es el que más margen deja: hasta S/ {formatoMonto(arequipa.recalculo.restante!)}, suficiente incluso para {arequipa.nochesMaximas} noches sin ajustar nada más.
            </p>
            <h3>2. Cuando ningún destino entra: reduce noches, no sueños</h3>
            <p>
              En una escapada ficticia con S/ 800 para 2 personas, Paracas e Ica no entran a {nochesEscapada} noches. Pero al simular con 2 noches en vez de {nochesEscapada}, Ica pasa a ser viable {icaDosNoches.recalculo.restante === 0 ? "exactamente en el límite (restante S/ 0)" : `con S/ ${formatoMonto(icaDosNoches.recalculo.restante!)} de margen`}. Esto es lo que hace el simulador del paso 1: cambia las noches y mira si algún destino entra sin tocar el resto de tus datos.
            </p>

            <h2 id="gastos">Gastos que debes reservar antes de viajar</h2>
            <ul>
              <li><strong>Traslados</strong> entre el aeropuerto o terminal y el alojamiento, en el origen y en el destino.</li>
              <li><strong>Tasas turísticas o de ingreso</strong>, frecuentes en algunos destinos y no siempre incluidas en el pasaje.</li>
              <li><strong>Visado</strong>, si tu destino es internacional y tu nacionalidad lo requiere.</li>
              <li><strong>Transporte interno</strong> dentro del destino, si tu gasto diario no lo cubre.</li>
              <li>
                Si viajas con un menor de edad fuera del Perú, revisa si necesitas una autorización notarial o consular de viaje (ver fuentes).
              </li>
            </ul>
            <p>Ninguno de estos gastos lo calcula la herramienta por ti: la sección «Gastos que podrían encarecer» de tu respuesta los nombra, pero confírmalos siempre con una fuente oficial o el proveedor antes de reservar.</p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «me diga a dónde puedo viajar»:</p>
            <Tabla resumen="Bloques del prompt de descubrir destinos según presupuesto y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca calcula el total, el costo por persona ni el restante: la página lo hace con su propia fórmula, visible en el paso 1. La IA solo propone destinos y consulta precios; si no puede consultar uno, debe marcarlo «sin dato», no inventarlo.</p>

            <h2 id="checklist">Checklist antes de reservar</h2>
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
                <strong>No hay precios en tiempo real.</strong> Ni esta página ni la IA (sin búsqueda web) conocen el precio actual de ningún pasaje ni alojamiento. Todo precio que veas viene de lo que tú o tu IA consultaron.
              </li>
              <li>
                <strong>El gasto diario es tu propia estimación,</strong> no un estándar de ningún destino. Si lo subestimas, un destino puede parecer viable y no serlo en la práctica.
              </li>
              <li>
                <strong>No reserva ni compra nada.</strong> Es una ayuda para comparar; la compra la haces tú en la aerolínea, el alojamiento o la agencia que elijas.
              </li>
              <li>
                <strong>No es asesoría financiera.</strong> Decide según tu presupuesto real, no solo por el destino con más margen.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíbe. La página recalcula el total de cada destino y avisa si no coincide con el que escribió la IA, pero la revisión final es tuya.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El reparto del presupuesto, el recálculo de cada destino, la fórmula de noches máximas viables y el lector de la respuesta se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_DESTINOS.map((q) => (
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
            <p className="mt-3 text-muted-foreground">Esta página oficial peruana se localizó el 29 de septiembre de 2026 con una búsqueda; su servidor no permitió abrirla automáticamente, por eso esta guía no cita ningún plazo ni requisito exacto de ella. Sirve para que verifiques tú si necesitas una autorización de viaje para un menor de edad:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://www.gob.pe/148-autorizacion-de-viaje-para-menores-de-edad-autorizacion-notarial" target="_blank" rel="noopener noreferrer">
                  Gob.pe: Autorización de viaje para menores de edad
                </a>
                : trámite y requisitos oficiales para que un menor de edad salga del Perú.
              </li>
            </ul>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>El reparto del presupuesto, la fórmula de noches máximas viables y los tipos de dato (real, estimación, sin dato) son criterio propio de esta herramienta, no un estándar de la industria ni un estudio.</li>
              <li>Esta herramienta no contiene precios reales de ningún pasaje, alojamiento ni destino.</li>
              <li>No usamos el nombre ni el logo de ningún buscador de vuelos ni plataforma de alojamiento: las funciones se describen de forma genérica porque cambian con el tiempo.</li>
              <li>Para otros países, consulta a la autoridad de migraciones o de relaciones exteriores correspondiente.</li>
              <li>Todos los ejemplos (destinos, precios y fuentes) son ficticios y de elaboración propia; sus cifras se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
