"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Download, ImagePlus, Loader2, X } from "lucide-react";
import { descargarBlob } from "@/components/plan/descargar";
import { cargarFotoProducto, canvasABlob, dibujarFichaProducto, type ImagenProducto } from "@/lib/catalogo-productos/canvas";
import { itemsDeCelda, type FilaCatalogo, type Plantilla } from "@/lib/catalogo-productos/tipos";

function FichaProducto({ f, plantilla, empresa, bloqueado, alAviso }: { f: FilaCatalogo; plantilla: Plantilla; empresa: string; bloqueado: boolean; alAviso: (t: string) => void }) {
  const [foto, setFoto] = useState<ImagenProducto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function alSubir(archivo: File | undefined) {
    if (!archivo) return;
    setError(null);
    try {
      foto?.revocar();
      setFoto(await cargarFotoProducto(archivo));
    } catch (e) {
      setFoto(null);
      setError(e instanceof Error ? e.message : "No se pudo leer la foto.");
    }
  }

  function quitarFoto() {
    foto?.revocar();
    setFoto(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function descargar() {
    setGenerando(true);
    setError(null);
    try {
      const canvas = dibujarFichaProducto({ nombre: f.nombre, descripcion: f.descripcion, especificaciones: itemsDeCelda(f.especificaciones), precio: f.precio, precioPromo: f.precioPromo, categoria: f.categoria, cta: f.cta, empresa }, plantilla, foto?.img ?? null);
      const blob = await canvasABlob(canvas);
      descargarBlob(`ficha-${f.nombre.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "producto"}.png`, blob);
      alAviso(`Ficha de «${f.nombre}» descargada.`);
    } catch {
      setError("No se pudo generar la imagen. Prueba con otra foto.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <li className="tarjeta space-y-3 p-3">
      <div>
        <p className="text-sm font-semibold">{f.nombre}</p>
        <p className="text-xs text-muted-foreground">{f.categoria || "Sin categoría"} · {f.precioPromo.trim() || f.precio}</p>
      </div>

      {!foto ? (
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-4 text-center text-xs text-muted-foreground hover:border-brand-solid hover:text-foreground">
          <ImagePlus aria-hidden className="size-5" />
          <span className="font-semibold">Sube una foto (opcional)</span>
          <span>Se queda en tu navegador: no se sube a ningún servidor.</span>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => void alSubir(e.target.files?.[0])} />
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border bg-surface p-2">
          <img src={foto.img.src} alt={`Foto de ${f.nombre}`} className="size-16 shrink-0 rounded object-cover" />
          <button type="button" className="btn btn-texto text-xs" onClick={quitarFoto}>
            <X aria-hidden className="size-3.5" /> Quitar
          </button>
        </div>
      )}

      <button type="button" className="btn btn-secundario w-full text-sm" onClick={descargar} disabled={bloqueado || generando}>
        {generando ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Download aria-hidden className="size-4" />}
        {generando ? "Generando…" : "Descargar ficha PNG"}
      </button>
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}

/** Laboratorio de fichas: una foto opcional por producto (solo en memoria) y una ficha PNG de 1080×1350 por producto, generada en el navegador con canvas. */
export function LaboratorioFichas({ filas, plantilla, empresa, bloqueado, alAviso }: { filas: FilaCatalogo[]; plantilla: Plantilla; empresa: string; bloqueado: boolean; alAviso: (t: string) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Sube una foto por producto (opcional) y descarga su ficha en PNG (1080×1350), lista para publicar en redes. Sin foto, la ficha usa un fondo de color con la inicial del producto.</p>
      {bloqueado && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          La descarga está bloqueada: revisa los precios que no coinciden antes de generar las fichas.
        </p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filas.map((f, i) => (
          <FichaProducto key={`${f.nombreOriginal}-${i}`} f={f} plantilla={plantilla} empresa={empresa} bloqueado={bloqueado} alAviso={alAviso} />
        ))}
      </ul>
    </div>
  );
}
