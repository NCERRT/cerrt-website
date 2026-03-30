import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  IdentificationIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";

export const metadata: Metadata = {
  title: "Security Advisories | CERRT",
  description:
    "Stay informed about the latest cybersecurity threats and advisories from CERRT",
};

export default function AdvisoriesPage() {
  // Static advisory data - will be replaced with Sanity CMS later
  const advisories = [
    {
      id: "ADV-2024-001",
      title: "Critical Vulnerability in Popular Web Frameworks",
      date: "2024-03-15",
      severity: "critical",
      category: "Web Security",
      description:
        "A critical remote code execution vulnerability has been discovered in several popular web frameworks. Immediate patching is recommended.",
    },
    {
      id: "ADV-2024-002",
      title: "Phishing Campaign Targeting Nigerian Financial Institutions",
      date: "2024-03-10",
      severity: "high",
      category: "Phishing",
      description:
        "CERRT has identified a sophisticated phishing campaign targeting employees of Nigerian financial institutions. Enhanced vigilance is advised.",
    },
    {
      id: "ADV-2024-003",
      title: "Ransomware Threats to Healthcare Sector",
      date: "2024-03-05",
      severity: "high",
      category: "Ransomware",
      description:
        "Multiple healthcare organizations have reported ransomware attacks. Organizations should review their backup and incident response procedures.",
    },
    {
      id: "ADV-2024-004",
      title: "Security Update for Microsoft Products",
      date: "2024-02-28",
      severity: "medium",
      category: "Patch Management",
      description:
        "Microsoft has released important security updates addressing multiple vulnerabilities. Organizations should apply patches promptly.",
    },
    {
      id: "ADV-2024-005",
      title: "Social Engineering Attack Trends",
      date: "2024-02-20",
      severity: "medium",
      category: "Social Engineering",
      description:
        "Analysis of recent social engineering attacks shows evolving tactics. User awareness training is recommended.",
    },
    {
      id: "ADV-2024-006",
      title: "IoT Device Security Concerns",
      date: "2024-02-15",
      severity: "low",
      category: "IoT Security",
      description:
        "Common security misconfigurations in IoT devices could expose networks to unauthorized access. Best practices guide available.",
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

      {/* Advisories Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advisories.map((advisory, index) => (
              <article
                key={advisory.id}
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
                    {advisory.id}
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/advisories/${advisory.id.toLowerCase()}`}
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

          {/* Pagination Placeholder */}
          <div className="flex justify-center gap-2 mt-12">
            <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              1
            </button>
            <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
              2
            </button>
            <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
              3
            </button>
            <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
              Next
            </button>
          </div>
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
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
