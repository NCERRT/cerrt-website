"use client";

import { useState } from "react";
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

export default function Home() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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

  const highlights = [
    {
      title: "24/7",
      subtitle: "Emergency Response",
      description: "Round-the-clock surveillance of Nigeria's cyber landscape.",
      bgColor: "bg-[#1a5f4a]",
    },
    {
      title: "1000+",
      subtitle: "Incidents Resolved",
      description: "Successfully handled security events.",
      bgColor: "bg-[#247a5f]",
    },
    {
      title: "50+",
      subtitle: "Partner Organizations",
      description: "Trusted by government and private sector.",
      bgColor: "bg-[#2d8f6e]",
    },
    {
      title: "99.9%",
      subtitle: "Response Rate",
      description: "Incident acknowledgment within hours.",
      bgColor: "bg-[#37a47d]",
    },
  ];

  const heroImages = [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
                NITDA&apos;s CERRT is Nigeria’s national computer emergency
                response team, providing 24/7 cybersecurity incident response,
                threat intelligence, and security awareness to protect Nigeria’s
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

      {/* Key Highlights */}
      <section className="py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className={`bg-[#1a5f4a] text-white p-8 rounded-xl hover-lift cursor-pointer card-interactive group relative overflow-hidden animate-slide-in-up`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Icon decoration */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20"></div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-1 relative z-10">
                  {highlight.title}
                </h3>
                <h4 className="text-xl font-semibold text-center mb-3 relative z-10">
                  {highlight.subtitle}
                </h4>
                <p className="text-white/90 text-sm text-center relative z-10 leading-relaxed">
                  {highlight.description}
                </p>
                {/* Hover shine effect */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
              </div>
            ))}
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

      {/* Statistics Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10 pattern-grid"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
              Protecting Nigeria Since 2018
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Our commitment to cybersecurity excellence in numbers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2018", label: "Established" },
              { value: "24/7", label: "Monitoring" },
              { value: "1500+", label: "Incidents Handled" },
              { value: "200+", label: "Partner Organizations" },
            ].map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 ease-out"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 group-hover:bg-white/20 group-hover:scale-101 transition-all duration-500 ease-out">
                    <div className="text-5xl md:text-6xl font-bold mb-2 group-hover:scale-105 transition-transform duration-500 ease-out">
                      {stat.value}
                    </div>
                  </div>
                </div>
                <div className="text-primary-foreground/80 font-medium text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
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
              Advisories & Downloads
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Access our comprehensive library of cybersecurity resources,
              guidelines, and tools designed specifically for Nigerian
              organizations.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                id: "ADV-2024-001",
                title: "Critical Vulnerability in Popular Web Frameworks",
                date: "2024-03-15",
                severity: "critical",
                category: "Web Security",
                description:
                  "A critical remote code execution vulnerability has been discovered in several popular web frameworks. Immediate patching is recommended.",
              },
            ].map((advisory) => (
              <article
                key={advisory.id}
                className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                        {advisory.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      <Link
                        href={`/advisories/${advisory.id.toLowerCase()}`}
                        className="hover:text-primary cursor-pointer transition-colors"
                      >
                        {advisory.title}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground text-sm mb-3">
                      {advisory.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon
                          icon={Calendar01Icon}
                          size={16}
                          color="currentColor"
                        />
                        {formatDate(advisory.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon
                          icon={IdentificationIcon}
                          size={16}
                          color="currentColor"
                        />
                        {advisory.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2">
                    <Link
                      href={`/advisories/${advisory.id.toLowerCase()}`}
                      className="inline-flex cursor-pointer items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </Link>
                    <button className="inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-2 border border-border text-foreground text-sm font-semibold rounded-md hover:bg-muted transition-colors whitespace-nowrap">
                      <HugeiconsIcon
                        icon={Download01Icon}
                        size={16}
                        color="currentColor"
                      />
                      Download PDF
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/advisory"
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

      {/* Defacement Statistics */}
      <DefacementStatistics />

      {/* Report Incident Modal */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </main>
  );
}
