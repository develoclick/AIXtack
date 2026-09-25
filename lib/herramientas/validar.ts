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
import { contarPalabras } from "../texto/contar-palabras";
import { verificarCasosPreproceso } from "./preprocesos";
import { nombresDeCondicion, referenciasDe } from "./plantillas";
import { dicePorIA, ETIQUETAS_GENERADAS_CON_IA, ETIQUETAS_IMAGEN, pasosDelProceso, PERFIL_CLAVES, SEPARADOR_CASILLAS, type Herramienta, type PasoProceso } from "./tipos";

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

/**
 * El texto explicativo de la página cuando `pasos` es un PROCESO: lo que vas a tener, el problema, lo que necesitas, cada paso
 * (qué haces, opciones, así sabes que salió bien, si algo falla, resultado) y el kit final. Los prompts de los pasos NO cuentan
 * (son prompts, como la `tarea`). Con la lista simple de 3 textos de «Cómo usarlo» devuelve esos textos.
 */
export function textosProceso(h: Herramienta): string[] {
  const proceso = pasosDelProceso(h);
  if (!proceso) return [...((h.pasos as string[] | undefined) ?? [])];
  const t: string[] = [];
  for (const r of h.resultadoFinal ?? []) t.push(r.titulo, r.descripcion, ...(r.captura ? [r.captura.leyenda] : []));
  for (const p of h.problema ?? []) t.push(p.titulo, p.texto);
  for (const n of h.necesitas ?? []) t.push(n.nombre, n.para, n.alternativa ?? "");
  for (const p of proceso) {
    t.push(p.titulo, p.queHaces, p.resultado, p.sinOpciones ?? "", ...p.asiSabesQueSalioBien, ...p.siAlgoFalla.map((s) => (typeof s === "string" ? s : s.texto)), ...(p.avisos ?? []).map((a) => a.texto), ...(p.comprobar ?? []).map((c) => c.etiqueta));
    for (const o of p.opciones ?? []) t.push(o.titulo, o.texto, ...(o.notas ?? []).map((a) => a.texto), ...(o.avisos ?? []).map((a) => a.texto));
  }
  for (const k of h.kitFinal ?? []) t.push(k.texto);
  return t;
}

/** Todo el texto que ve la persona en la página, salvo el prompt (`tarea`), los datos técnicos y los casos de prueba. */
export function textosVisibles(h: Herramienta): string[] {
  const t: string[] = [h.meta.titulo, h.meta.descripcion, h.meta.tiempo, h.antesDespues.antes, h.antesDespues.despues];
  for (const c of h.campos) t.push(c.label, c.ayuda ?? "");
  if (h.calculadora) {
    for (const e of h.calculadora.entradas) t.push(e.label, e.ayuda ?? "");
    for (const s of h.calculadora.salidas) t.push(s.etiqueta, s.ayuda ?? "");
  }
  t.push(...textosProceso(h), h.tituloRevision ?? "");
  for (const m of h.mejoras) t.push(m.label, m.prompt);
  t.push(h.ejemplo.negocio, ...Object.values(h.ejemplo.resultado ?? {}), ...h.ejemplo.queCorregi, h.ejemplo.notaPreparada ?? "", ...(h.ejemplo.pasos ?? []).flatMap((f) => [f.hizoLaIA, f.hiceYo, f.tiempo]), h.ejemplo.tiempoTotal ?? "");
  for (const c of h.ejemplo.capturas) t.push(c.alt, c.leyenda);
  t.push(...h.checklist);
  for (const p of h.porQueFunciona) t.push(p.titulo, p.texto);
  for (const r of h.rubros) t.push(r.rubro, r.ejemplo, r.consejo);
  for (const e of h.errores) t.push(e.error, e.solucion);
  for (const f of h.faq) t.push(f.p, f.r);
  if (h.metodoCompleto) t.push(h.metodoCompleto.titulo, ...h.metodoCompleto.parrafos, ...(h.metodoCompleto.capturas ?? []).flatMap((c) => [c.alt, c.leyenda]));
  for (const l of h.meta.limites ?? []) t.push(l.concepto, l.valor);
  return t.filter(Boolean);
}

/**
 * Solo el texto EDITORIAL de la página: lo que se lee como explicación. Deja fuera el formulario (etiquetas y ayudas de
 * los campos y de la calculadora), los valores de ejemplo del formulario, los prompts (`tarea` y el texto de cada
 * «mejora»), el `alt` de las imágenes (es un atributo, no texto visible), el registro de la prueba real (`ejemplo.pasos`, `transcripcion`) y los datos técnicos. Lo usan el validador (estándar 17) y `npm run contar-palabras`. `textosVisibles` (más amplio) se usa para las demás comprobaciones de texto.
 */
