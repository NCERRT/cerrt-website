"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  IdentificationIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import {
  getAdvisoriesAction,
  type AdvisoryWithFileUrl,
} from "@/app/actions/advisories";
import AdvisoryImageGrid from "@/components/sections/AdvisoryImageGrid";
import SubscribeForm from "@/components/ui/SubscribeForm";

export default function AdvisoriesPage() {
  const [advisories, setAdvisories] = useState<AdvisoryWithFileUrl[] | null>(
    null,
  );

  useEffect(() => {
    getAdvisoriesAction()
      .then(setAdvisories)
      .catch(() => setAdvisories([]));
  }, []);

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

  const formatDate = (date: Date) => {
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-slide-in-up">
            <div className="inline-block mb-6">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Latest Updates
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
              Security <span className="text-primary">Advisories</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stay informed about the latest cybersecurity threats,
              vulnerabilities, and security updates affecting Nigerian
              organizations and global infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* Filter/Search Bar */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-in-up">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <input
                type="search"
                placeholder="Search advisories..."
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select className="flex-1 md:flex-none px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select className="flex-1 md:flex-none px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Categories</option>
                <option value="web">Web Security</option>
                <option value="phishing">Phishing</option>
                <option value="ransomware">Ransomware</option>
                <option value="patch">Patch Management</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Advisories Gallery */}
      {advisories && advisories.length > 0 && (() => {
        const imageAdvisories = advisories.filter(
          (a) => a.fileType === "image" && a.fileUrl,
        );
        if (imageAdvisories.length === 0) return null;
        return (
          <section className="py-16 bg-secondary/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-serif">
                  Visual Advisories
                </h2>
                <p className="text-muted-foreground">
                  Posters and infographics for quick reference
                </p>
              </div>
              <AdvisoryImageGrid advisories={imageAdvisories} />
            </div>
          </section>
        );
      })()}

      {/* Advisories Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!advisories ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading advisories...</p>
            </div>
          ) : advisories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No advisories available yet. Check back soon!
              </p>
            </div>
          ) : (() => {
            const nonImageAdvisories = advisories.filter(
              (a) => a.fileType !== "image",
            );
            if (nonImageAdvisories.length === 0) return null;
            return (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {nonImageAdvisories.map((advisory, index) => (
                  <AdvisoryCard
                    key={advisory.id}
                    advisory={advisory}
                    index={index}
                    getSeverityColor={getSeverityColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-slide-in-up">
          <h2 className="text-3xl font-bold text-foreground mb-4 font-serif">
            Stay Updated
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Subscribe to receive email notifications when new security
            advisories are published
          </p>
          <SubscribeForm variant="advisories" />
        </div>
      </section>
    </main>
  );
}

function AdvisoryCard({
  advisory,
  index,
  getSeverityColor,
  formatDate,
}: {
  advisory: AdvisoryWithFileUrl;
  index: number;
  getSeverityColor: (severity: string) => string;
  formatDate: (date: Date) => string;
}) {
  const fileUrl = advisory.fileUrl;

  return (
    <article
      className="group bg-white border-2 border-border rounded-2xl p-6 hover-lift card-interactive relative overflow-hidden animate-slide-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Accent bar based on severity */}
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

      {/* Severity & Category Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(
            advisory.severity,
          )}`}
        >
          {advisory.severity}
        </span>
        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
          {advisory.category}
        </span>
      </div>

      {/* Advisory ID */}
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

      {/* Title */}
      <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
        {advisory.title}
      </h2>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
        {advisory.description}
      </p>

      {/* Date */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pt-4 border-t border-border">
        <HugeiconsIcon
          icon={Calendar01Icon}
          size={16}
          color="currentColor"
        />
        <span className="font-medium">{formatDate(advisory.date)}</span>
      </div>

      {/* File Display - Image Preview or Download Button */}
      {fileUrl && (
        <div className="space-y-3">
          {advisory.fileType === "image" ? (
            <>
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                <Image
                  src={fileUrl}
                  alt={advisory.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary-light hover:shadow-lg transition-all duration-300 gap-2"
              >
                <HugeiconsIcon
                  icon={Download01Icon}
                  size={16}
                  color="currentColor"
                />
                View Full Image
              </a>
            </>
          ) : (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary-light hover:shadow-lg transition-all duration-300 gap-2"
            >
              <HugeiconsIcon
                icon={Download01Icon}
                size={16}
                color="currentColor"
              />
              Download PDF
            </a>
          )}
        </div>
      )}
    </article>
  );
}
