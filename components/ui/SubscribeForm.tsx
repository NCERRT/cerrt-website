"use client";

import { useState } from "react";
import { useSubscribeNewsletter } from "@/hooks/use-public";

/**
 * Visual variants for the different contexts the form appears in.
 * The styles preserve the look of each original static form.
 */
type Variant = "advisories" | "primaryCta" | "footer";

const STYLES: Record<
  Variant,
  {
    form: string;
    input: string;
    button: string;
    buttonText: string;
    success: string;
    error: string;
  }
> = {
  // On a light section (white / muted-30 bg) with a primary-coloured button
  advisories: {
    form: "flex flex-col sm:flex-row gap-3 max-w-md mx-auto",
    input:
      "flex-1 px-4 py-3 bg-white border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all",
    button:
      "px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 hover:shadow-lg transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",
    buttonText: "Subscribe",
    success: "text-sm text-success text-center mt-3",
    error: "text-sm text-destructive text-center mt-3",
  },
  // On a primary-coloured CTA section: white input, white button on dark bg
  primaryCta: {
    form: "flex flex-col sm:flex-row gap-3 max-w-md mx-auto",
    input:
      "flex-1 px-4 py-3 bg-white text-foreground placeholder:text-muted-foreground rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:border-white/50 transition-all",
    button:
      "px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",
    buttonText: "Subscribe",
    success: "text-sm text-primary-foreground text-center mt-3",
    error: "text-sm text-red-100 text-center mt-3",
  },
  // Footer: compact, translucent input on primary bg
  footer: {
    form: "flex gap-2",
    input:
      "flex-1 px-3 py-2 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/30",
    button:
      "px-4 py-2 cursor-pointer bg-primary-foreground text-primary rounded-md font-semibold text-sm hover:bg-primary-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    buttonText: "Submit",
    success: "text-xs text-primary-foreground/90 mt-2",
    error: "text-xs text-red-200 mt-2",
  },
};

export default function SubscribeForm({
  variant = "advisories",
}: {
  variant?: Variant;
}) {
  const s = STYLES[variant];
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const subscribeMutation = useSubscribeNewsletter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setMessage("");

    subscribeMutation.mutate(email, {
      onSuccess: (result) => {
        setStatus("success");
        setMessage(
          result.alreadySubscribed
            ? "You're already on the list."
            : "Thanks — you're subscribed.",
        );
        setEmail("");
      },
      onError: (err) => {
        setStatus("error");
        setMessage(
          (err as Error).message || "Something went wrong. Please try again.",
        );
      },
    });
  };

  const busy = subscribeMutation.isPending || status === "success";

  return (
    <div>
      <form onSubmit={handleSubmit} className={s.form}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          maxLength={254}
          disabled={busy}
          className={s.input}
        />
        <button type="submit" disabled={busy} className={s.button}>
          {subscribeMutation.isPending ? "..." : s.buttonText}
        </button>
      </form>
      {message && (
        <p className={status === "success" ? s.success : s.error}>{message}</p>
      )}
    </div>
  );
}
