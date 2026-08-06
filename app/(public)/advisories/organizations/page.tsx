"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  CellsIcon,
  Database02Icon,
  UserGroupIcon,
  SecurityLockIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import {
  getAdvisoriesAction,
  type AdvisoryDetailWithUrls,
} from "@/app/actions/advisories";
import AdvisoryImageGrid from "@/components/sections/AdvisoryImageGrid";
import AdvisoryCard from "@/components/advisory-card";
import CategoryHero from "@/components/sections/category-hero";
import SafetyTipsGrid from "@/components/sections/safety-tips-grid";

export default function OrganizationsAdvisoryPage() {
  const [advisories, setAdvisories] = useState<AdvisoryDetailWithUrls[] | null>(
    null,
  );

  useEffect(() => {
    getAdvisoriesAction("organizations")
      .then(setAdvisories)
      .catch(() => setAdvisories([]));
  }, []);

  const bestPractices = [
    {
      title: "Implement Zero Trust Architecture",
      description:
        "Never trust, always verify - enforce strict access controls across all resources",
      icon: SecurityLockIcon,
    },
    {
      title: "Regular Security Audits",
      description:
        "Conduct periodic assessments of systems, networks, and security policies",
      icon: Shield01Icon,
    },
    {
      title: "Backup & Recovery Plan",
      description:
        "Maintain regular backups and test disaster recovery procedures frequently",
      icon: Database02Icon,
    },
    {
      title: "Network Segmentation",
      description:
        "Isolate critical systems and limit lateral movement within your network",
      icon: CellsIcon,
    },
  ];

  return (
    <main className="flex flex-col">
      <CategoryHero
        badge="For Organizations"
        title={<>Enterprise Security <span className="text-primary">Advisories</span></>}
        description="Protect your organization with comprehensive cybersecurity advisories, frameworks, and industry best practices."
      />

      {/* Best Practices */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Best Practices
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Enterprise Security Standards
            </h2>
            <p className="text-xl text-muted-foreground">
              Foundational practices for organizational cybersecurity
            </p>
          </div>
          <SafetyTipsGrid tips={bestPractices} />
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
                  Visual Resources
                </h2>
                <p className="text-muted-foreground">
                  Framework diagrams, infographics, and quick-reference posters
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
              Recent security updates for organizations
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
                    advisory={advisory as unknown as React.ComponentProps<typeof AdvisoryCard>["advisory"]}
                    index={index}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Partnership CTA */}
      <section className="py-20 bg-primary text-primary-foreground pattern-dots relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 animate-float">
              <HugeiconsIcon icon={UserGroupIcon} size={40} color="white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
            Partner With CERRT
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join our network of partner organizations to receive dedicated
            support, threat intelligence, and incident response services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-primary-foreground/90 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Request Partnership
            </Link>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary transition-all hover:shadow-xl hover:-translate-y-0.5">
              Download Framework Guide
              <HugeiconsIcon
                icon={Download01Icon}
                size={20}
                color="currentColor"
              />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
