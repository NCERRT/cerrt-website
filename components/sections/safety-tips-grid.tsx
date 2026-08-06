"use client";

import { HugeiconsIcon } from "@hugeicons/react";

interface TipItem {
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

interface SafetyTipsGridProps {
  tips: TipItem[];
  variant?: "standard" | "kids";
}

export default function SafetyTipsGrid({
  tips,
  variant = "standard",
}: SafetyTipsGridProps) {
  const isKids = variant === "kids";

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {tips.map((tip, index) => (
        <div
          key={index}
          className={`group bg-white border-2 rounded-2xl p-8 hover-lift relative overflow-hidden animate-slide-in-up ${
            isKids ? "border-primary/20 text-center" : "border-border"
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div
            className={`mb-6 flex ${isKids ? "justify-center" : "justify-center md:justify-start"}`}
          >
            <div
              className={`bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all duration-300 ${
                isKids ? "w-20 h-20 animate-float" : "w-16 h-16"
              }`}
              style={isKids ? { animationDelay: `${index * 0.5}s` } : undefined}
            >
              <HugeiconsIcon
                icon={tip.icon}
                size={isKids ? 48 : 32}
                color="currentColor"
                className="text-primary group-hover:text-white transition-colors"
              />
            </div>
          </div>

          <h3
            className={`font-bold text-foreground group-hover:text-primary transition-colors ${
              isKids ? "text-xl mb-4" : "text-lg mb-3 text-center md:text-left"
            }`}
          >
            {tip.title}
          </h3>
          <p
            className={`text-muted-foreground leading-relaxed ${
              isKids ? "" : "text-sm text-center md:text-left"
            }`}
          >
            {tip.description}
          </p>
        </div>
      ))}
    </div>
  );
}
