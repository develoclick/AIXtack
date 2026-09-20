import { Clapperboard } from "lucide-react";
import type { VideoData } from "@/lib/guides/model";
import { ImageBlock } from "./image-block";
import { RichText } from "./rich-text";
import { ui } from "./ui";
import { YouTubeFacade } from "./youtube-facade";

/**
 * Video de la guía. Con `status: "published"` y un `youtubeId` REAL se muestra el reproductor
 * bajo demanda; con `status: "upcoming"` se muestra «VIDEO PRÓXIMAMENTE». Nunca se inventa un id.
 */
export function VideoSection({ data }: { data: VideoData }) {
  const published = data.status === "published" && Boolean(data.youtubeId);

  return (
    <div className={ui.block}>
      {published && data.youtubeId ? (
        <YouTubeFacade
          videoId={data.youtubeId}
          title={data.title}
          poster={data.thumbnail ? <ImageBlock image={data.thumbnail} bare className="absolute inset-0 [&>div]:h-full [&>div]:rounded-none [&>div]:border-0 [&>div]:!aspect-auto" /> : undefined}
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-guide-surface p-6 text-center">
          <Clapperboard className="size-8 text-muted-foreground" aria-hidden />
          <p className={ui.tagNeutral}>Video próximamente</p>
        </div>
      )}

      <div className="mt-5 max-w-[var(--guide-measure)]">
        <h3 className={ui.h3}>{data.title}</h3>
        {data.duration && <p className="mt-1 font-mono text-xs text-muted-foreground">Duración: {data.duration}</p>}
        <div className="mt-2">
          <RichText text={data.description} className="text-[0.97rem] leading-relaxed text-foreground/90 [&:not(:first-child)]:mt-3" />
        </div>
      </div>

      {data.chapters && data.chapters.length > 0 && (
        <div className="mt-6">
          <p className={ui.eyebrow}>Capítulos</p>
          <ol className="mt-2 divide-y rounded-xl border bg-background text-[0.93rem]">
            {data.chapters.map((chapter) => (
              <li key={`${chapter.time}-${chapter.title}`} className="flex gap-4 px-4 py-2.5">
                <span className="w-12 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{chapter.time}</span>
                <span className="text-foreground/90">{chapter.title}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
