/**
 * Validación de una página de herramienta contra los estándares de calidad. Es una función pura
 * (recibe la página y un contexto) para poder probarla y ejecutarla desde scripts/validate-herramientas.ts.
 *
 * Los errores bloquean el build. Una página `publicado: false` puede estar incompleta (TODO, sin
 * capturas, fuera del rango de palabras): solo se le exige coherencia estructural. Una `publicado: true`
 * debe cumplir todo.
 */
import { categories } from "../../content/categorias";
import { getAuthor } from "../../content/autores";
import { verificarCasos } from "./calculadora";
import { ErrorExpresion, idsUsados } from "./expresiones";
import { verificarCasosPreproceso } from "./preprocesos";
import { PERFIL_CLAVES, type Herramienta } from "./tipos";

export interface ContextoValidacion {
  existeImagen: (src: string) => boolean;
  /** Rutas «area/slug» de las páginas publicadas. */
  publicadas: ReadonlySet<string>;
  /** Rutas «area/slug» de todas las páginas que existen. */
  existentes: ReadonlySet<string>;
}

export interface ResultadoValidacion {
  errores: string[];
  avisos: string[];
  palabras: number;
}

export const PALABRAS_MIN = 1500;
export const PALABRAS_MAX = 2500;
const PALABRAS_ABSOLUTAS = /garantiz|100\s?%|aumenta(?:r|mos)? tus ventas|duplica tus ventas/i;
const TIPOS = ["generador", "calculadora", "analizador", "kit"];
const ETIQUETAS = ["Prueba real", "Captura de hoja", "Ilustración", "Simulación"];

/** Todo el texto que ve la persona en la página, salvo el prompt (`tarea`), los datos técnicos y los casos de prueba. */
export function textosVisibles(h: Herramienta): string[] {
  const t: string[] = [h.meta.titulo, h.meta.descripcion, h.meta.tiempo, h.antesDespues.antes, h.antesDespues.despues];
  for (const c of h.campos) t.push(c.label, c.ayuda ?? "");
  if (h.calculadora) {
    for (const e of h.calculadora.entradas) t.push(e.label, e.ayuda ?? "");
    for (const s of h.calculadora.salidas) t.push(s.etiqueta, s.ayuda ?? "");
  }
  t.push(...(h.pasos ?? []));
  for (const m of h.mejoras) t.push(m.label, m.prompt);
  t.push(h.ejemplo.negocio, ...Object.values(h.ejemplo.datos), ...Object.values(h.ejemplo.resultado ?? {}), ...h.ejemplo.queCorregi);
  for (const c of h.ejemplo.capturas) t.push(c.alt, c.pie ?? "");
  t.push(...h.checklist);
  for (const p of h.porQueFunciona) t.push(p.titulo, p.texto);
  for (const r of h.rubros) t.push(r.rubro, r.ejemplo, r.consejo);
  for (const e of h.errores) t.push(e.error, e.solucion);
  for (const f of h.faq) t.push(f.p, f.r);
  if (h.metodoCompleto) t.push(h.metodoCompleto.titulo, ...h.metodoCompleto.parrafos, ...(h.metodoCompleto.capturas ?? []).flatMap((c) => [c.alt, c.pie ?? ""]));
  for (const l of h.meta.limites ?? []) t.push(l.concepto, l.valor);
  return t.filter(Boolean);
}

/**
 * Solo el texto EDITORIAL de la página: lo que se lee como explicación. Deja fuera el formulario (etiquetas y ayudas de
 * los campos y de la calculadora), los valores de ejemplo del formulario, los prompts (`tarea` y el texto de cada
 * «mejora») y los datos técnicos. Lo usan el validador (estándar 17) y `npm run contar-palabras`. `textosVisibles` (más amplio) se usa para las demás comprobaciones de texto.
 */