export function textosEditoriales(h: Herramienta): string[] {
  const t: string[] = [h.meta.titulo, h.meta.descripcion, h.antesDespues.antes, h.antesDespues.despues];
  t.push(...textosProceso(h));
  for (const m of h.mejoras) t.push(m.label);
  t.push(h.ejemplo.negocio, ...Object.values(h.ejemplo.resultado ?? {}), ...h.ejemplo.queCorregi);
  for (const c of h.ejemplo.capturas) t.push(c.leyenda);
  t.push(...h.checklist);
  for (const p of h.porQueFunciona) t.push(p.titulo, p.texto);
  for (const r of h.rubros) t.push(r.rubro, r.ejemplo, r.consejo);
  for (const e of h.errores) t.push(e.error, e.solucion);
  for (const f of h.faq) t.push(f.p, f.r);
  if (h.metodoCompleto) t.push(h.metodoCompleto.titulo, ...h.metodoCompleto.parrafos, ...(h.metodoCompleto.capturas ?? []).map((c) => c.leyenda));
  for (const l of h.meta.limites ?? []) t.push(l.concepto, l.valor);
  return t.filter(Boolean);
}

/** «TODO» solo en mayúsculas (la palabra española «todo» es normal); el resto, sin distinguir mayúsculas. */
export function notaDeProduccion(texto: string): boolean {
  return /\bTODO\b/.test(texto) || /\[completar\]|captura pendiente|lorem ipsum|reemplazar (aquí|esto|por)/i.test(texto);
}

