export type GuideAdPosition = "mid-article" | "end-article";

/**
 * Configuración de la experiencia de guías. La publicidad está DESACTIVADA: primero
 * valor, experiencia y confianza. Para activarla más adelante basta cambiar `enabled`
 * y rellenar los identificadores de bloque; ningún componente necesita rediseño.
 */
export const guideAds: { enabled: boolean; slots: Record<GuideAdPosition, string> } = {
  enabled: false,
  /** Bloques de AdSense por posición (slotId de la cuenta). */
  slots: {
    "mid-article": "",
    "end-article": "",
  },
};
