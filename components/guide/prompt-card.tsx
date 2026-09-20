import type { EvidenceData, GuidePrompt, ImageSlot } from "@/lib/guides/model";
import { slotToImage } from "@/lib/guides/images";
import { mediaExists, showGuideImageSlots } from "@/lib/guides/media";
import { formatDate } from "@/lib/utils/format";
import { ImageBlock } from "./image-block";
import { Inline } from "./rich-text";
import { ui } from "./ui";
import { PromptWorkbench } from "./prompt-workbench";

/**
 * «Prueba real»: la captura que aporta el autor de haber probado el prompt. Solo aparece si el
 * archivo existe; la fecha, el asistente y la nota solo si el autor los aportó en `evidence.pruebas`.
 * Sin archivo no hay nada en producción. Se distingue de `EJEMPLO GENERADO` (simulado).
 */
function PromptProof({ slot, evidence, promptId }: { slot?: ImageSlot; evidence?: EvidenceData; promptId: string }) {
  if (!slot) return null;
  const exists = mediaExists(slot.src);
  if (!exists && !showGuideImageSlots) return null;
  const test = evidence?.pruebas?.find((item) => item.promptId === promptId);

  return (
    <div className="rounded-xl border border-ok/30 bg-ok-muted/40 p-4 sm:p-5">
      {exists && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={`${ui.tag} border-ok/40 bg-ok-muted text-ok`}>Prueba real</span>
          {test?.fecha && (
            <span className="font-mono text-xs text-muted-foreground">
              <time dateTime={test.fecha}>{formatDate(test.fecha)}</time>
            </span>
          )}
          {test?.asistente && <span className="text-xs text-muted-foreground">Asistente: {test.asistente}</span>}
        </p>
      )}
      <ImageBlock image={slotToImage(slot)} className={exists ? "mt-3" : ""} />
      {exists && test?.nota && (
        <p className="mt-3 text-[0.93rem] leading-relaxed text-foreground/90">
          <span className="font-semibold text-guide-ink">Lo que observó el autor: </span>
          <Inline text={test.nota} />
        </p>
      )}
    </div>
  );
}

/**
 * Prompt completo de una guía (v3): se muestra UNA sola vez, con su constructor de variables,
 * y trae debajo la «Prueba real» si el autor la aportó (`proof` = slot `prueba-prompt-0N.webp`).
 */
export function PromptCard({ prompt, proof, evidence }: { prompt: GuidePrompt; proof?: ImageSlot; evidence?: EvidenceData }) {
  return (
    <PromptWorkbench prompt={prompt}>
      <PromptProof slot={proof} evidence={evidence} promptId={proof?.promptId ?? ""} />
    </PromptWorkbench>
  );
}
