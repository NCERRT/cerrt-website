"use client";

import { HugeiconsIcon } from "@hugeicons/react";

interface CategoryHeroProps {
  badge?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  title: React.ReactNode;
  description: string;
}

export default function CategoryHero({
  badge,
  icon,
  title,
  description,
}: CategoryHeroProps) {
  return (
    <section className="bg-secondary py-20 pattern-dots relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto animate-slide-in-up">
          {badge && (
            <div className="inline-block mb-6">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                {badge}
              </span>
            </div>
          )}

          {icon && (
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center animate-float border-4 border-primary/20">
                <HugeiconsIcon
                  icon={icon}
                  size={80}
                  color="currentColor"
                  className="text-primary"
                />
              </div>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
