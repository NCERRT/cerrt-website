import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

/**
 * Kids-page sections held out of the live UI until their features exist.
 *
 * Both were removed from `app/(public)/advisories/kids/page.tsx` because the
 * quiz and parent/teacher resources aren't ready yet — the buttons had no
 * targets and would have looked broken.
 *
 * When either feature ships, re-import the relevant component into the kids
 * page and drop it back into the section flow.
 */

export function KidsQuizTeaser() {
  return (
    <section className="py-20 bg-secondary/30 pattern-dots">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-linear-to-r from-primary to-accent text-primary-foreground rounded-3xl p-10 md:p-16 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pattern-dots"></div>

          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center animate-float border-4 border-white/30">
                <HugeiconsIcon icon={Award01Icon} size={80} color="white" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
              Test Your Safety Skills!
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Take our fun quiz to see how much you know about staying safe
              online. Can you get all the answers right?
            </p>
            <button className="group px-10 py-4 bg-white text-primary font-bold rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-xl inline-flex items-center gap-3">
              <span className="relative z-10">Start Quiz</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={24}
                color="currentColor"
                className="group-hover:translate-x-2 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function KidsParentResources() {
  return (
    <section className="py-20 bg-secondary pattern-dots relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-block mb-6">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            For Adults
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-serif">
          For Parents & Teachers
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Looking for resources to help teach kids about online safety? We have
          guides, lesson plans, and activities to help you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-light hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            Download Parent Guide
            <svg
              className="w-5 h-5 group-hover:translate-y-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
          </button>
          <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            Teacher Resources
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
