"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Page-level error boundary. Catches any error thrown during render of a
 * route segment (Server or Client Component) and renders a branded fallback
 * instead of Next.js's default digest screen.
 *
 * `reset()` re-tries rendering the boundary's children — useful when the
 * error is transient (DB blip, network flake).
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side digest errors are already logged by Next; this catches
    // any client-side render errors so we can surface them in dev.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="inline-block mb-4">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            Something went wrong
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
          Unexpected error
        </h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          We hit a snag rendering this page. Please try again — if the problem
          persists, contact CERRT with the reference below.
        </p>

        {error.digest && (
          <div className="mb-8 inline-block bg-secondary/50 border border-border rounded-lg px-4 py-2">
            <span className="text-xs text-muted-foreground font-mono">
              Reference: {error.digest}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="cursor-pointer inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-light hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Try again
          </button>
          <Link
            href="/"
            className="cursor-pointer inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
