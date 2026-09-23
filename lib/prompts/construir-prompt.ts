/**
 * construirPrompt(perfil, campos, calculos, tarea, opciones) arma el texto que la persona copia y pega en su
 * IA. Garantías (con pruebas en construir-prompt.test.ts):
 *  - el resultado NUNCA contiene llaves dobles: cada `{{id}}` de la tarea se sustituye por el valor del
 *    campo, y cualquier hueco que quede sin dato se marca [FALTA] o «no indicado»;
 *  - un campo requerido vacío se marca [FALTA]; uno opcional vacío se omite;
 *  - un cálculo sin valor se marca [FALTA]; los cálculos se presentan como ya hechos por la página y con
 *    la orden de no recalcularlos;
 *  - del perfil solo viajan los campos que la herramienta declara en `usaPerfil` y que tienen texto.
 */
import { etiquetaPerfil } from "../herramientas/perfil";
import type { Perfil, PerfilClave } from "../herramientas/tipos";
import { CIERRE_COMUN } from "./cierre-comun";
import { INTRO_REGLAS, REGLAS_COMUNES } from "./reglas-comunes";

export interface CampoConValor {
  id: string;
  label: string;
  valor?: string;
  requerido?: boolean;
}

export interface CalculoConValor {
  etiqueta: string;
  /** Texto ya formateado; `null` si la calculadora no pudo calcularlo. */
  texto: string | null;
}

export interface OpcionesPrompt {
  usaPerfil?: readonly PerfilClave[];
}

const FALTA = "[FALTA]";
const NO_INDICADO = "no indicado";

const limpio = (texto: string | undefined) => (texto ?? "").replace(/\r\n/g, "\n").trim();

/** Sustituye los `{{id}}` de la tarea por el valor del campo (o por [FALTA] / «no indicado»). */
export function rellenarTarea(tarea: string, campos: readonly CampoConValor[]): string {
  const relleno = tarea.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (_todo, id: string) => {
    const campo = campos.find((c) => c.id === id);
    if (!campo) return FALTA;
    const valor = limpio(campo.valor);
    if (valor) return valor;
    return campo.requerido ? `${FALTA.slice(0, -1)}: ${campo.label}]` : NO_INDICADO;
  });
  // Cinturón y tirantes: si quedara alguna llave suelta, no llega al prompt.
  return relleno.replace(/\{\{|\}\}/g, "");
}

export function construirPrompt(
  perfil: Perfil,
  campos: readonly CampoConValor[],
  calculos: readonly CalculoConValor[] | null,
  tarea: string,
  opciones: OpcionesPrompt = {}
): string {
  const partes: string[] = [];

  partes.push([INTRO_REGLAS, ...REGLAS_COMUNES.map((regla, i) => `${i + 1}. ${regla}`)].join("\n"));

  const lineasPerfil = (opciones.usaPerfil ?? []).flatMap((clave) => {
    const valor = limpio(perfil[clave]);
    return valor ? [`- ${etiquetaPerfil(clave)}: ${valor}`] : [];
  });
  if (lineasPerfil.length > 0) partes.push(["DATOS DE MI NEGOCIO", ...lineasPerfil].join("\n"));

  const lineasCampos = campos.flatMap((campo) => {
    const valor = limpio(campo.valor);
    if (valor) return [valor.includes("\n") ? `- ${campo.label}:\n${valor}` : `- ${campo.label}: ${valor}`];
    return campo.requerido ? [`- ${campo.label}: ${FALTA}`] : [];
  });
  if (lineasCampos.length > 0) partes.push(["DATOS DE ESTA TAREA", ...lineasCampos].join("\n"));

  if (calculos && calculos.length > 0) {
    partes.push(
      [
        "CÁLCULOS YA HECHOS (los calculó la página; úsalos tal cual, no los recalcules ni los cambies)",
        ...calculos.map((c) => `- ${c.etiqueta}: ${c.texto ?? FALTA}`),
      ].join("\n")
    );
  }

  partes.push(["TAREA", rellenarTarea(limpio(tarea), campos)].join("\n"));
  partes.push(CIERRE_COMUN);

  // Garantía final: ni siquiera un texto pegado por la persona puede dejar llaves dobles en el prompt.
  return partes.join("\n\n").replace(/\{\{|\}\}/g, "");
}
