"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

export type ConsentValue = "granted" | "denied";

export interface ConsentState {
  ads: ConsentValue;
  analytics: ConsentValue;
  decided: boolean;
}

export interface ConsentContextValue extends ConsentState {
  acceptAll: () => void;
  rejectAll: () => void;
}

const STORAGE_KEY = "aixtack:consent";

const defaultState: ConsentState = { ads: "denied", analytics: "denied", decided: false };

export const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConsentState>(defaultState);

  useEffect(() => {
    // Sincronización única con localStorage (sistema externo, no disponible
    // durante el render en el servidor) al montar el provider.
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setState(JSON.parse(stored));
    } catch {
      // localStorage no disponible (modo privado, etc.) — se mantiene el default.
    }
  }, []);

  const persist = useCallback((next: ConsentState) => {
    setState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // no-op
    }
  }, []);

  const acceptAll = useCallback(
    () => persist({ ads: "granted", analytics: "granted", decided: true }),
    [persist]
  );

  const rejectAll = useCallback(
    () => persist({ ads: "denied", analytics: "denied", decided: true }),
    [persist]
  );

  const value = useMemo(() => ({ ...state, acceptAll, rejectAll }), [state, acceptAll, rejectAll]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
