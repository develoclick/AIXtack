/** Registro de validación (paso 3): entrevistas, búsquedas, preventas o mini campañas que hiciste para probar un nicho. Vive en su propio almacén, separado del formulario principal. */
export type TipoValidacion = "entrevista" | "busqueda" | "preventa" | "campana" | "otro";
export const TIPOS_VALIDACION: { valor: TipoValidacion; etiqueta: string }[] = [
  { valor: "entrevista", etiqueta: "Entrevista" },
  { valor: "busqueda", etiqueta: "Búsqueda de mercado" },
  { valor: "preventa", etiqueta: "Preventa" },
  { valor: "campana", etiqueta: "Mini campaña" },
  { valor: "otro", etiqueta: "Otro" },
];

export interface EntradaValidacion {
  id: string;
  /** Nombre del nicho (texto libre, no un id): los nichos se releen del CSV pegado y su id puede cambiar entre lecturas. */
  nichoNombre: string;
  fecha: string;
  tipo: TipoValidacion;
  resultado: string;
  /** null = todavía sin evaluar frente al criterio de éxito que definiste antes de empezar. */
  cumpleCriterio: boolean | null;
}

export function entradaVacia(id: string): EntradaValidacion {
  return { id, nichoNombre: "", fecha: "", tipo: "entrevista", resultado: "", cumpleCriterio: null };
}

export interface DatosRegistroNichos {
  items: EntradaValidacion[];
}

export function registroVacio(): DatosRegistroNichos {
  return { items: [] };
}

export interface ResumenValidacion {
  total: number;
  cumple: number;
  noCumple: number;
  sinEvaluar: number;
}

/** Resumen de patrones: cuántas validaciones cumplieron el criterio de éxito que definiste antes de empezar. */
export function resumenDeValidacion(items: EntradaValidacion[]): ResumenValidacion {
  return { total: items.length, cumple: items.filter((i) => i.cumpleCriterio === true).length, noCumple: items.filter((i) => i.cumpleCriterio === false).length, sinEvaluar: items.filter((i) => i.cumpleCriterio === null).length };
}
