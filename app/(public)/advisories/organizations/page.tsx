"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import Image from "next/image";
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

export default function OrganizationsAdvisoryPage() {
  const advisories = useQuery(api.advisories.list, {
    category: "organizations",
  });

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
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-slide-in-up">
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advisories.map((advisory, index) => (
                <AdvisoryCard
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

function AdvisoryCard({
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
        <div className="space-y-3">
          {advisory.fileType === "image" ? (
            <>
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                <Image
                  src={fileUrl}
                  alt={advisory.title}
                  fill
                  className="object-cover"
                />
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary-light hover:shadow-lg transition-all duration-300 gap-2"
              >
                <HugeiconsIcon icon={Download01Icon} size={16} color="currentColor" />
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
              <HugeiconsIcon icon={Download01Icon} size={16} color="currentColor" />
              Download PDF
            </a>
          )}
        </div>
      )}
    </article>
  );
}
