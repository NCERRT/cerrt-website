"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  MailAtSign02Icon,
  SmartPhone01Icon,
  Wifi01Icon,
  Globe02Icon,
  Download01Icon,
  Calendar01Icon,
  IdentificationIcon,
} from "@hugeicons/core-free-icons";
import {
  getAdvisoriesAction,
  type AdvisoryDetailWithUrls,
} from "@/app/actions/advisories";
import AdvisoryImageGrid from "@/components/sections/AdvisoryImageGrid";
import SubscribeForm from "@/components/ui/SubscribeForm";
import AdvisoryCard from "@/components/advisory-card";

export default function IndividualsAdvisoryPage() {
  const [advisories, setAdvisories] = useState<AdvisoryDetailWithUrls[] | null>(
    null,
  );

  useEffect(() => {
    getAdvisoriesAction("individuals")
      .then(setAdvisories)
      .catch(() => setAdvisories([]));
  }, []);

  const quickTips = [
    {
      title: "Use Two-Factor Authentication",
      description:
        "Enable 2FA on all accounts that support it for an extra layer of security",
      icon: Shield01Icon,
    },
    {
      title: "Keep Software Updated",
      description:
        "Regularly update your operating system, apps, and antivirus software",
      icon: SmartPhone01Icon,
    },
    {
      title: "Verify Before You Trust",
      description:
        "Always verify the sender's identity before clicking links or sharing information",
      icon: MailAtSign02Icon,
    },
    {
      title: "Secure Your Network",
      description:
        "Use strong Wi-Fi passwords and avoid public networks for sensitive transactions",
      icon: Wifi01Icon,
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
                For Individuals
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
              Personal Security <span className="text-primary">Advisories</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stay protected online with cybersecurity advisories and best
              practices tailored for individuals.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Quick Tips
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Essential Security Practices
            </h2>
            <p className="text-xl text-muted-foreground">
              Follow these tips to enhance your personal cybersecurity
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickTips.map((tip, index) => (
              <div
                key={index}
                className="group bg-white border-2 border-border rounded-2xl p-8 hover-lift card-interactive relative overflow-hidden animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <HugeiconsIcon
                      icon={tip.icon}
                      size={32}
                      color="currentColor"
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 text-center group-hover:text-primary transition-colors">
                  {tip.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-center">
                  {tip.description}
                </p>
              </div>
            ))}
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
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-serif">
                  Visual Safety Resources
                </h2>
                <p className="text-muted-foreground">
                  Posters and infographics for everyday online safety
                </p>
              </div>
              <AdvisoryImageGrid advisories={imageAdvisories} />
            </div>
          </section>
        );
      })()}

      {/* Advisories Grid */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Latest Advisories
            </h2>
            <p className="text-xl text-muted-foreground">
              Recent security updates for individuals
            </p>
          </div>

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
                    advisory={advisory as any}
                    index={index}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground pattern-dots relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 animate-float">
              <HugeiconsIcon icon={Globe02Icon} size={40} color="white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
            Stay Informed & Protected
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Subscribe to receive personalized security alerts and updates
            directly to your inbox.
          </p>
          <SubscribeForm variant="primaryCta" />
        </div>
      </section>
    </main>
  );
}

