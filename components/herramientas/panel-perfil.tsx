"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { borrarPerfil, CAMPOS_PERFIL, guardarPerfil, perfilVacio, TEXTO_PRIVACIDAD } from "@/lib/herramientas/perfil";
import type { Perfil, PerfilClave } from "@/lib/herramientas/tipos";
import { CampoFormulario, claseCampo } from "./campo-formulario";
import { usePerfil } from "./use-perfil";

/**
 * Formulario del perfil «Mi negocio». Se usa en /mi-negocio y dentro del PanelPerfil de cada herramienta.
 * Funciona aunque el navegador no permita guardar: en ese caso el perfil vive en memoria hasta cerrar la pestaña.
 */
export function FormularioPerfil({ claves }: { claves?: readonly PerfilClave[] }) {
  const guardado = usePerfil();
  const [borrador, setBorrador] = useState<Perfil | null>(null);
  const [mensaje, setMensaje] = useState("");
  const valores = borrador ?? guardado;
  const campos = claves ? CAMPOS_PERFIL.filter((c) => claves.includes(c.clave)) : CAMPOS_PERFIL;

  function cambiar(clave: PerfilClave, valor: string) {
    setBorrador({ ...valores, [clave]: valor });
    setMensaje("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        guardarPerfil({ ...guardado, ...valores });
        setBorrador(null);
        setMensaje("Guardado en este navegador ✓");
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {campos.map((campo) => (
          <CampoFormulario key={campo.clave} etiqueta={campo.label} className={campo.largo ? "sm:col-span-2" : ""}>
            {({ id, describedBy }) =>
              campo.tipo === "seleccion" ? (
                <select id={id} value={valores[campo.clave] ?? ""} onChange={(e) => cambiar(campo.clave, e.target.value)} aria-describedby={describedBy} className={claseCampo}>
                  <option value="">Sin indicar</option>
                  {campo.opciones?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input id={id} type="text" value={valores[campo.clave] ?? ""} placeholder={`Por ejemplo: ${campo.ejemplo}`} onChange={(e) => cambiar(campo.clave, e.target.value)} aria-describedby={describedBy} maxLength={400} className={claseCampo} />
              )
            }
          </CampoFormulario>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" className="guide-focus inline-flex min-h-11 items-center rounded-lg border border-guide-ink bg-guide-ink px-4 text-sm font-semibold text-background hover:bg-guide-ink/90">
          Guardar mis datos
        </button>
        <button
          type="button"
          disabled={perfilVacio(guardado) && perfilVacio(valores)}
          onClick={() => {
            borrarPerfil();
            setBorrador(null);
            setMensaje("Datos borrados de este navegador.");
          }}
          className="guide-focus inline-flex min-h-11 items-center rounded-lg border border-foreground/50 bg-background px-4 text-sm font-semibold text-foreground hover:bg-guide-surface disabled:opacity-50"
        >
          Borrar mis datos
        </button>
        <p role="status" aria-live="polite" className="text-sm text-ok">
          {mensaje}
        </p>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{TEXTO_PRIVACIDAD}</p>
    </form>
  );
}

/** Panel desplegable «Mi negocio» dentro de cada herramienta: solo pide los campos que esa herramienta usa. */
export function PanelPerfil({ claves }: { claves: readonly PerfilClave[] }) {
  const perfil = usePerfil();
  const usados = claves.filter((c) => perfil[c]).length;

  return (
    <details className="group rounded-xl border bg-guide-surface">
      <summary className="guide-focus flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-guide-ink">
        <span>
          Mi negocio <span className="font-normal text-muted-foreground">· {usados > 0 ? `${usados} de ${claves.length} datos completados` : "opcional: completa tus datos una vez y se reutilizan"}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t px-4 pb-5 pt-4">
        <FormularioPerfil claves={claves} />
        <p className="mt-2 text-sm">
          <Link href="/mi-negocio" className="guide-focus inline-flex min-h-11 items-center font-medium text-guide-ink underline underline-offset-2">
            Ver o editar todo mi perfil
          </Link>
        </p>
      </div>
    </details>
  );
}
