import { normalizarDatosPlanNegocio, type DatosPlanNegocio } from "./tipos";

const VERSION_PROYECTO = 1;

/** Exporta el proyecto a un texto .json (para hacer una copia de seguridad o pasarlo a otro navegador). */
export function exportarProyectoJson(d: DatosPlanNegocio): string {
  return JSON.stringify({ version: VERSION_PROYECTO, herramienta: "crear-plan-de-negocio", datos: d }, null, 2);
}

export interface ProyectoImportado {
  datos: DatosPlanNegocio;
}

/** Lee un .json exportado por esta misma herramienta. Devuelve null si el texto no es JSON o no trae datos reconocibles. */
export function importarProyectoJson(texto: string): ProyectoImportado | null {
  let obj: unknown;
  try {
    obj = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const contenedor = obj as Record<string, unknown>;
  const crudo = contenedor.datos && typeof contenedor.datos === "object" ? contenedor.datos : contenedor;
  return { datos: normalizarDatosPlanNegocio(crudo as Record<string, unknown>) };
}

/** Nombre de archivo del proyecto exportado. */
export function nombreDeArchivoProyecto(nombreEmpresa: string): string {
  const base = nombreEmpresa
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `plan-de-negocio-${base || "proyecto"}.json`;
}
