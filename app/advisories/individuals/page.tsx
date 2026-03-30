import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Advisories for Individuals | CERRT",
  description:
    "Personal cybersecurity advisories and safety tips for individuals to protect themselves online",
};

export default function IndividualsAdvisoryPage() {
  const advisories = [
    {
      id: "IND-2024-001",
      title: "Strong Password Practices for Personal Accounts",
      date: "2024-03-20",
      severity: "high",
      category: "Password Security",
      description:
        "Learn how to create and manage strong passwords for your personal online accounts to prevent unauthorized access.",
    },
    {
      id: "IND-2024-002",
      title: "Protecting Your Personal Information on Social Media",
      date: "2024-03-15",
      severity: "medium",
      category: "Privacy",
      description:
        "Guidelines on what personal information to share (or avoid sharing) on social media platforms.",
    },
    {
      id: "IND-2024-003",
      title: "Email Phishing: How to Spot and Avoid Scams",
      date: "2024-03-10",
      severity: "critical",
      category: "Phishing",
      description:
        "Identify and protect yourself from phishing emails that attempt to steal your personal information and credentials.",
    },
    {
      id: "IND-2024-004",
      title: "Secure Your Home Wi-Fi Network",
      date: "2024-03-05",
      severity: "high",
      category: "Network Security",
      description:
        "Essential steps to secure your home wireless network from unauthorized access and cyber threats.",
    },
    {
      id: "IND-2024-005",
      title: "Mobile Device Security Best Practices",
      date: "2024-02-28",
      severity: "medium",
      category: "Mobile Security",
      description:
        "Protect your smartphone and tablet with these essential security configurations and practices.",
    },
    {
      id: "IND-2024-006",
      title: "Online Shopping Safety Tips",
      date: "2024-02-20",
      severity: "medium",
      category: "E-Commerce",
      description:
        "Stay safe while shopping online: verify websites, protect payment information, and avoid scams.",
    },
  ];

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
                  icon={UserShield02Icon}
                  size={60}
                  color="currentColor"
                  className="text-primary"
                />
              </div>
            </div> */}
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
                    href={`/advisories/individuals/${advisory.id.toLowerCase()}`}
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
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-primary-foreground/90 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