export function textosEditoriales(h: Herramienta): string[] {
  const t: string[] = [h.meta.titulo, h.meta.descripcion, h.antesDespues.antes, h.antesDespues.despues];
  t.push(...(h.pasos ?? []));
  for (const m of h.mejoras) t.push(m.label);
  t.push(h.ejemplo.negocio, ...Object.values(h.ejemplo.resultado ?? {}), ...h.ejemplo.queCorregi);
  for (const c of h.ejemplo.capturas) t.push(c.alt, c.pie ?? "");
  t.push(...h.checklist);
  for (const p of h.porQueFunciona) t.push(p.titulo, p.texto);
  for (const r of h.rubros) t.push(r.rubro, r.ejemplo, r.consejo);
  for (const e of h.errores) t.push(e.error, e.solucion);
  for (const f of h.faq) t.push(f.p, f.r);
  if (h.metodoCompleto) t.push(h.metodoCompleto.titulo, ...h.metodoCompleto.parrafos, ...(h.metodoCompleto.capturas ?? []).flatMap((c) => [c.alt, c.pie ?? ""]));
  for (const l of h.meta.limites ?? []) t.push(l.concepto, l.valor);
  return t.filter(Boolean);
}

/** «TODO» solo en mayúsculas (la palabra española «todo» es normal); el resto, sin distinguir mayúsculas. */
export function notaDeProduccion(texto: string): boolean {
  return /\bTODO\b/.test(texto) || /\[completar\]|captura pendiente|lorem ipsum|reemplazar (aquí|esto|por)/i.test(texto);
}

export function contarPalabras(textos: string[]): number {
  return textos.join(" ").split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
}

