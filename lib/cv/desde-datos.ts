import { ENCABEZADOS } from "./prompt";
import type { CvDocumento, CvSeccion, DatosCv } from "./tipos";

const lineas = (texto: string) =>
  texto
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

function rango(inicio: string, fin: string): string {
  return [inicio.trim(), fin.trim()].filter(Boolean).join(" – ");
}

/**
 * Hoja de vida armada SOLO con lo que la persona escribió, sin IA y sin reescribir nada: sirve como punto de partida en Word
 * (mismo formato Harvard). No optimiza palabras clave ni redacta viñetas: para eso está el prompt.
 */
export function cvDesdeDatos(d: DatosCv): CvDocumento {
  const h = ENCABEZADOS[d.idioma];
  const educacionPrimero = d.nivel === "sin-experiencia" || d.nivel === "junior";

  const perfil: CvSeccion = { titulo: h.perfil, parrafos: d.resumen.trim() ? [d.resumen.trim().replace(/\s*\n\s*/g, " ")] : [], entradas: [], puntos: [] };

  const experiencia: CvSeccion = {
    titulo: h.experiencia,
    parrafos: [],
    entradas: d.experiencias
      .filter((e) => [e.cargo, e.empresa, e.logros].some((x) => x.trim()))
      .map((e) => ({ izq1: e.empresa.trim(), der1: e.lugar.trim(), izq2: e.cargo.trim(), der2: rango(e.inicio, e.fin), puntos: lineas(e.logros) })),
    puntos: [],
  };

  const educacion: CvSeccion = {
    titulo: h.educacion,
    parrafos: [],
    entradas: d.estudios
      .filter((e) => [e.titulo, e.institucion].some((x) => x.trim()))
      .map((e) => ({ izq1: e.institucion.trim(), der1: e.lugar.trim(), izq2: e.titulo.trim(), der2: rango(e.inicio, e.fin), puntos: lineas(e.detalle) })),
    puntos: [],
  };

  const habilidades: CvSeccion = { titulo: h.habilidades, parrafos: [], entradas: [], puntos: lineas(d.habilidades) };
  const idiomas: CvSeccion = { titulo: h.idiomas, parrafos: [], entradas: [], puntos: lineas(d.idiomas) };
  const certificaciones: CvSeccion = { titulo: h.certificaciones, parrafos: [], entradas: [], puntos: lineas(d.certificaciones) };
  const proyectos: CvSeccion = { titulo: h.proyectos, parrafos: [], entradas: [], puntos: lineas(d.proyectos) };

  const nucleo = educacionPrimero ? [educacion, experiencia] : [experiencia, educacion];
  const secciones = [perfil, ...nucleo, proyectos, certificaciones, habilidades, idiomas].filter((s) => s.parrafos.length + s.entradas.length + s.puntos.length > 0);

  return {
    nombre: d.nombre.trim(),
    contacto: [d.ciudad, d.email, d.telefono, d.linkedin, d.web].map((x) => x.trim()).filter(Boolean),
    secciones,
  };
}
