"use client";

import { useContext } from "react";
import { ConsentContext } from "@/providers/consent-provider";

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent debe usarse dentro de <ConsentProvider>");
  }
  return context;
}
