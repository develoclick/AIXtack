"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:global-error]", error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>Algo ha ido mal</h1>
          <p style={{ maxWidth: "28rem", color: "#666" }}>
            Ha ocurrido un error inesperado. Por favor, recarga la página.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
