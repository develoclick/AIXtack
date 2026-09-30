import Link from "next/link";
import { ArrowRight, ClipboardList, Clock, ListTree, Lock, Scale } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorNichos } from "./generador-nichos";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_NICHOS } from "@/content/ejemplos/nichos";
import { rankearNichos } from "@/lib/nichos/calculo";
import { leerRespuestaNichos1 } from "@/lib/nichos/lector";
import { pesosVacios } from "@/lib/nichos/tipos";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_NICHOS = [
  {
    q: "¿Me dirás qué nicho es rentable?",
    a: "No, y desconfía de cualquier herramienta que lo prometa sin conocer tu mercado real. Esta página te ayuda a generar hipótesis de nichos y a validarlas con evidencia propia (entrevistas, búsquedas, preventas) antes de invertir tiempo o dinero.",
  },
  {
    q: "¿Cuántas entrevistas necesito para validar un nicho?",
    a: "Muchas guías de validación de negocios sugieren empezar con 10 a 15 entrevistas para detectar patrones iniciales. No es una cifra exacta ni garantiza nada: es un punto de partida razonable antes de invertir más tiempo.",
  },
  {
    q: "¿Qué pasa si hay mucha competencia en un nicho?",
    a: "Puede ser una señal de que hay demanda real, no necesariamente una mala noticia. La pregunta importante es si puedes diferenciarte de esa competencia de una forma que le importe a tu cliente.",
  },
  {
    q: "¿Necesito dinero para validar un nicho?",
    a: "Muchas pruebas cuestan poco o nada: entrevistas, búsquedas de lo que ya existe, publicaciones en redes o comunidades. Una preventa o una mini campaña pueden tener un costo bajo si lo planificas bien.",
  },
  {
    q: "¿Cuánto tarda en validarse un nicho?",
    a: "Una primera señal puede obtenerse en unas 2 semanas, con el plan de 14 días que arma esta herramienta. Eso no confirma el negocio completo: es el primer filtro antes de comprometer más tiempo o dinero.",
  },
  {
    q: "¿Por qué la IA no elige por mí los 2 mejores nichos?",
    a: "Porque «mejor» depende de qué priorizas tú (facilidad de entrada, inversión, tu propio encaje). Por eso la matriz usa tus pesos, no un criterio fijo de la IA: cambia los pesos y el ranking se recalcula al instante.",
  },
  {
    q: "¿Qué hago si ningún nicho de la lista me convence?",
    a: "Pide otra tanda: ajusta tu inventario (agrega sectores, cambia tus restricciones) y vuelve a copiar el Prompt 1. Cuanto más específico sea tu inventario, menos genéricos serán los nichos que te proponga.",
  },
  {
    q: "¿Cómo decido los pesos de la matriz?",
    a: "Piensa en qué te importa más hoy: si tienes poco presupuesto, sube el peso de «inversión requerida»; si necesitas ingresos que se repitan, sube «recurrencia». No hay una combinación correcta única: depende de tu situación.",
  },
];