export function validarHerramienta(h: Herramienta, ctx: ContextoValidacion): ResultadoValidacion {
  const errores: string[] = [];
  const avisos: string[] = [];
  const error = (ok: boolean, mensaje: string) => {
    if (!ok) errores.push(mensaje);
  };
  const aviso = (ok: boolean, mensaje: string) => {
    if (!ok) avisos.push(mensaje);
  };
  /** Bloquea si la página está publicada; si es borrador, solo avisa. */
  const publicada = (ok: boolean, mensaje: string) => (h.publicado ? error(ok, mensaje) : aviso(ok, `(borrador) ${mensaje}`));

  /* ── estructura (siempre) ── */
  error(categories.some((c) => c.slug === h.meta.area), `meta.area «${h.meta.area}» no es un área válida.`);
  error(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(h.meta.slug), `meta.slug «${h.meta.slug}»: minúsculas, sin tildes, con guiones.`);
  error(TIPOS.includes(h.meta.tipo), `meta.tipo «${h.meta.tipo}» no es válido.`);
  error(h.meta.tipo !== "calculadora" || h.calculadora !== null, "Una herramienta de tipo calculadora necesita `calculadora`.");
  error(/^\d{4}-\d{2}-\d{2}$/.test(h.meta.actualizado), "meta.actualizado debe ser AAAA-MM-DD.");
  if (h.meta.probadoFecha !== null) error(/^\d{4}-\d{2}-\d{2}$/.test(h.meta.probadoFecha), "meta.probadoFecha debe ser AAAA-MM-DD.");
  if (h.meta.autor) error(Boolean(getAuthor(h.meta.autor)), `meta.autor «${h.meta.autor}» no existe en content/autores.ts.`);
  error(h.usaPerfil.every((k) => (PERFIL_CLAVES as readonly string[]).includes(k)), "usaPerfil contiene una clave que no existe en el perfil.");

  const idsCampos = h.campos.map((c) => c.id);
  error(new Set(idsCampos).size === idsCampos.length, "Hay campos con el mismo id.");
  for (const c of h.campos) {
    error(/^[A-Za-z][A-Za-z0-9_]*$/.test(c.id), `Campo «${c.id}»: id no válido.`);
    // Un campo opcional puede quedar vacío en el ejemplo (por ejemplo, una condición que el caso deja pendiente a propósito).
    error(c.ejemplo.trim() !== "" || !c.requerido, `Campo «${c.id}»: falta el ejemplo de «Probar con un ejemplo».`);
    error(c.tipo !== "seleccion" || Boolean(c.opciones && c.opciones.length > 1), `Campo «${c.id}»: una selección necesita opciones.`);
    error(c.tipo !== "seleccion" || !c.opciones || c.opciones.includes(c.ejemplo), `Campo «${c.id}»: el ejemplo no está entre las opciones.`);
  }
  for (const m of h.tarea.matchAll(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g)) error(idsCampos.includes(m[1]), `La tarea cita {{${m[1]}}} y no existe ese campo.`);
  error(h.tarea.replace(/\{\{\s*[A-Za-z0-9_]+\s*\}\}/g, "").trim().length >= 40, "La tarea es demasiado corta.");

  /* ── calculadora ── */
  if (h.calculadora) {
    const c = h.calculadora;
    const conocidos = new Set<string>(c.entradas.map((e) => e.id));
    error(conocidos.size === c.entradas.length, "Hay entradas de la calculadora con el mismo id.");
    for (const e of c.entradas) error(Boolean(e.ejemplo.trim()), `Entrada «${e.id}»: falta el ejemplo.`);
    for (const s of c.salidas) {
      error(!conocidos.has(s.id), `Salida «${s.id}»: id repetido.`);
      try {
        for (const id of idsUsados(s.formula)) error(conocidos.has(id), `Salida «${s.id}»: la fórmula usa «${id}», que no es una entrada ni una salida anterior.`);
      } catch (e) {
        error(false, `Salida «${s.id}»: ${(e as ErrorExpresion).message}`);
      }
      conocidos.add(s.id);
    }
    error(c.casosDePrueba.length >= 3, `La calculadora necesita al menos 3 casos de prueba (tiene ${c.casosDePrueba.length}).`);
    try {
      for (const f of verificarCasos(c)) error(false, `Caso «${f.caso}», salida ${f.salida}: esperado ${f.esperado}, obtenido ${f.obtenido}.`);
    } catch (e) {
      error(false, `No se pudieron ejecutar los casos de prueba: ${(e as Error).message}`);
    }
  }

  /* ── pre-proceso (analizadores) ── */
  if (h.preproceso) {
    const p = h.preproceso;
    error(idsCampos.includes(p.campos.texto), `Pre-proceso: el campo «${p.campos.texto}» no existe.`);
    error(p.tipo !== "conteo-temas" || Boolean(p.campos.temas && idsCampos.includes(p.campos.temas)), "Pre-proceso conteo-temas: falta el campo del libro de códigos.");
    error(p.casosDePrueba.length >= 3, `El pre-proceso necesita al menos 3 casos de prueba (tiene ${p.casosDePrueba.length}).`);
    for (const f of verificarCasosPreproceso(p)) error(false, `Pre-proceso, caso «${f.caso}», resultado ${f.resultado}: esperado ${f.esperado}, obtenido ${f.obtenido}.`);
  }
  error(h.meta.tipo !== "analizador" || Boolean(h.preproceso), "Un analizador necesita un pre-proceso: la página cuenta o suma, la IA no.");

  /* ── plataforma y límites ── */
  for (const l of h.meta.limites ?? []) {
    error(/^https?:\/\//.test(l.fuente), `Límite «${l.concepto}»: falta la URL de la fuente oficial.`);
    error(/^\d{4}-\d{2}-\d{2}$/.test(l.fechaVerificacion), `Límite «${l.concepto}»: falta la fecha de verificación (AAAA-MM-DD).`);
  }
  error(!h.meta.limites?.length || Boolean(h.meta.plataforma), "Hay `limites` sin `plataforma`.");

  /* ── relacionadas ── */
  for (const ruta of h.relacionadas) {
    if (!ctx.existentes.has(ruta)) error(false, `Relacionada «${ruta}»: no existe esa herramienta.`);
    else if (h.publicado) error(ctx.publicadas.has(ruta), `Relacionada «${ruta}»: una página publicada solo enlaza a páginas publicadas.`);
  }

  /* ── contenido: se exige a las publicadas; en borradores solo avisa ── */
  const textos = textosVisibles(h);
  // El estándar 17 usa el recuento EDITORIAL (sin formulario, sin ejemplos del formulario, sin tarea ni prompts de mejoras).
  // Borrador fuera de rango → solo aviso; `publicado: true` fuera de 1.500–2.500 → error que rompe el build.
  const palabras = contarPalabras(textosEditoriales(h));
  publicada(palabras >= PALABRAS_MIN && palabras <= PALABRAS_MAX, `${palabras} palabras editoriales: deben estar entre ${PALABRAS_MIN} y ${PALABRAS_MAX}.`);
  publicada(h.meta.descripcion.length >= 140 && h.meta.descripcion.length <= 160, `meta.descripcion tiene ${h.meta.descripcion.length} caracteres: deben ser 140–160.`);
  publicada(h.mejoras.length >= 3 && h.mejoras.length <= 4, `Mejoras: ${h.mejoras.length} (deben ser 3–4).`);
  publicada(h.checklist.length === 5, `Checklist: ${h.checklist.length} casillas (deben ser 5).`);
  publicada(h.porQueFunciona.length >= 3 && h.porQueFunciona.length <= 4, `Por qué funciona: ${h.porQueFunciona.length} ideas (deben ser 3–4).`);
  publicada(h.rubros.length >= 3, `Según tu tipo de negocio: ${h.rubros.length} rubros (mínimo 3).`);
  publicada(h.errores.length >= 3 && h.errores.length <= 4, `Errores comunes: ${h.errores.length} (deben ser 3–4).`);
  publicada(h.faq.length >= 4 && h.faq.length <= 6, `Preguntas frecuentes: ${h.faq.length} (deben ser 4–6).`);
  publicada(h.relacionadas.length >= 2 && h.relacionadas.length <= 3, `Siguiente paso: ${h.relacionadas.length} relacionadas (deben ser 2–3).`);
  publicada(h.ejemplo.queCorregi.length === 3, `«Qué corregí yo» tiene ${h.ejemplo.queCorregi.length} líneas (deben ser 3).`);
  publicada(/\(fictici[oa]\)/i.test(h.ejemplo.negocio), "El negocio de ejemplo debe llevar «(ficticio)» o «(ficticia)».");
  // Citar entre «» una frase prohibida para explicar por qué no debe usarse («100 % natural») no es prometerla.
  publicada(!PALABRAS_ABSOLUTAS.test(textos.join("\n").replace(/«[^»]*»/g, " ")),"Hay una promesa absoluta («garantizado», «100 %», «aumenta tus ventas»).");
  publicada(!textos.some(notaDeProduccion), "Hay una nota de producción visible (TODO, [completar], captura pendiente, reemplazar aquí…).");

  /* ── prueba real (solo publicadas) ── */
  publicada(Boolean(h.meta.probadoEn && h.meta.probadoFecha), "Faltan meta.probadoEn y meta.probadoFecha: sin prueba real no se publica.");
  publicada(h.ejemplo.capturas.length >= 1 && h.ejemplo.capturas.length <= 2, `Capturas: ${h.ejemplo.capturas.length} (deben ser 1–2 en el ejemplo real).`);
  publicada(h.ejemplo.capturas.some((c) => c.etiqueta === "Prueba real"), "Falta al menos una captura etiquetada «Prueba real».");
  for (const c of [...h.ejemplo.capturas, ...(h.metodoCompleto?.capturas ?? [])]) {
    error(ETIQUETAS.includes(c.etiqueta), `Captura ${c.src}: etiqueta «${c.etiqueta}» no válida.`);
    error(c.alt.trim().length >= 25, `Captura ${c.src}: el alt es demasiado corto para describir la imagen.`);
    error(c.src.startsWith(`/img/${h.meta.area}/${h.meta.slug}/`), `Captura ${c.src}: debe estar en /img/${h.meta.area}/${h.meta.slug}/.`);
    publicada(ctx.existeImagen(c.src), `Captura ${c.src}: el archivo no existe en public/.`);
  }
  if (h.meta.ogImage) publicada(ctx.existeImagen(h.meta.ogImage), `og:image ${h.meta.ogImage}: el archivo no existe en public/.`);
  else publicada(false, "Falta meta.ogImage (og:image propia).");

  return { errores, avisos, palabras };
}
