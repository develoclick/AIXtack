import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, ListTree, Lock, MapPinned, ShieldCheck, Wallet } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorItinerario } from "./generador-itinerario";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_ITINERARIO } from "@/content/ejemplos/itinerario";
import { diasDelViaje } from "@/lib/itinerario/calculo";
import { leerRespuestaItinerario } from "@/lib/itinerario/lector";
import { RITMOS } from "@/lib/itinerario/tipos";
import { revisarItinerario } from "@/lib/itinerario/verificar";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_ITINERARIO = [
  {
    q: "¿La IA conoce los horarios actuales de los lugares?",
    a: "No siempre. Sin acceso a internet, no puede saberlo y marca los horarios como «por verificar». Si usas un asistente con búsqueda web activada, puede intentar confirmarlos, pero de todas formas revisa la página oficial de cada lugar antes de ir: los horarios cambian, sobre todo en temporada baja o por feriados.",
  },
  {
    q: "¿Cuántos lugares visito por día?",
    a: "Depende del ritmo que elijas: relajado (máximo 2 actividades principales por día), equilibrado (3) o intenso (4). Son límites de esta herramienta, no un estándar; puedes editar el itinerario si sientes que sobra o falta tiempo.",
  },
  {
    q: "¿Puedo exportarlo a mi calendario?",
    a: "Sí. En el paso 3, descarga el archivo .ics: lo importas en Google Calendar, Outlook o Apple Calendar y cada bloque queda como un evento, con su hora de inicio y de fin.",
  },
  {
    q: "¿Sirve para viajes con niños o con movilidad reducida?",
    a: "Sí. Indica las edades, si alguien tiene movilidad reducida y tus restricciones (horarios de descanso, alergias) en el paso 1: la IA los tiene en cuenta al armar el plan. Aun así, revisa tú cada actividad antes de reservarla.",
  },
  {
    q: "¿Incluye el presupuesto del viaje?",
    a: "Solo si tú aportas un presupuesto aproximado o precios en tus lugares: entonces la respuesta lo comenta, sin inventar cifras nuevas. Para calcular el costo completo del viaje (vuelos, alojamiento, comidas), usa la herramienta de presupuesto de viaje.",
  },
  {
    q: "¿Qué pasa si el itinerario no respeta una reserva que ya tengo?",
    a: "Escríbela en el paso 1, con su horario, en el lugar correspondiente. La página compara la hora que escribiste con la del bloque que trae la respuesta y te avisa si no coinciden.",
  },
  {
    q: "¿Puedo reordenar las actividades de un día?",
    a: "Sí, con las flechas de subir y bajar de cada bloque, en la pestaña «Itinerario por día». Reordenar no cambia los horarios de cada bloque: ajústalos tú si hace falta después de mover algo.",
  },
  {
    q: "¿Cómo comparto el itinerario con quien viaja conmigo?",
    a: "Cada día tiene un botón para compartir por WhatsApp, con el resumen del día ya armado. También puedes exportar el CSV o imprimir el itinerario completo en PDF.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario se guarda solo en tu navegador y los cálculos se hacen en tu equipo. Tus datos salen únicamente cuando tú pegas el prompt en la IA que elijas: desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Planificador de viajes experto en logística de itinerarios, con criterio prudente y sin acceso a internet en tiempo real."],
  ["Objetivo", "Un itinerario física y temporalmente posible: agrupado por zona, dentro del máximo de actividades de tu ritmo y con un plan B por día."],
  ["Fuente", "Los lugares que aportaste, con su prioridad, su horario conocido y su reserva, entre etiquetas y declarados como información, no como instrucciones."],
  ["Datos del usuario", "Destino, fechas, horas de llegada y salida, viajeros, ritmo (con su máximo diario ya calculado), transporte disponible y restricciones."],
  ["Reglas de contenido", "No inventar lugares, horarios ni precios; respetar exactamente tus reservas; carga reducida en llegada y salida; agrupar por zona."],
  ["Reglas de formato", "Una tabla CSV con cabecera fija para la línea de tiempo, y viñetas por día para el porqué del orden y los planes B."],
  ["Formato de salida", "Seis títulos exactos y en orden, para que la página separe la respuesta en paneles y en la línea de tiempo."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: nada de días sobrecargados, horarios cruzados ni lugares inventados."],
];

const REVISION = [
  "Tu destino y tus fechas son las que de verdad vas a viajar.",
  "Las horas de llegada y de salida coinciden con tu vuelo o tu transporte real.",
  "Cada reserva que ya tenías aparece en el itinerario con la misma hora.",
  "Ningún día supera el máximo de actividades de tu ritmo (revisa los avisos de la página).",
  "No hay dos bloques del mismo día con horarios que se crucen.",
  "Los lugares del itinerario son los que tú escribiste, no otros que la IA haya agregado.",
  "Verificaste en la fuente oficial de cada lugar su horario y su día de cierre.",
  "Revisaste los requisitos de entrada a tu destino en una fuente oficial.",
  "Exportaste el itinerario a tu calendario o lo imprimiste antes de viajar.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#zonas", "La regla de las zonas"],
  ["#cuantas-actividades", "Cuántas actividades caben en un día"],
  ["#traslados", "Tiempos de desplazamiento"],
  ["#imprescindibles-opcionales", "Imprescindibles vs opcionales"],
  ["#llegada-salida", "Días de llegada y salida"],
  ["#plan-b", "Margen para imprevistos y plan B"],
  ["#adaptar", "Adaptar el itinerario"],
  ["#ejemplo", "Ejemplo completo"],
  ["#verificar-horarios", "Verificar horarios y reservas"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#revision", "Lista de revisión"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaItinerario({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_ITINERARIO[0];
  const dias = diasDelViaje(ej.datos)!;
  const lectura = leerRespuestaItinerario(ej.respuesta);
  const revision = revisarItinerario(lectura, ej.datos);
  const dia1 = lectura.itinerario.filter((f) => f.dia === 1);
  const dia2 = lectura.itinerario.filter((f) => f.dia === 2);

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Crear un itinerario de viaje" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Actividades agrupadas por zona, tiempos de traslado, comidas y descansos, con alternativas por si algo falla. Escribe tu destino, tus fechas y tus horarios; la IA arma un itinerario día por día que respeta exactamente tus reservas, y la página comprueba que ningún día se sobrecargue.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [MapPinned, "Gratis, sin registro"],
              [CalendarDays, "Exporta a tu calendario (.ics)"],
              [Wallet, "Sin precios inventados"],
              [Lock, "Tus datos se quedan en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof MapPinned;
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Es una ayuda para organizar tu viaje, no una garantía de horarios, disponibilidad ni asesoría legal sobre requisitos de entrada. Esta guía no fue revisada por una agencia de viajes.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Creador de itinerarios de viaje">
          <GeneradorItinerario />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · datos ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            {dias} días en Arequipa, {lectura.itinerario.length} bloques y {revision.avisos.length === 0 ? "ningún" : revision.avisos.length} aviso de la página
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En un itinerario ficticio para una pareja en Arequipa, el día 1 llega a las 11:00 y el tour al Cañón del Colca (ya reservado) ocupa por completo el día 2. La página comprobó los {lectura.itinerario.length} bloques, ninguno se cruza de horario y ningún día supera el máximo de 3 actividades del ritmo equilibrado.{" "}
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
            <p>Un itinerario armado con entusiasmo (tres ciudades en cinco días, museos que cierran cuando ya estás en la puerta) se rompe en el primer día. Esta herramienta va de tu viaje a un itinerario probable en cuatro pasos.</p>
            <ol>
              <li>
                <strong>Cuentas tu viaje:</strong> destino, fechas, horas de llegada y salida, viajeros, ritmo e intereses. La página calcula cuántos días tienes y cuántas actividades caben por día según tu ritmo.
              </li>
              <li>
                <strong>Agregas los lugares que ya tienes en mente</strong>, con su prioridad, su horario conocido y su reserva si ya la hiciste. Copias el prompt y lo pegas en ChatGPT, Gemini, Claude u otro asistente.
              </li>
              <li>
                <strong>Pegas la respuesta.</strong> La página arma la línea de tiempo de cada día, avisa si dos bloques se cruzan o si un día tiene más actividades de las que tu ritmo permite.
              </li>
              <li>
                <strong>Te lo llevas contigo:</strong> exporta a tu calendario, a una hoja de cálculo o a papel, abre la ruta del día en Google Maps o compártela por WhatsApp.
              </li>
            </ol>
            <p>
              Una regla atraviesa toda la herramienta: <strong>ni la página ni la IA conocen los horarios ni los precios actuales de ningún lugar.</strong> Lo que sí hace la página es comprobar la lógica del plan: que nada se cruce, que nada se pase del máximo y que las reservas que ya tenías se respeten.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="zonas">Cómo distribuir actividades: la regla de las zonas</h2>
            <p>
              Cada traslado consume tiempo que no está en ningún itinerario: caminar hasta el paradero, esperar el taxi, cruzar la ciudad. La forma más simple de reducirlo es agrupar las actividades de un mismo día por una sola zona (o el mínimo de zonas posible), en vez de saltar de un extremo de la ciudad al otro y volver.
            </p>
            <Tabla
              resumen="Cómo aplicar la regla de las zonas, con un ejemplo y el motivo"
              columnas={["Qué hacer", "Ejemplo", "Por qué"]}
              primeraColumnaEnNegrita
              filas={[
                ["Agrupa por cercanía, no por orden de interés", "El museo y el mirador que están a 5 cuadras, el mismo día", "Menos traslados, más tiempo dentro de cada lugar"],
                ["Deja una zona lejana para un día completo", "Un tour de día entero a un lugar fuera de la ciudad", "Evita mezclar un traslado largo con otras actividades"],
                ["Revisa el mapa antes de fijar el orden", "Ver en un mapa si dos lugares realmente están cerca", "Lo que parece cerca en una lista, en el mapa puede no estarlo"],
                ["Usa el enlace a Google Maps del día", "El botón «Ver ruta en Maps» de cada día", "Confirma el orden real antes de salir del alojamiento"],
              ]}
            />
            <p>El prompt le pide a la IA que indique la zona de cada día en la tabla; la página no verifica distancias reales (no tiene acceso a un mapa), así que el enlace a Google Maps de cada día es tu forma de comprobarlo antes de salir.</p>

            <h2 id="cuantas-actividades">Cuántas actividades caben en un día (según tu ritmo)</h2>
            <p>«Actividades principales» son los bloques imprescindibles y opcionales: no cuentan las comidas, los traslados ni el tiempo libre. Elegir un ritmo realista es la decisión que más cambia si tu itinerario se cumple o se queda en el papel.</p>
            <Tabla
              resumen="Los tres ritmos de la herramienta, su máximo de actividades por día y para quién sirve cada uno"
              columnas={["Ritmo", "Máximo por día", "Sirve para"]}
              primeraColumnaEnNegrita
              filas={RITMOS.map((r) => [r.etiqueta, String(r.maxPorDia), r.ayuda])}
            />
            <p>
              Es un límite de esta herramienta, no un estándar del turismo. Si tu grupo camina rápido y no le pesa un día lleno, el ritmo intenso puede quedarte corto; si viajas con niños pequeños o te cansas con la altura, el relajado suele rendir más de lo que parece.
            </p>

            <h2 id="traslados">Calcular tiempos de desplazamiento sin sorpresas</h2>
            <p>
              Esta herramienta no calcula distancias ni tiempos de traslado: no tiene acceso a un mapa ni a datos de tráfico en tiempo real. Lo que sí hace es pedirle a la IA que reserve un bloque de tipo «traslado» entre actividades lejanas y agrupe por zona para que haya menos.
            </p>
            <Tabla
              resumen="Cómo estimar el tiempo de traslado real y qué margen dejar"
              columnas={["Transporte", "Qué considerar", "Margen recomendado"]}
              primeraColumnaEnNegrita
              filas={[
                ["A pie", "El tiempo que marca un mapa suele ser optimista con calles empinadas o cruces.", "Agrega un 20–30 % al tiempo que veas en el mapa."],
                ["Transporte público", "Frecuencia, trasbordos y horas punta.", "Ten un plan B (taxi) si el bloque siguiente es una reserva con hora fija."],
                ["Auto o taxi", "Tráfico según la hora del día y la ciudad.", "En horas punta, duplica el tiempo estimado del mapa."],
              ]}
            />
            <p>
              Antes de fijar la hora de un bloque, abre el enlace a Google Maps del día (lo genera la página con los lugares que escribiste, en el orden de la tabla) y mira el tiempo real entre dos puntos consecutivos.
            </p>

            <h2 id="imprescindibles-opcionales">Imprescindibles vs opcionales: cómo decidir</h2>
            <p>Marcar cada lugar como imprescindible u opcional, antes de copiar el prompt, cambia lo que pasa cuando el día se complica: lo opcional es lo primero que se cae de un plan B, y lo imprescindible es lo que el itinerario protege.</p>
            <Tabla
              resumen="Cuándo marcar un lugar como imprescindible y cuándo como opcional"
              columnas={["Marca como imprescindible", "Marca como opcional"]}
              filas={[
                ["Tiene una reserva o una hora fija (tour, entrada con horario).", "Puedes visitarlo otro día o en otro viaje sin arrepentirte."],
                ["Es la razón principal del viaje o del destino.", "Depende de que sobre tiempo o energía."],
                ["Cuesta caro cancelarlo o reprogramarlo.", "Tiene una alternativa parecida cerca."],
              ]}
            />
            <p>Si todos tus lugares son «imprescindibles», el ritmo se vuelve rígido y cualquier imprevisto obliga a sacrificar algo importante. Deja al menos uno o dos como opcionales por día para tener margen real.</p>

            <h2 id="llegada-salida">Días de llegada y salida: qué sí y qué no programar</h2>
            <p>El prompt le pide a la IA que reduzca la carga del día de llegada y del de salida. No es solo cortesía: un vuelo que se retrasa, una fila de inmigración larga o un tráfico inesperado pueden arrastrar todo lo demás si el primer o el último día están al máximo.</p>
            <ul>
              <li>
                <strong>Día de llegada:</strong> traslado, check-in, y como máximo una actividad corta y cercana al alojamiento. Deja la cena para un lugar que no dependa de reserva.
              </li>
              <li>
                <strong>Día de salida:</strong> nada que dependa de terminar a una hora exacta cerca del vuelo. Calcula el traslado al aeropuerto o terminal con margen, no con el tiempo mínimo.
              </li>
              <li>
                <strong>Ambos:</strong> evita reservar actividades con cancelación difícil el primer o el último día, por si el vuelo cambia.
              </li>
            </ul>

            <Anuncio posicion="medio" />

            <h2 id="plan-b">Margen para imprevistos y plan B</h2>
            <p>Un itinerario sin margen se rompe con el primer imprevisto: lluvia, cansancio o un lugar cerrado sin aviso. El prompt le pide a la IA un plan B por día, y a ti te toca decidir cuándo usarlo.</p>
            <Tabla
              resumen="Imprevistos frecuentes, cómo se reflejan en el itinerario y qué hacer"
              columnas={["Imprevisto", "Qué revisar en tu itinerario", "Qué hacer"]}
              primeraColumnaEnNegrita
              filas={[
                ["Lluvia o mal clima", "Actividades al aire libre marcadas como imprescindibles ese día.", "Cambia por el plan B del día; prioriza interiores."],
                ["Cansancio o soroche", "Cuántas actividades principales quedan por hacer.", "Convierte una opcional en libre; no fuerces el ritmo."],
                ["Un lugar cerrado sin aviso", "Si tenías una reserva o un horario «por verificar» ahí.", "Usa el plan B del día o reordena con las flechas de la línea de tiempo."],
                ["Vuelo o bus con retraso", "Los bloques del día de llegada o de salida.", "Reduce el día a lo esencial: el traslado y una comida."],
              ]}
            />
            <p>Además del plan B por día, deja al menos un bloque de tiempo libre cada dos días: la página lo comprueba y te avisa si dos días seguidos no tienen ninguno.</p>

            <h2 id="adaptar">Adaptar el itinerario: familias, personas mayores, mochileros, viajes de trabajo</h2>
            <Tabla
              resumen="Cómo adaptar los campos de la herramienta según el tipo de viaje"
              columnas={["Tipo de viaje", "Qué cambiar en el paso 1"]}
              primeraColumnaEnNegrita
              filas={[
                ["Familias con niños", "Ritmo relajado, edades y necesidades en «viajeros», e intereses con actividades para niños."],
                ["Personas mayores o con movilidad reducida", "Marca «movilidad reducida»: el itinerario evitará dar por hecho caminatas largas o muchas escaleras."],
                ["Mochileros con poco presupuesto", "Escribe tu presupuesto aproximado y marca transporte «a pie» y «transporte público»."],
                ["Viajes de trabajo", "Escribe tus horarios fijos (reuniones, videollamadas) en «restricciones» para que no se programe nada encima."],
              ]}
            />
            <p>En los tres ejemplos de esta página encontrarás una pareja en Arequipa, una familia con niños en Cusco y un viaje de trabajo de dos días en Lima: revisa el que más se parezca a tu caso.</p>

            <h2 id="ejemplo">Ejemplo completo: 4 días en Arequipa, explicados decisión por decisión</h2>
            <p>Pareja ficticia, sin niños, que llega a Arequipa a las 11:00 del primer día y ya tiene reservado un tour al Cañón del Colca. Ritmo equilibrado (máximo 3 actividades principales por día).</p>
            <h3>1. Lo que escribieron en el paso 1</h3>
            <ul>
              <li>Destino: Arequipa, Perú · 10 al 13 de noviembre de 2026 (4 días) · llegada 11:00, salida 14:00.</li>
              <li>Alojamiento en el Centro Histórico, a media cuadra de la Plaza de Armas.</li>
              <li>2 adultos; uno prefiere evitar caminatas muy largas.</li>
              <li>6 lugares: Plaza de Armas y Monasterio de Santa Catalina (imprescindibles), Mirador de Yanahuara, Museo Santuarios Andinos y Mercado San Camilo (opcionales), y el tour al Cañón del Colca (imprescindible, con reserva confirmada para el 11 de noviembre a las 04:00).</li>
            </ul>
            <h3>2. Por qué el día 2 no tiene nada más</h3>
            <p>El tour al Cañón del Colca sale a las 04:00 y regresa cerca de las 18:00: ocupa el día completo. El prompt le pide a la IA que respete exactamente esa hora, y la página comprueba que el bloque del tour empiece a las 04:00, tal como quedó la reserva.</p>
            <Tabla
              resumen="Línea de tiempo del día 2: el tour al Cañón del Colca"
              columnas={["Hora", "Actividad", "Tipo"]}
              primeraColumnaEnNegrita
              filas={dia2.map((f) => [`${f.horaInicio}–${f.horaFin}`, f.actividad, f.tipo ?? f.tipoTexto])}
            />
            <h3>3. Lo que revisa la página</h3>
            <p>
              De los {lectura.itinerario.length} bloques del itinerario completo, la página no encontró horarios cruzados ni días con más de 3 actividades principales; los 6 lugares priorizados son los mismos que la pareja escribió, y la hora del tour coincide con su reserva. Quedaron {revision.sinVerificar} bloques marcados «por verificar»: el horario del Monasterio de Santa Catalina, del Museo Santuarios Andinos y del mercado.
            </p>
            <h3>4. El día 1, para comparar la carga</h3>
            <Tabla
              resumen="Línea de tiempo del día 1: llegada con carga reducida"
              columnas={["Hora", "Actividad", "Tipo"]}
              primeraColumnaEnNegrita
              filas={dia1.map((f) => [`${f.horaInicio}–${f.horaFin}`, f.actividad, f.tipo ?? f.tipoTexto])}
            />
            <p>Solo 2 actividades principales (Plaza de Armas y Monasterio), por debajo del máximo de 3: carga reducida por la llegada a las 11:00, tal como pide la regla del día de llegada.</p>

            <h2 id="verificar-horarios">Cómo verificar horarios y reservas</h2>
            <p>Ningún itinerario generado por IA reemplaza la verificación en la fuente. Antes de imprimir el tuyo o de exportarlo a tu calendario, revisa lo siguiente:</p>
            <ul>
              <li>
                <strong>Horario y día de cierre</strong> de cada lugar marcado «por verificar», en su página oficial o en la del punto de información turística de tu destino.
              </li>
              <li>
                <strong>Reservas y tours</strong>, directamente con la agencia o el lugar, un día o dos antes.
              </li>
              <li>
                <strong>Requisitos de entrada</strong> a tu destino (pasaporte, visa, tiempo de permanencia permitido) según tu nacionalidad, en la fuente oficial del país que visitas.
              </li>
            </ul>
            <p>Localizamos una página oficial peruana sobre requisitos de ingreso para turistas extranjeros (ver fuentes); su servidor no permitió abrirla automáticamente, así que esta guía no cita ninguna cifra de ella: verifica tú los requisitos vigentes en esa fuente antes de viajar.</p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «me arme un itinerario»:</p>
            <Tabla resumen="Bloques del prompt del itinerario de viaje y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA no decide qué lugares visitar si tú ya los escribiste: solo los ordena y los agrupa. Y todo lo que no pueda confirmar (horarios, tiempos de traslado, precios) debe marcarlo, nunca presentarlo como un hecho.</p>

            <h2 id="revision">Lista de revisión antes de usar el itinerario</h2>
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
                <strong>No hay horarios ni precios reales.</strong> Ni la página ni la IA (salvo que tú uses una con búsqueda web) conocen el horario actual de ningún lugar. Trata cada horario como un punto de partida, no como un hecho confirmado.
              </li>
              <li>
                <strong>No calcula distancias ni tráfico.</strong> Usa el enlace a Google Maps de cada día para confirmar tiempos de traslado reales antes de salir.
              </li>
              <li>
                <strong>No es asesoría legal.</strong> Los requisitos de entrada, visa y tiempo de permanencia dependen de tu nacionalidad y del destino: verifícalos en fuentes oficiales. Esta guía no fue revisada por una agencia de viajes ni por un especialista en migraciones.
              </li>
              <li>
                <strong>No garantiza disponibilidad.</strong> Que un bloque tenga una hora no significa que el lugar tenga cupo: confirma cada reserva.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíbe. La página marca horarios cruzados, días sobrecargados, lugares que no escribiste y reservas que no coinciden, pero la revisión final es tuya.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El lector de la tabla, la detección de solapamientos y de días sobrecargados, el archivo del calendario y los enlaces a Maps y WhatsApp se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_ITINERARIO.map((q) => (
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
            <p className="mt-3 text-muted-foreground">Esta página oficial peruana se localizó el 26 de septiembre de 2026 con una búsqueda; su servidor no permitió abrirla automáticamente, por eso esta guía no cita cifras de ella. Sirve para que verifiques tú los requisitos vigentes:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://www.gob.pe/8175-requisitos-de-ingreso-al-peru-para-turistas-extranjeros" target="_blank" rel="noopener noreferrer">
                  Plataforma del Estado Peruano (gob.pe): Requisitos de ingreso al Perú para turistas extranjeros
                </a>
                : sobre pasaporte, visa y tiempo de permanencia permitido para turistas.
              </li>
            </ul>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Para otros destinos, consulta la autoridad migratoria y el ministerio de relaciones exteriores de tu país y del país que visitas.</li>
              <li>Los ritmos, sus máximos de actividades por día, la regla de las zonas y la regla del tiempo libre cada 2 días son criterio propio de esta herramienta, no un estándar del turismo.</li>
              <li>Esta herramienta no contiene horarios, distancias ni precios reales de ningún lugar.</li>
              <li>Todos los ejemplos (personas, lugares, tours y reservas) son ficticios y de elaboración propia; sus cifras se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