const PARTES_PROMPT_1 = [
  ["Rol", "Estratega de negocios especializado en validación de ideas."],
  ["Objetivo", "Generar entre 8 y 10 nichos específicos, como hipótesis, a partir de tu inventario personal."],
  ["Fuente", "Tu inventario (conocimientos, sectores, oferta, mercado, recursos, presupuesto, canales), entre etiquetas y declarado como información."],
  ["Datos del usuario", "Conocimientos, sectores de interés, lo que sabes ofrecer, mercado, tipo de cliente, recursos, presupuesto, horas, canales y restricciones."],
  ["Reglas de contenido", "Usar solo tus datos, generar oportunidades como hipótesis (nunca certezas) y no inventar nombres de competidores reales."],
  ["Reglas de formato", "Un bloque de código CSV de 14 columnas, con una fila de encabezado exacta."],
  ["Formato de salida", "3 títulos exactos y en orden: Nichos, Qué debes verificar, Siguiente paso."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: entre 8 y 10 filas, ningún nicho amplio, puntuaciones de 1 a 5, sin nombres de competidores inventados."],
];

const PARTES_PROMPT_2 = [
  ["Rol", "El mismo estratega de negocios, ahora enfocado en tus 2 nichos elegidos."],
  ["Objetivo", "Definir hipótesis críticas y un plan de validación de 14 días, con el criterio de éxito fijado antes de empezar."],
  ["Fuente", "Tu inventario y la ficha completa de los 2 nichos que marcaste como favoritos en la matriz."],
  ["Datos del usuario", "Tu inventario, más el nombre y la ficha de cada uno de los 2 nichos elegidos."],
  ["Reglas de contenido", "El criterio de éxito se define antes del experimento, nunca después de ver los resultados; preguntas de entrevista que no induzcan la respuesta."],
  ["Reglas de formato", "Un plan de validación separado por nicho, con acciones, costo estimado y criterio de éxito."],
  ["Formato de salida", "6 títulos exactos y en orden: Hipótesis críticas, Plan de validación (Nicho 1 y Nicho 2), Guion de entrevistas, Qué debes verificar, Siguiente paso."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: criterio de éxito definido antes, sin preguntas inductivas, sin cifras de mercado inventadas."],
];

const TRANSFORMACIONES = [
  ["Clases de inglés", "Inglés para entrevistas de trabajo en TI, para desarrolladores peruanos con nivel intermedio"],
  ["Ropa", "Ropa de trabajo resistente para mecánicos y técnicos de campo"],
  ["Comida saludable", "Viandas bajas en sodio para personas con hipertensión que trabajan en oficina"],
  ["Diseño gráfico", "Identidad visual para consultorios de psicología que recién abren su consulta propia"],
  ["Contabilidad", "Costeo por producto para talleres de costura que no saben su margen real"],
  ["Clases de música", "Piano para adultos que empiezan después de los 40 años, sin experiencia previa"],
  ["Asesoría legal", "Contratos simples para creadores de contenido que venden cursos o mentorías"],
  ["Fotografía", "Fotos de producto para tiendas de ropa que venden por Instagram"],
  ["Limpieza", "Limpieza post-obra para departamentos recién remodelados en edificios nuevos"],
  ["Marketing digital", "Gestión de reseñas en Google para clínicas dentales pequeñas"],
];

const CHECKLIST = [
  "Cada nicho de tu lista sigue el formato «[servicio] para [cliente concreto] que [problema]», no un mercado amplio.",
  "Revisaste la ficha completa de cada nicho, no solo su puntuación ponderada.",
  "Ajustaste los pesos de la matriz según lo que de verdad te importa hoy (presupuesto, tiempo, recurrencia).",
  "El criterio de éxito de tu plan de validación quedó definido ANTES de empezar, no después de ver los resultados.",
  "Ninguna pregunta de tu guion de entrevistas induce la respuesta que esperas escuchar.",
  "No vas a presentar ningún nicho como «comprobado» sin haber hecho al menos una validación real.",
  "Registraste tus entrevistas o pruebas en el registro de validación de esta página, no solo en tu memoria.",
  "No vas a usar esto como sustituto de asesoría legal, financiera o de inversión.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#que-es-un-nicho", "Qué es realmente un nicho"],
  ["#mercado-vs-nicho", "Mercado vs nicho: de amplio a específico"],
  ["#problemas-que-pagan", "Problemas por los que la gente paga"],
  ["#mercado-amplio", "Señales de un mercado demasiado amplio"],
  ["#evaluar-competencia", "Evaluar la competencia sin herramientas de pago"],
  ["#criterios-matriz", "Criterios para comparar nichos"],
  ["#validar-antes-de-invertir", "Validar antes de invertir"],
  ["#entrevistas", "Entrevistas que no te mientan"],
  ["#nicho-a-oferta", "De nicho a oferta concreta"],
  ["#ejercicios", "Ejercicios prácticos"],
  ["#ejemplo", "Ejemplo completo"],
  ["#prompt", "Cómo están hechos los 2 prompts"],
  ["#checklist", "Checklist antes de validar"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaNichos({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_NICHOS[0];
  const lectura = leerRespuestaNichos1(ej.respuestaNichos);
  const ranking = rankearNichos(lectura.nichos, pesosVacios());
  const primero = ranking[0];
  const segundo = ranking[1];

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Identificar un nicho de mercado" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">Hipótesis claras, criterios transparentes y experimentos baratos. Nada de «este nicho es rentable» sin evidencia.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Scale, "Tú decides los pesos de la matriz"],
              [ClipboardList, "Registro de validación en tu navegador"],
              [Lock, "Tus datos, en tu navegador"],
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Los nichos que genera esta herramienta son hipótesis de una IA, no certezas de mercado. Valídalos con evidencia propia antes de invertir tiempo o dinero. No es asesoría de inversión.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Buscador de nichos de mercado con IA">
          <GeneradorNichos />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · persona y nichos ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Entre 8 nichos, «{primero.nombre.split(",")[0]}» quedó primero con {primero.puntuacion} / 5
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Con pesos iguales entre los 5 criterios, ese nicho superó a «{segundo.nombre.split(",")[0]}» ({segundo.puntuacion} / 5) por su mejor diferenciación y encaje. Ese cálculo lo hace esta página, nunca la IA: cambia los pesos y el orden puede cambiar.{" "}
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
            <p>Pedirle a una IA «dame ideas de negocio» casi siempre devuelve mercados amplios («ropa», «comida saludable») que ya tienen mucha competencia y ninguna evidencia de que funcionen para ti. Esta herramienta ordena el proceso en 4 momentos, para que la IA proponga hipótesis y tú decidas con criterios propios cuáles vale la pena probar.</p>
            <ol>
              <li>
                <strong>Cuentas tu inventario personal</strong>: qué sabes, qué sectores te interesan, tu mercado, tus recursos y tus restricciones.
              </li>
              <li>
                <strong>Copias el Prompt 1</strong>: te devuelve entre 8 y 10 nichos específicos, cada uno con su ficha completa y puntuado de 1 a 5 en 5 criterios.
              </li>
              <li>
                <strong>Comparas los nichos en una matriz</strong> con tus propios pesos (no los de la IA) y marcas hasta 2 como favoritos.
              </li>
              <li>
                <strong>Copias el Prompt 2</strong>, que arma un plan de validación de 14 días para esos 2 nichos, con un criterio de éxito definido antes de empezar; registras tus resultados en el registro de validación.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la IA nunca decide cuál es el «mejor» nicho.</strong> Genera hipótesis con ficha y puntuaciones; el ranking lo calcula esta página con los pesos que tú elijas.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="que-es-un-nicho">Qué es realmente un nicho (y qué no lo es)</h2>
            <p>Un nicho de mercado es un grupo de clientes concreto, con un problema específico, al que puedes describir en una frase sin usar la palabra «todos». «Mujeres que hacen ejercicio» no es un nicho: es casi medio mercado. «Mujeres mayores de 50 años que empiezan a hacer pesas por primera vez, con miedo a lesionarse» sí lo es: puedes imaginar a esa persona, su problema y lo que buscaría.</p>
            <p>Un nicho bien definido responde 3 preguntas a la vez: ¿quién es exactamente el cliente?, ¿qué problema puntual tiene?, y ¿por qué lo que ya existe no se lo resuelve bien? Si tu respuesta a cualquiera de las 3 es vaga, todavía no tienes un nicho: tienes una idea de mercado sin afinar.</p>

            <h2 id="mercado-vs-nicho">Mercado vs nicho: 10 transformaciones de amplio a específico</h2>
            <p>La forma más rápida de entender la diferencia es ver mercados amplios convertidos en nichos concretos. Esta tabla usa el mismo formato que le pide el prompt a la IA: «[servicio] para [cliente concreto] que [problema]».</p>
            <Tabla resumen="10 ejemplos de mercados amplios transformados en nichos específicos" columnas={["Mercado amplio", "Nicho específico (ejemplo ilustrativo)"]} primeraColumnaEnNegrita filas={TRANSFORMACIONES} />
            <p>Nota que cada nicho específico menciona a alguien concreto (edad, rol, situación), no «todos los que...». Eso es lo que hace que un nicho sea más fácil de encontrar, de hablarle directamente y de diferenciar de la competencia genérica.</p>

            <h2 id="problemas-que-pagan">Cómo identificar problemas por los que la gente paga</h2>
            <p>No todo problema real es un problema por el que alguien paga. 3 señales ayudan a distinguirlos:</p>
            <ul>
              <li>
                <strong>Ya gasta tiempo o dinero intentando resolverlo</strong>, aunque sea con una solución mala (videos gratis, prueba y error, un producto genérico).
              </li>
              <li>
                <strong>El problema se repite</strong>, no es una situación que vive una sola vez en la vida.
              </li>
              <li>
                <strong>Hay una consecuencia clara de no resolverlo</strong>: pierde una oportunidad, un cliente, dinero o tiempo específico.
              </li>
            </ul>
            <p>Si el problema no cumple ninguna de estas 3 señales, puede ser real pero no urgente: la gente lo reconoce si se lo preguntas, pero no está dispuesta a pagar por resolverlo todavía.</p>

            <h2 id="mercado-amplio">Señales de que tu nicho sigue siendo un mercado demasiado amplio</h2>
            <Tabla
              resumen="Señales de que un nicho sigue siendo demasiado amplio, y cómo corregirlo"
              columnas={["Señal", "Qué hacer"]}
              primeraColumnaEnNegrita
              filas={[
                ["Puedes describir al cliente en una palabra («emprendedores», «mamás»)", "Agrega una situación concreta: ¿emprendedores de qué rubro, en qué etapa?"],
                ["El problema aplicaría a casi cualquier persona", "Pregúntate quién lo sufre MÁS, no quién podría sufrirlo."],
                ["No se te ocurre una sola comunidad o grupo donde encontrarlos", "Si no sabes dónde buscarlos, probablemente el nicho sigue siendo muy amplio."],
                ["La oferta que imaginas serviría «para cualquier negocio»", "Especializa la oferta para el problema puntual de ese cliente, no para un problema genérico."],
              ]}
            />

            <h2 id="evaluar-competencia">Cómo evaluar la competencia sin herramientas de pago</h2>
            <p>No necesitas un software especializado para tener una primera idea de la competencia de un nicho:</p>
            <ul>
              <li>
                <strong>Busca el nicho, no el mercado</strong>, en buscadores y redes sociales: «inglés para entrevistas técnicas» da resultados distintos a «clases de inglés».
              </li>
              <li>
                <strong>Revisa comunidades y grupos</strong> donde estaría tu cliente: si nadie pregunta ni ofrece nada parecido, puede ser señal de poca demanda, no de una oportunidad libre.
              </li>
              <li>
                <strong>Lee reseñas de soluciones cercanas</strong> (aunque no sean del mismo nicho exacto): las quejas frecuentes son pistas de dónde diferenciarte.
              </li>
              <li>
                <strong>Cuenta cuántos resultados son genéricos</strong> vs. especializados en tu nicho exacto: mucha competencia genérica y poca especializada suele ser una buena señal.
              </li>
            </ul>
            <p>El prompt de esta herramienta le pide a la IA describir el TIPO de competencia probable (por ejemplo, «academias de inglés general»), nunca nombres reales inventados: esa verificación puntual la haces tú, con la búsqueda de arriba.</p>

            <Anuncio posicion="medio" />

            <h2 id="criterios-matriz">Criterios para comparar nichos (y cómo ponderarlos)</h2>
            <p>La matriz de esta herramienta usa 5 criterios, cada uno puntuado de 1 a 5 por la IA y ponderado por ti:</p>
            <Tabla
              resumen="Los 5 criterios de la matriz de evaluación de nichos"
              columnas={["Criterio", "Qué mide", "Cuándo pesarlo más"]}
              primeraColumnaEnNegrita
              filas={[
                ["Facilidad de entrada", "Qué tan rápido puedes empezar (trámites, aprendizaje, primera venta).", "Si necesitas ingresos pronto."],
                ["Inversión requerida", "5 = inversión baja, 1 = inversión alta.", "Si tu presupuesto inicial es bajo."],
                ["Recurrencia", "¿El cliente vuelve a comprar, o es una compra única?", "Si buscas ingresos estables, no solo un proyecto puntual."],
                ["Diferenciación", "Qué tan fácil es distinguirte de lo que ya existe.", "Si el mercado ya tiene mucha oferta genérica."],
                ["Encaje contigo", "Cuánto usa tus conocimientos y recursos actuales.", "Si prefieres empezar con lo que ya sabes, no aprender desde cero."],
              ]}
            />
            <p>Los pesos no necesitan sumar 100: la página los usa como proporción entre sí. Prueba distintas combinaciones: si el ranking cambia mucho según los pesos, es una señal de que tu decisión depende más de tus prioridades que de una diferencia real entre los nichos.</p>

            <h2 id="validar-antes-de-invertir">Validar antes de invertir: entrevistas, búsquedas, preventa, mini campañas</h2>
            <Tabla
              resumen="4 formas de validar un nicho antes de invertir, con su costo aproximado y qué prueba cada una"
              columnas={["Método", "Qué prueba", "Costo aproximado"]}
              primeraColumnaEnNegrita
              filas={[
                ["Entrevistas de descubrimiento", "Si el problema es real y urgente para el cliente.", "Bajo o nulo (tu tiempo)."],
                ["Búsqueda de lo que ya existe", "Si hay competencia y cómo resuelve el problema hoy.", "Nulo."],
                ["Preventa (cobrar antes de tener el producto)", "Si hay disposición real a pagar, no solo interés.", "Bajo (una página simple o un formulario de pago)."],
                ["Mini campaña en redes o comunidades", "Si el mensaje genera contactos o interesados.", "Bajo a medio, según si pagas promoción."],
              ]}
            />
            <p>El plan de validación de 14 días que arma esta herramienta combina 2 o 3 de estos métodos para tus 2 nichos elegidos, con un criterio de éxito medible definido ANTES de hacer la prueba: por ejemplo, «al menos 3 pagos anticipados» o «al menos 8 contactos pidiendo precio». Definirlo antes evita la trampa de decidir después qué cuenta como «éxito».</p>

            <h2 id="entrevistas">Cómo hacer entrevistas que no te mientan</h2>
            <p>Las entrevistas de validación fallan más seguido por cómo se preguntan que por a quién se le pregunta. 2 errores frecuentes:</p>
            <ul>
              <li>
                <strong>Preguntas que inducen la respuesta</strong>: «¿Te gustaría pagar por un curso de inglés técnico?» casi siempre obtiene un «sí» educado, aunque la persona nunca vaya a comprar. Pregunta por su comportamiento pasado en vez de su intención futura: «¿Cómo te preparaste la última vez que tuviste una entrevista en inglés?».
              </li>
              <li>
                <strong>Hablar más de lo que escuchas</strong>: si terminas la entrevista habiendo explicado tu idea antes de que la persona cuente su problema, perdiste la oportunidad de validar nada. Deja que la persona describa su situación primero.
              </li>
            </ul>
            <p>El guion de entrevistas que arma el Prompt 2 está diseñado para evitar preguntas inductivas: revísalo igual antes de usarlo, porque una IA puede deslizar una pregunta sesgada sin darte cuenta.</p>

            <h2 id="nicho-a-oferta">De nicho a oferta concreta</h2>
            <p>Una vez que validas un nicho, el siguiente paso es convertirlo en una oferta específica: qué vendes exactamente, a qué precio, y con qué primera acción para conseguir tu primer cliente pagado. Esta herramienta se detiene antes de ese paso a propósito: una vez que tengas un nicho validado, <Link href="/emprendimiento/crear-plan-de-negocio">crear un plan de negocio con IA</Link> te ayuda a ordenar esa oferta con inversión, costos y punto de equilibrio ya calculados.</p>

            <h2 id="ejercicios">Ejercicios prácticos</h2>
            <ol>
              <li>Escribe 3 problemas que hayas visto resolver mal a tu alrededor en el último mes (a un colega, un familiar, un negocio). ¿Alguno de esos problemas se repite y tiene una consecuencia clara de no resolverse?</li>
              <li>Toma un mercado amplio de tu propio inventario (por ejemplo, tu profesión) y escribe 3 versiones específicas siguiendo el formato «[servicio] para [cliente concreto] que [problema]».</li>
              <li>Antes de pedirle nichos a la IA, escribe tú mismo tu propia hipótesis de nicho favorito. Después compara si la IA la incluyó, la mejoró o propuso algo mejor.</li>
              <li>Define, por escrito, cuál sería para ti un criterio de éxito razonable para una validación de 14 días, antes de leer el que te sugiera el Prompt 2.</li>
            </ol>

            <h2 id="ejemplo">Ejemplo completo: profesora de inglés corporativo</h2>
            <p>Persona ficticia con 8 años de experiencia dando clases de inglés corporativo y preparando entrevistas técnicas en inglés, en Lima, Perú.</p>
            <h3>1. Los 8 nichos generados (Prompt 1)</h3>
            <p>La IA propuso 8 nichos, cada uno con ficha completa (cliente, problema, oferta, competencia, canales, monetización, recursos) y 5 puntuaciones de 1 a 5. Los 2 con mejor puntuación ponderada, con pesos iguales:</p>
            <Tabla
              resumen="Los 2 nichos mejor puntuados del ejemplo, con sus 5 puntuaciones"
              columnas={["Nicho", "Entrada", "Inversión", "Recurrencia", "Diferenciación", "Encaje", "Puntuación"]}
              primeraColumnaEnNegrita
              filas={[
                [primero.nombre.split(",")[0], String(primero.entrada), String(primero.inversion), String(primero.recurrencia), String(primero.diferenciacion), String(primero.encaje), `${primero.puntuacion} / 5`],
                [segundo.nombre.split(",")[0], String(segundo.entrada), String(segundo.inversion), String(segundo.recurrencia), String(segundo.diferenciacion), String(segundo.encaje), `${segundo.puntuacion} / 5`],
              ]}
            />
            <h3>2. Por qué ganó el primer nicho</h3>
            <p>«{primero.nombre.split(",")[0]}» obtuvo la mejor diferenciación (5/5) y el mejor encaje con la experiencia de la persona (5/5), aunque su recurrencia es baja (solo 3/5, porque cada cliente suele necesitar el servicio una sola vez, antes de una entrevista). Con pesos iguales, esa combinación lo llevó al primer lugar. Si la persona hubiera priorizado recurrencia (por ejemplo, subiendo su peso a 40), el ranking podría haber cambiado.</p>
            <h3>3. El plan de validación (Prompt 2)</h3>
            <p>Para los 2 nichos elegidos, el plan de 14 días combinó entrevistas de descubrimiento (días 1 a 5) con una oferta de prueba (preventa o sesión gratuita, días 6 a 14), cada uno con su propio criterio de éxito definido antes de empezar: por ejemplo, «al menos 3 pagos anticipados, o al menos 8 personas que dejen su contacto pidiendo precio».</p>

            <h2 id="prompt">Cómo están hechos los 2 prompts (y por qué funcionan)</h2>
            <p>Cada prompt tiene ocho bloques. El Prompt 1 genera las hipótesis; el Prompt 2 solo se activa cuando ya elegiste tus 2 favoritos en la matriz, y usa esa elección como parte de sus datos:</p>
            <h3>Prompt 1: generar los nichos</h3>
            <Tabla resumen="Bloques del Prompt 1 (generar nichos) y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_PROMPT_1} primeraColumnaEnNegrita />
            <h3>Prompt 2: hipótesis críticas y plan de validación</h3>
            <Tabla resumen="Bloques del Prompt 2 (plan de validación) y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_PROMPT_2} primeraColumnaEnNegrita />
            <p>La decisión clave: la IA nunca decide cuáles son tus 2 mejores nichos. Tú los eliges en la matriz, con tus propios pesos, y recién entonces el Prompt 2 usa esa elección.</p>

            <h2 id="checklist">Checklist antes de validar</h2>
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
                <strong>No te dice qué nicho es rentable.</strong> Genera hipótesis y te ayuda a compararlas y validarlas; la decisión y el riesgo son tuyos.
              </li>
              <li>
                <strong>No verifica competidores reales.</strong> El prompt le prohíbe a la IA inventar nombres; la búsqueda de competencia real la haces tú, con la guía de esta página.
              </li>
              <li>
                <strong>No da asesoría legal, financiera ni de inversión.</strong> Antes de comprometer dinero, consulta con un profesional si el monto lo justifica.
              </li>
              <li>
                <strong>Tus datos, siempre en tu navegador.</strong> El formulario y el registro de validación nunca se envían a este sitio; revisa el detalle en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíba: puede proponer un nicho todavía muy amplio o dejar de marcar una hipótesis. La revisión final es tuya.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El cálculo de la matriz, el lector de ambas respuestas y el registro de validación se prueban automáticamente con datos ficticios verificados con código, no a mano. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>, o <Link href="/contacto">escríbenos</Link> si encuentras un error.
              </li>
            </ul>
            <p>
              Revisa el resto de herramientas para emprendedores en{" "}
              <Link href="/emprendimiento" className="text-brand underline underline-offset-2">
                Emprendimiento
              </Link>
              .
            </p>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_NICHOS.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">{q.a}</p>
              </details>
            ))}
          </div>

          <HerramientasRelacionadas categoria={herramienta.categoria} slug={herramienta.slug} />
          {pendientes.length > 0 && (
            <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
              <ArrowRight aria-hidden className="mt-0.5 size-4 shrink-0" />
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
            <p className="mt-3 text-muted-foreground">Las prácticas de validación de esta guía (entrevistas de descubrimiento, preventa, criterio de éxito definido antes del experimento) son metodologías generales de desarrollo de clientes, no una interpretación de la IA.</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://www.gob.pe/producemas" target="_blank" rel="noopener noreferrer">
                  Produce Más (Ministerio de la Producción): plataforma de orientación y servicios para emprendedores y MYPE
                </a>
                : consultada el 30 de septiembre de 2026. Esta página oficial peruana bloquea la lectura automatizada, por eso esta guía no cita ningún dato exacto de ella; úsala para verificar formalización y asesoría gratuita en tu caso concreto.
              </li>
            </ul>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Esta herramienta no calcula tamaños de mercado ni cifras de demanda: esos datos, si los necesitas, requieren una fuente propia verificada por ti.</li>
              <li>No usamos el nombre de ninguna empresa, plataforma ni competidor real como parte de la herramienta ni de sus ejemplos.</li>
              <li>Todos los ejemplos (personas, nichos y competencia) son ficticios y de elaboración propia; sus puntuaciones y el ranking se recalculan con el mismo código de la herramienta, nunca a mano.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
