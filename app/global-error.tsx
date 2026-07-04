"use client";

/**
 * Root-level error boundary. Catches errors thrown from `app/layout.tsx`
 * itself (or anything above the standard error boundary). Because it
 * replaces the entire document, it must render its own <html> and <body>.
 *
 * Intentionally spartan — no site chrome, no fonts, no CSS imports, so
 * it still works even if the layout's providers or style pipeline broke.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Application error
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#64748b",
              marginBottom: "2rem",
              lineHeight: 1.5,
            }}
          >
            A critical error occurred and the site could not load. Please try
            again — if the problem persists, contact CERRT with the reference
            below.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                fontFamily: "monospace",
                marginBottom: "2rem",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#0f766e",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
