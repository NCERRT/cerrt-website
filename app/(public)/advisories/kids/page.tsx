"use client";

import { useState, useEffect } from "react";
import {
  UserShield02Icon,
  Home01Icon,
  UserMultiple02Icon,
  FavouriteIcon,
  Mouse13Icon,
} from "@hugeicons/core-free-icons";
import Carousel from "@/components/ui/Carousel";
import {
  getAdvisoriesAction,
  type AdvisoryDetailWithUrls,
} from "@/app/actions/advisories";
import AdvisoryImageGrid from "@/components/sections/AdvisoryImageGrid";
import AdvisoryCard from "@/components/advisory-card";
import CategoryHero from "@/components/sections/category-hero";
import SafetyTipsGrid from "@/components/sections/safety-tips-grid";

export default function KidsAdvisoryPage() {
  const [advisories, setAdvisories] = useState<AdvisoryDetailWithUrls[] | null>(
    null,
  );

  useEffect(() => {
    getAdvisoriesAction({ category: "kids" })
      .then((res) => setAdvisories(res.advisories))
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
      <CategoryHero
        icon={UserShield02Icon}
        title="Kids Safety Corner"
        description="Stay informed about the latest cybersecurity threats, vulnerabilities, and security updates affecting kids in Nigeria and globally."
      />

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
          <SafetyTipsGrid tips={safetyTips} variant="kids" />
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
                    advisory={advisory as unknown as React.ComponentProps<typeof AdvisoryCard>["advisory"]}
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
