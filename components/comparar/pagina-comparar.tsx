import Link from "next/link";
import { ArrowRight, Clock, ListTree, Lock, Scale, ShieldCheck, Trophy } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorComparar } from "./generador-comparar";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_COMPARAR } from "@/content/ejemplos/comparar";
import { filasResumen, ganadorDePerfil, masBarata, mejorPuntuada, PERFILES_PESO } from "@/lib/comparar/calculo";
import { CRITERIOS_PREDEFINIDOS, MAX_CRITERIOS } from "@/lib/comparar/tipos";
import { formatoMonto, parsearNumero } from "@/lib/presupuesto/calculo";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_COMPARAR = [
  {
    q: "¿Esta herramienta busca precios por mí?",
    a: "No. Tú escribes el precio y los datos de cada opción (de donde los hayas obtenido: una web, una llamada, un folleto). La página calcula el costo total ajustado y la puntuación, y la IA solo ayuda a valorar lo subjetivo y a detectar lo que falta por revisar.",
  },
  {
    q: "¿Cuántas opciones puedo comparar?",
    a: "De 2 a 5. Con más de 5, la matriz se vuelve difícil de leer de un vistazo; si tienes más candidatas, descarta primero las que claramente no te sirven.",
  },
  {
    q: "¿Qué es el costo total ajustado?",
    a: "El precio que escribiste, más los extras conocidos que le indicaste (equipaje, tasas, comisiones) y, si diste un valor a tu tiempo, las horas de trayecto convertidas en costo. Es una forma de comparar el costo real, no solo el número más pequeño.",
  },
  {
    q: "¿Por qué mis pesos no tienen que sumar exactamente 100?",
    a: "Para que puedas seguir editando sin que la página te bloquee. Si la suma es distinta de 100, la puntuación se calcula en proporción a esa suma: el resultado es el mismo que si repartieras exactamente 100 puntos.",
  },
  {
    q: "¿Qué significa que una celda diga «[VALORACIÓN]»?",
    a: "Que esa frase es una opinión de la IA (por ejemplo, «hotel muy cómodo»), no un dato que tú le diste. El prompt se lo exige para que puedas distinguir un hecho de una opinión.",
  },
  {
    q: "¿La opción más barata siempre gana?",
    a: "No necesariamente. La página calcula dos cosas por separado: la de menor costo total ajustado y la de mayor puntuación ponderada (según tus criterios). Pueden coincidir o no; si no coinciden, tus pesos le están dando más valor a otra cosa que al precio.",
  },
  {
    q: "¿Puedo comparar destinos completos, no solo hoteles?",
    a: "Sí. Elige «Destinos» como tipo de comparación en el paso 1: los mismos campos (precio, qué incluye, ubicación, condiciones) sirven igual para comparar dos ciudades o dos planes de viaje distintos.",
  },
  {
    q: "¿Sirve para paquetes todo incluido?",
    a: "Sí. Detalla en «Qué incluye» todo lo que trae el paquete y, en «Extras conocidos», lo que no incluye (tours, traslados, impuestos), para que el costo total ajustado refleje lo que de verdad vas a pagar.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario se guarda solo en tu navegador. Tus datos salen únicamente cuando tú pegas el prompt en la IA que elijas, y desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Asesor de viajes imparcial, sin preferencia por ninguna marca ni proveedor."],
  ["Objetivo", "Comparar tus opciones usando solo los datos que le diste, separando siempre dato de opinión."],
  ["Fuente", "Tus opciones y los cálculos que ya hizo la página, entre etiquetas y declaradas como información, no como instrucciones."],
  ["Datos del usuario", "Tipo de comparación, viajeros, fechas, tus criterios con sus pesos y el valor de tu tiempo."],
  ["Reglas de contenido", "Usar solo tus datos, marcar cada opinión con «[VALORACIÓN]» y citar el costo y la puntuación tal como los calculó la página, sin recalcularlos."],
  ["Reglas de formato", "Una tabla con «|» para los datos comparativos, y viñetas para las demás secciones."],
  ["Formato de salida", "Ocho títulos exactos y en orden, para que la página arme los paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: nada de precios inventados, cada opinión marcada, y las cifras citadas coinciden con las de la página."],
];

