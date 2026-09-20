"use client";

import { useState, type ReactNode } from "react";
import { Play } from "lucide-react";

/**
 * Reproductor de YouTube «bajo demanda»: no se carga NADA de YouTube hasta que la persona
 * pulsa reproducir (mejor rendimiento y privacidad). Usa youtube-nocookie.com.
 */
export function YouTubeFacade({ videoId, title, poster }: { videoId: string; title: string; poster?: ReactNode }) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-guide-code">
      {active ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {poster}
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label={`Reproducir video: ${title}`}
            className="guide-focus group absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-background text-foreground shadow-soft-lg transition-transform group-hover:scale-105 motion-reduce:transition-none">
              <Play className="ml-0.5 size-6 fill-current" aria-hidden />
            </span>
          </button>
        </>
      )}
    </div>
  );
}
