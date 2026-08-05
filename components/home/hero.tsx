import Link from "next/link";
import {
  ArrowRight,
  Image as ImageIcon,
  PenLine,
  Code2,
  AudioLines,
} from "lucide-react";

// Fichas del "catálogo" — cada una representa una categoría real del
// directorio. Los números no son un ranking, son el índice de archivo:
// refuerzan la idea de que hay cientos de entradas revisadas a mano.
const catalogCards = [
  {
    id: "IA · 014",
    title: "Generación de imágenes",
    meta: "62 herramientas",
    icon: ImageIcon,
    accent: "#8C6FF6",
    rotate: "-rotate-[6deg]",
  },
  {
    id: "IA · 027",
    title: "Escritura y copy",
    meta: "94 herramientas",
    icon: PenLine,
    accent: "#34D399",
    rotate: "rotate-[3deg]",
  },
  {
    id: "IA · 041",
    title: "Código y desarrollo",
    meta: "58 herramientas",
    icon: Code2,
    accent: "#FF6B4A",
    rotate: "-rotate-[2deg]",
  },
  {
    id: "IA · 058",
    title: "Voz y audio",
    meta: "31 herramientas",
    icon: AudioLines,
    accent: "#8C6FF6",
    rotate: "rotate-[5deg]",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] text-[#F5EFE1]">
      {/* Resplandor ambiental + grano de papel, muy sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(60% 50% at 18% 20%, rgba(140,111,246,0.20), transparent 60%), radial-gradient(45% 40% at 85% 75%, rgba(52,211,153,0.14), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-36 lg:px-8">
        {/* Columna editorial */}
        <div className="flex flex-col items-start text-left">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#F5EFE1]/60 backdrop-blur">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#34D399] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#34D399]" />
            </span>
            Catálogo vivo · actualizado hoy
          </div>

          <h1
            className="text-balance text-[2.75rem] font-medium leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.5rem]"
            
          >
            La Inteligencia
            <br />
            Artificial,{" "}
            <span
              className="italic"
              style={{
                background:
                  "#3062ef",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              ordenada
            </span>{" "}
            para ti
          </h1>

          <p className="mt-7 max-w-lg text-balance text-lg leading-relaxed text-[#F5EFE1]/65">
            Herramientas, prompts y tutoriales de IA revisados uno por uno y
            explicados en español claro. Nada de jerga, nada de relleno —
            solo lo que sirve.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/herramientas-ia"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#3062ef] px-7 py-3.5 text-sm font-semibold text-[#15131F]  transition-transform duration-200 hover:-translate-y-0.5"
            >
              Explorar el catálogo
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/prompts"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-7 py-3.5 text-sm font-semibold text-[#F5EFE1] backdrop-blur transition-colors duration-200 hover:bg-white/[0.06]"
            >
              Ver prompts listos
            </Link>
          </div>

          <p className="mt-8 font-mono text-xs tracking-wide text-[#F5EFE1]/40">
            512 herramientas revisadas · leído por lectores en 18 países de
            habla hispana
          </p>
        </div>

        {/* Columna visual: fichero de catálogo, no un panel de stats */}
        <div className="relative mx-auto grid w-full max-w-sm grid-cols-2 gap-5 py-6 lg:mx-0 lg:max-w-none">
          {catalogCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`group ${card.rotate} rounded-2xl border border-black/5 bg-[#ffffff] p-5 text-[#15131F] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out hover:translate-y-0 hover:rotate-0`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.14em] text-[#15131F]/40">
                    {card.id}
                  </span>
                  <span
                    className="flex size-7 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${card.accent}1F` }}
                  >
                    <Icon className="size-3.5" style={{ color: card.accent }} />
                  </span>
                </div>
                <p
                  className="mt-5 text-[1.05rem] font-medium leading-snug"
                  
                >
                  {card.title}
                </p>
                <p className="mt-1 text-[11px] text-[#15131F]/45">
                  {card.meta}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
