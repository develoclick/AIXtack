import Link from "next/link";
import { ArrowRight, Clock, Download, GitCompareArrows, ListTree, Lock, ShieldCheck, Wallet } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorOptimizar } from "./generador-optimizar";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { getCategoria, herramientasPendientes, type HerramientaPublicada } from "@/content/catalogo";
import { RUTA_CV } from "@/content/prompts";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_OPTIMIZAR = [
  {
    q: "¿La IA reescribirá todo mi CV?",
    a: "Solo si eliges «Reestructuración». En «Retoque» mantiene tu estructura y solo corrige redacción, repeticiones y orden dentro de cada sección; en «Adaptación» además prioriza lo que más pesa en la oferta. En los tres modos el prompt le prohíbe agregar información que no esté en tu CV.",
  },
  {
    q: "¿Cómo copio el texto de un PDF?",
    a: "Abre el PDF, selecciona todo (Ctrl + A), copia (Ctrl + C) y pega en el recuadro de la herramienta. Si el orden sale mezclado, tu CV probablemente usa columnas o tablas, lo que ya es una señal de mejora: usa la intensidad «Reestructuración». Si el PDF es una imagen escaneada no tiene texto que copiar y tendrás que volver a escribirlo.",
  },
  {
    q: "¿Puedo cambiar el nombre de mi cargo para que coincida con la oferta?",
    a: "Solo si describe fielmente lo que hacías. Lo recomendable es mantener el título oficial y aclarar tus funciones con las palabras de la oferta. Cambiar un cargo por otro más vistoso es falsear tu experiencia y puede aparecer cuando una empresa verifique tus datos.",
  },
  {
    q: "¿Qué hago con las brechas?",
    a: "Si te falta un requisito, no lo escondas ni lo inventes. Puedes mencionar conocimientos parciales con honestidad («nociones de…», «en curso»), desarrollar la habilidad antes de afirmarla o postular a ofertas que encajen mejor. Las brechas del registro te sirven además para prepararte para las preguntas de la entrevista.",
  },
  {
    q: "¿Cuántas veces puedo optimizar mi CV?",
    a: "Una vez por oferta. Guarda cada versión con el nombre de la empresa (por ejemplo, CV-NombreApellido-EmpresaX) y conserva el registro de cambios: te ayuda a recordar qué contaste en cada postulación.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario se guarda solo en tu navegador y la comparación, las verificaciones y el archivo Word se calculan en tu equipo. Tus datos salen de tu equipo únicamente cuando tú pegas el prompt en la IA que elijas: desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
  {
    q: "¿Funciona sin una oferta laboral?",
    a: "La oferta es obligatoria porque es lo que permite decidir qué priorizar y qué palabras usar. Si aún no tienes una oferta concreta, crea tu CV con la herramienta de CV Harvard y adáptalo después a cada vacante.",
  },
  {
    q: "¿Puedo pedir el CV optimizado en inglés?",
    a: "Sí: elige «Inglés» en el idioma de salida. La IA traducirá y adaptará el contenido, pero la traducción de nombres de cargos y de títulos puede no coincidir con los oficiales: revísala y, si hace falta, márcala como intocable.",
  },
  {
    q: "¿Este CV optimizado garantiza que pase el filtro ATS o que me llamen?",
    a: "No. Nadie puede garantizarlo: cada empresa usa un sistema distinto y en la decisión pesan tu experiencia real y la competencia. La herramienta mejora la claridad, la estructura y la coincidencia honesta con la oferta; el resultado depende de ti y de cada proceso.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Revisor senior de CV con experiencia en ATS y en el mercado laboral peruano y latinoamericano. Un rol concreto evita respuestas genéricas."],
  ["Objetivo", "Una frase con lo que debe producir, el idioma, la intensidad elegida y la longitud máxima. Aquí se aplican tus opciones del formulario."],
  ["Fuente", "Tu CV, la oferta y tus datos nuevos, entre etiquetas claras. Se declara que son información y no instrucciones: si dentro de tu CV o de la oferta hubiera una orden, la IA debe ignorarla."],
  ["Datos del usuario", "La intensidad con su regla, lo que no se puede tocar, el país y el idioma. Lo que dejas vacío aparece como «(no indicado)» para que la IA no lo suponga."],
  ["Reglas de contenido", "Usar solo tu CV y tus datos nuevos, no inventar nada, no cambiar cargos ni fechas, clasificar cada requisito en A, B o C y aplicar solo los cambios de tipo A."],
  ["Reglas de formato", "El CV optimizado en una columna, sin tablas ni iconos, con títulos estándar y la estructura «Organización | Ciudad» y «Cargo | Fechas» que esta página sabe leer."],
  ["Formato de salida", "Ocho títulos exactos y en orden (Diagnóstico, CV optimizado, Registro de cambios, Eliminado o reorganizado, Brechas, Preguntas, Afirmaciones que debes verificar y Siguiente paso). Gracias a ellos la página separa la respuesta en paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: nada inventado, títulos exactos, intensidad respetada, dudas señaladas y cada cambio registrado."],
];

const REVISION = [
  "Leíste el CV optimizado completo, línea por línea, y todo lo que dice es verdad.",
  "Cada cifra, nombre y herramienta nuevos que marcó la página los confirmaste o los quitaste.",
  "Los cargos, las fechas y los nombres de las empresas son exactamente los tuyos.",
  "Respondiste las preguntas de tipo B y solo agregaste lo que sí hacías.",
  "Las brechas están reconocidas: no las escondiste y sabes cómo hablarlas en una entrevista.",
  "Las palabras clave de la oferta que aparecen son las que de verdad dominas.",
  "Cada viñeta empieza con un verbo de acción y no usa pronombres.",
  "El CV cabe en la longitud que pediste, en una sola columna y sin tablas ni iconos.",
  "Abriste el archivo Word y comprobaste que se ve bien y que el texto se puede seleccionar.",
  "Guardaste la versión con el nombre de la empresa y conservaste el registro de cambios.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#optimizar-o-crear", "¿Optimizar o crear uno nuevo?"],
  ["#diagnostico", "Diagnóstico en 9 problemas"],
  ["#priorizar", "Cómo priorizar según la oferta"],
  ["#bullets", "5 patrones de bullets"],
  ["#frases", "12 frases débiles transformadas"],
  ["#palabras-clave", "Palabras clave sin falsear"],
  ["#eliminar", "Qué eliminar de tu CV"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#ejemplo", "Ejemplo completo paso a paso"],
  ["#revision", "Revisión final en 10 puntos"],
  ["#entrevista", "Registro de cambios y entrevista"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaOptimizar({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = herramientasPendientes(herramienta.categoria).filter((h) => herramienta.relacionadas.includes(h.slug));

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Optimizar CV" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Mejora lo que ya tienes en vez de empezar de cero: pega tu CV y la oferta, copia el prompt en tu IA y recibe un diagnóstico, una versión optimizada, un registro de cambios y las brechas reales, sin inventar nada.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Wallet, "Gratis, sin registro"],
              [GitCompareArrows, "Comparación antes y después"],
              [Download, "Descarga en Word (.docx)"],
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
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Optimizador de hoja de vida">
          <GeneradorOptimizar />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · datos ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Así se transforma una viñeta sin inventar nada
          </h2>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <p className="rounded-lg border bg-card p-3">
              <span className="font-semibold text-destructive">Antes:</span> «Apoyo en el cuadre de bancos de 4 cuentas corrientes cada mes»
            </p>
            <p className="rounded-lg border bg-card p-3">
              <span className="font-semibold text-ok">Después:</span> «Realicé conciliaciones bancarias mensuales de 4 cuentas corrientes»
            </p>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            La oferta pide «conciliaciones bancarias» y el CV ya describía esa tarea con otro nombre; el «4» estaba en el CV original. SAP, en cambio, no aparecía: queda como brecha real y no se agrega.{" "}
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
              Optimizar tu CV con IA significa mejorar el que ya tienes para una oferta concreta: ordenarlo, redactarlo mejor y mostrar primero lo que más pesa para esa vacante, sin agregar nada que no hayas hecho. Sirve si ya tienes una hoja de vida y sientes que «no le llega» a las ofertas, y también si quieres saber con claridad qué te falta frente a lo que piden.
            </p>
            <ol>
              <li>
                <strong>Pegas tu CV y la oferta completa,</strong> eliges la intensidad (retoque, adaptación o reestructuración) y anotas lo que no se puede tocar.
              </li>
              <li>
                <strong>Copias el prompt</strong> y lo pegas en ChatGPT, Gemini, Claude u otro asistente. El prompt le exige usar solo tu información y devolver la respuesta con ocho títulos exactos.
              </li>
              <li>
                <strong>Pegas la respuesta.</strong> La página la separa en paneles, compara tu CV con el optimizado palabra por palabra, cuenta los cambios, marca los números y nombres que no estaban en tu CV y te deja descargar el resultado en Word.
              </li>
            </ol>

            <Anuncio posicion="intro" />

            <h2 id="optimizar-o-crear">¿Optimizar o crear un CV nuevo? Tabla de decisión</h2>
            <p>
              Optimizar no siempre es lo mejor. Si tu CV es una buena base, conviene mejorarlo; si es un obstáculo (por su formato o porque no tiene información suficiente), es más rápido crearlo de cero con la <Link href={RUTA_CV}>herramienta de CV en formato Harvard</Link>. Usa esta tabla:
            </p>
            <Tabla
              resumen="Cuándo optimizar un CV, con qué intensidad, o crear uno nuevo"
              columnas={["Tu situación", "Qué te conviene", "Por qué"]}
              filas={[
                ["Tienes un CV ordenado y solo no encaja con una oferta", "Optimizar con «Adaptación»", "El contenido es bueno: hay que priorizarlo y nombrarlo como lo hace la oferta."],
                ["El contenido es bueno pero está mal redactado o repetido", "Optimizar con «Retoque»", "Solo hace falta corregir redacción y orden, sin tocar la estructura."],
                ["Al copiar el texto sale mezclado (columnas, tablas, cuadros)", "Optimizar con «Reestructuración» o crear uno nuevo", "El formato dificulta la lectura automática; conviene pasarlo a una sola columna."],
                ["No tienes CV o casi no tienes experiencia", "Crear un CV nuevo", "No hay qué optimizar: parte de tus datos con la herramienta base y el artículo de CV sin experiencia."],
                ["Cambias de sector y tu experiencia se parece poco a la oferta", "Optimizar con cuidado y revisar las brechas", "La herramienta te dirá qué sí se traslada y qué falta; no hay que forzar coincidencias."],
                ["Postulas a muchas ofertas parecidas", "Optimizar una vez por oferta", "Cada vacante prioriza distinto; guarda una versión por empresa."],
              ]}
            />

            <h2 id="diagnostico">Diagnóstico en 9 problemas típicos (con ejemplo de cada uno)</h2>
            <p>
              El primer paso del prompt es un diagnóstico: la IA debe listar cada problema con su etiqueta y citar entre « » el fragmento original. Si la cita no aparece en tu CV, la página lo marca, porque puede ser un fragmento inventado. Estos son los nueve tipos, con ejemplos ficticios:
            </p>
            <Tabla
              resumen="Los nueve tipos de problema del diagnóstico, con un ejemplo ficticio y su corrección"
              columnas={["Etiqueta", "Ejemplo (ficticio)", "Cómo se corrige"]}
              primeraColumnaEnNegrita
              filas={[
                ["ESTRUCTURA", "«Excel, Word, contabilidad, orden, puntual, Excel» en una sola línea", "Separar herramientas de conocimientos y mover cada dato a su sección."],
                ["CLARIDAD", "«Apoyo en el área» (¿en qué?)", "Decir qué tarea concreta hacías y para quién."],
                ["REDACCIÓN", "«Atención de clientes en tienda» sin verbo", "Empezar con un verbo de acción en pasado: «Atendí a los clientes…»."],
                ["REPETICIÓN", "«Apoyo en tareas contables» tres veces", "Unir o eliminar las repeticiones y conservar una viñeta precisa."],
                ["EXCESO", "Doce viñetas para un trabajo de seis meses", "Conservar las tres o cuatro más relevantes para la oferta."],
                ["SIN EVIDENCIA", "«Persona responsable y proactiva»", "Quitar el adjetivo o reemplazarlo por un hecho que lo demuestre."],
                ["LOGRO POCO CLARO", "«Mejoré procesos»", "Decir qué proceso y qué cambió (con un dato real, si lo tienes)."],
                ["KEYWORD AUSENTE", "«Cuadre de bancos» cuando la oferta pide «conciliaciones bancarias»", "Usar el término de la oferta si describe la misma tarea (tipo A)."],
                ["POCO RELEVANTE", "«Atención telefónica» para un puesto de analista", "Eliminarlo o resumirlo para dar espacio a lo que sí pesa."],
              ]}
            />
            <p>
              Ver el problema con su cita es lo que hace útil el diagnóstico: en lugar de «tu CV está confuso», sabes exactamente qué línea corregir y por qué.
            </p>

            <h2 id="priorizar">Cómo priorizar tu información según la oferta</h2>
            <p>
              Antes de reescribir, el prompt clasifica cada requisito de la oferta en tres tipos. Es la parte más importante del método porque evita que la IA «rellene» tu CV:
            </p>
            <ul>
              <li>
                <strong>Tipo A: está en tu CV y se puede mejorar.</strong> Se redacta mejor, se reordena o se nombra con el término de la oferta. Solo estos cambios se aplican.
              </li>
              <li>
                <strong>Tipo B: está implícito y necesita tu confirmación.</strong> La IA te hace una pregunta y no lo incluye hasta que lo confirmes.
              </li>
              <li>
                <strong>Tipo C: no aparece.</strong> Es una brecha real. No se agrega; se lista para que decidas qué hacer.
              </li>
            </ul>
            <Tabla
              resumen="Ejemplo de clasificación de requisitos de una oferta en tipos A, B y C"
              columnas={["Requisito de la oferta (ficticia)", "Tipo", "Qué pasa"]}
              filas={[
                ["Realizar conciliaciones bancarias mensuales", "A", "Tu CV dice «cuadre de bancos de 4 cuentas»: se renombra como «conciliaciones bancarias»."],
                ["Preparar reportes de cierre mensual", "B", "Tu CV dice «apoyo en el cierre de mes»: se pregunta si preparabas algún reporte."],
                ["Manejo de SAP (obligatorio)", "C", "No aparece: queda como brecha y no se agrega."],
                ["Excel intermedio", "A", "Tu CV tiene un curso de Excel intermedio: se destaca en habilidades y certificaciones."],
              ]}
            />
            <p>
              Una vez clasificados los requisitos, la prioridad es simple: lo que la oferta pone como obligatorio y aparece en tu CV va primero (en el perfil y en las primeras viñetas de cada cargo); lo deseable, después; lo que no tiene relación con la vacante se resume o se elimina. Si quieres profundizar en cómo leer una oferta, lee <Link href="/carrera-y-empleo/palabras-clave-cv-oferta-laboral">cómo encontrar las palabras clave de una oferta laboral</Link>.
            </p>

            <h2 id="bullets">Cómo escribir bullets profesionales: 5 patrones</h2>
            <p>
              Una viñeta profesional dice qué hiciste y, si tienes el dato, qué cambió. Estos cinco patrones cubren casi todos los casos. Los ejemplos son ficticios; los tuyos deben salir de tu experiencia real:
            </p>
            <Tabla
              resumen="Cinco patrones de viñetas con ejemplo y cuándo usarlos"
              columnas={["Patrón", "Ejemplo (ficticio)", "Úsalo cuando"]}
              filas={[
                ["Acción + objeto + herramienta", "Registré facturas de compra y de venta en Excel.", "La herramienta es un requisito de la oferta."],
                ["Acción + objeto + volumen", "Realicé conciliaciones bancarias mensuales de 4 cuentas corrientes.", "Tienes una cantidad real (cuentas, clientes, equipos, pedidos)."],
                ["Acción + objeto + resultado", "Reduje el tiempo de resolución de tickets de 3 horas a 2 horas.", "Puedes demostrar el antes y el después."],
                ["Acción + para quién", "Preparé reportes semanales de ventas para la gerencia comercial.", "Quieres mostrar a quién servía tu trabajo."],
                ["Problema + acción + efecto", "Detecté diferencias en una conciliación antes del cierre y las corregí junto con contabilidad.", "Hubo un problema real y tú actuaste."],
              ]}
            />
            <p>
              Si te faltan verbos, revisa <Link href="/carrera-y-empleo/verbos-de-accion-para-cv">la lista de verbos de acción por área</Link>. Una regla que protege tu credibilidad: elige el verbo que refleja tu nivel real. «Apoyé» y «Participé» son honestos si apoyabas o participabas; «Lideré» solo si decidías o guiabas a otras personas.
            </p>

            <Anuncio posicion="medio" />

            <h2 id="frases">12 frases débiles transformadas (sin inventar logros)</h2>
            <p>
              Transformar una frase no es inventar un logro: es preguntarte qué hiciste realmente y escribirlo con precisión. La tercera columna es lo que necesitas saber tú antes de aceptar el cambio; si no lo sabes, la frase no se transforma.
            </p>
            <Tabla
              resumen="Doce frases débiles, su versión transformada y el dato real que se necesita"
              columnas={["Frase débil", "Transformada (ejemplo ficticio)", "Lo que necesitas saber de tu experiencia real"]}
              filas={[
                ["Apoyo en tareas contables", "Registré facturas de compra y de venta.", "Qué tareas concretas hacías."],
                ["Responsable de atención al cliente", "Atendí consultas y reclamos de clientes por teléfono y en tienda.", "Por qué canales y qué tipo de casos."],
                ["Encargado de redes sociales", "Programé y publiqué contenido en Instagram y Facebook.", "En qué redes y con qué frecuencia."],
                ["Manejo de Excel", "Elaboré reportes semanales en Excel con tablas dinámicas.", "Qué funciones usas de verdad."],
                ["Participé en proyectos", "Colaboré en la reorganización del almacén y registré las entradas y salidas.", "Qué proyecto y cuál fue tu parte."],
                ["Trabajo en equipo", "Coordiné con ventas y logística la entrega de pedidos.", "Con quién trabajabas y para qué."],
                ["Proactivo", "Propuse una hoja de control para el seguimiento de pagos.", "Qué propusiste y si se usó."],
                ["Ayudé a mis compañeros", "Capacité a 3 compañeros en el uso de la hoja de pedidos.", "A cuántas personas y en qué."],
                ["Labores administrativas", "Archivé y ordené la documentación de la oficina.", "Qué documentos y con qué criterio."],
                ["Atención de llamadas", "Atendí llamadas de clientes y derivé cada caso al área correspondiente.", "Qué hacías con cada llamada."],
                ["Buen manejo de sistemas", "Registré las ventas en el sistema de facturación de la tienda.", "Qué sistema y qué registrabas."],
                ["Cumplimiento de metas", "Cumplí la meta mensual de ventas de S/ 18 000 en 5 meses del último año.", "La meta exacta y el periodo (dato real)."],
              ]}
            />

            <h2 id="palabras-clave">Palabras clave: usar los términos de la oferta sin falsear</h2>
            <p>
              Los sistemas de seguimiento de candidatos permiten buscar y filtrar por términos, y muchas ofertas usan palabras específicas. Usar esas palabras ayuda solo cuando describen algo que ya hiciste. La regla de la herramienta es la misma que la de los tipos A, B y C:
            </p>
            <Tabla
              resumen="Cómo tratar los términos de la oferta según lo que dice tu CV"
              columnas={["La oferta dice", "Tu CV dice", "Qué se hace"]}
              filas={[
                ["Conciliaciones bancarias", "Cuadre de bancos", "Se usa el término de la oferta (misma tarea, otro nombre): tipo A."],
                ["Excel intermedio", "Curso de Excel intermedio (2022)", "Se destaca en habilidades y certificaciones: tipo A."],
                ["Manejo de SAP", "No aparece", "No se agrega: brecha real, tipo C."],
                ["Cierre mensual", "Apoyo en tareas de cierre de mes", "Se pregunta qué parte hacías: tipo B."],
              ]}
            />
            <p>
              Lo que la herramienta nunca hace: agregar una herramienta que no mencionaste, cambiar el título de tu cargo o subir tu nivel («intermedio» a «avanzado»). La página además cuenta cuántos términos de la oferta aparecen ahora en tu CV y cuántos tienen respaldo en el registro de cambios, para que veas si el avance viene de renombrar lo que ya hacías o de algo que la IA añadió por su cuenta.
            </p>

            <h2 id="eliminar">Qué eliminar de tu CV (y cuándo sí conservarlo)</h2>
            <Tabla
              resumen="Elementos que suelen eliminarse de un CV y cuándo conviene conservarlos"
              columnas={["Elemento", "Elimínalo cuando", "Consérvalo cuando"]}
              filas={[
                ["Foto, edad, estado civil, documento de identidad", "Casi siempre: no aportan a la selección.", "La oferta pide expresamente alguno de esos datos."],
                ["Objetivo genérico («crecer en la empresa»)", "No dice nada concreto del puesto.", "Se reemplaza por un perfil profesional con hechos."],
                ["Adjetivos sin prueba («responsable», «dinámico»)", "No hay un hecho que los respalde.", "Los demuestras con un logro o una viñeta."],
                ["Trabajos muy antiguos sin relación con la oferta", "No suman a este puesto y ocupan espacio.", "Cubren un período largo que de otro modo quedaría sin explicar."],
                ["Tareas de rutina de poco peso", "Desplazan lo más relevante.", "La oferta las pide o muestran una habilidad que te falta."],
                ["Estudios de colegio", "Ya tienes estudios técnicos o universitarios.", "Es tu nivel de estudios más alto."],
                ["«Referencias a solicitud»", "Ocupa espacio y se da por sabido.", "La oferta pide referencias en el CV."],
                ["Pretensión salarial", "La oferta no la pide.", "La oferta la solicita expresamente."],
              ]}
            />
            <p>
              La guía de hojas de vida del centro de carreras de Harvard College recomienda, entre otras cosas, no incluir imágenes, edad ni género y explicar los períodos sin actividad; son buenos criterios de partida (fuente en «Fuentes y verificación»).
            </p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt de la herramienta tiene ocho bloques. Cada uno resuelve un riesgo típico de pedirle a una IA que «mejore un CV»:</p>
            <Tabla resumen="Bloques del prompt de optimización y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>
              La pieza clave es la separación entre lo que la IA puede hacer (cambios de tipo A) y lo que no (agregar información). Sin esa separación, un asistente tiende a «mejorar» el CV añadiendo cifras y herramientas verosímiles que no son tuyas.
            </p>

            <h2 id="ejemplo">Ejemplo completo paso a paso</h2>
            <p>
              <strong>Ejemplo ilustrativo (ficticio).</strong> Diego Cárdenas Mendoza es asistente contable en Lima desde marzo de 2023 (unos 3 años) y postula a «Analista contable» en un estudio contable, que pide conciliaciones bancarias, registro en SAP y Excel intermedio. Puedes cargar este ejemplo con el botón «Llenar con datos de ejemplo».
            </p>
            <h3>1. Lo que Diego pega</h3>
            <ul>
              <li>Su CV en texto, con frases como «Apoyo en el área de contabilidad» (dos veces con otras palabras), «Apoyo en el cuadre de bancos de 4 cuentas corrientes cada mes» y una línea de habilidades con «Excel» repetido.</li>
              <li>La oferta completa, con sus funciones y requisitos.</li>
              <li>Intensidad «Adaptación»; intocables: los cargos, las fechas y los nombres de las empresas; y un dato nuevo: un curso de conciliaciones bancarias con Excel de 12 horas (2024).</li>
            </ul>
            <h3>2. Lo que devuelve la IA (resumen)</h3>
            <ul>
              <li>
                <strong>Diagnóstico:</strong> [REPETICIÓN] por «apoyo en tareas contables» repetido; [KEYWORD AUSENTE] porque «cuadre de bancos» equivale a «conciliaciones bancarias»; [SIN EVIDENCIA] por «responsable y proactiva».
              </li>
              <li>
                <strong>CV optimizado:</strong> «Realicé conciliaciones bancarias mensuales de 4 cuentas corrientes», más el curso nuevo en certificaciones. Los cargos y las fechas quedan igual.
              </li>
              <li>
                <strong>Brechas (tipo C):</strong> manejo de SAP y declaración mensual de impuestos, que no aparecen y no se agregan.
              </li>
              <li>
                <strong>Preguntas (tipo B):</strong> si las conciliaciones las hacía él de principio a fin o apoyaba a alguien, y qué reportes preparaba en el cierre.
              </li>
            </ul>
            <h3>3. Cómo lo lee la página</h3>
            <p>
              La comparación muestra en rojo lo eliminado («Apoyo en el cuadre de bancos») y en verde lo agregado («Realicé conciliaciones bancarias»). El resumen cuenta las palabras eliminadas, las viñetas reescritas y los términos de la oferta que ahora aparecen. El detector de invención no marca ningún número: el «4» y el «3 años» estaban en el CV original. Si la IA hubiera escrito «SAP» en el CV, aparecería resaltado como dato que no estaba en el CV.
            </p>
            <h3>4. Qué hace Diego después</h3>
            <p>
              Responde las preguntas: si hacía las conciliaciones él solo, «Realicé» es correcto; si apoyaba, cambia a «Apoyé en las conciliaciones bancarias». Reconoce la brecha de SAP y decide si la menciona en su postulación como «nociones» o «en aprendizaje» solo si es verdad. Descarga el Word y lo guarda con el nombre de la empresa.
            </p>

            <h2 id="revision">Revisión final en 10 puntos</h2>
            <ul className="not-prose my-4 space-y-2">
              {REVISION.map((c) => (
                <li key={c} className="tarjeta flex gap-3 p-3 text-sm">
                  <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border border-brand-solid text-xs text-brand">
                    ✓
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            <h2 id="entrevista">Cómo usar el registro de cambios para preparar la entrevista</h2>
            <p>
              El registro «Antes → Después → Motivo» no es solo una lista de retoques: es tu guion de preparación. Cualquier cosa que aparezca en el CV optimizado puede preguntarse en una entrevista.
            </p>
            <ol>
              <li>
                <strong>Por cada «Después», prepara la historia.</strong> Si escribes «Realicé conciliaciones bancarias mensuales de 4 cuentas», debes poder contar cómo lo hacías, con qué herramienta y qué problemas encontraste.
              </li>
              <li>
                <strong>Convierte las brechas en preguntas.</strong> Si la oferta pide SAP y no lo tienes, prepara una respuesta honesta: qué sabes, qué harías para aprenderlo y en cuánto tiempo.
              </li>
              <li>
                <strong>Usa las preguntas de tipo B como práctica.</strong> Responderlas por escrito te obliga a recordar detalles concretos (cantidades, herramientas, resultados) que luego sirven en la conversación.
              </li>
              <li>
                <strong>Guarda el registro con la versión del CV.</strong> Así sabrás exactamente qué contaste a cada empresa. Usa el botón «Copiar registro de cambios» y pégalo en un documento junto al nombre de la vacante.
              </li>
            </ol>

            <h2 id="limites">Límites y verificación</h2>
            <ul>
              <li>
                <strong>Optimizar no es exagerar.</strong> Mejorar la redacción, el orden y los términos es legítimo. Cambiar cargos, fechas, empresas o niveles es falsear tu experiencia y puede descubrirse cuando una empresa verifica tus datos.
              </li>
              <li>
                <strong>La IA puede equivocarse o inventar,</strong> aunque el prompt se lo prohíbe. Por eso la página compara y marca lo nuevo, pero la revisión final es tuya.
              </li>
              <li>
                <strong>No garantiza resultados.</strong> Ni esta herramienta ni ninguna puede prometer que pases un filtro o que te llamen a una entrevista.
              </li>
              <li>
                <strong>Es una ayuda para preparar tu candidatura,</strong> no asesoría laboral ni legal. Cada país, sector y empresa tiene sus costumbres (en Perú se dice «hoja de vida»; en otros países, «currículum» o «CV»): adapta el resultado a lo que pide cada proceso.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El armado del prompt, el lector de la respuesta, la comparación, el detector de invención y el archivo Word se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente de IA no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_OPTIMIZAR.map((q) => (
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
              <span>
                Pendientes de publicar (sin enlace): {pendientes.map((h) => h.titulo).join("; ")}.
              </span>
            </p>
          )}

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

          <section aria-labelledby="fuentes" className="tarjeta mt-12 p-5 text-sm">
            <h2 id="fuentes" className="text-base font-semibold">
              Fuentes y verificación
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/" target="_blank" rel="noopener noreferrer">
                  Harvard College Guide to Creating a Strong Resume
                </a>{" "}
                (Mignone Center for Career Success, Harvard FAS). Consultada el 25 de septiembre de 2026. De aquí salen las recomendaciones de adaptar la hoja de vida al puesto, usar verbos de acción, evitar pronombres, imágenes, edad y género, y no dejar períodos sin explicar.
              </li>
              <li>El funcionamiento de un ATS es orientativo: cada sistema y cada empresa lo configuran de forma distinta.</li>
              <li>Todos los ejemplos (personas, empresas, ofertas y cifras) son ficticios y de elaboración propia; sus cifras se recalcularon a partir de los datos de cada ejemplo.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
