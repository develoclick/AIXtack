/**
 * El archivo de texto «Descargar mis datos y prompts (.txt)» de una página de proceso. Se arma en el navegador (esta función
 * es pura: no lee nada del servidor ni envía nada): la fecha, los datos del formulario, los datos de «Mi negocio» que usan los
 * prompts y, paso a paso, los prompts que se ven con esos datos (respetando los formatos marcados).
 */
import { renderPlantilla, type ContextoPlantilla } from "./plantillas";
import { opcionesDelPaso } from "./proceso";
import { etiquetaPerfil } from "./perfil";
import type { Campo, PasoProceso, PerfilClave } from "./tipos";

export interface EntradaArchivo {
  /** AAAA-MM-DD (la fecha de hoy en el navegador de la persona). */
  fecha: string;
  titulo: string;
  /** Dirección de la página, para saber de dónde salió el archivo. */
  url: string;
  campos: readonly Campo[];
  usaPerfil: readonly PerfilClave[];
  contexto: ContextoPlantilla;
  /** El prompt completo de la herramienta (el del paso con `promptMaestro`). */
  promptMaestro: string;
  pasos: readonly PasoProceso[];
}

const LINEA = "=".repeat(60);

/** Nombre del archivo: `{slug}-AAAA-MM-DD.txt`. */
export const nombreDelArchivo = (slug: string, fecha: string) => `${slug}-${fecha}.txt`;

export function armarArchivoDeProceso(e: EntradaArchivo): string {
  const t: string[] = [];
  t.push(e.titulo, LINEA, `Fecha: ${e.fecha}`, `Página: ${e.url}`, "Este archivo se creó en tu navegador; no se envió a ningún servidor.", "");

  t.push("TUS DATOS", "-".repeat(9));
  for (const c of e.campos) t.push(`- ${c.label}: ${(e.contexto.valores[c.id] ?? "").trim() || "(sin dato)"}`);
  const perfil = e.usaPerfil.flatMap((k) => {
    const v = (e.contexto.perfil?.[k] ?? "").trim();
    return v ? [`- ${etiquetaPerfil(k)}: ${v}`] : [];
  });
  if (perfil.length) t.push("", "DATOS DE «MI NEGOCIO» QUE USAN LOS PROMPTS", "-".repeat(41), ...perfil);
  t.push("");

  t.push(`EL PROCESO (${e.pasos.length} pasos)`, LINEA);
  for (const p of e.pasos) {
    t.push("", `PASO ${p.numero} de ${e.pasos.length} · ${p.titulo} (${p.tiempo})`, "-".repeat(20), p.queHaces);
    const prompts: { titulo: string; texto: string; destino: string }[] = [];
    if (p.promptMaestro) prompts.push({ titulo: "Prompt", texto: e.promptMaestro, destino: p.destino ?? "ChatGPT, Gemini o Claude" });
    if (p.prompt) prompts.push({ titulo: "Prompt", texto: renderPlantilla(p.prompt, e.contexto), destino: p.destino ?? "ChatGPT, Gemini o Claude" });
    const opciones = opcionesDelPaso(p, e.contexto);
    if (p.opciones && p.opciones.length > 0 && opciones.length === 0 && p.sinOpciones) t.push("", p.sinOpciones);
    for (const o of opciones) {
      if (o.prompt) prompts.push({ titulo: o.titulo, texto: renderPlantilla(o.prompt, e.contexto), destino: o.destino ?? "ChatGPT, Gemini o Claude" });
      else t.push("", `${o.titulo}: ${o.texto}`);
    }
    if (prompts.length === 0 && opciones.every((o) => !o.prompt) && !p.opciones?.length) t.push("", "Este paso no lleva prompt.");
    for (const pr of prompts) t.push("", `${pr.titulo} (pégalo en ${pr.destino}):`, "", pr.texto);
  }
  t.push("", LINEA, "Revisa siempre el resultado de la IA antes de usarlo.", "");
  return t.join("\n").replace(/\{\{|\}\}/g, "");
}
