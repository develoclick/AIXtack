"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { calcular, simboloMoneda, type EstadoCalculadora } from "@/lib/herramientas/calculadora";
import { renderPlantilla, type ContextoPlantilla } from "@/lib/herramientas/plantillas";
import { ejecutarPreproceso, variablesDePreproceso, type EstadoPreproceso } from "@/lib/herramientas/preprocesos";
import type { Calculadora as CalculadoraDatos, Campo, Perfil, PerfilClave, Preproceso } from "@/lib/herramientas/tipos";
import { construirPrompt } from "@/lib/prompts/construir-prompt";
import { usePerfil } from "./use-perfil";

export interface DatosInteractivos {
  campos: Campo[];
  usaPerfil: PerfilClave[];
  calculadora: CalculadoraDatos | null;
  preproceso?: Preproceso | null;
  tarea: string;
}

const vacios = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, ""]));

export interface EstadoHerramienta {
  datos: DatosInteractivos;
  perfil: Perfil;
  moneda: string;
  valores: Record<string, string>;
  entradas: Record<string, string>;
  estado: EstadoCalculadora | null;
  previo: EstadoPreproceso | null;
  /** Lo que la página calcula y las plantillas nombran con `{{variable}}` (palabras contadas, texto de cada nivel…). */
  variables: Record<string, string>;
  /** El prompt completo de la herramienta (reglas comunes, datos, cálculos y tarea). */
  prompt: string;
  /** Etiquetas de los campos obligatorios que faltan. */
  faltan: string[];
  conEjemplo: boolean;
  setValor: (id: string, valor: string) => void;
  setEntrada: (id: string, valor: string) => void;
  probarConEjemplo: () => void;
  limpiar: () => void;
  /** Contexto para construir cualquier otro prompt (los de los pasos de un proceso) con los mismos datos. */
  contexto: ContextoPlantilla;
  /** Construye el prompt de un paso a partir de su plantilla. */
  construir: (plantilla: string) => string;
}

const Contexto = createContext<EstadoHerramienta | null>(null);

/** Todo lo que cambia con los datos de la persona vive aquí: el formulario, la calculadora, el pre-proceso y los prompts. */
export function ProveedorHerramienta({ datos, children }: { datos: DatosInteractivos; children: ReactNode }) {
  const { campos, usaPerfil, calculadora, preproceso, tarea } = datos;
  const perfil = usePerfil();
  const [valores, setValores] = useState<Record<string, string>>(() => vacios(campos.map((c) => c.id)));
  const [entradas, setEntradas] = useState<Record<string, string>>(() => vacios(calculadora?.entradas.map((e) => e.id) ?? []));
  const [conEjemplo, setConEjemplo] = useState(false);

  const moneda = simboloMoneda(perfil.moneda);
  const estado = useMemo(() => (calculadora ? calcular(calculadora, entradas, perfil.moneda) : null), [calculadora, entradas, perfil.moneda]);
  const previo = useMemo(() => (preproceso ? ejecutarPreproceso(preproceso, valores, perfil.moneda) : null), [preproceso, valores, perfil.moneda]);
  const variables = useMemo(() => variablesDePreproceso(preproceso, previo), [preproceso, previo]);

  const prompt = useMemo(
    () =>
      construirPrompt(
        perfil,
        campos.map((c) => ({ id: c.id, label: c.label, valor: valores[c.id], requerido: c.requerido })),
        [
          ...(estado ? estado.resultados.filter((r) => r.enPrompt && !(r.opcional && r.valor === null)).map((r) => ({ etiqueta: r.etiqueta, texto: r.texto })) : []),
          ...(previo && previo.completo ? previo.resultados.filter((r) => r.enPrompt !== false).map((r) => ({ etiqueta: r.etiqueta, texto: r.texto })) : []),
        ],
        tarea,
        { usaPerfil, variables }
      ),
    [perfil, campos, valores, estado, previo, tarea, usaPerfil, variables]
  );

  const contexto = useMemo<ContextoPlantilla>(() => ({ campos, valores, perfil, variables }), [campos, valores, perfil, variables]);
  const faltan = useMemo(() => campos.filter((c) => c.requerido && !valores[c.id]?.trim()).map((c) => c.label), [campos, valores]);

  const valor = useMemo<EstadoHerramienta>(
    () => ({
      datos,
      perfil,
      moneda,
      valores,
      entradas,
      estado,
      previo,
      variables,
      prompt,
      faltan,
      conEjemplo,
      setValor: (id, v) => {
        setValores((prev) => ({ ...prev, [id]: v }));
        setConEjemplo(false);
      },
      setEntrada: (id, v) => {
        setEntradas((prev) => ({ ...prev, [id]: v }));
        setConEjemplo(false);
      },
      probarConEjemplo: () => {
        setValores(Object.fromEntries(campos.map((c) => [c.id, c.ejemplo])));
        setEntradas(Object.fromEntries((calculadora?.entradas ?? []).map((e) => [e.id, e.ejemplo])));
        setConEjemplo(true);
      },
      limpiar: () => {
        setValores(vacios(campos.map((c) => c.id)));
        setEntradas(vacios(calculadora?.entradas.map((e) => e.id) ?? []));
        setConEjemplo(false);
      },
      contexto,
      construir: (plantilla) => renderPlantilla(plantilla, contexto),
    }),
    [datos, perfil, moneda, valores, entradas, estado, previo, variables, prompt, faltan, conEjemplo, campos, calculadora, contexto]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useHerramienta(): EstadoHerramienta {
  const v = useContext(Contexto);
  if (!v) throw new Error("useHerramienta se usa dentro de <ProveedorHerramienta>.");
  return v;
}

/** ¿Hay un proveedor por encima? (para los componentes que también pueden usarse solos) */
export function useHerramientaOpcional(): EstadoHerramienta | null {
  return useContext(Contexto);
}