// El conteo vive en lib/texto/contar-palabras.ts (lo usan también las herramientas que limitan el texto); se reexporta aquí.
export { contarPalabras };

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
    if (c.tipo === "casillas") {
      error(Boolean(c.opciones && c.opciones.length > 1), `Campo «${c.id}»: unas casillas necesitan opciones.`);
      error((c.opciones ?? []).every((o) => !o.includes(SEPARADOR_CASILLAS.trim())), `Campo «${c.id}»: las opciones de unas casillas no pueden llevar «;».`);
      const marcadas = c.ejemplo.split(SEPARADOR_CASILLAS.trim()).map((x) => x.trim()).filter(Boolean);
      error(marcadas.every((m) => (c.opciones ?? []).includes(m)), `Campo «${c.id}»: el ejemplo tiene una opción que no está entre las opciones.`);
    }
  }
  const variablesPagina = Object.keys(h.preproceso?.variables ?? {});
  const perfilUsado = (h.usaPerfil ?? []) as string[];
  /** Una plantilla (la `tarea` o el prompt de un paso) solo puede citar campos, variables de la página y datos del perfil que la herramienta usa. */
  const validarPlantilla = (donde: string, texto: string) => {
    const { marcas, condiciones, anidado } = referenciasDe(texto);
    error(!anidado, `${donde}: los bloques {{#si}} no se pueden anidar.`);
    const existe = (ref: string) => (ref.startsWith("perfil.") ? perfilUsado.includes(ref.slice("perfil.".length)) : idsCampos.includes(ref) || variablesPagina.includes(ref));
    for (const ref of marcas) error(existe(ref), `${donde} cita {{${ref}}} y no existe ese campo, variable del pre-proceso ni dato del perfil que la herramienta use (usaPerfil).`);
    for (const c of condiciones) {
      for (const ref of nombresDeCondicion(c)) error(existe(ref), `${donde}: la condición «${c}» cita «${ref}», que no existe.`);
      validarValoresDeCondicion(donde, c);
    }
    error(!/\{\{|\}\}/.test(texto.replace(/\{\{[^{}]*\}\}/g, "")), `${donde}: hay llaves sueltas.`);
  };
  /** En «campo=Valor» o «campo~Valor», si el campo tiene opciones, el valor tiene que ser una de ellas (evita erratas). */
  const validarValoresDeCondicion = (donde: string, condicion: string) => {
    for (const parte of condicion.split("|")) {
      const c = parte.trim().replace(/^!/, "");
      const m = /^([^=~]+)([=~])(.*)$/.exec(c);
      if (!m) continue;
      const campo = h.campos.find((x) => x.id === m[1].trim());
      if (campo?.opciones) error(campo.opciones.includes(m[3].trim()), `${donde}: la condición «${condicion}» usa «${m[3].trim()}», que no es una opción de «${campo.id}».`);
    }
  };
  validarPlantilla("La tarea", h.tarea);
  error(h.tarea.replace(/\{\{[^{}]*\}\}/g, "").trim().length >= 40, "La tarea es demasiado corta.");

  /* ── proceso (pasos, resultado final, problema, necesitas, kit) ── */
  const proceso = pasosDelProceso(h);
  if (proceso) {
    const iguales = (ids: string[]) => new Set(ids).size === ids.length;
    error((h.resultadoFinal ?? []).length >= 3 && iguales((h.resultadoFinal ?? []).map((r) => r.id)), "Proceso: «resultadoFinal» necesita al menos 3 resultados con id distinto.");
    for (const r of h.resultadoFinal ?? []) error(Boolean(r.titulo?.trim() && r.descripcion?.trim()), `Proceso: el resultado «${r.id}» necesita título y descripción.`);
    error((h.problema ?? []).length === 3, `Proceso: «problema» debe tener 3 tarjetas (tiene ${(h.problema ?? []).length}).`);
    error((h.necesitas ?? []).length >= 3 && (h.necesitas ?? []).some((n) => n.obligatorio), "Proceso: «necesitas» necesita al menos 3 elementos y alguno obligatorio.");
    error((h.kitFinal ?? []).length >= 3 && iguales((h.kitFinal ?? []).map((k) => k.id)), "Proceso: «kitFinal» necesita al menos 3 ítems con id distinto.");
    error(proceso.length >= 3 && proceso.every((p, i) => p.numero === i + 1), "Proceso: los pasos deben estar numerados 1, 2, 3… en orden.");
    error(proceso.filter((p) => p.promptMaestro).length <= 1, "Proceso: solo un paso puede llevar el prompt completo (promptMaestro).");
    const condicion = (donde: string, c: string | undefined) => {
      if (!c) return;
      for (const ref of nombresDeCondicion(c)) error(ref.startsWith("perfil.") ? perfilUsado.includes(ref.slice(8)) : idsCampos.includes(ref) || variablesPagina.includes(ref), `${donde}: la condición «${c}» cita «${ref}», que no existe.`);
      validarValoresDeCondicion(donde, c);
    };
    for (const p of proceso as PasoProceso[]) {
      const d = `Paso ${p.numero}`;
      error(Boolean(p.titulo?.trim() && p.queHaces?.trim() && p.resultado?.trim()), `${d}: necesita título, «queHaces» y «resultado».`);
      error(/^\d+ min$/.test(p.tiempo), `${d}: el tiempo debe ser como «2 min».`);
      error(p.asiSabesQueSalioBien.length >= 2, `${d}: «asiSabesQueSalioBien» necesita al menos 2 comprobaciones.`);
      error(p.siAlgoFalla.length >= 1, `${d}: «siAlgoFalla» necesita al menos 1 salida.`);
      for (const salida of p.siAlgoFalla) {
        if (typeof salida === "string") continue;
        error(Boolean(salida.texto?.trim()) && salida.correcciones.length >= 1, `${d}: una salida de «siAlgoFalla» con correcciones necesita su texto y al menos una corrección.`);
        error(iguales(salida.correcciones.map((c) => c.etiqueta)), `${d}: hay correcciones con la misma etiqueta.`);
        for (const c of salida.correcciones) {
          error(Boolean(c.etiqueta?.trim()), `${d}: una corrección necesita etiqueta.`);
          validarPlantilla(`${d}, corrección «${c.etiqueta}»`, c.prompt);
          condicion(`${d}, corrección «${c.etiqueta}» (mostrarSi)`, c.mostrarSi);
        }
      }
      error(!p.promptMaestro || !p.prompt, `${d}: un paso con promptMaestro no lleva además su propio prompt.`);
      if (p.prompt) validarPlantilla(`${d} (prompt)`, p.prompt);
      for (const a of p.avisos ?? []) condicion(`${d} (aviso)`, a.si);
      for (const c of p.comprobar ?? []) error(idsCampos.includes(c.campo), `${d}: comprobar cita el campo «${c.campo}», que no existe.`);
      error(iguales((p.opciones ?? []).map((o) => o.id)), `${d}: hay opciones con el mismo id.`);
      for (const o of p.opciones ?? []) {
        error(Boolean(o.titulo?.trim() && o.texto?.trim()), `${d}, opción «${o.id}»: necesita título y texto.`);
        if (o.prompt) validarPlantilla(`${d}, opción «${o.id}» (prompt)`, o.prompt);
        condicion(`${d}, opción «${o.id}» (mostrarSi)`, o.mostrarSi);
        condicion(`${d}, opción «${o.id}» (primeraSi)`, o.primeraSi);
        for (const a of [...(o.notas ?? []), ...(o.avisos ?? [])]) condicion(`${d}, opción «${o.id}» (aviso)`, a.si);
      }
    }
    for (const k of h.kitFinal ?? []) condicion(`Kit final «${k.id}»`, k.mostrarSi);
    for (const c of [...h.ejemplo.capturas, ...h.capturasPendientes ?? []]) error(c.paso === undefined || proceso.some((p) => p.numero === c.paso), `Captura «${"src" in c ? c.src : c.archivo}»: cita el paso ${c.paso}, que no existe.`);
  } else {
    error(!h.resultadoFinal && !h.problema && !h.necesitas && !h.kitFinal, "Los campos resultadoFinal, problema, necesitas y kitFinal solo se usan con «pasos» de proceso.");
  }

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
    if (p.tipo === "conteo-palabras") {
      error(Boolean(p.palabras) && p.palabras!.maximo > 0 && p.palabras!.niveles.length > 0, "Pre-proceso conteo-palabras: falta `palabras` (máximo y niveles).");
      for (const n of p.palabras?.niveles ?? []) for (const c of n.campos) error(idsCampos.includes(c), `Pre-proceso conteo-palabras, nivel «${n.etiqueta}»: el campo «${c}» no existe.`);
    } else error(Boolean(p.campos.texto) && idsCampos.includes(p.campos.texto!), `Pre-proceso: el campo «${p.campos.texto}» no existe.`);
    for (const [variable, resultado] of Object.entries(p.variables ?? {})) {
      const plantillas = [h.tarea, ...(pasosDelProceso(h) ?? []).flatMap((p) => [p.prompt ?? "", ...(p.opciones ?? []).map((o) => o.prompt ?? "")])];
      error(plantillas.some((t) => t.includes(`{{${variable}}}`)), `Pre-proceso: la variable «{{${variable}}}» (resultado «${resultado}») no aparece en la tarea ni en ningún prompt de un paso.`);
    }
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
    // Una publicada nunca enseña un borrador (relacionadasDe lo oculta): mientras la relacionada siga en borrador, solo aviso.
    else if (h.publicado) aviso(ctx.publicadas.has(ruta), `Relacionada «${ruta}»: sigue en borrador y no se mostrará en «Siguiente paso» hasta que se publique.`);
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
  const maxCapturas = proceso ? 8 : 2;
  publicada(h.ejemplo.capturas.length >= 1 && h.ejemplo.capturas.length <= maxCapturas, `Capturas: ${h.ejemplo.capturas.length} (deben ser 1–${maxCapturas} en el ejemplo real).`);
  publicada(h.ejemplo.capturas.some((c) => c.etiqueta === "Prueba real"), "Falta al menos una captura etiquetada «Prueba real».");
  // «Quién hizo qué» (ejemplo.pasos) y el tiempo total salen de la prueba real del autor: sin prueba (IA y fecha) no deben existir.
  const filasEjemplo = h.ejemplo.pasos ?? [];
  if (filasEjemplo.length > 0 || h.ejemplo.tiempoTotal?.trim()) {
    publicada(Boolean(h.meta.probadoEn && h.meta.probadoFecha), "Hay «ejemplo.pasos» o «tiempoTotal» pero faltan meta.probadoEn y meta.probadoFecha: son de la prueba real y no se inventan.");
    error(filasEjemplo.length === 0 || Boolean(h.ejemplo.tiempoTotal?.trim()), "«ejemplo.pasos» necesita «ejemplo.tiempoTotal» (el tiempo total de la prueba).");
    for (const f of filasEjemplo) {
      error(Boolean(f.hizoLaIA?.trim() && f.hiceYo?.trim() && f.tiempo?.trim()), `ejemplo.pasos, paso ${f.paso}: necesita «hizoLaIA», «hiceYo» y «tiempo».`);
      error(proceso === null || proceso.some((p) => p.numero === f.paso), `ejemplo.pasos: el paso ${f.paso} no existe en «pasos».`);
    }
    error(new Set(filasEjemplo.map((f) => f.paso)).size === filasEjemplo.length, "ejemplo.pasos: hay dos filas del mismo paso.");
  }
  // La transcripción es la respuesta real del mismo chat de la prueba: sin prueba (IA y fecha) no debe existir.
  if (h.ejemplo.transcripcion?.trim()) publicada(Boolean(h.meta.probadoEn && h.meta.probadoFecha), "Hay «transcripcion» pero faltan meta.probadoEn y meta.probadoFecha: la transcripción es de la prueba real y no se inventa.");
  for (const c of [...h.ejemplo.capturas, ...(h.metodoCompleto?.capturas ?? [])]) {
    error((ETIQUETAS_IMAGEN as readonly string[]).includes(c.etiqueta), `Captura ${c.src}: etiqueta «${c.etiqueta}» no válida (solo: ${ETIQUETAS_IMAGEN.join(" | ")}).`);
    error(Boolean(c.alt?.trim()), `Captura ${c.src}: el alt es obligatorio.`);
    error(!c.alt?.trim() || c.alt.trim().length >= 25, `Captura ${c.src}: el alt es demasiado corto para describir la imagen.`);
    error(Boolean(c.leyenda?.trim()), `Captura ${c.src}: falta la leyenda.`);
    error(!ETIQUETAS_GENERADAS_CON_IA.includes(c.etiqueta) || dicePorIA(c.leyenda ?? ""), `Captura ${c.src}: una imagen «${c.etiqueta}» es generada por una IA y su leyenda debe decir que fue generada con IA.`);
    error(Number.isInteger(c.ancho) && c.ancho > 0 && Number.isInteger(c.alto) && c.alto > 0, `Captura ${c.src}: ancho y alto deben ser enteros positivos (píxeles del archivo).`);
    error(c.src.startsWith(`/img/${h.meta.area}/${h.meta.slug}/`), `Captura ${c.src}: debe estar en /img/${h.meta.area}/${h.meta.slug}/.`);
    publicada(ctx.existeImagen(c.src), `Captura ${c.src}: el archivo no existe en public/.`);
  }
  /* ── capturas pendientes: solo en borradores; una página publicada no puede tener ninguna ── */
  const pendientes = h.capturasPendientes ?? [];
  error(Array.isArray(h.capturasPendientes), "Falta `capturasPendientes` (usa [] si no falta ninguna captura).");
  for (const p of pendientes) {
    error(/^[a-z0-9][a-z0-9-]*\.webp$/.test(p.archivo), `Captura pendiente «${p.archivo}»: el nombre debe ser minúsculas y terminar en .webp (por ejemplo prueba-01.webp).`);
    error((ETIQUETAS_IMAGEN as readonly string[]).includes(p.etiqueta), `Captura pendiente ${p.archivo}: etiqueta «${p.etiqueta}» no válida.`);
    error(Boolean(p.muestra?.trim()), `Captura pendiente ${p.archivo}: falta indicar qué debe mostrar.`);
    error(!ETIQUETAS_GENERADAS_CON_IA.includes(p.etiqueta) || dicePorIA(p.muestra ?? ""), `Captura pendiente ${p.archivo}: una imagen «${p.etiqueta}» es generada por una IA y su descripción debe decir que será generada con IA.`);
    // Solo aviso: subir la imagen antes de actualizar los datos no debe romper el despliegue.
    aviso(!ctx.existeImagen(`/img/${h.meta.area}/${h.meta.slug}/${p.archivo}`), `Captura pendiente ${p.archivo}: el archivo ya existe en public/img/…; pásalo a \`ejemplo.capturas\` y quítalo de las pendientes.`);
  }
  error(new Set(pendientes.map((p) => p.archivo)).size === pendientes.length, "Hay capturas pendientes con el mismo nombre de archivo.");
  error(!h.publicado || pendientes.length === 0, `Una página publicada no puede tener capturas pendientes (${pendientes.length}).`);
  error(!h.publicado || [...h.ejemplo.capturas, ...(h.metodoCompleto?.capturas ?? [])].some((c) => c.etiqueta === "Prueba real"), "Una página publicada exige al menos 1 captura con etiqueta «Prueba real».");
  // og:image propia obligatoria para publicar (borrador: solo aviso; mientras tanto la página usa el respaldo general del sitio).
  const ogEsperada = `/img/${h.meta.area}/${h.meta.slug}/og.webp`;
  publicada(h.meta.ogImage === ogEsperada, `meta.ogImage debe ser ${ogEsperada} (og:image propia); ahora: ${h.meta.ogImage ?? "sin definir"}.`);
  if (h.meta.ogImage) publicada(ctx.existeImagen(h.meta.ogImage), `og:image ${h.meta.ogImage}: el archivo no existe en public/ (mientras tanto se usa /og-default.webp).`);

  return { errores, avisos, palabras };
}
