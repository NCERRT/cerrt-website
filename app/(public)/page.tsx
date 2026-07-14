"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Search01Icon,
  UserLove02Icon,
  Calendar01Icon,
  IdentificationIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import Carousel from "@/components/ui/Carousel";
import ReportIncidentModal from "@/components/ui/ReportIncidentModal";
import DefacementStatistics from "@/components/sections/DefacementStatistics";
import { getDefacementStatsAction } from "@/app/actions/defacementStats";
import {
  getAdvisoriesAction,
  type AdvisoryWithFileUrl,
} from "@/app/actions/advisories";
import AdvisoryCard from "@/components/advisory-card";

export default function Home() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [defacementStats, setDefacementStats] = useState<{
    statsByYear: Record<number, { month: number; incidents: number }[]>;
    years: number[];
  }>({ statsByYear: {}, years: [] });
  const [recentAdvisories, setRecentAdvisories] = useState<
    AdvisoryWithFileUrl[]
  >([]);

  useEffect(() => {
    getDefacementStatsAction()
      .then(setDefacementStats)
      .catch(() => {
        /* chart falls back to an empty current-year view */
      });
    // Fetch the 3 most recent advisories
    getAdvisoriesAction()
      .then((list) => setRecentAdvisories(list.slice(0, 3)))
      .catch(() => {});
  }, []);
  const resources = [
    {
      title: "NITDA CERRT PGP PUBLIC KEY",
      href: "/documents/nitda-cerrt-pgp-public-key.pdf",
    },
    {
      title: "NITDA-CERRT RFC 2.0",
      href: "/documents/nitda-cerrt-rfc-2.0.pdf",
    },
  ];

  const services = [
    {
      title: "Incident Response",
      description:
        "24/7 rapid response to cyber security incidents affecting Nigerian organizations",
      icon: Alert02Icon,
    },
    {
      title: "Threat Intelligence",
      description:
        "Real-time monitoring and analysis of emerging cyber threats",
      icon: Search01Icon,
    },
    {
      title: "Security Awareness",
      description:
        "Training programs to enhance digital security knowledge across sectors",
      icon: UserLove02Icon,
    },
  ];

  const heroImages = [
    "/hero-images/NITDA25-CHD-AWARENESS-1.jpg",
    "/hero-images/NITDA25-CHD-AWARENESS-2.jpg",
    "/hero-images/NITDA25-CHD-AWARENESS-4.jpg",
    "/hero-images/NITDA25-CHD-AWARENESS-6.jpg",
  ];

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
      <section className="relative bg-secondary py-20 md:py-28 overflow-hidden pattern-dots">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                24/7 Active Monitoring
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
                <span className="text-primary">NITDA&apos;s</span> Computer
                Emergency Readiness and Response Team
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Providing 24/7 cybersecurity incident response, threat
                intelligence, and security awareness to protect Nigeria’s
                digital infrastructure and citizens.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="group cursor-pointer inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-light hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Report Incident
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
                <Link
                  href="/advisories"
                  className="group cursor-pointer inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  View Advisories
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
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
                </Link>
              </div>
            </div>
            <div
              className="relative animate-slide-in-up"
              style={{ animationDelay: "0.2s", opacity: 0 }}
            >
              <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-2xl animate-pulse-glow"></div>
              <div className="relative h-100 md:h-125 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-500">
                <Carousel images={heroImages} autoPlay={true} interval={5000} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-secondary/30 pattern-dots relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                What We Do
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive cybersecurity services designed to protect
              Nigeria&apos;s digital infrastructure and empower organizations to
              defend against threats.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white border-2 border-border rounded-2xl p-8 hover-lift card-interactive cursor-pointer relative overflow-hidden"
              >
                {/* Accent bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <HugeiconsIcon
                      icon={service.icon}
                      size={32}
                      color="currentColor"
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-2 border-primary/20 rounded-full group-hover:scale-150 group-hover:opacity-0 transition-all duration-500"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>
                <Link
                  href="/services"
                  className="inline-flex cursor-pointer items-center text-primary font-semibold group-hover:gap-3 transition-all"
                >
                  Learn more
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="group cursor-pointer inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              View All Services
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Advisories section */}
      <section className="py-20 bg-secondary/30 pattern-dots relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Recent Info
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Advisories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Access our comprehensive library of cybersecurity resources,
              guidelines.
            </p>
          </div>
          {recentAdvisories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Advisories will appear here once published.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {recentAdvisories.map((advisory, index) => (
                <AdvisoryCard
                  key={advisory.id}
                  advisory={advisory as any}
                  index={index}
                />
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              href="/advisories"
              className="group cursor-pointer inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              View All Advisories
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Resources
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Key documents and reference materials for CERRT stakeholders.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {resources.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white border-2 border-border rounded-2xl p-8 hover-lift card-interactive flex flex-col"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <HugeiconsIcon
                      icon={Download01Icon}
                      size={22}
                      color="currentColor"
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {link.title}
                  </h3>
                </div>
                <div className="inline-flex items-center text-primary font-semibold mt-auto group-hover:gap-3 transition-all">
                  Read More
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Defacement Statistics */}
      <DefacementStatistics
        statsByYear={defacementStats.statsByYear}
        years={defacementStats.years}
      />

      {/* Report Incident Modal */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </main>
  );
}
