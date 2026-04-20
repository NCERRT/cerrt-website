"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserShield02Icon,
  Home01Icon,
  UserMultiple02Icon,
  FavouriteIcon,
  Mouse13Icon,
  Award01Icon,
  ArrowRight01Icon,
  Download01Icon,
  Calendar01Icon,
  IdentificationIcon,
} from "@hugeicons/core-free-icons";

export default function KidsAdvisoryPage() {
  const advisories = useQuery(api.advisories.list, { category: "kids" });

  const safetyTips = [
    {
      title: "Never Share Personal Info",
      description:
        "Don't share your full name, address, phone number, or school name online",
      icon: Home01Icon,
    },
    {
      title: "Ask an Adult First",
      description:
        "Always ask a parent or teacher before signing up for new websites or apps",
      icon: UserMultiple02Icon,
    },
    {
      title: "Be Kind Online",
      description: "Treat others with respect. Don't bully or say mean things",
      icon: FavouriteIcon,
    },
    {
      title: "Think Before You Click",
      description:
        "Don't click on links or download files from people you don't know",
      icon: Mouse13Icon,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive text-white";
      case "high":
        return "bg-warning text-white";
      case "medium":
        return "bg-accent text-white";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-secondary py-20 pattern-dots relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-slide-in-up">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center animate-float border-4 border-primary/20">
                <HugeiconsIcon
                  icon={UserShield02Icon}
                  size={80}
                  color="currentColor"
                  className="text-primary"
                />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
              Kids Safety Corner
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stay informed about the latest cybersecurity threats,
              vulnerabilities, and security updates affecting kids in Nigerian
              and globally.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Stay Safe
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Top Safety Tips
            </h2>
            <p className="text-xl text-muted-foreground">
              Remember these important rules to stay safe online!
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyTips.map((tip, index) => (
              <div
                key={index}
                className="group bg-white border-2 border-primary/20 rounded-2xl p-8 text-center hover-lift card-interactive relative overflow-hidden animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <div className="mb-6 flex justify-center">
                  <div
                    className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 animate-float"
                    style={{ animationDelay: `${index * 0.5}s` }}
                  >
                    <HugeiconsIcon
                      icon={tip.icon}
                      size={48}
                      color="currentColor"
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {tip.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kids Advisories Section */}
      <section className="py-20 bg-secondary/30 pattern-dots relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Safety Resources
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Latest Kids Advisories
            </h2>
            <p className="text-xl text-muted-foreground">
              Fun and educational cybersecurity resources for kids!
            </p>
          </div>

          {!advisories ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading advisories...</p>
            </div>
          ) : advisories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No kids advisories available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advisories.map((advisory, index) => (
                <KidsAdvisoryCard
                  key={advisory._id}
                  advisory={advisory}
                  index={index}
                  getSeverityColor={getSeverityColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Quiz Teaser */}
      <section className="py-20 bg-secondary/30 pattern-dots">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-linear-to-r from-primary to-accent text-primary-foreground rounded-3xl p-10 md:p-16 text-center overflow-hidden shadow-2xl">
            {/* Decorative elements */}
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

      {/* Parent Resources */}
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
            Looking for resources to help teach kids about online safety? We
            have guides, lesson plans, and activities to help you.
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
    </main>
  );
}

function KidsAdvisoryCard({
  advisory,
  index,
  getSeverityColor,
  formatDate,
}: {
  advisory: {
    _id: string;
    title: string;
    description: string;
    severity: string;
    advisoryId: string;
    date: number;
    fileStorageId?: string;
    fileType?: string;
  };
  index: number;
  getSeverityColor: (severity: string) => string;
  formatDate: (timestamp: number) => string;
}) {
  // Always call the hook, but pass "skip" if no fileStorageId
  const fileUrl = useQuery(
    api.advisories.getFileUrl,
    advisory.fileStorageId ? { storageId: advisory.fileStorageId as Id<"_storage"> } : "skip"
  );

  return (
    <article
      className="group bg-white border-2 border-border rounded-2xl p-6 hover-lift card-interactive relative overflow-hidden animate-slide-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className={`absolute top-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
          advisory.severity === "critical"
            ? "bg-destructive"
            : advisory.severity === "high"
              ? "bg-warning"
              : advisory.severity === "medium"
                ? "bg-accent"
                : "bg-muted-foreground"
        }`}
      ></div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(
            advisory.severity,
          )}`}
        >
          {advisory.severity}
        </span>
        {advisory.fileType && (
          <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
            {advisory.fileType === "pdf" ? "PDF" : "Image"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <HugeiconsIcon
          icon={IdentificationIcon}
          size={16}
          color="currentColor"
          className="text-primary"
        />
        <span className="text-sm font-bold text-primary">
          {advisory.advisoryId}
        </span>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
        {advisory.title}
      </h2>

      <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
        {advisory.description}
      </p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pt-4 border-t border-border">
        <HugeiconsIcon icon={Calendar01Icon} size={16} color="currentColor" />
        <span className="font-medium">{formatDate(advisory.date)}</span>
      </div>

      {fileUrl && (
        <div className="flex gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary-light hover:shadow-lg transition-all duration-300 gap-2"
          >
            <HugeiconsIcon icon={Download01Icon} size={16} color="currentColor" />
            Download {advisory.fileType === "pdf" ? "PDF" : "File"}
          </a>
        </div>
      )}
    </article>
  );
}