const CHECKLIST = [
  "Escribiste el precio y la moneda de cada opción, tal como los viste.",
  "Anotaste los extras conocidos (equipaje, tasas, comisiones) en cada opción, no solo en la más barata.",
  "Repartiste los pesos entre los criterios que de verdad te importan a ti, no los que «deberían» importar.",
  "Puntuaste cada opción en cada criterio con tu propio criterio, no copiando la valoración de la IA.",
  "Revisaste si la más barata y la mejor puntuada son la misma opción; si no lo son, entiendes por qué.",
  "Leíste los «Costos a verificar» antes de descartar la opción que los tiene.",
  "Confirmaste las condiciones de cancelación o cambio de la opción que vas a elegir.",
  "Volviste a verificar el precio final directamente con el proveedor antes de pagar.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#costo-total", "El precio no es el costo total"],
  ["#criterios", "Elegir tus criterios y pesos"],
  ["#datos-vs-valoraciones", "Datos vs. valoraciones"],
  ["#tiempo-vs-dinero", "Tiempo vs. dinero"],
  ["#revisar-alojamiento", "Qué revisar en un alojamiento"],
  ["#revisar-transporte", "Qué revisar en un transporte"],
  ["#costos-ocultos", "Costos ocultos comunes"],
  ["#ejemplo", "Ejemplo práctico"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#checklist", "Checklist antes de reservar"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaComparar({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_COMPARAR[0];
  const filas = filasResumen(ej.datos);
  const hotel = filas.find((f) => f.opcion.id === "hotel")!;
  const hostal = filas.find((f) => f.opcion.id === "hostal")!;
  const airbnb = filas.find((f) => f.opcion.id === "airbnb")!;
  const barata = masBarata(filas)!;
  const mejor = mejorPuntuada(filas)!;
  const ganadorPrecio = ganadorDePerfil(ej.datos, "precio")!;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Comparar opciones de viaje" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">Una matriz de decisión con tus criterios y pesos, el costo total real (no solo el precio inicial) y las preguntas que debes resolver antes de reservar.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Scale, "Gratis, sin registro"],
              [Trophy, "Matriz ponderada"],
              [ShieldCheck, "Sin precios inventados"],
              [Lock, "Tus datos se quedan en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof Scale;
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Esta página no busca precios ni reserva nada. Es una ayuda para comparar opciones que tú aportaste; no es asesoría financiera. No fue revisada por una agencia de viajes.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Comparador de opciones de viaje">
          <GeneradorComparar />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · precios ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            3 alojamientos en Miraflores: la más barata y la mejor puntuada no son la misma
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En una comparación ficticia de 3 alojamientos, el {hostal.opcion.nombre} tiene el costo total ajustado más bajo ({hostal.opcion.moneda} {formatoMonto(hostal.costo.total!)}), pero el {hotel.opcion.nombre} obtiene la mejor puntuación ({hotel.puntuacion}/100) porque los pesos de este perfil de viajero priorizan la comodidad y la ubicación sobre el precio.{" "}
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
            <p>«¿Cuál opción elijo?» casi nunca se responde solo con el precio. Esta herramienta ordena esa decisión en tres pasos, sin pedirle a ninguna IA que decida por ti.</p>
            <ol>
              <li>
                <strong>Escribes tus opciones</strong> (de 2 a 5), con su precio y sus datos objetivos: qué incluye, duración, ubicación y condiciones de cancelación. Eliges tus criterios y repartes 100 puntos entre ellos, y puntúas cada opción en cada criterio.
              </li>
              <li>
                <strong>Copias el prompt:</strong> la página ya calculó el costo total ajustado y la puntuación de cada opción; la IA solo agrega lo que tú no puedes calcular sola: valoraciones subjetivas separadas de los datos, costos que podrían faltar y preguntas antes de reservar.
              </li>
              <li>
                <strong>Pegas la respuesta</strong> y revisas la tabla, los costos a verificar, las ventajas y desventajas, y las preguntas pendientes antes de decidir.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la matriz y el costo total ajustado los calcula la página, no la IA.</strong> La IA nunca decide por ti ni inventa un precio que no le diste.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="costo-total">Por qué el precio inicial casi nunca es el costo total</h2>
            <p>
              Comparar dos opciones por su precio inicial es el error más común al elegir un viaje. Una opción con un precio menor puede terminar costando más si le sumas lo que no incluye: equipaje, traslados, comisiones de servicio, tasas o una tarifa de limpieza que solo aparece al pagar. Esta herramienta calcula el <strong>costo total ajustado</strong>: el precio que escribiste, más los extras conocidos que le indicaste y, si le diste un valor a tu tiempo, el costo de las horas de trayecto.
            </p>
            <Tabla
              resumen="Cómo se calcula el costo total ajustado de una opción"
              columnas={["Qué sumas", "De dónde sale", "Ejemplo"]}
              primeraColumnaEnNegrita
              filas={[
                ["Precio", "El que escribiste para la opción", `${hostal.opcion.moneda} ${formatoMonto(parsearNumero(hostal.opcion.precio)!)}`],
                ["Extras conocidos", "El costo que le indicaste (equipaje, tasas, comisiones)", "0 si no escribiste ninguno"],
                ["Horas de trayecto × tu tiempo", "Horas de trayecto puerta a puerta, por el valor que le diste a tu hora (opcional)", `0,5 h × S/ ${ej.datos.valorTiempo}`],
                ["Costo total ajustado", "La suma de las tres anteriores", `${hostal.opcion.moneda} ${formatoMonto(hostal.costo.total!)}`],
              ]}
            />
            <p>El valor de tu tiempo es opcional: si lo dejas vacío, la página no convierte horas en costo, pero igual suma los extras conocidos que hayas escrito.</p>

            <h2 id="criterios">Cómo elegir tus criterios y darles peso</h2>
            <p>
              La página trae 6 criterios de partida (precio, tiempo, comodidad, ubicación, flexibilidad y actividades), pero puedes agregar hasta {MAX_CRITERIOS - CRITERIOS_PREDEFINIDOS.length} propios (como «seguridad» o «cercanía a mi trabajo») y quitar los que no apliquen a tu comparación. Repartir 100 puntos entre ellos te obliga a decidir qué te importa más <em>antes</em> de mirar los resultados, en vez de justificar después la opción que ya tenías en mente.
            </p>
            <ul>
              <li>Si un criterio no puedes distinguirlo entre tus opciones (por ejemplo, todas tienen la misma ubicación), ponle un peso bajo: no aporta a la decisión.</li>
              <li>Si dudas entre dos pesos, prueba ambos: la página recalcula la puntuación al instante y te muestra si cambia el ganador.</li>
              <li>Los pesos no tienen que sumar exactamente 100: la página los usa en proporción a la suma que hayas puesto.</li>
            </ul>

            <h2 id="datos-vs-valoraciones">Datos objetivos vs. valoraciones subjetivas</h2>
            <p>
              Un precio, una fecha o una condición de cancelación son datos: no dependen de quién los lea. «Muy cómodo» o «buena ubicación» son valoraciones: dependen de la persona que las escribe, incluida la IA. El prompt de esta herramienta le exige a la IA marcar cada valoración con la etiqueta <code>[VALORACIÓN]</code>, para que nunca confundas su opinión con un hecho que tú le diste.
            </p>
            <p>Esto importa especialmente al puntuar los criterios subjetivos (comodidad, flexibilidad): la puntuación de 1 a 5 que le pones a cada opción debe reflejar tu propio criterio, o el de alguien que ya se hospedó o viajó con esa opción, no la opinión de una IA que no estuvo ahí.</p>

            <Anuncio posicion="medio" />

            <h2 id="tiempo-vs-dinero">Tiempo vs. dinero: cómo ponerle precio a tus horas de viaje</h2>
            <p>
              Una opción más barata que te hace perder una hora extra de trayecto no siempre es la mejor opción. Ponerle un valor a tu tiempo te permite comparar en una sola unidad (dinero) dos cosas que normalmente comparas «a ojo». No hay una fórmula única para elegir ese valor; dos formas razonables de aproximarlo:
            </p>
            <Tabla
              resumen="Dos formas de aproximar el valor de una hora de tu tiempo en viaje"
              columnas={["Método", "Cómo se calcula", "Cuándo usarlo"]}
              primeraColumnaEnNegrita
              filas={[
                ["Por tu sueldo", "Sueldo mensual ÷ horas trabajadas al mes", "Si el viaje es de trabajo o si valoras tu tiempo como el de tu trabajo remunerado"],
                ["Por lo que pagarías por ahorrarlo", "Lo que pagarías por un servicio que te ahorre esa hora (por ejemplo, un taxi directo en vez de transporte público con transbordos)", "Si el viaje es personal y no quieres usar tu sueldo como referencia"],
              ]}
            />
            <p>Si no quieres convertir tiempo en dinero, deja el campo vacío: la página sigue sumando los extras conocidos, solo que sin el ajuste por horas.</p>

            <h2 id="revisar-alojamiento">Qué revisar en un alojamiento (ubicación real, cancelación, tasas, reseñas recientes)</h2>
            <Tabla
              resumen="Qué revisar antes de comparar precios de alojamiento"
              columnas={["Qué revisar", "Por qué importa"]}
              primeraColumnaEnNegrita
              filas={[
                ["Ubicación real en un mapa", "Una dirección puede decir «cerca del centro» y estar a 40 minutos caminando; verifica la distancia real, no solo el nombre del barrio."],
                ["Política de cancelación", "Una tarifa «no reembolsable» puede ser más barata pero te deja sin margen si algo cambia."],
                ["Tasas y comisiones al pagar", "Algunas plataformas suman una tarifa de limpieza o una comisión de servicio recién en el último paso del pago."],
                ["Reseñas recientes (no solo las destacadas)", "Las reseñas más visibles suelen ser las mejores o las más antiguas; ordénalas por fecha para ver el estado actual del lugar."],
                ["Depósitos de garantía", "Confirma si se cobran al reservar o al llegar, y si se devuelven en efectivo o solo en la misma tarjeta."],
              ]}
            />

            <h2 id="revisar-transporte">Qué revisar en un transporte (equipaje, escalas, llegada nocturna)</h2>
            <Tabla
              resumen="Qué revisar antes de comparar precios de transporte"
              columnas={["Qué revisar", "Por qué importa"]}
              primeraColumnaEnNegrita
              filas={[
                ["Equipaje incluido", "Una tarifa básica sin maleta puede terminar costando más que una tarifa completa si necesitas llevar equipaje de bodega."],
                ["Escalas y su duración", "Una escala corta puede significar riesgo de perder la conexión; una escala larga suma horas reales de viaje."],
                ["Horario de llegada", "Llegar de madrugada puede obligarte a gastar en un traslado adicional o perder una noche de alojamiento."],
                ["Condiciones de cambio", "Si tu fecha no es 100 % segura, una tarifa flexible puede valer más que el ahorro inicial."],
              ]}
            />
            <p>
              Si vas a contratar un transporte o una agencia en Perú, conoce antes tus derechos como consumidor: Indecopi supervisa que las agencias de viaje no usen métodos de captación engañosos y recomienda no entregar datos de pago antes de contratar (ver fuentes).
            </p>

            <h2 id="costos-ocultos">Costos ocultos más comunes</h2>
            <ul>
              <li><strong>Equipaje de bodega</strong> en tarifas de transporte «básicas».</li>
              <li><strong>Tasas de turista o impuestos municipales</strong> que no aparecen en el precio mostrado.</li>
              <li><strong>Comisión de servicio o tarifa de limpieza</strong> en alojamientos reservados por plataforma.</li>
              <li><strong>Traslados</strong> entre el aeropuerto o la terminal y el alojamiento.</li>
              <li><strong>Depósitos de garantía</strong> que se cobran y se devuelven después, afectando tu flujo de caja aunque no sean un gasto final.</li>
              <li><strong>Actividades o tours «no incluidos»</strong> en un paquete que parecía todo incluido.</li>
            </ul>
            <p>Anota cada uno que aplique en «Extras conocidos», con su costo si lo sabes: así el costo total ajustado refleja lo que de verdad vas a pagar, no solo el precio anunciado.</p>

            <h2 id="ejemplo">Ejemplo completo: tres alojamientos en Miraflores y dos perfiles de viajero (datos ficticios)</h2>
            <p>Pareja ficticia que compara 3 alojamientos en Lima para 4 noches, con 100 puntos repartidos así: precio 25, tiempo 15, comodidad 20, ubicación 15, flexibilidad 10 y actividades 15.</p>
            <Tabla
              resumen="Las 3 opciones del ejemplo, con su precio, su costo total ajustado y su puntuación"
              columnas={["Opción", "Precio", "Costo total ajustado", "Puntuación"]}
              primeraColumnaEnNegrita
              filas={[
                [hotel.opcion.nombre, `${hotel.opcion.moneda} ${formatoMonto(parsearNumero(hotel.opcion.precio)!)}`, `${hotel.opcion.moneda} ${formatoMonto(hotel.costo.total!)}`, `${hotel.puntuacion}/100`],
                [hostal.opcion.nombre, `${hostal.opcion.moneda} ${formatoMonto(parsearNumero(hostal.opcion.precio)!)}`, `${hostal.opcion.moneda} ${formatoMonto(hostal.costo.total!)}`, `${hostal.puntuacion}/100`],
                [airbnb.opcion.nombre, `${airbnb.opcion.moneda} ${formatoMonto(parsearNumero(airbnb.opcion.precio)!)}`, `${airbnb.opcion.moneda} ${formatoMonto(airbnb.costo.total!)}`, `${airbnb.puntuacion}/100`],
              ]}
            />
            <h3>1. Dos ganadores distintos, según qué mires</h3>
            <p>
              El {barata.opcion.nombre} tiene el costo total ajustado más bajo ({barata.opcion.moneda} {formatoMonto(barata.costo.total!)}), incluso después de sumarle sus extras. Pero el {mejor.opcion.nombre} obtiene la mejor puntuación ({mejor.puntuacion}/100) con los pesos de este perfil de viajero, porque su comodidad y su ubicación pesan más que la diferencia de precio.
            </p>
            <h3>2. Si cambian las prioridades, cambia el ganador</h3>
            <p>La página recalcula la puntuación con 2 perfiles de prioridades distintos, sin tocar tus puntuaciones de cada opción:</p>
            <Tabla
              resumen="Quién gana según el perfil de prioridades, en este ejemplo"
              columnas={["Perfil de prioridades", "Quién gana"]}
              primeraColumnaEnNegrita
              filas={PERFILES_PESO.map((perfil) => {
                const g = ganadorDePerfil(ej.datos, perfil.valor);
                return [perfil.etiqueta, g?.opcion.nombre ?? "—"];
              })}
            />
            <p>
              Con las prioridades por defecto de esta pareja, gana el {mejor.opcion.nombre}. Si en cambio priorizaran el precio, ganaría el {ganadorPrecio.opcion.nombre}: el mismo dato (las 3 opciones), una conclusión distinta según lo que más te importe.
            </p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «me diga cuál opción elegir»:</p>
            <Tabla resumen="Bloques del prompt de comparar opciones de viaje y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca calcula el costo total ajustado ni la puntuación: la página ya se los da, calculados en tu navegador. La IA solo agrega lo que una fórmula no puede darte: una valoración subjetiva, un costo que se te pasó o una pregunta que todavía no te hiciste.</p>

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
                <strong>No busca ni verifica precios.</strong> Ni esta página ni la IA consultan precios reales: todo lo que compares viene de lo que tú escribiste.
              </li>
              <li>
                <strong>La puntuación depende de tus propias puntuaciones.</strong> Si le pones un 5 de comodidad a una opción que no conoces bien, la matriz reflejará esa suposición, no la realidad.
              </li>
              <li>
                <strong>No reserva ni compra nada.</strong> Es una ayuda para comparar; la decisión y la compra las haces tú.
              </li>
              <li>
                <strong>No es asesoría financiera ni legal.</strong> Decide según tu presupuesto y tus condiciones reales, no solo por el puntaje más alto.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíbe. La página marca montos que no vienen de tus datos ni de sus propios cálculos, y opciones que la respuesta no mencionó, pero la revisión final es tuya.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El cálculo del costo total ajustado, la puntuación ponderada, los 3 perfiles de sensibilidad y el lector de la respuesta se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_COMPARAR.map((q) => (
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
            <p className="mt-3 text-muted-foreground">Esta página oficial peruana se localizó el 29 de septiembre de 2026 con una búsqueda; su servidor no permitió abrirla automáticamente, por eso esta guía no cita ninguna cifra ni caso concreto de ella. Sirve para que verifiques tú tus derechos como consumidor antes de contratar un transporte o una agencia de viaje en Perú:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://www.indecopi.gob.pe/-/el-indecopi-fiscaliza-que-agencias-de-viaje-no-capten-clientes-con-metodos-enganosos" target="_blank" rel="noopener noreferrer">
                  Indecopi: fiscalización a agencias de viaje y métodos de captación
                </a>
                : recomendaciones oficiales sobre qué exigir a una agencia de viajes y qué datos no entregar antes de contratar.
              </li>
            </ul>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>El costo total ajustado, la matriz ponderada y los perfiles de sensibilidad son criterio propio de esta herramienta, no un estándar de la industria ni un estudio.</li>
              <li>Esta herramienta no contiene precios reales de ningún hotel, aerolínea, agencia ni operador turístico.</li>
              <li>No usamos el nombre ni el logo de ninguna marca de alojamiento, transporte o agencia: los ejemplos son genéricos y ficticios.</li>
              <li>Para otros países, consulta a la autoridad de protección al consumidor correspondiente.</li>
              <li>Todos los ejemplos (nombres, precios y condiciones) son ficticios y de elaboración propia; sus cifras se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
