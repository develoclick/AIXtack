import Link from "next/link";
import type { ReactNode } from "react";
import { Anuncio } from "@/components/ads/anuncio";
import { Tabla } from "@/components/shared/tabla";
import { RUTA_CV } from "@/content/prompts";

const HARVARD_GUIA = "https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/";

function EnlaceExterno({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function Fuentes({ children }: { children: ReactNode }) {
  return (
    <>
      <h2 id="fuentes">Fuentes y verificación</h2>
      <ul>{children}</ul>
    </>
  );
}

function PreguntaFrecuente({ q, children }: { q: string; children: ReactNode }) {
  return (
    <>
      <h3>{q}</h3>
      <p>{children}</p>
    </>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */

export function CuerpoPalabrasClave() {
  return (
    <>
      <p>
        Las palabras clave son las palabras y frases que una empresa usa en su oferta para describir lo que busca. En Perú y en el resto de Latinoamérica, esas ofertas suelen publicarse en portales de empleo como Computrabajo, Bumeran o LinkedIn, o llegar por correo, y casi siempre se responden con una hoja de vida.</p>
      <p>
        Si las sacas bien y las usas solo cuando de verdad las tienes, tu hoja de vida se parece más a lo que la persona que recluta está buscando, y también es más fácil de encontrar en los sistemas que ordenan las postulaciones. Este artículo es para quien ya tiene una oferta delante y quiere saber, paso a paso, qué copiar de ella, qué dejar fuera y dónde poner cada cosa.
      </p>

      <h2 id="que-es">Qué es una palabra clave en una oferta</h2>
      <p>
        Una palabra clave es cualquier término concreto que la oferta usa para describir el trabajo o a la persona que lo hará. No son solo palabras sueltas: muchas veces son frases de dos o tres palabras, como «atención al cliente», «control de inventarios» o «análisis de datos». Suelen caer en cuatro grupos:
      </p>
      <ul>
        <li>
          <strong>Habilidades técnicas o del oficio:</strong> lo que sabes hacer (por ejemplo, «facturación electrónica», «SEO», «programación de rutas»).
        </li>
        <li>
          <strong>Herramientas y programas:</strong> lo que sabes usar (Excel, SAP, Google Analytics, AutoCAD, React).
        </li>
        <li>
          <strong>Formación y requisitos formales:</strong> títulos, certificaciones, licencias, años de experiencia.
        </li>
        <li>
          <strong>Habilidades personales:</strong> comunicación, trabajo en equipo, liderazgo. Estas se usan con cuidado: solo tienen valor cuando las respaldas con un hecho.
        </li>
      </ul>
      <p>
        Los sistemas de seguimiento de candidatos (ATS) permiten a quien recluta buscar y filtrar entre las postulaciones, y muchas empresas los configuran con los términos de la oferta. No todos funcionan igual, y al final una persona lee tu hoja de vida. Por eso conviene escribirla para las dos audiencias: con las palabras de la oferta y con contenido que se entienda al primer vistazo.
      </p>

      <h2 id="paso-a-paso">Cómo sacarlas, paso a paso</h2>
      <ol>
        <li>
          <strong>Lee toda la oferta una vez sin subrayar.</strong> Primero entiende qué puesto es y en qué sector. Muchas ofertas mezclan funciones del puesto, requisitos y beneficios de la empresa; solo los dos primeros te sirven para esto.
        </li>
        <li>
          <strong>Separa tres bloques:</strong> funciones (lo que harás), requisitos obligatorios y requisitos deseables. Lo que aparece como obligatorio o se repite pesa más que lo que se menciona una sola vez.
        </li>
        <li>
          <strong>Subraya sustantivos y verbos concretos.</strong> «Elaborar reportes mensuales» te da el verbo (elaborar) y la frase (reportes mensuales). «Buena actitud» no te da nada que puedas demostrar.
        </li>
        <li>
          <strong>Agrúpalas por tipo</strong> (técnicas, herramientas, formación, personales) en una lista aparte. Verás rápido cuáles se repiten.
        </li>
        <li>
          <strong>Compara con tu historia.</strong> Para cada palabra pregúntate: «¿Lo he hecho o usado de verdad? ¿Puedo contar un ejemplo?». Si la respuesta es sí, va; si es no, se queda fuera.
        </li>
        <li>
          <strong>Decide dónde va cada una</strong> (perfil, viñetas de experiencia, habilidades o certificaciones) y escríbela con las mismas palabras de la oferta.
        </li>
      </ol>

      <Anuncio posicion="intro" />

      <h2 id="ejemplo">Ejemplo trabajado</h2>
      <p>
        Este es un fragmento de una oferta inventada para ilustrar el método (la empresa y las cifras no existen):
      </p>
      <blockquote>
        <p>
          «Buscamos asistente administrativo/a para una distribuidora en Trujillo. Funciones: registrar facturas en el sistema, elaborar reportes mensuales de compras en Excel, coordinar pedidos con proveedores y atender llamadas. Requisitos: Excel intermedio, experiencia de 1 año en un puesto similar, orden y responsabilidad. Deseable: conocimiento de SAP.»
        </p>
      </blockquote>
      <Tabla
        resumen="Palabras clave extraídas de la oferta de ejemplo y qué hacer con cada una"
        columnas={["Palabra clave", "Tipo", "Si la tienes", "Si no la tienes"]}
        filas={[
          ["Registrar facturas", "Función", "Viñeta: «Registré 60 facturas semanales en el sistema contable sin errores de digitación».", "No la escribas; puedes mencionar tareas parecidas que sí hiciste."],
          ["Reportes mensuales en Excel", "Función y herramienta", "Viñeta con el reporte y la herramienta: «Elaboré reportes mensuales de compras en Excel con tablas dinámicas».", "Si haces reportes en otra herramienta, dilo tal cual."],
          ["Coordinar pedidos con proveedores", "Función", "Viñeta con cuántos proveedores y qué lograste.", "Omítela; no la reemplaces por «buena comunicación»."],
          ["Excel intermedio", "Herramienta", "En habilidades: «Excel intermedio: tablas dinámicas, BUSCARV y gráficos».", "No escribas «avanzado» si no lo es."],
          ["SAP (deseable)", "Herramienta", "En habilidades, con el módulo que conoces.", "No la agregues: es deseable, no obligatoria, y una entrevista te lo preguntaría."],
          ["Orden y responsabilidad", "Personal", "Muéstralas con hechos: «Cerré el inventario mensual sin faltantes durante 6 meses».", "No las escribas como adjetivos sueltos."],
        ]}
      />
      <p>
        Fíjate en dos cosas: las palabras de la oferta se copian tal cual cuando son ciertas (por eso «reportes mensuales en Excel» y no «informes con hojas de cálculo»), y las habilidades personales solo entran si van acompañadas de un hecho.
      </p>

      <h2 id="donde">Dónde ponerlas en tu CV</h2>
      <ul>
        <li>
          <strong>Perfil profesional (2 a 3 líneas):</strong> el puesto al que apuntas, tu nivel y dos o tres términos centrales de la oferta que de verdad te representan.
        </li>
        <li>
          <strong>Viñetas de experiencia:</strong> es el mejor lugar. Una palabra clave dentro de una viñeta con resultado vale más que la misma palabra en una lista, porque demuestra que la aplicaste.
        </li>
        <li>
          <strong>Habilidades:</strong> herramientas, programas y técnicas, agrupadas por tipo. Ideal para las siglas y los nombres de software.
        </li>
        <li>
          <strong>Educación y certificaciones:</strong> títulos y cursos con el nombre completo, tal como aparece en el certificado.
        </li>
      </ul>
      <p>
        Usa los encabezados habituales («Experiencia profesional», «Educación», «Habilidades»): los sistemas y las personas los reconocen enseguida. Si quieres ver cómo se ve esto en una hoja completa, prueba la <Link href={RUTA_CV}>herramienta para crear tu CV</Link> con datos de ejemplo.
      </p>

      <Anuncio posicion="medio" />

      <h2 id="sin-mentir">Cómo usarlas sin mentir ni exagerar</h2>
      <p>
        La regla es sencilla: <strong>cada palabra clave debe corresponder a algo que hiciste y puedas explicar en una entrevista.</strong> Adaptar tu CV no es cambiar tu historia, es elegir qué partes de tu historia mostrar primero y con qué palabras.
      </p>
      <ul>
        <li>
          <strong>Copia el lenguaje, no la experiencia.</strong> Si hiciste «ventas por teléfono» y la oferta dice «televentas», puedes usar «televentas» porque es lo mismo. Si nunca vendiste, no lo pongas.
        </li>
        <li>
          <strong>No infles el nivel.</strong> «Excel intermedio» que se convierte en «avanzado» solo porque la oferta lo pide te va a poner en aprietos en la primera prueba técnica.
        </li>
        <li>
          <strong>No repitas la misma palabra veinte veces.</strong> Llenar el CV de términos («relleno de palabras clave») lo vuelve ilegible para la persona que lo lee y no lo hace más convincente.
        </li>
        <li>
          <strong>No escondas texto</strong> (por ejemplo, palabras en blanco sobre fondo blanco). Es una práctica engañosa que puede detectarse y que descalifica.
        </li>
        <li>
          <strong>Si te falta algo importante, no lo disimules:</strong> aprende esa habilidad, hazlo saber en la carta de presentación o postula a otro puesto que encaje mejor contigo.
        </li>
      </ul>

      <h2 id="variantes">Siglas, sinónimos e idioma</h2>
      <p>
        Una oferta puede decir «Search Engine Optimization» y otra «SEO»; una puede pedir «gestión de inventarios» y otra «control de stock». Para cubrir ambas, la primera vez escribe la forma completa y la sigla entre paréntesis: «Search Engine Optimization (SEO)». Con los sinónimos, elige el que usa la oferta a la que postulas.
      </p>
      <p>
        También cuenta el idioma. Si la oferta está en español, escribe tu CV en español (aunque los nombres de programas se mantienen: Excel, Power BI). Si está en inglés, escríbelo en inglés. Y cuida la ortografía: «gerencia» y «gerensia» no son la misma palabra para un buscador.
      </p>

      <h2 id="errores">Errores frecuentes</h2>
      <Tabla
        resumen="Errores frecuentes al usar palabras clave y su corrección"
        columnas={["Error", "Por qué falla", "Qué hacer"]}
        filas={[
          ["Copiar toda la oferta dentro del CV", "Se nota y no cuenta qué hiciste tú.", "Toma solo los términos que respaldas con hechos."],
          ["Usar solo adjetivos («dinámico», «proactivo»)", "No se pueden comprobar.", "Cambia el adjetivo por un ejemplo concreto."],
          ["Poner palabras clave en una lista y nada más", "No demuestras que las aplicaste.", "Llévalas también a las viñetas de experiencia."],
          ["Cambiar los cargos por los de la oferta", "Un cargo falso se descubre al verificar referencias.", "Deja el cargo real; describe las funciones con las palabras de la oferta."],
          ["Olvidar las siglas o su forma completa", "Pierdes coincidencias con una u otra forma.", "Forma completa más sigla entre paréntesis la primera vez."],
        ]}
      />

      <h2 id="preguntas">Preguntas frecuentes</h2>
      <PreguntaFrecuente q="¿Cuántas palabras clave debo usar?">
        No hay un número mágico y depende de cada oferta. Usa todas las que de verdad tengas y que aparezcan como requisito importante, repartidas por todo el documento y no concentradas en un solo lugar.
      </PreguntaFrecuente>
      <PreguntaFrecuente q="¿Debo cambiar mi CV para cada oferta?">
        Conviene ajustar el perfil, el orden de las viñetas y las habilidades que se destacan. No hace falta rehacerlo desde cero: guarda una versión base y adáptala. En la <Link href={RUTA_CV}>herramienta del CV</Link> basta con cambiar la oferta y volver a generar el prompt.
      </PreguntaFrecuente>
      <PreguntaFrecuente q="¿Sirve poner las palabras clave en la carta de presentación?">
        Sí, pero cuenta sobre todo tu hoja de vida. La carta es un buen lugar para explicar una brecha (por ejemplo, una herramienta que estás aprendiendo) con honestidad.
      </PreguntaFrecuente>

      <Fuentes>
        <li>
          <EnlaceExterno href={HARVARD_GUIA}>Harvard College Guide to Creating a Strong Resume</EnlaceExterno> (Mignone Center for Career Success, Harvard FAS): recomienda adaptar la hoja de vida al tipo de puesto al que se postula y usar verbos de acción. Consultada el 25 de septiembre de 2026.
        </li>
        <li>La oferta laboral y las cifras del ejemplo son inventadas para ilustrar el método. El funcionamiento de un ATS varía según el sistema y la empresa.</li>
      </Fuentes>
    </>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */

const AREAS_VERBOS: { area: string; verbos: string; ejemplo: string }[] = [
  { area: "Liderazgo y gestión", verbos: "dirigí, lideré, coordiné, supervisé, organicé, planifiqué, capacité, delegué, gestioné", ejemplo: "Coordiné a un equipo de 6 personas en el cierre mensual, y entregamos los reportes con dos días de anticipación." },
  { area: "Análisis y datos", verbos: "analicé, evalué, comparé, identifiqué, medí, proyecté, modelé, diagnostiqué, auditué", ejemplo: "Analicé las ventas de 12 meses por canal e identifiqué los tres productos con mayor devolución." },
  { area: "Ventas y atención al cliente", verbos: "vendí, negocié, atendí, capté, fidelicé, resolví, asesoré, cerré, renové", ejemplo: "Atendí 40 consultas diarias por chat y teléfono, y resolví la mayoría en el primer contacto." },
  { area: "Comunicación y marketing", verbos: "redacté, publiqué, diseñé, promoví, presenté, difundí, edité, produje, lancé", ejemplo: "Redacté y publiqué 12 artículos al mes para el blog de la tienda." },
  { area: "Tecnología y desarrollo", verbos: "desarrollé, implementé, automaticé, integré, optimicé, migré, documenté, depuré, desplegué", ejemplo: "Automaticé la carga de pedidos con un script en Python, que redujo el trabajo manual de 3 horas a 20 minutos." },
  { area: "Operaciones y logística", verbos: "reduje, mejoré, estandaricé, controlé, distribuí, almacené, programé, inspeccioné, abastecí", ejemplo: "Estandaricé el registro de entradas y salidas del almacén y reduje los faltantes mensuales." },
  { area: "Finanzas y administración", verbos: "registré, concilié, presupuesté, facturé, liquidé, archivé, tramité, declaré, cobré", ejemplo: "Concilié cada semana las cuentas en soles y en dólares de una empresa de Lima y detecté diferencias antes del cierre contable." },
  { area: "Educación y capacitación", verbos: "enseñé, diseñé (cursos), evalué, tutoricé, orienté, facilité, preparé, acompañé, retroalimenté", ejemplo: "Diseñé y dicté un taller de Excel para 25 personas del área comercial." },
];

export function CuerpoVerbosDeAccion() {
  return (
    <>
      <p>
        Una viñeta que empieza con un verbo de acción dice de inmediato qué hiciste. Este artículo reúne verbos en español organizados por área de trabajo, explica cuáles evitar, cómo elegir el que refleja tu nivel de responsabilidad sin exagerarlo y muestra viñetas antes y después. Sirve si estás armando tu hoja de vida o si quieres pulir la que ya tienes.
      </p>

      <h2 id="por-que">Por qué empezar cada viñeta con un verbo</h2>
      <p>
        La guía de hojas de vida del centro de carreras de Harvard College recomienda empezar las viñetas con verbos de acción, incluir resultados que se puedan medir cuando existan y evitar los pronombres personales. La razón práctica es que quien recluta revisa muchas hojas de vida en poco tiempo: un verbo al inicio le permite entender la acción en una sola mirada, y le deja claro que hablas de lo que hiciste tú y no de lo que «se hacía» en el área.
      </p>
      <p>
        Compara «Responsable de reportes de ventas» con «Elaboré reportes semanales de ventas en Excel para la gerencia». La primera describe un cargo; la segunda describe un hecho. Además, el verbo suele traer consigo las palabras clave que la oferta también usa (elaborar, coordinar, atender), y eso ayuda a que tu documento coincida con lo que buscan. En el artículo sobre <Link href="/carrera-y-empleo/palabras-clave-cv-oferta-laboral">palabras clave de una oferta laboral</Link> explicamos cómo sacarlas.
      </p>

      <h2 id="formula">La fórmula de una buena viñeta</h2>
      <p>
        Una viñeta sólida suele responder cuatro preguntas, en este orden:
      </p>
      <ol>
        <li>
          <strong>Verbo de acción:</strong> qué hiciste (elaboré, coordiné, reduje…).
        </li>
        <li>
          <strong>Qué:</strong> el objeto de la acción (los reportes, el inventario, un equipo).
        </li>
        <li>
          <strong>Cómo o con qué:</strong> la herramienta, el método o el alcance (en Excel, con tablas dinámicas, para 6 sucursales).
        </li>
        <li>
          <strong>Resultado:</strong> qué cambió gracias a eso (más rápido, más barato, sin errores, más clientes). Si no tienes una cifra real, describe el resultado sin número: es mejor eso que inventarlo.
        </li>
      </ol>
      <p>Mantén cada viñeta en una o dos líneas. Si necesitas más espacio, probablemente son dos logros distintos.</p>

      <Anuncio posicion="intro" />

      <h2 id="por-area">Verbos por área de trabajo</h2>
      <p>
        Las listas están en primera persona del pasado, la forma más habitual en una hoja de vida en español latinoamericano (en Perú se dice «hoja de vida»; en México o Chile es más común «currículum»). Adáptalas al tiempo verbal de cada trabajo, como explicamos más abajo.
      </p>
      {AREAS_VERBOS.map((a) => (
        <div key={a.area}>
          <h3>{a.area}</h3>
          <p>
            <strong>Verbos:</strong> {a.verbos}.
          </p>
          <p>
            <strong>Ejemplo (ficticio):</strong> «{a.ejemplo}»
          </p>
        </div>
      ))}
      <p className="text-sm text-muted-foreground">Los ejemplos y sus cifras son inventados para ilustrar la forma de redactar; en tu CV solo deben aparecer hechos y números reales.</p>

      <h2 id="debiles">Verbos débiles y con qué reemplazarlos</h2>
      <p>
        Algunos verbos y expresiones no dicen qué hiciste realmente. No están prohibidos, pero casi siempre hay una opción más precisa:
      </p>
      <Tabla
        resumen="Verbos débiles y alternativas más precisas"
        columnas={["Débil", "Por qué se queda corto", "Alternativas más precisas"]}
        filas={[
          ["Ayudé a…", "No aclara cuál fue tu parte.", "Apoyé con [tarea concreta], elaboré, registré, preparé"],
          ["Participé en…", "Puede significar desde asistir hasta dirigir.", "Colaboré en [tarea], ejecuté, contribuí con [resultado]"],
          ["Encargado de… / Responsable de…", "Describe un cargo, no una acción.", "Gestioné, controlé, administré, supervisé"],
          ["Realicé tareas de…", "Es genérico.", "Un verbo específico: registré, atendí, verifiqué, programé"],
          ["Trabajé con…", "No dice para qué.", "Utilicé [herramienta] para [propósito], integré, configuré"],
        ]}
      />

      <h2 id="nivel">Cómo elegir el verbo según tu nivel</h2>
      <p>
        El verbo comunica cuánta responsabilidad tuviste. Elegir uno más alto que la realidad puede jugar en tu contra en la entrevista, porque te pedirán detalles. Una escala prudente:
      </p>
      <ul>
        <li>
          <strong>Apoyo:</strong> apoyé, asistí, colaboré, registré. Es honesto y perfectamente válido al inicio de tu carrera.
        </li>
        <li>
          <strong>Ejecución:</strong> elaboré, atendí, desarrollé, redacté, verifiqué. Hiciste el trabajo de principio a fin.
        </li>
        <li>
          <strong>Mejora:</strong> optimicé, reduje, automaticé, estandaricé. Cambiaste cómo se hacía algo y hubo un resultado.
        </li>
        <li>
          <strong>Coordinación y liderazgo:</strong> coordiné, supervisé, dirigí, capacité. Decidiste o guiaste el trabajo de otras personas.
        </li>
      </ul>
      <p>
        Regla útil: usa «lideré» o «dirigí» solo si tenías personas a tu cargo o tomabas decisiones que otros seguían. Si coordinaste una tarea pero no eras la jefa o el jefe, «coordiné» es el verbo correcto.
      </p>

      <Anuncio posicion="medio" />

      <h2 id="tiempos">Tiempos verbales y persona</h2>
      <ul>
        <li>
          <strong>Trabajos terminados:</strong> pasado («elaboré», «coordiné»).
        </li>
        <li>
          <strong>Trabajo actual:</strong> presente («elaboro», «coordino») para lo que sigues haciendo, y pasado para logros ya conseguidos.
        </li>
        <li>
          <strong>Persona:</strong> primera persona del singular (yo) sin escribir «yo», o forma neutra con infinitivo («elaborar reportes…»). Cualquiera de las dos sirve; lo importante es no mezclarlas en el mismo documento.
        </li>
        <li>
          <strong>Sin pronombres:</strong> evita «yo», «nosotros» o «mi equipo y yo». Si el logro fue de equipo, di cuál fue tu parte.
        </li>
      </ul>

      <h2 id="ejemplos">Viñetas antes y después</h2>
      <Tabla
        resumen="Ejemplos ficticios de viñetas débiles y viñetas mejoradas"
        columnas={["Antes", "Después (ejemplo ficticio)", "Qué mejoró"]}
        filas={[
          ["Encargado de atención al cliente.", "Atendí 40 consultas diarias por chat y teléfono, y resolví la mayoría en el primer contacto.", "Verbo, volumen y resultado."],
          ["Ayudé con las redes sociales.", "Programé y publiqué 20 publicaciones al mes en Instagram y Facebook para 3 marcas.", "Tu parte concreta y el alcance."],
          ["Hice reportes de inventario.", "Elaboré reportes semanales de inventario en Excel con tablas dinámicas, que detectaron productos sin rotación.", "Herramienta y resultado."],
          ["Trabajo en equipo y buena comunicación.", "Coordiné con ventas y diseño la entrega de un catálogo, y cumplimos la fecha del lanzamiento.", "Un hecho en lugar de un adjetivo."],
          ["Participé en un proyecto de mejora.", "Propuse una nueva distribución del almacén que redujo el tiempo de búsqueda de pedidos.", "Tu aporte y su efecto."],
        ]}
      />
      <p>
        Prueba tú misma o tú mismo: toma tus tres tareas más importantes y pásalas por la fórmula (verbo, qué, cómo, resultado). Si prefieres que un asistente de IA te proponga el borrador a partir de tus datos, la <Link href={RUTA_CV}>herramienta del CV</Link> arma el prompt por ti y te pide que no invente cifras.
      </p>

      <h2 id="preguntas">Preguntas frecuentes</h2>
      <PreguntaFrecuente q="¿Puedo repetir el mismo verbo en varias viñetas?">
        Es mejor variar: si tres viñetas seguidas empiezan con «realicé», el texto se vuelve monótono. Usa las listas de este artículo para alternar sin perder precisión.
      </PreguntaFrecuente>
      <PreguntaFrecuente q="¿Y si no tengo cifras para mis logros?">
        Escribe el resultado sin número («redujo los errores de digitación», «entregué los reportes a tiempo»). No inventes porcentajes: en una entrevista te pedirán de dónde salen.
      </PreguntaFrecuente>
      <PreguntaFrecuente q="¿Se escribe en pasado aunque siga en el trabajo?">
        Para lo que sigues haciendo usa el presente; para logros ya cerrados, el pasado. Lo importante es que dentro de cada trabajo el criterio sea coherente.
      </PreguntaFrecuente>

      <Fuentes>
        <li>
          <EnlaceExterno href={HARVARD_GUIA}>Harvard College Guide to Creating a Strong Resume</EnlaceExterno> (Mignone Center for Career Success, Harvard FAS): recomienda usar verbos de acción, incluir resultados cuantificables y evitar pronombres personales. Consultada el 25 de septiembre de 2026.
        </li>
        <li>Las listas de verbos y los ejemplos con cifras son de elaboración propia; los números son ficticios.</li>
      </Fuentes>
    </>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */

export function CuerpoCvSinExperiencia() {
  return (
    <>
      <p>
        No tener un empleo formal no significa no tener nada que contar. Este artículo es para estudiantes, recién egresados y personas que buscan su primer trabajo: te muestra qué cuenta como experiencia, cómo ordenar tu hoja de vida, cómo escribir el perfil y las viñetas, y qué dejar fuera. Al final tendrás una estructura que puedes completar con tus propios datos.
      </p>

      <h2 id="que-cuenta">Qué cuenta como experiencia</h2>
      <p>
        Quien recluta para un puesto inicial sabe que no tienes años de trayectoria; lo que busca es evidencia de que puedes aprender y cumplir. Sirven, siempre que sean reales:
      </p>
      <ul>
        <li>
          <strong>Prácticas preprofesionales y pasantías</strong>, aunque hayan sido cortas o no remuneradas. En Perú se distingue entre las prácticas preprofesionales (durante los estudios) y las profesionales (después de egresar); ambas cuentan.
        </li>
        <li>
          <strong>Proyectos académicos:</strong> tesis, trabajos finales, proyectos de curso que resolvieron un problema real (por ejemplo, un plan para un negocio local).
        </li>
        <li>
          <strong>Voluntariado y actividades:</strong> organización de eventos, apoyo en comedores, clubes, equipos deportivos o representación de aula, con tareas concretas.
        </li>
        <li>
          <strong>Trabajos informales o freelance:</strong> ayudar en el negocio familiar, dictar clases particulares, hacer diseños o traducciones. Cuentan si hiciste algo específico.
        </li>
        <li>
          <strong>Cursos y certificaciones</strong> relacionados con el puesto, con el nombre del curso y el año.
        </li>
        <li>
          <strong>Proyectos personales:</strong> un portafolio, una página web, una tienda en línea que armaste, un canal donde publicas contenido.
        </li>
      </ul>

      <h2 id="estructura">Estructura recomendada</h2>
      <p>
        La guía de hojas de vida del centro de carreras de Harvard College propone ordenar las secciones por importancia, con contacto, educación, experiencia, liderazgo y actividades, y habilidades e intereses. Si aún no tienes experiencia laboral, lo natural es que la <strong>educación vaya primero</strong> y que tus proyectos y actividades ocupen el lugar de la experiencia. Un orden que funciona:
      </p>
      <ol>
        <li>Datos de contacto (nombre, correo, teléfono, ciudad y país, enlace a LinkedIn o portafolio si lo tienes).</li>
        <li>Perfil profesional (2 o 3 líneas).</li>
        <li>Educación.</li>
        <li>Proyectos y actividades (o experiencia, si tuviste prácticas).</li>
        <li>Habilidades y herramientas.</li>
        <li>Idiomas y certificaciones.</li>
      </ol>
      <p>Una sola página, una sola columna, sin foto ni tablas: así se lee bien tanto para una persona como para un sistema automático.</p>

      <Anuncio posicion="intro" />

      <h2 id="pasos">Paso a paso</h2>
      <ol>
        <li>
          <strong>Haz un inventario.</strong> Anota todo lo que hiciste en los últimos tres o cuatro años: cursos, proyectos, trabajos ocasionales, voluntariados, responsabilidades en casa o en un negocio familiar. No filtres todavía.
        </li>
        <li>
          <strong>Lee la oferta a la que postulas</strong> y marca lo que pide (herramientas, tareas, formación). Aquí ayuda el artículo sobre <Link href="/carrera-y-empleo/palabras-clave-cv-oferta-laboral">palabras clave de una oferta laboral</Link>.
        </li>
        <li>
          <strong>Elige lo más relevante.</strong> De tu inventario, escoge de 3 a 5 elementos que se parezcan más a lo que pide el puesto. Un proyecto de inventarios pesa más para un puesto de almacén que un torneo de fútbol, aunque el torneo también muestra compromiso.
        </li>
        <li>
          <strong>Escribe cada elemento con la fórmula de una viñeta:</strong> verbo, qué, cómo o con qué y resultado. Si necesitas ideas de verbos, mira la <Link href="/carrera-y-empleo/verbos-de-accion-para-cv">lista de verbos de acción por área</Link>.
        </li>
        <li>
          <strong>Agrega tus herramientas y habilidades reales.</strong> Programas, idiomas, métodos. Sé preciso con el nivel («Excel intermedio: tablas dinámicas y BUSCARV»).
        </li>
        <li>
          <strong>Escribe el perfil al final,</strong> cuando ya sabes qué historia cuenta tu CV.
        </li>
        <li>
          <strong>Revisa y pide a alguien que lo lea.</strong> Ortografía, fechas y datos de contacto. Y ábrelo como archivo para comprobar que se ve bien.
        </li>
      </ol>

      <h2 id="perfil">Cómo escribir el perfil profesional</h2>
      <p>
        Sin experiencia, el perfil no debería prometer cosas vagas («persona proactiva con ganas de crecer»). Mejor: quién eres profesionalmente, qué evidencia tienes y qué buscas. Ejemplo ficticio:
      </p>
      <blockquote>
        <p>
          «Egresado de Administración de Empresas con formación en atención al cliente y hojas de cálculo. Realizó prácticas de tres meses en una tienda de ropa, donde registraba las ventas diarias, y fue voluntario en un comedor comunitario de Trujillo. Busca un puesto de asistente administrativo para aportar orden y aprender los procesos de una oficina.»
        </p>
      </blockquote>
      <p>Funciona porque nombra la carrera, da dos hechos comprobables (las prácticas y el voluntariado) y dice el objetivo concreto. Puedes probar una versión con tus datos en la <Link href={RUTA_CV}>herramienta del CV</Link>, que trae un perfil de ejemplo para estudiantes.</p>

      <Anuncio posicion="medio" />

      <h2 id="ejemplos">Ejemplos de viñetas sin empleo formal</h2>
      <Tabla
        resumen="Ejemplos ficticios de cómo convertir actividades sin empleo formal en viñetas de CV"
        columnas={["Situación", "Viñeta (ejemplo ficticio)"]}
        filas={[
          ["Tesis o proyecto final", "Diseñé un plan de posicionamiento web para una tienda local y lo presenté ante un jurado de 3 docentes."],
          ["Voluntariado", "Clasifiqué y registré las donaciones semanales de un comedor en una hoja de cálculo, y coordiné a 8 voluntarios cada sábado."],
          ["Negocio familiar", "Registré las ventas diarias de una bodega en un cuaderno digital y detecté los cinco productos que más rotaban."],
          ["Clases particulares", "Enseñé matemática a 4 estudiantes de secundaria durante un año y preparé sus repasos semanales."],
          ["Proyecto personal", "Armé una tienda en línea con un catálogo de 30 productos y atendí los pedidos por mensajería."],
          ["Curso", "Completé el curso de Excel intermedio (30 horas) y apliqué tablas dinámicas en un trabajo final."],
        ]}
      />
      <p className="text-sm text-muted-foreground">Ejemplos inventados para ilustrar la redacción. Usa solo lo que hiciste y los números que puedas justificar.</p>

      <h2 id="evitar">Qué no poner</h2>
      <ul>
        <li>
          <strong>Datos que no aportan:</strong> edad, estado civil, documento de identidad, dirección exacta y foto. La guía de Harvard College recomienda no incluir imágenes, edad ni género.
        </li>
        <li>
          <strong>Objetivos genéricos</strong> como «obtener un puesto en una empresa líder» que sirven para cualquier CV y no dicen nada de ti.
        </li>
        <li>
          <strong>Adjetivos sin prueba:</strong> «responsable, dinámica, proactiva». Muéstralas con un hecho.
        </li>
        <li>
          <strong>Habilidades inventadas o infladas.</strong> Se descubren en la primera prueba o entrevista.
        </li>
        <li>
          <strong>Información irrelevante y antigua:</strong> el colegio, si ya estudiaste una carrera, salvo que la oferta lo pida.
        </li>
        <li>
          <strong>Referencias personales:</strong> la guía de Harvard College sugiere no incluirlas; se piden después si hacen falta.
        </li>
      </ul>

      <h2 id="brechas">Si tienes períodos sin estudiar ni trabajar</h2>
      <p>
        Las brechas de tiempo sin explicación pueden generar preguntas. No hace falta justificar cada mes, pero sí conviene explicarlas brevemente con hechos reales: cuidado de un familiar, preparación para un examen, aprendizaje por tu cuenta, un proyecto personal. Puedes reflejarlo con una línea en tu CV (por ejemplo, «Curso autodidacta de diseño gráfico, 2023») o comentarlo en la entrevista. Lo importante es la honestidad: no rellenes con trabajos que no existieron.
      </p>

      <h2 id="preguntas">Preguntas frecuentes</h2>
      <PreguntaFrecuente q="¿Debo poner mis notas o mi promedio?">
        Solo si son un punto fuerte y la oferta o el sector lo valoran (por ejemplo, tercio superior). Si decides ponerlo, indica la escala (por ejemplo, «15,4 sobre 20»).
      </PreguntaFrecuente>
      <PreguntaFrecuente q="¿Y si nunca he hecho prácticas ni voluntariado?">
        Mira tus proyectos de estudio, tus cursos, tus trabajos informales y tus proyectos personales. Si de verdad no hay nada, tu hoja de vida se apoyará en la educación y las habilidades, y puede ser buen momento para sumar un curso corto o un voluntariado de pocas horas que te dé algo real que contar.
      </PreguntaFrecuente>
      <PreguntaFrecuente q="¿Una hoja de vida sin experiencia puede pasar un filtro ATS?">
        Sí, siempre que sea legible para el sistema (una columna, texto real, encabezados estándar) y use las palabras de la oferta en lo que sí has hecho. Nadie puede garantizar el resultado: cada empresa usa su propio sistema y criterios.
      </PreguntaFrecuente>

      <Fuentes>
        <li>
          <EnlaceExterno href={HARVARD_GUIA}>Harvard College Guide to Creating a Strong Resume</EnlaceExterno> (Mignone Center for Career Success, Harvard FAS): orden de secciones, viñetas con verbos de acción y elementos que evitar (imágenes, edad, género, pronombres, referencias, información no explicada). Consultada el 25 de septiembre de 2026.
        </li>
        <li>Los ejemplos de perfil y de viñetas son ficticios y de elaboración propia.</li>
      </Fuentes>
    </>
  );
}

export const CUERPOS: Record<string, () => ReactNode> = {
  "palabras-clave-cv-oferta-laboral": CuerpoPalabrasClave,
  "verbos-de-accion-para-cv": CuerpoVerbosDeAccion,
  "cv-sin-experiencia": CuerpoCvSinExperiencia,
};
