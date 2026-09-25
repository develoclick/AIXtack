/**
 * Plantillas de los prompts de un proceso (y de la `tarea` de la herramienta). Un texto con marcas se convierte en el prompt
 * final con los datos del formulario, del perfil «Mi negocio» y las variables que calcula la página. Garantía (con pruebas):
 * el resultado NUNCA contiene llaves dobles; lo que falta se marca [FALTA: …] o «no indicado», nunca se inventa.
 *
 * Marcas:
 *  - `{{id}}`                 valor de un campo del formulario (vacío: [FALTA: etiqueta] si es requerido, «no indicado» si no);
 *  - `{{id|texto}}`           lo mismo, pero con «texto» cuando el campo está vacío;
 *  - `{{perfil.nombre|mi negocio}}`  dato del perfil «Mi negocio», con su texto de reserva;
 *  - `{{variable}}`           valor que calcula la página (por ejemplo, las palabras contadas o el texto de un nivel);
 *  - `{{#si condición}}…{{/si}}`  el bloque solo entra si se cumple la condición (ver `Condicion` en tipos.ts). Sin anidar.
 */
import type { Condicion, Perfil, PerfilClave } from "./tipos";
import { SEPARADOR_CASILLAS } from "./tipos";

export interface CampoPlantilla {
  id: string;
  label: string;
  requerido?: boolean;
}

export interface ContextoPlantilla {
  campos: readonly CampoPlantilla[];
  valores: Readonly<Record<string, string | undefined>>;
  perfil?: Perfil;
  variables?: Readonly<Record<string, string>>;
}

const FALTA = "[FALTA]";
const NO_INDICADO = "no indicado";
const limpio = (t: string | undefined) => (t ?? "").replace(/\r\n/g, "\n").trim();

/** Las opciones marcadas de un campo `casillas` (su valor es la lista unida con SEPARADOR_CASILLAS). */
export function opcionesMarcadas(valor: string | undefined): string[] {
  return limpio(valor)
    .split(SEPARADOR_CASILLAS.trim())
    .map((o) => o.trim())
    .filter(Boolean);
}

/** Valor de una referencia: `perfil.clave`, una variable de la página o un campo del formulario ("" si no existe o está vacío). */
export function valorDe(ref: string, ctx: ContextoPlantilla): string {
  if (ref.startsWith("perfil.")) return limpio(ctx.perfil?.[ref.slice("perfil.".length) as PerfilClave]);
  if (ctx.variables && ref in ctx.variables) return limpio(ctx.variables[ref]);
  return limpio(ctx.valores[ref]);
}

/** ¿Se cumple la condición? Sin condición, siempre. Ver `Condicion` en tipos.ts. */
export function cumple(condicion: Condicion | undefined, ctx: ContextoPlantilla): boolean {
  if (!condicion || !condicion.trim()) return true;
  return condicion.split("|").some((parte) => {
    const c = parte.trim();
    if (!c) return false;
    if (c.startsWith("!")) return !cumple(c.slice(1), ctx);
    const iIgual = c.indexOf("=");
    const iContiene = c.indexOf("~");
    if (iIgual >= 0 && (iContiene < 0 || iIgual < iContiene)) return valorDe(c.slice(0, iIgual).trim(), ctx) === c.slice(iIgual + 1).trim();
    if (iContiene >= 0) return opcionesMarcadas(valorDe(c.slice(0, iContiene).trim(), ctx)).includes(c.slice(iContiene + 1).trim());
    return valorDe(c, ctx) !== "";
  });
}

const BLOQUE_SI = /\{\{#si ([^{}]+?)\}\}([\s\S]*?)\{\{\/si\}\}/g;
const MARCA = /\{\{\s*([^{}#/][^{}]*?)\s*\}\}/g;

/** Nombres que cita una plantilla: marcas (sin el texto de reserva) y condiciones. Lo usa el validador. */
export function referenciasDe(plantilla: string): { marcas: string[]; condiciones: string[]; anidado: boolean } {
  const condiciones = [...plantilla.matchAll(BLOQUE_SI)].map((m) => m[1].trim());
  const sinBloques = plantilla.replace(BLOQUE_SI, (_t, _c, contenido: string) => contenido);
  const marcas = [...sinBloques.matchAll(MARCA)].map((m) => m[1].split("|")[0].trim());
  return { marcas, condiciones, anidado: [...plantilla.matchAll(BLOQUE_SI)].some((m) => m[2].includes("{{#si")) };
}

/** Ids de campos y variables que una condición usa (sin los operadores ni los valores). */
export function nombresDeCondicion(condicion: Condicion): string[] {
  return condicion
    .split("|")
    .map((p) => p.trim().replace(/^!/, ""))
    .filter(Boolean)
    .map((c) => c.split(/[=~]/)[0].trim());
}

export function renderPlantilla(plantilla: string, ctx: ContextoPlantilla): string {
  // El esqueleto (texto de la plantilla) se ordena ANTES de poner los datos: así los textos que pega la persona no se tocan.
  const conBloques = plantilla
    .replace(BLOQUE_SI, (_todo, condicion: string, contenido: string) => (cumple(condicion, ctx) ? contenido : ""))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/(\S) {2,}/g, "$1 ")
    .replace(/\n{3,}/g, "\n\n");
  const relleno = conBloques.replace(MARCA, (_todo, cuerpo: string) => {
    const [refCrudo, ...resto] = cuerpo.split("|");
    const ref = refCrudo.trim();
    const reserva = resto.length ? resto.join("|").trim() : undefined;
    const valor = valorDe(ref, ctx);
    if (valor) return valor;
    if (reserva !== undefined) return reserva;
    if (ref.startsWith("perfil.")) return NO_INDICADO;
    if (ctx.variables && ref in ctx.variables) return FALTA;
    const campo = ctx.campos.find((c) => c.id === ref);
    if (!campo) return FALTA;
    return campo.requerido ? `${FALTA.slice(0, -1)}: ${campo.label}]` : NO_INDICADO;
  });
  return relleno.replace(/\{\{|\}\}/g, "").trim();
}
