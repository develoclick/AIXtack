"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowRight,
  ImageIcon,
  PenLine,
  Code2,
  AudioLines,
  Sparkles,
  TrendingUp,
  Layers,
} from "lucide-react";

// Siluetas abstractas locales en Base64 para evitar errores de dominios en Next.js
const SILHOUETTE_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233062ef' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z'/><path d='M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z'/></svg>";

const CATEGORIES = [
  {
    id: "cat-01",
    title: "Generación de Imágenes",
    count: "62 herramientas",
    icon: ImageIcon,
    href: "/categoria/imagenes",
    badge: "Más buscado",
    silhouette: SILHOUETTE_IMAGE,
  },
  {
    id: "cat-02",
    title: "Escritura y Copywriting",
    count: "94 herramientas",
    icon: PenLine,
    href: "/categoria/escritura",
    badge: "Alto RPM",
    silhouette: SILHOUETTE_IMAGE,
  },
  {
    id: "cat-03",
    title: "Código y Programación",
    count: "58 herramientas",
    icon: Code2,
    href: "/categoria/codigo",
    badge: "Top CTR",
    silhouette: SILHOUETTE_IMAGE,
  },
  {
    id: "cat-04",
    title: "Voz y Sintetización",
    count: "31 herramientas",
    icon: AudioLines,
    href: "/categoria/audio",
    badge: "Tendencia",
    silhouette: SILHOUETTE_IMAGE,
  },
];

export function Hero() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 transition-colors duration-300 isolate">
      
      {/* 1. GRADIENTES DE FONDO MULTICAPA & GLOWS */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Glow Superior Central (#3062ef) */}
        <div className="absolute left-1/2 -top-40 -translate-x-1/2 h-[500px] w-[800px] sm:w-[1100px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3062ef]/30 via-[#3062ef]/10 to-transparent blur-[120px] dark:from-[#3062ef]/25 dark:via-[#3062ef]/05 dark:to-transparent" />
        
        {/* Glow Secundario Inferior */}
        <div className="absolute -right-20 bottom-0 h-[400px] w-[500px] rounded-full bg-gradient-to-br from-emerald-500/15 via-[#3062ef]/10 to-transparent blur-[100px] dark:from-emerald-500/10 dark:via-[#3062ef]/05" />

        {/* Patrón de Puntos de Fondo CSS Seguro */}
        <div className="absolute inset-0 bg-[radial-gradient(#3062ef_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-15 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        

        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Columna Izquierda: Información Principal */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Pill Indicator */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#3062ef]/30 bg-gradient-to-r from-[#3062ef]/10 via-[#3062ef]/05 to-transparent dark:from-[#3062ef]/20 dark:via-[#3062ef]/10 px-4 py-1.5 text-xs font-semibold text-[#3062ef] dark:text-[#5c84f5] backdrop-blur-md shadow-sm">
              <Sparkles className="size-3.5 text-[#3062ef] dark:text-[#5c84f5] shrink-0 animate-pulse" />
              <span>Directorio verificado · Actualizado diariamente</span>
            </div>

            {/* Titular con Gradiente Dinámico */}
            <h1 className="text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-[1.08]">
              Descubre las mejores{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#3062ef] via-blue-500 to-emerald-500 dark:from-[#5c84f5] dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Herramientas de IA
                </span>
                <span className="absolute left-0 bottom-1 -z-10 h-3 w-full bg-[#3062ef]/15 dark:bg-[#3062ef]/25 blur-sm rounded-full" />
              </span>
            </h1>

            <p className="mt-5 text-balance text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              Catálogo Curado en español. Filtra plataformas probadas, analiza sus precios, consulta casos de uso y encuentra alternativas potentes en segundos.
            </p>

            {/* Buscador Integrado */}
            <form 
              onSubmit={(e) => e.preventDefault()} 
              className="mt-8 w-full max-w-lg relative group"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#3062ef] to-emerald-500 opacity-20 blur group-hover:opacity-40 transition duration-300" />
              
              <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 p-2 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl">
                <Search className="ml-3 size-5 text-slate-400 dark:text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Busca por función: 'Generar video', 'Prompts'..."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3062ef] to-[#254edb] hover:from-[#254edb] hover:to-[#1d3fbc] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#3062ef]/30 transition-all duration-200 shrink-0 active:scale-95"
                >
                  <span>Explorar</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </form>

            {/* Badges de Confianza */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                +500 IAs clasificadas
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>
              <span className="flex items-center gap-1.5">
                <Layers className="size-4 text-[#3062ef] dark:text-[#5c84f5]" />
                20 Categorías reales
              </span>
            </div>
          </div>

          {/* Columna Derecha: Tarjetas con Siluetas */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[#3062ef]/50 dark:hover:border-[#3062ef]/50 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-[#3062ef]/15"
                >
                  {/* Silueta Opaca Integrada */}
                  <div className="pointer-events-none absolute -right-4 -bottom-4 size-28 opacity-10 dark:opacity-20 transition-all duration-500 group-hover:opacity-30 group-hover:scale-110 group-hover:-rotate-6">
                    <Image
                      src={cat.silhouette}
                      alt="Silueta decorativa"
                      fill
                      unoptimized
                      sizes="112px"
                      className="object-contain"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-[#3062ef]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#3062ef]/15 to-[#3062ef]/5 dark:from-[#3062ef]/25 dark:to-[#3062ef]/10 border border-[#3062ef]/20 dark:border-[#3062ef]/30 text-[#3062ef] dark:text-[#5c84f5] group-hover:bg-[#3062ef] group-hover:text-white dark:group-hover:bg-[#3062ef] dark:group-hover:text-white transition-colors duration-300 shadow-sm">
                        <Icon className="size-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      
                      <span className="rounded-full bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-zinc-300 backdrop-blur-sm">
                        {cat.badge}
                      </span>
                    </div>

                    <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-[#3062ef] dark:group-hover:text-[#5c84f5] transition-colors">
                      {cat.title}
                    </h2>
                  </div>

                  <div className="relative z-10 mt-6 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-zinc-400">
                    <span>{cat.count}</span>
                    <ArrowRight className="size-4 text-slate-400 dark:text-zinc-600 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-[#3062ef] dark:group-hover:text-[#5c84f5]" />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}