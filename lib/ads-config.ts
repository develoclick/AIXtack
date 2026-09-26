/**
 * Configuración de AdSense. Todo sale de variables de entorno (Vercel → Settings → Environment Variables):
 *   NEXT_PUBLIC_ADSENSE_CLIENT_ID   ID de editor (ca-pub-XXXXXXXXXXXXXXXX). También se acepta NEXT_PUBLIC_ADSENSE_CLIENT.
 *   NEXT_PUBLIC_ADSENSE_SLOT_INTRO  ID del bloque «después de la introducción».
 *   NEXT_PUBLIC_ADSENSE_SLOT_MEDIO  ID del bloque «a mitad del artículo».
 *   NEXT_PUBLIC_ADSENSE_SLOT_FINAL  ID del bloque «antes de las preguntas frecuentes».
 * Sin ID de editor o sin ID de bloque, en producción no se carga ni se dibuja nada.
 */
const bruto = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/** «ca-pub-123…» (acepta también «pub-123…» o solo los dígitos). */
export const adsenseClient: string | undefined = bruto ? `ca-pub-${bruto.replace(/^ca-pub-|^ca-|^pub-/, "")}` : undefined;

export type PosicionAnuncio = "intro" | "medio" | "final";

export const SLOTS: Record<PosicionAnuncio, string | undefined> = {
  intro: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INTRO,
  medio: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MEDIO,
  final: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FINAL,
};
