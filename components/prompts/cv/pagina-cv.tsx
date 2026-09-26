import Link from "next/link";
import { ArrowRight, Clock, Download, FileCheck2, ListTree, Lock, Wallet } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorCv } from "./generador-cv";
import { VistaCv } from "./vista-cv";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { getCategoria } from "@/content/categorias";
import { CV_EJEMPLO_RESPUESTA } from "@/content/prompts/cv-ejemplo";
import type { PromptMeta } from "@/content/prompts";
import { leerRespuestaIa } from "@/lib/cv/parser";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_CV = [
  {
    q: "¿Es mejor entregar el CV en Word o en PDF?",
    a: "Sigue lo que pida la oferta. Si no dice nada, un PDF creado desde Word conserva el texto real y se ve igual en todos los equipos, y un .docx también lo leen bien la mayoría de los sistemas. Evita los PDF que son una foto del documento (escaneados), porque no tienen texto que leer. Esta herramienta te da el .docx para que lo revises y, si quieres, lo guardes como PDF desde Word.",
  },
  {
    q: "¿Debo poner mi foto en el CV?",
    a: "El formato Harvard no lleva foto, y la guía de Harvard College recomienda no incluir imágenes, edad ni género. Aun así, las costumbres cambian según el país y el sector: si la oferta o la empresa piden foto, decide tú. Para los sistemas ATS, una imagen no suma y puede estorbar.",
  },
  {
    q: "¿Cuántas páginas debe tener mi hoja de vida?",
    a: "Con poca o mediana experiencia, una página. Si tienes muchos años de experiencia relevante, dos páginas son razonables. Lo importante no es llenar el espacio, sino que lo más relevante para la oferta se vea primero. El prompt de esta herramienta ya le pide a la IA que respete ese límite.",
  },
  {
    q: "¿Puedo usarlo si no tengo experiencia laboral?",
    a: "Sí. Elige «Sin experiencia laboral» como nivel, deja vacío el bloque de trabajos y cuenta en «Proyectos, prácticas, voluntariado o actividades» lo que sí hiciste. La educación va primero y las viñetas se redactan igual, con verbos de acción y resultados reales. Hay un perfil de ejemplo para ver cómo queda.",
  },
  {
    q: "¿La IA va a inventar cosas en mi CV?",
    a: "El prompt le prohíbe inventar cifras, empresas, cargos, fechas y habilidades, y le pide separar en las notas lo que no pudo cubrir. Aun así, ninguna IA es infalible: revisa cada línea del resultado antes de enviarlo. Todo lo que aparezca en tu CV debe ser verdad y poder defenderse en una entrevista.",
  },
  {
    q: "¿Este CV garantiza que pase los filtros o que me llamen a una entrevista?",
    a: "No. Nadie puede garantizarlo: cada empresa usa un sistema distinto, con criterios propios, y en la decisión pesan tu experiencia real, la competencia y el momento. Lo que sí hace esta herramienta es evitar los errores de formato que dificultan la lectura automática y ayudarte a que tus palabras clave coincidan con la oferta, cuando de verdad las tienes.",
  },
  {
    q: "¿Qué pasa con mis datos personales?",
    a: "El formulario guarda lo que escribes solo en tu navegador (no lo enviamos a ningún servidor de este sitio) y el Word se crea en tu propio equipo. El único momento en que tus datos salen de tu equipo es cuando tú pegas el prompt en la IA que elijas: desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
  {
    q: "¿Qué datos personales no debo poner en mi CV?",
    a: "Evita el número de documento de identidad, la dirección exacta, la edad, el estado civil, la foto y las referencias personales. Basta con tu nombre, correo, teléfono y ciudad y país, y un enlace a LinkedIn o a tu portafolio si lo tienes. Los documentos se piden después, si hacen falta.",
  },
  {
    q: "¿Qué hago con los períodos en los que no trabajé?",
    a: "La guía de Harvard College recomienda no dejar huecos de tiempo sin explicar. No hace falta justificar cada mes: puedes indicar con una línea qué hiciste (un curso, un proyecto, el cuidado de un familiar) o comentarlo en la entrevista. Lo esencial es no inventar trabajos que no existieron.",
  },
];

const PROMPT_PARTES = [
  ["Rol", "Le dice a la IA desde qué punto de vista trabajar: reclutador senior y experto en ATS. Sin rol, tiende a escribir textos genéricos."],
  ["Objetivo y nivel", "Puesto, idioma y nivel del candidato. Cambian el orden de las secciones (educación primero si tienes poca experiencia) y la extensión."],
  ["Oferta laboral", "Es la fuente de las palabras clave. La IA las usa solo si tus datos las respaldan."],
  ["Datos del candidato", "Tu información ordenada. Lo que falta aparece como «(no indicado)» para que la IA no lo rellene con suposiciones."],
  ["Reglas de contenido", "No inventar, viñetas con verbo de acción y resultado, sin pronombres, sin datos personales innecesarios."],
  ["Reglas de formato", "Una columna, encabezados estándar, fechas coherentes, sin tablas ni iconos: lo que un lector automático entiende mejor."],
  ["Formato de salida", "Una estructura exacta de texto dentro de un bloque de código. Gracias a ella esta página puede leer la respuesta y convertirla en Word."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: cifras, fechas, formato, palabras clave y extensión."],
];

const CHECKLIST = [
  "Todo lo que dice el CV es verdad y puedes explicarlo en una entrevista.",
  "El nombre, el correo y el teléfono están completos y sin errores.",
  "Los cargos y nombres de empresa son los oficiales, no versiones «creativas».",
  "Las fechas tienen el mismo formato en todo el documento y van de lo más reciente a lo más antiguo.",
  "Cada viñeta empieza con un verbo de acción y cuenta qué hiciste y qué resultó.",
  "Las cifras que aparecen son tuyas y las puedes justificar (si dudas de una, quítala).",
  "Las palabras clave de la oferta que sí dominas aparecen con las mismas palabras que usa el aviso.",
  "No hay tablas, columnas, cuadros de texto, iconos ni fotos, y los encabezados son los estándar.",
  "Cabe en una página (dos como máximo si tienes mucha experiencia relevante).",
  "El archivo se llama con tu nombre (por ejemplo, CV-Nombre-Apellido) y lo abriste una vez para verificar que se lee bien.",
];

export function PaginaCv({ prompt }: { prompt: PromptMeta }) {
  const categoria = getCategoria(prompt.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const ejemplo = leerRespuestaIa(CV_EJEMPLO_RESPUESTA);
  const relacionados = articulos.filter((a) => a.categoria === prompt.categoria);

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Crear CV" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{prompt.titulo}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Escribe tus datos, copia el prompt que se arma solo y pégalo en tu IA (ChatGPT, Gemini, Claude…). Trae la respuesta y descarga tu hoja de vida en Word, con formato Harvard y sin los elementos que los filtros ATS leen mal.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Wallet, "Gratis, sin registro"],
              [FileCheck2, "Formato Harvard, una columna"],
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
            · Publicado el <time dateTime={prompt.publicado}>{formatDate(prompt.publicado)}</time> · Actualizado el <time dateTime={prompt.actualizado}>{formatDate(prompt.actualizado)}</time>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Generador de hoja de vida">
          <GeneradorCv />
        </section>

        <div className="guia-diferida mx-auto mt-16 max-w-3xl">
          <div className="tarjeta p-5">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <ListTree aria-hidden className="size-4 text-brand" /> En esta página
              </span>
              <span className="flex items-center gap-1 font-normal text-muted-foreground tabular">
                <Clock aria-hidden className="size-3.5" /> {prompt.tiempoLectura} de lectura · última actualización: <time dateTime={prompt.actualizado}>{formatDate(prompt.actualizado)}</time>
              </span>
            </p>
            <nav aria-label="Índice de la guía">
              <ol className="mt-3 grid gap-x-6 sm:grid-cols-2">
                {prompt.secciones.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex min-h-11 items-center text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                      {s.titulo}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <article className={`${PROSE} mt-8`}>
            <h2 id="como-funciona">Cómo funciona la herramienta</h2>
            <p>
              Esta página resuelve un problema concreto: tener una hoja de vida limpia, en un formato que los sistemas de selección lean bien y que una persona entienda rápido, sin pelearte con plantillas. Sirve tanto si buscas tu primer trabajo como si ya tienes años de experiencia. Son tres pasos:
            </p>
            <ol>
              <li>
                <strong>Escribes tus datos.</strong> Puesto, oferta laboral, contacto, experiencia, educación y habilidades. Si quieres ver el resultado antes, usa el botón «Llenar con datos de ejemplo».
              </li>
              <li>
                <strong>Copias el prompt.</strong> Se arma solo con lo que escribiste, con reglas de formato Harvard y de lectura por ATS. Lo pegas en ChatGPT, Gemini, Claude u otro asistente.
              </li>
              <li>
                <strong>Pegas la respuesta y descargas el Word.</strong> La página lee la respuesta, te muestra una vista previa en una hoja A4 y crea el archivo .docx en tu propio equipo.
              </li>
            </ol>
            <p>
              Si prefieres que tu IA te entregue el Word directamente (algunos asistentes pueden crear archivos), también puedes pedírselo. Pasar por esta página tiene una ventaja: ves la vista previa, lees las recomendaciones de la IA y el archivo siempre sale con el mismo formato apto para ATS.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="ats">Qué es un ATS y cómo filtra hojas de vida</h2>
            <p>
              Un ATS (<em>Applicant Tracking System</em>, «sistema de seguimiento de candidatos») es el programa que muchas empresas usan para recibir, ordenar y buscar entre las postulaciones que llegan por sus portales o por las bolsas de empleo. No existe un único ATS: cada uno funciona distinto y cada empresa lo configura a su manera.
            </p>
            <h3>Qué hace con tu archivo</h3>
            <p>
              Cuando subes tu hoja de vida, el sistema extrae el texto y lo reparte en campos: nombre, contacto, trabajos, estudios y habilidades. Si el archivo tiene columnas, tablas o cuadros de texto, la extracción puede mezclar el orden de las líneas o dejar partes sin leer, y entonces tu información llega incompleta a quien recluta.
            </p>
            <h3>Cómo lo usa quien recluta</h3>
            <p>
              Con esos campos, el equipo de selección puede buscar por palabras clave («Excel», «atención al cliente»), filtrar por requisitos y, en algunos sistemas, ver una comparación con lo que pide la oferta. Pero al final una persona lee tu hoja de vida. Por eso conviene que sea clara para las dos audiencias: legible para una máquina y convincente para un humano.
            </p>
            <h3>Un mito frecuente</h3>
            <p>
              Circulan cifras muy repetidas sobre el porcentaje de hojas de vida que «el robot rechaza». No las usamos: no encontramos una fuente confiable que las respalde, y lo que ocurre depende de cada empresa. Lo prudente es cuidar lo que sí controlas: formato legible, palabras clave verdaderas y contenido claro.
            </p>

            <h2 id="harvard">El formato Harvard: qué es y cómo lo aplica esta herramienta</h2>
            <p>
              «Formato Harvard» es el nombre popular de un estilo clásico de hoja de vida: sobrio, en orden cronológico inverso y con viñetas que empiezan con verbos de acción. Se apoya en las recomendaciones del centro de carreras de Harvard College para armar un currículum (consultadas el 25 de septiembre de 2026, ver «Fuentes»). No es un formato oficial ni obligatorio: es una guía de buenas prácticas.
            </p>
            <Tabla
              resumen="Recomendaciones de la guía de Harvard College y cómo las aplica el prompt"
              columnas={["Recomendación", "Cómo la aplica el prompt"]}
              filas={[
                ["Secciones por orden de importancia y en orden cronológico inverso", "Educación primero si tienes poca experiencia; experiencia primero si tienes más. Lo más reciente, arriba."],
                ["Viñetas con verbos de acción y resultados cuantificables", "Cada viñeta empieza con un verbo y usa solo las cifras que tú entregaste."],
                ["Sin pronombres personales («yo», «nosotros»)", "El prompt lo prohíbe y lo revisa en su autoverificación."],
                ["Sin foto, edad ni género", "El prompt pide no incluirlos; solo ciudad y país."],
                ["Formato coherente en fechas y estilos", "Un único formato de fechas; negritas para la institución y cursivas para el cargo."],
                ["No empezar líneas con fechas", "La fecha va a la derecha de la línea del cargo."],
              ]}
            />

            <h2 id="errores">Errores que hacen fallar a un ATS</h2>
            <p>Son problemas de formato, no de talento, y se evitan fácilmente:</p>
            <Tabla
              resumen="Errores frecuentes de formato, por qué son un problema y qué hacer"
              columnas={["Error", "Por qué es un problema", "Qué hacer"]}
              filas={[
                ["Poner el contacto en el encabezado o pie de página de Word", "Algunos sistemas no leen esas zonas y pierden tu correo o tu teléfono.", "Ponlo al inicio del cuerpo del documento, como hace este Word."],
                ["Usar dos columnas, tablas o cuadros de texto", "El lector automático puede mezclar el orden de las líneas o saltarse el contenido.", "Una sola columna, de arriba abajo."],
                ["Encabezados «creativos» («Mi historia», «Lo que sé hacer»)", "El sistema busca secciones conocidas: experiencia, educación, habilidades.", "Usa los encabezados estándar."],
                ["Subir el CV como imagen o PDF escaneado", "No tiene texto que leer.", "Entrega un Word o un PDF con texto real."],
                ["Iconos, gráficos y barras de nivel de habilidades", "No son texto y no dicen nada concreto.", "Escribe la habilidad y su nivel con palabras."],
                ["Describir tareas sin resultados", "«Encargado de redes sociales» no dice si lo hiciste bien.", "Cuenta qué lograste y, si tienes el dato real, con cuánta magnitud."],
                ["Llenar el CV de palabras clave que no tienes", "Una entrevista lo deja en evidencia y pierdes credibilidad.", "Usa solo las que de verdad dominas."],
                ["Enviar el mismo CV a todas las ofertas", "Las palabras clave y las prioridades cambian de una vacante a otra.", "Cambia la oferta en el formulario y genera una versión para cada puesto."],
                ["Abreviaturas o siglas sin explicar", "La oferta puede buscar «Search Engine Optimization» y tú escribiste solo «SEO» (o al revés).", "La primera vez, forma completa y sigla entre paréntesis."],
              ]}
            />

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt que se arma a la derecha no es un texto genérico: tiene ocho bloques, y cada uno resuelve un problema típico de pedirle un CV a una IA.</p>
            <Tabla resumen="Bloques del prompt y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PROMPT_PARTES} primeraColumnaEnNegrita />
            <p>
              Lo más importante es la regla de honestidad: el prompt le indica a la IA que use solo tus datos, que deje fuera lo que no aparece y que anote en las recomendaciones las brechas y las preguntas. Así ves qué te falta en lugar de recibir un CV bonito con datos inventados.
            </p>

            <Anuncio posicion="medio" />

            <h2 id="vinetas">Cómo escribir viñetas con verbos de acción</h2>
            <p>
              Una buena viñeta responde cuatro preguntas: <strong>qué hiciste</strong> (verbo de acción), <strong>sobre qué</strong>, <strong>cómo o con qué</strong> y <strong>qué resultó</strong>. Empieza con un verbo en pasado (o en presente si el trabajo continúa) y ocupa una o dos líneas. Estos son ejemplos ficticios de cómo pasar de una tarea a un logro:
            </p>
            <Tabla
              resumen="Ejemplos ficticios de viñetas débiles y viñetas buenas"
              columnas={["Débil", "Mejor (ejemplo ficticio)", "Por qué mejora"]}
              filas={[
                ["Encargada de las redes sociales.", "Programé y publiqué contenido para 6 cuentas de clientes en Instagram y Facebook.", "Verbo, alcance y tu parte concreta."],
                ["Responsable de los reportes.", "Reduje el tiempo de armado del reporte semanal de 4 horas a 1 hora al automatizarlo con hojas de cálculo.", "Resultado medible y herramienta."],
                ["Escribía artículos para el blog.", "Publiqué y optimicé 24 artículos con investigación de palabras clave, y las visitas orgánicas subieron de 3.200 a 5.900 al mes.", "Volumen, método y efecto."],
                ["Trabajo en equipo y proactividad.", "Coordiné con diseño y ventas el calendario de campañas mensuales, y cumplimos todas las fechas de lanzamiento.", "Un hecho en lugar de un adjetivo."],
                ["Hice muchas cosas en el almacén.", "Controlé el ingreso y la salida de 300 productos con una hoja de inventario, lo que redujo los faltantes.", "Cifra y resultado."],
              ]}
            />
            <p className="text-sm text-muted-foreground">Las cifras son inventadas para ilustrar. Si no tienes un número real, escribe el resultado sin número: es mejor eso que inventarlo.</p>
            <p>
              Si quieres más verbos, revisa el artículo <Link href="/carrera-y-empleo/verbos-de-accion-para-cv">verbos de acción para tu hoja de vida</Link>, con listas por área de trabajo.
            </p>

            <h2 id="oferta">Cómo adaptar tu CV a cada oferta</h2>
            <ol>
              <li>Pega el texto de la oferta en el formulario. Es la fuente de las palabras clave.</li>
              <li>Lee las funciones y los requisitos y subraya lo que también hiciste tú, con las palabras del aviso (si dice «gestión de inventarios», usa esa frase y no «control de cosas»).</li>
              <li>Revisa las recomendaciones que devuelve la IA: te dirá qué palabras clave cubrió y cuáles no pudo cubrir por falta de datos.</li>
              <li>Si de verdad tienes esa experiencia y no la habías escrito, agrégala en el formulario y vuelve a generar. Si no la tienes, no la pongas.</li>
              <li>Guarda un archivo por vacante: cambia solo la oferta y el puesto, y el resto de tus datos ya quedó guardado en tu navegador.</li>
            </ol>
            <Tabla
              resumen="Ejemplos de cómo usar (o no) un requisito de una oferta"
              columnas={["La oferta dice", "Si lo has hecho", "Si no lo has hecho"]}
              filas={[
                ["Excel intermedio", "Escribe qué sabes usar: «Excel intermedio: tablas dinámicas, BUSCARV y gráficos».", "No escribas «avanzado». Menciona lo que sí sabes."],
                ["Atención al cliente", "Una viñeta con cuántos clientes atendías y por qué canal.", "No lo pongas como habilidad suelta; cuenta un caso parecido real, como una práctica o un voluntariado."],
                ["Manejo de SAP (deseable)", "Indica el módulo que usaste.", "No lo agregues: es deseable y te lo preguntarían en la entrevista. Menciónalo en la carta si lo estás aprendiendo."],
              ]}
            />
            <p>
              Para profundizar, lee <Link href="/carrera-y-empleo/palabras-clave-cv-oferta-laboral">cómo encontrar las palabras clave de una oferta laboral y usarlas sin mentir</Link>.
            </p>

            <h2 id="perfiles">Ejemplos de perfil profesional por nivel</h2>
            <p>El perfil son dos o tres líneas al inicio del CV: quién eres profesionalmente, qué evidencia tienes y qué buscas. Ejemplos ficticios:</p>
            <h3>Sin experiencia laboral</h3>
            <blockquote>
              <p>
                «Egresada de Ingeniería Industrial con formación en control de inventarios y Excel intermedio. Organizó y registró donaciones semanales como voluntaria y propuso la reorganización de un almacén en su tesis. Busca una práctica de logística en Arequipa para aplicar sus conocimientos en un almacén real.»
              </p>
            </blockquote>
            <p>
              <strong>Por qué funciona:</strong> nombra la carrera, da dos hechos comprobables y dice el objetivo concreto. No usa adjetivos vacíos.
            </p>
            <h3>Junior</h3>
            <blockquote>
              <p>
                «Desarrollador Full Stack junior con 2 años de experiencia (incluidas prácticas) en aplicaciones web con React, Node.js y PostgreSQL. Diseña APIs REST, optimiza consultas y escribe pruebas automatizadas con Jest. Busca sumar su experiencia en JavaScript y Docker a un equipo de producto.»
              </p>
            </blockquote>
            <p>
              <strong>Por qué funciona:</strong> lleva las herramientas que suele pedir una oferta técnica, dice cuánta experiencia tiene con honestidad (aclara que incluye prácticas) y termina con lo que quiere aportar.
            </p>
            <h3>Senior</h3>
            <blockquote>
              <p>
                «Gerente de operaciones con más de 15 años de experiencia en producción, logística y mantenimiento, con 12 años en cargos de jefatura y gerencia. Ha liderado equipos de hasta 120 personas y un presupuesto anual de 8 millones de soles, y reducido costos con mejora continua Lean. MBA e ingeniero industrial.»
              </p>
            </blockquote>
            <p>
              <strong>Por qué funciona:</strong> resume alcance (personas y presupuesto), método (Lean) y formación, que es lo que se busca en un cargo de gerencia. Las cifras de estos ejemplos son ficticias.
            </p>
            <p>
              Si aún no tienes experiencia, lee también <Link href="/carrera-y-empleo/cv-sin-experiencia">cómo hacer un CV sin experiencia laboral</Link>.
            </p>

            <h2 id="ejemplo">Ejemplo de resultado</h2>
            <p>
              Así se ve una hoja de vida en este formato. Es un <strong>ejemplo ilustrativo</strong>: la persona, las empresas y las cifras son ficticias y el texto lo escribió el autor del sitio para mostrar el formato; no es una respuesta real de una IA ni un caso real. Puedes ver este y otros tres perfiles con el botón «Llenar con datos de ejemplo» de la herramienta.
            </p>
          </article>

          <div className="not-prose my-8">
            <p className="mb-3 inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · datos ficticios</p>
            <VistaCv cv={ejemplo.documento} etiqueta="Ejemplo ilustrativo de hoja de vida en formato Harvard, con datos ficticios" />
          </div>

          <article className={PROSE}>
            <h2 id="checklist">Lista de revisión antes de enviar</h2>
            <p>La IA te da una primera versión; esta lista es tu revisión final:</p>
            <ul className="not-prose my-4 space-y-2">
              {CHECKLIST.map((c) => (
                <li key={c} className="tarjeta flex gap-3 p-3 text-sm">
                  <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border border-brand-solid text-xs text-brand">
                    ✓
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            <h2 id="limites">Límites y verificación humana</h2>
            <ul>
              <li>
                <strong>No garantiza una entrevista.</strong> Ni esta herramienta ni ninguna otra puede prometerlo. Te ayuda a presentar bien lo que ya eres.
              </li>
              <li>
                <strong>La IA puede equivocarse o inventar.</strong> El prompt lo intenta evitar, pero tú debes revisar nombres, fechas, cifras y cargos.
              </li>
              <li>
                <strong>Cada país y sector tiene sus costumbres</strong> (por ejemplo, sobre la foto, los datos personales o la extensión). En Perú se le suele llamar «hoja de vida»; en otros países, «currículum» o «CV». Ajusta el resultado a las costumbres del lugar donde postulas.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El generador de prompts y la creación del Word se prueban automáticamente con datos ficticios (incluida la comprobación de que el .docx no lleva tablas ni imágenes). La calidad de la respuesta de cada asistente de IA no la controlamos: por eso existen la vista previa y las recomendaciones. Conoce más sobre el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="mt-4 divide-y tarjeta">
            {PREGUNTAS_CV.map((p) => (
              <details key={p.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {p.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {p.a}
                  {p.q.includes("datos personales") && (
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

          <section aria-labelledby="relacionados" className="mt-12">
            <h2 id="relacionados" className="text-xl font-semibold">
              Artículos relacionados
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {relacionados.map((a) => (
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
                (Mignone Center for Career Success, Harvard FAS). Consultada el 25 de septiembre de 2026. De aquí salen las recomendaciones sobre orden, viñetas con verbos de acción, cifras y elementos que evitar.
              </li>
              <li>Las explicaciones sobre el funcionamiento general de un ATS son orientativas: cada sistema y cada empresa lo configuran de forma distinta.</li>
              <li>Todos los ejemplos (personas, empresas, ofertas y cifras) son ficticios y de elaboración propia.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
