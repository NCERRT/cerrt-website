"use client";

import { useState, useEffect } from "react";
import {
  getAdvisoriesAction,
  type AdvisoryDetailWithUrls,
} from "@/app/actions/advisories";
import SubscribeForm from "@/components/ui/SubscribeForm";
import AdvisoryCard from "@/components/advisory-card";

export default function AdvisoriesPage() {
  const [advisories, setAdvisories] = useState<AdvisoryDetailWithUrls[] | null>(
    null,
  );

  useEffect(() => {
    getAdvisoriesAction()
      .then((res) => setAdvisories(res.advisories))
      .catch(() => setAdvisories([]));
  }, []);

  // formatDate removed

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
                  key={advisory.id}
                  advisory={advisory}
                  index={index}
                />
              ))}
            </div>
          )}
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


