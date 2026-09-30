"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Download, ImagePlus, Loader2, X } from "lucide-react";
import { descargarBlob } from "@/components/plan/descargar";
import { cargarImagenDesdeArchivo, crearZipFavicons, generarFavicons, type FaviconGenerado, type ImagenCargada } from "@/lib/logo/favicon";
import { TAMANOS_FAVICON } from "@/lib/logo/tipos";

/** Prueba visual local (canvas, en el navegador): fondo claro/oscuro, tamaños pequeños, perfil circular, tarjeta y fachada. Nada de lo que subas sale de tu navegador. */
export function LaboratorioLogo({ nombreEmpresa }: { nombreEmpresa: string }) {
  const [imagen, setImagen] = useState<ImagenCargada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [favicons, setFavicons] = useState<FaviconGenerado[] | null>(null);
  const [generando, setGenerando] = useState(false);
  const [creandoZip, setCreandoZip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function alSubir(archivo: File | undefined) {
    if (!archivo) return;
    setError(null);
    setFavicons(null);
    try {
      imagen?.revocar();
      setImagen(await cargarImagenDesdeArchivo(archivo));
    } catch (e) {
      setImagen(null);
      setError(e instanceof Error ? e.message : "No se pudo leer la imagen.");
    }
  }

  function quitar() {
    imagen?.revocar();
    setImagen(null);
    setFavicons(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function generar() {
    if (!imagen) return;
    setGenerando(true);
    try {
      setFavicons(await generarFavicons(imagen.img));
    } catch {
      setError("No se pudieron generar los tamaños. Prueba con otra imagen.");
    } finally {
      setGenerando(false);
    }
  }

  async function descargarZip() {
    if (!favicons) return;
    setCreandoZip(true);
    try {
      const zip = await crearZipFavicons(favicons, nombreEmpresa || "logo");
      descargarBlob(`${nombreEmpresa.trim() || "logo"}-favicons.zip`, zip);
    } catch {
      setError("No se pudo crear el archivo .zip.");
    } finally {
      setCreandoZip(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Genera tu logo en el prompt de imagen que copiaste, descárgalo como PNG con fondo transparente si puedes, y súbelo aquí para probarlo antes de usarlo en cualquier lado.</p>

      {!imagen ? (
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground hover:border-brand-solid hover:text-foreground">
          <ImagePlus aria-hidden className="size-6" />
          <span className="font-semibold">Sube tu logo (PNG, JPG, WebP o SVG)</span>
          <span className="text-xs">Se queda en tu navegador: no se sube a ningún servidor.</span>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(e) => alSubir(e.target.files?.[0])} />
        </label>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Vista previa</p>
            <button type="button" className="btn btn-texto" onClick={quitar}>
              <X aria-hidden className="size-4" /> Quitar imagen
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <p className="mb-2 text-xs font-semibold text-neutral-500">Fondo claro</p>
              <img src={imagen.img.src} alt="Tu logo sobre fondo claro" className="mx-auto h-20 object-contain" />
            </div>
            <div className="rounded-lg border p-4" style={{ background: "#0a0a0a" }}>
              <p className="mb-2 text-xs font-semibold text-neutral-400">Fondo oscuro</p>
              <img src={imagen.img.src} alt="Tu logo sobre fondo oscuro" className="mx-auto h-20 object-contain" />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Tamaños pequeños (16, 32 y 64 px)</p>
            <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4">
              {[16, 32, 64].map((t) => (
                <div key={t} className="flex flex-col items-center gap-1">
                  <img src={imagen.img.src} alt={`Tu logo a ${t} px`} style={{ width: t, height: t }} className="object-contain" />
                  <span className="text-xs text-neutral-500 tabular">{t} px</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-white p-4 text-center">
              <p className="mb-2 text-xs font-semibold text-neutral-500">Perfil circular</p>
              <img src={imagen.img.src} alt="Tu logo en un perfil circular" className="mx-auto size-16 rounded-full border object-cover" />
            </div>
            <div className="rounded-lg border bg-white p-4 text-center">
              <p className="mb-2 text-xs font-semibold text-neutral-500">Tarjeta</p>
              <div className="mx-auto flex h-16 w-28 items-center justify-center rounded border bg-neutral-50">
                <img src={imagen.img.src} alt="Tu logo en una tarjeta de presentación" className="h-10 object-contain" />
              </div>
            </div>
            <div className="rounded-lg border p-4 text-center" style={{ background: "#2b2622" }}>
              <p className="mb-2 text-xs font-semibold text-neutral-300">Fachada</p>
              <img src={imagen.img.src} alt="Tu logo simulado en una fachada" className="mx-auto h-10 object-contain" />
            </div>
          </div>

          <div className="rounded-lg border bg-surface p-4">
            <p className="text-sm font-semibold">Favicon y avatar</p>
            <p className="mt-1 text-xs text-muted-foreground">Genera tu logo en {TAMANOS_FAVICON.join(", ")} px, listos para el sitio web y las redes.</p>
            <button type="button" className="btn btn-secundario mt-3" onClick={generar} disabled={generando}>
              {generando ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
              {generando ? "Generando…" : "Generar tamaños"}
            </button>
            {favicons && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-end gap-4">
                  {favicons.map((f) => (
                    <div key={f.tamano} className="flex flex-col items-center gap-1 rounded border bg-white p-2">
                      <img src={f.url} alt={`Favicon de ${f.tamano} px`} style={{ width: Math.min(f.tamano, 64), height: Math.min(f.tamano, 64) }} />
                      <span className="text-xs text-neutral-500 tabular">{f.tamano} px</span>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-primario" onClick={descargarZip} disabled={creandoZip}>
                  {creandoZip ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Download aria-hidden className="size-4" />}
                  {creandoZip ? "Creando .zip…" : "Descargar .zip"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
