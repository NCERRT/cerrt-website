"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserShield02Icon,
  Home01Icon,
  UserMultiple02Icon,
  FavouriteIcon,
  Mouse13Icon,
  Download01Icon,
  Calendar01Icon,
  IdentificationIcon,
} from "@hugeicons/core-free-icons";
import Carousel from "@/components/ui/Carousel";
import {
  getAdvisoriesAction,
  type AdvisoryDetailWithUrls,
} from "@/app/actions/advisories";
import AdvisoryImageGrid from "@/components/sections/AdvisoryImageGrid";
import AdvisoryCard from "@/components/advisory-card";

export default function KidsAdvisoryPage() {
  const [advisories, setAdvisories] = useState<AdvisoryDetailWithUrls[] | null>(
    null,
  );

  useEffect(() => {
    getAdvisoriesAction("kids")
      .then(setAdvisories)
      .catch(() => setAdvisories([]));
  }, []);

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Gallery images — static hero images
  const galleryImages = [
    "/hero-images/NITDA25-CHD-AWARENESS-1.jpg",
    "/hero-images/NITDA25-CHD-AWARENESS-2.jpg",
    "/hero-images/NITDA25-CHD-AWARENESS-4.jpg",
    "/hero-images/NITDA25-CHD-AWARENESS-6.jpg",
  ];

  // Image-type advisories shown in the gallery grid
  const imageAdvisories = (advisories ?? []).filter(
    (advisory) => advisory.fileType === "image" && advisory.fileUrl,
  );

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

      {/* Gallery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Safety Adventures
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Kids Advisory Gallery
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Check out our fun and colorful safety posters and educational
              materials!
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="h-150 md:h-175 lg:h-200 w-auto">
              <Carousel
                images={galleryImages}
                autoPlay={true}
                interval={4000}
              />
            </div>

            {/* Image Advisories Grid */}
            {imageAdvisories.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
                  Safety Posters & Graphics
                </h3>
                <AdvisoryImageGrid advisories={imageAdvisories} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Learning Cards */}
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
              {advisories
                .filter((a) => a.fileType !== "image")
                .map((advisory, index) => (
                  <AdvisoryCard
                    key={advisory.id}
                    advisory={advisory as any}
                    index={index}
                  />
                ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}


