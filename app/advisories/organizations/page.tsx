import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  CellsIcon,
  Database02Icon,
  UserGroupIcon,
  SecurityLockIcon,
  Download01Icon,
  Calendar01Icon,
  IdentificationIcon,
} from "@hugeicons/core-free-icons";

export const metadata: Metadata = {
  title: "Advisories for Organizations | CERRT",
  description:
    "Enterprise cybersecurity advisories and best practices for organizations to protect their digital infrastructure",
};

export default function OrganizationsAdvisoryPage() {
  const advisories = [
    {
      id: "ORG-2024-001",
      title: "Ransomware Protection for Enterprise Networks",
      date: "2024-03-25",
      severity: "critical",
      category: "Ransomware",
      description:
        "Comprehensive guidance on preventing, detecting, and responding to ransomware attacks targeting organizations.",
    },
    {
      id: "ORG-2024-002",
      title: "Securing Remote Work Infrastructure",
      date: "2024-03-18",
      severity: "high",
      category: "Remote Work",
      description:
        "Best practices for securing remote access, VPNs, and cloud collaboration tools in hybrid work environments.",
    },
    {
      id: "ORG-2024-003",
      title: "Data Breach Response and Incident Management",
      date: "2024-03-12",
      severity: "critical",
      category: "Incident Response",
      description:
        "Step-by-step procedures for detecting, containing, and recovering from data breaches and security incidents.",
    },
    {
      id: "ORG-2024-004",
      title: "Third-Party Vendor Security Assessment",
      date: "2024-03-08",
      severity: "high",
      category: "Supply Chain",
      description:
        "Framework for evaluating and managing cybersecurity risks in your vendor and supply chain relationships.",
    },
    {
      id: "ORG-2024-005",
      title: "Employee Security Awareness Training Programs",
      date: "2024-03-01",
      severity: "medium",
      category: "Training",
      description:
        "Develop effective security awareness programs to reduce human-factor vulnerabilities in your organization.",
    },
    {
      id: "ORG-2024-006",
      title: "Cloud Infrastructure Security Configuration",
      date: "2024-02-25",
      severity: "high",
      category: "Cloud Security",
      description:
        "Essential security configurations and monitoring practices for cloud-based infrastructure and services.",
    },
  ];

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
      <section className="bg-secondary py-20 pattern-dots relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-slide-in-up">
            {/* <div className="inline-flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20 animate-float">
                <HugeiconsIcon
                  icon={Building03Icon}
                  size={60}
                  color="currentColor"
                  className="text-primary"
                />
              </div>
            </div> */}
            <div className="inline-block mb-6">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                For Organizations
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
              Enterprise Security{" "}
              <span className="text-primary">Advisories</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Protect your organization with comprehensive cybersecurity
              advisories, frameworks, and industry best practices.
            </p>
          </div>
        </div>
      </section>

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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestPractices.map((practice, index) => (
              <div
                key={index}
                className="group bg-white border-2 border-border rounded-2xl p-8 hover-lift card-interactive relative overflow-hidden animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <HugeiconsIcon
                      icon={practice.icon}
                      size={32}
                      color="currentColor"
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 text-center group-hover:text-primary transition-colors">
                  {practice.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-center">
                  {practice.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advisories.map((advisory, index) => (
              <article
                key={advisory.id}
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
                  <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
                    {advisory.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <HugeiconsIcon
                    icon={IdentificationIcon}
                    size={16}
                    color="currentColor"
                    className="text-primary"
                  />
                  <span className="text-sm font-bold text-primary">
                    {advisory.id}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                  {advisory.title}
                </h2>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                  {advisory.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pt-4 border-t border-border">
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    size={16}
                    color="currentColor"
                  />
                  <span className="font-medium">
                    {formatDate(advisory.date)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/advisories/organizations/${advisory.id.toLowerCase()}`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary-light hover:shadow-lg transition-all duration-300"
                  >
                    View Details
                  </Link>
                  <button
                    className="px-4 py-2.5 border-2 border-border text-foreground rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group/btn"
                    aria-label="Download PDF"
                  >
                    <HugeiconsIcon
                      icon={Download01Icon}
                      size={18}
                      color="currentColor"
                      className="group-hover/btn:scale-110 transition-transform"
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
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
